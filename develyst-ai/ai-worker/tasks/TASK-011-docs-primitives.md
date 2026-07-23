# TASK-011: Docs — document the search primitives, remove the in-`/chat` search

- Source: SPEC-006
- Status: DONE
- Depends on: TASK-009, TASK-010

## What to do

Update the delivered docs (REQ-004) to the new model. **Docs only**, every example
executed against the running server (evidence-before-completion). Do this after
TASK-009 + TASK-010 are merged so the docs match final code.

1. **`docs/consumer-guide.md`:**
   - **Add** a "Web search primitives" section documenting:
     - `POST /search/classify` — request `{message, provider?, model?, tier?}`,
       response `{success,data:{search,query,reason}}`; note default small tier +
       JSON-only + fail-soft default.
     - `POST /search` — request `{query}`, response
       `{success,data:{query,answer,results:[{title,url,content}]}}`.
     - The **end-to-end flow**: classify → (if search) `/search` → feed results into
       `/chat` for the grounded answer, with a runnable example of each step.
   - **Remove** the old in-`/chat` web-search content: the `web_search` request
     field, the "model decides to search" behavior, and `AIResponse.sources` (it no
     longer exists). Update §3 (`ChatRequest`) and §4 (`AIResponse`) field lists to
     match the new `src/types/index.ts` exactly. §5 becomes "date/time is injected
     on every call; web search is now via the `/search*` primitives."
   - Keep §7 limits honest: search backed by Tavily free tier; classifier is a
     cheap small-tier call; auth required on `/chat*` **and** `/search*`.
2. **`README.md`:** update the "Real-time knowledge" section — date/time still
   injected on every call; **web search is now two primitives (`/search/classify`,
   `/search`)**, no longer automatic inside `/chat`. Add them to any endpoint list /
   doc map as needed. Remove the `web_search:false` / `sources` mentions.
3. **`CLAUDE.md`** (repo): if it references the in-`/chat` web-search/tool-loop,
   update it to the primitives model (brief; reuse-first).
4. Point to the new Bruno requests (`POST Search`, `POST Search Classify`).

No secret values anywhere (placeholders only).

## Definition of Done

- [ ] consumer-guide documents `/search/classify` + `/search` + the full
      classify→search→/chat flow; **every printed example executed** against the
      running server and returns as documented (paste trimmed, key-free outputs:
      classify yes/no, a `/search` with real `results`, and a `/chat` analyze).
- [ ] All removed surfaces are gone from the docs: no `web_search` request flag, no
      `AIResponse.sources`, no "model auto-searches in `/chat`" text. Field lists
      match `src/types/index.ts` exactly.
- [ ] README "Real-time knowledge" reflects the primitives model; doc map/links
      resolve.
- [ ] `grep -rn "web_search\|sources" docs README.md` shows no stale references to
      the removed `/chat` search surface (search-primitive `results` are fine).
- [ ] No secret/key value anywhere.

## Implementation Notes

### Files changed (docs only — no code)
- **`docs/consumer-guide.md`:**
  - §1 auth → "every `/chat*` **and `/search*`**".
  - §2 endpoint table → added `POST /search/classify` and `POST /search` rows.
  - §3 `ChatRequest` → **removed `web_search`** (now matches `src/types/index.ts`).
  - §4 `AIResponse` → **removed `sources`** (matches types).
  - §5 rewritten "Real-time knowledge (date/time + web-search primitives)":
    date/time still always-on; documents `POST /search/classify`
    (`{message,provider?,model?,tier?}`→`{search,query,reason}`, small-tier,
    JSON-only, fail-soft) and `POST /search` (`{query}`→`{query,answer,
    results:[{title,url,content}]}`, Tavily, query-only, 500-on-fail) + the
    **classify→search→/chat** flow diagram.
  - §6 examples reworked: 6.1 authed `/chat`, **6.2 classify, 6.3 /search, 6.4
    grounded `/chat`** (feed results), 6.5 `/chat/multi`, 6.6 no-auth 401. Points to
    the new Bruno `POST Search` / `POST Search Classify`.
  - §7 limits → search via primitives (not in-`/chat`), Tavily free tier, cheap
    small-tier classifier, auth on `/chat*` **and** `/search*`.
- **`README.md`** — overview line "web search with cited sources" → "web-search
  primitives (classify + search)"; "Real-time knowledge" section rewritten to the
  primitives model (no `web_search:false`, no `sources`); links the guide.
- **`CLAUDE.md`** — Key files: added `routes/search.ts`, updated `webSearch.ts` +
  authMiddleware rows; "Real-time knowledge" subsection rewritten (SPEC-002+006):
  date/time in `/chat`; web search via the two primitives; states the old tool-loop
  and `AIResponse.sources`/`ChatRequest.web_search` are gone.

### Verification — every printed example executed (server on :3009, valid key)
- **6.1 authed `/chat`** → `200 {…"content":"Hello there friend"…}` ✅
- **6.2 `/search/classify`** `"What is AAPL trading at right now?"` →
  `{search:true, query:"AAPL stock price", reason:"…real-time…"}` ✅
- **6.3 `POST /search`** `"current AAPL stock price"` → `200` with `answer` +
  `results:[{title,url,content},…]` (real URLs, snippets) ✅
- **6.4 grounded `/chat`** (results pasted in) → `200 {…"content":"AAPL is trading
  at $326.40."}` — used the provided results ✅
- **6.5 `/chat/multi`** → `200 {data:[gemini,deepseek]}` ✅
- **6.6 no auth** → `401 {"success":false,"error":"unauthorized"}` ✅
- **No stale surfaces:** `grep -rniE "web_search|\.sources|model decides|auto-search"
  docs README.md CLAUDE.md` → only legitimate hits: `WEB_SEARCH_ENABLED` (real env
  var) in README, and CLAUDE.md lines that explicitly document the *removal*. No
  `ChatRequest.web_search` / `AIResponse.sources` / "model auto-searches" text
  remains. Field lists match `src/types/index.ts`. ✅
- No secret/key value anywhere (placeholders only).

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** — 2026-07-21, Sober.

- **Docs match the new code.** consumer-guide §3 (`ChatRequest`) and §4 (`AIResponse`)
  no longer list `web_search`/`sources` — matches the cleaned `src/types/index.ts`;
  the endpoint table + a new §5 document `/search/classify` and `/search` with the
  classify→search→/chat flow; §7 limits updated (search via primitives, Tavily free
  tier, cheap small-tier classifier, auth on `/chat*` **and** `/search*`). README
  "Real-time knowledge" and CLAUDE.md rewritten to the primitives model.
- **Verified:** I independently grepped `docs`/`README.md` for the removed surfaces
  (`web_search`, `AIResponse.sources`, "model decides/auto-search") → **CLEAN** (only
  the real `WEB_SEARCH_ENABLED` env var and explicit "removed" notes remain). Every
  printed example was executed green (classify yes/no, `/search` with real results,
  grounded `/chat`, multi, no-auth 401). No secrets.

Docs are accurate and honest. With TASK-009/010 also DONE, SPEC-006 is fully
delivered → REQ-006 SPEC_DONE.
