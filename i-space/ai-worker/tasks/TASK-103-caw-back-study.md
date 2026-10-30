# TASK-103: caw-back — run it, map its folders (REQ-101, CAW side)
- Source: SPEC-102 (REQ-101 AC-2, AC-3, AC-4, AC-10 input)
- Owner: BE (Bob)
- Status: DONE (2026-10-29, Silver — review below)
- Depends on: none
- Repo: `caw-back` on `atom` @ 102a130 (path: workspace-root `machine.local.md`). **No code change. No git write.**

## Read first

`specs/SPEC-102-caw-code-map.md` — § Guardrails G1–G10 bind every step here, and § Base run says what the
SA saw. 🔴 **G1: never set `CAW_WORKSPACE_ROOT` or `CLAUDE_BIN`, never run the runner, never run
`src/runner/e2e/*`** — a real `claude` is on this machine and a live run fails the whole REQ.

## What to do

Find out, by running it, how `caw-back` installs, tests and starts here, and write one line per folder
saying what it is for. You are a reader in this repo: observe and record; do not fix anything.

## Definition of Done

Paste each command and its real output (trimmed to the lines that matter) in `## Implementation Notes`,
with date/time.

- [ ] **1. Before.** `git -C <caw-back> status --short` (→ empty, SA base 2026-10-29) and `git log -1 --oneline` (→ `102a130 …`).
- [ ] **2. Install + full test.** `bun install --frozen-lockfile` then `bun test`. Record the summary line
      (pass / skip / fail / tests / files / time) and the name + `file:line` of every fail and skip.
      SA base: `676 pass · 1 skip · 2 fail`, 679 tests, 60 files. A different number is fine — record it.
