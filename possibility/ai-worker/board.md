# Board — possibility

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here.

## Project info

- Description: **Possibility** — a platform for taking on freelance / innovation
  work. A user says what they want; the AI analyses it for feasibility, impact
  on society, and how interesting it is. Five user tiers: Ordinary · Seeker ·
  Raw Diamond · Visionary · The Possibility. Everything the owner has said about
  it is in **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (three, **greenfield**, logical names only — absolute paths in the
  workspace-root `machine.local.md`): `possibility-back` (Jason) ·
  `possibility-front` (Fern) · `possibility-spec` (the owner's requirement repo,
  read-only for every role).
- Stack: **DECIDED 2026-09-18 by the owner** — Bun+Hono · PostgreSQL 18 (shared SIT DB, no local DB) · Next.js 16 + Ant Design · AI via the owner's gateway. Facts in SYSTEM-FACTS §Stack, design in `specs/SPEC-001`.
- Mode: **manual** — one session per role, the owner nudges. Starters in the
  workspace-root `SESSION-STARTERS.md`.
- Environments: apps run locally; **the database is the shared SIT PostgreSQL** (`possibility_db`, owner-supplied `.env`) — no local DB, no production. Rules in SPEC-001 §D8b.
- Team: Porter (PM / BA / PO / UX writer) · Sober (SA) · Jason (BE) · Fern (FE)
  · Tanya (QA). Chain: Human ↔ Porter ↔ Sober ↔ (Jason, Fern); Tanya ↔ Porter.
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.
- Desk opened: 2026-09-17 by Marie (workspace operations), on the owner's
  instruction. First session: Porter — turn the owner's intent and
  `possibility-spec` into REQ-001, and raise the open questions in
  `SYSTEM-FACTS.md` §Open questions.

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-001 | User tiers — definitions, discounts, score→tier rule | HIGH | IN_SPEC — 2026-09-19, Sober, `specs/SPEC-004-user-tier-display.md` (computation in SPEC-003; TASK-007 FE) | Fern (after 004) |
| REQ-002 | Sign in with Google | HIGH | IN_SPEC — 2026-09-19, `specs/SPEC-002-google-sign-in.md`; TASK-003 proof + TASK-002/004 FE now unblocked | Jason (003 proof) · Fern (002) |
| REQ-003 | Submit an idea and see the AI analysis | HIGH | IN_SPEC — 2026-09-19, chain APPROVED by owner, `specs/SPEC-003-idea-analysis-chain.md`; TASK-005 BE / TASK-006 FE | Jason (TASK-005) |
| REQ-004 | Hire request + owner's admin page | HIGH | READY_FOR_SA — 2026-09-18, Porter, queued after REQ-001, `requirements/REQ-004-hire-request-and-admin.md` | Sober |
| REQ-005 | Bilingual UI TH/EN with switch | MEDIUM | READY_FOR_SA — 2026-09-18, Porter, queued last, `requirements/REQ-005-bilingual-ui.md` | Sober |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-001 | Scaffold `possibility-back` (Bun+Hono+Drizzle, health route) | SPEC-001 | DONE — 2026-09-19, Sober review in `tasks/TASK-001-scaffold-back.md` §Review (db:ok UNVERIFIED → TASK-003) | Jason | — |
| TASK-002 | Scaffold `possibility-front` (Next.js 16 + Ant Design) | SPEC-001 | TODO — 2026-09-19, Sober, `tasks/TASK-002-scaffold-front.md` | Fern | — |
| TASK-003 | BE users table + Google auth endpoints + session middleware | SPEC-002 | BLOCKED — 2026-09-19, Jason: `possibility_db` does not exist on SIT (Q-2, DATA REQUEST via Sober), `tasks/TASK-003-be-google-auth.md` | Jason | TASK-001 ✓ |
| TASK-004 | FE Google button, AuthContext, header, guard | SPEC-002 | TODO — 2026-09-19, after TASK-002, `tasks/TASK-004-fe-google-sign-in.md` | Fern | TASK-002, TASK-003 |
| TASK-005 | BE ideas + 5-step AI chain + tier + endpoints | SPEC-003 | IN_PROGRESS — 2026-09-19, Jason (code; DB apply waits on TASK-003 Q-2), `tasks/TASK-005-be-idea-analysis-chain.md` | Jason | TASK-003 |
| TASK-006 | FE idea box, result page, My ideas | SPEC-003 | BLOCKED — 2026-09-19, waiting TASK-004 + TASK-005, `tasks/TASK-006-fe-idea-and-result.md` | Fern | TASK-004, TASK-005 |
| TASK-007 | FE header tier badge + /me profile | SPEC-004 | BLOCKED — 2026-09-19, waiting TASK-004, `tasks/TASK-007-fe-tier-badge-and-profile.md` | Fern | TASK-004 |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| DR-5 company reference text (`config/company-reference.md`) — placeholder used until supplied | the owner, via Porter | 2026-09-19 | `specs/SPEC-003-idea-analysis-chain.md` §Chain |
