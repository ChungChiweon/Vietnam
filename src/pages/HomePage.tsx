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
