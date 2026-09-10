# TASK-308 — the QUOTA is the only gate on leave, and the expiry STRETCHES to fit (`REQ-085 §12`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
🔴 **The owner has hit this THREE times and it is still standing on `sid`.** 🚫 No migration, no FE change *(§6
names the FE follow-up)*.
⚠️ **This SUPERSEDES the premise of TASK-299/301/302. It is a re-cut, not a patch** — @Porter's words:
*"I would rather you re-cut them from `§12` than patch what is there."*

---

## §1 🔴 Why this exists: the refusal MOVED and the outcome did not
**Same course `มิลล่า`, 4 sessions, `Leave 0/1`, `Ends 27 Oct`, on deployed `sid`:**
| | |
|---|---|
| before TASK-301 | `คอร์สขยายเกินสัปดาห์ที่ 5 ไม่ได้` |
| after TASK-301 | `คอร์สขยายเกินวันสิ้นสุดของคอร์ส (2026-10-27) ไม่ได้` |
🟢 **The check stopped citing a week the course had outgrown — real progress.**
🔴 **The admin still cannot take the leave, and the card still says `Leave 0/1`.**
🔑 **The requirement was never *"a more accurate refusal"*. An accurate refusal is still a refusal.**

## §2 ✅ THE RULE — `REQ-085 §12`, the owner, verbatim
> *"quota ลา มี แต่การยืดเวลาไม่มี quota เพราะงั้นเคสนี้ ถ้าเขาจะลา ต้องได้ เพราะเขามี quota ลา
> ส่วนวันหมดอายุ ก็อย่างที่บอก ให้ยืดตามไปเลย หากเขายังมีสิทธิ์ลา"*

| | |
|---|---|
| **the leave QUOTA** | ✅ **the ONLY thing that may ever refuse a leave** |
| **the extension / week ceiling** | 🚫 **not a quota, not a limit — may NEVER refuse a leave** |
| **the expiry date** | ✅ **STRETCHES to fit, every time a leave is legitimately taken** |

🔑 ***If the family still has quota, the leave goes through and the dates move to make room.*** **No second gate.**
📌 **It is `§10`'s principle with the exception deleted — *the plan decides the dates; the dates do not veto the
plan* — at creation AND after it, identically.**
🔻 **@Porter has withdrawn `§11`'s two-rule table as his own misreading**, and I ratified it without question. ⇒
**the ceiling was never a rule about leave. It was a rule we invented for it.**
✅ **And the bound the ceiling was protecting still exists: leave is finite because the QUOTA is finite.**
*(`SPEC-028 §5 #2` feared "a leave could otherwise extend a course indefinitely" — it cannot: at most `quota`
make-ups.)*

## §3 What to change
**(a) 🔴 Delete the refusal.** `scheduler.service.ts:2230` — `EXTENSION_CEILING` **must not fire on a
leave-driven make-up.**
**(b) ✅ The expiry GROWS instead.** When a make-up lands past the course's stored `expiryDate`, **the expiry
becomes that date.** 🔑 **Same shape as `replanExpiry`: never shrinks, always covers the last owed session** —
**and TASK-282's guarantee (the expiry covers the plan) is what makes this safe rather than a hole.**
⚠️ **Write the expiry change through whatever already records one** — `recordExpiryChange` exists and REQ-082's
audit trail is why. 🚫 **Do not add a second way to move an expiry.**
**(c) 🔻 REVERT TASK-301's quota term.** `courseBornCeiling(base, lastPlanned, absences, quota)` **pre-allocated
weeks for leave not yet taken.** ⇒ **with nothing left to refuse, there is nothing to leave room FOR**, and
🔑 **a pre-allocated week makes the card's `expires` date claim time the family has not used.** **Stretch on
demand is both simpler and more honest.**
📌 **TASK-301's term was the right fix for the rule as we then understood it. `§12` removes the need for it, not
the reasoning behind it.**
**(d) ✅ The quota gate STAYS** — `:2319`'s `leaveLocked`, and `adminUnlocked` / the per-change `override` are
untouched. 🔑 **That is now the only gate, and it must still work.**

## §4 🔴 A predicate with no callers is the thing we deleted this week
**After (a), `exceedsExtensionCeiling` may have no live caller** — the creation preview's `exceedsCeiling`
(`:2054`) is computed against a boundary the plan cannot exceed by construction.
⚠️ **If it is dead, DELETE it** — 🚫 **do not leave a gate that can never fire.** 📌 *`EXPIRY_REQUIRED` was exactly
that and we removed it in TASK-287; a handler for a case that cannot arrive is a path nobody can test.*
🔑 **But say what you find rather than assuming my read:** **if something still needs it, name what and leave it.**

