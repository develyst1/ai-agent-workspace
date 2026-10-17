# COPY SET — 2026-10-11 — **every open LINE and screen wording in ONE sitting: Khwan's workbook · the 5 admin notices · the 47 nobody read · her 2 new asks + the 1-hour setting**
**Assembled by @Sober for @Porter → the owner.** 🚫 **Nothing is built until the owner approves.** After approval: one TASK per team area, **split by FILE, not by row** (Team B owns `line-i18n.ts`, `line-message.ts` and `line-message-fields.ts`, batch 10-02). The build map is at the end.

## How this was made — so nothing here is from memory
- **Her words:** read FROM THE CELLS of `project-docs/req111-message-inventory/message-inventory-KHWAN-EDITS-2026-10-06.xlsx`, by script. **"Changed" means a cell that differs from the v2 inventory the owner sent her** (`REQ-111-message-inventory-DRAFT-v2-2026-10-04-for-owner-review.xlsx`), compared cell by cell. ⇒ **She changed 45 rows: 26 push (2 of them new) and 19 chat replies.** Every other row she left as it was.
- **Today's text:** rendered from the back code at **`a2185b2`** (the commit going to uat) by the repo's own inventory script (`scripts/inventory-line-messages.ts`, no database, no LINE), in a scratch copy. 📌 **The script refuses to run on today's code** because 4 newer message kinds are not in its list (`leave_refused_no_validity`, `course_expiry_changed`, `makeup_not_confirmed`, `makeup_past_expiry`); **all four are already owner-approved** and none is in her workbook. Fixing the script's list is a test-only chore, not part of this set.
- **The 47 (group c):** machine-copied from `COPY-SET-live-unread-2026-10-07.md`, and **re-checked today: all 47 EN and 47 TH strings are still in the front code at `2db1c57`, byte for byte.**
- **In the tables:** `⏎` is a line break. `TH = EN` means one text for both languages.

