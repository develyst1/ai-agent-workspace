# REQ-085 — Owner's batch, 2026-09-08 (six items)

**From:** the owner, in his own words, 2026-09-08 · **Held by:** @Porter · **To:** @Sober as ONE batch
🔴 **His words are quoted verbatim under each item. Where I have interpreted, it is marked `📖 MY READING` and
he can overturn it in one line — an interpretation presented as a requirement is how the wrong thing gets built.**
🚫 **@Porter does not set build order.** **The numbering below is HIS listing order, not a sequence.**

---

## §1 — Advance leave at course creation is UNLIMITED and does NOT touch the quota
> *"ตอนสร้าง course ระหว่างวางแผนวัน ที่ให้ลาล่วงหน้าได้ แก้ไขให้ลาได้ ไม่จำกัด ไม่เกี่ยวกับโควตาที่มี"*

**Today:** the leave quota is course-size-based (`4 → 1 · 6 → 2 · 10 → 3`) and **exceeding it LOCKS rescheduling
until an admin unlocks it** — that sentence is printed on the Bookings screen.
**Required:** **while PLANNING the days at course CREATION, an admin may declare any number of sessions as
advance leave.** ⇒ **no cap, and those declarations must NOT consume the quota.**
🔑 **The reason the distinction holds:** **the quota exists to limit RESCHEDULING after a plan is agreed.**
**Nothing has been agreed yet at creation time** ⇒ **there is nothing to protect against.**
🔴 **Question for @Sober, not for the owner — it is mechanical:** **does a creation-time advance leave still earn
its make-up session?** **It must**, or the family loses lessons they paid for. **Assert it.**

## §2 — The teacher is not told when a student takes leave
> *"ของแจ้งเตือนครูเด็กลายังไม่ขึ้น"*

**The parent gets a leave notification; the teacher does not.** ⇒ **a teacher can arrive for a session the
student already cancelled.** 📌 **He raised this once before, alongside "ทำไมของครูไม่มีบอกเหมือนกันกับผปค".**

## §3 — The course-wide `CONFIRMED SCHEDULE` message: three fixes
> *"คอนเฟิร์มคอร์สทั้งหมด — เพิ่ม Remark (note) · Date ให้เป็นภาษาอังกฤษ · advance leave notice ถ้าไม่มีให้ใส่ (-)"*
- **(a) `Remark` must render.** 🔗 **This is `TASK-284` — already open, already reproduced by him.** 🔻 **It is a
  KNOWN limitation from `TASK-269 §2` that was deliberately not fixed. His finding OVERRULES that decision.**
- **(b) `Date` in ENGLISH.** 🔗 **REQ-079 §18 already rules notification labels English.** ⇒ **`Date : อังคาร`
  is the standing defect; this is him asking for the ruling to be applied.**
- **(c) `advance leave notice` must always print — `(-)` when there is none.**
  🔑 **A field that vanishes when empty is indistinguishable from a field that was never sent.** ⇒ **`(-)` is
  the parent being told "we checked, and there is none".**

## §4 — The daily schedule confirmation must be ONE language
> *"คอนเฟิร์มตารางรายวัน — ให้ขึ้นภาษาเดียว"*
🔗 **REQ-079 §18 splits this deliberately:** **conversation = bilingual · notifications = English labels.**
⇒ **the daily schedule is a NOTIFICATION, so the bilingual rendering there contradicts the ruling already made.**
📖 **MY READING: "one language" = the §18 notification form, not a new third style.** **If he means Thai-only
instead, that changes §18 itself and I will re-open it.**

## §5 — Parent registration must not reveal that other roles exist
> *"ตอนสมัคร ผปค ให้พิมพ์ Next ให้ลูกค้าไม่รู้ว่ามี role อื่นด้วย"*
**Today the entry message asks *"Who are you? Tap a button below, or type: parent · teacher · admin"*** —
🔴 **which tells every parent that teacher and admin accounts exist, and what to type to try one.**
📖 **MY READING: in the PARENT registration flow the prompt becomes a plain `Next`** — **no role list, no role
words offered to a parent.**
⚠️ **NOT settled by me, and I say so rather than guess:** **whether the role CHOICE disappears entirely for
everyone, or only the parent path stops advertising the others.** **One line from him decides it.**
🔑 **Either way this is not cosmetic: it is the difference between a parent who cannot see a door and a parent
who is shown the door and the key.**

