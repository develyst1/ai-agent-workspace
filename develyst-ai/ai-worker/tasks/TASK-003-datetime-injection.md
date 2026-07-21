# TASK-003: Inject current date/time into every model call

- Source: SPEC-002
- Status: DONE
- Depends on: none

## What to do

Make the AI aware of the real current date/time for every provider, at the single
choke point all call paths pass through.

1. **`src/providers/index.ts` → `callModel`**: before the `switch (merged.provider)`,
   build a date/time preamble and merge it into the messages.
   - Compute now in UTC and in a configurable timezone:
     - `AI_DATETIME_TZ` from env, default `"Asia/Bangkok"`.
     - Format e.g.: `Current date/time: <ISO with tz offset> (<tz>) / <ISO Z> (UTC). Treat this as "now".`
       Use `Intl.DateTimeFormat`/`toLocaleString` with `timeZone` for the local
       rendering; `new Date().toISOString()` for UTC. Keep it one short line.
   - Merge rule (important for Gemini, which extracts a single `system` message):
     - If a `system` message exists in `merged.messages`, **prepend** the preamble
       (plus a newline) to that message's `content`.
     - Else, insert a new `{ role: "system", content: <preamble> }` at index 0.
     - Do **not** create a second system message when one already exists.
   - Do this on a copy so you don't mutate the caller's array in place
     (build a new `messages` array; `callMultipleModels`/fallback reuse configs).
   - Optional global switch `AI_INJECT_DATETIME` (default on) is acceptable but not
     required — keep it simple; a plain always-on injection is fine.
2. No provider-file changes; no request/response contract change. This must work
   for openai, gemini, xai, deepseek, single + `/multi` + fallback paths.

Keep it surgical — only `callModel` changes. Match existing Thai-comment style.

## Definition of Done

- [ ] `bun run demo` (or a Bruno/curl `/chat` call with a valid project key) asking
      **"What is today's date?"** returns the **actual current date** (2026-07-21
      or later), not a training-cutoff date. Paste the response.
- [ ] Verified the injection appears for a provider that uses a system message AND
      one that doesn't (e.g. a request with a `system` msg → preamble prepended;
      a request with only a `user` msg → new system msg added). A quick log/console
      of the outgoing `messages` for one call is enough evidence (do not leave that
      debug log in the committed code).
- [ ] Gemini path still works (system extraction not broken by the injection).
- [ ] `bunx tsc --noEmit` — no new errors.
- [ ] Existing plain calls still return the same `AIResponse` shape.

## Implementation Notes

### Files changed
- **`src/providers/index.ts`** (only file touched) — two small helpers + one line in
  `callModel`:
  - `buildDateTimePreamble()` — `now = new Date()`; UTC via `toISOString()`; local
    render via `Intl.DateTimeFormat("en-CA", { timeZone, …, hourCycle:"h23",
    timeZoneName:"longOffset" })` → `YYYY-MM-DDThh:mm:ss±hh:mm`. Timezone from
    `AI_DATETIME_TZ` (default `"Asia/Bangkok"`). Bad tz → falls back to UTC (never
    throws). Output is one line:
    `Current date/time: <local> (<tz>) / <utc> (UTC). Treat this as "now".`
  - `injectDateTime(messages)` — **does not mutate** the caller's array. If a
    `system` message exists → returns a new array with the preamble **prepended**
    to that one message's content (keeps a single system message, so Gemini's
    single-`systemInstruction` extraction stays correct). Else → new array with a
    fresh `{role:"system", content:preamble}` at index 0.
  - `callModel` now sets `messages: injectDateTime(config.messages)` inside the
    existing `merged` object. Because a **new** array/objects are built, the
    fallback chain (which reuses `base.messages` across providers) and `/multi`
    never double-inject or mutate shared state.
- No provider files, no request/response contract, no `AIResponse` shape change.
  Added `ChatMessage` to the existing type import.

### Verification (live on :3009, valid project key, provider=gemini)
- **DoD #1 — real date:** "What is today's date?" → **`2026-07-21`** (the actual
  current date, not a training-cutoff date). HTTP 200, `success:true`.
- **DoD #2 — both merge branches** (temporary `console.log` of outgoing messages,
  since removed — confirmed absent via `grep`):
  - no system msg → injected at index 0:
    `[{"role":"system","content":"Current date/time: 2026-07-21T18:35:12+07:00 (Asia/Bangkok) / …Z (UTC). Treat this as \"now\"."},{"role":"user",…}]`
  - system msg present → prepended, still a single system msg:
    `{"role":"system","content":"Current date/time: … (UTC). Treat this as \"now\".\nYou are terse."}` (original `"You are terse."` preserved after the preamble).
- **DoD #3 — Gemini still works:** both calls above ran on `gemini-2.5-flash-lite`
  and returned 200 with the correct date → system extraction not broken.
- **DoD #4:** `bunx tsc --noEmit` → no errors in `src/**`.
- **DoD #5:** success envelope/`AIResponse` shape unchanged (same fields as before;
  injection is inbound-only).
- Local offset rendered correctly (`+07:00` for Asia/Bangkok) alongside the UTC form.

### Notes for review
- Kept it always-on (no `AI_INJECT_DATETIME` flag) per "keep it simple" in the TASK.
  `AI_DATETIME_TZ` is honoured (default Asia/Bangkok). Easy to add a kill-switch
  later if ops wants one.
- Injection sits in `callModel` (the choke point), so single, `/multi`, and
  fallback all get it for all four providers with one change.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** — 2026-07-21, Sober.

Reviewed the real code (`src/providers/index.ts`).

- **Correct and surgical.** `buildDateTimePreamble` renders local (via
  `Intl…longOffset`, stripped to `±hh:mm`, empty→`+00:00` fallback) + UTC on one
  line; bad `AI_DATETIME_TZ` falls back to UTC without throwing. `injectDateTime`
  does **not** mutate the caller's array and keeps a **single** system message
  (prepends to an existing one, else inserts at index 0) — exactly what Gemini's
  single-`systemInstruction` extraction needs. Placed in `callModel`, the one choke
  point, so single/`/multi`/fallback all get it for all four providers.
- **No double-injection.** `callWithFallback` passes the original `base.messages`
  and `callModel` injects a fresh copy per attempt, so retries don't accumulate
  preambles; `/multi` maps independent configs. Verified by construction + Jason's
  live check.
- **Evidence accepted.** "What is today's date?" → real `2026-07-21`; both merge
  branches confirmed (new system msg vs prepend-preserving-original); Gemini still
  200; `tsc` clean; `AIResponse` shape unchanged (inbound-only). Debug log removed
  (grep-confirmed).

Meets SPEC-002 layer-1 and satisfies REQ-002 AC #1 on its own. No defects.
