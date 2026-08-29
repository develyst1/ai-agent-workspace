
## Implementation Notes
**Files:** `lib/daily-reminder.ts` + `.test.ts` (new, pure, 10) · `services/jobs.service.ts`
(`runDailyReminderJob`) · `routes/internal.ts` (`/jobs/daily-reminder`) ·
`scripts/daily-reminder.ts` (new trigger) · `package.json` · `lib/line-message.ts` (`daily_reminder` case) ·
`lib/line-message.test.ts` (+4) · `services/day-end-auto-attend.test.ts` (+7).

**Mirrors `daily-digest` deliberately** — thin trigger exe → internal endpoint → all logic server-side. The exe
never touches the DB, so it cannot drift from the API's rules, and it is safe to re-run.

**One message per PERSON is the whole feature, and it is a pure function** (`groupReminders`): every teacher
who teaches today, every parent whose child has a class today. A **parent with two children gets one message
listing both** — the parent grouping is keyed on the parent, not the student, and there is a test for exactly
that. Cancelled / leave / delivered sessions never remind anyone about a class that is not happening.

**The message is not mine.** The `daily_reminder` case calls **`renderSchedule` — the owner-verified
`ตารางวันนี้` composer** — rather than formatting a second version of the same list. A second format would be
a second thing to get wrong and a second thing to re-verify on a phone.

🔴 **The reach is counted BEFORE anything is sent, and returned:** teachers / parents / unlinkedTeachers /
unlinkedParents. On `uat` most parents were imported and have **never linked LINE** — a reminder feature that
reaches nobody looks *identical* to one that works, for as long as nobody checks. That is the
`sale:ensure-items` lesson, and this is the cheap version of it.

🔴 **`sent: true` means the JOB ran, not that anybody was reached** — written that way on purpose, with a test.
Conflating the two would let a silent registration failure hide behind a day where every parent happened to be
unlinked.

**Idempotent per business date** (`reminderAlreadySent` is read before any enqueue, asserted by ordering), and
a **`job_runs` row is written every time**. That row is not bookkeeping: two scheduled jobs on this project were
never registered on a box and nobody noticed for weeks — the day-end job turned out never to have run on `uat`
at all. This is the thing that makes *"did it fire this morning?"* answerable.

Parents are loaded in **one** query, not one per student (a Saturday is ~60 sessions).

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **899 pass / 0 fail** (+21).
No migration.

### ⛔ This does NOT ship "done" — it ships when the owner registers it
**@Porter — the ops step, both boxes, part of the REQ-072 deploy:**
1. `bun build --compile scripts/daily-reminder.ts --outfile dist/daily-reminder`
2. Windows Task Scheduler → **`sm-daily-reminder`, daily 08:15, "run whether user logged on or not"**, with
   `SCHEDULER_API_URL` + `INTERNAL_JOB_SECRET` in the machine env — mirroring `sm-daily-digest`.
3. **The morning after: check `job_runs` has a `daily-reminder` row for that date.** If there is no row, the
   task was not registered — which is exactly how the day-end job stayed invisible for weeks.

**The DoD's outcomes are all owner-side** (one message per person at 08:15, a second run silent, the reach
numbers). I have proven the shapes that make them inevitable; I have run nothing against a database and cannot
send a LINE message.

## Questions
- Q1: I send the reminder for **every** live session today including `PENDING` (unconfirmed) ones — a teacher
  turning up matters more than whether an admin clicked confirm. If the owner wants confirmed-only, it is a
  one-line change to `REMINDABLE`.
- Q2: 08:15 is fixed in the Task Scheduler registration, not in code — same as the digest. If he wants it
  configurable that is an `app_settings` key and a different task.

  > answer: (Sober)
