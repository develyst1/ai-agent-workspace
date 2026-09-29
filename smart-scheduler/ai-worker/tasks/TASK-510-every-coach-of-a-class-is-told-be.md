# TASK-510 — 🔴 a co-taught class is cancelled and only the PRIMARY coach is told — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** Both findings are yours, from TASK-508, and correctly left alone there.

## §0 The rule this task establishes
**Every coach of a class is told when that class stops happening, starts happening again, or moves.** Not the primary coach — **every coach the class belongs to**, which is what `teachersOfBooking` / `ownScopeWhere` already answers.

## §1 The two gaps
1. 🔴 **`sendLeaveNotice` and `sendClassCancelledToTeacher` read `booking.teacherId` alone.** ⇒ on a co-taught class the **additional teacher is never told the class is off.**
   **This is worse than the gap TASK-508 just closed, and the asymmetry is the point:** *a coach who is not told a class is cancelled **turns up**; a coach not told it is back on merely doesn't.* **The louder failure is the one we left in place.**
2. **A leave Undo cancels the make-up (`EXTENDED`) row and tells its coach nothing.** If a **different** coach holds that make-up, **they will turn up for a class that no longer exists** — the mirror image of TASK-508's own reason for existing.

## §2 Build
- **Both notices go through `teachersOfBooking`**, the same predicate TASK-508 used. 🚫 **No fourth answer to "whose class is this?"** — and if a caller cannot use it, say why rather than writing one.
- **The cancelled make-up notifies its coach(es)** the same way, with the existing cancel notice. 🔑 **Say what it says when the make-up's coach is NOT the coach of the undone session** — that is the case the message has to be right for, and the one nobody has read yet.
- 🔑 **Pinned by value on a co-taught fixture:** a leave ⇒ **both** coaches told · a cancel ⇒ **both** · a leave Undo ⇒ both told it is on again **and** the make-up's coach told it is off · **no parent anywhere in these paths.**
- 🚫 **The words of the existing notices do not change** — only who receives them. If a message reads oddly when it arrives at a second coach, **tell me**; I would rather rule on the wording than have it drift inside a delivery fix.
- **An unlinked coach is a SKIPPED row**, as in TASK-508 — consistent, and it records that they could not be told.

## §3 ❓ The timing question — name it, do not fix it
A leave Undo is allowed until the day-end runs, so **an Undo made after today's class time sends "on again" for a class that has already passed.**
**Establish from the data whether this can actually happen in practice** — how long after a class an Undo typically lands, if that is knowable — **and say so.** 🚫 **Do not invent a rule for it.** If it is real I will take it to the owner, since "the class was an hour ago" is his judgement about his shop, not mine.

## Definition of Done
- [ ] Both notices through `teachersOfBooking` (or a named reason one cannot) · the cancelled make-up's coach told, **with what the message says when it is a different coach** · every case pinned by value on a **co-taught** fixture · **no parent in any of these paths**, pinned · wording unchanged (anything that reads oddly **reported, not edited**) · unlinked coaches SKIPPED · the timing question **answered with evidence and left unfixed** · suite **count** normally **and unreachable** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that returns to primary-only on each notice and one that tells the family · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-26): the leave and cancel notices reach EVERY coach; a leave Undo's cancelled make-up tells ITS coaches · wording unchanged · 3304 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 59 = 59

