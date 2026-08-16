import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Star, Package, Globe, Layers, Check, MessageCircle, FileText, ArrowLeft, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import ProductCard from '@/components/ProductCard';
import ZaloButton from '@/components/ZaloButton';
import { getProductBySlug, getRelatedProducts, getLocalizedProduct } from '@/data/products';
import { useLanguage } from '@/utils/routing';
import { contactConfig } from '@/config/contact';

export default function ProductDetailPage() {
  const { t } = useTranslation(['common', 'products', 'footer']);
  const lang = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-sm text-charcoal-700/50">{t('common:common.notFound')}</p>
        <Link to={`/${lang}/products`} className="mt-4 btn-secondary">{t('common:common.backToProducts')}</Link>
      </div>
    );
  }

  const p = getLocalizedProduct(product, lang);
  const categoryLabel = t(`products:categories.${product.category}`);
  const related = getRelatedProducts(product, 4);

  return (
    <div className="pb-24 lg:pb-12">
      <SEO
        titleKey="footer:seo.product.title"
        descriptionKey="footer:seo.product.description"
        titleParams={{ name: p.name }}
        descParams={{ name: p.name }}
      />
      {/* Breadcrumb */}
      <div className="container-app py-4">
        <nav className="flex items-center gap-1.5 text-xs text-charcoal-700/40">
          <Link to={`/${lang}`} className="transition-colors hover:text-rose-500">{t('common:nav.home')}</Link>
          <ChevronRight className="h-3 w-3" strokeWidth={1.8} />
          <Link to={`/${lang}/products`} className="transition-colors hover:text-rose-500">{t('common:menu.products')}</Link>
          <ChevronRight className="h-3 w-3" strokeWidth={1.8} />
          <Link to={`/${lang}/products?category=${product.category}`} className="transition-colors hover:text-rose-500">{categoryLabel}</Link>
          <ChevronRight className="h-3 w-3" strokeWidth={1.8} />
          <span className="line-clamp-1 text-charcoal-700/60">{p.name}</span>
        </nav>
      </div>

      <div className="container-app">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl shadow-card">
              <img
                src={product.gallery[activeImage]}
                alt={p.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-4 top-4 flex flex-col gap-1.5">
                {product.isBestSeller && <span className="badge bg-rose-500 text-white shadow-soft">{t('common:product.bestSeller')}</span>}
                {product.isNewArrival && <span className="badge bg-rose-100 text-rose-600 shadow-soft">{t('common:product.newArrival')}</span>}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    activeImage === i ? 'border-rose-500 shadow-soft' : 'border-rose-100 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${p.name} - ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-rose-400">{product.brand}</span>
              <span className="flex items-center gap-1 text-xs text-charcoal-700/50">
                <Star className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                {p.rating} ({p.reviewCount} {t('common:product.reviews')})
              </span>
            </div>

            <h1 className="text-2xl font-semibold leading-tight text-charcoal-800 sm:text-3xl">{p.name}</h1>
            <p className="mt-1.5 text-sm text-charcoal-700/50">{p.originalName}</p>

            <p className="mt-4 text-sm leading-relaxed text-charcoal-700/70">{p.summary}</p>

            {/* Specs */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <SpecItem icon={Layers} label={t('products:detail.specs.category')} value={categoryLabel} />
              <SpecItem icon={Package} label={t('products:detail.specs.capacity')} value={product.capacity} />
              <SpecItem icon={Globe} label={t('products:detail.specs.origin')} value={product.countryOfOrigin} />
              <SpecItem icon={Check} label={t('products:detail.specs.moq')} value={`${product.moq} ${t('products:detail.moqUnit')}`} />
            </div>

            {product.options.length > 0 && (
              <div className="mt-6 rounded-2xl border border-rose-100 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-rose-400">
                  {lang === 'vi' ? 'Lựa chọn sản phẩm' : lang === 'ko' ? '상품 옵션' : 'Product options'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.options.map((option) => (
                    <span key={option} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-charcoal-700">
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mt-6 rounded-2xl bg-ivory-100 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-rose-400">{t('products:detail.wholesalePrice')}</p>
              <p className="mt-1 font-serif text-xl font-semibold text-charcoal-800">{t('products:detail.contactForPrice')}</p>
              <p className="mt-1 text-xs text-charcoal-700/50">{t('products:detail.quoteDesc')}</p>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/${lang}/inquiry`}
                state={{ productName: p.name }}
                className="btn-primary flex-1"
              >
                <FileText className="h-5 w-5" strokeWidth={1.8} />
                {t('common:actions.requestQuote')}
              </Link>
              <ZaloButton className="flex-1" />
            </div>

            {/* Shipping info */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-100 bg-white p-4">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" strokeWidth={1.6} />
              <div>
                <p className="text-sm font-medium text-charcoal-800">{t('products:detail.shippingInfo')}</p>
                <p className="mt-1 text-xs leading-relaxed text-charcoal-700/50">
                  {p.wholesaleInfo}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <DetailCard title={t('products:detail.benefits')} icon={Check}>
            <ul className="space-y-2">
              {p.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-charcoal-700/70">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" strokeWidth={2} />
                  {b}
                </li>
              ))}
            </ul>
          </DetailCard>

          <DetailCard title={t('products:detail.usage')} icon={FileText}>
            <p className="text-sm leading-relaxed text-charcoal-700/70">{p.usage}</p>
          </DetailCard>

          <DetailCard title={t('products:detail.ingredients')} icon={Layers}>
            <p className="text-sm leading-relaxed text-charcoal-700/70">{p.ingredients}</p>
          </DetailCard>
        </div>

        {product.detailImages.length > 0 && (
          <section className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl bg-white shadow-card">
            <div className="border-b border-rose-100 px-5 py-4 sm:px-8">
              <h2 className="text-xl font-semibold text-charcoal-800">
                {lang === 'vi' ? 'Thông tin chi tiết sản phẩm' : lang === 'ko' ? '상품 상세정보' : 'Product details'}
              </h2>
            </div>
            <div className="bg-white">
              {product.detailImages.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${p.name} - ${index + 1}`}
                  loading="lazy"
                  className="mx-auto h-auto w-full"
                />
              ))}
            </div>
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-semibold text-charcoal-800 sm:text-2xl">{t('products:detail.relatedProducts')}</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 hidden lg:block">
          <Link to={`/${lang}/products`} className="inline-flex items-center gap-2 text-sm font-medium text-rose-500 transition-colors hover:text-rose-600">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {t('common:common.backToCatalog')}
          </Link>
        </div>
      </div>

      {/* Sticky mobile Zalo bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-rose-100 bg-ivory-50/95 px-4 py-3 backdrop-blur-md shadow-elevated lg:hidden">
        <div className="flex-1">
          <p className="text-xs text-charcoal-700/50">{t('products:detail.wholesalePrice')}</p>
          <p className="text-sm font-semibold text-charcoal-800">{t('products:detail.contactForPrice')}</p>
        </div>
        <Link
          to={`/${lang}/inquiry`}
          state={{ productName: p.name }}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all active:scale-95"
        >
          <FileText className="h-4 w-4" strokeWidth={1.8} />
          {t('common:actions.requestQuote')}
        </Link>
        <a
          href={contactConfig.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('common:actions.contactZalo')}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-soft transition-all active:scale-95"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.8} />
        </a>
      </div>
    </div>
  );
}

function SpecItem({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-rose-100 bg-white p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-charcoal-700/40">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
        {label}
      </div>
      <p className="text-sm font-medium text-charcoal-800">{value}</p>
    </div>
  );
}

function DetailCard({ title, icon: Icon, children }: { title: string; icon: typeof Check; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <h3 className="font-sans text-base font-semibold text-charcoal-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}
