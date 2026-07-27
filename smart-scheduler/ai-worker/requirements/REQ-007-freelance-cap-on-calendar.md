# REQ-007: Freelance income-cap visible on the staff calendar (show + keep bookable)
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-26 by stakeholder (PM chat) — confirms คุณฟีน's 2026-07-11 meeting decision
- Deadline: none
- Source: requirement hub UC-016 (WF-005 → UC-016 → SCR-006). Builds on delivered
  REQ-001 / REQ-004 (freelance budget-stock, standalone).

## Problem / Goal
Staff book teachers from the calendar, but a freelance teacher's remaining monthly
income budget is only visible on the separate "Teachers" management page — not on the
calendar, where booking actually happens. So staff can't see how much budget a
freelance has left at the moment they book. Worse, today the calendar **hides** a
freelance who is over budget, so they vanish from view entirely (surprising) instead
of showing their status.

Goal: make each freelance teacher's budget status visible **on the calendar** and keep
them selectable, so staff stay in control of the decision.

## Requirement
1. The staff calendar must show, for each freelance teacher column, a budget
   indicator: green → yellow → red reflecting remaining vs. total monthly budget
   (green = healthy, yellow = near cap, red = at/over cap).
2. A freelance who is at or over budget must **remain visible and selectable** on the
   calendar — reversing today's "hide when over budget" behavior (per คุณฟีน 2026-07-11).
3. Booking a freelance who is **over budget** must require a deliberate per-action
   **override** by staff; the system must not silently let the budget go negative. The
   override control must be reachable at the point of booking on the calendar.
4. Without an override, the system must still prevent confirming a booking that would
   exceed a freelance's budget (existing safeguard stays).
5. The "near cap" (yellow) threshold must use the per-teacher near-cap value already
   configured today — no new configuration surface required.

## Acceptance Criteria
- [ ] On the calendar, a freelance with healthy budget shows green; near-cap shows
      yellow; at/over budget shows red.
- [ ] A freelance who is over budget is still shown as a column and can be selected
      (not hidden).
- [ ] Booking/confirming an over-budget freelance **without** override is blocked with
      a clear message; **with** override it proceeds and the budget may go negative.
- [ ] The override control is reachable from the calendar booking flow.
- [ ] The indicator reflects the same remaining/total budget the backend already
      computes (drawn down at booking confirm) — FE and backend never disagree.
- [ ] No regression on the "Teachers" page budget display.

## Constraints
- The freelance budget model (per-teacher monthly budget, drawn down at booking
  confirm, reversed on cancel/leave) is already built and DELIVERED (REQ-001/REQ-004).
  This REQ is about **visibility + keeping the teacher selectable on the calendar** —
  reuse the existing remaining/total the backend already ships; do NOT define a new
  "which hours count" rule.
- Today the calendar folds "over budget" into "not bookable" and hides the teacher,
  AND the backend rejects a confirm that would exceed budget unless an override flag
  is set. **Both must be reconciled** to deliver #2–#4 — this reconciliation is the
  real work, not just adding a colored bar. HOW to reconcile is the SA's design.
- Backend stays the source of truth; any FE indicator is display-only.

## Out of Scope
- Changing how the budget is set, reset, or topped up (already delivered).
- Freelance P&L / expense reporting (deferred to the backoffice work).
- Bulk actions (covered by REQ-008).

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`. Per stakeholder: if anything
is unclear or a business/scope question arises, DO NOT guess or decide — write it here
and route `@Porter` before building.)
