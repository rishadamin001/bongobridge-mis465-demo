# BongoBridge v3 wholesale update

Live: https://rishadamin001.github.io/bongobridge-mis465-demo/
Repository: https://github.com/rishadamin001/bongobridge-mis465-demo

Updated on 29 October 2026 while preserving the existing theme and the Bangladesh-maker export workspace.

The catalog now has 36 generated product families, 115 photographic style choices and 368 style/size combinations. The wholesale detail page supports image variations, mixed size quantities, selection summaries, product information, related-product suggestions and a live air/sea cost estimate. All runtime photographs are local and credited.

The commerce domain keys each bag line by product/style/size. Quantities across one product unlock sample item discounts at 10 units (5%), 50 units (10%) and 100 units (15%), with whole-taka unit rounding. Different product IDs do not share a tier. Local delivery is counted once per product rather than per SKU line. The 70% advance uses the discounted item amount; the remaining estimate keeps freight/customs and delivery separate.

Import shopping permits at most 500 units per product across all choices; the separate export workflow retains its 20-unit scenario limit. Inventory limits, stock metadata, option photos, prices and purchases are educational fixtures, not real goods or availability claims. No fabricated real customer ratings or sales are added.

The suite contains 24 passing automated tests, including mixed-SKU aggregation, limits, price rounding, independent products, cart/order persistence, payment transitions, dimensional freight and export ledger gates. Browser checks covered mixed styles/sizes, air/sea and city selection, shared local delivery, successful mock checkout, reload persistence, invalid quantities, category browsing and 390-pixel mobile layout without horizontal overflow. No browser console errors were observed.

The README and classroom guide describe the new flow. The optional database/schema.sql model now uses a private v3 schema and includes all 36 catalog products, style/size choices, tier metadata, generated SKU combinations and six seeded orders. It is unexecuted, has RLS enabled and has no public API grants. No hosted database was provisioned.

No paid service, billing method, subscription, custom domain, API key, payment provider, carrier booking or AI model call was added. All payments and operations remain simulated, hosted as a static educational site. Production authentication, live inventory, legal compliance, official filings, immutable accounting and actual integrations remain future scope.

Editable source is src/; static publication output is docs/. No installation is needed: npm run check, npm test, npm run sync and npm run dev. The separate payment-gateway repository is unchanged.
