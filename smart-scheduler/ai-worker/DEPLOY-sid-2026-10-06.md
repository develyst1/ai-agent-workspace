# DEPLOY — sid — 2026-10-06 — batch #2: **REQ-112 (Team A) + Team B's work on the SAME tree**
**Written by @Sober for @Porter. Read in order; the order is the instruction.** 🔴 **sid ONLY. uat is not on this release.**
✅ **Verified by @Sober on ONE tree holding BOTH teams' work — counts, not colours.** 📌 **Team B's own list and checks are @Silver's (via @Porter); this note states the COMBINED numbers and Team A's content.** **A sid batch is ONE batch.**

---

## 0. 🔴 SHIP-SETS — correctness, not advice
- **`656` + `657` + `692` (back) and `658` (front) ship TOGETHER.** **The screens stop talking about a leave quota (658) exactly when the server stops having one (656/657/692).** **Either alone shows the family/admin a rule that is not running.**
- **`690` (back, with migration `0065`) before or with `691` (front).** **691 offers the cancel reason «ปัญหาจากทางเรา»; without 690 + `0065` the server REFUSES it.**
⇒ **In practice: migrate, then deploy BOTH repos together.**

## 1. Environment — 🚫 nothing new.

## 2. 🔴 MIGRATION — ONE new file: `0065_cancel_reason_school_issue`
```bash
bun run db:migrate
```
**Expect `Journal: 66 migration(s)` and the green verify line.** **What it does: redefines the `bookings` cancel-reason CHECK to allow ONE more code (`SCHOOL_ISSUE`). It writes no rows, changes no data, and touches neither the course-end nor the voucher-end CHECK.**
🔑 **If RED: since `TASK-655`, verify and seed-ledger accept EITHER line ending — a red now is a REAL gap, not a fingerprint. Read it; do not seed blindly.** 🚫 **Never start the app on a schema verify calls bad.**

## 3. Start BOTH repos together (§0).

