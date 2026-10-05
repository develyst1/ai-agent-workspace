# DEPLOY — uat — 2026-10-05 — **ONE COMBINED RELEASE: REQ-111 + the both-teams batch (REQ-113, parent phone, no-parent tag, TASK-654)**
**Written by @Sober for @Porter.** 🔴 **This is the REAL OA (`@427ybeky`) and REAL families.** **Read it in order; the order is the instruction.**
⚖️ **Owner's decision 2026-10-05: ONE release instead of two in two days.** 🔴 **The REQ-111 build staged on the server is SUPERSEDED — rebuild from the current commit.** 📌 **`DEPLOY-uat-2026-10-04.md` is kept and marked superseded; everything in it that still applies is carried here — you do not need to open it.**
⚠️ **The cost of one release, said up front: a bigger blast radius in ONE restart** — admin leave, money on swaps, the week label, the LAST badge, the parent phone rule and a LINE reply wording all change at once. **If something looks wrong after start, §9 says what is DELIBERATE before anyone calls it a fault.**

**Build from:** back `feb01ae` · front `f00435d` (both trees clean at the time of writing). ✅ **Both passed QA on sid:** REQ-111 (TEST-077 + re-test, clean) and the both-teams batch (TEST-078: 9 PASS · 2 could-not-run · 0 FAIL); `TASK-654` is the two QA holds from TEST-078, verified by me — @Tanya's sid check for it is in `DEPLOY-sid-2026-10-05.md` §10.

---

## 🔴 READ FIRST — THE ONE COMMAND THAT MUST NEVER BE RUN
# 🚫 DO NOT RUN `line:remove-menus`. EVER.
**It has no "leftovers only" mode: it deletes EVERY rich menu it recognises as ours — INCLUDING the ones in use — and leaves every real follower of `@427ybeky` with no menu at all.**
✅ **This release needs NO menu step (§5). If a menu ever looks wrong: PUBLISH again. Never remove.**

---

## 0. 🔴 What must NOT come to us
**`LINE_ADMIN_VERIFY_CODE` is an ENVIRONMENT value.** 🚫 **Never in a task, a board row, a log, this file, or any committed file.**

## 1. Environment — 🚫 NOTHING NEW
**Unchanged from 10-01:** `LINE_ADMIN_VERIFY_CODE` · `PUBLIC_ADMIN_BASE_URL` (🔴 **read at RUNTIME, not build time**). ⚠️ **Confirm both are still set on uat before §2.**
**No new permission key in this release.** (§6 names one existing key that now matters more.)

## 2. 🔴 THE MIGRATION — **FIRST, and VERIFIED, BEFORE ANY RESTART**
**This release adds NO migration. uat should be at 65.** **Run it anyway:**
```bash
bun run db:migrate
```
**Expect:**
```
Journal: 65 migration(s)
✅ every migration is recorded in the ledger AND witnessed in the schema.
```
🔴 **EXPECT IT RED.** **sid's ledger was 8 rows short with this same deploy history; uat has the same history.** 🔑 **Red here means MISSING LEDGER ROWS, not missing work.** **The repair is proven on sid:**
```bash
bun run db:seed-ledger
```
**Read EVERY line of that dry run. Only if it is what you expect:**
```bash
bun run db:seed-ledger --apply
```
**It writes ledger rows and applies nothing. Re-run `db:migrate` and expect green.**
🚫 **Never restart onto a box whose state has not been checked. Never start the app against a schema verify has called bad.**

## 3. Start the code — **BE and FE TOGETHER, one restart**
🔴 **Two ship-pairs ride in this release, and they are CORRECTNESS constraints, not advice:**
- **`TASK-644` (back) + `TASK-662` (front):** the server's "a new student needs a parent phone" sentence travels only in the error's details, and only 662's screen shows it. **644 alone ⇒ a generic "invalid data" beside a phone label reading "(optional)".**
- **`TASK-663` (back) + `TASK-664` (front):** the People filter is nothing without its route.
- **And REQ-111's own reason:** the admin leave screen reads `teacherNotified` from the new server.
⇒ **Deploy BOTH repos together — that satisfies all three.**

