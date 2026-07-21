# TASK-006: Rewrite `README.md` as the entry point (drop GitLab boilerplate)

- Source: SPEC-004
- Status: DONE
- Depends on: TASK-007 (README links `docs/consumer-guide.md`)

## What to do

Turn `README.md` into the project's single entry point. **Docs only.**

1. **Remove all GitLab template boilerplate** — every "Getting started with
   GitLab", "Add your files", "Integrate with your tools", "Collaborate", "Test and
   Deploy", and the entire "Editing this README" / generic-stub tail. None of it
   describes this project.
2. **Add, in order:**
   - **Title + Overview** (2–4 sentences, non-engineer readable): the AI Center is
     one normalized HTTP API over OpenAI/Gemini/xAI/DeepSeek; it does multi-provider
     chat, small/medium/flagship tiers, multi-model parallel calls, current
     date/time awareness, and model-decided web search with sources; when to use it.
   - **Documentation map** (discoverability): call the API → `docs/consumer-guide.md`;
     run/extend the repo → `CLAUDE.md`; glance overview → this section.
   - **Quickstart** (verified): `bun install`; copy `.env.example`→`.env` and
     `api-keys.example.json`→`api-keys.json` (add a project key); `bun run dev`;
     one authenticated `curl` that returns `200`. State the **actual** default port.
3. **Keep** the existing **Authentication** and **Real-time knowledge** sections
   (accurate) — trim/re-order as needed, don't delete.
4. **Surface the port mismatch:** the code (`src/index.ts`) defaults to **3002**
   and `.env.example` sets `PORT=3002`, but `CLAUDE.md` says **3009**. Document the
   real behavior (3002); **update the stale `CLAUDE.md`/doc mention to 3002** (doc
   fix is in scope) OR, if you think 3009 was intended, do NOT change code — leave a
   clear note in this task's `## Questions` so Sober can route the intended-default
   question to Porter. Either way, flag it explicitly in Notes.

Reuse-first: link `CLAUDE.md`, `.env.example`, `bruno/` rather than restating them.

## Definition of Done

- [ ] `README.md` has zero GitLab-template content; opens with overview + doc map +
      quickstart, then the kept Auth/Real-time sections.
- [ ] The quickstart `curl` (and the stated port) **executed and returns `200`** on
      a fresh `bun run dev`; paste the (key-free) output into Notes.
- [ ] Links resolve: `docs/consumer-guide.md` (TASK-007) and `CLAUDE.md` exist and
      are linked from the doc map.
- [ ] The 3002/3009 mismatch is resolved in docs (or escalated via Questions) and
      flagged in Notes — no code default changed under this REQ.
- [ ] No secret/key value anywhere (placeholders only).
- [ ] A non-engineer can read the overview and understand what the service is.

## Implementation Notes

### Files changed (docs only — no code)
- **`README.md`** — fully rewritten. Removed **all** GitLab template boilerplate
  (Getting started with GitLab, Add your files, Integrate/Collaborate, Test and
  Deploy, the entire "Editing this README" tail). New structure, in order:
  **Overview** (2–4 sentences, non-engineer readable — one normalized API over
  OpenAI/Gemini/xAI/DeepSeek; multi-provider chat, tiers, multi-parallel, date/time,
  web search w/ sources; when to use), **Documentation map** (call → `docs/
  consumer-guide.md`; run/extend → `CLAUDE.md`; interactive → `bruno/`; glance →
  overview), **Quickstart** (`bun install` → copy `.env.example`/`api-keys.example.
  json` → `bun run dev` → one authed `curl`), then the **kept** Authentication and
  Real-time knowledge sections (verbatim). Reuse-first: links `CLAUDE.md`,
  `.env.example`, `bruno/`, the guide — doesn't restate them.
- **`CLAUDE.md`** — corrected the stale `PORT` env-row: was "(default 3009)", now
  states the code's real default **3002** and notes the local `.env`/Bruno `local`
  env use 3009 (see port flag below).

