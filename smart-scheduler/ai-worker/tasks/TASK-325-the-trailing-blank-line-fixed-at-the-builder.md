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

---

## ✅ RESULT 2026-09-10 — @Jason. **1983 pass / 0 fail**, 159 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change, **no copy change.**
New: `src/lib/message-trailing-req085-16-3.test.ts`.

- [x] ✅ **ONE trim at the builder** — and the five per-branch ones are GONE, **asserted as an absence on the
      switch body** so a new branch cannot re-add its own
- [x] 🔑 **NO message ends in whitespace — ONE assertion, ALL FOURTEEN kinds**, both languages, both audiences,
      fields present and absent, plus a kind nobody has written yet
- [x] 🔴 **SEVEN pins changed, every one an ARTEFACT — and I MEASURED it rather than inferring** (below)
- [x] **`§17c`'s full-entry pins did NOT move** — they are i18n strings, not builder output
- [x] 🚫 **No message text changed** — asserted
- [x] 🔑 **Break it and watch** — the trim removed → **3 fail**, led by the all-kinds property; restored,
      **verified by READING the line**

---

## 🔴 READ THIS FIRST — **commit `0d91b4d` CAPTURED MY MUTATED LINE.** The working tree is correct; the commit is not.

**`git show 0d91b4d:src/lib/line-message.ts` contains:**
```
  return buildOutboxMessage(payload, ctx, lang, recipientType); // MUTATED
```
⇒ **the committed build has NO trim — `§16.3` is not fixed in it.** ✅ **My working tree is correct and green
(1983/0); `git diff HEAD` is exactly that one line.**
🚫 **I have not committed, amended or reset anything — git is the human's alone.** ⇒ **it needs one fresh commit
from him, and the content is already sitting in the tree.**

### 🔑 The finding, and it is new — yesterday's rule does not cover it
**My break-and-watch window is a window in which someone else may commit.** ⚠️ *"Verify the restore by READING
the line"* protects MY state and it worked exactly as intended — **it did not, and cannot, protect a commit
taken by another actor between the mutation and the restore.**
📌 **Two Bash calls apart. That is the whole exposure**, and the commit landed inside it (08:43:05, and the file
carries my restore at 08:42 in the tree but not in the commit).
✅ **Two things made it detectable rather than silent, and both were already there:** **the commit contains the
very test that catches it** (`message-trailing-req085-16-3.test.ts` went in the same commit) ⇒ **a suite run on
`0d91b4d` fails 3** — and the mutation marker `// MUTATED` is in the committed source, greppable.
⚠️ **Neither would have saved a mutation that did not carry a marker.**
🔑 **What I will do from here, and it costs nothing:** **the mutation and its restore go in ONE tool call.** The
window becomes zero rather than "short". 📌 *I had already been reading the line back; the gap was that the
reading and the breaking were two separate moments in wall-clock time, and the tree is shared.*

---

## §3 ✅ SEVEN pins changed. **ZERO were deliberate — and that is measured, not assumed.**
You asked me to tell an ARTEFACT trailing newline from a DELIBERATE one rather than assume. ⇒ I rendered **all
fourteen kinds against the PRE-CHANGE builder** (`git show HEAD:` into a scratch module) and read the actual
trailing whitespace of each:
| kind | trailing before |
|---|---|
| **`booking_confirmed`** (`§7.3`) | **`"\n"`** |
| **`leave_notice`** (`§16d`) | **`"\n"`** |
| the other twelve | **(none)** |
🔑 **Exactly TWO of fourteen had it, both a SINGLE `\n`, never `\n\n`.** ⇒ **nothing anywhere ended in a
deliberate blank line**, and every one of the seven pins was the same artefact: `renderFieldBlock` ends every
line with a newline, so the LAST field left one behind. **Nothing to report as intentional.**

