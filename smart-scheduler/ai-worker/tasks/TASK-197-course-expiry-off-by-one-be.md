# TASK-197: `courseExpiry` is off by one week — fix + pin (corrects TASK-195) (scheduler-back)

- Source: owner (via Porter, 2026-08-28) — caught on a fresh course. 🔴🔴 **BLOCKING — do this FIRST, ahead of any
  expiry write to real data.** BE-only, no schema.
- Status: ✅ **BE DONE (Sober 2026-08-28)** — tsc 0·833/0; `(weeks−1)*7`, owner case pinned (4 Sep+6→23 Oct). **FIX-007 repair is now UN-HELD → release to owner via @Porter.**
- Repo: **smart-scheduler-back**, on `develop`.

## The defect (and it is MY review miss — owning it)
`courseExpiry` (`lib/recurring.ts:32`) computes `start + weeks * 7` days. It must be **`start + (weeks − 1) * 7`**.
The ceiling is a **week NUMBER** — week 1 *is* the start week, so week `N` falls `N−1` weeks after the start. Adding
the full `weeks` overshoots by exactly one week, on **every** course (create AND import both call `courseExpiry`;
`importedCourseExpiry` inherits it).

**Owner's live proof — pin it:** a 6-session course from **2026-09-04** → the code says **30 Oct**, the correct answer
is **2026-10-23** (4 Sep + 7 weeks = 49 days).

⚠️ **I passed TASK-195 with the wrong arithmetic.** My review said "AC-1 → +5/8/13 weeks, PASS" — that is off by one; the
right answer is **+4/7/12 weeks**. The tests Jason wrote (and I verified) encoded `weeks*7`, so the suite was green over
a real defect the owner found by using it. Same class as the baht/satang miss: layers agreeing with each other is not
the same as agreeing with reality.

## Fix
1. `courseExpiry`: `addDays(start, (MAX_WEEK_BY_SIZE[size] − 1) * 7)`. Confirm `importedCourseExpiry` now yields the
   corrected value through the identity (`importedCourseExpiry(f,s,p) === courseExpiry(f − p weeks, s)`), no separate edit.
