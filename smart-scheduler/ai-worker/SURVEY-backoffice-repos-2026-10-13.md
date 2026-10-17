# SURVEY — what the back-office repos hold TODAY (READ-ONLY input for a back-office rebuild spec) — @Sober, 2026-10-13
**For @Porter → the owner.** Facts with file:line only; **no opinion on keep / rebuild — the owner decides.** Nothing was edited, built, installed, migrated or run against a database in any repo. Repos by logical name: **`backoffice-back`** · **`backoffice-front`** · **`scheduling-back`** (= `smart-scheduler-back`). *(Read by me and two read-only agents; the load-bearing claims re-checked by me: `backoffice-back` `routes/api.ts:11`, `.env.example:1-3`, `db/schema.ts` table list, `backoffice-front` `AdminLayout.config.ts:10-18`.)*

## 0 · At a glance
- **`backoffice-back`:** 33 commits, **2026-06-23 → 2026-08-22** (last `486b2d1`); **live API = auth + one universal `bo` item model** (items · movements · tags · 3 reports). A whole earlier **`ops` model (parties, catalog/stock, wallet/ledger, price rules, recurring salary, settlement runs) is DORMANT** — files kept, routes unmounted, tables absent from the shared DB (`routes/api.ts:5-11`).
- **`backoffice-front`:** 20 commits, **2026-06-23 → 2026-08-20** (last `6cf23f6`); a menu of **4 live screens** (P&L · revenue by activity · items · tags), 2 reachable-but-unlisted ops screens, **4 placeholder pages** (inventory · wallet · payroll · reports); **0 tests**.
- **`scheduling-back` talks to the back office through the SHARED DATABASE, not HTTP:** it reads/writes `bo.item` + `bo.movement` directly (freelance ceilings, every sale, reversals). Its HTTP client `src/lib/ops-client.ts` is **imported by no production file** (only its own test).
- **Environments:** sid = `backoffice-som.develyst.online`, uat = `backoffice.develyst.online` (`SYSTEM-FACTS.md:248-249`); deploy order "backoffice-back (:4010) + backoffice-front (:3018) follow" (`SYSTEM-FACTS.md:290`). **Whether either back-office app is running / used on sid or uat today is NOT determinable from the repos** (`.env.sid` / `.env.uat` exist in `backoffice-back`, dated 2026-08-18; a built `dist/…exe` dated 2026-08-22). ⇒ **a question for the owner.**

