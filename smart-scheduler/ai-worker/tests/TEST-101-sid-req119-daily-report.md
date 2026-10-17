# TEST-101 — REQ-119 Daily Report on sid (back `bb39509` · front `89774a9`)

**Tester:** Tanya (QA) · **Date:** 2026-10-13 · **Env:** sid, admin, headless · **Brief:** `inbox/QA.md` → "⏸️ WAIT … REQ-119" + "▶️ GO: REQ-119 Daily Report is on sid"
**Verdict: ✅ PASS by value.** On 5 sid days, `GET /reports/daily` equals my own independent recount from `/bookings`, field by field. That holds for All teachers and for each of the 29 coaches through `?teacherId=`, so 150 reports were compared. The screen shows the same numbers. Every REQ-119 / Palm §2–§4 rule holds. **Read-only:** GETs and screen reads only, no writes.

## Build identity (sid)
- **Back:** `/reports/daily` now returns Palm §5's fields: `confirmed · awaiting · attendanceRate · byBookingTypeAttended · byBookingTypeConfirmed · byTeacher`. It also keeps `noShow` and `byBookingType`. It accepts `teacherId`.
- **Front:** on every date or coach change the page makes **one** request, `/reports/daily?date=…[&teacherId=…]`, with no `/calendar` and no `/bookings` calls. So it has switched to the back's numbers (Palm §6). The page shows 7 cards (Total booked · Attended · Confirmed · Pending · Awaiting · On leave · Cancelled), the two "By booking type" rows, and the "Sessions per teacher (workload)" tiles.

## How I checked
I wrote my own recount from the raw rows of `/bookings?from=D&to=D`, following Palm §2–§4 and TASK-737 to the letter:
- **Lesson rows:** the 4 lesson types, `!pendingSlot`, `!groupId`.
- **The cards:** confirmed = CONFIRMED + ATTENDED + NO_SHOW · pending = PENDING + EXTENDED · awaiting = PAUSED FIRST_TRIAL/SINGLE_SESSION · Total booked = not CANCELLED and not PAUSED.
- **Which coach a row belongs to:** the primary coach **or** any coach in `teachers[]`.
- **byTeacher:** +1 `total` for every coach of each row that is not cancelled and not paused; seats are never counted.

I compared the recount with the API field by field, including the full `byTeacher` array and its order. Raw data: `api-vs-recount.json`.

| Day | Mix | API (All teachers) | Recount | All 29 `?teacherId=` | Relations | Screen |
|---|---|---|---|---|---|---|
| **28 Sep** | NO_SHOW 1, leave 2, pending 1, cancelled 15, 3 GROUP (4 seats), 3 ECA with 3 coaches, 15 camp hours | TB 9 · Att 5 · Conf 6 · Pend 1 · Await 0 · Leave 2 · Canc 15 · 56% | ✅ identical | ✅ 15 non-empty, all identical | ✅ | ✅ same |
| **5 Oct** | leave 3, pending 1, cancelled 16, 3 GROUP, ECA with 3 coaches + an ECA SICK_LEAVE with 4 coaches, 15 camp hours | 17 · 12 · 13 · 1 · 0 · 3 · 16 · 71% | ✅ | ✅ 16 non-empty | ✅ | ✅ |
| **12 Oct** | leave 5, pending 1, cancelled 11, 3 GROUP, ECA with 2 coaches (Bank + Lewis) + ECA with 4 coaches, 10 camp hours | 18 · 10 · 12 · 1 · 0 · 5 · 11 · 56% | ✅ | ✅ 11 non-empty | ✅ | ✅ |
| **10 Sep** | PAUSED FIRST_TRIAL 1, leave 3, pending 1, cancelled 4, ECA with 4 coaches, all 4 lesson types | 12 · 8 · 8 · 1 · **1** · 3 · 4 · 67% | ✅ | ✅ 7 non-empty | ✅ | ✅ |
| **23 Oct** | PAUSED SINGLE_SESSION 2, EXTENDED 2, leave 3, cancelled 2 (no class yet: future) | 13 · 0 · 8 · **2** · **2** · 3 · 2 · 0% | ✅ | ✅ 8 non-empty | ✅ | ✅ |

## The brief's rules, by value

