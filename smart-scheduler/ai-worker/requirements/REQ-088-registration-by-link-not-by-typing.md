# REQ-088 — Registration by LINK, not by typing

**From:** the customer via the owner, 2026-09-12 · **Held by:** @Porter · **Status:** 🆕 written, NOT dispatched
> **Owner:** *"ลูกค้าบอกว่า ลูกค้าของลูกค้าไม่ค่อยทำตามคำแนะนำแอดมิน คำสั่ง สมัคร เลยอยากให้เราเปลี่ยนเป็นกดลิ้ง ให้เขาทำการกรอกเอา"*
> **Customer, verbatim:**
> ```
> กดเข้าลิ้งค์ไป
> - กดยอมรับให้เชื่อมไลน์
> - ใส่เบอร์
> *มีลูกอยู่แล้ว ขึ้นชื่อลูก กดเชื่อมไลน์
> *ไม่มี ให้สร้างใหม่ ใส่ข้อมูลตามในลิ้งค์ฟอร์มที่ขวัญส่งให้
> Done
> แค่นี้ค่ะ
> ```

## 🔑 THE FINDING UNDER THE REQUEST — and it is the reason this is not a feature request
***"Parents do not follow the admin's instruction to type `สมัคร`."*** ⇒ **the 8-screen chat registration we
finished four days ago (`REQ-079 §17c`) has a failure mode that no amount of copy fixes: it needs the parent to
TYPE A WORD, and they will not.**
🔴 **This is not the customer changing their mind. It is the customer reporting that the surface does not work
with their users.** 📌 **We spent a week getting the WORDS right; the problem was the ACT of typing.**
⇒ **A link is something a parent taps. It removes the instruction entirely.**

## §1 The flow, as they wrote it — one screen at a time
| step | what the parent does | what the system does |
|---|---|---|
| 1 | **taps a link** | opens a page inside LINE |
| 2 | **taps "allow" on the LINE connect** | 🔑 **LINE Login — we receive their LINE identity without them typing anything** |
| 3 | **enters their phone number** | looks the family up |
| 4a | **family found → child names shown → taps "link"** | links this LINE account to the family |
| 4b | **no family → "create new" → fills the form** | ❓ **"the form ขวัญ sent" — we do not have it** |
| — | **Done** | |
🔑 **Steps 2 and 3 are the whole change.** **Today step 2 is "type `สมัคร`, type `Next`" and step 3 is "type
your phone"; here they are a tap and a field.** **4a/4b are the SAME branches the chat flow already has**
(`REQ-079 §17c` screen 4, existing-family vs new-parent) — **the logic exists; the surface changes.**

## 🔴 §2 TWO THINGS I DO NOT HAVE, and the REQ cannot be shaped without them
1. 🔴 **"ลิ้งค์ฟอร์มที่ขวัญส่งให้"** — **the form for a NEW parent.** **We have never seen it.** ⇒ **I need the
   owner to get it from the customer.** ⚠️ **It decides what fields a new registration collects — which may or
   may not match the chat flow's (name · DOB · address).**
2. ❓ **Does the CHAT flow stay?** **Three possibilities, and they are different amounts of work:**
   - **(a) the link REPLACES chat registration** — the eight screens are retired
   - **(b) both stay** — a parent who does type `สมัคร` still gets the chat flow
   - **(c) chat stays only for `Add Student` after linking**
   📖 **My reading, marked as mine: (b).** **The chat flow is finished and tested; retiring it costs more than
   leaving it. And "parents will not type" is a tendency, not a law.** ⚠️ **But it is the customer's call.**

## §3 What this needs that we do not have today — for @Sober to size, NOT for me to design
- **A LINE Login / LIFF app registered on the CUSTOMER'S OA** — 🔴 **their console, their action.** **Same
  class as the webhook URL: it is a setting on their side that only they can make.**
- **A web page that runs inside LINE, takes a phone, and calls the SAME link/create logic the chat flow calls.**
- **The link itself** — where does the parent get it? **The rich menu? The greeting? A message the admin
  sends?** ❓ **The customer said "กดเข้าลิ้งค์ไป" and did not say from where.**

## 🚫 §4 What this REQ is NOT
🚫 **Not dispatched.** **The owner's rule: a batch is sent as one, by him.** 🚫 **Not sized by me.**
🚫 **Not a reason to touch the chat flow that just shipped.** 📌 **And not small: it is a new surface, on the
customer's OA, needing a console change only they can make.** ⚠️ **Worth saying before anyone hears "just a
link".**

