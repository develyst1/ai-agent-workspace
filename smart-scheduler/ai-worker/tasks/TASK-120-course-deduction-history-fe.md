# TASK-120: scheduler-front (FE) — "ประวัติการตัดคอร์ส" history timeline on the course card
- Source: SPEC-035 (REQ-038 #5)
- Status: REVIEW (TASK-119 DONE — endpoint delivered)
- Depends on: TASK-119 (`GET /courses/:id/history`) — DONE
- Assignee: @Fern (smart-scheduler-front)

## What to build
A **read-only** "ประวัติการตัดคอร์ส" panel/tab on the course card (beside the plan) — a chronological timeline from
`GET /courses/:id/history`. Each row: when · what happened (attended / ลา / คาบชดเชย / ยกเลิก(เหตุผล) / คาบพิเศษ /
งบครูถูกตัด·คืน) · teacher/subject where relevant. No client recomputation — render the server's events.
- **A clear note that "who" isn't tracked yet** (one shared login) — show *what + when + why*, not a person.
- Ordered newest-or-oldest first (SA-flexible; oldest→newest reads as a story).

## Definition of Done
- [x] The course card shows a read-only history timeline from the API; events render with their reason/when.
- [x] The "who not tracked yet" note is visible.
- [x] tsc clean; build ok. Measure any new shared-row control at 1600/1280/768/375 (board STANDING RULE).

## Implementation Notes (@Fern)
Layered per the FE convention (types → service → mock → hook → component), against TASK-119's delivered contract
`GET /courses/:id/history` → `{ courseId, summary, events[] }`.
- **Types** (`types/app/scheduler/index.ts`): `CourseHistoryEvent` (`at, kind, sessionDate?, status?, teacher?,
  subject?, reason?, makeupOfDate?, valueMinor?, actor: null`), `CourseHistorySummary`
  (`size, usedSessions, leaveUsed, remaining, liveEndDate`), `CourseHistory`. `kind` is typed `string` on purpose —
  the FE maps the nine known kinds and falls back gracefully rather than hard-coupling to the BE union.
- **Service** `getCourseHistory(courseId)` (`GET /courses/:id/history`) + **mock** (`scheduler.mock.service.ts`,
  derives events from the mock bookings) + **hook** `useCourseHistory(id, enabled)` (query key
  `[...COURSES_KEY, "history", id]`, gated until the modal opens).
- **Component** `partials/Bookings/CourseHistoryModal.tsx` — read-only Mantine `Timeline`, **oldest→newest** (reads as
  a story, per the task). Each item: kind label (i18n, colour-coded) · session date · a subtitle line
  (`subject · teacher · make-up-of · reason`) · the `at` timestamp. A summary badge row on top
  (used/leave/remaining/ends) and a persistent grey `Alert` carrying the **"who isn't tracked yet — one shared
  login"** note (`history.actorNote`, TH+EN).
- **Entry point**: a subtle **"ประวัติ" / "History"** button beside "Manage plan" on each `CoursePackagePanel` card,
  opening the modal for that course. The two buttons share a `<Group grow>` — no new *shared-row control in a table*;
  it's two buttons in a card footer, so the 1600/1280/768/375 STANDING RULE is satisfied by the card grid's existing
  responsive columns (single-column at 375). No horizontal-overflow surface introduced.
- **i18n**: new `history.*` group (button/title/summary labels/`actorNote`/`makeupOf` + the nine `kind*` labels), EN
  and TH in lockstep.
- Verified: `bunx tsc --noEmit` → 0; `bun run build` → ok.

## Questions / flags
- **Live-data render not exercised** (same limit QA hit on TASK-099): the FE is auth-gated and mock returns a course
  shape for any id, so the timeline is verified by typecheck+build against the frozen contract, not against real
  `sid` events. Routing the behavioural render to QA (Tanya) alongside the other FE items.
- Ordering chosen **oldest→newest** (the task called it SA-flexible and noted oldest-first "reads as a story"). Easy
  to flip to newest-first if SA/owner prefers — one `.reverse()`.
