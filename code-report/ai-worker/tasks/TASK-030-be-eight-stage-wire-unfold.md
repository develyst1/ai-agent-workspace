# TASK-030: BE — grow the wire stage list to eight and un-fold the D-wire mapping
- Source: SPEC-008
- Status: DONE
- Depends on: none

## What to do

Make the two reasoning stages first-class wire stages. Repo:
`code-report/code-report-back`.

1. **`src/reports/jobs.ts` — `JOB_STAGES`.** Insert `"AI_CURIOUSNESS"` and
   `"AI_UNDERSTANDING"` into the list in pipeline-announce order, so it reads:
   ```
   "CLONING", "READING_CODEBASE", "READING_COMMITS",
   "AI_PROJECT", "AI_COMMITS", "AI_CURIOUSNESS", "AI_UNDERSTANDING", "AI_WRITING"
   ```
   `stageProgress()` already derives `total` from `JOB_STAGES.length`, so
   `progress.total` becomes 8 automatically — do **not** hardcode 8 anywhere.
   Update the doc comment above `JOB_STAGES` (currently "The six stages… total —
   six… a seventh would print Step 7/7") to describe the eight stages.

2. **`src/reports/worker.ts` — `WIRE_STAGE_BY_INTERNAL`.** Change it from a fold
   to an **identity** map: each internal stage maps to the wire stage of the
   same name:
   ```
   AI_PROJECT: "AI_PROJECT",
   AI_COMMITS: "AI_COMMITS",
   AI_CURIOUSNESS: "AI_CURIOUSNESS",
   AI_UNDERSTANDING: "AI_UNDERSTANDING",
   AI_WRITING: "AI_WRITING",
   ```
   Leave `reportStage`'s consecutive-duplicate collapse as-is (still required —
   `AI_COMMITS` is announced once per batch). Update the "six"/"folded onto
   existing wire stages" doc comments in this file (the header block ~L37-40,
   the inline comments ~L154 and ~L264-266) to say the wire now carries all
   eight internal stages as themselves.

3. **Docs elsewhere (comment-only, where the file is otherwise correct):**
   `src/ai/stages.ts` header (says the wire "stays six … folded onto existing
   wire stages") and `src/ai/pipeline.ts` L40 ("number of `stage` values (six)")
   are now stale — update the counts/wording to eight / identity. Do **not**
   touch pipeline logic.

4. **Tests.** Update the assertions that hardcode six:
   - `test/reports-worker.test.ts`: the "the six stages are announced…" test
     (rename to eight) — `expect(h.jobs.stages).toEqual([...JOB_STAGES])` at
     L178 already auto-tracks the list; the `progress.total` loop (~L187,
     `toBe(6)` → `toBe(8)`) and the `[1, 2, 3, 4, 5, 6]` sequence (~L188 →
     `[1, 2, 3, 4, 5, 6, 7, 8]`) must change. Confirm the fake AiClient run now
     reports **eight distinct** stages in order (the pipeline announces
     AI_CURIOUSNESS + AI_UNDERSTANDING unconditionally, so they are no longer
     collapsed into AI_COMMITS/AI_WRITING).
   - `test/reports-routes.test.ts`: the "total is 6…" test (~L298) → 8; the two
     `progress` assertions (~L350 `{current:1,total:6}` → `total:8`; ~L354
     AI_PROJECT `{current:4,total:6}` → `total:8`, current stays 4).
   - Add at least one assertion that a job at `AI_CURIOUSNESS` reports
     `{current:6,total:8}` and at `AI_UNDERSTANDING` `{current:7,total:8}`
     (proves the un-fold end-to-end, REQ-009 AC 1/2).

Do **not** change: the pipeline flow, the report markdown, model/token config,
`WorkerOptions`, `routes.ts`, or any DB/schema. This is the wire stage list +
the mapping identity only.

## Definition of Done
- [ ] `JOB_STAGES` has the eight stages in the order above; `WIRE_STAGE_BY_INTERNAL`
      is an identity map; no literal `6`/`8` count is hardcoded (all derived from
      `JOB_STAGES.length`).
- [ ] Stale "six"/"seven"/"folded" doc comments in `jobs.ts`, `worker.ts`,
      `stages.ts`, `pipeline.ts` updated to reflect eight identity-mapped stages.
- [ ] Tests updated + a new assertion covering `AI_CURIOUSNESS` (current 6/8) and
      `AI_UNDERSTANDING` (current 7/8).
- [ ] `bun run typecheck` exits 0 (run in `code-report/code-report-back`).
- [ ] `bun test` is green with the updated counts (report the pass/fail totals;
      current baseline is 287/0 at `4bfc21e`).
- [ ] Committed on its own commit off the current HEAD; `git status --porcelain`
      clean; record the commit hash + the exact files changed in §Implementation
      Notes.

## Implementation Notes (Jason, 2026-08-25)

Commit `803a44c` (parent `4bfc21e`, own commit, `git status --porcelain` clean).
Repo: `code-report/code-report-back`.

**Files changed (6):**
- `src/reports/jobs.ts` — inserted `"AI_CURIOUSNESS"` + `"AI_UNDERSTANDING"` into
  `JOB_STAGES` in pipeline-announce order (now eight). Updated the doc comment
  (six→eight; "seventh/Step 7/7" → "ninth/Step 9/9"). No literal count added —
  `stageProgress()` still derives `total` from `JOB_STAGES.length`, so
  `progress.total` is now 8 automatically.
- `src/reports/worker.ts` — `WIRE_STAGE_BY_INTERNAL` is now an **identity** map
  (`AI_CURIOUSNESS→AI_CURIOUSNESS`, `AI_UNDERSTANDING→AI_UNDERSTANDING`).
  `reportStage`'s consecutive-duplicate collapse left as-is (still needed for the
  per-batch `AI_COMMITS`). Updated the three "six/folded" doc comments (header
  block, the `reportStage` inline comment, the `onStage` inline comment).
