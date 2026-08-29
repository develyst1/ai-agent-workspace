# TASK-200: The expiry repair must NOT touch imported courses (FIX-007 follow-up) (scheduler-back)

- Source: owner (via Porter, 2026-08-28) — *"ข้ามการแก้วันexpire คอร์สนำเข้าไปก่อน"* (skip repairing imported-course
  expiry for now — the import data may encode agreements we can't see). 🔴🔴 **URGENT — the `uat` commit is HELD on
  this.** BE-only, no schema.
- Status: ✅ **BE code DONE (Sober 2026-08-28)** — IMPORT excluded before the map; unit-outcome PROVEN (no IMPORT in changes OR counts, mixed-set test). tsc 0·854/0. 🔴 uat dry-run `later` 74→~0 = UNVERIFIED until owner re-runs — the final gate.
- Repo: **smart-scheduler-back**, on `develop`.

## The defect (mine — I mis-confirmed it; attribution rule)
The owner's ruling is **"do not touch imported expiry AT ALL"**, not "use the right formula for imports." `correctExpiry`
(`lib/expiry-repair-plan.ts:39`) is a **BRANCH** (`IMPORT ? importedCourseExpiry : courseExpiry`), and `planExpiryRepair`
(`:44`) `.map`s **every** course and filters only on `from !== to`. So imported courses **are still rewritten** — a
`uat --commit` would retro-change the ~74 imported courses the owner explicitly protected (values a human typed). I
reported "SALE filter confirmed" after seeing the source-dependent code path; a path existing is not the behaviour the
owner asked for. Held correctly by Porter.

## The fix
1. **Exclude `source === "IMPORT"` in `planExpiryRepair` BEFORE the `.map`** — `courses.filter(c => c.source !== "IMPORT")`
   — so imports never enter the change list, the counts, or the flip list. Native (`SALE`) courses are still repaired via
   `courseExpiry` (off-by-one-fixed by TASK-197).
2. **Keep `importedCourseExpiry` in the code, unused-by-the-repair.** It is correct and is what *future* imports should
   use once the import form is fixed (a later task). What's banned is retro-rewriting rows a human already filled in.
3. A test: a fixture with IMPORT + SALE rows → `planExpiryRepair` returns changes for **SALE only**; no IMPORT id appears
   in the changes or the counts, even when its stored expiry differs from `importedCourseExpiry`.

## Definition of Done — verify the OUTCOME, not just the code path (the lesson)
- [ ] 🔴 **The `uat` dry-run is re-run and the numbers posted.** The `later` count (**74**, which was the imports) must
      **collapse toward 0**. **If it does not, the exclusion is not working — STOP, do not commit.** (This is the
      outcome check; "I added a filter" is not sufficient — the count is.)
- [ ] No IMPORT-source course appears in the repair's change list or counts (unit-tested on a mixed fixture).
- [ ] SALE courses still repaired (courseExpiry). `importedCourseExpiry` retained in code.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green.
- [ ] Dry-run/commit stay owner-run; hand Porter the re-run instruction; you run nothing against a DB.

## Notes
(Jason fills in. One-line exclusion + one test + the re-run. The owner does not commit until the dry-run shows imports
are gone from the list.)
