# SPEC-123: CAW can be set up on a Linux server from its own docs (REQ-123, Team B side)
- Source: REQ-123 (req 1–8, AC-1…8, Team B rows) · shared shapes from Team A's SPEC-121 (D2/D3/D4/D6/D7) and SPEC-122 (local fonts), read as files
- Status: **STOPPED by the owner** (2026-10-30 23:3x — DECISIONS 23:3x, *"เรื่องฝั่ง deployment ไม่ต้องแตะอะไรเลย"*; § Stopped below) · was DONE (2026-10-30 23:2x, Silver — TASK-163/164/165 DONE; REQ-123 B SPEC_DONE) · was ACTIVE (2026-10-30 23:0x, Silver — TASK-163/165 TODO, TASK-164 after TASK-163)
- Read: caw-back 2426d9a, caw-front a009d2c (`atom`, 2026-10-30, after REQ-122's commit): `caw-back → package.json:4-15`, `src/index.ts`, `src/runner/{config,guard,main,prompt}.ts`, `src/db/{client,migrations-config}.ts`, `src/scripts/migrate.ts`, `.env.example`; `caw-front → package.json:5-14`, `src/app/layout.tsx`, `src/app/globals.css:71-72`, `src/words.ts:153`, `next.config.ts`, `playwright.config.ts:33-35`, `tsconfig.json:9,31-38`, `README.md`.

## Overview

Two services and one web app must be set up from the READMEs alone, on a plain Linux server, under pm2.
- **caw-back** runs as **two** long-lived processes: `caw-back-api` (`src/index.ts`, :4500) and `caw-back-runner` (`src/runner/main.ts`). The MCP server is not a service: the runner starts one per worker (`hop.ts` `buildMcpConfig`).
- **caw-front** is one Next app (:3500).

What is missing today, and what this SPEC does about each:
| Gap (evidence) | Req / AC | Design |
|---|---|---|
| READMEs: caw-back 10 bytes; caw-front 2 293 bytes, dev-only | 1–3 / AC-1, AC-2 | D8 |
| `caw-back-runner` refuses to start until `<CAW_WORKSPACE_ROOT>/scripts/hooks/` holds 3 guard hooks (`config.ts:8,60-64`). caw-back ships none (`git ls-files`); today's root got them **by hand** from this desk's `scripts/hooks` (`cmp`: byte-identical) | 6 / AC-3 | D3 |
| Start errors: API prints `DATABASE_URL is not set …` and nothing for a bad port or an unmigrated DB; runner prints `runner: …` | 5 / AC-4 | D1, D2, D4 |
| caw-front fetches `IBM_Plex_Sans_Thai` from Google at build (`layout.tsx:4,15`): **offline build exit 1 in 5 s** on `fonts.googleapis.com` (`tests/harness/req-123-b/base-offline.log`) — TEST-120 DEF-1's defect on the CAW side | 7 / AC-7 | D6 |
| `.env.example` misses variables the code reads; `CAW_POLL_MS`'s comment says 30000, the code says 10 000 (`src/index.ts`) | 4 / AC-5 | D7 |
| Folder hint shows a Mac path (`words.ts:153`) | 4 / AC-6 | D9 |
| No pm2 files | 3 | D5 (pm2 runs HELD — DECISIONS 19:3x) |

Skills already need nothing: since REQ-117 a worker's skill falls back to CAW's shipped `skills/role-*` (`prompt.ts:2-3,48`). A brand-new root needs only D3.
`jq` and `perl` are hard prerequisites. The hooks pass everything when `jq` is missing, and the runner already **refuses to start** until each hook really blocks its probe (`guard.ts:1-3,23-31`). D8 lists them.

## D0 — shape
No route, request/response, schema, column, `openapi.json` or exported type changes. No front `gen:api`. New modules only, called from the two entry points. `loadConfig` and `probeHooks` are unchanged; D2's settings check runs **before** them, so their own errors become a backstop.
Consumers (probe): not run — no shape change. Grep for the old start texts in tests: `test/dev.test.ts:30,97,163` print and expect **a stub runner's own copy** of the old line (not the real runner) → untouched — the stub is not the runner and keeps its text.

## D1 — caw-back-api start checks (TASK-163)
New `src/startup.ts`, called by `src/index.ts` **before** `createDb`. It follows SPEC-121 D2. Every line starts `caw-back-api: ` and ends ` — see README § Configuration`. It is **the first line the process prints**, on stderr, followed by `process.exit(1)`. Never a `DATABASE_URL` value.
| Case | Rule | Line (after `caw-back-api: `) |
|---|---|---|
| `DATABASE_URL` missing or empty | — | `missing required setting DATABASE_URL` |
| not `pglite:memory`, not `pglite:file:<dir>`, not a URL with protocol `postgres:`/`postgresql:` | as `src/db/client.ts:16-23` | `wrong setting DATABASE_URL (not pglite:memory, pglite:file:<dir> or a postgres:// URL)` |
| `PORT` set, not an integer 1…65535 | `/^\d+$/` + range | `wrong setting PORT ("<value>" is not a port number)` |
| Postgres, cannot reach | `select count(*) from caw.__caw_migrations` throws with a code other than `42P01` | `wrong setting DATABASE_URL (cannot reach the database, code <code>)` |
| Postgres, not migrated / behind | the query throws `42P01`, or the count < the journal's entries (`src/db/migrations/meta/_journal.json`: 14 on 2426d9a) | `database is not migrated — run bun run db:migrate` |
| `Bun.serve` throws | `try/catch` around it | `cannot listen on <HOST>:<PORT> (<code>)` |
| `pglite:*` | `createDb` migrates itself (`client.ts:17-20`) | — no database check |
The journal table is CAW's own, `caw.__caw_migrations` (`src/db/migrations-config.ts`), **not** drizzle's default: CAW shares the database with Blueprint. Optional `HOST`, `CAW_POLL_MS`, `BLUEPRINT_URL`, `BLUEPRINT_WEB_URL`: not checked `[SA-decided]`, as SPEC-121 D2.
Shape: `checkApiSettings(env): string | null` · `checkDatabase(sql): Promise<string | null>` (one connection, one query, closed before `createDb`).

## D2 — caw-back-runner start checks (TASK-163)
In `src/runner/main.ts` `import.meta.main`, **before** `loadConfig`: `checkRunnerSettings(env, { isExecutable })` from a new `src/runner/startup.ts`, then `prepareRoot` (D3), then today's `loadConfig` + `probeHooks`. Every line starts `caw-back-runner: ` and is the first stderr line, followed by exit 1.
| Case | Line (after `caw-back-runner: `) |
|---|---|
| `CAW_WORKSPACE_ROOT` missing or empty | `missing required setting CAW_WORKSPACE_ROOT — see README § Configuration` |
| not absolute | `wrong setting CAW_WORKSPACE_ROOT ("<value>" is not an absolute path) — see README § Configuration` |
| `RUNNER_POLL_MS` / `RUNNER_HOP_MAX_MS` / `RUNNER_WORKER_MAX_TASKS` / `RUNNER_WORKER_MAX_TOKENS` / `RUNNER_WORKER_IDLE_MS` set and not a positive number | `wrong setting <VAR> ("<value>" is not a positive number) — see README § Configuration` |
| the Claude program (`CLAUDE_BIN`, else `~/.local/bin/claude`, as `config.ts:66,76`) missing or not executable | `no Claude CLI at <path> — install it, or set CLAUDE_BIN — see README § Claude CLI` |
| D3 cannot create the root or copy a hook | `cannot prepare CAW_WORKSPACE_ROOT (<code>) — see README § Configuration` |
| a `GuardError` from `probeHooks` | `<its message> — see README § Prerequisites` (the message already names jq/perl, `guard.ts:31`) |
| a `ConfigError` that still reaches the catch (backstop) | `<its message> — see README § Configuration` |
The path in the CLI line is not a secret (a program path). The Claude **login** is not checked at start: no check that spends no quota is known (R2). D8 covers it.

## D3 — CAW prepares a brand-new work root (req 6, AC-3; TASK-163)
- **Ship the three guard hooks in caw-back:** new folder `hooks/` at the repo root, holding `block-shell-edits.sh`, `block-irreversible.sh`, `block-kill-by-name.sh`, **byte-identical** to `/workspace/caw-workspaces/scripts/hooks/*` today (= the desk's `scripts/hooks`, `cmp` 22:4x), mode 0755 (`chmod +x` in the tree; `git add` then records 100755 — checked by the SA before `ขึ้น git`). Each keeps its comment header as is.
- New `src/runner/root.ts` `prepareRoot(root, shippedHooksDir, log): void`: `mkdirSync(root, { recursive: true })` → `mkdirSync(<root>/scripts/hooks, { recursive: true })` → for each name in `HOOKS` (`config.ts:8`): if `<root>/scripts/hooks/<name>` does not exist, copy the shipped file and `chmod 0o755`, logging `prepared <root>/scripts/hooks/<name> from CAW's own copy`. **An existing hook is never overwritten** (an operator's own wins, the same rule as skills, `prompt.ts:48`). A failure throws with its `code` → D2's line.
- `shippedHooksDir` = `fileURLToPath(new URL("../../hooks", import.meta.url))` from `src/runner/root.ts`.
- `.claude/skills` is **not** created or filled: the shipped-skill fallback already covers it (REQ-117).
- **Boundary case (spec-rules §3, the existing rule `config.ts:60-64`):** a root that has 2 of the 3 hooks, one of them not executable. `prepareRoot` copies only the missing one and leaves the non-executable one as it is. `loadConfig` still refuses on it with today's `guard hook not executable …`, which D2's backstop prints. An operator's file is never "fixed" by CAW.

## D4 — caw-front start check (TASK-165)
SPEC-121 D3, word for word, with `caw-front` for `blueprint-front` and **3500** for 3100: `scripts/start.mjs` (glue) + `scripts/start-settings.mjs` (`portFrom`, `portFree`) + `scripts/start-settings.test.mjs` (`.mjs`: `tsconfig.json:9` `allowJs: false`, `:33-34` include `**/*.ts(x)` only). `"start": "node scripts/start.mjs"` (was `next start -p ${PORT:-3500}`). Lines: `caw-front: wrong setting PORT ("<value>" is not a port number) — see README § Configuration` · `caw-front: port <port> is in use — see README § Configuration` · `caw-front: cannot listen on port <port> (<code>) — see README § Configuration`.
Playwright is unaffected: it runs `bunx next start -p <port>` itself (`playwright.config.ts:34`).
caw-front has no required setting: `CAW_API_URL` / `BLUEPRINT_URL` default (`src/api/http.ts:20`, `src/blueprint.ts:3`). **On a server, `BLUEPRINT_URL` is the address the user's browser opens** for the link back to Blueprint: Blueprint's public address. The README says so (the same note as SPEC-121 D3 for `CAW_URL`).

## D5 — pm2 files (TASK-164, TASK-165; runs HELD)
- `caw-back/ecosystem.config.cjs`: `{ apps: [ { name: "caw-back-api", cwd: __dirname, script: "bun", args: "run src/index.ts", interpreter: "none" }, { name: "caw-back-runner", cwd: __dirname, script: "bun", args: "run src/runner/main.ts", interpreter: "none" } ] }`. A one-line comment says why `interpreter: "none"` (SPEC-121 D4 / E8), and that the runner needs the API up (it checks in to it), so the API comes first in the file. No `env` block: Bun loads `.env` from `cwd`.
- `caw-front/ecosystem.config.cjs`: `{ apps: [{ name: "caw-front", cwd: __dirname, script: "scripts/start.mjs", interpreter: "node" }] }`.
- caw-back `package.json`: keep `api` and `runner` (`bun run api` / `bun run runner` are the manual starts). No `start`: two processes, so one `start` would hide one.
- pm2 is **HELD** on this box (DECISIONS 19:3x, F-048). The files are written and syntax-checked (`node -e` is hook-blocked, so `node --check ecosystem.config.cjs`). No pm2 run until the PM releases it.

## D6 — caw-front builds with no internet (req 7, AC-7; TASK-165)
- **Files:** `tests/harness/req-123-b/fonts/` → `caw-front → src/app/fonts/`: `ibm-plex-sans-thai-400.woff2` (37 068 B) · `-500.woff2` (38 196 B) · `-600.woff2` (38 688 B) · `ibm-plex-sans-thai.OFL.txt` (sha256 in `SHA256SUMS` there). Built by `tests/harness/req-123-b/build-fonts.sh` (google/fonts @ `6157dfaa640c`, the commit SPEC-122 used; fontTools 4.65.0 subset, every code point the source has, all layout features → woff2). The committed files are the artifact, not the script.
- **Loader:** exactly `tests/harness/req-123-b/fonts-local.patch` (1 file, +11 −2): `import localFont from "next/font/local"`, three `src` entries (400/500/600, `style: "normal"`), `display: "swap"` and `variable: "--font-plex"` kept, so `globals.css:71-72` (`var(--font-plex)`) needs nothing.
- **Proof (scratch copy of a009d2c with a real `bun install`, real repo untouched; no internet = `unshare -rn` with loopback up, because the layout asks caw-back on 127.0.0.1):**
  - base offline → **exit 1 in 5 s**: `There was an issue establishing a connection while requesting https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai…`
  - patched offline → **exit 0 in 9 s**, `.next/static/media` = the three `ibm_plex_sans_thai_{400,500,600}…woff2` + the icon
  - patched online → exit 0 in 10 s · `typecheck` 0
  (Logs: `base-offline.log`, `patched-offline.log`. My first two offline tries hung or failed for reasons of my setup — a `node_modules` symlink, which Turbopack refuses, and a namespace without loopback — not of the build.)
- **Look (risk R1, as TEST-120 DEF-2):** Google serves "thai" + "latin" subsets of the same family, and these files carry every code point of the source. A glyph Google took from a fallback could now come from Plex, or the reverse. **QA compares a screenshot of one page before/after**, like REQ-123 AC-10 for Blueprint.

## D7 — `.env.example` (req 4, AC-5; TASK-164, TASK-165)
Read by product code (`git grep process.env` / `env.X`, all tracked `.ts`, minus tests and `src/runner/e2e/`, 22:4x):
- **caw-back** product reads 21. Listed today: 11. **Add:**
  - (app) `HOST` (`src/index.ts`, default `127.0.0.1`; "only this machine unless you set it") · `RUNNER_WORKER_MAX_TASKS` (5) · `RUNNER_WORKER_MAX_TOKENS` (150000) · `RUNNER_WORKER_IDLE_MS` (1800000) (`src/runner/config.ts`, REQ-122)
  - (dev only) `CAW_DEV_API_ENTRY`, `CAW_DEV_RUNNER_ENTRY`, `CAW_DEV_API_EARLY_MS` (`src/dev.ts`), commented
  - (set by CAW itself for each worker's MCP server — never set them) `CAW_WORKER_ID`, `CAW_HOP_ID`, `CAW_HOP_FILE` (`src/mcp/server.ts`), commented, in their own short section
  - (tests only, commented) `CAW_TEST_SECRET`, `CAW_TEST_WORKSPACE_ROOT`, `CAW_MARK`, `STUB_API_EXIT_AFTER_MS`, `STUB_API_EXIT_CODE`, `STUB_RUNNER_EXIT_AFTER_MS`, `LIVE_VIEW_*` (5), `TICKS`, `THREAD_ANSWER`, `CHAT_TEXT`
  - Fix: `CAW_POLL_MS` "empty means **10000**" (`src/index.ts`); `CAW_WORKSPACE_ROOT` = "CAW's own work folder; every project's folders must be inside it; CAW puts its guard hooks in `scripts/hooks/` there on first start. Required by the runner."
- **caw-front** product reads 5 (`CAW_API`, `CAW_API_URL`, `BLUEPRINT_URL`, `CAW_TEST_RESET`, `NEXT_DIST_DIR`). Listed: 4 + `PORT`. **Add** `NEXT_DIST_DIR` (`next.config.ts`, default `.next`, "only to build into another folder"), and tests-only commented `PLAYWRIGHT_PORT`, `PLAYWRIGHT_DEV_PORT`, `PLAYWRIGHT_OUTPUT`, `NEXT_DIST_DIR_DEV`.
- Every value stays **empty**. Never a real `DATABASE_URL`.

**AC-5 grep** (product code, both repos, 22:4x): `git grep -nE '/Users/|/opt/homebrew|darwin|cp -c|open -a|pbcopy|\.DS_Store' -- src ':!*.test.ts' ':!*.test.tsx'` →
- caw-back: no hits
- caw-front: `src/words.ts:153` (→ D9) and `src/api/mock.ts:302-303` (mock data, allowed by req 4) → no other work
- Hosts: every `127.0.0.1` in both repos' product `src` is an env-backed default (`src/index.ts` `HOST`, `config.ts` `CAW_API_URL`/`BLUEPRINT_*`, `http.ts:20`, `api/index.ts:25`, `blueprint.ts:3`) → no work.

## D8 — READMEs (req 1–3, AC-1/2; TASK-164 caw-back, TASK-165 caw-front)
SPEC-121 D6's eleven sections, in that order, English, `§ Configuration` as the heading the lines point at. Differences for CAW:
- **caw-back prerequisites** add: `jq` (`jq --version`) and `perl` (`perl -v`) — the runner refuses to start without them, and why (one line) · **Claude CLI** (`claude --version`, tested 2.1.314), its own section **§ Claude CLI**: install it **as the user pm2 runs CAW as**, then run `claude` once in a terminal as that user and log in to the subscription. The runner starts `~/.local/bin/claude` unless `CLAUDE_BIN` says otherwise. A login cannot be checked at start (R2); a hop then fails with Claude's own message in `pm2 logs caw-back-runner`.
- **caw-back database:** the same Postgres as Blueprint is fine — CAW keeps everything in its own schema `caw` (`migrations-config.ts`) → `bun run db:migrate` → `migrations applied`. `pglite:file:<dir>` for a single-box trial that keeps data, `pglite:memory` for a throw-away one.
- **caw-back § CAW work folder:** set `CAW_WORKSPACE_ROOT` to an empty folder the pm2 user owns. On first start the runner creates it if needed and puts its guard hooks in `scripts/hooks/`. Every CAW project's folders must be inside it (the runner refuses others, `hop.ts:351-353`). It must not be inside any of the four repos.
- **caw-back start/stop:** two pm2 names, `caw-back-api` then `caw-back-runner`. Check it is up: `curl -s http://127.0.0.1:<PORT>/health` (the API) → `{"ok":true}` (`src/app.ts:26`) — and `pm2 logs caw-back-runner --lines 20` shows `started — API …` (`main.ts`). Without pm2: `bun run api` and `bun run runner`, each in its own terminal.
- **caw-front:** keep today's development notes under a final `## Development` heading. The top becomes production: `bun run build` → `pm2 start ecosystem.config.cjs` → `curl … /` → `200`. `NEXT_DIST_DIR` is only for building into another folder. Prerequisites: `bun`, `node` ≥ 20.9 (Next's start check runs on node), no Chrome.
- **§ Start-up errors:** the D1/D2 (caw-back) and D4 (caw-front) lines, with what to do for each.
- **§ I-Space on one server:** SPEC-121 D7's text **word for word** in both CAW READMEs (`diff` against blueprint-back's README section → empty). I checked its CAW rows against the code: caw-back :4500 (`src/index.ts`), caw-front :3500 (`package.json:9`), caw-front → caw-back via `CAW_API_URL` (`http.ts:20`) — **correct, no change asked**.

## D9 — folder hint (AC-6; TASK-165)
`caw-front → src/words.ts:153` `hint: "ใส่ path เต็ม เช่น /home/…/my-repo"` — the PM's REQ-123 table, verbatim. caw-front's words are Thai only, so there is no EN line. No placeholder.
Consumers (grep, added 2026-10-30 23:1x after TASK-165 Q1 — a text change, no shape): `src/words.test.ts:36` pins the old hint → TASK-165 (that one string). The other `/Users/…` paths in tests are example data → untouched — allowed by req 4.

## Flow
- Start (pm2 or `bun run …`) → settings check → (api) database check / (runner) `prepareRoot` → `loadConfig` → `probeHooks` → listen / first tick.
- Any failure → one line, exit 1. pm2 restarts it and the line repeats in `pm2 logs <name>`.
- Success → exactly today's behaviour.

## Non-functional
One Postgres round trip at API start; one copy of ≤ 3 small files at the first runner start; nothing per request. No secret printed.

## Risks, assumptions, unknowns
- **R1 font look:** see D6. QA screenshot before/after; a difference → DEF, not a design change.
- **R2 Claude login:** not checkable at start without spending quota (assumed — `claude --version` succeeds logged out; the first hop then fails with Claude's message). What would settle it: a documented, no-quota auth-status command in the installed CLI; none was found in `claude --help` (2.1.312, REQ-107 study).
- **R3 working setup:** the API now refuses to start on an unmigrated Postgres. If the working remote TEST DB is behind, run `bun run db:migrate` first (as SPEC-121 R1).
- **R4 hook copies drift** from the desk's `scripts/hooks`. The repo copy is CAW's now; the desk changing its own guards does not change CAW's. Accepted `[SA-decided]` — a hook change for CAW is a CAW topic.
- **pm2 HELD:** AC-1/2's pm2 steps wait for the PM's release (DECISIONS 19:3x).

## Tasks
- TASK-163: caw-back — API start checks (D1), runner start checks (D2), the work root prepares itself with shipped hooks (D3) — owner: BE Bob (depends on: REQ-122 committed 2426d9a ✓)
- TASK-164: caw-back — README (D8), `.env.example` (D7), `ecosystem.config.cjs` (D5) — owner: BE Bob (depends on: TASK-163 DONE — the README lists its exact lines)
- TASK-165: caw-front — start check (D4), local font (D6), `.env.example` (D7), hint (D9), pm2 file (D5), README (D8) — owner: FE Fanta (depends on: REQ-122 front committed a009d2c ✓; parallel with TASK-163)
AC map (Team B): AC-1 → TASK-164 + 165 (+ QA, pm2 HELD) · AC-2 → TASK-164 + 165 § Update (+ QA) · AC-3 → TASK-163 D3 (+ QA stub) · AC-4 → TASK-163 (back) + TASK-165 (front) · AC-5 → D7 grep + TASK-164/165 `.env.example` · AC-6 → TASK-165 D9 · AC-7 → TASK-165 D6 (+ QA fresh clone, offline) · AC-8 → each TASK's suites.

## Questions
- **Q1 (non-blocking, PM — user-visible in the pm2 log):** the start lines in D1/D2/D4 beyond the PM's form `<service>: missing required setting <VAR> — see README § Configuration`. They follow Sober's Q4 lines, which the PM accepted (REQ-123 Q4), plus four runner-only ones: `wrong setting CAW_WORKSPACE_ROOT ("<value>" is not an absolute path)` · `wrong setting <VAR> ("<value>" is not a positive number)` · `no Claude CLI at <path> — install it, or set CLAUDE_BIN — see README § Claude CLI` · `cannot prepare CAW_WORKSPACE_ROOT (<code>)`. **Default: these words; the TASKs are cut with them.** Correct only the line that is wrong.
- **Q2 (non-blocking, info):** shipping the three guard hooks inside caw-back (D3, R4) makes CAW's copy separate from the desk's own guards. Default: yes — CAW must prepare its root alone (req 6).
  > answer (Porter, PM, 2026-10-30 23:0x) `[PM-decided]`: **Q1 accepted** — those words, each line starting with `<service>: ` as in REQ-123 Q4. **Q2 accepted** — CAW ships its own copy of the guard hooks; that is what req 6 asks. If the desk's guards change later, the two copies are synced as their own topic. The caw-front font fix (same as TEST-120 DEF-1) is in scope under req 7, and QA checks it as AC-9 for caw-front.

## Stopped — what is left uncommitted (Silver, 2026-10-30 23:3x, read-only listing)
The owner stopped REQ-123 on both sides (DECISIONS 2026-10-30 23:3x). The B-side work below stays in the trees **as is: not committed, not reverted, no pm2, not tested**, until the owner decides. All three TASKs were DONE (reviewed) before the stop; nothing was mid-edit.

**caw-back** — HEAD `2426d9a` (REQ-122), tree-fp `cd8dfd83981c` (262 paths: 252 tracked, 10 untracked), 14 paths:
- modified (4): `.env.example` · `README.md` · `src/index.ts` · `src/runner/main.ts`
- new (10): `ecosystem.config.cjs` · `hooks/block-irreversible.sh` · `hooks/block-kill-by-name.sh` · `hooks/block-shell-edits.sh` · `src/runner/root.ts` · `src/runner/root.test.ts` · `src/runner/startup.ts` · `src/runner/startup.test.ts` · `src/startup.ts` · `src/startup.test.ts`
- TASKs: 163 (start lines + work root prepares itself) · 164 (README, `.env.example`, pm2 file)

**caw-front** — HEAD `a009d2c` (REQ-122), tree-fp `1b01369237d6` (154 paths: 146 tracked, 8 untracked), 14 paths:
- modified (6): `.env.example` · `README.md` · `package.json` · `src/app/layout.tsx` · `src/words.ts` · `src/words.test.ts`
- new (8): `ecosystem.config.cjs` · `scripts/start.mjs` · `scripts/start-settings.mjs` · `scripts/start-settings.test.mjs` · `src/app/fonts/ibm-plex-sans-thai-{400,500,600}.woff2` · `src/app/fonts/ibm-plex-sans-thai.OFL.txt`
- TASK-165 (local font, start check, Linux hint, `.env.example`, pm2 file, README)

**What this blocks, and what the owner may want to know when he decides** (`[SA-decided]` reading of F-013, DECISIONS 23:3x "Neighbouring"):
- **Any next topic in caw-back or caw-front waits for his ruling.** One tree per repo: a new TASK there would mix with this work, and QA fingerprints the whole tree.
- Two pieces are not deployment and help the local full loop. (1) `src/words.ts:153`: the folder hint shows `/home/…` instead of a Mac path. (2) caw-front's local font: the build no longer needs the internet; this is TEST-120 DEF-1's defect on the CAW side. Keeping or dropping them is his call. I propose nothing here beyond saying it.
- Desk-side artifacts (`tests/harness/req-123-b/`, `task165/`, `spec122-*`) are coordination files and stay.
