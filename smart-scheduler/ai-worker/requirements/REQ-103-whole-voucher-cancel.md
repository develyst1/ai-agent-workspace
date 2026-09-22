# REQ-103 — Cancel a WHOLE voucher (like cancel-whole-course)

**Source:** customer (Khwan) via owner, 2026-09-22. **Status: DISCUSSION — recorded; feasibility read requested from @Sober.**

## §1 — the ask
Cancel an **ENTIRE voucher** (not a single booking) — the same way a whole COURSE can be cancelled. Use case: the customer asks to cancel; whatever they then do with the remaining entitlement (convert to a course, etc.) is THEIR choice and out of scope — **we only need the ability to cancel the whole voucher.**

## §2 — distinct from REQ-100
REQ-100 (done) = cancel a single **voucher BOOKING on the schedule** (one session), balance untouched. REQ-103 = cancel the **whole voucher entitlement** itself (all of it), mirroring whole-course cancel.

## §3 — for @Sober (feasibility + size, no build yet)
- Does whole-course cancel machinery extend to a voucher entitlement? What is the voucher's lifecycle today (a `vouchers` row + remaining hours + any bookings drawn from it)?
- On a whole-voucher cancel: what happens to (a) the voucher's remaining balance, (b) any FUTURE sessions already booked/placed on the schedule from that voucher (cancel them too, like cancel-whole-course cancels future sessions?), (c) past/attended draws (kept)?
- A cancel reason (reuse the existing reasons)? No refund/conversion logic in scope — just the cancel. Any permission-key gate (like course cancel)?
- Size; flag owner decisions.

## §4 — owner rulings 2026-09-22 (SPEC-089, "เอาตามนั้น")
Whole-course-cancel shape on the voucher: `ended_at/by/reason` (closed END_REASONS), `POST /vouchers/:id/cancel` + `/preview`, every FUTURE live draw ⇒ CANCELLED, past draws + `used_hours` untouched, remaining balance FROZEN (readable for a manual conversion), nothing draws from an ENDED voucher. Migration 0051.
1. Permission = reuse `bookings.course-cancel` (NO new key 60). 
2. Coach notice = the course-end message + a voucher line (zero new bytes).
3. Family = SILENT (as the course end).
4. The card reads `ENDED · Nh left`.
