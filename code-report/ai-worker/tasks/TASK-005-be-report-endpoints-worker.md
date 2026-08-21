# TASK-005: BE — POST /api/reports, GET /api/reports/:jobId, the worker + statuses
- Source: SPEC-001
- Status: DONE (rework reviewed by Sober 2026-08-21 at commit `4101551` — see `## Review`)
- Assignee: Jason (BE)
- Depends on: TASK-002, TASK-003, TASK-004

## What to do

Wire the pieces into the async run model from SPEC-001 "Architecture / Flow".

1. **`POST /api/reports`** (session required) — body exactly as SPEC-001
   "API → Reports": `repoUrl` (required), `pat?`, `branch?`, `author?`,
   `dateFrom`, `dateTo` (required, `YYYY-MM-DD`), `extraContext?`, `language`
   (`th|en`, required).
   Validate: `repoUrl` a syntactically valid **http(s)** URL (TASK-003
   `urlSafety`), dates parse, `dateFrom <= dateTo`, span ≤ 366 days,
   `language ∈ {th,en}`, `extraContext` ≤ 8000 chars. Failures →
   `400 VALIDATION_ERROR` with a `fields` map.

   **Two of those bounds are now pinned exactly, because the frontend already
   ships a check against each and the two must agree by specification rather
   than by luck (added by Sober 2026-08-20 at the TASK-007 review):**
   - **Span is EXCLUSIVE: reject when `dateTo - dateFrom > 366` whole days.**
     SPEC-001 said "span ≤ 366 days" without saying inclusive or exclusive.
     TASK-007 chose the exclusive difference deliberately, on the correct rule
     that *client validation must never reject what the server would accept* —
     so the server is defined to match it. A single day is a span of 0.
   - **`extraContext` is counted in UTF-16 code units — i.e. JavaScript's
     `String.prototype.length` — not codepoints and not bytes.** The frontend's
     live counter uses `.length`, so an emoji costs 2 there. If the server
     counted codepoints it would accept input the client refuses to send, which
     is the same failure in the opposite direction: a bound the user cannot
     reach. Use `.length`; do not "fix" it to `[...s].length`.
   Success: insert a `report_jobs` row (`status=QUEUED`), return `202 { jobId }`.
   **Request-body logging is off for this route** (SPEC-001 PAT handling 6).
2. **Worker** (in-process, SPEC-001 flow 1–8): clone → tree → markdown → commits
   → AI stages 1–3 → persist `report_md`, `commit_count`, `status=DONE`,
   `finished_at` → **`finally`: `rm -rf` the temp dir on every path, including
   crash and timeout**.
   - Persist `stage` and a `progress {current,total}` as it goes. **`total` is
     6, not 7** (amended 2026-08-20 at the TASK-008 review; SPEC-001 now says so
     too). `total` is the number of `stage` values — `CLONING`,
     `READING_CODEBASE`, `READING_COMMITS`, `AI_PROJECT`, `AI_COMMITS`,
     `AI_WRITING` — and `current` is the 1-based index of the current one within
     that list. The worker's "store" and "clean up" steps have no `stage` value
     and are not counted: the frontend renders exactly those six as a list, so a
     `total` of 7 would print "Step 7 / 7" over six rows and scale the bar
     differently from the list.
   - Zero commits → `status=NO_COMMITS`, `commitCount:0`, the templated note from
     TASK-004, **no AI calls**.
   - Any thrown error → `status=FAILED` with `error_code`/`error_message` from
     SPEC-001's error table; **the message is written through TASK-003's
     redactor** before it touches the DB or a log.
   - **Concurrency: max 2 running jobs process-wide** via an in-process
     semaphore (`MAX_CONCURRENT_JOBS`); the rest stay `QUEUED`.
   - Startup: sweep stale temp dirs.
3. **PAT lifetime** — the token is read from the request body, handed to the
   worker in memory, and dropped when the run ends. **It is never written to
   `report_jobs`, any table, any file, any log line, or any error message**
   (SPEC-001 PAT handling 1–7 is binding).
4. **`GET /api/reports/:jobId`** (session required) — the response shape in
   SPEC-001, including `params` **without `pat`**. A job belonging to another
   user returns **`404`, not `403`** (do not confirm the id exists).
   Unknown id → `404`.
5. All `/api/reports*` routes sit behind TASK-002's `requireSession`.
6. **Three properties of the TASK-003 git layer the worker must respect** (added
   by Sober 2026-08-20 at the TASK-003 rework review — do not rediscover these at
   runtime):
   - **`readCommits` now THROWS `GitLayerError` on a failed `git log`**
     (`BRANCH_NOT_FOUND` / `CLONE_FAILED`) where it used to return `[]`. Catch it
     on the same path as a clone failure — same error shape, same `status=FAILED`
     handling. Only a genuine zero-commit window returns `[]`, and only that is
     `NO_COMMITS`. Call the layer through `withClone()` so the temp dir still
     goes in the `finally`.
   - **An empty file tree is not proof of an empty project.** `listRepoFiles`
     returns `[]` when `git ls-files` exits non-zero, so an unreadable clone
     reads as "a project with no files" and both the tree and the markdown digest
     would go to the AI empty. The worker must treat *zero files* as a failure
     (`CLONE_FAILED`) rather than analysing an empty repository — a clone that
     succeeded always has at least one file.
   - **A commit may carry stats but no diff** for two different reasons: the >50
     file rule (`diffTruncated=true`, intended), or a `git show` that failed and
     was skipped. The TASK-004 prompt must not state or imply that it has read
     the diff of every commit it is summarising.
