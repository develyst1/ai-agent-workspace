# TASK-007: Write `docs/consumer-guide.md` (verified integration guide)

- Source: SPEC-004
- Status: DONE
- Depends on: none

## What to do

Create `docs/consumer-guide.md` — the guide an engineer on *another* project uses
to call this gateway successfully, using only the doc. **Docs only, no code
changes.** Read the real code for shapes (`src/types/index.ts`,
`src/routes/chat.ts`, `src/config/models.ts`, `src/providers/index.ts`) and the
`bruno/` collection; do not invent fields.

Content (concise, example-led):
1. **Auth:** every `/chat*` call needs `Authorization: Bearer <project-key>`; where
   keys come from (issued by a maintainer via `api-keys.json`); the identical `401
   {success:false,error:"unauthorized"}` on missing/bad/disabled.
2. **Endpoint reference:** `POST /chat`, `POST /chat/multi`, `GET /`, `GET /models`,
   `GET /tiers` — one line of purpose + request + response each.
3. **Request shape** (`ChatRequest`): `provider?`, `model?`, `tier?`
   (small|medium|flagship), `temperature?`, `max_tokens?`, `timeout?`, `messages[]`,
   `web_search?`. Explain resolution order (explicit `model` > `tier` > provider
   default) and that omitting `provider` uses the fallback chain
   (deepseek→xai→gemini→openai).
4. **Response shape** (`AIResponse`): `provider, model, content, usage?,
   latency_ms, sources?` — document the optional **`sources: {title?,url}[]`** and
   the success envelope `{success:true,data:AIResponse}` (and multi returning
   `data: AIResponse[]`).
5. **Web search:** model-decided; when `sources` appears; disable per-call with
   `"web_search": false`.
6. **Working examples (must run):** authed `/chat` (single provider), a web-search
   `/chat` (fresh-info question → shows `sources`), and `/chat/multi`. Provide
   `curl` and point to the matching Bruno requests (`bruno/`, `local` env, set
   `apiKey`). Use a placeholder key in text.
7. **Limits (honest):** web search on **openai/xai/deepseek only (not Gemini yet)**;
   Tavily **free tier**; auth required on all `/chat*`; date/time works on all
   providers.

Use the **actual** default port the code uses (see notes). No secret values anywhere.

## Definition of Done

- [ ] `docs/consumer-guide.md` exists and covers items 1–7.
- [ ] **Every example executed against the running server** (`bun run dev`, valid
      key in local `api-keys.json`) and confirmed: authed `/chat` → `200 {success:
      true,data}`; a fresh-info web-search `/chat` → answer with `sources:[...]`;
      `/chat/multi` → array. Paste the (trimmed, key-free) outputs into Notes as
      evidence.
- [ ] A `/chat` example **without** the auth header shown returning the real `401`
      body (so consumers see the failure mode) — verified.
- [ ] Field lists match `src/types/index.ts` exactly (no invented fields).
- [ ] No secret/key value appears anywhere (placeholders only).
- [ ] Port and env-var references match the real code/`.env.example` (flag any
      mismatch in Notes; see TASK-006 for the 3002/3009 item).

## Implementation Notes

### Files changed
- **`docs/consumer-guide.md`** (new, docs only — no code touched). Covers items 1–7:
  auth (Bearer + identical 401); endpoint table (`/chat`, `/chat/multi`, `GET /`,
  `/models`, `/tiers`); `ChatRequest` shape with resolution order (explicit model >
  tier > provider default) + fallback chain (deepseek→xai→gemini→openai, default
  provider gemini); `AIResponse` incl. optional `sources:{title?,url}[]` + envelope
  `{success,data}` (multi → `data:AIResponse[]`) + 400/401/500 error shapes; web
  search (model-decided, `sources`, `web_search:false`, fail-soft, latency note);
  runnable `curl` for §6.1–6.4 + pointers to the matching `bruno/` requests; honest
  limits (search on openai/xai/deepseek only, not Gemini; Tavily free tier; auth on
  all `/chat*`). Field lists taken from `src/types/index.ts` (no invented fields);
  links `CLAUDE.md`, `.env.example`, `bruno/` instead of restating them.

### Verification — every example executed against the running server (`bun` on :3002)
Ran with `PORT=3002` so the server matches the documented default. Valid key from
local `api-keys.json`; outputs trimmed, **no key value anywhere**:
- **§6.1 authed `/chat` (gemini):** `200 {"success":true,"data":{"provider":"gemini",
  "model":"gemini-2.5-flash-lite","content":"Hello there, friend.","usage":{…},
  "latency_ms":1605}}` ✅
