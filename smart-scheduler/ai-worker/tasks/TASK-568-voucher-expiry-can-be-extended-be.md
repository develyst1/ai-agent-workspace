# TASK-568 — REQ-110 item 3: a voucher's expiry can be extended — BE, M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-29) · **Size M.** Khwan, REQ-110 item 3. **Next in @Porter's order (3 → 6).**

## §0 The one rule that governs this task
🔴 **D8 existed because expiry moves went UNRECORDED.** ⇒ 🔑 **A voucher expiry edit must RECORD every change from its first day.** 🚫 **"Add an editable field" is not the task.**
📌 **Courses already do this** (`courseExpiryChanges`, and TASK-556's marker). **Vouchers carry `expiryDate` — set from the first booking via `voucherExpiry` — and nothing edits it.**

## §1 Build
- **An admin can extend a voucher's expiry, the same way a course's is extended.** ⚠️ **Say plainly which parts you REUSED and which you had to write** — 🔑 **if the course path can serve both, that is better than a second implementation; if it cannot, say why in one line.** *Two expiry editors that agree today are two that can disagree later.*
- ✅ **Every change recorded: from, to, who, when.** 🔑 **The `actor` matters — TASK-556's refusal distinguishes a SYSTEM stretch from a HUMAN move, and a voucher edit is always a human one.**
- ⚠️ **Say what the rules are for an ENDED voucher and one already past its expiry** — **extendable or not?** 🔑 **If the honest answer is the owner's, ASK rather than choose**, and *"we refuse it" is a legitimate answer if you say what an admin does instead.*
- ⚠️ **Name every reader of `expiryDate`** that a later date changes — **the draw gate, `voucherUsable`, any warning or job.** 🚫 **Do not change them; name them.**
- ⚠️ **Is anyone TOLD?** **A course expiry change has an audience; say whether this one does, or say it deliberately has none.** 🔑 *"Nobody is told" is fine as a decision and bad as an oversight.*

## §2 Migration
⚠️ **Likely one (a voucher-side change record). Hand-numbered, and TELL ME the number the moment it exists.** **The uat range is 63 today.**

## §3 Not in scope
🚫 The FE half (mine to cut) · 🚫 changing how a voucher's expiry is first set · 🚫 the course path's behaviour · 🚫 Palm's items.

## Definition of Done
- [ ] Extendable by an admin · 🔑 **every change RECORDED (from · to · actor · when)**, reuse vs new stated in one line · the ended / already-expired rules answered **or ASKED** · every `expiryDate` reader named, **not changed** · the audience decided **deliberately** · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · migration number reported · 🔑 mutations incl. **a change that writes no record** and **an actor recorded as the system** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-29): a voucher's expiry is extendable, and EVERY move is recorded from day one — by BOTH of its writers · **migration `0063_voucher_expiry_changes` (uat 63 ⇒ 64)** · **3605 / 0 normally, and 3× DB-unreachable, 0 failed queries** · tsc 0 · **64 = 64** · seven mutations bite

