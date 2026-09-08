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

---

# 📨 2026-09-05 — the customer sent the MESSAGE TEMPLATES themselves

**This is the second time the customer has moved this REQ forward, and it is a bigger step than the first.**
On 2026-08-30 they sent a **list** of six notifications. Today they sent **the messages**, field by field, in
their own layout. ⇒ **The wording half of REQ-014 stops being a design question and becomes a mapping exercise.**

## Verbatim, as received (owner relaying, 2026-09-05)

```
ลูกค้า
1. คอนเฟิมคอร์สทั้งหมด          2. แจ้งเตือนตารางเรียน         3. แจ้งเตือนตัดคอร์ส
CONFIRMED SCHEDULE:            ⏱️TODAY'S SCHEDULE:            💡COURSE DEDUCTION
Student: น้องดีซี                Student : น้องดีซี              Student: น้องดีซี
Program : Private Freeskate 6 HR   Program : …                  Program : …
Date :                         Date :                         Date :
Time :                         Time :                         Time :
Start :                        Start :                        Start :
Coach :                        Coach :                        Coach :
*Expiry date :                 Remaining Hour :               Remaining Hour :
**Advance Leave Notice :       *Expiry date :                 *Expiry date :

ครู
1. CONFIRMED SCHEDULE  — identical to the parent's #1, including *Expiry date and **Advance Leave Notice
2. ⏱️TODAY'S SCHEDULE  — identical to the parent's #2
3. แจ้งลา ‼️  — Student · Program · Date · Time      (no Coach, no course fields)
```

## What is settled by this, and it is a lot

- **The house style is English labels with Thai values.** `Student: น้องดีซี`. **Every message we send today is
  Thai throughout** ⇒ this is a **rewrite of all six**, not a tweak. **Their format, their account, their call.**
- **Parent #3 `COURSE DEDUCTION` is the ONE genuinely new notification** identified in the gap analysis above —
  now specified. It is the check-in / session-consumed message.
- **`Program` carries the package, not just the sport** — *"Private Freeskate 6 HR"*. Private vs group, the
  discipline, and the size, in one line.
- **`Remaining Hour`** answers the unit question their 08-30 list left open (*"เหลือ 4/6 **หรือ** คงเหลือ 2 ชม"*):
  **hours.** ⚠️ **But see Q3 — it cannot be hours for everything.**

## 🔴 Five things Porter will not fill in by guessing

1. **`Date` · `Time` · `Start` — three fields, and I can only account for two.**
   For a **whole course**, `Date` reads as the recurring days, `Time` the slot, `Start` the first class.
   **For `TODAY'S SCHEDULE` and `COURSE DEDUCTION`, which are about ONE session, `Date` and `Start` collapse into
   the same fact.** ⇒ **What is `Start` on a single-session message?** *(the course's original start date? the
   class start time, making `Time` a range? something else?)* **This is the sharpest question in the set** —
   getting it wrong puts a wrong-looking date in front of every parent, every day.
2. **The teacher's #1 and #2 are byte-identical to the parent's, including `*Expiry date` and
   `**Advance Leave Notice`.** ⇒ **Deliberate — one template, less work for them — or copy-paste?** A coach has
   no use for a family's expiry, and it is family information on a staff phone. ⚠️ **We do not remove it on our
   own judgement; we ask.** *(`Coach` appearing in a message TO the coach is the same question.)*
3. **Every template is course-shaped.** `Program: … 6 HR` · `Remaining Hour` · `Expiry date`.
   ⇒ **What does `TODAY'S SCHEDULE` look like for a `1HR`, a `VOUCHER`, a `1st Trial`, or an `อื่นๆ`?**
   **A voucher has sessions, not hours. A 1st Trial has no remainder at all.** **This is the gap that will
   otherwise be discovered in production**, and it is exactly the shape of REQ-009's *"1HR/Voucher named, 1st
   Trial silently missing"*.
