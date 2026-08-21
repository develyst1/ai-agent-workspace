# TASK-014: BE — one real backend job: prove the PostgreSQL path and record the AI tier
- Source: SPEC-001
- Status: **REWORK (Phase A) — 2026-08-21, reviewed by Sober.** The runbook is
  substantively right and every quoted fact re-verified against the code at
  `4101551`, but **two lines make it unfollowable on his machine** — see
  `## Review`. Both are one-line fixes and nothing else in the sheet is to be
  touched. All four questions are ANSWERED below (Q-BE-13/14/15/16); none of the
  answers changes the sheet. Phase B remains not startable — `../project-docs/`
  still has no evidence file.
  Previously: REVIEW (Phase A) — 2026-08-21, Jason.
  Previously: TODO — **Phase A only.** Q-SA-16 is ANSWERED ("ค"), so the block is gone
  and the TASK is re-scoped (Sober, 2026-08-21): **Jason never connects to
  anything.** Phase A (author the runbook) is startable now; Phase B (review the
  evidence) starts the day the stakeholder's output lands in `../project-docs/`.
- Assignee: Jason (BE)
- Depends on: TASK-005 (DONE). **Does NOT depend on TASK-008/010–013** — no screen
  is involved, so the frontend rework cannot invalidate this evidence.

## Why this exists (split out of TASK-009 by Sober, 2026-08-21)

TASK-009 is a **joint** BE+FE acceptance run and is PAUSED until TASK-013 is
`DONE`, because its runs 1–11 exercise the three screens being rebuilt under
SPEC-002. Two of its thirteen runs — **12 (which model answered)** and
**13 (`createDbJobRepository`'s five SQL statements actually executed)** —
touch **no screen at all**. Pausing them buys nothing and delays the two pieces
of evidence that close DoD lines TASK-004 and TASK-005 could not close for real.

They are therefore **moved here, verbatim in intent**, and removed from
TASK-009. TASK-009 keeps runs 1–11 and stays paused.

**What changed in the move, and it is the only change:** both runs were written
as "from **run 1**'s logs / from **run 1**" — run 1 is a *UI* run. Here they are
driven from **one job you submit through the API yourself** (`POST /api/reports`
with a valid session cookie, no browser). Same job lifecycle, same worker, same
logs, same `report_jobs` row; only the thing that presses the button changes.

## Re-scoped 2026-08-21 by Sober — read this first

Q-SA-16 is **ANSWERED: "ค เดี๋ยวรันเอง"** (verbatim + full consequences in
`## Questions` below). The two runs still happen exactly as designed, but **the
person at the keyboard is the stakeholder, not you.** Nothing about the evidence
changes; what changes is who produces it.

So this TASK is now **two phases**, and only the first is yours today:

- **Phase A — author the runbook (yours now).** Produce the exact, copy-pasteable
  instruction sheet the stakeholder executes on his own machine, derived from the
  real code in `code-report-back`, and put it in `## Implementation Notes` under
  `### Phase A — runbook`. I relay it to @Porter, who relays it to him in Thai.
- **Phase B — review the evidence (not yet startable).** When his output lands in
  `../project-docs/`, read it against the DoD below and write what it proves and
  what it does not. Porter will point Q-SA-16 at the file when it arrives.

**Standing constraints, unchanged and not negotiable in either phase:** you do
**not** start a server, do **not** set `DATABASE_URL` to anything, do **not** run
SQL, and do **not** log in — so the `admin` password is moot and **must not be
asked for again** (Q-SA-16 closed it). Real AI calls are authorised (Q-SA-6:
`AI_API_CENTER_URL=https://ai.develyst.online`, tier per step per Q-SA-7/8) — but
*he* makes them, not you.

## What to do — Phase A: the runbook

Write, in this file, the sheet a non-teammate can follow without asking a
follow-up question. **Form: shell commands + `curl`, pasteable into a terminal**
— see Q-SA-18, which is open with him and non-blocking; write the `curl` version
now. It must cover, for **his** machine:

1. **How to start the backend** — the exact command and the exact env vars it
   needs, with `DATABASE_URL` left as *his* existing `code_report` (the one from
   `../project-docs/db-migrate-seed-run-2026-08-20.md`). Read the real config
   loader and name every variable the process actually requires; a runbook that
   dies on a missing env var costs him a round trip through two roles.
2. **How to get an authenticated session** — he has the `admin` password, we do
   not. Name the login call and how the `cr_session` cookie is carried into the
   next two calls.
3. **Run A — success path**, unchanged: `POST /api/reports` for the public sample
   repo `https://github.com/develyst1/smart-scheduler-front.git`, no PAT, a date
   range that has commits, `language: "th"`; then poll
   `GET /api/reports/:jobId` until it finishes. Give the request body verbatim.
4. **Run B — failure path**, unchanged: a second job that fails so the error
   columns are exercised — cheapest failure that **reaches the worker** (e.g. a
   well-formed but non-existent public repo). It must not be a
   request-validation rejection: that never creates a row and proves nothing.
   **Corrected by Sober 2026-08-21 at the Phase A review (Q-BE-13):** this line
   originally read "→ `REPO_NOT_FOUND`" and that was my error, not Jason's — a
   404 maps to `REPO_AUTH_FAILED` by design. The expected code for this run is
   **`REPO_AUTH_FAILED`**.
5. **Exactly what to paste back**, file by file: the two `GET /api/reports/:jobId`
   bodies in full, and the log lines carrying `provider` + `model` for each of the
   three AI stages (say which log line to look for, verbatim from the code).
6. **The no-secrets rule, restated in the sheet itself:** no session cookie value,
   no DB password, no AI token in anything he pastes. Tell him what to replace
   them with.

**Bound the sheet to what the code really does.** Every command, path, env var,
body shape and log-line pattern must be quoted from the repo, not remembered — if
something cannot be determined without running it, say so in `## Questions`
instead of guessing. **Nothing else about the runbook is negotiable scope:** do
not propose a new script, endpoint, flag or seed step to make it easier. If you
believe the run genuinely cannot be driven from what exists today, that is a
finding for `## Questions`, not a change.

## What to do — Phase B: review the evidence (blocked until the file lands)

Read his pasted output against the DoD. Two things to state plainly rather than
smooth over: which DoD lines the evidence actually closes, and which it cannot
(the same way Porter recorded that `seed:users` printed `updated`, not `created`,
and no exit code). Do **not** re-derive a missing field by reasoning — a field
that is not in the paste is not evidence.

### Run 13 — the five SQL statements (the reason this TASK exists)

TASK-005's job layer is tested entirely against the **in-memory**
`JobRepository`. `createDbJobRepository`'s five parameterised statements have
**never been executed by any test**; a wrong column name or a missing
`finished_at` passes every test and fails on the first real job.

From Run A, evidence read back **through `GET /api/reports/:jobId`**:
`QUEUED → RUNNING → DONE`, with `report_md` present, `commitCount` set, `stage`
cleared and `finished_at` set. From Run B: `error_code` and `error_message`
persisted and returned.

**Nobody on this team runs SQL to check this** — the `GET` body is the proof, by
design. If a field cannot be seen through the API, say so; do not reach for
`psql`.

### Run 12 — which model actually answered (a decision, not a proof)

We send no `model` and no `provider`, so AI API CENTER's own fallback chain
picks. Every call already logs `provider` and `model`.

From Run A's logs: **record the provider and model that answered each of the
three AI stages**, and say plainly whether that is an acceptable tier under
Q-SA-7's rule (mid-tier where a step reads code and builds understanding; cheap
for simple procedural steps). Two lines of output.

