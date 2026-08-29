# TASK-094: scheduling (BE) — teacher-change 3-day notice rule + dual-teacher LINE notify
- Source: SPEC-028 §5 #3 (REQ-030 Q3)
- Status: BLOCKED (on TASK-093)
- Depends on: TASK-093
- Assignee: @Jason (smart-scheduler-back)

## What to build
1. **A named notice rule** mirroring `lib/leave-notice.ts` exactly, but in **DAYS**: a named `Record<…, number>`
   (default **3**), accessor with `?? default`, pure `hasEnoughTeacherChangeNotice(date, startTime, now)` (whole-day
   diff — reuse `minutesUntilClass(...)/1440`), a message helper, and `conflict("TEACHER_CHANGE_TOO_LATE", …)` at
   the call site inside `applyPlanChange`, with admin `override` bypass.
   - 🔗 **Do NOT wire `app_settings`** — the 3-day value is a pure `lib/` constant here; **REQ-031** makes it
     editable via a settings screen later by passing the override into this pure function. Keep the function pure.
2. **Both teachers notified** on a confirmed+notified teacher swap, via the existing `notification_outbox`: the
   **old** teacher ("this class is off your schedule"), the **new** teacher ("this class is now yours"). A silent
   reassignment means someone doesn't turn up.

## Definition of Done
- [ ] A teacher change with < 3 days' notice is refused with the reason (admin `override` bypasses).
- [ ] Both old + new teachers get a LINE outbox message on a successful swap.
- [ ] Rule is a pure function with the threshold passed in (REQ-031-ready); default 3 days if unset.
- [ ] `bunx tsc --noEmit` clean; `bun test` green (notice boundary, override, dual-notify).

## Review
**Verdict: DONE ✅** — Sober, 2026-08-04 (code-verified). Read `lib/teacher-change-notice.ts` + the `applyPlanChange`
move branch; ran the suite: **tsc 0 · 421/0**.
- **Pure lib, whole DAYS, floored** — `daysUntilClass = floor(minutesUntilClass/1440)` so 2d 23h is **not** 3 days;
  default 3; **threshold is a `days` param** → REQ-031 feeds a DB override with **zero `app_settings` coupling** (the
  seam I required). Mirrors `leave-notice.ts`.
- 🔑 **Fires only on an ACTUAL teacher change** (`teacherChanged = change.teacherId !== undefined && !== b.teacherId`,
  `:1489`) — a date/subject-only edit is untouched (the trap I'd have flagged); `override` bypasses; notice is keyed
  to the (possibly moved) class date the new teacher inherits.
- **Dual-notify in the tx** — old teacher `teacher_unassigned`, new teacher `teacher_assigned`; a missing lineUserId
  is a SKIPPED row (an unlinked teacher never blocks the swap). TH/EN i18n added.
- Tests cover the boundary (exactly 3 / 2 / 2d23h-floors-to-2), override, custom threshold, both render kinds.
**REQ-030 BE is complete** (092/093/094/095/096/097 all DONE).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-094 | scheduling (BE): teacher-change **3-day** notice rule (pure `lib/`, REQ-031-ready) + dual-teacher LINE notify | SPEC-028 | 🔎 **REVIEW** (Jason 2026-08-04 — tsc 0 · **421/0**. Pure `lib/teacher-change-notice.ts` mirrors `leave-notice` in **whole DAYS** (floored), default **3**, threshold **passed in** ⇒ REQ-031/TASK-101 feeds the override with **zero app_settings coupling**; `hasEnoughTeacherChangeNotice`/`teacherChangeNoticeMessage`. Enforced in `applyPlanChange` **move** branch **only on an actual teacher change** — `throw conflict("TEACHER_CHANGE_TOO_LATE", …)` unless admin `override`; notice keyed to the (possibly moved) class date. Dual-notify via `enqueueLine` in-tx: old teacher `teacher_unassigned` + new teacher `teacher_assigned`, rendered TH/EN in `line-message.ts` (2 i18n keys). Tests: notice boundary/floor/override + both render kinds. **Finishes REQ-030 BE.** — ✅ **DONE** Sober 2026-08-04: code-verified, fires only on an actual teacher change (date/subject-only edit untouched), threshold-param seam confirms REQ-031 needs zero app_settings coupling; tsc 0 · 421/0 run by me) | Jason | TASK-093 |
```
