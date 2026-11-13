# TASK-861 — BE + FE: REQ-120 **F5: a "No Teacher" teacher for park-fee blocks** — @Bob (BE, smart-scheduler-back ≈ 1.8 d) + @Fanta (FE, smart-scheduler-front ≈ 1.0 d) — REQ-120 wk 1
**From @Silver, 2026-11-08. BUILD GO (owner, REQ-120 §14).** Size 2.8 d (`SIZING-REQ-120-revenue-frontoffice-2026-10-15.md` F5; DELIVERY-FACTS 11-05: F5 goes ahead of Revenue, with F4). Branch `dong` in both repos. **No git command: git only on the owner's word.**
**Order:**
- **Bob starts after TASK-860 is reported.** It's the same tree, one mutation set at a time.
- **Fanta starts now,** against the contract in §1. She checks against the live API once Bob's half is on her local back.

## Why
- A park-fee block (a slot rented to an outside party, no lesson) must sit on the calendar, as an `OTHER` booking with a price, without any coach owning it.
- Today every booking needs a teacher (`bookings.teacher_id` NOT NULL), so staff put a real coach on it. That counts as his teaching hours and inflates Extra Hour and his workload. Salary needs that gone before its hours reader exists.
- **F5 = one system teacher, excluded from everything that measures, pays or messages a coach.** The 10-15 sizing names the risk: "No Teacher" **leaks** into every teacher list, report and LINE path unless every one excludes it.

## 1. The contract (both halves build to it)
- **Data:** `teachers.is_system` boolean NOT NULL DEFAULT false.
  - Exactly one row has it true, enforced by a partial unique index.
  - That row: `name = 'No Teacher'`, `nickname = 'No Teacher'`, `type = 'FREELANCE'`, `active = true`, `archived = false`, `line_user_id` null.
- **The DTO:** every teacher DTO the API returns gains **`isSystem: boolean`** (in `src/types/contract.ts`).
- **The booking rule:**
  - only `booking_type = 'OTHER'` may use the system teacher;
  - every other type (`FIRST_TRIAL`, `SINGLE_SESSION`, `COURSE_PACKAGE`, `VOUCHER`, camp hours) is refused with **400, code `SYSTEM_TEACHER_NOT_BOOKABLE`**.
  - **The refusal's message:** reuse an existing approved refusal string. If none fits, stop and tell me (no new words).
- **The system teacher can't be edited, archived, paused, linked to LINE or given leave.** Each such write returns **409, code `SYSTEM_TEACHER`**, with the same rule for its message.

## 2. Bob: BE (`smart-scheduler-back`)
**a. One additive migration:**
- add the column and the partial unique index, and insert the one row: `INSERT … WHERE NOT EXISTS (… is_system)`, so a re-run inserts nothing;
- **through `MIGRATION-QUEUE.md`,** exactly as TASK-860 §1: `db:generate` on top of the latest `dong`, append `applying`, `db:migrate`, append `applied · verified`;
- 🚫 never `db:seed` / `db:push` / `db:reset` on sid.

**b. The guard:** add `assertTeacherBookable`-style checks at every booking insert / teacher-change path that takes a `teacherId` for a lesson.
- The TASK-838 act, a single-session teacher change and the plan / create paths all refuse the system teacher.
- `OTHER` creation (`other-series.service.ts` and the single OTHER create) accepts it.

