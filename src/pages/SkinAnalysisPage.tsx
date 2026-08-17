import { ChangeEvent, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ImagePlus, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { useLanguage } from '@/utils/routing';
import { analyzeSkinPhoto, type SkinVisionResult } from '@/lib/skinVision';

type AnswerMap = Record<string, string>;
type PhotoQuality = { brightness: number; contrast: number; status: 'good' | 'dark' | 'bright' | 'flat' };

const questions = [
  { id: 'concern', options: ['blemish', 'pigment', 'redness', 'pores', 'dryness'] },
  { id: 'feel', options: ['tight', 'balanced', 'oily', 'combination'] },
  { id: 'sensitive', options: ['often', 'sometimes', 'rarely'] },
  { id: 'routine', options: ['simple', 'standard', 'focused'] },
  { id: 'budget', options: ['value', 'balanced', 'premium'] },
] as const;

function inspectImage(file: File): Promise<{ preview: string; quality: PhotoQuality; image: HTMLImageElement }> {
  return new Promise((resolve, reject) => {
    const preview = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 160;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return reject(new Error('canvas'));
      context.drawImage(image, 0, 0, size, size);
      const pixels = context.getImageData(0, 0, size, size).data;
      let sum = 0;
      let squared = 0;
      const count = pixels.length / 4;
      for (let index = 0; index < pixels.length; index += 4) {
        const luminance = pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722;
        sum += luminance;
        squared += luminance * luminance;
      }
      const brightness = sum / count;
      const contrast = Math.sqrt(Math.max(0, squared / count - brightness * brightness));
      const status = brightness < 65 ? 'dark' : brightness > 210 ? 'bright' : contrast < 20 ? 'flat' : 'good';
      resolve({ preview, quality: { brightness, contrast, status }, image });
    };
    image.onerror = reject;
    image.src = preview;
  });
}

