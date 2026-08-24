# TASK-028: BE — AI_CURIOUSNESS investigation loop + worker wiring
- Source: SPEC-007
- Status: TODO
- Assignee: Jason (BE)
- Depends on: TASK-026 (RepoInspector) **and** TASK-027 (pipeline + investigator
  seam). This is the last SPEC-007 task.
- Written: 2026-08-24 by Sober (SA Lead)

## Why this exists
Implement the real AI_CURIOUSNESS loop (REQ-008 stage 3) behind the
`CuriosityInvestigator` seam from TASK-027, and wire the whole 5-stage pipeline into
the worker — building the real `RepoInspector` over the live clone and mapping the
internal stage names onto the six wire stages. Full flow + the text-action protocol
+ the wire mapping + exit rules: **SPEC-007 §Flow step 3, §"Data-safety bounds", and
§API/Interface Design (wire contract, D-wire)** — read them.

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

### 2. `src/reports/worker.ts` — wire the pipeline
- Inside the existing `withClone(...)` callback (where `clone.dir` is alive), build
  `createRepoInspector(clone.dir)` and pass it + the real curiosity investigator +
  the per-stage config (from `Config`, TASK-025) into `runPipeline`.
- **Wire-stage mapping (D-wire):** the pipeline announces internal stages; before
  `jobs.setStage`, map `AI_CURIOUSNESS → "AI_COMMITS"` and
  `AI_UNDERSTANDING → "AI_WRITING"`; the other three internal names pass through
  unchanged. `JOB_STAGES` and `progress.total` stay **six** — no schema/migration,
  no wire-shape change (REQ-008 is backend-only; see SPEC-007 Q-SA-23).
- The `NO_COMMITS` short-circuit and clone-always-deleted behaviour are unchanged.

### 3. Env end-to-end
- Verify per-stage `model` + `max_tokens` actually reach the wire body (changing an
  env value changes what the call sends), per REQ-008 AC 3.

## Definition of Done
- [ ] AI_CURIOUSNESS loops ≤ env limit (default 5), drives `list_tree`/`read_file`/
      `search` via `RepoInspector`, exits early on `done`/unparseable/no-request, and
      never aborts the job on a malformed reply.
- [ ] Worker builds the real inspector over `clone.dir`, passes real config +
      investigator into `runPipeline`, and maps internal→wire stages so
      `progress.total` stays 6; no DB/migration/wire-shape change.
- [ ] Env values for each stage's `model`/`max_tokens` demonstrably change the sent
      body (test asserts the fake client received the configured values per stage).
- [ ] Tests: `test/ai-curiosity.test.ts` (loop honours cap, executes each action
      type against a fake inspector, exits on `done` and on unparseable, DATA-fences
      results); extend `test/reports-worker.test.ts` for the wire-stage mapping
      (curiosity/understanding surface as AI_COMMITS/AI_WRITING) against a fixture
      repo + fake AI.
- [ ] `bun run typecheck` exits 0 and `bun test` passes (`cd code-report-back`).

## Implementation Notes
(Jason fills in.)

## Questions
(Jason asks; Sober answers as `> answer: ...`.)

## Review
(Sober fills in at REVIEW.)