## 1 · What exists and works
### `backoffice-back` (Bun + Hono + Drizzle)
- **Mounted:** `GET /health` (`src/index.ts:12`) · `/api` (`index.ts:21`) → **`/api/v1/auth` + `/api/v1/bo` only** (`routes/api.ts:11`).
- **`POST /api/v1/auth/login`** (`routes/auth.ts:11`): `{username,password}` checked against env `ADMIN_USERNAME`/`ADMIN_PASSWORD`, **falling back to `admin`/`admin`** (`auth.ts:13-14`) ⇒ `{token, user:{username, role:"admin"}}`.
- **`/api/v1/bo/*`, every route behind `adminAuth`** (`routes/bo.ts:11`): `GET|POST /items` (26/29) · `GET|PATCH /items/:id` (34/38) · `POST|GET /items/:id/movements` (42/45) · `PUT /items/:id/tags` (49) · `GET|POST /tag-groups` (54/55) · `POST /tag-values` (58) · `GET /reports/pl?from&to` (62) · `GET /reports/revenue-by-activity?month` (66) · `GET /reports/customer-spend?month&q` (69). `bo.ts:22-23`: *"no service/script consumes these routes"*.
- **Live services:** `item.service.ts` (list/get/create/update item, `applyMovement`, `listMovements`, `getPLReport`, `:12-171`) · `tag.service.ts` · `revenue.service.ts` (`getRevenueByActivity` :107, `getCustomerSpend` :116). Libs: `bo-money` (ceiling guard, P&L fold), `revenue-attribution` (sale → student/subject), `jwt`, `money`, `month`, `migration-ledger`, `migration-witness`.
- **Dormant (files exist, unmounted):** routes `accounts` · `catalog` (incl. `commerceRoutes` :54) · `commercial` · `parties` · `pricing` (`/teacher-rates` :25) · `recurring` (`/recurring/materialize` :26, `/jobs/month-start` :30) · `reports` · `teacher-sync` (onboard/update/offboard/switch-type :10-25); services of the same names + `inventory`.
- **Auth middleware** (`middleware/auth.ts`): `serviceAuth` :33 (`SERVICE_TOKEN` via `Authorization: Bearer` or `X-Service-Token`; **unset ⇒ every request passes**) · `adminAuth` :47 (Bearer JWT; **`SKIP_ADMIN_AUTH=true` bypasses**) · `adminOrService` :65.
- **Tests:** 12 files, ≈121 cases — revenue-attribution 35 · migration-witness 22 · migration-ledger 16 · bo-money 9 · auth 8 · month 6 · routes/bo 5 · dormant teacher-sync 5 / reports.pl 5 / inventory 4 · schema 3 · jwt 3 · money 2.
- **Data move script:** `src/db/migrate-to-bo.ts:1-18`, one-time from `ops` + `public.freelance_budgets` into `bo` — **whether it was run: not determinable.**
### `backoffice-front` (Next.js)
| URL | page | does | calls |
|---|---|---|---|
| `/login` | `app/login/page.tsx:11-83` | username/password, stores token | `POST /v1/auth/login` |
| `/dashboard` | `(admin)/dashboard` | **P&L** («งบกำไร–ขาดทุน») | `GET /v1/bo/reports/pl` |
| `/revenue` | `(admin)/revenue` | revenue by activity + customer spend per month | `GET /v1/bo/reports/revenue-by-activity`, `…/customer-spend` |
| `/items` | `(admin)/items` | universal item catalog: create/edit, movements, tags | `/v1/bo/items*`, `/v1/bo/tag-groups` |
| `/tags` | `(admin)/tags` | tag groups + values | `/v1/bo/tag-groups`, `/v1/bo/tag-values` |
| `/freelance-budgets` | `(admin)/freelance-budgets` | freelance budgets as EXPENSE items — **calls the DORMANT `/v1/catalog/items*`** | not in the menu |
| `/ftpt-salary` | `(admin)/ftpt-salary` | FT/PT salary — **calls the DORMANT `/v1/recurring-costs`** | not in the menu |
| `/inventory` · `/wallet` · `/payroll` · `/reports` | `(admin)/*/page.tsx:4-11` | **placeholders** ("Wave 1–4") | none |
- **Menu = 4 entries** (`AdminLayout.config.ts:14-17`): Dashboard · Revenue · Items · Tags; `:10-12` calls Freelance Budgets / FT-PT Salary "retired".
- **Auth:** `src/proxy.ts:8-16` redirects to `/login` without the `bo_token` cookie — **`/revenue` is not in the guarded list** (`proxy.ts:20-29`); cookie not httpOnly, 12 h (`lib/auth.ts:4,7`); 401 ⇒ logout (`lib/api/client.ts:32-43`). `user.role` returned but read nowhere — **no roles/permissions in the UI.**
- **Wired to the real API, no mocks** (base URL key `NEXT_PUBLIC_BACKOFFICE_API_URL`, default `http://localhost:4010/api`, `client.ts:16-18`). **0 tests.**

