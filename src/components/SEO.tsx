import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, defaultLanguage } from '@/config/languages';

interface SEOProps {
  titleKey?: string;
  descriptionKey?: string;
  titleParams?: Record<string, string>;
  descParams?: Record<string, string>;
}

export default function SEO({ titleKey, descriptionKey, titleParams, descParams }: SEOProps) {
  const { t, i18n } = useTranslation(['footer']);
  const location = useLocation();
  const lang = (i18n.language as string) || defaultLanguage;

  useEffect(() => {
    const title = titleKey ? t(titleKey, titleParams) : t('footer:seo.home.title');
    const description = descriptionKey ? t(descriptionKey, descParams) : t('footer:seo.home.description');

    document.title = title;

    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    // Canonical
    setLink('canonical', `https://kbeauty-wholesale.com${location.pathname}`);

    // hreflang
    const basePath = location.pathname.replace(`/${lang}`, '');
    supportedLanguages.forEach((l) => {
      setLinkHreflang(l.code, `https://kbeauty-wholesale.com/${l.code}${basePath}`);
    });
    setLinkHreflang('x-default', `https://kbeauty-wholesale.com/${defaultLanguage}${basePath}`);
  }, [titleKey, descriptionKey, titleParams, descParams, t, lang, location.pathname]);

  return null;
}

function setMeta(name: string, content: string, isOg = false) {
  const attr = isOg ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setLinkHreflang(hreflang: string, href: string) {
  let el = document.head.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}
