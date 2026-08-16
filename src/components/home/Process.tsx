import { Search, FileText, FileCheck, Truck, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const stepIcons = [Search, FileText, FileCheck, Truck, CheckCircle] as const;

export default function Process() {
  const { t } = useTranslation('home');

  return (
    <section className="gradient-rose py-12 sm:py-16 lg:py-20">
      <div className="container-app">
        <div className="mb-10 text-center">
          <span className="section-eyebrow">{t('home:process.eyebrow')}</span>
          <h2 className="mt-2 text-2xl font-semibold text-charcoal-800 sm:text-3xl">
            {t('home:process.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-charcoal-700/50">
            {t('home:process.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stepIcons.map((Icon, i) => {
            const stepNum = String(i + 1);
            return (
              <div key={i} className="relative">
                <div className="card h-full p-5 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white shadow-soft">
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-rose-400">
                    {t('products:catalog.step', { defaultValue: 'Step' })} {stepNum}
                  </div>
                  <h3 className="mb-1.5 font-sans text-sm font-semibold text-charcoal-800">
                    {t(`home:process.steps.${stepNum}.title`)}
                  </h3>
                  <p className="text-xs leading-relaxed text-charcoal-700/50">
                    {t(`home:process.steps.${stepNum}.desc`)}
                  </p>
                </div>
                {i < stepIcons.length - 1 && (
                  <div className="absolute -right-2 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-soft lg:flex">
                    <svg className="h-3 w-3 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
