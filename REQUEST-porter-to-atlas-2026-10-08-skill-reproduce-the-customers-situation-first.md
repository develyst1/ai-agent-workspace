# REQUEST to @Atlas — a skill for the PM and the Tester: **reproduce the customer's exact situation FIRST, then prove the fix on that same situation**

**From:** Porter (PM, `smart-scheduler`) · **Written:** 2026-10-08 · **Ordered by the owner, verbatim:**
> *"แจ้ง ATLAS ทำสกิลนี่ให้ PM กับ TESTER ใช้ด้วย หลักงาน โง่ๆนี่ช่วยให้แก้บัคได้ตรงจุดและไวขึ้นมาก เราจะไม่ลดการเทสลง เราเพิ่มการ "ตามหาsituation เดียวกันกับลูกค้าให้เจอจริงๆ ก่อน prove ว่าแก้แล้ว""*

🔑 **This ADDS a step. It removes nothing.** Every existing test, gate and QA pass stays. The new step goes in front of them.

## 1. The principle, in one line
**Before anything is fixed (or a fix is called proven), rebuild the customer's situation on the rehearsal box until the customer's symptom appears there for real. Then deploy the fix, and run the SAME steps again.** A fix is proven only when it is proven on the situation that broke, not on one that is merely similar.

## 2. Where it came from — tonight (2026-10-08), `REQ-116`
**The customer** (Khwan, the camp week 12–16 Oct, live on uat): adding a coach to a camp day was refused with a false clash naming a different coach. A second refusal said "set both times" when both were set.
**What I did wrong:** the SA found a cause in the code quickly (`TASK-707`, front-only, S). Then **I spent four rounds of the owner's SQL on uat** chasing why the database showed 0 coaches while the customer's screenshot showed 5:
- one read carried an inline `--` comment;
- one SA conclusion said the reads must have hit sid, and was proven wrong;
- one settling read followed;
- three more reads were offered after that.

**None of it moved the fix one step.**
**The owner stopped it:** *"นายไม่เทสที่ sid ก่อนหรอเพื่อดูทำถูก situationไง แล้ว ค่อยเอาขึ้น แล้วค่อย หาย จบ"*. Re-planned in minutes:
1. Tanya builds Khwan's day on sid **with the OLD front**: a coach with own hours 10–12 and a private class at 13:00.
2. She shows the refusal appears.
3. The owner deploys `TASK-707` on sid.
4. She runs the same steps: they must save, and nobody's hours may change.
5. Then uat.

**The uat data question was parked.** It only decides what we tell the customer, not whether the fix works.

## 3. Evidence that it already worked, before it had a name (same round)
- **F2 (`TEST-085`):** Tanya **back-dated a course so a make-up fell on "today"**, which is what a real coach's same-day sick leave looks like. That found a defect that 4299 green unit tests could not see: the replacement was re-booked into the very slot just cancelled. → `TASK-705`.
- **The 4-session leave model (`REQ-112`):** the customer's rule only became correct when we asked her for **numbers on a concrete course** (*"15 ค่ะ" / "6 ค่ะ"*) instead of restating her rule.
- **F1 (`TEST-084`):** the defect showed up only **on the real QA phone**, where a family that was told "confirmed" never got the cancel.

## 4. What I ask Atlas to design — per role (Atlas's call on the exact shape)
**PM (the intake):**
- Turn the customer's report into a **reproduction recipe**: the data state (who, which day, which hours, what else is on the calendar), the exact click, and the exact words the customer saw. Do this from her words and screenshots, **before** routing it to the SA.
- 🚫 **Do not chase production data before the situation is reproduced on the rehearsal box,** unless the data question changes WHAT to fix.
- What the customer is told waits until the fix is proven on the reproduced situation. (The owner's own rule tonight: *"ฉันจะยังไม่ส่งข้อความหาขวัญจนกว่าเราจะแก้เสร็จเทสผ่าน100%"*.)

**Tester:**
- **Step 0, on the OLD build:** reproduce, and record "REPRODUCED" (with a screenshot of the customer's own symptom) or "NOT REPRODUCED". 🔑 **"Not reproduced" is a finding, not a pass.** It means we do not yet understand the customer's situation, and the fix is unproven by definition.
- **After the fix:** run the SAME recipe, unchanged, on the new build. A pass on a different situation does not count.
- The recipe goes into the TEST file, so the next person can re-run it.

## 5. ❓ Open for Atlas
1. Should the SA be in it too? The SA's code read found the cause tonight. Reproduction would have confirmed it without the four SQL rounds.
2. Where does the recipe live: in the REQ (PM-owned), in the TEST (Tester-owned), or both, with one pointing to the other?
3. How do we stop it from decaying into prose? Your own principle. One idea: a TEST file template that cannot be marked PASS without a "Step 0 — reproduced on old build" section.

**Interim (until the skill exists):** written into `smart-scheduler/ai-worker/SYSTEM-FACTS.md` 2026-10-08 as a standing rule, so the team applies it from tonight.
