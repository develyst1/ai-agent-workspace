# TASK-028: scheduling — fix freelance-drawdown idempotency (reconcile-to-target invariant)
- Source: SPEC-006 (correctness fix on TASK-024; also fixes the latent live REQ-004/TASK-019 bug)
- Status: DONE  (reviewed 2026-07-28 by Sober — verified tsc 0 + bun test 100/0 + code inspection; see ## Review. Built by Jason; NO_SHOW/SICK_LEAVE rule LOCKED by คุณฟีן via Porter; see ## Questions)
- Depends on: TASK-024
- Assignee: @Jason (smart-scheduler-back, port 4006)

> 🔁 **REVERSED 2026-08-03 (owner, via Porter → TASK-104):** the "SICK_LEAVE is CONSUMING (still pay the
> sick-leave freelance)" rule below is **overturned**. `SICK_LEAVE` is now **RELEASING** — a sick-leave no longer
> draws the freelance ceiling (only the makeup does, when taught). This task stays DONE as the reconcile-invariant
> record; the SICK_LEAVE classification is corrected in **TASK-104**. Any fuel allowance is a manual backoffice
> EXPENSE movement, not automatic.

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
2. **`target(status)`:** consuming ⇒ 1, releasing ⇒ 0. **Locked by คุณฟีน (2026-07-20, via Porter):**
   - Consuming (freelance IS paid): `CONFIRMED`, `ATTENDED`, `SICK_LEAVE`, `EXTENDED`.
   - Releasing (freelance NOT paid): `NO_SHOW`, `CANCELLED`, `PENDING`.
   - ⚠️ **`SICK_LEAVE` is now CONSUMING** — this **flips** the live REQ-004 behavior (which refunds on
     leave, `scheduler.service.ts:714–716`). Under the locked rule a freelance whose booked slot went to
     sick-leave is **still paid** → the draw is KEPT, not reversed. Delete that release path.
   - `NO_SHOW` = releasing (not paid).
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
- [ ] Target mapping matches the locked rule (esp. `SICK_LEAVE` consuming, `NO_SHOW` releasing); the live
      refund-on-sick-leave (`scheduler.service.ts:714–716`) is removed.
- [ ] `bun test` + `bunx tsc --noEmit` clean; add tests for the round-trip paths + idempotency + clamp.

## Implementation Notes

**Approach: reconcile-to-target driven by a ledger-derived `held`, replacing the two status-guarded
draw/refund paths.** One idempotent `reconcileFreelanceDraw` runs on **every** booking status change,
using the booking's *actual* post-mutation status — so no action→status mapping and no unconditional
`remaining` mutation. The leak is fixed by the `delta === 0` no-op guard (a release when nothing is held
is now a no-op), and `SICK_LEAVE` is reclassified as consuming so it keeps the draw.

**Files changed (both in `smart-scheduler-back`):**
- `src/lib/freelance-budget.ts` — added pure, tested helpers:
  - `isFreelanceConsuming(status)` / `heldTarget(status)` — the LOCKED state machine (consuming =
    `CONFIRMED/ATTENDED/SICK_LEAVE/EXTENDED`; releasing = `NO_SHOW/CANCELLED/PENDING`).
  - `reconcileDelta(held, status)` = `target − held` (>0 draws, <0 refunds, 0 no-op).
  - `reconcileRemaining(remaining, ceiling, delta)` — new remaining (`remaining − delta`); **clamps
    refunds to ≤ ceiling**, leaves draws un-clamped (override may go negative). `drawCeilingHour` kept for
    the block check.
