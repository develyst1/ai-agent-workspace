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

---
# §uat — READ-ONLY smoke, REQ-124 back (`82a1988`) on uat (the uat front not deployed) · 2026-10-19
**Verdict: ✅ PASS.** GET only. 0 writes attempted, 0 blocked. No names written to any file (counts only).

| Check | uat | |
|---|---|---|
| `GET /reports/som?month=2026-10` | **200**. Sections: `today` (`confirmed`, `attendanceRate`) · `existingCustomers` (`activeCourse`, `activeVoucher`, `recentFirstTrial`, `recentSingleSession`, `totalCustomers`, `recentFrom/To`) · `newVsRenewing` (all 6) · `coachCapacity` (`byPerson` 24 coaches, `byType` 3) · `demographics` (`ageBand` 10 buckets = 9 + unknown, `district` **121 of 312 known**) · `activityProgram` (21 categories) | ✅ |
| **The old fields are still there** (the admins' current screen) | `today.expected/attended` · `existingCustomers.byCourse/byVoucher/byRecentTrial/total/recentTrialSince` · `newVsRenewing.newByFirstTrial/newByRegistration/renewing` · `sportShare` · `demographics.gender/nationality/province` | ✅ |
| New vs old (by value, Oct) | today confirmed **94** / attended 94 / 100% (old `expected` 115) · activeCourse **182** · activeVoucher 44 · recentFirstTrial 155 · 1 HR 82 · totalCustomers 327 · NvR: firstTrial 92 · newCourse this/prev 24 / 18 · **renewCourse 29** (old `renewing` 0) · trialNotConverted 78 · notRenewed 28 | ✅ |
| **Lists: `rows.length` = the card** | `firstTrial` 92 = 92 · `newCourseThisMonth` 24 = 24 · `renewCourse` 29 = 29 · `notRenewed` 28 = 28 | ✅ |
| `GET /reports/daily` **today** (Sun 18 Oct) | **200**, `kidsByProgram` with all 4 programs in order, each `{total: null, items: []}` (no group work on a Sunday) | ✅ |
| …a weekday, for shape | 16 Oct: CAMP 5 (1 week); 15 Oct: CAMP 4. The other three are empty. | ✅ |

📌 On uat, **District is 121 of 312 known**: real parents have area codes, unlike sid's 0.

---
# §TASK-744 — `demographics.subdistrictByDistrict` on sid (back `6bac497`) · 2026-10-19
**Verdict: ✅ PASS by value.**

**Baseline:** the district card is unchanged from TEST-109: `known 0 / 37`, `subdistrictByDistrict {}`. No October-attending parent on sid has codes.

**To test by value**, I gave the two **QA parents** of the October-attending QA kids (QAChatOne + QAChatTwo → `a3fb456e`; QA Kid Three + QA Camp Kid2 → `b7146378`) area codes **for the duration of the check**, then **restored both exactly**. `a3fb456e` is back to province name «กรุงเทพมหานคร» with null codes; `b7146378` is all null. The district card returned to the baseline byte for byte.

| Run | Codes set | `district` (API) | `subdistrictByDistrict` (API) | Mine | |
|---|---|---|---|---|---|
| 1 | both in **3801**: 380101 / 380102 | `3801 «เมืองบึงกาฬ, บึงกาฬ» 4`, unknown 33, known 4/37 | `3801`: `380101 «บึงกาฬ» 2 · 380102 «โนนสมบูรณ์» 2 · unknown 0`, known 4, total **4** = the district's 4 | 380101 2 · 380102 2 | ✅ |
| 2 | **3801**/380101 and **1001**/100101 (Bangkok) | `1001 «พระนคร, กรุงเทพมหานคร» 2 · 3801 2`, unknown 33 | `1001`: `100101 «พระบรมมหาราชวัง» 2 · unknown 0`, total 2 · `3801`: `380101 2 · unknown 0`, total 2 | same | ✅ |

- **Keys** = exactly the district card's keys (no `unknown` key) ✅.
- **Each district's `total`** = its `count` in `demographics.district` ✅.
- **`unknown` inside a district = 0** ✅.
- **Labels:** Thai sub-district names ✅.
- **Badge filter** (`97ccdb39…`; no sid booking has a badge): `district` total 0, `subdistrictByDistrict {}` ✅. It follows the same people as the district card.
- **"District without sub-district"** can't be created: `PATCH /parents` with province + district only ⇒ **400** (REQ-118's full-triple rule). So a non-zero `unknown` inside a district can only come from older data, and "≈ 0" is what to expect.
- **Screen:** API only, as briefed.

