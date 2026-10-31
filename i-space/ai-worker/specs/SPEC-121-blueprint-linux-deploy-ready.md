# SPEC-121: Blueprint can be set up on a Linux server from its own docs (Team A side of REQ-123)
- Source: REQ-123 (Team A: `blueprint-back`, `blueprint-front`; Team B's side is SA B's own SPEC)
- Status: DONE (2026-10-30 20:25, Sober — TASK-155/156 DONE; pm2 runs HELD, DECISIONS 19:3x)
- Read on: `blueprint-back` `atom` 6123018 · `blueprint-front` `atom` 6692a16 (both trees clean, 2026-10-30 19:06)

## Overview

Five small things, all in Team A's two repos. Nothing in the API, schema or `openapi.json` changes.
Consumers (probe): not run — no shape change (D1); 0 errors expected, none found in the built TASK-156

1. **Start checks**: each service checks its required settings and its port at start and exits with one line (D2, D3).
2. **pm2**: one `ecosystem.config.cjs` per repo, one process each, named `blueprint-back` / `blueprint-front` (D4).
3. **`start` scripts**: blueprint-back gets `start`; blueprint-front's `start` honours `PORT` (D3, D4).
4. **`.env.example`** lists every variable the code reads (D5).
5. **READMEs**: written from the template in D6, plus the shared "I-Space on one server" section (D7).

## What I ran on the base (evidence; scratch only, real repos untouched)

| # | Check (2026-10-30, 19:1x–19:3x) | Result on the base |
|---|---|---|
| E1 | bp-back, no `DATABASE_URL` (cwd without `.env`) | `DATABASE_URL is not set (use pglite:memory for local)`, exit 1. Already fails fast; only the wording changes. |
| E2 | bp-back, port already taken | Bun prints 5 source lines first, then `error: Failed to start server. Is port 4292 in use?`, exit 1. **The first line does not name the port** (AC-4). |
| E3 | bp-back, `PORT=abc` | source lines, then `RangeError: … Received NaN`, exit 1. **No variable named.** |
| E4 | bp-back, `DATABASE_URL=postgres://u:p@127.0.0.1:1/blueprint` | **Starts**, `/health` → 200, and the first data call → `500` + `[http] 500 Error code=ECONNREFUSED`. **This is the "late crash" of req 5.** |
| E5 | bp-front, a second `next start -p 3191` on a taken port | first line `⨯ Failed to start server`, second line `Error: listen EADDRINUSE … :::3191`, exit 1. **First line does not name the port.** |
| E6 | bp-front built at 12:30 without `BLUEPRINT_API_URL`, started with `BLUEPRINT_API_URL=http://127.0.0.1:4293`, project made on :4293 | the home page shows that project. **The URL is read at run time, not at build time**, so one build serves any env. |
| E7 | fresh `git clone -b atom` of bp-front (6692a16) → `bun install --frozen-lockfile` → `bun run build` | 219 packages, **build exit 0** on Debian 13 (Linux x64). Nothing extra needed (the theme registry is made by `prebuild`). |
| E8 | pm2 7.0.4 (`npx -y pm2@7.0.4`, own `PM2_HOME`), bp-back with `interpreter: "bun"`, `script: "src/index.ts"` | **crash loop** (restarts 12 → 23): `TypeError: require() async module "…/src/index.ts" is unsupported` (`pm2/lib/ProcessContainerForkBun.js:25`). `src/index.ts` uses top-level `await`. ⇒ that form must not be used. |
| E9 | the same, with `script: "bun"`, `args: "run src/index.ts"`, `interpreter: "none"` | online; `/health` → `{"ok":true,"service":"blueprint-back"}`; 3 × `pm2 restart` → back up each time (allow ~5 s for the migrations on `pglite:memory`); `pm2 stop` frees the port. |
| E10 | bp-front under pm2: `script: "node_modules/next/dist/bin/next"`, `args: "start -p 4394"`, `interpreter: "node"` | online, `/` → 200, `pm2 restart` → 200 again; `pm2 kill` frees both ports. |
| E11 | this box: `pm2` | **not installed** (`pm2: command not found`); bun 1.4.2, node v24.22.1, Debian 13, `google-chrome` at `/usr/bin/google-chrome`. |

## D1 — no shape change
No route, request/response, schema, column, `openapi.json` or exported type changes in either repo. No front `gen:api` step (spec-rules §2: `openapi.json` is untouched). The new functions are new modules; their only callers are the new start code and new tests.
Consumers (probe): not run — no shape change; the only existing caller of a changed file is `blueprint-front → playwright.config.ts:21` (`bun run start -- -p ${port}`), handled in D3 (a `-p` argument wins) and run in TASK-156's DoD.

