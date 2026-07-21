# SPEC-002: Real-time knowledge (current date/time + general web search)

- Source: REQ-002
- Status: ACTIVE

## Overview

Give the gateway two real-time capabilities without adding a heavy framework:

1. **Current date/time** — injected into every model call as system context. Zero
   external cost, works for **all** providers (incl. Gemini + the fallback chain),
   and satisfies REQ-002 AC #1 on its own.
2. **General web search** — exposed to the model as a native **tool/function**
   (`web_search`) so the *model decides when to call it* (satisfies "fetch only
   when needed"). When called, the gateway runs a search via a free-tier vendor
   (**Tavily**), feeds the results back, and the model answers grounded in them.
   Used sources are surfaced on `AIResponse.sources`.

**Why native tool-calling, not LangChain** (already approved by the human via
Porter): the flow is simply "model decides to search → gateway runs it →
normalized result back to model". Native function-calling on the OpenAI-compatible
providers already covers this; LangChain would add a heavy dependency and an
orchestration layer that duplicates/fights the existing provider abstraction and
`AIResponse` normalization.

**Phased provider coverage** (approved): web search ships first on the
OpenAI-compatible, tool-capable providers — **OpenAI, xAI, DeepSeek**. **Gemini**
uses a different function-calling shape and keeps answering as today (it still
gets the date/time injection). A follow-up REQ/SPEC can add Gemini tool-calling.

**Financial/market-data:** explicitly NOT a separate integration — "current stock
price" is answered by the same general `web_search` (per human, 2026-07-21).

## API / Interface Design

### Request (backward compatible — existing callers unaffected)

`ChatRequest` gains one optional field:
```
web_search?: boolean   // default: true when the provider is tool-capable AND a
                       // TAVILY_API_KEY is configured; set false to force-disable
                       // (e.g. latency-sensitive callers).
```
Date/time injection has no request flag — it's always on (negligible cost). A
global env kill-switch exists (see Env) for operational control.

### Response (`AIResponse`) — additive, optional

```ts
export interface WebSource {
  title?: string;
  url: string;
}
// added to AIResponse:
sources?: WebSource[];   // present only when web_search actually ran; the URLs/
                         // titles the answer drew from. Absent on plain calls.
```
No existing field changes shape, so current callers keep working (AC #5).

### The `web_search` tool (function schema advertised to the model)

```
name: "web_search"
description: "Search the public web for current/recent information (news, prices,
  facts that may have changed after your training cutoff). Use ONLY when the
  question needs fresh information."
parameters: { query: string (required) }   // ← query ONLY. No URL parameter.
```

**Security — no open proxy (REQ-002 constraint):** the tool accepts a *search
query string only*, never a caller- or model-supplied URL/host. All outbound
traffic goes to the fixed Tavily endpoint. The model cannot use this tool to make
the gateway fetch an arbitrary internal/external URL (no SSRF, no open proxy). The
Tavily key is read from env, never placed in `AIResponse`, never logged.

## Data Model

No database. One new secret, supplied by the human like the provider keys:

| Env var | Purpose |
|---|---|
| `TAVILY_API_KEY` | Free-tier Tavily search key. If unset → web search silently disabled (date/time still works). |
| `WEB_SEARCH_ENABLED` | Optional global kill-switch, default `true`. |
| `AI_DATETIME_TZ` | Optional IANA tz for the injected local time, default `Asia/Bangkok`. UTC is always included too. |

**DATA REQUEST (raised to Porter → human):** obtaining even a *free-tier* Tavily
key requires a human signup. This blocks live verification of the web-search tasks
(not the date/time task). Vendor fallback if Tavily's free tier/ToS doesn't fit:
**Brave Search API** (also free tier) — same query-only contract, different
endpoint/parse. No paid tier without a further DATA REQUEST.

## Flow

### Date/time injection (all providers) — TASK-003

In `callModel` (providers/index.ts — the single choke point every path funnels
through), before dispatching to a provider:
1. Build a preamble like: `Current date/time: 2026-07-21T17:00:00+07:00
   (Asia/Bangkok) / 2026-07-21T10:00:00Z (UTC). Use this as "now".`
2. If a `system` message exists, **prepend** the preamble to its content; else
   insert a new `system` message at index 0. (Prepend-into-existing keeps Gemini's
   single-`systemInstruction` extraction correct — don't create a second system msg.)
3. Dispatch as today. No other change.

### Web search tool loop (OpenAI-compatible providers only) — TASK-005

When `web_search` is enabled for the call (tool-capable provider + key present +
request didn't set `web_search:false` + `WEB_SEARCH_ENABLED`):
1. Send the request to the provider with the `web_search` tool advertised
   (`tools`/`tool_choice:"auto"`), via the OpenAI-compatible body.
2. If the model returns `finish_reason:"tool_calls"`, for each `web_search` call:
   run Tavily with its `query`, append the result as a `tool` role message
   (matching `tool_call_id`), and collect the returned URLs/titles into `sources`.
3. Re-invoke the model with the appended tool results. **Bounded loop: max 3
   rounds** (guards latency/cost/infinite loops); after the cap, return the
   model's best final text.
4. Return a normal `AIResponse`, adding `sources` if any search ran.
Plain calls (no tool advertised, or model doesn't call it) behave exactly as today.

### Error/edge cases
- `TAVILY_API_KEY` missing/invalid, Tavily timeout/5xx, or `WEB_SEARCH_ENABLED=false`
  → **fail soft**: the tool returns a short "search unavailable" tool-result so the
  model can still answer from its own knowledge; the request never 500s because of
  search. `sources` omitted.
- Non-tool-capable provider (Gemini) or fallback landing on it → no tool advertised;
  answers as today (with date/time). No error.
- Tool loop hitting the round cap → return current best text, `sources` = what was
  gathered so far.
- Search must respect the call's `timeout`; a slow search must not hang the request.

## Non-functional

- **Cost/latency:** web search only when the model chooses it; hard round cap = 3;
  free tier only (no paid spend authorized — a paid tier is a future DATA REQUEST).
- **Security:** query-only tool (no open proxy/SSRF); `TAVILY_API_KEY` never
  logged/returned; existing per-project auth (SPEC-001) still gates every `/chat*`.
- **Backward compatibility:** `AIResponse.sources` and `ChatRequest.web_search`
  are optional; the success envelope is unchanged.
- **Observability:** log when a search runs and for which project
  (`[web_search] project=<p> query="<q>"`), never the Tavily key. Reuse the
  `project` already set on context by the auth middleware.

## Tasks

- TASK-003: Current date/time context injection in `callModel` (no vendor, no key).
  Depends on: —  — **startable immediately.**
- TASK-004: `AIResponse.sources`/`WebSource` type + Tavily `web_search` client
  module (query-only, fail-soft, env key). Depends on: — (needs `TAVILY_API_KEY`
  for live test — DATA REQUEST).
- TASK-005: Tool-calling loop + wiring for OpenAI-compatible providers; populate
  `sources`; Gemini/others unchanged. Depends on: TASK-004.

## Questions

(Jason asks here; Sober answers as `> answer: ...`)

- **Sober → Porter (DATA REQUEST, non-blocking for TASK-003).** Web search needs a
  **free-tier Tavily API key** (`TAVILY_API_KEY` in `.env`). Obtaining it is a
  human signup at tavily.com (free tier, **no spend**). Please ask the human to
  create a free key and add it to the repo `.env` (never share the value in the
  log/chat — same handling as the provider keys). Until it's present, TASK-004/005
  can be *built* against the documented contract but not verified live; TASK-003
  (date/time) proceeds now regardless. If the human prefers a different free
  vendor, Brave Search API is the drop-in fallback.
