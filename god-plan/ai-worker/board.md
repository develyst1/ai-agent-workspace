# Board — god-plan

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: God Plan — the owner creates projects and tasks; family and team members (real people) view progress
  and blockers and comment, like Trello or Jira; AI through the owner's gateway. The owner's requirement, verbatim:
  `../project-docs/requirements-from-owner-2026-11-07.md` (+ `owner-facts-via-atom-2026-11-07.md`). Everything the
  owner has said is in **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (logical names only — absolute paths in the workspace-root
  `machine.local.md`): `god-plan-back`, `god-plan-front` — cloned by Atom 2026-11-08, branch `atom`.
- Stack: Next.js front, Bun + Hono back, own database on the owner's dev Postgres (owner 2026-11-08 00:39, `DECISIONS.md`). Dev-server method ⚠️ open. Never a local Postgres.
- Mode: **manual** (one session per role) — `DECISIONS.md` 2026-11-08.
- Environments: local only. No database, dev server or production chosen yet.
- Team: one team — the PM, the SA, the BE, the FE, the QA. Names, models and session names: `TEAMS.md`, `DECISIONS.md`.
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-001 | God Plan first release — owner plans, invitees view + comment, AI via gateway | HIGH (team-proposed) | DELIVERED 2026-11-10, PM (owner 16:52) — local release 1; phone/keyboard/screen reader → deploy gate → `requirements/REQ-001-…`; was TEST_PASSED 2026-11-09 round 5 → `tests/TEST-001-…` §Verdict | — (closed; sweep is Marie's) |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-001 | Create the `god_plan` dev database (harness script, once) | SPEC-001 | DONE 2026-11-09, SA (created by Atom for owner 14:58, relayed; proof = TASK-003 step 6) → TASK-001 §Review | BE | none |
| TASK-002 | AC-10 comp: static project page | SPEC-002 | DONE 2026-11-08 but REJECTED by owner 13:17 (HeroUI) → superseded by TASK-010 (F-003) | FE | none |
| TASK-003 | Back scaffold + schema + owner:set | SPEC-002 | DONE 2026-11-09, SA review (real-Postgres gate passed) → `tasks/TASK-003-…` | BE | clone; TASK-001 (dev DB steps) |
| TASK-004 | Back: auth, projects, tasks, comments | SPEC-002 | DONE 2026-11-08, SA review (dev-DB curl → TASK-003 6–7) → `tasks/TASK-004-…` | BE | TASK-003 |
| TASK-005 | Back: invites, resets, members | SPEC-002 | DONE 2026-11-08, SA review (link consumed first: accepted) → `tasks/TASK-005-…` | BE | TASK-004 |
| TASK-006 | Back: AI endpoints + stand-in gateway | SPEC-002 | DONE 2026-11-08, SA re-review (stub run by SA) → `tasks/TASK-006-…` | BE | TASK-004 |
| TASK-007 | Front scaffold + owner loop | SPEC-002 | DONE 2026-11-08, SA review (32/32 vs real back) → `tasks/TASK-007-…` | FE | TASK-010, TASK-004 |
| TASK-008 | Front: comments, members, invite, reset | SPEC-002 | DONE 2026-11-08, SA review (31/31 vs real back; Q-F5 → TASK-012) → `tasks/TASK-008-…` | FE | TASK-005, TASK-007 |
| TASK-009 | Front: AI proposals + summary | SPEC-002 | DONE 2026-11-08, SA review (37/37 + AC-11 idle, real back + stub) → `tasks/TASK-009-…` | FE | TASK-006, TASK-007 |
| TASK-010 | AC-10 comp redo on HeroUI (front scaffold + mock page) | SPEC-002 | DONE 2026-11-08, SA review; A+B previews to the owner via PM (AC-10) → `specs/comps/AC-10-heroui-*.png` | FE | none |
| TASK-011 | Harness: the real back on PGlite + synthetic seed (until the dev DB) | SPEC-002 | DONE 2026-11-08, SA review (run by the SA) → `tasks/TASK-011-…` | BE | none |
| TASK-012 | Back: I2 also returns `ownerName` (Q-F5) | SPEC-002 | DONE 2026-11-08, SA review → `tasks/TASK-012-…` | BE | none |
| TASK-013 | Front: 28 s timeout also covers the body read (OBS-1 hardening) | SPEC-002 | DONE 2026-11-08, SA review (gap reproduced, fixed on same recipe) → `tasks/TASK-013-…` | FE | none |
| TASK-014 | Front: explicit `/api` proxy route, 27 s bound (fixes DEF-1) | SPEC-002 | DONE 2026-11-09, SA review (cause unproven: machine freezes; Q-F6 to QA) → `tasks/TASK-014-…` | FE | none |
| TASK-015 | Harness: opt-in live-gateway switch for D11 (4 calls, QA only) | SPEC-002 | DONE 2026-11-09; ⛔ live switch must NOT be started (D11 used 14:55) → `tasks/TASK-015-…` | BE | none |
| TASK-016 | Back: config/env + limits module refactor (no behaviour change) | SPEC-003 | DONE 2026-11-09, SA review (116 tests, no migration, build OK) → `tasks/TASK-016-…` | BE | none |
| TASK-017 | Front: config/env + pattern layout refactor (no behaviour change) | SPEC-003 | DONE 2026-11-09, SA review (one AC-8 48.6 s result → QA with stall detector) → `tasks/TASK-017-…` | FE | none |
| TASK-018 | Back: detailed error logging + DEF-2 (real-DB sign-in 500 bursts) | SPEC-002 | DONE 2026-11-09, SA review (cause: lost DB conn; soak 0×500; QA real-DB round next) → `tasks/TASK-018-…` | BE | none |
| TASK-019 | Front: DEF-3 keep typed text + sign-in failure string | SPEC-002 | DONE 2026-11-09, SA review (DEF-3 fixed on real back; QA script note) → `tasks/TASK-019-…` | FE | none |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-001 | TEST-001 | Round 5 2026-11-09, QA — soak 50/50, DEF-3 v2 ×2, api 34/34, ui + real-gaps PASS on real DB → `tests/TEST-001-…` §Round 5 | TEST_PASSED |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
