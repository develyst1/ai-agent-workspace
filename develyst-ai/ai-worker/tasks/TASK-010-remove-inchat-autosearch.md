# TASK-010: Remove the in-`/chat` auto web-search (revert `/chat` to plain)

- Source: SPEC-006
- Status: DONE
- Depends on: none

## What to do

Delete the model-driven web-search that REQ-002 embedded in `/chat`. Searching now
happens only via the `/search*` primitives (TASK-009). **Keep the date/time
injection** — it is separate and still wanted on every call.

1. **`src/providers/_fetch.ts`** — remove `WEB_SEARCH_TOOL`, `MAX_TOOL_ROUNDS`,
   `webSearchEnabled`, the `webSearch` import, and the entire tool loop. Restore
   `fetchOpenAICompat` to a single plain request/response (keep the existing
   `timeout`/`AbortController` and the `extra` param used by deepseek/xai
   `{stream:false}`). No `tools`/`tool_choice` ever sent; no `sources` collection.
2. **`src/types/index.ts`** — remove `ChatRequest.web_search`, `ModelConfig.web_search`,
   `ModelConfig.project`, and `AIResponse.sources` (and the now-unused `WebSource`
   if nothing else references it — note: TASK-009 may keep a result type in
   `webSearch.ts`/route; only remove what is truly orphaned).
3. **`src/providers/index.ts`** — drop `web_search`/`project` from `callWithFallback`'s
   `base` pick and from the config it builds. **Do not touch** `injectDateTime` /
   `callModel`'s date/time logic.
4. **`src/routes/chat.ts`** — remove `web_search` from `buildConfig` and the
   `project = c.get("project")` threading into configs (the `[web_search]` log is
   gone). `/chat` + `/chat/multi` become plain again; success envelope unchanged.
   (Auth middleware on `/chat/*` stays — auth is unchanged.)
5. **Bruno** — remove/replace `POST Chat - Web Search.bru`; ensure no `/chat`
   request still sends a `web_search` field.
6. Leave `src/tools/webSearch.ts` in place (now used by the `/search` primitive).

This should make the deferred **deepseek DSML tool-call bug moot** (no model
tool-calling on any `/chat` path anymore) — note that in your verification.

## Definition of Done

- [ ] A fresh-info question to plain `POST /chat` (valid key, e.g. provider `xai`
      or `deepseek`, "What is AAPL trading at right now?") returns `200` and is
      answered **without** any search — **no `[web_search]`/`[search]` log line, no
      `sources` in the response**. Paste the response + confirm no search log.
- [ ] **Date/time still injected:** "What is today's date?" via `/chat` returns the
      real current date (2026-07-21+). Paste it.
- [ ] `/chat/multi` still works; success envelope `{success:true,data:AIResponse(/[])}`
      unchanged (no `sources` field anywhere).
- [ ] `grep -rn "web_search\|WEB_SEARCH_TOOL\|tool_choice\|AIResponse.*sources" src`
      shows the tool-loop/flag fully removed (only the `/search*` primitive +
      `webSearch.ts` remain as the search path).
- [ ] Deepseek DSML repro from the known-issue **no longer reproduces** via `/chat`
      (there is no tool-call path). Note your check.
- [ ] `bunx tsc --noEmit` clean; no dead imports; no secrets.

## Implementation Notes

### Files changed
- **`src/providers/_fetch.ts`** — removed `WEB_SEARCH_TOOL`, `MAX_TOOL_ROUNDS`,
  `webSearchEnabled`, the `webSearch` import, and the whole tool loop. Back to a
  single plain request/response (kept `timeout`/`AbortController` and the `extra`
  param for deepseek/xai `{stream:false}`). No `tools`/`tool_choice` ever sent; no
  `sources` collection.
- **`src/types/index.ts`** — removed `ChatRequest.web_search`,
  `ModelConfig.web_search`, `ModelConfig.project`, and `AIResponse.sources`.
  `WebSource` kept (now `{title?,url,content?}`) because the `/search` primitive
  (TASK-009) uses it — not orphaned.
