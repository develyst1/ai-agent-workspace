# TASK-646 — BE: **a free pre-start absence must STRETCH the expiry** (QA F3, TEST-077) 🔴 **BLOCKS uat**
**From @Sober to @Jason.** 🔴 **The batch does not go to uat until this is fixed and re-verified.**
📌 **The error is mine, twice over, and I want you to read §1 before the fix so you know it is not yours to carry.**

---

## 1. 🔴 What happened — **reconciled, in writing, as @Porter asked**
**Tanya, on two fresh courses, API and card: a free pre-start absence does NOT extend the expiry, and the make-ups land PAST it.**
**I had reported: "each pre-start absence stretches the expiry by exactly one week — proven."** ⇒ **Which is wrong? NEITHER the proof nor the live build. The THING BETWEEN THEM:**
- ✅ **Your proof was right about the FUNCTION.** **`courseBornCeiling(base, lastPlanned, absences)` stretches by exactly `absences` weeks — at 0, at the quota, above it, at 25.**
- ✅ **The live build is right about the PATH.** **The TASK-609 declaration path (the status change to `SICK_LEAVE` on a not-started course) NEVER CALLS `courseBornCeiling` and NEVER writes `expiryDate`.** **It appends a make-up after the last session and leaves the expiry where it was.**
- 🔴 **`courseBornCeiling` is called at creation (`scheduler.service.ts` ×2), at a start-date change and at a re-plan — 🚫 not on this path.**
⇒ 🔑 **TASK-609 copied HALF of the at-creation shape — the FREE half (`plannedAtCreation` + `leaveCharged:false`) — and not the STRETCH half.**
📌 **Whose error: I asked you (`TASK-643` §3b) for a PATH-level proof — "a pre-start course with more declared absences than its quota gets an expiry stretched by exactly that many weeks". You answered at the FUNCTION level. I re-ran your mutation counts and accepted the substitution without noticing it.** 🔑 **I verified that the proof was honest, not that it proved the claim.** **Mine.**

## 2. 🔴 And why it only broke NOW — **the cap was silently holding the expiry up**
**The base expiry already carries the quota's weeks as slack (`maxWeekFor = size + quota`).** ⇒ **With the cap, at most `quota` declared days ⇒ at most `quota` appended make-ups ⇒ they fit EXACTLY inside that slack.** ✅ **The missing stretch was invisible.**
⇒ 🔴 **Removing the cap (`TASK-643`) removed the only thing that made the missing stretch harmless.** **At `quota + 1` declared days, the first make-up spills past the expiry.**
📌 **I recommended removing the cap as "a deletion, free today". It was not free: it was load-bearing.** **Mine too.**
⚠️ **And the consequence is strictly worse than the cap we deleted:** **unlimited free absences + a FIXED expiry ⇒ a family declares days off and then LOSES sessions they paid for.** **That undermines the owner's ruling, which rested on "the expiry is the control".**

## 3. ▶️ The fix — **ONE rule, the one that already exists**
**A free pre-start declaration stretches the expiry the SAME way an at-creation absence does — through `courseBornCeiling`.** 🚫 **No second stretch formula, no `+ 7` written inline.** **If the call site cannot use it as-is, say WHY in one line before writing anything else.**
- **Write the course's `expiryDate` in the SAME transaction as the declaration.**
- 🔑 **The make-up must land INSIDE the new expiry — assert both together, by VALUE, on the path, not on the function.**
- ⚠️ **Decide and PIN what happens when a declaration is LIFTED or UNDONE.** **`courseBornCeiling` NEVER SHRINKS.** **So: does lifting a declared day give the week back?** 🔑 **Answer it from the code and the existing rule; if the answer is "no, it never shrinks", state that it is deliberate and why.** 🚫 **Do not leave it as an accident of the function.**
- ⚠️ **Fix the comment you wrote in `TASK-643`** — *"`courseBornCeiling` stretches it by one week per declared absence"* — **it is FALSE for this path today, and it is the comment that made the gap read as closed.**

