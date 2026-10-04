# REQ-113 — the **LAST** badge disappears from the schedule once the session is checked in (2026-10-04)

- **Source:** customer **Khwan**, via the owner, 2026-10-04, with three screenshots. `[customer-asked]`
- **Status:** 🔴 **INTAKE. Not sized, not cut, nobody is building anything.** 🚫 **Not in the sid batch.**

## 1. Verbatim
```
กล่อง Last หายไปจากหน้าตารางหมดเลยค่า
ไม่ควรหายนะคะ
หายไปตอนตัด check in แล้วค่ะ
เพราะตอนเย็นทีมแอดมินจะมาดูว่าใครหมดบ้าง เพื่อตามขอ feedback ครูค่ะ
```

## 2. Porter's plain restatement
**The schedule marks a course's FINAL session with a `LAST` badge** (it is in the grid's own legend: `LAST  last session of the course`).
🔴 **The badge disappears the moment the session is checked in / marked attended.** ⇒ **By the evening — which is exactly when the admin team looks — every course that finished that day shows no marker at all.**

## 3. 🔑 WHY it matters — this is a WORKFLOW, not a decoration
**Khwan's reason, in her words: *"ตอนเย็นทีมแอดมินจะมาดูว่าใครหมดบ้าง เพื่อตามขอ feedback ครู"***
⇒ **The badge is how the admin team finds, at the end of the day, which students finished a course — so they can collect feedback on the coach.**
🔴 **The badge vanishing precisely when the day's work is done makes the marker useless for the one job it is used for.** 📌 *A flag that is correct all day and absent at review time is worse than no flag: the team believes they are looking at a complete list.*

## 4. Evidence held
**`project-docs/customer-2026-10-04/`** (owner's screenshots, 3):
1. **The Daily grid, Sun 4 Oct 2026** — `Aileen` at 12:00 with Tarb reads *"Course · Private INLINE SKATE"* with **NO `LAST` badge**, although the legend above defines one.
2. **`Aileen — plan`** — **10-session course, `COMPLETED`**, `Leave 1/3`, **"No upcoming sessions"**; the final row is **Sun 04/Oct/26 12:00, Tarb, ATTENDED**. ⇒ ✅ **That session WAS the last one, and it IS attended.**
3. The LINE conversation above.

## 5. ⚠️ Open questions — 🚫 NOT answered here, and nobody may assume them
1. **Is the badge computed from "sessions remaining" (so attendance makes it 0 and the test stops matching), or from an explicit flag?** ⇒ **SA's to answer from the code, not ours to guess.**
2. **Should the badge persist AFTER attendance, or should the review use a different surface entirely** — e.g. a list of courses that completed today? 🔑 **Khwan asked for the badge back, but what she described is a REPORT.** ▶️ **The owner decides which he is buying.**
3. **Does the same disappearance affect the WEEKLY view and the daily report?** 🚫 **Unverified.**

## 6. Routing
**The calendar grid is TEAM B's area this batch** (`CalendarGrid.tsx`, `CalendarWeekGrid.tsx`, `CalendarContent.tsx`). ⇒ **Sized by @Silver.** ⚠️ **If the cause turns out to be a BACK-END field rather than a display rule, it comes back to @Porter before it crosses to Team A.**

## 7. ⚖️ OWNER RULINGS, 2026-10-04 — **"ก ตามแนะนำ no_show ติดป้ายด้วย"**
1. ✅ **OPTION 1 ONLY: the `LAST` badge STAYS after attendance.** 🚫 **No "who finished today" list this round** — it stays available and nearly free once Option 1 ships.
2. ✅ **A `NO_SHOW` on the final date KEEPS the badge.** 🔑 **The purpose is chasing coach feedback on a course that has ENDED, and a course whose last session the family missed has still ended.**
3. ⚠️ **Accepted consequence, stated to him before he ruled: the badge becomes PERMANENT on that cell** — looking back at any past week still shows it. **That is intended, not a side effect.**

## 8. 📌 What this ruling actually overturns
🔴 **It is NOT a bug report against the owner's spec — it reverses a TEAM assumption.** **`REQ-089` item 5 asked for a large admin-facing `LAST` badge on the schedule; it never asked for the badge to be removed at attendance.** **TASK-366 added that reading, wrote it into the function's comment and PINNED it in `course-last-badge-req089.test.ts:54-58`.**
⇒ ▶️ **That pin must be CORRECTED and re-pinned to this ruling, citing REQ-113 — 🚫 never deleted.** 🔑 *A deleted assertion looks like it was never there; a corrected one records what we used to believe and why we stopped.*

## 9. Routing — @Porter's ruling
**TEAM A, WHOLE.** **The cause and the fix are back-end (`scheduler.service.ts`, Team A's, plus `lib/course-plan.ts`, unclaimed → claimed to Team A for this item).** ✅ **Option 1 needs NO front-end change at all**, so nothing crosses to Team B and the item is not split.
🚫 **Not in the sid batch. Sized only. @Sober cuts it when the batch is closed.**
