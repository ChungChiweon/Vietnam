import { ShieldCheck, Tag, Package, Truck, RefreshCw, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const benefitItems = [
  { icon: ShieldCheck, key: 'authentic' },
  { icon: Tag, key: 'pricing' },
  { icon: Package, key: 'moq' },
  { icon: Truck, key: 'shipping' },
  { icon: RefreshCw, key: 'updates' },
  { icon: Headphones, key: 'consultation' },
] as const;

export default function Benefits() {
  const { t } = useTranslation('home');

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container-app">
        <div className="mb-10 text-center">
          <span className="section-eyebrow">{t('home:benefits.eyebrow')}</span>
          <h2 className="mt-2 text-2xl font-semibold text-charcoal-800 sm:text-3xl">
            {t('home:benefits.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-charcoal-700/50">
            {t('home:benefits.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefitItems.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={b.key}
                className="card p-6 hover:shadow-card transition-all duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <h3 className="mb-1.5 font-sans text-base font-semibold text-charcoal-800">
                  {t(`home:benefits.items.${b.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-charcoal-700/50">
                  {t(`home:benefits.items.${b.key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
