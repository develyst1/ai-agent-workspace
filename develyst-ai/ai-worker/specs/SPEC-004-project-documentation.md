# SPEC-004: Project documentation for three audiences

- Source: REQ-004
- Status: ACTIVE

## Overview

Make the repo self-explanatory for **consumers**, **maintainers**, and
**leadership** by fixing the entry point and filling the one real content gap —
without duplicating what already exists. Docs only; no code/behavior changes.

**Current state (I read the real repo before speccing):**
- `README.md` — has solid **Authentication** and **Real-time knowledge** sections
  (added during SPEC-001/002), but the rest is **GitLab template boilerplate**
  ("Getting started with GitLab", "Add your files", "Editing this README", generic
  section stubs). No overview, no run-locally, no endpoint/request/response
  reference, no tier/provider guide. This is the discoverability + overview gap.
- `CLAUDE.md` (repo) — already a strong **maintainer** reference: architecture,
  request flow, model-tier resolution, the 4-file add-a-provider recipe, env-var
  table, Bruno notes. **Reuse it — link, don't repeat.**
- `bruno/` — a complete collection (GET Info/Models, per-provider Chat, Web Search,
  Multi) + `environments/local.bru` with `baseUrl`/`apiKey`. **Reuse as the
  runnable consumer examples.**
- `.env.example` — accurate and complete (provider keys, `PORT`, defaults, Tavily
  vars with comments).

**Approach:** (1) rewrite `README.md` into the single entry point — a
leadership-readable overview + a documentation map that routes each audience +
a verified quickstart, keeping the existing Auth/Real-time sections; (2) add one
new **consumer/integration guide** (`docs/consumer-guide.md`) with a full,
**verified** endpoint reference and copy-paste examples; (3) route maintainers to
the existing `CLAUDE.md`. Minimal new surface, no duplication.

**Why not a docs website / generated API reference:** out of scope and overkill
for a single small backend — Markdown in-repo + the existing Bruno collection is
the simplest path that meets every AC.

## Known doc/code mismatch to surface (NOT to silently fix)

Per REQ-004's constraint (report mismatches as bugs): the repo `CLAUDE.md` (and
the board's project-info) say the server port **defaults to 3009**, but the code
`src/index.ts` uses `Number(process.env.PORT) || 3002` and `.env.example` sets
`PORT=3002`. **The actual default is 3002.** The docs must state what the code
actually does (3002) and the task must **flag this 3009/3002 discrepancy in its
notes** so Porter can confirm the intended default with the human. Correcting the
*doc* to match the code is in-scope for a docs REQ; do **not** change the code's
default under this REQ.

## Deliverables / Interface

1. **`README.md` (rewritten entry point)** — remove all GitLab template
   boilerplate. Must contain, in order:
   - **Overview** (2–4 sentences, non-engineer readable): what the AI Center is
     (one normalized API over OpenAI/Gemini/xAI/DeepSeek), what it does
     (multi-provider chat, small/medium/flagship tiers, multi-model parallel,
     current date/time awareness, web search with sources), and when to use it.
   - **Documentation map** (discoverability): "I want to *call* the API →
     `docs/consumer-guide.md`; *run/extend* the repo → `CLAUDE.md`; *understand at
     a glance* → this overview." One or two clicks to the right doc.
   - **Quickstart** — install (`bun install`), set up `.env` (from `.env.example`)
     and `api-keys.json` (from `api-keys.example.json`), run (`bun run dev`, note
     the **actual** default port), and one minimal authenticated `curl` that works.
   - Keep the existing **Authentication** and **Real-time knowledge** sections
     (they're accurate) — may be trimmed/moved, not dropped.
2. **`docs/consumer-guide.md` (new)** — the audience-1 integration guide:
   - How to obtain + send a project key (`Authorization: Bearer <key>`).
   - **Endpoint reference:** `POST /chat`, `POST /chat/multi`, `GET /`,
     `GET /models`, `GET /tiers` — purpose, request body, response.
   - **Request/response shapes:** `ChatRequest` (provider, model, tier,
     temperature, max_tokens, timeout, messages, `web_search`) and the normalized
     `AIResponse` including the optional **`sources`** field; the success envelope
     `{ success, data }` and the `401`/error shapes.
   - Choosing a **provider/tier** (what small/medium/flagship mean; the default
     provider + fallback behavior when `provider` is omitted).
   - **Web search:** how it triggers (model-decided), what `sources` looks like,
     how to disable per-call (`"web_search": false`).
   - **Copy-pasteable examples:** working `curl` for at least an authed `/chat`, a
     web-search `/chat`, and `/chat/multi`; plus a pointer to the Bruno collection
     (`bruno/`, `local` env) as the ready-made alternative.
   - **Honest limits:** web search on openai/xai/deepseek only (**Gemini not yet**);
     Tavily **free tier**; auth required on all `/chat*`.
3. **Maintainer guide** — no new file; `README`'s documentation map points to
   `CLAUDE.md`. If a genuine run/extend gap exists there, add a short note to
   `CLAUDE.md` rather than a new doc (reuse-first).

## Non-functional

- **Accuracy is the hard requirement:** every endpoint, header, field, env var,
  and example must match current code and be **executed against the running server**
  before the task is DONE (evidence-before-completion). No aspirational/stale text.
- **No secrets:** placeholders only (`Authorization: Bearer <project-key>`,
  `TAVILY_API_KEY=...`); never a real key value, in prose or example output.
- **Reuse over duplication:** link `CLAUDE.md` / `.env.example` / `bruno/` instead
  of restating them.

## Tasks

- TASK-007: Write `docs/consumer-guide.md` (verified endpoint + shapes + examples).
  Depends on: —
- TASK-006: Rewrite `README.md` (overview + doc map + quickstart; drop boilerplate;
  keep Auth/Real-time; link the guide + CLAUDE.md); surface the 3002/3009 mismatch.
  Depends on: TASK-007 (so the linked guide exists).

## Questions

(Jason asks here; Sober answers as `> answer: ...`)

- (Sober → Porter, informational, non-blocking) During this work BE will surface
  the **port default doc-bug** (code=3002 vs `CLAUDE.md`=3009) in the task notes.
  I'll relay it to you for the human to confirm the intended default; the docs
  themselves will state the code's actual behavior (3002) meanwhile. No code change
  under this REQ.
