# Board — corner-chat

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: corner-chat — a unified inbox with an AI guard: messages from LINE, Discord, Zimbra Mail,
  Web Chat (later Microsoft Teams) in one place, filtered by AI before they reach people; auto-reply
  rules and a dashboard. The owner's requirement, verbatim:
  `../project-docs/requirements-from-owner-2026-11-01.md`. Everything the owner has said is in
  **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (logical names only — absolute paths in the workspace-root
  `machine.local.md`): `corner-chat-back`, `corner-chat-front` — both empty (README only), greenfield;
  branches `main` (checked out), `develop`, `atom`, `sit`, `uat`, `production`; **working branch
  undecided** (Blocked / waiting). **Both teams work in both repos**, split by the claims below.
- Stack: back = **Bun + Hono or Bun + Elysia only, never NestJS**, + Postgres (the SA chooses in SPEC-001)
  · front = Dashboard + Web Chat, TBD — SPEC-001 · AI through the owner's LLM gateway.
- Mode: **manual** (one session per role) — `DECISIONS.md` 2026-11-01.
- Environments: local only. Real systems: read when needed; any send or change needs the owner's go
  each time (DATA REQUEST through the PM) — `SYSTEM-FACTS.md`.
- Team: the PM (both teams) · Team A: SA, BE, FE, tester · Team B: SA, BE, FE, tester — names,
  inboxes (`-B` = Team B) and session names in `TEAMS.md`.
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.

## Batch claims

> **State only — one line per ACTIVE batch.** The PM claims a file area per team
> **before either team starts** (`PROTOCOL.md` → "Two teams — batch claims"). Format:
> `Batch YYYY-MM-DD: Team A → <areas> · Team B → <areas>`
> An item spanning both claimed areas is not split — it goes to one team whole.

*(no batch yet)*

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| Q1c LINE quota / paid plan — decides LINE two-way vs one-way first (SA: two-way = M, answered 2026-11-01) | PM ↔ owner | 2026-11-01 | `../project-docs/requirement-understanding-2026-11-01.md` §Q1-SA + PM note |
| The team's working branch is undecided (a new own branch like smart-scheduler's `dong`, or `atom`) — the PM settles it with the owner before the first `ขึ้น git` | PM ↔ owner | 2026-11-01 | `SYSTEM-FACTS.md` → Repos |
