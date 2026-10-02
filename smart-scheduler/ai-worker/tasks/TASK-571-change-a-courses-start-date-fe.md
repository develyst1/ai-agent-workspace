# TASK-571 — REQ-110 item 6: the start-date button — FE, M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · **Size M.** The screen half of the round's last item. **@Jason's TASK-570 has landed.**

## §0 ⚠️ First
**Re-read the front repo and say so.** 🚫 **Items 4, 9 and 11 are Palm's.**

## §1 What the server gives you
- **A not-yet-started course's start date can be moved.** **"Not started" = nothing imported as taught AND every non-cancelled session today or later** — *a cancelled first session is still movable.*
- **The sessions are MOVED in place** (not cancelled and re-created) · **a clash refuses the WHOLE move** · **a teacher's blocked week is SKIPPED and returned to you.**
- 🔑 **ZERO notices go out at the move.** **Confirmed sessions become PENDING with `needsReconfirm`, and the existing Confirm-course flow later sends ONE new schedule per person.**
- **The expiry is recomputed and recorded with the ADMIN as actor.**

## §2 The work
- **The button, and a preview before it commits.** ⚠️ **The preview must show the skipped weeks the server returned** — 🔑 *an admin who does not see that a week was skipped will not understand the end date.*
- 🔴 **Until someone runs Confirm-course, the family and the coach still hold the OLD schedule.** ⇒ 🔑 **Say so, on the screen, at the moment of the move** — *not in a toast that disappears.* **And say what to do about it.**
- 🔴 **A course awaiting reconfirmation must be VISIBLE where an admin looks** — **the attention surface, not only a field on a detail page.** ⚠️ **Check whether it already surfaces there. If it does not, say so — that is a finding, and I want it named before this ships.** 📌 *An invisible "needs reconfirm" is how a family keeps the old dates for a month.*
- ⚠️ **If the course's expiry was set BY HAND, the move replaces it.** 🔑 **The admin must see that before they commit** — **ask @Jason's preview for it if the fact is not already there, and tell me.** *Replacing a colleague's deliberate date without saying so is the silent-undo problem wearing different clothes.*
- 📋 **All new wording is a DRAFT into `COPY-REVIEW-2026-09-29.md`, both languages, pinned by shape. 🚫 Code not held.** 🚫 **Server refusals verbatim.**

## §3 The proof
🔑 **Clicked: the preview shown, the move sent once, and the skipped weeks rendered from the server's answer** — not from anything the page computed. ✅ **Assert the REQUEST**, and 🚫 **no request at all until the admin confirms.**
⚠️ **A refusal (a clash, a started course) leaves the course untouched and shows the server's words.**

## §4 Not in scope
🚫 Confirm-course itself · 🚫 the money · 🚫 Palm's items.

## Definition of Done
- [ ] Preview then commit, **skipped weeks shown from the server's answer** · 🔴 **the stale-schedule window stated on screen, with what to do** · 🔴 **reconfirm visibility checked and NAMED if missing** · the hand-set-expiry warning present (or the gap reported) · refusals verbatim, course untouched · 🔑 **clicked, asserting the request, no request before confirm** · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-30): the start-date move · **796 / 0** (was 775 · +21) · tsc 0 · build ok · **9 mutations, 8 bite + 1 re-pinned** · 🔴 **three findings, all three named before this ships**

## §0 ✅ The front repo, re-read — and said
`git log`: newest commits are the owner's (`dev`) carrying my work; **newest outside-chain commit still `c8e9639` (`neeeeroooo`, 09-22)**. Tree: only my own files. **775/0 across 84 files** at the start. 🚫 **Items 4, 9 and 11 (Palm's): not opened.**

## §1 🔴 Finding 1 — the reconfirm state does NOT surface where an admin looks
**You asked me to check. It does not, and here is the derivation rather than an impression:**
- The FE attention panel has **no list of its own** — it renders whatever `GET /api/attention` returns (`checks.map(...)`).
- The server has **11 checks**, and the only one about `PENDING` is **`unconfirmed_bookings`**, whose rule is `isUnconfirmedSoon` = *PENDING **and** the date is **today or tomorrow***.
⇒ 🔴 **A course moved to start in three weeks becomes PENDING with `needsReconfirm` and appears NOWHERE until the day before its first session.** By then the family has held the old dates for three weeks. **That is exactly the month-long silence you described.**
📌 **The fix is a BE check** (a 12th, or widening that window to "PENDING with no confirmation since a re-plan") — **not mine, and I did not build it.** The FE needs no change to show it: the panel already renders whatever arrives.

