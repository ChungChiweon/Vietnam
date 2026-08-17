import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { defaultLanguage, isLanguageCode } from '@/config/languages';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import ScrollToTop from '@/components/ScrollToTop';
import ZaloButton from '@/components/ZaloButton';
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import InquiryPage from '@/pages/InquiryPage';
import WholesaleGuidePage from '@/pages/WholesaleGuidePage';
import ContactPage from '@/pages/ContactPage';
import PolicyPage from '@/pages/PolicyPage';
import AdminPage from '@/pages/AdminPage';
import MobileOrdersPage from '@/pages/MobileOrdersPage';
import SkinAnalysisPage from '@/pages/SkinAnalysisPage';
import AccountPage from '@/pages/AccountPage';
import PackageDetailPage from '@/pages/PackageDetailPage';

function RootRedirect() {
  const location = useLocation();
  const stored = (i18n.language as string) || defaultLanguage;
  const lang = stored.slice(0, 2);
  const target = `/${lang}${location.pathname}${location.search}${location.hash}`;
  return <Navigate to={target} replace />;
}

function LangSync() {
  const location = useLocation();
  const { i18n: i18nInstance } = useTranslation();
  const segments = location.pathname.split('/').filter(Boolean);
  const lang = segments[0];
  useEffect(() => {
    if (lang && isLanguageCode(lang) && i18nInstance.language !== lang) {
      i18nInstance.changeLanguage(lang);
    }
  }, [lang, i18nInstance]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isMobileOrders = location.pathname.startsWith('/orders');

  if (isAdmin) {
    return <Routes><Route path="/admin/*" element={<AdminPage />} /></Routes>;
  }

  if (isMobileOrders) {
    return <Routes><Route path="/orders/*" element={<MobileOrdersPage />} /></Routes>;
  }

  return (
    <>
      <ScrollToTop />
      <LangSync />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pb-16 lg:pb-0">
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/:lang" element={<HomePage />} />
            <Route path="/:lang/products" element={<CatalogPage />} />
            <Route path="/:lang/products/:slug" element={<ProductDetailPage />} />
            <Route path="/:lang/skin-check" element={<SkinAnalysisPage />} />
            <Route path="/:lang/account" element={<AccountPage />} />
            <Route path="/:lang/packages/:slug" element={<PackageDetailPage />} />
            <Route path="/:lang/inquiry" element={<InquiryPage />} />
            <Route path="/:lang/wholesale-guide" element={<WholesaleGuidePage />} />
            <Route path="/:lang/contact" element={<ContactPage />} />
            <Route path="/:lang/wholesale-policy" element={<PolicyPage type="wholesale" />} />
            <Route path="/:lang/privacy-policy" element={<PolicyPage type="privacy" />} />
            <Route path="/:lang/returns-policy" element={<PolicyPage type="returns" />} />
            <Route path="*" element={<Navigate to="/ko" replace />} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
        <ZaloButton variant="floating" />
      </div>
    </>
  );
}
