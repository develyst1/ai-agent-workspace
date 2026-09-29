# TASK-514 — 🔴 the button that undoes an attendance is labelled "Sick leave" and its dialog describes something that no longer happens — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-27) · **Size S.** Found by @Jason while building TASK-497. ⚠️ **Parent-of-the-decision: the final words are the owner's** — Porter has them; §3 says what to do meanwhile.

## §0 What happened
TASK-497 changed what "undo a mistaken attendance" **does**: the session now goes back to **CONFIRMED**, the entitlement returns, **no leave quota is charged, no make-up is created, and nobody is messaged.**
**The screen still describes the old behaviour.** On an **ATTENDED** row, `BookingModal`'s **"Sick leave"** button:
- is **labelled** as a sick leave, which this action is not;
- opens a dialog saying it **consumes the family's quota** and **appends a make-up class** — **neither is true any more**;
- finishes with a toast saying **leave saved**.

## §1 Why this is not cosmetic, and why it is S rather than XS
🔑 **An admin who reads that dialog will not press the button.** They are told it will spend a family's limited leave allowance to correct **their own** mistake — so the honest ones will leave the wrong record standing, and the ones who press it will believe they have just cost a family a leave.
📌 **We fixed the record and left the screen saying the old thing. The correction we just built is one nobody will dare use.** That is the failure, and it is the same shape as TASK-483's camp page: **the backend behaved correctly and the product still misled the person using it.**

