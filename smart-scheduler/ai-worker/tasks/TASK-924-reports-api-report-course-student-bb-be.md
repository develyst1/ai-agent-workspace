# TASK-924: All Report API, half 1 of 2: the frame + STUDENT + the shared "live" rule (backoffice-back), about 1.25 days
- Source: SPEC-103 (§1, §3 are the contract) · REQ-120 §4/§12 · block 2.1, sid by 17 Jan
- Owner: BE (**Brew**, Team C) · SA: Sector · Status: REVIEW · Depends on: none. **Half 2 = TASK-926 (Jason: COURSE + REPORT), and it builds on this TASK's frame + `lib/reports-live.ts`. Do steps 1–3 first and ring me, so Jason can start.**
- Split by Porter, 2026-11-09 (Brew stays home). Claims GRANTED (Porter, 2026-11-09; board line written).
- Repo: `smart-scheduler-backoffice-back` (BB), `dong`. **Base:** paste BB `bun test` (dummy URL) + pinned tsc first.
- Files (closed list, all yours alone):
  - new `src/routes/reports.ts`;
  - new `src/lib/reports-live.ts` + test;
  - new `src/services/reports-students.service.ts` + test;
  - `src/routes/api.ts`: one `.route("/reports", reportsRoutes)` line;
  - `src/db/schema.ts`: ONE append-only read-only block for the `public` columns that **both halves** read (SPEC-021 rule; never written);
  - the BB route enumeration / access pin, if one exists.
  - **Don't touch Jason's files** (`services/reports-courses.service.ts`, `services/reports-overview.service.ts`).
- No migration, no write. Git writes: none.

## Step 0 (Implementation Notes, file:line; STOP and ask if any fails)
For every field in SPEC-103 §2–§4 (both halves), name the SB column it reads. Then write the `schema.ts` block once, covering both halves:
- students, parents;
- course_packages (size, prior/used, source, ended/dropped, co_student, subject, branch, created_at);
- vouchers (total_hours + the hours-left rule, source, ended/dropped, subject, branch);
- bookings (status, booking type, date, subject, course/voucher id);
- the TASK-860 conversion link.

## What to do
1. **`src/routes/reports.ts`:** the three routes, all behind `requirePaymentAccess`, zod-validated (bad input → 400 `VALIDATION`, as the revenue routes):
   - `GET /reports/students` → your service;
   - `GET /reports/courses` → `reportCourses(q, role)` from `services/reports-courses.service.ts`;
   - `GET /reports/overview` → `reportOverview(q, role)` from `services/reports-overview.service.ts`.

   **Stub Jason's two** as files exporting the agreed signatures that return 501 until he fills them. He replaces the bodies; the routes don't change.
   - Role: pass `"ceo" | "admin"`, read as `revenue-access.ts` does. **Money keys are absent for admin**; each service owns that.
2. **`src/lib/reports-live.ts` (shared rule, SPEC-103 §2 "active"):**
   - `liveEntitlementsByStudent(asOf: string, d = db): Promise<Map<studentId, { count: number; subjectIds: string[] }>>`;
   - `isLiveCourse(row, asOf)` / `isLiveVoucher(row, asOf)`: not ended, not paused, sessions/hours left > 0. Reuse the plan's own "left" derivation (name it in step 0).
   - One grouped query. Jason's COURSE "active" and REPORT "activeStudents" import it.
3. **`schema.ts` block + `api.ts` line.** **→ Ring me here** (Jason starts on 1–3).
4. **STUDENT (SPEC-103 §3):** `reportStudents({ q, status, subjectId })`:
   - archived never listed;
   - `q` contains-match on name / nickname / parent phone with `escapeLike`;
   - `age` from `birth_date` on today's Bangkok date;
   - `status` from `reports-live`;
   - `lastAttendedOn` = the latest ATTENDED;
   - `counts { active, inactive }`.
   - A fixed number of queries, never one per student (say how many).

