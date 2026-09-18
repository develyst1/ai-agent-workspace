# TASK-345 — a check over what a message EMITS, and everything it finds

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-11)
▶️ **OWNER-APPROVED, and he is HOLDING THE DEPLOY for it.** 🚫 No migration, no FE change.
🔑 **THE CHECK IS THE DELIVERABLE. The fixes are what it produces.** ⛔ **Chain still stopped: this one item.**

---

## §1 🔴 THE NINTH SITE IS NOT ONE SITE. I looked before writing this — **it is at least FOUR.**
**@Porter's screenshot: `*Expiry date : 2027-03-11` beside `Date : 11-09-2026`, three lines apart.**
✅ **And the same assumption that hid the last three has hidden more:**
| | field | message |
|---|---|---|
| `line-message.ts:378` | **`expiry`** | `course_deduction` — 🔴 **his screenshot** |
| `:300` | **`expiry`** | `course_confirmed` — 🔴 **the `*Expiry date : 2026-10-16` he also named** |
| `:298` | **`start`** | `course_confirmed` — ⚠️ **`Start : …` — NOBODY has screenshotted this one** |
| `:307` | **`advanceLeave`** | `course_confirmed` — 🔴 **`plannedDates.join(", ")` — RAW ISO DATES, JOINED** |
📌 **THREE PASSES, THREE UNDERCOUNTS: 5 → 8 → 9, and it is 9+ again.** ⇒ 🔑 **@Porter is right that the answer
is not "fix the ninth".**
⚠️ **My four are a CANDIDATE LIST as always — your number overrides mine, silently.**

## §2 ✅ THE CHECK — and I believe it is CHEAP, which is what he asked me to say
🔑 **The harness already exists.** **`no-placeholder-leak.test.ts` renders ALL FOURTEEN KINDS from a probe
payload** — 📌 *TASK-327 built it, and this is the same shape pointed at a different leak.*
✅ **Feed a payload whose every date field is a DISTINCTIVE ISO value, render every kind, both languages, both
audiences — and assert the OUTPUT contains no `\d{4}-\d{2}-\d{2}`.**
🔑 **THE PROPERTY THAT MAKES IT WORK, and it is why this is not a fragile regex:** ***the probe CONTROLS every
input, so any ISO in the output came from US.*** ⇒ **no false positive from a parent's typed `Remark`, because
the probe decides what the `Remark` says.**
✅ **And it satisfies his actual requirement: it can FAIL ON A SITE IT HAS NEVER BEEN TOLD ABOUT** — 📌 *`start`
and `advanceLeave` are exactly that, today.*

⚠️ **BEFORE YOU BUILD IT, CHECK THE ONE THING THAT COULD MAKE IT EXPENSIVE:** ❓ **is there any kind whose
output LEGITIMATELY contains an ISO date?** 🔑 **If there is, say so and STOP** — 🚫 **do not add an
exemption list on your own judgement** — 📌 *an exemption list is how this check becomes the thing it
replaced.* ⏱️ **Tell me and I will take it to @Porter.**

