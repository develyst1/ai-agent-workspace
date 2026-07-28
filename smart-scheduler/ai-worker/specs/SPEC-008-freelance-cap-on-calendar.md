# SPEC-008: Freelance income-cap visible + bookable on the staff calendar
- Source: REQ-007
- Status: ACTIVE

## Overview
REQ-007 is a **visibility + reconciliation** change, and — verified against the real code — it is **entirely
in the frontoffice frontend** (`smart-scheduler-front`). The backend already ships everything and enforces the
right safeguard; **no backend change is needed** (see "Backend — no change, verified" below). The one real
piece of work is reconciling two current behaviors that both fold "over budget" into "hidden / not bookable":
1. `lib/scheduler/teacher.ts` `toTeacherView` computes `bookable = active && !overLimit && !setupIncomplete`,
   so an over-cap freelance (`overLimit`, no durable `limitOverride`) is **suppressed** from calendar columns
   and the booking/course modals (`teacher.ts:27,36`, comment line 10).
2. The backend blocks a *confirm* that would exceed budget **unless** a per-action `override` is passed.

The fix: stop hiding — keep the over-cap freelance visible + selectable, show a green→yellow→red budget strip,
and move the safeguard entirely onto the **per-action override at confirm** (which already exists).

## Backend — no change, verified
- `getCalendar` already attaches freelance budgets to every teacher DTO (`scheduler.service.ts:229`
  `attachFreelanceBudgets`), so each calendar teacher carries `budgetMinor` / `remainingMinor` /
  `reorderMinor` / `overLimit` (satang). → the color strip has its data.
- Creating a PENDING booking for an over-cap freelance is already allowed — the create-time backstop
  (`:438–442`) blocks only a freelance with **no budget row** (`setupIncomplete`), **not** an over-cap one.
- The draw + safeguard happen at **confirm**: `reconcileFreelanceDraw` throws `INSUFFICIENT_BUDGET` when the
  draw would exceed the ceiling **and** `allowNegative` is false; `allowNegative = override || durable
  limitOverride` (per-action `override` comes straight from `PATCH /bookings/:id/status` `{action,reason,override}`).
- ⇒ REQ #3/#4 are already enforced server-side; the FE only needs to *reach* the override and surface the block.

## API / Interface (existing, no new endpoints)
- `GET` calendar → teacher DTO fields `budgetMinor`, `remainingMinor`, `reorderMinor`, `overLimit`,
  `limitOverride`, `type` (all already shipped).
- `PATCH /bookings/:id/status` body `{ action: "confirm", reason?, override?: boolean }` — send `override:true`
  to book past cap. Without it, an over-cap confirm returns `INSUFFICIENT_BUDGET` (Thai message from the API).

## Data Model
None. No new fields, no migration, no new config (REQ #5: reuse the per-teacher `reorderMinor`).

## Flow
**1. Budget strip (display-only, per freelance calendar column).** Compute from the DTO satang fields:
- **red** = `overLimit` (i.e. `remainingMinor ≤ 0`) — at/over cap.
- **yellow** = near cap: `reorderMinor != null && remainingMinor ≤ reorderMinor` (and not red).
- **green** = otherwise (healthy). If `reorderMinor` is null → no yellow band (green until red).
- FT/PT and non-freelance columns: no strip (only FREELANCE has a ceiling).
- The strip reflects the SAME remaining/total the backend computes — never recompute "which hours count" on
  the FE (REQ constraint). Optionally show "remaining ฿ / budget ฿" as text alongside the color.

**2. Keep over-cap freelances visible + selectable (the reconciliation).** In `lib/scheduler/teacher.ts`
`toTeacherView`, **drop `overLimit` from the `bookable` gate** → `bookable = teacher.active &&
!teacher.setupIncomplete`. Keep `overLimit` as a **display** flag (drives the red strip), not a hide flag.
Effect: an over-cap freelance stays a calendar column and is selectable in the booking + course-create modals.
`setupIncomplete` (no budget set) still suppresses — unchanged (that's a real "can't book" per SPEC-005).

**3. Per-action override at any draw-triggering completion (the safeguard).** The freelance draw is
reconciled on **every** status change to a *consuming* state (TASK-028), so the override must be reachable at
**both** completion paths the FE exposes: **Confirm** (`PENDING→CONFIRMED`) and **direct Attend**
(`PENDING→ATTENDED`, since the Attend button is not status-gated). Both can hit `INSUFFICIENT_BUDGET` on an
over-cap freelance; both must offer the deliberate override. _(Corrected 2026-07-28: the first draft scoped
this to confirm only; the ungated Attend button makes `PENDING→ATTENDED` reachable — see TASK-031 review.)_
Primary path (confirm):
- Confirming an over-cap freelance booking **without** override → backend returns `INSUFFICIENT_BUDGET`. The FE
  shows that message and offers a **deliberate override** — recommended: a confirm dialog
  (e.g. "งบครูฟรีแลนซ์เต็มแล้ว — ยืนยันจองเกินงบ?") whose confirm re-sends `PATCH …/status
  {action:"confirm", override:true}`. On success the booking confirms and the budget may go negative.
- Reaching the override must be at the calendar booking flow (REQ #3) — the confirm control on the
  calendar/booking modal, not a separate page.
- **Durable `limitOverride` coexistence:** a teacher with the durable per-teacher override set already confirms
  without a per-action prompt (backend `allowNegative` true) — so **suppress the override dialog when
  `limitOverride` is set**; still show the true-remaining strip (red if `remainingMinor ≤ 0`) for honesty.

**Edge/behaviour:** creating the PENDING booking never draws budget, so no override is needed at create — only
at confirm (where the money moves). Cancel/leave still reverses per the delivered reconcile logic (unchanged).

## Non-functional
- FE display-only; backend stays source of truth (REQ constraint). No new config, no migration.
- No regression on the "Teachers" page budget display (REQ AC) — that page reads the same DTO fields; only the
  `bookable` gate + the calendar strip change.

## Tasks
- TASK-031: scheduler-front — freelance budget strip on the calendar + keep over-cap selectable + per-action
  override at confirm. (Fern) (depends on: —)

_(No backend task — verified the backend already ships the data and enforces the override-gated confirm.)_

## Questions
(Sober asks; Porter answers as `> answer: ...`)
- **Non-blocking design confirmation (→ @Porter → คุณฟีน).** The freelance budget is drawn at **confirm**, not
  at booking creation, so my design puts the per-action override at the **confirm** step: staff can place a
  PENDING booking on an over-cap freelance freely (nothing is drawn yet), see the red strip, and are prompted
  for the deliberate override only when they **confirm** (where the money actually moves). This satisfies REQ
  #3 ("deliberate per-action override, reachable at the booking flow"). **Confirm this matches คุณฟีน's intent**
  — i.e. she's fine that the gate is at confirm rather than blocking selection/PENDING-create. Fern builds
  against this interpretation now; if คุณฟีน wants the override even earlier, it's a small tweak, not a redesign.