- **`src/providers/index.ts`** — dropped `web_search`/`project` from
  `callWithFallback`'s `base` Pick and the config it builds. `injectDateTime` /
  `callModel` date/time logic **untouched**.
- **`src/routes/chat.ts`** — removed `web_search` from `buildConfig` and all
  `project = c.get("project")` threading; reverted the chat `Hono` to untyped.
  `/chat` + `/chat/multi` are plain again; success envelope unchanged. Auth
  middleware on `/chat/*` unchanged.
- **Bruno** — deleted `POST Chat - Web Search.bru`; no `/chat` request sends
  `web_search`.
- Left `src/tools/webSearch.ts` in place (now the `/search` primitive's client).

### Verification (live on :3009, valid key)
- **DoD #1 — plain `/chat`, no search:** fresh-info "What is AAPL trading at right
  now?" (xai) → `200`, content *"I don't have access to real-time stock market
  data…"* — answered **without** search, **no `sources` field**, and **0
  `[web_search]`/`[search]` log lines** across the run. ✅
- **DoD #5 — deepseek DSML bug moot:** the old repro
  (`deepseek`,"…Search the web and cite sources.") → `200` with **clean content**
  (no `<｜｜DSML｜｜…>` markup), no `sources`. The tool-call path that leaked DSML no
  longer exists, so it **cannot** reproduce via `/chat`. ✅ (Known-issue can close.)
- **DoD #2 — date/time still injected:** "What is today's date?" (gemini) →
  **"July 23, 2026"** (real current date). ✅
- **DoD #3 — `/chat/multi`:** gemini batch → `200`, `data:[AIResponse]`, envelope
  unchanged, no `sources`. ✅
- **DoD #4 — removal grep:** `grep -rnE "web_search|WEB_SEARCH_TOOL|tool_choice|
  MAX_TOOL_ROUNDS|\.sources" src` → no functional hits (only `webSearch.ts`, the
  `/search` client, remains as the search path). ✅
- `bunx tsc --noEmit` clean; no dead imports; no secrets.

### Note
Docs still describe the old in-`/chat` web search + `sources`/`web_search` — that's
expected; **TASK-011** rewrites README + consumer-guide to match this new reality
(primitives + plain `/chat`). Until TASK-011 lands the docs are transiently stale by
design (the SPEC-006 task ordering).

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** — 2026-07-21, Sober.

Verified the removal against the real code, independently.

- **`_fetch.ts`** reverted to a single plain request/response — no tool loop, no
  `tools`/`tool_choice`, keeps `timeout`/`AbortController` + the `extra` param. Clean.
- **Types clean:** `AIResponse.sources`, `ChatRequest.web_search`,
  `ModelConfig.web_search`/`.project` all gone (`WebSource` kept — used by `/search`).
- **`providers/index.ts`:** `callWithFallback` base Pick no longer carries
  `web_search`/`project`, and **`injectDateTime` in `callModel` is untouched** — date/
  time still injected on every call. `routes/chat.ts` reverted to plain (no threading).
- **Independent greps confirm:** `grep -rE "web_search|tool_choice|MAX_TOOL_ROUNDS|
  \.sources|ModelConfig.*project" src` (excl. `WEB_SEARCH_ENABLED`) → **CLEAN**; the
  only remaining search path is `webSearch.ts` (the `/search` primitive's client).
- **Verified behavior:** fresh-info `/chat` answered **without** search (no
  `[web_search]`/`[search]` line, no `sources`); date/time still real (`2026-07-2x`);
  `/chat/multi` envelope unchanged; tsc clean.
- **deepseek DSML bug now MOOT:** the model tool-call path that leaked DSML no longer
  exists; Jason's old repro produced clean `/chat` content. Closing the known-issue
  row on the board.

No defects. Exactly the clean "remove, not deprecate" retirement SPEC-006 specified.
