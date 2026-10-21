# Skill — Check by running, not by reading. Then look for the second one.

**Who needs it:** SA Leads and engineers — anyone who decides what a change touches.
**Costs it has already paid here:** four consecutive `FAILURES` entries from one SA in
three days (F-011, F-012, F-013, F-014), each one the same mistake wearing a new face.

---

## The one line

**A check you performed in your head is a guess with a confident voice.** Run it, search
it, or read the authoritative file — then assume there is a second instance and go find it.

## The two halves, and both must be done

### Half 1 — use the authoritative source, not the convenient one

| What was used | What should have been used | Entry |
|---|---|---|
| memory of the previous lesson | a fresh search | F-011 |
| **reading** the test | **running** the test | F-012 |
| the text of a JSX change | `grep` for everything that reads that text | F-013 |
| `ls tasks \| tail` | the team's number block on the board | F-014 |

Every one of the left-hand options was *faster and felt sufficient*. **That is the
signature of this failure — it never feels like a shortcut at the time.**

### Half 2 — one found is not all found

In all four cases the first instance was found correctly and **the second was missed.**

🔑 **Technical reason worth memorising** (from F-012): *a failing `expect` hides every
later `expect` in the same test.* The first assertion fails, the run stops, and the
second one **cannot fail yet** — so "I ran it and only one line is red" is not evidence
that only one line is wrong. The same shape appears everywhere:

- a compile error hides the errors after it
- a claim list validated against the first file that needed it
- one caller fixed while a second caller of the same string is never searched for

**So the habit is two steps, not one:** find it → then ask *"what else is of this kind,
and what would be hidden by the thing I just found?"*

## How to do it

**Before a claim list, a pin grant, a TASK scope or a number allocation leaves you:**

1. **Name the authoritative source out loud.** The board for ids. A fresh `grep` for
   references. The test runner for which lines fail. If you cannot name it, you are
   about to guess.
2. **Run it.** Applying the candidate edit in a scratch copy and running the suite takes
   a minute and answers the whole question at once.
3. **Sweep for the second.** `grep` the string, not the file. List every `expect` after
   the failing one. Check every caller, not the one you were shown.
4. **Ask once, for everything.** One request naming every line that turns red beats a
   grant, a surprise, and a second grant — which is what cost F-012 its round trip.

## The test, before you send

> **Did I run it or search it — and did I look past the first hit?**

Either answer "no" means the list you are about to send is incomplete, and the engineer
will find out for you.

## What this skill is NOT

- Not a reason to re-verify settled facts. `SYSTEM-FACTS.md` was checked by someone; use it.
- Not a licence to widen scope. You search in order to **know** what is affected; what you
  then *touch* is still only what the TASK says.
- Not slowness. Running the check is usually cheaper than the round trip that discovers
  you were wrong — in F-012 the engineer had to stop, report, and wait for a second grant.
