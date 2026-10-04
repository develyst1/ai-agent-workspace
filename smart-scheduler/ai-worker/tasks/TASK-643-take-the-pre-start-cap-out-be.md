# TASK-643 — BE: **take the pre-start CAP out before the batch ships** (owner ruling, `TASK-636` §1)
**From @Sober to @Jason.** ✅ **Owner ruling 2026-10-04, accepted as recommended.** 🔴 **This is in the READY batch, so it is the one thing standing between it and a go.**
🔑 **Khwan: *"ลาล่วงหน้าก่อนเริ่มคอร์สเราไม่จำกัดอยู่แล้วนะคะ"* — and on the DEPLOYED build she is right. `TASK-609` is what would introduce the limit.** ⇒ **A deletion: free today, a customer-visible round-trip tomorrow.**

---

## 1. ✅ What comes OUT
- **The LIMIT:** the `declared >= quota ⇒ DECLARED_ABSENCE_CAP` refusal. **Free pre-start absences are not limited.**
- **The refusal itself (`§T-609-CAP`)** — 🔑 *a refusal for a rule that no longer exists is worse than no refusal.* 📌 **Not wasted: it was right for the rule in force, and the owner approved its words.**

## 2. 🔴 What STAYS — **take out the LIMIT, not the FLAG, and not the detection**
- 🔴 **`plannedAtCreation` STAYS.** **Your own §3 reasoning holds: `leaveChargeOf` returns `"free"` off that flag, so clearing it re-opens `UNDO_LEAVE_CHARGE_UNKNOWN` on rows we have already acted on.**
- 🔴 **The "has this course started?" detection STAYS.** **It still decides whether an absence is FREE; only the count against the quota goes.** ⚠️ **If `preStartDeclaration` is now only half-used, narrow it to what it still answers and say so at the line — 🚫 do not leave a helper that returns a `quota` nobody reads.** 🔑 *A value returned and never read is a rule waiting for someone to reinstate it by accident.*
- 🔴 **The leave COUNTER stays.** ⚠️ **The owner has NOT ruled on abolishing it, and the expiry is DERIVED from it (`maxWeekFor(size, quota) = size + quota`).** ⇒ **`TASK-636` questions 2–4 stay OPEN and are NOT this task.**
- ✅ **No-conversion both ways, including across a START-DATE CHANGE, stays exactly as pinned.**

## 3. 🔴 THE MUTATION SET — **@Porter's warning, and it is the important half of this task**
🔑 ***A set that silently stops biting because the behaviour it pinned is gone looks IDENTICAL to a set that broke.***
**My prediction, from reading what each one pins — VERIFY it, do not take it:**
| | Pins | After the deletion |
|---|---|---|
| **F1, F2** | a declared day becomes chargeable / charges quota | ✅ **keeps its subject — must still BITE** |
| **F5, F6** | a started course declares free / a forked "has it started" | ✅ **keeps its subject — must still BITE** |
| **F7** | a declared day is LOCKED instead of free | ✅ **keeps its subject — must still BITE** |
| **F8** | the start-date change converts a declared day | ✅ **keeps its subject — must still BITE** |
| **F3** | "the CAP does not apply" | 🔴 **this is now the INTENDED behaviour** ⇒ **INVERT it, see below** |
| **F4** | the cap counts the wrong pool | 🚫 **no subject — RETIRE** |
| **F9** | the at-cap refusal loses its count | 🚫 **no subject — RETIRE** |
| **F10** | the row counted against its own cap | 🚫 **no subject — RETIRE** |
| **F11** | cancel-and-re-declare resets the cap | 🚫 **no subject — RETIRE** |
▶️ **RETIRE means REMOVE from the set, with the id kept and a note in the file saying WHY and WHEN** — 🚫 **never leave a mutation in a set to "survive" because its subject is gone.** *A survivor that is supposed to survive is indistinguishable from one that is not.*
⭐ **INVERT F3:** **the owner's ruling is now a rule worth pinning — the customer disowned a cap, so a cap quietly REINTRODUCED is the defect.** ▶️ **Write a pin that a pre-start course accepts more declared days than its quota, and a mutation that puts the cap back, which must BITE.**
✅ **And re-run the set: report the NEW count, which ids were retired, and that every surviving id still bites.**

## 3b. ⚠️ ONE consequence to VERIFY, not to fix — **what bounds a pre-start course once the cap is gone**
**`courseBornCeiling` sets the expiry to the BASE ceiling PLUS the weeks declared absent — the customer's own Kavya rule (8 + 3 = 11), unbounded by design.** ⇒ 🔑 **With no cap, every declared pre-start absence now extends the course's validity by a week, WITHOUT LIMIT.**
✅ **That matches Khwan's own model ("the expiry is the only control") and it is NOT a defect.** ▶️ **But confirm it by VALUE: a pre-start course with MORE declared absences than its quota gets an expiry stretched by exactly that many weeks, and its make-ups land inside it.** 🔑 *Removing a limit is the moment an unbounded loop shows itself; I want the number, not the reasoning.*

## 4. ✅ Done means
1. **`tsc` clean · the no-DB suite with COUNTS · migrations balanced (🚫 no migration expected).**
2. **The F set re-run and reported as above — retired ids named, the inverted F3 biting.**
3. **Every pin that asserted the cap or its sentence RE-READ for what it now proves** — 🔑 *your own rule.* **Updated with the reason, or removed with the reason; 🚫 never just made green.**
4. ⚠️ **`approved-refusals-task635.test.ts` pins `§T-609-CAP` by shape.** **It must now assert the refusal is GONE — not merely stop asserting it is there.** 🔑 *An absent check and a check for absence are different things.*
5. **The `extension-ceiling` pin you NARROWED for `TASK-609` ("no quota left ⇒ still refused" now holds for STARTED courses only) — re-read it: with no pre-start cap, is the narrowing still exactly right?**

