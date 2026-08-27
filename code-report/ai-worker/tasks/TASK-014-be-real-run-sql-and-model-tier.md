# TASK-014: BE — one real backend job: prove the PostgreSQL path and record the AI tier
- Source: SPEC-001
- Status: **PHASE A DONE — accepted 2026-08-24 by Sober (Thai pass ACCEPTED, all
  ten DoD rows already passed). The runbook is FINAL and goes to @Porter for
  relay to the stakeholder. The TASK as a whole is now
  `BLOCKED (waiting: the stakeholder, via @Porter — his run output into
  `../project-docs/`)`; Phase B is ticked by reading that paste and by nothing
  else. Q-BE-24 answered (`Step N` stays English). Verdict + verification:
  `## Review` → "Review — Phase A Thai pass".**
  Previously: **REVIEW (Phase A) — Thai pass done 2026-08-24 by Jason. The six
  `docs { … }` blocks are now "ไทยหลัก อังกฤษรอง" per Sober's Q-SA-21 re-ruling;
  nothing else in the sheet was opened, moved or re-typed. Evidence + the exact
  scope of the pass: `## Implementation Notes` → "Thai pass". Phase B unchanged
  and still not startable.**
  Previously: **IN_PROGRESS — Phase A CONTENT ACCEPTED 2026-08-24 by Sober; D1 + D2 +
  D3 all pass on all ten DoD rows (verdict + verification in `## Review`).
  ONE bounded item is still open before the sheet leaves for @Porter, and it is
  NOT a defect of Jason's: the human answered Q-SA-21 "ไทยหลัก อังกฤษรอง" AFTER
  he complied with my English ruling, so the six `docs { … }` blocks get a Thai
  pass — form ruled in `## Review` → "Q-SA-21 re-ruling". Nothing else in the
  sheet may be re-opened. Q-BE-21/22/23 are all answered; none changes the sheet.
  Phase B is unchanged and still not startable — no evidence file exists.**
  Previously: **REVIEW (Phase A) — resubmitted 2026-08-24 by Jason. D1, D2 and D3
  all fixed on one trip; Bruno's session carry established from a source on his
  own machine, so Bruno is primary for Steps 2–4 and `curl` is the fallback.**
  Previously: **REWORK (Phase A) — as of 2026-08-24. Three defects, not
  two: D1 + D2 (2026-08-21) and **D3** (2026-08-24, the Bruno re-format — Q-SA-18
  and Q33 are ANSWERED and transcribed in `## Questions`, with five DoD rows
  added). One return trip covers all three; the content of the sheet is still
  accepted and is not to be re-opened. Q-SA-21 went up to Porter and is
  NON-BLOCKING.**
  Previously (2026-08-21, reviewed by Sober): The runbook is
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
follow-up question. ~~**Form: shell commands + `curl`, pasteable into a
terminal** — see Q-SA-18, which is open with him and non-blocking; write the
`curl` version now.~~ **SUPERSEDED 2026-08-24 by Sober — Q-SA-18 is ANSWERED
("Bruno") and Q33 says where its house style lives. The form is now split, and
the split is a ruling, not a preference: see `## Questions` → "Sober's ruling on
Q-SA-18 + Q33" and the D3 block in `## Review`. The `curl` text you already wrote
is NOT deleted and NOT re-derived.** It must cover, for **his** machine:

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

**Phase A, added 2026-08-24 by Sober (Q-SA-18 = Bruno, Q33 = the `docs` blocks).
These five join the five above; the TASK returns to `REVIEW` on all ten:**
- [ ] Steps 2, 3 and 4 exist as a **Bruno collection authored inside this file**
      — one fenced block per file, each labelled with its exact filename, plus
      `bruno.json` and one environment file. No file is created on disk by you
      (that would break the "clean tree / no production-code change" row above);
      the sheet tells him the **absolute** folder to create and paste them into.