- **§6.2 web-search `/chat` (deepseek):** `200 {"success":true,"data":{"provider":
  "deepseek",…,"content":"…$324.83 (as of today, July 21, 2026)…","latency_ms":8607,
  "sources":[6 URLs: wsj/robinhood/cnn/cnbc/marketwatch/yahoo]}}`; server logged
  `[web_search] project=project-alpha query="Apple AAPL stock price current"` (no
  key). ✅  (Note: the guide's §6.2 shows `xai`; on this run xai hit a transient
  `429 resource-exhausted`/slow tool-loop → the outer 30s `timeout` aborted once —
  a **provider-capacity** issue, not the doc/code. The `[web_search]` line still
  logged, proving the loop ran. I used deepseek for the captured trace and added a
  **latency note** to the guide (§5) telling consumers to raise `timeout` for
  search-heavy calls.)
- **§6.3 `/chat/multi`:** `200 {"success":true,"data":[{gemini…},{deepseek…}]}` —
  array, one AIResponse per config ✅
- **§6.4 no auth header → `401 {"success":false,"error":"unauthorized"}`** ✅
- No secret/key value in the guide (only `<project-key>` / `TAVILY_API_KEY=…`
  placeholders; the sole `api-keys.json` mention is the filename pointer).
- `git status`: `?? docs/` is the only new doc; no `.env`/`api-keys.json` staged.

### 🐞 Port doc-bug flagged (per SPEC-004, do NOT fix code under this REQ)
`src/index.ts` uses `Number(process.env.PORT) || 3002` and `.env.example` ships
`PORT=3002`, so the **code's real default is 3002** — but repo `CLAUDE.md` and the
board's project-info say **3009**, and the local `.env` sets `PORT=3009`. The guide
documents the code's actual default (**3002**) and notes `PORT` is configurable.
@Sober: please relay the 3009-vs-3002 discrepancy to Porter → human to confirm the
intended default; TASK-006 also surfaces it. No code changed.

### Note for review
- Verified web-search trace uses **deepseek** (xai was rate-limited at test time);
  the guide's example still lists xai as a valid capable provider — say if you'd
  rather I switch the printed example to deepseek for copy-paste reliability.

### REWORK done (2026-07-21) — §6.2 printed command now = a verified clean run
Per your REWORK: §6.2's printed command now uses **`xai`** (added `"timeout":90000`
for the extra search round-trips) and I ran **that exact command** — clean, grounded,
`sources` populated:

```
POST /chat  body: {"provider":"xai","tier":"small","timeout":90000,
  "messages":[{"role":"user","content":"What is the current stock price of AAPL? Search the web and cite sources."}]}

HTTP 200
{"success":true,"data":{"provider":"xai","model":"grok-4.3",
 "content":"**AAPL is currently trading at $324.83** (as of the latest available data from the web search). …",
 "usage":{"prompt_tokens":442,"completion_tokens":57,"total_tokens":731},"latency_ms":6683,
 "sources":[
   {"title":"Buy or Sell Apple Stock - AAPL Stock Price Quote & News","url":"https://robinhood.com/us/en/stocks/AAPL"},
   {"title":"Apple Inc. Stock Quote (U.S.: Nasdaq) - AAPL","url":"https://www.marketwatch.com/investing/stock/aapl"},
   {"title":"AAPL: Apple Inc - Stock Price, Quote and News","url":"https://www.cnbc.com/quotes/AAPL"},
   {"title":"Apple Stock Chart — NASDAQ:AAPL Stock Price","url":"https://www.tradingview.com/symbols/NASDAQ-AAPL"},
   {"title":"Apple Stock Price Quote - NASDAQ: AAPL","url":"https://www.morningstar.com/stocks/xnas/aapl/quote"}
 ]}}

server log: [web_search] project=project-alpha query="current stock price of AAPL"
```
Clean grounded content, 5 real `sources`, one `[web_search]` line (no key). The
printed §6.2 command and the verified command are now identical. (Chose xai over
deepseek for the printed example — see the bug I hit below.) → status REVIEW.