- `src/services/scheduler.service.ts`:
  - New `reconcileFreelanceDraw(tx, bookingId, teacherId, status, override)` (after `findFreelanceItem`).
    `held ∈ {0,1}` = `−Σ(bo.movement.qty WHERE ref_id=booking)` on the teacher's ceiling item (the single
    source of truth — self-healing, backward-compatible with existing `fl-book`/`fl-unbook` rows in prod).
    `delta = reconcileDelta(held, status)`; no-op if 0. On a draw with no budget + no override → throws
    `INSUFFICIENT_BUDGET` (rolls back the tx = over-booking prevention, unchanged). Posts **one**
    `bo.movement` (`qty=−delta`, `valueMinor=−qty×rate`, `refType` BOOKING/BOOKING_REVERSAL,
    `idempotencyKey=fl:<booking>:held<0|1>`) + updates `remainingQty` — all in the caller's tx.
  - `updateBookingStatus`: **removed** the inline draw-on-confirm block, the `releaseFreelanceTeacherId`
    variable + the two status-guarded refund sites (cancel + the **REQ-004 refund-on-sick-leave**, now
    deleted per the locked rule), and the post-branch refund block. **Added** a single
    `reconcileFreelanceDraw(...)` call keyed off the booking's re-read status, before `loadBookingDTO`.
  - The makeup `EXTENDED` row is **not** reconciled at insertion — it draws on its own `confirm` (preserves
    today's behavior, per Sober's answer in `## Questions`).

**Design note for review (idempotency layering):** `boMovement.idempotencyKey` has **no unique index** in
this repo's schema, and the `bo` tables are owned/migrated by `backoffice-back` — so I did **not** add a
migration here. Real idempotency comes from the **derive-`held` / `delta===0`** guard (correct for the
sequential transition flow the DoD tests). `.onConflictDoNothing()` + the `fl:<booking>:held<0|1>` key are
kept as defensive/traceability and will become a hard dedup automatically **if** the owning repo later adds
a unique index on `idempotency_key`. Flagging in case you'd rather route that index to `backoffice-back`.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → clean (exit 0).
- `bun test` → **99 pass / 0 fail** (17 files). Added coverage in `freelance-budget.test.ts`: status
  classification, `reconcileDelta` draw/refund/no-op, `reconcileRemaining` clamp + negative-on-override, and
  a simulation of the **prod repro** `CONFIRMED→SICK_LEAVE→ATTENDED→SICK_LEAVE` asserting `remaining` never
  exceeds `ceiling` and ends at `ceiling − 1` (one consuming booking) + cancel/re-cancel idempotency.
- ⚠️ **Not run against a live DB** (brownfield — no DB access). The DB-touching `reconcileFreelanceDraw` is
  verified by inspection + the pure-function simulation of its held/remaining math. Recommend a deploy-time
  smoke: confirm a freelance booking, toggle ATTENDED↔SICK_LEAVE a few times, then `GET` the teacher and
  check `remaining ≤ ceiling` (was the leak); cancel → `remaining` returns to ceiling.

**DoD status:** all four boxes met in code + unit sim; the two live-DB spot-checks are the recommended
deploy-time verification (can't run under brownfield).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- ~~**Business (Porter → คุณฟีน, blocks NO_SHOW branch):** when a student no-shows a freelance's booked
  slot, does the center still pay the freelance for that hour? …~~
  > **answer (Sober, from Porter/board 2026-07-20):** RESOLVED — state machine **LOCKED** by คุณฟีน:
  > CONSUMING (paid) = `CONFIRMED`/`ATTENDED`/**`SICK_LEAVE`**; RELEASING (not paid) = **`NO_SHOW`**/`CANCELLED`.
  > SICK_LEAVE now **KEEPS** the draw (flips REQ-004); NO_SHOW = releasing. Folded into §2 above. Task unblocked.
- **@Porter (NON-BLOCKING refinement — does NOT hold the leak fix):** now that SICK_LEAVE *keeps* the
  freelance draw AND the sick-leave flow still auto-creates a makeup `EXTENDED` booking
  (`scheduler.service.ts:739–755`), a freelance could be **paid twice** for one student-session — once for
  the kept leave slot and once for the makeup (drawn when the makeup is confirmed). Under the OLD rule the
  leave refunded, so it was paid once. **Is double-pay intended?** Please confirm with คุณฟีน.
  > **Jason, build regardless:** implement reconcile with the locked targets; for the makeup EXTENDED row,
  > **preserve today's behavior — it draws on its own `confirm`, not at insertion** (do NOT fire a
  > reconcile-draw when the extension row is created). If Porter rules double-pay unintended, a small
  > follow-up will suppress the makeup draw — it won't change this task's core.
  > **answer (Porter, from stakeholder 2026-07-28): (ก) double-pay is INTENDED.** A genuine sick-leave
  > (freelance kept-paid, per the locked rule) + a genuine makeup session (paid on its own confirm) =
  > paid twice is acceptable. **No makeup-suppression follow-up needed.**
  > ⚠️ **Clarification from the stakeholder:** their *reported* bug was NOT the makeup scenario — it was
  > that the frontend lets you **toggle the SAME booking ATTENDED↔SICK_LEAVE freely**, corrupting the
  > budget. That is exactly what this task's reconcile-to-target fixes (both are consuming → target held=1
  > → toggling is a no-op). **⇒ this task fixes the reported bug; ship it.** (Possible minor FE follow-up:
  > should the UI even allow re-toggling an already-resolved status? Route to Fern later only if คุณฟีน
  > wants it — the money is already correct without it.)

