# TASK-323 — two copy items, and each one has a boundary the copy does not state

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-10)
📌 **Batch items 3 and 6** (`REQ-085 §16.2` · `§16g`). ⏱️ **No clock — `uat` waits for the batch.**
🚫 No migration, no FE change. **CUT AND HELD: this is NEXT after TASK-318, not instead of it.**
🔑 **Both items are one string each. Both have a second population the customer did not mention. Read §2 and
§4 — those are the whole task.**

---

## §1 Item 3 — `§16.2`: the exit hint comes off TWO screens
> ⚠️ **BIRTHDATE AND PROVINCE SCREENS ONLY — not product-wide.** *(@Porter, and he underlined it.)*

**`add_exit_hint`** — `" · หรือพิมพ์ ยกเลิก เพื่อออก"` / `" · or type cancel to exit"` — is appended by
**`withExit`** (`line-webhook.service.ts:512`) at **TWELVE call sites**. 🔑 **So this is not a string edit; it
is a decision about WHICH SITES.**
**The two the customer named:** `:591` **birthdate** (`add_birthdate_prompt`) · `:605` **province**
(`add_province_prompt`).
🚫 **The other nine keep it** — the name prompt (five sites), the duplicate-detail ask, the summary confirm and
its re-ask. **They are not in `§16.2` and they do not move.**

## §2 🔴 THE BOUNDARY — `:602`, and it is the same shape that produced the four-children defect
**`:602` is the BAD-BIRTHDATE RE-ASK** (`add_birthdate_bad`, through `strikeOrPrompt`). ⚠️ **It is the same
screen, after a wrong answer — and `§16.2` does not mention it.**
🔑 **This is `§6` again: *specified for the population it was ABOUT and silent about the population it would
also REACH.*** ⇒ ❓ **Two readings, and you decide:**
1. **The hint goes from the re-ask too** — the screen is consistent, ⚠️ **and the exit disappears from the ONE
   place a customer is demonstrably stuck** (*they just typed something we rejected*).
2. **The prompt loses it, the re-ask keeps it** — 🔑 **the exit appears exactly when it is needed**, ⚠️ *and the
   screen says two different things depending on whether you got it right first time.*
📌 **My reading is 2, and I hold it lightly** — *the customer's complaint is clutter on a screen they are
reading for the first time; a re-ask is not that screen any more.* ⚠️ **If you take 1, say why**, and 🚫 **do
not take either silently.**

## §3 🔴 The assertion that matters more than the copy
**`ยกเลิก` / `cancel` MUST STILL WORK on both screens.** 🔑 **"Remove the hint" is one edit away from "remove
the exit", and only one of those was asked for.**
⇒ ✅ **Assert the BEHAVIOUR survives the copy change**, on **both** screens — 📌 *an unadvertised way out is
still a way out; a removed one traps a customer in a wizard, which is exactly what `§6.1` was about.*

## §4 Item 6 — `§16g`: the two COMMAND headers, and we DRIFTED from their copy
| key | today | must become |
|---|---|---|
| `tsched_title_today` | `🗓️ ตารางวันนี้` / `🗓️ Today's schedule` | **`⏱️TODAY'S SCHEDULE:`** |
| `tsched_title_week` | `🗓️ ตารางสัปดาห์นี้` / `🗓️ This week's schedule` | **`⏱️THIS WEEK'S SCHEDULE:`** |

✅ **`ob_today_title` is ALREADY `⏱️TODAY'S SCHEDULE:` in both languages** (`line-i18n.ts:487`).
⇒ 🔑 **@Porter is right that this is not a change to their spec — it is a failure to have matched it.**
🚫 **HEADERS ONLY.** ⚠️ **The compact COMMAND body stays exactly as the customer approved it, and @Porter's
standing instruction — *AUTO and COMMAND are different shapes by design, do not unify them* — STANDS.**
❓ **The decision I want stated: does the daily COMMAND header REUSE `ob_today_title`, or take the same value in
its own key?** ⚠️ **`ob_today_title` is byte-frozen against `§7.2`'s AUTO example** ⇒ **reuse means a future
change to their AUTO header silently moves the COMMAND one too.**
🔑 **And the WEEKLY header has no auto twin to copy — it must be WRITTEN in that form** (📖 **@Porter's, and he
says so: nothing in their four messages specifies it**). ⇒ 📌 *if your answer is "reuse for daily, new key for
weekly", say why that asymmetry is right rather than untidy — I will take that answer.*

## §5 What must not change
- 🚫 The other NINE `withExit` sites · TASK-245's `withExit` itself · TASK-278 §4.1's ruling that the exit is
  never inline in `add_summary_confirm`.
- 🚫 `add_birthdate_prompt`'s `(วัน-เดือน-ปีค.ศ. )` spacing and `add_province_prompt`'s wording — **`§16.2`
  removes the HINT, not their text** · the `§17c` pins on those screens **update, not delete**.
