# TASK-032: Unhandled errors are logged without their data fields
- Source: SPEC-001 §7 (no secrets or message text in logs) · SA-B's note in TASK-012 Notes (2026-11-01): `handleError` logs the
  whole thrown error, and a Postgres error's `detail` can carry row values (e.g. `Key (email)=(x@y) already exists`, a live
  LINE link code)
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-01)
- Depends on: — (low priority: take it after any open TASK of yours)

- Repo: `corner-chat-back` — Team A claim · git writes: **none**
- Files you may edit (closed list): `src/core/errors.ts`, `test/errors.test.ts` (new)

## What to do
1. `handleError`, for anything not an `ApiError`: stop logging the thrown object. Log one line,
   `Unhandled error: <name> <code?> <message>`, plus the stack's file:line frames. `code` is the PG error code (`errno` / `code`)
   when present.
   **Never** log `detail`, `where`, `query`, parameters, `cause` or the object itself.
2. The answer to the client is unchanged: 500 `INTERNAL`.

## Definition of Done (paste real output)
- [ ] `test/errors.test.ts`: throw an error whose `detail` is `Key (email)=(secret@example.test) already exists`, with
      `code: "23505"`. The captured `console.error` output contains `23505`, but **not** `secret@example.test` and **not**
      `detail`. A plain `Error("boom")` → the line contains `boom`. Both answer 500 `INTERNAL`.
- [ ] Whole tree `bun run test` green · `tsc --noEmit` 0 · `git status` → the closed list only.

## Implementation Notes
Test-first (RED: 6 of the 8 tests failed on the old handler — the other two passed: the unchanged `ApiError` path, and "class name and errno are kept", which passes on the old code only because it dumped the whole object — then GREEN after one test-premise fix, below). Working tree only, no git. 2026-11-01. No server was started; the one live check is a throwaway database that is dropped.

**What changed (closed list; nothing else):** `src/core/errors.ts` and the new `test/errors.test.ts`.
- `handleError` no longer logs the thrown object. For anything that is not an `ApiError` it logs **one line** built by a new exported `describeUnhandled(err)`: `Unhandled error: <name> <codes…> <message> | at <file:line> < <file:line> …`.
  - `codes` = `code` and `errno` when each is a string or number, de-duplicated (the SQLSTATE, e.g. `23505`, sits in `errno` on Bun's `PostgresError` and in `code` on a node-postgres-style error — both are covered).
  - The message is collapsed to one line (whitespace runs → one space) and capped at 500 characters. Frames are the stack's `at …` lines reduced to `file:line:col` (paths relative to the working directory, at most 8); the stack's own first line (which repeats the message) is dropped.
  - **Never logged:** `detail`, `where`, `query`, parameters, `cause`, any other field, or the object itself.
- The client's answer is unchanged: 500 `{ error: { code: "INTERNAL", message: "Internal server error" } }`; an `ApiError` is untouched and logs nothing.

**Evidence (real output):**
- `bun run test --timeout 30000 test/errors.test.ts` → `8 pass · 0 fail`, three runs in a row. Whole tree `bun run test` → `375 pass · 0 fail · Ran 375 tests across 22 files [29.95s]`. `tsc --noEmit` → exit 0.
- DoD, in the tests: an error with `code: "23505"` and `detail: "Key (email)=(secret@example.test) already exists"` (plus `where`, `query`, `parameters` and a `cause`, each holding a marker string) → the one captured `console.error` line contains `23505` and **none** of: the email, `detail`, `already exists`, `secret-where`, `secret-query`, `secret-param`, `secret-cause`; a plain `Error("boom")` → `Unhandled error: Error boom | at …`; both answer 500 `INTERNAL`; exactly one console line each, no line breaks.
- **A real Postgres error, not just a look-alike** (throwaway database `corner_chat_t32_live`, dropped after; an unmistakable duplicate-email insert through `Bun.sql`):
  ```
  raw error has: name=PostgresError code=ERR_POSTGRES_SERVER_ERROR errno=23505 detail="Key (email)=(real-g7wbyz2pr4i@example.test) already exists."
  handleError logs: Unhandled error: PostgresError ERR_POSTGRES_SERVER_ERROR 23505 duplicate key value violates unique constraint "users_email_key" | at internal:sql/postgres:171:27 < internal:sql/postgres:199:33
  ```
  So the premise of the TASK is true (the raw error carries the row value) and the new line has the SQLSTATE but not the value. The same is asserted in `test/errors.test.ts` (the test also checks the premise before it checks the log).
- `git status` (checked with `find … -newermt "2026-11-01 16:45"` over the repo, excluding `node_modules`, `.local`, `dist`, `.git`): exactly `src/core/errors.ts` and `test/errors.test.ts`.

**One test-premise correction (mine):** my first test threw a plain string through the app. Hono only calls `onError` for real `Error` instances and rethrows anything else, so a string never reaches `handleError`; I test that defensive branch on `describeUnhandled` directly instead (a string → `Unhandled error: NonError <the string>`; an object, `null`, a number or a symbol → `NonError (a non-Error value was thrown)`, never its fields).

**UNVERIFIED:** nothing outside the unit and the one real-database check. Not covered: errors thrown by code other than through Hono's `onError` (the poller, outbox, filter loop and notify have their own `console.error` calls, which log only `e.message` or a short reason — I did not change them).

## Questions
- For the SA (residual, for information): the **message** is still logged, as the TASK says. A few Postgres messages do contain a value — for example `invalid input syntax for type uuid: "…"` echoes the bad input. That is rarely sensitive (it is the caller's own text), but it is not nothing; say if you want database errors reduced to their SQLSTATE and constraint name only.
  > answer (SA Sober, 2026-11-01): keep the message. The value it can echo is the caller's own bad input, the server is local
  > only, and the SQLSTATE alone would make the log useless for debugging. Revisit this before any deploy.

## Review
**Verdict: DONE** — SA Sober, 2026-11-01.
- **What I re-ran:**
  - `bun run test` → `375 pass · 0 fail · 22 files [27.25s]`
  - `tsc --noEmit` → 0
  - files changed since 16:45 → exactly `src/core/errors.ts` and `test/errors.test.ts`
- **Code read in full:** `describeUnhandled` logs only the name, `code` / `errno`, a one-line message capped at 500 characters,
  and file:line frames. It never logs the object, `detail`, `where`, `query`, the parameters or `cause`. An `ApiError` and the
  client's 500 body are unchanged.
- **Your real Postgres check settles it:** the raw error carried `Key (email)=(…) already exists`, and the logged line has only
  `23505` and the constraint name.
- **Accepted:** the separate branch for a thrown value that is not an `Error`, and testing it directly.
Security review: none — this change only removes data from the log. The one remaining case, a message that echoes the caller's
own input, is accepted and answered above.
