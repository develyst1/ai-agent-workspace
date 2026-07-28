# TASK-012: AI Center client + Approach Advisor endpoint (CORE)
- Source: SPEC-003
- Status: DONE
- Assignee: Jason (BE)
- Depends on: none (builds on SPEC-002 people data + getOwnedPerson)

## What to do
In `manager-gold-back`:
- **AI Center client** (`src/ai/center.ts`): `callChat(messages, opts?)` that POSTs
  `{AI_CENTER_BASE_URL}/chat` with `{ messages, temperature?, max_tokens? }` (omit `provider`
  → gateway fallback chain). Reads `AI_CENTER_BASE_URL` from env (add to `env.ts` + `.env.example`;
  no default that points at a real host — fail clearly if unset). Apply a **timeout** (e.g. 20s via
  `AbortController`). Normalize the result: on `{success:true}` → `{content, provider, model}`;
  on `{success:false}` / non-2xx / network / timeout → throw a typed `AiUnavailableError`.
- **Prompt builder** (`src/ai/advice.ts`): from a person row (+ its tags/current sentiment/recent
  interactions if easily available) build the system+user messages per SPEC-003 §Prompt (fixed
  card sections; "use ONLY this profile, be specific, no generic filler").
- **Endpoint** `POST /api/people/:id/advice`: `getOwnedPerson` → 404; validate `topic` (optional
  string, trim, ≤500 → else 400); build prompt; `callChat`; on success → `200 { advice:{content,
  provider,model} }`; on `AiUnavailableError` → **`502 {error:"ai_unavailable", message}`**.
- Mount under the existing `/api/*` guard.

**Tests MUST mock the gateway — never call the real AI Center.** Inject the base URL at a local
mock server (or stub `fetch`); assert: advice 200 with a mocked success; the outgoing request went
to `{base}/chat` with the person's profile fields present in the messages (proves "routed through
AI Center" + "reflects the profile"); gateway `{success:false}`/non-2xx/timeout → 502; not-owned → 404.

## Definition of Done
- [x] `AI_CENTER_BASE_URL` in `env.ts` + `.env.example`; unset → a clear startup/first-call error.
- [x] `bun test` (gateway mocked) covers: 200 advice; request hit `{base}/chat` and included profile
      content; `{success:false}`/non-2xx/timeout → 502 `ai_unavailable`; bad topic → 400; not-owned → 404.
- [x] No real AI call in tests; no secrets committed.
- [x] `getOwnedPerson` gates the route (isolation: user B → 404).

## Implementation Notes
Implemented by Jason on 2026-07-28 in `H:\manager-gold\manager-gold-back`
(branch `dong`, commit `17e1da5`). **Gateway mocked throughout — no real AI call.**

**Files changed:**
- `src/ai/center.ts` (new) — `callChat(messages, opts)` POSTs `{AI_CENTER_BASE_URL}/chat`
  with `{messages, temperature?, max_tokens?}` (**provider omitted** → gateway fallback
  chain). 20s `AbortController` timeout. Normalizes `{success:true}` →
  `{content, provider, model}`. Every failure mode — unset base URL, network error,
  timeout/abort, non-2xx, `{success:false}`, invalid body — throws the typed
  `AiUnavailableError`.
- `src/ai/advice.ts` (new) — `buildAdviceMessages(person, {tags,currentSentiment,
  recentInteractions}, topic?)` → system + compact user profile per SPEC-003 §Prompt
  (fixed card sections; "use ONLY this profile"; null fields omitted; absent topic →
  "general approach").
- `src/ai/routes.ts` (new) — `POST /api/people/:id/advice`: `getOwnedPerson`→404;
  `topic` optional string ≤500→400; `callChat`→`200 {advice:{content,provider,model}}`;
  `AiUnavailableError`→`502 {error:"ai_unavailable",message}`.
- `src/env.ts` (mod) — `AI_CENTER_BASE_URL` as a **getter** reading `process.env`
  (no baked-in real host; unset → clear error at call time). `.env.example` (mod) — key
  added, left blank. `src/app.ts` (mod) — mounts `registerAiRoutes` under `/api/*`.
