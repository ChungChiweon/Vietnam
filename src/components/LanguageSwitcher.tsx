import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { supportedLanguages } from '@/config/languages';
import type { LanguageCode } from '@/config/languages';
import { useLanguageSwitch } from '@/utils/routing';

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'desktop', className = '' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const switchLang = useLanguageSwitch();
  const currentLang = (i18n.language as LanguageCode) || 'ko';

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    switchLang(code);
    setOpen(false);
  };

  const current = supportedLanguages.find((l) => l.code === currentLang) ?? supportedLanguages[0];

  if (variant === 'mobile') {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-charcoal-700 shadow-soft transition-colors hover:bg-rose-50"
        >
          <Globe className="h-4 w-4 text-rose-400" strokeWidth={1.8} />
          <span>{current.label}</span>
          <ChevronDown className={`ml-auto h-4 w-4 text-charcoal-700/30 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.8} />
        </button>
        {open && (
          <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-rose-100 bg-white p-2 shadow-card animate-fade-in">
            {supportedLanguages.map((l) => (
              <button
                key={l.code}
                onClick={() => handleSelect(l.code)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  l.code === currentLang ? 'bg-rose-50 text-rose-600' : 'text-charcoal-700 hover:bg-rose-50'
                }`}
              >
                <span>{l.label}</span>
                {l.code === currentLang && <Check className="ml-auto h-4 w-4 text-rose-500" strokeWidth={2} />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Select language"
        className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal-700 transition-colors hover:bg-rose-50"
      >
        <Globe className="h-5 w-5" strokeWidth={1.8} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-rose-100 bg-white p-2 shadow-card animate-fade-in z-50">
          {supportedLanguages.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                l.code === currentLang ? 'bg-rose-50 text-rose-600' : 'text-charcoal-700 hover:bg-rose-50'
              }`}
            >
              <span>{l.label}</span>
              {l.code === currentLang && <Check className="ml-auto h-4 w-4 text-rose-500" strokeWidth={2} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
