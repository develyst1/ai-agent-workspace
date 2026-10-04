# SPEC-001: v1 — two read-only screens fed by the gate
- Source: REQ-001
- Status: ACTIVE — §2 data contract filled 2026-10-05 from the gate's real `--json` output (gate v6, `schema: 1`). TASK-001 created. TASK-002/003 wait on REQ-001 Q-6..Q-8 (display questions, not contract questions); TASK-004 follows them.
- Written: 2026-10-05 by Sober (SA). Updated 2026-10-05 00:55 (Sober): §2 filled; Q-3/Q-4/AC-7 answers folded in.

## Overview

One Next.js 16 / React 19 / antd v6 app (App Router) in `harness-console-front`. Two
pages, both server-rendered: **Workspace** (one card per project) and **Project**
(gate detail · file health · ball). Every value shown comes from running
`check-hygiene.mjs --json` as a child process and passing its JSON to the page. The
console opens **no** coordination file, computes **no** verdict, and writes **nothing**
in the workspace.

## What exists today (read 2026-10-05 00:52, not assumed)

- Gate **v6** ships `--json` and `--list` (Marie, `MARIE.md` ORDER 16 ① DONE). Human
  output unchanged. Q-5 (a)(b)(c) are answered in the tool — see §2.
- Exit codes: `0` = PASS, `1` = FAIL (a normal result), `2` = the gate could not run.
  Under `--json`, every outcome — including exit 2 — prints JSON on **stdout**.
- The gate imports only `readFileSync, readdirSync, existsSync, statSync` — it reads only.
  `smart-scheduler --json` takes ~0.27 s and prints ~83 KB (the largest desk).
- `--list --json` returned **14 projects** on 2026-10-05.
- `harness-console-front` is still one commit `ec34c62` (README + `.gitignore`).
  `.gitignore` already ignores `.env*.local` and `.env` (not `.env.example`).

## 1. Interface design (app-internal — no second service, so no HTTP contract)

### 1.1 Configuration — where the workspace is (REQ-001 §7, AC-7)

- **One setting: `HARNESS_WORKSPACE_PATH`**, in `harness-console-front/.env.local`
  (git-ignored). The owner copies the value from the `ai-agent-workspace` row of the
  workspace-root `machine.local.md`. The console **does not read `machine.local.md`**.
- Read **at request time** (`process.env.HARNESS_WORKSPACE_PATH`), never at build time,
  never with a default value in code.
- Valid only if: set, non-empty, the folder exists, and `<path>/check-hygiene.mjs`
  exists (`existsSync` ×2 — the only filesystem calls the console makes). Any failure →
  both pages show exactly **`Workspace path not found — check HARNESS_WORKSPACE_PATH in .env.local`**
  (owner-approved 2026-10-05, REQ-001 wording table; covers "exists but no gate" too —
  assumption A, owner-confirmed) and run no gate.
- Committed: `.env.example` with `HARNESS_WORKSPACE_PATH=` and **no value**.

### 1.2 The gate runner — the console's only data source

Two server-only functions, one module (`src/lib/gate.ts` or the house-pattern equivalent):

- `listProjects(): Promise<ListRun>` → runs `check-hygiene.mjs --list --json`.
- `runGate(project: string): Promise<GateRun>` → runs `check-hygiene.mjs <project> --json`.

