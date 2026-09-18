# Board — pun-kub-fang

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: **ปั่นกับฟ่าง · Pun Kub Fang** — a smoothie / drinks shop site
  that already exists and belongs to another developer. **Our job is the
  backend** (`pun-kub-fang-back`, Bun + Hono, greenfield, ours entirely) and
  the API seam in the front. Everything the owner has said is in
  **`SYSTEM-FACTS.md` — read it first, every session.** What the front actually
  does today is in `../project-docs/as-built-survey-2026-09-18.md` (read-only
  survey: **the front makes no network call; all content is static in
  `src/data/site.ts`, imported by 41 files**).
- Repos (logical names only — absolute paths in the workspace-root
  `machine.local.md`; ⚠️ the parent folder is misspelled `pub-`, the real name
  is `pun-kub-fang`): `pun-kub-fang-back` (Jason, all of it) · `pun-kub-fang`
  (the other developer's; **Fern is a guest** — files a TASK names, only).
- Stack: back = **Bun + Hono** (decided). Database, layout, OpenAPI generation,
  working branch = **SPEC-001** (Sober proposes, owner decides). Front = Next.js
  16 + React 19 + Tailwind 4 + antd 6 (theirs).
- Mode: **manual** — one session per role, the owner nudges.
- Environments: **local only.** No dev server yet. No production / real DB for
  anyone on this team.
- Team: Porter (PM / BA / PO) · Sober (SA — owns the **public API contract**)
  · Jason (BE) · Fern (FE, guest) · Tanya (QA — our team's work only). Chain:
  Human ↔ Porter ↔ Sober ↔ (Jason, Fern); Tanya ↔ Porter. Nobody talks to the
  other developer.
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.
- Desk opened: 2026-09-18 by Marie (workspace operations), on the owner's
  instruction. First session: Porter — get Q1–Q5 in `SYSTEM-FACTS.md` answered
  and write REQ-001 for the first resource the API must serve.

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
| Q1–Q3: who the other developer is, their branch, our seam branch, deployment | **Human (owner)**, via Porter | 2026-09-18 | `SYSTEM-FACTS.md` §Open questions |
| SPEC-001: database, layout, OpenAPI, back working branch, bilingual naming | Sober (proposal) → owner via Porter | 2026-09-18 | `SA-Lead.md` §Your first job |
