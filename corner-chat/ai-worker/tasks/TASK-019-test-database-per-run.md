# TASK-019: Each `bun test` run gets its own test database (two teams test in one tree)
- Source: SPEC-001 §8 RISK "two teams in one back repo", §8a · found at TASK-005 review, 2026-11-01
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-01)
- Depends on: TASK-005 (DONE)

- Repo: `corner-chat-back` — Team A claim · git writes: **none**
- Files you may edit (closed list): `test/setup.ts` · `src/core/db.ts` (only if the test URL must be read later than import time) ·
  `scripts/db-local.ts` (add one `clean-tests` command) · `package.json` (that script only) · `test/base.test.ts` (only if its
  assertions name the old database)

## Why (seen 2026-11-01, 03:16–03:21)
`test/setup.ts` drops and recreates the `public` schema of the **one** database in `DATABASE_URL_TEST`. Team B's test runs (PIDs
27432, 12980) and my review run (30840) ran at the same time in the same tree. Mine sat for more than 5 minutes with no output,
waiting on that database, and I stopped it. Two runs that both drop the schema can also wipe each other's rows in the middle of a
test. On a private database (`corner_chat_test_sa`) the same files gave `93 pass · 0 fail` in 8 s.

## What to do
1. At the start of every `bun test` run, `test/setup.ts` creates a **fresh database** on the same server as `DATABASE_URL_TEST`,
   named `<that database's name>_r<pid>` (e.g. `corner_chat_test_r12980`). It connects to `DATABASE_URL_TEST`'s own database to
   run `CREATE DATABASE`, runs the migrations into the new one, and makes every test of the run use it. Keep the existing refusal
   when `DATABASE_URL_TEST` equals `DATABASE_URL`.
2. At the end of the run (all files done, or the process exiting), drop that database. Close the run's connections first.
3. `bun run db:local clean-tests` drops every database whose name matches `<test name>_r<digits>` (left by a killed run) and
   prints each name it drops. It never touches `corner_chat_dev`, the base test database, or anything on port 5432.
4. Nothing else changes: same `.env` keys, and Team B's test files keep working unchanged.

You decide alone (declare): how the URL reaches `db.ts` (an env var set before `db.ts` is imported, or reading it lazily).

## Definition of Done (paste real output)
- [ ] Two runs at once in two shells, `bun test` (the whole tree) and `bun test test/line-core.test.ts`, both finish green. Paste
      both result lines and the two database names they used.
- [ ] After both finish, `psql … -c "select datname from pg_database where datname like 'corner_chat_test_r%'"` → 0 rows.
- [ ] Kill a run mid-way (Ctrl-C), then `bun run db:local clean-tests` drops its leftover database (paste the output).
- [ ] `tsc --noEmit` → exit 0 · `git status --porcelain` → only files from the closed list changed.

## Implementation Notes
Working tree only, no git. 2026-11-01. Changed: `test/setup.ts` (rewritten), `scripts/db-local.ts` (`clean-tests` + usage text). **Not changed:** `src/core/db.ts`, `package.json`, `test/base.test.ts` (file mtimes 02:42 / 02:43 / earlier; `git status` shows everything untracked, so mtimes are the proof).

**How it works:**
- `test/setup.ts` (preload, top-level `await`): checks `DATABASE_URL_TEST` is set and ≠ `DATABASE_URL` (refusal kept), builds `<db>_r<process.pid>` from the test URL's database name, connects to `DATABASE_URL_TEST` itself, `DROP DATABASE IF EXISTS … WITH (FORCE)` (a dead run with the same pid may have left one) then `CREATE DATABASE`. It then sets `process.env.DATABASE_URL_TEST` to the new URL **before** `src/config.ts` / `src/core/db.ts` are first imported (dynamic `import()` after that line), so `db.ts` needed no change, and runs `migrate(db)` into the empty database (no more `DROP SCHEMA`).
- Teardown: `afterAll` in the preload → `db.close()`, then `DROP DATABASE … WITH (FORCE)` from the base test database. Measured: a preload's `beforeAll`/`afterAll` run **once per whole run**, not once per file (scratch experiment with two files: one `beforeAll`, one `afterAll`).
- `bun run db:local clean-tests`: connects to `DATABASE_URL_TEST`, lists databases matching `^<base>_r[0-9]+$` and drops them, printing each name. Refuses a non-local host or port 5432; the pattern needs the `_r<digits>` suffix, so `corner_chat_dev`, the base test database and other people's private databases (`corner_chat_test_sa`, `corner_chat_test_b`, and Team B's `corner_chat_test_b_r<pid>`) never match.

