# TASK-666 — the camp tests' DATE BOMB: 5 red tests because a fixture date became the past — BE, XS
- Source: @Sober's diagnosis (`inbox/BE.md`, 2026-10-06; `log/2026-10-06.md`) · Porter queued it to Team B as urgent (a red suite hides the next real failure from BOTH teams)
- Status: DONE (reviewed by Silver, 2026-10-06)
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-06)
- Files: **only** these three test files: `src/lib/camp-on-grid-req095-11.test.ts` · `src/lib/camp-day-rate-req104.test.ts` · `src/lib/camp-per-coach-window-req105.test.ts`. 🚫 **No product code.** 🚫 Nothing else, including Team A's uncommitted migration-ledger work in the same tree.

## §0 Why (CERTAIN)
- The three files build their camp day as the literal **`2026-10-05`**.
- The camp sync **skips a past day** by design (`camp.service.ts:254`: `if (d.date < bangkokNow().date) return { inserted: 0, deleted: 0, onLeave: [] }`, TASK-445).
- Since **2026-10-06** the fixture is in the past ⇒ `{0,0}` and no clash ⇒ **5 red**. The same commit was green the day before.
- ⇒ **The code is right; the tests carry a calendar date that rots.**

## What to do
- Replace the literal with **a date computed from today** (Bangkok, the same `bangkokNow()` the code reads), far enough ahead that it stays future. Use **one constant per file**, used everywhere the literal appears, **including inside expected strings** (e.g. `"วันที่ 2026-10-05 11:00 …"` at `camp-on-grid-req095-11.test.ts:177`, which becomes a template).
- **Decide and declare:** the offset, and whether the day must be a particular weekday for any assertion (check before choosing). An alternative is a frozen clock, if the files already use one; say which and why.
- 🚫 Do not change any assertion's MEANING, only the date it is built on.

## Definition of Done
- [ ] The 5 tests green. The full suite with **no reachable database** shows `0 fail` attributable to camp. State whatever else the tree holds (Team A's work).
- [ ] **Prove it no longer rots:** run the three files with the clock moved forward, e.g. `setSystemTime` to a date one month ahead (or the method you declare), and they stay green. Paste it.
- [ ] Grep: no remaining hard-coded `2026-` camp day in these three files.
- [ ] `tsc --noEmit` exits 0. `git status`: the three test files only. Nothing committed.

## Implementation Notes
**Bob, 2026-10-06.**

**What changed:** the three test files only. **No product code.** Team A's migration-ledger work in the tree is untouched.

**Decide and declare:**
- **A computed date, not a frozen clock.** None of the three files used a frozen clock. A frozen clock would also have frozen every other time-reading path these tests drive, such as tokens and the sync's own "today".
- **The constant, one per file** (with the same comment block in each):
  ```ts
  const isoPlus = (iso, days) => …;                         // UTC date arithmetic, no TZ drift
  const CAMP_DAY = <the first MONDAY ≥ 30 days after bangkokNow().date>;
  ```
  - **Why a Monday:** `2026-10-05` was a Monday. Keeping the weekday means no assertion that reads the day of the week can move. I didn't find one that does, but this way it doesn't matter.
  - **Why 30 days:** comfortably future, and still inside any course fixture's window.
- **Derived neighbours, never typed:**
  - `CAMP_DAY_BEFORE = CAMP_DAY − 1` (was `2026-10-04`, the already-consumed ABSENT day in `camp-day-rate`);
  - `CAMP_FRIDAY = CAMP_DAY + 4` (was `2026-10-09`, the end date in a `camp-on-grid` validator line);
  - the `DD-MM-YYYY` form is `ddmmyyyy(CAMP_DAY)` (was `05-10-2026` in the BALANCE CAMP expectations).
- **Every expected string that held the date is now a template** (e.g. `camp-on-grid:177` → `` `วันที่ ${CAMP_DAY} 11:00 ครูเอก มีคาบแล้ว — …` ``, and the PATCH paths `/camp/weeks/${W1}/days/${CAMP_DAY}`).
- **Left as they are, stated:**
  - `camp-day-rate:172`, the course fixture's `startDate: "2026-09-01"` / `expiryDate: "2027-01-01"`. That test is a check-in that already happened, and it reads size and used count, not expiry. Proven below with the clock a year past that expiry.
  - Line 71, a comment recording history.
- The edit was made by a one-off script (in my scratchpad, not the repo), and the result was reviewed by grep.

**Results:**
- The three files today: **37 pass / 0 fail** (5 were red).
- **It no longer rots.** Same three files with `setSystemTime` in a `--preload` (a temp file, deleted afterwards):

  | clock moved to | result |
  |---|---|
  | `2026-11-06` (+1 month) | 37 / 0 |
  | `2027-10-06` (+1 year, past that course's 2027 expiry) | 37 / 0 |
  | `2030-02-28 20:00 UTC` (Bangkok's 1 March, across a month end) | 37 / 0 |

  - The clock move really takes effect: with the preload, `bangkokNow().date` printed `2027-10-06`.
- **The tests still bite — the control:** with `CAMP_DAY` computed 30 days in the **past**, exactly the **5 original tests go red** (32/5). Restored ⇒ 37/0.
  - So the fixture still exercises the "skip a past day" rule. The fix moved the date; it did not blunt the tests.
- **Grep:** no `2026-10-0x` or `05-10-2026` literal left in code lines of the three files. The only hits are the two comments on the derived constants, which record the old values.
- `bunx --package typescript@5.6.3 tsc --noEmit` → **exit 0**.
- **Full suite, DB unreachable: 3995 pass / 0 fail across 314 files.** **0 fail attributable to camp.**
  - The tree also holds **Team A's uncommitted migration-ledger work**: `scripts/migrate-preflight.ts`, `seed-ledger-from-schema.ts`, `verify-migrations.ts`, `migration-ledger(.test).ts`, `.gitattributes`, and a mutation set. All green, and none of it touched.
- `git status` (mine): the three camp test files. Nothing committed.

## Questions

## Review
**Silver, 2026-10-06 — ✅ DONE.**
- **Diff read:** only the three camp test files. `CAMP_DAY` is computed (the first Monday ≥30 days after the Bangkok today), its neighbours are derived, and the expected strings are templates. The only `2026-10-0x` left is in comments recording the old values.
- **Re-run by me, with no reachable database:** the 3 files → green. 🔑 **With the clock moved 13 months ahead (`setSystemTime` preload, 2027-11-15): 37 / 0.** The bomb cannot go off again.
- **Your past-day control** (exactly the original 5 re-red) proves the fixture still exercises the skip-a-past-day rule. The date moved; the tests were not blunted. That is exactly the right check.
- Keeping a Monday, so no weekday assertion can move, is accepted.
