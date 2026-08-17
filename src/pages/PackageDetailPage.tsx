import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Boxes, FileText } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import SEO from '@/components/SEO';
import { usePackages } from '@/context/package-context';
import { useLanguage } from '@/utils/routing';

export default function PackageDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const lang = useLanguage();
  const { packages, loading } = usePackages();
  const item = packages.find((candidate) => candidate.slug === slug);
  if (loading) return <div className="container-app py-20 text-center text-sm text-black/40">Loading package...</div>;
  if (!item) return <div className="container-app py-20 text-center"><p className="text-sm text-black/45">Package not found.</p><Link to={`/${lang}/products`} className="btn-secondary mt-4">Back to products</Link></div>;
  const name = lang === 'vi' ? item.nameVi ?? item.nameKo : lang === 'en' ? item.nameEn ?? item.nameKo : item.nameKo;
  const description = lang === 'vi' ? item.descriptionVi ?? item.descriptionKo : lang === 'en' ? item.descriptionEn ?? item.descriptionKo : item.descriptionKo;
  return <div className="container-app py-10 sm:py-16"><SEO titleKey="footer:seo.catalog.title" descriptionKey="footer:seo.catalog.description" /><Link to={`/${lang}/products`} className="inline-flex items-center gap-2 text-sm text-rose-600"><ArrowLeft className="h-4 w-4" />Products</Link><div className="mt-6 rounded-3xl bg-charcoal-900 p-7 text-white sm:p-10"><Boxes className="h-8 w-8 text-rose-300" /><h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{name}</h1>{description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">{description}</p> : null}<div className="mt-5 flex flex-wrap gap-2">{item.targetBusinessTypes.map((type) => <span key={type} className="rounded-full bg-white/10 px-3 py-1.5 text-xs">{type}</span>)}</div></div><section className="mt-10"><h2 className="text-2xl font-semibold">Package Products</h2><div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{item.items.map(({ product, quantity }) => <div key={product.id}><ProductCard product={product} /><p className="mt-2 text-center text-xs text-black/45">Quantity: {quantity}</p></div>)}</div></section><Link to={`/${lang}/inquiry`} state={{ productName: name }} className="btn-primary mt-10"><FileText className="h-4 w-4" />Request package quote</Link></div>;
}
