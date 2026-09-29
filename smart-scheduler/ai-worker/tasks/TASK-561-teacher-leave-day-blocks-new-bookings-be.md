# TASK-561 — REQ-110 item 2: a teacher's advance-leave day blocks new bookings — BE, M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-29) · **Size M.** Khwan, REQ-110 item 2. **Fifth of the round** (1 ✅ 12 ✅ 7 ✅ 8 BE ✅ → **2**).

## §0 The owner's ruling, as given
- **A teacher's advance leave blocks the WHOLE day**, for **NEW bookings with THAT teacher only.**
- **Classes already booked with them that day are LISTED for the admin to handle by hand.** 🚫 **Nothing moves or cancels automatically.**
- 🔴 **EVERY path that creates a booking respects the block, INCLUDING automatically re-planned make-ups** (the owner's answer to my question).

## §1 Build
- 🔑 **Derive the set of booking-creating paths and NAME it, the way you named `camp_days`' one writer in TASK-560.** ⚠️ **"The admin form and the plan flow" is not a derivation** — *a block only some paths honour is not a block*, and the owner has already said all of them.
- 🔑 **ONE source for "is this teacher on leave that day".** 🚫 **Do not write a second definition** — `reportOwnLeave` and the coach-notice work already answer this question, and **two definitions that agree today are two that can disagree later.**
- ⚠️ **A re-planned make-up hitting a blocked day must do something DEFINED — say what, and pin it.** 🔑 **"It fails" is not an answer: the re-plan is automatic, so a failure with nobody watching is the silence class again.** ⇒ **Does it skip to the next free date, or refuse the whole operation?** **Name it, justify it in one line, and if the honest answer needs the owner, STOP and say so.**
- ✅ **The LIST of existing bookings that day is part of this task** (the data the admin acts on) — 🚫 **the screen is not.**
- ⚠️ **Say what "advance leave" is, exactly** — 🔑 **a leave declared for a FUTURE date, and nothing else.** *A block that also fires on today's or a past leave would rewrite history.*

## §2 Migration
⚠️ **If it needs one it is the round's first** ⇒ hand-numbered, **and tell me the number the moment it exists** (uat range is **62** today).

## §3 Not in scope
🚫 The FE half · 🚫 moving or cancelling anything automatically · 🚫 Palm's items · 🚫 camp Close (held, TASK-560).

## Definition of Done
- [ ] **Every booking-creating path derived and NAMED**, all respecting the block · **ONE source for "on leave that day", no second definition** · 🔑 **the re-planned-make-up case DEFINED and pinned (or STOPPED and escalated)** · the existing-bookings list returned · "advance" defined as future-dated and pinned · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · migration number reported if any · 🔑 mutations incl. **a path that ignores the block** and **the block firing on a past leave** · report + `inbox/SA.md` + log.

---

# ⛔ STOP before code — @Jason (2026-09-29). **The "ONE source for 'on leave that day'" does not exist yet, and the one that looks like it contradicts the owner's ruling.** The paths ARE derived below, and the re-plan case IS defined. Nothing built, no migration.

## §1 🔴 The premise: nothing in the data says "teacher T is on leave on date D"
- **`reportOwnLeave`** (`POST /teachers/me/leave`, TASK-406) **stores no leave-day fact.** It CANCELS that day's live sessions (`status CANCELLED`, `cancel_reason TEACHER_LEAVE`) and notifies. That's all.
  - **A leave on a day with no classes writes NOTHING.** That's exactly Khwan's case: *"ครู A ลาล่วงหน้า 21/10 (แต่จริงเป็นวันทำงาน)"*, a black-out on an empty working day so nobody books it.
  - It also takes **any** date (today included), not only future ones.
- **Deriving "on leave" from "a CANCELLED `TEACHER_LEAVE` row that day" would be a second, WRONG definition.** It's empty when there were no classes, and an admin's single-class cancel with that reason would black out the whole day.
- **The coach-notice work** (`teachersOfBooking`, TASK-510) answers *"whose class is this?"*, not *"who is away that day?"*.
- 🔴 **And `reportOwnLeave` contradicts the ruling:** it moves and cancels automatically, while the owner ruled *"classes already booked that day are LISTED for the admin… nothing moves or cancels automatically."* ⇒ **the owner's "advance leave" is a DIFFERENT act from today's teacher leave.**

## §2 What the source must be (proposed, NOT built)
- **A table `teacher_leave_days`** (`teacher_id`, `date`, `reason`, `created_by`, `created_at`; UNIQUE (`teacher_id`, `date`)) = **migration `0062`, the round's first** (it doesn't exist yet).
- **ONE reader**, `teacherOnLeave(exec, teacherId, date)`, used by both seams in §3. **No other definition.**
- **"Advance", exactly:**
  - a leave day may be RECORDED only for a date **strictly after today (Bangkok)**, so nothing is written about today or the past;
  - the block FIRES only for a booking date **≥ today**, so a back-dated write (e.g. `importCoursePackage`'s past sessions) is never refused by it. **That's how it can't rewrite history.**
- **The act that writes it** (the endpoint; the screen is FE) returns **the LIST of that teacher's live bookings that day** (primary or additional; with a group's seats), and **cancels nothing.**

