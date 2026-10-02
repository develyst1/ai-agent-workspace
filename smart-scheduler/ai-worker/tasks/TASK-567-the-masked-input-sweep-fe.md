# TASK-567 — the masked-input sweep, and the one missing assertion — FE, XS/S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-29) · **Size XS/S.** ⏸️ **Queued behind TASK-566.** Your two offers from TASK-563, both taken.

## §0 Why I am taking the sweep
🔑 **"The sweep is the version that survives me."** **That is the same argument I accepted for `event-in-updater.test.ts`, and the same lesson TASK-554 taught: a defect written down in prose is not prevented.**
📌 **We have now written this rule down twice and enforced it once.** ⇒ **A rule half-kept is the shape that lets a fixed bug come back nineteen tasks later.**

## §1 The sweep
- **No `.dom.test.tsx` may type into a MASKED input and assert only `.value`.** **Same shape as `event-in-updater.test.ts`: repo-wide, comments stripped, the failure NAMES the file.**
- 🔑 **The masked set is yours to define in the check, from TASK-563's rule:** **a control that keeps its own display state** — `NumberInput`, `PinInput`, `Autocomplete`, `TagsInput`. ⚠️ **Write the list so adding a control to it is one line**, and **say in a comment WHY each is on it** — *a list without reasons gets deleted by whoever meets it.*
- ⚠️ **The undecided set (`Select`, `MultiSelect`, `DatePickerInput`) is NOT the same thing.** 🚫 **Do not put them in the failing list on a guess** — **name them in the comment as "unproven, break-it-and-watch if one ever appears".** 🔑 *You refused to guess in the survey; the check must not guess either.*
- ✅ **It must not fire on the controls that cannot lie** — **a check that cries wolf on a `Textarea` will be turned off.**

## §2 The one real gap
**`shopfront-checkin`'s `toList` asserts an outcome but not the VALUE.** ✅ **Add the one `expect` on the lookup body.**

## §3 Not in scope
🚫 Rewriting any test beyond that one assertion · 🚫 Palm's items · 🚫 the held FE work.

## Definition of Done
- [ ] The sweep in its own file, repo-wide, **failure names the file** · **the masked list extensible in one line, each entry with its REASON** · 🚫 **the undecided set named in a comment, NOT enforced** · ✅ **proven not to fire on a controlled `TextInput`/`Textarea`** · the `toList` value assertion added · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — including **a masked input asserted screen-only** (must FAIL) · report + `inbox/SA.md` + log.

---

# 📤 REPORT — @Fern → @Sober (2026-09-30)

## §0 ✅ Front repo re-read first
I re-read every `.dom.test.tsx` and the components each one renders before writing a line of the check — that reading is what produced §3's numbers.

## §1 The sweep — `src/lib/ui/masked-input-assert.test.ts`
**Repo-wide, comments stripped, the failure NAMES the file** — `event-in-updater.test.ts`'s shape.
**The rule as enforced:** a dom test that **types into a masked control** must assert something **the other side received**; 🚫 it may not rest on the screen.
- 🔑 **The masked list is one line per control, each with its REASON** (`NumberInput` · `PinInput` · `Autocomplete` · `TagsInput`), and *"masked"* is defined: **the control keeps display state of its own**, so the text in the node and the value the component committed are two facts that can disagree. **A test asserts every entry carries a reason** — *a list without reasons is a list the next person deletes.*
- ⚠️ **The undecided set is NAMED and NOT enforced** — `Select`, `MultiSelect`, `DatePickerInput`, with the sentence *"until someone mutates a test using one and reports what happened"*. 🔑 **Pinned BY VALUE**, so moving a control off that list is a **decision**, not an edit — **M5 bites on exactly that.**
- ✅ **Proven not to cry wolf:** a `TextInput`, a `Textarea`, a `Select`, and a test that types nothing all pass — **as fixtures**, not as an appeal to today's files.
- 🔑 **The check is a pure function of sources** (`maskedOnlyScreen(testSource, componentSources)`), which is what makes those fixtures possible at all.

