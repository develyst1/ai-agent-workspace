# TASK-164: caw-back — README a newcomer can set it up from, complete `.env.example`, pm2 file (REQ-123)
- Source: SPEC-123 D5 + D7 + D8
- Owner: BE (Bob)
- Status: DONE (2026-10-30 23:2x, Silver — § Review) · was REVIEW (2026-10-30, Bob; DoD 1–8 run — see Implementation Notes) · was TODO — released 2026-10-30 23:2x, Silver (TASK-163 DONE; bases below refreshed on 2426d9a + its 11 paths, tree-fp `69fb6bee03f3`)
- Depends on: TASK-163 DONE
- Git: none

## What to do
Closed file list (caw-back): `README.md`, `.env.example`, `ecosystem.config.cjs` (new).

1. **`.env.example`** (SPEC-123 D7): add `HOST`, `RUNNER_WORKER_MAX_TASKS`, `RUNNER_WORKER_MAX_TOKENS`, `RUNNER_WORKER_IDLE_MS` to the app section. Add three commented sections: "dev only" (`CAW_DEV_*` ×3), "set by CAW itself for each worker — never set these" (`CAW_WORKER_ID`, `CAW_HOP_ID`, `CAW_HOP_FILE`), and "tests only" (the D7 list). Fix the `CAW_POLL_MS` comment to 10000 and the `CAW_WORKSPACE_ROOT` comment to D7's words. Every value stays empty.
2. **`ecosystem.config.cjs`** exactly as D5 (two apps: `caw-back-api`, then `caw-back-runner`, `script: "bun"`, `interpreter: "none"`, `cwd: __dirname`, no `env`; one comment line saying why `interpreter: "none"` and why the API comes first).
3. **`README.md`** = SPEC-121 D6's eleven sections, with SPEC-123 D8's caw-back differences:
   - prerequisites `jq`, `perl`, and the Claude CLI, each with its check command;
   - § Claude CLI;
   - § Database (shared Postgres, own schema `caw`, `bun run db:migrate`, the pglite choices);
   - § CAW work folder;
   - two pm2 names; `/health` → `{"ok":true}`; the runner's `started —` log line;
   - § Start-up errors = TASK-163's lines exactly, copied from its code;
   - § I-Space on one server = SPEC-121 D7's block **word for word**.
   English. Never a real `DATABASE_URL` or any secret.

