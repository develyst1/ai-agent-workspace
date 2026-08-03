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
