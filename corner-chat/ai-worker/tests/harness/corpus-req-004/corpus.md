# Corpus for REQ-004 AC-6 / AC-10 — 30 made-up Thai messages
- Owner of this file: Tanya (QA, Team A) · used by TEST-003 #18, #19, #26, #27
- Status: **DRAFT — labels `[QA-proposed 2026-11-01]`, NOT confirmed.** The PM confirms or changes each label before
  the first run (TEST-003 Q2). AC-6 is never run on unconfirmed labels.
- Every message is invented. Names, groups, companies, numbers and order ids are fictional. Never add real traffic here.

## The test user (fixed for every run)
- Name: **สมชาย ใจดี** · name list for untagged matching: `สมชาย`, `ชาย` · works in an IT team
- Groups the corner-chat OA is in: `ทีมโปรเจกต์ A` (work) · `เพื่อนมัธยม` (friends) · `หมู่บ้านสุขใจ` (neighbours)
- Mail: own test mailbox; colleagues `@acme.example.test`
- **Fixed rules: none** (the corpus measures the AI layers, not the rules)
- **Sentences:** "แจ้งเรื่องที่ต้องตอบ ต้องทำ หรือต้องตัดสินใจ ทั้งเรื่องงานและเรื่องส่วนตัวที่ถามเราตรงๆ
  ไม่เอาโฆษณา ไม่เอาข่าวทั่วไป ไม่เอาคุยเล่น"

Every message below is one that **would be taken in** (mail, or a LINE message that tags him, replies to him, @All, or
contains a name on his list) — the corpus tests the filter, not intake.

## Messages
`N` = must notify · `H` = must hold. "via" = how it was taken in.