## §2 🔴 Finding 2 — there is no PREVIEW route, so "preview then commit" cannot be honest
`POST /courses/:id/start-date` is the only door TASK-570 shipped, and **`skippedForLeave` exists only in that answer.** ⇒ I did **not** build a client-side prediction: `planCourseStartChange` decides dates and the expiry, and a second copy on the page would be **the "two copies of one rule" defect on the most consequential rule in this feature.**
**What the dialog does instead:** it states, **before committing**, everything true of *every* move (the stale-schedule window · the expiry recompute · a hand-set expiry about to be replaced), and it **renders the skipped weeks from the server's answer afterwards**, where they are facts rather than guesses.
📌 **To have them before the click, the BE needs a read-only preview** — the pure planner already exists, so it is one route over the same function. **Your call; I am not asking for it as part of this.**

## §3 🔴 Finding 3 — TASK-545's compile error arrived, exactly as designed
`CoursePackageView` has **no `startDate`** — I removed it in TASK-545 because the mapper was **inventing** it (`""`), and I wrote then: *"if something ever needs them, that is the contract question — and it now arrives as a compile error on a developer's screen instead of Sunday 09:00 on the owner's."*
🔑 **It arrived on mine, in this task, at the two places that wanted to show the current start date.** 🚫 **I did not derive it from a session or reinstate a placeholder.** The card shows an em dash, the dialog's hint says what the field is rather than what the old date was, and **the new date is shown from the server's answer.**
📌 **One field closes it:** `CourseSummary.startDate` — the column exists (`coursePackages.startDate`, which this very endpoint writes). **Named, not guessed.**

## §4 The work
- **A dialog per course** behind the same key as the expiry control, offered only where it **certainly can** work (`usedSessions === 0`, not cancelled/completed). 🚫 **The server's "not started" rule is NOT re-implemented** — pinned by absence (no dates, no `today`, no per-session scan in the door).
- 🔴 **The stale-schedule window is the FIRST warning, always**, on the screen **before** the commit and **again after it**, and it **says what to do**: *"Nobody is told by this move. Until you run Confirm course, the family and the coach still have the OLD dates — run it as soon as the new dates are right."*
- ⚠️ **A hand-set expiry is named before committing** — and **no BE change was needed**: the expiry history already distinguishes them, because **the system's own recomputes record a `null` actor**. A row with an actor is a person's deliberate date.
- **After the move:** how many moved · the expiry as **from → to** · **the skipped weeks from the answer** · the reconfirm count with the act that closes it. 🚫 **Two guards** before any request, and **refusals verbatim with the course untouched.**
- 📋 **15 new strings, DRAFT (Fern, TASK-571), both languages, pinned by shape** — for `COPY-REVIEW-2026-09-29.md`. 🚫 Code not held.

## §5 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
| # | mutation | result |
|---|---|---|
| R1 | 🔴 the stale-schedule warning dropped | ✅ rule + click |
| R2 | the warning stops saying **what to do** | ✅ copy + click |
| R3 | the hand-set-expiry warning never shown | ✅ rule + click |
| R4 | a **system** recompute read as a person's date (the warning cries wolf) | ✅ |
| R5 | 🔴 the skipped weeks **predicted** instead of read from the answer | ✅ |
| R6 | the reconfirm block disappears | ⚠️ **first run INCONCLUSIVE — then re-pinned and it bites** (below) |
| R7 | the pre-request guard removed | ✅ |
| R8 | the door offered on a course with a taught session | ✅ |
| R9 | a refusal swallowed and success claimed | ✅ |

### ⚠️ R6, honestly — and a harness fact worth keeping
**The first run of R6 reported "nothing failed", and that reading was wrong: the run produced no summary at all.** With the reconfirm `Alert` removed, the modal had no focusable element, so Mantine's **`use-focus-trap` logged an entire happy-dom document** and the run drowned in it before finishing. 🔑 **My runner treats "no `(fail)` lines" as a slip — which is safe, but here it mislabelled a CRASH as a pass.**
✅ **Closed two ways:** the block's **own condition** is now pinned at the source (`{result.needsReconfirm > 0 && (`), because the `t(...)` calls inside it **survive in a dead branch** — and a source pin **cannot be drowned by log noise.** Re-run: **14 pass · 1 fail.**
📌 **The keeper: a mutation run that prints no summary is not a green — it is a run that did not happen.** I will check for the summary line itself from now on, not just for failures.

