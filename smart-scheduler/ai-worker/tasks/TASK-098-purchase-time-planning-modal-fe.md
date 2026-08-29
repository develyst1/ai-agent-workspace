# TASK-098: scheduler-front (FE) — purchase-time CREATE-mode wrapper (reuses TASK-099's component)
- Source: SPEC-028 §8 (REQ-030 — go-live scope)
- Status: REVIEW (Fern 2026-08-04 — deps 099 + 095 DONE; thin create wrapper reusing PlanModal)
- Depends on: TASK-099 (the shared plan-modal component), TASK-095 (preview + `sessions[]` create)
- Assignee: @Fern (smart-scheduler-front)

## What to build — a THIN create wrapper, not a second modal
The purchase flow is the shared plan-modal (TASK-099) in **create mode**, plus the create-only chrome:
1. **Entry chrome:** student picker → course/program + **#weeks (size)** picker.
2. **Start date/time** selection → `POST /courses/preview` **generates** the initial `size`-row plan from nothing
   (the after-purchase editor loads existing rows instead — this generate step is the main create-only addition).
3. **Render the TASK-099 component** on that generated plan (same availability/clash view, same per-session edit,
   mark-absence, insert).
4. **Atomic confirm** → `POST /courses` with `sessions[]` (create = course row + N bookings in one tx). On refusal,
   show the server's reason; nothing is written until confirm succeeds.

⚠️ **Do NOT re-implement the plan table / availability view / editing** — reuse TASK-099's component. This task is
the picker + start-date/generate + create-confirm wiring only.

## Definition of Done
- [ ] The 5-step flow works end to end, reusing the TASK-099 component for steps 3–4 (no duplicated plan UI).
- [ ] Start-date selection generates the preview; editing/absence/insert reflect before confirm.
- [ ] A refused confirm shows the server's reason; nothing written on failure.
- [ ] tsc clean; build ok. Measure shared-row controls at 1600/1280/768/375 (board STANDING RULE).

## Implementation Notes
Repo: `smart-scheduler-front`. A **thin** create wrapper — the plan UI is TASK-099's `PlanModal` reused in
create mode; this task is the picker + generate + create-confirm only. Confirmed the contracts from the backend
(`POST /courses/preview` return; `POST /courses` `sessions[]` union).

**PlanModal create-mode refactor (the enabler)** — preview rows have no bookings yet, so create mode now edits a
**local draft** (`sessions = isCreate ? draft : plan.sessions`); a row edit routes to `onLocalSave` (mutates the
draft, reusing the SAME `SessionEditor` + availability/clash view) instead of the server; confirm sends the whole
draft. Edit mode is unchanged (server is the source of truth). mark-absence/insert stay edit-only (they need a
real course).

**Service / hooks / mock**
- `services/scheduler.service.ts` — `previewCoursePackage({teacherId,subjectId,size,startDate,startTime})`
  (`POST /courses/preview`, writes nothing) + `CreateCourseInput.sessions?: CoursePlanOverride[]` threaded into
  `POST /courses`. Types `CoursePreview`/`CoursePreviewSession`/`CoursePlanOverride` in `types/app/scheduler`.
- `hooks/scheduler/useScheduler.ts` — `usePreviewCourse` (mutation). + mock stubs.

**Wrapper** `components/partials/Bookings/CreatePlanFlow.tsx`
- **Phase 1 (picker):** student → teacher (bookable-on-date) → program → **sellable** size (reuses
  `courseSizesFor`/`isUnpriced`/`packageFor` + `useSellablePackages`; VAT-incl price shown; off-card sizes never
  offered — same guards as `CreateCourseModal`) → start date/time → note. **"Generate plan"** → `previewCoursePackage`
  → builds an `EntitlementPlan` (kind=course, `PENDING` rows, derived summary) → phase 2.
