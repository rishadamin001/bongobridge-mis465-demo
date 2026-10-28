# Planned server contracts — not deployed endpoints

This document defines the boundary for a later backend. The current website runs in browser demo mode and makes none of these requests.

All future operations require TLS and server-side authorization. Derive `tenant_id` and roles from a verified session, never from a role field or browser workspace tab. Use currency minor units for messages, SQL `NUMERIC(18,4)` where appropriate, and currency-specific rounding rules.

| Endpoint | Intended behavior | Required invariant |
| --- | --- | --- |
| `GET /v1/catalog?market=import|export` | Localized, paginated public catalog. | Publish only reviewed listing versions; omit private seller data. |
| `POST /v1/quotes` | Quote items, package dimensions, destination, currency. | Server-priced line items, versioned policy/FX, immutable snapshot, explicit expiry and estimate/guarantee status. |
| `POST /v1/orders` | Accept a valid quote and reserve inventory. | `Idempotency-Key`, atomic reservation, tenant ownership, no client-controlled price. |
| `POST /v1/payments` | Create provider sandbox session for an order. | Server amount/currency, quote expiry, no card or OTP in application storage. |
| `POST /v1/webhooks/payments/{adapter}` | Ingest signed provider state. | Verify signature/raw body, timestamp tolerance, event uniqueness and allowed transition; one settlement per payment. |
| `POST /v1/maker/listings` | Draft structured listing and physical attributes. | Maker owns tenant; private documents go to encrypted storage through a separate access path. |
| `POST /v1/compliance/reviews` | Record broker review of classification/material/documents. | Broker scope, listing/policy versions, reason/evidence; restricted listings cannot auto-pass. |
| `POST /v1/warehouse/intake` | Record measured dimensions, weight, QC. | Warehouse scope, reviewed consignment, unit bounds, quote delta and audit event. |
| `POST /v1/consolidations` | Assign compatible consignments to master shipment. | Destination/model constraints, locking, capacity checks, unique assignment. |
| `POST /v1/documents/drafts` | Produce a document draft from verified attributes. | Draft status distinct from official filing; no claimed carrier validity. |
| `POST /v1/webhooks/carriers/{adapter}` | Normalize parcel milestones. | Signature/replay protection, carrier/tracking ownership, monotonic state transitions. |
| `POST /v1/settlements` | Recognize supplier liability after required events. | Export departure and actual customs evidence, balanced currency journals, transactional outbox. |
| `POST /v1/payouts` | Queue a permitted payout. | Finance scope, settled liability, destination verification, risk/limit check, unique idempotency key. |
| `GET /v1/audit/events` | Tenant-scoped event view. | Append-only server records, redacted sensitive payloads, role filtering. |

Example future quote contract:

```json
{
  "quote_id": "server-generated-uuid",
  "market": "export",
  "currency": "GBP",
  "policy_version": "reviewed-policy-id",
  "fx_version": "rate-snapshot-id",
  "expires_at": "UTC ISO timestamp",
  "items": [{"listing_id": "id", "version": 3, "quantity": 2}],
  "parcel": {"actual_kg": "0.800", "volumetric_kg": "1.600", "billable_kg": "1.600"},
  "charges_minor": {"goods": 0, "first_mile": 0, "freight": 0, "insurance": 0, "duty": 0, "vat": 0, "brokerage": 0, "last_mile": 0},
  "total_minor": 0,
  "is_binding": false,
  "requires_broker_review": true
}
```

This is a schema example, not a real quote. A future provider adapter should implement `quote`, `createSession`, `verifyWebhook`, `getStatus`, and `normalizeEvent` behind typed interfaces; the domain should not depend on an individual provider SDK.
