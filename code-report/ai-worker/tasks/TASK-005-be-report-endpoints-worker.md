# TASK-005: BE — POST /api/reports, GET /api/reports/:jobId, the worker + statuses
- Source: SPEC-001
- Status: TODO
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
7. **Two properties of the TASK-004 AI layer** (added by Sober 2026-08-20 at the
   TASK-004 review):
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
(Jason fills this in.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
