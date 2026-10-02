# TASK-595 — the stale same-day warning on a future-date leave — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-10-01) · **Size XS.** Tanya, via @Porter — for this batch.

## §0 ⚠️ First
**Re-read the front repo and say so.** 🚫 **Palm's items 4, 9, 11.**

## §1 The defect
**In the teacher's leave dialog on a FUTURE date, a same-day warning still shows.** 🔑 **It was written for today's leave, where classes are about to run and get cancelled.** ⇒ **On a future date nothing is cancelled, so the warning describes an act that is not happening.**
📌 **TASK-588 removed the chooser and worded the result; this sentence sits outside both.**
- ⚠️ **Derive what ELSE on that dialog was written for the today path** — 🔑 **one dialog, two acts, is exactly where the wrong words get shown, and you said so yourself in TASK-588.** **Say what you found, even if the answer is "only this one".**
- ✅ **Pin it BOTH ways: absent on a future date, present on today.** 🔑 *Half a rule is not a rule* — and today's path must not lose a warning it needs.

## §2 The proof
🔑 **Clicked, both dates: future ⇒ the sentence is ABSENT · today ⇒ unchanged.**

## Definition of Done
- [ ] Absent on a future date, **present on today, both pinned** · **everything else written for the today path derived and named** · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch, CHECKSUM · report + `inbox/SA.md` + log · ⚠️ **it is in this batch — tell me the moment it is green.**

---

# 📋 REPORT — @Fern → @Sober (2026-10-01)

**Repo:** `smart-scheduler-front` (working tree). **§0: I re-read the front repo before starting** — `ReportLeaveDialog.tsx` in full, the `teacherLeave` block in both languages, and the TASK-588 pins. 🚫 **Palm's items 4, 9, 11 untouched.**

**🟢 GREEN. Suite 918 pass / 0 fail across 95 files · `tsc --noEmit` 0 · `bun run build` ok · Break-and-watch 6/6 BITES, CHECKSUM identical.**

## §1 The fix
**The sentence is now guarded: `{!advance && …}`.** It promises *the ticked sessions' families will be told and their make-ups are added by the system* — on an advance date 🚫 **nothing is cancelled, nobody is told and no make-up is owed**, so it described an act that was not happening **directly under the blue hint that says classes already booked are not cancelled.** ⇒ **the dialog contradicted itself in two adjacent lines.**
🔑 **Why it survived TASK-588:** that task removed the chooser and reworded the button, i.e. it changed the two things that *mention* the ticks. **This line mentions the ticks too, and it sits outside both** — below the reason box, in the shared tail of the form. 📌 *One dialog, two acts, is exactly where the wrong words get shown*, and my own sweep stopped at the widgets.
🚫 **The sentence itself is unchanged.** On today's path it is exactly right; only *where* it shows moved.

## §1b ⚠️ The derivation — and it found a second one
**Everything the dialog renders on BOTH dates:** the title, the date label, the reason label and its hint, the Cancel button — **and the warning.** The first four say nothing that belongs to either act, and that is now an **assertion rather than my reading**: a pin joins those strings in both languages and refuses *cancel / make-up / told / blocked* and their Thai equivalents. ⇒ **the warning was the only shared string that named an act.**
**Already branched (TASK-588, verified still branched):** the chooser vs the advance hint · the submit label · the result screen vs the `done` toast.

🔴 **The second find, in Thai only.** The chooser branch serves **today AND any past date**, and its `noSessions` read **"ไม่มีคาบของคุณในวันนี้" ("today")** while its own English says **"on this day"**. ⇒ on a past date the Thai named the wrong day, and 🔑 **the two languages were not making the same statement.** Fixed to **"ในวันนั้น"**, pinned in both languages, and filed as `§T-595` for Khwan.
⚠️ **I will not claim more than I looked at:** this was the leave dialog only. The same class — *a string written for one branch, rendered on another* — is a repo-wide question, and **I can sweep every dialog that has two acts if you want it as its own task.** 🚫 I did not start it here.

## §2 Pinned BOTH ways, clicked
- **Future:** the element is **absent** (a count, not the node — see §3), **and the words are gone from the whole dialog** (`families of the ticked`, `make-up`), while the hint's own *not cancelled* is still there. 🔑 *Reading only the marker would pass if the sentence moved somewhere else on the screen.*
- **Today:** the element is **present** and still says families are told and make-ups are added. 🔑 *Half a rule is not a rule* — and W3 below is the mutation that proves this half is load-bearing.
- **Declared pin update** in `teacher-scope.test.ts`: the old pin asserted the string is in the dialog, which is still true. **The condition is what is new, so the guard is the pin now** — and the old assertion stays beside it.

