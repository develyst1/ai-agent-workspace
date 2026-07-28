# SPEC-007: Standalone teacher management (remove the ops teacher-sync dependency)
- Source: REQ-005
- Status: ACTIVE

## Overview
Teacher lifecycle mutations in `smart-scheduler-back` still make **blocking** calls to the backoffice
`ops` teacher-sync API. REQ-006/TASK-027 retired all `ops` routes (backoffice now serves only `/auth`+`/bo`
on the shared `smart_scheduler` DB), so every synced teacher op now hits a dead route → throws → **502 +
tx rollback**. The ops "party" sync is also **obsolete**, not merely deferred: freelance money is now a
**local `bo.item`** in the shared DB keyed by teacher id (REQ-006/TASK-024), so no separate ops party is
needed. Fix = **remove the ops teacher-sync leg** so teacher CRUD is fully local, and retire the now-dead
ops drift report. A separate `PATCH /teachers/availability` **500** (no ops call in that path) is diagnosed
below as a distinct DTO-mapper bug + a DATA REQUEST to confirm against the real stack trace.

Approach chosen: **delete the ops calls** (not feature-flag / best-effort). Under the new architecture there
is no ops party to sync to at all, so a "best-effort no-op" would be dead code guarding a call that can
never succeed. Deleting is the smaller, clearer change and matches "the whole point is to drop it" (REQ-005).

## API / Interface Design
No contract changes. All affected endpoints keep their existing request/response DTOs — they simply stop
depending on ops and stop 502-ing:
- `POST /api/teachers` (create), `PATCH /api/teachers/:id` (edit incl. name/type change),
  `POST /api/teachers/:id/archive`, `POST /api/teachers/:id/reactivate` — succeed with no ops call.
- `PATCH /api/teachers/availability` (activate/deactivate) — stops 500-ing (see Flow §3).
- `GET /api/teachers/reconcile` — the ops drift report is obsolete. **Retire it** (remove the route +
  service, or make it 200 with an empty/"ops retired" report). It must never throw when ops is gone.

## Data Model
No schema changes. Teacher tables (`teachers`, `teacher_subjects`) and the local freelance `bo.item` are
already the source of truth. No migration.

## Flow
**1. Remove the 5 ops teacher-sync call sites** (all wrapped in `opsSyncOr502(...)`), keeping every other
line of each function unchanged (subjects, future-booking guard, archived/active flags, effective-month):
- `createTeacher` — `scheduler.service.ts:941` `onboardOpsTeacher`
- `updateTeacher` — `:974` `updateOpsTeacher` (name change) **and** `:975` `switchTypeOpsTeacher` (type change)
- `archiveTeacher` — `:1003` `offboardOpsTeacher`
- `reactivateTeacher` — `:1015` `updateOpsTeacher({active:true})`
After removal, each `db.transaction(...)` still does its local work; drop the now-unused `opsSyncOr502`
helper and the now-orphaned imports (`onboard/update/offboard/switchTypeOpsTeacher`) **only if nothing else
uses them** (surgical: remove only what these deletions orphan).

**2. Retire the ops drift report** — `reconcileTeachers` (`:1097`) calls `fetchOpsPartyRefs/BudgetRefs/
OpenSalaryRefs` and throws 502 when ops is unreachable. Remove the route + function (preferred), or return
a 200 no-op report. Remove orphaned ops-client imports it leaves behind.

**3. `PATCH /teachers/availability` 500 (`{code:"INTERNAL"}`) — distinct bug.** `setAvailability`
(`:839–856`) makes **no ops call**; it updates `teachers.active` then returns `rows.map(toTeacherDTO)`.
**Candidate root cause (code inspection):** `toTeacherDTO` (`db/mappers.ts:21–24`) does an **unguarded**
`ts.subject.id` / `ts.subject.name`. A `teacher_subjects` row whose joined `subject` is null/absent
(possible data drift after the shared-DB switch) → `TypeError` → uncaught → 500 INTERNAL. The by-`type`
branch loads *all* teachers of a type, so one bad row fails the whole toggle.
- **Fix (safe regardless of the exact cause):** make the mapper defensive — skip/guard `teacherSubjects`
  entries with no `subject` (`ts.subject?` + filter out nulls). This hardens every teacher-DTO path, not
  just availability.
- **Confirm before closing:** the exact prod cause needs the real server stack trace — raised as a DATA
  REQUEST (see ## Questions). If the trace shows a different cause (e.g. a missing migration on the shared
  DB), reopen with that evidence. The ops-removal work (§1–2) is certain and proceeds immediately either way.

**Error/edge cases preserved (no regression):** archive-blocked-when-future-bookings (409
`HAS_FUTURE_BOOKINGS`), setup-incomplete gate (not bookable until money set), change-type effective-dating,
soft-archive keeps history + is reactivatable, no orphaned/partial records on any failure path (the tx
still rolls back on a genuine DB error — only the ops-induced rollback is removed).

## Non-functional
- Auth/validation unchanged. No new external calls; removing them **reduces** latency + failure surface.
- Money correctness: unaffected — freelance draw/limit already runs off the local `bo.item` (TASK-024);
  this SPEC only removes the obsolete party sync.

## Tasks
- TASK-029: backend — remove ops teacher-sync from all 5 lifecycle sites + retire `reconcile` + harden the
  teacher DTO mapper (availability 500). (depends on: —)

_(No FE task: the frontoffice teacher UI (TASK-017) already calls these endpoints; contracts are unchanged,
so it stops erroring once the backend is fixed. Reopen only if the DATA REQUEST reveals an FE-side cause.)_

## Questions
(Sober asks; Porter answers as `> answer: ...`)
- **DATA REQUEST (→ @Porter → คุณฟีน / server operator) — confirms the 500/502 root cause; does NOT block
  the ops-removal build.** To verify the fixes target the real prod causes, please capture from the running
  `smart-scheduler-back` (:4006) server at the moment of failure:
  1. The **server-side error / stack trace** logged when `PATCH /api/teachers/availability` returns 500
     (`{code:"INTERNAL"}`), and when `POST /api/teachers/:id/archive` returns 502.
  2. Deploy facts: **which backoffice build is live** (ops-retired `/auth`+`/bo`, or the old ops build?),
     is the backoffice (:4010) actually **running**, and is **`OPS_API_URL` set** in the scheduling-back
     env? (create/edit reportedly work, which only makes sense if ops is still reachable — this decides
     whether archive-502 is an ops timeout vs. an origin crash.)
  These pin down whether the availability-500 is the DTO null-subject bug (candidate above) or a schema/
  data issue, and whether archive-502 is fully covered by removing the ops call. Put results in
  `../project-docs/`.
