-- Keep anonymous wholesale inquiries available without exposing customer data.
-- This migration is intentionally scoped to public.orders.

alter table public.orders enable row level security;

-- Remove every existing orders policy, including policies created outside the
-- repository, so an older permissive rule cannot remain active alongside the
-- hardened policy set below.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'orders'
  loop
    execute format('drop policy %I on public.orders', existing_policy.policyname);
  end loop;
end;
$$;

-- Table grants are deliberately narrower than the RLS policies. Anonymous
-- clients can only create inquiries; authenticated clients can only exercise
-- the admin-gated read and status-update policies.
revoke all on table public.orders from anon, authenticated;
grant insert on table public.orders to anon;
grant select, update on table public.orders to authenticated;

create policy "anonymous users can create new orders"
on public.orders
for insert
to anon
with check (status = 'new');

create policy "admins can read orders"
on public.orders
for select
to authenticated
using (public.is_admin());

create policy "admins can update orders"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
