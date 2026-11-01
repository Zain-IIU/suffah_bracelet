-- =====================================================================
-- SUFFAH — database setup
-- Run this whole file ONCE in Supabase → SQL Editor → New query → Run.
-- It creates the tables, security rules, the order function and the
-- image storage bucket. It is safe to re-run.
-- =====================================================================

-- ---------- Helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Admins ----------
-- Which login accounts may use /admin.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Categories ----------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Products ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  price       integer not null check (price >= 0),          -- whole rupees
  sale_price  integer check (sale_price is null or sale_price >= 0),
  tag         text,                                          -- e.g. New, Bestseller
  is_active   boolean not null default true,                 -- shown in the shop
  is_featured boolean not null default false,                -- shown in the homepage hero
  in_stock    boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists products_active_sort_idx on public.products (is_active, sort_order, created_at desc);
create index if not exists products_category_idx on public.products (category_id);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------- Product images ----------
create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  path       text not null,           -- file name inside the product-images bucket
  alt        text not null default '',
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images (product_id, position);

-- ---------- Store settings (single row) ----------
create table if not exists public.settings (
  id                      integer primary key default 1 check (id = 1),
  delivery_fee            integer not null default 250 check (delivery_fee >= 0),
  free_delivery_threshold integer check (free_delivery_threshold is null or free_delivery_threshold >= 0),
  announcement            text not null default 'Free delivery on orders over Rs. 5,000 · Cash on delivery available',
  whatsapp_number         text not null default '',
  contact_email           text not null default '',
  instagram_url           text not null default '',
  updated_at              timestamptz not null default now()
);
insert into public.settings (id, free_delivery_threshold) values (1, 5000)
  on conflict (id) do nothing;

