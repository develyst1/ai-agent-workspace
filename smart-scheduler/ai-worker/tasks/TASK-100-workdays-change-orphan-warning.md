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
