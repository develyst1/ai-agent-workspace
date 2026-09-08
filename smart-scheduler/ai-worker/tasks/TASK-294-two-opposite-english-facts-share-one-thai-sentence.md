# TASK-294 — two OPPOSITE English facts share one Thai sentence, and `Ends` still answers with a non-date twice over

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-08)
**Source:** **your** sweep on TASK-293. 📌 **No clock, blocks nothing.** 🚫 No backend change.
🔴 **§1 is a defect no English-side review on this project could have caught.**

---

## §1 🔴 `ยังไม่มีคาบ` means two opposite things
Verified at source:
| key | English | Thai |
|---|---|---|
| `plan.noLiveEnd` (`:630` / `:1711`) | *"no live sessions"* — **a plan with none LEFT** | **`ยังไม่มีคาบ`** |
| `plan.noSessions` (`:638` / `:1715`) | *"No sessions yet"* — **a plan that has not STARTED** | **`ยังไม่มีคาบ`** |

⇒ **A Thai reader cannot tell "this course is finished with them" from "this course has not begun."**
⚠️ **`REQ-036` already hit this:** a branch was added because *"ยังไม่มีคาบ"* on an ENDED course *"is the opposite
of the truth."* 🔴 **That fix addressed the CASE. The collision is still here** — and it will produce the same
wrongness in the next state that reaches either key.

**The fix is the Thai, not the English.** ✅ **`noSessions` (not started) keeps `ยังไม่มีคาบ`** — it is literally
*"there are no sessions yet"*. **`noLiveEnd` needs its own sentence** meaning *no sessions remain* — the two must
be distinguishable **read aloud**, not merely different strings.
🚫 **Do not "fix" it by changing the English**, which is already correct and which the owner reads.
⚠️ **You are the only person on this project who can judge whether the replacement reads right.** **Choose it,
and say in one line why the two cannot now be confused.**

## §2 🔴 `Ends` still answers with a non-date for TWO more states
TASK-293 §2 ruled on **paused** only, and you correctly changed only that. **`plan.noLiveEnd` is still poured
into the `Ends {date}` slot for a COMPLETED plan and for one that never started.**
⇒ **the same category error, twice over** — *the answer does not fit the question the label asks.*
✅ **Same shape as your `pausedNoEnd` fix: read the server's own lifecycle status** and say what IS true for that
state, rather than putting a sentence where a date goes.
🚫 **Do not invent a date, do not fall back to the expiry, and `deriveLiveEndDate` stays untouched** — it is
backend-side and returning nothing is the correct answer it gives.
⚠️ **If a state has no obvious sentence, say so and leave it** — **two states fixed and one named is better than
three states worded by guess.**

## §3 ⚪ Recorded, not in scope — `Paused`, the word, twice
`course.DROPPED` = *"Paused"* and `bookingStatus.PAUSED` = *"Paused"*: **one word, two mechanisms.**
**Accurate for each, ambiguous across them**, and `PlanModal`'s own flag comment already warns *"they share a
word and nothing else."*
🚫 **Not a defect and not to be renamed** — the owner and the customer both say `พัก` for both. 📌 **Recorded so
that any FUTURE copy about "paused" names WHICH**, which is the only place it can actually mislead.

## §4 What must not change
- 🚫 **The four body sentences pinned in TASK-293** — the owner read those; a reword goes through a failing test.
- 🚫 The English of `noLiveEnd` / `noSessions`. 🚫 `pausedNoEnd`, the title branch, `deriveLiveEndDate`.
- 🚫 No backend change.

## Definition of Done
- [ ] Typecheck clean; **state the command**
- [ ] 🔑 **`noLiveEnd` and `noSessions` are distinguishable IN THAI** — asserted that the two strings differ, and
      **one line from you on why they can no longer be confused by a reader**
- [ ] The English of both is **byte-identical** — asserted
- [ ] `Ends` no longer answers with a sentence for **completed** and **never-started** — or **the one you left is
      named with its reason**
- [ ] 🚫 TASK-293's pinned body sentences unchanged — asserted · `deriveLiveEndDate` untouched · no backend change

## Question
**Is `ยังไม่มีคาบ` the only Thai string doing double duty?** 📌 *You found this one because two keys you were
already reading happened to be four lines apart.* **A duplicate Thai value under two different English keys is
mechanically findable** — **and unlike the label sweep, that one CAN be automated.** ⇒ **if it is cheap, make it
a test and tell me what it finds; if the dictionary has legitimate duplicates, say so and do not force them
apart.**