| Rule | Evidence | |
|---|---|---|
| attended ≤ confirmed | holds on all 150 reports (5 days × All teachers + 29 coaches) | ✅ |
| leave is not in confirmed | 28 Sep: Conf 6 = 5 ATTENDED + 1 NO_SHOW; the 2 SICK_LEAVE are only in On leave | ✅ |
| cancelled is not in Total booked | 28 Sep: TB 9 = Conf 6 + Leave 2 + Pend 1; Canc 15 sits outside it | ✅ |
| each booking-type row sums to its card | Σ Attended row = attended and Σ Confirmed row = confirmed on all 150 reports; 4 types always present, order FIRST_TRIAL · SINGLE_SESSION · COURSE_PACKAGE · VOUCHER, zeros kept (10 Sep: 1/2/3/2) | ✅ |
| teacherId filters EVERY card | for each of the 29 coaches on each day, all 7 cards, both rows and byTeacher equal the recount for that coach alone; no coach's cards equal the All-teacher cards. **Screen:** qatt75b on 12 Oct ⇒ `12 · 6 · 8 · 0 · 0 · 4 · 0`, 50%, = the API; the workload tiles are hidden (Palm §1.1) (`daily-2026-10-12-qatt75b.png`) | ✅ |
| an ECA with 2 coaches counts for both | 12 Oct "STA / Onewheel + Surfskate" [Bank, Lewis] ATTENDED ⇒ both have total 2; the 3- and 4-coach ECAs add 1 to every coach (28 Sep: Print, Toth, New) | ✅ |
| a group counts once | 28 Sep "Balance Play Monday" (coach Camp, **2 seats**) ⇒ Camp `0/0 · Total 1`. Across sid, **22 cancelled seats** on 15/22/28/29 Oct and 6 Oct: 15 Oct API cancelled **1** = the one cancelled lesson (6 cancelled seats not added); 22 Oct 6 = 6 | ✅ |
| Awaiting uses the class's own date | the PAUSED class of 9 Sep (Bank) ⇒ awaiting 1 on 9 Sep and **0 for Bank on 10 Sep**; the same for 10 Sep → 11 Sep and 23 Oct → 24 Oct; PAUSED is never in Total booked | ✅ |
| integers only; no NaN or undefined on screen | all fields are integers; screen text clean on all 6 views | ✅ |

## Expected differences from the OLD screen (the front fallback: `/calendar` day + `includeCancelled`)
I compared the old screen's source rows with the back's rows on each day:
1. **A leave whose slot was re-booked now shows.** sid has 7 such pairs. Example: 13 Oct 15:00 Bank, the leave "มิลล่า" plus CONFIRMED "Alex & Brand". `/calendar` returns only the replacement, while the back counts both: Bank onLeave 1, confirmed 2. The same holds on 6 Oct 13:00 and 21 Oct 17:00. ✅ as briefed.
2. **Cancelled group seats no longer count.** On 15 Oct and 22 Oct, `/calendar` returned 8 seat rows each (6 CANCELLED, 1 PENDING, 1 CONFIRMED). The old screen counted them as COURSE lessons; the back counts none of them. ✅ as briefed.
3. 🟡 **NEW, not in the brief: lessons outside 09:00–17:00 now count.** `/calendar` on sid returns `timeSlots` 09:00–17:00 only, so lesson rows at **08:00 and 18:00–21:00** never reached the old screen. The back counts them because it reads every booking of the date. All 7 such rows on my days are the QA family's (QAChatTwo with qatt75/qatt75b):
   - 28 Sep: 20:00 ATTENDED, +1 on the old screen's count;
   - 5 Oct: 20:00 SICK_LEAVE, +1;
   - 12 Oct: 08:00 ATTENDED, 19:00 and 21:00 CONFIRMED, +3;
   - 10 Sep: 18:00 ATTENDED, +1;
   - 23 Oct: none.

   **The back is the correct one here**, since every booking of the day should count. I'm reporting it so that nobody reads a jump in the numbers as a fault. Real families' rows outside 09:00–17:00 would move the numbers the same way.

## 🔒 Total booked includes Pending (Palm's default, held for the owner's ruling)
The day's Pending count, and what the Excel rule (Confirmed + On leave) would give instead:

| Day | Total booked now | Pending + Extended | Excel rule | % now → Excel |
|---|---|---|---|---|
| 28 Sep | 9 | 1 | 8 | 56% → 63% |
| 5 Oct | 17 | 1 | 16 | 71% → 75% |
| 12 Oct | 18 | 1 | 17 | 56% → 59% |
| 10 Sep | 12 | 1 | 11 | 67% → 73% |
| 23 Oct | 13 | 2 (both EXTENDED) | 11 | 0% → 0% |

## Notes (facts, not faults)
- **Camp hours in the workload:** camp hour rows add 1 each to `total` (Palm Q3: one row per hour). For example, 28 Sep: Print 7, Kid 6, Mu 5.
- **An ECA row on SICK_LEAVE** (5 Oct "ABC / Balance Camp", 4 coaches) still adds to each coach's `total`. This is Palm's temporary Q6 answer ("every row not cancelled").
- **A NO_SHOW counts as Confirmed** (Palm Q1): 28 Sep qatt75b `0/1`.

Evidence: `project-docs/qa-2026-10-13/test101/`:
- `daily-<date>-all.png` ×5;
- `daily-2026-10-12-qatt75b.png`;
- `api-vs-recount.json`.

Scripts (scratchpad): `r119scan.js` · `r119.js` · `r119b.js` · `r119e.js` · `r119f.js`.

---
# §738 — Total booked = Confirmed + On leave (TASK-738, Khwan's A), sid back `be2b34f` · 2026-10-13
**Verdict: ✅ PASS by value.** I re-ran the same 5 days with the same recount, with one change: Total booked = CONFIRMED + ATTENDED + NO_SHOW + SICK_LEAVE. The API equals the recount for All teachers and for each of the 29 coaches, so 150 reports were compared. The relations still hold (attended ≤ confirmed, each type row sums to its card). The screen equals the API. Read-only.

