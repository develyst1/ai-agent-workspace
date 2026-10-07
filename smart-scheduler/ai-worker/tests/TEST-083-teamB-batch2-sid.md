# TEST-083: Team B's batch on sid (665+667 · 668+669 · 670 · 671 · 672 · 624), the final build · 2026-10-07 14:00–15:10

**Tester:** Tanya (QA) · sid only · headless · list: `HANDOFF-teamB-sid-batch2-2026-10-06.md` "For QA" · Evidence `project-docs/qa-2026-10-07/665-*`, `667-*`, `669-*`, `670-*`, `624-*`
## Verdict: ✅ **6 of 6 PASS.** No defect found.

| item | check | seen | |
|---|---|---|---|
| **672** (API) | `PATCH /group-series/{key}/teacher {to, onDate}` | **400**, detail *"กลุ่มเปลี่ยนครูได้เฉพาะ 'ตั้งแต่วันที่…' เท่านั้น — ไม่มีการสอนแทนคาบเดียว"*; coach **unchanged on BOTH dates** (QA-Group-080F) | ✅ |
| | `{to, fromDate}` | no rate ⇒ `RATE_REQUIRED` (correct, never-paid coach) · with `rateMinor` on QA-Group-080G ⇒ **200 `{moved:1}`**: 22/10 untouched, 29/10 = the new coach. (On 080F it hit `SLOT_TAKEN`: qatt75 busy Thu 10:00, my fixture choice.) | ✅ |
| **667** (API) | student with a **PAUSED** future class ⇒ archive | **409 `STUDENT_HAS_LIVE_SESSIONS`** *"มีคาบเรียนข้างหน้า 1 คาบ — ยกเลิก/ย้ายก่อน"* | ✅ |
| | only a **CANCELLED** future class / only a **SICK_LEAVE** one ⇒ archive | **200** both | ✅ |
| | **parent** whose child has a PAUSED future class ⇒ archive | **409 `PARENT_HAS_SESSIONS`** *"มีคาบเรียนในอนาคต 1 คาบ — ยกเลิก/ย้ายก่อน"* | ✅ |
| | PENDING_RESCHEDULE | ⚪ not exercised: a single's sick leave stays SICK_LEAVE; no simple route produced that status | ⚪ |
| **665** (screen) | People → no-parent list → **เก็บ** | confirm *"เก็บ QA Arch 083 Four? …"* (names the row) ⇒ *"เก็บ … แล้ว"*; the row **leaves**, count **16 → 15** | ✅ `665-1-confirm.png` |
| | **แสดงที่เก็บแล้ว** ⇒ restore | the row listed *"เก็บแล้ว · คืนสถานะ"* ⇒ **คืนสถานะ** ⇒ *"คืนสถานะ … แล้ว"*; back in the live list, count **16** | ✅ `665-2-archived-listed.png` |
| | เก็บ on a row that OWES a class (667 on screen) | the dialog stays with *"มีคาบเรียนข้างหน้า 1 คาบ — ยกเลิก/ย้ายก่อน"*; the row stays | ✅ `667-refused-on-screen.png` |
| **668** (API) | link a child that already has a parent | **409 `STUDENT_ALREADY_HAS_PARENT`** | ✅ |
| **669** (screen) | ผูกผู้ปกครอง → search *0899990811* → the family | confirm *"ผูก QA Link 083 H กับ QA Parent 080 A? · **ครอบครัวนี้มีนักเรียนอยู่แล้ว: QA Link 080 A, QA Link 080 G** · **QA Link 083 H มีคาบที่จะถึง 1 คาบ (คาบถัดไป 23/Oct/26)** — หลังผูกแล้ว ผู้ปกครองจะเริ่มได้รับแจ้งเตือนใน LINE ตั้งแต่ครั้งถัดไป · การผูกนี้ย้อนกลับจากหน้าจอไม่ได้"* ⇒ Link ⇒ *"ผูก … แล้ว"*; the row **leaves**; API parentId = that family | ✅ `669-confirm.png` |
| **670** (screen) | Manage plan of a **completed** course (QA Kid Three, `e3c2d430`) | *"คอร์สนี้**เรียนครบแล้ว** จึงเพิ่มหรือแก้คาบไม่ได้"* (it used to say "cancelled", my TEST-078 note) | ✅ |
| | **expired** (CC, `3580ab36`, read only) | *"คอร์สนี้**หมดอายุแล้ว** จึงเพิ่มหรือแก้คาบไม่ได้"* | ✅ |
| | **ended early** (QA Camp Kid2, `51ff30df`) | *"คอร์สนี้**ถูกยกเลิกแล้ว** จึงเพิ่มหรือแก้คาบไม่ได้"* | ✅ |
| | the calendar legend | *"… ลา/ป่วย · ขยายคาบ · รอย้าย (รอผู้ปกครอง) · **ไม่มาเรียน** · **ยกเลิก** …"* (the NO-SHOW entry I flagged on 10-05 is there) | ✅ `670-*.png` |
| **671** (API) | camp week QA-Camp-083 on Mon 12/10 with qatt75b, who has a class at 13:00 | **409** *"วันที่ 2026-10-12 13:00 **ครู qatt75b** มีคาบแล้ว — ไม่ได้บันทึกอะไร"* (with the space); nothing created | ✅ |
| **624** (screen) | QA-ECA-083 (qatt75b primary + qatt75 extra): **a Swap beside EVERY teacher** | 2 Swap buttons | ✅ `624-1-series.png` |
| | the extra's swap | title *"สลับครู — qatt75"* (names who goes out) · *"ครูคนใหม่"* · both scopes asked (ECA) | ✅ |
| | "from here on" to a never-paid coach (QACT) | the optional rate field *"ค่าสอนของ QACT สำหรับตารางนี้ (ต่อคาบ)"* · blank ⇒ *"…ครูที่มาสอนแทนยังไม่มีค่าสอนในตารางนี้ — กรุณาระบุค่าสอนของครูที่สอนแทน"* · 300 ⇒ **"qatt75 → QACT ใน 2 คาบ"** · API: **primary qatt75b KEPT**, extra = QACT at 30000, both dates | ✅ `624-2-swap-dialog.png` |
| | (a first try with coach Bank was refused *"ครู Bank ไม่ได้สอนวันศุกร์"*: a real availability rule, not a defect; nothing changed) | | |

## Footprint
- Cancelled after use: QA-Group-080F, QA-Group-080G, QA-ECA-083.
- Kept (QA): students QA Arch 083 One (paused class), Two/Three (archived), Four (restored); QA Link 083 H ⇒ linked to QA Parent 080 A; a paused class on QA Link 080 A (`d0f91d49`).
- No real family or real coach changed. The only real records touched were **read**: CC's plan and the ABC ECA swap dialog earlier.
