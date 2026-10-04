# REQ-112: Khwan — cancel-extends-expiry · a make-up must be leavable · a timeline (2026-10-04)

- **Source:** customer Khwan, via the owner, 2026-10-04. `[customer-asked]`
- **Status:** INTAKE. Nothing dispatched to build.
- **Screenshot:** `project-docs/customer-2026-10-04/khwan-3-items.png`

## 1. Verbatim
```
พี่โด่งคะ ตอนนี้ cancel คลาสไม่ได้เพิ่มอายุคอร์สอัตโนมัติหรอกค่ะ เพราะขวัญเข้าใจว่าเพิ่มอัตโนมัติ
เนื่องจากเรากด cancel จากปัญหาทางเราเท่านั้น เช่น ครูลา ครูป่วย แคนคลาสแบบนี้ค่ะ

แล้วก็ขอไทม์ไลน์หน่อยค่ะว่าจะแก้หน้าบ้านทั้งหมดเสร็จประมาณวันไหนคะ
คาดการณ์ว่าจะเริ่มหลังบ้านได้วันไหนคะ ถ้าแก้ขึ้นระบบแล้วไม่ได้มีการแก้ไขอะไรเพิ่ม

คาบชดเชย (Extended) ต้องนับให้ลาได้ด้วยค่ะ
ปัจจุบันเราถาด Confirm คลาส Extended แค่ล่วงหน้า 1 วันเท่านั้นเพื่อไม่ให้ลูกค้าค้างหน้าค่ะ
```

## 2. Porter's restatement
- **A — a CANCEL by the school should extend the course's expiry automatically.** She believed it already did. She is explicit about WHY: *the school only presses cancel when the fault is ours* — a coach on leave, a coach sick. ⚠️ **Ambiguous in one place: whether she is reporting that it does not happen, or asking for it. Owner to confirm (§4).**
- **B — a make-up (EXTENDED) session must be leavable.** Today the family cannot take leave on one. 🔑 **And she gives the operational reason the gap is invisible: they only CONFIRM an Extended class ONE DAY ahead**, to keep it off the customer's screen until it is settled.
  - ⚠️ **This is the CONFIRMED-only parent window again** (`TASK-598`), from a third door. **The leave list only sees CONFIRMED, and an Extended session is not confirmed until the day before** ⇒ **a family can never take leave on a make-up in practice.**
  - ⚠️ **@Sober's open question from 10-01 is now the customer's requirement:** whether the leave ACT itself refuses EXTENDED. **If it does, widening the window alone will not satisfy her.**
- **C — she wants a TIMELINE:** when the front office is finished, and when the backoffice phase can start, assuming nothing new is added after it ships.

## 3. Ownership note
- **A and B both land in the LEAVE / EXPIRY machinery — `scheduler.service.ts` and `line-webhook.service.ts` — which is Team A's claim this batch.** 🚫 **Team B must not build them while that claim stands**, however idle it is.
- **C is Porter's, not an engineering item.**

## 4. Open questions (owner)
1. **A — confirm the intent.** Is she asking us to BUILD "a school-side cancel extends the course expiry automatically"? And **which cancels count as the school's fault** — every admin cancel, or only some (coach leave / coach sick)? 🔑 *The system cannot read intent; somebody has to say which reasons extend.*
2. **A — by how much?** One session's worth of validity per cancelled class, or to the end of the re-planned schedule?
3. **B — may a parent take leave on a make-up at all?** 🔑 *A make-up is already the answer to one leave. Leaving on it creates a make-up of a make-up unless he says otherwise.*

## 5. Khwan's answers, 2026-10-04
```
1. เป็นแบบที่ 1 ค่ะ เพิ่มอีกคลาส เหมือนลาคลาสปกติ
2. แบบที่ 2 ค่ะ เลือกเหตุผลค่ะ
3. แบบที่ 1 ค่ะ ถ้าเลือกเป็นเหตุผลจากทางเราเราขยาย 1 สัปดาห์ค่ะ
```
**Meaning:**
- **B — leaving a make-up DOES append another make-up**, exactly like leaving an ordinary class.
- **A — the admin CHOOSES A REASON when cancelling**, and only the school's own reasons extend the expiry.
- **A — the extension is ONE WEEK per cancelled class**, when the reason is the school's.

## 6. What her answers do NOT yet settle — for the owner
1. 🔴 **The list of cancel REASONS does not exist yet.** She said "choose a reason"; nobody has said **which reasons exist** and **which of them count as the school's**. **That list is the feature.** ⚠️ A cancel today takes free text, not a chosen reason.
2. 🔴 **"A make-up of a make-up" has no stated end.** leave → make-up → leave → make-up … **Whether it self-limits depends on whether a leave on an EXTENDED session spends leave quota** — that is a code fact nobody has established yet. 🔑 *If it does not spend quota, the chain is unbounded and so is the course.*
3. ⚠️ **One week per cancelled class interacts with the EXISTING extension ceiling**, which measures from the purchase start date. **Two rules that both move an expiry must be reconciled, or they will disagree on some course and nobody will know which is right.**

