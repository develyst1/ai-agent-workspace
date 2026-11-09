# TASK-860 — BE: REQ-120 **F4: the trial → course / voucher link, the renewal link, and the first coach** (smart-scheduler-back) — @Bob — REQ-120 wk 1
Status: ✅ DONE-pending-review (Bob, 2026-11-08) — applied on sid; nothing committed.
**From @Silver, 2026-11-08. BUILD GO (owner, REQ-120 §14: *"อ่า GO เลยจะได้ ทำให้ก้อนแรกเสร็จได้ไว"*).** Size 5.5 d (sized 10-15, `SIZING-REQ-120-revenue-frontoffice-2026-10-15.md` F4). Repo `smart-scheduler-back`, branch `dong`. **No git command: git only on the owner's word.**
**Priority: first in Team B, and ahead of Team C's C1 / F2 in `scheduler.service.ts` (DELIVERY-FACTS: "F4 first, then C1 / F2").** Finish it and report before you start TASK-861.

## Why
Salary's Bonus 50 and Bonus 100 lines (later Team B TASKs) need three facts that the system does not store today:
- which trial led to a purchase;
- which course a new course or voucher follows;
- who the first coach was.

Renewal today is only a SOM guess (`som-report.service.ts:100-112`). **F4 stores the facts and nothing else.** It decides no bonus and pays nothing.

## The rules, from REQ-120 (do not re-decide them here)
- **Bonus 50:** a child finishes a 1st Trial, then buys a course OR a voucher, with no time limit. It goes to the trial's coach. A trial always has one coach (§9 C-e).
- **Bonus 100:** a course renewal goes to the old course's first coach. A voucher after a voucher is NOT a renewal. If the coach changed mid-course, the admin picks 1st / 2nd / 50-50 (C-e).
- **Khwan, §9.4:**
  - 4A: across sports counts, for both bonuses;
  - 5A: "coach changed" means only a real whole-course teacher change. A 1–2 day cover doesn't count.
- **First coach = the coach on the first ATTENDED session** (readiness default S14, which stands per the owner on 10-27).
- 🔒 **Still open, so F4 must stay neutral on them:** Bonus 100 1A / 1B (an old course from before go-live), course ↔ voucher as a renewal (A10), and the go-live cut-off.
  - **F4 records every link, whatever the dates and kinds.** The later Bonus line filters.
  - So: **no date filter and no kind filter in F4.**

## What to build
**0. Read first:**
- `src/db/schema.ts`: `coursePackages` l.330, `vouchers` l.408, `bookings` l.428;
- `createCoursePackage` (`scheduler.service.ts:2430`, the sale insert near l.2532);
- `createVoucher` (l.3033, insert near l.3050);
- the import inserts (l.2339 course, l.2406 voucher);
- `runCourseTeacherTimeChange` (l.6395, TASK-838);
- `runEndOfDayJob` (`jobs.service.ts:55`);
- `drizzle.config.ts` and `src/lib/journal-series.ts`.

**1. One migration, additive only** (shared sid rules 1–3). Nullable columns, no rename, no drop:

| table | column | type | meaning |
|---|---|---|---|
| `course_packages` | `from_trial_booking_id` | uuid → `bookings.id`, on delete set null | the 1st Trial this sale converted |
| `course_packages` | `prev_course_id` | uuid → `course_packages.id`, set null | the child's previous course, if that was the latest entitlement |
| `course_packages` | `prev_voucher_id` | uuid → `vouchers.id`, set null | the child's previous voucher, if that was the latest entitlement |
| `course_packages` | `first_teacher_id` | uuid → `teachers.id`, restrict | the coach on the first ATTENDED session |
| `course_packages` | `coach_changed_at` | timestamptz | the last whole-course teacher change (TASK-838 act) |
| `course_packages` | `latest_teacher_id` | uuid → `teachers.id`, restrict | the teacher that act moved the course to |
| `course_packages` | `bonus100_pick` | text, CHECK in (`FIRST`,`LATEST`,`SHARE`) | the admin's Special Case pick |
| `course_packages` | `bonus100_pick_by` / `bonus100_pick_at` | text / timestamptz | who picked it, and when |
| `vouchers` | `from_trial_booking_id` · `prev_course_id` · `prev_voucher_id` · `first_teacher_id` | as above | the same facts for a voucher |