- [ ] Every `.bru` request carries a `docs { … }` block, and the explanatory
      prose that today sits around the `curl` lines (what `202 { jobId }` means,
      the `NO_COMMITS` and `REPO_AUTH_FAILED` branches, "poll until it stops
      moving", the ≤ 366 span rule) lives **in those blocks** — nothing that is
      in the sheet today is lost by the re-format.
- [ ] **The session carry is stated as a verified mechanism, not assumed.** Say
      in the sheet exactly how `cr_session` reaches Steps 3 and 4 in Bruno, and
      name where that behaviour is documented. If you cannot establish it without
      running Bruno, **say so in `## Questions` and keep `curl` as the primary
      for Steps 2–4** — do not ship a collection that depends on a guess.
- [ ] The existing `curl` block for Steps 2–4 survives **verbatim** under a
      clearly-labelled fallback heading (D1/D2 fixes excepted). Re-deriving or
      re-wording accepted text is how a good runbook acquires a new error.
- [ ] Steps 1, 5 and 6 stay shell/prose and are **not** ported to Bruno — it
      starts no server, greps no log and writes no evidence file.

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

### Phase A — runbook (Jason, 2026-08-21; reworked 2026-08-24)

**Rework pass, 2026-08-24 — what changed and nothing else did:**

| Defect | Fix | Where |
|---|---|---|
| **D1** — `../project-docs/` resolves to a folder that does not exist on his machine | The **absolute** destination is written into the sheet, in both Windows and Git-Bash form | Step 5 |
| **D2** — `server-output.txt` is grepped twice but never created | Step 1 now starts the server through `tee`, so he watches the window **and** ends with the file; the pipe's buffering behaviour is stated in the sheet instead of being left as a surprise | Step 1 + Step 5 |
| **D3** — Steps 2–4 re-formatted as a Bruno collection with `docs { … }` blocks | New **Step 1b** (the collection, as fenced blocks — no file created by me) and Bruno forms of Steps 2, 3, 4; Steps 1, 5, 6 untouched as shell/prose; the `curl` text is **in place, unmoved and un-retyped**, under the fallback heading below Step 4 | Step 1b–4 + the fallback heading |

Nothing else in the sheet was opened. The `curl` block is the same characters it
was at the Phase A review — I added a heading above it and did not re-derive a
single line of it.

**Commit anchor moved, and I re-verified rather than assumed (Q-BE-21).**
Everything below was originally quoted from
`C:\Users\Admin\develyst\code-report\code-report-back` at commit `4101551`. HEAD
is now **`d1f0993`** (TASK-017), which is what he will actually run. I diffed the
two (`git diff --stat 4101551 d1f0993`) and read every change that touches a fact
this sheet quotes:

- `src/reports/validate.ts` — the date-window rules moved into an exported
  `applyDateWindowRules()`; its own comment says "Behaviour is unchanged — this
  is the block that used to sit inline in `validateCreateReport`, moved
  verbatim". The required/optional split, `YYYY-MM-DD` and the **exclusive
  ≤ 366-day** span are byte-identical. **Sheet unaffected.**
- `src/git/clone.ts` — `credentialSecrets` was exported for TASK-017. The
  `classifyCloneFailure` 404 → `REPO_AUTH_FAILED` mapping is untouched.
  **Sheet unaffected (Q-BE-13 still holds).**
- `src/index.ts` — TASK-017 added `/api/repos` + its session gate. `/api/health`
  is still mounted **before** every `requireSession` line, so the Step 1 sanity
  check still needs no session. **Sheet unaffected.**
- `src/config.ts`, `src/auth/*`, `src/reports/jobs.ts`, `src/reports/worker.ts`,
  `src/ai/*` — **not in the diff at all**, so the env-var table, the cookie
  facts, `JOB_STATUSES`, the worker lines and the `"component":"ai"` line shape
  are unchanged.

The file each fact comes from is still named next to it. Nothing here was
executed: see "What I did not do" at the end.

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
> `curl` ships with Git Bash.
>
> **Form (Q-SA-18 = Bruno, Q33 = the `docs` blocks):** Steps **2, 3 and 4** are
> HTTP requests and are done in **Bruno** — the collection is in Step 1b below,
> ready to paste. Steps **1, 5 and 6** stay in the terminal: they start a server,
> capture a log file and are a rule about secrets, and a request runner does none
> of those. A `curl` version of Steps 2–4 is kept as a **fallback** at the end of
> Step 4 — use it if anything in Bruno does not behave as described.

##### Step 1 — start the backend

```bash
cd /c/Users/Admin/develyst/code-report/code-report-back
AI_API_CENTER_URL=https://ai.develyst.online bun run start 2>&1 | tee server-output.txt
```

Leave this window open — the log lines you will paste back come out here **and**
are written to `server-output.txt` in that folder, which Step 5 reads.

- `2>&1 | tee server-output.txt` is the only reason the file in Step 5 exists.
  `2>&1` is there because `app.onError` prints with `console.error`
  (`src/index.ts`), i.e. to stderr, while every other line uses `console.log`
  (`src/ai/log.ts` `consoleSink`, `src/reports/worker.ts`) — without it a crash
  line would go to the screen and not to the file.
- **Honest caveat about `tee`, so it does not surprise you:** with `| tee`, the
  server's output is no longer going straight to a terminal, and output that is
  not going to a terminal is commonly written in blocks rather than line by line.
  Lines may therefore appear in the window (and in the file) **in bursts, a
  little behind the run**, and the file is only guaranteed complete **after** you
  stop the server in Step 5. Do not judge progress from this window — judge it
  from the `GET` you poll in Step 3. If after `Ctrl-C` the file looks shorter
  than what you saw on screen, copy the missing lines out of the window; the
  window and the file carry the same text.
- `server-output.txt` is written **inside the repo folder**, so `git status` will
  show it as untracked. Delete it (Step 5) when you are done; do not commit it.

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

- **Do not set `NODE_ENV=production` for this run, and if your `.env` sets it,
  unset it.** `secureCookie()` in `src/auth/session.ts` returns
  `process.env.NODE_ENV === "production"`, and the comment there says why it is
  conditional: a `Secure` cookie sent over plain `http` is dropped. The whole run
  is over `http://localhost:8080`, so with `NODE_ENV=production` the login in
  Step 2 would appear to succeed and Step 3 would answer `AUTH_REQUIRED`. This
  applies to **both** the Bruno form and the `curl` fallback. (Q-BE-22.)

Sanity check from a **second** Git Bash window (this route needs no session —
`src/index.ts` mounts it before the session gate):

```bash
curl -s http://localhost:8080/api/health
```
Expected: `{"status":"ok"}`

Everything from here runs either **in Bruno** (Steps 2–4) or in that **second**
Git Bash window (the fallback, and Steps 5–6).

##### Step 1b — create the Bruno collection

Create this folder — it is **outside both git repositories on purpose**, so
nothing you paste can end up in a commit, and it sits next to the collection you
already have:

```
C:\Users\Admin\Downloads\bruno\code-report
```

Inside it, create the eight files below exactly as named (Bruno reads the folder;
`environments` is a sub-folder). Then in Bruno: **Collection → Open Collection**
and point it at that folder, and pick the **local** environment in the
environment selector at the top right.

**Before the first request, check two settings** — they are what makes Step 2's
session reach Steps 3 and 4, and this is the one place where a wrong default
would waste the whole run. In **Preferences → General**, the checkboxes
**"Store Cookies automatically"** and **"Send Cookies automatically"** must both
be ticked. (Both default to on; see the note on the session carry after the
files.)

**File 1 — `bruno.json`**

````json
{
  "version": "1",
  "name": "code-report TASK-014",
  "type": "collection"
}
````

**File 2 — `environments\local.bru`**

`baseUrl` is `http://localhost:8080` because `PORT` defaults to `8080`
(`src/config.ts`, the table in Step 1). The two `jobId` values are placeholders:
after Step 3 and Step 4 you paste each returned id in here (Bruno's environment
editor edits this same file), and the two `GET` requests then work unchanged.

````
vars {
  baseUrl: http://localhost:8080
  jobIdA: PASTE-RUN-A-JOBID-HERE
  jobIdB: PASTE-RUN-B-JOBID-HERE
}
````

**File 3 — `POST Login.bru`**

````
meta {
  name: POST Login
  type: http
  seq: 1
}

post {
  url: {{baseUrl}}/api/auth/login
  body: json
  auth: none
}

docs {
  # Step 2 — ขอ session ที่ล็อกอินแล้ว

  ยิง `POST /api/auth/login` พร้อม `{ "username", "password" }`
  (`src/auth/routes.ts`)

  ## ผลลัพธ์ที่คาดว่าจะได้ (200 OK)

  ```json
  { "user": { "id": "…", "username": "admin", "displayName": "…" } }
  ```

  response จะแนบ `Set-Cookie: cr_session=…` มาด้วย ซึ่งก็คือตัว session
  (`src/auth/session.ts`: ชื่อ cookie `cr_session`, HttpOnly, SameSite=Lax,
  อายุ 12 ชั่วโมง) Bruno จะเก็บ cookie นี้ไว้และส่งให้ request ถัดไปเอง
  ไม่ต้องคัดลอกไปวางที่ไหน

  ## ถ้าไม่ผ่าน

  password ผิดจะได้ `401` พร้อม
  `{"error":{"code":"INVALID_CREDENTIALS", … }}` และไม่มี cookie เขียนมาให้

  ## โปรดอ่าน

  - `admin` คือ account ที่การรัน `seed:users` ของคุณรายงานไว้
    (`seed-users-run-2026-08-21.md`: `[seed:users] updated admin`)
    **password เป็นของคุณ ไม่มีใครในทีมมีหรืออยากได้**
  - เมื่อพิมพ์ password ลงในช่องข้างล่างแล้ว **ไฟล์นี้จะมีความลับอยู่ข้างใน**
    มันไม่ออกไปนอกเครื่องคุณ และไม่ใช่ไฟล์ที่ Step 5 ขอให้ส่งกลับมา
}

body:json {
  {
    "username": "admin",
    "password": "PUT-YOUR-ADMIN-PASSWORD-HERE"
  }
}
````

**File 4 — `GET Me.bru`**

````
meta {
  name: GET Me
  type: http
  seq: 2
}

get {
  url: {{baseUrl}}/api/auth/me
  body: none
  auth: none
}

docs {
  # Step 2 (ยืนยัน) — session ถูกส่งต่อจริงหรือเปล่า

  ยิงอันนี้ต่อจาก `POST Login` ทันที เป็นวิธีตรวจที่ถูกที่สุดว่า Bruno
  ส่ง cookie `cr_session` ซ้ำให้จริง เสียเวลาแค่วินาทีเดียวตรงนี้
  ดีกว่าไปเจอความล้มเหลวที่งงกว่ามากใน Step 3

  ## ผลลัพธ์ที่คาดว่าจะได้ (200 OK)

  ```json
  { "user": { "id": "…", "username": "admin", … } }
  ```

  ## ถ้าได้อันนี้แทน

  ```json
  { "error": { "code": "AUTH_REQUIRED", … } }
  ```

  แปลว่า cookie ไปไม่ถึง request สาเหตุมี 2 อย่าง เรียงตามโอกาสที่จะเป็น:

  1. **"Send Cookies automatically" / "Store Cookies automatically"**
     ยังติ๊กไม่ครบทั้งสองอันใน Preferences → General ให้ติ๊ก แล้วรัน
     `POST Login` ใหม่ ตามด้วย request นี้อีกครั้ง
  2. server รันด้วย `NODE_ENV=production` ซึ่งทำให้ cookie ถูกมาร์ค `Secure`
     และใช้ผ่าน `http` ธรรมดาไม่ได้ (`secureCookie()` ใน
     `src/auth/session.ts`) ให้หยุด server, unset ค่านั้น แล้วเริ่มใหม่จาก Step 1

  ถ้ายังไม่ผ่านอีก ไม่ต้องฝืน — ใช้ `curl` fallback ที่พิมพ์ไว้หลัง Step 4
  มันเก็บ cookie ไว้ในไฟล์ของตัวเองและไม่ขึ้นกับ setting ใด ๆ ของ Bruno
}
````

**File 5 — `POST Report - Run A.bru`**

````
meta {
  name: POST Report - Run A (success path)
  type: http
  seq: 3
}

post {
  url: {{baseUrl}}/api/reports
  body: json
  auth: none
}

docs {
  # Step 3 — Run A เส้นทางที่สำเร็จ

  ส่ง report job หนึ่งงานสำหรับ repo ตัวอย่างที่เป็น public งานนี้แหละคืองาน
  ที่การเขียน database และการเรียก AI ของมันคือหัวใจของแบบฝึกหัดนี้ทั้งหมด

  ## ผลลัพธ์ที่คาดว่าจะได้ (202 Accepted)

  ```json
  { "jobId": "<uuid>" }
  ```

  `202` แปลว่า *รับงานแล้ว กำลังทำอยู่เบื้องหลัง* — งานใช้เวลาเป็นนาที
  (`src/reports/routes.ts`; ตัว worker จงใจไม่ await)
  **คัดลอก `jobId` นั้นไปใส่ `jobIdA` ใน environment `local`** แล้วค่อยรัน
  `GET Report Status - Run A`

  ## เรื่อง body ข้างล่าง

  จาก `src/reports/validate.ts`: `repoUrl`, `dateFrom`, `dateTo`, `language`
  เป็นฟิลด์บังคับ ส่วน `pat`, `branch`, `author`, `extraContext` เป็น optional
  และ **จงใจไม่ใส่มา** — ไม่ใช้ PAT (repo นี้คาดว่าเป็น public), ไม่ระบุ branch
  (การ clone จะใช้ default branch ของ remote), ไม่กรอง author วันที่อยู่ในรูปแบบ
  `YYYY-MM-DD` ช่วงวันคิดเป็น exclusive difference และต้อง **≤ 366 วัน**
  (`2025-08-21 → 2026-08-21` เท่ากับ 365) และช่วงวันนับตาม `REPORT_TIMEZONE`
  คือ `Asia/Bangkok`

  ## ถ้าได้ 400 VALIDATION_ERROR

  body ถูกปฏิเสธก่อนที่จะมี job row เกิดขึ้น แปลว่ายังไม่ได้พิสูจน์อะไรเลย
  ให้ตรวจวันที่กับ URL แล้วส่งใหม่
}

body:json {
  {
    "repoUrl": "https://github.com/develyst1/smart-scheduler-front.git",
    "dateFrom": "2025-08-21",
    "dateTo": "2026-08-21",
    "language": "th"
  }
}
````

**File 6 — `GET Report Status - Run A.bru`**

````
meta {
  name: GET Report Status - Run A
  type: http
  seq: 4
}

get {
  url: {{baseUrl}}/api/reports/{{jobIdA}}
  body: none
  auth: none
}

docs {
  # Step 3 (poll) — ยิงซ้ำจนกว่าค่าจะนิ่ง

  ส่งซ้ำทุก ๆ ประมาณ 15 วินาที ค่า `status` จะเดินตามลำดับ
  `QUEUED → RUNNING → DONE` (`JOB_STATUSES` ใน `src/reports/jobs.ts`)
  **หยุดเมื่อ `status` เป็น `DONE` และเก็บ response body อันสุดท้ายนั้นไว้** —
  body อันนั้นคือหลักฐานที่ Step 5 ขอ

  ## หน้าตาของ response (`jobResponse` ใน src/reports/jobs.ts)

  ```json
  {
    "jobId": "…", "status": "DONE", "stage": null, "progress": null,
    "params": { "repoUrl": "…", "branch": null, "author": null,
                "dateFrom": "…", "dateTo": "…", "language": "th" },
    "commitCount": 42,
    "report": { "markdown": "…the whole report…", "language": "th" },
    "error": null
  }
  ```

  ## สองตอนจบที่ไม่ใช่ DONE

  - **`"status":"NO_COMMITS"`** — ช่วงวันนั้นไม่มี commit จริง ๆ backend จึง
    **ไม่เรียก AI เลยสักครั้ง** (`src/reports/worker.ts`) เส้นทาง database
    ยังถูกใช้งานอยู่ แต่จะ **ไม่มีหลักฐานเรื่อง provider/model** ถ้าเจอแบบนี้
    ให้หาช่วงวันที่มี commit จริง (คำสั่ง `git` สองบรรทัดใน `curl` fallback
    จะพิมพ์วันที่ของ commit ล่าสุดให้ดู) แล้วรัน `POST Report - Run A`
    ใหม่ด้วยช่วงวันนั้น
  - **`"status":"FAILED"` พร้อม `"code":"REPO_AUTH_FAILED"`** — แปลว่า repo
    ตัวอย่างไม่ได้เป็น public อย่างที่คิด ให้เพิ่ม
    `"pat": "<your GitHub read token>"` ลงใน body ของ Run A แล้วรันใหม่
    **อย่าส่ง PAT กลับมาให้เรา** — บอกแค่ว่าคุณใช้ PAT ก็พอ
}
````

**File 7 — `POST Report - Run B.bru`**

````
meta {
  name: POST Report - Run B (failure path)
  type: http
  seq: 5
}

post {
  url: {{baseUrl}}/api/reports
  body: json
  auth: none
}

docs {
  # Step 4 — Run B เส้นทางที่ล้มเหลว

  job ที่สองนี้จะล้มเหลว **ข้างใน worker** ทำให้มี row ถูกสร้างขึ้นจริง
  และคอลัมน์ error ถูกเขียนจริง ที่อยู่ข้างล่างนี้รูปแบบถูกต้อง
  แต่ repository ไม่มีอยู่จริง

  ## ผลลัพธ์ที่คาดว่าจะได้ (202 Accepted)

  ```json
  { "jobId": "<a second uuid>" }
  ```

  เอาไปวางใน `jobIdB` ใน environment `local` แล้วรัน
  `GET Report Status - Run B`

  ## ทำไมถึงเป็น 202 ไม่ใช่ error

  เพราะนั่นคือประเด็นของการรันรอบนี้: request ที่ *valid* จะสร้าง row ขึ้นมา
  แล้วความล้มเหลวค่อยเกิดทีหลังตอน clone ถ้าเมื่อไรเห็น
  `400 VALIDATION_ERROR` ตรงนี้ แปลว่าที่อยู่ถูกปฏิเสธตั้งแต่ก่อนจะมี row
  และการรันรอบนั้นไม่ได้พิสูจน์อะไร — ให้ตรวจ URL แล้วลองใหม่
}

body:json {
  {
    "repoUrl": "https://github.com/develyst1/this-repo-does-not-exist-code-report.git",
    "dateFrom": "2025-08-21",
    "dateTo": "2026-08-21",
    "language": "th"
  }
}
````

**File 8 — `GET Report Status - Run B.bru`**

````
meta {
  name: GET Report Status - Run B
  type: http
  seq: 6
}

get {
  url: {{baseUrl}}/api/reports/{{jobIdB}}
  body: none
  auth: none
}

docs {
  # Step 4 (poll) — อันนี้ล้มเหลวภายในไม่กี่วินาที

  Run B ล้มที่ขั้นตอน clone ปกติยิงแค่หนึ่งถึงสองครั้งก็พอ

  ## ผลลัพธ์ที่คาดว่าจะได้

  ```json
  {
    "jobId": "…", "status": "FAILED", "stage": null,
    "commitCount": null, "report": null,
    "error": { "code": "REPO_AUTH_FAILED", "message": "…" }
  }
  ```

  ## ทำไมเป็น `REPO_AUTH_FAILED` ไม่ใช่ `REPO_NOT_FOUND`

  GitHub ตอบ `404` ทั้งกรณี "ที่อยู่ผิด" และกรณี "repository เป็น private"
  และ `classifyCloneFailure` (`src/git/clone.ts`) แม็ป 404 ไปเป็น
  `REPO_AUTH_FAILED` **โดยตั้งใจ** เพราะมีแต่ข้อความนั้นที่ครอบคลุมทั้งสอง
  สาเหตุ **นี่คือผลลัพธ์ที่คาดไว้ ไม่ใช่ bug** — ปล่อย body ไว้อย่างเดิม

  ## การรันรอบนี้มีไว้เพื่ออะไร

  การที่ object `error` ซึ่งไม่ใช่ null เดินทางกลับมาทาง API คือหลักฐานว่า
  คอลัมน์ error ถูกเขียนและอ่านได้ถูกต้อง เก็บ response body อันนี้ไว้ —
  มันคือไฟล์ที่สองที่ Step 5 ขอ
}
````

##### Step 2 — get an authenticated session (Bruno)

Send **`POST Login`**, then **`GET Me`**. The `docs` tab of each request tells
you what to expect and what to do if it fails.

**How the session reaches Steps 3 and 4, and where that behaviour is written
down.** It is not assumed and it is not manual — Bruno keeps a cookie jar. Read
from the Bruno application installed on this machine
(`C:\Users\Admin\AppData\Local\Programs\Bruno\resources\app.asar`, which carries
its own sources):

- **Storing:** `saveCookies(url, headers)` takes every `set-cookie` header off a
  response and puts it in a shared `tough-cookie` jar (`addCookieToJar`). It runs
  behind `preferencesUtil.shouldStoreCookies()`.
- **Sending:** `getCookieStringForUrl(request.url)` builds the `Cookie` header for
  the outgoing request out of that jar, dropping expired entries. It runs behind
  `preferencesUtil.shouldSendCookies()` — and there is a second call site for the
  redirect URL, so a redirect does not lose the session either.
- **Both preferences default to on:** `request.storeCookies` and
  `request.sendCookies` are read with a default of `true`, and they are the two
  checkboxes labelled **"Store Cookies automatically"** and **"Send Cookies
  automatically"**.

So: log in once, and Steps 3 and 4 carry `cr_session` by themselves — **provided
those two boxes are ticked**, which is why Step 1b asks you to look before you
start and `GET Me` proves it in one second. `HttpOnly` does not get in the way:
that flag restrains browser *scripts*, and this is a request client with a jar,
not a browser.

##### Step 3 — Run A (Bruno)

Send **`POST Report - Run A`** → copy the returned `jobId` into `jobIdA` in the
`local` environment → send **`GET Report Status - Run A`** every ~15 seconds
until `status` is `DONE`. Keep that final response body. The `docs` tab covers
the request body's rules and the two endings that are not `DONE`.

##### Step 4 — Run B (Bruno)

Send **`POST Report - Run B`** → copy the second `jobId` into `jobIdB` → send
**`GET Report Status - Run B`**. Expect `"status":"FAILED"` with
`"code":"REPO_AUTH_FAILED"`; the `docs` tab explains why that is the right
answer.

---

#### Fallback — the `curl` form of Steps 2, 3 and 4

**Use this only if Bruno does not behave as described above** (most likely cause:
the two cookie checkboxes). It does the same three steps with `curl` and its own
cookie file, and it depends on no Bruno setting. It is the text that was written
and verified before the Bruno form existed and it is reproduced here unchanged —
if the two forms ever disagree, they are the same six calls, and the difference
is a mistake worth reporting rather than choosing between.

**Steps 5 and 6 below are NOT part of the fallback — they apply either way.**

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

#### End of the `curl` fallback — Steps 5 and 6 apply to both forms

##### Step 5 — what to paste back

Create **one** file, named
`task-014-run-evidence-<date>.md` (e.g. `task-014-run-evidence-2026-08-24.md`),
in **this exact folder**:

```
C:\Users\Admin\develyst\ai-agent-work\ai-agent-workspace\code-report\project-docs\
```

In Git Bash that same folder is:

```bash
/c/Users/Admin/develyst/ai-agent-work/ai-agent-workspace/code-report/project-docs/
```

It is the folder your `db-migrate-seed-run-2026-08-20.md` and
`seed-users-run-2026-08-21.md` already sit in — the one place the team reads. It
is **not** next to the two repositories, so please do not use a relative path
from the backend folder.

The file has four sections:

1. **Run A body** — the final `GET Report Status - Run A` response, verbatim,
   nothing trimmed. From Bruno: copy the whole response body out of the response
   pane. From the `curl` fallback: the full contents of `run-a.json`. It is long
   (`report.markdown` is the whole report) — paste all of it.
2. **Run B body** — the final `GET Report Status - Run B` response, verbatim
   (`run-b.json` in the fallback).
3. **The AI log lines.** In the server window, every AI call prints one line
   starting `{"component":"ai"` (`src/ai/log.ts`, `logAiCall`). Paste **all** of
   them for Run A's `jobId`. Step 1 wrote them to `server-output.txt`, so from a
   second window (the file is complete once the server is stopped — see the
   caveat in Step 1):
   ```bash
   cd /c/Users/Admin/develyst/code-report/code-report-back
   grep '"component":"ai"' server-output.txt
   ```
   (if the file ever looks short, scroll the server window and copy the lines by
   eye — it carries the same text). Shape, from
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

**Order matters:** stop the server (`Ctrl-C` in the Step 1 window) **before** you
run the two `grep` commands, so `server-output.txt` is complete. Then, once the
evidence file is written and saved, clean up:

```bash
cd /c/Users/Admin/develyst/code-report/code-report-back
rm -f cr-cookies.txt run-a.json run-b.json server-output.txt
```

`server-output.txt` is deleted because it sits inside the repository and would
otherwise show up as an untracked file. The Bruno collection in
`C:\Users\Admin\Downloads\bruno\code-report` is outside both repositories and is
yours to keep or delete — but remember `POST Login.bru` holds your password.

##### Step 6 — the no-secrets rule (please read before you paste)

Nothing you send back should contain a secret. Specifically:

| Never paste | Replace it with |
|---|---|
| The `cr_session` cookie value / anything from `cr-cookies.txt`, or Bruno's cookie list | `<session cookie removed>` |
| Your `admin` password — including **the copy inside `POST Login.bru`**, so please do not send that file back either | `<password removed>` — we never need it |
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

**Re-run at the 2026-08-24 rework (same statement, still true).** The rework also
created **no** Bruno file on disk: the eight files exist only as fenced blocks in
this TASK, and `C:\Users\Admin\Downloads\bruno\code-report` is a folder **he**
creates. The only new commands were read-only: `git diff --stat 4101551 d1f0993`
plus `git diff` on the three changed files this sheet quotes, and read-only
`grep` over the installed Bruno application's own bundle
(`…\Programs\Bruno\resources\app.asar`) to establish the cookie mechanism —
**Bruno was never launched and no request was ever sent.**

```
$ cd C:/Users/Admin/develyst/code-report/code-report-back && git status --porcelain
(no output)
$ git log --oneline -1
d1f0993 TASK-017: repository inspection endpoints (branches, committers)
```

#### Self-check against the ten Phase A DoD rows (2026-08-24 resubmission)

Left unticked above — the boxes are yours at review. Where each row is met:

1. *Runbook covers the six points, copy-pasteable* — Steps 1, 1b, 2, 3, 4, 5, 6.
   The two placeholders left are the ones only he can fill (`PUT-YOUR-ADMIN-PASSWORD-HERE`,
   the two `jobId`s), and each is named in the surrounding text.
2. *Every fact quoted, file named* — unchanged, plus the `d1f0993` re-verification
   (Q-BE-21) and two newly-quoted files: `src/auth/session.ts` (`secureCookie()`)
   and Bruno's own bundle for the cookie mechanism.
3. *No secret asked for; told what not to paste* — Step 6, plus the new
   `POST Login.bru` row and the reminder in that file's own `docs` block.
4. *Clean tree, no production-code change* — `git status --porcelain` empty at
   `d1f0993`, above. Phase A wrote into this TASK file only.
5. *No server, no `DATABASE_URL`, no SQL, no login* — stated above; Bruno was not
   launched either.
6. *Steps 2–4 as a Bruno collection inside this file* — Step 1b, eight fenced
   blocks (`bruno.json`, `environments\local.bru`, six `.bru`), each labelled
   with its filename, and the **absolute** folder he creates is named.
7. *Every `.bru` carries `docs { … }` with the prose that surrounded the `curl`
   lines* — `202 { jobId }`, the `NO_COMMITS` and `REPO_AUTH_FAILED` branches,
   "poll until it stops moving" and the ≤ 366-day span all live in `docs` blocks
   now. `GET Me.bru` has one too. Written in English per your Q-SA-21 ruling;
   **re-written Thai-led on 2026-08-24** after that ruling was withdrawn — see
   "Thai pass" below. Same facts, same order, same headings' meaning.
8. *Session carry stated as a verified mechanism with a named source* — Step 2
   (Bruno): jar, both call sites, both preference defaults, source path quoted.
   **This is why Bruno is primary and `curl` is the fallback, rather than the
   other way round.** The one thing I cannot verify without running Bruno is
   whether *his* copy still has the two boxes ticked, which is a setting and not
   a behaviour — so the sheet has him look before he starts and `GET Me` proves
   it in one request.
9. *The `curl` block survives verbatim under a fallback heading* — it was not
   moved and not re-typed. I inserted a heading above it and an end-marker below
   it; the D1/D2 fixes that touch it are the two `grep` lines and the `rm`, all
   of which live in Step 5, i.e. outside the fallback.
10. *Steps 1, 5, 6 stay shell/prose* — they do.

### Thai pass on the six `docs { … }` blocks (Jason, 2026-08-24)

One unit, exactly the scope you set: **language only, in the six `docs` blocks,
and nothing else opened.** Your form from the §Review re-ruling, applied line by
line — Thai prose for the explanation, English left alone for every *name of a
thing*, and nothing inside a fenced block translated.

**The six blocks, and what each heading became:**

| `.bru` | Headings now |
|--------|--------------|
| `POST Login` | `# Step 2 — ขอ session ที่ล็อกอินแล้ว` / `## ผลลัพธ์ที่คาดว่าจะได้ (200 OK)` / `## ถ้าไม่ผ่าน` / `## โปรดอ่าน` |
| `GET Me` | `# Step 2 (ยืนยัน) — session ถูกส่งต่อจริงหรือเปล่า` / `## ผลลัพธ์ที่คาดว่าจะได้ (200 OK)` / `## ถ้าได้อันนี้แทน` |
| `POST Report - Run A` | `# Step 3 — Run A เส้นทางที่สำเร็จ` / `## ผลลัพธ์ที่คาดว่าจะได้ (202 Accepted)` / `## เรื่อง body ข้างล่าง` / `## ถ้าได้ 400 VALIDATION_ERROR` |
| `GET Report Status - Run A` | `# Step 3 (poll) — ยิงซ้ำจนกว่าค่าจะนิ่ง` / `## หน้าตาของ response (…)` / `## สองตอนจบที่ไม่ใช่ DONE` |
| `POST Report - Run B` | `# Step 4 — Run B เส้นทางที่ล้มเหลว` / `## ผลลัพธ์ที่คาดว่าจะได้ (202 Accepted)` / `## ทำไมถึงเป็น 202 ไม่ใช่ error` |
| `GET Report Status - Run B` | `# Step 4 (poll) — อันนี้ล้มเหลวภายในไม่กี่วินาที` / `## ผลลัพธ์ที่คาดว่าจะได้` / `## ทำไมเป็น REPO_AUTH_FAILED ไม่ใช่ REPO_NOT_FOUND` / `## การรันรอบนี้มีไว้เพื่ออะไร` |

**What I deliberately left in English, because it is the name of a thing:**
`Step N` (it is the label of a step in this sheet, and the sheet's own prose
outside the blocks says `Step 5`, `Step 1` — translating it here would break the
one cross-reference he actually follows); every endpoint path, status code
(`202`, `401`, `400 VALIDATION_ERROR`, `AUTH_REQUIRED`, `INVALID_CREDENTIALS`,
`NO_COMMITS`, `REPO_AUTH_FAILED`, `REPO_NOT_FOUND`); every field, env var,
source-file citation and filename; Bruno's own UI strings quoted verbatim
(`"Send Cookies automatically"`, `"Store Cookies automatically"`,
`Preferences → General`); the request names (`POST Login`, `GET Me`,
`GET Report Status - Run A`, …) and the environment variable names
(`jobIdA`, `jobIdB`, `local`); and the two placeholders
(`PUT-YOUR-ADMIN-PASSWORD-HERE`, `"pat": "<your GitHub read token>"`).

**What was NOT touched, and I checked rather than assumed:**

- **Every fenced block inside a `docs` block is byte-identical** — the six JSON
  samples (login reply, `me` reply, `AUTH_REQUIRED`, both `202 { jobId }`, the
  `jobResponse` shape, the Run B `FAILED` shape). Not one key, value or `…`
  changed.
- **`meta`, `get`/`post` and `body:json` blocks of all eight files** — untouched.
  So are `bruno.json` and `environments\local.bru`, which carry no `docs` block.
- **The `curl` fallback (Steps 2–4) is still English and still verbatim**, as is
  everything in Steps 1, 5 and 6, the §"What to do" prose, the Step 6 table and
  every earlier §Questions/§Review section. PROTOCOL's English rule is unchanged
  and I read Porter's relay narrowly, as you told me to (`docs` blocks only;
  the wider reading is his Q39).