## §5 — OWNER, 2026-09-12: **the form is NAME · DATE OF BIRTH · ADDRESS. Nothing else.**
> *"แค่ทำให้เขากรอกบนเว็บ ชื่อ · วันเกิด · ที่อยู่"*
✅ **`§2` question 1 CLOSED: there is no mystery form.** **"The form ขวัญ sent" is these three fields** — 🔑 **the
SAME three the chat flow already collects** (`REQ-079 §17c` screens 4–6). ⇒ **the web form collects exactly what
the chat collects, in the same rules: DOB `DD-MM-YYYY`, address FREE TEXT, name as typed.**
📌 **So the new page is the chat's screens 3–7 as ONE form, plus LINE Login in front.** **No new data, no new
validation, no new storage.** 🔑 **That is what makes it sizeable.**

### 📖 Two things he did NOT say, read by @Porter and marked as such
- **The CHAT flow STAYS.** **He said "make them fill it on the web", not "remove the chat".** ⇒ **both doors,
  one writer — the rule this week has been teaching us (`TASK-313`, `TASK-315`).** ⚠️ **One line overturns me.**
- **WHERE the link lives:** ✅ **my proposal — the UNKNOWN-user rich menu (`unknown-TH`), whose cell today says
  "type สมัคร", becomes the link; and the admin can paste it.** 🔑 **The rich menu is the one surface a parent
  taps without being told to** — **which is the whole point of this REQ.** ⚠️ **The customer removed the menus
  from their OA on 09-08 until the messages were ready; this would be the reason to put them back.**
🚫 **The `สมัคร` keyword is NOT removed** — a parent who does type it still works.

## §6 — OWNER, 2026-09-12: **the ADMIN sends the link.** *"แอดมินส่งให้"*
🔻 **My rich-menu reading in `§5` is WITHDRAWN.** ✅ **The link reaches a parent because an ADMIN sends it** —
in the LINE chat, by hand. 🚫 **Not from the rich menu. Not from the greeting.**
🔑 **And it fits the customer's own words better than mine did — *"จะบอกลูกค้าให้กดเอง"* (`REQ-079 §17g`):
they want the admin to be the one who hands a parent the way in.** ⇒ **the admin's message IS the greeting;
the link is what they send.**
📌 **So the link must be STABLE and SHORT enough to paste** — **one URL, the same for everyone, that the admin
keeps to hand.** **Whether it also appears anywhere else is a later question, not this REQ.**

## §7 — OWNER, 2026-09-12, after using the form himself: **make DOB and ADDRESS pickable, not typed.**
> *"การใช้งานยากไปหน่อย อยากให้ตรงเลือกวันเดือนปีเกิดง่ายกว่านี้ อาจจะเปิด datepicker ให้เลย … สำหรับลูกค้าที่แค่พิมพ์ สมัคร ยังขี้เกียจ
> และที่อยู่ ทำให้เขาเลือกง่ายๆ กว่านี้ได้มั้ย เป็น เขต แขวง จังหวัด เป็น relation selection คือการเลือกจังหวัดมีผลให้ตัวเลือกข้างหลังลดลง"*
🔑 **The same insight that created this REQ, applied one level down: a parent who will not TYPE `สมัคร` will not
type `08-09-2020` or `พระโขนงเหนือ วัฒนา กทม` either.** ⇒ **every field that can be a TAP should be a tap.**
✅ **Round 2 PASSED first** — `"Gekko" has been added successfully. ✅ · Date of birth: 08-09-2020 · Now 1
child(ren) on file · Add a child` — **the NEW-parent path works end to end on the phone.**

### 7a — DATE OF BIRTH: a picker, not a text field
✅ **A date picker.** 🔑 **Requirement, not design: it must be EASY for a parent choosing a birth YEAR that is
2–15 years back** — **a picker that opens on today's month and makes them tap "previous month" 100 times is
worse than typing.** ⇒ **year first, or a year/month jump, is the acceptance criterion.**
📌 **The stored value is UNCHANGED** — `DD-MM-YYYY` text, the customer's format. **The picker is how it is
ENTERED, not how it is kept.** 🚫 **No migration.**

### 7b — ADDRESS: three cascading selects — จังหวัด → เขต/อำเภอ → แขวง/ตำบล
✅ **Province narrows district; district narrows sub-district.** 🔑 **Bangkok uses เขต/แขวง; every other province
uses อำเภอ/ตำบล — the LABELS must follow the province chosen.** **A parent in Chiang Mai reading "เขต" will
hesitate.**
🔴 **THE COST IS DATA, NOT UI: this needs the Thai administrative-division list** — 77 provinces, ~900
districts, ~7,000 sub-districts. **Where it comes from, how it is loaded, and how big it is on a phone are
@Sober's to size.** ⚠️ **It is the one part of this REQ that is not "the chat's logic on a page".**
📌 **The stored value is UNCHANGED:** **the three picks are JOINED into the same free-text string the chat
stores** — `พระโขนงเหนือ วัฒนา กทม`, exactly the customer's own example. 🔗 **`REQ-085 §16e`'s address-is-free-
text ruling STANDS — the picker is a better way to produce the same string.** 🚫 **No migration, no new column.**
⚠️ **And a parent who cannot find their sub-district must not be STUCK** — **either an "other / type it" escape
or the field stays optional, as it is today.** **Not decided; @Sober to propose.**

