# TROLLEY-CARDS-PENDING — cards waiting to go onto the human team's Trolley board

**Rule (owner, 2026-11-08, verbatim):** *"เรื่องเป็นแนวนี้ต้องทำขึ้น trolley เพื่อเอาไปคุยกับพี่เบสและแนท"* + *"แก้แค่ข้อความ หรือ UI นิดหน่อย ทำให้ฟรี ทีเหลือ หากเป็นการแก้หลักการ ให้เก็บไปคุย"*
- Wording / small UI → free, the AI desk builds it, no card.
- A principle change (new feature, changed rule, extra beyond the agreed spec) → **one card per item** on Trolley, for the owner + พี่เบส + แนท to decide.
Trolley access for the desk: ON HOLD (host 127.0.0.1 — waiting for แนท). Until then the owner or พี่เบส pastes these by hand.

## Where and how (proposal)
- **Board:** `SOM System Dev`
- **Column flow:** `NEW REQUIREMENT` (to discuss) → decided yes ⇒ `BACKLOG` (AI desk cuts the TASK) → `IN PROGRESS` → `IN REVIEW (UAT)` → `READY FOR PROD` → `DONE`. Decided no ⇒ close the card with the reason in a comment.
- **Label:** `รอคุย` (to discuss) + the block (`ก้อน 1 เงินเดือน` / `ก้อน 2 รายได้` / `ก้อน 3 สต็อก`).
- **Card shape:** title = what the customer asked, in plain words · description = her words, why it's a principle change, size (days / baht at 263 ฿/day), the options · checklist = ☐ ทำหรือไม่ทำ ☐ ฟรีหรือคิดเงิน ☐ ตอบขวัญ.
- **Due:** before the Salary demo (≈ 20–23 Nov 2569).

## The 7 cards for REQ-5010 (พี่ฟีน's back-office feedback, 8 Nov)
1. **แก้เรทค่าจ้างเองได้ (ปุ่ม Edit หน้า Payment setting)** · ก้อน 1 · 1.5 วัน ≈ 395 บาท — ตอนนี้เรท Extra Hour 350 / สูตร OT / ค่าเดินทาง เป็นกฎตายตัวตามที่ตกลง; ขอให้แก้เองได้
2. **หน้า Conversion: Total + ตัวกรองช่วงเวลา + ตัวกรองครู** · ก้อน 1 · 1 วัน ≈ 263 บาท
3. **Export หน้า Conversion (Excel + PDF)** · ก้อน 1 · 1 วัน ≈ 263 บาท
4. **Export หน้า Revenue Summary** · ก้อน 2 · 0.5–1 วัน ≈ 130–263 บาท
5. **ย้ายสาขาทั้งคอร์ส** · ก้อน 2 · 0.5 วัน ≈ 130 บาท — ที่ตกลงคือเลือกสาขาตอนจอง
6. **หน้า Stock report: ตัวกรอง Type / Product + ช่องค้นหา** · ก้อน 3 · 0.5–1 วัน ≈ 130–263 บาท
7. **เพิ่มหน้า Report Revenue + Report Conversion** · ไม่อยู่ในรายงาน 6 หัวข้อที่ตกลง · ขนาดยังไม่ประเมิน (ซ้อนกับการ์ด 2–4) — ต้องถามขวัญก่อนว่าต้องการไหม
- (Later, no card yet) branch-to-branch stock move ≈ 1–2 d, only when a 2nd branch opens.
- Questions back to ขวัญ go out after the team's talk, in one message: (a) Park rent "custom": time or charge? · (b) card 7: does she want Report Revenue / Report Conversion? · (c) card 4: Revenue Summary export as Excel only (0.5 d, default) or Excel + PDF (1 d)? — (c) is already on card 4's board description ("Excel อย่างเดียวหรือ + PDF").
- Fine print (Tanya TEST-147, from the SAs' CHECK): card 1's fixed rules also include Bonus 50 / 100 · card 3's 1 d assumes the Payment Detail export already exists · card 5's 0.5 d only if F1's plan size doesn't already cover it · card 4: if the agreed Detail export isn't inside the Revenue sizing, ≈ 1 d more.

## Done on the board — 2026-11-08 (Porter, through the owner's Discord sign-in in Porter's browser)
- **SOM System Dev → NEW REQUIREMENT:** the 7 REQ-5010 cards created (card ids 12–18), each with a 4-line description: ที่มา (her words) · ที่ตกลงไว้ · ที่ขอ + size · ต้องตัดสิน. Read back from the page: all 7 titles present, none marked complete (card 12 was mis-ticked complete once and reverted).
- **SOM System Timeline:** the owner's 5 test cards ("งานก้อนที่ 1 get req / dev / uat training / deploy / issuelog") **archived** (not deleted — recoverable from the board's archive), on his word: *"อันนี้ของฉัน ลบออกได้เลย"*. The board is now empty.
- Not yet set: labels ("รอคุย" + block) and due dates — the board has no such labels yet; left for the owner/พี่เบส.
- **Meeting card (owner asked 11-08):** board `ทีมงานหมอลำ` → `DONG (PM)`: "นัดคุยกับพี่เบส + แนท: ตัดสิน 7 เรื่องที่พี่ฟีนขอเพิ่ม (หลังบ้าน)" (card 19) — description = agenda, the free/park rule, the outcome per card (→ BACKLOG / WON'T DO + free or charged, total ≈ 5.5–6.5 d ≈ 1,450–1,700 ฿), the questions back to ขวัญ, after-meeting step. Members: Dong D1 · Remy (= แนท) · Salamander (= พี่เบส) — owner 11-08: *"Remy คือแนท Salamander คือพี่เบส"*. Checklist (added 11-08, read back, all 7 unticked): one line per card 1–7 with block · days · baht (card 7 = "ถามขวัญก่อน"). Not set: meeting date.
