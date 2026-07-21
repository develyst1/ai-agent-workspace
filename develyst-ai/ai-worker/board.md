# Board — develyst-ai

> Single source of truth. Update me at the end of every session (see PROTOCOL.md).

## Project info

- Description: Develyst AI Gateway — Bun + Hono HTTP server that unifies multiple
  AI providers (OpenAI, Gemini, xAI, DeepSeek, …) behind one normalized
  `AIResponse` API, with small/medium/flagship model tiers and multi-model
  parallel calls. GitLab: Develyst-develop-team-knowledge/ai-Develyst.
- Code repository: `C:\Users\Admin\develyst\develyst-ai`
  (single repo, backend only — port from `.env PORT`, default 3009;
  `bun run dev` / `bun run demo`; Bruno request files in `bruno/`;
  no test runner or linter configured)
- **Read first**: the repo's `CLAUDE.md` — it documents the architecture,
  request flow, model-tier resolution, and the exact 4-file recipe for adding
  a new provider.
- No database. Real-world data here = **provider API keys and `.env` secrets**:
  the human supplies/rotates them (DATA REQUEST via the chain). Never print,
  log, or commit key values; refer to keys by env-var name only. Live calls
  against paid provider APIs for verification: prefer `bun run demo` /
  Bruno with the keys already present in the local `.env`; anything needing a
  NEW key or paid usage beyond a quick smoke call = DATA REQUEST to the human.
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE)

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Per-project API authentication | HIGH | DELIVERED | — (done, accepted 2026-07-21) |
| REQ-002 | Real-time knowledge (date + general web search) | MEDIUM | DELIVERED | — (done, accepted 2026-07-21; Gemini web search phased) |
| REQ-003 | Internal knowledge / RAG | — | CANCELLED (de-scoped — RAG lives in consuming projects) | — |
| REQ-004 | Project documentation (consumers + maintainers + overview) | MEDIUM | DELIVERED | — (done, accepted 2026-07-21) |
| REQ-005 | Align server default port to 3009 | LOW | READY_FOR_SA | Sober (spec) |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | API key store module + example file + gitignore | SPEC-001 | DONE | Jason | none |
| TASK-002 | Auth middleware, wiring, 401, attribution log, docs | SPEC-001 | DONE | Jason | TASK-001 |
| TASK-003 | Inject current date/time into every model call | SPEC-002 | DONE | Jason | none |
| TASK-004 | AIResponse.sources type + Tavily web-search client | SPEC-002 | DONE | Jason | none |
| TASK-005 | Web-search tool-calling loop (OpenAI-compat providers) | SPEC-002 | DONE | Jason | TASK-004 |
| TASK-007 | Write docs/consumer-guide.md (verified) | SPEC-004 | DONE | Jason | none |
| TASK-006 | Rewrite README.md (overview + doc map + quickstart) | SPEC-004 | DONE | Jason | TASK-007 |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| KNOWN ISSUE (deferred): deepseek DSML tool-call leak | — (human deferred 2026-07-21) | `deepseek-v4-flash` intermittently emits web_search tool-call as DSML text → corrupts `AIResponse.content` (200 + sources OK, answer text garbage). Defect in TASK-005 (`_fetch.ts`). Human chose NOT to fix now — no fix REQ open. Risk: deepseek web-search answers may be corrupted; other providers unaffected. Re-open a fix REQ when wanted. |