## 7. Owner ruling, 2026-10-04
- **The make-up chain is INTENDED.** "ลาคาบชดเชยแล้วได้คาบชดเชยอีก อาจไม่มีวันจบ — อันนี้ถูกแล้ว แบบนั้นแหละที่เขาต้องการ" ⇒ 🚫 **Do not cap the chain. Do not design a limit.**
- ⚠️ **One thing the ruling does not settle, and it is a one-word answer:** **does leaving a make-up SPEND a leave from the customer's quota?**
  - Khwan's own words were *"เหมือนลาคลาสปกติ"*, and an ordinary leave spends quota ⇒ **that reading self-limits: a family with 2 leaves gets 2 make-ups in total, however they are spread.**
  - **"Never-ending" only happens if it does NOT spend quota.**
  - 🔑 **Both are buildable; they are different products, and the difference is money.** Porter put it to the owner.

## 8. Khwan, 2026-10-04 — **she rejects the premise: leave should not be a COUNT at all**
```
จริง ๆ แล้วไม่ควร Fix โควต้าการลาเป็นจำนวนครั้งค่ะ เพราะจำนวนครั้งที่ลูกค้าเรียนต่อสัปดาห์ไม่เท่ากัน
เช่น ลูกค้าที่เรียน 2 วัน/สัปดาห์ จะใช้โควต้าการลา 2 ครั้งต่อสัปดาห์ ทั้งที่อายุคอร์สลดลงเพียง 1 สัปดาห์
… ให้โควต้าการลาสัมพันธ์กับอายุคอร์ส … เพื่อให้ลูกค้าสามารถลาได้เรื่อย ๆ ภายในช่วงอายุคอร์สที่เหลืออยู่
โดยไม่เกิดกรณีที่โควต้าการลาหมดก่อนอายุคอร์สค่ะ
```
**Her example:** a 6-session course, 8 weeks of validity, Mon + Fri. Two attended, four left, six weeks left. The next week they take BOTH days off ⇒ **the calendar slipped one week, but today's rule charges TWO leaves.**

**Porter's read — she is right about the problem, and her diagnosis is better than her solution is specified:**
- 🔑 **The defect is real and it is structural: leave is counted in SESSIONS while the thing it actually consumes is WEEKS.** **A twice-a-week family is charged double for one week of slip.** 📌 **Her own numbers match our code exactly — `maxWeek = size + quota` gives 6 + 2 = 8 — so she is describing OUR expiry rule back to us.**
- ⚠️ **What she proposes is not a tweak: it REMOVES "leave quota" as a concept** and makes the EXPIRY the only limit.

**What it would collide with, all of it decided in the last week:**
1. 🔴 **REQ-110 F** — the owner ruled free pre-start absences are **capped at the quota the customer bought**. **If there is no quota, that cap has no meaning and the ruling must be re-made.**
2. 🔴 **REQ-112 B** — "does leaving a make-up spend quota" **dissolves**: with no quota there is nothing to spend, and the expiry limits the chain instead. ✅ **That is a simpler answer than either option we put to her.**
3. ⚠️ **REQ-112 A** — "+1 week when the school cancels" now moves the ONLY limit there is. **Two rules moving one number, and one of them is the customer's own.**
4. ⚠️ **A make-up lands AFTER the leave it answers.** **With the expiry fixed, a leave taken late can push its own make-up past the expiry.** **Somebody must say what happens then** — today the quota ran out first and that case was rare.

## 9. Khwan's answers, 2026-10-04 (screenshot `project-docs/customer-2026-10-04/khwan-quota-answers.png`)
**On the model — she CONFIRMS Porter's restatement:** stop fixing leave as a count; leave freely while the course is still alive; the expiry is the only limit.
- ⭐ **New idea from her:** show **how many WEEKS of validity are left**, and whether that still fits the sessions remaining — *"อาจจะขึ้นเป็นอายุคอร์สเหลือกี่วีค สัมพันธ์กับครั้งเรียนที่เหลือไหม ถ้าจะเกินไหม"*.
- **If a leave would run past the expiry: the system TELLS THE ADMIN, as it does today.**

**1. A make-up that would land past the expiry:** *"เราให้ลาได้ แต่ต้องแจ้งแอดมินก่อนค่ะ ในกรณีที่จะเกินอายุคอร์ส"*
⇒ **Allow the leave, and NOTIFY THE ADMIN** — neither of Porter's three options exactly: not refuse, not auto-extend, not silently lose the session. **The admin decides what happens next.**

