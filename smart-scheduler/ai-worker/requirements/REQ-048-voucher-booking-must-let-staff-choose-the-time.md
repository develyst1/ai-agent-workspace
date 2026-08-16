# REQ-048: Booking a voucher session must let staff choose the TIME (it is locked at 09:00 today)
- Status: READY_FOR_SA
- Priority: **HIGH** — it blocks the normal use of a product the school sells
- Requested: 2026-08-16 by stakeholder (owner), from a customer meeting
- Deadline: none stated
- Source: owner, 2026-08-16 — *"เลือกเวลาการใช้ voucher ตอนนี้มีแค่ระดับวัน … กดจองลงไป เลือกประเภท voucher แล้วมันขึ้นว่า
  ครูคนนี้ วันนี้ มัน lock เวลาไว้เลยว่า 9.00 ซึ่งมันควรจะเลือกได้"*

## Problem / Goal
On the New-booking modal, choosing the **Voucher** tab pins the session to **09:00** for the chosen teacher and day.
A voucher is exactly the product a family uses **whenever they can come** — so a fixed 09:00 makes the flexible
product the least flexible thing on the screen. Staff either book the wrong time and fix it afterwards, or avoid
the tab.

**Goal: booking a voucher session asks for the time, the same way every other booking on this screen does.**

## Requirement
1. **The Voucher tab has a time field**, filled by staff, not defaulted-and-locked.
2. **The offered times are the ones actually bookable** for that teacher on that day — the same availability rule
   the other tabs already use. A slot that would clash is not offered, or is refused with a reason.
3. **The rest of the voucher flow is unchanged** — the program choice (REQ-029), voucher exclusions (REQ-027),
   remaining-count and expiry all behave exactly as today.
4. If a **default** time is still shown for convenience, it must be **editable** and must not be a hidden constant.
   > **DECIDED (Porter, 2026-08-16, correcting my own earlier lean):** **seed it with the clicked cell's time.**
   > I originally leaned "empty and deliberate". That was the right instinct against a *pinned* 09:00 — but the pin
   > is exactly what this REQ removes, and once the field is editable, seeding it from the cell the staff member
   > actually clicked is not a hidden constant: it is the same behaviour the other tabs already have, and it saves
   > a tap on the common case. Consistency with the rest of the modal beats my earlier preference.

## Acceptance Criteria
- [ ] **AC-1** — **Given** the Voucher tab with a teacher and date chosen, **When** staff open the time field,
      **Then** they can pick a time other than 09:00 and the booking is created **at the chosen time**.
- [ ] **AC-2** — **Given** a teacher already booked at the chosen time, **When** staff try to save, **Then** it is
      **refused with a reason** (the existing clash wording), and nothing is written.
- [ ] **AC-3 (regression, REQ-029)** — The voucher booking still asks for and records the **program**; it is not
      inferred from the teacher's first subject.
- [ ] **AC-4 (regression, REQ-027)** — Voucher exclusions still apply: a voucher may not be used for an excluded
      program, whatever time is chosen.
- [ ] **AC-5 (regression)** — Remaining count decrements as before, an expired voucher is still not offered, and the
      session appears on the calendar at the chosen time.
- [ ] **AC-6** — The time control is **the same control** as the other tabs use (consistency, per REQ-043's spirit).

## User-facing wording (Porter as UX writer)
- Field label — TH: `เวลา` · EN: `Time` (as elsewhere on this modal)
- Empty state / placeholder — TH: `เลือกเวลา` · EN: `Select a time`
- Clash refusal — reuse the existing wording used by the other tabs; do not introduce a second phrasing.

## Constraints
- Presentation + input only. **No change** to voucher economics, exclusions, expiry, or what the booking writes
  beyond the chosen time.
- Same screen as **REQ-043** and **REQ-044** — three requirements, one FE surface. **Sequencing is Sober's call.**

## Out of Scope
- Letting a **parent** book a voucher session themselves (not asked for).
- Multi-session / recurring voucher booking.

## Questions
- **Q1 (to SA):** is 09:00 a hardcoded default on the Voucher tab, or does the tab simply not render the time
  control that the other tabs have? The answer decides whether this is a one-line fix or a missing field — and I
  want it in writing either way, because "it was hardcoded" is worth knowing before we trust similar defaults
  elsewhere on this screen.
- **Q2 (to owner):** should the time list be **free** (any time the teacher is free) or restricted to the centre's
  standard slot times? Porter's lean: the same rule the Trial/Single tabs already use — one availability rule for
  the whole screen, not a per-tab dialect.
  > answer: _pending_
