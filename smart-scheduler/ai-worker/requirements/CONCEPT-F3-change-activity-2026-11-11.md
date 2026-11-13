# CONCEPT: F3, change the activity of a course mid-way (front office + back office): DRAFT for the quote

Porter, 2026-11-11. **Owner (verbatim):** *"อันนี้ หน้าบ้านใช่มั้ย แล้ว หลังบ้าน ต้องคิดด้วยนะ … ว่า มันจะลง เงินเข้าค่าคอร์สยังไง เวลามาย้อนดู ถ้าซื้อคอร์ส กิจกรรมนึงไป แล้วมาเปลี่ยนทีหลัง … เปิดการ์ดเสนอราคา และtrolley ด้วย และคิดมา และ ย้อนดูข้อมูลที่เกี่ยวข้อง"*

**Read before writing:**
- REQ-5007 (her ask on 11-07, verbatim, plus Sober's answer);
- CHECK-REQ-5007-money-2026-11-07 (Silver);
- DECISIONS-REQ-120-build row 24 (her 11-10 money ruling);
- CUSTOMER-ANSWERS 11-10 02:10;
- REQ-053 (the owner's lock, 08-16);
- REQ-036 (End early, `PROGRAM_CHANGED`);
- the 11-10 meeting summary. It does not mention this; the money talk the owner remembers is the customer meeting and Master Plan §8.2, which row 24 replaced.

## Her ask (REQ-5007, 11-07)
- A button to change the activity of a whole course, 1 HR and Trial included.
- She wants to know what it touches: the teaching report, the children's activity statistics, and the back-office money.
- *"เราอยากให้ทุกอย่างถูกต้องตามความเป็นจริง"*. If something is hard, tell her first.

## Her money ruling (11-10 02:10, DECISIONS row 24)
- *"รายได้ไม่ควรเปลี่ยนหรือขยับอะไรค่ะ สิ่งที่ควรเปลี่ยนตามคอร์สจริงๆคือ category ของรายได้"* and *"ใส่เงิน Manually ในราคาส่วนต่างค่ะ"*.
- So the amount and the month of the course sale stay as sold, and only its category follows the new activity. A price difference is a separate manual entry.

## The concept

### Front office: "Change activity from the next class"
1. On the course panel the admin presses **Change activity**. She picks the new activity, and optionally the coach for the remaining classes.
2. The screen shows what will happen before she confirms:
   - attended classes stay as they are, with the old activity;
   - the N remaining classes become the new activity;
   - **the price difference** from the price card (e.g. 6 h Skate → Onewheel: +1,410 ฿ for the whole course, or the remaining-class share);
   - a warning when the new activity has no price for that package. A 4 h course cannot move to Balance Private or Group.
3. On confirm:
   - the remaining classes change activity;
   - the course keeps its expiry and its count;
   - family and coach get a short notice.
4. **1 HR and Trial:** the same button on the booking. There is no money work here: a 1 HR posts at day-end at the new price, and a Trial has one price.
5. **This lifts REQ-053**, the owner's 08-16 "no activity change inside a course", but only for this deliberate action, and never for attended classes. It replaces today's 2-step workaround (End early, then sell a new course). That workaround **counts the money twice** unless someone fixes it by hand (Silver).

### Back office: "how the money reads when we look back"
- **The sale line keeps its amount and its month.** A closed month's total never changes.
- **The category on that course's revenue line changes to the new activity**, per her ruling. The line carries a history note: *"เปลี่ยนจาก Skate เป็น Onewheel วันที่ … โดย …"*. Anyone looking back sees why the category is not the one first sold.
- **Price difference.** The change screen shows it, and the admin records it through **Add Manually** in Revenue, linked to the course, with a reason "ส่วนต่างเปลี่ยนกิจกรรม". A lower price is a manual refund line. It does **not** cancel any class (the REQ-120 C-f refund cancel must not fire).
- **Teaching report and activity statistics** (SOM Dashboard, Daily Report) count each class by what it actually was. 5 Skate then N Onewheel is the truth, and attended rows are never rewritten.
- **Must be fixed with it:** today's "revenue by activity" reads the activity from the class rows, picking any one. After a partial change that can flip between two reads. The read must take the course's own activity (Silver, M0).
- **Salary:** an activity change is not a renewal. It does not touch the first-coach link or Bonus 100.

## Open points to confirm with ขวัญ (our defaults)
1. Does the category change for the **whole** sale line (her words), even in a closed month? [yes, as she said, with the history note]
2. Is the price difference for the whole course or only the remaining classes? [only the remaining classes, matching what was taught]
3. A change to an activity with no price for that package (4 h → Balance): refuse it, or the admin types a price? [refuse; the admin uses End early + new course]
4. Can the coach change at the same time? [yes, optional]

## Size and price (rate 263 ฿/d), from the SAs' 11-07 reads
- Front office: the button wrapper 3–4 d, plus 1 HR / Trial 1–1.5 d.
- Back office: M0 read fix 0.5 d, plus the Revenue add-on ~1.5 d.
- **≈ 6–7.5 d ≈ 1,600–2,000 ฿.**
- Her 11-10 ruling ("category only, difference by hand") may shrink the money part. Silver re-sizes before the quote is final.
- It is built **with the Revenue block** (it writes revenue lines), not as a loose patch.

## Re-sized by Silver (CHECK-REQ-5007-money § 6), 2026-11-11. This REPLACES the size above.
- **Money part ≈ 2–2.5 d, low–medium risk:**
  - M0 read fix: 0.5 d;
  - category relabel plus a history table: ≈ 1 d;
  - a manual difference linked to the course: 0.5–1 d;
  - no re-class pair.
- **Quote total ≈ 6.5–8 d ≈ 1,700–2,100 ฿.**
- Concept fixes:
  - **(1) A lower price cannot be refunded through Add Manually today.** REFUND is refused, and the Refund screen cancels classes.
    - Either +0.5–1 d, or ขวัญ rules that a cheaper activity is never refunded.
    - **Question 5 for ขวัญ:** a move to a cheaper activity is refunded or not? [default: no refund]
  - **(2) The line's product name stays the old activity.** The Detail row must show "Skate → Onewheel", inside the relabel.
  - **(3) A manual line linked to a course** is inside the 0.5–1 d.
  - **(4) The revenue pieces are Team C's** to build, with the Revenue block.
