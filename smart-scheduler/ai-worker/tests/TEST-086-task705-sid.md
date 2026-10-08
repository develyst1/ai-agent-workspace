# TEST-086: TASK-705 re-run on sid (back `6f7a40f` / front `f60d7e7`): a class cancelled because the COACH IS OFF never gets its replacement on that coach's day off · 2026-10-08 00:40–00:57

**Tester:** Tanya (QA) · sid · API + the QA phone (QAChatOne / QAChatTwo's family) · Evidence `project-docs/qa-2026-10-08/705-*.png`
## Verdict: ✅ **TASK-705 PASSES on every door asked.** 🔴 One NEW finding, F3 (likely pre-existing, NOT 705's doors): a group date that is PENDING tells the seat's family nothing when cancelled.

| # | check | seen | |
|---|---|---|---|
| **1. D4** (+ build identity) | the F2 fixture again: course `e3d6ad93` (QAChatTwo, qatt75), last live = make-up `3db96a70` **today 08/10 17:00**; `qa-coach-qatt75` own same-day leave | 200 `cancelled 1, familiesNotified 1` · replacement `2b2d479c` **15/10 17:00, NEXT week, not today** · expiry 15/10 → 22/10 (T2) · phone: *"❌ ยกเลิกคาบเรียน: QAChatTwo · 08-10-2026 · 17:00-18:00 · Note : ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ **15-10-2026**"* | ✅ **F2 FIXED** |
| **2. D3 unchanged** (other reason ⇒ the same slot, silent) | fresh course `08cbf29c` (QAChatTwo, Wed 12:00 from 14/10): leave 21/10 ⇒ make-up 11/11 CONFIRMED ⇒ admin cancel **«แอดมินคีย์ผิด»** | re-booked **11/11 12:00, the SAME slot**; **no cancel notice** (TASK-551); 🟠 the parked duplicate *"CONFIRMED 11-11"* | ✅ |
| | (also seen on `4706c2ef`: «แอดมินคีย์ผิด» on a 23/11 make-up re-booked it on **16/11**, an earlier gap one week after the last live class; a different slot ⇒ the family told *"…ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ 16-11-2026"*. Consistent with 551.) | | |
| **admin cancel «ครูลา»** (705 door 3) | `4706c2ef`: cancel the 16/11 make-up `04436e69` with `TEACHER_LEAVE` | replacement **23/11, not 16/11**; phone *"❌ … 16-11-2026 … ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ 23-11-2026"* | ✅ |
| **3. regression D1 (Undo)** | `08cbf29c`: Undo the 21/10 leave | its make-up cancelled; phone *"❌ ยกเลิกคาบเรียน: QAChatTwo … 11-11-2026 12:00-13:00"*: make-up wording, no false note | ✅ |
| **regression D2 (trim, non-Undo)** | leave 21/10 again ⇒ make-up `f7d7d378` 11/11 ⇒ plan **insert** 05/11 ⇒ `cancelled:[f7d7d378]`, `appended:[]` | phone *"❌ ยกเลิกคาบเรียน … 11-11-2026"*: make-up wording, no false note, no new-class line | ✅ |
| **regression D3/D4** | as rows 1–2 | | ✅ |
| **4. ⭐ ONE GROUP date cancelled «ครูลา»** (pinned by source only before this run) | QA-Group-086 (`9aa51731`, qatt75b, Thu 15:00); 6-class seat course `3a54aa23` (QAChatOne) on all 6 dates. Admin cancels the group row of **19/11** (the seat course's LAST live class) with `TEACHER_LEAVE` | the seat cancelled · replacement **26/11, NOT 19/11** (the coach's day off skipped) · CONFIRMED + marked | ✅ **the door works by value** |
| | the same on the CONFIRMED group date **05/11** | replacement **03/12** (not 05/11) · phone: *"❌ ยกเลิกคาบเรียน: Date : 05-11-2026 · Time : 15:00-16:00 · เหตุผล : ครูลา · Note : ระบบเพิ่มคาบชดเชยให้แล้ว"* (ordinary wording, correct: the seat was not a make-up) + *"CONFIRMED 03-12-2026"* | ✅ |

## 🔴 F3 (new, likely pre-existing): cancelling a PENDING group date tells the seat's family NOTHING about the cancel
- **Seen:** selling the 6-class course into a 4-date group **auto-added 12/11 and 19/11 to the series as PENDING group rows**, while the seats on them were CONFIRMED and the family had the course's *"CONFIRMED SCHEDULE … Thursday 15:00 · Start 15-10 · Expiry 03-12"*.
- Cancelling the 19/11 group row (with «ครูลา») sent the family **only** *"CONFIRMED SCHEDULE 26-11-2026"*, the replacement. **No "❌ … 19-11-2026"**. The same act on the CONFIRMED 05/11 group row DID send the cancel. `705-GROUP-teacher-leave.png` vs `705-GROUP-confirmed-date.png`
- **Effect:** the family can turn up on 19/11.
- **Why (my reading):** the family notice follows the GROUP row's status ("a CONFIRMED row only"), not the seat's. This is not TASK-705's work (its placement did right); probably as old as group seats.
- **For the SA:** should the cancel tell the families of CONFIRMED seats even when the group row itself is PENDING? Or should the dates a sale adds be confirmed with it?

## Footprint
QA only: `4706c2ef`, `e3d6ad93`, `08cbf29c` (QAChatOne/Two), QA-Group-086 + seat course `3a54aa23` kept. No leave day left recorded. Messages went to the QA family only.
