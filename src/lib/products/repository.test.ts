import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { products as staticProducts } from '@/data/products';
import { getProductBySlug, getProducts, getProductsByCategory, getProfessionalProducts, mapProductRow } from './repository';
import type { ProductRow } from './types';

const row: ProductRow = {
  id: '3aa593d0-9a0f-4f17-9817-a019363ed8ab', slug: 'hub-lash-serum',
  name_ko: '프로 래쉬 세럼', name_vi: 'Serum mi chuyên nghiệp', name_en: 'Professional Lash Serum',
  description_ko: '전문가용 설명', description_vi: null, description_en: null,
  category: 'lash', images: { main: 'https://example.com/main.jpg', gallery: ['https://example.com/main.jpg'], detail: [] },
  options: ['10 ml'], price: null, is_new: true, is_best: false,
  professional_category: 'lash', business_types: ['lash_artist'], minimum_order_quantity: 12,
  bulk_available: true, oem_available: false, sample_available: true, export_available: true,
  recommended_countries: ['VN'], marketing_tags: ['professional'], professional_description: 'For trained professionals.',
  created_at: '2026-08-18T00:00:00Z', updated_at: '2026-08-18T00:00:00Z',
};

function clientWith(data: ProductRow[] | null, error: { message: string } | null = null) {
  return { from: () => ({ select: () => ({ order: async () => ({ data, error }) }) }) } as unknown as SupabaseClient;
}

describe('Product Hub repository', () => {
  it('maps a Supabase row to the existing Product shape', () => {
    const product = mapProductRow(row);
    expect(product.slug).toBe(row.slug);
    expect(product.translations.vi.name).toBe(row.name_vi);
    expect(product.professionalCategory).toBe('lash');
    expect(product.recommendedCountries).toEqual(['VN']);
  });

  it('returns Supabase products when rows exist', async () => {
    const result = await getProducts(clientWith([row]));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(row.id);
  });

  it('falls back to static products for missing configuration, empty data, or errors', async () => {
    await expect(getProducts(null)).resolves.toBe(staticProducts);
    await expect(getProducts(clientWith([]))).resolves.toBe(staticProducts);
    await expect(getProducts(clientWith(null, { message: 'offline' }))).resolves.toBe(staticProducts);
  });

  it('supports slug, category, and professional queries through the repository', async () => {
    const client = clientWith([row]);
    await expect(getProductBySlug(row.slug, client)).resolves.toMatchObject({ slug: row.slug });
    await expect(getProductsByCategory('lash', client)).resolves.toHaveLength(1);
    await expect(getProfessionalProducts(client)).resolves.toHaveLength(1);
  });
});
