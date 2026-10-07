# TEST-081: `TASK-673` (group swap screen) + `TASK-696` (create a family and link in one go), sid, front-only redeploy · 2026-10-07

**Tester:** Tanya (QA) · sid only · **headless** · Evidence: `project-docs/qa-2026-10-07/673-*.png`, `696-*.png`

## TASK-673: the Swap dialog (read only: opened, read, closed with ยกเลิก; no swap saved)
Path: Calendar → Series in range → the series → **สลับ**.
| series | seen | |
|---|---|---|
| **GROUP**: QA-Group-080D (`a2b2e3be-b08d-4cc9-9a39-79de999f8e50`, built for this, 1 date; cancelled afterwards) | *"สลับครู — qatt75b · ครูคนใหม่ · ค่าสอนของ สำหรับตารางนี้ (ต่อคาบ) · … · **ตั้งแต่วันที่** 7 ต.ค. 2026 · ยกเลิก · บันทึก"*: **0 radios, no scope question**; the date reads **"ตั้งแต่วันที่" (From date)** | ✅ `673-GROUP.png` |
| **ECA**: "ABC / Balance Camp" (existing; read only) | *"ใช้กับคาบไหน? · เลือกอย่างใดอย่างหนึ่ง ระบบไม่เดาให้ · **เฉพาะคาบนี้** · **คาบนี้และคาบถัดไปทั้งหมด** · ตั้งแต่วันที่"*: **both scopes still asked** | ✅ `673-ECA.png` |
🟠 Small read: before a coach is chosen, the group dialog's rate label is *"ค่าสอนของ สำหรับตารางนี้"*, with the coach's name blank (it fills once picked, presumably). Cosmetic.

## TASK-696: create a family and link, from People → no-parent list → ผูกผู้ปกครอง → เพิ่มผู้ปกครอง
Fixtures: three parentless QA children made by voucher import (no phone): **QA Link 080 A** `42b49a40` · **B** `a95c3525` · **C** `ce882d61` (vouchers `fda874d5`, `db9b6fd3`, `44bf3f1a`).
| case | seen | |
|---|---|---|
| **A**: a NEW phone `0899990811` | Form *เพิ่มผู้ปกครอง (ชื่อผู้ปกครอง · เบอร์โทร * · จังหวัด · หมายเหตุ)* → บันทึก ⇒ notice **"บันทึกผู้ปกครองแล้ว · QA Parent 080 A"** ⇒ straight to the confirm **"ผูก QA Link 080 A กับ QA Parent 080 A? · ครอบครัวนี้ยังไม่มีนักเรียน · QA Link 080 A ยังไม่มีคาบที่จะถึง · การผูกนี้ย้อนกลับจากหน้าจอไม่ได้"** (the confirm is NOT skipped) → ผูกผู้ปกครอง ⇒ **"ผูก QA Link 080 A กับ QA Parent 080 A แล้ว"**. API: the child's `parentId` = the new family `cd00a5ed` (the only family with that phone). | ✅ `696-A-*.png` |
| **B**: a phone that ALREADY has a family (`0899990763`, the QA parent) | บันทึก ⇒ **"เกิดข้อผิดพลาด · เบอร์นี้มีผู้ปกครองในระบบแล้ว"**; the form stays open. API: the child **still has no parent**; **still ONE family** with that phone. **Nothing linked, nothing created.** | ✅ `696-B-1-after-create.png` |
| **C**: create OK, then the LINK refused (forced: after the create, I linked the child to the QA family by API, then pressed ผูกผู้ปกครอง) | Create ⇒ **"บันทึกผู้ปกครองแล้ว · QA Parent 080 C"** ⇒ the confirm for that new family. After Link the dialog **stays on the confirm for THAT family** (title *"ผูก QA Link 080 C กับ QA Parent 080 C?"*) and shows the server's sentence **"นักเรียนคนนี้ผูกกับผู้ปกครองแล้ว — รีเฟรชหน้าเพื่อดูข้อมูลล่าสุด"**; no bare "failed". The new family **stays** (`0676e680`, not deleted). | ✅ `696-C-*.png` |
🟠 **Read for Porter (wording judgement, not a fault):** in case C the create's "บันทึกผู้ปกครองแล้ว" toast has faded by the time the link refusal shows. At that moment, what tells the admin that the CREATE happened is the confirm title (*"…กับ QA Parent 080 C?"*, a family that now exists). It is clear if you know the flow; whether an admin reads "this family was created" from it is your/owner's call (TASK-696 §5 says a new sentence would need the owner).

## Footprint
- QA Link 080 A ⇒ linked to the new QA family `cd00a5ed` (0899990811).
- QA Link 080 B ⇒ still parentless.
- **QA Link 080 C ⇒ linked to the QA parent `a3fb456e` (0899990763) by MY forced API call (irreversible from a screen; QA only).** Family `0676e680` (0899990812) left as designed.
- QA-Group-080D cancelled (cleanup).

