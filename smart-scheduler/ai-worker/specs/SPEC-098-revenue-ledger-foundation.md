# SPEC-098: Revenue ledger foundation (REQ-120 §2, Team C, week 1)
- **REQ:** REQ-120 §2 (R2.1, R2.2 manual line, R2.4, R2.5), §8 D2 (English) and D5 (cut-over), §9.4 #1 and #6, §14 (where the work goes).
- **Author:** Sector (SA, Team C), 2026-11-08. **Status:** SPEC written; TASK-858 (Brew) and TASK-859 (Flash) cut.
- **Build GO:** owner, 2026-11-08, REQ-120 §14: *"อ่า GO เลยจะได้ ทำให้ก้อนแรกเสร็จได้ไว"*.

## 0. What I read (2026-11-08, read-only)
- **`smart-scheduler-backoffice-back` (BB)**, branch `dong` @ `aa2a7cc`, clean tree:
  - `src/db/schema.ts` l.465–634 (the `bo` schema: `item`, `movement`, tags; read-only `public` declarations);
  - `drizzle.config.ts` (ledger `drizzle.__drizzle_migrations_bo`, `schemaFilter: ["ops","bo"]`, `casing: "snake_case"`);
  - `drizzle/meta/_journal.json` (7 entries, 0000–0006; newest `when` 1785628800000);
  - `src/routes/api.ts`, `src/routes/reports.ts`, `src/middleware/auth.ts` l.1–68, `src/lib/http.ts`, `src/index.ts` l.1–44 (error body, `PORT ?? 3002`);
  - `src/lib/revenue-attribution.ts` l.1–40;
  - `package.json` scripts and `.env.example` key names.
  - **Base test run:** `bun test` → `137 pass · 0 fail · 13 files` (no BB test touches a database).
- **`smart-scheduler-backoffice-front` (BF)**, branch `dong` @ `afcf30e`, clean tree:
  - `src/app/(admin)/` route folders; `src/app/(admin)/revenue/page.tsx` (5 lines, renders `RevenueContent`);
  - `src/services/reports.service.ts` (the `api` client pattern);
  - `src/components/layout/AdminLayout/AdminLayout.config.ts` l.15 (the live "รายได้แยกตามกิจกรรม" menu entry);
  - `.env.example` (one key, `NEXT_PUBLIC_BACKOFFICE_API_URL`).
  - **Base checks:**
    - `node node_modules/typescript/bin/tsc --noEmit -p .` → exit 0, no output.
    - `npm run lint` is **broken on the base** ("Invalid project directory … \lint": `next lint` is gone in Next 16). So it is not a DoD check.
- **Final UI, the agreed screens** (`SOM-BALANCE-Backoffice-spec/final-ui`, REQ-133 md5 1d0ce1f6):
  - `src/mock/b-revenue.ts` (175 lines: types, the category tree, line shape, summary blocks);
  - `src/pages/b/revenue/Categories.tsx` l.1–40, `Manual.tsx` (form fields).
- **Not read (they are week 2+, with their own SPECs):**
  - SB `scheduler.service.ts`, `lib/sale-post.ts`, `jobs.service.ts` (C1 posting at confirm);
  - SF booking modal (F1, F2);
  - `EcaPayment.tsx`, `Refund.tsx`, `Detail.tsx`, `Summary.tsx` in full.

