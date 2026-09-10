# REQ-085 — Owner's batch, 2026-09-08 (six items)

**From:** the owner, in his own words, 2026-09-08 · **Held by:** @Porter · **To:** @Sober as ONE batch
🔴 **His words are quoted verbatim under each item. Where I have interpreted, it is marked `📖 MY READING` and
he can overturn it in one line — an interpretation presented as a requirement is how the wrong thing gets built.**
🚫 **@Porter does not set build order.** **The numbering below is HIS listing order, not a sequence.**

---


---

# 📋 §1–§13 — CONSOLIDATED 2026-09-10. **All SHIPPED and verified.** 🔒 Full text, every correction and every
retraction, verbatim in `archive/REQ-085-2026-09-09-pre-consolidation.md`.
🚫 **Nothing below is a summary of a customer's words — those are kept verbatim in §7 and in `REQ-079 §17c`.**
**These are the RULINGS, so a future reader can act without opening the archive.**

| § | ruling | shipped |
|---|---|---|
| **§1 / §10** | **Advance leave at course CREATION is unlimited and does not touch the quota; the week ceiling STRETCHES to fit the plan.** *"เพดานยืดตามไปด้วย"* | ✅ |
| **§2 / §7.4 / §9.1** | **The teacher AND admin are told when a student takes leave — never the parent.** Header `LEAVE NOTICE`, with `Coach` and `Remark`. | ✅ |
| **§3 / §4** | **The course-wide message: `Remark` renders · `Date` is an ENGLISH WEEKDAY · `Advance Leave Notice` prints `(-)` when empty.** **"English" means LABELS and SYSTEM values — never a student's name, never the admin's own `Remark`.** | ✅ |
| **§5** | **Registration uses the CUSTOMER'S words (`REQ-079 §17c`).** No role list: everyone types `Next`; other roles type a phrase. **None of the eight headings is sent (`§17f`).** | ✅ |
| **§6 / §6.1** | **No SKIP at the empty start or the FIRST child — and ONLY when the linked family has ZERO children.** A family with children is never forced. A LATER child may always be skipped. | ✅ |
| **§8.1** | 🔑 **TWO OPPOSITE EMPTY-FIELD RULES, one line apart: `Advance Leave Notice` ALWAYS prints (`-`); `Remark` NEVER prints when empty.** Both verified in both directions. | ✅ |
| **§11.2 / §11.3 / §12.1** | **The admin edits the expiry from the CARD.** **Later than derived — freely. Earlier than the last session — allowed, but the system NAMES the sessions it cuts, BEFORE saving.** | ✅ |
| **§12** | 🔴 **The QUOTA is the ONLY thing that may refuse a leave. The dates MOVE to make room.** *(Corrected @Porter's §11, which invented a second gate.)* | ✅ |
| **§12.2** | **`LEAVE_NOTICE_TOO_LATE` STANDS — a LATE leave is a different thing from a leave.** Removing a refusal there is a REGRESSION. | ✅ |
| **§13 / §13.1 / §13.3** | **Every command keyword works in English as well as Thai, everywhere, CASE-INSENSITIVELY.** *If the bot can be TOLD to type a word, it must accept that word in both languages.* | ✅ |
| **§11.1** | ⛔ **WITHDRAWN — never a requirement.** @Porter misread *"ยืดให้พิเศษ"*. | — |

📌 **The principle these keep re-deriving, stated once:** ***the plan decides the dates; the dates do not veto
the plan*** — at creation and after it, identically.
🔻 **And the method note, because it cost the most: four of the corrections above are @Porter's own misreadings
of the owner's prose.** **All four FITTED the evidence. Fitting is not evidence.**

---

# §7 — THE CUSTOMER'S NOTIFICATION FORMATS, **VERBATIM, 2026-09-08 (via the owner).**
🔴 **These are the SPEC.** **My analysis is `§8`, separated.** 🔗 **Supersedes the message shapes in `REQ-077`.**

## 7.1 คอนเฟิร์มทั้งคอร์ส — **Remark `*ถ้ามี` · Date in English · advance leave `(-)` when none**
```
CONFIRMED SCHEDULE:
Student: น้องดีซี
Program : Private Freeskate 6 HR
Date :
Time :
Start :
Coach :
*Expiry date :
**Advance Leave Notice : -
Remark : เตรียมเฉพาะ Freeskate ให้น้อง
```

## 7.2 คอนเฟิร์มตารางรายวัน
> *"Format แจ้งเตือน Auto โอเคแล้วค่ะ แต่แบบคำสั่งให้เป็นภาษาเดียวพอ โดยต้องเพิ่มให้แสดง Remark ทั้ง 2 อันนะคะ ทั้ง Auto และกดคำสั่งเอง"*
**AUTO — already correct, plus Remark:**
```
TODAY'S SCHEDULE:
Date : 2026-09-08
Coach : Haris

1) Time : 10:00-11:00
Student : Aiwa
Program : Private Freeskate 1 Hr
Remark : เตรียมเฉพาะ Freeskate ให้น้อง

2) Time : 11:00-12:00
Student : Anya
Program : Private Surfskate 6 Hr
Remaining : 6 HR
*Expiry date : 2026-10-27
Remark : น้องเช่าเฉพาะแผ่นทั้งคอร์ส
```
**COMMAND — one language, plus Remark:**
```
TODAY'S SCHEDULE:
10:00 Aiwa
Private Freeskate 1 Hr · Confirmed
Remark : เตรียมเฉพาะ Freeskate ให้น้อง

11:00 Anya
Private Surfskate 6 Hr · Confirmed
Remark : น้องเช่าเฉพาะแผ่นทั้งคอร์ส

15:00  Gavin
Private Freeskate 6 Hr · Pending
```

## 7.3 คอนเฟิร์มแบบรายครั้ง — **English format + Remark**
**FROM:**
```
ยืนยันตารางสอน
นักเรียน: Aiwa
วิชา: Freeskate
เวลา: 2026-09-08 10:00-11:00
```
**TO:**
```
CONFIRMED SCHEDULE:
Student : Aiwa
Program : Private Freeskate 1 Hr
Date : Tuesday
Time : 11:00-12:00
Remark : เตรียมเฉพาะ Safety ให้น้อง
```

## 7.4 แจ้งเตือนเด็กลา — **TEACHER / ADMIN CHAT ONLY**
```
แจ้งลา
Student : น้องดีซี
Program : Private Freeskate 6 HR
Date :
Time :
```
(The customer's originals carry a clock emoji on the schedule headers, a calendar emoji on 7.3, and a
double-exclamation emoji after `แจ้งลา`.)

# §14 — 🔴 `ลา` / `leave` LOOKS ONLY AT TODAY. **It must show the family what they HAVE, then ask.** (owner, 2026-09-09)
> *"เวลากดลา มันโฟกัสวันนี้เท่านั้น ก่อน สิ่งที่มันควรทำคือ scan to see what customer have? แล้วค่อยบอก ลูกคนไหนค่ะ เวลาไหนของลูกคนนี้ อะไรงี้"*

**Today:** `ลา` → *"วันนี้ไม่มีคาบที่แจ้งลาได้ / No class eligible for leave today"* — **and that is the end.**
🔴 **A parent whose child has a class on THURSDAY is told, on Tuesday, that there is nothing to do.** ⇒ **the
feature is unusable on every day except the day of the class, which is also the day the cutoff most often
refuses it.** 🔑 **So a parent can be simultaneously TOO EARLY and TOO LATE, and the bot says the same thing.**

## ✅ The shape he asked for
**`ลา` → SCAN what the family actually has → ASK which child → ASK which session.**
🔑 **His order matters and I am keeping it: the bot shows what EXISTS before it asks a question.** **The current
flow asks nothing and reports nothing.**

## 📖 @PORTER'S READING of the boundaries — marked as mine, overturnable in one line
- **WHAT to scan: every UPCOMING session, across ALL the family's children, that is still eligible.**
  🔗 **`LEAVE_NOTICE_TOO_LATE` STANDS (`§12.2`)** ⇒ **a session already inside the cutoff is NOT offered.**
  🔑 **Offering a session the bot will then refuse is worse than not offering it.**
- **WHICH CHILD: ask only when MORE THAN ONE child has an eligible session.** **One child ⇒ skip straight to the
  session list.** 🔑 **A question with one answer is not a question.**
- **WHICH SESSION: list them with DATE, TIME and PROGRAM** — 🔴 **never a bare number.** **A parent choosing
  "2" cannot tell what they cancelled.**
- **NOTHING ELIGIBLE: keep today's message, but make it TRUE** — it must say there is nothing UPCOMING to
  cancel, not nothing *today*. ⚠️ **And if the only sessions are inside the cutoff, SAY THAT** — 🔑 **"too late
  for tomorrow's class, call the school" is help; "no class eligible" is a shrug.**

## ⚠️ COST, stated plainly
🔴 **This BLOCKS `§7.4` LEAVE NOTICE from being tested at all** — **the owner could not reach it.** ⇒ **the only
NEW message of the four, and the only one that tests WHO receives it, is unverified because its trigger is
unreachable.** 📌 **That is the reason this is not a "nice to have": it is not that leave is awkward, it is that
leave cannot be exercised.**
🚫 **NOT in today's release.** **It is a flow change, not a copy fix, and it is the first thing in the next batch.**

# §15 — 🔴 `§7.4` LEAVE NOTICE must carry the ACTUAL DATE. **(owner, 2026-09-09: *"คนละคาบ"*)**
**The owner marked TWO DIFFERENT sessions absent. The teacher received TWO BYTE-IDENTICAL messages:**
```
LEAVE NOTICE · Student : มิลล่า · Program : Skateboard 4 HR · Date : Tuesday · Time : 15:00-16:00 · Coach : Bank
```
✅ **NOT a duplicate-send defect — the sends were correct, one per session.** 🔴 **The MESSAGE cannot distinguish
them.** ⇒ **`Date : Tuesday` names a WEEKDAY, and that course runs every Tuesday at 15:00.**

## 🔑 The rule this establishes, and it is bigger than one label
***`Date` means different things in a message ABOUT A COURSE and a message ABOUT A SESSION.***
| message | what `Date` must be | why |
|---|---|---|
| `§7.1` course-wide `CONFIRMED SCHEDULE` | **weekday** — `Tuesday` | it describes a RECURRING SLOT; a single date would be wrong |
| `§7.3` per-session `CONFIRMED SCHEDULE` | ❓ **see below** | it describes ONE session |
| `§7.4` LEAVE NOTICE | 🔴 **the ACTUAL DATE** | **its only job is "do not turn up for THIS class"** |
🔴 **A teacher who receives two identical notices cannot tell which class the child is missing** ⇒ **the message
fails at the one thing it exists to do.** **Two sends were right; both messages were unusable.**

## ✅ @PORTER'S wording — mine, and it keeps the weekday because a teacher reads by weekday
> **`Date : Tuesday 22/Sep/26`**
🔑 **The weekday first because that is how a coach holds their week; the date second because that is what
distinguishes one Tuesday from the next.** 🚫 **Not the date alone — it would read as a regression from what the
customer wrote.**

## ❓ `§7.3` — the same question, unresolved, and I am NOT changing it unasked
**The per-session confirmation says `Date : Wednesday` and is also about ONE session.** ⚠️ **It has not bitten
because it arrives at the moment of booking, when "which Wednesday" is still in the reader's head.**
📌 **The leave notice arrives days later, cold.** ⇒ **the same label, two different amounts of context.**
**Putting it to the owner rather than assuming his answer covers both.**

# §16 — CUSTOMER FEEDBACK, **VERBATIM**, 2026-09-09 (via the owner)
```
อัพเดทให้ค่ะ
1. ชื่อโปรแกรมยังไม่ขึ้น Private นะคะ
2. เอา Type cancel to exit ออกทั้งการแจ้งวันเกิดและจังหวัดค่ะ
3. เอาช่องว่างด้านล่างของ 📅CONFIRMED SCHEDULE ออกค่ะ ** ในคอมไม่ขึ้น แต่ในโทรศัพท์ขึ้นค่ะ
4. ขอเอา Sessions : ในแจ้งเตือนทั้งคอร์สออกค่ะ เพราะว่าในชื่อก็มีระบุจำนวนชั่วโมงอยู่แล้ว
5. ยังไม่มี Remark นะคะ
```

# §16b — @PORTER'S ANALYSIS. 🚫 **Not their words. Nothing here overrides `§16`.**

## 🔴 FIRST, and it changes how the whole list is read: **WHICH BOX ARE THEY LOOKING AT?**
**`uat` has NOT been deployed today.** ⇒ **the customer is almost certainly reading a build with NONE of this
work in it.** 🔑 **Item 5 is the tell: `Remark` was VERIFIED WORKING on `sid` — the owner's own screenshots show
`Remark : adadw` and `Remark : wwd`.** ⇒ **item 5 is not a defect; it is a box.**
⚠️ **But I am NOT dismissing the other four on that basis.** **Scored against what `sid` actually shows:**
| # | on `sid` today | verdict |
|---|---|---|
| 1 `Private` missing | ✅ real — `sid` shows `Surfskate 1 HR`, `Skateboard 4 HR` | **REAL, unfixed** |
| 2 cancel hint | ✅ real — `· หรือพิมพ์ ยกเลิก เพื่อออก` is present | **REAL request** |
| 3 blank line under the header | ❓ **not verifiable from a desktop shot — they say it shows on PHONE only** | **needs a phone** |
| 4 `Sessions :` | ✅ real — `sid` shows `Sessions : 4` | **REAL request** |
| 5 `Remark` | 🔴 **works on `sid`** | **BOX, not defect** |
🔑 **Four of five survive the box explanation.** 📌 **The lesson is mine: I nearly let one true explanation
retire a list it only covered a fifth of.**

## Item by item
### 1 — `Private` is missing from the program name
**Their examples: `Private Freeskate 6 HR`, `Private Surfskate 1 Hr`. Ours: `Freeskate 1 HR`.**
❓ **NOT a copy fix until one thing is known: is `Private` part of the PROGRAM'S NAME in their data, or a
CATEGORY we must render?** ⚠️ **If some programs are group classes, prefixing everything with `Private` would be
a lie printed to a parent.** 🚫 **I am not guessing.** **@Sober to say where the name comes from; the customer
to say whether every program is private.**

### 2 — remove *"Type cancel to exit"* from the birthdate and province screens
🔻 **This SUPERSEDES my own proposal from earlier today** — I was going to ADD an English twin to that line.
**They want it gone from those two screens.** ✅ **Their copy is the spec.**
⚠️ **The consequence, recorded and NOT argued: a parent stuck on those two screens is no longer told how to
leave.** **`ยกเลิก` still WORKS — it stops being advertised.** 🔑 **Same shape as the `ข้าม` question they have
not yet answered: they are trimming the escape hatches from the screens most likely to strand someone.**
📌 **Flagged to them once, then dropped. Their product, their call.**

### 3 — a blank line under the header, **phone only**
🔑 **The most interesting item: it renders differently on LINE mobile than on LINE desktop.** ⇒ **it cannot be
verified on a computer, and nobody on this team has a phone.** **The owner does.**

### 4 — remove `Sessions :` from the course-wide notice
✅ **Straightforward and their reasoning is sound: the program name already carries the hours.** ⚠️ **Note it is
the ONLY place a parent sees the session COUNT** — **and with `Private Freeskate 6 HR` the "6" is hours, not
sessions.** 🚫 **Not an objection. Recorded so nobody re-adds it later "because it was useful".**

### 5 — `Remark` — 🟢 **already working on `sid`. Nothing to do but deploy `uat`.**

## §16c — OWNER, 2026-09-10: **`§16` item 1 (`Private` in the program name) goes LAST — after everything.**
> *"ข้อแรก เอาไว้ทีหลังสุดๆเลย"*
📖 **@PORTER'S READING: this is `§16`'s item 1 — the `Private` prefix — not `§14`.** ⚠️ **One line overturns me.**
🚫 **De-prioritised to the very end of the queue.** ✅ **Items 2, 3, 4 of `§16` keep their place.**
🔑 **And it is the right one to defer, for a reason worth writing down:** **it is the only item on the list whose
answer we do not have** — **whether `Private` is part of the stored NAME or a CATEGORY, and whether any program
is a GROUP class.** ⇒ **every other item can be built today; this one cannot be started without an answer from
the customer, and the answer needs a question we cannot yet phrase.**
📌 **A blocked item at the front of a queue stops the queue. At the back it stops nothing.**

## §16d — CUSTOMER, **VERBATIM**, 2026-09-10 — the LEAVE NOTICE. 🔻 **SUPERSEDES @Porter's `§15` wording.**
```
17:18 kn แจ้งลา ติดช่องข้างล่างไปเหมือนกันค่ะ
กับ LEAVE NOTICE
รบกวนแก้เป็น LEAVE NOTICE / แจ้งลา ‼️
เพื่อความชัดเจนค่ะ
17:22 kn LEAVE NOTICE / แจ้งลา ‼️
Student : มะขิด
Program : Freeskate 6 HR
Date : 10-09-2026
Time :12:00-13:00
Coach : Ek

date ต้องเป็นวันที่ค่ะ ครูจะไม่รู้ว่าแจ้งลา พฤ ไหนค่ะ ถ้าใส่เป็นวัน
```

### 🎯 They reached `§15` independently, and their reason is word for word mine
***"ครูจะไม่รู้ว่าแจ้งลา พฤ ไหนค่ะ ถ้าใส่เป็นวัน"*** ⇒ **the teacher cannot tell WHICH Thursday.**
🔑 **The owner said *"คนละคาบ"* from the same evidence; the customer says the same from their side; I wrote `§15`
before either.** **Three independent readings, one conclusion — that is as settled as a requirement gets.**

### ✅ What their copy DECIDES, and it overrides me on both counts
1. **`Date` is the DATE ALONE, `DD-MM-YYYY`: `Date : 10-09-2026`.** 🔻 **My `Tuesday 22/Sep/26` is WITHDRAWN.**
   📌 **And their format is not arbitrary — it is the SAME `DD-MM-YYYY` they specified for date of birth in
   `REQ-079 §17c`.** ⇒ **they are being consistent with themselves; we should be too.**
2. **The trailing blank line is on the LEAVE NOTICE too** (*"ติดช่องข้างล่างไปเหมือนกัน"*) ⇒ 🔗 **confirms
   `§16.3` is NOT one message's bug.** **Fix it where messages are BUILT.**

### 🔴 3 — THE HEADER IS A CONFLICT, and only the owner can settle it
**They want `LEAVE NOTICE / แจ้งลา ‼️` — BILINGUAL.**
🔻 **The owner ruled the opposite on 2026-09-08:** *"1. LEAVE NOTICE ได้"* — **he chose English, replacing their
original Thai `แจ้งลา ‼️`, when I put it to him as *"deliberate, or should it read `LEAVE NOTICE`?"***
⇒ **his ruling and their request now point in opposite directions, and BOTH are about the same line.**
📌 **Their reason is *"เพื่อความชัดเจน"* — and it is a good one: this message goes to COACHES, not parents, and a
coach scanning a phone reads the Thai faster.** 🚫 **Not mine to settle. Put to the owner.**

## §16e — OWNER, 2026-09-10: **the LEAVE NOTICE header is BILINGUAL — `LEAVE NOTICE / แจ้งลา ‼️`.**
> *"LEAVE NOTICE / แจ้งลา ‼️ — สองภาษา"*
✅ **The customer's version wins.** 🔻 **This REVERSES his own `§9` ruling of 2026-09-08** (*"1. LEAVE NOTICE
ได้"*), **which was given before the customer had asked for anything.** 🚫 **`§9` item 1 is superseded, not
wrong — he answered the question I asked, and then the customer asked a different one.**

### 🔑 The boundary this draws, and it is worth more than the header
**`REQ-085 §4` says notifications are ENGLISH ONLY, *"ไม่ควรไทยเลยแม้แต่ติด"*.** **This header is Thai.**
⇒ **the two do not conflict, because `§4` was always about the SYSTEM'S OWN words** — `Date : อังคาร` → `Tuesday`,
`ไม่มี` → `(-)`. 🔑 ***`§4` governs values the system GENERATES; it never governed what a message is CALLED.***
📌 **Recorded so nobody "fixes" this header back to English next month by citing `§4`** — **which is exactly the
shape that produced `Date : อังคาร` shipping after `REQ-079 §18` had already ruled it English.**
⚠️ **And the AUDIENCE is the reason it holds: this message goes to COACHES and ADMINS, never to a parent.**
**A coach scanning a phone reads the Thai faster.** ⇒ **the one notification with a Thai header is the one no
parent ever sees.**

## §16f — 🔴 OWNER, 2026-09-10: **the daily and weekly COMMAND schedules must look like the morning AUTO one.**
> *"แก้ไข pattern ตารางรายวัน รายสัปดาห์ ครู ให้หน้าตาเหมือน today schedule ตอนเช้า"*

### 🔴 THIS CONTRADICTS `§7.2`, WHICH IS THE CUSTOMER'S OWN SPEC — I am not building it until he chooses
**Their `§7.2`, verbatim, gives TWO DIFFERENT SHAPES ON PURPOSE:**
| | shape |
|---|---|
| **AUTO** | `Date :` · `Coach :` then **numbered blocks** — `1) Time : … / Student : … / Program : …` |
| **COMMAND** | **compact lines** — `10:00 Aiwa / Private Freeskate 1 Hr · Confirmed` |
**Their instruction was *"Format แจ้งเตือน Auto โอเคแล้วค่ะ แต่แบบคำสั่งให้เป็นภาษาเดียวพอ"*** ⇒ **they reviewed
the COMMAND shape, asked only for ONE LANGUAGE and `Remark`, and left the shape alone.**
🔻 **And I told @Sober, in writing: *"AUTO and COMMAND are DIFFERENT SHAPES BY DESIGN — do not unify them."***
⇒ **the owner is now asking for exactly the unification I forbade on the customer's behalf.**

### 📖 What I think is actually going on — mine, and it may be why both are right
🔑 **The two shapes serve two READERS, and the owner is looking at the COACH's one.**
**The AUTO morning digest is a COACH's day** — `Coach : Haris`, then that coach's sessions. **The COMMAND
schedule is whoever typed it.** ⇒ **a coach who reads a rich digest at 08:00 and then types `ตาราง` at noon gets
a thinner message about the same day, and that is jarring — which is, I suspect, exactly what he saw.**
📌 **If that is the case, the answer may not be "unify" but "the COMMAND version for a COACH matches the AUTO
one".** ⚠️ **Speculation. I am not building on it.**

### ❓ THE QUESTION FOR THE OWNER — one line settles it
**The customer specified the COMMAND shape and did not ask for it to change. Do you want it changed anyway?**
- **(ก) YES — my instruction wins, tell them.** ⇒ **I write to the customer explaining what changed and why.**
- **(ข) Only for a COACH** — parents keep the compact shape the customer approved.
- **(ค) Ask the customer first.**
🚫 **Not mine to settle: they wrote `§7.2` and approved that shape three days ago.** 🔑 **Changing a customer's
approved copy without telling them is how they stop trusting what they approved.**

## §16g — CLARIFIED, owner 2026-09-10: **`§16f` is the HEADER ONLY. No shape change. No conflict.**
> *"ลูกค้าหมายถึงแค่ หัวข้อข้างบน ให้เอาเหมือนตัวออโต้ตอนเช้า"*
🚫 **`§16f`'s "unify the shapes" reading is WITHDRAWN — mine, and wrong.** ✅ **The compact COMMAND body stays
exactly as the customer approved it.** ⇒ **the three-way question I put to the owner is moot; nothing needs to
be explained to the customer, because nothing of theirs is being changed.**

### ✅ What actually changes — the header line, and it RESTORES their spec
| message | today | must become |
|---|---|---|
| daily, COMMAND | `📅 Today's schedule` | **`⏱️TODAY'S SCHEDULE:`** |
| weekly, COMMAND | `📅 This week's schedule` | **`⏱️THIS WEEK'S SCHEDULE:`** |
🔑 **`§7.2`'s COMMAND example already says `TODAY'S SCHEDULE:` with the clock.** ⇒ **we drifted from their copy
and are going back to it — this is not a change to their spec, it is a failure to have matched it.**
📌 **It is the SAME item I filed as a copy delta after the owner's first notification round:** *"`CONFIRMED
SCHEDULE:` kept their form; `TODAY'S SCHEDULE:` did not — inconsistent with ourselves."* ⇒ **now confirmed by
the customer, so it stops being my observation and becomes their instruction.**
📖 **The WEEKLY header is MINE** — **that message is not in their four**, so nothing specifies it. **Matching
the daily one is the only choice that does not invent a third style.**

### 🔻 What I got wrong, and it cost the owner two rounds of explaining
**I read *"ให้หน้าตาเหมือน today schedule ตอนเช้า"* as the whole MESSAGE and built a conflict out of it** — a
three-option question, a warning about customer trust, none of it needed. 🔑 **"หน้าตา" meant the heading.**
⚠️ **Fifth time I have read more structure into his words than they carried. And this time the tell was
available: the customer had ALREADY approved the body three days earlier, so a reading that put them in conflict
with themselves was the less likely one.**