This is the only run here whose purpose is a **decision**: if the tier is wrong,
I write the model-mapping TASK line against this evidence rather than against a
guess. **Do not add a `model` or `provider` key to fix it yourself** — that is
scope I have not given you.

## Definition of Done

**Phase A (yours now) — the TASK goes to `REVIEW` on these five alone:**
- [ ] The runbook exists in `## Implementation Notes`, covers all six points
      above, and is copy-pasteable — no placeholder a reader must guess at.
- [ ] Every command, env var, request body, path and log-line pattern in it is
      **quoted from the real `code-report-back` code**, with the file it came
      from named next to it. Not from memory.
- [ ] It nowhere asks the stakeholder for a secret, and it tells him what not to
      paste back.
- [ ] `git status --porcelain` empty and **no production-code change** — Phase A
      writes into this TASK file only. If you believe code must change for the
      run to be possible, stop and write it in `## Questions`.
- [ ] You started no server, set no `DATABASE_URL`, ran no SQL, logged in
      nowhere. State this explicitly.

**Phase B (after his output lands in `../project-docs/`) — these are the original
evidence lines, unchanged; they are ticked by *reading his paste*, never by a run
of yours:**
- [ ] Run A's status transitions and persisted fields, read back through
      `GET /api/reports/:jobId` — **the line TASK-005 could not close for real**
      (Q-BE-9's condition). **Amended by Sober 2026-08-21 (Q-BE-14):** the
      readable half is `status`, `stage: null`, `commitCount`, `report.markdown`.
      **`finished_at` is not on the wire and is ticked INDIRECTLY** — see the
      Q-BE-14 answer for exactly what that does and does not prove. No `psql`.
- [ ] Run B's `error_code` / `error_message` persisted and returned. Expected
      code: **`REPO_AUTH_FAILED`** (Q-BE-13), not `REPO_NOT_FOUND`.
- [ ] The provider + model **for every AI call**, grouped by stage — **not three
      log lines**: the pipeline makes `batchCount + 2` calls and each retry logs
      its own line (Q-BE-15). Quoted from the real log lines, with a one-line
      verdict against Q-SA-7's tier rule **plus a note on whether the tier is
      stable across the `AI_COMMITS` batches**.
- [ ] An explicit statement of what the evidence does **not** close, if anything.

## Implementation Notes

### Phase A — runbook (Jason, 2026-08-21)

Everything below is quoted from `C:\Users\Admin\develyst\code-report\code-report-back`
at commit `4101551` (`git log --oneline -1`), and the file each fact comes from is
named next to it. Nothing here was executed: see "What I did not do" at the end.

**Three things this runbook does NOT match the TASK text on — read them before
relaying, they are written up in `## Questions` as Q-BE-13/14/15 and one of them
changes what evidence Phase B can tick:**

1. Run B will store **`REPO_AUTH_FAILED`**, not `REPO_NOT_FOUND` (Q-BE-13).
2. **`finished_at` is not readable through `GET /api/reports/:jobId`** (Q-BE-14).
3. The AI log lines are **1 + N + 1**, not always three (Q-BE-15).

---

#### Runbook for the stakeholder — copy from here to the end of the section

> Shell assumed: **Git Bash (MINGW64)** on Windows — the same shell used for
> `bun run seed:users` in `../project-docs/seed-users-run-2026-08-21.md`.
> `curl` ships with Git Bash. Form per Q-SA-18 (`curl`; a Bruno version would be
> the same six steps re-typed).

##### Step 1 — start the backend

```bash
cd /c/Users/Admin/develyst/code-report/code-report-back
AI_API_CENTER_URL=https://ai.develyst.online bun run start
```

Leave this window open — the log lines you will paste back come out here.

- `start` = `bun src/index.ts` — `package.json` → `"scripts"`.
- `AI_API_CENTER_URL` is set on the command line because the built-in default is
  `http://localhost:3009` (`src/config.ts`, `optionalWithDefault`), and Q-SA-6
  authorises the production service. If your `.env` already has
  `AI_API_CENTER_URL=https://ai.develyst.online`, the prefix is harmless.
- **Exactly two variables are mandatory** — `src/config.ts` `loadConfig()` calls
  `required()` on these and only these; a missing one prints
  `[config] Missing required environment variable X. See .env.example.` and
  exits 1 (`loadConfigOrExit`):

  | Variable | Required? | Built-in default (`src/config.ts`) |
  |---|---|---|
  | `DATABASE_URL` | **yes** | — |
  | `SESSION_SECRET` | **yes** | — |
  | `PORT` | no | `8080` |
  | `REPORT_TIMEZONE` | no | `Asia/Bangkok` |
  | `AI_API_CENTER_URL` | no | `http://localhost:3009` |
  | `AI_API_CENTER_TOKEN` | no | unset (no `Authorization` header sent) |
  | `ALLOW_PRIVATE_GIT_HOSTS` | no | `false` |
  | `MAX_CONCURRENT_JOBS` | no | `2` |
  | `SEED_USERS_FILE` | no | unset (only `seed:users` reads it) |

- **Do not set `DATABASE_URL` to anything new.** Keep the existing
  `code_report` database you migrated and seeded — your 2026-08-21 `seed:users`
  run succeeded with no inline `DATABASE_URL=` prefix, and that script calls the
  same `loadConfigOrExit()` (`src/scripts/seed-users.ts`), so your `.env` in this
  folder already supplies both required variables. If `bun run start` prints the
  `[config] Missing required environment variable …` line anyway, prefix the
  command the way you did on 2026-08-20:
  `DATABASE_URL=… SESSION_SECRET=… AI_API_CENTER_URL=https://ai.develyst.online bun run start`.

**You should see two startup lines** (`src/index.ts`), and they are safe to
paste — `describeConfig()` prints the DB **host/name only, never the password**,
and secrets appear as `true`/`false` flags:

```
{"level":"info","msg":"starting","database":"127.0.0.1:5432/code_report","port":8080,"reportTimezone":"Asia/Bangkok","aiApiCenterUrl":"https://ai.develyst.online","aiApiCenterTokenSet":false,"sessionSecretSet":true,"allowPrivateGitHosts":false,"maxConcurrentJobs":2,"seedUsersFileSet":false}
{"level":"info","msg":"temp-sweep","removed":0}
```

Sanity check from a **second** Git Bash window (this route needs no session —
`src/index.ts` mounts it before the session gate):

```bash
curl -s http://localhost:8080/api/health
```
Expected: `{"status":"ok"}`

Everything from here runs in that **second** window.

##### Step 2 — get an authenticated session

`POST /api/auth/login` with `{ "username", "password" }` → `200 { user }` plus a
`Set-Cookie: cr_session=…` (`src/auth/routes.ts`; cookie name `cr_session` from
`src/auth/session.ts` `SESSION_COOKIE`, HttpOnly, 12-hour expiry). `curl` stores
it in a cookie jar and replays it on the next two calls:

```bash
cd /c/Users/Admin/develyst/code-report/code-report-back
curl -s -c cr-cookies.txt \
  -H 'content-type: application/json' \
  -d '{"username":"admin","password":"PUT-YOUR-ADMIN-PASSWORD-HERE"}' \
  http://localhost:8080/api/auth/login
```

- `admin` is the account name your `seed:users` run reported
  (`../project-docs/seed-users-run-2026-08-21.md`: `[seed:users] updated admin`).
  The password is **yours — nobody on the team has it or wants it.**
- Expected: `{"user":{...}}`. A wrong password answers
  `401` with `{"error":{"code":"INVALID_CREDENTIALS",...}}` and writes no cookie.
- `cr-cookies.txt` now holds a **live session token**. Do not paste it back, and
  delete it after Step 5.

Confirm the session works:

```bash
curl -s -b cr-cookies.txt http://localhost:8080/api/auth/me
```
Expected: `{"user":{...}}`. If you get
`{"error":{"code":"AUTH_REQUIRED",...}}`, the login did not take.

##### Step 3 — Run A (success path)

```bash
curl -s -b cr-cookies.txt \
  -H 'content-type: application/json' \
  -d '{"repoUrl":"https://github.com/develyst1/smart-scheduler-front.git","dateFrom":"2025-08-21","dateTo":"2026-08-21","language":"th"}' \
  http://localhost:8080/api/reports
```

Expected: `202` with `{"jobId":"<uuid>"}` (`src/reports/routes.ts`).

Body fields and their rules come from `src/reports/validate.ts`:
`repoUrl`, `dateFrom`, `dateTo`, `language` are required; `pat`, `branch`,
`author`, `extraContext` are optional and are **omitted above on purpose** — no
PAT (the repo is expected to be public), no branch (the clone uses the remote's
default), no author filter. Dates are `YYYY-MM-DD`; the span is the exclusive
difference and must be **≤ 366 days** — `2025-08-21 → 2026-08-21` is 365. The
range is counted in `REPORT_TIMEZONE` (`Asia/Bangkok`).

Now poll until it stops moving. Put the id in a variable and re-run this line
every ~15 seconds; the run takes minutes:

```bash
JOB=<paste the jobId here>
curl -s -b cr-cookies.txt http://localhost:8080/api/reports/$JOB | tee run-a.json; echo
```

`status` walks `QUEUED → RUNNING → DONE` (`src/reports/jobs.ts`, `JOB_STATUSES`).
**Stop when `status` is `DONE`** and keep that last `run-a.json` — that body is
the evidence.

Two outcomes that are not `DONE` and what they mean:

- **`"status":"NO_COMMITS"`** — the range genuinely has no commits, so the
  backend deliberately makes **no AI call at all** (`src/reports/worker.ts`).
  That still exercises the database path, but it produces **no provider/model
  evidence**. If you get it, find a live range and re-run Step 3 with it:
  ```bash
  git ls-remote https://github.com/develyst1/smart-scheduler-front.git HEAD   # repo is reachable?
  git clone --filter=blob:none --no-checkout https://github.com/develyst1/smart-scheduler-front.git /tmp/ssf-dates \
    && git -C /tmp/ssf-dates log -5 --date=short --format='%cd %s' \
    && rm -rf /tmp/ssf-dates
  ```
  Pick a `dateFrom`/`dateTo` around those dates and repeat Step 3.
- **`"status":"FAILED"` with `"code":"REPO_AUTH_FAILED"`** — the sample repo is
  **not public** after all (REQ-001 Q8 records that this was never confirmed).
  In that case add `"pat":"<your GitHub read token>"` to the Step 3 body and
  re-run. **Do not paste the PAT back to us** — say only that you used one.

##### Step 4 — Run B (failure path)

A second job that fails **inside the worker**, so a row is created and the error
columns are written. A repository address that is well-formed but does not exist:

```bash
curl -s -b cr-cookies.txt \
  -H 'content-type: application/json' \
  -d '{"repoUrl":"https://github.com/develyst1/this-repo-does-not-exist-code-report.git","dateFrom":"2025-08-21","dateTo":"2026-08-21","language":"th"}' \
  http://localhost:8080/api/reports
```

Expected: `202` with a second `{"jobId":…}`. Then poll once (this one fails in
seconds, at the clone):

```bash
JOBB=<paste the second jobId here>
curl -s -b cr-cookies.txt http://localhost:8080/api/reports/$JOBB | tee run-b.json; echo
```

Expected: `"status":"FAILED"` and a non-null `"error"` object. **The code will be
`REPO_AUTH_FAILED`, not `REPO_NOT_FOUND`** — GitHub answers 404 for both "wrong
address" and "private repo", and `classifyCloneFailure` in `src/git/clone.ts`
maps a 404 to `REPO_AUTH_FAILED` on purpose (SPEC-001 Q-BE-5), because only that
message names both causes. That is the expected result, not a bug. See Q-BE-13.

If the reply is `400` with `"code":"VALIDATION_ERROR"`, the address was rejected
before any row existed and the run proves nothing — re-check the URL and retry.

##### Step 5 — what to paste back

Create **one** file, `../project-docs/task-014-run-evidence-<date>.md`, with four
sections:

1. **Run A body** — the full contents of `run-a.json`, verbatim, nothing trimmed.
   It is long (`report.markdown` is the whole report) — paste all of it.
2. **Run B body** — the full contents of `run-b.json`, verbatim.
3. **The AI log lines.** In the server window, every AI call prints one line
   starting `{"component":"ai"` (`src/ai/log.ts`, `logAiCall`). Paste **all** of
   them for Run A's `jobId`. Filter them out of a saved log with:
   ```bash
   grep '"component":"ai"' server-output.txt
   ```
   (or scroll the window and copy the lines by eye). Shape, from
   `src/ai/client.ts`:
   ```
   {"component":"ai","jobId":"…","userId":"…","stage":"AI_PROJECT","attempt":1,"outcome":"ok","provider":"…","model":"…","promptTokens":…,"completionTokens":…,"totalTokens":…,"latencyMs":…}
   ```
   **Expect more than three lines.** `stage` is one of `AI_PROJECT`,
   `AI_COMMITS`, `AI_WRITING` (`src/ai/stages.ts`), and `AI_COMMITS` prints **one
   line per commit batch** (`src/ai/pipeline.ts` loops over `batchCommits`), so a
   busy range prints many. Paste them all; do not pick three.
4. **The two worker lines** for each job (`src/reports/worker.ts`):
   ```
   {"component":"worker","jobId":"…","userId":"…","msg":"started","stage":"CLONING"}
   {"component":"worker","jobId":"…","userId":"…","msg":"finished","status":"DONE","commitCount":…,"aiCalls":…,"durationMs":…}
   ```
   and for Run B the failure form:
   ```
   {"component":"worker","jobId":"…","userId":"…","msg":"finished","status":"FAILED","errorCode":"…"}
   ```
   ```bash
   grep '"component":"worker"' server-output.txt
   ```

Then stop the server (`Ctrl-C`) and delete the cookie jar:

```bash
rm -f cr-cookies.txt run-a.json run-b.json
```

##### Step 6 — the no-secrets rule (please read before you paste)

Nothing you send back should contain a secret. Specifically:

| Never paste | Replace it with |
|---|---|
| The `cr_session` cookie value / anything from `cr-cookies.txt` | `<session cookie removed>` |
| Your `admin` password | `<password removed>` — we never need it |
| The database password (anything inside a `DATABASE_URL=postgresql://…`) | `<db url removed>` |
| `SESSION_SECRET` | `<session secret removed>` |
| A GitHub PAT, if Step 3 needed one | `<pat removed>` — just say "a PAT was used" |
| An `AI_API_CENTER_TOKEN`, if you ever set one | `<ai token removed>` |

The four things you *are* asked for carry none of these by construction: the
`GET` bodies have no `pat` field and never will (`src/reports/jobs.ts` —
`jobResponse` builds `params` field by field, six keys, `pat` not among them);
the AI and worker log lines carry only ids, names and numbers, and are run
through the PAT redactor before printing (`src/ai/log.ts`, `src/reports/worker.ts`);
and the `starting` line prints the DB host/name without the password
(`describeConfig` in `src/config.ts`).

`jobId` and `userId` are UUIDs, not secrets — leave them in, Phase B needs them
to tie the log lines to the two jobs.

#### End of runbook

---

#### What I did not do (DoD line 5)

I started **no server**, set **no `DATABASE_URL`**, ran **no SQL**, connected to
**no database**, called **no AI service**, cloned **no repository**, and logged in
**nowhere**. The `admin` password was not asked for and is not needed by me. The
only commands I ran were read-only inspections of the repo:
`git status --porcelain` (empty), `git log --oneline -3`, `git ls-files`. No
production code changed — Phase A wrote into this TASK file only.

```
$ cd C:/Users/Admin/develyst/code-report/code-report-back && git status --porcelain
(no output)
$ git log --oneline -1
4101551 TASK-005 rework: reject a repo URL carrying userinfo before a job row exists
```

## Questions

- **Q-SA-16 (BLOCKS THIS TASK — raised by Sober 2026-08-21, with @Porter):**
  run 13 is by definition a real-database run, and the only `code_report`
  database on record is the stakeholder's own, which he ran `migrate` and
  `seed:users` against himself because PROTOCOL keeps the team off it. Which of
  these does he want?
  **(ก)** the team points `DATABASE_URL` at his local `code_report` and lets the
  **application** write the two job rows — no hand-written SQL, no schema change,
  two rows added to `report_jobs`; or
  **(ข)** he creates/authorises a **separate throwaway** database for the team
  (name + connection string into `../project-docs/`); or
  **(ค)** he runs the two jobs himself, as he did with `migrate`/`seed:users`,
  and pastes the two `GET /api/reports/:jobId` bodies and the AI log lines into
  `../project-docs/` — the team never connects at all.
  Also needed either way: the `admin` password, if (ก) or (ข).

  > **answer (2026-08-21, human via @Porter, verbatim): "Q-SA-16=ค เดี๋ยวรันเอง"**
  >
  > Transcribed here by Sober 2026-08-21 from REQ-001 `## Questions` (Porter may
  > not write in `tasks/`), same precedent as Q-SA-6.
  >
  > - **Option (ค).** The stakeholder runs the two jobs himself and pastes the
  >   evidence into `../project-docs/`. **The team never connects to a database
  >   at all** — the same arrangement he already used for `migrate` /
  >   `seed:users`, and the reading that keeps PROTOCOL's no-real-environment
  >   rule intact instead of relaxing it.
  > - **(ก) and (ข) are CLOSED.** No `DATABASE_URL` is pointed anywhere by the
  >   team, and no throwaway database will be created.
  > - **The trailing half of the question is moot: the `admin` password is not
  >   needed and must not be asked for again** — nobody on the team logs in.
  > - **Sober's decision on what this TASK becomes** (Porter explicitly left it
  >   to me): the TASK is split into **Phase A** — Jason authors the runbook the
  >   stakeholder executes — and **Phase B** — Jason reviews the pasted evidence.
  >   See the re-scope section and the two-part DoD above. **Status moved
  >   `BLOCKED` → `TODO` (Phase A) by Sober, 2026-08-21.**
  > - **Why a runbook and not "wait for the paste":** Porter's ask has already
  >   gone to him naming *what* to paste, but nothing on file tells him *how* to
  >   produce it — which command, which env vars, which two calls. Waiting would
  >   most likely buy a paste that misses a field and a second round trip through
  >   two roles. Writing the sheet is the only part of this TASK that can be done
  >   without an environment, and it is real BE work: it comes out of the config
  >   loader, the routes and the log lines.

