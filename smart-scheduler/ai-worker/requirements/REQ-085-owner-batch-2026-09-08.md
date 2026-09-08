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
