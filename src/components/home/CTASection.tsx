import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/utils/routing';
import { contactConfig } from '@/config/contact';

export default function CTASection() {
  const { t } = useTranslation('home');
  const lang = useLanguage();

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container-app">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 px-6 py-12 text-center shadow-elevated sm:px-12 sm:py-16">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-rose-100">{t('home:cta.eyebrow')}</span>
            <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-semibold text-white text-balance sm:text-3xl lg:text-4xl">
              {t('home:cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-rose-50/80 sm:text-base">
              {t('home:cta.subtitle')}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={`/${lang}/inquiry`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-rose-600 shadow-elevated transition-all duration-300 hover:bg-rose-50 hover:scale-105 active:scale-95"
              >
                <FileText className="h-5 w-5" strokeWidth={1.8} />
                {t('home:cta.sendQuote')}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <a
                href={contactConfig.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 active:scale-95"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.8} />
                {t('home:cta.chatZalo')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
