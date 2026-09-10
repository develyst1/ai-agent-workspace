# TASK-330 — the MAP: which invariants of an outbox message live in the branches?

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-10)
⚪ **NO CLOCK.** 🔑 **ANALYSIS ONLY — no product code, no tests, no files in `src/` at all.** ⇒ **the safest
thing that can be done while @Tanya is on `uat`, and it is why you have it and not TASK-328.**
**Deliverable: a written map, in the TASK.** 🚫 **Not a fix, not a sweep, not a test.**

---

## §1 Why this exists, and why NOW rather than inside TASK-328
**I put this question inside TASK-328 and that was a mistake — it is HELD, so the question is held with it.**
🔑 **The map is what makes TASK-328's decision good, so it has to come FIRST**, and it is the one piece of that
work that risks nothing while a tester is reading messages on a phone.
📌 **Your own two-question audit, run properly once:** **(1) what is the narrowest point every message must
pass through? (2) which of its invariants live THERE, and which live in the BRANCHES?**

## §2 What I am asking for
✅ **The complete list of invariants an outbox message has, each marked:**
| column | meaning |
|---|---|
| **where it lives** | the compulsory exit · an AVAILABLE helper · the branches |
| **inherited?** | ***when the fifteenth branch is written, does it get this for free?*** |
| **held by** | construction · a test · nothing |
📌 **You have already named four** — the trim (moved to the exit), no-placeholder (habit in five), the
labelling convention (nine branches), and *a title belongs to a TEMPLATE, not a message*.
🔴 **The question is whether that list is COMPLETE.** ⚠️ **I am not asking for more examples — I am asking
whether there are invariants nobody has named at all.** 📌 *Candidates to rule in or out, and I expect some of
these to be non-properties like the title one: the `(-)` vs absent split · the 20-char quick-reply cap ·
language invariance · which AUDIENCE may receive a message · every message being non-empty.*

## §3 The one thing I want you to be hard about
🔑 **Say which entries are NOT properties, and why** — 📌 *your title finding was worth more than three real
properties would have been, because asserting it would have broken four correct messages.*
⚠️ **A map that lists only true things is less useful than one that records what looks like a rule and is
not**, ***with the reason*** — **that is what stops the next reader "fixing" it.**
🚫 **Do not fix anything you find. Do not write a test for anything you find.** ✅ **If something on the map is
alarming, say so and I will cut it as its own task.**

## Definition of Done
- [ ] 🔑 **The map, in the TASK** — every invariant with: where it lives · inherited yes/no · held by what
- [ ] 🔴 **You state whether the list is COMPLETE**, and if you cannot be sure, **what you would have to read
      to be sure** *(I will take "not certain, and here is the gap" over a confident list)*
- [ ] **Non-properties are listed WITH their reason** — ⚠️ *the title one is the model*
- [ ] **Anything alarming is named, not fixed**
- [ ] 🚫 **ZERO changes in `src/`** — `git status` clean except this file's absence from it, and say so
- [ ] 🔑 **Say which entry you would fix FIRST if TASK-328 did not exist** — *and if the answer is still
      TASK-328, say that; it would be a useful confirmation rather than a wasted question*

## Question
🔑 **Every rule you and I have arrived at this week has come from a DEFECT — the trim, the label, the two
writers, the two doors, the population, the placeholder.** ⇒ ❓ **Does this map contain anything that has
NEVER produced a defect and still looks fragile?**
📌 *I ask because everything we have learned is survivor-shaped: we know about the failures that happened to
be REPORTED.* ⚠️ **If the map has an entry that is fragile, un-asserted, and has simply never been hit, that is
the most valuable line in it** — 🔑 **it would be the first thing we have found by LOOKING rather than by
being told.**

---

## ✅ RESULT 2026-09-10 — @Jason. **ANALYSIS ONLY. `git status` in `smart-scheduler-back` is EMPTY.**
🚫 **Zero files added, changed or deleted in `src/`** — not a test, not a comment. **Nothing moved under
@Tanya.** *(I used two throwaway probes under `scripts/` and deleted them; the clean status above is after.)*
📌 **Everything below is MEASURED unless marked as reasoning** — I rendered all fourteen kinds rather than
reading the branches and believing myself.

---

## §1 THE MAP

### A · At the COMPULSORY EXIT — inherited free by branch fifteen
| invariant | held by | notes |
|---|---|---|
| **No trailing whitespace** | **construction + test** | `formatOutboxMessage` trims what `buildOutboxMessage` returns. **The only true one-and-done on this list.** |

