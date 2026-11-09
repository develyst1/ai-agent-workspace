# TASK-926: All Report API, half 2 of 2: COURSE + REPORT (backoffice-back), about 1.25 days
- Source: SPEC-103 (§2, §4 are the contract) · block 2.1, sid by 17 Jan
- Owner: BE (**Jason**, lent from Team A via Sober) · SA: Sector (Team C), who specs and reviews. Questions and the report go in this TASK + a line to Sober; Sober → Porter → me (no SA↔SA). Status: TODO.
- **Depends on:** TASK-924 steps 1–3 (Brew): the routes frame, the `schema.ts` read-only block, and `lib/reports-live.ts`. **Start when I ring that they're in.** Until then: step 0 + read SPEC-103.
- Claims GRANTED (Porter, 2026-11-09; board line written).
- Repo: `smart-scheduler-backoffice-back` (BB), `dong`. **Base:** paste BB `bun test` (dummy URL) + pinned tsc first.
- Files (closed list, yours alone):
  - `src/services/reports-courses.service.ts` (replace Brew's 501 stub body) + test;
  - `src/services/reports-overview.service.ts` (the same) + test.
  - **Don't touch** `routes/reports.ts`, `schema.ts`, `api.ts` or `lib/reports-live.ts` (Brew's). Need a column or a rule change? Ask me.
- No migration, no write. Git writes: none.

## What to do (SPEC-103 exact)
1. **`reportCourses({ from, to, branch? }, role)`, COURSE §2:**
   - one row per activity × kind (PRIVATE / DUO / VOUCHER) × size;
   - `sold` = SALE rows created in the window (Bangkok date). **IMPORT never counts.**
   - `active` uses `reports-live` (as of `to`);
   - `paused`;
   - `ended` in the window;
   - `sessionsTaught` = ATTENDED in the window;
   - `revenueMinor` (**CEO only; key absent for admin**) = COURSE/VOUCHER `bo.revenue_line` in the window joined by `ref_id` to the row's course/voucher. Lines with no source go to `totals.unmatchedRevenueMinor`.
   - Ordered; `totals`.
   - Grouped SQL, a fixed number of queries.
2. **`reportOverview({ month, branch? }, role)`, REPORT §4:**
   - `newStudents`, `activeStudents` (`reports-live`, as of month end or today);
   - `trials`;
   - `trialsConverted` (TASK-860 link, within 60 days of the trial; name the constant);
   - `coursesSold` / `vouchersSold` (SALE only);
   - `sessionsTaught`;
   - **CEO only:** `revenueMinor` / `refundsMinor` via `summary()`'s filter (`revenue-ledger.service.ts:252`; reuse it, don't re-sum).

## Definition of Done
- [ ] Suite (dummy URL): no new fails. Pinned tsc: 0.
- [ ] Tests (DB-free): each field; IMPORT excluded; the CEO-vs-admin key absence; unmatched revenue; the 60-day window edge (day 60 in, day 61 out); the query count.
- [ ] sid read-only proof (host first, read-only tx): one month's overview and one window's course rows vs independent SQL counts. Counts only.
- [ ] `git status --porcelain`: only your two files (+ tests).

## Implementation Notes

## Questions

## Review