- `test/setup.ts` (mod) — fake `AI_CENTER_BASE_URL=http://ai-center.test/ai` (never
  contacted; fetch is stubbed). `test/ai-advice.test.ts` (new) — 9 tests.

**Verification (evidence) — `bun test` → 45 pass / 0 fail (167 assertions):**
- 200 advice from a mocked `{success:true}`; the outgoing request went to
  **`http://ai-center.test/ai/chat`**, `provider` omitted, and the user message contained
  the person's profile (`Dana`, `client`, the note text) + the topic — proves "routed
  through AI Center" + "reflects the profile".
- no-topic → "general approach" in the prompt.
- gateway `{success:false}` → 502; non-2xx (500) → 502; network error → 502;
  client-level **timeout** (`callChat({timeoutMs:20})` vs a hanging fetch) → `AiUnavailableError`.
- over-long topic (501 chars) → 400 **and no gateway call**; another user's person → **404**
  (isolation) **and no gateway call**; **unset `AI_CENTER_BASE_URL`** → 502 with a message
  naming `AI_CENTER_BASE_URL`.
- No real host or secret committed (`.env.example` key is blank; `AI_CENTER_BASE_URL` unset in repo).

**Live E2E — DONE 2026-07-28** (DATA REQUEST answered → `project-docs/ai-center-access.md`;
Sober directed the one live call). Ran `AI_CENTER_BASE_URL=https://ai.develyst.online bun run
start` (git-ignored env, inline — public URL, no secret), registered a test user, created a test
person "Khun Somchai" (boss / MD; reason / indirect / careful; data / formal; avoids office
politics; values reliability + reputation; analytical, dislikes surprises), then
`POST /api/people/:id/advice {"topic":"ask for a two-week deadline extension on the Q3 report"}`:
- **HTTP 200 in ~8.1s**; `provider: "deepseek"`, `model: "deepseek-v4-flash"`.
- Returned a real approach card with all six sections (**Tone / Opening line(s) / Key points /
  What to say / What to avoid / Timing**), specific to the profile — e.g. Tone: "Formal,
  respectful, and deferential … avoid any hint of urgency or emotional appeal"; What to avoid:
  "any reference to office politics"; Timing: "one-page written proposal … 24 hours in advance …
  do not approach spontaneously." Reflects the stored profile, not generic filler (REQ-003 crit).
- Server stopped by PID afterward (baseline §7); env value not committed.
- This closes the previously-deferred live-e2e caveat. The full card is in the live-run output.

- Commit local on `dong` only (not pushed), per baseline §6/§7.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-28 (commit `17e1da5` on `dong`). Read `ai/center.ts`,
`ai/advice.ts`, `ai/routes.ts`, `env.ts`, `test/ai-advice.test.ts`:
- `callChat` funnels **every** failure (unset base, network, timeout via `AbortController`,
  non-2xx, invalid body, `{success:false}`) into `AiUnavailableError`; `provider` omitted →
  gateway fallback chain; 20s timeout. Route maps it to `502 {error:"ai_unavailable"}` — clean
  error, no crash (REQ-003 acceptance).
- **Ownership before any gateway call**: `getOwnedPerson`→404 and topic-validation→400 both
  short-circuit before `callChat` (tests assert `called===false`) — no info leak, no wasted call.
- **Routed through the AI Center + reflects the profile**: test asserts the request hit
  `{base}/chat` with `provider` undefined and the user message contained the person's name/
  relationship/notes + topic. Prompt says "use ONLY this profile, no generic filler".
- **No secret/host committed**: `AI_CENTER_BASE_URL` is an env getter (no baked default);
  `.env.example` key left blank; tests use a fake host + mock `fetch` (never a real call);
  `afterEach` restores fetch. 9 AI tests; 45 total pass.
- Server-side only — the profile never leaves via the client (matches SPEC-003; ties to the
  open privacy confirm with Porter).

DoD: all 4 met. Non-blocking: live end-to-end is correctly deferred to the DATA REQUEST (real
base URL). → TASK-013 (optional) + TASK-014 (FE advisor) unblocked.
