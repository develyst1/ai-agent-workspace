# TASK-757 — REQ-5004 (2/2): SOM back answers any period: all data by default, from–to, month — BE, ≈ 2.8 d
- Source: `requirements/REQ-5004-*.md` §2 row 1 · `CHECK-REQ-5004-som-round-2-2026-11-06.md` §4.6
- Status: ✅ DONE 2026-11-06 (Silver review), ONE build with TASK-756 → sid → Tanya's recount → the owner's git word · nothing committed
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-11-06)
- **Claim (GRANTED, Porter 2026-11-06):** `src/lib/som-contract.ts` · the 741 + 742 test files and sets · `src/services/som-contract.service.ts` · `src/validation.ts` (`somQuery`)
- 🔴 SAFE test command only. 🔴 run → list → ask → THEN edit. 🚫 No front file. Nothing committed.

## Build
1. **Query:** `from` + `to` (`YYYY-MM-DD`, both or neither, `from` ≤ `to`, not future) · `month` as today, meaning that month's first–last day. **Neither = all data.** Both `month` and a range = refused. Both endpoints (`/reports/som`, the list) take the same.
   - 🔴 **`month` must give byte-identical answers:** today's screen keeps sending it, and the back deploys first. Pin it with the REQ-5002 fixtures.
   - ⚠️ Today no `month` means the current month. It becomes all data; the screen always sends `month`, so nothing changes until Palm's part ships.
2. **All data** = from the earliest non-cancelled lesson row to today.
3. **The as-of day** = the range's end, capped at today. Active course / voucher + Total read it. Card 3 + 4's window = the 3 calendar months ending at it.
4. **New vs Renewing over a range:** a purchase / trial / end counts when it falls in the range.
   - **New lines, per row:** a first course opened in the range, with the 1st Trial in the same calendar month as the purchase (this month) or an earlier one (previous).
5. **Capacity over a range:** each day of the range, as TASK-756. Each coach starts at the later of the range's start and `teachers.created_at` (all data only; a month or a from–to stays as asked). Leave reads the range.
6. **Demographics + Activity** read the range. **Today** stays locked to today.
7. **Echo:** additive `from` + `to` on each section. `month` is still echoed when a month was asked; otherwise null. Tell Silver if any shape can't stay additive.

## Done when (by value)
- Pins: a month = the same as before; all data; a from–to crossing months; one day; an invalid range refused; a list = its card on each period; the New-lines rule across months.
- Sets extended; full SAFE `bun test`; `tsc` 0; output pasted here.
- **Tanya's recount on her data,** after Palm's control ships or by the API before.

## Implementation Notes
**One seam:** `periodOf(input)` in `src/lib/som-contract.ts` → `{ from, to, month, allData }`. A `from`+`to` wins; else a `month` = its first–last day (answered as before); else ALL DATA = the earliest non-cancelled LESSON row (ECA / camp / cancelled rows don't start it; a future-dated first row is capped at today; no lesson ⇒ today) … today. Every section reads it; Today stays locked to today.
- **As-of day** = `min(to, today)`; Active course / voucher + Total read it. **Cards 3 + 4**: the 3 calendar months ending at the period's end (`recentFrom`/`recentTo` are YYYY-MM of that window).
- **NVR over a period:** a trial / purchase / end counts when it falls in [from, to]. **New lines per row:** a first course opened in the period, 1st Trial in the SAME calendar month as the purchase ⇒ this month, an earlier one ⇒ previous (on one month this is the old rule exactly).
- **Capacity:** each day of [from, to] at TASK-756's rates; booked rows in the period; on ALL DATA a coach counts from the later of the range start and his `created_at` day (rough; no start history); a month or a from–to is as asked.
- **Service:** `SomQuery` takes `month | from+to | neither`; the leave reader gets the PERIOD (after the bookings are read, because all data's start is the earliest lesson row); teachers carry `createdAt`.
- **Validator** (`somQuery`): from + to together, real days (no 30 Feb), from ≤ to, to not in the future, a month AND a range refused (400). Both endpoints (`/reports/som` and the list) use the same schema.
- **Echo:** additive `from` + `to` on existingCustomers, demographics, activityProgram, newVsRenewing counts and coachCapacity; `month` is the asked month, else **null** (type `string | null` — the one shape change; a screen that always sends `month` still gets a string).
- ⚠️ **No `month` is now ALL DATA** (was the current month). The screen always sends `month`, so nothing moves until Palm's control ships.

**Evidence (SAFE only):** full `bun test` 5286 pass · 0 fail; `tsc --noEmit` 0. Every mutation set in the tree re-run: no survivors. 741 set 62 mutants; 742 set 106 (new: T1–T9 period/all-data/as-of/window/range, V1–V5 validator, U1–U9 capacity range, coach start, READ, Not renewed / 1st Trial range; M12, M17, N2, N12, N20, N21, N32, N34, N47, P7, P10, C3, C6, C7, S9 re-aimed to the new seam).
**Pins:** a MONTH = the same month as a full from–to (strip the echo ⇒ deep-equal, for Oct / Sep / Feb on a rich fixture); month echo + null echo; all data (earliest lesson, cancelled / ECA out, no lesson, future row); a range crossing months (boundary days in); one day; the as-of day capped at today (and the end-day expiry); the cards-3/4 window; the New-lines rule across months (this / previous / trial after / second course = Renew); 1st Trial / Renew / Not renewed falling in the range; list = card on a month, a range, one day, all data; capacity over a range, all-data coach start vs a month / range, booked hours in the range; the validator (accept / refuse each case) and the 400 on both routes; the READ's period resolution (leave windows, echo, list endpoint).
**Files:** `src/lib/som-contract.ts`, `src/services/som-contract.service.ts`, `src/validation.ts`, the 741 + 742 tests and sets.

## Questions
1. The old report endpoint `getSomReport` is untouched and still current-month-bound; only the contract half takes the period.
2. A range ending today with a coach created mid-range on a **range** (not all data) counts him from the range start (as asked); say if you want `created_at` applied there too (one line).

## Review

### ✅ Silver, 2026-11-06
- **Re-run by me:** `tsc` 0 · SAFE `bun test` 5286 pass / 0 fail · sets 741 (62 BITES) and 742 (106 BITES), 0 survivors, CHECKSUM identical. I re-ran those two, not every set in the tree.
- **Read by me:** `periodOf`, the validator, the service's diff, the New-lines rule (`trial.date` month against the purchase month), Not renewed's range, and capacity's all-data coach start.
- **The month view:** the rule reads the same as 756's by inspection, and the existing month pins still pass. Bob's "month = the same full from–to" pin proves the two paths agree, not that they equal the older build. **Tanya's recount on a month is the real proof.**
- **Bob's two questions:**
  1. As specified: the old `getSomReport` stays untouched.
  2. A from–to is as asked: a coach counts from the range's start. Only all data uses `created_at`. No change.
- **Not verified by me:** real data. All data and from–to can only be tested by the API until Palm's control ships.