## D2 — blueprint-back start checks (TASK-155)

New `src/startup.ts`, called by `src/index.ts` **before** `createApp`. Every message starts `blueprint-back: ` and ends ` — see README § Configuration`, is written to stderr as **the first line the process prints**, and is followed by `process.exit(1)`. Never the value of `DATABASE_URL` (it may hold a password).

| Case | Rule | Line (after `blueprint-back: `) |
|---|---|---|
| `DATABASE_URL` missing or empty | — | `missing required setting DATABASE_URL` |
| `DATABASE_URL` not `pglite:memory` and not a URL whose protocol is `postgres:` or `postgresql:` | `new URL()` | `wrong setting DATABASE_URL (not pglite:memory or a postgres:// URL)` |
| `PORT` set, not an integer 1…65535 | `/^\d+$/` and range | `wrong setting PORT ("<value>" is not a port number)` |
| Postgres URL, the database cannot be reached | `select count(*) from drizzle.__drizzle_migrations` throws with a code other than `42P01` | `wrong setting DATABASE_URL (cannot reach the database, code <code>)` |
| Postgres URL, migrations missing or behind | the query throws `42P01`, **or** the count < the number of entries in `src/db/migrations/meta/_journal.json` (12 on 6123018) | `database is not migrated — run bun run db:migrate` |
| `Bun.serve` throws (port in use, bad `HOST`) | `try/catch` around `Bun.serve` | `cannot listen on <HOST>:<PORT> (<code>)`, e.g. `cannot listen on 127.0.0.1:4200 (EADDRINUSE)` |
| `pglite:memory` | `createDb` already applies every migration (`src/db/client.ts:16-20`) | — no database check |

Shape: `export function checkSettings(env: Record<string, string | undefined>): string | null` (the full line or null) and `export async function checkDatabase(sql: { unsafe(q: string): Promise<unknown[]> } | …): Promise<string | null>`. The engineer picks the exact parameter type for the database check (a `postgres` client is enough). The check opens one connection, runs the one query, and ends the connection before `createDb` makes its own. Migration table name/schema: drizzle's defaults, `node_modules/drizzle-orm/pg-core/dialect.js:45-46` (`"__drizzle_migrations"`, `"drizzle"`); `src/scripts/migrate.ts` passes no override.
`checkDatabase` code mapping: drizzle/postgres errors carry `code` on the error or on `cause` (same as `src/scripts/migrate.ts:19-20`); no code → `none`.

Decided `[SA-decided]` (cheap to reverse): **optional settings with defaults (`HOST`, `SOURCES_DIR`, `GATEWAY_URL`, `GATEWAY_LIGHT_MODEL`, `CAW_NOTIFY_URL`) are not checked at start.** Req 5 names required settings, and `CAW_NOTIFY_URL` and `GATEWAY_LIGHT_MODEL` already report a bad value at call time by design (`src/seam/notify.ts:12-16`, `src/gateway/models.ts:12-16`). A bad `HOST` is caught by the listen row.

**Behaviour change on the working setup (risk R1):** if the remote TEST DB is behind on migrations, blueprint-back now refuses to start with the "not migrated" line. Before, it would have started and failed on some calls. That is the point of req 5. But whoever starts the working setup next must run `bun run db:migrate` first if the line appears.

## D3 — blueprint-front start check (TASK-156)

New `scripts/start.mjs`, which becomes `package.json` `"start": "node scripts/start.mjs"` (was `next start -p 3100`). In order:
1. Load env the way Next does: `loadEnvConfig(process.cwd())` from `@next/env`. It is Next's own loader, installed with `next` 16.3.6 at `node_modules/@next/env`, the same version. So `.env.local` and `.env` apply to the check exactly as to the app.
2. Port = the value after a `-p` argument if given (Playwright passes `-- -p <port>`, `playwright.config.ts:21`), else `PORT`, else `3100`. Not an integer 1…65535 → `blueprint-front: wrong setting PORT ("<value>" is not a port number) — see README § Configuration`, exit 1.
3. Port free? Listen on it with `node:net` (no host = all interfaces, as `next start` does, E5 `:::3191`) and close. `EADDRINUSE` → `blueprint-front: port <port> is in use — see README § Configuration`, exit 1. Other error → `blueprint-front: cannot listen on port <port> (<code>) — see README § Configuration`, exit 1.
4. Run Next **in the same process**: set `process.argv` to `[node, <next bin>, "start", "-p", <port>]`, then `await import("next/dist/bin/next")`. One process, so pm2's stop and restart reach Next directly (E10 ran that same file as pm2's script).
The checks live in `scripts/start-settings.mjs` (`export function portFrom(argv, env): { port: number } | { line: string }` and `export async function portFree(port): Promise<string | null>`). `start.mjs` is only the glue. Unit tests go in `scripts/start-settings.test.mjs`: `.mjs`, not `.ts`, because `tsconfig.json` has `allowJs: false` and includes `**/*.ts`, so a `.ts` test importing the `.mjs` would fail `typecheck`. `bun test` runs `.test.mjs` (checked 19:5x).

