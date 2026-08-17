import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import Hero from '@/components/home/Hero';
import Benefits from '@/components/home/Benefits';
import Categories from '@/components/home/Categories';
import ProductSection from '@/components/home/ProductSection';
import Process from '@/components/home/Process';
import Trust from '@/components/home/Trust';
import CTASection from '@/components/home/CTASection';
import { getBestSellers, getNewArrivals } from '@/data/products';
import { useLanguage } from '@/utils/routing';
import { Link } from 'react-router-dom';
import { ArrowRight, ScanFace, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation(['home', 'footer']);
  const lang = useLanguage();
  const bestSellers = getBestSellers();
  const newArrivals = getNewArrivals();

  return (
    <>
      <SEO
        titleKey="footer:seo.home.title"
        descriptionKey="footer:seo.home.description"
      />
      <Hero />
      <section className="container-app py-8 sm:py-12">
        <div className="relative overflow-hidden rounded-3xl bg-charcoal-900 px-6 py-9 text-white shadow-elevated sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-rose-500/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium tracking-wide text-rose-100">
              <Sparkles className="h-3.5 w-3.5" /> {t('home:skinCheck.eyebrow')}
            </span>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{t('home:skinCheck.title')}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">{t('home:skinCheck.description')}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/65">
              <span className="flex items-center gap-1.5"><ScanFace className="h-4 w-4 text-rose-300" />{t('home:skinCheck.photo')}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-rose-300" />{t('home:skinCheck.privacy')}</span>
            </div>
          </div>
          <Link to={`/${lang}/skin-check`} className="relative mt-7 inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-charcoal-900 transition hover:bg-rose-50 lg:mt-0">
            {t('home:skinCheck.cta')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <Benefits />
      <Categories />
      <ProductSection
        eyebrow={t('home:bestSellers.eyebrow')}
        title={t('home:bestSellers.title')}
        products={bestSellers}
        viewAllTo={`/${lang}/products?filter=bestseller`}
      />
      <ProductSection
        eyebrow={t('home:newArrivals.eyebrow')}
        title={t('home:newArrivals.title')}
        products={newArrivals}
        viewAllTo={`/${lang}/products?filter=new`}
      />
      <Process />
      <Trust />
      <CTASection />
    </>
  );
}
