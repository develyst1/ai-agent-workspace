# TASK-597 — a string written for one branch, rendered on another — FE, S/M ⏸️ **NEXT ROUND, not dispatched**

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-10-01) · ⏸️ **On the board so it does not evaporate. Do not start it.**

## §0 Why it exists
**TASK-595 was a sentence written for TODAY's leave, rendered on a FUTURE date.** **TASK-588 was a chooser written for a cancel, offered where nothing is cancelled.** **TASK-547 was a body written for every leave, shown for leaves it did not describe.**
🔑 **Three instances, one shape: one dialog, two acts, and a string that belongs to only one of them.**

## §1 Why it is an AUDIT and not a sweep
🔑 **It needs judgement per dialog** — *"does this sentence still mean the same thing on the other branch?"* **is not decidable by a parser.** ⇒ **The output is a LIST, not a fix.**
- **Step 1: DERIVE the set of two-act dialogs** — ones whose body or controls branch on a mode, a date, a type. 🔑 **That part IS derivable, and it is the valuable half.** ⚠️ **Say how you derived it.**
- **Step 2: for each, name every string that belongs to ONE branch only, and whether it is currently shown on both.**
- 🚫 **Fix nothing in this task.** 🔑 **I want the size before anyone spends it** — *a survey that fixes as it goes stops being a survey*, as you established in TASK-567.

## Definition of Done
- [ ] The two-act dialog set **derived, with the method stated** · per dialog, the one-branch strings named and their current reach stated · 🚫 **nothing fixed** · suite **count unchanged and said so** · report + `inbox/SA.md` + log.