The front has **no required setting**: `BLUEPRINT_API_URL` and `CAW_URL` default to `http://127.0.0.1:4200` / `http://127.0.0.1:3500` (`src/core/api/client.ts:7`, `src/features/ready/load.ts:146`). They are optional and not checked, `[SA-decided]`, same reason as D2.
**On a server, `CAW_URL` is the address the user's browser opens** ("ส่งไปสร้างที่ CAW" opens it in the browser). It must be caw-front's public address, not `127.0.0.1`. The README says this in the variable's row.

## D4 — pm2 (both TASKs)

One file per repo at the repo root, `ecosystem.config.cjs` (`.cjs` because blueprint-back's `package.json` has `"type": "module"`, so a `.js` there would be ESM; the front uses the same name so both READMEs say one thing). Exactly:
- blueprint-back: `{ apps: [{ name: "blueprint-back", cwd: __dirname, script: "bun", args: "run src/index.ts", interpreter: "none" }] }` — the E9 form. **Never** `interpreter: "bun"` (E8). Add a one-line comment saying why.
- blueprint-front: `{ apps: [{ name: "blueprint-front", cwd: __dirname, script: "scripts/start.mjs", interpreter: "node" }] }`.
- No `env` block: settings come from the repo's `.env` (back, Bun loads it from `cwd`) or `.env.local` (front, D3 step 1). `cwd: __dirname` is what makes that work.
- blueprint-back also gets `"start": "bun run src/index.ts"` in `package.json`, so `bun run start` is the documented manual start. `dev` stays.

## D5 — `.env.example` (AC-5)

What the code reads, from `git grep` of `process.env.X` over all tracked `.ts/.tsx/.mjs/.cjs` (19:3x):
- blueprint-back reads 10: `DATABASE_URL PORT HOST SOURCES_DIR GATEWAY_URL CAW_NOTIFY_URL` (listed) + **`GATEWAY_LIGHT_MODEL`** (`src/gateway/models.ts:11`, product) + **`BLUEPRINT_LINK_TEST_ALLOW`** (`src/sources/link.ts:98`, product code, test-only seam, ignored with a real DB) + **`BLUEPRINT_GATEWAY_LIVE`** (`test/gateway/live.smoke.test.ts:5`) + **`BLUEPRINT_SIT`** (`test/sit/rules.sit.test.ts:33`). The four in bold are missing → TASK-155 adds them: `GATEWAY_LIGHT_MODEL` in the app section (default `tier:small`, `src/gateway/models.ts:7`), the other three commented, in a "tests only" section, the way blueprint-front's file does.
- blueprint-front reads 13, and all 13 are in its `.env.example` already. Only the `PORT` line is new (D3) → TASK-156.

AC-5 grep, product code (`src/` minus tests), both repos, 19:3x:
`git grep -nE '/Users/|/opt/homebrew|darwin|cp -c|open -a|pbcopy|\.DS_Store' -- src ':!*.test.ts' ':!*.test.tsx' ':!test/'` → **no hits in either repo**.
Hosts: `git grep -nE '127\.0\.0\.1|localhost|https?://…' -- src …` → bp-back `src/index.ts:14` (`HOST` default, env-backed), `src/gateway/client.ts:74` (`GATEWAY_URL` default, env-backed; owner 10:51: live defaults are correct), `src/interview/context.ts:52` (an example inside a Thai prompt — text, not a host the code calls); bp-front `src/core/api/client.ts:7`, `src/features/ready/load.ts:146` (env-backed defaults), `src/features/export/pdf.ts:3,25,29` (the PDF guard — see R2). No unconditional host. **No work** beyond D5's four lines.
Not product code: `blueprint-front → scripts/check-required.ts:185` `cp -cR` falls back to `cpSync` at :186 (a test tool; REQ-123 § What is there) → no work.

## D6 — README template (both repos)

Each README replaces the current one-line file, in English, in this order. `§ Configuration` is the heading the start lines point at.
1. **What it is**: one paragraph, and its port.
2. **Prerequisites**: Linux x64 (tested: Debian 13). `bun` 1.4.x (tested 1.4.2, `bun --version`). Front also `node` ≥ 20.9 (tested 24.22.1, `node --version`) and Google Chrome for the PDF export (`google-chrome --version`). Back: PostgreSQL, or `pglite:memory` for a throw-away trial (data lost on restart). `pm2` (tested 7.0.4, `pm2 --version`; `npm install -g pm2` if missing). Each with the command that checks it.
3. **Install**: `git clone -b atom <repo URL>`, `cd`, `bun install --frozen-lockfile`.
4. **Configuration**: copy `.env.example` → `.env` (back) / `.env.local` (front). Then a table with **every** variable from D5: name · what it is · example · required/optional (default). Tests-only variables in a second, short table. The secret rule: never commit `.env`, never paste `DATABASE_URL` anywhere.
5. **Database** (back only): `bun run db:create` (only if the database does not exist; it must be named `blueprint`, `src/scripts/create-db.ts:7`) → `bun run db:migrate` → `migrations applied`.
6. **Build**: front `bun run build` (one build serves any env, E6); back: no build step, Bun runs the TypeScript.
7. **Start, stop, restart, logs** (pm2): `pm2 start ecosystem.config.cjs` (first time) · `pm2 restart <name>` · `pm2 stop <name>` · `pm2 logs <name>` · `pm2 save` (so `pm2 resurrect` / `pm2 startup` bring it back after a reboot; `pm2 startup` is the owner's, one-off, needs root). Without pm2: `bun run start`.
8. **Check it is up**: back `curl -s http://127.0.0.1:<PORT>/health` → `{"ok":true,"service":"blueprint-back"}` (`src/app.ts:26`); front `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:<PORT>/` → `200`. After a start or restart, allow a few seconds.
9. **Update** (the owner's way, req 3): `git pull` (branch `atom`) → `bun install --frozen-lockfile` → back `bun run db:migrate` / front `bun run build` → `pm2 restart <name>` → step 8.
10. **Start-up errors**: the table of D2 / D3 lines, with what to do for each.
11. **I-Space on one server**: the shared section, D7, word for word.

## D7 — shared section "I-Space on one server" (both teams' READMEs)

Team A writes it into both Blueprint READMEs. **The PM gives this text to SA B** for the CAW READMEs (req 2: repeated in each README). CAW rows come from `SYSTEM-FACTS.md` § Repos and environments. SA B corrects them in the CAW copies through the PM if they are wrong.

```markdown
## I-Space on one server

I-Space is four services. Default ports (each one's `PORT` / start setting can change it):

| Service | Port | Talks to | Setting that points at it |
|---|---|---|---|
| blueprint-back (API) | 4200 | its database | blueprint-front `BLUEPRINT_API_URL` · caw-back `BLUEPRINT_URL` |
| blueprint-front (web) | 3100 | blueprint-back; opens caw-front in the user's browser | caw-back `BLUEPRINT_WEB_URL` · caw-front `BLUEPRINT_URL` |
| caw-back (API, MCP, runner) | 4500 | its database, blueprint-back, Claude CLI | caw-front `CAW_API_URL` |
| caw-front (web) | 3500 | caw-back | blueprint-front `CAW_URL` (the user's browser opens it) |

Start order: blueprint-back → blueprint-front → caw-back → caw-front. Only the two web ports (3100, 3500) must be reachable from users' browsers; the APIs can stay on 127.0.0.1.

First time on a new server: install the prerequisites of all four READMEs → clone all four on branch `atom` → fill each `.env` → blueprint-back `bun run db:migrate` → caw-back's database and CAW work folder steps (caw-back README) → Claude CLI installed and logged in to the subscription as the user pm2 runs CAW as (caw-back README) → build both fronts → `pm2 start ecosystem.config.cjs` in each repo, in the order above → each README's "Check it is up" → `pm2 save`.
```

## Flow

Start (pm2 or `bun run start`) → the settings check → (back) the database check → listen. Any failure → one line, exit 1. pm2 then restarts it, and the same line repeats in `pm2 logs`, which is what the owner reads. Success → the service runs exactly as today.

## Non-functional

- The start checks add one database round trip at back start (Postgres only). Nothing per request.
- No secret printed: D2 prints `DATABASE_URL` by name only. A `PORT` value is not a secret.

## Risks, assumptions, unknowns

- **R1**: the working setup's TEST DB may be behind on migrations. Then blueprint-back refuses to start after TASK-155. **Settled by:** QA's AC-8 start on the working setup; `bun run db:migrate` is the fix (the owner allows writes there, SYSTEM-FACTS 12:54).
  - **R1 check, 2026-10-30 20:47 (Sober, on the PM's DECISIONS 20:4x item 3):** blueprint-back on 6123018 ships 12 migrations (`src/db/migrations/meta/_journal.json`, idx 0–11). **The files are all additive. I read all 12:** they create tables, triggers and indexes and add columns. The two changes that are not plain adds keep every value: 0006 `versions.last_change_set DROP NOT NULL` loosens a constraint, and 0010 adds `change_sets.rev`, fills it with a per-project `row_number()` by `at,id`, then sets NOT NULL plus a unique index on (project_id, rev). No DROP TABLE/COLUMN, no RENAME, no type change, no DELETE. The desk added 0006–0011 (a4bf924, e2c3326, e4b2579, 93249a7); 0000–0005 came from the old team (8480363). **Not done: which of them the TEST DB has applied, and the migration itself.** My one try was a 20 s start on port 4298 against the working `.env` (the start check counts `drizzle.__drizzle_migrations`, `src/startup.ts:49-50`). This session's permission layer refused it ("Modify Shared Resources"), so I did not connect to the TEST DB at all, and I will not get round the refusal with `db:migrate`. **Settled by:** the owner either allows this SA session to run `bun run db:migrate` in blueprint-back on the working `.env`, or runs it himself. `migrations applied` is the expected line; `db:migrate failed — code <c>` → tell the SA.
- **R2 — the PDF export on a server is likely blocked** (inferred, not reproduced). `src/features/export/pdf.ts:25-30` lets Chrome load only `localhost` / `127.0.0.1`. The route prints `new URL(printPath(projectId), req.url)` (`src/app/p/[projectId]/export/pdf/route.ts:31`). A user who opens the site by the server's IP or name makes `req.url` that host, so Chrome's very first request (the print page) is aborted. My probe: through `127.0.0.1:3191` once 200 in 1.5 s (allowed=41 aborted=0), but the runs after it timed out even on `127.0.0.1`, because my own leftover back held port 4293. So the LAN-IP case is **not settled**. **What would settle it:** a clean run, `curl http://<LAN IP>:<port>/p/<id>/export/pdf` vs the same through `127.0.0.1`. Not in REQ-123's ACs. Asked as REQ-123 Q2.
- **R3**: `@next/env` comes with `next` (not a direct dependency). Same version as `next` (16.3.6), so it cannot drift on its own. If a future Next drops it, `start.mjs` fails loudly at start, not silently.
- **R4 — pm2 is banned on this box** (owner, DECISIONS 2026-10-30 19:3x) until F-048's cause is accepted. My E8–E10 trial left orphan daemons of ~2 GB each, because a long `PM2_HOME` socket path → `EINVAL` → endless `listen` retries. E9/E10 ran under a short `PM2_HOME` and stand as evidence, but TASK-155 DoD 8, TASK-156 DoD 10 and QA's pm2 steps are HELD. The files are still written. On a server, pm2's default `~/.pm2` is short, so the README needs no `PM2_HOME` at all.
- **A1**: pm2 on the SIT server is the owner's (he uses it today). This box has none (E11), so QA's AC-1/2 run needs one. Asked as REQ-123 Q3.
- **A2**: one server, all four services as one user. The README says the CAW user must be the one logged in to Claude CLI (caw-back's README carries the how).

## Tasks
- TASK-155: blueprint-back: start checks, `start` script, pm2 file, `.env.example`, README. Owner: BE Jason (depends on: none; base 6123018)
- TASK-156: blueprint-front: start check, `start` script, pm2 file, `.env.example` `PORT`, README. Owner: FE Fern (depends on: none; base 6692a16). Independent of TASK-155: no shared file; the README's D7 text is fixed here.

AC map (Team A side): AC-1 → D2–D7 (both) · AC-2 → D6 step 9 + D4 (E9/E10 show restart) · AC-3 → Team B · AC-4 → D2 + D3 · AC-5 → D5 · AC-6 → Team B · AC-7 → E7 + D6 step 6 (bp-front) · AC-8 → each TASK's full-suite DoD; R1.

## Questions
(Asked in REQ-123 § Questions, so the PM has them in one place.)
