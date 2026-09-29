# TASK-496 — the `used*` counters are read-modify-write, and TASK-258 reverses a sale inside its own transaction — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** No migration. The ticket you asked for in TASK-492, from your own line references. 💰 Money-adjacent: these are counters a family's balance is computed from.

## §0 What it is — two defects in the same paths
1. **Read-modify-write on the attendance counters** — `attend` at **`:3542` / `:3562`** and TASK-258's undo at **`:3692` / `:3698`** read the value in JavaScript and write it back. **Two writers at the same moment lose a count.** TASK-492 already ended this for `leave_used` (both doors now `sql + 1`, with `GREATEST` on the way down) and **the day-end's own `sql` is the shape to copy** — it was right all along, which is the useful part: **the correct pattern is already in the codebase, in the job that runs unattended.**
2. ⚠️ **TASK-258 calls `reverseBookingSale` INSIDE its transaction while writing through `db`** (**`:3714`**) — so the reversal's writes are **outside** the transaction that is supposed to contain them. TASK-492's check-in Undo reverses the sale **after** commit, which is the correct shape; **copy that, do not invent a third arrangement.**

## §1 Build
- Every counter write in those paths moves to **`sql` arithmetic**, with **`GREATEST(x - 1, 0)`** wherever it decrements. 🔑 **Pinned by a SCAN, not a list:** no production write of a `used*` counter reads-then-writes. A scan survives the next path someone adds; a list of four line numbers does not.
- The sale reversal moves **after** the commit, matching TASK-492.
- 💰 **No change to WHAT any of these paths does** — the same counters move by the same amounts in the same cases. This is how, not whether. **If you find a case where the arithmetic differs, stop and tell me**: that is a different finding and it is mine to rule on.
- 📌 **Say whether any other counter in the schema is maintained this way.** `leave_used` and `used_sessions` are the two I know of; if there is a third, I would rather have its name now than meet it in a balance dispute.

## §2 What I am NOT asking for
🚫 **Not a fix for TASK-258's `SICK_LEAVE` falsification** — that a mistakenly-marked attendance is undone *to sick leave* (so the family's record says they took a leave they never took) is **TASK-497's**, a behaviour change with an owner decision behind it. **Keep them apart:** this ticket is mechanical and safe to review in one pass; that one is not.

## Definition of Done
- [ ] All four sites on `sql` arithmetic, decrements floored · **pinned by a scan** over production writes · the sale reversal after commit, matching TASK-492 · **no behavioural change** (the same counters, the same amounts, pinned) · any third counter of this kind named · suite **count** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation restoring a read-modify-write, one removing a floor, and one moving the sale reversal back inside the transaction · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — every entitlement counter now moves by `sql` (decrements floored), pinned by a SCAN; TASK-258's reversal after its commit. 3243 pass / 0 fail · tsc 0 · 59 = 59 · 5/5 mutations bite