## §3 🔑 Every path that puts a booking with a teacher on a date: derived and NAMED
- **Seam A: `assertTeacherBookable(exec, teacherId, date)`**, the existing ONE availability gate (archived / works that weekday / freelance budget). **The leave check goes here, as one more line.**
  - **`insertBooking`** (the one inserter), reached from:
    - `createBooking` (admin + parent/public booking);
    - `createOtherSeries`, `createGroupSeries`, `seatOnGroup`;
    - `importCoursePackage`, `createCoursePackage`;
    - `applyPlanChange` (insert);
    - `resumeCourse`;
    - `addDatesToOtherSeries`;
    - **`runGroupSeriesExtenderJob`** (nightly, automatic);
    - **`syncCampDayRows`** (camp coach blocks, automatic).
  - Direct callers:
    - `moveBooking`;
    - `applyPlanChange` (move / teacher change);
    - `attachAdditionalTeachers` (a co-teacher);
    - `swapGroupTeacher`, `swapOtherSeriesTeacher`;
    - `resolveClashByMovingPrivate`, `resolveClashBySwappingCoach`.
- **Seam B: `findFreeExtensionDate`**, the free-week search used by **BOTH automatic make-up writers**, which insert DIRECTLY and **bypass Seam A today**: `reconcileCoursePlan` (the re-plan append) and `updateBookingStatus` (the sick-leave append). It's also used by the plan preview.
- **Not a new row, but it puts a live class back on the day (needs your ruling):** `updateBookingStatus`'s reviving transitions, and the admin Undo of a leave (SICK_LEAVE → CONFIRMED).
- **The whole set is one inserter + three direct `insert(bookings)`:** `insertBooking`, the two make-up writers, and `seed.ts` (dev only). **Pinnable by source**, the way TASK-560 pinned `camp_days`.

## §4 🔑 The re-planned make-up on a blocked day: DEFINED as SKIP
- **It skips to the next free week, exactly as it already skips a week whose slot is taken.** The leave day reads as "not free" inside `findFreeExtensionDate`.
- *One line of justification:* §12 (TASK-308) forbids refusing the make-up a leave earned, so refusing would fail the family's own leave with nobody watching, which is the silence class.
- **Already covered by what exists:**
  - the preview uses the same search, so preview and act agree;
  - exhaustion is already announced to the ADMIN (`makeup_far_out`), so a skip is never silent at its limit.
- **The other automatic creators**, defined by what they already do with a refusal:
  - **the nightly group extender** already SKIPS a refused date and REPORTS it (`clashes[]`);
  - **the camp sync would REFUSE the whole week's open / edit** (only `SLOT_TAKEN` is mapped). ⇒ **Needs a ruling: skip that coach's block for the day, or refuse?** My lean is skip + list it.

## §5 ⛔ What needs the owner (via @Porter): I can't pick these
1. **Who records an advance leave: the admin, the teacher (LIFF), or both?**
   - **And what happens to today's `reportOwnLeave` for a FUTURE date?** Does it keep auto-cancelling (REQ-097, ruled), or become "record the day + list, cancel nothing"?
   - **Two leave acts with opposite effects on the same day would confuse everyone.**
2. **Can a recorded leave day be REMOVED** (the admin recorded the wrong date)? I assume yes, through the same act.
3. **Does the block cover a teacher's ADDITIONAL (co-teacher) role and seats joining their live group row?** My lean: yes to both, since they're "a new booking with that teacher".
4. **The reviving transitions** (§3): refuse onto a leave day? My lean: yes, with words naming the leave.
- **Everything else is ready:** the two seams, the reader, "advance" = strictly future to record and ≥ today to fire, and the skip.

⛔ **Your call, or up to the owner.** No code, no migration yet; **0062 is reserved in this proposal, not created.**

---

# ⚖️ SA RULING (2026-09-29) — **the stop was right. Build the GATE now; one question goes to the owner.**

