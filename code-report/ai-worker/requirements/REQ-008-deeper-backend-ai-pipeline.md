# REQ-008: Deeper backend AI analysis pipeline (5-stage redesign)
- Status: DELIVERED
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
   - `gpt-4.1-mini`, `deepseek-v4-pro`, `deepseek-v4-flash` — 40–50% reasoning —
     **≤ 30000 token per call**, may be called across several rounds
     (`deepseek-v4-flash` added 2026-08-24 from the Q-REQ008-4 answer: *"ระดับเดียวกันกับ
     gpt-4.1mini"* — same tier/cap as `gpt-4.1-mini`)
   The `model` assigned to each of the five stages must be **env-configurable**.

7. **Fallback models (added 2026-08-24 from Q-REQ008-1 answer).** The system must be
   able to fall back to a **backup model** when the primary model chosen for a call
   **runs out of credit/quota or errors**. The stakeholder named `deepseek-v4-pro` and
   `deepseek-v4-flash` as the fallback models (verbatim: *"เอาไปเป็นตัวสำรองเมื่อ ตัวหลัง
   เงินหมด หรือ error"*). The team designs the mechanism (how a credit-exhausted vs a
   generic error is detected against the AI API CENTER failure shapes, and the order
   between the two fallbacks), proposing it back to the stakeholder before ship.
   `deepseek-v4-flash` was a new model id; its tier / per-call cap are now **confirmed
   (Q-REQ008-4, 2026-08-24): same tier as `gpt-4.1-mini` → 40–50% reasoning, ≤ 30000
   token per call** (folded into Req 6).

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
- [ ] When a primary model call fails on credit-exhaustion or error, the call falls
      back to `deepseek-v4-pro` / `deepseek-v4-flash` (Req 7); the fallback design was
      confirmed back to the stakeholder before ship.

## Constraints
- **Stakeholder-mandated numbers (record faithfully, do not alter):** batch size 20;
  AI_COMMITS sequential; AI_CURIOUSNESS loop default 5; per-stage default `max_tokens`
  as listed; approved model ids + tiers + per-call caps as listed; **fallback models
  `deepseek-v4-pro` + `deepseek-v4-flash`, triggered on credit-exhaustion or error
  (Req 7, added 2026-08-24); `deepseek-v4-flash` tier/cap confirmed 2026-08-24
  (Q-REQ008-4) = 40–50% reasoning, ≤ 30000/call (same as `gpt-4.1-mini`)**. The stakeholder
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
  > answer (stakeholder via Porter, 2026-08-24): **delegated to the team as proposed**
  > — verbatim *"ให้ทีมเลือกตามที่เสนอ"* (let the team choose per what was proposed).
  > The team's proposed per-stage model mapping stands, subject to the standing rule
  > that any change is a proposal back to him before ship. **Two additions he made in
  > the same answer** (verbatim *"แต่ ดูmodel deepseek-v4-pro deepseek-v4-flash ด้วย ที่
  > แจ้งไป เอาไปเป็นตัวสำรองเมื่อ ตัวหลัง เงินหมด หรือ error"*): the models
  > `deepseek-v4-pro` and `deepseek-v4-flash` are to serve as **fallback / backup
  > models**, used when the primary model for a call **runs out of credit/quota
  > ("เงินหมด") or errors**. Captured as new **Requirement 7** + Constraints; `deepseek-
  > v4-flash` is a **new model id** (not previously in the approved list) — its tier /
  > per-call cap were not stated → **Q-REQ008-4** (NON-BLOCKING). @Sober: the fallback
  > policy is new business intent for you to design into SPEC-007 / the model-config
  > work (how the fallback triggers off the AI API CENTER failure shapes, and the
  > pro-vs-flash order, are your design calls — propose back to him).
  >
  > **D3 final confirmation (stakeholder via Porter, 2026-08-25).** Porter proposed the
  > concrete per-stage model→stage default mapping for pre-ship sign-off and the
  > stakeholder confirmed it verbatim *"ตามนั้น"* (as proposed). The confirmed mapping —
  > which matches the built `STAGE_MODEL_DEFAULTS` byte-for-byte (Porter verified in
  > `code-report-back/src/config.ts` at `4bfc21e`) — is: **AI_PROJECT = `gpt-4.1-mini`,
  > AI_COMMITS = `gpt-4.1-mini`, AI_CURIOUSNESS = `grok-4-latest`, AI_UNDERSTANDING =
  > `gpt-4.1`, AI_WRITING = `gpt-4.1`.** All env-overridable; the standing "any change is
  > a proposal back to him" rule still applies. **Q-REQ008-1 is now CLOSED** — the D3
  > defaults are the confirmed ship defaults; no code change (they already ship as these).

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
  > answer (stakeholder via Porter, 2026-08-24): **yes — show them.** Verbatim
  > *"ต้อง นิดหน่อย แสดง พอสมควร ให้รู้ว่ากำลัง ทำสเต็ปไหนอยู่"* (yes; show it a little /
  > reasonably, so the user knows which step it is currently on). Per Sober's note this
  > is a **separate FE requirement** (surface AI_CURIOUSNESS + AI_UNDERSTANDING as their
  > own progress steps with Thai/English labels; note it also needs BE to emit the two
  > new wire stages, since SPEC-007 deliberately kept the wire at six). **Porter will
  > raise this as REQ-009 in a following PM unit** — it does NOT change REQ-008, which
  > stays backend-only, and does NOT block the current BE work (Jason continues on the
  > six-stage wire). Recorded here so the intent is not lost.

- **Q-REQ008-4 (NEW, Porter → human, NON-BLOCKING) — tier/cap for `deepseek-v4-flash`.**
  The stakeholder named `deepseek-v4-flash` as a fallback model (Q-REQ008-1 answer), but
  it is **not** in the originally approved list (Req 6) and he did not state its
  brain-effort tier or per-call token cap. The config-validation table
  (`APPROVED_MODEL_CAPS`, TASK-025) needs a cap to accept it. **Working default (safe,
  since he delegated the mapping): the team proposes a tier/cap for `deepseek-v4-flash`
  and he confirms before ship.** NON-BLOCKING — fallbacks are still bounded by each
  stage's `max_tokens`; Porter is relaying this alongside the confirmation loop. Note:
  `deepseek-v4-pro` already has a tier/cap (40–50% reasoning, ≤ 30000/call) from Req 6.
  > answer (stakeholder via Porter, 2026-08-24): **same tier as `gpt-4.1-mini`** —
  > verbatim *"ระดับเดียวกันกับ gpt-4.1mini"*. Per Req 6, `gpt-4.1-mini` is the
  > **40–50% reasoning** tier with a **≤ 30000-token-per-call** cap; so
  > `deepseek-v4-flash` takes the **same 40–50% tier, ≤ 30000/call** — identical to
  > `deepseek-v4-pro`. Folded into Req 6 (approved-model list) + Constraints below.
  > @Sober: `deepseek-v4-flash` now has a confirmed cap → add it to the config
  > validation table (`APPROVED_MODEL_CAPS`, TASK-025's `.env`/config work) at
  > **30000** when you design the fallback into SPEC-007. Q-REQ008-4 is now CLOSED.

- **PM ACCEPTANCE CHECK (Porter, 2026-08-25).** REQ-008 reached `SPEC_DONE`
  2026-08-25 (all five SPEC-007 tasks TASK-025..029 built + SA-reviewed DONE; last
  piece TASK-029 at `4bfc21e`; Sober re-ran the gates: `typecheck` exit 0, `bun test`
  **287 pass / 0 fail**). Checked the built work against the Acceptance Criteria:
  - **Technically satisfied (built + SA-verified):** the five-stage order; explicit
    `model` + `max_tokens` on every call, env-configurable per stage; AI_PROJECT ×1
    with tree + `.md` digest + extra context; AI_COMMITS 20/batch sequential;
    AI_CURIOUSNESS env loop-limit (default 5) with file/tree/search + early stop;
    AI_UNDERSTANDING own-reasoning text before AI_WRITING; AI_WRITING env pass-limit
    by-topic → one report; default `max_tokens` per stage; approved model ids +
    per-call cap enforcement; fallback to `deepseek-v4-pro`/`deepseek-v4-flash` on
    credit-exhaustion/error (mechanism built).
  - **NOT yet satisfied — the one AC that gates ship:** *"the fallback design was
    confirmed back to the stakeholder before ship"* (Req-7 AC). That sign-off has not
    happened → **Q-SA-25** is still open. Two further pre-ship business sign-offs are
    also open: **Q-REQ008-1 (D3)** the proposed per-stage model→stage default mapping
    (standing rule: any mapping ships only after he confirms), and **Q-SA-24** the two
    user-facing report changes that fell out of D2 (prompt-style header; Contributors
    section + Commit appendix no longer guaranteed).
  - **Verdict:** build is COMPLETE and SA-verified, but REQ-008 **stays `SPEC_DONE`,
    NOT `DELIVERED`.** Three pre-ship sign-offs (Q-REQ008-1 D3, Q-SA-24, Q-SA-25) are
    business decisions I will not guess — routed to the human 2026-08-25 (in Thai).
    All three are **env/config or wording** decisions, so answers change config or a
    small string, not the built code. They gate only the final `DELIVERED`; no team
    member is blocked (all SPEC-007 BE work is DONE). When the human answers, Q-SA-24 +
    Q-SA-25 get transcribed into SPEC-007 §Questions by Sober and any change becomes a
    SPEC-007 amendment + new task, then REQ-008 → `DELIVERED`.
  - **Separate follow-up (NOT this unit):** REQ-009 (surface AI_CURIOUSNESS +
    AI_UNDERSTANDING as their own progress steps, Q-SA-23 = "yes, show them") is a new
    FE requirement for a later PM unit — it does not affect this backend-only REQ-008.

- **DELIVERY (Porter, 2026-08-25) — REQ-008 → `DELIVERED`.** The stakeholder answered the
  three pre-ship sign-offs (in Thai, verbatim below); every gating AC is now met and the
  built work needs **no code change** — it already ships as confirmed. REQ-008 moves
  `SPEC_DONE` → `DELIVERED`.
  - **Q-REQ008-1 (D3 model→stage mapping) — CONFIRMED** *"ตามนั้น"*. The five defaults
    are exactly what the code ships (verified in `code-report-back/src/config.ts` at
    `4bfc21e`). Closes the "approved model ids used" AC + the standing confirm-before-ship
    rule.
  - **Q-SA-25 (Req-7 fallback policy) — ACCEPTED AS PROPOSED** (*"ก"* = option a / as
    proposed, then *"ไปเลย"* = go ahead). This clears the one ship-gating AC — *"the
    fallback design was confirmed back to the stakeholder before ship"*. All four sub-items
    ship as designed: trigger = fall back on any retryable provider/model-side exhaustion
    (not a 4xx), credit-vs-error **log-only** (he did **not** ask for a true distinction →
    **no DATA REQUEST needed**); order `deepseek-v4-pro`→`deepseek-v4-flash`; the 30000
    clamp accepted (degrade rather than fail); empty `AI_FALLBACK_MODELS` disables. Built
    config already matches (`FALLBACK_MODELS_DEFAULT = "deepseek-v4-pro,deepseek-v4-flash"`).
  - **Q-SA-24 (two user-facing report effects of D2) — ACCEPTED, with two stakeholder-led
    follow-ups (neither blocks delivery of the current build):**
    - *Header* (prompt-style `REPORT PARAMETERS:` labels): **accepted as-is** —
      *"รับได้ ขอดูก่อนค่อยกลับมาแก้"* (acceptable; I'll look first and come back to fix
      later). Ships unchanged; any later polish is a **new** stakeholder request, not a
      REQ-008 rework.
    - *Contributors section + Commit appendix no longer guaranteed*: **remove if not
      useful** — *"ถ้าไม่มีประโยชน์ต่อรายงาน เอาออกไป"* (if it adds no benefit to the
      report, take it out). He delegated the usefulness judgment to the team. The current
      5-stage build already does not guarantee these sections, which is consistent with his
      intent, so delivery is not blocked. Routed to @Sober as a **design-judgment
      follow-up**: assess whether the orphaned Contributors/Commit-appendix (`REPORT_STRUCTURE`
      / `stage3System` in `prompts.ts`) add value; if not, a **SPEC-007 amendment + new
      task** removes the dead code — **not** a rework of the DONE TASK-025..029.
  - **Verdict:** all Acceptance Criteria met and SA-verified (Sober's gates at `4bfc21e`:
    `typecheck` exit 0, `bun test` 287 pass / 0 fail). **REQ-008 = `DELIVERED` 2026-08-25.**
    Two non-blocking follow-ups remain for later units: the appendix-cleanup design call
    (@Sober) and REQ-009 (FE progress-UI). Stakeholder informed in Thai.
