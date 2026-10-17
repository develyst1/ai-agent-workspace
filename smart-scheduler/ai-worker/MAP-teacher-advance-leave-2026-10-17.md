# MAP — the teacher ADVANCE-LEAVE flow, as the code works TODAY — @Sober, 2026-10-17
**For @Porter → a proposal for the owner** (*"ใช้งานยาก"*), merged with Tanya's admin-side friction list (TEST-107 §2). **Read-only, facts only, no recommendation.** Code: back `d29e9d0`, front at its current tree.
**B** = `smart-scheduler-back/src` · **F** = `smart-scheduler-front/src`. Gathered with a read-only search agent; the key claims (no lift UI, admin future-only, the preview gap) were re-checked by me.

## 0 · In one breath
- **Two different acts hide behind one "leave" button, and the date decides which:**
  - **a future day** = "advance leave": the day is **blocked for new work** and the existing classes are **listed, not touched**;
  - **today or a past day** = "same-day leave": the chosen classes are **cancelled**, make-ups appended, and families and coaches notified.
- **The admin can only record future days, one day at a time, and cannot lift one from the screen.** No range, and no "undo" button.
- **The day's existing classes stay on the calendar after an advance leave.** The admin must handle each one by hand; the system lists their times only.
- **Course create** refuses a course whose week lands on the leave day, **even when that week is marked as a planned absence** (REQ-123).

## 1 · Entry points
| who | where | route · permission | what it accepts |
|---|---|---|---|
| **Teacher (own)** | calendar header "Report leave": only for a LINKED account with the key (F `Calendar/CalendarContent.tsx:46, 207-209`; `CalendarHeader.tsx:155-157`) | `POST /teachers/me/leave` (B `routes/api.ts:195-197`) · `action:calendar.teacher-leave` (B `lib/route-access.ts:110`) | one day · reason 3–200 · optional session ids (B `validation.ts:742-745`). **Today/past allowed** → the cancel act |
| **Admin (for a teacher)** | Teachers list → row ⋯ → "Record leave in advance" (F `Teachers/TeacherRowActions.tsx:88, 110-133`; date defaults to tomorrow) | `POST /teacher-leave-days` (B `api.ts:216-224`) · `action:calendar.status` (B `route-access.ts:125`) | one day · reason. **Future only**: today/past refused at the door (B `api.ts:222`, TASK-648) |
| **Lift (teacher)** | **no screen** | `DELETE /teachers/me/leave/:date` (B `api.ts:201-203`) | route exists; the front never calls it |
| **Lift (admin)** | **no screen** | `DELETE /teacher-leave-days/:teacherId/:date` (B `api.ts:225-227`) | route exists; the front never calls it. No date check: it can delete a past row (B `lib/teacher-leave.ts:100-108`) |
| **Admin's list** | the calendar fetches it for the visible day/week (F `CalendarContent.tsx:67-70`) | `GET /teacher-leave-days?from&to` (default today → +60 d, max 92 d; B `validation.ts:737-741`) | read |
| **LINE** | **none** for teacher leave. LINE's "ลา" is the parent's sick-leave (B `services/line-webhook.service.ts:1033, 1305`) | — | — |
- **The fork:** `isAdvanceLeave(date) = date > today (Bangkok)` (B `lib/teacher-leave.ts:31`), asked once in `reportTeacherLeave` (B `services/scheduler.service.ts:3623`).
- **Storage:** `teacher_leave_days`, one row per teacher per day (unique index; B `db/schema.ts:1268-1282`, migration 0062, TASK-561).

## 2 · Rules by teacher type
- **No leave path looks at the teacher type** (FT / PT / FL) (B `scheduler.service.ts:3612-3663`; `lib/teacher-leave.ts`).
- **UC-029 is a different rule:** the parent/student sick-leave notice cut-off per teacher type (`leave_cutoff_hours_fulltime` for FT+PT, `_freelance` for FL; B `lib/leave-notice.ts:1-16`; `scheduler.service.ts:4381-4393`). **It does not apply to a teacher's own leave.**
- Type matters only inside the shared booking gate, after the leave check (a freelance teacher with no budget is refused; B `scheduler.service.ts:1043-1048`).

