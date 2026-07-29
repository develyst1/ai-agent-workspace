# TASK-031: scheduler-front — freelance budget strip on the calendar + keep over-cap selectable + per-action override
- Source: SPEC-008
- Status: DONE — but ⚠️ **SUPERSEDED 2026-07-28** by the REQ-007 revision (คุณฟีน): the "bookable + override"
  design is replaced by **hide-when-full + %-used strip** → see **TASK-032**. This task's code (bookable-over-cap,
  confirm/attend override) is being reverted by TASK-032; kept here as the historical record of the first,
  correct-to-the-old-requirement build. (Original: re-reviewed 2026-07-28 by Sober — tsc 0 / test 4/0 / build ok.)
- Depends on: none (backend already ships the data + enforces the override-gated confirm — no BE task)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
Make each freelance teacher's monthly budget status visible on the staff calendar, keep over-cap freelances
**selectable** (stop hiding them), and gate booking-past-cap behind a **deliberate per-action override** at
confirm. All data + enforcement already exist on the backend — this is a frontoffice-FE-only change.

**1. Keep over-cap freelances visible + selectable** — `src/lib/scheduler/teacher.ts`, `toTeacherView`:
- Change `bookable` from `active && !overLimit && !setupIncomplete` → **`active && !setupIncomplete`** (drop
  `!overLimit`). Keep computing `overLimit` (it now drives the red strip, not hiding).
- Effect: an over-cap freelance stays a calendar column and is selectable in the booking + course-create
  modals. `setupIncomplete` (no budget set) still suppresses — leave that as-is.
- Check every consumer of `TeacherView.bookable` / `overLimit` (calendar columns, `BookingModal`,
  `CreateCourseModal`) still behaves — they should now show the teacher; nothing should hard-hide on `overLimit`.

**2. Budget strip on each freelance calendar column** (green→yellow→red), from the DTO satang fields the
calendar already receives (`budgetMinor`, `remainingMinor`, `reorderMinor`, `overLimit`, `type`):
- **red** = `overLimit` (`remainingMinor ≤ 0`); **yellow** = `reorderMinor != null && remainingMinor ≤
  reorderMinor` (and not red); **green** = otherwise. `reorderMinor` null → no yellow (green until red).
- Only FREELANCE columns get a strip. Put it on the teacher column header (`CalendarHeader.tsx` /
  `CalendarGrid.tsx` / `CalendarWeekGrid.tsx` — wherever the teacher column head renders). A small helper
  (e.g. `budgetTone(remainingMinor, reorderMinor)` in `lib/scheduler/teacher.ts`) keeps it testable + reused
  day/week. Optionally show "remaining ฿ / budget ฿" text alongside the color. Display-only — do not recompute
  budget on the FE.