### B · In an AVAILABLE helper — inherited ONLY if the branch chooses to use it
| invariant | where | inherited? | held by |
|---|---|---|---|
| **A field with no value prints NO LINE** (never `Label : `) | `line()` · `extra()` · `fieldLines` | ⚠️ **only for the 9 kinds that use them** | construction *for those 9* · **nothing for the other 5** |
| **The customer's ` : ` separator** | `extra()` · `fieldLines` | ❌ | **nothing** — `line()` renders `label: ` and 3 kinds still use it (**TASK-328**) |
| **Per-type / per-audience field lists** | `visibleFields` | ⚠️ only via `renderFieldBlock` | construction + test (`line-message-fields.test.ts`) |
| **`Program` shape per type** (`… 6 HR`, `1st Trial`) | `programLabel` | ⚠️ same | construction + test |

### C · In the BRANCHES — inherited by nothing
| invariant | reality | held by |
|---|---|---|
| **No un-interpolated `{placeholder}`** | **14/14 true**; 9 by omit-empty, **5 by hand-written `?? "-"`** (12 of them) | **a test, since TASK-327.** *Nothing in the code.* |
| **Every message is NON-EMPTY** | 14/14 + `default` | 🔴 **nothing** — a new `case` returning `""` breaks it |
| **A message FITS LINE's length limit** | unbounded on one renderer | 🔴 **nothing** — see §3 |
| **A title line, where there is one** | 10 of 14 | construction *(it is a template's, not a message's — see §2)* |

---

## §2 🚫 NOT PROPERTIES — with the reason, because the reason is what stops the next reader "fixing" them

**1. 🚫 "Every message has a title line."** *(the model, from TASK-325)* — **four kinds are deliberately
title-less single sentences** (`booking_paused`, `booking_resumed`, `leave_teacher`, `makeup_far_out`, plus
`default`). **A TITLE belongs to a TEMPLATE, not to a message**: the titled ones are exactly the ones that
render a field block. ⇒ asserting it breaks four correct messages.

**2. 🚫 "Outbox messages are language-invariant."** 🔑 **MEASURED: 10 of 14 DIFFER between TH and EN.** The 4
that do not are exactly `booking_confirmed`, `leave_notice`, `course_confirmed`, `course_deduction` — **the
four field-block templates**, invariant because `TEMPLATE_LANG` makes their labels English in both and their
values are dates and names. ⇒ **same shape as the title: it is a property of the TEMPLATE FAMILY, not of a
message.** ⚠️ **This one would be easy to "fix" into existence** — `§4`'s *"eng ล้วน"* reads like it applies to
everything, and `§16e` already had to draw that boundary once for the header.

**3. 🚫 "The 20-character quick-reply cap."** ⚠️ **A category error, not a weak property.** An outbox message
is pushed as `{ type: "text", text }` with **no quick reply at all** (`outbox.service.ts` → `pushMessage`).
The cap belongs to `line-reply.ts`, the CONVERSATION layer. ⇒ **nothing on this map can violate it.**

**4. 🚫 "`(-)` vs absent."** ⚠️ **Not a message invariant — a rule about ONE FIELD in ONE template.**
`**Advance Leave Notice` always prints `(-)`; `Remark` vanishes. §8.1 calls it *the trap*, and it is a trap
precisely because it is two opposite rules that look like one. ⇒ listing it as a message property would
invite exactly the generalisation the REQ warns against.

