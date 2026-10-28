# BongoBridge presentation guide

**MIS 465 · educational simulation · dummy data only**

This guide supports a five-to-seven-minute classroom demonstration of a Bangladesh-focused shopping proxy. It explains both the visitor experience and the system concepts behind it. The site is an original educational project and is not associated with Baozun or any real logistics business.

## Suggested walkthrough

1. **Introduce the problem.** A shopper wants to understand how goods from another country might reach Bangladesh through an intermediary. Explain the distinction between a product supplier, a shopping proxy, an origin warehouse, international transport, and local delivery.
2. **Show the landing page.** Point out the service proposition, navigation, clear course-demo disclaimer, and responsive layout.
3. **Explore generated products.** Open "Shop global", search the catalog, filter by category/origin, and change the sort. Add an imaginary product to the bag. Explain that product names, brands, inventory, and prices are invented.
4. **Estimate a shipment.** Change the country, weight, and transport mode in the shipping estimator. Show how the displayed amount changes. Explain that the rates are fixed mock constants, not live foreign-exchange, freight, or customs data.
5. **Create a simulated request.** Complete the bag's simulated checkout, then show the "Buy for me" form with a preset sample product and destination. Explain that no purchase or payment is made. The resulting request exists only in this browser; no real product URL or personal details are needed.
6. **Track an order.** Use a seeded demonstration order ID. Explain how its status represents one stage in a simple fulfillment process. An invalid ID should produce a clear empty/error state, not an invented delivery record.
7. **Open the dashboard demo admin view.** Show generated orders, advance a status, and export the dummy records as JSON. Explain how an admin change updates the corresponding customer-facing timeline in the same browser. This is a classroom UI with no security boundary or real administrator identity.
8. **Discuss persistence and reset.** Reload to show browser-local state. Then reset the demo or clear this site's browser storage to restore a clean presentation. Local changes on one device do not update another device.

## Seeded dataset

The standalone `database/seed.json` teaching file contains:

| Entity | Count | Example |
| --- | --- | --- |
| Products | 12 | `P001` — Fold Mini headphones by the fictional Auraloop brand. |
| Orders | 6 | `BB-DEMO-1041` — Demo shopper A, Dhaka. |
| Origin lanes | 4 | China, USA, UK, and India to Bangladesh. |

The browser catalog is generated from mock data. The SQL and JSON files are also useful as independent relational-model examples; they do not establish a remote database connection.

## Illustrative order state model

The standalone dataset uses a six-step sequence:

| Index | Status | Meaning in the classroom model |
| --- | --- | --- |
| 0 | Request received | The proxy has received the simulated shopper's request. |
| 1 | Purchased | The imaginary supplier purchase has been marked complete. |
| 2 | At origin hub | The sample parcel has reached the fictional consolidation hub. |
| 3 | In transit | The sample parcel is moving internationally. |
| 4 | Customs simulation | The sample parcel has entered an imaginary destination review step. |
| 5 | Delivered | The sample parcel is marked delivered. |

These are state labels, not live events. In a real system, authenticated staff or signed carrier events would drive transitions and preserve an audit history. The demo intentionally simplifies this to make the concept visible during class.

## Cost-model discussion

A simple teaching model can represent landed cost as:

```text
mock product value in BDT (USD price × quantity × 120)
+ mock international freight (billable kg × lane/mode rate)
+ mock proxy-service fee (5% of product value)
+ mock duties allowance (15% of product value)
+ mock local delivery (80 BDT to Dhaka; 150 BDT to other demo cities)
= illustrative total
```

The teaching dataset uses an invented fixed conversion of **120 BDT per USD**. Weights are rounded **up** to the next half-kilogram with a **0.5 kg** minimum. Percentage fees are rounded separately to whole taka.

| Mock lane | Air BDT/kg | Sea BDT/kg | Air days | Sea days |
| --- | --- | --- | --- | --- |
| China → Bangladesh | 750 | 280 | 8–12 | 25–40 |
| USA → Bangladesh | 1150 | 450 | 12–18 | 25–40 |
| UK → Bangladesh | 1050 | 400 | 10–15 | 25–40 |
| India → Bangladesh | 600 | 240 | 5–8 | 12–18 |

For one P001 headphone item to Dhaka by air, the model produces `5040 + 375 + 252 + 756 + 80 = 6503 BDT`. These constants are not market quotes, customs rates, or carrier commitments. No amount displayed is charged to anyone.

## Relational database discussion

The optional SQL model demonstrates:

- **Primary keys:** a product or order has a unique identifier.
- **Foreign keys:** each seeded order points to a product.
- **Validation:** quantities and weights must be positive; status indexes are restricted.
- **Normalization:** shipping-lane data is stored once rather than repeated in each product.
- **Aggregation:** orders can be grouped by city or products by category.
- **Access control:** a private schema and row-level security prevent accidental public API access.

Example classroom questions:

1. Which categories contain the most mock products?
2. Which cities have the largest fictional order value?
3. What additional order-items table would be needed for a multi-product order?
4. How would an audit log record a status change?
5. Why is a browser-visible admin page insufficient for a real business?

`schema.sql` is optional and is not executed by the website. Study it as a file without deploying anything. If an instructor chooses to run it, use a separate disposable database, inspect its free-plan status first, and never add cloud secrets to browser code.

## Explain the zero-billing design

The project needs only static hosting and the visitor's browser. It does not make paid API calls, run a persistent application server, provision a hosted database, collect payment details, register a domain, or require a billing method. The intended online host is a public GitHub Pages repository on GitHub Free, within its service limits.

The no-cost design comes from keeping the entire exercise a static simulation. A production shopping-proxy service would require a different architecture and its own hosting, security, legal, carrier, payments, and operating-cost decisions.

## Limitations to state honestly

- Orders are device-local mock records and are not shared across browsers.
- There is no real login, administrator authorization, stock management, payment, courier integration, or procurement.
- No real product URL is fetched and no merchant order is submitted.
- All delivery statuses, rates, dates, and calculations are simulated.
- Fictional product labels do not establish an affiliation with any actual business.
- Browser storage can be cleared, blocked, or lost. This is not a durable business database.
- A public repository exposes all source and dummy data; secrets and real customer details must never be added.

## Reset before class

Use the dashboard's demo reset control. Alternatively, open your browser's site settings for the demo URL and clear its local site data, then reload. This deletes only the copy stored in that browser. A fresh browser profile also starts with the seeded demonstration state.
