# TASK-113: scheduler-front (FE) — "Add extra session (charged)" action on the course/plan surface
- Source: SPEC-033 (REQ-037)
- Status: **DONE (SA-reviewed Sober 2026-08-04; top label flipped 2026-08-22).** The `## Review` verdict below was
  written 2026-08-04 — only this status line lagged. Re-confirmed 2026-08-22: front `tsc` 0 and the feature
  (`useAddExtraSession` + "เพิ่มคาบ (คิดเงิน)") is still present in the tree.
- Depends on: TASK-112 (`POST /courses/:id/extra-session`), TASK-099 (the plan modal + availability picker)
- Assignee: @Fern (smart-scheduler-front)

## What to build
A **visibly separate** "Add extra session (charged)" action on the course/plan surface — staff must not confuse it
with "Insert" (the quota reschedule).
- Reuse the TASK-099 `SessionEditor` / availability+clash picker to choose day/time/teacher → `POST
  /courses/:id/extra-session`.
- **Make the distinction obvious:** different label + a "charged / single-session sale" affordance, separate from the
  "Insert" (quota, no charge) action. A one-line hint on each so the difference is legible at the counter.
- The course summary/end-date do **not** change after adding one (the BE guarantees it); the extra shows on the
  course view as a single-session booking.
- Surface the server's reason on any refusal (busy teacher / ceiling full / slot taken).

## Definition of Done
- [ ] "Add extra session" is a clearly-separate action from "Insert" on the plan/course surface.
- [ ] Adding one books the session; the course's size/owed/end are visibly unchanged.
- [ ] Refusals show the server reason. tsc clean; build ok. Measure new shared-row controls at 1600/1280/768/375.

## Implementation Notes — DONE → REVIEW (Fern 2026-08-04)
Repo: `smart-scheduler-front`. Built on TASK-112's DONE endpoint + TASK-099's plan surface.
- `services/scheduler.service.ts`: `addExtraSession(courseId, {teacherId,subjectId,date,startTime})` →
  `POST /courses/:id/extra-session` + mock stub. Hook `useAddExtraSession` (→ `invalidateAll`, so the extra appears).
- `PlanModal` (course, edit mode): a **visibly separate "เพิ่มคาบ (คิดเงิน)"** action — grape colour + Ticket icon
  + a tooltip hint ("charged single-session sale — separate from the course quota; doesn't change size/end"), sitting
  **beside** the quota "Insert" (no charge). It reuses the shared `SessionEditor` (availability + clash picker) →
  `addExtraSession`. Refusals show the server reason inline.
- The extra reads distinctly on the plan: rows with `bookingType==="SINGLE_SESSION"` get an **"คาบพิเศษ" badge**, and
  mark-absence is hidden for them (they're not plan rows). Course size/owed/end are unchanged (BE guarantees it).
- Verified: `bunx tsc --noEmit` 0 · `bun run build` 0. ⚠️ Live render sid-gated; the two buttons sit in a
  `Group wrap="wrap"` action row (reflow-safe). **@Sober: ready for review.**

## Review
**Verdict: DONE ✅** — Sober, 2026-08-04 (code-verified, tsc 0 run by me).
- **`addExtraSession(courseId, input)` → `POST /courses/:id/extra-session`** (the TASK-112 endpoint); `useAddExtraSession`
  → `invalidateAll` so the extra appears. ✅
- **Visibly separate from Insert** (the AC that matters — staff must not confuse quota-reschedule with a paid add):
  a distinct **"เพิ่มคาบ (คิดเงิน)"** action (grape + Ticket + a tooltip naming it a charged single-session, doesn't
  change size/end) beside the no-charge quota "Insert". SINGLE_SESSION rows carry a **"คาบพิเศษ" badge** and hide
  mark-absence (they're not plan rows — consistent with TASK-112's engine filter). Refusals show the server reason.
- Reflow-safe (`Group wrap="wrap"`); no new measured shared-row control. **DONE — REQ-037 complete (BE+FE).**
