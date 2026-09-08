# REQ-084: ปุ่มนำคอร์สที่พักกลับมาใช้งาน (owner's **FIX-009**)

- Status: **DRAFT — captured 2026-09-05.** Two questions; both small.
- Requested: **2026-09-05**, by the owner, in his customer-facing list. **Never captured here before today.**
- Priority: not ranked. **Porter's read: pair it with `REQ-082`.**

## Problem / Goal

**We shipped the drop and not the un-drop.**

`REQ-071` (✅ Completed, and on the owner's list as **REQ-011**) gave a course a fifth status, `DROPPED`: it leaves
the calendar, is not deleted, does not fall into Expire, **and "สามารถกลับมาเรียนต่อได้ภายหลัง โดยแอดมินแก้วัน
หมดอายุให้"**. ⇒ **Coming back was in the requirement from the start — as a manual workaround, not a button.**

The owner is now asking for the button: **"ปุ่มนำคอร์สที่พักกลับมาใช้งาน"**.

🔴 **He filed it as a FIX, not a REQ, and that reading is fair.** From the shop's side, "pause" that cannot be
un-paused without editing a date field is a half-delivered feature. **The requirement said the course could come
back; the product made it an expiry edit.**

📌 **This is the same shape as `REQ-076` and it is not a coincidence** — that REQ has "put it back" as a
first-class act (`AC-13`, *"นำกลับมาลงตาราง"*, any slot). **A single booking will get a proper resume before a
course does, unless this is picked up.** Worth saying out loud when it is ranked.

## Questions — @Porter to the owner

1. **Does the button also fix the expiry, or only restore the status?** A course dropped for three weeks comes
   back with three weeks burnt. ⇒ **Options: leave it (his `REQ-082`/REQ-017 is then the tool), extend it by the
   time it was paused, or ask the admin.** ⚠️ **Automatic extension is generous and silent** — it moves the
   boundary of something paid for without anyone deciding it, which is the category he guards.
2. **Is there a list of dropped courses to resume from**, like `REQ-076`'s tray on the calendar, or does the
   admin find the course first and press the button there?

## Out of scope (proposed)

- Anything about **bookings** — that is `REQ-076`. This is the **course** half.
- Re-posting or reversing money. A dropped course's sale posted when it was sold; resuming does not re-sell it.

---

## 🔴 A DEFECT arrived with it — the pause button is still there after pausing (owner, 2026-09-06)

> *"อยากให้ปิดบัคด้วย พวกคอร์สที่พักไว้ แต่ยังมีปุ่มพักคอร์สอยู่ และอีกเรื่องคือไม่มีปุ่มเอากลับไป"*

**Two halves, and only the second one was this REQ:**
1. 🔴 **NEW — a course already `DROPPED` still offers `พักคอร์ส`.** An action that has already happened is still
   being offered. **This is a defect against `REQ-071`, which shipped.**
2. **The missing resume button** — this REQ, already captured.

📌 **They are one screen and one fix, so they become one piece of work.** Splitting them would mean touching the
same control twice and shipping a half-mended state in between: **a course you can pause twice but not un-pause.**

### What the control must do

- [ ] **AC-A** — **Given** a course whose status is **`DROPPED`**, **When** an admin looks at it, **Then**
      **`พักคอร์ส` is NOT offered.** ⚠️ **Hidden or disabled is a design choice; both close it.** Porter's read:
      **replace it with the resume button in the same position** — one control, two states — so the admin's eye
      does not have to hunt for what changed.
- [ ] **AC-B** — **Given** a course that is **not** `DROPPED`, **Then** `พักคอร์ส` is offered as it is today, and
      the resume button is not.
- [ ] **AC-C** — 🔴 **Given** a `DROPPED` course, **When** anything else in the product offers an action on it,
      **Then** the same rule holds. ⚠️ **Named because a defect that shows up in one place has usually shipped in
      several** — the paused course also appears in lists, on cards and in search.

### Still open — the two questions above, unchanged

**Q1 (does resume also move the expiry) and Q2 (is there a list to resume from) are still the owner's.**
📌 **The defect half needs neither answer** — hiding a button that should not be there is not blocked on anything.
⇒ **If he wants the bug closed before the feature, it can ship on its own.** **His call.**

---

## ✅ ANSWERED 2026-09-06 — the admin decides, the system warns

> *"admin เป็นคนพักเพราะลูกค้าแจ้ง ก็ตอนเอากลับ ก็ให้เป็นหน้าที่ของเขาเองสิ ถ้ามันจะมีปัญหาก็แค่บอกเขา เช่น
> มันเกิดปัญหานะ ถ้าเอากลับมา บลา ๆ ก็บอกเขาไป"*

**⇒ Q1 answered: the system does NOT move the expiry. The admin does, if it needs it.**
📌 **And he gave the principle, not just the answer:** the pause was a human decision taken on a phone call, so
**the un-pause is the same human's decision.** ⇒ **The system's job is to make sure that human is not deciding
blind.** **Warn, do not act.** That is a better rule than the one I proposed, which only said "do nothing".

### The warning — Porter, UX writer

Shown **in the resume confirmation, before it happens**, and only when there is something to say:

| Situation | Thai |
|---|---|
| Expiry already passed | 🔴 **คอร์สนี้หมดอายุไปแล้วเมื่อ {วันที่} — นำกลับมาได้ แต่ต้องขยับวันหมดอายุก่อน ไม่งั้นลงตารางไม่ได้** |
| Expiry is close | ⚠️ **เหลือเวลาอีก {n} วัน ({วันที่หมดอายุ}) · ยังเหลือ {n} ครั้ง — อาจเรียนไม่ทัน** |
| Nothing wrong | *(no warning — do not invent one)* |

🔴 **The warning names the number and the date. It never says "may cause problems".** A warning an admin cannot
act on is noise, and this one has an action attached: **change the expiry.**
📌 **This is exactly why `REQ-082` pairs with it** — the warning tells the admin to move the expiry, so the
control to move it has to exist. **Neither is much use alone.**

### Q2 — the list to resume from

**Not answered, and no longer blocking:** his screenshot shows the pause/resume control lives on the **course plan
modal** (`Pause course` · `Cancel course` · `Add extra (charged)` · `Insert make-up`). ⇒ **The button has a home.**
**Whether a paused course also needs a tray, like `REQ-076`'s, stays open — and it is a smaller question now.**

---

## 🔻 PREMISE CORRECTED 2026-09-06 — the endpoint always existed. Only the button was missing.

**This REQ was written on the belief that "we shipped the drop and not the un-drop".** @Sober's read says
otherwise: **`resumeCourse` exists, and `git log -S` puts it in the SAME COMMIT as the drop** (`bcb0ee6`).
⇒ **Nothing was half-built. The backend was complete on day one and the button was never placed.**

🔴 **And the cause turned out to be one omission with THREE symptoms.** The payload was missing three fields, and
the third has a symptom **nobody had reported**: `SummaryBar`'s *"this course has ended"* notice **could never
render either.** ⇒ **The owner's two complaints — the stale pause button and the missing resume button — and a
third nobody knew about, all came from the same gap.**
📌 **Worth stating plainly because it changes how the next report is read:** *"the feature was not built"* and
*"the screen was never given the data to show it"* look identical from the outside. **This one was the second.**

⇒ **The feature half is much smaller than everything above it implies.** The ACs stand as written — they describe
the behaviour the customer gets — but **they are largely a wiring job, not a build.**

## ⚠️ One thing the correction exposes, and it is the OWNER'S to settle

**`resumeCourse` today REQUIRES a new expiry date** — it returns `400 EXPIRY_REQUIRED` without one, on the
reasoning that the pause consumed the window.
**That contradicts his 2026-09-06 ruling:** *the system does not move the expiry — the admin does, and the system
warns*, with this REQ's own table carrying a **"nothing wrong ⇒ no warning"** row.
⇒ **Today, every resume forces an expiry decision, including the ones where nothing is wrong.**
**Two different rules. His choice, and it is one line either way:**
- **(a)** keep forcing it on every resume — simple, and never lets an expiry slip past unnoticed;
- **(b)** require it only when the warning fires — matches his ruling, and stops asking a question that has no
  answer when the course has months left.

## 🔴 THE QUESTION NOBODY HAS ASKED THE CUSTOMER — and it blocks the real fix (2026-09-08)

**@Sober, sizing `TASK-282`:** the fix is *"stop INSERTING, start REVIVING"* — the paused rows still carry their
original dates. **About an hour.** ⚠️ **But an hour that contains this, and it is not a coding question:**

> 🔴 **A date that has already PASSED cannot be revived.**
> **Does a course paused for three weeks come back with its old dates — and three sessions already behind it —
> or do the passed ones move to the end?**

**The customer has never been asked.** ⇒ **Until they answer, the unanswered half is either a line or a
redesign, and nobody can tell which.**

📌 **This REQ has been asking the wrong question since I wrote it.** I asked *"does resume move the EXPIRY?"* —
the owner answered *"the admin decides, the system warns"*, and that was a good answer to a small question.
**The real question is what happens to the SESSIONS**, and it never got asked because **the endpoint existed and
the button was merely missing** *(§ PREMISE CORRECTED)* — **so it read as a wiring job, and nobody re-opened the
behaviour underneath.**

### Porter's read, for the owner to take to them
**Neither answer is obviously right and that is why it must be asked:**
- **Old dates kept** — honest to *"bring it back on its own slot"*, **but a family returns to sessions already
  in the past, which the shop must then chase.**
- **Passed sessions moved to the end** — matches what a parent expects from *"pause"*, **but it silently extends
  the course past its expiry**, and `REQ-082` exists precisely because moving an expiry is a deliberate act.
⇒ **Porter's recommendation when it is asked: move the passed ones to the end, and WARN — the same shape the
owner already chose for the expiry.** *"Warn, do not act"* is his rule and it fits here unchanged.
⚠️ **A second, unrelated unknown rides with it:** the owner's own reproduction had **trailing `CANCELLED` rows
beyond the plan's end** — `03/Nov` on a course ending `20/Oct`. **@Sober cannot explain those from anything he
has read**; the candidates are an earlier pause/resume cycle or the **leave-extension** path. **A 20–30 minute
read settles it.** **It may be a second defect.**

## ✅ ANSWERED 2026-09-08 — the owner ruled it, and his answer is better than either option I offered

> *"ควรจะ ข มั้ยวะ ทำไมต้องรอลูกค้าตอบด้วย แค่นี้ลิงยังคิดได้ ก็ให้ไปเริ่มตามสูตรใหม่ เหมือนวางแผนใหม่ ว่าจะเอา
> ยังไง จะเอาทุก ๆ วัน เสาร์นี้ หรืออังคารไหน เอาเหมือนตอนสร้างคอร์สเลย แค่เป็นการนำกลับมาจากพักคอร์สเฉย ๆ เอง
> วันหมดอายุก็งอกไปสิ เรื่องปกติ"*

🔴 **RESUME IS A RE-PLAN, not a restoration.** The admin is asked the same scheduling question as at course
creation — **which day, what time, starting when** — and the **remaining** sessions are laid out from there.
**The expiry extends with it. That is normal and needs no separate decision.**

📌 **This is better than both options I wrote, and the reason is worth keeping.** I framed it as *"old dates vs
move the passed ones to the end"* — **both of which try to reconstruct a past the pause already ended.**
**He reframed it: a paused course does not resume, it is re-scheduled.** ⇒ **there are no "passed sessions to
place", because the plan is drawn from today.** **The question I could not answer disappears rather than getting
an answer.**
📌 **And it reuses a screen that already exists and that staff already know** — the course-creation planner.
**No new UI, no new concept, and an admin who can create a course can resume one.**

🔻 **He was also right that this never needed the customer.** I wrote *"the customer has never been asked"* and
treated that as a blocker. **It is a product behaviour the owner decides and the customer reacts to** — and
holding a release overnight for a question I could answer by asking him is the mistake, not the caution.
**⇒ Rule for me: "the customer has not said" is only a blocker when the answer is THEIRS to give** — their
prices, their policy, their words. **How our own feature behaves is his.**

### What this settles for `TASK-282`
- **`resumeCourse` stops trying to revive or re-date old rows.** It takes a **new schedule** and lays out the
  remaining sessions from it.
- **The expiry extends** as a consequence, **not as a separate admin act** — 🔴 **and this is the one place it
  differs from `REQ-082`'s "warn, do not act"**: there, an admin *edits* an expiry deliberately; here it **moves
  because the course moved.** **State it in the confirmation so nobody meets it by surprise.**
- ⚪ **Still unexplained and NOT settled by this:** the owner's trailing `CANCELLED` rows beyond the plan's end.
  **A 20–30 minute read; it may be a second defect.**