- [ ] **3. The two fails, alone.** Re-run each failing file by itself (`bun test <file>`) and paste the
      result: does `test/scripts/db-scripts.test.ts` Case C still time out alone? What does
      `src/runner/settings.test.ts:162` actually receive (print-free: copy bun's diff)? Say what you observe;
      a cause you only read is written `inferred — <what would settle it>`.
- [ ] **4. Folder map.** For every top-level entry under `src/` (`app.ts blueprint cards chain chat core db
      dev.ts follow hops http index.ts mcp projects proposals runner scripts seam workers`) and every folder
      under `test/`: one line — what it is for, with one `file:line` that shows it. `src/mcp` and
      `src/runner` get 3–6 lines each (what starts them, what they talk to, their env vars, their files'
      roles). Also: the HTTP routes table — method + path + file:line for each route in `src/http/routes/*`
      (`grep -n "path:"` is a fine start).
- [ ] **5. Start — API alone.** Port free first (`lsof -iTCP:4500 -sTCP:LISTEN` → nothing). Then
      `DATABASE_URL=pglite:memory CAW_POLL_MS=0 bun run api`; in another shell `curl -s localhost:4500/health`
      and `curl -s -o /dev/null -w '%{http_code}\n' localhost:4500/v1/openapi.json`. Paste the start line and
      both answers. Then one call that needs Blueprint (Blueprint is NOT running — G5):
      `curl -s -X POST localhost:4500/v1/projects -H 'content-type: application/json' -d '{"blueprintProjectId":"x","version":1}'`
      and paste exactly what it answers (status + body). Stop the API.
- [ ] **6. Start — `bun run dev`, the safe way.** With `CAW_WORKSPACE_ROOT` unset:
      `DATABASE_URL=pglite:memory CAW_POLL_MS=0 bun run dev` → paste the `[api]` / `[runner]` lines. Expected:
      the runner refuses (`CAW_WORKSPACE_ROOT is not set …`) and the API stays up. Stop it (Ctrl+C).
- [ ] **7. MCP server.** `bun run mcp </dev/null` with `CAW_WORKER_ID` unset → paste what it prints and its exit
      code. Do not run it any other way.
- [ ] **8. Looks wrong / unexplained.** A list (each with `file:line` or output): fails, TODO/FIXME
      (`grep -rn "TODO\|FIXME" src`), dead code you can show is unused, comments that contradict the code,
      anything in `.env.example` the code does not read or vice versa. **Listed, not fixed.**
- [ ] **9. After.** `git status --short` (→ empty) and `git log -1 --oneline` (→ `102a130`). Nothing left
      listening on :4500.

## Implementation Notes

Bob, 2026-10-29 00:45–00:52 local (box clock; HTTP Date header shows 17:49 GMT). Repo `caw-back` @ `102a130`. G1 guard
checked before running: `CAW_WORKSPACE_ROOT`, `CLAUDE_BIN`, `DATABASE_URL`, `BLUEPRINT_URL` all unset in my shell. No file
created in the repo; throwaway files only in my scratchpad. Never ran runner / e2e / any G4 script.

**1. Before** — `git status --short` → (empty) · `git log -1 --oneline` → `102a130 chore: add merge and release workflows`.

**2. Install + test** — `bun install --frozen-lockfile` → `Checked 124 installs across 213 packages (no changes)`.
`bun test` (00:46) → `677 pass · 1 skip · 1 fail · Ran 679 tests across 60 files. [105.67s]` (SA base: 676/1/2 — I got one more pass).
- fail: `src/runner/settings.test.ts:162` (`withReadGuard … PreToolUse hook on Read|Glob|Grep`).
- skip: `src/runner/guard.test.ts:51` — `test.skipIf(WS === "")`, WS = `CAW_TEST_WORKSPACE_ROOT`, unset here. I did not set it (G1 spirit: it runs the real hooks).

**3. The two fails, alone** (00:47)
- `bun test src/runner/settings.test.ts` → `23 pass · 1 fail`, same test. bun's diff: `162 | expect(cmd.startsWith(\`${process.execPath} \`)).toBe(true);` → `Expected: true  Received: false`.
  Observed cause (checked by a scratchpad script `console.log(process.execPath)`): under bun here `process.execPath` =
  `/usr/local/lib/pnpm/5/.pnpm/bun@1.4.2/node_modules/bun/bin/bun.exe` — it contains `@`. `src/runner/settings.ts:29` `shellWord`
  only leaves `[A-Za-z0-9_/.-]+` unquoted, so `settings.ts:77` emits `'…bun@1.4.2…'` in single quotes and the test expects it bare.
  So this is environment-dependent (a bun installed under a path with a char outside that set, here via pnpm) — not a logic fault I can show. Is the quoted form wrong for the real runner? `inferred — no: it is valid shell; the test is stricter than the code`. Not fixed (G7).
- `bun test test/scripts/db-scripts.test.ts` → `11 pass · 0 fail · 83 expect() calls · [20.11s]`. **Case C (`:123`) passes alone, and it also passed inside the full run** — I could not reproduce the SA's timeout. `inferred — a timeout under load (this file takes ~20 s alone; PGlite WASM); would settle: a second full run with the machine idle`. Not run again (105 s).

**4. Folder map** (`src/` unless noted; cite = file:line)
- `app.ts` — builds the Hono/zod-openapi app, mounts every route group; `/health` at `app.ts:25`, `/v1/openapi.json` at `app.ts:40`.
- `index.ts` — the API entry (`bun run api`): reads `DATABASE_URL`, `PORT` (4500), `HOST`, `CAW_POLL_MS` (`index.ts:7,19,23`).
- `dev.ts` — `bun run dev`: API + runner as two child processes, lines prefixed `[api]`/`[runner]` (`dev.ts:1-3`).
- `blueprint/` — the seam client CAW calls on Blueprint's read API; 404→null, anything else→`BlueprintUnreachable` (`blueprint/client.ts:1-3`; env `BLUEPRINT_URL` `:28`, `BLUEPRINT_WEB_URL` `:31`).
- `cards/` — card writes (`service.ts:1`) and the API view with computed `workable` (`view.ts:1-2`).
- `chain/` — a project's worker chain: members, directed edges, entry (`chain/service.ts:1-2`).
- `chat/` — operator chat + entry-worker replies (`service.ts:1`); `guard.ts:1` = the "holds a running chat hop" rule for chat-only routes.
- `core/` — the event store: `events.ts:1` vocabulary, `reduce.ts:1` the one pure reducer, `write.ts:1` the one write path (one transaction), `state.ts:1` tables⇄State, `rebuild.ts:1` replay, plus `ids.ts` (uuid v7), `paths.ts` (rewrite machine paths in worker text), `stable.ts` (sorted-key JSON).
- `db/` — `schema.ts:1` Drizzle tables in Postgres schema `caw`; `client.ts:13-15` URL forms (`pglite:memory`, `pglite:file:<dir>`, Postgres); `migrations-config.ts:1` journal `caw.__caw_migrations`; `migrations/` = 11 entries (`0000_caw_schema.sql` … ).
- `follow/` — pulls Blueprint's change feed and flags cards whose anchor changed (`follow/pull.ts:1-3`).
- `hops/` — hops and runs the runner writes through the API (`hops/service.ts:1-3`).
- `http/` — `actor.ts:1` the `X-CAW-Actor` rule (operator / worker:id / runner:name); `errors.ts:6` one error body; `routes/` = 10 route files (table below).
- `mcp/` — `server.ts:1`: stdio MCP server, a thin adapter, each tool = one API call as `worker:<CAW_WORKER_ID>`. Started by: the worker's `claude` (never by me); `import.meta.main` guard `server.ts:165`. Talks to: the CAW API only (`CAW_API_URL`, default :4500, `:174`). Env: `CAW_WORKER_ID` (required, exit 1 without it `:169-173`), `CAW_API_URL`, `CAW_HOP_ID` (optional). One file, 176 lines.
- `projects/` — projects made from a confirmed Blueprint version; one per Blueprint project (`projects/service.ts:1,26`).
- `proposals/` — entry worker proposes cards in a chat hop, operator accepts (`proposals/service.ts:1-3`).
- `runner/` — the long-running local process next to the API, no state of its own, reads/writes only through the API (`main.ts:1-2`). Started by: `bun run runner`, or `dev.ts`; refuses without `CAW_WORKSPACE_ROOT` (`config.ts:30`). Talks to: CAW API (`api.ts:1`) and a headless `claude -p` child per hop (`hop.ts:1`; binary `CLAUDE_BIN` default `~/.local/bin/claude`, `config.ts:40`). Env: `CAW_WORKSPACE_ROOT`, `CLAUDE_BIN`, `CAW_API_URL`, `RUNNER_POLL_MS` (2000), `RUNNER_HOP_MAX_MS` (20 min), `RUNNER_TRACE_DIR` (`trace.ts:11`). Roles: `plan.ts` pure tick decision · `prompt.ts` hop prompt + skills · `stream.ts` parse stream-json · `settings.ts` generated worker settings + hooks · `guard.ts` proves block hooks work before first hop · `read-guard.ts` Read/Glob/Grep fence · `procs.ts` child process-group files · `redact.ts` secret masking · `report.ts` Thai run report · `trace.ts` per-hop trace file · `fixtures/` recorded streams · `e2e/` dev scripts that start REAL or fake hops (`run.ts:2-4`, `auto.ts:11`; **not run**).
- `scripts/` — operator scripts: `migrate.ts:1` (`db:migrate`), `db-inspect.ts:1` (read-only), `db-fix-journal.ts:1`, `emit-openapi.ts:1` (writes `openapi.json`). **None run (G4).**
- `seam/` — `locate` / `amendments` proxied to Blueprint; Blueprint down → 502 (`seam/service.ts:1-3`).
- `workers/` — global named workers with roles, model, effort (`workers/service.ts:1-3`).
- `test/` — `setup/no-operator-env.ts:1` bun preload (`bunfig.toml:3`) that hides the operator's `.env` · `helpers/` (`api.ts:1` app on PGlite + fake Blueprint; `db.ts:4` one shared PGlite, emptied per test; `fake-blueprint.ts:1` Bun server answering recorded JSON) · `fixtures/blueprint/` recorded Blueprint responses · `blueprint/` seam client (`client.test.ts:1`) · `config/` `.env.example` shape (`env-example.test.ts:1`) · `core/` event store (`events.test.ts:1`) · `db/` 11 files, migrations 0002–0009 + journal + file DB (`file.test.ts:1`) · `follow/` Blueprint pull (`pull.test.ts:1`) · `http/` 24 route-level tests (`code-map.test.ts:1`) · `mcp/` MCP tools (`server.test.ts:1`) · `scripts/` db scripts (`db-scripts.test.ts:1`) · `dev.test.ts:1` `bun run dev`. Runner tests sit beside the code in `src/runner/*.test.ts`.
- **Routes** (method path — file:line; `grep -n 'path:'`): GET `/health` `app.ts:25` · GET `/v1/openapi.json` `app.ts:40` ·
  projects.ts: POST `/v1/projects` :38 · GET `/v1/projects` :47 · GET `/v1/projects/{id}` :52 · PATCH `…/mode` :57 · PATCH `…/workspace` :67 · PUT `…/code-map` :75 · POST `…/code-map/confirm` :81 · GET `…/parts/{key}` :86 · GET `…/events` :95 · POST `…/rebuild-check` :104 ·
  cards.ts: POST `/v1/projects/{id}/cards` :38 · GET same :49 · GET `/v1/cards/{cardId}` :61 · GET `…/context` :66 · POST `…/comments` :71 · POST `…/handoff` :76 · PATCH `…/status` :85 · PATCH `…/assignee` :90 · POST `…/question` :95 · POST `…/answer` :103 · POST `…/spec-change/clear` :108 ·
  chain.ts: GET `/v1/projects/{id}/chain` :21 · POST `…/chain/members` :26 · DELETE `…/chain/members/{workerId}` :31 · POST `…/chain/edges` :40 · DELETE `…/chain/edges` :48 · PUT `…/chain/entry` :56 ·
  chat.ts: POST `/v1/projects/{id}/chat` :26 · GET same :31 · GET `/v1/chat/{messageId}/context` :37 · POST `…/reply` :45 · POST `…/retry` :54 ·
  proposals.ts: POST `/v1/projects/{id}/proposals` :25 · GET same :31 · POST `/v1/proposals/{id}/accept` :36 ·
  hops.ts: POST `/v1/projects/{id}/hops` :31 · PATCH `/v1/hops/{hopId}` :39 · POST `…/heartbeat` :44 · GET `/v1/projects/{id}/hops` :49 · POST `…/runs` :55 · PATCH `/v1/runs/{runId}` :61 · GET `/v1/projects/{id}/runs` :67 ·
  workers.ts: POST `/v1/workers` :25 · PATCH `/v1/workers/{id}` :42 · DELETE same :51 · POST `/v1/workers/combine` (deprecated) :59 · GET `/v1/workers` :68 ·
  seam.ts: POST `/v1/projects/{id}/locate` :15 · POST `…/amendments` :20 · follow.ts: POST `/v1/notify` :9 · team.ts: POST `/v1/runner/check-in` :43 · GET `/v1/team-status` :54.

**5. API alone** (00:48:56) — port check: `lsof` is **not installed** here (`command not found`); I used `ss -ltn | grep :4500` instead → nothing before, nothing after.
`DATABASE_URL=pglite:memory CAW_POLL_MS=0 bun run api` → `$ bun run src/index.ts` / `caw-back API on http://127.0.0.1:4500`.
`curl -s localhost:4500/health` → `{"ok":true}` · `curl … /v1/openapi.json` → `200`.
The TASK's POST exactly as written → `HTTP/1.1 400` `{"error":{"code":"actor_required","message":"send X-CAW-Actor: operator, worker:<workerId> or runner:<name> (name = letters, digits, _ and -, 1–64)"}}` (the TASK's curl has no actor header, so it never reaches Blueprint).
Same call plus `-H 'X-CAW-Actor: operator'` → `HTTP/1.1 502` `{"error":{"code":"blueprint_unreachable","message":"blueprint_unreachable (network)"}}` — the answer with Blueprint down (G5).
Stopped: `kill` of the pid I recorded killed only the `/bin/sh` wrapper of `bun run`; the bun child kept :4500 until I killed it by its pid. Then `ss` → 0 listeners.