**2. Free pre-start absences:** *"ใช่ค่ะ ตอนนี้ ลาล่วงหน้าก่อนเริ่มคอร์สเราไม่จำกัดอยู่แล้วนะคะ ที่พี่โด่งแก้มาล่าสุด"*
⇒ **She wants them UNLIMITED, and she believes they ALREADY ARE in what we just shipped.**

## 10. 🔴 A CONFLICT the owner must settle before this batch ships
**REQ-110 F — the owner ruled on 2026-10-02 that free pre-start absences are CAPPED at the quota the customer bought.** **`TASK-609` was built to that ruling and is IN THE CURRENT BATCH, not yet on `sid`.**
🔴 **Khwan has just said she wants them unlimited, and believes they already are.**
⇒ **When `TASK-609` ships, a behaviour she believes is unlimited becomes capped — and she will report it as a regression.**
**Two ways, and it is the owner's call:**
- **(a) Keep the cap** (his 10-02 ruling) — then **tell her before it ships**, in his words, so it is not a surprise.
- **(b) Drop the cap** — then `TASK-609` changes before the batch goes, and that is a change inside a verified task.
⚠️ **Porter has NOT told her either way.**

## 11. Khwan's answers, 2026-10-04 — **the model is now complete**
```
1. เรามีอายุคอร์สให้อยู่แล้วค่ะ
   4 ครั้ง 5 สัปดาห์ · 6 ครั้ง 8 สัปดาห์ · 10 ครั้ง 13 สัปดาห์
   คอร์ส 4 ครั้งลาล่วงหน้า 1 ครั้ง อายุคอร์สบวก 1 จาก 5 เป็น 6 สัปดาห์ค่ะ
2. ถ้าแม่จะลา แล้วคาบชดเชยที่จะเกิดขึ้นมันจะเลยอายุคอร์สไป ระบบจะเตือนแบบนี้ใช่ไหมคะ ก็เด้งมาที่แอดมินให้จัดการ
3. ข. ที่เป็นอยู่ตอนนี้ค่ะ ให้ขึ้นตรงกล่อง expired แล้วเตือนแอดมินค่ะ ถ้าแอดมินเข้าไปขยับวันหมดอายุให้ก็เรียนปกติค่ะ
   แต่ถ้าไม่ก็ให้ขึ้นค้างไว้แบบนั้นก่อน (เรียนได้ ตารางยังอยู่ แต่ทีมจะเคลียร์ตลอดไม่ให้มีคอร์สหมดอายุ)
```

### The model, stated plainly
1. **Base validity is a FIXED TABLE by course size: 4 ⇒ 5 weeks · 6 ⇒ 8 · 10 ⇒ 13.** 📌 **Those are exactly our current `maxWeek` numbers (4+1, 6+2, 10+3), so the table is not new — only its MEANING is.**
2. 🔑 **A leave does not spend a pool. EACH LEAVE ADDS ONE WEEK to the validity.** Her example: a 4-session course, one leave declared ⇒ **5 weeks becomes 6.**
   ⇒ **"Leave quota" stops being a LIMIT and becomes the BASE of the validity table.** **There is no counter to run out, which is what she has been saying all along.**
3. **If the make-up would land past the expiry: WARN, and send it to the ADMIN to handle.** (Her option ก, confirmed in her own words.)
4. **A course that expires with sessions unused:** **it goes in the `expired` box and alerts the admin.** **If an admin moves the expiry, lessons continue as normal. If not, it sits there — the class stays on the schedule and can still be taught.** 📌 **Her team clears expired courses continuously, so this state is meant to be visible and temporary, not an end state.**

### Consequences to carry
- ✅ **REQ-112 A (+1 week when the school cancels) is the SAME MECHANISM**, not a second rule. 🔑 **One lever moves the expiry: a week at a time. That removes the collision Porter flagged in §6.**
- ✅ **`UNDO_LEAVE_CHARGE_UNKNOWN` disappears**, because no leave consumes a counter. ⚠️ **`§T-G`'s approved reword becomes redundant when this ships — not wasted, it was right for the rule in force.**
- ⚠️ **Nothing stops the validity growing indefinitely.** **The owner has already ruled that is intended.**

## 12. Owner ruling, 2026-10-04 — **sizing waits**
**"เก็บไว้ประเมินหลังขึ้น sid เสร็จ".** 🚫 **Nobody sizes or builds the leave-model change until the current batch is on `sid`.** **The requirement is complete and recorded (§11); it is not forgotten and it is not in flight.**
