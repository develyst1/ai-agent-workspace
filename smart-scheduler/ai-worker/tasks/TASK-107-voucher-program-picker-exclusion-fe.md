# TASK-107: scheduler-front (FE) — voucher program picker omits the excluded programs
- Source: SPEC-030 §4 (REQ-027 part b, UI half)
- Status: BLOCKED (on TASK-106)
- Depends on: TASK-106 (the exposed allowed/excluded set + the server rule)
- Assignee: @Fern (smart-scheduler-front)

## What to build
In the voucher booking flow's program picker (REQ-029/TASK-089), **omit or disable Onewheel and Balance Play** so
an excluded program isn't selectable for a voucher — driven by the **exposed** allowed set from TASK-106, **not** a
hardcoded list (the card will change before the code does).

- Course bookings are unaffected (all programs still selectable at their offered sizes).
- If a `VOUCHER_PROGRAM_EXCLUDED` refusal is ever hit (e.g. a stale client), show the server's reason — never a
  silent dead button.

## Definition of Done
- [ ] The voucher program picker does not offer Onewheel or Balance Play; it does for a course.
- [ ] The excluded set comes from the API (TASK-106), not a literal in the FE.
- [ ] A server `VOUCHER_PROGRAM_EXCLUDED` message is surfaced if hit.
- [ ] tsc clean; build ok.
