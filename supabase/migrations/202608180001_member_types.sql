create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type text not null default 'consumer' check (user_type in ('consumer', 'professional', 'distributor')),
  business_verified boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  company_name text not null,
  business_type text not null check (business_type in ('beauty_salon', 'lash_studio', 'pmu_artist', 'waxing_shop', 'beauty_school', 'distributor', 'importer', 'wholesaler')),
  country text not null,
  city text,
  sns_url text,
  phone text,
  website text,
  description text,
  distribution_focus text,
  expected_purchase_scale text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Before public sign-up existed, every Auth account was an administrator.
-- Preserve those accounts; users created after this migration default to non-admin.
insert into public.profiles (id, user_type, business_verified, is_admin)
select id, 'consumer', false, true from auth.users
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_type text;
  business jsonb;
begin
  requested_type := coalesce(new.raw_user_meta_data ->> 'user_type', 'consumer');
  if requested_type not in ('consumer', 'professional', 'distributor') then
    requested_type := 'consumer';
  end if;

  insert into public.profiles (id, user_type)
  values (new.id, requested_type)
  on conflict (id) do nothing;

  business := new.raw_user_meta_data -> 'business_profile';
  if requested_type in ('professional', 'distributor') and business is not null then
    insert into public.business_profiles (
      user_id, company_name, business_type, country, city, sns_url, phone,
      website, description, distribution_focus, expected_purchase_scale
    ) values (
      new.id,
      coalesce(business ->> 'company_name', ''),
      case
        when business ->> 'business_type' in ('beauty_salon', 'lash_studio', 'pmu_artist', 'waxing_shop', 'beauty_school', 'distributor', 'importer', 'wholesaler')
          then business ->> 'business_type'
        when requested_type = 'distributor' then 'distributor'
        else 'beauty_salon'
      end,
      coalesce(business ->> 'country', 'Vietnam'),
      nullif(business ->> 'city', ''),
      nullif(business ->> 'sns_url', ''),
      nullif(business ->> 'phone', ''),
      nullif(business ->> 'website', ''),
      nullif(business ->> 'description', ''),
      nullif(business ->> 'distribution_focus', ''),
      nullif(business ->> 'expected_purchase_scale', '')
    ) on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists business_profiles_set_updated_at on public.business_profiles;
create trigger business_profiles_set_updated_at before update on public.business_profiles
for each row execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

alter table public.profiles enable row level security;
alter table public.business_profiles enable row level security;

create policy "users can read own profile" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "users can read own business profile" on public.business_profiles
for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "users can create own business profile" on public.business_profiles
for insert to authenticated with check (user_id = auth.uid() and verified = false);
create policy "users can update own business profile" on public.business_profiles
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and verified = false);

revoke update on public.profiles from authenticated;
revoke update on public.business_profiles from authenticated;
grant update (company_name, business_type, country, city, sns_url, phone, website, description, distribution_focus, expected_purchase_scale)
on public.business_profiles to authenticated;

drop policy if exists "authenticated admins can read orders" on public.orders;
drop policy if exists "authenticated admins can update orders" on public.orders;
create policy "admins can read orders" on public.orders
for select to authenticated using (public.is_admin());
create policy "admins can update orders" on public.orders
for update to authenticated using (public.is_admin()) with check (public.is_admin());
