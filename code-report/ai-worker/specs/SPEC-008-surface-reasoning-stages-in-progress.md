# SPEC-008: Surface AI_CURIOUSNESS + AI_UNDERSTANDING as their own progress steps
- Source: REQ-009
- Status: DONE (2026-08-25 — both TASK-030 + TASK-031 reviewed DONE by Sober; REQ-009 → SPEC_DONE)

## Overview

REQ-008 delivered a five-stage AI pipeline whose internal stage names are
`AI_PROJECT → AI_COMMITS → AI_CURIOUSNESS → AI_UNDERSTANDING → AI_WRITING`
(`code-report-back/src/ai/stages.ts`). To keep REQ-008 strictly backend-only,
SPEC-007's **D-wire** decision deliberately *folded* the two new reasoning
stages onto existing wire stages before reporting them
(`WIRE_STAGE_BY_INTERNAL`: `AI_CURIOUSNESS → AI_COMMITS`,
`AI_UNDERSTANDING → AI_WRITING`), so the wire progress contract and the
frontend ledger both stayed at the original **six** stages.

REQ-009 asks for those two reasoning steps to be **visible** in the progress
UI so a user watching a long report generate can tell which step it is on.

The whole change is to **un-fold** the D-wire mapping: carry the two internal
stages onto the wire as themselves (so the wire stage list and the FE ledger
grow from six to **eight**), and give each new step a Thai-primary label. The
pipeline already *announces* both stages unconditionally
(`code-report-back/src/ai/pipeline.ts` L180 `announce("AI_CURIOUSNESS")`,
L193 `announce("AI_UNDERSTANDING")`), so **no pipeline, worker-flow, report, or
model change is needed** — only the wire stage list, the identity of the
internal→wire mapping, and the frontend's mirror of that list plus two labels.

**Why this approach and not a parallel channel:** progress is already derived
end-to-end from a single ordered list — backend `JOB_STAGES` →
`stageProgress()` → wire `progress {current,total}` → frontend `REPORT_STAGES`
index. Growing that one list in both repos is the smallest change that makes
the two stages first-class everywhere (numbering, `current/total`,
current-step highlight) with zero new UI logic. A second, side-channel field
would duplicate the ledger logic and risk the two lists drifting.

## Wire contract change

`GET /api/reports/:jobId` → `progress` and `stage`. The **stage set grows from
six to eight**, in the exact order the pipeline announces them:

```
CLONING, READING_CODEBASE, READING_COMMITS,
AI_PROJECT, AI_COMMITS, AI_CURIOUSNESS, AI_UNDERSTANDING, AI_WRITING
```

- `stage` may now also be the string `"AI_CURIOUSNESS"` or `"AI_UNDERSTANDING"`.
- `progress.total` becomes **8** (it is derived from the list length, never a
  literal — `stageProgress()` in `jobs.ts`).
- `progress.current` is the 1-based index in the list above (e.g. AI_PROJECT
  stays 4; AI_CURIOUSNESS = 6; AI_UNDERSTANDING = 7; AI_WRITING = 8).
- Order is strictly increasing across a run, so the FE current-step highlight
  and progress never move backwards (the worker's `reportStage` dup-collapse is
  unchanged and still yields a monotonic sequence, now of eight unique stages).

The two wire stage **strings are fixed by this SPEC** (`AI_CURIOUSNESS`,
`AI_UNDERSTANDING` — identical to the internal names). BE emits them and FE
matches them against these exact literals, so the two tasks below can be built
independently with no coordination risk.

## Data Model

None. No schema, migration, or stored-shape change. `stage` is already a free
string column; the DB stores whatever `setStage` is given. Report content
(`reportMd`) is untouched.

## Flow

Backend, per run (worker):
1. Pipeline announces the five internal stages in order (unchanged).
2. Worker maps each internal stage to a wire stage via `WIRE_STAGE_BY_INTERNAL`
   — **now an identity map** (each internal name → the same wire name), instead
   of today's fold. `reportStage` collapses only *consecutive* duplicates
   (still needed: AI_COMMITS is announced once per batch), so the reported
   sequence is exactly the eight wire stages, in order.
3. `jobs.setStage` stores the stage; `jobResponse`/`stageProgress` derive
   `progress` as `{ current: index+1, total: 8 }`.