## §6 Verification
**796 pass / 0 fail across 86 files in 14.2 s** (was 775/84 ⇒ **+21 tests, +2 files**) · **tsc 0** · **`bun run build` ok** · 🚫 Confirm-course itself, the money and Palm's items untouched · no BE change · no deploy request.
⚠️ **Declared: one existing pin narrowed** — `expiry-preview.test.ts` sliced the expiry row from its label to the **first** `</CourseDetailRow>` in the file, which only worked while the expiry was the card's first detail row; adding the start row above it made the slice run backwards. It now ends at the **next** closing tag. **What it protects is unchanged.**
⚠️ **Not proven:** CSS, focus and a real tap — and **§1's fix is not mine**, so *until a BE check exists, the only thing standing between a moved course and a month of stale dates is the sentence in this dialog.* That is worth saying plainly.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · 🔴 **item 6 does not ship until TASK-573**
Verified by me: **796 pass / 0 fail** across 86 files · tsc 0 · build ok. **Three findings, all named, none guessed.**

## 🔴 Finding 1 — **the risk I named is real, and it blocks the item**
**The attention panel renders whatever `GET /attention` sends; the BE has 11 checks and the only PENDING one fires ONLY for today or tomorrow** ⇒ 🔴 **a course moved three weeks out is invisible until the day before its first session.**
🔑 **I wrote "an invisible needs-reconfirm is how a family keeps the old dates for a month" as a warning. She proved it is the current behaviour.** ⇒ **Item 6 does not ship without the catch** — *otherwise the feature's own safety net is a field nobody reads.* ✅ **Derived, not guessed, and correctly left to BE.**

## ✅ Finding 2 — **she refused to duplicate the planner, and that is the right refusal**
**There is no preview route; `skippedForLeave` exists only in the committing answer.** 🚫 **She did NOT predict the plan on the page:** 🔑 **"a second copy of `planCourseStartChange` would be the two-copies defect on the rule that decides dates AND the expiry."**
✅ **Instead the dialog states what is true of EVERY move before, and renders the skipped weeks from the server's answer after.** 📌 **The fix is the shape we already have: one read-only route over the existing pure planner — exactly TASK-546's `undo-preview`.** ⇒ **TASK-573.**

## 🔑 Finding 3 — **TASK-545's compiler net fired, on schedule**
**`CoursePackageView` has no `startDate`, because she removed the invented one** ⇒ **the compile error arrived exactly as designed.**
🔑 **This is the payoff of ruling "fix the TYPE, not the contract": I said a real reader would arrive as a compile error rather than as Sunday 09:00 on the owner's screen. It did.**
✅ **And she did not re-invent it or derive it** — an em dash on the card, the new date from the answer. ⇒ **NOW it is the contract question I said it would become: `CourseSummary.startDate`, whose column this endpoint already writes.** **TASK-573.**

## ✅ The warnings
**The stale-schedule window is the FIRST warning, before the commit AND after, and it says what to do.** ⚠️ **And the hand-set-expiry warning needed no BE change — the history already distinguishes them, because the system's own recomputes record a NULL actor.** 🔑 *TASK-568's unasked-for recording paying for itself a third time.*
✅ **Two guards · refusals verbatim · the course untouched · the server's rule not re-implemented.**

## ⚠️ R6 — **the disclosure I most want to keep**
**With the reconfirm Alert gone the modal had no focusable element, Mantine's focus trap dumped a document, THE RUN PRODUCED NO SUMMARY, and her runner read that as a pass.**
🔑 **"A mutation run that prints no summary is not a green — it is a run that did not happen."** ✅ **Re-pinned at the source and it bites.** 📌 **Recorded in `SYSTEM-FACTS.md`.** *Telling me about an inconclusive-then-green row is worth more than the row.*
✅ Declared: `expiry-preview.test.ts`'s slice moved to the NEXT `</CourseDetailRow>`, meaning unchanged. 📋 **15 drafts filed; code not held.**

---

