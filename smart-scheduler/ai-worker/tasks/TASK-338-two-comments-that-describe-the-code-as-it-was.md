# TASK-338 — two comments that describe the code as it was this morning

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-11)
⚪ **NO CLOCK. COMMENTS ONLY — no behaviour change, no test change unless a pin quotes one.**
🔑 **Two lines, and I am cutting a task for them because of WHICH function they are on.**

---

## §1 What is stale
**`course-deduction.ts:21`** — `remainingLabel`'s own doc line:
> *"What is left, as the customer writes it: `2 HR` for a course, `4/6 ครั้ง` for a voucher."*
🔴 **It returns `4/6`.** **TASK-335 removed the word and this line still teaches it.**

**`course-deduction.ts:61`** — inside `deductionPayload`'s TASK-332 note:
> *"`remaining` is a rendered LABEL (`"0 HR"`, `"0/6 ครั้ง"`), never a bare number"*
⚠️ **The CLAIM is still true and important — it is the EXAMPLE that is dead.**
📌 *Fix the example; keep the sentence. The reason that annotation exists is unchanged.*

## §2 🔑 Why this is worth a task rather than a passing edit
**This is the exact function whose comment misled ME two days ago.** **I read
*"matching `courseLine`'s owner-verified `เหลือ 6/10`"* and reported the card as SHARING this helper.** ⇒
📌 ***"Matching" and "shared" are one word apart in a comment and a whole task apart in the code.***
🔴 **And now the same function carries two comments describing behaviour it no longer has** — **written by the
same change that removed the behaviour.**
🔑 ***A comment goes stale in the commit that makes it stale, and that is the only moment anyone knows.***
⚠️ **This is the shape we have named four times this week from four directions** — *a screen describing intent,
a comment describing wiring, a lockstep header, a pin whose reason went stale twice.* ⇒ **I want it fixed on
the function that taught us it, with the reason written there.**
🚫 **Not a sweep.** 🚫 **Do not go looking for other stale comments.** ✅ **These two, because they are on the
line you just changed.**

## §3 ⚠️ While you are there — check, do not assume
**Your own TASK-335 comment says the removal makes the value `14/15`.** ✅ **Confirm the surrounding prose still
matches what the code does now**, including anything that names the OLD shape as the current one.
🚫 **If a comment describes HISTORY on purpose — *"it used to print X"* — leave it.** 🔑 **The distinction is
tense: a comment stating the CURRENT contract must be true; one recording what CHANGED must stay.**

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)
- [ ] **Both lines say what the function does now** — 🔑 **`:61`'s SENTENCE kept, its EXAMPLE fixed**
- [ ] 🚫 **No behaviour change** — asserted: *the suite count and the rendered outputs are unchanged*
- [ ] **You say whether any pin QUOTED either comment** — ⚠️ *if one did, that pin changing is expected and you
      name it*
- [ ] **`§3` answered** — anything else on that function you checked, and what you deliberately left as history

## Question
🔑 **You wrote that a comment describing a REMOTE fact rots and that you would not roll out a convention.**
✅ **I agree.** ⇒ ❓ **But these two describe a LOCAL fact — the return value of the function they sit on — and
they still went stale within hours.**
📌 *Which suggests the problem is not distance.* ⚠️ **Is there anything cheap that would have caught these two
specifically** — 🔑 **or is the honest answer that a comment quoting a literal that appears in the code beside
it is the only kind a test can ever check, and everything else is discipline?**

---

# 📤 REPORT — @Jason → @Sober (2026-09-11)

✅ **DONE (code).** **2041 pass / 0 fail**, 164 files · 🚫 no migration (**35 = 35**) · `tsc --noEmit` clean.
⚪ Off the clock · **`uat` untouched** · no behaviour change, **proven** (§4).

## §1 ✅ Both lines say what the function does now
- **`:21`** — *"`2 HR` for a course, `4/6` for a voucher"*, with **one 🔻 line recording that TASK-335 removed
  the word and that this doc went stale in the same change.** 📌 *The stale line's own epitaph is the cheapest
  place to put the lesson.*
- **`:61`** — 🔑 **the SENTENCE is kept word for word** (*"a rendered LABEL … never a bare number"* — the reason
  the annotation exists is unchanged); **only the dead example `"0/6 ครั้ง"` → `"0/6"`.**

## §2 🔻 A THIRD copy — in MY OWN file, and it was contradicting itself
🔴 **`remaining-zero.test.ts:11` — my TASK-332 header — also said `remainingLabel` returns `"0/6 ครั้ง"`.**
⚠️ **And an assertion 100 lines below it in the same file already read `0/6`.** ⇒ **the file disagreed with
itself and both halves passed**, because one was prose. ✅ **Fixed, and labelled as found by §3's check.**
🚫 **This is not me sweeping** — 📌 *it is the same sentence about the same function, and the DoD asked whether
a pin quoted either comment. This one did, in effect.*

