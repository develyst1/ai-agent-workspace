# AGENDA: ประชุมหลังบ้านใหม่ + ราคา กับพี่ฟีนและขวัญ — เสาร์ 7 พ.ย. 2569 — @Porter, 2026-11-03
คำขอของพี่ (2026-11-03): *"ช่วยทำ agenda คุยวันเสาร์ให้หน่อย"*

**ที่มาของข้อมูล:**
- ตัวเลขและคำตอบ: `BRIEF-owner-backoffice-money-meeting-2026-10-27.md`
- คำตอบ 6 ข้อของขวัญ: `requirements/REQ-120-…md` §9.4

**สิ่งที่ต้องเปิดไว้:**
- สไลด์ราคา: `som-balance-backoffice-spec/pricing-deck/dist/index.html`
- หน้าจอหลังบ้าน: `…/final-ui/dist/index.html`

**เวลาประมาณ 60 นาที**

| # | หัวข้อ | นาที | พูดอะไร / โชว์อะไร |
|---|---|---|---|
| 1 | เปิด: เรามาถึงตรงไหนแล้ว | 5 | ขวัญยืนยันกฎและหน้าจอครบแล้ว (V3) และตอบคำถามเรื่องเงินครบ 6 ข้อแล้ว สเปกปิดแล้ว วันนี้เหลือแค่คุยราคาและวันเริ่ม |
| 2 | โชว์ระบบหลังบ้าน 5 ส่วน | 15 | เปิดหน้าจอหลังบ้าน แล้วเล่าทีละส่วน: Salary · Revenue · Stock · แก้หน้าบ้าน · สิทธิ์ผู้ใช้ เน้นว่า **ตั้งแต่นี้ทำให้อัตโนมัติ** เช่น เงินเดือนคิดจากตารางสอน และรายได้ลงเองตอนยืนยันคอร์ส |
| 3 | ราคา | 10 | บอกราคา 39,200 + "ประเมินค่าแรงตามเรทเดิม" เท่านั้น วิธีคิดบอกเมื่อเขาถาม |
| 4 | การจ่ายเงิน | 5 | จ่ายตามก้อนที่ได้รับ (ดูตารางด้านล่าง) **ไม่มีมัดจำ** ได้รับงานแล้วค่อยจ่าย ถ้าเราส่งช้า เขาก็ยังไม่ต้องจ่าย |
| 5 | หลังส่งมอบ | 5 | หัวข้อย่อยด้านล่าง |
| 6 | ลำดับส่งมอบ + สิ่งที่ต้องได้จากเขา | 5 | หัวข้อย่อยด้านล่าง |
| 7 | ถาม–ตอบ | 10 | ใช้ตารางคำถามท้ายไฟล์ |
| 8 | ปิด: สรุปสิ่งที่ตกลง | 5 | อ่าน checklist ด้านล่างให้ครบทุกข้อก่อนออกจากห้อง |

**ข้อ 3 ราคา:**
- รวม **39,200 บาท ครบทุกส่วน** ประเมินค่าแรงตามเรทเดิม ไม่ได้ขึ้นราคา ทั้งหมดเสร็จใน **ประมาณ 3 เดือน**
- **ถ้าเขาถามวิธีคิดเท่านั้น:** เรทเดิมตกวันละประมาณ 263 บาท งานที่เพิ่มคือ 149 วันทำงาน หลังหักหลังบ้านเดิมแล้ว "149 วัน" คือขนาดงาน ไม่ใช่เวลาที่ต้องรอ ราคานี้รวมเทส ขึ้นระบบ UAT รายงาน 6 หัวข้อ และหน้า SOM Dashboard แล้ว

**ข้อ 4 การจ่ายเงิน (ตามลำดับที่ลูกค้าแจ้ง 11-05, REQ-120 §11):**

| งวด | ส่งมอบ | ราคา |
|---|---|---|
| 1 | เงินเดือน + ฝั่งโค้ช + สิทธิ์ผู้ใช้ | 17,100 |
| 2 | รายได้ + หน้าบ้าน (มี ECA) | 13,800 |
| 3 | สต็อก | 8,300 |