- 🚫 The compact COMMAND body · `ob_today_title`'s value · the AUTO messages · `§7.2`/`§7.3`.
- 🚫 No migration · no FE change · no new i18n key **unless** `§4` needs one, which you will have said.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean, **say which command** ⚠️ **in THIS repo use
      `bunx --package typescript@5.6.3 tsc --noEmit`** — 📌 *`bunx tsc` alone is broken here (no local
      typescript); it works in the FRONT repo, which is why the two reports differ* · 🚫 no migration (**35 = 35**)
- [ ] **The hint is GONE from the birthdate and province prompts** — asserted
- [ ] 🔴 **`§2` DECIDED and stated** — what the bad-birthdate re-ask does, and why
- [ ] 🔑 **`ยกเลิก` / `cancel` STILL WORKS on both screens** — asserted as BEHAVIOUR, ⚠️ *the assertion that
      keeps "remove the hint" from becoming "remove the exit"*
- [ ] **The other NINE sites still carry it** — asserted, ⚠️ *so "not product-wide" is pinned rather than trusted*
- [ ] **Both COMMAND headers match their copy**, and 🔴 **`§4`'s reuse-or-new-key question is answered**
- [ ] **The compact COMMAND body is BYTE-IDENTICAL** — asserted. 📌 *`§16f` was withdrawn precisely because it
      read as a body change; this task must not become one*
- [ ] **`§17c` pins UPDATED, not deleted**, and you say which
- [ ] 🔑 **Break it and watch** — ⚠️ **verify the restore by READING the line**

## Question
🔴 **`§16.2` names two screens. `withExit` has twelve sites. `§16g` names two headers and one of them has no
specified twin.** 🔑 **Every copy item in this batch has turned out to be a decision about SCOPE wearing a
string's clothing.**
⇒ ❓ **Is that a property of THIS customer's document, or of how we RECORD copy?** ⚠️ **I ask because the
answer changes what I write, not what you do:** 📌 *if their document is simply screen-by-screen — which it is,
it is a series of phone mock-ups — then it can never specify a shared component, and every one of these items
will arrive under-scoped no matter how carefully they write it.*
🔑 **If that is right, the fix is that I ask "which call sites?" BEFORE dispatching**, not that anyone reads
harder. **Tell me if you think there is a cheaper tell than that.**

---

## ✅ RESULT 2026-09-10 — @Jason. **1976 pass / 0 fail**, 158 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change, **no new key.**
New: `src/lib/copy-scope-req085-16.test.ts` (11 tests).

- [x] **The hint is GONE from the birthdate and province prompts** — asserted
- [x] 🔴 **`§2` DECIDED and stated** — the re-ask KEEPS it, and the evidence is below
- [x] 🔑 **`ยกเลิก` / `cancel` STILL WORKS on both screens** — asserted as BEHAVIOUR, and **the mutation proves it**
- [x] **The other NINE sites still carry it** — counted, ⚠️ **and the count is 9, not 10; see the correction**
- [x] **Both COMMAND headers match their copy**, and 🔴 **the reuse question answered — neither of your two options**
- [x] **The compact COMMAND body is BYTE-IDENTICAL** — asserted on the full-entry pin
- [x] **Pins UPDATED, not deleted** — three, named below
- [x] 🔑 **Break it and watch** — twice; restores **verified by READING the line**

### 🔻 §2 DECIDED — the re-ask KEEPS the hint. **Your reading 2, and the reason is stronger than either of ours.**
You gave *"a re-ask is not that screen any more"* and held it lightly. ✅ Same conclusion, but the evidence is
**three lines above the call site, in the code**:
> *"🔴 TASK-245 — THIS is the branch where rule 5 failed the owner: he typed `เมนู`, was told the date format
> was wrong, and the counter never moved."*
🔑 **The bad-birthdate re-ask is the exact screen TASK-245 exists because of.** ⇒ taking the exit hint off it
would **re-open, in COPY, the defect that task closed in BEHAVIOUR** — one day after we closed it.
📌 And the customer's own words support it: *"เอา Type cancel to exit ออก"* is a complaint about clutter on a
screen read for the FIRST time. **A parent who has just been refused is not on that screen any more.**
⚠️ **This is not a wording judgement, so it is not a placeholder** — it is a behaviour rule, and by yesterday's
line that is the kind that survives. **Written into the code beside the branch, and asserted.**

### 🔴 §4 — I took NEITHER of your two options, and I think the third is better
You offered **reuse `ob_today_title`** or **a new key with the same value**, and named the risk of reuse:
*"a future change to their AUTO header silently moves the COMMAND one."* ⚠️ **The second option has the mirror
risk — the two drift silently.** ⇒ ✅ **Separate keys, and the COINCIDENCE IS ASSERTED**: a test pins
`tsched_title_today === ob_today_title`, with the reason.
🔑 **Neither failure mode can now happen quietly.** The day either header moves, that test fails and **a human
decides whether they still travel together** — which is the actual open question, and it is not ours today.
📌 It also keeps the two COMMAND headers side by side, which is where anyone editing one looks for the other —
**so the asymmetry you were willing to accept does not arise at all.**

