# CAW code map (REQ-101, Team B)

- Written by: Silver (SA, Team B), 2026-10-29 · Source: `specs/SPEC-102-caw-code-map.md`
- Repos: `caw-back` on `atom` @ 102a130 · `caw-front` on `atom` @ 4b58bf3 (both `git status --short` empty, 2026-10-29)
- Citations: `<repo> → <file>:<line>`, from `grep -n` / `nl -ba`. A cause found only by reading is marked `inferred`.
- **State of this file:** complete for REQ-101 (2026-10-29 01:00). § Folders, § Run, § Main flow and part of § Open
  questions come from TASK-103 (Bob) and TASK-104 (Fanta), reviewed `DONE` by the SA with spot re-checks
  (`tasks/TASK-103-caw-back-study.md`, `tasks/TASK-104-caw-front-study.md` hold the raw output).

## What CAW is, in one paragraph (from the code)

`caw-back` is one Bun program with three entry points: the **HTTP API** (`src/index.ts`, Hono + zod-openapi
over Drizzle/Postgres or PGlite, `:4500`), the **runner** (`src/runner/main.ts` — polls the API for work and
starts one Claude CLI child per *hop*), and the **MCP server** (`src/mcp/server.ts` — stdio, started by each
Claude CLI child, a thin adapter over the API as that worker). `bun run dev` (`src/dev.ts`) starts API + runner
together. `caw-front` is a Next 16 app (`:3500`) whose every screen goes through one interface `CawApi`
(`caw-front → src/api/caw.ts`), implemented over HTTP (`src/api/http.ts`) or a built-in mock (`src/api/mock.ts`,
`CAW_API=mock`). caw-front never calls Blueprint's API (`caw-front → src/blueprint.ts:1-2`).

## Folders (AC-2)

### caw-back `src/` (cite = `caw-back → src/<file>:<line>`)

| Entry | What it is for | Cite |
|---|---|---|
| `app.ts` | builds the Hono/zod-openapi app, mounts every route group; `GET /health`, `GET /v1/openapi.json` | `app.ts:25`, `app.ts:40` |
| `index.ts` | API entry (`bun run api`): `DATABASE_URL` (required), `PORT` (4500), `HOST` (127.0.0.1), `CAW_POLL_MS`; starts the Blueprint follower | `index.ts:7,19,23-24` |
| `dev.ts` | `bun run dev`: API + runner as two children, lines `[api]` / `[runner]`; a runner that stops leaves the API up | `dev.ts:1-10` |
| `blueprint/` | the seam client on Blueprint's read API (§ Seam) | `blueprint/client.ts:1-3` |
| `cards/` | card writes; API view with computed `workable` | `cards/service.ts:1`, `cards/view.ts:1-2` |
| `chain/` | a project's worker chain: members, directed edges, entry worker | `chain/service.ts:1-2` |
| `chat/` | operator chat + the entry worker's replies; `guard.ts` = "holds a running chat hop" | `chat/service.ts:1`, `chat/guard.ts:1` |
| `core/` | the event store: `events.ts` vocabulary · `reduce.ts` the one pure reducer · `write.ts` the one write path · `state.ts` tables⇄state · `rebuild.ts` replay · `ids.ts`, `paths.ts`, `stable.ts` | `core/events.ts:1`, `core/reduce.ts:1`, `core/write.ts:1` |
| `db/` | Drizzle schema in Postgres schema `caw`; URL forms `pglite:memory` / `pglite:file:<dir>` / Postgres; journal `caw.__caw_migrations`; migrations 0000–0009 | `db/schema.ts:1`, `db/client.ts:13-24`, `db/migrations-config.ts:1` |
| `follow/` | pulls Blueprint's change feed, flags cards whose anchor changed | `follow/pull.ts:1-3` |
| `hops/` | hops and runs (written by the runner through the API) | `hops/service.ts:1-3` |
| `http/` | `actor.ts` the `X-CAW-Actor` rule (operator / `worker:<id>` / `runner:<name>`) · `errors.ts` one error body · `routes/` 10 files | `http/actor.ts:1`, `http/errors.ts:6` |
| `mcp/` | stdio MCP server given to each worker; each tool = one API call as `worker:<CAW_WORKER_ID>`. Started by the worker's `claude` (via the per-hop `mcp.json`, `runner/hop.ts:127-130`); talks only to the CAW API (`CAW_API_URL`); env `CAW_WORKER_ID` (required — exits 1 without it, run by Bob), `CAW_HOP_ID` (optional; without it write tools answer `hop_required`); one file, 176 lines | `mcp/server.ts:1-6`, `:168-175` |
| `projects/` | projects made from a confirmed Blueprint version; one per Blueprint project | `projects/service.ts:1`, `:26-30` |
| `proposals/` | the entry worker proposes cards in a chat hop; the operator accepts | `proposals/service.ts:1-3` |
| `runner/` | the local process beside the API: no state of its own, reads/writes only through the API, starts one `claude -p` child per hop (§ Claude CLI). Started by `bun run runner` or `dev.ts`; refuses without `CAW_WORKSPACE_ROOT`. Env: `CAW_WORKSPACE_ROOT`, `CLAUDE_BIN`, `CAW_API_URL`, `RUNNER_POLL_MS` (2000), `RUNNER_HOP_MAX_MS` (20 min), `RUNNER_TRACE_DIR`. Files: `main.ts` loop · `plan.ts` pure tick decision · `hop.ts` one hop · `prompt.ts` · `stream.ts` stream-json parser · `settings.ts` worker settings + hooks · `guard.ts` proves the hooks block · `read-guard.ts` read fence · `procs.ts` process-group files · `redact.ts` · `report.ts` Thai run report · `trace.ts` · `fixtures/` recorded streams · `e2e/` dev scripts (some REAL — never run here). Tests sit beside the code (`*.test.ts`) | `runner/main.ts:1-2`, `runner/config.ts:30,40`, `runner/hop.ts:1`, `runner/trace.ts:11` |
| `scripts/` | operator scripts: `migrate.ts` (`db:migrate`), `db-inspect.ts` (read-only), `db-fix-journal.ts`, `emit-openapi.ts` (writes `openapi.json`) — none run (G4) | `scripts/migrate.ts:1`, `scripts/emit-openapi.ts:1` |
| `seam/` | `locate` / `amendments` proxied to Blueprint; Blueprint down → 502 | `seam/service.ts:1-3` |
| `workers/` | global named workers with roles, model, effort | `workers/service.ts:1-3` |

