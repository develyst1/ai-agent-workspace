# SPEC-018: Daily admin digest — one check registry, two surfaces (08:00 LINE + web "needs attention")
- Source: REQ-023
- Status: ACTIVE

## Overview
Once a day at 08:00 the backend runs a set of **checks**, and if anything is outstanding it sends **one** LINE
message to every admin. The same check results also back a **"needs attention" panel in the web app**, so the two
surfaces can never disagree. New checks are added by appending to a registry — nothing else changes.

## As-built verified (I read the code, not the analysis)
Porter's read of the machinery is **correct**:
- **Delivery exists.** `lib/line-admin.ts` → `getAdminLineUserIds()` reads `app_settings.line_admin_user_ids`,
  and `notifyAdmins(payload)` fans out via `enqueueLine` into the outbox + retry worker. Nothing new needed.
- **Scheduling pattern exists.** `routes/internal.ts` mounts `POST /internal/jobs/end-of-day` and
  `/jobs/month-reset` **outside `/api`** (so not JWT-guarded), gated by `internalSecretError()` —
  `x-internal-secret` vs `INTERNAL_JOB_SECRET`, and **503 when the secret is unset**, so it is never an open
  endpoint. `scripts/end-of-day.ts` is the thin Task-Scheduler trigger. This REQ follows that shape exactly.
- **`job_runs` exists** (`schema.ts:399`) with `job`/`runDate`/`status`/`summary`/`finishedAt` and an index on
  `(job, run_date)` — enough for both idempotency and "when did this last run".

**One correction to the REQ's analysis — check #5 is NOT blocked.** REQ-019's fields already **landed with
TASK-048**: `students.gender` / `birth_date` / `nationality` (`schema.ts:112-115`) and `parents.province`
(`schema.ts:80`) are in the schema today. So **all six checks are computable now** and this REQ has **no
prerequisite**. (@Porter: worth telling คุณฟีน — she gets the check that prompted the idea in the first release.)

## Design decision 1 — ONE registry, ONE result, TWO renderers
The trap here is computing "what needs attention" twice: once for LINE and once for the web panel. They would
drift within a month. So:

```
lib/attention.ts        AttentionCheck = { key, title, run(ctx) => AttentionResult }
                        AttentionResult = { count, items: Array<{ id, label, hint? }> }
services/attention.service.ts   runAttentionChecks() => AttentionReport   ← the ONLY producer
```
- The **08:00 job** calls `runAttentionChecks()` and formats the report as a LINE message.
- The **web panel** calls `GET /api/attention` → the **same** `runAttentionChecks()`, computed **live**.
- **No stored results table.** The web view recomputing live is the point: it is always current, and there is
  nothing to keep in sync. (`job_runs` stores only the *summary counts* of what was sent, for audit.)

