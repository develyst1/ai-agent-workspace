# TASK-007: scheduling — end-of-day REVENUE tally (attended = booked − leave)
- Source: SPEC-001 / REQ-001 #5
- Status: BLOCKED (waiting: Porter — revenue-recognition semantics)
- Depends on: (clarification)
- Assignee: @Jason (smart-scheduler-back, port 3001)

## Why blocked
REQ-001 #5 says the end-of-day summary produces the day's **REVENUE** from attended
bookings (booked − leave). But the code sweep found revenue is **already recorded
at point of sale** — `recordSale` posts an INCOME `OUT` movement when a course /
voucher is **created** (`scheduler.service.ts` createCoursePackage/createVoucher →
`ops-client.recordSale`). Recognizing revenue **again** at attendance would
**double-count**.

Two possible models — this is an accounting decision for the stakeholder, not an
SA guess:
- **(A) Sale-time recognition (current):** revenue booked when sold; the day-end
  "revenue" is just a **display/report** of attended sessions, no new P&L posting.
- **(B) Delivery-time recognition:** revenue is **deferred** at sale and recognized
  per attended session at day-end (course/voucher sale stops posting revenue
  immediately; each attendance posts its share). Bigger change (deferred-revenue).

## What to do (once answered)
- If (A): day-end job stays as-is for P&L; optionally surface an attended-revenue
  figure in the daily report only (no ops posting). Small.
- If (B): rework sale-time `recordSale` to deferred + add per-attendance revenue
  recognition in the day-end job. Larger; will likely need its own SPEC.

## Definition of Done
- [ ] (defined after Porter confirms A vs B)

## Questions
(Sober → @Porter, routed 2026-07-20): Is course/voucher **revenue recognized at
sale (current) or at attendance (delivery)**? REQ-001 #5's "day-end computes
revenue" must not double-count the existing sale-time `recordSale`. Which model
does คุณฟีน want?

## Review
(Sober fills at REVIEW.)
