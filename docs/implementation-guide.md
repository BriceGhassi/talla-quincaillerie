# Implementation and Deployment Guide

## Repository Structure

Recommended monorepo:

```text
apps/
  web/             PWA frontend and POS UI
  api/             REST API, sync gateway, workers
packages/
  domain/          Shared TypeScript domain types and validators
  database/        Prisma/Drizzle schema and migrations
  ui/              Shared UI components
infra/
  docker/          Production Docker files
  nginx/           Reverse proxy configuration
docs/
  architecture.md
  functional-modules.md
  openapi.yaml
```

## Frontend Implementation

1. Build a responsive PWA with React and TypeScript.
2. Use IndexedDB through Dexie.js for local reads and writes.
3. Create a sync service that:
   - stores local commands in an outbox,
   - retries with exponential backoff,
   - uses idempotency keys,
   - pulls server changes after successful pushes,
   - writes conflicts to a manager review screen.
4. Cache application shell and static assets with a service worker.
5. Keep POS screens small, fast, and keyboard/barcode friendly.

Important UI screens:

- Login and device registration.
- POS checkout.
- Product catalog and barcode lookup.
- Stock balances, movements, counts, transfers, and alerts.
- Production order board.
- Purchasing and receiving.
- Customer account and payment screen.
- Cashier shift open/close.
- Reports dashboard.
- Admin settings.

## Backend Implementation

1. Implement REST endpoints from `docs/openapi.yaml`.
2. Use PostgreSQL transactions for sales, production, purchasing, and sync.
3. Use append-only ledgers for stock and accounting.
4. Validate RBAC permissions on every endpoint.
5. Implement audit logging middleware.
6. Implement a sync gateway that accepts idempotent operation batches.
7. Use Redis queues for long-running exports, printing bridge jobs, and analytics refresh.

## Database Setup

1. Create a PostgreSQL database.
2. Run the SQL in `docs/database-schema.sql`, or translate it into ORM migrations.
3. Seed:
   - organization,
   - locations,
   - default roles,
   - permissions,
   - admin user,
   - OHADA account chart subset,
   - default payment methods and tax rates.

## Offline Policy

Recommended defaults:

- Offline session validity: 72 hours after last successful login.
- Product/price cache refresh: every login and every 15 minutes while online.
- Stock snapshot refresh: every sync cycle.
- Sale completion offline: allowed.
- Stock adjustments offline: stock manager only.
- Production completion offline: production manager only.
- User and role changes offline: not allowed.

## Sync Algorithm

```text
onAppStart:
  load cached session
  open IndexedDB
  render offline-ready UI
  if online:
    pull server changes
    push outbox operations

onMutation(command):
  validate locally
  apply optimistic local update
  append command to local_outbox
  if online:
    push pending operations

pushOutbox:
  send batch to /sync/push
  for accepted operations:
    mark as synced
    apply canonical server record/version
  for conflicts:
    keep local record, create conflict task
  pull changes from returned cursor
```

## POS Barcode Handling

Most USB scanners act as keyboards. The POS screen should keep focus on a hidden
or visible scan input, detect rapid key entry ending with Enter, and lookup
products by barcode. Manual search remains available for damaged labels.

## Ticket Printing

Implementation options:

- Browser print: simplest, works with A4 or configured receipt printer.
- QZ Tray: recommended for thermal ESC/POS printers.
- Local print bridge: small desktop service for environments that need direct
  printer and cash drawer commands.

Receipt data should be generated server-side when online and locally when
offline, using the same template version and receipt numbering policy.

## VPS Deployment

1. Provision a VPS with Docker and Docker Compose.
2. Configure DNS and TLS with Nginx or Caddy.
3. Copy `.env.example` to `.env` and fill secrets.
4. Start services:

```bash
docker compose up -d
```

5. Run database migrations and seed data.
6. Create the first admin user.
7. Register store devices.

## Vercel or Netlify Deployment

Recommended split:

- Frontend PWA on Vercel or Netlify.
- API, PostgreSQL, Redis, and workers on VPS or managed services.

Set the frontend environment variable:

```bash
VITE_API_BASE_URL=https://api.your-domain.com/v1
```

## Production Checklist

- HTTPS enabled everywhere.
- Backups scheduled and restore-tested.
- Database migrations automated.
- Admin user password changed.
- Role permissions reviewed.
- Device registration completed per location.
- Offline login tested.
- Offline POS sale tested and synchronized.
- Negative stock reconciliation report tested.
- Thermal ticket printer tested.
- OHADA account mapping reviewed by accountant.
- Audit log retention configured.

## Test Strategy

Automated tests:

- Unit tests for pricing, tax, stock ledger, production costing, and RBAC.
- API integration tests for sales, sync, production, and purchasing.
- Offline PWA tests for outbox retry and conflict scenarios.
- End-to-end POS test with barcode-like keyboard input.

Manual acceptance tests:

1. Sell a product online and verify stock decrease.
2. Sell the same product offline and verify deferred sync.
3. Receive supplier goods and verify weighted cost.
4. Create a production order, consume raw material, receive finished product.
5. Close cashier shift and reconcile payments.
6. Trigger minimum stock alert.
7. Export sales and accounting report.

