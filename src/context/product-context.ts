import { createContext, useContext } from 'react';
import type { Product } from '@/data/products';

export interface ProductContextValue {
  products: Product[];
  loading: boolean;
  source: 'supabase' | 'static';
}

export const ProductContext = createContext<ProductContextValue | null>(null);

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used inside ProductProvider');
  return context;
}