## ✅ Why the stop was correct, and what my §1 actually meant
**He found there is NO source for "is this teacher on leave that day": `reportOwnLeave` stores no leave-day fact — it CANCELS that day's classes, and a leave on an EMPTY day writes nothing at all.**
🔑 **That last part is Khwan's exact case: a black-out on an empty working day is the thing she asked for, and today it leaves no trace whatsoever.**
✅ **My "ONE source, do not write a second definition" was not "reuse whatever exists".** ⇒ **Deriving "on leave" from cancelled `TEACHER_LEAVE` rows would have BEEN the second, wrong definition** — *inferring the fact from its side effects is exactly the mistake this fortnight has been about.* **He refused to do it. Right.**
🔴 **And the sharper finding: today's act AUTO-CANCELS, while the owner ruled "listed for the admin, nothing moves or cancels."** ⇒ 🔑 **The owner's "advance leave" is a DIFFERENT ACT from the one we have.** **That is not a detail to design around; it is the question.**

## ✅ Approved shapes — build these now
- ✅ **`teacher_leave_days` (UNIQUE teacher + date), ONE reader.** 🔑 **Record the fact instead of inferring it** — the rule this fortnight keeps teaching us. **Migration 0062: hand-numbered, and TELL ME the number when it exists** (@Porter carries the uat range, 62 today ⇒ it becomes 63).
- ✅ **"Advance" = recordable only for a date > today; fires only for booking dates ≥ today.** 🔑 **The second half is the one that matters, and his reason is the right one: imports of past sessions must still pass.** *A block that rewrites history is a worse bug than the one we are fixing.*
- ✅ **Both seams, and the set is named:** **Seam A `assertTeacherBookable`** (the existing ONE availability gate) **and Seam B `findFreeExtensionDate`** — 🔴 **because BOTH automatic make-up writers insert directly and bypass Seam A today.** 📌 **That is the finding that makes "all paths" real rather than aspirational.** ✅ **Pin the set by source: 1 inserter + 3 direct inserts.**
- ✅ **Re-planned make-up: SKIP to the next free week**, like a taken slot. 🔑 **§12 forbids refusing an earned make-up, and a family losing a make-up because a coach took a day off would be the system punishing the customer for our scheduling.** ✅ **Preview = act** — TASK-546's rule holding through a new feature.

## ⚖️ Three of his four questions are mine, and I am answering them so only ONE goes up
**All three are overturnable by the owner; none needs him to unblock the build.**
2. **Removable? YES.** 🔑 **A block that cannot be lifted is a trap** — *leave gets cancelled constantly, and nothing is destroyed by removing it: it only ever stopped NEW bookings.*
3. **Co-teacher and seats? BLOCKED.** 🔑 **This is not a new rule, it is his rule applied: "no NEW bookings with that teacher that day."** **Adding them as a co-teacher IS booking them that day**, and a seat in a group they teach is the same. ⚠️ **Block wherever the blocked teacher would be TEACHING — not the whole group when someone else teaches it.**
4. **A reviving transition or a leave-Undo landing on a blocked day: REFUSE, with actionable words.** 🔑 **The Undo is precisely the moment a human is present and can decide** — *silently restoring a class onto a day the coach declared off rebuilds the problem the block exists to prevent.* ⚠️ **Refuse; never move it silently.**
- ⚖️ **Camp sync: SKIP + LIST, not refuse the whole week** — **his lean, and I agree.** 🔑 **It is the owner's own pattern one level up: block the day, list what is affected, let the admin decide.** **Refusing a whole camp week because one coach took a day is disproportionate.** 📌 **Flagged to @Porter as derived from the owner's ruling, so he can overturn it.**

## ⛔ The ONE question for the owner — the crux, not a detail
🔑 **Who records an advance leave — the admin, the teacher, or both — and does `reportOwnLeave` for a FUTURE date keep auto-cancelling that day's classes?**
📌 **Why it is the crux: today it cancels. The owner ruled that nothing cancels automatically.** ⇒ **Either the new act replaces it for future dates, or we ship two acts that mean opposite things by the same name.** ⚠️ **Until he answers, do not touch `reportOwnLeave`.**

## ▶️ What to build NOW (the gate half — none of it waits on the answer)
**The table · both seams · the skip · the list the act returns · the pins.** 🚫 **Do NOT change `reportOwnLeave` and do not build the recording UI path that the answer decides.**

---

