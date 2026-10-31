# TASK-163: caw-back — the API and the runner say what is wrong at start; a brand-new work root prepares itself (REQ-123)
- Source: SPEC-123 D1 + D2 + D3
- Owner: BE (Bob)
- Status: DONE (2026-10-30 23:2x, Silver — § Review) · was REVIEW (2026-10-30, Bob; DoD 1–8 run — see Implementation Notes)
- Depends on: REQ-122 committed (2426d9a) ✓
- Git: none

## What to do
Closed file list (caw-back): `src/startup.ts` (new), `src/startup.test.ts` (new), `src/index.ts`, `src/runner/startup.ts` (new), `src/runner/startup.test.ts` (new), `src/runner/root.ts` (new), `src/runner/root.test.ts` (new), `src/runner/main.ts`, `hooks/block-shell-edits.sh` (new), `hooks/block-irreversible.sh` (new), `hooks/block-kill-by-name.sh` (new).

1. **API (SPEC-123 D1).** `src/startup.ts`: `checkApiSettings(env): string | null` and `checkDatabase(sql): Promise<string | null>`, with the D1 table's lines exactly. `src/index.ts`: run them **before** `createDb`. Replace today's `DATABASE_URL is not set …` line, and put a `try/catch` around `Bun.serve` for the listen line. Each line: `console.error(line)` as the first output, then `process.exit(1)`. The database check: one `postgres(url, { max: 1 })`, `select count(*) from caw.__caw_migrations`; code `42P01` or count < the journal's `entries.length` → "not migrated"; any other code → "cannot reach"; the client is ended before `createDb`. Never print the URL.
2. **Runner (D2).** `src/runner/startup.ts`: `checkRunnerSettings(env, { isExecutable, home }): string | null` with the D2 lines (the root, the five positive numbers, the Claude program path as `config.ts:66,76` computes it). `src/runner/main.ts` `import.meta.main`, in this order: `checkRunnerSettings` → `prepareRoot` → today's `loadConfig` + `probeHooks`. The catch prints `caw-back-runner: <message> — see README § Configuration` (`ConfigError`) or `… — see README § Prerequisites` (`GuardError`), in place of today's `runner: …`.
3. **Work root (D3).** `hooks/`: copy the three files **byte-identical** from `/workspace/caw-workspaces/scripts/hooks/` (read-only there), then `chmod 755`. `src/runner/root.ts` `prepareRoot(root, shippedHooksDir, log)` exactly as D3: mkdir root + `scripts/hooks`, copy only a missing hook, chmod 0755, one log line per copy, never overwrite, throw with the error's `code`. `shippedHooksDir` = `fileURLToPath(new URL("../../hooks", import.meta.url))`.
4. **Tests.**
   - `src/startup.test.ts`: every D1 row (no Postgres needed: give `checkDatabase` a fake `sql` that throws `{ code: "42P01" }`, `{ code: "ECONNREFUSED" }`, or returns a count of 13 / 14). The line never contains the URL (assert with a URL holding `secret-pw`).
   - `src/runner/startup.test.ts`: every D2 row, plus "all set → null".
   - `src/runner/root.test.ts` in a temp folder:
     - (a) a missing root is created with 3 executable hooks equal to `hooks/*` (`cmp`-equal bytes);
     - (b) a root with its own different `block-irreversible.sh` keeps it untouched, and only the 2 missing ones are copied;
     - (c) the D3 boundary case: 2 of 3 present, one not executable → only the missing one copied, the non-executable one stays 0644, and `loadConfig` then still throws `guard hook not executable`;
     - (d) an unwritable parent → throws with `code` `EACCES`.

