import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { products as staticProducts, type Product } from '@/data/products';
import { ProductContext } from './product-context';
import { getProducts } from '@/lib/products/repository';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [source, setSource] = useState<'supabase' | 'static'>('static');

  useEffect(() => {
    let active = true;
    void getProducts().then((items) => {
      if (!active) return;
      setProducts(items);
      setSource(items === staticProducts ? 'static' : 'supabase');
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({ products, loading, source }), [loading, products, source]);
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}
