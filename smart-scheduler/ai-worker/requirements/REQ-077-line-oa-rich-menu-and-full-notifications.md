# REQ-077: LINE OA จริงจัง — rich menu + ใช้ตอบลูกค้า + แจ้งเตือนให้ครบ (owner's **REQ-014**)

- Status: **DRAFT — captured, NOT `READY_FOR_SA`.** The customer still owes the notification list.
- Priority: TBD
- Requested: 2026-08-30 by the owner, relaying the customer
- Deadline: none stated

## Problem / Goal

The owner's words, verbatim:

> *"เรื่องไลน์ อยากให้จริงจัง ทำเข้า line จริงด้วยที่สร้างใหม่ให้ ใช้ rich menu เราได้เลย แต่ลูกค้าจะใช้ในการตอบลูกค้าด้วย
> อยากให้ทำให้รองรับ และทำเรื่องการแจ้งเตือนให้ครบ … เดี๋ยวลูกค้าจะแจ้งมาว่ามีแจ้งเตือนอะไรบ้าง"*

Three separate asks that happen to share the word "LINE":

1. **Move onto the customer's real LINE OA** (a newly created account), using our rich menu.
2. **The customer's staff will also answer customers by hand in that same LINE account** — so whatever we build
   must not get in the way of a human replying.
3. **Complete the notification set.** The owner already named gaps: notify the customer when something is
   **paused** (a course, or a session under REQ-076); a **daily** message covering how the course is going and
   **how much leave quota is left**; and the same for **vouchers**. **The customer will send the full list.**

## 🔴 The fact that decides whether any of this is worth building

**LINE reach today on `uat`: 2 of 20 teachers, and 0 of 180 parents** (`PROJECT-STATUS.md`).

⇒ **Every parent-facing notification in this REQ currently reaches nobody.** The parent half of REQ-072 already
shipped and reaches nobody for exactly this reason. The owner has twice parked the linking problem
(*"ยังไม่ผูกช่างมันไปเถอะ"*), which was a reasonable call when notifications were a side feature — **this REQ makes
it the main feature.**

**Porter's position, for the owner to accept or overrule:** getting parents linked is not a sub-task of this
REQ, it is its **precondition**. Building a full notification set before it is a working system that is silent
in production, and we would have no way to tell the difference.
⚠️ And it interacts with a standing constraint: **do not run a campaign at 180 families** without deciding how.

## 🔴 The owner's correction, 2026-08-30 — this reframes the whole REQ

> *"เราต้องมาดูกันด้วยว่าเราทำให้มันตรงใจเขามั้ย เพราะที่ทำมามัน **'อาจจะ'** นะ เพราะฉันรู้สึกเหมือนจะทำให้เขาทำบนไลน์
> เป็น **full line bot** ไปเลย ไม่มีคน แต่ความจริงคือ **admin เขาจะสิงไลน์นั้นแหละ ไปตอบลูกค้า** และมันทำให้เราอาจจะต้อง
> มา design อะไรอีกเพิ่มให้ลงตัว"*

**What he is saying:** everything we have built so far assumes LINE is a **machine talking to parents**. The
customer's reality is a **human sitting in that account all day, replying to families.** The bot is not the
product; it is a colleague sharing the same inbox.

⚠️ **This is not a new feature request — it is a warning that existing work may be aimed slightly wrong.**
He said *"อาจจะ"* on purpose: he is not asserting it is wrong, he is refusing to assume it is right.
⇒ **Before anything is built here, the existing LINE behaviour must be re-examined against "an admin lives in
this account"**, not just extended. Concrete things that change meaning under that lens, and that Porter should
put in front of him rather than answer alone:
- **A rich menu occupies the screen the admin is typing into.** Whose turn is it?
- **Auto-replies can answer a question the admin was already answering** — or worse, contradict them.
- **Notifications arrive in the same thread as the human conversation**, so a burst of system messages buries a
  parent's real question.
- **"Which of these did the system say and which did I say?"** — an admin cannot answer that today.

## ✅ The customer's notification list — ARRIVED 2026-08-30, verbatim

> **แจ้งผปค**
> 1. คอนเฟิร์มทั้งคอร์ส
> 2. แจ้งเตือนมีคลาสรายวัน / วันนี้มีคลาสเรียนนะ
> 3. check in เข้าเรียน + รายละเอียดคอร์สเหลือกี่ครั้ง
>    / น้องรดาเข้าเรียน วันที่ ..... / คอร์ส....... / ครู....... /
>    คอร์ส 6 ครั้ง เหลือ 4/6 **หรือ** คอร์สคงเหลือ 2 ชม / วันหมดอายุ...........
>
> **แจ้งครู**
> 1. คอนเฟิร์มทั้งคอร์ส + คลาสรายครั้ง
> 2. แจ้งเตือนตารางสอนรายวัน
> 3. แจ้งเตือนเด็กลา

### 🔍 Gap analysis — 5 of the 6 already exist. **ONE is genuinely new.**

