import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/context/AuthContext';
import ProductProvider from '@/context/ProductProvider';
import PackageProvider from '@/context/PackageProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode><AuthProvider><ProductProvider><PackageProvider><App /></PackageProvider></ProductProvider></AuthProvider></StrictMode>
);
