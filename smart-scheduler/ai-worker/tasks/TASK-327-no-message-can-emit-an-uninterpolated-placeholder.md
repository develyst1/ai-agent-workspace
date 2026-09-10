# TASK-327 — the property with the worst failure mode and nothing holding it

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-10)
⚪ **NO CLOCK. Not in the batch.** 🔑 **TEST-ONLY — that is why it can run WHILE @Tanya is on `uat`.**
🚫 **No product code, no copy, no migration, no i18n.** **Source: your own TASK-325 Question, candidate 3.**

---

## §1 Why this one and not the better one
🔴 **Your candidate 4 — `line()` vs `extra()`, nine branches choosing a labelling convention by hand — is the
more valuable finding and I agree it is the next real task.** ⛔ **It is HELD until after the `uat` round.**
⚠️ **It changes visible labels on three messages, and @Tanya is about to read those messages on a phone.**
🔑 ***A build that moves under a tester is the thing @Porter has been burned by three times this week***, and I
am not doing it to him on the round that closes this batch.
✅ **Candidate 3 changes NOTHING a tester can see** ⇒ it costs the round nothing.

## §2 The property
> ***No message can emit an un-interpolated `{placeholder}`.***
✅ **You probed all fourteen kinds with an empty payload and empty ctx: not one `{var}` leaked.**
🔴 **And nothing holds it.** It is true because every branch writes `?? "-"` or leans on omit-empty —
**fourteen times, by hand.** ⇒ ***the fifteenth branch is one forgotten `??` away from sending `{student}` to a
parent, and no test would fail.***
🔑 **This is the same sentence as `§16.3` and you said so yourself: a property that belongs to ALL messages but
lives in each branch is held by N coincidences.** 📌 *`§16.3` had five of fourteen. This has fourteen of
fourteen — which is why it is TRUE today and still unheld.*

