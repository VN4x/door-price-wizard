-- Roles -----------------------------------------------------------------
create type public.app_role as enum ('owner', 'sales', 'production', 'customer');
create type public.profile_status as enum ('pending', 'active', 'disabled');

create table public.profiles (
  id uuid primary key,
  email text not null,
  full_name text not null default '',
  status public.profile_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = _user_id
      and ur.role = _role
      and p.status = 'active'
  )
$$;

create or replace function public.is_owner(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(_user_id, 'owner')
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = _user_id
      and ur.role in ('owner', 'sales', 'production')
      and p.status = 'active'
  )
$$;

create policy "own profile readable" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "owner reads all profiles" on public.profiles
  for select to authenticated using (public.is_owner(auth.uid()));
create policy "own profile insert" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "own name update" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "owner updates profiles" on public.profiles
  for update to authenticated using (public.is_owner(auth.uid())) with check (true);

create policy "own roles readable" on public.user_roles
  for select to authenticated using (user_id = auth.uid());
create policy "owner reads roles" on public.user_roles
  for select to authenticated using (public.is_owner(auth.uid()));

-- Business settings -----------------------------------------------------
create table public.app_settings (
  id boolean primary key default true,
  company_name text not null default 'Kvaliteetaken OÜ',
  company_reg text not null default '',
  company_vat text not null default '',
  company_address text not null default '',
  company_phone text not null default '',
  company_email text not null default '',
  company_web text not null default 'kvaliteetaken.ee',
  offer_validity_days integer not null default 30,
  vat_percent numeric not null default 22,
  offer_prefix text not null default 'KA',
  order_prefix text not null default 'KT',
  enquiry_prefix text not null default 'KP',
  default_language text not null default 'et',
  delivery_rate numeric not null default 120,
  install_rate numeric not null default 250,
  delivery_time_text text not null default '4-6 nädalat',
  default_markup numeric not null default 25,
  min_margin_percent numeric not null default 12,
  campaign_percent numeric not null default 0,
  campaign_reason text not null default '',
  email_subject text not null default 'Teie hinnapakkumine — Kvaliteetaken',
  email_body text not null default 'Tere! Lisatud on teie hinnapakkumine. Küsimuste korral vastame hea meelega.',
  updated_at timestamptz not null default now(),
  constraint app_settings_single_row check (id)
);

grant select, insert, update on public.app_settings to authenticated;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;

create policy "staff read settings" on public.app_settings
  for select to authenticated using (public.is_staff(auth.uid()));
create policy "owner writes settings" on public.app_settings
  for update to authenticated using (public.is_owner(auth.uid())) with check (public.is_owner(auth.uid()));

insert into public.app_settings (id) values (true);

-- Public-safe subset of the settings, for the customer pages.
create or replace function public.public_settings()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'companyName', company_name,
    'companyPhone', company_phone,
    'companyEmail', company_email,
    'companyWeb', company_web,
    'vatPercent', vat_percent,
    'offerValidityDays', offer_validity_days,
    'defaultLanguage', default_language,
    'deliveryRate', delivery_rate,
    'installRate', install_rate,
    'deliveryTimeText', delivery_time_text,
    'campaignPercent', campaign_percent,
    'campaignReason', campaign_reason
  )
  from public.app_settings where id
$$;

grant execute on function public.public_settings() to anon, authenticated;