- **No accepted fact, command, body or citation was re-opened.** The pass added
  no sentence and dropped none: each Thai paragraph carries the same claim, in
  the same order, under a heading with the same meaning.

**Verification:** the six edits were made as exact-match replacements of the
English prose only, so nothing outside those six spans could move. Re-read after
the pass: the twenty-one headings inside the six blocks are the ones tabled
above, and no `# `/`## ` heading inside a `docs` block is still English. Still no
code, no server, no `DATABASE_URL`, no SQL, no DB, no login; Bruno never
launched; no file created on disk. The backend repo is untouched by this unit —
`git status --porcelain` empty at `d1f0993`, unchanged from the resubmission.

**@Sober: TASK-014 is back at `REVIEW`.** One question below (Q-BE-24) about the
`Step N` decision — **NON-BLOCKING**, it is a one-word change either way and I
took the reading that keeps the sheet's cross-references intact.

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

  > **answer to Q-SA-18 (2026-08-21, human via @Porter, verbatim):**
  > `"Q-SA-18= C:\Users\Admin\Downloads\bruno\bruno  อ่านdocs ก่อน"`
  >
  > **and its follow-up Q33 (2026-08-21, human via @Porter, verbatim):**
  > `"Q33 - เปิด ดูไฟล์ .bru ก่อน จะเห็น docs ข้างใน"`
  >
  > Transcribed here by Sober 2026-08-24 from REQ-001 `## Questions` (Porter may
  > not write in `tasks/`), same precedent as Q-SA-6 and Q-SA-16.
  >
  > **What the two answers settle, and it is only this:** the form is **Bruno**,
  > and "อ่านdocs ก่อน" means the `docs { … }` block written **inside** each
  > `.bru` file at that path — not Bruno's website, and **no internet fetch is
  > asked for**. Porter verified the path himself: `C:\Users\Admin\Downloads\bruno\bruno`
  > exists and holds `bruno.json`, `environments\` and eight `.bru` files, every
  > one carrying a Thai `docs { … }` block. It is an **AI API CENTER** collection
  > — an example of the shape he expects, **not** a collection for `code-report`.
  > A copy of it is readable at
  > `C:\Users\Admin\develyst\ai-agent-work\ai-agent-workspace\code-report\project-docs\ai-api-center-bruno\`.
  > Porter named no DoD line and no format detail; both were explicitly left to me.

### Sober's ruling on Q-SA-18 + Q33 (2026-08-24) — BOTH forms, split by what Bruno can actually do

- **The sheet is not replaced. Bruno takes Steps 2, 3 and 4 and nothing else.**
  Steps 1, 5 and 6 are `bun run start`, log capture and the no-secrets rule —
  a request runner starts no server, greps no log file and writes no evidence
  file. "A Bruno collection instead of the runbook" would silently drop half of
  what Phase A exists to deliver, and the half it would drop is the half that
  produces the evidence. He answered with a path to a **collection of requests**;
  Steps 2–4 are the requests.
- **The `curl` block stays, verbatim, as a labelled fallback — it is not deleted
  and not re-derived.** It is already written and already re-verified line by
  line against `4101551` at the Phase A review; discarding verified work for
  tidiness costs a re-verification and buys nothing. The one thing that must not
  happen is two *diverging* sources of truth, so the fallback is frozen text:
  @Jason changes it for D1/D2 only.
- **Where the collection lives: inside this TASK file, as fenced blocks, one per
  `.bru` file.** Not on disk. Phase A's DoD says `git status --porcelain` empty
  and no production-code change, and a Bruno collection committed into
  `code-report-back` is a repo change no REQ asked for; `project-docs/` is the
  **human's** drop folder, not ours to author into. The sheet names the absolute
  folder **he** creates and pastes them into — D1's lesson, applied before it
  bites a second time.
- **`docs { … }` per request is a DoD line, and that is the point of Q33.** His
  collection is not just requests, it is a house style for documenting a request;
  the explanatory prose that today surrounds the `curl` lines has somewhere to go
  precisely because that block exists. This is **not** a copy question: Q14's
  closed bundle governs the product's user-facing strings, and a runbook is not
  the product — the existing English sheet was never treated as copy either.
- **`baseUrl` is `http://localhost:8080`**, from the verified `PORT` default in
  `src/config.ts` (the table in the sheet above), and it goes in the environment
  file so the three requests carry no hard-coded host — the shape `local.bru`
  uses in his own collection.
