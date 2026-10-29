# MIS 465 presentation — BongoBridge v3 wholesale demo

The website has two areas: **Shop global** for imports into Bangladesh, and **For makers** for the generated Bangladesh-maker export workflow. Every item, price, quantity, transaction and shipment is a classroom simulation. No money, live inventory, real identity, carrier booking or customs filing is involved.

## 1. Introduce the expanded catalog

Open Shop global and show the original theme and education disclaimer. The catalog has **36 product families, 115 photographic style choices, and 368 style/size combinations**, across five categories. Search for a bag, filter by Lifestyle, change the source market and sort by price.

Explain that the photos are real references but the catalog identities, physical attributes, option sizes and stock limits are generated. Different photos can illustrate related style/model choices; they are not a promise of an identical manufactured SKU. Photo and license credits are bundled with the site. No fake customer reviews, sales counts or ratings are needed to make the demonstration credible.

## 2. Explore a wholesale product page

Open **Weekender tote & bag collection**. Use the gallery thumbnails and style/color choices to see the main photo change. Compare the large product photograph, option labels, specifications, collection information, and shipping/pricing details.

The size table lets you enter quantities for Small, Medium and Large. Try several Small pieces, switch to another style, and add Medium pieces there. Previously selected combinations stay in the selection summary. Remove one combination or clear the selection to demonstrate editing.

The **Suggestions** area offers related product families. Open one to compare it, then return. Recommendation order is deterministic and based on family/category; it is not AI personalization or an endorsement.

## 3. Show the bulk price thresholds

Use a single product and select a total of nine units. Increase it to ten, then fifty, then one hundred. Show the highlighted price tier, updated size-row unit prices, savings, sample advance and later balance.

| Total units of one product | Sample item discount |
| --- | --- |
| 1–9 | Standard price |
| 10–49 | 5% |
| 50–99 | 10% |
| 100–500 | 15% |

Styles and sizes of the same product share the threshold, including quantities already in the bag. Different product IDs are priced separately even if they look similar or have the same brand/category. Option price adjustments are included first, then the discount; each unit price rounds to a whole taka before multiplying quantity.

The import demo allows up to **500 units per product in total**. The limit is a generated test boundary, not actual stock. The maker-export workflow remains separately limited to **20 units**.

## 4. Explain freight and staged payment

The product summary supports sample air/sea methods and preset Bangladesh cities. Freight compares physical and dimensional weight:

    dimensional kg = length cm × width cm × height cm / 5000
    billable kg = greater of actual kg and dimensional kg

The product's dimensions are sample per-unit values; this model does not optimize real bulk packing. Size weight multipliers affect sample physical weight. Combined freight/customs is counted once in the model, without an additional duty percentage on top.

    illustrative import total = discounted items + mock freight/customs + local delivery
    sample advance = 70% of discounted item value
    remaining estimate = illustrative total - advance

**Local delivery is charged once for each product**, rather than once for every color/size line. Multiple product IDs have separate sample delivery charges. Freight, customs and delivery figures are invented and are not SkyBuy prices, current import advice, or binding quotes.

## 5. Add mixed combinations to the bag

Click **Add selected pieces to bag**. Point out the image/name/quantity confirmation and animated badge; reduced-motion users receive the same information without the flight animation. Open the bag and show that style/size combinations remain separate lines.

Change or remove one combination. The other combinations remain intact, and all units of the same product are repriced together if the total crosses a threshold. Add a related but different product to show that it receives its own tier. **Buy now** enters the same simulated checkout path after adding the current selection.

## 6. Complete a successful PayBD simulation

Review the bag and checkout. The discounted item total, sample advance and later estimate remain consistent with the selected styles/sizes. Choose a city and shipping method, then continue to demo payment.

Choose bKash demo, Nagad demo, Rocket demo, Demo card or Demo bank. Enter only the displayed fake practice code **000000**. Show the processing transition and successful result screen, then return to the generated parcel orders. Option labels, quantity, unit price and tier are preserved as dummy order snapshots. No provider or temporary tunnel is contacted, and no real money is charged.

## 7. Demonstrate failed, cancelled and expired attempts

Start another checkout. Cancel it and return to the preserved bag. For a decline, reach verification, enter 000000, open Classroom testing controls and simulate a declined payment. For timeout, use Simulate timeout. Each has a distinct result screen, retains the bag and creates no successful shopping order.

Payment history records the simulated method, amount, status and reference, without storing OTPs, PINs, cards or account details. The browser flow is not backend-verified financial processing.

## 8. Track a parcel

Open the demo customer dashboard or Track a parcel. BB-DEMO-1044 is a seeded transit example. Show a generated order's style/size information, quantity and cost snapshot, then advance a dummy shipment through the open demo admin view. No carrier tracking is connected.

## 9. Walk through maker export operations

Open For makers → Maker. Choose a generated Bangladesh-maker listing, quantity, UK/USA/Germany and display currency. Show the DDP teaching quote and full/semi-managed model. Export scenarios still use the 20-unit limit; wholesale import tiers do not apply here.

The export illustration separately lists supplier value, margin, first mile, freight, insurance, duty/VAT fixtures, broker fee and last mile. Fixed FX fixtures are 120 BDT/USD, 132 BDT/EUR and 156 BDT/GBP. Submit to broker review.

## 10. Review, measure, consolidate and depart

In Broker, EX-DEMO-2002 demonstrates a 91% fixture confidence requiring human acknowledgement. Review the scenario and approve it. Preview the invoice/packing-list draft, which is watermarked **CLASSROOM SAMPLE / NOT VALID FOR TRADE**, then record a mock document reference.

In Warehouse, record measured weight and all three dimensions for an approved consignment. Verify intake, assign a master carton, and simulate departure. Missing review, intake, consolidation or mock documents blocks departure. These are responsibility demos, not secure authentication or actual customs approval.

## 11. Show a simulated payout and automation handoff

In Finance, choose an eligible departed consignment and a generated bKash/Nagad/bank destination. Record its payout and inspect the processing/result screen. The supplier-payable debit equals the wallet-clearing credit. Repeated payout commands do not duplicate the journal; no money moves.

In Automation, run enrichment → HS suggestion → compliance → documentation with a normal fixture, low-confidence fixture and restricted-material fixture. Explain that these are deterministic rules, not live AI or legally authoritative HS classification. No model API or paid service runs.

## 12. Explain architecture, limits and verification

Use README.md and architecture/IMPLEMENTATION_PLAN.md to explain the modular storefront, SKU/bulk commerce domain, pricing, payments, export commands and browser adapter. The SQL files are optional, private, unexecuted teaching models, not a hosted database or working production API.

The test suite has **24 passing automated tests** covering mixed-SKU thresholds, quantity limits, separate-product discounts, rounding, cart/order persistence, pricing, payment transitions and balanced export payout gates. The live environment remains a browser-local demo. Real authentication, tenant isolation, verified stock, live policy, official filings, real carriers/gateways, immutable records and scale/SLA guarantees are future work requiring a new approved scope.

## Repeat the presentation

Use Reset demo data in the footer to restore the shopping fixtures and current payment history. Use Reset export scenario within For makers to restore only that workspace. Export sample JSON before resetting if you want to keep a classroom session. No billing setup, secret or paid service is needed for any step.
