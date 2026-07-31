# Project Understanding — Smart Scheduler (as-built, **refreshed 2026-08-01**)

> ⚠️ **This doc was badly stale until 2026-08-01** — it still described the pre-REQ-006 backoffice and had
> **every port wrong**. It is the "read first" doc for every role, so treat a stale entry here as a real hazard.
> **Porter maintains it. If you find it wrong, say so in the log rather than working around it.**

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
| `smart-scheduler-back` | Scheduling API (source of truth) | Bun + Hono + Drizzle, `public.*` **and `bo.*`** | **4006** | the bulk of the product; heavily extended since 2026-07-20 |
| `smart-scheduler-front` | Staff web — calendar · bookings · teachers · **people** | Next 16 + React 19 + Mantine v9 + TanStack Query | **3016** | all screens live |
| `smart-scheduler-backoffice-back` | Finance API — **`bo.*` only; `ops.*` RETIRED** | Bun + Hono + Drizzle | **4010** | serves only `/auth` + `/bo` |
| `smart-scheduler-backoffice-front` | Admin money UI | Next 16 + Mantine v9 (dark) | **3018** | P&L · Items · Tags, on the `bo` model |

- **One PostgreSQL (`smart_scheduler`), two schemas: `public.*`** (scheduling, owned by `-back`) **and `bo.*`**
  (finance, owned by `backoffice-back`). ⚠️ **`ops.*` is RETIRED** (REQ-006/TASK-027) — a drifted, empty `ops`
  shell still exists in the DB, which is why `migrate:bo` has to skip it. Don't write anything new against `ops`.
- **The freelance cap is NOT a cross-app call any more.** Scheduling reads/writes the teacher's ceiling as a
  **local `bo.item` in the same DB, inside the booking transaction** — no HTTP hop, no best-effort degrade.
- ⚠️ **TWO FULL SERVERS** (`sid` = som.develyst.online, current · `production` = frontoffice.develyst.online,
  intentionally older, what the customer tries). Each has **its own database**. See the board's ENVIRONMENTS
  block before any deploy discussion — this has already invalidated code-level debugging once.
- Living spec: `docs/requirement-timeline.md` (newest entry wins). Full as-built
  ID tracking lives in the separate `smart-scheduler-requirement` repo
  (`requirement.html`, `HANDOFF-2026-07-16.md`).

---

## 3. FRONT OFFICE — how it works today

**smart-scheduler-back (Scheduling API, port 4006)** — source of truth, client never trusted.
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
- ⚠️ **The `ops-client` HTTP bridge is GONE** (REQ-006/TASK-027). Scheduling now touches the
  **`bo.*` schema directly, in the same DB and the same transaction** — see §4.
- **Delivered since 2026-07-20 — do not re-discover these:**
  - **Freelance monthly cap is exact, not best-effort** (TASK-028 "reconcile-to-target"): every
    status change recomputes the teacher's draw to a target instead of applying deltas, so the
    invariant `held ∈ {0,1}` holds. CONSUMING = `CONFIRMED/ATTENDED/SICK_LEAVE/EXTENDED`;
    RELEASING = `NO_SHOW/CANCELLED/PENDING`. This closed a real money leak (toggle attend↔leave).
  - **Course quota is enforced server-side**: a `COURSE_PACKAGE` booking **requires `courseId`**
    (TASK-055 backstop + TASK-052 FE), which closed "free sessions" booked outside any course.
  - **LINE overhaul** (REQ-015/016): bilingual TH/EN (`line-i18n`), rebuilt parent + teacher rich
    menus, teacher schedule on LINE, role-switch for an already-linked user (TASK-046), and a PII
    fix (TASK-047).
  - **People management** (REQ-019): parents + students on the web, demographics (gender / DOB /
    province / nationality), and **suspend** — see §5b, it has a precise meaning.
  - Bulk-confirm bookings; sport/program shown on course cards; student-picker search fixed.
- **Scheduled jobs (both on `:4006`, header `x-internal-secret` = `INTERNAL_JOB_SECRET`):**
  `POST /internal/jobs/end-of-day` (nightly) and `POST /internal/jobs/month-reset` (1st of month).
  🔴 **Neither is registered in Windows Task Scheduler on the server yet** — a long-standing open
  item, and REQ-023's 08:00 digest inherits the same trap.

**smart-scheduler-front (Staff UI, port 3016)** — internal staff only (not students/parents).
- Screens: Calendar (day/week, filters by teacher type/name/badge; create + view/action
  modals), Teachers (activate by teacher/type, drag-drop ordering, work-days, freelance
  limit), Bookings (table + course/voucher panels + create modals), Badges CRUD,
  Dashboard, Reports (daily), public Check-in page.