**c. Exclusion walk.** Each file below reads `teachers`. For each one, either exclude `is_system` or write one line on why it can't reach the system teacher. **Put the table in your report, every row.**
| file | what to check |
|---|---|
| `scheduler.service.ts` | `getTeachers` (l.625) **returns it with `isSystem: true`** (the front places it). Availability, type-order, the teacher write paths ⇒ `SYSTEM_TEACHER`. |
| `calendar.service.ts` | the system teacher's OTHER rows show; it never appears in a lesson-availability answer |
| `daily-report.service.ts` | excluded from `byTeacher` and from every hours total |
| `som-contract.service.ts` | excluded from coach counts and capacity (TASK-756's per-type capacity) |
| `jobs.service.ts` | excluded from the daily reminder, the weekly teacher digest and the day-end teacher notices. **Its OTHER rows still settle at day-end like any OTHER.** |
| `attention.service.ts` | no attention item about it |
| `camp.service.ts`, `checkin.service.ts`, `teacher-leave.ts` | never a camp coach, never checks in, never has leave |
| `line-*.ts`, `line-webhook.service.ts`, `line-admin-links.service.ts`, `teacher-link.service.ts`, `line-menu-users.ts`, `line-lang.ts` | never linked, never messaged |
| `own-scope.ts`, `user.service.ts` | never a sign-in identity |
| the freelance ceiling (`bo.item` with `metadata.kind = 'FREELANCE_CEILING'`, `scheduler.service.ts` ~l.210–420) | no ceiling item is created for it, and it isn't in the budget strip DTO |

**d. Tests** (SAFE env; each must fail when its code is removed):
1. the migration's insert is idempotent (the pure SQL check, or a unit test on the guard query);
2. an OTHER booking on the system teacher is accepted; a course / trial / voucher / single one is refused with the code;
3. edit / archive / LINE-link of the system teacher is refused;
4. the daily report's `byTeacher` and the SOM coach count exclude it;
5. the weekly digest's recipient list excludes it.

## 3. Fanta: FE (`smart-scheduler-front`)
- **Calendar:** the system teacher's column is shown **last**, after every real coach, so a park-fee block can be placed and seen. Use the DTO's `isSystem`, never the name.
- **The OTHER booking form:** the teacher pick includes it.
- **Every other teacher pick or list excludes it.** Walk each file below, and put the same row-per-file table in your report:
  - `CreateCourseModal.tsx`, `CreatePlanFlow.tsx`, `PlanModal.tsx`, `ChangeTeacherTimeDialog.tsx`, `DropResumeDialog.tsx`, `ImportBalanceModal.tsx`;
  - `BookingModal.tsx` for the lesson types, and `ClashResolveBox.tsx`;
  - the leave openers / panels (`LeaveClassOpener.tsx`, `LeaveDayPanel.tsx`, `LeaveClassRow.tsx`);
  - `FreelanceBudgetStrip.tsx`, `CampBlockPanel.tsx`;
  - the teacher management / roster page;
  - `TeacherOption.tsx` if it filters.
- **The roster:** it may list the system teacher **read-only, with no edit / archive / LINE actions,** or not at all. Pick the one with fewer changes, and say which.
- **No new words.** "No Teacher" is the row's name (data). If a screen needs a label or a tooltip, reuse an approved string or stop and tell me.
- **Tests:** the existing front test setup, with one test per filtered picker family. Then check by hand on your local stack once Bob's half is in: the column last, an OTHER block on it, the course modal without it, 375 px OK, 0 console errors.

## 4. Env and test data
- **Bob:** none new expected. Any new key goes into `.env.example` with a purpose line, and you name it in the report.
- **Fanta:** confirm `smart-scheduler-front/.env.example` still lists every key the code reads. Today that's `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_USE_MOCK`, `AUTH_SECRET`, `AUTH_URL` and `NEXT_PUBLIC_LIFF_ID`. Add purpose lines where missing.
- **Team B's ports:** back 4106 · backoffice-back 4110.
- **Test data on sid:** OTHER blocks titled with **`B-`** (e.g. `B-F5 park fee test`), listed in the report. Nobody truncates or deletes shared rows.

## Files (claim, Team B): only these
- **Bob:**
  - `src/db/schema.ts` (the column);
  - `drizzle/` (one migration + journal);
  - the guard in `scheduler.service.ts` / `other-series.service.ts`;
  - the exclusion lines in the files of the §2c table (exclusion lines only, no refactor);
  - `src/types/contract.ts`;
  - tests.
- **Fanta:** the components named in §3, plus the roster page and the tests.
- **Shared-file note:** `scheduler.service.ts`, `jobs.service.ts` and `calendar.service.ts` are also touched by Team A (F3) and Team C (C1 / F2). Keep hunks small, inside the named functions.

## Done =
- **Bob:** `bunx tsc --noEmit` 0 · suite green (SAFE env), full count before / after · the migration through the queue on sid (quote both lines + `db:verify`) · the §2c table.
- **Fanta:** `tsc` 0 · lint 0 · the front's tests green · the build 0 · the §3 table · the local check above with screenshots in `tests/evidence/task-861/` (B- data only).
- **Both:** report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.

## Review — FE half (@Fanta) — @Silver, 2026-11-08: ✅ ACCEPTED on code; live check pending
**Re-run by me:** `smart-scheduler-front`: `tsc --noEmit` 0, `bun test` **1407 pass / 0 fail** (150 files). `git status` = 15 modified + 2 new test files, all listed in her report.
**Read:**
- **One door:** `useTeachers()` drops `isSystem` by default via `select`, on the same cache key. Only the calendar and the OTHER forms ask for `{ withSystem: true }`.
- **No bypass:** grep finds no component calling `getTeachers` outside the hook.
- `systemTeacherLast` puts the system column last.
- It's read by flag, never by name, and a lookalike name is tested.

**Accepted:**
- the seam files outside the §3 list (types, mapper, `teacher.ts`, the hook, the grids, `TeacherOption`, the Other* dialogs);
- the two pin-only test edits;
- the roster not listing the system teacher at all.

**Her UI question, ruled:**
- On the system column the form opens on อื่นๆ with the other tabs **hidden**. ✅ Keep it: a lesson can't be aimed at the system teacher from there, and no new words are needed.

**Noted, not hers:**
- `next lint` can't run on Next 16; the lint script was already broken before this change. It goes to Porter as a repo-hygiene line.

**Still open:**
- **The local check** (column last, an OTHER block on it, 375 px, 0 console errors, screenshots): it runs when Bob's BE half is in, on a local SB whose `.env` is sid (host check first, `B-` data).
- **Then the TASK closes** with Bob's BE review.

## BE report (Bob, 2026-11-08) — DONE-pending-review, 0075 applied on sid, nothing committed
- **Migration** `drizzle/0075_system_teacher.sql` (hand-authored, journal idx 75, witness = the LAST object `teachers_one_system_uq`): `is_system boolean NOT NULL DEFAULT false`, the ONE row inserted `WHERE NOT EXISTS (… is_system)` (name = nickname = 'No Teacher', FREELANCE, active, not archived, `line_user_id` NULL), the partial unique index. **Applied on sid** through the queue (host check: 154.197.124.206, host only); db:verify: 76 migrations · ledger 124 rows · 76 witnesses applied.
- **Rule:** `src/lib/system-teacher.ts`; `assertTeacherBookable` refuses it by default (400 `SYSTEM_TEACHER_NOT_BOOKABLE`), only an OTHER passes `allowSystem` (the inserter, the four booking-row doors, an OTHER series' primary). Every teacher write ⇒ 409 `SYSTEM_TEACHER`. Words: the archived-teacher sentence for both (DECISIONS row 11). `isSystem` on the teacher DTO + contract.
- **§2c table (every row)** — see `inbox/SA-B.md` 2026-11-08 «TASK-861 BE: built + green» (scheduler / calendar / daily-report / som / jobs / attention / camp / checkin / teacher-leave / line-* / teacher-link / own-scope + user / freelance ceiling / badge), each with its decision and its pin.
- **Tests:** `system-teacher-task861.test.ts` 33 pass · `system-teacher-task861.mutations.json` 44 mutants all bite · every other mutation set in the tree re-run, no survivors · full SAFE `bun test` 5315 → **5412 pass · 0 fail** · tsc 0.
- **Mirror edits (all tagged 🔻 TASK-861, pins/stubs/counts only):** 63 count-pin lines in 38 files (75 → 76, +0075) · `planned-absence-vs-leave-task813` (2 pins + its mutation set C1, C8) · `teacher-leave-day-task561` · `admin-leave-future-only-task648` (stub the route guard) · `camp-per-coach-window-req105` (a `findFirst` stub on its fake tx) · `resume-picks-teacher-req089` (2 pins) · `voucher-note-task732.test.ts` (its schema slice now ends at the vouchers table's new `}, (t) => [`).
- **B- test data on sid:** none created (DB-less suite; the migration's one row is the only data).
- **Limits:** one park block per hour (`SLOT_TAKEN`, ruled row 11); the system teacher has no `teacher_subjects`, so the front's OTHER form must not derive the program from the teacher; no env key added.

## Review — BE half (@Bob) — @Silver, 2026-11-08: ✅ ACCEPTED (DONE)
- **Re-run by me:**
  - SB `bunx --package typescript@5.9.3 tsc --noEmit` = 0;
  - SAFE `bun test` = **5412 pass / 0 fail** (5315 after TASK-860 → +97, all new + mirrors);
  - the tree matches Bob's report.
- **Migration:** `0075_system_teacher.sql` read. It's additive and rerunnable:
  - the column has a constant default (no rewrite);
  - the row insert is guarded `WHERE NOT EXISTS`;
  - the witness is the partial unique index, last;
  - MIGRATION-QUEUE l.23–24 says `applied · verified` on host .206 = sid (host only).
- **The guard:** `mayUseSystemTeacher` = OTHER only, so a trial / course / voucher / 1 HR can never sit on "No Teacher". F4's first coach therefore can't be it either.
  - Every teacher write refuses it (409 `SYSTEM_TEACHER`), and it can never be linked to LINE or a user.
- **Exclusion walk (§2c):** reviewed against Bob's table. Accepted.
- **Rulings already given:** DECISIONS row 11 (the wording reuse; one park block per hour; the same-hour clash stays a known limit).
- **Security review:** none found.
  - The change only adds refusals: auth doors (user link, LINE link) now refuse one more identity.
  - It opens no new route and exposes no data. `isSystem` is a boolean on the existing teacher DTO.
- **Follow-up noted (not this TASK):** the back office reads `public.teachers` too: Jason's TASK-865 roster, and the People list for TASK-862 / 869. Those readers must skip `is_system`, or "No Teacher" (type FREELANCE) shows as a person on the pay run. Raised to Porter for Sober / Jason. Team B's own readers will carry it.
- **Still owed:** Fanta's live check of 861 + 870 together, once Bob's 870 BE is in.