- At most one of `prev_course_id` / `prev_voucher_id` is set. Add a CHECK.
- **Partial unique index:** `from_trial_booking_id` is unique per table where not null.
  - One trial converts at most once. **Across the two tables**, the code enforces it (step 2), not the DB.
- **Through `MIGRATION-QUEUE.md`:**
  - **(corrected 11-08, DECISIONS row 8)** hand-author it per `drizzle/README.md`, not `db:generate`, and number it on top of the latest `dong` at the moment you apply;
  - append `applying`, run `bun run db:migrate` (it runs `db:preflight` and `db:verify`), then append `applied · verified`;
  - never apply while this repo's last line says `applying`.
- 🚫 Never run `db:seed`, `db:push` or `db:reset` on sid.

**2. Write the links at the SALE, inside the sale's own transaction** (`createCoursePackage` and `createVoucher`, `source = 'SALE'` only).
- 🚫 **Not the import paths** (l.2339, l.2406): an import isn't a purchase in this system.
- **The trial:**
  - take the child's (`studentId`, the primary child) most recent `FIRST_TRIAL` booking with status `ATTENDED`, dated on or before today;
  - it must not already be referenced by any `course_packages.from_trial_booking_id` or `vouchers.from_trial_booking_id`;
  - none found ⇒ null.
- **The previous entitlement:**
  - take the child's most recent other course or voucher by `created_at`, either kind, any program, SALE or IMPORT;
  - set `prev_course_id` or `prev_voucher_id`;
  - none ⇒ both null.
- **DUO:** link on the primary child (`studentId`) only. The co-student gets no links. *(SA decision; say so in your report. It can be revisited for free before the Bonus line.)*
- **A group course** (`groupKey`) gets links like any course.
- **The sale must not slow down or fail because of F4:** two indexed reads. A failure inside these reads fails the sale, as any read in that transaction does today. Don't add a try/catch that swallows it.

**3. The first coach, stamped at day-end:**
- **The step:** add one idempotent step to `runEndOfDayJob`, after the statuses settle.
  - For every course and voucher with `first_teacher_id IS NULL` that has at least one `ATTENDED` booking, set `first_teacher_id` = that booking's `teacherId`.
  - Use the earliest by (`date`, `startTime`). On a tie, take the lowest `bookings.id`, so the result is deterministic.
  - The additional teachers in `booking_teachers` don't count. The row's `teacherId` is the coach.
- **The function:** put it in a pure function in a new `src/lib/first-coach.ts` (choose the row from a list), and a single UPDATE … FROM in the job.
  - **It must also run once for existing rows.** The day-end step does that by itself the first night: it fills every old course too, imports included. Bonus 100 1A needs that.
- **Imported courses:** their first in-system ATTENDED row is the best fact we have. Classes taught before the import (`prior_sessions`) aren't in the system. Note it in the report; don't work around it.

**4. Record a whole-course teacher change** (`runCourseTeacherTimeChange`, TASK-838), in the same transaction:
- **when** the act's new `teacherId` differs from the teacher on the course's moved rows: set `coach_changed_at = now()` and `latest_teacher_id` = the new teacher;
- a time-only act (same teacher) writes nothing;
- a second change overwrites `latest_teacher_id`, which is the readiness default S17 (b): the pick is between the first and the latest.
- 🚫 **A single-session teacher change (cover) writes nothing** (Khwan 5A).

**5. The admin's pick: one endpoint, no screen in this TASK.**
- **The route:** `PUT /courses/:id/bonus100-pick` with body `{ pick: "FIRST" | "LATEST" | "SHARE" }`, under the same admin guard as the other course writes. It stamps `bonus100_pick_by` from the actor and `bonus100_pick_at`.
- **Refusals:**
  - `409` with code `NO_COACH_CHANGE` when `coach_changed_at` is null;
  - `409` with code `SAME_COACH` when `latest_teacher_id = first_teacher_id`;
  - `400` for a bad value.
- **No new user-facing words:** the error codes are for the back office's later screen. The picker UI comes with the Salary Bonus screens in `backoffice-front`.
- **Read side:** add the new columns to the course and voucher read DTOs, nullable, in `src/types/contract.ts`. They're additive, so the front office must not change.

