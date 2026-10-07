# DEPLOY — uat — FRI 2026-10-09 — **ROUND 1: REQ-112 (the customer's leave-and-expiry model) + the family expiry notice + Team B's batch, ONE tree**
**Written by @Sober for @Porter, 2026-10-07, against what is COMMITTED.** 🔴 **This is the REAL OA (`@427ybeky`) and REAL families.** **Read it in order; the order is the instruction.**
**Build from:** back **`de61a7d`** · front **`15528f3`** — **both trees clean** at the time of writing. **New since the last uat release** (back `feb01ae` · front `f00435d`, `DEPLOY-uat-2026-10-05.md`): back `b31cbff` · `fc2338f` · `b700f5b` · `de61a7d` — front `20dd1fd` · `826d42f` · `f2ae63a` · `8afc038` · `8a490ca` · `2c84cec` · `15528f3`.
⚖️ **Owner's cadence (2026-10-07):** a deadline is a ceiling, not a target. **Nothing in this note was shrunk to fit Friday, and no QA step was cut.**

---

## 🔴 READ FIRST — THE ONE COMMAND THAT MUST NEVER BE RUN
# 🚫 DO NOT RUN `line:remove-menus`. EVER.
**It deletes EVERY rich menu it recognises as ours — including the ones in use — and leaves every real follower with no menu.** ✅ **This release needs NO menu step (§6). If a menu ever looks wrong: PUBLISH again. Never remove.**

## 0. 🔴 What must NOT come to us
**`LINE_ADMIN_VERIFY_CODE` is an ENVIRONMENT value.** 🚫 **Never in a task, a board row, a log, this file, or any committed file.**

## 0b. ✅ SATISFIED — the `TASK-700` address line, checked on sid (was: "the owner, on a phone")
**@Tanya, `tests/TEST-082-final-sid-build-smoke.md` §3, on the final sid build `de61a7d`, 2026-10-07:** a family with an address on file sees *"ที่อยู่ / Address: กรุงเทพมหานคร (ที่อยู่เดิมของครอบครัว) / (the address we have on file)"* — **brackets ONCE**, screenshot `ADDR-4-summary.png`. **That is exactly what this step asked for. 🚫 No further check before uat.**
📌 **Boundary, as she stated it:** the district / sub-district questions losing `ค่ะ` were confirmed **in code only** — those screens appear only for a family WITHOUT an address on file. Not a blocker (a two-character deletion pinned by value in `TASK-700`).
🔻 **Why this said "the owner" before:** a SYSTEM-FACTS rule that a LINE-on-a-phone check is never Tanya's. **The owner has since let her run LINE checks on his machine** — so the rule, and this step, were stale.

## 1. Environment — 🚫 NOTHING NEW
**Unchanged:** `LINE_ADMIN_VERIFY_CODE` · `PUBLIC_ADMIN_BASE_URL` (read at RUNTIME). ⚠️ **Confirm both are still set on uat before §2.** No new permission key.