- **What I am NOT ruling, because it is a measurement and not a preference:**
  whether Bruno carries the `cr_session` cookie from Step 2 into Steps 3 and 4 by
  itself. That is third-party behaviour, PROTOCOL forbids assuming it, and the
  whole run dies at Step 3 if it is wrong. **@Jason: establish it and quote your
  source, or say you cannot and leave `curl` primary for Steps 2–4** — the
  mechanism is yours, the constraint is mine. Do not solve it by putting the live
  session token into a committed environment file; Step 6 says that value never
  leaves his machine.
- **Status: this TASK stays in `REWORK (Phase A)`.** The Bruno re-format is
  **D3**, alongside the still-open D1 and D2 — see `## Review`. One return trip,
  not two.

- **Q-SA-21 (NON-BLOCKING — raised by Sober 2026-08-24, for @Porter):** in what
  language should the `docs { … }` blocks be written? I have ruled **English**
  and Phase A proceeds in English either way, so nothing waits on this. The
  reason it is asked rather than assumed: PROTOCOL puts everything outside
  PM ↔ Human in English and the existing sheet is English because **Porter
  relays it to him in Thai** — but a `.bru` file is handed over and executed
  *verbatim*, with no relay step in between, and his own eight `.bru` files
  document themselves in **Thai**. If he wants the house style matched all the
  way down, that is a translation pass on the `docs` blocks at hand-over time
  and it changes no request, no evidence and no DoD line.

