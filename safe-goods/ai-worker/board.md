# Board — safe-goods

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: **safe-goods = "เว็บกลาง"** — escrow site: buyer pays in, seller delivers with evidence, admin pays out; "it's not ok" dispute + admin room. Full definition:
  `SYSTEM-FACTS.md` §What the product is (owner, 2026-09-20). `safe-goods-spec` is still empty;
  everything the owner has said is in
  **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (three, **greenfield**, logical names only — absolute paths in the
  workspace-root `machine.local.md`): `safe-goods-back` (Jason) ·
  `safe-goods-front` (Fern) · `safe-goods-spec` (the owner's requirement repo,
  read-only for every role).
- Stack: **decided by the owner 2026-09-20** — Bun+Hono · Next.js+Ant Design · branch `main`;
  see `SYSTEM-FACTS.md` §Stack. SPEC-001 applies it.
- Mode: **manual** — one session per role, the owner nudges.
- Environments: **local (engineers) · dev PostgreSQL · SIT `https://klang.develyst.online/` (owner deploys, Tanya tests there)**. No production.
- Team: Porter (PM / BA / PO / UX writer) · Sober (SA) · Jason (BE) · Fern (FE) · Tanya (QA)
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.
- Desk opened: 2026-09-20 by Marie (workspace operations) from `_templates/project`,
  on the owner's instruction. First session: Porter — ask the owner what safe-goods
  IS (SYSTEM-FACTS Q1), then turn his answers and `safe-goods-spec` into REQ-001.

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-002 | Run on PostgreSQL (replace SQLite) | HIGH | SPEC_DONE (2026-09-21) — deployed to SIT by the owner; handed to Tanya for TEST-002 on SIT | Tanya (TEST-002) |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-001 | TEST-001 | TEST_PASSED (2026-09-21, round 2) — `tests/TEST-001-deal-room-happy-path.md`; REQ DELIVERED | TEST_PASSED — NOT_TESTED: clipboard, Enter-to-submit, phone |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
