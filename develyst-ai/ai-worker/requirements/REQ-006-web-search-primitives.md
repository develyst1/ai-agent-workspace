# REQ-006: Expose web search as separate composable primitives (replace in-/chat auto-search)

- Status: DELIVERED (accepted by Porter 2026-07-21 — all AC met; SA-verified against real code + live traces; breaking change to /chat surface communicated to human)
- Priority: MEDIUM
- Requested: 2026-07-21 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

Today web search is bundled invisibly inside `/chat`: the model decides when to
search (delivered in REQ-002). The stakeholder is building products on top of this
AI Center and wants web search exposed as **separate, composable primitives** so
the downstream product — especially one orchestrating with LangChain — can drive
the flow explicitly, step by step, instead of it being hidden inside one call.

The stakeholder's illustrative flow (shape, not a mandated design):

```
product → [classify] "does this message need fresh/searched info?"  → JSON {search: yes/no (+ suggested query)}
        → if yes → [search] get web results (links/data)
        → product feeds results into [/chat] "analyze and answer the message"
```

The stakeholder explicitly chose:
- **Two separate primitives** — a "should we search?" classifier, and a "search"
  step — that the product chains itself.
- **Replace** the current auto-search inside `/chat` — searching should happen
  only through the new primitives, not silently inside `/chat`.

This stays consistent with our earlier principle: the gateway provides clean
primitives; LangChain/orchestration lives in the consuming product, not in this
gateway.

## Requirement

1. **Classifier primitive.** Given a user message, return a **structured,
   machine-parseable JSON** decision on whether the message needs fresh/searched
   information (yes/no), and — if useful — a suggested search query. Output must
   be reliable to parse by a downstream program (LangChain, etc.).
2. **Search primitive.** Given a query, return **current web results as
   structured data** (real URLs + enough content to analyze/cite). The exact
   result depth (links-only vs links+content/snippets) is delegated to the SA
   Lead to choose, weighing usefulness against the Tavily free-tier cost.
3. **Composability.** The two primitives must be independently callable and
   chainable, and their outputs must be usable as input to the existing `/chat`
   for the final analyzed answer — so a product can reproduce the flow above.
4. **Replace in-`/chat` auto-search.** Remove the automatic web-search behavior
   from `/chat` (the model-driven `web_search` tool from REQ-002). `/chat`
   returns to a plain chat call. **Current date/time injection stays** (that is
   separate and still wanted on every call).
5. **Auth.** The new endpoints require the same per-project bearer auth as
   `/chat*` (REQ-001).
6. **Docs.** README + `docs/consumer-guide.md` (delivered under REQ-004) must be
   updated to describe the new primitives and the removed in-`/chat` search.

## Acceptance Criteria

- [x] The classifier, given a fresh-info question (e.g. "AAPL price now?"), returns JSON indicating search = yes (with a query); given a general question ("explain recursion"), returns search = no. — `/search/classify` (small-tier, temp-0) verified live.
- [x] The classifier's output is valid, consistently-shaped JSON a program can parse without heuristics. — robust `parseClassifier`; fail-soft on parse-fail/model-error.
- [x] The search primitive, given a query, returns structured results with real URLs (and content per the SA's chosen depth). — `/search` (Tavily direct) returns `results` with `content`.
- [x] A caller can reproduce the full flow end to end: classify → search → `/chat` analyze → a grounded answer citing the found sources. — documented + all examples executed green.
- [x] `/chat` no longer performs automatic web search; a fresh-info question to plain `/chat` is answered without silent searching. Date/time is still injected. — TASK-010 removed the tool-loop (grep clean); `injectDateTime` untouched.
- [x] Both new endpoints enforce per-project auth; unauthenticated calls get the standard 401. — auth on `/search/*` verified.
- [x] No secret/key values are ever returned or logged. — `[search]` log without key; SA-verified.
- [x] README + consumer-guide reflect the new model (primitives documented; old in-`/chat` search removed); every documented example verified against the code. — TASK-011: docs grep clean of `web_search`/`sources`; 6 examples green.

## Constraints

- **Modifies delivered REQ-002 scope:** removes the in-`/chat` auto web search and
  its `web_search` request flag / model tool-loop. The `AIResponse.sources`
  field's role changes (it is produced by the search primitive / product flow now,
  not by `/chat` auto-search). SA decides how to retire the old behavior cleanly
  (remove vs deprecate) — surface it, don't leave two conflicting search paths.
- Web search still backed by **Tavily free tier** — no paid spend without a new
  DATA REQUEST.
- The classifier is itself an AI call; keep it cheap (small tier) — model/tier
  choice is the SA's.
- Gateway stays **LangChain-free internally**; these primitives exist to make the
  downstream product's LangChain integration easy.
- Likely **side effect (confirm):** removing the model-driven tool-loop from
  `/chat` should make the deferred deepseek DSML tool-call bug moot, since the new
  search primitive calls Tavily directly rather than via model tool-calling.

## Out of Scope

- Full agent orchestration / multi-step planning — that is the product's job
  (LangChain downstream), not this gateway.
- RAG / internal-data retrieval — still de-scoped (REQ-003).
- Building the actual LangChain integration on the product side.

## Questions

(SA Lead asks here; Porter answers as `> answer: ...`)
