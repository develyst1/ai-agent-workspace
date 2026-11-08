# REQ-5008 — A voucher with no sessions left can still be booked and checked in (Khwan, 2026-11-08)
**From:** ขวัญ via the owner (LINE, 11:43 AM, the owner's screenshot) · **Held by:** @Porter · **Status:** NEW — reproduce + explain first; no fix, no customer reply yet.

## The customer's words, verbatim
> พี่โด่งคะ จอง Voucher ไม่ได้ล็อกให้ วอยเชอร์ที่หมดแล้ว จองไม่ได้ค่ะ
> ตัวอย่าง
> ของ [the child named in the owner's screenshot] จริงๆเหลือแค่ 1 ครั้ง แต่ในระบบอนุญาตให้จองได้ 3 คลาสและคุณแม่สามารถ Check in ทั้ง 3 คลาสได้เลยค่ะ โดยไม่มีการขึ้นเตือนค่ะ

(The child's name is in the screenshot only; it is not copied into shared files. The tester matches it in-page.)

## What she reports (her words, not yet our finding)
1. A voucher that is used up should not be bookable ("วอยเชอร์ที่หมดแล้ว จองไม่ได้").
2. Her example: the voucher had **1** session left, the system let **3** classes be booked, and the parent could **check in all 3**, with **no warning**.

## Not known yet — nobody states a cause before the SA confirms it
- Whether "เหลือแค่ 1 ครั้ง" is the system's own Remaining count or her own sheet's count.
- Whether the 3 bookings were made before or after the quota ran out, by whom (admin / parent via LINE), and whether they were confirmed.
- Whether check-in should be refused, or warned, when the voucher has nothing left (her words cover both "จองไม่ได้" and "ไม่มีการขึ้นเตือน").
- Related history: REQ-048, REQ-081, REQ-087, REQ-100, REQ-103 (voucher booking / quota / cancel).

## Next
1. **Tanya (whole round):** read-only on uat — this child's voucher: total, remaining as shown, the bookings against it (dates, status, who booked, check-ins). Then reproduce the same sequence on sid (old build) until the symptom shows.
2. **Silver (Team B, front office back):** read-only code reading of the voucher booking + check-in paths: is there a quota check at booking and at check-in, and where the 3rd booking got through. Cause only after Tanya's facts.
3. Then: one customer message (after Tanya's gate), and a TASK if it is a defect.

## Silver's code read (2026-11-08) — a code finding, NOT yet her cause (Tanya's uat facts decide)
`CHECK-REQ-5008-voucher-quota-2026-11-08.md`: booking gate counts only ATTENDED hours (pending/confirmed bookings not reserved) ⇒ "1 left" accepts any number of future bookings until one is attended; check-in and day-end deduct with no check, Remaining clamps at 0 with no warning; each booking deducts 1 hour whatever its length. Fix ≈ 1.5 d (count reserved sessions in the one shared predicate: BE 1 + picker 0.5). **Open for ขวัญ:** at check-in on an empty voucher — refuse or warn (Silver recommends warn, +0.5 d). Plus a read-only list of already over-booked vouchers for staff.

## Tanya's interim facts (TEST-143, 2026-11-08) — findings, no cause
- **uat (read-only):** the child's one voucher, 10 h, now reads used 12 / 10, Remaining 0 (floored), EXHAUSTED. Each visit = 3 VOUCHER classes at the same hour, 1 h each, 3 different coaches. Attended: 10-04, 10-11, 11-01, 11-08 (×3 each, all checked in via LINE); 09-27 all cancelled. Before today 9 h used ⇒ 1 h left; today's 3 were all checked in via LINE ⇒ matches her words exactly. Who booked / when is not stored (no creator / created-at on bookings).
- **⚠️ Possible write on uat (declared by Tanya):** `GET /bookings/:id/checkin` issues a check-in token when a row has none; she called it on the 15 voucher rows. Most likely all tokens already existed (a confirm issues one); if one was minted, it is on a past class with its window closed. Not stored anywhere; route not used on uat again.
- **sid (booking half reproduced):** booking draws no hours (7 h booked on a 5 h voucher, all accepted); hours drawn only at attend; with 1 h left, 3 classes booked + confirmed, none refused, no warning. Booking screen's "N left" counts attended hours only (`VoucherPanel.tsx`). Check-in half follows after 14:31.
- Side note (not judged): voucher expiry was set from its first booking and didn't move back when an earlier class was booked later.

## Sent 2026-11-08 (owner: "ส่งขวัญแล้ว")
Reply v3 (Tanya PASS, md5 f03a6b5b): confirmed as reported; cause (booking counts only taught classes); fix for every voucher (TASK-870, Team B); over-booked list to admins (uat: 2 vouchers, CHECK-REQ-5008 § RESULT); asked her A = warn / B = refuse at check-in on an empty pre-fix voucher. Build default = warn (one-line switch). **Waiting:** her A/B.

## Khwan's ruling (LINE, 3:43 PM 2026-11-08, the owner's screenshot), VERBATIM
Reply to v3's question (check-in on an over-booked pre-fix voucher with no hours left: A warn / B refuse): *"B ka"*
⇒ **B: refuse the check-in.** TASK-870 flips its one-line constant from WARN to REFUSE (day-end auto-attend still never refuses, per Silver's design).