## §6 — No SKIP when adding the first child, and none at the empty start
> *"จังหวะเพิ่มลูกคนแรก และ แรกเริ่มที่ไม่มีลูก ไม่ต้องมีการข้าม"*
**Two moments: (i) the very start, when the account has no children at all; (ii) adding the FIRST child.**
⇒ **neither may offer a skip.** 🔑 **A parent account with no child can do nothing in this product** —
**skipping produces an account that exists and cannot be used**, and the parent has no way to know that is why.
📌 **A LATER child is unaffected** — skipping the SECOND child is legitimate.

---

## 🚫 What this REQ does NOT decide
**Build order · effort · whether any item needs a migration · which role does the work.** **All @Sober's.**

---

# ➕ OWNER'S ANSWERS, 2026-09-08 — §4 and §5 are now SETTLED. My readings were wrong on both.

## §4 SETTLED — **ENGLISH ONLY. Not one Thai character.**
> *"eng ล้วน ไม่ควรไทยเลยแม้แต่ติด เดี๋ยวฉันจะส่งข้อความลูกค้าย้ำให้อีกครั้ง เอาตามลูกค้าไปเลย"*
🔻 **My reading (`§18`'s English-labels-Thai-values form) is OVERRULED.** ⇒ **English labels AND English values.**
**His own screenshot is the specification:**
```
CONFIRMED SCHEDULE:
Student : asda            Program : Surfskate 6 HR
Date : อังคาร      ← 🔴 must be `Tuesday`
Time : 15:00-16:00        Start : 2026-09-15        Coach : Bank
*Expiry date : 2026-11-03
**Advance Leave Notice : ไม่มี   ← 🔴 must be `(-)` per §3(c)
Sessions : 6
```
🔑 **Both remaining Thai strings are ALREADY covered by §3 — `Date` and the leave notice.** ⇒ **§3 and §4 are
the same fix seen from two sides.** ⚠️ **A sweep is needed, not two edits: "not one Thai character" is a
PROPERTY of the message, and it can only be held by something that FAILS when a Thai character appears.**
📌 **He will re-confirm the wording with the customer and their answer wins.**

## §5 SETTLED — **option (ก): nobody is shown the role list. And the other roles get a PHRASE, not a menu.**
> *"ก ให้ design มาให้ผู้ใช้รู้ว่าตัวเองคือลูกค้าแน่ๆ แต่ role อื่นๆ ครู แอดมิน เขาจะพิมพ์ว่า ครูเอง แทนที่จะพิมพ์ว่า Next ในจังหวะนั้น"*
- **The entry prompt offers ONE path: type `Next`.** 🚫 **No role buttons. No `parent · teacher · admin` list.**
- 🔑 **The design must make a parent CERTAIN they are in the right place** — **removing the role question means
  the screen has to answer "am I supposed to be here?" without asking it.**
- **Teachers and admins type a PHRASE instead — `ครูเอง` and an admin equivalent.** ⇒ **an undocumented door: a
  parent will never type it by accident, and staff can be told it once.**
🔑 **This is a security-shaped change made with COPY, not with code:** **today we hand every parent the door AND
the key.** **After this, the key is something you have to already know.**
⚠️ **@Porter owes the admin phrase and the parent-certainty wording** — **copy is mine, and I will not let an
engineer invent either.**

---

# ⏸️ §5 COPY — @Porter's PROPOSAL, sent to the CUSTOMER. **NOT settled. Do NOT build this wording.**
**Owner, 2026-09-08:** *"รอ จดลงในโปรเจค ฉันจะส่งให้ลูกค้า ส่งมาให้ทำตามเลย"*
🔴 **STATUS: WAITING ON THE CUSTOMER. Their wording WINS and REPLACES everything below, verbatim.**
🚫 **No engineer may implement this text.** 📌 **`REQ-079 §17b` is the precedent: the customer's own words are
kept verbatim and OUR analysis is clearly separated from them. Same discipline here.**

## The admin phrase — proposed: **`แอดมินเอง`**
**Pairs with the owner's `ครูเอง` for teachers.** 🔑 **Same shape, different head ⇒ told once, remembered.**
**A parent will not type it by accident.**

## The entry message — proposed
> **สวัสดีค่ะ 👋 ที่นี่คือระบบตารางเรียนของ SOM Balance School**
> **สำหรับผู้ปกครองที่ต้องการดูตารางเรียนและแจ้งลาให้ลูก**
> **พิมพ์ `Next` เพื่อเริ่มค่ะ**

**Why each line, so the customer can argue with the REASONING and not just the words:**
- **Line 1 says WHAT THIS IS.** 🔑 **The old message asked *"who are you?"*** ⇒ **a person had to answer before
  learning whether they were in the right place at all.**
- **Line 2 is the whole mechanism.** **Instead of asking who they are, we state WHO THIS IS FOR.** ⇒ **a parent
  recognises themselves — and the words *"ครู"* and *"แอดมิน"* never appear.** **That is §5 satisfied by SAYING
  something, not by hiding something.**
- **Line 3 offers ONE path.** **Nothing to choose ⇒ nothing to wonder about.**
⚠️ **Open in the proposal:** **where the English half sits** (`REQ-079 §18`: conversation is bilingual) — **the
draft only marks it.** 🔑 **If the customer rewrites the Thai, the English must be rewritten WITH it, not
translated after.**

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

# §8 — @PORTER'S ANALYSIS of §7. 🚫 **Not the customer's words. Nothing here overrides §7.**

## 🔴 8.1 — TWO EMPTY-FIELD RULES THAT ARE OPPOSITE, and they are one line apart
| Field | When there is nothing |
|---|---|
| **`**Advance Leave Notice`** | 🟢 **ALWAYS PRINTS. Shows `-`.** |
| **`Remark`** | 🔴 **DOES NOT PRINT AT ALL** — *"(Note)\*ถ้ามี"* |
🔑 **Getting these backwards is the single easiest mistake in this whole batch**, and **both fields sit at the
bottom of the same message.** ⇒ **each needs its own assertion; one test covering "empty fields" will not do.**
📌 **The rules are not arbitrary:** **a missing leave notice is information the parent must be able to trust we
checked; an absent Remark is simply an admin who had nothing to say.**

## 🔴 8.2 — "ENGLISH ONLY" MEANS **LABELS**. Their own examples prove it.
🔗 **`REQ-085 §4`: *"eng ล้วน ไม่ควรไทยเลยแม้แต่ติด"*.** ⚠️ **Read literally that would romanise `น้องดีซี` and
translate `เตรียมเฉพาะ Freeskate ให้น้อง`.** **Their examples keep BOTH in Thai.**
✅ **The rule is: LABELS and SYSTEM-GENERATED values are English** (`Date : Tuesday`, not `อังคาร`; `-`, not
`ไม่มี`). **CONTENT A HUMAN TYPED is reproduced exactly as typed.**
🔑 **`Remark` is the admin's own sentence. Translating it would be putting words in their mouth.**

## 8.3 — What each format actually changes
- **7.1** = `TASK-284` (Remark) + `Date : อังคาร` → `Tuesday` + the `(-)`.
- **7.2 AUTO** — **the owner's earlier "one language" instruction does NOT apply here.** *"Format แจ้งเตือน Auto
  โอเคแล้วค่ะ"* ⇒ **AUTO IS ALREADY RIGHT; it only gains `Remark`.** 🔻 **This narrows `REQ-085 §4`, which I had
  routed as covering the daily schedule generally.**
- **7.2 COMMAND** — **one language + `Remark`.** 📌 **Note it uses a DIFFERENT shape from AUTO** (`10:00 Aiwa`
  on one line, then `Program · Status`) — **not the numbered `1) Time :` block.** **Two formats by design.**
- **7.3** — **the per-session message is TODAY still Thai-labelled** (`นักเรียน:` / `วิชา:` / `เวลา:`) ⇒ **a
  full replacement, not an edit.** ⚠️ **And it splits `เวลา: 2026-09-08 10:00-11:00` into `Date : Tuesday` +
  `Time :`** — **a WEEKDAY NAME, not a date.** 🔑 **Same as 7.1's `Date`. Consistent, and worth stating because
  "Date" naming a weekday is surprising the first time you build it.**
- **7.4** — **answers `REQ-085 §2`.** 🟢 **And it answers the part §2 did not specify: WHO gets it —
  *"เฉพาะแชทครู / แอดมิน"*.** ⇒ **teacher and admin chats. NOT the parent** (the parent is the one who declared it).

## ❓ 8.4 — THREE for the owner
1. **`แจ้งลา` is Thai, alone among four otherwise English-labelled formats.** ❓ **Deliberate, or should it read
   `LEAVE NOTICE` / `LEAVE REQUEST`?** 📌 **It goes to teachers and admins, not parents — a Thai header there is
   defensible. I want it said, not assumed.**
2. **7.2 AUTO shows `Remaining : 6 HR` and `*Expiry date :` on the COURSE booking and not on the 1-hour one.**
   ❓ **Confirm those two lines are CONDITIONAL on being a course** — their example implies it and never says it.
3. **7.4 has no `Coach` and no `Remark`.** ❓ **Deliberate?** 🔑 **A teacher reading a leave notice has just been
   told a slot is free — the Remark may be exactly what tells them whether anything was being prepared.**

# §9 — OWNER'S RULINGS on `§8.4`, 2026-09-08. **All three closed. `§7` is now fully specified.**
1. ✅ **The leave header is `LEAVE NOTICE`, in English.** ⇒ **all four formats now use English labels.**
   **The Thai `แจ้งลา` in `§7.4` is superseded.**
2. ✅ **`Remaining` and `*Expiry date` ARE CONDITIONAL — they appear only on a COURSE booking.**
   > *"ใช่ ไม่งั้นมันจะแยกยังไง"* 🔑 **His reason is the ACCEPTANCE: the two lines are what tells a coach a
   course row apart from a one-off row.** ⇒ **a test asserts they are ABSENT on a non-course row, not merely
   present on a course one.**
3. ✅ **`§7.4` GAINS BOTH `Coach` and `Remark`.**

## ➕ 9.1 — `§7.4` LEAVE NOTICE, final shape
```
LEAVE NOTICE
Student : น้องดีซี
Program : Private Freeskate 6 HR
Date :
Time :
Coach :
Remark : เตรียมเฉพาะ Freeskate ให้น้อง
```
🔑 **Why `Coach` earns its line, and it is not for the teacher:** **the teacher receives this in their OWN chat
and already knows it is theirs.** **The ADMIN receives the same message and covers every coach** ⇒ **without
`Coach`, three leaves from three teachers on one day arrive as three identical-looking messages.**
📌 **`Remark` follows the `§8.1` rule — `*ถ้ามี`, printed only when there is one.** **NOT the `-` rule.**
🔑 **Its value here is specific: a Remark is usually about PREPARATION** (*"เตรียมเฉพาะ Freeskate ให้น้อง"*)
⇒ **a coach who learns of a leave also learns there is nothing to prepare.**

# §10 — OWNER'S RULING on `§1`, 2026-09-08. **THE CEILING STRETCHES.**
> *"เพดานยืดตามไปด้วย"*
**Context — his own repro on `sid`:** a 4-session course, header `Leave 0/1`, **THREE** sessions marked
`ON LEAVE`. **The quota did NOT complain** (`plannedAtCreation` works). **The WEEK CEILING refused the plan:**
> *"This course can only extend to week 5 — reduce the planned absences or pick a different start date."*
**`Create plan` was DISABLED.**

✅ **RULING: planned absences at creation STRETCH the ceiling to cover the plan they produce.**
🚫 **The admin is not asked to reduce absences or move the start date.** ⇒ **"ลาได้ไม่จำกัด" becomes true in
practice, not only in the quota.**
🔗 **Consistent with his RESUME ruling — *"วันหมดอายุก็งอกไปสิ เรื่องปกติ"*** — and with `TASK-282`, which
already DERIVES the expiry from the last planned session. 🔑 **Same principle in a third place: the plan decides
the dates; the dates do not veto the plan.**

## 📖 @PORTER'S READING, marked as mine — **he ruled on the MECHANISM, so I read it as covering BOTH symptoms**
**The same ceiling causes the other open item on his list — *the extension ceiling measures from the PURCHASE
start date*, so after a long pause a later make-up can be refused on a course that legitimately moved.**
⇒ **I am carrying this ruling to BOTH.** ⚠️ **If he meant creation ONLY, one line overturns me.**

## ❓ FOR @SOBER, not for the owner — **if the ceiling always stretches, what still bounds a course?**
🔑 **The ceiling presumably exists so a course cannot drag on forever.** **Planned absences are finite, so
stretching for them is bounded** — **but the bound is now the PLAN, not a rule.** ⇒ **name what the ceiling
still refuses, or say plainly that it now refuses nothing and is a derived value.**
🔴 **A rule that survives only as an unreachable branch is worse than a deleted one** — **`EXPIRY_REQUIRED`
taught us that this week.**

# §11 — OWNER, 2026-09-08: **the ceiling's SCOPE, the ADMIN OVERRIDE, and an editable EXPIRY DATE**
> *"เพดานห้ามหลังจากสร้างครั้งแรกไง และแอดมินสามารถแก้ได้ด้วยนะ สามารถยืดให้พิเศษได้ด้วย ในกรณีลูกค้าไม่ได้บอกให้พัก
> อีกเรื่องนึงนะ คือเขาสามารถเลือก expire date ให้ได้ แล้วแต่แอดมิน ขวาบน ควรแก้ได้
> ส่วนกฏ มีไว้คุมโควตาลา หลังจากสร้างเท่านั้น"*

🔑 **This ANSWERS the question I had put to @Sober — *"if the ceiling always stretches, what does it still
refuse?"* — and the answer is a SCOPE, not a value.**

| | **AT CREATION** | **AFTER CREATION** |
|---|---|---|
| **leave quota** | 🚫 does not apply | ✅ **applies — this is the ONLY thing it is for** |
| **week ceiling** | 🚫 stretches to fit the plan (`§10`) | ✅ **applies — refuses** |
| **admin** | — | 🔑 **may OVERRIDE: extend specially** |

✅ **So nothing becomes an unreachable branch.** **Both rules keep a real job; they simply do not start until the
plan exists.** 🔑 **The principle underneath: before the course exists there is nothing to protect — the rules
protect an AGREED plan from drifting, not a plan being drawn.**

## §11.1 — The admin OVERRIDE
**An admin may extend beyond the ceiling as a special case.** **His stated case: *"ลูกค้าไม่ได้บอกให้พัก"*** ⇒
**a family who did not ask for a pause should not be pushed into one just because a rule ran out.**
📌 **A `LOCKED` card with `Unlock (admin)` already exists in the product** (visible in his screenshot, `Gabriel`,
`Leave quota 0 left`). ❓ **Whether this override IS that unlock, or a second thing, is @Sober's to check** —
🚫 **I am not assuming they are the same control.**

## §11.2 — 🆕 The EXPIRY DATE must be ADMIN-EDITABLE
> *"เขาสามารถเลือก expire date ให้ได้ แล้วแต่แอดมิน ขวาบน ควรแก้ได้"*
**The expiry shown top-right on a course card** (`expires 2026-09-27` with a calendar icon) **must be editable
by an admin.** ⇒ **the admin sets it outright, whatever the derivation would have produced.**
🔴 **THE CONFLICT I AM FLAGGING, because it is real and one night old:** **`TASK-282` made expiry DERIVED — it
now covers the last planned session, and that is what KILLED DEF-4.** ⇒ **an admin-set expiry must not be able
to re-open DEF-4 by landing BEFORE the course's own last session.**
📖 **MY READING, and it is mine:** **an admin may set the expiry LATER than derived freely; setting it EARLIER
than the last planned session must at minimum SAY what it will cut off.** 🔑 **DEF-4 was exactly this — an
expiry preceding the course's own last session — and it reached the owner's hands.** ⚠️ **One line from him
overturns me.**
❓ **@Sober: is the calendar icon already a control, or only a label?** **His words *"ควรแก้ได้"* read as "it
ought to be editable", which suggests today it is not.**

## §11.3 — RATIFIED by the owner, 2026-09-08. **§11.2's reading is no longer @Porter's — it is the rule.**
✅ **LATER than the derived expiry — the admin sets it freely, no warning, no friction.**
✅ **EARLIER than the course's own last planned session — allowed, but the system must SAY WHAT IT CUTS OFF
before it is saved.**
🚫 **Not a refusal. The admin may still do it** — **they simply may not do it BLIND.**
🔑 **Why this specific shape and not a hard block: DEF-4 was an expiry preceding the course's own last session,
and it reached the owner's hands because NOTHING SAID SO.** ⇒ **the defect was never that the date was wrong;
it was that the date was silent.** **`TASK-282` fixed it by DERIVING the expiry; this preserves that guarantee
while giving the admin the override he asked for.**
📌 **The two rules together are the whole feature: the system is right by default, and the admin can be righter,
out loud.**

## §11.4 — CLARIFICATION, owner 2026-09-08. **`§11.1` was never about the leave quota. There is no override requirement.**
> *"ไม่เกี่ยวกับโควตาลา หมายถึงแอดมินสามารถเลื่อนวันหมดอายุคอร์สได้เว้ย เพื่อที่อาจจะใส่วัน extra เพิ่มได้ ยังไงก็แล้วแต่"*

🔴 **`§11.1` is WITHDRAWN. It was never a second feature.**
**His *"ยืดให้พิเศษได้"* meant ONE thing: MOVE THE COURSE EXPIRY DATE** — so an admin can fit an extra session
in, or whatever the situation needs. ⇒ **it is `§11.2`, said a different way, and `§11.2` already exists.**
🚫 **Nothing to decide about `adminUnlocked` vs a per-change `override`.** **Both remain as they are; neither is
part of this batch.**

🔻 **How this went wrong, recorded because it is MY error and it is repeatable:** **he wrote "ยืดให้พิเศษ" in the
same breath as the week ceiling, so I read "extend" as *extend the ceiling* and turned it into a quota
question.** **It meant *extend the expiry*.** ⇒ **I invented a feature out of a verb, then asked him to choose
between two implementations of it.**
🔑 **The tell I missed: he had ALREADY said the ceiling stretches (`§10`). A second ceiling override on top of
that would have been redundant** — **and redundancy in a requirement is a sign that I have misread it, not a
sign that the customer wants belt and braces.**

## ✅ §11 — FINAL STATE
| | |
|---|---|
| **`§11.2` admin edits the expiry** | 🔴 **ALREADY BUILT** (`REQ-082` AC-1/AC-4) — **nothing to schedule** |
| **`§11.3` warn BEFORE saving** | ✅ **the only real work** — `TASK-298`, no migration |
| **`§11.1` admin override** | ⛔ **WITHDRAWN — never a requirement** |

# §12 — 🔴 CORRECTION OF `§11`. **@Porter misread it. There is only ONE limit on leave: the QUOTA.**
> *"quota ลา มี แต่การยืดเวลาไม่มี quota เพราะงั้นเคสนี้ ถ้าเขาจะลา ต้องได้ เพราะเขามี quota ลา
> ส่วนวันหมดอายุ ก็อย่างที่บอก ให้ยืดตามไปเลย หากเขายังมีสิทธิ์ลา"*

## 🔴 What `§11`'s table said, and why it was WRONG
**I wrote that AFTER creation *both* the quota AND the week ceiling apply, and that the ceiling "refuses".**
🔻 **That is not what he said.** **His words were *"กฏ มีไว้คุมโควตาลา หลังจากสร้างเท่านั้น"* — the rule that
lives after creation IS the quota.** **I read one sentence as describing two rules.** ⇒ **fourth time today I
have read a structure into his prose that was not in it.**

## ✅ THE RULE, corrected
| | |
|---|---|
| **Leave quota** | ✅ **the ONLY thing that may ever refuse a leave.** Course size decides it (`4→1 · 6→2 · 10→3`). |
| **Extension / the week ceiling** | 🚫 **NOT a quota, NOT a limit, and it may NEVER refuse a leave.** |
| **The expiry date** | ✅ **STRETCHES to fit, every time a leave is legitimately taken.** |
🔑 ***If the family still has leave quota, the leave goes through — and the dates move to make room.*** **There
is no second gate. Nothing else gets a vote.**
📌 **This is `§10`'s principle with the exception removed:** ***the plan decides the dates; the dates do not veto
the plan*** — **and now: at creation AND after it, identically.**

## §12.1 — The admin may edit the expiry AFTER creation, from the card
> *"ให้เขาปรับวันหมดอายุได้เลย หลังจากสร้างแล้ว ก็ควรกดตรงวันที่หมดอายุขวาบน ให้แก้ได้เลย"*
**The expiry shown on the course card — `expires 2026-11-04` with the calendar icon, top-right — must be the
control.** ⇒ **click it, change it.**
📌 **`§11.2` said the capability exists (`REQ-082` AC-1/AC-4, `EditExpiryDialog`).** ❓ **He is describing WHERE
it must be reachable from.** **If today it lives somewhere else, that is the gap — not the capability.**
🔑 **`§11.3` still applies to it: if the new date is EARLIER than the course's own last session, the system SAYS
WHICH SESSIONS IT CUTS, before saving.**

## §12.2 — SCOPE OF `§12`, owner 2026-09-09: **the late-notice cutoff STANDS.**
> *"ข"* — in answer to: does `§12` mean `LEAVE_NOTICE_TOO_LATE` no longer refuses a parent, **or** is a late
> leave a different thing from a leave?
✅ **A LATE leave is a DIFFERENT THING from a leave.** **`LEAVE_NOTICE_TOO_LATE` keeps refusing, including for a
parent on LINE self-service.** 🚫 **`§12` does NOT touch it.**

🔑 **So `§12` is narrower than its own sentence reads, and this is the line that makes it precise:**
***Among the reasons a leave may be refused for BEING A LEAVE, the quota is the only one.*** **`§12` deleted the
EXTENSION ceiling — a limit on how far the calendar may move.** **The notice cutoff is not that: it is about
WHEN the family spoke, not about how far the plan stretches.**
📌 **Recorded this way on purpose:** ⚠️ **`§12` as written — *"the quota is the ONLY thing that may ever refuse a
leave"* — would have deleted this cutoff too, and it is the sentence I wrote.** ⇒ **the correction is to MY
wording, not to his ruling.**
🔴 **Still true and still his to weigh some day, recorded not raised:** **an ADMIN has an override for this
cutoff and a PARENT does not**, and **the cutoff's cited authority (`UC-029`) does not exist in this workspace —
five files refer to it, none contains it.** 🚫 **Not blocking. Not a defect. Nobody may settle it but him.**

# §13 — 🔴 THE COMMAND KEYWORDS MUST ACCEPT ENGLISH TOO. **(owner, 2026-09-09)**
> *"ทำให้มันรองรับภาษาอังกฤษด้วยสิ เพราะลูกค้าของลูกค้าเราเป็นชาวต่างชาติก็มี"*
**Some of the school's parents are not Thai. Every command keyword must work in English as well as Thai.**

## 🔑 THIS IS NOT A NEW FEATURE — the customer's own copy ALREADY PROMISES IT
**`REQ-079 §17c`, their words, unedited:**
| screen | the English half literally says |
|---|---|
| 1 | *Please type **"register"** to start.* |
| 7 | *Please Type **"Confirm"** to save.* · *Type **"Cancel"** to exit.* |
| 8 | *please type **"Add Student"**.* |
🔴 **We were about to ship a bot that accepts `สมัคร` and REFUSES `register` — on a screen that tells the parent
to type `register`.** ⇒ **the English half of every screen would have been a LIE, in the customer's own words,
written by the customer.**
🔑 **So `§13` is not the owner adding scope. It is him catching that `§5` was only half-built** — **and neither
@Porter nor the team saw it while reading that copy line by line.**

## ✅ The pairs, from their copy where it exists
| Thai | English | source |
|---|---|---|
| `สมัคร` | `register` | 🟢 **theirs, screen 1** |
| `ยืนยัน` | `Confirm` | 🟢 **theirs, screen 7** |
| `ยกเลิก` | `Cancel` | 🟢 **theirs, screen 7** |
| `เพิ่มนักเรียน` | `Add Student` | 🟢 **theirs, screen 8** |
| `Next` | — | 🟢 already English |
| `ครู` | ❓ **`teacher`** | 🔻 **@PORTER'S PROPOSAL — their copy gives no English** |
| `แอดมิน` | ❓ **`admin`** | 🔻 **@PORTER'S PROPOSAL — same** |
| `ข้าม` | ❓ **`skip`** | 🔻 **@PORTER'S PROPOSAL — and see `§7`'s open question about advertising it** |

## 📌 Matching rules — @PORTER's, so the team is not left guessing
- **Case-insensitive** (`Confirm` · `confirm` · `CONFIRM`), **and trim surrounding whitespace.**
- **`Add Student` contains a SPACE** ⇒ **match it with the space collapsed too (`addstudent`, `add  student`).**
  🔑 **A parent typing on a phone is not typing carefully.**
- 🚫 **Do NOT accept partial or fuzzy matches.** **`reg` is not `register`.** ⇒ **a bot that guesses is worse
  than one that asks again**, and we have no way to say sorry to a parent it guessed wrong about.
- ✅ **The REFUSAL message must name BOTH forms** — today it names the Thai one only.

## 🔻 A side effect, named so nobody mistakes it for the reason
**English keywords are ASCII, so `adb shell input text` can type them** ⇒ **@Tanya's rig can drive the flow.**
🚫 **That is a CONSEQUENCE, not a justification.** **If the owner had not asked for this, the right answer would
still have been to fix our tooling — never to shape the product around what our tools can type.**

## §13.1 — OWNER, 2026-09-09: **EVERY keyword. Not just registration.**
> *"เอา teacher admin skip และอื่นๆด้วย เอาทั้งหมดอ่ะ"*
✅ **`ครู`→`teacher` · `แอดมิน`→`admin` · `ข้าม`→`skip` RATIFIED.**
🔴 **AND the scope is now EVERY Thai command keyword the bot accepts ANYWHERE** — **not only the eight
registration screens.** **Leave, check-in, the course view, the menu commands, anything a parent or a teacher
may be told to type.**

🔑 **The principle, so this does not need re-deciding for the next keyword we add:**
***If the bot can be TOLD to type a word, it must accept that word in both languages.*** ⇒ **a keyword that
exists in one language is a door only half the parents can open.**
📌 **And the test follows from the principle, not from a list:** **for every keyword the bot accepts, an English
form is accepted too** — **so a keyword added next month FAILS the test until it has one.** 🔑 **A list would
be complete on the day it was written and wrong a week later.**

### ❓ WHAT @PORTER OWES, and it must not be invented by an engineer
**The English word for every Thai keyword that the CUSTOMER'S COPY does not already give.**
⇒ **@Sober is asked for the INVENTORY — every Thai keyword the bot accepts, and where each lives.**
**@Porter supplies the English for each.** 🔻 **Copy is mine. An engineer picking these would be the
`TASK-278` mistake again: an engineering judgement quietly deciding what a parent reads.**
⚠️ **Four are already fixed by the customer and are NOT mine to change:** `register` · `Confirm` · `Cancel` ·
`Add Student`.

## §13.2 — 🔻 CORRECTION OF `§13`. **@Porter's headline claims were FALSE. @Sober caught them before they reached the owner.**
🔴 **I wrote that the bot accepts `สมัคร` and REFUSES `register`, and the same for `Confirm` and `Cancel`.**
**All three were WRONG.** **`src/lib/line-commands.ts` has carried `register` · `confirm` · `cancel` — and
`menu` `help` `courses` `admin` `children` `qr` `checkin` `leave` `schedule` `calendar` `skip` — for some time.**
🔑 **The accurate sentence is @Sober's:** ***most of it was never broken — and the one thing that IS broken is
not the thing the reading would have found.***
🔻 **What I actually did: I read the customer's English half, assumed we had ignored it, and inferred a defect
from a DOCUMENT instead of the code.** ⚠️ **The same morning I told @Sober that *"I verified at source" is no
longer acceptable on its own*. This is that failure from the other side — I verified at NEITHER.**
📌 **Left visible, not rewritten. `§13`'s PRINCIPLE stands; its evidence did not.**

### ✅ What was actually missing — two things, and one of them is a live defect
1. **`ครู` had no `teacher`.** ✅ **Ratified by the owner.** **The only true gap in the vocabulary list.**
2. 🔴 **`Add Student` — the bot OBEYS ITS OWN INSTRUCTION and creates a child named `Student`.**
   `line-webhook.service.ts:1028` matches `add\s*(.*)`, so **screen 8's *please type "Add Student"* makes `add`
   the command and `Student` the NAME.** 🔴 **It does not refuse. It SUCCEEDS, wrongly, and silently** —
   **`Student` is not reserved (`students` is).**
   🔑 **`TASK-245`'s defect returned exactly:** ***the bot advertises a phrase and swallows part of it as data.***
   ⚠️ **And the record is PERMANENT: there is no delete route and no archive flag.**
   ⇒ **the failure is: obey our own screen, in the language our own screen offers, and create an undeletable
   record.** ✅ **Fixed immediately, on @Porter's call, while the owner was inside that flow.**

## §13.3 — OWNER, 2026-09-09: **every English keyword is CASE-INSENSITIVE. All of them.**
> *"คำสั่งภาษาอังกฤษ ต้องไม่สนใจ จะพิมพ์เล็กใหญ่ได้หมด เช่น confirm Confirm ConFirm ConFiRM"*
✅ **`confirm` · `Confirm` · `ConFirm` · `ConFiRM` · `CONFIRM` — all accepted, and the same for EVERY English
keyword, not only `confirm`.**
🔑 **His four examples are deliberately absurd, and that is the point: the rule is not "handle Title Case".**
**It is *"the letters are what matter; their case never does."*** ⇒ **the test uses randomised or absurd casing,
not `Confirm` — because a test written with `Confirm` passes a `toLowerCase()` on the FIRST letter only.**
📌 **`Add Student` has a SPACE as well as case** ⇒ **`ADD STUDENT`, `add student`, `AdD StUdEnT`, and the space
collapsed.** **Case and whitespace are separate rules and both apply.**
🚫 **Still NO fuzzy matching. `CONFIRMM` is not `confirm`.** 🔑 **Case-insensitive is not the same as forgiving:
we accept the same WORD however it is typed; we do not accept a different word.**
⚠️ **This applies to the ENGLISH forms.** **Thai has no case, so nothing changes there.**

## §6.1 — OWNER, 2026-09-09: **the no-skip rule applies to a family with NO children only. RATIFIED.**
> *"แก้ไขให้ หากมีลูกอยู่แล้วไม่ต้องให้เพิ่ม ถ้าเขาจะเพิ่มให้เขากดเอง แต่คนไม่มีลูก บังคับเพิ่มตั้งแต่แรกแบบนี้ถูกแล้ว"*
| linked family has | after the link |
|---|---|
| **0 children** | ✅ **mandatory name prompt — `§6` unchanged, and he confirms it is right** |
| **≥ 1 child** | 🚫 **NO prompt.** *"found your family — …"* → the customer's screen-8 invitation → the menu. **They add by choosing to.** |
🔑 **His sentence is the rule: *"ถ้าเขาจะเพิ่ม ให้เขากดเอง"* — if they want to add, they do it themselves.**

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
