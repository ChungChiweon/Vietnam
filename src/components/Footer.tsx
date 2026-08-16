import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/utils/routing';
import { contactConfig } from '@/config/contact';

export default function Footer() {
  const { t } = useTranslation(['footer', 'products']);
  const lang = useLanguage();

  return (
    <footer className="mt-16 border-t border-rose-100 bg-ivory-100">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 shadow-soft">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="leading-tight">
                <span className="font-serif text-lg font-semibold text-charcoal-800">{t('footer:footer.brandName', { defaultValue: 'K-Beauty' })}</span>
                <span className="ml-1 font-sans text-xs font-medium uppercase tracking-widest text-rose-500">{t('footer:footer.brandSuffix', { defaultValue: 'Wholesale' })}</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-charcoal-700/60">
              {t('footer:footer.tagline')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-sans text-sm font-semibold text-charcoal-800">{t('footer:footer.policiesTitle')}</h4>
            <ul className="space-y-2.5 text-sm text-charcoal-700/60">
              <li><Link to={`/${lang}/wholesale-guide`} className="transition-colors hover:text-rose-600">{t('footer:footer.wholesaleGuide')}</Link></li>
              <li><Link to={`/${lang}/wholesale-policy`} className="transition-colors hover:text-rose-600">{t('footer:footer.wholesalePolicy')}</Link></li>
              <li><Link to={`/${lang}/privacy-policy`} className="transition-colors hover:text-rose-600">{t('footer:footer.privacyPolicy')}</Link></li>
              <li><Link to={`/${lang}/returns-policy`} className="transition-colors hover:text-rose-600">{t('footer:footer.returnsPolicy')}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4 font-sans text-sm font-semibold text-charcoal-800">{t('footer:footer.categoriesTitle')}</h4>
            <ul className="space-y-2.5 text-sm text-charcoal-700/60">
              <li><Link to={`/${lang}/products?category=skincare`} className="transition-colors hover:text-rose-600">{t('products:categories.skincare')}</Link></li>
              <li><Link to={`/${lang}/products?category=makeup`} className="transition-colors hover:text-rose-600">{t('products:categories.makeup')}</Link></li>
              <li><Link to={`/${lang}/products?category=masks`} className="transition-colors hover:text-rose-600">{t('products:categories.masks')}</Link></li>
              <li><Link to={`/${lang}/products?category=haircare`} className="transition-colors hover:text-rose-600">{t('products:categories.haircare')}</Link></li>
              <li><Link to={`/${lang}/products?category=bodycare`} className="transition-colors hover:text-rose-600">{t('products:categories.bodycare')}</Link></li>
              <li><Link to={`/${lang}/products?category=beauty-tools`} className="transition-colors hover:text-rose-600">{t('products:categories.beautyTools')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-sans text-sm font-semibold text-charcoal-800">{t('footer:footer.contactTitle')}</h4>
            <ul className="space-y-3 text-sm text-charcoal-700/60">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.8} />
                <span>{contactConfig.address[lang]}</span>
              </li>
              <li>
                <a href={`tel:${contactConfig.phoneRaw}`} className="flex items-center gap-2 transition-colors hover:text-rose-600">
                  <Phone className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.8} />
                  {contactConfig.phone}
                </a>
              </li>
              <li>
                <a href={contactConfig.zaloUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-rose-600">
                  <MessageCircle className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.8} />
                  Zalo: {contactConfig.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contactConfig.email}`} className="flex items-center gap-2 transition-colors hover:text-rose-600">
                  <Mail className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.8} />
                  {contactConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-rose-100 pt-6 sm:flex-row">
          <p className="text-xs text-charcoal-700/40">
            {t('footer:footer.copyright')}
          </p>
          <p className="text-xs text-charcoal-700/40">
            {t('footer:footer.subtitle')}
          </p>
        </div>
      </div>
    </footer>
  );
}
