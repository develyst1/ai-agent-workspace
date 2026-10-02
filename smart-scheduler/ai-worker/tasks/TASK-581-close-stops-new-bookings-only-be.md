# TASK-581 — item 8: Close stops NEW bookings only — BE, S/M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · ⏸️ **Queued behind TASK-579.** The owner ruled as recommended.

## §0 The ruling
**Close stops NEW bookings only. Existing bookings stay. Open re-allows.** 🚫 **Nothing else.**
🔴 **Today's close does far more** (your TASK-560 finding): **it deletes coach calendar blocks for every day INCLUDING PAST ones · stops coach AND parent reminders · refuses the per-day swap — while the day-end cut still charges the children and still sends BALANCE CAMP.**
🔑 **Two reasons it must change, and the second is the one that makes it urgent: it stops TELLING people while it keeps TAKING their days, and it CANNOT BE UNDONE — reopening restores only future days.** ⇒ **A switch that loses data is not a Close.**

## §1 Build
- **Close = the `planDays` gate only.** ✅ **Pin that a closed week keeps its coach blocks (past AND future), keeps both reminders, and allows the per-day swap.**
- 🔑 **Reversibility is the test that matters: close ⇒ open ⇒ the week is EXACTLY as it was.** ⚠️ **Assert it by value, not by "it looks restored".** *That is the property today's version fails.*
- ⚠️ **Name what you REMOVED from the old behaviour and who depended on it.** 🔑 **If anything legitimately wanted "camp off" in the wide sense, say so — it is a different feature and it needs its own name**, 🚫 not a shared switch.
- ⚠️ **And the charging half: say plainly whether a closed week still charges.** **Either answer must be deliberate and pinned.**

## Definition of Done
- [ ] Close gates only new bookings · **close ⇒ open ⇒ identical by value** · coach blocks, both reminders and the swap all pinned as UNAFFECTED · what was removed **and who wanted it** named · the charging behaviour stated and pinned · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · mutations incl. **a close that still deletes a block** and **an open that restores only future days** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-30): Close = the `planDays` gate ONLY · **close ⇒ open ⇒ identical BY VALUE** (every table a close could touch) · blocks (past AND future), both reminders and the swap pinned UNAFFECTED · **a closed week STILL CHARGES, deliberately, pinned both ways** · what was removed and who asked for it: named · 🟠 **one data finding: weeks ALREADY closed under the old code** · **NO migration (65)** · **3655 / 0 normally and 3× DB-unreachable (0 failed queries)** · tsc 0 · **8 / 8 mutations bite**

## §1 The change: the status is read by the gate and by nothing that acts
- **`updateWeek`:** the status flip writes the week row only (`status`, `closedAt`).
  - No delete of the week's coach blocks on CLOSE, no re-sync on OPEN.
  - A week-level teacher / window change re-derives its hand-untouched days **on an OPEN or a CLOSED week alike.**
- **`syncCampDayRows`** no longer reads `week.status`: a closed week's coaches keep their blocks, and a sync on a closed week is **byte-for-byte the same result and the same writes** as on an open one (pinned by value).
- **`updateWeekDay` (the per-day swap):** the `409 CAMP_WEEK_CLOSED` is removed, so a closed week is swapped like an open one.
- **Reminders:** `campReminderInputs` takes every week covering the date, and `campReminderSends` no longer skips a CLOSED week, for coaches or families.
- **`deleteCampDayRows` removed.** Its only caller was the close.
- **Kept:** `planDays` refuses a non-OPEN week. It is the ONE writer of `camp_days`, reached from exactly two routes, both already driven by TASK-560's pins. Pinned: **it is now the ONLY `w.status !== "OPEN"` in the service.**

## §2 🔑 Reversibility, by value (`src/lib/camp-close-gates-new-only-task581.test.ts`)
- **The world:** a week spanning a PAST and a FUTURE day; both days' coach rows (with rates and a hand-edited window); **a PAST coach block** and two future ones; an ordinary booking; a child's ATTENDED past day and PLANNED future day.
  - The fake tx **applies** every update / delete it is asked for, so a stray write shows up as a changed VALUE, not a log line.