## §8 — OWNER, 2026-09-13, after testing `§7`: **a LANGUAGE TOGGLE on the page. Prominent. TH / EN.**
> *"ทำปุ่มเด่นๆ ให้เปลี่ยนภาษาได้ ให้เหมาะสำหรับคนไทย และชาวต่างชาติ"*
✅ **`§7` PASSED on his phone** — picker opens on years, address tiers flip to เขต/แขวง for Bangkok, typed
fallback works, and **pick mode is the DEFAULT** (he confirmed).

### 8a — the toggle, and why it is not the chat's bilingual-in-one-bubble
🔑 **The chat stacks Thai and English in ONE message because a bubble can be tall.** **A FORM cannot — doubling
every label doubles the page.** ⇒ **the page shows ONE language at a time, with a prominent switch.**
✅ **Requirement: a visible TH / EN control at the TOP of the page, before the first field.** **Not a footer
link. Not a settings icon.** 🔑 **"เด่นๆ" — a foreign parent must see it before they hit a Thai label.**
📌 **Default language:** 📖 **my reading, marked as mine — follow the LINE app's language (LIFF exposes it).**
**A Thai phone opens Thai; an English phone opens English; the toggle overrides.** ⚠️ **One line overturns me.**
🚫 **The STORED data does not change with the toggle** — a Thai address is a Thai address whichever language the
labels are in. **Only labels, hints, buttons and errors switch.**

### 8b — two copy fixes from the same screenshots
- **`Province` → `จังหวัด` in Thai mode** — the tier labels were Thai while the province label was English.
  **Under `§8a` this becomes: every label exists in both languages, and none is hard-coded in one.**
- ✅ **The typing instruction (*"Please enter your address: District, Sub-district, Province Eg. …"*) shows in
  TYPED mode only** — owner: *"คิดว่าใช่"*. **In pick mode the three tier labels ARE the instruction.**

### 📌 What this settles about the 29 placeholders
**They are no longer "29 strings for the customer to see once".** ⇒ **They are 29 PAIRS, and the customer
sees the Thai half.** 🔑 **The English half is mine, and it should be the English the customer already wrote
in `§17c` wherever a field matches** — **their English, not fresh English.**

## §9 — OWNER, 2026-09-13: **`province` holds the PROVINCE; the full address goes into the parent's NOTE.** No new column.
> *"เอาเป็นเก็บจังหวัดและที่อยู่ อันนี้ให้เป็น note สำหรับลูกค้า หากลูกค้าใช้ selection address ให้เก็บจังหวัดลงจังหวัด และเอาจังหวัด
> และอำเภอ ตำบล มาต่อกัน แล้วเซฟลง note แทน"*
✅ **RULING — two existing columns, no migration:**
| column | holds | example |
|---|---|---|
| **`parents.province`** | **the PROVINCE only, the admin form's full name** | `กรุงเทพมหานคร` |
| **`parents.note`** (*"Anything staff should know about this family"*) | **the full address string, the customer's format** | `พระโขนงเหนือ วัฒนา กทม` |
🔑 **So the demographics report groups correctly (one bucket per province, admin-entered and LINE-entered
alike), AND the customer's line is kept — in the field staff already read.** 📌 **Better than my option (ค):
same outcome, no migration, and the address lands where an admin will actually see it.**

