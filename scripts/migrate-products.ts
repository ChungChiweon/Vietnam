import { createClient } from '@supabase/supabase-js';
import { products } from '../src/data/products';

const dryRun = process.argv.includes('--dry-run');
const duplicateSlugs = products.map((product) => product.slug).filter((slug, index, all) => all.indexOf(slug) !== index);

if (duplicateSlugs.length) {
  console.error(`Duplicate slugs found: ${[...new Set(duplicateSlugs)].join(', ')}`);
  process.exitCode = 1;
} else {
  const rows = products.map((product) => ({
    slug: product.slug,
    name_ko: product.translations.ko.name,
    name_vi: product.translations.vi.name,
    name_en: product.translations.en.name,
    description_ko: product.translations.ko.summary,
    description_vi: product.translations.vi.summary,
    description_en: product.translations.en.summary,
    category: product.category,
    images: { main: product.image, gallery: product.gallery, detail: product.detailImages },
    options: product.options,
    price: product.priceKrw,
    is_new: product.isNewArrival,
    is_best: product.isBestSeller,
    professional_category: product.professionalCategory ?? null,
    business_types: product.businessTypes ?? null,
    minimum_order_quantity: product.minimumOrderQuantity ?? product.moq,
    bulk_available: product.bulkAvailable ?? false,
    oem_available: product.oemAvailable ?? false,
    sample_available: product.sampleAvailable ?? false,
    export_available: product.exportAvailable ?? false,
    recommended_countries: product.recommendedCountries ?? null,
    marketing_tags: product.marketingTags ?? null,
    professional_description: product.professionalDescription ?? null,
  }));

  if (dryRun) {
    console.log(`[dry-run] ${rows.length} products validated. No database writes performed.`);
    console.log(JSON.stringify(rows[0] ?? {}, null, 2));
  } else {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Run the dry-run command first.');
      process.exitCode = 1;
    } else {
      const client = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const batchSize = 100;
      let migrated = 0;
      for (let offset = 0; offset < rows.length; offset += batchSize) {
        const batch = rows.slice(offset, offset + batchSize);
        const { error } = await client.from('products').upsert(batch, { onConflict: 'slug' });
        if (error) {
          console.error(`Batch ${offset / batchSize + 1} failed: ${error.message}`);
          process.exitCode = 1;
          break;
        }
        migrated += batch.length;
        console.log(`Migrated ${migrated}/${rows.length}`);
      }
      if (!process.exitCode) console.log(`Product migration complete: ${migrated} products upserted by slug.`);
    }
  }
}
