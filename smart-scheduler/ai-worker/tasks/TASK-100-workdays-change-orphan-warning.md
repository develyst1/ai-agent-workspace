# TASK-100: scheduling — soft warning when a teacher workDays change would orphan course sessions
- Source: SPEC-028 §7.5 (REQ-030 — owner confirmed the prevent-at-source warning, 2026-08-03)
- Status: TODO (small, independent)
- Depends on: none (complements TASK-096, the after-the-fact backstop)
- Assignee: @Jason (BE) + @Fern (FE)

## Why
Archiving a teacher is already hard-guarded (`archiveTeacher` → `409 HAS_FUTURE_BOOKINGS`). The one path that can
still orphan a session is a **workDays change** (a teacher stops working a weekday). A hard block is wrong there —
a genuine availability change mustn't trap an admin — so this is a **warning at source**, and TASK-096 remains the
after-the-fact net.

## What to build
- **BE:** where a teacher's `workDays` is edited (likely `setAvailability`, `scheduler.service.ts:~1332`), compute
  the **impact**: future `LIVE` (PENDING/CONFIRMED/EXTENDED) bookings for that teacher on the weekday(s) being
  **removed**. Return that count (and ideally the session list) so the FE can warn. Do **not** block the edit.
- **FE:** before applying a workDays change that removes a day, if impact > 0, show a confirm — *"this orphans N
  upcoming sessions — reassign them?"* — with the option to proceed or cancel. Proceeding applies the change;
  the orphaned sessions then also surface via TASK-096.

## Definition of Done
- [ ] Removing a weekday a teacher works, with future course sessions on it, returns the correct impact count.
- [ ] The FE warns before applying; the admin can proceed or cancel; it is **not** a hard block.
- [ ] Adding a weekday / no-impact changes apply with no warning.
- [ ] `bunx tsc --noEmit` clean; `bun test` green (impact count pure-tested); FE tsc/build ok.

## Review
**BE half → DONE ✅** — Sober, 2026-08-04 (code-verified). Read `lib/work-days.ts` + the impact endpoint; ran the
suite: **tsc 0 · 434/0**.
- 🔑 **The subtle bit is right:** `removedWorkDays` expands **both** sides via `expandWorkDays` (empty/absent → all
  seven, matching `teacherWorksOnDay`'s convention), so narrowing **all-days → a subset** correctly reports the
  complement removed; widening / reorder / no-op / adding a day → **empty** (no warning path). Pure-tested.
- **`GET /teachers/:id/work-days/impact`** composes `removedWorkDays` + `sessionsOnRemovedDays` over **future LIVE**
  bookings only (`gte(date, today)` + `COURSE_LIVE_STATUSES`), **read-only** — the FE previews then applies via the
  existing `PATCH`. Not a hard block; TASK-096 stays the backstop.
- `COURSE_LIVE_STATUSES` extracted as a typed tuple (one source of truth) so `inArray` typechecks the enum column.
- **FE half (the confirm dialog) is @Fern's** — contract ready; `orphanCount > 0` → "orphans N sessions, proceed?".