Both: `child_process.execFile(process.execPath, [<ws>/check-hygiene.mjs, ...args], { cwd: <ws>, timeout: 15000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 })`.
**`execFile`, never `exec`/`shell: true`.** ⚠️ `execFile` rejects on exit 1 and 2 —
the stdout on the rejection object is still the answer and must be parsed, not
discarded. **The exit code is never used to decide anything; the JSON's `ok` is**
(Marie's contract, Q-5 a).

`project` values come **only** from `listProjects()`. The Project page checks its URL
segment against that list first; unknown → `notFound()`, no gate run. (Names contain
`#` — `did-api-center-c#` — so links use `encodeURIComponent`.)

Result types (TypeScript, exact casing):

```ts
type RunError =
  | { kind: "gate";     code: string; message: string } // gate printed { ok:false, error }
  | { kind: "timeout" }                                  // killed at 15 s
  | { kind: "not-json" }                                 // stdout did not JSON.parse
  | { kind: "schema";   schema: unknown }                // schema !== 1
  | { kind: "spawn";    message: string };               // process could not start

type ListRun = { ok: true; projects: string[]; ranAt: string } | { ok: false; error: RunError; ranAt: string };
type GateRun = { ok: true; project: string; data: GateJson; ranAt: string }
             | { ok: false; project: string; error: RunError; ranAt: string };   // ranAt = ISO-8601, server clock
```

Order of checks on a finished process: timeout → spawn error → `JSON.parse(stdout)`
fails → `not-json` · `schema !== 1` → `schema` · `ok === false` → `gate` (copy
`error.code`, `error.message` verbatim) · else success.

- Concurrency: per refresh, `listProjects()` once, then `runGate` for all projects,
  **at most 4 at a time**. One project's failure never affects another's card (AC-6).
- **No retry, no cache, no fallback, nothing stored between refreshes.**

### 1.3 Pages and refresh

| Route | Renders | Gate runs per render |
|---|---|---|
| `/` — title `Workspace` | one card per project, in `projects` order from `--list` | list + every project |
| `/p/[project]` | sections `Gate` · `File health` · `Ball` | list + that one project |

- Both pages `export const dynamic = "force-dynamic"`.
- **Refresh (AC-5):** a client component calls `router.refresh()` every 60 000 ms and
  shows `Updated <HH:MM:SS> · refreshes every 60 s` (server render time, local clock).
  No API route, no polling endpoint.
- Card click → `/p/<project>`. Nothing else is a link (click-to-open-file is Out of Scope).
- **Every string the gate supplies is rendered verbatim as plain text** — no markdown
  rendering (board cells contain `**…**` and backticks; they show as typed), no
  translation, no trimming, no re-ordering. Every other visible string comes **only**
  from the REQ-001 wording table.

### 1.4 Gate-error text (AC-6) — owner-approved 2026-10-05 (Q-4)

| `RunError.kind` | Card text |
|---|---|
| `gate` | `Gate error — <error.message>` |
| `timeout` | `Gate error — no answer after 15 s` |
| `not-json` | `Gate error — output was not JSON` |
| `schema`, `spawn`, and a failed `listProjects()` | **no approved text — REQ-001 Q-8** |

## 2. Data contract — `check-hygiene.mjs --json`, `schema: 1` (gate v6)

Filled from **real output on 2026-10-05 00:52** for: `harness-console` (PASS, 0 checks),
`smart-scheduler` (FAIL 20 / WARN 3, inbox `BE.md` 22 messages), `dte` (FAIL 5 / WARN 3,
no log today, `failuresUnreviewed: null`), `--list`, and an unknown project (exit 2).
**Only the fields below are read. Every other field is ignored, not displayed.**

### 2.1 `--list --json` (exit 0)

```json
{ "schema": 1, "gate": "v6", "ok": true, "generatedAt": "<ISO>", "projects": ["DID-046-…", "api-linkage2", "…"] }
```

### 2.2 Could not run (exit 2) — same shape for `--list` and per project

```json
{ "schema": 1, "gate": "v6", "ok": false, "error": { "code": "NO_AI_WORKER", "message": "no ai-worker at <abs path>" } }
```
No `project` field here — take the name from the call. Codes seen: `NO_PROJECT`, `NO_AI_WORKER`.

### 2.3 Per project (exit 0 = PASS, 1 = FAIL)

| Field (exact casing) | Type, as observed | Read by |
|---|---|---|
| `schema` | `1` | runner (§1.2) |
| `ok` | `true` | runner |
| `project` | string | both pages |
| `result` | `"PASS"` \| `"FAIL"` | card badge, project page |
| `counts.fail`, `counts.warn` | number | not displayed in v1 |
| `checks[]` | `{ severity: "fail" \| "warn", text: string }`, **already worst-first** (all fails, then all warns, gate order) | card: `checks.slice(0, 3)`; project `Gate` section: all, in order |
| `files[]` | `{ name, bytes, limitBytes: number\|null, warnBytes?: number, exists?: boolean, exempt?: string }` — `warnBytes`/`exists`/`exempt` appear only on some rows | `File health` table (columns: Q-7, Q-8) |
| `resumeBehindDays` | number \| null | staleness, on the `RESUME-HERE.md` row only |
| `newestLogDate` | `"YYYY-MM-DD"` \| null (dte: `2026-09-13`) | **candidate** for `Last moved:` — Q-6 |
| `boardRows[]` | `{ id, title, status, ball: string\|null, ballColumn: string\|null }` — 147 rows / 33 `ball: null` on smart-scheduler | `Ball` section — Q-8 (assumption B) |

Mapping to REQ-001:

| Screen element | Field | Notes |
|---|---|---|
| project list | `--list` → `projects` | order kept |
| PASS / FAIL | `result` | |
| worst ≤ 3 lines | `checks.slice(0, 3)[].text` | AC-2: `checks` is `[]` on a clean PASS ⇒ nothing shown; AC-3: no padding. A PASS with warnings shows its warn lines (they are what the gate gave). |
| last-moved date | `newestLogDate`? | 🔴 **not decided — Q-6.** The gate has no field named "last moved". |
| every gate line | `checks[]` | severity shown as the gate's word (`fail` / `warn`) — wording Q-8 |
| file health | `files[]` (+ `resumeBehindDays`) | 🔴 **the gate gives size and limits but no per-file verdict — Q-7.** The console must not compute `bytes > limitBytes` (REQ-001 §4). |
| who holds the ball | `boardRows[]` | assumption B (Q-8): a table of every row — `id`, `title`, `status`, `ball` — verbatim |

## Data Model

None. No database, no file written, no cache, no "last seen" record — v1 writes nothing.

## Flow

```
browser ──(every 60 s: router.refresh)──▶ Next.js server render
   ├─ HARNESS_WORKSPACE_PATH invalid? → AC-7 message, stop
   ├─ listProjects()            (--list --json)
   ├─ runGate(p) × N            (≤4 in parallel, 15 s timeout each)
   └─ render from GateRun[]     (ok:false → error card, others unaffected)
```

## Non-functional

- **Read-only (AC-8)** and **single source (AC-9)** — searches the owner can re-run, from
  the `harness-console-front` root:
  `grep -rnE "writeFile|appendFile|mkdir|rmSync|unlink|rename|copyFile|createWriteStream" src/` → no hits;
  `grep -rnE "readFile|readdir|createReadStream|board\.md|inbox|RESUME-HERE|FAILURES|SYSTEM-FACTS|log/" src/` → no hits.
  ⚠️ `File health` will show the gate's own file names (`inbox/SA.md`…) — they come from
  JSON at run time and must never be literals in `src/`, or the second search fails.
- ⚠️ **AC-8 snapshot confound:** other desks' sessions write to the workspace at any
  time. Snapshot while no session is active, or attribute every changed file.
- **No absolute path** in any committed file. Local only (C-3).
- Load: ≤ 15 gate runs per refresh, ~0.3 s each, capped at 4 in parallel.

## Tasks (owner: FE/Fern for every one)

- **TASK-001** — scaffold + config + AC-7 + gate runner + refresh shell — `TODO`, depends on: none. `tasks/TASK-001-scaffold-config-gate-runner.md`
- TASK-002 — Workspace screen: cards, error card (AC-1, 2, 3, 5, 6) — **not created**: waits on Q-6 (last moved) + Q-8 (error texts) — depends on TASK-001
- TASK-003 — Project screen: Gate · File health · Ball (AC-4, 5) — **not created**: waits on Q-7 + Q-8 — depends on TASK-001
- TASK-004 — read-only + single-source evidence (AC-8, AC-9), snapshot script in `ai-worker/tests/harness/` — created with TASK-002/003 — depends on TASK-002, TASK-003
- AC-10 (human output byte-identical) — Marie verified it on all 14 desks (`MARIE.md`, 2026-10-05); the owner's eyes remain the check. No TASK.

## Questions

*(Mirrored in REQ-001 §Questions; Porter answers there.)*

- Q-3, Q-4 — answered 2026-10-05, folded into §1.1 and §1.4.
- Q-5 — answered by Marie **in the tool** (gate v6): (a) `ok` vs `result`, JSON on stdout for both; (b) `--list`; (c) `schema: 1`. Folded into §1.2 and §2.
- Q-6, Q-7, Q-8 — open, see REQ-001 §Questions.
