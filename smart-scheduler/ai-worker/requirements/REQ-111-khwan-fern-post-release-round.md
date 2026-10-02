# REQ-111: Khwan + Fern — post-release front-office round (2026-10-02)

- **Source:** customer Khwan, and **Fern** (the customer's brand/communications person), via the owner, 2026-10-02. `[customer-asked]`
- **Status:** INTAKE. **Not dispatched to build.** ⚠️ The owner's message was still arriving when this was written — **more items may follow.**
- **Customer instruction that changes the plan:** *"ฝากแจ้งว่าให้พี่โด่งทำหน้าบ้านให้เสร็จเรียบร้อยก่อนได้เลยนะคะ ค่อยเริ่มระบบหลังค่ะ"* ⇒ **finish the front office before the backoffice phase.**

## 1. Verbatim

**Fern:**
```
พี่ฟีนขอลิสต์ข้อความแจ้งเตือนทั้งหมดหน่อยนะคะ จะได้ช่วย revise และปรับข้อความให้เหมาะสมค่ะ
เพราะข้อความแจ้งเตือนมีผลต่อภาพลักษณ์ของแบรนด์และวิธีที่เราสื่อสารกับลูกค้าด้วยค่ะ

และฝากแจ้งว่าให้พี่โด่งทำหน้าบ้านให้เสร็จเรียบร้อยก่อนได้เลยนะคะ ค่อยเริ่มระบบหลังค่ะ
```

**Khwan, numbered against the closing list:**
```
1 (โอเค) แต่ว่าหน้า Confirm results ขึ้นเป็นภาษาเอเลี่ยนค่ะ

2 : ขวัญลองกดลาในระบบ แบบให้ครูลาเองแล้ว
1. แอดมินกดลาให้ได้ไหมคะ ครูลายาวหลายวันไม่น่าจะสะดวกมากดกันเอง
2. ถ้าลาแล้วตารางไม่ได้ขึ้นบล็อกดำแบบนี้ แอดมินน่าจะไม่รู้นะคะว่าครูลา เพราะถ้าดูผ่านๆ มันเหมือนว่างเฉยๆค่ะ
   ต้องกดเข้าไปจองแล้วถึงจะขึ้นว่าครูลาจองไม่ได้ ทำให้ขึ้นเทาไปเลย หรืออะไรให้รู้หน่อยได้ไหมคะว่าไม่อยู่ ลา

3. (เข้าใจแล้ว)  4. (เข้าใจแล้ว)

5. ต้องเป็นการสลับครูไม่ใช่เพิ่มครูรายครั้งค่ะ
ตอนนี้ที่เป็น : ครู B ไปสอนเพิ่มแค่ครั้งนี้ แล้วครู A ยังอยู่ เอาครู A ออกแบบรายครั้งไม่ได้
สิ่งที่ต้องการ : ครู A ไม่ได้ไปสอนครั้งนี้ ครู B ไปสอนแทนครั้งต่อๆไป ในตารางยังคงเป็นครู A อยู่ค่ะ

6. (เข้าใจแล้ว) สอบถามเพิ่มเติมว่าแบบนี้คอร์สที่ยังไม่เปิดใช้ ให้ยังกด planned absence ได้ด้วยหรือเปล่าคะ
   โดยไม่ต้องนับโควต้าการลา พอเลื่อนวันเริ่มได้แล้ว ผปคบางคนก็จะแจ้งวันลาล่วงหน้าเพิ่มด้วยค่ะ

7.–11. (เข้าใจแล้ว / โอเค)
12. เดี๋ยวขอรอดูตอนเย็นนะคะ
```

## 2. Porter's plain restatement
- **A. Fern wants THE LIST of every notification message we send**, so she can revise the wording for the brand. She is not reporting a fault; she is asking for the inventory.
- **B. 🔴 "Confirm results" shows garbled text** ("ภาษาเอเลี่ยน"). A screenshot is needed; it may be an encoding fault or an unrendered key.
- **C. An ADMIN must be able to record a teacher's leave on the teacher's behalf.** Today only the teacher can. A teacher away for several days should not have to do it themselves.
- **D. A blocked day must be visible AT A GLANCE on the schedule** — grey it out, or mark it. Today it looks free until someone tries to book and is refused.
  - ⚠️ We DID build an orange blocked-day strip above the grid. **She is asking for the CELLS themselves to show it.** The strip is not enough.
- **E. 🔴 ECA teacher change is the WRONG ACT.** We built *add a second teacher for one session*. She wants a **SWAP**: teacher A is not teaching that session, teacher B is, and **the course's own teacher stays A**.
  - ⚠️ **Our item 5 did not satisfy her. Treat this as the real requirement, not a tweak.**
- **F. A course that has not started yet should accept a planned absence without spending leave quota.** Parents move the start date and then declare days off in advance.

## 3. Open questions (owner)
- **B:** the screenshot, and which page/login.
- **C:** does an admin-recorded teacher leave notify the teacher? Does it follow the same future-vs-today rule the teacher's own act follows?
- **D:** grey the whole column for that day, or mark each cell? Does an existing class on that day still show normally?
- **E:** when B covers for A, whose rate is paid — the owner already ruled "the covering teacher's" for a one-session cover; confirm it still holds for a true swap.
- **F:** if it does not spend quota, is there any limit at all, and what happens when the course starts?

## 4. Item B resolved to a precise finding, 2026-10-02 (screenshot received)
**Screenshot:** `project-docs/customer-2026-10-02-req111/confirm-results-uuids.webp`. Taken on **sid** (`som.develyst.online`), admin login, EN.
🔑 **It is NOT an encoding or font fault, and NOT a device issue.** **The "Confirmation results" dialog prints the raw BOOKING ID for every CONFIRMED row** — `adad5be7-29b2-4d2f-af98-99c4a6680e0f` and seven more — **where the student's name belongs.**
- The **SKIPPED** rows render correctly: *"Aileen — คอร์สนี้พักอยู่ … (This course is paused — resume it first.)"*
⇒ **The skipped branch has the name; the confirmed branch falls back to the id.**
📌 **No need for Khwan to retry on a computer.** Same on any device.

## 5. Intake CLOSED, 2026-10-02 (owner: "หมดละเท่านี้")
The round's items are final:
- **A** Fern's notification-message inventory
- **B** Confirmation results prints booking ids instead of student names (§4)
- **C** an admin records a teacher's leave on their behalf
- **D** a blocked day must show on the grid itself
- **E** the ECA teacher change must be a SWAP, not an added teacher
- **F** a not-yet-started course takes a planned absence without spending quota
- **G** `LEAVE_CHARGE_UNKNOWN` on uat — Khwan's Undo refusal; scale unknown, with Sober
- **H** the freelance-budget rows move behind the coach-pay permission (owner ruled, option ข)
