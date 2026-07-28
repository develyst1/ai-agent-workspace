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
| REQ-001 | User accounts & authentication | MEDIUM | ✅ DELIVERED | — (accepted by Porter 2026-07-27) |
| REQ-002 | People database — per-person profiles | MEDIUM | ✅ DELIVERED | — (accepted by Porter 2026-07-28) |
| REQ-003 | AI "Approach Advisor" (via AI Center) | MEDIUM | ✅ DELIVERED (CORE + optional) | — (fully accepted by Porter 2026-07-28; all SPEC-003 tasks 012–015 DONE) |
| REQ-004 | Render markdown in the AI cards (advisor + summary) | MEDIUM | ✅ DELIVERED | — (accepted by Porter 2026-07-28; XSS-safe verified) |

> **STATUS 2026-07-28:** All 4 REQs DELIVERED · all 16 tasks DONE · build complete.
> **Deployment PARKED at stakeholder's request** — nothing waiting on any role. To
> resume going live: Porter collects a hosting DATA REQUEST (where front/API live →
> SameSite) + routes a deploy REQ (push `dong` both repos → drizzle `0000`+`0001` →
> `AI_CENTER_BASE_URL=https://ai.develyst.online`). Code on `dong`, not pushed.
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
| TASK-004 | Auth UI — register/login/logout + guard | SPEC-001 | ✅ DONE | Fern | TASK-002 ✅ + TASK-003 ✅ |
| TASK-005 | People schema + migration + ownership helper | SPEC-002 | ✅ DONE | Jason | — |
| TASK-006 | People CRUD API | SPEC-002 | ✅ DONE | Jason | TASK-005 |
| TASK-007 | Sub-resources: feelings/interactions/tags API | SPEC-002 | ✅ DONE | Jason | TASK-006 |
| TASK-008 | List search/filter + export API | SPEC-002 | ✅ DONE | Jason | TASK-007 ✅ |
| TASK-009 | People list + create/edit form (UI) | SPEC-002 | ✅ DONE | Fern | TASK-006 ✅ |
| TASK-010 | Person profile page (UI) | SPEC-002 | ✅ DONE | Fern | TASK-007 ✅, TASK-009 ✅ |
| TASK-011 | Search/filter UI + export button | SPEC-002 | ✅ DONE | Fern | TASK-008 ✅, TASK-009 ✅ |
| TASK-012 | AI Center client + Approach Advisor endpoint (CORE) | SPEC-003 | ✅ DONE | Jason | — |
| TASK-013 | AI notes summarization endpoint (OPTIONAL) | SPEC-003 | ✅ DONE | Jason | TASK-012 ✅ |
| TASK-014 | Approach Advisor UI (CORE) | SPEC-003 | ✅ DONE (+ full-chain live confirm) | Fern | TASK-012 ✅ |
| TASK-015 | Note-summary UI (OPTIONAL) | SPEC-003 | ✅ DONE | Fern | TASK-013 ✅, TASK-014 ✅ |
| TASK-016 | Shared XSS-safe markdown renderer for AI cards | SPEC-004 | ✅ DONE | Fern | — |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~DATA REQUEST — AI Center URL/auth~~ ✅ ANSWERED (Porter, 2026-07-28) | — | `AI_CENTER_BASE_URL=https://ai.develyst.online` (chat `POST {base}/chat` → `https://ai.develyst.online/chat`); **no auth**. **Supersedes** the Bruno `r1.develyst.online/ai`. See `project-docs/ai-center-access.md`. **Applied by Sober 2026-07-28** — SPEC-003 updated; live E2E confirmed on TASK-012 (real 200, deepseek, profile-specific card). |
| ~~Privacy confirm~~ ✅ ANSWERED (Porter, 2026-07-28) | — | Stakeholder **accepts** sending a person's profile to the external AI Center. See `project-docs/ai-center-access.md`. |
