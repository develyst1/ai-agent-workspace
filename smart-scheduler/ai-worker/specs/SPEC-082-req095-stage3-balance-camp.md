# SPEC-082 — `REQ-095` Stage 3: "Balance camp" — the DAY entitlement (Sober, 2026-09-19) — sizes + decisions, NOT cut

**Owner rulings (REQ-095 §6, via Porter 09-19):** a NEW day-based course "Balance camp" (Full/Half day × Full-week/Daily); cut BY DAY; **unused days become a CREDIT like a paused course, NO expiry**; the ADMIN creates/opens each camp WEEK (not necessarily adjacent weeks); a child applies leftover credit-days into any future OPEN week; kids enter/leave per day. Money: the sale posts here like a course (the backoffice holds the teacher side).

## §0 What exists / does not (the read)
- **Nothing is a DAY.** Courses = weekly hour sessions + quota + expiry; vouchers = hour buckets; `OTHER`/`GROUP` = hour rows. The day-end job attends hour rows. **A camp is three net-new objects**, not a course shape.
- **Reusable:** the sale post (`postBookingSale`/`recordSale` + `sale:ensure-items` — additive items), the pause/credit idea (a `PAUSED` course keeps its balance), the reminder pipeline (one more row kind), the RBAC keys (menu + actions), the owner's `NO expiry` (nothing to reuse — that IS the simplification: no expiry engine).

## §1 The model (one migration, `0042_camp`)
1. **`camp_weeks`** — the admin-opened container: `id` · `name` · `start_date` · `end_date` (any 1–7 consecutive days; "week" is the owner's word, not a rule) · `capacity` (per day, nullable = unlimited) · `teacher_ids` (informational list — ⚠ §4.3) · `status OPEN|CLOSED` · `opened_by/at`. No bookings rows are created by opening a week.
2. **`camp_packages`** — the child's DAY entitlement (the sale): `student_id` · `kind FULL|HALF` · `plan FULL_WEEK|DAILY` · **`total_units`** · **`used_units`** · `sale_id` · `created_by/at` · `paused_note`. **Units, not days:** a FULL day = 2 units, a HALF day = 1 — integers, so "credit" never becomes 0.5 (⚠ §4.2). Credit = `total − used`. **No expiry column exists** (the owner's rule made structural — nothing can later "add expiry" without a migration, which is the point).
3. **`camp_days`** — one row per child per date: `camp_package_id` · `camp_week_id` · `date` · `half AM|PM|FULL` · `status PLANNED|ATTENDED|ABSENT|CANCELLED` · `units` (2 or 1, copied at planning) · `marked_by/at`. UNIQUE `(camp_package_id, date)`. A PLANNED row RESERVES units (credit shown = total − used − planned); ATTENDED consumes (`used += units`); CANCELLED/ABSENT before the cut releases them (⚠ §4.4 leave rule).

## §2 The flows
- **Open a week** (`POST /camp/weeks`, key `menu:camp` + `action:camp.week-open`): dates, name, capacity, teachers. Close/reopen; a week with planned days cannot be deleted (there is no delete anyway — the product's rule).
- **Sell a camp** (`POST /camp/packages`): child · kind · plan (FULL_WEEK ⇒ units = 5 days × kind; DAILY ⇒ `days` × kind) · optional first week + dates ⇒ the package + its PLANNED rows in one tx · **the sale posts at creation like a course** — items net-new (⚠ §4.1 prices): `camp-full-week`, `camp-half-week`, `camp-full-day`, `camp-half-day`.
- **Redeem credit** (`POST /camp/packages/:id/days { weekId, dates[], half }`): each date must be inside an OPEN week, within capacity, units ≤ credit ⇒ PLANNED rows; `409 CAMP_FULL` / `409 CAMP_NO_CREDIT` naming the date. This is the ONE writer for planned days (the sale's first week calls it).
- **Enter / leave per day** (`PATCH /camp/days/:id { status }`): ATTENDED by the staff (the check-in of a camp day — no QR in 3a), ABSENT/CANCELLED releases the units back to credit (⚠ §4.4: is a same-day no-show charged?).
- **The day cut:** `runEndOfDayJob` gains a second sweep — today's PLANNED camp days ⇒ ATTENDED, `used += units` (the start-based ruling applies: the day has started) — one more block in the same tx, its own `job_runs` counters (`campDaysAutoAttended`).
- **Reads:** the Camp page (weeks → per-day roster with kind/half chips and the count vs capacity; a child's package with credit/used/planned and its history); the student's profile gains a *Camp* card (packages + credit); the calendar shows a **day banner** per open week (name · `n kids`) — no hour cells; the coach's reminder gains a `Camp : <name> — n kids (AM x · PM y)` line per teacher on the week; the parent's LINE gets a day reminder (⚠ §4.6 words).
- **Money after the sale:** none — no per-day revenue posting (the sale posted the whole package); ⚠ §4.7 whether a day-attended revenue line is wanted like hourly sessions (today's model posts course revenue at ATTENDED per session — a camp posts once at sale, as the owner's "like a paused course credit, no expiry" implies a prepaid bucket).

## §3 Sizes
| stage | what | size |
|---|---|---|
| **3a** | `0042` (three tables, no enum — preflight splits nothing) · weeks · packages + sale · redeem · per-day status · the day cut · Camp page + student card + calendar banner · keys (`menu:camp`, `action:camp.week-open`, `action:camp.sell`, `action:camp.redeem`, `action:camp.day-mark` — 51st–54th) · `sale:ensure-items` +4 | **BE L · FE L** |
| **3b** | the coach reminder line · the parent's day reminder + its words · a camp day's QR check-in (if wanted) · the backoffice revenue line per attended day (§4.7, if wanted) | **BE M · FE S** |
Total: **BE L+M · FE L+S**, 1 migration (+0 if 3b needs none). The biggest single piece: the Camp page (a new menu, three views).

## §4 Decisions that need the OWNER — before 3a is cut
1. **Prices** of the four camp items (Full week / Half week / Full day / Half day, VAT-incl) — net-new; without them the sale cannot post.
2. **Half-day accounting:** a HALF package's unit = 1, a FULL day = 2, so a Full-week Full = 10 units, and a child on a FULL package may spend 1 unit on a half day (credit in halves). Or are Full and Half packages separate currencies (a Full package cannot buy a half day)? *Recommend: one currency in half-day units.*
3. **Teacher slots:** does a camp week BLOCK its teachers' hourly slots for those days (the ECA shape — an OTHER row per hour, or a whole-day block), or is the teacher list informational? *Recommend: informational in 3a; a whole-day block is a 3b item if double-booking actually happens.*
4. **Leave rule per day:** a day cancelled before it starts ⇒ units back to credit (recommend); a no-show on the day ⇒ ABSENT, units CONSUMED (as a session's auto-attend) — or returned? *Recommend: consumed — the day cut is the same rule as sessions.*
5. **Capacity** per week per day (a number, or none)? *Recommend: a nullable number; none = unlimited.*
6. **Words** for the parent's day reminder and the coach's camp line (3b).
7. **Per-attended-day revenue** to the backoffice, or the one sale at purchase only? *Recommend: sale only (the owner's "credit like a paused course" is a prepaid bucket).*
8. **Credit ↔ hours:** can leftover camp credit convert to hourly sessions or vice-versa? *Recommend: no — separate currencies; a refund/goodwill stays a backoffice matter.*

## §5 Non-goals
No expiry, ever, by structure · no hour rows for camp days · no Camp LINE flows for parents beyond the reminder (3b) · no change to courses, vouchers, OTHER, GROUP · no payroll.
