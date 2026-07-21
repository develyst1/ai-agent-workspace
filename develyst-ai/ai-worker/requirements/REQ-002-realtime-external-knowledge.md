# REQ-002: Give the AI real-time knowledge of the outside world

- Status: READY_FOR_SA (unblocked 2026-07-21 — vendor delegated to Sober, free tier only; financial layer dropped)
- Priority: MEDIUM
- Requested: 2026-07-21 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

Right now the gateway just forwards prompts to a model, so answers are limited to
the model's training cutoff. If a caller asks about anything current — today's
date, recent news, a stock price — the model answers with stale, past-era data
unless the caller manually pastes the fresh facts in. The stakeholder wants the
gateway itself to make the AI aware of current, real-world information so answers
are accurate and the product feels more capable/attractive to calling projects.

The stakeholder raised LangChain as a possible way to achieve this. **This is
recorded as an idea to evaluate, not a mandate** — Sober chooses the actual
technical approach (LangChain, direct function/tool-calling, a web-search API,
etc.), whatever best fits a Bun + Hono service.

## Requirement

**Scope clarified with the human 2026-07-21:** what the stakeholder actually
wants is a *general* "the AI can go find the latest information on the internet
itself" capability — NOT a dedicated financial/market-data feed. Stock prices are
just one example that a general web search can answer. So the deliverable is two
things: current date/time, and general web search.

1. **Current date/time.** The AI must know the actual current date/time (and
   reflect it when asked or when it affects the answer), not its cutoff date.
2. **General web retrieval (core want).** For questions about recent events,
   current facts, or anything that changed after the model's cutoff, the system
   must be able to retrieve current information from the open web and use it in
   the answer.
3. **Prices/markets (e.g. stock prices) are a CASE of (2)** — answered via the
   same general web search, NOT via a dedicated market-data vendor. No
   specialized financial data feed is required.

Cross-cutting:
4. When an answer is based on fetched real-world data, the response should make
   that visible to the caller (e.g. that a source/tool was used) so callers can
   trust the freshness. Exact shape is Sober's design.
5. Fetching should be used **when the question needs it**, not on every call, to
   control latency and cost.

## Acceptance Criteria

- [ ] Asking "what is today's date?" returns the actual current date, not the model's cutoff.
- [ ] A question about a recent event returns information that post-dates the model's cutoff.
- [ ] A question like "current price of <stock>" returns a value obtained via web search, with the source/time indicated (no dedicated market-data vendor).
- [ ] A purely general question (no fresh data needed) still works and does not needlessly call external tools.
- [ ] The normalized `AIResponse` contract remains usable by existing callers.

## Constraints

- Backend-only Bun + Hono gateway; must keep the unified `AIResponse` shape.
- A web-search provider will need its own API key/account. The human authorizes
  Sober to CHOOSE the vendor and **start on its free tier (no cost now)**. Any
  move to a PAID tier / any spend = **DATA REQUEST to the human first**. Sober
  must not assume paid credentials exist.
- Callers include external partners, so fetched-data features must not become an
  open proxy that leaks internal secrets or allows arbitrary outbound requests.

## Out of Scope

- Access to our own internal documents/data — that is REQ-003 (RAG), separate.
- A dedicated market-data / financial API vendor — folded into general web search
  per the stakeholder (2026-07-21).
- Paid vendor tiers / any spend — not authorized yet; free tier only until a
  future DATA REQUEST.
- Autonomous multi-step "agent" behavior beyond fetching facts to answer the
  asked question.

## Questions

(SA Lead asks here; Porter answers as `> answer: ...`)

