-- BongoBridge | MIS 465 | optional relational modelling exercise only.
-- Not deployed or used by the website. All records are fictional.
-- Run manually only in a disposable, separate learning database if desired.
-- No API key or hosted database is needed to use the static demo.
-- Deliberately private: no public schema tables, public API policies or grants.

begin;

create schema if not exists bongobridge_demo;
revoke all on schema bongobridge_demo from public;

create table if not exists bongobridge_demo.products (
  id text primary key check (id ~ '^P[0-9]{3}$'),
  name text not null,
  brand text not null,
  category text not null check (category in ('Electronics', 'Lifestyle', 'Fashion', 'Beauty', 'Home')),
  origin text not null check (origin in ('China', 'USA', 'UK', 'India')),
  price_usd numeric(10,2) not null check (price_usd >= 0),
  weight_kg numeric(6,3) not null check (weight_kg > 0),
  description text not null,
  accent text not null check (accent ~ '^#[0-9a-fA-F]{6}$'),
  tag text not null
);

create table if not exists bongobridge_demo.orders (
  id text primary key check (id ~ '^BB-DEMO-[0-9]{4,}$'),
  product_id text not null references bongobridge_demo.products(id),
  customer_label text not null check (customer_label like 'Demo shopper %'),
  city text not null check (city in ('Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh')),
  status_index smallint not null check (status_index between 0 and 5),
  quantity integer not null check (quantity between 1 and 20),
  created_at date not null,
  amount_bdt numeric(12,2) not null check (amount_bdt >= 0)
);

create table if not exists bongobridge_demo.shipping_lanes (
  origin text primary key check (origin in ('China', 'USA', 'UK', 'India')),
  destination text not null default 'Bangladesh' check (destination = 'Bangladesh'),
  hub text not null,
  air_rate_per_kg_bdt numeric(10,2) not null check (air_rate_per_kg_bdt >= 0),
  sea_rate_per_kg_bdt numeric(10,2) not null check (sea_rate_per_kg_bdt >= 0),
  minimum_kg numeric(6,3) not null check (minimum_kg > 0),
  air_transit_days text not null,
  sea_transit_days text not null,
  mode text not null
);

alter table bongobridge_demo.products enable row level security;
alter table bongobridge_demo.orders enable row level security;
alter table bongobridge_demo.shipping_lanes enable row level security;
-- No policies: ordinary roles cannot read or mutate the rows.
-- The owner can inspect this data in their database editor for class.
revoke all on all tables in schema bongobridge_demo from public;

insert into bongobridge_demo.products
  (id, name, brand, category, origin, price_usd, weight_kg, description, accent, tag)
values
  ('P001','Fold Mini headphones','Auraloop','Electronics','China',42,0.350,'Compact fictional headphones.','#dfefda','Demo bestseller'),
  ('P002','Transit 65 keyboard','Keyfield','Electronics','China',58,0.800,'Fictional compact mechanical keyboard.','#ede8de','New arrival'),
  ('P003','Pocket One camera','Framewell','Electronics','USA',89,0.450,'Fictional pocket digital camera.','#e4e9ef','Editor''s pick'),
  ('P004','Weekender tote','North & Noon','Lifestyle','UK',24,0.400,'Fictional canvas tote.','#f1e7d5','Lightweight'),
  ('P005','Arc everyday backpack','Trailform','Lifestyle','China',38,0.650,'Fictional everyday backpack.','#e0e8dc','Everyday essential'),
  ('P006','Coast canvas sneakers','Sunday Step','Fashion','India',32,0.900,'Fictional canvas sneakers.','#ede5dc','Demo favorite'),
  ('P007','Studio cotton overshirt','Common Thread','Fashion','India',29,0.400,'Fictional cotton overshirt.','#dae5d7','New arrival'),
  ('P008','Meadow linen cap','Fieldday','Fashion','UK',18,0.150,'Fictional linen cap.','#eee8d8','Small parcel'),
  ('P009','Dew daily serum','Petal Lab','Beauty','USA',22,0.180,'Illustrative bottle; no efficacy claims.','#e8e4f1','Demo discovery'),
  ('P010','Cloud travel care kit','Soft Ritual','Beauty','UK',26,0.300,'Fictional travel care kit.','#f2e4df','Travel size'),
  ('P011','Halo desk light','Luma House','Home','China',35,0.700,'Fictional desk lamp.','#f0e9d9','Workspace edit'),
  ('P012','Nest ceramic mug','Clay & Co.','Home','India',14,0.450,'Fictional ceramic mug.','#e7e9df','Home favorite')
on conflict (id) do nothing;

insert into bongobridge_demo.orders
  (id, product_id, customer_label, city, status_index, quantity, created_at, amount_bdt)
values
  ('BB-DEMO-1041','P001','Demo shopper A','Dhaka',0,1,'2026-10-21',6503),
  ('BB-DEMO-1042','P004','Demo shopper B','Chattogram',1,1,'2026-10-22',4131),
  ('BB-DEMO-1043','P006','Demo shopper C','Sylhet',2,2,'2026-10-23',10566),
  ('BB-DEMO-1044','P002','Demo shopper D','Rajshahi',3,1,'2026-10-24',9252),
  ('BB-DEMO-1045','P011','Demo shopper E','Khulna',4,1,'2026-10-25',5940),
  ('BB-DEMO-1046','P008','Demo shopper F','Dhaka',5,1,'2026-10-26',3197)
on conflict (id) do nothing;

insert into bongobridge_demo.shipping_lanes
  (origin, destination, hub, air_rate_per_kg_bdt, sea_rate_per_kg_bdt, minimum_kg, air_transit_days, sea_transit_days, mode)
values
  ('China','Bangladesh','Guangzhou',750,280,0.5,'8–12','25–40','Demo air / sea'),
  ('USA','Bangladesh','New Jersey',1150,450,0.5,'12–18','25–40','Demo air / sea'),
  ('UK','Bangladesh','London',1050,400,0.5,'10–15','25–40','Demo air / sea'),
  ('India','Bangladesh','Kolkata',600,240,0.5,'5–8','12–18','Demo air / sea')
on conflict (origin) do nothing;

comment on schema bongobridge_demo is 'MIS 465 educational dummy dataset. No production use or real customer data.';
comment on table bongobridge_demo.orders is 'Classroom-only fictional orders. Not connected to the static website.';

commit;

-- Example read-only classroom queries (run as database owner):
-- select category, count(*) from bongobridge_demo.products group by category;
-- select o.id, p.name, o.city, o.status_index
-- from bongobridge_demo.orders o
-- join bongobridge_demo.products p on p.id = o.product_id;
-- select city, sum(amount_bdt) as fictional_order_value
-- from bongobridge_demo.orders group by city;
