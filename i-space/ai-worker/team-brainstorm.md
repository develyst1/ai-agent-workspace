# Skill — More than one reading, before one becomes a ruling

**Who needs it:** PM · SA Lead · QA · engineers — anyone about to turn an interpretation
into something the team builds on.
**Owner's ask:** *"อยากให้ทีมมี brainstorm กัน รวมหลายหัวดีกว่าหัวเดียว เพื่อไม่ให้หลงทางไปกับ
อารมณ์ หรือสถานการณ์ผิด ๆ"*

---

## What the failure data actually says

Read the desk's own `FAILURES.md` before assuming this is about having more ideas. On the
desk where this was asked, the expensive entries were **never a shortage of ideas**:

- a customer's rule restated as one sentence — an SA re-size, four rulings and a **built**
  task rested on it; it was wrong, and it was caught by the customer's own numbers *after*
  the build
- facts relayed at full confidence that nobody had opened
- a one-line request turned into a project
- four rounds of production queries chasing a question that could not change the fix

🔑 **Every one is a single interpretation that nobody contested.** Not "we needed more
options" — **"nobody produced the second one."** And the role that produces most of them is
the one with no reviewer above it: engineers get reviewed by the SA, the product gets tested
by QA, and **the PM's reading of the customer goes straight into a requirement.**

So this skill is not a meeting and not an idea-generator. It is: **never let your first
reading be the only one on the record.**

## When to run it — narrow on purpose

Ceremony everywhere is how a good practice dies. Run it **only** at these five points:

1. **A customer's or the owner's words are about to become a REQ, an AC or a ruling.**
2. **A cause is about to be declared** before the symptom has been reproduced.
3. **Two or more plausible designs exist** and the SA is about to pick one.
4. **Something is about to be called 🔴 / an incident** to the owner.
5. **An estimate moves a size** (what was S is now L) — the size did not change, the
   understanding did, and that is worth one round.

Everywhere else: decide, write why, carry on.

## How to run it — one round, in files, no meeting

**The initiator writes four things, in the artefact that will hold the decision** (the REQ,
the SPEC, the TASK — not in chat):

```markdown
## Second reading — <what is being decided>
- **What I read it as:** <one sentence>
- **The strongest other reading:** <one sentence — a real one>
- **What would tell them apart:** <a number to ask for, a file to open, a case to run>
- **Asking:** @<adjacent role> · @<adjacent role>
```

🔴 **The rule that makes this real rather than theatre: you write the strongest case
against your own reading — before anyone replies.** If you cannot produce one, you have not
understood the thing yet, and that is the finding. A round that opens with *"I think X,
does anyone disagree?"* produces agreement, not thought.

**Then: adjacent roles only, one reply each, in the initiator's inbox.** The chain does not
open for this. A reply is one of:
- *"your reading holds, because <evidence>"*
- *"the other reading is stronger, because <evidence>"*
- *"neither — here is a third"*
- *"this cannot be settled by argument; run <the distinguishing check>"* ← often the best answer

**One round. Then the decision is made and recorded with its reason.**

## 🔴 It is NOT a vote, and the chain does not change

**The role who owns the decision still owns it.** A second reading changes **what they
know**, never **who decides**. Nobody is outvoted, nobody hides behind "the team agreed",
and the record still names one person.

This matters more than it sounds: a group decision is a decision with no owner, and every
rule in this workspace rests on being able to name who decided and read their reasoning.
**Shared thinking, single accountability.**

And the chain holds: you ask the roles **adjacent to you**. A PM asks the SA Lead and QA;
an SA asks its own engineers; QA asks the PM. **Nobody gains a new contact by calling a
round**, and a round is never a reason to message across the chain.

## The two shapes it takes

| | **Challenge** — before a reading becomes a ruling | **Divergent** — before an approach is chosen |
|---|---|---|
| Trigger | 1, 2, 4, 5 above | 3 above |
| You write | your reading **and the strongest other reading** | **two or three real options**, not one plus strawmen |
| Good outcome | the distinguishing check is named and run | the trade-off is stated, and the rejected options stay on the record with *why* |

🔑 **Keeping the rejected options is half the value.** Six weeks later someone asks "why
didn't we just…" — and the answer is already written, with its reason, instead of being
re-argued from memory.

## Against the thing the owner actually named — emotion and a wrong situation

Both drift in the same way: **evidence and interpretation get written as one sentence**, and
from then on everyone reasons about the interpretation.

So the round forces them apart. *"She said X"* (evidence, verbatim) is kept separate from
*"which I read as Y"* (yours, contestable). Urgency gets the same treatment: **"this is
🔴" is an interpretation too** — the evidence is what was observed, and the round is where
someone may say *"that is a configuration state, not an outage."*

**If a round feels urgent, that is the strongest signal to run it**, not to skip it. The
costly entries in the failure log were all written by someone moving fast and helping.

## What this skill is NOT

- **Not a meeting.** It is written, asynchronous, one round. Nobody waits for anybody.
- **Not for every task.** Five triggers. A TASK that says what to do and has one obvious
  way to do it is not a candidate.
- **Not an escape from deciding.** If the round ends split, the owner of the decision
  decides anyway, records both readings, and names what would settle it later.
- **Not a reason to delay the build.** Engineers can start on the part both readings share;
  what waits is the part they disagree about.
- **Not a substitute for asking the human.** If the two readings differ on **what the
  customer wants**, no amount of team thinking settles it — that is a question for the
  owner, and the round's job was to discover that fast and cheaply.
