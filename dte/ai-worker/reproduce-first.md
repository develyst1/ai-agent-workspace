# Skill — Reproduce the customer's situation first, then prove the fix on that same situation

**Who needs it:** PM (builds the recipe) · Tester (runs it) · SA (one clause — §4).
**This ADDS a step. It removes nothing.** Every existing test, gate and QA pass stays
exactly as it is; this goes in front of them.

---

## The one line

**Rebuild the customer's situation on the rehearsal box until her symptom appears there
for real. Then deploy the fix and run the SAME steps again.**

A fix is proven only when it is proven on **the situation that broke** — not on one that
is merely similar, and not by a green suite.

## What it cost to learn (2026-10-08)

A customer reported that adding a coach to a camp day was refused with a **false clash
naming a different coach**. The SA found a plausible cause in the code within minutes.
Then the PM spent **four rounds of the owner's own SQL on the customer's live system**
chasing why the database showed 0 coaches when her screenshot showed 5 — one read carried
an inline comment that broke it, one conclusion about which box had been queried was
proven wrong, and more reads were offered after that.

**None of it moved the fix one step.** The owner stopped it:
> *"นายไม่เทสที่ sid ก่อนหรอ เพื่อดูทำถูก situation ไง แล้วค่อยเอาขึ้น แล้วค่อยหาย จบ"*

Re-planned in minutes: build her day on the rehearsal box **with the OLD build** → show the
refusal appears → deploy the fix → **run the same steps** → then the customer's system.
The production-data question was parked: it decides **what we tell her**, never **whether
the fix works**.

🔑 **The trap is not laziness — it is that investigating feels like progress.** Every SQL
round produced a real answer to a real question. The questions were about the data, and the
defect was in the behaviour.

## It was already working before it had a name

- A tester **back-dated a course so a make-up fell on "today"** — what a same-day sick
  leave actually looks like. That found a defect **4,299 green unit tests could not see**:
  the replacement was re-booked into the very slot just cancelled.
- A customer's rule became correct only when she was asked for **numbers on one concrete
  case** instead of being asked to confirm the rule.
- A defect appeared **only on the real phone**, where a family told "confirmed" never got
  the cancellation.

Three different roles, one shape: **the real situation, reconstructed, not approximated.**

## §1 — PM: turn the report into a reproduction recipe

Before routing anything to the SA, write the recipe **from her words and screenshots**:

| The recipe names | Example of enough detail |
|---|---|
| **The data state** | who, which day, which hours, what else sits on that calendar |
| **The exact click** | the button, on which screen, in which order |
| **The exact words she saw** | copied verbatim from her screenshot, not summarised |

🚫 **Do not chase production data before the situation is reproduced** — unless the data
question changes **what to fix**. If it only changes **what to tell her**, park it and say
you parked it.

🚫 **Nothing is said to the customer until the fix is proven on the reproduced situation.**
A message that says "fixed" ahead of that proof is the expensive kind of wrong.

## §2 — Tester: Step 0 on the OLD build, then the same recipe on the new one

**Step 0, before any fix is deployed:** run the recipe on the **old** build and record
`REPRODUCED` — with a screenshot showing **the customer's own symptom**, not a similar one
— or `NOT REPRODUCED`.

🔑 **`NOT REPRODUCED` is a finding, not a pass.** It means we do not yet understand her
situation, and the fix is therefore **unproven by definition**. Report it; do not proceed
to judge the fix.

**After the fix:** run the **same recipe, unchanged**. A pass on a different situation does
not count, and neither does a pass on a recipe you quietly improved along the way.

**If you had to change the recipe to make it reproduce** — different data, an extra step,
another precondition — **that is a finding about the intake, not a test detail.** Send the
corrected recipe back through the PM so it lands in the requirement. The PM's picture of
her situation was wrong, and that is worth more than the test result.

**If reproduction is genuinely impossible** (it needs her real data, a device you do not
have, a timing window you cannot create): say so, name exactly what is missing, and the
fix ships labelled **`UNPROVEN — could not reproduce`**. **Impossible must never quietly
become `PASS`.**

## §3 — Where the recipe lives (asked by the PM; this is the answer)

**Written ONCE, by the PM, in the requirement.** It is a statement about the customer's
situation, which is requirement territory — not a test detail.

The TEST file **points at it** and records only the outcome:

```markdown
## Step 0 — reproduction on the OLD build
- Recipe: REQ-NNN §Reproduction        ← pointer, never a copy
- Build: <the old one, named>
- Result: REPRODUCED | NOT REPRODUCED
- Evidence: ../project-docs/<file>.png   ← the customer's own symptom
```

**Never copy the recipe into the TEST file.** Two copies of the same situation is how the
situation quietly becomes two different situations — and then "it passed" and "she still
sees it" are both true.

## §4 — SA: one clause

**A cause found by reading code is a hypothesis.** It becomes a cause when the symptom has
been reproduced and the fix makes it disappear **on that same recipe**.

Say which one you are holding. In the incident above the code read was right — and the
confident framing is what sent everyone to the database instead of to the rehearsal box.
**You lose nothing by calling it a hypothesis; the fix is cut and built either way.**

## §5 — When this applies, and when it does not

**Applies:** a defect, a bug, anything a customer or user reported as wrong behaviour.

**Does not apply:** new features. There is no symptom to reproduce, and demanding a Step 0
there turns this into ceremony — which is how a good rule becomes one nobody reads.

## The test, before the fix is called proven

> **Did I see her symptom with my own eyes on the old build — and did the same steps,
> unchanged, stop producing it on the new one?**

Any "no" → the fix is `UNPROVEN`, and it is said in that word.

## What this skill is NOT

- **Not a replacement for any test.** The suite, the gate, the acceptance round, the
  release gate — all unchanged. This is Step 0 in front of them.
- **Not a reason to delay a cut.** The SA can design and the engineer can build while the
  reproduction is being set up. What waits is the word **proven**, and the message to the
  customer.
- **Not an excuse to skip investigation forever.** A parked data question is parked, not
  dropped — it decides what the customer is told, and someone still owes her that answer.