## §3 ⚠️ NO RESULT, and the reason was my own assertion
**W1 and W2 first came back `NO RESULT [KILLED (time limit)]`, having printed ~307 MB each.** 🔑 **The cause is not the code and not the runner: `expect(node).toBeNull()` makes the runner print the RECEIVED value on failure, and a happy-dom element serializes its ENTIRE document graph** — parents, listeners, prototype chain. A passing run prints nothing, so the trap is invisible until the day the assertion actually fails. ⇒ ***an assertion whose failure message cannot be read is an assertion that cannot report***, and in the runner it is not a red — **it is a NO RESULT.**
✅ **Fixed at the source:** every "it is not there" assertion in this file now reads a **count** (`querySelectorAll(...).length === 0`), which prints `1` vs `0`. I converted the three pre-existing ones in the file too, since they carry the same trap and are one line each. Re-run: **6/6 BITES.**
⚠️ **This is a class, not my line.** `expect(document.querySelector(…)).toBeNull()` appears in other DOM tests across the repo; every one of them is a future NO RESULT rather than a red. **Cheap to sweep** (it is a mechanical change) — say the word and it is a task.

## §4 Break-and-watch — 6 mutations, 6 BITES, CHECKSUM identical

| # | mutation | verdict |
|---|---|---|
| W1 | 🔴 the stale warning comes back on a FUTURE date | **BITES** 49/2 |
| W2 | 🔴 the guard INVERTS — advance gets it, today loses it | **BITES** 48/3 |
| W3 | ⚠️ the sentence is silenced EVERYWHERE (the half-a-rule fix) | **BITES** 49/2 |
| W4 | the marker is renamed — is the selector load-bearing? | **BITES** 49/2 |
| W5 | 🔴 the Thai `noSessions` says "today" again | **BITES** 50/1 |
| W6 | ⚠️ the advance hint stops saying nothing is cancelled | **BITES** 49/2 |

📌 **W3 and W4 are the two I would not have written a month ago:** W3 is the fix I could have shipped (silence it everywhere) and W4 asks whether the pin would notice an element that simply stopped existing.

## Files
- **Fixed:** `src/components/partials/Calendar/Modal/ReportLeaveDialog.tsx` (the guard) · `src/lib/i18n/dictionaries.ts` (Thai `noSessions`).
- **Tests:** `report-leave-advance.dom.test.tsx` (both ways, plus the count conversion) · `dialog-labels.test.ts` (the copy pins and the derivation as an assertion) · `teacher-scope.test.ts` (the declared pin update).
- **Mutations:** `scripts/mutation/task-595.json` (W1–W6).

---

# ✅ DONE — REVIEWED by @Sober (2026-10-01) · 🟢 **the batch is green again**
Verified by me: **918 pass / 0 fail** across 95 files · tsc 0 · build ok.

## ✅ Pinned both ways, and the absence pinned properly
**Future: the element is absent AND the words are gone from the WHOLE dialog** — 🔑 **"reading only the marker would pass if the sentence moved elsewhere on the screen."** ✅ **Today: present, sentence intact, and W3 — the mutation that silences it everywhere — bites.**
📌 **That is what *half a rule is not a rule* looks like as a row rather than as a motto.**

## 🔴 The NO RESULT is the most useful thing here, and she is right that it is a CLASS
**W1 and W2 came back `KILLED (time limit)` after printing ~307 MB each — and the cause was HER OWN ASSERTION, not the code and not the runner.**
**`expect(node).toBeNull()` makes the runner print the RECEIVED value, and a happy-dom element serializes its entire document graph** — parents, listeners, prototypes.
🔑 ***"An assertion whose failure message cannot be read is an assertion that cannot report"*** — **and in the runner it is not a red, it is a NO RESULT.**
🔑 **And the part that makes it urgent: a PASSING run prints nothing, so the trap is invisible until the day the assertion FAILS.** ⇒ **The defect appears exactly when you most need the test to speak.** ✅ **Every "not there" check in that file now reads a COUNT (`1` vs `0`); re-run 6/6.**
📌 **Sixth no-result of this stretch, and the first whose cause was an ASSERTION rather than the tool.**

## ⚖️ Her two offers
1. ⭐ **The `toBeNull()` class: TAKEN NOW — TASK-596.** 🔑 **Mechanical, and it converts a whole class of future NO RESULTs into reds.** **We have had six no-results; doing this before we need it is the whole point.** ⚠️ **And it carries its own check, or it comes back.**
2. ⏸️ **The "a string written for one branch, rendered on another" sweep: NOT now, and not as a sweep.** 🔑 **Unlike (1) it needs JUDGEMENT per dialog, so it is an AUDIT whose output is a list — and this batch is waiting to ship.** ✅ **Queued as TASK-597 with the honest shape: first DERIVE the set of two-act dialogs, then review each.** 📌 **It is a real question and I am not letting it evaporate — it is on the board, not in a report.**
