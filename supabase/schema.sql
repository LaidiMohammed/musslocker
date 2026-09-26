-- MUSSLOCKER Boutique — Supabase schema
-- Run in Supabase SQL Editor

-- Extensions for good search (trigram + full text)
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_fr text not null,
  name_ar text not null default '',
  desc_fr text default '',
  desc_ar text default '',
  price_dzd int not null check (price_dzd >= 0),
  old_price_dzd int,
  category text not null default 'sport',
  sizes text[] not null default '{M,L,XL}',
  colors text[] not null default '{Noir}',
  stock int not null default 50,
  images text[] not null default '{}',
  tiktok_url text default 'https://www.tiktok.com/@musslocker',
  active boolean not null default true,
  created_at timestamptz default now(),
  search_tsv tsvector generated always as (
    to_tsvector('simple', coalesce(name_fr,'') || ' ' || coalesce(name_ar,'') || ' ' || coalesce(desc_fr,'') || ' ' || coalesce(category,''))
  ) stored
);
create index if not exists products_search_idx on products using gin (search_tsv);
create index if not exists products_trgm_fr on products using gin (name_fr gin_trgm_ops);
create index if not exists products_trgm_ar on products using gin (name_ar gin_trgm_ops);
create index if not exists products_slug_idx on products (slug);
create index if not exists products_cat_idx on products (category) where active = true;

-- Orders (one row per checkout, items embedded + normalized)
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_code char(8) unique not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  wilaya text not null,
  commune text not null,
  address text not null,
  notes text default '',
  status text not null default 'nouvelle' check (status in ('nouvelle','confirmee','expediee','livree','annulee')),
  total_dzd int not null,
  qr_payload jsonb not null,
  created_at timestamptz default now()
);
create index if not exists orders_code_idx on orders (order_code);
create index if not exists orders_phone_idx on orders (phone);
create index if not exists orders_status_idx on orders (status);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  size text not null,
  color text not null,
  qty int not null check (qty > 0),
  unit_price int not null
);
create index if not exists order_items_order_idx on order_items (order_id);

-- Admins (link to auth.users)
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- RLS
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "public read active products" on products;
create policy "public read active products" on products for select using (active = true);

drop policy if exists "public insert orders" on orders;
create policy "public insert orders" on orders for insert with check (true);
drop policy if exists "public read own order by code" on orders;
create policy "public read own order by code" on orders for select using (true);

drop policy if exists "public insert items" on order_items;
create policy "public insert items" on order_items for insert with check (true);
drop policy if exists "public read items" on order_items;
create policy "public read items" on order_items for select using (true);

-- Admin full access via service_role bypasses RLS; add authenticated admin policies:
drop policy if exists "admin all products" on products;
create policy "admin all products" on products for all using (
  exists (select 1 from admins where admins.user_id = auth.uid())
);
drop policy if exists "admin all orders" on orders;
create policy "admin all orders" on orders for all using (
  exists (select 1 from admins where admins.user_id = auth.uid())
);

-- Storage bucket for product photos (create in Dashboard > Storage, name: products, public)
-- insert policy: authenticated upload, public read via bucket settings