## Review
**Verdict: DONE ✅ (Sober, 2026-07-28).** The reconcile-to-target invariant is correct and fixes the live
money leak.

**Independently verified in `H:\scheduler\smart-scheduler-back` (not just Jason's report):**
- `bunx tsc --noEmit` → exit 0. `bun test` → **100 pass / 0 fail** (17 files); `freelance-budget.test.ts`
  alone → 16/0 incl. the prod-repro sim `CONFIRMED→SICK_LEAVE→ATTENDED→SICK_LEAVE` (remaining never > ceiling).

**Code inspection (money path):**
- Pure helpers (`freelance-budget.ts`) correct: consuming = `CONFIRMED/ATTENDED/SICK_LEAVE/EXTENDED`,
  releasing = else; `reconcileDelta = target − held`; `reconcileRemaining` clamps refunds ≤ ceiling, leaves
  draws un-clamped (override may go negative). Matches the LOCKED rule.
- `reconcileFreelanceDraw` (`scheduler.service.ts:95`) derives `held = −Σ(bo.movement.qty for this booking)`,
  no-ops when `delta === 0` — **this is the real idempotency** (self-healing from the ledger). The old
  status-guarded draw/refund + `releaseFreelanceTeacherId` are gone; a single reconcile at `:792` runs on the
  booking's **re-read** post-mutation status. Signed `valueMinor = −qty×rate`, `refType` BOOKING/BOOKING_REVERSAL,
  draw-block preserved (`INSUFFICIENT_BUDGET` rolls back). The `SICK_LEAVE→ATTENDED→SICK_LEAVE` toggle is all
  target=1 → delta 0 → no movement → **leak gone.** Makeup `EXTENDED` correctly not reconciled at insertion.
- Double-pay (kept sick-leave + makeup) confirmed **INTENDED** by Porter/คุณฟีน (see ## Questions) → no follow-up.

**Non-blocking notes (do NOT hold DONE):**
1. **Idempotency index (Jason's flag):** `bo.movement.idempotencyKey` has no unique index, so
   `.onConflictDoNothing()` is currently a no-op — real idempotency comes from the derive-`held` guard, which
   is correct for the sequential-transition DoD. A concurrent double-refund on one booking could drift the
   ledger `held` negative, but `reconcileRemaining`'s clamp keeps **remaining ≤ ceiling** (money stays
   correct). Hardening = a unique index on `(item_id, idempotency_key)` — owned by `backoffice-back`. Logged
   as a small follow-up for that repo; not required for this fix.
2. Attend-from-unheld (PENDING→ATTENDED without a prior confirm) now draws 1h — correct under the invariant
   (an attended freelance slot is paid); previously attend never drew. Intended, consistent.

**Deploy note:** ships with the REQ-006 re-deploy. Deploy-time smoke (brownfield, can't run live here):
confirm a freelance booking → toggle ATTENDED↔SICK_LEAVE a few times → `remaining ≤ ceiling`; cancel →
`remaining` returns to ceiling.
