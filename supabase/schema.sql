create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  company text not null default '',
  phone text not null,
  zalo_id text not null default '',
  email text not null default '',
  city text not null,
  products text not null,
  quantities text not null default '',
  schedule text not null default '',
  message text not null default '',
  language text not null default 'vi',
  status text not null default 'new' check (status in ('new', 'confirmed', 'forwarded', 'shipping', 'completed'))
);

alter table public.orders enable row level security;

create policy "public can create orders" on public.orders for insert to anon with check (true);
create policy "authenticated admins can read orders" on public.orders for select to authenticated using (true);
create policy "authenticated admins can update orders" on public.orders for update to authenticated using (true) with check (true);

