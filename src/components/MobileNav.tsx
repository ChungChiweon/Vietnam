import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3x3, FileText, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/utils/routing';
import { contactConfig } from '@/config/contact';

export default function MobileNav() {
  const { t } = useTranslation('common');
  const lang = useLanguage();
  const location = useLocation();

  const items = [
    { label: t('common:nav.home'), to: `/${lang}`, icon: Home },
    { label: t('common:nav.products'), to: `/${lang}/products`, icon: Grid3x3 },
    { label: t('common:nav.quote'), to: `/${lang}/inquiry`, icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-rose-100 bg-ivory-50/95 backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-4 items-center px-2 py-2">
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 py-1.5 text-[10px] font-medium transition-colors ${
                active ? 'text-rose-600' : 'text-charcoal-700/50'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
              {item.label}
            </Link>
          );
        })}

        {/* Zalo center button */}
        <a
          href={contactConfig.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center"
        >
          <div className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-elevated ring-4 ring-ivory-50 transition-transform active:scale-95">
            <MessageCircle className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <span className="mt-0.5 text-[10px] font-medium text-[#0068FF]">Zalo</span>
        </a>

        {items.slice(2).map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 py-1.5 text-[10px] font-medium transition-colors ${
                active ? 'text-rose-600' : 'text-charcoal-700/50'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
