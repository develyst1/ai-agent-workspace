# TASK-537 — a family is never told their MAKE-UP class was cancelled — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size S.** 📌 **My omission: I named this "next" for two turns and never cut the file. You were right to stop and ask rather than build from a sentence in an inbox.**

## §0 The gap
**The family's cancel notice is CONFIRMED-only.** A make-up (`EXTENDED`) is a real class a family is expecting — **and cancelling one tells them nothing.**
🔴 **And after TASK-516 the asymmetry is visible from the outside: we now tell a family their make-up MOVED, and still not that it was CANCELLED.** 🔑 **That is worse than silence in both directions**, because the family has learned that this class is one we send messages about.
📌 **Two rules written at different times, not a decision anyone took** — which is why it is a task and not a proposal.

## §1 🔴 The boundary that must not be crossed, and it is the whole difficulty
**The owner has ruled that an Undo is SILENT to the family** — both for a false check-in (REQ-108 ruling 2) and for a leave (TASK-508: *notify the coach, never the family*). **A leave Undo cancels the make-up the leave created.**
⇒ 🔑 **The family must be told when an ADMIN cancels their make-up, and must NOT be told when an UNDO cancels it.** ⚠️ **Same row, same status change, two different answers — decided by what caused it, not by what happened.**
- **Say how you distinguish them**, and 🔑 **pin both directions by value**: an admin cancelling a make-up ⇒ the family is told · a leave Undo cancelling one ⇒ **nothing to the family** (the coach is still told, TASK-510, unchanged).
- ⚠️ **If the two paths are indistinguishable at the point the notice would fire, STOP and tell me** — that is a real finding and the fix would be structural, not a condition.

## §2 Build
- **The family's cancel notice covers a cancelled `EXTENDED` row**, in the house pattern the owner approved for the move (TASK-529): **English labels, the title following the chat's language, Date and Time on their own lines.**
- 📋 **Propose the words** — both languages — **marked as a draft and pinned by form**, as every new family-facing message has been. 🔑 **It must say which class is off** (the child, the program, the date, the time) **and nothing about why.** ⚠️ **In particular it must not say "make-up" in a way that implies a replacement is coming** — **we do not know that one is**, and a family reading "your extra class is cancelled" will ask what happens to the session it was replacing. **If you think the answer belongs in the message, say so and propose it; do not assume it.**
- **Who:** the family, by the shared household rule — **and cancelled seats excluded**, as TASK-516 settled.
- 🚫 **Nothing about the coach's side changes** (TASK-510 already tells every coach), and 🚫 **nothing about what a cancellation DOES.**

## §3 What must not move
🚫 The CONFIRMED cancel notice, byte-identical · the Undo's silence to the family · TASK-510's coach notices · the move notice.

## Definition of Done
- [ ] The family told when a make-up is cancelled **by an admin**, by value in both languages · **NOT told when an Undo cancels one**, pinned — **and how the two are distinguished, stated** (or **stopped and reported** if they cannot be) · the house pattern followed · 📋 the words **proposed, marked as a draft, pinned by form** · the household rule reused with cancelled seats excluded · §3 pinned unchanged · suite **count** normally **and unreachable** · tsc 0 · 60 = 60 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that tells the family on an Undo, one that silences the admin case, and one that tells a cancelled seat's family · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-28): an admin's cancel of a make-up now tells the family, and a leave Undo still doesn't. The two are told apart STRUCTURALLY, not by a condition. Two findings for you (§4). **3479 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries** · tsc 0 · 60 = 60 · four mutations bite

## §1 🔑 How the two are distinguished (your §1): by which CODE runs, established from the source
- **The admin's cancel** (`updateBookingStatus` → `cancel`) calls **the ONE family sender** (`sendClassCancelledToFamilies` → `classCancelledFamilyAccounts`) with the **pre-write** row. That sender was the CONFIRMED-only gate.
- **A leave Undo** cancels its make-up **inside `undo.service`**, with its own guarded write, and calls **only the COACH sender** (`sendClassCancelledToCoaches`). **It never reaches the family sender.**
- ⇒ Widening the family sender to EXTENDED **cannot** reach an Undo. **No new condition was needed**: the owner's "never the family" is a property of which code runs.
- **Pinned both ways:**
  - **Admin ⇒ told, by value, through the REAL `updateBookingStatus`** (the TASK-497 harness shape): EXTENDED → cancel ⇒ one `makeup_cancelled_parent` row per linked device of the child's household, with the row cancelled and the household asked for the row's child.
  - **Undo ⇒ not told:**
    - by source (`undo.service` names no family sender, no parent kind, and no parent recipient);
    - by behaviour (the real `undoBooking` test over an EXTENDED make-up keeps its "no non-teacher row" assertion; my file pins that the line is still there).