## 4. What goes out — Team A (REQ-112, the customer's corrected model)
1. **There is NO leave quota any more.** **Leaves are not counted against a limit and nothing is ever "locked"**; the unlock/relock controls, the "x of y leaves", the quota hint and every quota sentence are GONE (screens and LINE). **`TASK-656` / `658`**
2. **The course's end date moves ONLY for three things, +1 week each:** **an absence declared BEFORE the course starts · a COACH's leave (per class cancelled) · a class the school cancels with the new reason «ปัญหาจากทางเรา».** **An ordinary leave never moves it.** **`656` / `690` / `691`**
3. 🔴 **A FAMILY leave with no room for its make-up before the end date is REFUSED** — the parent in LINE gets **her sentence verbatim**; an admin gets *"อายุคอร์สไม่พอสำหรับคาบชดเชย — ขยายวันหมดอายุก่อน แล้วค่อยบันทึกลา"*; **nothing is written**; the admins are told when a PARENT is refused. **A coach's leave or a school cancel is never refused** — if its make-up cannot fit, it is created and the admins are told. **`692` / `657`**
4. **The Undo never changes the end date** (and the REQ-114 "self-block" is gone with it); **the chain refusal now names the steps.** **`657`**
5. **The course card reads "ใช้ได้ถึงสัปดาห์ที่ N" from the course's REAL end date** — no floor. **`658` / grant**
6. **The cancel dialog has a 4th reason, «ปัญหาจากทางเรา», on SESSION cancels only** (with a hint that it extends the course a week). **`691`**
7. **Copy:** `ครู {ชื่อ}` with a space everywhere (5 of ours + Team B's camp site) · the two «วันนี้» sentences · every approved row of `§T-658` and `§T-REQ112-A`. **`659` / `658`**
8. **Tooling: the migration ledger accepts either line ending (`TASK-655`, already committed by the owner).**
### Team B — see @Silver's list (via @Porter): `TASK-667` · `668` + `669` · `670` · `671` · `672` as they report them.

## 5. ✅ The numbers — BOTH teams, ONE tree, re-run by @Sober
**Back: `tsc` 0 · `4202 pass · 0 fail` (322 files) · `unhandled-between-tests: 0` · `66 = 66`.** **Front: `tsc` 0 · `1064 pass · 0 fail` (119 files) · `unhandled-between-tests: 0` · build 0.**
**Break-and-watch, Team A, ALL re-run by me from their files:** back `692` 12/12 · `657` 16/16 · `656` 29/29 · `656b` 7/7 · `690` 9/9 · `659` 8/8 · `609` 7/7 · `646` 3/3 · `608` 9/9 · `650` 7/7 · front `658` 17/17 · `691` 10/10 — **134/134, 0 survived, CHECKSUM identical, every file restored.**
⚠️ **Front sets still carry no in-file test list (`TASK-637` not landed) — run from the lists RECORDED in `TASK-658` / `TASK-691`, not guessed.**

## 6. 🔴 What @Tanya tests — THE GATE: `TASK-657` §R-gate (the LATEST table, "REWRITTEN AGAIN … for TASK-692")
**Three fresh courses (4 / 6 / 10 sessions), every step with its expected end date written down** — incl. her **"15"** (10-session, two coach classes cancelled «ปัญหาจากทางเรา» ⇒ +14) and **"6"** (a not-started 4-session, one declared absence ⇒ week 6), **the 4-session course's SECOND ordinary leave REFUSED (then extend and repeat)**, a customer-reason cancel creating a make-up past the end date with the admin told, **Undo leaving the end date alone**, and **one EXISTING course whose end date must be byte-identical before and after**.
**Plus, by eye:** no "x of y" / quota / lock anywhere · the card's week = the real end date · the 4th reason on the SESSION cancel dialog and **NOT** on Ending a course.
🚫 **The parent's LINE refusal needs a linked parent account on sid — if none, it is the owner's check on uat.**

## 7. ⚠️ Known and deliberate — so nothing is reported as a fault
- **A 4-session course takes ONE ordinary leave; the second is refused until an admin extends the end date.** *(Her model in numbers.)*
- **Some course cards show a LOWER week than before** — the floor is gone; the number is now the real end date.
- **Existing courses are FORWARD-ONLY** — no end date recomputed.
- **After an admin extends, the leave is recorded again by hand** — her answer on whether that is what she wants is still owed; nothing is held or auto-booked.
- **REQ-115 (make-ups born confirmed) is NOT in this batch — next round.** **Make-ups are still created unconfirmed, as today.**

## 8. Rollback — BOTH repos together
**`0065` stays** (it only ALLOWS a code; the old code never writes it). ⚠️ **Rows cancelled with «ปัญหาจากทางเรา» after the deploy keep that code; the old code shows it without a label — harmless.** **End dates moved by the triggers stay (a later date) — old code reads them fine.**

---
## ➕ ADDENDUM 2026-10-07 — QA FAIL F1 fixed: `TASK-694` (FRONT ONLY) — redeploy the FRONT; no migration, no back change
- **What changes:** **a COURSE class cancelled from the PLAN modal now offers ONE checkbox «ปัญหาจากทางเรา» (off by default, the approved hint under it); ticked ⇒ +1 week (the server already did this).** **The GROUP series "cancel all" offers the same single choice** (group dates have no single-date cancel on any screen). **The non-course cancel dialog is back to its three reasons** (there the reason added no week and its hint would have been false).
- ✅ **Re-run by @Sober:** FE `tsc` 0 · `1073 pass · 0 fail` (120 files) · `unhandled-between-tests: 0` · build 0 · **`694` 7/7 BITE (re-run whole) · `691` 6/6 BITE after V4–V7 were RETIRED (their subject removed on purpose; recorded in `TASK-691`, superseded by `694` W3)** · CHECKSUM identical, files restored. **Back unchanged from §5.**
- ▶️ **@Tanya, on sid: re-run `TASK-657` §R-gate step 3b (10-session: cancel sessions 4 and 5 from the PLAN modal, box ticked ⇒ +14) and step 4 (6-session: cancel session 4, box ticked ⇒ +7) ON THE SCREEN.** **Also: the box UNticked ⇒ +0; a GROUP series cancel-all with the box ⇒ each seat's course +7; the non-course cancel dialog shows three reasons and no hint.**