## §3 The order, and it is not negotiable
1. ✅ **The check FIRST, run against the UNFIXED tree** — 🔑 **the demonstration is the DEFECT, not a mutation.**
   *(@Fern's TASK-340 method, and it is the strongest form we have.)*
2. ✅ **Report WHAT IT FINDS and HOW MANY** — ⚠️ **before fixing.** 📌 *If it is far more than four, that is a
   size @Porter needs, and the owner is holding a deploy.*
3. ✅ **Then fix them, and the check goes green.**
4. 🔑 **Then EMPTY IT — make the probe render nothing — and show the check FAILS.** ⚠️ *@Fern's rule: a check
   that finds nothing because it is looking nowhere passes exactly as quietly as a clean tree.*

## §4 What must not change
- 🚫 **`§7.1`'s `Date : Tuesday`** — ⚠️ **a WEEKDAY IS NOT A DATE** and it must not be swept.
- 🚫 **`line-leave.ts` and `line-schedule.ts`** (`อังคาร 22/09`) and 🚫 **`attention.ts`'s digest** — **BOTH are
  open questions with @Porter.** ⚠️ **If your check flags them, that is CORRECT and you leave them, with the
  reason** — 🔑 **a check that names a pending decision is not a false positive; it is the decision becoming
  visible.** 📌 *Assert them as KNOWN-OPEN, the way @Fern did.*
- 🚫 `§17c`'s ten customer-byte files · `ddmmyyyy` itself · no second date function · no migration.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **The check exists, is over the OUTPUT, and FAILED on the unfixed tree** — with the list it produced
- [ ] **Your number, and whether it agrees with my four**
- [ ] **Every site it found is fixed** — asserted per message
- [ ] 🔑 **The probe emptied ⇒ the check FAILS** — demonstrated
- [ ] 🚫 **`§7.1`, the picker, the heading and the digest untouched** — asserted as KNOWN-OPEN with reasons
- [ ] **Every moved pin NAMED and COUNTED** · `§17c` re-checked by name
- [ ] 🔴 **If any output legitimately needs an ISO date: STOP and tell me. Do not write an exemption list.**
- [ ] **Restore in a `finally`, byte-identity by CHECKSUM**

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **Three sweeps searched the SHAPE OF THE SOURCE and three undercounted. This one searches the OUTPUT.**
⇒ ❓ **What ELSE have we been checking by source shape that could be checked by output instead?**
📌 *Candidates: the Thai-in-a-generated-value rule · the labelling convention (`label:` vs `label :`) · "no
message ends in whitespace" — which is ALREADY an output check, and is the one that has never come back.*
🚫 **Name them. Build nothing.**

---

# 📤 REPORT — @Jason → @Sober (2026-09-11)

✅ **DONE (code).** **2054 pass / 0 fail**, **166 files** (+1: the check) · 🚫 no migration (**35 = 35**) ·
`tsc --noEmit` clean · no FE change, no new key. **Two source files, nine test files, one new test file.**
🚫 **Nothing legitimately needs a raw ISO date. I did not write an exemption list.**

## §1 🔴 WHAT THE CHECK FOUND ON THE UNFIXED TREE — built first, run first, as `§3` required
**6 rows of (message × field), across 5 SITES in 3 MESSAGES:**
| message | field | |
|---|---|---|
| `course_confirmed` | `payload.startDate` | ⚠️ **`Start :` — nobody had screenshotted it** |
| `course_confirmed` | `payload.expiryDate` | 🔴 @Porter's second screenshot |
| `course_confirmed` | `plannedLeaveDates[0]` **and** `[1]` | 🔴 **ONE site, TWO dates — the joined list** |
| `course_deduction` | `payload.expiryDate` | 🔴 @Porter's screenshot |
| **`todays_schedule`** | **`expiryDate`** | 🔴 **YOUR LIST DID NOT HAVE THIS ONE** |

✅ **Your four were all real.** 📌 **The count is 5 sites, not 4** — and **the extra is the AUTO daily
schedule's own `*Expiry date`, in `line-today-schedule.ts`.**
🔑 **It matters more than "one more": it is in a DIFFERENT FILE that never goes through the switch.** ⇒ ***a
sweep of `line-message.ts` — every sweep we have run for four days — could not have found it at any level of
care.*** **The check found it because the check reads OUTPUT.**
⚠️ **And it is the same shape as the last miss:** *`teacher_assigned` hid in a combined value; this one hid in
another file.* 📌 **Both are "not where we were looking", which is the thing @Porter actually asked us to stop
relying on.**

## §2 ✅ THE CHECK — and it satisfies his requirement rather than approximating it
`no-iso-date-leak.test.ts` renders **every kind × both languages × both audiences, plus the daily schedule**,
from a probe whose every date field is a **DISTINCT** ISO value, and asserts the output holds no
`\d{4}-\d{2}-\d{2}`.
🔑 **The property that makes it robust and not a fragile regex is yours:** ***the probe CONTROLS every input,
so any ISO in the output came from US.*** ✅ **No exemption needed for a typed `Remark`, because the probe
decides what the `Remark` says.**
✅ **It can fail on a site it was never told about** — 📌 *`start`, the leave list and the daily schedule were
exactly that today.*
🔑 **The distinct values are deliberate: a failure NAMES ITS OWN SOURCE**, so nobody has to bisect to find out
which field leaked.

## §3 🔑 IT WAS DEMONSTRATED BY EMPTYING IT, not by trusting it
| | |
|---|---|
| **the probe EMPTIED** (`return []`) | ✅ **1 fail** — the floor test |
| `Start` reverted | ✅ 1 fail |
| the leave LIST reverted | ✅ 1 fail |
| the daily schedule's expiry reverted | ✅ 1 fail |
✅ **All restores byte-identical by SHA-256**, in a `finally`.
📌 **The floor test does two things, and the second is the one @Fern's rule is really about:** it asserts the
probe rendered *something*, **and that no rendering is EMPTY** — ⚠️ *a builder returning `""` would satisfy the
ISO assertion perfectly.*

## §4 🚫 WHAT IT DOES NOT REACH — asserted as KNOWN-OPEN, each with its reason
- **`§7.1`'s `Date : Tuesday`** — ✅ asserted PRESENT. ⚠️ **This check would never have flagged it anyway** (a
  weekday holds no `YYYY-MM-DD`) — 📌 *stated in the test, because **"the check is silent" and "the rule is
  safe" are different facts and only one of them is evidence.***
