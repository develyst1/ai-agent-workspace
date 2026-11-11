# SPEC-103: All Report: the REPORT · COURSE · STUDENT pages (Master Plan block 2.1, Revenue's report pages)
- REQ: REQ-120 §4 + §12 (owner 2026-11-07: *"เอาตามนั้น ทำตามก้อน"*, so REPORT · COURSE · STUDENT ship with Revenue) · owner delivery bar 2026-11-09 (sid by **17 Jan**)
- SA: Sector (Team C) · BE: Jason (lent via Sober) · FE: Flash · Status: **DRAFT ON DEFAULTS.** What each page shows is Khwan's to name (*"รายละเอียดของแต่ละรายงานจะขอคุยอีกครั้งตอนเริ่มทำส่วนนี้"*, 2026-10-14 P1). The defaults below go to her through Porter as one pack, and her answer amends this SPEC.
- Read, 2026-11-09:
  - CUSTOMER-ANSWERS l.266–270 (the six headings; "Reports = All Report");
  - the 10-13 confirm page P1 (her Excel's names for them: *"รายงาน/report · สต้อก · เข้าเรียน · คอร์สแยกประเภท · เงินครู · ทะเบียนนักเรียน"*. So **COURSE = คอร์สแยกประเภท** (courses by type) and **STUDENT = ทะเบียนนักเรียน** (the student register));
  - final UI TASK-753 (the six headings, each "content agreed when this part starts": no layout to carry);
  - BF `src/app/(admin)/reports/page.tsx` (a placeholder);
  - BB `src/db/schema.ts:830–861` (read-only `public` declarations) and `routes/api.ts` (mounts under `/v1`);
  - SB `src/db/schema.ts` (`parents` :123, `students` :170, `course_packages` :332 incl. `source` SALE|IMPORT :393, `vouchers` :429 incl. `source` :439, `bookings` :458 / `booking_status` :55).

## 1. Shape
- **One BF page, `/reports` ("All Report")**, with the six headings as tabs in her order: REPORT · STOCK · CHECK IN · COURSE · SALARY · STUDENT.
  - **This SPEC fills REPORT, COURSE and STUDENT.**
  - The other three are other blocks' and link to their pages: STOCK → `/stock/reports` (TASK-906, Team A); SALARY / CHECK IN → Salary's R1.8 / R1.7 pages (Team A/B).
- **BB: three read-only routes** under a new `reportsRoutes` mounted at `/v1/reports`.
  - They read SB's `public` tables through new narrow read-only declarations (the SPEC-021 rule: declare only the columns used; never write `public`) plus `bo.revenue_line`.
  - No migration, no write, no new table.
- **Access:** every route is behind `requirePaymentAccess` (CEO + admin; `middleware/revenue-access.ts:26`). **Money is CEO-only:** a money field is OMITTED (not zeroed) for an admin. That follows R0.3 (admin-blind pay) and the "Admin has no REVENUE menu" rule (TASK-753).
- **Dates:** Bangkok calendar dates, `from`/`to` inclusive, ≤ 366 days apart (as `GET /revenue/lines`). Display `dd/mm/yy`, no times.
- **Branch filter:** optional `branch=BRAVO|OTHER` on REPORT and COURSE (F1 columns, live since 0076).
- **Imports never count as sales:** `source = 'IMPORT'` rows are entitlements, not sales (the `course_packages.source` comment).

## 2. COURSE: "คอร์สแยกประเภท" (courses by type), DEFAULT
`GET /v1/reports/courses?from&to[&branch]` → `200 { rows: CourseRow[], totals: CourseTotals }`
- **One row per activity × kind × size:**
  - activity = `subjects.name`;
  - kind = `PRIVATE` | `DUO` (course: `co_student_id` NULL / set) | `VOUCHER`;
  - size = the course's `size` (4/6/10) or the voucher's `total_hours`.
- **`CourseRow` = `{ subjectId, subjectName, kind, size, sold, active, paused, ended, sessionsTaught, revenueMinor? }`:**
  - `sold`: SALE rows created in the window (Bangkok date of `created_at`);
  - `active`: as of `to`, not ended, not paused, with sessions left (course: `size − prior_sessions − used` > 0, using the plan's own rule; voucher: hours left > 0);
  - `paused`: `dropped_at` set and not ended, as of `to`;
  - `ended`: `ended_at` inside the window;
  - `sessionsTaught`: bookings `ATTENDED` in the window for that activity and kind;
  - `revenueMinor` (**CEO only**): the sum of `bo.revenue_line` COURSE/VOUCHER lines in the window whose source course/voucher falls in the row. Join through `ref_id`; lines with no source row are left out and counted in `totals.unmatchedRevenueMinor`.
- **Order:** activity name, then kind (PRIVATE, DUO, VOUCHER), then size.
- **`totals`:** the column sums, plus `unmatchedRevenueMinor?` (CEO).
- **Not in it:** trials, 1 HR singles, camps and ECA. Those aren't courses. REPORT counts trials. **Ask Khwan:** whether camp and ECA belong here.

## 3. STUDENT: "ทะเบียนนักเรียน" (the register), DEFAULT
`GET /v1/reports/students?[q][&status=ACTIVE|INACTIVE|ALL][&subjectId]` → `200 { rows: StudentRow[], counts: { active, inactive } }`
- **Default `status=ACTIVE`.** Archived students are never listed: the archive hides them everywhere (TASK-392).
- **`StudentRow` = `{ studentId, name, nickname, gender, birthDate, age, parentName, parentPhone, province, activities: string[], status, liveEntitlements, firstSeenOn, lastAttendedOn }`:**
  - `age` is derived from `birth_date` on today's Bangkok date;
  - `activities` = the distinct subjects of the student's live entitlements, or of all their bookings when none are live;
  - `status = ACTIVE` when the student has at least one live course or voucher (the same "active" rule as §2), otherwise `INACTIVE`;
  - `firstSeenOn` = `students.created_at` (Bangkok date);
  - `lastAttendedOn` = the latest `ATTENDED` booking date, or null.
- **`q`:** name, nickname or parent phone (a contains match; escape `%_`, as `escapeLike`).
- **Order:** name.
- **No money on this page.**
- **CSV export, BF side:** the visible rows and columns, UTF-8 with BOM (Excel opens Thai). Cells starting with `= + - @` are prefixed with `'` (formula-injection guard, as TASK-879).
- **Personal data:** names, a phone and a birth date of children and parents. Staff-only behind `requirePaymentAccess`; no caching headers beyond the default; nothing logged per row.

## 4. REPORT: "รายงาน" (the month overview), DEFAULT
`GET /v1/reports/overview?month=YYYY-MM[&branch]` → `200 { month, newStudents, activeStudents, trials, trialsConverted, coursesSold, vouchersSold, sessionsTaught, revenueMinor?, refundsMinor? }`
- `newStudents`: students created in the month.
- `activeStudents`: ACTIVE (§3) as of the month's last day, or today for the current month.
- `trials`: trial bookings dated in the month.
- `trialsConverted`: those trials whose student has a TASK-860 conversion link to a course or voucher sold within 60 days of the trial. **Ask Khwan** about the window.
- `coursesSold` / `vouchersSold`: SALE rows created in the month.
- `sessionsTaught`: `ATTENDED` bookings dated in the month (all kinds).
- **CEO only:**
  - `revenueMinor` = the month's non-REFUND `bo.revenue_line` sum;
  - `refundsMinor` = the REFUND sum (≤ 0).
  - Both use the same filter as `summary()` (`revenue-ledger.service.ts:252`). Reuse it; don't re-sum.
- **The FE also shows the previous month beside it** (a second call), with no chart.

## 5. TASKs
**Split 2026-11-09 (Porter: Brew stays home):**
- **TASK-924 (Brew):** the frame (`routes/reports.ts` with all three routes, `api.ts`, the `schema.ts` block), the shared `lib/reports-live.ts` "live" rule, and STUDENT.
- **TASK-926 (Jason):** COURSE + REPORT, in their own service files, on Brew's frame.
- **TASK-925 (Fanta, lent from Team B; split by Porter 2026-11-09):** the BF frame (tabs, service / types / hooks / fake for all three) + STUDENT + CSV.
- **TASK-927 (Flash, after TASK-906):** the COURSE + REPORT views, in their own folders, on Fanta's frame.

The block below is the original single-TASK plan, kept for the record.
- **TASK-A (BE, Jason, BB), about 2.5 days:**
  - new `src/routes/reports.ts` + `src/services/reports.service.ts` + tests;
  - one `.route("/reports", reportsRoutes)` line in `routes/api.ts`;
  - the extra read-only `public` columns in `schema.ts` (append-only block, never written);
  - the rbac/route-access enumeration pin, if one lists BB routes.
  - Step 0 maps every column above to its `file:line` and STOPS if any definition can't be computed from what exists.
- **TASK-B (FE, Flash, BF), about 2.5 days:**
  - `/reports` page with the six tabs (three linked), the REPORT / COURSE / STUDENT views;
  - the CSV export;
  - its service/types/hooks;
  - the role rule (no money for admin, by absence);
  - PAGE_RULES row(s).
  - Built against a typed fake first (off by default), then wired.

## 6. Risks / open
- **What each page shows is Khwan's** (P1). These are defaults. Her answers can add or remove columns. The routes are read-only, so a change is a field, not a migration.
- The active rule is one definition for COURSE and STUDENT. If she counts "active" differently (e.g. attended within N days), it changes in one place.
- Revenue per course row joins `revenue_line.ref_id` to the course/voucher id. Lines written before C1 (`MANUAL`) have no source, so they go to `unmatchedRevenueMinor`, never into a guessed row.

## 7. Amendments, 2026-11-09 (Sector, from Jason's step 0 on TASK-926; [SA-decided])
- **Live rule (§2, used by §3/§4):** not ended, not paused, sessions/hours left > 0, **and `expiry_date >= asOf`**. Vouchers have no `dropped_at`, so a voucher is never paused.
- **COURSE (§2):**
  - VOUCHER rows are **per size only** (`subjectId: null`, `subjectName: "Voucher"`); a voucher has no `subject_id`.
  - `paused` is always 0 for vouchers.
  - Kind: `co_student_id` set = DUO, else PRIVATE (group seats read PRIVATE; the question goes to Khwan).
  - The response gains **`activeIsApprox: boolean`**: true when `to` < today, because sessions/hours left are today's running count.
  - Revenue joins by `ref_type` + `ref_id`. CAMP / BOOKING / NULL refs go to `unmatchedRevenueMinor`; REFUND is excluded; the window is by `occurred_on`.
- **REPORT (§4):**
  - **`trialsBooked`** = FIRST_TRIAL in the month, not CANCELLED (new field);
  - `trials` = the ATTENDED ones;
  - `trialsConverted` ⊆ `trials` (`from_trial_booking_id`, SALE only, 60 days inclusive).
  - Money via `summary(monthEnd).mtd`.
- **Branch** applies to every count and to revenue.
- **Amended at the TASK-926 review (2026-11-09, [SA-decided]):**
  - `sessionsTaught` (§2 and §4) counts **lesson** bookings only (FIRST_TRIAL, SINGLE_SESSION, COURSE_PACKAGE, VOUCHER). OTHER and the GROUP slot row are excluded; group seats count as their COURSE_PACKAGE bookings.
  - `branch` doesn't filter student counts (`newStudents`, `activeStudents`): students have no branch.