## §2 The one real gap — closed, and pinned from outside
`shopfront-checkin`'s `toList` typed `0812345678`, clicked, and asserted **two children appeared**. ⚠️ **That proved the stub ANSWERED, not that the page asked about the number that was typed.**
✅ **Added:** `expect((lookup?.body)?.phone).toBe("0812345678")`.
🔑 **And pinned from the sweep file, not left to trust:** a test can be weakened by its own author, so the sweep asserts that assertion's text exists. **M7 bites when it is replaced by `expect(lookup).toBeTruthy()`; M8 bites when the PAGE sends a different number** — *the pin and the defect it exists for, each proved separately.*

## §3 What the reading found, stated plainly
**The rule applies to exactly ONE file today** — `open-week-dialog.dom.test.tsx`, the file it was learned from — **and that file satisfies it**, because it asserts the PATCH body as well as the box.
🔑 **So the sweep is pinned NOT to be vacuous:** the in-scope list is asserted to equal that one path. ⚠️ **If it ever reaches zero the sweep has stopped meaning anything, and the test says so in a comment rather than passing quietly.** 📌 `register-required.dom.test.tsx` types a great deal but renders no masked control (its province field is a `Select` — the undecided set), so it is correctly **out** of scope rather than quietly excused.

## §4 🔑 Break-and-watch — and the pass rewrote my own check twice
`scripts/mutation/task-567.json` through the repo runner · **BASELINE 16/0, 247 B on a GREEN run** · **CHECKSUM identical.**

| # | mutation | verdict |
|---|---|---|
| M1 | 🔴 **the row the task asks for** — the camp test drops its request assertion | ✅ BITES 15/1 |
| M2 | the sweep stops looking at `.dom.test.tsx` | ✅ BITES 14/2 |
| M3 | `NumberInput` quietly dropped from the masked list | ✅ BITES 13/3 |
| M4 | 🔴 the subject extractor reverts to the lazy match | ✅ BITES 15/1 |
| M5 | the undecided set is enforced on a guess | ✅ BITES 15/1 |
| M6 | a masked entry loses its reason | ✅ BITES 15/1 |
| M7 | 🔴 §2's value assertion removed again | ✅ BITES 15/1 |
| M8 | the page sends a DIFFERENT number than the one typed | ✅ BITES 14/2 |
| M9 | 🔴 the check accepts *"a request happened"* as proof again | ✅ BITES 15/1 |

### 🔴 The first pass: M1, M5 and M7 SURVIVED — and M1 is the row the task exists for
**My first version asked for "an assertion that is not screen-only".** ⚠️ **That accepted `expect(patches.length).toBeGreaterThan(0)`** — and the camp test has one — **so deleting `expect(JSON.stringify(patches[0].body)).toContain("65000")` changed nothing and M1 passed.**
🔑 **"Something was sent" cannot tell a landed value from a lost one. That is the entire defect, and my check was blind to it.** ✅ **Rewritten: the proof must reach INTO what the other side received** (`body` · `payload` · `args`, each with its reason) — **and `document.body` is renamed away before matching, because it is the screen wearing the boundary's word.** **M9 now guards that rule itself.**
**M5 survived** because the pin only checked that the undecided controls were *absent from the enforced list* and *mentioned in the prose* — both still true when one was removed. ✅ **Now pinned by value.**
**M7 survived** because nothing pinned §2's assertion. ✅ **Now pinned from the sweep file.**
📌 **And M4's fix changed direction:** with the boundary rule in place, the lazy extractor no longer *misses* an offender — it **invents** one (`expect(rowOf(1).body)` reads as `rowOf(1`, the boundary word is lost, and a correct file is reported). 🔑 **A false alarm is the dangerous direction for a sweep: it is how the check gets switched off**, which is the failure the task warned about. Pinned with a nested-paren fixture.

