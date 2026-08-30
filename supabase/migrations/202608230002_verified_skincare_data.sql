-- Verified skincare recommendation metadata. All fields are optional for legacy products.
alter table public.products
  add column if not exists inci_ingredients jsonb,
  add column if not exists normalized_ingredients jsonb,
  add column if not exists caution_tags jsonb,
  add column if not exists derived_benefit_tags jsonb,
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists verification_source text,
  add column if not exists verified_at timestamptz;

alter table public.products
  drop constraint if exists products_inci_ingredients_array,
  drop constraint if exists products_normalized_ingredients_array,
  drop constraint if exists products_caution_tags_array,
  drop constraint if exists products_derived_benefit_tags_array,
  drop constraint if exists products_verification_status_valid;

alter table public.products
  add constraint products_inci_ingredients_array check (inci_ingredients is null or jsonb_typeof(inci_ingredients) = 'array'),
  add constraint products_normalized_ingredients_array check (normalized_ingredients is null or jsonb_typeof(normalized_ingredients) = 'array'),
  add constraint products_caution_tags_array check (caution_tags is null or jsonb_typeof(caution_tags) = 'array'),
  add constraint products_derived_benefit_tags_array check (derived_benefit_tags is null or jsonb_typeof(derived_benefit_tags) = 'array'),
  add constraint products_verification_status_valid check (verification_status in ('unverified', 'label_verified', 'brand_verified', 'admin_verified'));

create index if not exists products_verification_status_idx on public.products (verification_status);

-- Rollback (manual): drop the index and constraints above, then drop only these seven columns.