**3. Per-action override at confirm** (the safeguard; the draw happens at confirm):
- When confirming a booking, if the backend returns **`INSUFFICIENT_BUDGET`** (over-cap freelance, no override),
  show its Thai message and offer a **deliberate override** — a confirm dialog (e.g. "งบครูฟรีแลนซ์เต็มแล้ว —
  ยืนยันจองเกินงบ?") whose confirm **re-sends** the same confirm with `override: true`.
- The confirm request is `PATCH /bookings/:id/status` with body `{ action: "confirm", override: true }` — add
  the `override` field to that call path (wherever the booking confirm mutation lives — `BookingModal.tsx` /
  the bookings service/hook). On success, proceed normally (budget may go negative).
- **Suppress the override dialog when the teacher has the durable `limitOverride` set** — the backend already
  confirms without a block for them; still show the true-remaining strip (red if over).

## Definition of Done
- [ ] On the calendar, a freelance with healthy budget shows green, near-cap yellow, at/over-cap red — matching
      the backend `remainingMinor`/`reorderMinor`/`overLimit` (no FE recompute of "which hours count").
- [ ] An over-cap freelance is still shown as a column and is selectable in booking + course-create modals
      (not hidden). `setupIncomplete` teachers stay suppressed.
- [ ] Confirming an over-cap freelance **without** override → clear blocked message; **with** override (via the
      dialog) → it proceeds and remaining may go negative. Override is reachable from the calendar booking flow.
- [ ] A teacher with durable `limitOverride` set confirms without the extra dialog; the strip still shows true
      remaining.
- [ ] No regression on the "Teachers" page budget display.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds. (Repo `lint` is known-broken on Next 16 — not this
      task; don't gate on it.) Add/update a unit test for `budgetTone(...)` (pure) covering green/yellow/red +
      null reorder.

## Implementation Notes
**Fern — DONE, ready for review (2026-07-28). All 3 parts + DoD verified. `smart-scheduler-front` only; no BE touch.**

Backend premise held: the calendar teacher DTO already carries `remainingMinor`/`budgetMinor`/`reorderMinor`/
`overLimit`/`limitOverride`/`type` (via `getCalendar → attachFreelanceBudgets` → mapper) — no BE gap found.

**1. Keep over-cap freelances visible + selectable** — `src/lib/scheduler/teacher.ts` `toTeacherView`:
- `bookable` changed `active && !overLimit && !setupIncomplete` → **`active && !setupIncomplete`** (line 36).
  `overLimit` is still computed (unchanged formula: `FREELANCE && overLimit && !limitOverride`) — now a pure
  **display** flag. `setupIncomplete` still suppresses (SPEC-004, untouched).
- Verified all `bookable`/`overLimit` consumers: calendar day/week grids + header filter + `bookableOnDate`
  now show over-cap freelances; `TeachersContent` reads `overLimit` for its own styling/activate-toggle and is
  **unaffected** (formula unchanged) → no Teachers-page regression.

**2. Budget strip** — new `src/components/partials/Calendar/FreelanceBudgetStrip.tsx` (display-only), rendered in
the teacher column head of **both** `CalendarGrid.tsx` (day) and `CalendarWeekGrid.tsx` (week). Colour from a new
pure helper `budgetTone(remainingMinor, reorderMinor)` in `teacher.ts` (red = remaining ≤ 0; yellow = reorder set
& remaining ≤ reorder; green else; null reorder → green-until-red; returns null → no strip when no budget data).
Only FREELANCE columns get a strip. Shows `฿remaining / ฿budget` text (satang → baht, `th-TH`), never recomputed
on the FE.

**3. Per-action override at confirm** — mirrors the existing sick-leave override pattern exactly:
- `services/scheduler.service.ts`: `confirmBooking(id, override=false)` → sends `{action:"confirm", override:true}`
  only when overriding.
- `hooks/scheduler/useScheduler.ts`: `useConfirmBooking` mutationFn now takes `{ id, override? }` (sole caller is
  `BookingModal`, updated).
- `BookingModal.tsx` `handleConfirm(override=false)`: on `INSUFFICIENT_BUDGET` (`ApiClientError.code`) shows the
  backend Thai message in a red Alert with a **"ยืนยันจองเกินงบ"** button that re-sends with `override:true`;
  other errors re-throw. A teacher with durable `limitOverride` never hits this (backend allows negative) → no
  dialog for them, but the strip still shows true remaining (red if over). Wrapped the confirm button
  `onClick={() => handleConfirm()}` so the click event isn't passed as `override`.

**i18n:** added `booking.budgetFullTitle` / `booking.budgetOverrideBtn` + `calendar.freelanceBudget` to **both**
`en` and `th` (dictionary shape mirrored).

**Test infra note:** this FE repo had **no test runner/tests** and no `bun-types`, and `tsconfig` type-checks
`**/*.ts`. To satisfy the DoD's `budgetTone` test without breaking `tsc`, I added the pure test as
`src/lib/scheduler/teacher.test.ts` (`bun:test`) and excluded `src/**/*.test.ts` from `tsconfig` (app typecheck).
Flag if you'd rather add `bun-types` + include tests in tsc instead.

**Verification (all clean):**
- `bunx tsc --noEmit` → 0 errors.
- `bun test src/lib/scheduler/teacher.test.ts` → **4 pass / 0 fail** (green/yellow/red + null-reorder + no-data).
- `bun run build` → compiled successfully, all 11 routes generated.
- Not run against a live backend (brownfield). `bun run lint` not run — known-broken on Next 16 (per DoD, not gated).

**Rework (2026-07-28, Fern) — added the Attend-path override per Sober's `## Review`:**
- `services/scheduler.service.ts` `markAttended(id, override=false)` → sends `{action:"attend", override:true}`
  only when overriding (mirrors `confirmBooking`). No BE change — the status route already passes `override` to
  `reconcileFreelanceDraw` for every action.
- `hooks/scheduler/useScheduler.ts` `useMarkAttended` mutationFn now takes `{ id, override? }` (sole caller is
  `BookingModal`, updated).
- `BookingModal.tsx`: `handleAttended(override=false)` now has the same try/catch as confirm; on
  `INSUFFICIENT_BUDGET` it opens the shared override Alert. Generalized the block state
  `budgetError:string` → **`budgetBlock:{message,action:"confirm"|"attend"}`** so the one Alert re-sends the
  **correct** action with `override:true` (confirm-block re-confirms, attend-block re-attends). Wrapped the
  Attend button `onClick={() => handleAttended()}` so the click event isn't passed as `override`. Reused the
  generic `booking.budgetFull*` keys (no new i18n).
- Durable `limitOverride` teachers still never see the dialog (backend allows negative) — unchanged.
- **Re-verified:** `bunx tsc --noEmit` → 0; `bun test` → 4/0; `bun run build` → success (11 routes).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- **Non-blocking flag (does NOT hold this task) → @Sober.** Dropping the `overLimit` hide now makes an over-cap
  freelance selectable, so staff can also place a PENDING and hit **"มาเรียน" (Attended) directly**, skipping
  Confirm. Since TASK-028 made the backend reconcile the draw on *every* status transition, a direct
  PENDING→ATTENDED on an over-cap freelance would also throw `INSUFFICIENT_BUDGET` — and `handleAttended` has no
  override path (SPEC-008 scoped the override to **confirm**, so I built only that). Options if you want it
  closed: (a) mirror the same override dialog on the Attend action, or (b) accept confirm-first as the intended
  flow. I did **not** expand scope; flagging for your call — happy to take a follow-up task if (a).
- Backend needed no change (verified): calendar DTO carries the budget fields and `PATCH /bookings/:id/status`
  accepts `override`. No missing-field gap encountered.

## Review
**Verdict: REWORK 🔁 (Sober, 2026-07-28) — small additive fix; your core is correct & verified.** Parts 1–3
match SPEC-008 and are well-built. The one change is closing a reachable dead-end that my SPEC under-scoped
(the override lived only on confirm) — **this is a spec correction I own, not a defect in your build.**

**Verified (core is sound):** re-ran in `smart-scheduler-front` — `bunx tsc --noEmit` → 0; `bun test
src/lib/scheduler/teacher.test.ts` → 4/0. Inspected `teacher.ts` (`bookable` drops `!overLimit`; `budgetTone`
red/yellow/green/null all correct) and `BookingModal` confirm-override (re-sends `override:true` on
`INSUFFICIENT_BUDGET`; suppressed for durable `limitOverride`). Build reported green (11 routes). Good work.

**Answer to your flag — take option (a): mirror the override on the Attend action.** Confirmed the dead-end is
**reachable**: the **Attend button (`BookingModal.tsx:367–376`) has no status gate** — it renders for `PENDING`
too (only Confirm is gated to `PENDING`). So on an over-cap freelance a staffer can click "มาเรียน" straight
from `PENDING` → `handleAttended` → backend reconciles the draw at ATTENDED (held 0→1) → `INSUFFICIENT_BUDGET`
→ and `handleAttended` has no override path → **stuck, no clear message, no way past.** That violates REQ-007
AC #3/#4 ("blocked with a clear message; with override it proceeds; override reachable at the booking flow").
Because REQ-007 makes over-cap freelances selectable, this path is newly reachable — so it's in scope.

**Rework (small — mirror your existing confirm pattern onto Attend):**
- `handleAttended` (`:222`): accept `override = false`; on `INSUFFICIENT_BUDGET` show the same red Alert +
  "ยืนยันจองเกินงบ" button that re-sends with `override: true` (identical to `handleConfirm`); other errors re-throw.
- `useMarkAttended` / the `markAttended` service: take `{ id, override? }` and send `override` on
  `PATCH /bookings/:id/status {action:"attend", override}`. **Backend already honors it** — the status route
  passes `override` to `reconcileFreelanceDraw` for *every* action (verified), so **no BE change**.
- Reuse the existing `booking.budgetFull*` i18n keys (they're generic); add an attend-specific title only if the
  copy needs it.
- Durable `limitOverride` teachers never hit the block (backend allows negative) → no dialog for them, unchanged.
- **Leave everything else as-is** — parts 1–3 are accepted; this only adds the Attend override.

**DoD addition:** confirming **or directly attending** an over-cap freelance without override → clear blocked
message + reachable override; with override → proceeds (budget may go negative). Re-run `tsc` + the test +
`bun run build` → REVIEW.

**Non-blocking accepted:** the `tsconfig` exclude of `src/**/*.test.ts` to add the pure `budgetTone` test is a
fine pragmatic call for a repo with no test runner — keep it. (A future infra task could add `bun-types` +
include tests in `tsc`; not this task.)

---

**Re-review verdict: DONE ✅ (Sober, 2026-07-28).** The Attend-path override rework is correct and closes the
AC gap; parts 1–3 unchanged.
- **Verified in code:** `handleAttended(override=false)` (`BookingModal.tsx:223`) now mirrors `handleConfirm` —
  on `INSUFFICIENT_BUDGET` it sets `budgetBlock{message, action:"attend"}`, else re-throws. The block state was
  cleanly generalized to `{message, action:"confirm"|"attend"}`; the **one** shared red Alert (`:341–365`)
  re-sends the **correct** action with `override:true` (`action==="confirm" ? handleConfirm(true) :
  handleAttended(true)`). The Attend button is wrapped `onClick={() => handleAttended()}` (no event-as-override).
  `markAttended(id, override)` (`services:323`) sends `{action:"attend", override:true}` when set; `useMarkAttended`
  passes it through. Durable `limitOverride` teachers never hit the block (unchanged). Nice: reused the generic
  `budgetFull*` i18n + a single Alert rather than duplicating.
- **Verified myself:** `bunx tsc --noEmit` → 0; `bun test teacher.test.ts` → 4/0; `bun run build` → success
  (all routes incl. `/scheduler/calendar` generated, standalone copied).
- **All DoD met:** strip green/yellow/red from backend fields · over-cap selectable (`setupIncomplete` still
  suppressed) · confirm **and** direct-attend of an over-cap freelance → clear block + reachable override →
  proceeds with override · durable-override no dialog · no Teachers-page regression · tsc + test + build clean.
- **TASK-031 → DONE.** It's REQ-007's only task → **REQ-007 → SPEC_DONE** (→ @Porter for acceptance; ships on
  the next frontoffice deploy). Backend untouched (correctly — verified twice).
