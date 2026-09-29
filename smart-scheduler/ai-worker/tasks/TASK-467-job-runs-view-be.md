# TASK-467 — a read-only "last job runs" view, because I moved the outcome into `job_runs` without giving the owner a window into it — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size XS.** No migration.

## §0 Why, and it is my gap
TASK-462 moved a job's outcome out of the PowerShell window into a `job_runs` row — deliberately, so that "it ran long" and "it died" stop looking identical. **But there is no way for the owner to READ that row**, so I replaced one blind spot with another. He asked "how do I see it finished?" and the honest answer today is "open the database".

## §1 Build
- **`GET /internal/jobs/runs?job=&limit=`** behind `INTERNAL_JOB_SECRET` (the same gate as the triggers), newest first, default limit 20, capped: `{ job, runId, status, startedAt, finishedAt, summary }`. Nothing else — this is a window, not a console.
- **A `sm-jobs/job-runs.ps1`** beside its siblings, in their exact shape (TASK-461's rule: a route without its trigger is undeployable; and the both-directions walk will fail the build if you forget it). It prints the rows readably — the owner should be able to run one file and see "did last night's job finish?".
- Pinned: the secret gate (401 without it), the newest-first order, the cap, and that a `running` row with no `finishedAt` reads as exactly that — **an unfinished run must be visibly unfinished**, since that is the signal the whole design rests on.
- 🚫 No UI, no auth beyond the existing internal secret, no write of any kind.

## Definition of Done
- [ ] The route by value (gate · order · cap · a `running` row) · the trigger file in the siblings' shape · the walk test still green (it will fail if the trigger is missing) · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log, with the one line the owner runs.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — the runs window + its trigger; 2978 pass / 0 fail; 7/7 mutations bite

**Numbers:** `bun test` **2978 pass / 0 fail** (+4, new file `src/lib/job-runs-view-req105.test.ts`) · `tsc` **0** · 🚫 no migration (56 = 56) · 1 pin moved (the TASK-461 walk's census gains the new job).

## §1 One deviation from your spec, argued — the route is `/internal/jobs/job-runs`, not `/internal/jobs/runs`
Your spec named the route `runs` and the trigger `job-runs.ps1`. TASK-461's walk rule is **a trigger file calls a route with ITS OWN NAME** (a file called X that calls Y is the dangling-trigger defect wearing a friendlier name), so one of the two names had to move. I kept the rule and moved the ROUTE: the file name is the one the owner types, so it should be the clear one. 🚫 I did NOT add an exception to the walk — an exception by name is exactly the bet DEF-2 lost.
📌 **The walk now covers GET routes too** (it matched `.post` only) — the read-only window is deployed the same way as a job, so the same both-ways rule binds it; the census lists seven.

## §2 What was built
- **`GET /internal/jobs/job-runs?job=&limit=`** behind `INTERNAL_JOB_SECRET` (401 without it, and the database is never asked). Newest first (`started_at desc` — pinned from the SQL the route actually builds, not from a sorted fixture), default **20**, capped at **100** twice: the query schema refuses 101 with a 400 before the database, and the service clamps anyway (a caller that skips the schema cannot read the whole table). Returns exactly `{ job, runId, status, startedAt, finishedAt, summary }` — a window, not a console. 🚫 No write of any kind (pinned: `insert`/`update`/`delete` all throw if called).
- 🔑 **An UNFINISHED run reads as unfinished:** a `running` row comes back with `finishedAt: null` — never defaulted to anything. Mutation D dresses it as finished (`finishedAt ?? startedAt`) and bites.
- **`sm-jobs/job-runs.ps1`** — the siblings' header exactly (same host, port and secret line — copied from a sibling, not retyped), but `-Method Get`, then a table: `job · status · startedAt · finishedAt`, where a run with no finish prints **`-- NOT FINISHED --`**, never a blank cell that reads like success (mutation F blanks it and bites).

## Break-and-watch — `mut467.mjs`, 7 mutations, **7 bite** (`finally`, sha-256 restore, `BASELINE=8` — read off the run this time)
A the secret gate removed · B OLDEST first · C the service cap removed · D 🔴 an unfinished run dressed as finished · E the job filter dropped · F the trigger prints a blank for an unfinished run · G 🔴 **the view ships with no trigger** (the FILE is moved away, because the defect is an absence) — caught by TASK-461's walk.

## 📦 The one line the owner runs (after copying `sm-jobs/job-runs.ps1` to the box)
```
powershell -File sm-jobs\job-runs.ps1
```
He reads the `group-series-extender` row: `status: success` with a time in `finishedAt` ⇒ it finished; `status: running` with **`-- NOT FINISHED --`** long after it started ⇒ the process died mid-run (TASK-462's signal); `failed` ⇒ the reason is in the summary. ⛔ Only you mark this DONE. ▶️ TASK-468 (contract first).

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me: **2978 pass / 0 fail** · tsc 0 · 56 = 56 · `sm-jobs/job-runs.ps1` beside its six siblings · the route at `/jobs/job-runs`.
**§1 — he moved MY name, not the rule, and he was right to.** I specified the route as `runs` and the trigger as `job-runs.ps1`, which breaks TASK-461's own rule (*a trigger calls a route with its own name*). He kept the rule, renamed the route, and **refused to add an exception** — *"an exception by name is exactly the bet DEF-2 lost"*. That is the correct order of loyalty: the rule we wrote down beats the name I typed. He also widened the walk to cover GET routes, since a read-only window is deployed exactly like a job.
Three more things right:
1. **An unfinished run reads as unfinished, end to end** — `finishedAt: null` is never defaulted, and the trigger prints **`-- NOT FINISHED --`** rather than a blank cell that reads like success. The whole point of TASK-462 was that a dead run and a long run stop looking alike; a blank column would have undone it at the last inch.
2. **The cap is enforced twice** — the schema refuses 101 before the database, and the service clamps anyway, so a caller that bypasses the schema still cannot read the table.
3. **Newest-first is pinned from the SQL the route builds**, not from a pre-sorted fixture — after this week, that distinction is the difference between a pin and a decoration.
📦 The owner now has one line — `powershell -File sm-jobs\job-runs.ps1` — and can read `success` + a finish time, or `running` + `-- NOT FINISHED --` long after it started, which is TASK-462's "the process died" signal. **My gap is closed.**