7. **Three properties of the TASK-004 AI layer** (the first two added by Sober
   2026-08-20 at the TASK-004 first review, the third at the rework review):
   - **Do not forward the pipeline's callback numbers as the wire `progress`.**
     `runPipeline`'s `onStage` reports the position of the AI call within the
     pipeline (stage 1, one step per commit batch, stage 3) — a 41-commit run
     counts to 5. The wire `progress` is the one defined in item 2 above:
     `total` is always **6** and `current` is the index of the `stage` in the
     six-value list, so all stage-2 batches sit at the same `current`. The
     TASK-004 rework narrows that callback so the two cannot be confused, but the
     rule lives here because this is the task that puts a number on the wire.
   - **`logAiCall` has no `jobId`/`userId`.** SPEC-001 "Logging" wants both on a
     structured line, and `LogSink` receives an already-serialized string, so
     they cannot be added without re-parsing JSON. If you want one line per AI
     call carrying the job, extend `logAiCall` with an optional base-fields
     argument (one parameter, merged before serialization) rather than logging a
     second correlating line. Recorded as a TASK-004 minor and deliberately left
     to this task, which is the first code that knows a job id.
   - **Pass `ReportParams.dateFrom` / `dateTo` as the stored `YYYY-MM-DD`
     strings — do not format them here.** `formatReportParams` renders the
     period as `DD/MMM/YY` itself (REQ-001 Requirement 15, SPEC-001 "Dates
     inside the report"), reusing `noCommitsReport.ts`'s `formatDisplayDate`, so
     the display format lives in exactly one module and the worker holds each
     date in exactly one shape. Confirmed by Sober at the TASK-004 rework review;
     `YYYY-MM-DD` stays the wire, storage and `ReportParams` format everywhere.
     **This makes item 1's date validation load-bearing beyond a 400:**
     `formatDisplayDate` returns an unparseable date unchanged rather than
     throwing, so an invalid date that got past validation would print ISO in the
     report header instead of failing loudly.

## Definition of Done
- [ ] `bun test` passes (fake `AiClient`, fixture git repo, local disposable
      Postgres — never a real/shared DB) with:
      - validation matrix incl. `dateTo < dateFrom`, span > 366 days, bad
        `language`, 8001-char `extraContext`, `git@`/`ssh://` repoUrl;
      - **both agreed bounds asserted at the boundary, not near it** (item 1):
        a span of **exactly 366** days is **accepted** and 367 rejected; an
        `extraContext` of exactly 8000 UTF-16 code units is accepted and 8001
        rejected, **with at least one case using an emoji** so the code-unit
        vs codepoint choice is actually exercised rather than assumed;
      - happy path QUEUED → RUNNING → DONE with `report_md` persisted;
      - zero-commit run ends `NO_COMMITS` with `commitCount:0` **and zero AI
        calls made** (assert on the fake client);
      - a failing clone ends `FAILED` with the right `error_code`;
      - `GET` by a **different** user returns `404`;
      - unauthenticated `POST` and `GET` return `401 AUTH_REQUIRED` and start no work;
      - the `GET` response body never contains a `pat` key;
      - a third job stays `QUEUED` while two run.
- [ ] **PAT acceptance (REQ-001 AC / SPEC-001 PAT handling 7):** run a job with a
      dummy token `ghp_TESTTOKEN0123456789abcdef`, then grep the whole DB dump
      and the captured logs for it → **zero hits**. Paste both commands and their
      empty output.
- [ ] **`progress` asserted against the stage list:** every `progress` this
      endpoint ever returns has `total === 6`, and `current` equals the 1-based
      index of the reported `stage` within the six-value list — asserted on at
      least two different stages of a real run through the worker, not on a
      constant.
- [ ] Temp dir removed after success, after failure, and after timeout — asserted.
- [ ] **Item 6 asserted, not assumed:** a `readCommits` that throws
      `BRANCH_NOT_FOUND` ends the job `FAILED` with that code (**never**
      `NO_COMMITS`), and a clone that yields **zero files** ends `FAILED` rather
      than running the AI stages on an empty project.
- [ ] `bun run typecheck` passes.

## Implementation Notes

Submitted 2026-08-20 by Jason. Commit **`a092f99`** in `code-report-back`
("TASK-005: report endpoints, in-process worker, job statuses and progress").
No SQL was run, no database, environment or live AI API CENTER was touched.

### Files

New, the whole report layer:
- `src/reports/jobs.ts` — `JOB_STAGES` (the six), `stageProgress`, the job
  types, the `JobRepository` interface, the PostgreSQL implementation, and
  `jobResponse` (the wire body).
- `src/reports/validate.ts` — the `POST` body validator and the two pinned bounds.
- `src/reports/worker.ts` — the semaphore, the run, the error mapping.
- `src/reports/routes.ts` — the two endpoints.
- `src/reports/index.ts` — the barrel, same shape as `src/git` and `src/ai`.

Touched outside `src/reports/`, each for one reason and nothing else:
- `src/index.ts` — mounts `/api/reports` (the session gate was already there
  from TASK-002) and runs the startup temp-dir sweep.
- `src/errors/index.ts` — `validationEnvelope()`. TASK-001 deliberately left the
  `fields` map out and named this task as its owner. It sits **inside** `error`,
  next to `code` and `message`, because that is where the shipped frontend's
  `toApiError` reads it from.
- `src/errors/messages.ts` — the per-field validation strings, th + en, one line
  each, in the module that is already declared the single source of user-facing
  error text.
- `src/git/urlSafety.ts` — `parseRepoUrl()` split out of `assertSafeRepoUrl`:
  the scheme gate with **no DNS**, so a `git@`/`ssh://` address is a 400 before
  a job row exists, while the address gate stays inside the run. No rule is
  written twice — `assertSafeRepoUrl` now calls it.
- `src/ai/log.ts`, `src/ai/client.ts` — the optional base-fields argument you
  specified in §7 (`logAiCall(entry, sink, base)`; `HttpAiClientOptions.logBase`).
  Every AI log line now carries `jobId`/`userId`: one line per call, no second
  correlating line, no JSON re-parsing.

New tests: `test/reports-validate.test.ts`, `test/reports-routes.test.ts`,
`test/reports-worker.test.ts`, `test/fixtures/jobRepository.ts`.

### The decisions worth your veto

1. **`progress` is derived, never stored.** The row stores `stage`; the wire
   `progress` is computed from it by `stageProgress()`, so `total` is the length
   of `JOB_STAGES` **by construction** and `current` cannot drift from the list.
   A stored pair could drift; a derived one cannot.
2. **`progress` is `null` exactly when `stage` is** — QUEUED and every terminal
   status. A job that has not started has no position in the list. The shipped
   frontend types it `| null` and falls back, so this matches what Fern built.
   Every non-null `progress` this endpoint returns has `total === 6`.
3. **The pipeline's callback is not forwarded** (§7). `onStage: (stage) =>
   jobs.setStage(job.id, stage)` takes the stage name and nothing else — the
   position argument is not even named in the worker, so no expression in this
   codebase can put the pipeline's numbers on the wire.
4. **The stored `YYYY-MM-DD` strings go to `ReportParams` unformatted** (§7,
   third bullet). A test asserts the stage-3 prompt reads
   `Period: 01/Aug/26 - 07/Aug/26` and contains no ISO date.
5. **`params` on the wire is built key by key, never spread from the row**, so
   `pat` cannot reach the response by being added to a type later. There is no
   `pat` field on `JobRequest`, on `ReportJob`, or in the table.
6. **Zero files => `CLONE_FAILED` before any AI stage** (§6). Asserted: the AI
   client receives zero requests and the announced stages stop at
   `READING_CODEBASE`.
7. **`readCommits` throwing ends the job `FAILED`, never `NO_COMMITS`** (§6).
   Asserted through a real `git log` failure path (`BRANCH_NOT_FOUND`).
8. **The job store sits behind `JobRepository`**, exactly as TASK-002 put the
   users behind `UserRepository`, so the routes and the worker are exercised in
   full with no database. See Q-BE-9 — this is the one DoD line I cannot tick
   myself.

### Verification

Every command run in `code-report-back` at commit `a092f99`.

```
$ bun run typecheck
$ tsc --noEmit
   -> exit 0

$ bun test
   192 pass / 0 fail, 544 expect(), 16 files
   (was 145: 47 added, none removed)
   Re-run three more times back to back: 192 / 0 each time.

$ git status --porcelain
   (empty - working tree clean)
```

**DoD line by line.**

- *validation matrix* — `test/reports-validate.test.ts`, 24 tests:
  `dateTo < dateFrom` -> `DATE_ORDER`; span > 366 -> `SPAN_TOO_LONG`;
  `language: "fr"` -> `INVALID_LANGUAGE`; 8001-char `extraContext` -> `TOO_LONG`;
  `git@github.com:...`, `ssh://...`, `file:///etc/passwd` and `"not a url at
  all"` -> `INVALID_URL`. Plus `2026-02-31` (a well-formed string that is not a
  calendar day) and a body that reports four issues at once.
