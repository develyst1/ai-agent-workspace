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
- Stack: **DECIDED 2026-09-18 by the owner** — Bun+Hono · PostgreSQL 18 (shared SIT DB, no local DB) · Next.js 16 + Mantine (Q-1 open) · AI via the owner's gateway. Facts in SYSTEM-FACTS §Stack, design in `specs/SPEC-001`.
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
| REQ-001 | User tiers — definitions, discounts, score→tier rule | HIGH | READY_FOR_SA — 2026-09-18, Porter, next in Sober's queue after REQ-003, `requirements/REQ-001-user-tiers.md` | Sober |
| REQ-002 | Sign in with Google | HIGH | IN_SPEC — 2026-09-18, Sober, `specs/SPEC-002-google-sign-in.md` (TASK-003 BE, TASK-004 FE) | Sober (review TASK-003) |
| REQ-003 | Submit an idea and see the AI analysis | HIGH | READY_FOR_SA — 2026-09-18, Porter, next in Sober's queue, `requirements/REQ-003-submit-idea-and-analysis.md` | Sober |
| REQ-004 | Hire request + owner's admin page | HIGH | READY_FOR_SA — 2026-09-18, Porter, queued after REQ-001, `requirements/REQ-004-hire-request-and-admin.md` | Sober |
| REQ-005 | Bilingual UI TH/EN with switch | MEDIUM | READY_FOR_SA — 2026-09-18, Porter, queued last, `requirements/REQ-005-bilingual-ui.md` | Sober |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-001 | Scaffold `possibility-back` (Bun+Hono+Drizzle, health route) | SPEC-001 | REVIEW — 2026-09-19, Jason, evidence in TASK-001 §Implementation Notes (health db:ok UNVERIFIED, no .env), `tasks/TASK-001-scaffold-back.md` | Jason | — |
| TASK-002 | Scaffold `possibility-front` (Next.js 16 + UI lib per Q-1) | SPEC-001 | BLOCKED — 2026-09-18, waiting SPEC-001 Q-1, `tasks/TASK-002-scaffold-front.md` | Fern | Q-1 |
| TASK-003 | BE users table + Google auth endpoints + session middleware | SPEC-002 | REVIEW — 2026-09-19, Jason, evidence in TASK-003 §Implementation Notes (migrate + real-token UNVERIFIED: DR-4, DR-2), `tasks/TASK-003-be-google-auth.md` | Jason | TASK-001 ✓ |
| TASK-004 | FE Google button, AuthContext, header, guard | SPEC-002 | BLOCKED — 2026-09-18, waiting TASK-002, `tasks/TASK-004-fe-google-sign-in.md` | Fern | TASK-002, TASK-003 |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| SPEC-001 Q-1: Mantine (Sober recommends) vs Ant Design — the skill has no Mantine variant; blocks TASK-002/004 (FE) only | the owner, via Porter | 2026-09-18 | `specs/SPEC-001-stack-and-ai-provider.md` §Questions |
| DR-2 Google OAuth client ID (origin `http://localhost:3000`) | the owner, via Porter | 2026-09-18 | `specs/SPEC-001-stack-and-ai-provider.md` §Questions |
| DR-4 the owner fills `possibility-back/.env` from `.env.example` on the dev machine (DATABASE_URL, SESSION_SECRET ≥32 chars, ADMIN_EMAIL, AI_GATEWAY_URL, AI_PROVIDER=openai, AI_MODEL=gpt-4o, FRONTEND_ORIGIN=http://localhost:3000, PORT=4000; GOOGLE_CLIENT_ID = DR-2) | the owner, via Porter | 2026-09-19 | `tasks/TASK-001-scaffold-back.md` §Questions |
