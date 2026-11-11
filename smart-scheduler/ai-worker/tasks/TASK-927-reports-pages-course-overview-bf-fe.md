# TASK-927: All Report pages, half 2 of 2: the COURSE + REPORT views (backoffice-front), about 1.25 days
- Source: SPEC-103 (§2, §4) · block 2.1, sid by 17 Jan
- Owner: FE (**Flash**, Team C) · SA: Sector · Status: TODO, **queued after TASK-906** · Depends on: TASK-925 steps 1–2 (Fanta: the frame, the service, types, hooks and fake) and TASK-926's contract (Jason).
- Claims GRANTED (Porter, 2026-11-09; board line written).
- Repo: `smart-scheduler-backoffice-front` (BF). **Base:** BF tsc + suite + `next build` first; paste them.
- Files (closed list, yours alone):
  - `src/components/partials/AllReport/Course/**` (replace Fanta's `CourseReport.tsx` stub);
  - `src/components/partials/AllReport/Overview/**` (replace her `OverviewReport.tsx` stub).
  - **Don't touch** her frame, service, types, hooks or `fake.ts`. If you need a field or a fake variant, ask me and it goes to her.
- Git writes: none.

## What to do
1. **REPORT (`OverviewReport`, SPEC-103 §4):**
   - a month picker (default this month) + the branch filter;
   - cards for this month next to the previous month (two calls), no chart;
   - new / active students, trials → converted, courses / vouchers sold, sessions taught;
   - **revenue and refunds only when the response has them** (CEO). For an admin they're simply not there: never "hidden", never 0.
2. **COURSE (`CourseReport`, SPEC-103 §2):**
   - a `from`/`to` picker (default this month) + branch;
   - one table: Activity · Kind (Private / Duo / Voucher) · Size · Sold · Active · Paused · Ended · Sessions taught · [Revenue, CEO only];
   - a totals row, and the unmatched-revenue note (CEO) when it isn't 0.
3. **Words:** English labels, `PENDING (Khwan)`. Dates `dd/mm/yy`. All states. 375 px works.

## Definition of Done
- [ ] tsc 0 · BF suite no new fails · `next build` 0 (paste).
- [ ] Shots against the fake: REPORT and COURSE as CEO and as admin (no money), empty, error; 1280 and 375.
- [ ] After TASK-926 lands: wired on sid (read-only), one shot per view.
- [ ] `git status --porcelain`: only your folders.

## Implementation Notes

## Questions

## Review

**CLOSED 2026-11-09 (Sector): duplicate, merged into TASK-925.** Flash had already built the COURSE + REPORT views inside TASK-925 before this split reached him. Nothing to do here.
