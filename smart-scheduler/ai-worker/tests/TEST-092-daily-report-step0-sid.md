# TEST-092 — STEP 0: Daily report camp over-count, reproduced on sid with the CURRENT build (no fix)

**Tester:** Tanya (QA) · **Date:** 2026-10-11 · **Env:** sid, admin, headless · front `2db1c57` · back `a2185b2`
**Brief:** `inbox/QA.md` → "▶️ STEP 0 (reproduce-first): the DAILY REPORT's camp over-count" · **Recipe:** `SIZING-NEXT-ROUND-teamB-2026-10-04.md` → ADDENDUM 2026-10-11
**Verdict: ✅ REPRODUCED on both dates.** On screen, **Attended = private lessons attended + camp COACH-HOURS**; the camp **children are not counted at all**. On 27 Sep the excess equals the coach-hour rows exactly. The fallback recipe was not needed.
Read-only: I only opened the report screen and made GETs. No writes.

## How the counts were made
- **Screen:** Reports → Daily report, "All teachers", date picked in the date box. Screenshots below.
- **Behind it (GET):** every booking of the day (`/bookings`), ATTENDED rows split into lessons and **camp coach-hour rows** (`OTHER` with a camp link); camp **children** from `/camp/weeks/:id/days` (entries ATTENDED that day).
- **True count (Silver's rule)** = lessons attended + camp children who came.

## 27 Sep 2026 — camp day `QA-Camp-075` (`578f1526`), qatt75 10:00–15:00, child campkid2 **ABSENT**

| | Screen | Made of |
|---|---|---|
| Total booked | 11 | |
| **Attended** | **9** | **4 lessons + 5 camp coach-hours** (qatt75 10, 11, 12, 13, 14 h, all ATTENDED by the day-end) |
| True count | **4** | 4 lessons + **0** children (campkid2 was absent) |
| **Over-count** | **+5** | **= exactly the 5 coach-hour rows** ✅ |

Workload line on screen: "qatt75 · 5 sessions · 5 attended", the camp hours shown as a coach's sessions.

## 30 Sep 2026 — three camp weeks on the day (`QA-Camp-076` `1395d26a` + the two "28-2 Oct" weeks)

| | Screen | Made of |
|---|---|---|
| Total booked | 22 | |
| **Attended** | **15** | **3 lessons + 12 camp coach-hours**: qatt75 5 (QA-Camp-076), Kwan 5 ("28-2 Oct" `d31a0e93`), Mu 2 ("28 - 2 Oct" `029920d0`, 10:00–12:00) |
| True count | **10** | 3 lessons + **7 children who came** (temp; Davyn, Dc, Chateau, Deft, Aran; Alex) |
| **Over-count** | **+5** | 12 coach-hours counted, 7 children not counted ⇒ 15 vs 10 ✅ |

Attended is again exactly lessons + coach-hours (3 + 12 = 15); not one of the 7 children is in it. This is the same shape as Khwan's 17 = 9 + 8.

## Also seen (facts for the SA, not rulings)
1. **"By booking type" has no row for camp, Other or Group**: it shows 1ST TRIAL / 1 HR / COURSE / VOUCHER only (27 Sep: 0/0/4/0; 30 Sep: 0/0/10/0). The 12 camp hours appear in Attended but in no type row. This matches Silver's "4 rows, 6 types".
2. **The screen and the back function disagree on 27 Sep.** `/reports/daily` (the function the end-of-day LINE report and the SOM dashboard read, per Silver) returns **totalBooked 14 · attended 11**; the screen shows **11 · 9**. Both include the 5 coach-hours. The difference is rows the screen's `/calendar` count leaves out: a GROUP row (Bank 17:00, ATTENDED) and the leave rows. On 30 Sep the back says 24 · 15, the screen 22 · 15.
3. Silver's make-up caveat: **no make-up rows on either date**, so like is compared with like.

## End-of-day LINE report and SOM dashboard
- **End-of-day LINE report: ⚪ not readable by me.** It goes to the admins' LINE, not the QA phone. Its source, `/reports/daily`, says **attended 11 (27 Sep) and 15 (30 Sep)**, coach-hours included in both. That is what it would have reported, if it reads that function as Silver says.
- **SOM dashboard: ⚪ cannot be read for a past date.** `/reports/som` takes no date (it is "today / this month"), so it can't be pointed at 27 or 30 Sep.

## Evidence — `project-docs/qa-2026-10-11/test092/`
`daily-report-2026-09-27.png` · `daily-report-2026-09-30.png`
