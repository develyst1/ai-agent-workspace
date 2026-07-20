# Project Understanding — Smart Scheduler (as-built, 2026-07-20)

> Author: Porter (PM). Purpose: one shared, verified mental model of the whole
> project so every role (Sober / Jason / Fern) starts from the same picture.
> Built from the workspace `docs/` (living spec) + a code sweep of all 4 repos.
> **This is a reference, not a requirement.** No scope is created here.
> When code and older docs disagree, the CODE + newest doc entry win — the
> discrepancies are called out in §6 for the human to reconcile.

Code monorepo root: `C:\Users\Admin\develyst\smart-scheduler`

---

## 1. The business (who we build for)

Customer **คุณฟีน** runs a **balance / wheeled-sports activity center** (bike,
scooter, balance cruiser, surfskate, freeskate, skateboard, inline skate,
onewheel, Balance Play) — **NOT an academic tutoring school**. Legacy names in
code ("tutoring", "subjects", math/physics seed) are placeholders. Contract:
**Option C (Ultimate)**, 73,000 THB deposit paid 2026-06-29. The product
replaces manual Excel scheduling **and** the paid "Alis To Soft" back-office.

Two user-facing goals, split into two app pairs:
- **Front office** = replace Excel: a visual staff calendar to book teacher×student hours.
- **Back office** = replace Alis To Soft: run the money — stock, revenue, expenses, "how much came in this month".

---

## 2. System map (4 repos, 1 PostgreSQL)

| Repo | Role | Stack | Port | As-built |
|------|------|-------|------|----------|
| `smart-scheduler-back` | Scheduling API (source of truth) | Bun + Hono + Drizzle, `public.*` | 3001 | ~75%, live & tested |
| `smart-scheduler-front` | Staff calendar UI | Next 16 + React 19 + Mantine v9 + TanStack Query | 3000 | ~70%, all screens wired |
| `smart-scheduler-backoffice-back` | Ops/Finance API | Bun + Hono + Drizzle, `ops.*` | 3002 | ~40%, core CRUD + P&L |
| `smart-scheduler-backoffice-front` | Admin ERP/money UI | Next 16 + Mantine v9 (dark) | 3100 | **NOT 0%** — P&L + Items built (see §6) |

- **One PostgreSQL**, two schemas: `public.*` (scheduling, owned by back) +
  `ops.*` (finance, owned by backoffice-back). Cross-system links go through
  `ops.parties.external_source`+`external_ref` — **never cross-schema FKs**.
- Living spec: `docs/requirement-timeline.md` (newest entry wins). Full as-built
  ID tracking lives in the separate `smart-scheduler-requirement` repo
  (`requirement.html`, `HANDOFF-2026-07-16.md`).

---

## 3. FRONT OFFICE — how it works today

**smart-scheduler-back (Scheduling API, port 3001)** — source of truth, client never trusted.
- **4 booking types** (`booking_type` enum):
  - `FIRST_TRIAL` — one-off 1h trial.
  - `SINGLE_SESSION` — ad-hoc 1h booking.
  - `COURSE_PACKAGE` — fixed-schedule course of **4/6/10** sessions. `POST /courses`
    auto-books the whole recurring weekly chain at a fixed weekday+time; any slot
    clash aborts the whole registration. **Sick-leave quota by size**: 4→1, 6→2,
    10→3; each leave cancels that session, increments `leaveUsed`, and
    auto-appends an `EXTENDED` session in the next free slot. Over quota → locked,
    needs admin unlock.
  - `VOUCHER` — hour bucket **5/10/15h**, **no fixed slot, no chosen teacher**,
    validity 3/6/9 months counted from first booking; each `ATTENDED` deducts 1h.
- **Calendar**: `GET /calendar?date&view=day|week`, 09:00–18:00, nine 1h slots,
  teacher columns. Teacher priority FT/PT before Freelance (persisted order).
