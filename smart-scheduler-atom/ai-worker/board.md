# Board — smart-scheduler-atom

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: **FORK of `smart-scheduler`**, opened 2026-10-26 by Marie (`MARIE.md` ORDER 35). Knowledge is
  READ from `../smart-scheduler/ai-worker/SYSTEM-FACTS.md` and `OWNER-LIST.md` (READ-ONLY); all working writes
  go only to this desk. 🔴 **No role on this desk writes anything under `smart-scheduler/`.**
- 🔢 **IDs start at 5000:** `REQ-5000`, `SPEC-5000`, `TASK-5000`, `TEST-5000` (`PROTOCOL.md` → Artifact numbering).
- Repos (logical names only — absolute paths in the workspace-root `machine.local.md`): `smart-scheduler-back`,
  `smart-scheduler-front`. Working branch **`atom`** (from `develop`).
- Git (`CLAUDE.md` §6): code — `รวมโค้ด` (merge-workflow) **only after a real test pass** (Tanya's `TEST_PASSED`
  on `sid`) and only on the owner's own word; **no migration without the owner's go** (journal collision with
  `dong`'s 0072). Workspace — synced **only at the real end of a job, by the owner**.
- Mode: manual (desk sessions, nudges along the chain).
- Environments: `sid` (ours) and `uat` (the customer's) — see `../smart-scheduler/ai-worker/SYSTEM-FACTS.md`.
- Team: `TEAMS.md` — Porter (PM) · Tanya (QA) · Team A Sober / Jason / Fern · Team B Silver / Bob / Fanta.
- Read first: `PROTOCOL.md` startup ritual (step 1 = the original desk's facts, READ-ONLY), then your role
  file, then this board, then your inbox + `inbox/RELAY.md`, then today's log.

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-5000 | Voucher booking tab cannot find a child who has a voucher (uat) | HIGH | DRAFT (2026-10-26, Porter) — uat read-only investigation first → `requirements/REQ-5000-*.md` | Tanya · owner (child name + uat login) |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|

## Batch claims

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| REQ-5000 | owner — which child + uat read-only login | 2026-10-26 | REQ-5000 §Questions Q1 |