### caw-back `test/`

`setup/no-operator-env.ts` — preload (`bunfig.toml:3`) that deletes every `.env.example` key so tests never see the
operator's `.env` · `helpers/` — app on PGlite + fake Blueprint (`helpers/api.ts:1`, `helpers/fake-blueprint.ts:1`), one
shared PGlite emptied per test (`helpers/db.ts:4`) · `fixtures/blueprint/` — recorded Blueprint answers · `blueprint/` seam
client · `config/` `.env.example` shape · `core/` event store · `db/` migrations 0002–0009 + journal + file DB · `follow/`
Blueprint pull · `http/` 24 route-level tests · `mcp/` MCP tools · `scripts/` db scripts · `dev.test.ts` `bun run dev`.

### caw-back HTTP routes (`grep -n 'path:'`, Bob 2026-10-29)

GET `/health` `app.ts:25` · GET `/v1/openapi.json` `app.ts:40` ·
**projects.ts:** POST `/v1/projects` :38 · GET `/v1/projects` :47 · GET `/v1/projects/{id}` :52 · PATCH `…/mode` :57 · PATCH `…/workspace` :67 · PUT `…/code-map` :75 · POST `…/code-map/confirm` :81 · GET `…/parts/{key}` :86 · GET `…/events` :95 · POST `…/rebuild-check` :104 ·
**cards.ts:** POST/GET `/v1/projects/{id}/cards` :38/:49 · GET `/v1/cards/{cardId}` :61 · GET `…/context` :66 · POST `…/comments` :71 · POST `…/handoff` :76 · PATCH `…/status` :85 · PATCH `…/assignee` :90 · POST `…/question` :95 · POST `…/answer` :103 · POST `…/spec-change/clear` :108 ·
**chain.ts:** GET `/v1/projects/{id}/chain` :21 · POST `…/chain/members` :26 · DELETE `…/chain/members/{workerId}` :31 · POST `…/chain/edges` :40 · DELETE `…/chain/edges` :48 · PUT `…/chain/entry` :56 ·
**chat.ts:** POST/GET `/v1/projects/{id}/chat` :26/:31 · GET `/v1/chat/{messageId}/context` :37 · POST `…/reply` :45 · POST `…/retry` :54 ·
**proposals.ts:** POST/GET `/v1/projects/{id}/proposals` :25/:31 · POST `/v1/proposals/{id}/accept` :36 ·
**hops.ts:** POST `/v1/projects/{id}/hops` :31 · PATCH `/v1/hops/{hopId}` :39 · POST `…/heartbeat` :44 · GET `/v1/projects/{id}/hops` :49 · POST `…/runs` :55 · PATCH `/v1/runs/{runId}` :61 · GET `/v1/projects/{id}/runs` :67 ·
**workers.ts:** POST `/v1/workers` :25 · PATCH `/v1/workers/{id}` :42 · DELETE same :51 · POST `/v1/workers/combine` (deprecated) :59 · GET `/v1/workers` :68 ·
**seam.ts:** POST `/v1/projects/{id}/locate` :15 · POST `…/amendments` :20 · **follow.ts:** POST `/v1/notify` :9 · **team.ts:** POST `/v1/runner/check-in` :43 · GET `/v1/team-status` :54.

### caw-front `src/` (cite = `caw-front → src/<file>:<line>`)

