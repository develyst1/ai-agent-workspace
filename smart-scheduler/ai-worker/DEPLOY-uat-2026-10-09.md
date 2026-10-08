# DEPLOY — uat — 2026-10-07 (tonight) — **THE BRANCH TIP: round 1 (REQ-112 + the family expiry notice + Team B's batch) + REQ-115 (make-ups born CONFIRMED, migration `0066`), ONE release**
> ✅ **CLEARED FOR uat — 2026-10-08 01:10.** @Tanya PASSED the sid re-run of `TASK-705` (`tests/TEST-086-task705-sid.md`: D4 next week · D3 unchanged · admin «ครูลา» · D1/D2 regression · the GROUP «ครูลา» door proven by value), after `TASK-704`'s F1 doors (`TEST-085`). **Build from back `6f7a40f` · front `f60d7e7`.** ⚠️ One NEW pre-existing finding (F3) ships with it, stated in §7 — it does not hold this release (@Porter's ruling).
**Written by @Sober for @Porter, 2026-10-07; AMENDED 23:30 to the branch TIP on the owner's decision ("เอาล่าสุดไปเลย").** 🔴 **This is the REAL OA (`@427ybeky`) and REAL families.** **Read it in order; the order is the instruction.**
**Build from:** back **`6f7a40f`** · front **`f60d7e7`** — **both trees clean.** = round 1 (back `de61a7d` · front `15528f3`) **+ back `b782c77` (`TASK-702`, REQ-115, migration `0066`; Team B's `720` labels) + back `d130a1d` (`TASK-704`, the sid gate's F1 fix) + back `6f7a40f` (`TASK-705`, the sid re-run's F2 fix) — no migration in either + front `d6a0926` (`TASK-637` runner + Team B's `721` labels — **comments and mutation files only; I checked: NO shipped string changed**) + front `f60d7e7` (`TASK-703` + Team B's `722`, the make-up mark)**. *(Round 1 alone was to build from `de61a7d` / `15528f3` — superseded tonight.)* **New since the last uat release** (back `feb01ae` · front `f00435d`): back `b31cbff` · `fc2338f` · `b700f5b` · `de61a7d` · `b782c77` · `d130a1d` · `6f7a40f` — front `20dd1fd` · `826d42f` · `f2ae63a` · `8afc038` · `8a490ca` · `2c84cec` · `15528f3` · `d6a0926` · `f60d7e7`.
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

## 2. 🔴 THE MIGRATIONS — FIRST, and VERIFIED, BEFORE ANY RESTART — **TWO new files: `0065_cancel_reason_school_issue` · `0066_booking_is_makeup`**
### 2a. ⛔ BEFORE migrating — the owner's READS on uat (SELECT only; bare SQL)
**Step 0 — every note mentioning ขยาย** (✅ **run by the owner tonight: 0 rows on BOTH sid and uat**):
```sql
SELECT note, status, (extended_from_id IS NOT NULL) AS linked, count(*)
FROM bookings
WHERE booking_type = 'COURSE_PACKAGE' AND note LIKE '%ขยาย%'
GROUP BY 1, 2, 3 ORDER BY 4 DESC;
```
**And the one number that must be 0 — the migration's own `suspect` check, run as a read first:**
```sql
SELECT count(*) AS suspect FROM bookings
WHERE "booking_type" = 'COURSE_PACKAGE' AND "note" LIKE '%ขยาย%' AND NOT ("status" = 'EXTENDED' OR "extended_from_id" IS NOT NULL OR "note" IN ('คาบขยายอัตโนมัติจากการปรับแผนคอร์ส', 'คาบขยายอัตโนมัติจากการลา') OR ("status" = 'CANCELLED' AND "note" IN ('ยกเลิกคาบขยายอัตโนมัติ (ปรับแผนคอร์ส)', 'ยกเลิกคาบขยาย — ย้อนกลับการลา')));
```
🔴 **`suspect` > 0 ⇒ STOP. Do NOT migrate. Send the step-0 rows to @Sober.** *(It means a note we never listed — the migration would refuse anyway, and it would take `0065` and round 1 down with it, see 2c.)*
**BEFORE count — write the numbers down:**
```sql
SELECT count(*) FILTER (WHERE "status" = 'EXTENDED') AS p1,
       count(*) FILTER (WHERE "extended_from_id" IS NOT NULL) AS p2,
       count(*) FILTER (WHERE "note" IN ('คาบขยายอัตโนมัติจากการปรับแผนคอร์ส', 'คาบขยายอัตโนมัติจากการลา')) AS p3,
       count(*) FILTER (WHERE "status" = 'CANCELLED' AND "note" IN ('ยกเลิกคาบขยายอัตโนมัติ (ปรับแผนคอร์ส)', 'ยกเลิกคาบขยาย — ย้อนกลับการลา')) AS p4,
       count(*) FILTER (WHERE "status" = 'EXTENDED' OR "extended_from_id" IS NOT NULL OR "note" IN ('คาบขยายอัตโนมัติจากการปรับแผนคอร์ส', 'คาบขยายอัตโนมัติจากการลา') OR ("status" = 'CANCELLED' AND "note" IN ('ยกเลิกคาบขยายอัตโนมัติ (ปรับแผนคอร์ส)', 'ยกเลิกคาบขยาย — ย้อนกลับการลา'))) AS union_
FROM bookings WHERE "booking_type" = 'COURSE_PACKAGE';
```
**Expected `union_`: roughly the 10-06 figure (≈ 461) plus the make-ups created since** — the 10-06 number used an older list, so it is a sanity check, not a target. **A number far from that ⇒ stop and ask BEFORE migrating.**
### 2b. Migrate
```bash
bun run db:migrate
```
**Expect:**
```
Journal: 67 migration(s)
✅ every migration is recorded in the ledger AND witnessed in the schema.
```
**`0065`:** redefines the `bookings` cancel-reason CHECK to allow ONE more code (`SCHOOL_ISSUE` — «ปัญหาจากทางเรา»). Writes no rows. Rehearsed on sid 2026-10-06.
**`0066`:** adds `bookings.is_makeup` (boolean, NOT NULL, default false), **marks every existing make-up** (four populations: `EXTENDED` · linked to a leave · the two make-up notes · the two cancel notes the trim/Undo overwrite), **changes NO status** (forward-only), and then **CHECKS ITSELF** — `missed` 0 · `extra` 0 · `marked` = `expected` · `suspect` 0 — or **`RAISE EXCEPTION … REFUSED` with the numbers.**
**AFTER — the marker count must equal the BEFORE `union_`:**
```sql
SELECT count(*) AS marked FROM bookings WHERE is_makeup;
```
### 2c. 🔴 IF `db:migrate` FAILS with `is_makeup backfill REFUSED …` — decided NOW, not tonight
**Drizzle runs ALL pending migrations in ONE transaction** ⇒ **the refusal rolls back `0066` AND `0065` together: no column, no marks, no new cancel code, no ledger rows.** ⇒ **the database is exactly as it was** ⇒ **do NOT start the new code** (round 1 does NOT go out tonight either) — **keep the OLD build running** (it is unharmed). **Send the numbers in the message to @Sober.** 🚫 **Never fix it by hand on the box. Never re-run with a looser check. Never migrate `0065` alone by editing the journal.**
🔑 **The ledger:** since `TASK-655` it accepts EITHER line ending ⇒ **a red verify is a REAL gap, not a fingerprint.** Read it; do not seed blindly (`db:seed-ledger` is a DRY RUN first).
🚫 **Never start the app against a schema verify calls bad.**

## 3. Start BOTH repos together — **one restart. The ship-sets are CORRECTNESS, not advice:**
- **`656` + `657` + `692` (back) with `658` (front):** the screens stop talking about a leave quota exactly when the server stops having one.
- **`690` + migration `0065` (back) before or with `691` / `694` / `695` (front):** the screens offer «ปัญหาจากทางเรา»; **without `0065` the server REFUSES it.**
- 🔴 **`702` + `704` + `705` + migration `0066` (back) WITH `703` + Team B's `722` (front):** a make-up is now born CONFIRMED, so its mark must come from `isMakeup` — **a back without the front shows every new make-up as an ordinary class (no mark on the grid, the list or the dialogs); a front without the back has no `isMakeup` to read.** *A make-up that is confirmed and has LOST its mark is worse than today: an admin can no longer see which classes are owed.*
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
### REQ-115 — a make-up is a NORMAL class — `702` (back) · `703` + Team B's `722` (front) · migration `0066`
10. **A make-up is now born CONFIRMED** — from a family's leave, a coach's leave, a school cancel, an admin's Mark absence, and **an absence declared when a course is created** (her 03:39 words: *"เปิดคอร์ส ยังไม่คอนเฟิร์มทั้งคอร์ส · มีการกดลา / ลาล่วงหน้า ⇒ คลาสที่งอกออกไป คอนเฟิร์มอัตโนมัติ"*) — **even inside a course whose other classes are still unconfirmed.** It goes through the SAME confirm a single class gets: **the family and the coach receive the normal "confirmed class" LINE message**, a check-in token, the budget hold. ⇒ **families can check in to it and take leave on it; the day-end auto-attend now covers it.**
11. **If that confirm is REFUSED** (e.g. the freelance budget is spent, or the coach is on advance leave), **the LEAVE STILL GOES THROUGH** — the make-up is created unconfirmed, as before, and the admins get ONE LINE notice. *(The admin sentence for this is with the owner as a DRAFT — see §5b.)*
12. **The «ขยายคาบ» mark now comes from a MARKER, not the status** — a make-up shows its **real status colour PLUS the «ขยายคาบ» chip**: on the day grid, the week grid, the bookings list (Team B, `722`), and the plan modal, booking modal, leave dialog and plan preview (Team A, `703`). **No new words, no new colour.** 👁️ **A marked grid cell is ONE LINE TALLER** (Team B's note).
13. **When a plan shrinks, the engine trims the newest MARKED make-up** (it could no longer trim by status) — **and because that class was announced, the family and the coach now get the normal cancel notice.** An ordinary confirmed class is never trimmed.
14. 🔴 **A make-up the family WAS TOLD ABOUT is cancelled ⇒ the family is told, in the make-up's own owner-approved wording** (no reason, no promise; a new-class date only when one was really added) — **from the Undo of the leave, the trim, an admin cancel, a coach's leave, the series cancel-all.** Before `704`, the Undo told the coaches only and the trim told families *"a make-up has been added"* when nothing was. **`704`** · *(the sid gate's F1, `tests/TEST-084-req115-sid.md`)*
15. 🔴 **When a class is cancelled BECAUSE THE COACH IS OFF, its replacement never lands on that coach's day off** — from the coach's own leave (incl. its group seats), and an admin's cancel or series cancel-all with «ครูลา». Before `705`, cancelling a course's LAST live class re-booked the replacement CONFIRMED into the very slot just cancelled — today, with a coach who is off — and told the family. **Any OTHER cancel reason: unchanged** (the owner's `TASK-551`: a make-up put straight back in the same slot ⇒ nothing changed ⇒ tell nobody). **`705`** · *(F2, `tests/TEST-085-task704-sid.md`)*
15b. **The Undo puts the ORIGINAL class back on without telling the family** — unchanged from today; telling them would be new words (with @Porter).
16. **Bulk confirm still asks the STATUS** — a confirmed make-up is not tickable; a legacy unconfirmed one still is.
### Team B — **@Silver's list and checks, via @Porter** (`667`–`672`, `696`–`698`, `720`, `721`, `722`). 📌 **This note states the combined numbers and Team A's content; `722`'s line above is Silver's own, relayed by Porter.**

## 5. ✅ The numbers — re-run by @Sober on the TIP (back `6f7a40f` = `b782c77` + `704` + `705` · front `f60d7e7`), 2026-10-08
**Back:** `tsc` 0 · **`4299 pass · 0 fail`** (326 files) · **`unhandled-between-tests: 0`** · **`67 = 67`** migrations in files and journal.
**Front:** `tsc` 0 · **`1118 pass · 0 fail`** (125 files) · **`unhandled-between-tests: 0`** · build 0.
**Break-and-watch on the tip:** back **`705` 8/8** (the option ignored · applied to every coach · not passed from the coach's leave / the «ครูลา» admin cancel / the leave's group seats / the GROUP admin cancel / the series cancel-all · passed for any reason, breaking 551) · **`704` 5/5** (the branch reads status again · the Undo skips the family · the Undo tells for an unannounced make-up · the trim hands the sender an unmarked row · an ordinary class gets make-up wording) · **`702` 24/24 · `656` 29/29, re-run on top of `705`** (incl. *the RAISE never fires* · *P3 missing the leave note* · *P4 dropped* · *the migration rewrites a status*) · front **`703` 6/6** · **Team B's `722` 10/10** *(⚠️ its set carries no test list, so the runner REFUSES it on its own — TASK-637's rule; I ran it with its two test files named, `makeup-mark-task722.dom.test.tsx` + `makeup-mark-list-task722.dom.test.tsx`; Silver reports 10/10 too)* — **0 survived, CHECKSUM identical, both trees clean after.** **Round 1's sets, re-run earlier on `de61a7d` / `15528f3`:** back `692` 12/12 · `657` 16/16 · `656` 29/29 · `656b` 7/7 · `690` 9/9 · `659` 8/8 · `699` 10/10 · (+ `609` · `646` · `608` · `650`) · front `658` 17/17 · `691` 6/6 · `694` 7/7 · `695` 2/2 · `611` 24/24 · `634` 11/11.
✅ **The migration's safety, checked in code:** drizzle `0.45.2` runs all pending statements and the ledger rows in ONE transaction — a RAISE leaves nothing.
**Boundary of my verification:** code and tests, on a DB-UNREACHABLE run. ⚠️ **`0066` has NOT yet run against a real database** — **the sid migration tonight is its first real run** (the planted-note refusal rehearsal was DROPPED by the owner; the step-0 read and the `suspect` read in §2a answer the same question on real data). **REQ-115 on screen is @Tanya's sid gate, before uat.**

## 5b. 🏷️ Approval labels — what this release does and does NOT claim (unsoftened)
- **Back end: every approval label is true** — Team A 17 flipped to APPROVED (each byte-checked), Team B's two flipped in `720`. **The ONE label still reading DRAFT is `makeup_not_confirmed` — its words are APPROVED (last line of this section); only the comment is stale.**
- **Front, Team A: 25 flipped and byte-checked · 0 differ from their approval · 23 labels still DRAFT because those strings have NO recorded approval — live and listed.**
- 🔴 **Those 23 labels cover 47 sentences already in front of Khwan's team and families that NOBODY has read** — `COPY-SET-live-unread-2026-10-07.md`, going to the owner AFTER this release. 🚫 **This release is not a clean bill on copy, and it does not claim one.**

- ✅ **`makeup_not_confirmed` — APPROVED by the owner 2026-10-07, as Jason's code text** (TH `🔔 คาบชดเชยของ {student} วันที่ {date} ยังไม่ได้ยืนยัน ({reason}) — กรุณายืนยันคาบนี้`; EN its companion — recorded byte for byte in `COPY-REVIEW-2026-09-29.md`, last section). **Ships tonight as built.** ⚠️ **The code comment beside it still SAYS "DRAFT" — a stale label, not unapproved words; flipped next round** (comments only). *(My shorter redraft was not adopted.)*

## 6. LINE-side — **NO menu step. New pushes to watch — MORE than round 1 alone.**
- ✅ **Menus and accounts: NOTHING changes.** 🚫 **Never `line:remove-menus`.**
- ⚠️ **NEW pushes against the OA's MONTHLY QUOTA:** 🔴 **every NEW make-up now sends the normal "confirmed class" message to the family AND the coach** (`702` — this is the biggest new volume: every leave that creates a make-up) · **a cancelled make-up the family was told about now sends the make-up cancel notice** — from the trim (`702`) and the Undo of a leave (`704`) · the family's expiry notice (`699`) · the admins' "a parent's leave was refused" (`692`) · "make-up created past the end date" (`657`) · "make-up not confirmed" (`702`, rare).
- **Check the outbox worker ONCE after start:** `[outbox] LINE worker started (every <n>s)` and `[outbox] sent=<n> failed=<n> retry=<n>`. 🔑 **No "worker started" ⇒ every notice queues and nothing sends, and the deploy LOOKS successful.** `failed=` with `429 … monthly limit` is LINE's quota, not our bug.

## 7. ⚠️ Known and deliberate — so nothing is reported as a fault (UNSOFTENED)
- 🔴 **NEW make-ups are now born CONFIRMED — but the EXISTING ones are NOT.** **`0066` is forward-only: it marks the existing make-ups and changes no status.** On uat (READ 1, 2026-10-06): **305 future make-ups on 158 courses were unconfirmed** — those stay unconfirmed (no check-in, no day-end auto-attend) **until an admin confirms them** — bulk confirm takes them and sends the proper messages. **Any more than that is the owner's ship-day decision, not a code change tonight.**
- 🔴 **A family whose course is OPENED with a pre-declared absence now gets ONE "confirmed class" message for the make-up's date at creation** — before the rest of their schedule is confirmed. Her own words cover it; Porter is confirming the consequence with her.
- 🔴 **F3 — PRE-EXISTING, FAMILY-FACING, NOT FIXED IN THIS RELEASE: cancelling a GROUP date that is still PENDING tells the seats' families NOTHING about the cancel.** When a course is sold into a group, the dates the sale ADDS to the series are created as PENDING group rows while the child's seat on them is CONFIRMED and the family already holds them in their course's *"CONFIRMED SCHEDULE"*. **Cancel one of those dates and the family gets only the replacement's confirmed message — no "❌ … cancelled" for the date they think they still have ⇒ they can turn up.** A CONFIRMED group date does send the cancel. *(Seen by @Tanya on sid, `tests/TEST-086-task705-sid.md` F3; as old as group seats — REQ-115 did not cause it, and what it adds is a TRUE message.)* ▶️ **Until the fix ships: an admin who cancels a group date should check whether it was PENDING and, if so, TELL THE FAMILIES BY HAND.** **Fix sized for its own small release.**
- 🔴 **GROUP make-ups queue ONE PER WEEK in the coach's slot.** Each seat's make-up is created as a standalone class in the coach's slot, so they line up week after week (on sid, a 6-seat test reached into April); the admins get one "past the end date" notice per make-up past its course's expiry. **Pre-existing, NOT a regression. The owner's ruling on the fix is still PENDING.** ⚠️ **From tonight each of those make-ups is also CONFIRMED and announced** to the family and coach.
- **A course takes an ordinary leave only while its make-up fits before the end date** — a 4-session course takes ONE; the next is refused until an admin extends the end date, and **after extending, the leave is recorded again by hand.** *(Her model, in numbers.)*
- **Some course cards show a LOWER week than before** — the floor is gone; the number is the real end date.
- **Existing courses are FORWARD-ONLY** — no end date is recomputed by this release.
- **The family hears NOTHING when an admin changes a course's START date or RESUMES it** (both also move the expiry) — outside the owner's ruling for `699`.

## 8. ✅ After the restart — what @Tanya reads on uat (READ-ONLY; every write there is a DATA REQUEST for the owner)
**The AFTER marker count = the BEFORE `union_` (§2b)** · **one EXISTING course's end date byte-identical before and after** · **an existing unconfirmed make-up still shows «ขยายคาบ» on the grid and the list** (marked by the backfill) · **no "x of y" / quota / lock word anywhere** · **a course card's week = its real end date** · **«ปัญหาจากทางเรา» on the plan modal's class cancel and the group cancel-all, NOT on the non-course dialog and NOT on Ending a course.** 🚫 **No test leave, cancel or expiry edit on uat** — those reach real families.

## 9. Rollback — BOTH repos together
**`0065` and `0066` STAY** — 🚫 no down-migration on a live box. **`0066` is harmless to the old code: it never reads `is_makeup`.** ⚠️ **But the make-ups created CONFIRMED while the new code ran stay CONFIRMED** — the old code treats them as ordinary classes (it shows no «ขยายคาบ» on them and its trim, which reads the status, will never remove them). **Families and coaches already told cannot be untold.** `0065`: rows cancelled with «ปัญหาจากทางเรา» keep that code; the old code shows it without a label — harmless. **End dates moved by the triggers stay** — the old code reads them fine.
