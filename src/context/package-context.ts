import { createContext, useContext } from 'react';
import type { PackageWithProducts } from '@/lib/packages/types';

interface PackageContextValue { packages: PackageWithProducts[]; loading: boolean }
export const PackageContext = createContext<PackageContextValue | null>(null);
export function usePackages() {
  const context = useContext(PackageContext);
  if (!context) throw new Error('usePackages must be used inside PackageProvider');
  return context;
}
