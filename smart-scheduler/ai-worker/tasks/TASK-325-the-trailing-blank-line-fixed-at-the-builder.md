# TASK-325 — the trailing blank line, fixed where messages are BUILT (`REQ-085 §16.3`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-10)
🔴 **The LAST item in the owner's `uat` batch, and the ONLY one still open.** 🚫 No migration, no FE change,
**no copy change of any kind.**
🔻 **This is open because I ticked it off without dispatching it. It is not late for any reason on your side.**

---

## §1 The state, counted rather than described
**`.trimEnd()` appears FIVE times in `line-message.ts` — once per branch. `formatOutboxMessage` has FOURTEEN
`case`s. There is NO trim at the builder.**
| | |
|---|---|
| branches that trim | **5** — `course_confirmed` · `course_deduction` · `reschedule_requested` · `sick_leave` · `teacher_unassigned` |
| branches that do not | 🔴 **9** |
| a trim at the builder | 🔴 **none** |

⇒ 🔑 **This is exactly the shape @Porter ruled against:** *"reproduced on TWO different messages ⇒ fix where
messages are BUILT, not per message."* 📌 **Nine messages are clean or dirty today by accident of which branch
someone happened to trim.**

## §2 What to do
✅ **ONE trim, at `formatOutboxMessage`'s exit** — every branch's return passes through it.
❓ **And then decide the five: do the per-branch `.trimEnd()`s come OUT?**
📌 **My reading: yes.** 🔑 **TASK-314's lesson is that two writers of one rule is the class we keep paying
for** — *and a redundant trim is a second writer that agrees today.* ⚠️ **But say it rather than assume it, and
if you think leaving them is safer, the reason will be one I want.**
🚫 **Do not change any message's TEXT.** ✅ **The only byte this task may change is a trailing one.**

## §3 🔴 THE HARD PART, and it is the pins — not the trim
**`§7`'s messages are BYTE-PINNED, and the pins fall into two groups that look identical:**
1. **Pins that pass because their branch ALREADY trims** ⇒ ✅ **unaffected.**
2. 🔴 **Pins on the nine that do NOT trim** ⇒ **their expected string may carry a trailing newline today, and
   after this it will not.**
⚠️ **Those will fail, and the fix is to update them — BUT:** 🔑 **you must tell apart a pin whose trailing
newline was an ARTEFACT from one where it was DELIBERATE.** 📌 *A message that deliberately ends with a blank
line before a quick-reply block would be a real property, and I do not know whether any does — that is the
thing to find out rather than assume.*
✅ **Say how many pins changed, and name any where the trailing whitespace turned out to be intentional.**
🚫 **`§17c`'s screens are LANGUAGE-INVARIANT full-entry pins (TASK-310)** — ⚠️ **if any of them shift, that is
worth a sentence, because those are the customer's own bytes.**

## §4 What must not change
- 🚫 Every message's TEXT · the field blocks · `renderFieldBlock` · the omit-empty rules · `(-)` vs absent.
- 🚫 The quick-reply blocks and the 20-char label cap · `§16d`/`§16g`'s new strings (they just landed).
- 🚫 No migration · no FE change · no i18n change.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean (**`bunx --package typescript@5.6.3 tsc
      --noEmit` in this repo**) · 🚫 no migration (**35 = 35**)
- [ ] ✅ **ONE trim at the builder** — asserted, ⚠️ **and asserted as an ABSENCE per branch if you removed the
      five**, so a future branch cannot re-add its own
- [ ] 🔑 **NO message ends in whitespace — asserted ACROSS ALL FOURTEEN kinds**, ⚠️ *not fourteen separate pins;
      one property, one assertion — that is the whole point of fixing it at the builder*
- [ ] 🔴 **Every changed pin NAMED and COUNTED**, and 🔑 **any deliberate trailing whitespace found is reported,
      not deleted**
- [ ] **`§17c`'s full-entry pins: say whether any moved**
- [ ] 🔑 **Break it and watch** — ⚠️ **verify the restore by READING the line**
- [ ] 🚫 **No message text changed** — asserted

## Question
🔑 **This is the only item in the batch that changes EVERY message, and the reason it was reported twice by the
customer is that it was never one message's bug.**
⇒ ❓ **What OTHER properties belong to all fourteen and are currently asserted fourteen times — or not at
all?** 📌 *Candidates I can see from outside: nothing ends in whitespace; every message has a title line; no
message renders an empty label; no message mixes labelling conventions (`TASK-257 §3`).*
⚠️ **Name them; fix nothing.** 🔑 **If a property is real and we assert it per-message, then it holds by
fourteen coincidences rather than by construction — and that is the same sentence as this whole batch, one
level up.**
