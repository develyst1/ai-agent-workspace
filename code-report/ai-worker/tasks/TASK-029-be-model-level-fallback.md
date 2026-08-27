# TASK-029: BE — model-level fallback (Req-7)
- Source: SPEC-007 (§Fallback models / decision D6)
- Status: DONE (Sober review, 2026-08-25, commit `4bfc21e`)
- Assignee: Jason (BE)
- Depends on: TASK-027 (the `AiClient` contract + retry loop this extends is live at
  `23df16f`; TASK-025's `config.ts`/`APPROVED_MODEL_CAPS` are the surfaces edited here)
- Written: 2026-08-25 by Sober (SA Lead)

## Why this exists
REQ-008 **Req-7**: when the primary model chosen for a call runs out of credit/quota
or errors, the system must fall back to a backup model (`deepseek-v4-pro`, then
`deepseek-v4-flash`). Full design — placement, trigger, clamp, chain, testability —
is **SPEC-007 §"Fallback models (Req-7)" + decision D6**; read it, not repeated here.

**Policy is a stakeholder proposal (Q-SA-25, NON-BLOCKING).** The trigger rule, the
pro→flash order and the 30000 clamp are proposed back to the stakeholder before ship.
You build to the SPEC's proposed defaults now; because every knob is env, his answer
changes config, not your code (same pattern as the D3 model defaults in TASK-025).

## What to do
All three edits are additive and land in one green commit.

### 1. `src/config.ts`
- Add `"deepseek-v4-flash": 30000` to `APPROVED_MODEL_CAPS` (Q-REQ008-4 confirmed:
  same tier/cap as `gpt-4.1-mini`). It is then valid as a stage model **and** a
  fallback model.
- Add `fallbackModels: string[]` to `Config`, read from **`AI_FALLBACK_MODELS`**
  (comma-separated, order preserved, whitespace trimmed, blank entries dropped).
  Default = `["deepseek-v4-pro", "deepseek-v4-flash"]`. An **empty/absent** value =
  `[]` (fallback disabled) — this is legal, not a `ConfigError`.
- **Validate:** every id in the list must be a key of `APPROVED_MODEL_CAPS`, else a
  fatal `ConfigError` at startup (same message style as the unknown-stage-model case).
- Add `fallbackModels` to `describeConfig` (not a secret).
- Add the var to `.env.example` with the default + a one-line comment.

### 2. `src/ai/client.ts` — fallback **inside `createHttpAiClient`**
- `HttpAiClientOptions` gains `fallbackModels?: string[]` and the cap lookup it needs
  (pass `APPROVED_MODEL_CAPS` in, or a `modelCaps: Record<string, number>` option —
  do **not** import `config.ts` into the ai layer; keep the client config-free, wired
  by `routes.ts`).
- `chat(request)`: build the ordered model chain = `[request.model, ...fallbackModels]`
  **de-duped**, dropping any fallback equal to `request.model` (SPEC D6c). For each
  model in turn, run the **existing** attempt/retry loop (`MAX_ATTEMPTS`) against a
  request whose `model` = that model and whose `max_tokens` =
  `min(request.max_tokens, modelCaps[model] ?? request.max_tokens)` (SPEC D6b clamp).
- **Advance to the next model only on a fallback-eligible exhaustion** (SPEC D6a): the
  last `Failure` was `timeout` / `network-error` / `http-error` **5xx** / `service-error`.
  A **non-retryable 4xx `http-error`** must **not** fall back — throw
  `AiLayerError("AI_UNAVAILABLE")` immediately as today. (Note the current
  classification lumps 4xx as `http-error`+`retryable:false`; use `retryable` plus the
  `outcome` to gate — a `service-error` with `retryable:false`, e.g. a `success:true`
  with missing content, is a malformed *response* not a model-credit issue and also
  should not fall back. Fall back on: `retryable === true` failures **or** the
  `service-error` `success:false` case. Confirm the exact predicate against the
  `Failure` shapes in `client.ts` L102–213 and encode it in one small helper.)
- On success, return as today. When the whole chain exhausts, throw
  `AiLayerError("AI_UNAVAILABLE", { detail })` (unchanged behaviour when
  `fallbackModels` is empty).
- **Logging (SPEC D6d):** each attempt already logs `stage` + model + outcome via
  `logAiCall`; ensure the model actually tried is the one logged, and add a marker that
  the attempt was a fallback (e.g. an extra `fallback: true` field on the log line for
  non-primary models). Best-effort credit-vs-error labelling, if added, is **log-only**.

### 3. `src/reports/routes.ts`
- Where `createHttpAiClient({...})` is built (L65–71), pass `fallbackModels:
  config.fallbackModels` and the model-cap table. **No other production file changes** —
  `pipeline.ts`, `curiosity.ts`, `worker.ts` stay exactly as they are (SPEC D6).

## Definition of Done
- [ ] `deepseek-v4-flash`=30000 in `APPROVED_MODEL_CAPS`; `AI_FALLBACK_MODELS` parsed
      into `Config.fallbackModels` (default pro,flash; empty = `[]`); unknown fallback id
      → fatal `ConfigError`; `.env.example` + `describeConfig` updated.
- [ ] `createHttpAiClient` tries the ordered, de-duped chain; fallback `max_tokens`
      clamped to the fallback model's cap; advances only on a provider/model-side
      exhaustion; a non-retryable 4xx does **not** fall back; empty chain = today's throw.
- [ ] `routes.ts` wires `config.fallbackModels` + caps into the client; **`pipeline.ts` /
      `curiosity.ts` / `worker.ts` untouched** (`git diff` shows only `config.ts`,
      `.env.example`, `client.ts`, `routes.ts` + their tests).
- [ ] Unit tests (`test/ai-client.test.ts`, `test/config.test.ts`) with a fake `fetchImpl`,
      no network: (a) primary fails-eligible → success comes from the next model; (b) the
      fallback call's `max_tokens` was clamped to 30000; (c) primary de-duped out when it
      equals a fallback id; (d) a non-retryable 4xx does **not** fall back; (e) empty
      `AI_FALLBACK_MODELS` = throws as today; (f) config rejects an unknown fallback id.
- [ ] `bun run typecheck` exits 0 and `bun test` passes (`cd code-report-back`); report
      the pass/fail counts.

## Implementation Notes
**Commit `4bfc21e`** (parent `75acb5f`, tree clean). All edits additive, one green commit.

**1. `src/config.ts`**
- Added `"deepseek-v4-flash": 30000` to `APPROVED_MODEL_CAPS` — now a valid stage
  model **and** fallback model.
- Added `fallbackModels: string[]` to `Config`, loaded via new `loadFallbackModels(env)`
  from `AI_FALLBACK_MODELS` (comma-split, trimmed, blanks dropped, order preserved).
  Unknown id → fatal `ConfigError` (message names `AI_FALLBACK_MODELS`, same style as the
  unknown-stage-model case). Added to `describeConfig` (not a secret).
- **Absent vs empty:** `AI_FALLBACK_MODELS` **absent** ⇒ built-in default
  `deepseek-v4-pro,deepseek-v4-flash`; an **explicit empty/blank** value ⇒ `[]` (disabled).
  I read `env["AI_FALLBACK_MODELS"]` directly (not the `optional()` helper) precisely so
  absent and empty stay distinguishable — this is the DoD-row-1 rule ("default pro,flash;
  empty = []"). See Q-BE-29 for the wording note.

**2. `src/ai/client.ts`** (fallback lives inside `createHttpAiClient`)
- `HttpAiClientOptions` gains `fallbackModels?: string[]` and `modelCaps?: Record<string,number>`
  (passed in by `routes.ts` — the ai layer still does **not** import `config.ts`).
- Extracted the existing per-model retry loop into `runModel(request, isFallback)` which
  returns the success or the last `Failure` (never throws). `chat()` now builds the chain
  via exported `buildModelChain(primary, fallbacks)` (de-dups primary + repeats, order kept),
  and for each model runs `runModel` with `max_tokens = min(request.max_tokens, cap ?? request.max_tokens)`
  (D6b clamp). Advances only when exported `shouldFallBack(failure)` is true.
- **Trigger predicate (D6a), confirmed against `client.ts` L102–213 Failure shapes:** every
  fallback-eligible outcome (`timeout`/`network-error`/`http-error` 5xx/`service-error`
  `success:false`) is exactly the set with `retryable === true`; every non-eligible one (4xx
  `http-error`, malformed-response `service-error` cases) is `retryable === false`. So
  `shouldFallBack = failure.retryable === true` is the precise, self-consistent encoding of
  "retryable failures OR the service-error success:false case" (the success:false case is
  itself retryable:true). A non-retryable 4xx therefore throws immediately as today.
- Empty `fallbackModels` ⇒ chain is `[primary]` ⇒ byte-for-byte today's single-model
  retry-then-throw behaviour (all 8 pre-existing client tests unchanged and green).

**3. `src/ai/log.ts`** (D6d marker — see Q-BE-29 scope note)
- Added an optional `fallback?: boolean` field to `AiCallLogEntry`. `runModel` sets it
  `true` only on non-primary attempts (undefined on primary, so primary log lines are
  unchanged) and now also logs the actual `model` tried on a **failed** attempt (previously
  only the outcome was logged, so a fallback attempt was invisible). This is the only file
  outside the DoD's named list; it is required by the task body's D6d "log line" clause.

**4. `src/reports/routes.ts`**
- Wired `fallbackModels: config.fallbackModels` + `modelCaps: APPROVED_MODEL_CAPS` into the
  `createHttpAiClient({...})` construction (L65–73). No other production change.

**Out of scope, verified untouched:** `pipeline.ts`, `curiosity.ts`, `worker.ts`,
`WorkerOptions`, wire mapping, DB. `git show --stat 4bfc21e` = the 5 production/config files
above + the 2 test files only.

**Verification (evidence).** `cd code-report-back`:
- `bun run typecheck` → exit 0.
- `bun test` → **287 pass / 0 fail** (801 expect, 20 files); was 274/0 at `75acb5f`.
  +13: 7 in `test/ai-client.test.ts` (buildModelChain de-dup; a=next-model success;
  b=30000 clamp; c=primary de-duped out; d=4xx no-fallback; e=empty chain throws-as-today;
  D6d fallback:true log marker) and 6 in `test/config.test.ts` (default pro,flash; explicit
  empty/blank = []; ordered+trimmed parse; unknown id → ConfigError; deepseek-v4-flash valid
  stage model still 30000-capped; describeConfig reports the chain).
- No SQL, no DB, no environment touched — all fallback tests use a fake model-routed `fetchImpl`.

## Questions
(Jason asks; Sober answers as `> answer: ...`.)

- **Q-BE-29 (NON-BLOCKING, transparency — no answer needed to proceed).** Two small
  notes, both resolved by the DoD, flagged so you can confirm on review:
  1. **`log.ts` is outside the DoD's named file list** (`config.ts`/`.env.example`/`client.ts`/
     `routes.ts` + tests). I edited it only to add the `fallback?: boolean` field the task
     body's **D6d "extend the log line" clause explicitly requires** — the log-entry type lives
     in `log.ts`, so there is no way to add the marker without touching it. It is one optional
     field + logging the tried model on failures; no behaviour change. If you'd rather the
     marker were done differently, that's a one-line rework.
  2. **DoD item-1 prose says "empty/absent value = [] (fallback disabled)"** but the DoD
     checklist + SPEC §Configuration table say **default = pro,flash; empty = []**. These
     conflict on the *absent* case. I implemented the checklist/SPEC reading (absent ⇒ default
     pro,flash; explicit-empty ⇒ []), which is also what `.env.example` ships. If the stakeholder
     actually wants fallback **off by default** (absent ⇒ []), that's a one-line flip in
     `loadFallbackModels` — but it would contradict the SPEC table, so I did not assume it.

  > answer (Sober, 2026-08-25): **Both notes confirmed — neither is a rework.**
  > (1) `log.ts` is a legitimate in-scope edit: D6d ("extend the log line so each fallback
  > attempt records the model it used and that it was a fallback") is impossible without
  > touching the `AiCallLogEntry` type, which lives in `log.ts`. The change is one optional
  > `fallback?: boolean` field (undefined on primary → primary log lines byte-unchanged) +
  > logging the actual `model` on failed attempts. Additive, no behaviour change. Accepted.
  > (2) The absent-vs-empty resolution is **correct**: you built the authoritative reading —
  > SPEC-007 §Configuration table + `.env.example` (absent ⇒ default `pro,flash`; explicit
  > empty/blank ⇒ `[]` disabled). The conflicting line was in this TASK's own "What to do"
  > prose (my wording slip), and the SPEC governs. No flip wanted. Nothing to change.

## Review
**Verdict: DONE.** Reviewed 2026-08-25 by Sober at `4bfc21e` (parent `75acb5f`,
`git status` clean; HEAD = `4bfc21e`). Review only — no code, no SQL, no environment touched.

**Verified, not trusted — gates re-run by me in `code-report-back` at `4bfc21e`:**
`bun run typecheck` → exit 0; `bun test` → **287 pass / 0 fail** (801 expect, 20 files) —
matches Jason's evidence exactly (was 274/0 at `75acb5f`).

**Files touched = the allowed set.** `git show --stat 4bfc21e` = `config.ts`, `.env.example`,
`client.ts`, `routes.ts`, `log.ts` + the two test files only. `pipeline.ts` / `curiosity.ts` /
`worker.ts` / `WorkerOptions` / wire mapping / DB confirmed absent from the diff (SPEC D6,
DoD row 3). The one file outside the DoD's named list — `log.ts` — is required by D6d (see
Q-BE-29 answer above); accepted.

**Conformance traced read-only against SPEC-007 §Fallback + D6 and all four DoD rows:**
- **D6a trigger** — `shouldFallBack(f) = f.retryable === true`. Cross-checked against the
  `Failure` classification (`client.ts` L199–252 + `parseResult` L153–189): the retryable set
  is exactly `timeout` / `network-error` / `http-error` 5xx / `service-error` `success:false`
  — the SPEC's fallback family — while a **non-retryable 4xx** and the malformed-response
  `service-error` cases (`success:true` missing content, non-JSON body, non-object payload) are
  `retryable:false`. So the predicate is a precise, self-consistent encoding: a 4xx we built
  wrong throws immediately as today, never burning a second model's quota.
- **D6b clamp** — each call sends `min(request.max_tokens, modelCaps[model])`; an uncapped/
  unknown model keeps its own budget. A 40000/50000 stage falling back to a 30000-capped model
  degrades to a shorter completion rather than failing (the SPEC/ Q-SA-25 trade-off).
- **D6c chain** — `buildModelChain(primary, fallbacks)` prepends the primary then appends
  fallbacks de-duped preserving order (a fallback equal to the primary or a repeat is dropped);
  empty `fallbackModels` ⇒ `[primary]` ⇒ byte-for-byte today's single-model retry-then-throw.
- **D6d log** — `runModel` marks `fallback:true` only on non-primary attempts (undefined on
  primary, so primary lines are unchanged) and now logs the tried `model` on failed attempts.
- **Structure** — the pre-existing per-model retry loop was extracted verbatim into
  `runModel` (returns success or last `Failure`, never throws); `chat()` walks the chain and
  advances only when `shouldFallBack` is true, else throws `AI_UNAVAILABLE` with `last.detail`
  (unchanged terminal behaviour). Client stays config-free (`fallbackModels`/`modelCaps`
  injected by `routes.ts`; no `config.ts` import in the ai layer).

**Config** — `deepseek-v4-flash`=30000 added to `APPROVED_MODEL_CAPS` (Q-REQ008-4);
`loadFallbackModels` reads `AI_FALLBACK_MODELS` raw (absent ⇒ default, explicit-empty ⇒ `[]`),
validates each id against `APPROVED_MODEL_CAPS` (unknown ⇒ fatal `ConfigError`), added to
`describeConfig` (not a secret) + `.env.example`.

**Tests** — the six DoD cases are all present and green: (a) eligible primary exhaustion →
success from next model; (b) fallback `max_tokens` clamped to 30000; (c) primary de-duped out;
(d) non-retryable 4xx does **not** fall back (one call, primary only); (e) empty chain throws as
today; (f) config rejects an unknown fallback id — plus `buildModelChain` de-dup and the D6d
`fallback:true` marker, and 6 config cases. No network (fake model-routed `fetchImpl`).

**Q-BE-29 (both notes) confirmed, neither is a rework** — see the §Questions answer above.

**Policy still pending stakeholder sign-off (Q-SA-25, NON-BLOCKING).** `DONE` = *built and
SA-reviewed*, not shipped. The trigger rule / pro→flash order / 30000-clamp / disable-switch are
env-configurable defaults awaiting Porter→human confirmation **before ship** (same gate as the
D3 model defaults / Q-REQ008-1). Porter owns `DELIVERED`; this verdict does not pre-empt it.
