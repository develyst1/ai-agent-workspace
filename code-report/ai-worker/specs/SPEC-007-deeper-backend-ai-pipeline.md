# SPEC-007: Deeper backend AI analysis pipeline (5-stage redesign)
- Source: REQ-008
- Status: DONE (all five tasks TASK-025..029 reviewed DONE 2026-08-25; REQ-008 → SPEC_DONE)

## Overview
Replace the current **3-stage** pipeline (`AI_PROJECT → AI_COMMITS → AI_WRITING`,
built by TASK-004, `src/ai/pipeline.ts`) with a **5-stage** one:
`AI_PROJECT → AI_COMMITS → AI_CURIOUSNESS → AI_UNDERSTANDING → AI_WRITING`.
Two hard, orthogonal goals:

1. **Every** AI API CENTER call must send an explicit `model` **and** `max_tokens`.
   Today neither is sent — `src/ai/client.ts::chatBody` builds the body from
   `messages` only (`model` omitted by design; `max_tokens` only if a caller passes
   it, and `pipeline.ts` never does). Both become **required per call** and
   **env-configurable per stage**.
2. Two new reasoning stages between commits and writing — **AI_CURIOUSNESS** (an
   env-bounded investigation loop that reads the *real* cloned repo to fill gaps)
   and **AI_UNDERSTANDING** (writes its own reasoned understanding before any
   report prose) — plus **AI_WRITING** becoming a **1..limit** multi-pass, by-topic
   writer.

The existing architecture is a good fit and is preserved: `pipeline.ts` stays a
pure function over injected capabilities (no direct network / DB / filesystem),
so it remains unit-testable against a fake `AiClient`. AI_CURIOUSNESS's new need to
read repo files is satisfied by **injecting a `RepoInspector`** capability (built by
the worker over the *live clone directory*, which is already alive for the whole
run inside `withClone`), NOT by giving the pipeline direct `fs` access.

### Why this approach
- The clone already survives for the whole pipeline (`worker.ts` runs
  `runPipeline` inside the `withClone(...)` callback, `src/reports/worker.ts`
  L131–224), so AI_CURIOUSNESS can inspect real files without changing the
  clone lifecycle.
- Keeping filesystem access behind an injected interface preserves the module's
  testability and its "never touches fs" guarantee (the *worker* touches fs; the
  pipeline asks a capability).
- The AI API CENTER `/chat` contract (`../project-docs/AI-API-CENTER.md`) is plain
  `messages`-in / `content`-out with **no tool/function-calling schema**, so
  AI_CURIOUSNESS's "AI decides what to read" is implemented as a **text action
  protocol** (model emits structured actions in its content; BE executes and feeds
  results back), not native tool-calls. See Flow §3 and Decision D4.

## API / Interface Design

### AI API CENTER call body (`src/ai/client.ts`)
- `ChatRequest` gains two **required** fields: `model: string`, `max_tokens: number`
  (today `max_tokens?` is optional and there is no `model`).
- `chatBody(request)` **always** sets `model` and `max_tokens` in the wire body
  (contract allows both: `{ provider?, model?, temperature?, max_tokens?, messages }`,
  per `AI-API-CENTER.md`). `provider` stays absent (fallback chain unchanged).
- **Remove the stray `console.log("request:", request)`** currently sitting in
  `chatBody` in the working tree (uncommitted; see Constraints — leftover debug).
- No change to auth, retry (`MAX_ATTEMPTS = 2`), timeout (`AI_TIMEOUT_MS`), the
  `{success,data}` envelope parsing, or the log line shape.

### Wire contract for `GET /api/reports/:jobId` — UNCHANGED (SA decision D-wire)
- `progress.total` and the set of `stage` strings on the wire **stay the current
  six** (`CLONING, READING_CODEBASE, READING_COMMITS, AI_PROJECT, AI_COMMITS,
  AI_WRITING`). The two new internal stages are **mapped onto existing wire
  stages** when reported to the worker's `setStage`:
  - `AI_CURIOUSNESS` → reported as wire stage **`AI_COMMITS`** (it is still
    gathering/analysing commit-related material).
  - `AI_UNDERSTANDING` → reported as wire stage **`AI_WRITING`** (it is the first
    step of producing the written output).