This is the headline: the notification half of REQ-014 is **far smaller than it reads**, because most of it
shipped between 08-22 and 08-29 and the customer has not seen it yet (see the reach problem below).

| # | Ask | What exists today | Verdict |
|---|---|---|---|
| ผปค-1 | คอนเฟิร์มทั้งคอร์ส | REQ-072 — bulk confirm sends LINE **to the parent as well**, carrying the leave dates | ✅ exists |
| ผปค-2 | คลาสรายวัน *"วันนี้มีคลาสเรียนนะ"* | REQ-072 part 3B — `sm-daily-reminder` **08:15**, one message per person, idempotent per day | ✅ exists |
| **ผปค-3** | **check-in + เหลือกี่ครั้ง + วันหมดอายุ** | REQ-050 AC-3 names **child + session time only**. The remaining count, the teacher, the program and the expiry are **not in any check-in message** | 🆕 **NEW — this is the real work** |
| ครู-1 | คอนเฟิร์มทั้งคอร์ส + คลาสรายครั้ง | REQ-072 (course) + REQ-007/TASK-219 (single booking, incl. the note) | ✅ exists |
| ครู-2 | ตารางสอนรายวัน | the same 08:15 job; readability fixed by REQ-067 part B / FIX-004 | ✅ exists |
| ครู-3 | แจ้งเตือนเด็กลา | REQ-049 — admin always, teacher optional | ✅ exists |

🔴 **"Exists" here means BUILT, and on this project that is not the same as working.** Two of the five carry
`PROJECT-STATUS.md` known-unverified flags that this REQ inherits and must not paper over:
- **A scheduled 08:15 run has never been watched actually delivering** (ผปค-2 and ครู-2 both ride on it) —
  our own tests consumed the day every time.
- **REQ-049's firing was never re-verified** (ครู-3).
⇒ Before we tell the customer "you already have five of these", **Tanya should watch the 08:15 job deliver once.**
That is a QA task, not a build task — and it is the cheapest thing in this whole REQ.

### 🔴 And the reason the customer has not noticed any of them

**0 of 180 parents are LINE-linked.** ผปค-1 and ผปค-2 have been live for days and have reached **nobody**.
The customer is asking for notifications they may already own. **Linking is the deliverable here, not the
messages.** See the section above — this is now confirmed by the customer's own list, not just Porter's argument.

## Acceptance Criteria

🔴 **Not written yet**, but only ONE blocker remains rather than three: the customer's list has landed, so ผปค-3
can be specified as soon as its one open question (below) is answered. Items 2 (staff answering by hand) and the
owner's human-plus-bot design conversation still gate the **rich-menu / OA-move** half of this REQ, not the
notification half. **Porter's recommendation: split this REQ** — the notification work is ready to move and the
OA/rich-menu work is not.

## User-facing wording (Porter, UX writer) — the check-in message

The customer wrote the template themselves, so it is theirs, not ours to redesign. Their shape:

```
น้อง<ชื่อเล่น>เข้าเรียน วันที่ <วันที่>
คอร์ส: <ชื่อคอร์ส>
ครู: <ชื่อครู>
คอร์ส 6 ครั้ง เหลือ 4/6      ← or: คอร์สคงเหลือ 2 ชม
วันหมดอายุ: <วันที่>
```

📌 **Nickname, not full name** — the customer wrote *"น้องรดา"* themselves, which happens to match the standing
PII rule (TASK-047). Worth noting to them as agreement, not as a constraint we imposed.

## Constraints (known today, not guesses)

- A **new** LINE OA means new channel credentials, a new webhook target, and **re-linking every user** — links
  are per-OA. Anyone linked to the current OA does not carry over.
- The current webhook points at `uat` (`frontoffice.develyst.online`) — board §ENVIRONMENTS.
- ⚠️ A rich menu and an automated reply path can **collide with a human replying** in the same conversation.
  How that is arbitrated is a business rule, not a technical detail.
- Known-unverified, and directly relevant: **a scheduled 08:15 run has never been watched actually delivering**,
  and **`notification_outbox == 1 row` was proven only on the skip path** (`PROJECT-STATUS.md`). A "complete
  notification set" built on top of an unwatched delivery path inherits both.

## Out of Scope (proposed)

- Marketing / broadcast campaigns.
- Migrating historical messages from the old OA.

## Questions — @Porter to the owner

1. **The notification list — we are waiting on the customer.** Nothing here can be sized until it arrives.
   Porter's ask: their own words, one line per notification, saying **who receives it and when it fires**.
2. **"ลูกค้าจะใช้ในการตอบลูกค้าด้วย" — what does staff replying mean concretely?** They open LINE Official Account
   Manager and type, and we simply must not break it? Or do they want to reply from inside our system?
3. **The new OA: does it exist yet, and who holds its credentials?** Nothing can be built or tested without them,
   and they are a DATA REQUEST (they never go into a tracked file).
4. **Rich menu: which buttons?** We have a menu today (REQ-042). Same one, or does the customer want their own?
5. 🔴 **Parent linking — the precondition above.** Is he ready to unpark it? If not, this REQ can still be built,
   but it should be recorded that it ships to an audience of zero.

