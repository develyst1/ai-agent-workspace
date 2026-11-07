# TASK-114: Add the error's code to the back's error log lines
- Source: SPEC-102 § Questions Q11 (REQ-101)
- Owner: BE (Jason)
- Status: DONE 2026-11-07, Sober, see § Review
- Depends on: none. Base: `call-scribe-back` branch `atom`, e8a635f.
- Repo: `call-scribe-back`, held by Team A, batch 2026-11-06. Branch `atom`.
- Git writes allowed: **none.**
- Files you may edit (closed list): `src/http/errors.ts`, `src/http/app.ts`, `src/worker/worker.ts`, `src/recordings/cleanup.ts`, `test/**`.

## Why

Tanya's back logged `unhandled error: PostgresError` at 2026-11-07 01:54:10, with a stuck request around it. The class alone cannot say whether a connection was lost or something else happened, and that is what Q11 needs. **This names the failure. It is not a fix:** change no timeout, pool setting or retry.

Ran 2026-11-07, Bun 1.4.4, `new SQL` against a closed local port, no real database: `name: PostgresError | code: ERR_POSTGRES_CONNECTION_REFUSED | message has password: false`. So the code exists. The message stays out, as before.

## What to do

1. One small helper, `errorLabel(e)` in `src/http/errors.ts`: returns the class name, plus ` code=<code>` **only when `code` is a string matching `/^[A-Za-z0-9_]{1,64}$/`**. Anything else: the class name alone. Never the message, and never any other field.
2. Use it in the 4 lines that log a class name today: `src/http/app.ts:57`, `src/worker/worker.ts:125`, `src/worker/worker.ts:155`, `src/recordings/cleanup.ts:19`. Line numbers read at e8a635f; `grep -n "\.name}" -r src` lists them.
   Result: `unhandled error: PostgresError code=ERR_POSTGRES_CONNECTION_REFUSED`.

## Definition of Done

Base check, ran 2026-11-07 at e8a635f: `grep -n "\.name}" -r src` lists exactly those 4 lines.

- [ ] `bun test` → all pass. The tests that check an error's message stays out of the log still pass, and add:
  - `errorLabel`: an error with a good `code` → `Name code=X`; no `code` → `Name`; a `code` holding spaces, `=`, or a URL-like value, or a number → `Name` alone; an object with no `name` does not throw.
  - An unhandled route error whose message holds a marker, with a `code`: the line holds the code, not the marker.
- [ ] `bun run typecheck` → clean.
- [ ] `grep -n "\.name}" -r src` → only inside `errorLabel`.
- [ ] Closed list: `git status --porcelain`. **No database run needed, and no worker against `call_scribe`.**

## Implementation Notes

Jason, 2026-11-07. `call-scribe-back` branch `atom`, base e8a635f, working tree only, no git writes. `bun test` only; no database, no worker against `call_scribe`.

- `errorLabel(e)` in `src/http/errors.ts`: class name, plus ` code=<code>` only when `code` is a string matching `/^[A-Za-z0-9_]{1,64}$/`. Anything else → the name alone. Never the message or any other field. Input is `unknown`: `null`, `undefined`, a string or an object with no `name` give `Error` (my choice for the missing-name case; it does not throw).
- Used in the 4 lines: `src/http/app.ts:57` (`unhandled error:`), `src/worker/worker.ts:126` (`could not fail a crashed job yet:`), `src/worker/worker.ts:156` (`job crashed:`), `src/recordings/cleanup.ts:20` (`cleanup failed:`). Imports added in the three files. Nothing else changed: no timeout, pool, retry.
- `test/error-label.test.ts` (new, 7 tests): good code → `PostgresError code=ERR_POSTGRES_CONNECTION_REFUSED`; no code → `TypeError`; spaces, `=`, a `postgres://u:p@host/db` value, 65 characters, empty, a number, `null`, `{}` → name alone; 64 characters is accepted; message and `detail` never appear; `{}`, `{code}`, `null`, `undefined`, a string do not throw. And a route that throws an error whose message holds `marker-in-message postgres://…` with a code → the one logged line is exactly `unhandled error: PostgresError code=ERR_POSTGRES_CONNECTION_CLOSED`, marker absent.

**Evidence:**
- `bun test test/error-label.test.ts` → `7 pass / 0 fail / 21 expect()`. Whole suite → `102 pass / 0 fail / 357 expect()` (the earlier tests that check an error's message stays out of the log still pass).
- `bun run typecheck` → clean.
- `grep -n "\.name}" -r src` → **no output**. The DoD expected "only inside `errorLabel`", but my helper reads `o.name` without a closing brace, so the pattern finds nothing. `grep -n "errorLabel" -r src` lists the definition and the 4 call sites.
- `git status --porcelain` → ` M src/http/app.ts`, ` M src/http/errors.ts`, ` M src/recordings/cleanup.ts`, ` M src/worker/worker.ts`, `?? test/error-label.test.ts` (all on the closed list).
- **UNVERIFIED:** the real text of a Bun `PostgresError` from a live lost connection (the task's own 2026-11-07 run on a closed port is what shows `ERR_POSTGRES_CONNECTION_REFUSED`; I did not run it again, to stay off every database).

## Questions

## Review

**Sober, 2026-11-07: `DONE`.** Built and proven by the engineer, not tested by a tester. Snapshot, no `.env`: typecheck clean, `bun test` 102 pass, 0 fail, 68.39 s, full output kept. Diff read: one helper, 4 call sites, nothing else; the message never reaches a line. **My DoD's grep was wrong, as you reported (my F-entry):** I ran the right one, `grep -n "\.name\b" -r src`: only the helper and two class constructors.
**Your `UNVERIFIED`, narrowed without a database:** `tests/harness/bun-sql-dead-connection.ts`, a fake Postgres on loopback, gives `ERR_POSTGRES_CONNECTION_CLOSED` for a connection closed mid-query. The code's shape passes your pattern. The real text from a live lost connection stays `UNVERIFIED`. The work is uncommitted, in 5 paths, until the owner's word.