### Verification (docs only)
- **Quickstart `curl` executed** on a fresh `PORT=3002 bun run dev`:
  `curl -X POST http://localhost:3002/chat -H 'Authorization: Bearer <key>' -d
  '{"provider":"gemini","tier":"small","messages":[{"role":"user","content":"Say hi
  in 3 words"}]}'` → **`200 {"success":true,"data":{"provider":"gemini","model":
  "gemini-2.5-flash-lite","content":"Hello there, friend.","usage":{…},"latency_ms":
  1300}}`** (key-free). ✅
- **Links resolve:** `docs/consumer-guide.md`, `CLAUDE.md`, `bruno/`, `.env.example`,
  `api-keys.example.json` all exist. ✅
- **No GitLab boilerplate remains** (grep for GitLab/makeareadme/"editing this
  readme"/auto-merge → none). ✅
- No secret/key value in the README (placeholders `<project-key>` / `dvl_proj_alpha_...`
  example only).

### 🐞 Port mismatch — surfaced, doc corrected to code, intent escalated
Full picture (this is genuinely inconsistent in the repo, so I did NOT guess intent):
- **Code default = 3002** — `src/index.ts`: `Number(process.env.PORT) || 3002`.
- **`.env.example` = 3002** (a fresh clone runs on 3002).
- **local `.env` = 3009** and **`bruno/environments/local.bru` baseUrl = 3009** (the
  actual local dev setup uses 3009).
- **`CLAUDE.md` previously said "default 3009"** (the flagged stale doc).
What I did: documented the **code's real default (3002)** in README + consumer-guide,
and rewrote the CLAUDE.md `PORT` row to state 3002 while noting the 3009 local usage.
I did **not** change any code default (out of scope for a docs REQ). See Questions —
the *intended* single default (3002 vs 3009) needs the human to confirm so all
docs/env/bruno can be aligned in a follow-up.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

- **Port default — intent needed (docs done; no code change).** The repo is split:
  code + `.env.example` default to **3002**, but the local `.env` and `bruno/.../
  local.bru` use **3009**, and `CLAUDE.md` used to say 3009. I've made the docs state
  the code's actual default (3002) and noted the 3009 local usage. @Sober: please
  route to Porter → human — **which is the intended default, 3002 or 3009?** If 3009
  is intended, that's a one-line code/`.env.example` change under a *separate* REQ (I
  won't touch the default under this docs REQ); if 3002, we should align the local
  `.env`/Bruno `local` env to 3002 in a follow-up. Just need the human's pick.

## Review

**Verdict: DONE** — 2026-07-21, Sober.

Read the rewritten `README.md` and the `CLAUDE.md` port correction against the real
repo.

- **Meets SPEC-004.** Zero GitLab boilerplate remains (grep-confirmed); opens with a
  clear non-engineer **Overview**, a **Documentation map** that routes all three
  audiences (consumer→`docs/consumer-guide.md`, maintainer→`CLAUDE.md`, interactive→
  `bruno/`, glance→overview), then a **Quickstart** and the kept, accurate Auth /
  Real-time sections. Reuse-first — links rather than restating. All linked paths
  exist.
- **Verified.** The quickstart `curl` returns real `200` on `PORT=3002 bun run dev`
  (evidence pasted, key-free). No secret/key value anywhere (placeholders only).
- **Port mismatch handled correctly.** Documented the code's real default (**3002**)
  in README, and corrected the stale `CLAUDE.md` row from 3009 → 3002 while noting
  the 3009 local usage. Crucially you did **not** change the code default or guess
  intent — you escalated the *intended* default via Questions. That's exactly right
  for a docs-only REQ. I'm routing the intent question to Porter (see log); the
  **docs task itself is complete** — its DoD only required documenting reality +
  flagging, both done.

No defects. Excellent, honest doc.