# ✅ REPORT (the GATE half) — @Jason (2026-09-29): the fact is recorded, ONE reader, both seams, the skip, the list · **migration `0062` (uat 62 ⇒ 63)** · **3567 / 0 normally, and 3× unreachable, 0 failed queries** · tsc 0 · **63 = 63** · ten mutations bite · 🚫 `reportOwnLeave` and the recording act untouched (the owner's question)

## §1 The source (built)
- **`teacher_leave_days`** (`0062`): `teacher_id` (FK RESTRICT), `date`, `reason`, `created_by`, `created_at`; **UNIQUE (teacher, date)**.
  - Witnessed by the unique index; rerunnable. **No backfill** (nothing earlier recorded a leave day).
- **THE reader:** `teacherLeaveOn(exec, teacherId, date)` in `lib/teacher-leave.ts`.
  - **Pinned: no other file reads that table.**
- **"Advance":** the block fires only for a booking dated **≥ today (Bangkok)**, via `leaveFires`.
  - **A past date isn't even read** (pinned), so an import of history passes.
  - *The "record only for a date > today" half belongs to the recording act, which waits for the owner.*
- ⚠️ **Until that act exists, nothing writes the table, so the gate is built and pinned but INERT in the product.** That's by your ruling; nothing silently half-works.

## §2 🔑 Every path: derived, named, and CLOSED by source
- **Booking rows are created in exactly four places** (pinned by source):
  1. **`insertBooking`**, the one inserter;
  2. **`reconcileCoursePlan`**'s make-up append;
  3. **`updateBookingStatus`**'s sick-leave append;
  4. `db/seed.ts` (dev only).
- **Seam A: `assertTeacherBookable`** (+1 line), covering:
  - **every `insertBooking` caller:** `createBooking`, `createOtherSeries`, `createGroupSeries`, `seatOnGroup` (new row), `importCoursePackage`, `createCoursePackage`, `applyPlanChange` insert, `resumeCourse`, `addDatesToOtherSeries`, **the nightly extender**, the camp sync;
  - **+ the direct doors:** `moveBooking`, `applyPlanChange` move / teacher change, **`attachAdditionalTeachers` (a co-teacher)**, `swapGroupTeacher`, `swapOtherSeriesTeacher`, both clash-resolvers.
  - ⇒ `409 TEACHER_ON_LEAVE`: *"ครู<ชื่อ> ลาวันที่ <date> — เพิ่มคาบกับครูวันนี้ไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น"*. **This is a DRAFT for the owner's copy batch, pinned by value.**
- **Seam B: `findFreeExtensionDate`** (+1 line), used by **both automatic make-up writers + the preview.** The leave day reads as NOT FREE, so the make-up **SKIPS to the next free week.** Pinned by value:
  - one leave week ⇒ the next week;
  - two in a row ⇒ the week after;
  - another teacher's leave ⇒ no change.
  - **The refuse-instead mutation bites.**
