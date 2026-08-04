# TASK-109: scheduler-front (FE) — record an equipment rental in a few clicks
- Source: SPEC-031 §3 (REQ-028)
- Status: BLOCKED (on TASK-108 + owner's Q2 entry-point answer)
- Depends on: TASK-108 (`POST /rentals`)
- Assignee: @Fern (smart-scheduler-front)

## What to build
Let staff record a rental **in a few clicks, without leaving what they're doing** (AC #1): pick item
(set/ride/helmet/pads) + hours → `POST /rentals`.
- **Entry point per the owner's Q2 answer** (Porter routing): default **(a)** an add-on on the booking/attendance
  flow (`refId = bookingId`), with **(b)** a standalone quick-record for a walk-in (`refId` omitted). Both hit the
  same endpoint.
- **Show the post result** — success / `duplicate` (already recorded) / error — never a silent dead button.
- VAT-inclusive prices shown as-is from the card.

## Definition of Done
- [ ] A rental can be recorded in a few clicks from where staff already are; it posts and confirms.
- [ ] A duplicate submit is handled gracefully (shows "already recorded", not an error or a second charge).
- [ ] A server error is surfaced with a reason.
- [ ] tsc clean; build ok. Measure any shared-row controls at 1600/1280/768/375 (board STANDING RULE).

## Blocked-on
Owner's Q2 (where staff record it — add-on vs standalone vs both). Confirm before building the entry surface;
the `POST /rentals` contract is stable regardless.