- One data layer: `services/scheduler.service.ts` → Axios → API; `NEXT_PUBLIC_USE_MOCK`
  offline mode; NextAuth v5 beta login (still placeholder "admin").

---

## 4. BACK OFFICE — how it works today

> 🔴 **REWRITTEN 2026-08-01.** Everything this section said before — `ops.*`, `catalog_items`,
> `stock_balances`, `accounts`, `commercial_requests`, `price_rules`, `GET /reports/pl`,
> `SKIP_ADMIN_AUTH`, ports 3002/3100 — **was superseded by REQ-006 and is no longer true.**
> If you are working from a memory of the old model, drop it.

**The pivot, in one line:** the stakeholder's direction was *"เดิมใช้ db แยก ตอนนี้ให้มันใช้รวมกันไปเลย และ
design backoffice ให้ easily และ scalable"* — stop running a separate ops database with its own vocabulary,
and give the backoffice a **small, general model** instead of a table per business noun.

**smart-scheduler-backoffice-back (Finance API, port 4010)** — serves **`/auth` + `/bo` only**.
- **Same database as scheduling** (`smart_scheduler`), own schema **`bo`**. No HTTP bridge between
  the two apps any more: scheduling reads and writes `bo` **inside its own transaction**, which is
  what made the freelance cap exact rather than best-effort.
- The model is deliberately **generic and few-tabled** — an **item** with **movements** against it,
  plus **tags** for classification. New money concepts are meant to arrive as *new items/tags*,
  **not new tables**. That is the "easily & scalable" the stakeholder asked for, and it is why the
  freelance monthly ceiling is simply *an item you draw down*.
- **Real admin auth is live** (REQ-002). `SKIP_ADMIN_AUTH` is history.
- ⚠️ **Migrations:** the two backends historically shared one `__drizzle_migrations` table, and a
  drifted empty `ops` schema still sits in the DB. `bun run migrate:bo` (run from **backoffice-back**)
  is the drift-safe path (TASK-030). **A migration file that is not registered in
  `drizzle/meta/_journal.json` is silently skipped by `db:migrate`** — that has bitten us once
  (TASK-042). Always check the journal after adding a migration.

**smart-scheduler-backoffice-front (Admin UI, port 3018)** — Mantine dark theme, same layering as the
frontoffice (page→partial→hook→service→API). P&L / Items / Tags over the `bo` model.

**Placement rule (settled):** **money and executive reporting live on the backoffice; daily staff work
lives on the frontoffice.** That is why teacher management, people management and the calendar are all
on the frontoffice even though they touch money-adjacent data.

---

## 5. Money model — how the stakeholder's questions get answered

Stakeholder's four goals → current implementation, **all on the `bo` item + movement model**:
- **Stock in / out / restock** → movements against an item.
- **Revenue** → sale movements of income-type items.
- **Expenses** (freelance per-hour, fixed monthly teacher cost) → movements of expense-type items.
  NB: teacher pay is modeled as *expense items*, **not** a payroll engine.
- **"How much came in this month"** → the P&L report on the backoffice.

**The freelance budget-stock, spelled out** — this is the load-bearing money rule and the one that has
already caused a real leak, so know it before touching booking status code:
- Each freelance teacher has a **monthly ceiling as a `bo` item**. Confirming a booking **draws** from it.
- **Reconcile-to-target, never delta**: on every status change the system recomputes what this booking
  *should* be holding and moves to that number. Invariant: **`held ∈ {0,1}` per booking.**
- **CONSUMING** = `CONFIRMED / ATTENDED / SICK_LEAVE / EXTENDED` · **RELEASING** = `NO_SHOW / CANCELLED / PENDING`.
- On the calendar (REQ-007) a freelance teacher shows a **%-used strip** (🟢 0–30 · 🟡 30–70 · 🔴 70–<100)
  and is **hidden entirely at 100% / when the next booking would exceed the ceiling**. There is deliberately
  **no override-to-book** — the ceiling exists precisely to stop that.

### 5b. "Suspended" — the exact definition (REQ-019, settled by คุณฟีน 2026-08-01)

A suspended parent/household:
- is **blocked from the LINE bot and from new bookings** — **enforced server-side**, not hidden in the UI;
- has their students **not listed at all** in booking pickers (not shown-and-disabled) —
  *"แล้วเขากดระงับไปทำไม"*;
