import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { PackageContext } from './package-context';
import { getPackages } from '@/lib/packages/repository';
import type { PackageWithProducts } from '@/lib/packages/types';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function PackageProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<PackageWithProducts[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  useEffect(() => {
    let active = true;
    void getPackages().then((items) => { if (active) { setPackages(items); setLoading(false); } });
    return () => { active = false; };
  }, []);
  const value = useMemo(() => ({ packages, loading }), [loading, packages]);
  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
}
