-- Optional, evidence-based metadata for deterministic cosmetic product matching.
alter table public.products
  add column if not exists ingredient_tags jsonb,
  add column if not exists benefit_tags jsonb,
  add column if not exists skin_concern_tags jsonb,
  add column if not exists skin_type_tags jsonb;

alter table public.products
  drop constraint if exists products_ingredient_tags_array,
  drop constraint if exists products_benefit_tags_array,
  drop constraint if exists products_skin_concern_tags_array,
  drop constraint if exists products_skin_type_tags_array;

alter table public.products
  add constraint products_ingredient_tags_array check (ingredient_tags is null or jsonb_typeof(ingredient_tags) = 'array'),
  add constraint products_benefit_tags_array check (benefit_tags is null or jsonb_typeof(benefit_tags) = 'array'),
  add constraint products_skin_concern_tags_array check (skin_concern_tags is null or jsonb_typeof(skin_concern_tags) = 'array'),
  add constraint products_skin_type_tags_array check (skin_type_tags is null or jsonb_typeof(skin_type_tags) = 'array');

-- Rollback (manual): drop the four constraints above, then drop the four columns.
