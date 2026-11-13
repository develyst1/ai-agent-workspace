# TASK-942 — BE + FE: **park fee: several groups in the SAME hour** on the "No Teacher" column (smart-scheduler-back + smart-scheduler-front) — @Bob (BE) + @Fanta (FE) — **START NOW** (owner via Porter, 2026-11-13: the pause is back office only; it was 14 Nov)
**From @Silver, 2026-11-10.** **The owner decided:** several groups may rent the park in one hour (ขวัญ «พร้อมกันหลายกรุ้ปได้นะคะ», CUSTOMER-ANSWERS 2026-11-09; confirmed by the owner via Porter 2026-11-10). This **supersedes DECISIONS row 11's "one park block per hour".** The size and risk are in `SIZE-park-fee-several-groups-per-hour-2026-11-09.md`. Branch `dong`. **No git command** (the SA commits after sid + Tanya). **Size ≈ 1.5–2.5 d (BE ≈ 1–1.5, FE ≈ 0.5–1).**

## Today (read)
- Every park block is an OTHER booking on the one system teacher (TASK-861).
- `bookings_teacher_slot_uq` is unique on (teacher, date, start_time) with the predicate built from `SLOT_INACTIVE_STATUSES` + `group_id IS NULL` + `slot_yielded_at IS NULL` (`src/db/schema.ts:606`; the app mirror is `src/lib/slot-holder.ts:23`). So a 2nd park block in the same hour → 409 `SLOT_TAKEN`.

## BE (Bob, smart-scheduler-back)
1. **Migration `0077`** (additive; hand-authored per `drizzle/README.md`; **check the journal `when` is unique**):
   - ⚠️ **Number clash (Silver 2026-11-13, via Porter):** Team C's TASK-959 (SPEC-105 close-a-day, Brew) also adds an SB migration as `0077`.
     - Before you write the file, run `ls drizzle/*.sql | tail -3` and read the journal tail. Take the next free number, and a `when` greater than every journal entry.
     - If the other one lands first, **renumber yours** before review: the file name, the journal `idx` / `tag` / `when`, and the test pins.
     - Name the final number in your Notes and in the `MIGRATION-QUEUE.md` line.
   - `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slot_exempt boolean NOT NULL DEFAULT false;`
   - `UPDATE bookings SET slot_exempt = true WHERE teacher_id IN (SELECT id FROM teachers WHERE is_system);` (existing park blocks);
   - **rebuild `bookings_teacher_slot_uq` with its current predicate `AND NOT slot_exempt`.** Copy the predicate text exactly from the live definition + `schema.ts`, and add only that clause.
   - **The witness:** the index-predicate probe contains `slot_exempt` (`lib/migration-witness.ts`, the pattern at l.434).
   - **The lock:** the rebuild takes a short lock on `bookings`. Say in the queue line that the owner applies it at a quiet time; on sid, the queue applies it as usual.
2. **The inserter** sets `slot_exempt = true` **only** when the booking's teacher is the system teacher. Reuse TASK-861's `isSystemTeacher`; never trust a request field.
3. **The app mirror** `slotHolderWhere` (`slot-holder.ts:23`) adds `eq(b.slotExempt, false)`, so app checks and the index agree. The availability read already excludes the system teacher (861), so no change there.
4. **Tests (SAFE env, each must fail when its code is removed):**
   - 3 park blocks in one hour → all 201;
   - **a real teacher still can't double-book** (409);
   - a request body with `slotExempt: true` for a real teacher is ignored;
   - the migration text / witness / journal pins;
   - the mutation set;
   - **her money case (ขวัญ, 2026-11-13 00:30): household A's block, confirmed yesterday, and B's, confirmed today, in the same hour → two `rl:booking:<id>` lines, each dated its own confirm day.**
     - What the code does today: `parkFeeLine` (`booking-sale-amount.ts` l.152) keys on the booking. `writeRevenueLine` dates the line on the Bangkok day of the write (l.27).
     - So this test pins that this TASK keeps it.
   - **A rolled-back sid proof** (host .206): 2 park blocks at the same hour both insert; a real teacher's 2nd booking is refused; residue 0.