- **Attendance / leave**: `PATCH /bookings/:id/status` (confirm / attend / cancel /
  sick-leave, admin `override`). Advance-leave-notice by teacher type
  (FT/PT ≥1h, FL ≥2h). No-double-booking enforced by a partial unique index on
  `(teacherId, date, startTime)` that *permits* overbooking a slot on leave.
- **Reschedule flow REMOVED (2026-07-11, UC-006)** — old move-day/week/teacher +
  `PENDING_RESCHEDULE` are dead; only overbooking a `SICK_LEAVE` slot remains.
- Done & tested: LINE outbox worker + webhook bot, QR/token check-in (time-window,
  no GPS), CRM points, **Badge system** (replaces the descoped multi-branch idea),
  end-of-day auto-cut job (`POST /internal/jobs/end-of-day`, idempotent, `job_runs`).
- Auth: single env admin credential → JWT; `SKIP_AUTH=true` in dev.
- Backoffice bridge (`lib/ops-client.ts`): best-effort `recordSale` on course/voucher
  sale + `consumeTeacherHours` on freelance attend; no-op if `OPS_API_URL` unset.

**smart-scheduler-front (Staff UI, port 3000)** — internal staff only (not students/parents).
- Screens: Calendar (day/week, filters by teacher type/name/badge; create + view/action
  modals), Teachers (activate by teacher/type, drag-drop ordering, work-days, freelance
  limit), Bookings (table + course/voucher panels + create modals), Badges CRUD,
  Dashboard, Reports (daily), public Check-in page.
- One data layer: `services/scheduler.service.ts` → Axios → API; `NEXT_PUBLIC_USE_MOCK`
  offline mode; NextAuth v5 beta login (still placeholder "admin").

---

## 4. BACK OFFICE — how it works today

> ⚠️ **The backoffice PIVOTED** from the original "wallet + payroll + inventory"
> framing to a simpler **item-centric Profit & Loss** model: everything is a
> typed catalog item, every movement hits the P&L. **Wallet and formal payroll
> are explicitly set aside for now.** See §6 — this needs the human's confirmation.

**smart-scheduler-backoffice-back (Ops/Finance API, port 3002)** — generic ERP primitives, `ops.*` only, domain-neutral naming, third-party-ready REST (`/api/v1`, idempotency keys, integer satang, `{error:{code,message,details}}`).
- **Built & transactional**:
  - `catalog_items` — unified catalog. `item_group` (PRODUCT/SERVICE) + `item_type`
    (**INCOME / EXPENSE / FIXED_COST**) is what drives the P&L. `sale_price_minor`,
    `track_stock`, `reorder_level`.
  - `stock_balances` + `stock_movements` (IN/OUT/ADJUST, `amount_minor` booked to P&L).
    `POST /commerce/sales` = POS: multi-line, decrements stock, idempotent, negative-stock guard.
  - `accounts` + `account_ledger` — wallet per party (HOURS/CURRENCY/POINTS), credit/debit, balance guard.
  - `commercial_requests` — admin-mediated TOP_UP/PURCHASE/ADJUSTMENT (LINE→approve).
  - `price_rules` — generic rate card (HOURLY/FIXED/PERCENTAGE/CAP), per-party or org-default,
    `metadata.teachingMode`. `GET /pricing/teacher-rates` feeds scheduling's freelance cap (UC-016).
  - `GET /reports/pl` — **the "how much money came in this month" endpoint**: aggregates OUT
    movements → `{revenueMinor, costMinor, profitMinor, byType, byItem}`, defaults to current month.
- **Schema-only / NOT built**: `settlement_runs`, `settlement_lines` (payroll engine — no
  service, no routes), `api_credentials`, `idempotency_records` (middleware not built — done
  ad-hoc per table), `notification_outbox` (no LINE worker). Auth stubbed (`SKIP_ADMIN_AUTH=true`).
- Seed = generic demo (org + 1 customer wallet + 6 retail/rental items). **Not** the 23 real teachers or real rate card.

