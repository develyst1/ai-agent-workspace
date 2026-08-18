# SPEC-049: Mark planned absences while creating a course (owner decision B)
- Source: REQ-045
- Status: ACTIVE

## Overview + the decision
Owner (B): a planned absence **declared at course creation is free** (does not touch `leaveUsed`); the
**same action later** (plan editor, mid-course) still consumes quota as REQ-030 decided. The create screen
gets the plan editor's planned-absence action, with a pre-save preview and the `MAX_WEEK` ceiling enforced.

## 🔴 The crux — a real persisted distinction (owner consequence 2)
Grounded finding: **today there is no way to tell a planned absence from a sick leave** — both are stored as
status `SICK_LEAVE` (`scheduler.service.ts:1589`); the plan-change `planned` boolean is **transient, never
persisted** (`validation.ts:257`). And the quota bump at `scheduler.service.ts:1591-1594` is **unconditional**
— today a planned absence *already consumes quota* (`planned:true` only skips the soft-lock, not the `+1`).

**So (B) needs a persisted birth-marker.** Design choice (SA): **a flag on `bookings`, NOT a new status enum.**
- Add `bookings.planned_at_creation boolean not null default false` (migration; this repo owns `bookings`).
- The absent session keeps status **`SICK_LEAVE`** → every existing status-driven path (freelance holds
  `freelance-budget.ts`, live-set `course-plan.ts:7`, history `course-history.ts`, calendar/ICS, badges)
  behaves exactly as today with **zero branches to add**. The flag is read only where the two events must
  differ: the quota increment and the plan/history label.
- Rejected: a new `PLANNED_ABSENCE` enum value — cleaner semantically but every status switch in the codebase
  would need a branch (large blast radius) for no functional gain over the flag.

**The birth-marker rule:** `planned_at_creation = true` **only** when the absence is marked during
`createCoursePackage`. A later plan-editor mark-absence leaves it `false` → consumes quota (REQ-030 unchanged).
This is the "declared before the course's first session runs" distinction — a data fact, not "which screen."
It resolves the REQ's own "one behaviour, two entry points" constraint: the *action* is identical (mark
absent → append EXTENDED → extend end date); only the **quota side-effect** differs, keyed by the flag.

## Flow (BE)
- **`createCoursePackage`** accepts marked-absent weeks. For each: place the session as `SICK_LEAVE` with
  `planned_at_creation = true` and append the `EXTENDED` make-up — **reuse the reconcile engine**
  (`reconcileCoursePlan` / the same append+ceiling logic the plan editor uses) so total live = `size`,
  "one behaviour" holds by construction.
- **Quota:** the `leaveUsed += 1` becomes **conditional — skip when `planned_at_creation`** (creation-time
  free). Check-in sick-leave (`:1838`) and later plan-editor mark-absence keep consuming (flag false). (AC-5)
- **Ceiling at creation (new guard):** creation never checked `MAX_WEEK` (it doesn't extend). Under (B) the
  ceiling is the **only** limit → enforce it: if any placed/appended session `> courseExpiry(startDate, size)`,
  **reject the create** with the ceiling-named reason (reuse `exceedsExtensionCeiling`/`courseExpiry`,
  `course-plan.ts:82`). (AC-3, now load-bearing)
- **Preview:** extend `POST /courses/preview` (`previewCoursePackage`) to render the absence-adjusted plan
  (n sessions · absent d · ends date) for the pre-save preview. (AC-1/AC-3)

## Flow (FE)
`CreatePlanFlow` → the shared `PlanModal` in `mode="create"`. Today create-mode exposes only *move* (no
mark-absence — `PlanModal.tsx:163-167` gates it on `!isCreate`). Add:
- a **`ไม่มาแน่นอน (ลาล่วงหน้า)` / Planned absence** control on create-mode course rows (mirror the edit-mode
  row action);
- a **create-mode preview** ("New plan: {n} sessions · absent {d} · ends {date}") — either a stateless
  `POST /courses/preview` that accepts marked-absent weeks (preferred, BE is source of truth) or client reuse
  of the mirrored leave math; **BE re-validates on save** (never trust FE math);
- surface the `EXTENSION_CEILING` refusal copy before save.

## Wording (from REQ-045; via `t(...)`, TH+EN)
Control `ไม่มาแน่นอน (ลาล่วงหน้า)` / `Planned absence` · preview `แผนใหม่: {n} คาบ · ไม่มา {d} · สิ้นสุด {date}` /
`New plan: {n} sessions · absent {d} · ends {date}` · ceiling refusal per REQ lines 67-68.

## Regressions (AC-4)
- Creating a course with **no** marked absence → today's exact plan (`input.sessions` default path untouched).
- The plan editor's own mark-absence (edit mode) **unchanged** — still `SICK_LEAVE`, still `leaveUsed +1`
  (flag false), still ceiling-bound. Everything after creation is REQ-030 as-is (consequence 3).
- Consecutive absent weeks allowed (Q2 = yes; ceiling caps the stretch).
- Every status-consuming path already handles `SICK_LEAVE` — the flag adds no new status, so no misclassification.

## Tasks
- **TASK-148 (BE, Jason)** — `bookings.planned_at_creation` column + migration (hand-authored `0019`, journal-
  registered, per the drizzle-README trap TASK-140 documented); `createCoursePackage` accepts marked-absent
  weeks and routes them through the reconcile engine with the flag set; **conditional `leaveUsed`** (skip when
  planned-at-creation); **ceiling guard at creation**; extend `previewCoursePackage`. Owner-run deploy for the
  migration. Unit tests: creation-with-absences → leaveUsed 0, not locked, later sick-leave still consumes;
  ceiling refuses; no-absence create unchanged.
- **TASK-149 (FE, Fern)** — create-mode Planned-absence control on course rows + the create-mode preview + the
  ceiling-refusal copy. Depends on TASK-148's preview shape. hallmark before REVIEW.

## Questions
- (Q1 answered = B; Q2 = consecutive weeks yes.) None blocking — the enum-vs-flag choice is made (flag).
