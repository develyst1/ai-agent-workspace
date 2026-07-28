# SPEC-003: AI "Approach Advisor" (via AI Center)
- Source: REQ-003
- Status: **DONE** — all SPEC-003 tasks (012–015) accepted 2026-07-28. CORE (012+014) DELIVERED by
  Porter 2026-07-28 (all 4 acceptance criteria met). **Optional note-summary tier (013+015) built at
  the stakeholder's request and accepted by Sober** → ready for Porter's supplementary acceptance.
  **DATA REQUEST + privacy ANSWERED 2026-07-28** (see
  `../../project-docs/ai-center-access.md`). Live E2E now UNBLOCKED.
  **Resolved config:** `AI_CENTER_BASE_URL=https://ai.develyst.online` (chat = `POST {base}/chat`
  → `https://ai.develyst.online/chat`; **no auth**). This **supersedes** the Bruno
  `https://r1.develyst.online/ai` — path is `/chat` off the new base, NOT `/ai/chat`. Our client
  already appends `/chat` to the base, so no code change — set the env value only.
- Baseline: `../architecture-baseline.md`. Builds on SPEC-001 (auth) + SPEC-002 (people data).

## Overview
Given a person (SPEC-002) and an optional topic/goal, the app asks the **AI Center**
(develyst-ai gateway) for advice on how to approach that person, and shows it as a
practical "approach card". Our **backend** builds the prompt from the person's stored
profile + topic and calls the gateway server-side (the FE never calls the gateway
directly — profile data + any credentials stay server-side). Ownership is enforced with
the SPEC-002 `getOwnedPerson` chokepoint on every route.

**AI Center contract (from the human-provided Bruno collection `H:\chipint\develyst-ai\bruno`
+ that repo's CLAUDE.md — reference only, not our code):**
- `POST {AI_CENTER_BASE_URL}/chat`, body `{ provider?, model?, temperature?, max_tokens?,
  messages:[{role, content}] }`. Omit `provider` → gateway fallback chain
  (deepseek→xai→gemini→openai).
- Success `200 { success:true, data:{ provider, model, content, usage, latency_ms } }`.
- Failure `{ success:false, error }` (500 if all providers fail).
- Gateway auth is `none` in Bruno (it holds provider keys itself). **Confirm via DATA REQUEST.**

## Design decisions (Sober)
- **Call server-side, provider omitted** → use the gateway's fallback chain for resilience
  (no hard dependency on one provider). Set a modest `max_tokens` + `temperature` and a timeout.
- **Card = the model's text**, not strict JSON. The prompt asks for fixed sections (tone,
  opening lines, key points, what to say, what to avoid, timing); the FE renders the returned
  `content`. Avoids brittle JSON parsing of LLM output. (MVP; can structure later.)
- **Advice is not persisted by default** (criterion 5 "viewable"); the nice-to-have "save into
  interaction history" reuses the existing SPEC-002 `POST /api/people/:id/interactions` — no new
  table, done on the FE.
- **`AI_CENTER_BASE_URL` from env** (never hardcoded/committed). Tests **mock the gateway** — they
  must NOT call the real AI Center.

## API / Interface Design
All under `/api/*` (session guard); `getOwnedPerson(userId, :id)` first → `404` if not owned.

| Method | Path | Body | Success | Errors |
|--------|------|------|---------|--------|
| POST | `/api/people/:id/advice` | `{ topic?: string }` | `200 { advice:{ content, provider, model } }` | 400 (bad topic), 404 (not owned), **502 `{error:"ai_unavailable", message}`** |
| POST | `/api/people/:id/summary` *(tier: optional — "may also")* | — | `200 { summary:{ content, provider, model } }` | 400 (no notes), 404, 502 |

- `topic` optional; if present, a string (trim; ≤ 500 chars → else 400). Absent → general
  "how should I approach this person".
- **502 `ai_unavailable`** covers: gateway non-2xx, `{success:false}`, network error, or timeout —
  the caller always gets a clean error, never a crash (REQ-003 acceptance).

## Prompt (backend builds this)
- **system**: "You are a communication coach. Using ONLY the profile provided, advise how to
  approach this specific person about the topic. Be concrete and specific to them — no generic
  filler. Output these sections: **Tone**, **Opening line(s)**, **Key points**, **What to say**,
  **What to avoid**, **Timing**." (Enforces criterion "reflects the profile, not generic".)
- **user**: a compact rendering of the person's stored fields — name, relationship, role, the
  axis fields (decision basis / directness / pace / comm content+formality), topics to raise/avoid,
  values, motivations, notes, current sentiment, and (optional) recent interaction topics + tags —
  followed by the user's `topic` (or "general approach").
- Summary endpoint: system = "Summarize these notes about a person into a concise profile summary";
  user = the person's `notes`.

## Data Model
No new tables for the core. (If a future REQ wants advice history, add an `advice` table then —
out of scope here.) Notes summarization reads `people.notes`; save-advice reuses `interactions`.

## Non-functional / privacy
- **Privacy (flag to Porter — business/consent):** generating advice sends the person's stored
  profile (sensitive personal notes) to the **external** AI Center gateway. Inherent to REQ-003,
  but the stakeholder should explicitly accept that profile data leaves our system for develyst-ai.
- Timeout on the gateway call (e.g. 20s); on timeout → 502. Never log full profile content or the
  gateway response body at info level.
- No new auth. Reuse `requireAuth` + ownership. Tests mock the gateway (no real calls, no keys).

## Tasks
- TASK-012: BE — AI Center client (`AI_CENTER_BASE_URL`, timeout, normalized error) + advice
  prompt builder + `POST /api/people/:id/advice`; gateway mocked in tests. **(CORE)** (depends: —)
- TASK-013: BE — `POST /api/people/:id/summary` (notes summarization) reusing the AI client.
  **(OPTIONAL — "may also")** (depends: TASK-012)
- TASK-014: FE — Approach Advisor panel on the profile page: topic input → advice card render +
  loading + clear error state; nice-to-have "Save to interactions" (reuses SPEC-002). **(CORE)** (depends: TASK-012)
- TASK-015: FE — Note-summary UI (button → show summary). **(OPTIONAL — "may also")** (depends: TASK-013, TASK-014)

> Sequencing: TASK-012 + TASK-014 deliver all four REQ-003 acceptance criteria. 013/015 are the
> optional "may also" tier — cut or defer them if the (undisclosed) deadline is tight.

## Questions
- **DATA REQUEST — ✅ ANSWERED (Porter, 2026-07-28, `../../project-docs/ai-center-access.md`):**
  `AI_CENTER_BASE_URL=https://ai.develyst.online`; chat = `POST {base}/chat`; **no auth / no key**.
  Supersedes the Bruno `r1.develyst.online/ai`. → Live E2E unblocked; set the env value for the check.
- **Privacy — ✅ ANSWERED (Porter, 2026-07-28):** stakeholder **accepts** sending a person's stored
  profile to the external AI Center. Approved to proceed.