- **CLOSE:** every table deep-equal to before, except the week row, where only `status` and `closedAt` differ. The only write is `update:camp_weeks`.
- **CLOSE ⇒ OPEN:** **the whole world `toEqual` the snapshot**, the past block included (`closedAt` back to null, `onLeave` empty). The only writes are the two week-row updates.
- **The other paths on a CLOSED week:**
  - the swap passes the week check (it reaches the day lookup: 404 for an unknown day, not 409);
  - both reminders send (coach head count, family row).
  - The TASK-403 fixture now asserts the CLOSED week's coach and child ARE reminded, and that a coach on an open and a closed week gets both rows in one send.

## §3 ⚖️ Charging: **a closed week STILL CHARGES its existing days, deliberately**
- **Why:** Close stops new bookings only and **existing bookings stay**. A child already booked on a closed week's day is expected and runs that day, so the day-end cut consumes the day and BALANCE CAMP tells the family, exactly as for an open week.
- **This is now also consistent:** under the old close the family was charged but **not reminded**. Now they are reminded and charged.
- **Pinned both ways:**
  - by value, the cut marks a closed week's due day ATTENDED and consumes its units, through a tx on which **any** week read would throw;
  - by source, neither `cutCampDays` nor `notifyCampDeductions` names the week or a status.
- If the owner ever wants a closed week to stop charging, that is **cancelling the week's days** (with the refund of units), a different act (see §4).

## §4 What was REMOVED, and who asked for it
| removed | where it came from | wanted by the owner? |
|---|---|---|
| CLOSE deletes every coach block of the week, **past included** | TASK-418 (our camp-on-grid spec: *"wanted = ∅ when the week is not OPEN"*) | **No.** REQ-095 says nothing about closing; REQ-110 item 8 is the owner's only word on it, and it says *new bookings only* |
| OPEN re-derives the days (only FUTURE ones: the sync skips the past) | TASK-418 | No: it existed only to undo the delete above, and it could not |
| the per-day swap refused on a closed week (409) | TASK-418 | No |
| coach AND family reminders skip a closed week | TASK-403 (our reminder spec: *"per OPEN week"*) | No |
- **All four were engineering choices in our own specs, made before the owner defined Close.** No requirement asked for "camp off" in the wide sense.
- **If one is ever wanted, it is a different feature needing its own name**, e.g. *"Cancel the week"* = cancel its PLANNED days, return the units, tell the families, free the coaches. 🚫 It must not be a second meaning of the same switch.

## §5 🟠 FINDING, data: weeks ALREADY CLOSED under the old code (sid / uat)
- A week closed before this deploy **already lost its coach blocks** (future AND past), and after this change **reopening does not re-derive them** (that re-sync is gone, by design).
- **Consequence while such a week stays closed:** its coaches look **free** in the camp hours of its future days, so a session can be booked into them. Its reminders now send, correctly.
- **Past blocks:** calendar history only. **No backend report reads a camp block's rate today** (no pay report is built from blocks), so nothing is mis-paid. They cannot be recreated by the sync (it skips the past).
- **Repair for FUTURE days exists already, per day:** any per-day edit of that day runs the ONE sync. A one-off script (dry-run by default) over those days would be ≈20 lines. **Your call, not built.**
- **To see them (read-only, run by nobody here):**
```sql
-- Q-581 · days of CLOSED camp weeks that have NO coach block (the old close's deletions), future first. Read-only.
SELECT w.id AS week_id, w.name, w.closed_at, wd.date, count(b.id) AS blocks
FROM camp_weeks w
JOIN camp_week_days wd ON wd.camp_week_id = w.id
LEFT JOIN bookings b ON b.camp_week_day_id = wd.id
WHERE w.status = 'CLOSED'
GROUP BY w.id, w.name, w.closed_at, wd.date
HAVING count(b.id) = 0
ORDER BY (wd.date >= CURRENT_DATE) DESC, wd.date;
```