## 5. 🚫 Not in this task
**Abolishing the leave counter (`TASK-636` Q2–4)** · **anything about `plannedAtCreation`** · **the parentless-children fix (`TASK-641`/`642`, being sized)** · **any other refusal's words.**

## ✅ 2026-10-04 — @Jason: DONE — the cap is out, and your set prediction was right except in ONE way
**`tsc` 0 · the DB-unreachable suite 3852 pass · 0 fail · 65 .sql = 65 journal tags — no migration.**
**F set re-run: baseline 116 · `F1 F2 F3 F5 F6 F7 F8` — 7 / 7 BITE · 0 SURVIVED · CHECKSUM identical.**

### §1 — what came out
**The limit and its refusal, both.** `DECLARED_ABSENCE_CAP` appears nowhere in the service. **Pre-start declared absences are not limited.**

### §2 — what stayed, and the helper narrowed as you asked
- ✅ **`plannedAtCreation` stays**, for exactly the reason I gave in §3: `leaveChargeOf` returns `"free"` off that flag.
- ✅ **The "has it started" detection stays** — it still decides whether an absence is FREE.
- ✅ **The leave COUNTER stays**, untouched. 🔑 **And removing the cap did not threaten it, because a declared day was never paid out of `leaveUsed` in the first place** — that is the "same number, separate counter" finding, still asserted.
- ▶️ **`preStartDeclaration` now returns `boolean`**, not `{ declared, quota }`. **It reads no quota and counts nothing.** 🔑 **Your line is why it is a deletion and not a leftover: *a value returned and never read is a rule waiting to be reinstated by accident.*** **The leave branch reads it directly: `const declaredFree = await preStartDeclaration(tx, current);`**

### 🔴 §3 — YOUR PREDICTION, VERIFIED NOT TAKEN — and one correction
**I checked every mutation's anchor against the new source before touching the file.** **Six of your nine calls were exactly right. One was right in substance and wrong in consequence:**
| | you predicted | verified |
|---|---|---|
| **F1 · F2 · F7 · F8** | keep their subject, must still BITE | ✅ **correct, unchanged, all four BITE** |
| **F4 · F9 · F10 · F11** | no subject ⇒ RETIRE | ✅ **correct — removed, ids kept in the file's note with why and when** |
| **F3** | now the intended behaviour ⇒ INVERT | ✅ **correct — inverted and it BITES** |
| **F5 · F6** | *"keeps its subject — must still BITE"* | ⚠️ **both halves true, but they would NOT have bitten: their SUBJECT survived and their ANCHOR did not.** |
🔑 **F5 and F6 anchored on `if (!courseNotStarted(…)) return null;` — the guard line. The helper now RETURNS the predicate, so that exact text is gone.** ⇒ **left alone they would have failed to apply, or worse, applied to nothing.** ▶️ **RE-ANCHORED, not retired — the distinction is the whole point: *a lost subject is a retirement, a lost anchor is a re-anchor, and they look identical in a report that only prints a number.*** ✅ **Both bite on the new line.**
📌 **This is `TASK-627`'s set-integrity test earning its keep a third time — it is what told me F5/F6's anchors were stale before the run, rather than the run telling me afterwards.**

### §4.3–4.4 — every pin that asserted the cap, re-read
- **`pre-start-declared-absence-task609`:** the quota pin **retired and inverted into an ABSENCE** (`courseLeaveQuota(current.course)` must not appear; the helper must return `boolean`) · the at-cap pin **inverted** — *nothing is thrown between the predicate and the row write* · §3's leak block **kept as a record and asserted as unreachable**, because **the reasoning will be needed again the day anyone reinstates a limit.**
- **`approved-refusals-task635`:** 🔴 **it now asserts the refusal is GONE — the sentence, the code and the interpolated count — and that NOTHING replaced it.** 🔑 *An absent check and a check for absence are different things.* ✅ **The approved wording is kept in the file as a RECORD, explicitly 🚫 not as a template: if a cap returns, its sentence is written from the rule then in force.** ✅ **And TASK-635's contrast rule outlives its own subject: `LEAVE_LOCKED` still offers the unlock it really has.**
- **`extension-ceiling` (§4.5), re-read as instructed:** ✅ **the narrowing is now MORE exactly right, not less.** When TASK-609 narrowed it, "a pre-start course bypasses the quota" came with its own cap, so the bypass was bounded; **with the cap gone the bypass is unbounded — and this test's subject, the STARTED course, is untouched by either change.** **The gate that remains is `leaveRemaining`, exactly as it asserts.**

### ⚖️ §3b — the NUMBER, not the reasoning
**By value, through `courseBornCeiling`:**
- **0 absences ⇒ ceiling = base + 0 weeks** · **quota absences ⇒ + quota** · **quota + 3 ⇒ + (quota + 3)** · **25 ⇒ + 25.** 🔑 **Exactly that many weeks, every time — there is no ceiling on the ceiling.**
- ✅ **The make-ups land INSIDE it** at 1, 5 and 12 absences (each earns one, appended a week after the plan's last session).
- ✅ **It never SHRINKS** — a hand-drawn plan past the base keeps its own end.
⇒ **Unbounded, and that is the customer's model: the expiry is the control, which is what Khwan said.** 🚫 **Not a defect, and not fixed.**
