# SPEC-004: Unified teacher onboarding/offboarding with backoffice sync
- Source: REQ-003
- Status: DONE (tasks 015/016/017/018 DONE — 2026-07-20)

## Overview
Make managing a teacher a **single frontoffice action** (add / edit / change-type / offboard)
that **auto-syncs the backoffice** party + closes money safely. Path B: scheduling
(`public.teachers`) stays the teacher master; the ops party is linked by
`external_ref=teacherId` (existing key). No roster move to ops.

### As-built reality (2026-07-20 code sweep) — the gaps this SPEC fills
- **scheduling**: `teachers` has **no create/edit/archive endpoints** (only seed + active/
  workdays/type-order/override toggles) and **no archive/status column** (only `active`);
  hard-delete is already blocked by the `bookings` FK (`onDelete restrict`) → archive must be
  soft. `ops-client` has **no party create/update/deactivate**. No "future live bookings" query.
- **ops**: `POST /parties`, `POST /catalog/items`, `POST /recurring-costs` are **adminAuth**
  (the scheduling **service token can't create** them); there is **no party update/deactivate**
  endpoint and **no salary-terminate** (`setRecurringCost` only *supersedes* with a new open row).
  Catalog items CAN be PATCHed/deactivated by `adminOrService`. Public GETs by `externalRef`/
  `externalSource` exist for detection + reconcile.
- **FE**: `bookable = active && !overLimit` in `toTeacherView` is the single gate feeding every
  booking surface. No add/edit/archive UI.

### Key design decisions (for review)
1. **Sync via a new ops `serviceAuth` "teacher-sync" internal API** — not by loosening the
   admin-only create endpoints and not by giving scheduling an ops admin login. It encapsulates
   the cross-system writes (party upsert/update/deactivate + money-close) behind one machine
   surface and fills the party-deactivate + salary-terminate gaps in one place.
2. **Money is created by the admin later** (REQ #1.2) via the existing Freelance Budgets / FT-PT
   Salary screens (adminAuth) — the bridge only **creates/deactivates the party** and **closes**
   old money on type-change/offboard. So the bridge never needs the admin-only *create* endpoints.
3. **Onboard party-create is BLOCKING** (REQ #1.4 no half-created): teacher insert + ops party
   create in one flow; if ops fails → the add fails (rollback). Idempotent onboard (find-by-ref,
   since `parties(externalSource,externalRef)` has no unique constraint) + reconcile handle the
   rare "party created but teacher-commit failed" orphan.
4. **Archive is a new `teachers.archived` boolean** (distinct from `active`=pause): offboard sets
   `archived=true` (+`active=false`); archived list = `archived=true`; reactivate = `archived=false`.

## Data model
- **scheduling** (migration): add `teachers.archived boolean NOT NULL default false`. No linkage
  column needed (`teacher.id` is the sync key). *(Optional hardening, not required: a unique index
  on ops `parties(external_source, external_ref)` — noted, not in scope.)*
- **ops**: no schema change — reuse `parties`, the FREELANCE_BUDGET catalog item, and
  `recurring_costs` (the terminate just sets `effective_to` on the open row).

## API — ops (new, `serviceAuth`, `/v1/internal/teacher-sync/*`)
- `POST .../onboard` `{externalRef, displayName}` → **upsert** party (find-by-ref; create if
  missing; idempotent). Returns the party.
- `POST .../update` `{externalRef, displayName?, active?}` → update party name / active (covers
  edit-name + reactivate).
- `POST .../offboard` `{externalRef, effectiveMonth:"YYYY-MM"}` → party `active=false`; **deactivate**
  the active FREELANCE_BUDGET item (PATCH `active=false`); **terminate** the open salary row (set
  `effective_to = prevMonthFirstDay(effectiveMonth)`, no successor). Idempotent; closes whatever exists.
- `POST .../switch-type` `{externalRef, effectiveMonth}` → close the **old** money only: deactivate any
  active FL budget item **and/or** terminate any open salary row. Party untouched. (New money set later
  via admin UI.) Idempotent.
- New ops service logic: `deactivateParty`/`updateParty` by ref; `terminateRecurring(externalRef,
  effectiveTo)` (sets `effective_to` on the open row without inserting a successor — the missing path).

## API — scheduling (new)
- `POST /teachers` `{name, nickname, type, workDays?, subjectIds?}` → insert teacher; then
  **blocking** ops `onboard(id, name)`; on ops failure → rollback, error. Returns DTO
  (`setupIncomplete=true`). 
- `PATCH /teachers/:id` `{name?, nickname?, type?, subjectIds?}` → update; if name changed → ops
  `update(displayName)`; **if type changed → ops `switch-type(effectiveMonth=current month)`**
  (close old money; new money set later). Past P&L untouched (money is effective-dated / immutable
  movements).
- `POST /teachers/:id/archive` → **guard: reject (409) if the teacher has future live bookings**
  (`date >= today(Bangkok) AND status NOT IN (CANCELLED, NO_SHOW)` — i.e. PENDING/CONFIRMED/EXTENDED/
  SICK_LEAVE dated today-or-later), with a clear "reassign/clear bookings first" message. Else set
  `archived=true, active=false`; ops `offboard(effectiveMonth=current)`.
- `POST /teachers/:id/reactivate` → `archived=false, active=true`; ops `update(active:true)`.
  (Money re-set via admin UI → `setupIncomplete` until then.)
- `GET /teachers?archived=true` (or an `includeArchived` flag) → archived list.

### Money-completeness → `setupIncomplete` (REQ #1.3, server-side gate)
- Extend the ops read: alongside `fetchTeacherQuotas` (FREELANCE_BUDGET items), fetch
  `GET /recurring-costs?externalSource=smart-scheduler` → set of teacherIds with an **open** salary row
  (`effectiveTo=null`). Per teacher: `moneyReady = FREELANCE ? hasBudgetItem : hasOpenSalary`.
  `setupIncomplete = !archived && !moneyReady`. Surface on the teacher DTO.
- **Enforce**: (a) FE folds it into `bookable` (below); (b) server hardening — the booking
  create/commit path rejects a `setupIncomplete` teacher (belt-and-suspenders beyond the FE gate,
  matching how freelance budget already 409s).

## FE — scheduler-front
- Add `setupIncomplete` to `Teacher`/`TeacherDTO`/`dtoToTeacher`; fold into `toTeacherView`:
  `bookable = active && !overLimit && !setupIncomplete` — the single choke point auto-suppresses the
  teacher from calendar columns, the booking modal, and the course modal (no per-consumer change).
- **Teacher-management UI** (`TeachersContent`): "**Add teacher**" (header) → create modal (name,
  nickname, type, work-days, subjects); per-row **kebab**: **Edit**, **Change type** (Select of the 3
  types; warns it switches the money model effective this month), **Archive/Offboard** (confirm; on the
  409 "has future bookings" show the reassign-first warning); an **Archived list** section with
  **Re-activate**. Flag `setupIncomplete` rows with a badge ("ตั้งเงินก่อนจึงจะจองได้") + disabled
  active switch (mirror the existing `overLimit` badge pattern). Management screen still lists all rows
  (incl. incomplete/inactive) for editing.
- Mutations mirror the existing pattern (`useMutation` → invalidate `TEACHERS_KEY` + `CALENDAR_KEY`).

## Reconcile (REQ #5.2)
- A scheduling **drift-report** endpoint (admin): list ops parties + budget/salary items by
  `externalSource=smart-scheduler`, diff `externalRef` sets vs the teacher roster → report
  orphans (ops record with no teacher) and missing (teacher with no party). **Repair = re-run the
  relevant sync call** (onboard/offboard). Read-only report first; repair is manual/triggered. Kept
  lean — its own task, lands after the core.

## Non-functional
- **Idempotency**: every sync call is find-by-ref/upsert or set-state → safe to retry; a partial
  failure surfaces a clear error and leaves no *functional* orphan (reconcile catches stray records).
- **Blocking vs best-effort**: onboard/offboard/type-change sync calls are **blocking** (admin
  actions, not the hot booking path; a ≤4s ops call is acceptable) so failures are visible, unlike the
  best-effort booking-time bridge.
- **Auth**: sync uses the existing `OPS_API_URL` + `SERVICE_TOKEN` (serviceAuth) — no admin creds in
  scheduling, no change to the admin-only create endpoints.

## Tasks
- **TASK-015** (@Jason, ops): `serviceAuth` teacher-sync internal API (onboard/update/offboard/
  switch-type) + `deactivateParty`/`updateParty` + `terminateRecurring`. (dep: —)
- **TASK-016** (@Jason, scheduling): `teachers.archived` migration; `ops-client` sync fns (blocking
  onboard); `POST /teachers`, `PATCH /teachers/:id` (name+type-change sync), archive (future-bookings
  guard + offboard sync), reactivate, archived list; `setupIncomplete` detection + DTO + booking-commit
  guard. (dep: TASK-015)
- **TASK-017** (@Fern, scheduler-front): add/edit/change-type/archive UI + archived list + reactivate;
  `setupIncomplete` flag folded into `bookable`. (dep: TASK-016)
- **TASK-018** (@Jason, scheduling): reconcile drift-report endpoint (lean; repair re-runs sync). (dep: TASK-016)

## Questions
(Jason/Fern ask here; Sober answers as `> answer: ...`)
- Porter's 2 REQ-003 questions answered in the REQ (block-until-money = confirm; future-dated
  non-cancelled blocks removal = confirm). No open blockers — the admin-only-writes concern is resolved
  by the serviceAuth teacher-sync API (design decision #1), so no guard change / no admin creds needed.
