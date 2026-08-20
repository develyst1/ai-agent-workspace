# TASK-001: BE — project skeleton, config, Postgres schema + migration, seed script
- Source: SPEC-001
- Status: IN_PROGRESS — code complete, BLOCKED on DoD evidence (waiting: Sober → Porter → human, disposable Postgres)
- Assignee: Jason (BE)
- Depends on: none

## What to do

Repo: `C:\Users\Admin\develyst\code-report\code-report-back` (empty, git initialized).

1. **Skeleton.** Bun + Hono + TypeScript (SPEC-001 "Overview"). `bun init`,
   strict `tsconfig`, `src/` layout:
   ```
   src/index.ts            # Hono app + server bootstrap
   src/config.ts           # env parsing, fail fast on missing required vars
   src/db/index.ts         # postgres connection pool + query helper
   src/db/migrations/      # .sql files, applied in filename order
   src/scripts/seed-users.ts
   ```
2. **Config** — read and validate at startup, exit non-zero with a clear message
   if a required var is missing. Required: `DATABASE_URL`, `SESSION_SECRET`.
   Optional with defaults: `PORT` (8080), `REPORT_TIMEZONE` (`Asia/Bangkok`),
   `AI_API_CENTER_URL` (`http://localhost:3009`), `AI_API_CENTER_TOKEN` (unset),
   `ALLOW_PRIVATE_GIT_HOSTS` (`false`), `MAX_CONCURRENT_JOBS` (`2`),
   `SEED_USERS_FILE` (unset). **Never log the value of `SESSION_SECRET` or
   `AI_API_CENTER_TOKEN`.**
3. **DB layer.** A thin query helper over `postgres`/`pg` — parameterised queries
   only, no ORM, no string-built SQL. Expose `query<T>(sql, params)` and a
   `withTransaction` helper.
4. **Migration `001_init.sql`** — exactly the two tables in SPEC-001 "Data Model"
   (`users`, `report_jobs`) plus `report_jobs_user_created_idx`, verbatim.
   **`report_jobs` must have no PAT column** (SPEC-001; REQ-001 §11).
   A tiny runner (`bun run migrate`) that applies unapplied files in order and
   records them in a `schema_migrations` table.
5. **Seed script** `bun run seed:users` (SPEC-001 "Data Model"). Reads accounts
   from a JSON file at `SEED_USERS_FILE` — `[{ "username", "displayName",
   "password" }]` — hashes each password with **argon2id**, upserts on
   `username`. Idempotent. Prints usernames only, never passwords.
   **This script is operations-only: it must not be reachable over HTTP.**
6. **Health route** `GET /api/health` → `200 {"status":"ok"}` (no auth). This is
   the only unauthenticated route besides login.
7. **Error envelope helper** — `{ "error": { "code", "message" } }` per SPEC-001,
   with the `Accept-Language: th|en` message table (default `th`). Put the th/en
   strings for every code in SPEC-001's error table into one module
   (`src/errors/messages.ts`); no error text is composed anywhere else.
8. **`.env.example`** documenting every var above. **Never commit a real `.env`.**

Out of scope here: auth logic (TASK-002), git (TASK-003), AI (TASK-004),
report endpoints (TASK-005).

## Definition of Done
- [ ] `bun install && bun run typecheck` passes (`tsc --noEmit`).
- [ ] `bun run migrate` applies `001_init.sql` against a **local, disposable**
      Postgres you control; re-running is a no-op. Paste the output.
      (Never point it at any real/shared database — SPEC-001, PROTOCOL brownfield rule.)
- [ ] `bun run seed:users` with a 2-account fixture file creates both rows;
      re-running updates rather than duplicates. Paste the output.
- [ ] `bun test` passes with at least: config fails fast on a missing required
      var; the error-message module returns th and en text for every code in
      SPEC-001's error table.
- [ ] `grep -rn "pat\|token" src/db/migrations/` shows no PAT/token column.
- [ ] `.gitignore` covers `.env`, the seed file, and `node_modules`.

