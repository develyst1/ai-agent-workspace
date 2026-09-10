# TASK-322 — the test that would have caught TASK-320 on the day it was written

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-10)
📌 **NO CLOCK. Not in the `uat` batch** — 🚫 **do not let it delay TASK-321.** 🚫 No BE change, no product
change, **no behaviour change of any kind.**
**Source: YOUR Question answer on TASK-320.** 🔑 **You proposed it, costed it, and did not build it. That was
the right call and this is the task it earned.**

---

## §1 The finding, in your words — and it is the finding, not the test
> *"We have asserted that a field is NOT sent, on both sides. We had never once asserted that a field IS sent
> under the name the reader uses."*

🔴 **A whole class with no test** — and it is why TASK-320 sat from REQ-068 until an owner typed a note into a
box that discarded it. **Every layer was green and each asserted its own half of a boundary neither crossed.**
📌 **The near-miss makes it sharper than a flat "no": `expiry-warning.test.ts` DOES read both sides — and the
one thing it asserts across them is an ABSENCE (`weekday` on neither).** ⇒ **we had the shape and used it only
to prove a negative.**

## §2 What to build — and the constraint is what makes it worth having
✅ **Your own proposal: for each create/edit dialog, read the object literal handed to `mutateAsync` and the
request body of the service function it calls, and assert THE KEY SETS AGREE.**
🔑 **Source-text, no harness, no running request** — ⚠️ **and I want it kept that way.** 📌 *A version that
needs a server is a version that gets skipped in CI and stops being run.*
⚠️ **It WILL find disagreements that are correct** — a field the service derives, renames on purpose, or drops.
⇒ ✅ **Those go in an ALLOW-LIST with a REASON PER ENTRY, in the test, next to the pair.** 🔑 **The allow-list is
the deliverable as much as the check is:** ***every entry is a place where a human decided the names may
differ, written down where the next reader will see it.*** 🚫 **An unexplained entry is worse than no test —
it is this defect with a comment on it.**

## §3 Scope — and say what you found, even where you change nothing
✅ **Cover the CREATE dialogs first** (`CreatePlanFlow` and its siblings). ⚠️ **If the sweep reaches every form
cheaply, take them; if it does not, take the ones that write MONEY or a COURSE and say which you left.**
🔴 **REPORT ANY REAL MISMATCH YOU FIND — do not fix it here.** 📌 *A silently-fixed second instance of TASK-320
is a defect nobody counts, and I want to know how many there were.*
🚫 **Do not change any product code in this task.** ✅ **If the check demands a rename to pass, that rename is a
separate task and I would rather hear about it.**

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean, **say which command**
- [ ] 🔑 **The check exists and FAILS on TASK-320's defect** — ⚠️ **demonstrate it by re-introducing `note:`**,
      *which is the only proof that it would have caught the thing it was built for*
- [ ] **Every allow-list entry carries its own reason** — asserted by review, and 🚫 **no bare entries**
- [ ] 🔴 **Any real mismatch found is REPORTED, not fixed** — with your judgement on whether it is a defect
- [ ] **You say what you covered and what you left**, and why
- [ ] 🚫 **No product-code change** — asserted as an absence

## Question
🔑 **You said the near-miss is more damning than a flat no.** ⇒ ❓ **Does the same asymmetry exist elsewhere in
this repo — places where we assert an ABSENCE across a boundary but never the presence?**
📌 *I ask because the absence assertions are the ones we write when something already went wrong once, and a
product with many of them has a map of its own past failures.* ⚠️ **Name them if the answer is short; say "no
pattern" if that is the truth.** 🚫 **Do not go looking for a week.**

---

## §4 ✅ IMPLEMENTED — Fern, 2026-09-10. 🔻 **The check I proposed does NOT catch TASK-320. I found that by running your demonstration, and it is the result of this task.**

```
bunx tsc --noEmit → exit 0
bun test          →  212 pass / 0 fail   (+11, one new file)
bun run build     → ok
git status        →  no product file changed by this task
```

### 🔻 The correction, first, because everything else depends on it
**My TASK-320 proposal was: *"read each dialog's `mutateAsync` literal and its service's request body, assert
the key sets AGREE."*** ⇒ **that is `§A`. It is worth having. And it would NOT have caught TASK-320.**
🔑 **The dialog sent `note:`; the service forwards `note: input.note` faithfully. The key sets AGREED.** The
defect was never a dropped or renamed key — **it was the wrong VALID field**, and no name-agreement check can
see that. ⚠️ **I only discovered this because your DoD made the demonstration mandatory**: I re-introduced
`note:`, ran `§A`, and it passed.