## Three rules applied to every row — say so once if any is wrong
1. **Where she filled only ONE language, the other stays as today** — except where the message is ONE string for both languages today (the coaches' two-language titles, the camp messages, her admin notices). There, her one cell is the text for both.
2. **Her words go in verbatim.** Where a cell looks like a typo or reads two ways, it is in (b) as a question. 🚫 We correct nothing on our own.
3. **Spaces at the very start or end of a cell are dropped** (7 cells; invisible in LINE). A line break at the START of R58/R59 is not a space — it is there today too, and stays.
**LINE limits:** every text here is far below LINE's 5,000-character limit for a text message. No row adds a picture, a button or a new bubble.

## The counts
| group | rows | what the owner does |
|---|---|---|
| **(a) her edit — take as is** | **24** (incl. 3 admin notices already decided on 10-07) | ✅ one approval for the group, or strike a row |
| **(b) her edit — needs one word from the owner** | **12** | ❓ one answer per row (a recommendation is given where SA has one) |
| **(c) unchanged, live, never approved** | **47** (9 groups) | ✅ approve / ✏️ new words / ❓ where it shows |
| **(d) new asks — with a size** | **3** (rows 45/46 + the 1-hour setting) | ✅ go / not now, and the questions listed |
| no change needed | 7 | — (listed so every row she touched is accounted for) |

---

## (a) Her edit — take as is (24)
| # | key | where it shows | today's text (code `a2185b2`) | her text (verbatim, from the cells) | the change | code impact / ❓ the word needed |
|---|---|---|---|---|---|---|
| P13 | `class_moved_teacher · teacher` | COACH · LINE push · a class is moved | TH = EN: `CLASS MOVED / ย้ายคาบ ‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Date : 22-10-2026⏎Time : 10:00-11:00⏎Coach : Coach B⏎Was : 15-10-2026 10:00-11:00` | TH = EN: `CLASS RESCHEDULED / แก้ไขตารางเรียน ‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Date : 22-10-2026⏎Time : 10:00-11:00⏎Coach : Coach B⏎Previous Schedule : 15-10-2026 10:00-11:00` | Title `CLASS MOVED / ย้ายคาบ` → `CLASS RESCHEDULED / แก้ไขตารางเรียน`; label `Was` → `Previous Schedule`. | Title + one field label. The `Was` label is shared with #14 below (same change there). |
| P14 | `class_moved_parent · parent` | PARENT · LINE push · a class is moved | TH: `📅 ย้ายคาบเรียน:⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Date : 22-10-2026⏎Time : 10:00-11:00⏎Was : 15-10-2026 10:00-11:00`<br>EN: `📅 CLASS MOVED:⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Date : 22-10-2026⏎Time : 10:00-11:00⏎Was : 15-10-2026 10:00-11:00` | TH = EN: `CLASS RESCHEDULED / แก้ไขตารางเรียน ‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Date : 22-10-2026⏎Time : 10:00-11:00⏎Coach : Coach B⏎Previous Schedule : 15-10-2026 10:00-11:00` | The family gets the COACH's message, word for word: the ‼️ two-language title and a `Coach` line it does not carry today. | Title + label + **one field added** (`Coach`) to the parent's version. Small. |
| P15 | `course_dropped_teacher · teacher` | COACH · LINE push · a course is dropped (paused) | TH: `COURSE PAUSED / พักคอร์ส ‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Coach : Coach B⏎Sessions : 2⏎Date : 22-10-2026, 29-10-2026⏎Time : 10:00-11:00⏎Reason : เปลี่ยนโปรแกรม`<br>EN: `COURSE PAUSED / พักคอร์ส ‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Coach : Coach B⏎Sessions : 2⏎Date : 22-10-2026, 29-10-2026⏎Time : 10:00-11:00⏎Reason : Program changed` | TH = EN: `COURSE PAUSED / ดร็อปคอร์ส ‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Coach : Coach B⏎Sessions : 2⏎Date : 22-10-2026, 29-10-2026⏎Time : 10:00-11:00⏎Reason : เปลี่ยนโปรแกรม` | Title `… / พักคอร์ส` → `… / ดร็อปคอร์ส`. | Title only. ⚖️ **My reading:** her EN cell repeats the Thai reason `เปลี่ยนโปรแกรม` — I read that as the sample copied, not a request; the reason stays in the reader's language. Say so if wrong. |
| P16 | `course_dropped_teacher (ended) · teacher` | COACH · LINE push · a course is ended / a voucher cancelled | TH: `COURSE ENDED / ยกเลิกคอร์ส ‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Coach : Coach B⏎Sessions : 2⏎Date : 22-10-2026, 29-10-2026⏎Time : 10:00-11:00⏎Reason : ลูกค้ายกเลิก`<br>EN: `COURSE ENDED / ยกเลิกคอร์ส ‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Coach : Coach B⏎Sessions : 2⏎Date : 22-10-2026, 29-10-2026⏎Time : 10:00-11:00⏎Reason : Customer cancelled` | TH = EN: `คอร์ส CANCEL‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Coach : Coach B⏎Sessions : 2⏎Date : 22-10-2026, 29-10-2026⏎Time : 10:00-11:00⏎Reason : ลูกค้ายกเลิก` | Title `COURSE ENDED / ยกเลิกคอร์ส ‼️` → `คอร์ส CANCEL‼️` (no space before ‼️, as she wrote it). | Title only. Same reading of the Thai reason as #15. |
| P17 | `rental_added_teacher · teacher` | COACH · LINE push · rental added after the morning reminder | TH = EN: `RENTAL ADDED / เพิ่มอุปกรณ์เช่า ‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Date : 15-10-2026⏎Time : 10:00-11:00⏎Coach : Coach B⏎Rental : Rent 50 / Helmet` | TH: `RENT/ อุปกรณ์เช่า ‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Date : 15-10-2026⏎Time : 10:00-11:00⏎Coach : Coach B⏎Rental : Rent 50 / Helmet`<br>EN: — | Title `RENTAL ADDED / เพิ่มอุปกรณ์เช่า ‼️` → `RENT/ อุปกรณ์เช่า ‼️`. | Title only. She filled the TH cell only; this coach title is ONE string in both languages today, so it changes for both. |
| P21 | `other_teacher_removed · teacher` | COACH · LINE push · removed from an ECA ("Other") series | TH: `❌ นำออกจากตารางสอน⏎คุณถูกนำออกจากตารางสอน⏎รายการ: Event C⏎Time: 10:00-11:00⏎วันที่:⏎  - 15-10-2026⏎  - 22-10-2026`<br>EN: `❌ REMOVED FROM SCHEDULE⏎You have been removed from a schedule⏎Item: Event C⏎Time: 10:00-11:00⏎Dates:⏎  - 15-10-2026⏎  - 22-10-2026` | TH: `❌ คุณถูกนำออกจากตารางสอน⏎รายการ: Event C⏎Time: 10:00-11:00⏎วันที่:⏎  - 15-10-2026⏎  - 22-10-2026`<br>EN: `❌ You have been removed from a schedule⏎Item: Event C⏎Time: 10:00-11:00⏎Dates:⏎  - 15-10-2026⏎  - 22-10-2026` | The title line and the sentence under it become ONE line: `❌ คุณถูกนำออกจากตารางสอน` / `❌ You have been removed from a schedule`. | One line dropped. Her flag: `ECA`. |
| P22 | `other_series_cancelled · teacher` | COACH · LINE push · a whole ECA series is cancelled | TH: `❌ ยกเลิกตารางทั้งชุด⏎ตารางสอนถูกยกเลิกทั้งชุด⏎รายการ: Event C⏎Time: 10:00-11:00⏎เหตุผล: จองผิด (แอดมิน)⏎วันที่:⏎  - 15-10-2026⏎  - 22-10-2026`<br>EN: `❌ SCHEDULE CANCELLED⏎Your teaching schedule has been cancelled⏎Program: Event C⏎Time: 10:00-11:00⏎Reason: Booking error (admin)⏎Date:⏎  - 15-10-2026⏎  - 22-10-2026` | TH: `❌ ตารางสอนถูกยกเลิกทั้งหมด⏎รายการ: Event C⏎Time: 10:00-11:00⏎เหตุผล: จองผิด (แอดมิน)⏎วันที่:⏎  - 15-10-2026⏎  - 22-10-2026`<br>EN: `❌ Your teaching schedule has been cancelled⏎Program: Event C⏎Time: 10:00-11:00⏎Reason: Booking error (admin)⏎Date:⏎  - 15-10-2026⏎  - 22-10-2026` | Same: one line, `❌ ตารางสอนถูกยกเลิกทั้งหมด` / `❌ Your teaching schedule has been cancelled`. | One line dropped; TH wording of the line changes. |
| P25 | `camp_reminder · teacher` | COACH · LINE push · camp day roster (`camp_reminder`, coach) | TH: `⏱️TODAY'S SCHEDULE:⏎⏎แคมป์ : Camp Week 1⏎Date : 15-10-2026⏎Students : 3 (Full 1 · AM 1 · PM 1)⏎  - Student A⏎  - Student B⏎  - Student C`<br>EN: `⏱️TODAY'S SCHEDULE:⏎⏎Camp : Camp Week 1⏎Date : 15-10-2026⏎Students : 3 (Full 1 · AM 1 · PM 1)⏎  - Student A⏎  - Student B⏎  - Student C` | TH: `⏱️TODAY'S SCHEDULE:⏎⏎Camp : Week 1⏎Date : 15-10-2026⏎Students : 3 (ทั้งวัน 1 ·เช้า 1 · บ่าย 1)⏎  - Student A⏎  - Student B⏎  - Student C`<br>EN: `⏱️TODAY'S SCHEDULE:⏎⏎Camp : Week 1⏎Date : 15-10-2026⏎Students : 3 (Full day 1 · Morning 1 · Afternoon 1)⏎  - Student A⏎  - Student B⏎  - Student C` | 🔎 **She wrote it in the PARENT daily-reminder row; by its content it is the coach's CAMP roster** (count + names). Changes: TH label `แคมป์ :` → `Camp :`; the split `(Full 1 · AM 1 · PM 1)` → TH `(ทั้งวัน 1 ·เช้า 1 · บ่าย 1)`, EN `(Full day 1 · Morning 1 · Afternoon 1)`. | Labels only. 📌 Today's text in this row is the camp roster (`camp_reminder` coach), NOT the daily reminder shown in her row. |
| P27 | `camp_deduction · parent` | PARENT · LINE push · camp day-end credit cut (`camp_deduction`) | TH = EN: `🏕️ BALANCE CAMP⏎Student: Student A⏎Date: 15-10-2026⏎Remaining: 1.5 / 5 days` | TH = EN: `🏕️ CAMP DEDUCTION: ⏎Student: Student A⏎Date: 15-10-2026⏎Remaining: 1 / 5 days` | 🔎 **She wrote it in the coach WEEKLY row; by its content it is the camp deduction.** Title `🏕️ BALANCE CAMP` → `🏕️ CAMP DEDUCTION: `. | Title only. 📌 Today's text here is `camp_deduction`, NOT the weekly schedule shown in her row. |
| P35 | `teacher_leave_lifted · teacher` | COACH · LINE push · an admin removes the coach's leave day | TH: `🗓️ แอดมินยกเลิกวันลาของคุณแล้ว⏎Date: 22-10-2026⏎วันนั้นรับจองคาบกับคุณได้ตามปกติแล้ว`<br>EN: `🗓️ An admin removed your leave day⏎Date: 22-10-2026⏎Bookings with you are open again that day.` | TH: —<br>EN: `🗓️ LEAVE CANCELLED⏎Date: 22-10-2026⏎Bookings with you are open again.` | EN only: title → `🗓️ LEAVE CANCELLED`, line → `Bookings with you are open again.` | EN only; the TH is unchanged. |
| P40 | `student_registered · admin` | ADMIN · LINE push · a family registers a child | TH: `🔔 แจ้งเตือนจากระบบตารางเรียน`<br>EN: `🔔 Notification from the scheduler` | TH: —<br>EN: `🔔 Student: B registered` | **Already decided 2026-10-07** (COPY-REVIEW §T-ADMIN-ALERTS): her words, ONE text for both languages; `B` = the child's name. | New `case` in the renderer (today the empty bell `🔔 แจ้งเตือนจากระบบตารางเรียน`). Ships with #41–#44. |
| P41 | `parent_asked_for_admin · admin` | ADMIN · LINE push · a parent presses «คุยกับแอดมิน» | TH: `🔔 แจ้งเตือนจากระบบตารางเรียน`<br>EN: `🔔 Notification from the scheduler` | TH: —<br>EN: `🔔 Please support Parent of Student B.` | **Already decided 2026-10-07:** her words; a parent with two children ⇒ both names `A & B` (her answer). | Same build as #40. |
| P42 | `teacher_asked_for_admin · admin` | ADMIN · LINE push · a coach presses «คุยกับแอดมิน» | TH: `🔔 แจ้งเตือนจากระบบตารางเรียน`<br>EN: `🔔 Notification from the scheduler` | TH: —<br>EN: — | **Already APPROVED by the owner 2026-10-07:** `🔔 Please support Coach B.` (she left the row blank; @Sober's draft in her voice). | Same build as #40. `Coach B` = the coach's nickname. |
| R39 | `empty_leave_cutoff` | PARENT · LINE chat · «ลา» when every class is inside the cut-off | TH: `คาบที่เหลือใกล้ถึงเวลาเรียนแล้ว แจ้งลาผ่านบอทไม่ทันค่ะ กรุณาติดต่อแอดมิน`<br>EN: `Your upcoming classes are too close to their start time to cancel here. Please contact the admin.` | TH: `คลาสเรียนใกล้ถึงเวลาเรียนแล้ว ไม่สามารถแจ้งลาในระบบได้ค่ะ กรุณาติดต่อแอดมินเพื่อ support นะคะ`<br>EN: `Class is about to start. Absence requests can no longer be made in the system. Please contact Admin for assistance.` | Her TH and EN, both new. | None beyond the words. Note: she adds `support` in English inside the Thai — her style, kept. |
| R46 | `enter_ask_phone` | ANYONE unlinked · LINE chat · «เข้าใช้ระบบ» asks for the phone | TH: `กรุณาพิมพ์เบอร์โทรที่ลงทะเบียนไว้ค่ะ หากยังไม่เคยลงทะเบียน กรุณาติดต่อแอดมิน`<br>EN: `Please type your registered phone number. If you have never registered, please contact an admin.` | TH: `กรุณากรอกเบอร์โทร.ที่ลงทะเบียนไว้ในระบบ Line ค่ะ `<br>EN: `Please enter your mobile phone that linked with Line app. ` | Her TH and EN. ⚠️ Drops today's second sentence (*"never registered? contact an admin"*). | None. |
| R59 | `verify_parent_children_names` | PARENT · LINE chat · phone found — the children named | TH: `⏎พบข้อมูลของคุณแล้วค่ะ — {names}`<br>EN: `⏎Found your family — {names}` | TH: —<br>EN: `⏎Found your children — {names}` | EN only: `Found your family` → `Found your children`. | None. |
| R60 | `verify_parent_archived` | PARENT · LINE chat · the phone belongs to an archived family | TH: `เบอร์นี้เคยลงทะเบียนไว้แล้ว กรุณาติดต่อร้านเพื่อคืนสถานะ`<br>EN: `This number was registered before — please contact the shop to restore it.` | TH: —<br>EN: `This number was registered before — please contact our Admin.` | EN only: `contact the shop to restore it` → `contact our Admin`. | None. The TH still says ร้าน / คืนสถานะ. |
| R61 | `generic_error` | ANYONE · LINE chat · a server error | TH: `ขออภัย ระบบมีปัญหาชั่วคราว กรุณาติดต่อแอดมิน`<br>EN: `Sorry — something went wrong on our side. Please contact an admin.` | TH: —<br>EN: `Sorry — something went wrong. Please contact our Admin.` | EN only. | None. |
| R62 | `verify_parent_other_family` | PARENT · LINE chat · this LINE account is linked to another family | TH: `บัญชี LINE นี้ผูกกับอีกครอบครัวไว้แล้วค่ะ หากไม่ถูกต้องกรุณาติดต่อแอดมิน`<br>EN: `This LINE account is already linked to another family. Please contact an admin if that is wrong.` | TH: `บัญชี LINE นี้ได้มีการผูกในระบบไว้แล้วค่ะ กรุณาติดต่อแอดมินค่ะ `<br>EN: `Someone has linked this LINE account in the system already. Please contact our Admin. ` | Her TH and EN. ⚠️ Drops *"if that is wrong"*. | None. |
| R63 | `add_dup_detail` | PARENT · LINE chat + the LIFF register page · a second child with the same name | TH: `มีน้องชื่อนี้ในครอบครัวแล้ว — กรุณาใส่ชื่อจริงของน้อง (ชื่อ-นามสกุล) เพื่อไม่ให้สับสนกันค่ะ`<br>EN: `There is already a child with this name. Please enter the child's real name (first name and surname) so they are not mixed up.` | TH: `มีน้องลงทะเบียนชื่อนี้แล้ว — กรุณาใช้ชื่อเล่น + ชื่อจริงของน้องค่ะ`<br>EN: `This name is already registered. Please use your child’s nickname + first name.` | Her TH and EN. ⚠️ **Meaning moves:** today asks for the child's REAL full name (first name + surname); hers asks for **nickname + first name**. | None — the next answer is accepted as typed (no rule checks for a surname). Shows on the register page too (`register.ts`). |
| R82 | `checkin_err` | PARENT · LINE chat · check-in fails | TH: `ไม่สามารถเช็คอินได้ในขณะนี้`<br>EN: `Can't check in right now` | TH: `ไม่สามารถเช็คอินได้ในขณะนี้ค่ะ กรุณาติดต่อแอดมิน`<br>EN: `You can't check in right now. Please contact Admin.` | Her TH and EN; adds *"please contact Admin"*. | None. |
| R83 | `leave_err` | PARENT · LINE chat · leave fails | TH: `ไม่สามารถแจ้งลาได้ในขณะนี้`<br>EN: `Can't record leave right now` | TH: `ไม่สามารถแจ้งลาได้ในขณะนี้ค่ะ กรุณาติดต่อแอดมิน`<br>EN: `You can't request an absence right now. Please contact Admin.` | Her TH and EN; adds *"please contact Admin"*. | None. |
| R120 | `ob_l_planned_leave` | ADMIN · daily digest label · a course with leave already declared | TH: `แจ้งลาล่วงหน้าไว้ (วันที่)`<br>EN: `Leave already booked (dates)` | TH: —<br>EN: ` Leave already requested (dates)` | EN only: `booked` → `requested`. | None. (Her cell starts with a space.) |
| R125 | `cl_note_hour` | PARENT · LINE push note · a cancelled class gave the hour back | TH: `คืนชั่วโมงเข้ายอดคงเหลือแล้ว`<br>EN: `The hour has been returned to your balance.` | TH: `คืนชั่วโมงเรียนให้แล้วค่ะ`<br>EN: `The lesson hour has been returned to your course.` | Her TH and EN. | None. |

---
## (b) Her edit — needs ONE word from the owner (12)
| # | key | where it shows | today's text (code `a2185b2`) | her text (verbatim, from the cells) | the change | code impact / ❓ the word needed |
|---|---|---|---|---|---|---|
| P11 | `makeup_cancelled_parent · parent` | PARENT · LINE push · a MAKE-UP class is cancelled (`makeup_cancelled_parent`) | TH: `❌ ยกเลิกคาบเรียน:⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Date : 15-10-2026⏎Time : 10:00-11:00⏎Note : ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ 22-10-2026`<br>EN: `❌ CLASS CANCELLED:⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Date : 15-10-2026⏎Time : 10:00-11:00⏎Note : A new class has been added on 22-10-2026.` | TH: `CLASS CANCELLED / ยกเลิกคาบ ‼️⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Date : 15-10-2026⏎Time : 10:00-11:00⏎Coach : Coach B⏎Reason : ลูกค้ายกเลิก`<br>EN: `❌ CLASS CANCELLED:⏎Student : Student A⏎Program : Private FREESKATE 6 HR⏎Date : 15-10-2026⏎Time : 10:00-11:00⏎Reason : Teacher leave⏎Note : A make-up session has been added to the schedule.` | Her note: `ใช้อันเดียวกับอันนี้` ("use the same as this one"). **Her TH and EN cells are two DIFFERENT messages:** TH = the coach-style cancel (‼️ title, `Coach`, `Reason : ลูกค้ายกเลิก`); EN = the family cancel with `Reason : Teacher leave` and `Note : A make-up session has been added to the schedule.` **Both drop the new class's DATE** that today's note gives. | ❓ **Which one, for both languages?** And is losing the new date intended? *(SA recommendation: her EN shape for both, since it is the family's message — but the date question is hers.)* Code: adds a `Reason` field to this message. |
| P18 | `teacher_assigned · teacher` | COACH · LINE push · a coach is put on a class (her flag: `ย้ายครู`) | TH: `👩‍🏫 คุณได้รับมอบหมายคาบสอนใหม่⏎นักเรียน: Student A⏎วิชา: Private FREESKATE⏎เวลา: 15-10-2026 10:00-11:00`<br>EN: `👩‍🏫 A class has been assigned to you⏎Student: Student A⏎Subject: Private FREESKATE⏎Time: 15-10-2026 10:00-11:00` | TH: `👩‍🏫 คุณได้รับมอบหมายคาบสอนใหม่⏎นักเรียน: Student A⏎วิชา: Private FREESKATE⏎เวลา: 15-10-2026 10:00-11:00⏎Remark :⏎Rental :`<br>EN: — | TH only: adds two lines, `Remark :` and `Rental :`, shown EMPTY in her sample. | ❓ **Print the two labels when empty (as she shows) or leave them out when empty (the rule every other message follows)?** Code: two new fields on this message (S). EN: not given — same two lines? |
| P26 | `camp_reminder · parent` | PARENT · LINE push · camp day reminder (`camp_reminder`, family) — 🔎 mapped by content; she wrote it in the coach daily-reminder row (flag `เปลี่ยนเวลา`) | TH: `⏱️TODAY'S SCHEDULE:⏎⏎Student : Student A⏎แคมป์ : Camp Week 1⏎Date : 15-10-2026⏎ช่วง : ช่วงเช้า`<br>EN: `⏱️TODAY'S SCHEDULE:⏎⏎Student : Student A⏎Camp : Camp Week 1⏎Date : 15-10-2026⏎Time : Morning (AM)` | TH: `⏱️TODAY'S SCHEDULE:⏎⏎Student : Student A⏎Camp : Week 1⏎Date : 15-10-2026⏎Time : 10.00-15.00`<br>EN: `⏱️TODAY'S SCHEDULE:⏎⏎Student : Student A⏎Camp : Week 1⏎Date : 15-10-2026⏎Time : 10.00-12.00` | TH label `แคมป์ :` → `Camp :`. **`ช่วง : ช่วงเช้า` / `Time : Morning (AM)` → the real hours**, e.g. `Time : 10.00-15.00` (full day) / `10.00-12.00` (her EN sample = a morning). | ❓ **Times with a DOT (`10.00`) as she wrote, or a colon (`10:00`) like every other message?** Code: the time comes from the camp day's window and its half-day hours (S). |
| P33 | `teacher_leave_recorded (classes on that day) · teacher` | COACH · LINE push · an admin RECORDS a leave day for the coach (classes that day) | TH: `🗓️ แอดมินบันทึกวันลาของคุณแล้ว⏎Date: 22-10-2026⏎วันนั้นจะไม่มีการจองคาบใหม่กับคุณ⏎คาบที่จองไว้แล้ว 2 คาบยังอยู่ในตารางและยังไม่ได้ยกเลิก — กรุณาถือว่าสอนตามปกติจนกว่าแอดมินจะแจ้ง⏎บันทึกโดย: Admin D`<br>EN: `🗓️ An admin recorded a leave day for you⏎Date: 22-10-2026⏎No new class can be booked with you that day.⏎The 2 class(es) already booked that day are unchanged and NOT cancelled — please treat them as going ahead until an admin tells you otherwise.⏎Recorded by: Admin D` | TH: —<br>EN: `🗓️ LEAVE CANCELLED⏎Date: 22-10-2026⏎No new class will be booked.⏎The 2 class(es) that already booked, still on. ⏎Recorded by: Admin D` | EN only: title → `🗓️ LEAVE CANCELLED`; *"…treat them as going ahead until an admin tells you otherwise"* → `The 2 class(es) that already booked, still on.` | ❓ **The title says CANCELLED on the message that says a leave was RECORDED** (the opposite of #35, which she titled the same). Typo for RECORDED, or meant? 🚫 Not corrected by us. |
| P34 | `teacher_leave_recorded (no classes that day) · teacher` | COACH · LINE push · same, nothing booked that day | TH: `🗓️ แอดมินบันทึกวันลาของคุณแล้ว⏎Date: 22-10-2026⏎วันนั้นจะไม่มีการจองคาบใหม่กับคุณ⏎บันทึกโดย: Admin D`<br>EN: `🗓️ An admin recorded a leave day for you⏎Date: 22-10-2026⏎No new class can be booked with you that day.⏎Recorded by: Admin D` | TH: —<br>EN: `🗓️ LEAVE CANCELLED⏎Date: 22-10-2026⏎No new class will be booked.⏎Recorded by: Admin D` | EN only: title → `🗓️ LEAVE CANCELLED`; `No new class will be booked.` | ❓ Same question as #33. |
| P43 | `admin_asked_for_admin · admin` | ADMIN · LINE push · an admin account presses «คุยกับแอดมิน» | TH: `🔔 แจ้งเตือนจากระบบตารางเรียน`<br>EN: `🔔 Notification from the scheduler` | TH: —<br>EN: — | **Already APPROVED by the owner 2026-10-07:** `🔔 Please support Admin "Chat name".` | ❓ **The one open word:** `"Chat name"` is the LINE display name, read from LINE when the notice is sent and never stored. **When LINE gives none, what prints?** Proposal on file: `"a LINE user"` + the time (`inbox/PM.md` 2026-10-07; her doubt answered in `COPY-DRAFT-khwan-line-user-locator-2026-10-08.md`). **The five admin notices are built together the moment this lands.** |
| P44 | `unlinked_asked_for_admin · admin` | ADMIN · LINE push · someone not linked presses «คุยกับแอดมิน» | TH: `🔔 แจ้งเตือนจากระบบตารางเรียน`<br>EN: `🔔 Notification from the scheduler` | TH: —<br>EN: `🔔 Please support "Chat name".` | Her words. | ❓ Same fallback as #43. |
| R35 | `empty_checkin` | PARENT · LINE chat · «เช็คอิน» finds no class (also the QR scan) | TH: `วันนี้ไม่พบคลาสที่ยืนยันแล้วสำหรับบัญชีนี้ค่ะ หากน้องมีเรียนวันนี้ รบกวนติดต่อแอดมินเพื่อตรวจสอบก่อนเช็คอินนะคะ`<br>EN: `We couldn't find a confirmed class for today on this account. If your child has a class today, please contact the admin to check it before checking in.` | TH: `วันนี้ไม่มีคลาสเรียนค่ะ`<br>EN: — | 🔴 **Her base was the OLD text** (`วันนี้ไม่มีคลาส`). **Since then the owner APPROVED Draft A′ (2026-10-04, TASK-661)** — the long sentence today, written on purpose to be TRUE when the class exists but is not confirmed, or the child is not linked to this LINE. | ❓ **Keep the approved A′ (SA recommendation: it covers the cases hers would hide) or take hers?** Code: none either way. |
| R38 | `empty_leave` | PARENT · LINE chat · «ลา» with nothing to cancel | TH: `ไม่มีคาบที่จะแจ้งลาค่ะ`<br>EN: `You have no upcoming classes to cancel` | TH: `ไม่มีคลาสที่สามารถที่สามารถแจ้งลาได้ค่ะ`<br>EN: — | TH only. Her cell has a **doubled phrase**: `ที่สามารถที่สามารถ`. | ❓ **Ship as written, or without the repeat?** (We never "improve" her words on our own.) EN unchanged. |
| R48 | `children_none` | PARENT · LINE chat · «นักเรียน» with no child yet | TH: `ยังไม่มีนักเรียน — แตะ "เพิ่มนักเรียน" เพื่อเพิ่ม`<br>EN: `No children yet — tap "Add child" to add` | TH: `ยังไม่มีนักเรียน — แตะ เพื่อปุ่ม "เพิ่มนักเรียน" `<br>EN: `No children yet — tap "Add child" ` | TH `แตะ เพื่อปุ่ม "เพิ่มนักเรียน"` reads garbled ("tap to-button"); EN drops "to add". | ❓ **As written, or what did she mean?** Code: none. |
| R58 | `verify_parent_children_count` | PARENT · LINE chat · phone found — how many children | TH: `⏎พบนักเรียน {n} คนในบัญชีนี้`<br>EN: `⏎{n} children on file` | TH: —<br>EN: `⏎{n} children has/ have been added` | EN only: `{n} children on file` → `{n} children has/ have been added`. | ❓ **Meaning:** nothing is ADDED at this step — the phone FOUND children already on file. And the `has/ have` slash: print as written? Code: none (the number stays a placeholder). |
| R147 | `lib/leave-notice.ts:49` | PARENT · LINE chat · «ลา» refused because the class is too close (also the calendar's refusal) | TH: `ขออภัยค่ะ ลาได้ล่วงหน้าอย่างน้อย ${cutoffHours} ชั่วโมงก่อนเริ่มคาบ คาบนี้เริ่ม ${time} น. หากจำเป็น กรุณาติดต่อแอดมิน`<br>EN: — | TH: `ขออภัยค่ะ การลาต้องแจ้งล่วงหน้าอย่างน้อย 1 ชม. ก่อนเริ่มคลาส⏎กรณีฉุกเฉิน กรุณาติดต่อแอดมินค่ะ`<br>EN: `Sorry, absences must be requested at least 1 hour before the class starts.⏎For emergencies, please contact Admin.` | Her TH and EN (she put the EN in the TH row's EN cell; the EN today is row 146). | ❓ **She fixed the number: `1 ชม.` / `1 hour`. The number today is a SETTING** (see (d) S1). A fixed number goes wrong the day the setting changes. *(SA recommendation: her words with the number kept as the setting — `อย่างน้อย {cutoffHours} ชม.` / `at least {cutoffHours} hour(s)`.)* Code: none beyond the words. |

---
## (c) Unchanged, live, NEVER approved — the 47 (from COPY-SET-live-unread-2026-10-07.md, re-checked in front 2db1c57 today)
**Who sees them:** all ADMIN-facing (Khwan's team) except L8 (PARENTS) and L9. **Read each as if new** — "live and nobody complained" is not a reason to pass it. **L10 of that file (a back-end refusal no screen can reach) stays LISTED, not for approval** (owner rule 2026-10-07).

### L1 · Discount-entry errors — 3 string(s)
**Where it shows:** ADMIN · the discount box when selling/booking (`DiscountSection`) — shown when the typed discount is invalid.
**Why it is here:** no approval found anywhere.

| key | EN | TH |
|---|---|---|
| `discount.errPercentRange` | A percentage discount must be between 0 and 100. | ส่วนลดเป็นเปอร์เซ็นต์ต้องอยู่ระหว่าง 0–100 |
| `discount.errBahtPositive` | A baht discount must be a whole number above zero. | ส่วนลดเป็นบาทต้องเป็นจำนวนเต็มบวก |
| `discount.errValue` | That discount value isn't valid. | ค่าส่วนลดไม่ถูกต้อง |

### L2 · Attendee-note hint — 1 string(s)
**Where it shows:** ADMIN · the hint under the per-session attendee note on a booking.
**Why it is here:** wording was Porter's own (TASK-179); never sent to the owner.

| key | EN | TH |
|---|---|---|
| `attendeeNote.hint` | Who is bringing the child, and logistics for this session. Not for phone numbers, addresses or medical details. | ใครเป็นคนพามา และรายละเอียดการรับส่งของคาบนี้ ไม่ใช่ที่สำหรับเบอร์โทร ที่อยู่ หรือข้อมูลสุขภาพ |

### L3 · 🙋 MINE — the admin's record-leave dialog (TASK-611) — 14 string(s)
**Where it shows:** ADMIN · Teachers page → «Record leave in advance» → the dialog and its result.
**Why it is here:** **@Sober's ruling only (2026-10-04), never the owner's — my miss.** The TH lines are Fern's drafts; the EN hint was tightened after review and the tightened text was never recorded.

| key | EN | TH |
|---|---|---|
| `teacherLeave.adminTitle` | Record leave for {name} | บันทึกวันลาของ {name} |
| `teacherLeave.adminSubject` | Whose leave this is | บันทึกวันลาให้ใคร |
| `teacherLeave.adminHint` | Recording leave for {name} blocks their whole day for new bookings. Classes already booked that day are not cancelled and no family has been told anything — you will see the list once the day is recorded. | การบันทึกวันลาของ {name} จะปิดรับจองคาบใหม่ทั้งวันนั้น — คาบที่จองไว้แล้วจะไม่ถูกยกเลิก และยังไม่มีการแจ้งผู้ปกครองเรื่องใด ๆ เมื่อบันทึกแล้วระบบจะแสดงรายการคาบให้ดู |
| `teacherLeave.adminPastRefused` | This door records leave for a day that has not happened yet. For today or a past day, the classes have to be handled one at a time on the calendar, because cancelling them tells each family. | ประตูนี้ใช้บันทึกวันลาล่วงหน้าเท่านั้น ถ้าเป็นวันนี้หรือวันที่ผ่านมาแล้ว ต้องจัดการคาบทีละคาบในหน้าปฏิทิน เพราะการยกเลิกคาบจะมีการแจ้งผู้ปกครองทุกครอบครัว |
| `teacherLeave.adminPastRefusedAction` | Pick a date after today | เลือกวันหลังจากวันนี้ |
| `teacherLeave.adminNothingCancelled` | NOTHING HAS BEEN CANCELLED. Those classes are still on the schedule and no family has been told — they are yours to handle one by one, and until you do, treat them as going ahead. | ยังไม่มีการยกเลิกคาบใด คาบเหล่านั้นยังอยู่ในตารางและยังไม่ได้แจ้งผู้ปกครอง — ต้องจัดการทีละคาบเอง และจนกว่าจะจัดการ ให้ถือว่าคาบยังสอนตามปกติ |
| `teacherLeave.adminDoneTeacherTold` | {name} has been told about this day. | ระบบแจ้ง {name} เรื่องวันลานี้แล้ว |
| `teacherLeave.adminDoneTeacherNotTold` | {name} has not been told — their LINE account is not linked. You will need to tell them yourself. | ระบบยังไม่ได้แจ้ง {name} เพราะบัญชี LINE ยังไม่ได้ผูก — ต้องแจ้งครูเองค่ะ |
| `teacherLeave.adminSubmit` | Block this day for {name} | ปิดรับจองวันนั้นของ {name} |
| `teacherLeave.adminAdvanceTitle` | {date} — leave recorded for {name} | {date} — บันทึกวันลาของ {name} แล้ว |
| `teacherLeave.adminAdvanceBlocked` | No new class can be booked with {name} that day. | จะไม่มีการจองคาบใหม่กับ {name} ในวันนั้น |
| `teacherLeave.adminAdvanceClasses` | {n} class(es) already booked with {name} that day: | มีคาบที่จองกับ {name} ไว้แล้ว {n} คาบในวันนั้น: |
| `teacherLeave.adminAdvanceNoClasses` | Nothing is booked with {name} that day. | วันนั้นยังไม่มีคาบที่จองกับ {name} |
| `teachers.actRecordLeave` | Record leave in advance | บันทึกวันลาล่วงหน้า |

### L4 · Cover-rate field (TASK-577) — 2 string(s)
**Where it shows:** ADMIN · an OTHER series → a covering coach for one session → the rate box.
**Why it is here:** called "approved" in passing in a Team B draft; no approval entry.

| key | EN | TH |
|---|---|---|
| `otherSeries.coverRate` | {name}'s rate for this session | ค่าสอนของ {name} สำหรับคาบนี้ |
| `otherSeries.coverRateHint` | The covering coach is paid their own rate for this session. This series has none on file for them yet, so enter it here. | ครูที่มาสอนแทนจะได้ค่าสอนของตัวเอง ตารางนี้ยังไม่มีค่าสอนของครูท่านนี้ จึงต้องระบุที่นี่ |

### L5 · "This session or from here on" + move-this-only (TASK-564) — 8 string(s)
**Where it shows:** ADMIN · an OTHER series → change a coach (the scope choice and the notes under it) · a COURSE session → Move (the last line).
**Why it is here:** COPY-REVIEW §2–§4 approved the LINE notices for this work, not these screen lines.

| key | EN | TH |
|---|---|---|
| `otherSeries.scopeLabel` | Which sessions? | ใช้กับคาบไหน? |
| `otherSeries.scopeThis` | This session only | เฉพาะคาบนี้ |
| `otherSeries.scopeRest` | This session and the rest | คาบนี้และคาบถัดไปทั้งหมด |
| `otherSeries.scopeHint` | Choose one — nothing is assumed. | เลือกอย่างใดอย่างหนึ่ง ระบบไม่เดาให้ |
| `otherSeries.scopeThisDate` | The session on | คาบวันที่ |
| `otherSeries.coverNote` | {to} covers for {from} on that day. {from} is not teaching it, and {to} is paid for it. | {to} สอนแทน {from} ในวันนั้น {from} ไม่ได้สอนคาบนั้น และ {to} ได้ค่าสอนของคาบนั้น |
| `otherSeries.joinNote` | {name} joins that session as a second coach. Both coaches are paid for it. | {name} เข้าสอนคาบนั้นเป็นครูคนที่สอง ได้ค่าสอนทั้งสองคน |
| `booking.moveThisOnly` | This moves this session only — the rest of the course stays as it is. | ย้ายเฉพาะคาบนี้ คาบอื่นของคอร์สยังคงเดิม |

### L6 · 🔴 THE LARGEST GAP — the change-start-date dialog (TASK-571): 14 strings, NONE approved — 14 string(s)
**Where it shows:** ADMIN · a not-yet-started course → «Move the start date».
**Why it is here:** ⚠️ **Easy to mistake for covered:** the SAME dialog carries five strings that ARE approved (TASK-574's preview, COPY-REVIEW §11 — `newStartHintCurrent`, `preview`, `forecastTitle`, `forecastRow`, `forecastCaveat`). **These 14 are the rest of the dialog and were never in any set** — including the warning that NOBODY is told by the move.

| key | EN | TH |
|---|---|---|
| `courseStart.startLabel` | Starts | เริ่มเรียน |
| `courseStart.edit` | Move the start date | เลื่อนวันเริ่มเรียน |
| `courseStart.title` | Move the start date — {student} | เลื่อนวันเริ่มเรียน — {student} |
| `courseStart.newStart` | New start date | วันเริ่มเรียนใหม่ |
| `courseStart.newStartHint` | The first session moves here; the rest follow week by week. | คาบแรกจะย้ายมาวันนี้ คาบถัดไปเลื่อนตามสัปดาห์ละคาบ |
| `courseStart.warnStale` | Nobody is told by this move. Until you run Confirm course, the family and the coach still have the OLD dates — run it as soon as the new dates are right. | การเลื่อนนี้ไม่มีการแจ้งใคร ลูกค้าและครูยังถือตารางเดิมอยู่จนกดยืนยันคอร์สอีกครั้ง — เมื่อวันใหม่ถูกต้องแล้วให้กดยืนยันคอร์สทันที |
| `courseStart.warnExpiry` | The expiry date is recalculated from the new schedule. | วันหมดอายุจะคำนวณใหม่จากตารางใหม่ |
| `courseStart.warnHandSetExpiry` | Someone set this course's expiry date by hand. This move REPLACES it. | คอร์สนี้มีคนตั้งวันหมดอายุไว้เอง การเลื่อนนี้จะแทนที่วันนั้น |
| `courseStart.confirm` | Move the sessions | เลื่อนคาบทั้งหมด |
| `courseStart.doneTitle` | {n} sessions moved — the course now starts {date} | ย้าย {n} คาบแล้ว — คอร์สเริ่ม {date} |
| `courseStart.expiryMoved` | Expiry: {from} → {to} | วันหมดอายุ: {from} → {to} |
| `courseStart.skippedTitle` | Weeks skipped (the coach is away) | สัปดาห์ที่ข้ามไป (ครูลา) |
| `courseStart.reconfirmTitle` | {n} sessions need confirming again | {n} คาบต้องยืนยันใหม่ |
| `courseStart.reconfirmBody` | Their confirmation was of the old dates, so it was cleared. Run Confirm course to send the new schedule — one message per person. | การยืนยันเดิมเป็นของตารางเดิม จึงถูกล้างไปแล้ว กดยืนยันคอร์สเพื่อส่งตารางใหม่ — คนละหนึ่งข้อความ |

### L7 · Group swap rate (TASK-634) — 2 string(s)
**Where it shows:** ADMIN · a GROUP series → swap the coach → the rate box.
**Why it is here:** Fern's draft, "yours to rule on" to @Sober; later files call it approved with no owner entry.

| key | EN | TH |
|---|---|---|
| `booking.groupSwapRate` | {name}'s rate for this group (per session) | ค่าสอนของ {name} สำหรับกลุ่มนี้ (ต่อคาบ) |
| `booking.groupSwapRateHint` | Leave this empty unless the swap is refused for a missing rate — that happens when this group has never paid this coach before. | ไม่ต้องกรอก ยกเว้นระบบปฏิเสธเพราะไม่มีค่าสอน — จะเกิดเมื่อกลุ่มนี้ยังไม่เคยจ่ายค่าสอนให้ครูคนนี้ |

### L8 · 👪 PARENT-FACING — "address on file" on the registration PAGE (TASK-566) — 2 string(s)
**Where it shows:** PARENT · the LINE registration page (LIFF), when the family's address is already on file.
**Why it is here:** the sentence is in no COPY or REQ file.

| key | EN | TH |
|---|---|---|
| `register.addressOnFile` | We already have your address on file. | เรามีที่อยู่ของครอบครัวนี้อยู่แล้วค่ะ |
| `register.addressOnFileProvince` | We already have your address on file ({province}). | เรามีที่อยู่ของครอบครัวนี้อยู่แล้วค่ะ ({province}) |

### L9 · The "linked to one" line (TASK-593) — 1 string(s)
**Where it shows:** the registration flow, when a phone is already linked to one child.
**Why it is here:** COPY-REVIEW-2026-09-29:266 describes it ("keeps its own sentence") but quotes no string. ⚠️ **Read it: the EN says "(1 child)" while the TH carries `{n}`** — the two halves do not say the same thing in the same way.

| key | EN | TH |
|---|---|---|
| `register.alreadyLinkedToOne` | Linked to {phone} (1 child). | ผูกกับเบอร์ {phone} (นักเรียน {n} คน) |


---
## (d) New asks — sized (SA estimates, +10 percent inside the figure)
### D1 · Row 45 — a "CONFIRMED SCHEDULE" to the PARENT when a VOUCHER is sold · **BE S ≈ 1 day**
**Row 45 — her cell, verbatim (she wrote TH = EN):** `📅CONFIRMED SCHEDULE:⏎Student : Student A⏎Program : VOUCHER  5 HR⏎*Expiry date : 3 Months⏎Remark : Sample remark`
**Today:** nothing goes to the family when a voucher is sold. They hear only per class booked (`booking_confirmed`) and per class used (`course_deduction`, voucher title).
**Build:** a new message kind, sent once by the voucher sale, with its own layout. Words: hers.
❓ **Two questions before it can be built:**
- **`*Expiry date : 3 Months`:** print the LENGTH, as in her sample, or the real expiry DATE (as every other message prints `*Expiry date`)?
- **`Remark`:** from where? (A voucher sale has no per-class remark today.)

### D2 · Row 46 — a "CONFIRMED SCHEDULE" to the PARENT when a CAMP is booked · **BE S–M ≈ 1–1½ days**
**Row 46 — her cell, verbatim (she wrote TH = EN):** `📅CONFIRMED SCHEDULE:⏎Student : Student A⏎Program : Balance Camp Full Day Full Week ⏎Date : 12-10-2026 - 16-10-2026⏎Time : 10:00-15:00⏎Remark : Sample remark`
**Today:** nothing goes to the family when a camp is booked. They hear only the camp-day reminder and the day-end credit cut.
**Build:** a new message kind, sent when the camp booking is made, with its own layout. The date range comes from the camp week and the time from the day's hours. Words: hers.
❓ **Three questions before it can be built:**
- **A half-day booking:** print the half-day hours (e.g. `10:00-12:00`)?
- **A booking changed or cancelled later:** send it again, or nothing?
- **`Program`:** the camp package's sale name (her sample `Balance Camp Full Day Full Week`)?

### D3 · Her «1 ชม.» — the LEAVE CUT-OFF is a SETTING, not wording · **no build — Khwan's team can change it themselves**
- **Where:** the Settings page, two values: `แจ้งลาล่วงหน้า — ครูประจำ/พาร์ทไทม์ (ชั่วโมง)` and `แจ้งลาล่วงหน้า — ครูฟรีแลนซ์ (ชั่วโมง)`.
- **Rules:** default **3** hours each, whole hours from **0 to 72**, so **1 is allowed**. What uat holds today is data, not code; her team can see it on that page.
- **What it changes:** from the moment it is saved, **the parent's «ลา» in LINE uses it**, and **so does the leave refusal on the calendar** (same setting).
- ⚠️ **Tie to row R147 in (b):** if the sentence fixes "1 ชม." and her team ever sets 2, the sentence lies. That is why SA recommends keeping the number as the setting.

---
## No change needed — every other row she touched (7)
| # | key | where | what she wrote | why nothing is approved |
|---|---|---|---|---|
| P20 | `other_teacher_added · teacher` | COACH · added to an ECA series | Flag `ECA` only — no new words. | Nothing to approve. |
| P37 | `reschedule_requested · admin` | ADMIN · old reschedule request — NOT SENT TODAY | She wrote `ไม่มีสิ่งนี้เกิดขึ้น` ("this never happens") — agrees: no producer. | Nothing to approve. |
| P38 | `sick_leave · admin` | ADMIN · `sick_leave` — NOT SENT TODAY | Her edit WITHDRAWN by her 2026-10-07: *"ถ้าเป็นตัวเดียวกับ Leave notice ไม่ต้องแก้ค่ะ"*. | Nothing to approve. |
| P39 | `leave_teacher · teacher` | COACH · `leave_teacher` — NOT SENT TODAY | Withdrawn, same answer. | Nothing to approve. |
| R42 | `course_row` | PARENT · «คอร์สของฉัน» line | She wrote `format เดิมที่ใช้อยุ่` with a sample in the one-line format. | ✅ **Already what ships:** the course line uses her format (`courseLineV2`); the `course_row` key she edited is no longer shown. Nothing to approve. |
| R85 | `leave_ok_session` | PARENT · LINE chat · a leave recorded | Her cells are two SAMPLES of the message. | ✅ Both read exactly as today's render (`leaveLine`). Nothing to approve. |
| R87 | `leave_lockline` | PARENT · LINE chat · leave refused, the course expiry is too short | Her sentence. | ✅ **Already live VERBATIM** as `leave_no_validity` (TASK-692, 2026-10-06). The old `leave_lockline` key is gone (leave quota abolished). |


---
## After approval — the build map, by FILE (cut the day the owner answers; nothing before)
| file (back unless noted) | owner of the file | what lands there | rough size |
|---|---|---|---|
| `src/lib/line-i18n.ts` · `src/lib/line-message.ts` · `src/lib/line-message-fields.ts` | **Team B** | all the (a)/(b) word changes and titles; the fields P14 `Coach`, P11 `Reason`, P18 `Remark`/`Rental`; **the five admin notices** (new cases); the renderer cases for D1/D2 | **S–M ≈ 1½–2 days** with by-value pins |
| camp messages (`camp_reminder` / `camp_deduction` renderers) | decided at the cut (claim check) | P25, P26 (the real hours), P27 | **S ≈ ½ day** |
| `src/lib/leave-notice.ts` | Team A (not claimed by Team B) | R147 | **XS** |
| the voucher sale and the camp booking (producers for D1/D2) | decided at the cut | D1, D2 | as sized above |
| front | — | **none of her rows touch a screen.** The 47 in (c) are front strings: a ✏️ there is a front copy change | per answer |
**Order of value:** the five admin notices first (the admin today sees an empty bell and cannot tell WHO is waiting), then the parent-facing rows, then the coach titles.