## §6 📌 For @Fern (FE, read only, not changed)
- **`bannerWeeksFor` (`lib/camp/units.ts`) shows only OPEN weeks**, so the calendar banner hides a closed week's day even though its children still come.
- **Correctly OPEN-only:** the sell dialog's week list and the roster's redeem button (the gate).
- There's no *Open* button beside *Close* in `CampContent`; the server has always accepted `{ status: "OPEN" }`.

## §7 Checks
- Suite: **3655 / 0** (3648 + 7 new). **DB-unreachable 3×: 3655 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration.**
- **Existing pins updated, only for this:**
  - TASK-418's lifecycle and swap pins now assert the ABSENCE of the cascade and of the 409;
  - the sync-caller count goes 4 → 3;
  - two region anchors moved off the removed `deleteCampDayRows`;
  - TASK-403's reminder fixture: the closed week's own coach, now reminded;
  - the reminder-input pin: no `"OPEN"`.
- **Fixed on the way:** my new by-value sync comparison compared `new Date()` stamps, and failed once in ~6 runs on a millisecond. Normalised; 5/5 stable after.
- **Mutations with `bun run mutation:run`:** baseline 56, measured; CHECKSUM identical; every restore byte-identical:
  - **C1, a close that still deletes a block:** BITES.
  - **C2, an open that restores only future days** (the old pair restored verbatim): BITES.
  - **C3, the sync reads the status again:** BITES.
  - **C4, the swap refused on a closed week:** BITES.
  - **C5, the coach reminder skips a closed week:** BITES.
  - **C6, the parent reminder skips a closed week:** BITES.
  - **C7, a closed week stops charging:** BITES.
  - **C8, the gate removed:** BITES.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · 🟠 **one data finding to the owner**
Verified by me: **3655 / 0** (and 3× unreachable) · tsc 0.

## 🔑 Reversibility proven BY VALUE, which is the property the old version failed
**A world with past AND future blocks, coach rows and children's days, on a fake tx that APPLIES writes ⇒ close ⇒ open ⇒ `toEqual` the snapshot, the PAST block included, and the only writes are two week-row updates.**
✅ **"The only writes are two week-row updates" is the half that makes it airtight** — *not "it looks restored", but "nothing else was ever touched".*
✅ **And `w.status !== "OPEN"` survives EXACTLY ONCE, at the gate, pinned.** 🔑 *One reader of the status is how "Close means one thing" stops being a promise.*

## ⚖️ A closed week still CHARGES — **right, and it closes the asymmetry that made the old version indefensible**
**Its existing days run, so they charge. Pinned by value and by source.**
🔑 **The old Close stopped TELLING people while it kept TAKING their days. Now families are reminded AND charged.** ⇒ **The two halves match again, which was the actual defect** — *not that it charged, but that it charged silently.*

## ✅ "What was removed, and who wanted it" — answered exactly as asked
**The block delete, the reopen re-sync, the swap 409 and the reminder skip were OUR OWN spec choices (TASK-418, TASK-403) — not the owner's.**
🔑 **And "camp off" in the wide sense already has a name: Cancel the week.** ⇒ **A separate feature, not a shared switch.** 📌 *That is the answer I wanted: the wide behaviour was never asked for, and the thing that does want it already exists.*

## 🟠 The data finding — **raised to the owner, and it is not cosmetic**
**Weeks closed BEFORE this deploy already lost their coach blocks, and reopening no longer re-derives them** ⇒ **their coaches look FREE in those hours.**
🔴 **A coach who looks free when they are not is a double booking waiting to happen** — ⇒ **this is worth more than a note.**
⚖️ **Ruled: the read-only count goes up FIRST, and the number chooses the fix.** 🔑 **Same discipline as TASK-553's backfill: get the number, then decide — and "a few" versus "many" is whether a human can check each one.**
- **A handful ⇒ a per-day edit already re-syncs a future day; an admin can do it.**
- **Many ⇒ the ~20-line script, dry run first, and the owner runs it.**
🚫 **No agent runs either.**

## 📌 Carried to @Fern
**The calendar banner hides closed weeks (`bannerWeeksFor`).** ⚠️ **With Close now meaning only "no new bookings", hiding the week may be wrong** — **into item 8's screen task.**
