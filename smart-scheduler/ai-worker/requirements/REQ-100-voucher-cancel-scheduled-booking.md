# REQ-100 — Cancel a VOUCHER booking that's on the schedule (like a course session; no pause) — 2026-09-20

**Source:** customer via owner, 2026-09-20. **Status: RECORDED — Sober read next.**
> Voucher ต้องมี Cancel ด้วยเหมือนคอร์ส แต่ไม่ต้องมี pause · "voucher ก็ต้องมีแค่ cancel รายการที่จองลงตารางสิ"

## §1 — scope (owner-clarified)
NOT a whole-voucher cancel. Just: a VOUCHER session BOOKED onto the schedule must have a **Cancel** action (with a reason, like a course session's cancel) — NO pause. The voucher's remaining entitlement is untouched.

## §2 — read from @Sober
Does a scheduled VOUCHER booking already have a cancel action (REQ-009 added cancel for 1HR/Voucher — confirm whether it covers a voucher session placed on the schedule, or only the create-time path)? If a gap, add Cancel (reason set as today's cancel reasons) to the scheduled voucher booking; no pause. Size it.

## §3 — RESOLVED 2026-09-20: already exists, no build
Sober: the calendar modal's cancel-with-reason already covers a scheduled VOUCHER booking (REQ-074/TASK-220; `BookingModal.tsx:454`) — reason required + stored; the voucher's remaining hours untouched (an ATTENDED one corrected returns the hour). No pause. Nothing to build — the customer just needs the `Cancel` button on the voucher session in the calendar (same door as a 1-hour). Tanya confirms on sid.
