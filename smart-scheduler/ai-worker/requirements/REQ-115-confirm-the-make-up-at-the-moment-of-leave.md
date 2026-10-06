# REQ-115: confirm the make-up at the moment of leave (`extended-confirm` / `extended-waiting`)
- **Source:** the OWNER, 2026-10-06, from his own screenshot of an unconfirmed `ขยายคาบ` session. `[owner-asked]` 🔑 *The customer reported a symptom ("ลาคาบ extended จากริชเมนู ผปค อยู่อันไหน"); the owner found the cause behind it.*
- **Status:** ⚖️ **RULED — build this round.** Owner, 2026-10-06: *"สัปดาห์นี้"*, then *"ตามนั้น"* on every correction below.
- **Sizing:** @Sober — **shape B ≈ S (1 day) + the waiting list S** ⇒ **≈ 2 days.** Team A block **690–719**.

## 1. The defect this exists to kill
**An auto-created make-up (`EXTENDED`) is born UNCONFIRMED, and that single fact causes four separate harms:**
1. **The family is never told the date.** The confirmation is their ONLY message about it — the leave reply stopped carrying it after an earlier wording decision.
2. **The family cannot take leave on it.** The parent's LINE leave list shows `CONFIRMED` only (`checkin.service.ts:179`) ⇒ *they cannot be absent from the class we owe them.*
3. 🔴 **It is never checked in.** The end-of-day job reads `CONFIRMED` only (`jobs.service.ts:83`) ⇒ the day passes, **the course still counts the class as owed, and the family is owed it forever.** ⚠️ **The coach's time WAS reserved from creation, so the class may genuinely have happened in the room.**
4. **Nothing surfaces them.** `Needs attention` looks at today/tomorrow only and does not count extended rows as unconfirmed at all ⇒ **the calendar is the only place.**
🔴 **And `REQ-112` multiplies it:** today a leave beyond the allowance gets no make-up; **from this round every leave gets one.**

## 2. ⚖️ OWNER RULINGS — all IN FORCE
| # | RULING | what it forbids |
|---|---|---|
| **1** | **SHAPE B — ask RIGHT AFTER the leave.** The result shows **the make-up just created, with its REAL date**, and two buttons: **`ยืนยัน + แจ้งเตือน Line`** / **`ไว้ก่อน`**. | 🚫 **No pre-click preview of a PREDICTED date** (shape A) — another booking can invalidate it while the admin reads it. ⚠️ **Accepted cost, stated not glossed: B can confirm or defer, it cannot ABORT the leave.** 🔑 *A recoverable gap beats an unrecoverable lie.* |
| **2** | **Doors that cannot ask default to `waiting`** — the parent's LINE door (⭐ and the coach's own cancel). **Confirming notifies the COACH, and that is staff's act.** | 🚫 A parent may never cause a coach to be committed |
| **2b** | 🔴 **BUT the parent's leave reply MUST tell the family the make-up is being arranged, or name the proposed date.** | 🚫 **Do not ship silence to the party who just acted.** 🔑 ***Telling the family and booking a coach are two different acts; today they are welded together.*** **This is COPY, not a confirmation.** |
| **3** | **A `waiting` make-up on its day must be SURFACED and RESOLVABLE** — an admin can check it in late or mark it not taught. | 🚫 A list that only accumulates — *that is a second place not to look.* 🚫 **Never let the day pass silently: the question is CONSUMPTION, not visibility.** |
| **4** | **The WAITING list is MANDATORY, not optional.** | 🔑 **@Sober's per-door table proved it: at least one door can NEVER ask, so waiting rows exist under every version of the design.** |

## 3. Per-door table (@Sober, read in code 2026-10-06) — **who can even be asked**
| door | asked? |
|---|---|
| **1a** parent, LINE | 🚫 **never** ⇒ `waiting` + ruling 2b's copy |
| **2** plan editor `Mark absence` | ✅ yes (it already has a dry run) |
| **3a** coach's own leave | ⇒ `waiting` (owner took @Sober's recommendation) |
| **3b** admin records the coach's leave | ✅ yes — **ONE question for all the make-ups it creates** |
| **4** admin cancels a course session | ✅ yes |
| **5** a group date cancelled | ✅ yes — one question for all seats |
| 6 / 8 course creation · start-date re-plan | 🚫 out — not a leave; they follow the course's own confirm |

## 4. Gates
- 🔴 **It touches the leave act `TASK-656` is changing** ⇒ **cut it AFTER `656`/`657`, as its own visible task.** 🚫 Never folded in silently.
- **Build days: MON 12** (`PLAN-round-to-2026-10-14.md`), sid batch #3 TUE 13, uat WED 14.
- **Ruling 2b's wording goes into the round's ONE copy set for the owner.** 🚫 Nothing ships on a draft.

## 5. Open, and not blocking the build
- **The read-only count on uat** (`DATA-REQUEST-unconfirmed-makeups-uat-2026-10-06.md`) — ✅ owner said yes. 🔴 **`past` > 0 means harm 3 is already in real data**, and that number may create a separate repair item. 🚫 It does not change this design.

---

# 🔴 2026-10-06 — THE WHOLE DESIGN IS REPLACED. **The customer said what she actually wants, and it is simpler than everything above.**
⚖️ **Owner: "อ่ะ แก้ใหม่ ตามนี้ ง่ายขึ้นเยอะ."** **Everything in §2's table above is SUPERSEDED — kept, not deleted, because the reasoning that got us here is what made her answer legible.**