| Day | Total booked (expected → API) | % | Pending (now outside TB) | Other cards |
|---|---|---|---|---|
| 28 Sep | **8** → 8 ✅ (was 9) | 56 → **63** ✅ | 1 | unchanged |
| 5 Oct | **16** → 16 ✅ (was 17) | 71 → **75** | 1 | unchanged |
| 12 Oct | **17** → 17 ✅ (was 18) | 56 → **59** | 1 | unchanged |
| 10 Sep | **11** → 11 ✅ (was 12) | 67 → **73** | 1 | unchanged |
| 23 Oct | **11** → 11 ✅ (was 13) | 0 → 0 | 2 (EXTENDED) | unchanged |

- **Nothing else moved.** I diffed the full payload against the TEST-101 run. For All teachers, only `totalBooked` and `attendanceRate` changed. Per coach, only Total booked changed, and only for coaches whose pending or extended class left it:
  - Lewis 1→0 (28 Sep, 5 Oct, 12 Oct);
  - Haris 2→1 (10 Sep);
  - Ek 4→3 and Kid 1→0 (23 Oct).

  The `byTeacher` workload (`attended/count/total`), both type rows, Awaiting, Pending, On leave and Cancelled are all byte-identical.
- **Screen:**
  - 28 Sep shows `63% · 5/8 · Total booked 8 · Attended 5 · Confirmed 6 · Pending 1 · Awaiting 0 · On leave 2 · Cancelled 15`;
  - 23 Oct shows `0% · 0/11 · 11`.

  No NaN or undefined. One `/reports/daily` request per change.
- Evidence: `project-docs/qa-2026-10-13/test101-738/` (`daily-2026-09-28-all-738.png`, `daily-2026-10-23-all-738.png`).
- 📌 The customer screenshot `customer-2026-10-13-daily-report/total-booked-28sep.png` was taken **before** 738, so it shows 9 / 56%. Retake it if it is reused.

---
# §uat — the Daily Report on uat (back `be2b34f` · front `89774a9`), READ-ONLY · 2026-10-13
**Verdict: ✅ PASS by value.**
- 🚫 **Zero app writes.** After login, every non-GET was aborted in the browser. Only 2 were attempted, and both were Cloudflare's beacon (`POST /cdn-cgi/rum`), not the app. GET-only `api()` helper.
- Nothing pressed. Screenshots are cropped above the workload tiles, so they show counts only and no names.

**Build identity:**
- **Back:** `/reports/daily` returns the new contract (`confirmed · awaiting · byBookingTypeAttended/Confirmed · byTeacher`), and Total booked = Confirmed + On leave (738).
- **Front:** the page makes only `/reports/daily` calls (9 calls, no `/calendar` or `/bookings`) and shows the 7 cards and the workload tiles.

**Days:**
- **4 Oct:** 145 rows, with leave, a pending class and cancellations.
- **11 Oct:** 130 rows.
- **12 Oct:** 95 rows, with 16 camp hours and ECA.

**How I checked:** the same independent recount as above, from `/bookings` GETs, for All teachers and for each of the 25 uat coaches: **78 reports**, every one identical to the API.

| Day | API = recount = screen | TB = Conf + Leave | attended ≤ confirmed · Σ type rows | `?teacherId=` ×25 |
|---|---|---|---|---|
| 4 Oct | `92% · 98/107` · TB **107** · Att 98 · Conf 98 · Pend 1 · Await 0 · Leave 9 · Canc 32 | 98 + 9 = 107 ✅ (the 1 Pending is outside) | ✅ | ✅ 22 non-empty, all identical |
| 11 Oct | `82% · 89/109` · TB **109** · 89 · 89 · 0 · 0 · 20 · 20 | 89 + 20 = 109 ✅ | ✅ | ✅ 22 |
| 12 Oct | `87% · 27/31` · TB **31** · 27 · 27 · 0 · 0 · 4 · 25 | 27 + 4 = 31 ✅ | ✅ | ✅ 14 |

- **Screen:** the 7 cards and both type rows equal the API on all 3 days. No NaN or undefined.
- **Coach filter on screen:** Gof on 4 Oct shows `71% · 5/7 · TB 7 · Att 5 · Conf 5 · Pend 0 · Await 0 · Leave 2 · Canc 1`, equal to `?teacherId=`. The workload tiles are hidden.
- **byTeacher:** equal to the recount, including order, on all 3 days. No coach's cards equal the All-teacher cards.
- **uat data shape (fact):** the 3 days have no GROUP rows, no ECA with several coaches and no PAUSED class. Those rules were proven on sid (above); uat agrees wherever its data reaches.
- Evidence: `project-docs/qa-2026-10-13/test101-uat/` (`daily-2026-10-04-all.png`, `daily-2026-10-11-all.png`, `daily-2026-10-12-all.png`, `daily-2026-10-04-gof.png`; counts only).
