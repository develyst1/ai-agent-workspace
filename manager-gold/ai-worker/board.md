# Board — manager-gold

> Single source of truth. Update me at the end of every session (see PROTOCOL.md).

## Project info

- Description: A **multi-user personal "people-intelligence" web app**. Each user
  keeps a private database of people — capturing how each person thinks/feels
  (incl. feelings toward the user, reasoning/decision style) — and gets **AI-generated
  advice on how to approach a specific person about a specific topic** (tone, what
  to say, what to avoid).
- AI Center (human-provided): AI features are powered by the existing **develyst-ai
  gateway**. Bruno reference: `H:\chipint\develyst-ai\bruno` (chat endpoints +
  Models/Info). Base URL / API keys come from the human via DATA REQUEST.
- Code repository:
  - Backend: `H:\manager-gold\manager-gold-back` — Node/Bun runtime (observed
    from `.gitignore`; SQLite mentioned). Greenfield: only `README.md` so far.
  - Frontend: `H:\manager-gold\manager-gold-front` — Next.js + TypeScript
    (observed from `.gitignore`). Greenfield: only `README.md` so far.
  - *(Stack notes above are observed from repo scaffolding, not a design
    decision — Sober to confirm/own the technical stack.)*
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE) · Fern (FE)

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | User accounts & authentication | MEDIUM | **IN_SPEC** | Fern — 3/4 TASKs DONE (001/002/003); last = TASK-004 auth UI |
| REQ-002 | People database — per-person profiles | MEDIUM | READY_FOR_SA | Sober (write SPEC — next) |
| REQ-003 | AI "Approach Advisor" (via AI Center) | MEDIUM | READY_FOR_SA | Sober (write SPEC — needs AI Center contract; will read Bruno + DATA REQUEST keys) |

> Suggested sequence: REQ-001 → REQ-002 → REQ-003 (each depends on the previous).
> Deadline: a deadline exists but the stakeholder chose not to disclose it.
> Stack decisions (Sober, 2026-07-26): Bun+Hono + SQLite/Drizzle (back, :4020);
> Next.js+Mantine (front, :3020); cookie sessions + argon2id. See `architecture-baseline.md`.

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Backend bootstrap (Bun+Hono+Drizzle/SQLite) | SPEC-001 | ✅ DONE | Jason | — |
| TASK-002 | Frontend bootstrap (Next.js+TS+Mantine) | SPEC-001 | ✅ DONE | Fern | — |
| TASK-003 | Auth backend — accounts, sessions, guard | SPEC-001 | ✅ DONE | Jason | TASK-001 |
| TASK-004 | Auth UI — register/login/logout + guard | SPEC-001 | REVIEW | Fern (→ Sober) | TASK-002 ✅ + TASK-003 ✅ |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| — | | |