## 2 · The data model as it stands
### LIVE — schema **`bo`** in the shared database (`backoffice-back` `db/schema.ts:471-589`)
- **Enums:** `bo.direction` (INCOME · EXPENSE, :473) · `bo.cadence` (VARIABLE · FIXED_MONTHLY · FIXED_DAILY · FIXED_QUARTERLY, :474).
- **`bo.item`** (:481): `id` · `name` · `unit` (default 'each') · `direction` · `cadence` · `ceiling_qty` · `remaining_qty` · `unit_price_minor` · **`owner_ref`** ("teacher identity ONLY", :492) · `external_source` · **`external_ref`** (product code e.g. `course-6`, :494-497) · `active` · `metadata` jsonb · timestamps. Index `(external_source, owner_ref)`; partial unique `(external_source, external_ref) WHERE external_ref IS NOT NULL` **only in SQL** (`drizzle/0005…sql:18-20`).
- **`bo.movement`** (:509): `item_id` FK (cascade) · `qty` (signed) · `remaining_after` · `value_minor` · `reason` · `ref_type` · `ref_id` · **`idempotency_key` (unique)** · `actor` / `note` (:526-527, **never written** — `item.service.ts:138-151`) · `created_at`.
- **Tags:** `bo.tag_group` (:536) · `bo.tag_value` (:543) · `bo.item_tag` (:554; one value per group per item).
- **⇒ by area:** **catalog / revenue / freelance ceilings / fixed salary are all `bo.item` + `bo.movement`**; a sale = a movement `ref_type 'SALE'`; a discount = a negative movement `reason 'DISCOUNT'` (`0006…sql:3`). **Live `bo` has NO wallet, party, payroll or settlement tables.**
- **Read-only `public` mirrors** (:603-634): `students` · `subjects` · `course_packages` · `vouchers` · `bookings` — *"READS these and never writes or migrates them"* (:594).
### DORMANT — schema **`ops`** (`db/schema.ts:31-462`; tables **absent** from the shared DB, `routes/api.ts:5-8`, `.env.example:1-3`)
| area | tables |
|---|---|
| org / parties | `organizations` (:72) · `parties` (:90) |
| catalog / stock | `catalog_items` (:119) · `stock_balances` (:157) · `stock_movements` (:168) |
| wallet / ledger | `accounts` (:200) · `account_ledger` (:225) |
| commercial | `commercial_requests` (:251) |
| teacher rates | `price_rules` (:278 — HOURLY / FIXED / PERCENTAGE / CAP) |
| payroll / salary | `recurring_costs` (:309) · `settlement_runs` (:344) · `settlement_lines` (:365) |
| other | `api_credentials` (:390) · `idempotency_records` (:404) · `notification_outbox` (:419) |
### What the docs say (all June–July; the shared docs are byte-identical in both repos except `requirement.md`)
- `docs/requirement-timeline.md:19-29` (top entry, 2026-07-20): **"PIVOT: รื้อ backoffice ทำใหม่"** — old work superseded; freelance limits move to the front office; **"freelance P&L/รายจ่าย + เงินเดือน FT/PT = พักไว้"**; REQ-003 sync "ON HOLD ไม่ deploy". `:32-58`: item-centric P&L; wallet + payroll parked; `settlement_runs` *"schema เปล่า ไม่มี service/route"*.
- `backoffice-back docs/requirement.md` (the ops-era "Operations API กลาง", :6-8): deliverables `:170-174` — 1–3 ✅ (scaffold, catalog, parties/accounts/pricing CRUD), ⬜ settlement runs, ⬜ reports · LINE worker · idempotency · real JWT — **none of those endpoints is mounted today.**
- `docs/teacher-roster-payroll.md`: month-end payout for all types (:4) · FT base + 350 ฿/h OT beyond 4 h weekday / 5 h weekend (:56-58) · PT day rate weekend, hourly weekday (:66-67) · freelance Private 500 (Toth weekday 400), Group/Camp 625 or 1,250, ECA per teacher (:79-96) · per-SKU commission (:102) · status table **almost all ❌** (:119-133).
- `docs/business-domain.md:60-65`: payroll "❌ schema only", commission "❌ ยังไม่ implement". `docs/monorepo-overview.md:60-63`: "~40%", remaining "Settlement, reports, wire scheduling debit".
- `SYSTEM-FACTS.md:3618-3623` (ours, 2026-10-02): **`REQ-BO-001…006` are six one-line TITLES, no documents**; the back-office REQs on our numbering are REQ-002 (auth, delivered) · REQ-006 (universal item model, design approved — *since built as `bo`*) · REQ-014 (revenue by activity, READY_FOR_SA).

## 3 · What `scheduling-back` relies on today — and what would break if the back office were replaced
### The live link = direct SQL on the shared `bo` schema (`scheduling-back` `src/db/schema.ts:231-277`)
*"`bo` migrations are owned by backoffice-back; scheduling only reads/writes item + movement here (direct same-DB access → the freelance decrement stays atomic inside the booking tx, no HTTP)"* (`schema.ts:231-233`). Scheduling declares its own copy of `bo.item` (:243) and `bo.movement` (:265) — **without** `actor`/`note` and without the tag tables.
| what | where (scheduling-back) | how it touches `bo` |
|---|---|---|
| **Freelance coach ceiling** (the "income ceiling") | `services/scheduler.service.ts:211-440` (`findFreelanceItem` :211 · `applyHoldMove` :232 · `reconcileBookingHolds` :277 · `closeFreelanceCeiling` :404 · `listFreelanceCeilings` :415) | a `bo.item` per freelance teacher: `owner_ref = teacherId`, `external_source = 'smart-scheduler'`, `metadata.kind = 'FREELANCE_CEILING'` (:206-208); **debited/credited INSIDE the booking transaction** (`update bo.item.remaining_qty` :251 + `insert bo.movement` :253) on confirm/cancel/move |
| **Every sale** | `lib/sale-post.ts` (`recordSale` :79 · `postBookingSale` :196 · `reverseBookingSale` :398) — called by course sale (`scheduler.service.ts:2524`), voucher sale (:2945), camp (`camp.service.ts:400`), rental (`rental.service.ts:44`), **the end-of-day ATTENDED posting** (`jobs.service.ts:230/307/332`) | `insert bo.movement` with `ref_type 'SALE'` (:133/238/425) on the item found by `external_ref` (product code); discounts as negative movements |
| **Reversal of an undone attendance** | `scheduler.service.ts:4529`, `undo.service.ts:223` | a reversing `bo.movement` |
| **Idempotency keys** (unique in `bo.movement`) | `sale-post.ts:51-64` | `rev:<bookingId>[#gen]` · `rev-undo:<bookingId>[#gen]` · `discount:<refId>[#gen]` · `camp-sale:<id>` (`camp.service.ts:400`) |
| **Reads** | `services/attention.service.ts:162-164` (SALE movements) · `jobs.service.ts:296,318` (items) · `scheduler.service.ts:2097-2098` (`getCatalogItems`: non-EXPENSE items) | select on `bo.item` / `bo.movement` |
| **Seeding sale items** | `scripts/ensure-sale-items.ts` (`bun run sale:ensure-items`, `package.json:27`) · `scripts/reconcile-sale-prices.ts` | writes `bo.item` rows for the product codes |
### The dead HTTP link
- `src/lib/ops-client.ts` (346 lines): calls `${OPS_API_URL}/api/v1/catalog/items…`, `/internal/teacher-sync/*`, `/recurring-costs`, `/parties` with `X-Service-Token` (:17-24, :49, :112-113, :158, :182-183, :250-253) — **every one of those routes is DORMANT in `backoffice-back`.** **No production file imports `ops-client.ts`** (only `ops-client.test.ts`); `sale-post.ts:1-13` records that sales moved off it after the route was retired and *"every sale 404'd silently for days"*.
### ⇒ What a replacement must keep, or scheduling-back changes with it (facts, not a recommendation)
1. **The two tables and their columns** `bo.item` / `bo.movement` as scheduling declares them (`schema.ts:243-277`), **in the SAME database** — the freelance draw is atomic with the booking only because it is one transaction.
2. **The identity conventions:** `external_source 'smart-scheduler'` · `owner_ref = teacherId` + `metadata.kind 'FREELANCE_CEILING'` for ceilings · `external_ref` = the product code for sale items.
3. **The movement conventions:** `ref_type 'SALE'` · `reason 'DISCOUNT'` · the idempotency-key formats above and the **unique index** on `idempotency_key` (re-posts rely on it).
4. **The revenue reports' reads of `public.*`** (students, subjects, course_packages, vouchers, bookings — `backoffice-back schema.ts:603-634`).
5. **Nothing over HTTP** — no live scheduling code calls the back office's API.

