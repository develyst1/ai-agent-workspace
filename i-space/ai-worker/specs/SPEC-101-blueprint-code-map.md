# SPEC-101: Blueprint code map (Team A side of REQ-101)
- Source: REQ-101 (Team A = Blueprint: `blueprint-back`, `blueprint-front`; seam AC-5 from Blueprint's side)
- Status: DONE (2026-10-29 01:02, Sober — SA, Team A) — TASK-101 and TASK-102 DONE; map complete at `maps/blueprint.md`
- Repos read: `blueprint-back` on `atom` @ f60b934, `blueprint-front` on `atom` @ e46322a — both `git status --short` empty, no `node_modules`, read 2026-10-29 00:4x by Sober.

## Overview

REQ-101 asks for a written, evidence-backed map of Blueprint. Nothing in the product changes.
The work splits in three:

| Who | What | Where it lands |
|---|---|---|
| BE (TASK-101) | `blueprint-back`: install / test / start as observed; one line per `src/` folder; the read-API seam from Blueprint's side; outbound calls | TASK-101 `## Implementation Notes` |
| FE (TASK-102) | `blueprint-front`: install / unit + Playwright runs as observed; one line per `src/` folder; the main flow screen → page file → API call; the front link to CAW | TASK-102 `## Implementation Notes` |
| SA (this SPEC's owner) | review both; AC-9 checks of `SYSTEM-FACTS.md`; AC-10 findings list; writes **the map** | `maps/blueprint.md` (new) |

**The map** = `i-space/ai-worker/maps/blueprint.md`, written by the SA only, from TASK evidence the SA
has reviewed (and re-run where cheap). Sections, one per AC: §1 Folders (AC-1) · §2 Install / test /
start (AC-3, AC-4) · §3 Main flow (AC-6) · §4 Seams, Blueprint side (AC-5) · §5 SYSTEM-FACTS checks
(AC-9) · §6 Open questions & risks (AC-10) · §7 Repo state at close (AC-11). `[SA-decided]`

ACs not Team A's: AC-2, AC-7, AC-8 (CAW, Team B). AC-8 still binds us in spirit: no live Claude CLI —
Blueprint does not start one (to confirm in TASK-101 step 6).

## Guardrails — bind both TASKs (each is a reason a run could change the repo or spend money)

- **G1 — tracked files never change.** `git status --short` is empty before and after, pasted in the
  evidence. Git is read-only: `status`, `log`, `diff`, `show`, `ls-files`, `grep` — nothing else.
- **G2 — install with the lockfile frozen:** `bun install --frozen-lockfile` (a plain install may
  rewrite the tracked `bun.lock`).
- **G3 — scripts you never run**, because they write a tracked file or a real database:
  `blueprint-back`: `openapi:emit` (writes tracked `openapi.json`), `db:generate` (writes
  `src/db/migrations/`), `db:create`, `db:migrate` · `blueprint-front`: `gen:api` (writes tracked
  `src/core/api/schema.d.ts`), and `scripts/check-required.ts --extra-theme`.
  (`gen:themes` writes `src/core/theme/registry.generated.ts`, which is git-ignored — allowed.)
- **G4 — no call to the real LLM gateway** (`https://ai.develyst.online`, the default in
  `blueprint-back → src/gateway/client.ts:73`). Never set `BLUEPRINT_GATEWAY_LIVE` (it unlocks
  `test/gateway/live.smoke.test.ts:5`); show `env | grep -c BLUEPRINT_GATEWAY_LIVE` → `0`. Any manual
  start of blueprint-back sets `GATEWAY_URL=http://127.0.0.1:9` (nothing listens there), so any step
  that needs a model answer fails locally, and that failure is an observation. `[SA-decided]`:
  Interpreted the old team's D-003 "no live call" (cited in `blueprint-front → tests/states.spec.ts:33`)
  plus REQ-101's no-live-run constraint as covering the gateway too; cheap to reverse if the owner says
  otherwise.
- **G5 — no outbound call of any other kind.** `DATABASE_URL=pglite:memory`, `HOST` empty,
  `CAW_NOTIFY_URL` empty. Don't add a link source that points at the internet (`src/sources/link.ts`
  fetches it).
- **G6 — ports.** blueprint-back :4200, blueprint-front :3100; `test:states` uses :4298 (back) and
  :4296 (stand-in gateway). Team B may be running CAW on :4500 / :3500 — never touch those. Stop
  every process you started; show `ss -ltnp | grep -E ':(4200|3100|4298|4296)\b'` → empty at the end.
- **G7 — observe, don't fix (AC-4).** A failing test, a broken command, a missing env/service/browser
  is recorded with the exact command and its real output, never fixed, skipped silently or worked
  around with an invented value.
- **G8 — citations come from a tool:** `grep -n`, `nl -ba`, the editor's line numbers. Never counted
  by hand. A behaviour you inferred and did not run is written `inferred — <what would settle it>`.
- **G9 — only Team A's repos.** Never open `caw-back` / `caw-front` (REQ-101 constraint: each side
  is described from its own repo, so AC-5's comparison means something).
- **G10 — record times with the commands.** AC-3 is re-run later by QA; "N pass / M fail / K skip"
  must be the runner's own summary line, pasted.

## API / Interface Design — what TASK-101 records for the read-API seam (AC-5)

No contract changes. For each call CAW makes (names per `SYSTEM-FACTS.md`; the CAW-side names are
Team B's, so map them to Blueprint routes by **path**, not by name):

| SYSTEM-FACTS name | Starting point found by the SA (route file:line, `grep -n 'path:'`) |
|---|---|
| getProject | `src/http/routes/projects.ts:51` `GET /v1/projects/{projectId}` — to confirm |
| getVersion | `src/http/routes/versions.ts:35` `/v1/projects/{projectId}/versions/{version}` — to confirm |
| versionsAfter | ~~`src/http/routes/versions.ts:11` or `:74`~~ settled 2026-10-29 (TASK-101): `:74` `GET /v1/projects/{projectId}/versions?after=` — `:11` is the confirm `POST` |
| partContext | `src/http/routes/seam.ts:45` `GET …/versions/{version}/parts/{key}/context` |
| locate | `src/http/routes/seam.ts:55` `POST …/locate` |
| amend | `src/http/routes/seam.ts:77` `POST …/amendments` |
| (push) | `src/seam/notify.ts:18` outbound `fetch` to `CAW_NOTIFY_URL` after a confirm |

Per call, record: method + path · route `file:line` · handler/service `file:line` · auth (or "none")
· path / query / body fields **with exact casing** and their zod types · the success response shape
(field casing) and status · every error status with its body (`src/http/errors.ts`) · whether it
reads or writes data. `openapi.json` (tracked, emitted) may be read as a cross-check; the source is the
route file — a disagreement between the two is a finding.

## Data Model

None changed. TASK-101 names the tables in `src/db/schema.ts` in one line each (for the folder map),
no SQL run against anything but pglite in tests.

## Flow — main Blueprint flow to trace (AC-6, TASK-102)

Sources → AI interview → confirmed spec version → ready screen → "ส่งไปสร้างที่ CAW". Pages found by the SA
(`find src/app -name page.tsx`): `src/app/page.tsx` · `src/app/p/[projectId]/page.tsx` ·
`…/chat/page.tsx` · `…/ready/page.tsx` · `…/[page]/page.tsx` · `…/export/print/page.tsx` · `src/app/dev/*`
(only with `BLUEPRINT_DEV_PAGES=1`). The CAW link URL is built at `src/features/ready/load.ts:138`.
Per step: the screen the user sees (its visible Thai title/button text) · the page file that renders it
· the component · the server action or loader and the back-end route it calls. A step that exists in
code but that no screen reaches is written **"not reachable from the UI"** with the evidence.

## Non-functional

None beyond the guardrails.

## Tasks

- TASK-101: blueprint-back — run, folder map, seam from Blueprint's side — owner: BE (depends on: —)
- TASK-102: blueprint-front — run, folder map, main flow, front link — owner: FE (depends on: TASK-101 DoD 2 for its Playwright step only)
- SA (no TASK — the SA's own work): AC-9 checks · AC-10 list · write `maps/blueprint.md` · AC-11 state at close.

## AC → work

| AC | Covered by |
|---|---|
| AC-1 | TASK-101 DoD 3 + TASK-102 DoD 3 → map §1 |
| AC-3 / AC-4 | TASK-101 DoD 1–2, 4 + TASK-102 DoD 1–2, 4 → map §2 |
| AC-5 | TASK-101 DoD 5 (read API) + TASK-102 DoD 6 (front link) → map §4 |
| AC-6 | TASK-102 DoD 5 → map §3 |
| AC-9 | SA → map §5 |
| AC-10 | both TASKs' "Findings" + SA → map §6 |
| AC-11 | both TASKs' G1 evidence + SA at close → map §7 |
| AC-2, AC-7, AC-8 | no work — Team B's (REQ-101 Split line) |

## Risks / assumptions

- Playwright needs local Google Chrome (`channel: "chrome"`, `playwright.config.ts`); `/usr/bin/google-chrome`
  exists on this machine (SA, `which`, 2026-10-29). Whether it launches headless here is unknown → TASK-102 records it.
- ~~`test:states` and `check-required.ts` spawn `../blueprint-back`, so they need its `node_modules` → TASK-102's
  Playwright step waits for TASK-101 DoD 2.~~ **Wrong (F-001, 2026-10-29):** only `test:states` spawns it.
  `check-required.ts:43` merely imports `../blueprint-back/test/fixtures/meeting-room.ts`; its header `:11-13` needs
  an in-memory back end **already running** at `BLUEPRINT_API_URL` (default :4299). Recipe: TASK-102 § Questions Q1 answer.
- `scripts/check-required.ts:180` calls `cp -cR` — `-c` is a macOS flag; on Linux it is inferred to behave
  differently. Only on the `--extra-theme` path, which G3 forbids — goes to AC-10 as a finding, not run.

## Questions

(none yet)
