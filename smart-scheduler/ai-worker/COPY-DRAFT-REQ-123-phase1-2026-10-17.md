# COPY DRAFT — REQ-123 Phase 1 (teacher leave made easy): every NEW string, for ONE owner approval — @Sober, collected as the tasks land
**Status: ✅ APPROVED by the owner 2026-10-17 ("อนุมัติทั้งหมด 31 วัน A"): every string as drafted, 31 days, P7 = A. Was: COMPLETE (2026-10-17). Every Phase 1 task has reported. Ready for the owner's ONE approval.** **Nothing listed here ships before the owner approves it.** Strings already approved (TASK-814, COPY-REVIEW 2026-10-17, and older) are not listed and are not reworded.

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

## TASK-818 (FE): the leave dialog (range · default date · "what saving will do")
| key | TH | EN |
|---|---|---|
| `recordTeacherLeave` (the calendar button, and the dialog title before a teacher is chosen) | บันทึกการลาของครู | Record teacher leave |
| `dateTo` | ถึงวันที่ (ไม่ใส่ = วันเดียว) | To (optional — blank means just this day) |
| `adminRangeHint` ({name}, {n} days) | การบันทึกลาของครู {name} จะปิดการจองใหม่ตลอด {n} วัน คาบที่จองไว้แล้วในช่วงนั้นไม่ถูกยกเลิกและยังไม่มีการแจ้งครอบครัวใด — จะเห็นรายการคาบของแต่ละวันเมื่อบันทึกเสร็จ | Recording leave for {name} blocks all {n} days for new bookings. Classes already booked on those days are not cancelled and no family has been told anything — you will see the list for each day once the leave is recorded. |
| `adminSubmitRange` | ปิดการจอง {n} วันของครู {name} | Block these {n} days for {name} |
| `willBlock` (teacher's own door, a future day) | การบันทึกนี้แค่ปิดวันนั้นไม่ให้จองใหม่ คาบที่จองไว้แล้ว {n} คาบยังอยู่ในตาราง ให้แอดมินจัดการ | Saving only blocks the day for new bookings. {n} class(es) stay on the schedule for an admin to handle. |
| `willCancel` (teacher's own door, today) | การบันทึกนี้จะยกเลิก {n} คาบ และแจ้งครอบครัวของคาบเหล่านั้น | Saving cancels {n} class(es) and tells their families. |
| `rangeDayNew` | บันทึกแล้ว | Recorded |
| `rangeDayAlready` | มีบันทึกอยู่แล้ว — ใช้รายการแรก | Already on record — the first entry stands |
| `rangeDayClasses` | จองไว้ {n} คาบ | {n} class(es) booked |
| `rangeDayNone` | ไม่มีคาบ | Nothing booked |

**❓ A question for the owner (P7):** the approved proposal says "cancels N classes **and tells N families**". The screen knows the number of classes, but **not the number of families**: one family can have several classes, and only families of *confirmed* classes are told. So `willCancel` says "tells their families" without a number. Two options:
- **A:** keep it without a number (as drafted);
- **B:** show the exact number. That needs a small back-end count (≈ 0.3 d) before the release.

## TASK-820 (FE): the leave panel opened from the calendar's leave strip
(The range confirm's two buttons and two toasts reuse the **approved** TASK-814 strings. The per-day "N class(es) booked / Nothing booked" reuse 818's drafts above. "Reason" is an approved label.)
| key | TH | EN |
|---|---|---|
| `panelTitle` | การลาของครู {name} | {name}'s leave |
| `panelNote` | หน้านี้ใช้ดูและยกเลิกวันลาเท่านั้น คาบในวันเหล่านี้ไม่ถูกแก้ที่นี่ — กดเปิดคาบเพื่อย้าย เปลี่ยนครู หรือยกเลิกคาบ | This only shows and cancels the leave. Classes on these days are not changed here — open one to move it, change its teacher or cancel it. |
| `panelOpen` (button on a class) | เปิดดู | Open |
| `cancelRange` (button) | ยกเลิกวันลาที่ยังไม่ถึงทั้งหมด | Cancel all future days |
| `cancelRangeTitle` | ยกเลิกวันลาของครู {name} ตั้งแต่ {from} ถึง {to}? | Cancel {name}'s leave from {from} to {to}? |
| `cancelRangeBody` | วันที่ยังไม่ถึงจะกลับมาจองคาบกับครูได้ตามปกติ วันที่เริ่มหรือผ่านไปแล้วคงไว้ตามเดิม คาบที่มีอยู่แล้วไม่มีอะไรเปลี่ยน และระบบจะแจ้งครูทาง LINE | The days still ahead open for bookings with this teacher again. Days that have already begun stay as they are. Existing classes don't change. The teacher is told on LINE. |

## TASK-821 (FE): the "Teacher leave" list on the Teachers page
| key | TH | EN |
|---|---|---|
| `listTitle` | การลาของครู | Teacher leave |
| `listUpcoming` (window) | ที่จะถึง | Upcoming |
| `listPast` (window) | ที่ผ่านมา | Past |
| `listEmptyUpcoming` | ยังไม่มีการลาของครูที่จะถึง | No upcoming teacher leave. |
| `listEmptyPast` | ไม่มีการลาของครูใน 3 เดือนที่ผ่านมา | No teacher leave in the last 3 months. |
| `listDays` ({n}) | {n} วัน | {n} days |
| `seeAll` (link in the calendar panel) | ดูการลาของครูทั้งหมด → | See all teacher leave → |

## TASK-819 (BE): cancelling a whole range
| where | TH | EN |
|---|---|---|
| LINE to the teacher when an admin cancels a **range** (`ob_tl_open_again_range`). The single-day line is unchanged; the Date line shows the span. | ช่วงวันนั้นรับจองคาบกับคุณได้ตามปกติแล้ว | Bookings with you are open again on those days. |

---
## For the owner, in one look
- **New strings:** TASK-817 ×5 · 816 ×3 · 818 ×10 · 819 ×1 · 820 ×6 · 821 ×7.
- **Already approved, reused verbatim, not listed here:** TASK-814's Cancel copy, "Planned absence", "Reason", «LEAVE CANCELLED», «Recorded by», the future-only refusals.
- **Two decisions inside:**
  1. **31 days** is the longest one leave can cover (any number is a one-line change);
  2. **P7's family count:**
     - **A:** "tells their families" with no number, as drafted;
     - **B:** the exact number, which needs a small back-end count (≈ 0.3 d).
- **After approval:** any word the owner changes is swapped in by the engineers and re-checked by me (a set mutation already guards each DRAFT marker), **before** the commit.