## §1 The build (`scheduler.service.ts`, `undo.service.ts`)
- **The leave notice** (`sendLeaveNotice`, both doors): one row per coach from **`teachersOfBooking`**. It was `booking.teacherId` alone. The admin copy is unchanged (still once).
- **The cancel notice:** `sendClassCancelledToTeacher` keeps its gate (the class WAS `CONFIRMED`) and now calls **`sendClassCancelledToCoaches`**, which sends to every coach through `teachersOfBooking` and has no gate of its own (each caller owns "did the coach hold this class?").
  - It returns **the primary's result**, the one the admin's response has always reported (else the first coach's).
- **A teacher's OWN leave** (`sendClassCancelledToOtherTeachers`) was a **hand-written union** (`teacherId` + `additionalTeachers`): the same answer today, but **a fourth copy of "whose class is this?"**.
  - It's now `teachersOfBooking(…)` minus me. **So the three coach notices share one answer**, and none of them reads `teacherId` for a recipient (pinned by source).
- **A leave Undo's cancelled make-up:** every coach of **the make-up's own row**, with the existing cancel notice; `Reason` = the note written on that row.
  - **Only for a make-up the coach HELD** (`EXTENDED` or `CONFIRMED`, which `TEACHER_VISIBLE` shows on their week). A `PENDING` one was never announced, which is the cancel notice's own rule.
  - It's in the transaction, **after every refusal**. 📌 My first placement was *before* the plan check, and **the TASK-508 test "a refused Undo queues nothing" caught it**. The real transaction would have rolled it back, but the rule is "after every refusal", so it moved.
  - **One string for both:** the note on the row and the `Reason` the coach reads (`MAKEUP_UNDONE_NOTE`).
- **No parent recipient** in any of these paths (pinned). **Unlinked coaches are SKIPPED rows**, as in TASK-508.

## §2 What the make-up's coach reads when it's a DIFFERENT coach (pinned by value)
```
CLASS CANCELLED / ยกเลิกคาบ ‼️
Student : มะขิด
Program : Freeskate 4 HR
Date : 06-11-2026
Time : 10:00-11:00
Coach : Nok
Reason : ยกเลิกคาบขยาย — ย้อนกลับการลา
```
- The date, time and child are **the make-up's**, so the coach can tell which class is off.
- ⚠️ **Reported, not edited: the `Reason` line reads oddly for a coach who didn't teach the original class.** "ยกเลิกคาบขยาย — ย้อนกลับการลา" ("make-up cancelled — the leave was reversed") refers to **a leave on another coach's class that this coach never heard of**, and "ย้อนกลับการลา" is **our** word for our own act (the thing TASK-508 kept out of its stamp).
  - It's the note the Undo has always written on the row, so I left it. A coach-facing alternative would be e.g. "the student's original class is back on, so this make-up isn't needed"; **the words are yours or the owner's.**
- The co-taught **leave** and **cancel** notices arrive at the second coach **byte-identical** to what the primary gets. Nothing in them says "you are the primary", so they don't read oddly.

## §3 Pins (`booking-undo-req108.test.ts`, a new TASK-510 block of 7, co-taught fixtures) and break-and-watch
- **Pins:**
  - the make-up held by a **different** coach: t9 is told **the make-up** is off, b1's coach is told **b1** is on, nobody crosses over, no parent;
  - a co-taught make-up: both its coaches told, the unlinked one SKIPPED;
  - a PENDING make-up: nobody;
  - the words above;
  - **a leave notice ⇒ BOTH coaches** (+ the admin);
  - **a cancel notice ⇒ BOTH**, the primary's result reported;
  - by source: all three senders ask `teachersOfBooking`, none reads `tx.query.teachers`, no parent.
- **Mutations** (database unreachable · CHECKSUM identical before and after · restores byte-identical · BASELINE=36): **L1** leave notice back to the primary only · **C1** cancel notice back to the primary only · **M1** the make-up tells its coach nothing · **F1** the family told on a leave · **F2** the family told on the make-up. **All BITE.**
- **Existing pins moved (not weakened):**
  - three source pins quoted the old recipient expression (`teacher?.lineUserId`, the hand-written union). Each now quotes the new one **with the same claim** (unlinked ⇒ SKIPPED by `enqueueLine`, never a branch on the link; minus me);
  - the leave-Undo tests now also see the make-up's notice, and the TASK-508 ones filter to their own kind.
- `sendLeaveNotice` is **exported** (the `loadBookingDTO` precedent) so its recipients can be pinned by value.

## §4 ❓ The timing question: answered from code, the data part is a DATA REQUEST, NOT fixed
- **From code: yes, it can happen, for every class that starts before the day-end runs.**
  - A leave Undo is allowed until a successful `end-of-day` run exists for that date (`isDaySettled`).
  - The day-end is triggered by Windows Task Scheduler; `scripts/end-of-day.ts` documents **"daily ~18:05"**. The actual time on the server is a server fact (Otto's), which I didn't read.
  - So a 10:00 class can be Undone at 17:00, and its coach is told it is "on again" seven hours after it began.
- **From data: not knowable yet, and I did not query it** (no SQL, no databases). The only record of *when* an Undo landed is `booking_undos.undone_at` (migration `0058`, which **arrived with TASK-492 this week**), so there's little or no history to measure.
- 📋 **DATA REQUEST (read-only, for the owner, once some Undos exist):**
  ```sql
  SELECT u.undone_at AT TIME ZONE 'Asia/Bangkok' AS undone_local, b.date, b.start_time,
         round(extract(epoch FROM (u.undone_at - ((b.date + b.start_time) AT TIME ZONE 'Asia/Bangkok'))) / 60) AS minutes_after_start
  FROM booking_undos u JOIN bookings b ON b.id = u.booking_id
  WHERE u.kind = 'leave'
  ORDER BY minutes_after_start DESC;
  ```
  A positive `minutes_after_start` is an Undo made after the class began, and **its size is the owner's evidence**. 🚫 **No rule invented.**

## ⚠️ Named beside it (not changed; outside the two notices this task names)
1. **The BULK coach notice (`course_dropped_teacher`: a course dropped or ended, or a voucher ended) is still PRIMARY-ONLY.** `sendCourseDroppedToTeachers` groups the lost dates by `b.teacherId`, so **an additional teacher is not told a co-taught course stopped**. This is the same rule (§0 "stops happening"), and it's the last coach notice with this shape that I found. Recommend it through `teachersOfBooking` in the same way.
2. **"Moves":** there's no dedicated coach notice for a moved class among the message kinds. **I haven't traced whether a move reaches an additional teacher**, so I'm naming that as unverified rather than claiming either way.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Verified by me: **3306 pass / 0 fail normally AND with the database unreachable, zero failed queries** · tsc 0 · 59 = 59. 📌 His report says 3304; the tree gives **3306** on both of my runs — two more, which I take as a late addition after the number was written. No concern, recorded so the file and the tree agree.

🔑 **He found and removed a FOURTH copy of "whose class is this?" that I had not asked about.** `sendClassCancelledToOtherTeachers` was a **hand-written union** of `teacherId` + `additionalTeachers` — **the same answer today**, which is exactly why it would never have been noticed until it drifted. Now **all three coach notices share one answer, and none of them reads `teacherId` for a recipient** (pinned by source). 📌 **A duplicate that currently agrees is the most dangerous kind: nothing fails, so nothing tells you it exists.**
✅ **The gate stayed where it belongs.** `sendClassCancelledToCoaches` has no gate of its own — **each caller owns "did the coach hold this class?"** — and the cancel notice keeps its own CONFIRMED check. Moving a gate into a shared sender would have made the next caller inherit a rule it did not ask for.
✅ **The make-up notice is only for a make-up the coach HELD** (`EXTENDED` / `CONFIRMED`): **a PENDING one was never announced, so cancelling it silently is correct** — that is the cancel notice's own rule, applied rather than re-decided.
📌 **And his own test caught his own placement.** He first queued the make-up's notice **before** the plan check; **TASK-508's "a refused Undo queues nothing" pin caught it.** The real transaction would have rolled it back anyway — **and he moved it because the rule is "after every refusal", not because it would have been visible.** That is the difference between complying with a rule and holding it.

## 🗣️ The `Reason` line — reported, not edited, and he is right that it reads badly
`ยกเลิกคาบขยาย — ย้อนกลับการลา` reaches a coach who **never heard of the original class or its leave**, and it uses **our word for our own act** — the very thing TASK-508's stamp was written to avoid.
**My recommendation, going to the owner with TASK-508's stamp so he answers both at once:** *"นักเรียนกลับมาเรียนคาบเดิมแล้ว จึงไม่ต้องมีคาบชดเชยนี้ / The student's original class is back on, so this make-up is not needed."* **It explains the coach's own situation without naming a leave they never knew about.** 🚫 Unchanged until he answers; it is pinned by value, so the swap is one line.

## §4 ✅ The timing question: answered exactly as asked
**From code: yes, it can happen** — a 10:00 class can be undone at 17:00 and its coach told it is "on again" seven hours later. **From data: not knowable yet, and he did not query it** — `booking_undos.undone_at` arrived with TASK-492 **this week**, so there is little or no history to measure. 📋 He wrote the read-only query for the owner **for later, once some Undos exist**, and 🚫 **invented no rule.** **That is the right answer to a question about a shop's habits: establish what the code permits, admit what the data cannot yet say, and leave the judgement where it belongs.**

## ▶️ His two side-findings
1. **The BULK coach notice (`course_dropped_teacher`) is still primary-only** — an additional teacher is not told a co-taught course stopped. **Same rule, last one of this shape.** ⇒ **TASK-512.**
2. **"Moves": he has not traced whether a moved class reaches an additional teacher, and says so rather than claiming either way.** ⇒ **TASK-512 §2, as a question to answer before anything is built.**
