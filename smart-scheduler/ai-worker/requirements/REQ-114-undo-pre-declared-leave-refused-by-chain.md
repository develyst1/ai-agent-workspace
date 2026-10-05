# REQ-114 — Undo of a PRE-DECLARED leave is refused because its make-up was itself put on leave (2026-10-05)

- **Source:** customer **Khwan**, via the owner, 2026-10-05, with two screenshots. `[customer-asked]`
- **Status:** 🔴 **INTAKE. Not sized, not cut, nobody is building anything.** 🚫 **NOT in the uat release going out today.**
- **Environment:** **uat, on the CURRENT release** (the combined batch had not shipped when she reported it).

## 1. Verbatim
```
กด undo leave ไม่ได้ค่ะ
ของ peeta

แต่ว่าอันนี้จะย้อนลาของการลาล่วงหน้านะคะ สามารถย้อนได้ใช่ไหมคะ
ลาที่เรากดทิ้งไว้ตั้งแต่ตอนเปิดคอร์สแล้ว คุณแม่เปลี่ยนใจมาเรียน

พี่โด่งจะแก้กันพร้อมที่ขึ้นระบบวันนี้ใช่ไหมคะ

แล้วก็ฝากพี่โด่งแจ้งไทม์ไลน์ ปิดหน้าบ้านไปเริ่มหลังบ้านให้หน่อยนะคะ
```

## 2. What the screen says (screenshot, verbatim)
**Dialog "Undo this leave?"** — *The session goes back to confirmed and the class returns to the family's balance. The coach is told the class is on again.*
🔴 **Refusal panel: "The server will not undo this:"**
> **คาบขยายของการลานี้ (2026-12-05) ถูกแจ้งลาต่อ — ย้อนกลับไม่ได้ กรุณาแก้ไขด้วยตนเอง**
**"Undo it" is disabled.** The Reason box holds her own text: *คุณแม่เปลี่ยนใจมาเรียน*. **Row: Joe · Private SKATEBOARD.**

## 3. Porter's plain restatement
**A leave was declared IN ADVANCE, at course creation.** **It produced a make-up session (2026-12-05).** **That make-up has ITSELF since been put on leave.** ⇒ **The undo is refused because reversing it would have to decide what happens to the second leave.**
🔑 **The refusal is almost certainly DELIBERATE** — the undo guard exists so a chain is never silently unwound. ⚠️ **But the customer's case is the ordinary one: the mother simply changed her mind and wants to attend.**

## 4. ⚠️ The questions, 🚫 none answered here
1. **Is this the intended refusal, or does a PRE-DECLARED (free, pre-start) leave take a path that should not have produced a chained make-up at all?** ⇒ **SA's to answer from the code.**
2. **"กรุณาแก้ไขด้วยตนเอง" — WHAT, exactly, should she do by hand?** 🔴 **The refusal names no steps.** 🔑 *A refusal that tells the admin to fix it themselves, without saying how, converts our guard into her problem.*
3. **Is this reachable only through the pre-declared path, or through any leave whose make-up is later cancelled?** **Scale unknown.**
4. ⚠️ **Does today's release change ANY of it?** **Porter's reading: NO — nothing in the combined batch touches the undo guard.** ▶️ **SA confirms or corrects.**

## 5. Routing
**The LEAVE machinery is TEAM A's.** ⇒ **Analysis by @Sober.** 🚫 **Not in today's release; she has been told so plainly.**

## 6. Separate ask in the same message — NOT a defect
**She asked for a TIMELINE: finish the front office, then start the backoffice.** 📌 **That is the owner's to answer, not the team's.** 🔑 **Her own earlier instruction was *"ทำหน้าบ้านให้เสร็จเรียบร้อยก่อน ค่อยเริ่มระบบหลัง"*, so she is asking us to say WHEN "เสร็จ" is.**