- **The PICKER and the weekly HEADING** — ✅ untouched, asserted, with TASK-316/318's history and your
  ratification written in. ⚠️ **TWO reasons they are absent and only one is the decision:** they are not
  `formatOutboxMessage` renderings, **and** `22/09` holds no ISO date. 📌 *Recorded so nobody reads this
  check's silence as clearance.*

🔻 **THE DIGEST — AND THIS CORRECTS WHAT I TOLD YOU ON TASK-344.**
🔴 **I reported `attention.ts`'s raw ISO as *"a label an ADMIN reads"* and implied it reaches a message.**
⚠️ **IT DOES NOT.** `buildDigestMessage` renders **only the COUNT per check** — `• <label> : 3` — followed by
*"ดูรายละเอียดทั้งหมดในเว็บแอป"*. **The item labels never enter the LINE message; they go to the WEB APP.**
⇒ 📌 **It is not a message-date question at all, and my "two lines if he says yes" sizing was on a false
premise.** ✅ **Asserted in the check file so the correction is executable rather than a sentence in a report.**
⚠️ *Please take it off @Porter's list, or move it to @Fern's — it is a front-end display question if it is
anyone's.*

## §5 ⚠️ THE ONE JUDGEMENT CALL — declared, and I want you to look at it
I added **`dateField`** beside `fieldValue` in `line-message.ts`: `fieldValue`'s guard, then `ddmmyyyy`.
🚫 **It is NOT a second date function** — *it formats nothing; it calls the one formatter* — and the doc-block
says so in as many words, plus **where a second FORMAT would go if one were ever wanted (it is a `§15`
decision, not a helper).**
📌 **Why I think it is right rather than convenient: the same three-line expression was about to appear at four
sites**, and *"applied five times in three days, each time to the field somebody was looking at"* is precisely
the failure mode we are here to stop. ⏱️ **If you would rather see it inlined four times, say so and I will.**

