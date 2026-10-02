# TASK-593 — 🔴 D12 (blocker) + four nits — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-10-01) · Tanya, TEST-076 re-test. 🔴 **D12 is customer-visible on a PARENT-facing form.**

## §0 ⚠️ First
**Re-read the front repo and say so.** 🚫 **Palm's items 4, 9, 11.**

## §1 🔴 D12 — developer comments rendered as page text
**`RegisterContent.tsx:665` (FE `f3e25e2`) prints `/* §7b … */ /* §4 nit 2 … */` between "Date of birth" and "Province".** **Screenshot `D12-1-code-comment-on-form.png`.**
🔑 **A `/* … */` in JSX CHILDREN is text, not a comment.** ⇒ **Fix the one occurrence.**
- 🔴 **Then DERIVE whether there are others** — **every `.tsx` in the repo, not just this file.** 🔑 **This shipped to a parent-facing form and nothing caught it.**
- ⭐ **And I want the enforcement, not the fix: a check that FAILS if a bare `/* */` appears in JSX children**, the same shape as `event-in-updater.test.ts`. ⚠️ **If that cannot be done cheaply and honestly, say so and say why** — 🚫 **do not build something that cries wolf.**
📌 **This is the third time a rule has had to become a check because prose did not hold it.**

## §2 The nits — **fix each if it is small; report any that is not**
1. **F-E: the duplicate box stays English after switching the page to ไทย.** ⚠️ **Derive WHY** — *a box that does not follow the language is usually a value captured once, and that is a class, not a typo.* 🔑 **Say whether anything else captures copy the same way.**
2. **F-B: the line above "Add a child" still says "Nothing more to do here".** ⇒ **It is false now** — `canAddMore` made it so. 🔑 **Same family as the comments that became lies: a sentence nobody edited, made wrong by a change elsewhere.**
3. **F-C: District and Sub-district are required but NOT starred.** **Khwan asked for `*` on everything required.** ⚠️ **Derive whether any other required field is unstarred** — *one starred and one not teaches an admin the star means nothing.*
4. **Camp week view: a closed week has no "closed" mark, though the day view has one.** 🔑 **Your own rule from TASK-586 answers this: the marker is WHY showing a closed week is safe.** ⇒ **A week view that shows it unmarked is the case that rule exists to prevent.**
5. **Camp week view shows "7 คน" for a 1-child week.** ⚠️ **DERIVE which side is wrong — the payload or the render — and if it is the payload, STOP and tell me: that is @Jason's.**

## Definition of Done
- [ ] D12 fixed · 🔴 **every other occurrence derived across the repo** · ⭐ **a check that fails on a bare `/* */` in JSX children, or a stated reason it cannot be done honestly** · nits 1–4 fixed or reported, **each with the DERIVATION asked for** · nit 5 **attributed, and STOPPED if it is the payload** · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch, CHECKSUM · report + `inbox/SA.md` + log.

---

# 📋 REPORT — @Fern → @Sober (2026-10-01)

**Repo:** `smart-scheduler-front` @ `1719443` (working tree). **§0: I re-read the front repo before starting** — `RegisterContent.tsx`, `dictionaries.ts`, the camp grid/units and both calendar grids, as they stand on `develop`, not as I remembered them. 🚫 **Palm's items 4, 9, 11 untouched.**

**Suite 913 pass / 0 fail across 95 files · `tsc --noEmit` 0 · `bun run build` ok · Break-and-watch 10/10 BITES, CHECKSUM identical.**

## §1 🔴 D12 — fixed, derived, and now enforced

**The fix.** `RegisterContent.tsx:665` held **two** `/* … */` blocks (the `§7b` address note and the `§4 nit 2` note) sitting in **JSX children**, so React rendered them as text between "Date of birth" and "Province". Both are now wrapped in braces. 🔑 **It is my own defect, and I can name the edit:** TASK-591 rewrote that stretch of the address form and the notes were **moved**, not written — they were valid comments in the statement above and became text when they landed between two JSX elements.

⚠️ **Which makes this the same family as nit 2, one step worse:** ***a comment does not have to be edited to become false — it only has to be moved.*** Here it did not become false, it became **visible**.

🔑 **Why nothing caught it, which is the part worth keeping.** Three layers all had a reason to miss it:
- **The register pins read the source and STRIP comments before matching** (`codeOf`). ⇒ **a comment that had become text was invisible to exactly the tests that read this file** — they deleted it as a comment while the browser printed it as prose.
- **The DOM tests read named things** — a label, a failure box, a button — never the strip of body text between two fields. The one test that reads `document.body.textContent` looks for the word *optional*, not for a comment marker.
- **`tsc` and the build are both correct to be silent:** JSX text is valid JSX. Nothing is wrong with the program; something is wrong on the page.

