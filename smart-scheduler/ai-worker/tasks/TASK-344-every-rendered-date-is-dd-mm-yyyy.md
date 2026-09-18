# TASK-344 — every rendered DATE is `DD-MM-YYYY` (`REQ-087 §7`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-11)
▶️ **OWNER-CHOSEN** — *"เอา แก้ให้เป็น 08-09-2026 เหมือนกันทุกที่"*. ⏱️ **THE LAST ITEM BEFORE THE DEPLOY.**
🚫 No migration, no FE change. ⛔ **The chain stays stopped — this one item, nothing rides along.**

---

## §1 📌 MY LIST IS A CANDIDATE LIST, NOT A FINDING — verify it before you build
🔑 **I ran the sweep to SIZE this, and my counts have been wrong four times this batch.** ⇒ **treat every line
below as a place to look.** ✅ **Your number overrides mine, silently.**

**Rendering a RAW ISO date into a `Date :` field:**
| | branch | note |
|---|---|---|
| `line-message.ts:367` | **`course_deduction`** | 🔴 **LIVE — and it is the message we have fixed TWICE today** |
| `line-message.ts:400` | `booking_resumed` | live |
| `line-message.ts:439` | `sick_leave` | ⚪ **a DEAD branch — no producer** (TASK-333's inventory) |
| `line-message.ts:449` | `leave_teacher` | ⚪ **DEAD — same** |
| `line-today-schedule.ts:91` | the AUTO daily schedule | 🔴 **the known instance, `dash(r.date)`** |
⚠️ **Fix the dead two anyway** — 🔑 *a dead branch that renders the wrong format is a trap for whoever revives
it* — ✅ **and say in the report that they are dead, so nobody reads the change as a behaviour change.**

## §2 🚫 THE BOUNDARY — do NOT touch these, and one of them is a question I have already asked
✅ **@Porter's boundary, and it holds:** ***a WEEKDAY IS NOT A DATE.*** **`§7.1`'s `Date : Friday` STAYS** —
`REQ-085 §15` is the owner's own ruling and he re-affirmed it by keeping `§7.1` out of `§6b`.
⇒ ***"every date is `DD-MM-YYYY`" is about FORMAT; it does not turn a weekday into a date.***

🔴 **AND I FOUND A SECOND BOUNDARY HIS SENTENCE DOES NOT COVER. STOP ON BOTH:**
| | what it renders |
|---|---|
| `line-leave.ts:68` | **`อังคาร 22/09`** — WEEKDAY **+** a date fragment, in the `§14` leave picker |
| `line-schedule.ts:57` | **`อังคาร 22/09`** — the same shape, as the teacher's weekly day HEADING |
⚠️ **These are not weekdays and they are not `DD-MM-YYYY`. They are a THIRD thing, and it was CHOSEN:**
🔑 **TASK-316 decided the picker's form deliberately, and TASK-318 said in as many words that `§16d`'s format
must NOT be used there** — ***"two surfaces, two audiences, two formats, both right."***
🚫 **So `ทุกที่` either reverses a ratified decision or does not reach them, and I am not deciding which.**
✅ **It is with @Porter now.** ⛔ **Leave both untouched; if the answer arrives while you are working, I will
send it.**

## §3 What must not change
- 🚫 **`§7.1`'s weekday** · `ob_dow_*` · `weekdayOf` · `dayHeading` and `shortDate` themselves.
- 🚫 **`§17c`'s ten customer-byte files** — ⚠️ *checked BY NAME last round; do it again and say so.*
- 🚫 `remainingLabel` (TASK-343) · the `Remark` lines · TASK-335's headers · the builder trim · the nine
  `|| undefined` sites.
- 🚫 **No second date function.** ✅ **`ddmmyyyy` from `time.ts` is the one, and it is already the one.**

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **Every LIVE `Date :` field renders `DD-MM-YYYY`** — asserted per message
- [ ] **Your own list, and whether it agrees with my five** — ⚠️ *say what I missed or over-counted*
- [ ] 🔴 **`§7.1` STILL shows the WEEKDAY** — asserted, ⚠️ *the assertion that keeps `§15` alive*
- [ ] 🚫 **`line-leave.ts` and `line-schedule.ts` UNTOUCHED** — asserted as an absence, **with `§2`'s reason in
      the test**, *so the next reader knows it is a pending question and not an oversight*
- [ ] **The two DEAD branches named as dead**
- [ ] **Every moved pin NAMED and COUNTED** · `§17c` re-checked by name
- [ ] 🔑 **Break it and watch** — **restore in a `finally`**, byte-identity by CHECKSUM *(yours, and it saved
      you twice on TASK-343)*

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **`ddmmyyyy` has now been applied five times in three days, each time to the message somebody was looking
at.** ⇒ ❓ **Is there a point where a date becomes a STRING before any renderer sees it** — *a payload field, a
service return, an enrichment* — **so that "every rendered date" could be true by construction rather than by
five separate edits?**
📌 *I ask because `§6a`'s denominator turned out to be already-present, and I would rather know the answer than
assume this one is different.* 🚫 **Name it. Build nothing.**

---

# 📤 REPORT — @Jason → @Sober (2026-09-11)

✅ **DONE (code).** **2049 pass / 0 fail**, **165 files** (+1: the sweep's own) · 🚫 no migration (**35 = 35**) ·
`tsc --noEmit` clean · no FE change, no new key. **Two source files, six test files, one new test file.**

## §1 🔴 YOUR FIVE WERE ALL REAL — and there were THREE MORE, one of them LIVE
✅ **Every line on your list checked out.** ⚠️ **One labelling correction:** `:400` is **ONE branch serving TWO
LIVE kinds** — `booking_paused` **and** `booking_resumed`. You named only the resume.

🔴 **AND MY SWEEP MISSED THE SAME THREE YOURS DID, on the first pass.** I found them only because a mutation
sent me back through `ctx.date` by hand:
| | | |
|---|---|---|
| `:468` **`teacher_assigned` / `teacher_unassigned`** | 🔴 **LIVE** — produced in `scheduler.service.ts` | printed **`2026-08-20 16:00-17:00` to a TEACHER** |
| `:417` `reschedule_requested` (old slot) | ⚪ DEAD | raw ISO |
| `:412` `reschedule_requested` (proposed slot) | ⚪ DEAD | raw ISO **— the same branch, twice** |

🔑 **WHY BOTH OF US MISSED THEM, and it is the useful part: their date is NOT in a `date:` field.** ***It is
interpolated into a COMBINED value*** — a `Time` line, an `Old slot` line — **so every sweep that greps the
field name walks straight past.** 📌 *Your list and my first list were the same list because we made the same
assumption about what a rendered date looks like in source.*
⇒ **8 sites fixed, not 5.**

## §2 🔴 ONE MORE I FOUND AND DID **NOT** TOUCH — same handling as your picker boundary
**`attention.ts:226` and `:348`** — the **DAILY DIGEST** renders `` `${b.date} ${hhmm(...)} · …` `` — **raw
ISO, in a label an ADMIN reads.**
🚫 **Not touched, and here is why rather than a shrug:** it is **not a `Date :` field**, it is an admin-facing
digest line, and *"เหมือนกันทุกที่"* was said about the messages families and coaches read. ⚠️ **Deciding that
it reaches an internal digest is the same KIND of decision as the picker** — 🔑 **and you told me neither of us
is making that one.** ✅ **It is named here, unfixed, for @Porter's list.** 📌 *Cost if he says yes: two lines.*

## §3 ✅ THE BOUNDARIES — both held, and both are asserted as ABSENCES with the reason
- **`§7.1`'s `Date : Tuesday` STAYS.** ✅ Asserted **in the sweep's own file**, because a sweep is where a rule
  like that gets lost.
- **`line-leave.ts` and `line-schedule.ts` UNTOUCHED**, with `§2`'s full reasoning in the test — *TASK-316
  chose the picker's form, TASK-318 said `§16d` must not reach it, you ratified it, and `ทุกที่` either
  reverses that or does not apply.* 📌 **Written so the next reader sees a PENDING QUESTION, not an oversight**
  — and so whoever answers it changes that test **on purpose.**

## §4 🔻 MY §15 GUARD WAS GREEN AND GUARDED NOTHING. The mutation caught it.
🔴 **Mutation D — *`§7.1` follows the sweep and starts reading `ctx.date`* — PASSED.**
⚠️ **Because I rendered `§7.1` with an EMPTY `ctx`**, so the sweep's own ternary fell straight back to the
weekday and every assertion stayed green. 🔑 ***The one case that could fail was the one I had left out*** —
and it is **the PRODUCTION case: a real `§7.1` message is enriched from the booking the row points at, so
`ctx.date` IS present.**
✅ **Fixed: both ctx shapes asserted, and the branch's use of `payload.weekday` pinned at the source** because
that is the fact the whole guard rests on. ⇒ **Mutation D now fails.**
📌 ***This is the third green mutation this month (TASK-314, TASK-316, now this) and all three were the same
mistake: I pinned the case I was thinking about instead of the case that breaks.***

## §5 🔑 THE PINS — 8 tests, **ALL REWRITTEN, NONE DELETED**
**6 files · 8 assertion lines out / 13 in · ZERO `test(` deleted.**
`course-deduction.test.ts` (the `Date :` line) · `daily-schedule-req085.test.ts` (the ONE-entry byte pin) ·
`message-time-format.test.ts` (**×2 byte pins**) · `no-placeholder-leak.test.ts` (**see below**) ·
`notify-on-leave.test.ts` (a dead renderer) · `line-message.test.ts` (**×2 — the two sites nobody had found**).

🔴 **`no-placeholder-leak.test.ts` is the one worth your eye.** It counted `?? "-"` and asserted **TWELVE**;
three `date: ctx.date ?? "-"` became ternaries, so **it is NINE.** ✅ **The CLAIM is untouched and is the one
that matters — *these five branches are safe BY REPETITION, a habit written out once per branch rather than a
chokepoint* — and the new shape is now pinned too**, including that it still ends in `-`. 📌 *The number moving
is that assertion working, not breaking.*

⚠️ **AND TWO STALE PINS FELL OUT, both TASK-338's class:** `message-time-format.test.ts` still carried
**`Remaining : 4/6 ครั้ง`** — *two tasks after TASK-335 removed the word and one after TASK-343 added the unit*
— **in two places.** 🔑 **They stayed green because the value is an INPUT the test hard-codes.** ✅ Corrected.
📌 *Found by running the suite, not by looking — which is the argument for byte pins over `toContain`.*

## §6 ✅ `§17c` — RE-CHECKED BY NAME, NOTHING SHIFTED
**All ten files, checked individually against the diff: zero touched.** *(`registration-copy-req079` ·
`birthdate-format` · `customer-english` · `line-bilingual` · `copy-scope-req085-16` ·
`advertised-is-reserved-req085` · `no-skip-first-child` · `leave-notice-req085-16d` · `line-role-buttons` ·
`line-silence`.)*

## §7 🔑 Mutation — FIVE, restore in a `finally`, byte-identity by CHECKSUM
| | |
|---|---|
| **A** `course_deduction` → raw ISO | **4 fail** |
| **B** the daily schedule → raw ISO | **4 fail** |
| **D** `§7.1` follows the sweep | **1 fail** *(after `§4`'s repair — it PASSED before)* |
| **E** the picker follows the sweep | **1 fail** |
| **F** the LIVE teacher pair → raw ISO | **3 fail** |
✅ **All five restores byte-identical by SHA-256**, `git status` = the nine intended files.
📌 **The dead branches are named as dead IN THE TEST, at the source** — *their producers asserted absent* — so
nobody reads their change as a behaviour change, and the claim cannot quietly stop being true.

## §8 ❓ YOUR QUESTION — *is there a point where a date becomes a STRING before any renderer sees it?*
🔴 **There is a candidate, it is a single point, and I do not think it works — and today gave me the evidence
rather than an opinion.**

**The candidate is `outbox.service.ts:21`'s `bookingContext`** — **ONE function builds the `MessageContext`
for every booking-based message**, and `date: b.date` is one line. Formatting there would make `ctx.date`
`DD-MM-YYYY` by construction for all of them.

🔴 **It fails BOTH of the tests we adopted on TASK-330.**
1. ❓ *Does the invariant have ONE answer for every instance?* — **No.** ⚠️ **`§7.1`'s weekday is COMPUTED from
   an ISO date** (`weekdayOf`), and **`§7.3` itself read `weekdayOf(ctx.date)` until this morning.** ⇒ **a
   chokepoint there would have broken the sibling message yesterday**, and it would break `weekdayOf` the day
   anyone wires it back.
2. ❓ *Can the chokepoint SEE the difference?* — **No.** `bookingContext` does not know which KIND will render;
   it builds one `ctx` for all of them. 📌 **And it is not even one point: `payload.to.date` and `TodayRow.date`
   never pass through it.**

✅ **The nearest thing that CAN see the difference is `renderFieldBlock`** — it knows the field key AND the
kind. 🔻 **But here is the fact that settles it: it would have caught FIVE of today's eight and missed exactly
the THREE that were hiding** — *because those three never reach a field block; they are interpolated into
combined values.* ⇒ ***A chokepoint would have covered the sites that were easy to find and missed the ones
that were hard.***

🔑 **So the honest answer is the same one as TASK-337's, and I think that is worth something: it is a TYPE
question, not a chokepoint question.** ✅ **If a date were a BRANDED type — an `IsoDate` that a message string
cannot accept, and a `DisplayDate` produced only by `ddmmyyyy`** — **the compiler would reject every one of
today's eight, including the three inside template literals.** 📌 *That is `TASK-333`'s parsed-payload work
pointed at one field.* 🚫 **I have not built it and am not proposing it as a task** — ⚠️ **it is a real cost
and it touches every date in the product** — 🔑 **but it is the only mechanism that makes "every rendered date"
true by construction rather than by a sixth edit.**
