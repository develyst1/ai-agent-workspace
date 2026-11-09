# TASK-756 — REQ-5004 (1/2): 1st moves out on voucher / 1 HR · Total = Active only · Coach capacity per type (Karn's setting) — BE, ≈ 1.7 d
- Source: `requirements/REQ-5004-som-dashboard-round-2-period-capacity-total.md` §1, §2 rows 2–4 · `CHECK-REQ-5004-som-round-2-2026-11-06.md`
- Status: ✅ DONE 2026-11-06 (Silver review) → sid → Tanya's recount → the owner's git word · nothing committed · then Karn's DATA REQUEST
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-11-06)
- **Claim (GRANTED, Porter 2026-11-06):** `src/lib/som-contract.ts` · the 741 + 742 test files and sets · `src/services/som-contract.service.ts` · `src/db/schema.ts` + a new migration (next free number) + `src/lib/migration-witness.ts`
- 🔴 SAFE test command only. 🔴 run → list → ask → THEN edit. 🚫 No front file; same fields and shapes. Nothing committed.

## Build
1. **Card 3, 1st Trial (last 3 months):** out when the child has a non-cancelled course or voucher by the as-of date (any order, as today), or a non-cancelled 1 HR dated on or after their 1st Trial and on or before the as-of date.
   - 🔴 **Trap:** `TRIAL_MOVES_OUT_ON_VOUCHER` + `boughtByAsOf` also feed **card 4**. Card 4 stays course only (REQ-5002). Pin it: a voucher does NOT take a child off 1 HR.
2. **Line 10 (1st Trial, no course): untouched.** Pin: a child with a voucher is off card 3 and still on line 10.
3. **Total customers:** distinct children on the courses and vouchers cards 1 + 2 count (`courseHolders` ∪ `voucherHolders`), archived out. The "known by" set goes.
4. **Coach capacity, available hours per day worked,** from `work_days`, minus recorded leave:
   - **FT:** weekday 5 h, Sat–Sun 6 h.
   - **PT:** Sat–Sun 6 h, or the coach's `weekend_capacity_hours` if set. Weekday capacity 0.
   - **FL:** 0 everywhere.
   - Named constants; `CAPACITY_HOURS_PER_DAY` goes. No coach's name in the code.
   - **A PT row's Hours:** `bookedHours` = weekend booked only. `weekdayBookedHours` stays real, with 0 available and 0 %.
   - **An FL row:** booked hours real, available 0, % 0. Palm's screen hides the rest.
   - **By type:** the sums, as today.
5. **`teachers.weekend_capacity_hours`:** smallint, nullable, no default. One line through the service. No API or form. Setting Karn's is a DATA REQUEST (Silver → Porter).

## Done when (by value)
- Pins: each move-out and its order; FT / PT / FL / a set PT on a month with leave; a PT with weekday classes (fraction unaffected, weekday cell real); FL; by-type sums; Total with a child on both cards = 1; a child with only an ended course is out.
- Sets extended; full SAFE `bun test`; `tsc` 0; output pasted here.
- **Tanya's recount on her data.** REQ-5002's other lines are unchanged.

## Implementation Notes
**Rules (`src/lib/som-contract.ts`):**
1. Card 3: `TRIAL_MOVES_OUT_ON_VOUCHER = true` (voucher or course by the as-of date, any order) + `FIRST_TRIAL_MOVES_OUT_ON_SINGLE_SESSION = true` (a non-cancelled 1 HR, branch-badge aware, dated on/after the child's 1st Trial and on/before the as-of day). Card 4 has its OWN `SINGLE_SESSION_MOVES_OUT_ON_VOUCHER = false`, so card 3's switch cannot reach it (the trap). Line 10 untouched (pinned in 742: a voucher child stays on it).
2. Total = `courseHolders` ∪ `voucherHolders`, archived out; the "known by" set is gone.
3. Capacity: `CAPACITY_FULL_TIME_WEEKDAY_HOURS=5`, `CAPACITY_WEEKEND_HOURS=6`, `CAPACITY_PART_TIME_WEEKDAY_HOURS=0`, `CAPACITY_FREELANCE_HOURS=0`; `CAPACITY_HOURS_PER_DAY` removed. PT weekend rate = `weekendCapacityHours ?? 6` (a set 0 means 0). PT `bookedHours` = weekend booked only (weekday cell real, 0 available, 0 %); FL booked real, available 0, % 0; by type = sums (bookedHours = sum of the people's).
4. `teachers.weekend_capacity_hours` smallint nullable: `schema.ts`, `drizzle/0073_teacher_weekend_capacity_hours.sql` (next free number, checked at the time: `drizzle/` ended at 0072), journal idx 73, `migration-witness.ts` (column probe), one service line. No coach named, no data written, no API/form. Setting Karn's = DATA REQUEST (Silver → Porter), by the id from the teacher list.

**Evidence (SAFE only):** full `bun test` 5269 pass · 0 fail; `tsc --noEmit` 0. Sets: 741 (62 mutants incl. R1–R7, Total re-aimed) and 742 (83 incl. S1–S10) — all bite, checksums identical, no survivors.
**Mirror-pin bumps (granted, TASK-800 convention):** 63 lines in 38 test files, `73 → 74` + ` · 🔻 TASK-756: +0073` (file counts, journal counts, the two witness counts); every hit read first; `school-issue-reason-task690` line 103 (a file NAME, not a count) left alone. Nothing else touched in those files.
**Pins:** each move-out and its order; 1 HR before / after the trial, after the as-of day, cancelled, other-branch; voucher after/before, cancelled, bought after the as-of day; card 4 not moved by a voucher; Total: child on both cards = 1, two courses = 1, DUO = both, ended / paused / no-class-after / class-only out, archived out, past month, branch; FT / PT / PT with own value / FL, leave per rate, PT with weekday classes, FL booked, by-type sums, 100 % cap, February; the service passes `weekendCapacityHours`.

**Files:** `src/lib/som-contract.ts`; 741 + 742 tests and sets; `src/services/som-contract.service.ts`; `src/db/schema.ts`; `drizzle/0073_*.sql` + `meta/_journal.json`; `src/lib/migration-witness.ts`; the 38 count-pin files.

## Questions
1. Palm's screen: a PT with weekday classes now has `bookedHours` < the weekday cell + weekend cell sum; the screen must read the cells, not add them (CHECK §4.4).
2. Past ranges use today's `work_days` and today's own PT value (no history) — as CHECK §4.2 says.

## Review

### ✅ Silver, 2026-11-06
- **Re-run by me:** `tsc` 0 · SAFE `bun test` 5269 pass / 0 fail · sets 741 (62 BITES) and 742 (83 BITES), 0 survivors, CHECKSUM identical.
- **Read by me:** the `som-contract.ts` diff, the schema line, the service line, and the migration (one nullable column, no data, no name). Card 4 has its own switch, so the trap is closed. The count-pin edits: every added line in those files carries the tag (a grep over the diff). I didn't read all 63 by eye.
- **Bob's two questions:** Q1 goes on Palm's list (the screen reads the cells, and its "x / 0 h" on a PT's weekday cell is his to hide). Q2 is as the CHECK says.
- **A small imprecision, accepted:** "after the 1st" reads the earliest trial in the 3-month window, not the child's earliest ever. It only differs for a child with two trials, and a 1st Trial is once per child.
- **Not verified by me:** real data. Until Palm's part ships, an FL row shows "x / 0 h" on today's screen.
