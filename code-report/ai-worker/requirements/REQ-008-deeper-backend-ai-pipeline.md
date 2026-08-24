# REQ-008: Deeper backend AI analysis pipeline (5-stage redesign)
- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-24 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
The current backend AI pipeline (REQ-001 / SPEC-001 / TASK-004) is three stages —
**AI_PROJECT → AI_COMMITS → AI_WRITING**. After running the system for real
(confirmed 2026-08-24), the stakeholder reports that every AI API CENTER call
currently goes out with **no explicit `model` and no explicit `max_tokens`**. As a
result the report is shallow — close to a direct translation of the raw commit data —
and the team has no per-stage control over which model does the reasoning or how large
each answer may be.

The stakeholder wants the pipeline to reason **more deeply** ("ให้มันลึกขึ้น") — to
actually understand what the code does before it writes — and to be **tunable per
stage from env**. Verbatim intent: *"แก้ pipeline ด้วย ให้ มันลึกขึ้น"*.

## Requirement
The system must **replace the current 3-stage pipeline with a 5-stage pipeline**.
For **every** AI API CENTER call in every stage, both `model` and `max_tokens` must be
sent explicitly and must be configurable from environment variables — no call may go
out without both.

1. **AI_PROJECT** — called **once**. Builds an overall understanding of the project.
   Its input includes the repository **file tree**, a **digest of the `.md` files**,
   and the user's **extra free-text context**. Default `max_tokens` = **20000**
   (env-overridable).

2. **AI_COMMITS** — called **N times**. Analyses commits **one batch at a time,
   20 commits per batch**, with batches fired **sequentially (one after another, NOT
   in parallel)**. Default `max_tokens` = **20000** per call (env-overridable).

3. **AI_CURIOUSNESS** — an iterative investigation **loop** with a max-iteration limit
   configured in env, **default 5**. On each iteration the stage:
   - (a) judges whether the commit data gathered so far is **missing information**
     needed to truly understand how the code works;
   - (b) if information is missing, it may inspect the **real project files** — look at
     the **folder structure** to decide which files are relevant, **open a specific
     file path** directly, and/or **search a word** across the project — in order to
     read the code related to the commits and gather more information;
   - (c) then re-asks: *given the data + commits I now have, is information still
     missing?* If nothing is missing it **exits to the next stage**; otherwise it
     **loops** until the max limit is reached.
   Default `max_tokens` = **50000** per call (env-overridable).

4. **AI_UNDERSTANDING** — writes the AI's own reasoning down **as text**. It takes the
   extra information found in stage 3 **+** the commit code changes and works out what
   things actually are, where they connect, what connects to what — forming its **own
   understanding first, as a block of thought**. It must **not** translate the raw data
   straight through; it must think it through and understand it itself before writing.
   Default `max_tokens` = **40000** per call (env-overridable).

5. **AI_WRITING** — writes the **final report**. **Not necessarily a single call**: a
   limit is configured in env (stakeholder's example: 3). The stage uses AI to decide
   how many passes to run; when the limit is e.g. 3, it **splits the commits + gathered
   data into that many parts, BY TOPIC**, and writes **one part per pass** — all passes
   together producing the final report. Default `max_tokens` = **50000** per call
   (env-overridable).

6. **Every stage must send an explicit `model`.** The stakeholder confirmed the
   following model ids are approved for use, called by **exact id**, grouped by
   "brain-effort" tier with a **per-call token cap** (his words kept):
   - `gpt-4.1` — deep work / 100% reasoning — **≤ 50000 token per call**
   - `grok-4-latest` — 80% reasoning — **≤ 50000 token per call**
   - `gpt-4.1-mini`, `deepseek-v4-pro` — 40–50% reasoning — **≤ 30000 token per call**,
     may be called across several rounds
   The `model` assigned to each of the five stages must be **env-configurable**.

## Acceptance Criteria
- [ ] The pipeline runs the five stages **in order**: AI_PROJECT (×1) → AI_COMMITS (×N)
      → AI_CURIOUSNESS (loop) → AI_UNDERSTANDING → AI_WRITING (×1..limit).
- [ ] **Every** AI API CENTER call carries an explicit `model` and `max_tokens`; none
      is left empty/defaulted.
- [ ] `model` and `max_tokens` for each of the five stages are read from **env**;
      changing an env value changes what the call sends — verified per stage.
- [ ] AI_PROJECT is called **exactly once** and its prompt includes the file tree +
      a digest of `.md` files + the extra context.
- [ ] AI_COMMITS batches commits at **20/batch** and fires batches **sequentially**
      (never in parallel).
- [ ] AI_CURIOUSNESS honours an **env loop-limit (default 5)**, can read a file by
      path / list the folder structure / search a word in the project, and **stops
      early** when it judges no information is missing.
- [ ] AI_UNDERSTANDING produces its **own reasoned understanding text** (not a
      pass-through translation of the inputs) **before** AI_WRITING runs.
- [ ] AI_WRITING honours an **env pass-limit**, splitting the material **by topic**
      across the passes when the limit > 1, and the passes together yield **one** final
      report.
- [ ] Default `max_tokens` are AI_PROJECT **20000**, AI_COMMITS **20000**,
      AI_CURIOUSNESS **50000**, AI_UNDERSTANDING **40000**, AI_WRITING **50000** — all
      overridable from env.
- [ ] Only the stakeholder-approved model ids are used and each call stays within its
      per-call token cap.

## Constraints
- **Stakeholder-mandated numbers (record faithfully, do not alter):** batch size 20;
  AI_COMMITS sequential; AI_CURIOUSNESS loop default 5; per-stage default `max_tokens`
  as listed; approved model ids + tiers + per-call caps as listed. The stakeholder
  explicitly invited the team to help think it through and adjust
  (*"ช่วยฉันคิดได้ นะ แก้ได้"*) — but **any change to these numbers is a proposal back
  to him**, not a silent redesign.
- **The confirmed gap this REQ closes** (stakeholder ran the system for real,
  2026-08-24): AI calls today send **no `model` and no `max_tokens`** per stage. Both
  must become explicit and env-configurable for every stage.
- Builds on **REQ-001**'s model-tiering rule (per-step model choice; mid-tier for
  code-reading, cheap for orchestration). This REQ **supersedes the 3-stage shape** of
  that pipeline (REQ-001 Req 3 / TASK-004) but not REQ-001's other requirements.
