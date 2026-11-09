# TASK-868 — BE: REQ-120 **Transportation: schools, trips, and transport pay lines** (backoffice-back) — @Bob — REQ-120 wk 2–3
**From @Silver, 2026-11-08. BUILD GO (owner, REQ-120 §14).** Contract: **SPEC-100 §3 / §5 / §9b**. Repo `smart-scheduler-backoffice-back`, branch `dong`. **No git command: git only on the owner's word.**
**Size 3.3 d** (sized 10-15).
**Starts after TASK-867,** once `bo.salary_profile.vehicle` exists, in 0009 or in Team B's own migration (step 1).

## Rules (REQ-120 R1.2, R1.6; readiness defaults standing per the owner 10-27)
- **Who:** everyone who drives (any type), per trip.
- **The rate:**
  - car: **6 ฿ / km, min 60 ฿**;
  - motorbike: **3 ฿ / km, min 40 ฿**.
  - The minimum applies **per trip** (per leg for a round trip? **No: per trip as entered**).
  - A round trip is distance × 2, and then the minimum applies once.
- **The school's distance is stored and editable** (R1.2: "the system stores each school's distance, editable").
- **The vehicle:**
  - comes from the person's profile (`bo.salary_profile.vehicle`);
  - **is snapshotted on the trip**, so a later profile change doesn't re-price old trips;
  - readiness Q22 default A: one stored distance; if a car is used, the admin edits that trip's km.
  - **The trip's km is editable per trip and defaults to the school's distance.**
- **R1.6:** "each transportation trip in full", so each trip is one pay line. Label: `<school> · <date dd/mm/yy> · <ไป-กลับ|เที่ยวเดียว> · <km> km`.
  - "ไป-กลับ" / "เที่ยวเดียว" must be strings the final UI already has. Check `final-ui`'s salary mock and screens. If they're missing, stop and tell me; no new words.
- **Who enters trips:** an admin or the CEO (R0: admins enter items). **But SPEC-100's routes are CEO-only today,** and R0.3 "admin-blind entry" is OUT of the thin subset. So **this TASK's routes are `requireRole("ceo", "admin")` for schools and trips. An admin's responses carry no ฿ amounts** (R0.2: an admin never sees pay). Only the CEO sees the computed amount.

## What to build
1. **Data, in Team B's `src/db/schema-salary-b.ts` (`bo` schema), one additive migration through the queue (host check first):**
   - **`bo.school`:** `id` · `name` (unique) · `distance_km` (numeric, > 0) · `active` · timestamps.
   - **`bo.transport_trip`:**
     - `id` · `teacher_id` (plain uuid, no cross-schema FK; SPEC-097's house pattern) · `date` · `school_id` (FK → `bo.school`) · `round_trip` (bool) · `km` (numeric, default the school's distance × (round_trip ? 2 : 1), editable) · `vehicle` (enum snapshot) · `note` · `created_by` · timestamps.
   - **Only if `vehicle` is NOT in 0009:** add `bo.salary_profile.vehicle` (`car` / `motorbike`, NULL) in this same migration. One line in the queue says so.
   - **Add `schema-salary-b.ts` to `drizzle.config.ts`'s `schema` array** (one line, after Team C's, DECISIONS row 7). TASK-863's read-only `public` refs already live in `schema-salary-b-read.ts`, which stays OUT of the config.
2. **Pure pricing:** `src/lib/transport-pricing.ts`: `tripAmountSatang(km, vehicle)` with the minimums. Integer satang.
3. **Routes** (`/salary/transport/*`, mounted in Jason's salary router: one line, after his DONE):
   - `GET / POST / PUT` schools: CEO + admin;
   - `GET / POST / PUT / DELETE` trips by period + teacher: CEO + admin, **no amounts for an admin**;
   - a trip in a locked period → 409 `LOCKED`.
4. **Lines:** `applyTransportLines(periodId)`, exactly like TASK-867's pattern:
   - `kind = 'transport'`, `source = 'auto'`, `source_ref = trip:<tripId>`;
   - idempotent; skip confirmed / locked / no-slip and list them;
   - a trip with no vehicle (profile null) → `SKIPPED_NO_VEHICLE`, listed.
   - Route: `POST /salary/periods/:id/apply-transport`, CEO only.
5. **No screen in this TASK** (Fanta's later TASK).

## Data (not yours to type)
- The school list + distances come from ขวัญ, as a DATA REQUEST through Porter when this TASK starts.
- Until then, test with `B-` schools on sid only. A host check comes first; never touch uat.

## Tests (each must fail when its code is removed)
- **Pricing:** 7 km car → 60 (minimum); 15 km car → 90; 10 km motorbike → 40 (minimum); 20 km motorbike → 60; a round trip doubles the km before the minimum.
- **The vehicle snapshot survives a profile change.**
- **The admin sees no amount;** the CEO does.
- **Locked → 409.**
- **Lines:** idempotent re-run; `SKIPPED_NO_VEHICLE` listed.

## Files (claim, Team B)
- `src/db/schema-salary-b.ts` (new; Team B's `bo` tables);
- `drizzle.config.ts` (one array entry);
- the one migration + its journal entry;
- `src/lib/transport-pricing.ts`, `src/services/transport.service.ts`, `src/routes/transport.ts` (mounted by one line in the salary router) + tests.
- Pure mirror test edits are pre-approved (tagged `🔻 TASK-868`, listed).

## Done =
- `tsc` 0 · BB SAFE suite green (before / after) · the migration `applied · verified` on sid with the host named · a mutation set over the pricing + the admin-no-amount rule.
- A report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.

## Update — @Silver, 2026-11-08
- **`bo.salary_profile.vehicle` already exists:** Team A's BB migration **0010** adds it as the enum `bo.vehicle` ('car', 'motorbike').
- So step 1's "only if vehicle is NOT in 0009" means **do not add it.** Read it from Team A's schema, and snapshot that enum value on the trip.
- Team B's migration holds only `bo.school` + `bo.transport_trip`. Take the next free number from MIGRATION-QUEUE at apply time (0011 is Team A's `source_ref`).
