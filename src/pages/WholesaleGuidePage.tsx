import { Link } from 'react-router-dom';
import { Search, FileText, FileCheck, Truck, CheckCircle, ArrowRight, Package, Tag, ShieldCheck, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { useLanguage } from '@/utils/routing';

const stepIcons = [Search, FileText, FileCheck, Truck, CheckCircle] as const;
const policyIcons = [Package, Tag, ShieldCheck, Headphones] as const;
const policyKeys = ['moq', 'discount', 'warranty', 'support'] as const;

export default function WholesaleGuidePage() {
  const { t } = useTranslation(['wholesale', 'common', 'footer']);
  const lang = useLanguage();

  return (
    <div className="min-h-screen pb-12">
      <SEO titleKey="footer:seo.guide.title" descriptionKey="footer:seo.guide.description" />
      <div className="gradient-ivory border-b border-rose-100 py-10 sm:py-14">
        <div className="container-app">
          <span className="section-eyebrow">{t('wholesale:guide.eyebrow')}</span>
          <h1 className="mt-2 text-2xl font-semibold text-charcoal-800 sm:text-3xl lg:text-4xl">{t('wholesale:guide.title')}</h1>
          <p className="mt-3 max-w-xl text-sm text-charcoal-700/50">
            {t('wholesale:guide.subtitle')}
          </p>
        </div>
      </div>

      <div className="container-app py-10">
        {/* Steps */}
        <div className="space-y-4">
          {stepIcons.map((Icon, i) => {
            const stepNum = String(i + 1);
            return (
              <div key={i} className="card flex gap-4 p-5 sm:p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-soft">
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-rose-400">{t('products:catalog.step', { defaultValue: 'Step' })} {stepNum}</div>
                  <h2 className="font-sans text-base font-semibold text-charcoal-800 sm:text-lg">{t(`wholesale:guide.steps.${stepNum}.title`)}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-charcoal-700/60">{t(`wholesale:guide.steps.${stepNum}.desc`)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Policies */}
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-semibold text-charcoal-800 sm:text-2xl">{t('wholesale:guide.policiesTitle')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {policyKeys.map((key, i) => {
              const Icon = policyIcons[i];
              return (
                <div key={key} className="card flex gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-semibold text-charcoal-800">{t(`wholesale:guide.policies.${key}.title`)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-charcoal-700/50">{t(`wholesale:guide.policies.${key}.desc`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 px-6 py-10 text-center shadow-elevated">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">{t('wholesale:guide.ctaTitle')}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-rose-50/80">
            {t('wholesale:guide.ctaSubtitle')}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={`/${lang}/inquiry`} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-rose-600 shadow-elevated transition-all hover:scale-105 active:scale-95">
              {t('wholesale:guide.ctaButton')}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link to={`/${lang}/products`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95">
              {t('wholesale:guide.ctaViewProducts')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
