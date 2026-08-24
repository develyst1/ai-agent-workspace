# TASK-025: BE — per-stage `model` + `max_tokens` config (env-configurable)
- Source: SPEC-007
- Status: IN_PROGRESS (unblocked 2026-08-24 by Sober — Q-BE-25 ruled Option 2; scope
  narrowed to `config.ts` only, the `client.ts` required-field flip MOVED to TASK-027)
- Assignee: Jason (BE)
- Depends on: none
- Written: 2026-08-24 by Sober (SA Lead)
- Re-scoped: 2026-08-24 by Sober (Q-BE-25 ruling — see §Questions)

## Why this exists
REQ-008's hard gate: **every** AI API CENTER call must carry an explicit `model`
and `max_tokens`, both env-configurable per stage. Today neither is sent —
`src/ai/client.ts::chatBody` builds the body from `messages` only; `pipeline.ts`
never passes `max_tokens`; there is no `model` anywhere. This task makes the
client and config carry both. Full rationale + the env table + the model-default
proposal live in **SPEC-007 §Configuration and §API/Interface Design** — read them;
not repeated here.

## What to do

### 1. `src/ai/client.ts` — MOVED TO TASK-027 (Q-BE-25 ruling, 2026-08-24)
The client required-field flip (`ChatRequest.model`/`max_tokens` required; `chatBody`
always emits both; delete the stray `console.log`) is **no longer part of this task**.
It moved to **TASK-027**, which rewrites `pipeline.ts` — the sole caller of
`client.chat` — and threads per-stage `model`+`max_tokens` through all call sites, so
the contract change and its only consumer land in ONE green commit. Rationale: see
§Questions Q-BE-25. **Do NOT touch `client.ts`/`pipeline.ts` in this task.**

### 2. `src/config.ts` — per-stage settings
- Add the twelve env vars in **SPEC-007 §Configuration** (five `*_MODEL`, five
  `*_MAX_TOKENS`, `AI_CURIOUSNESS_MAX_ITERATIONS`, `AI_WRITING_MAX_PASSES`) to
  `Config`, parsed with the existing `optional` / `positiveInt` helpers, with the
  mandated defaults (max_tokens: PROJECT 20000, COMMITS 20000, CURIOUSNESS 50000,
  UNDERSTANDING 40000, WRITING 50000; iterations 5; passes 3). Prefer a nested
  `aiStages` shape on `Config` (one entry per stage: `{ model, maxTokens }`) so the
  pipeline reads one object per stage.
- **Model defaults** = the D3 proposal in SPEC-007 (PROJECT/COMMITS `gpt-4.1-mini`;
  CURIOUSNESS `grok-4-latest`; UNDERSTANDING/WRITING `gpt-4.1`). These are defaults
  only — mark in a comment they are **pending Q-REQ008-1** and env-overridable.
- **Validation (fatal `ConfigError` at startup):** one constant table of approved
  models → per-call cap (`gpt-4.1` 50000, `grok-4-latest` 50000, `gpt-4.1-mini`
  30000, `deepseek-v4-pro` 30000). Reject: an unknown model id for any stage; a
  stage `max_tokens` exceeding its assigned model's cap. Extend `describeConfig`
  to include the per-stage model + maxTokens (no secrets involved).
- Update `.env.example` with the twelve vars + defaults and a one-line comment each.

## Definition of Done
(The `chatBody`/`ChatRequest` row and the `test/ai-client.test.ts` row were MOVED to
TASK-027 by the Q-BE-25 ruling — this task is `config.ts` only.)
- [ ] `Config` carries per-stage `{ model, maxTokens }` + iteration/pass limits from
      env with the mandated defaults; unknown model or over-cap `max_tokens` → fatal
      `ConfigError`; `.env.example` updated.
- [ ] Unit tests: config rejects an unknown model and an over-cap budget, and reads
      env overrides. Extend `test/config.test.ts`.
- [ ] `bun run typecheck` exits 0 and `bun test` passes (`cd code-report-back`).

## Implementation Notes
Partial — the `config.ts` half is done and green; the `client.ts` half is
**blocked** (Q-BE-25 below). Nothing committed yet (working tree changes only).

**Done (part 2, `src/config.ts` — the whole "per-stage settings" section):**
- `Config` gains `aiStages: Record<AiStageKey, {model, maxTokens}>` (one object
  per stage, as SPEC-007 §Configuration asks) plus `aiCuriosityMaxIterations`
  and `aiWritingMaxPasses` (top-level numbers).
- Twelve env vars parsed with the existing `optional`/`positiveInt` helpers, with
  the mandated defaults (PROJECT/COMMITS 20000, CURIOUSNESS 50000, UNDERSTANDING
  40000, WRITING 50000; iterations 5; passes 3).
- Model→stage defaults = D3 (PROJECT/COMMITS `gpt-4.1-mini`, CURIOUSNESS
  `grok-4-latest`, UNDERSTANDING/WRITING `gpt-4.1`), in a commented constant
  marked **pending Q-REQ008-1**, env-overridable.
- `APPROVED_MODEL_CAPS` constant (`gpt-4.1`/`grok-4-latest` 50000,
  `gpt-4.1-mini`/`deepseek-v4-pro` 30000). Validation at load: unknown model id
  for any stage → fatal `ConfigError`; a stage `*_MAX_TOKENS` over its assigned
  model's cap → fatal `ConfigError`. All five defaults are within cap.
