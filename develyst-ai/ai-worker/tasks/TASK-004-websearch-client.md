# TASK-004: `AIResponse.sources` type + Tavily web-search client module

- Source: SPEC-002
- Status: DONE
- Depends on: none

## What to do

Add the response type extension and a self-contained web-search client. No
tool-loop wiring yet (that's TASK-005) — just the type + the search function.

1. **`src/types/index.ts`** — add and export:
   ```ts
   export interface WebSource { title?: string; url: string; }
   ```
   and add an **optional** field to `AIResponse`:
   ```ts
   sources?: WebSource[];
   ```
   (Optional → no existing caller/provider breaks.)

2. **`src/tools/webSearch.ts`** — new file. Export:
   ```ts
   export async function webSearch(
     query: string,
     timeoutMs?: number
   ): Promise<{ answer: string; sources: WebSource[] } | { error: string }>
   ```
   - Reads `TAVILY_API_KEY` from env. If missing → return `{ error: "web search
     unavailable" }` (do NOT throw). Never log or return the key value.
   - Honor `WEB_SEARCH_ENABLED` (default `true`); if `"false"` → `{ error: ... }`.
   - POST to the Tavily search endpoint with `{ query }` and the key.
     **Confirm the exact endpoint + request/response fields against Tavily's
     current docs** (do not hard-code from memory): you need a short synthesized
     answer/snippets + a list of result URLs+titles. Map results → `WebSource[]`
     (url required, title optional), and a concise `answer` string the model can
     read.
   - Use `AbortController` with `timeoutMs` (fall back to a sane default, e.g.
     10s) so a slow search can't hang a request. Any network/timeout/non-2xx →
     `{ error: "web search failed" }` (fail soft, never throw).
   - Query-only: the function takes a **search string**, never a URL/host. Do not
     add any parameter that lets the caller/model choose an arbitrary URL.

3. Add `TAVILY_API_KEY=` and `WEB_SEARCH_ENABLED=true` (and the already-specced
   `AI_DATETIME_TZ`) to **`.env.example`** with empty/placeholder values + a
   one-line comment. Do NOT put a real key anywhere.

No wiring into the chat flow in this task.

## Definition of Done

- [ ] `WebSource` + optional `AIResponse.sources` compile; `bunx tsc --noEmit`
      no new errors.
- [ ] With `TAVILY_API_KEY` set (from the human — see Questions): a scratch call
      `webSearch("current price of AAPL stock")` returns `{ answer, sources }`
      with ≥1 source URL. Paste the (trimmed) result — **redact nothing but the
      key, which must never appear**.
- [ ] With the key **unset**: returns `{ error: ... }`, does not throw, logs no key.
- [ ] `.env.example` updated; no real key committed (`git status` clean of secrets).
- [ ] The function signature exposes only `query` (+timeout) — no URL parameter.

## Implementation Notes

### Files changed
- **`src/types/index.ts`** — added `export interface WebSource { title?: string;
  url: string; }` and an **optional** `sources?: WebSource[]` on `AIResponse`.
  Optional → no existing caller/provider breaks (verified: tsc clean, existing
  `/chat` still returns the same shape).
- **`src/tools/webSearch.ts`** (new) — `webSearch(query, timeoutMs=10_000):
  Promise<{answer, sources} | {error}>`. **Query-only** signature (no URL/host
  param → not an open proxy / no SSRF). Order of guards: `WEB_SEARCH_ENABLED`
  kill-switch (default `true`) → `TAVILY_API_KEY` presence → non-empty query. Any
  miss → `{error:"web search unavailable"|"web search failed"}`, **never throws**,
  **never logs/returns the key**. On success: POST `https://api.tavily.com/search`
  with `Authorization: Bearer <key>` and body `{query, include_answer:true,
  max_results:5}`; maps `results[] → WebSource[]` (url required, title optional)
  and uses Tavily's synthesized `answer` (falls back to a list of the result
  titles+urls if `answer` is empty). `AbortController` + `timeoutMs` so a slow
  search can't hang a request; network/timeout/non-2xx/parse → `{error}` (fail
  soft). Endpoint + request/response fields **confirmed against Tavily's current
  docs** (docs.tavily.com search endpoint), not hard-coded from memory.
- **`.env.example`** — added `TAVILY_API_KEY=` (empty), `WEB_SEARCH_ENABLED=true`,
  `AI_DATETIME_TZ=Asia/Bangkok`, each with a one-line comment. No real key anywhere.

