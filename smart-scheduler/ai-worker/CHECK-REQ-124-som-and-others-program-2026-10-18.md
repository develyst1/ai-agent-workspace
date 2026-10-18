# CHECK: REQ-124, Palm's SOM dashboard (`GET /reports/som`) + Daily Report §10 "Others Program", against OUR back (@Silver, 2026-10-18)
**READ ONLY** (no edits, no SQL). Palm's docs at `smart-scheduler-front` `e314303`: `docs/backend-som-dashboard.md` (454 lines) and `docs/backend-daily-report.md` §10 (the `89774a9..e314303` delta). Code facts are file:line in `smart-scheduler-back` (`sched` = `src/services/scheduler.service.ts`). I re-checked the load-bearing ones myself:
- the route ignores every query param (`api.ts:333`);
- the `renewing` bug (`mappers.ts` has no `createdAt`);
- GROUP `headCount` is the seat cap (`mappers.ts:138`);
- `teachers.workDays` (`schema.ts:216-217`);
- the age bands (`lib/som-report.ts:65-72`);
- the area codes are on `parents` (`schema.ts:143-145`).

**Customer sources cross-checked:**
- her sheet, tab REPORT (`project-docs/customer-2026-10-11-meeting/sheet-REPORT.csv`): her words;
- the meeting summary §3 (`MEETING-NOTES-2026-10-11-as-given-by-owner.md` :68-100): a paraphrase;
- REQ-117 · REQ-119 (Total booked) · REQ-118.

