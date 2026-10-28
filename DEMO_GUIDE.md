# MIS 465 classroom presentation — BongoBridge v2

The live experience has two areas: **Shop global** (imports into Bangladesh) and **For makers** (a Bangladesh-maker export operations simulation). Every record and transaction is fictional. No real money, identity verification, carrier booking, or customs filing is involved.

## 1. Explain the project

Open the home page. Point out the education disclaimer, the original evergreen/cream/lime design, animated route illustration, real reference photos, and maker-workspace entry. Explain that the architecture follows the supplied blueprint through modular domains while staying suitable for a free classroom deployment.

## 2. Demonstrate shopping and visible cart feedback

Open Shop global. Search for keyboard, switch categories/origins, and sort by price. Clear filters. Open Fold Mini headphones to inspect the photo and price breakdown.

Add it to the bag. Show the button confirmation, badge animation, moving thumbnail (unless reduced motion is enabled), and visible product-added panel. It contains the image, name, quantity, item value, and a direct bag/checkout button. Rapid additions update the same confirmation rather than losing the bag state.

Prices are generated BDT fixtures. The example headphone item is 1,490 taka. Its 70% sample item advance is 1,043 taka. The per-kilogram combined freight/customs figure, billable weight, and local delivery explain the later estimate. These are not SkyBuy's actual prices or current import charges.

## 3. Explain the two pricing models

The import model is:

    item cost + combined shipping/customs fixture + local delivery
    mock advance = 70% of item cost
    later estimate = full illustrative total - advance

No separate duty percentage is added on top of the combined freight/customs fixture.

Both import and export calculations can compare physical and dimensional weight:

    dimensional kg = length cm × width cm × height cm / 5000
    billable kg = the greater of actual kg and dimensional kg

Dimensions are for one sample unit, and the model scales them across quantity. It does not optimize real packing.

The export DDP illustration separately lists supplier value, platform margin, first mile, international freight, insurance, duty/VAT fixtures, broker fee, and last mile. FX fixtures use 120 BDT/USD, 132 BDT/EUR, and 156 BDT/GBP. Export monetary journals use integer minor units; FX and taxes are invented scenario values.

## 4. Run a successful payment simulation

Open the bag and continue to checkout. Review the sample advance and later balance, select a sample city/shipping method, then continue to demo payment.

Select bKash demo, Nagad demo, Rocket demo, Demo card, or Demo bank. The five familiar methods were adapted from your payment-gateway project's UI. No provider or temporary tunnel is contacted.

Continue to verification and enter only the displayed **000000**. Show the dedicated processing screen, method color, and final receipt. Click View my demo orders, then inspect the mock parcel ID. No real money was charged.

One successful active attempt creates its mock orders once. Payment success is not a backend-verified financial fact in this browser simulation.

## 5. Show unsuccessful results

Add another item and open a fresh checkout. Use Cancel payment to show the cancellation result. Return to the bag; items are retained.

For a decline: reach the verification step, enter 000000, expand Classroom testing controls, and choose Simulate declined payment. The declined result creates no shopping order and retains the bag.

For expiry: expand the same controls and choose Simulate timeout. An expired result is a separate screen. Again, the bag remains and nothing is charged.

## 6. Track a shopping parcel

Open the customer dashboard or Track a parcel. BB-DEMO-1044 is a seeded transit example. Show the timeline and open demo admin to advance a sample order. The milestones are local simulation events, not carrier tracking.

## 7. Start the maker export journey

Open For makers → Maker. Choose Riverbank jute shopper, a quantity, UK/USA/Germany, currency, and full/semi-managed model. Show the generated studio, Bengali/English label, physical attributes and complete DDP teaching quote. Submit to review.

The profiles contain no real NID, license, bank account, wallet or customer address. The role tabs demonstrate organizational responsibilities, not secure login.

## 8. Demonstrate human review

Open Broker. EX-DEMO-2002 is the low-confidence ceramic-mug scenario at 91%. Attempting approval without acknowledging human review is blocked. Check the classroom review acknowledgement and approve.

Preview the draft invoice/packing list. It is watermarked CLASSROOM SAMPLE / NOT VALID FOR TRADE. Downloading the HTML draft produces a teaching artifact, not a customs filing or carrier label. Record a mock document reference to satisfy the later workflow gate.

## 9. Verify the hub and consolidate

Open Warehouse. For a broker-approved consignment, enter measured weight and all three dimensions, then Verify hub intake. Show how the billable weight and export quote change.

Assign it to a destination master carton. A departure attempt is blocked if broker review, intake, consolidation, or the mock document is missing. With all four complete, simulate departure. Delivery is a later separate milestone.

## 10. Show a balanced supplier payout

Open Finance. Only eligible departed consignments can record a payout. Choose a demo bKash/Nagad/bank destination and record it. Show the processing/result screen and journal reference.

The debit to supplier payable equals the credit to wallet clearing. A repeated domain payout command is idempotent. No supplier transfer actually happens. The journal is a browser fixture and is not an immutable accounting database.

## 11. Run the automation demonstration

Open Automation. Run the generated listing pipeline to show enrichment → HS suggestion → compliance → documentation handoffs.

Choose the low-confidence mug to show human fallback. Choose Restricted material test fixture to show a blocked submission/document path. Explain that this is deterministic scenario logic, not live AI, sanctions screening, or legally correct HS classification. There are no model API calls or charges.

## 12. Explain the architecture and next phases

Use architecture/IMPLEMENTATION_PLAN.md to discuss the domain boundaries, requirement coverage, planned API adapters, PostgreSQL teaching model, command/event architecture, and staged roadmap. The blueprint's real-money gateways, secure authentication, KYC, legal compliance, carrier integrations and scale/SLA claims are not implemented as live infrastructure.

A key design lesson: policy must be versioned and verified. The blueprint's blanket US $800 duty-free assumption is outdated; the demo grants no automated exemption. All HS/tax/export-document fixtures require human review before any future operational use.

## Repeat the presentation

Use Reset demo data in the site footer to restore the shopping fixtures and clear the current payment history. Use Reset export scenario within For makers to restore generated makers, consignments, journals, and events. These resets affect only this project's browser state. Export JSON before resetting if you want to keep a sample classroom session.