## FE (Fanta, smart-scheduler-front)
- **The calendar's "No Teacher" column shows N blocks in one hour cell**, stacked, each with its own group / name / charge, readable at 375 px.
- **The OTHER form** lets the admin add another park block in an hour that already has one (the cell's "+" stays available on the system column).
- **No new words** (reuse the existing park-fee labels). Tests: 2–3 blocks render in one cell; the add action stays available.

## Not changed
- **Revenue:** already one line per booking (C1), so N groups = N park-fee lines.
- **DECISIONS row 11's wording reuse** stands; only "one block per hour" is superseded. I'll add a DECISIONS row when the build starts.

## Done =
- **BE:** tsc 0 · SAFE suite green (before / after) · mutants · 0077 `applied · verified` on sid · the sid proof.
- **FE:** tsc 0 · tests · build 0.
- Reports in `inbox/SA-B.md`. Then sid deploy → Tanya → I commit.

## Review — FE part (Fanta) — @Silver, 2026-11-13: ✅ ACCEPTED (the live look waits for Bob's BE)
- **Diff read:** SF `CalendarGrid.tsx` (+39 / −4).
  - **`findAll`** uses the same filter as `findBooking`, returning every match.
  - **A real coach** still draws one booking per cell: `list = first ? [first] : []`. Only `tc.isSystem` stacks, with `data-park-stack=N`.
  - **The "+"** stays on the system column under the stack, behind `canBook && !leave`, and calls `onCreate(sys, hour)`.
  - **The week grid** was untouched (it already stacked). Team C's CalendarContent hunks were untouched.
- **Re-run by me:** `bun test …/park-stack-task942.dom.test.tsx` **8 pass / 0 fail**. She reports 4 of 8 failing on the mutant, and the Calendar folder at 235 / 0.
- **The booking modal has no client-side "slot taken" check** I could find (grep in `Calendar/Modal`), so the "+" can reach the server, which decides (Bob's `slot_exempt`).
- **Not run, and accepted as such:**
  - `next build`: another session's dev server holds `.next`. It runs at the sid deploy.
  - lint: `npm run lint` is broken repo-wide (no `next lint` in Next 16, no eslint config). That predates this TASK and isn't hers. I'll mention it to Porter once.
- **Still to do:** a live look once Bob's BE is in: 2–3 blocks in one hour on local SB, then sid → Tanya.

## Bob — 2026-11-13 — BE DONE (see inbox/SA-B.md): migration 0078 (0077 was taken by TASK-959) applied · verified on sid; tsc 0; SAFE 5921→5940/0; mutants 14/14; rolled-back sid proof green, residue 0. FE (Fanta) still open.

## Review — BE part (Bob) — @Silver, 2026-11-13: ✅ ACCEPTED, so TASK-942 is DONE (BE + FE)
- **Re-run by me:** SB `bunx --package typescript@5.9.3 tsc --noEmit` **0**. `bun test park-several-groups-task942 + group-slot-yield-req105` gives **51 pass / 0 fail**.
- **Diff read:**
  - `insertBooking` / `moveBooking` set `slotExempt` only through `isParkBlock`, which reads the teacher row's flag and never a request field.
  - `slotHolderWhere` gains `eq(slotExempt, false)`.
  - The migration is 0054's predicate plus one clause. I checked this before Porter's urgent question.
- **sid:** MIGRATION-QUEUE l.45–46 show `applying`, then `applied · verified`. db:verify is green (Journal 79 · witnesses 79). No real-teacher row is exempt and no park block is non-exempt.
- **Rolled-back sid proof:**
  - 3 park blocks in one hour all insert;
  - a real teacher's 2nd booking gives `SLOT_TAKEN`;
  - residue 0.
- **Her money case is pinned:** households A (confirmed 12 Nov) and B (13 Nov) get two lines, each dated its own day.
- **Pins changed:** counts 78→79 and the three-way pin reading 0078, all tagged 🔻 TASK-942. This is the pre-approved class (mirrors of the index text and counts).
- **Process note:** his report was written into my inbox as a long section, not a 1–3 line pointer, so the detail belonged in this TASK's Notes. Raised with him; not a defect in the work.
- **Security review:** the exemption can't be set from a request (tested). No other surface.
- **Next:** the owner's sid deploy already carries SB. Porter → Tanya (TEST: several park blocks in one hour, a real coach still single, her A/B money case). Then I commit on the owner's word.

## Implementation Notes — BE (Bob), 2026-11-13 (moved here verbatim from inbox/SA-B.md by Silver)
## @Bob → @Silver — 2026-11-13 — TASK-942 BE DONE (several park groups in one hour, SB, branch dong) — **migration is 0078, not 0077** (Team C's 0077_closed_days landed first); applied + verified on sid; rolled-back sid proof green. FE (Fanta) is untouched by me.
**Built (SB, no git command):**
- Migration `drizzle/0078_slot_exempt_park_blocks.sql` (journal idx 78, `when` 1783000000074 = unique + highest): `bookings.slot_exempt boolean NOT NULL DEFAULT false`; backfill `slot_exempt = true` for rows whose teacher is_system; `bookings_teacher_slot_uq` dropped + rebuilt with its current predicate (copied from 0054) **+ `and not "slot_exempt"`**. The lock (short ACCESS EXCLUSIVE on bookings, no CONCURRENTLY, why) is named in the header and in the queue line. Witness (`lib/migration-witness.ts`): the index PREDICATE contains `slot_exempt`.
- `src/db/schema.ts`: column + the index WHERE's 4th term. `src/lib/slot-holder.ts`: `slotHolderWhere` adds `eq(b.slotExempt, false)`; `holdsSlot` honours the flag. `src/lib/system-teacher.ts`: new `isParkBlock(exec, teacherId, bookingType)` = an OTHER on a teacher ROW with `is_system` (reads the flag, never the request; no read for non-OTHER). `src/services/scheduler.service.ts`: `insertBooking` stores `slotExempt: await isParkBlock(...)`; `moveBooking` (the only path that changes the teacher of an OTHER; the plan-editor move is course-sessions only) restamps it, so no real teacher is ever left exempt. I did NOT touch the two guarded `assertTeacherBookable` lines (813 / 861 source pins + mutants stay valid). The availability read already excludes the system teacher.
- New `src/lib/park-several-groups-task942.test.ts` (15) + `.mutations.json` (**14/14 BITE**): 3 park blocks in one hour → all stored; a real teacher's 2nd booking → 409 SLOT_TAKEN; a body `slotExempt:true` for a real teacher is ignored (and his hour is still held); a lesson on the system teacher still 400; `isParkBlock` rules; moveBooking restamp + insertBooking-not-from-input (by source); mirror ⇔ index 4th term; migration text/order/additive/lock named; journal; witness; schema; **her money case**: household A confirmed 2026-11-12 + B confirmed 2026-11-13, same hour → two lines `rl:booking:<id>`, each dated its own confirm day (real `parkFeeLine` + `writeRevenueLine`, clock set per confirm), 50000 each, never keyed on the hour. The insert test uses a fake whose `insert` models the index with `holdsSlot` — it models the index; the real one is the sid proof below.
**Pins changed (🔻 TASK-942, pre-approved class = counts/mirrors of the index text):** 39 test files' migration/journal counts 78→79 (64 lines, each marked `🔻 TASK-942: +0078`); `group-session-req095-2a.test.ts` (schema WHERE text, mirror params +`false`, slot-holder source text); `group-slot-yield-req105.test.ts` (the THREE-WAY pin now reads 0078 for the current predicate and treats `slot_exempt = false` ≡ `not slot_exempt`; its 0054 pins untouched; +4th-term assertion); `routes/closed-days-task959.test.ts` (0077 is no longer the LAST journal entry: now asserts entry 77 + 0078 right after it).
**Proof:** `tsc --noEmit` (5.9.3) **0**; SAFE suite **before 5921 pass / 0 → after 5940 pass / 0**; mutants 14/14.
**Sid (host 154.197.124.206 = sid, host only; MIGRATION-QUEUE.md has the `applying` + `applied · verified` lines):** `db:migrate` → "migrations applied successfully"; `db:verify`: Journal 79 · ledger 127 rows · witnesses 79 applied · ✅. Before it, `db:verify` showed ONLY 0078 pending (0077 was already applied by Team C). Index predicate now contains `slot_exempt`; park blocks not exempt after the backfill = **0**; real-teacher rows exempt = **0**.
**Rolled-back sid proof** (one transaction, rolled back; test rows `C-TEST-942-*`; real `insertBooking` + the real unique index): 3 park blocks on the system teacher in ONE hour → all inserted, all `slot_exempt = true`; a real teacher's 1st booking inserts (`slot_exempt = false`) and his 2nd in the same hour is refused **SLOT_TAKEN**; residue after the rollback **0**.
**Not done / for you:** FE (Fanta). Not run: the HTTP route (needs a login). The next item is TASK-961 (change activity) — its claim is still pending with Porter, so I wait for your go. Frozen on SB otherwise; nothing committed.

## Fix D-155-1 (Tanya, TEST-155): the calendar payload carries one booking per hour — @Bob (SB) + @Fanta (SF) — @Silver, 2026-11-13
**Cause (read):** SB `getCalendar` keeps **one** DTO per `date|teacher|time` key (`scheduler.service.ts` l.580–593: `if (!cur || …) idx.set`) and sends `slots[].booking` (l.622–626). SF's mapper flattens `slot.booking` only (`src/lib/api/mappers.ts` l.152–153, l.165–166). So `findAll` never sees park B and C. My TASK asked for stacking without checking that the payload carries several bookings (F-entry filed).
**Contract [SA-decided], additive, byte-identical when there are no extras:** each slot gains an optional `more?: BookingDTO[]`.
- **SB (Bob):**
  - Keep `booking` exactly as chosen today, including the SICK_LEAVE rule.
  - A row that loses the key goes into `more` **only when its `slotExempt` is true** (a park block). Every other loser is dropped as today, so a real coach's slot (a leave row under an active booking) is unchanged.
  - `more` is ordered by start time, then by row order. It is omitted when empty.
  - Update the response type in `types/contract.ts`.
  - Tests:
    - 3 park blocks in one hour → `booking` + `more.length === 2`;
    - a real coach's leave + active booking → no `more`, same `booking` as before;
    - an hour with one booking → the slot is byte-identical (no `more` key).
  - Grep every other reader of `getCalendar` / `slots` (SB and SF), and say in Notes that none breaks.
- **SF (Fanta):** `mappers.ts` l.152 and l.165 also push each `slot.more` DTO. Add `more?` to the API type.
  - A test **at the payload level** (a `GET /calendar` fixture with `more`) → the No Teacher cell shows `data-park-stack="3"`.
  - The existing DOM test fed bookings directly, which is how this slipped through. Keep it, but the new one must start from the payload.
- **Done =** SB tsc 0 plus the suites green; SF tsc 0 plus the suites green; a local run (SB + SF) with 3 park blocks in one hour, all 3 drawn, and a screenshot. Then I review, sid deploy, Tanya re-runs TEST-155 case 4.
### Review — D-155-1 SF half (Fanta) — @Silver, 2026-11-13: ✅
- `mappers.ts` l.154 / l.168 push every `slot.more` DTO. `contract.ts` gains `slots[].more?`. Her grep of the other SF slot readers found only `scheduler.service.ts:688`, a single-slot lookup that this doesn't affect.
- **New payload-level tests:** a `GET /calendar` fixture runs through the real mapper into the real grid and gives `data-park-stack=3` with all three names. A payload with no `more` key gives the old result. The mutant fails as it should.
- **Re-run by me:** the park-stack file passes (summary below). She reports SF 1529 / 0.
- **Waiting on:** Bob's SB half (the inbox line is pending), then a local run with 3 blocks and a screenshot, then sid and Tanya's TEST-155 case 4.

## Fix D-155-1 — SB part DONE (Bob, 2026-11-13)
- `scheduler.service.ts` `getCalendar`: a row that LOSES the `date|teacher|time` key goes into a `more` map **only when `row.slotExempt`** (a park block); every other loser is dropped as before (the SICK_LEAVE-under-active rule untouched, same `booking`). The slot spreads `more` (row order) **only when non-empty** — an hour with one booking is exactly `{ time, booking }`. `types/contract.ts`: `slots[].more?: BookingDTO[]`.
- Tests (in `park-several-groups-task942.test.ts`, by value through `getCalendar` with the database answering): 3 park blocks in one hour → `booking` + `more.length === 2` in row order · a real coach's leave + active booking → no `more`, same booking · a real coach's two same-key rows → the loser dropped, no `more` · one booking → keys `["booking","time"]` · source pins. Mutants C1–C3 added: **17 / 17 bite** (the whole 942 set). tsc 0 · SAFE **5996 pass / 0 fail**.
- **Readers of `getCalendar` / `slots` grepped (SB):** the ONLY caller is `routes/api.ts:45` (`c.json(...)`, a pass-through); `calendar.service.ts` is the iCal feed (a different read, no `slots`); the rest are tests (existing calendar tests still green). Nothing breaks: `more` is optional and absent unless a park block shares an hour. SF is Fanta's (`mappers.ts`).
- Not done by me: the joint local run (SB + SF, 3 blocks, screenshot) — it needs Fanta's half.
### Review — D-155-1 SB half (Bob) — @Silver, 2026-11-13: ✅ (code fix complete; the local run is owed by Fanta)
- **Read** `scheduler.service.ts` l.581–598 and l.632:
  - the winner rule (including SICK_LEAVE) is untouched;
  - a losing row goes to `more` **only** if `slotExempt`;
  - `more` is spread into the slot only when it isn't empty, so a slot with one booking is byte-identical.
- **Re-run by me:** SB `tsc --noEmit` **0**. He reports SAFE 5996 / 0 and mutants 17 / 17.
- **Next, in order:**
  1. Fanta's local run (SB + SF) with 3 park blocks in one hour: all 3 drawn, plus a screenshot.
  2. My deploy ask through Porter, naming the exact files (role-sa § 4.10).
  3. sid, then Tanya re-runs TEST-155 case 4.
