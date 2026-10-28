# TEST-121: REQ-126 / 127 (TASK-837 "ตัดจบคอร์ส" + TASK-838 "เปลี่ยนครู / เวลา ทั้งคอร์ส"), on sid

- **QA:** Tanya
- **Date:** 2026-10-25
- **Environment:** sid: back `5b5f483` + front `f9f7f9c`, migration 0072 applied
- **Brief:** Porter's ⏸️ / ▶️ TEST-121 entries; `DEPLOY-REQ-126-127-end-early-and-change-teacher-time-2026-10-25.md` §4
- **Data:** QA only (QA kids QAChatOne / QAChatTwo, QA teachers qatt75 / qatt75b). Cleaned up (§Clean-up).

**Verdict:**
- **✅ 837 and 838 behave as specified, on screen and by value.**
- **🔒 Two items wait for the owner:**
  - **SQL-1:** the LINE outbox (the coach's reason, exactly 2 coach notices, the schedule messages);
  - **DR-3 (extended):** a user without the plan permission.
- ⚪ Two notes.

## 837 · "ตัดจบคอร์ส" (End course early)
| Check | Result | |
|---|---|---|
| The plan window (course C) shows **"ตัดจบคอร์ส"** | buttons: ยืนยันคอร์สทั้งคอร์ส · พักคอร์ส · **เปลี่ยนครู / เวลา ทั้งคอร์ส** · **ตัดจบคอร์ส** · เพิ่มคาบ (คิดเงิน) · แทรกคาบชดเชย (\`plan-window.png\`) | ✅ |
| The dialog's words (TH, approved) | title *"ตัดจบคอร์สนี้?"* · line *"ตัดจบคอร์ส Private SURFSKATE ของ QAChatOne — คาบที่เหลือ 2 คาบจะถูกนำออกจากตาราง ทำแล้วย้อนกลับไม่ได้"* · reason label *"เหตุผล"* · confirm *"ตัดจบคอร์ส"* · *"เลือกเหตุผลก่อนจึงจะดำเนินการต่อได้"* (\`end-dialog.png\`; opened, then cancelled) | ✅ verbatim |
| The reasons offered (course) | PROGRAM_CHANGED · CUSTOMER_CANCELLED · ADMIN_ERROR · **ENDED_EARLY ("ตัดจบคอร์ส")** | ✅ |
| **Ending with the new reason** (QA course A: 4 future sessions, qatt75) | \`POST /courses/:id/cancel {reason: ENDED_EARLY}\` ⇒ 200, \`removedSessions 4\`; the course \`status CANCELLED\`, \`endReason ENDED_EARLY\`; all 4 sessions CANCELLED. The preview said 4 too | ✅ |
| **Hardening:** \`TEACHER_LEAVE\` at the course end door | **400** \`INVALID_REASON\` (allowed: PROGRAM_CHANGED, CUSTOMER_CANCELLED, ADMIN_ERROR, ENDED_EARLY): no more latent 500 | ✅ |
| **A voucher end does NOT take the new reason** | \`POST /vouchers/:id/cancel {reason: ENDED_EARLY}\` on a live QA voucher ⇒ **400** \`INVALID_REASON\` (allowed: PROGRAM_CHANGED, CUSTOMER_CANCELLED, ADMIN_ERROR, TEACHER_LEAVE); the voucher is still ACTIVE | ✅ by API · ⚪ the voucher dialog itself not opened on screen (my clicks on the Voucher tab failed; not retried further) |
| The coach's LINE reason reads "ตัดจบคอร์ส"; the family gets nothing | **SQL-1** | 🔒 |
| Revenue unchanged | the course API carries no money fields, so not readable by me. The act's revenue path is unchanged per the deploy note | ⚪ not observed |

## 838 · "เปลี่ยนครู / เวลา ทั้งคอร์ส"
**Course C** (QAChatOne, qatt75, weekly Mon 12:00): 12 Oct **ATTENDED** · 19 Oct **ATTENDED** · 26 Oct **CONFIRMED** · 2 Nov **PENDING**.

| Check | Result | |
|---|---|---|
| **A clash with the new teacher's booking is refused, naming the date, nothing moved** | new = qatt75b, start Thu 5 Nov 14:00, where qatt75b already has a QA group (QA-Group-088J) ⇒ **409** *"วันที่ 2026-11-05 ครูมีคาบอื่นในเวลานี้แล้ว — ไม่ได้ย้ายคาบใด (เลือกวันเริ่มอื่น หรือแก้คาบที่ชนก่อน)"*; the rows are unchanged; the preview lists \`clashes: ["2026-11-05"]\` | ✅ |
| **The preview's n = what moves** | new = qatt75b, **Fri 6 Nov 17:00** ⇒ the dialog says *"คาบที่เหลือ 2 คาบจะย้ายไปเรียนกับครูที่เลือก ตามวันและเวลาใหม่ คาบที่เรียนไปแล้วไม่เปลี่ยน"*; preview \`n 2\` (\`change-filled.png\`) | ✅ |
| **After the act** (on screen, "ยืนยัน") | 12 Oct + 19 Oct **unchanged** (qatt75, ATTENDED) · the 2 remaining moved **in place** to **6 Nov + 13 Nov 17:00, qatt75b**, both **PENDING** (the CONFIRMED one reset) | ✅ |
| **The re-confirm alert** | *"1 คาบต้องยืนยันใหม่ · การยืนยันเดิมเป็นของตารางเดิม จึงถูกล้างไปแล้ว กดยืนยันคอร์สเพื่อส่งตารางใหม่ — คนละหนึ่งข้อความ"* (\`after-change.png\`) | ✅ |
| **The course confirm** | the plan window's button reads **"ยืนยันคอร์สทั้งคอร์ส (2)"** ⇒ pressed ⇒ \`POST /courses/:id/confirm\` 200 \`{confirmed 2, parentNotified true, parentLinked true}\`; both moved sessions **CONFIRMED** (\`after-course-confirm.png\`) | ✅ |
| Exactly ONE LINE to the old coach + ONE to the new; one schedule message each to the coach and the family | **SQL-1** | 🔒 |
| A user without the plan permission doesn't see the button | needs a non-admin user session ⇒ **DR-3** | 🔒 |

- ⚪ **Label:** the brief and the deploy note call the confirm "ยืนยันทั้งคอร์ส"; the screen reads **"ยืนยันคอร์สทั้งคอร์ส"**. Probably the pre-existing button; noting the wording gap only.
- ⚪ **A real LINE may have gone out:** QA parent a3fb456e (QAChatOne) is LINE-linked to the phone 0899990763 (linked in the 12 Oct round), and the course confirm answered \`parentNotified: true\`. If that phone is the owner's, he may have received the new schedule.

## 🔒 SQL-1 · bare SQL for the owner (read only)
\`\`\`sql
SELECT created_at, recipient_type, status, (recipient_line_user_id IS NOT NULL) AS has_line,
       payload->>'kind' AS kind, booking_id, payload
FROM notification_outbox
WHERE created_at >= '2026-10-25'
  AND booking_id IN (SELECT id FROM bookings
                     WHERE course_id IN ('76342ad6-9d9d-48a7-9ed1-c968d63dcc2b',
                                         'c7038643-d706-4402-9279-edf25ede1cf9',
                                         '9abca9b6-83fe-4fd4-b75b-1c90e577da92'))
ORDER BY created_at;
\`\`\`

**Expected:**
- **course A end (≈ 16:00 Bangkok):** coach rows whose reason reads ตัดจบคอร์ส / ENDED_EARLY, and **no** parent row;
- **course C change (≈ 18:45):** **exactly one** row to qatt75 (old) and **one** to qatt75b (new);
- **course C confirm (≈ 18:50):** one schedule row to the coach and one to the family.
- **Rows after 11:59 UTC (18:59 Bangkok)** come from my clean-up ends (A / B / C).
- Course B was ended at ≈ 18:25 (my misstep, below).

## Clean-up (QA)
- **Course A** (\`76342ad6\`): ended by the test (ENDED_EARLY).
- **Course B** (\`c7038643\`): **my misstep.** My first row reader saw only future rows, so my script marked **26 Oct and 2 Nov ATTENDED** instead of 12 / 19 Oct.
  - I ended it (ADMIN_ERROR), and replaced it with course C.
  - Its 2 attended rows stay (delivered rows are never removed).
  - ⚪ Side note: sid accepted "attend" on a **future** session (2 Nov). Existing behaviour, outside this test; listed only.
- **Course C** (\`9abca9b6\`): ended (ADMIN_ERROR) at **2026-10-25 11:59:02 UTC**.
- **The clash fixture** (a qatt75b 1 HR) was refused at creation (the slot was taken), so it never existed.
- The QA voucher is untouched (ACTIVE).

**Scripts (scratchpad):**
- \`t121a.js\`, \`t121a2.js\`: 837 API + the first 838 try.
- \`t121c.js\`: course B rows.
- \`t121d.js\`: course C set-up, clash, preview.
- \`t121f.js\`: plan window, end dialog, change dialog (look only).
- \`t121k.js\`: the change on screen.
- \`t121l.js\`: the course confirm.
- \`t121n.js\`: clean-up.
