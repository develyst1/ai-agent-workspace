
## Implementation Notes
**Files:** `services/jobs.service.ts` (the write + counters + header) · `lib/auto-cut.ts` (`isNoShow` →
`isDueForAutoAttend`) · `lib/attention.ts` (dead check removed) · `lib/line-i18n.ts` (its title removed) ·
`services/scheduler.service.ts` (report-field note) · tests: `services/day-end-auto-attend.test.ts` (new, 7) ·
`attention` / `auto-cut` / `course-history` updated.

**1. The write is `ATTENDED`**, quota increment untouched, no CRM points. The header now records *why* the old
label was wrong — no mechanism, only a claim about a child — because that is the decision someone would
otherwise "restore" later.

**2. Renamed the predicate too: `isNoShow` → `isDueForAutoAttend`.** It never decided a child was absent; it
found sessions nobody had marked. Leaving the old name would have left the false claim living in the code after
we removed it from the data. **The rule itself is unchanged** — there is a test asserting *which* sessions it
picks is exactly what it was.

**3. Counters renamed** (`autoAttended` / `coursesAutoAttended` / `vouchersAutoAttended`): a `job_runs` reader
must not be able to read "noShow" out of a system that can no longer produce one.

**4. The dead check is deleted, not skipped**, with the reasoning left in place: a digest line that is
structurally always zero teaches everyone to skim past the ones that aren't. The registry count test moves
11 → 10, and I noted there that **a check leaving is as legitimate a move as one arriving**.

**5. Historical `NO_SHOW` verified at all three sites and pinned.** `course-history` still maps it to a
`no-show` event (new test — deleting the enum "because nothing writes it" would blank real sessions out of a
family's history); the daily report's `noShow` count still counts historical dates and now carries a note that
it reads 0 going forward; the teacher-archive guard only looks at *future* rows, so it is unaffected.

**6. The tests are source-level**, as with TASK-178, and for the same reason: the job is one transaction with no
pure seam, and the claims that matter are about what it does **not** do — write a false status, award points,
change consumption. Comments are stripped before asserting, so the file can discuss the old behaviour at length
without a test passing on prose.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **750 pass / 0 fail** (+7, −3 deleted). No migration.
⚠️ I ran nothing against a database.

**DoD:** ATTENDED + quota +1 + no points ✅ · counters renamed, comments corrected ✅ · historical NO_SHOW
verified at all three sites and pinned by a test ✅ · dead check + registry entry + i18n title removed ✅ ·
tsc/test ✅ · repair SQL below ⛔ owner-run.

### Repair the 15 `uat` rows — @Porter, for the owner, AFTER the code deploys
```
SELECT count(*) FROM bookings WHERE status = 'NO_SHOW';   -- expect 15
UPDATE bookings SET status = 'ATTENDED' WHERE status = 'NO_SHOW';
```
`used_sessions` is deliberately **not** touched — the children attended and one session was consumed each,
which is already correct. Idempotent: a re-run finds 0 (AC-6). **Deploy first**, or the job creates fresh
NO_SHOW rows mid-repair.

## Questions
- 🔴 **Q1 — this change moves money, and the task didn't mention it.** The revenue pass selects
  `status = ATTENDED` for `FIRST_TRIAL` / `SINGLE_SESSION`. Those types are exactly the ones that post revenue at
  day-end — so from this change on, **a trial or single session that nobody marked will post its revenue**, where
  before it became NO_SHOW and posted nothing. Arguably right (the slot was held and the session ended);
  arguably wrong (nobody confirmed the child came, and the money may never have been collected at the counter).
  I did **not** special-case it: suppressing it correctly across re-runs needs a "was auto-marked" marker, which
  is a column, not a condition — and inventing that on spec is worse than naming the consequence. **Your call
  before this deploys**, and it interacts with the day-end job only just having been switched on for `uat`.
- Q2: `attention.ts`'s replacement signal ("attended but never checked in") — I agree it needs its own
  grounding and did not build it. Worth noting it is now the *only* way to spot the cohort the CRM level is
  about, so the gap is real while it waits.

  > answer: (Sober)
