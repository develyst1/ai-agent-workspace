# TEST-109 — REQ-124 on sid: Palm's SOM dashboard (`/reports/som` + the New-vs-Renewing lists) + Daily Report "Others Program" (`kidsByProgram`)

**Tester:** Tanya (QA) · **Date:** 2026-10-19 (sid "today" = 2026-10-18 Bangkok) · **Env:** sid, admin, headless, **read only** · **Brief:** `inbox/QA.md` → "⏸️ … REQ-124 (TEST-109)" + "▶️ GO TEST-109" · sources: REQ-124, `CHECK-REQ-124-…`, TASK-741/742/743, Palm's `docs/backend-som-dashboard.md` + `backend-daily-report.md` §10 (front `e314303`).
**Verdict:**
- **API: ✅ by value, with 3 notes.** My independent recount from the raw API equals the new fields on every section for October, except one card. Purchase-date items can't be fully proved for September (see N1).
- **Screen: ⛔ not testable:** sid's front is **not** Palm's `e314303` (F1).

## Build identity
- **Back `4762aa7`:** ✅. `/reports/som` now carries `today.confirmed/attendanceRate`, the new `existingCustomers.*`, the 6 new `newVsRenewing` fields, `coachCapacity`, `activityProgram` and `demographics.district`, **merged over the old fields**. `/reports/som/new-vs-renewing/:bucket` answers. `/reports/daily` carries `kidsByProgram`.
- **Front:** 🔴 the JS that `/scheduler/som`, `/scheduler/reports` and `/scheduler/calendar` load has **REQ-123's markers** ("Record teacher leave", `rangeTooLong`, i.e. `90a11da`) but **none of `e314303`'s**: no `kidsByProgram`, `coachCapacity`, `activityProgram`, `new-vs-renewing`, `newCoursePrevMonth`, `fillSomPreview`, `SAMPLE_PROGRAMS`, "Others Program".
  - The SOM page on sid is the **old** one: "New (registered) 24 · Renewing 0 · Expected 8 · Activity share", with no Coach Capacity and no 6 cards (`som-page-oct.png`).
  - The Daily Report has **no "Others Program" section**.
  - **⇒ Palm's front needs deploying on sid** before "screen = API" can be checked.

## How I recounted
From **raw API data only**:
- `/bookings` (May 2026 → Mar 2027, 2,250 rows) · `/courses` (252) + each course's `/history` · `/vouchers` (29) · `/students` (184) · `/parents` · `/teachers` · `/teacher-leave-days` · `/camp/weeks/*/days`.