### 📌 And the measurement answered a question nobody had asked — WHICH message the customer photographed
**`course_confirmed` (`§7.1`) was NOT one of the two** — its branch was already among the five that trimmed.
⇒ 🔑 **the `📅CONFIRMED SCHEDULE` with the blank line under it was the PER-SESSION message (`§7.3`), not the
course-wide one.** **Both open with `ob_course_title`, so their report could not distinguish them and neither
could we by reading.** ⚠️ It also explains the two reports: `§7.3` **and** the leave notice were the only two
with the artefact, and those are exactly the two they named (*"ติดช่องข้างล่างไปเหมือนกัน"*). **Their two reports
were the COMPLETE list, not a sample.**

**The seven, by file:** `leave-notice-req085-16d.test.ts` ×1 · `leave-notice-req085.test.ts` ×3 ·
`session-confirmed-req085.test.ts` ×2 · `line-message-fields.test.ts` ×1. **Each lost one trailing `\n`; the
bytes above it are untouched.**

## §2 ✅ The five come OUT — your reading, and I agree for the reason you gave plus one
**A redundant trim is a second writer that agrees today** (TASK-314). ➕ **And it teaches:** five branches
carrying one is how the next branch's author concludes that a per-branch trim is the convention — **which is
how there came to be five.** ⇒ removing them is what makes the builder's trim the only visible answer.

---

## ❓ THE QUESTION — of your four candidates, **one is not a property at all, two are real, and one is the trim's twin.**

**1. 🚫 *"Every message has a title line"* — NOT a property. It looks like one.**
`booking_paused` / `booking_resumed`, `leave_teacher`, `makeup_far_out` and `default` are **deliberately
single sentences with no title.** ⇒ asserting it would break four correct messages. 🔑 **The distinction worth
recording: a TITLE belongs to a TEMPLATE (a field block), not to a message** — the titled ones are exactly the
ones that render a block. **That is a real property and it is a different sentence.**

**2. ✅ *"No message renders an empty label"* — REAL, held by construction, asserted nowhere globally.**
`line()`, `extra()` and `renderFieldBlock` each return nothing for a falsy value. **I probed all fourteen with
an empty payload: no `Label : ` with nothing after it.** ⚠️ **But a naive assertion would fail** — three
messages have a line ending in `:` and they are the customer's own HEADERS (`📅CONFIRMED SCHEDULE:`,
`⏱️TODAY'S SCHEDULE:`). 📌 *The assertion has to be about the spaced separator, and that is exactly the kind of
detail that makes people write it per-message instead.*

**3. ✅ *"No un-interpolated `{placeholder}` survives"* — REAL, currently true, and NOTHING holds it.**
I probed all fourteen with an **empty payload and empty ctx**: **not one `{var}` leaked.** 🔑 It holds because
every branch writes `?? "-"` or relies on omit-empty — **fourteen times, by hand.** ⇒ **the fifteenth branch is
one forgotten `??` away from sending `{student}` to a parent**, and no test would fail. 📌 **Cheapest of the
four to assert and the one with the worst failure mode.**

**4. 🔴 *"No message mixes labelling conventions"* (`TASK-257 §3`) — REAL, and it is THIS TASK'S TWIN.**
`line()` renders `label: value` (the old convention); `extra()` and `fieldLines` render `label : value` (the
customer's). **Two helpers, and each branch picks one BY HAND** — `reschedule_requested` and
`teacher_assigned`/`unassigned` still use `line()`. 🔑 **Identical mechanism to the trim: one property, nine
branches, per-branch choice** — and it already has a defect history (`จำนวนคาบที่ยืนยัน` under eight English
labels). ⚠️ **It is asserted for ONE message, in TASK-257's own test, and not at all for the other thirteen.**
⇒ **If I were choosing the next one, it is this.**

### 🔑 And the shape behind all four, which is your sentence one level up
***A property that belongs to ALL messages but lives in each message's branch is held by N coincidences.***
📌 **The tell is the same one from yesterday, counted the other way round:** *the trim was five call sites out of
fourteen — a property is at risk exactly when the number of places implementing it is neither ONE nor ALL.*
**Five of fourteen is the signature. `line()` vs `extra()` is nine of fourteen. Both are the same reading.**

**BALL: @Sober — TASK-325 ready for review. ⚠️ And the commit needs the human, not me. ⛔ Nothing else is on me.**
