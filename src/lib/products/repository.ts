import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { products as staticProducts, type CategoryId, type Product, type ProductTranslation } from '@/data/products';
import type { ProductRow } from './types';

const validCategories = new Set<CategoryId>(['pmu-machines-needles', 'pmu-pigments', 'pmu-supplies', 'lash', 'waxing', 'oem', 'competition']);

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function imageData(value: unknown) {
  if (Array.isArray(value)) {
    const gallery = stringArray(value);
    return { image: gallery[0] ?? '', gallery, detailImages: [] as string[] };
  }
  const data = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const gallery = stringArray(data.gallery);
  const image = typeof data.main === 'string' ? data.main : gallery[0] ?? '';
  return { image, gallery: gallery.length ? gallery : image ? [image] : [], detailImages: stringArray(data.detail) };
}

function translation(name: string, description: string | null): ProductTranslation {
  return { name, originalName: name, summary: description ?? '', benefits: [], usage: '', ingredients: '', wholesaleInfo: '' };
}

export function mapProductRow(row: ProductRow): Product {
  const images = imageData(row.images);
  const koName = row.name_ko;
  const viName = row.name_vi ?? koName;
  const enName = row.name_en ?? koName;
  return {
    id: row.id,
    slug: row.slug,
    brand: 'K-Beauty Wholesale',
    category: validCategories.has(row.category as CategoryId) ? row.category as CategoryId : 'pmu-supplies',
    ...images,
    options: stringArray(row.options),
    sourceUrl: '',
    priceKrw: row.price,
    capacity: stringArray(row.options).length ? `${stringArray(row.options).length} options` : '1 item',
    moq: row.minimum_order_quantity ?? 1,
    countryOfOrigin: 'South Korea',
    isBestSeller: row.is_best,
    isNewArrival: row.is_new,
    rating: 0,
    reviewCount: 0,
    professionalCategory: row.professional_category,
    businessTypes: stringArray(row.business_types),
    minimumOrderQuantity: row.minimum_order_quantity,
    bulkAvailable: row.bulk_available,
    oemAvailable: row.oem_available,
    sampleAvailable: row.sample_available,
    exportAvailable: row.export_available,
    recommendedCountries: stringArray(row.recommended_countries),
    marketingTags: stringArray(row.marketing_tags),
    professionalDescription: row.professional_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    translations: {
      ko: translation(koName, row.description_ko),
      vi: translation(viName, row.description_vi ?? row.description_ko),
      en: translation(enName, row.description_en ?? row.description_ko),
    },
  };
}

export async function getProducts(client: SupabaseClient | null = supabase): Promise<Product[]> {
  if (!client) return staticProducts;
  const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) return staticProducts;
  return (data as ProductRow[]).map(mapProductRow);
}

export async function getProductBySlug(slug: string, client: SupabaseClient | null = supabase) {
  const items = await getProducts(client);
  return items.find((product) => product.slug === slug);
}

export async function getProductsByCategory(category: string, client: SupabaseClient | null = supabase) {
  const items = await getProducts(client);
  return items.filter((product) => product.category === category);
}

export async function getProfessionalProducts(client: SupabaseClient | null = supabase) {
  const items = await getProducts(client);
  return items.filter((product) => Boolean(product.professionalCategory || product.businessTypes?.length));
}
