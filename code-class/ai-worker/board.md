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
| REQ-001 | First course: (a) `code-class-docs` folder structure that reads well to a Fastwork client · (b) class schedule table · (c) course outline: basics + AI — SA proposes, owner approves via PM before content | P1 | IN_SPEC (2026-11-12, owner chose 12-class course, learner takes 01–04 — `DECISIONS.md`; SPEC-001 rev 2 shown to owner for AC-1 §6; TASK-001 cut; due 2026-11-15) | owner (AC-1, 9 lines) |
| REQ-002 | First learner's class material 01–04 + bonus (class 01 due 2026-11-15, taught 2026-11-16) | P1 | IN_SPEC (2026-11-12, SA, `specs/SPEC-002-…`; TASK-002..006 cut; bonus = `extras/` page, not class 05) | FE (TASK-001→006) · QA (TEST draft) |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-001 | Course structure + 12 placeholders | SPEC-001 | DONE (2026-11-12, SA review, A1 included) | FE | — |
| TASK-002 | Class 01 page + bill_v1 | SPEC-002 | BLOCKED (2026-11-12, waiting: owner via PM — install Python 3.12+; page written; TASK Q1; **due 2026-11-15**) | FE | TASK-001 |
| TASK-003 | Class 02 page + bill_v2 | SPEC-002 | REVIEW (2026-11-12, SA interim: B1 done; only Python runs left; due 2026-11-16) | FE | TASK-002 |
| TASK-004 | Class 03 page + bill_v3 | SPEC-002 | REVIEW (2026-11-12, SA interim: B1 done; only Python runs left; due 2026-11-17) | FE | TASK-003 |
| TASK-005 | Class 04 page + bill_v4 | SPEC-002 | REVIEW (2026-11-12, SA interim: B1 + page line done; Python runs + real tracebacks left; due 2026-11-18) | FE | TASK-004 |
| TASK-006 | Bonus hour planning page | SPEC-002 | DONE (2026-11-12, SA review) | FE | TASK-001 |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-001 | TEST-001 | DRAFT (2026-11-12, QA, 15 cases from AC-2..AC-10; runs after AC-1 + build) `tests/TEST-001-req001-course-structure-schedule-outline.md` | — |
| REQ-002 | TEST-002 | DRAFT (2026-11-12, QA, 15 cases; Q-QA-2 answered; Q-QA-1 Python install with owner; runs when PM says pages final) `tests/TEST-002-req002-classes-01-04-material.md` | — |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| TASK-002..005 Python evidence | owner via PM — Python 3.12+ on the desk machine | 2026-11-12 | `tasks/TASK-002…` § Questions Q1 |
