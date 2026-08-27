
## Implementation Notes
**Files:** `lib/time.ts` (`weekRange`) · **`lib/time.test.ts` (new)** · `lib/line-schedule.ts` (rewritten) ·
`lib/line-schedule.test.ts` (rewritten, 8) · `lib/line-i18n.ts` (dead key removed) ·
`services/line-webhook.service.ts` (comment).

### Part 1 — the week
The fix is `-((dow + 6) % 7)` and the comment. **The more useful finding: `weekRange` had no test at all.**
That is exactly how a Sunday-start helper survived against a Monday-start calendar for months — nothing
asserted the week the staff actually look at. `lib/time.test.ts` is new and written **from the calendar, not
from the code**: Monday starts its own week, every midweek day lands in the same block, **Sunday returns the
week it ends** (the defect in one assertion), every day of a week maps to the same seven dates with Sunday as
the last column, and the range stays exactly 7 days across month and year boundaries.

**I re-ran your caller audit independently and got the same two** (`getCalendar:382`, the teacher LINE schedule
`:374`), both correct as Monday. I also confirmed Q2: nothing else derives a week — `weekdayOf` is a weekday
*index*, the digest is per-day, revenue groups by month. The LINE caller's own comment said "Sun–Sat" and is
corrected, since it was the thing that made the second victim invisible.

### Part 2 — the teacher's schedule
Rewritten around the shape rather than the words. **No line carries all four fields any more**, which is what
made it wrap mid-word and mid-name on a phone: the day is named once as a heading (`▸ อาทิตย์ 02/08`), each
session leads with the **time** — the one field a teacher scans for — with the student on that same line, and
`program · status` indented beneath so a long program name wraps into its own space instead of into the next
session. Days are separated by a blank line. Sorted by day then time regardless of query order: a teacher reads
this as a plan, not a list. Cap, overflow line, empty state, TH/EN and both quick-replies are unchanged and
each has a regression test. The now-unused `tsched_row` template is deleted rather than left to rot.

```
🗓️ ตารางสัปดาห์นี้
▸ ศุกร์ 31/07
16:00  น้องซี
   Onewheel E-Skate · ยืนยันแล้ว

▸ อาทิตย์ 02/08
09:00  น้องเอ
   Bike / Scooter / Balance Cruiser · ยืนยันแล้ว
```

**Q1 (location) — not taken, deliberately.** The ask was legibility; adding a field on assumption is how a small
change becomes a redesign, and it is the owner's call.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **716 pass / 0 fail** (+13). No migration, no FE.
⚠️ I ran nothing against a database and **I cannot drive a LINE account** — the render above is the pure
function's output, not a phone screenshot.

**DoD:** AC-1/2/3 Mon→Sun everywhere, Sunday populated, unit-tested incl. the Sunday case ✅ · AC-5 both callers
audited and correct, day view untouched ✅ · AC-4 + Part B grouped/time-first/separated, TH+EN,
cap/empty/quick-replies pinned ✅ · tsc/test ✅ · **AC-6 phone readability + the live LINE render are the
owner's/Tanya's** ⛔ · **AC-7 walk all seven days on the box** — the defect is invisible six days out of seven ⛔.
