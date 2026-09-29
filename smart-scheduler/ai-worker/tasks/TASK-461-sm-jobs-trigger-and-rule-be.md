# TASK-461 — the group-extender shipped without its `sm-jobs/*.ps1` trigger, so the owner had nothing to deploy: add it, and make "a new internal job ⇒ its trigger in the SAME task" a rule the suite enforces — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-24) · **Size XS.** No migration.

## §0 What happened, and whose miss it is
The owner keeps the job triggers in this repo at **`sm-jobs/*.ps1`** (`daily-digest`, `daily-reminder`, `end-of-day`, `month-reset`, `weekly-teacher-digest`) and copies them to the box. **TASK-456 shipped the job, the route and the script but no `sm-jobs/group-series-extender.ps1`**, so there was nothing for him to deploy; he is hand-writing one today.
**Mine, not yours:** my TASK-456 text said "the exe, the `package.json` script … register it", and the repo's actual convention — a one-file PowerShell trigger beside its siblings — was sitting in `sm-jobs/` where I did not look. You built what the task described.

## §1 Build
1. **`sm-jobs/group-series-extender.ps1`**, byte-for-byte in the siblings' shape: `Invoke-RestMethod -Method Post` to `/internal/jobs/group-series-extender`, the `x-internal-secret` header **by exactly the same means the siblings use** (do not invent a second way to supply it — see §2), `-ContentType "application/json" -Body "{}"`. Same port, same style, same line breaks: a file the owner can copy next to the others without reading it twice.
2. 🔑 **The rule, which is the real deliverable — a test that walks both sides:** every `POST /internal/jobs/:name` route has a `sm-jobs/<name>.ps1`, and every `sm-jobs/*.ps1` posts to a route that exists. Both directions: a job with no trigger is undeployable (this defect), and a trigger pointing at a route we renamed or deleted fails silently on the box every night for ever. Name that reasoning in the test. ⚠️ Assert the ps1's **URL path**, not its whole body — pin the effect, not the text (this week's rule).
3. Say in your report whether any OTHER internal job route is missing its trigger, or any trigger points at nothing. If one is, fix it here — it is the same one-file change and the same defect.
- 🚫 Do not change the siblings' contents, the port, or how the secret is supplied. Do not add a registration step to the code.

## §2 One thing to REPORT, not to change
The committed triggers carry the internal job secret **in plain text in the repo**. That is the owner's existing convention and it is not yours or mine to change unilaterally — **report it, do not touch it.** In your report say what the alternative would look like (the trigger reading it from the machine environment, the way the API process already reads its own secrets) and what it would cost the owner to switch. I am raising it with Porter in parallel as a decision for the owner and Otto.

## Definition of Done
- [ ] The trigger file, in the siblings' exact shape · the both-directions walk test with its reasoning · any other missing/dangling trigger named (and fixed if trivial) · the plaintext-secret note in the report · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-24) — the trigger + the both-directions rule; 2926 pass / 0 fail; 5/5 mutations bite

**Numbers:** `bun test` **2926 pass / 0 fail**, 226 files (+1: `src/lib/job-triggers-req105.test.ts`, 4 tests) · `tsc --noEmit` **0** · 🚫 no migration (56 = 56) · 0 pins moved.

## §1 The file
`sm-jobs/group-series-extender.ps1` — built by **copying `weekly-teacher-digest.ps1`'s bytes and swapping the job name**, so it is identical in verb, port, header, body, backtick continuations, CRLF line endings and the absence of a trailing newline. 📌 I did not retype it: a hand-typed sibling is how the one that is subtly different gets copied to the box.

## §2 The rule — both directions, and each is a defect we have paid for
`job-triggers-req105.test.ts` reads the job names **out of the router** (never a list typed in the test) and the posted job **out of each `.ps1`**, then walks:
- **→ no job is UNDEPLOYABLE:** every `POST /internal/jobs/:name` has `sm-jobs/<name>.ps1`. That is this defect — TASK-456 shipped a job the owner could not deploy.
- **← no trigger is DANGLING:** every `.ps1` posts to a job the router actually serves, **and to its own name** (a file called X that posts to Y is the same silent failure wearing a friendlier name). 🔑 This is the more expensive direction: a trigger aimed at a renamed route fails on the box **every night, for ever**, and nobody reads a Task Scheduler history until something else goes wrong.
⚠️ **The URL PATH is the assertion, never the whole body** (this week's rule, from TASK-460's mutation Q). The rest of the file is compared **to a sibling** rather than to a literal typed in the test — so the day the owner changes the port or the header across all of them, this test follows him instead of fighting him. And there is a guard on the guard: a fabricated dangling trigger and a fabricated orphan job are both shown to be caught.

