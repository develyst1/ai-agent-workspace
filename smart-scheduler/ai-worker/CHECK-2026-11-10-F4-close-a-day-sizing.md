# CHECK 2026-11-10: F4 "close a day", concepts A and B sized (for the price; nothing built)
Sector (SA, Team C), for Porter. Reads `requirements/CONCEPT-F4-close-a-day-2026-11-10.md` against SB `dong` @ `77a4262`.

## Summary
| | **B: mark + block + list + daily reminder** | **A: preview → one click (auto)** |
|---|---|---|
| BE | **≈ 1.5 d** | **≈ 3.5 d** (incl. B's foundation) |
| FE | **≈ 1.25 d** | **≈ 2.5 d** (incl. B's foundation) |
| **Total** | **≈ 2.75–3 d** | **≈ 6 d** standalone · **≈ +3 d on top of B** |
| Risk | low–medium (one new rule on every write path that places a class) | medium–high (bulk cancels + a new per-family message) |
| Needs first | TASK-946 (F5) | TASK-946 + **TASK-947 (F2)** |

**Porter's "≈ 4 d" for A is low.** Three parts of A are new code, not reuse:
- one LINE message per family (today every cancel sends its own);
- the per-family preview text with its opt-out;
- a trial "we will contact you" message.

## What both share: the closed-day foundation (inside B's numbers)
- **Record:** a `closed_days` table (date, reason, scope `ALL`, actor, created_at). One additive migration; I apply it on sid.
- **The block** must cover **every** place a class lands, not only "new bookings":
  1. create a booking / course / voucher session (`insertBooking`, the one inserter);
  2. move a session (`moveBooking`) and the plan editor's moves (`planCourseMoves`);
  3. the make-up date search (`findFreeExtensionDate :3140` / `firstFreeWeeklySlot`), which then skips the date;
  4. **the group-series extender job** (`/internal/jobs/group-series-extender`, `routes/internal.ts:123`), which creates future group sessions by itself. **The concept misses this one.**
- **Refuse** with a clear 409 `DAY_CLOSED` and the date + reason, never silently skip (except in the make-up search, which moves on to the next free week).

## B: corrections against the code
- **"One daily admin reminder" already has a home, so no new job is needed.** Add ONE attention check, "classes on a closed day" (`attention.service.ts`, `ATTENTION_CHECKS`).
  - It shows in the **in-app Attention panel** and **automatically in the existing 08:00 admin LINE digest** (`runDailyDigestJob :298` → `notifyAdmins`, `line-admin.ts:59`): one message, only when something is outstanding, once per day.
  - It stops by itself when the list is empty or the date has passed. That's how the other checks already behave.
- **"The per-class actions that exist today":** they do (move · cancel as «ปัญหาจากทางเรา» · leave). Each sends exactly what it sends today; nothing new goes to parents. ✔
- **The "classes on closed days" list** can be the attention check's own item list (it already links each item to its booking). A separate page is optional (+0.25 d FE).

**B sizes:**
- **BE ≈ 1.5 d:** table + migration 0.25 · mark / unmark routes 0.25 · the block on the 4 entry points 0.75 · the attention check 0.25 · tests.
- **FE ≈ 1.25 d:** mark / unmark a date or range with a reason 0.5 · the list via the Attention panel 0.25 · the "วันปิดทำการ" badge on the calendar 0.5.

## A: corrections against the code
1. **"One LINE per family, even with several children":** new. Today each cancel enqueues its own parent copy. A needs a new message kind (one per family, listing every moved class with its new date), and it must **suppress** the per-cancel messages inside the bulk run. That's the biggest piece (≈ 1 d BE).
2. **The per-family preview text + its opt-out tick:** the same new message, rendered in the preview and honoured on confirm (FE ≈ 0.5 d, BE in item 1).
3. **Trial "we will contact you":** a new text. Today a trial cancel sends the normal cancel message, and only if the trial was CONFIRMED / EXTENDED (`:3627`); a PENDING one sends nothing.
4. **ECA / Camp:** ECA isn't in SB's bookings at all; it lives in the back office as revenue. So it can't be "ticked in". Camp days are their own tables (`camp_days`), not bookings. **Drop both rows from A's table**, or treat camp as a separate later item.
5. **Park rental / OTHER blocks:** cancelling is fine, and no family is attached to an OTHER block anyway.
6. **A make-up already scheduled on the closed day:** it re-grows correctly only with **TASK-946** (the same-date bug), plus the closed-day block in the search.
7. **Pending courses:** "cancelled silently" holds only once **TASK-947 (F2)** is in. Today a PENDING session's cancel is already quiet (`:3627`), but its re-grown make-up is born CONFIRMED and **messages the parent**.
8. **Coach notices:** the per-cancel coach notice exists today; in a bulk run it should also be **one per coach**, not one per class (≈ 0.25 d).

**A sizes on top of B:**
- **BE ≈ 2 d:** a preview endpoint 0.5 · a bulk apply (one transaction, the existing cancel per row with `SCHOOL_ISSUE`) 0.5 · one message per family / per coach + suppressing the per-row ones 1.
- **FE ≈ 1.25 d:** the preview screen with ticks, per-family text and totals 1 · the confirm + summary 0.25.

**Plus ≈ 0.25 d of tests on the bulk run.**

## Recommendation (SA)
**Offer B first (≈ 3 d).** It answers her ask with low risk, needs no F2 dependency, and A builds on the same record, block and list later (+≈ 3 d). If A is sold, it ships only after TASK-946 + 947 are live and passed.