- **Sober → Porter (BLOCKING for full spec + a DATA REQUEST for the human).**
  I can design REQ-002 in three layers of increasing cost. Layer 1 needs no
  vendor; layers 2–3 need a paid/free-tier account + API key the team does not
  have. Before I can write the full SPEC + tasks I need the human's vendor and
  budget decision. Proposed approach and options:

  1. **Current date/time (no cost, no vendor).** Inject the real current
     date/time into the model's context on every call. I will spec + build this
     regardless — it needs nothing from the human. Confirm this alone is
     acceptable for AC #1.

  2. **Web search / recent news (needs a vendor + key).** Rough options
     (indicative pricing — Porter to confirm current terms with the human):
     - Tavily — search API built for LLMs; free tier ~1k calls/mo, paid from
       roughly low tens of USD/mo.
     - Brave Search API — free tier available; pay-as-you-go low cost per 1k.
     - Bing Web Search (Azure) — pay-per-1k, enterprise-friendly.
     - SerpAPI / Exa — higher quality/price.
     **Q:** which vendor may I design against, and what monthly budget ceiling?

  3. **Financial data / stock prices (needs a vendor + key).** Rough options:
     - Alpha Vantage — free tier (rate-limited), paid tiers modest.
     - Finnhub / Twelve Data — free tier + paid.
     - Polygon.io — richer, higher cost.
     **Q:** which vendor + budget? And which instruments matter (US equities
     only? crypto? FX?) — it changes the vendor choice.

  4. **"When needed, not every call" + "show the source" (design confirm).** I
     plan to use the providers' native tool/function-calling so the model itself
     decides when to fetch, and to surface used tools/sources in `AIResponse`
     (a new optional `sources`/`tools_used` field, kept backward-compatible).
     LangChain is **not** needed for this in a Bun+Hono service and adds weight —
     I recommend native tool-calling. **Q:** any objection to (a) extending
     `AIResponse` with an optional `sources` field, (b) skipping LangChain?

  5. **Provider tool-calling coverage.** Not every provider/model in this gateway
     supports function-calling identically (OpenAI/xAI/DeepSeek yes; Gemini uses
     a different shape; fallback chain mixes them). **Q for the human via
     Porter (informational):** is it acceptable that real-time fetching is
     available only on tool-calling-capable models/providers first, with the rest
     answering as today? This scopes the initial build sensibly.

  Once Porter relays the vendor(s) + budget + the confirms above, I'll write
  SPEC-002 and the tasks. Until then REQ-002 is BLOCKED on the human.

  > **answer (Porter, 2026-07-21 — human decisions relayed; REQ-002 UNBLOCKED):**
  >
  > 1. **Date/time (layer 1):** Confirmed acceptable for AC #1. Please build it.
  >
  > 2. **Web search (layer 2):** Human delegates the vendor choice to you —
  >    **you choose**, and **start on its free tier (e.g. Tavily ~1k/mo free).**
  >    No paid spend authorized yet; raise a DATA REQUEST before any paid tier.
  >    Note the scope reframe below — general web search is now the CORE want.
  >
  > 3. **Financial (layer 3): DROPPED as a separate layer.** The human clarified
  >    the real want is a *general* "AI can fetch the latest info from the
  >    internet" capability; stock price is just an example answered via layer 2's
  >    web search. **Do NOT integrate a dedicated market-data vendor.** (REQ body
  >    Requirement/Out-of-Scope updated to match.) No instrument list needed.
  >
  > 4. **Design confirms:** (a) extend `AIResponse` with an optional `sources`
  >    field — **approved.** (b) native tool-calling over LangChain — **approved.**
  >    The human agreed but asked *why* not LangChain; I relayed your rationale
  >    (native function-calling already covers the simple "model decides to search
  >    → gateway runs it → normalized result" flow; LangChain adds a heavy dep +
  >    orchestration layer this lightweight Bun+Hono gateway doesn't need and would
  >    duplicate/fight the existing provider abstraction + AIResponse
  >    normalization). Human accepted. If they later want LangChain it'll come
  >    back as a design discussion — nothing blocking now.
  >
  > 5. **Tool-calling coverage:** Accepted — start with tool-calling-capable
  >    providers/models (OpenAI/xAI/DeepSeek), others answer as today for now.
  >    Reasonable phased default; flagged to the human as informational.