4. **What fills a field that has no value?** Omit the line, or print the label with `-`? ⚠️ **A blank
   `*Expiry date :` at the end of a real message reads as a system fault to a parent**, and this format is all
   labels.
5. **`**Advance Leave Notice` with no leave declared** — omit, or `ไม่มี`? *(Same question, but this one is
   information a parent may be checking FOR, so silence is ambiguous in a way a missing expiry is not.)*

## What Porter can already map — so the questions above are the only blockers

| Field | Source | Have it? |
|---|---|---|
| `Student` | student name | ✅ |
| `Program` | package + discipline + size | ⚠️ **the exact string is assembled from several places — @Sober to confirm one source** |
| `Date` / `Time` | booking date + slot | ✅ |
| `Coach` | assigned teacher | ✅ ⚠️ **`REQ-078` allows SEVERAL teachers on one booking — this field is singular** |
| `Remaining Hour` | course balance | ✅ for courses · ❓ Q3 for the rest |
| `*Expiry date` | course expiry | ✅ |
| `**Advance Leave Notice` | leave declared at creation (`planned_at_creation`) | ✅ — REQ-072 already sends these |
| `Start` | ❓ **Q1** | 🔴 |

## Status

**DRAFT.** The notification half of this REQ is **one answer away from `READY_FOR_SA`** — Q1 is the blocker, Q3
the one that decides scope. **The OA-move and rich-menu half is unchanged and still needs its own conversation.**
📌 **Porter's recommendation: split this REQ.** The notifications can move now; the OA move cannot, and the
customer has just removed our menus from their account, which puts the menu half further out, not closer.

---

# ✍️ 2026-09-06 — Porter designs the gaps. Owner's authority, customer reviews after.

Owner, on the two blocking questions: **1.** *"เขาน่าจะก็อปวางมา คิดเองไปเลย เอาที่สมควร"* · **2.** *"เอาตามที่มี
ถ้าไม่มีก็ไม่ต้องใส่ … แล้วแต่นายช่วยเขาดีไซน์ได้ แล้วเขาดูทีหลัง หลังจากเสร็จค่อยมาแก้ใหม่"*

⇒ **Porter decides; the customer reviews the working thing.** 🔴 **Every decision below is labelled as MINE, with
its reason, so a review is a one-line change and not an argument.** The customer's own layout is unchanged
wherever it was unambiguous.

## Decision 1 — `Start` appears ONLY on `CONFIRMED SCHEDULE`

