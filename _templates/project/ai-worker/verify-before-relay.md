# Skill — Verify before you relay

**Who needs it:** PM, SA Lead — any role that carries a fact to someone who will act on it.
**Costs it has already paid here:** `FAILURES.md` F-002 (four cases in two days), and the
reason the owner spent a day disproving his own system's state.

---

## The one line

**A fact you did not look at yourself is not yours to state.** Relay it as someone
else's claim, or go look.

## Why this is a skill and not a rule

No rule was broken in F-002 — the entry says `Rule involved: NONE`. the PM was being
helpful and fast, and everything he passed on came from a real source: the owner's own
sentence, a teammate's report, a screenshot. **Speed and good faith are exactly the
conditions under which this failure happens**, which is why a rule forbidding it would
not have helped. It is a habit of checking, not a line in a charter.

## The three shapes it takes

| Shape | F-002's real example | What it costs |
|---|---|---|
| **Inferring a fact from the owner's shorthand** | from the owner's shorthand equating two host names he concluded the real OA's LIFF pointed at `sid`, and wrote it into a REQ, a runbook and a day of warnings. The console showed it had been right all along. | a wrong fact propagated into three documents |
| **Reading a value off a picture** | a "misspelling" `เซ็คอิน` read off a LINE-font screenshot; the code was correct | a defect reported that never existed |
| **Forwarding a teammate's claim at full confidence** | relayed QA's *"no uat entry"*; the owner had already supplied the credentials and the entry existed | the owner asked to solve a problem that was not there |

🔑 **The pattern under all three: the source was real, the reading was not.** A sentence,
a picture and a colleague are all *evidence about* a fact — none of them is the fact.

## How to do it

**Before any fact leaves you upward or sideways, answer: "what did I open?"**

- If the answer is a file, a line, a command's output, a console page you loaded —
  state the fact, **and name what you opened**: `I checked: <file>:<line>`.
- If the answer is "someone told me" or "I saw it in a screenshot" — **it goes out as a
  claim, in these words**: `unverified — @QA reports …` / `from the screenshot, to be
  confirmed`. It is **not** 🔴, and it is not written into a REQ, a runbook or a spec.
- If it would take two minutes to check and the fact matters — **check it.** The
  two minutes are always cheaper than the unwinding.

**A screenshot is evidence of a screen, not of a value.** Fonts lie, panels are
mislabelled, and the page may not be the one you think (F-002's fourth case: an "admin
Settings QR panel" that was the login page). To state a value, open the thing that
holds it.

**The owner's shorthand is an instruction, not a specification.** When he writes
something like `= <env> = <host>` he is pointing, not defining. Point back at what you found and
let him confirm: *"ที่ตรวจเจอคือ X — ตรงกับที่หมายถึงไหมครับ"*.

## The test, before you press send

> **Could I name, right now, the file and line — or the exact screen I loaded — that
> this fact came from?**

No → it is a claim, label it as one.
Yes → say it, with the pointer attached. The pointer is not bureaucracy; it is what
lets the next person stop checking.

## What this skill is NOT

- Not a reason to stop and ask. Looking is **cheaper** than asking, and far cheaper
  than relaying wrong. If you can check it yourself, check it — do not route it.
- Not permission to sit on information. **A labelled claim travels immediately.**
  Silence while you verify is its own failure.
- Not an excuse to re-verify settled facts. If it is in `SYSTEM-FACTS.md`, it was
  settled by someone who checked. Use it.