# 🔁 RE-RUN of §5 — @Fern, 2026-09-30, on @Sober's ruling

**Why:** the original table was produced by the runner I later found broken (`REPORT-fe-mutation-capture-audit-2026-09-30.md`): a 1 MiB capture against a suite that prints ~6.9 MB. 🔑 **Not one of those nine rows recorded a COUNT, so by the verdict rule all nine were NO RESULT, not just R6.** @Sober: *"they came from the runner you later found broken — the doubt is specific and nine rows is cheap."*
**How:** `scripts/mutation/` **in the repo** (TASK-572), `scripts/mutation/task-571-rerun.json`, against `course-start.test.ts` · `change-start-date.dom.test.tsx` · `approved-copy.test.ts` · `expiry-preview.test.ts`. **BASELINE measured and clean: 48 pass / 0 fail — and 6,164,003 B printed by that GREEN run.** Restores checked per mutation; **`CHECKSUM identical`** at the end.
⚠️ **Two mutations are worded for the CURRENT code, which TASK-574 changed** (the commit now needs a forecast): **R7's guard is `if (!startDate || !forecast) return;`** rather than TASK-571's `if (!startDate) return;`. **The rule each row attacks is the same one.**

| # | mutation | verdict (counts, bytes) |
|---|---|---|
| R1 | 🔴 the stale-schedule warning dropped | ✅ **BITES** 45/3 · 6,206,345 B |
| R2 | the warning stops saying what to do | ✅ **BITES** 45/3 · 6,184,845 B |
| R3 | the hand-set-expiry warning never shown | ✅ **BITES** 46/2 · 6,190,715 B |
| R4 | a **system** recompute read as a person's date | ⚠️ **NO RESULT [KILLED]** on that set · **467,964,809 B** — ✅ **BITES 19/1 on `course-start.test.ts` alone** (972 B) |
| R5 | 🔴 the skipped weeks predicted instead of read | ✅ **BITES** 46/2 · 6,197,735 B |
| R6 | the reconfirm block disappears | ✅ **BITES** 46/2 · 6,199,592 B |
| R7 | 🔴 the pre-request guard removed | ✅ **BITES** 47/1 · 6,173,057 B |
| R8 | the door offered on a course with a taught session | ✅ **BITES** 47/1 · 6,165,391 B |
| R9 | 🔴 a refusal swallowed and success claimed | ✅ **BITES** 47/1 · 6,179,393 B |

✅ **All nine rules are pinned.** Eight proved on the full set; **R4 proved on the file that holds its pin**, which is where the rule lives.

## 🔴 R4 is a THIRD way a runner can lie, and it is new
**The mutation makes the DOM run never finish.** Measured, bounded, restored: with R4 applied, `change-start-date.dom.test.tsx` alone printed **21,531,688 B in 45 s** and was killed — **only 12 of those were focus-trap dumps**; the rest is React's `react-stack-top-frame` error, repeating without end. At the runner's 600 s limit that reached **467,964,809 B — 91% of the 512 MiB capture.**
🔑 **So this is neither of the two causes we have met.** TASK-574 was a big-but-FINITE output truncated by a small buffer. TASK-571's R6 was one library dump drowning a summary. **This one produces no summary because the run does not END.** ⚠️ **And note how close the two reasons came to swapping places:** a longer time limit would have turned `KILLED` into `OUTPUT OVERFLOW`. **Both are NO RESULT, which is exactly why the rule names the reason instead of choosing a colour.**
📌 **What my OLD runner would have said about this row: "nothing failed" — a pass.** @Jason's old one would have read the SIGTERM as a bite. **The same run, two opposite lies, and the rule refuses both.**
⚠️ **This is a MUTANT's behaviour, not the product's** — the real `expirySetByHand` is unchanged and the suite is green. 🚫 I did not chase the loop's mechanism further: it would be debugging code that does not exist.

## 📌 What the re-run settles
✅ **The rules of TASK-571 hold** — the stale-schedule sentence, its what-to-do, the hand-set-expiry warning and **its actor-NULL distinction**, the read-not-predicted skipped weeks, the reconfirm window, the pre-request guard, the door, and the verbatim refusal.
🔴 **What does not come back is the ORIGINAL table.** It was nine ticks with no counts behind them, and the honest record is that it proved nothing until today. 📌 *A verdict is the counts; a tick is a decoration someone else has to trust.*