## Khwan, verbatim (via the owner, 03:22)
```
มันไม่ได้อยู่ที่ปุ่ม confirm อยู่ไหนค่ะ
จริงๆ เราสามารถทำให้มันเป็นคลาสปกติได้เลย อาจจะใช้ป้ายสีม่วงได้เพื่อแสดงว่าเป็นคลาสที่งอกออกมา
แต่การกระทำที่เหลือควรจะเหมือนคลาสปกติ ในที่นี้คือ
1. มีการแจ้งเตือนมีคลาสปกติ โดยไม่ต้องไปกด confirm อีก ถ้าเราคอนเฟิร์มทั้งคอร์สไปแล้ว
2. ลาได้ปกติเหมือนคลาสทั่วไป ถ้ายังอยู่ในอายุคอร์ส

เพราะถึงเราจะมีการคอนเฟิร์มที่มันง่ายขึ้นมา แต่สุดท้ายคอนเฟิร์มก่อนน้องมาเรียนได้แค่ 1 วันค่ะ …
เพราะคลาส extended มักอยู่ท้ายคอร์สที่เรายังไม่ได้คอนเฟิร์มให้ … เราไม่สามารถทำให้กดลาคาบ extended ได้หรอกค่ะ
```
**Owner → her: "ขวัญอยากให้การงอกคลาสมาชดเชยจากลาพวกนี้ เป็น confirm แบบ auto 100% ถูกมั้ยครับ"** → **Khwan: "ถูกค่ะ ขวัญเคยบอกแล้ว"** · and on what she needs from it: **"แค่ต้องการแจ้งเตือน"**

## 🔑 Why every version above was solving the wrong problem
**We spent the night designing WHO PRESSES CONFIRM and WHEN. She does not want a confirm step at all.**
**Her argument is the one none of us made:** ⭐ **a make-up sits at the END of the course, in the stretch that has not been confirmed yet — so "confirm it before its day" can only ever happen about a day ahead, and a parent who needs to take leave on it two weeks out still cannot.** ⇒ ***Making the confirm easier does not fix the thing the confirm was blocking.***
📌 **And the record shows we built it this way on purpose:** she says *"เหมือนพี่โด้งบอกว่าต้องมาคอนเฟิร์มเองเพราะเรื่องการแจ้งเตือน"* — **so the rule we are now removing was once a deliberate answer to a notification worry.** 🔑 *That worry must be named and re-answered, not silently dropped.*

## ⚖️ THE RULINGS NOW IN FORCE
| # | RULING | note |
|---|---|---|
| **N1** | **A make-up is a NORMAL CLASS. It is created CONFIRMED — no human confirm step.** | replaces shape A/B and the ask-at-leave question entirely |
| **N2** | **It carries a badge (purple) showing it is an added class.** | ⚠️ the `ขยายคาบ` badge already exists — ▶️ confirm whether anything new is needed at all |
| **N3** | **It sends the normal class notification, without anyone pressing confirm** — ⚠️ **her condition: `ถ้าเราคอนเฟิร์มทั้งคอร์สไปแล้ว`** | ▶️ **so auto-confirm is CONDITIONAL on the course itself being confirmed. @Sober: is that a state we can read?** |
| **N4** | **It can be taken leave on, like any class, while the course is still within its validity.** | ⇒ **harm 2 dies by construction: the parent's LINE list shows `CONFIRMED` only, and these now ARE confirmed** |
| **N5** | 🚫 **The WAITING list, the `extended-waiting` state, the per-door question and rulings 2/2b/3/4 above are all DROPPED.** | **There is nothing left to wait for.** |

## 🔴 THE ONE THING THAT COULD MAKE "ง่ายขึ้นเยอะ" FALSE — must be answered before a line is written
**@Sober's own finding, 2026-10-06:** **the plan engine trims only `EXTENDED` make-ups** (`course-plan.ts:303`, *"newest-dated LIVE EXTENDED first"*); **a `CONFIRMED` make-up is NEVER trimmed.**
⇒ 🔴 **If every make-up is born CONFIRMED, the engine can never trim ANY make-up again.** **When a plan shrinks — an Undo, a cancelled leave, a plan edit — the mechanism that removes the surplus class stops existing.**
▶️ **This is not a reason to refuse her design. It is the thing that design must replace.** **@Sober: what takes over the trim, and what does an over-planned course do on the day this ships?**
📌 **It also lands on `REQ-114 (iii)` next week, whose whole ruling is "keep the earliest make-up and DROP the latest".**

## ⚖️ 2026-10-06 03:39 — **N3 CORRECTED BY THE CUSTOMER, agreed in writing with the owner**
```
เปิดคอร์ส ยังไม่คอนเฟิร์มทั้งคอร์ส · มีการกดลา / ลาล่วงหน้า ⇒ คลาสที่งอกออกไป คอนเฟิร์มอัตโนมัติ
รวมถึงคอร์สที่คอนเฟิร์มทั้งคอร์สไปแล้ว ⇒ ก็คอนเฟิร์มอัตโนมัติ
แต่ยังมีสัญลักษณ์แสดงว่าเป็นคลาส extended อยู่เหมือนเดิมนะคะ
```
🔴 **IN FORCE: a make-up is born `CONFIRMED` in BOTH cases — including inside a course whose other sessions are still `PENDING`.**
🚫 **SUPERSEDED: @Sober's N3 ("course not confirmed ⇒ the make-up is born `PENDING`") and @Porter's recommendation of it.** 🔑 *His principle — "no make-up is announced before the course it belongs to" — was sound; the customer overruled it knowingly, for an operational reason she stated: it ends pressing confirm for a child every day, and it ends parents being unable to take leave.*
✅ **N2 (the badge) is confirmed by her as a REQUIREMENT, not an option.**
▶️ **Open with @Sober: does a CONFIRMED class inside a PENDING course break the course-confirm flow, the awaiting-re-confirm count, the reminder or the day-end — a state the system may never have seen?**