**Extensibility (AC #4) is the registry, not a framework.** Adding a check = one entry in the array with a `run`.
Delivery, ordering, empty-handling, and both renderers are untouched. Do **not** build a plugin system.

> **⚠️ AMENDED 2026-08-01 (measured on the first real 8th check, TASK-067) — the honest claim is:**
> **one array entry, plus one `AttentionCtx.load` field + loader if the check needs a data source nobody has
> loaded yet** (plus the i18n pair every check needs).
> The load-bearing half held exactly as promised: the digest renderer, `decideDigest`, the job, the runner, the
> panel producer and the endpoint **all stayed untouched**, and the privacy layer picked the new check up for
> free. The loader is *deliberate*, not a leak: the registry is kept free of query plumbing so the predicates
> stay pure and unit-testable, and importing `db` into `lib/attention.ts` to preserve a tidier slogan would be
> the wrong trade. Recorded because "one entry, full stop" would over-promise to whoever adds the ninth.

## Design decision 2 — a dead job must be VISIBLE, not silent
This project has **two scheduled jobs that have never been registered on the server** and nobody noticed, because
a job that never runs produces nothing to notice. A third silent job is the predictable outcome here, and "we'll
remember to register it" is exactly what failed twice.

So the web panel **displays when the digest last ran** — read from `job_runs` (`job = 'daily-digest'`, latest
`finished_at`), rendered as *"Digest last sent: 08:00 today"* or, when there is no row, **"⚠️ The daily digest
has never run — the 08:00 scheduled task is not set up."** A never-registered job then shows up on a screen staff
actually open, instead of being invisible forever.

For this to work the job **writes a `job_runs` row on every run, including runs that send nothing** (with
`summary.sent = false`). "Ran and had nothing to say" and "never ran" must be distinguishable — that distinction
is the whole value.

## Design decision 3 — what the digest is allowed to say (REQ-020 lesson)
The digest goes to admins over LINE, i.e. into a chat log on personal phones. Rule:
- **Counts and actionable labels always**; a per-item list **only where an admin cannot act without it**.
- **Only two checks name people**: *unconfirmed bookings today/tomorrow* (time · student **nickname** · teacher
  nickname — admins already see exactly this on the calendar and cannot chase a booking otherwise) and
  *teachers with no LINE link* (teacher nickname — it is the whole point of the check).
- The other four are **counts only** in LINE (e.g. "5 students missing information", "3 courses expire within
  14 days"); the names live behind auth in the **web panel**, which is where the work is done anyway.
- **Never** a full name, phone, DOB, or a child's name in a LINE digest. Truncate any list at **5** items
  with "+N more — see the web app".

## The six checks
All computable from existing data. Each is a pure-ish `run(ctx)` returning `{ count, items }`.

| # | key | Condition | LINE detail |
|---|-----|-----------|-------------|
| 1 | `unconfirmed_bookings` | `bookings.status = 'PENDING'` for **today or tomorrow** (Bangkok) — an unconfirmed booking means the teacher was never notified | list (≤5): time · student nickname · teacher |
| 2 | `teachers_without_line` | `teachers.line_user_id IS NULL` AND `active` AND NOT `archived` — they receive no notifications at all | list (≤5): teacher nickname |
| 3 | `expiring_entitlements` | courses/vouchers **not yet expired** but expiring within **N days**, with hours/sessions remaining | counts only |
| 4 | `nearly_finished_courses` | active course with **≤ M sessions remaining** (renewal conversation) | counts only |
| 5 | `freelance_near_cap` | FREELANCE teachers whose ceiling `remaining ≤ P` (incl. negative = over) | counts only |
| 6 | `incomplete_students` | student missing **any** of gender / birth_date / nationality, or whose parent has no province | counts only |
| 7 | `yesterday_no_shows` | `bookings.status = 'NO_SHOW'` on the previous day | counts only |

*(That is 7 rows because Porter's item 4 bundled two distinct checks — near-cap and no-shows — which have
nothing in common. They are separate registry entries.)*

**Reuse, do not re-derive:** check 3/4 must use **`lib/eligibility.ts`** (`courseEligible` / `voucherEligible`,
TASK-051) for "still active", and check 5 must use the existing freelance ceiling read — the same `remaining`
the calendar's `overLimit` uses. A second copy of "active" or "over cap" is a defect, not a shortcut.

**Thresholds live in ONE named-constant block** at the top of `lib/attention.ts`, with these defaults pending
confirmation: `EXPIRING_WITHIN_DAYS = 14`, `NEARLY_FINISHED_SESSIONS = 2`, `FREELANCE_NEAR_CAP_HOURS = 2`.
They are **defaults chosen so the feature ships, not decisions** — see Questions.

## API
**`POST /internal/jobs/daily-digest`** (in `routes/internal.ts`, same `internalSecretError` gate, optional
`{ date }` body like end-of-day so a missed day can be re-run):
1. Run `runAttentionChecks()`.
2. **Idempotency (AC #5):** if a `job_runs` row already exists for `('daily-digest', runDate)` with
   `summary.sent = true`, **do not send again** — return `{ skipped: "already-sent" }`. Re-running is then safe
   and cannot spam. (The existing jobs only insert; this one reads first — the only new behaviour.)
3. If **every** check returns `count = 0` → **send nothing** (AC #3), but still write the `job_runs` row with
   `summary.sent = false`.
4. Otherwise `notifyAdmins(<one message>)` — **a single payload**, not one per check (AC #2) — then write the
   row with `summary.sent = true` and the per-check counts.

**`GET /api/attention`** (authenticated staff) → `{ checks: [{ key, title, count, items }], lastRun: { runDate,
finishedAt, sent } | null }`. Live computation + the `job_runs` lookup from decision 2.

**Trigger:** `scripts/daily-digest.ts` — a copy of `end-of-day.ts`'s thin-trigger shape (POST + secret + exit
codes, no DB), plus a `daily-digest` package script. **Registering the 08:00 Windows task is a human step and is
part of delivery**, not an afterthought — it goes in the task's deploy notes and up to @Porter as an action.

## Data Model
**None. No migration.** `job_runs`, `app_settings.line_admin_user_ids`, the outbox, and every field the checks
read all exist today.

## Non-functional
- One producer (`runAttentionChecks`) for both surfaces — the web panel never re-derives a condition.
- The job must **never throw a check's failure into the whole digest**: one failing check is reported as a
  degraded entry, the rest still send. A digest that dies because one query broke is worse than a partial one.
- No change to `POST /bookings`, the freelance cap, the suspend gate, or the two existing jobs.

## Tasks
- **TASK-053** (Jason, BE): `lib/attention.ts` registry + 7 checks + `runAttentionChecks()`,
  `POST /internal/jobs/daily-digest` (idempotent, sends nothing when clear, always writes `job_runs`),
  `GET /api/attention`, the LINE digest message (TH/EN via `line-i18n`), and `scripts/daily-digest.ts`.
- **TASK-054** (Fern, FE): the "needs attention" panel — the checks with counts + item lists, and the
  **last-run indicator incl. the "never run" warning**. Depends on TASK-053's contract. **Browser-checked
  before DONE**, per the standing rule.

**Not staged, deliberately.** Nothing here is blocked (check #5's fields already exist), and the natural split is
BE→FE, which is two tasks in one delivery — not two stages. Staging would only delay the LINE half for no gain.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
1. **Thresholds — confirm or correct, non-blocking.** I picked defaults so this ships: *expiring within
   **14 days*** · *nearly finished at **≤2 sessions** left* · *freelance near cap at **≤2 hours** left*. If
   คุณฟีน has real numbers in her head (14 days may be too late for a renewal call), they are a one-line change
   in a single constant block. **I am not waiting on this** — I'd rather ship and tune.
2. **FYI, no answer needed: the digest will name people in only two checks** (unconfirmed bookings → student +
   teacher nickname; teachers with no LINE link → teacher nickname), because an admin cannot act on those
   without knowing who. Everything else is a **count in LINE** with the names behind login in the web panel.
   That is the REQ-020 lesson applied. Say if she expects more detail in the chat message itself.
3. **⚠️ Action for you, not a question: the 08:00 task must be registered on the server.** Two jobs already
   exist that were never registered and have therefore never run. TASK-053 ships a trigger script and exact
   Task Scheduler instructions, and TASK-054 makes a missing registration **visible on screen** — but a human
   still has to create the task. Please put all three (end-of-day, month-reset, daily-digest) in one go.