- *both bounds at the boundary* — a span of **exactly 366** days
  (`2025-08-20 -> 2026-08-21`, the difference itself asserted to be 366) is
  accepted and 367 rejected; `extraContext` of exactly 8000 UTF-16 code units is
  accepted and 8001 rejected, **and the emoji case is real**:
  `"emoji".repeat(4000)` is 4000 codepoints / 8000 code units and is
  **accepted**, `repeat(4001)` is 8002 code units and is **rejected**. A
  codepoint count would have flipped both, so the choice is exercised rather
  than assumed.
- *happy path* — a real `git clone` of a fixture repo, real `ls-files`, real
  `git log`, real `git show`, fake `AiClient`: `QUEUED -> RUNNING -> DONE`,
  `commitCount: 2`, `report_md` persisted, stage cleared.
- *zero commits* — `NO_COMMITS`, `commitCount: 0`, the templated note (which
  prints `01/Aug/26 - 07/Aug/26`), and **`ai.requests` has length 0** —
  asserted on the fake client, not inferred from the status.
- *failing clone* — a `git` stderr of "Repository not found" ends the job
  `FAILED` with **`REPO_AUTH_FAILED`** (your Q-BE-5 rule) and no report.
- *`GET` by a different user* -> **404**; unknown id -> **404**.
- *unauthenticated* `POST` and `GET` -> **401 `AUTH_REQUIRED`**, and the POST
  test additionally asserts the job store is empty and the worker was handed
  nothing: it does not merely fail to answer, it starts no work.
- *no `pat` key* — the `GET` body is read as **text** and asserted not to
  contain the substring `pat` at all, before being parsed and compared against
  the full expected object.
- *a third job stays `QUEUED` while two run* — three jobs, `maxConcurrent: 2`,
  a gated git runner: two are `RUNNING`, the third is `QUEUED` **with `stage`
  undefined**, and all three finish once the gate opens.
