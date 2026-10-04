# DEPLOY — uat — 2026-10-04 (the REQ-111 batch)
**Written by @Sober for @Porter.** 🔴 **This is the REAL OA (`@427ybeky`) and REAL families.** **Read it in order; the order is the instruction.**
✅ **What ships is exactly what passed on sid: QA clean 3 of 3 on the short pass (TEST-077 + re-test).** **The full record of the build is `DEPLOY-sid-2026-10-04.md`; this note is only what is DIFFERENT about doing it on uat.**

---

## 🔴 READ FIRST — THE ONE COMMAND THAT MUST NEVER BE RUN
# 🚫 DO NOT RUN `line:remove-menus`. EVER.
**It has no "leftovers only" mode: it deletes EVERY rich menu it recognises as ours — INCLUDING the ones in use — and leaves every real follower of `@427ybeky` with no menu at all.**
✅ **This release needs NO menu step (§4). If a menu ever looks wrong: PUBLISH again. Never remove.**

---

## 0. 🔴 What must NOT come to us
**`LINE_ADMIN_VERIFY_CODE` is an ENVIRONMENT value.** 🚫 **Never in a task, a board row, a log, this file, or any committed file.** *A secret in a repo is published to every machine it is ever opened on.*

## 1. Environment — 🚫 NOTHING NEW
**Unchanged from 10-01:** `LINE_ADMIN_VERIFY_CODE` · `PUBLIC_ADMIN_BASE_URL` (🔴 **read at RUNTIME, not build time**).
⚠️ **Confirm both are still set on uat before §2.** *A runtime value is one nobody notices is missing until a coach types a command.*

## 2. 🔴 THE MIGRATION — **no new migration, but RUN IT AND VERIFY IT ANYWAY**
**This batch adds NO migration. uat should already be at 65 from the 10-01 release.**
```bash
bun run db:migrate
```
**Expect:**
```
Journal: 65 migration(s)
✅ every migration is recorded in the ledger AND witnessed in the schema.
```
🔴 **EXPECT IT MAY BE RED — and do not be surprised by it.** **On sid TODAY the ledger was 8 rows short, with this same deploy history. uat has the same history, so expect the same red and the same repair.** 📌 **Proven on sid today; nobody should have to rediscover it on the customer's system.**
🔑 **A red verify here means MISSING LEDGER ROWS, not missing work.** **Repair:**
```bash
bun run db:seed-ledger
```
**Read every line of that dry run.** **Then, only if it is what you expect:**
```bash
bun run db:seed-ledger --apply
```
**It writes ledger rows and applies nothing.** **Re-run `db:migrate` and expect green.** 🚫 **Do not start the app against a schema verify has called bad.**

## 3. Start the code — **BE and FE TOGETHER**
🔴 **One release.** **The admin leave screen reads a field the new server returns (`teacherNotified`); the screen handles it being absent by saying nothing, so FE-before-BE degrades safely — 🚫 but BE-before-FE still shows the OLD screen against the NEW refusals. Ship both, together.**

## 4. LINE-side — **NO menu step. ONE thing to watch.**
- ✅ **Menus: NOTHING changes.** 🚫 **Do not publish, relink or adopt menus for this release.** **And above all, 🚫 never `line:remove-menus` (top of this note).**
- ✅ **Accounts: nothing new to link.**
- ⚠️ **NEW MESSAGES go out from this release: when an ADMIN records or lifts a leave day on a coach's behalf, that coach gets a LINE notice** (`teacher_leave_recorded` / `teacher_leave_lifted`). **A coach with no LINE link gets none — and the admin's screen now says so plainly.**
- ⚠️ **Quota: those are extra pushes against the OA's monthly limit.** **Check the outbox worker's line once after start:**
```
[outbox] LINE worker started (every <n>s)
[outbox] sent=<n> failed=<n> retry=<n>
```
🔑 **If "worker started" does not appear, every notice queues and nothing sends — and the deploy LOOKS successful.** ⚠️ **A `failed=` with `429: You have reached your monthly limit` is LINE's quota, not our bug.**

