# TASK-332 — `Remaining` must be able to say ZERO

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-10)
⚪ **NO CLOCK.** ✅ **LATENT today — the producer cannot currently send a falsy value — so the change is
INVISIBLE on every message @Tanya can produce**, which is what makes it safe during her round.
🚫 No migration, no FE change, **no copy change.** **Source: your TASK-331 `§2`, the one row you judged WRONG.**

---

## §1 The one that is wrong, and it is one — not thirteen
🔻 **My "thirteen-wide class" was an overstatement and your sweep corrected it.** ✅ **Ten can lose a line,
three fall through to `-`, and TWELVE OF THE THIRTEEN ARE CORRECT** — `Remark` is the customer's `*ถ้ามี`
rule, `expiryDate` absent is a true statement, `studentName` absent is TASK-224's own decision.
🔴 **`line-message.ts:307` — `remaining` on `course_deduction` — is the exception, and your reason is the right
one:**
> ***`Remaining` is the only field whose absence removes the MESSAGE'S PURPOSE. A `COURSE DEDUCTION` exists to
> tell a parent what is left; without that line it is a receipt with no balance.***
⚠️ **And omit-empty makes the absence look deliberate** ⇒ **nobody would ever report it.**

## §2 The fix has TWO halves, and neither is sufficient alone
🚫 **`?? undefined` ALONE IS NOT THE FIX.** 🔑 **It converts `remaining: ""` from an absent line into
`Remaining :` with nothing after it** — **TASK-219's *information that went missing*.** ⇒ **you would trade a
silent absence for a visible lie.**
✅ **So: guard the value AND constrain the producer.**
1. **The renderer distinguishes *absent* from *zero*** — ⚠️ **`""` must not become a bare label**, and 🔑 **`0`
   must render.** 📌 *You decide the expression; `?? undefined` plus an emptiness check, or a small helper —
   say which and why.*
2. **The producer side declares what it sends.** 📌 *`deductionPayload` builds it and `remainingLabel` returns
   a non-empty string today — make that a fact the compiler holds rather than one we re-established by
   reading.*
⚠️ **If half 2 turns out to want the discriminated union rather than a local type, STOP at half 1 and say so**
— 🔑 **that is TASK-333 and I do not want it started inside this one.**

## §3 The MIRROR, and I want your judgement not a fix
**Your `§3` found `String(payload.weeks ?? "-")` on `makeup_far_out`: `??` guards `null` and NOT `""`** ⇒
*"…: ⟨blank⟩ สัปดาห์…"*, a half-sentence. **Same for `replaces`.**
🔑 ***The file has both bugs, one per idiom: `||` eats a legitimate zero, `??` lets an empty string through.***
📌 **That is the sharpest thing in your sweep** and I want it recorded in the code, next to whichever one you
touch. ❓ **Fix `weeks` here too, or leave it?** ⚠️ **It is LATENT and its failure is VISIBLE (a half-sentence
is something a human would report), so it is not the same severity** — **say which you did and why.**
🚫 **Do not sweep for more idioms.**

## §4 ✅ One of your two *not established* rows is now CLOSED — by me
**Row 5, `startDate` on `course_confirmed`: `schema.ts:346` declares `startDate: date("start_date").notNull()`.**
⇒ 🚫 **the producer cannot send it falsy.** ✅ **Row 5 is SAFE, not unknown.**
📌 **One grep, and it was mine to run rather than yours** — *I asked for "not established" instead of a guess
and you gave me exactly that, which is what made it cheap to close.*
⚠️ **Your other one — the five producers you did not open — stays open and is fine**: *the renderer is safe
whatever they send, and you said which claim you were and were not making.*

## §5 What must not change
- 🚫 **The other twelve `||` sites** — **they are CORRECT and your table says why.** ⚠️ *Changing them "for
  consistency" would delete the customer's own `*ถ้ามี` rule.*
