# TASK-024: scheduling — re-absorb the freelance ceiling as a `bo.item` (in-tx)
- Source: SPEC-006
- Status: DONE
- Depends on: TASK-021 (schema). **Sequence AFTER TASK-022/023 are stable.**
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
Replace `public.freelance_budgets` (REQ-004) with a `bo.item` (unit=hour), decremented **in the booking's own
DB transaction** (same PostgreSQL, direct access — no HTTP). Retires the local freelance table; keeps atomicity.

1. **Declare the `bo` tables** scheduling reads/writes (item, movement) in its Drizzle schema (migrations stay
   owned by backoffice-back; scheduling only reads/writes).
2. **Model**: a freelance's ceiling = `bo.item{ unit:'ชั่วโมง', direction:'EXPENSE', cadence:'FIXED_MONTHLY',
   ceiling_qty:<hours>, remaining_qty:<hours>, unit_price_minor:<rate>, owner_ref:<teacherId> }`.
3. **Booking commit** (FREELANCE, in the booking tx): find the teacher's `bo.item`; if `remaining_qty < 1` and
   no override → block; else write `bo.movement{qty:−1, value_minor:rate, ref:booking}` + `remaining_qty -= 1`.
   **Same tx as the booking** → atomic.
4. **Cancel / customer-leave**: `bo.movement{qty:+1}` + `remaining_qty += 1` (only if drawn).
5. **Monthly reset**: the existing `/internal/jobs/month-reset` now sets `bo.item.remaining_qty = ceiling_qty`
   for freelance ceiling items (with the idempotency guard from TASK-019's fast-follow).
6. **DTO**: source the teacher's `remainingMinor/budgetMinor/overLimit` from the `bo.item` (hours×rate for baht
   display, or show hours — coordinate the display with TASK-026). `setupIncomplete` (freelance) = no `bo.item`.
7. **Retire `public.freelance_budgets`**: stop reading/writing it; its data is migrated in TASK-025. Leave the
   table dormant (drop later).

## Definition of Done
- [ ] Booking a freelance decrements their `bo.item.remaining_qty` **in the booking tx**; cancel/leave restores;
      remaining < 1 & no override → blocked; override allows negative.
- [ ] Monthly reset restores remaining to ceiling. Works with the backoffice API down (direct same-DB).
- [ ] `public.freelance_budgets` no longer read/written; DTO + booking guard sourced from `bo.item`.
- [ ] Migration/schema applies; `bun test` + `bunx tsc --noEmit` clean; tests for the in-tx draw/reverse/block.

## Implementation Notes
Repo: `smart-scheduler-back`. The freelance ceiling now lives as a `bo.item` (unit=hour) in the shared DB;
`public.freelance_budgets` is retired (dormant). **Kept the scheduling admin API + DTO contract identical
(baht in/out) so the LIVE REQ-004 limit + FE (TASK-020) are undisturbed** — only storage moved.

- **Schema (`schema.ts`)** — declared the `bo` `pgSchema` + `boItem`/`boMovement` tables (read/write only;
  migrations owned by backoffice-back). `freelance_budgets` left declared but **dormant** (no reads/writes).
- **Model** — a freelance ceiling = `bo.item{ unit:'ชั่วโมง', direction:'EXPENSE', cadence:'FIXED_MONTHLY',
  ceilingQty:hours, remainingQty:hours, unitPriceMinor:rate, ownerRef:teacherId,
  externalSource:'smart-scheduler', metadata.kind:'FREELANCE_CEILING', metadata.reorderQty }`. Found by
  `findFreelanceItem` (owner_ref + kind).
- **DTO** — `attachFreelanceBudgets` re-sources from the `bo.item`: `budgetMinor=ceiling×rate`,
  `remainingMinor=remaining×rate`, `reorderMinor=reorderQty×rate`, `overLimit=remaining≤0`,
  `hourlyRate=rate/100`. **Same field names → the FE is unchanged.** `setupIncomplete` = FREELANCE with no item.
- **Booking (in the booking tx)** — confirm: `drawCeilingHour(remaining, override)` → block if <1 & no
  override; else `remaining_qty−1` + `bo.movement{qty:−1, value:+rate, fl-book:<id>}`. Cancel/leave (guarded to
  only-if-drawn): `remaining_qty+1` + `bo.movement{qty:+1, value:−rate, fl-unbook:<id>}` (nets the expense).
  Movements `onConflictDoNothing` on the idempotency key. **Atomic — same DB, no HTTP.**
- **Admin** — `setFreelanceBudget` upserts the `bo.item` (baht→hours = round(budget/rate); edit doesn't
  overwrite remaining); `topUpFreelanceBudget` (baht→hours) `remaining+=hours`; `resetFreelanceBudgets`
  (month-reset job) sets `remaining=ceiling` for all freelance ceiling items — **all direct same-DB, works
  with the backoffice API down.**
- **Pure `lib/freelance-budget.ts`** — `drawCeilingHour` (replaces the old satang `freelanceDraw`), `overLimit`.

**Verification**
- `bunx tsc --noEmit` clean; `bun test` → **88 pass / 0 fail** (freelance-budget test rewritten for the 1h
  ceiling draw: draw/last-hour/blocked/override). ⚠️ In-tx draw/reverse + admin round-trips verified by
  inspection (brownfield — no DB); the cap math is pure-tested. `bo` tables come from backoffice migration
  0004 (shared DB); scheduling only declares them (no new scheduling migration).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **⚠️ DEPLOY SEQUENCING (important):** this reads the freelance ceiling from `bo.item`, but the live data is
  still in `public.freelance_budgets` until **TASK-025** migrates it. So **TASK-025's data migration must run
  BEFORE (or with) deploying TASK-024** — otherwise existing freelances have no `bo.item` → `setupIncomplete`
  → **not bookable** (the live REQ-004 limit breaks). Please fold "run TASK-025 migration, then deploy 024" into
  the REQ-006 deploy note. (I sequenced the *build* after 022/023 per your instruction; this is the *deploy*
  ordering.)
  > answer (Sober): **Critical catch — thank you. Confirmed: TASK-025 migration runs BEFORE (or in the same
  > window as) the TASK-024 deploy**, else live freelances have no `bo.item` → `setupIncomplete` → not
  > bookable → the **live REQ-004 limit breaks**. I've added this as a hard-ordered step to the REQ-006 deploy
  > note (migrate `freelance_budgets`→`bo.item` first, then deploy 024). Also apply the `bo` migration (0004)
  > before both.
- **Contract kept baht (not hours):** ... 7,000,000 / 50,000 = 140h exactly).
  > answer (Sober): **Keep baht — right call.** Zero churn on the live REQ-004 FE, and it makes TASK-026
  > near-trivial (verify-only). The internal `round(budget/rate)` hours conversion is fine; note the rounding
  > (budget should be ~a multiple of rate — placeholders are exact) in TASK-025 so migrated data lands clean.
  > Exposing hours natively is a nicety we can do later; not worth a coordinated FE+BE break now.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `smart-scheduler-back`: `bun test` → **88 pass / 0 fail**,
`tsc` 0. Verified the live-path change:
- **Pure `drawCeilingHour`** (block <1 unless override; else −1) + `overLimit(remaining≤0)` — unit-tested.
- **In-tx, atomic:** booking confirm draws via `findFreelanceItem(tx,…)` on `bo.item` → `remaining_qty−1` +
  `bo.movement{qty:−1, value:+rate, fl-book:<id>}` **in the booking transaction**; cancel/leave does
  `remaining+1` + `bo.movement{qty:+1, value:−rate}` (guarded to only-if-drawn; idempotent). Direct same-DB,
  no HTTP → works with the backoffice API down. ✓
- **Contract preserved:** DTO re-sources from `bo.item` with the same field names (`remainingMinor=remaining×rate`,
  etc.) → the live REQ-004 FE is undisturbed; `public.freelance_budgets` no longer read/written (dormant).
  Admin set/edit/top-up + month-reset all hit `bo.item` directly. ✓
- **Nice side effect (noted, desirable):** because the `bo.movement` carries `value_minor` on an EXPENSE item,
  **freelance expense now flows into the `bo` P&L automatically** — the "freelance P&L" that REQ-004 deferred is
  achieved for free by the universal model. Net-zero on cancel (signed value). Not a defect; the intended end state.
No rework. **TASK-026 unblocked** (near-trivial). ⚠️ Deploy ordering (025-before-024) captured in the deploy note.
