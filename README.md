# BongoBridge — MIS 465 course demo

BongoBridge is an original Bangladesh-focused shopping proxy and freight-forwarding **simulation** for an MIS 465 web-development presentation. Its visual direction is inspired by large digital-commerce service websites such as Baozun. It is not affiliated with Baozun, any retailer, any carrier, or any payment provider.

**Educational use only. All products, brands, orders, shopper labels, prices, exchange rates, shipping lanes, fees, and delivery dates are invented. Nothing can be purchased or shipped. Do not enter real personal or financial information.**

## What the demo demonstrates

- An editorial landing page introducing a shopping-proxy service for Bangladesh.
- A generated product catalog with search, category/origin filters, sorting, and a demo bag.
- A sample shipping/landed-cost estimate in Bangladeshi taka.
- A simulated checkout and a "Buy for me" request flow using preset dummy details.
- A parcel-status timeline and classroom admin view with status advancement and JSON export.
- Browser-local persistence and a reset path for repeat presentations.

The website does not process payments, scrape stores, buy goods, contact carriers, send email, or provide real customs advice. The classroom admin view is a simulation, not an authenticated administration system.

## Architecture and cost controls

The website is static HTML, CSS, and JavaScript. Its mock data and state run in the browser. Each browser has its own copy of the demo; there is no shared production backend, server process, database connection, login, analytics collector, AI API, payment gateway, or secret key.

No paid service or billing method is required by the project. The intended public classroom host is GitHub Pages from a public repository, using the `main` branch and `/docs` folder. GitHub Pages is available with GitHub Free for public repositories. The project does not add metered infrastructure, custom domains, paid subscriptions, or paid automation. Hosting remains subject to the provider's free-service limits; exceeding a limit should be handled by reducing usage or keeping the demo local, not upgrading.

GitHub Pages is appropriate here because this is a noncommercial educational exercise with a prominent disclaimer and no user-data collection. Do not turn this deployment into an operating shop. See [GitHub Pages limits and educational exercises](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Files

| Location | Purpose |
| --- | --- |
| `dist/` | Editable website source and static assets. |
| `docs/` | Identical published copy served by GitHub Pages. |
| `database/seed.json` | Standalone generated teaching dataset: 12 products, six orders, four shipping lanes. |
| `database/schema.sql` | Optional relational model for a separate disposable learning database; unused by the website. |
| `DEMO_GUIDE.md` | Presentation walkthrough, data model, and limitations. |

When editing the site, update `dist/` and synchronize its contents into `docs/` before pushing. Use relative asset paths so the site works under a GitHub project URL.

## Run locally

No dependency installation or API credentials are needed. From the repository folder, serve the published files with any static file server. For example, if Python is installed:

```sh
python -m http.server 4173 --directory docs
```

Then open `http://localhost:4173`. Serve `dist` instead when working on source before synchronizing it into `docs`.

## Publish with GitHub Pages

1. Keep the repository public to use GitHub Pages on GitHub Free.
2. In the repository, open **Settings → Pages**.
3. Select **Deploy from a branch**, choose **main** and **/docs**, and save.
4. Use the exact website URL shown by GitHub after deployment succeeds.

No custom GitHub Actions workflow is required. Do not enter billing details, purchase a domain, upgrade a plan, or add hosted application services for this demo. If publication is unavailable, the local static demo still works.

## Optional Supabase teaching exercise

The working website **does not require Supabase**, and no Supabase project is provisioned by this repository. `database/schema.sql` is supplied only to teach how a relational version could be structured. It creates a private `bongobridge_demo` schema with related product, order, and shipping-lane tables, checks, foreign keys, and row-level security. There are no public read/write policies and no browser credentials. This intentionally does not create a usable public API.

If your instructor wants SQL practice, review the file and manually run it in a separate, disposable learning database that you have verified is free. Do not run it against a production project. Do not expose this private schema through a Data API or add service-role keys to the website. You can study the SQL without creating any account or cloud resource.

## Data and privacy

The seeded order labels are `Demo shopper A` through `Demo shopper F`; they do not identify people. Destination choices use city names, not street addresses. Mock state is stored on the device through browser storage and is not sent to an application backend. Clearing site storage removes local changes. The hosting provider may maintain its usual infrastructure access logs.

Shipping charges, fees, exchange rates, and delivery times are arbitrary teaching inputs. They must not be used to estimate real import costs, taxes, legal obligations, or delivery commitments.

## Attribution

Original implementation for a classroom demonstration. Baozun is referenced only as design inspiration, not as a partner or source of copied branding. No third-party commercial affiliation is implied.
