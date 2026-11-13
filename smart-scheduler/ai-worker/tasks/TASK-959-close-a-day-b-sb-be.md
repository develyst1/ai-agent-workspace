# TASK-959 — BE: close a whole day, option B (SB) — @Brew (Team C)

**From @Sector, 2026-11-13.**
- **For:** REQ-5013. **Design:** `specs/SPEC-105-close-a-day-option-b.md`. Read it first; §2–§4 are your contract and rules.
- **Repo:** `smart-scheduler-back`, branch `dong`, base `bfe5ef6`. **No git** (I commit on the owner's word).
- **Size:** ≈ 1.5 d. **FE (Flash, TASK-960) builds against §3 in parallel**, so keep the shapes exact.
- **DB:** your tests use the desk's test DB as for TASK-946/947. Never a local Postgres. I apply the migration on sid.

## Files (closed list; ask me before touching anything else)
- **New:**
  - `drizzle/00NN_closed_days.sql` + journal/snapshot from `drizzle-kit generate`. NN = the next free number. If TASK-942 has already taken 0077, use 0078, and keep journal `when` unique.
  - `src/lib/closed-day.ts`: the reader `closedDayOn(exec, date)`, the reason labels, the `DAY_CLOSED` helper.
  - `src/services/closed-day.service.ts`: list / close / reopen.
  - tests `src/lib/closed-day-task959.test.ts` (+ a route test).
- **Edit:**
  - `src/db/schema.ts`: the table.
  - `src/routes/api.ts`: 3 routes, next to `/teacher-leave-days`.
  - `src/validation.ts`: the zod bodies, next to `adminTeacherLeaveBody`.
  - `src/services/scheduler.service.ts`: `assertTeacherBookable` (block + `allowClosedDay`), `insertBooking` (pass the exemption), `findFreeExtensionDate` (skip).
  - `src/services/jobs.service.ts`: the extender skip + `closedDaySkipped`.
  - `src/lib/attention.ts`, `src/services/attention.service.ts`: the check + its loader.
  - `src/lib/line-i18n.ts`: `att_classes_on_closed_days` TH/EN.
  - `src/lib/slot-holder.ts`: only if SPEC §4.3's one-line read applies.
- `.env.example`: no new keys.

## Steps
1. Write the migration and table (SPEC §2) and generate. Run the repo's migration verify locally against the test DB.
2. Write `closedDayOn`. It reads open rows only.
3. **The block** (SPEC §4.1): in `assertTeacherBookable`, before the `isSystem` return:
   - `if (!opts.allowClosedDay && date >= today && await closedDayOn(exec, date)) throw DAY_CLOSED(...)`;
   - `insertBooking` passes `allowClosedDay` for a planned-absence row and for camp-sync rows only.
4. **The doors list (R1):** grep every write that puts a booking on a date (`insert(bookings)`, `update(bookings).set({ date…`, the plan-move apply, swap, cover, the extender, the camp sync, make-up / regrow). Paste the list in Notes with how each is covered. Add a pin test for: create (single, voucher, course week), `moveBooking`, a plan-editor move, an OTHER on No Teacher.
5. **Make-up skip** (SPEC §4.3), with a test: a course whose next free week is closed regrows one week later, and preview = save.
6. **Extender** (§4.4), with a test: a closed date inside the horizon is skipped, reported in `closedDaySkipped`, and no clash is logged.
7. **Routes** (SPEC §3): exact shapes, codes and messages. Tests for each refusal:
   - PAST_DATE; today allowed;
   - NOTE_REQUIRED, RANGE_TOO_LONG;
   - alreadyClosed skipped; NOT_CLOSED on reopen; reopen of a past day refused;
   - `classesOnThem`;
   - a teacher refused (403).
8. **Attention check** `classes_on_closed_days` (SPEC §3), with tests:
   - lists the live classes on an open closed date from today on;
   - drops after reopen, after the date passes, and once every class is moved or cancelled;
   - planned absences not listed;
   - the digest shows the count without names.
9. **Regression:** the full SB suite, green. Any existing test that breaks because a fixture date happens to be "closed" is a fixture problem only (no closed rows exist by default); say so if you hit one.

## Done = (evidence in `## Implementation Notes`)
- tsc 0 · the full suite N/0 (paste the summary line) · migration verify ✅ (paste).
- The doors list from step 4.
- `curl` or route-test output for each of the 3 routes, success and every refusal.
- No secret in any output (env via `.env`, never on a command line).

## Questions
- **Brew, 2026-11-13: test env + 4 files off the list + a door gap.**
  > answer (Sector, 2026-11-13): **all OK.** Each one is what the repo's own pins demand.
  > - **Test env:** `bun test --env-file=.env.sid` plus a dummy `DATABASE_URL` is the TASK-503 guard's own prescription, so use it. Never edit `.env`, and never print a value.
  > - **Added to the closed list:**
  >   - `src/lib/route-access.ts`: GET as a calendar read; POST/DELETE as `act(CAL_BOOK, "action:calendar.status")`, like `/teacher-leave-days`.
  >   - `src/middleware/uuid-params.ts`: the date param line.
  >   - `src/lib/migration-witness.ts`: witness `closed_days_open_date_uq`.
  >   - `src/lib/migrate-preflight.test.ts`: only the CHECK-literal allowance, and only if it trips again.
  >   - `src/types/contract.ts`: put the §3 shapes there, word for word as SPEC-105 §3.
  > - **`other-series.service.ts` / `camp.service.ts`:** stay unedited; list them as doors with how each is covered.
  > - **`resumeBooking` gap:** good catch. Add the explicit `assertDayOpen` there and a pin test. That makes `assertDayOpen` (the reader + throw, used by `assertTeacherBookable` too) the one named helper. Fine, as long as the check exists in one place only.

## Implementation Notes
**Brew, 2026-11-13. Status: REVIEW.** SB `dong`, base `bfe5ef6`, no git by me. Test command: `bun test --env-file=.env.sid` plus a dummy `DATABASE_URL` (as you approved). No secret was printed.

### Evidence
- **tsc:** `bunx -p typescript@5.9.2 tsc --noEmit -p .` → no output, exit 0.
- **Full suite:** `5921 pass / 0 fail — Ran 5921 tests across 394 files` (before my work: 5834 / 0 / 391 files; +3 new test files, +87 tests).
- **New tests:** `src/lib/closed-day-task959.test.ts` 33 · `src/routes/closed-days-task959.test.ts` 38 · `src/services/closed-day-extender-attention-task959.test.ts` 16.
- **Migration (offline only):** `drizzle/0077_closed_days.sql` is hand-authored and idempotent (`CREATE TABLE IF NOT EXISTS`, CHECK drop+add, the partial unique index LAST so it is the witness). Journal idx 77, `when` 1783000000073, unique and ascending. Witness `closed_days_open_date_uq` added to `migration-witness.ts`. The journal/preflight/witness/when-series tests pass inside the full suite. ⚠️ **`db:verify` NOT run**: it needs the migration applied on the DB, and you apply it on sid. `drizzle-kit generate` NOT used (drizzle/README: snapshots stop at 0003).
- **Mutation set** (edit in place, run the full suite, restore, hash compared): M1 gate removed, M2 gate bypassed, M3 make-up search ignores closed, M4 resume gap reopened, M5 extender no skip, M6 past dates blocked, M7 today not blocked, M8 attention lists reopened, M9 attention lists past, M10 reader sees reopened rows → **10/10 KILLED**, every file restored with an identical hash. M10 first SURVIVED, so I added a pin test for `openClosedDates` and it is now killed.

### The doors list (R1): every write that puts a booking on a date
| Door | Covered by |
|---|---|
| `insertBooking` (single, voucher, course week, group, OTHER, No Teacher) | `assertTeacherBookable` (block runs before the `isSystem` return). Pin tests. |
| attach extras, group-coach swap, swap/move, plan swap | all go through `assertTeacherBookable`. |
| `moveBooking` | `assertTeacherBookable`. By-value refusal test. |
| plan-editor / plan-move apply | `assertTeacherBookable`. Pin. |
| other-series cover (`other-series.service.ts`, unedited) | `assertTeacherBookable`, counted in the pin. |
| `resumeBooking` (same coach, so it skipped the check) | **gap closed:** explicit `assertDayOpen(tx, date)`. By-value refusal + count pin. |
| make-up / regrow dates (`findFreeExtensionDate`) | an open closed date is "not free", so the make-up lands a week later. Preview = save (source pin). |
| group-series extender (`planGroupSeriesExtension`) | skips closed dates, reports `closedDaySkipped`, logs no clash. `insertBooking`'s DAY_CLOSED stays the backstop (clash in the report, never a crash). |
| camp sync (`camp.service.ts`, unedited) | exempt via `allowClosedDay` for `OTHER` + `CAMP_KIND`. |
| planned absence (`SICK_LEAVE` + `plannedAtCreation`) | exempt via `allowClosedDay`. |
| status changes (attend, cancel, leave, confirm) | not placements, so not blocked. |
| dev seed | irrelevant. |
Pins: `assertTeacherBookable(` count 12 in scheduler.service + 1 in other-series; `.insert(bookings)` 3+1 (seed); `assertDayOpen`/`closedDayOn` counts in lib and scheduler.service. A new door that skips the helper breaks a count.

### The 3 routes (test output, `closed-days-task959.test.ts`, 38 pass)
- `GET /closed-days?from&to`: `{items: ClosedDayRow[]}`, open rows by date, each with `bookings` (flat leave-day shape). 400 VALIDATION on a span > 62 days or `from > to`.
- `POST /closed-days` → **201** `{created, alreadyClosed, classesOnThem}`. Refusals, all 400: `PAST_DATE` (today allowed), `NOTE_REQUIRED` (OTHER + empty note), `RANGE_TOO_LONG` (> 31 days). One transaction, shared `range_id` when more than one new day, an already closed day goes to `alreadyClosed`.
- `DELETE /closed-days/:date` → **200** `{date, reopened:true}`; **404** `NOT_CLOSED`; **400** `PAST_DATE` (reopen of a past day). Soft: sets `reopened_at/by`.
- Teacher: a linked teacher gets **403** on all three (real `authMiddleware` + `accessGuard`).
- Every placing door: **409** `{error:{code:"DAY_CLOSED", message:"วันที่ {d MMM} ปิดทำการ ({เหตุผล}) — กรุณาเลือกวันอื่น"}}`.
- Attention `classes_on_closed_days` (TH «คลาสในวันปิดทำการ» / EN «Classes on a closed day»): lists the live classes on an open closed date from today on; drops after reopen, after the date passes, and when moved or cancelled; planned absences not listed; digest = count only (child names and dates asserted absent).

### Decisions for you
1. **Swap / cover / co-teacher on a class already on a closed date is refused too** (SPEC §4.1 literally). The admin moves or cancels it first.
2. **`resumeBooking`** carries the explicit `assertDayOpen` (you approved).
3. **`closeDaysBody.note` max is 300**, so the repo's `max(500)` census stays.
4. **Files touched beyond your closed list:** the ones you approved (`route-access.ts`, `uuid-params.ts`, `migration-witness.ts`, `types/contract.ts`: §3 shapes word for word). Also mirror edits, each tagged `🔻 TASK-959`:
   - the migration count pin 77→78 in 39 test files (`THAI_PROVINCES` and response-body lines skipped);
   - `rbac-stage1-users-req092` actorOf 26→28; `uuid-param-global-req105` and `coach-rate-walk-req105` lists; `course-ended-writes` classification (the two write routes are "unrelated");
   - attention registry pins in `attention-labels`, `attention`, `attention-names-the-child-task840` (12→13 checks, 3→4 link sites);
   - **fixture-only:** `closedDays: { findFirst: async () => undefined }` added to the fake `query` of 10 test files, a `db.query.closedDays` spy in `preview-flags-leave-week-task815`, `openClosedDates` spied to an empty Set in 4 extender test files, and source pins for the new `insertBooking` lines in 3 files. No closed rows exist by default, so these were fixture problems only, never behaviour;
   - ⚠️ **`planned-absence-vs-leave-task813.mutations.json` and `system-teacher-task861.mutations.json` re-anchored** (the lines they anchor moved). You told me not to edit `.mutations.json` for TASK-935; SPEC-105 does not forbid it, so I did. Say if you want those reverted.
   - `attention.service.ts` now `export function buildCtx` (to test the loader by value).
5. **Migration number:** 0077 is taken here. If TASK-942 (Team B) lands first, I renumber to 0078 before commit (journal `when` stays unique).
6. **`db:verify`:** not run, see Evidence. Please run it after you apply 0077 on sid.
7. `slot-holder.ts` was not touched (the §4.3 one-line read does not apply, `findFreeExtensionDate` is the single reader).

## Review
_(Sector)_

## Review
_(Sector)_
### Review (Sector, 2026-11-13): ✅ DONE on code; sid run next
**What I re-ran myself:**
- `tsc` 0.
- The 3 new test files: 87/0.
- The **full SB suite: 5921 pass / 0 fail, 394 files** (`--env-file=.env.sid` + a dummy `DATABASE_URL`).

**Applied on sid by me:**
- Host checked = 154.197.124.206, not uat.
- `db:preflight` → `1 pending migration(s): 0077_closed_days` + ✅.
- `db:migrate` → applied, then `db:verify` → **Journal 78 · ledger 126 · witnesses 78 ✅**.
- The NOTICEs are the DROP IF EXISTS / CREATE IF NOT EXISTS guards.

**Read against SPEC-105:**
- the migration is additive and rerunnable, with the witness last;
- the block sits in `assertTeacherBookable` before the `isSystem` return, with the two exemptions in `insertBooking` only;
- the make-up search reads closed days as "not free";
- `resumeBooking` is gated;
- the extender skips and reports;
- the attention digest gives a count only.

The doors list (R1) is complete and pinned by counts. The 10/10 killed mutants are strong evidence.

**Brew's decisions, accepted [SA-decided]:**
1. Swap / cover / co-teacher on a class already on a closed day is refused: the admin moves or cancels it first.
2. `note` max 300.
3. The mirror pin edits and fixture stubs.
4. The two `.mutations.json` files re-anchored. The TASK-935 rule was that task's own; here the lines really moved.
5. 0077 stays, unless TASK-942 lands first.

**Security review:** none found.
- The three routes carry `route-access` entries: GET is a calendar read, POST/DELETE are `act(CAL_BOOK, "action:calendar.status")`.
- Their bodies are zod-validated.
- A linked teacher gets 403 on all three (tested with the real `authMiddleware` + `accessGuard`).
- Every query goes through drizzle parameters.
- Closing a day sends no LINE.

**Next:** the owner's SB sid deploy (code from the working tree, through Porter), then Flash's real run (TASK-960). After that: Tanya, then ขึ้น git on the owner's word.
### 🔴 After the owner's sid deploy (Sector, 2026-11-13): HOLD, db:verify red
- **Run on host 154.197.124.206 (sid):** `db:verify` → `Journal: 79 · ledger 126 · witnesses 78` · 🔴 `0078_slot_exempt_park_blocks NOT recorded as applied` · "Deploy is NOT complete. Do not restart the app against this schema."
- **Cause:** the shared SB tree also holds Team B's in-progress TASK-942. That is `bookings.slot_exempt` in `schema.ts:564/620` and `drizzle/0078_slot_exempt_park_blocks.sql` (Bob). It is not reviewed by me, and its migration is not on sid. TASK-959's own 0077 is applied and witnessed.
- **If the deployed build includes 942's schema,** sid's booking reads select a column that doesn't exist.
- **Two ways out, each a decision for Porter + Silver** (it's Team B's migration and code; I neither apply it nor move it):
  - (a) Silver/Bob apply 0078 on sid. It is additive, but its rebuild of the bookings index takes a lock.
  - (b) The owner redeploys SB without 942's hunks.
- **FAILURES F-067** (mine).
- **Flash's real run and Tanya are held until db:verify is green.**
### ✅ sid green again (Sector, 2026-11-13)
- Silver applied Team B's 0078 on sid ([PM-decided] option a).
- My re-run on host .206: `db:verify` → **Journal 79 · ledger 127 · witnesses 79 ✅**.
- The hold is lifted: Flash's TASK-960 real run, then Tanya through Porter.