- **Q-SA-18 (NON-BLOCKING — raised by Sober 2026-08-21, with @Porter):** in what
  form does he want the runbook? Under (ค) Runs A and B are **API** calls with no
  browser, so the default sheet is **`curl` commands he pastes into a terminal**
  — and that is what Phase A should write unless he says otherwise. The reason it
  is asked rather than assumed: `../project-docs/ai-api-center-bruno/` shows he
  works with **Bruno**, so a Bruno collection may suit him better, and Q-SA-17
  ("ก") only tells us he is willing to *start* the backend, not that he wants to
  hand-run HTTP calls. **Nothing waits on this** — Jason writes the `curl`
  version now; a "Bruno please" answer later is a re-format of the same six
  points, not new work, and it changes no evidence.

- **Q-BE-13 (NON-BLOCKING — Jason, 2026-08-21): Run B cannot produce
  `REPO_NOT_FOUND` the way the TASK's example describes it.** The TASK §4 example
  is "a well-formed but non-existent public repo → `REPO_NOT_FOUND`". The code
  disagrees: `classifyCloneFailure` (`src/git/clone.ts`) matches GitHub's 404
  text against `NOT_FOUND` and returns **`REPO_AUTH_FAILED`**, deliberately and
  with the reason in the comment — SPEC-001 was amended for exactly this at
  Q-BE-5, because a 404 means "wrong address **or** private repo" and only
  `REPO_AUTH_FAILED`'s message names both. `REPO_NOT_FOUND` is left for the
  unambiguous `does not appear to be a git repository` case.
  I have **not** changed the runbook's repo choice — Run B still uses a
  non-existent public repo, and it still ticks the DoD line it exists for
  (`error_code` / `error_message` persisted and returned through the API). Only
  the expected value differs, and I have written that expectation into the sheet.
  **If you want the literal string `REPO_NOT_FOUND` on that row**, there is one
  path that produces it without inventing anything: a URL whose **host does not
  resolve** throws `RepoUrlError("UNRESOLVABLE")` from `assertSafeRepoUrl`
  (`src/git/urlSafety.ts`), and `classifyRunFailure` (`src/reports/worker.ts`)
  maps *any* `RepoUrlError` to `REPO_NOT_FOUND`. It reaches the worker after the
  row is created, so it is a valid Run B too. **Which of the two you want is your
  call, not mine** — say the word and it is a two-line edit to the sheet.

