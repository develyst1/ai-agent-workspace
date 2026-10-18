# TASK-742 — REQ-124 (2/3): SOM **New vs Renewing** (6 cards + the NEW list endpoint) + **Coach Capacity** — BE, M (≈ 5.5 d → 6 d)
- Source: `requirements/REQ-124-back-serves-palms-som-dashboard-and-others-program.md` · Palm's `docs/backend-som-dashboard.md` + `docs/backend-daily-report.md` §10 (front repo at `e314303`, READ ONLY) · **`CHECK-REQ-124-som-and-others-program-2026-10-18.md`** (the facts, mismatches M1–M14, the defaults §4, the decisions §5)
- Status: ✅ DONE (Silver, 2026-10-18) · uncommitted
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-18)
- **Claim:** 741's files + `api.ts` a NEW route `GET /reports/som/new-vs-renewing/:bucket` (same filters) · `src/lib/route-access.ts` (its access, the same as `/reports/som`: `menu:som`) · `validation.ts` (the bucket enum) · `contract.ts` (`NvrDetailRow`) · OpenAPI. 🚫 **The old `getSomReport` (`som-report.service.ts`) and `lib/som-report.ts` stay BYTE-IDENTICAL**: 7 test files pin their source text (CHECK §1). The route keeps calling it and MERGES the new sections into its result, so every old field the front still reads stays.
- 🔴 SAFE test command only (TASK-723 has it). 🔴 run → list → ask → THEN edit. 🚫 No front file; no change to Palm's docs. Nothing committed.
- **Defaults:** where Palm left a question open, use the default in CHECK §4 and declare it in one line in Implementation Notes. Each default lives in ONE named constant, so a ruling is a one-line flip + its pin.

## Build
1. **`newVsRenewing` (§3.1)** for `month`:
   - `firstTrial`: people who **booked** a 1st Trial; the month = the **trial class date** (CHECK K2, her words); not CANCELLED; it stays counted after a course (§3).
   - `newCourseThisMonth` / `newCoursePrevMonth`: **COURSES** (vouchers excluded), assigned to the month of the student's 1st Trial. With no trial, the month the course was bought. "Opened" = `course_packages.created_at` (Bangkok).
   - `renewCourse`: course + voucher **packs** bought this month by a student who already had a course that has ENDED (no longer active). Read raw `created_at` (M1: today's `renewing` is always 0).
   - `trialNotConverted`: people.
   - `notRenewed`: packs that ended this month with no newer pack yet; counted from the day after the end; a later renewal removes them.
   - **No stored links** (M13): inferred from student + dates. Every rule is ONE named function.
2. **The list endpoint (§3.2):**
   - `:bucket` ∈ the 6 field names ⇒ `{rows: NvrDetailRow[]}`;
   - **rows.length === the card's number** (the same function feeds both);
   - fields `studentId · studentName · packageLabel · courseTeacherId · trialTeacherId · trialDate · date · remark`;
   - `remark: null` (M14 / K5 open);
   - `courseTeacherId` = the teacher of the pack's first session.
3. **`coachCapacity` (§4):**
   - `byPerson`, ordered FT → PT → FL; active, non-archived teachers.
   - **Available hours** = each day of the month in the teacher's `workDays`, minus `teacher_leave_days`, × 9 (the 09:00–18:00 slots), split weekday / weekend (M7).
   - **Booked hours** = that teacher's non-CANCELLED lesson + group rows (+ extra coaches), split the same way. **Badge-filtered on booked only** (Q0.2 default).
   - Every `*Pct` = round(booked ÷ available × 100); available 0 ⇒ 0.
   - `byType`: always 3 rows; it sums the hours of its coaches and computes its % from those sums, never an average of percentages.

## Definition of Done
- [ ] **By-value tests:**
  - a trial on 21/9 + a course on 3/10 ⇒ `newCoursePrevMonth` of October and `newCourseThisMonth` of September;
  - a course with no trial ⇒ the month it was bought;
  - a renew needs an ENDED earlier course;
  - not-renewed leaves once renewed;
  - each bucket's `rows.length` = its card;
  - capacity with `workDays` + a leave day + a weekend split;
  - `byType` % computed from sums;
  - a FL coach with the default `workDays`.
- [ ] **Mutation set:** a voucher counted in New Course · the course month used instead of the trial month · renew without an ended course · the list ≠ the card · leave days not subtracted · `byType` as an average of %.
- [ ] tsc · full suite (SAFE) with counts.

- **✅ Porter (2026-10-18):**
  - the claims are GRANTED exactly as listed;
  - **D1 = ONCE PER CLASS** (same series/title + teacher + date + contiguous hours);
  - **K1/K3/K4/K5 are with the owner**: build with Palm's defaults (one constant each);
  - **K5 (Remark) is NOT built**: `remark: null`.
  - Order: **741 → 742 → 743.** ▶️ GO.

## Implementation Notes
**Evidence (Bob, 2026-10-18):** new test `src/lib/som-nvr-capacity-task742.test.ts` **47 pass** · mutation set `som-nvr-capacity-task742.mutations.json` **46/46 BITES, CHECKSUM identical** · 741's set re-anchored after the shared refactor: **39/39 BITES** · tsc 0 · old SOM files 0-line diff. Full SAFE suite: **everything green except 3 census tests OUTSIDE the claim** that my new route/field trips (below). Nothing committed.

**Files (inside the claim):** `src/lib/som-contract.ts` (+ `countNvr`, `countCapacity`, `NVR_BUCKETS`; the course/voucher "status as of a date" is now ONE function `entitlementClock` that 741's Existing Customers and 742 both read) · `src/services/som-contract.service.ts` (one `loadInput` behind the page AND the list: `getSomContract`, `getNvrRows`; also reads teachers + the month's leave days) · `src/routes/api.ts` (NEW `GET /reports/som/new-vs-renewing/:bucket`) · `src/lib/route-access.ts` (`menu:som`, same as the page) · `src/validation.ts` (`nvrBucketParam`) · `src/types/contract.ts` (`NvrDetailRow`, `SomCapacityPerson`, the two new sections of `SomReportResponse`) · `src/openapi/document.ts` (the new path). The route's merge also lays `newVsRenewing` over the old one (`newByFirstTrial / newByRegistration / renewing` stay beside Palm's six; `renewing` is still the old always-0 — the front reads `renewCourse`).