> **ANSWERED 2026-08-24 by the human, relayed by Porter — verbatim: "ไทยหลัก
> อังกฤษรอง".** My English ruling is **withdrawn** for the six `docs { … }`
> blocks. The form I rule from it — Thai prose, English kept for every name of a
> thing, nothing inside a fenced block translated, everything else in the sheet
> unchanged — is in `## Review` → "Q-SA-21 re-ruling", together with why the Thai
> is authored in this file and not at Porter's relay. Read **narrowly**: PROTOCOL
> keeps REQ/SPEC/TASK, board and log in English; the wider reading is Porter's
> Q39 and is NON-BLOCKING. It cost one small unit and no re-verification.

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
  *(Count corrected 2026-08-24 per your review note: there are **three**
  `finished_at` writes — `finishDone`, `finishNoCommits`, `finishFailed` — not
  four. The rest of this question is unchanged.)*
  Three ways out, none of them mine to pick: (a) accept the line as partially
  closed and record `finished_at` as unproven; (b) accept the three `finished_at`
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

- **Q-BE-21 (NON-BLOCKING — Jason, 2026-08-24): the sheet's commit anchor moved
  from `4101551` to `d1f0993`, and I re-verified instead of re-anchoring
  silently.** He will run whatever HEAD is, and HEAD is now TASK-017's commit.
  I diffed the two and read every change that touches a quoted fact; the full
  list is at the top of `## Implementation Notes`. **Nothing in the sheet
  changed** — `src/reports/validate.ts` is a verbatim move into an exported
  `applyDateWindowRules()`, `src/git/clone.ts` only exports `credentialSecrets`,
  and `/api/health` is still mounted before every session gate in
  `src/index.ts`. `config.ts`, `auth/*`, `reports/jobs.ts`, `reports/worker.ts`
  and `ai/*` are not in the diff at all. Flagging it because a runbook that says
  "quoted at `4101551`" and is executed at `d1f0993` is a claim nobody has
  checked — now somebody has. **If you would rather the sheet keep saying
  `4101551`, say so and I will revert the anchor line; I have not touched the
  per-fact citations either way.**

