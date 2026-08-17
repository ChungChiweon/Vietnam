export type SkinVisionStatus = 'ready' | 'noFace' | 'multipleFaces' | 'pose' | 'failed';
export type SkinMetric = 'redness' | 'unevenTone' | 'darkCircles' | 'blemishes' | 'texture' | 'shine';

type SkinScores = Record<SkinMetric, number>;

export interface SkinVisionResult {
  status: SkinVisionStatus;
  confidence: number;
  scores: SkinScores | null;
  metricConfidence?: Record<SkinMetric, number>;
  qualityFlags?: Array<'unevenLight' | 'lowResolution' | 'overexposed'>;
}

type Point = { x: number; y: number; z?: number };
type Rgb = { r: number; g: number; b: number };
type Lab = { l: number; a: number; b: number };

let landmarkerPromise: Promise<import('@mediapipe/tasks-vision').FaceLandmarker> | null = null;

async function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = import('@mediapipe/tasks-vision').then(async ({ FaceLandmarker, FilesetResolver }) => {
      const vision = await FilesetResolver.forVisionTasks('/mediapipe');
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: '/models/face_landmarker.task', delegate: 'CPU' },
        runningMode: 'IMAGE',
        numFaces: 2,
        minFaceDetectionConfidence: 0.65,
        minFacePresenceConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });
    });
  }
  return landmarkerPromise;
}

function mean(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / Math.max(1, values.length);
}

function clampScore(value: number) {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function sampleRegion(data: ImageData, points: Point[], indices: number[], radius: number): Rgb[] {
  const samples: Rgb[] = [];
  const { width, height } = data;
  for (const index of indices) {
    const point = points[index];
    if (!point) continue;
    const centerX = Math.round(point.x * width);
    const centerY = Math.round(point.y * height);
    for (let y = centerY - radius; y <= centerY + radius; y += 2) {
      for (let x = centerX - radius; x <= centerX + radius; x += 2) {
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if ((x - centerX) ** 2 + (y - centerY) ** 2 > radius ** 2) continue;
        const offset = (y * width + x) * 4;
        samples.push({ r: data.data[offset], g: data.data[offset + 1], b: data.data[offset + 2] });
      }
    }
  }
  return samples;
}

function standardDeviation(values: number[]) {
  const average = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
}

function percentile(values: number[], ratio: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * ratio)));
  return sorted[index];
}