## Definition of Done
- [ ] Suite (dummy URL): no new fails. Pinned tsc: 0.
- [ ] Tests (DB-free): the live rule (ended / paused / used-up / voucher hours); STUDENT shape, `q` escaping, archived excluded, age, status, counts; each route's 400; the stubs answer 501 until filled.
- [ ] sid read-only proof (host first, read-only tx): ACTIVE / INACTIVE counts vs an independent SQL count. Counts only, no names.
- [ ] `git status --porcelain`: only the listed files. `/security-review` notes (personal data).

## Implementation Notes
(Brew, 2026-11-09. BB = `smart-scheduler-backoffice-back`, SB = `smart-scheduler-back`. All code BB src, uncommitted, no migration, no write.)
- **Base (before):** BB `bun test` (dummy URL) 1232 pass · 0 fail · 43 files; pinned tsc 5.9.2 exit 0; tree already had 107 uncommitted entries from other seats.
- **Step 0 — the column map** (Jason's TASK-926 §A is the full list and I checked it against SB; the SB lines are `src/db/schema.ts`):
  - `parents` :123: `phone`, `name`, `province` :141.
  - `students` :170: `name`, `nickname`, `parent_id`, `gender`, `birth_date`, `archived_at` (not `archived`), `created_at`.
  - `course_packages` :332: `student_id`, `co_student_id` :341 (DUO), `size` :344, `subject_id` :348, `used_sessions` :349, `prior_sessions` :354, `ended_at` :362, `dropped_at` :370 (paused), `expiry_date` :389, `source` :393, `from_trial_booking_id` :396, `branch` :402, `created_at` :410.
  - `vouchers` :429: `total_hours` :434, `used_hours` :437, `expiry_date` :438, `source` :439, `created_at` :440, `ended_at` :442, `from_trial_booking_id` :446, `branch` :450. **No `subject_id`, no `dropped_at`** (Sector's amendment already rules this).
  - `bookings` :458: `student_id`, `subject_id`, `date` :471, `booking_type` :474, `status` :475, `course_id` :477, `voucher_id` :480, `branch` :521.
  - Nothing in §2–§4 failed to map, so there was no STOP.
- **The plan's own "left" derivation, named (mirrored by value, BB cannot import SB):** course left = `size − prior_sessions − used_sessions` (SB `lib/course-plan.ts:416 courseOwedTarget` → plan size; ended = `ended_at` set, `:375 isCourseEnded`; paused = `dropped_at` set, `:382 isCourseDropped`); voucher left = `total_hours − used_hours`, floored at 0 (SB `lib/voucher.ts:34 voucherRemaining`; ended = `ended_at` set, `:31 isVoucherEnded`). Live also needs `expiry_date >= asOf` (Sector's amendment).
- **Files:**
  - `src/db/schema.ts`: ONE appended block, `rpParents / rpStudents / rpSubjects / rpCourses / rpVouchers / rpBookings`. New names, so the existing `pub*` block (other seats' tests pin it) is untouched. Enum columns are read as text. It covers both halves.
  - `src/lib/reports-live.ts` (+ `.test.ts`): `isLiveCourse`, `isLiveVoucher`, `courseLeft`, `voucherLeft`, and `liveEntitlementsByStudent(asOf, d = db)` as ONE grouped query (a UNION ALL of live courses, the DUO co-student, and live vouchers with their bookings' subjects; `count(distinct entitlement)` and the distinct subject ids per student). A DUO course is live for BOTH children (my reading: both are entitled; flag if you disagree).
  - `src/routes/reports.ts`: three routes behind `requirePaymentAccess`, zod 400 `VALIDATION` as the revenue routes. `status` defaults to ACTIVE; `courses` needs real dates, `from ≤ to`, ≤ 366 days (`MAX_RANGE_DAYS`); `overview` needs `YYYY-MM`; `branch` is BRAVO|OTHER. The role is passed on as `"ceo" | "admin"` (anything that is not ceo → admin; a coach never gets past the gate).
  - `src/routes/api.ts`: one import + one `.route("/reports", reportsRoutes)` line.
  - `src/services/reports-students.service.ts` (+ `.test.ts`): STUDENT. `reportStudents(q, { store?, now? })` behind a small `StudentsStore` seam so the shape is DB-free testable.
  - `src/routes/reports.test.ts`: the gate, each route's 400s, the defaults, the range edge.
  - Stubs `reports-courses.service.ts` / `reports-overview.service.ts` were created as 501 stubs for Jason, who has since replaced them (TASK-926). I did not touch them again.
- **STUDENT queries: FOUR, fixed** (students ⨝ parents with the optional `q`; `liveEntitlementsByStudent`; one grouped bookings aggregate for subjects + latest ATTENDED date; subject names). Pinned by a test with 500 students → exactly 4 reads.
- **Decisions you can overrule (each one line):**
  1. `counts` follow `q` and `subjectId`, NOT the status tab, so the tabs show both numbers. `subjectId` matches the student's shown `activities`.
  2. `activities` = the live entitlements' subjects when any is live (a voucher-only student therefore shows none, since a voucher has no subject unless it has bookings), else every subject ever booked.
  3. `q` is trimmed, escaped (`\ % _`), `ilike` on name / nickname / parent phone; empty `q` = no filter.
  4. Order: `name`, then `id`. It is Postgres's collation order (the sid DB's), not a JS byte order.
  5. The old unmounted P&L `reportRoutes` stub in `routes/reports.ts` was replaced (Sector already accepted this above).

## Questions
- None blocking. (For Khwan, via Porter, already in SPEC-103 §6: "active" definition; whether a DUO's second child counts as active — I count it.)

## Review (Brew, 2026-11-09 — status REVIEW)
- **Suite (dummy URL):** after: **1308 pass · 0 fail · 47 files** (base 1232/0/43); no new fail, and the full count includes other seats' new files. **Pinned tsc 5.9.2: exit 0.** (Mid-run there was one red from another seat's TASK-922 file and one tsc error in my own `reports.test.ts` after Jason loosened its 501 asserts; both were gone on the final run.)
- **Tests (DB-free), mine: 38 in the 3 files:**
  - the live rule: ended / paused / used-up (0 and negative) / voucher hours / expiry == asOf in and the day before out; the SQL restates the rule (pinned as text, no `v.dropped_at`, no insert/update/delete);
  - STUDENT: every key of the row (14), no money in the JSON, age on a birthday today / tomorrow / future / garbled, `firstSeenOn` on the Bangkok date, status, counts, activities (live vs fallback vs none), subject filter, `q` escaping, archived excluded (pinned in the source), exactly 4 reads, today = Bangkok;
  - routes: no token 401, coach 403, ceo and admin pass; each route's 400s; the 366-day edge.
  - The "stubs answer 501" test passed when written; Jason has since loosened it to "reached the service" because his real services replaced them.
- **Mutation set (in place, restore, hash identical on all 3 files): 38 mutants, 37 run, 37 killed, 0 survivors; 1 not run** (a bad anchor on my own sort-removal mutant; the sorted-subjects test would kill it).
- **sid read-only proof** (`students924-sid.ts`; host `154.197.124.206` checked first; the session forced `default_transaction_read_only=on`; counts only):
  - independent SQL (an EXISTS per student, different shape from the grouped query): active **42** · inactive **154** · total non-archived **196**;
  - the service: ALL 196 rows, ACTIVE 42, INACTIVE 154, counts `{active 42, inactive 154}` → **MATCH: true**;
  - archived students on sid: 35, **listed by the service: 0**;
  - students with a `lastAttendedOn`: service 60 · independent SQL 60 → **MATCH**.
  - (My script's "sorted by name" JS check printed false: it compares bytes, while the SQL orders by the DB collation; the SPEC says "order by name" and this is that. Not a defect.)
- **`git status --porcelain` (BB), my files only:** `M src/db/schema.ts` · `M src/routes/api.ts` · `M src/routes/reports.ts` · `?? src/lib/reports-live.ts` · `?? src/lib/reports-live.test.ts` · `?? src/routes/reports.test.ts` · `?? src/services/reports-students.service.ts` · `?? src/services/reports-students.service.test.ts` · plus the two stubs (now Jason's). The other `??`/`M` entries in the tree are other seats'.
- **/security-review notes (personal data):**
  - children's names, a parent's name and phone, a birth date and a province leave the API; every route is behind `requirePaymentAccess` (ceo + admin; coach 403, no token 401), tested;
  - nothing is logged per row (the service has no logging at all); no money on this page (a test fails if `minor|revenue|amount` appears in the JSON);
  - `q` is a bound parameter after `escapeLike`, never concatenated; the UNION query binds `asOf`; `subjectId` is zod-uuid;
  - no caching headers were added (the default); the response is not cacheable by a shared proxy only if the app's default says so, which I did not change;
  - read-only: no insert / update / delete anywhere (pinned by two source tests); the `rp*` tables are never written or migrated.
- **No migration**, so the journal `when` rule does not apply. No git was run.

**Amendment (Sector, 2026-11-09, from Jason's step 0 on TASK-926):** the shared live rule in `lib/reports-live.ts` also requires **`expiry_date >= asOf`** (an expired course or voucher isn't live). Vouchers have **no `subject_id`** and **no `dropped_at`** (SB `schema.ts:429–450`), so a voucher is never "paused". `activities` for a voucher come from its bookings' subjects. Jason's full column map is in TASK-926 §A. Use it for the `schema.ts` block so both halves are covered.
- **Noted at the steps 1–3 ring (Sector, 2026-11-09):** `routes/reports.ts` was a tracked old P&L stub (`reportRoutes` → `GET /pl`). **It was never mounted at HEAD** (`git grep reportRoutes` finds only its own file; HEAD `api.ts` has no reports route), so BF's `getPLReport` / `usePLReport` were already getting a 404. Replacing it changes nothing live, so it's accepted. `services/reports.service.ts` (`getPLReport`) stays untouched. If a P&L page is ever wanted, it's a new route then. I'll list this in the review.

## Review (Sector, 2026-11-09): ✅ DONE
- **Re-run by me** (SAFE dummy URL, the shared BB tree incl. other teams' uncommitted work): **1325 pass · 0 fail**. Pinned tsc 5.9.2: 0.
- **`lib/reports-live.ts`, read whole:**
  - LIVE = not ended, not paused (courses only), left > 0, `expiry_date >= asOf`;
  - the predicates mirror SB by value (`isCourseEnded` / `isCourseDropped` / `courseOwedTarget` / `voucherRemaining`, cited);
  - ONE grouped SQL: DUO live for both children, a voucher's subjects from its bookings, `count(distinct eid)`.

  As SPEC-103 §7.
- **`reports-students.service.ts`, read whole:**
  - 4 fixed queries behind a `StudentsStore` seam;
  - archived excluded;
  - `q` LIKE-escaped (`escapeLike`), matching name / nickname / parent phone;
  - `ageOn` handles a missing, garbled or future date as null;
  - status from the live rule;
  - activities = the live subjects, else everything ever booked;
  - `lastAttendedOn` from ATTENDED;
  - no money.
- **Your 3 decisions, accepted:**
  - counts follow `q` + `subjectId`, not the status tab (so the tabs can show both numbers);
  - a DUO course is live for both children;
  - name order = Postgres collation.
- **The sid read-only proof is accepted:** active 42 / inactive 154 / 196 non-archived = independent SQL; archived 0; lastAttended 60 = 60. Counts only.
- The old unmounted P&L `reportRoutes` stub was replaced. Nothing live changed (noted above).
- Security review: STUDENT carries children's names, birth dates and a parent's phone to staff only (`requirePaymentAccess` + the BF page rule); parameterised SQL; nothing logged per row; no money. **None.**
