# TASK-624 — FE: **Swap must let you choose WHICH teacher goes out** (REQ-111 item E, front half)
**From @Sober to @Fern.** **Pairs with `TASK-629` (BE).** **Owner: "2 เริ่มได้เลย".** ▶️ **Start it after `TASK-611`; do not split your attention across both.**
🔑 **Khwan's own words, through the owner: *"swap ได้แค่ครูที่เป็น primary ค่ะ ต้องการให้เลือกคนอื่นได้ค่ะ แล้วจะตรงที่ต้องการใช้งานเลยค่ะ"*** — **and she says that alone makes it do what she needs.** ⇒ **A WIDENING of a control you already have. 🚫 Not a new screen, not a new dialog.**

---

## 1. ✅ Your file area — `OtherSeries/*` is yours this batch
**`OtherSeriesModal.tsx` and `OtherSeriesDialogs.tsx`.** 🚫 **Still not yours:** `CalendarContent.tsx` · `CalendarGrid.tsx` · `CalendarWeekGrid.tsx` · `lib/scheduler/teacher-scope.ts` · `lib/camp/grid.test.ts` · `partials/Bookings/*`. **Read anything; edit only your list.**

## 2. What is wrong today, in two places
1. **The Swap button is only ever DRAWN beside the primary's name.** **Each extra teacher gets *Remove*, never *Swap*.**
2. **The dialog HARDCODES who leaves** — the body builder is handed the series' primary, and **there is no "from" picker at all.**
⇒ **Both have to go.** ✅ **The server half is @Jason's and it is being widened in the same batch; until his lands, your requests will be refused — that is expected, not a bug to chase.**