2. **Rewrite the tests to the CORRECT arithmetic** — they currently assert the bug. Pin, explicitly:
   - `courseExpiry("2026-09-04", 6) === "2026-10-23"` (the owner's case).
   - 4/6/10 → start **+ 4/7/12 weeks** (= `(MAX_WEEK−1)` weeks: 5→4, 8→7, 13→12).
   - The owner's imported worked example re-derived on the corrected rule (10 · 4 prior · first-remaining 5 Feb) — state
     the new expiry and that it still lands under the ceiling.
3. Nothing else in TASK-195 changes (the import path, the create-already-computes confirmation, the guard) — only the
   week math and the tests that asserted it.

## 🔴 Gate on the FIX-007 repair
**The `course:repair-expiry` dry-run/commit must NOT run until this lands and is pinned by a test.** I routed that
repair to the owner via Porter earlier — it has to be **held** now, or it would bake the off-by-one into ~170 live
courses and destroy our ability to tell an original error from one we caused (Porter's point, and it's right). Porter
to hold the owner until this task is green.

## DoD
- [ ] `courseExpiry("2026-09-04", 6)` = `2026-10-23`; 4/6/10 = start + 4/7/12 weeks — pinned by tests.
- [ ] `importedCourseExpiry` yields the corrected value via the identity (no drift).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green (the rewritten expiry tests included).
- [ ] Repair stays UN-run until this is merged (coordination note to Porter, not a code item).

## Notes
(Jason fills in. Pure one-line rule change + honest test rewrite. The value of this task is the test now asserting the
owner's real number, not our internal consistency.)

## Implementation Notes
**Files:** `lib/recurring.ts` (`courseExpiry` + its note) · `lib/recurring.test.ts` (rewritten) ·
`lib/expiry-repair-plan.test.ts` (one fixture date) · `lib/course-plan.ts` (the ceiling comment, which stated
the bug). On `develop`.

**The fix is `(weekNumber − 1) * 7`.** `importedCourseExpiry` needed no edit at all — it composes
`courseExpiry`, and the identity test proves it inherited the correction rather than needing its own.

**The tests are rewritten around YOUR NUMBER, not around the formula.** `courseExpiry("2026-09-04", 6) ===
"2026-10-23"` is a date the owner read off a screen, and it carries a comment telling the next reader **not to
"simplify" it back into arithmetic**. That is the whole lesson: my old tests said `weeks * 7` because the code
said `weeks * 7`, so they agreed all the way into production. I also pinned the *meaning* separately — "the
start week counts as week 1" — because that is where the next off-by-one will live.

**Two things the fix changed that I checked rather than assumed:**
- `courseSessionDates` was **already correct** (`i * 7` from `i = 0`, so session 1 is the start date). The
  ceiling was the odd one out, not the cadence — a 6-session course from 4 Sep runs 4 Sep → 9 Oct with the
  ceiling at 23 Oct, which is two weeks of extension room, not three.
- **No FE mirror exists.** `MAX_WEEK_BY_SIZE` is used in the frontend only as a *week number* for display
  ("สัปดาห์ที่ 8"); nothing there computes an expiry date, so there is no second copy to correct. Checked
  across both FE repos.

**The other worked example moved, and I updated it honestly rather than quietly:** the owner's import case (10
· 4 prior · first remaining 5 Feb) is now **2026-04-02**, not 04-09 — the same seven days coming off every
course. The one repair-plan fixture that hard-coded 04-09 is updated with that reason in a comment.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **833 pass / 0 fail**. No
migration, no schema, no DB run by me.

**DoD:** owner's case pinned ✅ · 4/6/10 = start + 4/7/12 weeks ✅ · `importedCourseExpiry` corrected via the
identity, no separate edit ✅ · tsc/test green ✅ · **the repair stays un-run — @Porter, it can be released to
the owner once this is merged** ⛔.

## Questions
- Q1: every existing course row now holds an expiry **one week later than the rule says**, including the ~170
  live ones — so `course:repair-expiry`'s change list will be much larger than FIX-007 alone implied, and
  **native courses will move too** (my TASK-195 Q1 said native movement would mean a second defect: it doesn't
  any more, this is that defect, and it is expected). The flip list may therefore contain families who lose a
  week. **That is the owner's call to read before commit, and it is exactly what the dry run is for.**

  > answer: (Sober)

  > **A (Sober): correct, accept — and it supersedes my TASK-195 Q1.** Native courses moving is now **expected**, not a
  > second defect: my TASK-195 note said "if native courses move in the dry-run, stop — that's a second bug." That was
  > true *then*; **this off-by-one IS that movement**, so native rows shifting one week earlier is the fix landing, not a
  > new fault. Consequence the owner must see: the repair's flip list is **larger than FIX-007 alone implied and includes
  > native families**, some of whom **lose a week** of window. That is exactly what the dry-run + read-before-commit
  > exists for (FIX-007 AC-8) — the owner reads the full list (imported AND native) before `--commit`. Nothing changes in
  > the repair's design; only the expectation of how many rows it touches.

## Review — ✅ PASS (Sober 2026-08-28)
Reproduced tsc 0 · `bun test` **833/0**. `courseExpiry` = `(weekNumber−1)*7` (`recurring.ts`), owner's case pinned
(`courseExpiry("2026-09-04",6)==="2026-10-23"`), 4/6/10 = +4/7/12 weeks, "start week counts as week 1" pinned
separately, `importedCourseExpiry` corrected via the identity (no drift), `courseSessionDates` confirmed already-right,
no FE mirror (checked both repos), the import worked example honestly updated (5 Feb case → 2026-04-02). The test now
asserts the owner's real number with a "do not simplify back to arithmetic" comment — which is the whole lesson of the
miss. Nothing to change. **This releases the held FIX-007 repair.**
