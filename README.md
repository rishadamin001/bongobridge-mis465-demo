# BongoBridge v2 — MIS 465 course demo

Live website: https://rishadamin001.github.io/bongobridge-mis465-demo/

BongoBridge combines global shopping into Bangladesh with a Bangladesh-maker export workspace. It is an original, noncommercial classroom simulation inspired by end-to-end commerce sites. It is not affiliated with Baozun, SkyBuy, any photographer, product brand, retailer, bank, wallet, or carrier.

**All products, prices, makers, orders, shipping events, policy calculations, and transactions are generated scenarios. No real money moves. No paid service, billing method, secret, or API key is required.**

## What works

- A recognizable photo for every catalog product, with bundled files and credits.
- Search, categories, origin filters, sorting, bag quantity/removal, clear image/name/quantity add-to-bag confirmation, button/badge/flight animation, and reduced-motion support.
- SkyBuy-inspired pricing presentation: BDT item price, 70% sample item advance, later balance, combined mock freight/customs, local delivery, and dimensional-weight calculation.
- Minimal PayBD checkout adapted from your payment-gateway repository: card/bKash/Nagad/Rocket/bank choices, displayed fake code 000000, processing, paid/failed/cancelled/expired screens. No actual provider integration.
- Sample parcel tracking and a customer demo admin view.
- Maker, Warehouse, Broker, Finance, and Automation workspaces with generated records.
- Export DDP teaching quotes across BDT/USD/EUR/GBP, dimensions/materials/HS fixtures, human review, warehouse measurement, consolidation, departure gates, draft documents, simulated payout journals, and event history.

## Start here

- [Thorough implementation plan](architecture/IMPLEMENTATION_PLAN.md): architecture, blueprint mapping, implemented versus deferred behavior, phased roadmap and cost guardrails.
- [Classroom walkthrough](DEMO_GUIDE.md).
- [Minimal payment-project adaptation](architecture/PAYMENT_INTEGRATION.md).
- [Planned backend API contracts](architecture/API_CONTRACTS.md): documentation, not deployed endpoints.
- [Photo credits](src/assets/products/CREDITS.txt).

## Structure

src/ is the editable source; docs/ is the identical static publication output. src/modules/ separates pricing, payment simulation, export workflow, workspace presentation, and motion. database/ contains generated data and optional private-schema SQL teaching models. scripts/ has dependency-free checks and publication synchronization. tests/ covers calculations, state gates, persistence and ledger invariants.

## Run and verify

No package install is necessary. With Node.js and Python available:

    npm run check
    npm test
    npm run dev

Open http://localhost:4173 .

After source changes:

    npm run sync

Publish the public repository's main branch /docs folder with the existing free GitHub Pages configuration. No custom domain, paid hosting, Worker, database, model API, or gateway account is needed. GitHub Pages free educational limits apply: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## What is simulated

Browser storage provides per-device persistence only. Workspace roles are openly selectable classroom personas, not secure authentication or production tenant isolation. Payment verification uses a displayed fake code and is not an authentication control. The event log and journals can be edited through browser storage; they are not immutable production records. No current legal export eligibility, real duty-free threshold, official document, AWB, or customs filing is asserted.

The blueprint's production targets (microservices, 99.95% SLA, load at 1,500 requests/second, PCI-DSS, encrypted KYC, live FX, tariff engines, carrier bookings, and actual supplier transfers) are future work requiring a separate scope, verified providers/law, server implementation and cost approval. See the plan before connecting anything live.

## Dummy data and privacy

Only preset shoppers, sample cities, and generated maker profiles are used. No names, home addresses, passwords, NIDs, cards, wallet numbers, real OTPs, or financial credentials are requested. All runtime photographs are local; there are no analytics or external application API calls. The host may retain its ordinary infrastructure access logs.

Reset shopping data from the footer; reset the export scenario inside the maker workspace. The operations reset does not change the shopping bag. The previous shopping storage key is retained for existing demo sessions; old mock order amounts are historical snapshots, and reset restores the current pricing fixtures.

## Database files

seed.json is the catalog fixture. schema.sql and enterprise-schema.sql are optional, unexecuted PostgreSQL teaching models in private schemas with RLS enabled and no browser API grants. They do not connect the site to Supabase or any hosted database, and they do not implement complete production ledger/security controls. No Supabase resource has been created.