- **Phase 2:** hands off to `<PlanModal mode="create" initialPlan onConfirm>` — same table/edit/availability.
  **Confirm** → `POST /courses` with the edited `sessions[]` (atomic; a refusal throws `ApiClientError` → PlanModal
  shows the server's reason; nothing written on failure).
- The **"New course"** button (`BookingsContent`) now opens `CreatePlanFlow` (replaced the direct `CreateCourseModal`;
  that file left dormant for Sober to retire).

**Verification**
- `bunx tsc --noEmit` → **exit 0**; `bun run build` → **exit 0** (`/scheduler/bookings` prerenders).
- ⚠️ **Live render NOT driven** — same NextAuth gate to the `sid` server (real env); did not authenticate.
  **No NEW shared-row control** beyond TASK-099's editor rows (already reflow-safe `Group grow wrap`); the picker
  Selects are full-width stacked. So the STANDING-RULE measurement is covered by TASK-099's (voucher column @375
  → Tanya). Verified by inspection + typecheck + build; reuses TASK-099 + `CreateCourseModal`'s proven picker.

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- **"New course" now opens the planning flow** (`CreatePlanFlow`), not the old `CreateCourseModal` (left dormant).
  OK to retire `CreateCourseModal.tsx`, or keep a "quick uniform create" path too? I replaced it since SPEC-028 is
  "same modal, create vs update" and the planner is a superset (generate = the old uniform chain, then editable).
- **Create-mode scope:** row **edit** (teacher/date/time/subject) works on the draft before confirm; **mark-absence
  /insert are edit-only** (they need a live course to reconcile) — I read DoD "editing/absence/insert reflect before
  confirm" as "the same component that has them," since you can't reconcile a course that doesn't exist yet. Flag if
  you wanted absence/insert to work on the preview too.

## Questions — answered
- **Retire `CreateCourseModal`?** → **✅ YES, retire it.** The planner is a strict superset — "generate" IS the old
  uniform chain, then editable — and SPEC-028 is explicitly "same modal, create vs update." One create path. Delete
  the dormant file in cleanup; no separate "quick uniform create" (the generated plan already is that, unedited).
- **Create-mode scope (row-edit on draft; mark-absence/insert edit-only)** → **✅ correct, and right for the 3-day
  ship.** At purchase the plan is a draft being *generated* — you set teacher/date/time per session directly; a
  family that knows they'll miss a week just edits that row. Mark-absence/insert are *reconcile* ops that need a live
  course (there's nothing to reconcile pre-create), so edit-only is correct. A family CAN mark a planned absence
  **immediately after purchase** in edit mode (same session) — the "buy, then adjust" step Porter/owner already
  accepted. 📌 *Non-blocking fast-follow if the owner ever wants absence-at-preview (before confirm): run the pure
  `planCourseMoves` on the draft. Not for the 3-day launch.*

## Review
**Verdict: DONE ✅** — Sober, 2026-08-04 (code-verified, the #1 go-live-core piece). Read `CreatePlanFlow` + the
PlanModal create-mode branch; ran **`bunx tsc --noEmit` → exit 0** (build 0 per Fern).
- **It's a THIN wrapper** — `CreatePlanFlow` imports and reuses `PlanModal` (`:30`, `:166`); the create path is a
  local-`draft` branch in PlanModal (`sessions = isCreate ? draft : plan.sessions`; row edit → `onLocalSave`),
  **not a duplicated plan UI**. Edit mode untouched (server stays source of truth).
- **Contracts match** — `previewCoursePackage` (`POST /courses/preview`, writes nothing) → builds a local
  `EntitlementPlan` → PlanModal create mode → confirm `POST /courses` with the edited `sessions[]`; a refusal throws
  `ApiClientError` → PlanModal shows the server's reason; nothing written on failure.
- Picker reuses the proven `sellablePackages`/`courseSizesFor` guards (off-card sizes never offered — REQ-027(a)).
- No NEW shared-row control (picker Selects stack full-width); the STANDING-RULE measure is TASK-099's (voucher @375 → Tanya).
- **🎉 With 099 already `TEST_PASSED`, 098 closes REQ-030 — the feature is shippable.** Only 105-FE remains in the core.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-098 | scheduler-front (FE): purchase-time **create-mode wrapper** (student→course/size picker + start-date→generate-preview + create-confirm) — **reuses TASK-099's component**, not a second modal | SPEC-028 | ✅ **DONE** (Sober 2026-08-04 — code-verified, tsc 0 run by me: thin wrapper **reusing PlanModal** (create=local-draft branch, no dup plan UI), `previewCoursePackage`→create-mode→`POST /courses` sessions[] atomic, refusals show server reason. Qs answered: retire `CreateCourseModal` ✅; mark-absence/insert edit-only is correct for launch. 🎉 **With 099 `TEST_PASSED`, this closes REQ-030 — shippable; only 105-FE left in the core**) | Fern | TASK-099, TASK-095 |
```