**Decided alone (declared):**
- `clean-tests` **keeps** a database whose run pid is still alive (`process.kill(pid, 0)`) and prints `kept … (the run with pid N is still active)`; otherwise it would drop a live run's database from under it. A reused pid would make a dead run's leftover look alive — then it is simply kept; run the command again later.
- No SIGINT handler: a Ctrl-C'd or killed run leaves its database, which is exactly what `clean-tests` is for (TASK point 3). A normal finish, with or without failing tests, runs `afterAll`.
- `package.json` needed no change: `clean-tests` is a sub-command of the existing `db:local` script.
- The suite is started with `bun run test` (= `bun test --preload ./test/setup.ts`). A bare `bun test` has no preload, hence no database setup — as before; a `bunfig.toml` would fix that but is not on this TASK's list.

**Evidence (real output):**
- RED first: two runs at once on the old setup (whole tree + one file) → the whole-tree run failed tests that are green alone (`(fail) disable / enable > enable lets the user sign in again`, a LINE notifier test) and then hung until my 170 s timeout (`A exit=124`); the single-file run was green. Same symptom as Sober's report.
- GREEN, DoD 1: `bun test --preload ./test/setup.ts` (whole tree) **and** `… test/line-core.test.ts` at once → `180 pass · 0 fail · Ran 180 tests across 11 files [11.66s]` and `33 pass · 0 fail · Ran 33 tests across 1 file [831ms]`, both exit 0. Because the single-file run ends too fast to catch its name, I also ran the **whole tree twice** at once: databases seen mid-run `corner_chat_test_r1736 corner_chat_test_r28400`; results `180 pass · 0 fail [14.05s]` twice.
- DoD 2: after both finished, `select datname from pg_database where datname like 'corner_chat_test_r%'` → `(0 rows)` (also `[]` after the two-whole-tree run).
- DoD 3: started a run, `clean-tests` during it → `db-local: kept corner_chat_test_r26264 (the run with pid 26264 is still active)`; then `taskkill //F` on that pid (killed mid-way) → leftover `corner_chat_test_r26264`; `bun run db:local clean-tests` → `db-local: dropped corner_chat_test_r26264`; a second call → `db-local: no leftover test databases`. Databases afterwards: `corner_chat_dev corner_chat_test corner_chat_test_b corner_chat_test_b_r26376 corner_chat_test_sa` — untouched (the `_b_r…` one is Team B's live run).
- DoD 4: `tsc --noEmit` → exit 0.

**UNVERIFIED:** a Ctrl-C from a real terminal (I used a hard kill of the process); behaviour with Team B's runs started from a checkout that still has the old `setup.ts` (they would drop the schema of the base test database again — harmless to per-run databases); more than ~3 runs at once.

## Questions
- None blocking. For the SA: the `kept (still active)` rule in `clean-tests` is my addition to point 3 of the TASK (which says "drops every database whose name matches"); say if you want the plain behaviour instead.

  > answer (SA Sober, 2026-11-01): keep the `kept (still active)` rule. Dropping a live run's database would recreate the
  > very bug this TASK fixes.

## Review
**Verdict: DONE** — SA Sober, 2026-11-01. Re-run by me in one shell, two runs at once: `bun run test` (whole tree) →
`180 pass · 0 fail [11.65s]` · `bun run test test/line-core.test.ts` → `33 pass · 0 fail [905ms]`. Then `bun run db:local
clean-tests` → `no leftover test databases`. `tsc --noEmit` → exit 0. I read `test/setup.ts` in full:
- a per-run name `<base>_r<pid>`, guarded by `^\w+$` (no injection through the URL);
- the refusal when the test URL equals the dev URL is kept;
- the env is set before the dynamic import, so `db.ts` is untouched;
- `afterAll` closes the connection and drops the run's database `WITH (FORCE)`.
Your note that preload hooks run once per run is measured, not assumed — good. Accepted, not verified: Ctrl-C from a real
terminal (a hard kill was used), and more than 3 runs at once. F-008's cause is designed out. Team B needs nothing more than
to run `bun run test` (the PM tells them).
