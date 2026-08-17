-- Forward migration: preserve all existing product rows and add nullable/defaulted B2B fields.
-- The current storefront uses a static catalog. Create a minimal sync target only when
-- a products table does not already exist; otherwise leave its existing base schema intact.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists professional_category text,
  add column if not exists business_types text[],
  add column if not exists minimum_order_quantity integer,
  add column if not exists bulk_available boolean not null default false,
  add column if not exists oem_available boolean not null default false,
  add column if not exists sample_available boolean not null default false,
  add column if not exists export_available boolean not null default false,
  add column if not exists recommended_countries jsonb,
  add column if not exists marketing_tags jsonb,
  add column if not exists professional_description text;

alter table public.products
  drop constraint if exists products_minimum_order_quantity_nonnegative;
alter table public.products
  add constraint products_minimum_order_quantity_nonnegative
  check (minimum_order_quantity is null or minimum_order_quantity >= 0);

alter table public.products
  drop constraint if exists products_recommended_countries_array;
alter table public.products
  add constraint products_recommended_countries_array
  check (recommended_countries is null or jsonb_typeof(recommended_countries) = 'array');

alter table public.products
  drop constraint if exists products_marketing_tags_array;
alter table public.products
  add constraint products_marketing_tags_array
  check (marketing_tags is null or jsonb_typeof(marketing_tags) = 'array');

-- Rollback (manual, intentionally not executed):
-- alter table public.products drop column if exists professional_category,
--   drop column if exists business_types, drop column if exists minimum_order_quantity,
--   drop column if exists bulk_available, drop column if exists oem_available,
--   drop column if exists sample_available, drop column if exists export_available,
--   drop column if exists recommended_countries, drop column if exists marketing_tags,
--   drop column if exists professional_description;
