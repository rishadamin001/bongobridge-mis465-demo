# BongoBridge v3 — MIS 465 wholesale commerce demo

Live website: https://rishadamin001.github.io/bongobridge-mis465-demo/

BongoBridge combines global shopping into Bangladesh with a Bangladesh-maker export workspace. The wholesale storefront preserves the evergreen, cream, and lime theme while adding photographic style choices, quantities by size, bulk price tiers, and related-product suggestions.

**Educational demonstration only. Products, prices, makers, quantities, shipping events, policy calculations, and transactions are generated scenarios. No real money moves. No paid service, billing method, secret, or API key is required.**

The original design is inspired by end-to-end commerce sites. BongoBridge is not affiliated with Baozun, SkyBuy, any photographer, product brand, retailer, bank, wallet, or carrier. Real reference photos illustrate fictional product families; they do not establish the same manufactured SKU or actual stock.

## What works

- **36 generated product families**, **115 photographic style choices**, and **368 style/size combinations** across Electronics, Lifestyle, Fashion, Beauty, and Home. Photos are locally bundled with attribution and license credits.
- A wholesale product page with large image/gallery, style/color choices, size-by-size quantity controls, selected-combination summary, specifications, and a live shipping/payment estimate.
- Mixed styles and sizes in one product order. A cart line is identified by product + style + size, so changing one combination does not overwrite another.
- Per-product bulk tiers: **1–9 units: standard**, **10–49: 5% off**, **50–99: 10% off**, and **100–500: 15% off** the sample item price. Quantities aggregate across styles/sizes of the same product, including the bag; different product IDs do not share a tier.
- The sample discounted unit price rounds to a whole taka before multiplication. Size/option surcharges are included before the percentage discount. Freight is separate; the mock local-delivery charge is counted **once per product**, even with several SKU lines.
- Related-product suggestion boxes that prioritize the same product family and category, without invented ratings, sales counts, or customer reviews.
- Search, category/origin filters, sorting, bag edits, clear image/name/quantity add-to-bag confirmation, button/badge/flight animation, and reduced-motion support.
- Staged BDT pricing: 70% of discounted item value as a sample advance, later balance, combined mock freight/customs, local delivery, and actual-versus-dimensional shipping weight.
- Minimal PayBD checkout adapted from your payment-gateway repository: card/bKash/Nagad/Rocket/bank choices, displayed fake code 000000, processing, paid/failed/cancelled/expired result screens. No actual provider is connected.
- Sample parcel tracking, customer demo admin, and Maker/Warehouse/Broker/Finance/Automation workspaces with DDP teaching quotes, human-review gates, measured intake, consolidation, draft documents, balanced payout journals, and event history.

## Quantity boundaries

The import-shopping demo supports up to **500 units per product across all styles and sizes**. `stockPerSku: 500` is a generated classroom limit, not a real inventory promise. The separate maker-export workflow intentionally retains its **20-unit** scenario limit. No real MOQ, availability, manufacturing specification, certificate, or delivery commitment is asserted.

## Start here

- [Implementation plan](architecture/IMPLEMENTATION_PLAN.md): architecture, original blueprint mapping, wholesale extension, production boundaries and phased roadmap.
- [Classroom walkthrough](DEMO_GUIDE.md).
- [Minimal payment-project adaptation](architecture/PAYMENT_INTEGRATION.md).
- [Planned backend API contracts](architecture/API_CONTRACTS.md): documentation, not deployed endpoints.
- [Photo credits](src/assets/products/CREDITS.txt).

## Source organization

`src/` is editable source and `docs/` is synchronized static publication output. `src/modules/commerce.js` owns SKU resolution, bulk thresholds, cart totals, and recommendations; `product-page.js` presents the wholesale experience. Other modules separate pricing, payments, export workflow, workspaces, and motion. `database/` contains generated fixtures and optional private-schema SQL teaching models. `scripts/` provides dependency-free checks and synchronization; `tests/` verifies calculations, limits, persistence, transitions, and ledger invariants.

## Run and verify

No package installation is needed. With Node.js and Python available:

    npm run check
    npm test
    npm run dev

Open http://localhost:4173 . The current suite contains **24 passing automated tests**, including mixed-SKU tier aggregation, distinct-product discounts, quantity bounds, cart persistence, dimensional pricing, payment transitions, and balanced payout gates.

After source changes, run `npm run sync` to copy source into `docs/`, then publish the public repository's `main` branch `/docs` folder using the existing free GitHub Pages configuration. No custom domain, paid hosting, function, database, model API, or gateway account is needed. GitHub Pages educational limits apply: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## Simulation, privacy and production boundaries

State is per-browser local storage, not a shared backend. Workspace roles are openly selectable personas, not secure login or tenant isolation. The displayed practice code is not an authentication control. Journals/events are editable browser data, not immutable accounting records. No current legal export eligibility, official trade document, carrier AWB, or customs filing is asserted.

Only preset shoppers, sample cities and generated maker profiles are used. No names, home addresses, passwords, NIDs, cards, wallet numbers, real OTPs or financial credentials are requested. Runtime photographs are local; no analytics or external application API calls run. The host may retain its usual infrastructure access logs.

Shopping state remains compatible with older dummy bags by assigning their missing style/size to the product's first option. Historical order amounts remain snapshots; reset restores current fixtures. Reset shopping data from the footer, and reset export scenarios separately within For makers.

Production authentication, verified live stock/pricing, real gateways/carriers, current tariff data, KYC, customs filing, live AI, load targets, and service-level guarantees require a separately approved backend scope and cost review. None is silently activated by this demo.

## SQL teaching files

`database/seed.json` is the canonical catalog fixture. `database/schema.sql` is an **unexecuted v3 PostgreSQL teaching model** generated from the same 36 products, 115 styles, size choices, bulk tiers, and six seeded orders. It uses a new private `bongobridge_demo_v3` schema to avoid colliding with earlier exercises, enables RLS, and exposes no browser API policies or grants. `enterprise-schema.sql` remains the separate export/ledger reference model. These files do not connect the website to Supabase or any hosted database, and no Supabase resource was provisioned.
