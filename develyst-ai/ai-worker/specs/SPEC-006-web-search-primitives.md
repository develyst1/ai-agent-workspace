# SPEC-006: Web-search primitives (classify + search), replacing in-/chat auto-search

- Source: REQ-006
- Status: ACTIVE

## Overview

Replace the model-driven web-search hidden inside `/chat` (REQ-002) with **two
explicit, composable HTTP primitives** the downstream product chains itself:

```
product → POST /search/classify {message}  → {search, query}     (cheap AI, JSON)
        → if search → POST /search {query}  → {answer, results[]} (Tavily direct)
        → product feeds results into POST /chat → grounded answer (plain chat)
```

The gateway stays LangChain-free internally; these primitives exist so the
product's LangChain layer can orchestrate explicitly. `/chat` returns to a **plain
chat call** (date/time injection stays). Both new endpoints reuse the existing
per-project bearer auth (REQ-001).

**SA decisions this spec makes (delegated by REQ-006):**
- **Retire old behavior = REMOVE, not deprecate.** REQ-002's in-`/chat` auto-search
  (`web_search` request flag, the `_fetch.ts` tool-loop + `web_search` tool, and the
  `AIResponse.sources` field) is deleted outright — no two search paths. This is an
  intentional breaking change to the just-delivered REQ-002 surface, authorized by
  REQ-006. Docs updated to match.
- **Search result depth = links + snippet content + synthesized answer.** One Tavily
  call already returns all of this (`include_answer` + `results[].content`); surfacing
  the snippet content costs nothing extra on the free tier and makes results directly
  usable for analysis/citation. So the search primitive returns per-result
  `{title, url, content}` plus a top-level `answer`.
- **Classifier = cheap small-tier chat call, JSON-only, robust parse.**

**Confirms the REQ-006 side-benefit:** removing the model tool-loop makes the
deferred **deepseek DSML bug moot** — the search primitive calls Tavily *directly*
(never via model tool-calling) and the classifier advertises no tools, so the code
path that leaked DSML markup no longer exists. The known-issue can be closed when
TASK-010 lands.

## API / Interface Design

All under existing bearer auth. Auth middleware extended to `/search/*`.

### 1) `POST /search/classify` — "should we search?"

Request:
```jsonc
{ "message": "What is AAPL trading at right now?",
  "provider": "...", "model": "...", "tier": "small" }   // provider/model/tier optional; default small tier
```
Response:
```jsonc
{ "success": true, "data": { "search": true, "query": "current AAPL stock price", "reason": "asks for a live price" } }
```
- Cheap AI call (default **small** tier, low temperature) with a strict JSON-only
  system prompt. Output is normalized to `{ search: boolean, query: string|null,
  reason?: string }`.
- **Robust parse:** strip markdown fences, extract the first `{...}` object, coerce
  types. On unparseable model output → fail-soft `{ search: false, query: null,
  reason: "classifier_parse_failed" }` (keeps the product flow alive) and log it.

### 2) `POST /search` — run a web search

Request: `{ "query": "current AAPL stock price" }`
Response:
```jsonc
{ "success": true, "data": {
    "query": "current AAPL stock price",
    "answer": "…Tavily synthesized answer…",
    "results": [ { "title": "…", "url": "https://…", "content": "…snippet…" } ]
} }
```
- Reuses `src/tools/webSearch.ts` (Tavily, query-only, fail-soft, key never
  returned/logged), **extended** to also surface `content` per result.
- On search unavailable/failed (no key, kill-switch, network) →
  `500 { success: false, error: "web search unavailable|failed" }` (explicit
  primitive → an error status is honest; the product decides what to do).
- Log one attribution line `[search] project=<project> query="<query>"` (project
  from auth; never the Tavily key).

### 3) `POST /chat` — now plain

- Remove `web_search` handling and the tool-loop entirely. `/chat` and
  `/chat/multi` are plain provider calls again. **Date/time injection stays**
  (unchanged, in `callModel`). Same success envelope `{ success, data: AIResponse }`.

### Errors / auth (both new endpoints)
- Missing `message`/`query` → `400 { error: "<field> is required" }`.
- Unauthenticated → the standard `401 { success:false, error:"unauthorized" }`.

## Data Model / Types

- **Remove:** `ChatRequest.web_search`, `ModelConfig.web_search`,
  `ModelConfig.project` (only used by the removed search log), and
  `AIResponse.sources` (no `/chat` path produces it now).
- **Add:** `WebSource` gains optional `content?: string`; a `SearchResult`/
  `ClassifyResult` shape for the new endpoints (local to the search route/types).
- `webSearch()` return type extends to include `content` per result.

## Flow / retirement

1. `_fetch.ts` → delete `WEB_SEARCH_TOOL`, `webSearchEnabled`, the tool loop; revert
   to the plain single fetch (keep timeout/AbortController). No `tools` ever sent.
2. `providers/index.ts` / `routes/chat.ts` → drop `web_search`/`project` threading.
   Keep date/time injection in `callModel`.
3. New `src/routes/search.ts` mounts `/search` (search) + `/search/classify`
   (classify); `index.ts` mounts it and adds `app.use("/search/*", authMiddleware)`.
4. Bruno: remove/replace the "POST Chat - Web Search" request with "POST Search" +
   "POST Search Classify"; existing `/chat` requests drop any `web_search` field.

## Non-functional

- **Auth** on both new endpoints (REQ-001). **No secrets** returned/logged.
- **Cost/latency:** classifier = one small-tier call; search = one Tavily call
  (free tier). No paid spend (a paid tier stays a future DATA REQUEST).
- **Backward-compat:** intentional breaking change to REQ-002's `/chat` search
  surface (removed) — documented; no other `/chat` behavior changes.

## Tasks

- TASK-009: Search primitives — `POST /search` + `POST /search/classify` in new
  `routes/search.ts`; extend `webSearch()` with `content`; mount + auth `/search/*`.
  Depends on: —
- TASK-010: Remove in-`/chat` auto-search — strip `_fetch.ts` tool-loop + `web_search`
  flag + `sources` field + `project` threading; keep date/time; clean Bruno `/chat`.
  Depends on: — (closes the deepseek DSML known-issue)
- TASK-011: Docs — README + `docs/consumer-guide.md`: document the primitives + the
  classify→search→/chat flow; remove in-`/chat` search + `web_search` + `sources`;
  every example verified. Depends on: TASK-009, TASK-010.

## Questions

(Jason asks here; Sober answers as `> answer: ...`)

- (Sober → Porter, informational) SPEC-006 confirms your side-benefit: the deferred
  **deepseek DSML bug becomes moot** once TASK-010 removes the model tool-loop. I'll
  close that known-issue row when TASK-010 is DONE. No separate fix needed.
