import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/utils/routing';

export default function Logo({ className = '' }: { className?: string }) {
  const { t } = useTranslation('common');
  const lang = useLanguage();

  return (
    <Link to={`/${lang}`} className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 shadow-soft">
        <Sparkles className="h-5 w-5 text-white" strokeWidth={1.5} />
      </div>
      <div className="leading-tight">
        <span className="font-serif text-lg font-semibold text-charcoal-800">{t('common:brandName')}</span>
        <span className="ml-1 font-sans text-xs font-medium uppercase tracking-widest text-rose-500">{t('common:brandSuffix')}</span>
      </div>
    </Link>
  );
}
