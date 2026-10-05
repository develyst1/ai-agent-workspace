# SPEC-001: v1 — two read-only screens fed by the gate
- Source: REQ-001
- Status: DONE — TASK-001..004 all DONE (reviews in each TASK §Review); REQ-001 → SPEC_DONE 2026-10-05 21:47 (Sober). §2 data contract from the gate's real `--json` output (gate v6, `schema: 1`).
- Written: 2026-10-05 by Sober (SA). Updated 2026-10-05 00:55 (Sober): §2 filled; Q-3/Q-4/AC-7 folded in. Updated 2026-10-05 03:05 (Sober): Q-6/Q-7/Q-8 + assumption B folded in (§1.4, §1.5, §2.3); `RESUME-HERE.md` row-match exception to the AC-9 search (§Non-functional); TASK-002/003/004 created. Updated 2026-10-05 08:10 (Sober): Q-9 answered yes/yes — matches §1.4/§1.5, no design change. Updated 2026-10-05 21:18 (Sober, TASK-002 review D-8): the refresh component is on every render state of both pages (§1.3, §1.4). Only an error card is unlinked (§1.3). Updated 2026-10-05 21:30 (Sober, TASK-003 Q-F3): §2.3 `boardRows[].title`/`status` are `string|null`.

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
  (git-ignored). The value is copied from the `ai-agent-workspace` row of the
  workspace-root `machine.local.md` — **Fern may create this file herself** (owner "ข ได้",
  2026-10-05, `SYSTEM-FACTS.md`). The console **does not read `machine.local.md`**.
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
  No API route, no polling endpoint. **It renders in every state of both pages:** the AC-7
  message, list failure, gate error and success (REQ-001 item 5: refresh with no touch, so a
  failure screen recovers by itself; 2026-10-05 21:18).
- Success-card click → `/p/<project>`. An error card is not a link (TASK-002 Q-F2). Nothing
  else is a link (click-to-open-file is Out of Scope).
- **Every string the gate supplies is rendered verbatim as plain text** — no markdown
  rendering (board cells contain `**…**` and backticks; they show as typed), no
  translation, no trimming, no re-ordering. Every other visible string comes **only**
  from the REQ-001 wording table.

### 1.4 Gate-error text (AC-6) — owner-approved 2026-10-05 (Q-4, Q-8 (d)(e))

One function maps a `RunError` to its `<reason>`; every error text is built from it.

| `RunError.kind` | `<reason>` |
|---|---|
| `gate` | `<error.message>` verbatim |
| `timeout` | `no answer after 15 s` |
| `not-json` | `output was not JSON` |
| `schema` | `gate version not supported` |
| `spawn` | `could not start the gate` |

- Card (or Project page) whose `runGate` failed: `Gate error — <reason>`. On the Project
  page it replaces the three sections (the run gave none of their data).
- `listProjects()` failed (either page): the page shows only
  `Could not list projects — <reason>` plus the refresh hint (§1.3) — no title, no cards — and
  runs no per-project gate.

### 1.5 Display rules — owner-approved 2026-10-05 (Q-6, Q-7, Q-8, assumption B)

Source of every text: REQ-001 wording table + §Questions Q-8 table. Empty value anywhere = `—`.

**Card (`/`):** `project` · badge = `result` verbatim · `checks.slice(0, 3)` (each rendered
as a Gate line, below) · `Last moved: <newestLogDate>`, or `Last moved: —` when `null`.

**Project page (`/p/[project]`):** heading = `project` + `result` badge; then sections:

- **`Gate`** — every `checks[]` item in gate order: `FAIL` / `WARN` (= `severity`
  upper-cased — the gate's own printed word) then `text` verbatim. `checks` empty →
  `No lines from the gate.`
- **`File health`** — one row per `files[]` item, gate order. Columns `File` · `Size` ·
  `Limit` · `Days behind`. No per-file verdict, no colour judgement, no `bytes > limit`
  comparison anywhere (Q-7 ก — verdicts are the `Gate` lines).
  - `File` = `name` verbatim.
  - `Size` = `not found` when `exists === false`; else `fmt(bytes)`.
  - `Limit` = `exempt — <exempt>` when `exempt` is present; else `—` when `limitBytes`
    is `null`; else `fmt(limitBytes)`. `warnBytes` is not displayed (not in the approved
    columns) — e.g. the `log/<date>.md` row shows `Limit` `—`.
  - `Days behind` = on the row whose `name === "RESUME-HERE.md"` only: `resumeBehindDays`,
    or `—` when `null`. Every other row: empty cell, no text.
  - `fmt(n)` = `` `${(n / 1024).toFixed(1)}KB` `` — copied from the gate
    (`check-hygiene.mjs` line 132, `const fmt`), so `94701` → `92.5KB`, `40960` → `40.0KB`,
    `214` → `0.2KB`. Display formatting, owner-confirmed (Q-8 assumption A).
- **`Ball`** — one row per `boardRows[]` item, gate order (= board order). Columns `Id` ·
  `Title` · `Status` · `Ball`, values verbatim as plain text (`**`, backticks shown as
  typed); `ball: null` → `—`. `ballColumn` is not displayed. `boardRows` empty →
  `No board rows.`

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
| `files[]` | `{ name, bytes, limitBytes: number\|null, warnBytes?: number, exists?: boolean, exempt?: string }` — `warnBytes`/`exists`/`exempt` appear only on some rows (re-checked 03:05: `exempt` = `"size (append-only knowledge)"` / `"size (append-only)"`) | `File health` table (§1.5) |
| `resumeBehindDays` | number \| null | `Days behind`, `RESUME-HERE.md` row only (§1.5) |
| `newestLogDate` | `"YYYY-MM-DD"` \| null (dte: `2026-09-13`) | `Last moved:` — owner-approved Q-6 |
| `boardRows[]` | `{ id: string, title: string\|null, status: string\|null, ball: string\|null, ballColumn: string\|null }` — 147 rows / 33 `ball: null` on smart-scheduler; `title`/`status` are `null` on header-less board rows (32 on smart-scheduler, 2026-10-05, TASK-003 Q-F3) → shown as `—` | `Ball` section (§1.5) — assumption B owner-approved |

Mapping to REQ-001:

| Screen element | Field | Notes |
|---|---|---|
| project list | `--list` → `projects` | order kept |
| PASS / FAIL | `result` | |
| worst ≤ 3 lines | `checks.slice(0, 3)[].text` | AC-2: `checks` is `[]` on a clean PASS ⇒ nothing shown; AC-3: no padding. A PASS with warnings shows its warn lines (they are what the gate gave). |
| last-moved date | `newestLogDate` | `null` → `Last moved: —` (Q-6) |
| every gate line | `checks[]` | `FAIL` / `WARN` + text (Q-8 c) |
| file health | `files[]` (+ `resumeBehindDays`) | name · size · limit only; the console never computes `bytes > limitBytes` (Q-7 ก, REQ-001 §4) |
| who holds the ball | `boardRows[]` | every row — `id`, `title`, `status`, `ball` — verbatim (assumption B) |

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
  **One known, allowed hit (Sober, 2026-10-05 03:05):** §1.5 puts `resumeBehindDays` on
  the row whose `name === "RESUME-HERE.md"`, and the gate gives no other way to find that
  row. That string lives as **one named constant in one file**, used only for that
  equality test against JSON — it opens nothing. The evidence states the second search's
  output as exactly that one line; any other hit is a defect.
- **AC-8 snapshot:** the owner runs no other workspace-writing session during it (owner
  "ง งด session อื่น", 2026-10-05). Fern's own session must also write nothing in the
  workspace between the two snapshots (Implementation Notes are written after), and the
  snapshot output goes to the OS temp folder or stdout — never inside the workspace.
- **Proving AC-5 / AC-6 without touching a live desk:** a state change or an error is
  produced in a **fixture workspace in the OS temp folder** (a copy of `check-hygiene.mjs`
  + a minimal fake desk, or a fake gate script), built by a script in
  `ai-worker/tests/harness/`, with `HARNESS_WORKSPACE_PATH` pointed at it. Never by
  editing a real desk.
- **No absolute path** in any committed file. Local only (C-3).
- Load: ≤ 15 gate runs per refresh, ~0.3 s each, capped at 4 in parallel.

## Tasks (owner: FE/Fern for every one)

- **TASK-001** — scaffold + config + AC-7 + gate runner + refresh shell — `TODO`, depends on: none. `tasks/TASK-001-scaffold-config-gate-runner.md`
- **TASK-002** — Workspace screen: cards, error card, list failure (AC-1, 2, 3, 5, 6) — `TODO`, depends on: TASK-001. `tasks/TASK-002-workspace-screen-cards.md`
- **TASK-003** — Project screen: Gate · File health · Ball (AC-4, 5) — `TODO`, depends on: TASK-001 (may run after or alongside TASK-002). `tasks/TASK-003-project-screen.md`
- **TASK-004** — read-only + single-source evidence (AC-8, AC-9) — `TODO`, depends on: TASK-002, TASK-003. `tasks/TASK-004-read-only-single-source-evidence.md`
- AC-10 (human output byte-identical) — Marie verified it on all 14 desks (`MARIE.md`, 2026-10-05); the owner's eyes remain the check. No TASK.

## Questions

*(Mirrored in REQ-001 §Questions; Porter answers there.)*

- Q-3, Q-4 — answered 2026-10-05, folded into §1.1 and §1.4.
- Q-5 — answered by Marie **in the tool** (gate v6): (a) `ok` vs `result`, JSON on stdout for both; (b) `--list`; (c) `schema: 1`. Folded into §1.2 and §2.
- Q-6, Q-7, Q-8, assumption B — answered 2026-10-05, folded into §1.4, §1.5, §2.3.
- Q-9 — answered 2026-10-05 08:03 (owner: yes/yes, REQ-001 §Questions Q-9): card lines carry
  `FAIL` / `WARN` (§1.5); a failed Project page shows `Gate error — <reason>` (§1.4). Both
  were already designed that way, so nothing changes. No open questions remain.