Scripts (scratchpad): `t744.js`, `t744b.js` (both restore in `finally`), `t744fix.js` (restored `a3fb456e`'s province name after run 1's first restore had set it to null; verified).

---
# §screen re-check 2 — after Palm's "fixed, on dev" (21:28) · sid · 2026-10-19 ~21:30
**Verdict: ⛔ NOT FIXED ON SID. Palm's change is not what sid serves.** No regressions on the other cards.

**Build identity:**
- the JS that `/scheduler/som`, `/reports` and `/calendar` load is **3,329,525 bytes, byte-for-byte the same total as at my previous re-check** (front `e314303`);
- `subdistrictByDistrict` appears **nowhere** in it;
- the page shows no commit or version except the old "v0.1".

⇒ Either Palm's build went to another "dev" (his own server / the `develop` branch) and not to sid, or it hasn't been built yet. **Not visible from here.**

| Card | Screen now | API new field | API old field | |
|---|---|---|---|---|
| Today · Confirmed | **31** | `confirmed` **15** | `expected` 31 | ⛔ still old |
| Today · Attendance | **39%** (12/31) | `attendanceRate` **80** | — | ⛔ still computed from `expected` |
| Today · Attended | 12 | 12 | — | ✅ |
| Existing · Active course | **60** | `activeCourse` **40** | `byCourse` 60 | ⛔ |
| Existing · 1st Trial (3 months) | **21** | `recentFirstTrial` **4** | `byRecentTrial` 21 | ⛔ |
| Existing · Total customers | **73** | `totalCustomers` **52** | `total` 73 | ⛔ |
| Existing · window | "since 21 Jul 2026" | `recentFrom` 2026-08 | `recentTrialSince` | ⛔ |
| NvR · **Renew Course** | **0** | `renewCourse` **5** (its modal: **5 rows**) | `renewing` 0 | ⛔ |
| Active voucher · 1 HR · NvR (other 5 cards) · all 6 modals (1·9·3·5·1·12 rows) · Coach capacity · Demographics · Activity/Program | as before | = API | — | ✅ no regression |
| Daily Report 12 Oct · Others Program | Group 4 · ECA 17 · Camp 5 (Camp 12-13 Oct 3 · 12-16 Oct 2) · Other — | = `kidsByProgram` | — | ✅ no regression |
| District click-through (sub-districts) | **does not exist** in this build (no `subdistrictByDistrict` in the JS) | `subdistrictByDistrict` served by back `6bac497` | — | ⚪ noted |

Evidence: `qa-2026-10-19/test109/recheck2-som-page-oct.png`, `recheck2-daily-12oct-others.png`.
**Next:** once sid really serves Palm's new front, the same script (`t109l.js`) re-runs in about 3 minutes.

---
# §uat TASK-744 — READ-ONLY smoke, uat back `6bac497` · 2026-10-19
**Verdict: ✅ PASS.** GET only, 0 writes. Counts only.

| Check | uat (Oct) | |
|---|---|---|
| `/reports/som?month=2026-10` | 200; **`demographics.subdistrictByDistrict` present** | ✅ |
| Keys | **44** entries = exactly the district card's **44** district keys (no `unknown` key) | ✅ |
| Every district | `total` = the district's `count` · `known + unknown = total` · Σ buckets = total: **0 mismatches across all 44** | ✅ |
| `unknown` inside districts | **Σ 0** | ✅ (≈ 0 as expected) |
| District #1 / #2 (count 7 each) | 4 and 3 buckets; Σ 7 · known 7 · unknown 0; sorted by count desc, `unknown` last | ✅ |
| `demographics.district` vs my 10-19 smoke | now **127 known / 194 unknown / 321 total** (was 121 / 191 / 312) | ⚪ grew with the month's new attendance (uat's "today" moved from 18 to 19 Oct). Same shape, not a regression |

