# TASK-149: Planned absences at course creation (FE)
- Source: SPEC-049 (REQ-045)
- Status: DONE (code — SA-reviewed Sober 2026-08-19); rendered pass → @Tanya; Q1 undo-copy → @Porter · Q2 recorded

## Review
**PASS ✅ (code — Sober 2026-08-19).** Reproduced: `bunx tsc --noEmit` **0** · `bun test src/lib/scheduler/` **15/0** ·
§3.5 greps on both changed components **0**. Faithful: **one preview path** (`runPreview` serves generate + every
toggle → AC-2 holds by construction, no FE math); the draft renders absent→`SICK_LEAVE` / make-up→`EXTENDED`; the
toggle is offered **only on the `size` weekly rows** (not on make-ups — right call); preview line + ceiling refusal
(Alert + disabled Confirm with the reason, AC-3); **payload sends only the `size` weekly rows + `absentWeeks`** (make-ups
BE-appended — matches TASK-148's contract + avoids the FE deciding placement); AC-4 byte-identical when no absence
(`absentWeeks` undefined). Good contract-from-code discipline.
- **Q1 (undo label `ยกเลิกการลาล่วงหน้า`/`Remove planned absence`) → @Porter** — a toggle needs an undo string the REQ
  didn't supply; Fern shipped a faithful **draft** and flagged it rather than inventing copy silently (same as TASK-132).
  Porter confirms the final string.
- **Q2 recorded in SPEC-049:** the payload contract *"`sessions` = the weekly chain only; make-ups come from
  `absentWeeks`"* is load-bearing + invisible — if anyone later sends the full draft, create silently fails the
  `length===size` refine. Worth keeping next to the birth-marker rule.
- 🔴 **Rendered/hallmark not verifiable headless** (PlanModal won't composite) → @Tanya (with 131/132/133/139/143).
- **Verdict: code DONE.** REQ-045 is now code-complete end to end (148 BE + 149 FE); closes on Tanya's render pass +
  the owner-run `0019` deploy.
- Assignee: @Fern (FE)
- Depends on: TASK-148 (the create-mode preview shape + the marked-absent input)

## Context (why)
Staff should mark planned absences **at course creation** (like the plan editor), with the OBS-3 preview,
before saving. Today create-mode (`PlanModal.tsx` `mode="create"`) exposes only *move* — mark-absence is
gated on `!isCreate` (`PlanModal.tsx:163-167`).

## What to do (smart-scheduler-front)
1. Add a **`ไม่มาแน่นอน (ลาล่วงหน้า)` / Planned absence** control on **create-mode course rows** (mirror the
   edit-mode row action).
2. A **create-mode preview** — "New plan: {n} sessions · absent {d} · ends {date}" — driven by TASK-148's
   extended `POST /courses/preview` (BE is source of truth; don't trust FE math for the saved plan).
3. Surface the **`EXTENSION_CEILING` refusal** copy (REQ wording) before save.
4. Wording via `t(...)` (TH+EN): control `ไม่มาแน่นอน (ลาล่วงหน้า)` / `Planned absence`; preview
   `แผนใหม่: {n} คาบ · ไม่มา {d} · สิ้นสุด {date}` / `New plan: {n} sessions · absent {d} · ends {date}`;
   ceiling refusal per REQ.

## Definition of Done
- [ ] In create mode, staff can mark one or more weeks as a planned absence; the preview shows n sessions ·
      absent d · ends date **before** saving. (AC-1)
- [ ] Saving creates exactly the previewed plan. (AC-2)
- [ ] The ceiling refusal is shown with its reason, never a silent trim. (AC-3)
- [ ] No-absence create is unchanged; the edit-mode plan editor is untouched. (AC-4)
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · hallmark verdict pasted.

## Implementation Notes / Questions
(Fern fills in. Rendered pass → @Tanya, as with the other PlanModal work.)

---

## Implementation Notes (Fern 2026-08-18)
**`smart-scheduler-front@dong`, uncommitted — 5 files** (`PlanModal.tsx`, `CreatePlanFlow.tsx`,
`types/app/scheduler`, `services/scheduler.service.ts` + the mock, `dictionaries.ts`).

### Contract taken from Jason's code, not from the task text
`POST /courses/preview` accepts `absentWeeks: number[]` (1-based) and returns `absentWeeks · liveCount · endDate ·
exceedsCeiling` plus per-session `absent` / `makeup` (`validation.ts:168-176`, `scheduler.service.ts:1369-1380`).
`POST /courses` takes `absentWeeks` too, and **refuses `sessions.length !== size`** (`validation.ts:149`). That last
refinement decided the payload shape below.

### What changed
1. **One preview path.** `runPreview(weeks)` serves both the initial generate and every toggle, so the rows on screen
   are always **the server's answer for the current absence set** — never FE math. AC-2 holds by construction.
2. **The draft renders as what it will become:** an absent week maps to `SICK_LEAVE`, its appended make-up to
   `EXTENDED`. Every existing chip/label works unchanged, and staff see the real shape before saving.
3. **Toggle on the row.** Create-mode course rows get `ไม่มาแน่นอน (ลาล่วงหน้า)` in the existing `⋯` menu (mirrors
   edit mode); marking again offers the undo. **Offered only on the `size` weekly rows** — a make-up is the
   *consequence* of an absence, and letting staff declare one absent would be chasing their own tail. Implemented as
   a per-row `absenceLabelFor` returning `null` to hide, which also carries the different wording.
4. **Preview line + refusal.** `แผนใหม่: {n} คาบ · ไม่มา {d} · สิ้นสุด {date}` under the table (`tabular-nums`,
   spinner while the preview is in flight), and on `exceedsCeiling` the REQ's ceiling sentence as an Alert **plus** a
   disabled Confirm carrying the same sentence as a tooltip — refused with a reason, never a silent trim (AC-3).
5. **Payload (the subtle one).** `sessions` now sends **only the first `size` draft rows** — the weekly chain — with
   `absentWeeks` alongside. The make-ups are BE-appended: sending them would fail the length refinement *and* would
   mean the FE deciding placement, which is the BE's job. Per-row moves are still preserved.
6. **Mock updated** to mirror TASK-148's response, so the flow is exercisable offline (naive weekly make-up placement
   — the real one is availability-aware server-side; noted in the code).
7. **Quota:** create-mode `leaveUsed` stays **0** — decision (B) is that a declared absence is free, and showing it as
   consumed would contradict the rule being built.

### DoD
- ✅ AC-1 (mark ≥1 week, preview before saving) · AC-2 (save = preview, same BE call) · AC-3 (ceiling refusal + reason)
  — wired and typed.
- ✅ **AC-4 (no-absence create unchanged):** `absentWeeks` is sent as `undefined` when empty, so the request is
  byte-identical to today's; the edit-mode plan editor is untouched (all new behaviour is behind `isCreate`).
- ✅ `bunx tsc --noEmit` **0** · `bun run build` **ok** · `bun test src/lib/scheduler/` **15/0** · §3.5 greps on both
  changed components **0/0/0/0**.
- 🔴 **Rendered check + `hallmark audit` — NOT verified.** PlanModal still won't mount in this session's
  non-compositing pane. Rides the @Tanya pass with 131/132/133/139/143.

## Questions
- **Q1 (copy, one string):** REQ-045 supplies the control label, the preview line and the ceiling sentence — but not an
  **undo** label, which a toggle needs. I used `ยกเลิกการลาล่วงหน้า` / `Remove planned absence` as a **draft**. Same
  line I held on TASK-132: flagging invented user-facing copy rather than shipping it quietly. Porter's to confirm.
- **Q2 (worth one line in SPEC-049):** the payload contract is now *"`sessions` = the weekly chain only; make-ups come
  from `absentWeeks`"*. That is load-bearing and invisible — if anyone later makes the FE send the full draft, the
  create silently starts failing the length refinement. Worth recording next to the birth-marker rule.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-149 | scheduler-front (FE): create-mode **Planned absence** control on course rows + create-mode preview (`{n} sessions · absent {d} · ends {date}`) + ceiling-refusal copy | SPEC-049 (REQ-045) | ✅ **DONE (code — SA-reviewed Sober 2026-08-19)** · rendered → @Tanya · Q1 undo-copy → Porter. Reproduced tsc 0 · 15/0 · §3.5 clean. One preview path (AC-2 by construction), toggle only on `size` rows, payload = weekly-chain + `absentWeeks` (make-ups BE-appended), AC-4 byte-identical. ⇒ **REQ-045 code-complete (148+149)** → closes on Tanya render + owner `0019` deploy. — _prior:_ 🖥️ REVIEW (Fern 2026-08-18 — 5 files, uncommitted. Contract read from Jason's code, not the task text: preview returns `absentWeeks/liveCount/endDate/exceedsCeiling` + per-session `absent/makeup`, and **`POST /courses` refuses `sessions.length !== size`** (`validation.ts:149`) — which decided the payload. **One preview path** (`runPreview`) serves the first generate AND every toggle, so the rows on screen are always the server's answer for the current absence set ⇒ **AC-2 by construction**, no FE math. Draft renders as what it becomes (absent→`SICK_LEAVE`, make-up→`EXTENDED`) so existing chips/labels work unchanged. Toggle sits in the row `⋯` menu, **offered only on the `size` weekly rows** — a make-up is the *consequence* of an absence; declaring one absent would chase its own tail. Preview line `แผนใหม่: {n} คาบ · ไม่มา {d} · สิ้นสุด {date}` (tabular-nums + in-flight spinner); on `exceedsCeiling` the REQ sentence as an Alert **and** a disabled Confirm carrying it as a tooltip — refusal with a reason, no silent trim, no unexplained disabled button (AC-3). 🔴 **Payload subtlety:** `sessions` sends only the **first `size`** rows (the weekly chain) + `absentWeeks`; make-ups are BE-appended — sending them would fail the length refinement *and* move placement into the FE. Per-row moves preserved. Mock updated to TASK-148 shape so the flow runs offline. `leaveUsed` stays **0** (decision B — a declared absence is free). AC-4: empty ⇒ `absentWeeks: undefined` ⇒ request byte-identical to today; edit mode untouched. tsc **0** · build ok · tests **15/0** · §3.5 0/0/0/0. 🔴 rendered + hallmark → @Tanya. **Q1 — one invented string:** the REQ gives no *undo* label for a toggle; shipped `ยกเลิกการลาล่วงหน้า` / `Remove planned absence` as a **draft** for Porter. **Q2:** record the payload contract in SPEC-049 — load-bearing and invisible.) | Fern | TASK-148 |
```