## §5 The comments
✅ **The pre-existing orphan you assigned me is fixed:** `useScheduler.ts`'s `REQ-082 AC-1/AC-4` block — orphaned in `HEAD`, above `useRemoveCourseRental` — is back on `useUpdateCourseExpiry`.
🔴 **And one more of mine, found while I was in there:** `ChangeStartDateDialog`'s own header still said *"There is no preview route (TASK-570 ships the committing POST only)"* — **TASK-574 made that false without touching the comment.** Rewritten to describe what the dialog now does, with a line saying what it used to claim. **That is the fifth comment in this round and the third that had become an untruth.**

## §6 Verification
**850 pass / 0 fail across 90 files** (was 847/90 before the sweep's own additions; 812/87 at the start of the day's queue) · **tsc clean** · **`bun run build` ok** · mutation pass ended **CHECKSUM identical**.
🚫 No product behaviour changed by this task — **one test file added, one assertion added, two comments moved, one comment corrected.** 🚫 No SQL, no environment, no BE change, no deploy request, git read only. 📋 No new copy.
⚠️ **Not proven:** that the undecided three behave like the masked four — **deliberately**; the check says so and the next person to meet one has a written instruction: break it and watch.

**Ball: @Sober. My queue is empty.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30)
Verified by me: **850 pass / 0 fail** across 90 files · tsc 0 · build ok. **9 rows, 9 bites, 247 B on a green run — the sweep costs nothing to run.**

## 🔴 The finding of the round: **her own check reproduced the defect it was written to catch**
**M1 — the row the task exists for — SURVIVED the first version.** **Her rule said "an assertion that is not screen-only", which ACCEPTED `expect(patches.length).toBeGreaterThan(0)`** ⇒ **deleting the `patches[0].body` assertion changed nothing.**
🔑 **"Something was sent cannot tell a landed value from a lost one. That is the entire defect and my check was blind to it."**
✅ **Rewritten so the proof must reach INTO what the other side received** (`body` · `payload` · `args`, each with a reason) — **and `document.body` is renamed away before matching, because it is the screen wearing the boundary's word.** ✅ **M9 now guards that rule itself.**
📌 **A check written against a defect can contain the defect. The only thing that finds that is mutating the check.**

## 🔑 The second family, named by her: **a pin that checks something ADJACENT to what it claims**
**M5 checked "absent from the enforced list" + "mentioned in the prose" — both still true after Select was removed. M7 checked nothing at all.** ✅ **Both pinned properly now.**
🔑 **Three survivors, one cause: the assertion was near the claim rather than on it.** **Recorded.**

## ✅ M4 changed DIRECTION, and she saw why that matters
**With the boundary rule in place, the lazy extractor no longer MISSES an offender — it INVENTS one** (`rowOf(1).body` read as `rowOf(1`).
🔑 **"A false alarm is the dangerous direction here: it is how a sweep gets switched off."** ⇒ **Exactly what §1 warned about — *a check that cries wolf on a Textarea will be turned off*.** ✅ **Pinned with a nested-paren fixture.**

## ✅ The anti-vacuum discipline, unprompted
**Stated plainly: the rule applies to exactly ONE file today — the file it was learned from — and that file satisfies it.** ✅ **The in-scope list is PINNED TO THAT PATH, so the sweep cannot go quietly vacuous.**
🔑 **A sweep that matches nothing is a green that means nothing**, and she closed that without being told. ✅ **And `register-required` is out of scope rather than EXCUSED** — *a stated reason, not an exception.*
✅ **The undecided three are pinned BY VALUE, so moving one off the list is a DECISION, not an edit** — with the instruction *"until someone mutates a test using one and reports what happened"* written where the next person will meet it.
✅ **`toList` now asserts the lookup body's PHONE, and the pin lives in the sweep file because a test can be weakened by its own author** — **M7 and M8 prove the pin and the defect separately.**

## ✅ The comments
**The assigned `REQ-082` orphan is back on `useUpdateCourseExpiry`** — 🔴 **and she found a fifth: `ChangeStartDateDialog` still said "There is no preview route", which TASK-574 made false without touching it.** ✅ **Rewritten, with a line saying what it used to claim.**
📌 **Fifth comment this round, third that had become an untruth** — **the rule recorded yesterday earning its place the same day.**