**Reason:** on the whole-course message the three fields are genuinely three facts —
`Date` = the recurring days · `Time` = the slot · `Start` = **the first class date**.
**On `TODAY'S SCHEDULE` and `COURSE DEDUCTION` there is one session, so `Date` and `Start` are the same day.**
⇒ **`Start` is dropped from both.** A label whose value repeats the line above it teaches people to stop reading.
*(The owner's read that it was copy-paste is almost certainly right, and this is what it looks like corrected.)*

## Decision 2 — empty fields are OMITTED, with one exception

**Reason:** the format is all labels; a trailing `*Expiry date :` with nothing after it reads as a fault.
⚠️ **Exception — `**Advance Leave Notice` on `CONFIRMED SCHEDULE` prints `ไม่มี` when none was declared.**
**A parent may be reading the message TO CHECK that**, and silence cannot be told from a missing feature.
**Everywhere else, no value ⇒ no line.**

## Decision 3 — `Remaining Hour` becomes `Remaining`, with the unit in the VALUE

**This is the one place I changed their label, and it is the one to look at first in review.**
**Reason: a Voucher counts SESSIONS, not hours.** `Remaining Hour : 4/6 ครั้ง` is self-contradictory, and two
different labels for one idea is worse than one label carrying its unit.
- Course → **`Remaining : 2 HR`**
- Voucher → **`Remaining : 4/6 ครั้ง`**
📌 Their own 2026-08-30 note already offered both units — *"คอร์ส 6 ครั้ง เหลือ 4/6 **หรือ** คอร์สคงเหลือ 2 ชม"*.
**Reverting to `Remaining Hour` is one line if they prefer it.**

## Decision 4 — `COURSE DEDUCTION` is sent only where there IS a balance

**Course and Voucher only.** A `1HR`, a `1st Trial` and an `อื่นๆ` deduct from nothing — **there is no remainder
to report and no course to name.** ⇒ **No deduction message for those three.** Sending one would be announcing a
subtraction that did not happen.

## Decision 5 — `Coach` may carry more than one name

`REQ-078` allows several teachers on one booking. **Label unchanged, names joined with `·`.** Not a new field.

---

## THE TEMPLATES — final, for build

### Parent 1 · `CONFIRMED SCHEDULE` — a whole course confirmed
```
CONFIRMED SCHEDULE:
Student : {ชื่อนักเรียน}
Program : {แพ็กเกจ}
Date : {วันที่เรียนประจำ}
Time : {เวลา}
Start : {วันเริ่มเรียน}
Coach : {ครู}
*Expiry date : {วันหมดอายุ}
**Advance Leave Notice : {วันลาที่แจ้งไว้ / ไม่มี}
```

### Parent 2 · `TODAY'S SCHEDULE` — today's class
```
⏱️TODAY'S SCHEDULE:
Student : {ชื่อนักเรียน}
Program : {แพ็กเกจ}
Date : {วันที่}
Time : {เวลา}
Coach : {ครู}
Remaining : {ยอดคงเหลือ}        ← omitted for 1st Trial / อื่นๆ
*Expiry date : {วันหมดอายุ}      ← omitted when the type has none
```

### Parent 3 · `COURSE DEDUCTION` — a session was used (course · voucher only)
```
💡COURSE DEDUCTION
Student : {ชื่อนักเรียน}
Program : {แพ็กเกจ}
Date : {วันที่}
Time : {เวลา}
Coach : {ครู}
Remaining : {ยอดคงเหลือหลังหักแล้ว}
*Expiry date : {วันหมดอายุ}
```
🔴 **`Remaining` here is the balance AFTER the deduction.** The message exists to answer *"เหลือเท่าไหร่"*, and a
before-figure in a message headed DEDUCTION is the one number that must never be ambiguous.

### Teacher 1 & 2 — the same two messages, **minus the family's private lines**
🔴 **`*Expiry date` and `**Advance Leave Notice` are REMOVED from the teacher's copy. Porter's call, flagged for
review.** **Reason: a course's expiry and a family's declared absences are the FAMILY's business.** A coach needs
who · what · when · where they stand today. ⚠️ **The customer's own draft had them, byte-identical to the
parent's — which is exactly what copy-paste looks like.** ⇒ **One line to put back if they meant it.**
📌 `Coach` is **kept** on the teacher's copy: a coach covering for someone else needs to see whose class it is.

### Teacher 3 · `แจ้งลา ‼️` — unchanged, exactly as they wrote it
```
แจ้งลา ‼️
Student : {ชื่อนักเรียน}
Program : {แพ็กเกจ}
Date : {วันที่}
Time : {เวลา}
```

## Per-type behaviour — the table the build needs

| Type | `Program` | `Remaining` | `*Expiry date` | Gets `COURSE DEDUCTION`? |
|---|---|---|---|---|
| **Course** | package, e.g. `Private Freeskate 6 HR` | `2 HR` | ✅ | ✅ |
| **Voucher** | the voucher's programme | `4/6 ครั้ง` | ✅ | ✅ |
| **1HR** | activity + `1 HR` | — omitted | — omitted | ❌ |
| **1st Trial** | activity + `1st Trial` | — omitted | — omitted | ❌ |
| **อื่นๆ (OTHER)** | the admin's typed title | — omitted | — omitted | ❌ |

⚠️ **`อื่นๆ` may have NO student.** ⇒ `Student` carries the typed title's subject or is omitted, **and the message
goes to the teacher only** — there is no family to send it to. **Named here because it is the case that would
otherwise crash a parent send.**

## Status: **`READY_FOR_SA`** for the notification half

**Nothing here is blocked.** The five decisions are labelled, reversible, and were made under the owner's explicit
instruction to design rather than ask. **The OA-move / rich-menu half remains DRAFT and unrelated.**

## Decision 6 — a day with SEVERAL classes: one message, blocks under a shared header (Porter, 2026-09-06)

**@Sober's question, and it is a real one their template could not have answered:** their `TODAY'S SCHEDULE` is
written as **one class**, but the system deliberately sends **one message per person per day**, listing all of
them. *(Per-booking would push a coach eight times before 08:20 — "a muted channel is worse than no channel", and
the send-once key is built one-per-person.)*

**Decided under the owner's standing instruction to design rather than ask** (*"แล้วแต่นายช่วยเขาดีไซน์ได้ แล้ว
เขาดูทีหลัง"*, 2026-09-05). **Reversible in one line, like the other five.**

### The answer: repeat only what CHANGES. Hoist what does not.

**Eight full blocks is fifty-odd lines on a phone, and every one of them repeats the date and the coach.**
**A compact list loses their labels.** ⇒ **Neither. Take the constant fields out of the repeat:**

```
⏱️TODAY'S SCHEDULE:
Date : 6 Sep 2026
Coach : Ek

1) Time : 10:00-11:00
   Student : น้องดีซี
   Program : Private Freeskate 6 HR
   Remaining : 4 HR
   *Expiry date : 30 Nov 2026

