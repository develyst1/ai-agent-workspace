# TASK-139: Course create — subject is course-level, not per-row (FE)
- Source: SPEC-045 (REQ-054), Part 2
- Status: DONE (code — SA-reviewed Sober 2026-08-17); course-create render pass → @Tanya
- Assignee: @Fern (FE)
- Depends on: none (pairs with TASK-138)

## What to do (smart-scheduler-front)
`CreatePlanFlow.tsx` already has a **course-level** program Select (`:216-226`, bound to `subjectId`,
required), but a per-row subject rides into `confirmCreate` (`:148-153`) via the `PlanModal` session
editor, whose `courseSubjectLocked` is deliberately false in create mode (`PlanModal.tsx:478`). Close it:
1. **Lock the per-row subject in course create mode:** extend `courseSubjectLocked` to cover the course
   create draft (drop the `!onLocalSave` exclusion for `plan.kind === "course"`), showing the read-only
   `Input.Wrapper` (`PlanModal.tsx:593-601`) seeded from the course-level `subjectId` instead of the
   Select (`:602-611`). (Reuses the exact TASK-133 mechanism.)
2. **`confirmCreate`:** stop sending per-row `subjectId` (send only the course-level subject; the BE
   already falls back to `input.subjectId`). The client then cannot emit mixed rows.

## Definition of Done
- [ ] In course create, subject is chosen **once** (the existing course-level Select); per-row subject is
      read-only, seeded from it. (AC-1, requirement 3)
- [ ] `confirmCreate` no longer posts per-row `subjectId` (or forces all rows to the course subject).
- [ ] Voucher / single / trial create flows still choose subject as before (guard is course-only). (AC-4)
- [ ] Existing course create still works end-to-end (uniform subject).
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · hallmark verdict pasted.

## Implementation Notes / Questions
**Fern 2026-08-18 — `smart-scheduler-front@dong`, uncommitted.** This closes the hole I flagged as TASK-133's Q1, so
thanks for turning it into REQ-054 rather than parking it.

### What changed (2 files, 3 edits)
1. **`PlanModal.tsx:478`** — `courseSubjectLocked` dropped its `!onLocalSave` exclusion:
   `plan.kind === "course" && target.kind === "move"`. The create-mode draft row now shows the **same** read-only
   `Input.Wrapper` TASK-133 built, seeded from the row's subject — which *is* the course-level `subjectId`, because
   `CreatePlanFlow` builds every draft row from the preview it ran with that subject (`:112-118`). No second seeding
   path, so the two can't disagree.
2. **`PlanModal.tsx` teacher `onChange`** — 🔴 **a bug the naive version of this change would have shipped.** That
   handler cleared `subjectId` on every teacher change (correct when the subject comes from the teacher's programs).
   On a locked course row the subject is the **course's**, so clearing it would blank the read-only value and — in
   create mode — trip `onLocalSave`'s `if (!teacherId || !subjectId)` guard (`:482`), making a draft row unsavable
   after a teacher swap. Now guarded: `if (!courseSubjectLocked) setSubjectId(null)`.
3. **`CreatePlanFlow.tsx` `confirmCreate`** — per-row `subjectId` is no longer sent; only the course-level one.
   **Verified the BE fallback rather than trusting the task note:** `scheduler.service.ts:1040` reads
   `subjectId: s.subjectId ?? input.subjectId`, so every row resolves to the course subject. The client now
   *cannot* emit a mixed course.

### DoD
- ✅ subject chosen **once** (the existing course-level Select, untouched); per-row is read-only, seeded from it.
- ✅ `confirmCreate` no longer posts per-row `subjectId`.
- ✅ **AC-4** — voucher move (`plan.kind === "voucher"`) and insert/extra fail the predicate and stay editable; single/
  trial don't use this editor. Voucher/single/trial create flows untouched.
- ✅ `bunx tsc --noEmit` **0** · `bun run build` **ok** · §3.5 greps on both files 0/0/0/0.
- 🔴 **"Existing course create still works end-to-end" — NOT verified in the UI.** The create flow runs through
  `PlanModal`, which will not mount in this session's non-compositing browser pane (`.mantine-Modal-root` present,
  `innerHTML` empty — re-confirmed this pass). Same blocker as 131/132/133; rides the @Tanya visual pass. The
  teacher-swap case in point 2 above is exactly what a rendered pass should try, so I've called it out for her.

### Questions
- **Q1 (worth one line in SPEC-045):** with per-row `subjectId` gone from the payload, `PlanSession.subject` in create
  mode is now purely decorative — it only feeds the read-only display. Fine today, but if anyone later re-adds a
  per-row subject to the create payload the lock has to move with it. Flagging so it's a recorded decision, not a
  thing someone rediscovers.
  > answer (Sober): **recorded in SPEC-045.** Agreed — in course create, subject is a course-level fact; the per-row
  > `subject` is display-only, and any future re-introduction of a per-row subject to the create payload must carry the
  > lock (and the BE guard, TASK-138) with it. Good flag.

## Review
**PASS ✅ (code — Sober 2026-08-17). Course-create render pass → @Tanya.** Reproduced: `bunx tsc --noEmit` **0** ·
§3.5 greps on both files **0**. Read the diffs:
- `courseSubjectLocked` extended to create mode (`PlanModal.tsx:479`, dropped `!onLocalSave`); payload omits `subjectId`
  when locked (`:530`); `confirmCreate` stops sending per-row `subjectId` (course-level only; verified the BE fallback
  `s.subjectId ?? input.subjectId` at `scheduler.service.ts:1040`, not trusted). Client now cannot emit a mixed course.
- 🔴 **Excellent defensive catch:** the teacher `onChange` cleared `subjectId` on every teacher change — on a locked
  course row that would blank the read-only value and trip `onLocalSave`'s guard, making a draft unsavable after a
  teacher swap. Guarded `if (!courseSubjectLocked) setSubjectId(null)` (`:592`). Exactly the kind of thing the naive
  change ships; caught it.
- AC-4 preserved (voucher move + insert/extra stay editable; single/trial don't use this editor).
- 🔴 **Course-create end-to-end not verifiable headless** (PlanModal won't composite) → @Tanya; the teacher-swap case is
  flagged for her. **Verdict: code DONE.** With TASK-138 (guard) + TASK-140 (column), **REQ-054 is code-complete** —
  closes on Tanya's render pass + the owner deploying `0018`.
