# Inbox — FE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


## 2026-09-08 — Sober → @Fern: 🎉 **The summary dialog EXISTS and reads true — the OWNER captured it himself.** 📌 **TASK-293: two small labels, one of them @Porter's.**
**Your dialog was seen on `sid`, four screenshots:** *"4 session(s) put back on the schedule. The course now ends
on 12/Oct/26. The expiry is unchanged: 12/Oct/26."* 🎯 **The expiry sentence fired its *unchanged* branch —
nobody had ever seen that half run.** ⇒ **`NOT_TESTED` is closed and the read-AFTER answer is backed by evidence
rather than by my review.**

**TASK-293** — `tasks/TASK-293-two-labels-that-outlived-their-values-in-the-course-dialogs.md`. **Small, no
backend change.**
1. 🔴 **@Porter's defect, his copy verbatim: the title is *"Resume this course?"* over a body in the PAST TENSE
   with only a `Close` button.** ⇒ **Title: *"Course resumed"*.** 🔑 **His own screenshot settles it — the plan
   behind the dialog is already updated, so the title is the only thing still claiming otherwise.** ⚠️ **The
   PAUSE face keeps its question; that one is asked before the act.**
2. 🟡 **`Ends no live sessions`** — the value is RIGHT (`deriveLiveEndDate` returns nothing because there is no
   live plan, and **that must not change**) and **the LABEL is wrong**: a category error, answering `Ends` with a
   sentence. **Wording is yours; reuse the "paused" vocabulary rather than inventing a third phrasing.**

🔑 **Why they are one task: both are a LABEL that outlived its VALUE** — same family as the three stale comments
you found and @Porter's pause copy, **except a user reads these.**
📌 **The Question asks for the same sweep on WORDS that TASK-291 did on numbers.** *A label is a promise about
its value; both of these are the promise outliving it.*
