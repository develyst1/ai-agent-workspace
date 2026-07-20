# REQ-001: Freelance teacher pay as a monthly budget-stock with auto-disable at cap
- Status: IN_SPEC
- Priority: HIGH
- Requested: 2026-07-20 by คุณฟีน (stakeholder)
- Deadline: none

## Problem / Goal
The owner wants to **control freelance labor cost and keep work fair** — cap how
much each freelance teacher can earn per month so no single freelancer gets
disproportionately more work than the others — while **tracking freelance pay as
an expense in the backoffice P&L without recomputing it by hand every month**.

This is the concrete build of the previously-designed "Freelance income ceiling /
auto-disable" (UC-016), realised through the backoffice's existing **stock**
mechanic, under the confirmed **Path A (item-centric P&L)** direction. It does NOT
introduce a full payroll engine or the student hour-wallet.

It also covers **FT/PT salary as a per-teacher recurring monthly fixed cost** (set
once, auto-posts to P&L each month — see #10), so all teacher cost lands in the P&L
without monthly hand-keying.

## Requirement
The system must:

1. Give **each freelance teacher a per-person monthly budget (baht) and a
   per-person rate**, both editable by admin in the backoffice. Values differ per
   teacher (e.g. kob = 100,000 budget @ 1,500/hr; mark = different numbers).
2. **Reset each freelance's budget at the start of every month.**
3. Model the budget as a **stock item that is drawn down** (budget = starting
   stock; taking a job = stock-out). Remaining shown as `remaining / budget`
   (e.g. 98,500 / 100,000).
4. **Freelance EXPENSE = drawn down at BOOKING time** (this is the ONLY dynamic
   expense; corrected by คุณฟีน 2026-07-20). The moment a freelance is booked, that
   job's baht (rate × hours) is drawn from their monthly budget-stock. This **single
   action does three things at once**: (a) records the freelance expense to P&L,
   (b) enforces the **real-time cap** (drives auto-hide, prevents over-booking),
   (c) shows `remaining / budget`. **Cancel / customer-leave reverses it** (returns
   to stock → releases cap and un-books the expense).
5. **The END-OF-DAY summary computes REVENUE only — NOT expense.** The day-end job
   tallies **attended bookings = booked − customer-leave** to produce the day's
   **income** figure for the P&L. It does **not** touch freelance budgets or expense.
   → Net P&L inputs: **revenue** = attended bookings (day-end) · **expense** = freelance
   draw-downs (at booking, per #4) + FT/PT fixed monthly cost (per #10). Nothing else.
6. Freelance expense posts to the P&L **automatically** (no manual monthly keying) —
   because it rides the booking-time budget-stock movement in #4.
   The per-job baht is a **plain amount = per-teacher hourly rate × hours** (all
   bookings are 1h at launch). Group/Camp flat rates are deferred — see Out of Scope.
7. When a freelance's remaining budget **reaches 0 (cap hit for the month)**, the
   frontoffice must **auto-hide that teacher from the booking screen in real time**
   (no new bookings for them) — driven by the booking-time cap draw-down in 4a.
   A **configurable per-teacher near-cap warning** should flag them before 0.
8. The **teacher-management screen must show which freelancers have hit their cap.**
9. Admin must be able to **lift the cap** so a capped teacher can keep taking work —
   by **either topping up the budget (add stock) or allowing it to go
   negative / override** (either mechanism is acceptable to the stakeholder).
10. **Full-time / part-time pay is a per-teacher RECURRING monthly fixed cost, kept
    as effective-dated history.** Admin sets each FT/PT teacher's monthly salary
    **once** (per person, e.g. เอก 20,000); the system **auto-posts it as a
    `FIXED_COST` expense to the P&L every month automatically** — **no monthly
    re-keying**.
11. **A salary change must NOT alter past months** (correctness of historical P&L).
    A change is **effective-dated**: admin enters the new amount and the **month it
    takes effect from**; months before that stay **frozen at the old amount**, and
    the new amount auto-posts from the effective month onward. The system keeps the
    **salary history** per teacher (amount + effective-from → effective-to), so any
    past month's P&L always reflects the salary that was actually in effect then.
    Joining/leaving is the same idea (effective-from / effective-to a month).
12. FT/PT are **never** part of any per-booking calculation, cap, or day-end tally —
    the per-booking money mechanic (#4) is **freelance-only**.

## Acceptance Criteria
- [ ] Admin can set and edit a per-freelance **monthly budget** and **rate**.
- [ ] Remaining budget is visible as `remaining / budget` per freelance.
- [ ] The **end-of-day summary produces the day's REVENUE** from attended bookings
      (booked − leave); it does **not** compute expense or touch freelance budgets.
- [ ] A freelance's budget is **drawn down at booking** (not day-end); the drawn
      amount is the freelance **expense** in the P&L.
- [ ] Admin sets each FT/PT teacher's monthly salary **once**; it **auto-posts to the
      P&L as a fixed-cost expense every month** with no re-keying, until admin edits it.
- [ ] A salary change is **effective-dated**: months before the effective month keep
      the **old** amount; the new amount applies from the effective month onward.
      Re-opening a past month's P&L shows the salary that was in effect then (not the
      latest). Salary history (amount + from/to month) is viewable per teacher.
- [ ] A freelance whose remaining budget is 0 **does not appear** on the frontoffice
      booking screen.
- [ ] The teacher-management screen **flags capped freelancers**.
- [ ] A **configurable near-cap warning** flags a freelance before they hit 0.
- [ ] Booking a freelance **counts against the cap immediately**; a capped freelance
      cannot be booked (auto-hidden in real time); cancel/leave releases the reservation.
- [ ] Admin can **unlock** a capped teacher (top-up OR allow-negative); the teacher
      can then be booked again.
- [ ] Freelance deductions appear as **expense in the P&L report** for that month.
- [ ] Budgets **reset the next month**.

## Constraints
- **Stakeholder-mandated approach** (record as constraint, not open design): reuse
  the backoffice **stock-item mechanic** (budget = stock, hire = stock-out).
- **Freelance expense + cap** both happen at **booking time** via one budget-stock
  draw-down (reversed on cancel/leave). The **existing end-of-day cut job** is
  extended to compute the day's **REVENUE** (attended = booked − leave) — it does
  NOT compute expense.
- Per-person values; **monthly reset**.
- Direction is **Path A (item-centric P&L)** — no full payroll/settlement engine,
  no student hour-wallet (both set aside per 2026-07-20 decision).

## Out of Scope
- Full-time / part-time overtime, off-site fuel, OT auto-calculation (stay manual
  `FIXED_COST` / expense).
- Student hour-wallet (`ops.accounts` debit) — set aside.
- Seeding the **real** per-freelance budgets and rates (numbers to be provided
  later by the stakeholder — will be a DATA REQUEST).
- **Group/Camp flat session rates (625/1,250)** and any per-booking teaching-mode
  field — **deferred** (คุณฟีน confirmed 2026-07-20). Launch uses per-teacher hourly
  rate only. (Real-time over-budget prevention IS in scope — see rule 4a.)

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)

- SA: For rule #5, each booking needs to carry "how much this job pays" (its
  pay basis / teaching mode). Where should that come from and is it already on the
  booking, or does it need adding? (This determines how the end-of-day job sums a
  freelance's amount.)
  > SA (from code, 2026-07-20): The pay basis is **NOT on the booking**. A
  > `bookings` row carries teacherId, date, startTime/endTime, status, type — but
  > **no amount, no rate, and no teaching-mode** field, and **every booking is
  > exactly 1 hour** (no duration column). "Private/Group/Camp" exist only as
  > loose subject *names* / a teacher nickname in seed data, not as structured
  > data. The only pay figure that exists is the per-teacher **hourly rate** held
  > on the teacher's backoffice EXPENSE item (`sale_price_minor`).
  > → **Recommendation (SPEC-001 Phase 1):** pay = per-teacher hourly rate ×
  > attended 1h-slots. This covers the hourly-freelance case with zero new data.
  > **DECISION NEEDED @Porter:** does คุณฟีน need the **flat Group/Camp rates
  > (625/1250)** differentiated *now*? If yes, we must add a per-booking
  > "teaching-mode" field (new work — TASK-006) and define how staff pick it when
  > booking. If "hourly rate is enough for launch", we defer it. Which?
  > **answer (Porter, 2026-07-20):** Hourly is enough for launch — per-teacher
  > hourly rate × attended 1h-slots. **DEFER Group/Camp flat rates (no TASK-006 now).**
  > ⚠️ BUT คุณฟีน corrected the timing model (this reverses SPEC-001's "deduct only
  > at day-end"). Two separate concerns:
  > 1. **Freelance expense + cap both happen at BOOKING time.** One budget-stock
  >    draw-down (rate × hours) does all of: record the freelance expense to P&L,
  >    enforce the real-time cap, drive auto-hide. Cancel/leave reverses it. Freelance
  >    is the ONLY dynamic expense. (This is the "จำนวนชั่วโมงที่รับงานไป" gate in UC-016.)
  > 2. **The end-of-day summary computes REVENUE ONLY** (attended = booked − leave) —
  >    NOT expense, and it never touches freelance budgets.
  > So P&L = **revenue** (attended, day-end) − **expense** (freelance draw-downs at
  > booking + FT/PT fixed monthly cost). Nothing else.
  > See updated rules #4/#5/#6/#10. FT/PT are pure FIXED_COST, never in any booking calc.
- SA: Should there be a "near-cap" warning threshold (e.g. reorder_level) before
  hitting 0, or only hard-stop at 0?
  > SA (from code): the `reorder_level` column already exists on the budget item
  > and the staff UI already tints the freelance bar as a warning near the limit —
  > so a per-teacher **warning threshold is cheap** to support. Hard-stop stays at 0.
  > **DECISION NEEDED @Porter:** include a configurable near-cap warning
  > (recommended, low cost), or hard-stop-at-0 only?
  > **answer (Porter, 2026-07-20):** Yes — include a configurable per-teacher
  > near-cap warning threshold. Hard-stop stays at 0.
- SA: Confirm the monthly reset semantics for a mid-month unlock/top-up (does a
  top-up carry into next month or does the reset overwrite it?).
  > SA (from code): reset is an absolute `ADJUST` to the configured monthly
  > budget (P&L-neutral); a mid-month top-up is an `IN` movement that raises the
  > *current* remaining but does not change the configured monthly amount.
  > → **Recommendation:** monthly reset **overwrites** to the base budget →
  > **top-ups do NOT carry** into next month (each month starts clean at the
  > configured amount). **DECISION NEEDED @Porter:** confirm top-ups do not carry?
  > **answer (Porter, 2026-07-20):** Confirmed — monthly reset overwrites to the
  > base budget; mid-month top-ups do NOT carry into next month (each month starts
  > clean at the configured amount).