- **Q-BE-22 (NON-BLOCKING — Jason, 2026-08-24): `NODE_ENV=production` would kill
  the session carry in both forms, so the sheet now tells him not to set it.**
  `secureCookie()` (`src/auth/session.ts`) returns
  `process.env.NODE_ENV === "production"`, and its own comment explains that a
  `Secure` cookie sent over plain `http` is dropped — the whole run is over
  `http://localhost:8080`. The symptom would be a login that looks successful
  followed by `AUTH_REQUIRED` on Step 3, which is exactly the kind of two-role
  round trip Phase A exists to prevent. **I did not change any code and did not
  ask him for his `.env`** — it is one caution line in Step 1 and one branch in
  `GET Me`'s `docs` block. Flagging it because it is the only *new* fact the
  rework added to the sheet that was not in your D1/D2/D3 list; if you judge it
  out of scope, it is a two-line deletion.

- **Q-BE-23 (FYI, no answer needed — Jason, 2026-08-24): I did not put `tests { … }`
  blocks in the `.bru` files, although his own eight have them.** The DoD asks
  for `docs { … }` and that is what I wrote. A `tests` block here would have to
  assert an outcome, and the two outcomes this run is *for* are legitimately
  variable: Run A may come back `NO_COMMITS`, and Run B's whole point is a
  `FAILED` status. A red test on a run that behaved correctly would tell him
  something is broken when nothing is. Say the word at review and they are cheap
  to add.

- **Q-BE-24 (NON-BLOCKING — Jason, 2026-08-24): in the Thai pass I kept `Step N`
  in English inside the `docs` headings, and I want that decision on the record
  rather than assumed.** Your form says Thai prose, English for every *name of a
  thing*. `Step 2` / `Step 3` / `Step 4` sit on the line between the two: they
  read as prose, but they are also the sheet's own cross-references — the `docs`
  blocks point him at `Step 5` ("the evidence Step 5 asks for") and at `Step 1`
  ("start again from Step 1"), and those steps are English headings in the
  runbook outside the collection, which the Q-SA-21 answer does **not** cover.
  Translating the label inside the blocks only would leave him matching
  "ขั้นตอนที่ 5" against a heading that says `Step 5`. So I treated `Step N` as a
  name and left it. If you read it as prose instead, it is a mechanical
  find-and-replace across six headings and I will do it on your word — but I
  would not do it without also ruling what happens to the `Step 5` / `Step 1`
  references, and that touches text outside the six blocks, which you told me not
  to open.

  > **answer to Q-BE-24 (Sober, 2026-08-24): `Step N` stays English. Your reading
  > is upheld, and it is the right one for a reason I can point at rather than
  > argue.** I checked the sheet instead of the principle: the runbook's own
  > headings outside the collection read `##### Step 2 — get an authenticated
  > session (Bruno)`, `##### Step 3 …`, `##### Step 4 …`, `##### Step 5 — what to
  > paste back` — all English, all outside what Q-SA-21 covers. Inside the blocks
  > you send him to `Step 5` twice and to `Step 1` once. A label that a reader has
  > to match against a heading elsewhere in the same document **is** a name of a
  > thing, which is exactly the carve-out in my form; translating it on one side
  > only would have created the mismatch you describe. Not to be revisited without
  > a new instruction — and if it ever is, the two references get ruled first, in
  > the same unit.

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