**ข้อ 5 หลังส่งมอบ:**
- **ระหว่างโปรเจค:** แก้บั๊กให้ตลอด เพราะเราขึ้นระบบให้ทดสอบตลอดอยู่แล้ว
- **หลังจบโปรเจค:** ดูแลต่อ (maintenance) **6 เดือน** รวมอยู่ในราคา
- **ขอของเพิ่ม** ที่อยู่นอกขอบเขตที่ขวัญยืนยันแล้ว: คิดเรทเดิม 263 บาทต่อวัน ตามขนาดงาน

**ข้อ 6 ลำดับส่งมอบ:**
- **ยืนยันต่อหน้าพี่ฟีน:** เงินเดือน → รายได้ → สต็อก
- **เงินเดือนส่วนแรก:** ฐานเงินเดือน · Extra hour · โบนัส 100 แล้วโบนัส 50 ตามมา ได้ใช้ในประมาณ 7 สัปดาห์ (ไม่ใช่ 5–6 ที่อยู่ใน agenda ที่ส่งไป เพราะขอรายการเพิ่ม)
- วันส่งมอบแต่ละงวดนับจากวันที่ได้ข้อมูลครบ
- ไฟล์ Excel สต็อกได้รับแล้ว ยอดคงเหลือจริงใช้ยอดนับวันเริ่มใช้ระบบ

## ✅ Checklist: ต้องได้ 4 อย่างนี้ก่อนออกจากห้อง
- [ ] **ตกลงราคา 39,200 บาท และงวด 17,100 / 13,800 / 8,300** หรือถ้าเขาขอแบบอื่น จดคำพูดเขาไว้ตรง ๆ
- [ ] **ลำดับ เงินเดือน → รายได้ → สต็อก** ยืนยันในห้องแล้ว
- [ ] **วันเริ่มใช้ระบบ (go-live)** ซึ่งมีผลต่อการนับรายได้และโบนัสช่วงรอยต่อ
- [ ] **คำว่า "เริ่มได้"** แล้วพี่แจ้งผม ทีมจะเริ่มที่เงินเดือน + สิทธิ์ผู้ใช้

## ⚠️ ระวังในห้อง
- **ถามขวัญเท่านั้น** พี่ฟีนรับข้อมูล ไม่ถามพี่ฟีน
- **ถ้าขอของใหม่ในห้อง** เช่น รายงานใหม่หรือหน้าใหม่ ให้รับไว้เป็น "รายการเพิ่ม" คิดเรทเดิม **ไม่รับเข้าราคา 39,200**
- **อย่าพูดว่า "AI ทำแทนคน"** ให้พูดว่า "เครื่องมือช่วยให้ทีมส่งเร็วขึ้น ทุกอย่างมีคนตรวจ"
- **ยังเปิดอยู่ พี่ตัดสินเอง:** SA ประเมินงานเพิ่มไว้ประมาณ +5 วัน (≈ +1,300 บาท) จาก export Excel / PDF ของสลิปที่ขวัญขอเพิ่ม ยังไม่ได้รวมในราคา พี่จะรับไว้เองหรือบวกเพิ่มก็ได้
- **ค่าเซิร์ฟเวอร์ / ค่าดูแลรายเดือน** ไม่รวมในราคานี้ ถ้าเขาถาม พี่ตอบตามที่ตกลงกันไว้เดิม

## ถาม–ตอบ (ฉบับย่อ; ฉบับเต็มอยู่ใน BRIEF §7)
| ถ้าเขาถาม | ตอบ |
|---|---|
| 149 วัน = 7 เดือน ทำไมนาน | เป็นขนาดงาน ทีมทำหลายคนพร้อมกัน เสร็จในประมาณ 3 เดือน |
| เร็วเพราะ AI แล้วทำไมคิดเต็ม | ราคาผูกกับขนาดงาน เหมือนแพ็กเกจเดิม ส่วนที่ได้ใช้เร็วขึ้นเป็นประโยชน์ของลูกค้า และงานเทส ติดตั้ง รายงาน รวมให้แล้ว |
| ของเดิมจ่ายไปแล้ว ทำไมต้องรื้อ | หักหลังบ้านเดิมออกแล้ว 51 วัน คิดเฉพาะส่วนที่เพิ่ม |
| ลดได้ไหม / ไม่เอา Salary ได้ไหม | (ใช้เมื่อจำเป็นเท่านั้น) ไม่เอา Salary ตอนนี้ ≈ 25,700 แล้วต่อ Salary ทีหลัง ≈ 13,500 รวมเท่าเดิม 39,200 ไม่มีส่วนลด |
| ถ้าส่งช้า | จ่ายเมื่อได้รับงานแต่ละงวด ช้าก็ยังไม่ต้องจ่าย |
| ถ้าฝั่งเขาส่งข้อมูลช้า | วันส่งมอบนับจากวันที่ได้ข้อมูลครบ |

