# TASK-028: BE — AI_CURIOUSNESS investigation loop (real investigator)
- Source: SPEC-007
- Status: DONE (reviewed 2026-08-25 by Sober at `75acb5f`)
- Assignee: Jason (BE)
- Depends on: TASK-026 (RepoInspector) **and** TASK-027 (pipeline + investigator
  seam + worker wiring). This is the last SPEC-007 task.
- Written: 2026-08-24 by Sober (SA Lead)
- Amended: 2026-08-24 by Sober (Q-BE-26 ruling → Option A — the **worker wiring** and
  the **internal→wire stage mapping** moved into TASK-027, so the client/pipeline
  contract change lands green with its sole caller `worker.ts`. This task is now the
  **real investigator loop** that swaps in for the pass-through, plus the env
  end-to-end check. See TASK-027 §Questions Q-BE-26).

## Why this exists
Implement the real AI_CURIOUSNESS loop (REQ-008 stage 3) behind the
`CuriosityInvestigator` seam TASK-027 already built and wired (pass-through) into the
worker. This task supplies the **real** loop body over the live clone's `RepoInspector`
and swaps it in for the pass-through at the worker's construction site. The worker
wiring itself and the internal→wire stage mapping already exist from TASK-027 (Q-BE-26
Option A) — do not re-do them. Full flow + the text-action protocol + exit rules:
**SPEC-007 §Flow step 3, §"Data-safety bounds", and §API/Interface Design (wire
contract, D-wire)** — read them.

## What to do

### 1. `src/ai/curiosity.ts` — the real investigator
Implement `CuriosityInvestigator` as an env-bounded loop
(`AI_CURIOUSNESS_MAX_ITERATIONS`, default 5):
- Each iteration `client.chat` (with `AI_CURIOUSNESS_MODEL`/`MAX_TOKENS`) is sent:
  `profile`, `batchSummaries`, and accumulated `findings`, and asked to (a) judge
  what is still missing to understand the code, and (b) request inspections.
- **Text action protocol (D4):** parse a fenced JSON block of actions from the
  model's `content` — vocabulary **exactly** `list_tree`, `read_file` (with `path`),
  `search` (with `word`), or terminal `{"done": true}`. Execute each via the injected
  `RepoInspector` (TASK-026 — already path-confined + capped). Feed results back on
  the next iteration **wrapped as repository DATA** (`REPO_OPEN`/`REPO_CLOSE`, never
  as instructions).
