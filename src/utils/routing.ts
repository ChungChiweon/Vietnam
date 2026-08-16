import { useParams, useLocation, useNavigate } from 'react-router-dom';
import i18n from '@/i18n';
import type { LanguageCode } from '@/config/languages';
import { defaultLanguage, isLanguageCode } from '@/config/languages';

export function useLanguage(): LanguageCode {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  if (lang && isLanguageCode(lang)) return lang;

  // Shared layout components (Header, Footer, MobileNav) render outside the
  // matched <Route>, so useParams() is empty there. Read the locale from the
  // URL as a fallback to keep navigation and the language switcher in sync.
  const pathLang = location.pathname.split('/').filter(Boolean)[0];
  if (pathLang && isLanguageCode(pathLang)) return pathLang;

  return defaultLanguage;
}

export function useLocalizedPath(): (path: string) => string {
  const lang = useLanguage();
  return (path: string) => `/${lang}${path}`;
}

export function useLanguageSwitch(): (newLang: LanguageCode) => void {
  const location = useLocation();
  const lang = useLanguage();
  const navigate = useNavigate();

  return (newLang: LanguageCode) => {
    if (newLang === lang) return;
    i18n.changeLanguage(newLang);
    const newPath = location.pathname.replace(`/${lang}`, `/${newLang}`);
    navigate(newPath + location.search + location.hash);
  };
}
