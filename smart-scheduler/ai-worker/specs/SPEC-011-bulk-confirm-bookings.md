# SPEC-011: Bulk-confirm bookings (multi-select)
- Source: REQ-008
- Status: ACTIVE

## Overview
Let staff tick several bookings in the bookings list and confirm them in one action, with the **same
per-booking effect** as today's single confirm (status→CONFIRMED, one teacher LINE, one freelance draw),
**retry-safe**, **partial-success**, **no batch rollback**. Reuse the delivered single-confirm logic
(`updateBookingStatus(id,"confirm")`) — don't re-implement idempotency / LINE outbox / freelance draw.

**Design decision — a thin backend bulk endpoint (not an FE loop).** Both satisfy the AC (the single-confirm
is already idempotent + own-transaction), but a server endpoint gives: one round-trip (a day's worth can be
20–50 bookings), the per-booking transaction isolation + partial-success guarantee owned server-side, and a
simple FE (call once, render the summary). The backend cost is low — a loop over the existing service. So:
**BE `POST /bookings/bulk-confirm` + FE multi-select** (not N FE calls).

## API / Interface
**New:** `POST /api/bookings/bulk-confirm`
- Body: `{ ids: string[] }` (1..N booking ids; validate non-empty, uuids; cap at e.g. 100).
- Response: `{ results: BulkConfirmResult[] }`, `BulkConfirmResult = { id: string; outcome:
  "confirmed" | "already_confirmed" | "skipped"; reason?: string }`.
  - `confirmed` — newly confirmed (LINE queued, budget drawn once).
  - `already_confirmed` — idempotent no-op (was already confirmed; no new LINE). Retry-safety (AC #3).
  - `skipped` — couldn't confirm; `reason` = the Thai message (e.g. `INSUFFICIENT_BUDGET`
    "งบครูฟรีแลนซ์เต็มแล้ว…", or "ไม่ใช่คาบที่รอยืนยัน" for a non-PENDING booking, or not-found).
- Reuses the existing single-confirm auth; no new permissions.

## Data Model
None. No migration.

## Flow
**Backend — `bulkConfirm(ids)`** (new service; the route validates + calls it):
- For **each** id, in its **own transaction** (independent — one failure never rolls back others):
  1. Load the booking. Not found → `skipped` ("ไม่พบคาบเรียน").
  2. If already confirmed (`confirmedAt` set / status not `PENDING`): `CONFIRMED`/`ATTENDED` → `already_confirmed`;
     any other non-PENDING (`CANCELLED`/`NO_SHOW`/…) → `skipped` ("ไม่ใช่คาบที่รอยืนยัน"). **This guard keeps
     bulk safe for any id list** — it must not un-cancel a booking (single-confirm has no status guard; bulk
     adds this defensively; the FE also restricts selection to PENDING).
  3. Else call the **existing** `updateBookingStatus(id, "confirm")` (**no override** — REQ-007 removed
     override-to-book): success → `confirmed`. If it throws (`INSUFFICIENT_BUDGET` on an over-budget freelance,
     or any `ApiException`) → catch → `skipped` with the error's message/code. **No rethrow** — the batch
     continues (AC #5).
- Return `results` in input order. Process sequentially (simplest; volumes are small) — do **not** wrap the
  loop in a single transaction.
- **Interlock REQ-007:** an over-budget freelance's booking → `updateBookingStatus` draws → `INSUFFICIENT_BUDGET`
  → `skipped` + reason. No override path (matches REQ-007's hidden-when-full + no override-to-book). A teacher
  with the durable `limitOverride` still confirms server-side (pre-existing) → `confirmed`.

**Frontend — multi-select on the bookings list** (`BookingsTable` / `BookingsContent`, `/scheduler/bookings`):
- Add a **selection checkbox** per row; restrict selectable rows to **PENDING** (only those are confirmable) —
  e.g. show the checkbox only on PENDING rows, or disable others. A header "select all (on this page)" is a nice
  optional (still PENDING-only).
- A **"Confirm selected (N)"** action (button/toolbar) → `POST /bookings/bulk-confirm { ids }` → on return,
  show a **per-booking summary**: counts (X confirmed · Y already confirmed · Z skipped) + the skipped items
  with their reasons (a results modal, or a toast + an inline result list). Then invalidate the bookings query
  so statuses refresh; clear the selection.
- Retry-safe by construction: re-running over confirmed rows yields `already_confirmed` (no new LINE).

## Non-functional
- Reuse existing auth; one new endpoint. Per-booking tx isolation = the "no batch rollback" guarantee.
- LINE stays one-message-per-booking via the existing outbox (no digest — out of scope).

## Tasks
- TASK-036: scheduling (BE) — `POST /bookings/bulk-confirm` + `bulkConfirm(ids)` service looping the existing
  confirm per id (own tx, partial-success results). (Jason) (depends on: —)
- TASK-037: scheduler-front (FE) — multi-select (PENDING rows) on `BookingsTable` + "Confirm selected" →
  bulk-confirm + result summary. (Fern) (depends on: TASK-036 — the endpoint + result contract)

## Questions
(Sober asks; Porter answers as `> answer: ...`)
- No open business question — the REQ is fully specified (individual-tick scope; one-LINE-per-booking;
  partial-success; over-budget → skipped per REQ-007). One design note for the record: bulk adds a **PENDING-only
  guard** server-side so a stray non-PENDING id can't be un-cancelled — a small safety beyond single-confirm,
  not a behavior change to it. Flag if คุณฟีน ever wants bulk to also re-confirm/repair non-PENDING rows (not today).
