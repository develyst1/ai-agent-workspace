# REQ-126: End a course early ("ตัดจบคอร์ส") without cancelling it or pausing it
**Intake:** Khwan, LINE, 2026-10-24 18:16–18:34 (the owner's paste, 10-25). Verbatim:
> *"พี่โด่งคะ เรามีกรณีน้องมีคอร์ส 10 ครั้งแต่คุณแม่ลาจนและไม่มาเรียนเราจำเป็นต้องตัดคอร์สน้องจบ เช่น 10 ครั้ง เหลือ 4 แต่ตอนนี้เราจะตัดจบคอร์สเลย เราสามารถทำอย่างไรได้บ้างคะ เพื่อจบคอร์สนี้ โดยไม่แคนเซิล ค่ะ เงินค่าสอนครูไม่ต้องคิดค่ะ แค่ตัดจบคอร์สเลย"*
> *"มีหลายกรณีอยู่ค่ะ ที่เราจำเป็นต้องตัดจบคอร์ส · แต่ไม่ใช่การ pause ไว้ หรือ cancel ไปค่ะ"*
> *"ไม่ค่อยมีค่ะ มีเหลือ 2-3 ครั้งตัดจบมีอยู่ค่ะ · จะมีแบบเขาลาบ่อยๆ เราล็อคตารางให้หลายครั้งจนไม่ไหวเราต้องขอตัดจบแบบนี้ค่ะ"*
> Money: *"เงินเข้าเท่าเดิม เงินออกที่จ่ายครูไม่มีแล้วค่ะ"*. The owner restated it (*"ได้เงินเท่าเดิมเต็มคอร์ส แต่ไม่มีค่าแรงครู ในส่วนที่ตัดไป"*) and she replied *"ถูกค้า"*.

The owner told her: *"ขอดูให้เคสนี้ วันอาทิตย์นะครับ"* (Sunday = 2026-10-25).

## What she wants (her words are the rule)
- A course with remaining sessions (e.g. 10 bought, 6 used, 4 left) is **ENDED now**. It is NOT paused and NOT cancelled.
- **The revenue stays as it is** (the full course).
- **The coach is not paid** for the sessions cut.
- Usually 2–3 sessions are cut; the reason is a family that keeps taking leave.

## Checked first
- The front office may already have an **end / drop** action for courses (Sober's FO_now module 7 lists "end / drop"). **Whether it does exactly this is for the SA to read.** If it does, it is Khwan's self-serve answer and nothing is built.
- REQ-112 covers expiry / leave; it is not this.

## Order
1. **Sober (Team A, courses):** from code:
   - Does an "end course" act exist today? Where is the button, who can press it?
   - What happens to the remaining sessions (removed? cancelled? and do families / coaches get notices?), to the course status, to the revenue already posted, and to coach pay?
   - Compare that with her 4 points. Then: self-serve as-is, a small change, or new work (size + claims + any new wording).
2. **Nothing goes to Khwan before Sober's read.** If it already works, Porter drafts the how-to for her.

## Sober's read (10-25): SELF-SERVE. The existing **'ยกเลิกคอร์ส'** (endCourse) does all 4 of her points: the remaining sessions are cancelled, the course is ended, no make-ups, the revenue stays, no coach pay; one LINE to the coach, none to the family; FINAL. The gap is words only. **Optional:** a 5th reason 'ตัดจบคอร์ส' (≈0.65 d, migration 0072) ± a button rename; the owner's call.

## Khwan, 2026-10-25 (reply to the how-to), verbatim: *"เข้าใจวิธีการค่ะ แต่อยากให้ชื่อปุ่มตรงกับที่ใช้จริงมากขึ้น เช่น "ตัดจบคอร์ส" หรือ "เปลี่ยนครู / เวลา ทั้งคอร์ส" ค่ะ"*
⇒ She wants BOTH optional word-fit changes. Waiting for the owner's GO + copy approval: REQ-126 = the button reads 'ตัดจบคอร์ส' (+ a reason 'ตัดจบคอร์ส', migration 0072); REQ-127 = one button 'เปลี่ยนครู / เวลา ทั้งคอร์ส'.

- ✅ **LIVE on uat 2026-10-26 (TEST-125 smoke PASS); Khwan told 2026-10-27** (`COPY-DRAFT-khwan-uat-release-2026-10-26.md`, sent by the owner).
