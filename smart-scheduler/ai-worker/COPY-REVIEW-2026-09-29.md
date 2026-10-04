# COPY REVIEW — the REQ-110 round
**ONE file for every new draft string in this round**, per @Porter (2026-09-29). **It grows as the round goes; @Porter sends it to the owner when he judges it worth his time.**
🔑 **Code is never held for these.** **Every string below is already live behind a SHAPE pin, so the owner can rewrite every word and nothing breaks.**
⚠️ **@Porter: the "where / when" and "what it promises" lines are mine, in English. You own the Thai** if he reads this file himself.

📌 **Still open from the 09-28 file:** nothing — **§A–§E and the eight §D2 labels are all approved and now pinned by value.**

---

## 1 · Bookings page — the "select all" label 📋 DRAFT
**Where / When:** the Booking list, above the tick column, when an admin is confirming several sessions at once.
**Was:** *"Select all pending"* / *"เลือกทั้งหมดที่รอยืนยัน"*
**Now (draft):** *"Select all that can be confirmed (this page)"* / *"เลือกทั้งหมดที่ยืนยันได้ (หน้านี้)"*
**Promises:** it ticks **every row on THIS page that the system will accept**, and nothing on other pages.
🔑 **Why it had to change:** **Khwan asked for Extended sessions to be confirmable in bulk, and they now are — which made the old label a lie.** *It said "pending" while the control had stopped meaning pending.*
📌 **Two things deliberately kept in the words: it no longer says "pending" alone, and it still says "this page"** — *an admin who thinks they ticked the whole list is the next complaint.*

---

## 2 · Item 5 — the coach who GAINS a class ✅ no new wording needed
**Where / When:** an admin covers ONE session with another coach (Swap or Move session), or adds a coach to one session.
**Finding (@Jason, TASK-562):** these doors **already send approved notices**. Nothing new is drafted:
- the coach who **gains** the class gets `teacher_assigned` (date + time);
- the coach who **loses** it gets `teacher_unassigned`;
- an **added** coach gets `other_teacher_added`, listing just that one date.
**Promises:** the gaining coach is told, and so is the losing one. **The losing half needed no new ruling: it was already told.**

---