| Entry | What it is for | Cite |
|---|---|---|
| `api/` | the one seam between screens and caw-back: `caw.ts` the `CawApi` interface + types · `http.ts` over caw-back's HTTP (openapi-fetch) · `mock.ts` in-memory sample data · `index.ts` picks one by `CAW_API` (default `http`) and holds `backendReachable()` · `schema.d.ts` generated OpenAPI types (3765 lines) | `api/caw.ts:1`, `api/http.ts:1`, `api/mock.ts:1`, `api/index.ts:1-9` |
| `app/` | Next App Router: pages, layouts, server actions, error / not-found, `globals.css` tokens | `app/layout.tsx:21`, `app/p/[id]/actions.ts:1` |
| `blueprint.ts` | builds "open this part in Blueprint" URLs from `BLUEPRINT_URL` | `blueprint.ts:3,5-6` |
| `components/` | screen pieces: Board, CrewStrip, FirstSteps, LiveRefresh (3 s poll), ModeControl, Person, BackendDown, SampleDataMark, NameParts; `card/`, `chat/`, `faces/`, `runs/`, `team/` (incl. CodeMap), `workspace/`, `ui/` (12 shadcn/radix primitives) | `components/Board.tsx:3`, `components/LiveRefresh.tsx:2`, `components/BackendDown.tsx:3`, `components/ui/button.tsx:1` |
| `lib/` | pure helpers over `CawApi` data: crew per seat, event sequence, live polling, faces, roles, readiness, starting team, `cn` | `lib/crew.ts:1`, `lib/readiness.ts:1`, `lib/liveEvents.ts:2` |
| `theme/` | `CawRoot` (theme root, `--caw-*` aliases), `ThemeToggle`, `tokens.ts` ("Graphite Desk") | `theme/CawRoot.tsx:1`, `theme/tokens.ts:1` |
| `words.ts` | every user-facing Thai word, 386 lines | `words.ts:1` |

caw-front `tests/` — Playwright on the production build against the mock: `fixtures.ts` (resets the mock via
`POST /test-reset` before each test), `ac5.spec.ts` + `ac5-probe.ts` (every screen × 1440/1280/390 × light/dark), and
`smoke board card chat mode project-screen projects runs sample-data team test-reset workspace .spec.ts`. Config
`playwright.config.ts:5,24,34` (port 3510, `channel: "chrome"`, `next start` with `CAW_API=mock CAW_TEST_RESET=1`).
Unit tests are `src/**/*.test.ts(x)` (23 files).

### caw-front routes

| URL | File | What it shows |
|---|---|---|
| `/` | `app/page.tsx:24` | project list; unreachable → `startRefused.unreachable` (`:52`); none → `projectCard.none` + "เปิด Blueprint" (`:54`) |
| `/start?project=&version=` | `app/start/page.tsx:23` | makes the project and redirects to its board, or says why not (`:28-36`) |
| `/p/[id]` | `app/p/[id]/page.tsx:16` | board: first steps, crew strip, what waits on you, mode control, five columns |
| `/p/[id]/c/[cardId]` | `app/p/[id]/c/[cardId]/page.tsx:12` | one card: context, timeline, actions, "ดู spec" link |
| `/p/[id]/team` | `app/p/[id]/team/page.tsx:13` | workers, chain, folders, code map |
| `/p/[id]/runs` | `app/p/[id]/runs/page.tsx:13` | mode + run state, runs and hops |
| `/p/[id]/chat` | `app/p/[id]/chat/page.tsx:15` | thread with the entry worker, questions, card proposals |
| `/test-reset` | `app/test-reset/route.ts:13` | test-only POST; 404 unless `CAW_API=mock` **and** `CAW_TEST_RESET=1` (`:11`) |

Layouts: `app/layout.tsx:21` (shows `BackendDown` in http mode when caw-back is unreachable, `:35`) ·
`app/p/[id]/layout.tsx:17` (project header + nav).

## Run — install, test, start (AC-3, AC-4)

SA base run, 2026-10-29 ~00:40–00:55, this machine, Bun 1.4.2:

| Repo | Command | Result |
|---|---|---|
| caw-back | `bun install --frozen-lockfile` | `121 packages installed` |
| caw-back | `bun test` | `676 pass · 1 skip · 2 fail` — `Ran 679 tests across 60 files. [104.51s]` |
| caw-front | `bun install --frozen-lockfile` | `445 packages installed` |
| caw-front | `bun test src` | `328 pass · 0 fail` — `Ran 328 tests across 23 files. [2.43s]` |
| caw-front | `bun run typecheck` | `tsc --noEmit`, no errors |

Second runs, 2026-10-29 00:45–00:52 (TASK-103 / TASK-104):