## Implementation Notes

Jason (BE), 2026-08-20. Repo `C:\Users\Admin\develyst\code-report\code-report-back`
(was empty except `.gitignore` + `README.md`). **Code is complete; two DoD items
could not be evidenced — see Questions.**

### Files added / changed

| File | What it is |
|------|------------|
| `package.json` | Bun project; scripts `dev`, `start`, `typecheck`, `migrate`, `seed:users`, `test`. Deps: `hono`, `pg`. Dev: `typescript`, `@types/bun`, `@types/pg`. |
| `tsconfig.json` | strict, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals/Parameters`. |
| `src/index.ts` | Hono app + `Bun.serve` bootstrap. Exports `app` so tests can call it without opening a port. Only route: `GET /api/health` → `200 {"status":"ok"}`. `onError` returns the `INTERNAL` envelope. |
| `src/config.ts` | `loadConfig(env)` (pure, testable) + `loadConfigOrExit()`. Required `DATABASE_URL`, `SESSION_SECRET`; blank counts as missing. Defaults exactly as the TASK lists. `describeConfig()` is the only sanctioned way to print config — secrets become presence flags and `DATABASE_URL` is reduced to `host/database`, so the password never reaches a log. |
| `src/db/index.ts` | `query<T>(sql, params)` and `withTransaction(fn)` over a lazily-created `pg.Pool`. Parameterised only, no ORM, no string-built SQL. |
| `src/db/migrations/001_init.sql` | `users` + `report_jobs` + `report_jobs_user_created_idx`, **verbatim from SPEC-001 "Data Model"**. No PAT column. |
| `src/db/migrate.ts` | `bun run migrate`. Applies unapplied `*.sql` in filename order; each file runs in **one transaction with its `schema_migrations` insert**, so a failure leaves no half-state and a re-run is a no-op. |
| `src/scripts/seed-users.ts` | `bun run seed:users`. Reads `SEED_USERS_FILE` JSON, validates each entry with an error naming the entry, hashes with **argon2id via `Bun.password.hash`**, upserts on `username` (`ON CONFLICT … DO UPDATE … RETURNING (xmax = 0) AS inserted`) so output says `created`/`updated`. Prints usernames only. Not imported by `src/index.ts` — unreachable over HTTP. |
| `src/errors/messages.ts` | All ten SPEC-001 codes × th/en in one table. `BRANCH_NOT_FOUND` takes `{branch}` (spec: "names the branch"); `CLONE_FAILED` takes `{detail}`. `languageFromAcceptHeader()` → `th` default. |
| `src/errors/index.ts` | `errorEnvelope(code, language, params)` → `{error:{code,message}}`; `requestLanguage(c)`. |
| `.env.example` | Every var above, with defaults and the "never commit a real .env" warning. |
| `.gitignore` | added `.env.local`, `seed-users.json`, `seed-users.*.json` (`.env` and `node_modules/` were already there). |
| `test/*.test.ts` | 23 tests, 4 files (below). |

### Choices worth flagging to review

- **argon2id comes from `Bun.password.hash`** (built in, `algorithm: "argon2id"`)
  rather than a native `argon2` npm package — no node-gyp build step on the
  stakeholder's machine. TASK-002 must use `Bun.password.verify` to match.
- **`pg` rather than `postgres`**: the TASK named either. `pg` gives
  `query(text, values)` directly, so the required `query<T>(sql, params)` shape
  is one thin wrapper with no `unsafe()`-named call in it.
- **No `notFound` handler.** SPEC-001's taxonomy has no code for "unknown
  route", and inventing one (or reusing `INTERNAL` at 404) would be scope I
  don't own. TASK-005 owns route-level errors.
- **No `fields` map on the envelope yet.** SPEC-001 defines it for
  `VALIDATION_ERROR`, but validation is TASK-005; the helper is left minimal so
  TASK-005 extends it rather than inherits a guess.

### Verification

`bun install` → 21 packages, ok.

```
$ bun run typecheck
$ tsc --noEmit
(no output — clean)
```

```
$ bun test
bun test v1.3.13 (bf2e2cec)
 23 pass
 0 fail
 91 expect() calls
Ran 23 tests across 4 files. [107.00ms]
```

Covering the two named DoD test requirements and more:
- `test/config.test.ts` — **config fails fast on a missing required var**
  (`DATABASE_URL`, `SESSION_SECRET`, and a blank-string value), defaults are the
  documented ones, overrides parse, bad `PORT`/`ALLOW_PRIVATE_GIT_HOSTS` are
  rejected, and `describeConfig` output contains neither secret nor the DB password.
- `test/errors.test.ts` — **the error module returns th and en for every code in
  SPEC-001's table**: the code list is asserted against the spec's ten codes
  literally, every code×language is non-empty, th≠en, th matches the Thai
  Unicode block while en does not, `BRANCH_NOT_FOUND` names the branch in both
  languages, `CLONE_FAILED` carries the detail, default is `th`,
  `Accept-Language` resolution incl. `fr` → `th` fallback.
- `test/health.test.ts` — `GET /api/health` is `200 {"status":"ok"}` with no session.
- `test/seed-users.test.ts` — seed-file parsing/validation (no DB needed).

```
$ grep -rn "pat\|token" src/db/migrations/
src/db/migrations/001_init.sql:3:-- report_jobs has NO column for the personal access token, and never will.
```
The only hit is the comment asserting the absence. **No PAT/token column exists.**

```
$ grep -nE "^\.env$|^node_modules/$|^seed-users" .gitignore
50:node_modules/
81:.env
86:seed-users.json
87:seed-users.*.json
```

**Not verified — see Question 1:** `bun run migrate` and `bun run seed:users`
were never executed, because no Postgres I control is available on this machine.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **Q-BE-1 — BLOCKS the last two DoD items of TASK-001. DATA REQUEST.**
  Two DoD items require running against "a **local, disposable** Postgres you
  control", and I have none:
  - the Docker daemon on this machine is **not running**
    (`docker info` → `failed to connect to the docker API at
    npipe:////./pipe/dockerDesktopLinuxEngine`), so I cannot start a throwaway
    container;
  - the only Postgres present is the machine's **own** service
    `postgresql-x64-18`, listening on `0.0.0.0:5432`. That is the human's real
    local environment, not a disposable one, and I have no credentials for it.
    PROTOCOL's brownfield rule forbids me connecting to it or guessing a
    password, so I did not attempt a connection.

  What I need — any **one** of these is enough, and then I run the two commands
  and paste the output:
  1. the human starts Docker Desktop and says so — I then create and destroy my
     own throwaway container myself (nothing of his is touched); **or**
  2. a `DATABASE_URL` for a **scratch** database that is safe to create tables
     in and safe to drop afterwards (e.g. he runs
     `CREATE DATABASE code_report_scratch;` and gives me the connection string —
     I never run that statement myself); **or**
  3. explicit direction from you that TASK-001 may go to `REVIEW` with these two
     DoD items unevidenced, deferred to whichever task first gets a database.

  Everything else in the DoD is green, and **TASK-002/003/004 are not blocked by
  this** — they build and unit-test without a database.

- **Q-BE-2 — NON-BLOCKING.** The th/en strings in `src/errors/messages.ts` are
  **user-facing copy I authored**. SPEC-001's error table gives only an English
  "user-facing meaning" per code, so both the Thai wording and the final English
  phrasing are mine. Q-SA-4 established that invented user-facing copy is the
  stakeholder's to confirm, so please treat this the same way when convenient.
  The text is in exactly one module and each string is one line, so a reword is
  a copy edit with no code change. Working default = what is committed; nothing
  waits on this.

## Review
(Sober fills this in at REVIEW: verdict + reasons.)
