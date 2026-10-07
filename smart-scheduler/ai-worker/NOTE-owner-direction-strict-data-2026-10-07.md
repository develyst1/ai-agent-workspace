# OWNER DIRECTION — **be STRICT on data entry; give bad data a named escape, not a silent one** (2026-10-07)
> **"เล่นไม้แข็ง เพื่อให้ระบบเป็นระบบมากขึ้น · ระบบต้องเป็นยังไง เราต้องทำตามให้ได้ · เราอาจจะทำเพิ่มตัวเลือกว่า 'ยังไม่ระบุ' ให้กับพวกครอบครัวที่ทำข้อมูลแย่ ๆ แบบนี้ ให้ admin เขาไปไล่แก้เอง"**
🚫 **NOT sized, NOT cut, NOT in this round.** **Recorded the moment it was said, because it is a standing direction and not a task.**

## What it says
1. 🔴 **The product sets the shape; people follow it.** 🚫 The opposite of accepting whatever arrives and compensating later.
2. **Bad or missing data gets a NAMED state — `ยังไม่ระบุ` — not an empty field and not a silent skip.**
3. **An admin then chases it.** ⇒ **the named state has to be FINDABLE, or it is the same as empty.**

## 🔑 Why this is already the lesson of this whole round
**Every expensive defect of the last two weeks was the SAME shape: data allowed in without a name, discovered later by a customer.**
- **a child born with no parent** — nullable `parent_id`, no screen could set one ⇒ the bot told a mother *"ยังไม่มีคอร์สที่ใช้งานอยู่ค่ะ"* while her child's new 10-session course sat on an unreachable record;
- **a student record used as a LABEL** (`ISB (ECA)`) — nothing forbade it, so it became data;
- **47 live sentences with no recorded approval** — a string could ship without anyone naming it as unapproved.
🔑 ***In every case the system accepted something unnamed, and a person found out downstream.*** **"เล่นไม้แข็ง" is the general form of the fix we have been applying one defect at a time.**

## ⚠️ The condition that makes it work, and it is not optional
**A named escape with no list is worse than a refusal**, because it looks handled.
📌 **We already built the pattern this round:** `GET /students?noParent=true` + the People filter + the per-row archive/restore. ⇒ **`ยังไม่ระบุ` needs its own filtered list, or it becomes the next silent backlog.** 🔑 *The no-parent list exists because 18 children had been unnamed for months and nobody could see them.*

## ▶️ Open, for the owner, when the round is closed
1. **Which fields get `ยังไม่ระบุ`?** (his words were about the LINE registration ADDRESS: province · district · sub-district)
2. **Which fields instead become REQUIRED** — *"เล่นไม้แข็ง"* implies some should refuse outright, as the parent phone now does (`TASK-644`).
3. **Where does the admin see what is unnamed?** ⭐ **Reuse the no-parent list's shape — 🚫 do not invent a second one.**
📌 **@Porter did NOT ask the team to size any of this. It is one line in the next round's list.**