- **Exit** on any of: `{"done": true}`, no parseable/actionable request, or the
  iteration cap — whichever first. **Unparseable ⇒ safe exit** (treat as "nothing
  missing", return findings so far) — never throw the whole job on a malformed model
  reply.
- Return the accumulated `findings` text.

### 2. `src/reports/worker.ts` — swap the real investigator in (wiring already exists)
- TASK-027 (Q-BE-26 §5) already built `createRepoInspector(clone.dir)` + a
  **pass-through** investigator inside the `withClone(...)` callback and threaded the
  per-stage config through `WorkerOptions` + `routes.ts`, and it already added the
  internal→wire stage mapping at `onStage` (`AI_CURIOUSNESS → "AI_COMMITS"`,
  `AI_UNDERSTANDING → "AI_WRITING"`, `progress.total` stays six). **Do not re-do any
  of that.**
- **This task's only worker edit:** replace the pass-through investigator with the
  real one from §1 (`src/ai/curiosity.ts`) at that same construction site, passing it
  the injected per-job `AiClient` + the `RepoInspector` + `aiCuriosityMaxIterations`.
- The `NO_COMMITS` short-circuit, clone-always-deleted behaviour, mapping, and
  `progress.total = 6` are all unchanged from TASK-027.

### 3. Env end-to-end
- Verify per-stage `model` + `max_tokens` actually reach the wire body (changing an
  env value changes what the call sends), per REQ-008 AC 3 — this now includes the
  AI_CURIOUSNESS call, which only becomes live in this task.

## Definition of Done
- [ ] AI_CURIOUSNESS loops ≤ env limit (default 5), drives `list_tree`/`read_file`/
      `search` via `RepoInspector`, exits early on `done`/unparseable/no-request, and
      never aborts the job on a malformed reply.
- [ ] The **real** investigator replaces the pass-through at the worker's construction
      site (built in TASK-027); the inspector/config threading and the internal→wire
      mapping from TASK-027 are reused unchanged (`progress.total` stays 6, no
      DB/migration/wire-shape change).
- [ ] Env values for the AI_CURIOUSNESS stage's `model`/`max_tokens` demonstrably
      change the sent body (test asserts the fake client received the configured
      values), completing REQ-008 AC 3 for the one stage that was inert under the
      pass-through.
- [ ] Tests: `test/ai-curiosity.test.ts` (loop honours cap, executes each action
      type against a fake inspector, exits on `done` and on unparseable, DATA-fences
      results). The `reports-worker.test.ts` wire-stage mapping assertions already
      land green in TASK-027; add here only what the real curiosity loop newly
      exercises (e.g. a real AI_CURIOUSNESS call appears in the recorded call log).
- [ ] `bun run typecheck` exits 0 and `bun test` passes (`cd code-report-back`).

## Implementation Notes
Done 2026-08-25 by Jason (BE). Commit `75acb5f` (parent `23df16f`), working tree clean.

**Files**
- `src/ai/curiosity.ts` (new) — the real `curiosityInvestigator: CuriosityInvestigator`.
  Stateless: every input (per-job `AiClient`, the clone's `RepoInspector`, per-stage
  `model`/`maxTokens`, `maxIterations`, `profile`, `batchSummaries`, `extraContext`)
  arrives on `CuriosityInput` from the pipeline, so one shared instance is injected.
  - Loop `for round 1..maxIterations`: `client.chat({ stage: "AI_CURIOUSNESS", model,
    max_tokens: maxTokens, messages })`, parse the reply, execute actions, feed results
    back next round.
  - **Text action protocol (D4):** `parseActions` (exported, unit-tested) reads a fenced
    (or bare) JSON block. Accepts a top-level `{"done": true}`, a bare action array, or
    an `{"actions": [...]}` wrapper. Vocabulary exactly `{"action":"list_tree"}`,
    `{"action":"read_file","path":…}`, `{"action":"search","word":…}`; unknown/incomplete
    items are dropped; paths/words are trimmed; a `{"done":true}` element terminates the
    batch. Returns `done` | `actions` (non-empty) | `stop`.
  - **Exit** on `done`, on `stop` (unparseable JSON, or a well-formed reply with no
    actionable request), or on the iteration cap — whichever first. **`JSON.parse` is in
    try/catch; a malformed reply is `stop`, never a throw** — the job is never aborted on
    a bad model turn.
  - **Results fed back as DATA:** each round's inspector output is accumulated and, on the
    next turn, wrapped with `repoBlock(...)` (`REPO_OPEN`/`REPO_CLOSE`) — reused verbatim
    from `prompts.ts`, same posture as all other repo material.
  - **Return** = the accumulated inspection records (raw, unwrapped). `understandingMessages`
    already wraps `findings` in `repoBlock`, so no double-fencing; `""` when nothing gathered
    (matches its "none gathered" branch). Bounds are the inspector's own (TASK-026):
    path-confinement + `MAX_CHARS_PER_FILE`/`MAX_TREE_PATHS`/`MAX_SEARCH_HITS`.
- `src/reports/worker.ts` — the single edit the TASK allows: import `curiosityInvestigator`
  and pass it in place of `passThroughInvestigator` at the existing construction site (comment
  updated). `createRepoInspector(...)`, the `WorkerOptions`/`routes.ts` config threading and the
  internal→wire mapping are all TASK-027's and untouched (`progress.total` stays 6).
- `test/ai-curiosity.test.ts` (new, 14 tests) — exit conditions (done / unparseable /
  no-actionable / cap), each action type driven through a recording fake inspector, results
  fenced back as REPO DATA on the next turn, a refused path still recorded without aborting,
  the configured `model`+`max_tokens` on every call body (REQ-008 AC 3), and `parseActions`
  vocabulary units.
- `test/reports-worker.test.ts` — one added test: the now-live AI_CURIOUSNESS stage makes a
  real call carrying `TEST_AI_STAGES.AI_CURIOUSNESS` model/budget (inert under the pass-through).

**Verification (evidence)**
- `bun run typecheck` → exit 0.
- `bun test` → **274 pass / 0 fail** (771 expect, 20 files) — was 259 before; +15 new.
- Targeted: `bun test test/ai-curiosity.test.ts test/reports-worker.test.ts` → 28 pass / 0 fail.

**For review — notes for Sober**
- No `WorkerOptions`/`routes.ts`/mapping change; no DB/migration/wire-shape change (DoD).
- No new user-facing string: `CURIOSITY_SYSTEM` is a model-facing stage prompt (engineering,
  like the other stage prompts), and the JSON action vocabulary is SPEC-007 D4 verbatim — no
  business/product copy invented, no scope guessed. No questions raised.
- Q-SA-24 (D2 header / dropped Contributors-appendix) is TASK-027's business-scope item and is
  untouched here; it does not gate this task.

## Questions
(Jason asks; Sober answers as `> answer: ...`.)

## Review
**DONE — reviewed 2026-08-25 by Sober at `75acb5f`** (parent `23df16f`, 4 files,
`git status --porcelain` clean). Review only — no code written, no SQL, no
environment touched.

**Gates re-run by me** (not trusted from the report), clean tree at `75acb5f` in
`code-report-back`:
- `bun run typecheck` → exit 0.
- `bun test` → **274 pass / 0 fail** (771 expect, 20 files) — matches Jason's
  evidence exactly (was 259/0 at `23df16f`; +15 new).

**Conformance traced read-only against SPEC-007 §Flow 3 + D4 + D5 and all four DoD rows:**
- **Loop + exit (DoD 1).** `curiosityInvestigator.investigate` loops `round 1..maxIterations`
  (`AI_CURIOUSNESS_MAX_ITERATIONS`, default 5); `parseActions` returns `done`/`actions`/`stop`
  and any non-`actions` result breaks the loop — so it exits on `{"done":true}`, on an
  unparseable reply, on a well-formed reply with no actionable request, or on the cap,
  whichever first. `JSON.parse` is in try/catch → a malformed reply is `stop`, never a throw;
  the job is never aborted on a bad model turn. Tests prove all four exit paths + the cap.
- **Action protocol drives the bounded inspector (DoD 1).** `executeActions` calls only
  `inspector.listTree/readFile/search`; the D4 vocabulary is exactly
  `list_tree`/`read_file(path)`/`search(word)` + terminal `{"done":true}`, unknown/incomplete
  items dropped, paths/words trimmed. Bounds are TASK-026's own (path-confined + `MAX_*` caps);
  a refused/missing path returns a typed sentinel that is still recorded without aborting (test).
- **Results fed back as DATA, not instructions (D5).** Next-turn observations are wrapped with
  `repoBlock(...)` (`REPO_OPEN`/`REPO_CLOSE`, reused verbatim from `prompts.ts`); test asserts
  the fenced block appears in the second call's prompt and the first turn shows "none yet".
- **No double-fencing.** `investigate` returns the **raw** accumulated observations; the
  pipeline's `understandingMessages` wraps `findings` in `repoBlock` exactly once (verified in
  `prompts.ts` L332-337), and emits "none gathered." for `""` — matches the investigator's
  `""`-when-nothing branch.