## 4 · The migration ledgers (formerly one shared `drizzle.__drizzle_migrations`)
- **Before:** neither repo set a migrations table, so **both wrote `drizzle.__drizzle_migrations`** (`scheduling-back src/lib/migration-ledger.ts:4`); drizzle compares one row's `created_at`, so *"whichever repo migrated last silently blocked the other, permanently, with exit 0"* (`backoffice-back drizzle.config.ts:7-11`).
- **Now, separate ledgers:** scheduling **`drizzle.__drizzle_migrations_scheduling`** (`scheduling-back drizzle.config.ts`; `scripts/verify-migrations.ts:33`) · back office **`drizzle.__drizzle_migrations_bo`** (`backoffice-back drizzle.config.ts:12`, `schemaFilter ["ops","bo"]`).
- **The old shared table is kept, never modified:** *"evidence and rollback"* (`scheduling-back scripts/seed-ledger-from-schema.ts:15,156`).
- **Back-office migrations:** `0000_friendly_moonstone` (the `ops` schema) · `0001_item_pl` · `0002_item_external` · `0003_even_turbo` (`recurring_costs`) · **`0004_bo_schema`** · `0005_bo_item_external_ref` · `0006_bo_movement_audit` — 0004–0006 hand-written; snapshots only for 0000/0003 (`0005…sql:8-10`: *"db:generate would re-emit the whole schema"*). `db:migrate` = `drizzle-kit migrate && db:verify` (`package.json:13`).
- **Scheduling's migrations do NOT create `bo`** — *"`bo` migrations are owned by backoffice-back"* (`scheduling-back schema.ts:232`). ⇒ **a fresh database needs the back office's `0004`–`0006` before scheduling can sell or draw a ceiling.**

## 5 · Inconsistencies found (for the spec writer; no fix proposed)
- Port: `backoffice-back` code default **3002** (`index.ts:44`, `CLAUDE.md:19`, and scheduling's `ops-client.ts:1`) vs **4010** (`.env.example`, `docs/monorepo-overview.md:60`, `SYSTEM-FACTS.md:290`).
- `backoffice-back CLAUDE.md:7-18` still describes the `ops`-only model; `backoffice-front` comments `(admin)/layout.tsx:3`, `AppProviders.tsx:10` are stale.
- `backoffice-front` keeps two unlisted screens that call dormant routes (`/freelance-budgets`, `/ftpt-salary`) and unused `partials/Items/*` + `useReports.ts`.
- `bo.movement.actor` / `note` exist but are never written.

## 6 · Open, for the owner (not answerable from the repos)
1. Is `backoffice-back` / `backoffice-front` **running on sid and/or uat** today, and does anyone use it?
2. Was `migrate-to-bo.ts` ever run on either box?
3. Which of the parked areas (wallet · payroll/settlement · inventory · parties · commission) are in the rebuild's scope?