**6. `bun run dev`, safe** (00:49:30, `CAW_WORKSPACE_ROOT` and `CLAUDE_BIN` unset) →
`$ bun run src/dev.ts` / `[runner] runner: CAW_WORKSPACE_ROOT is not set: the absolute path of ai-agent-workspace (the guard hooks and skills are read from it)` / `[runner] stopped: runner: CAW_WORKSPACE_ROOT is not set: …` / `[api] caw-back API on http://127.0.0.1:4500`; `/health` → `{"ok":true}`. As expected: runner refuses, API stays up. Stopped with SIGTERM to the `dev.ts` pid (the log shows no shutdown line); `ss` → 0 listeners, no leftover pid.
Note: the workspace hook `block-kill-by-name.sh` blocked my `pkill` and also `kill -INT -<pgid>`; plain `kill <pid>` works.

**7. MCP** (00:50:02, `CAW_WORKER_ID` unset) `bun run mcp </dev/null` → `CAW_WORKER_ID is required: the id of the CAW worker this MCP server acts as` / `error: script "mcp" exited with code 1`; `mcp exit=1` (matches `server.ts:169-173`).

**8. Looks wrong / unexplained** (listed, not fixed)
- `settings.test.ts:162` fails here because the bun path has `@` (see 3). 
- `grep -rn "TODO\|FIXME" src` → no output.
- `.env.example` keys (11): DATABASE_URL PORT BLUEPRINT_URL CAW_POLL_MS CAW_WORKSPACE_ROOT BLUEPRINT_WEB_URL CAW_API_URL RUNNER_POLL_MS RUNNER_HOP_MAX_MS CLAUDE_BIN RUNNER_TRACE_DIR. Code reads these too, **not in `.env.example`**: `HOST` (`index.ts:19`), `CAW_DEV_API_ENTRY` / `CAW_DEV_RUNNER_ENTRY` / `CAW_DEV_API_EARLY_MS` (`dev.ts:15-18`, test seams), `CAW_WORKER_ID` / `CAW_HOP_ID` (`mcp/server.ts:169,174`, set per worker by the runner, not by hand), and test-only `CAW_TEST_WORKSPACE_ROOT`, `CAW_TEST_SECRET`, `CHAT_TEXT`, `THREAD_ANSWER` (e2e/test). Every `.env.example` key is read by code. `test/config/env-example.test.ts` passes.
- SPEC-102 folder list omits `src/runner/trace.ts` (exists, 1 file, used for `RUNNER_TRACE_DIR`) — informational.
- `lsof` absent on this machine, so SPEC-102 G6 and TASK step 5 as worded cannot run; `ss -ltn` was used.
- Dead code / contradicting comments: **none shown** — I did not look for them beyond the headers I read; `UNVERIFIED — would need a reachability pass over src/ (e.g. unused exports)`.

