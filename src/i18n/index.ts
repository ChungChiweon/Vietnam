import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import koCommon from './locales/ko/common.json';
import koHome from './locales/ko/home.json';
import koProducts from './locales/ko/products.json';
import koWholesale from './locales/ko/wholesale.json';
import koContact from './locales/ko/contact.json';
import koPolicies from './locales/ko/policies.json';
import koFooter from './locales/ko/footer.json';

import viCommon from './locales/vi/common.json';
import viHome from './locales/vi/home.json';
import viProducts from './locales/vi/products.json';
import viWholesale from './locales/vi/wholesale.json';
import viContact from './locales/vi/contact.json';
import viPolicies from './locales/vi/policies.json';
import viFooter from './locales/vi/footer.json';

import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enProducts from './locales/en/products.json';
import enWholesale from './locales/en/wholesale.json';
import enContact from './locales/en/contact.json';
import enPolicies from './locales/en/policies.json';
import enFooter from './locales/en/footer.json';

export const resources = {
  ko: {
    common: koCommon,
    home: koHome,
    products: koProducts,
    wholesale: koWholesale,
    contact: koContact,
    policies: koPolicies,
    footer: koFooter,
  },
  vi: {
    common: viCommon,
    home: viHome,
    products: viProducts,
    wholesale: viWholesale,
    contact: viContact,
    policies: viPolicies,
    footer: viFooter,
  },
  en: {
    common: enCommon,
    home: enHome,
    products: enProducts,
    wholesale: enWholesale,
    contact: enContact,
    policies: enPolicies,
    footer: enFooter,
  },
} as const;

export const defaultNS = 'common';
export const supportedNS = ['common', 'home', 'products', 'wholesale', 'contact', 'policies', 'footer'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    supportedLngs: ['ko', 'vi', 'en'],
    ns: supportedNS,
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'kbeauty_lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
