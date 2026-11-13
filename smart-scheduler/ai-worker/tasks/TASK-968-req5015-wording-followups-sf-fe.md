# TASK-968 — FE: REQ-5015 follow-ups O-158-2 + O-158-3 — @Flash (Team C) — ⏸ until the owner's uat deploy (tree frozen)

**From @Sector, 2026-11-13.**
- **Source:** TEST-158 § Observations O-158-2, O-158-3 [PM-decided, not blocking uat].
- **Repo:** SF, `dong`. No git. **Size ≈ 0.5 d. Start only when I ring you.**

## O-158-2: the leave dialog's words follow the window
**Today:** with «ทั้งวัน» off and 10:00–11:00 set, the dialog still says «… blocks their whole day …» and the button reads «Block this day for …».

**When a window is set** [SA-proposed wording; Porter confirms]:
- the explanation: «การบันทึกลาจะปิดรับคาบใหม่ของครูช่วง {from}–{to} ในวันที่เลือก» / EN "Recording leave blocks new bookings for {from}–{to} on the chosen day(s)";
- the button: «ปิดช่วง {from}–{to} สำหรับ {names}» / "Block {from}–{to} for {names}".

**Whole day:** today's words, unchanged.

## O-158-3: the calendar's «+» respects working hours
- In the day and week grids, a coach cell **outside that coach's `workHours`** for the weekday shows **no «+»** (no add affordance). Greying is optional; follow the leave cells' style if cheap.
- Same rule as the server (`classFitsWorkHours`: the 1-hour class must fit inside the window).
- A class already there stays shown as it is.
- No `workHours` = today's behaviour.

## Files
- `Calendar/Modal/ReportLeaveDialog.tsx`;
- `Calendar/CalendarGrid.tsx` + the week grid;
- `lib/scheduler/work-days.ts` (reuse the hours helper);
- `lib/i18n/dictionaries.ts`;
- tests next to each, with existing pins updated and declared.

## Done =
- tsc 0 · the SF suite N/0 (paste).
- Dom tests:
  - the window words and button with a window set, the whole-day words without;
  - no «+» outside the hours, «+» inside, unchanged without hours.

## Questions / Implementation Notes / Review
_(—)_

**Words confirmed (Porter, 2026-11-13) [PM-decided]:** the wording proposed above stands as written. Still ⏸ until the owner's uat deploy.