- 🚫 The `COURSE DEDUCTION` copy · `remainingLabel`'s output strings · `§7`'s pins · `programLabel`.
- 🚫 No migration · no FE change · no new i18n key.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **`remaining: 0` RENDERS `Remaining : 0`** — asserted, ⚠️ *the assertion that did not exist and is the
      whole task*
- [ ] 🔑 **`remaining: ""` does NOT produce a bare label** — asserted as an absence, ⚠️ *the trap*
- [ ] **You say which expression you chose and why**
- [ ] **`§3` answered** — `weeks` fixed or left, with the reason, and 🔑 **the two-idiom sentence written into
      the code**
- [ ] 🚫 **The other twelve sites are untouched** — asserted, *with the reason, so nobody "consistency-fixes"
      them later*
- [ ] 🔑 **Break it and watch** — **mutation and restore in ONE tool call**, restore verified byte-identical
- [ ] ✅ **Nothing @Tanya can see changes** — say so explicitly

## Question
🔻 **I counted an idiom thirteen times and called it a thirteen-wide class. You read all thirteen and found ONE
defect and twelve correct usages.** 🔑 **I did to your finding exactly what I have twice told you not to do to
mine: I treated a COUNT as a FINDING.**
⇒ ❓ **Is there a cheap way to tell the two apart BEFORE the reading — a count that is evidence versus a count
that is only a place to look?** 📌 *My instinct: a count is evidence when every instance implements one RULE,
and only a place to look when the instances merely share a SHAPE. `withExit` was a rule; `|| undefined` is a
shape.* ⚠️ **Tell me if that distinction survives contact with the two you have actually swept**, 🔑 **or
whether the honest answer is that a count is NEVER evidence and I should stop reporting one as though it were.**

---

## ✅ RESULT 2026-09-10 — @Jason. **2001 pass / 0 fail**, 161 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**. 🚫 No migration, no FE change, no copy.
✅ **NOTHING @TANYA CAN SEE CHANGES** — `remainingLabel` returns `"0 HR"` / `"0/6 ครั้ง"`, a non-empty string,
so every message that exists today renders **byte-for-byte as before.** *(Asserted, not claimed.)*

- [x] 🔑 **`remaining: 0` renders `Remaining : 0`** — the assertion that did not exist
- [x] 🔴 **`remaining: ""` does not produce a bare label** — asserted as an absence, ⚠️ **and the mutation proves
      the obvious fix would have failed it**
- [x] **Both halves** — the renderer guards, and `deductionPayload`'s return type is now DECLARED
- [x] 🚫 **The other twelve are untouched** — count asserted **with the reason in the source**
- [x] **`§3` answered** — `weeks` LEFT, reason below, and 🔑 **the two-idiom sentence is in the code**
- [x] 🔑 **Break it and watch — TWO mutations, both in ONE tool call**, restore verified **byte-identical**

### §2 ✅ The expression: a HELPER, and the mutation showed the trap is DEEPER than either of us said
```ts
const fieldValue = (v: unknown): string | undefined => {
  if (v === null || v === undefined) return undefined;
  const s = String(v);
  return s.trim() ? s : undefined;   // `0` → "0" · `""` and `"   "` → absent, never a bare label
};
```
**I ran your `?? undefined` as mutation B, and it fails TWO assertions, not one:**
1. ⚠️ **It does not even fix the ZERO.** `(payload.remaining as string) ?? undefined` leaves `0` a NUMBER, and
   **`fieldLines`' own omit-empty check is `facts[f] ? …` — also falsy** ⇒ the line is dropped one layer
   further down. 🔑 ***The fix has to produce a NON-EMPTY STRING, not merely a defined value*** — which no
   operator can express.
2. 🔴 **And your bare-label trap is real, on WHITESPACE rather than on `""`.** `"" ?? undefined` → `""` → still
   falsy → still absent. But **`"   " ?? undefined` → `"   "` → TRUTHY ⇒ `Remaining :    `** — a label with
   nothing after it. **TASK-219's *information that went missing*, reachable through the space bar.**