## §3 ⚠️ `§3` answered — what else I checked on that function, and what I left
✅ **Checked and CORRECT:** the TASK-335 note's `14/15` claim (the code is `${left}/${total}`) · *"`14/15`
beside `Remaining :` already says 14 of 15 left"* · *"TWO READERS, both outbox messages"* · the `DeductionInput`
and TASK-336 parameter doc-blocks · the file header's two-triggers/majority-path claims.
🚫 **LEFT ON PURPOSE — HISTORY, and the distinction is TENSE, exactly as you put it:** the TASK-335 note inside
the function (*"`ครั้ง` is GONE"*) and the new 🔻 line at `:22`. **Both are past tense about a change; neither
states a current contract.** ⇒ `ครั้ง` still appears twice in the file and **both are correct.**
🔻 **ONE JUDGEMENT CALL I MADE BEYOND THE TWO LINES, and you can cut it:** `:23` said the voucher form was
***"matching `courseLine`'s owner-verified `เหลือ 6/10`"*** — 🔑 **that is the sentence that misled you, and it
was sitting in the same doc-block as one of the two.** ✅ **Rewritten to say SHAPE ONLY, nothing shared, with
the reason** (`line-course-view.ts` imports nothing from this file) **and a 🔻 line recording that *matching*
read as *shared*.** 📌 *Fixing the stale example while leaving the misleading sentence one line above it would
have been a strange place to stop.*

## §4 🚫 No behaviour change — and it is proven, not asserted
✅ **The code-stripped diff of `course-deduction.ts` is EMPTY.** *Every changed line in that file begins with a
comment marker.* ⇒ **the rendered outputs cannot have moved.**
⚠️ **The suite count went 2040 → 2041 and the reason is that I ADDED one test** (§5), not that anything changed.
**No pin quoted either comment as a source assertion**, so nothing broke.

## §5 ❓ YOUR QUESTION — *these describe a LOCAL fact and still went stale, so the problem is not distance*
🔑 **You are right that it is not distance, and I think the real variable is whether the comment quotes
SOMETHING THE CODE ALSO SAYS.** ⇒ **there are exactly two answers, and I have done both.**

**1️⃣ ✅ THE CHEAP MECHANICAL ONE — and it would have caught ALL THREE, including the one you did not know
about.** 🔴 ***Grep for the literal you just deleted.*** In TASK-335 I removed `ครั้ง` from a return expression.
**It was still sitting three lines ABOVE that return, forty lines BELOW it, and in a third file.** ⚠️ **One
`grep ครั้ง` before I finished would have found every one of them in a second, and I never ran it.**
📌 ***That is not a convention to roll out; it is one command at the moment of deletion*** — and the moment of
deletion is, as you say, the only moment anyone knows.

**2️⃣ ✅ THE TESTABLE ONE, and it is now IN the tree rather than claimed.** 🔑 **A comment that quotes a literal
the function produces can be checked BY ASKING THE FUNCTION.** `course-deduction.test.ts` now reads
`remainingLabel`'s doc-block and asserts it contains `` `${remainingLabel("voucher", 4, 6)}` for a voucher`` —
✅ **so the doc cannot teach a value the function does not return.** **I mutated it back to `4/6 ครั้ง`: that
assertion is the only thing that fails.**
⚠️ **AND ITS LIMIT IS THE HONEST HALF OF THE ANSWER, so I am stating it plainly: it generalises no further.** A
comment about WHY, about another file, or about intent **has nothing to compare itself against** — *`:61`'s
kept sentence is exactly that kind, and nothing here protects it.* 🚫 **I have not applied this anywhere else
and would not**: it is worth the six lines on a function whose doc has now misled two people, and nowhere else.
📌 **If you do not want it, delete it — the comment fix stands without it.**

🔻 **And the assertion corrected me while I was writing it, which is the best evidence I can offer for it.** My
first version demanded `ครั้ง` be absent from the whole doc-block. **It FAILED — because I had just added a 🔻
line RECORDING the removal.** ⇒ **I wrote a history sentence and then asserted history away, one minute after
writing §3's tense rule down.** ✅ **Scoped to the line that TEACHES** — *the only line a reader copies from* —
**and the history is now asserted PRESENT.** ⚠️ *So the mechanism's first catch was its own author.*

## §6 🔑 Mutation
**The doc example reverted to `4/6 ครั้ง` — i.e. the exact stale sentence this task was cut for** — in ONE
call, restored from a byte copy I took myself (**never `git checkout`**, TASK-337's lesson), **byte-identity
verified by SHA-256** (`c99cb3f4…`). ⇒ **1 fail, and it is the new assertion.** ✅ **Green again: 2041 / 0.**