### 📖 The WEEKLY header — the new convention's first use, on the day we adopted it
**`⏱️THIS WEEK'S SCHEDULE:` is @Porter's and the customer has not seen it.** ⇒ the table entry is marked
**PLACEHOLDER — NOT a ratified string**, the way `PENDING_RESCHEDULE` is, and 🚫 **its test does NOT byte-freeze
the words.** ✅ It pins the **FORM** — the clock, upper case, the trailing colon, language-invariant, and *not*
identical to its daily twin — **because the form is the only thing that was actually decided.**
🔑 *"The criterion is the deliverable; the string is provisional."* **This is what that costs and what it buys:
one test that cannot fail when they rename it, and cannot pass if someone invents a third style.**

### 🔻 TWO CORRECTIONS
**1. `withExit` has ELEVEN call sites, not twelve.** The twelfth is the DECLARATION — `const withExit =
(question…` — which does not match `withExit(`. ⇒ two came off and **nine remain**, and my first assertion
expected 10 and failed. ✅ Fixed, with the reason in the test so the next person counting gets the same answer.
📌 Nothing depended on it, but *"the other nine keep it"* is a claim in your task and it is worth being exact.
**2. Three pins UPDATED, not deleted** — and one of them is the interesting one:
- `line-stuck-exit.test.ts` — *"EVERY question the wizard asks advertises the exit"*. 🔴 **The net now has two
  stated holes, and the holes are LISTED** rather than the test being narrowed: an exception nobody can see is
  how the other nine follow it next month. ⚠️ **And a negative assertion was ADDED** — the two named screens
  must NOT carry it — so the removal cannot quietly spread either. **The property that test was really for is
  unchanged and is asserted in the new file: `ยกเลิก` still works.**
- `line-schedule.test.ts` and `daily-schedule-req085.test.ts` — the header line only. **The full-entry pin in
  the second one is what proves the BODY did not follow the header** (`§16f`'s withdrawn reading).

### 🔑 Break it and watch — two, and the first is the one this task is about
- **A. the EXIT itself removed** (`if (false && isCancelWord(text))`) → **2 fail**, led by *"`ยกเลิก` STILL
  WORKS on both screens"*. ⇒ **the assertion that keeps "remove the hint" from becoming "remove the exit" does
  its job.**
- **B. the hint put back on a named screen** → **3 fail**, including the negative assertion above.
- ✅ Both restored, **each verified by reading the line back** and by `grep -c MUTATED` → 0.

---

## ❓ THE QUESTION — it is a property of their DOCUMENT, and there IS a cheaper tell than asking every time.

**Their document cannot specify a shared component, and it is not a flaw in it.** 🔑 **It is a series of phone
mock-ups: a screenshot has no way to say *"and the other nine places this string appears"*, because a screenshot
does not know the string appears anywhere else.** ⇒ **every item that touches shared copy will arrive
under-scoped no matter how carefully they write it.** ✅ **So: their document, not our recording** — and I would
not ask them to change how they write. **A customer describing what they SEE is the customer doing it right.**

### 🔑 But the tell is cheaper than *"which call sites?"* on every item, and it is on OUR side
**The question only needs asking when the named string is SHARED.** ⇒ **the tell is: *is the string they named
rendered from more than one call site?*** — one `grep`, and it partitions this whole batch correctly:
| item | sites | arrived under-scoped? |
|---|---|---|
| `§16.2` cancel hint | **11** | 🔴 yes — two named, nine not |
| `§16g` headers | 1 each | ✅ no |
| `§16.4` `Sessions :` | 1 | ✅ no |
| `§16d` leave notice | 1 | ✅ no |
| `§17c` screens | 1 each *(but `add_student_name_prompt` at 5)* | 🔴 **yes, and that is the one that bit** |
🔑 **Every under-scoped item in this batch was a string with more than one call site. Every well-scoped one had
exactly one.** 📌 **That is mechanical and you can run it before dispatching** — it is not reading harder, it is
one command.

⚠️ **And there is a second-order version of the same tell, which is the one I would actually put in
`SYSTEM-FACTS`:** ***a copy item is a scope decision exactly when the string is shared — so the cheap habit is
not "ask which screens" but "count the call sites, and only ask when the answer is more than one."***
📌 It also predicts where the NEXT one comes from: **`add_student_name_prompt` has five sites and `withExit` had
eleven** — those are the two shared strings left in the registration flow, and any future item naming either of
them is a scope decision wearing a string's clothing before anyone reads it.

**BALL: @Sober — TASK-323 ready for review. ⛔ Nothing else is on me.**
