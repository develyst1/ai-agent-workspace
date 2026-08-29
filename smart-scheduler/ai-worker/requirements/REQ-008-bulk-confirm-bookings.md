# REQ-008: Bulk-confirm bookings (multi-select)
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-26 by stakeholder (PM chat)
- Deadline: none
- Source: requirement hub UC-027 (WF-001 → UC-027 → SCR-004). Builds on the delivered
  single-booking confirm.

## Problem / Goal
Today staff confirm bookings one at a time. When there are many to confirm (a day's
worth, or a long course's sessions), doing each individually is slow and error-prone.
Staff want to select several bookings and confirm them in one action.

## Requirement
1. Staff must be able to **select multiple bookings** (tick/checkbox selection in the
   bookings list) and confirm all selected in a single action.
2. Confirming in bulk must have the **same effect per booking** as confirming
   individually today — including the teacher's LINE notification, **one message per
   booking**.
3. The bulk action must be **safe to retry**: a booking already confirmed is skipped,
   never double-confirmed or double-notified.
4. **Partial success is allowed**: if some selected bookings can't be confirmed (e.g.
   an over-budget freelance without override, or another validation issue), the system
   must confirm the ones that can, skip the ones that can't, and show a **per-booking
   result summary** (which succeeded, which were skipped and why). It must NOT roll
   back the whole batch because one item failed.

## Acceptance Criteria
- [ ] Staff can select multiple bookings in the list and trigger one "confirm" action.
- [ ] Every successfully-confirmed booking reaches the exact same state as a single
      confirm (status, teacher LINE sent once, freelance budget drawn once).
- [ ] Re-running the bulk action over an already-confirmed selection changes nothing
      and sends no duplicate notifications.
- [ ] When some items fail, the rest still confirm and staff see a clear summary of
      each booking's outcome (confirmed / skipped + reason).
- [ ] No batch-wide rollback on a single-item failure.

## Constraints
- Reuse the existing single-confirm behavior per booking (idempotency + LINE outbox +
  freelance budget draw are already built and must not be re-implemented differently).
  HOW the bulk action is delivered (a bulk endpoint vs. a controlled loop) is the SA's
  design decision.
- Interlock with REQ-007: a bulk selection containing an over-budget freelance follows
  REQ-007's rule — such items are skipped (and reported) unless override applies.
- Selection scope for launch = staff tick individual bookings (not "whole day" or
  "whole course" auto-select) — the most flexible minimum.

## Out of Scope
- A single digest LINE message for a batch (kept as one-per-booking for now).
- Auto-selecting an entire day/course (possible later enhancement).
- Bulk actions other than confirm (cancel, attend, etc.).

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`. Per stakeholder: if anything
is unclear or a business/scope question arises, DO NOT guess or decide — write it here
and route `@Porter` before building.)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-008 | Bulk-confirm bookings (multi-select) | MEDIUM | ✅ **DELIVERED** | **Live acceptance PASSED 2026-07-29** (stakeholder ran, Porter verified): tick multiple PENDING bookings → "Confirm selected" confirms them in one action; a results modal reports each outcome; an over-budget freelance is **skipped-and-reported** (no batch rollback — explained to + OK'd by stakeholder); retry-safe (no dup LINE). TASK-036 (BE `POST /bookings/bulk-confirm`) + TASK-037 (FE multi-select + results modal), Sober-verified, deployed (back+front). |
```
