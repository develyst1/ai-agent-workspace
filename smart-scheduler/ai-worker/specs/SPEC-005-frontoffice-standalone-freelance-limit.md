# SPEC-005: Frontoffice-standalone freelance limit (re-home from ops → scheduling)
- Source: REQ-004
- Status: DONE (tasks 019/020 DONE — 2026-07-20; TASK-019 month-reset idempotency guard = required fast-follow before deploy)
- Context: STRATEGIC PIVOT — backoffice is being torn down/rebuilt. Frontoffice must stand alone.
  This **re-homes** REQ-001's freelance cap into scheduling `public`; supersedes the ops-side
  freelance budget for now. **Limit-only** (no P&L/expense); FT/PT salary deferred. REQ-003 ON HOLD.

## Overview
Move the freelance budget/rate/remaining + cap enforcement + monthly reset out of ops and **into
the scheduling app**, managed by a frontoffice screen, enforced locally, **with zero backoffice
calls**. The FE display (`remaining/budget`, near-cap, `overLimit` auto-hide, override) is reused —
just re-sourced from local data.

### As-built (what we re-home) — from `smart-scheduler-back/src/lib/ops-client.ts`
- Budget/rate/remaining live in an ops `FREELANCE_BUDGET` catalog item; scheduling reads them via
  `fetchTeacherQuotas` (5-min cache) and merges onto the teacher DTO in `attachTeacherQuotas`
  (`hourlyRate`/`budgetMinor`/`remainingMinor`/`reorderMinor`/`overLimit`).
- Booking commit draws down via `drawFreelanceBudget` (ops OUT, 409→blocked); cancel/leave reverses
  via `releaseFreelanceBudget`. Monthly reset is the **ops month-start job**. Override is already
  local (`app_settings` `limitOverride`).

### The re-homing (net effect)
- Budget/rate/remaining → a **scheduling `public` table**. Drawdown/reversal/cap → **local, in the
  booking DB tx** (now atomic — removes the cross-system orphan edge + the 5-min cache staleness).
  Monthly reset → a **scheduling internal job**. Admin set/edit/top-up → **frontoffice screen**.
- **Stop all scheduling→ops freelance calls**; leave the ops-client freelance functions **dormant**
  (not deleted — the backoffice rebuild may reuse them; Porter's "least churn").

## Data model (scheduling `public`, migration)
New table **`freelance_budgets`**:
| Column | Type | Notes |
|--------|------|-------|
| `teacher_id` | uuid PK → `teachers.id` (onDelete cascade) | one row per freelance with a budget |
| `monthly_budget_minor` | integer NOT NULL | configured monthly budget (satang) |
| `rate_minor` | integer NOT NULL | per-job drawdown = rate × 1h (bookings are 1h) |
| `remaining_minor` | integer NOT NULL | current remaining; may go < 0 under override |
| `reorder_minor` | integer NULL | near-cap warning threshold (satang) |
| `updated_at` | timestamptz | |
Override stays in `app_settings` (`limitOverride`, existing). No row = "budget not set" (setup-incomplete).

## API — scheduling
- **`PUT /teachers/:id/budget`** `{monthlyBudgetMinor, rateMinor, reorderMinor?}` (admin) — upsert. On
  first set, `remaining_minor = monthlyBudgetMinor`. On edit, budget/rate/threshold change; **remaining
  is not overwritten** (edit = next-reset target; use top-up to change remaining now — mirror the ops rule).
- **`POST /teachers/:id/budget/topup`** `{amountMinor}` (admin) — `remaining_minor += amount`.
- **`POST /internal/jobs/month-reset`** (`INTERNAL_JOB_SECRET`) — set `remaining_minor = monthly_budget_minor`
  for all rows. Idempotent within a month is not required (a re-run just re-resets); a monthly Windows task
  invokes it on the 1st. (Replaces the retired ops month-start job for freelance.)
- Existing `PATCH /teachers/:id/limit-override` unchanged.

### Local enforcement (replaces the ops calls)
- **`attachTeacherQuotas`** (or a new local `attachFreelanceBudgets`): read `freelance_budgets` by
  teacherId and set `hourlyRate=rate_minor/100`, `budgetMinor`, `remainingMinor`, `reorderMinor`,
  `overLimit = remaining_minor <= 0` on the DTO — **from the local table, no ops fetch**. Same DTO
  field names → the FE display is unchanged.
- **Booking commit** (in `insertBooking`/confirm, same tx): for a FREELANCE teacher with a budget row,
  if `remaining_minor < rate_minor` and no override → **block** (`badRequest`/409 "งบเต็ม — เติมงบหรือปลดล็อก");
  else `remaining_minor -= rate_minor` (may go negative under override). **Atomic with the booking.**
- **Cancel / customer-leave**: `remaining_minor += rate_minor` (only if it had been drawn).
- **`setupIncomplete`** (booking gate): FREELANCE ⇒ **no `freelance_budgets` row** → not bookable.
  FT/PT ⇒ **not gated now** (salary deferred; they're bookable). Re-sourced local, no ops.
- **Drop** the ops freelance calls from the booking/attach paths (`drawFreelanceBudget`,
  `releaseFreelanceBudget`, `fetchTeacherQuotas`, `fetchFreelanceRateMinor`, ops `attachTeacherQuotas`).
  Leave those functions in `ops-client.ts` **unused/dormant**.

## FE — scheduler-front
- The `FreelanceRow` display (`remaining/budget` + near-cap + `overLimit` hide + override switch) is
  **unchanged** — the DTO shape is identical, just locally sourced.
- **New (moved from the backoffice screen):** on/near the Teachers page, admin controls to **set/edit**
  a freelance's monthly budget + rate + near-cap threshold, and **top-up**. Mutations → `PUT
  /teachers/:id/budget` + `/budget/topup`, invalidate `TEACHERS_KEY` (+`CALENDAR_KEY`).

## Non-functional
- **Standalone**: with `OPS_API_URL` unset / backoffice offline, the freelance limit works 100%
  (AC — the whole path is local now).
- **Atomic**: drawdown/reversal live in the booking tx → no orphan, no cache lag.
- **Limit-only**: no P&L/expense postings (deferred to the rebuilt backoffice).

## Tasks
- **TASK-019** (@Jason, scheduling): `freelance_budgets` table + migration; local budget service
  (upsert/top-up/reset) + admin endpoints; re-source the DTO budget fields locally; local drawdown/
  reversal + cap in the booking tx; local `setupIncomplete` (freelance-only); month-reset internal job;
  stop the ops freelance calls (leave dormant). (dep: —)
- **TASK-020** (@Fern, scheduler-front): frontoffice set/edit budget + rate + near-cap + top-up controls
  on the Teachers page (display already works from the local-sourced DTO). (dep: TASK-019)

## Questions
(Jason/Fern ask; Sober answers as `> answer: ...`)
- Porter's 3 REQ-004 questions answered in the REQ: **re-enter** budgets in the frontoffice (placeholder
  data, small); **scheduling-side monthly job** for reset; **leave ops freelance code dormant** (stop the
  calls, don't delete). No open blockers.
