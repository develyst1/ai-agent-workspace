# TEST-085: TASK-704 re-run on sid (back `d130a1d` / front `f60d7e7`): who tells the family when a CONFIRMED make-up is cancelled · 2026-10-08 00:00–00:15

**Tester:** Tanya (QA) · sid · API + the QA phone (QAChatOne / QAChatTwo's family, TH) · Evidence `project-docs/qa-2026-10-08/704-*.png`
**The two wordings:** make-up cancel (`makeup_cancelled_parent`) = *"❌ ยกเลิกคาบเรียน: Student · Program · Date · Time"* (+ *"Note : ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ X"* only if a class was truly re-added). The ordinary cancel carries the false-for-a-trim *"Note : ระบบเพิ่มคาบชดเชยให้แล้ว"*.
## Verdict: ✅ **TASK-704's doors PASS (D1–D4).** 🔴 **One NEW finding (F2, D4 placement)**, plus one 🟠 duplicate-message note.

| door | fixture / act | the family's phone | |
|---|---|---|---|
| **Build identity** | the first family cancel below uses the make-up wording | the running code is `d130a1d` | ✅ |
| **D1 (F1 re-test): Undo of the leave** | course `4706c2ef` (QAChatOne): leave 19/10 ⇒ make-up `36637136` born CONFIRMED 16/11 ⇒ **Undo** | 00:04 *"📅CONFIRMED SCHEDULE … 16-11-2026"* ⇒ 00:05 *"❌ ยกเลิกคาบเรียน: QAChatOne · Private SURFSKATE 6 HR · 16-11-2026 · 16:00-17:00"*, **no** "ระบบเพิ่มคาบชดเชยให้แล้ว", no new-class line | ✅ **F1 FIXED** |
| **D2: the TRIM, NOT via Undo** | leave 26/10 ⇒ make-up `c5ca90d8` CONFIRMED 16/11 ⇒ the plan editor's **insert** (27/10 16:00) ⇒ `{"appended":[],"cancelled":["c5ca90d8"]}` | 00:07 *"❌ ยกเลิกคาบเรียน: … 16-11-2026 …"*, **no** false "ระบบเพิ่มคาบชดเชยให้แล้ว", no new-class line (nothing appended) | ✅ |
| (a first D2 try, re-"confirm" of the SICK_LEAVE row, returned 200 but changed nothing ⇒ no trim; not a door) | | | |
| **D3: admin cancels a make-up** | leave 02/11 ⇒ make-up `4ec5f018` ⇒ admin cancel ⇒ the re-plan re-issued it in the **SAME slot** (16/11 16:00) | no cancel notice (TASK-551's owner rule: the same slot = nothing changed) · 🟠 but a **second "CONFIRMED SCHEDULE 16-11"** arrived (the replacement is born confirmed) | ✅ by rule · 🟠 duplicate |
| **D3b: admin cancel, a DIFFERENT slot** (16/11 blocked by an advance coach-leave, lifted after) | cancel `233c4317` ⇒ replacement `46ea4959` on **23/11** | *"❌ ยกเลิกคาบเรียน: … 16-11-2026 … **Note : ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ 23-11-2026**"*: the true new date | ✅ |
| **D4: a coach's OWN same-day leave over a make-up** | course `e3d6ad93` (QAChatTwo, coach qatt75, Thu 17:00 from 10/09, back-dated): leave 01/10 ⇒ make-up `3c3bef5d` CONFIRMED **today 08/10 17:00** ⇒ `qa-coach-qatt75` `POST /teachers/me/leave {today, [3c3bef5d]}` ⇒ 200 `cancelled 1, familiesNotified 1`; expiry 08/10 ⇒ **15/10** (T2 +7 ✅) | *"❌ ยกเลิกคาบเรียน: QAChatTwo · Private SURFSKATE 4 HR · 08-10-2026 · 17:00-18:00 · Note : ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ **08-10-2026**"*: the make-up wording ✅, **but see F2** | ✅ wording · 🔴 F2 |
| **D5: series cancel-all "holding a make-up"** | ⚪ not constructible: TASK-704's own door table says series rows are never make-ups (`isMakeup` is a course-row marker; a group seat course's make-ups are placed as private rows, seen in TEST-080) | | ⚪ n/a |

## 🔴 F2: a coach's own same-day leave re-books the replacement INTO THE SLOT JUST CANCELLED
- **Seen:** the coach cancelled today's 17:00 make-up for their own leave. The re-plan placed the replacement `3db96a70` **CONFIRMED on 08/10 at 17:00, the same day, time and coach**, and told the family *"ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ 08-10-2026"*. The family now holds a confirmed class TODAY with a coach who just took the day off. `704-D4-coach-leave.png`
- **Why (read):** the coach's same-day leave records **no leave day** (`GET /teacher-leave-days` for 08/10 ⇒ empty); it only cancels the ticked classes. So the re-plan sees 08/10 17:00 as free again (the cancelled row no longer holds it) and books into it. It bites when the cancelled class is the course's LAST live slot, e.g. a coach sick on a course's final class.
- **Likely pre-existing** (the placement is not TASK-704's work), but REQ-115 makes it worse: the replacement is now **born CONFIRMED and its date is announced** to the family.
- 🔴 **Family-facing.** For the SA: should a same-day coach leave also block that coach's day (as the admin's advance leave does), or should the re-plan skip the slot just cancelled?

## 🟠 Note: a duplicate "CONFIRMED" when the replacement lands in the same slot (D3)
The family gets no cancel (correct, TASK-551) but does get a second identical *"CONFIRMED SCHEDULE 16-11-2026"*. Not false, but noisy; owner's call.

## Footprint
Courses `4706c2ef` (QAChatOne) and `e3d6ad93` (QAChatTwo) kept; one advance leave day (qatt75b, 16/11) recorded and **lifted**. Messages went only to the QA family. The coach notice for qatt75 went to an unlinked coach (skipped).