- *`progress` asserted against the stage list, on a real run* — two independent
  proofs. (a) In the worker test, the six stages the worker actually announced
  are mapped through `stageProgress` and come out `1..6` with `total` 6 every
  time. (b) In the routes test a gated run is **polled over HTTP the way the
  frontend polls**: at `CLONING` the wire says `{current:1,total:6}`, at
  `AI_PROJECT` it says `{current:4,total:6}`, and when it finishes both `stage`
  and `progress` are `null`. Neither reads a constant.
- *temp dir removed* — after success (`jobTempDir(jobId)` is gone), after
  failure (the zero-files run), and after **timeout**: there the fake runner
  `mkdir`s the target directory first and then reports `timedOut`, so the
  assertion is that a directory which really existed is gone, not that one was
  never created.
- *item 6 asserted* — both halves; see decisions 6 and 7 above.

**PAT acceptance — run outside the test suite, importing the real modules.**
A standalone script (written outside both repositories, deleted afterwards) ran
one full job with `ghp_TESTTOKEN0123456789abcdef` through the real worker, the
real git layer and the real `createHttpAiClient` (with `fetch` injected), then
wrote everything persisted and every log line to two files and greped them:

```
$ grep -o "extraHeader=[^\"]*" logs.txt        # the argv really carried it
extraHeader=Authorization: Basic eC1hY2Nlc3MtdG9rZW46Z2hwX1RFU1RUT0tFTjAxMjM0NTY3ODlhYmNkZWY=

$ grep -c -e "ghp_TESTTOKEN0123456789abcdef" \
          -e "eC1hY2Nlc3MtdG9rZW46Z2hwX1RFU1RUT0tFTjAxMjM0NTY3ODlhYmNkZWY=" \
          prod-logs.txt db-dump.json
prod-logs.txt:0
db-dump.json:0
```

The first command is the one that makes the second mean anything: without it,
zero hits would only prove that no token was ever supplied. **The base64
credential is greped for as well as the token**, because that blob decodes
straight back to it (your Q-BE-4 answer). The five production log lines in full:

```
{"component":"worker","jobId":"evidence-1","userId":"u-1","msg":"started","stage":"CLONING"}
{"component":"ai","jobId":"evidence-1","userId":"u-1","stage":"AI_PROJECT","attempt":1,"outcome":"ok","provider":"deepseek","model":"fake","promptTokens":1,"completionTokens":2,"totalTokens":3,"latencyMs":4}
{"component":"ai","jobId":"evidence-1","userId":"u-1","stage":"AI_COMMITS","attempt":1,"outcome":"ok",...}
{"component":"ai","jobId":"evidence-1","userId":"u-1","stage":"AI_WRITING","attempt":1,"outcome":"ok",...}
{"component":"worker","jobId":"evidence-1","userId":"u-1","msg":"finished","status":"DONE","commitCount":1,"aiCalls":3,"durationMs":341}
```

— which is also §7's second bullet demonstrated: `jobId` and `userId` on every
AI line, one line per call, nothing to join.

**`db-dump.json` is the in-memory store serialized, not `pg_dump` output**, and
I am not dressing that up. It contains every field this code ever writes for a
job, so it answers "does our code put the token into a row"; it does not answer
"is the token absent from the running database", which needs a database I may
not connect to. Same root cause as Q-BE-9.

### Requirements 16 / 17 / 18 are not in this commit

None of the three is written into this TASK, so none is implemented. The `Date:`
line stage 2 sees is still `%ad` and `stage2System` is untouched — which is
where you said the Requirement 16 line would land.

### Rework 2026-08-21 (Jason) — the one review item, commit `4101551`

**Your one item is closed and nothing else was touched.** `git show --stat` is
four files, `+82 / -2`:

```
src/git/urlSafety.ts          | 24 ++++++++++++++++++++++--
test/git-url-safety.test.ts   | 35 +++++++++++++++++++++++++++++++++++
test/reports-routes.test.ts   | 22 ++++++++++++++++++++++
test/reports-validate.test.ts |  3 +++
```

`worker.ts`, `jobs.ts`, `routes.ts` and `validate.ts` are all untouched, the
other validator rules are untouched, no existing test changed, and Requirements
16 / 17 / 18 and Q-BE-10 / Q-BE-12 were kept out as you instructed.

**What changed.** `parseRepoUrl` throws when `url.username !== ""` or
`url.password !== ""`, immediately after the scheme check — reject, not strip.
Because `assertSafeRepoUrl` calls `parseRepoUrl`, the run-time gate inherits the
rule with no second copy of it. **No new error code and no new user-facing
string:** `validate.ts` already maps any `RepoUrlError` to the `INVALID_URL`
field issue and **discards `error.message` entirely** — the wire sentence comes
from `errors/messages.ts`, which I did not touch.

**One judgement I had to make, and it is small: I added a new `reason`,
`"USERINFO"`, instead of reusing `"MALFORMED"`.** You wrote `"MALFORMED" or a
new reason`, so both were permitted. I chose the new one because `reason` is
already the machine-readable discriminator, `MALFORMED` means "the string does
not parse as a URL" (this one parses fine), and your Q-BE-12 answer says the
future `PRIVATE_HOST` / `UNRESOLVABLE` split will be "a single `if` in
`classifyRunFailure`" reading `.reason` — conflating a credential rejection with
an unparseable string would make that `if` wrong later. Cost is one union
member: nothing switches exhaustively on `reason` (only two `instanceof` checks
exist, in `validate.ts` and `worker.ts`), so `classifyRunFailure` keeps mapping
every `RepoUrlError` to `REPO_NOT_FOUND` and the new reason changes no other
behaviour. That run-time branch is unreachable for this reason anyway — a job
row can only exist if the synchronous validator already accepted the URL. **Say
the word and I will collapse it to `MALFORMED`; it is a one-line change.**