- **No insert, but a class is put back** (`assertNoCoachOnLeave`, over **THE "whose class" predicate**: the primary and every co-teacher; a seat resolves to its group):
  - **the reviving transitions** (`confirm` / `attend`, the code's own `REVIVING` set);
  - **the leave-Undo** (inside `planUndo`, so **the preview refuses with the same words**; pinned end to end, nothing written);
  - **a seat joining an EXISTING group row whose coach is away.**
- **Camp sync: SKIP + LIST.** An on-leave coach gets **no new block**, **keeps a block they already hold** (an existing booking is never removed by the system), and **is returned** as `onLeave`:
  - per-day edit: in its response;
  - week create / update: `onLeave: [{ date, teacherId }]`.
  - **The rest of the day's coaches are unaffected.**
- **The nightly extender:** a refused date is already skipped and reported (`clashes[]`). Unchanged.

## §3 📋 The list (built; wired when the act is)
- `leaveDayBookings(exec, teacherId, date)`: **that teacher's LIVE classes that day** (PENDING / CONFIRMED / EXTENDED), as primary **or** co-teacher (`ownScopeWhere`), class rows only (seats ride their group), by start time.
- **A read. Nothing is moved or cancelled.** Pinned by its rendered SQL (a real read needs a DB).
- **No route yet:** it's what the recording act will return.

## §4 Stated, not changed
- **The make-up writers still bypass the OTHER availability rules** (archived / weekday off / freelance budget): Seam B adds only the leave. **Out of scope; say if you want it.**
- **`reportOwnLeave` is untouched** (pinned: it doesn't reference the new table).

## §5 Checks
- Suite: **3567 / 0** (3552 + 12 new in `src/lib/teacher-leave-day-task561.test.ts` + 3 in the Undo harness). **DB-unreachable 3×: 3567 / 0, 0 "Failed query".** tsc 0. **63 .sql = 63 tags.**
- **Existing tests touched, and only this way:**
  - 61 count pins 62 → 63 (`· 🔻 TASK-561: +0062`);
  - 15 fake `query` objects in 9 files got `teacherLeaveDays → undefined` (**no leave in those fixtures**);
  - 5 exact sync-result pins + `onLeave: []`;
  - 4 source pins re-quoted to the new lines;
  - 2 coach-ask pins in the Undo harness now start with the leave gate's ask (**nobody is told by it; the outbox pins who is told**).
- **Break-and-watch** (CHECKSUM identical, every restore byte-identical, BASELINE 102):
  - **P1, the block firing on a PAST leave:** **BITES** (3).
  - **A1, Seam A ignores it:** **BITES**.
  - **B1, Seam B ignores it:** **BITES**.
  - **B2, the make-up refuses instead of skipping:** BITES.
  - **U1, the leave-Undo ignores it:** BITES (5).
  - **R1, reviving ignores it:** BITES.
  - **S1, a seat joining ignores it:** BITES.
  - **C1, the camp sync ignores it:** BITES.
  - **C2, the camp sync deletes the existing block:** BITES.
  - **T1, the reader ignores WHICH teacher:** BITES (5).
- ⚠️ **Honest limit:** R1 and S1 bite through the **source pins of the wiring**, and the check they call is pinned by value. **`updateBookingStatus` / `seatOnGroup` aren't driven end to end** (their fakes would be large).

## §6 Slips (caught before reporting)
- **I first placed the new table INSIDE the schema slice TASK-264's audit pin reads** (`courseExpiryChanges` … `coursePackagesRelations`), so its "no reason column" pin fired on MY `reason`. **Moved the table out; the pin is unchanged.**
- My bulk fake-stub also landed in front of a `...spread` (a duplicate key, caught by tsc) and was reverted there.
- The list test first tried to render a column as SQL.

⛔ Only you mark this DONE. **Waiting on the owner:** who records a leave, and `reportOwnLeave`'s future.

---

# ✅ GATE HALF DONE — REVIEWED by @Sober (2026-09-29)
Verified by me: **3567 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **63 .sql = 63 journal tags** (counted myself). **Migration `0062_teacher_leave_days` ⇒ uat range 62 ⇒ 63, reported to @Porter.**

## ✅ The closed set is the achievement
**"Booking rows are born in 4 places" — the inserter, the 2 make-up writers, the dev seed — and the set is pinned BY SOURCE.**
🔑 **That is a derivation, not a survey**, and **ten mutations bite including SIX separate paths ignoring the block.** ⇒ *The pin is not "the gate works"; it is "no path escapes it", which is the thing that was never true before.*
✅ **ONE reader (`teacherLeaveOn`), pinned that nobody else reads the table** — the single source I asked for, enforced rather than intended.
✅ **A past date is not even READ**, not merely ignored — 🔑 *the strongest form of "this cannot rewrite history".*

## ✅ The doors that are not inserts — exactly the cases I ruled on
**Revive (`confirm`/`attend`), the leave-Undo (and the preview says the same), and a seat joining an existing group are refused over THE "whose class" predicate.**
🔑 **He reused the one predicate instead of writing a fourth version of "whose class is this"** — *the convergence we spent TASK-522 on, still holding under a new feature.* ✅ **And the preview agreeing is TASK-546's rule surviving its third feature.**
✅ **Camp sync: skip + list, no new block, an existing block KEPT, `onLeave` returned** — **as ruled, and the "existing block kept" half is the one that would have been missed.**

## ⚠️ Inert by design — and that is the right shape to ship
**Nothing writes the table until the owner answers, so the gate does nothing in the product yet.** ✅ **`reportOwnLeave` untouched and pinned.**
🔑 **An inert gate is safe to deploy and cannot surprise anyone** — *the alternative was holding a migration hostage to a wording question.*

## 🔴 "Stated, not changed" — raised, not folded in
**The make-up writers still bypass the ARCHIVED, WEEKDAY-OFF and FREELANCE rules.**
🔑 **Seam B exists precisely because those writers bypass the availability gate — we plugged the leave-block into it and left the other three rules bypassed.** ⇒ **A make-up can still land on an archived teacher, or a weekday they do not work.**
📌 **Pre-existing, correctly not folded in, and now VISIBLE for the first time** — *the seam we built to fix one rule is the proof that three others are missing.* ⇒ **Raised to @Porter for the next round.**
✅ **Slip reported: the table first went inside TASK-264's pinned schema slice; moved out, that pin unchanged.**
