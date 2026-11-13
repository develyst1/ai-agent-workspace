# PLAN 2026-11-13: one deployable state of smart-scheduler-back + front (Team B + Team C, jointly)
**Asked by:** Porter (inbox/SA-B.md and inbox/SA-C.md, 2026-11-13): sid deploy stopped, db:verify RED on 0080.
**Written by:** Silver (SA-B) first; **Sector (SA-C) completes § 2-C and signs § 6.** No SA↔SA chat: this file is the channel, and Porter carries the pointers.
**State read (2026-11-13):**
- **SB** `dong` HEAD `bfe5ef6` (2026-11-11). Everything since is **uncommitted**, with three TASK sets interleaved in shared files (`scheduler.service.ts`, `api.ts`, `validation.ts`, `schema.ts`, `contract.ts`, `line-i18n.ts`, `_journal.json`, …). Migrations 0077–0080 are untracked.
- **SF** `dong` HEAD `86316ee` (2026-11-11), with 35 changed paths.

## 1. The problem in one line
The owner deploys the **working tree**. It currently holds Team C's **in-progress TASK-965** (`0080_coach_time_ranges.sql` in the journal but not applied on sid, and 131 SB test failures), so any deploy from it is red. role-sa § 4.10: a deploy is never "the working tree".

## 2. What goes in (reviewed only)
### 2-B (Silver): Team B, all reviewed, sid proofs green
| TASK | SB | SF | migration (sid) |
|---|---|---|---|
| TASK-942 + D-155-1 (park blocks) | slot-holder, system-teacher, scheduler.service (insert/move slotExempt, getCalendar `more`), schema, contract, tests | CalendarGrid, mappers, contract, tests | **0078** applied · verified |
| TASK-961 (change activity BE) | activity-change.ts, scheduler.service (4 fns), booking-sale-amount + revenue-line (**Sector reviews the hunk**, SPEC-107 § 0), line-i18n, line-message, route-access, api, validation, contract, schema, migration-witness, journal, tests | — | **0079** applied · verified |
| TASK-962 (change activity dialog) | — | ChangeActivityDialog (new), PlanModal, BookingModal, useScheduler, scheduler.service + mock, contract, dictionaries, `.env.example`, tests | — |
File-level detail: `REQUEST-silver-to-porter-2026-11-13-deploy-ask-942-d1551-961-962.md`.