I applied the **as-built rules stated in TASK-741/742/743** (Palm's contract plus the declared defaults), not the back's code.
- **One gap:** the API exposes **no purchase date** for a course or voucher (`created_at`). For courses I used **the earliest event in the course's history** as the purchase day. Vouchers can't be recounted on purchase date at all. See N1.

## October 2026 (current month ⇒ "as of today")
| Section | Check | API | Mine | |
|---|---|---|---|---|
| **Today** (18 Oct) | lessons, Confirmed = CONFIRMED+ATTENDED+NO_SHOW (REQ-119 counters) | confirmed 3 · attended 0 · rate 0 | 3 · 0 · 0 | ✅ |
| **Existing** | `activeCourse` (people, course ACTIVE now) | 40 | 40 | ✅ |
| | `activeVoucher` (people) | 13 | 13 | ✅ |
| | `recentFirstTrial` (Aug–Oct, not cancelled, moves out on a course bought on/after the trial) | **6** | **4** | ✖ N1 |
| | `recentSingleSession` | 25 | 25 | ✅ |
| | `totalCustomers` (course + voucher holders + Oct trials + Oct 1 HR) | 52 | 52 | ✅ |
| | `recentFrom / recentTo` | 2026-08 / 2026-10 | same | ✅ |
| **New vs Renewing** | every list: **`rows.length` = the card** (6/6) | 1 · 9 · 3 · 5 · 1 · 12 | — | ✅ |
| | `firstTrial` · `trialNotConverted` (people) | 1 · 1 (Meimei) | 1 · 1 | ✅ |
| | `newCourseThisMonth` / `newCoursePrevMonth`, **row by row** (student + date) | 9 / 3 | 9 / 3, same rows | ✅ |
| | `renewCourse`, course rows, row by row | 5 | 5, same rows (voucher rows: 0) | ✅ |
| | `notRenewed`, course rows, row by row | 5 (+7 voucher rows) | 5 | ✅ |
| **Coach Capacity** | `byPerson` for 28 coaches: booked (lessons + the GROUP row, no seats/ECA/camp, not CANCELLED, + extra coaches) and available (`workDays` − leave × 9), weekday/weekend, % | 28 rows | **0 mismatches** | ✅ |
| | `byType` = sums of `byPerson`, % from the sums; order FT → PT → FL | FT 12 · PT 5 · FL 11 | same | ✅ |
| **Demographics** | students who attended in Oct | 37 | 37 | ✅ |
| | **9 new age bands** + unknown, in order | 2·3·15·5·4·2·0·0·0 · unknown 6 | same | ✅ |
| | **District** (parent `districtCode`) | known **0** of 37 | 0 of 37 | ✅ "mostly unknown" as expected |
| **Activity / Program** | ATTENDED lesson rows (group seats included) by subject × type, 11 non-zero categories | — | identical | ✅ |
| | `typeTotal = course+voucher+1HR`, `total = typeTotal+firstTrial`, all 21 subjects sent, sorted by total | — | — | ✅ |

**The live bugs, fixed in the NEW fields (by value):**

| Field | Old field | New field | Mine |
|---|---|---|---|
| Renew | `renewing` **0** | `renewCourse` **5** | 5 |
| Active Course | `byCourse` 60 | `activeCourse` **40** (ended/paused excluded) | 40 |
| Trials, CANCELLED excluded | `byRecentTrial` 21 (any status) | `recentFirstTrial` 6 | see N1 |
| Today | `expected` 8 | `today.confirmed` **3** | 3 |

## September 2026 (a past month) and a badge filter
- **Sep, everything that doesn't depend on a purchase date: ✅.**
  - 1 HR 20;
  - `firstTrial` 10;
  - all 6 lists `rows = card`;
  - coach capacity 28/28 and byType;
  - age bands (38 students);
  - district 0/38;
  - Activity/Program;
  - `notRenewed` course rows 16 = 16.
- **Sep, purchase-date items: small differences** (N1):

  | Item | API | Mine |
  |---|---|---|
  | `recentFirstTrial` | 5 | 4 |
  | `trialNotConverted` | 4 | 2 |
  | `newCourseThisMonth` | 34 | 35 |
  | `newCoursePrevMonth` | 4 | 6 |
  | `renewCourse` | 18 | 15 |

  Several are the same student one or two days apart (เหมียว 08/09 vs 09/09, asda 09/09 vs 11/09).
- `activeCourse` / `activeVoucher` for a past month are **not recounted**: the as-of rebuild needs the per-day "used" and expiry history.
- **Badge filter** `badgeValueIds=97ccdb39…` (the real "สาขา" value; **no sid booking carries any badge** in Sep–Oct): **26/26 ✅**. Every count is 0, every list is empty, and coach **available** hours are unchanged while booked hours drop to 0 (Q0.2 default).

## Daily Report — `kidsByProgram` (D1: ECA once per class)
| Day | GROUP (seats live/delivered) | ECA | CAMP | OTHER | `?teacherId=` extra coach |
|---|---|---|---|---|---|
| 12 Oct | ✅ Balance Play 2 · Balance Play Monday 2 · ครามพราว Inline Skate **null** | ✅ ABC 9 · STA 8 = 17 | ✖ F2: API `12-16 Oct 2` · mine + `Camp 12-13 Oct 3` | ✅ null | ✅ Lewis sees STA 8 |
| 5 Oct | ✅ 2 · 1 · null | ✅ 4 classes = 32 | ✅ OCT 5-9 3 (a week with 0 kids is left out) | ✅ อบเชย Inline Skate null | ✅ Toth sees his 3 |
| 28 Sep | ✅ | ✅ 32 | ✅ `28-2 Oct` 5 · `28 - 2 Oct` 3 (two weeks kept apart) | ✅ | ✅ |
| 19 Oct | ✅ | ✅ 40 | ✖ F2: API null · mine `Camp 19 - 23 Oct` 2 | ✅ | ✅ |

- **Order** `GROUP, ECA, CAMP, OTHER` always ✅.
- An empty program comes as `{total:null, items:[]}` ✅.
- A missing head count is `null` ✅.
- **D1 (once per class):** on these days every ECA class is **one row**, so once-per-class = Palm's per-row sum. The 2-hour case isn't present in sid's data, so D1's difference is **not observable here**.

## Palm's screen: which fields it reads (from his code at `e314303`; nothing to see live, F1)
| Card | Reads | Old or new |
|---|---|---|
| Today · Confirmed / Attendance % | `today.expected` (and computes the % from it) | **old**, still the M3 count |
| Today · Attended | `today.attended` | same name |
| Existing · Active Course / Active Voucher / Trial (3 m) / Total | `byCourse` · `byVoucher` · `byRecentTrial` · `total` · `recentTrialSince` | **old** (M2/M4 values) |
| Existing · 1 HR | `recentSingleSession` | new |
| NvR · 1st Trial | `newByFirstTrial` | **old** |
| NvR · **Renew Course** | **`renewing`** | **old: always 0 (M1)**. On his screen the card would read **0** while its modal lists **5** rows (Oct). |
| NvR · New this/prev month · Trial no course · Not renewed | the new fields | new |
| Coach Capacity · Demographics (incl. district, new ages) · Activity/Program | `coachCapacity` · `demographics.*` · `activityProgram` | new |
| Daily · Others Program | `kidsByProgram` | new |

**Per the brief, the switch to the new fields is Palm's**, not our defect. It goes into the Palm note. The M1–M4 fixes reach his screen only once he switches.

## Findings
| # | Sev | What |
|---|---|---|
| F1 | 🔴 (deploy) | **sid's front is not `e314303`.** Palm's SOM screen and the "Others Program" section are absent, so "screen = API" is untestable. The owner needs to deploy the merged front on sid. |
| F2 | 🟡 | **CAMP leaves out camp weeks that have children but no coach assigned that day.** 12 Oct "Camp 12-13 Oct" (CLOSED, **3 kids** ATTENDED, 0 coaches) and 19 Oct "Camp 19 - 23 Oct" (CLOSED, **2 kids** PLANNED, 0 coaches) are missing. Weeks with coaches are counted (12-16 Oct, OCT 5-9). By value only; the SA to say whether "no coach ⇒ not counted" is intended. |
| N1 | 🟠 | **Purchase-date items can't be fully proved from the API.** `created_at` isn't exposed, and my substitute (the first history event) can be later than the real purchase. Oct: all lists match row by row, but **`recentFirstTrial` 6 vs 4**. The API still counts **Aileen** (trial 25 Sep; a DUO course with Jayleen, first history event 2 Oct, start 17 Oct) and **ส้ม** (trial 9 Sep; courses first seen 11 Sep, 23 Sep, 5 Oct). By my data both bought on/after the trial and should have moved out. Sep has 2–3 rows off on each purchase-date card. **DATA REQUEST (bare SQL, owner) to settle it:** see below. |
| N2 | ⚪ | **Facts for the Palm note / the owner (as built, per TASK-742):** (a) a course bought while the student still has an **active** course is neither New nor Renew, so it counts in **no** card (e.g. QA kids with overlapping courses); (b) **`CANCELLED` counts as "ended"** for Renew, so a student whose only earlier course was cancelled is "Renew" on the next purchase. |

**SQL for N1** (read only; the owner runs it on sid):
```
SELECT s.name, c.id, (c.created_at AT TIME ZONE 'Asia/Bangkok')::date AS bought_bkk, c.start_date, c.ended_at
FROM course_packages c JOIN students s ON s.id IN (c.student_id, c.co_student_id)
WHERE s.name IN ('Aileen','ส้ม','เหมียว','asda','ดิววี่','temp','Jayleen','Gabriel','Aiwa','Anya')
ORDER BY s.name, c.created_at;
```

Evidence: `project-docs/qa-2026-10-19/test109/` (`som-page-oct.png` = the old page on sid · `daily-12oct-others-program.png`).
Scripts (scratchpad): `t109a` (shapes), `t109d` (recount, `node t109d.js <month> [badge]`), `t109g` (kidsByProgram), `t109h` (camp weeks), `t109i/j` (screen + front markers).


---
# §re-check — back `82a1988` + front `e314303` on sid · 2026-10-19
**Verdict: ✅ F2 and N1 fixed. The screen = the API on every card that reads the new fields.** The cards still on old fields are Palm's to switch (note only). Read only.

**Build identity:** sid's JS now has every `e314303` marker (`kidsByProgram`, `coachCapacity`, `activityProgram`, `new-vs-renewing`, `newCoursePrevMonth`, `fillSomPreview`, "Others Program"). Palm's SOM page and the Others Program section render.

## N1: `recentFirstTrial` / "no course" now exclude children holding ANY course bought by the month end
| | API | Mine (same rule) | |
|---|---|---|---|
| Oct `recentFirstTrial` | **4** (was 6; Aileen and ส้ม out) | 4 | ✅ |
| Oct `trialNotConverted` | 1 | 1 | ✅ |
| Sep `recentFirstTrial` | 3 | 3 | ✅ |
| Sep `trialNotConverted` | 2 | 2 | ✅ |

- **October as a whole: 26/26 checks match** (all sections).
- **September:** everything matches except three course-purchase rows. `newCourseThisMonth` is 34 vs 35, `newCoursePrevMonth` 4 vs 6 and `renewCourse` 18 vs 15, the same few students a day or two apart. This is the purchase-date limit (the API has no `created_at`; my substitute is the first history event), not the fixed rule. The SQL in N1 above would settle it if wanted.

## F2: CAMP counts a coach-less camp week's kids that day
| Day | API now | Mine | |
|---|---|---|---|
| 12 Oct | **Camp 12-13 Oct 3** · 12-16 Oct 2 = **5** | 5 | ✅ (was 2) |
| 19 Oct | **Camp 19 - 23 Oct 2** | 2 | ✅ (was null) |
| 28 Sep | 28-2 Oct 5 · 28 - 2 Oct 3 = 8 | 8 | ✅ |
| 5 Oct | OCT 5-9 3 (a week with 0 kids, "QA-E-percoach", is left out) | 3 | ✅ |
| `?teacherId` | 12 Oct: Kowjoe (a coach of "12-16 Oct") → CAMP **12-16 Oct 2 only**; QADT3 (no camp) → `{CAMP, total null, items []}` | as expected | ✅ |

GROUP / ECA / OTHER on the same 4 days still match (unchanged).

## The SCREEN: Palm's SOM page (Oct) vs `/reports/som`, card by card (`recheck-som-page-oct.png`)
| Section / card | Screen | API new field | API old field | |
|---|---|---|---|---|
| Today · Confirmed | **8** | `confirmed` 3 | `expected` **8** | old field (Palm's switch) |
| Today · Attended / Attendance | 0 / 0% (% from `expected`) | `attended` 0 · `attendanceRate` 0 | — | ✅ value (rate formula old) |
| Existing · Active course | **60** | `activeCourse` 40 | `byCourse` **60** | old (Palm) |
| Existing · Active voucher | 13 | `activeVoucher` 13 | `byVoucher` 13 | old field, same value |
| Existing · 1st Trial (3 months) | **21** | `recentFirstTrial` 4 | `byRecentTrial` **21** | old (Palm) |
| Existing · 1 HR (3 months) | 25 | `recentSingleSession` 25 | — | ✅ |
| Existing · Total customers | **73** | `totalCustomers` 52 | `total` **73** | old (Palm) |
| Existing · window line | "since 20 Jul 2026" | `recentFrom` 2026-08 | `recentTrialSince` 2026-07-20 | old (Palm) |
| NvR · 1st Trial | 1 | `firstTrial` 1 | `newByFirstTrial` 1 | old field, same value |
| NvR · New Course this / previous month | 9 / 3 | 9 / 3 | — | ✅ |
| NvR · **Renew Course** | **0** | `renewCourse` **5** | `renewing` 0 | 🟠 old (Palm): **the card says 0 and its modal lists 5 rows** |
| NvR · 1st Trial, no course · not renewed | 1 · 12 | 1 · 12 | — | ✅ |
| **NvR modals** (each card clicked) | 1 · 9 · 3 · **5** · 1 · 12 rows; columns per Palm §3.2, Remark "—" | `rows.length` | — | ✅ |
| Coach capacity · By person | 28 coaches FT→PT→FL, e.g. Bank `55 / 261 h · 21% 40/189 · 21% 15/72` | `byPerson` (= my recount) | — | ✅ |
| Demographics · Age | 2·3·15·5·4·2·0·0·0 (9 bands), "based on 31 of 37" | `ageBand` | — | ✅ |
| Demographics · Gender / Nationality / Province | 19 of 37 · 20 of 37 · 14 of 37 | as API | — | ✅ |
| Activity / Program | Type **128** · 1st Trial **1** · Total **129**; rows e.g. Private SURFSKATE 40 (Course 38 · Voucher 0 · 1 HR 2) | Σ categories 128 / 1 / 129 | — | ✅ |
| The page's requests | one `/reports/som?month=2026-10` | — | — | ✅ |

## The SCREEN: Daily Report 12 Oct, "Others Program" (`recheck-daily-12oct-others.png`)
`Group 4: Balance Play 2 · Balance Play Monday 2 · ครามพราว Inline Skate — · ECA 17: ABC / Balance Camp 9 · STA / Onewheel + Surfskate 8 · Camp 5: Camp 12-13 Oct 3 · 12-16 Oct 2 · Other —` = `kidsByProgram` **exactly** (null shown as "—"). ✅

## For the Palm note (not our defects)
His SOM page still reads the **old** `today.expected`, `byCourse`, `byRecentTrial`, `total`, `recentTrialSince` and `renewing`. Until he switches:
- Today Confirmed shows 8 (correct: 3);
- Active course shows 60 (40);
- 1st Trial 3 months shows 21 (4);
- Total shows 73 (52);
- **Renew Course shows 0 while its list shows 5.**

Scripts (scratchpad): `t109d.js` (recount, N1 rule updated), `t109g.js` / `t109k.js` (kids + teacherId), `t109j.js` (front markers), `t109l.js` (screen).