## 4. What goes out
### From REQ-111 (passed QA on sid 10-04)
1. **Admins can record a coach's leave on their behalf** — a row action on the Teachers page. **FUTURE dates only, refused at the server as well as the screen.** A coach's own door still takes today. **The coach is told by LINE; 🚫 no family is told (nothing is cancelled).**
2. **A not-yet-started course takes planned absences FREE and WITHOUT LIMIT; each declared day pushes the expiry out one week.**
3. **Swap can take ANY teacher off a session — ⚠️ backend only, INERT (§9).**
4. **A "from here on" swap pays the INCOMING coach** (Other-series and group). 🔴 **A money fix.**
5. **The group swap door takes an optional rate** for a coach the group has never paid (§6).
6. **One reworded refusal** (owner-approved) for "that teacher is not on this session".
7. **The course card's "ขยายได้ถึงสัปดาห์ที่ N" reads the REAL expiry** — 🔴 **it was wrong for admin-EXTENDED courses all along (§7).**
8. **The admin's leave result speaks to the admin in four owner-approved sentences; the ticked-sessions warning is gone from the admin door.**
### From the both-teams batch (passed QA on sid 10-05)
9. **`TASK-645` (REQ-113) — the `LAST` badge STAYS after the final session is checked in, and on a `NO_SHOW` final session.** **PERMANENT on that cell, by the owner's ruling.** The plan's displayed END date is unchanged.
10. **`TASK-660` — a digit search no longer floods the bookings list.**
11. **`TASK-661` — the LINE check-in reply (no class today / no QR) reads the owner-approved A′ wording.** ⚠️ **Families see this one.**
12. **`TASK-644` + `TASK-662` — a NEW student needs a parent phone** on bookings, new courses and new vouchers, **and on an `อื่นๆ` booking with a typed new name.** ✅ **Imports are EXEMPT** (owner ruling). **Picking an existing student asks for nothing.**
13. **`TASK-663` + `TASK-664` — children with no parent are MARKED and FINDABLE:** the grey **"ยังไม่มีผู้ปกครอง"** tag in the student picker, and the People switch **"นักเรียนที่ยังไม่มีผู้ปกครอง"** with a count.
14. **`TASK-654` — the booking modal's error title reads `บันทึกไม่สำเร็จ` / `Couldn't save`** (it used to blame the DATE for every refusal; the line beneath names the real cause) · **on `อื่นๆ`, Save stays shut until a new student's phone is valid.**

## 5. LINE-side — **NO menu step. Two things to watch.**
- ✅ **Menus and accounts: NOTHING changes.** 🚫 **Do not publish, relink or adopt menus. 🚫 Never `line:remove-menus`.**
- ⚠️ **NEW pushes: an admin recording or lifting a leave day sends that coach a LINE notice** (`teacher_leave_recorded` / `teacher_leave_lifted`). **Extra pushes against the OA's MONTHLY QUOTA.** A coach with no LINE link gets none, and the admin's screen says so.
- **Check the outbox worker ONCE after start:**
```
[outbox] LINE worker started (every <n>s)
[outbox] sent=<n> failed=<n> retry=<n>
```
🔑 **If "worker started" does not appear, every notice queues and nothing sends — and the deploy LOOKS successful.** ⚠️ **`failed=` with `429: You have reached your monthly limit` is LINE's quota, not our bug.**
- **The check-in reply wording (item 11) changes with the restart — no LINE-side step.**

## 6. ⚠️ The group-swap rate box needs a permission key
**The box appears only for admins holding `action:bookings.coach-rate` (key 59).** **An admin WITHOUT it cannot complete a swap to a coach the group has never paid — the swap is refused, with nothing to type.** ▶️ **Whoever does cover swaps must hold key 59. Check on the Roles screen before telling Khwan.**

## 7. 🔴 WHAT KHWAN MUST HEAR — **ONE message, BEFORE she looks**
1. **The "ขยายได้ถึงสัปดาห์ที่ N" number has been WRONG on uat all along for any course an admin EXTENDED.** **After this release it shows the true week, so numbers she has already seen will CHANGE.** **Her own example: ตินติน's card reads 13; the true number is 14.** ✅ **Courses nobody extended show exactly what they showed before.** 🔑 *A number that changes after a fix looks identical to a number that broke; the difference is whether she was told why.*
2. **A NEW student now needs a parent phone** — on a booking, a new course and a new voucher, **and on an `อื่นๆ` booking when she types a new name.** **Picking an existing student asks for nothing; an `อื่นๆ` booking with no student is unchanged; imports are unchanged.**
3. **A grey "ยังไม่มีผู้ปกครอง" tag now appears on children with no parent, and People has a switch "นักเรียนที่ยังไม่มีผู้ปกครอง" that lists them with a count.** **They are still bookable.**
4. **The LAST badge now STAYS on a course's final session after check-in, and on a no-show.** **The end-of-day "who finished?" review now finds them. It does not go away from that cell.**
5. **Also new for her team:** admins can record a coach's leave (future dates only — today is handled one class at a time on the calendar) · **a course that has not started takes planned absences free and without limit, each pushing the expiry out a week — cancelling one does NOT give the week back** · **a group swap pays the incoming coach their own rate, and asks for one if the group has never paid them** · **a booking error now says "บันทึกไม่สำเร็จ" with the reason underneath.**
### Coaches
**They may receive a LINE notice when an admin records or lifts a leave day for them. Nothing else changes for them.**
### Families
**Only the LINE check-in reply wording (item 11). Nothing else reaches them.**

## 8. Still true from 10-01 — CHECK, do not redo
- **At least one real admin is linked with the current code** — the LINE-links page shows the count.
- **The Teacher role holds `action:calendar.teacher-leave`** — ⚠️ without it no coach can record their own leave.

## 9. ⚠️ KNOWN AND DELIBERATE — **so nothing here is reported as a fault**
- 🔴 **The widened teacher SWAP is backend-only and INERT. Khwan still CANNOT choose which teacher is swapped out** — **the one thing she said would make the control do what she needs.** It needs her screen, next round. 🚫 **Do not soften this.**
- 🔴 **The "child with no parent" defect is NOT fixed for EXISTING rows.** **This release STOPS NEW ones (Piece A) and makes the old ones FINDABLE (Piece B); it repairs none.** ▶️ **If Khwan reports another "no classes" family, it is the SAME OLD cause with the SAME one-row repair — 🚫 not a regression from this deploy.** **Imports may still create a parentless student — the owner's exemption; the tag and the People switch are what make those visible.**
- **`ISB (ECA)` is left alone deliberately** — no course, may not be a child at all; its fate is the owner's per-row decision. **It will show the grey tag and appear in the People count; that is correct.**
- **The `LAST` badge is PERMANENT on the final cell once delivered** — the owner's ruling.
- **The admin leave door is FUTURE-ONLY, at the server as well as the screen** — accepting today would cancel classes and notify families in one irreversible call.
- **Cancelling a declared pre-start day does NOT give its week back** — a make-up may already sit in that week.
- **A coach who somehow reaches an admin-only door gets a generic "no permission"** — the owner left it; no coach can reach those doors from any screen.
- **Two server refusal sentences say "วันนี้" ("today") for whatever date was picked** (the coach-not-working-that-day and coach-on-leave refusals). **They still name the cause; a wording question for the owner next round, not a fault.**
- **Unchanged from 10-01:** a household with only a province on file is asked for its address again · the server checks address SHAPE, not geography · a same-slot make-up re-add sends nothing · a closed camp week still charges and still shows.

## 10. What Tanya tests on uat — **short, READ-mostly**
**REQ-111's short pass:** the week label on one ordinary and one admin-extended course (ตินติน ⇒ 14) · the admin's leave result naming the coach · the ticked-sessions line absent on the admin door, present on the coach's own · today refused on the admin door, a coach's own same-day cancel still working · a group swap to a never-paid coach with a rate.
**The both-teams batch:** the LAST badge on a checked-in final session, in BOTH the day and week grids · the grey tag in the picker and the People switch with its count (expect ~21 on uat, the parentless rows found 10-04, less any repaired/archived) · `อื่นๆ` with a typed new name: Save shut until the phone is valid · a refusal reads `บันทึกไม่สำเร็จ` with its cause beneath.
🔴 **uat is the customer's system: her access there is READ-ONLY. Every case above that WRITES (a leave, a swap, a booking) is a DATA REQUEST for the owner, or is read from what Khwan's team does.** 🚫 **She still cannot test an owner-level LINE account; the coach notice and the check-in reply on a real phone are the owner's.**

## 11. Rollback — **both repos together, and the database is left alone**
**Put the previous build back for BOTH repos at once. 🚫 Never one without the other (§3).**
✅ **No migration ⇒ nothing to undo in the database.** **What the new code WROTE stays readable by the old code:** a stretched expiry is just a later date · an admin-recorded leave day is the same row a coach's own advance leave writes · a student created with a parent simply HAS one.
⚠️ **After a rollback, Khwan WILL see things change back:** **the week label returns to the OLD, WRONG number for extended courses (ตินติน back to 13)** · **the LAST badge vanishes at check-in again** · **the no-parent tag and the People switch disappear** · **a new student can again be saved without a phone.** **Tell her before, not after.**
🚫 **Never roll a migration back to fix an app problem, and never `line:remove-menus` to "reset" anything.**
