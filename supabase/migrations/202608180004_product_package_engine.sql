create table if not exists public.product_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ko text not null,
  name_vi text,
  name_en text,
  description_ko text,
  description_vi text,
  description_en text,
  target_business_types jsonb not null default '[]'::jsonb,
  recommended_country jsonb,
  minimum_order_quantity integer,
  is_active boolean not null default true,
  images jsonb,
  marketing_tags jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_packages_moq_nonnegative check (minimum_order_quantity is null or minimum_order_quantity >= 0),
  constraint product_packages_business_types_array check (jsonb_typeof(target_business_types) = 'array'),
  constraint product_packages_country_array check (recommended_country is null or jsonb_typeof(recommended_country) = 'array'),
  constraint product_packages_images_array_or_object check (images is null or jsonb_typeof(images) in ('array', 'object')),
  constraint product_packages_marketing_tags_array check (marketing_tags is null or jsonb_typeof(marketing_tags) = 'array')
);

create table if not exists public.product_package_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.product_packages(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  sort_order integer not null default 0,
  unique (package_id, product_id)
);

create index if not exists product_package_items_package_idx on public.product_package_items (package_id, sort_order);
create index if not exists product_package_items_product_idx on public.product_package_items (product_id);
create index if not exists product_packages_active_idx on public.product_packages (is_active) where is_active = true;

alter table public.product_packages enable row level security;
alter table public.product_package_items enable row level security;

create policy "public can read active packages" on public.product_packages
for select to anon, authenticated using (is_active = true or public.is_admin());
create policy "public can read active package items" on public.product_package_items
for select to anon, authenticated using (
  exists (select 1 from public.product_packages package where package.id = package_id and (package.is_active = true or public.is_admin()))
);
create policy "admins can manage packages" on public.product_packages
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins can manage package items" on public.product_package_items
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create trigger product_packages_set_updated_at before update on public.product_packages
for each row execute procedure public.set_updated_at();

-- Rollback (manual): drop product_package_items first, then product_packages.