| Repo | Command | Result |
|---|---|---|
| caw-back | `bun install --frozen-lockfile` (warm) | `Checked 124 installs across 213 packages (no changes)` |
| caw-back | `bun test` | `677 pass · 1 skip · 1 fail` — `Ran 679 tests across 60 files. [105.67s]` |
| caw-back | `bun test src/runner/settings.test.ts` | `23 pass · 1 fail` (`:162`) |
| caw-back | `bun test test/scripts/db-scripts.test.ts` | `11 pass · 0 fail [20.11s]` (Case C passes alone) |
| caw-front | `bun install --frozen-lockfile` (warm) | `Checked 450 installs across 498 packages (no changes)` |
| caw-front | `bun test src` / `bun run typecheck` | `328 pass · 0 fail`, 23 files / clean |
| caw-front | `NEXT_DIST_DIR=.next-f bun run build` | `✓ Compiled successfully`, exit 0; routes `/ /_not-found /icon.svg /p/[id] /p/[id]/c/[cardId] /p/[id]/chat /p/[id]/runs /p/[id]/team /start /test-reset` |
| caw-front | `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` | `257 passed (2.7m)`, exit 0 (local Google Chrome). The `ac5-dev` project (`AC5_DEV=1`) is not in the default run — not run |

**Expect, on a re-run:** caw-back 1–2 fails (see AC-4 list) — any other fail is new. Install line differs cold
("N packages installed") vs warm ("Checked … (no changes)").

**Start (how, and what it says):**

