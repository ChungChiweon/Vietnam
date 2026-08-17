import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { getPackageBySlug, getPackageProducts, getPackages, getPackagesByBusinessType, mapPackageRow } from './repository';

const product = {
  id: '55dd0302-73f9-41f2-8b68-253039301b64', slug: 'lash-glue', name_ko: '래쉬 글루', name_vi: null, name_en: 'Lash Glue',
  description_ko: null, description_vi: null, description_en: null, category: 'lash', images: [], options: [], price: null,
  is_new: false, is_best: false, professional_category: 'lash', business_types: ['lash_artist'], minimum_order_quantity: 1,
  bulk_available: true, oem_available: false, sample_available: false, export_available: true, recommended_countries: ['VN'],
  marketing_tags: [], professional_description: null, created_at: '2026-08-18T00:00:00Z', updated_at: '2026-08-18T00:00:00Z',
};

const activePackage = {
  id: '7d7e275f-3e7b-4cd4-945f-3ae7f558b72b', slug: 'lash-artist-starter-kit', name_ko: '래쉬 아티스트 스타터 키트', name_vi: null, name_en: 'Lash Artist Starter Kit',
  description_ko: null, description_vi: null, description_en: null, target_business_types: ['lash_artist', 'beauty_salon'], recommended_country: ['VN'],
  minimum_order_quantity: 1, is_active: true, images: [], marketing_tags: ['lash'], created_at: '2026-08-18T00:00:00Z', updated_at: '2026-08-18T00:00:00Z',
  product_package_items: [{ id: 'item-1', package_id: '7d7e275f-3e7b-4cd4-945f-3ae7f558b72b', product_id: product.id, quantity: 2, sort_order: 1, products: product }],
};

function clientWith(data: unknown[]) {
  return { from: () => ({ select: () => ({ eq: () => ({ order: async () => ({ data, error: null }) }) }) }) } as unknown as SupabaseClient;
}

describe('Package repository', () => {
  it('maps package items and their Product Hub products', () => {
    const item = mapPackageRow(activePackage);
    expect(item.items[0].product.slug).toBe('lash-glue');
    expect(item.items[0].quantity).toBe(2);
  });

  it('does not expose inactive packages', async () => {
    const inactive = { ...activePackage, id: 'inactive', slug: 'inactive', is_active: false };
    await expect(getPackages(clientWith([activePackage, inactive]))).resolves.toHaveLength(1);
  });

  it('drops invalid missing-product joins from package items', () => {
    const missing = { ...activePackage, product_package_items: [{ ...activePackage.product_package_items[0], products: null }] };
    expect(mapPackageRow(missing).items).toEqual([]);
  });

  it('supports slug, business type, and package-product queries', async () => {
    const client = clientWith([activePackage]);
    await expect(getPackageBySlug(activePackage.slug, client)).resolves.toMatchObject({ slug: activePackage.slug });
    await expect(getPackagesByBusinessType('lash_artist', client)).resolves.toHaveLength(1);
    await expect(getPackageProducts(activePackage.id, client)).resolves.toHaveLength(1);
  });
});
