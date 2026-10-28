-- OPTIONAL, UNEXECUTED POSTGRESQL TEACHING MODEL. NOT A DEPLOYED MIGRATION.
-- Private schema. No browser role grants or API exposure. No real PII fields.
-- Production authorization, journal posting transactions, append-only triggers,
-- event outbox, identity, encryption and integration adapters remain separate work.
BEGIN;
CREATE SCHEMA IF NOT EXISTS bongobridge_enterprise_demo;
REVOKE ALL ON SCHEMA bongobridge_enterprise_demo FROM PUBLIC;

CREATE TABLE IF NOT EXISTS bongobridge_enterprise_demo.makers (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  demo_name text NOT NULL,
  locality text NOT NULL,
  operating_model text NOT NULL CHECK (operating_model IN ('full_consignment','semi_managed')),
  readiness_fixture jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id,id)
);

CREATE TABLE IF NOT EXISTS bongobridge_enterprise_demo.listings (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  maker_id uuid NOT NULL,
  version integer NOT NULL CHECK (version>0),
  title_en text NOT NULL,
  title_bn text,
  material text NOT NULL,
  origin_country char(2) NOT NULL DEFAULT 'BD',
  suggested_hs char(6) CHECK (suggested_hs ~ '^[0-9]{6}$'),
  fixture_confidence numeric(5,4) CHECK (fixture_confidence BETWEEN 0 AND 1),
  supply_bdt numeric(18,4) NOT NULL CHECK (supply_bdt>=0),
  gross_kg numeric(12,4) NOT NULL CHECK (gross_kg>0),
  length_cm numeric(12,4) NOT NULL CHECK (length_cm>0),
  width_cm numeric(12,4) NOT NULL CHECK (width_cm>0),
  height_cm numeric(12,4) NOT NULL CHECK (height_cm>0),
  review_status text NOT NULL DEFAULT 'draft',
  restricted_fixture boolean NOT NULL DEFAULT false,
  UNIQUE (tenant_id,id),
  FOREIGN KEY (tenant_id,maker_id) REFERENCES bongobridge_enterprise_demo.makers(tenant_id,id)
);

CREATE TABLE IF NOT EXISTS bongobridge_enterprise_demo.quote_snapshots (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  listing_id uuid NOT NULL,
  listing_version integer NOT NULL,
  quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 20),
  destination char(2) NOT NULL,
  currency char(3) NOT NULL,
  policy_version text NOT NULL,
  fx_version text NOT NULL,
  charges jsonb NOT NULL,
  total numeric(18,4) NOT NULL CHECK(total>=0),
  is_binding boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,id),
  FOREIGN KEY(tenant_id,listing_id) REFERENCES bongobridge_enterprise_demo.listings(tenant_id,id)
);

CREATE TABLE IF NOT EXISTS bongobridge_enterprise_demo.consignments (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  quote_id uuid NOT NULL,
  state text NOT NULL,
  broker_reviewed boolean NOT NULL DEFAULT false,
  hub_verified boolean NOT NULL DEFAULT false,
  measured_parcel jsonb,
  mock_document_ref text,
  master_carton_ref text,
  simulated_departure_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,id),
  FOREIGN KEY(tenant_id,quote_id) REFERENCES bongobridge_enterprise_demo.quote_snapshots(tenant_id,id)
);

CREATE TABLE IF NOT EXISTS bongobridge_enterprise_demo.journals (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  consignment_id uuid NOT NULL,
  currency char(3) NOT NULL,
  idempotency_key text NOT NULL,
  memo text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','posted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,id), UNIQUE(tenant_id,idempotency_key),
  FOREIGN KEY(tenant_id,consignment_id) REFERENCES bongobridge_enterprise_demo.consignments(tenant_id,id)
);

CREATE TABLE IF NOT EXISTS bongobridge_enterprise_demo.journal_lines (
  journal_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  line_no integer NOT NULL CHECK(line_no>0),
  account_code text NOT NULL,
  debit numeric(18,4) NOT NULL DEFAULT 0 CHECK(debit>=0),
  credit numeric(18,4) NOT NULL DEFAULT 0 CHECK(credit>=0),
  CHECK ((debit>0 AND credit=0) OR (credit>0 AND debit=0)),
  PRIMARY KEY(journal_id,line_no),
  FOREIGN KEY(tenant_id,journal_id) REFERENCES bongobridge_enterprise_demo.journals(tenant_id,id)
);
-- IMPORTANT: This teaching schema does not enforce aggregate journal balance.
-- Production posting must use a reviewed atomic posting function/transaction,
-- a deferred balance constraint, and append-only controls after status='posted'.

CREATE TABLE IF NOT EXISTS bongobridge_enterprise_demo.domain_events (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  aggregate_id uuid NOT NULL,
  aggregate_version bigint NOT NULL,
  event_type text NOT NULL,
  fixture_payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  UNIQUE(tenant_id,aggregate_id,aggregate_version)
);

ALTER TABLE bongobridge_enterprise_demo.makers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bongobridge_enterprise_demo.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bongobridge_enterprise_demo.quote_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bongobridge_enterprise_demo.consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bongobridge_enterprise_demo.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bongobridge_enterprise_demo.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bongobridge_enterprise_demo.domain_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA bongobridge_enterprise_demo FROM PUBLIC;
-- Deliberately no permissive RLS policies, service-role credentials, API grants,
-- KYC uploads, live financial identifiers or automatically exposed views.
COMMIT;
