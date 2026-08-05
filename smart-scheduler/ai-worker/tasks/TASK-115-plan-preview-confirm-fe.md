# TASK-115: scheduler-front (FE) — disable Insert when not insertable + plan-diff confirm (OBS-3 = A)
- Source: SPEC-028 §12 (REQ-030, owner ruling 2026-08-04)
- Status: BLOCKED (on TASK-114)
- Depends on: TASK-114 (`insertable` flag + `/plan/preview`), TASK-099 (the plan modal)
- Assignee: @Fern (smart-scheduler-front)

## What to build
1. **Disable the Insert action when `!plan.insertable`** (from the DTO), with the reason "no session to reschedule".
   Do **not** gate on `owedCount == 0` (that would block the valid post-absence insert).
2. **Plan-diff confirm** — on Insert / mark-absence / move, call **`POST /courses/:id/plan/preview`** first and show
   the resulting **plan diff** in the confirm ("session on the 14th moves to week 5; inserting the 15th removes the
   appended make-up; your plan becomes wk1·wk2·wk3·15·wk5"), then on confirm call the real `/plan`. Owner's ask:
   *"บอกว่าแผนจะเป็นแบบนี้นะ"* — a preview, not a silent apply.
   - Show the preview's `resultingSessions` + new `liveEndDate`, and which sessions move/cancel/append.
   - If the preview returns a refusal reason, show it (don't offer confirm).
3. **OBS-4 tidy (fold in):** render session times as `HH:mm`, not raw `13:00:00`.

## Definition of Done
- [ ] Insert is disabled (with reason) only when `!insertable`; the post-absence insert stays enabled.
- [ ] A plan change shows the diff (moves/cancels/appends + new end date) before commit; confirm applies it.
- [ ] A would-be-refused change shows the reason and no confirm.
- [ ] Times render `HH:mm`. tsc clean; build ok; measure new shared-row controls at 1600/1280/768/375.
