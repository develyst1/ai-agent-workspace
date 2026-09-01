# REQ-076: พักการจองรายครั้ง / Voucher / 1st Trial (owner's **REQ-013**)

- Status: **DRAFT — captured, NOT `READY_FOR_SA`.** Questions below block the spec.
- Priority: TBD — the owner has not ranked it against REQ-005 or the `REQ-BO` block
- Requested: 2026-08-30 by the owner, relaying the customer
- Deadline: none stated

## Problem / Goal

A **course** can already be paused — REQ-071 / board REQ-071 gave it a 5th status (`DROPPED`), it leaves the
calendar without being deleted, it does not fall into Expire, and an admin resumes it later by editing the
expiry. **A single booking cannot.** The customer wants the same escape hatch for the three non-course types.

The owner's words, verbatim:

> *"การจองแบบรายครั้ง หรือ voucher หรือ first trial เขาอยากได้ พัก ด้วยเหมือนคอร์สที่มี พักคอร์ส เหมือนพักไว้ก่อน
> แล้วมีกล่องบอกว่ามีรายการที่พักไว้ ให้แอดมินไปเอาออกมาลงได้ ตอนไหนก็ได้"*

Two halves, and the second is the one that makes it usable:
1. **Pause** a 1HR / Voucher / 1st Trial booking — off the calendar, not cancelled, not lost.
2. **A visible box listing what is paused**, from which an admin can put it back on the schedule **at any time**.

## Why this is not simply "reuse REQ-071"

Grounded, not assumed — but stated as the reason the questions below exist, not as a design:

- A **course** pause has an obvious anchor: the course still exists, and the sessions it owns move with it. A
  **single booking IS the session** — pausing it means the booking exists with no date at all, which is a state
  the calendar has never had to render.
- **The three types differ in what was already consumed.** A Voucher session draws on an entitlement; a 1HR and
  a 1st Trial **post revenue at day-end once `ATTENDED`**. So "pause" has a different money meaning per type,
  and that is a business decision, not a technical one.

⚠️ **`FIRST_TRIAL` is a single one-off session.** Pausing it is coherent, but worth confirming the customer
really means all three and not just 1HR/Voucher — Porter is not assuming it (the owner's REQ-009 had exactly
this shape of gap: it named 1HR/Voucher and 1st Trial was silently missing).

## Acceptance Criteria

🔴 **Not written yet — deliberately.** Every AC here would encode a guess about the questions below. Porter
writes them the moment the owner answers; a vague AC is a defect shipped into the process (`PM.md`).

## User-facing wording (Porter, UX writer)

To be written with the ACs. The one word already in play is the customer's own — **"พัก"**, matching the
course-pause vocabulary they already use, **not** "ระงับ" or "Hold".

## Out of Scope (proposed — owner to confirm)

- Refunding or reversing money at the moment of pause. Reversal stays a backoffice decision (the line the owner
  has held twice: money never moves as a side effect of a staff click).
- Pausing a **course** — that already exists (REQ-071).

## Questions — @Porter to the owner (do NOT invent any of these)

1. **All three types, or only 1HR + Voucher?** A 1st Trial is a single one-off session.
2. **What happens to the money?** A 1HR / 1st Trial posts revenue at day-end once `ATTENDED`.
   - (a) Pause is only allowed **before** it is attended, so no money is ever involved, or
   - (b) it can be paused after, and the posted revenue simply stays until someone reverses it in the backoffice?
3. **A Voucher session draws on the voucher's quota — does pausing give the session back to the quota, or hold it?**
4. **Where is the box?** The customer asked for "กล่องบอกว่ามีรายการที่พักไว้" — which screen: the calendar page,
   the bookings page, or the student's own card?
5. **Does the expiry keep running while paused?** A course resumes with an admin-edited expiry (REQ-071). A
   voucher has its own expiry — does a paused session keep burning it, or is the clock stopped?
6. **Does the teacher get a LINE message when a booking is paused, and again when it is put back?** (The teacher
   had it on their schedule; it silently disappearing is how a teacher shows up for nothing.)
7. **Priority against REQ-005 and the `REQ-BO` block** — this is new scope; something else moves.