## Definition of Done
From caw-back, every `bun` line as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file …`.
- [ ] 1. `git status --short --untracked-files=all` → only the closed list (8 new `??` + 2 ` M`) (base: empty, SA 22:5x on 2426d9a)
- [ ] 2. `git check-ignore -v` on each of the 8 new paths → exit 1, no output (base: exit 1 for each, SA 22:5x)
- [ ] 3. `bun test src/startup.test.ts src/runner/startup.test.ts src/runner/root.test.ts` → 0 fail, ≥ 20 tests (base: n/a — new files)
- [ ] 4. `bun test src/runner/config.test.ts src/runner/guard.test.ts test/dev.test.ts` → 0 fail (base: `15 · 4 · 12 pass · 0 fail`, SA 22:5x)
- [ ] 5. `node_modules/.bin/tsc --noEmit --pretty false` → exit 0 (base: exit 0, SA 22:5x)
- [ ] 6. `bun test` (whole) → only the known `withReadGuard … ONE argument` fail (base: `976 pass · 1 skip · 1 fail`, SA 21:5x on the content committed as 2426d9a)
- [ ] 7. `cmp hooks/<each> /workspace/caw-workspaces/scripts/hooks/<each>` → no output; `stat -c %a hooks/*` → `755` ×3 (base: n/a — new files)
- [ ] 8. Real starts, each pasted (stub, no live claude; `E` = `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT`; SA's base runs 23:0x on 2426d9a):
- [ ] 8a. `E DATABASE_URL= bun --no-env-file run src/index.ts` → first stderr line `caw-back-api: missing required setting DATABASE_URL — see README § Configuration`, exit 1 (base: `DATABASE_URL is not set (use pglite:memory for local)`, exit 1)
- [ ] 8b. `E DATABASE_URL=pglite:memory PORT=abc bun --no-env-file run src/index.ts` → `caw-back-api: wrong setting PORT ("abc" is not a port number) — see README § Configuration`, exit 1 (base: a stack trace, `RangeError: The value of "options.port" is out of range. It must be an integer. Received NaN`, exit 1)
- [ ] 8c. `E bun --no-env-file run src/runner/main.ts` → `caw-back-runner: missing required setting CAW_WORKSPACE_ROOT — see README § Configuration`, exit 1 (base: `runner: CAW_WORKSPACE_ROOT is not set: the absolute path of ai-agent-workspace (the guard hooks and skills are read from it)`, exit 1)
- [ ] 8d. `E CAW_WORKSPACE_ROOT=<new empty temp dir> CLAUDE_BIN=/nonexistent bun --no-env-file run src/runner/main.ts` → `caw-back-runner: no Claude CLI at /nonexistent — install it, or set CLAUDE_BIN — see README § Claude CLI`, exit 1 (base: `runner: guard hook missing: block-shell-edits.sh not found at <dir>/scripts/hooks/block-shell-edits.sh`, exit 1 — the CLI is never checked)
- [ ] 8e. `E CAW_WORKSPACE_ROOT=<temp dir that does not exist> CLAUDE_BIN=/bin/true CAW_API_URL=http://127.0.0.1:9 timeout 8 bun --no-env-file run src/runner/main.ts` → the root and its 3 executable hooks exist afterwards; the log shows three `prepared …` lines, then `started —` (base: `runner: guard hook missing: block-shell-edits.sh not found at …`, exit 1, and the root was **not** created)

## Implementation Notes
Built in `caw-back` on `2426d9a`, nothing committed by me. Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`. No live Claude, **no real Postgres** (the database check is tested with a fake `sql` only).

**What changed**
- `hooks/` (new): the 3 guard hooks copied from `/workspace/caw-workspaces/scripts/hooks/` (read only there), `chmod 755`; `cmp` against the source → no output ×3, `stat -c %a` → `755` ×3.
- `src/startup.ts` (new): `checkApiSettings(env)` (DATABASE_URL missing/empty · wrong · PORT), `checkDatabase(sql, expected = journalEntries())`, `journalEntries()` (the entries of `migrations/meta/_journal.json`: 14), `isPostgresUrl`, `apiLine`, `listenLine`. `src/index.ts`: the checks run before `createDb`; a Postgres URL gets ONE `postgres(url, { max: 1 })` connection that is ended before `createDb` opens its own (`pglite:*` is not checked); `Bun.serve` is in a `try/catch`; each failure is `console.error(line)` first, then exit 1.
- `src/runner/startup.ts` (new): `checkRunnerSettings(env, { isExecutable, home })` (root missing / not absolute · the five numbers · the Claude program as `config.ts` computes it) plus the lines `prepareLine`, `guardLine`, `configLine`. `src/runner/root.ts` (new): `prepareRoot(root, shippedHooksDir, log)` exactly as D3 (mkdir root + `scripts/hooks`; copy only a missing hook; chmod 0755; one `prepared … from CAW's own copy` line per copy; never overwrite; throws what the file system threw). `src/runner/main.ts` `import.meta.main`: `checkRunnerSettings` → `prepareRoot` → `loadConfig` + `probeHooks`; the catch prints `caw-back-runner: <message> — see README § Prerequisites` (`GuardError`) or `… § Configuration` (`ConfigError`) in place of `runner: …`. The log function and `instance` now come first so `prepared` lines use the usual log format.

**Declared decisions (internal — overturn cheaply)**
1. Every D1 line ends `— see README § Configuration`, the "not migrated" and "cannot listen" lines too (the SPEC says "every line"): `… database is not migrated — run bun run db:migrate — see README § Configuration`.
2. `checkDatabase` takes the expected count as an optional 2nd argument (default: the journal), so the tests can say "13 of 14" without freezing the number of migrations.
3. The query is `select count(*)::int as count from caw.__caw_migrations` (the cast only so the count is a number, not a bigint string).
4. The Claude check is "a file with an execute bit" (`accessSync X_OK` and `isFile`), not X_OK alone: a folder has X_OK.
5. `prepareRoot` gets the root with trailing slashes stripped, and `/` if that leaves nothing (never a relative path).
6. **The TASK says "8 new `??` + 2 ` M`"; the list has 9 new paths** (3 hooks + `startup.ts`, `startup.test.ts`, `runner/startup.ts`, `runner/startup.test.ts`, `runner/root.ts`, `runner/root.test.ts`). I checked all 9 with `git check-ignore -v` (exit 1).

**Evidence (real output)**
- DoD 1: `git status --short --untracked-files=all` → ` M src/index.ts`, ` M src/runner/main.ts` + the 9 `??` above (base: empty on `2426d9a`). DoD 2: `git check-ignore -v` on all 9 → no output, exit `1`.
- DoD 3: `src/startup.test.ts src/runner/startup.test.ts src/runner/root.test.ts` → `30 pass · 0 fail · Ran 30 tests across 3 files`: every D1 row (exact lines, the URL with `secret-pw` never in a line, 13-of-14 / 14-of-14 / 42P01 / ECONNREFUSED / no code), every D2 row + "all set → null", root (a)–(d) + idempotence + a missing shipped hook.
- DoD 4: `config.test.ts guard.test.ts test/dev.test.ts` → `31 pass · 0 fail` (1 skip: `Ran 32 tests across 3 files`). DoD 5: `tsc --noEmit --pretty false` → exit `0`.
- DoD 6: whole suite `--timeout 30000` → `1006 pass · 1 skip · 1 fail · Ran 1008 tests across 76 files`; the fail = the known `withReadGuard … ONE argument`.
- DoD 7: `cmp hooks/<each> /workspace/caw-workspaces/scripts/hooks/<each>` → no output; `stat -c %a hooks/*` → `755` ×3.
- DoD 8 (real starts, stdout/stderr and exit code as printed):
  - 8a `DATABASE_URL= bun --no-env-file run src/index.ts` → `caw-back-api: missing required setting DATABASE_URL — see README § Configuration`, exit 1.
  - 8b `DATABASE_URL=pglite:memory PORT=abc …` → `caw-back-api: wrong setting PORT ("abc" is not a port number) — see README § Configuration`, exit 1.
  - 8c `bun --no-env-file run src/runner/main.ts` → `caw-back-runner: missing required setting CAW_WORKSPACE_ROOT — see README § Configuration`, exit 1.
  - 8d `CAW_WORKSPACE_ROOT=<new empty temp dir> CLAUDE_BIN=/nonexistent …` → `caw-back-runner: no Claude CLI at /nonexistent — install it, or set CLAUDE_BIN — see README § Claude CLI`, exit 1; the empty dir stayed empty (the CLI is checked before the root is touched).
  - 8e `CAW_WORKSPACE_ROOT=<dir that did not exist> CLAUDE_BIN=/bin/true CAW_API_URL=http://127.0.0.1:9 timeout 8 …` (log captured to a file) → three lines `prepared <root>/scripts/hooks/block-shell-edits.sh | block-irreversible.sh | block-kill-by-name.sh from CAW's own copy`, then `started — API http://127.0.0.1:9, poll 2000 ms, …`, the check-in failing as expected, `SIGTERM: stopping 0 child process(es)` at 8 s (exit 124 = `timeout`). Afterwards the root and `scripts/hooks/` existed with the 3 hooks, `755` ×3, `cmp` equal to `hooks/*`.
  - Extra (not asked): `DATABASE_URL=pglite:memory PORT=4599` while another process held 4599 → `caw-back-api: cannot listen on 127.0.0.1:4599 (EADDRINUSE) — see README § Configuration`, exit 1.
- After the runs: `pgrep -fc 'output-format [s]tream-json'` → `0`.

**UNVERIFIED:** the two Postgres paths on a real server (cannot reach with a real driver error; a real database that is behind) — `postgres.js`'s error codes (`42P01`, connection codes) are assumed from the SPEC; only the fake `sql` was used (no real database, by rule). The README sections the lines point at are TASK-164's.

## Questions

## Review

**2026-10-30 23:2x, Silver — DONE.**
- Re-run by me on caw-back 2426d9a + 11 paths (2 ` M` + 9 `??`, the closed list): the 3 new test files + `config`/`guard`/`dev` tests → `61 pass · 0 fail` · tsc exit 0 · whole suite `1006 pass · 1 skip · 1 fail · Ran 1008 tests across 76 files`, the fail = the known `withReadGuard … ONE argument` · `cmp` hooks = the work root's copies, `755` ×3.
- Real starts I ran: 8a → `caw-back-api: missing required setting DATABASE_URL — see README § Configuration`. 8e (a root that did not exist, log to a file) → three `prepared …/scripts/hooks/<name> from CAW's own copy` lines, then `started — API http://127.0.0.1:9 …`, exit 124 (`timeout`), and the root holds the 3 hooks `-rwxr-xr-x`. The rest (8b–8d, the extra in-use line) are Bob's pasted runs.
- Declared 1–5 accepted. "A file with an execute bit" is the right Claude check (a folder has X_OK); every D1 line ending "— see README § Configuration" is what the SPEC says. **Declared 6 is mine:** the DoD said "8 new" for a 9-path list (3 hooks + 6) — a count slip in my TASK, not his work.
- UNVERIFIED as Bob wrote: the two Postgres paths against a real database (fake `sql` only, by rule) → QA / the owner's first SIT start. tree-fp 23:20: caw-back `69fb6bee03f3`.
