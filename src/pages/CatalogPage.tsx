import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import ProductCard from '@/components/ProductCard';
import { products, categories, brands } from '@/data/products';
import type { CategoryId } from '@/data/products';
import { useLanguage } from '@/utils/routing';

type SortOption = 'newest' | 'popular' | 'name';

const ITEMS_PER_PAGE = 8;

export default function CatalogPage() {
  const { t } = useTranslation(['common', 'products', 'footer']);
  const lang = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>(
    (searchParams.get('category') as CategoryId) ?? 'all'
  );
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedMoq, setSelectedMoq] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filterParam = searchParams.get('filter');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('category') as CategoryId | null;
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const tr = p.translations[lang] ?? p.translations.en;
        return (
          tr.name.toLowerCase().includes(q) ||
          tr.originalName.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        );
      });
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedBrand !== 'all') {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    if (selectedMoq === 'low') result = result.filter((p) => p.moq <= 12);
    else if (selectedMoq === 'medium') result = result.filter((p) => p.moq > 12 && p.moq <= 24);
    else if (selectedMoq === 'high') result = result.filter((p) => p.moq > 24);

    if (filterParam === 'bestseller') result = result.filter((p) => p.isBestSeller);
    if (filterParam === 'new') result = result.filter((p) => p.isNewArrival);

    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'name':
        result.sort((a, b) => {
          const aName = (a.translations[lang] ?? a.translations.en).name;
          const bName = (b.translations[lang] ?? b.translations.en).name;
          return aName.localeCompare(bName);
        });
        break;
      case 'newest':
      default:
        result.sort((a, b) => Number(b.isNewArrival) - Number(a.isNewArrival));
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedBrand, selectedMoq, sortBy, filterParam, lang]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedMoq('all');
    setSearchQuery('');
    setSearchParams({});
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (selectedMoq !== 'all' ? 1 : 0);

  return (
    <div className="min-h-screen pb-8">
      <SEO
        titleKey="footer:seo.catalog.title"
        descriptionKey="footer:seo.catalog.description"
      />
      {/* Page header */}
      <div className="gradient-ivory border-b border-rose-100 py-8 sm:py-10">
        <div className="container-app">
          <span className="section-eyebrow">{t('products:catalog.eyebrow')}</span>
          <h1 className="mt-2 text-2xl font-semibold text-charcoal-800 sm:text-3xl">{t('products:catalog.title')}</h1>
          <p className="mt-2 text-sm text-charcoal-700/50">
            {t('products:catalog.subtitle', { count: products.length })}
          </p>
        </div>
      </div>

      <div className="container-app py-6">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal-700/30" strokeWidth={1.8} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            placeholder={t('common:searchPlaceholder')}
            className="input-field pl-12"
          />
        </div>

        {/* Filter & sort bar */}
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-charcoal-700 transition-colors hover:bg-rose-50"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
            {t('products:catalog.filter')}
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none rounded-full border border-rose-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-charcoal-700 transition-colors hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              <option value="newest">{t('products:catalog.sortNewest')}</option>
              <option value="popular">{t('products:catalog.sortPopular')}</option>
              <option value="name">{t('products:catalog.sortName')}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-700/40" strokeWidth={1.8} />
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {selectedCategory !== 'all' && (
              <FilterChip
                label={t(`products:categories.${selectedCategory}`)}
                onRemove={() => setSelectedCategory('all')}
              />
            )}
            {selectedBrand !== 'all' && (
              <FilterChip label={selectedBrand} onRemove={() => setSelectedBrand('all')} />
            )}
            {selectedMoq !== 'all' && (
              <FilterChip
                label={selectedMoq === 'low' ? t('products:catalog.moqLow') : selectedMoq === 'medium' ? t('products:catalog.moqMedium') : t('products:catalog.moqHigh')}
                onRemove={() => setSelectedMoq('all')}
              />
            )}
            <button onClick={resetFilters} className="text-xs font-medium text-rose-500 hover:text-rose-600">
              {t('common:actions.clearFilters')}
            </button>
          </div>
        )}

        {/* Results count */}
        <p className="mb-4 text-sm text-charcoal-700/50">
          {t('products:catalog.results', { shown: visibleProducts.length, total: filtered.length })}
        </p>

        {/* Product grid */}
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-charcoal-700/50">{t('products:catalog.noResults')}</p>
            <button onClick={resetFilters} className="mt-4 btn-secondary">
              {t('common:actions.clearFilters')}
            </button>
          </div>
        )}

        {/* Load more */}
        {hasMore && visibleProducts.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
              className="btn-secondary"
            >
              {t('products:catalog.loadMore')}
            </button>
          </div>
        )}
      </div>

      {/* Filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-charcoal-900/30 backdrop-blur-sm animate-fade-in" onClick={() => setFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-ivory-50 shadow-elevated animate-slide-up">
            <div className="sticky top-0 flex items-center justify-between border-b border-rose-100 bg-ivory-50/95 px-5 py-4 backdrop-blur-md">
              <h3 className="font-sans text-base font-semibold text-charcoal-800">{t('products:catalog.filterTitle')}</h3>
              <button onClick={() => setFilterOpen(false)} aria-label={t('common:actions.close')} className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-700 hover:bg-rose-50">
                <X className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              {/* Category */}
              <FilterGroup title={t('products:catalog.category')}>
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')}>{t('common:common.all')}</FilterPill>
                  {categories.map((c) => (
                    <FilterPill key={c.id} active={selectedCategory === c.id} onClick={() => setSelectedCategory(c.id)}>
                      {t(`products:categories.${c.id}`)}
                    </FilterPill>
                  ))}
                </div>
              </FilterGroup>

              {/* Brand */}
              <FilterGroup title={t('products:catalog.brand')}>
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={selectedBrand === 'all'} onClick={() => setSelectedBrand('all')}>{t('common:common.all')}</FilterPill>
                  {brands.map((b) => (
                    <FilterPill key={b} active={selectedBrand === b} onClick={() => setSelectedBrand(b)}>{b}</FilterPill>
                  ))}
                </div>
              </FilterGroup>

              {/* MOQ */}
              <FilterGroup title={t('products:catalog.moqRange')}>
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={selectedMoq === 'all'} onClick={() => setSelectedMoq('all')}>{t('common:common.all')}</FilterPill>
                  <FilterPill active={selectedMoq === 'low'} onClick={() => setSelectedMoq('low')}>{t('products:catalog.moqLow')}</FilterPill>
                  <FilterPill active={selectedMoq === 'medium'} onClick={() => setSelectedMoq('medium')}>{t('products:catalog.moqMedium')}</FilterPill>
                  <FilterPill active={selectedMoq === 'high'} onClick={() => setSelectedMoq('high')}>{t('products:catalog.moqHigh')}</FilterPill>
                </div>
              </FilterGroup>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-rose-100 bg-ivory-50/95 p-5 backdrop-blur-md">
              <button onClick={resetFilters} className="btn-secondary flex-1">
                {t('common:actions.reset')}
              </button>
              <button onClick={() => setFilterOpen(false)} className="btn-primary flex-1">
                {t('products:catalog.viewNProducts', { count: filtered.length })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-600">
      {label}
      <button onClick={onRemove} aria-label="Remove filter" className="hover:text-rose-700">
        <X className="h-3 w-3" strokeWidth={2} />
      </button>
    </span>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 font-sans text-sm font-semibold text-charcoal-800">{title}</h4>
      {children}
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
        active
          ? 'bg-rose-500 text-white shadow-soft'
          : 'border border-rose-200 bg-white text-charcoal-700 hover:bg-rose-50'
      }`}
    >
      {children}
    </button>
  );
}
