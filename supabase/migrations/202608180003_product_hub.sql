-- Product Hub core fields. Existing rows and B2B columns are preserved.
alter table public.products
  add column if not exists name_ko text,
  add column if not exists name_vi text,
  add column if not exists name_en text,
  add column if not exists description_ko text,
  add column if not exists description_vi text,
  add column if not exists description_en text,
  add column if not exists category text,
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists options jsonb not null default '[]'::jsonb,
  add column if not exists price numeric,
  add column if not exists is_new boolean not null default false,
  add column if not exists is_best boolean not null default false;

-- If an earlier preparation migration created empty placeholder rows, retain them
-- while making the required hub columns valid.
update public.products set name_ko = coalesce(nullif(name_ko, ''), slug, id::text);
update public.products set category = coalesce(nullif(category, ''), 'uncategorized');
alter table public.products alter column name_ko set not null;
alter table public.products alter column category set not null;

alter table public.products
  drop constraint if exists products_images_array_or_object;
alter table public.products
  add constraint products_images_array_or_object
  check (jsonb_typeof(images) in ('array', 'object'));

alter table public.products
  drop constraint if exists products_options_array;
alter table public.products
  add constraint products_options_array check (jsonb_typeof(options) = 'array');

-- 002 initially used text[] for this preparatory field. Product Hub standardizes
-- it to JSONB without discarding existing values.
alter table public.products
  alter column business_types type jsonb using to_jsonb(business_types);

alter table public.products
  drop constraint if exists products_business_types_array;
alter table public.products
  add constraint products_business_types_array
  check (business_types is null or jsonb_typeof(business_types) = 'array');

create unique index if not exists products_slug_unique_idx on public.products (slug);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_professional_category_idx on public.products (professional_category);
create index if not exists products_is_new_idx on public.products (is_new) where is_new = true;
create index if not exists products_is_best_idx on public.products (is_best) where is_best = true;

alter table public.products enable row level security;
drop policy if exists "public can read products" on public.products;
create policy "public can read products" on public.products for select to anon, authenticated using (true);
drop policy if exists "admins can manage products" on public.products;
create policy "admins can manage products" on public.products for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute procedure public.set_updated_at();

-- Rollback (manual): drop the indexes/policies/trigger above, then drop only the
-- core columns added by this migration. Do not drop the table or B2B columns.