- `src/ai/stages.ts` — comment-only: header now says the wire is eight and the
  mapping is identity. No code change.
- `src/ai/pipeline.ts` — comment-only: `StagePosition` doc "(six)" → "(eight
  since SPEC-008)". No pipeline logic touched.
- `test/reports-worker.test.ts` — renamed "six stages"→"eight stages"; the
  `progress` test now asserts length 8, `total` 8, sequence `[1..8]`; added a
  new test asserting a real run reports `AI_CURIOUSNESS` and `AI_UNDERSTANDING`
  as their own stages with `{current:6,total:8}` and `{current:7,total:8}`
  (SPEC-008 / REQ-009 AC 1/2, proved end-to-end against the fake AiClient run).
- `test/reports-routes.test.ts` — the "total is 6…" wire test → 8; the two
  `progress` assertions `total:6`→`total:8` (`current` unchanged: CLONING=1,
  AI_PROJECT=4).

**Out of scope, untouched (confirmed by diff):** pipeline flow, report markdown,
model/token config, `WorkerOptions`, `routes.ts`, any DB/schema.

**Verification (evidence):**
- `bun run typecheck` → exit 0 (`tsc --noEmit`).
- `bun test` → **288 pass / 0 fail** (807 expect, 20 files). Baseline was 287/0
  at `4bfc21e`; delta is exactly the one new un-fold test (the two existing
  count tests were edited in place, not added). The fake-AiClient worker run now
  reports **eight distinct** wire stages in order
  (`CLONING, READING_CODEBASE, READING_COMMITS, AI_PROJECT, AI_COMMITS,
  AI_CURIOUSNESS, AI_UNDERSTANDING, AI_WRITING`).
- `git status --porcelain` clean after commit.

No SQL, no DB, no environment touched.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** (Sober, 2026-08-25, at `803a44c`). Review only — no code
written, no SQL, no environment touched.

**Verified, not trusted.** Re-ran the gates myself in `code-report-back` (HEAD =
`803a44c`, `git status --porcelain` clean): `bun run typecheck` exit 0; `bun test`
**288 pass / 0 fail** (807 expect, 20 files) — matches Jason's evidence exactly
(baseline 287/0 at `4bfc21e`; delta is the one new un-fold test). `git show --stat
803a44c` = exactly the six named files (`jobs.ts`, `worker.ts`, `stages.ts`,
`pipeline.ts` + the two tests); own commit off `4bfc21e`.

**Conformance traced read-only vs SPEC-008 §Wire/§Flow + all DoD rows:**
- DoD 1: `JOB_STAGES` is the eight stages in pipeline-announce order
  (`…AI_PROJECT, AI_COMMITS, AI_CURIOUSNESS, AI_UNDERSTANDING, AI_WRITING`);
  `WIRE_STAGE_BY_INTERNAL` is a true identity map (each internal → same wire
  name). No literal `6`/`8` count anywhere — `stageProgress` derives
  `total` from `JOB_STAGES.length` and `JobStage` is
  `(typeof JOB_STAGES)[number]`, so type + total both track the list. Grepped
  `src/` for stray `six/seven`/`total: 6`/`toBe(6)`: the only remaining "six"
  hits are unrelated (`markdown.ts` dir depth; `jobs.ts` report-`params` keys)
  or the SPEC-008 comment itself.
- DoD 2: stale "six/seven/folded" doc comments updated in all four files
  (`jobs.ts` list header; `worker.ts` mapping header + the two inline comments;
  `stages.ts` header; `pipeline.ts` StagePosition note). Pipeline logic
  untouched (comment-only diff in `pipeline.ts`/`stages.ts`).
- DoD 3: new test asserts a real fake-AiClient run reports `AI_CURIOUSNESS`
  (`{current:6,total:8}`) and `AI_UNDERSTANDING` (`{current:7,total:8}`) as
  their own stages — un-fold proved end-to-end (REQ-009 AC 1/2). The
  count/sequence test now checks length 8, `total` 8, `[1..8]`.
- DoD 4/5: typecheck 0; 288/0 green. DoD 6: own commit `803a44c`, clean tree.
- Out of scope and untouched (confirmed by diff): pipeline flow, report markdown,
  model/token config, `WorkerOptions`, `routes.ts`, DB/schema. `reportStage`'s
  consecutive-dup collapse correctly left in place (still needed for per-batch
  `AI_COMMITS`).

No questions raised by Jason; none from me — the two wire strings are SPEC-008
verbatim, no user-facing string was invented (the Thai/English labels are FE's,
TASK-031, gated by Q-SA-26).

**REQ-009 stays `IN_SPEC` — not SPEC_DONE yet.** TASK-031 (FE ledger + labels)
is still `TODO`; full REQ-009 acceptance is the combined live-highlight run once
both tasks are DONE. Marking SPEC_DONE now would falsely report the requirement
as fully built.
