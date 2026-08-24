# TASK-027: BE — the 5-stage pipeline (linear stages + prompts + assembly)
- Source: SPEC-007
- Status: TODO
- Assignee: Jason (BE)
- Depends on: TASK-025 (per-stage config + client fields). AI_CURIOUSNESS's loop
  body is TASK-028; this task lands with a pass-through investigator so it is
  independently testable.
- Written: 2026-08-24 by Sober (SA Lead)
- Amended: 2026-08-24 by Sober (Q-BE-25 ruling — the `client.ts` required-field flip,
  originally TASK-025 §1, moved here so the contract change lands with its sole caller
  in one green commit; see TASK-025 §Questions).

## Why this exists
Replace the 3-stage `runPipeline` with the 5-stage flow of REQ-008:
`AI_PROJECT → AI_COMMITS → AI_CURIOUSNESS → AI_UNDERSTANDING → AI_WRITING`, each
call threading its per-stage `model` + `max_tokens`. Full flow, ordering, and the
recorded design decisions (D2 assembly, D4 curiosity-protocol boundary, D-wire):
**SPEC-007 §Flow and §Questions** — read them; not repeated here.

## What to do

### 0. `src/ai/client.ts` — always send `model` + `max_tokens` (moved from TASK-025 per Q-BE-25)
- On `ChatRequest`, make `model: string` and `max_tokens: number` **required** (today
  `max_tokens?` is optional and there is no `model` field — see `client.ts` L47–53).
- In `chatBody`, **always** set `body.model` and `body.max_tokens` (today it sets
  neither `model` nor an unconditional `max_tokens`). Keep `provider` absent and
  `temperature` optional exactly as now. Contract allows both (`AI-API-CENTER.md`:
  `{ provider?, model?, temperature?, max_tokens?, messages }`).
- Delete the stray `console.log("request:", request)` in `chatBody` **only if present**
  (it is already absent in the working tree — do not re-add it to delete it).
- No change to auth, retry (`MAX_ATTEMPTS`), timeout, `{success,data}` envelope
  parsing, or the log-line shape.
- This compiles green **in this task** because §3 below updates the three
  `pipeline.ts` call sites (L84/97/111 — the only callers of `client.chat` in `src/`)
  to pass the stage's `model`+`max_tokens` from `Config.aiStages` (TASK-025). Nothing
  outside `pipeline.ts` consumes `ChatRequest`.
- Extend `test/ai-client.test.ts`: `chatBody` includes `model` and `max_tokens` for a
  request that supplies them.

### 1. `src/ai/stages.ts` — five stage names
- `AI_STAGES = ["AI_PROJECT","AI_COMMITS","AI_CURIOUSNESS","AI_UNDERSTANDING","AI_WRITING"]`.
  These are the **internal / log** stage names. The **wire** stage set stays six
  (D-wire) — the mapping to the wire lives in the worker (TASK-028), NOT here.

### 2. `src/ai/prompts.ts` — prompts for the new/changed stages
- Keep `stage1Messages` (AI_PROJECT) and `stage2Messages` (AI_COMMITS, batching +
  `COMMITS_PER_BATCH = 20` unchanged).
- **AI_UNDERSTANDING** messages: given `profile` + `batchSummaries` + `findings`,
  system prompt must instruct the model to write **its own reasoned understanding
  as a block of thought** (what things are, where they connect, dependencies) and
  **explicitly not** to translate/pass the inputs through. Output is
  `understanding` text, not report prose.
- **AI_WRITING** messages, two kinds:
  - a **topic-plan** message: given `understanding` + `batchSummaries`, return an
    **ordered list of ≤ `maxPasses` topics** (parseable — a fenced JSON array).
  - a **per-topic writing** message: writes that topic's section in
    `params.language`, told the full ordered topic list + which one it is writing,
    so sections do not overlap. Reuse `stage3System(language)` tone/`REPORT_STRUCTURE`
    guidance as the base.
- Keep the `REPO_OPEN/CLOSE` and `CONTEXT_OPEN/CLOSE` data-fencing discipline for
  all model inputs.

### 3. `src/ai/pipeline.ts` — the 5-stage orchestration
- `PipelineInput` gains: per-stage config (`{ model, maxTokens }` for each of the
  five, plus `curiosityMaxIterations`, `writingMaxPasses`), a `RepoInspector`
  (TASK-026), and a `CuriosityInvestigator` (see §4). Every `client.chat` call now
  passes the stage's `model` + `max_tokens`.
- Order: AI_PROJECT (×1) → AI_COMMITS (×N, **keep the existing sequential loop**) →
  **AI_CURIOUSNESS** (delegate to `investigator.investigate({profile, batchSummaries,
  inspector, ...})` → `findings`) → **AI_UNDERSTANDING** (×1) → **AI_WRITING**
  (plan call, then one pass per topic, sequential).
- **Assembly (D2):** the final report is the **deterministic ordered concatenation**
  of the topic sections behind a fixed header from `formatReportParams` — **no extra
  AI stitch call**. A 1-topic plan ⇒ a single pass (today's behaviour).
- `announce`/`onStage` still emits the **internal** stage name; the worker maps it.
- `PipelineResult` extends to carry `understanding`, `findings`, `topics`, and an
  updated `calls` count.

### 4. `CuriosityInvestigator` seam (loop body is TASK-028)
- Define `interface CuriosityInvestigator { investigate(input): Promise<string> }`
  in the ai layer. **This task ships a trivial pass-through implementation**
  (returns empty `findings`, makes no extra AI call) so the pipeline is complete and
  testable now; TASK-028 supplies the real loop and wires it in the worker.

## Definition of Done
- [ ] `ChatRequest.model`/`max_tokens` **required**; `chatBody` always emits both;
      stray `console.log` absent. (moved from TASK-025 per Q-BE-25)
- [ ] `test/ai-client.test.ts` asserts `chatBody` includes `model` + `max_tokens`.
- [ ] `AI_STAGES` has the five internal names; pipeline runs the five stages in the
      REQ order; AI_COMMITS still sequential at 20/batch.
- [ ] Every `client.chat` call passes a `model` + `max_tokens` from per-stage config.
- [ ] AI_UNDERSTANDING produces its own understanding text (own prompt); AI_WRITING
      plans ≤ maxPasses topics then writes one section per pass; final report is the
      deterministic concatenation (no stitch call).
- [ ] `CuriosityInvestigator` interface exists with a pass-through impl; pipeline
      compiles and runs against a fake `AiClient` + fake `RepoInspector` +
      pass-through investigator.
- [ ] Unit tests (extend `test/ai-pipeline.test.ts`): five stages called in order
      with the right model/max_tokens per stage; N-batch sequential commits; writing
      pass-split honours the limit and 1-topic degrades to a single pass; assembly is
      pure concatenation.
- [ ] `bun run typecheck` exits 0 and `bun test` passes (`cd code-report-back`).

## Implementation Notes
(Jason fills in.)

## Questions
(Jason asks; Sober answers as `> answer: ...`.)

## Review
(Sober fills in at REVIEW.)
