import { createClient } from '@supabase/supabase-js';
import { products } from '../src/data/products';

const dryRun = process.argv.includes('--dry-run');
const sqlOutput = process.argv.includes('--sql');
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
    ingredient_tags: product.ingredientTags ?? null,
    benefit_tags: product.benefitTags ?? null,
    skin_concern_tags: product.skinConcernTags ?? null,
    skin_type_tags: product.skinTypeTags ?? null,
    inci_ingredients: product.inciIngredients ?? null,
    normalized_ingredients: product.normalizedIngredients ?? null,
    caution_tags: product.cautionTags ?? null,
    derived_benefit_tags: product.derivedBenefitTags ?? null,
    verification_status: product.verificationStatus ?? 'unverified',
    verification_source: product.verificationSource ?? null,
    verified_at: product.verifiedAt ?? null,
    professional_description: product.professionalDescription ?? null,
  }));

  if (sqlOutput) {
    const json = JSON.stringify(rows);
    const columns = Object.keys(rows[0] ?? {});
    const recordTypes: Record<string, string> = {
      minimum_order_quantity: 'integer', price: 'numeric', is_new: 'boolean', is_best: 'boolean',
      bulk_available: 'boolean', oem_available: 'boolean', sample_available: 'boolean', export_available: 'boolean',
      images: 'jsonb', options: 'jsonb', business_types: 'jsonb', recommended_countries: 'jsonb',
      marketing_tags: 'jsonb', ingredient_tags: 'jsonb', benefit_tags: 'jsonb', skin_concern_tags: 'jsonb',
      skin_type_tags: 'jsonb', inci_ingredients: 'jsonb', normalized_ingredients: 'jsonb', caution_tags: 'jsonb',
      derived_benefit_tags: 'jsonb', verified_at: 'timestamptz',
    };
    const definitions = columns.map((column) => `${column} ${recordTypes[column] ?? 'text'}`).join(', ');
    const updates = columns.filter((column) => column !== 'slug').map((column) => `${column} = excluded.${column}`).join(', ');
    console.log(`with source as (select * from jsonb_to_recordset($products$${json}$products$::jsonb) as x(${definitions}))\n` +
      `insert into public.products (${columns.join(', ')}) select ${columns.join(', ')} from source\n` +
      `on conflict (slug) do update set ${updates};\n` +
      `select count(*) as product_count from public.products;`);
  } else if (dryRun) {
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