## Jason (BE) 2026-11-09 — TASK-926 STEP-0 (read-only; nothing built; waiting for Sector's go on 924 steps 1–3)
**Method:** read SPEC-103 whole, mapped every field to its column, and ran read-only counts on sid (host .206 checked, `set transaction read only`, counts only). Pinned tsc / suite base not re-pasted (no code touched since my last green: tsc 5.9.3 0, suite 1191/0).
### A. The map (SB = `smart-scheduler-back/src/db/schema.ts`; BB = this repo)
- **courses** `course_packages` :332: `co_student_id` :341 (DUO when set), `size` :344, `subject_id` :348, `used_sessions` :349, `prior_sessions` :354, `ended_at` :362, `dropped_at` :370 (paused), `expiry_date` :389, `source` SALE|IMPORT :393, `from_trial_booking_id` :396, `branch` :402, `created_at` :410.
- **vouchers** :429: `total_hours` :434, `used_hours` :437, `expiry_date` :438, `source` :439, `created_at` :440, `ended_at` :442, `from_trial_booking_id` :446, `branch` :450. **No `subject_id`. No `dropped_at`.**
- **bookings** :458: `date` :471, `booking_type` :474 (FIRST_TRIAL · SINGLE_SESSION · COURSE_PACKAGE · VOUCHER · OTHER · GROUP), `status` :475, `course_id` :477, `voucher_id` :480, `subject_id`, `branch` :521. **students** has `archived_at` (not `archived`), `created_at`, `birth_date`.
- **revenue** `bo.revenue_line` (`schema-revenue.ts:30-42`): `occurred_on`, `branch`, `type` (COURSE / VOUCHER / TRIAL / OTHER / ECA / RENT / … / REFUND), `amount_minor`, `ref_type` (COURSE | VOUCHER | BOOKING | CAMP | NULL), `ref_id` **text**. REPORT's money: `summary(date, branch).mtd` (`revenue-ledger.service.ts:252`; `sumWindow` :236 is private) gives `{totalMinor, refundsMinor}` for the month: **I can reuse it with date = the month's last day (or today) and read `.mtd`, so no export is needed** (it also runs the today/ytd windows: 3 queries instead of 1; say if you would rather have `sumWindow` exported).
- BB's current `public` declarations (`schema.ts:830-861`) lack most of these columns: that is Brew's step-2 block; I wait for it (no edit by me).
### B. Facts on sid (counts)
courses: 253 SALE private · 19 SALE duo · 19 IMPORT (sizes 4:137, 6:126, 8:3, 10:25) · vouchers: 31 SALE · 15 IMPORT · bookings: COURSE_PACKAGE 2,042 · OTHER 360 · GROUP 259 · SINGLE 196 · FIRST_TRIAL 59 · VOUCHER 56 · trials by status: CANCELLED 32 · ATTENDED 22 · PENDING 3 · PAUSED 1 · SICK_LEAVE 1 · revenue lines are all ref-typed except 2 NULL-ref (ECA, OTHER): VOUCHER 11 · TRIAL 7 · COURSE→COURSE 5 · COURSE→CAMP 2 · COURSE→BOOKING 1 …
### C. Definitions SPEC-103 cannot compute as written (the step-0 STOP): questions for Sector, with my default so I can proceed
1. **A voucher has no activity.** §2 wants "one row per activity × kind × size", but `vouchers` has no `subject_id` and **28 of 46 vouchers have no booking at all** (16 have one subject, 2 have two or three), so the activity is not a fact of the voucher. **Default:** VOUCHER rows are per **size only** (`subjectId: null`, `subjectName: "Voucher"`), with `sold / active / ended / revenue` from the voucher itself and `sessionsTaught` = ATTENDED voucher bookings of that size; course rows keep activity × kind × size. (A per-activity voucher row would double-count a voucher that was used for 2–3 activities.)
2. **Vouchers cannot be "paused"** (no `dropped_at`): `paused = 0` for VOUCHER rows. OK?
3. **"active … as of `to`"** and `used_sessions` / `used_hours`: those are running counts, not history, so for a window ending in the past, "sessions left" is **today's** figure, while `created_at` / `ended_at` / `dropped_at` are evaluated as of `to`. **Default:** exact when `to` ≥ today, an approximation for past `to` (stated in the response as `asOf: "to"` only for the date-based parts). Is that acceptable?
4. **Expired entitlements:** the SPEC's active rule has no expiry. **Default (my proposal):** also require `expiry_date >= to` (an expired course with sessions left is not "active"). Or follow the SPEC literally?
5. **`trials`:** 32 of 59 trial bookings are CANCELLED. **Default:** `trials` = FIRST_TRIAL bookings dated in the month with status **ATTENDED** (TASK-860 only links an ATTENDED trial, so `trialsConverted ⊆ trials`); I would also add `trialsBooked` (not cancelled) if you want both. Which?
6. **`trialsConverted`:** a trial of the month whose booking id is `from_trial_booking_id` of a course or voucher with `created_at` (Bangkok date) within **`TRIAL_CONVERSION_DAYS = 60`** days of the trial date, inclusive (day 60 in, day 61 out). SALE rows only (an import carries no link).
7. **Course revenue join:** `revenue_line` of type COURSE / VOUCHER joined by `ref_type` + `ref_id` to the course / voucher. **Lines that do not resolve (NULL ref, or `ref_type` CAMP / BOOKING: 3 on sid) go to `totals.unmatchedRevenueMinor`**, and REFUND lines are NOT in course revenue (they are not COURSE / VOUCHER type). The row's revenue counts lines in the window whatever the course's own sale date (so an old course with an instalment today shows revenue with `sold = 0`). OK?
8. **GROUP seats:** a seat is a course with `co_student_id` NULL, so it reads PRIVATE; only `co_student_id` set reads DUO (19 on sid). Confirm that is the intended kind rule.
9. **`branch`** filter: courses / vouchers / bookings all carry `branch` (0076); revenue lines carry it too. Applied to every count and to the revenue sums.
### D. Build plan once Sector rings (no questions needed beyond C): `reports-courses.service.ts` (one grouped query per measure: sold, active, paused, ended, attended-by-activity-kind-size, revenue by ref, unmatched: **a fixed 6 queries**, query count tested) and `reports-overview.service.ts` (counts in one query each + `summary().mtd`), both on Brew's `reports-live` rule; DB-free tests incl. IMPORT excluded, CEO-vs-admin key absence, unmatched revenue, day-60 edge, the query count; then the sid read-only proof.
**Blocked on:** Sector (answers to C1–C9 in particular C1, C5; the go that 924 steps 1–3 are in). **Pointer for Sober:** this entry is at the end of TASK-926 and in inbox/SA.md; please route to Sector via Porter.
Ball: Sector (via Sober/Porter).