## 3 · What happens to the bookings on that day
**Advance (future day):**
- **Nothing is cancelled, moved or notified to families** (B `lib/teacher-leave.ts:12-17, 88-98`; `scheduler.service.ts:3619-3631`).
- The answer **lists** that teacher's live class rows that day: primary or additional teacher, not group seats (B `lib/teacher-leave.ts:80-85`).
  - The dialog shows them as **times only** plus an orange "nothing has been cancelled" note (F `Calendar/Modal/ReportLeaveDialog.tsx:120-164`).
- Choosing sessions on a future day is refused (B `scheduler.service.ts:3624`).
- Recording the same day twice: the first one stands, `alreadyRecorded` is returned (B `lib/teacher-leave.ts:95-97`).
- **The admin door tells the teacher by LINE** (`teacher_leave_recorded`; B `scheduler.service.ts:3630`, `lib/line-message.ts:795-805`). Not on a duplicate; "not told" if the teacher's LINE is unlinked (B `:3677-3681`). **No family, other coach or admin is told.**
- **Lift** deletes the day only. Nothing is restored or cancelled. The admin door sends `teacher_leave_lifted` (B `scheduler.service.ts:3723-3726`).

**Same-day / past (the teacher's own door only):**
- The chosen live rows → `CANCELLED`, reason `TEACHER_LEAVE` (B `scheduler.service.ts:3649`).
  - If any of them was already ATTENDED, the whole request is refused (B `:3641-3642`).
- Group rows: the seats are cancelled with "coach leave" (B `:3648`).
- Course rows: a make-up is appended and the leave week added (B `:3650-3656`).
- Families (CONFIRMED rows only) get `class_cancelled_parent`, other coaches get `class_cancelled_teacher`, with "Reason: ครูลา" (B `:3657-3658`; `lib/line-message.ts:315, 342`).
- **No leave day is recorded** for a same-day leave. The doors that know the coach is off pass it along so the make-up avoids that day (B `scheduler.service.ts:3064-3068`, TASK-705).

## 4 · How a recorded leave day interacts with the rest
**The block (`assertTeacherBookable`, B `scheduler.service.ts:1043`)** refuses any NEW work with that teacher on that day (today or later only; B `lib/teacher-leave.ts:46-50`), at every door:
- every new booking via `insertBooking` (B `:1277`): course create, voucher, camp insert, group extension;
- adding a co-teacher (B `:1175`);
- swapping a group's teacher (B `:1774`);
- clash resolvers (B `:1836, 1871`);
- plan-edit teacher change (B `:3972`);
- move (B `:4626-4630`);
- resume with a new teacher (B `:5375`);
- course start change (B `:5761`);
- ECA / other-series swap (B `services/other-series.service.ts:315`).

**Course create (REQ-123):**
- every planned week, **including a week marked as a planned absence**, is inserted through `insertBooking` (B `scheduler.service.ts:2436-2454`);
- so the absent week hits the block too. Nothing exempts it.
- **The preview does not check the planned weeks** (only the make-up search; B `:2847`), so **the preview can look fine and the create then fails.**

**Make-ups:** the automatic make-up **skips** a leave day and never refuses (B `scheduler.service.ts:2969-2985`). The same applies to group extensions (B `:1940-1946`) and to a course start change (B `:5730, 5748`).

**Reviving a class on the leave day is refused** (B `lib/teacher-leave.ts:67-73`) for:
- confirm / attend (B `scheduler.service.ts:4145-4146`);
- a seat joining a group (B `:1691`);
- an extra group date (B `:1989`);
- an Undo (B `services/undo.service.ts:84`).

A make-up born confirmed on that day stays unconfirmed, and admins are told (B `scheduler.service.ts:4091-4101`).

**Camp:** a coach on leave gets no new camp block and keeps an existing one. The skipped coaches are returned as `onLeave` (B `services/camp.service.ts:281-290`), but **no screen shows that list**.

## 5 · Refusal texts (exact)
| code | text | where |
|---|---|---|
| `TEACHER_ON_LEAVE` 409 | ครู {name} ลาวันที่ {date} — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น | B `lib/teacher-leave.ts:58-59` |
| admin, not future · 400 | บันทึกวันลาแทนครูได้เฉพาะวันถัดไปเป็นต้นไป — ถ้าต้องการยกเลิกคาบของวันนี้ กรุณาจัดการรายคาบในปฏิทิน | B `lib/teacher-leave.ts:42-43` |
| sessions on a future day · 400 | ลาล่วงหน้าเป็นการปิดทั้งวัน — ไม่ต้องเลือกคาบ คาบที่มีอยู่แล้วจะแสดงให้แอดมินจัดการ | B `scheduler.service.ts:3624` |
| already taught · 409 `SESSION_DELIVERED` | คาบ {hh:mm} สอนไปแล้ว — แจ้งลาไม่ได้ | B `:3642` |
| lift, no such day · 404 | ไม่พบวันลาล่วงหน้านี้ | B `lib/teacher-leave.ts:106` |
| unknown session · 404 | ไม่พบคาบเรียน | B `scheduler.service.ts:3639` |
| list range · 400 | วันเริ่มต้องไม่หลังวันสิ้นสุด · ช่วงวันที่ยาวเกิน 92 วัน | B `validation.ts:739-740` |
| (same gate) workday · archived · freelance budget | ครู {name} ไม่ได้สอนวัน{weekday} — กรุณาเลือกครูอื่นหรือวันอื่น · ครู {name} ถูกปิดการใช้งานแล้ว · ครู {name} ยังไม่ได้ตั้งงบ — ตั้งงบก่อนจึงจะจองได้ | B `scheduler.service.ts:1035, 1040, 1047` |

Front strings: `teacherLeave.*`, `leaveDays.*` and `teachers.actRecordLeave` (F `lib/i18n/dictionaries.ts` EN 518-570 · TH 2631-2683 · 1580/3543).

## 6 · What the admin sees on screen
- **Recording:** the Teachers list → ⋯ → "Record leave in advance" opens one dialog (date + required reason). Today/past shows a yellow refusal and disables submit (F `ReportLeaveDialog.tsx:81, 201-208, 279`).
- **After recording:** the dialog lists the day's classes as **times only** + "nothing has been cancelled" + whether the teacher was told (F `:120-185`).
- **Calendar (admin only; a linked teacher's own calendar does not fetch it, F `CalendarContent.tsx:68`):**
  - a strip "**{name} is away — {n} class(es) to handle**" above the grid. It is text, not a control (F `Calendar/LeaveDayBanner.tsx:21-44`);
  - the teacher's cells are greyed, the "+" removed, and existing classes get a leave icon (F `CalendarGrid.tsx:195-225, 306-308`; `CalendarWeekGrid.tsx:125-168, 250-254`).

## 7 · Gaps the code itself shows (facts, no proposal)
1. **No way to lift (undo) a leave day from any screen.** Both lift routes exist; the front never calls them.
2. **One day per record.** No range anywhere.
3. **Advance leave leaves the day's classes in place.** The admin is given times only, with no link to act on each class and no bulk "move / cancel / change teacher".
4. **A week marked as a planned absence is still blocked** at course create (REQ-123), and **the preview doesn't warn**, so the failure appears only at Create.
5. **The teacher never sees their recorded days** on the web: `GET /teachers/me/leave` exists, but the front doesn't use it.
6. **Camp's "coach on leave, skipped" list** is returned by the back but shown nowhere.
7. **A same-day leave records no leave day**, so the calendar shows no leave strip for it. That is a different behaviour from an advance leave on the same screen.
8. Small inconsistencies:
   - recording needs a date after today, while the teacher's own list counts from today (B `lib/teacher-leave.ts:31` vs `:111-116`);
   - the front's "advance" check uses the browser clock while the server uses Bangkok time (F `ReportLeaveDialog.tsx:79`);
   - a stale comment names an old route (B `scheduler.service.ts:3606`).
