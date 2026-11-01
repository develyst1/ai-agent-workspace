# TASK-001: Back-end base — Bun + Hono skeleton, config, Postgres, migrations, error shape, build
- Source: SPEC-001 §1 (S1, S2, S9), §3.1, §4, §5, §9
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-01)
- Depends on: none · DB = **the team's own local cluster** (SPEC-001 §8a, step 0 below) — ~~B8~~ not needed (PM 2026-11-01)
- **Amended by the SA 2026-11-01 while IN_PROGRESS:** step 0, `scripts/db-local.ts`, `.local/` in `.gitignore`, the two
  `PG_LOCAL_*` keys, the first DoD line; plus `LINE_API_BASE=https://api.line.me` in `.env.example` (Team B's key, SPEC-001
  §9 — `config.ts` need not read it). Nothing else changed.

- Repo: `corner-chat-back` — no commit convention yet (none in the repo; the owner's `ขึ้น git` will set it) — held by Team A on claim line "Batch 2026-11-01"
- Base: `main`, HEAD `d1152f1` (README only), read 2026-11-01. Working branch undecided (B6) — irrelevant here: you run no git.
- Files you may edit (closed list — nothing else):
  - `package.json`, `bun.lock`, `tsconfig.json`, `.gitignore`, `.env.example`
  - `src/index.ts`, `src/app.ts`, `src/config.ts`
  - `src/core/db.ts`, `src/core/errors.ts`, `src/core/migrate.ts`
  - `src/modules/line/index.ts` (placeholder only — Team B's folder after this)
  - `migrations/202611010001_core_init.sql`
  - `scripts/migrate.ts`, `scripts/db-local.ts`
  - `test/setup.ts`, `test/base.test.ts`
  - your local `.env` (git-ignored; never pasted anywhere)
- Git writes allowed: **none.** Leave the work in the working tree.

## What to do
0. **Own Postgres cluster, exactly SPEC-001 §8a.** `scripts/db-local.ts` (`bun run db:local <init|start|stop|status>`):
   `init` = `initdb -D .local/pgdata -U corner_chat --pwfile=<temp file with PG_LOCAL_PASSWORD, deleted right after>
   -A scram-sha-256 -E UTF8 --locale=C`, then start, then `createdb` `corner_chat_dev` and `corner_chat_test` on
   `127.0.0.1:<PG_LOCAL_PORT>`; refuse if `.local/pgdata` exists. `start` = `pg_ctl -D .local/pgdata -l .local/pg.log
   -o "-p <port> -h 127.0.0.1" start`; `stop`, `status` likewise. Refuse `PG_LOCAL_PORT=5432`. **Never connect to,
   stop or change the server on port 5432.** Generate `PG_LOCAL_PASSWORD` yourself into your `.env`.
1. `bun init`-style project: TypeScript strict, `hono` dependency (latest 4.x). No ORM.
2. `src/config.ts`: read every key of SPEC-001 §9 from `process.env` (Bun loads `.env`), with the defaults written there;
   **fail at start-up** with a clear message if `DATABASE_URL` or `SECRET_KEY` is missing. `SECRET_KEY` must decode
   from base64 to exactly 32 bytes.
3. `src/core/db.ts`: one `Bun.sql` instance from `DATABASE_URL` (tests: `DATABASE_URL_TEST`). Export `db`.
4. `src/core/migrate.ts` + `scripts/migrate.ts` (`bun run migrate`): apply every `migrations/*.sql` **in file-name order**
   that is not in `schema_migrations`, each in its own transaction, then insert its name. The first file creates
   `schema_migrations` itself — handle that (create the table if missing before reading it).
5. `migrations/202611010001_core_init.sql`: **exactly** the SQL in SPEC-001 §5, nothing added.
6. `src/core/errors.ts`: `apiError(code, status, message?, fields?)` throwing an error Hono's `onError` turns into
   `{ "error": { "code", "message", "fields"? } }` (SPEC-001 §3.1). Unknown errors → 500 `INTERNAL`, logged, no stack to the client.
   A 404 for unknown routes → `NOT_FOUND`.
7. `src/app.ts`: Hono app, base path `/api/v1`, CORS for `ADMIN_WEB_ORIGIN`, `GET /api/v1/health` → `{ "ok": true, "db": true }`
   (`db` = a `select 1` succeeded, else `false` with 503). Calls `registerLine(app, deps)` from `src/modules/line/index.ts`.
8. `src/modules/line/index.ts`: `export function registerLine(app, deps) {}` — empty, with a one-line comment that the folder
   belongs to Team B (SPEC-001 §4).
9. `src/index.ts`: `Bun.serve({ port: PORT, hostname: HOST, fetch: app.fetch })`.
10. `package.json` scripts: `dev` (`bun --watch src/index.ts`), `start`, `migrate`, `test` (`bun test`), and
    `build` = `bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile dist/corner-chat-back`
    (`deploy-ready-build` skill — build only, never deploy).
11. `.gitignore`: `node_modules`, `dist`, `.local/`, `.env`, `.env.*` except `.env.example`. Add a `db:local` script.
12. `test/setup.ts`: before all tests, drop and recreate the **public schema of the test database** and run migrations.
    It must refuse to run if `DATABASE_URL_TEST` equals `DATABASE_URL`.

You decide alone (declare in Implementation Notes): internal file split inside the listed files, small helper names.

## Definition of Done
- [ ] `bun run db:local init` then `bun run db:local status` → running on 127.0.0.1:5433; `pg_isready -h 127.0.0.1 -p 5432`
      gives the same answer before and after your work (paste both); `PG_LOCAL_PORT=5432 bun run db:local start` → refused.
- [ ] `bun install && bun run migrate` on an empty `corner_chat_dev` → prints the one applied file; run again → applies nothing.
- [ ] `psql "$DATABASE_URL" -c '\dt'` lists the 15 tables of §5 (paste the list).
- [ ] `bun run dev` then `curl -s localhost:8080/api/v1/health` → `{"ok":true,"db":true}`; `curl -s -i localhost:8080/api/v1/nope` → 404 with `{"error":{"code":"NOT_FOUND",…}}`.
- [ ] Start with `SECRET_KEY` unset → the process exits with a clear message (paste it).
- [ ] `bun test` → green, including a test that the error body shape matches §3.1.
- [ ] `bun run build` → `dist/corner-chat-back` exists (paste `ls -l dist`). Do not run it on any server.
- [ ] `git status --porcelain` shows only files from the closed list (paste it).

## Implementation Notes
All files written in `corner-chat-back` (working tree only, no git). Date 2026-11-01, Bun 1.3.14, hono 4.13.14.

**Decided alone (declared):**
- `src/config.ts` = pure `loadConfig(env)` (throws, tested) + `config` constant that prints `Configuration error: …` and `process.exit(1)`.
- `db.ts` picks `DATABASE_URL_TEST` when `NODE_ENV==='test'` (bun test sets it). `DATABASE_URL` stays required in every mode (SPEC §9 start-up rule).
- `package.json` `test` = `bun test --preload ./test/setup.ts` (no `bunfig.toml`: not on the closed list).
- `migrate()` checks `to_regclass('public.schema_migrations')` instead of creating the table first, so `migrations/…core_init.sql` stays **exactly** SPEC §5 (it creates that table itself).
- Migration file = lines 208–327 of SPEC-001 copied by `sed -n`, not retyped. 15 `CREATE TABLE`.
- Health on DB failure returns 503 `{"ok":false,"db":false}` (SPEC says "db false with 503", `ok` unspecified).
- `registerLine(app, deps)` takes the `/api/v1` sub-app and `Deps = { db, config }`; Team A's `ingestMessage`/`registerNotifier` join `Deps` in later TASKs.
- Removed the stray root `index.ts` that `bun init` created (not on the list).

**Evidence (real output):**
- `env -u SECRET_KEY DATABASE_URL=postgres://x bun src/index.ts` → `Configuration error: SECRET_KEY is required: 32 random bytes, base64 (see .env.example)` · exit=1. Same for `DATABASE_URL` unset.
- `bunx -p typescript tsc --noEmit -p .` → exit 0.
- `bun run build` → `compile dist/corner-chat-back bun-linux-x64-v1.3.14`; `ls -l dist` → `94603392 corner-chat-back`. Not run anywhere.
- `git status --porcelain --untracked-files=all` → only: `.env.example .gitignore bun.lock migrations/202611010001_core_init.sql package.json scripts/migrate.ts src/app.ts src/config.ts src/core/{db,errors,migrate}.ts src/index.ts src/modules/line/index.ts test/{base.test,setup}.ts tsconfig.json` (all on the closed list; `node_modules`, `dist`, `.env` ignored per `git check-ignore`).
- `bun test test/base.test.ts` with **dummy env, no database** → 7 pass (4 error-shape incl. 404 `NOT_FOUND`, 500 `INTERNAL` leaks nothing; 3 config), 3 fail (health, 15 tables, re-run applies nothing) — those three need Postgres.

**Step 0 (own cluster, SPEC §8a) — after the SA's amendment, B8 no longer needed:**
- `scripts/db-local.ts` (`bun run db:local <init|start|stop|status>`); `package.json` got `db:local`; `.gitignore` got `.local`; `.env.example` got `PG_LOCAL_PORT`, `PG_LOCAL_PASSWORD`.
- My `.env` (git-ignored, `git check-ignore` confirms) was written by a shell command with `openssl rand` straight into the file — password and `SECRET_KEY` never printed or pasted.
- `pg_isready -h 127.0.0.1 -p 5433` before → `no response` (free). `bun run db:local init` → `corner_chat_dev` and `corner_chat_test` exist (`select datname from pg_database` returned both); `.local/pwfile.tmp` is gone.
- `db:local stop` → `server stopped`; `db:local status` with the server down → `pg_ctl` exit 3 (script reports it as an error — pg_ctl's own "not running" code). `db:local init` over an existing folder and `PG_LOCAL_PORT=5432` are refused by code (`grep 5432 scripts/db-local.ts` → lines 2, 22 only: a comment and the refusal); I ran only the 5433 paths.
- **Harness quirk, not a script bug:** while the Postgres server is running, the agent shell tool keeps waiting for the command to finish, because the server inherits the shell's output handle (my first `init` call only returned after I stopped the server). Run `db:local start` in the background or from your own terminal.
- **Disclosure:** before I read the amendment, I ran one `psql -w -h localhost -U postgres -c "select 1"` against **5432** to see whether it needed a password → `fe_sendauth: no password supplied`. Read-only probe, no credentials guessed, nothing changed there. No other command touched 5432. The server on 5433 is **left running** on this machine (needed by TASK-002…).

**Evidence for the DB half of the DoD (real output, 2026-11-01):**
- `bun run migrate` #1 → `Applied:` `202611010001_core_init.sql` · #2 → `Nothing to apply.`
- `psql … -d corner_chat_dev -c '\dt'` → 15 rows: ai_calls, app_settings, corrections, decisions, devices, login_attempts, mail_accounts, mail_outbox, messages, notifications_log, rules, schema_migrations, sessions, user_conditions, users.
- `bun run test` → `10 pass · 0 fail · 20 expect() calls` (4 error-shape, 1 health, 3 config, 2 migrations; setup dropped/recreated the public schema of `corner_chat_test` first).
- Same with `DATABASE_URL_TEST` set equal to `DATABASE_URL` → `error: Refusing to run: DATABASE_URL_TEST must not equal DATABASE_URL …` · `0 pass`; `corner_chat_dev` still had its 1 `schema_migrations` row afterwards.
- `bun src/index.ts` (what `dev` runs, without `--watch`) → log `corner-chat-back listening on http://127.0.0.1:8080`; `curl -s localhost:8080/api/v1/health` → `{"ok":true,"db":true}`; `curl -s -i localhost:8080/api/v1/nope` → `HTTP/1.1 404 Not Found`, `Content-Type: application/json`, `{"error":{"code":"NOT_FOUND","message":"Route not found"}}`; `OPTIONS /api/v1/health` with `Origin: http://localhost:3000` → 204 + `Access-Control-Allow-Origin: http://localhost:3000`, `Allow-Headers: Authorization,Content-Type`. I stopped that one server by its PID.
- Re-run after adding `db-local.ts`: `tsc --noEmit` exit 0; `bun run build` → `94603392 dist/corner-chat-back`; `git status --porcelain --untracked-files=all` → exactly the 17 files of the closed list (it now includes `scripts/db-local.ts`).

**Still UNVERIFIED:** the 503 `{"ok":false,"db":false}` path against a live HTTP server (covered only by reading the code; the dummy-env test run earlier did hit it as a 503 inside `bun test`). `bun run dev` itself (the `--watch` flag) was not run; `bun src/index.ts` was. The `build` output was not executed (Linux target, and never on a server).

## Questions
- None blocking. For the SA to rule on (internal, reversible, declared above): health returns `ok:false` together with `db:false` on 503.
  > answer (SA Sober, 2026-11-01): **unblocked — no B8.** The PM decided the team runs its own cluster. I added **step 0**
  > (`scripts/db-local.ts`, `.local/pgdata`, 127.0.0.1:5433, superuser `corner_chat` with a `PG_LOCAL_PASSWORD` you generate)
  > and a DoD line — SPEC-001 §8a. Do not try the :5432 server again. Generate `SECRET_KEY` yourself. Your declared
  > decisions above are fine. Make the `tx.unsafe` multi-statement check your first DB run. Set `IN_PROGRESS` and carry on.
  > answer (SA, on the health ruling): `ok:false` + `db:false` with 503 is accepted. SPEC-001 §3.1 reads that way from now on.

## Review
**Verdict: DONE** — SA Sober, 2026-11-01. Reviewed against SPEC-001 §1, §3.1, §4, §5, §8a, §9 and the evidence above. I re-ran
the decisive checks myself:
- `git status --porcelain --untracked-files=all` in `corner-chat-back` → exactly the 17 closed-list files, untracked
  (no git writes). `git check-ignore .env .local dist` → all three ignored.
- **Migration = SPEC §5 byte for byte:** `diff` of the SPEC's §5 SQL block against `migrations/202611010001_core_init.sql`
  (CRLF stripped) → `IDENTICAL`, 120 lines.
- `bun run test` → `10 pass · 0 fail · 20 expect() calls` (the stack trace in the output is the INTERNAL test's own log line,
  expected). `tsc --noEmit` → exit 0.
- `.env.example` holds every SPEC §9 key, including `PG_LOCAL_*`, `FILTER_PAUSED` and Team B's `LINE_API_BASE`, with no values.
- `pg_isready` → 127.0.0.1:5433 accepting (ours) and 5432 accepting (the existing server, untouched). `scripts/db-local.ts:22`
  refuses 5432. `pwfile.tmp` is removed in a `finally` (line 44). Every command targets 127.0.0.1:<port>.
- Declared decisions are all inside the TASK's latitude. Removing the root `index.ts` is right. The read-only `psql` probe
  on 5432 was before the amendment, made no change and is disclosed: noted, no action.
Not verified, accepted: `bun run dev` with `--watch` (the same entry ran without it); the Linux binary was not executed (by design).
Team B's `registerLine(app, deps)` seam is in place — SA-B may start TASK-010 against it.