### `§B` — what IS observable, and it is the shape of the defect
**`CreateCourseInput.attendeeNote` was declared, forwarded by the service and read by the BE — and set by no
create form.** ⇒ 🔑 **a field on a create input that no form feeding it ever sets is a feature that cannot be
reached from the UI.** That is checkable, and it fails on TASK-320.

🔻 **And my FIRST version of `§B` also failed the demonstration**, which is the part I would most want read:
it unioned **every** `mutateAsync` payload in the app, and **`attendeeNote` was always set — by the per-session
`Session note` editor.** ⇒ **the field looked reachable while the feature was not.**
✅ **The fix is scope: a field counts as set only when a form FEEDING THAT INPUT sets it.** ⚠️ **Anything wider
lets one surface vouch for another — a smaller version of the exact mistake being checked for.**

**Demonstration, as the DoD requires** — `attendeeNote:` → `note:` in `CreatePlanFlow`:
```
(fail) §B … > CreateCourseInput
(fail) §B … > 🔑 the demonstration: this is the line that fails when TASK-320's defect is re-introduced
```
✅ Restored; line 236 **read back** as `attendeeNote: note.trim() || undefined,`; suite green after.

### 🔴 REPORTED, not fixed — two findings
1. 🔴 **`ImportCourseInput.note` is a live orphan.** Declared, forwarded to `/courses/import` — **and the
   import form has no note box at all.** ⇒ **the second instance of TASK-320's exact shape**, found by the
   check on its first run. ⚠️ Whether the import *should* offer a note is a product question ⇒ **yours.** It
   is in the allow-list with that reason, so it cannot be forgotten and cannot fail the build.
2. 🔴 **`CreateCourseModal` has NO renderer** — only `CreatePlanFlow` is mounted (`BookingsContent.tsx:92`) —
   **and it still sends `note:`.** ⚠️ **So the repo contains a second course-create dialog carrying the defect
   TASK-320 just fixed**, and TASK-287/288's comments cite that file as the reference for the resume form's
   inputs. 🔑 **The next person copying from it copies the defect.** 🚫 Not fixed, not deleted — dead-code
   removal is a decision, not a side effect.

### What I covered, and what I left
✅ **Covered: the four create/import forms whose service builds an explicit request body** — `/courses`,
`/vouchers`, `/courses/import`, `/vouchers/import`. **These are the money-and-course writers.**
⚪ **Left, with the reason: services that pass `input` straight through** (`api.post(url, input)` — the plan
change, extra session, rentals, booking move). 🔑 **A pass-through cannot mismatch by name: the whole object
goes.** ⇒ **`§A` has teeth only where a service RE-LISTS fields**, and that is worth knowing about the check as
much as about the code.
⚪ **Left: `BookingModal`'s create path** — it builds its payload across several branches rather than one
literal, so a source-text reader would have to guess which branch is live. **A check that guesses is worse than
no check.**

### Definition of Done
- [x] Suite **212 / 0** · `bunx tsc --noEmit` exit 0
- [x] 🔑 **The check FAILS on TASK-320's defect** — demonstrated by re-introducing `note:`; ⚠️ **and it took two
      designs to get there, both failures reported above**
- [x] **Every allow-list entry carries its own reason** — asserted by a test that the reasons are non-trivial,
      and there are no bare entries
- [x] 🔴 **Real mismatches REPORTED, not fixed** — the two above, with my judgement on each
- [x] **Covered / left stated**, with reasons
- [x] 🚫 **No product-code change** — `git status` shows no product file touched by this task

## Question — **do we assert absences across a boundary but never presences elsewhere?**

**Yes as a habit, but the boundary case is rarer than the habit — and the distinction matters.**

📌 **The habit is real and large: 78 `not.toContain`/`not.toMatch` assertions across 12 test files** — and you
are right that it is a map of past failures. Nearly all are **single-sided**, though: *this component must not
contain that string*. **A single-sided absence is not the asymmetry you asked about** — it is just a rule.

🔑 **Boundary absences — asserted on BOTH sides — I found exactly one before this task:**
`expiry-warning.test.ts` (TASK-287), which asserts **no `weekday`** in the service payload *and* **no `weekday`**
in the dialog's `mutateAsync` call. ⇒ **we had the two-sided shape and used it only to prove a negative.**

⇒ **The asymmetry is not that we prefer absences. It is that a PRESENCE across a boundary needs you to know
which name the reader uses**, and that knowledge lives in a third place — the BE — that neither FE test looks
at. **An absence needs no such knowledge**, which is why the absences got written and the presences did not.
📌 **That is also why `§B` is the useful half:** it does not need to know the right name, only that **something
sets the field the service already agreed to forward.**
🚫 **I did not go looking further than the grep above.**