---

### Addendum, Sober 2026-08-24 — D3 joins D1 and D2 (status unchanged: `REWORK`)

Q-SA-18 came back **"Bruno"** and Q33 said its documentation lives **inside** the
`.bru` files. Both are transcribed in `## Questions` above with my ruling and the
five DoD rows it adds. The consequence for you is one more defect on the same
return trip, deliberately not a second one:

**D3 — Steps 2, 3 and 4 are re-formatted as a Bruno collection, authored as
fenced blocks in `## Implementation Notes` (not files on disk), each `.bru`
carrying a `docs { … }` block; Steps 1, 5 and 6 stay shell/prose; the existing
`curl` block for Steps 2–4 survives verbatim as a labelled fallback.**

Three things this addendum deliberately does **not** do:

1. **It does not re-open the content.** Every fact in the sheet was re-derived
   from `4101551` at the Phase A review and held.
   D3 changes the *container* of Steps 2–4, not a single quoted fact inside them.
2. **It does not send you to Bruno's website.** Q33 settles that "อ่านdocs ก่อน"
   points at the eight `.bru` files on this machine; the readable copy is
   `…\ai-agent-workspace\code-report\project-docs\ai-api-center-bruno\`. No
   internet fetch is asked of you.
3. **It does not decide the cookie mechanism for you.** See the ruling's last
   bullet — if Bruno's session carry cannot be established without running it,
   `curl` stays primary for Steps 2–4 and you say so in `## Questions`. That is
   an acceptable outcome of this rework, not a failure of it.

One question of mine went **up**, not to you: **Q-SA-21** (are the `docs` blocks
English or Thai) is with @Porter and is **NON-BLOCKING** — write them in English
and keep going.

The evidence hand-over stays gated exactly as before, now on D1 + D2 + D3.

---

### Review — Phase A resubmission, Sober 2026-08-24: **CONTENT ACCEPTED, all ten DoD rows pass**

I checked the three fixes against the repo and against the file's own history
rather than against your description of them. All three hold, and **no new
defect was introduced by the rework** — which is the specific risk a third pass
over an accepted sheet carries, and it did not happen.

