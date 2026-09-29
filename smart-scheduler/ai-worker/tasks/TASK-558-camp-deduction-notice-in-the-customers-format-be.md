# TASK-558 — REQ-110 item 12: the camp-deduction notice in Khwan's format — BE, XS/S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-29) · ⏸️ **Queued behind TASK-557** (REQ-110 order: 1 → 12 → 7 → 8).

## §0 It is a REFORMAT, not a new message
✅ **The notice already exists** (`camp_deduction`, rendered by `renderCampDeduction`, sent by `notifyCampDeductions`) **and already goes to the FAMILY only.** 🚫 **No new recipient, no new trigger, no new sender.**
✅ **The earlier owner ruling stands without conflict: this notice is ENGLISH ONLY, no `t()`, no `lang`** — 📌 **and Khwan's requested format is already English**, so nothing collides.

## §1 The format (REQ-110 §1, the customer's own)
```
🏕️ BALANCE CAMP
Student: โมล่า
Date: 28-09-2026
Remaining: 0 / 0.5 days
```
- ✅ **Pin it by VALUE and by SHAPE** — the labels, the order, and `DD-MM-YYYY`.
- ⚠️ **The figures are where the size lives:** 🔑 **`Remaining: 0 / 0.5 days` must come from what the SENDER already carries.** **If any number is not already in the payload, that is a sender change and not just a template — say which, explicitly.**
- ⚠️ **Say what a HALF day renders as, and a zero** — *`0 / 0.5` is in her own example, so the halves are the normal case, not an edge.*
- 🚫 **No `t()` creeping in.** Pin the English-only rule so a future reader does not "fix" it.

## §2 Not in scope
🚫 The camp reminder · 🚫 the coach's notices · 🚫 who receives this.

## Definition of Done
- [ ] The four lines pinned by value and shape, `DD-MM-YYYY` · **every figure traced to the payload, and any sender change named** · half-day and zero cases stated · English-only pinned · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · mutations incl. **a label drifting** and **a figure coming from the wrong place** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-29): Khwan's four lines, byte for byte · **every figure already in the payload: NO sender change** · halves and zeros stated · English-only pinned · **3540 / 0 normally, and 3× unreachable, 0 failed queries** · tsc 0 · **62 = 62 (no migration)** · seven mutations bite

