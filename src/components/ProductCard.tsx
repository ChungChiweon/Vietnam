import { Link } from 'react-router-dom';
import { Star, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/utils/routing';
import { getLocalizedProduct } from '@/data/products';
import type { Product } from '@/data/products';
import { formatMoq } from '@/utils/format';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const { t } = useTranslation(['common', 'products']);
  const lang = useLanguage();
  const p = getLocalizedProduct(product, lang);

  return (
    <div className={`card group flex flex-col overflow-hidden hover:shadow-card hover:-translate-y-1 ${className}`}>
      <Link to={`/${lang}/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-ivory-100">
        <img
          src={product.image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isBestSeller && (
            <span className="badge bg-rose-500 text-white shadow-soft">{t('common:product.bestSeller')}</span>
          )}
          {product.isNewArrival && (
            <span className="badge bg-rose-100 text-rose-600 shadow-soft">{t('common:product.newArrival')}</span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-rose-400">{product.brand}</span>
          <span className="flex items-center gap-0.5 text-[10px] text-rose-300">
            <Star className="h-3 w-3 fill-rose-400 text-rose-400" />
            {p.rating}
          </span>
        </div>

        <Link to={`/${lang}/products/${product.slug}`}>
          <h3 className="mb-0.5 line-clamp-2 font-sans text-sm font-medium leading-snug text-charcoal-800 transition-colors group-hover:text-rose-600">
            {p.name}
          </h3>
        </Link>
        <p className="mb-2 line-clamp-1 text-xs text-charcoal-700/50">{p.originalName}</p>

        <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-charcoal-700/60">
          <span className="inline-flex items-center gap-1">
            <Package className="h-3 w-3" strokeWidth={1.5} />
            {product.capacity}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-rose-500">{t('common:product.moq')}</span> {formatMoq(product.moq, lang)}
          </span>
        </div>

        <div className="mb-3 rounded-lg bg-ivory-100 px-3 py-2 text-center">
          <span className="text-xs font-medium text-charcoal-700/70">{t('common:product.contactForPrice')}</span>
        </div>

        <div className="mt-auto flex gap-2">
          <Link
            to={`/${lang}/products/${product.slug}`}
            className="flex-1 rounded-full border border-rose-200 bg-white px-3 py-2 text-center text-xs font-medium text-rose-600 transition-all duration-300 hover:bg-rose-50 active:scale-95"
          >
            {t('common:actions.viewDetails')}
          </Link>
          <Link
            to={`/${lang}/inquiry`}
            state={{ productName: p.name }}
            className="flex-1 rounded-full bg-rose-500 px-3 py-2 text-center text-xs font-medium text-white shadow-soft transition-all duration-300 hover:bg-rose-600 active:scale-95"
          >
            {t('common:actions.requestQuote')}
          </Link>
        </div>
      </div>
    </div>
  );
}