Frontend, while polling a RUNNING job:
4. `REPORT_STAGES` mirrors the eight-stage list in the same order.
5. `ReportProgress` renders one ledger row per stage; the row whose index equals
   the current stage's index is highlighted `current`, earlier rows `done`,
   later rows `pending` (existing logic — it already derives from
   `REPORT_STAGES` and `job.progress`, so it needs **no structural change**,
   only the two new list entries + two new labels).

Edge cases:
- No `-1`/raw-key state: every wire stage the backend can now emit has a
  matching `REPORT_STAGES` entry and a matching dictionary label in both
  languages, so `indexOf` never returns `-1` for a real stage and no raw key is
  ever shown (REQ-009 AC 3). This is the one hard correctness point — the FE
  list and both dictionaries must include **both** new stages.
- A job that fails or has no commits before reaching a stage is unaffected: it
  simply never reports the later stages, exactly as today.

## Non-functional

- Display-only: no change to backend computation, model selection, token
  budgets, or report content (REQ-009 Req 4 / AC 4).
- Accessibility unchanged: the ledger already carries state by icon + word, not
  colour alone, and `aria-valuemax` is bound to `total` (now 8).

## Labels (Q-REQ009-1 — DRAFT, pending stakeholder confirmation)

REQ-009 Req 2 requires Thai-primary / English-secondary labels per REQ-007, and
Q-REQ009-1 (Porter→human, NON-BLOCKING) reserves the **final** wording for the
stakeholder. Per SA-Lead boundaries I do **not** invent the shipped user-facing
string; I propose drafts, in the voice of the existing step labels
(`AI_PROJECT` = "วิเคราะห์ภาพรวมโปรเจกต์" / "Analysing the project";
`AI_COMMITS` = "วิเคราะห์งานที่ทำ" / "Analysing the work done";
`AI_WRITING` = "เรียบเรียงรายงาน" / "Writing the report"), for the stakeholder
to confirm or replace before ship:

| Stage | Draft `th` (primary) | Draft `en` (secondary) | Meaning |
|-------|----------------------|------------------------|---------|
| `AI_CURIOUSNESS` | สำรวจโค้ดเพิ่มเติม | Exploring the codebase | AI explores the repo to gather what it needs |
| `AI_UNDERSTANDING` | ทำความเข้าใจข้อมูล | Making sense of the findings | AI reasons about the material before writing |

**These are DRAFTS, not decisions.** They are routed to Porter → human as part
of Q-REQ009-1. FE builds the i18n keys now with these draft values so the
screen is complete and testable; the final text is a **one-line dictionary
edit** on confirmation, no structural rework. This does **not** block either
task's build (the structure is keyed, not literal). See §Questions Q-SA-26.

## Tasks

- TASK-030: BE — grow the wire stage list to eight; make `WIRE_STAGE_BY_INTERNAL`
  an identity map (un-fold D-wire); update the six→eight docs + tests.
  (depends on: —)
- TASK-031: FE — mirror the eight-stage list in `REPORT_STAGES`; add the two
  draft labels to both dictionaries; update the six→eight ledger docs.
  (depends on: —; end-to-end current-step highlight is verified against a real
  BE run once TASK-030 is also DONE — see the acceptance note in TASK-031)

Both tasks are independently startable — FE keeps its own copy of the stage
list (`code-report-front/src/types/api/main/report.ts`) and the wire strings are
fixed by this SPEC, so neither has to wait on the other to build and pass its
own gates. Full REQ-009 acceptance (the highlight tracking a live run through
all eight steps) is a combined local check once **both** are DONE.

## Questions

- **Q-SA-26 (Sober → Porter, NON-BLOCKING) — confirm the two draft step labels.**
  REQ-009 Q-REQ009-1 reserves the final user-facing text for the stakeholder.
  The team-draft labels are in §Labels above (`AI_CURIOUSNESS`:
  "สำรวจโค้ดเพิ่มเติม" / "Exploring the codebase"; `AI_UNDERSTANDING`:
  "ทำความเข้าใจข้อมูล" / "Making sense of the findings"). Please put these to
  the stakeholder (Thai) for confirm-or-replace, same pattern as REQ-007's
  string sign-off. **Non-blocking:** FE builds the keys with the drafts now; the
  final text is a one-line dictionary edit, not a rework. Only the shipped
  wording depends on the answer — the structure, wire change and highlight logic
  do not.
  > answer: (pending — stakeholder via Porter)