⇒ 📌 **Three conditions — reject null/undefined, coerce to string, reject whitespace-only — and an operator
states one.** **That is why it is a helper, and the reason is written above it.**

### §3 ❓ `weeks` — **LEFT, and it is not close**
✅ **The two-idiom sentence is in the code**, at `fieldValue`, which is where the next person reaching for `??`
to "fix" a `||` will be standing:
> ***`||` eats a legitimate `0`. `??` lets an empty string through. Swapping one operator for the other does
> not fix anything; it trades one failure for its mirror.***
🚫 **Not fixed, and the reason is stronger than "different severity":** **`weeks` is `weeksBetween(...)`, a
computed NUMBER** ⇒ **`""` is not merely unlikely, it is unreachable from the producer.** ➕ Its failure would
be a half-sentence, which a human reports. ⇒ **latent AND unreachable AND loud** — three reasons, where
`remaining` was latent-but-reachable-in-principle AND silent.
📌 **If you want it anyway it is one `fieldValue` call**, and I would rather you asked than have me widen a
task that exists because a sweep found ONE defect.

---

## ❓ THE QUESTION — **your distinction survives, and there is a cheap test for it BEFORE the reading.**

**Your instinct is right:** *a count is evidence when every instance implements one RULE; only a place to look
when the instances share a SHAPE.* ✅ **It holds against all four I have swept this week:**
| count | rule or shape? | was the count evidence? |
|---|---|---|
| `withExit` × 11 (TASK-323) | **RULE** — *every question advertises the exit* | ✅ **YES — it CHANGED the task**: it is what showed the customer's "two screens" was under-scoped |
| `.trimEnd()` × 5 of 14 (TASK-325) | **RULE** — *no message ends in whitespace* | ✅ **YES** — 5-of-14 said instantly that nine were unprotected |
| `t(key, lang, {…})` × 5 (TASK-327) | **RULE** — *no placeholder leaks* | ✅ **YES** — it separated the 9 safe-by-construction from the 5 safe-by-habit |
| `as string) \|\|` × 13 (TASK-331) | 🔴 **SHAPE** | 🚫 **NO — 12 of 13 were correct** |

### 🔑 And the cheap test, which is the part you can run BEFORE reading
***Try to write, in ONE sentence, what all the instances are FOR. If the only sentence you can write describes
what they LOOK LIKE, it is a shape.***
- `withExit` → *"every question advertises the exit."* ✅ a purpose.
- `.trimEnd()` → *"no message ends in whitespace."* ✅ a purpose.
- `as string) ||` → *"…they all coerce a payload field with `||`."* 🔴 **that is the syntax.** ⚠️ And the reason
  no purpose-sentence exists is visible in the answer: **the thirteen had THREE different intentions** — a
  customer RULE (`Remark` is `*ถ้ามี`), a TRUE STATEMENT (no expiry ⇒ no line), and a DEFECT (`remaining`).
  **One operator, three meanings.**
📌 **The test costs one sentence and it is falsifiable** — if you cannot write it, you have a place to look.

### 🚫 So: NO, do not stop reporting counts
**`withExit`'s count was the finding.** Suppressing it would have cost the thing that made TASK-323 correctly
scoped. 🔑 **The asymmetry is what makes the rule safe:** **calling a rule-count "only a place to look" costs
nothing** — you were going to read them anyway. **Calling a shape-count a finding creates work** — I swept
thirteen rows to retire twelve. ⇒ ***when the one-sentence test is unclear, default to "a place to look".***

⚠️ **And one correction to your own note, because it cuts the other way:** you said *"the count saved you no
work"*. **True for `|| undefined`. Not true for `withExit`** — there the count was the whole content of the
task. 🔑 **Counts pay off asymmetrically, which is exactly why the cheap test is worth running rather than
adopting a blanket rule in either direction.**

**BALL: @Sober — TASK-332 ready for review. ⛔ Nothing else is on me. TASK-328 and TASK-333 when you release
them.**
