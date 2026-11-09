# TASK-872: Salary hours reader: timetable → teaching minutes per day per class type (SPEC-101 §5, link 2)
- Source: SPEC-101 §5 (Sober's contract) · DECISIONS-REQ-120-build row 16 (Brew is the 2nd BE on the Salary spine; Team C cuts it)
- Owner: BE (Brew, Team C) · SA: Sector (questions and review); the contract is Sober's SPEC-101. A contract question goes to me, and I take it to Porter. Never to Sober or Jason directly.
- Status: DONE (Sector, 2026-11-08; module + follow-up 1)
- Depends on: **none. Start now.** Key the output on the class-type **strings** `private | duo | group | eca | camp` (a local string-union type). Do not import TASK-871's `bo` enum (Sober, relayed by Porter 2026-11-08).
- Repo: `smart-scheduler-backoffice-back` (BB). Git is the SA's alone, on the owner's word. **Edit nothing until Porter's claim line names these files for Team C.**
- Base branch: `dong` · Repo history read: 2026-11-08, dirty tree (Team A's in-flight work: 34 entries; leave it alone).
- **Base (Sector, 2026-11-08, dummy URL inline):** `bun test` → `244 pass · 0 fail · 19 files`; `bunx tsc --noEmit -p .` → 0 `error TS`.
- 🔴 **Host check before anything that can connect** (SYSTEM-FACTS 2026-11-08). **This TASK writes nothing to any database, ever:** no migration, no insert, no `db:*`.
- Files the engineer may edit (closed list, nothing else):
  - `src/services/hours-reader.ts` (new): `readHours` and its helpers
  - `src/services/hours-reader.test.ts` (new)
  - `src/services/hours-reader.fixtures.ts` (new): timetable shapes for the tests
  - `src/db/pub-timetable.ts` (new): **read-only** declarations of only the scheduling `public` columns the reader needs.
    - Same rule as `schema.ts` l.591–601: SB owns those tables; BB never writes or migrates them.
    - It is **not** added to `drizzle.config.ts` (and `schemaFilter` is `["ops","bo"]` anyway).
- **Not yours:** `schema.ts`, `drizzle.config.ts`, `drizzle/`, any route, `api.ts`, anything of TASK-871's (people model, `fl_rate`, pay period) or of SPEC-100's pay run.

## What to do
0. **Step 0: map the source first, in Implementation Notes, before any code** (SPEC-101 §5 says the SPEC does not guess it). Read `smart-scheduler-back`'s `src/db/schema.ts` and the places that already compute coach hours, then write a short map:
   - which table/rows are "a class a coach taught": bookings, and/or sessions, seats, `booking_teachers` (several coaches on one OTHER);
   - the teacher column(s);
   - the date;
   - the duration (start/end, or slot length);
   - PRIVATE / DUO / GROUP, and how **ECA** and **camp** are told apart;
   - **which statuses count:** cancelled, again/make-up, leave, no-show (REQ-120 §9.4 #3: *a child no-show with the coach there counts for the coach*);
   - **how a GROUP slot with several seats is counted once for the coach, not once per child.**
   - Start with `grep -rn "hours" src/services src/lib` in SB for existing coach-hour logic (e.g. the budget/freelance-ceiling hours, the weekly teacher digest), and cite file:line. Where an existing function already answers "a coach's taught hours", say so: your reader must agree with it, or explain why not.
   - **Unclear after reading?** Write a decision pack in ## Questions (your default + each case). Don't guess.
1. **Contract (SPEC-101 §5, exact):**
   `readHours(teacherId: string, start: string /*YYYY-MM-DD*/, end: string /*inclusive*/) → Promise<Array<{ date: string; byType: { private: number; duo: number; group: number; eca: number; camp: number }; teachingMinutesTotal: number }>>`
   - **Unit = integer minutes** (SPEC-101 prefers it). Every `byType` value is minutes.
   - **The total field is `teachingMinutesTotal`,** the sum of `byType`, in integer minutes. Sober resolved the name and updated SPEC-101 §5/§6 (Porter, 2026-11-08). Link 3 treats a missing day as zero; you may omit a no-teaching day (as above), and say which you chose. Any other change to the output shape goes to me first: link 3 (Sober's) consumes exactly this contract.
   - One entry per calendar day in `[start, end]` that has teaching. Days with none are omitted.
   - Dates are Asia/Bangkok calendar dates.
   - Pure core: split it into `collectRows(teacherId, start, end)` (the only DB read) and a **pure** `bucketMinutes(rows)`. The rules live in the pure part, tested without a DB.
2. **Read-only by construction:** `pub-timetable.ts` declares only `pgTable` columns that are SELECTed. The service uses only `db.select`. Add a test that greps `hours-reader.ts` for `insert(`/`update(`/`delete(`/`execute(` and fails if any appear.
3. **Fixtures:** one per tricky shape from step 0, at least:
   - a PRIVATE, a DUO, a GROUP with 3 seats (counted once);
   - an ECA, a camp day;
   - a cancelled one (excluded), a make-up (by the rule you found), a child no-show with the coach present (counted);
   - an OTHER with 2 coaches (each gets the minutes, or the rule you found);
   - a class crossing no midnight; a period edge (first and last day inclusive).
   - Each fixture names the step-0 rule it pins.

**You may decide alone, and declare:** helper names, how you query (one SELECT with joins, or a few), and the fixture layout.
**You may not:** compute pay, read rates or roles (that's links 1 and 3), write anything, or add a dependency.

## Definition of Done
- [ ] Step 0's map is written, with file:line citations into `smart-scheduler-back`.
- [ ] `DATABASE_URL=postgres://x:x@localhost:5432/none bun test` → `0 fail`, pass > 244, files ≥ 20.
- [ ] `bunx tsc --noEmit -p .` → 0 `error TS`.
- [ ] `grep -nE "insert\(|update\(|delete\(|execute\(" src/services/hours-reader.ts` → no output (also asserted by a test).
- [ ] **A real read on sid, read-only.** Host check printed first (.206). A scratch script outside the repo calls `readHours` for one real sid teacher over `2026-10-01..2026-10-31`.
  - Paste the day count and the per-type minute totals only. **No names, no student data.**
  - Cross-check one day by hand against what the SB admin timetable shows for that teacher, by reading the rows; say how.
- [ ] `git status --porcelain` → only the four new files are yours.

## Implementation Notes
**Brew, 2026-11-08. Claim confirmed on the board (Team C / Brew, TASK-872: `hours-reader.ts` +test +fixtures, `pub-timetable.ts`). Host `.env` = `.206` (sid), host only. Everything below read-only; no code was written before this map.**

### Step 0 — the timetable map (source: `smart-scheduler-back`, `dong` @ `0a1f250`, dirty tree)
**What "a class a coach taught" is: one row of `bookings` (`src/db/schema.ts:456-630`).** No separate sessions table. A GROUP's seats are also `bookings` rows (see below). Extra coaches live in `booking_teachers` (`schema.ts:643-658`).

| Need | Where (file:line) | Rule |
|---|---|---|
| teacher | `bookings.teacher_id` (`schema.ts:463`, NOT NULL, the FIRST/only coach) + `booking_teachers (booking_id, teacher_id)` (`:643-658`) for extra coaches | a coach is on a row if `teacher_id = X` OR a `booking_teachers` row names X. Extras exist on OTHER and GROUP rows only (`scheduler.service.ts:3817` `coTaught`); "teachers[0] is always teacher_id" (`:636-639`) |
| date | `bookings.date` (`:469`), a plain `date` = the Asia/Bangkok calendar day | no timezone conversion needed |
| duration | `start_time`, `end_time` (`:470-471`, `time`) | minutes = end − start. Same as `som-contract.ts:619-623` `minutesOf` (clamps negatives to 0). A camp hour is one 60-min row |
| type | `booking_type` enum (`:42-53`): FIRST_TRIAL · SINGLE_SESSION · COURSE_PACKAGE · VOUCHER · OTHER · GROUP | see class-type table below |
| status | `booking_status` enum (`:55-71`): PENDING · CONFIRMED · ATTENDED · SICK_LEAVE · NO_SHOW · EXTENDED · PENDING_RESCHEDULE · CANCELLED · PAUSED | see status table below |
| ECA / camp | `bookings.other_kind` (`:544`): ECA · FREE · KOL (`lib/other-kind.ts:9`) and CAMP (`:10-12`, derived rows only) | ECA = `other_kind='ECA'`; camp = `other_kind='CAMP'` (also has `camp_week_day_id`, `:563`) |
| DUO | `bookings.co_student_id` (`:567`) "a DUO course row's second child… NULL otherwise"; and GROUP rows with `other_kind='DUO'` (`other-kind.ts:18`) | |
| GROUP seats | `bookings.group_id` (`:550`) set ⇒ a SEAT; the GROUP row has `group_id IS NULL`, `booking_type='GROUP'`, `other_kind` DUO/GROUP, `group_key` (`:549`) | **a seat holds no slot; its GROUP row is the one booking the coach teaches** (`slot-holder.ts:1-6`, `schema.ts:603-614`) |
| yielded group | `bookings.slot_yielded_at` (`:559`) | a GROUP row that gave its coach-hour to a Private on an empty date (`slot-holder.ts:11-15`) |

**Class type (my mapping; the 5 values of the contract):**
- `private` = FIRST_TRIAL · SINGLE_SESSION · COURSE_PACKAGE · VOUCHER, not a seat (`group_id IS NULL`), `co_student_id IS NULL`.
- `duo` = COURSE_PACKAGE/other lesson with `co_student_id` set (a DUO course in its own slot), OR a GROUP row with `other_kind='DUO'`.
- `group` = a GROUP row with `other_kind='GROUP'`.
- `eca` = OTHER with `other_kind='ECA'`.
- `camp` = OTHER with `other_kind='CAMP'`.
- NOT a class type: OTHER with `other_kind` NULL (meeting · maintenance · school visit, `schema.ts:526-531`), FREE, KOL, and every SEAT. No double count: a DUO course that is seated in a DUO GROUP appears as seat rows (excluded) and one GROUP row (counted once, as `duo`).

**Statuses — the evidence behind my defaults**
- `slotHolderWhere` / `holdsSlot` (`slot-holder.ts:22`, `:33`): a row holds the coach's slot iff status ∉ {CANCELLED, PENDING_RESCHEDULE, SICK_LEAVE, PAUSED} (`schema.ts:94`), not a seat, not yielded.
- The day-end job turns every CONFIRMED class whose start has passed (last 7 days) into ATTENDED, **with no booking-type filter**, so GROUP, ECA and camp rows too (`jobs.service.ts:56-78`, `:82-83`); it "can no longer produce NO_SHOW" (`:128-129`), and it never touches EXTENDED or PENDING (`:78`).
- A camp row is born CONFIRMED (`camp.service.ts:280-311`); a make-up is born CONFIRMED (`schema.ts:483-486`, TASK-702).
- REQ-120 §9.4 #3 (`requirements/REQ-120…`, line 234): *a child no-show, the coach was there → the hour counts for the coach* (A4). Since the day-end writes ATTENDED for an unmarked class, that case is ATTENDED in the data; legacy NO_SHOW rows exist from before.

**Existing code that answers a nearby question: `countCapacity` (`som-contract.ts:625-670`)** = a coach's BOOKED hours for the SOM dashboard. It counts lessons + the GROUP row, never seats, never ECA or camp (`:636`); every status except CANCELLED (`:593`, so PENDING, PAUSED, SICK_LEAVE, EXTENDED all count); extra coaches count (`:640`); minutes = end − start (`:619`). **My reader agrees with it on: seat exclusion, the GROUP row counted once, extras counted, end − start.** **It differs on purpose:** it is a capacity/booking measure, so (1) it excludes ECA and camp (pay needs them), (2) it counts SICK_LEAVE/PAUSED/PENDING rows that hold no teaching. There is no other function that returns "hours a coach taught"; I grepped SB `src` for `teachingHours|coachHours|hoursTaught|durationMinutes` and found none outside `som-contract.ts`.

### The rules I will build, and what each pins (all named constants in `hours-reader.ts`; one-line to flip)
1. **Counted statuses = CONFIRMED · ATTENDED · NO_SHOW.** Not counted: PENDING · EXTENDED (never confirmed/attended) · SICK_LEAVE · PENDING_RESCHEDULE · PAUSED · CANCELLED.
2. **Seats never count; the GROUP row counts once** (whatever the number of seats), by its own minutes.
3. **A yielded GROUP row (`slot_yielded_at` set) does not count**; the Private that took the hour does.
4. **Extra coaches (`booking_teachers`) each get the row's full minutes.**
5. **OTHER with `other_kind` NULL, FREE or KOL: not counted** (not one of the five types).
6. **Make-up rows count like any class** (`is_makeup` is not a filter; it is an ordinary CONFIRMED/ATTENDED class).
7. Days with no teaching are omitted; sorted ascending by date; minutes are integers.

### Built (all inside the closed list) and evidence
- New: `src/db/pub-timetable.ts` (read-only `ttBookings`, `ttBookingTeachers`; 10 + 2 columns, `text` for SB's enums, no FK, not in `drizzle.config.ts`) · `src/services/hours-reader.ts` · `hours-reader.fixtures.ts` · `hours-reader.test.ts`. `git status --porcelain`: **34 before → 38 after = exactly these 4**; I changed no other file for this TASK (the `drizzle.config.ts` diff in the tree is my earlier TASK-858 schema-array line).
- Shape: `collectRows(teacherId, start, end)` = the only DB read (one `db.select`, `teacher_id = X OR exists(booking_teachers…)`, date `>=`/`<=` inclusive; imported lazily so the pure half needs no database) · `bucketMinutes(rows)` pure · `classifyRow` / `skippedMinutes` (nothing is dropped unexplained) · `readHours(teacherId, start, end)` = the exact contract, `teachingMinutesTotal`, integer minutes, ascending, empty days omitted; a bad uuid / date / `start > end` → 400 `VALIDATION` before any read.
- **Decided alone, declared:** helper names; one SELECT with an `exists` subquery (not a join, so a row on which the coach is both first and extra coach cannot double); `text` for the enum columns; `collect` injectable as a 4th optional argument purely so the composition is testable; a belt-and-braces date filter in `readHours`; unknown GROUP kinds / booking types are surfaced as a named skip, never guessed into a bucket.
- **Dummy URL** (`DATABASE_URL=postgres://x:x@localhost:5432/none`): `bun test` → **`294 pass · 0 fail · 20 files`** (base `244 / 0 / 19`; +50 pass, all in `hours-reader.test.ts`; files ≥ 20 ✓).
- **tsc → exit 0, 0 `error TS`** with `bunx --package typescript@5.9.2 tsc --noEmit -p .`. Tooling note: plain `bunx tsc` now panics on this machine (it fetches the native `typescript@latest`: "lib.d.ts does not exist"), which is not a type error; neither repo has a local TypeScript. I pinned 5.9.2 for the check and changed nothing in the repo (`bun.lock` untouched, `git status` count unchanged).
- `grep -nE "insert\(|update\(|delete\(|execute\(" src/services/hours-reader.ts` → no output (exit 1); the same is asserted by a test, plus "no `.transaction`", "no `db.insert/update/delete`", "pub-timetable has no enum / FK / `bo.table`", "`drizzle.config.ts` does not name pub-timetable".
- Fixtures (20, each names the rule it pins): Private · trial/voucher as Private · DUO course · **GROUP with 3 seats counted once** · DUO group + seated DUO courses (no double count) · GROUP with no child · ECA · **camp day (5 derived rows)** · cancelled/sick/paused/pending-reschedule · PENDING/EXTENDED · **child no-show with coach present** · make-up · **OTHER with 2 coaches** · yielded GROUP vs the Private that took the hour · meeting/FREE/KOL · all-types sum · late evening class · date order with an idle day. Plus the period edge (30/9 and 1/11 out, 1/10 and 31/10 in), single-day period, and "counted + skipped minutes = every row's minutes" over all fixtures.
- **The real read on sid (read-only; two scratch scripts outside the repo; host `154.197.124.206` printed first; each also run once with the dummy URL and aborted):** one real coach (`7c9bbc14…`, picked as the one with the most October rows; no names, no student data, no booking ids), period `2026-10-01..2026-10-31`:
  - `days with teaching: 14` · per-type minutes `private 2940 · duo 0 · group 300 · eca 0 · camp 120` · **total 3360 min (56.00 h)**; integers, dates ascending and unique, total = Σ byType on every day: all true.
  - 155 rows touch the coach (146 as first coach + 9 as extra coach). Excluded by reason (minutes): `status 4200 · seat 1560 · not-a-class-type 180`; **no `unknown-*` skip, so no rule gap on this coach.**
  - **Hand cross-check of `2026-10-05`** (the busiest counted day): I re-read its 12 rows with an independent plain-SQL query and re-derived each row's class by hand with separately written logic (not `classifyRow`): 9 ATTENDED Private hours counted (9 × 60 = 540), 3 CANCELLED hours excluded. Hand `{"private":540,…} total 540` = reader `{"private":540,…} total 540`, `MATCH: true`. **Not done:** the comparison against the SB admin timetable screen itself (no login; I do not sign in). The row list printed by the script (time, type, status, no names) is what to put beside that screen.
  - **Extra-coach path on real Postgres:** a coach who is on a booking only through `booking_teachers` gets it back from `collectRows` (`true`, 19 rows).
- **Not verified:** the pay semantics of the five defaults (they are Questions, below); `collectRows` for a year-long range (performance); a coach on `is_system`.

## Questions
**Decision pack for Sector (to Porter if needed).** One message. I built, and will build, on the defaults below; each is one constant, so a different answer is a one-line change plus its fixture. These are money rules (they decide a slip), so I am not deciding them alone.
*Real impact on the sid coach above, October (3360 min counted by the defaults): [Q1] PENDING = +300 min (+8.9 %), EXTENDED = +0 · [Q2] attended FREE = +120 min, attended OTHER-with-no-kind = +60, KOL = +0 · [Q4] yielded GROUP = +0 (its only yielded row is PENDING) · [Q3] 5 GROUP rows counted. So Q1 and Q2 are not theoretical: they move a real slip.*
1. **Which statuses count as "taught"?** Default: CONFIRMED + ATTENDED + NO_SHOW. PENDING and EXTENDED excluded (never confirmed; the day-end never settles them, so a past PENDING/EXTENDED row is a class nobody confirmed). *Alternative:* count everything `holdsSlot` allows, which adds PENDING and EXTENDED (what the SOM capacity number does). *Case:* a past PENDING class → default 0 min.
2. **ECA/Camp "Free" and "KOL" classes** (`other_kind` FREE, KOL) and **OTHER with no kind** (meeting, maintenance, school visit): default NOT counted, because they are not one of private/duo/group/eca/camp and the non-teaching hours are admin-entered OT (SPEC-101 §5). *Alternative:* count FREE/KOL as `eca`. I need to know if a coach teaching a Free/KOL class should earn Extra Hour minutes for it.
3. **A GROUP row with no live child** (every seat on leave/cancelled, or nobody enrolled yet): default COUNTED (the class is on the timetable and the coach is there, as the capacity number does). *Alternative:* count only if ≥ 1 live seat.
4. **A yielded GROUP row** (a Private took its hour): default NOT counted, to avoid counting the same coach-hour twice. If a child is also seated on it (a clash an admin resolves), the data holds a Private and a live seat on one hour; default still counts only the Private.
5. **Camp days created after their date** (`camp.service.ts:283`: a past date derives no booking rows, so a week created mid-week has no rows for the days already gone). The reader reads `bookings` rows (SPEC-101 §5: "ECA/Camp via the booking code"), so those past days have 0 camp minutes even though `camp_week_day_teachers` knows the coach was on them. Default: bookings rows only. *Alternative:* also read `camp_week_days` + `camp_week_day_teachers` for days with no derived row. Is that a real case for this business, or is a camp week always created before it runs?
6. **First Trial and Voucher sessions are `private`** (a Voucher drawn into a group is a seat and is excluded). Stated so it is checked, not asked: say if a trial should not be `private`.
7. Not a question, a declaration: for a coach who is `is_system` ("No Teacher") the reader just returns whatever rows name them; it never special-cases them.

## Review

> **answers (Sector, 2026-11-08):** split by whose call it is.
> **Decided here [SA-decided], technical:**
> - **Q4 (yielded GROUP not counted; with a clash, only the Private counts): accepted.** One coach-hour can't be paid twice. The rule follows the slot-holder rule the scheduler already uses (`slot-holder.ts:11–15`).
> - **Q6 (Trial and Voucher sessions = `private`; a voucher seat in a group is excluded as a seat): accepted.** The contract has five types, and a one-to-one class is private.
> - **Q7 (`is_system` not special-cased): accepted.** No pay rule reads the system teacher; link 3 never builds a slip for it (Sober's side).
>
> **Sent up as a decision pack** (Porter decides whether it needs Khwan or is Sober's spine call). They decide a slip, so neither of us settles them alone. Your defaults stay in the code until answered; each is one constant plus its fixture.
> - **Q1 statuses:** default CONFIRMED + ATTENDED + NO_SHOW (a past PENDING or EXTENDED class is not paid). Real impact: the October sample coach +300 min (+8.9 %) if PENDING counts.
> - **Q2 FREE / KOL / OTHER-with-no-kind:** default not counted (OT for non-teaching is admin-entered). Impact on the sample: +120 min if FREE counts, +60 if no-kind OTHER counts.
> - **Q3 GROUP with no live child:** default counted (the coach is there).
> - **Q5 camp days created after their date:** default bookings rows only (0 min for those days). This is a data question first: does a camp week ever get created mid-week? Porter can answer from how she operates.

**Review, Sector, 2026-11-08. Verdict: DONE** (the module; the four pay-rule constants Q1/Q2/Q3/Q5 follow Porter's answers, each a one-line change plus its fixture, cut then).
- **Re-run by me:**
  - `bun test` (dummy URL) → `294 pass · 0 fail · 20 files` (base 244/0/19);
  - `bunx --package typescript@5.9.2 tsc --noEmit -p .` → 0 `error TS`. Plain `bunx tsc` now fetches a broken latest, as he found. **TASK DoD lines on this machine use the pinned 5.9.2 from now on;**
  - the write-grep on `hours-reader.ts` → 0;
  - the counted statuses are one named constant (`hours-reader.ts:56`).
- **Evidence:**
  - the step-0 map with file:line throughout, cross-checked against the existing `countCapacity` (agrees on seats, GROUP counted once, extras, end − start; differs on purpose, with reasons);
  - 20 fixtures, each naming its rule, plus "counted + skipped = all minutes";
  - a real sid read: 14 days, 3360 min, no unknown skips, a hand re-derivation of 2026-10-05 matching (540 = 540), and the extra-coach path on Postgres.
- **Contract:** exactly SPEC-101 §5 as resolved (`teachingMinutesTotal`, integer minutes, Bangkok dates, empty days omitted).
- **Security review:** read-only by construction (one `db.select`; tests forbid writes and transactions); inputs validated before any read (uuid, date, start ≤ end → 400); no personal data in output (teacher id in, minutes out). Findings: none.
- **Not checked by anyone yet:** a year-long range's speed (link 3 reads one period at a time, so it is not needed now), and the admin-timetable screen beside the row list (no login).

**Follow-up 1 (Sector, 2026-11-08), Brew: Q3 flips. Status back to IN_PROGRESS for this one change.**
- **Q3, a GROUP row with no live child: NOT counted.** Khwan already answered it (REQ-105 §5 #4, 2026-09-23, via Porter): *"Empty week ⇒ the coach is FREE (can be booked for other work). A group slot with students blocks the coach."* An empty group isn't the coach's work.
  - Change the constant and its fixture; cite REQ-105 §5 #4 in the comment.
  - "Live child" = at least one seat whose status the reader would count (CONFIRMED / ATTENDED / NO_SHOW). Say if the seat statuses need another rule.
- **Q1, Q2, Q5: defaults kept.** Sector read uat (`scripts/uat-select.mjs`, host 154.197.124.29 = uat per SYSTEM-FACTS; counts only):
  - **Q5:** 12 camp days in total; 0 were created after their own date, and 0 have a teacher with no booking row.
  - **Q1:** the last 90 past days, non-seat rows: PENDING 4 rows / 240 min, EXTENDED 0, against ATTENDED 2355 rows / 141,300 min (0.17 %).
  - **Q2:** FREE / KOL: 0 rows ever.
  - Porter decides whether any still goes to Khwan.
- **DoD for this change:** `bun test` (dummy URL) 0 fail with pass ≥ 294; pinned tsc 0; the empty-GROUP fixture now expects 0 min plus a group-with-one-live-seat fixture counted once; then set REVIEW.

**Follow-up 1 — done (Brew, 2026-11-08). Q3 flipped: an empty GROUP is not counted.**
- **The change (`hours-reader.ts`):** new named constant `COUNT_EMPTY_GROUP = false` with the REQ-105 §5 #4 citation (Khwan, 2026-09-23: *"Empty week ⇒ the coach is FREE … A group slot with students blocks the coach."*). A GROUP row counts only while it has ≥ 1 **live seat**; live = a seat in a counted status (CONFIRMED / ATTENDED / NO_SHOW), by `group_id`. New pure `liveGroupIds(rows)`; `classifyRow(row, liveGroups)`; new skip reason `empty-group`. Order of checks kept so a rule gap stays visible: seat → status → yielded → unknown-group-kind → empty-group.
- **A catch worth your review (declared):** an EXTRA coach on a GROUP row does not own its seat rows (they carry the group's first coach), so with the flip their group would always have read as empty. `collectRows` therefore now makes a second SELECT of the seats of every GROUP row it returns, by `group_id`, whoever their `teacher_id` is. At most two SELECTs, still no write. The seats are used only to tell live from empty; a seat is never counted.
- **Seat statuses (you asked):** I applied no other rule: live = the same three counted statuses. So a group whose children are all on sick leave, cancelled, paused or PENDING that day is empty. Say if a seat on a *planned* leave should still hold the coach.
- **Fixtures:** the old "[Q3] counts" fixture now expects 0; added: every seat on leave/cancelled/PENDING → 0; ONE live seat among dead ones → counted once; another group's live seat does not make this one live; an empty DUO group → 0; the all-types fixture now has its group seat. Tests added for `liveGroupIds`, `classifyRow` with/without live groups, the kept skip reasons, the constant, and an extra coach whose collect returns the seats.
- **Evidence (dummy URL):** `bun test` → **`303 pass · 0 fail · 20 files`** (DoD ≥ 294 ✓; was 294); `bunx --package typescript@5.9.2 tsc --noEmit -p .` → exit 0; write-grep on `hours-reader.ts` → no output; `git status --porcelain` still 38 (only my 4 files).
- **Real sid read again (read-only, host `.206` printed + guard-tested):** same coach, October. GROUP rows in a counted status, not yielded: 5, of which 2 are empty. **Before the flip 300 group min → after 180**, because 2 rows have 0 live seats (`15/10 14:00`, `22/10 14:00`); the reader's group minutes (180) equal an independent live-seat count in plain SQL. Totals: private 2940 · group 180 · camp 120 = **3240 min (54.00 h)**, was 3360. Excluded by reason now includes `empty-group 120`. The 2026-10-05 hand cross-check still matches (540 = 540); its hand rule now also needs a live seat for any group.
- **Extra-coach seat fetch on real Postgres:** a GROUP on 2026-10-06 where a coach is only an extra coach: `collectRows` returned **2 of its 2 seats** (seats that are not that coach's rows), and the reader gave 0 for it because the group is PENDING (not a counted status), as it should. **Not proven on real data:** an extra coach on a live, counted-status group — sid has none; that positive case is covered by a unit test only.

**Review of follow-up 1, Sector, 2026-11-08. Verdict: DONE.**
- **Re-run by me:** `bun test` (dummy URL) → `303 pass · 0 fail · 20 files`; pinned tsc → 0; write-grep → 0; `COUNT_EMPTY_GROUP = false` at `hours-reader.ts:68`, applied at `:126`.
- **The catch is right and accepted:** an extra coach's group would always have read as empty, because its seats carry the first coach. The second SELECT of the group's seats by `group_id` fixes it, read-only, and seats are never counted. The real sid fetch shows it; the positive case is unit-tested only (sid has no such group).
- **Seat statuses: your rule stands** [SA-decided: *Interpreted* REQ-105 §5 #4's "a group slot with students" as students live **that day*]. A group whose every child is on leave, cancelled, paused or PENDING on that date is empty, and the coach was free. No new question: Khwan's "empty ⇒ the coach is FREE" covers it.
- **Real effect on the October sample coach:** 3360 → 3240 min (2 empty groups, 120 min); matched by an independent SQL count.
