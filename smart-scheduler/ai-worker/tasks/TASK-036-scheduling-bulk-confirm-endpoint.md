# TASK-036: scheduling (BE) — bulk-confirm endpoint (partial-success, no batch rollback)
- Source: SPEC-011
- Status: DONE  (reviewed 2026-07-29 by Sober — verified tsc 0 / classifier 4/0 / suite 112/0 + route-shadow check + code inspection; see ## Review)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
Add `POST /api/bookings/bulk-confirm` that confirms many bookings in one call, reusing the **existing**
single-confirm per booking (idempotency + LINE outbox + freelance draw). Each booking is independent — one
failure must not roll back the others.

1. **Validation** (`validation.ts`): `bulkConfirm` = `{ ids: string[] }` — non-empty array of uuids, cap length
   (e.g. `.max(100)`).
2. **Route** (`routes/api.ts`): `.post("/bookings/bulk-confirm", zValidator("json", v.bulkConfirm), …)` →
   `svc.bulkConfirm(ids)`.
3. **Service `bulkConfirm(ids)`** (`services/scheduler.service.ts`): loop the ids **sequentially**, each in its
   own transaction (do NOT wrap the whole loop in one tx). Per id, build a `BulkConfirmResult`
   `{ id, outcome: "confirmed" | "already_confirmed" | "skipped", reason?: string }`:
   - Load the booking. Missing → `skipped` ("ไม่พบคาบเรียน").
   - Non-PENDING guard (bulk-only safety — never un-cancel): `CONFIRMED`/`ATTENDED` → `already_confirmed`;
     other non-PENDING (`CANCELLED`/`NO_SHOW`/…) → `skipped` ("ไม่ใช่คาบที่รอยืนยัน").
   - PENDING → `await updateBookingStatus(id, "confirm")` (**no override arg** — REQ-007 removed override-to-book).
     Success → `confirmed`. Wrap in try/catch: on any throw (`INSUFFICIENT_BUDGET` for an over-budget freelance,
     or other `ApiException`) → `skipped` with `reason` = the error message (use its `.message`/code). **Never
     rethrow** — continue the loop.
   - (Optional: if `updateBookingStatus`'s returned `notification.status === "skipped"` you can also map that to
     `already_confirmed`, but the PENDING guard already catches the confirmed case.)
   - Return `{ results }` in input order.
4. **Contract** (`types/contract.ts`): add `BulkConfirmResult` + the response type.

Do **not** change `updateBookingStatus`, the LINE outbox, or the freelance draw — reuse them as-is.

## Definition of Done
- [ ] `POST /bookings/bulk-confirm { ids }` confirms each PENDING booking exactly like a single confirm (status,
      one LINE, one freelance draw); returns a per-id result array in order.
- [ ] Partial success: an over-budget freelance (INSUFFICIENT_BUDGET) or a non-PENDING id is `skipped` with a
      reason **without** aborting the rest; already-confirmed ids → `already_confirmed`, no new LINE (retry-safe).
- [ ] No single wrapping transaction (one failure never rolls back other confirms).
- [ ] `bunx tsc --noEmit` clean; `bun test` green — add a test: a mixed batch (one PENDING freelance with budget
      → confirmed; one over-budget → skipped; one already-CONFIRMED → already_confirmed; one CANCELLED → skipped)
      yields the right outcomes and the good one is still confirmed. (Factor a pure result-classifier if it helps
      test without a live DB; the DB-touching confirm can stay integration-style/inspection per brownfield.)

## Implementation Notes

Thin endpoint that loops the **existing** single-confirm — no change to `updateBookingStatus`, the LINE outbox,
or the freelance draw. Files (all `smart-scheduler-back`):

- **`src/lib/bulk-confirm.ts`** (new, pure): `preCheckBulkConfirm(booking)` → `{proceed:true}` for `PENDING`,
  `{proceed:false, outcome:"already_confirmed"}` for `CONFIRMED`/`ATTENDED`, `{proceed:false, outcome:"skipped",
  reason}` for missing (`"ไม่พบคาบเรียน"`) or any other non-PENDING (`"ไม่ใช่คาบที่รอยืนยัน"`). This is the
  bulk-only PENDING guard (never un-cancels) — factored out so it's DB-free unit-testable.
- **`src/types/contract.ts`**: added `BulkConfirmOutcome` / `BulkConfirmResult {id, outcome, reason?}` /
  `BulkConfirmResponse {results}`.
- **`src/services/scheduler.service.ts`**: new `bulkConfirm(ids)` — loops ids **sequentially**, each: read the
  booking → `preCheckBulkConfirm` → if not proceed, push the classified result; else
  `await updateBookingStatus(id, "confirm")` (**no override arg** — REQ-007) in a `try/catch`. Success →
  `confirmed`; any throw (`INSUFFICIENT_BUDGET` for an over-budget freelance, or any `ApiException`, which
  `extends Error`) → `skipped` with `reason = err.message`. **No re-throw.** Each `updateBookingStatus` runs its
  own `db.transaction`, so there is **no single wrapping tx** — one failure never rolls back the others. Results
  returned in input order.
- **`src/validation.ts`**: `bulkConfirm = z.object({ ids: z.array(ID).min(1).max(100) })` (uuids, 1..100).
- **`src/routes/api.ts`**: `.post("/bookings/bulk-confirm", zValidator("json", v.bulkConfirm), …)` → `svc.bulkConfirm(ids)`.
  Placed right after `POST /bookings`; it's a distinct method+path (no `POST /bookings/:id` exists) so no route
  shadowing.

**Interlock REQ-007:** an over-budget freelance → `updateBookingStatus` draws → `INSUFFICIENT_BUDGET` thrown →
caught → `skipped` + the Thai reason (no override-to-book path). A teacher with the durable `limitOverride` still
confirms server-side (pre-existing in `reconcileFreelanceDraw`) → `confirmed`.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**.
- `bun test` → **112 pass / 0 fail** (20 files). New `src/lib/bulk-confirm.test.ts` covers the classifier
  matrix: missing → skipped(not found); `PENDING` → proceed; `CONFIRMED`/`ATTENDED` → already_confirmed;
  `CANCELLED`/`NO_SHOW`/`SICK_LEAVE`/`EXTENDED` → skipped(not-pending).
- ⚠️ Not run against a live DB (brownfield). The classifier (the non-DB branches) is unit-tested; the
  DB-touching confirm loop reuses the already-DONE, Sober-verified `updateBookingStatus` (own tx + idempotency +
  LINE + freelance draw) — verified by inspection per the DoD's allowance. Recommended deploy smoke: `POST
  /api/bookings/bulk-confirm { ids: [pending, alreadyConfirmed, overBudgetFreelance, cancelled] }` → results =
  `confirmed / already_confirmed / skipped(INSUFFICIENT_BUDGET) / skipped(not-pending)`; re-POST → the confirmed
  one is now `already_confirmed`, no new LINE.

**DoD:** per-id confirm == single confirm (status/LINE/draw) + ordered results ✓ · partial success (over-budget /
non-PENDING skipped without aborting; already-confirmed → already_confirmed, no new LINE) ✓ · no single wrapping
tx ✓ · tsc clean + `bun test` green, classifier test added ✓.

**Handoff:** FE multi-select + result summary = **TASK-037 (Fern, depends on the endpoint + `BulkConfirmResult`
contract)** — not in scope here.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- The PENDING-only guard is deliberate (bulk must not un-cancel a stray non-PENDING id — single-confirm has no
  such guard). If you'd rather gate purely on `confirmedAt` + let `updateBookingStatus` decide, flag it — but the
  DoD's non-PENDING-skip must hold.
  - **Jason's choice:** kept the explicit **status-based PENDING guard** in `preCheckBulkConfirm` (not
    `confirmedAt`) — `PENDING` proceeds; `CONFIRMED`/`ATTENDED` → `already_confirmed`; everything else non-PENDING
    → `skipped`. Reason: a `CANCELLED`/`NO_SHOW` booking can have `confirmedAt` set (it was confirmed before being
    cancelled), so a `confirmedAt`-only gate could try to re-confirm it. The status guard makes "never un-cancel"
    explicit and satisfies the DoD's non-PENDING-skip.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-29).** Correct, reuses the delivered confirm, and dodges the route-shadow trap.
- **Verified in code:** `bulkConfirm(ids)` loops sequentially — read booking → `preCheckBulkConfirm` → if
  !proceed push the classified result; else `await updateBookingStatus(id, "confirm")` (**no override**) in a
  try/catch → success `confirmed`, throw `skipped` (reason = `err.message`, no rethrow). Each
  `updateBookingStatus` runs its **own** `db.transaction`, so there is **no single wrapping tx** → one failure
  never rolls back others (AC #5). Results in input order. `preCheckBulkConfirm` (pure) — PENDING→proceed,
  CONFIRMED/ATTENDED→already_confirmed, missing/other→skipped; **status-based (not `confirmedAt`)** — good call,
  since a CANCELLED booking can carry `confirmedAt` and a `confirmedAt`-gate would try to re-confirm it.
- **Route not shadowed (checked — the TASK-029 lesson):** `POST /bookings/bulk-confirm` is a literal POST; the
  only other POST is `/bookings` (collection). The `/bookings/:id*` routes are all **PATCH** (different method),
  so no param route can capture `bulk-confirm`. ✓
- **Interlock REQ-007:** over-budget freelance → `updateBookingStatus` draws → `INSUFFICIENT_BUDGET` → caught →
  `skipped` + Thai reason (no override-to-book); durable `limitOverride` still confirms server-side. Correct.
- **Verified myself:** `bunx tsc --noEmit` → 0; `bun test src/lib/bulk-confirm.test.ts` → 4/0 (classifier
  matrix); full `bun test` → **112/0**.
- **All DoD met.** `updateBookingStatus`/LINE/draw untouched (reused).
- **TASK-036 → DONE.** **@Fern: TASK-037 unblocked** — the `POST /bookings/bulk-confirm` endpoint +
  `BulkConfirmResult {id, outcome, reason?}` contract are in. REQ-008 stays IN_SPEC until TASK-037 lands.
