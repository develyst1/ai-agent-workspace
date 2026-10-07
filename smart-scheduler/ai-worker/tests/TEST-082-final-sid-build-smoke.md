# TEST-082: the final sid build before uat (owner redeploy 10-07, commit `de61a7d`): 699 wording · smoke · LINE address line · 2026-10-07 13:20–13:45

**Tester:** Tanya (QA) · sid only · headless + the QA phone (parent 0899990763, TH) · Evidence `project-docs/qa-2026-10-07/699-4-*.png`, `SMOKE-*.png`, `ADDR-*.png`

## 1. TASK-699 wording: ✅ the APPROVED sentence (the drafted one, per `COPY-REVIEW-2026-09-29.md:523–526`)
Admin edit of P4 `2c28b534` 16/11 → 23/11. The phone, read from the accessibility tree (not the wrapped bubble):
`แจ้งเปลี่ยนวันหมดอายุคอร์สค่ะ: คอร์ส Private SURFSKATE 4 HR ของ QAChatOne ใช้ได้ถึงวันที่ 23-11-2026 (จากเดิม 16-11-2026) หากมีข้อสงสัย กรุณาติดต่อแอดมินค่ะ`
This matches the approved template **character for character**: «ค่ะ» twice, «จากเดิม», the space before «กรุณา». My earlier "🔴 draft" (TEST-081) was against Porter's mis-recorded version, now corrected in COPY-REVIEW. **Closed.**

## 2. Smoke on this build: the REQ-112 headline numbers ✅ 3/3
| check | fixture | seen | |
|---|---|---|---|
| her **"15"**: 10-session, two classes cancelled «ปัญหาจากทางเรา», **one of them ON SCREEN with the box ticked** | C10s `1f806d65` (qakid3, Mon 17:00 from 05/10, base 28/12) | screen cancel of 26/10 ⇒ **04/01**; API cancel of 02/11 ⇒ **11/01/2027** | ✅ `SMOKE-box-ticked.png` |
| her **"6"**: not-started 4-session, one declared absence | C4n-s `dada3a9d` (campkid2, Wed 11:00 from 14/10) | `plannedAtCreation:true` ⇒ **11/11 → 18/11** | ✅ |
| a 4-session's **2nd** ordinary leave REFUSED | C4-s `d4bc7304` (campkid2, Mon 12:00 from 05/10) | 1st 200 · 2nd **409 `LEAVE_NO_VALIDITY`** *"อายุคอร์สไม่พอสำหรับคาบชดเชย — ขยายวันหมดอายุก่อน แล้วค่อยบันทึกลา"* · session 3 still CONFIRMED · expiry **02/11** | ✅ |
(My first try at the 4-session hit `SLOT_TAKEN`, my own C10s on the same coach-slot; re-run at 12:00.)

## 3. LINE registration, the address line for a family with an address ON FILE ✅
QA parent (province on file **กรุงเทพมหานคร**). Chat `add` → name `QAAddr` → birthdate `01-01-2019` → the summary (no address questions, as designed):
*"ที่อยู่ / Address: **กรุงเทพมหานคร (ที่อยู่เดิมของครอบครัว) / (the address we have on file)**"*. **The brackets appear ONCE**; no "((…))". `ADDR-4-summary.png`
- The province renders as stored, "กรุงเทพมหานคร". Porter's example said "กทม"; that is only the stored value, not a defect.
- Left with `cancel` ⇒ *"ยกเลิกแล้วค่ะ ข้อมูลที่กรอกไว้ถูกลบทิ้งแล้ว ยังไม่ได้บันทึกอะไรลงระบบนะคะ / Cancelled… nothing was saved."*; API: no student "QAAddr". `ADDR-5-cancel.png`
- **District / sub-district prompts (no «ค่ะ») vs province (with «ค่ะ»):** confirmed **in code only** (`line-i18n.ts` `add_addr_*_prompt`). Those screens appear only for a family WITHOUT an address, and the QA family has one. Not seen on the phone; per Porter, the asymmetry is deliberate.

## 📌 My slips, declared
- **I tapped «คุยกับแอดมิน» on the rich menu by accident** (opening the keyboard). It **sent sid's admins one "parent wants an admin" notice** for the QA parent and muted the bot (60 min). Reopened at once with `reopen`. Nothing else was affected.
- To free a place in the QA family (it was full at 5 children, partly my own test kids), I **archived QA Link 080 E** (`b26acd26`). Reversible, a QA child; left archived so the QA family keeps one free place.