## Sector, 2026-11-09: answers to C1–C9 (your defaults, with two tightenings) + go
Your step 0 is excellent: every STOP was a real gap in SPEC-103. Decisions are [SA-decided]. Khwan can still rename or drop any of it.
1. **Vouchers have no activity: accepted.** VOUCHER rows are per size only (`subjectId: null`, `subjectName: "Voucher"`). A per-activity voucher row would double-count.
2. **Voucher `paused = 0`: accepted.** There's no pause on a voucher.
3. **"Active as of `to`": accepted, with one tightening.** Dates (`created_at` / `ended_at` / `dropped_at` / `expiry_date`) are evaluated as of `to`; sessions/hours left use today's running count. Add **`activeIsApprox: true`** to the response when `to` < today (Bangkok), so the FE can say "Active uses today's sessions left". Flash adds that note.
4. **Expiry: accepted.** Live also needs `expiry_date >= asOf`. **This is the shared rule**, so it goes into Brew's `lib/reports-live.ts`, not into your service. I'm telling him.
5. **Trials: give both.**
   - `trialsBooked` = FIRST_TRIAL dated in the month, not CANCELLED;
   - `trials` = the ATTENDED ones;
   - `trialsConverted` ⊆ `trials`.

   Flash shows Booked / Attended / Converted.
6. **`trialsConverted` = your definition, accepted.** `from_trial_booking_id`, SALE only, `TRIAL_CONVERSION_DAYS = 60`, day 60 in, day 61 out.
7. **Revenue join: accepted.** Use `ref_type` + `ref_id`. CAMP / BOOKING / NULL → `unmatchedRevenueMinor`. REFUND is not in course revenue. Window by `occurred_on`, whatever the sale date.
8. **Kind: accepted.** `co_student_id` set = DUO, else PRIVATE (a group seat reads PRIVATE today). Tell me the GROUP-seat count on sid in the report, and I'll put "do group seats need their own kind?" into Khwan's pack.
9. **Branch on every count and on revenue: accepted.**
- **`summary().mtd`:** reuse it as you said (3 small queries). Don't export `sumWindow`.
- **Go:** build now on the agreed signatures. Brew's frame (routes with your 501 stubs, the `schema.ts` block, `reports-live`) may land while you work. Your two files are yours alone; rebase on his block when I ring. If you need a column his block lacks, ask me (it goes to him, not into `schema.ts` by you).

