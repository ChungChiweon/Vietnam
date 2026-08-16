import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import ZaloButton from './ZaloButton';
import LanguageSwitcher from './LanguageSwitcher';
import { categories } from '@/data/products';
import { useLanguage } from '@/utils/routing';

export default function Header() {
  const { t } = useTranslation('common');
  const lang = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/${lang}/products?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  const navLinks = [
    { label: t('common:menu.products'), to: `/${lang}/products` },
    { label: t('common:menu.newArrivals'), to: `/${lang}/products?filter=new` },
    { label: t('common:menu.bestSellers'), to: `/${lang}/products?filter=bestseller` },
    { label: t('common:menu.wholesaleGuide'), to: `/${lang}/wholesale-guide` },
    { label: t('common:menu.contact'), to: `/${lang}/contact` },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-ivory-50/90 shadow-soft backdrop-blur-md' : 'bg-ivory-50/40 backdrop-blur-sm'
        }`}
      >
        <div className="container-app">
          <div className="flex h-16 items-center justify-between gap-3 lg:h-20">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label={t('common:menu.open')}
              className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal-700 transition-colors hover:bg-rose-50 lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.8} />
            </button>

            <Logo className="shrink-0" />

            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link, i) =>
                i === 0 ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="rounded-full px-4 py-2 text-sm font-medium text-charcoal-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    {link.label}
                  </Link>
                ) : null
              )}
              <div className="group relative">
                <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-charcoal-700 transition-colors hover:bg-rose-50 hover:text-rose-600">
                  {t('common:menu.categories')}
                  <ChevronRight className="h-3.5 w-3.5 rotate-90 transition-transform group-hover:rotate-[-90deg]" strokeWidth={1.8} />
                </button>
                <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <div className="w-56 rounded-2xl border border-rose-100 bg-white p-2 shadow-card">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/${lang}/products?category=${cat.id}`}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-charcoal-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <span>{t(`common:categories.${cat.id}`, { defaultValue: '' }) || t(`products:categories.${cat.id}`)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="rounded-full px-4 py-2 text-sm font-medium text-charcoal-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label={t('common:search')}
                className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal-700 transition-colors hover:bg-rose-50"
              >
                <Search className="h-5 w-5" strokeWidth={1.8} />
              </button>

              <LanguageSwitcher variant="desktop" />

              <ZaloButton variant="compact" className="hidden sm:inline-flex" />
            </div>
          </div>

          {searchOpen && (
            <div className="pb-4 animate-fade-in">
              <form onSubmit={handleSearch} className="relative">
                <input
                  autoFocus
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t('common:searchPlaceholder')}
                  className="input-field pr-12"
                />
                <button
                  type="submit"
                  aria-label={t('common:search')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white transition-colors hover:bg-rose-600"
                >
                  <Search className="h-4 w-4" strokeWidth={2} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-charcoal-900/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-ivory-50 shadow-elevated animate-slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between border-b border-rose-100 px-5 py-4">
              <Logo />
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label={t('common:menu.close')}
                className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal-700 transition-colors hover:bg-rose-50"
              >
                <X className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>

            <div className="p-5">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-charcoal-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    {link.label}
                    <ChevronRight className="h-4 w-4 text-charcoal-700/30" strokeWidth={1.8} />
                  </Link>
                ))}
              </nav>

              <div className="mt-6">
                <p className="mb-2 px-4 text-xs font-medium uppercase tracking-wider text-rose-400">{t('common:menu.categories')}</p>
                <div className="flex flex-col gap-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/${lang}/products?category=${cat.id}`}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-charcoal-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <span>{t(`products:categories.${cat.id}`)}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <ZaloButton className="w-full" />
                <Link to={`/${lang}/inquiry`} className="btn-primary w-full">
                  {t('common:actions.requestQuote')}
                </Link>
              </div>

              <div className="mt-6">
                <LanguageSwitcher variant="mobile" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