## 2. 🔴 THE MIGRATION — FIRST, and VERIFIED, BEFORE ANY RESTART — **ONE new file: `0065_cancel_reason_school_issue`**
```bash
bun run db:migrate
```
**Expect:**
```
Journal: 66 migration(s)
✅ every migration is recorded in the ledger AND witnessed in the schema.
```
**What it does:** redefines the `bookings` cancel-reason CHECK to allow ONE more code (`SCHOOL_ISSUE` — «ปัญหาจากทางเรา»). **It writes no rows, changes no data, and touches neither the course-end nor the voucher-end CHECK.** **Rehearsed on sid 2026-10-06.**
🔑 **The ledger check:** since `TASK-655` the ledger accepts EITHER line ending (the Windows CRLF fingerprint and the repo's LF one) ⇒ **a red now is a REAL gap, not a fingerprint.** **Read it; do not seed blindly.** If red: `bun run db:seed-ledger` (a DRY RUN) — read every line — only then `--apply`, and re-run `db:migrate` to green.
🚫 **Never start the app against a schema verify calls bad.**

## 3. Start BOTH repos together — **one restart. The ship-sets are CORRECTNESS, not advice:**
- **`656` + `657` + `692` (back) with `658` (front):** the screens stop talking about a leave quota exactly when the server stops having one. **Either alone shows families and admins a rule that is not running.**
- **`690` + migration `0065` (back) before or with `691` / `694` / `695` (front):** the screens offer «ปัญหาจากทางเรา»; **without `0065` the server REFUSES it.**
- **`699` / `700` (back) need no front** — but ride this restart.
⇒ **Migrate, then deploy BOTH repos together.**

## 4. What goes out — Team A
### REQ-112 — the customer's model, in her words (passed the sid gate, `tests/TEST-080-req112-gate-sid-batch2.md` + re-tests)
1. **There is NO leave quota any more.** No "x of y leaves", no lock, no unlock/relock, no quota sentence — on the screens or in LINE. **`656` / `658`**
2. **The course's end date moves ONLY for three things, +1 week each:** an absence declared BEFORE the course starts · a COACH's leave (per class cancelled) · a class the school cancels with «ปัญหาจากทางเรา». **An ordinary leave never moves it.** **`656` / `690`**
3. 🔴 **A FAMILY leave with no room for its make-up before the end date is REFUSED** — in LINE the parent gets **her own sentence verbatim** (`ไม่สามารถแจ้งลาได้ เนื่องจากวันหมดอายุไม่เพียงพอค่ะ กรุณาติดต่อแอดมินค่ะ`); an admin gets *"อายุคอร์สไม่พอสำหรับคาบชดเชย — ขยายวันหมดอายุก่อน แล้วค่อยบันทึกลา"*; **nothing is written**; **the admins are told by LINE when a PARENT is refused.** **A coach's leave or a school cancel is never refused** — if its make-up cannot fit, it is created and the admins are told. **`692` / `657`**
4. **The Undo never changes the end date**; **the chain refusal names the steps** (owner-approved A4). **`657`**
5. **The course card reads "ใช้ได้ถึงสัปดาห์ที่ N" from the course's REAL end date** — no floor. **`658`**
6. **«ปัญหาจากทางเรา» is offered where a course class is actually cancelled:** the PLAN modal's class cancel (**one checkbox, OFF by default**, the approved hint under it) and a GROUP series cancel-all (**ticked ⇒ the three reasons are disabled and cleared**). **The non-course cancel dialog keeps its three reasons** (there the reason adds no week). **`691` / `694` / `695`**
7. **Copy:** `ครู {ชื่อ}` with a space everywhere · the two «วันนี้» sentences · every approved row of `§T-658` and `§T-REQ112-A`. **`659` / `658`**
### The family is told when an ADMIN changes a course's expiry — `TASK-699` (owner ruling + approved words 2026-10-07)
8. **An admin's expiry edit — LONGER or SHORTER — sends the family ONE LINE message** with the new and the old date: *"แจ้งเปลี่ยนวันหมดอายุคอร์สค่ะ: คอร์ส {program} ของ {student} ใช้ได้ถึงวันที่ {to} (จากเดิม {from}) หากมีข้อสงสัย กรุณาติดต่อแอดมินค่ะ"*. **Not** for the automatic +1 weeks · **not** for an ENDED course · **not** to the coach or admins · **not** for a start-date change or a resume.
### Labels and alignment — `TASK-699` §2 · `700` · `701`
9. **The two parent-facing registration strings of §0b (`700`).** Everything else in this step is **code comments only.**
### Team B — **@Silver's list and checks, via @Porter** (`TASK-667`–`672`, `696`, `697`, `698` as they report them). 📌 **This note states the combined numbers and Team A's content.**

## 5. ✅ The numbers — re-run by @Sober on the COMMITTED trees (`de61a7d` / `15528f3`), 2026-10-07
**Back:** `tsc` 0 · **`4232 pass · 0 fail`** (324 files) · **`unhandled-between-tests: 0`** · **`66 = 66`** migrations in files and journal.
**Front:** `tsc` 0 · **`1095 pass · 0 fail`** (122 files) · **`unhandled-between-tests: 0`** · build 0.
**Break-and-watch, Team A, all re-run by me from their files:** back `692` 12/12 · `657` 16/16 · `656` 29/29 · `656b` 7/7 · `690` 9/9 · `659` 8/8 · `699` 10/10 · (+ `609` 7/7 · `646` 3/3 · `608` 9/9 · `650` 7/7) · front `658` 17/17 · `691` 6/6 · `694` 7/7 · `695` 2/2 — **0 survived, CHECKSUM identical, every file restored.** **`700`'s two changes caught by hand** (`ค่ะ` put back ⇒ its pin fails; the old bracket wrapper put back ⇒ the suite fails).
**Boundary of my verification:** code and tests. **The sid screens are @Tanya's (TEST-080 + re-tests: PASS); the LINE text on a phone is the owner's (§0b).**

## 5b. 🏷️ Approval labels — what this release does and does NOT claim (unsoftened)
- **Back end, Team A: every approval label is true — 17 flipped to APPROVED (each byte-checked against the approval record).** Only Team B's two remain (`parent.service.ts:285`, `validation.ts:719` — @Silver's).
- **Front, Team A: 25 flipped and byte-checked · 0 differ from their approval · 23 labels still DRAFT because those strings have NO recorded approval — live and listed.**
- 🔴 **Those 23 labels cover 47 sentences already in front of Khwan's team and families that NOBODY has read** — `COPY-SET-live-unread-2026-10-07.md`, going to the owner AFTER this release. 🚫 **This release is not a clean bill on copy, and it does not claim one.**

