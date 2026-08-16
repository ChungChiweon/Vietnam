import { Link } from 'react-router-dom';
import { ChevronRight, Shield, FileText, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { useLanguage } from '@/utils/routing';

interface PolicyPageProps {
  type: 'wholesale' | 'privacy' | 'returns';
}

const iconMap = { wholesale: FileText, privacy: Shield, returns: RefreshCw };
const seoKeyMap = {
  wholesale: 'policyWholesale',
  privacy: 'policyPrivacy',
  returns: 'policyReturns',
};

export default function PolicyPage({ type }: PolicyPageProps) {
  const { t } = useTranslation(['policies', 'common', 'footer']);
  const lang = useLanguage();
  const Icon = iconMap[type];

  const title = t(`policies:${type}.title`);
  const eyebrow = t(`policies:${type}.eyebrow`);
  const sections = Object.keys(
    (t(`policies:${type}.sections`, { returnObjects: true }) as Record<string, unknown>) || {}
  ).map(Number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen pb-12">
      <SEO
        titleKey={`footer:seo.${seoKeyMap[type]}.title`}
        descriptionKey={`footer:seo.${seoKeyMap[type]}.description`}
      />
      <div className="gradient-ivory border-b border-rose-100 py-10 sm:py-14">
        <div className="container-app">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-charcoal-700/40">
            <Link to={`/${lang}`} className="transition-colors hover:text-rose-500">{t('common:nav.home')}</Link>
            <ChevronRight className="h-3 w-3" strokeWidth={1.8} />
            <span className="text-charcoal-700/60">{title}</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Icon className="h-6 w-6" strokeWidth={1.6} />
            </div>
            <div>
              <span className="section-eyebrow">{eyebrow}</span>
              <h1 className="mt-1 text-2xl font-semibold text-charcoal-800 sm:text-3xl">{title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-10">
        <div className="mx-auto max-w-2xl space-y-6">
          {sections.map((i) => (
            <div key={i} className="card p-5 sm:p-6">
              <h2 className="mb-2 font-sans text-base font-semibold text-charcoal-800">
                {t(`policies:${type}.sections.${i}.heading`)}
              </h2>
              <p className="text-sm leading-relaxed text-charcoal-700/60">
                {t(`policies:${type}.sections.${i}.body`)}
              </p>
            </div>
          ))}

          <div className="mt-8 text-center">
            <p className="text-sm text-charcoal-700/50">{t(`policies:${type}.ctaTitle`)}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to={`/${lang}/contact`} className="btn-primary">{t(`policies:${type}.ctaContact`)}</Link>
              <Link to={`/${lang}/inquiry`} className="btn-secondary">{t(`policies:${type}.ctaQuote`)}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
