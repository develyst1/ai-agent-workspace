# Board — code-class

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: freelance teaching — programming basics (the same in every language) plus AI. The desk makes
  teaching material, not an app: a course repo that reads well to a Fastwork client, and a class schedule.
  Everything the owner has said is in **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (logical names only — absolute paths in the workspace-root
  `machine.local.md`): `code-class-docs` (branch `main`, greenfield)
- Stack: TBD — the SA proposes the format in REQ-001's SPEC
- Mode: manual (sessions `<Name>-CLS`)
- Environments: local only
- Team: the PM (PM / BA / PO / UX writer) · the SA Lead (SA) · the FE (FE) · QA (QA) — no BE
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-001 | First course: (a) `code-class-docs` folder structure that reads well to a Fastwork client · (b) class schedule table · (c) course outline: basics + AI — SA proposes, owner approves via PM before content | P1 | IN_SPEC (2026-11-12, SA, `specs/SPEC-001-…` proposal ready; TASKs cut after AC-1) | owner (AC-1: yes or corrections on §6 pack, asked 2026-11-12) |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-001 | TEST-001 | DRAFT (2026-11-12, QA, 15 cases from AC-2..AC-10; runs after AC-1 + build) `tests/TEST-001-req001-course-structure-schedule-outline.md` | — |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