## §5 What must not change
- 🚫 **The leave QUOTA, `leaveUsed`, `LEAVE_QUOTA_BY_SIZE`, `courseLeaveQuota`, `adminUnlocked`, the per-change
  `override`.** **This removes a gate; it grants no extra leaves.**
- 🚫 **TASK-282's derived expiry** — it is what killed DEF-4, and (b) leans on it.
- 🚫 **`§10`'s creation stretch for DECLARED absences** — those are real planned sessions and must stay covered.
- 🚫 **TASK-300's make-up anchor** · `§7.1`–`§7.4`'s pinned messages · the leave notice.
- 🚫 No migration · no FE change.

## Definition of Done
🔑 **The first item is the owner's own reproduction, and from now on his screenshot IS the acceptance test.**
- [ ] 🔑 **`มิลล่า`'s exact case: a 4-session course, 3 declared absences, plan ending week 7, `Leave 0/1`** ⇒
      **the admin CAN take the leave**, and **the expiry MOVES to cover the make-up.** **Assert BOTH.** ⚠️ *The
      leave succeeding with a stale expiry is the same defect wearing a different face*
- [ ] 🔑 **A course with NO quota left is still REFUSED** — asserted. ⚠️ **This is the assertion that keeps the
      quota a gate; without it "no ceiling" becomes "no limit"**
- [ ] **`EXTENSION_CEILING` never fires on a leave path** — asserted **as an absence**
- [ ] **The expiry change is RECORDED** the same way an admin edit is — asserted, so REQ-082's audit trail still
      answers *"why did this date move?"*
- [ ] **§4 answered:** `exceedsExtensionCeiling` **deleted, or its remaining caller named**
- [ ] **TASK-301's quota term is reverted**, and 🔑 **`courseBornCeiling` still covers the declared absences** —
      asserted, because that is `§10` and it must survive this
- [ ] `bun test` all pass, **state the count** · typecheck clean, **say which command** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **Break it and watch** — restore the refusal and show the owner's case failing **for that reason**;
      restored, suite green before the number

## §6 📌 Named, not in this task
**The creation preview's `exceedsCeiling` field is read by the FE to disable `Create plan`.** ⇒ **if it can no
longer be true, that gate is dead FE code** — **@Fern's, once you tell me whether the field survives.**
🚫 **Do not change the DTO's shape in this task without telling me first** — a removed field is a contract change
and the FE reads it.

## Question
🔴 **Three of my tasks were shaped by a rule that was never the owner's** — a ceiling that "refuses". **He said it
once, in one sentence, and it was read as two rules.**
🔑 **What OTHER limits does this product enforce that no requirement ever asked for?** ⚠️ **I am not asking you to
remove any of them.** **Name refusals whose authority you cannot trace to a REQ or an owner ruling** — 📌 *the
ceiling had a comment citing `SPEC-028 §5 #2`, so it looked sourced; the SPEC feared something the quota already
prevented.* 🔑 **A limit with a citation that does not actually support it is harder to find than one with no
comment at all.**

---

## ✅ RESULT 2026-09-09 — @Jason. **1854 pass / 0 fail**, 148 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0**.

- [x] 🔑 **`มิลล่า`'s exact case: the admin CAN take the leave, AND the expiry MOVES** — both asserted
- [x] 🔑 **A course with no quota left is still REFUSED** — the gate that remains
- [x] **`EXTENSION_CEILING` never fires on a leave path** — asserted as an absence **across the whole service**
- [x] **The expiry change is RECORDED** through `recordExpiryChange`, the same writer an admin edit uses
- [x] **§4 answered** — the predicate is **NOT dead**; its one live caller is named below
- [x] **TASK-301's quota term reverted**, and **`courseBornCeiling` still covers the declared absences** (§10)
- [x] 🔑 **Break it and watch** — restored, suite green before this number

### §3 (a)+(b) ✅ The refusal became a stretch
The append loop collects the furthest date it reaches and, **once**, grows the expiry to it — so a course that
earns three make-ups records **one** expiry change rather than three. Written through `recordExpiryChange` with
a **null actor**, which is accurate: the system moved it, not a person. 🚫 No second way to move an expiry.

### §3 (c) 🔻 Reverted — and I reverted TASK-302's term as well
`courseBornCeiling` is back to three parameters. ⚠️ **I also reverted TASK-302's remaining-quota term in
`replanExpiry`**, which the task did not name. **The argument is identical** — it existed so a resumed course
would have room for a leave the ceiling would otherwise refuse — and leaving it would pre-allocate on the
**re-plan path only**, which is the inconsistency this task exists to end. `replan-quota-room.test.ts` is
rewritten as the record rather than deleted. **If you want it kept, it is one line back.**

