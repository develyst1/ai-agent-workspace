# TASK-144: Correcting a check-in must RETURN the consumed session/hour (BE, Gap-C)
- Source: SPEC-043 (REQ-050) — Porter decision: this is money owed to a family, the priority fix
- Status: DONE (SA-reviewed Sober 2026-08-17); observable balance-return → @Tanya on dev

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-17).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **493/0** (5 new). Read the
money path, not just the pure fn: `afterReturn` is applied in the **cancel branch inside the tx** —
`coursePackages.usedSessions: afterReturn(current.course.usedSessions)` (`scheduler.service.ts:1781`) and
`vouchers.usedHours: afterReturn(current.voucher.usedHours)` (`:1788`), atomic with the freelance reconcile.
- `returnsConsumedUnit` = **ATTENDED only** (the sole incrementer) → PENDING/CONFIRMED/SICK_LEAVE cancels never
  double-credit; `afterReturn = max(0, consumed-1)` never mints entitlement. Unit = 1 because `attend` adds exactly 1 to
  either counter (a session is one 1-hr slot) — correct. Tests pin ATTENDED-refund, every non-attended status no-op,
  3→2/5→4, and 0-stays-0. Voucher case (no make-up) is the one that most needed this — handled.
- Additive: freelance release + course re-owe untouched. **Verdict: DONE.** Observable "the family's balance came back"
  is a @Tanya dev check.
- Assignee: @Jason (BE)
- Depends on: none

## Context (why)
`attend` increments `coursePackages.usedSessions` / `vouchers.usedHours`
(`scheduler.service.ts:1731/1738`); **nothing decrements them** (sole writers). When staff cancel an
ATTENDED booking to correct a wrong check-in, the freelance draw releases and a course re-owes a make-up,
but the **consumed session/hour is not returned** — for a voucher the hour stays gone with no make-up.
Porter: treat this as **money owed to a family**, not tidiness. **No historical back-fill** (audit shows a
wrong attribution isn't detectable from stored data — no honest list to correct).

## What to do (smart-scheduler-back)
In the `cancel` path of `updateBookingStatus` (`scheduler.service.ts:1742-1773`, where an ATTENDED booking
is being corrected/cancelled), **in the same transaction** as the existing freelance reconcile:
- If the booking being cancelled was **ATTENDED** and it had consumed a unit, **decrement** the matching
  counter: `coursePackages.usedSessions -= 1` (course) or `vouchers.usedHours -= <the session's hours>`
  (voucher). Guard against going below 0.
- Only on the ATTENDED→cancelled transition (don't double-refund a non-attended cancel, which never
  consumed). Trace the exact status precondition so a PENDING/CONFIRMED cancel is unaffected.
- Keep the existing freelance-hold release + course re-owe (`reconcileCoursePlan`) untouched — this is
  additive.

## Definition of Done
- [ ] Cancelling an **ATTENDED** course session returns `usedSessions` by 1 (never < 0). (AC-5)
- [ ] Cancelling an **ATTENDED** voucher session returns `usedHours` by the session's hours (never < 0).
- [ ] A PENDING/CONFIRMED/SICK_LEAVE cancel does **not** change the counter (it never consumed).
- [ ] Freelance release + course re-owe behaviour unchanged (additive).
- [ ] Runs in the existing transaction (atomic with the reconcile).
- [ ] Unit tests: attend→cancel restores the counter (course + voucher); non-attended cancel doesn't;
      no negative. `bunx tsc --noEmit` 0 · `bun test` green.

## Implementation Notes / Questions
(Jason fills in. ⚠️ Money correctness — mutate inside the tx, integer units.)

## Implementation Notes / Questions
**Files:** `src/lib/checkin-correction.ts` (new, pure) · `src/lib/checkin-correction.test.ts` (new, 5 tests) ·
`src/services/scheduler.service.ts` (the `cancel` branch).

**The rule, isolated so it is testable without a DB:**
- `returnsConsumedUnit(statusBeforeCancel)` → true **only** for `ATTENDED`. `attend` is the only writer that
  increments the counters, so only an ATTENDED→cancelled transition can owe a refund; PENDING / CONFIRMED /
  SICK_LEAVE / EXTENDED / NO_SHOW / CANCELLED cancels are untouched (no double-credit).
- `afterReturn(consumed)` → `Math.max(0, consumed - 1)`. One session = one unit, because `attend` adds exactly
  1 to either counter (`usedSessions + 1`, `usedHours + 1`). **Never below 0**, whatever the row holds.

**Where it runs:** inside the existing `db.transaction`, immediately after the booking is set `CANCELLED` and
**before** the `reconcileCoursePlan` re-owe and the freelance `reconcileBookingHolds` — same transaction, so the
correction is atomic with everything else the cancel does. Both counters are handled:
`coursePackages.usedSessions` (course) and `vouchers.usedHours` (voucher). Nothing existing was changed — the
freelance release and the course re-owe behave exactly as before; this is purely additive.

**Why the voucher line matters most:** a course cancel already re-owes a make-up, so the family eventually gets
the session back. A **voucher has no make-up** — without this the hour was simply gone. That is the "money owed
to a family" case in Porter's decision.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **493 pass / 0 fail** (5 new). Tests pin: ATTENDED refunds ·
every non-attended status does not · 3→2 and 5→4 · 0 stays 0 (a double-cancel can never mint entitlement) · a
negative/missing counter can't produce NaN or go further negative.

**Not verifiable from here:** the end-to-end attend→cancel against a real DB (I don't touch real environments).
The counters and the transaction boundary are code-level; the observable "the family's balance came back" is a
QA check on dev.

**No historical back-fill**, per Porter — a wrong attribution isn't detectable from stored data.

## Questions
(none)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-144 | scheduler-back (BE): check-in Gap-C (money) — cancelling an **ATTENDED** booking returns the consumed `usedSessions`/`usedHours` in the same tx as the freelance reconcile; guard ≥0; non-attended cancel unaffected | SPEC-043 (REQ-050) | ✅ **DONE (SA-reviewed Sober 2026-08-17)** · balance-return dev check → @Tanya. Reproduced tsc 0 · 493/0; `afterReturn` applied in the cancel branch in-tx (`:1781`/`:1788`), ATTENDED-only, floored ≥0 — money return verified, not just the pure fn. — _prior:_ 🔎 REVIEW (Jason 2026-08-17 — pure `lib/checkin-correction.ts`: `returnsConsumedUnit` (ATTENDED only) + `afterReturn` (−1, floored at 0). Wired into the `cancel` branch **inside the existing tx**, before the re-owe/freelance reconcile; refunds `coursePackages.usedSessions` and `vouchers.usedHours`. Non-attended cancels untouched (no double-credit); 0 stays 0. The voucher line is the real money case — no make-up to re-owe. tsc 0 · **493/0**, 5 new tests. No back-fill, per Porter.) | Jason | — |
```
