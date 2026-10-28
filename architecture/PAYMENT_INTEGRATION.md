# Minimal PayBD integration

Source project: [rishadamin001/payment-gateway](https://github.com/rishadamin001/payment-gateway).

Reviewed source:

- `web/app/checkout/components/checkout.tsx`: five method choices, preset fictional accounts, fake-code verification, method-colored processing, and terminal result states.
- `web/app/shop/components/shop.tsx`: image/name/quantity add-to-cart notice, button feedback, bag-badge animation, checkout handoff.
- `web/lib/product-images.ts` and `web/public/products/CREDITS.txt`: local illustrative product photos and credits.

Adapted only the relevant interface and workflow concepts into `src/modules/payments.js`, `src/modules/motion.js`, and the shopping checkout. This preserves the experience while keeping the no-billing browser deployment.

The Next.js runtime, server API proxy, gateway credentials, merchant dashboard, payment-link administration, refunds, webhooks, database and real financial processing were not imported. The source payment repository was not changed. The temporary tunnel link is not a runtime dependency and no customer is sent there.

The fake-code check is **not authentication**. It is a classroom step, explicitly labeled as such. No real card, PIN, wallet number, OTP, SMS, payment provider or bank is used. The browser has no authoritative financial role. A successful local simulation creates mock orders once within the active attempt; cancelled, expired, or failed attempts preserve the bag. A page interruption is a local simulation interruption, not a remote pending charge.

Provider calls and signed server callbacks would require a separate approved backend implementation. The current module must not be reused as a real gateway.