- **Worker swap only (DoD 2).** Diff is the single allowed edit: import `curiosityInvestigator`
  and pass it where `passThroughInvestigator` sat at the existing construction site (+comment).
  `createRepoInspector`, the `WorkerOptions`/`routes.ts` config threading and the internal→wire
  mapping are TASK-027's and untouched; no DB/migration/wire-shape change; `progress.total`
  stays 6.
- **Env end-to-end for the now-live stage (DoD 3, REQ-008 AC 3).** Every `client.chat` in the
  loop carries `stage:"AI_CURIOUSNESS"` + the injected `model`/`max_tokens`; asserted both in
  `ai-curiosity.test.ts` (model `grok-4-latest`, `max_tokens` 12345 on every call) and in the
  new `reports-worker.test.ts` test proving the real call (inert under the pass-through) now
  carries `TEST_AI_STAGES.AI_CURIOUSNESS` model/budget.
- **Tests (DoD 4).** `test/ai-curiosity.test.ts` (14) covers exit conditions, each action type,
  DATA-fenced feedback, refused-path recording, per-call model/budget, and `parseActions`
  vocabulary units; one added worker test. All green.

**No new user-facing string / no scope guessed.** `CURIOSITY_SYSTEM` is a model-facing stage
prompt (engineering, like the other stage prompts); the JSON action vocabulary is SPEC-007 D4
verbatim. `parseActions` is deliberately lenient on the model's *reply* shape (bare array /
`{actions:[...]}` wrapper / top-level `done`) — a safe superset of D4, not a scope change. No
questions raised by Jason; none from me. Q-SA-24 (D2 header / dropped Contributors-appendix) is
TASK-027's business-scope item, untouched here and not gating this task.

**Not closing REQ-008 yet.** TASK-028 was the last *existing* SPEC-007 task, but REQ-008 Req-7
(the `deepseek-v4-pro`/`deepseek-v4-flash` fallback-model behaviour, added when the human
answered Q-REQ008-1 on 2026-08-24) is still un-specced and un-tasked. REQ-008 therefore stays
`IN_SPEC` — designing Req-7 into SPEC-007/config (incl. the `deepseek-v4-flash`=30000 cap) is my
separate next SA unit. Marking SPEC_DONE now would falsely report the requirement as fully built.