## Follow-ups after the FE+BE deploy (TASK-697 · 698 · 699) · 2026-10-07 04:00–04:31 · headless + QA phone
### TASK-697: the group swap's rate label waits for the coach ✅
QA-Group-080E (`a8929b23-986f-4f33-9381-1716028621a5`, 1 date; cancelled afterwards). **สลับ**:
- **Before a coach is picked:** *"สลับครู — qatt75b · ครูคนใหม่ · ตั้งแต่วันที่ · ยกเลิก · บันทึก"*: **no rate label at all** (the dangling *"ค่าสอนของ สำหรับตารางนี้"* is gone).
- **After picking one:** *"ค่าสอนของ **Bank** สำหรับตารางนี้ (ต่อคาบ)"*.
- 0 radios; closed unsaved. `697-GROUP.png`

### TASK-698: the "created but not linked" refusal names both halves ✅
Forced exactly as in case C (create, then link the child elsewhere by API, then press Link).
- **TH** (QA Link 080 D, phone 0899990813): *"**สร้างครอบครัวเบอร์ 0899990813 แล้ว แต่ยังผูก QA Link 080 D ไม่สำเร็จ**"* + the server's *"นักเรียนคนนี้ผูกกับผู้ปกครองแล้ว — รีเฟรชหน้าเพื่อดูข้อมูลล่าสุด"*. The dialog stays on that family's confirm.
- **EN** (QA Link 080 G, phone 0899990816, whole flow run in EN): *"**The family with phone 0899990816 was created, but QA Link 080 G is not linked yet.**"* + the server's reason.
- The real phone and the real child name appear in both.
- 🟠 On the EN screen the server's reason stays **Thai** (*"นักเรียนคนนี้ผูกกับผู้ปกครองแล้ว…"*): back-end sentences are TH-only, probably pre-existing.
- 📌 **Two runs of mine did not test 698, declared:**
  - (E) my click on the language switch was blocked by the open dialog's overlay AFTER the forced link: QA Link 080 E got linked to the QA family and family 0899990814 was created, but the EN screen was never seen.
  - (F) my forcing call was refused **400**, because the QA family `a3fb456e` was full: **5 children** (QAChatOne, QAChatTwo, QA Link 080 C/D/E), so the link simply succeeded (F ⇒ its new family 0899990815). G re-did it against family A (room).

### TASK-699: the family is told when an ADMIN changes a course's expiry. Behaviour ✅ · 🔴 WORDING is the DRAFT, not the approved sentence
P4 `2c28b534` (QAChatOne, parent 0899990763 = the QA phone, TH):
| act | expiry | the phone | |
|---|---|---|---|
| admin edit LATER (`PATCH /courses/:id/expiry`) | 02/11 → 16/11 | ONE message: *"แจ้งเปลี่ยนวันหมดอายุคอร์สค่ะ: คอร์ส Private SURFSKATE 4 HR ของ QAChatOne ใช้ได้ถึงวันที่ 16-11-2026 (จากเดิม 02-11-2026) หากมีข้อสงสัยกรุณาติดต่อแอดมินค่ะ"* | ✅ behaviour |
| admin edit EARLIER | 16/11 → 09/11 | ONE message, the same sentence: *"…ใช้ได้ถึงวันที่ 09-11-2026 (จากเดิม 16-11-2026)…"*; reads correctly backwards | ✅ |
| automatic +1 week: session 19/10 cancelled «ปัญหาจากทางเรา» | 09/11 → 16/11 | ONLY the cancel notice *"❌ ยกเลิกคาบเรียน: … Note : ระบบเพิ่มคาบชดเชยให้แล้ว"*; **no expiry message** | ✅ no double-tell |
| **PAUSED** (`e0bdba00`, QAChatOne, `drop` ⇒ DROPPED) then admin edit | 03/12 → 10/12 | the notice: *"…Private SURFSKATE 6 HR ของ QAChatOne ใช้ได้ถึงวันที่ 10-12-2026 (จากเดิม 03-12-2026)…"* | ✅ |
| **ENDED** (`a8b4e457`, QAChatTwo, course cancelled) then admin edit | save **200** (accepted) | **nothing** on the phone | ✅ no notice · 🟠 the edit itself is still allowed on an ended course |
`699-1-later.png`, `699-2-earlier-and-auto.png`, `699-3-paused-ended.png`
🔴 **Wording:** what reaches the family is the **draft** in `line-i18n.ts:612` (commit `b700f5b`), **not** the owner-approved TH in `COPY-REVIEW-2026-09-29.md:516`:
- approved *"วันหมดอายุคอร์สเปลี่ยนแล้ว — คอร์ส {program} ของ {student} ใช้ได้ถึง {to} (เดิม {from}) หากมีข้อสงสัยกรุณาติดต่อแอดมิน"*
- on sid *"แจ้งเปลี่ยนวันหมดอายุคอร์สค่ะ: … ใช้ได้ถึงวันที่ {to} (จากเดิม {from}) หากมีข้อสงสัย กรุณาติดต่อแอดมินค่ะ"*

Sober already flagged this mismatch (`TASK-699` :67, `inbox/SA.md`). **I confirm it on the phone; it must not reach uat as-is.** Also seen: `{program}` renders as "Private SURFSKATE 4 HR" (the package size included). EN not seen (the QA parent is TH).