- **Rationale:** REQ-008 is declared *backend-only* ("no frontend changes"). The FE
  progress ledger (`code-report-front` `ReportProgress.tsx`) hardcodes a 6-item
  `REPORT_STAGES` list, renders one row per stage with an i18n label
  `reports.view.stage.${stage}`, and computes position via
  `REPORT_STAGES.indexOf(job.stage)`. Emitting `AI_CURIOUSNESS`/`AI_UNDERSTANDING`
  on the wire would break the ledger (indexOf → -1) and miss two i18n keys. Keeping
  the wire stable honours the REQ's scope. **See Question Q-SA-23 (to Porter,
  NON-BLOCKING):** if the stakeholder wants the new depth surfaced in the progress
  UI, that is a *separate FE requirement* (add the two stages + labels), not part of
  REQ-008.

## Data Model
- **No schema / migration change.** `report_jobs.stage` is free `text`
  (`001_init.sql` L24–25) and `JOB_STAGES` (`src/reports/jobs.ts`) — the wire
  progress list — is deliberately left at six (see D-wire). No DB column, enum, or
  status value is added.

## Configuration (`src/config.ts`)
Add per-stage, env-overridable settings. All optional with the mandated defaults;
parsed once at startup with the existing `positiveInt`/`optional` helpers; a bad
value is a fatal `ConfigError` (existing pattern).

| Env var | Meaning | Default |
|---------|---------|---------|
| `AI_PROJECT_MODEL` | model id for AI_PROJECT | *(see D3 proposal)* |
| `AI_PROJECT_MAX_TOKENS` | max_tokens for AI_PROJECT | **20000** |
| `AI_COMMITS_MODEL` | model id for AI_COMMITS | *(D3)* |
| `AI_COMMITS_MAX_TOKENS` | max_tokens per AI_COMMITS batch | **20000** |
| `AI_CURIOUSNESS_MODEL` | model id for AI_CURIOUSNESS | *(D3)* |
| `AI_CURIOUSNESS_MAX_TOKENS` | max_tokens per AI_CURIOUSNESS call | **50000** |
| `AI_CURIOUSNESS_MAX_ITERATIONS` | investigation loop cap | **5** |
| `AI_UNDERSTANDING_MODEL` | model id for AI_UNDERSTANDING | *(D3)* |
| `AI_UNDERSTANDING_MAX_TOKENS` | max_tokens for AI_UNDERSTANDING | **40000** |
| `AI_WRITING_MODEL` | model id for AI_WRITING | *(D3)* |
| `AI_WRITING_MAX_TOKENS` | max_tokens per AI_WRITING pass | **50000** |
| `AI_WRITING_MAX_PASSES` | AI_WRITING pass cap | **3** (REQ example) |
| `AI_FALLBACK_MODELS` | ordered, comma-separated backup model chain tried when a primary call exhausts (Req-7, §Fallback below) | **`deepseek-v4-pro,deepseek-v4-flash`** |

- **Model defaults (D3 — PENDING stakeholder confirmation via Q-REQ008-1).** The
  stakeholder gave approved model ids + tiers + per-call caps but no explicit
  model→stage map; three stages' default budgets (CURIOUSNESS 50000, UNDERSTANDING
  40000, WRITING 50000) exceed the cheap tier's **30000** cap, so those stages are
  forced to the deep tier. Proposed defaults, all within his caps, drafted under
  the REQ's working default ("team proposes, he confirms before ship"):
  - `AI_PROJECT` → `gpt-4.1-mini` (cheap tier, orchestration/overview; 20000 ≤ 30000)
  - `AI_COMMITS` → `gpt-4.1-mini` (cheap tier, high-volume code-reading; 20000 ≤ 30000)
  - `AI_CURIOUSNESS` → `grok-4-latest` (deep tier 80%, ≤ 50000; investigation)
  - `AI_UNDERSTANDING` → `gpt-4.1` (deep tier 100%, ≤ 50000; the deep-reasoning stage)
  - `AI_WRITING` → `gpt-4.1` (deep tier 100%, ≤ 50000; final prose)
  These are **only defaults**; every one is env-overridable. **No proposed model
  default ships as final until Q-REQ008-1 is answered** — but because they are env
  values, the code can carry them now and the stakeholder can change any of them
  without a code change.
