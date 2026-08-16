import type { LanguageCode } from '@/config/languages';

export function formatNumber(value: number, lang: LanguageCode): string {
  return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : lang === 'vi' ? 'vi-VN' : 'en-US').format(value);
}

export function formatMoq(moq: number, lang: LanguageCode, unit?: string): string {
  const num = formatNumber(moq, lang);
  if (unit) return `${num} ${unit}`;
  return num;
}

export function formatDate(date: Date, lang: LanguageCode): string {
  const locale = lang === 'ko' ? 'ko-KR' : lang === 'vi' ? 'vi-VN' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatRating(rating: number, lang: LanguageCode): string {
  return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : lang === 'vi' ? 'vi-VN' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);
}
