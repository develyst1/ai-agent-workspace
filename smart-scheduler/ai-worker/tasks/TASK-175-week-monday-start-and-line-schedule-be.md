# TASK-175: 🔴 Week = Monday→Sunday at the source + teacher LINE schedule readability (REQ-069 + REQ-067 Part B) (scheduler-back)

- Source: REQ-069 (🔴 bookings invisible on the calendar every week) + REQ-067 Part B (LINE schedule unreadable).
  Bundled because both live in the same code and REQ-069's range fix must land in the LINE message REQ-067B rewrites.
- Status: REVIEW (Jason 2026-08-23). Next step: @Sober → @Porter device check
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**. No migration, no FE (the calendar FE already draws Monday). Money-neutral.

## Part 1 — `weekRange` becomes Monday→Sunday (REQ-069)

`lib/time.ts:38` `weekRange` is Sunday-start (`addDays(iso, -getDay())`); the FE calendar draws Monday-start
(`CalendarContent.tsx:27`), so the grid is drawn for one week and filled with another — **the Sunday column is
always empty**, and Sunday is the customer's busiest day.

**Fix at the source** (not the calendar — constraint): Monday-start offset = `(getDay() + 6) % 7`
(Mon→0 … Sun→6): `start = addDays(iso, -((dow + 6) % 7))`, `end = addDays(start, 6)`. Update the comment to
"Monday→Sunday". On a **Sunday** this yields the week that Sunday **ends** (Mon prior → that Sun) — AC-1.

**Q1 answered — caller audit (only two, both correct as Monday):**
- `scheduler.service.ts:382` `getCalendar` week view — Monday ✅ (AC-1/2/3).
- `line-webhook.service.ts:374` teacher `ตารางสัปดาห์นี้` — Monday ✅ (AC-4).
**No caller must stay Sunday-based.**

**Q2 answered — no third definition:** `recurring.ts:39` and `work-days.ts` use `getDay()` for a **weekday index**
(which day a session repeats on), not a week boundary; the daily digest is per-day; revenue groups by **month**
(`bangkokMonthRange`). The FE `CalendarContent:27` is the other side and is already Monday — after this fix, FE and
BE agree, one definition everywhere. **No report or digest computes its own week-start.**

## Part 2 — teacher LINE schedule readability (REQ-067 Part B)

Rewrite both `ตารางวันนี้` and `ตารางสัปดาห์นี้` (`line-webhook.service.ts` ~:365-)  — plain text, newlines (LINE has
no markdown):
- **Group by day**, day named once as a heading (week message); **each session starts with the time**, then
  student, then program · status on the next line; blank line / rule between sessions (AC-4/AC-5).
- Readable on a phone, **no mid-word wrap / horizontal scroll** — the shape in REQ-067 Part B is the target
  (AC-6); verify on a real device (owner/Tanya — I can't drive a LINE account).
- **TH and EN** (AC-7). **Keep the 20-row cap + "…and N more", the empty state, and the quick-reply buttons**
  (AC-8, regression).
- Q1 (owner, non-blocking): whether to add location — **do not add fields on assumption**; time · student · program
  · status is the set unless the owner says otherwise.

## Definition of Done
- [ ] AC-1/2/3: on **every** day, the week columns drawn and the data fetched are the same Mon→Sun seven days;
      Sunday populated; header range matches. Unit-test `weekRange` for Mon/Wed/Sat/**Sun** (Sun → the week it ends).
- [ ] AC-5 (regression): every `weekRange` caller listed above stays correct; day view unaffected (AC-6).
- [ ] AC-4 + REQ-067 Part B: the teacher week message covers Mon→Sun and is grouped/time-first/separated; today
      message reformatted too; TH+EN; cap/empty/quick-replies unchanged.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green. Phone-readability (AC-6) + LINE render ride the owner/Tanya.

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-23).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **716/0** (+13, incl.
new `time.test.ts` 5/0). Part 1: `weekRange = addDays(iso, -((dow+6)%7))` — Monday-start; the comment now documents
the defect and the Sunday semantics (was "Sunday→Saturday"). **The real finding: `weekRange` had no test at all** —
which is exactly how a Sunday-start helper survived against a Monday-start calendar; the new tests are written from
the calendar (Monday starts its own week · midweek lands in the same block · **Sunday returns the week it ENDS** ·
all 7 days map to the same seven with Sunday last · 7 days across month/year boundaries). Jason **re-ran the caller
audit independently** — same two callers, both Monday, no third week-definition; corrected the LINE caller's
"Sun–Sat" comment (the second victim's cover). Part 2: the LINE rewrite fixes the *shape* — **no line carries all
four fields** (the mid-word-wrap cause), day heading once, time-first, `program · status` indented, sorted
day-then-time; cap/overflow/empty/TH-EN/quick-replies each keep a regression test; dead `tsched_row` deleted. Q1
(location) correctly not taken. **DONE (code).** AC-7 (walk all seven days on the box) + AC-6 (real-phone render)
are the owner's/Tanya's after deploy — look-only, no data/money.

## Notes / Questions
(Jason fills in. `weekRange` is a **shared** helper — the fix is the one-line offset + the comment; the audit above
is why it's safe. REQ-067 **Part A** (tab labels `1st Trial`/`1 HR`) is a **separate FE task** — not here.)
