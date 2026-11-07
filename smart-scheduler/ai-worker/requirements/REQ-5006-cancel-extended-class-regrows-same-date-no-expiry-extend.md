# REQ-5006: Cancelling a purple EXTENDED class grows a new one on the same date, and the course expiry doesn't move
**Owner, 2026-11-07:** forwarded Khwan's LINE message + 3 screenshots; *"อันนี้น่าจะอีกเรื่อง"*. **Status:** OPEN: reproduce + explain first. No fix yet, nothing to the customer until the SA confirms and Tanya passes it.

## 1. Khwan's words (LINE, 2026-11-07), verbatim
> อันนี้ระบบทดสอบนะคะ**
> แต่ที่ระบบจริงมีเคสแบบนี้ค่า
>
> ครูเราลา เราเลยไปกด cancel คลาสนั้นๆ แต่พอดีว่าคลาสนั้นเป็นคลาสม่วง extended พอเรากด cancel คลาสที่งอกออกมาใหม่เป็นวันที่เดิมค่ะ และอายุคอร์สไม่เพิ่มให้อัตโนมัติค่ะ อันนี้เกิดจากอะไรได้บ้างคะ

## 2. The screenshots (in the owner's chat, not on disk), transcribed
- **Course card:** Aiwa · 6-session course · Balance Play (Group) · ACTIVE · 5/6 sessions · Valid until week 8 · Expires 2026-11-16.
- **Plan before:** Mon 12:00 · teacher Camp: 28 Sep ATTENDED · 5 Oct ON LEAVE · 12, 19, 26 Oct and 2 Nov ATTENDED · **9 Nov EXTENDED**. "0 session(s) still owed". Last session 9 Nov 26.
- **The dialog, on 9 Nov:** "Cancel this session" · "The session is cancelled and a make-up is re-owed — the course stays at its size." · **"A problem on our side" ticked:** "Choose this when we cancelled the class — the course is extended by one week."
- **Plan after:** **9 Nov CANCELLED + EXTENDED** and a new **9 Nov CONFIRMED + EXTENDED**, same time. Last session still 9 Nov 26.

## 3. The questions
1. Why does the new make-up land on the date just cancelled, instead of a later date? Is this only when the cancelled row is EXTENDED?
2. The dialog promises one more week. Does the expiry move? In which cases? Is it the same with the box unticked?
3. Her case is a teacher's leave. Is "Cancel + A problem on our side" the path she should use, or is there a right one today (what she can do herself)? TASK-705 covered a coach-off replan: does this path miss it?
4. The real system: are there courses already in this state (a cancelled EXTENDED + a live one on the same date)? How many?

## 4. Acceptance (of this first step)
- **AC-1:** Tanya reproduces it on sid with QA data, or says plainly she can't. Which system Khwan's "ระบบทดสอบ" is, is not assumed.
- **AC-2:** Sober explains it from the code, with file:line, and says what she can do today.
- **AC-3:** a count from uat, read only. No write.
- **AC-4:** nothing is built before the owner sees the answer.

## Answer (Sober, SA, read-only, 2026-11-07) — back `7601560`, `src/services/scheduler.service.ts`
Both symptoms share ONE root cause: the make-up regrew in the **same freed slot** because the system was never told the coach is off that date — and a same-slot regrow is, by an owner ruling, defined to earn **no extra week**.

### Q1 — why the make-up lands on the same date; is it only when EXTENDED?
- The make-up date comes from `findFreeExtensionDate` (`:3084`, body `:3100–3116`): it returns the **first free weekly slot** from the cancelled date onward. A slot is "taken" only by a row with a slot-holding status (`slotHolderWhere` / `SLOT_INACTIVE_STATUSES`). The row she just cancelled is `CANCELLED` ⇒ **inactive ⇒ it no longer holds the slot ⇒ that same date reads FREE** ⇒ the make-up is placed back on it.
- The only things that push it to the *next* week are: a **coach-off** signal for that date (`:4690` sets it **only** when the reason is «ครูลา» `TEACHER_LEAVE` — TASK-705), or a **recorded teacher-leave** row (`teacherLeaveOn`, `:3100`). Her cancel carried **`SCHOOL_ISSUE`** ("A problem on our side"), which passes **no** coach-off (`:4690`), and there was no teacher-leave row ⇒ the slot read free ⇒ same date.
- **Not unique to EXTENDED by itself** — any cancelled course session can regrow on its own date when the coach isn't signalled off. **But** the *same-slot "changed nothing"* decision (`slot`, `:4698`) runs **only for a make-up row** (`current.isMakeup === true`); an EXTENDED row *is* a make-up. For an ordinary (non-make-up) row the decider is `NOT_SAME_SLOT` always. So the specific pair **"regrows same date **and** earns no week"** is an **EXTENDED/make-up** phenomenon.

