# TASK-109: scheduler-front (FE) — record an equipment rental in a few clicks
- Source: SPEC-031 §3 (REQ-028)
- Status: TODO (unblocked — TASK-108 DONE; owner Q2 = **BOTH** surfaces, 2026-08-04)
- Depends on: TASK-108 (`POST /rentals`)
- Assignee: @Fern (smart-scheduler-front)

## What to build
Let staff record a rental **in a few clicks, without leaving what they're doing** (AC #1): pick item
(set/ride/helmet/pads) + hours → `POST /rentals`. **Owner Q2 = BOTH surfaces:**
- **(a) add-on** on the booking/attendance flow (`refId = bookingId`), **and (b) a standalone quick-record** for a
  walk-in (`refId` omitted). Both hit the same endpoint.
- **Show the post result** — success / `duplicate` (already recorded) / error (`RENTAL_NOT_POSTED`) — never a silent
  dead button. VAT-inclusive prices shown as-is.
- 🔴 **Standalone idempotency (AC #4):** since (b) has no natural key, **generate ONE `idempotencyKey` per rental
  action** (e.g. a `crypto.randomUUID()` when the form opens) and send it on submit, so a double-click / retry posts
  once. Depends on the TASK-108 BE addition accepting an optional `idempotencyKey`. (The add-on path is already
  idempotent on `refId`.)

## Definition of Done
- [ ] A rental can be recorded in a few clicks from **both** surfaces (add-on + standalone); it posts and confirms.
- [ ] A duplicate submit is handled gracefully (shows "already recorded", not an error or a second charge) — incl.
      the **standalone** path via the client-sent `idempotencyKey`.
- [ ] A server error (`RENTAL_NOT_POSTED`) is surfaced with a reason.
- [ ] tsc clean; build ok. Measure any shared-row controls at 1600/1280/768/375 (board STANDING RULE).
