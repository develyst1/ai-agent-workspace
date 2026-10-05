# Board — harness-console

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: a local control plane for THIS workspace — one screen showing every
  project's gate result, file health and who holds the ball. **The files stay the
  truth; the console is a lens — there is no second store.** Everything the owner has
  said is in **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (logical names only — absolute paths in the workspace-root
  `machine.local.md`): `harness-console-front` (Fern). No backend repo.
- Stack: Next.js 16 + React 19 + Ant Design v6 (house pattern), one app, App Router,
  filesystem read server-side.
- Mode: **dispatcher** (`DISPATCHER.md` spawns the roles).
- Environments: **local only.** No dev server, no staging, no production, nothing
  deployed.
- Team: Porter (PM / BA / PO / UX writer) · Sober (SA) · Fern (FE). **No BE, no QA.**
- Scope: 🔴 **v1 = READ + RUN, and v1 WRITES NOTHING.** v2 and v3 in `CONSOLE-PLAN.md`
  are out of scope until the owner says otherwise.
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-001 | v1 — two read-only screens fed by the gate | HIGH | DELIVERED 2026-10-05 22:03, owner (TASK-001..004 DONE) — SYSTEM-FACTS.md; report in REQ-001 §SPEC_DONE report | — (closed; sweep is Marie's) |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-001 | scaffold + config + AC-7 + gate runner + refresh shell | SPEC-001 | DONE 2026-10-05 21:07, Sober — review + Q-F1 answer in `tasks/TASK-001-scaffold-config-gate-runner.md` §Review | FE (Fern) | none |
| TASK-002 | Workspace screen — cards, error card, list failure | SPEC-001 | DONE 2026-10-05 21:18, Sober — review + Q-F2 answer in `tasks/TASK-002-workspace-screen-cards.md` §Review | FE (Fern) | TASK-001 |
| TASK-003 | Project screen — Gate · File health · Ball | SPEC-001 | DONE 2026-10-05 21:30, Sober — review + Q-F3 answer in `tasks/TASK-003-project-screen.md` §Review | FE (Fern) | TASK-001 |
| TASK-004 | read-only + single-source evidence (AC-8, AC-9) | SPEC-001 | DONE 2026-10-05 21:47, Sober — review + D-16 in `tasks/TASK-004-read-only-single-source-evidence.md` §Review | FE (Fern) | TASK-002, TASK-003 |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