**9. After** (00:51) — `git status --short` → (empty) · `git log -1 --oneline` → `102a130 chore: add merge and release workflows` · `ss -ltn | grep -c ':4500\b'` → `0`.

## Questions

## Review

**DONE** — Silver (SA, Team B), 2026-10-29 00:55. Every DoD item has its command and real output; G1–G10 kept
(no runner, no e2e, no G4 script, tree clean before/after at 102a130).

- Re-checked by the SA: `process.execPath` under bun here = `/usr/local/lib/pnpm/5/.pnpm/bun@1.4.2/node_modules/bun/bin/bun.exe`
  (contains `@`) and `src/runner/settings.ts:29` quotes anything outside `[A-Za-z0-9_/.-]` — Bob's observed cause for the
  `settings.test.ts:162` fail holds. `which lsof` → nothing, `ss` present. `/v1/openapi.json` at `app.ts:40`. `git status` empty.
- Case C: 1 fail in the SA's run, pass in Bob's full run and alone → recorded in the map as **flaky under load
  (`inferred`)**, not as a stable fail. QA's AC-3 re-run should expect 1–2 fails.
- **Two defects were in my TASK, not in the work:** DoD 5's curl had no `X-CAW-Actor` header (so it answered 400
  `actor_required`, not the Blueprint-down case — Bob added the header and got the 502), and G6/DoD 5 named `lsof`,
  which this machine lacks. Both written to `FAILURES.md`. Bob's recovery was correct.
- `trace.ts` missing from SPEC-102's runner list: noted; the map takes Bob's list.
- Dead-code pass `UNVERIFIED` as Bob says — acceptable: REQ-101 req 7 asks for what we *found*; recorded in the map as not searched.