### 📖 What he did NOT say — my readings, marked as mine
- **PICKED address:** `province` ← the picked province · `note` ← the three picks joined. **(His words.)**
- **TYPED address (the "Type it instead" path, and the CHAT's screen 6):** ✅ **the typed string → `note`;
  `province` left EMPTY.** 🚫 **No guessing the province out of free text** — a wrong bucket is worse than an
  empty one. ⚠️ **Overturnable in one line.**
- **The CHAT must do the same** — it is the SAME writer (`createStudentFromLine` / the link decision), so this
  is one change, not two. 🔑 **If the chat kept writing the line into `province`, the report split would
  simply move to the chat-registered families.**
- **An existing `note` is APPENDED to, not overwritten** — a staff note about allergies must not vanish because
  a parent re-registered.
🔗 **`REQ-085 §16e` (address is free text) STANDS** — free text it remains; it just lives in `note`.

## §9.1 — OWNER, 2026-09-13: **existing rows — address moved to `note` by his own hand; `province` LEFT AS IS.**
> *"ย้ายไป note ให้แล้ว ปล่อยจังหวัดพัง ให้เขาเจอ dashboard พัง แล้วให้เขาไปไล่แก้เอง (admin)"*
✅ **The owner ran the data move himself** — the old address strings are now in `note`.
🔑 **DELIBERATE: `province` on those rows is NOT cleared.** **The demographics dashboard will show the old
address strings as "provinces" for LINE-registered families** ⇒ **the customer's admins see it broken, open
each parent, and set the real province themselves.**
📌 **The reason, and it is a good one: the ADMIN is the only person who knows which province a family is in
when the stored text is ambiguous** — **and a dashboard that visibly needs fixing gets fixed; a silently empty
field never does.** 🚫 **Not a defect. A decision, recorded so nobody "cleans it up" with a script.**

## §10 — OWNER, 2026-09-14, from the page on the customer's box (`frontoffice.develyst.online`, opened in LINE): **three changes.**
> *"แก้ไข เพิ่ม 3 เรื่อง — 1.แก้ชื่อหน้าแอปให้เป็น SOM SCHEDULE 2.ตัวเลือก จังหวัด อำเภอ ตำบล ตอนนี้ข้างใน dropdown เป็นภาษาไทย แม้จะเปลี่ยนภาษาเป็นภาษาอังกฤษ 3.เมื่อเราเชื่อมรหัสไปแล้วครั้งนึง แต่กดลิ้งอีกแล้วพอกดเบอร์อื่น เหมือนเราไม่รู้ว่าเราลิ้งค์ไปแล้ว มันไม่มี error หรือ warning มาเตือน แต่เงียบไปเฉยๆเลย แก้ให้เป็นเตือนว่าคุณลิ้งแล้วนะ จะปลดลิ้งค์มั้ย ถ้าจะปลดก็กดปุ่มนี้ๆ ได้"*
📌 **Evidence the page is LIVE on `uat`:** the screenshot's LIFF header reads `frontoffice.develyst.online`.

### §10.1 — the page title is **`SOM SCHEDULE`**
The LIFF header shows the page's document title; today it says `Smart Scheduler`. **The `/register` page (and
the LIFF header with it) must read `SOM SCHEDULE`** — his spelling, upper case.

### §10.2 — in EN mode the address DROPDOWN OPTIONS are English too
**REVERSES `§8` "only labels switch" / TASK-351 "values stay Thai" for the three address tiers.** In EN the
province / district / sub-district lists show English names; in TH, Thai. 🚫 **What is STORED does not
change:** `province` keeps the Thai full name (the admin list's spelling — the `§9` repair path depends on
it); `note` keeps the Thai line. **English is a DISPLAY of the same GEOCODE-keyed row.** *(Whether the
dataset already carries English names is @Sober's to confirm; if it does not, that is the cost he reports.)*

### §10.3 — a LINE account that is ALREADY LINKED gets told so, with an UNLINK button
Today: an already-linked LINE user opens the link again, enters a DIFFERENT phone ⇒ **nothing happens, no
message.** Required: **on open, if this LINE account is already linked to a parent, say so** — *"this LINE
account is already linked to (phone 0xx-xxx-xxxx). Unlink?"* — **with an UNLINK button; after unlinking the
normal flow (phone → found/new) proceeds.** Both languages. 🔑 **The unlink is the SAME operation the admin's
`Clear LINE link` button does — one writer, one more door.** 🚫 No silent path remains: linked ⇒ warned.
📌 **PM, 2026-09-14: `§10.1` covers `/checkin` too** — the other page a parent opens inside LINE; same reason, same title.
📌 **`§10.3` as built: UNLINK is FAMILY-WIDE** (it is the admin's `Clear LINE link` by another door — clears every linked account in the household). Two taps, plain copy. **Per-account unlink is a second writer = a task, only on the owner's word.** ⏱️ With the owner.
📌 **PM, 2026-09-14: `§10.1` covers `/checkin` too** — the other page a parent opens inside LINE; same reason, same title.
📌 **`§10.3` as built: UNLINK is FAMILY-WIDE** (it is the admin's `Clear LINE link` by another door — clears every linked account in the household). Two taps, plain copy. **Per-account unlink is a second writer = a task, only on the owner's word.** ⏱️ With the owner.
✅ **OWNER, 2026-09-14: "ได้ละ" — FAMILY-WIDE unlink accepted as built.** Per-account unlink is NOT wanted; not a task.