## Definition of Done
From caw-back.
- [ ] 1. `git status --short --untracked-files=all` → TASK-163's 11 paths + ` M README.md`, ` M .env.example`, `?? ecosystem.config.cjs` (base: TASK-163's 11 paths, SA 23:2x)
- [ ] 2. Every variable the product code reads is in `.env.example`. Paste the output of `comm -23 <(git grep -ohE 'process\.env\.[A-Z_]+|\benv\.[A-Z][A-Z_]+' -- '*.ts' ':!*.test.ts' ':!test/' ':!src/runner/e2e/' | sed -E 's/.*env\.//' | sort -u) <(grep -oE '^#? *[A-Z_]+=' .env.example | tr -d '#= ' | sort -u)` → **no output** (base: `CAW_DEV_API_EARLY_MS CAW_DEV_API_ENTRY CAW_DEV_RUNNER_ENTRY CAW_HOP_FILE CAW_HOP_ID CAW_WORKER_ID HOST RUNNER_WORKER_IDLE_MS RUNNER_WORKER_MAX_TASKS RUNNER_WORKER_MAX_TOKENS` — 10 missing, SA 23:0x on 2426d9a, this exact command)
- [ ] 3. `grep -cE '^[A-Z_]+=.+' .env.example` → `0` (no value filled in) (base: `0`, SA 22:5x)
- [ ] 4. `node --check ecosystem.config.cjs` → exit 0, and `grep -oE 'name: "[a-z-]+"' ecosystem.config.cjs` → `name: "caw-back-api"` then `name: "caw-back-runner"` (base: n/a — new file)
- [ ] 5. `git check-ignore -v ecosystem.config.cjs` → exit 1 (base: exit 1, SA 22:5x)
- [ ] 6. `diff <(sed -n '/^## I-Space on one server/,$p' README.md) <(sed -n '/^## I-Space on one server/,$p' ../blueprint-back/README.md)` → no output (base: n/a — the section is new here)
- [ ] 7. The README's own commands, run as written on this box, no pm2, each pasted. `bun run db:migrate` needs a Postgres URL (`src/scripts/migrate.ts`): the README says so, and on this box it is `UNVERIFIED — no QA Postgres` (as TEST-120). pm2 lines: `HELD (DECISIONS 19:3x)`. Stop both servers by their own pid afterwards, never by name.
- [ ] 7a. `bun install --frozen-lockfile` → exit 0 (base: n/a — new README; the command itself is today's install)
- [ ] 7b. `DATABASE_URL=pglite:memory PORT=4591 bun run api`, then `curl -s 127.0.0.1:4591/health` → `{"ok":true}` (base: n/a — new README; the route is `src/app.ts:26`)
- [ ] 7c. `bun run runner` with `CAW_API_URL=http://127.0.0.1:4591`, a new temp `CAW_WORKSPACE_ROOT` and `CLAUDE_BIN=/bin/true` → `started —` in its output (base: with TASK-163 in the tree, `started —` after three `prepared …` lines, SA 23:2x — TASK-163 § Review 8e)
- [ ] 8. `wc -c README.md` → more than 4 000 (base: `10`, SA 22:5x)

## Implementation Notes
Built in `caw-back` on `2426d9a` + TASK-163's paths, nothing committed by me. Only the 3 closed-list files changed. No pm2 run (HELD). No secret and no real `DATABASE_URL` anywhere.

**What changed**
- `.env.example`: added `HOST`, `RUNNER_WORKER_MAX_TASKS`, `RUNNER_WORKER_MAX_TOKENS`, `RUNNER_WORKER_IDLE_MS` to the app section; three commented sections — "set by CAW itself … never set these" (`CAW_WORKER_ID`, `CAW_HOP_ID`, `CAW_HOP_FILE`), "development only" (`CAW_DEV_API_ENTRY`, `CAW_DEV_RUNNER_ENTRY`, `CAW_DEV_API_EARLY_MS`), "tests only" (`CAW_TEST_SECRET`, `CAW_TEST_WORKSPACE_ROOT`, `CAW_MARK`, `STUB_API_EXIT_AFTER_MS`, `STUB_API_EXIT_CODE`, `STUB_RUNNER_EXIT_AFTER_MS`, `LIVE_VIEW_*` ×5, `TICKS`, `THREAD_ANSWER`, `CHAT_TEXT`); `CAW_POLL_MS` comment → 10000, `CAW_WORKSPACE_ROOT` comment → D7's words; `CAW_API_URL`/`CLAUDE_BIN` comments made exact. Every value empty.
- `ecosystem.config.cjs` (new): `caw-back-api` then `caw-back-runner`, `script: "bun"`, `args: "run src/index.ts"` / `"run src/runner/main.ts"`, `interpreter: "none"`, `cwd: __dirname`, no `env`; one comment line (why `interpreter: "none"`, why the API first, why no `env`).
- `README.md` (was one line): What it is · Prerequisites (bun, jq, perl, Claude CLI, PostgreSQL/pglite, pm2 — each with its check and tested version) · Install · Configuration (every variable in a table, tests-only listed, dev-only and CAW-set named) · Database · CAW work folder · Claude CLI · Build (none) · Start/stop/restart/logs (two pm2 names; `bun run api` / `bun run runner` without pm2) · Check it is up (`/health` → `{"ok":true}`, the runner's `started —` line) · Update · Start-up errors (the API's 6 lines and the runner's 7, with what to do) · I-Space on one server (SPEC-121 D7, word for word).

**Declared decisions**
1. The README names `## Prerequisites`, `## Configuration` and `## Claude CLI` exactly, because TASK-163's lines point at those headings (`see README § …`). "Database" and "CAW work folder" are their own sections (D8).
2. caw-back has no `db:create` script: the README says the database is Blueprint's own (created by blueprint-back's `bun run db:create`) and CAW only adds its schema `caw` — so there is no create step here.
3. The runner "Start-up errors" table gives each line with its own `— see README § …` ending (as TASK-163's code prints it); the API's lines share the one `§ Configuration` ending, said once under the table's heading, as Blueprint's README does.
4. Tested versions in the table are what this box has: bun 1.4.2, jq 1.7, perl 5.40 (`v5.40.1`), Claude CLI 2.1.314; pm2 7.0.4 as in the SPEC (no pm2 here).

**Evidence (real output)**
- DoD 1: `git status --short --untracked-files=all` → TASK-163's 11 paths + ` M .env.example`, ` M README.md`, `?? ecosystem.config.cjs`.
- DoD 2: the SA's exact `comm -23 …` command → no output (the 10 missing names are all in now). DoD 3: `grep -cE '^[A-Z_]+=.+' .env.example` → `0`.
- DoD 4: `node --check ecosystem.config.cjs` → exit `0`; `grep -oE 'name: "[a-z-]+"'` → `name: "caw-back-api"`, `name: "caw-back-runner"`. DoD 5: `git check-ignore -v ecosystem.config.cjs` → exit `1`.
- DoD 6: `diff <(sed -n '/^## I-Space on one server/,$p' README.md) <(sed -n '/^## I-Space on one server/,$p' ../blueprint-back/README.md)` → no output, exit 0. DoD 8: `wc -c README.md` → `11250`.
- **The start-up lines in the README are the code's own:** a throwaway script (scratchpad, not in the repo) asked `checkApiSettings`, `checkDatabase` (fake sql), `listenLine`, `checkRunnerSettings` and `prepareLine` for every line and checked each appears in the README table — `ALL IN README`, 11 of 11.
- DoD 7a: `bun install --frozen-lockfile` → `Checked 124 installs across 213 packages (no changes)`, exit 0. DoD 7b: `DATABASE_URL=pglite:memory PORT=4591 bun run api` (run as `env -u … bun --no-env-file run api`, so the repo's `.env` with the TEST database is never read) → log `caw-back API on http://127.0.0.1:4591`; `curl -s 127.0.0.1:4591/health` → `{"ok":true}`. DoD 7c: `bun run runner` with `CAW_API_URL=http://127.0.0.1:4591`, a new temp `CAW_WORKSPACE_ROOT` and `CLAUDE_BIN=/bin/true` → three `prepared …/scripts/hooks/… from CAW's own copy` lines, then `started — API http://127.0.0.1:4591, poll 2000 ms, …`; the root had the 3 hooks. Both stopped by their own pid / by `timeout` (API pid `1940049` via `ss`; listeners on 4591 afterwards: `0`).
- `bun run db:migrate` (needs a Postgres URL): **UNVERIFIED — no QA Postgres** (as TEST-120). pm2 lines (`pm2 start/restart/stop/logs/save`): **HELD (DECISIONS 19:3x)**.

**UNVERIFIED:** every pm2 command in the README (HELD) and the Postgres steps; the README's "Update" and "first time on a new server" paths were read against the code but not run end to end. The "tested" version of pm2 (7.0.4) is the SPEC's, not mine.

## Questions

## Review

**2026-10-30 23:2x, Silver — DONE.**
- Re-run by me on caw-back 2426d9a + 14 paths (TASK-163's 11 + these 3): DoD 2's `comm` → **no output** (base: 10 missing) · no value filled in (`0`) · `node --check ecosystem.config.cjs` 0, names `caw-back-api` then `caw-back-runner` · the shared section diffed against blueprint-back's → identical · README 11 250 B, sections Prerequisites → I-Space on one server in SPEC-121 D6's order plus SPEC-123 D8's (Database, CAW work folder, Claude CLI).
- Read in full: prerequisites carry `jq`/`perl` with why; § Claude CLI says "as the user pm2 runs CAW as" and that the login is not checked at start; § CAW work folder matches D3 (never overwrite; a non-executable hook → the runner names it); § Start-up errors = TASK-163's lines, each with what to do. The only URL-shaped text is the placeholder `postgres://user:password@127.0.0.1:5432/blueprint` — no secret.
- Ran the README's own API start: `DATABASE_URL=pglite:memory PORT=4592 bun run api` → `/health` = `{"ok":true}`; stopped by `timeout`, port free after (`ss`).
- UNVERIFIED as Bob wrote: pm2 (HELD) and `bun run db:migrate` on a real Postgres → QA / the owner's SIT. tree-fp 23:27: caw-back `cd8dfd83981c`.