| Command | Observed |
|---|---|
| caw-back `DATABASE_URL=pglite:memory CAW_POLL_MS=0 bun run api` | `caw-back API on http://127.0.0.1:4500`; `GET /health` → `{"ok":true}`; `GET /v1/openapi.json` → 200 |
| … `POST /v1/projects` without `X-CAW-Actor` | 400 `{"error":{"code":"actor_required",…}}` — calls need the actor header, **except** `POST /v1/notify` (Blueprint's push) and `POST /v1/projects/{id}/rebuild-check` (`caw-back → src/http/actor.ts:16-17` `NO_ACTOR`; QA TEST-101 S-F1, SA re-checked 2026-10-29) |
| … same with `X-CAW-Actor: operator`, Blueprint not running | 502 `{"error":{"code":"blueprint_unreachable","message":"blueprint_unreachable (network)"}}` |
| caw-back `DATABASE_URL=pglite:memory CAW_POLL_MS=0 bun run dev`, `CAW_WORKSPACE_ROOT` unset | `[runner] runner: CAW_WORKSPACE_ROOT is not set: …` · `[runner] stopped: …` · `[api] caw-back API on http://127.0.0.1:4500` — runner refuses, API stays up |
| caw-back `bun run mcp </dev/null`, `CAW_WORKER_ID` unset | `CAW_WORKER_ID is required: …`, exit 1 |
| caw-front `bun run dev:mock` | `✓ Ready`; `/` → 200, bar "ข้อมูลตัวอย่าง — ไม่ได้ต่อกับ CAW จริง · ใช้ข้อมูลจริง: bun run dev" |
| caw-front `bun run dev` (http), caw-back down | `/` → 200 showing `BackendDown`: "ยังต่อ caw-back ไม่ได้ — เปิด caw-back ก่อน แล้วกดลองอีกครั้ง" + the command `cd caw-back && bun run dev` |

**Observed, not fixed (AC-4):**
- `src/runner/settings.test.ts:162` fails on this machine because bun's `process.execPath` is
  `/usr/local/lib/pnpm/5/.pnpm/bun@1.4.2/node_modules/bun/bin/bun.exe` (contains `@`), and `settings.ts:29` single-quotes
  any path outside `[A-Za-z0-9_/.-]`; the test expects it unquoted. SA re-checked both. Machine-dependent; the quoted form is
  valid shell (`inferred` — the real runner would settle it, and that needs the owner's word).
- `test/scripts/db-scripts.test.ts` Case C (`:123`) timed out at 5000 ms in the SA's run; passed in Bob's full run and alone
  (~20 s file). `inferred: flaky under load` — a second full run on an idle machine would settle it.
- Skip: `src/runner/guard.test.ts:51` — needs `CAW_TEST_WORKSPACE_ROOT` (runs the real hooks); deliberately left unset.
- 🔴 **caw-front: use only a `NEXT_DIST_DIR` name already listed in `tsconfig.json`** (`.next-b`, `.next-f`, `.next-qa`,
  `.next-sa`, `.next-dev`, `.next-b-dev`, `.next-f-dev` — `caw-front → tsconfig.json:39-52`). A new name makes Next.js rewrite the
  **tracked** `tsconfig.json` (QA observed it, TEST-101 O-2 / F-003; SA has not re-run it). `.next-f` used in this map is safe.
- `lsof` is not installed on this machine; `ss -ltn` works. `bun run` leaves a child: stop by the bun pid, not only the
  shell's. The workspace hook `block-kill-by-name.sh` refuses `pkill`.

## The read-API seam, from CAW's side (AC-5)

All six calls live in `caw-back → src/blueprint/client.ts`. Base URL: `BLUEPRINT_URL`, else
`http://127.0.0.1:4200` (`client.ts:28`). Errors: on a GET, 404 → `null` ("does not exist"); network error,
any other status, or a body that is not JSON → `BlueprintUnreachable` (`client.ts:34-48`) — never a null.

| Call | What CAW sends | What CAW takes from the answer | Who calls it in caw-back |
|---|---|---|---|
| getProject(bp) | `GET /v1/projects/{bp}` | `project.name` only (`client.ts:62-65`) | `projects/service.ts:21` (make a project) |
| getVersion(bp, n) | `GET /v1/projects/{bp}/versions/{n}` | `version`, `confirmedAt` (`client.ts:66-69`) | `projects/service.ts:23`, `cards/service.ts:59`, `proposals/service.ts:63` |
| partContext(bp, n, key) | `GET /v1/projects/{bp}/versions/{n}/parts/{key}/context` | the whole body, passed through unread (`client.ts:70`) | `cards/service.ts:62,96`, `proposals/service.ts:71`, `projects/service.ts:103` |
| versionsAfter(bp, after) | `GET /v1/projects/{bp}/versions?after={after}` | `VersionFeed` = `versions[] {version, confirmedAt, confirmedBy, summary, changes{added,changed,removed}}`, `latest`, `changedSinceLatest` (`client.ts:8-13`); a 404 here → unreachable "project not found" (`:84`) | `follow/pull.ts:47` (the follower, every `CAW_POLL_MS`, `index.ts:23-24`) |
| locate(bp, request) | `POST /v1/projects/{bp}/locate` `{ request }` | the body as returned; reads `candidates[].key` (`seam/service.ts:22-23`); non-200 → unreachable (`client.ts:73`) | `seam/service.ts:22` ← CAW's own `POST /v1/projects/{id}/locate` (`http/routes/seam.ts:14-17`) |
| amend(bp, body) | `POST /v1/projects/{bp}/amendments` `{ from, request, about? }` | 201 → the message; 400 with `error.message` → a refusal CAW turns into its own 400 `amendment_refused`; anything else → unreachable (`client.ts:76-81`, `seam/service.ts:39`) | `seam/service.ts:38` ← CAW's `POST /v1/projects/{id}/amendments` (`seam.ts:19-23`) |

- **The push the other way — Blueprint → CAW** (QA TEST-101 S-F2, SA re-checked 2026-10-29): CAW receives
  `POST /v1/notify` with body `{ event: "version.confirmed", projectId, version, confirmedAt }` (zod: `event` literal,
  `projectId` string ≥1, `version` int ≥1, `confirmedAt` string), **no actor header** (`http/actor.ts:17`), answers
  **202 `{}`** at once and runs the pull for that Blueprint project in the background (`caw-back → src/http/routes/follow.ts:6-17`);
  a bad body → 400. Blueprint's side describes it as one attempt, no retry — the timer pull (`versionsAfter`, every
  `CAW_POLL_MS`) is what catches a missed push (`index.ts:22-24`). QA saw it work end to end (BP v2 confirm moved CAW to v2).
- `from` = `caw:<projectId>:<hopId>` or `caw:<projectId>:operator` (`seam/service.ts:38`).
- CAW keeps no spec text: partContext/locate/amend answers are passed through; a hop keeps only located keys
  (`seam/service.ts:1-3`, `:24-30`).
- **Inferred, for the comparison with Team A:** CAW's code reads Blueprint answers by field name with a type cast,
  no runtime validation (`client.ts:63,67,85`) — a field renamed on Blueprint's side would surface as `undefined`,
  not as an error. `inferred — Team A's description of the shapes settles it`.

**Front links, CAW side** (run on `dev:mock` in TASK-104; mock knows Blueprint project
`11111111-2222-4333-8444-555555555555`, versions 1–4, `caw-front → src/api/mock.ts:15-16`):

| `/start` call | Observed | Words |
|---|---|---|
| no query / `?project=x&version=abc` | stays, 200 | "ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์และเวอร์ชัน" (`words.ts:257`) |
| `?project=x&version=3` (unknown) | stays, 200 | on sample data the sample-data sentence replaces "not found" (`start/page.tsx:49`, `words.ts:248`) |
| known project, `version=3` | **307 → `/p/10000000-0000-4000-8000-000000000001`** (409 `already_exists` followed, `mock.ts:477-478`) | — |
| known project, `version=99` | stays, 200 | "เวอร์ชันนี้ยังไม่ได้ยืนยันใน Blueprint" (`words.ts:255`) |

Not seen: the "new project created" path (the mock seed already holds one), and the `unreachable` / `other` refusals — `UNVERIFIED`.
No screen in caw-front links to `/start` (`grep -rn '/start' src`): it is entered only from outside. The card's "ดู spec"
href rendered as `http://127.0.0.1:3100/p/11111111-…/web?part=SCR-001` — identical to `blueprint.ts:5-6`.

1. **In:** `caw-front → src/app/start/page.tsx:23-36` — `/start?project=<bp id>&version=<n>` POSTs
   `createProject`; on success or on 409 `already_exists` it redirects to `/p/<id>`; else one sentence + "back".
   caw-back's checks behind it: Blueprint project missing → 404 `blueprint_project_not_found`; version not
   confirmed → 409 `version_not_confirmed`; one CAW project per Blueprint project → 409 `already_exists` with
   `details.id` (`caw-back → src/projects/service.ts:20-30`).
2. **Out (not in SYSTEM-FACTS):** "open this part in Blueprint" → `${BLUEPRINT_URL}/p/<bp>/web?part=<key>`,
   default `http://127.0.0.1:3100` (`caw-front → src/blueprint.ts:3-6`; used at `src/app/p/[id]/c/[cardId]/page.tsx:30`).
3. **Out (not in SYSTEM-FACTS):** an amendment reply carries `${BLUEPRINT_WEB_URL}/p/<bp>/chat`, built by caw-back
   (`caw-back → src/chat/service.ts:79`, URL from `src/blueprint/client.ts:31`).

## Claude CLI — where CAW starts it, and how tests avoid it (AC-8)

- **Where:** one place — `caw-back → src/runner/hop.ts:269`:
  `deps.spawn([config.claudeBin, ...args], { cwd, env: childEnv(process.env) })`. The real spawner is `bunSpawn`
  (`hop.ts:64-74`, `Bun.spawn(..., detached: true)` — own process group); the runner wires it at
  `src/runner/main.ts:359`, inside `if (import.meta.main)` (`main.ts:339`).
- **Which binary:** `CLAUDE_BIN`, else `~/.local/bin/claude` (`src/runner/config.ts:40`). The runner refuses to
  start without `CAW_WORKSPACE_ROOT` and the three workspace guard hooks (`config.ts:30-38`).
- **What it passes** (`hop.ts:139-156`): `-p <prompt>` · `--model`, `--effort` (the worker's) ·
  `--output-format stream-json --verbose` · `--permission-mode acceptEdits` · `--setting-sources project` ·
  `--settings <per-hop settings.json>` · `--mcp-config <per-hop mcp.json> --strict-mcp-config` · `--add-dir` for
  the other roots · chat hops: `--tools Read,Glob,Grep` (or `""`) · `--disallowedTools` (card hop: WebFetch, WebSearch;
  chat hop: Bash, Write, Edit, NotebookEdit, Task, WebFetch, WebSearch …) · `--append-system-prompt-file` when the
  worker has skills · `--no-session-persistence`.
- **Around it:** env is cut down to `PATH HOME USER LOGNAME LANG LC_ALL LC_CTYPE TMPDIR SHELL` (`hop.ts:97-101`);
  `mcp.json` names only CAW's MCP server, run as `bun run src/mcp/server.ts` with `CAW_API_URL`, `CAW_WORKER_ID`,
  `CAW_HOP_ID` (`hop.ts:127-130`); `settings.json` = allow-list of read/test commands + denies of curl/wget/nc/ssh/scp
  (`src/runner/settings.ts:8-26`) + the three guard hooks on Bash/Edit/Write (`settings.ts:47-50`) + a read fence
  hook on Read/Glob/Grep (`settings.ts:77`). Card hops run in the first root; chat hops in a private hop folder (`hop.ts:268-269`).
- **What tests use instead:**
  - unit tests inject a fake `spawn` (`src/runner/hop.test.ts:48`, `src/runner/main.test.ts:46`) that returns a
    `fakeChild` (`src/runner/testkit.ts:15`) replaying **recorded streams** `src/runner/fixtures/*.stream.jsonl`
    (`testkit.ts:7-8`, `stream.test.ts:6`); config `claudeBin: "/bin/claude"` is a dummy string never executed;
  - the only real `Bun.spawn` in a runner test is `sleep 30` (`hop.test.ts:429`);
  - dev scripts `src/runner/e2e/*` (not run by `bun test`) use a fake `claude` (`e2e/fake-claude.ts:1-4`), **except**
    `run.ts ac1|ac6|net` and `auto.ts thread` / `E2E_REAL=1`, which start the REAL claude by design
    (`run.ts:2-4`, `auto.ts:11-13`) — risk, see § Open questions.
- **No live run happened:** a real `claude` is installed here (`~/.local/bin/claude` → version 2.1.312), so this
  matters. No runner was started with `CAW_WORKSPACE_ROOT`, no e2e script was run — SPEC-102 G1; TASK evidence
  and the log carry the same.

## SYSTEM-FACTS `[team-proposed, Atlas read 2026-10-29]` lines about CAW, checked (AC-9)

| SYSTEM-FACTS line | Verdict | Evidence |
|---|---|---|
| L63-64: `atom` = old latest (`main` for caw) + one workflow commit | **confirmed** | both repos: `atom~1` = `origin/main` (caw-back cc7839a, caw-front 60f9745); `git diff --stat atom~1 atom` = only `merge-workflow.sh` (211) + `release-workflow.sh` (181); `develop` = `production` = `origin/atom` = HEAD |
| L69-71: Stack — Bun, TS; backs Hono + zod-openapi + Drizzle (pglite in tests); fronts Next 16 / React 19 (Playwright configs present) | **confirmed, with a detail** | caw-back `package.json`: hono 4.13.13, @hono/zod-openapi 1.6.3, drizzle-orm 0.45.4, @electric-sql/pglite 0.5.8; caw-front: next 16.3.6, react 19.3.0, `playwright.config.ts`. Detail: TypeScript differs — caw-back 7.0.2, caw-front 5.9.3. caw-front UI is radix-ui + tailwind (shadcn), not Ant Design as its README says |
| L72-74: caw-back API :4500 (plus MCP server and runner) · caw-front :3500 | **confirmed; "plus" clarified** | `caw-back → src/index.ts:19` `PORT \|\| 4500`; caw-front `package.json` `dev`: `-p ${PORT:-3500}`. The MCP server and the runner listen on **no** port: MCP is stdio (`src/mcp/server.ts:175`), the runner calls the API (`src/runner/config.ts:42`) |
| L75-76: sizes caw-back 9.3k / 5.2k · caw-front 13.4k / 2.6k | **confirmed under one reading** | `git ls-files` + `wc -l`: caw-back `src/**/*.ts` 9253, `test/` 5183; caw-front `src/**/*.ts(x)` 13401, `tests/` 2567. But "src" includes tests kept beside the code: caw-back `src/**/*.test.ts` = 3550 (non-test src 5703); caw-front `src/**/*.test.ts(x)` = 3297 (non-test src 10104) |
| L79-81: read API `caw-back/src/blueprint/client.ts` (88 lines) → `blueprint-back/src/seam/*`; calls getProject / getVersion / partContext / versionsAfter / locate / amend; `BLUEPRINT_URL` default `http://127.0.0.1:4200`; Blueprint owns the contract | **CAW half confirmed** | 88 lines (`wc -l`); the six calls `client.ts:15-25`; default `client.ts:28`. `blueprint-back/src/seam/*` and "who owns it" are Team A's side — not checked by Team B (REQ-101 constraint) |
| L82-83: front link — blueprint-front button opens caw-front `/start` (`CAW_URL`, default :3500), with version confirmation | **CAW half confirmed; one addition** | `/start` exists (`caw-front → src/app/start/page.tsx:23`), takes `project` + `version`, and caw-back refuses an unconfirmed version (409 `version_not_confirmed`, `caw-back → src/projects/service.ts:23-25`). `CAW_URL` is not read in CAW's repos (it is blueprint-front's). **Addition:** two links go back CAW → Blueprint web (§ Seam, front links 2 and 3) |
| L84-87: old ID series — SPEC-A all four repos; SPEC-B both fronts; SPEC-C blueprint-front screens + caw-back runner settings | **confirmed for CAW** | `git grep`: caw-back SPEC-A-005/008/009 (37 files), SPEC-B none, SPEC-C-003/004 (13 files, all `src/runner/*` + `.env.example`); caw-front SPEC-A-008/009 (25 files), SPEC-B-002/003/005 (15 files), SPEC-C none. Detail: caw-back's SPEC-C-004 is the chat hop (`src/runner/prompt.ts:83`), not only "runner settings" |

## Main flow — `/start` → board → card → team → runs → chat (AC-7)

Walked on `dev:mock` by Fanta 2026-10-29 (server-rendered HTML read; no button clicked). `CawApi` lines are
`caw-front → src/api/caw.ts`. Runs and workers are **mock data only** — no runner was started (G1).

| # | Screen (app's words) | Page file | `CawApi` calls | Mock answers |
|---|---|---|---|---|
| 1 | `/start?project=…&version=3` — no screen of its own; redirects | `app/start/page.tsx:30,36` | `createProject` (:226) | 409 `already_exists` → `/p/1000…0001` |
| 2 | **Board** "จองห้องประชุม": tabs บอร์ด · ทีม · การรัน · แชต; "ปลา เสนองานไว้ รอคุณตกลง"; crew strip; an open question with ตามนั้น / ตอบเอง…; mode แบบสั่งทีละขั้น / อัตโนมัติ; five columns holding 11 cards — the 12th (card …011) is the open-question panel above them (QA TEST-101 S-F6, screenshot `tests/harness/test-101/caw-walk/1-board.png`) | `app/p/[id]/page.tsx:16-22`, header `app/p/[id]/layout.tsx:19` | `project` (:198), `cards` (:204), `workers` (:211), `chain` (:212), `hops` (:213), `runs` (:214), `lastSeq` (:264), `teamStatus` (:271), `chat` (:275), `proposals` (:279), `cardContext` (:206) | seeded project, 4 workers, 12 cards, one running hop |
| 3 | **Card** "ทำหน้ายืนยันการจอง": status, owner, "อยู่ตรงไหนใน spec", ดู spec, links, decisions, "ต้องรอการ์ดเหล่านี้ก่อน", timeline, ส่ง | `app/p/[id]/c/[cardId]/page.tsx:14` | `project`, `cardContext` (:206), `workers`, `cards`, `chain`, `hops`, events; writes via server actions `app/p/[id]/actions.ts` | seeded context |
| 4 | **Team** ทีม: "+ เพิ่มคนทำงาน", โฟลเดอร์ของทีม ("ยังไม่ได้กำหนดโฟลเดอร์ — ทีมจะยังเริ่มทำงานไม่ได้"), chain, entry worker | `app/p/[id]/team/page.tsx:15` | `project`, `workers`, `chain`, `cards`, `hops`, events, `chat`, `projects` | chain of 4, no folders |
| 5 | **Runs** การรัน: mode, one finished run "ใช้งบครบแล้ว … งบ 3 ก้าว · ใช้ไป 3", 13,600 โทเค็น, hop list | `app/p/[id]/runs/page.tsx:15-17` | `project`, `runs` (:214), `hops`, `workers`, `cards`, `chat`, events | one stopped run, seeded hops |
| 6 | **Chat** "แชตกับ ปลา": operator message, reply with a question, a "3 งาน ใช้ประมาณ 6 ก้าว" proposal | `app/p/[id]/chat/page.tsx:18,24` | `project`, `chat` (:275), `proposals` (:279), `workers`, `chain`, events, `teamStatus` (:271), `hops`, `part` (:210) | seeded thread |
| 7 | **Home** `/` (header "โปรเจกต์" on every project page): one project card with version, stuck / waiting counts, progress | `app/page.tsx:31-33` | `projects` (:197), `chain` + events per project, `homeSummaries` | one project |

- **Not reachable from the UI:** `/start` (no link in any screen — deep link only, from Blueprint). `/test-reset` is a
  test route (404 unless mock + `CAW_TEST_RESET=1`).
- **Write paths not exercised** (approve proposal, answer, send, mode switch, add worker, folders): `UNVERIFIED` — the
  257 e2e tests pass on the mock, but nobody on Team B read them for this map.
- **Where the real work happens:** a hop (step 2's "กำลังทำ") is created by the runner, which polls caw-back and starts
  Claude CLI (§ Claude CLI). On the mock it is seed data; locally for real it needs the runner = the owner's word.

## Open questions & risks (AC-10) — severity is the SA's guess

1. **[High] Real Claude CLI is one env var away on this machine.** `~/.local/bin/claude` exists and is the runner's
   default (`caw-back → src/runner/config.ts:40`); setting `CAW_WORKSPACE_ROOT` + `bun run dev` with a project that
   has work starts real hops. Any later REQ that runs CAW locally needs the owner's word first (PROTOCOL Hard boundaries).
2. **[Medium] Dev scripts that spend quota by design** — `caw-back → src/runner/e2e/run.ts` ac1/ac6/net and
   `auto.ts` thread / `E2E_REAL=1` (`run.ts:2-4`, `auto.ts:11-13`). Nothing marks them dangerous except comments.
3. **[Medium] caw-back's test suite is not green on this machine:** `settings.test.ts:162` fails because of where bun is
   installed (path with `@`), and `db-scripts.test.ts` Case C times out sometimes (§ Run). Neither is shown to be a product
   fault; both make "all tests pass" impossible to claim here today.
4. **[Low] caw-front README is stale:** `README.md:5` says "Ant Design 6.6.5"; `package.json` has no `antd` (UI is radix-ui +
   shadcn + Tailwind 4). It also names the old team's people (Bob `.next-b`, Fanta `.next-f`, `next.config.ts:4`).
5. **[Low] Seam shapes are not validated at runtime on CAW's side** (`caw-back → src/blueprint/client.ts:63,67,85`, type casts).
6. **[Low] Back-links CAW → Blueprint web are undocumented** in SYSTEM-FACTS (§ Seam, links 2 and 3).
7. **[Low] `.env.example` lists 11 keys; the code reads more** — `HOST` (`caw-back → src/index.ts:19`); dev/test seams
   `CAW_DEV_API_ENTRY`, `CAW_DEV_RUNNER_ENTRY`, `CAW_DEV_API_EARLY_MS` (`src/dev.ts:15-18`); per-worker `CAW_WORKER_ID`,
   `CAW_HOP_ID` (`src/mcp/server.ts:169,174`, set by the runner). Every listed key is read. Only `HOST` is an operator setting
   that is missing from the example.
8. **[Low] Unused code in caw-front:** `ui/radio-group.tsx` and `ui/sonner.tsx` have no importer (`team/Team.tsx:10` imports
   `sonner` directly); `words.ts:102` `blueprintBuild` ("ส่งไปสร้างที่ CAW", Blueprint's button label) is used only by its own
   test (`words.test.ts:3,21`), by no screen. SA re-checked 2026-10-29.
9. **[Low] `/start`'s "unreachable" sentence is hard to reach:** in http mode a down caw-back is caught by the layout's
   `BackendDown` first (`caw-front → src/app/layout.tsx:27,35`), so `start/page.tsx:19` shows only if caw-back answers
   `/health` but fails the POST — `inferred`, not run.
10. **Not searched:** a dead-code / unused-export pass over caw-back `src/` (TASK-103 DoD 8 `UNVERIFIED`); TODO/FIXME: none in
    either repo (grep).