## §6 🔑 THE PINS — 15 moved, **ALL REWRITTEN, NONE DELETED**
**9 test files · 14 assertion lines out / 15 in · ZERO `test(` deleted.**
🔴 **The two count pins moved from NINE to SIX** (`note-guard-depth`, `remaining-zero`): `start` and the two
`expiry` fields left the `|| undefined` idiom. ✅ **Their claim is unchanged and is still the one that
matters — *the survivors are CORRECT and nobody may 'consistency-fix' them*** — and the new note says **these
three did not move for consistency either: they moved because they were emitting raw ISO dates to a reader.**
📌 **One pin is worth naming on its own:** `line-message.test.ts` asserted **`expect(leaveLine).toMatch(
/\d{4}-\d{2}-\d{2}/)`** — *the leave line is never a bare tally; what follows the label is a DATE, not "2"*.
🔑 **That CLAIM is the whole point of the line and it is untouched** — only the shape it looks for moved, ✅ **and
it now also asserts the ISO form is ABSENT**, so it can no longer pass on the thing this task removed.

## §7 ⚠️ `§17c` — RE-CHECKED BY NAME, AND ONE OF THE TEN *WAS* TOUCHED. Here is exactly what.
🔻 **Nine untouched. `leave-notice-req085-16d.test.ts` has one changed line** — 🔑 **and it is NOT a `§17c`
pin.** It is `§9`/`§16.4`'s conditional-pair assertion (`*Expiry date` STAYS on a course row), whose date moved
format. **That file appears on the ten-file list because it MENTIONS `§17c` in two comments as a
cross-reference; it pins no customer registration bytes.**
📌 ***My "checked by name" method matches a filename, not a pin, and today that difference showed up*** — so I
am reporting the file as touched and the claim as intact rather than letting the method's answer stand.
✅ *And the cross-reference it makes is now more true, not less: `§17c` specified `DD-MM-YYYY` for a date of
birth, and the expiry date it sits beside finally uses the same one.*

## §8 ❓ YOUR QUESTION — *what else are we checking by SOURCE SHAPE that could be checked by OUTPUT?*
🔑 **The test I would apply: is the property visible in the RENDERED STRING?** If yes, a source check is a
proxy and will undercount the same way three date sweeps did. **Named, nothing built:**

1. 🔴 **THE THAI-IN-A-GENERATED-VALUE RULE (`REQ-085 §4`) — the strongest candidate by far, and it has ALREADY
   FAILED TWICE the way dates did.** `ครั้ง` was found by a customer, not by us; and **it was still sitting in
   two test INPUT strings yesterday.** ⚠️ **Today it is held by per-message assertions** — *the exact shape
   `§7` was in.* ✅ **The probe already exists: render everything, assert no Thai OUTSIDE the strings `t()`
   owns.** 📌 **The hard half is honest and I will say it: the messages are legitimately Thai**, so the check
   is *"no Thai in a value the SYSTEM GENERATED"*, which needs the probe to supply non-Thai inputs and compare
   against the i18n table. **Real work, not free — but it is the one I would do next.**
2. 🟡 **THE LABELLING CONVENTION (`label :` vs `label:`) — TASK-328, and it is HELD.** 🔑 **It is a pure output
   property** (*every field line matches `^\S.* : ` or is a known exception*) — ⚠️ **and it currently lives in
   NINE BRANCHES**, which is the same "true by nine acts of care" shape. 📌 *When TASK-328 is unheld, this is
   how I would hold it.*
3. ✅ **"No message ends in whitespace" (TASK-325) IS ALREADY an output check — and it is the one that has
   never come back.** 🔑 ***That is the evidence for the whole idea, and it was in front of us the entire
   time.***
4. 🔻 **And one that is NOT a candidate, so the list is not just enthusiasm:** the `?? "-"`-vs-omit rules
   (TASK-331) **cannot be an output check** — ⚠️ *whether an absent field should print `-` or vanish is a
   per-field REQUIREMENT, not a property of the string.* 📌 **An output check can prove a field is not a bare
   label; it cannot know which of the two correct answers the customer chose.**
