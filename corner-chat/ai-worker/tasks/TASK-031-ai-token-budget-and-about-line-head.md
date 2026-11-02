# TASK-031: Fix DEF-1 (AI answers cut off by the token budget) + the about line's head and word-boundary cut
- Source: SPEC-001 §6 steps 2–5 (amended 2026-11-01, DEF-1 note) · REQ-004 AC-6, AC-10 · TEST-003 § Defects DEF-1 (QA Tanya,
  BLOCKER) · REQ-004 § Questions (PM wording 2026-11-01: display name / part before `@`; cut at a word boundary with `…`)
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-01)
- Depends on: TASK-006, TASK-023 (DONE)

- Repo: `corner-chat-back` — Team A claim · git writes: **none**
- Files you may edit (closed list): `src/filter/ai.ts`, `src/filter/gateway.ts`, `src/filter/pipeline.ts` (`buildAboutLine` only),
  `src/config.ts` (one key), `.env.example` (one key), `migrations/202611010003_core_ai_calls_tokens.sql` (new),
  `test/ai-layers.test.ts`, `test/filter-rules.test.ts`, `test/messages-api.test.ts`

## Why (the cause, proven — not a guess)
Read SPEC-001 §6, the "DEF-1" note under step 5. Short version: deepseek spends hidden reasoning tokens out of `max_tokens`
before it writes the JSON. With 300, a must-hold message (H07) failed 10 times in 16, and **each failure had
`completion_tokens` exactly 300**. With 1500 it failed 0 times in 16, but one call used 1268. The probe is
`../ai-worker/tests/harness/def1-probe/probe.ts`.

## What to do
1. `ai.ts`: `max_tokens` **4096** for both layers (was 300).
2. Per-call timeout **40 s** (was 20 s), read from a new `.env` key `LLM_TIMEOUT_MS` (default `40000`) through `config.ts`. Add it to
   `.env.example`. Timeout and unreachable → still **no** retry (SPEC-001 §6 step 5); empty or unusable → still one retry.
3. Migration `202611010003_core_ai_calls_tokens.sql`, **exactly**: `ALTER TABLE ai_calls ADD COLUMN completion_tokens int;`.
   `gateway.ts` passes `usage.completion_tokens` through when present (it may be missing), and every `ai_calls` row stores it.
4. `buildAboutLine` (PM wording, SPEC-001 §6 step 4):
   - the mail head shows the sender's **display name**; with no display name (`sender_name` empty or equal to the address),
     the part **before `@`**. LINE is unchanged (group name or sender name).
   - over 80 characters → cut at the last **word boundary**, found with `Intl.Segmenter("th", { granularity: "word" })`, such
     that the line plus `…` is ≤ 80. Never mid-word. Thai and Latin are both covered by the segmenter.
   - the rule line (`ตรงกฎของคุณ: …`) follows the same head and cut rules.

## Definition of Done (paste real output)
- [ ] Tests: `max_tokens` 4096 sent on both layers · `LLM_TIMEOUT_MS` honoured (a short value in the test) · `completion_tokens`
      stored, and null when `usage` is missing · mail head: `"Anna Lee" <anna@x>` → `Anna Lee`; `anna@x` → `anna` · a long
      Thai summary is cut at a word boundary + `…`, ≤ 80 (assert that the character before `…` ends a segmenter word).
- [ ] `bun run migrate` on your own throwaway DB applies `…0003`; whole tree `bun run test` green; `tsc` 0; `git status` → closed list only.
- [ ] **Real gateway, small (the SA authorises this probe for this TASK only):** from `corner-chat-back`,
      `bun ../ai-worker/tests/harness/def1-probe/probe.ts 4 4096` → paste the three lines. Expected: `empty 0 · invalid JSON 0`,
      `at budget 0`, and the latency line (it tells whether 40 s is enough). Then the 3-message `sample.json` run with
      `run-corpus.ts … --runs 1 --allow-production`. The full 30 × 3 corpus re-run is **QA's**, not yours.
- [ ] No server on the shared dev DB; any live check on a throwaway DB and your own port (DECISIONS 2026-11-01).

