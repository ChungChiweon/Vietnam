import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/utils/routing';
import { contactConfig } from '@/config/contact';

export default function Hero() {
  const { t } = useTranslation('home');
  const lang = useLanguage();

  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container-app py-10 sm:py-16 lg:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Text */}
          <div className="order-2 text-center lg:order-1 lg:text-left animate-fade-in-up">
            <span className="section-eyebrow">{t('home:hero.eyebrow')}</span>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-charcoal-800 text-balance sm:text-4xl lg:text-5xl">
              {t('home:hero.title')}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-charcoal-700/60 lg:mx-0 sm:text-base">
              {t('home:hero.subtitle')}
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link to={`/${lang}/products`} className="btn-primary w-full sm:w-auto">
                {t('common:actions.viewProducts')}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <a href={contactConfig.zaloUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full sm:w-auto">
                <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
                {t('common:actions.contactZalo')}
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 lg:justify-start">
              <div className="text-center lg:text-left">
                <p className="font-serif text-2xl font-semibold text-rose-500">20+</p>
                <p className="text-xs text-charcoal-700/50">{t('home:hero.stats.brands')}</p>
              </div>
              <div className="h-10 w-px bg-rose-100" />
              <div className="text-center lg:text-left">
                <p className="font-serif text-2xl font-semibold text-rose-500">500+</p>
                <p className="text-xs text-charcoal-700/50">{t('home:hero.stats.products')}</p>
              </div>
              <div className="h-10 w-px bg-rose-100" />
              <div className="text-center lg:text-left">
                <p className="font-serif text-2xl font-semibold text-rose-500">5</p>
                <p className="text-xs text-charcoal-700/50">{t('home:hero.stats.experience')}</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 animate-scale-in">
            <div className="relative mx-auto max-w-sm lg:max-w-md">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-rose-200/40 to-rose-100/20 blur-2xl" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-elevated">
                <img
                  src="/images/hero-besoma.png"
                  alt="BESOMA Korean beauty products"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/10 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white/90 px-4 py-3 shadow-card backdrop-blur-sm animate-float">
                <p className="text-xs font-medium text-rose-500">{t('home:hero.badgeTitle')}</p>
                <p className="text-[10px] text-charcoal-700/50">{t('home:hero.badgeDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