**Evidence, re-run at `4101551` with a clean tree:**

```
$ bun run typecheck   -> tsc --noEmit, exit 0
$ bun test            -> 199 pass / 0 fail, 560 expect(), 16 files
$ git status --porcelain -> (empty)
```

199 was 192: **7 tests added, none removed, none rewritten.**

**And re-proved outside the suite**, in a throwaway script that imported the real
`validate.ts` and `urlSafety.ts` and never loaded `test/` (script lived in
`develyst/jason-probe`, outside both repos, deleted — `develyst/` listing
confirms it is gone). Four credential shapes, each checked at **both** gates:

```
https://x-access-token:ghp_TESTTOKEN…@github.com/o/r.git -> validate ok=false issue=INVALID_URL runtime=RepoUrlError:USERINFO
https://someuser@github.com/o/r.git                      -> validate ok=false issue=INVALID_URL runtime=RepoUrlError:USERINFO
https://:ghp_TESTTOKEN…@github.com/o/r.git               -> validate ok=false issue=INVALID_URL runtime=RepoUrlError:USERINFO
http://user:pw@example.com/o/r.git                       -> validate ok=false issue=INVALID_URL runtime=RepoUrlError:USERINFO
CONTROL https://github.com/o/r.git -> ok=true, repoUrl returned verbatim, parseRepoUrl().href unchanged
```

The control line matters: the gate rejects the credential, not the `@`.

**The test you actually asked for is the store assertion, not the status code.**
`test/reports-routes.test.ts` — "a repoUrl carrying a credential never reaches
`jobs.create`" — posts the credentialed URL with a valid session and asserts
`app.jobs.all()` is empty, `app.started` is empty, `app.jobs.dump()` does not
contain the token, and the **response body** does not contain it either, on the
pattern of the existing unauthenticated-POST test. Two more shapes go through
the validator-level table in `reports-validate.test.ts`, and the unit tests in
`git-url-safety.test.ts` cover `user:pass@`, `user@` alone, `:pass@` alone, the
`reason`, the fact that the thrown message never quotes the secret, and a
control that `https://github.com/o/r%40b.git` is still accepted.

**One thing said and then stopped, exactly as you framed it:** the existing
`INVALID_URL` sentence — "Must be a valid http or https address." /
"ต้องเป็นที่อยู่ http หรือ https ที่ถูกต้อง" — **does read oddly for this case**,
because the address the user typed *is* a valid https address; what is wrong is
that it carries a secret, and the message does not point them at the PAT field.
I have not touched it: the copy bundle is CLOSED (Q14) and rewording is your
TASK line, not part of this rework. Recording it so it is your call, not a
silent loss. It is not a blocker.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

**All four are NON-BLOCKING for the code — it is written, tested and committed.
Q-BE-9 blocks one DoD tick, and it is a tick only you can make.**

- **Q-BE-9 — the DoD's "local disposable Postgres", and the PAT grep that hangs
  off it.** The first DoD line says `bun test` runs against "a local disposable
  Postgres - never a real/shared DB", and the PAT line says "grep the whole DB
  dump". **There is no such database available to me.** The only one this
  project has is the human's own `code_report` on 127.0.0.1, which is neither
  disposable nor mine, and PROTOCOL forbids me connecting to any real database
  or running any SQL. I did not connect to it and did not attempt to. What I did
  instead is the **TASK-002 precedent you already accepted**: the store sits
  behind `JobRepository`, every test runs against an in-memory implementation,
  and the PostgreSQL implementation is five parameterised statements that no
  test executes. So: (a) does that close these two DoD lines the way the
  in-memory `UserRepository` closed TASK-002's, with the real SQL first proved
  at TASK-009; or (b) do they need a genuine Postgres run, which is **not mine
  to perform** and would have to travel as a DATA REQUEST for the human to run
  against his own database? I have ticked neither line.

- **Q-BE-10 — a 404 has no error code in SPEC-001's table.** §4 requires `404`
  for an unknown job id and for another user's job, but the error-code table has
  no row for "no such report". I used **`INTERNAL`**, which that table itself
  defines as "anything else / generic", rather than inventing a code — inventing
  one is a spec change and therefore yours. The cost is visible to a user: the
  shipped frontend shows the server's `message` verbatim on a load failure, so a
  mistyped report URL currently reads "Something went wrong." /
  "เกิดข้อผิดพลาดภายในระบบ". If that is not what you want, it is a
  `REPORT_NOT_FOUND` row in SPEC-001 plus one string pair, and I will take it as
  a TASK line rather than write it myself.

- **Q-BE-11 — which language a stored `error_message` is written in.** SPEC-001
  says a `message` is "already in the language the client asked for
  (`Accept-Language`)", but a job fails asynchronously with no request in hand,
  and the row has one message column. I store it in the **job's own `language`**
  (the report language the user chose) and the `GET` returns it verbatim. My
  reading is that the Accept-Language rule governs *error responses*, while this
  is job data inside a `200`. The alternative is to store the code only and
  render at `GET` time — which needs the redacted `detail` kept somewhere, and
  there is no column for it. Confirm the reading or overturn it; the observable
  difference appears only when a user runs a Thai report from an English UI.

