# TASK-005: Web-search tool-calling loop for OpenAI-compatible providers

- Source: SPEC-002
- Status: BLOCKED (code APPROVED by Sober; only the real-`sources` live check waits on TAVILY_API_KEY)
- Depends on: TASK-004

## What to do

Wire the `web_search` tool (TASK-004) into the chat flow so the **model decides**
when to search, for the OpenAI-compatible providers only (**openai, xai,
deepseek**). Gemini and any non-capable path stay exactly as today.

1. **Enable predicate.** Web search is active for a call when ALL hold: provider is
   openai/xai/deepseek; `TAVILY_API_KEY` present; `WEB_SEARCH_ENABLED !== "false"`;
   and the request did not set `web_search: false`. Add optional `web_search?: boolean`
   to `ChatRequest` (types) and thread it through `buildConfig` and the fallback/multi
   config builders (mirror how `tier` is threaded). Default = enabled when capable.

2. **Advertise the tool.** When enabled, include in the OpenAI-compatible request
   body (via the existing `extra` param of `fetchOpenAICompat`, or a dedicated
   tool-aware code path — your call, keep it surgical):
   - `tools: [{ type:"function", function:{ name:"web_search", description:..., parameters:{ type:"object", properties:{ query:{type:"string"} }, required:["query"] } }}]`
   - `tool_choice: "auto"`
   Use the exact tool description from SPEC-002.

3. **Handle the tool loop.** `fetchOpenAICompat` today only reads
   `choices[0].message.content` and ignores `tool_calls` — extend the capable path
   to:
   - Detect `finish_reason === "tool_calls"` (and/or a non-empty
     `message.tool_calls`).
   - For each `web_search` tool call: parse its JSON `arguments.query`, run
     `webSearch(query, timeout)` (TASK-004), and append a message
     `{ role:"tool", tool_call_id:<id>, content:<answer-or-error-string> }`.
     Also append the assistant message that carried the tool_calls, per the
     OpenAI-compatible protocol (assistant-with-tool_calls, then the tool
     results), so the follow-up request is well-formed.
   - Collect each search's `sources` (dedupe by URL) for the final `AIResponse`.
   - Re-call the model with the extended message list. **Bounded loop: max 3
     rounds.** After the cap, return the latest assistant text.
   - Keep the same `timeout`/`AbortController` discipline already in `_fetch.ts`.

4. **Populate response.** Return the normal `AIResponse` and set `sources` when any
   search ran (omit otherwise). Do not change the success envelope.

5. **Attribution log.** When a search runs, log
   `[web_search] project=<project> query="<query>"` — get `<project>` from where
   the auth middleware set it (thread it down, or log at the route layer). **Never
   log the Tavily key.**

6. **Do NOT touch** the Gemini path or add tool support there (out of scope, phased).
   Plain (non-search) calls and `/chat/multi` items that don't trigger a tool call
   must behave byte-for-byte as today.

7. Update repo `README.md` + `CLAUDE.md`: short "Real-time knowledge" note
   (date/time always injected; `web_search` tool auto-used by capable providers;
   `web_search:false` to disable; `sources` field; env vars). Add/update a Bruno
   request demonstrating a web-search question.

## Definition of Done