## ➕ Added 2026-11-03: the stock Excel ฟีน sent on 10-30 (Sober's check: `STOCK-EXCEL-CHECK-feen-2026-10-30.md`)
**Say in the room:** "ได้รับไฟล์แล้ว ใช้เริ่มงานสต็อกได้ทันที"

**The 3 points to settle at item 6 of the agenda (ask Khwan or the admins, not พี่ฟีน):**
1. **Price + commission:** add 2 columns, **ราคาขาย** and **กลุ่มค่าคอม**, per product. They are needed before selling through the system, about week 3 of the Stock block.
2. **The "Skate" rows (193):** the team proposes a category for each by code prefix (Miller / Inline / Safety / Other / F&B; the table is in Sober's file). They correct only the wrong lines. Needed before Low Stock alerts.
3. **Demo rows 9 and 10:** both say "สนับ / ชุด -Red+Black". Is one of them Red+Blue?

**Not questions, just to finish before go-live:**
- "รอครูนับ" (Balance Play / Game Play);
- "อันไหนพัง??" (Space Shark);
- "หมวก Miller นับรวมกับ SM / ML ไหม".
- **The real opening balance** is a count on the go-live day, sent in the same file.

## ➕ Added 2026-11-05: the customer already stated the order (REQ-120 §11). Items 3, 4 and 6 above now follow it
- **Order to confirm in the room, with พี่ฟีน present:** เงินเดือน → รายได้ → สต็อก.
- **Installments (no deposit):** เงินเดือน + สิทธิ์ผู้ใช้ 17,100 · รายได้ 13,800 · สต็อก 8,300 · total 39,200.
- **First Salary slice she asked for:** ฐานเงินเดือน · Extra hour · Bonus 100. Bonus 50 comes later. ≈ 7 weeks.
- **ECA is in the Revenue block:** already in scope, say yes.
- **Item 3, already ruled 11-03:** say the price + "ประเมินค่าแรงตามเรทเดิม" only. The method, 263 and 149 are only if they ask. Total time = "ประมาณ 3 เดือน", not 2–3 months.
- **Stock Excel:** the 3 points are no longer urgent, since Stock is last. Week 3 of the Stock block moves later.
- **Ask in the room (Silver, 11-05, Q13):** a renewal after go-live of a course bought before go-live: is Bonus 100 paid? The team plans on "not paid" until answered, so the first slips may show no Bonus 100. Ask the admins.
- **Weeks in this order (both SAs, 11-05):** เงินเดือนส่วนแรก ≈ 7 · เงินเดือนครบ ≈ 10–11 · รายได้ ≈ 7, ครบ ≈ 11 · สต็อก ≈ 14. Total ≈ 14 weeks, the upper edge of "ประมาณ 3 เดือน".
- **Bonus 100 (decide in the room):** A: a renewal after go-live pays even if the old course is from before go-live (≈ +0.5 day; both SAs' plan is B until answered, Sober recommends A). B: both ends after go-live, so the first slips may show almost no Bonus 100, though it is what they asked for first.
- **Say plainly:** until the whole Salary block, FL pay, OT, Transportation and Merit are typed by hand in the slip, and commission until Stock (≈ week 14). They may keep their Excel alongside for those weeks.
- **Bonus 50:** the links are recorded from go-live, so nothing is lost. Whether the gap gets paid when it ships is their decision (the team's default: yes).