**5. ⚪ "The teacher's copy is the parent's."** 🔑 **MEASURED: 0 of 14 differ by audience.** ✅ True — but it
is **held by a deliberately EMPTY table** (`AUDIENCE_OMITS`, the owner's *"เอาหมด"*), not by construction. **It
is a current SETTING that is asserted, not an invariant** — and the table's own comment says do not delete it
because it is empty. **Correctly recorded as data + test; wrong to promote to a law.**

---

## §3 🔴 THE ALARMING ENTRY — and it is the answer to your Question

### `Remaining : 0` **cannot print. And nothing would tell us.**
`line-message.ts`, the `course_deduction` branch:
```ts
remaining: (payload.remaining as string) || undefined,
```
🔑 **`||`, not `??`** ⇒ **`0` is falsy ⇒ the field is `undefined` ⇒ omit-empty deletes the whole line.**
**Measured:** `remaining: 0` → the message renders with **no `Remaining` line**; `remaining: "0"` → renders
`Remaining : 0`. **Same balance, two payload types, two different messages.**

**Is it live? NO — and that is what makes it worth reporting.** The one producer is `deductionPayload`, and
`remainingLabel` returns `"0 HR"` / `"0/6 ครั้ง"` — **a non-empty string, always.** ⇒ **latent, not live.**

🔴 **Why it is the most valuable line on the map, in your terms:**
- **It has never produced a defect** and it is **un-asserted**.
- **Its failure is SILENT.** The message is simply one line shorter — and **omit-empty makes a missing line
  look intentional.** ⚠️ ***That is the owner's own `(-)` reasoning pointed at us: a field that vanishes when
  empty is indistinguishable from a field that was never sent.*** **We would not find this from the message.**
- **The compiler is not helping and looks like it is.** `payload.remaining` is `unknown` off a JSON column;
  `as string` is an ASSERTION, so the number path type-checks perfectly.
- **The precedent is in the same object:** `total: input.total` on that very payload **is a number.** ⇒ a
  producer writing `remaining: total - used` is a plausible, reviewable-looking change.
- 📌 **And zero is the one balance that matters most** — the deduction that empties a course is the message a
  parent is most likely to act on.
🚫 **Not fixed, per §3. Not tested, per §3.** ⚠️ **Say the word and it is a one-line task** — and I would ask
for `?? undefined` plus a producer-side type, not for a test.

### ➕ Second, smaller, and self-announcing: **nothing bounds a message's LENGTH**
`renderSchedule` (the teacher's COMMAND schedule) caps at **20 rows** with a *"+N more"* line.
🔴 **`renderTodaySchedule` — the AUTO morning push, the same content — has NO cap**, and `line-client.ts` has
no length guard. ⇒ **two renderers of one thing, one respecting a platform limit and the other not.**
⚠️ **But its failure is LOUD**: LINE rejects an over-long push, the row goes `FAILED` with an error, and the
outbox shows it. ⇒ **listed, not alarming.** 📌 Worth noting it is the *same* two-writers shape and that the
cap is a **platform limit**, not a shape decision — so @Porter's *"AUTO and COMMAND are different shapes"* does
not cover it.

---

## §4 IS THE LIST COMPLETE? **Not certain — and here is exactly where my certainty ends.**

✅ **I read, end to end:** `line-message.ts` · `line-message-fields.ts` · `line-today-schedule.ts` ·
`attention.ts`'s digest builder · `outbox.service.ts` · `line-client.ts`'s push · the i18n table's outbox keys.
✅ **And I MEASURED rather than reasoned** for: language variance · audience variance · placeholder leaks ·
trailing whitespace · empty messages · the zero case.

🔴 **The gap is the PRODUCERS.** Everything above tests the renderer **given a payload**. What a payload
actually contains at runtime is decided in `scheduler.service.ts` (~3000 lines) and a dozen smaller writers,
and **`row.payload as any` means the compiler checks none of it.** ⇒ **the `Remaining : 0` finding lives
exactly in that gap, and I found it by reading one branch's `||` — not by a method that would find the others.**
📌 **To be sure, I would have to read every site that builds an outbox payload and check each field's TYPE
against what the branch does with it.** ⚠️ **That is a real task and I have not done it.** ✅ It is also the
one that would turn *"the renderer is safe given good input"* into *"the message is safe"*.

---

## §5 WHICH I WOULD FIX FIRST — **still TASK-328, and now for a reason I did not have before**

🔑 **The map says the labelling convention is the ONLY invariant on it that is held by NOTHING AT ALL** — not
construction, not a test. Every other line has at least one of the two. ⇒ **it is not merely the most valuable;
it is the only one currently unheld in both senses.**
📌 **And your §1 objection to the obvious fix is confirmed by the map rather than merely accepted:** normalising
at the exit would rewrite colons inside `📅CONFIRMED SCHEDULE:` and inside a parent's typed `Remark` — **both
are on the map as things a message legitimately contains.** ⇒ **the exit cannot hold this one, and the map is
what proves it rather than my say-so.**
✅ **So the question you put in TASK-328 — *can the HELPER be made COMPULSORY?* — is the right one**, and I will
answer it in writing there when you release it.

---

## ❓ YOUR QUESTION — **yes, and it is `Remaining : 0`.**

**Everything else on this map came from a defect someone reported.** `Remaining : 0` did not: it has never
fired, it is un-asserted, and **it is the first thing on this list found by LOOKING.**
🔑 **And the survivor-shape shows in HOW it hid:** every rule we learned this week came from a message somebody
SAW and objected to — a blank line, a wrong date, an identical notice. ⚠️ ***This one produces a message with
nothing visibly wrong with it.*** **A parent reads a COURSE DEDUCTION missing one line and has no way to know a
line is missing** — which is why no report would ever have arrived.
📌 **That is the class the reporting channel cannot reach: not *the message is wrong*, but *the message is
incomplete and looks complete*.** ⇒ **the only way to find these is the method that found this one — read what
the code does with an EMPTY or ZERO value, field by field, rather than waiting for a screenshot.**
🔑 **If you want a third task out of this, that is it, and it is bigger than one line:** ***every field in
every message, rendered with an empty and a zero value, and the result read by a human.*** **That is §4's gap
made into work, and it would be the first thing we do because we looked.**

**BALL: @Sober — TASK-330 delivered as analysis. ⛔ Nothing in `src/`. TASK-328 when you release it.**
