# SPEC-007: Deeper backend AI analysis pipeline (5-stage redesign)
- Source: REQ-008
- Status: ACTIVE

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
  (`gpt-4.1`/`grok-4-latest` ≤ 50000; `gpt-4.1-mini`/`deepseek-v4-pro` ≤ 30000),
  and reject an unknown model id — a fatal `ConfigError` at startup, so a
  misconfiguration can never reach the wire. The approved-model→cap table lives in
  one constant.

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
  2026-08-24, Q-BE-25.]**
- **TASK-028**: BE — AI_CURIOUSNESS investigation loop (text-action protocol over
  `RepoInspector`, env loop-limit, bounded reads, safe early exit) + worker wiring
  (build the real inspector over `clone.dir`, map internal→wire stages per D-wire)
  + end-to-end env verification. (depends on: TASK-026, TASK-027)

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
  - **Q-REQ008-3 confirmed:** the per-stage token budgets are `max_tokens` (the
    completion cap), agreeing with Porter's high-confidence reading and the confirmed
    gap ("no max_tokens per stage").