---
# §screen re-check 3 — front `692f798` + back `6bac497` on sid · 2026-10-19 ~21:38
**Verdict: ✅ PASS. Palm's SOM page = the API on every card**, including the 5 that read old fields before. No regressions.

**Build identity:** the JS that the pages load **changed** (3,329,909 bytes; it was 3,329,525). `subdistrictByDistrict` is absent, as briefed (no district click-through in this build).

| Card | Before (re-check 2) | Screen now | API new field | |
|---|---|---|---|---|
| Today · Confirmed | 31 (`expected`) | **15** | `confirmed` 15 | ✅ |
| Today · Attended / Attendance | 12 / 39% | **12 / 80%** | 12 / `attendanceRate` 80 | ✅ |
| Existing · Active course | 60 | **40** | `activeCourse` 40 | ✅ |
| Existing · Active voucher | 13 | 13 | `activeVoucher` 13 | ✅ |
| Existing · 1st Trial (3 months) | 21 | **4** | `recentFirstTrial` 4 | ✅ |
| Existing · 1 HR (3 months) | 25 | 25 | `recentSingleSession` 25 | ✅ |
| Existing · Total customers | 73 | **52** | `totalCustomers` 52 | ✅ |
| Existing · window line | "since 21 Jul 2026" | **"1st Trial / 1 HR: Aug 2026 – Oct 2026"** | `recentFrom` / `recentTo` | ✅ |
| NvR · 1st Trial · New this/prev · Trial no course · Not renewed | 1 · 9 · 3 · 1 · 12 | same | same | ✅ |
| NvR · **Renew Course** | 0 (modal 5) | **5** (modal **5 rows**) | `renewCourse` 5 | ✅ |
| NvR modals | 1·9·3·5·1·12 rows | same | `rows.length` | ✅ |
| Coach capacity · Demographics · Activity/Program | = API | = API (e.g. Bank `55 / 261 h · 21% 40/189 · 21% 15/72`) | — | ✅ no regression |
| Daily Report 12 Oct · Others Program | = API | Group 4 · ECA 17 · Camp 5 (Camp 12-13 Oct 3 · 12-16 Oct 2) · Other — | = `kidsByProgram` | ✅ no regression |

Evidence: `qa-2026-10-19/test109/recheck3-som-page-oct.png`, `recheck3-daily-12oct-others.png`.

---
# §uat screen — READ-ONLY smoke, front `692f798` + back `6bac497` on uat · 2026-10-19
**Verdict: ✅ PASS.**
- 🚫 **0 app writes.** Only 6 Cloudflare `cdn-cgi/rum` beacons were aborted.
- **0 console/page errors.** Nothing pressed except opening one card's list.
- Counts only, no names.

| Palm's SOM page (Oct) | Screen | uat API new field | (old field, for contrast) | |
|---|---|---|---|---|
| Today · Confirmed | **28** | `confirmed` 28 | `expected` 31 | ✅ |
| Today · Attendance | **100%** | `attendanceRate` 100 | — | ✅ |
| Existing · Active course | **186** | `activeCourse` 186 | `byCourse` 200 | ✅ |
| Existing · 1st Trial (3 months) | **155** | `recentFirstTrial` 155 | `byRecentTrial` 207 | ✅ |
| Existing · Total customers | **332** | `totalCustomers` 332 | `total` 411 | ✅ |
| NvR · Renew Course | **32**, and its list opens with **32 rows** | `renewCourse` 32 | `renewing` 0 | ✅ |

- **The other sections render:** Today · Existing customers (window line "1st Trial / 1 HR: Aug 2026 – Oct 2026") · New vs renewing · Coach capacity · Demographics · Activity / Program ✅.
- **Daily Report (today):** the **Others Program** section is shown with all 4 cards (Group · ECA · Camp · Other) ✅.
- **REQ-123 still works:** Teachers → "Teacher leave" renders with Upcoming/Past, 5 rows and 4 Cancel buttons. **Nothing was pressed.** ✅
