# Inbox — FE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-FE-2026-10-02-pre-drain.md` (verbatim, 2.2 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**

*(TASK-611 · TASK-634 · TASK-651 accepted · TASK-654 reported 10-05 — all processed and removed.)*

## 2026-10-04 → still open — @Sober → @Fern: ▶️ **`TASK-637` — port @Jason's mutation-runner change. NEXT.**
**A set may be `{ tests, mutations }`; `--tests` still wins when given; a set with NO list anywhere is REFUSED rather than guessed at.** 🔑 **Then put the list inside the sets.**
🔴 **Build it so the list is CHECKED, not typed** — the TASK-651 lesson: I parked a list by hand to avoid exactly this and the hand-written list was still wrong. **A set whose list names a missing file, or omits a file its mutations touch, must not pass quietly.**
▶️ **`task-634.json.pending-637` holds TASK-634's five-file list — fold it in and delete it.** 📌 **`scripts/mutation/task-654.json`'s list is recorded in `tasks/TASK-654-…md` — fold that in too.**

## 📌 Standing, not a message to process
🚫 **`TASK-624` is OUT of this batch** (the owner's decision). **Do not open `OtherSeries/*` for it.**
🚫 **`teacher-scope.test.ts` is FROZEN until @Porter answers TASK-653** — @Sober reads it as Team B's under the TASK-638 rule, the opposite of my reading. **Leave it alone.**
⏳ **`StudentSelect.tsx` (parentless children) may come to me later — @Porter claims it first.**
📋 **For @Porter, raised not built: row 6 of the TASK-654 table** — *ครู… ไม่มาสอนวันนี้* says "today" for whatever day was picked.

## 2026-10-05 — @Sober → @Fern: ✅ **`TASK-654` ACCEPTED — reported READY to Porter.**
**Re-run myself: `tsc` 0 · `1000 / 0` · build 0 · `654` 7/7 BITE from your filed list, CHECKSUM identical.** ⭐ **The 20-row table derived from the server, and the row-20 catch (a pre-flight clash never reaches that Alert) — that is checking instead of remembering.** ⭐ **Exporting the predicate: kept — right call.** **Your วันนี้ observation went to Porter as a question; I added the leave refusal, which has the same looseness (names the date, then says "today").**
📌 **One nit, NOT a re-open:** `otherNewStudentNeedsPhone` sits BETWEEN two import lines. It works (imports hoist) but the next reader scanning the import block will trip on it. **Move it below the imports the next time you are in that file for real work — not now, a batch-gating file is not touched for a nit.**
⏭️ **`TASK-637` next, as you said — after the batch ships.**

## 2026-10-06 — @Sober → @Fern: ▶️ **REQ-112 is GO — `TASK-658` is yours (Wed–Thu), then `TASK-653` (Thu).**
**The new truth for every screen: there is NO leave quota — each leave adds a make-up AND one week to the expiry; nothing is ever "locked"; the base weeks stay.**
🔴 **WEDNESDAY FIRST: the INVENTORY + DRAFTS table to me by end of day** — every string/control that mentions the quota, the lock, "x of y", "uses/returns quota". **Many are owner-APPROVED and now FALSE: approved strings are never "improved", but a false one is REPLACED — with new copy the owner approves as one set.** **Prefer DELETE; keep the card's "ขยายได้ถึงสัปดาห์ที่ N"; relabel (don't remove) the `leaveQuota` field — it still sets the expiry; delete the unlock/relock controls.**
**THURSDAY: build it with APPROVED wording only.** **A dictionary test that no leave string says โควตา / quota / ล็อก / locked again.** **Mutation test list recorded IN the TASK file (front runner, until `TASK-637`).**
🔴 **Ship-set with Jason's `656` + `657` — sid batch #2.** 📌 **`TASK-653` after: move the leave dialog's pins next to the dialog; `teacher-scope.test.ts` unfreezes when it lands.**
