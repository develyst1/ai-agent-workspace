
## Implementation Notes
**Files:** `services/jobs.service.ts` (the guard, the counts, the predicate) ·
`services/scheduler.service.ts` (`MONTH_RESET_JOB` + its row) · `services/day-end-auto-attend.test.ts` (+5,
one rewritten).

**1. The guard now gates the SEND, never the RECORD.** A re-run writes a row with
`{ attempted: false, sent: 0, reason: "already-sent" }` instead of returning early. Two runs ⇒ **two rows**,
which is the property the DoD asks for and the one these rows exist to preserve.

**2. `sent` is the delivered count**, with `skipped` beside it — and `attempted` is the separate fact that the
job ran. One boolean was being asked two questions ("did it fire?" and "did it reach anyone?"), and on `sid` it
answered the second one wrongly: a run that reached **zero** people recorded `sent: true`.

🔴 **The part that would have bitten later:** `reminderAlreadySent` used to key on `summary.sent === true`. With
`sent` now a **count**, keying on it would make the job **re-run all morning on exactly the days it reached
nobody** — the failure mode hiding inside the fix. It keys on `attempted`, and there is a test pinning that.

**3. `month-reset` writes a row too.** It wrote none at all, so "the monthly reset never ran" was invisible in
precisely the way the day-end job's absence was.

**And a property test rather than a per-job memory:** *"every scheduled job inserts a `job_runs` row"* is now
asserted across all three service files. If a fifth job is added without one, that is where someone notices —
which is better than each of us remembering, since between us we have already missed it twice.

**My TASK-208 test asserted `sent: true` and passed** while the run reached nobody. It is rewritten to assert
the count and the `attempted` flag; that assertion is the one that had to change, not just the code.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **903 pass / 0 fail** (+4).
No migration.

**DoD:** two runs ⇒ two rows, second `sent: 0` ✅ (source + shape; the row count itself is the owner's re-run) ·
`sent` = delivered, skip/unlinked beside it ✅ · `month-reset` records ✅ · tsc/test ✅.

### ⛔ @Porter — the outcome check is one command, twice
Have the owner run **`sm-daily-reminder` twice** on `sid`, then read `job_runs`:
- **two rows** for that date — the second with `sent: 0`, `attempted: false`, `reason: "already-sent"`;
- the first row's `sent` should equal the number of **linked** recipients — on `uat` today that is the teachers
  only, and **`sent` will legitimately be less than `teachers + parents`**. That is the number being honest,
  not a bug.

## 📌 Carried forward, unchanged (owner's ruling)
`uat`: **0 of 180 parents linked** ⇒ REQ-072's parent half reaches nobody there. Customer adoption, not a
defect. **No nudge, no broadcast, no "repair" to those 180.** The teacher half ships on its own, and after this
task the `job_runs` row will *say* it reached only teachers instead of implying it reached everyone.
