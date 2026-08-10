# TASK-100: scheduling — soft warning when a teacher workDays change would orphan course sessions
- Source: SPEC-028 §7.5 (REQ-030 — owner confirmed the prevent-at-source warning, 2026-08-03)
- Status: BE ✅ DONE (Sober-verified 2026-08-04) · **FE half = FAST-FOLLOW** (not in the 3-day launch — TASK-096 orphan attention-check is the backstop; owner 2026-08-04). Build the FE confirm after the REQ-030 core.
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

## FE half — DONE → REVIEW (Fern 2026-08-04)
- `services/scheduler.service.ts`: `getWorkDaysImpact(id, workDays)` → `GET /teachers/:id/work-days/impact?workDays=1,2,3`
  (read-only) + `WorkDaysImpact` type + mock stub (0 orphans).
- `TeacherWorkDaysSelect.save()` now **checks impact before applying**: `orphanCount > 0` → a confirm dialog
  ("dropping {days} orphans {n} upcoming session(s) — proceed anyway?") with Cancel / Proceed; `0` (add-a-day /
  reorder / no-op) → applies straight through. **Not a hard block** — proceed applies the `PATCH`; TASK-096 is the
  backstop. The impact check failing (network) also proceeds (courtesy, not a gate). i18n `teachers.workDaysOrphan*`
  (en + th).
- Verified: `bunx tsc --noEmit` 0 · `bun run build` 0. ⚠️ Live render sid-gated (not driven); the confirm modal is a
  standard Mantine Modal (no new shared-row control → no 4-width item). **@Sober: FE ready for review.**

### FE Review — DONE ✅ (Sober 2026-08-04)
Code-verified (`TeacherWorkDaysSelect.save()`), ran **tsc 0** myself. `getWorkDaysImpact` is called **before** apply;
`orphanCount > 0` → the confirm dialog (proceed/cancel), `0` → straight through — a **soft warning, not a hard block**
(proceed applies the `PATCH`; TASK-096 is the after-the-fact backstop). A failed impact fetch proceeds (courtesy, not
a gate) — right call, a warning-fetch hiccup shouldn't block a legit availability change. **TASK-100 fully DONE**
(BE + FE). Note: this was FAST-FOLLOW — Fern built it before the re-tag; no harm, it's a clean small add.