- [ ] With `TAVILY_API_KEY` set, a `/chat` call (valid project key) to an
      OpenAI-compatible provider asking a **fresh-info** question (e.g. "what
      happened in <recent event>?" or "current price of <stock>?") returns an
      answer that used search, with `sources: [...]` populated and the server
      logging `[web_search] project=... query="..."`. Paste response + log line.
- [ ] A **purely general** question ("explain recursion") on the same provider
      returns a normal answer, **no tool call**, `sources` absent (proves
      "only when needed", AC #4).
- [ ] `web_search: false` in the request → no tool advertised, answers as today.
- [ ] `TAVILY_API_KEY` unset / `WEB_SEARCH_ENABLED=false` → requests still succeed
      (model answers without search), no 500, `sources` absent.
- [ ] Gemini call still works and is unchanged (no tools sent).
- [ ] `/chat/multi` still works; the success envelope is unchanged for all.
- [ ] Bounded loop verified (never more than 3 model rounds on a search).
- [ ] `bunx tsc --noEmit` no new errors; no Tavily key in any log/response.

## Implementation Notes

### Design note
Every call that reaches `fetchOpenAICompat` is already an OpenAI-compatible,
tool-capable provider (openai/xai/deepseek) — Gemini has its own `gemini.ts` path.
So the tool loop lives entirely in `_fetch.ts`; the "provider-capable" half of the
enable predicate is satisfied structurally, no provider check needed there.

### Files changed
- **`src/types/index.ts`** — `ChatRequest.web_search?: boolean`;
  `ModelConfig.web_search?: boolean` + `ModelConfig.project?: string` (project
  threaded down only for the attribution log).
- **`src/providers/_fetch.ts`** — added the `web_search` tool schema (exact
  description from SPEC-002), `webSearchEnabled(config)` predicate
  (`web_search!==false` && `WEB_SEARCH_ENABLED!=="false"` && `TAVILY_API_KEY`
  present), and a **bounded tool loop**:
  - advertises `tools:[web_search]` + `tool_choice:"auto"` only while
    `rounds < 3`; the round *after* the cap sends no tools → model must return text
    (guaranteed termination).
  - on `finish_reason:"tool_calls"`/non-empty `tool_calls`: appends the assistant
    message carrying `tool_calls`, then one `{role:"tool",tool_call_id,content}`
    per call (protocol-correct), parses `arguments.query`, runs
    `webSearch(query, timeout)`, logs `[web_search] project=<p> query="<q>"`,
    collects `sources` **deduped by URL**, re-calls the model.
  - fail-soft: `webSearch` error → tool content is the short error string so the
    model still answers; request never 500s because of search.
  - final `AIResponse` sets `sources` only when a search actually contributed;
    otherwise identical to today's shape.
  - reuses the existing single `AbortController`/`timeout`; Tavily key never logged.
- **`src/providers/index.ts`** — `callWithFallback` threads `web_search` + `project`
  into each provider config (mirrors `tier`).
- **`src/routes/chat.ts`** — typed the chat `Hono<{Variables:{project:string}}>`;
  `buildConfig` carries `web_search`; both `/chat` and `/chat/multi` set
  `project = c.get("project")` on the config(s) (multi attributes the whole batch to
  the one calling project).
- **Docs/Bruno** — README "Real-time knowledge" section; repo `CLAUDE.md` subsection
  + `webSearch.ts` in Key files; new `bruno/POST Chat - Web Search.bru` (with the
  `Authorization: Bearer {{apiKey}}` header).
- **Gemini path untouched**; plain calls unchanged.

### Verification (live on :3009, valid project key; fake `TAVILY_API_KEY=tvly-fake-test`
injected via shell env so the whole loop runs without a real key)
- **"Only when needed" (AC #4):** general question "Explain recursion in one
  sentence" (xai) → normal answer, **no `[web_search]` log line, no `sources`.** ✅
- **Tool loop + fail-soft + attribution:** "What is the very latest news headline
  today? Search the web." (xai) → model **called** `web_search`; server logged
  `[web_search] project=project-alpha query="latest news headlines today July 21 2026"`
  (project from auth, **no Tavily key**); fake-key search failed soft → model still
  answered gracefully ("…due to a search tool failure…"), **HTTP 200, no 500,
  `sources` absent** (search failed). Loop terminated (no infinite calls). ✅
  (Bonus: the query text proves TASK-003's date injection reached the model.)
- **`web_search:false`:** same fresh-info question with `"web_search":false` (xai)
  → **no tool advertised, no `[web_search]` line**, HTTP 200 (answers as today;
  content empty here is a grok reasoning-token artifact at max_tokens:60, identical
  to pre-change behavior — the verification point is "no tool advertised"). ✅
- **Gemini unchanged:** gemini call → 200, no tools sent, normal answer. ✅
- **`/chat/multi`:** gemini + deepseek batch → 200, both normalized, envelope
  unchanged. ✅
- **Bounded loop:** cap = `MAX_TOOL_ROUNDS = 3`; the post-cap round drops `tools` so
  the model is forced to a text answer — never more than 3 search rounds by
  construction (fail-soft path also exercised the loop mechanics). ✅
- Total `[web_search]` log lines across the run = **1** (only the one fresh-info
  call triggered a search; general/`web_search:false`/gemini/multi triggered none). ✅
- `bunx tsc --noEmit` → no errors in `src/**`. `git status` → no `.env`/`api-keys.json`
  staged; `api-keys.json` still gitignored. No Tavily key in any log/response.

### ⚠️ DoD items still pending — real `sources` (BLOCKED on TAVILY_API_KEY)
Two DoD lines need a **real** free-tier Tavily key (still absent from `.env`):
(1) a fresh-info answer that is actually **grounded in search with `sources:[...]`
populated by real URLs**; the multi-round grounding path. Everything around them —
tool advertised, model decides, loop executes, dedupe, bounded, attribution log,
fail-soft, no-crash, envelope-unchanged — is verified via the fake-key run above.
I'll attach a real grounded trace (key redacted; it never appears) the moment
`TAVILY_API_KEY` lands. Tracked by the existing DATA REQUEST (board Blocked row).

## Questions

(Jason asks; Sober answers as `> answer: ...`)

- Live end-to-end here needs both `TAVILY_API_KEY` (TASK-004 DATA REQUEST) and a
  working provider key (already in `.env`). If Tavily key isn't present yet, build
  + verify the no-key/`web_search:false` fail-soft paths and the "no needless tool
  call" path, and mark the two search-dependent DoD items BLOCKED (waiting:
  TAVILY_API_KEY via Sober) until the key lands.

  > Jason (2026-07-21): Built per your [19:20] go-ahead to implement
  > TASK-004/005 against the contract now. Went one better than "no-key only":
  > injected a **fake** `TAVILY_API_KEY` via shell env so the *entire* loop runs
  > (tool advertised → model decides → search attempted → fail-soft → attribution
  > log → bounded → graceful answer), all verified live — see Notes. The only
  > thing a real key adds is **real `sources` URLs**; those two DoD lines are the
  > sole BLOCKED items. Status REVIEW; I'll attach the grounded trace when the key
  > lands. One design choice to confirm: on the round *after* the 3-round cap I drop
  > `tools` to force a text answer — flag if you'd rather cap differently.

## Review

**Verdict: code APPROVED — HOLD at BLOCKED for the real-`sources` check (not DONE,
no code change).** 2026-07-21, Sober.

Reviewed the real code (`_fetch.ts` tool loop, `index.ts` fallback threading,
`routes/chat.ts`, types).

- **Loop is correct and provably terminating.** `advertise = doSearch && rounds <
  MAX_TOOL_ROUNDS`; after the cap the request drops `tools`, so the model is forced
  to a text answer and `wantsTool` is false → guaranteed return. Protocol-correct:
  it appends the assistant message carrying `tool_calls`, then one
  `{role:"tool",tool_call_id,content}` per call, before re-calling. Sources deduped
  by URL; attribution logs `project` not the key; fail-soft feeds the error string
  back so the request never 500s on search.
- **Safe rollout — the key insight.** When `TAVILY_API_KEY` is absent,
  `webSearchEnabled` is false → `tools` are never advertised → the OpenAI-compatible
  path behaves byte-for-byte as before. So this can ship ahead of the key with zero
  risk to existing callers. Gemini path untouched; `/chat/multi` + fallback thread
  `web_search`/`project` correctly; `web_search:false` disables per request.
- **Design question — answered:** dropping `tools` on the post-cap round to force a
  text answer is the **correct** way to bound it — accept as-is.
- **Non-blocking nits (do NOT fix now, note for later):** (1) `webSearch` is called
  with `config.timeout` (~30s) as its per-search timeout, and its `AbortController`
  is separate from the outer one, so a pathological multi-round call could exceed
  the nominal request timeout; fine for free-tier reality, revisit only if latency
  bites. (2) Consider a shorter dedicated search timeout later. Neither changes the
  verdict.
- **Why not DONE:** two DoD lines need a **real** Tavily key — a fresh-info answer
  actually grounded in search with real `sources:[...]`, and the real multi-round
  grounding. Everything else (tool advertised, model-decides, loop, dedupe, bounded,
  attribution, fail-soft, no-crash, envelope-unchanged, Gemini/multi/`web_search:false`)
  is verified via your fake-key run. Same external blocker as TASK-004.

Holding at BLOCKED; attach the grounded trace when `TAVILY_API_KEY` lands and I'll
move it to DONE alongside TASK-004.
