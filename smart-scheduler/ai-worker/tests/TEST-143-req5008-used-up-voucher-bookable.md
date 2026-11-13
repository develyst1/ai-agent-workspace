# TEST-143: REQ-5008, a used-up voucher can still be booked and checked in
**Status:** ✅ reproduced on sid (book + confirm + check in with 1 h left, used 7/5, no refusal, no warning) · ✅ uat read-only facts · customer draft v3 ✅ PASS (v2 superseded). Findings only.
**Source:** Porter's brief in `inbox/QA.md` · `requirements/REQ-5008-voucher-booking-not-locked-when-used-up.md`.

## Interim, 2026-11-08
**Findings only, no cause stated.** The check-in half runs at 14:31 Bangkok (the window opens 14:30); I'll append it.

## uat, READ-ONLY, 2026-11-08 (card check ✅; every non-GET aborted, only `POST /cdn-cgi/rum` was tried)
The child was matched in-page by her name (one student, `016832cd`); the name isn't printed or stored.
- **Her voucher:** one, `348c0822`, **10 h**. Today it reads **used 12 / 10, Remaining 0, EXHAUSTED**, expiry 2027-04-04, not ended. (Remaining is floored at 0, so the 2 h over don't show.)
- **Her voucher classes:** 4 visits, all Sundays. Each visit has **3 VOUCHER classes at the same hour, 1 h each, with 3 different coaches.**

| Date | Time | Classes | Status | Checked in by |
|---|---|---|---|---|
| 2026-09-27 | 11:00–12:00 | 3 (+1 single session) | all CANCELLED (ADMIN_ERROR; the single CUSTOMER_CANCELLED) | — |
| 2026-10-04 | 12:00–13:00 | 3 (+1 single session, CANCELLED ADMIN_ERROR) | ATTENDED ×3 | LINE ×3 |
| 2026-10-11 | 12:00–13:00 | 3 | ATTENDED ×3 | LINE ×3 |
| 2026-11-01 | 11:00–12:00 | 3 | ATTENDED ×3 | LINE ×3 |
| 2026-11-08 | 11:00–12:00 | 3 | ATTENDED ×3 | LINE ×3 |

- **What it adds up to:** 12 attended hours on a 10 h voucher. **Before today, 9 were used, so 1 h was left. Today's 3 classes were all checked in through LINE.** That matches her "เหลือแค่ 1 ครั้ง … จองได้ 3 คลาส … Check in ทั้ง 3 คลาส".
- **Not answerable from the API:** who made each booking (admin or parent) and when. The booking row carries no creator or created-at. Every row is `plannedAtCreation: false`, and none is part of a group.
- **Confirmed?** All 12 reached ATTENDED; the API doesn't keep the confirm step as a separate stamp.

**⚠️ To declare, a possible write on uat:** to read check-in channels I called `GET /bookings/:id/checkin` on her 15 voucher rows. Afterwards I read the code (`checkin.service.ts` `getCheckinQr`): **this GET issues a check-in token when the row has none.** All 15 returned a token whose window matches the class. A confirm issues one too, so they most likely all existed already, but I can't prove none was minted by my read. If one was, it's on a past class with its window already closed. No token was written to any file. I won't call that route on uat again.

## sid, the booking half (QA data, note "QA TEST-143")
QA child `c1743305` (no parent), QA coaches not on LINE, Private SURFSKATE, a new **5 h** voucher `151fe4ec`. All by the API the screens send, not by clicks.
1. **Booking draws no hours.** I booked 4 classes on later Sundays plus 3 at 15:00 today: **7 h booked on a 5 h voucher, all 201**. The voucher still read used 0 / 5, Remaining 5.
2. **Hours are drawn at attend.** 4 × 1 h today, 08:00–11:00, booked and attended (admin): used 1, 2, 3, **4 / 5, Remaining 1**. The 4 Sunday rows were cancelled (ADMIN_ERROR).
3. **With 1 h left:** 3 classes at 15:00 today with 3 different coaches, **each booked (201) and confirmed (200), none refused, no warning in the reply.** Remaining still reads 1.
4. **Next (14:31):** each one checked in through its token link (the one check-in act every path runs, LINE included), reading the voucher after each.

**Side note, not judged:** the voucher's expiry was set from its first booking (11-15 → 2027-02-15) and didn't move back when an earlier-dated class (today) was booked later.

**Limits:** the screens' own warnings weren't clicked through (the API only). The booking screen does show "N left" per voucher (`VoucherPanel.tsx`), counting attended hours only. LINE check-in itself can't be run on sid (QA children have no LINE parent); the token link is the same act.

**Test data created (sid, open until the check-in half):** voucher `151fe4ec` on QA child `c1743305`; 4 attended + 7 cancelled + 3 confirmed classes on it. The voucher sale may be on sid's books. I'll end the voucher after the check-in half and list what stays.

## Check-in half, 2026-11-08: ✅ symptom reproduced on sid
**sid, the check-in half (14:31 Bangkok, inside the 14:30–18:00 window):** the 3 classes booked with 1 h left were each checked in through their token link (the one check-in act every path runs; LINE included, by `checkin.service.ts`).
| Class | Reply | Row after | Voucher after |
|---|---|---|---|
| `7c964b3e` (coach 1) | **200** | ATTENDED, `checkin-qr` | used **5 / 5**, Remaining 0, EXHAUSTED |
| `b07e1eb0` (coach 2) | **200** | ATTENDED, `checkin-qr` | used **6 / 5**, Remaining 0, EXHAUSTED |
| `479930eb` (coach 3) | **200** | ATTENDED, `checkin-qr` | used **7 / 5**, Remaining 0, EXHAUSTED |
- **No refusal and no warning field.** The reply's keys are `already, booking, crmAwarded, remaining`; `remaining` is `{ used, total, unit: hours }`. The check-in page prints it as "{used}/{total} ชม." (`dictionaries.ts:4276`), so it would read **6/5** and **7/5**, with nothing else. I didn't render the page; that line is from the code.
- **The symptom is reproduced:** 1 h left → 3 booked + confirmed → 3 checked in, used 7 of 5, and the screens' Remaining reads 0 (clamped), not −2. Her uat case is the same shape (9 → 12 of 10).
- **Not run:** the LINE check-in itself (QA children have no LINE parent) and the day-end auto-attend.

**Test data created (sid), now closed:** QA voucher `151fe4ec` (5 h) on QA child `c1743305` (no parent), coaches not on LINE, note "QA TEST-143". **Ended** (whole-voucher cancel, ADMIN_ERROR): it reads ENDED, used 7 / 5. Left on it: 7 attended classes today (08:00–11:00 + 3 at 15:00) and the cancelled rows (the 4 later Sundays, the first 3 at 15:00). The voucher's sale and the attended hours may stay on sid's books; I didn't read those rows.
**uat:** nothing written by intent; the ⚠️ check-in-link GET is declared in the interim.

## Customer gate, 2026-11-08: the REQ-5008 reply to ขวัญ: 🔧 FAIL, 1 line
**Draft checked:** `COPY-DRAFT-khwan-req5008-voucher-used-up-2026-11-08.md`, md5 `76969818ae292637605d45bdf2868fc5` from "ขวัญครับ" to the end of the file (`3e734be332fdff79b019c35a427c83dc` without the last newline).
**Checked against:** REQ-5008 (her words), TEST-143 (uat read-only + the sid run, both halves), Silver's CHECK-REQ-5008.

**These hold:**
- **Line 8, "เป็นตามที่ขวัญแจ้ง":** reproduced on sid end to end, and her uat case matches.
- **Line 11:** before 8 Nov 1 h was left (9 of 10 used); 3 classes checked in that day, all through LINE; the voucher now reads used 12 of 10, 2 over. All her classes were 1 h each, so hours and "ครั้ง" agree here (Silver's class-length question).
- **Line 10's "ตอนเช็คอินก็ไม่ได้เตือน":** shown on sid today (above). **Its "ตอนจองยังไม่ได้กันชั่วโมงไว้":** shown on sid (7 h booked on 5 h with 0 used, none refused) and it's Silver's code reading. It describes what the system does, both seen and read; it doesn't say why anyone booked 3.
- **Line 13** promises no date. It is Silver's fix (1) and list (3).
- **Lines 15–17:** the one open ruling, to ขวัญ, A/B clean.
- **Rules:** formal, ครับ; "ขวัญ" without พี่; no internal words; no staff names; the only question is to ขวัญ.

**1 required replacement:**
1. **Line 10, "ตอนนี้ระบบหักชั่วโมงของ Voucher ตอนเช็คอินเท่านั้น".** "เท่านั้น" is wrong: an admin marking the class attended deducts the hour too (sid today: 4 admin attends took it from 0 to 4 of 5), and Silver reads the day-end auto-attend as deducting as well. Her admins could read "only at check-in" as "if we mark attendance ourselves, nothing is deducted".
   - **Replace** line 10 **with:** `ตอนนี้ระบบหักชั่วโมงของ Voucher ตอนเด็กเข้าเรียน (เช็คอิน หรือแอดมินกดว่ามาเรียน) ส่วนตอนจองยังไม่ได้กันชั่วโมงไว้ จึงจองเกินจำนวนที่เหลือได้ และตอนเช็คอินก็ไม่ได้เตือนครับ`

**For you to check, not mine to verify:** line 11 writes the child as "Eileen". The rule is "as she wrote it", and her spelling is on the owner's screenshot only; I can't see it.

**Optional:** after line 17, one line so she knows the ruling only matters for the old over-booked ones: `(เมื่อแก้แล้ว กรณีนี้จะเกิดได้เฉพาะ Voucher ที่จองเกินไว้ก่อนแก้ครับ)` — true by Silver's CHECK §2.

**This verdict rests on:** sid as run today and uat as read today. The LINE check-in itself and the day-end auto-attend weren't run; their deduction is from the code.

## Customer gate, re-check, 2026-11-08: the REQ-5008 reply v2: ✅ PASS
**Draft checked:** v2, md5 `30e7bd1f2d7c35e87f3331189f9b11ae` from "ขวัญครับ" to the end of the file (`2dad58e8e4041a99be5984e7c7cc4c1b` without the last newline). It matches your `30e7bd1f`.
- **In, word for word:** my line-10 replacement (the hour goes when the child attends: check-in or the admin's "attended"), and the optional line 18.
- **The rest is unchanged from v1** (lines 8, 11, 13, 15–17) and holds, as in my v1 check.
- **The child's spelling:** you checked it against the owner's screenshot; I take that as given.
- **Rules:** formal, ครับ; "ขวัญ" without พี่; no internal words; no staff names; the only question is to ขวัญ; no date.

**This PASS rests on:** TEST-143, sid as run today (book + confirm + check-in with 1 h left, admin attend deducting) and uat as read today. The LINE check-in itself and the day-end auto-attend weren't run; line 18 and the day-end part stand on Silver's CHECK.

## Customer gate, re-check, 2026-11-08: the REQ-5008 reply v3 (plain words): ✅ PASS
**Draft checked:** v3 (the plain-words rewrite), md5 `f03a6b5b17d564cda8383b4c876de57d` from "ขวัญครับ" to the end of the file (`6b0bb8383dd3963dd70974e7d2a620c8` without the last newline). It matches your `f03a6b5b`.
**Checked against:** TEST-143 (uat read-only + the sid run, both halves), Silver's CHECK-REQ-5008, REQ-5008 (her words), and my v1/v2 gates.

**These hold:**
- **Line 8:** reproduced on sid end to end; her uat case matches.
- **Line 10, the cause:** "ตอนจอง ระบบนับเฉพาะคลาสที่เรียนไปแล้ว ไม่ได้นับคลาสที่จองไว้แต่ยังไม่ได้เรียน". Seen on sid (7 h booked on a 5 h voucher with 0 used, none refused; with 1 h left, 3 more booked) and it's Silver's code reading. It no longer says "only at check-in", so my v1 correction holds. "ไม่ขึ้นเตือน" is true at booking and at check-in (sid: no warning in any reply).
- **Line 11:** 1 h left before 8 Nov; 3 classes attended that day; used 12 of 10, 2 over. "เรียนไป" is right (all 3 ATTENDED).
- **Lines 13–14:** Silver's fix (1), for every voucher, and the list (3). No date.
- **Lines 16–18:** the one ruling, to ขวัญ. Scoping it to the vouchers over-booked before the fix matches Silver's CHECK §2 (with the fix in, only those can reach check-in with nothing left), the same as v2's line 18.
- **Rules:** formal, ครับ; "ขวัญ" without พี่; no internal words; no staff names; the child's spelling as you checked it; the only question is to ขวัญ.

**Optional, your call:** line 10's "และไม่ขึ้นเตือน" sits after the booking clause, and her complaint was about check-in. If you want it unmistakable: `… จึงจองเกินจำนวนที่เหลือได้ และทั้งตอนจองและตอนเช็คอินก็ไม่ขึ้นเตือนครับ`. It's not wrong as it stands.

**This PASS rests on:** sid as run today and uat as read today. The LINE check-in itself and the day-end auto-attend weren't run; "only the old over-booked ones" (line 16) stands on Silver's CHECK.