### Q2 — does the expiry move, and when? same with the box unticked?
The course gains **+1 week** only through `addLeaveWeek`, and only in these cases:
- **"A problem on our side" (`SCHOOL_ISSUE`)** on a LIVE/ATTENDED row **AND the make-up lands on a DIFFERENT slot** → `T3_SCHOOL_ISSUE` (`:4715`, guarded by `… && !slot.family`).
- **A coach's own leave recorded** («ครูลา» through the coach-leave door) → `T2_COACH_LEAVE` (`:3850`, group seats `:2022`), always +1 week **and** the make-up moves to a new week.
It does **NOT** move when:
- `SCHOOL_ISSUE` but the make-up **regrows the same slot** — `!slot.family` is false (**her case**).
- the box is **unticked** — the default reason is not `SCHOOL_ISSUE`, and **every reason other than the three triggers is +0** (`:4700` comment). So unticked = never moves.
- ⚠️ **`inferred` (for Tanya to confirm on sid):** an **admin** cancel with reason «ครูลา» (`TEACHER_LEAVE`) **moves the make-up to a new week** (coach-off, `:4645`/`:4690`) but I find **no `addLeaveWeek` for `TEACHER_LEAVE` in this path** — the T2 week is added only in the **coach's-own-leave** door (`:3850`). So an admin's «ครูลา» cancel appears to move the date **without** extending the course. Worth confirming in the reproduce.

### Q3 — her case is a teacher's leave: the right door today?
- **The right door is the coach's leave**, not "Cancel → A problem on our side." Recording the teacher off that date (the coach-leave path, TASK-705/713) does **both**: the make-up skips to the next free week (a real new date), and the course gets **+1 week** (`T2`, `:3850`). "A problem on our side" is for *our* mistake, and on a make-up it regrows in place and adds no week — which is exactly what she saw.
- **Yes, the `SCHOOL_ISSUE` path misses TASK-705:** coach-off is wired only to `TEACHER_LEAVE` (`:4690`), so a school-issue cancel never signals the coach off and can land the make-up back on the same date.
- **Self-serve today:** cancel the class with the reason **«ครูลา»** (or record the coach's leave for that day first). If a row is already in the bad state (a cancelled EXTENDED + a live one on the same date), the live one still owes the lesson, so no session is lost — but the expiry is short by the week she expected; fixing the existing rows is a back-office correction, not a self-serve button today.

### Q4 — count on uat (AC-3): a DATA REQUEST, not mine to run
I don't query real environments. Bare SQL for Tanya's read-only on uat (or for the owner to paste), read-only:
```sql
SELECT b1.course_id, b1.date, b1.start_time
FROM bookings b1
JOIN bookings b2
  ON b2.course_id = b1.course_id
 AND b2.date       = b1.date
 AND b2.start_time = b1.start_time
 AND b2.id <> b1.id
WHERE b1.status = 'CANCELLED'
  AND b1.cancel_reason = 'SCHOOL_ISSUE'
  AND b1.is_makeup = true
  AND b2.status IN ('PENDING','CONFIRMED','EXTENDED')
ORDER BY b1.date;
```
Row count = courses in this state; `cancel_reason`/`is_makeup`/`start_time` confirmed in `schema.ts:473/458/386`.

**No build. Nothing to the customer until Tanya reproduces (AC-1) and the text passes her gate.**

## Tanya's round 2 (TEST-140, sid, 2026-11-07): corrects the Answer above
- «ครูลา» isn't offered on the admin's screen; only the API takes it. There it moves the class and adds no week.
- "Record teacher leave" alone: nothing cancelled, no week. It blocks the coach's whole day and takes only dates after today.
- **Record teacher leave, then Cancel ticked: later date + 1 week; also repairs a row already in the bad state** (the cancelled rows stay visible). Unticked: later date, no week.
- Not checked: notices to families or coaches on these steps.
- Uat: 9 rows on 8 active courses, 2 dated 11-08. Names went to the owner in the git-ignored evidence file.

### Q3 — CORRECTED (Sober, 2026-11-07, after Tanya's sid run TEST-140 round 2). The original Q3 above is superseded.
My original self-serve line — "cancel with the reason «ครูลา»" — is **wrong**: `TEACHER_LEAVE` is an **API-only** reason, **not on the admin's cancel screen**, so Khwan can't pick it from the UI (I cited the handler, not a render line — F-035). Tanya also confirmed my `inferred`: the API `TEACHER_LEAVE` cancel moves the class but adds **no week**; and "Record teacher leave" **alone** cancels nothing and adds no week.
- **The self-serve recipe that WORKS (Tanya, on sid):**
  1. **Record the teacher's leave** for that date, then
  2. **Cancel the class with "A problem on our side" ticked.**
  - Result: the make-up lands on a **later date** (not the same day) **and** the course is **extended by one week**.
- **Why it works (matches the code):** step 1 creates a teacher-leave row, so `findFreeExtensionDate`'s `teacherLeaveOn` check (`:3100`) reads that slot as **not free** ⇒ the make-up skips to the next free week (a new date). Because the make-up now lands on a **different** slot, the same-slot suppression (`slot.family`) is false ⇒ the `SCHOOL_ISSUE` tick's **+1 week** (`:4715`) fires. The leave row fixes **both** symptoms at once.
- **It also repairs a row already in the bad state** (a cancelled EXTENDED + a live one on the same date): record the leave, then cancel the mis-placed live row with the box ticked — the make-up re-lands later and the week is added.
- **Order matters:** the leave must be recorded **before** the cancel, or the slot still reads free and the make-up regrows in place.