- **cannot buy** a course or voucher (selling something we can't schedule creates a refund conversation);
- keeps **everything they already have**: existing courses, vouchers, bookings and history are untouched,
  and they stay visible on the People screen. Suspension stops *new* activity; it never erases.
- ⚠️ Implementation trap already hit: the selling screens **share** `GET /students?q=` with non-selling
  uses, so this must not become a blanket filter on that endpoint.

Real payroll rules (from `teacher-roster-payroll.md`) — **not yet implemented as an engine**:
- **Full-Time (7)**: per-person base salary (fixed cost) + overtime (weekday >4h/day,
  weekend >5h/day → 350฿/h) + off-site fuel + OT.
- **Part-Time (8)**: weekend day-rate (เหมา) + weekday hourly (per-person rate).
- **Freelance (8)**: actual hours × per-person rate (Private default 500฿/h;
  โต๊ด weekday 400฿; Group/Camp half 625฿ / full 1,250฿; ECA per-person) + per-SKU sale commission.

---

## 6. Open discrepancies / decisions for the human (raised by Porter)

These block clean requirement-writing. Porter will confirm with คุณฟีน before any REQ.

**Closed since 2026-07-20** (kept as history so nobody re-opens them):
1. ~~Backoffice pivot~~ **RESOLVED** — item-centric, and then taken further by REQ-006 into the
   shared-DB `bo` model (§4). No payroll engine, no student hour-wallet.
2. ~~backoffice-front is 0%~~ — it was never 0%, and it has since been rebuilt on `bo`.
3. ~~Auth stubbed~~ — real admin auth landed (REQ-002).
4. ~~Freelance cap is best-effort over HTTP~~ — now exact and transactional (§5).
5. ~~Migrations silently skipped~~ — **understood, not gone**: `migrate:bo` is the safe path and the
   drizzle **journal** must list every migration. Still a live footgun; see §4.

**Still open:**
1. **Voucher sizes 5/10/15h** (code) vs **rate-card packs 1/4/6/10h**. Which is real?
2. **6-hour course max-extension = week 8** is a code assumption, never confirmed.
3. **ครูโต๊ด** is listed Part-Time but appears in a Freelance private-rate exception — confirm type.
4. **Seed/real data**: the real freelance roster's budgets have not been verified end-to-end in the FE,
   and some figures on screen are still placeholders.
5. 🔴 **No scheduled task is registered on the server** — end-of-day, month-reset, and (when it ships)
   the 08:00 digest. Features that depend on them are silently dead until this is done.
6. **Expired-voucher red alert** has never been verified.
7. **REQ-017 (teacher `.ics` calendar) is PARKED**: LINE does not linkify `webcal://`, and the Google
   Calendar mobile app cannot add a calendar by URL. `calendarUrls()` already returns **both** an
   `https` and a `webcal` URL but only the `webcal` one is sent. Likely fix = a small landing page.
8. **REQ-021 (badge system) is parked at the stakeholder's request** — badges are her own flexible
   tagging (e.g. future branches), lowest priority. Known weaknesses: cannot be removed/deactivated,
   and the badge **report silently drops untagged rows** (so: badge *filters* are fine, badge *totals*
   are not).
9. FE `lint` is broken on Next 16.

---

## 7. Where to start reading (per role)

- **All**: workspace `docs/` (business-domain, product-catalog-pricing, teacher-roster-payroll,
  requirement-timeline) + each repo's `CLAUDE.md`.
- **Sober (SA)**: `smart-scheduler-back/src/services/scheduler.service.ts` (booking + status +
  the freelance draw), `src/db/schema.ts`, and `backoffice-back`'s `bo` schema. Then the newest
  entries in `ai-worker/requirements/`.
- **Jason (BE)**: the two `*-back` repos' `src/routes` + `src/services`; plus
  `src/services/line-webhook.service.ts`, `src/lib/line-rich-menu.ts`, `src/lib/calendar-link.ts`
  for anything LINE. ⚠️ `src/lib/ops-client.ts` is legacy — don't build on it.
- **Fern (FE)**: `smart-scheduler-front/src/components/partials/Calendar/` (incl.
  `Modal/BookingModal.tsx`), `partials/Bookings/` (`BookingsTable`, `CoursePackagePanel`,
  `VoucherPanel`), and the People screen. Backoffice screens are the `bo`-model ones.

---

## 8. Three rules that have each cost us a day

1. **Check WHICH SERVER before debugging.** A dead LINE menu was chased through three code-level
   hypotheses; the actual cause was the **webhook pointing at the older `production` server**.
   Symptoms reported by the customer come from the **old** version — check `sid` first.
2. **A migration not in `drizzle/meta/_journal.json` does not run.** It fails silently.
3. **Route order shadows.** `PATCH /teachers/availability` was being matched by `/teachers/:id`
   (`invalid input syntax for type uuid: "availability"`). Put literal paths before parameterised ones.
