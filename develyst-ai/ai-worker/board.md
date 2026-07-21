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
| — | *(none yet — Porter creates the first REQ)* | | | |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| — | *(none yet)* | | | | |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| — | | |