## §2 What it sends
- **A cancelled `EXTENDED` row gets its OWN kind, `makeup_cancelled_parent`**, in **the ONE sender**, with **the same household rule** (`familyAccountsOfRow`: cancelled seats excluded, pinned with a GROUP make-up row).
- The payload carries **nothing about why** (no `cancelReason`).
- 🚫 **The CONFIRMED notice is byte-identical** (payload pinned by value through the real cancel; PENDING still tells nobody).
- **Why its own kind:** the CONFIRMED notice ends with a `Note` chosen **by the course's SHAPE**: *"ระบบเพิ่มคาบชดเชยให้แล้ว / A make-up session has been added"*.
  - For a make-up, that line is **exactly the promise you warned about**.
  - And it can be **false**: the admin's cancel re-runs the course plan, which **usually** appends a new make-up but **doesn't** on an ended course, at the extension ceiling, or under a locked leave.
  - So the new kind has **no Note** (pinned, and a mutation adding it BITES).

## §3 📋 The words: 📖 DRAFT, shipped, pinned by FORM
```
❌ ยกเลิกคาบเรียน:            ❌ CLASS CANCELLED:
Student : มะขิด               (the same four lines, English labels)
Program : Freeskate 4 HR
Date : 30-10-2026
Time : 10:00-11:00
```
- ⭐ **My proposal is deliberately the SAME title as the approved cancel notice** (its own key, `mc_title`, so the owner can make it differ).
  - Naming it "make-up" / "ชดเชย" invites *"so is another one coming?"*, and the message can't answer that truthfully.
  - The date and time already say **which** class is off.
- It follows the house pattern (TASK-529): the title in the chat's language, English labels, Date and Time on their own lines, no Coach, no Reason, and (above) no Note. Pinned.
- 📌 **The family's natural question: "what happens to the session it was replacing?"** The honest answer depends on what the re-plan **actually did**, not on the course's shape.
  - **If the owner wants it answered, I propose (NOT built):** a Note only when the re-plan **actually appended** a row, naming its date, e.g. *"ระบบเพิ่มคาบชดเชยใหม่ วันที่ {date}"*.
  - That needs his words, plus a small plumb of the re-plan's result into the payload.
  - Alternative wording if he wants the make-up named: *"❌ ยกเลิกคาบชดเชย:" / "❌ MAKE-UP CANCELLED:"*. I don't recommend it without that Note.

## §4 ⚠️ Two findings: yours to rule
1. 🔴 **An admin's cancel of a make-up tells NO COACH.**
   - The admin path's coach notice is `sendClassCancelledToTeacher`, **gated CONFIRMED-only** (TASK-370). TASK-510 covers the *Undo's* make-up and the *CONFIRMED* admin cancel, **not an admin cancelling an EXTENDED row**.
   - ⇒ **After this task, for the same admin act, the FAMILY is told and the COACH (who has it on their week) is not.**
   - 🚫 **Not changed:** §2 says the coach side doesn't move. It's a one-line gate (EXTENDED beside CONFIRMED, the same words) if you rule it in.
2. **The ONE family sender has three callers, so the widening reaches all three, by design:**
   - the admin's cancel;
   - **a coach's OWN leave** (`reportOwnLeave` cancels live rows, **EXTENDED included**; the family is now told their make-up is off because the coach is on leave);
   - the OTHER-series cancel-all (GROUP rows).
   - None is an Undo; each is a real cancellation a family holding the class would want to know about.
   - I kept **one rule, not a second gate** (TASK-410: "one sender for both producers").
   - If you want the coach's-leave case to stay silent, **say so**: that would be a structural split, not a condition.

## §5 Existing pins honestly moved (counts only, each commented `🔻 TASK-537`)
- The message-kind walkers 28 → **29** (three files) and the renderer's `case` count 28 → **29** (two).
- `enqueueParentCopies` calls 5 → **6** (the make-up branch).
- The sender's gate line now names EXTENDED.

## §6 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=45)
- **U: the family told on a leave UNDO:** **BITES**.
  - Honestly, two ways: my source pin, **and** the Undo harness's tests, whose fakes can't answer a family read. So it's caught, partly by a crash rather than only by the "never the family" assertion.
- **A: the admin case silenced** (the gate back to CONFIRMED-only): **BITES**.
- **S: a cancelled seat's family told:** **BITES**.
- **N: the make-up notice promising a replacement** (the shape-chosen Note added): BITES.

⛔ Only you mark this DONE. The words and §4 are yours / the owner's.

---

# ✅ REVIEWED by @Sober (2026-09-28) — 🔨 **finding 1 ruled IN as an addendum; finding 2 accepted as built.** The words go to the owner.
Verified: **3479 pass / 0 fail normally AND with the database unreachable** · tsc 0 · 60 = 60.

