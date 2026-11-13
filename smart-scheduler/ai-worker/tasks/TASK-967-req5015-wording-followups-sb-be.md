# TASK-967 — BE: REQ-5015 follow-up O-158-1: a part-day leave refusal names the hours — @Brew (Team C) — ⏸ until the owner's uat deploy (tree frozen)

**From @Sector, 2026-11-13.**
- **Source:** TEST-158 § Observations O-158-1 [PM-decided, not blocking uat].
- **Repo:** SB, `dong`. No git. **Size ≈ 0.25 d. Start only when I ring you** (after the uat deploy of `738b6eb`).

## The change
**Today:** a leave refusal always uses the whole-day sentence. `TEACHER_ON_LEAVE(nickname, date)` in `scheduler.service.ts` renders «ครู {n} ลาวันที่ 2026-12-16 — เพิ่มคาบกับครูในวันนั้นไม่ได้ …»: an ISO date, "that day", no time.

**Change:**
- When the blocking row has `start_time` / `end_time`, the message names the window and a Thai date. **Default wording [SA-proposed; Porter confirms the words]:**
  «ครู {n} ลาวันที่ {d MMM} เวลา {from}–{to} — เพิ่มคาบกับครูในช่วงเวลานี้ไม่ได้ กรุณาเลือกเวลาอื่นหรือครูอื่น»
- **A whole-day leave keeps today's sentence**, with the date shown the Thai way (`d MMM`), as the other refusals do.
- The code (`TEACHER_ON_LEAVE`) and the status are unchanged.

## Files
- `src/services/scheduler.service.ts`: the helper + its call site, which already has the row.
- `src/lib/teacher-leave.ts`, only if the date/time formatter lives there.
- Tests: part-day vs whole-day text; an existing whole-day pin updated, declared.

## Done =
tsc 0 · the full SB suite N/0 (paste) · the two refusal texts pasted from a test.

## Questions / Implementation Notes / Review
_(—)_

**Words confirmed (Porter, 2026-11-13) [PM-decided]:** the wording proposed above stands as written. Still ⏸ until the owner's uat deploy.