## §3 What to build
✅ **One assertion, all fourteen kinds, the way you wrote `§16.3`'s** — 🔑 **and it must be the SAME PROBE**:
empty payload, empty ctx, both languages, both audiences, plus a kind nobody has written yet.
⚠️ **Watch the false positive** — 🚫 *a legitimate `{` in a customer string is not a leak.* **If one exists,
name it and make the assertion precise rather than loose.** 📌 *A test that has to be weakened later is worse
than one that starts narrow and says why.*
🚫 **Do NOT add `?? "-"` anywhere.** ✅ **If a branch is only safe by accident, REPORT it — the fix is a
separate decision** *(what a missing student's name should render is not a testing question)*.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **ONE assertion across all fourteen kinds** — the empty-everything probe, both languages, both
      audiences, and an unknown kind
- [ ] 🚫 **ZERO product-code changes** — asserted as an absence, *and that is what makes this safe during
      @Tanya's round*
- [ ] **Any branch that is safe only by accident is NAMED, not fixed**
- [ ] **Any legitimate `{` found is named and the assertion made precise around it**
- [ ] 🔑 **Break it and watch** — ⚠️ **mutation and restore in ONE tool call**, per your own TASK-325 finding

## Question
🔑 **Your `§16.3` tell — *a property is at risk exactly when the number of places implementing it is neither
ONE nor ALL* — is the sharpest thing anyone has written this week.** ⚠️ **But this property is FOURTEEN of
fourteen and still unheld** ⇒ ❓ **does the tell need a second half?**
📌 *My reading: `ALL` is safe only when it is ALL BY CONSTRUCTION — one helper — and dangerous when it is ALL
BY REPETITION. `§16.3` was 5/14 and visibly broken; this is 14/14 and invisibly fragile.* **Say whether that
holds, or whether it is a distinction without a difference** — 🔑 **because if it holds, the audit is not
"count the sites" but "count the sites, then ask whether the number is a helper or a habit."**

---

## ✅ RESULT 2026-09-10 — @Jason. **1990 pass / 0 fail**, 160 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**.
🚫 **ZERO product-code changes** — `git status` is one untracked file, `src/lib/no-placeholder-leak.test.ts`.
**Safe to land while @Tanya is on `uat`, which is the whole reason this task exists.**

- [x] 🔑 **ONE assertion, ALL fourteen kinds** — empty payload, empty ctx, both languages, both audiences, plus
      a kind nobody has written yet
- [x] 🔑 **…and the assertion is NOT VACUOUS** — proven against a string that really does leak
- [x] **No legitimate `{` exists** — measured, so the regex stays strict; the reason is in the file
- [x] **The branches that are safe only by HABIT are NAMED, not fixed** — five of them
- [x] 🔑 **Break it and watch — mutation AND restore in ONE tool call**, per TASK-325, and the restore verified
      **byte-identical to the original**, not merely "looks right"

### ✅ The probe, and the one thing worth adding to it
`§3` asked for the same shape as `§16.3`'s and warned about the false positive. **I measured before writing the
assertion: rendering all fourteen kinds in both languages and both audiences produces NO `{` or `}` of ANY
kind.** ⇒ **there is no legitimate brace to carve an exception around**, the regex can be strict, and the next
stray brace will be judged against that sentence rather than quietly allowed by a loose pattern.
🔑 **And I added one assertion neither of us listed: that the probe can SEE a leak.** `t("added_atmax_note",
"TH")` renders `{max}` verbatim when handed no vars ⇒ **the regex catches the real failure mode.** 📌 *A
negative test that cannot fail is decoration, and this file is almost entirely negative assertions.*

### 🔴 The five that are safe only by HABIT — named, not fixed
**`booking_paused` · `booking_resumed` · `makeup_far_out` · `sick_leave` · `leave_teacher`.**
Each calls `t(key, lang, {…})` **directly** and is safe because its author wrote `?? "-"` — **twelve times
across those branches.** 🚫 **I added none of them** (`§3`: what a missing student's name should render is not
a testing question) and the count is asserted, so adding or dropping one is visible.
⚠️ **The other nine are safe by CONSTRUCTION**: `line()`, `extra()` and `renderFieldBlock` drop a falsy value,
so **the whole line disappears rather than rendering a half-filled one** — and a branch that goes through them
inherits the property without its author knowing it exists.

### 🔑 The mutation, and it demonstrates exactly the fragile half
I removed `student` from `sick_leave`'s var object — **one of the five, and the precise failure mode this
property is about.** ⇒ **2 fail, led by the all-kinds assertion.** ✅ Restored in the same call, and verified
`byte-identical to original: true` with **0 `MUTATED` markers left**. 📌 **TASK-325's window is now zero rather
than short**, and the check is stronger than reading one line: I compare the whole file to what I read in.

---

## ❓ THE QUESTION — **your distinction holds, and this task is unusual proof: ONE property, held BOTH ways, in ONE file.**

**Nine kinds by construction, five by repetition, same invariant.** 🔑 *That is as close to a controlled
experiment as this repo is going to give us*, and it says your reading is right: **`ALL BY REPETITION` is
fragile in a way `ALL BY CONSTRUCTION` is not**, because the fifteenth branch inherits the second and not the
first.

### 🔻 But I would REPLACE the count rather than give it a second half — the count was always a proxy
**The number was never the thing.** `5/14` and `14/14-by-habit` fail for the *same* reason and the count
separates them; `14/14-by-habit` and `14/14-by-construction` share a number and differ completely.
⇒ 🔑 **the question the count approximates is: *when the fifteenth branch is written, does it get the property
for free, or must it re-earn it?*** **Ask that and you never need the number:**
| | new branch inherits it? | |
|---|---|---|
| the trim, before (`5/14`) | ❌ | **visibly broken already** |
| `?? "-"` today (`14/14`) | ❌ | 🔴 **invisibly fragile — this task** |
| omit-empty (`9/9`) | ✅ | **safe** |
| the trim, now (`1`) | ✅ | **safe** |
📌 **The count stays useful as a CHEAP FIRST PASS** — it is a grep, it is mechanical, and it finds every `5/14`
without anyone reading code. **It just cannot finish the job.**

### ⚠️ And the sharper half, which your phrasing does not yet carry: *a helper is not enough — it must be UNAVOIDABLE*
🔴 **`line()` / `extra()` / `renderFieldBlock` ARE one helper each, and they still leave five kinds outside**,
because a branch can simply call `t()` instead. **The helper is AVAILABLE, not COMPULSORY.**
✅ **The builder's trim is different: every `return` in the switch passes through `formatOutboxMessage`, so
there is nowhere else to come out.** ⇒ **that is why `§16.3` is now genuinely one-and-done and this property is
not**, even though both were "fixed with a helper".
🔑 ***Safe by construction requires the mechanism to sit on the path you cannot avoid — not merely to exist.***
📌 **So the audit I would actually run is two questions, in this order:**
**1. What is the narrowest point EVERY message must pass through?** *(here: `formatOutboxMessage`'s exit.)*
**2. Which of the message's invariants live there — and which live in the branches?**
**Everything in the second list is held by habit, whatever its count.**

⇒ 📌 **And it makes candidate 4 concrete rather than aspirational: `line()` vs `extra()` is a labelling
convention living in nine branches, and the place it belongs is the same exit the trim now occupies.** 🔑 **The
two tasks have the same answer because they have the same shape** — which is the strongest evidence that the
reframing is a real rule and not a nice sentence.

**BALL: @Sober — TASK-327 ready for review. ⛔ Nothing else is on me; candidate 4 is yours to release after
@Tanya's round.**