## §1 Reused vs written (one line each)
- **Reused from the course path:**
  - the **warn-and-save** shape (a preview that writes nothing, a PATCH that reports the same warning: **one shared decision, two callers**, TASK-298's rule);
  - **`expiryImpact`** over the voucher's own sessions;
  - the **record written in the SAME transaction**;
  - **"a no-op is not a change"**;
  - the **body schema** (`updateCourseExpiry`);
  - **the actor from the TOKEN**;
  - **the permission key** (`action:bookings.course-expiry`, as voucher cancel reuses course-cancel).
- **Written new:** **the record TABLE**. 🔑 **The course one's FK is to `course_packages`**, and sharing it means changing the course path (§3). So it's **a sibling with the identical shape**, which 0034's own comment asked for (*"copy this shape into its own table rather than inventing a third answer"*). Plus the two voucher-only refusals (§2).

## §2 🔑 Every change RECORDED, by BOTH writers
- **The admin's edit** (`PATCH /vouchers/:id/expiry`): the date + **a record row (from · to · actor · when)**, in one transaction.
  - **A person is required:** no actor ⇒ `401 ACTOR_REQUIRED`, nothing written. **A person's edit is never recorded as the system** (TASK-556 reads that difference).
- 🔴 **The first booking's RE-COUNT is ALSO a writer:** `prepareVoucherBooking` recomputes the expiry from the first booking's date. **It now records that move with actor NULL (the system).** *Its value and logic are unchanged* (§3). Without this, the voucher record would have had D8's hole on day one.
- The value set **at sale** is the starting point, not a change (as at course creation).

## §3 The rules for ENDED / EXPIRED / NOT STARTED (decided; the owner can overturn any)
- **Already EXPIRED ⇒ extendable.** That's what the feature is for.
- **ENDED ⇒ `409 VOUCHER_ENDED`.** An ended voucher draws nothing (`voucherUsable`), so a later date would only change the screen.
  - *What the admin does instead:* sell a new voucher.
  - ⚠️ **ASK:** does the owner want an ended voucher revivable? That would be a different feature (un-ending), not this edit.
- **NOT STARTED (no live booking) ⇒ `409 VOUCHER_NOT_STARTED`** (*"อายุนับจากการจองครั้งแรก"*). Validity counts from the first booking, **whose re-count would overwrite an early extension.**
- 🔴 **Finding, not changed (§3: how it's first set):** the re-count fires **whenever the voucher has NO live booking**. **So if every booking of an extended voucher is later cancelled, the next booking silently resets the admin's extension.** It's now **recorded** (a system row after the admin's row), so it's visible, but it still happens. **Ruling needed** (e.g. the re-count skips a voucher that has a human change).

## §4 Every reader of a voucher's `expiryDate` a later date changes (named, NOT changed)
1. **`voucherUsable`**: the **draw gate** (`prepareVoucherBooking`, every voucher booking), via `voucherEligible`:
   - **the student picker** (`getEligibleStudents`);
   - **the SOM report**;
   - **the attention list's "expiring soon"**.
2. **`voucherStatus`**: the DTO's **ACTIVE / EXPIRED** (`toVoucherDTO`).
3. **`attention.ts`**: expiring-soon + the `voucher Nh · <date>` label.
4. **`getEntitlementPlan`**: the entitlement summary.
5. **The deduction notice's `*Expiry date`**: `updateBookingStatus` (a staff attend) and **`runEndOfDayJob`** (the day-end cut).
6. **The daily reminder's expiry line**: `runDailyReminderJob`.

## §5 🔕 The audience: NOBODY is told, DELIBERATELY
- **The course's own expiry edit tells nobody either** (checked: no send in `updateCourseExpiry`, pinned for both).
- **The family learns the new date where they already read it:** their next deduction notice and reminder (§4.5–6 carry it).
- Say if the owner wants a notice.

## §6 Checks
- Suite: **3605 / 0** (3596 + 9 new in `src/services/voucher-expiry-task568.test.ts`). **DB-unreachable 3×: 3605 / 0, 0 "Failed query".** tsc 0. **64 .sql = 64 tags.** Witness = the index.
- **Existing pins updated, each for exactly this addition:**
  - 61 count pins 63 → 64;
  - `expiryImpact(` count 1 → 2;
  - `actorOf(c)` count 21 → 22;
  - the two new routes classified in the ended-course write list ("unrelated": a voucher has no course).
- **Break-and-watch** (BASELINE 9, CHECKSUM identical, every restore byte-identical):
  - **R1, a change that writes NO RECORD:** **BITES**.
  - **R2, the first booking's re-count unrecorded:** BITES.
  - **A1, an ACTOR recorded as the SYSTEM:** **BITES**.
  - **A2, no actor accepted:** BITES.
  - **E1, ENDED extendable:** BITES.
  - **N1, NOT STARTED extendable:** BITES.
  - **T1, the record OUTSIDE the transaction:** BITES.
- **Found by the tests, fixed before reporting:** my PATCH re-read the voucher **without its student**, and `toVoucherDTO` needs it. **That would have been a 500 AFTER a successful save.** Also, I first placed the voucher functions inside the region TASK-264's "exactly one insert" pin reads; **moved them below**, and the pin is unchanged.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · 🔴 **but item 3 is NOT shippable until TASK-569**
Verified by me: **3605 / 0** (and 3× unreachable) · tsc 0 · **64 .sql = 64 journal tags** (counted myself). ⚠️ **uat range 63 ⇒ 64, reported to @Porter.**

## ✅ Reuse answered as a list, not a claim
**Reused: the warn-and-save shape (ONE decision serving preview AND PATCH), `expiryImpact`, the same-transaction record, the no-op rule, the body schema, the actor from the token, the permission key. New: only the record TABLE, a sibling, because the course one's FK is to courses.**
🔑 **"New: only the table, and here is why" is the answer** — *one decision serving preview and PATCH is TASK-546's rule again, arrived at without being told.*

## 🔑 The thing he did that nobody asked for and that matters most
**BOTH writers record — the admin's edit (a person required, else 401) AND the first booking's re-count (actor NULL = the system).**
⇒ 🔑 **"Which would otherwise have been D8's hole on day one."** 📌 **That is the whole lesson of this fortnight applied BEFORE the defect rather than after it**, and it is what makes the ruling below possible at all.

## ⚖️ 🔴 The finding — **ruled: the re-count must not overwrite a human's change. TASK-569, and item 3 does not ship without it.**
**The re-count fires whenever NO live booking exists** ⇒ **if every booking of an extended voucher is cancelled, the next booking RESETS the extension.**
🔑 **A feature the system can silently undo is not a feature.** **An admin extends a voucher, a cancellation happens, and the extension quietly disappears — with nobody told.** ⇒ **That is this fortnight's defect class exactly, and we would be shipping it deliberately.**
✅ **And it is fixable precisely because of what he did above: a HUMAN change is now ON RECORD, so the system's convention can be made to yield to it.** ⇒ **The re-count skips when a human change is recorded.**
📌 **The record he added on day one is the evidence that makes the fix possible. That is not a coincidence — it is the argument for recording.**

## ⚖️ The rules
- ✅ **EXPIRED ⇒ extendable.** Correct: a date that has passed is exactly what an extension is for.
- ⚠️ **NOT STARTED ⇒ 409 "the first booking would overwrite it".** 🔑 **That is a consequence of the BUG, not a rule** ⇒ **once TASK-569 lands, the reason evaporates.** **Revisit it there and say whether it should still refuse.**
- ⛔ **ENDED ⇒ 409, and he asks whether the owner wants them revivable.** **Escalated with my framing, so the answer is informed:** 🔑 **"ENDED" means the HOURS are gone, so extending a DATE cannot revive it.** ⇒ **If the owner wants an ended voucher usable again, the thing he is asking for is a TOP-UP, which is a different act.** ✅ **Refusing is right; the question is whether a different door should exist.**

## ✅ The rest
**Readers named and NOT changed** (`voucherUsable` in four places · `voucherStatus` · attention · `getEntitlementPlan` · the deduction notice · the daily reminder). ✅ **Audience decided deliberately: nobody is told, matching the course expiry edit, PINNED both** — 🔑 *a decision, not an oversight, and the pin is what makes that legible later.*
✅ **The tests caught a 500-after-save** — *the suite catching a real break during the task is the suite doing its job.*