## 6. LINE-side — **NO menu step. New pushes to watch.**
- ✅ **Menus and accounts: NOTHING changes.** 🚫 **Never `line:remove-menus`.**
- ⚠️ **NEW pushes against the OA's MONTHLY QUOTA:** the family's expiry notice (`699`) · the admins' "a parent's leave was refused" (`692`) · the admins' "make-up created past the end date" (`657`).
- **Check the outbox worker ONCE after start:** `[outbox] LINE worker started (every <n>s)` and `[outbox] sent=<n> failed=<n> retry=<n>`. 🔑 **No "worker started" ⇒ every notice queues and nothing sends, and the deploy LOOKS successful.** `failed=` with `429 … monthly limit` is LINE's quota, not our bug.

## 7. ⚠️ Known and deliberate — so nothing is reported as a fault (UNSOFTENED)
- 🔴 **Make-ups are STILL CREATED UNCONFIRMED. REQ-115 is NOT in this release.** On uat (READ 1, 2026-10-06): **305 future make-ups on 158 courses were unconfirmed** — a family cannot check in to one, and the day-end auto-attend skips it, until an admin confirms it by hand. **REQ-115 ships as its OWN release, ceiling FRI 16.**
- 🔴 **GROUP make-ups queue ONE PER WEEK in the coach's slot.** A group class cancelled with «ปัญหาจากทางเรา» gives each seat its week — but **each seat's make-up is created as a standalone class in the coach's slot, so they line up week after week** (on sid, a 6-seat test reached into April), and the admins get one "past the end date" notice per make-up that lands past its course's expiry. **Pre-existing, NOT a regression of this release. The owner's ruling on the fix is still PENDING.**
- **A course takes an ordinary leave only while its make-up fits before the end date** — a 4-session course takes ONE; the next is refused until an admin extends the end date, and **after extending, the leave is recorded again by hand** (nothing is held or auto-booked). *(Her model, in numbers.)*
- **Some course cards show a LOWER week than before** — the floor is gone; the number is the real end date.
- **Existing courses are FORWARD-ONLY** — no end date is recomputed by this release.
- **The family hears NOTHING when an admin changes a course's START date or RESUMES it** (both also move the expiry) — outside the owner's ruling for `699`.

## 8. ✅ After the restart — what @Tanya reads on uat (READ-ONLY; every write there is a DATA REQUEST for the owner)
**One EXISTING course's end date byte-identical before and after** (forward-only) · **no "x of y" / quota / lock word anywhere** · **a course card's week = its real end date** · **«ปัญหาจากทางเรา» on the plan modal's class cancel and the group cancel-all, NOT on the non-course dialog and NOT on Ending a course.** 🚫 **No test leave, cancel or expiry edit on uat** — those reach real families.

## 9. Rollback — BOTH repos together
**`0065` stays** (it only ALLOWS a code; the old code never writes it). Rows cancelled with «ปัญหาจากทางเรา» after the deploy keep that code; the old code shows it without a label — harmless. **End dates moved by the triggers stay (a later date)** — the old code reads them fine. **Family expiry notices already sent cannot be unsent.**