**smart-scheduler-backoffice-front (Admin UI, port 3100)** — Mantine dark theme, mirrors front-office layering (page→partial→hook→service→API).
- **Built & wired to live API**: Dashboard/P&L (net-profit hero, revenue/cost tiles, by-type/by-item,
  date range) + Items (catalog CRUD filtered by INCOME/EXPENSE/FIXED_COST, stock IN/OUT/ADJUST modal).
- **Placeholder stubs only**: `inventory`, `wallet`, `payroll`, `reports` pages render a
  "coming in Wave N" card and reference endpoints that don't exist yet. Auth guard deferred.

---

## 5. Money model — how the stakeholder's questions get answered

Stakeholder's four goals → current implementation:
- **Stock in / out / restock** → `stock_movements` IN / OUT / ADJUST.
- **Revenue = value of stock sold** → OUT movements of `INCOME` items, summed in `/reports/pl`.
- **Expenses** (freelance per-hour, fixed monthly teacher cost) → movements of `EXPENSE`
  and `FIXED_COST` items. NB: teacher pay is currently modeled as *expense items*, **not**
  a payroll engine.
- **"How much came in this month"** → `profitMinor` in `/reports/pl`.

Real payroll rules (from `teacher-roster-payroll.md`) — **not yet implemented as an engine**:
- **Full-Time (7)**: per-person base salary (fixed cost) + overtime (weekday >4h/day,
  weekend >5h/day → 350฿/h) + off-site fuel + OT.
- **Part-Time (8)**: weekend day-rate (เหมา) + weekday hourly (per-person rate).
- **Freelance (8)**: actual hours × per-person rate (Private default 500฿/h;
  โต๊ด weekday 400฿; Group/Camp half 625฿ / full 1,250฿; ECA per-person) + per-SKU sale commission.

---

## 6. Open discrepancies / decisions for the human (raised by Porter)

These block clean requirement-writing. Porter will confirm with คุณฟีน before any REQ.

1. ~~Backoffice pivot to item-centric P&L vs. wallet+payroll ERP.~~ **RESOLVED
   2026-07-20 — stakeholder chose Path A (item-centric P&L).** No full payroll
   engine, no student hour-wallet. Freelance pay = per-teacher monthly "budget-stock"
   drawn down at the end-of-day cut → auto-disable at cap (→ **REQ-001**). FT/PT =
   manual `FIXED_COST`.
2. **backoffice-front is NOT 0%** (docs say greenfield). P&L + Items screens are live.
3. **Voucher sizes 5/10/15h** (code) vs **rate-card packs 1/4/6/10h**. Which is real?
4. **6-hour course max-extension = week 8** is a code assumption, never confirmed.
5. **ครูโต๊ด** is listed Part-Time but appears in a Freelance private-rate exception — confirm type.
6. **Seed data is still demo** everywhere — real 23 teachers + real programs/prices not seeded.
7. **Not production-ready**: auth stubbed (`SKIP_AUTH`/`SKIP_ADMIN_AUTH`), CORS `*`, no user
   management, LINE parent-push + bilingual bot pending, shared `__drizzle_migrations` table
   between the two backends (backoffice migrations get skipped — currently patched by hand).

---

## 7. Where to start reading (per role)

- **All**: workspace `docs/` (business-domain, product-catalog-pricing, teacher-roster-payroll,
  requirement-timeline) + each repo's `CLAUDE.md`.
- **Sober (SA)**: `smart-scheduler-back/src/services/scheduler.service.ts`,
  `backoffice-back/src/db/schema.ts` + `src/routes/api.ts` + `src/services/reports.service.ts`.
- **Jason (BE)**: the two `*-back` repos' `src/routes` + `src/services`.
- **Fern (FE)**: `smart-scheduler-front/src/components/partials/Calendar/`,
  `backoffice-front/src/components/partials/{Dashboard,Items}/`.
