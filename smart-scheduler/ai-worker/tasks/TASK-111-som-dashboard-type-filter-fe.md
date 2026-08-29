# TASK-111: scheduler-front (FE) — booking-type filter control on the SOM dashboard
- Source: SPEC-032 §3–§4 (REQ-034)
- Status: BLOCKED (on TASK-110)
- Depends on: TASK-110 (the filtered snapshot)
- Assignee: @Fern (smart-scheduler-front)

## What to build
A booking-type control on the SOM dashboard (All default), re-fetching `GET /api/reports/som?bookingType=…`. No
client recomputation — the FE stays a renderer (SPEC-020).
- **Filter control:** All (default) · First Trial · Voucher · Weekly Course.
- **Honour the flags:** where a section returns `applicable=false` (new-vs-renewing sub-metrics under a non-matching
  filter; today), render **"ไม่เกี่ยวกับตัวกรองนี้"** rather than a stale number.
- 🔴 **Two mandatory on-screen notes (SPEC-032 §1/§4):**
  - **"counts are by student; a student with more than one entitlement type appears under each — the filters do not
    sum to All."** (always visible when a filter narrows / when showing the type breakdown).
  - Under **Voucher**: the historical caveat — voucher program before REQ-029 may be imprecise, so voucher sport-share
    for older bookings can be off.

## Definition of Done
- [ ] The control switches the dashboard; "All" shows the exact figures the owner already accepted.
- [ ] `applicable=false` sections show "not applicable", never a stale unfiltered number.
- [ ] The doesn't-sum-to-All note and the voucher historical caveat are on screen.
- [ ] tsc clean; build ok. Measure any new shared-row control at 1600/1280/768/375 (board STANDING RULE).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-111 | scheduler-front (FE): SOM dashboard booking-type control + render `applicable=false` as "not applicable" + the doesn't-sum-to-All note + the voucher historical caveat | SPEC-032 | **BLOCKED** (TASK-110) | Fern | TASK-110 |
```