## Questions — round 2 (2026-08-30, after the customer's list)

**Q6 (to the customer, via the owner) — the one thing blocking ผปค-3.**
They wrote *"คอร์ส 6 ครั้ง เหลือ 4/6 **หรือ** คอร์สคงเหลือ 2 ชม"*. Two different units with "หรือ" between them.
Porter's reading — **to be confirmed, not assumed**: a **course** counts sessions (`เหลือ 4/6`) and a **voucher**
counts hours (`คงเหลือ 2 ชม`), i.e. it is per product type, not a choice of style.
The alternative reading is that they have not decided which they prefer. **These produce different messages, so
it is worth the one question.** (And a 1HR / 1st Trial has neither a count nor an expiry — what should its line
say, or should it be omitted?)

**Q7 (to the owner) — split this REQ?** The notification half is ready to move; the OA move + rich menu +
staff-replying design is not. Keeping them as one REQ means the ready half waits for the unready half.

**Q8 (to the owner) — the reach decision he has parked twice.** The customer's list is 3 parent notifications,
and today they reach 0 of 180 parents. Building them changes nothing until parents are linked. This is no longer
Porter arguing a hypothetical: **the customer has now asked for the thing that does not work without it.**

## 🔴 RETRACTION — the owner corrected my reach argument, 2026-08-30

> *"ผู้ปกครองผูกไลน์ 0 คน จาก 180 — เรื่องนี้ช่างมันเถอะหน่า **ลูกค้าลองใช้ที่ sid อยู่ หมายถึงลูกค้าเรานะ
> ไม่ใช่ลูกค้าของลูกค้า**"*

**I was answering the wrong question and I am striking my own position above.** Twice in this file I argued that
"linking is the deliverable, not the messages" and that these notifications "reach nobody". That framing assumed
the audience is **180 real parents on `uat`**. It is not — the audience right now is **the customer's own staff,
evaluating on `sid`**. Under that audience the reach number is simply irrelevant, and the owner is right to park it.

**The two sections above stay in the file rather than being deleted** (nothing here is ever deleted), but they are
**superseded**: read them as a note for *whenever this goes to real parents on `uat`*, which is a future decision,
not a precondition of this REQ.

📌 **The lesson, since this project keeps re-learning it:** I reasoned from a number in a status file
(`0 of 180`) instead of asking who the user actually is. A true number can still produce a false conclusion when
the population behind it is the wrong one.

### ⚠️ What the correction DOES change — one thing that must be checked, not assumed

If the customer is exercising LINE on **`sid`**, then LINE must actually function on `sid`. What our own records
say is that **the LINE webhook points at `uat`** (`board.md` §ENVIRONMENTS: *"The LINE webhook points there"*).
Two possibilities, and **Porter is not guessing between them:**
- there is a **second OA / webhook** wired to `sid` that the board never recorded, or
- LINE flows cannot be exercised on `sid` at all, and whatever the customer is trying is not the LINE half.

⇒ **Question to the owner** (below). Getting this wrong wastes the entire trial: the customer would press buttons
and correctly conclude "the notifications do not work", when the truth would be that they were never wired there.

### ✅ Answered by the owner, 2026-08-30 — how LINE testing actually works here

> *"webhook point ไป uat ค้างไว้รอตลอด ตอนฉันกับลูกค้าฉันจะเทสไลน์ เราจะค่อยปรับกลับมา แปปๆ ตอนดึกๆ"*

**The webhook lives on `uat` permanently.** When he and the customer want to exercise LINE, he **switches it to
`sid` briefly, late at night**, then switches it back. It is a manual, temporary, owner-only window.

**Consequences the team must plan around — none of these are objections, they are scheduling facts:**
1. **No LINE inbound flow can be tested without him opening that window.** Tanya cannot schedule it herself.
   This is the practical shape of the board's long-standing *"isolatable LINE test recipient"* blocker.
2. **While the window is open, `uat`'s LINE is deaf.** Anything a real family taps in that period is not handled
   by the customer's system. He does it late at night, which is when that is cheapest — worth stating plainly so
   nobody widens the window casually.
3. ⚠️ **Inbound and outbound are NOT the same dependency, and conflating them will waste a window:**
   - **Inbound** (linking, tapping เช็คอิน, ลา via LINE, rich-menu taps) travels through the **webhook** ⇒ needs
     the window.
   - **Outbound** (course-confirm, booking-confirm, the 08:15 daily reminder) is a **push using the channel
     token** ⇒ does **not** need the webhook at all.
   ⇒ Most of the customer's six-item list is **outbound**, so it may be testable **without** a window.

**🔴 Open question that decides point 3 — Porter is not guessing it:** does `sid` use the **same LINE channel /
token as `uat`**? If it does, an outbound test fired from `sid` **sends a real message to whoever is really
linked** (2 teachers on `uat` today). That is the difference between a safe test and messaging a real teacher at
night.
