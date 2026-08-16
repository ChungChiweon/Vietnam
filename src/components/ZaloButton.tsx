import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { contactConfig } from '@/config/contact';

interface ZaloButtonProps {
  variant?: 'primary' | 'floating' | 'compact';
  className?: string;
}

export default function ZaloButton({ variant = 'primary', className = '' }: ZaloButtonProps) {
  const { t } = useTranslation('common');
  const label = t('common:actions.contactZalo');

  if (variant === 'floating') {
    return (
      <a
        href={contactConfig.zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={`fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-elevated transition-all duration-300 hover:scale-110 hover:bg-[#0052cc] active:scale-95 sm:bottom-6 ${className}`}
      >
        <MessageCircle className="h-7 w-7" strokeWidth={1.8} />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-soft">
          1
        </span>
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a
        href={contactConfig.zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 rounded-full bg-[#0068FF] px-4 py-2 text-xs font-medium text-white shadow-soft transition-all duration-300 hover:bg-[#0052cc] active:scale-95 ${className}`}
      >
        <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
        {label}
      </a>
    );
  }

  return (
    <a
      href={contactConfig.zaloUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#0068FF] px-6 py-3 text-sm font-medium text-white shadow-soft transition-all duration-300 hover:bg-[#0052cc] hover:shadow-card active:scale-[0.98] ${className}`}
    >
      <MessageCircle className="h-5 w-5" strokeWidth={1.8} />
      {label}
    </a>
  );
}
