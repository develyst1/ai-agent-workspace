# TASK-009: Web-search primitives — `POST /search` + `POST /search/classify`

- Source: SPEC-006
- Status: DONE
- Depends on: none

## What to do

Add two new authenticated endpoints in a new `src/routes/search.ts`, mounted at
`/search`. Reuse the existing Tavily client and `callModel`.

1. **Extend `src/tools/webSearch.ts`** — include per-result `content`:
   - Add `content?: string` to the mapped results (Tavily `results[].content` is a
     snippet). Return shape becomes
     `{ answer: string; results: { title?: string; url: string; content?: string }[] } | { error }`.
   - (Rename the returned `sources` key to `results` for the primitive, or add a
     `results` field — your call, but the `/search` endpoint must expose
     `results:[{title,url,content}]`.) Keep it query-only, fail-soft, key never
     returned/logged.
   - Add a `WebSource`/`SearchResultItem` type with optional `content` in
     `src/types/index.ts` (or local to the route) — no invented Tavily fields;
     confirm against the live response you already validated in TASK-004.

2. **`src/routes/search.ts`** (new) — `const search = new Hono<{ Variables: { project: string } }>()`:
   - **`POST /` (→ `/search`)**: body `{ query: string }`. Missing/empty `query` →
     `400 { error: "query is required" }`. Call `webSearch(query, timeout?)`. On
     `{error}` → `500 { success:false, error }`. On success →
     `200 { success:true, data: { query, answer, results } }`. Log
     `[search] project=${c.get("project")} query="${query}"` (never the key).
   - **`POST /classify`**: body `{ message: string, provider?, model?, tier? }`.
     Missing `message` → `400`. Build a `callModel` request:
     - default **tier "small"** (allow `provider`/`model`/`tier` overrides, like
       `/chat`), **temperature 0** (or lowest sane), and a **system message** that
       instructs: reply with ONLY a JSON object
       `{"search": boolean, "query": string|null, "reason": string}` — `search`=true
       when the message needs fresh/current/post-cutoff info, else false; `query`=a
       good web query when true else null.
     - **Robustly parse** the model `content`: strip ``` fences, extract the first
       `{...}`, `JSON.parse`, coerce `search` to boolean + `query` to string|null.
       On any parse failure → `200 { success:true, data:{ search:false, query:null,
       reason:"classifier_parse_failed" } }` (fail-soft) and `console.warn` it.
     - Success → `200 { success:true, data:{ search, query, reason } }`.
3. **Wire in `src/index.ts`** — `app.use("/search/*", authMiddleware)` (mirror the
   `/chat/*` line) and `app.route("/search", search)`. Confirm `/search/*` covers
   the bare `POST /search` (Hono wildcard — same as `/chat/*` covering `/chat`;
   test it).
4. **Bruno** — add `POST Search.bru` and `POST Search Classify.bru` (with
   `Authorization: Bearer {{apiKey}}`), pointing at the `local` env.

Do not modify `/chat` here (that's TASK-010). No secrets in code/logs.

## Definition of Done

- [ ] `POST /search {"query":"current AAPL stock price"}` with a valid key →
      `200` with `data.results:[{title,url,content},...]` (≥1 real URL, `content`
      present) + `data.answer`; server logs `[search] project=… query="…"` (no key).
      Paste the trimmed (key-free) output + log line.
- [ ] `POST /search/classify {"message":"What is AAPL trading at right now?"}` →
      `data.search=true` with a `query`; `{"message":"explain recursion"}` →
      `data.search=false`. Output is valid JSON parsed without heuristics. Paste both.
- [ ] Malformed classifier model output path falls back to
      `{search:false,query:null,reason:"classifier_parse_failed"}` without throwing
      (describe how you exercised it).
- [ ] Unauthenticated `POST /search` and `POST /search/classify` → `401
      {success:false,error:"unauthorized"}`.
- [ ] `bunx tsc --noEmit` clean; no Tavily key / secret in any response or log.

## Implementation Notes

### Files changed
- **`src/tools/webSearch.ts`** — success shape now `{ answer, results: WebSource[] }`
  (renamed `sources`→`results`); each result maps Tavily `results[].content`
  (snippet) into `WebSource.content`. Still query-only, fail-soft, key never
  returned/logged. Confirmed against the same live Tavily response validated in
  TASK-004.
- **`src/types/index.ts`** — `WebSource` gains optional `content?: string`
  (reused by the `/search` primitive). (The REQ-002 fields removed here are covered
  under TASK-010.)
- **`src/routes/search.ts`** (new) — `Hono<{Variables:{project:string}}>`:
  - `POST /` (→ `/search`): `{query}`; empty → `400 {error:"query is required"}`;
    logs `[search] project=${c.get("project")} query="…"` (never the key); calls
    `webSearch`; `{error}` → `500 {success:false,error}`; success →
    `200 {success:true,data:{query,answer,results}}`.
  - `POST /classify`: `{message, provider?, model?, tier?}`; empty message → `400`.
    Builds a `callModel` config (default **tier small**, **temperature 0**,
    max_tokens 200) with a JSON-only system prompt **and wraps the target message
    in a "classify this, do NOT answer it" user turn** (see robustness note).
    `parseClassifier` strips ``` fences, extracts the first `{…}`, `JSON.parse`,
    coerces `search`→boolean and `query`→string|null (nulls query when search
    false). Unparseable model output OR a model error → fail-soft
    `200 {success:true,data:{search:false,query:null,reason:"classifier_parse_failed"}}`
    + `console.warn`.
- **`src/index.ts`** — `app.use("/search/*", authMiddleware)` + `app.route("/search",
  search)`; added the two endpoints to the `GET /` info list.
- **Bruno** — added `POST Search.bru` + `POST Search Classify.bru` (with
  `Authorization: Bearer {{apiKey}}`, `local` env).
- Did **not** touch `/chat` here (TASK-010).

### Robustness note (why the message is wrapped)
First pass put the raw user message as the user turn. gemini-small sometimes
**ignored the system prompt and just answered** it (e.g. "explain recursion" → an
essay, not JSON) → parse-failed → fail-soft. Wrapping the message in an explicit
"Classify the following… Do NOT answer it. Output ONLY the JSON" user turn fixed
it: 5/5 subsequent calls returned clean JSON (0 parse failures).

### Verification (live on :3009, valid key; outputs trimmed, no key anywhere)
- **`POST /search {"query":"current AAPL stock price"}`** → `200`,
  `data.answer` present, `data.results` = **5** items each `{title, url, content}`
  (real URLs: robinhood/cnn/marketwatch/cnbc/tradingview, `content` snippets
  populated). Server logged `[search] project=project-alpha query="current AAPL
  stock price"` (no key). ✅
- **`POST /search/classify {"message":"What is AAPL trading at right now?"}`** →
  `{search:true, query:"AAPL stock price", reason:"…real-time…"}` (2/2 runs). ✅
- **`{"message":"explain recursion"}`** → `{search:false, query:null, reason:"…static
  concept…"}` (3/3 runs, clean parse). ✅
- **Fail-soft parse (DoD #3):** unit-tested the real `parseClassifier` (temporarily
  exported, scratch run, export removed) with garbage inputs — essay / empty /
  prose-no-json / broken-json all → `null` (route then returns
  `classifier_parse_failed` without throwing); fenced JSON is stripped+parsed;
  `search:false` nulls a stray `query`. Also, before the wrap fix I observed the
  live essay→fail-soft path end-to-end. ✅
- **Unauth `POST /search` and `POST /search/classify`** → `401
  {success:false,error:"unauthorized"}` (auth middleware covers bare `/search`,
  same wildcard behavior as `/chat`). ✅
- `bunx tsc --noEmit` clean; no Tavily key in any response/log.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** — 2026-07-21, Sober.

Read the real code (`routes/search.ts`, `tools/webSearch.ts`, `types`, `index.ts`).

- **Both primitives meet SPEC-006.** `POST /search` — query-required (400 else),
  `[search]` attribution log (project, never the key), reuses `webSearch()`, 500 on
  `{error}`, `200 {query,answer,results:[{title,url,content}]}` on success.
  `POST /search/classify` — small-tier + temp 0 default (provider/model/tier
  overridable), strict JSON-only system prompt, and the **wrapped "classify, do NOT
  answer" user turn** — a genuinely good robustness fix for the small model
  answering instead of classifying. `parseClassifier` strips fences, extracts the
  outer `{...}`, coerces `search`→bool and nulls `query` when false; unparseable
  output **and** model errors both fail-soft to `classifier_parse_failed` (200) so
  the product flow never breaks.
- **`webSearch()` extension is clean** — `content` surfaced per result, still
  query-only (no SSRF/open proxy), fail-soft, key never returned/logged.
- **Wiring correct** — `app.use("/search/*", authMiddleware)` + `app.route`; bare
  `POST /search` is covered by the wildcard (Jason verified 401), endpoints added to
  `GET /` info.
- **Verified:** live `/search` → 5 real results with `content`; classify yes/no both
  clean JSON; fail-soft path exercised; unauth → 401; tsc clean; no key leak.

No defects. Composable, cheap, fail-soft as designed.