function rgbToLab(pixel: Rgb): Lab {
  const linearize = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const r = linearize(pixel.r);
  const g = linearize(pixel.g);
  const b = linearize(pixel.b);
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const pivot = (value: number) => value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
  const fx = pivot(x);
  const fy = pivot(y);
  const fz = pivot(z);
  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

function between(from: Point, to: Point, amount: number): Point {
  return { x: from.x + (to.x - from.x) * amount, y: from.y + (to.y - from.y) * amount };
}

export async function analyzeSkinPhoto(image: HTMLImageElement): Promise<SkinVisionResult> {
  try {
    const landmarker = await getLandmarker();
    const detection = landmarker.detect(image);
    if (detection.faceLandmarks.length === 0) return { status: 'noFace', confidence: 0, scores: null };
    if (detection.faceLandmarks.length > 1) return { status: 'multipleFaces', confidence: 0, scores: null };

    const points = detection.faceLandmarks[0] as Point[];
    const leftEye = points[33];
    const rightEye = points[263];
    const nose = points[1];
    const chin = points[152];
    const forehead = points[10];
    const eyeWidth = Math.abs(rightEye.x - leftEye.x);
    const eyeMidX = (leftEye.x + rightEye.x) / 2;
    const roll = Math.abs(leftEye.y - rightEye.y) / Math.max(eyeWidth, 0.01);
    const yaw = Math.abs(nose.x - eyeMidX) / Math.max(eyeWidth, 0.01);
    const faceHeight = Math.abs(chin.y - forehead.y);
    if (roll > 0.26 || yaw > 0.3 || faceHeight < 0.14) return { status: 'pose', confidence: 0.35, scores: null };

    const maxSide = 900;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('canvas');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const radius = Math.max(3, Math.round(eyeWidth * canvas.width * 0.035));

    const leftCheek = sampleRegion(imageData, points, [50, 101, 205, 187], radius);
    const rightCheek = sampleRegion(imageData, points, [280, 330, 425, 411], radius);
    const cheeks = [...leftCheek, ...rightCheek];
    const foreheadPixels = sampleRegion(imageData, points, [10, 67, 109, 338, 297], radius);
    const tZone = sampleRegion(imageData, points, [10, 151, 6, 1, 4, 5], radius);
    const underEyePoints = [
      between(points[145], points[205], 0.3),
      between(points[153], points[187], 0.34),
      between(points[374], points[425], 0.3),
      between(points[380], points[411], 0.34),
    ];
    const underEyes = sampleRegion(imageData, underEyePoints, [0, 1, 2, 3], Math.max(2, radius - 1));
    if (cheeks.length < 30 || foreheadPixels.length < 20 || underEyes.length < 20) throw new Error('samples');

    const cheekLab = cheeks.map(rgbToLab);
    const foreheadLab = foreheadPixels.map(rgbToLab);
    const leftLab = leftCheek.map(rgbToLab);
    const rightLab = rightCheek.map(rgbToLab);
    const underEyeLab = underEyes.map(rgbToLab);
    const tZoneLab = tZone.map(rgbToLab);
    const cheekA = cheekLab.map((pixel) => pixel.a);
    const redness = clampScore(42 + (mean(cheekA) - mean(foreheadLab.map((pixel) => pixel.a))) * 5.2);

    const cheekL = cheekLab.map((pixel) => pixel.l);
    const averageCheek = mean(cheekL);
    const toneRange = percentile(cheekL, 0.9) - percentile(cheekL, 0.1);
    const unevenTone = clampScore((toneRange - 7) * 5.1);

    const darkCircles = clampScore(30 + (averageCheek - mean(underEyeLab.map((pixel) => pixel.l))) * 2.2);
    const blemishThreshold = percentile(cheekA, 0.75) + 4.5;
    const blemishRatio = cheekA.filter((value) => value > blemishThreshold).length / cheekA.length;
    const blemishes = clampScore(blemishRatio * 520);
    const texture = clampScore((standardDeviation(cheekL) - 2.8) * 8.2);
    const tZoneL = tZoneLab.map((pixel) => pixel.l);
    const shineRatio = tZoneL.filter((value) => value > 88).length / Math.max(1, tZoneL.length);
    const shine = clampScore(shineRatio * 280 + Math.max(0, mean(tZoneL) - averageCheek) * 2.1);

    const lightAsymmetry = Math.abs(mean(leftLab.map((pixel) => pixel.l)) - mean(rightLab.map((pixel) => pixel.l)));
    const clippedRatio = [...cheeks, ...foreheadPixels].filter((pixel) => Math.max(pixel.r, pixel.g, pixel.b) >= 250).length / (cheeks.length + foreheadPixels.length);
    const resolutionPenalty = eyeWidth * canvas.width < 115 ? 18 : 0;
    const poseConfidence = Math.max(55, Math.min(94, 94 - roll * 65 - yaw * 70));
    const colorConfidence = clampScore(poseConfidence - lightAsymmetry * 3.2 - clippedRatio * 100);
    const detailConfidence = clampScore(poseConfidence - lightAsymmetry * 2 - resolutionPenalty - clippedRatio * 120);
    const metricConfidence: Record<SkinMetric, number> = {
      redness: colorConfidence,
      unevenTone: colorConfidence,
      darkCircles: clampScore(colorConfidence - lightAsymmetry * 1.4),
      blemishes: detailConfidence,
      texture: detailConfidence,
      shine: clampScore(colorConfidence - clippedRatio * 160),
    };
    const confidence = Math.round(mean(Object.values(metricConfidence)));
    const qualityFlags: SkinVisionResult['qualityFlags'] = [];
    if (lightAsymmetry > 7) qualityFlags.push('unevenLight');
    if (resolutionPenalty > 0) qualityFlags.push('lowResolution');
    if (clippedRatio > 0.08) qualityFlags.push('overexposed');

    return { status: 'ready', confidence, scores: { redness, unevenTone, darkCircles, blemishes, texture, shine }, metricConfidence, qualityFlags };
  } catch {
    return { status: 'failed', confidence: 0, scores: null };
  }
}