2) Time : 11:00-12:00
   Student : น้องเอ
   Program : Balance Play 6 HR
   Remaining : 2 HR
   *Expiry date : 12 Dec 2026
```

**Why this and not the other two:**
- **Their labels survive verbatim** — this is their template, printed once per class instead of once per message.
- **`Date` and `Coach` are constant for the whole message.** Repeating them eight times is noise that pushes the
  part a coach actually scans — **time and student** — further down. `Time` leads each block for that reason.
- 🔴 **ONE class renders EXACTLY as their template does**, minus the numbering. **The common case is unchanged**,
  and that is the case they wrote the template for.

**The parent's copy needs none of this in practice** — one or two classes — **but it uses the same rule**, because
two formats for one message is how they drift apart.

⚠️ **What I am NOT deciding:** whether a coach would rather have the compact list they get today. **They have been
reading that list for weeks and have not complained about it** — but they also asked for this format, and asking
*"do you prefer what you already have?"* is a question they can only answer by seeing both. ⇒ **Ship this; it is
in the review batch with the other five.**

## Decision 7 — the `TODAY'S SCHEDULE` empty state (Porter, 2026-09-06)

**@Jason reported it rather than editing it, because copy is mine.** The string reads *"ไม่มีคาบสอนในช่วงนี้"* —
**borrowed from the weekly composer**, and **`ช่วงนี้` is the wrong noun under a heading that says TODAY'S.**

**Corrected, per audience:**

| Audience | Empty state |
|---|---|
| Teacher | **`วันนี้ไม่มีคาบสอนค่ะ`** |
| Parent | **`วันนี้ไม่มีคาบเรียนค่ะ`** |

**Why two and not one:** *"คาบสอน"* is what a coach teaches; *"คาบเรียน"* is what a child attends. **One string
for both makes one of them read as somebody else's message** — and the audience split already exists in the code
from TASK-253, so this costs nothing.
📌 **Unreachable in practice today** (the reminder does not fire on an empty day) — **fixed anyway.** An empty
state nobody can reach is exactly the string that surfaces the day someone changes when the job runs.

## §CONFIRMED SCHEDULE — three corrections from the owner, 2026-09-07 (live messages from `sid`)

Two real messages, side by side, one to a **teacher** and one to a **parent**. **Three things wrong and one I am
raising myself.**