## Implementation Notes
Test-first (RED: 11 of the 89 tests in the three files failed on exactly the intended gaps — the other tests that pin behaviour that must not change, "LINE unchanged" and "a line ≤ 80 is left alone", passed before and after — then GREEN). Working tree only, no git. 2026-11-01. No server was started for this TASK; the only live things are the two authorised real-gateway calls below and a throwaway database for the migration.

**What changed (closed list; nothing else):**
- `src/filter/ai.ts` — `MAX_TOKENS` **4096** for both layers (was 300), with the DEF-1 reason in a comment. `CallLog` gains `completionTokens`; every `ai_calls` row stores it (`null` for a try that never got an answer, or when the gateway sent no `usage`). Timeout and unreachable are still **not** retried; empty / unusable answers still get their one retry.
- `src/filter/gateway.ts` — `GatewayReply.completionTokens` = `usage.completion_tokens` when it is a whole number, else `null`. `gatewayFrom(config)` now passes `config.llmTimeoutMs`. (I left `createGateway`'s own fallback at 20 s: the back end always goes through `gatewayFrom`; see Questions.)
- `src/config.ts` + `.env.example` — one key, `LLM_TIMEOUT_MS`, default **40000**; a non-number is refused at start-up like the other numeric keys.
- `migrations/202611010003_core_ai_calls_tokens.sql` — exactly `ALTER TABLE ai_calls ADD COLUMN completion_tokens int;`.
- `src/filter/pipeline.ts` (`buildAboutLine` only) —
  - **mail head:** the sender's display name; if the stored name is an address (that is how a mail with no display name is stored), the part **before `@`** (`anna@example.test` → `anna`, `Anna.Lee+tag@Example.TEST` → `Anna.Lee+tag`); LINE is unchanged (group name, else sender name — even if that looks like an address).
  - **cut:** a line over 80 characters is cut after the last whole word that leaves room for `…` (`Intl.Segmenter("th", { granularity: "word" })`, which splits Thai and Latin), trailing space trimmed, result ≤ 80. A line already ≤ 80 is returned as it is. If no word boundary fits (one endless token) it falls back to a plain cut of 79 + `…`.
  - the rule line (`ตรงกฎของคุณ: …`) goes through the same head and cut; an `ai_unavailable` decision is still `null`.
  - No caller changed: the API and the push already pass the stored `sender_name`.

**Decided alone (declared):** "no display name" is detected from the stored name looking like an address (`x@y`), because `buildAboutLine` is not given the sender's address and the callers are not on this TASK's list; the poller always stores the address when there is no name, so the case cannot reach it empty. The segmenter is created once at module load.

**Evidence (real output):**
- RED run, then GREEN: `bun run test --timeout 30000 test/ai-layers.test.ts test/filter-rules.test.ts test/messages-api.test.ts` → `89 pass · 0 fail`, three runs in a row. Whole tree `bun run test` → `367 pass · 0 fail · Ran 367 tests across 21 files [25.66s]`. `tsc --noEmit` → exit 0.
- DoD tests: `max_tokens: 4096` on **both** layers (the request the mock gateway received) · `LLM_TIMEOUT_MS` default 40000, read from the environment (`"150"` → 150, `"soon"` refused), and a gateway built from that config gives up after the short value (`gateway did not answer within 120 ms`, `retry === false`) · `completion_tokens` stored in `ai_calls` from `usage` (1) and `null` when `usage` is missing (checked in the table, and the column is `integer`), and `null` on a try that never got an answer · mail head `Anna Lee` → `Anna Lee`, `anna@example.test` → `anna`, plus the same in the real API list and detail · a long Thai summary cut at a word boundary + `…`, whole line ≤ 80, and the test asserts the character before `…` ends a segmenter word and that it is the LAST boundary that leaves room · a long Latin summary cut at a space · a rule line cut the same way · an endless token still fits in 80.
- `bun run migrate` on a throwaway database → `Applied: 202611010001_core_init.sql, …0002_core_ai_defaults.sql, …0003_core_ai_calls_tokens.sql, …0100_line_init.sql`; column `completion_tokens integer nullable=YES`; a second run → `Nothing to apply.`; database dropped.
- **Real gateway, as the TASK authorised (this TASK only):** from `corner-chat-back`, `bun …/def1-probe/probe.ts 4 4096` →
  ```
  deepseek-v4-pro max_tokens=4096 · 16 calls · empty 0 · invalid JSON 0
  completion_tokens max 1231 · at budget 0
  latency ms median 5609 · max 17813
  ```
  So the empty / cut-off failures of the 300 budget are gone, the biggest answer used 1231 tokens (a 300 budget would have cut it), and the slowest call took 17.8 s, well inside 40 s. Then `run-corpus.ts sample.json --runs 1 --allow-production` (layer 1 `deepseek/deepseek-flash`, layer 2 `deepseek/deepseek-v4-pro`) → S1 **100**, S2 **0**, S3 **90**, no errors, every message right at every bar 50–90, `highest bar 0–100 meeting the line: 90`. The full 30 × 3 corpus run is QA's, not mine. In total I made 22 small real calls (16 + 6).
- For that run I made one change in the **harness** (outside the repo): `run-corpus.ts` now builds its gateway with `LLM_TIMEOUT_MS` (default 40000), because it does not read the back end's config.
- `git status` (checked with `find … -newermt "2026-11-01 16:25"` over the repo, excluding `node_modules`, `.local`, `dist`, `.git`): exactly `.env.example src/config.ts src/filter/{ai,gateway,pipeline}.ts migrations/202611010003_core_ai_calls_tokens.sql test/{ai-layers,filter-rules,messages-api}.test.ts` — the closed list, nothing else. No server of mine is running.

**UNVERIFIED:** the full corpus (30 × 3) at 4096 and 40 s — QA's run; how often a call exceeds 40 s on the real gateway (my 16-call probe topped out at 17.8 s, 22 calls is a small sample); and the worst case SPEC-001 already accepts: a hanging gateway still delays the fail-open notification by up to 2 × 40 s.

## Questions
- For the SA: (1) `createGateway`'s own fallback timeout is still 20 s; every real path goes through `gatewayFrom(config)` (40 s), and the corpus runner now reads `LLM_TIMEOUT_MS` too. Say if you want the library fallback raised to 40 s as well (a one-line change, nothing depends on it today). (2) The mail head decides "no display name" by the stored name looking like an address (see above) — fine, or should the callers pass `sender_key` so it is explicit?

  > answer (SA Sober, 2026-11-01): (1) Leave `createGateway`'s 20 s fallback. Nothing uses it, and every real path reads
  > `LLM_TIMEOUT_MS`. Raise it the next time a TASK touches `gateway.ts`. (2) Detecting "looks like an address" is fine:
  > the poller stores the address when a mail has no name, so the case is fully covered.

## Review
**Verdict: DONE** — SA Sober, 2026-11-01. Fixes DEF-1's proven cause (SPEC-001 §6).
- **Re-run by me:** `bun run test` → `367 pass · 0 fail [21.62s]` · `tsc` 0 · `migrations/…0003` = exactly `ALTER TABLE ai_calls
  ADD COLUMN completion_tokens int;` · `ai.ts:59` `MAX_TOKENS = 4096` · `pipeline.ts:63/81` a single `Intl.Segmenter("th")`.
- **Your real-gateway evidence settles it:** 16 calls with `empty 0 · invalid JSON 0 · at budget 0`, a peak of 1231 tokens (300
  would have cut that answer), the slowest call 17.8 s (inside 40 s); `sample.json` → 100 / 0 / 90, all correct at every bar. 22 real calls,
  inside the authorised probe.
- **Accepted:** the word-boundary cut with an endless-token fallback, the display name or the part before `@`, the rule line
  through the same path, the harness runner reading `LLM_TIMEOUT_MS`.
- **Left to QA:** the full 30 × 3 corpus re-run (AC-6).
Security review: not applicable — no auth, input-handling, secret or data-exposure change. It is the token budget, a timeout
setting, one log column and display text.
