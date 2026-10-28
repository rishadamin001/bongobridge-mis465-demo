-- Optional, unexecuted private PostgreSQL classroom fixture. Not a deployed migration.
-- No Supabase resource or public API is required. All records are generated.
BEGIN;
CREATE SCHEMA IF NOT EXISTS bongobridge_demo;
REVOKE ALL ON SCHEMA bongobridge_demo FROM PUBLIC;
CREATE TABLE IF NOT EXISTS bongobridge_demo.products (
 id text PRIMARY KEY CHECK(id ~ '^P[0-9]{3}$'), name text NOT NULL, brand text NOT NULL,
 category text NOT NULL, origin text NOT NULL,
 price_bdt numeric(12,2) NOT NULL CHECK(price_bdt>=0),
 weight_kg numeric(10,3) NOT NULL CHECK(weight_kg>0),
 length_cm numeric(10,3) NOT NULL CHECK(length_cm>0), width_cm numeric(10,3) NOT NULL CHECK(width_cm>0), height_cm numeric(10,3) NOT NULL CHECK(height_cm>0),
 description text NOT NULL
);
CREATE TABLE IF NOT EXISTS bongobridge_demo.orders (
 id text PRIMARY KEY CHECK(id ~ '^BB-DEMO-[0-9]{4,}$'),
 product_id text NOT NULL REFERENCES bongobridge_demo.products(id),
 customer_label text NOT NULL CHECK(customer_label LIKE 'Demo shopper %'),
 city text NOT NULL, status_index smallint NOT NULL CHECK(status_index BETWEEN 0 AND 5),
 quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 20), created_at timestamptz NOT NULL,
 amount_bdt numeric(12,2) NOT NULL CHECK(amount_bdt>=0),
 advance_bdt numeric(12,2) NOT NULL CHECK(advance_bdt>=0),
 later_bdt numeric(12,2) NOT NULL CHECK(later_bdt>=0),
 CHECK(advance_bdt+later_bdt=amount_bdt)
);
ALTER TABLE bongobridge_demo.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bongobridge_demo.orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA bongobridge_demo FROM PUBLIC;
-- Deliberately no browser grants or RLS policies; not an application backend.
INSERT INTO bongobridge_demo.products
(id,name,brand,category,origin,price_bdt,weight_kg,length_cm,width_cm,height_cm,description) VALUES
  ('P001','Fold Mini headphones','Auraloop','Electronics','China',1490,0.35,20,18,9,'A fictional catalog item illustrated with a real reference photograph. Over-ear headphones for a sample listening collection.'),
  ('P002','Transit compact keyboard','Keyfield','Electronics','China',2490,0.8,32,14,4,'A fictional catalog item illustrated with a real reference photograph. A compact everyday keyboard.'),
  ('P003','Frame One camera','Framewell','Electronics','USA',4990,0.45,22,18,15,'A fictional catalog item illustrated with a real reference photograph. A camera for an imaginary photography collection.'),
  ('P004','Weekender tote','North & Noon','Lifestyle','UK',590,0.4,32,25,5,'A fictional catalog item illustrated with a real reference photograph. A roomy two-tone canvas tote.'),
  ('P005','Arc everyday backpack','Trailform','Lifestyle','China',1290,0.65,38,28,8,'A fictional catalog item illustrated with a real reference photograph. A navy everyday backpack.'),
  ('P006','Coast canvas sneakers','Sunday Step','Fashion','India',1190,0.9,31,20,12,'A fictional catalog item illustrated with a real reference photograph. A low-top canvas sneaker.'),
  ('P007','Studio cotton shirt','Common Thread','Fashion','India',790,0.4,30,22,4,'A fictional catalog item illustrated with a real reference photograph. A blue cotton shirt.'),
  ('P008','Meadow everyday cap','Fieldday','Fashion','UK',390,0.15,24,20,10,'A fictional catalog item illustrated with a real reference photograph. An everyday cap.'),
  ('P009','Botanical hair treatment','Petal Lab','Beauty','USA',490,0.18,18,8,5,'A fictional catalog item illustrated with a real reference photograph. A sample hair-care treatment; no ingredient or efficacy claims.'),
  ('P010','Cloud daily moisturizer','Soft Ritual','Beauty','UK',690,0.3,18,8,7,'A fictional catalog item illustrated with a real reference photograph. A sample moisturizer; no ingredient or efficacy claims.'),
  ('P011','Halo desk light','Luma House','Home','China',890,0.7,35,20,16,'A fictional catalog item illustrated with a real reference photograph. An adjustable desk lamp.'),
  ('P012','Nest ceramic mug','Clay & Co.','Home','India',290,0.45,15,14,14,'A fictional catalog item illustrated with a real reference photograph. A simple ceramic mug.')
ON CONFLICT(id) DO NOTHING;
INSERT INTO bongobridge_demo.orders
(id,product_id,customer_label,city,status_index,quantity,created_at,amount_bdt,advance_bdt,later_bdt) VALUES
  ('BB-DEMO-1041','P001','Demo shopper A','Dhaka',0,1,'2026-10-21',2186,1043,1143),
  ('BB-DEMO-1042','P004','Demo shopper B','Chattogram',1,1,'2026-10-22',1580,413,1167),
  ('BB-DEMO-1043','P006','Demo shopper C','Sylhet',2,2,'2026-10-23',4316,1666,2650),
  ('BB-DEMO-1044','P002','Demo shopper D','Rajshahi',3,1,'2026-10-24',3400,1743,1657),
  ('BB-DEMO-1045','P011','Demo shopper E','Khulna',4,1,'2026-10-25',2832,623,2209),
  ('BB-DEMO-1046','P008','Demo shopper F','Dhaka',5,1,'2026-10-26',1478,273,1205)
ON CONFLICT(id) DO NOTHING;
COMMIT;
-- Study the four route/category-rate fixtures in seed.json and src/modules/pricing.js.
-- If an older teaching schema exists, use a new disposable local database for v2.
