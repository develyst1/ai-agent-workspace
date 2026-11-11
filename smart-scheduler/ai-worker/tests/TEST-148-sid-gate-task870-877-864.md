# TEST-148: sid gate after the 11-09 deploy — TASK-870 (voucher gate + LINE page), TASK-877 (Coach Capacity), TASK-864 (C1)
**Status:** (1) ✅ TEST_PASSED + 🐞 D-148-1 (booking race) + O-148-1 · (2) ✅ TEST_PASSED · (3) ✅ TEST_PASSED (closed 11-09 from Sector's DB read). D-148-1 + O-148-1 fixed (TEST-149).
**Source:** Porter's 2026-11-09 entry in `inbox/QA.md` · TASK-870, TASK-877, TASK-864.

**Build:** sid as deployed (Porter: SB `976cf33` + SF `d8f800c`; the local clones' HEADs read the same). The deployed host shows no version, so the build id is Porter's, not seen by me.
**Instrument:** headless Chrome, sid card `picklocker/state/som.json` used as given (no password, no sign-in); the API the screens call, inside that session; the parent's check-in page opened in a fresh signed-out context at phone width (375 px). Run 2026-11-09 00:05–00:15 Bangkok.
**Test data:** QA child `c1743305` (no parent), QA coaches not on LINE, Private SURFSKATE, note "QA TEST-148".

## (1) TASK-870 / REQ-5008: ✅ TEST_PASSED, with 1 defect (a race) and 1 observation
**Booking gate** (voucher V1 `32881b3d`, 5 h, nothing attended):
| Step | Reply | Voucher after (used / reserved / available) |
|---|---|---|
| 4 bookings, 16 Nov – 7 Dec | 201 ×4 | 0 / 4 / 1 (reserved climbs 1→4 one by one) |
| 5th booking (14 Dec) | 201 | 0 / 5 / 0 |
| **6th booking (21 Dec)** | **400 «ชั่วโมงในวอยเชอร์หมดแล้ว»** | 0 / 5 / 0 |
| **อื่นๆ booking with this voucher on a full voucher** | **400, same sentence** | 0 / 5 / 0 |
| **Move the 5th, 14 → 15 Dec, on the full voucher** | **200 (not refused)** | 0 / 5 / 0 |
| Cancel the 16 Nov class | 200 | 0 / 4 / 1 |
| อื่นๆ booking with the voucher, 1 h free | 201 | 0 / 5 / 0 (**the อื่นๆ row reserves**) |
| **Voucher booking after it** | **400, same sentence** | 0 / 5 / 0 |
- The list DTO carries `hoursReserved` + `hoursAvailable`; `remaining` stays 5 (used-based), as ruled.

**Check-in on an empty voucher** (V2 `f73a2cb7` at used **5 / 5**, one class `0800174a` still live today 00:30, CONFIRMED):
- **The parent's page** (`/checkin?token=…`, signed out, 375 px): the check-in POST returns **409**, and the page shows:
  - TH: **«วอยเชอร์หมดแล้ว» / «ชั่วโมงในวอยเชอร์หมดแล้ว กรุณาติดต่อแอดมินเพื่อซื้อเพิ่ม» / «ปิดหน้านี้ได้เลย»**, **no button at all** (no Retry).
  - EN: **"Voucher used up" / "This voucher has no hours left. Please contact the admin to buy more." / "You can close this page"**, no button.
  - **Nothing written:** after each load the class is still CONFIRMED with no check-in channel, and the voucher still 5 / 5.
- **The admin attend** (`PATCH /bookings/:id/status` attend): **409 `VOUCHER_EXHAUSTED` «ชั่วโมงในวอยเชอร์หมดแล้ว»**, nothing written (row CONFIRMED, used 5 / 5).
- **Control:** the same page on the same class while it was still PENDING showed the old "not ready (confirm first)" failure with Retry (400), so the new branch is only on `VOUCHER_EXHAUSTED`, as built.

**🐞 Defect D-148-1 (Team B's change; severity: low–medium): two bookings sent at the same moment both pass the gate.**
- **Repro (sid, one go):** a voucher with **exactly 1 h available** (V2 at used 4 / 5, 0 reserved). Send 2 voucher bookings in parallel (`Promise.all`, same child, same coach, 00:30 and 02:30). **Expected:** one 201, one 400. **Actual:** **201 and 201**; the voucher reads reserved 2 / available 0 (really −1).
- **What it allows:** the over-booked state the fix is meant to stop, through a double submit or two admins at once. I then attended one, which left the empty voucher with a live class (how the check-in refusal above was reached).
- Bob's review names the same race for check-in ("two check-ins on the same last hour at the same instant"); the booking side isn't named. No fix proposed; it's Silver's.

**Observation O-148-1 (not judged): the whole-voucher cancel leaves an อื่นๆ row that draws on the voucher.**
- Ending V1 (`POST /vouchers/:id/cancel`) cancelled its VOUCHER rows but **left the อื่นๆ row `20867f12` (28 Dec) PENDING, still reserving 1 h on an ENDED voucher**. I cancelled it by hand.
- Amendment 2 made such rows reserve; the end-of-voucher path wasn't in its list. For Silver to say whether it should be.

**Not tested here:** the admin's toast on the painted screen and the booking form's voucher picker (API only; the screen's words are an existing approved string); a real phone / LINE in-app browser (the page was a desktop Chrome at 375 px); the day-end auto-attend on an empty voucher.

## (2) TASK-877 / REQ-5009 #2 Coach Capacity: ✅ TEST_PASSED
**My own recount of November for all 29 coaches** (work days minus recorded leave; FT 4 / 5, PT 0 / 5, FL 0; booked = lessons + the GROUP row + ECA / CAMP rows, not FREE / KOL, not cancelled, not seats, main + extra coaches) **= the API on 28 of 29, in all 4 numbers each.** The month has 27 ECA, 6 CAMP and 2 KOL rows; 8 coaches have live ECA / CAMP rows, so the match isn't vacuous.
- **The one difference is Karn** (`821186fa`, now PART_TIME): the API's weekend available is **36 = 9 days × 4**, mine was 45 because the teacher list doesn't expose his own rate. **So Karn's own 4 h is applied** ✓.
- **Rates seen:** FT 12 coaches at 4 / 5 (e.g. 21 weekdays × 4 = 84, 9 weekend days × 5 = 45), PT 6 at 0 / 5 (Karn 4), FL 11 at 0 / 0. **PT weekday hours aren't counted** (PT weekday available 0 on every PT).
- **Live delta** (QA FT coach `7c9bbc14`): + an ECA hour on Tue 10 Nov → weekday booked **77 → 78**; + a FREE hour the same day → **78 (unchanged)**; both cancelled → 77 again. The weekend ECA add hit an existing class on that coach (409 SLOT_TAKEN), so the weekend side rests on the recount only.

## (3) TASK-864 C1, a revenue line at confirm: 🟡 NOT_TESTED (the write was done; the read isn't mine)
- **Done on sid:** a FIRST_TRIAL `34477210-1029-4260-906b-587d1e6ef7de` and a SINGLE_SESSION `210fcf6e-46a9-4984-a7fd-0bf24d32e9a9` (QA child, QA coach, 11 Nov), each **confirmed 200** at 2026-11-08 17:09:56 / 17:09:57 UTC, then cancelled (ADMIN_ERROR) so the day-end won't post them. Also 2 vouchers created today: `32881b3d…`, `f73a2cb7…` (each should have written a VOUCHER line at create).
- **Why NOT_TESTED:** the line lives in `bo.revenue_line`, read through the back office's API with a CEO sign-in, which I don't have and won't make. I don't run SQL.
- **To settle it, a read for whoever holds sid's DB (bare SQL, sid only):**
```
SELECT idempotency_key, type, amount_minor, source, ref_type, ref_id, occurred_on
FROM bo.revenue_line
WHERE idempotency_key IN ('rl:booking:34477210-1029-4260-906b-587d1e6ef7de',
                          'rl:booking:210fcf6e-46a9-4984-a7fd-0bf24d32e9a9')
   OR (idempotency_key LIKE 'rl:voucher:%' AND occurred_on = DATE '2026-11-09');
```
  Expected: one TRIAL row and one COURSE row (`… · 1 HR`), each with the trial / 1 HR list price less any discount, `occurred_on` 2026-11-09 (Bangkok); plus 2 VOUCHER rows (`5 Hr`). The cancels must not have removed them.

## Test data created (sid, note "QA TEST-148")
- **Vouchers** V1 `32881b3d` and V2 `f73a2cb7` (5 h each) on QA child `c1743305`: both **ENDED** (ADMIN_ERROR). V2 holds 5 attended hours (today: 3 at 00:00, 1 at 01:30, 1 at 02:30, QA coaches).
- **Bookings:** 13 on the vouchers, now 5 ATTENDED + 8 CANCELLED (the อื่นๆ row included); 2 OTHER rows on coach `7c9bbc14` (ECA, FREE), cancelled; 2 C1 rows (trial, 1 HR), confirmed then cancelled.
- **Left on sid's books, not read by me:** the 2 voucher sales, the attended hours, and the revenue lines C1 wrote (they're the evidence for (3)).
**uat:** not touched.

## Evidence (`tests/evidence/`, git-ignored)
- `test148-checkin-empty-voucher-th.png` — the parent's page on the empty voucher: Thai title + body + close hint, no button.
- `test148-checkin-empty-voucher-en.png` — the same in English.
- The step tables above are the scripts' own output, copied as printed.

## §(3) closed, 2026-11-09: ✅ TEST_PASSED (from Sector's DB read)
TRIAL 1,390 ฿ and COURSE (1 HR) 1,390 ฿ for my two confirmed bookings, VOUCHER 6,000 ฿ for each of my 2 vouchers; all occurred 2026-11-09 and still present after the cancels. Details: TEST-149 §(5) and the end of TASK-864. **D-148-1 and O-148-1:** fixed, re-run in TEST-149 §(1).