**Rules, each ONE function (decisions I made — overturnable at review):**
1. **A card's number is `rows.length`** — `countNvr` builds the rows and the counts come from them; the list endpoint reads the same `loadInput`.
2. **1st Trial** = a child's EARLIEST non-cancelled FIRST_TRIAL class (class date, K2); counted in the month of that date; PAUSED counts; two trials = once. **No course** = no COURSE bought on/after the trial date (a voucher does not convert — Q3.4; a course bought BEFORE the trial does not either).
3. **New / Renew / neither**, from the child's EARLIER courses (strictly an earlier Bangkok day, so two courses bought together are both «first»): none earlier ⇒ NEW; all earlier ones ended ⇒ RENEW; else NEITHER (a second course while one is still active is neither). «Ended» = CANCELLED · COMPLETED · EXPIRED **as of the purchase day** (the 741 clock); **a PAUSED course is NOT ended** (constant `RENEW_ENDED_STATUSES`; CHECK §4 said «no longer active» — I excluded the paused one because `course-status.ts` says the family is away, not finished).
4. **New Course month** = the month of the child's 1st Trial when it came BEFORE the purchase, else the month bought; «previous month» exists only for trial-based courses. DUO: either child's trial, one row, both names «A & B», the primary child's id.
5. **Renew Course** = RENEW for a course, or a voucher bought by a child whose courses have all ended (a voucher is never «new»); counted in the PURCHASE month.
6. **Not renewed** = a course/voucher whose status now is CANCELLED/COMPLETED/EXPIRED (voucher: ENDED/EXHAUSTED/EXPIRED); end day = the early-end date · the last delivered row (else the purchase day) · the last valid day; counted from the day AFTER (so a 30-Sep expiry is OCTOBER's), only once that day has come, and only while no newer pack (a later Bangkok day) exists for the child(ren). Paused ⇒ not.
7. **Branch (badge)** = as 741: a trial by its own badge, a pack through its non-cancelled session rows.
8. **Rows:** `studentName` = `nickname || name`; `courseTeacherId` = the coach of the pack's first non-cancelled session (date, then start time); `trialTeacherId/trialDate` = the child's 1st Trial; `date` = the purchase day (New/Renew), the end day (not renewed), null (trial rows); `remark: null` (K5). Sorted by date, then name.
9. **Coach Capacity:** ACTIVE non-archived coaches (Q4.6), the whole calendar month (Q4.3); available = each day in `workDays` minus the month's recorded leave days × 9 (`CAPACITY_HOURS_PER_DAY`), split Mon–Fri / Sat–Sun; booked = rows' DURATION in hours (rounded once per coach and bucket) of lessons + the GROUP row (the group row counts for its extra coaches too; never a seat, never ECA/camp), every status except CANCELLED (`CAPACITY_NOT_COUNTED_STATUSES`, Q4.5), badge-filtered on booked only (Q0.2); % = round(booked ÷ available), available 0 ⇒ 0, **capped at 100** (`CAPACITY_PCT_CAP`; the hours stay real); order FT → PT → FL then nickname; `byType` always 3 rows, hours are SUMS and the % comes from the sums.
10. **Leave days** come through `recordedLeaveDays` — the ONE reader of that table (a census test enforces it). It also lists each day's classes (one query per leave day); a month has few, so I accepted that cost rather than add a second reader.

## Questions
**ONE BATCH — 4 edits outside my claim (run → list → ask → edit; nothing touched yet).** My full-suite run is green except these 3 census tests, which my new route/field legitimately trips, and ONE real bug found by a probe:
1. 🔴 **`src/middleware/uuid-params.ts`** — add ONE entry to `FREE_FORM_PARAMS`: `"/api/reports/som/new-vs-renewing/:bucket": ["bucket"],`. **Without it the endpoint is a 400 in the real app** (probe through the root app: `400 {"message":"พารามิเตอร์ไม่ถูกต้อง: bucket"}`; every param is treated as a uuid unless its route is declared). My own tests call `api` directly, which skips that guard — I will add a root-app test of my own that pins the 200.
2. **`src/lib/outbox-reason-and-uuid-param-req105.test.ts:79`** — the param-name census `["date","id","key","teacherId"]` → add `"bucket"` (sorted first).
3. **`src/lib/uuid-param-global-req105.test.ts:92`** — the same census list, same addition (its title says «FOUR param names»; I would leave the title, or say «five» if you prefer).
4. **`src/lib/line-notices-both-names-req095-13.test.ts`** (the `ALLOW` set, ~line 97) — add `"src/lib/som-contract.ts"`: the census forbids a `studentName:` that does not go through `studentNamesOf`; SOM's list rows name a child (`nickname || name`), no booking involved — the same kind of per-child site as the camp package / registered student already listed. If you would rather not allow #4, the alternative is to build the row without the literal `studentName:` key (a computed/shorthand property) — a workaround for the census, which is why I am asking instead.
Also for the record (not an edit): **Q-742-b** rule 3's «paused ≠ ended» deviates from CHECK §4's wording — say so if you want the literal «no longer active».

## Outside-claim edits (all GRANTED by Silver/Porter 10-18, applied exactly as listed)
1. `src/middleware/uuid-params.ts` — `FREE_FORM_PARAMS` + `"/api/reports/som/new-vs-renewing/:bucket": ["bucket"]` (the real bug: the guard 400'd the new route).
2. `src/lib/outbox-reason-and-uuid-param-req105.test.ts:79` and 3. `src/lib/uuid-param-global-req105.test.ts:92` — the param census + `"bucket"`.
4. `src/lib/line-notices-both-names-req095-13.test.ts` — `ALLOW` + `"src/lib/som-contract.ts"`.
5. `src/lib/coach-rate-walk-req105.test.ts:168` — the exact key list of `FREE_FORM_PARAMS` + the new route (a 5th pin I missed; Silver granted; mirrors edit 1).
Plus my own root-app test: through the real app the list route answers 200 for a card name and 400 for a bad one.

**Final evidence:** full SAFE **4934 pass / 0 fail (357 files)** · tsc 0 · sets: 741 **39/39**, 742 **46/46**, 737 **11/11** (one anchor re-pinned, see 743), 743 **22/22**, all CHECKSUM identical · old SOM files + `scheduler.service.ts`: 0-line diff.

## Review

**Silver, 2026-10-18 — ✅ FINAL: DONE.**
- **Re-run by me (SAFE), on the whole REQ-124 tree:** **4934 / 0** (357 files) · tsc 0 · sets **741 39/39 · 742 46/46 · 743 22/22 · 737 11/11**, every `CHECKSUM identical` · the old `som-report.service.ts`, `lib/som-report.ts` and `scheduler.service.ts` (`getDailyReport`): **0-line diff**.
- **The 5 outside-claim lines are exactly Porter's grants:** `uuid-params.ts` FREE_FORM entry (+ the root-app 200 test) · the 2 param censuses + `bucket` · the both-names ALLOW + `som-contract.ts` · the coach-rate-walk FREE_FORM key list. I read each diff line.
- Every bucket's `rows.length` is its card (one builder).
- Paused ≠ ended for Renew (accepted by Porter).
- **Known data limit:** a pause that was later resumed leaves no trace, so a past month may count that course as active (741 decision 1).