### 2-C (Sector): Team C (filled 2026-11-13)
| TASK | SB | SF | migration (sid) | state |
|---|---|---|---|---|
| TASK-959 (close a day, BE) | closed-day.ts + closed-day.service.ts (new), scheduler.service (`assertTeacherBookable` / `insertBooking` head / `findFreeExtensionDate` / `resumeBooking`), jobs.service (extender), attention.ts + .service, api, validation, route-access, uuid-params, migration-witness, schema, contract, line-i18n, journal, tests + the fixture / pin edits listed in TASK-959 | — | **0077** applied · verified | ✅ DONE (my review) · **TEST-156 PASS** |
| TASK-960 (close a day, FE) | — | Calendar/{CloseDayDialog, ClosedDayBanner, ClosedDayChip, ClosedDayPanel}.tsx (new), useClosedDays, closed-day.service (new), CalendarContent, calendar/page.tsx, attention-link, types/app/attention, contract, dictionaries, tests | — | ✅ DONE (my review) · **TEST-156 PASS** |
| Bob's revenue hunk in TASK-961 | booking-sale-amount + revenue-line | — | — | ✅ reviewed by me (SPEC-107 § 0, re-run 70/0) |
| **TASK-965** (REQ-5015 BE) | in progress: 0080 + teacher-leave.ts, work-days.ts, scheduler.service, validation, contract, schema, migration-witness, journal, tests | — | 0080 **not** applied | **OUT, parked (§ 3)** |
| **TASK-966** (REQ-5015 FE) | — | in progress: ReportLeaveDialog, Leave* strip/panel, **CalendarGrid** (shared with 942's fix!), TeacherWorkDaysSelect / TeacherFormModal, contract, dictionaries, tests | — | **OUT, parked (§ 3)**. *Silver's list missed it.* |
| TASK-963 / 964 | — | — | — | not started (⏸ back office) |

Nothing else of Team C's is in either tree. The sid `subjects` insert of 2026-11-13 is data, not code.

## 3. Keeping in-progress work out (TASK-965 now; the same rule for any later one)
**[SA-proposed, Silver] "Park it, don't branch":**
1. **Freeze.** From the moment Porter says go, nobody edits SB or SF except step 2's owner.
2. **Park.** TASK-965's engineer saves **only 965's change** as a patch file outside both repos: new files plus its hunks in shared files plus `0080` and its journal entry. Then they revert exactly those hunks in the tree.
   - The engineer knows their hunks. A shared-file hunk is cut with `git diff` + `git apply -R` on the 965 part only, then read back.
   - **No `git stash`:** it takes every team's changes at once.
   - **No branch:** owner rule.
3. **Gate on the parked tree** (both SAs paste the real output into this file):
   - SB `bunx --package typescript@5.9.3 tsc --noEmit` → 0;
   - SB SAFE suite → 0 fail;
   - SF `npx tsc --noEmit -p .` → 0, and SF `bun test` → 0 fail;
   - sid `bun run db:verify` → **Journal 80 · ledger = journal · witnesses 80 · ✅**, with 0077–0079 present and 0080 absent.
4. **Unpark** after the deploy (§ 5): 965's engineer re-applies the patch and carries on. 0080 goes to sid through MIGRATION-QUEUE when 965 is reviewed.

## 4. Journal vs ledger (sid)
| migration | in the deployed state | on sid | uat (owner, later) |
|---|---|---|---|
| 0077_closed_days (C, 959) | yes | applied · verified | pending, additive |
| 0078_slot_exempt_park_blocks (B, 942) | yes | applied · verified | pending, additive; **short lock on `bookings`, quiet time** |
| 0079_activity_changes (B, 961) | yes | applied · verified | pending, additive |
| 0080_coach_time_ranges (C, 965) | **no, parked** | not applied | — |

## 5. The owner's steps. Two orders; **the owner picks one** (Porter asks him)
**Order 1, default (keeps his standing order "sid → Tanya PASS → ขึ้น git"; Porter's memory rule):**
1. After § 3's gate is green: the owner deploys sid **from the parked tree** (SB + SF), nothing else.
2. Post-deploy checks: db:verify green (Journal 80); app up.
3. Tanya: TEST-155 case 4 (3 park blocks drawn), the REQ-5014 test (course + 1 HR change), and Team C's own TESTs.
4. On PASS, the owner says **«ขึ้น git»** (Porter quotes him). One commit per repo on `dong`, made by one SA (proposal: Silver for both repos; the message lists both teams' TASKs and cites both reviews). Push `dong`. Hashes go on the first line of Porter's reply.
5. Unpark 965.

**Order 2 (only if he wants a commit before the deploy):** steps 4 → 1 → 2 → 3. ⚠️ This reverses his standing order, so **it needs his own word for that order**. It gives him a fixed point to deploy from, at the price of committing before Tanya.

Either way: no new branch, no `รวมโค้ด` / release (not asked), and `ai-worker/` files are never committed.

## 6. Sign-off
- Silver (SA-B), 2026-11-13: § 2-B, § 3, § 4 rows B, § 5. ✅
- Sector (SA-C), 2026-11-13: § 2-C ✅ · § 4 rows C ✅ (0077 in, 0080 out) · § 5 **Order 1 agreed**, and **Silver makes both commits** (one hand, both teams' TASKs named) ✅. **§ 3 agreed with three edits:**
  1. **Park TWO tasks, not one:** TASK-965 (Brew, SB) **and TASK-966 (Flash, SF)**. 966 is in progress and touches `CalendarGrid.tsx`, which 942's D-155-1 fix also edits.
  2. **No git for parking at all.** Workspace rule 6: only the SA types git, and only the owner's four commands. So `git apply -R` by an engineer is out, and by me too without his word.
     - **Park:** the engineer **copies every file their task touched** (whole files, new files included, plus `0080` and `_journal.json` for 965) into `<desk>/ai-worker/.private/park-<TASK>/`. Then **with the Edit tool** they remove only their own hunks from the shared files, and move their new files there. Reading `git diff` to see the hunks is fine (a read).
     - **Unpark:** copy the saved files back **before the freeze lifts**. Nobody else has edited those files meanwhile, so the copy is exact.
     - **Each engineer reads back:** `git status` shows none of their files changed.
  3. **The freeze lasts from "go" until both unparks are done**, not just until the deploy. Otherwise an unpark would overwrite someone's newer edit.
- **Gate owners:** I paste Team C's lines (parked SB suite / tsc as part of the joint run; the SF suite is shared). Brew parks 965 and Flash parks 966, each on my ring after Porter's "go".

## 7. OWNER RULING, 2026-11-13 ~01:50, via Porter. This SUPERSEDES § 3 and § 5
- **Verbatim:** *"ก็ทำให้จบทีรเดียวค่อยขึ้น ปล่อยพังไว้งั้นแหละ sid"* (SYSTEM-FACTS l.4594).
- **§ 3 (park / freeze) and § 5 Order 2 are DROPPED.** The new order:
  1. finish every TASK in the tree;
  2. **one full-tree gate** (§ 8);
  3. the owner says «ขึ้น git», and **Silver commits both repos**;
  4. the owner deploys that commit to sid;
  5. Tanya tests;
  6. uat follows the same commit.
- **Team B's status: FINISHED, 2026-11-13.** TASK-942 (with D-155-1), TASK-961 and TASK-962 are all reviewed ✅ and both sid proofs are green. Nothing Team B owes is open, and no Team B edit will touch the tree until the gate, apart from a fix the gate itself finds.
- **Waiting on:** Team C's TASK-965 and TASK-966 (Sector gives the date).

## 8. The full-tree gate (run when Sector says Team C is finished). Both SAs paste the real output here
- SB: `bunx --package typescript@5.9.3 tsc --noEmit` → 0 · the SAFE suite → 0 fail (Team C's run is the parked-suite lines in § 6) · mutation sets of the touched TASKs → all bite.
- SF: `npx tsc --noEmit -p .` → 0 · `bun test` → 0 fail.
- Journal vs ledger on sid: every journal entry (0077 … 0080 and anything newer) is `applied · verified` in MIGRATION-QUEUE, and `db:verify` is ✅ with journal = ledger = witnesses.
- `git status` lists only files of the reviewed TASKs (Team B: § 2-B; Team C: § 2-C). Anything else is named and either explained or taken out by its owner before «ขึ้น git».
- **Commit (on the owner's word only, through the `git-command` skill):**
  - one commit per repo on `dong`;
  - the message names every TASK of both teams;
  - `ai-worker/` files are never committed;
  - push `dong`;
  - the hashes go to Porter for the first line.
- **Added to § 8 (role-sa § 4.10, updated 2026-11-13):**
  - **Pending migrations** are found by comparing `drizzle/*.sql` **in the tree** with what sid has applied (`db:verify`'s list), not from MIGRATION-QUEUE, which lags the tree.
  - **Every SA with work in the checkout writes "nothing new of mine"** here before the commit. One SA's note is never enough.
  - **Silver (SA-B), 2026-11-13:** nothing of Team B's is in the tree beyond § 2-B. I re-confirm at gate time.
- **Silver, 2026-11-13, later:** Team B is **not finished**. TEST-157 failed on sid with D-157-1 and D-157-2 (SF dialog). The fix is with Fanta (TASK-962 § Fix D-157). My "nothing new of mine" waits until it is reviewed.
- **Silver, 2026-11-13, later still:** the D-157 fix is reviewed ✅, so Team B is **finished again**. "Nothing new of mine" stands for § 2-B plus TASK-962's D-157 fix (SF `ChangeActivityDialog.tsx`, `PlanModal.tsx`, `dictionaries.ts`, tests). The SF suite currently has **1 fail, Team C's** (the TASK-596 sweep on the untracked `leave-window-cells-task966.dom.test.tsx`).

## § Gate result — Silver (SA-B), 2026-11-13. Run on the whole tree, after Porter's "Team C is finished"
**SB** (`smart-scheduler-back`, `dong`, HEAD `bfe5ef6` plus the working tree):
- `bunx --package typescript@5.9.3 tsc --noEmit` → **exit 0**.
- SAFE suite (SYSTEM-FACTS l.4327 env: DB unreachable, LINE blanked or dummy) `bun test` → **6041 pass / 0 fail, 398 files**.
- **Migrations, tree vs sid:**
  - The tree has **81** `drizzle/*.sql`, the last being `0080_coach_time_ranges.sql`.
  - Host proven first: `.env` and `.env.sid` `DATABASE_URL` host = **154.197.124.206 = sid** (host only, no value printed).
  - `bun run db:verify` → `Journal: 81 migration(s) · ledger drizzle.__drizzle_migrations_scheduling: 129 row(s) · Schema witnesses: 81 applied · ✅ every migration is recorded in the ledger AND witnessed in the schema`.
  - So **0077–0080 are all applied on sid; nothing is pending.** On uat, 0077–0080 are the owner's (all additive; 0078 takes a short lock on `bookings`).

**SF** (`smart-scheduler-front`, `dong`, HEAD `86316ee` plus the working tree):
- `npx tsc --noEmit -p .` → **exit 0**.
- `bun test` → **1583 pass / 0 fail, 166 files**. The TASK-596 sweep failure I saw earlier is gone (Team C fixed it).

**`git status`, every changed path mapped** (Team B = reviewed in TASK-942 / 961 / 962; Team C = Sector's § 2-C):
- **SB, Team B:**
  - code and migrations: `drizzle/0078_*`, `drizzle/0079_*`, `src/lib/activity-change.ts`, `src/lib/slot-holder.ts`, `src/lib/system-teacher.ts`, `src/lib/booking-sale-amount.ts`, `src/lib/revenue-line.ts` (Sector-reviewed hunk), `src/lib/line-message.ts`, `src/lib/route-access.ts`;
  - shared with Team C: `drizzle/meta/_journal.json`, `src/db/schema.ts`, `src/lib/migration-witness.ts`, `src/lib/line-i18n.ts`, `src/routes/api.ts`, `src/validation.ts`, `src/types/contract.ts`, `src/services/scheduler.service.ts`;
  - tests and mutation sets: `activity-change-task961.*`, `park-several-groups-task942.*`, `system-teacher-task861.*`, `planned-absence-vs-leave-task813.mutations.json`, plus Bob's tagged pin edits (🔻 TASK-942 / 🔻 TASK-961) in the shared count / mirror tests.
- **SB, Team C (959 / 965):** `drizzle/0077_*`, `drizzle/0080_*`, `src/lib/closed-day.ts`, `src/services/closed-day.service.ts`, `src/lib/attention.ts`, `src/services/attention.service.ts`, `src/services/jobs.service.ts`, `src/middleware/uuid-params.ts`, `src/db/mappers.ts`, `src/lib/teacher-leave.ts`, `src/lib/work-days.ts`, `src/services/other-series.service.ts`, the `*task959*` / `*task965*` tests, and the remaining pin and test edits. **Sector confirms these below.**
- **SF, Team B:**
  - `.env.example`;
  - `Bookings/ChangeActivityDialog.tsx` + `change-activity-task962.dom.test.tsx`;
  - `Bookings/PlanModal.tsx`;
  - `Calendar/Modal/BookingModal.tsx`;
  - `Calendar/park-stack-task942.dom.test.tsx`;
  - `hooks/scheduler/useScheduler.ts`;
  - `lib/api/mappers.ts`;
  - `services/scheduler.service.ts` + `scheduler.mock.service.ts`;
  - `lib/ui/masked-input-assert.test.ts` (one line);
  - shared with Team C: `Calendar/CalendarGrid.tsx` (942 stack plus 966), `lib/i18n/dictionaries.ts`, `types/api/contract.ts`.
- **SF, Team C (960 / 966):** `calendar/page.tsx`, `CalendarContent.tsx`, `CalendarWeekGrid.tsx`, `LeaveDay*.tsx`, `Modal/LeaveTeacherPick.tsx`, `Modal/ReportLeaveDialog.tsx`, `Teachers/*`, `ClosedDay*.tsx`, `CloseDayDialog.tsx`, `useClosedDays.ts`, `closed-day.service.ts`, `attention-link.ts`, `types/app/*`, `lib/scheduler/{teacher-scope, work-days}.ts`, and the `*task960*` / `*task966*` / leave / rbac / teacher-scope tests. **Sector confirms these below.**

**Silver (SA-B): nothing new or unreviewed of mine.** Every Team B path above belongs to TASK-942 (with D-155-1), TASK-961 or TASK-962 (with D-157), each reviewed ✅ in its TASK file. My gate checks are green.
**Sector (SA-C):** _his confirmation line for the Team C paths_ (pending).

## § Gate result: Team C's run (Sector, 2026-11-13), on the full shared trees
| Check | Command | Real output |
|---|---|---|
| SB tsc | `bunx --package typescript@5.9.3 tsc --noEmit` | exit **0** |
| SB suite (SAFE = no DB: dummy `DATABASE_URL` inline + `--env-file=.env.sid`) | `bun test` | **6041 pass · 0 fail · 398 files** |
| SF tsc | `npx tsc --noEmit -p .` | exit **0** |
| SF suite | `bun test` | **1583 pass · 0 fail · 166 files** |
| sid journal vs ledger | host printed first = **154.197.124.206**; then `bun run db:verify` (URL inline) | `Journal: 81 migration(s) · ledger …_scheduling: 129 row(s)` · `Schema witnesses: 81 applied` · **✅** |
| Migrations in the tree vs sid | `drizzle/*.sql` tail = 0076 … **0077_closed_days · 0078_slot_exempt_park_blocks · 0079_activity_changes · 0080_coach_time_ranges** | all 4 applied + witnessed on sid; **nothing pending on sid** |

- **About the ledger:** 129 > 81 is the old shared-ledger history (sid's ledger was already 48 rows ahead at Journal 77 / ledger 125 on 11-11). `db:verify`'s ✅ is the rule: every journal entry is in the ledger and witnessed.
- **uat later:** 0077–0080 are pending there (4 migrations). uat stood at Journal 77 / ledger 98 after 11-11, so expect ledger **102** after. 0078 locks `bookings` briefly: quiet time. This updates DEPLOY-NOTE-uat-2026-11-13-close-a-day §AFTER, which was written before 0080.
- **Mutation sets:** the engineers' runs are recorded in their TASKs (959: 10/10 killed; 965: 17/17 killed). I did not re-run them at the gate.

**`git status` mapped to TASKs.** SB has 118 paths, SF 47. Each changed path was tagged by the `TASK-xxx` its diff adds; the untagged ones were read by hand:
- **SB untagged → owner:**
  - `drizzle/meta/_journal.json` → the 0077 / 0078 / 0079 / 0080 entries (959 / 942 / 961 / 965);
  - `other-series.service.ts` → 965 (the cover door passes `startTime`, declared in TASK-965 decision 4);
  - `course-start-change-task570.test.ts`, `additional-teacher-clash.test.ts`, `leave-range-task817.test.ts`, `resume-picks-teacher-req089.test.ts`, `system-teacher-task861.test.ts` → source pins re-quoted by 959 / 965 (declared);
  - 6 `*.mutations.json` (task813 / 815 / 817 / 819 / 824 / 861) → anchors re-pointed by 959 / 965 (declared).
- **SF untagged → owner:**
  - `Teachers/TeachersContent.tsx` → 966 (passes `workHours`; ⚠️ the diff also un-indents one `</div>`, cosmetic only);
  - `types/app/attention/index.ts` → 960 (link kind `day`).
- **Everything else** carries a tag of a reviewed TASK: 942 · 959 · 960 · 961 · 962 · 965 · 966.

**Sector: nothing new or unreviewed of Team C's is in either tree.** Team C's content is exactly TASK-959 / 960 / 965 / 966 (all ✅ DONE, my reviews), plus my review of Bob's revenue hunk inside 961. Team C's side of the gate is **GREEN**. Ready for the owner's «ขึ้น git» (Silver commits both repos per § 7).

## «ขึ้น git» done — Silver (SA-B), 2026-11-13. The owner's word was relayed by Porter (verbatim «ขึ้น git», ~03:35)
- **smart-scheduler-back `dong`:** commit **`738b6eb`**. All 118 gate-mapped paths, 0 left. TASKs 942 · 959 · 961 · 965. Pulled ("Already up to date"), then pushed `bfe5ef6..738b6eb dong -> dong`. Status: `## dong...origin/dong`.
- **smart-scheduler-front `dong`:** commit **`6c52040`**. All 47 gate-mapped paths, 0 left. TASKs 942 · 960 · 962 · 966. Pulled ("Already up to date"), then pushed `86316ee..6c52040 dong -> dong`. Status: `## dong...origin/dong`.
- Convention: the repos' own (`feat: <summary> (TASK-…)`). No `ai-worker/` file was committed, no branch was created, and there was no `รวมโค้ด` / release.
- **Next, the owner's:** deploy **these commits** to sid (no pending migration, Journal 81 ✅), then Tanya re-runs TEST-155 case 4 and TEST-157 cases 3 and 5, plus Team C's tests. uat follows the same commits, with 0077–0080 for the owner at a quiet time.

## § One writer at a time for `scheduler.service.ts` (Sector agrees with Silver, 2026-11-13, after Bob's edits were overwritten twice)
- **The rule:** at any moment only **one** engineer edits SB `src/services/scheduler.service.ts`.
  - The holder is named on the board (the claim line), and the next writer starts only after the holder says "released" to their SA, and the SA tells Porter.
  - Every edit is preceded by a fresh Read.
- **Now (2026-11-13):** **Bob holds it** for TASK-971's review fixes. Brew has nothing open there: TASK-969 is DONE, and TASK-967 waits for Bob's release *and* the uat unfreeze.
- **My check today:** both teams' work is intact in the file:
  - Brew's `courseSlotsOf`, the `nextFreeSlot` helper used by both make-up writers, `isPattern` ×5;
  - Bob's `leaveTakesNewWeek` at both quota doors + `undoReturnsWeek`, `wholeDay`, the change-pattern act (`course-pattern-change.service.ts`), resume on the pattern;
  - the suite was green at 6092 / 0.

## § Gate result #2: REQ-5016 (Team C's run, Sector, 2026-11-13), the full shared trees on top of the committed `738b6eb` / `6c52040`
| Check | Real output |
|---|---|
| SB `bunx --package typescript@5.9.3 tsc --noEmit` | exit **0** |
| SB suite (dummy `DATABASE_URL` inline + `--env-file=.env.sid`) | **6133 pass · 0 fail · 403 files** |
| SF `npx tsc --noEmit -p .` | exit **0** |
| SF `bun test` | **1642 pass · 0 fail · 172 files** |
| sid `db:verify` (host printed first = **154.197.124.206**, URL inline) | `Journal: 82 · ledger 130 · witnesses 82` **✅** |
| Migrations in the tree vs sid | the tree's newest is **0081_course_slots**: applied + witnessed on sid (MIGRATION-QUEUE). **Nothing pending on sid.** uat later: 0077–0081 = **5 pending**, ledger 98 → **103**. 0078 locks `bookings` briefly: quiet time. |

**`git status` vs `738b6eb`:** SB 75 paths, SF 20 paths. Every path's diff carries a TASK-969 / 970 / 971 / 972 tag, except these, read by hand:
- **SB:**
  - `_journal.json` → 0081 (969);
  - `advance-leave-on-extended-req089.test.ts` → a source pin re-quoted by 969 (`patternRows ? 0 : …`);
  - `declared-absence-stretches-expiry-task646` / `leave-refused-no-validity-task692` / `leave-week-triggers-task656` `.mutations.json` → anchors re-pointed to Bob's `declarationTakesNewWeek` (971).
- **SF:** ⚠️ `Bookings/ChangeActivityDialog.tsx` is **Team B's file, not REQ-5016**. A bug fix: the debounced error text follows the *current* language, through `errorTextRef`. Silver must confirm it is a reviewed Team B change, or its owner takes it out, before «ขึ้น git».

**Sector: nothing new or unreviewed of Team C's is in either tree.** Team C's content is exactly TASK-969, TASK-970 (+ A1), plus 967 / 968, which are not started. Team C's side of the gate is **GREEN**, with one open item for Silver (`ChangeActivityDialog.tsx`).

## § Gate result #2: Team B's side (Silver, 2026-11-13)
- **Re-run by me on the current trees:** SB `bunx --package typescript@5.9.3 tsc --noEmit` → **0** · SF `npx tsc --noEmit -p .` → **0**.
  - For the suites I rely on Sector's run above (SB 6133 / 0, SF 1642 / 0). They match my last SB SAFE run (6133 / 0, after Bob's rework) and Fanta's SF report (1638 + her 4 new tests).
  - sid `db:verify`: Sector's (82 ✅). Nothing of Team B's adds a migration.
- **Team B paths:** grepped for the `TASK-971` / `TASK-972` tags in each changed path's diff or new file.
  - **SB (TASK-971):** `leave-week-quota.ts`, `pattern-change.ts`, `course-pattern-change.service.ts`, `undo.service.ts`, `route-access.ts`, `line-message.ts`, `api.ts`, `validation.ts`; Bob's hunks in `scheduler.service.ts`; the `*task971*` tests and mutation sets; the tagged pin edits (task609, counter-sql, rbac, course-ended-writes, closed-day-task959, leave-week-triggers-task656 and its mutation set).
  - **SF (TASK-972):** `ChangePatternDialog.tsx`, `BookingModal.tsx`, `PlanModal.tsx`, `useScheduler.ts`, `scheduler.service.ts` + mock, `contract.ts`, `dictionaries.ts`, the `*task972*` tests.
- **`SF Bookings/ChangeActivityDialog.tsx`:** **reviewed and accepted in TASK-972 § Review 1** ("the out-of-list edit … accepted"). Fanta disclosed it as found while building TASK-972. The diff is +4 / −1: the debounced error reads `errorTextRef.current`, so the message follows the current language. **Mapped to TASK-972.** It stays in the tree.
- **Silver (SA-B): nothing new or unreviewed of Team B's is in either tree.** Everything above is TASK-971 or TASK-972, each ✅ DONE in its TASK file. Team B's side of gate #2 is **GREEN**. Ready for the owner's «ขึ้น git» (Silver commits both repos, as before).

## § «ขึ้น git» #2 done (Silver, 2026-11-13, owner's word relayed by Porter)
- SB `dong`: **`414a320`** (TASK-969, TASK-971) · 75 files · pushed `738b6eb..414a320` · `git status` clean.
- SF `dong`: **`3c94c8b`** (TASK-970, TASK-972 incl. `ChangeActivityDialog.tsx`) · 20 files · pushed `6c52040..3c94c8b` · `git status` clean.
- Path counts equal gate #2 (SB 75, SF 20); `pull` was "Already up to date". Migration for the deploy: 0081 already applied on sid, nothing pending there.

## § One writer: Bob released (Silver, 2026-11-13)
- Bob **no longer holds** SB `scheduler.service.ts`. TASK-971 is ✅ DONE and committed in `414a320`, and the SB tree is clean (`git status --porcelain` empty). Bob has no open item in that file; TASK-961 Amendment 1 waits for the uat deploy and will re-claim through me and Porter if it needs the file.
- **Brew may take it** for D-159-1 (`getEntitlementPlan` only), as Sector named. Fresh Read before every edit.

## § Gate result #3: D-159-1 fix (Team C's run, Sector, 2026-11-13), the full shared trees on top of the committed `414a320` / `3c94c8b`
| Check | Real output |
|---|---|
| SB `bunx --package typescript@5.9.3 tsc --noEmit` | exit **0** |
| SB suite (dummy `DATABASE_URL` inline + `--env-file=.env.sid`) | **6138 pass · 0 fail · 404 files** |
| SF `npx tsc --noEmit -p .` | exit **0** |
| SF `bun test` | **1648 pass · 0 fail · 173 files** |
| sid `db:verify` (host printed first = **154.197.124.206**, URL inline) | `Journal: 82 · ledger 130 · witnesses 82` **✅**. No migration in this fix, so nothing pending on sid. |

**`git status` vs the committed base: every path is mapped to a TASK that has been reviewed.**
- **SB, 4 paths, all TASK-973 (Brew, DONE by Sector):**
  - `src/db/mappers.ts`;
  - `src/services/scheduler.service.ts` (`getEntitlementPlan` only);
  - `src/lib/duo-course-req095-13.test.ts` (a source-text pin);
  - new `src/services/entitlement-plan-slots-task973.test.ts`.
- **SF, 8 paths:**
  - **TASK-974** (Flash, DONE by Sector): `CreatePlanFlow.tsx` (l.255), `lib/scheduler/weekly-pattern.ts`, new `weekly-pattern-order-task974.test.ts`.
  - **TASK-972 Amd 1 + 1b** (Fanta, signed by Silver): `BookingModal.tsx`, `ChangePatternDialog.tsx`, `dictionaries.ts`, `booking-menu-doors-task972.dom.test.tsx`, `change-pattern-task972.dom.test.tsx`.
- **Team C: nothing new of mine** beyond 973 / 974. Team B's "nothing new" is Silver's to confirm.

## § «ขึ้น git» #3 done (Silver, 2026-11-13, owner's word relayed by Porter)
- Team B "nothing new of mine": the only Team B paths are TASK-972 Amd 1 + 1b (5 SF files, reviewed ✅). No SB, no migration.
- SB `dong`: **`fd6884f`** (TASK-973) · 4 files · pushed `414a320..fd6884f` · clean.
- SF `dong`: **`6ffaa6e`** (TASK-972 Amd 1/1b, TASK-974) · 8 files · pushed `3c94c8b..6ffaa6e` · clean.
- Path counts equal gate #3 (SB 4, SF 8); pull "Already up to date". sid: nothing pending (no migration).

## § Gate result #4: D-159-2 fix (Team C's run, Sector, 2026-11-13), on top of the committed SB `fd6884f` / SF `6ffaa6e`
| Check | Real output |
|---|---|
| SB tsc (5.9.3) | exit **0** |
| SB suite (dummy `DATABASE_URL` + `--env-file=.env.sid`) | **6144 pass · 0 fail · 405 files** |
| SF | tree **clean** at `6ffaa6e` (0 paths). Gate #3's 1648/0 still stands; nothing to re-run. |
| sid `db:verify` (host printed first = **154.197.124.206**) | `82 · 130 · 82` **✅**. No migration. |

**`git status`:** SB has 2 paths, both TASK-975 (Brew, DONE by Sector): `src/lib/course-pattern.ts` and the new `src/lib/course-pattern-task975.test.ts`. **Team C: nothing new of mine** beyond them. Team B has no paths in this round.

## § «ขึ้น git» #4 done (Silver, 2026-11-13, owner's word relayed by Porter)
- Team B: nothing new of mine (no paths this round).
- SB `dong`: **`40f2917`** (TASK-975) · 2 files · pushed `fd6884f..40f2917` · clean. Paths equal gate #4; pull "Already up to date".
- SF `dong`: unchanged at **`6ffaa6e`**, clean. No migration; sid nothing pending.

## § «รวมโค้ด» done (Silver, 2026-11-13, owner's word relayed by Porter)
- SB `merge-workflow.sh` → exit 0, "✅ Sync Complete!". develop pushed `bfe5ef6..40f2917`. develop = dong = origin/develop = **`40f2917`**. No conflict. Back on `dong`, clean.
- SF `merge-workflow.sh` → exit 0, "✅ Sync Complete!". develop pushed `86316ee..6ffaa6e`. develop = dong = origin/develop = **`6ffaa6e`**. No conflict. Back on `dong`, clean.
