# TASK-002: scheduling — freelance draw-down at booking, reversal on cancel/leave
- Source: SPEC-001
- Status: DONE
- Depends on: TASK-001
- Assignee: @Jason (smart-scheduler-back, port 3001)

## What to do
Move the freelance budget drawdown from **attend** to **booking commit**, and add
a **reversal** on cancel / customer-leave, so the ops budget stock is the real-time
cap + expense. Files: `src/services/scheduler.service.ts`, `src/lib/ops-client.ts`.

1. **Remove** the attend-time call: the `consumeTeacherHours` invocation in
   `updateBookingStatus` (~`scheduler.service.ts:630`, `action==="attend" &&
   type==="FREELANCE"`).
2. **Draw down at booking commit**: when a `FREELANCE` teacher's booking is
   committed (creation of a CONFIRMED booking; and the PENDING→CONFIRMED transition
   if used), post a synchronous ops `OUT` by-ref movement:
   `{externalRef:teacherId, direction:'OUT', quantity:amtSatang, amountMinor:amtSatang,
   refType:'BOOKING', refId:bookingId, idempotencyKey:'fl-book:'+bookingId,
   allowNegative:false}` where `amtSatang = rate × 1h` (all bookings 1h).
   - On `409 INSUFFICIENT_STOCK` (budget exhausted, no override) → **abort the
     booking** with a clear error (real-time over-booking prevention). Respect an
     active per-teacher override (allowNegative:true) — see TASK-004 for where the
     override is persisted; read it here.
   - Keep it best-effort-safe if `OPS_API_URL` unset (dev), matching existing
     ops-client behavior, but when ops IS configured a 409 must block the booking.
3. **Reverse on cancel / customer-leave**: in `updateBookingStatus` for `cancel`
   and `sick-leave` of a freelance booking, post an `IN` reversal:
   `{direction:'IN', quantity:amtSatang, amountMinor:amtSatang, refType:'BOOKING_REVERSAL',
   refId:bookingId, idempotencyKey:'fl-unbook:'+bookingId}`.
4. Add an `ops-client` helper for booking OUT + reversal IN (mirror
   `consumeTeacherHours`), carrying the new refType/amountMinor/idempotency.

## Definition of Done
- [ ] Committing a freelance booking decrements that teacher's ops budget by
      `rate × 1h` and posts the expense to `/reports/pl`.
- [ ] Cancelling or customer-leave on that booking restores the budget and removes
      the expense (net 0 in P&L) — verified via reversal idempotency key.
- [ ] Booking a freelance whose remaining < job amount is **rejected** (409) unless
      override is active; the attend action no longer draws down.
- [ ] Re-posting the same booking/cancel is idempotent (no double count).
- [ ] Repo tests pass; add a booking-drawdown + reversal test (mock ops or against
      a local ops instance).

## Implementation Notes
Repo: `smart-scheduler-back` (port 3001). Files changed: `src/lib/ops-client.ts`,
`src/services/scheduler.service.ts`, + new `src/lib/ops-client.test.ts`.

**Commit point = the `confirm` action.** Bookings are always created `PENDING`
(`insertBooking`), so the "booking commit" (SPEC-001) is the PENDING→CONFIRMED transition in
`updateBookingStatus(action='confirm')`. That's where the drawdown fires — not at initial
PENDING creation. (No code path creates a CONFIRMED booking directly.)

**ops-client.ts**
- `drawFreelanceBudget(teacherId, amountMinor, {refId, idempotencyKey, allowNegative})` → ops
  `OUT` by-ref, `refType:'BOOKING'`, `amountMinor` echoed, `idempotencyKey:'fl-book:<id>'`. The
  shared `opsMovementByRef` now **surfaces a 409 as `{blocked:true}`** (other failures stay
  `skipped` = best-effort). This is the real-time cap.
