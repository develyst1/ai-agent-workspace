# TASK-113: scheduler-front (FE) — "Add extra session (charged)" action on the course/plan surface
- Source: SPEC-033 (REQ-037)
- Status: BLOCKED (on TASK-112 + TASK-099 the plan surface)
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
