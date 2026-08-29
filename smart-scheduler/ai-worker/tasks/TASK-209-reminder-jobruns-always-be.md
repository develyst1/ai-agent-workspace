# TASK-209: The daily-reminder must ALWAYS write a `job_runs` row (+ honest `sent` count) (scheduler-back)

- Source: Porter (owner ran `sm-daily-reminder` twice on `sid`, `job_runs` holds ONE row) 2026-08-29. 🟠 MEDIUM.
  A defect in TASK-208 — **my review miss.** On `develop`. No schema.
- Status: ✅ **BE code DONE (Sober 2026-08-29)** — guard keys on `attempted` (not the count — the bug-inside-the-fix), re-run writes a row (two runs → two rows), `sent`=delivered count, month-reset row, cross-file "every job writes job_runs" property test. tsc 0·903/0. 🔴 two-rows-on-sid = owner re-run.
- Repo: **scheduler-back**.

## The defect (attributed — mine, per the standing rule)
`runDailyReminderJob` guards `if (await reminderAlreadySent(runDate)) return {skipped}` **before** the `job_runs`
insert — so a second run **sends nothing AND records nothing.** "Ran, nothing to send" and "never ran" become
indistinguishable — the exact property the jobs exist to preserve. **My TASK-208 review verified idempotency of the
SEND, not that the run is always RECORDED** — I should have checked it against the digest, which states the rule
outright (`internal.ts:41`: *"idempotent per business date, and it ALWAYS writes a `job_runs` row"*). Same
mechanism-vs-outcome shape I keep hitting: I confirmed the guard fires, not the full property.

## Fix
1. **`reminderAlreadySent` gates SENDING, not RECORDING.** Restructure so **every invocation writes a `job_runs`
   row** — a re-run writes a row with `sent: 0` (already-sent), it does not early-return before recording. Mirror the
   digest's shape exactly (one job, one behaviour).
2. **`sent` = the number ACTUALLY delivered**, not `true`. On `sid` the run reached **0** (all recipients unlinked) yet
   recorded `sent: true` — anyone reading `job_runs` for *"who did we notify?"* gets the wrong answer (the
   `revenuePosted`-counts-replays class). Store the delivered count with the skip/unlinked counts beside it.
3. **Fold in `month-reset`'s missing row** (queued item, same one-line habit): `month-reset` writes **no** `job_runs`
   row at all — add one, so its runs are visible too.

## Definition of Done — the OUTCOME
- [ ] Run the reminder twice for the same date → **`job_runs` holds TWO rows** (second: `sent: 0`, reason
      already-sent); no message sent twice. Assert the row count, not just "it didn't resend."
- [ ] `sent` equals the delivered count (0 when all unlinked); skip/unlinked counts recorded beside it.
- [ ] `month-reset` writes a `job_runs` row on every run.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green.

## 📌 KNOWN STATE — do NOT "fix" (owner's ruling)
`uat`: **0 of 180 parents have a LINE link** ⇒ the parent half of REQ-072 (3A + 3B) reaches nobody there. Owner:
*"ลูกค้าแค่ยังไม่ใช้เฉย ๆ ปล่อยไป."* The linking flow works; no family has used it — **customer adoption, not a bug.**
No broadcast/prompt/nudge to those 180 unless the owner asks. The teacher half works and ships on its own. (Written
here so nobody "repairs" it.)

## Notes
(Jason fills in. The DoD asserts the row COUNT and the delivered NUMBER — the outcome — not "the guard runs".)
