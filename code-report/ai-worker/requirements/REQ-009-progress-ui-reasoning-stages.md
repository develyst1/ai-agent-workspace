# REQ-009: Show the two new reasoning stages (AI_CURIOUSNESS, AI_UNDERSTANDING) in the report progress bar
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-08-24 by stakeholder (Q-SA-23 answer); captured as a REQ 2026-08-25 by Porter
- Deadline: none

## Problem / Goal
While a report is generating, the frontend shows a progress bar with a fixed set
of steps. The deeper backend pipeline delivered in REQ-008 actually runs **two
extra reasoning stages** — `AI_CURIOUSNESS` (the AI explores the repository to
gather what it needs) and `AI_UNDERSTANDING` (the AI reasons about the material
before writing) — but the user never sees them: to keep REQ-008 backend-only,
SPEC-007 deliberately **collapsed them onto existing wire stages**
(`AI_CURIOUSNESS` → `AI_COMMITS`, `AI_UNDERSTANDING` → `AI_WRITING`), so the
progress bar still shows only the original six steps.

The stakeholder asked for these reasoning steps to be surfaced so that a user
watching a report generate can tell which step the analysis is currently on —
making the (sometimes long) wait transparent and letting the added depth of
analysis be visible. Verbatim (Q-SA-23, 2026-08-24, via Porter):
*"ต้อง นิดหน่อย แสดง พอสมควร ให้รู้ว่ากำลังทำสเต็ปไหนอยู่"* — yes; show it a
little / reasonably, enough for the user to know which step it is on.

## Requirement
1. The report progress UI must show `AI_CURIOUSNESS` and `AI_UNDERSTANDING` as
   their **own visible steps**, distinct from `AI_COMMITS` and `AI_WRITING`, so a
   user watching a report generate can tell which step the job is currently on.
2. Each new step must have a **user-facing label**, Thai-primary /
   English-secondary consistent with REQ-007, and styled like the existing
   progress-step labels.
3. The progress indicator's total and current-position must correctly account for
   the added steps — no broken/`-1` position or missing label when the backend
   reports a new stage.
4. This is **display-only**: it changes what the user sees, not what the backend
   computes or what the finished report contains.

## Acceptance Criteria
- [ ] During generation, the progress bar renders a distinct step for
      `AI_CURIOUSNESS` and a distinct step for `AI_UNDERSTANDING`, separate from
      `AI_COMMITS` and `AI_WRITING`.
- [ ] While the backend is in each of those stages, the progress UI highlights
      that step as the current one (the user can see "which step it's on").
- [ ] Both new steps show a Thai-primary label consistent with the other steps;
      no raw stage key or empty/`-1` state is ever shown.
- [ ] The finished report content is unchanged versus REQ-008 (this REQ adds no
      backend computation, only visibility of progress).

## Constraints
- **Depends on the backend emitting the two stages on the wire.** SPEC-007's
  wire progress contract for `GET /api/reports/:jobId` was deliberately kept at
  the current six stages (`CLONING, READING_CODEBASE, READING_COMMITS, AI_PROJECT,
  AI_COMMITS, AI_WRITING`), with the two reasoning stages mapped onto existing
  ones. Surfacing them therefore also requires the wire to carry the two new
  stage strings — i.e. a coordinated **backend + frontend** change, not a
  frontend-only change. *How* that is done (and whether it is a SPEC-007
  amendment plus a new backend task or a new spec) is Sober's design call; this
  REQ states only the outcome the user must see. REQ-008 remains DELIVERED; this
  is additive, not a rework of its shipped tasks.
- Thai-primary / English-secondary string convention from REQ-007 governs the two
  new labels.
- Scope of "show": the stakeholder asked to show the steps "a bit / reasonably"
  — enough to know the current step. This does not ask for verbose per-step
  detail or sub-progress within a step.

## Out of Scope
- Streaming or displaying the **actual reasoning / curiosity content** (the text
  the AI generates while exploring or reasoning) to the user — only the step's
  existence and current-step highlight are in scope.
- Any change to REQ-008's backend computation, model selection, token budgets, or
  report content.
- Any visual redesign of the progress bar beyond adding the two steps and their
  labels.

## Questions
- **Q-REQ009-1 (Porter → human, NON-BLOCKING) — exact labels for the two new
  steps.** The two steps need user-facing display text (Thai primary + English
  secondary, per REQ-007). I am **not** inventing these strings. Working default,
  same pattern as REQ-007's string sign-off: the team drafts Thai-primary labels
  in keeping with the existing step labels and the stakeholder confirms them
  before ship; SA can design the structure against i18n keys without the final
  text, so this does not block spec/design work.
  > answer: (pending — stakeholder via Porter)