No wiring into the chat flow (that's TASK-005).

### Verification
- `bunx tsc --noEmit` → no errors in `src/**` (`WebSource` + optional `sources`
  compile; existing code unaffected).
- Fail-soft scratch (`bun`, since no test runner; removed after) — no throw on any
  path:
  - key unset → `{"error":"web search unavailable"}`
  - `WEB_SEARCH_ENABLED=false` → `{"error":"web search unavailable"}`
  - empty query → `{"error":"web search unavailable"}` (no key present, so it
    short-circuits at the key guard first — still graceful)
  - fake key + switch on (real network attempt) → `{"error":"web search failed"}`
    gracefully (no throw, no key in output/logs)
- `git status` shows only `M .env.example` among env-ish files — no secret file
  staged; `api-keys.json` still absent.
- Signature exposes only `query` (+ optional `timeoutMs`) — **no URL parameter** ✅.

### ✅ Live `{answer, sources}` trace — DONE (2026-07-21, real `TAVILY_API_KEY` in `.env`)
Ran `webSearch("current price of AAPL stock")` (scratch, `bun`, removed after). Key
never appears in the result:

```
answer (trimmed): "As of today, the current price of AAPL stock is $324.83. This
  price reflects a slight increase from recent lows and is part of a broader trend
  of market fluctuations. For the most accurate and up-to-date information, ple…"
sources count: 5
sources: [
  { "title": "Apple Inc. (AAPL) Stock Historical Prices & Data", "url": "https://finance.yahoo.com/quote/AAPL/history" },
  { "title": "Buy or Sell Apple Stock - AAPL Stock Price Quote & News", "url": "https://robinhood.com/us/en/stocks/AAPL" },
  { "title": "AAPL Stock Quote Price and Forecast", "url": "https://www.cnn.com/markets/stocks/AAPL" },
  { "title": "Apple Inc. Stock Quote (U.S.: Nasdaq) - AAPL", "url": "https://www.marketwatch.com/investing/stock/aapl" },
  { "title": "AAPL: Apple Inc - Stock Price, Quote and News", "url": "https://www.cnbc.com/quotes/AAPL" }
]
exit=0
```
`{answer, sources}` with 5 source URLs (≥1 ✅), title+url shape correct, no key in
the output. **All TASK-004 DoD items now met.** No code change — status → REVIEW.

### Notes for review
- I did **not** implement `topic:"news"`/`search_depth` knobs — kept the call
  minimal per SPEC (general web search, synthesized answer + sources). Easy to add
  if you want `search_depth:"advanced"` later.
- `answer` fallback (list of titles+urls when Tavily returns an empty `answer`)
  gives TASK-005's tool loop something usable even on thin answers; say if you'd
  rather return `{error}` in that case instead.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

- **DATA REQUEST (blocks only the live web-search test, not the build):** this
  needs a free-tier `TAVILY_API_KEY` in `.env`. I (Sober) have raised the request
  to Porter → human in SPEC-002 / REQ-002. You can build + type-check now and
  verify the "key unset → fail soft" path immediately; do the live `{answer,
  sources}` check once the key lands. If the key isn't there yet, mark this
  **BLOCKED (waiting: TAVILY_API_KEY via Sober)** for the live check only, and
  proceed with what you can.

  > Jason (2026-07-21): Code is complete and all offline/fail-soft paths verified;
  > `TAVILY_API_KEY` is still absent from `.env`, so the single live
  > `{answer,sources}` check is the only thing outstanding — status is REVIEW with
  > that one item BLOCKED on the key (kept the board Blocked row). @Sober: please
  > review the code now; I'll attach the live Tavily trace when the key lands. Also
  > two small design choices flagged in "Notes for review" (empty-`answer`
  > fallback; omitted `search_depth`/`topic`) — your call.
  > **On TASK-005:** it depends on this task + is unverifiable live without the same
  > key. Do you want me to (a) build it now against this frozen `webSearch`/`sources`
  > contract and mark its live check BLOCKED too, or (b) wait for your TASK-004
  > review and/or the key first? Holding until you say.

  > answer (Sober, 2026-07-21): (a) was the right call — building TASK-005 now against
  > the frozen contract and exercising the whole loop with a fake key was exactly the
  > diligence I'd want; nice work. Code for both TASK-004 and TASK-005 is APPROVED
  > (see each Review). Both now sit at BLOCKED for the *same* one thing — a real
  > `TAVILY_API_KEY` for the live grounded trace. Design choices both accepted
  > (empty-answer fallback: keep; `search_depth`/`topic`: omit for now; post-cap
  > drop-tools: correct). Nothing more from you until the key lands — then attach the
  > two live traces and I'll move both to DONE. I'm re-pinging Porter that the Tavily
  > key is now the sole blocker for finishing REQ-002.

## Review

**Verdict: code APPROVED — HOLD at BLOCKED for the one live check (not DONE, no
code change).** 2026-07-21, Sober.

Reviewed `src/tools/webSearch.ts` + the type additions.

- **Meets spec.** Query-only signature (no URL/host param) → not an open proxy / no
  SSRF, exactly the REQ-002 constraint. Fail-soft on every path (no key / kill-switch
  / empty query / non-2xx / network / timeout / parse) → `{error}`, never throws,
  never logs or returns the key. `AbortController`+timeout bounds a slow search.
  `WebSource` + optional `AIResponse.sources` are additive → no caller breaks (`tsc`
  clean, existing shape unchanged). `.env.example` documents the three vars, no real
  key committed.
- **Design questions — answered:**
  - *Empty-`answer` fallback (list titles+urls):* **keep it.** Giving the tool loop
    something usable on a thin answer is better than `{error}`; the URLs still become
    `sources`. Good call.
  - *Omitted `search_depth`/`topic`:* **fine as-is.** Minimal general search matches
    SPEC-002; we can add `search_depth:"advanced"` later if quality needs it. Not now.
- **Why not DONE:** the one DoD line — a real `{answer, sources}` with ≥1 URL from a
  live Tavily call — is unverified because `TAVILY_API_KEY` isn't in `.env` yet, and
  the exact vendor contract (Bearer auth + response fields) is only confirmable
  against the live endpoint. That's a genuine external blocker (human DATA REQUEST),
  not a code issue and not something you can unblock. Holding at BLOCKED; attach the
  trimmed live trace when the key lands and I'll move it straight to DONE.

---

**Verdict: DONE** — 2026-07-21, Sober (2nd pass, after the live trace).

The one held item is closed. Verified the attached live trace: `webSearch("current
price of AAPL stock")` → `{answer, sources}` with **5 real source URLs**
(finance.yahoo/robinhood/cnn/marketwatch/cnbc), correct `{title,url}` shape, and
**no Tavily key** anywhere in the output. Confirms the live vendor contract (Tavily
Bearer auth + `answer`/`results[]` fields) works as coded. With the earlier
offline/fail-soft verification, all TASK-004 DoD items are met. **DONE.**
