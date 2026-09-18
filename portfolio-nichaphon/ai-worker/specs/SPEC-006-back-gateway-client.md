# SPEC-006: `back/` — Bun + Hono client of the owner's LLM gateway
- Source: REQ-006
- Status: DONE (2026-09-13, Sober — TASK-022 + TASK-023 both `DONE`; ledger closed at **3 / 5**, 2 unspent)

## Overview

`back/` is a small Bun + Hono service at the portfolio repo root whose only job is to call
the owner's gateway `https://ai.develyst.online` (`POST /chat`, no auth) through **one
internal operation**, `askGateway()`, that REQ-007 will later call several times per
visitor question from a WebSocket handler. This SPEC fixes the observed gateway contract
(two real calls, recorded below — **3 of the owner's 5 spent after TASK-023's call #3, 2 remain unspent**), the shape of
that one operation, how its failures are told apart, and what runs locally with one
command. No visitor-facing feature, no WebSocket, no cap, no database — those are
REQ-007 / deferred.

Why this shape: the gateway already normalises every provider into one `AIResponse`, so
`back/` adds exactly two things the gateway does not give — a **typed failure
classification** (R5) and **a transport-free function** (R3) — and nothing else. Every
failure mode is demonstrated against a local stub that replays the recorded shapes, so
the paid budget is spent on proving the real contract, not on rehearsing errors.

## Observed contract — the two real calls (SA, 2026-09-13, from this machine)

**Nobody needs to fire these again.** Both went to production with no auth header.

### Call 1 of 5 — `GET https://ai.develyst.online/` (provider-free, costs no tokens)
- Sent 2026-09-13 12:51:26 +0700 (05:51:26Z), `curl`, no body, no headers beyond defaults.
- **HTTP 200**, `Content-Type: application/json`, 1088 B, 0.46 s total (TLS 0.22 s).
  Headers of note: `Server: cloudflare`, `Access-Control-Allow-Origin: *`, `CF-RAY …-BKK`.
- Body (verbatim, whitespace added):
```json
{"name":"AI Develyst","version":"1.1.0",
 "supported_models":{
  "openai":["gpt-4.1","gpt-4.1-mini","gpt-4.1-nano","gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"],
  "gemini":["gemini-2.5-pro","gemini-2.5-flash","gemini-2.5-flash-lite","gemini-1.5-pro","gemini-1.5-flash"],
  "xai":["grok-4-latest","grok-3","grok-3-mini","grok-2-1212"],
  "deepseek":["deepseek-reasoner","deepseek-chat","deepseek-v4-flash"]},
 "model_tiers":{
  "openai":{"small":"gpt-4.1-nano","medium":"gpt-4.1-mini","flagship":"gpt-4.1"},
  "gemini":{"small":"gemini-2.5-flash-lite","medium":"gemini-2.5-flash","flagship":"gemini-2.5-pro"},
  "xai":{"small":"grok-3-mini","medium":"grok-3","flagship":"grok-4-latest"},
  "deepseek":{"small":"deepseek-v4-flash","medium":"deepseek-chat","flagship":"deepseek-reasoner"}},
 "endpoints":{
  "POST /chat":"เรียก model เดียว (ระบุ model หรือ tier: small|medium|flagship)",
  "POST /chat/multi":"เรียกหลาย model พร้อมกัน",
  "GET /tiers":"ดู mapping ของ tier (เล็ก/กลาง/เรือธง) ต่อ provider"}}
```
- **Finding F1 — production is `1.1.0`; the `develyst-ai` checkout the team may read is
  `1.0.0`** (its `GET /` has no `model_tiers`, no `GET /tiers`, no `tier` option; its
  `package.json` says 1.0.0; last commit `57cdd0d`). The readable source is therefore
  **behind the deployment**. This SPEC designs only on what both agree on plus what the
  two calls showed; nothing relies on `tier` or `GET /tiers`. → **SQ30**.

### Call 2 of 5 — `POST https://ai.develyst.online/chat` (paid)
- Sent 2026-09-13 12:51:43 +0700 (05:51:43Z), `curl`, `Content-Type: application/json`,
  no `provider`, no `model`, no `tier` — the fallback chain was left to choose.
- Request body (verbatim):
```json
{"messages":[{"role":"system","content":"Reply with exactly one word."},
             {"role":"user","content":"Say OK."}],
 "max_tokens":16,"temperature":0}
```
- **HTTP 200**, `Content-Type: application/json`, 173 B, **0.84 s total** (same Cloudflare
  headers as call 1). Body (verbatim):
```json
{"success":true,"data":{"provider":"deepseek","model":"deepseek-flash","content":"OK",
 "usage":{"prompt_tokens":14,"completion_tokens":1,"total_tokens":15},"latency_ms":636}}
```
- **Findings.** F2: the shape is exactly the checkout's `{ success, data: AIResponse }`.
  F3: the `system` role is honoured through the fallback chain. F4: the first provider in
  the live chain is still `deepseek`, but the model string is **`deepseek-flash`**, which
  appears in **neither** the 1.0.0 source nor production's own `supported_models` — treat
  `data.model` as an opaque string to display, never as a value to validate against.
  F5: cost of this call = 15 tokens on DeepSeek; wall time 0.84 s of which 0.64 s was the
  provider.

### Facts read from the 1.0.0 source that the REQ's summary did not carry (assumed true in 1.1.0 unless a call shows otherwise)
- **S1** `POST /chat` with no `provider` runs `callWithFallback`, which **drops `model`** from
  the body — a model can only be pinned together with a `provider`.
- **S2** Fallback order in source: `deepseek → xai → gemini → openai`; only the **last**
  provider's error string survives when all fail (`{ success:false, error }`, HTTP 500).
  So a quota problem on DeepSeek alone is invisible — the chain just answers from xAI.
- **S3** Empty/missing `messages` → HTTP 400 `{ "error": "messages is required" }` (no
  `success` field). A malformed JSON body escapes the handler's `try` → Hono's plain-text
  `Internal Server Error` 500. **Non-2xx bodies must not be assumed JSON.**
- **S4** The request body accepts `timeout` (ms) and it is applied **per provider attempt**
  (default 30000). Four attempts × 30 s is the source's worst case; Cloudflare in front
  will cut anything past ~100 s with an HTML error page.
- **S5** Provider errors are thrown as `<Provider> API error <status>: <text>` — the only
  place a 402/429 (quota) or 400/404 (unknown model) is visible is inside that string.
- **S6** `cors()` is wide open (`*`, confirmed live). Anyone who learns the base URL can
  call the gateway from a browser tab — which is why AC-d's "URL never in the bundle" is
  the whole defence this round.

## Call ledger — the owner's 5 real calls (REQ-006 Q36). Append a row BEFORE you fire.

| # | Date | Who | Request | Result | Running total |
|---|------|-----|---------|--------|---------------|
| 1 | 2026-09-13 | Sober | `GET /` | 200, v1.1.0 catalogue (above) | 1 / 5 |
| 2 | 2026-09-13 | Sober | `POST /chat`, 2 msgs, max_tokens 16 | 200, deepseek / deepseek-flash, 15 tokens, 0.84 s | 2 / 5 |
| 3 | 2026-09-13 | Fern (TASK-023) | `POST /ask` `{"question":"Say OK."}` through `back/` (defaults) → gateway `POST /chat` | 200 `{"ok":true,"answer":{"content":"OK",…}}`, deepseek / deepseek-flash, 18/1/19 tokens, latency_ms 568, wall_ms 989 (13:17:26 +0700) | **3 / 5** |
| 4 | — | **not triggered** — #3 succeeded 2026-09-13, so the retry condition can no longer fire | (none) | **unspent** — disposition is the owner's (Q49 / SQ31), not re-assigned by SA | 3 / 5 |
| 5 | — | **nobody** — owner's reserve | — | **unspent** | 3 / 5 |

Counting rule until the owner says otherwise (→ **SQ31**): **every HTTP request to
`https://ai.develyst.online` counts**, provider-free or not. Nothing on the stub counts.

## Decisions this SPEC makes (SA's own, reversible, recorded)

- **D1 — One function, no framework in it.** `askGateway(messages, opts?)` in
  `back/src/gateway/ask.ts` is a plain async function that imports nothing from `hono`.
  HTTP (`POST /ask`, this SPEC) and the WebSocket handler (SPEC-007) both `await` it. R3.
  For SPEC-007, decided now so it is not re-decided: the WebSocket will be Bun's native one
  via `createBunWebSocket` from `hono/bun`, passed to the same `Bun.serve`.
- **D2 — Failures are a typed error, not a string.** `GatewayError { kind, status?,
  detail }` with `kind ∈ unreachable | timeout | quota | unknown_model | gateway_error |
  bad_response`. `quota` and `unknown_model` are **heuristics over the gateway's error
  string** (S5) and are declared as such; everything else is structural. R5.
- **D3 — All failure modes are demonstrated on a local stub, not on production.**
  `back/test/stub-gateway.ts` replays the recorded shapes; `bun test` drives it. Zero
  cost, repeatable by QA.
- **D4 — Config is env with baked defaults; no `.env` file is needed to run.** The root
  `.gitignore` has `.env*`, which would silently ignore a `back/.env.example` too — so the
  variables are documented in `back/README.md` instead. The base URL default lives in
  `back/src/config.ts` (server-side only).
- **D5 — Port 3001.** The root README, `docker-compose.yml` and `NEXT_PUBLIC_API_URL`
  already assume the backend on 3001; `front` dev is 3000. `PORT` overrides.
- **D6 — Timeouts: `timeout: 15000` sent per attempt (S4), client abort at 60000 ms.**
  Under Cloudflare's ~100 s. Worst case a caller waits ~60 s while the chain falls through
  four providers — REQ-007's progress UI is what makes that bearable. → **SQ32**.
- **D7 — `POST /ask` takes `{ question }`, never raw `messages`.** The prompt is built
  server-side, so the endpoint is not a general proxy to his gateway and no prompt
  template exists in the browser (REQ-007 AC-g, pre-satisfied). REQ-006's system prompt is
  a **dev placeholder**, not site copy, and SPEC-007 replaces it.
- **D8 — The cap point exists now as a no-op.** `back/src/limits.ts` exports
  `guard(clientKey: string): void` and `POST /ask` calls it once. That is REQ-007 R6's
  "single named point"; it counts nothing, stores nothing.
- **D9 — Logs carry shapes, never content.** One line per gateway call with provider,
  model, tokens, latency, kind — and the *lengths* of question/answer, not the text.
  Nothing about a visitor is written anywhere (REQ-007 AC-f, pre-satisfied).
- **D10 — The root `README.md` is not edited.** It is already wrong (NestJS/Prisma) and
  this round does not make it more wrong; `back/README.md` is where `back/` is
  described. Rewriting the root README is the owner's call → **SQ33**.

## API / Interface Design

### Internal operation (the one REQ-006 R3 asks for)
```ts
// back/src/gateway/types.ts
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type GatewayAnswer = {
  content: string; provider: string; model: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  latency_ms: number;        // as reported by the gateway
  wall_ms: number;           // measured by back/ around the whole fetch
};
export type GatewayFailureKind =
  "unreachable" | "timeout" | "quota" | "unknown_model" | "gateway_error" | "bad_response";
export class GatewayError extends Error {
  kind: GatewayFailureKind; status?: number; detail: string;
}
// back/src/gateway/ask.ts — imports NOTHING from "hono"
export async function askGateway(
  messages: ChatMessage[],
  opts?: { max_tokens?: number; temperature?: number; signal?: AbortSignal }
): Promise<GatewayAnswer>;   // throws GatewayError, nothing else
```
Request `back/` sends to `${GATEWAY_BASE_URL}/chat` (mirrors call 2): `{ messages,
max_tokens: opts.max_tokens ?? GATEWAY_MAX_TOKENS, temperature: opts.temperature ?? 0.2,
timeout: GATEWAY_ATTEMPT_TIMEOUT_MS }`. No `provider`, no `model`, no `tier` by default
(S1, F4). If `GATEWAY_PROVIDER` is set, `provider` (and `GATEWAY_MODEL` if set) are added —
that is the only path that can produce `unknown_model` in reality.

### Classification (`back/src/gateway/classify.ts`, pure, unit-tested)
| Observation | `kind` |
|---|---|
| `fetch` rejects (DNS, refused, TLS) | `unreachable` |
| `AbortSignal` fired (client 60 s) | `timeout` |
| non-2xx, body not JSON or no `error` string (e.g. Cloudflare HTML 5xx) | `bad_response` |
| non-2xx JSON `{ success:false, error }` where `error` matches `/\b(402\|429)\b\|quota\|insufficient\|credit\|balance/i` | `quota` |
| non-2xx JSON where `error` matches `/model/i` **and** `/\b(400\|404)\b\|not found\|does not exist\|invalid/i` | `unknown_model` |
| any other non-2xx JSON with an `error` string | `gateway_error` |
| 2xx but `success !== true` or `data.content` not a string | `bad_response` |

(Order matters: `quota` is tested before `unknown_model`; regexes above use `\|` only
because they sit in a Markdown table — in code they are ordinary `|`.)

### HTTP routes (Hono, `back/src/index.ts`)
| Route | Body | Response |
|---|---|---|
| `GET /health` | — | 200 `{ ok:true, service:"portfolio-back", version:"0.1.0" }` — **no gateway call, no URL** |
| `POST /ask` | `{ question: string }`, 1–2000 chars | 200 `{ ok:true, answer: GatewayAnswer }` · 400 `{ ok:false, kind:"bad_request", message }` · **503** `unreachable` · **504** `timeout` · **502** `quota` / `unknown_model` / `gateway_error` / `bad_response` — all as `{ ok:false, kind, message }`; `message` is a short fixed sentence per kind, the gateway's `detail` goes to the log only |

`POST /ask` flow: validate → `guard(ip)` (no-op, D8) → build `[system: <dev placeholder>,
user: question]` → `askGateway` → map → log one line (D9).

### Config (`back/src/config.ts`) — env, with defaults; documented in `back/README.md`
`PORT=3001` · `GATEWAY_BASE_URL=https://ai.develyst.online` · `GATEWAY_ATTEMPT_TIMEOUT_MS=15000`
· `GATEWAY_CLIENT_TIMEOUT_MS=60000` · `GATEWAY_MAX_TOKENS=512` · `GATEWAY_PROVIDER` /
`GATEWAY_MODEL` (unset). The stub is selected by `GATEWAY_BASE_URL=http://127.0.0.1:<port>`.

### Stub (`back/test/stub-gateway.ts`) — a `Bun.serve` that answers `POST /chat`
Mode chosen by the request header `x-stub-mode` (default `ok`): `ok` → the call-2 body
verbatim · `quota` → 500 `{success:false,error:"OpenAI API error 429: insufficient_quota"}`
· `unknown_model` → 500 `{success:false,error:"DeepSeek API error 400: Model Not Exist"}`
· `all_failed` → 500 `{success:false,error:"All providers failed"}` · `html` → 502
`text/html` (Cloudflare shape) · `hang` → never answers. `unreachable` needs no mode — point
`GATEWAY_BASE_URL` at a closed port. Runnable standalone with `bun run stub` for QA.
`askGateway` forwards an optional `stubMode` only in tests (an `opts.headers` passthrough is
acceptable; it must not be reachable from `POST /ask`).

## Data Model
None. No database (Q44), no file writes, nothing stored (D9). `back/knowledge/` (REQ-005)
is not read by this SPEC.

## Flow
1. `cd back && bun install && bun run dev` → `http://localhost:3001/health` answers (AC-a).
2. `POST /ask` → happy path as above; the HTTP handler and (later) the WS handler are the
   only callers of `askGateway`.
3. Failure: `askGateway` throws `GatewayError` → `POST /ask` maps kind→status and logs
   `[gateway] fail kind=<k> status=<s> wall_ms=<n> detail="<gateway error string>"`.
4. Success log: `[gateway] ok provider=<p> model=<m> tokens=<pt>/<ct>/<tt>
   latency_ms=<n> wall_ms=<n> q_len=<n> a_len=<n>`.
5. Edge: question empty **or whitespace-only (`trim().length === 0`)** / >2000 chars / not a
   string / any key other than `question` → 400 before any network. *(Amended 2026-09-13,
   Sober — TASK-022 FQ37/FQ38; the trim line ships in TASK-023 step 0.)*
6. Edge: client abort (`signal`) → `timeout`, and the SPEC records honestly that the
   gateway may still finish and bill the provider after `back/` has given up (S4).

## Non-functional
- No auth on `back/` (none was asked; the gateway has none either). Local only (Q43).
- **AC-d check is mechanical:** after `cd front && npm run build`, `grep -r "ai.develyst.online" front/.next` must return nothing (`front/` is not touched by this SPEC, so it is expected to be empty — the check exists so REQ-007 inherits it).
- Tests: `cd back && bun test` — every `kind` in D2 has a named test against the stub.
- Bun on the team machine: 1.3.14 (checked 2026-09-13). Hono: pin `^4.6.0` like the gateway.

## Tasks
- TASK-022: Scaffold `back/`, the operation, classifier, routes, stub and tests — **no real call** (depends on: —)
- TASK-023: The recorded real round-trip through `back/` (call #3 of 5) + AC checklist (depends on: TASK-022 `DONE`)

## Questions

**SQ30 (to Porter, FYI, non-blocking) — the gateway repo the team may read is behind the
deployment.** Production is `1.1.0` (tiers, `GET /tiers`); the `develyst-ai` checkout is
`1.0.0` at `57cdd0d`. Design uses only what both agree on. The owner may want to sync that
repo so the next reader is not misled; nothing here waits on it.

**SQ31 (to Porter → owner, non-blocking) — does a provider-free `GET /` count as one of the
5?** I counted it (ledger 2/5). If he says provider-free calls are free, the ledger becomes
1/5 and Fern gains one.

**SQ32 (to Porter, FYI) — two exposures that are the gateway's, not ours.** (a) With no
provider pinned a caller can wait up to ~60 s while the chain falls through four providers
(D6); (b) when all fail, only the last provider's error is visible (S2), so "quota" is a
best-effort read of a string. Neither is fixable from `back/`; both are stated so REQ-007's
UI and the owner expect them.

**SQ33 (to Porter → owner, non-blocking) — the root `README.md` still describes a NestJS +
Prisma backend on 3001.** This SPEC leaves it untouched (D10). Does he want it rewritten?
That would be its own small TASK on his file.

(Fern asks below; Sober answers as `> answer: ...`)
