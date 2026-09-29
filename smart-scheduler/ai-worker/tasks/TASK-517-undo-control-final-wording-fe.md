# TASK-517 — the Undo control's approved wording: **ย้อน…, not ยกเลิก…**, and the leave case tells the coach — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-27) · **Size XS.** 🔨 **Owner ruling.** Your TASK-514 draft is approved in substance; three things change.

## §0 The ruling, and why your verb moved
**The verb is `ย้อน…`, not `ยกเลิก…`** — because **`ยกเลิก` is the verb of `ยกเลิกการจอง` (cancel booking)**, and the owner asked that Cancel and Undo stay visibly distinct. **Cancel takes a session off the schedule; Undo puts one back.** Two opposite acts sharing a verb is the collision he wants avoided.
📌 **This is not a correction of your judgement — it is a routing failure of mine.** I had already settled `ย้อน…` when I answered @Porter's (a)/(b)/(c) question, **and I never sent that answer to you.** You drafted without it. **Your reasoning for naming the object — that what is undone is the MARK, not the child's having been there — is right and survives: it is why the label says `ย้อนการเข้าเรียน` rather than anything about attendance itself.**

## §1 The approved copy
**Labels by the row's state** (the shape I proposed and he took):
- an ATTENDED row ⇒ **`ย้อนการเข้าเรียน` / `Undo attendance`**
- an ATTENDED row **from a check-in** ⇒ **`ย้อนการเช็คอิน` / `Undo check-in`**
- an ON-LEAVE row ⇒ **`ย้อนการลา` / `Undo leave`**
- anything else ⇒ **no control at all** (not a disabled one)
**The dialog title uses the same verb.** **The body is yours, approved:** *"คาบจะกลับเป็นยืนยัน และคืนคาบเข้าโควตาของลูกค้า ไม่ใช้โควตาลา ไม่เพิ่มคาบชดเชย และไม่มีการแจ้งใคร"*

## §2 🔴 The leave case: the last clause is FALSE there — fix it
**On an undone LEAVE the coach IS told** (TASK-508: *"class on again"*). So *"ไม่มีการแจ้งใคร"* / *"nobody is told"* is **true for the attendance and check-in cases and untrue for the leave one.**
🔑 **This is the same defect as the task you have just finished** — a dialog describing something that does not happen — **so it must not ship in the fix for it.** The leave body says **the coach will be told**; the other two keep "nobody is told".
📌 **Which means the body varies with the row's state exactly as the label does.** One branch, as you built it.

## §3 What does NOT change
- ✅ All five surfaces from **one branch**; every non-Undo row byte-identical; one mutation call. **Your TASK-514 structure stands — this is its words.**
- ✅ **Keep it pinned by SHAPE**, and 🔑 **the shape now has a fourth fact for the leave case: "the coach is told".** A body that says nobody is told on a leave row must fail.
- ✅ **Remove the `📝 DRAFT` markers** for what is now approved — **and keep your mutation that fails when a draft marker is missing on anything still draft.** The marker earned its place; it should not be deleted along with the drafts.
- 🚫 Still no second button. The collision ruling stands: **when the Undo FE lands, this branch becomes that Undo** — that is written into its task.

## Definition of Done
- [ ] `ย้อน…` throughout, **three labels by row state**, no control where there is nothing to undo · the dialog title in the same verb · the approved body, **with the leave case saying the coach IS told** · pinned by shape **including the leave case's fourth fact** · every non-Undo row byte-identical · draft markers removed only where approved, **the marker's own mutation kept** · copy both languages · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that says "nobody is told" on a leave row and one that uses `ยกเลิก` · report here + `inbox/SA.md` + log.


---

## ✅ FOLDED INTO TASK-518 — Fern, 2026-09-27
Per @Sober's instruction ("TASK-517 folds into TASK-518; do not do 517 separately"), everything this task asked for
shipped inside **TASK-518**: the three approved `ย้อน…` labels, the **state-varying body**, and the **fourth fact for the
leave case — the coach IS told** (TASK-508), pinned in both directions and both languages. The draft markers are gone
from the approved copy and **kept on the one line that is still mine (the toast)**, with the marker mutation retained.
📌 Nothing was built for 517 on its own: the control it worded did not exist until TASK-518 — see that task's §2.
