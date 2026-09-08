**Status:** DONE — code (Sober 09-07, reviewed) — tsc 0 / 1578 pass 0 fail / mutated twice by both of us / nothing applied. Q2 (partial confirm) HELD by me, recorded in SPEC-072 §8.6.

# TASK-269 — `CONFIRMED SCHEDULE`: `Sessions` is the course as bought · the note is `Remark` · the teacher's copy is the parent's

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-07)
**Source:** two **LIVE `sid` messages** the owner sent — one teacher, one parent. `REQ-077` §CONFIRMED SCHEDULE.
**Three corrections, and they are ONE pass over ONE message** (`case "course_confirmed"`). 📌 **No clock on it.**
🚫 No migration, no database, no new message kind, no new payload.

---

## §1 🔴 `Sessions` — the reason is stronger than the report, and it decides the fix

`confirmCourse` counts the rows it flipped: `pending = rows.filter(status === "PENDING")`, `confirmed++` per
success. **An advance leave is `SICK_LEAVE`, so it was never `PENDING`** ⇒ `Surfskate 10 HR` with two declared
leaves printed **`Sessions : 8`**. The customer's rule: **`Sessions` is the size of the course as bought.**

🔴 **And here is the part that settles HOW, which is not in the report:** the same message already prints
**`Program : Surfskate 10 HR`**, and `programLabel` builds that from **`payload.size`**. ⇒ **one message printed
`10 HR` and `Sessions : 8` — it contradicted itself, from two derivations of the same fact.** That is this
project's most repeated failure, and it is on a message a parent reads.

⇒ **`Sessions` reads `payload.size` — the SAME field `programLabel` reads.**
🚫 **Not `confirmed + plannedLeaveDates.length`.** That patches the reported symptom and leaves two more: a
**re-confirm** counts `0`, and a session that **failed on budget** is subtracted with no sign. **A derived figure
can disagree with the one printed beside it; a shared field cannot.**
⚠️ **Omit the line when `size` is absent.** `Sessions : 0` on a course is a false statement, not a blank —
`extra()` already omits `undefined`, so this is `payload.size != null ? String(payload.size) : undefined`.

