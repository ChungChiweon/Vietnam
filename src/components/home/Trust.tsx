import { ShieldCheck, Award, Globe, HeartHandshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const trustItems = [
  { icon: ShieldCheck, key: 'sourcing' },
  { icon: Award, key: 'supplier' },
  { icon: Globe, key: 'export' },
  { icon: HeartHandshake, key: 'consultation' },
] as const;

export default function Trust() {
  const { t } = useTranslation('home');

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container-app">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card">
              <img
                src="https://images.pexels.com/photos/28482020/pexels-photo-28482020.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Korean cosmetics"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -right-3 -top-3 rounded-2xl bg-white px-4 py-3 shadow-card sm:-right-6">
              <p className="font-serif text-xl font-semibold text-rose-500">{t('home:trust.badgeAuthenticLabel')}</p>
              <p className="text-[10px] text-charcoal-700/50">{t('home:trust.badgeAuthentic')}</p>
            </div>
            <div className="absolute -bottom-3 -left-3 rounded-2xl bg-white px-4 py-3 shadow-card sm:-left-6">
              <p className="font-serif text-xl font-semibold text-rose-500">{t('home:trust.badgeQuoteLabel')}</p>
              <p className="text-[10px] text-charcoal-700/50">{t('home:trust.badgeQuote')}</p>
            </div>
          </div>

          {/* Text */}
          <div>
            <span className="section-eyebrow">{t('home:trust.eyebrow')}</span>
            <h2 className="mt-2 text-2xl font-semibold text-charcoal-800 sm:text-3xl">
              {t('home:trust.title')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-700/50">
              {t('home:trust.subtitle')}
            </p>

            <div className="mt-6 space-y-4">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-charcoal-800">
                        {t(`home:trust.items.${item.key}.title`)}
                      </h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-charcoal-700/50">
                        {t(`home:trust.items.${item.key}.desc`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
