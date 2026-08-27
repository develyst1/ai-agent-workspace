# TASK-027: BE — the 5-stage pipeline (linear stages + prompts + assembly)
- Source: SPEC-007
- Status: REVIEW (implemented + committed 2026-08-24 by Jason; deps TASK-025 `DONE`, TASK-026 `157e5a2`)
- Assignee: Jason (BE)
- Depends on: TASK-025 (per-stage config + client fields), and rests on TASK-026's
  committed base (`157e5a2`). AI_CURIOUSNESS's real loop body is TASK-028; this task
  lands with a pass-through investigator so it is independently testable.
- Written: 2026-08-24 by Sober (SA Lead)
- Amended: 2026-08-24 by Sober (Q-BE-25 ruling — the `client.ts` required-field flip,
  originally TASK-025 §1, moved here so the contract change lands with its sole caller
  in one green commit; see TASK-025 §Questions).
- Amended: 2026-08-24 by Sober (Q-BE-26 ruling → Option A — the **minimal worker
  wiring** needed to keep this task green is folded in here as §5, so the client/
  pipeline contract change lands with its sole production caller `worker.ts` in one
  green commit; the internal→wire stage mapping is now this task's. TASK-028 is
  narrowed to the real investigator loop + env end-to-end. See §Questions Q-BE-26).

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

### 4. `CuriosityInvestigator` seam (real loop body is TASK-028)
- Define `interface CuriosityInvestigator { investigate(input): Promise<string> }`
  in the ai layer. **This task ships a trivial pass-through implementation**
  (returns empty `findings`, makes no extra AI call) so the pipeline is complete and
  testable now; TASK-028 supplies the **real** loop body and swaps it in at the
  worker's construction site (§5) for the pass-through.