drop trigger if exists settings_updated_at on public.settings;
create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------- Orders ----------
create sequence if not exists public.order_number_seq start 10001;

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text not null unique default ('SF-' || nextval('public.order_number_seq')),
  status        text not null default 'new'
                check (status in ('new', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  customer_name text not null,
  phone         text not null,
  email         text,
  address       text not null,
  city          text not null,
  postal_code   text,
  gift_note     text,
  subtotal      integer not null default 0,
  delivery_fee  integer not null default 0,
  total         integer not null default 0,
  admin_notes   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_phone_created_idx on public.orders (phone, created_at desc);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,      -- copy at time of purchase
  unit_price   integer not null,   -- copy at time of purchase
  quantity     integer not null check (quantity between 1 and 20),
  line_total   integer not null
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------- place_order: the ONLY way a customer can create an order ----------
-- Prices are read from the database here, never trusted from the browser.
create or replace function public.place_order(
  p_customer_name text,
  p_phone         text,
  p_email         text,
  p_address       text,
  p_city          text,
  p_postal_code   text,
  p_gift_note     text,
  p_items         jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings     public.settings%rowtype;
  v_order_id     uuid;
  v_order_number text;
  v_requested    integer;
  v_matched      integer;
  v_recent       integer;
  v_subtotal     integer := 0;
  v_delivery     integer := 0;
  v_item         record;
begin
  -- Basic checks (the website also validates before calling this)
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty.';
  end if;
  if jsonb_array_length(p_items) > 30 then
    raise exception 'Too many different items in one order.';
  end if;
  if length(trim(coalesce(p_customer_name, ''))) < 2 then
    raise exception 'Please enter your full name.';
  end if;
  if length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) < 10 then
    raise exception 'Please enter a valid phone number.';
  end if;
  if length(trim(coalesce(p_address, ''))) < 8 then
    raise exception 'Please enter your full delivery address.';
  end if;
  if length(trim(coalesce(p_city, ''))) < 2 then
    raise exception 'Please enter your city.';
  end if;

  -- Simple protection against fake / spam orders: max 5 per phone per hour
  select count(*) into v_recent
  from public.orders o
  where o.phone = trim(p_phone) and o.created_at > now() - interval '1 hour';
  if v_recent >= 5 then
    raise exception 'Too many orders from this phone number. Please try again later or message us.';
  end if;

  -- Every requested bracelet must exist, be visible and in stock
  select count(distinct e->>'product_id') into v_requested
  from jsonb_array_elements(p_items) e;

  select count(*) into v_matched
  from public.products p
  where p.id in (select (e->>'product_id')::uuid from jsonb_array_elements(p_items) e)
    and p.is_active and p.in_stock;

  if v_matched <> v_requested then
    raise exception 'One or more items in your bag are no longer available. Please review your bag.';
  end if;

  select * into v_settings from public.settings where id = 1;

  insert into public.orders (customer_name, phone, email, address, city, postal_code, gift_note)
  values (
    trim(p_customer_name),
    trim(p_phone),
    nullif(trim(coalesce(p_email, '')), ''),
    trim(p_address),
    trim(p_city),
    nullif(trim(coalesce(p_postal_code, '')), ''),
    nullif(trim(coalesce(p_gift_note, '')), '')
  )
  returning id, order_number into v_order_id, v_order_number;

  for v_item in
    select p.id,
           p.name,
           case when p.sale_price is not null and p.sale_price < p.price then p.sale_price else p.price end as unit_price,
           least(sum(greatest(coalesce((e->>'quantity')::integer, 1), 1)), 20)::integer as qty
    from jsonb_array_elements(p_items) e
    join public.products p on p.id = (e->>'product_id')::uuid
    group by p.id, p.name, p.sale_price, p.price
  loop
    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
    values (v_order_id, v_item.id, v_item.name, v_item.unit_price, v_item.qty, v_item.unit_price * v_item.qty);
    v_subtotal := v_subtotal + v_item.unit_price * v_item.qty;
  end loop;

  if v_settings.free_delivery_threshold is not null and v_subtotal >= v_settings.free_delivery_threshold then
    v_delivery := 0;
  else
    v_delivery := coalesce(v_settings.delivery_fee, 0);
  end if;

  update public.orders
  set subtotal = v_subtotal, delivery_fee = v_delivery, total = v_subtotal + v_delivery
  where id = v_order_id;

  return jsonb_build_object(
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery,
    'total', v_subtotal + v_delivery
  );
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, text, text, text, jsonb) to anon, authenticated;

-- =====================================================================
-- Security rules (Row Level Security)
-- =====================================================================
alter table public.admins         enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.settings       enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

-- admins: a logged-in user can only check their own row
drop policy if exists "admins read own" on public.admins;
create policy "admins read own" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- categories: everyone reads, admins write
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (true);
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- products: everyone reads visible products, admins read and write all
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (is_active or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- product images: readable when the product is visible
drop policy if exists "product images public read" on public.product_images;
create policy "product images public read" on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin()))
  );
drop policy if exists "product images admin write" on public.product_images;
create policy "product images admin write" on public.product_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- settings: everyone reads, admins update
drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings for select using (true);
drop policy if exists "settings admin update" on public.settings;
create policy "settings admin update" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- orders + items: ONLY admins can see or change. Customers create them via place_order().
drop policy if exists "orders admin all" on public.orders;
create policy "orders admin all" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "order items admin all" on public.order_items;
create policy "order items admin all" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Image storage: public bucket "product-images", only admins upload/delete
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product images admin select" on storage.objects;
create policy "product images admin select" on storage.objects
  for select to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- ---------- API access (security rules above still decide which rows) ----------
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_images, public.settings to anon, authenticated;
grant select, insert, update, delete on public.admins, public.categories, public.products, public.product_images,
  public.settings, public.orders, public.order_items to authenticated;

-- ---------- Starter categories ----------
insert into public.categories (name, slug, sort_order) values
  ('Beaded', 'beaded', 1),
  ('Charms', 'charms', 2),
  ('Chains', 'chains', 3),
  ('Gift sets', 'gift-sets', 4)
on conflict (slug) do nothing;
