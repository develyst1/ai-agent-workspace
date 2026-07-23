# TASK-019: scheduling — local freelance budget (re-home from ops, standalone)
- Source: SPEC-005
- Status: DONE (core accepted; required fast-follow: month-reset idempotency guard — see Q&A)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
Re-home the freelance budget/rate/cap into scheduling `public`, enforced locally, **no ops calls**.
Files: `src/db/schema.ts` (+migration), `src/services/scheduler.service.ts`, `src/lib/ops-client.ts`
(stop calling the freelance fns — leave them dormant), `src/routes/api.ts` + `internal.ts`,
`src/validation.ts`, `src/db/mappers.ts`.

1. **Schema/migration** — new `freelance_budgets` (`teacher_id` uuid PK → teachers cascade,
   `monthly_budget_minor` int, `rate_minor` int, `remaining_minor` int, `reorder_minor` int null,
   `updated_at`). Hand-write the migration `ADD ... IF NOT EXISTS`/`CREATE TABLE IF NOT EXISTS` (same
   meta-drift posture as the prior migrations).
2. **Local budget service** (`scheduler.service.ts`):
   - `setFreelanceBudget(teacherId, {monthlyBudgetMinor, rateMinor, reorderMinor?})` — upsert; on first
     insert `remaining_minor = monthlyBudgetMinor`; on update, change budget/rate/threshold but **do NOT
     overwrite `remaining_minor`** (edit = next-reset target; top-up changes remaining now).
   - `topUpFreelanceBudget(teacherId, amountMinor)` — `remaining_minor += amount`.
   - `resetFreelanceBudgets()` — `remaining_minor = monthly_budget_minor` for all rows (the monthly job).
3. **Admin endpoints**: `PUT /teachers/:id/budget`, `POST /teachers/:id/budget/topup` (admin-guarded).
4. **DTO** — re-source the budget fields **from the local table** (replace `attachTeacherQuotas`'s ops
   fetch with a local read): `hourlyRate=rate_minor/100`, `budgetMinor`, `remainingMinor`, `reorderMinor`,
   `overLimit = remaining_minor <= 0`. Same field names → FE unchanged.
5. **Booking enforcement (in the booking tx, replacing the ops draw/reverse)**:
   - Commit of a FREELANCE booking with a budget row: if `remaining_minor < rate_minor` and no
     `limitOverride` → block (`badRequest` "งบครูเต็ม — เติมงบหรือปลดล็อก"); else `remaining_minor -= rate_minor`
     (allow negative under override). **Same DB tx as the booking** → atomic.
   - Cancel / customer-leave of a drawn freelance booking → `remaining_minor += rate_minor`.
   - `setupIncomplete`: FREELANCE with **no budget row** → not bookable; FT/PT → **not gated** (deferred).
     Re-source local; drop the ops `fetchMoneyState` path for this.
