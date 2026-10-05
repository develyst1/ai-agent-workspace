# Closed board rows — harness-console

> Rows swept off `board.md` when they close. A row arrives here **byte-verbatim**
> the moment its status becomes `DONE` / `DELIVERED`; detail stays in its own
> `requirements/REQ-*.md` / `tasks/TASK-*.md` file. Sweeping is Marie's alone.

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
