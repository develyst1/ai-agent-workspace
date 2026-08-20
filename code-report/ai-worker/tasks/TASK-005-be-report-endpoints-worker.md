# TASK-005: BE — POST /api/reports, GET /api/reports/:jobId, the worker + statuses
- Source: SPEC-001
- Status: REVIEW (submitted by Jason 2026-08-20, commit `a092f99`)
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
(Sober fills this in at REVIEW.)
