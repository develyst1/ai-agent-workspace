# SPEC-102: CAW code map (Team B side of REQ-101)
- Source: REQ-101 (Team B = CAW: `caw-back`, `caw-front`; seam AC-5 from CAW's side; Claude CLI launch AC-8)
- Status: DONE (2026-10-29 01:02, Silver — TASK-103 and TASK-104 DONE; map complete at `maps/caw.md`; AC-11 re-checked:
  both repos on `atom` @ 102a130 / 4b58bf3, `git status --short` empty, no listener on :3500/:3510/:4500, no `claude` process)
- Repos read: `caw-back` on `atom` @ 102a130, `caw-front` on `atom` @ 4b58bf3 — both `git status --short`
  empty before and after the SA's base run below, read 2026-10-29 00:40–00:55 by Silver.

## Overview

REQ-101 changes no code. The deliverable is **`i-space/ai-worker/maps/caw.md`** — the CAW map, written
by the SA from the two TASKs' evidence plus the SA's own sections. Every claim carries
`<repo> → <file>:<line>` or the command that showed it. The engineers put their findings, with real
output, in their TASK's `## Implementation Notes`; the SA assembles the map from them and re-checks
what goes in (a teammate's report is a lead until the SA cites it).

| Part of the map | Who | AC |
|---|---|---|
| caw-back run (install / test / start), folder map incl. `src/mcp`, `src/runner`, `test/` | Bob (BE) — TASK-103 | AC-2, AC-3, AC-4 |
| caw-front run (install / unit / typecheck / build / e2e / start), folder map, main flow walk, `/start` | Fanta (FE) — TASK-104 | AC-2, AC-3, AC-4, AC-7, AC-5 (front link, CAW side) |
| Read-API seam from CAW's side | Silver (SA) — below, § API | AC-5 |
| Where Claude CLI is launched, what it is passed, what tests use instead | Silver (SA) | AC-8 |
| `[team-proposed, Atlas read]` lines about CAW, one by one | Silver (SA) | AC-9 |
| Open questions / risks, one list | Silver (SA), fed by both TASKs | AC-10 |
| Repo state at close | Silver (SA) | AC-11 |

## Guardrails — bind both TASKs (each one is a way this REQ could change a repo or spend the owner's money)

- **G1 — no live Claude CLI, ever (AC-8: a live run fails the whole REQ).** A real `claude` IS installed
  on this machine (`~/.local/bin/claude`, checked by the SA 2026-10-29), and it is the runner's default
  (`caw-back → src/runner/config.ts:40`). So:
  - never `bun run runner`, never `bun run src/runner/main.ts`;
  - **never set `CAW_WORKSPACE_ROOT` or `CLAUDE_BIN`** in any shell for this REQ. Without
    `CAW_WORKSPACE_ROOT` the runner refuses to start (`config.ts:31`) — that refusal is the expected,
    safe output of `bun run dev`;
  - **never run anything under `caw-back/src/runner/e2e/`** — `run.ts ac1|ac6|net`, `auto.ts thread` and
    `E2E_REAL=1` start REAL hops by design (`run.ts:2-4`, `auto.ts:11-13`); the others are not needed here;
  - `bun test` is safe: every runner test injects a fake spawner (`src/runner/hop.test.ts:48`,
    `main.test.ts:46`); the one real spawn in a test is `sleep 30` (`hop.test.ts:429`); `main()` runs only as
    the entry file (`main.ts:339`). SA-verified 2026-10-29.
- **G2 — tracked files never change.** `git status --short` empty before and after, pasted in the TASK.
- **G3 — install with the lockfile frozen:** `bun install --frozen-lockfile`.
- **G4 — scripts you never run** (they write a tracked file or a real database):
  caw-back `db:generate` (writes `src/db/migrations/`), `openapi:emit` (writes `openapi.json`),
  `db:migrate`, `db:fix-journal`, `db:inspect` (all read `DATABASE_URL`, meant for a real Postgres);
  caw-front `gen:api` (writes `src/api/schema.d.ts`, and reads the other repo).
- **G5 — databases and network.** `DATABASE_URL=pglite:memory` only. No `.env` / `.env.local` is created
  (none exists today). `BLUEPRINT_URL` stays empty; blueprint-back is NOT started by Team B (REQ-101: each
  side describes the seam from its own repo only) — a caw-back screen or call that needs Blueprint is
  recorded as what it says when Blueprint is down (AC-4), not worked around.
- **G6 — ports.** caw-back :4500, caw-front :3500 (dev), e2e builds on :3510 (`playwright.config.ts:5`).
  Before starting, check the port is free (`ss -ltn | grep :<port>` — `lsof` is NOT installed here; corrected
  2026-10-29 after TASK-103, F-002); stop what you started, by pid (`bun run` leaves a child: kill the bun pid, not only the shell).
  Each FE build uses its own dist folder: `NEXT_DIST_DIR=.next-f` (git-ignored, `.gitignore` `/.next-*/`).
- **G7 — observe, don't fix (AC-4).** A failing test, a broken command, a missing env/service/browser is
  recorded with its real output. No retry-until-green, no skip, no invented value.
- **G8 — citations come from a tool** (`grep -n`, `nl -ba`, editor line numbers), never counted by hand.
- **G9 — only Team B's repos.** Never open `blueprint-back` / `blueprint-front`.
- **G10 — record date/time and HEAD with every run**, so QA's re-run (AC-3) can be compared.

## Base run by the SA (2026-10-29, before cutting the TASKs)

- caw-back: `bun install --frozen-lockfile` → `121 packages installed`; `bun test` →
  `676 pass · 1 skip · 2 fail · Ran 679 tests across 60 files [104.51s]`. The two fails:
  `src/runner/settings.test.ts:162` (`expect(cmd.startsWith(\`${process.execPath} \`)).toBe(true)` → false) and
  `test/scripts/db-scripts.test.ts` "Case C …" (timed out after 5000 ms). The skip is
  `src/runner/guard.test.ts:51` (needs `CAW_TEST_WORKSPACE_ROOT` — **leave it unset**, see G1's spirit).
- caw-front: `bun install --frozen-lockfile` → `445 packages installed`; `bun test src` →
  `328 pass · 0 fail · Ran 328 tests across 23 files`; `bun run typecheck` → no output (clean).
- `git status --short` empty in both afterwards.

## API / Interface Design — the read-API seam from CAW's side (AC-5, SA-written)

All calls are in `caw-back → src/blueprint/client.ts` (88 lines). Base URL `BLUEPRINT_URL`, else
`http://127.0.0.1:4200` (`client.ts:28`). Error rule for GETs: 404 → `null`; network error, non-200,
or non-JSON → `BlueprintUnreachable` (`client.ts:34-48`).

| Call | HTTP CAW sends | What CAW reads from the answer | Callers in caw-back |
|---|---|---|---|
| getProject(bp) | `GET /v1/projects/{bp}` | `project.name` only (`client.ts:62-65`) | `projects/service.ts:21` |
| getVersion(bp, n) | `GET /v1/projects/{bp}/versions/{n}` | `version`, `confirmedAt` (`client.ts:66-69`) | `projects/service.ts:23`, `cards/service.ts:59`, `proposals/service.ts:63` |
| partContext(bp, n, key) | `GET /v1/projects/{bp}/versions/{n}/parts/{key}/context` | opaque, passed through (`client.ts:70`) | `cards/service.ts:62,96`, `proposals/service.ts:71`, `projects/service.ts:103` |
| versionsAfter(bp, after) | `GET /v1/projects/{bp}/versions?after={after}` | `VersionFeed` (`client.ts:8-13`); 404 → unreachable "project not found" (`:84`) | `follow/pull.ts:47` |
| locate(bp, request) | `POST /v1/projects/{bp}/locate` `{ request }` | opaque `Located`; reads `candidates[].key` (`seam/service.ts:22-23`); non-200 → unreachable | `seam/service.ts:22` ← `POST /v1/projects/{id}/locate` (`http/routes/seam.ts:14-17`) |
| amend(bp, body) | `POST /v1/projects/{bp}/amendments` `{ from, request, about? }` | 201 → message; 400 with `error.message` → refusal; else unreachable (`client.ts:76-81`) | `seam/service.ts:38` ← `POST /v1/projects/{id}/amendments` (`seam.ts:19-23`) |

`from` is `caw:<projectId>:<hopId|operator>` (`seam/service.ts:38`). caw-front never calls Blueprint's API
(`caw-front → src/blueprint.ts:1-2`).

**Front links, CAW side** (TASK-104 confirms by running): (1) in — `caw-front → src/app/start/page.tsx`
takes `?project=&version=`, POSTs `createProject`, redirects to `/p/<id>` or shows a refusal
(`page.tsx:23-36`); (2) out — "open this part in Blueprint" links to
`${BLUEPRINT_URL}/p/<bp>/web?part=<key>` (`caw-front → src/blueprint.ts:3-6`); (3) out — an amendment's
link `${BLUEPRINT_WEB_URL}/p/<bp>/chat` built by caw-back (`chat/service.ts:79`). Links (2) and (3) are
not in `SYSTEM-FACTS.md` today — they go to the map as a finding for AC-5's comparison.

## Data Model

None. No schema change, no migration, no SQL. Tests' own PGlite only.

## Flow — CAW's main flow to trace (AC-7, TASK-104)

`/start?project=&version=` → project board `/p/[id]` → a card `/p/[id]/c/[cardId]` → team `/p/[id]/team`
→ runs `/p/[id]/runs` → chat `/p/[id]/chat` → home `/`. Per step: the screen the user sees, the page file
that renders it, the `CawApi` call behind it (`caw-front → src/api/caw.ts`), and — where the mock is the
only data — what the mock answers. A step that exists in code but no screen links to it is marked
"not reachable from the UI". The run/worker part of the flow is shown **on the mock only** (G1).

## Non-functional

Nothing to build. Time budget: one session per TASK.

## Tasks

- TASK-103: caw-back — run, folder map (src, MCP server, runner, test) — owner: BE Bob (depends on: —)
- TASK-104: caw-front — run, folder map, main flow, `/start` — owner: FE Fanta (depends on: —)
- SA (no TASK): AC-5 read API (above), AC-8, AC-9, AC-10, AC-11, assembling `maps/caw.md`.

## AC → work

| AC | Covered by |
|---|---|
| AC-1 | Team A only — no work for Team B |
| AC-2 | TASK-103 DoD 4 + TASK-104 DoD 3 → map § Folders |
| AC-3 | TASK-103 DoD 2-3, 5-7 + TASK-104 DoD 2, 4-5 → map § Run |
| AC-4 | G7 + both TASKs' "observed" lines → map § Run |
| AC-5 | § API above (read API) + TASK-104 DoD 6 (front links) → map § Seam |
| AC-6 | Team A only |
| AC-7 | TASK-104 DoD 7 → map § Main flow |
| AC-8 | SA → map § Claude CLI |
| AC-9 | SA → map § SYSTEM-FACTS check |
| AC-10 | SA, fed by both TASKs' "looks wrong" lists → map § Open questions & risks |
| AC-11 | SA at close (`git status`, `git log -1`, read only) |

## Risks / assumptions

- **Live-run risk is real, not theoretical** (G1): a real `claude` is on PATH and is the default bin.
  Designed out by never giving the runner `CAW_WORKSPACE_ROOT`. `[SA-decided]`
- `test/scripts/db-scripts.test.ts` Case C timed out at 5000 ms on the SA's run — it may be load-dependent
  (`inferred — a single-file re-run would settle it`); TASK-103 re-runs it alone.
- caw-front README names "Ant Design 6.6.5" but `package.json` has no `antd` (radix-ui / shadcn instead) —
  inferred stale README; goes to AC-10.
- Playwright needs local Chrome (`playwright.config.ts:24` `channel: "chrome"`); `/usr/bin/google-chrome`
  exists on this machine (SA, `which`, 2026-10-29).

## Questions

(none yet)
