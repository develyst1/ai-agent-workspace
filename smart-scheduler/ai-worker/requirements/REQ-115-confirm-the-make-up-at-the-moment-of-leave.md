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
