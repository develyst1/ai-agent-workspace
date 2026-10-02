# TASK-605 — restore `closedWeeks` on the merged tree — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-10-02) · 🔴 **sid and uat are both HELD on this. It is one identifier.**

## §0 What the merge did — I derived it before cutting this
**`CalendarGrid.tsx` had TWO independent additions to the same destructure: Palm's `times` (his item 4, the time filter) and our `closedWeeks` (TASK-593 nit 4).**
🔴 **The resolution kept HIS and dropped OURS** — **while our prop TYPE (line 40) and our USAGE (line 130) both survived.** ⇒ **`Cannot find name 'closedWeeks'`, and the build fails on it.**
✅ **It is a MERGE ARTEFACT, not a defect in Palm's code.** 🔑 **Both lines were correct on their own branch. Nothing of his needs changing.**

## §1 The fix
- **Put `closedWeeks` back in the `CalendarGrid` destructure.** 🚫 **Touch nothing else in that signature — `times` is Palm's and it stays exactly as he wrote it.**
- 🚫 **Items 4, 9 and 11 are his. Do not alter them**, even where they sit beside our lines.

## §2 🔑 The part that matters more than the fix
**921 tests passed on a tree that could not build.** ⇒ **Our `closedWeeks` pin asserts the SET DERIVATION in `camp.test.ts`; nothing asserted that the GRID RECEIVES it.** 🔑 **The WIRING had no pin** — *the same "a guard with no fixture" family as TASK-596.*
⇒ ⭐ **Pin the wiring: the grid is given the set, and a closed week renders marked.** ⚠️ **If the honest answer is that only a DOM test can reach that, say so and say what it costs.**
📌 **And say plainly whether any OTHER prop of ours is wired but unpinned in that file** — 🔑 **one dropped identifier that no test noticed is a question about the file, not about the merge.**

## §3 Verification — report these three separately
**`tsc` CLEAN · the suite's count · `build` SUCCEEDING.** 🔑 **The build is the one that was failing, so "tests pass" is not the answer here.**

## Definition of Done
- [ ] `closedWeeks` restored, **Palm's `times` untouched** · 🚫 items 4/9/11 unaltered · ⭐ **the wiring pinned, or its cost stated** · **other wired-but-unpinned props of ours named** · **tsc clean · suite count · BUILD SUCCEEDING, reported separately** · Break-and-watch on the new pin, CHECKSUM · report + `inbox/SA.md` + log · ⚠️ **tell me at once — both environments are held.**

---

# 📋 REPORT — @Fern → @Sober (2026-10-02)

**Repo:** `smart-scheduler-front` @ `3fb4f53` (the merge commit). **§0: I re-read the front repo before starting** — `CalendarGrid.tsx` whole, `CalendarWeekGrid.tsx`, `CampBlockCell.tsx`, `CalendarContent.tsx`'s two mounts and the TASK-593 pins. 🚫 **Palm's items 4, 9, 11 untouched.**

## §3 Verification — the three, separately, as asked
| gate | before | after |
|---|---|---|
| **`tsc --noEmit`** | **1 error** — `CalendarGrid.tsx(130,26): TS2304: Cannot find name 'closedWeeks'` | ✅ **exit 0, clean** |
| **suite** | **921 / 0 — PASSING on a tree that could not build** | ✅ **924 / 0 across 97 files** |
| **`bun run build`** | ❌ **failed** | ✅ **exit 0, `[postbuild] copied .next/static into .next/standalone`** |
🔑 **The build is the gate that was down, and it is up.** 📌 *"Tests pass" was true the whole time and meant nothing — which is the finding, not the fix.*

## §1 The fix — one word
**`closedWeeks` is back in `CalendarGrid`'s destructure.** Your derivation was exactly right: the prop TYPE (line 40) and the USAGE (line 130) both survived the merge; only the destructure lost it.
🚫 **Palm's `times` is untouched** — same position, same default, same line. **The whole diff of mine in that file is one identifier added to one line** (`git diff --stat`: `CalendarGrid.tsx | 2 +-`), and nothing of items 4, 9 or 11 is altered anywhere.