- **Q-BE-14 (Jason, 2026-08-21 — this one changes what Phase B can tick):
  `finished_at` is NOT readable through `GET /api/reports/:jobId`.** The Phase B
  DoD asks for "`stage` cleared and **`finished_at` set**" read back through the
  API. The column exists and is written (`finishDone` / `finishNoCommits` /
  `finishFailed` all `SET … finished_at = now()`, `src/reports/jobs.ts`), but it
  is **not in `SELECT_COLUMNS`**, not on the `JobRow` type, not on `ReportJob`,
  and not on `JobResponse` — so no `GET` body can ever show it. The TASK's own
  rule applies ("If a field cannot be seen through the API, say so; do not reach
  for `psql`"), so I am saying so **now**, before he runs anything, rather than
  after: **that half-line is unclosable by this evidence.** Everything else on it
  is closable — `status`, `stage: null`, `commitCount`, `report.markdown`,
  `error.code`, `error.message` are all on `JobResponse`.
  Three ways out, none of them mine to pick: (a) accept the line as partially
  closed and record `finished_at` as unproven; (b) accept the four `finished_at`
  writes as proven *indirectly* — they are in the same `UPDATE` statements whose
  other columns do come back, so a wrong column name there would fail the whole
  statement and `status` would never reach `DONE`; (c) a SPEC/TASK line adding
  `finished_at` to the wire, which is new scope I have not written.
  My reading is that **(b) is what the evidence actually supports** and it is
  worth stating explicitly rather than ticking silently — but the verdict is
  yours at review.

- **Q-BE-15 (NON-BLOCKING — Jason, 2026-08-21): "the three AI stages" is three
  *stages*, not three *log lines*.** The Phase B DoD says "the provider + model
  for each of the three AI stages". `runPipeline` (`src/ai/pipeline.ts`) makes
  **`batchCount + 2`** calls — one `AI_PROJECT`, **one `AI_COMMITS` per commit
  batch**, one `AI_WRITING` — and `createHttpAiClient` logs one line per call
  *and per retry attempt* (`src/ai/client.ts`). A range with several batches will
  print five, eight, more. The runbook therefore asks him for **every**
  `"component":"ai"` line rather than three, so Phase B can see whether the tier
  is stable across batches instead of reading one sample. Flagging it because it
  changes what "complete evidence" looks like at review, not because anything is
  blocked.

- **Q-BE-16 (FYI, no answer needed — Jason, 2026-08-21):** the sample repo's
  public/private status is still unconfirmed (REQ-001 Q8, restated in
  `../project-docs/AI-API-CENTER.md`). If it turns out private, Run A fails
  `REPO_AUTH_FAILED` at the clone and he needs a PAT. Rather than let that cost a
  round trip through two roles, the runbook tells him what that outcome means and
  to add `"pat":"…"` himself — **and to tell us only that he used one, never the
  token**. No new scope: `pat` is already an optional field of the documented
  request body (`src/reports/validate.ts`).

> **answer to Q-BE-13 (Sober, 2026-08-21): you are right, the TASK text was
> wrong, and the sheet stays as you wrote it — keep `REPO_AUTH_FAILED`.**
> Re-verified in `src/git/clone.ts` at `4101551`: `NOT_FOUND` = `/\b404\b/`,
> `/repository .* not found/i`, `/\bnot found\b/i` → `REPO_AUTH_FAILED`, with
> `NOT_A_REPOSITORY` tested *before* it and left on `REPO_NOT_FOUND`. That is
> Q-BE-5's amendment working exactly as designed.
> - **I have corrected §4 of this TASK** rather than the runbook: the "→
>   `REPO_NOT_FOUND`" example was mine.
> - **I am NOT taking your alternative** (an unresolvable host → `RepoUrlError`
>   → `REPO_NOT_FOUND` via `classifyRunFailure`). It is real — I read
>   `urlSafety.ts` and `worker.ts` and it would reach the worker after the row
>   exists — but it exercises a *different* failure path from the one a user
>   actually hits, and this TASK's purpose is the **database** path, which either
>   code closes. Chasing a literal string would trade real coverage for cosmetics.
> - Nothing to change in the sheet for this one.

> **answer to Q-BE-14 (Sober, 2026-08-21): ruling is (b) — indirect proof —
> and it is bounded, so read the bound.** Verified independently: `finished_at`
> is `timestamptz` in `src/db/migrations/001_init.sql` (nullable, no default, so
> only these statements can ever set it) and is absent from `SELECT_COLUMNS`,
> `JobRow`, `ReportJob` and `JobResponse`. You are right that no `GET` body can
> show it, and you were right to say so before he runs rather than after.
> - **Why (b) holds:** PostgreSQL rejects an `UPDATE` naming an unknown column
>   *as a whole statement*. If `finished_at` were misspelled in `finishDone`, the
>   statement would throw, `execute` would unwind into `enqueue`'s catch, and the
>   job would end `FAILED` — so `status: "DONE"` coming back through the API is
>   only possible if that entire statement ran, `finished_at = now()` included.
> - **The bound, and state it in Phase B rather than tick past it:** this proves
>   **`finishDone`** (from Run A) and **`finishFailed`** (from Run B). It proves
>   **nothing about `finishNoCommits`**, whose `finished_at` write is on a third
>   statement neither run reaches — unless Run A comes back `NO_COMMITS`, in
>   which case the proof swaps rather than adds. Write that sentence into the
>   Phase B notes.
> - **(c) is refused: no field goes on the wire for this.** Nothing in REQ-001 or
>   SPEC-001 asks a reader to see a finish time, so adding one to `JobResponse`
>   would be scope invented to make an evidence line tidier. I have parked
>   "should `finished_at` be readable at all?" on my queue as a candidate; it is
>   not work today and it does not belong to you.
> - **The DoD line is amended above** so Phase B is not ticked against a field
>   that cannot appear. Nothing changes in the sheet.

> **answer to Q-BE-15 (Sober, 2026-08-21): accepted, and the DoD line was mine
> to fix — done.** Confirmed in `src/ai/pipeline.ts` (`calls: batchCount + 2`,
> one `AI_COMMITS` per `batchCommits` entry) and `src/ai/client.ts` (one
> `logAiCall` per attempt, and a failed attempt logs `outcome` with **no**
> `provider`/`model`). "Three stages" was never "three lines" and the DoD now
> says so. Your instruction to paste **all** `"component":"ai"` lines is the
> right one and stays. One thing I am adding to Phase B because your point
> earns it: tier stability *across* `AI_COMMITS` batches is now part of the
> verdict, not a footnote — a fallback chain that switches model mid-run is
> exactly what one sampled line would hide.

> **answer to Q-BE-16 (Sober, 2026-08-21): noted, no answer owed, and you were
> right to pre-empt it.** `pat` is already an optional field of the documented
> body (`src/reports/validate.ts`), so telling him what a `REPO_AUTH_FAILED` on
> Run A means and that he may add his own token is not new scope — it is the
> round trip through two roles that Phase A exists to prevent. **The "tell us
> only that you used one, never the token" line is the part that matters and it
> stays.** If Run A does need a PAT, Phase B must record that fact, because it
> settles REQ-001 Q8 (the sample repo's public/private status) as a side effect.

(Jason asks; Sober answers as `> answer: ...`)

## Review

**Sober, 2026-08-21 — Phase A: `REWORK`, narrowly. Two lines, nothing else.**

I re-derived every factual claim in the sheet from `code-report-back` at
`4101551` myself rather than trusting the citations, because a runbook nobody on
the team can execute is only as good as its sources. **Everything I checked was
right** — see the verification list below. The rework is not about the content;
it is about two lines that make the sheet **unfollowable on his machine**, which
is the one thing Phase A exists to prevent.

### The two defects (both one-line fixes; change nothing else)

**D1 — `../project-docs/` is OUR path, not his. Step 5 sends the evidence to a
folder that does not exist.** The sheet puts him in
`/c/Users/Admin/develyst/code-report/code-report-back` (Step 1) and then asks him
to create `../project-docs/task-014-run-evidence-<date>.md`. From that directory
that resolves to `C:\Users\Admin\develyst\code-report\project-docs` — **verified
absent**; that folder holds only `code-report-back`, `code-report-front` and
`seed-users.json`. The real destination, where `db-migrate-seed-run-2026-08-20.md`
and `seed-users-run-2026-08-21.md` already sit, is
`C:\Users\Admin\develyst\ai-agent-work\ai-agent-workspace\code-report\project-docs\`.
**Write the absolute path in the sheet.** `../project-docs/` is workspace
shorthand that is correct in every file we write to each other and wrong the
moment it is handed to someone standing in a different directory. This is the
highest-cost line in the document: he does the whole run, then the evidence lands
somewhere we do not look, or he stops and asks — the exact two-role round trip
this TASK was split to avoid.

**D2 — `server-output.txt` is never created, but Step 5 greps it twice.** Step 1
is `bun run start` with no redirection, so the two `grep '"component":"…"'
server-output.txt` commands run against a file that does not exist. The
by-eye fallback you offer is honest, but it is the fallback for the *primary*
instruction being broken — and by your own Q-BE-15 a busy range prints
`batchCount + 2` AI lines plus worker lines, which is precisely the volume where
copying by eye loses evidence. **The constraint the fix must satisfy** (and it is
yours to choose and quote, not mine to design): he must be able to *watch* the
server window — Step 3 tells him to wait on it — **and** end up with the lines in
a file. If the mechanism you pick can buffer output when it is not a terminal,
say so in the sheet rather than leave him with a file that fills up late.

Both defects fail DoD line 1 — "copy-pasteable — **no placeholder a reader must
guess at**". A wrong path is worse than a placeholder: a placeholder announces
itself, a wrong path fails silently.

### What I verified, and it all held

- **DoD line 2 (every fact quoted, not remembered) — passes, and this is the
  strongest part of the work.** `start` = `bun src/index.ts` (`package.json`);
  `required()` is called on **exactly** `DATABASE_URL` and `SESSION_SECRET` and
  the seven defaults in your table match `loadConfig` line for line, `PORT` 8080
  and `AI_API_CENTER_URL` `http://localhost:3009` included; the `[config]
  Missing required environment variable …` text and `exit 1` are `loadConfigOrExit`
  verbatim; `/api/health` really is mounted **before** `app.use("/api/reports*",
  requireSession)` in `index.ts`, so the sanity check needs no session as you say;
  `SESSION_COOKIE = "cr_session"`, HttpOnly, 12 h (`auth/session.ts`);
  `INVALID_CREDENTIALS`/401 and `AUTH_REQUIRED`/401 are `auth/routes.ts`; `202
  { jobId }` is `reports/routes.ts`; the required/optional split and the
  **exclusive ≤ 366** span are `validate.ts` — and `2025-08-21 → 2026-08-21` is
  365, so the body is accepted; `JOB_STATUSES` is `jobs.ts`; the two worker line
  shapes and the `ai` line's field order (`stage, attempt, outcome, provider,
  model, …`) match the object literals in `worker.ts` and `client.ts` **key for
  key**; `NO_COMMITS` really does make no AI call (`worker.ts`), which is why
  your "that outcome yields no provider/model evidence" warning is correct and
  worth its space.
- **DoD line 3 (no secret asked for, and he is told what not to paste) —
  passes.** The Step 6 table covers session cookie, `admin` password,
  `DATABASE_URL`, `SESSION_SECRET`, PAT and AI token with a replacement for each.
  Your three safety claims are true: `jobResponse` builds `params` field by field
  with six keys and no `pat`; both log paths go through the redactor
  (`redactAll` in `ai/log.ts`, `redact` in the worker's `emit`); and
  `describeConfig` emits `host + pathname` only, so the `starting` line you told
  him to paste really cannot carry the DB password.
- **DoD lines 4 and 5 — pass.** `git status --porcelain` empty at `4101551`,
  re-confirmed by me; no production file changed; and the explicit "no server, no
  `DATABASE_URL`, no SQL, no login, password not asked for" statement is where it
  should be.
- **DoD line 1 — fails on D1 and D2 only.** The six required points are all
  covered and the Step 3 `NO_COMMITS` / `REPO_AUTH_FAILED` branches are more than
  was asked for.

### Two judgement calls of yours I am explicitly upholding

1. **You did not invent a script, flag or seed step**, even though D2's problem
   would have been trivially solved by one. That was the instruction and you held
   it under pressure.
2. **You raised Q-BE-14 before he runs, not after.** That is the difference
   between a Phase B that reports a bounded result and one that reports a
   surprise. It is also the finding of this review that outlives the TASK: a
   column the application writes on every terminal transition is invisible to
   every consumer of the API.

### One correction to your own text (not rework — fix it while you are in there)

Q-BE-14 says "the **four** `finished_at` writes". There are **three**:
`finishDone`, `finishNoCommits`, `finishFailed`. The count matters because it is
what my (b) ruling is bounded against.

### What happens next

@Jason: make **D1 and D2** and return the TASK to `REVIEW`. Do not re-open
anything else in the sheet — the content is accepted and re-verified, and a
second pass over accepted text is how a good runbook acquires a new error. All
four of your questions are answered above; **none of the answers changes the
sheet**, which is why they were not worth waiting for.

The evidence hand-over stays gated on this: the sheet does not leave for @Porter
until it points at a folder that exists.
