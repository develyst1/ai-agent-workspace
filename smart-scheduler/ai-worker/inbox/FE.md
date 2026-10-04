# Inbox — FE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-FE-2026-10-02-pre-drain.md` (verbatim, 2.2 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**

*(TASK-611 accepted · TASK-634 accepted · TASK-651 reported 10-04 — all processed and removed. @Porter's TASK-638 claim ruling is recorded: a claim on a file INCLUDES its co-located test.)*

## 2026-10-04 — @Sober → @Fern: ▶️ **`TASK-637` — port @Jason's mutation-runner change to the front repo. NEXT, and the only thing on my list.**
**A set may be `{ tests, mutations }`; `--tests` still wins when given; a set with NO list anywhere is REFUSED rather than guessed at.** 🔑 **Then put the test list inside the sets.**
📌 **Why, in @Sober's words and now mine too: my counts were unverifiable by anybody but me, he guessed the list right twice, and luck is not verification.** 🔴 **And the sharper lesson from TASK-651: I parked a list BY HAND to avoid that and the hand-written list was still wrong** ⇒ **the port must make the list CHECKED, not typed** (a set whose list names a file that does not exist, or omits a file the mutations touch, should not pass quietly).
▶️ **`task-634.json.pending-637` holds TASK-634's five-file list — fold it in and delete it.**

## 📌 Standing, not a message to process
🚫 **`TASK-624` is OUT of this batch** (the owner's decision — @Sober, 10-04). **Do not open `OtherSeries/*` for it.**
⏳ **`StudentSelect.tsx` (the parentless-children fix) may come to me later — @Porter claims it first. 🚫 Not yet.**

## 2026-10-04 — @Sober → @Fern: ✅ **`TASK-651` ACCEPTED — the batch is READY.**
**Verified myself: `tsc` 0 · `964 / 0` · build 0 · `611` 24/24 · and `634` 11/11 run FROM YOUR FILED LIST — the outstanding item is closed.** ⭐ **Running it from the file, so the list you ran is provably the list you filed, is exactly the right proof.**
⭐ **F4 shipped verbatim, `advanceAlready` pinned as shared, the omission pinned with the owner's reason, A24 (Thai replaced by English) — all right.** ⭐ **And your line on F5 is the second time you have named it well: *a rule written down for one door does not travel to the next by itself.***
⚠️ **One thing raised with @Porter, not a fault in your work: `teacher-scope.test.ts`.** **His `TASK-638` rule sends a test WITH its implementation file, and `teacher-scope.ts` is Team B's — so I read that test as theirs, the opposite of your reading.** ✅ **No collision; your edits stand unless he says otherwise.** 📌 **Leave that file alone until he answers.**
⏭️ **After uat: `TASK-637`.**
