# TASK-208: Daily 08:15 "class today" push to teacher + parent (REQ-072 part 3B) (scheduler-back)

- Source: REQ-072 part 3B (owner, via Porter 2026-08-28). 🟠 MEDIUM. **A fourth scheduled task — ships with an owner ops
  step, not just code.** On `develop`.
- Status: ✅ **BE code DONE (Sober 2026-08-28)** — 08:15 job: one-per-person (`groupReminders`), idempotent-per-day (`reminderAlreadySent`), reach counted, own `job_runs`. tsc 0·899/0. ⛔ NOT shipped until owner registers `sm-daily-reminder` (08:15, BOTH boxes) — ops step, @Porter.
- Repo: **scheduler-back**.

## What
A **daily push at 08:15** that finds everyone with a class **today** and notifies **both the teacher and the parent**.

## Shape — mirror the existing `daily-digest` job, don't invent one
- Server endpoint `/internal/jobs/daily-reminder` + `scripts/daily-reminder.ts` (compiled exe), exactly like
  `daily-digest` (`scripts/daily-digest.ts` → `/internal/jobs/daily-digest`, Windows Task Scheduler). Runs **08:15**.
- Finds today's booked sessions; **one message per PERSON** (a teacher with 8 classes gets ONE message listing them,
  a parent with 2 children gets ONE) — reuse the `ตารางวันนี้` composer (owner-verified).
- 🔴 **Idempotent within the day** — a re-run (or two boxes) must not double-send; key the outbox/guard on (person, day).
- 🔴 **Write a `job_runs` row** (like `jobs.service.ts:146`) so *"did it fire this morning"* is answerable.
- 🔴 **Count unlinked parents before/while building** — report the reach; unlinked → SKIPPED, never an error.

## Owner ops step (goes in the runsheet, not just code)
- Register **`sm-daily-reminder` at 08:15 on BOTH boxes** (Windows Task Scheduler, "run whether logged on or not"),
  mirroring the daily-digest registration. This is part of the REQ-072 uat deploy plan Porter wrote (step 3).

## DoD — the OUTCOME
- [ ] At 08:15, each teacher/parent with a class today gets **exactly one** message (not one per booking); a `job_runs`
      row records the run; a second run the same day sends nothing.
- [ ] Unlinked-parent reach reported; SKIPPED rows for them.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green. Owner registers `sm-daily-reminder` (runsheet).

## Notes
(Jason fills in. This is the fourth scheduled task; it does not ship "done" until the owner has registered it on both
boxes — say so in the review.)