-- Internal article price list (owner only) -------------------------------
create table public.price_items (
  id text primary key,
  name text not null,
  category text not null default '',
  unit text not null default 'pcs',
  purchase_price numeric not null default 0,
  sale_multiplier numeric not null default 1.4,
  active boolean not null default true,
  driver text not null default 'fixed',
  ref_qty numeric not null default 1,
  systems text[] not null default array['slide','hst']::text[],
  hst_price numeric,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

grant select, insert, update, delete on public.price_items to authenticated;
grant all on public.price_items to service_role;
alter table public.price_items enable row level security;

create policy "owner reads price items" on public.price_items
  for select to authenticated using (public.is_owner(auth.uid()));
create policy "owner inserts price items" on public.price_items
  for insert to authenticated with check (public.is_owner(auth.uid()));
create policy "owner updates price items" on public.price_items
  for update to authenticated using (public.is_owner(auth.uid())) with check (public.is_owner(auth.uid()));
create policy "owner deletes price items" on public.price_items
  for delete to authenticated using (public.is_owner(auth.uid()));

insert into public.price_items
  (id, name, category, unit, purchase_price, sale_multiplier, active, driver, ref_qty, systems, hst_price)
values
  ('pi-leng', 'Frame profile (leng)', 'PVC profiles', 'm', 10.35, 1.4, true, 'framePerimeter', 12.06, ARRAY['slide','hst']::text[], 20),
  ('pi-post', 'Mullion profile (post)', 'PVC profiles', 'm', 9, 1.4, true, 'mullionHeight', 2.22, ARRAY['slide','hst']::text[], 15),
  ('pi-kate', 'Cover profile (kate)', 'PVC profiles', 'm', 4.4, 1.4, true, 'framePerimeter', 16.56, ARRAY['slide','hst']::text[], NULL),
  ('pi-kate2', 'Cover profile (kate2)', 'PVC profiles', 'm', 3.5, 1.4, true, 'framePerimeter', 17.56, ARRAY['slide','hst']::text[], NULL),
  ('pi-klaasiliist', 'Glazing bead (klaasiliist)', 'Seals & beads', 'm', 1, 1.4, true, 'sashPerimeter', 15.56, ARRAY['slide','hst']::text[], NULL),
  ('pi-rails', 'Top & bottom rails', 'Running rails', 'm', 40, 1.4, true, 'width', 3.71, ARRAY['slide','hst']::text[], NULL),
  ('pi-klaasitihend', 'Glazing seal 865012', 'Seals & beads', 'm', 4, 1.4, true, 'sashPerimeter', 15.73, ARRAY['slide','hst']::text[], NULL),
  ('pi-raamitihend', 'Sash seal 864952', 'Seals & beads', 'm', 3, 1.4, true, 'framePerimeter', 16.42, ARRAY['slide','hst']::text[], NULL),
  ('pi-raud-post', 'Mullion reinforcement', 'Steel reinforcement', 'm', 4, 1.4, true, 'mullionHeight', 2.06, ARRAY['slide','hst']::text[], NULL),
  ('pi-raud-leng', 'Frame reinforcement', 'Steel reinforcement', 'm', 17, 1.4, true, 'framePerimeter', 18.98, ARRAY['slide','hst']::text[], NULL),
  ('pi-handle', 'Hardware set & handle', 'Hardware & fixings', 'pcs', 200, 1.4, true, 'fixed', 1, ARRAY['slide','hst']::text[], NULL),
  ('pi-jupid', 'Small parts (jupid)', 'Hardware & fixings', 'pcs', 50, 1.4, true, 'fixed', 2, ARRAY['slide','hst']::text[], NULL),
  ('pi-248608', 'Mullion connectors 248608', 'Hardware & fixings', 'pcs', 4, 1.4, true, 'fixed', 2, ARRAY['slide','hst']::text[], NULL),
  ('pi-klamber', 'Clamps 277/3', 'Hardware & fixings', 'pcs', 1.5, 1.4, true, 'fixed', 18, ARRAY['slide','hst']::text[], NULL),
  ('pi-tiltini', 'Glazing bridges', 'Hardware & fixings', 'pcs', 3, 1.4, true, 'fixed', 8, ARRAY['slide','hst']::text[], NULL),
  ('pi-268651', 'Keeper holders 268651', 'Hardware & fixings', 'pcs', 5, 1.4, true, 'fixed', 8, ARRAY['slide','hst']::text[], NULL),
  ('pi-screw-5x40', 'Screws 5x40', 'Hardware & fixings', 'pcs', 15, 1.4, true, 'fixed', 2, ARRAY['slide','hst']::text[], NULL),
  ('pi-screw-63x70', 'Screws 6.3x70', 'Hardware & fixings', 'pcs', 15, 1.4, true, 'fixed', 2, ARRAY['slide','hst']::text[], NULL),
  ('pi-screw-39x16', 'Screws 3.9x16', 'Hardware & fixings', 'pcs', 0.004, 1.4, true, 'fixed', 79, ARRAY['slide','hst']::text[], NULL),
  ('pi-glass', 'Glass 4s-4-4s 18/16 Arg, Rw35dB', 'Glass unit', 'm²', 51.25, 1.4, true, 'glassArea', 6.59, ARRAY['slide','hst']::text[], NULL),
  ('pi-raam', 'Sash profile (raam)', 'PVC profiles', 'm', 10.8, 1.4, true, 'sashPerimeter', 8.08, ARRAY['slide','hst']::text[], 12),
  ('pi-raam2', 'Sash profile 2 (raam2)', 'PVC profiles', 'm', 12, 1.4, true, 'sashPerimeter', 9.08, ARRAY['hst']::text[], NULL),
  ('pi-raud-raam', 'Sash 1 reinforcement', 'Steel reinforcement', 'm', 6.1, 1.4, true, 'sashPerimeter', 19.98, ARRAY['hst']::text[], NULL),
  ('pi-raud-raam2', 'Sash 2 reinforcement', 'Steel reinforcement', 'm', 6, 1.4, true, 'sashPerimeter', 20.98, ARRAY['hst']::text[], NULL),
  ('pi-rail-25', 'Threshold rail 2.5 m (delivered)', 'Running rails', 'pcs', 600, 1.25, true, 'fixed', 1, ARRAY['hst']::text[], NULL),
  ('pi-rail-30', 'Threshold rail 3.0 m (delivered)', 'Running rails', 'pcs', 750, 1.25, true, 'fixed', 1, ARRAY['hst']::text[], NULL),
  ('pi-rail-37', 'Threshold rail 3.7 m (delivered)', 'Running rails', 'pcs', 900, 1.25, true, 'fixed', 1, ARRAY['hst']::text[], NULL);

-- Customer-facing add-ons (sale prices are public) -----------------------
create table public.addon_items (
  id text primary key,
  label text not null,
  hint text not null default '',
  kind text not null default 'extra',
  unit text not null default 'each',
  price numeric not null default 0,
  show_in_offer boolean not null default true,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

grant select on public.addon_items to anon;
grant select, insert, update, delete on public.addon_items to authenticated;
grant all on public.addon_items to service_role;
alter table public.addon_items enable row level security;

create policy "anyone reads active add-ons" on public.addon_items
  for select to anon, authenticated using (active);
create policy "owner reads all add-ons" on public.addon_items
  for select to authenticated using (public.is_owner(auth.uid()));
create policy "owner inserts add-ons" on public.addon_items
  for insert to authenticated with check (public.is_owner(auth.uid()));
create policy "owner updates add-ons" on public.addon_items
  for update to authenticated using (public.is_owner(auth.uid())) with check (public.is_owner(auth.uid()));
create policy "owner deletes add-ons" on public.addon_items
  for delete to authenticated using (public.is_owner(auth.uid()));

insert into public.addon_items (id, label, hint, kind, unit, price, show_in_offer, active)
values
  ('lock', 'Security lock', 'Key-locking handle set', 'extra', 'each', 250, true, true),
  ('warranty', 'Extended warranty', 'Each additional year beyond the standard warranty', 'extra', 'perYear', 150, true, true),
  ('gasket', 'Extra gasket', 'Third seal for wind-exposed openings', 'extra', 'each', 150, true, true),
  ('warmSpacer', 'Warm spacer', 'Warm edge instead of aluminium, less condensation at the glass edge', 'glass', 'perM2', 15, true, true),
  ('safetyOutside', 'Safety glass, outside', 'Toughened or laminated outer pane', 'glass', 'perM2', 40, true, true),
  ('safetyInside', 'Safety glass, inside', 'Toughened or laminated inner pane', 'glass', 'perM2', 40, true, true),
  ('solar039', 'Solar control, g 0.39', 'Light solar protection, keeps the room bright', 'glass', 'perM2', 12, true, true),
  ('solar035', 'Solar control, g 0.35', 'Balanced solar protection', 'glass', 'perM2', 18, true, true),
  ('solar029', 'Solar control, g 0.29', 'Strongest solar protection for south-facing rooms', 'glass', 'perM2', 26, true, true);