### 5. `src/reports/worker.ts` + `src/reports/routes.ts` — minimal worker wiring (added per Q-BE-26 → Option A)
Fold in **only** the wiring required to keep the whole project green with §0's client
flip live — nothing of TASK-028's real investigator loop:
- **Thread the per-stage config into the worker.** Add to `WorkerOptions` (worker.ts
  L33) the per-stage `model`+`max_tokens` set (`Config.aiStages`), plus
  `aiCuriosityMaxIterations` and `aiWritingMaxPasses`. In `routes.ts`'s
  `productionDeps()` (L63 `createReportWorker({...})`) pass these from the already-
  loaded `config` (`loadConfigOrExit()` is right there — TASK-025's `Config.aiStages`).
- **Build the inspector + pass-through investigator in the worker.** Inside the
  existing `withClone(...)` callback (where `clone.dir` is alive, worker.ts ~L198),
  build `createRepoInspector(clone.dir)` (TASK-026) and a **pass-through**
  `CuriosityInvestigator` (§4), and pass them + the per-stage config into `runPipeline`.
- **Internal→wire stage mapping (D-wire) — this task owns it now.** The pipeline
  announces the **internal** names via `onStage`; at the `onStage` callback
  (worker.ts L221 `onStage: (stage) => jobs.setStage(job.id, stage)`) map
  `AI_CURIOUSNESS → "AI_COMMITS"` and `AI_UNDERSTANDING → "AI_WRITING"`; the other
  three internal names pass through unchanged. `JOB_STAGES` and `progress.total` stay
  **six** — no schema/migration, no wire-shape change (REQ-008 backend-only; SPEC-007
  §"Wire contract" D-wire, Q-SA-23).
- **Update `test/reports-worker.test.ts`** to the new reality: the report is D2's
  header + concatenated topic sections (not the single `<<AI_WRITING>>` reply — L157);
  the six announced **wire** stages still equal `[...JOB_STAGES]` after the mapping
  (L165); `stageProgress` still yields exactly six `/6` entries (L168–174). Keep
  every other worker assertion (`NO_COMMITS` short-circuit, clone-always-deleted,
  status transitions) intact.
- **Do NOT** implement the real curiosity loop, the text-action protocol, or
  `src/ai/curiosity.ts` — those stay TASK-028.

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
- [ ] **(Q-BE-26 §5)** `WorkerOptions` + `routes.ts` thread `Config.aiStages` /
      `aiCuriosityMaxIterations` / `aiWritingMaxPasses`; the worker builds
      `createRepoInspector(clone.dir)` + a pass-through investigator and passes them +
      per-stage config into `runPipeline`.
- [ ] **(Q-BE-26 §5)** internal→wire mapping at `onStage` (`AI_CURIOUSNESS`→
      `AI_COMMITS`, `AI_UNDERSTANDING`→`AI_WRITING`, others pass through);
      `progress.total` stays 6, `JOB_STAGES` unchanged, no DB/migration/wire-shape change.
- [ ] **(Q-BE-26 §5)** `test/reports-worker.test.ts` updated for the D2 report shape +
      mapped stages (L157/L165/L168–174) and still green; all other worker assertions
      unchanged.
- [ ] `bun run typecheck` exits 0 and `bun test` passes (`cd code-report-back`).

## Implementation Notes
(Jason, 2026-08-24 — status TODO→IN_PROGRESS→REVIEW.)

**Files changed (11: 6 src, 4 test edits, 1 new test fixture):**
- `src/ai/stages.ts` — `AI_STAGES` expanded to the five internal names.
- `src/ai/client.ts` — §0 flip: `ChatRequest.model`/`max_tokens` now **required**;
  `chatBody` always emits both (`provider` still absent). Module comment rewritten.
  Stray `console.log` confirmed already absent (not re-added to delete).
- `src/ai/prompts.ts` — added `understandingMessages` (AI_UNDERSTANDING: own reasoned
  understanding, not pass-through), `writingPlanMessages` + `parseTopicPlan`
  (`WHOLE_REPORT_TOPIC` fallback, capped/de-duped/fence-tolerant), and
  `writingSectionMessages`/`writingSectionSystem` (per-topic, reuses the
  `LANGUAGE_RULE` + date + no-translate rules of `stage3System` as the base).
  `stage1/2/3` and `formatReportParams` unchanged.
- `src/ai/pipeline.ts` — 5-stage `runPipeline`; `CuriosityInvestigator` interface +
  `passThroughInvestigator`; `PipelineInput` gains `aiStages`/`inspector`/
  `investigator`/`curiosityMaxIterations`/`writingMaxPasses`; `PipelineResult` gains
  `findings`/`understanding`/`topics`. Every `client.chat` threads `aiStages[stage]`.
  Assembly (D2) = `[formatReportParams(params), ...sections].join("\n\n")`, no stitch.
- `src/reports/worker.ts` — §5: `WorkerOptions` gains `aiStages`/
  `aiCuriosityMaxIterations`/`aiWritingMaxPasses`; builds `createRepoInspector(clone.dir)`
  + `passThroughInvestigator` inside `withClone`; `WIRE_STAGE_BY_INTERNAL` map
  (curiosity→AI_COMMITS, understanding→AI_WRITING); `reportStage()` collapses
  consecutive duplicate wire stages so the mapped five surface as the six unique
  `JOB_STAGES` in order. `JOB_STAGES`/`progress.total`/schema untouched.
- `src/reports/routes.ts` — `productionDeps()` threads `config.aiStages` /
  `aiCuriosityMaxIterations` / `aiWritingMaxPasses` (already-loaded `config`).
- `test/fixtures/aiConfig.ts` (new) — `TEST_AI_STAGES` (mirrors shipped D3 defaults),
  the two limits, and `fakeRepoInspector()`.
- `test/ai-pipeline.test.ts` — rewritten for the 5-stage flow (per-stage model/budget
  threading; five stages announced in order incl. AI_CURIOUSNESS; pass-through
  curiosity; topic-plan/section/assembly incl. cap + single-pass degrade;
  findings→DATA wrapping). Data-fencing tests scoped to the reading stages.
- `test/ai-client.test.ts` / `test/reports-worker.test.ts` / `test/reports-routes.test.ts`
  — updated `ChatRequest` literals for the required fields, worker options for the new
  config, and the happy-path assertion to D2's header+sections shape.

**Verification (evidence):**
- `bun run typecheck` → exit 0 (clean).
- `bun test` → **259 pass / 0 fail**, 730 expect() calls, across 19 files — run **3×**,
  identical (was 249/0 at TASK-026's `157e5a2`; +10 net). No flaky auth failure observed
  in any of the three runs.

**Kept strictly in scope:** no real AI_CURIOUSNESS loop, no `src/ai/curiosity.ts`, no
text-action protocol, no end-to-end env verification — all still TASK-028. Worker only
gained the mapping + pass-through construction + config threading, nothing else.

## Questions
(Jason asks; Sober answers as `> answer: ...`.)

- **Q-BE-27 (to @Sober, NON-BLOCKING — scope confirmation, not a blocker; implemented
  literally as SPEC-007 D2 / TASK-027 §3 say).** Two consequences of the D2 assembly
  are worth your eyes before REVIEW, because both are user-facing report changes that the
  SPEC's letter produces but may not have intended:
  1. **The header is `formatReportParams(params)` verbatim.** That function emits
     *prompt-style* text — the report now literally begins with `REPORT PARAMETERS:` /
     `Repository:` / `Period:` / `Branch:` / `Author filter:` (labels written for the
     model, not for a reader). TASK-027 §3 + SPEC-007 D2 both say "a fixed header from
     the existing `formatReportParams`", so I used it as-is rather than invent a cleaner
     markdown header (that would be out-of-scope copy). Did you intend the prompt labels
     to be the visible report header, or should a small reader-facing header helper be
     specced (separate string work)?
  2. **The old fixed `REPORT_STRUCTURE` sections are no longer guaranteed.** The report is
     now a header + the AI's *planned* topic sections; the previously-mandated
     **Contributors** and **Commit appendix** (REQ-001's report structure) are only
     present if the plan model chooses to make them topics. SPEC-007 §Flow 5 replaces the
     writing stage's structure with the by-topic plan and does not carry the appendix
     forward, so I did not synthesise one. Confirm the appendix/contributors are
     intentionally dropped for the 5-stage report, or should the plan prompt be told to
     always include them (or should BE append a deterministic commit appendix)?

  Neither blocks TASK-028 (curiosity swap only) or FE REQ-009 (progress UI). I did not
  guess a redesign — implemented the SPEC as written and surfaced the two effects.

  > answer (Sober, 2026-08-25): **You did exactly the right thing — implement the
  > SPEC's letter and surface the two effects instead of guessing. Neither is a
  > TASK-027 defect: both are consequences of SPEC-007 D2, i.e. of MY design, not of
  > your implementation. TASK-027 is DONE (see §Review).** But I can NOT resolve either
  > effect by assumption here, because both cross into business scope, and my charter
  > forbids me changing business scope or inventing user-facing copy:
  > - **Effect 2 (dropped Contributors + Commit appendix)** changes what a
  >   *previously-delivered* requirement produces. That fixed structure is SPEC-001's
  >   `REPORT_STRUCTURE` (`prompts.ts` L219–226, driven by `stage3System`), which the
  >   new by-topic writer no longer calls — so `stage3*`/`REPORT_STRUCTURE` are now
  >   orphaned and the appendix/contributors are only present if the plan model happens
  >   to pick them. Deciding REQ-001's mandated report shape may be dropped for the
  >   5-stage report is the stakeholder's call, not mine.
  > - **Effect 1 (prompt-style header)** makes `REPORT PARAMETERS: / Repository: /
  >   Period: / Branch: / Author filter:` — labels written for the model — the visible
  >   report header. Whether that copy is acceptable or a reader-facing header helper is
  >   wanted is user-facing string work (cf. REQ-007), which I must not invent.
  > **I am routing both to Porter as Q-SA-24 in SPEC-007 §Questions (NON-BLOCKING).**
  > TASK-028 (curiosity swap) and FE REQ-009 (progress UI) proceed regardless; if the
  > stakeholder wants the appendix restored or a cleaner header, that is a SPEC-007
  > amendment + a NEW task, never a rework of TASK-027 (which faithfully built D2 as
  > specced). I left `stage3*`/`REPORT_STRUCTURE` in place (pre-existing, now dead) —
  > correct not to delete it while its fate is an open scope question.

## Questions
(Jason asks; Sober answers as `> answer: ...`.)

- **Q-BE-26 (to @Sober, BLOCKING) — the TASK-027/TASK-028 worker-boundary conflict.**
  TASK-027's DoD requires `bun run typecheck` = 0 **and** `bun test` passes, but the
  task as written cannot reach that green without doing work that SPEC-007 §Tasks +
  the board assign to **TASK-028** (worker wiring + internal→wire stage mapping).
  This is the same class of sequencing conflict as Q-BE-25 — surfacing it, not
  guessing across the boundary. Concrete facts (read-only at commit `157e5a2`):
  - **The client flip (§0) forces a worker change in THIS task.** Making
    `ChatRequest.model`/`max_tokens` required means every `client.chat` call needs a
    per-stage `model`+`max_tokens`. `pipeline.ts` is the only `client.chat` caller,
    and its sole **production** caller is `src/reports/worker.ts` (L198) — via
    `runPipeline`. So the pipeline must *receive* the per-stage config, which the
    worker must *supply* (from `Config.aiStages`, TASK-025). There is no green
    subset: `bun run typecheck` covers the whole project, so §0 alone (without the
    worker providing config) leaves `pipeline.ts` red. The pipeline+client contract
    change and its sole caller are entangled exactly as in Q-BE-25.
  - **The 5-stage redesign breaks `test/reports-worker.test.ts`, whose fix is
    TASK-028's.** Three assertions fail under the new flow:
    - L157 `expect(job.reportMd).toBe("<<AI_WRITING>>")` — D2 assembly makes the
      report a header + concatenated topic sections, not the single last-call reply.
    - L165 `expect(h.jobs.stages).toEqual([...JOB_STAGES])` — the pipeline announces
      the **internal** names `AI_CURIOUSNESS`/`AI_UNDERSTANDING` (SPEC-007 §Flow +
      §3: "the worker maps it"); without the D-wire mapping the wire gets invalid
      stages, and even *with* the mapping (curiosity→AI_COMMITS, understanding→
      AI_WRITING) the reported sequence has repeats, so it never equals the 6-unique
      `JOB_STAGES`.
    - L168–174 `stageProgress` over the reported stages expects exactly 6 entries.
    The correct fix — the internal→wire stage mapping and updating these worker
    tests — is **explicitly TASK-028** ("worker wiring + internal→wire stage
    mapping; worker maps curiosity→AI_COMMITS, understanding→AI_WRITING").
  - **Why I won't just do it:** pulling the worker plumbing + stage mapping +
    `reports-worker.test.ts` edits into TASK-027 overlaps TASK-028's file
    (`worker.ts`) and pre-empts its assigned design (the mapping) — the exact
    "throwaway/overlap" anti-pattern you rejected as Option 1 in Q-BE-25.

  **Two options (my lean = Option A, mirroring your Q-BE-25 ruling):**
  - **Option A — the contract change lands with its sole caller in one green
    commit.** Widen TASK-027 to include the *minimal* worker wiring: thread
    `Config.aiStages` / `aiCuriosityMaxIterations` / `aiWritingMaxPasses` through
    `WorkerOptions` + `routes.ts`, build `createRepoInspector(clone.dir)` + a
    pass-through investigator in the worker, add the internal→wire stage mapping,
    and update `reports-worker.test.ts` to the new report shape + mapped stages.
    Narrow TASK-028 to the **real** investigator loop body (text-action protocol)
    + end-to-end env verification. Keeps every commit green (your Q-BE-25
    principle) at the cost of TASK-027 owning the stage-mapping design.
  - **Option B — keep the boundary as written, relax TASK-027's DoD.** TASK-027
    stays ai-layer-only (client/stages/prompts/pipeline/pass-through investigator +
    the ai-layer unit tests), and the "make the suite green" worker changes
    (plumbing + mapping + `reports-worker.test.ts`) move to TASK-028. This requires
    dropping "`bun test` passes / typecheck 0" from TASK-027's DoD and accepting a
    **red full suite + red project typecheck between 027 and 028** — against the
    "each task lands green" discipline.

  Please rule which, and (if A) confirm the internal→wire mapping
  (curiosity→AI_COMMITS, understanding→AI_WRITING, wire total stays 6) is mine to
  implement in 027. I did not start any TASK-027 code — one unit this session, and
  I don't guess a scope call. TASK-026 is committed at `157e5a2` (see log).

  > answer (Sober, 2026-08-24): **Option A. And yes — the internal→wire mapping
  > (`AI_CURIOUSNESS`→`AI_COMMITS`, `AI_UNDERSTANDING`→`AI_WRITING`, wire total stays
  > six) is YOURS to implement in TASK-027.** You surfaced this instead of guessing
  > across the boundary — correct, and it is the same class of conflict as Q-BE-25,
  > so it takes the same ruling for the same reason: a required-field contract change
  > must land in ONE green commit with its sole consumer, never leave the tree red
  > "between tasks". Option B's red project typecheck + red suite between 027 and 028
  > violates the "each task lands green" discipline and is rejected on exactly the
  > grounds I rejected Q-BE-25 Option 1.
  >
  > **I verified your load-bearing facts read-only at `157e5a2` before ruling (not
  > trusted):**
  > - `grep -rn "runPipeline" src/` = `pipeline.ts:68` (def) + `worker.ts:198` (the
  >   sole call); `grep -rn "\.chat(" src/` = exactly the three `pipeline.ts` sites
  >   (L84/97/111). So §0's flip forces per-stage config into the pipeline, which only
  >   `worker.ts` can supply — no green subset. Confirmed.
  > - `reports-worker.test.ts` L157 (`reportMd === "<<AI_WRITING>>"`), L165
  >   (`stages === [...JOB_STAGES]`), L168–174 (`stageProgress` × 6) are exactly as you
  >   cited, and `worker.ts` L221 passes the stage name straight through (`onStage:
  >   (stage) => jobs.setStage(job.id, stage)`) — so the mapping's natural home is that
  >   callback. Confirmed.
  > - `routes.ts` `productionDeps()` already calls `loadConfigOrExit()` and constructs
  >   `createReportWorker({...})` at L63, so threading `Config.aiStages` /
  >   `aiCuriosityMaxIterations` / `aiWritingMaxPasses` into `WorkerOptions` there is a
  >   clean extension beside the existing `createAiClient` seam — no new wiring shape.
  >
  > **Boundary, stated so it can't drift (this is the ONLY thing that moves — not a
  > free hand into the worker):** TASK-027 gains the mapping + the *pass-through*
  > investigator construction + config threading + the `reports-worker.test.ts`
  > update, and nothing else of `worker.ts`. **TASK-028 keeps the REAL work:** the
  > `src/ai/curiosity.ts` investigator loop (text-action protocol over `RepoInspector`,
  > env loop cap, safe exit), swapping the real investigator in for the pass-through at
  > the worker's construction site, and the end-to-end env verification (REQ-008 AC 3).
  > I have written §5 into "What to do", added three DoD rows tagged **(Q-BE-26 §5)**,
  > and narrowed TASK-028 to match. **Status: unblocked → `TODO`, startable now.**

## Review
**Verdict: DONE — reviewed 2026-08-25 by Sober at `23df16f` (parent `157e5a2`, own
commit, 11 files as claimed, `git status --porcelain` clean).** Conforms to SPEC-007 and
every DoD row; I re-ran the gates myself (did not trust the claim) and traced the
load-bearing logic read-only.

**Gates re-run by me (evidence):**
- `bun run typecheck` → exit 0 (clean `tsc --noEmit`).
- `bun test` → **259 pass / 0 fail**, 730 expect() calls, 19 files. Matches Jason's
  259/0; no flaky auth failure this run.

**Conformance verified by inspection (not trusted):**
- **§0 client flip (`client.ts`):** `ChatRequest.model`/`max_tokens` now **required**;
  `chatBody` unconditionally emits both, `provider` still absent, `temperature` still
  conditional — matches SPEC-007 §1 / `AI-API-CENTER.md` contract. `test/ai-client.test.ts`
  asserts both fields present. Stray `console.log` confirmed absent.
- **§1 `stages.ts`:** the five internal names, in REQ order.
- **§2 `prompts.ts`:** `understandingMessages` instructs the model to write its OWN
  reasoned understanding and NOT pass inputs through; `writingPlanMessages` returns a
  fenced JSON topic array capped at `maxPasses`; `writingSectionMessages` passes the full
  ordered topic list + which index, reuses `LANGUAGE_RULE`/date rules; `parseTopicPlan` is
  fence-tolerant, deduped, capped, degrades to a single topic on unusable input (no throw).
  `REPO_OPEN/CLOSE` + `CONTEXT_OPEN/CLOSE` data-fencing preserved.
- **§3 `pipeline.ts`:** stages run AI_PROJECT→AI_COMMITS(×N, sequential)→AI_CURIOUSNESS
  (delegated)→AI_UNDERSTANDING→AI_WRITING(plan + one pass/topic); every `client.chat`
  threads `aiStages[stage].model`/`.maxTokens`; assembly (D2) = pure
  `[formatReportParams, ...sections].join("\n\n")`, no stitch call; pipeline stays pure
  (client/inspector/investigator all injected).
- **§4 seam:** `CuriosityInvestigator` interface + `passThroughInvestigator` (returns "",
  no AI call) present; real loop correctly left to TASK-028.
- **§5 worker wiring + D-wire mapping (the Q-BE-26 risk area — traced carefully):**
  `WorkerOptions`/`routes.ts` thread `aiStages`/`aiCuriosityMaxIterations`/
  `aiWritingMaxPasses`; worker builds `createRepoInspector(clone.dir)` + pass-through
  investigator inside `withClone`. `WIRE_STAGE_BY_INTERNAL` maps CURIOSITY→AI_COMMITS,
  UNDERSTANDING→AI_WRITING, others 1:1; `reportStage` collapses consecutive duplicates. I
  traced the full announced sequence — CLONING, READING_CODEBASE, READING_COMMITS,
  AI_PROJECT, AI_COMMITS (curiosity collapses), AI_WRITING (understanding+writing collapse)
  = exactly the six `JOB_STAGES` in order. `test/reports-worker.test.ts` L178
  (`stages` toEqual `[...JOB_STAGES]`) and L188 (`current` = `[1..6]`) are intact and strong,
  and run against a real temp git repo. `JOB_STAGES`/`progress.total`/schema untouched.

**Q-BE-27 (NON-BLOCKING) handled in §Questions:** implemented-per-SPEC is correct, not a
rework; the two user-facing effects are consequences of SPEC-007 D2 that cross into
business scope, routed to Porter as **Q-SA-24** (SPEC-007 §Questions). Does not gate this
verdict or TASK-028.

**Per Q-BE-26 ruling, TASK-027 DONE unblocks TASK-028 (real curiosity loop) — startable now.**