| id | channel · where / from | via | text | label | why (one line) |
|---|---|---|---|---|---|
| N01 | LINE · ทีมโปรเจกต์ A | tag | @สมชาย พรุ่งนี้ประชุมลูกค้า 10 โมง ช่วยยืนยันหน่อยว่าเข้าได้ไหม | N | direct question, work |
| N02 | LINE · ทีมโปรเจกต์ A | reply to him | ไฟล์ที่พี่ส่งมาเปิดไม่ได้ครับ ส่งใหม่ได้ไหม | N | asks him to act |
| N03 | LINE · ทีมโปรเจกต์ A | name | ชายๆ งานสรุปยอดเดือนนี้ต้องส่งก่อนบ่ายสามนะ | N | untagged nickname, deadline for him |
| N04 | LINE · ทีมโปรเจกต์ A | @All | @All ระบบ production ล่ม ทุกคนเข้าห้องประชุมออนไลน์ด่วน | N | urgent action for everyone incl. him |
| N05 | Mail · To · boss@acme.example.test | to me | เรื่อง: อนุมัติงบไตรมาส 4 — รบกวนตรวจตัวเลขในไฟล์แนบและตอบกลับภายในวันศุกร์ | N | task with a deadline |
| N06 | Mail · To · ลูกค้า | to me | เรื่อง: สอบถามสถานะใบสั่งซื้อ PO-2291 — ยังไม่ได้รับของค่ะ รบกวนตรวจสอบให้ด้วย | N | customer waiting on him |
| N07 | Mail · **Cc** · pm@acme.example.test | Cc | เรื่อง: แผนส่งมอบ — คุณสมชาย (cc) ช่วยยืนยันวันส่งมอบระบบด้วยครับ | N | Cc but asks him by name |
| N08 | LINE · เพื่อนมัธยม | tag | @สมชาย ที่ยืมไป 2,000 จะคืนวันไหนเหรอ | N | personal, asked directly |
| N09 | Mail · To · hr@acme.example.test | to me | เรื่อง: สัญญาจ้างฉบับใหม่ — กรุณาเซ็นในระบบภายในวันที่ 15 พ.ย. | N | action with a date |
| N10 | LINE · ทีมโปรเจกต์ A | tag | @สมชาย ด่วน โทรกลับด้วย | N | short but urgent |
| N11 | LINE · ทีมโปรเจกต์ A | tag | @สมชาย deploy ตัวใหม่ fail ที่ step migrate ช่วยดู log หน่อย | N | Thai-English mix, work task |
| N12 | Mail · To · recruiter@example.test | to me | เรื่อง: ขอเลื่อนนัดสัมภาษณ์ — จากวันอังคารเป็นวันพุธ สะดวกไหมคะ | N | needs his answer |
| N13 | LINE · เพื่อนมัธยม | name | ชายว่างเสาร์นี้ไหม จะได้จองร้าน ตอบด้วย | N | untagged nickname, personal question |
| N14 | LINE · ทีมโปรเจกต์ A | reply to him | ตกลงตามที่เสนอครับ แต่ขอแก้ข้อ 3 เป็นจ่ายสองงวดได้ไหม | N | decision needed |
| H01 | Mail · To · deals@shop.example.test | to me | เรื่อง: โปรโมชั่นพิเศษ ลด 70% เฉพาะวันนี้ — สมัครเลย | H | ad, even though sent "to me" |
| H02 | Mail · To (list) · news@techweekly.example.test | to me | เรื่อง: สรุปข่าวเทคโนโลยีประจำสัปดาห์ | H | general news |
| H03 | LINE · เพื่อนมัธยม | @All | @All สวัสดีวันจันทร์ 🌞 | H | greeting |
| H04 | LINE · ทีมโปรเจกต์ A | @All | @All ใครสนใจสั่งชานมไข่มุกบ้าง | H | chit-chat |
| H05 | LINE · เพื่อนมัธยม | name | เมื่อวานไปเที่ยวชายหาดมา สวยมาก | H | **false name match** — "ชาย" inside "ชายหาด" |
| H06 | Mail · **Cc** · admin@acme.example.test | Cc | เรื่อง: แจ้งเพื่อทราบ ตารางเวรเดือนธันวาคม (ไม่ต้องตอบกลับ) | H | FYI, says no reply needed |
| H07 | Mail · To · security@bank-verify.example.test | to me | เรื่อง: บัญชีของคุณจะถูกระงับ — คลิกลิงก์เพื่อยืนยันตัวตน | H | phishing-style spam |
| H08 | LINE · เพื่อนมัธยม | tag | @สมชาย 555555 ฮามาก | H | tagged, no content |
| H09 | LINE · ทีมโปรเจกต์ A | reply to him | 👍 | H | reply, emoji only |
| H10 | LINE · หมู่บ้านสุขใจ | @All | @All ขายบ้านมือสอง ราคาถูก สนใจทักแชท | H | ad |
| H11 | Mail · To · billing@stream.example.test | to me | เรื่อง: ใบเสร็จการชำระเงินเดือนพฤศจิกายน | H | receipt, no action |
| H12 | LINE · ทีมโปรเจกต์ A | @All | @All แชร์บทความ: 10 เทคนิคเขียนโค้ดให้สะอาด | H | general article |
| H13 | Mail · To (list) · all-staff@acme.example.test | to me | เรื่อง: ขอแสดงความยินดีกับทีมขายที่ทำยอดทะลุเป้า | H | company news |
| H14 | LINE · เพื่อนมัธยม | tag | @สมชาย ส่งต่อให้ 10 คน แล้วจะโชคดี | H | chain message |
| H15 | Mail · To · loan@fastcash.example.test | to me | เรื่อง: สินเชื่อดอกเบี้ยต่ำ อนุมัติไว ไม่ต้องใช้คนค้ำ | H | ad |
| H16 | LINE · ทีมโปรเจกต์ A | reply to him | ขอบคุณครับ | H | thanks, no action |

14 must-notify · 16 must-hold.

## How a run is scored (TEST-003 #18, #19)
1. Run all 30 through the real pipeline (layer 1 → layer 2) **3 times**, same models, same prompt version. Record per
   message per run: layer-1 summary and "addressed?", layer-2 %, reason, models, prompt version.
2. For a bar B: a message is *notified* in a run when % ≥ B.
   - **wrong hold** = an `N` message not notified in any one run (counted per message, worst run) — line: **0**
   - **wrong pass** = an `H` message notified in a run (counted per message, worst run) — line: **≤ 2**
   - **flip** = an `N` message notified in some runs and not in others — line: **0**
3. Compute 2. for every B from 0 to 100 from the recorded %s (no re-run per bar). The default bar is the **highest** B
   that meets all three lines. **No B meets them → `TEST_FAILED`**; the pass line is never moved after the run.
4. Re-run 1.–3. on every change of model, prompt or bar (REQ-004 req. 9).
