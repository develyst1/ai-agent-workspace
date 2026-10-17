# COPY DRAFT — REQ-123 Phase 1 (teacher leave made easy): every NEW string, for ONE owner approval — @Sober, collected as the tasks land
**Status: COLLECTING.** Porter gets this file when the last Phase 1 task reports. **Nothing listed here ships before the owner approves it.** Strings already approved (TASK-814, COPY-REVIEW 2026-10-17, and older) are not listed and are not reworded.

## TASK-817 (BE): a leave over a date range
| where | TH | EN |
|---|---|---|
| LINE to the teacher, the "blocked" line when the notice covers **several days** (`ob_tl_blocked_range`). The single-day line is unchanged. | ช่วงวันนั้นจะไม่มีการจองคาบใหม่กับคุณ | No new class will be booked on those days. |
| the same LINE, the Date line for a range (format only; the label stays «Date») | Date: 20-10-2026 – 24-10-2026 | Date: 20-10-2026 – 24-10-2026 |
| refusal: end date before start date | วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม | The end date can't be before the start date |
| refusal: more than 31 days | ลาล่วงหน้าได้ไม่เกิน 31 วันต่อครั้ง | A leave can cover at most 31 days at a time |
| backstop (the screen never shows it; the form refuses first) | ช่วงวันลาไม่ถูกต้อง | The leave range is not valid |
**A number for the owner:** **31 days** is the longest one leave can cover. It is a draft limit; any other number is a one-line change.

## TASK-815 (BE): none (a flag only)
## TASK-816 (FE): the warning in the create preview
| where | TH | EN |
|---|---|---|
| warning title (a week on the leave day, not yet marked) | มีคาบตรงกับวันลาของครู {name} | A class falls on {name}'s leave day |
| warning body | วันที่ {date} เป็นวันลาของครู {name} จึงสร้างคอร์สนี้ยังไม่ได้ กดทำเครื่องหมายเป็นลาล่วงหน้า แล้วระบบจะเพิ่มคาบชดเชยต่อท้ายให้ | {date} is a leave day for {name}, so this course can't be created yet. Mark it as a planned absence and a make-up is added at the end. |
| calm note (that week already marked) | วันที่ {date} เป็นวันลาของครู {name} และทำเครื่องหมายเป็นลาล่วงหน้าแล้ว — ไม่เป็นไร | {date} is on {name}'s leave day and is marked as a planned absence — that's fine. |
({date} shows as the plan table shows it, e.g. "Mon 19/Oct/26". The button is the already-approved "Planned absence / ไม่มาแน่นอน (ลาล่วงหน้า)".)

## TASK-818 · 820 · 821: (added as they report)

## TASK-819 (BE): cancelling a whole range
| where | TH | EN |
|---|---|---|
| LINE to the teacher when an admin cancels a **range** (`ob_tl_open_again_range`). The single-day line is unchanged; the Date line shows the span. | ช่วงวันนั้นรับจองคาบกับคุณได้ตามปกติแล้ว | Bookings with you are open again on those days. |