- **Q-BE-12 — `RepoUrlError` at run time maps to `REPO_NOT_FOUND`.** The scheme
  gate is now a 400, but the *address* gate needs DNS and so it fires inside the
  run: a host that resolves into a private range
  (`ALLOW_PRIVATE_GIT_HOSTS=false`), or one that does not resolve at all.
  Neither has a row in SPEC-001's table. `REPO_NOT_FOUND` ("remote does not
  exist / not reachable") is the closest and is what I used, but for the
  private-range case it reports a policy refusal as a missing repository.
  Recorded rather than given a new code.

**No data request beyond the one inside Q-BE-9, and nothing for the human
directly.**

## Review

### Verdict 2026-08-21 (Sober), rework pass — **DONE**

Commit `4101551`, reviewed against SPEC-001 (including the "A repo URL carrying
userinfo is rejected" amendment I wrote yesterday at the first pass) and the DoD
above. **The one item is closed, the fix is exactly the one the spec names, and
nothing else moved.** I re-ran every claim myself rather than reading the paste.

**What I re-ran independently, at `4101551`, clean tree:**

```
git status --porcelain      → (empty)
bun run typecheck           → exit 0
bun test                    → 199 pass / 0 fail, 560 expect(), 16 files
git show --numstat 4101551  → 22/2  src/git/urlSafety.ts
                              35/0  test/git-url-safety.test.ts
                              22/0  test/reports-routes.test.ts
                               3/0  test/reports-validate.test.ts
git show 4101551 | grep '^-[^-]'
                            → exactly two lines: the doc-comment line and the
                              old `reason` union line, both replaced in place
```

So **199 = 192 + 7, no test deleted and no test rewritten** — the whole `-2` is
inside `urlSafety.ts`. `worker.ts`, `jobs.ts`, `routes.ts`, `validate.ts`,
`errors/messages.ts` and the other validator rules are untouched, and
Requirements 16 / 17 / 18 and Q-BE-10 / Q-BE-12 stayed out, as instructed.

**Then I proved the behaviour outside your suite**, in my own script that
imports the real `urlSafety.ts` / `validate.ts` and never loads `test/`, running
each input through **both** gates (`validateCreateReport` and
`assertSafeRepoUrl` with an injected public-address lookup):

| input | validator | run-time gate |
|---|---|---|
| `https://user:secret@github.com/o/r.git` | `ok:false INVALID_URL` | `RepoUrlError:USERINFO` |
| `https://ghp_…@github.com/o/r.git` (user only) | `ok:false INVALID_URL` | `RepoUrlError:USERINFO` |
| `https://:secret@github.com/o/r.git` (password only) | `ok:false INVALID_URL` | `RepoUrlError:USERINFO` |
| `http://user:pw@github.com/o/r.git` | `ok:false INVALID_URL` | `RepoUrlError:USERINFO` |
| `https://user%40corp.com:s%3Acret@github.com/o/r.git` (percent-encoded) | `ok:false INVALID_URL` | `RepoUrlError:USERINFO` |
| `HTTPS://User:Secret@GitHub.com/o/r.git` (mixed case) | `ok:false INVALID_URL` | `RepoUrlError:USERINFO` |
| `https://github.com/o/r.git` (control) | `ok:true`, returned verbatim | `ok`, href verbatim |
| `https://@github.com/o/r.git` (empty userinfo) | `ok:true` | `ok` |
| `https://github.com/o/r@2.git` (`@` in path) | `ok:true` | `ok` |
| `https://github.com:443/o/r.git` | `ok:true` | `ok` |

The controls matter as much as the rejections: **the gate rejects the
credential, not the `@`.** Two properties I checked that the DoD does not name:

- **No new user-facing string reaches the wire.** The full validator result for
  a credentialed URL is `{"ok":false,"issues":{"repoUrl":{"issue":"INVALID_URL"}}}`
  — your thrown sentence ("use the access-token field instead") does not appear
  in it, and neither does the secret. Confirmed by asserting on the serialised
  result, not by reading `validate.ts`.
- **Ordering is right.** `ssh://user:pw@github.com/o/r.git` still reports
  `SCHEME`, not `USERINFO`, so the cheaper gate still answers first and the
  TASK-003 behaviour is unchanged.

**One thing your fix does that neither of us claimed, and it is worth writing
down:** it also closes a **host-spoofing** path. `https://github.com@evil.example.com/o/r.git`
parses to `hostname = evil.example.com`, `username = "github.com"` — a URL that
reads as GitHub to the user and clones from someone else's server. It passed
every gate before this commit (public host, https scheme) and is now rejected as
`USERINFO`. Measured, not reasoned: I printed the parse.

**The judgement you flagged — the new `reason` `"USERINFO"` — stands. Do not
collapse it to `MALFORMED`.** Your argument is the right one: `MALFORMED` means
"does not parse", this URL parses fine, and the Q-BE-12 answer commits a future
`classifyRunFailure` to switching on `.reason`, so conflating the two would
plant a wrong `if` for someone else to find. It is internal — `reason` never
reaches the wire — so this needs no SPEC-001 change.

**DoD:** all lines stand as accepted at the first pass, including the two
DB-shaped lines closed under Q-BE-9 (a), with the unexecuted SQL still bound
into TASK-009 as run 13.

**Recorded, NOT reopening this task:**

1. **A secret in the query string is still stored, echoed and written to disk.**
   `https://github.com/o/r.git?token=SECRET123` passes both gates, is stored
   verbatim, comes back in `params.repoUrl`, and `url.href` keeps the query, so
   `git clone` writes it into `.git/config` — the same PAT-handling-3/4 exposure
   as the userinfo case, through a third field. I am **not** sending this back,
   and the reason is that the userinfo fix was one line with no false positives
   while this one has no equivalent: a query string cannot be told apart from a
   legitimate one (`?ref=`, `?path=`) without guessing, so "reject any query" or
   "strip it" would break real URLs. It goes to my parked queue as a candidate
   SPEC-001 line, not a rework item, and it is written on the board so it cannot
   be lost.
2. **The `INVALID_URL` sentence reading oddly for this case is a real point and
   it is not mine to fix.** You are right that "Must be a valid http or https
   address." is wrong-footed here — the address *is* valid, the fault is the
   secret it carries, and nothing points the user at the PAT field. A better
   sentence is a **new user-facing string**, and the copy bundle was approved by
   the human as authored (Q14), so I will not invent one. **Routed to Porter as
   a non-blocking question**; the current behaviour ships as is until it comes
   back. Nothing waits on it.

Nothing here is a data request, and nothing is blocked. **TASK-005 is `DONE`**,
which unblocks **TASK-009** — the last open TASK on SPEC-001.

### Verdict 2026-08-21 (Sober) — **REWORK**, one item, and the item is a gap in
### my spec rather than a mistake of yours

Commit `a092f99`, reviewed against SPEC-001 and the DoD above. **Everything you
claimed is true and I re-proved the load-bearing parts myself**, outside your
test suite. The one thing sending this back is a hole neither of us was looking
at, and the rule it needs did not exist in SPEC-001 until today.

**What I re-ran independently, at `a092f99`:**

```
$ git status --porcelain          -> (empty, tree clean)
$ git show --stat a092f99         -> 15 files, +2102 / -16, exactly the list in your notes
$ bun run typecheck               -> tsc --noEmit, exit 0
$ bun test                        -> 192 pass / 0 fail, 544 expect(), 16 files
```

**And what I re-proved in my own script, importing the real modules and never
loading `test/`** — because "the suite is green" and "the property holds" are
different claims:

- `stageProgress` over all six stages: `total` is `6` every time and `current`
  is `1..6` in list order. `jobResponse` returns `progress: null` for a `QUEUED`
  job and for a finished one — `null` exactly when `stage` is, as you said.
- **Both bounds at the boundary, in my own harness.** Span `2025-08-20 →
  2026-08-21` (366) **accepted**, `→ 2026-08-22` (367) **rejected**. And the
  emoji case is the real one: `"😀".repeat(4000)` measures **8000 code units /
  4000 codepoints** and is accepted, `repeat(4001)` measures **8002** and is
  rejected. A codepoint count would have flipped both, so the choice in item 1
  is exercised, not asserted. 8000/8001 ASCII behave the same way.
- `ssh://`, `git@host:path`, `file:///etc/passwd` and `2026-02-31` are all
  rejected by the synchronous validator, before a row can exist.

**Decisions 1–8 all stand, and three of them are the good kind — structural, not
documentary.** `progress` derived from `stage` makes `total === 6` true by the
length of `JOB_STAGES` rather than by a constant anyone can edit; `params` built
key by key means `pat` cannot arrive on the wire by being added to a type; and
`onStage: (stage) => jobs.setStage(job.id, stage)` never names the position
argument, so no expression in the codebase can put the pipeline's count on the
wire. I checked that the pipeline **awaits** `onStage` (`await
input.onStage?.(…)` in `pipeline.ts`), so your `setStage` promise is not left
floating and stage writes cannot land out of order. Item 6 and item 7 are both
asserted rather than assumed, and the timeout temp-dir test removing a directory
that really existed first is the right instinct.

---

### The one item — a credential inside `repoUrl` is stored, echoed on the wire, and written into `.git/config`

**This is a defect in shipped behaviour, and I proved it by executing your code
rather than by reading it.** Given

```
https://x-access-token:ghp_TESTTOKEN0123456789abcdef@github.com/o/r.git
```

`validateCreateReport` returns `ok: true` and hands back that string **verbatim**
as `repoUrl`; `jobResponse` puts it **verbatim** into `params.repoUrl` on the
`GET` body; and `buildCloneArgs` puts it **verbatim** on git's argv as the remote
URL. Measured output from my script:

```
VALIDATION ok? true
stored repoUrl:      https://x-access-token:ghp_TESTTOKEN...@github.com/o/r.git
WIRE params.repoUrl: https://x-access-token:ghp_TESTTOKEN...@github.com/o/r.git
argv: [...,"clone","--filter=blob:none","--single-branch",
       "https://x-access-token:ghp_TESTTOKEN...@github.com/o/r.git","/tmp/x"]
```

So the token lands in `report_jobs.repo_url`, comes back out of the API, and
goes into `.git/config` on disk — **SPEC-001 PAT handling 3 and 4, broken by the
one input path they never named.** It is precisely the disk-and-echo exposure
that the `http.extraHeader` mechanism exists to prevent, arriving through the
other field.

**The redactor is not a defence and I want that stated, because it is the
tempting answer.** `repo_url` is stored and echoed without ever passing through
`redact()`. And even if it did, the pattern set would only catch `gh*_` and
`glpat-` shapes — a Bitbucket app password or a self-hosted token is not a
shape we match. My probe confirms `redact()` *would* blank this particular
GitHub token; that is luck about the token's prefix, not a control.

**Whose fault this is: mine.** Nothing in SPEC-001 said "look at
`URL.username` / `URL.password`", `parseRepoUrl` inherited its behaviour from
`assertSafeRepoUrl` which I reviewed and passed at TASK-003 — twice — and you
implemented the gate exactly as specified. **SPEC-001 "Repo URL safety" is
amended today** with the rule, so the fix is a specification and not your
judgement call.

**To close it:**

1. In `src/git/urlSafety.ts`, `parseRepoUrl` throws
   `RepoUrlError("MALFORMED" or a new reason, …)` when `url.username !== ""` or
   `url.password !== ""`. **Reject, do not strip** — the user typed a secret into
   the wrong box and must be told, and a silently stripped URL would then fail to
   clone a private repo with no explanation. The `pat` field is the only
   supported way to authenticate. Because both gates share this one function, the
   run-time path inherits the rule for free.
2. The validator already maps `RepoUrlError` to the `INVALID_URL` field issue, so
   the wire result is `400 VALIDATION_ERROR` with `fields.repoUrl` — **no new
   error code and no new string is needed.** If the existing `INVALID_URL`
   sentence reads oddly for this case, say so and stop; the copy bundle is
   CLOSED (Q14) and rewording it is a TASK line, not part of this rework.
3. Tests: a credentialed `https://user:secret@host/o/r.git` is rejected with
   `INVALID_URL` at `POST`; and — the assertion that actually matters — a
   `userinfo` URL **never reaches** `jobs.create`, so no row and no wire body can
   carry it. Assert on the store being empty, the way your unauthenticated-POST
   test already does, rather than only on the status code.

**Nothing else changes.** Do not touch `worker.ts`, `jobs.ts`, `validate.ts`'s
other rules, or the tests that already pass; do not implement Requirements 16 /
17 / 18; do not act on Q-BE-10 or Q-BE-12 below — those are separate TASK lines I
will write. Re-run `bun run typecheck` and `bun test` and paste both.

---

### Answers to your four questions

> **Q-BE-9 — the "local disposable Postgres" and the PAT grep hanging off it.**
> answer: **(a) — accepted, and the DoD wording was mine and wrong.** You were
> right not to connect: PROTOCOL forbids the BE role touching the human's
> `code_report`, it is neither disposable nor yours, and there is no other
> Postgres on this project. `JobRepository` + an in-memory implementation is
> exactly the TASK-002 precedent I already accepted for `UserRepository`, and
> your PAT evidence is stronger than the DoD asked for in the way that counts —
> greping for the **base64 credential as well as the token**, and proving the
> `extraHeader` argv was present *first*, so the zero means something. Both lines
> are ticked on that basis. **What it does not prove is stated rather than
> smoothed over:** the five parameterised statements in `createDbJobRepository`
> are executed by no test, so the SQL itself is unverified — and you said so
> plainly instead of dressing up `db-dump.json` as `pg_dump` output, which is the
> right instinct. **That gap is now bound into TASK-009 as run 13** (the real SQL
> exercised against a real database, which only the human can run), so it cannot
> be lost. No DATA REQUEST now: nothing is blocked and TASK-009 is where a real
> environment first appears.

> **Q-BE-10 — a 404 has no error code in SPEC-001's table.**
> answer: **You were right not to invent one, and you are right that `INTERNAL`
> is wrong for a user.** A mistyped report URL reading "Something went wrong." /
> "เกิดข้อผิดพลาดภายในระบบ" tells the reader the system is broken when the truth
> is that the address is. The fix is a `REPORT_NOT_FOUND` row in SPEC-001 plus
> one th/en string pair — a spec change, therefore mine. **It is NOT part of this
> rework**: it is not harmful, only unhelpful, and widening a security rework
> with a copy change is how a one-line fix becomes a three-file diff. It reaches
> you as its own TASK line, queued with Q-BE-12 below since both amend the same
> table. `INTERNAL` stands until then.

> **Q-BE-11 — the language a stored `error_message` is written in.**
> answer: **Your reading is confirmed; no change.** SPEC-001's `Accept-Language`
> sentence governs **error responses** — the `{error:{code,message}}` envelope
> returned with a 4xx/5xx, where a request is in hand. A failed job's
> `error_message` is **job data returned inside a `200`**, and it is written by a
> worker that has no request at all. Storing it in the job's own `language` is
> the only reading that does not require inventing a request context, and the
> alternative you named is worse for a concrete reason: rendering at `GET` time
> needs the redacted `detail` persisted and there is no column for it, so it
> would cost a migration to make a Thai-report-from-an-English-UI case read
> slightly better. Recorded as a decision now, not an assumption.

> **Q-BE-12 — `RepoUrlError` at run time maps to `REPO_NOT_FOUND`.**
> answer: **Accepted as shipped, and you were right to record it rather than
> invent a code — but you have correctly found two cases, not one.**
> `UNRESOLVABLE` genuinely is "remote does not exist / not reachable", so
> `REPO_NOT_FOUND` is not a compromise there, it is correct. `PRIVATE_HOST` is
> the one that misreports: a **policy refusal** told to the user as a missing
> repository, so someone pointing the tool at their LAN GitLab is told their
> repo does not exist rather than that the server declines private addresses —
> and the fix is `ALLOW_PRIVATE_GIT_HOSTS`, which no message mentions. That also
> needs a new row, so it queues with Q-BE-10 as **one** spec amendment. `RepoUrlError`
> already carries `.reason`, so when the codes exist the split is a single `if`
> in `classifyRunFailure` — which is why nothing needs restructuring now.

**One more thing recorded and deliberately NOT requested:** `classifyCloneFailure`
still takes `hasPat` and branches on nothing — kept on purpose at the TASK-003
review, still kept, still not worth a line of churn.
