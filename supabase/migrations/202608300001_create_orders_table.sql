-- Foundation for anonymous wholesale inquiries and admin order management.
-- Access policies are intentionally defined in the following hardening migration.

create table public.orders (
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
  status text not null default 'new',
  constraint orders_status_valid
    check (status in ('new', 'confirmed', 'forwarded', 'shipping', 'completed'))
);

alter table public.orders enable row level security;

create index orders_created_at_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);
