import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { mapProductRow } from '@/lib/products/repository';
import type { ProductRow } from '@/lib/products/types';
import type { PackageWithProducts } from './types';

interface PackageRow {
  id: string; slug: string; name_ko: string; name_vi: string | null; name_en: string | null;
  description_ko: string | null; description_vi: string | null; description_en: string | null;
  target_business_types: unknown; recommended_country: unknown; minimum_order_quantity: number | null;
  is_active: boolean; images: unknown; marketing_tags: unknown; created_at: string; updated_at: string;
  product_package_items?: Array<{ id: string; package_id: string; product_id: string; quantity: number; sort_order: number; products: ProductRow | null }>;
}

const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export function mapPackageRow(row: PackageRow): PackageWithProducts {
  const items = (row.product_package_items ?? [])
    .filter((item): item is typeof item & { products: ProductRow } => Boolean(item.products))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({ id: item.id, packageId: item.package_id, productId: item.product_id, quantity: item.quantity, sortOrder: item.sort_order, product: mapProductRow(item.products) }));
  return {
    id: row.id, slug: row.slug, nameKo: row.name_ko, nameVi: row.name_vi, nameEn: row.name_en,
    descriptionKo: row.description_ko, descriptionVi: row.description_vi, descriptionEn: row.description_en,
    targetBusinessTypes: strings(row.target_business_types), recommendedCountries: strings(row.recommended_country),
    minimumOrderQuantity: row.minimum_order_quantity, isActive: row.is_active, images: strings(row.images),
    marketingTags: strings(row.marketing_tags), createdAt: row.created_at, updatedAt: row.updated_at, items,
  };
}

export async function getPackages(client: SupabaseClient | null = supabase): Promise<PackageWithProducts[]> {
  if (!client) return [];
  const { data, error } = await client.from('product_packages').select('*, product_package_items(*, products(*))').eq('is_active', true).order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as PackageRow[]).filter((row) => row.is_active).map(mapPackageRow);
}

export async function getPackageBySlug(slug: string, client: SupabaseClient | null = supabase) {
  return (await getPackages(client)).find((item) => item.slug === slug);
}

export async function getPackagesByBusinessType(businessType: string, client: SupabaseClient | null = supabase) {
  return (await getPackages(client)).filter((item) => item.targetBusinessTypes.includes(businessType));
}

export async function getPackageProducts(packageId: string, client: SupabaseClient | null = supabase) {
  return (await getPackages(client)).find((item) => item.id === packageId)?.items ?? [];
}
