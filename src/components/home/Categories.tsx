import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/utils/routing';
import { categories, getCategoryLabel } from '@/data/products';
import { Sparkles, PenTool, Droplets, BriefcaseMedical, Eye, Factory, Trophy } from 'lucide-react';

const iconMap: Record<string, typeof Sparkles> = {
  Sparkles,
  PenTool,
  Droplets,
  BriefcaseMedical,
  Eye,
  Factory,
  Trophy,
};

export default function Categories() {
  const { t } = useTranslation('home');
  const lang = useLanguage();

  return (
    <section className="gradient-ivory py-12 sm:py-16 lg:py-20">
      <div className="container-app">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="section-eyebrow">{t('home:categories.eyebrow')}</span>
            <h2 className="mt-2 text-2xl font-semibold text-charcoal-800 sm:text-3xl">
              {t('home:categories.title')}
            </h2>
          </div>
          <Link to={`/${lang}/products`} className="hidden items-center gap-1 text-sm font-medium text-rose-500 transition-colors hover:text-rose-600 sm:flex">
            {t('common:menu.allProducts')}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] ?? Sparkles;
            const categoryLabel = getCategoryLabel(cat.id, lang);
            return (
              <Link
                key={cat.id}
                to={`/${lang}/products?category=${cat.id}`}
                className="group relative overflow-hidden rounded-2xl shadow-soft transition-all duration-500 hover:shadow-card hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={categoryLabel}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/10 to-transparent" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-rose-500 shadow-soft backdrop-blur-sm">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <h3 className="font-sans text-base font-semibold text-white">{categoryLabel}</h3>
                  <p className="mt-0.5 line-clamp-1 text-xs text-white/70">
                    {lang === 'vi' ? 'Sản phẩm chuyên nghiệp từ Hàn Quốc' : lang === 'ko' ? '한국 전문가용 제품' : 'Professional products from Korea'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to={`/${lang}/products`} className="btn-secondary">
            {t('common:menu.allProducts')}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