## 3 · Item 5 — cover with no rate on file (admin, Thai only like every admin error) 📋 DRAFT
**Where / When:** an admin covers one session with a coach who has **no rate in that series**, and leaves the rate empty.
**Now (draft):** *"วันที่ <date>: ครูที่มาสอนแทนยังไม่มีค่าสอนในตารางนี้ — กรุณาระบุค่าสอนของครูที่สอนแทน"*
**Promises:** nothing is saved. The admin types the covering coach's rate. 🔑 **The system never pays the cover at the covered coach's rate by default** (the owner: the cover is paid at the covering coach's rate).

## 4 · Item 5 — "this session, or from here on?" (admin) 📋 DRAFT
**Where / When:** a request to add or swap a coach that names neither choice. The screen should always ask, so an admin only sees this if the screen didn't.
**Now (draft):** *"เลือกอย่างใดอย่างหนึ่ง: เฉพาะครั้งนี้ หรือ ตั้งแต่ครั้งนี้เป็นต้นไป"*
**Promises:** nothing is saved until one is chosen. 🔑 **This is Khwan's complaint turned into a rule: no silent "all".**

---

## 5 · Item 2 — a coach on an advance leave that day (admin) 📋 DRAFT
**Where / When:** any new booking, move, swap, co-teacher or cover onto a day the coach has an advance leave recorded. Also an Undo or re-confirm that would put a class back on that day.
**Now (draft):** *"ครู<ชื่อ> ลาวันที่ <date> — เพิ่มคาบกับครูวันนี้ไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น"*
**Promises:** nothing is saved; pick another coach or another day. *(Automatic make-ups never show this: they skip to the next free week.)*

## 6 · Item 8 — deleting a camp week that has bookings (admin) 📋 DRAFT
**Where / When:** an admin deletes a camp week, and at that moment it has bookings (even cancelled ones).
**Now (draft):** *"ลบสัปดาห์ <ชื่อ> ไม่ได้: มีการจองวันแคมป์ <n> รายการ[ และที่ยกเลิกแล้ว <m> รายการ] — ใช้ "ปิดรับ" แทน เพื่อหยุดรับจองใหม่ (การจองเดิมยังอยู่)"*
**Promises:** nothing is deleted; Close is the way to stop new bookings. ⚠️ **"Existing bookings stay" is only fully true after the Close ruling that is with the owner (TASK-560 finding).**
**Its twin** (a booking made while the week was being deleted): *"สัปดาห์ <ชื่อ> ถูกลบไปแล้ว — ไม่ได้บันทึกอะไร กรุณาเลือกสัปดาห์อื่น"*

## 7 · TASK-556 — Undo refused for an older course (admin) 📋 DRAFT
**Where / When:** undoing a leave on a course opened before this box began recording expiry changes, where the make-up sits on the expiry.
**Now (draft):** *"ย้อนกลับการลานี้อัตโนมัติไม่ได้: คอร์สนี้เปิดก่อนระบบเริ่มบันทึกการเลื่อนวันหมดอายุ (เริ่มบันทึก <date>) จึงบอกไม่ได้ว่าวันหมดอายุ <expiry> ถูกเลื่อนเพราะคาบขยาย <make-up date> หรือไม่ — กรุณาเปิดหน้าคอร์ส ตรวจวันหมดอายุกับประวัติการลา แล้วแก้การลาและวันหมดอายุด้วยตนเอง"*
**Promises:** nothing changes. It says **what to open and what to fix**, not that a computation failed.

---

## 8 · Item 10 — duplicate name on the LINE register form (PARENT-facing, both languages) 📋 DRAFT
**Where / When:** a parent registers a child whose name is already in their family.
**Was** (the page copies the chat's `add_dup_detail`): *"There is already a child with that name. Please add a surname or nickname so they are not mixed up."*
**Now (draft):** *"มีน้องชื่อนี้ในครอบครัวแล้ว — กรุณาใส่ชื่อจริงของน้อง (ชื่อ-นามสกุล) เพื่อไม่ให้สับสนกันค่ะ"* / *"There is already a child with this name. Please enter the child's real name (first name and surname) so they are not mixed up."*
**Promises:** the form stays open with the name field; the next submit is accepted with the fuller name.
📌 **These words live on the PAGE** (the server returns only the code `NAME_DUPLICATE_NEEDS_DETAIL`, which is unchanged). ⚠️ **The LINE chat has its own copy of this sentence and keeps "more detail":** the owner named the page only. Say if the chat should match.

## 9 · Item 10 — the two new "required" messages on the register form (PARENT-facing) 📋 DRAFT
**Where / When:** the parent presses submit with the birthday empty (`BIRTHDATE_REQUIRED`), or with no address while the family has none on file yet (`ADDRESS_REQUIRED`). The page should stop them earlier with the `*`, so these are the server's backstop.
**Now (draft):**
- *"กรุณาใส่วันเกิดของน้อง (วว-ดด-ปปปป เช่น 02-12-2020)"* / *"Please enter the child's birthday (DD-MM-YYYY, e.g. 02-12-2020)."*
- *"กรุณาเลือกจังหวัดและใส่ที่อยู่ (ถามครั้งเดียวต่อครอบครัว)"* / *"Please choose the province and enter your address (we only ask once per family)."*
**Promises:** nothing is saved until filled; the address is not asked again for the next child.
⚠️ **One existing sentence becomes FALSE:** the invalid-birthday message ends *"…or leave it blank"*. **Leaving it blank is no longer allowed**, so that half-sentence must go (the page's copy).

---

## 10 · Item 6 — the attention card for a moved course (ADMIN panel + the LINE digest's count) ⛔ **SUPERSEDED BY §12 (owner, 2026-10-01)**
> 🚫 **Do not use this wording.** The owner ruled *"12 เอาแบบยาว"* — **§12's longer wording wins on the ADMIN panel**, because it carries the words the move dialog's own warning uses (**ตารางเดิม / old dates**) and this draft does not.
> 📌 **Kept, not deleted:** *a superseded draft that vanishes reads as an oversight; one marked superseded reads as a decision.* ✅ **It is still worth reading** — the `<new start> · <child> · <sessions pending>` line shape and the "count only in the digest" promise below are UNCHANGED by the ruling, which touched the heading sentence alone.
> ⚠️ **The heading sentence still lives in the BACKEND** (`line-i18n.ts`, the LINE digest) — **@Jason's, not mine.** Derived and reported in TASK-602; 🚫 I did not touch it.
> ✅ **DONE — @Jason, TASK-603 (2026-10-01):** the backend's digest heading now carries **§12's sentence**, so the admin panel (the FE dictionary) and the LINE digest say the same thing. 🚫 **Nothing renumbered, nothing deleted.**
> 🔑 **Unchanged, and pinned so:** the `<new start> · <child> · <sessions pending>` line shape, and **the digest carries the COUNT only — no names** (asserted in both languages, with the items handed in on purpose).
> 📌 **The fit question @Sober raised, answered with numbers:** as a digest line (`• <heading>: <n>`) §12's wording is **69 Thai / 76 English characters**; the longest already shipping there, `orphaned_sessions`, is **55 Thai / 78 English** — also long, also with a parenthetical. ⇒ **the English is SHORTER than one already in the same digest**, so it is within precedent and 🚫 **no STOP was needed.**
**Where / When:** an admin moved a confirmed course's start date and has not re-confirmed it yet, shown from that moment.
**Now (draft):** *"คอร์สที่เลื่อนวันเริ่มแล้ว รอยืนยันใหม่"* / *"Courses with a moved start date, awaiting re-confirmation"*
**Promises:** each line is `<new start> · <child> · <sessions pending>` on the panel. The morning digest shows only the COUNT (no names).
**It goes away when:** the course is confirmed (or every session one by one), or it ends or is paused.

---

## 11 · Item 6 — the preview before the move (ADMIN dialog) 📋 DRAFT (Fern, TASK-574)
**Where / When:** an admin opens *Move the start date*, picks a date, and presses **"Check what would change"** — the server answers with the plan it *would* carry out, and writes nothing.
**Now (draft), five strings:**
- *"ปัจจุบัน {current} — คาบแรกจะย้ายไปวันใหม่ คาบถัดไปเลื่อนตามสัปดาห์ละคาบ"* / *"Currently {current}. The first session moves to the new date; the rest follow week by week."*
- *"ดูว่าจะเปลี่ยนอะไร"* / *"Check what would change"* — the preview button, deliberately **not** "Confirm" or "Save".
- *"จะย้าย {n} คาบ:"* / *"{n} sessions would move:"* — **would**, not will.
- *"{from} → {to}"* — one row per session that actually moves.
- 🔑 *"ระบบจะตรวจอีกครั้งเมื่อกดยืนยัน จึงยังมีสิทธิ์ปฏิเสธได้"* / *"The server checks again when you confirm, so it may still refuse."*
**Promises:** pressing the preview button changes nothing on the course · the rows are the **server's own** list, not a page calculation · the commit button stays shut until a preview exists · a refusal after a clean preview is an ordinary outcome, not a contradiction.
🔑 **The last sentence is TASK-547's approved Undo-preview caveat, word for word and on purpose** — the two screens must not read as two different products. ⚠️ **If it is reworded here it must be reworded there too;** a test pins the two as EQUAL and will fail if they drift.
📌 **One retired:** `startUnknown` (the em dash's label) is **deleted** — `CourseSummary.startDate` is real now, so the card shows the date.

---

## 12 · Item 6 — the attention card, my wording vs §10's ✅ **APPROVED — the LONG wording (owner, 2026-10-01)**
> ⚖️ **Ruled: *"12 เอาแบบยาว"*.** This wording stands on the ADMIN panel, **§10's is superseded**, and 🔑 **the agreement pin on the shared words *ตารางเดิม / old dates* STAYS** — the ruling settled WHICH wording carries the claim, never whether the two surfaces must agree.
**Where / When:** the same admin-panel row as **§10 above** (filed for the BE side). I did not see §10 before I drafted, and the two do not say the same thing.
- **§10's draft:** *"คอร์สที่เลื่อนวันเริ่มแล้ว รอยืนยันใหม่"* / *"Courses with a moved start date, awaiting re-confirmation"*
- **Mine, in the code now:** *"คอร์สที่เลื่อนแล้วแต่ยังไม่ได้ยืนยันใหม่ (ลูกค้ายังถือตารางเดิม)"* / *"Courses moved but not re-confirmed (the family still has the old dates)"*
🔑 **Why mine is longer on purpose:** TASK-574 asked me to check that this card and the dialog's own warning **do not contradict each other**, and the only way I can prove agreement is **shared words**. The dialog's warning says the family and the coach *still hold the OLD dates* (**ตารางเดิม**) and names **Confirm course** (**ยืนยันคอร์ส**) as the act that ends it. **Mine repeats "ตารางเดิม" / "old dates"; §10's draft does not.**
⚠️ **So: §10 as written is not wrong — it is just silent about the consequence,** and a test of mine now asserts the two warnings share those words. **If §10's shorter wording is the one you want, say so and I will move the agreement pin** (the shared word becomes *ยืนยันใหม่ / re-confirm* instead) — 🚫 **I will not weaken the pin on my own.**
📌 *Two warnings describing one state differently teach an admin to trust neither — that is the whole reason this entry exists.*

---

## 13 · Item 3 — extending a voucher's expiry (ADMIN dialog) 📋 DRAFT (Fern, TASK-572)
**Where / When:** an admin presses **ต่ออายุ / Extend expiry** on a voucher row and picks a date. The server is asked what that date would change **before** anything is saved.
**Now (draft), seven strings:**
- *"ต่ออายุ"* / *"Extend expiry"* — the row's button.
- *"วันหมดอายุวอยเชอร์ — {student}"* / *"Voucher expiry — {student}"*
- *"แก้วันหมดอายุวอยเชอร์แล้ว"* / *"Voucher expiry updated"* — the toast.
- 🔴 *"วันหมดอายุนี้เลื่อนไม่ได้ — เพราะว่า"* / *"This expiry cannot move — here is why"* — **the heading above a REFUSAL.** ⚠️ Deliberately not "ผิดพลาด / Error" and not "บันทึกไม่ได้": *the admin asked a question and this is the answer.*
- *"วอยเชอร์นี้ถูกยกเลิกแล้ว ชั่วโมงจึงหายไปแล้ว การเลื่อนวันจะเปลี่ยนแค่ข้อความบนหน้าจอ — ถ้าต้องการคืนชั่วโมงให้สร้างวอยเชอร์ใบใหม่"* / *"The voucher was cancelled, so its hours are already gone; a later date would change only what this screen says. To give hours back, create a new voucher."*
- *"อายุนับจากการจองครั้งแรก จึงยังไม่มีอะไรให้ต่อ — จองคาบแรกก่อน แล้ววันหมดอายุจะนับตามคาบนั้น (ถ้าตั้งวันเองตอนนี้จะเป็นการตรึงวันชั่วคราวจากวันขาย และอาจทำให้หมดอายุเร็วขึ้น)"* / *"Validity is counted from the first booking, so there is nothing to extend yet — book the first session and the expiry follows it. (A date set now would freeze the sale-day placeholder and could end the voucher EARLIER.)"*
- *"วันที่นี้เร็วกว่าวันเดิม — เป็นการลดอายุ ไม่ใช่ต่ออายุ"* / *"This date is EARLIER than the current one — it shortens the voucher instead of extending it."*
- 🔕 *"การแก้ครั้งนี้ไม่มีการแจ้งใคร ลูกค้าจะเห็นวันใหม่ในข้อความหักชั่วโมงหรือข้อความเตือนครั้งถัดไป"* / *"Nobody is told by this change. The family sees the new date on their next deduction notice or reminder."*

**Promises:** the two refusals are the **server's own sentences**, shown word for word, with the "what to do instead" line added underneath — 🚫 never replacing it, and 🚫 an unfamiliar refusal gets **no** suggestion at all. The date is not saved until Save is pressed. A warning about sessions falling outside the new date **does not block the save** (the course's rule, unchanged). An earlier date is allowed and named.
**It goes away when:** the admin picks a different date (each date gets its own answer) or closes the dialog.
🔑 **The "before you save" sentences are NOT new** — this dialog renders the **course** expiry edit's own `expiry.previewTitle / previewCuts / previewClear / previewNotSaved`, deliberately: *one question, one wording, two entitlements.* ⚠️ So a change to those words changes both screens.
⚠️ **EXPIRED is extendable and that is the point of the feature; ENDED and NOT-STARTED are the two refusals.** The button is hidden on an ENDED voucher, so in practice an admin meets the ENDED sentence only in a race (two tabs).
📌 **Nothing here says a notice was sent, and the audience line says the opposite on purpose** — a test now fails if any string in this block acquires the words *notified / แจ้งลูกค้า / ส่งข้อความ*.

---

## 14 · Item 8 — the camp week's Close / Take bookings again / Delete (ADMIN) 📋 DRAFT (Fern, TASK-586)
**Where / When:** the Camp page's week list, and the calendar's day banner. **The owner ruled what Close means: it stops NEW bookings and nothing else** — existing bookings stay, the coaches keep their sessions, both reminders keep going, the per-day swap still works, and the week still charges because its days still run.
🔴 **Two existing strings CHANGE, because they over-claimed:**
- **Was** *"ปิดแล้ว"* / *"Closed"* → **Now:** *"ปิดรับจองใหม่"* / *"Closed to new bookings"* — ⚠️ *"ปิดแล้ว" reads as "the camp is off", and an admin who reads it that way tells a parent the wrong thing.*
- **Was** *"ปิดสัปดาห์ {name} แล้ว — วางแผนวันใหม่เข้าไม่ได้อีก"* / *"Week {name} closed — no new days can be planned into it"* → **Now:** *"สัปดาห์ {name} ปิดรับจองใหม่แล้ว การจองเดิมยังอยู่ทั้งหมด — น้องยังเรียนตามวันเดิม ครูยังสอนคาบเดิม และข้อความเตือนยังส่งตามปกติ เปิดรับจองอีกครั้งได้ทุกเมื่อ"* / *"Week {name} is closed to NEW bookings. Everything already booked carries on — the children keep their days, the coaches keep their sessions, and the reminders still go out. You can take bookings again at any time."*
**And the button:** *"ปิด"* / *"Close"* → *"ปิดรับจองใหม่"* / *"Stop new bookings"* — **the button says what it does, not what it sounds like.**
**Six new strings:**
- *"เปิดรับจองอีกครั้ง"* / *"Take bookings again"* — 🔑 **the way back, which did not exist: a week could be closed and never reopened from this screen.** The server restores it **exactly**, so the words do not hedge.
- *"ลบ"* / *"Delete"* · *"ลบสัปดาห์ {name}?"* / *"Delete week {name}?"* · *"ลบสัปดาห์นี้"* / *"Delete the week"* · *"ลบสัปดาห์ {name} แล้ว"* / *"Week {name} deleted"*
- *"จะลบสัปดาห์นี้และวันทั้งหมดในสัปดาห์ ทำได้เฉพาะเมื่อยังไม่มีการจอง — ถ้ามี ระบบจะบอกจำนวน และเลือกปิดรับจองใหม่แทนได้"* / *"This removes the week and its days. It only works while nothing is booked — if anything is, we will say how many and you can stop new bookings instead."*

**Promises:** Close is reversible and says so · a closed week keeps every booking, coach, reminder and charge · Delete works only while nothing is booked, **and the SERVER checks at the moment of the act**, so a week that gained a booking while the dialog was open is refused with **its own sentence** (which already says how many and points at Close) — 🚫 shown verbatim, never replaced.
**It goes away when:** the week is reopened (the chip and the button swap back), or the week is deleted.
⚠️ **A behaviour change the owner should know about:** the calendar's day banner **used to hide closed weeks**. It no longer does — **a closed week appears on days that have children, marked *ปิดรับจองใหม่*** — because those children are at camp and those coaches are booked, and the banner is the only thing on that screen that says camp is running. 🚫 A closed week with nobody in it is still hidden.
📌 **No new words for the refusals: every one is the server's own sentence.**

---

## 15 · Item 2 — the teacher's ADVANCE leave (TEACHER, server sentences) 📋 DRAFT (Jason, TASK-582)
**Where / When:** a linked teacher reports leave for a day **after today**. That day is now **blocked for new bookings** with them, its classes are **listed**, and **nothing is cancelled** (the owner, 2026-09-30). Today or an earlier day still cancels, as before.
**Three new server sentences, Thai only (the server's refusals are Thai):**
- *"ลาล่วงหน้าเป็นการปิดทั้งวัน — ไม่ต้องเลือกคาบ คาบที่มีอยู่แล้วจะแสดงให้แอดมินจัดการ"*: the teacher ticked some classes on a FUTURE day. An advance leave is the whole day, and ticks choose classes to *cancel*, which this act never does.
- *"ไม่พบวันลาล่วงหน้านี้"*: lifting a day that isn't recorded (or was already lifted).
- *"ลาล่วงหน้าได้เฉพาะวันหลังจากวันนี้"*: a defence the screen should never show (the server routes today and earlier days to the old cancel before this can fire).
**Promises:** nothing is cancelled and nobody is told; lifting the day restores nothing and cancels nothing.
⚠️ **Open (not wording):** "listed for the admin", but today the list goes back to the **teacher** who recorded it. There is no admin view yet (see TASK-582 §6).

---

## 16 · Item 2 — an ADMIN notice when a teacher records an advance leave 📋 DRAFT — ⚠️ **PROPOSAL, NOT BUILT: the owner decides whether to send it at all** (Jason, TASK-587)
**Why it is a question, not a restoration:** the old leave act (a cancel) told the **families** and the class's **other coaches**, and **never the admins**. So a notice to admins would be **new**. The words are here so the owner can say yes or no in one step.
**Who:** admins only (the linked LINE admin accounts). 🚫 **Never the family:** their class is still going ahead.
**Recorded** (the point is "you have classes to handle", not "someone is off"):
- TH: *"🗓️ ครู{ชื่อเล่น} ลาล่วงหน้าวันที่ {DD-MM-YYYY} — มีคาบในวันนั้น {n} คาบ ต้องจัดการเอง (ระบบไม่ได้ยกเลิก)"*
- EN: *"🗓️ Teacher {nickname} is on leave on {DD-MM-YYYY} — {n} class(es) that day need handling (nothing was cancelled)"*
- With **0** classes: the same sentence with *0*, so the admin knows the day is simply blocked. (Or no message at all on a 0 day, if the owner prefers.)
**Lifted:** ⚖️ if the first message is sent, **the lift must send its counterpart**, or admins act on a day that is no longer blocked:
- TH: *"🗓️ ครู{ชื่อเล่น} ยกเลิกการลาวันที่ {DD-MM-YYYY} — วันนั้นรับจองกับครูได้ตามปกติ"*
- EN: *"🗓️ Teacher {nickname} withdrew their leave for {DD-MM-YYYY} — bookings with them are open again that day"*

---

## 17 · Item 10 / ruling 4 — the LINE CHAT registration matches the page (PARENT-facing) 📋 DRAFT (Jason, TASK-583)
**Where / When:** a parent registers a child by typing in the LINE chat (not the page).
- **The duplicate-name sentence is now §8's, in the chat too, from ONE source.** The chat's own key (`add_dup_detail`) now holds §8's wording, and the page's refusal carries that same key's text. ⇒ **Approving §8 approves both doors; editing it edits both.**
- **Changed (a deletion only):** the bad-birthday reply loses its escape.
  - **Was** *"… เช่น 02-12-2024 หรือพิมพ์ ข้าม"* / *"… e.g. 02-12-2024, or type skip."*
  - **Now** *"… เช่น 02-12-2024"* / *"… e.g. 02-12-2024."*
- **Removed:** *"พิมพ์ชื่อคนถัดไป หรือพิมพ์ "ข้าม" เพื่อจบ"* / *"Type the next name, or "skip" to finish"*. Its only sender (a child written from a name alone) is gone.
- **No new sentence for a refused skip:** a parent who types ข้าม at the birthday or address is asked the SAME question again (the customer's own prompt). Two refusals bring a person, as everywhere else.
- **One new server sentence, which no screen should show:** *"กรุณาระบุวันเกิดของนักเรียน"*, the writer's own floor.

---

## 18 · F-C + D11(a) — the LINE CHAT asks the address in THREE questions; a new family is saved with its first child 📋 DRAFT (Jason, TASK-590)
**Where / When:** a parent registers a child by typing in the LINE chat. **Replaces** the customer's one-line screen 6 (*"กรุณาระบุ เขต แขวง จังหวัด …"*), because one typed line cannot be three checked parts (the owner's F-C ruling).
- 🔻 **TASK-594 §2 — all three are now ONE bilingual string each** (they replace a §17c screen, and a one-language question between two bilingual ones is what Tanya read as "Thai-only"):
- *"กรุณาระบุจังหวัดค่ะ เช่น กรุงเทพมหานคร / Please enter your province, e.g. Bangkok"* (both halves in one message)
- *"ไม่พบจังหวัดนี้ค่ะ กรุณาพิมพ์ชื่อจังหวัดเต็ม เช่น เชียงใหม่ หรือ กรุงเทพมหานคร"* / *"We could not find that province. Please type its full name, e.g. เชียงใหม่ or กรุงเทพมหานคร"* (`กทม`, `กรุงเทพ`, "จังหวัด…" are understood)
- *"กรุณาระบุอำเภอ/เขต เช่น วัฒนา"* / *"Please enter your district, e.g. Watthana"*
- *"กรุณาระบุตำบล/แขวง เช่น พระโขนงเหนือ"* / *"Please enter your sub-district, e.g. Phra Khanong Nuea"*
- On the summary, when the address is already on file: *"{province} (ที่อยู่เดิมของครอบครัว)"* / *"(the address we have on file)"*
- **Rare:** the phone was registered by someone else between the phone step and the save: *"เบอร์นี้เพิ่งถูกลงทะเบียนไว้แล้วค่ะ ยังไม่ได้บันทึกนักเรียน กรุณาพิมพ์ "สมัคร" แล้วใส่เบอร์อีกครั้ง"* / *"This phone number was just registered. The student was not saved — please type "Register" and enter the number again."*
- **Server floor (no screen should show it):** *"ที่อยู่ต้องมีจังหวัด อำเภอ/เขต และตำบล/แขวง"*.
**Promise it does NOT make:** the district is not checked against the province. We check that all three are given and the province is real.

---

## 19 · Item 2 — the SCREEN for reporting leave on a future date (TEACHER-facing) 📋 DRAFT (Fern, TASK-588)
📌 **The screen half of §15 above** — @Jason filed the SERVER sentences there; these are the words the dialog itself says. 🚫 No refusal is reworded here: his sentences are shown verbatim.
**Where / When:** a linked teacher opens *Report leave* and picks a date **after today**. The server records the day, **lists its existing classes, and cancels nothing.** Today and the past keep the old screen and the old words exactly.
**Now (draft), eight strings:**
- **Before the act** — *"วันที่เลือกเป็นวันในอนาคต การลาจะปิดรับจองใหม่ทั้งวัน — ไม่ต้องเลือกคาบ เพราะคาบที่จองไว้แล้วจะไม่ถูกยกเลิก"* / *"This date is in the future, so reporting leave blocks the whole day for new bookings. There is nothing to tick: classes already booked are not cancelled."*
- **The button** — *"ปิดรับจองวันนี้"* / *"Block this day"* (⚠️ **not** *"ลา 2 คาบ"* — there is no count to promise).
- **After the act** — *"{date} — บันทึกวันลาของคุณแล้ว"* / *"{date} — you are recorded as away"* · *"จะไม่มีการจองคาบใหม่กับคุณในวันนั้น"* / *"No new class can be booked with you that day."* · *"มีคาบที่จองไว้แล้ว {n} คาบในวันนั้น แอดมินจะจัดการให้ทีละคาบ:"* / *"{n} class(es) are already booked that day. An admin will handle them by hand:"* · *"วันนั้นยังไม่มีคาบที่จองกับคุณ"* / *"Nothing is booked with you that day."* · *"วันนี้มีบันทึกวันลาอยู่แล้ว ระบบใช้บันทึกเดิม"* / *"This day was already on record; the first entry stands."*
- 🔴 **The clause that matters** — *"ยังไม่มีการยกเลิกคาบใด คาบเหล่านั้นยังอยู่ในตารางและยังไม่ได้แจ้งผู้ปกครอง — กรุณาถือว่าคาบยังสอนตามปกติจนกว่าแอดมินจะแจ้งเปลี่ยนแปลง"* / *"NOTHING HAS BEEN CANCELLED. Those classes are still on the schedule and the families have not been told — please treat them as going ahead until an admin tells you otherwise."*

**Promises:** the day stops taking NEW bookings · the classes already there are **untouched**, and **nobody has been told** · the teacher is asked to keep teaching them until an admin says otherwise · reporting the same day twice is not an error and changes nothing.
🔑 **Why the last clause is written in that order and not softened:** ⚠️ **a teacher who believes their classes were cancelled will not turn up** — and on this path nothing was cancelled. *The sentence has to be unmissable and it has to come before any reassurance.*
📌 **On a future date there is NO list of classes to tick at all** — not a greyed one. A tick there would mean *"cancel this one"*, and the server refuses a body that carries them **in its own sentence** (📋 @Jason's `§15` draft: *"ลาล่วงหน้าเป็นการปิดทั้งวัน — ไม่ต้องเลือกคาบ…"*), which the screen shows verbatim if it is ever reached.
⚠️ **Today's words are unchanged** — *"{n} คาบ"*, the families-told line and the make-up line are all still the old act's, because the old act still runs for today and the past.

---

## 20 · Item 2 — the ADMIN's marker for a coach's blocked day (ADMIN, on the calendar) 📋 DRAFT (Fern, TASK-589)
**Where / When:** the calendar, above the grid, in **both** the day and the week view — wherever an admin already looks at that date. It appears for each recorded leave day in view. 🚫 **It is not a control:** nothing can be pressed, cancelled or moved from it.
**Now (draft), two strings:**
- **A day with classes** — *"{name} ลา — มี {n} คาบต้องจัดการ"* / *"{name} is away — {n} class(es) to handle"*
- **A day with none** — *"{name} ลา — ไม่มีคาบในวันนั้น"* / *"{name} is away — nothing booked"*

**Promises:** the coach named is the one who is away · the number is the count of classes **the server lists on that day** (not a guess) · **nothing has been cancelled or moved** — the classes are still on the schedule for an admin to handle by hand.
🔑 **Why two sentences and not one:** ⚠️ *a marker that only says "blocked" sends an admin hunting for the classes; one that says "3 classes" tells them there is work.* And an empty day is a different fact — **it is the answer to "can I book this coach here?"**, which is why it still shows.
🚫 **The word "ยกเลิก / cancelled" must never appear in either sentence** — nothing on that day is cancelled, and a pinned test fails if it ever does.
⚠️ **A teacher never sees this** — it is the admin's read, and the server refuses it for a linked teacher.

---

## §T-591 · F-C + D11(a) — the PAGE's half: three address parts, and the legacy ask 📋 DRAFT (Fern, TASK-591)
📌 **The page half of §18** (@Jason's chat questions and server sentences). 🚫 **No refusal is reworded here** — the duplicate-name sentence now comes **from the server** in both languages, and the page keeps no copy of it.
**Where / When:** the `/register` page's child form. The owner ruled the address is **province + district + sub-district**; the page sends the three picked names and the server builds the stored line.
**Two existing strings CHANGE:**
- *"กรุณาเลือกจังหวัดและใส่ที่อยู่ (ถามครั้งเดียวต่อครอบครัว)"* → *"กรุณาเลือกจังหวัด อำเภอ/เขต และตำบล/แขวง (ถามครั้งเดียวต่อครอบครัว)"* / *"Please choose the province, the district and the sub-district (we only ask once per family)."*
**Five new strings:**
- 🔑 *"ยังขาด{missing}ค่ะ"* / *"We still need {missing}."* — **`ADDRESS_INCOMPLETE`, and it NAMES the part.** ⚠️ *"You need the sub-district" is a different sentence from "that is wrong", and only one of them tells a parent what to do.*
- the part names, used inside that sentence: *"จังหวัด"* / *"the province"* · *"อำเภอ/เขต"* / *"the district"* · *"ตำบล/แขวง"* / *"the sub-district"*
- *"เบอร์นี้เพิ่งถูกลงทะเบียนไปแล้ว กรุณาใส่เบอร์อีกครั้งเพื่อเข้าร่วมครอบครัวนั้นค่ะ"* / *"That number has just been registered. Please enter it again to join that family."* — **`PHONE_NOW_REGISTERED`**: somebody registered that number between our check and this save. ⚠️ **Worded as a fact, not as the parent's mistake.**
- ⚠️ **The legacy ask** — *"ตอนนี้เราเก็บที่อยู่เป็นสามส่วน (จังหวัด อำเภอ/เขต ตำบล/แขวง) รบกวนเลือกให้ด้วยค่ะ ถามครั้งเดียวเท่านั้น"* / *"We keep addresses in three parts now (province, district, sub-district). Could you pick yours? We only ask once."*

**Promises:** two parts do not submit — the page stops it before the request · the missing part is named · the address is asked **once per household** · **a family we already know is ASKED, never blocked** · nothing is created until the child is accepted, so a rejected child leaves the parent exactly as they were.
🔑 **Why the legacy sentence is worded that way:** ⚠️ **it must not read as *"we lost your address"*** — what they gave us was valid when they gave it, and we are asking because we keep it differently now. 🚫 **It is shown ONLY to a family we already know** (a brand-new one has never been asked, so "again" would be a lie on their first screen) — pinned.
⚠️ **Two things the words must NOT claim** (both pinned): the server checks **three non-empty parts and a real province** — 🚫 **it does NOT check that the district belongs to the province**, so nothing here may say "that district is not in that province"; and 🚫 **the page no longer offers a typed address at all** (a typed line has no province, so it could only produce a body the server refuses).

---

## §T-592 · Item 5 — a COVER requires the rate permission, and the screen says so 📋 DRAFT (Fern, TASK-592)
📌 **The owner ruled option (a)** — reworded from the drafts held back in TASK-577 for exactly this answer. ✅ **The server already refuses this** (TASK-584 put the existing guard on the door), so this sentence is **the screen catching up with a rule that is already true.**
**Where / When:** the series *Swap the primary* dialog, the moment an admin chooses **“this session only”** (a cover) **without** the coach-rate permission. The rate box appears in its place for an admin who has the permission.
**Now (draft), one string:**
- *"การสอนแทนจะจ่ายตามค่าสอนของครูที่มาแทน จึงต้องมีสิทธิ์แก้ค่าสอนครู — บัญชีนี้ยังไม่มีสิทธิ์นี้ กรุณาให้แอดมินที่มีสิทธิ์ทำให้ หรือขอสิทธิ์เพิ่ม"* / *"A cover is paid at the covering coach's rate, so it needs the coach-rate permission. You do not have it — ask an admin who does, or ask for the permission."*

**Promises:** the door is **visible and explained**, 🚫 **not hidden and not dead** — *a control that does nothing is the dead end this whole round was spent removing* · nothing is sent while the permission is missing · **an admin WITH the permission sees exactly what they saw before** (the rate box), and this added no restriction for them · the **whole-series** swap and the **add-a-coach** door are untouched, because no rate is involved in either.
🔑 **Three things the sentence deliberately does:** it names **the PERMISSION** (🚫 not the coach — they are fine; 🚫 not the rate — it is not wrong), it says **why** the permission is needed (the cover is paid at the covering coach's rate), and it says **what to do next** — *a reason with no next step is a dead end with a caption.*
⚠️ **It never says the cover is impossible** — only that this account cannot do it.

---

## §T-593 · Nit 2 — a sentence NOBODY EDITED became false ⛔ DELETION (Fern, TASK-593)
⚠️ **Nothing new to approve — one clause is GONE**, and it is filed here so Khwan sees it left on purpose rather than by accident.
**Where / When:** the register page's *already linked* line, directly above the **Add a child** button.
**Was:** *"ผูกกับเบอร์ {phone} (นักเรียน {n} คน) ไม่ต้องทำอะไรเพิ่มค่ะ"* / *"Linked to {phone} ({n} children). Nothing more to do here."*
**Now:** *"ผูกกับเบอร์ {phone} (นักเรียน {n} คน)"* / *"Linked to {phone} ({n} children)."* — and the one-child English form keeps its own sentence (*"(1 child)"*).

🔑 **Why:** TASK-580 put an **Add a child** button underneath that line. ⇒ *"Nothing more to do here"* sat on top of the one thing there now is to do. 📌 **Nobody edited the sentence; a change elsewhere made it wrong** — the same family as the rendered comments in D12.
**Promises:** the line still says **who the account is linked to and how many children are on it** · 🚫 it no longer tells a parent to stop · the 1-vs-many English split and the single Thai sentence are unchanged, and both are pinned against the clause returning.

---
## 19b · ✅ APPROVED & SHIPPED — Item 10, the phone step's sentence (Jason, TASK-594 §1 → built in TASK-601)
📌 **Numbering note: there are two §19 blocks** — @Fern's leave screen above and this one. **This is 19b**; nothing is renumbered, so neither report's references break.
✅ **The owner approved it as drafted (2026-10-01): a NEW phone gets the new sentence; an EXISTING phone keeps Khwan's own words.** **Shipped in TASK-601.**
- **NEW phone** (`verify_parent_ok_new`) — now reads: *"รับเบอร์แล้วค่ะ ✅ เบอร์โทรศัพท์ / Phone: {phone}"* / *"ลงทะเบียนจะเสร็จสมบูรณ์เมื่อเพิ่มนักเรียนคนแรกค่ะ / Your registration is complete once you add your first student."*
- **EXISTING phone** (`verify_parent_ok_existing`) — unchanged, the customer's own: *"ผูกบัญชีผู้ปกครองสำเร็จ ✅"* / *"Registration completed ✅"*.
- 🔴 **Consequence, declared:** §17c **screen 4a's exact sentence is now carried by NO key** — it only ever rendered on the new-phone step, where it had become false. **Asserted, so the retirement is visible rather than noticed later.**

### The original draft, as it went up

**Where / When:** the LINE chat, immediately after a parent types a phone number that we do NOT know.
🔴 **Why it must change:** since TASK-590 a new family is created only when its FIRST CHILD is confirmed, in one transaction. At the phone step **nothing is written** — no parent, no LINE link. **The screen says the opposite**, and Tanya (holding our own spec) reported it as *"the chat links the parent at the PHONE step"*. 🔑 **The behaviour is right; the sentence is not.**
⚠️ **The SAME sentence is also used when the phone IS known** (`verify_parent_ok_existing`) — where the account really is linked at once. **One sentence, two opposite states.**
- **Now (the customer's §17c screen 4, unchanged):** *"ลงทะเบียนผู้ปกครองสำเร็จแล้วค่ะ ✅ / Registration completed ✅ / เบอร์โทรศัพท์ Phone: {phone}"*
- **📋 DRAFT for a NEW phone** (`verify_parent_ok_new`) — it should say we have the number and the registration finishes with the first child: *"รับเบอร์แล้วค่ะ ✅ เบอร์โทรศัพท์ / Phone: {phone}\nลงทะเบียนจะเสร็จสมบูรณ์เมื่อเพิ่มนักเรียนคนแรกค่ะ / Your registration is complete once you add your first student."*
- **🚫 An EXISTING phone keeps the customer's sentence** (`verify_parent_ok_existing`): there, the account IS linked at that moment and the words are true.
**Promise it must NOT make:** that anything is saved before the first child is confirmed.
📌 **Not changed by me:** it is the customer's own copy. The code is correct today; only the words are pending.

---

## §T-595 · The teacher's leave dialog — one line MOVED, one Thai word CORRECTED (Fern, TASK-595)
⚠️ **Nothing to approve in the English. One Thai word changed, and one sentence now shows on fewer screens.**
**Where / When:** the teacher's *report my leave* dialog, which serves **two acts** — leave for **today** (classes are cancelled and families told) and leave for a **future** date (the day is blocked; 🚫 nothing is cancelled).

**1. The same-day warning is now shown only on the TODAY act — the words are unchanged.**
- *"ผู้ปกครองของคาบที่ติ๊กจะได้รับแจ้ง และระบบจะเพิ่มคาบชดเชยให้"* / *"Families of the ticked sessions will be told; their make-ups are added by the system."*
- 🔑 **Why:** on a future date nothing is cancelled and nobody is told, so the sentence sat **directly under a hint saying the opposite.** ⇒ it is not reworded, it is simply not shown there.

**2. `noSessions` — one Thai word: "ในวันนี้" → "ในวันนั้น".**
- Was *"ไม่มีคาบของคุณในวันนี้"* (**today**) while its own English reads *"No sessions of yours on this day."*
- 🔑 **Why:** this line is shown for **whatever date is chosen**, including a past one ⇒ the Thai named the wrong day and the two languages did not make the same statement.

**Promises:** today's teacher still reads the warning they need · a teacher taking leave in advance is never told a family was informed · the Thai and the English say the same thing on every date.

---
## T-608 · REQ-111 C — an ADMIN recorded (or removed) a teacher's leave day: the notice to the TEACHER 📋 DRAFT (Jason, TASK-608)
**Where / When:** a LINE message to the teacher, the moment an admin blocks — or unblocks — one of their days. 🚫 **Only when someone ELSE does it:** a teacher who records their own leave is told nothing, because they already know.
🔑 **Why it exists:** *a day blocked on someone's behalf is a change to THEIR week, and they must not learn it from an empty calendar.*
**Recorded — four lines:**
- *"🗓️ แอดมินบันทึกวันลาของคุณแล้ว"* / *"🗓️ An admin recorded a leave day for you"*
- *"Date: 21-10-2026"* (the one date helper, `DD-MM-YYYY`)
- *"วันนั้นจะไม่มีการจองคาบใหม่กับคุณ"* / *"No new class can be booked with you that day."*
- 🔴 **the line that matters, and only when classes are on that day** — *"คาบที่จองไว้แล้ว {n} คาบยังอยู่ในตารางและยังไม่ได้ยกเลิก — กรุณาถือว่าสอนตามปกติจนกว่าแอดมินจะแจ้ง"* / *"The {n} class(es) already booked that day are unchanged and NOT cancelled — please treat them as going ahead until an admin tells you otherwise."*
- *"บันทึกโดย: {admin}"* / *"Recorded by: {admin}"*
**Removed — three lines:** the title *"🗓️ แอดมินยกเลิกวันลาของคุณแล้ว"* / *"🗓️ An admin removed your leave day"* · the date · *"วันนั้นรับจองคาบกับคุณได้ตามปกติแล้ว"* / *"Bookings with you are open again that day."*
⚖️ **The removal notice is sent deliberately:** *a notice with no counterpart leaves a teacher believing a day is still blocked.* **Pinned.**
**Promises:** the day stops taking NEW bookings · **the classes already there are untouched and nobody else was told** · the teacher keeps teaching them until an admin says otherwise.
🚫 **Audience: the teacher, and nobody else.** **No family and no other coach** — nothing was cancelled, and a family hearing *"teacher X is away"* about a class still going ahead is the defect closed in TASK-587. **Pinned by recipient TYPE, not by one absent name.**
📌 **Recorded twice ⇒ no second notice** (the first record stands), so an admin repeating themselves does not ping the teacher again.

---

## Waiting to be added this round

---

# 📌 SECTION NUMBERING — rule from 2026-09-30 (@Sober)
🔴 **@Fern and @Jason collided here twice in one hour: two §17s and two §18s**, because **the number is chosen by whoever writes last.**
⚖️ **From now on a section is numbered BY ITS TASK: `§T-589`, `§T-590`.**
🔑 **Collision-free by construction, no coordination needed, and self-documenting — any string traces to the task that made it.**
🚫 **Not "one role owns the file": that adds a hop and a queue through the SA, who is already the bottleneck.**
✅ **Existing numbered sections stay as they are. The rule starts now.**

---

# ⛔ §16 — the advance-leave admin notice: **DECLINED FOR NOW** (owner, 2026-09-30)
**The owner ruled NOT now.** ✅ **The calendar strip stands** — an admin can already SEE a blocked day and how many classes are on it.
📌 **The wording stays here, unchanged, so that a later yes costs nothing.** 🚫 **Do not build it. Do not delete it.**
🔑 **This is what "the cheap half first" was for: he answered knowing what already exists rather than in the abstract.**

---

# ✅ OWNER DECISIONS, 2026-10-01 — "19 ตามนั้น 12 เอาแบบยาว"
- **§19 APPROVED as drafted.** A NEW phone gets *"รับเบอร์แล้วค่ะ ✅ … ลงทะเบียนจะเสร็จสมบูรณ์เมื่อเพิ่มนักเรียนคนแรกค่ะ / Your registration is complete once you add your first student."* An EXISTING phone keeps the customer's own sentence.
- **§12: the LONGER wording wins** — *"คอร์สที่เลื่อนแล้วแต่ยังไม่ได้ยืนยันใหม่ (ลูกค้ายังถือตารางเดิม)" / "Courses moved but not re-confirmed (the family still has the old dates)"*. The agreement pin on the shared words **ตารางเดิม / old dates** STAYS. §10's shorter draft is superseded.
- **All other sections are approved as drafted** (Porter checked them against the owner's standing rulings; nothing contradicts one).
- **§16 (an admin notice when a teacher records an advance leave) remains DECLINED for now** — the calendar marker stands. The draft stays for a later yes.

---

# §T-G — the "we do not know if this leave used quota" refusal 📋 DRAFT (@Sober, approved shape, owner 2026-10-02)
**Where / When:** an admin presses Undo on a leave recorded **before we started recording whether a leave spends quota** — and the system refuses rather than guessing.
**Was:** *"ระบบไม่ทราบว่าการลานี้ใช้โควตาลาหรือไม่ (ลาก่อนมีการบันทึก) — กรุณาแก้ไขด้วยตนเอง"*
**Now (draft):**
**TH:** ย้อนการลานี้ไม่ได้ เพราะเป็นการลาที่บันทึกไว้ก่อนระบบจะเก็บว่าใช้โควตาหรือไม่ — คอร์ส {course} วันที่ {date} · กรุณาเปิดคอร์สนี้แล้วตรวจว่ามีคาบชดเชยของวันนี้อยู่หรือไม่ ถ้ามี แปลว่าการลานี้ใช้โควตาไปแล้ว แล้วแก้ไขด้วยตนเอง
**EN:** This leave cannot be undone: it was recorded before the system kept track of whether a leave uses quota — course {course}, {date} · Open the course and check whether a make-up exists for that date. If it does, this leave already used quota. Then adjust it by hand.
**Promises:** 🔑 **nothing about what the quota IS** — it says we do not know, **names the course and the date**, and **names the one thing to look at.**
📌 **Why it changed:** the old sentence was honest and useless — *"fix it by hand"* without saying **what to check**. 🔑 **A refusal that names the next action costs one sentence.**
⚠️ **And the shape is pinned, not the words:** it must **NOT** claim a quota value, it **MUST** carry the course and the date, and it **MUST** name the make-up check. **The owner can rewrite every word.**
📌 **Scale, for his information:** this can only affect leaves taken **before migration 0058**, **and only those whose make-up is not linked.** **The set is closed and shrinking — every leave since then records the fact.**

---

# ✅ OWNER APPROVAL, 2026-10-04 — "1 ผ่านหมด"
- **`T-608` APPROVED as drafted** — both notices (recorded / removed), all lines, the conditional "classes already booked are unchanged" line, and the audience pin (the teacher alone; no family, no other coach).
- **`§T-G` APPROVED as drafted** — the reworded `LEAVE_CHARGE_UNKNOWN` refusal, naming the course, the date and the make-up check, and still claiming nothing about the quota.
⇒ **Both are FINAL.** Team B's workbook rebuild (TASK-623) is unblocked.

---

# T-629 · REQ-111 E — swapping a NON-PRIMARY teacher: the "that teacher is not on this session" refusal 📋 DRAFT (Jason, TASK-629)
**Where / When:** an admin swaps teacher A out for teacher B on an Other-series session, "from this session on", and **A is not on one of the later sessions** — so the call is refused and nothing is kept.
**New (there was no wording for this: before TASK-629 only the primary could be swapped):**
**TH:** วันที่ {date} ครูคนนี้ไม่ได้อยู่ในตารางของวันนี้
**Promises:** 🔑 **it names the DATE that disagreed**, so the admin knows which session broke the run — not merely that something did.
📌 **The primary path's existing sentence is UNCHANGED, word for word:** *"วันที่ {date} ครูคนแรกไม่ใช่คนที่ระบุ"* (TASK-428's). ⚠️ **It is now reachable only when the named teacher is on the row in NO location at all** — in which case it is true but incomplete ("the first teacher is not the one you named" when in fact *nobody* on that session is). 🔑 **Worth a look: one sentence could serve both cases.** 🚫 **I did not touch it — an existing refusal's words are not mine to improve inside a feature task.**
⚠️ **Nothing else in this task has new words.** The rate refusal is TASK-562's `RATE_REQUIRED`, unchanged; the clash is the shipped `SLOT_TAKEN` sentence, unchanged; `ALREADY_ON_ROW` unchanged.

---

# 📋 @Sober's copy rulings, 2026-10-04 — **three, all drafts, all to @Porter before anything ships**

## §T-G-RENDER — **what `{course}` renders as, and whether the EN half ships** (answering @Jason's STOP)
🔑 **@Jason stopped rather than invent a course label inside a refusal the owner had already approved the words of. That was right.** ⚠️ **But the convention he looked for DOES exist — two refusals above his, in the same file.**
**`UNDO_SLOT_TAKEN` already names a session in a refusal with `displayNameOf(holder) || "คาบอื่น"`, and the code calls it *"the ONE name rule"*.**

▶️ **RULING: `{course}` renders as `displayNameOf(row)`, with the same fallback.** 🚫 **No new course label, no new naming convention.**
- **Why not a program-and-size label (e.g. "FREESKATE 10"): it does not DISTINGUISH.** **Two children on the same programme and size produce the same string**, so an admin reading a list of refusals learns nothing. 🔑 **What identifies a course to the person reading is WHOSE it is.**
- ✅ **Cost: the Undo's existing booking query already loads `course` and `voucher`; it needs `student` and `coStudent` added to the SAME `with`.** 🚫 **No second query.** **@Jason's ten-minute estimate stands.**
- ⚠️ **HONEST FLAG for @Porter to put to the owner in one line:** **this renders a CHILD'S NAME, not a course's name.** **The approved sentence says it names the course; the closest TRUE thing this system can say is whose course it is.** 🚫 **Not a blocker** — *the old wording is live meanwhile, which is honest and useless.* **Ship it; correct it if he says otherwise.**

▶️ **RULING: the EN half does NOT ship.** 🚫 **Thai only.**
🔑 **Decided from the file, not from preference: every refusal in `booking-undo.ts` is Thai only, and the block's own comment says they are written *"in the admin's language (the codebase's Thai)"*.** ⇒ **An English half here would be the only one of its kind.** 📌 **The admin reads Thai; Tanya reads Thai.**

## §T-609-CAP — **the at-cap refusal promises an unlock that does not exist** 🔴 REPLACES the shipped draft
**Live now:** *"คอร์สนี้ประกาศวันหยุดล่วงหน้าครบแล้ว {declared}/{quota} วัน — เริ่มเรียนก่อน แล้วจึงแจ้งลาตามปกติ **หรือปลดล็อกโดยแอดมิน**"*
🔴 **There is no unlock on that path.** **`adminUnlocked` gates the POST-start timing rule; the pre-start cap does not consult it — and @Jason's answer to my question is that it should not, because the cap is not a lock on an act, it is the SIZE OF WHAT THE CUSTOMER BOUGHT.** ⇒ **the sentence sends an admin looking for a button that is not there.**

**NEW (TH):** **คอร์สนี้ประกาศวันหยุดล่วงหน้าครบตามโควตาลาที่ซื้อไว้แล้ว {declared}/{quota} วัน — ถ้าต้องการมากกว่านี้ ต้องแก้โควตาลาของคอร์สก่อน หรือเริ่มเรียนแล้วจึงแจ้งลาตามปกติ**
**Promises:** ✅ **the COUNT, as before** · ✅ **that the limit IS the quota the customer bought — not an arbitrary cap** · ✅ **the ONE honest lever: change the course's leave quota** — 🔑 *one number, visible on the course, which keeps the cap and the allowance the same fact* · ✅ **the existing alternative (start the course, then take an ordinary leave)**.
🚫 **Claims no unlock.** 🚫 **Claims nothing about how many leaves remain afterwards** — *that is the twice-the-allowance consequence already with the owner, and a refusal is not where it should be explained.*
**Pinned by SHAPE:** **must carry `{declared}` and `{quota}` · must name the course's leave quota as the lever · must NOT contain the word ปลดล็อก.**

## §T-629-MERGE — **two sentences for one fact** 🔴 touches a SHIPPED refusal, so it needs the owner
📌 **@Jason flagged this and refused to change it inside a feature task. That was the right call and I am taking it.**
**After TASK-629 the shipped primary sentence — *"วันที่ {date} ครูคนแรกไม่ใช่คนที่ระบุ"* (TASK-428) — is reachable ONLY when the named teacher is on that session in NO location at all.** ⇒ 🔴 **It is then TRUE but misleading: it says "the first teacher is not the one you named" when the real fact is that NOBODY on that session is.**
▶️ **Draft: ONE sentence for both cases** — **วันที่ {date} ครูที่ระบุไม่ได้อยู่ในตารางของวันนั้น**
🔑 **Why one and not two: from the admin's side the two cases are the same fact — the person you named is not on that session — and the distinction between "not the primary" and "not on it at all" is ours, not theirs.** ⚠️ **It replaces a sentence that has shipped, which is why it goes to the owner rather than straight in.** 🚫 **Until he rules, both sentences stay as they are.**

# ✅ OWNER DECISIONS, 2026-10-04 (second set)
- **`§T-629-MERGE` APPROVED.** The two refusals merge into ONE sentence: **the teacher you named is not on this session.** ⚠️ **It REPLACES a sentence that has already shipped**, and the owner ruled it knowing that. 🔑 **His reason, as Porter put it to him: the distinction between "not the main teacher" and "not on it at all" is ours, not the admin's.**
- **`§T-609-CAP` APPROVED** as reworded: it names the count, names the course's leave quota as the lever, and **promises no "unlock" button**, because none exists. 🔴 **The live sentence promising an unlock goes.**
- **`§T-G-RENDER`** — noted as information, not an approval: the placeholder prints the **CHILD'S NAME**, because a course in this system has no name.

---

# ✅ OWNER APPROVED, 2026-10-04 (via @Porter) — the last two copy items of the REQ-111 batch
- **`§T-609-CAP` APPROVED as reworded** — it names the count, names the course's leave quota as the lever, and 🚫 promises no unlock. ⭐ **@Jason's point is why it reads properly: the cap is the SIZE OF WHAT THE CUSTOMER BOUGHT, not a lock on an action.**
- **`§T-629-MERGE` APPROVED** — one sentence for both cases: *the teacher you named is not on this session.* 🔴 **He ruled it knowing it REPLACES a sentence already live** (TASK-428's).
- **`§T-G-RENDER` noted, not blocked** — the owner knows it prints the CHILD's name and why; the flag reached him as information and came back without objection.
⇒ **All three are FINAL. Cut to @Jason as `TASK-635`.** 📌 **Nothing in the REQ-111 batch is now waiting on copy.**