## §1 The change: the renderer only (`src/lib/camp-deduction.ts`)
| | before | after (Khwan's) |
|---|---|---|
| title | `🏕️ CAMP CREDIT USED` | **`🏕️ BALANCE CAMP`** |
| name | `Student : x` | **`Student: x`** |
| date | `Date : DD-MM-YYYY` | **`Date: DD-MM-YYYY`** |
| figures | `Remaining : 3.5/5 days` | **`Remaining: 3.5 / 5 days`** |
- ⚠️ **It now deliberately differs from every other notice's `Label : ` house style** (no space before the colon; spaces around the slash). **The renderer's comment says "do not harmonise it, and do not add `t()`"**, and both are pinned.

## §2 🔑 Every figure traced to the payload (no sender change)
The sender is `notifyCampDeductions`, and all four values were already carried (TASK-443):
- **Student** = `studentNamesOf({ student })`, which is the **nickname**, else the name. That matches her example's `โมล่า`.
- **Date** = the camp day's own `date`, rendered as `DD-MM-YYYY` by `ddmmyyyy`.
- **Remaining** = `unitsToDays(totalUnits − usedUnits)`, read **after** the day-end cut consumed today's units.
- **Total** = `unitsToDays(totalUnits)`.
- 🚫 **No new field, recipient, trigger or sender.** It's still `parent` only (pinned: one family row).

## §3 Halves and zeros (driven through the REAL sender into the renderer)
| package units | used | renders |
|---|---|---|
| 1 (one half day) | 1 | **`Remaining: 0 / 0.5 days`** (her example, end to end, byte for byte) |
| 3 | 0 | `Remaining: 1.5 / 1.5 days` |
| 4 | 4 | `Remaining: 0 / 2 days` (**`0`, never blank**) |
| 10 | 3 | `Remaining: 3.5 / 5 days` (**`5`, never `5.0`**) |
- An AM/PM day is 1 unit = 0.5; FULL is 2 units = 1. Units are integers, so days are always whole or `.5`.
- An empty payload (defensive only) renders `Remaining:  /  days`, pinned.

## §4 Pinned
- **By value:** Khwan's example end to end, identical under TH and EN.
- **By shape:** 4 lines, that order, `^Date: \d{2}-\d{2}-\d{4}$`, `^Remaining: n(.5)? / n(.5)? days$`, and **no ` : ` anywhere**.
- **English-only:** no `t()` / `lang` / i18n in the renderer; the comment is present.
- TASK-443's existing byte pins were **updated to the new format and nothing else.**
- New file: `src/lib/camp-deduction-format-task558.test.ts` (4 tests).

## §5 Checks
- Suite: **3540 / 0**, which is **3551 − 15** (TASK-556's orphan library + test, deleted per your ruling) **+ 4** new.
- **DB-unreachable 3×: 3540 / 0, 0 "Failed query".** tsc 0. **62 .sql = 62 tags: no migration.**
- **Break-and-watch** (CHECKSUM identical, every restore byte-identical):
  - **L1, a label drifting** (`Student : `): **BITES**.
  - **L2, the title drifting back:** **BITES**.
  - **L3, `0/0.5` (slash spaces lost):** **BITES**.
  - **F1, a figure from the WRONG PLACE** (remaining = the used units, in the sender): **BITES**.
  - **F2, the figures swapped** in the render: **BITES**.
  - **F3, halves floored:** **BITES**.
  - **E1, `lang` creeping into the renderer:** **BITES** (1, the source pin; the only guard against it).

## §6 Slips, and one thing noticed (not changed)
- **Slip:** my first edit of the test file used a shell one-liner whose `\n` escapes got mangled. **It failed on its own anchor check and wrote NOTHING.** Redone with the editor. (Also: I deleted the orphan files with a plain `rm`, **no git command.**)
- **Noticed, out of scope:** `Remaining` is the package's balance **at the pass**, not per day. So if one day-end pass catches up **two** unstamped days of the same child (e.g. after a missed run), **both notices print the same post-cut balance.** It was the same before this TASK. Ruling only if you want it.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-29)
Verified by me: **3540 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **62 .sql, no migration** (counted myself).

## ✅ It really was a reformat — and he PROVED that rather than assuming it
🔑 **"Every figure was already in the payload, so NO sender change"** — with each one traced: **the name is the nickname rule · the date is the day's · remaining is (total − used) / 2 AFTER the cut · total is total / 2.**
⇒ ✅ **That is the question §1 asked, answered as a statement.** 📌 *"No sender change" is worth nothing as a claim and everything as a trace.*
✅ **Khwan's own example pinned end to end THROUGH THE REAL SENDER, byte for byte** (1 unit, 1 used ⇒ `0 / 0.5 days`) — **not against the renderer in isolation.**
✅ **Halves and zeros stated and pinned:** `0 / 0.5` · `1.5 / 1.5` · **`0 / 2` never blank** · **`3.5 / 5` never `5.0`.** 🔑 *A zero that renders as nothing is how a parent reads "no notice" instead of "no days left".*

## ⚖️ Breaking the house style — **right, and correctly pinned**
**It now uses `Label: ` rather than our `Label : `.** ✅ **The customer's format was approved verbatim**, so **the house style yields to it** — and 🔑 **the comment telling the next reader NOT to harmonise it is the part that makes this survive**, because *a tidy-up that "fixes the spacing" would silently un-approve the owner's decision.* ✅ **`t()` pinned out too.**

## ✅ The orphans, retired on my condition exactly
**`expiry-repair-plan.ts` + its 15 tests deleted — and because the reasoning was NOT mechanics-only, its four rules were lifted into the stub's comment FIRST.**
🔑 **Delete the code, keep the knowledge.** ✅ **The count reflects −15 + 4**, stated rather than left to be noticed.

## ✅ The reported slip
**A shell one-liner mangled its escapes, FAILED ITS OWN ANCHOR CHECK, and wrote nothing.** ✅ **The anchor check working is the report** — *a write that silently half-lands is the thing that check exists to stop, and it stopped it.*

## 🔴 "Noticed, not changed" — I am taking this one up, not folding it in
**A catch-up pass over two unstamped days of one child prints the SAME post-cut balance on both.**
🔑 **That is two notices to one parent showing the same number for two different days — the earlier one is wrong**, and *a parent reading two identical "Remaining" lines learns to ignore the notice.* 📌 **Pre-existing, not caused by this task, and correctly NOT folded in.** ⇒ **Raised to @Porter for the owner; it is not yours to fix today.**