### 🐞 Bug found during rework — `deepseek-v4-flash` leaks DSML tool-call markup into `content` (TASK-005 scope, not this task)
While testing deepseek for §6.2 I hit a **real defect** (intermittent, reproduced
once): `deepseek-v4-flash` sometimes emits a `web_search` tool call as **text in
`content`** using DeepSeek's DSML markup instead of the structured OpenAI
`tool_calls` field. Our loop's `wantsTool` only detects structured `tool_calls`, so
that round's raw markup **leaks into the final `AIResponse.content`**:
```
"content":"<｜｜DSML｜｜tool_calls>\n<｜｜DSML｜｜invoke name=\"web_search\">\n<｜｜DSML｜｜parameter name=\"query\" string=\"true\">Apple stock price July 21 2026</｜｜DSML｜｜parameter>\n…"
```
(HTTP 200, `sources` still populated from an earlier proper round — but the answer
text is garbage.) This is **not** a TASK-007 doc issue and I did **not** change any
code (out of scope + TASK-005 is DONE). I switched the §6.2 example to xai to avoid
advertising a command that can intermittently corrupt output. @Sober: flagging for
triage — likely a small follow-up TASK on `_fetch.ts` (detect/parse DeepSeek DSML
tool-calls, or strip unparsed DSML from `content`). Repro: `POST /chat`
`{"provider":"deepseek","tier":"medium","messages":[{"role":"user","content":"What
is the current stock price of AAPL? Search the web and cite sources."}]}` — retry a
few times; it surfaces intermittently.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

- **BUG (new, TASK-005 scope — not blocking this doc task):** `deepseek-v4-flash`
  intermittently returns a `web_search` tool call as DSML text in `content` instead
  of the structured `tool_calls` field, so unparsed DSML markup leaks into
  `AIResponse.content` (full repro + sample in Implementation Notes → "Bug found
  during rework"). @Sober: please triage — probably a small follow-up TASK on the
  `_fetch.ts` loop (handle/strip DeepSeek DSML tool-calls). I did not touch code.

## Review

**Verdict: REWORK — narrow, one printed example must be a verified example (no other
change).** 2026-07-21, Sober.

The guide is excellent and I verified its accuracy against the real code:
`ChatRequest`/`AIResponse` field lists match `src/types/index.ts` exactly; the
endpoint table matches `index.ts`/`routes/chat.ts`; resolution order + fallback
chain (deepseek→xai→gemini→openai) + default provider (gemini) + error shapes
(400/401/500) all correct; limits honest; no secrets (placeholders only). §6.1/6.3/
6.4 were executed green.

**The one issue — REQ-004 AC "every example actually runs (verified, not assumed)":**
§6.2's *printed* command uses `provider:"xai"`, but xai 429'd at test time so you
verified with **deepseek** instead. So the exact command a consumer would copy from
§6.2 was **not** the one proven to return `sources`. Fix (pick one):
- **Preferred:** change §6.2's printed command to `"provider":"deepseek"` (the
  verified-capable provider), run *that exact command*, and paste the trimmed
  (key-free) `200` + `sources:[...]` + the `[web_search]` line as evidence; **or**
- keep xai but re-run *that exact xai command* successfully and paste its trace.

Either way the printed §6.2 must match a green run. That's the whole rework — do not
touch anything else. Answering your note: **yes, switch §6.2 to deepseek** for
copy-paste reliability; still list xai/openai as valid capable providers in §5/§7
(that's accurate). Flip back to REVIEW with the trace and I'll mark DONE.

Everything else in this task is DONE-quality.

---

**Verdict: DONE** — 2026-07-21, Sober (2nd pass, after rework).

Confirmed the doc file: §6.2's printed command is now `xai` + `"timeout":90000`, and
it matches the pasted green trace exactly (HTTP 200, grounded content, `sources` = 5
real URLs, one `[web_search]` line, no key). The "every example verified, not
assumed" AC is now satisfied for §6.2 as well; §5/§7 still correctly list
xai/openai/deepseek as capable providers. Keeping xai (with the timeout guidance) is
a fine choice — and given the deepseek defect you found (below), the *better* one.
All TASK-007 DoD items met. **DONE.** With TASK-006 also DONE, SPEC-004 is fully
delivered → REQ-004 → SPEC_DONE.

**On the deepseek DSML bug you flagged:** good catch, and correct call not to touch
code under a docs REQ. It's a real defect in the TASK-005 loop (delivered under
REQ-002), not a doc problem — so it doesn't affect this DONE. I'm routing it to
Porter as a newly-found defect with a recommended small follow-up (see log); the
human decides whether to schedule a fix REQ. Not creating a fix TASK unilaterally
(REQ-002 is already DELIVERED — new scope goes through Porter).
