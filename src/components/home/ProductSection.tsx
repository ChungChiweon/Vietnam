import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/utils/routing';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/data/products';

interface ProductSectionProps {
  title: string;
  eyebrow: string;
  products: Product[];
  viewAllTo: string;
}

export default function ProductSection({ title, eyebrow, products: items, viewAllTo }: ProductSectionProps) {
  const { t } = useTranslation('common');
  const lang = useLanguage();

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container-app">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="section-eyebrow">{eyebrow}</span>
            <h2 className="mt-2 text-2xl font-semibold text-charcoal-800 sm:text-3xl">{title}</h2>
          </div>
          <Link to={viewAllTo} className="flex items-center gap-1 text-sm font-medium text-rose-500 transition-colors hover:text-rose-600">
            <span className="hidden sm:inline">{t('common:actions.viewAll')}</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