- `releaseFreelanceBudget(teacherId, amountMinor, {refId, idempotencyKey})` → ops `IN`,
  `refType:'BOOKING_REVERSAL'`, `idempotencyKey:'fl-unbook:<id>'` (matches TASK-001's P&L netting).
- Removed the old `consumeTeacherHours` (hours-based attend drawdown) — dead after this change.
- `TeacherQuota` now carries `rateMinor` (= the EXPENSE item's `salePriceMinor`); added
  `fetchFreelanceRateMinor(teacherId)` (reads the cached quota map). Budget/quota are now in
  **satang** (SPEC-001), not hours. Also made `OPS_API_URL` read at **call time** (was captured at
  module load) so the helpers are mockable — no behaviour change when the env is static.

**scheduler.service.ts** (`updateBookingStatus`)
- **Draw at confirm** (inside the tx, after checkin token): for a `FREELANCE` teacher, look up
  `rateMinor`, post the `OUT`. A `blocked` (409) → `throw conflict("INSUFFICIENT_BUDGET", …)` which
  **rolls back the entire confirm** (status/LINE/token) — over-booking prevention. `allowNegative`
  is wired to the existing `override` param (admin over-budget override). Skips silently when
  backoffice is off / teacher has no budget item (dev, matches prior best-effort).
- **Reverse at cancel / sick-leave** (post-commit, best-effort, idempotent): only when the booking
  had been confirmed (`current.confirmedAt` — i.e. actually drawn), captured via
  `releaseFreelanceTeacherId`, then `releaseFreelanceBudget(...'fl-unbook:<id>')`.
- **Removed** the attend-time `consumeTeacherHours` call — attend no longer draws down.

**Verification**
- `bunx tsc --noEmit` → clean (exit 0).
- `bun test` → **67 pass / 0 fail** across 15 files (added `ops-client.test.ts`, 5 cases: OUT/BOOKING
  payload in satang, 409→blocked, allowNegative forwarding, IN/BOOKING_REVERSAL payload, unset-URL
  no-op). Mocks `fetch` — no ops server, no DB.
- ⚠️ **Runtime end-to-end verified by inspection only, not executed** (brownfield rule — BE doesn't
  run the scheduling DB or a live ops): (a) a 409 at confirm actually rolls the booking back;
  (b) real P&L nets to 0 after cancel. The mocked contract test + TASK-001's `foldPLRows` test cover
  the logic; please confirm both against running services in integration.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **Q1 — `/teachers` DTO contract for Fern's TASK-004 (needs your field-name call).** Fern flagged
  (log 17:30 #2) the teacher DTO exposes only `quotaRemaining`; TASK-004 needs the monthly **budget**
  and the **near-cap threshold** on the teacher DTO to render baht `remaining/budget` + warning.
  The data is now available (TASK-001 put `metadata.monthlyBudgetMinor` + `reorderLevel` on the ops
  item; `attachTeacherQuotas` already decorates teacher DTOs). I did **not** add outward DTO fields
  yet to avoid guessing a cross-team contract and causing Fern rework. Please confirm the field names
  (e.g. `budgetMinor`, `reorderMinor`, and reinterpret `quotaRemaining`→satang) — I'll add them to
  `attachTeacherQuotas`/the teacher DTO in a small follow-up under this task. Recommend doing it here
  (it's the scheduling-side budget surface) rather than in TASK-004.
  > answer (Sober): Agreed it's the scheduling-side surface. **Confirmed field contract** on the
  > teacher DTO (all satang, `*Minor`): `budgetMinor` (= `metadata.monthlyBudgetMinor`),
  > `remainingMinor` (= `quantityOnHand`; **rename from `quotaRemaining`** since it's satang now, not
  > hours — Fern's TASK-004 is a fresh consumer so no legacy breakage), `reorderMinor`
  > (= `reorder_level`, nullable). Keep `overLimit` (= `remainingMinor ≤ 0`). Note `fetchTeacherQuotas`
  > currently only reads `salePriceMinor`+`quantityOnHand` — it must also pull `metadata.monthlyBudgetMinor`
  > + `reorderLevel` from the items endpoint. **I've split this into its own small task, TASK-008**
  > (so TASK-002 closes on its tested core), which **TASK-004 now depends on**. Pick it up next — it's tiny.
- **Q2 — override persistence (dependency inversion, non-blocking).** I wired `allowNegative` to the
  existing per-request `override` param on `confirm`. The **durable per-teacher** override lives in
  TASK-004 (Fern) which depends on this task. When it lands, the confirm path can also consult that
  persisted state; for now an admin passes `override:true` on the confirm call. OK as-is?
  > answer (Sober): **OK as-is.** Wiring `allowNegative` to the per-request `override` is the right
  > seam. The **durable per-teacher override** (persist + read in the confirm path) is folded into
  > **TASK-008** (a small scheduling `PATCH /teachers/:id/limit-override` + the confirm path reading
  > it), which TASK-004 (Fern's UI toggle) depends on. So: confirm path stays as-is now; TASK-008 adds
  > the persisted-state read.
- **Q3 — reversal amount vs. mid-cycle rate change (heads-up, non-blocking).** The reversal amount is
  recomputed as `rate × 1h` at cancel time. If a teacher's rate changes **between** confirm and
  cancel within the same month, the reversal won't exactly cancel the original drawdown. SPEC-001
  assumes same-month stable rate (monthly reset), so this is acceptable for launch — flagging in case
  you want the exact-amount reversal (would need scheduling to persist the drawn amount, a schema add
  the SPEC currently rules out).
  > answer (Sober): **Accept recompute-at-cancel for launch.** SPEC-001 assumes a stable same-month
  > rate (monthly reset), and rates change rarely. Persisting the exact drawn amount would need a
  > scheduling schema field the SPEC deliberately avoids. Documented as a known limitation; revisit
  > only if mid-month rate changes become real. Not rework.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20)

Reviewed against SPEC-001 + all 5 DoD items. Read the real code (`ops-client.ts`, the confirm +
cancel/sick-leave paths in `scheduler.service.ts`) and **independently re-ran** the repo:
`bun test` → **67 pass / 0 fail** (incl. the new `ops-client.test.ts`), `bunx tsc --noEmit` → exit 0.

- **Draw at commit — correct.** Fires at the PENDING→CONFIRMED transition for FREELANCE only,
  `OUT` `refType:'BOOKING'` `fl-book:<id>`, amount = `rateMinor` (satang). A `409` → `blocked` →
  `throw conflict("INSUFFICIENT_BUDGET")` inside the tx → the whole confirm rolls back (real-time
  over-booking prevention). `allowNegative` wired to `override`. ✅
- **Reverse at cancel/leave — correct.** Only when the booking was actually confirmed
  (`confirmedAt`), post-commit, best-effort, `IN` `BOOKING_REVERSAL` `fl-unbook:<id>` → nets the P&L
  to 0 via TASK-001's fold. Idempotency keys make booking/cancel safe to retry. ✅
- **`consumeTeacherHours` removed**; attend no longer draws down. ✅ Unit is satang throughout.
- **Heads-up (non-blocking, tech-debt — not rework):** the ops draw is **not atomic** with the
  scheduling DB tx (separate system, no 2PC). The `409`-rollback case is clean, but a rare failure
  *after* a successful draw but *before* commit could orphan a drawdown (budget drawn, booking not
  confirmed). Low risk at this manual-booking volume; the `fl-book:<id>` idempotency key prevents
  double-draw on retry. If it ever matters, add a compensating release on tx failure. Logged for Porter.

No rework. **TASK-002 core is DONE.** The DTO/override follow-ups are split into TASK-008 (blocks
TASK-004). TASK-005 remains available for you next.