## 5. 🔴 WHO MUST BE TOLD, AND WHAT CHANGES FOR THEM — **before they notice it themselves**
### 🔴 Khwan — **one sentence she must hear BEFORE she looks, not after**
**"The 'ขยายได้ถึงสัปดาห์ที่ N' number on a course card has been WRONG on uat all along for any course an admin EXTENDED. After this deploy it shows the true week, so some numbers you have already seen will CHANGE."** **Example: a 10-session course extended by 4 weeks read "week 13"; it now reads "week 17", which is when it really runs to.** ✅ **Courses nobody extended show exactly what they showed before.** 📌 **Tanya hit this on sid: a card moved 8 → 11, and the expiry history showed two admin extensions — the new number is the TRUE one.** 🔑 *A number that changes after a fix looks identical to a number that broke; the difference is whether someone was told why.*
**Also for Khwan:** **a course that has not started now takes planned absences FREE and WITHOUT LIMIT — each one pushes the course's expiry out by a week.** ⚠️ **Cancelling such a day does NOT give the week back** (a make-up may already sit in that week).
### Admins
- **A new row action on the Teachers page: record a leave day for a coach — FUTURE dates only.** **Today and the past are refused (handle today's classes one by one on the calendar).**
- **A group teacher swap now pays the INCOMING coach their own rate.** **If the group has never paid that coach, a rate box asks for it.** ⚠️ **That box appears only for admins holding `action:bookings.coach-rate` (key 59). An admin WITHOUT it cannot complete a swap to a coach the group has never paid** — **the swap is refused, with nothing to type.** ▶️ **Make sure whoever does cover swaps holds key 59.**
### Coaches
- **They may receive a LINE notice when an admin records or lifts a leave day for them.** **Nothing else changes for them.**
### Families
- ✅ **Nothing new reaches them from this release.**

## 6. ✅ Still true from 10-01 — CHECK, do not redo
- **At least one real admin is linked with the current code** — the LINE-links page shows the count.
- **The Teacher role holds `action:calendar.teacher-leave`** (Roles screen) — ⚠️ **without it no coach can record their own leave.**
🔑 **These were the 10-01 gates. If they passed then, they still hold; one look on each screen confirms it.**

## 7. What Tanya tests on uat — **short**
**The same short pass that was clean on sid:** **the week label on one ordinary and one admin-extended course · the admin's leave result naming the coach · the ticked-sessions line absent on the admin door and present on the coach's own · today refused on the admin door, and a coach's own same-day cancel still working · a group swap to a never-paid coach with a rate.**
🚫 **She still cannot test an owner-level LINE account; the coach notice on a real phone is the owner's.**

## 8. Rollback — **both repos together, and the database is left alone**
**Put the previous build back for BOTH repos at once.** 🚫 **Never one without the other** (§3).
✅ **No migration ⇒ nothing to undo in the database.** **And what the new code WROTE stays readable by the old code:** **a stretched expiry is just a later date; an admin-recorded leave day is the same row a coach's own advance leave writes.** ⚠️ **After a rollback the week label goes back to the OLD, wrong number for extended courses — harmless, but Khwan will see it change back.**
🚫 **Never roll a migration back to fix an app problem, and never `line:remove-menus` to "reset" anything.**

## 9. ⚠️ KNOWN AND DELIBERATE — **so nothing here is reported as a fault**
- 🔴 **The widened teacher SWAP is backend-only and INERT. Khwan still CANNOT choose which teacher is swapped out** — **the one thing she said would make the control do what she needs.** **It needs her screen, next round.** 🚫 **Do not soften this.**
- **The admin leave door is FUTURE-ONLY, at the server as well as the screen** — the owner's ruling: accepting today would cancel classes and notify families in one irreversible call.
- **A coach who somehow reaches an admin-only door gets a generic "no permission" message rather than the teacher-specific one.** **The owner left it: no coach can reach those doors from any screen.**
- **Cancelling a declared pre-start day does NOT give its week back** (§5).
- 🔴 **NOT IN THIS RELEASE: the "child with no parent" defect.** **The booking / new-course path can STILL create a child no parent can see.** **The three households found were repaired by hand; the fix itself is next round.** ▶️ **If Khwan reports another "no classes" family, it is THIS — the same one-row repair applies, and it is not a regression from this deploy.**
- **A household with only a province on file is asked for its address again; the server checks address SHAPE, not geography; a same-slot make-up re-add sends nothing; a closed camp week still charges and still shows** — **all unchanged from 10-01.**