**Numbers:** `bun test` **3243 pass / 0 fail**, twice. That is **+6** (the new scan file) and **−3** (`afterReturn`'s three tests, moved with their rule; see below). `tsc` **0** · **59 = 59**, no migration.

## ⚠️ Read first: the scan found TWO sites beyond your four, plus a THIRD counter. I converted them because the arithmetic is identical.
Your rule was "no production write of a `used*` counter reads-then-writes", pinned by a scan, and the scan cannot pass while these remain:
- **The cancel of a delivered session** (TASK-144, the status route's `cancel` of an ATTENDED row): `usedSessions: afterReturn(current.course.usedSessions)` / `usedHours: afterReturn(…)`. **`afterReturn` is `Math.max(0, x - 1)`, identical to `GREATEST(x - 1, 0)`.**
- **🔴 The third counter you asked about: `camp_packages.used_units`**, in camp's `markDay`. It read the package into JS and wrote `usedAfter(p.usedUnits, delta)`. **`usedAfter` is `Math.max(0, x + delta)`, identical to `GREATEST(x + delta, 0)`.** Camp's other writer (`redeem`, `sql + units`) was already right.
- **No arithmetic differs anywhere**, which is your stop condition. The same counters move by the same amounts in the same cases. If you'd rather these three had been left for their own ticket, they are three lines to revert.

## Not converted, and why: named
- **`students.crm_points`** (`awardCrmPoints`, `line-admin.ts`) is read-modify-write too. **It is NOT pure arithmetic:** the same write also sets `crm_level`, **derived from the new total** (`applyPoints`). An `sql + n` alone would leave the level computed from a stale read, and a correct fix means `.returning()` the points and then a second write, or the level ladder in SQL. That is a design choice, not a mechanical one, so **I left it and name it here**. It is points, not entitlement; its own ticket if you want it.
- **No other counter of this kind in the schema.** The scan's column list is `used_sessions`, `used_hours`, `used_units`, `leave_used`. Every other number I found moving (freelance budgets) is a ledger of movements, not a stored counter.

## What changed (`scheduler.service.ts` unless named)
- **`attend` (course + voucher):** `sql`${col} + 1`` **with `.returning()`**, and the deduction message's `used` is **the post-value the write returned**. That is the day-end job's exact shape, copied rather than invented. Before, `used` was a JS `+ 1` of a stale read.
- **The cancel of a delivered session** and **TASK-258's undo:** `sql`GREATEST(${col} - 1, 0)``.
- **`camp.service.ts` `markDay`:** `sql`GREATEST(${campPackages.usedUnits} + ${delta}, 0)``. The read of the package it no longer needs is gone.
- **TASK-258's `reverseBookingSale`:** the branch now raises `reverseSaleAfterCommit`, and the call runs **after `db.transaction(…)` returns**, the same arrangement as TASK-492's Undo.
  - 🔑 **Checked, not assumed:** `reverseBookingSale` reads **only the ledger** (`postedGeneration` → the movements), never the booking row. So calling it after the commit decides exactly what it decided before. The only difference: **a rolled-back undo no longer leaves a reversal in the books.**
- **The two JS helpers the counters no longer call are removed** (`afterReturn` in `checkin-correction.ts`, `usedAfter` in `camp.ts`), each with a comment saying where the rule went. Your rule from TASK-493's review: a helper nothing calls, still covered by its own tests, **is green coverage of dead code**. `returnsConsumedUnit` (the precondition) stays and is still tested.

## 🔑 The pin: a SCAN (`src/lib/counter-sql-req108.test.ts`)
- **The rule:** it reads every `.set(…)` argument in `src/` and `scripts/` (balanced parentheses, comments stripped). **Every write of `usedSessions` / `usedHours` / `usedUnits` / `leaveUsed` must be `sql` on the column itself**, and **every decrement or signed delta must be `GREATEST(…, 0)`**. A new path is caught by the rule, not by someone remembering to extend a list.
- **Not vacuous, and "the same amounts" by VALUE:** the scan's findings are pinned as the full list of **15** writes, each with its file, counter and exact amount (+1, −1, +units, +delta), commented with what each site was before.
- **The attend message** is pinned to take its value from `.returning()` and never a JS `+ 1`. **The reversal** is pinned after the transaction, with exactly one call in the function.
- ⚠️ **The scan's limit, named:** it sees counters written in a `.set({ … })` **literal**. A counter set through a pre-built object variable would pass unseen. None exists today, and the by-value list would also change if one appeared.

## Moved pins (each with its reason)
- `attendance-undo` › AC-2: the `GREATEST` `sql` (was `Math.max`). AC-5: the branch raises the flag, and `reverseBookingSale` is **no longer** inside it.
- `course-deduction` › "the manual site passes the post-value the WRITE returned" (was "the post-value it already holds").
- `voucher-end-req103` and `camp-3b` › the new `sql` text. `camp-3b`'s four `usedAfter` value asserts and `checkin-correction`'s three `afterReturn` tests moved into the floor rule of the scan.

## Break-and-watch: `mut496.mjs`, 5 mutations, **5 bite**
`BASELINE=89` (the scan + the five files with moved pins), read off a real run. `finally` + sha-256 restore, byte-identical. **CHECKSUM `aef8acbe…` identical before and after.**
- **A — a read-modify-write restored** (attend's course counter read in JS + 1): **bites, 3 fail**.
- **B — a floor removed** (TASK-258's undo): **bites, 3 fail**.
- **C — the sale reversal moved back INSIDE the transaction**: **bites, 2 fail**.
- **D — camp's `used_units` read-modify-write restored**: **bites, 3 fail**.
- **E — the deduction message reading a JS `+ 1`** instead of the write's post-value: **bites, 2 fail**.

⛔ Only you mark this DONE. (TASK-497: read, held for the owner as you said. Nothing touched.)

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Re-run by me, twice: **3243 pass / 0 fail** both times · tsc 0 · 59 = 59 · the dead helpers gone, each leaving a `🔻 TASK-496` line saying where its arithmetic went.

🔑 **The scan found more than my four, and finding a THIRD counter is exactly why I asked for a scan rather than a list.** `camp_packages.used_units` in `markDay` was maintained the same way — and **camp is where the wall QR is most used**, so a shop-front scan and a staff mark in the same moment could have lost a unit on a family's camp package. **My four line numbers would have closed three doors and left the busiest one open.**
✅ **Converting them was within the instruction**, because he checked the condition I attached (*stop if the arithmetic differs*) and it does not differ anywhere — and **he pinned the 15 findings BY VALUE (file · counter · amount)**, so *"same counters, same amounts"* is on the record instead of in a sentence. That is what makes a mechanical change reviewable in one pass.
✅ **`attend` now reads its message's `used` from `.returning()`** — the day-end's shape, and better than the floor alone: **the message and the write can no longer disagree.** A parent's notice quoting a number the database never held would have been unfalsifiable from outside.
✅ **The dead helpers removed rather than left behind**, their value tests folded into the scan's floor rule — TASK-493's decoration rule applied to himself the day it was written.

## ✅ `students.crm_points`: named, not touched — and that distinction is the right one
It is read-modify-write **and it derives `crm_level` from the new total**, so the fix leaves a real question (what is the level when two awards race?), and a level is **visible to a family**. 🔑 **Separating "this is the same change again" from "this looks like the same change and is not" is the judgement I most want on a sweep:** a sweep that swallows one genuinely different case is worse than one that stops short, because the difference is then buried in a diff of fifteen identical-looking edits. **Its own ticket: TASK-498.**