### 1. 🔻 The teacher's copy lacks `*Expiry date` and `**Advance Leave Notice` — **that was MY decision**
**Decision 5 (2026-09-05), and I flagged it as reversible in one line.** My reasoning stands as written: a
course's expiry and a family's declared absences are **the family's business**, and the customer's own draft was
byte-identical to the parent's, **which is what copy-paste looks like.**
⚠️ **But that was a guess about their intent, and now the owner is asking, so it goes back to the customer as a
question — not as a thing we quietly did.** 📌 **Porter's read, to overrule:** the coach needs
**`**Advance Leave Notice`** *(a child they will not see, on a date they are rostered)* and does **not** need
`*Expiry date` *(when the family's money runs out)*. **Two different fields, one decision each — not one switch.**

### 2. 🔴 `Sessions` must COUNT THE ADVANCE LEAVES. Customer's answer, and it is a defect.
> *"ลูกค้าบอกว่าควรเป็น 10 แต่ดันขึ้น 8 เพราะลาล่วงหน้าไปสอง"*
`Surfskate 10 HR` printed **`Sessions : 8`** — two advance leaves subtracted. **The customer wants `10`.**
📌 **And they are right on the meaning:** the line sits under `CONFIRMED SCHEDULE` in a message that **also
prints the leave dates.** ⇒ **it is the size of what was bought, not what remains** — and printing the remainder
next to the leave dates makes the reader subtract twice. **The confirmation states the whole course.**
⚠️ **Same on the parent's copy:** `6 HR` printed `Sessions : 5` with one leave declared. **One rule, both.**

### 3. 🔴 The booking `Note` is missing, and the customer names it **`Remark`**
It belongs at the **end**, after `**Advance Leave Notice`. **`REQ-007` (✅ Completed, his REQ-007) requires the
note to reach the teacher on LINE** — so this is not new scope, it is a line that fell out.
🔻 **And the label is my omission, the second time in two days:** @Jason kept the note and I **confirmed keeping
it without naming it**, exactly as I did with `Sessions`. ⇒ **`Remark :`**, their word.
⚠️ **It is subject to my own omit-empty rule** (Decision 2) — **no note ⇒ no line.** **That is why it is absent
from both samples: neither booking had one.** ✅ **Correct as designed, but it must be VERIFIED with a note
present**, or we will ship a field nobody has seen render.

### 4. ⚠️ Porter's own observation — the two messages disagree about the DAY'S LANGUAGE
Teacher: **`Date : อาทิตย์`** · Parent: **`Date : Monday`**. ⇒ **Consistent with the language switch** (each
recipient's own `line_lang`) **and therefore probably correct** — but **the customer specified "English labels,
Thai values"**, and `Monday` is an English value. **Not filing it as a defect. Asking.**

### 🔻 DECISION 5 REVERSED — the teacher gets BOTH lines back (owner, 2026-09-07: *"เอาหมด"*)

**`*Expiry date` AND `**Advance Leave Notice` go back onto the teacher's copy.** ⇒ **the teacher's
`CONFIRMED SCHEDULE` is the parent's, field for field** — which is **exactly what the customer sent us on
2026-09-05 and I overrode.**

🔻 **My Decision 5 was wrong, and the way it was wrong is worth keeping.** I saw two byte-identical messages and
**read it as copy-paste.** It was **intent.** I wrote at the time: *"the customer's own draft had them,
byte-identical to the parent's — which is exactly what copy-paste looks like."* **It also looks exactly like
meaning it.** ⇒ **I could not tell the two apart from the artefact, which is precisely why it should have been a
question on day one and not a decision with a note attached.**
📌 **The flag is what saved it** — it was labelled as mine and reversible, so this costs one line and no argument.
**The lesson is not "stop deciding"; the owner told me to design.** It is **"when the evidence is equally
consistent with two intents, that is a question, not a judgement call."**
⚠️ **My reasoning is not withdrawn, it is overruled** — a coach seeing a family's expiry date is still the
family's business leaking onto a staff phone. **The customer knows their own shop; recorded and moving on.**