### §4 🔴 The predicate is NOT dead — and the answer is more interesting than "delete it"
**`exceedsExtensionCeiling` has exactly one live caller: the creation preview's `exceedsCeiling` (`:2059`).**
⚠️ And it is **reachable**: the preview projects make-ups at a weekly cadence while `findFreeExtensionDate`
**searches**, so a taken slot can still push one past the projection. **It is not a gate that can never fire.**
🚫 Left in place — §6 says the FE reads that field and I may not change the DTO here.
📌 **But under §12's own principle that remaining creation-time refusal is questionable too:** *the plan decides
the dates; the dates do not veto the plan.* **Your call, not mine, and not in this task.**

### 🔴 Two things that were only dead once (a) landed — both removed, both named
1. **The `CANCEL_AT_CEILING` re-map.** It caught `EXTENSION_CEILING` on the cancel path to reword it. With
   nothing left to throw it, **it became a handler for an exception that cannot arrive** — §4's own rule, and
   `EXPIRY_REQUIRED`'s exact shape. Removed. ✅ **The reconcile still runs on a cancel**, so a cancel is still a
   reschedule and not a forfeit (SPEC-028 §11.3); only the refusal it could raise is gone.
2. **A comment at the creation site** saying this is *"where the MAX_WEEK ceiling is enforced"* and that a
   create is refused past it. **It is not, and no longer can be.** Corrected rather than left to mislead.

### ✅ Break it and watch
Restoring the refusal fails **seven** assertions — including *"a 4-session course, 3 declared absences: the
leave GOES THROUGH"* and *"the expiry MOVES to cover it"*. 🔑 **The owner's own reproduction is the one that
goes red**, which is what @Porter asked for: *the screenshot IS the DoD.*

### 🔑 The Question — **one limit with no authority at all, and one that just changed shape**
🔴 **`MAX_STUDENTS_PER_PARENT = 5`** (`parent.service.ts:13`, refuses at `:119`). Its comment reads
*"Business rule: a single phone may register at most 5 students"* — **and cites nothing.** No REQ, no SPEC, no
TASK, no owner ruling. ⚠️ The customer's own copy hardcodes 5 (`line-i18n.ts:142`), **but I cannot tell whether
the copy is the source or an echo of the code** — and that not being answerable from the repo is the finding.
📌 **It is the easier kind to catch:** the ceiling looked sourced, this one looks like a decision nobody wrote
down.

⚠️ **`MAX_EXTENSION_WEEKS_SCANNED = 26`** (`extension-slot.ts:7`) — **not a refusal, and that is newly the
problem.** `firstFreeWeeklySlot` scans 26 weeks and, finding nothing, **returns the last candidate anyway**; its
comment says the caller's ceiling is what refuses it — *"this function never silently invents a valid-looking
date."* 🔴 **That caller was the line I just deleted.** ⇒ on a slot booked solid for 26 weeks, a make-up now
lands half a year out and the expiry stretches to meet it, **silently.** Unlikely, and no longer impossible.
🚫 **Not changed** — it follows from §12 and the remedy is a decision, not a patch.

✅ **Traceable, checked:** `SLOT_TAKEN` · `SESSION_DELIVERED` (SPEC-028 §5) · `VOUCHER_PROGRAM_EXCLUDED`
(SPEC-030) · `TEACHER_CHANGE_TOO_LATE` (SPEC-029, and configurable) · `LEAVE_NOTICE_TOO_LATE` (SPEC-048) ·
`NO_OWED_SESSION` (SPEC-028 §2 / REQ-064) · `LEAVE_LOCKED` (the quota) · the pause/drop/end state guards.

🔑 **And the sharper form of your point:** the ceiling's citation was real — `SPEC-028 §5 #2` exists and says
what it says. **What it did not do was require a refusal**; it named a fear (*"a leave could extend a course
indefinitely"*) that the quota already prevented. ⇒ **the test that finds these is not *"does it cite
something?"* but *"does the cited source ask for a REFUSAL, or only name a worry?"*** The first is a grep; the
second is a read, and it is the one that would have caught this in TASK-093.

### §6 📌 For @Fern, when you route it
`exceedsCeiling` **survives on the DTO** — same shape, same field. 🚫 I changed nothing about the contract.

**BALL: @Sober — TASK-308 ready for review. ⛔ Nothing else is on me.**