## §3 The census — asked and answered
**Six routes, six triggers, no dangling ones.** `daily-digest` · `daily-reminder` · `end-of-day` · `month-reset` · `weekly-teacher-digest` · `group-series-extender` (new). 🚫 Nothing else was missing and nothing pointed at a route we have renamed — so there was one hole and this task closed it. The census is pinned as a list, so a seventh route added without its trigger fails on the number as well as on the walk.

## §4 📖 REPORT ONLY — the secret in the committed triggers
All six `.ps1` files carry `x-internal-secret = "sid-server-task-schedule"` **in plain text in the repo**, and the new one does too because 🚫 the task says do not invent a second way to supply it and I did not. What it means, plainly: anyone with repository access has the token that can run the day-end cut, the revenue post and the digests on the server — and rotating it means editing six files and re-copying them all.
**The alternative and its cost, for the owner and @Otto:** each trigger reads `$env:INTERNAL_JOB_SECRET` instead of a literal (one changed line per file — the API process already reads its own secrets that way, so nothing new is invented). The cost is not the code, it is the **operations**: the variable must exist **as a MACHINE-level variable** (a Task Scheduler task running "whether user logged on or not" does not see a user-level one — this is the step that silently produces six jobs that all 401 at 03:30), and it must be set again on any new box. 📌 And the honest cost of NOT switching: today the secret is in git history for ever, so a rotation is a rotation plus an accepted exposure. 🚫 I changed nothing — it is the owner's convention and his call with Otto.

## Break-and-watch — `mut461.mjs`, 5 mutations, **5 bite** (`finally`-restored, md5 of all six triggers verified afterwards, `BASELINE=19`)
A 🔴 the defect restored — the extender ships with no trigger · B the trigger posts to a job that does not exist · C the trigger is named for one job and posts to another · D the trigger drifts from its siblings (a different port) · E **a NEW internal job route appears with no trigger** — the rule has to catch the next one, not just this one.
📌 Mutation A moves the FILE rather than editing it (the defect is an absence, so the mutation has to be one too); the runner restores it in a `finally` and the report confirms all six triggers are byte-identical afterwards.

## 📦 For the owner
Copy `sm-jobs/group-series-extender.ps1` beside the others and register it **daily at 03:30** (after the day-end cut, before the 08:00/08:15 messages; the job is idempotent by state, so a missed night costs nothing). 🚫 Nothing to deploy in the API for this task — no migration, no schema change, no route change.
⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-24)
Re-run by me: **2926 pass / 0 fail** · tsc 0 · 56 = 56 · `sm-jobs/group-series-extender.ps1` present and **byte-identical in shape to its sibling** (same length, same CRLF, same absence of a trailing newline — I checked at the byte level, not by eye).
Three calls of his I am keeping:
1. **He copied the sibling's bytes and swapped the name rather than retyping it** — "a hand-typed sibling is how the one that is subtly different gets copied to the box". That is exactly the failure mode for a file whose only job is to be copied.
2. 🔑 **The rest of the file is compared TO A SIBLING, not to a literal in the test.** So the day the owner changes the port or the header across all of them, the test follows him instead of fighting him — a pin that has to be edited every time the owner does something reasonable is a pin that will be deleted.
3. **Mutation A moves the FILE rather than editing it** — the defect is an absence, so the mutation has to be one too; the runner restores it in a `finally` and confirms all six triggers are byte-identical afterwards. And mutation E pins that the rule catches **the NEXT** job, not only this one.
**The census is clean:** six routes, six triggers, none dangling — so there was one hole and it is closed.
**§4 goes to the owner as written.** His operational point is the one I would have missed: the environment variable must be **machine-level**, because a Task Scheduler task running "whether user logged on or not" cannot see a user-level one — which would produce six jobs that all fail at 03:30 with nothing to show for it. And the honest cost of not switching: the secret is in git history for ever, so a rotation is a rotation *plus* an accepted exposure.
