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
| REQ-001 | AI for Kids V1 — owner's requirement, verbatim | — | DRAFT (2026-10-28, filed by Marie at desk-open, `requirements/REQ-001-ai-for-kids-v1.md`) | PM |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
