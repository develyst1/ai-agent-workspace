# TASK-293 — two LABELS that outlived their values: *"Resume this course?"* on a done act, and `Ends` on a non-date

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-08)
**Source:** the owner's own four screenshots on `sid` — 🎉 **the summary dialog EXISTS and reads true.**
📌 **Small, and neither is a data defect.** 🚫 No backend change.

---

## §1 🔴 The dialog asks a question it has already answered — @Porter's defect, and his copy
**Title: *"Resume this course?"*** — a question, with a `?`.
**Body: *"4 session(s) put back on the schedule."*** — **past tense, already done.**
**Only button: `Close`.**
⇒ **An admin reading top-to-bottom meets a confirmation prompt and discovers on line 2 that the act is
finished.** 🔴 **The one dialog whose whole job is to say *"here is what I DID"* opens by sounding like
*"may I?"***

✅ **His replacement, verbatim — do not reword it:**
> **Title: *"Course resumed"***

📌 **And the evidence is in his own screenshot: the plan behind the dialog is ALREADY updated.** ⇒ **the title is
the only thing on that screen still claiming the act has not happened.**
⚠️ **The pause face keeps its question** — *"Pause this course?"* is asked **before** the act and is correct.
**One title changes, not both.** **Assert that.**

## §2 🟡 `Ends no live sessions` — the value is right and the LABEL is wrong
While paused, `deriveLiveEndDate` returns `null` — **correctly: there is no end date, because there is no live
plan.** The header then renders that non-answer in the slot that says **`Ends 12 Oct 26`** every other time.
⇒ **a category error, not a missing value: the answer does not fit the question the label asks.**
✅ **While the course is paused, the header should say what IS true** — *the course is paused; it has no dates
until it is resumed* — **rather than answering `Ends` with a sentence.**
🚫 **Do not invent a date, and do not fall back to the expiry.** **`deriveLiveEndDate` returning `null` is
correct and must not change** — the expiry is a ceiling, not an end, and TASK-282 §7 was built on that.
⚠️ **Wording is yours** *(the pause face already says "paused" elsewhere; reuse that vocabulary rather than
inventing a third phrasing)*.

## §3 🔑 Why these two are ONE task
**Both are a LABEL that outlived its VALUE** — a title that still asks after the act, and a field name that still
promises a date after there are none.
📌 **Same family as the three stale comments in TASK-291 and the pause copy @Porter corrected: a string written
for a state the code no longer produces.** **The difference is that a user reads these**, which is why they are
worth a task at all and why neither is worth more than one.

## §4 What must not change
- 🚫 The body sentences — **the owner has now read them and they are true** (*"the expiry is unchanged"* fired
  correctly, which nobody had seen before).
- 🚫 `deriveLiveEndDate`, the counts, `visiblePlanRows`, the server-sourced pause count (TASK-291).
- 🚫 The pause face's title and its copy. 🚫 No backend change.

## Definition of Done
- [ ] Typecheck clean; **state the command**
- [ ] The resume summary's title is **"Course resumed"**, verbatim
- [ ] 🔑 **The PAUSE face still asks its question** — asserted, because that one is asked before the act
- [ ] The paused header no longer answers `Ends` with a non-date — asserted, **and `deriveLiveEndDate` is
      untouched**
- [ ] 🚫 The body sentences byte-identical · no backend change

## Question
**Is there a third label in these dialogs whose value can be absent or already-true?** You have now swept this
component for computed numbers (TASK-291) and I am asking for the same sweep on **words**. 📌 *A label is a
promise about its value; both defects here are the promise outliving it.* **Name any others; change only these
two.**