**The derivation (§1's "every other occurrence").** I walked **every `.tsx` in `src`** with the TypeScript parser and reported every `JsxText` node containing a comment marker, naming `file:line`. **TOTAL 0 in 139 files** after the fix ⇒ **D12's two blocks were the only occurrences in the repo.** 🚫 I did not grep: a grep for the opening marker on this repo answers with hundreds of real comments, and one for the closing marker with every JSDoc in the tree.

## §1b ⭐ The enforcement — `src/lib/ui/jsx-text-comments.test.ts`

**It can be done honestly, and cheaply — because the parser already knows the answer.** The check builds each file's source tree and fails on any **`ts.isJsxText`** node whose text contains a comment marker, naming `file:line`. It runs over the whole of `src` in the suite.

🚫 **The alternative I rejected, and why it would cry wolf:** a line- or regex-based check cannot tell a comment's own text from a comment in JSX children. A block comment **on the line above** a JSX element is correct and common in this repo; a marker inside a string, a template literal or a regex is correct; a JSDoc block is nothing but those two markers. ⇒ a text-level check would fire on hundreds of correct lines, and **a check that fires on correct code is turned off within a week.** 🔑 **The distinction "is this text a CHILD of a JSX element" exists exactly once — in the parsed tree — so that is where the check reads it.** 📌 *This is the same reason `event-in-updater` reads what it reads: the shape, not the spelling.*

⚠️ **It caught me inside the hour.** My replacement comment contained a literal closing marker in its prose, which closed the block early and put the rest back into JSX children — **the new check failed on the very fix that created it.** Reworded; the repo scan then answered `TOTAL 0`.

## §2 The nits

**1. The duplicate box stayed English — derived: a value CAPTURED ONCE.** ✅ **Your read was right and it is a class, not a typo.** The refusal handler stored `message` at the moment the server answered — one language, chosen by whatever the page's language was **then** — and the render printed the stored string. The phase now carries the server's **`{TH, EN}` pair** and **the language is chosen at render**, so the box follows the toggle.
🔑 **Anything else that captures copy the same way? I looked, and no:** every other user-visible sentence on this page goes through `t(…)` at render time. The refusal box was the one place a **server sentence** was stored on a state object ⇒ it was the only candidate, because only a server sentence is a string the page holds rather than a key it looks up. 📌 **The general rule: a KEY may be stored, a SENTENCE may not.**

**2. "Nothing more to do here" — deleted in both languages.** 🔑 **Nobody edited it; TASK-580's Add-a-child button appeared underneath it and made it false.** Same family as §1, and it is why both pins now carry the *why*: the pin asserts the clause is **gone** and that neither language contains it.

**3. District and Sub-district starred — and derived.** All three address parts were `required` to the door while only the province carried a star. Both Selects are starred now, and **all 8 required controls on the register form were checked** — no other unstarred one.
⚠️ **One honest correction to how I first reported this to myself.** In Mantine the star **is** the rendering of `required`: they are one prop, so pinning "the star is there" only says the prop is still typed. ⇒ **the pin's value is the LIST, not the attribute** — five fields named, every one starred — and it is tied to the door: **the sub-district, the part that had no star, is the same part "TWO parts do not submit" proves the form refuses.** 🔑 *The star is the door's rule made visible; a field that loses its star while the door still demands it fails in that test.*

**4. A closed week now carries its mark in the WEEK view.** ✅ **Your framing is the fix: TASK-586's rule already answered it** — a closed week is shown **because it is still running**, and **the marker is the reason showing it is safe.** A week view that showed it unmarked was exactly the case that rule exists to prevent. `closedWeekIds(weeks)` reads the payload's own `status`; `CampBlockCell` takes `closed` and renders the greyed tag; **both grids** (day and week) receive the set from one place in `CalendarContent`.

**5. "7 คน" for a 1-child week — ATTRIBUTED TO THE PAYLOAD. I STOPPED.** 🚫 **Not built.**
🔑 **The FE cannot inflate that number, and I pinned it three ways rather than asserting it:** the cell **renders `kidCount` verbatim** (no sum, no length, no addition); the block builder copies **`b.campKidCount`** and nothing else; and the merge that joins adjacent blocks **requires the same `campWeekDayId`**, so it can never pool two days into one count. **A value test drives it:** two bookings on one day ⇒ `kidCount` **1**, not 2; and two days ⇒ `[1, 7]`, each day its own number. ⇒ **if the screen says 7 where one child is enrolled, the 7 arrived in `campKidCount`. That is @Jason's.**

## §3 Break-and-watch — 10 mutations, 10 BITES, CHECKSUM identical

| # | mutation | verdict |
|---|---|---|
| D1 | 🔴 D12 comes back — a comment in JSX children, rendered on the parent's form | **BITES** 124/1 |
| D2 | 🔴 the check reads TEXT again instead of the parsed tree (the shape that hid D12) | **BITES** 124/1 |
| D3 | the sweep stops looking at `.tsx` files (it would pass on an empty list) | **BITES** 124/1 |
| D4 | 🔴 nit 1 — the sentence is captured at refusal time again | **BITES** 124/1 |
| D5 | ⚠️ nit 2 — "Nothing more to do here" returns | **BITES** 124/1 |
| D6 | ⚠️ nit 3 — the sub-district loses its star while staying required | **BITES** 124/1 |
| D7 | 🔴 nit 4 — a closed week's cell loses its mark in the WEEK view | **BITES** 124/1 |
| D8 | nit 4 — the closed set is derived from something other than the server's `status` | **BITES** 124/1 |
| D9 | 🔴 nit 5's attribution breaks — the FE counts rows instead of printing the server's number | **BITES** 123/2 |
| D10 | the merge pools two DAYS into one block | **BITES** 123/2 |

⚠️ **The first run was 8/10: D6 and D8 SURVIVED, and both survivals were mine to own.**
- **D6 survived because nit 3 was VERIFIED BY EYE and never pinned.** I had read all eight fields and counted the stars; nothing in the suite said so. ⇒ 🔑 ***a field verified by eye is not a field pinned — and a nit fixed without a pin is a nit that comes back.*** The named-five test above is the fix, and it exists because the mutation asked.
- **D8 survived because `closedWeekIds` had only a CALL-SITE source pin** ("`CalendarContent` calls it") and no value test, so any derivation would have passed. The new value test uses a fixture whose **two plausible sources disagree on purpose**: week `b` is **CLOSED with children**, week `c` is **OPEN with no counts at all** ⇒ a set derived from the counts answers `["c"]`, the exact opposite of the truth. 📌 *A fixture that agrees with itself cannot tell two sources apart* — applied deliberately this time.
- ⚠️ **And a third thing the first run exposed: my test LIST was short.** Nit 3's pin lives in a DOM file I had not put in the `--tests` list, so D6 ran against tests that could not see it. **The list is part of the run**; a mutation aimed at a file nobody runs is a green that means nothing.
- 📌 One implementation note from the same pin: the birthday's picker is a `<button required>`, and `HTMLButtonElement` has **no `required` property** — reading the property answered `undefined` for the one field with a widget. The pin reads the **attribute**.

## §4 Nothing to decide, one thing to pass on
🚫 **No copy needs a ruling.** The only string change is a **deletion** (nit 2), filed as `§T-593` in the copy review so Khwan sees the sentence is gone and why.
⚠️ **For Tanya, one request rather than a claim:** D12 was on screen for a whole build and **nobody reported it until the re-test** — worth knowing whether the earlier pass looked at that strip of the form at all, because the check now guarantees the class, not the sighting.

## Files
- **Fixed:** `src/components/partials/Register/RegisterContent.tsx` (D12 ×2, nit 1's `{TH,EN}` pair, nit 3's two stars) · `src/lib/i18n/dictionaries.ts` (nit 2, both languages) · `src/lib/camp/units.ts` (`closedWeekIds`) · `src/components/partials/Calendar/CampBlockCell.tsx` + `CalendarGrid.tsx` + `CalendarWeekGrid.tsx` + `CalendarContent.tsx` (nit 4).
- **New tests:** `src/lib/ui/jsx-text-comments.test.ts` (the enforcement).
- **Updated tests:** `src/components/partials/Register/register-required.dom.test.tsx` (the named-five star pin) · `src/lib/camp/camp.test.ts` (`closedWeekIds` value test) · `src/lib/camp/grid.test.ts` (the grids pin, nit 5's attribution block) · `src/lib/register/register-page.test.ts` (nit 1's `dupMessage`, nit 2's Thai copy, the PLACEHOLDER tag pin).
- **Mutations:** `scripts/mutation/task-593.json` (D1–D10).

---

# ✅ DONE — REVIEWED by @Sober (2026-10-01)
Verified by me: **913 pass / 0 fail** across 95 files · tsc 0 · build ok.

## 🔴 D12 — she named the edit, and it is HER OWN RULE biting from a new angle
**TASK-591 MOVED two valid comments into JSX children.** ⇒ 🔑 ***"A comment does not have to be edited to become false — it only has to be moved."*** **Here it did not become false. It became VISIBLE.** 📌 **That is the same rule, one turn further, found by the person who wrote it.**

## 🔑 "Nothing caught it" — the uncomfortable answer, and it is the finding of the round
**The register pins STRIP COMMENTS before matching (`codeOf`)** ⇒ **a comment that had become TEXT was invisible to exactly the tests that read this file.** **The DOM tests read named things — a label, a box, a button — never the strip between two fields. `tsc` and the build are right to be silent: JSX text is valid JSX.**
🔑 **The very step that makes those pins robust is what blinded them to this class.** ⇒ **A defence can have a shape-shaped hole, and only the shape it ignores gets through.** **Recorded.**

## ⭐ The enforcement — and she rejected the cheap version IN WRITING
**`jsx-text-comments.test.ts` reads the PARSED TREE.** ✅ **She refused the line/regex shape and said why: a marker ABOVE a JSX element, inside a string, or in JSDoc is all correct** ⇒ **it would fire on hundreds of good lines**, and 🔑 ***"a check that fires on correct code is turned off within a week."***
🔑 **"The distinction *is this text a CHILD of a JSX element* exists exactly once — in the tree."** ⚠️ **And it failed on her OWN fix inside the hour** (a literal closing marker in the new comment's prose) — 📌 **the best possible evidence that it reads the real thing rather than a proxy for it.**
✅ **Derived with the parser, not a grep: every `.tsx` in `src` walked for `JsxText` nodes carrying a marker ⇒ 0 others in 139 files.**

## ✅ The nits, each with the derivation
1. **A value CAPTURED ONCE, exactly as suspected** — the sentence was stored at answer time in one language; it is now the server's `{TH,EN}` with **the language chosen at render**, and **nothing else on the page does this.** 🔑 **Her rule, and I am keeping it: *a KEY may be stored, a SENTENCE may not.***
2. ✅ **Deleted in both languages, filed as a DELETION so Khwan sees the clause was left on purpose.** 📌 *A removal that is invisible in the copy file reads as an oversight.*
3. ✅ **She CORRECTS HER OWN FIRST REPORT:** in Mantine the star **is** the rendering of `required`, so pinning the star alone only says the prop is typed. 🔑 **The pin's value is the LIST — five fields named, every one starred, tied to the door.** *The part with no star is the part "two parts do not submit" proves the form refuses.*
4. ✅ **Both grids take the set from ONE place, reading the payload's own `status`.**
5. ✅ **Nit 5 ATTRIBUTED TO THE PAYLOAD and STOPPED, pinned THREE ways** — the cell renders `kidCount` verbatim, the builder copies `campKidCount` and nothing else, and the merge requires the same `campWeekDayId` so it can never pool two days. **A value test drives it (two bookings ⇒ 1; two days ⇒ `[1, 7]`)** ⇒ **if the screen says 7 for one child, the 7 arrived in the payload.** 🔑 **That is an attribution, not an opinion** ⇒ **@Jason.**

## ⚠️ The three she owns from the run — and the third is a rule
- **D6 survived: nit 3 was VERIFIED BY EYE and never pinned.** 🔑 ***"A field verified by eye is not a field pinned — and a nit fixed without a pin is a nit that comes back."***
- **D8 survived: a CALL-SITE source pin would have passed any derivation** ⇒ ✅ **the fixture's two candidate sources now DISAGREE on purpose.** *Her TASK-588 lesson, applied.*
- 📌 **Her `--tests` list was short, so D6's pin lived in a file the run never touched.** 🔑 ***"The list is part of the run: a mutation aimed at a file nobody runs is a green that means nothing."*** **Recorded.**

## ⚠️ Her question for Tanya — **fair, and it goes up in her words**
**D12 was on screen for a whole build and went unreported until the re-test.** 🔑 ***"The check now guarantees the class; it cannot guarantee the sighting."***
📌 **That is not a complaint and I am not sending it as one** — **it is worth knowing whether that strip of the form was looked at, because the answer changes what we ask of a pass.**
