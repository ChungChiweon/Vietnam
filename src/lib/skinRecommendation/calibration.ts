import type { SkinMetric, SkinVisionResult } from '@/lib/skinVision';
import type { ConcernLevel, SkinCalibrationProfile } from './types';

const METRICS: SkinMetric[] = ['redness', 'unevenTone', 'darkCircles', 'blemishes', 'texture', 'shine'];

export const DEFAULT_CALIBRATION_PROFILES: Record<SkinMetric, SkinCalibrationProfile> = Object.fromEntries(
  METRICS.map((metric) => [metric, {
    version: 'neutral-v1', metric, lowThreshold: 34, mediumThreshold: 67, highThreshold: 100,
    minConfidence: 60, sampleCount: 0, updatedAt: null,
  }]),
) as Record<SkinMetric, SkinCalibrationProfile>;

export function calibrateSkinMetrics(raw: Record<SkinMetric, number>) {
  return { ...raw };
}

export function classifySkinMetrics(result: Pick<SkinVisionResult, 'calibratedMetrics' | 'scores' | 'metricConfidence'>) {
  const values = result.calibratedMetrics ?? result.scores;
  return Object.fromEntries(METRICS.map((metric) => {
    const profile = DEFAULT_CALIBRATION_PROFILES[metric];
    const confidence = result.metricConfidence?.[metric] ?? 0;
    const value = values?.[metric];
    let level: ConcernLevel = 'unknown';
    if (value != null && confidence >= profile.minConfidence) {
      level = value < profile.lowThreshold ? 'low' : value < profile.mediumThreshold ? 'moderate' : 'high';
    }
    return [metric, level];
  })) as Record<SkinMetric, ConcernLevel>;
}
