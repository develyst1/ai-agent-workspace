# TEST-088: TASK-706 on sid (back `a2185b2` / front `f60d7e7`): cancelling a GROUP date tells the families of its CONFIRMED seats, even when the group row is PENDING · 2026-10-08 01:05–01:17

**Tester:** Tanya (QA) · sid · API + the QA phone (QAChatOne / QAChatTwo's family) · Evidence `project-docs/qa-2026-10-08/706-*.png`
## Verdict: ✅ **PASS, every check asked. F3 FIXED.** One 🟠 read (by design per TASK-702, flagged for the owner's eye).

| check | fixture / act | the family's phone | |
|---|---|---|---|
| **Build identity + the fix**: a sale-added **PENDING** group date with a **CONFIRMED** seat ⇒ the seat's family gets the cancel | QA-Group-086 (`9aa51731`): the 12/11 row is **PENDING** (added by the sale), seat QAChatOne **CONFIRMED**; admin cancel «ครูลา» | **"❌ ยกเลิกคาบเรียน: Date : 12-11-2026 · Time : 15:00-16:00 · เหตุผล : ครูลา · Note : ระบบเพิ่มคาบชดเชยให้แล้ว"** + the replacement's *"CONFIRMED 10-12-2026"*. On `6f7a40f` the same act was silent (TEST-086 F3) | ✅ **F3 FIXED** |
| **A PENDING seat's family is NOT told** | QA-Group-088J (`a0444941`, Thu 14:00): a 6-class course for QAChatTwo sold in and **not confirmed** ⇒ every seat PENDING, 4 dates added PENDING. Cancel the 19/11 row («ครูลา») | **no "❌ … 19-11-2026"** for QAChatTwo | ✅ |
| **A CONFIRMED group date behaves as before** | 086's 29/10 row **CONFIRMED**, seat CONFIRMED; «ครูลา» | **"❌ ยกเลิกคาบเรียน: Date : 29-10-2026 · เหตุผล : ครูลา · …"** (as in TEST-086) | ✅ |
| **Regression: 705 D4** (a coach's same-day leave on the last live class) | fresh back-dated course `f584f1df` (QAChatTwo, qatt75, Thu 18:00 from 10/09): leave 01/10 ⇒ make-up **today 08/10 18:00**; `qa-coach-qatt75` own leave | replacement **15/10 18:00 (next week)**; *"❌ ยกเลิกคาบเรียน: … 08-10-2026 18:00-19:00 · Note : ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ 15-10-2026"* | ✅ |
| **Regression: 704 D1** (Undo of a leave over a CONFIRMED make-up) | fresh course `23a4ff46` (QAChatOne, Wed 16:00 from 14/10): leave 21/10 ⇒ make-up 11/11 CONFIRMED ⇒ **Undo** | *"❌ ยกเลิกคาบเรียน: QAChatOne · Private SURFSKATE 4 HR · 11-11-2026 · 16:00-17:00"*: make-up wording, no false note | ✅ |
| (two D1 attempts were rightly REFUSED, not faults: Undo on a closed past day ⇒ `409 UNDO_DAY_SETTLED`; a leave on a course with no room ⇒ `409 LEAVE_NO_VALIDITY`) | | | |

## 🟠 Read for the owner (by design, not a fault)
In the PENDING-seat case, the seat's replacement was **born CONFIRMED**, and the family received *"📅CONFIRMED SCHEDULE: QAChatTwo · 26-11-2026 · 14:00-15:00"* for a course **they never confirmed** (every other class of it is PENDING). TASK-702 §4 specifies this ("born CONFIRMED … in a PENDING course AND a confirmed one"). It may surprise a family whose course is still awaiting confirmation; it's the owner's call whether that is wanted.

## Footprint
QA only: QA-Group-086, QA-Group-088J (+ unconfirmed course `ba34b077`), courses `f584f1df`, `23a4ff46`. Messages went to the QA family only.
