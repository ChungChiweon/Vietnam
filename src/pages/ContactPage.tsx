import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { useLanguage } from '@/utils/routing';
import { contactConfig } from '@/config/contact';

export default function ContactPage() {
  const { t } = useTranslation(['contact', 'common', 'footer']);
  const lang = useLanguage();

  return (
    <div className="min-h-screen pb-12">
      <SEO titleKey="footer:seo.contact.title" descriptionKey="footer:seo.contact.description" />
      <div className="gradient-ivory border-b border-rose-100 py-10 sm:py-14">
        <div className="container-app">
          <span className="section-eyebrow">{t('contact:contact.eyebrow')}</span>
          <h1 className="mt-2 text-2xl font-semibold text-charcoal-800 sm:text-3xl lg:text-4xl">{t('contact:contact.title')}</h1>
          <p className="mt-3 max-w-xl text-sm text-charcoal-700/50">
            {t('contact:contact.subtitle')}
          </p>
        </div>
      </div>

      <div className="container-app py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact methods */}
          <div className="space-y-4">
            <a
              href={contactConfig.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-4 p-5 transition-all duration-300 hover:shadow-card hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0068FF] text-white shadow-soft">
                <MessageCircle className="h-6 w-6" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-base font-semibold text-charcoal-800">{t('contact:contact.zalo')}</h3>
                <p className="text-sm text-charcoal-700/50">{t('contact:contact.zaloDesc', { phone: contactConfig.phone })}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-rose-300" strokeWidth={1.8} />
            </a>

            <a href={`tel:${contactConfig.phoneRaw}`} className="card flex items-center gap-4 p-5 transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-soft">
                <Phone className="h-6 w-6" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-base font-semibold text-charcoal-800">{t('contact:contact.hotline')}</h3>
                <p className="text-sm text-charcoal-700/50">{contactConfig.phone}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-rose-300" strokeWidth={1.8} />
            </a>

            <a href={`mailto:${contactConfig.email}`} className="card flex items-center gap-4 p-5 transition-all duration-300 hover:shadow-card hover:-translate-y-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-soft">
                <Mail className="h-6 w-6" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-base font-semibold text-charcoal-800">{t('contact:contact.email')}</h3>
                <p className="text-sm text-charcoal-700/50">{contactConfig.email}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-rose-300" strokeWidth={1.8} />
            </a>

            <div className="card flex items-start gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-soft">
                <MapPin className="h-6 w-6" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-base font-semibold text-charcoal-800">{t('contact:contact.address')}</h3>
                <p className="text-sm text-charcoal-700/50">{contactConfig.address[lang]}</p>
              </div>
            </div>

            <div className="card flex items-start gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-soft">
                <Clock className="h-6 w-6" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-base font-semibold text-charcoal-800">{t('contact:contact.hours')}</h3>
                <p className="text-sm text-charcoal-700/50">{contactConfig.hours[lang]}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 p-8 text-center shadow-elevated">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">{t('contact:contact.ctaTitle')}</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-rose-50/80">
              {t('contact:contact.ctaSubtitle')}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to={`/${lang}/inquiry`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-rose-600 shadow-elevated transition-all hover:scale-105 active:scale-95"
              >
                {t('contact:contact.ctaButton')}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                to={`/${lang}/products`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
              >
                {t('contact:contact.ctaViewProducts')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