## 🔑 §1 is the best answer he could have given: the two are told apart STRUCTURALLY
I asked *"how do you distinguish them"* and warned that **if the two paths were indistinguishable where the notice fires, that would be structural.** ✅ **They are distinguishable because they are different code:** the admin's cancel calls **the one family sender**; the leave Undo cancels its make-up **inside `undo.service` and calls only the coach sender** — **it never reaches the family sender at all.**
⇒ 🔑 **"Widening the family sender to EXTENDED cannot reach an Undo. No new condition was needed: the owner's 'never the family' is a property of which code runs."** 📌 **That is the difference between a rule enforced by a branch and a rule enforced by the shape of the call graph** — and it means the next person cannot accidentally hand the Undo a family recipient.

## ✅ The wording trap: he answered it by NOT naming the thing
I warned that the message must not imply a replacement is coming. **His solution is to use the same title as the approved cancel notice and never say "make-up" at all** — *"naming it invites 'so is another one coming?', and the message can't answer that truthfully; the date and time already say WHICH class is off."* 🔑 **Better than the caveat I asked for: a sentence that cannot raise the question does not need to answer it.**
🔴 **And the reason the new kind exists at all is the sharpest catch in the report:** the CONFIRMED notice ends with *"a make-up session has been added"*, **chosen by the course's SHAPE** — ⇒ **on a cancelled make-up that line is the exact false promise**, *and it can be false anyway* (the re-plan does not append on an ended course, at the ceiling, or under a locked leave). **So the new kind has no Note, and a mutation adding it bites.**
📋 **To the owner:** the draft, **plus his option of a Note only when the re-plan ACTUALLY appended a row, naming its date** — **which is the honest answer to "what happens to the class it was replacing", and the only one that cannot lie.**

## 🔨 Finding 1: **ruled IN. Add the coach's side in this task.**
**An admin cancelling a make-up tells the family and NOT the coach** — the coach gate is still CONFIRMED-only.
⚠️ **My §2 said the coach side does not move, and that was written before I knew this.** 🔑 **Shipping "for the same admin act, the family is told and the coach who has it on their week is not" is worse than either alone** — and it is **the exact asymmetry this task exists to remove**, recreated one audience over. **One line, the same words, EXTENDED beside CONFIRMED. Pin both audiences on one admin cancel.**

## ✅ Finding 2: **accepted as built — one rule, not a second gate.**
The widening also reaches **a coach's own leave** and **the OTHER-series cancel-all**. ✅ **Both are real cancellations of a class the family is holding**, so **they should be told** — and 🔑 **keeping one sender rather than adding a gate per caller is what has kept this area coherent** (TASK-410's rule). **A split would need a reason, and there is not one.**

---

# ✅ ADDENDUM — @Jason (2026-09-28): finding 1 built as ruled. BOTH audiences on ONE admin cancel · **3481 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries** · tsc 0 · 60 = 60

- **The one line:** `sendClassCancelledToTeacher` now gates **CONFIRMED or EXTENDED**; the words are unchanged. **A PENDING row still tells no coach.**
- **Pinned on ONE admin cancel of a make-up, through the real `updateBookingStatus`:**
  - **every coach of the make-up** (`class_cancelled_teacher`, both coaches, via THE predicate) **AND the family** (`makeup_cancelled_parent`);
  - neither without the other;
  - a PENDING make-up tells **neither**.
- **Two existing pins moved, same claim:** the TASK-370 gate pin (`teacher-told-on-cancel-req089`) and the OTHER-series pin (*"a PENDING row's cancel tells no coach"*, still true) now name the new gate line.
- **Break-and-watch** (CHECKSUM identical, restores byte-identical, BASELINE=27):
  - **C: the coach silenced again** (family told, coach not): **BITES**;
  - **P: the gate opened too wide** (a PENDING make-up tells the coach): **BITES**.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28) — the addendum landed
Verified: **3481 pass / 0 fail normally AND with the database unreachable** · tsc 0 · 60 = 60.
✅ **One admin make-up cancel now reaches every coach AND the family, pinned together through the real cancel** — **together** being the point: the two audiences were the asymmetry, so a pin that covers one of them would have left the door open.
✅ **A PENDING make-up still tells neither**, which is the existing rule applied rather than re-decided — and **both mutations bite** (the coach silenced again; PENDING let through).
📌 **TASK-537 is complete.** Its lasting output is not the message: it is that **"never tell the family on an Undo" is now guaranteed by which code runs rather than by a condition anyone has to preserve**, and that **a closing line chosen by a course's SHAPE rather than by what happened is gone from the one place it would have been a lie.**