## §2 ⭐ The wiring, pinned link by link
**`src/lib/camp/grid.test.ts`** now asserts the whole chain, so a missing link is a RED TEST rather than a red build:
1. the page **derives** the set once (`closedWeekIds(calendar?.campWeeks)`),
2. **both** grids are **handed** it at their call sites,
3. 🔴 **each grid DESTRUCTURES it** — the link the merge dropped — *and the same assertion checks Palm's `times` is still in that destructure beside it*,
4. the day grid passes it **down to `Row`**, and `Row` reaches it,
5. the shared cell **MARKS** it (`data-camp-closed`, `data-camp-closed-tag`).

✅ **A source pin is the honest instrument here, and it is not a compromise.** A DOM test would prove the mark reaches a screen — `camp-week-lifecycle.dom.test.tsx` is the file it would live in — but **the defect was a missing identifier, and what catches that is reading the file.** 🔑 **The cost of the DOM route is the reason I did not take it:** mounting the calendar grid needs the whole page's providers, the calendar payload and a camp week in the right shape, **~80 lines of fixture to prove one prop is passed**, and it would still not say *which* link broke. ⚠️ **What the source pin cannot do: it cannot tell me the marker is VISIBLE** — only that the attribute is rendered from the prop. The cell's own rendering is pinned by value in `grid.test.ts` already.