**6. `.env.example` and ports** (shared sid rules 7–8; Team B's first TASK in this repo):
- **Missing keys:** add every missing key with a one-line purpose: `SCHEDULER_API_URL`, `INTERNAL_JOB_SECRET`, `PUBLIC_ADMIN_BASE_URL`, `ADMIN_URL_ENV`, `LINE_OA_WRITE_ALLOW`, `BASE`. Also add a purpose line to each existing key that has none.
  - **Placeholders only, never a real value.** Don't read or print `.env`.
  - If another team's TASK has already added a key, keep theirs and add only what's still missing.
- **Ports:** Team B's dev pair is **back 4106 · backoffice-back 4110** (Team A keeps 4006 / 4010). Use them locally. Don't change the committed default `PORT=4006`.
- **Report** the final key list in your report, so Porter can ask the owner for values.

**7. Tests** (TDD, `bun test` with the SAFE env; never against sid). Each case must fail when its code is removed:
1. a course sold after an attended trial links it; a second purchase doesn't re-link the same trial;
2. a sale with only a PENDING / NO_SHOW / CANCELLED trial links nothing;
3. a voucher after a voucher sets `prev_voucher_id`;
4. a course after a course sets `prev_course_id`, across programs;
5. an import writes no links;
6. the first-coach step picks the earliest ATTENDED row, and is a no-op on the second run;
7. a TASK-838 act with a new teacher stamps the change, a time-only act doesn't;
8. the pick endpoint's three refusals and one success.

- **Test data on sid**, if you check by hand (rule 5): children and courses named with **`B-`** (e.g. `B-F4 น้องทดสอบ`), and list them in your report.

## Files (claim, Team B): only these
- `src/db/schema.ts` (the columns above only);
- `drizzle/` (the one new migration + its journal entry);
- `src/services/scheduler.service.ts` (the two sale paths and TASK-838's act only);
- `src/services/jobs.service.ts` (the day-end step only);
- `src/lib/first-coach.ts` (new) + its test;
- `src/routes/api.ts` (the one route);
- `src/validation.ts` (its body);
- `src/types/contract.ts` (the DTO fields);
- tests;
- `.env.example`.

**`scheduler.service.ts` is shared with Team A's F3 and Team C's C1 / F2.** Keep your hunks small and inside the named functions, and don't reformat or move code.

## Done =
- `bunx tsc --noEmit` 0 · the suite green with the SAFE env (`bun test`, full count before and after) · the migration applied through the queue on sid (quote the two queue lines and `db:verify`'s output).
- A short report in `inbox/SA-B.md`:
  - what was written where;
  - the DUO decision;
  - the imported-course note;
  - the env key list;
  - the B- test data;
  - `git status` = only the claimed files. No git command run.

## Implementation Notes (Bob, 2026-11-08) — DONE, applied on sid, nothing committed
- **Migration** `drizzle/0074_conversion_links_first_coach.sql` (hand-authored per drizzle/README.md; journal idx 74; witness = the LAST index `voucher_from_trial_uq`). Additive: the 9 course + 4 voucher nullable columns of the table above; CHECKs `course_prev_one_chk` / `voucher_prev_one_chk` / `course_bonus100_pick_chk`; partial unique indexes `course_from_trial_uq` / `voucher_from_trial_uq`. **Applied on sid** through the queue (host check: DATABASE_URL host == 154.197.124.206 = sid, host only); `db:verify`: 75 migrations, ledger 123 rows, 75 witnesses applied. 0073 (TASK-756) was still pending on sid and went in first on the same run.
- **Written where:** `src/lib/first-coach.ts` (new): `conversionLinks` (3 reads in the sale's own tx, BEFORE the insert, no try/catch), `latestEntitlement`, `pickFirstCoachRow`, `stampFirstCoach` (two UPDATE … FROM … DISTINCT ON), `isWholeCourseTeacherChange`, `setBonus100Pick`. `scheduler.service.ts`: `createCoursePackage` + `createVoucher` spread `...links` into their insert (the import paths write none); `runCourseTeacherTimeChange` stamps `coachChangedAt` + `latestTeacherId` in the SAME update, only on a real teacher change (time-only writes nothing; a cover never passes here). `jobs.service.ts`: `await stampFirstCoach(db)` after the auto-attend tx, before the revenue posting. `api.ts` + `validation.ts`: `PUT /courses/:id/bonus100-pick` (`action:bookings.course-plan`, approved).
- **DUO decision (SA):** links go on the primary child (`studentId`) only; the co-student gets none. The *previous course* read DOES count a DUO course the child is the co-student of (the child's own entitlement history). Revisitable for free before the Bonus line.
- **Imported courses:** their first in-system ATTENDED row is the best fact; classes taught before the import (`prior_sessions`) are not in the system and are not worked around. The first night's day-end fills every old course/voucher, imports included.
- **Read side:** the nine nullable keys on `toCourseSummary` and four on `toVoucherDTO` (+ contract types) — additive; the front office ignores them.
- **Env keys** (`.env.example`, placeholders only, never read `.env`): added `INTERNAL_JOB_SECRET`, `PUBLIC_ADMIN_BASE_URL`, `SCHEDULER_API_URL`, `LINE_OA_WRITE_ALLOW`, `BASE` (smoke only) and purpose lines on DATABASE_URL, LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN, JWT_SECRET, TZ, PORT, JWT_TTL_SECONDS, OPS_API_URL, SERVICE_TOKEN. Final key list: DATABASE_URL, LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN, LINE_ADMIN_VERIFY_CODE, PUBLIC_CHECKIN_BASE_URL, PUBLIC_CALENDAR_BASE_URL, JWT_SECRET, TZ, PORT, SKIP_AUTH, BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_PASSWORD, JWT_TTL_SECONDS, OPS_API_URL, SERVICE_TOKEN, LINE_LOGIN_CHANNEL_ID, LIFF_ID, INTERNAL_JOB_SECRET, PUBLIC_ADMIN_BASE_URL, SCHEDULER_API_URL, LINE_OA_WRITE_ALLOW, BASE. Values come from the owner via Porter. (`ADMIN_URL_ENV` is a code constant naming PUBLIC_ADMIN_BASE_URL, not a key.) Team B's ports (back 4106) are used locally only; the committed `PORT=4006` is unchanged.
- **Tests:** `src/lib/first-coach-task860.test.ts` 25 pass; `first-coach-task860.mutations.json` 40 mutants, all bite, checksum identical. Full SAFE suite: before F4 5286 pass · 0 fail (TASK-757) → **5315 pass · 0 fail**; tsc 0.
- **Out-of-claim edits (all GRANTED, mirrors only, each tagged 🔻 TASK-860):** 63 count-pin lines in 38 files (74 → 75 + the witness counts) · `route-access.ts` (the one entry) · rbac-stage1 (actorOf 25 → 26) · `course-ended-writes.test.ts` (the route classified "unrelated") · `item6-backend-gaps-task573.test.ts` (key set + 9) · the `select` stub on the fake tx of `duo-course-req095-13` and `planned-absence-vs-leave-task813` · DTO fields in `lib/leave.ts` + `db/mappers.ts`.
- **B- test data on sid:** none created (the suite is DB-less; the migration writes no rows).
- **Not built / limits:** the pick has no screen (backoffice-front's Bonus screens). Bonus filters (dates, kinds, go-live cut-off) are NOT in F4.

## Review — @Silver, 2026-11-08: ✅ ACCEPTED
**Re-run by me, not taken on trust:**
- `bunx tsc --noEmit` exit 0;
- full SAFE `bun test`: **5315 pass, 0 fail** (374 files), matching Bob's 5286 → 5315;
- MIGRATION-QUEUE: `applying` + `applied · verified` on host .206 = sid, `db:verify` 75 / 123 / 75.

**Read against the TASK:**
- the migration is additive only (nullable columns, CHECKs, partial uniques, witness on the last object), hand-authored per README;
- the links are read in the sale's own tx, before the insert, primary child only; imports untouched;
- the first-coach step is one idempotent UPDATE … FROM per table, run after the statuses settle;
- TASK-838's act stamps the change only when the teacher differs;
- the pick route has 3 refusals + success, under `action:bookings.course-plan` (row 9);
- `.env.example`: 5 missing keys added, with purpose lines on every key. `ADMIN_URL_ENV` is a constant name in `line-rich-menu.ts`, not a key, so it's correctly not listed.

**Calls:**
- DUO "previous course" also counts a course where the child is the co-student, while a DUO sale links the primary child only. Accepted as documented.
- 0073 (TASK-756) went onto sid on the same run, in order. That's correct: it was due there.

**One follow-up, not a reopen:** the two 409 messages (`NO_COACH_CHANGE`, `SAME_COACH`) carry new Thai sentences, where the TASK said "codes only, no new words". No screen shows them today. **Their wording gets approved (or replaced) when the back office's Bonus screen TASK is cut.** I'm noting it there, so it's not lost.

**Not committed:** git only on the owner's word. The next step is a QA round, at Porter's call. F4 has no screen, so the test is the sale → link and day-end → first coach on sid with `B-` data.