- `describeConfig` extended with `aiStages` + the two limits (no secrets).
- `.env.example` updated with the twelve vars, defaults and a one-line comment each.
- Tests added to `test/config.test.ts`: defaults, env overrides, unknown model
  rejected, over-cap budget rejected (+ same budget OK once the model allows it),
  non-positive budget rejected.

**Verification (config half):**
- `bun run typecheck` → exit 0.
- `bun test test/config.test.ts` → 12 pass / 0 fail.
- `bun test` (full suite) → 235 pass / 0 fail.

**Not done — part 1, `src/client.ts` (BLOCKED, see Q-BE-25):** making
`ChatRequest.model`/`max_tokens` **required** breaks the only current caller,
`src/ai/pipeline.ts` (3 `client.chat({...})` sites pass neither), so `tsc` would
go red. Threading per-stage model+max_tokens into the pipeline is explicitly
**TASK-027** ("threading per-stage model+max_tokens"), which depends on this task.
I did not touch `client.ts`/`pipeline.ts` to avoid guessing across the task
boundary. **Side note:** the DoD's stray `console.log("request:", request)` is
**already absent** from `chatBody` in the current working tree (git status clean;
board notes it was likely the stakeholder's own line during his real run and it is
now gone) — so that DoD item needs no action.

## Questions
(Jason asks; Sober answers as `> answer: ...`.)

- **Q-BE-25 (BLOCKING for part 1 of this task; part 2/config is already green).**
  Making `ChatRequest.model` + `max_tokens` **required** (this task's DoD) breaks
  `src/ai/pipeline.ts` — its three `client.chat({...})` calls pass neither, so
  `bun run typecheck` (also this task's DoD) cannot stay at exit 0 unless the
  pipeline call sites are updated to supply them. But threading per-stage
  model+max_tokens through the pipeline is **TASK-027's** stated scope, and
  TASK-027 depends on TASK-025 — so as written the two tasks can't both hold
  (025 green standalone AND pipeline threading only in 027). How should I
  sequence it? Options I see:
  1. **Widen TASK-025** to also update `pipeline.ts`'s three existing call sites +
     `PipelineInput` to carry per-stage `{model, maxTokens}` sourced from
     `Config.aiStages` (worker passes it in) — i.e. pull the client-facing
     threading forward from 027. Keeps 025 green but overlaps 027's file.
  2. **Move the `client.ts` required-field flip into TASK-027**, where the pipeline
     is re-threaded anyway, and let TASK-025 deliver only the `config.ts` +
     `.env.example` + tests I've done here (fully green, additive). 027 then owns
     both the client contract change and the pipeline that satisfies it in one
     green commit.
  3. Something else you prefer.
  I did **not** guess between these. My lean is **Option 2** (the client contract
  change and its sole consumer land together, no throwaway threading of the
  soon-to-be-replaced 3-stage pipeline), but it's your call. Config work above is
  valid under any option.

  > answer (Sober, 2026-08-24): **Option 2 — confirmed.** Your reasoning is right and
  > I verified the load-bearing fact read-only at `d1f0993`: `grep -rn "\.chat(" src/`
  > returns **exactly** the three `pipeline.ts` sites (L84/97/111) and nothing else —
  > `ChatRequest`/`client.chat` has **no other consumer** in the codebase. So making
  > `model`/`max_tokens` required has exactly one place to break, and that place is the
  > file TASK-027 rewrites wholesale. Landing the flip anywhere but 027 either (a)
  > breaks `typecheck` (defer the call-site fix), or (b) forces throwaway per-stage
  > threading into the 3-stage pipeline that 027 deletes (Option 1). Option 2 avoids
  > both: the contract change and its only caller land in one green commit in 027.
  >
  > **Re-scope applied by me (SA owns `tasks/`):**
  > - **This task (025) = `config.ts` only.** Its §"What to do" #1, the DoD `chatBody`
  >   row, and the `test/ai-client.test.ts` row are moved out (see edits above). What
  >   you already delivered — `Config.aiStages`, the 12 env vars, `APPROVED_MODEL_CAPS`
  >   validation, `describeConfig`, `.env.example`, `test/config.test.ts` — **is the
  >   whole task and is green**. Nothing further to implement here.
  > - **TASK-027 gains the client flip** (a new §"What to do" #0 + two DoD rows there):
  >   make `ChatRequest.model: string` + `max_tokens: number` required; `chatBody`
  >   always emit both; delete the stray `console.log` **if still present**; extend
  >   `test/ai-client.test.ts` that `chatBody` includes both. 027 already threads
  >   per-stage `model`+`max_tokens` into all three call sites and already `depends on:
  >   TASK-025`, so it compiles green as one unit. TASK-025 stays a hard prerequisite
  >   (027 reads `Config.aiStages` for the values it threads).
  >
  > **Next action for you, Jason:** commit the config half as TASK-025's deliverable
  > and move it to `REVIEW`. The `console.log` DoD item is moot (already absent in the
  > working tree) — don't re-add it just to delete it. TASK-026 remains independently
  > startable; TASK-027 now carries the client contract change from the top.

## Review
(Sober fills in at REVIEW.)
