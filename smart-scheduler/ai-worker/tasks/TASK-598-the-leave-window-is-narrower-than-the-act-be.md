# TASK-598 — the LINE leave window is narrower than the act — BE, S/M ⏸️ **SIZED, NOT DISPATCHED**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-10-01) · **Diagnosed by me from the code at @Porter's request. Awaiting the owner.**

## §0 The diagnosis — **it is a DEFECT, not copy**
**`findUpcomingBookingsForParent` filters `eq(b.status, "CONFIRMED")`.** 🔴 **But `insertBooking` defaults `status` to **PENDING***, so **every planned course / ECA session is born PENDING** — *which is why a bulk-confirm feature exists at all* — **and a make-up is born EXTENDED.**
⇒ 🔑 **The window shows a family only the part of their future an admin has already confirmed.**
**The failing shape, and it is exactly Khwan's report:** **one CONFIRMED class inside the cut-off (today or tomorrow) + later classes still PENDING or EXTENDED** ⇒ `upcoming` = the near one · `eligible` = empty ⇒ **"every class is too close"**, **while a leavable class next week exists and is invisible to the window.**
📌 **The file's own comment already names the principle this breaks: *"offering a session the bot will then refuse is worse than not offering it."*** **The inverse is just as bad: refusing a session the bot would have accepted.**

## §1 🚫 The fix is NOT "widen it to every status"
🔑 **The window must EQUAL the set the leave ACT accepts — derived, not chosen.** ⇒ **Widening further would offer a session the write then refuses, which is the rule that comment exists to protect.**
- **Step 1: DERIVE what the leave write accepts today** (the LINE leave path through to `updateBookingStatus` / `applyPlanChange`). **Name the set and where it is decided.**
- **Step 2: make the window that set, from ONE place.** 🚫 **Not a second list that agrees today.**
- ⚠️ **If the act's own accepted set is itself wrong** (e.g. it refuses EXTENDED, so a make-up can never be leaved through LINE at all), **STOP and say so — that is a product question, not a window fix.**

## §2 The message, which is part of the defect
**`emptyLeaveReply` chooses between *"nothing upcoming"* and *"all inside the cut-off"* on `upcoming.length`.** ⇒ **With the window corrected, that choice becomes honest by itself** — ⚠️ **but pin BOTH sentences against the new set**, because 🔑 *a parent who is TOO EARLY and a parent who is TOO LATE currently read the same sentence, and that is what TASK-316 set out to fix.*

## §3 What I checked and found SOUND — 🚫 do not re-investigate
- ✅ **The timezone is right.** **The caller passes `bangkokNow().date`**, and `gte(b.date, fromDate)` **keeps today's rows**, which are then judged by `hasEnoughLeaveNotice` **in Bangkok time**. ⇒ **Today's later classes are NOT dropped.**
- ✅ **The cut-off itself is resolved per teacher TYPE through the same helper the write throws from** — **not a second copy of the rule.**
- ✅ **There is deliberately no horizon** (TASK-316): *a course is finite and its sessions are the answer.*

## Definition of Done
- [ ] The act's accepted set **DERIVED and named, with where it is decided** · the window made that set **from one place** · ⚠️ **the act's own set questioned, and STOPPED if it is wrong** · both empty-state sentences pinned against the new set · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · mutations incl. **the window narrower than the act again** and **the window wider than the act** · report + `inbox/SA.md` + log.