## 1. What our back does today (`GET /reports/som`)
- **Route `api.ts:333`:** `som.getSomReport()` takes **no arguments**. `?month` and `?badgeValueIds` (which Palm's front already sends, `front som-report.service.ts:244-249`) are **silently ignored**. There is no contract type and no OpenAPI entry.
- **`som-report.service.ts:26-143`** returns `{existingCustomers, sportShare, newVsRenewing, demographics, today, generatedAt}`:
  - `today`: `expected` and `attended` from the OLD `getDailyReport` (`sched:967-989`).
  - `existingCustomers`:
    - `byCourse` = courses with `size − usedSessions > 0 && today ≤ expiry` (`lib/eligibility.ts:17-18, 38-39`);
    - `byVoucher` = usable vouchers (`lib/voucher.ts:38-43`);
    - `byRecentTrial` = FIRST_TRIAL in the last **90 days, any status**;
    - `total` = their union.
  - `sportShare`: each student's "primary sport", from every booking of every status (`lib/som-report.ts:94-114`).
  - `newVsRenewing`: `newByFirstTrial` (any status), `newByRegistration` (`students.createdAt`), `renewing`.
  - `demographics`: `gender` and `nationality` (free text on `students`); `ageBand` (bands `0-5, 6-9, 10-12, 13-15, 16-17, 18+`, `lib/som-report.ts:65-72`); `province` (the parent's Thai province name).
- **Readers:** only the route. **Tests that pin its SOURCE TEXT** (any rewrite of those lines breaks them):
  - `som-report.test.ts`;
  - `daily-report-task737.test.ts:202-208`;
  - `duo-course-req095-13.test.ts:399, 418-420`;
  - `voucher-end-req103.test.ts:135`;
  - `archive-parent-req098.test.ts:87-88`;
  - `archive-student-req093.test.ts:168`;
  - `budget-visibility-req102.test.ts:205`.
  - ⇒ **The old `getSomReport` + `lib/som-report.ts` stay byte-identical; the new contract is NEW code** (as REQ-119).

## 2. Mismatches (Palm's doc vs our data). Each comes to @Porter; Palm hears through the owner
| # | Palm assumes / shows | our back, in fact | effect |
|---|---|---|---|
| M1 | `renewing` is a live number | 🔴 **always 0 today (a bug):** the course/voucher DTOs carry no `createdAt` (`mappers.ts:326-364`), so `inMonth(undefined)` is false (`som-report.service.ts:96-118`) | the "Renew" card has shown 0 since it shipped. The new `renewCourse` reads raw `created_at` |
| M2 | `byCourse` = active courses | counts **ended or paused** courses that still have sessions and are unexpired (`eligibility.ts:38-39` ignores `endedAt` / `droppedAt`) | today's number is too high. The new `activeCourse` uses `courseStatus` (`lib/course-status.ts:45-55`) |
| M3 | `today.expected` ≈ confirmed | the OLD daily count: includes PAUSED, PENDING, OTHER, CAMP hour rows, GROUP rows **and seats** | the new `today.confirmed` reuses REQ-119's counters |
| M4 | trials / sport share | FIRST_TRIAL counts and `sportShare` include **CANCELLED** bookings | the new sections exclude CANCELLED |
| M5 | **Q0.1:** badge on booking or student? | **booking only** (`booking_badges`, `schema.ts:978-996`); no student / course / voucher badge. Camp hour rows refuse badges (`badge.service.ts:140`). **No server-side badge filter anywhere** (the calendar filters client-side, OR) | a "person" section filters by **the badges of that person's qualifying bookings in the window**. A voucher or course is "in a branch" only through its session rows |
| M6 | **Q5.3:** student or parent address? | **parent** (`parents.provinceCode / districtCode / subdistrictCode`, `schema.ts:143-145`, REQ-118 `0069`); NULL on rows from before 0069 | District = the student's parent's `districtCode`, named via `lib/area-codes.ts` (`areaName`, `:103`). **Expect a large `unknown`** until admins fill codes |
| M7 | Coach Capacity `availableHours` from `workDays` × 9 h − leave | matches the data: `teachers.workDays` (weekday set, default all 7), global 09:00–18:00 slots (`lib/time.ts:4-15`), `teacher_leave_days`; **no per-teacher hours** | a FL coach with the default all-7-days `workDays` gets a full-month capacity (**Q4.4**) |
| M8 | Activity / Program by category per Type incl. Voucher | **vouchers have no subject**; only their session rows do. "Category" = `subjects` (name / `priceGroup`); there is no separate category column | category = the **subject of each attended session** (a voucher session takes its booking's subject). ECA / Camp rows have no subject ⇒ they fall outside unless ruled (**Q6.5**) |
| M9 | §10.2 GROUP kids = `group.seats.length` | `headCount` on a GROUP row is the **seat CAP**, not kids (`mappers.ts:138`). Kids = seat rows (`group_id`). Live = PENDING / CONFIRMED / EXTENDED, delivered = ATTENDED / NO_SHOW | the back counts seats that are live or delivered, **excluding CANCELLED / SICK_LEAVE / PAUSED** (his §10.5 asks exactly this) |
| M10 | §10.2 ECA / OTHER kids = `other.headCount` per row | 🔴 **ECA / OTHER rows are ONE ROW PER HOUR**; `headCount` repeats on each hour row of the same class | a 2-hour ECA class with 5 kids would show **10**. His K1 test (two rounds 5 + 6 ⇒ 11) cannot tell "2 rounds" from "1 two-hour class". **Decision needed (see D1)** |
| M11 | §10.2 CAMP kids = `campKidCount` | the same source: `camp_days` per (week, date), PLANNED + ATTENDED + ABSENT (`camp.service.ts:30, 42-49`); two weeks on one date are counted per week | matches; one item per camp week (his §10.5). 📌 **ABSENT kids are included**, as the calendar does |
| M12 | Existing Customers for a PAST month, "active at month end" | `usedSessions` is a running counter and its past value is not stored; expiry moves (history in `course_expiry_changes`) | the back **rebuilds** it from the course's ATTENDED / NO_SHOW rows dated ≤ month end + the expiry history. That is more code; noted in the size |
| M13 | New / Renew / trial → course | **no trial→course and no course→renewal link exists** (REQ-120 F4 would add them later) | inferred from student + dates (Palm's rules) |
| M14 | **Q3.9 Remark** in every modal | no such store: courses have only `endNote` / `dropReason`; vouchers have `note`; students have `note` | `remark: null` until ruled (see K5) |

## 3. Conflicts with customer rulings (for the owner, by consequence)
| # | her source says | Palm's doc says | consequence |
|---|---|---|---|
| K1 | meeting §3.1: *"Active Course: นับตามจำนวนตัวคอร์ส · Active Voucher: นับตามจำนวน Voucher"* (count PACKAGES) | §2: count **PEOPLE** (*"นักเรียน 1 คนมี 2 คอร์ส active = Active Course +1"*) | a child with 2 active courses = 2 or 1. The meeting text is a paraphrase; the sheet says only *"Active Course = Course เท่านั้น"*. **Owner rules** |
| K2 | sheet: *"จับเป็นเดือน นับตามเดือนที่มาเรียนและไปขึ้นในเดือนนั้นๆ"* | §3 Q3.8 open (booking month or trial-date month?) | her sheet answers **Q3.8 = the month of the trial CLASS**. Our default follows her words |
| K3 | meeting §3.3: ages *"1, 2, 3, 4, 5, 7, 8, 10, 20+, 40+, 55+"* · sheet: `1-2, 3-4, 5-7, 8-10, 11-13, …, 55+` (the cells between are blank in our snapshot) | §5.1: `14-19 / 20-39 / 40-54 / 55+` (Q5.1, his reading) | the 14+ band is not in our snapshot. **Owner / Khwan confirm the 9 bands** |
| K4 | meeting §3.3: show **เขต AND แขวง** (district + sub-district) besides province | §5.2: **district only** | a sub-district tab is extra work (the codes exist on parents). **Owner: is district enough?** |
| K5 | meeting §3.4: a **Remark** on the renew detail, *"ให้กรอกเหตุผลกรณีลูกค้าไม่ต่อคอร์ส … มีตัวเลือกให้คลิกเลือกหรือพิมพ์เพิ่มได้"* | §3.2: `remark` read-only; Q3.9 asks where it comes from | it is **NEW data the admin types** (a pick-list + free text): a store + a write endpoint + **an input on Palm's screen**. Not in his contract. **Owner: in this round or later?** |
| K6 | meeting §3.1: Today = *"ข้อมูลเหมือน Daily Report"* | §1: *"จำนวนคน"* (people) + Q1.1 (lessons only?) / Q1.3 (people or rows?) | "same as the Daily Report" ⇒ lessons only, the REQ-119 counters (rows, NO_SHOW in Confirmed). Our default follows her words; Palm's "คน" wording differs |
| K7 | sheet: Coach Capacity *"BY PERSON in Daily Report"* | not in Palm's daily doc | note only (the daily workload `byTeacher` exists; capacity per person in the daily is not asked) |
| K8 | REQ-120 F1: a **branch** at booking (the back-office rebuild) | §0.1: branch = **badges** (*"client ตกลง 2026-10-17"*) | fine for now; when F1 lands, the filter's source changes. Noted for REQ-120 |
| — | REQ-119 ruling: Total booked = Confirmed + On leave | SOM has no Total booked | ✅ no conflict |

## 4. Palm's "not confirmed with the client" values. They stay as his; the back's default where he gave none
| Q | open question | the back's default (declared, overturnable) |
|---|---|---|
| Q0.1 | badge on booking or student | booking (fact, M5) |
| Q0.2 | capacity + badge | **booked** hours filtered by badge; **available** not filtered |
| Q1.1 / Q1.2 / Q1.3 | lessons only? NO_SHOW? people or rows? | as the Daily Report (K6): lessons, NO_SHOW in Confirmed, rows |
| Q2.1 | "course active" | `courseStatus` ACTIVE at month end (not ended, paused, completed or expired) |
| Q2.2 / Q2.3 | trial moves out on a voucher? 1 HR moves out? | trial moves out on a **COURSE** only; 1 HR never moves out |
| Q2.4 | trial / 1 HR by class date or booking date? attended only? | by **class date**, any status except CANCELLED |
| Q2.5 / Q2.7 | `totalCustomers` scope | Palm's Q2.7 reading |
| Q3.4 | trial → voucher still "no course"? | yes, still "no course" (a voucher is not a course) |
| Q3.6 | not-renewed then renewed later | it leaves `notRenewed` (a live count) |
| Q3.7 | "course ended" = used up, expired or either; renew before the end? | ended = no longer ACTIVE; buying before the end ⇒ "Renew" only once the old one has ended (Q3.2) |
| Q3.8 | trial month | the class date month (K2, her words) |
| Q3.9 | remark | `null` (K5) |
| Q4.3 / Q4.4 / Q4.5 / Q4.6 | period · FL availability · group & pending hours · inactive coaches | calendar month · FL by `workDays` · Palm's §4: lesson + group, not CANCELLED · active, non-archived coaches |
| Q5.1 | age bands | Palm's 9 bands (K3) |
| Q6.2 / Q6.3 / Q6.4 / Q6.5 / Q6.7 / Q6.8 | type · total · category · group classes · donut · people or classes | Palm's §6; category = the session's subject; ECA / Camp out (no subject); **classes (rows)** |
| K1–K4 (§10.4) | same name twice a day · teacher filter · totals · no head count | Palm's: merge by name · filter by teacher (incl. extra coaches) · per-program total only · `null` |

## 5. ❓ Decisions needed before / during the build
- **D1 (M10), the ECA / OTHER hour rows:** count `headCount` **once per class**, where a class = the same series/title + teacher + date + **contiguous hours**. Then a 2-hour class with 5 kids = 5, and K1's two separate rounds still add (5 + 6 = 11). The alternative, Palm's literal per-row sum, gives 10 for a 2-hour class with 5 kids. **I recommend once-per-class (it is what the number means).** It needs your OK, because Palm's FE fallback sums rows.
- **K1, K3, K4, K5:** the owner / Khwan. Everything else ships at the defaults above.
- **Optional DATA REQUEST (bare SQL for the owner):** how many parents have a district code yet (M6), i.e. how much of District will be "unknown":
  `SELECT count(*) FILTER (WHERE district_code IS NOT NULL) AS with_code, count(*) AS parents FROM parents WHERE archived_at IS NULL;`
