# TASK-028: scheduling — fix freelance-drawdown idempotency (reconcile-to-target invariant)
- Source: SPEC-006 (correctness fix on TASK-024; also fixes the latent live REQ-004/TASK-019 bug)
- Status: BLOCKED (waiting: Porter — NO_SHOW pay decision, see ## Questions)
- Depends on: TASK-024
- Assignee: @Jason (smart-scheduler-back, port 4006)

## The bug
Freelance draw fires on `confirm`, refund on `cancel`/`sick-leave`, each guarded only by the **current**
status — not by a per-booking "is 1 hour held?" invariant. So a `SICK_LEAVE → ATTENDED → SICK_LEAVE`
round-trip **double-refunds** → `remaining_qty` exceeds `ceiling_qty` → the freelance is silently un-capped.
Present in TASK-024 (`bo.item`) **and** latent in the live REQ-004 code (`public.freelance_budgets`, TASK-019
— same weak guard).

## What to do — reconcile-to-target (idempotent)
Replace draw-on-confirm / refund-on-cancel with a single **reconcile** run on **every** booking status change
for a FREELANCE teacher with a ceiling item.
1. **`held(booking) ∈ {0,1}`** — derive from the net `bo.movement` for `ref_id = <bookingId>` (Σqty on the
   teacher's ceiling item), OR persist a `held` column on the booking. **Prefer deriving** (single source of
   truth, self-healing, no new column).
2. **`target(status)`:** consuming ⇒ 1, releasing ⇒ 0.
   - Consuming: `CONFIRMED`, `ATTENDED`, `EXTENDED`.
   - Releasing: `SICK_LEAVE`, `CANCELLED`, `PENDING`.
   - **`NO_SHOW`: per Porter's answer** (consuming if the center pays a no-show freelance, else releasing).
3. On each transition: `delta = target(newStatus) − held`; if `delta ≠ 0`, post **one** `bo.movement`
   (`qty = −delta` → delta<0 draws, delta>0 refunds; `value_minor` signed as usual) **and** adjust
   `remaining_qty` by `−delta`, all **in the booking tx**. **No-op when already at target.**
4. **Idempotency:** key the movement by `(bookingId, targetState)` (e.g. `fl:<bookingId>:held1` / `:held0`) so
   a re-run of the same transition doesn't double-apply. **Clamp** so a refund never pushes `remaining > ceiling`.
5. Apply the same invariant to the **live REQ-004 path** if it ships before REQ-006 (else TASK-024 supersedes it).

## Definition of Done
- [ ] Any transition sequence (esp. `CONFIRMED→SICK_LEAVE→ATTENDED→SICK_LEAVE`) leaves `remaining_qty` exactly
      `ceiling − (# bookings currently in a consuming state)` — never exceeds ceiling, never under-draws.
- [ ] Re-running the same transition is a no-op (idempotent); override still allows remaining < 0 on a true draw.
- [ ] NO_SHOW handled per Porter's decision.
- [ ] `bun test` + `bunx tsc --noEmit` clean; add tests for the round-trip paths + idempotency + clamp.

## Implementation Notes
(Jason fills in.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **Business (Porter → คุณฟีน, blocks NO_SHOW branch):** when a **student no-shows** a freelance's booked slot,
  does the center **still pay the freelance** for that hour? Pay → NO_SHOW consuming (held=1); don't pay →
  releasing (held=0). (Also confirm SICK_LEAVE/customer-leave = don't-pay = releasing, per REQ-004.)

## Review
(Sober fills at REVIEW.)