export default function SkinAnalysisPage() {
  const { t } = useTranslation('skinCheck');
  const lang = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [preview, setPreview] = useState('');
  const [quality, setQuality] = useState<PhotoQuality | null>(null);
  const [vision, setVision] = useState<SkinVisionResult | null>(null);
  const [busy, setBusy] = useState(false);

  const result = useMemo(() => {
    const concern = answers.concern ?? 'dryness';
    const sensitive = answers.sensitive === 'often';
    const profile = sensitive ? 'sensitive' : answers.feel === 'oily' ? 'oily' : answers.feel === 'combination' ? 'combination' : 'balanced';
    const tags = new Set<string>();
    const concernTags: Record<string, string[]> = {
      blemish: ['clarify', 'soothe'], pigment: ['brighten', 'protect'], redness: ['soothe', 'barrier'], pores: ['smooth', 'balance'], dryness: ['hydrate', 'barrier'],
    };
    concernTags[concern]?.forEach((tag) => tags.add(tag));
    if (sensitive) tags.add('gentle');
    if (profile === 'oily' || profile === 'combination') tags.add('lightweight');
    if (vision?.status === 'ready' && vision.scores) {
      if (vision.scores.redness >= 62 && (vision.metricConfidence?.redness ?? 0) >= 60) tags.add('soothe');
      if (vision.scores.unevenTone >= 62 && (vision.metricConfidence?.unevenTone ?? 0) >= 60) tags.add('brighten');
      if (vision.scores.blemishes >= 62 && (vision.metricConfidence?.blemishes ?? 0) >= 60) tags.add('clarify');
      if (vision.scores.texture >= 62 && (vision.metricConfidence?.texture ?? 0) >= 60) tags.add('smooth');
      if (vision.scores.shine >= 62 && (vision.metricConfidence?.shine ?? 0) >= 60) tags.add('balance');
    }
    tags.add('protect');
    return { concern, profile, tags: [...tags].slice(0, 5) };
  }, [answers, vision]);

  const onPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    if (preview) URL.revokeObjectURL(preview);
    try {
      const inspected = await inspectImage(file);
      setPreview(inspected.preview);
      setQuality(inspected.quality);
      setVision(inspected.quality.status === 'good' ? await analyzeSkinPhoto(inspected.image) : null);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview('');
    setQuality(null);
    setVision(null);
    setAnswers({});
    setStep(0);
  };

  const totalSteps = questions.length + 2;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <>
      <SEO titleKey="skinCheck:seo.title" descriptionKey="skinCheck:seo.description" />
      <div className="min-h-[75vh] bg-gradient-to-b from-rose-50/70 to-ivory-50 py-8 sm:py-14">
        <div className="container-app max-w-4xl">
          <div className="mb-7 text-center">
            <span className="section-eyebrow">{t('eyebrow')}</span>
            <h1 className="mt-2 text-3xl font-semibold text-charcoal-900 sm:text-5xl">{t('title')}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-charcoal-700/65 sm:text-base">{t('subtitle')}</p>
          </div>

          <div className="card overflow-hidden border-white/80">
            <div className="h-1.5 bg-rose-100"><div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
            <div className="p-5 sm:p-9">
              {step === 0 ? (
                <div className="grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-charcoal-900">{t('photo.title')}</h2>
                    <p className="mt-2 text-sm leading-6 text-charcoal-700/60">{t('photo.description')}</p>
                    <ul className="mt-5 space-y-3 text-sm text-charcoal-700/75">
                      {['light', 'front', 'filter'].map((key) => <li key={key} className="flex items-center gap-2"><Check className="h-4 w-4 text-rose-500" />{t(`photo.tips.${key}`)}</li>)}
                    </ul>
                    <div className="mt-5 flex items-center gap-2 rounded-xl bg-ivory-100 px-4 py-3 text-xs leading-5 text-charcoal-700/60"><ShieldCheck className="h-5 w-5 shrink-0 text-rose-500" />{t('photo.privacy')}</div>
                  </div>
                  <label className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/50 text-center transition hover:border-rose-400">
                    {preview ? <img src={preview} alt={t('photo.previewAlt')} className="absolute inset-0 h-full w-full object-cover" /> : null}
                    <div className={`relative z-10 rounded-2xl p-5 ${preview ? 'bg-charcoal-900/70 text-white backdrop-blur-sm' : ''}`}>
                      {busy ? <Sparkles className="mx-auto h-8 w-8 animate-pulse text-rose-500" /> : <ImagePlus className="mx-auto h-9 w-9 text-rose-500" />}
                      <span className="mt-3 block text-sm font-semibold">{preview ? t('photo.change') : t('photo.upload')}</span>
                      <span className="mt-1 block text-xs opacity-60">JPG, PNG · 10MB</span>
                    </div>
                    <input className="sr-only" type="file" accept="image/jpeg,image/png" capture="user" onChange={onPhoto} />
                  </label>
                  {quality ? <div className={`lg:col-start-2 rounded-xl px-4 py-3 text-sm ${(quality.status === 'good' && vision?.status === 'ready') ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{quality.status !== 'good' ? t(`photo.quality.${quality.status}`) : busy || !vision ? t('photo.vision.loading') : t(`photo.vision.${vision.status}`)}</div> : null}
                </div>
              ) : step <= questions.length ? (
                <QuestionStep
                  id={questions[step - 1].id}
                  options={questions[step - 1].options}
                  value={answers[questions[step - 1].id]}
                  onChange={(value) => setAnswers((current) => ({ ...current, [questions[step - 1].id]: value }))}
                  t={t}
                />
              ) : (
                <div className="animate-fade-in">
                  <div className="text-center"><span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-100"><Sparkles className="h-7 w-7 text-rose-600" /></span><h2 className="mt-4 text-3xl font-semibold">{t('result.title')}</h2><p className="mt-2 text-sm text-charcoal-700/60">{t('result.disclaimer')}</p></div>
                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <ResultCard label={t('result.profileLabel')} title={t(`profiles.${result.profile}.title`)} body={t(`profiles.${result.profile}.body`)} />
                    <ResultCard label={t('result.concernLabel')} title={t(`concerns.${result.concern}.title`)} body={t(`concerns.${result.concern}.body`)} />
                  </div>
                  {vision?.status === 'ready' && vision.scores ? <div className="mt-6 rounded-2xl border border-rose-100 bg-white p-5 sm:p-6"><div className="flex items-end justify-between gap-4"><div><span className="text-xs font-semibold uppercase tracking-wider text-rose-500">{t('result.visualLabel')}</span><h3 className="mt-1 text-lg font-semibold">{t('result.visualTitle')}</h3></div><span className="text-xs text-charcoal-700/45">{t('result.confidence', { value: vision.confidence })}</span></div><div className="mt-5 grid gap-4 sm:grid-cols-3">{(['redness', 'unevenTone', 'darkCircles', 'blemishes', 'texture', 'shine'] as const).map((metric) => <VisionScore key={metric} label={t(`result.metrics.${metric}`)} value={vision.scores![metric]} confidence={vision.metricConfidence?.[metric] ?? 0} confidenceLabel={t('result.confidence', { value: vision.metricConfidence?.[metric] ?? 0 })} />)}</div><p className="mt-4 text-xs leading-5 text-charcoal-700/45">{t('result.visualNotice')}</p></div> : null}
                  <div className="mt-6 rounded-2xl bg-rose-50/70 p-5"><span className="text-xs font-semibold uppercase tracking-wider text-rose-500">{t('result.tagLabel')}</span><div className="mt-3 flex flex-wrap gap-2">{result.tags.map((tag) => <span key={tag} className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700">{t(`result.tags.${tag}`)}</span>)}</div><p className="mt-3 text-xs leading-5 text-charcoal-700/50">{t('result.tagNotice')}</p></div>
                  <div className="mt-6 rounded-2xl bg-ivory-100 p-5 sm:p-6"><h3 className="text-lg font-semibold">{t('result.routineTitle')}</h3><div className="mt-4 grid gap-3 sm:grid-cols-3">{['cleanse', 'treat', 'protect'].map((item, index) => <div key={item} className="rounded-xl bg-white p-4"><span className="text-xs font-semibold text-rose-500">0{index + 1}</span><p className="mt-1 text-sm font-semibold">{t(`result.routine.${item}.title`)}</p><p className="mt-1 text-xs leading-5 text-charcoal-700/55">{t(`result.routine.${item}.body`)}</p></div>)}</div></div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"><Link to={`/${lang}/inquiry`} className="btn-primary">{t('result.consult')}<ArrowRight className="h-4 w-4" /></Link><button onClick={reset} className="btn-secondary"><RotateCcw className="h-4 w-4" />{t('result.restart')}</button></div>
                </div>
              )}

              {step < totalSteps - 1 ? <div className="mt-8 flex items-center justify-between border-t border-rose-100 pt-5">
                <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} className="inline-flex items-center gap-1 text-sm text-charcoal-700/60 disabled:invisible"><ArrowLeft className="h-4 w-4" />{t('back')}</button>
                <button type="button" onClick={() => setStep((value) => value + 1)} disabled={(step === 0 && (!quality || quality.status !== 'good' || vision?.status !== 'ready')) || (step > 0 && !answers[questions[step - 1]?.id])} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40">{step === questions.length ? t('analyze') : t('next')} {step === questions.length ? <Sparkles className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</button>
              </div> : null}
            </div>
          </div>
          <p className="mt-5 text-center text-xs leading-5 text-charcoal-700/45">{t('medicalNotice')}</p>
        </div>
      </div>
    </>
  );
}

function QuestionStep({ id, options, value, onChange, t }: { id: string; options: readonly string[]; value?: string; onChange: (value: string) => void; t: (key: string) => string }) {
  return <fieldset className="mx-auto max-w-2xl animate-fade-in"><legend className="text-center text-2xl font-semibold font-serif text-charcoal-900 sm:text-3xl">{t(`questions.${id}.title`)}</legend><p className="mt-2 text-center text-sm text-charcoal-700/55">{t(`questions.${id}.hint`)}</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{options.map((option) => <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)} className={`rounded-2xl border px-5 py-4 text-left text-sm font-medium transition ${value === option ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-100' : 'border-rose-100 bg-white text-charcoal-700 hover:border-rose-300'}`}><span className="flex items-center justify-between">{t(`questions.${id}.options.${option}`)}{value === option ? <Check className="h-4 w-4 text-rose-500" /> : null}</span></button>)}</div></fieldset>;
}

function ResultCard({ label, title, body }: { label: string; title: string; body: string }) {
  return <div className="rounded-2xl border border-rose-100 bg-white p-5"><span className="text-xs font-semibold uppercase tracking-wider text-rose-500">{label}</span><h3 className="mt-2 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-charcoal-700/60">{body}</p></div>;
}

function VisionScore({ label, value, confidence, confidenceLabel }: { label: string; value: number; confidence: number; confidenceLabel: string }) {
  return <div><div className="flex items-center justify-between text-xs"><span className="font-medium text-charcoal-700/70">{label}</span><span className="text-charcoal-700/45">{value}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-gradient-to-r from-rose-300 to-rose-500" style={{ width: `${value}%` }} /></div><p className={`mt-1.5 text-[10px] ${confidence < 60 ? 'text-amber-600' : 'text-charcoal-700/40'}`}>{confidenceLabel}</p></div>;
}