## §2b ⚠️ The derivation — and it found one more, worse than this one
🔑 **The props that can be dropped in silence are the OPTIONAL ones.** A required prop left out at a call site is a type error, so the build still shouts — which is why `teachers`, `bookings`, `onSelectBooking` and `onCreate` are not the risk, even though **`onSelectBooking` and `onCreate` are named in no test file at all.** The silent set in this file is **`times?` (Palm's), `onSelectCamp?` and `closedWeeks?`**.
🔴 **And `onSelectCamp` was wired at BOTH call sites and pinned at NEITHER.** The existing test asserts what the grids DO with it once they have it; nothing asserted the page hands it over. ⇒ **dropping it compiles, passes, and leaves a camp block that opens nothing.** 🔑 *A dead control is worse than a missing marker: the marker's absence hides a fact, the dead control invites a click and answers it with silence.* **Pinned now, both views, with a count (`2`) so one surviving call site cannot cover for the other.** 📌 Z9 is that mutation, and it bites.

## §2c ⭐ And the class, not just the instance — `src/lib/ui/props-wired.test.ts`
**A declared prop that is never destructured and never read is LEGAL TypeScript.** The caller passes it, the component ignores it, nothing fails, the feature is simply absent. ⇒ *the same shape as the merge's defect, minus the one accident (the surviving usage) that made it loud.*
**The check parses each calendar file and fails when a declared prop is unreachable in the component body** — destructured, or read as `props.x`. It reads the **parsed tree**, so a prop named in a comment or a string does not count as wiring, and a prop deliberately left unread must say `unwired-on-purpose` in the file, **which is a decision rather than a silence.**
⚠️ **Its limits, stated:** it covers the **three calendar files** this class has bitten, not the repo; it **cannot tell whose prop is whose, so it binds Palm's props too** — all of them are wired today, so it constrains nobody as it stands, but 🔑 **say the word if binding his files is not acceptable and I will scope it to ours.** And it says nothing about whether a prop's VALUE is right.

## §4 Break-and-watch — 9 mutations, 9 BITES, CHECKSUM identical

| # | mutation | verdict |
|---|---|---|
| Z1 | 🔴 **the merge's own defect**: `closedWeeks` dropped from the day grid's destructure | **BITES** 28/2 |
| Z2 | 🔴 the same drop in the **week** grid | **BITES** 29/1 |
| Z3 | 🔴 the page stops **handing** the set to the week grid | **BITES** 29/1 |
| Z4 | the day grid stops passing it to `Row` | **BITES** 29/1 |
| Z5 | 🔴 the cell stops **marking** a closed week | **BITES** 29/1 |
| Z6 | 🔴 the props-wired check reports nothing ever | **BITES** 29/1 |
| Z7 | the check stops understanding inline props types | **BITES** 29/1 |
| Z8 | ⚠️ the `unwired-on-purpose` escape silences everything | **BITES** 29/1 |
| Z9 | ⚠️ **the derivation's own find**: `onSelectCamp` not passed to the week grid | **BITES** 28/2 |

📌 **Z1 is the row that matters: it is the merge, reproduced on purpose, and it now fails in the suite** — the tree that shipped would have been caught before the build.

## Files
- **Fixed:** `src/components/partials/Calendar/CalendarGrid.tsx` — one identifier restored.
- **Pins:** `src/lib/camp/grid.test.ts` — the five-link chain, plus the `onSelectCamp` call sites.
- **New:** `src/lib/ui/props-wired.test.ts` — the class check, with fixtures and its stated limits.
- **Mutations:** `scripts/mutation/task-605.json` (Z1–Z9).

---

# ✅ DONE — REVIEWED by @Sober (2026-10-02) · 🟢 **SAFE TO DEPLOY**
Verified by me, all three separately: **tsc CLEAN · 924 pass / 0 fail across 97 files · `bun run build` SUCCEEDS** (`[postbuild] copied .next/static into .next/standalone`).
📌 **The build is the one that was failing, so that is the line that matters.**

## 🔑 Her first derivation is the one that explains the whole episode
**"Only OPTIONAL props can be dropped in silence"** — **a required prop left out at a call site is a type error, so the build still shouts.**
⇒ **The silent set in that file is exactly three: `times?` (Palm's), `onSelectCamp?` and `closedWeeks?`.** 📌 **That is why `teachers` and `bookings` were never the risk — even though `onSelectBooking` and `onCreate` appear in NO test file at all.**
🔑 **A derived risk set, not a search.**

## 🔴 And it found a SECOND latent defect, unasked
**`onSelectCamp` was wired at BOTH call sites and pinned at NEITHER.** **The existing test asserts what the grids DO with it once they have it; nothing asserted the page hands it over.** ⇒ **dropping it would compile, pass the suite, and leave a camp block that opens nothing.**
🔑 ***"A dead control is worse than a missing marker: the marker's absence hides a fact, the dead control invites a click and answers it with silence."***
✅ **Pinned in both views with a COUNT of 2, so one surviving call site cannot cover for the other** (Z9).

## ⭐ The class — and it reframes what happened to us
**`props-wired.test.ts`: a declared prop that is never destructured and never read is LEGAL TypeScript** — **the caller passes it, the component ignores it, nothing fails, and the feature is simply ABSENT.**
🔑 ***That is the merge's own shape, minus the one accident — the surviving usage — that made it loud.*** ⇒ **Had the usage been dropped too, we would have shipped a silently missing feature and the build would have been clean.**
📌 **So the inventory problem I reported to @Porter is now partly closed: Z1 reproduces the merge on purpose, and the tree that shipped would FAIL IN THE SUITE before anyone reached the build.** ✅ **Parsed tree, so a prop named in a comment is not wiring; and `unwired-on-purpose` must be WRITTEN in the file — a decision, not a silence.**

## ⚖️ Her ruling request — **let it bind Palm's files too**
**The check cannot tell whose prop is whose. Every prop in those three files is wired today, so it constrains nobody as it stands.**
⚖️ **Ruled: leave it binding all three files.** 🔑 **Four reasons, and the second is the one that decides it:**
1. **It constrains nobody today** — it is not a new rule imposed on him, **it is a statement that what is already true stays true.**
2. 🔑 **A check scoped to "ours" would need a list of whose-prop-is-whose — and that list is exactly the thing that rots.** **It would be wrong the first time either side moves a prop**, and *a check that is wrong is a check that gets switched off.*
3. ✅ **The escape hatch is explicit and self-documenting** — one line, in the file, visible in review.
4. 🔑 **And the honest framing: this protects HIS work from OUR merges as much as ours from his.** **What we just lost was ours. The same shape could drop his.**
📌 **@Porter informs the owner, who tells Palm — as a notification, not a request.** **If Palm objects, it scopes down to ours and nothing else changes.**
✅ **And she was right not to decide it for him.**
