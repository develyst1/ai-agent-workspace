# Board — buddy-screen

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: AI for Kids V1 — an app on a TV (or large screen) with the family's
  existing camera, where a voice-only AI talks with a child and invites them into
  activities; the owner's own product (greenfield). The requirement is `REQ-001`
  (verbatim from the owner). 🔴 Children's data: synthetic only (PROTOCOL § Hard
  boundaries). Everything the owner has said is in
  **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (logical names only — absolute paths in the workspace-root
  `machine.local.md`): `buddy-screen-spec` (owner's requirement repo, read-only) ·
  `buddy-screen-front` (FE) · `buddy-screen-back` (BE — **not cloned yet, owner: later**)
- Stack: TBD — SPEC-001 (the SA proposes; the owner decides)
- Mode: manual (one interactive Claude CLI session per role in tmux; never `claude -p`)
- Environments: local (this machine) only — no dev server, no production
- Team: the PM (PM / BA / PO / UX writer) · the SA Lead (SA) · the BE (BE — idle until
  `buddy-screen-back` exists) · the FE (FE + designer) · QA (QA) — names in `TEAMS.md`
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-001 | AI for Kids V1 — owner's requirement, verbatim | HIGH | DECIDED except [needs owner] items (2026-10-28 19:58, PM; `DECISIONS.md`; full text `../project-docs/requirements-v1.md`) | owner (D2/D5/D6/D8/PDPA) |
| REQ-002 | Full requirement + diagrams in buddy-screen-spec, Vite mock demo | HIGH | DELIVERED (2026-10-28 21:50, PM — QA TEST_PASSED round 2; spec `main` 68d3aef pushed; `requirements/REQ-002-spec-repo-and-vite-demo.md`) | — |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-001 | Requirement md + 4 diagrams + README in buddy-screen-spec | SPEC-002 | DONE (2026-10-28, SA review, `tasks/TASK-001-spec-repo-requirement-and-diagrams.md` § Review) | FE | — |
| TASK-002 | Vite demo scaffold + engagement logic + TV screens | SPEC-002 | DONE (2026-10-28, SA review, `tasks/TASK-002-vite-demo-scaffold-engagement-tv.md` § Review) | FE | — |
| TASK-003 | Vite demo parent LINE/LIFF screens + network check | SPEC-002 | DONE (2026-10-28, SA review, `tasks/TASK-003-vite-demo-parent-line-liff-screens.md` § Review) | FE | TASK-002 |
| TASK-004 | Demo: apply PM wording review (11 replacements, no ร่าง left) | SPEC-002 | DONE (2026-10-28, SA review, `tasks/TASK-004-demo-pm-approved-wording.md` § Review) | FE | TASK-003 |
| TASK-005 | Fix TEST-001 DEF-1..4 (TV decline screen, diagrams, buy-back, no face emoji) | SPEC-002 | DONE (2026-10-28, SA review, `tasks/TASK-005-demo-fix-test001-defects.md` § Review) | FE | TASK-004 |
| TASK-006 | Demo: apply PM review of TASK-005 labels (3 replacements, no ร่าง left) | SPEC-002 | DONE (2026-10-28, SA review, `tasks/TASK-006-demo-pm-wording-task005-labels.md` § Review) | FE | TASK-005 |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-002 | TEST-001 | TEST_PASSED (2026-10-28 21:45, QA; round 2: DEF-1..4 fixed, regression ok, 4 NOT_TESTED named; `tests/TEST-001-spec-repo-and-vite-demo.md`) | TEST_PASSED |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| REQ-001 / SPEC-001 | owner: [needs owner] — D2/D2a/D2b (paid probes not approved), D5, D6, D8, PDPA check | 2026-10-28 | `DECISIONS.md` 2026-10-28 19:58 |