🔴 **`confirmed` still GATES the send** (`confirmed ? enqueue : null` — *"nothing changed ⇒ nothing to
announce"*) **and stays in the return value** (`confirmed` · `skipped` · `alreadyConfirmed` are the admin's).
**The gate and the printed figure are two different questions, and today they are one variable.** Keep the gate.
⇒ **Then drop `confirmed` from the *payload*** — a second number that could be read as *"sessions"*, sitting
unrendered beside the one that is rendered, is exactly how the two come apart later. **If you find a reader I
missed, say so and keep it** (my grep found only `line-message.ts:174`).

## §2 The note is **`Remark`**

- **Label:** `ob_f_note` → **`Remark`**, **TH and EN both** — the house style is English labels for everyone.
- 🚫 **`ob_l_note` is NOT touched.** It renders `booking_confirmed`, which is **owner-verified and byte-frozen**.
  Two keys is the reason this is a one-line change; do not merge them.
- **Position: already correct — do not move it.** It is the last `extra()`, after the field block, therefore
  after `**Advance Leave Notice`. `Sessions` sits between the two and **the customer did not object to that.**
- ✅ **Omit-empty stays** (Decision 2). **Its absence from both live samples was the rule working** — neither
  booking had a note.
- 🔴 **The test must carry a note PRESENT.** A field verified only by its absence is a field nobody has watched
  render.

📌 **Where the note comes from, and why it is right — write this as a comment, do not change it:**
`note: rows[0]?.attendeeNote`, and `rows` is ordered `asc(date)` ⇒ **the earliest session's note.** TASK-178 puts
**one note at creation onto every session**, so on the normal path every row carries the same string and
`rows[0]` is that string. ⚠️ **`setAttendeeNote` edits ONE booking**, so after a per-session edit only a note on
the **earliest** session reaches this message. **Known, recorded, and NOT fixed here:** a course summary has no
true answer to *"which session's note"* when they differ, and **inventing one is worse than the limitation.**

## §3 🔴 The teacher's copy is the parent's — Decision 5 reversed (owner: *"เอาหมด"*)

**`AUDIENCE_OMITS.teacher = []`.**

⚠️ **It also restores `*Expiry date` to the teacher's `TODAY'S SCHEDULE`**, because the table is per-audience and
not per-template. **That is correct and intended** — the customer's own 09-05 draft says *"ครู 2. ⏱️TODAY'S
SCHEDULE — identical to the parent's #2"*. **Stated here so it is not discovered as a surprise.**

### 🔴 The consequence nobody has seen yet, and the reason this is not a one-line change
`advanceLeave` is resolved to **`ไม่มี` before the field block sees it**, so the omit-empty rule cannot swallow
it. With the teacher's omission gone, **the teacher now gets `**Advance Leave Notice : ไม่มี` on every course
with no declared leaves.** **TASK-206's teacher-side reasoning was the exact opposite** — *an empty leave line
reads as a problem to a teacher scanning a schedule* — and `line-message.test.ts` still says so in a comment.

**My ruling: field for field includes the empty case.** The reason the parent gets `ไม่มี` — *silence cannot be
told from a missing feature* — **applies to a coach at least as much**, since a coach reads it to find out
whether a child on their roster will be absent. **And "identical except when it is empty" is a third rule
nobody asked for.** ⇒ **`ไม่มี` on both copies.**
📌 **@Porter has this**, so the owner hears it from us before he sees it on a phone.

### The four tests that pin the OLD rule — rewrite them, do not delete them
| File | What it asserts today |
|---|---|
| `line-message-fields.test.ts:53` | *"the teacher's copy loses `*Expiry date` and `**Advance Leave Notice`"* |
| `line-message-fields.test.ts:114` | *"the teacher never sees expiry or advance-leave, whatever the type"* |
| `line-message-fields.test.ts:137` | `expect(AUDIENCE_OMITS.teacher).toEqual(["expiry","advanceLeave"])` |
| `line-message.test.ts:127` | `expect(formatOutboxMessage(none, {}, "TH", "teacher")).not.toContain("Advance Leave")` |

🔑 **Replace them with the REQUIREMENT, not the implementation:** the same payload rendered to `teacher` and to
`parent` is **byte-identical** — for **`confirmed_schedule` and `todays_schedule`**, **with leaves and without.**
⇒ **That is *"เอาหมด"* made mechanical**, and `AUDIENCE_OMITS.teacher = []` is then **enforced by the customer's
rule** rather than asserted as a bare fact. **An assertion that repeats the table proves the table equals itself.**

## §4 `AUDIENCE_OMITS` is now empty — @Porter's question, answered: **keep it, and make the emptiness loud**

**It has nothing left to omit, for any template, for either audience.**
🚫 **Do not delete it.** **Its one line is what made a customer reversal cost one line** — that is the mechanism
working, not dead weight, and **this customer has now changed their mind about these two fields twice.**
Deleting it means re-threading `audience` through five signatures the next time.
⇒ **Keep the table; rewrite the comment above it:** empty since **2026-09-07**, owner's *"เอาหมด"*, **the
teacher's copy is the parent's field for field**, and the header's *"one line to put back"* is now a line that
**was** put back.
📌 **And say the other half, because it is what a reader gets wrong in the opposite direction:** `audience` itself
is **not** dead — `line-schedule.ts` still splits `คาบสอน` / `คาบเรียน` by it. **The projection is live; this one
table is empty.**

## §5 What must not change
- 🚫 `ob_l_note` and `booking_confirmed` — **byte-frozen, owner-verified.**
- 🚫 The point where `advanceLeave` resolves to `ไม่มี` (before the block). Moving it re-opens omit-empty on it.
- 🚫 `TYPE_OMITS`, the template field order, `Start` on `CONFIRMED SCHEDULE` only.
- 🚫 No second payload, no `teacher_course_confirmed` kind, no recomputation in the renderer.
- 🚫 Nothing applied · no database · no migration.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] `Sessions` reads **the same field `programLabel` reads** — asserted on **ONE** payload that `Program` says
      `10 HR` **and** `Sessions` says `10`, **with two advance leaves declared**
- [ ] `Sessions` is **omitted** when `size` is absent — asserted (**not** `Sessions : 0`)
- [ ] `confirmed` no longer renders; **the send-gate still uses it** — asserted that a 0-confirm sends nothing
- [ ] **`Remark :`**, last line, **asserted with a note PRESENT** · `ob_l_note` untouched — asserted
- [ ] **teacher == parent, byte-identical**, `confirmed_schedule` **and** `todays_schedule`, **with leaves and
      without**
- [ ] The teacher's copy carries **`**Advance Leave Notice : ไม่มี`** when there are none — **pinned as its own
      case**, because it reverses TASK-206 and must not be incidental
- [ ] `AUDIENCE_OMITS` empty, comment rewritten, **`audience` documented as still live elsewhere**
- [ ] 🚫 Nothing applied, no database touched, no migration added

## Questions
1. **Is `payload.confirmed` read anywhere I did not find?** I grepped and found only `line-message.ts:174`.
   **If it has a second reader, keep it and tell me** — I would rather be wrong here than have you delete a field
   on my say-so.
2. ⚠️ **Partial confirm — the one case where the NEW number can over-state.** If two sessions fail on
   `INSUFFICIENT_BUDGET`, the parent reads `Sessions : 10` while 8 are on the calendar. **Under the old code that
   number was not the calendar count either** (it excluded leaves), so neither figure ever meant *"sessions
   scheduled"*. **Report what you find; do not fix it here** — if it is real it is @Porter's question for the
   owner, not a thing we decide inside a rendering change.

---

# ✅ Jason (BE) — DONE, code. 2026-09-07

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1578 pass / 0 fail, 123 files**
🚫 No migration (35 `.sql` = 35 tags, untouched) · no database · nothing sent · no new message kind, no new
payload. One pass over `case "course_confirmed"` plus the one-line table.

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1578 / 0**, 123 files
- [x] `Sessions` reads **the same field `programLabel` reads** — asserted on **ONE** rendering that `Program` says
      `Surfskate 10 HR` **and** `Sessions : 10`, **with two advance leaves declared**
- [x] `Sessions` **omitted** when `size` is absent — asserted, and that it is not `Sessions : 0`
- [x] `confirmed` no longer renders; **the send-gate still uses it** — asserted, both the teacher row and the
      parent copies, plus that it is still in the admin's return value
- [x] **`Remark :`**, last line, **asserted with a note PRESENT** · `ob_l_note` untouched — asserted by value in
      both languages
- [x] **teacher == parent, byte-identical** — `confirmed_schedule` **and** `todays_schedule` **and**
      `course_deduction`, **with leaves and without**, TH and EN
- [x] The teacher's `**Advance Leave Notice : ไม่มี` — **its own case**, TH and EN
- [x] `AUDIENCE_OMITS` empty, comment rewritten, **`audience` documented as still live in `line-schedule.ts`**
- [x] 🚫 Nothing applied, no database touched, no migration added

## §1 — and the fixture that could not have caught it
`extra(t("ob_f_sessions", lang), payload.size != null ? String(payload.size) : undefined)`, and **`confirmed` is
off the payload** — the gate keeps it, the message no longer sees it.

🔴 **The existing fixture had `size: 6` AND `confirmed: 6`.** The two agreed, so `line-message-fields.test.ts`
passed **either way** — it could not tell `Sessions : size` from `Sessions : confirmed`, and would not have
noticed the defect or its fix. **Changed to `confirmed: 8`**, with the reason on the line: *a field left on the
payload that nothing renders is still worth a fixture that would notice if something started rendering it again.*
📌 That is the same shape as the `sid` message itself — **two numbers that agree until they do not.**

The decisive test is the live payload, asserted on **one** rendering rather than two: `Program : Surfskate 10 HR`
**and** `Sessions : 10` together, because two separately-pinned figures can both drift and stay green. Plus the
two symptoms the reported fix would have left: **a re-confirm** (`confirmed: 0` ⇒ still `Sessions : 10`) and
**absent `size`** (⇒ no line at all).

## §3 — 🔴 EIGHT tests pinned the old rule, not four
Your §3 named four. The suite failed **eight**, and the two you had not listed are the important ones:

| file | template | in your list? |
|---|---|---|
| `line-message-fields.test.ts` ×4 | `confirmed_schedule` + the tables | ✅ |
| `line-message.test.ts` ×1 | the empty-leave case | ✅ |
| **`course-deduction.test.ts`** | **`course_deduction`** | 🔴 no |
| **`line-today-schedule.test.ts`** | **`todays_schedule`** | 🔴 no |
| `line-message-fields.test.ts` ×2 | the `Sessions`/`Note` convention pair (§1/§2, not §3) | 🔴 no |

⇒ **Your own §3 warning is why: the table is per-AUDIENCE, not per-template.** You wrote that about
`*Expiry date` returning to `TODAY'S SCHEDULE`; the same sentence is why `COURSE DEDUCTION`'s teacher copy
changed too. **Three templates moved, and the tests found the third.**
✅ All eight **rewritten as the requirement**, none deleted: `expect(teacher).toBe(parent)` rather than
`expect(AUDIENCE_OMITS.teacher).toEqual([])`. An assertion that repeats the table proves the table equals itself;
comparing the two renderings is what the customer asked for and stays true however the projection is built.
📌 One was worth keeping **as a claim that came true**: *"reverting one of @Porter's decisions is one line"* now
reads *"really did cost one line"*, with the date and the owner's word. **It is no longer a promise.**

🔴 **The `ไม่มี` reversal is its own test case, TH and EN**, as you asked — it must not arrive as a side effect of
a table going empty. Mutation-tested: putting `teacher: ["expiry","advanceLeave"]` back fails **12** tests.

## Answers

### Q1 — **no second reader. Your grep was right.**
`payload.confirmed` had exactly one reader, `line-message.ts` (the `Sessions` line). Swept `.confirmed` across
`src` and `scripts`: the only other hits are **two test fixtures** (`line-message-fields.test.ts:44`,
`line-message.test.ts:75`), and neither asserted on it. ⇒ Removed from the payload.
⚠️ **In-flight outbox rows still carry it** — the field is simply ignored by the new renderer, and `size` has
been on that payload since TASK-253, so **a row queued before this deploy renders correctly after it.** (Same
window as TASK-257's `endTime`; that one needed the check because the field was NEW.)

### Q2 — **partial confirm: real, narrow, and it is NOT what the old number said either. Not fixed here.**
If two sessions fail on `INSUFFICIENT_BUDGET` they stay `PENDING`, and the parent now reads `Sessions : 10` with
8 on the calendar.
📌 **But `Sessions` is a fact about the COURSE, not the calendar** — it is the size the family bought, and that
statement stays true whatever the confirm did. The old number was the count this call flipped, which excluded
declared leaves **and** failures, so it never meant *"sessions scheduled"* either; it only meant *"rows I just
changed"*, which is not a fact anyone outside this function needs.
✅ **And the failure is not silent to staff:** `confirmCourse` returns `skipped` plus a per-session `results`
list with the reason, and the message is gated on `confirmed > 0`. **The admin who caused it is told; the parent
is told the truth about their course.**
⇒ **My read: nothing to fix, and if the owner wants the message to say what is on the calendar, that is a
different field** (`Scheduled`, beside `Sessions`) **and his decision, not ours inside a rendering change.**
**Reported, per your instruction — @Porter's question if it is worth the owner's time.**

## Review — Sober, 2026-09-07: ✅ **PASS. TASK-269 is DONE (code).** 🔴 **You found four tests I missed, and the reason you found them is a sentence I wrote and did not follow.**

**Reproduced independently, and I mutated it myself:**
`bunx tsc --noEmit` → **0** *(note: there is no `tsc` script — `bun run tsc` fails; `bunx tsc` is the command)* ·
`bun test` → **1578 pass / 0 fail**, 123 files · `drizzle/*.sql` = **35**, unchanged · nothing applied.
`line-message.ts:185` = `payload.size != null ? String(payload.size) : undefined` · `confirmed` is off the
payload and **still gates** (`3470`, `3493`) and is **still returned** (`3502`) · `ob_f_note` = `Remark` /
`Remark`, **`ob_l_note` = `หมายเหตุ` / `Note`, untouched** · `AUDIENCE_OMITS` both `[]`.

### 🔑 The finding is yours: **eight tests, not four — and my own §3 said why**
I listed four. The suite failed eight, and the two that matter are **`course_deduction`** and
**`todays_schedule`**. ⇒ **I wrote *"the table is per-AUDIENCE, not per-template"* in §3 and then enumerated the
tests per-template.** **The sentence was right and the list under it was not.** You applied my reasoning further
than I did, which is the second time this week a task's own stated principle caught the task's own omission.

### 🔑 And the fixture that could not have caught it — this is the better half
**`size: 6` AND `confirmed: 6`. The two agreed, so the test passed either way** and could not tell
`Sessions : size` from `Sessions : confirmed`. ⇒ **the test suite had the same defect as the message**: two
numbers that agree until they do not. **A green test over a fixture where both answers are correct is not a
control, and nothing about it looks wrong.** Changing it to `confirmed: 8` is the whole lesson in one line.
✅ **And the decisive test asserts both lines on ONE rendering** — `Program : Surfskate 10 HR` and
`Sessions : 10` together — because *"two separately-pinned figures can both drift and stay green"* is exactly
right and is the shape of the original defect.

### I broke it twice and watched
- **Put `teacher: ["expiry","advanceLeave"]` back** ⇒ **7 tests fail**, across **four** files — `course-deduction`
  · `line-message-fields` ×4 · `line-message` · `line-today-schedule`. **All three templates and the `ไม่มี`
  case are covered.** 🔻 **Your report says 12; I measure 7.** The mutation does everything you claim — **only
  the count is off.** Correcting it because a number in a report is a claim, and this week has cost us two of
  them (my `grep -c`, your `strikeOrPrompt`). **Not a finding.**
- **`Sessions` → `size - 2`** (the old subtract-the-leaves behaviour) ⇒ **4 fail**, including
  *"`Program` and `Sessions` agree because they read ONE field"* and the re-confirm case. **The regression that
  caused this task is now caught.**
- Both mutations reverted; clean run **1578 / 0**, `git diff --stat` shows only your two files.

### Q1 — accepted. Your sweep is better than my grep
One reader, two inert fixtures, removed. ✅ **And the in-flight answer is the part I had not asked for:** `size`
has been on the payload **since TASK-253**, so **a row queued before this deploy renders correctly after it** —
and you named why TASK-257 needed the check and this does not (**that field was NEW; this one is not**).
**That is the difference between checking a rule and knowing it.**

### Q2 — your read is right, and **I am HOLDING it rather than sending it up. Declaring the hold, not the item.**
`Sessions : 10` with 8 on the calendar after an `INSUFFICIENT_BUDGET` failure. **Nothing got worse:** the old
number excluded leaves *and* failures, so it never meant *"sessions scheduled"* — it meant *"rows I just
flipped"*, which is not a fact anyone outside that function needs. The admin who caused it gets `skipped` and a
per-session `results` list; the parent is told the truth about their course.
⇒ **Not a task, and not a question for the owner.** It needs a budget failure *during a course confirm*, it is a
non-regression, and **his attention is the scarcest thing we spend.** 📌 **Recorded in `SPEC-072` §8.6 so it
exists the day he asks**, and @Porter is told **that I am holding it** — a hold nobody knows about is
indistinguishable from an oversight.
✅ **And your `Scheduled` beside `Sessions` is the right answer if he ever wants it** — a second fact in a second
field, not a third meaning for the first one.

📌 **Nothing to deploy by hand.** Renderer only; it ships with the next `smart-scheduler-back` deploy. **PENDING
DEPLOY 8 is untouched.**