## 3. ▶️ What to build
**Render the same Swap control beside EVERY teacher on the row, and send THAT teacher as the one going out.**
🔑 **ONE dialog and ONE body builder.** 🚫 **Do not add a second dialog for "swap an extra", and do not branch the body builder on whether the outgoing teacher is the primary** — **the screen does not need to know, and the moment it does, it holds a second idea of who is on a session.** *The server decides what that teacher's position means; the screen only says who.*
✅ **Everything else stays exactly as it is:** **the scope chooser with NOTHING pre-selected** (🔑 *that was Khwan's EARLIER complaint — a pre-selected "the rest" would reproduce it with one extra click*) · **the date label that says what the date MEANS in the chosen scope** · **the outcome line** · **the cover-rate box and its rules** · **nothing sent until a scope is chosen.**
⚠️ **The "to" picker already excludes everyone on the row. Check it still excludes the right set once the outgoing teacher is a variable** — 🔑 **the person going OUT must not appear in the list of people who could come IN.**

## 4. 📋 The copy — **send me the English; it stops being true the day this ships**
🔴 **The dialog's title today reads "สลับครูหลัก" / "Swap the primary teacher ({name})".** **The moment this ships, that is false on most uses of it.**
▶️ **Draft the English and send it to me. 🚫 Do not ship wording.** ✅ **Copy is mine this batch and the owner sees it before it goes.** 🔑 **Every string through the dictionary, both languages, and COUNTED** — *a bilingual assertion is satisfied by ONE language unless both are counted.*

## 5. ✅ Done means
1. **`bun node_modules/typescript/lib/tsc.js --noEmit` clean · `bun test` clean · `bun run build` clean.** 🔑 **On this repo `tsc` and `build` are the INVENTORY, not the suite.**
2. **A DOM test: the Swap control appears beside EVERY teacher on the row** (🔑 **derived from the row's teachers, not an enumerated list of two**) · **the outgoing teacher is the one the body names** · **the outgoing teacher is absent from the "to" list** · **no scope chosen ⇒ nothing sent.**
3. 🔴 **A test that the PRIMARY swap is unchanged** — same body, same scope rules. *The widening must be invisible to the use that already worked.*
4. **Both languages counted. The English draft with me before any wording is final.**

## 6. 🚫 Not in this task
**The from-here-on rate fix (`TASK-625`, @Jason's — same round, separate change)** · **"Add teacher", which STAYS as it is** (🔑 **a genuine second coach on a session is a real thing the school does — it was simply never the answer to Khwan's question**) · **the four notification kinds (`TASK-614`)** · **item D's grid marker (Team B's).**

---

## Team B takeover (Silver, 2026-10-06), on Porter's split (ECA → Team B) and the owner's ruling
- **Now @Fanta's (Team B), from @Silver.** `partials/OtherSeries/*` is Team B's from 10-05. Further files are being claimed (`PLAN-teamB-response-2026-10-06.md`).
- 🔴 **This TASK now includes "1b"** (`SIZING-teamB-next-round-pile-2026-10-05.md` §1b): a **"from here on"** swap to a teacher the series has never paid is refused `RATE_REQUIRED` (TASK-625), and the dialog shows a rate box **only for a one-session cover** (`coverRateRequired`, `lib/scheduler/series-scope.ts:67`).
  - **Owner ruled 10-05:** the GROUP swap's answer carries over. An optional rate field on "from here on", **as `GroupSwapDialog` does (TASK-634)**.
  - ⇒ **624 and 1b ship together.** A Swap on every teacher that is then refused with no field to answer would be TASK-644's lesson again.
- **Wording:** `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md` §A (title) and §B (rate field). DRAFT until the owner approves.
- Full Team B instructions follow when the claims land (Wed morning).

## ▶️ TEAM B INSTRUCTIONS (Silver, 2026-10-06): @Fanta, Wed–Thu · FE S + S · ships as ONE (624 + 1b)
**Status:** DONE — FINAL (Silver, 2026-10-07): DRAFT markers off, no string changed
**Claim** (asked in `PLAN-teamB-response-2026-10-06.md`):
- `partials/OtherSeries/*` ✅;
- `src/lib/scheduler/series-scope.ts` ✅;
- `src/lib/scheduler/other-series.ts` ✅, only if needed;
- the `otherSeries.*` keys in `dictionaries.ts` ✅;
- `src/lib/rbac/action-gate.test.ts` ✅, only if a new gate literal is added.
- If you need anything else, STOP and tell me.

### Part 1, swap ANY teacher (CERTAIN facts, re-verified 10-06)
- **The back end already does it** (TASK-629): `PATCH /other-series/:key/teacher` with `{ from, to, fromDate | onDate, rateMinor? }`. **No BE change.**
- **Today:** the only Swap button is beside the primary (`OtherSeriesModal.tsx:111-114`), and extras get only Remove. The dialog sends `from = series.teacherId` (`OtherSeriesDialogs.tsx:157`) and hard-codes the primary in its title, outcome and success lines (`:167`, `:226`, `:159`).
- **Build:**
  - a Swap door on **every** teacher, carrying that teacher's id;
  - the dialog uses that id as `from` everywhere;
  - the "to" list already excludes everyone on the row.
- **Title wording, owner-APPROVED 10-06:** TH **`สลับครู — {name}`**, EN **`Swap teacher — {name}`** (the EN companion, same meaning). `{name}` = the teacher being swapped OUT.

### Part 2, "1b": a rate field on a "from here on" swap (owner CONFIRMED 10-06: the GROUP ruling carries over)
- Since TASK-625, a "from here on" swap to a teacher the series has never paid is refused **`RATE_REQUIRED`**. The dialog shows a rate box **only for a one-session cover** (`coverRateRequired`, `series-scope.ts:67`). Its comment still says the server writes no rate over the rest of the series, **which is false since TASK-625**.
- 🔴 **MIRROR TASK-634, do not re-invent it** (Porter). `GroupSwapDialog.tsx` already solved this exact problem with an **optional** rate field on the series scope. Same shape, same behaviour, same reasoning.
- **Wording** (mirrors the approved group pair): `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md` §B, label + hint. ⚠️ Porter's message approved the carry-over, and §B's two strings are the group's approved pair with "กลุ่ม" → "ตาราง". **Ship them marked `📋 DRAFT wording` unless Porter confirms they are covered.** Ask me if unsure.
- The one-session cover keeps its existing `coverRate` field, unchanged.

### Definition of Done
- [ ] **Clicked DOM tests:**
  - a Swap door on the primary **and** on each extra;
  - swapping an extra posts `from = that extra`;
  - the primary's swap is unchanged (pinned);
  - "from here on" shows the optional rate field and sends `rateMinor` when filled;
  - a `RATE_REQUIRED` refusal is answerable from the same dialog;
  - the one-session cover is unchanged.
- [ ] Fix the stale `series-scope.ts` comment.
- [ ] Mutation set (front form, `--tests` list declared):
  - the Swap only on the primary (bites);
  - `from` always the primary (bites);
  - the rate field hidden on "from here on" (bites);
  - the cover's rate box changed (bites).
- [ ] `bun test`, `tsc` and `build`, with counts. 🚫 No click on sid or uat.
- [ ] Nothing committed.

### QA hand-off (routes first)
- **API:** `PATCH /api/other-series/{key}/teacher` with `from` = an **extra** teacher ⇒ that extra is replaced and the primary stays. "From here on" to a never-paid teacher without `rateMinor` ⇒ `RATE_REQUIRED`; with it ⇒ OK.
- **Screen:** ECA Manage plan ⇒ Swap beside every teacher; the dialog title names who goes out; the rate field appears on "from here on".


---

## Implementation Notes (Fanta, 2026-10-06 · 624 + 1b as ONE)
Repo `smart-scheduler-front`. Nothing committed. The tree also holds my TASK-665 files (the owner has not committed them yet) and no one else's.

**Files (this TASK only):**
- `M partials/OtherSeries/OtherSeriesModal.tsx`: a Swap door beside **every extra**, next to the primary's existing one. Each opens the dialog with `teacherId` = that teacher; the primary's door now passes its own id too. Every door carries `data-swap-teacher="<id>"`. The doors come from the row's teachers (the same `.map` that draws Remove), not a list of two.
- `M partials/OtherSeries/OtherSeriesDialogs.tsx` (`TeacherDialog`):
  - `const from = teacherId ?? series.teacherId` is the one place "who goes out" is decided. It feeds the body (`swapBody(seriesRef, from, to)`), the title, the outcome line and the success toast. **One dialog, one body builder, no branch on whether `from` is the primary.**
  - The "to" list is unchanged (`bookable && not on the row`). It already excludes the outgoing teacher, because they are on the row. Pinned.
  - **1b:** a new optional rate box (`restRate` = swap + scope "rest" + key 59), separate state `restRateBaht`, `data-swap-rate`. Not `required`, never pre-filled, hidden without key 59. It rides as `rateMinor` only when filled, through the same `withoutRates` guard. The one-session cover keeps its own required box, unchanged.
- `M lib/scheduler/series-scope.ts`: the stale comment is fixed (it said the server writes no rate over the rest of the series, false since TASK-625). Comment only, no code.
- `M lib/i18n/dictionaries.ts` (`otherSeries.*` only):
  - `swapTeacherTitle`: TH `สลับครู — {name}`, EN `Swap teacher — {name}`. **Owner-approved 10-06.** It **replaces** `swapPrimaryTitle`, which is now unused (its text said "primary", false from today). Net key count `otherSeries`: 46 → 48 (−1, +3).
  - `swapRate` / `swapRateHint`: `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md` §B verbatim, marked **`📋 DRAFT wording`** (Porter has not confirmed they are covered; you said to ship them marked unless he does).
- `M partials/OtherSeries/series-scope.dom.test.tsx`: +11 clicked tests (7 → 18), plus a revocable key 59, a one-shot server refusal, an extra on the series and a third coach. **One existing test was retitled**: "…there is no rate box … the server writes none" became untrue with 1b. Its assertions are unchanged and still pass (they read the cover's box and an empty series box).
- `?? partials/OtherSeries/swap-doors.dom.test.tsx`: 5 modal-level tests. `?? …/swap-any-teacher-task624.mutations.json`: 10 mutations.

**Decided and declared (internal; overturn freely):**
1. 🔴 **A GROUP series gets NO Swap door on its extras.** The server's group route (`PATCH /group-series/:key/teacher`, `groupSeriesSwap = { to, fromDate?, rateMinor? }`) has no `from`: it always moves the PRIMARY. A door beside a group's extra would swap the primary and say it swapped the extra. This branches on series **kind** (which `swapBody` already did), not on primary-ness. Read-only check of `smart-scheduler-back`.
2. **A separate `restRateBaht` state**, so a rate typed for one session cannot travel into "the rest". Proven: the test reads the box's displayed value. My first version of that test read an attribute and a mutation survived; I fixed the test.
3. **Tests added to the existing `series-scope.dom.test.tsx`** (already on `masked-input-assert.test.ts`'s pinned list), and the door tests in a new file that does not type, so **no fifth pin edit** is needed outside the claim.
4. The door's button label stays `otherSeries.swapPrimary` ("Swap"/"สลับ"). Its key name is stale, its text is right. Renaming the key would touch pinned tests for no user-visible gain.
5. `from` falls back to the primary when a caller names nobody. Every earlier test relies on that, and it is pinned.

**Verification:**
- `bunx tsc --noEmit` exit 0 · `bun run build` exit 0.
- New tests: `series-scope.dom.test.tsx` **18 pass / 0 fail**, `swap-doors.dom.test.tsx` **5 / 0**. All read at the wire: `from` / `to` / scope key / `rateMinor`.
  - doors: one per teacher on the row (ids equal the row's); an extra's door opens the dialog naming that extra; a GROUP has the primary's only; none without the edit key;
  - extra: `from` = that extra, never the primary; the "to" list excludes the outgoing teacher and the whole row; no scope ⇒ nothing sent; a cover of an extra is still `{from,onDate,rateMinor,to}`;
  - **primary unchanged (pinned):** same body, same scope rules, same fallback;
  - **1b:** the box appears on "the rest", empty, not required, filled ⇒ `rateMinor: 65000`; a **`RATE_REQUIRED` refusal is answered from the same dialog** (the server's sentence shows, the box is there, the retry carries `70000`); no carry from the cover's box; hidden without key 59.
- Mutation set `swap-any-teacher-task624`: `bun run mutation:run -- --tests "src/components/partials/OtherSeries/series-scope.dom.test.tsx src/components/partials/OtherSeries/swap-doors.dom.test.tsx" --mutations src/components/partials/OtherSeries/swap-any-teacher-task624.mutations.json`
  ```
  BASELINE 23 pass / 0 fail
  S1 Swap only on the primary ..................... BITES 20/3
  S2 from always the primary ...................... BITES 17/6
  S3 rate box hidden on "from here on" ............ BITES 20/3
  S4 the cover's rate box changed ................. BITES 20/3
  S5 a GROUP gets doors on its extras ............. BITES 22/1
  S6 the outgoing teacher offered to come in ...... BITES 22/1
  S7 the series box shown without key 59 .......... BITES 22/1
  S8 a one-session rate carried into the series box BITES 22/1   (first run: SURVIVED → test strengthened, re-run)
  S9 the typed rate never reaches the body ........ BITES 21/2
  S10 the title always names the primary .......... BITES 21/2
  CHECKSUM identical
  ```
- **Full `bun test`: 1017 pass / 4 fail across 113 files.** The 4 are exactly the pins in Q1; nothing else fails.
- 🚫 No click on sid or uat. **Footprint:** none (the runner restored every file).

## Questions
All three at once.
- **Q1 — four pins outside the claim (BLOCK a green suite; STOP as the TASK says).** Each reads the exact source of a line this TASK had to change. No other edit in any of them:
  1. `src/lib/scheduler/other-series.test.ts:95` and `src/lib/scheduler/group-series.test.ts:88` pin `withoutRates({ ...swapBody(seriesRef, series.teacherId, to), ...scoped, ...rateOnCover }, canRate)`. New text: `withoutRates({ ...swapBody(seriesRef, from, to), ...scoped, ...rateOnCover, ...rateOnRest }, canRate)`. (`from`, the teacher whose door was pressed, replaces `series.teacherId`; `rateOnRest` is the 1b rate.) The comments around them say what they protect, **the GROUP swap body `{ to }` alone, and `from` is the primary for OTHER**. The second half is now "`from` is the teacher whose door was pressed"; `swapBody`'s shape and the group's `{ to }` are untouched and still pinned in `group-series.test.ts:36-37`.
  2. `src/lib/scheduler/series-scope.test.ts:264` pins `swapBody(seriesRef, series.teacherId, to)`. New text: `swapBody(seriesRef, from, to)`. This file sits beside `series-scope.ts`, which is in the claim, but the TASK does not name it.
  3. `src/lib/scheduler/other-series.test.ts:132` pins the key count `Object.keys(en).length).toBe(46)`. New: **48** (−`swapPrimaryTitle`, +`swapTeacherTitle`, +`swapRate`, +`swapRateHint`), with a TASK-624 note in the file's style.
  - 🚫 What I did NOT do: keep the old pinned text alive by shadowing a `series` object with a fake primary, or by keeping `swapPrimaryTitle` as a dead key. Both would make the pins pass while no longer protecting anything.
  - May I make those four edits?
  > answer (Silver): **Correctly stopped, and right NOT to shadow `series` or keep a dead key.** All four lines are asked of Porter, recommending YES exactly as you wrote them. 🚫 Do not edit them until he grants.
- **Q2 — user-visible wording (STOP, not mine to write):** the "to" picker's label is `otherSeries.swapTo`: TH **"ครูหลักคนใหม่"** / EN **"New primary teacher"**. **Swapping an extra now shows that label above the picker, and it is false** (the new coach is not the primary). It is not in `COPY-DRAFT-teamB-week-to-10-11` §A–§B. I left it **unchanged**. Needed: a TH + EN pair. If the owner is happy with something neutral, the group dialog already uses *"ครูคนใหม่ของกลุ่ม" / "New coach for the group"* (`booking.swapTo`-style) as a model, so *"ครูคนใหม่" / "New teacher"* would be the minimal shape, but that is a suggestion, not a string I will ship.
  > answer (Silver): **Correctly stopped.** I proposed *"ครูคนใหม่ / New teacher"* to Porter (the approved group string minus "ของกลุ่ม"). He decides whether it needs the owner. Leave `swapTo` unchanged until he answers.
- **Q3 — a FINDING on GROUP series, NOT in this TASK and NOT changed (flag, not take):** on a GROUP series the dialog still offers the scope chooser. Picking **"This session only"** sends `{ to, onDate }`, but the group's route validator is `groupSeriesSwap = z.object({ to, fromDate?, rateMinor? })` (`back/src/validation.ts:707`, not strict) and `swapGroupSeriesTeacher` uses `input.fromDate ?? today()` (`back/src/services/other-series.service.ts:363-370`). So `onDate` is **stripped, and the swap moves the group from today onward**, while the admin chose one session. That is the same class as Khwan's earlier complaint (a teacher change that silently rewrote every remaining session). I have **not** verified it end to end against a running server (no local stack); this is from reading both sides. Out of this TASK's scope either way. Who should look?
  > answer (Silver, 2026-10-06): **Verified in the COMMITTED code, so it is live today, not something 624 introduces.** The scope chooser shows for every swap (HEAD `OtherSeriesDialogs.tsx:213-219`). On a group, `onDate` is stripped by `groupSeriesSwap` (back `validation.ts:714`), and `swapGroupSeriesTeacher` moves from `today()` on (`other-series.service.ts:366`). The one-session `rateOnCover` also rides as a from-here-on rate. **Raised to Porter as a defect; 🚫 do not change it in this TASK.** Excellent catch, and right to flag rather than take.

### ▶️ Q1–Q3 RULED (Porter, 2026-10-06), relayed by Silver: UNBLOCKED
- **Q1 ✅ GRANTED, the four lines, one each:** `other-series.test.ts:95` · `other-series.test.ts:132` · `group-series.test.ts:88` · `series-scope.test.ts:264`.
  - **Condition:** each still asserts the SAME CLAIM, not merely passes.
  - 🔴 **The key-count line especially:** if 46→48 is right, **NAME the two new keys in that test** (`swapTeacherTitle`, `swapRate`, `swapRateHint`; and assert `swapPrimaryTitle` is gone), not just the count. A count edited every time it fails has stopped testing anything.
- **Q2 ✅ APPROVED by Porter:** `swapTo` becomes **`ครูคนใหม่` / `New teacher`**. It corrects a string that 624 makes false (the approved group string minus "ของกลุ่ม").
  - **No owner round, so ship it WITHOUT a DRAFT marker,** with a comment naming Porter's approval. He lists it to the owner as a line he can veto.
- **Q3:** the GROUP "this session only" defect goes to the OWNER tonight (Porter recommends fixing it at the server first). 🚫 **Nothing on it in this TASK.** Do not hide the control here either; that waits for the ruling.


### Round 2 — Q1 + Q2 granted and done (Fanta, 2026-10-06)
**Q1 — the four lines, one each, each still asserting its claim:**
```
other-series.test.ts:95   withoutRates({ ...swapBody(seriesRef, series.teacherId, to), ...scoped, ...rateOnCover }, canRate)
                       →  withoutRates({ ...swapBody(seriesRef, from, to), ...scoped, ...rateOnCover, ...rateOnRest }, canRate)
                          + ONE added assertion so "who goes out" stays pinned: expect(dialogs).toContain("const from = teacherId ?? series.teacherId;")
group-series.test.ts:88   the same literal → the same new text (its claim, the GROUP body is swapBody's { to } alone, is still pinned by value at :36-37)
series-scope.test.ts:264  swapBody(seriesRef, series.teacherId, to) → swapBody(seriesRef, from, to)
other-series.test.ts:132  .toBe(46) → .toBe(48), AND the keys are NAMED (Porter's condition):
                          for swapTeacherTitle · swapRate · swapRateHint: non-empty in en AND th
                          "swapPrimaryTitle" in en / in th → false   (the one that stopped being true is asserted GONE)
```
Each carries a `🔻 TASK-624 (granted by Porter, 10-06)` note in the file's style; the comments that said "`from` is the primary" were amended, not left false. No other line in any of the three files changed.

**Q2 — the label:** `otherSeries.swapTo` is now TH **"ครูคนใหม่"** / EN **"New teacher"**, with a comment naming Porter's approval and the old text, **no DRAFT marker**. Read on the REAL dialog for an extra (the label shows "New teacher" and never "primary"), and pinned by value in both languages. A new mutation (S11) restores the stale text and bites.

**Q3:** untouched, as ruled. The scope chooser and the group door are exactly as they were.

**Re-run:**
- `bunx tsc --noEmit` exit 0 · `bun run build` exit 0.
- **Full `bun test`: 1041 pass / 0 fail across 116 files** (it was 1017/4; the 4 were exactly these pins).
- OtherSeries/*: **28 pass / 0 fail**. Mutation set `swap-any-teacher-task624`, now **11/11 BITES** (S1–S10 as above + S11), checksum identical; command unchanged.
- `git status`: in addition to the `OtherSeries/*`, `series-scope.ts` and dictionary files above, exactly the three pin files you granted. Nothing committed.

**Held for the release:** `swapRate` / `swapRateHint` carry `📋 DRAFT wording` (Porter has not confirmed §B is covered). When he does, I drop the two markers and send the diff, as with TASK-662/664.

## Review (Team B)
**Silver, 2026-10-06 — ✅ ENGINEERING ACCEPTED. Held ONLY on the two §B strings (`swapRate` / `swapRateHint`, DRAFT) until Porter confirms they are covered.**
- **Part 1, swap ANY teacher:**
  - the same Swap door now sits beside every extra, carrying that teacher's id;
  - the dialog uses `from = teacherId ?? series.teacherId` everywhere (the body, the title, the outcome).
  - ⭐ **Deliberately NOT on a GROUP** (`!isGroup`): its route has no `from` and would swap the wrong person. That is right, and it keeps the live group defect (Q3) exactly as it was, untouched until the owner rules.
- **Part 2, 1b:**
  - the optional rest-of-series rate rides only when `mode === "swap" && scope === "rest" && canRate`, through the same `withoutRates` filter;
  - the cover's required box is unchanged;
  - the stale `series-scope.ts` comment is corrected, with the reason.
- **Q1:** the four granted lines keep their claims. The key-count line **names** the three new keys in both languages and asserts `swapPrimaryTitle` is gone (Porter's condition). The extra assertion keeping the `from` rule pinned is a good touch.
- **Q2:** "ครูคนใหม่ / New teacher" ships without a DRAFT marker, with Porter's approval named. Mutation S11 bites on the stale text.
- **Re-run by me:** OtherSeries/* + the three pin files → **64 / 0**. 🔑 **Full front suite → 1041 / 0.** The front suite is fully green again.
- **When Porter confirms §B:** drop the two DRAFT markers, re-run, and send me that diff. Then 624 is FINAL.
- ✅ **FINAL (Porter, 2026-10-06): §B is covered** (the approved group pair re-aimed at the same act). @Fanta: drop the two `📋 DRAFT wording` markers on `swapRate` / `swapRateHint` only, with no string change, re-run, and nudge me with the diff.

### Final step done (Fanta, 2026-10-07)
- **The 4 DRAFT comments in `dictionaries.ts` (EN + TH × TASK-624 §B and TASK-669 §C): only the marker lines changed.** The `📋 DRAFT` sentence became the approval note, as on TASK-662/664, so the provenance stays. **Zero string lines changed** (`git diff -U0` filtered to non-comment lines = 0):
```
- // 🔴 TASK-624 (1b) — 📋 DRAFT wording (Silver, COPY-DRAFT-…§B; not yet confirmed as covered).
+ // 🔴 TASK-624 (1b) — ✅ covered by the owner's approval (Silver, 2026-10-06; COPY-DRAFT-…§B).
- // 🔴 TASK-669 — 📋 DRAFT wording (Silver, COPY-DRAFT-…§C; not yet approved). Reused, not new:
+ // 🔴 TASK-669 — ✅ owner-APPROVED 2026-10-06, all 10 as drafted (COPY-DRAFT-…§C). Reused, not new:
- // 🔴 TASK-624 (1b) — 📋 DRAFT wording (see the EN block).        (TH block)
+ // 🔴 TASK-624 (1b) — ✅ covered by the owner's approval (see the EN block).
- // 🔴 TASK-669 — 📋 DRAFT wording (see the EN block).             (TH block)
+ // 🔴 TASK-669 — ✅ owner-APPROVED 2026-10-06 (see the EN block).
```
- The 4 `📋 DRAFT` markers still in the file are TASK-566's, not mine.
- **Re-run:** `bunx tsc --noEmit` exit 0 · **full `bun test` 1075 pass / 0 fail across 120 files**. Nothing committed.

**Silver, 2026-10-07 — ✅ FINAL. The DRAFT comments are off.** Re-checked by me: no `📋 DRAFT` marker left for 624/669 (only TASK-566's, not ours, untouched). The approved strings are verbatim (§B 4/4, §C 20/20 screen strings). People + OtherSeries → **47 / 0**. Fanta's full suite 1075/0, tsc 0.
