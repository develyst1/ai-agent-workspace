# TASK-508 — tell the COACH when a leave is undone (never the family) — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** 🔨 **Owner ruling via Porter: YES — notify the coach, never the family.** He noted this should have been settled sooner, and that is fair: I raised it as a question when it could have been a recommendation with a default.

## §0 Why the coach and not the family
A leave Undo puts the class **back on**. **Unlike the family, the coach has to BE somewhere.** A silent Undo leaves them believing the class is off — and the failure is not a wrong record, it is **a child arriving at a shop where nobody is expecting to teach them.**
🚫 **The family is never told** (owner ruling, REQ-108 ruling 2 and again here): from their side nothing changed — the class they booked is happening.

## §1 Build
- On a **leave Undo** (TASK-492's action, the `SICK_LEAVE` → `CONFIRMED` case), the **assigned coach** is notified.
- 🔑 **Which coaches:** the primary **and** any additional teachers — **TASK-487's predicate, not a hand-written `teacherId`.** A co-taught class has two people who need to be there, and we have already been caught once by a read that only knew about the primary.
- 🔑 **The message must say the thing a coach needs in one line: this class is ON again**, with the date, the time and the child. **Not "a leave was undone"** — that is our word for our own act. Write it for someone glancing at a phone between classes. Both languages; the coach's own language, as every teacher message now is (TASK-493's rule is about the schedule's words, not about which language a coach is written to — **check and say which applies here**).
- **A false check-in Undo sends NOTHING** (that is the owner's silent case, and the class was never off). **Pin both: leave ⇒ the coach is told; check-in ⇒ nobody is.** The two cases share one action, so this is exactly the sort of thing that leaks.
- 🔑 **The send must not be able to fail the Undo.** The state change is the point; a message that cannot be queued must not roll back a correction an admin has already been told succeeded. **Say how you achieved that** — and note the existing pattern: the parent's deduction message is enqueued **inside** the transaction (TASK-490's finding), which is what makes "no message lost" true there. **If you follow that pattern, the rule above changes shape — say which you chose and why.**
- 🚫 No change to what the Undo does, to the family's silence, or to any existing message.

## §2 What I want stated
- **What a coach sees, by value, in both languages.**
- **Whether a coach with no LINE link gets anything at all** — if not, say so plainly. 📌 That is the same gap the owner accepted for families in REQ-108 §5, and **an unlinked coach silently not being told is worth him knowing about, not worth hiding.**

## Definition of Done
- [ ] The coach notified on a **leave** Undo, primary **and** additional, through the shared predicate · **nothing sent on a check-in Undo** — both pinned by value · the message written for a coach between classes, both languages, by value · the send cannot fail the Undo (or the chosen alternative argued) · an unlinked coach's outcome stated · suite **count** normally **and unreachable** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that messages the family, one that messages on a check-in Undo, and one that tells only the primary coach · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-26): a LEAVE Undo tells every coach of the class it is ON again; a check-in Undo tells nobody; the family never · 3297 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 59 = 59

## §1 The build
- **Who:** `teachersOfBooking(exec, bookingId)` (`lib/own-scope.ts`) asks **THE predicate** (TASK-487's `ownScopeWhere`) with the teacher's **id column** in place of a fixed id. It returns every teacher for whom "this is my class" holds: **the primary AND each additional teacher**.
  - `ownScopeWhere`'s parameter now also accepts `teachers.id`; **its SQL for every existing caller is unchanged**.
  - So this can never know fewer people than a coach's own calendar does.
- **Where:** `undo.service.ts`, **in the leave branch only**, after every refusal (the plan check is the last). One `enqueueLine` per coach, kind `class_on_again_teacher`, `recipientType: "teacher"`.
  - **No parent recipient exists anywhere in that file** (pinned).
  - The Undo's result shape and every other write are unchanged.
- 🔑 **Inside the transaction or after the commit? INSIDE (TASK-490's pattern), and so the rule changes shape:**
  - **The message exists iff the Undo committed.** A refusal or a lost race rolls the row back with the Undo. A committed Undo cannot lose its message.
  - **It cannot fail the Undo on its own.** An unlinked coach is a SKIPPED row, never a throw (`enqueueLine`'s contract). The only failure left is the database refusing a write, **which is the same failure that would stop the Undo's own writes**, so there is no case where the correction succeeded and the message took it down.
  - After-commit would reopen "Undo succeeded, message lost" (a crash between them) for no gain.

## §2 What a coach sees, by value (the worker fills the child, date, time and coach from the booking, as for every coach notice)
```
CLASS ON AGAIN / มีคาบตามเดิม ‼️
Student : มะขิด
Program : Freeskate 4 HR
Date : 02-10-2026
Time : 10:00-11:00
Coach : Ek
```
- **TH and EN are byte-identical**, and pinned so.
  - That's the house format of every coach notice (`CLASS CANCELLED / ยกเลิกคาบ ‼️`): a bilingual stamp identical in both columns, and the customer's English field labels.
  - **TASK-493's rule is about the schedule's words, and doesn't apply here.** This message follows the coach-notice convention, which already gives one text in every chat.
- **It says the class is ON.** Pinned: no "undo", "ย้อนกลับ" or "ยกเลิกการลา". **The same block as the cancel notice**, so the message that took the class off and the one that puts it back read as a pair.
- 📖 **The stamp is MY PLACEHOLDER. The owner has not seen it.** It's marked so in `line-i18n.ts` and pinned by form. When @Porter brings back his words, it becomes a byte pin.

## §3 An unlinked coach: NOTHING is delivered (stated plainly)
- A coach with no LINE link gets a **SKIPPED** outbox row (`no line userId`). **It records that they could not be told; it tells them nothing.** The Undo still succeeds (pinned).
- **This is the same gap the owner accepted for families (REQ-108 §5), and worth him knowing about:** a co-taught class where one coach is unlinked puts the class back on for that coach **with no message at all**.

## §4 Pins (`booking-undo-req108.test.ts`, a new TASK-508 block of 7) and break-and-watch
- **Pins:**
  - by value: the primary AND the additional teacher each get one row, **nobody else** (the make-up's own coach, t9 in the fixture, is not told), and **no parent**;
  - an unlinked coach ⇒ a SKIPPED row, Undo succeeds;
  - **a check-in Undo ⇒ no coach asked, no row**;
  - a refused leave Undo ⇒ nothing queued;
  - **the predicate by its rendered SQL** (the primary OR the `booking_teachers` EXISTS);
  - the words in TH and EN;
  - by source: one send, inside the leave branch, after the guard, on `tx`.
- **Mutations** (database unreachable · CHECKSUM identical before and after · every restore byte-identical · BASELINE=29):
  - **FAM: the family messaged too:** BITES (5).
  - **CHK: a check-in Undo messages the coaches:** BITES (4).
  - **PRI: the question asks the primary only:** BITES (the SQL pin).
  - **PRI2: only the first coach told:** BITES (3).
  - **OUT: the send moved outside the transaction:** BITES (11). With the database unreachable it **fails the Undo itself**, which is exactly the coupling the in-transaction choice avoids.

## §5 Existing pins that moved under the owner's ruling (none weakened)
- **The leave Undo's inserts:** `["insert:undos"]` ("silent") became **`["insert:outbox", "insert:undos"]`**. The old line and the ruling are quoted in the comment. The **check-in** test's `["insert:undos"]` is **unchanged**, because it is still silent.
- **The Undo file's source pin:** `not.toMatch(/notify|enqueueLine|…/)` became "no notify / leave-notice / push, **exactly ONE `enqueueLine(`**, after the guard".
- **`message-time-format`:** the `TemplateKey` Record **refused to compile** until `class_on_again` named its `Time` owner (the ninth).
- **Five kind-registry counters moved 25 → 26 and 9 → 10**, each with a TASK-508 note: `message-trailing`, `no-iso-date-leak`, `no-placeholder-leak`, `note-guard-depth`, `remaining-zero`.
  - **Only the counts failed.** The walkers **rendered the new kind** and found no trailing whitespace, no raw ISO date and no placeholder. That's their stated purpose: making a new kind visible.

## ⚠️ Three things found beside it (named, NOT changed: "no change to any existing message")
1. 🔴 **The LEAVE NOTICE itself tells only the PRIMARY coach.**
   - `sendLeaveNotice` (scheduler.service) looks up `booking.teacherId` alone.
   - So on a co-taught class, **the additional teacher is told when the class comes back on (now) but was never told it was off.** That's TASK-487's gap on the message that started all this.
   - `sendClassCancelledToTeacher` has the same primary-only shape.
   - Recommend a small task: both through `teachersOfBooking`.
2. **A leave Undo cancels the make-up and tells its coach nothing.** In the fixture, t9 teaches only the make-up, and TASK-492 cancels that class silently. If a different coach held the make-up, **they will turn up for a class that no longer exists.** It's the mirror image of this task's reason.
3. **Timing:** a leave Undo is allowed until the day-end runs, so an Undo made **after the class's time today** sends "on again" for a class that has passed. It's harmless, but it may confuse a coach. The Undo's window is TASK-492's rule; I left it.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Verified: **3297 pass / 0 fail normally AND with the database unreachable, zero failed queries** · tsc 0 · 59 = 59 · `teachersOfBooking` at `lib/own-scope.ts:37`.

🔑 **He reused THE predicate rather than writing a second answer to "whose class is this?"** — `ownScopeWhere` with the teacher's id **column** in place of a fixed id, every existing caller's SQL unchanged. ⇒ **this notice can never know fewer people than a coach's own calendar does.** That is the right structural guarantee, and it is the third time this week that the fix was *find the rule that already exists* rather than write a fourth copy.

🔑 **The in-transaction choice, and the reasoning is better than my instruction.** I wrote "the send must not be able to fail the Undo". He put it **inside** the transaction and showed why that is stronger: **the message exists if and only if the Undo committed** · an unlinked coach is a SKIPPED row, never a throw · and the only remaining failure is the database refusing a write, **which would have stopped the Undo's own writes anyway** — so there is no state where the correction succeeded and the message took it down. **After-commit would have reopened "Undo succeeded, message lost" for no gain.** ✅ And mutation **OUT** proves it: moved outside, with the database unreachable **it fails the Undo itself** — the exact coupling the choice avoids.

✅ **The message says the class is ON, not that a leave was undone** — pinned against "undo"/"ย้อนกลับ" — and it reuses the cancel notice's block, **so the message that took the class off and the one that puts it back read as a pair.** That is the right instinct: a coach is not interested in our verbs.
✅ **The placeholder is marked as a placeholder** and pinned by form, not by value, until the owner's words arrive. **Marking it beats inventing a house style and letting it harden.** → going to Porter.
✅ **An unlinked coach: nothing is delivered, said plainly**, with the SKIPPED row recording that they could not be told. And the sharp version: **a co-taught class where one coach is unlinked goes back on for that coach with no message at all.** → the owner should know; it is the same gap he accepted for families.
✅ **Five kind-registry counters moved and he checked WHY each moved** — only the counts failed; the walkers rendered the new kind and found nothing wrong. **A counter that moves for the right reason is maintenance; one that moves because a walker stopped looking is a loss.** He distinguished them.

## ▶️ His three side-findings — ruled
1. 🔴 **The LEAVE NOTICE itself tells only the PRIMARY coach**, and so does the cancel notice. ⇒ **an additional teacher is told the class is back ON (now) but was never told it was OFF.** That is worse than the gap we just closed: **a coach who is not told a class is cancelled turns up; a coach not told it is back on merely does not.** ⇒ **TASK-510, with (2).**
2. **A leave Undo cancels the make-up and tells its coach nothing** — if a different coach holds that make-up, **they will turn up for a class that no longer exists.** The mirror image of this task's reason. ⇒ **TASK-510.**
3. **Timing** — an Undo after today's class time sends "on again" for a class that has passed. **Named in TASK-510 as a question, not a defect.** I am not inventing a rule for it without knowing whether it ever happens.
