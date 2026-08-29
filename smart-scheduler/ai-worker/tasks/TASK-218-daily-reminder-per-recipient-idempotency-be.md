# TASK-218: Daily reminder — a manual pre-08:15 trigger eats the scheduled day (SA guard decision) (scheduler-back)

- Source: Porter's open-item flag (2026-08-29) — *"a manual pre-08:15 trigger silently eats the day"*. 🟢 LOW /
  non-blocking (the batch is LIVE). On `develop`.
- Status: TODO → @Jason (BE)
- Repo: **scheduler-back**.

## The gap (my decision, since Porter flagged it as mine)
`runDailyReminderJob` guards on `reminderAlreadySent(runDate)` = "is there a `job_runs` row with `attempted === true`
for today?" (TASK-209). That guard was right for its problem (a zero-reach re-run must not fire all morning) but creates
a new one: **a manual trigger before 08:15 sets `attempted:true`, so the real 08:15 scheduled run then skips — the day's
reminder is silently eaten.** A QA/ops test-trigger suppresses the morning send.

## The decision — idempotency belongs at the RECIPIENT, not the JOB
Neither `sent` nor `attempted` at the **job** level is right (one re-runs on zero reach, the other eats the day). Move
the idempotency to **per-(recipient, day)**, mirroring the day-end job's `rev:<bookingId>` pattern:
- Each person gets **at most one reminder per day**, keyed on the outbox (e.g. `reminder:<recipientType>:<personId>:<day>`).
- The job can then run **any number of times** that day: each run sends only to people **not already reminded today**.
  A manual pre-08:15 trigger reminds whoever is due; the 08:15 run reminds the rest — **no eaten day, no double-send.**
- Keep the `job_runs` row (the `attempted`/`sent`/reach observability from TASK-209) — it stays for "did it fire", but
  it is **no longer the thing that suppresses a send**; the per-recipient key is.

## DoD — the OUTCOME
- [ ] A manual trigger at 07:00 then the 08:15 run: **every due person gets exactly one reminder** (the 07:00 ones +
      the rest), none twice, none missed. Assert: a person reminded at 07:00 is skipped at 08:15; a person not yet
      reminded is sent at 08:15.
- [ ] Two runs with no gap still send each person once (double-run safe).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green.

## Notes
(Jason fills in. This supersedes the job-level `reminderAlreadySent` guard for *suppression*; keep it only if it still
earns its place for observability. The daily-digest job is one-message-to-admins so its job-level guard is fine — the
reminder differs because it is per-person.)