## 1. Decisions [SA-decided]
1. **A new revenue ledger, `bo.revenue_line`, separate from `bo.movement`.**
   - **Why:** `bo.movement` has no branch, payment method, revenue type/category or count date (`schema.ts` l.509–534). Those are exactly R2.4/R2.5's columns.
   - **What stays:** the bridge movements (freelance ceiling, salary-side items, today's sale postings) are untouched. The rebuilt Revenue report reads **only** `bo.revenue_line`.
   - Every writer adds rows to it: manual lines now; C1 at confirm, ECA, refund, Stock's SALES RECORD and rent later.
2. **Cut-over cannot double-count, by construction.**
   - D5: revenue starts on day 1 of the go-live month.
   - §9.4 #1: a course sold before go-live counts on its confirm date.
   - Today's sale postings live in `bo.movement`, which the new report never reads. So such a course appears once, at confirm, when C1 writes its `revenue_line`.
   - This closes the risk I named on 11-07 (CHECK-REQ-120 §Sector, line 7).
3. **Amounts are signed integer satang** (`amount_minor`), like `bo.movement.value_minor`. A refund is a negative line with `type = 'REFUND'` (R2.3: an expense in the month of the refund).
4. **Categories are rows, not an enum**, so she can add more (R2.1). Each belongs to one type. They are seeded from the final UI's v3 tree.
5. **Labels are English (D2).** The API returns codes. The FE prints them.
6. **Revenue is CEO-only (R0.1, §9.4 #6).** The contract is SPEC-097 §3: `requireAuth` + `requireRole("ceo")`, lower-case roles. Jason builds it in TASK-856 this week.
   - Every Revenue route goes through **one seam**, `requireRevenueAccess`, in Team C's own file.
   - **While TASK-856 is not DONE,** the seam is `adminAuth`.
   - **Once it is DONE,** the seam becomes `requireAuth` then `requireRole("ceo")`. That is a one-function change in a follow-up TASK, or inside TASK-858 if 856 lands first.
   - **Revenue goes up to sid for anyone but the team only after that swap.**
7. **The old Revenue screen stays as it is** (`/revenue` + its menu entry; REQ-014's attribution report).
   - The new screens live under `/revenue/summary`, `/revenue/detail`, `/revenue/manual` and `/revenue/categories`, reachable by URL only in week 1.
   - The menu swap and the old page's retirement are the block's cut-over TASK, so the live screen isn't broken mid-build.

## 2. Schema (BB, additive migration; applied to sid only through `MIGRATION-QUEUE.md`)
Lives in a NEW file, `src/db/schema-revenue.ts`. **`schema.ts` is not edited by Team C:** TASK-856 (Team A) adds `bo_users` there this week, in the same working tree.
- drizzle-kit finds the new file because `drizzle.config.ts` `schema` becomes an array: `["./src/db/schema.ts", "./src/db/schema-revenue.ts"]`.
- Team C's code imports its tables from `schema-revenue.ts` directly.
- The tables are in the existing `bo` pgSchema object (`import { bo } from "./schema"`, read-only), so there is no second `pgSchema("bo")`.

```sql
CREATE TABLE "bo"."revenue_category" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" text NOT NULL,                       -- one of the 8 revenue types below (not REFUND)
  "name" text NOT NULL,                       -- e.g. 'Inline Skate · Private', '10 Hr', 'STA'
  "sort_order" integer DEFAULT 0 NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "revenue_category_type_ck" CHECK ("type" IN ('COURSE','TRIAL','VOUCHER','ECA','SALES','FNB','RENT','OTHER'))
);
CREATE UNIQUE INDEX "bo_revenue_category_type_name_uq" ON "bo"."revenue_category" ("type", lower("name"));

CREATE TABLE "bo"."revenue_line" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "occurred_on" date NOT NULL,                -- the date it COUNTS (R2.2), Asia/Bangkok calendar date
  "branch" text NOT NULL,                     -- 'BRAVO' | 'OTHER' (R2.4)
  "type" text NOT NULL,                       -- 8 types + 'REFUND'
  "category_id" uuid REFERENCES "bo"."revenue_category"("id"),   -- NULL only for REFUND
  "product_name" text NOT NULL,               -- R2.5 "Product Name" (manual: typed; default = category name)
  "amount_minor" integer NOT NULL,            -- signed satang; REFUND < 0, every other type > 0
  "method" text NOT NULL,                     -- 'TRANSFER' | 'CASH' | 'CARD' (R2.4)
  "remark" text,
  "source" text NOT NULL,                     -- 'MANUAL' now; later 'BOOKING' (C1), 'ECA', 'STOCK', 'REFUND', 'RENT'
  "ref_type" text, "ref_id" text,             -- what produced it (NULL for MANUAL)
  "idempotency_key" text,                     -- writers that may retry set it; MANUAL leaves it NULL
  "actor" text,                               -- who saved it (the JWT subject; NULL for service writers)
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "revenue_line_branch_ck" CHECK ("branch" IN ('BRAVO','OTHER')),
  CONSTRAINT "revenue_line_method_ck" CHECK ("method" IN ('TRANSFER','CASH','CARD')),
  CONSTRAINT "revenue_line_type_ck" CHECK ("type" IN ('COURSE','TRIAL','VOUCHER','ECA','SALES','FNB','RENT','OTHER','REFUND')),
  CONSTRAINT "revenue_line_sign_ck" CHECK (("type" = 'REFUND' AND "amount_minor" < 0) OR ("type" <> 'REFUND' AND "amount_minor" > 0))
);
CREATE UNIQUE INDEX "bo_revenue_line_idempotency_uq" ON "bo"."revenue_line" ("idempotency_key");
CREATE INDEX "bo_revenue_line_day_idx" ON "bo"."revenue_line" ("occurred_on", "type");
```

- **Existing data:** none touched. Two new empty tables, plus the category seed below.
- **Category seed:** in the same migration, `INSERT … ON CONFLICT DO NOTHING`, exactly the final UI tree (`b-revenue.ts` l.121–147: `REV_SPORTS` l.121, `REV_OTHER_COURSE` l.123, `REV_TREE` l.128–136, `REV_CATS_BY_TYPE` l.138–147), with sort_order in list order:
  - **COURSE:** 8 sports × (Private, Duo, 1 HR) = `"<sport> · <sub>"`, then `Balance Camp` and `Birthday`;
  - **TRIAL:** `1st Trial (<sport>)` × 8;
  - **VOUCHER:** 5 Hr, 10 Hr, 15 Hr;
  - **ECA:** STA, RIS, ABC, ISB, KIS;
  - **SALES:** Miller, Inline Skate, Bike, Safety;
  - **FNB:** Drink, Snack;
  - **RENT:** EQUIPMENT, PARK;
  - **OTHER:** Shirt, Sock, Bag.
  - That is 24 + 2 + 8 + 3 + 5 + 4 + 2 + 2 + 3 = **53 rows**.
- **Type codes ↔ labels (the FE prints these, D2):**
  - COURSE → "COURSE"
  - TRIAL → "1st Trial"
  - VOUCHER → "VOUCHER"
  - ECA → "ECA"
  - SALES → "SALES"
  - FNB → "F&B"
  - RENT → "RENT"
  - OTHER → "OTHER"
  - REFUND → "Refund"
  - Also: BRAVO → "Bravo", OTHER → "Other"; TRANSFER → "Transfer", CASH → "Cash", CARD → "Credit card".
- **Migration numbering (BB, shared sid):**
  - BB's `db:generate` is plain `drizzle-kit generate`, which stamps `when = now`. Drizzle applies a migration only if its `when` is greater than the ledger's newest `created_at` (`drizzle.config.ts` comment, TASK-085).
  - **Rule:** right before applying, the entry's `when` must be greater than every `when` already in the journal **on the latest shared branch**. If another team's migration landed after you generated, regenerate on top of theirs. Never hand-edit an entry that is already applied.
  - Applying to sid is the SA's: line in `MIGRATION-QUEUE.md` → `bun run db:migrate` (it runs `db:verify`) → `applied · verified`.

## 3. API contract (BB, mounted at `/api/v1/revenue`)
- **Auth:** every route goes through `requireRevenueAccess` (§1.6).
- **Errors:** the app's existing shape, `{ "error": { "code", "message", "details"? } }`, from `ApiException` (`http.ts`):
  - 400 `VALIDATION`
  - 401 `UNAUTHORIZED`
  - 403 `FORBIDDEN`
  - 404 `NOT_FOUND`
  - 409 `CONFLICT`
- **Field casing:** camelCase in JSON. Money is integer satang. Dates are `YYYY-MM-DD` strings.

| method · path | request | 2xx response |
|---|---|---|
| `GET /categories` | `?type=<TYPE>` optional; `?includeInactive=true` optional | `200 { "categories": [{ "id", "type", "name", "sortOrder", "active" }] }`, ordered by type (the order of §2's list), then sortOrder, then name |
| `POST /categories` | `{ "type": TYPE (not REFUND), "name": string 1–60, trimmed }` | `201 { "category": {…same shape} }` · a duplicate (type, lower(name)) → 409 `CONFLICT` |
| `POST /lines` (manual line) | `{ "occurredOn": "YYYY-MM-DD", "branch": "BRAVO"\|"OTHER", "type": TYPE (not REFUND), "categoryId": uuid, "productName"?: string ≤120, "amountMinor": int > 0, "method": "TRANSFER"\|"CASH"\|"CARD", "remark"?: string ≤500 }` | `201 { "line": RevenueLine }`. `source = 'MANUAL'`, `actor` = JWT `sub` (or NULL under `SKIP_ADMIN_AUTH`). A categoryId whose type ≠ `type`, or that is inactive or unknown → 400 `VALIDATION`. productName defaults to the category's name |
| `GET /lines` | `?from&to` (required, inclusive, ≤ 366 days apart) · `branch` · `type` (incl. REFUND) · `categoryId`, all optional | `200 { "lines": RevenueLine[], "totalMinor": int, "revenueMinor": int, "refundsMinor": int }`, ordered by occurredOn desc, then createdAt desc. `totalMinor` = the sum of the returned lines, refunds included; `revenueMinor` = the non-REFUND lines; `refundsMinor` = the REFUND lines (≤ 0). So `totalMinor = revenueMinor + refundsMinor`. *(Added 2026-11-08 at TASK-859 review: the agreed Detail screen shows "Total Revenue" and "Refund (Expense)" apart, and the FE must not add them up itself.)* |
| `GET /summary` | `?date=YYYY-MM-DD` (required) · `branch` optional | `200 { "date", "today": Block, "mtd": Block, "ytd": Block }`. Today = that date; MTD = the 1st of its month → date; YTD = 1 Jan → date |

- `RevenueLine` = `{ "id", "occurredOn", "branch", "type", "categoryId", "categoryName", "productName", "amountMinor", "method", "remark", "source", "createdAt" }`. categoryName is null for REFUND.
- `Block` = `{ "rows": [{ "type", "amountMinor" }], "totalMinor", "refundsMinor" }`:
  - `rows`: all 8 non-refund types, always, in §2's order, with 0 when there are none (the final UI prints all 8);
  - `totalMinor` = the sum of rows (refunds **excluded**, as the final UI's `total` is);
  - `refundsMinor` = the sum of REFUND lines (≤ 0).
- **Not in this SPEC:** edit/delete of a line (not in R2), the ECA entry, refund, C1, export, the REPORT page.

## 4. Environment, Team C (shared sid DB rules 7–8)
- **Team C dev ports:**
  - BB **4310** (`PORT=4310`);
  - BF **3310** (`next dev -p 3310`, `NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310/api`: the client's base URL ends in `/api`; corrected at the TASK-859 review, Flash's Q3), **set inline on the command line**, because BF's local `.env.local` points at the deployed sid back office;
  - SB **4306**, SF **3306** when Team C reaches them.
- **BB `.env.example`:** add `API_BASE` (the smoke script's target) and a one-line purpose for every key that has none. Porter's ruling (DECISIONS-REQ-120-build row 3c): Team A does it in TASK-856. Team C does not touch the file.
- **Test data:**
  - Manual lines written to sid by Team C start their `remark` with `[C-TEST]` and use branch OTHER, so Tanya can filter them out.
  - BB's tests stay DB-free (base: none touches a database). New tests are unit tests over pure functions plus route tests with the service mocked.

## 5. Risks / unknowns
- **R0.1 contract not yet published.** It could change the middleware's name or claim shape. Contained: it touches only `requireRevenueAccess` (one function).
- **Two teams adding BB migrations in the same week.**
  - Contained by `MIGRATION-QUEUE.md` and the `when` rule above.
  - If Team A's R0.1 migration is applied first, Brew regenerates on top of it before I apply.
- **COURSE "Balance Camp" vs D3's separate camp confirm.** The category exists now; who writes camp lines is the C1/D3 SPEC.
- **REFUND has no category.** If Khwan's report filter needs "Refund · COURSE" (the final UI shows category `COURSE` on a refund line), it is a nullable column we can fill later; the refund SPEC decides.
- **Branch `OTHER` is one bucket.** "Future branches" (R2.4) are not modelled. A real second branch would be a change to the check constraint, additive.
