export type LanguageCode = 'ko' | 'vi' | 'en';

export interface LanguageConfig {
  code: LanguageCode;
  label: string;
  flag: string;
}

export const supportedLanguages: LanguageConfig[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

export const defaultLanguage: LanguageCode = 'vi';

export const languageLabels: Record<LanguageCode, string> = {
  vi: 'Tiếng Việt',
  ko: '한국어',
  en: 'English',
};

export function isLanguageCode(value: string): value is LanguageCode {
  return supportedLanguages.some((language) => language.code === value);
}

export function getLanguageLabel(code: LanguageCode): string {
  return languageLabels[code] ?? code;
}
