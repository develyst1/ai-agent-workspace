# TASK-723 — Daily report: ONE source in the back, camp counted as the CHILDREN who came (coach-hours OUT of the totals) — BE, M
- Source: Khwan's Daily report (17 vs 9) · `SIZING-NEXT-ROUND-teamB-2026-10-04.md` §1 + **ADDENDUM 2026-10-11** · **REPRODUCED on sid: `tests/TEST-092-daily-report-step0-sid.md`** (27 Sep +5 = the 5 coach-hours; 30 Sep 15 vs true 10) · promised to Khwan "next week" (owner, 2026-10-08)
- Status: 🚫 **CANCELLED — handed to Palm** (owner 2026-10-11: *"A คือหน้าบ้านทั้งหมดและ เราจะไม่แตะ ฉันฝากให้ปาล์มรับผิดชอบ"*; REQ-117 is not ours). Nothing was built. Kept as a record of the analysis.
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-11) · pairs with **TASK-724** (FE): they ship TOGETHER.
- **Claim ✅ GRANTED by Porter 2026-10-11, effective the moment the owner answers Q1:**
  - `src/services/scheduler.service.ts`: **`getDailyReport` only** (`:966-988`). 🔴 It is Team A's file: tell me BEFORE touching anything else in it (Porter);
  - `src/routes/api.ts`: the `/reports/daily` route only (`:312-313`);
  - `src/validation.ts`: `reportQuery` only;
  - the two readers, **only if the shape forces it:** `jobs.service.ts:248` (it stores the report in `job_runs.summary`) and `som-report.service.ts:39`;
  - new test files.
  - Reds outside the claim ⇒ the standing practice: full suite, the whole list to me once, no edit before the grant.
- 🔴 **Safe test run ONLY** (SYSTEM-FACTS 2026-10-08: the back `.env` can point at the CUSTOMER's system):
  ```
  DATABASE_URL="postgres://x:y@127.0.0.1:1/test" LINE_OA_WRITE_ALLOW="" LIFF_ID="1234567890-s" LINE_LOGIN_CHANNEL_ID="1234567890" LINE_CHANNEL_ACCESS_TOKEN="" LINE_CHANNEL_SECRET="dummy-test-secret" LINE_ADMIN_VERIFY_CODE="" OPS_API_URL="" SERVICE_TOKEN="" INTERNAL_JOB_SECRET="" bun test
  ```
  🚫 Never print `.env` values.

## §0 Why (CERTAIN, reproduced)
- A camp day is written as **one `bookings` row per coach per hour** (`OTHER`, `CONFIRMED`, `camp_week_day_id` set; `camp.service.ts:280-281`), and the day-end auto-attends every CONFIRMED row (`jobs.service.ts:~83-88`).
  - ⇒ **Attended = lessons + coach-hours.** The children who came are only in `camp_days` (one row per package per date, `status` ATTENDED/ABSENT/PLANNED), which the report never reads.
- **Two counters disagree today** (TEST-092, 27 Sep): the screen recounts from `/calendar` (11 · 9), while `getDailyReport` says 14 · 11 (it counts a GROUP row and the leave rows that the screen's `/calendar` count leaves out).
  - `getDailyReport` is also what the day-end job stores (`job_runs.summary`) and the SOM dashboard shows.
  - ⇒ **This TASK makes the back the ONE counter.** TASK-724 makes the screen render it instead of recounting.

## The rules (Q1 = owner, pending · R2/R3 = ride with Q1; Porter puts all three to him)
| | rule | recommended |
|---|---|---|
| **Q1** | **Camp is counted as the CHILDREN who came, in its OWN row; the coach-hour rows are OUT of Total booked / Attended / the type rows / the per-coach rows** | ✅ (Porter + Silver) |
| **R2** | **GROUP sessions count** (each seat row is a child), with their own type row | ✅ (today the back counts them and the screen does not) |
| **R3** | **On leave is NOT in Total booked**: it has its own line (it already does) | ✅ (10-04 cause c: Khwan's 22 − 17 = 5 leave cells) |
- 🚫 **Unchanged:** camp coach-hour rows are still auto-attended (coach pay and history depend on it). Only the REPORT stops counting them.

## What to build
1. **`getDailyReport(date, { teacherId?, scope })`** returns everything the screen shows, computed once:
   - `totalBooked`, `attended`, `confirmed`, `pending`, `reschedulePending`, `onLeave`, `noShow`, `cancelled`, `attendanceRate`;
   - `byBookingType` (**all 6 types**; `OTHER` = non-camp Other);
   - `byTeacher` (`count`, `attended`);
   - **`camp: { childrenAttended, childrenAbsent, childrenPlanned }`**.
2. **A camp coach-hour row** is `camp_week_day_id IS NOT NULL`, the durable link written at `camp.service.ts:281`. Decide and declare whether `other_kind = CAMP` is also checked. Those rows appear in NO count above.
3. **The children:** `camp_days` rows for the date by `status`, counted per row (one package per date is unique). Declare what you do if one child holds two packages on one day.
4. **Scope:** the route passes `scopeOf(user)` like `/bookings`.
   - A coach login sees its own lessons. Its camp row covers only camp weeks where that coach has coach-hour rows that day (decide and declare).
   - `teacherId` filters the same way for an admin.
5. **The two readers** keep working. `job_runs.summary` stores the new shape (it is a record, not a message). The SOM dashboard's "today" reads the same numbers. **No LINE message reads this report** (checked 2026-10-11), so there is no wording change.

## Definition of Done
- [ ] **By-value tests shaped like TEST-092** (DB-unreachable; pin the query by value, or a pure counting function fed rows):
  - **27 Sep shape:** 4 lessons attended + 5 coach-hours ATTENDED + 1 child ABSENT ⇒ `attended 4`, `camp.childrenAttended 0`, `childrenAbsent 1`; the coach-hours appear nowhere;
  - **30 Sep shape:** 3 lessons + 12 coach-hours + 7 children ATTENDED ⇒ `attended 3`, `camp.childrenAttended 7`;
  - a GROUP seat counts, with a GROUP type row (R2);
  - SICK_LEAVE is in `onLeave`, NOT in `totalBooked` (R3);
  - a coach scope sees only its own.
- [ ] Mutation set `{tests, mutations}`:
  - coach-hours back in Attended (bites);
  - children not counted (bites);
  - GROUP dropped (bites);
  - leave back in Booked (bites);
  - scope ignored (bites).
- [ ] tsc · full suite with counts (the SAFE command above) · `unhandled-between-tests: 0`. Nothing committed.

## QA hand-off (after 723 + 724 are together on sid)
- **Tanya's TEST-092 dates are the after-fix recipe:**
  - 27 Sep ⇒ **Attended 4**, camp row 0 children;
  - 30 Sep ⇒ **Attended 3**, camp row **7**.
  - The screen and `/reports/daily` show the SAME numbers.

## Implementation Notes

## Questions

## Review