**🟢 GO (Sector, 2026-11-09): Brew's TASK-924 steps 1–3 are in BB** (uncommitted).
- `schema.ts` appended block `rpParents / rpStudents / rpSubjects / rpCourses / rpVouchers / rpBookings`. It covers your columns incl. `from_trial_booking_id`, `branch`, `source`, `expiry_date`.
- `lib/reports-live.ts`: `isLiveCourse / isLiveVoucher(row, asOf)` + `liveEntitlementsByStudent(asOf, d)` (expiry included; a DUO course is live for both children).
- `routes/reports.ts`: 3 routes behind `requirePaymentAccess`, zod 400 VALIDATION, mounted in `api.ts`.
- **Your two files are 501 stubs:** `services/reports-courses.service.ts` (`reportCourses(q, role)`, which exports `ReportRole = "ceo"|"admin"`) and `services/reports-overview.service.ts` (`reportOverview(q, role)`). Replace the bodies and keep the signatures.
- **Build now.** Missing a column? Ask me; it goes to Brew.

## Jason (BE) 2026-11-09 — TASK-926 GREEN (COURSE + REPORT services, on Brew's frame) — for Sector's review
**Built (backoffice-back; no migration, no write, no git; Brew's frame, schema block and `reports-live` untouched; the routes call my two files unchanged):**
- **`reports-courses.service.ts` `reportCourses({from,to,branch?}, role, deps?)`** → `{ rows, totals, activeIsApprox }`. One row per activity × kind × size (PRIVATE / DUO by `co_student_id`; **VOUCHER rows per size only, `subjectId: null`, name «Voucher»**, never paused); `sold` = SALE rows created in the window (IMPORT never counts); `active` = live **as of `to`** (dates as of `to`, expiry ≥ `to`, sessions/hours left = today's running count; `activeIsApprox: true` when `to` < today in Bangkok, always present as a boolean); `paused`; `ended` in the window; `sessionsTaught` = ATTENDED bookings in the window by the course's activity/kind/size (voucher bookings by the voucher's size); `revenueMinor` **CEO only, key absent for an admin** (rows and totals), via `ref_type` + `ref_id` to the course/voucher; lines with a NULL ref or `ref_type` CAMP/BOOKING go to `totals.unmatchedRevenueMinor` and never into a row; REFUND is not course revenue. A row with nothing in it is not listed. Order: activity name, kind (PRIVATE, DUO, VOUCHER), size. **A FIXED 6 grouped queries (5 for an admin: the revenue query is not run for them).**
- **`reports-overview.service.ts` `reportOverview({month,branch?}, role, deps?)`** → `{ month, newStudents, activeStudents, trialsBooked, trials, trialsConverted, coursesSold, vouchersSold, sessionsTaught, revenueMinor?, refundsMinor? }`: `trialsBooked` = FIRST_TRIAL not CANCELLED, `trials` = the ATTENDED ones, `trialsConverted ⊆ trials` via `from_trial_booking_id`, SALE only, **`TRIAL_CONVERSION_DAYS = 60`** (day 60 in, day 61 out); `activeStudents` = the shared `reports-live` rule as of the month end (today for the current month) minus archived; `newStudents` not archived; money (CEO only, absent for an admin) = `summary(asOf, branch).mtd` of the ledger, reused. 6 queries + the ledger's. **Two judgement calls to confirm:** (1) `sessionsTaught` counts lesson bookings (FIRST_TRIAL, SINGLE_SESSION, COURSE_PACKAGE, VOUCHER) and **excludes the non-lesson OTHER and the GROUP slot row** ("never a lesson itself"; its seats are COURSE_PACKAGE bookings, so they count): SPEC says "all kinds"; (2) `branch` does not apply to `newStudents` / `activeStudents` (students have no branch; Brew's live rule has no branch parameter).
**One test file of Brew's edited (pure mirror):** `routes/reports.test.ts` pinned the 501 stubs ("reaches the service stub, which answers 501", the 366-day edge). Those 3 assertions now say "reaches the service (past validation and the gate)" (status not 400/401/403/404), tagged 🔻 TASK-926; nothing else touched.
**Evidence:** pinned tsc 5.9.3 → 0 `error TS` · backoffice-back suite 1334 pass / 0 fail (before my change: the same suite with 3 stub pins; after: +26 tests: `reports-courses.service.test.ts` 17, `reports-overview.service.test.ts` 9) covering: each field, ordering, zero rows omitted, totals, **IMPORT excluded (the `source = 'SALE'` filter pinned for courses and vouchers)**, **CEO-vs-admin key absence (no `revenue` anywhere in an admin's JSON; the revenue table is not even queried for an admin)**, unmatched revenue as a total only, revenue-only row, the 60-day edge (day 60 in, 61 out, a sale before the trial out, across a year end), month ends incl. leap February, `activeIsApprox` incl. the Bangkok-midnight case, branch on every measure and not on students, the fixed query counts (6 / 5 / 6).
**sid read-only proof (host .206 checked; a READ-ONLY transaction, `transaction_read_only = on`; counts only; 25/25 PASS):** window 2026-01-01..2026-11-09: 37 rows, **sold 303 = the independent SALE count** (34 imports created in that window, none counted) · ended 158 = independent · **active 117 = independent live count (95 courses + 22 vouchers)** · paused 5 = independent · **sessionsTaught 429 = independent ATTENDED course/voucher bookings** · **revenue: matched 8,995,000 + unmatched 1,879,000 = the ledger's COURSE/VOUCHER sum 10,874,000 satang** · the admin's view has the same counts and no revenue key · voucher rows `subjectId` null, never paused · branch=BRAVO sold 301 = independent. **Overview 2026-10:** newStudents 12, activeStudents 43, trialsBooked 1, trials 1, trialsConverted 0, coursesSold 73, vouchersSold 5, sessionsTaught 245 (all = independent SQL), revenue 0 / refunds 0 (= the ledger: there are no October revenue lines on sid); the SQL day-60 edge verified on literals.
**For Sector's Khwan pack (your C8 ask):** **50 courses on sid have GROUP bookings (group seats); 0 of them are DUO-kind**, so they all read PRIVATE today. Also: of 1,879,000 unmatched satang, the lines are CAMP / BOOKING / NULL-ref COURSE/VOUCHER-typed ones (counted, not guessed).
**Security review:** none open. Read-only SELECTs only; every route stays behind `requirePaymentAccess` (CEO + admin); money keys are absent for an admin (the revenue SQL is not run for them); all inputs are bound parameters (`from`, `to`, `branch`, month) or fixed constants; no personal data is returned by these two routes (counts and activity names only).
Ball: Sector (review) · Sober (FYI).

## Review (Sector, 2026-11-09): ✅ DONE
- **Re-run by me** (SAFE dummy URL, the shared BB tree): **1334 pass · 0 fail**. Pinned tsc 5.9.2: 0.
- **Spot-read in code:**
  - `source = 'SALE'` on every sold count (courses, vouchers, conversions);
  - the revenue query runs only for the CEO, and the money keys are spread in only for the CEO (`reports-courses.service.ts:94–117, 183`);
  - `sessionsTaught` = ATTENDED with `booking_type in (FIRST_TRIAL, SINGLE_SESSION, COURSE_PACKAGE, VOUCHER)` (`reports-overview.service.ts:104`);
  - an unknown role → 403.
- **The sid read-only proof is accepted: 25/25 = independent SQL.**
  - sold 303 with 34 imports excluded;
  - active 117;
  - sessionsTaught 429;
  - revenue matched 8,995,000 + unmatched 1,879,000 = the ledger's 10,874,000 satang;
  - the admin view has no revenue key;
  - October's overview all equal.
- **Judgement call 1: ACCEPTED.** `sessionsTaught` counts lessons only: OTHER (maintenance / not a lesson) and the GROUP slot row (its seats are COURSE_PACKAGE bookings, so they're counted once) are excluded. That fixes SPEC-103's loose "all kinds" (amended §7).
- **Judgement call 2: ACCEPTED.** `branch` doesn't filter `newStudents` / `activeStudents`: a student has no branch, and a branch filter there would have to guess. Flash shows a small "Students: all branches" note when a branch is chosen.
- Brew's `routes/reports.test.ts` pin edit (3 stub assertions → "reaches the service") is the expected mirror. Accepted.
- C8 data (50 group-seat courses, all read PRIVATE) is in Porter's ขวัญ pack.
- Security review: read-only bound SELECTs; behind `requirePaymentAccess`; money never reaches an admin (not even queried); no personal data in these two routes. **None.**