## §2 Build
- **On an ATTENDED row**, the control says what it now does: **undo the attendance**. The dialog explains the real consequences — **the session returns to confirmed, the class comes back to the family's balance, no leave is used, and nobody is told.** The toast matches.
- 🔑 **Only the ATTENDED case changes.** On any other row, "Sick leave" is still a sick leave and must be **byte-identical** — pin it. **This is a control whose meaning depends on the row's state**, which is precisely the shape I asked @Porter to keep for the Undo family: **the label names what will happen to THIS row.**
- **Check whether this is the same control the Undo work will surface** (TASK-492's `ย้อนกลับ` family). 🔑 **If an admin ends up with two buttons that both undo an attendance, that is worse than the wrong label** — say what you find, and **do not build a second one**; I will rule.
- Copy counted, both languages. 🚫 No BE change; the behaviour is already correct.

## §3 The words
**The final wording is the owner's** — it is with @Porter alongside two other pending messages. **Do not wait for it:** build with your own clear draft, **mark it as a draft in the code** (as @Jason did for the coach stamp), and **pin it by shape rather than by exact text** so his answer is a one-line change. **Tell me your draft in the report** and I will put it in front of him with the rest.

## Definition of Done
- [ ] The ATTENDED case labelled and explained by what it **actually does**, dialog and toast agreeing · **every other row's "Sick leave" byte-identical**, pinned · whether this control collides with the Undo family **reported, not resolved** · the draft wording marked as a draft and pinned **by shape** · copy both languages · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that restores the quota/make-up sentence on an ATTENDED row and one that changes a non-ATTENDED row's dialog · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-27. **The button now says what it does to THIS row — and the Undo collision is real; I did not build a second one.**

```
bunx tsc --noEmit → exit 0
bun test          →  614 pass / 0 fail   (was 609; +5 — new lib/scheduler/undo-attended-label.test.ts)
bun run build     → ok
git status        →  2 source modified (BookingModal · dictionaries) · 1 new test
```
🚫 No BE change — the behaviour was already correct. 🚫 No deploy asked.

### `§1` — one control, one branch
`const undoing = booking.status === "ATTENDED"` chooses **the menu label, the dialog title, the dialog sentence, the
confirm button and the toast** — all five in one branch, so the failure this task exists to fix cannot recur in halves
(each half mutated on its own fails: 1, 3, 4, 5). The row's state is the only input; a mutation that widens `undoing` to
every non-SICK_LEAVE row fails (2).

### 🔑 Every other row is byte-identical
The leave copy is unchanged in both languages (`leaveTitle`, `leaveMsg`, `sickLeaveBtn` pinned by exact text), there is
still **ONE `sickLeave.mutateAsync` call** for both cases — no second mutation, no second endpoint (mutation 9 splits it
and fails) — and the override · locked · make-up toasts are the leave path's, untouched.

### 📝 My draft wording (the owner's final words replace it; marked `📝 DRAFT (Fern, TASK-514)` in the dictionary ×4)
| where | EN (draft) | TH (draft) |
|---|---|---|
| menu label + confirm | **Undo attendance** | **ยกเลิกการเช็คอิน** |
| dialog title | **Undo this attendance?** | **ยกเลิกการเช็คอินคาบนี้?** |
| dialog sentence | **The session goes back to confirmed and the class returns to the family's balance. No leave is used, no make-up is added, and nobody is told.** | **คาบจะกลับเป็นยืนยันแล้ว และคืนคาบเข้าโควตาของลูกค้า ไม่ใช้โควตาลา ไม่เพิ่มคาบชดเชย และไม่มีการแจ้งใคร** |
| toast | **Attendance undone** | **ยกเลิกการเช็คอินแล้ว** |
**Pinned BY SHAPE, not by text:** the sentence must carry the four facts (what the row becomes · the class returns · no
leave · no make-up · nobody told) in both languages, and must **not** repeat either old promise. So the owner can rewrite
every word and the test still holds — while a change that quietly drops "no leave is used" fails (mutations 6, 7).
📌 Two words I chose deliberately, for him to overrule: Thai says **ยกเลิกการเช็คอิน** ("cancel the check-in") rather than
*ยกเลิกการมาเรียน*, because what is being undone is the MARK, not the child's having been there; and the sentence ends
with **ไม่มีการแจ้งใคร**, because the first question an admin asks before pressing is whether the family gets a message.

### 🔎 The Undo collision — reported, NOT resolved (your call)
**It is a real collision.** TASK-492's Undo family lists exactly this row: *`ATTENDED` from a check-in ⇒ CONFIRMED ·
credit returned · re-hold the hour · no message*, which is **the same real-world act** this control now performs on an
ATTENDED row (TASK-497). What I found in the repo and the tasks:
- There is **no FE task for the Undo family yet** — nothing in `tasks/` gives `ย้อนกลับ` a surface, so today there is exactly
  ONE button for this act and it is the one I just relabelled. **No second button was built.**
- The two differ in one respect worth your ruling: **TASK-492's Undo re-holds the coach's hour and can REFUSE, naming the
  obstacle** (the hour re-booked, and by whom); **this path cannot refuse that way** — it goes through the existing
  sick-leave mutation, which knows nothing about re-holding. So they are the same act with different safety.
- **My recommendation, for you to accept or reject:** when the Undo FE lands, **this control's ATTENDED branch should
  become that Undo** (one act, one door, the stronger safety) rather than living beside it — and if that is the plan, the
  draft words above are the ones to give `ย้อนกลับ` on an ATTENDED row, so the label never changes meaning twice.
- ⚠️ Until then an admin has one honest button. **If the Undo FE ships a second one without this branch being removed,
  that is the "two buttons that both undo an attendance" you warned about** — it needs to be one task's job, not two.

### 🔑 Break-and-watch — nine, `try/finally`, checksum, `BASELINE=0` on a GREEN suite
| # | mutation | result |
|---|---|---|
| 1 | the quota/make-up sentence comes back on an ATTENDED row | **1 fail** |
| 2 | a NON-attended row is given the undo dialog (the leave warning lost) | **1 fail** |
| 3 | the label says sick leave on an ATTENDED row | **1 fail** |
| 4 | the toast still says "leave saved" after an undo | **1 fail** |
| 5 | the confirm button keeps the leave label | **1 fail** |
| 6 | the undo sentence drops "no leave is used" | **1 fail** |
| 7 | the Thai undo sentence keeps the old quota promise | **1 fail** |
| 8 | the DRAFT marker is removed (a draft mistaken for approved copy) | **1 fail** |
| 9 | the undo becomes a second mutation (two paths for one act) | **1 fail** |
`md5` identical on the two mutated files.

### Definition of Done
- [x] The ATTENDED case labelled and explained by what it **actually does** — dialog, confirm and toast agreeing, from one branch
- [x] **Every other row's "Sick leave" byte-identical**, pinned · the collision **reported, not resolved**
- [x] The draft marked as a draft and pinned **by shape** · copy +4 both languages · **614 / 0** · `tsc` 0 · build ok
- [x] 🔑 Nine mutations, `BASELINE=0`, `finally`, checksum — incl. restoring the quota sentence and changing a non-ATTENDED row

### ⚠️ Not seen on a screen
For @Tanya: open an **ATTENDED** session ⇒ the ⋯ menu reads **ยกเลิกการเช็คอิน** (not บันทึกลา/ป่วย); press it ⇒ the dialog
says the class comes back and **no leave is used, no make-up, nobody told**; confirm ⇒ the toast says
**ยกเลิกการเช็คอินแล้ว** and the row is CONFIRMED again with the class back in the balance. Then open a **CONFIRMED** (or
PENDING) session ⇒ the menu still reads **บันทึกลา/ป่วย** and its dialog still warns about the quota and the make-up,
word for word as before — that half must look untouched.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified: **614 pass / 0 fail** · tsc 0 · build ok.

🔑 **All five surfaces come from ONE branch** — menu label, dialog title, dialog sentence, confirm button, toast — **so the failure this task exists to fix cannot recur in halves**, and each half mutated alone fails. That is the correct reading of the defect: it was not five wrong strings, it was **five strings that could disagree**.
✅ **Every other row byte-identical, and ONE mutation call for both cases** — no second endpoint, no second path (mutation 9 splits it and fails). **A relabelling task that quietly forks the action would be worse than the label.**
🔑 **Pinned BY SHAPE and the shape is the right one:** the sentence must carry the four facts and **must not repeat either old promise** ⇒ **the owner can rewrite every word and the test holds, while a rewrite that quietly drops "no leave is used" fails.** That is exactly what "pin the draft by shape" was for, done better than I specified.
✅ **And a mutation for the DRAFT MARKER itself** (8): a draft mistaken for approved copy now fails the suite. **I have been asking engineers to mark drafts all week; she made the marker load-bearing.**
📌 **Her two deliberate Thai choices are the sort of thing I want surfaced for the owner rather than buried:** `ยกเลิกการเช็คอิน` because **what is undone is the MARK, not the child's having been there**; and ending on `ไม่มีการแจ้งใคร` because **that is the first question an admin asks before pressing.** Both go up with the wording.

## 🔨 Ruling on the collision: **accepted — and it becomes a constraint on the Undo FE task, not a follow-up**
She established there is **no FE task for the Undo family yet**, so **today there is exactly one button for this act and it is the one she relabelled.** ✅ **No second one was built, which is what I asked.**
**Her recommendation is right and I am adopting it:** when the Undo FE lands, **this control's ATTENDED branch becomes that Undo** — one act, one door, **and the stronger safety**, because TASK-492's Undo re-holds the coach's hour and can **refuse while naming the obstacle**, which this path cannot. 🔑 **Two buttons for one act, with different safety, is worse than either alone**, and her words become `ย้อนกลับ`'s words on an ATTENDED row **so the label never changes meaning twice.**
⇒ **Written into the Undo FE task's definition when I cut it: removing this branch is part of that task, not a tidy-up afterwards.** 📌 **The warning I gave her — "two buttons that both undo an attendance is worse than one wrong label" — is now the other task's problem to avoid, which is where it belongs.**
