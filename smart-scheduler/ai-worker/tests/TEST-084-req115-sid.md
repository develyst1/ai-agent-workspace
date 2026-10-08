# TEST-084: REQ-115 gate on sid, the tip (back `b782c77` / front `f60d7e7`, `0066` migrated green) · 2026-10-07 23:20–23:55

**Tester:** Tanya (QA) · sid · headless + the QA phone (parent 0899990763 = QAChatOne's family, TH) · Evidence `project-docs/qa-2026-10-07/115-*.png`
## Verdict: 🔴 **FAIL: 1 finding (F1, the family is not told when Undo cancels a CONFIRMED make-up).** Everything else PASSES.

| check | seen | |
|---|---|---|
| **Build identity**: the RUNNING code is the tip | the booking DTO carries **`isMakeup`** (a live GET), so not inferred from the migrate | ✅ |
| **A NEW make-up is born CONFIRMED + marked** | fresh 6-session course `4706c2ef` (QAChatOne, qatt75b, Mon 16:00 from 05/10, session 1 attended); Record leave on 12/10 ⇒ make-up **16/11 `CONFIRMED`, `isMakeup=true`** | ✅ |
| 🔔 **The family gets the normal confirmed message** | the QA phone: *"📅CONFIRMED SCHEDULE: Student : QAChatOne · Program : Private SURFSKATE 6 HR · Date : 16-11-2026 · Time : 16:00-17:00"* | ✅ `115-1-phone-new-makeup.png` |
| …and the coach | ⚪ not observable: qatt75b has no LINE | ⚪ |
| **An EXISTING unconfirmed make-up stays unconfirmed** (forward-only) | C4 `92ef88f7`: 02/11 and 09/11 still **`EXTENDED`**, now `isMakeup=true` (the backfill marked them) | ✅ |
| **The «ขยายคาบ» badge (703)** | plan row 16/11: *"ยืนยันแล้ว · **ขยายคาบ**"*; old row 02/11: *"ขยายคาบ"* | ✅ `115-2-plan-*.png` |
| **The grid mark (722)** + **no clipping** in a short week slot | day + week 16/11: the cell reads *"QAChatOne · LAST · **ขยายคาบ** · คอร์ส…"*; the week cell is BLUE (confirmed) with the purple «ขยายคาบ» chip; content height = visible height (day 79/79, week 68/68) | ✅ `115-3-calendar-*.png` |
| **The TRIM still removes a make-up** (via Undo of the leave) | `POST /bookings/db87b2ce/undo` ⇒ 200, the 12/10 class back to CONFIRMED, **the make-up 16/11 ⇒ `CANCELLED`** (still `isMakeup=true`) | ✅ data |

## 🔴 F1: Undo cancels a make-up that was ANNOUNCED to the family, and the family is never told
- **Seen:** the family received *"📅CONFIRMED SCHEDULE … 16-11-2026 16:00"*. The admin's Undo of the leave then cancelled that make-up. **25 minutes later the phone has no cancel message.** The family still holds a confirmed class that no longer exists, and may turn up. `115-4-phone-trim.png`
- **Why (code, read only):** `undo.service.ts` ≈ :165–170 sends the cancelled make-up's notice **to coaches only**, by design: *"🚫 Never the family"*. That was right when a make-up was born EXTENDED (unannounced). **REQ-115 now announces it at birth, so the silence is wrong.** It is the same shape TASK-702 §3c fixed for the TRIM ("Today it cancels unannounced rows silently; that silence becomes wrong"), on the **Undo door**, which §3c's reader list does not name.
- **Not checked:** the reconcile TRIM's own family notice (§3c) on a non-Undo path. I used Undo as the trim trigger; the plan's re-plan trim needs a different fixture.
- **Severity:** family-facing, on uat as soon as REQ-115 ships. 🔴 **REQ-115 to uat should wait for this, or ship with a known-issue line. Owner's call via Porter.**

## Footprint
Course `4706c2ef` (QAChatOne) kept; its 16/11 make-up is CANCELLED by the test. Nothing on uat.