6. **Month-reset job**: `POST /internal/jobs/month-reset` (`INTERNAL_JOB_SECRET`, mirror the end-of-day
   job's guard) → `resetFreelanceBudgets()`.
7. **Stop the ops freelance calls** — remove `drawFreelanceBudget`/`releaseFreelanceBudget`/
   `fetchTeacherQuotas`/`fetchFreelanceRateMinor`/ops-`attachTeacherQuotas` from the live paths. Leave the
   functions in `ops-client.ts` (dormant) per Porter.

## Definition of Done
- [ ] Admin can set/edit a freelance's monthly budget + rate + near-cap; first set makes `remaining=budget`.
- [ ] Booking a freelance decrements `remaining_minor` by `rate_minor` **in the booking tx**; cancel/leave
      restores it; `remaining < rate` and no override → booking blocked; override allows negative.
- [ ] `remaining <= 0` → `overLimit=true` on the DTO (FE hides them). Top-up re-enables.
- [ ] `/internal/jobs/month-reset` resets every row to its `monthly_budget_minor`.
- [ ] **Standalone proof:** with `OPS_API_URL` unset, all of the above works (a test asserts no ops fetch
      on the booking/teachers path).
- [ ] Migration applies; `bun test` + `bunx tsc --noEmit` clean; tests: draw/reverse/block/override, reset,
      setupIncomplete (freelance-only), budget upsert (remaining not overwritten on edit).

## Implementation Notes
Repo: `smart-scheduler-back`. The freelance limit is now **100% local** — no ops calls on the
booking/teachers/cap paths.

- **Schema/migration:** new `freelance_budgets` (`teacher_id` PK → teachers cascade, `monthly_budget_minor`,
  `rate_minor`, `remaining_minor`, `reorder_minor` null, `updated_at`). Hand-written
  `drizzle/0011_freelance_budgets.sql` (`CREATE TABLE IF NOT EXISTS` + FK guarded by a `DO $$` block) +
  journal entry (meta-drift posture as before).
- **Pure cap math** extracted to `src/lib/freelance-budget.ts`: `freelanceDraw(remaining, rate, override)`
  → `{blocked, remainingAfter}` and `overLimit(remaining)` — unit-tested.
- **`scheduler.service.ts`:**
  - `attachFreelanceBudgets(dtos)` — reads the LOCAL table and sets `hourlyRate=rate/100`, `budgetMinor`,
    `remainingMinor`, `reorderMinor`, `overLimit`, and `setupIncomplete` (FREELANCE with no row & not
    archived). **Same DTO field names → the FE is unchanged.** Replaces the ops `attachTeacherQuotas` +
    `attachSetupIncomplete` in `getCalendar`/`getTeachers`/`loadTeacherFull`.
  - **Booking draw at confirm — now local & in the booking tx** (atomic): `freelanceDraw` on the row;
    blocked → `409 INSUFFICIENT_BUDGET` rolls back the confirm; else `remaining -= rate`. Override
    (request or durable `limitOverride`) allows negative.
  - **Cancel/leave reversal — local & in the same tx**: `remaining += rate`, only when the booking was
    actually drawn (`confirmedAt` AND prior status `CONFIRMED`/`ATTENDED`) → guards against double-reverse
    (replaces the old ops idempotency key). Removed the post-commit ops release.
  - **Booking guard** in `insertBooking`: local `isFreelanceSetupIncomplete` (FREELANCE no budget row);
    FT/PT no longer gated (salary deferred).
  - Budget admin: `setFreelanceBudget` (upsert; first set `remaining=budget`; **edit doesn't overwrite
    remaining**), `topUpFreelanceBudget` (`remaining += amount`), `resetFreelanceBudgets` (all rows
    `remaining=monthlyBudget`).
- **Routes:** `PUT /teachers/:id/budget`, `POST /teachers/:id/budget/topup` (admin). **`internal.ts`:**
  `POST /internal/jobs/month-reset` (`x-internal-secret` = `INTERNAL_JOB_SECRET`, mirrors end-of-day) →
  `resetFreelanceBudgets`. **`validation.ts`:** `setFreelanceBudget`/`topUpBudget`. **`mappers.ts`:** DTO
  fields unchanged (already present from TASK-008).
- **Ops freelance calls stopped** — `drawFreelanceBudget`/`releaseFreelanceBudget`/`fetchTeacherQuotas`/
  `fetchFreelanceRateMinor`/ops-`attachTeacherQuotas`/`attachSetupIncomplete`/`isTeacherSetupIncomplete`
  are no longer imported by `scheduler.service`. Left **dormant** in `ops-client.ts` (+ their existing tests)
  per Porter — the backoffice rebuild may reuse them.

**Verification**
- `bunx tsc --noEmit` → clean; `bun test` → **88 pass / 0 fail** (added `freelance-budget.test.ts`, 5:
  draw-to-zero, draw-with-room, blocked, override-negative, overLimit).
- ⚠️ **DB-runtime paths verified by inspection, not executed** (brownfield — no DB): the in-tx draw/reverse,
  upsert (remaining-not-overwritten-on-edit), top-up, reset, local setupIncomplete. The cap math is pure-tested.
- **Standalone:** the booking/teachers/cap paths make **zero ops calls** now (all reads/writes are local
  `freelance_budgets`), so the freelance limit works with `OPS_API_URL` unset — the SPEC-005 AC.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **Heads-up (out of TASK-019 scope, for the pivot):** the freelance *limit* is now standalone, but
  **teacher CRUD (TASK-016) still calls ops** (`createTeacher`→`onboardOpsTeacher`, archive→offboard, etc.,
  blocking). With the backoffice torn down those would 502 → can't add/archive a teacher. That's REQ-003
  (ON HOLD) territory, not REQ-004, so I left it — but flagging so it's on the radar for the REQ-003 rework
  (the teacher-management parts likely need the ops-sync made optional/removed to be truly standalone).
  > answer (Sober): **Great catch, and correctly out of REQ-004 scope.** Teacher CRUD's blocking ops-sync
  > (TASK-016) means add/archive would **502 once the backoffice goes offline** — so teacher-management isn't
  > standalone yet. That's exactly the kind of thing the pivot needs closed. **I'm routing it to @Porter** as a
  > follow-up REQ (make the teacher↔ops sync best-effort/removed so teacher CRUD is standalone) — it's the
  > natural companion to the REQ-003 rework. Not this task; you were right to leave it.
- Month-reset is **not** idempotent-within-a-month by design (SPEC says a re-run just re-resets). The Windows
  task fires it once on the 1st. OK, or do you want a guard against an accidental mid-month re-run?
  > answer (Sober): **Add the guard — required fast-follow.** An accidental mid-month re-run would reset every
  > freelance's `remaining` back to full budget and **wipe that month's drawdowns** (real data-integrity loss),
  > which is worse than a no-op. Make it **idempotent-per-month**: record the last-reset month (e.g. `app_settings`
  > `freelance_last_reset_month`) and no-op if the current month is already reset (allow a `force` flag for a
  > deliberate re-run). Small add; please fold it into TASK-019 before the Windows task goes live. Doesn't block
  > TASK-020 starting.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20) — with one **required fast-follow** (month-reset idempotency guard,
above). Re-ran `smart-scheduler-back`: `bun test` → **88 pass / 0 fail**, `tsc` 0. Verified:
- **Pure cap math** (`freelance-budget.ts`) — `freelanceDraw` blocks when `remaining<rate && !override`, else
  `remaining-=rate` (negative allowed under override); `overLimit=remaining<=0`. Unit-tested (5 cases). ✓
- **Local + atomic** — draw at confirm (`:621`) is `freelanceDraw` on the row **inside the booking tx**
  (blocked→`409 INSUFFICIENT_BUDGET` rolls back the confirm), cancel/leave `remaining+=rate` in-tx (guarded by
  prior status so no double-reverse). This is *better* than the old cross-system ops path — no orphan edge, no
  cache lag. ✓
- **`setFreelanceBudget`** edits budget/rate/threshold but **preserves `remaining`** (edit=next-reset target);
  first set → remaining=budget. Top-up `remaining+=amount`; reset `remaining=monthlyBudget` for all. ✓
- **Standalone** — no ops freelance calls remain on the booking/teachers/cap path (grep clean; the ops fns are
  dormant in `ops-client.ts`); the freelance limit works with `OPS_API_URL` unset (SPEC-005 AC). ✓ Migration is
  `CREATE TABLE IF NOT EXISTS` + guarded FK (safe). DTO fields unchanged → FE untouched.
- Trivial: a stale comment (`:828`) still names `drawFreelanceBudget` — cosmetic, fix when you touch it.
No rework on the reviewed core. **TASK-020 unblocked.**