**D1 — passes.** Step 5 now names
`C:\Users\Admin\develyst\ai-agent-work\ai-agent-workspace\code-report\project-docs\`
and its Git-Bash twin, and I confirmed that folder is the one holding
`db-migrate-seed-run-2026-08-20.md`, `seed-users-run-2026-08-21.md`,
`AI-API-CENTER.md`, `ai-api-center-bruno/` and his screenshot. The sheet also
tells him **not** to use a relative path from the backend folder — the failure
mode, not just the fix.

**D2 — passes, including the part I left to you.** `2>&1 | tee server-output.txt`
creates the file both `grep`s read, and your reason for `2>&1` is correct at
`d1f0993`: `app.onError` prints via `console.error` (`src/index.ts` line 38–39)
while `ai/log.ts` and `worker.ts` use `console.log`. The buffering caveat is in
the sheet, it tells him to judge progress from the polled `GET` and not from the
window, and Step 5 orders `Ctrl-C` **before** the `grep`s. That is the whole
constraint I set, met without inventing a script or a flag.

**D3 — passes, and the format is right against his own collection.** I read
`project-docs/ai-api-center-bruno/` file by file: `bruno.json` (`version`/`name`/
`type`), `environments/local.bru` as a bare `vars { … }` block, and requests as
`meta` / `get|post` / `docs` / `body:json` — your eight blocks match that shape
key for key, so what he pastes will open. `baseUrl` is in the environment, not
hard-coded. Steps 1, 5 and 6 stayed shell/prose as ruled.

**DoD row 9 (the `curl` block survives verbatim) — verified objectively, not
read.** The workspace repo tracks this TASK file, so I diffed the working copy
against `4166722` and listed **every deleted line**: they fall only in the status
header, the TASK's own §"What to do", Step 1, Step 5, the Step 6 table and
Q-BE-14's "four". **Not one deleted or altered line lies between the end of
Step 1 and Step 5** — i.e. the `curl` Steps 2, 3 and 4 are byte-identical to the
text I re-verified at the Phase A review. That is exactly what I asked for.

**DoD row 8 (session carry established, not assumed) — passes, and this is the
best judgement in the rework.** You were given the option to say "cannot
establish, `curl` stays primary" and it would have been accepted; instead you
read the mechanism out of the bundle on his machine — jar on store, jar on send,
**both** call sites including the redirect one, and the two preference defaults —
and then still did not trust it blindly: the sheet has him look at the two
checkboxes and proves the carry with a one-second `GET /api/auth/me` before
anything expensive runs. A verified mechanism plus a one-request proof plus a
labelled fallback is the correct shape for a third-party fact.

**The re-anchoring at `d1f0993` — I re-derived your diff instead of reading it.**
HEAD is `d1f0993`, `git status --porcelain` empty. `git diff --stat 4101551
d1f0993` is ten files; of the three that touch a quoted fact:
`src/reports/validate.ts` is the date-window block lifted into an exported
`applyDateWindowRules()` (the required/optional split and the exclusive
≤ 366-day span are unchanged); `src/git/clone.ts` only exports
`credentialSecrets`; `src/index.ts` adds `/api/repos` + its gate with
`app.get("/api/health", …)` still on line 23, **before** all four `requireSession`
lines (26, 27, 31, 32). `config.ts`, `auth/*`, `reports/jobs.ts`,
`reports/worker.ts` and `ai/*` are absent from the diff. I also re-read the two
newly-quoted facts: `secureCookie()` returns `process.env.NODE_ENV ===
"production"` with the comment you quoted, and `/api/auth/me` answers
`AUTH_REQUIRED`/401 itself (`src/auth/routes.ts` line 73–80) — so the `GET Me`
`docs` branch is right.

**DoD rows 4 and 5 — pass.** Clean tree at `d1f0993`, no production file
touched, no Bruno file on disk, and the "no server / no `DATABASE_URL` / no SQL /
no login / Bruno never launched" statement is explicit.

#### Answers to your three questions

> **answer to Q-BE-21 (Sober, 2026-08-24): keep `d1f0993`. Do not revert the
> anchor.** You were right to move it and righter to re-verify it: he runs HEAD,
> and a sheet anchored to a commit he no longer has is a claim nobody checked. I
> re-derived the whole delta above and reached your conclusion independently.
> The per-fact citations naming the file are what actually carry the sheet, and
> leaving them untouched was the correct restraint.

> **answer to Q-BE-22 (Sober, 2026-08-24): the `NODE_ENV=production` caution
> stays. It is in scope, and it is the same class of defect as D1 and D2.**
> Verified verbatim in `src/auth/session.ts`. D1 and D2 were both "the sheet
> silently fails on his machine"; a `Secure` cookie dropped over plain `http`
> gives him a login that looks fine and an `AUTH_REQUIRED` two steps later — a
> two-role round trip, which is the one thing Phase A exists to prevent. Two
> lines that cost nothing and save a day is a good trade, and you neither changed
> code nor asked to see his `.env` to make it.

> **answer to Q-BE-23 (Sober, 2026-08-24): no `tests { … }` blocks — your call is
> upheld, and record the reason so nobody re-adds them later.** His eight files do
> carry `tests`, and matching a house style is normally right; here it is not.
> Run A may legitimately end `NO_COMMITS` and Run B's *correct* outcome is
> `FAILED` — an assertion would paint a correct run red and send him asking us
> about a bug that does not exist. The DoD asked for `docs` and `docs` is what
> the evidence needs. Not to be revisited without a new instruction.

#### Q-SA-21 re-ruling — the human reversed me, so the `docs` blocks go Thai-led

Porter relayed the answer to my own question: **"ไทยหลัก อังกฤษรอง"** (REQ-001
`## Questions`, Q-SA-21). My English ruling is withdrawn. **This is not a defect
of yours** — you wrote English because I told you to, and DoD row 7 is met as
submitted; it is an instruction that arrived after you complied.

**The form, and it is ruled from evidence rather than guessed:** his own eight
`.bru` files in `project-docs/ai-api-center-bruno/` are exactly "ไทยหลัก
อังกฤษรอง" in practice — Thai prose, with English kept for every *name of a
thing*. So:

- **Thai prose** for the explanation: what the step is for, what to expect, what
  a failure means, what to do next.
- **English untouched** for identifiers and quoted material: endpoint paths,
  field names, status codes (`202`, `REPO_AUTH_FAILED`, `AUTH_REQUIRED`,
  `NO_COMMITS`), env vars, file paths, source-file citations, and every JSON or
  log-line sample. **Do not translate anything inside a fenced block.**
- **Nothing is lost and nothing is added.** Same facts, same order, same
  headings' meaning — a language pass, not a rewrite. The `curl` fallback, Steps
  1/5/6 and every request body stay **English and untouched**: PROTOCOL's English
  rule is unchanged and Porter read his answer narrowly (`docs` blocks only;
  the wider reading is his Q39, non-blocking).
- Six blocks: `POST Login`, `GET Me`, `POST Report - Run A`,
  `GET Report Status - Run A`, `POST Report - Run B`, `GET Report Status - Run B`.

Why the Thai lives **here** and not at Porter's relay: the `.bru` text reaches
him verbatim, so a translation made at hand-over would create a second source of
truth for the same file — the precise failure I refused when I froze the `curl`
block. One file, one text.

#### What happens next

@Jason: **one small unit — the Thai pass on the six `docs` blocks, and nothing
else.** Do not re-open a single accepted fact, command, body or citation; the
content is verified twice over now. Return the TASK to `REVIEW` when the pass is
in and I will check it against the rule above, not re-review the sheet.

The hand-over to @Porter goes out **with** that pass rather than before it: one
relay carrying the final form beats two relays and a correction. Phase B is
untouched and still not startable — `project-docs/` holds no evidence file.

### Review — Phase A Thai pass, Sober 2026-08-24: **ACCEPTED. Phase A is DONE and the sheet is FINAL.**

I checked the pass against the rule I set and against sources, not against your
description of it. It holds, and the specific risk of a fourth pass over a twice-
accepted sheet — a fact quietly changing shape in translation — **did not
happen.**

**The form is right, and I did not have to take that on trust.** I re-read his
own `project-docs/ai-api-center-bruno/GET Info.bru`: his heading is
`# ผลลัพธ์ที่คาดว่าจะได้ (200 OK)`. Yours is `## ผลลัพธ์ที่คาดว่าจะได้ (200 OK)`
— the same heading, character for character, at the right nesting level. Thai
prose, English on every name of a thing, JSON left alone. That is "ไทยหลัก
อังกฤษรอง" as he practises it, which is the only definition of it we have.

**Nothing outside the six blocks was opened — verified by diff, not by reading.**
The workspace repo tracks this file, so I diffed the working copy against
`4166722` and listed every deleted line again: **25 of them, and they sit in the
same six regions I recorded at the last review** — the status header, §"What to
do", Step 1, Step 5, the Step 6 table and Q-BE-14's "four". **No new deletion
region appeared.** Since the six `docs` blocks are themselves additions against
`4166722`, a pass that had reached into Steps 1/5/6, the `curl` fallback, the
§Questions or the §Review would have shown up here as a deletion. It did not. DoD
row 9 therefore still holds: the `curl` Steps 2, 3 and 4 are byte-identical to
the text I verified on 2026-08-21, now for the second time by measurement.

**Every fact the Thai now carries, re-derived from the code at `d1f0993` rather
than from the English it replaced** — this is the check that matters, because a
translation is where a number silently moves:

- `cr_session`, `HttpOnly`, `SameSite=Lax`, **12 ชั่วโมง** — `src/auth/session.ts`
  line 4 and line 20; `SESSION_TTL_SECONDS = 12 * 60 * 60` (line 29) feeds
  `maxAge` (line 97) and `exp` (line 58). Twelve hours is right.
- `QUEUED → RUNNING → DONE`, with `NO_COMMITS` and `FAILED` as the two non-`DONE`
  endings — `JOB_STATUSES` in `src/reports/jobs.ts` lines 48–54 is exactly those
  five, in that order. The Thai calls them "สองตอนจบที่ไม่ใช่ DONE" and there are
  exactly two.
- `REPORT_TIMEZONE` = `Asia/Bangkok` — `src/config.ts` line 81, as the default.
- 404 ⇒ `REPO_AUTH_FAILED` **on purpose**, not `REPO_NOT_FOUND` —
  `src/git/clone.ts` lines 99–102 and 117/123, and the Thai keeps the *reason*
  ("มีแต่ข้อความนั้นที่ครอบคลุมทั้งสองสาเหตุ"), which is the part that stops him
  reporting it as a bug.
- The ≤ **366**-day span, `2025-08-21 → 2026-08-21` = **365**, and the
  required/optional field split — unchanged from the `curl` text still sitting a
  few hundred lines below it in English. I compared the two forms line by line;
  they say the same thing.

**The count you gave is the count that is there.** Twenty-one headings across the
six blocks — 4 + 3 + 4 + 3 + 3 + 4 — and not one of them is still English apart
from the `Step N` label, which is Q-BE-24 and which I have upheld above. The six
fenced samples are still JSON with English keys; nothing inside a fence was
touched.

**Row 3 of the DoD survives the translation** ("nowhere asks for a secret / tells
him what not to paste back"): the Thai `POST Login` block still says the password
is his and that nobody on the team has it or wants it, and still tells him the
file is **not** one of the two Step 5 asks for.

**One observation, and it is deliberately NOT rework — I am not re-opening an
accepted sheet on my own initiative.** The `curl` fallback tells him to
`rm -f cr-cookies.txt` at Step 5; the Bruno form warns him that `POST Login.bru`
will hold his real password but never tells him to clear it afterwards. It is a
pre-existing asymmetry, it was accepted twice, and the file never leaves his
machine, so it costs nothing to leave the sheet alone. **It rides with the
hand-over as a spoken line for @Porter instead of an eleventh edit**, which is
cheaper than another round trip and does not create a second version of a file he
is about to paste.

#### What happens next

**@Jason: Phase A is DONE — nothing on TASK-014 is yours until his output lands.**
You do not poll for it and you start nothing else here. Phase B is ticked by
reading his paste; if it never arrives, that is Porter's problem to chase, not a
BE unit.

**@Porter: the sheet is out.** `## Implementation Notes` → "Phase A — runbook",
from "#### Runbook for the stakeholder" to "#### End of runbook", is final and
copy-pasteable as it stands. Six steps; Steps 2–4 are a Bruno collection he
creates from eight fenced blocks (Thai `docs`, per his own "ไทยหลัก อังกฤษรอง"),
with the `curl` form kept underneath as a labelled fallback. What comes back is
**one file** into `../project-docs/`, per Step 5. Two things to say to him in
Thai when you relay: (1) the sheet never asks for his password or his PAT and he
should not paste either back, and (2) `POST Login.bru` will contain his real
password once he types it in — worth deleting or blanking that line when he is
finished, which is the observation above.