- No SQL / no real-environment work by the team. The AI API CENTER contract is the one
  already on file (`../project-docs/AI-API-CENTER.md`): `POST /chat` with
  `{ provider?, model?, temperature?, max_tokens?, messages }`; success/failure shapes
  as documented there.

## Out of Scope
- Frontend changes — this is a **backend pipeline redesign only**.
- Email delivery, auth, and the git-clone/tree/commits layer (unchanged).
- A `temperature` policy (the stakeholder did not raise it).

## Questions
(SA Lead answers here as `> answer: ...`. Items routed to the human are marked.)

- **Q-REQ008-1 (ROUTED TO HUMAN, NON-BLOCKING) — model→stage mapping.** The stakeholder
  gave the approved models, their tiers and per-call token caps, but did **not** state
  which model each of the five stages must use. The per-stage default `max_tokens`
  partly force it: AI_CURIOUSNESS (50000), AI_WRITING (50000) and AI_UNDERSTANDING
  (40000) all exceed the cheap tier's **30000** cap, so those stages cannot run
  `gpt-4.1-mini` / `deepseek-v4-pro` at their default budget. **Does the stakeholder
  want to confirm an explicit model per stage, or delegate the mapping to the team
  within his tier rules?** Working default (safe, reversible): the team proposes a
  mapping derived from his tiers + budgets and he confirms before ship. Porter is
  relaying this to the human; drafting the spec structure does not wait on it.

- **Q-REQ008-2 (SA design) — AI_WRITING assembly.** How do the N by-topic passes
  combine into the single final report — plain topic-section concatenation, or a final
  stitch/merge pass? Design detail for Sober; flagged so it is decided deliberately,
  not assumed.
  > answer (Sober, 2026-08-24, decision D2 in SPEC-007): **deterministic ordered
  > concatenation** of the by-topic sections behind a fixed header — **no extra AI
  > stitch call**. Faithful to the REQ ("all passes together produce the final
  > report") and avoids an unmandated extra call/cost; each writing pass is told the
  > full ordered topic list so sections don't overlap. Reversible to a stitch pass
  > later if the stakeholder wants tighter cross-section flow.

- **Q-REQ008-3 (interpretation, Porter's assumption — HIGH confidence, not a question
  to anyone unless Sober disagrees):** the per-stage "token" budgets are read as
  `max_tokens` (the completion cap sent on each call), consistent with the confirmed
  gap ("no max_tokens per stage"). If Sober reads them as a context-window budget
  instead, raise it here.
  > answer (Sober, 2026-08-24): **agreed** — budgets are `max_tokens` (the completion
  > cap sent per call). No disagreement; recorded as confirmed in SPEC-007.

- **Q-SA-23 (NEW, Sober → Porter, NON-BLOCKING for BE) — surfacing the new stages in
  the progress UI.** SPEC-007 keeps the wire progress contract at the current **six**
  stages (mapping `AI_CURIOUSNESS`→`AI_COMMITS`, `AI_UNDERSTANDING`→`AI_WRITING`) so
  REQ-008 stays backend-only as written — the FE progress ledger hardcodes six stages
  + their i18n labels and would break if two new stage strings appeared. **Does the
  stakeholder want the two new reasoning stages shown as their own steps in the
  progress bar?** If yes, that is a *separate FE requirement* (add two stages + Thai/
  English labels), Porter's to raise; BE proceeds either way. Full reasoning in
  SPEC-007 §API/Interface Design (D-wire) and §Questions.
