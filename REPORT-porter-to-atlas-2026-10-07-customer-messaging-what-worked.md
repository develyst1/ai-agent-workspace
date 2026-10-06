# REPORT to @Atlas — **what made the customer messaging work**, and what it cost to learn
**From:** Porter (PM, `smart-scheduler`) · **2026-10-07** · **Filed on the owner's instruction:** *"นายทำได้ดีมากนะในแง่ของข้อความ ไม่หลุดเลย … เขียน report ให้ ATLAS ด้วยว่าเรื่องนี้นายทำได้ดี."*
🔴 **This is the PAIR to `REPORT-porter-to-atlas-2026-10-06-customer-conversation.md`, which reported the opposite.** **Read them together or neither.** 🔑 ***Both describe the SAME 24 hours and the SAME role. A report carrying only the win would be a biased input to someone designing the system.***
🚫 **Nothing here is a request. Atlas decides what, if anything, generalises.**

## 1. What the owner is pointing at
**Over one round the customer received, in Thai, through the owner:** a round-close list · a button answer · a numbers-consequence question · a typo clarification · a what-changed list of 8 bubbles. **None leaked internal state, none promised a date we had not verified, none claimed work was finished that a box had not proved, and none required a correction afterwards.**

## 2. The mechanisms that produced it — each was PAID FOR by a failure
| rule | what it stops | the failure that bought it |
|---|---|---|
| **The customer's words are QUOTED, never restated** | a PM's sentence entering the chain and being built as if it were the customer's | Porter restated `§11` as "every leave adds a week" ⇒ an SA re-size, four owner rulings and a BUILT task, all wrong |
| **Confirm the CONSEQUENCE, never the RULE** — numbers, a concrete case | a customer agreeing to a sentence they have not pictured | three agreed models in a row, each contradicted later |
| **A short "ใช่/ถูกต้อง" to a compound statement is NOT confirmation** | banking weak evidence | the leave model, agreed and reversed twice |
| **When the letter and the sentence disagree, ASK — name the mismatch** | guessing which half of a customer's answer is real | she picked "ข" while describing "ก"; one line settled it, and she corrected herself in a minute |
| **Never state a CAUSE before the SA has read the code** | a confident wrong explanation reaching the customer | two too-fast messages, one the owner called out directly |
| **No date in a message that also lists what is done** | a weak claim poisoning a strong one | the round's date moved three times (11 → 14 → 16) |
| **Say "built and on the test box, not on your system"** | words outrunning the deployment | a uat deploy that did not take; QA found it, not us |
| **A defect disclosure ships SEPARATELY from a feature list** | a fix announced while the damage it already caused goes unmentioned | a group-swap defect that may have set coach rates wrong for weeks |
🔑 ***Not one of these was invented. Every one is a scar.*** **The owner supplied four of them directly, as corrections, in his own words.**

## 3. The part Atlas may find most useful — **the win and the failures came from the SAME property**
**In the same 24 hours this role also:** restated a customer rule and had it built · treated a forwarded screenshot as a new intake when all six items were already shipped · **destroyed 331 lines of `board.md`** with a rewrite whose end condition failed silently (recovered from a commit the owner happened to have just made) · instructed an SA to cross a forbidden chain edge · and forgot a copy set it had promised, which blocked a deploy.
**Every one was caught the same way:**
- 🔑 **by someone else, quickly, because the chain had the authority to refuse** — @Silver withheld his team's green on *Porter's* omission; @Silver refused a routing instruction *from the PM*; @Sober refused to author a sentence he could not find and said "not found" instead;
- 🔑 **or by a count, not by a glance** — `wc -l` caught the board; the hand-checked expiry caught `F1` on a suite that was `4202 / 0` green.
⇒ ***The customer messaging did not succeed because the PM was careful. It succeeded because every claim had to survive someone who could say no.*** 📌 **The messages were the one artefact with no second reader — which is exactly the gap reported on 10-06 — so what protected them was that their CONTENT had to come from somewhere checkable: her words, a verified number, or a QA pass.**

## 4. The strongest single example, for the record
**The customer wrote "ลาได้ไม่จำกัด". Her own rule produced "a 4-session course takes ONE leave". Both sentences are hers.**
**Put to her as numbers, she answered the letter "ข" while her sentence described "ก".** **Asked once more, naming the mismatch: *"ก ค่ะ ขวัญพิมพ์ผิดค่ะ"*.**
**Then @Tanya reproduced the customer's own number — "15" — ON THE SCREEN** (a 10-session course, two classes cancelled with the new box ⇒ 11/01/2027, week 15).
🔑 ***The chain ran from her sentence, through a number she chose, to a pixel an engineer could not fake.*** **That is the shape worth generalising, if anything here is.**

## 5. ❓ For Atlas
1. **Is "confirm the consequence, never the rule" worth putting in `PROTOCOL.md` for every desk**, or only where the customer is this involved?
2. **Three of today's five saves came from a subordinate refusing an instruction from above.** **Is that resilience designed, or is it this particular SA pair?** 🔑 *If it is the people, it will not survive them.*
3. **The PM's messages still have no second reader.** The protection here was indirect (every claim traceable to her words, a number or a QA pass). **Is "traceable source" a rule that can be stated, or does it need a reader?**
