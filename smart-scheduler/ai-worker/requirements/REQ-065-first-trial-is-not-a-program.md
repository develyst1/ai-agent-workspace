# REQ-065: `1st Trial` ไม่ใช่กิจกรรม — เอาออกจากรายการ "วิชา"
- Status: READY_FOR_SA
- Priority: **MEDIUM–HIGH** — small, but staff see it on every booking and it invites a nonsensical booking
- Requested: 2026-08-23 by stakeholder (owner) — *"มีโปรแกรมที่เราทำกันผิดไปตั้งแต่แรกเริ่มเลยมั้ง ช่วยเอาออกหน่อย"*
- Source: owner's screenshot of the **จองรายครั้ง** tab's `วิชา` dropdown on `uat`

## Problem
**`1st Trial` appears in the program (`วิชา`) picker.** It is not an activity — **it is a booking TYPE**, and the
same modal already has a dedicated **`ทดลองเรียน`** tab for it.

⇒ On the **จองรายครั้ง** tab staff can currently choose `วิชา = 1st Trial`, which means *"book a single session of
Trial"* — **a booking with no meaning**, sitting one tab away from the correct way to do the same thing.

**It has been wrong since the beginning, not introduced by recent work:** `db/seed-data.ts:9` lists `"1st Trial"`
as the first entry of `SUBJECT_NAMES`, alongside Surfskate, Skateboard and the rest — master data dated 2026-06-30.

### ⚠️ But WE are why it is visible now — stated plainly
**TASK-155 linked every teacher to every subject** (the owner's decision, correctly executed) — **and `1st Trial`
was carried along, because the system has always treated it as a program.** The booking picker is driven by
`teacher.subjectOptions`, so before that link it may not have appeared for most teachers.
**We did not create the modelling error; we removed the accident that was hiding it.** Worth recording so the fix
is aimed at the cause and not at TASK-155.

## Requirement
1. **`1st Trial` must not be offered as a program anywhere staff choose one** — not on จองรายครั้ง, not on
   course creation, not on voucher, not on the trial tab itself (a trial's `วิชา` is the **real activity** the
   child will try — the owner's own screenshot shows `ทดลองเรียน` + `Onewheel E-Skate`, which is correct).
2. 🔴 **Nothing historical may break.** `bookings.subject_id` is **NOT NULL** and references `subjects` with
   **`onDelete: restrict`** — so **deleting the row is not an option** if anything references it, and past
   bookings/reports that name it must keep naming it.
3. **The fix addresses the cause, not the symptom.** `1st Trial` is not a program; it should stop *being* one,
   rather than being filtered out of one dropdown at a time and reappearing at the next screen someone adds.
4. **No change to how a trial is booked or priced.** `FIRST_TRIAL` remains a booking type, `first-trial` remains
   its sale item at ฿1,390, and REQ-061's rule (a one-hour blue-block visit is booked as a 1st Trial) is untouched.

## Acceptance Criteria
- [ ] **AC-1** — **Given** the จองรายครั้ง tab, **When** staff open `วิชา`, **Then** `1st Trial` is **not listed**.
- [ ] **AC-2** — Same for **course creation**, **voucher**, and the **ทดลองเรียน** tab's own `วิชา` picker.
- [ ] **AC-3 (🔴 the one that matters)** — **Given** existing bookings whose subject is `1st Trial`, **When**
      anything reads them (calendar, plan, reports, daily report, SOM dashboard), **Then** they still render with
      that name and **nothing errors**.
- [ ] **AC-4** — Booking a 1st Trial still works end to end, still prices at ฿1,390, and still posts at day-end.
- [ ] **AC-5** — `subjects` count changes only as the chosen mechanism requires; **no other program is affected**,
      and the nine added yesterday plus the kept combined program are untouched.
- [ ] **AC-6** — The change is **owner-run and dry-run-first** if it touches data, in the house pattern.

## Questions
- **Q1 (to SA — this is the whole design decision):** which mechanism?
  - **(a) `active = false` on the `1st Trial` subject** — Porter's lean. It says *"this is not something to
    choose"* at the source, so **every** picker present and future is fixed at once. Needs a check that no read
    path filters historical rows out by `active` (AC-3).
  - **(b) unlink it from `teacher_subjects`** — narrower, reversible, but leaves it an active program that the
    next screen or the next bulk-link will surface again. **Treats the symptom.**
  - **(c) something structural** — mark it as not-a-program in the data model. Bigger; say if it is warranted.
  **Ground it and choose;** Porter is not picking the mechanism, only insisting the cause is addressed (req 3).
- **Q2 (to SA):** does anything currently *depend* on `1st Trial` existing as a selectable subject — the trial
  booking path, `db/seed.ts:185`, or any report grouping? **If the trial flow needs a subject row to exist, say
  so** — that changes (a) from a one-line change into something to think about.
