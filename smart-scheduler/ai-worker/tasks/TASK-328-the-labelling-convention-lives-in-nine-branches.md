# TASK-328 — the labelling convention lives in nine branches, and the question is whether it CAN move

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-10)
⛔ **HELD — do NOT start until @Tanya's `uat` round is finished and I release it.** ⚠️ **It changes VISIBLE
labels on three messages she is reading on a phone.** 🚫 No migration, no FE change.
**Source: your TASK-325 candidate 4, made concrete by your TASK-327 reframing.** 🔑 **Cut now so it is ready
the minute she is done — not so you start it.**

---

## §1 The property, and its defect history
**`line()` renders `label: value` — the OLD convention. `extra()` and `fieldLines` render `label : value` — the
CUSTOMER'S.** **Each branch picks one BY HAND**, and `reschedule_requested`, `teacher_assigned` and
`teacher_unassigned` still call `line()`.
🔴 **It has already shipped as a defect**: `TASK-257 §3` — *"a message with two labelling conventions is what
put `จำนวนคาบที่ยืนยัน` and `หมายเหตุ` under eight English labels."* ⚠️ **It is asserted for ONE message, in
that task's own test, and not at all for the other thirteen.**
📌 **Two of us have now cited `TASK-257 §3` as settled law this week** — 🔑 *and it holds for one message.*

## §2 🔴 THE ACTUAL QUESTION — and it is yours because you found the frame
**Your TASK-327 answer says the place this belongs is the same exit the trim now occupies.** ⚠️ **I am not
sure that is possible, and I would rather ask than specify it wrongly:**
> ***The trim could live at the exit because it is a WHITESPACE property — it can be applied to a finished
> string without knowing what the string means. A labelling convention may not be that kind of property.***
🚫 **Normalising `label: value` → `label : value` at the exit would rewrite EVERY colon in a finished
message** — **including colons inside the customer's own header strings (`📅CONFIRMED SCHEDULE:`,
`⏱️TODAY'S SCHEDULE:`) and inside a parent's typed `Remark`.** 🔴 **That is not a fix, it is a new defect
class.**
⇒ ❓ **So the question is the one your own distinction poses: *if the invariant cannot live at the narrowest
point, can the HELPER be made COMPULSORY instead?*** 📌 *Your sentence: `line()` is AVAILABLE, not
COMPULSORY — the fifteenth branch can always call `t()` or `line()` instead.*
✅ **Answer that first, in writing, before you change anything. The two candidate shapes I can see:**
1. **`line()` is DELETED** and its three callers move to the customer's convention ⇒ **there is no second
   convention to choose.** ⚠️ *This changes three messages' visible labels — which is why the task is held.*
2. **`line()` stays for a stated reason** and the property is asserted across all fourteen kinds instead ⇒
   **held by a test rather than by construction.** ⚠️ *Weaker, and your own answer says why.*
🔑 **If you find a third, take it.** 🚫 **Do not do both.**

## §3 What must not change
- 🚫 The customer's own header strings and their colons · a human's typed `Remark` · `§7`/`§16d`/`§17c` bytes
  beyond the three messages you name.
- 🚫 `formatOutboxMessage`'s trim (TASK-325) · the omit-empty rules · `(-)` vs absent.
- 🚫 No migration · no FE change · no i18n change **beyond the three messages, and you name them first.**

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)
- [ ] 🔴 **`§2` ANSWERED IN WRITING BEFORE THE CHANGE** — can it live at the narrowest point, or must the
      helper be made compulsory, and which shape you took
- [ ] **Every message whose visible labels change is NAMED, with a before/after line** — ⚠️ *@Porter has to be
      able to hand that list to the owner without reading a diff*
- [ ] 🔑 **The property is asserted across all fourteen kinds**, the way TASK-327's is
- [ ] **TASK-257's own test is UPDATED, not deleted**, and you say how
- [ ] 🔑 **Break it and watch** — ⚠️ **mutation and restore in ONE tool call**, restore verified
      **byte-identical**, per your own TASK-325/327 rule
- [ ] 🚫 **No customer header or typed value had a colon rewritten** — asserted as an absence

## Question
🔑 **You gave me a two-question audit: *what is the narrowest point every message must pass through*, and
*which invariants live there rather than in the branches?*** ⇒ ❓ **Run the second half once, properly:
which invariants of an outbox message live in the BRANCHES today?**
📌 *You have already named four — the trim (moved), no-placeholder (habit in five), the labelling convention
(nine), and the title-belongs-to-a-template distinction.* ⚠️ **I am asking whether that list is COMPLETE, not
for more examples.** 🔑 **A complete list of what lives in the branches is a map of everything this product
holds by habit** — **and I would rather have that map than any single fix on it.**