- **Cap enforcement (AC 8):** the config loader must reject a per-stage
  `*_MAX_TOKENS` that exceeds the per-call cap of the model assigned to that stage
  (`gpt-4.1`/`grok-4-latest` ≤ 50000; `gpt-4.1-mini`/`deepseek-v4-pro`/
  `deepseek-v4-flash` ≤ 30000), and reject an unknown model id — a fatal
  `ConfigError` at startup, so a misconfiguration can never reach the wire. The
  approved-model→cap table lives in one constant.
- **`deepseek-v4-flash` cap (Q-REQ008-4, confirmed 2026-08-24):** add
  `"deepseek-v4-flash": 30000` to `APPROVED_MODEL_CAPS` (same 40–50% tier / ≤ 30000
  per-call cap as `gpt-4.1-mini`). It becomes a valid stage model **and** a valid
  fallback model after this.
- **Fallback list validation:** every id in `AI_FALLBACK_MODELS` must be an approved
  model id (rejected with a fatal `ConfigError` at startup exactly like a stage
  model). An **empty** `AI_FALLBACK_MODELS` is legal and means *fallback disabled* —
  a primary exhaustion then fails the job as it does today.

## Fallback models (Req-7, decision D6 — PROPOSED, pending Q-SA-25)
The system must fall back to a **backup model** when the primary model chosen for a
call runs out of credit/quota or errors (REQ-008 Req-7). Fallback models:
`deepseek-v4-pro` then `deepseek-v4-flash` (the stakeholder's order).

**Where it lives — inside `AiClient`, not the pipeline.** Every stage (pipeline +
the curiosity loop) already calls the one seam `client.chat({ stage, model,
max_tokens, messages })`, and `createHttpAiClient` already owns the per-attempt
retry loop **and** the failure classification (`Failure.outcome` /
`Failure.retryable`, `client.ts` L102–213). Putting the model-level fallback there
means the pipeline, `curiosity.ts`, `worker.ts` and `routes.ts` are **unchanged**:
the client is constructed with a fallback chain + the cap table and handles it
transparently. The request's `model`/`max_tokens` remain the **primary** for that
stage; the chain is client-global config, not per-call.

**Two independent resilience layers — keep them distinct:**
1. *Provider* fallback `deepseek → xai → gemini → openai` — the AI API CENTER's own,
   for free, because we send no `provider`. Unchanged.
2. *Model* fallback (this section) — **our** layer, sitting **above** the existing
   per-model retry: primary model → its `MAX_ATTEMPTS` retries → next fallback model
   → its retries → … until one succeeds or the chain is exhausted.

### Trigger (D6a)
A call advances to the next fallback model exactly when the current model **exhausts
its retry loop on a provider/model-side failure** — i.e. the failure family that
today ends in `throw AiLayerError("AI_UNAVAILABLE")`: `timeout`, `network-error`,
`http-error` (5xx) and `service-error` (`{success:false}`, HTTP 500). It does **NOT**
fall back on a **non-retryable 4xx `http-error`** — that means *we* built the request
wrong, so a different model fails identically; falling back would just burn a second
model's quota on a guaranteed failure. That failure still throws as today.

**We do not distinguish "out of credit" from a generic error for *routing*.** The
documented failure shape is a bare `{ success:false, error:"<message>" }` / HTTP 500
(`AI-API-CENTER.md`) with no structured credit/quota code, and Req-7 fires on *either*
condition — so both simply trigger the same fallback. Any credit-vs-error labelling is
**log-only, best-effort** (substring match on `error`), never a routing input. **See
Q-SA-25** — if the stakeholder wants a *true* distinction we need a real out-of-credit
payload sample (a DATA REQUEST); the mechanism ships correctly without it.

### Token-cap clamp on fallback (D6b)
`deepseek-v4-pro`/`deepseek-v4-flash` cap at **30000/call**, but the primary budget
of `AI_CURIOUSNESS`/`AI_WRITING` is **50000** (and `AI_UNDERSTANDING` 40000). A
fallback call therefore sends **`min(request.max_tokens, fallbackModelCap)`** so it
honours the fallback model's approved per-call cap (REQ-008 AC "each call stays within
its per-call token cap"). **Consequence:** a fallback of a 40000/50000-budget stage is
capped at 30000 → a possibly shorter completion. A produced-but-shorter report beats a
failed job; this trade-off is part of the **proposal to the stakeholder (Q-SA-25)**.

### Chain construction (D6c)
- Order = `AI_FALLBACK_MODELS` as written (default `deepseek-v4-pro,deepseek-v4-flash`).
- **De-dup per call:** skip any fallback id equal to the primary `model` (retrying the
  same failing model is pointless) — e.g. if a stage's primary is already
  `deepseek-v4-pro`, only `deepseek-v4-flash` remains for that stage.
- Empty list ⇒ no fallback (today's behaviour) — see §Configuration.
- The log line already carries `model` + `outcome`; extend it so each fallback attempt
  records the model it used and that it was a fallback (observability; no wire change).

### Testability (D6d)
Fallback is exercised against the injected fake `fetchImpl`/`AiClient` with **no
network**: a fake that fails the primary model then succeeds the next asserts (a) the
success comes from the fallback model, (b) `max_tokens` was clamped to 30000, (c) a
non-retryable 4xx does **not** fall back, (d) an empty chain fails as today. This keeps
`pipeline.ts`/`curiosity.ts` pure and untouched.

## Flow
Pipeline input gains a `RepoInspector` and a per-stage `StageConfig`
(`{ model, maxTokens }` plus the loop/pass limits). Stages run strictly in order.

1. **AI_PROJECT (×1)** — unchanged inputs (file tree + `.md` digest + extra
   context), now sent with `AI_PROJECT_MODEL` / `AI_PROJECT_MAX_TOKENS`. Output:
   `profile`.
2. **AI_COMMITS (×N)** — unchanged batching (`COMMITS_PER_BATCH = 20`) and
   **sequential** loop (already sequential in `pipeline.ts` L95–108; keep it),
   each call with `AI_COMMITS_MODEL` / `AI_COMMITS_MAX_TOKENS`. Output:
   `batchSummaries[]`.
3. **AI_CURIOUSNESS (loop, ≤ `AI_CURIOUSNESS_MAX_ITERATIONS`, default 5)** —
   iterative investigation over the **real clone** via the injected
   `RepoInspector`:
   - Each iteration sends the model: the `profile`, the `batchSummaries`, and the
     accumulated findings so far, and asks it to (a) judge what information is
     still missing to truly understand the code, and (b) request repo inspections.
   - **Text action protocol (D4):** the model replies with a fenced JSON block of
     actions from a fixed vocabulary — `list_tree` (folder structure),
     `read_file: <path>`, `search: <word>` — **or** a terminal `{"done": true}`.
     The BE parses it, executes each action through `RepoInspector` (bounded — see
     Data-safety), and feeds the results back **wrapped as repository DATA**
     (`REPO_OPEN`/`REPO_CLOSE` markers, never as instructions) on the next
     iteration.
   - **Exit:** when the model returns `{"done": true}`, when no actionable request
     is parseable, or when the iteration cap is hit — whichever comes first.
     Output: `findings` (accumulated text).
   - Each call uses `AI_CURIOUSNESS_MODEL` / `AI_CURIOUSNESS_MAX_TOKENS`.
4. **AI_UNDERSTANDING (×1)** — sent `profile` + `batchSummaries` + `findings`,
   asked to write **its own reasoned understanding as a block of thought** (what
   things are, where they connect, what depends on what) and explicitly **not** to
   translate the inputs through. Output: `understanding`. Uses
   `AI_UNDERSTANDING_MODEL` / `AI_UNDERSTANDING_MAX_TOKENS`.
5. **AI_WRITING (1..`AI_WRITING_MAX_PASSES`, default 3)** — writes the final report:
   - First, one AI call decides a **topic plan**: given `understanding` +
     `batchSummaries`, split the material into **≤ limit topics** and return the
     ordered topic list. (This planning call also uses the AI_WRITING model/budget.)
   - Then **one pass per topic** (sequential), each writing that topic's section in
     `params.language`, told which topics precede/follow it so sections do not
     overlap. If the plan yields 1 topic, it is a single pass (the old behaviour).
   - **Assembly (D2):** the final report is the **deterministic, ordered
     concatenation** of the topic sections — **no extra AI "stitch" call**. A short
     fixed header (repo/branch/date range, via the existing `formatReportParams`)
     precedes the sections, matching today's single-report shape.
   - Each writing pass uses `AI_WRITING_MODEL` / `AI_WRITING_MAX_TOKENS`.

- **Stage callback / wire mapping:** `pipeline.ts` announces the internal stage; the
  worker maps it to the wire stage per D-wire before `jobs.setStage`. The
  `NO_COMMITS` short-circuit (worker L175–196) is unchanged — the pipeline is still
  never entered with zero commits.

### Data-safety bounds for `RepoInspector` (D5)
- **Path confinement:** every `read_file`/`search` path is resolved against the
  clone root and **rejected if it escapes** (`..`, absolute paths, symlink escape)
  — the model can only reach files inside this job's clone.
- **Size caps:** a read is capped (reuse `MAX_CHARS_PER_FILE = 20000`, truncation
  marked); `search` uses `git grep` with a capped hit count; `list_tree` reuses the
  existing capped `listRepoFiles` (`MAX_TREE_PATHS = 2000`).
- **Injection posture:** all inspector output is fed to the model as **DATA, NOT
  INSTRUCTIONS** (same `REPO_OPEN`/`REPO_CLOSE` treatment already used for repo
  material in `prompts.ts`). The PAT-redaction rules are unaffected (inspector reads
  local files only; no network, no PAT).

## Non-functional
- **Testability preserved:** `pipeline.ts` stays pure; `RepoInspector` and
  `AiClient` are injected, so the whole 5-stage flow (including the curiosity loop's
  exit conditions and the writing pass split) is unit-tested against fakes with no
  network and no real repo.
- **Determinism of assembly:** report assembly (D2) is pure string work — no AI —
  so a report's structure is reproducible given the same passes.
- **Cost/latency:** all stages sequential (mandated). The added stages raise the
  call count from `2 + N` to roughly `2 + N + curiosityIterations + 1 + (1 plan +
  passes)`; acceptable per REQ (depth over speed). Loop/pass caps bound it.
- **Logging:** each call already logs `stage` + provider + model + tokens
  (`client.ts` L214–229). Internal stage names (`AI_CURIOUSNESS`,
  `AI_UNDERSTANDING`) appear in the **log** `stage` field (helpful for tuning) even
  though they are mapped on the wire — extend `AiStage`/`AI_STAGES` accordingly.

## Tasks
- **TASK-025**: BE — per-stage model + max_tokens **config** (`config.ts` +
  `.env.example` + config tests). (depends on: —) **[Re-scoped 2026-08-24, Q-BE-25:
  the `client.ts` required-field flip moved to TASK-027 so the contract change lands
  with its sole caller `pipeline.ts` in one green commit — `pipeline.ts` is the only
  `client.chat` caller in `src/`, verified read-only at `d1f0993`.]**
- **TASK-026**: BE — `RepoInspector` capability over the live clone (list tree /
  read file by path / search word), path-confined + size-capped, injectable.
  (depends on: —)
- **TASK-027**: BE — **the `client.ts` required-field flip (`model`+`max_tokens`
  always sent) PLUS** the 5-stage pipeline: `stages.ts` (5 names), prompts for all
  five, AI_PROJECT/AI_COMMITS(sequential)/AI_UNDERSTANDING/AI_WRITING(multi-pass,
  by-topic, deterministic assembly), threading per-stage model+max_tokens through the
  three call sites. AI_CURIOUSNESS is present but its loop body is behind an injected
  `CuriosityInvestigator` interface so this task lands with a trivial (pass-through)
  investigator + full unit tests. (depends on: TASK-025) **[client flip added
  2026-08-24, Q-BE-25.]** **[Q-BE-26, 2026-08-24, Option A: the MINIMAL worker wiring
  needed to stay green with the client flip is folded in here — thread `Config.aiStages`/
  `aiCuriosityMaxIterations`/`aiWritingMaxPasses` through `WorkerOptions`+`routes.ts`,
  build the inspector + a **pass-through** investigator in the worker, add the
  internal→wire stage mapping (curiosity→AI_COMMITS, understanding→AI_WRITING, wire
  stays 6), update `reports-worker.test.ts`. Verified read-only at `157e5a2`:
  `runPipeline`'s sole prod caller is `worker.ts:198`, the three `client.chat` sites are
  all in `pipeline.ts`, so there is no green subset — same class as Q-BE-25.]**
- **TASK-028**: BE — the **real** AI_CURIOUSNESS investigation loop (text-action
  protocol over `RepoInspector`, env loop-limit, bounded reads, safe early exit) that
  **swaps in for TASK-027's pass-through** at the worker construction site, + the
  end-to-end env verification for the now-live curiosity call. **[Q-BE-26, 2026-08-24,
  Option A: the worker wiring + internal→wire mapping moved UP to TASK-027; this task no
  longer touches `WorkerOptions`/`routes.ts`/the mapping — only the investigator swap.]**
  (depends on: TASK-026, TASK-027)
- **TASK-029**: BE — **model-level fallback (Req-7)**: add `deepseek-v4-flash`=30000 to
  `APPROVED_MODEL_CAPS`; add the `AI_FALLBACK_MODELS` env var (ordered chain, default
  `deepseek-v4-pro,deepseek-v4-flash`, validated against approved ids, empty = disabled)
  to `config.ts` + `.env.example`; implement the fallback chain **inside
  `createHttpAiClient`** per §Fallback (trigger D6a, clamp D6b, de-dup D6c, log D6d) —
  primary model → its retries → next fallback model (clamped) → … . **No change to
  `pipeline.ts`/`curiosity.ts`/`worker.ts`/`routes.ts`.** (depends on: TASK-027)
  **[The fallback *policy* — trigger rule, pro-before-flash order, the 30000 clamp — is a
  PROPOSAL to the stakeholder (Q-SA-25, NON-BLOCKING); every knob is env, so his answer
  changes config, not code, exactly like the D3 model defaults.]**

## Questions
(Jason asks here as sub-bullets; Sober answers as `> answer: ...`.)

- **Q-SA-23 (to Porter → possibly the human; NON-BLOCKING for BE).** REQ-008 is
  declared backend-only, but the pipeline's new depth is **not** visible to the user
  unless the two new stages are surfaced in the progress UI — which the FE cannot do
  without a code change (it hardcodes six stages + their i18n labels). SPEC-007's
  safe default keeps the wire at six stages (D-wire), so BE work proceeds and
  nothing breaks. **Does the stakeholder want AI_CURIOUSNESS / AI_UNDERSTANDING
  shown as their own steps in the progress ledger?** If yes, that is a *separate FE
  requirement* (add two stages + labels) for Porter to raise — it is out of REQ-008
  as written. BE is not blocked either way.

- **Q-SA-24 (to Porter → the human; NON-BLOCKING for BE/FE).** Implementing D2 (the
  by-topic deterministic assembly, TASK-027, DONE at `23df16f`) produces **two
  user-facing changes to the report** that follow from the SPEC's letter but that I
  cannot decide alone — both cross into business scope. BE (Jason) surfaced them as
  Q-BE-27 instead of guessing; I am routing the business call to you.
  1. **The report header is now `formatReportParams` verbatim** — prompt-style labels
     (`REPORT PARAMETERS:` / `Repository:` / `Period:` / `Branch:` / `Author filter:`),
     written for the model, now head the visible report. SPEC-007 D2 said "a fixed header
     via the existing `formatReportParams`", so it was used as-is. **Does the stakeholder
     accept these prompt labels as the visible report header, or should BE add a small
     reader-facing header (a separate, stakeholder-approved string — cf. REQ-007)?**
  2. **The old fixed report sections are no longer guaranteed.** The 5-stage writer plans
     its own topics, so SPEC-001's mandated **Contributors** section and **Commit
     appendix** (`REPORT_STRUCTURE` in `prompts.ts`, driven by the now-orphaned
     `stage3System`) appear only if the plan model chooses them. **Is dropping the
     Contributors + Commit appendix intended for the 5-stage report, or must the writer
     always include them (or BE append a deterministic commit appendix)?**
  Neither answer blocks TASK-028 (real curiosity loop) or FE REQ-009 (progress UI). If the
  stakeholder wants either changed, it is a SPEC-007 amendment + a NEW task, not a rework
  of TASK-027 (which faithfully built D2). Raised 2026-08-25 by Sober.
  > Porter (2026-08-25): **routed to the human, pending answer** — part of REQ-008's PM
  > acceptance check. REQ-008 held at `SPEC_DONE` (not `DELIVERED`) until this is answered.
  > I will transcribe his decision here when it lands; a change becomes a SPEC-007 amendment
  > + new task (yours), not a rework of TASK-027. NON-BLOCKING — nothing waits on it now.
  > **ANSWERED 2026-08-25 (stakeholder via Porter), both items:**
  > 1. **Header — accepted as-is** *"รับได้ ขอดูก่อนค่อยกลับมาแก้"* (acceptable; I'll look
  >    first and come back to fix later). The prompt-style `formatReportParams` header ships
  >    unchanged. Any later reader-facing header is a **new** stakeholder request, not a
  >    REQ-008 rework — do nothing now.
  > 2. **Contributors + Commit appendix — remove if not useful** *"ถ้าไม่มีประโยชน์ต่อ
  >    รายงาน เอาออกไป"* (if it adds no benefit to the report, take it out). He **delegated
  >    the usefulness judgment to you.** The current 5-stage build already does not guarantee
  >    these sections, so REQ-008 delivery is not blocked. **@Sober, your design call, a
  >    separate later unit:** assess whether the orphaned Contributors/Commit-appendix
  >    (`REPORT_STRUCTURE` / `stage3System` in `prompts.ts`) add value to the 5-stage report;
  >    if not, a **SPEC-007 amendment + a NEW task** removes the dead code — not a rework of
  >    the DONE TASK-025..029. NON-BLOCKING; REQ-008 is `DELIVERED` regardless.

- **Q-SA-25 (to Porter → the human; NON-BLOCKING for BE) — Req-7 fallback policy sign-off.**
  Req-7 says the system falls back to `deepseek-v4-pro`/`deepseek-v4-flash` when a primary
  model "runs out of credit/quota or errors", and explicitly asks the team to *propose the
  mechanism back before ship*. My proposed design (SPEC §Fallback, D6) — carried in code now
  as env defaults, so an answer changes config not code:
  1. **Trigger.** The documented failure shape is a bare `{ success:false, error }` / HTTP 500
     with **no credit/quota code**, and Req-7 fires on *either* credit-exhaustion *or* error —
     so I fall back on **any** provider/model-side exhaustion (timeout / 5xx / `success:false` /
     network), and **not** on a 4xx (our own malformed request). Credit-vs-error is **log-only,
     best-effort**. **Does the stakeholder want a *true* credit-vs-generic distinction?** If yes
     that needs a real out-of-credit response sample → **DATA REQUEST** (a captured
     `{success:false,error:...}` body when a model is actually out of quota). The mechanism
     ships correctly without it; this only adds labelling fidelity.
  2. **Order** = `deepseek-v4-pro` then `deepseek-v4-flash` (his listed order). Confirm?
  3. **Token clamp.** Both fallbacks cap at 30000/call, but `AI_CURIOUSNESS`/`AI_WRITING` run at
     50000 and `AI_UNDERSTANDING` at 40000. A fallback call is therefore **clamped to 30000** —
     a possibly shorter completion, but a produced report vs a failed job. **Accept the clamp,
     or should a stage rather fail than degrade to 30000?**
  4. **Disable switch.** Empty `AI_FALLBACK_MODELS` = fallback off (fails as today). OK as the
     escape hatch?
  None of this blocks TASK-029 being *built* (defaults are safe + env-reversible), but it MUST be
  confirmed **before ship**, same gate as Q-REQ008-1. Raised 2026-08-25 by Sober.
  > Porter (2026-08-25): **routed to the human, pending answer** — carried in REQ-008's PM
  > acceptance check together with Q-REQ008-1 (D3 model→stage defaults). This is the AC-mandated
  > pre-ship fallback sign-off, so REQ-008 stays `SPEC_DONE` (not `DELIVERED`) until he answers
  > items 1–4. If he wants the *true* credit-vs-error distinction (item 1) I will open the
  > DATA REQUEST for a real out-of-credit `{success:false,error}` sample. NON-BLOCKING for the team.
  > **ANSWERED 2026-08-25 (stakeholder via Porter): ACCEPT AS PROPOSED** — verbatim *"ก"*
  > (option a / as proposed) then *"ไปเลย"* (go ahead). All four sub-items ship as the D6
  > design proposed, no code change:
  > 1. **Trigger** as proposed — fall back on any retryable provider/model-side exhaustion,
  >    not on a 4xx; credit-vs-error stays **log-only**. He did **NOT** ask for a true
  >    credit-vs-generic distinction → the optional DATA REQUEST is **not opened** (no
  >    out-of-credit sample needed).
  > 2. **Order** `deepseek-v4-pro` → `deepseek-v4-flash` — confirmed.
  > 3. **30000 clamp** on fallback calls — **accepted** (degrade to a shorter completion
  >    rather than fail the job).
  > 4. **Empty `AI_FALLBACK_MODELS` disables** — confirmed as the escape hatch.
  > This clears REQ-008's ship-gating AC ("the fallback design was confirmed back to the
  > stakeholder before ship"). The built defaults already match; **REQ-008 → `DELIVERED`
  > 2026-08-25.**

- **Design decisions recorded (SA calls, not questions):**
  - **D2 — AI_WRITING assembly = deterministic concatenation** of by-topic sections,
    no extra stitch AI call. Faithful to REQ ("all passes together produce the final
    report") and cheaper; reversible to a stitch pass later if the stakeholder wants
    tighter cross-section flow.
  - **D3 — model→stage defaults proposed** within the stakeholder's tier/cap rules
    (table above), env-overridable, **pending Q-REQ008-1**. No default ships as
    final until he confirms; env-config means confirming needs no code change.
  - **D4 — AI_CURIOUSNESS uses a text action protocol** (`list_tree`/`read_file`/
    `search`/`done`), because `/chat` exposes no native tool-calling. **Risk:** a
    model may emit unparseable actions; mitigated by the loop cap and a safe exit
    (unparseable ⇒ treat as "nothing missing", proceed). If in practice the models
    cannot drive this reliably, that is a tuning finding to raise to Porter, not a
    silent redesign.
  - **D5 — RepoInspector is path-confined + size-capped**, output wrapped as DATA.
  - **D-wire — wire stage set stays at six** (map the two new stages onto
    AI_COMMITS / AI_WRITING) to keep REQ-008 backend-only. See Q-SA-23.
  - **D6 — model-level fallback (Req-7) lives inside `AiClient`**, above the existing
    per-model retry, so the pipeline/curiosity/worker are untouched. Triggers on any
    provider/model-side exhaustion (not a 4xx); tries `deepseek-v4-pro` then
    `deepseek-v4-flash`, de-duped against the primary, `max_tokens` **clamped to the
    fallback model's 30000 cap**; empty `AI_FALLBACK_MODELS` disables it. Credit-vs-error
    is log-only (no structured code in the documented failure shape). **Proposed, pending
    Q-SA-25** — env-configurable, so confirmation is a config change not a code change.
  - **Q-REQ008-3 confirmed:** the per-stage token budgets are `max_tokens` (the
    completion cap), agreeing with Porter's high-confidence reading and the confirmed
    gap ("no max_tokens per stage").