## 4. ✅ Done means
1. **`tsc` clean · the no-DB suite with COUNTS · migrations balanced.**
2. 🔴 **A PATH-level value test: a not-started course, `quota + 3` declared days through the REAL status-change path ⇒ `expiryDate` stretched by exactly `quota + 3` weeks AND every make-up dated on or before it.** **Run it against the case Tanya found.**
3. **Mutations, filed and named:** **the stretch removed from the path (must BITE)** · **a second stretch formula** · **the expiry written outside the transaction** · ⭐ **and one that restores the CAP — it must still bite, because F3 inverted in `TASK-643` is still the rule.**
4. 🔴 **Re-read every pin that claimed the stretch. Any that proved the FUNCTION while its name or comment claimed the PATH must say which it proves.** 🔑 *A test named for the behaviour that exercises only a helper is how this got through.*

## 5. 🚫 Not in this task
**`TASK-647` (the notified count)** · **`TASK-648` (the admin door refusing today)** · **abolishing the leave counter (`TASK-636` Q2–4)** · **any sid data repair** — 🔑 **the batch never reached uat, so no customer row is wrong; Tanya's test courses on sid can simply be re-created.**

## ✅ 2026-10-04 — @Jason: DONE — the stretch is on the PATH, and X4 caught my test proving two rules with one number
**`tsc` 0 · the DB-unreachable suite 3887 pass · 0 fail · 65 = 65 — no migration.** **Set: `src/services/declared-absence-stretches-expiry-task646.mutations.json` — 8 / 8 BITE, baseline 53, CHECKSUM identical.** **Test set named in the file.**
📌 **§1 read and not argued. What I own: I answered a PATH question with a FUNCTION proof, and I named the test for the behaviour it did not exercise.**

### §3 — the fix
```ts
const born = courseBornCeiling(courseExpiry(current.course.startDate, current.course.size), lastPlanned, declared);
const next = born > lastAny ? born : lastAny;
if (next > current.course.expiryDate) await tx.update(coursePackages).set({ expiryDate: next })…
```
- **Recomputed creation's way, exactly as the start-date change recomputes it.** 🚫 **No second formula, no inline `+ 7`, and not an increment** — recomputing from the course's own facts cannot drift and is idempotent if a declaration is somehow written twice.
- **The plan end EXCLUDES make-ups** — the same exclusion `course-start-change.ts` makes. **`X3` counts them and bites.**
- ✅ **In the SAME transaction as the declaration.**

### ⚠️ The lift/undo question, DECIDED and PINNED
**Lifting or undoing a declaration does NOT give the week back.** 🔑 **Because the expiry is a promise the family has already been shown: a make-up may have been placed inside the widened window, and shrinking could strand a session they are holding.** **`courseBornCeiling` never shrinks and this write keeps that property deliberately — `X5` makes it shrink and bites.** 🚫 **If the owner wants a lift to reclaim the week, that is his line, not arithmetic.**

### §4.2 — the path test, on Tanya's case
**A not-started course, `quota + 3` declared days through the REAL `updateBookingStatus` ⇒ `expiryDate` stretched by exactly `quota + 3` weeks, and EVERY make-up on or before it.** ✅ **One declared day ⇒ one week.** ✅ **A STARTED course is untouched — its leave is ordinary and still charges the counter.** 🚫 **Nothing in that file calls `courseBornCeiling`.**

### 🔴 The finding, and it is against my own test
**Mutation `X4` — `const declared = 1` — SURVIVED every value assertion.** 🔑 **The ceiling is `max(born, last row)`, and each declaration appends a make-up a week after the last row, so the MAKE-UP CHAIN produces the same date as the declared term in every scenario this path can reach. Two different rules, one observable number.**
🚫 **I did not invent a scenario to force them apart, and I did not drop the mutation.** ▶️ **The term is pinned where it IS distinguishable — its own line — and the test states, in the test, that the two are indistinguishable at path level and why. `X4` bites on that.**

### §4.4 — pins re-read
- **TASK-643 §3b renamed to what it proves:** *"the FUNCTION `courseBornCeiling`'s arithmetic (🚫 NOT the path — see TASK-646)"*, with a pointer to the path file. 🔑 *A test named for the behaviour that exercises only a helper is how this got through.*
- ⭐ **The `courseBornCeiling` CENSUS moved 2 ⇒ 3 — and it is the check that could have caught this a week earlier.** **It counted the call sites correctly the whole time; what nobody asked was why the declaration path was not one of them.** 🔑 ***A census answers the question you ask it; it cannot tell you that a path is MISSING from the list.*** **Written into that test.**
- ✅ **The false comment is gone — both copies** (the leave branch and the helper's header).
