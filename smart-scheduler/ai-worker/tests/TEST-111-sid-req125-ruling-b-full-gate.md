# TEST-111: REQ-125 ruling B full gate. One teacher's leave on a multi-teacher class removes only that teacher

- **QA:** Tanya
- **Date:** 2026-10-20 / 21 (Bangkok)
- **Environment:** sid: back `55cdb53` + front `3e4a337`, migration 0071 applied (owner)
- **Brief:**
  - Porter's ⏸️ / ▶️ TEST-111 entries in `inbox/QA.md`;
  - `DEPLOY-REQ-125-rule-b-teacher-leave-2026-10-20.md` §4;
  - `DESIGN-REQ-125-…` §6 (the 7 approved strings).
- **Teacher login:** `qa-coach-qatt75`, under the owner's written exception "อนุญาต b" (DR-2 Part 1). It covers TEST-111 only, is headless, and the password is never printed.
- **Evidence:** `project-docs/qa-2026-10-20/test111/`

**Verdict:** see §Summary at the end.

## Fixtures (QA teachers qatt75 / qatt75b / QACT only; QA kid QAChatTwo only)
Rates as stored per teacher on each row: QACT 200.00 · qatt75b 250.00 · qatt75 300.00 (satang 20000 / 25000 / 30000).

| Key | Date, time | Teachers (main first) | What it tests |
|---|---|---|---|
| F1 `5a351db0` | 3 Nov 09:00, Other/ECA | QACT → qatt75b → **qatt75** | qatt75 is an extra (3rd) |
| F2 `17e300b5` | 3 Nov 11:00, Other/ECA | **qatt75** → qatt75b → QACT | qatt75 is MAIN; promotion (D1) + rate |
| F3 `066af9d2` | 3 Nov 13:00, Other/ECA | **qatt75** alone | sole teacher |
| F4 `6b8ac393` + F4b `31350a7f` | 3 Nov 14:00 | F4: **qatt75** → qatt75b · F4b: qatt75b alone | D4: qatt75b is busy as main at 14:00 |
| G `1602d150` (series `a5bd65da`) | 3 Nov 15:00, GROUP | QACT → **qatt75** | a GROUP extra coach |
| F5 `3734eebc` | 5 Nov 09:00, Other/ECA | qatt75b → **qatt75** | the range 4–6 Nov |
| F6 `d3309ff5` | 17 Nov 09:00, Other/ECA | QACT → qatt75b → qatt75 | all 3 teachers on leave |

The first try was refused by my own pre-check and created nothing: qatt75's 3 Nov 10:00 is held by an old QA sick-leave row. F4 moved to 14:00.

## A · Advance leave, one day (3 Nov, qatt75, through the admin dialog): ✅
- **The server preview** (`GET /teacher-leave-days/preview`, read-only):
  - continues: 09:00 with QACT, qatt75b · 11:00 with QACT, qatt75b, **promoted QACT** · 15:00 with QACT;
  - toHandle: 13:00;
  - cannot: 14:00;
  - counts `continues 3 · cancel 0 · toHandle 1 · cannot 1`.
- **The dialog before save** (`adv-3nov-before-save.png`): *"3 co-taught class(es) will go on with the other teachers; qatt75 is taken off them."* = approved string 2, verbatim.
- **Saved.** `POST /teacher-leave-days` ⇒ 200 `mode advance · cancelled 0 · familiesNotified 0 · teacherNotified 0` (qatt75 has no LINE). It returned:
  - `continues` = F1, F2 (`promotedTo` QACT), G;
  - `toHandle` = F4 (`no-eligible-main`);
  - `bookings` (still to handle) = F3, F4.
- **The result view** (`adv-3nov-after-save.png`):
  - lists F3 and F4 as booked;
  - the D4 sentence verbatim: *"qatt75 can't be taken off the 14:00 class: no other teacher of it is free at that time. Please handle this class in the calendar."* (string 7);
  - rows *"09:00 Continues with QACT, qatt75b · 11:00 Continues with QACT, qatt75b · 15:00 Continues with QACT"* (string 3);
  - "NOTHING HAS BEEN CANCELLED…" as before.

**Read back after the save:**

| | Status | Main | Teachers | Rates kept on the row |
|---|---|---|---|---|
| F1 | PENDING | QACT | QACT, qatt75b | 200, 250 (qatt75's 300 gone) |
| F2 | PENDING | **QACT (promoted, D1: "QACT" < "qatt75b" by name)** | QACT, qatt75b | **200 = QACT's own rate**, not qatt75's 300 (TASK-625) |
| F3 | PENDING | qatt75 | qatt75 | unchanged: sole, listed |
| F4 | PENDING | qatt75 | qatt75, qatt75b | **unchanged (D4: left as is, not cancelled)** |
| G | PENDING | QACT | QACT (qatt75 off; the group runs on) | QACT 200 |

- **The calendar strip** (`strip-3nov.png`): *"qatt75 is away — 2 class(es) to handle"*. It counts F3 + F4 only, not the 3 that continue. ✅
- **The leave panel** (`panel-3nov.png`):
  - "Tue 03/Nov/26 2 class(es) booked";
  - three "Continues with …" rows;
  - F3 and F4 with Open. ✅
- **The notice rows** (owner's early SQL, DR-2 Part 2), tied to this record:
  - two `teacher_coleave_continues` rows for 3 Nov, leaver qatt75, both SKIPPED (no LINE).
  - **One for QACT:** F1 09:00, **F2 11:00 `becameMain: true`**, G 15:00.
  - **One for qatt75b:** F1, F2.
  - **No `recipient_type=parent` row.** ✅ ONE per remaining coach per day, and no family.

## B · Cancel leave puts the teacher back (D2): ✅
- **Cancel leave from the panel** (`after-lift-3nov.png`): `DELETE …/2026-11-03` ⇒ 200 `restored` = F1, F2, G.
- **Read back:**
  - F1 = QACT, qatt75b, **qatt75**;
  - F2 = main **QACT stays** + qatt75b + **qatt75 as an extra** (D2);
  - G = QACT + qatt75.
  - qatt75's own **300** is back on all three. F3 and F4 are untouched.
- 🟡 **O1 (copy, not one of the 7):** the Cancel-leave confirm still says *"Existing classes don't change."* After ruling B that is no longer true: Cancel leave now puts the teacher back on the co-taught classes. A wording question for Porter / the owner. The behaviour is right.

## C · Advance leave, a range (4–6 Nov, qatt75): ✅
- **API run:**
  - preview: 5 Nov 09:00 continues with qatt75b; 10:00 toHandle (an existing QA course, QAChatOne);
  - record ⇒ 200 `advance-range`; F5 → qatt75b alone (qatt75's 300 gone);
  - lift the range ⇒ 200 `restored` F5; F5 → qatt75b, qatt75 (250, 300). ✅
- **The dialog run** (`range-4-6nov-before-save.png`, `-after-save.png`):
  - before save: *"1 co-taught class(es) will go on with the other teachers; qatt75 is taken off them."* (string 2) next to "blocks all 3 days";
  - the result per day: 4 Nov "Nothing booked" · 5 Nov "1 class(es) booked: 10:00 QAChatOne · Private SURFSKATE CONFIRMED" + "09:00 Continues with qatt75b" · 6 Nov "Nothing booked";
  - the answer: `days[]` with `continues` / `remainingCoaches` per day, `continuedClasses 1`;
  - lifted afterwards ⇒ 200 `restored` F5.
- **The existing QA course at 10:00 is listed and untouched**, exactly as REQ-123.

## D · All 3 teachers on leave the same day (17 Nov, advance, in order qatt75 → qatt75b → QACT): ✅
| Step | Preview | F6 after |
|---|---|---|
| qatt75 | 09:00 continues with QACT, qatt75b | QACT, qatt75b |
| qatt75b | 09:00 continues with QACT | QACT |
| QACT (the last) | 09:00 **toHandle** | QACT, listed "to handle" (`bookings` 09:00), **not cancelled** |

- **Lifting:** QACT's lift restores nothing; qatt75b's lift ⇒ `restored` F6 → QACT, qatt75b; qatt75's ⇒ QACT, qatt75b, qatt75. All rates back (200 / 250 / 300).
- **Other rows on 17 Nov:** qatt75's 10:00 and qatt75b's 13:00 / 17:00 are other existing QA rows (sole). They were listed as before and untouched.

## E · REQ-123 regressions (admin, API): ✅
| Check | Result |
|---|---|
| The admin records TODAY | 400 *"บันทึกวันลาแทนครูได้เฉพาะวันถัดไปเป็นต้นไป …"* (TASK-648, unchanged) |
| A 32-day range | 400 *"ลาล่วงหน้าได้ไม่เกิน 31 วันต่อครั้ง"* |
| A new booking on a leave day (qatt75, 7 Nov) | 409 `TEACHER_ON_LEAVE` |
| A sole class / a lesson-type class on a leave day | listed, not cancelled, no family (F3, the QA course on 5 Nov, F6 when last) |

## F · The approved strings, TH + EN
| # | String | EN | TH |
|---|---|---|---|
| 1 | P7 own leave today, co-taught part | ✅ *"3 co-taught class(es) go on with the other teachers, without you."* | ✅ *"อีก 1 คาบที่สอนร่วมกับครูท่านอื่นจะยังเรียนตามปกติ โดยไม่มีคุณ"* (S5, a co-taught class added for this look, then cancelled) |
| 2 | Advance hint (one day and range) | ✅ | ✅ *"คาบที่สอนร่วมกับครูท่านอื่น 3 คาบ จะนำครู qatt75 ออก และยังเรียนตามปกติ"* (`th-3nov-before-save.png`) |
| 3 | "Continues with {names}" | ✅ | ✅ *"09:00 สอนต่อโดย QACT, qatt75b"* (`th-3nov-after-save.png`) |
| 4 | LINE to a remaining coach | ⚪ not observable: rows SKIPPED (no LINE-linked QA teacher), payload by value only | ⚪ |
| 5 | "(you are now the main teacher)" | ⚪ same: `becameMain: true` on F2 in QACT's payload | ⚪ |
| 6 | `teacher_leave_recorded` extra line | ⚪ qatt75 not LINE-linked ⇒ `teacherNotified 0` | ⚪ |
| 7 | D4 sentence | ✅ | ✅ *"ยังนำครู qatt75 ออกจากคาบ 14:00 ไม่ได้ เพราะครูท่านอื่นของคาบนี้ไม่ว่างในเวลานั้น — กรุณาจัดการคาบนี้ในปฏิทิน"* |

**About the Thai check:** it re-recorded the 3 Nov leave (same result as §A), and I then lifted it ⇒ `restored` F1, F2, G. On that run F2 showed `promotedTo null`, as expected: after the first Cancel leave qatt75 was only an extra on F2.

## G · Same-day leave (the teacher's own door, `qa-coach-qatt75`, 21 Oct): ✅ the act · 🟠 F1 / F2 on the screen
**Fixtures, 21 Oct (Bangkok "today" on the server):**

| Key | Time | Teachers | Expected |
|---|---|---|---|
| S1 `4f608450` | 09:00 | QACT → qatt75b → **qatt75** | qatt75 is an extra, so the class continues |
| S2 `0ab7e1be` | 10:00 | **qatt75** → qatt75b → QACT | QACT is promoted |
| S3 `dcad384c` | 11:00 | 1 HR, **qatt75** alone, QA kid QAChatTwo | sole teacher: cancelled + family |
| S4 `13701661` + S4b `4d7f69a1` | 15:00 | S4: **qatt75** → qatt75b · S4b: qatt75b alone | D4 |
| G2 `917828b2` | 13:00 | GROUP, QACT → **qatt75** | qatt75 comes off |

My pre-check found qatt75 had nothing else today. qatt75b's 12:00 and 14:00 were taken, so the D4 pair went to 15:00. Nothing was created at the refused times.

**The teacher's own calendar before:** Daily shows S1, S2, S3, S4, G2 (`coach-own-today-before-save.png`). ✅

**The own preview** (`GET /teachers/me/leave?preview=2026-10-21`): continues 09:00 · 10:00 (promoted QACT) · 13:00 · **cancel 11:00** · **cannot 15:00** ⇒ counts `continues 3 · cancel 1 · cannot 1`.

**The dialog before save** (`coach-dialog-today-en-before-save.png`):
- *"Saving cancels **2** class(es) and tells their families. 3 co-taught class(es) go on with the other teachers, without you."* String 1 is verbatim.
- 🟠 **F1:** "cancels 2" is wrong. The server cancels **1** (S3). The 2nd is the D4 class S4, which is **left as is with no family told**.
- The same in Thai with S5 (§F): *"จะยกเลิก 1 คาบ"* while S4 is not cancelled.

**Saved** ("Report leave (5 sessions)") ⇒ `POST /teachers/me/leave` 200:
- `cancelled 1` (S3) · `familiesNotified 0` (QA parent, no LINE);
- `continues` S1, S2 (`promotedTo` QACT), G2;
- `toHandle` S4 (`no-eligible-main`);
- `remainingCoaches`: QACT (S1, **S2 becameMain**, G2) · qatt75b (S1, S2).
- The toast reads *"1 sessions cancelled · 0 families told"*, which matches the server. The D4 class is not mentioned after saving; that is Sober's known §5 follow-up, confirmed.

**Read back (admin):**

| | After |
|---|---|
| S1 | PENDING · QACT, qatt75b (qatt75's 300 gone) |
| S2 | PENDING · **main QACT at QACT's own 200** · QACT, qatt75b |
| S3 | **CANCELLED**, reason `TEACHER_LEAVE` (a 1 HR has no course, so no make-up row) |
| S4 | **PENDING, unchanged: qatt75, qatt75b** (D4) |
| G2 | PENDING · QACT only, the group runs on |

- **The own calendar after:** shows **S4 only** (`coach-own-today-after-save.png`). ✅
- **No leave day recorded today.** Same-day leave records nothing (design §3).

**The teacher's own login on an advance day** (3 Nov, look only, `coach-dialog-3nov.png`):
- *"Saving only blocks the day for new bookings. 2 class(es) stay on the schedule for an admin to handle."*
- The server's own preview for that day says `continues 3 · toHandle 1 · cannot 1`.
- 🟠 **F2:** the teacher's own dialog has **no co-taught line** (string 2), so the split is missing for a teacher's own login on a future day. DEPLOY §4 asks for it "also for a teacher's own login". The admin dialog shows it (§A).

**Not run:**
- **All 3 same-day:** it needs three teacher logins; only `qa-coach-qatt75` is in the exception. The rule is the same function as §D (advance, by value).
- **A GROUP main-coach promotion with seats:** not built. G and G2 cover the extra coach, which is what §4 asks.

## Clean-up: ✅
- **Every leave I recorded was lifted by me during the run,** each with `restored` read back. Same-day leave records nothing.
- **QA leave days are back to the pre-test set:** qatt75 31/10, 7/11, 9–12/11 and QADT2 7/11, all from TEST-108.
- **Every QA-T111 row was cancelled** (ADMIN_ERROR):
  - F1–F4b, G, S1, S2, S4, S4b, G2 in `t111z.js` (**started 2026-10-20 17:14 UTC = 00:14 Bangkok, 21 Oct**);
  - F5, F6 and S5 earlier;
  - S3 by the leave itself.
- **Read back:** 0 live `QA-T111` rows on 3 Nov or 21 Oct.
- **Nothing else was touched.** No account was created. The password was typed only under the exception and never printed.

**Scripts (scratchpad):**
- `t111a` / `t111j`: fixtures.
- `t111b` / `t111e` / `t111g`: the admin dialog in EN, range and TH.
- `t111c`: strip, panel and lift.
- `t111d`: range, all-3 and regressions.
- `t111k` / `t111l`: the teacher login.
- `t111state` / `t111m`: read-backs.
- `t111z`: clean-up.

## Summary
**The rule itself: ✅ PASS on sid, by value, every DEPLOY §4 case:**
- same-day co-taught, as extra and as main with the promotion and the rate;
- same-day sole teacher;
- advance one day and a range;
- Cancel leave puts the teacher back (D2);
- all 3 on leave;
- D4;
- a GROUP extra coach (advance and same-day);
- the strip count;
- the "Continues with" rows;
- REQ-123 regressions.
- **Families:** `familiesNotified 0` everywhere a class continued. **Coaches:** one `teacher_coleave_continues` row per remaining coach per day for 3 Nov (owner's early SQL). The 21 Oct rows and the rest come in the SQL re-run.

**Findings:**

| # | Sev | What |
|---|---|---|
| F1 | 🟠 | The teacher's own **same-day** before-save count says "cancels **2**" when the server cancels **1**. The D4 class (left as is, no family told) is counted as cancelled, so the screen over-promises a cancel + family notice. Seen in EN and TH. The act itself is right. |
| F2 | 🟠 | The teacher's own **future-day** dialog has **no co-taught line** (string 2), although the server preview has `continues 3`. DEPLOY §4 wants the split "also for a teacher's own login". The admin dialog has it. |
| O1 | 🟡 | The Cancel-leave confirm still says *"Existing classes don't change."* It is no longer true (the teacher is put back on co-taught classes). The wording is not one of the 7. |
| K1 | ⚪ | Confirms Sober's known §5: after a same-day save only the toast shows; the D4 class left as is isn't surfaced. |
| L1 | ⚪ | Strings 4–6 (LINE) are not observable on screen; covered by value from the outbox payloads (SQL). |

**Pending:** the SQL re-run (DR-2 Part 2), to tie the 21 Oct same-day rows and the parent row for S3.


---
# §re-check: TASK-828 rework (F1 / F2) + O1 + TASK-829 on sid · back `fa1a04c` + front `99d27a5` (no migration) · 2026-10-21
- **Brief:** Porter's ⏸️ / ▶️ re-check entries + `DEPLOY-REQ-125-rework-o1-and-task829-2026-10-21.md` §4.
- **Teacher login:** `qa-coach-qatt75` under the owner's exception "อนุญาต b" (still open: TEST-111 isn't closed).
- **Evidence:** `project-docs/qa-2026-10-21/test111rc/`.

**Verdict: ✅ F1, F2, O1 and K1 pass by value. One new 🟠 (F3), found because the dialog lets the teacher tick a subset of sessions.**

## Fixtures (QA teachers only, `QA-T111R-…`)

| Key | When | Teachers | Role |
|---|---|---|---|
| Z | 21 Oct 09:00 | qatt75 alone | sole |
| Y1 | 21 Oct 10:00 | QACT → qatt75 | co-taught |
| Y2 | 21 Oct 11:00 | qatt75 alone | sole |
| X1 | 21 Oct 12:00 | QACT → qatt75 | co-taught |
| X2 | 21 Oct 13:00 | qatt75 alone | sole |
| X3 + X3b | 21 Oct 15:00 | X3: qatt75 → qatt75b · X3b: qatt75b alone | D4 |
| W1 | 4 Nov 09:00 | QACT → qatt75 | co-taught |
| W2 | 4 Nov 11:00 | qatt75 → QACT | co-taught (10:00 was refused `SLOT_TAKEN` for qatt75b, so W2 moved to 11:00 with QACT) |

- **Pre-check:** qatt75 had nothing else today.
- **Already on qatt75's 4 Nov:** an older QA row at 13:00. The server doesn't count it as live.

## Three same-day runs as the teacher (21 Oct), each saving a different set of ticked sessions
| Run | Ticked | Before save | `POST /teachers/me/leave` | After save | Read back |
|---|---|---|---|---|---|
| 0 (sole only) | Z | "cancels **1**" + 🟠 *"2 co-taught class(es) go on … without you"* + 🟠 the D4 sentence for 15:00 | `cancelled 1` (Z), nothing else | dialog **closes** as before (my screen grab missed the toast) | Z CANCELLED · **Y1, X1 still with qatt75 · X3 untouched** |
| 1 (no D4) | Y1, Y2 | "cancels **1**" + 🟠 "**2** co-taught … go on" (only 1 ticked) + 🟠 the D4 sentence (X3 not ticked) | `cancelled 1` (Y2) · `continues` Y1 with QACT · **no `toHandle`, no `adminsAlerted`** | **result view:** *"1 sessions cancelled · 0 families told · 10:00 Continues with QACT · Close"*. **No "admins have been told" line.** ✅ | Y1 = QACT only · Y2 CANCELLED |
| 2 (with D4) | X1, X2, X3 | **"cancels 1"** (X2) + "1 co-taught … go on" + the D4 sentence for 15:00 ✅ **(F1 fixed: D4 not counted as a cancel)** | `cancelled 1` (X2) · `continues` X1 · `toHandle` X3 `no-eligible-main` · **`adminsAlerted: 0`** | **result view:** *"1 sessions cancelled · 0 families told · 12:00 Continues with QACT · qatt75 can't be taken off the 15:00 class: no other teacher of it is free at that time. Please handle this class in the calendar."* **No "admins have been told" line, correctly, since `adminsAlerted` = 0.** ✅ | X1 = QACT only · X2 CANCELLED · X3 unchanged (qatt75, qatt75b) |

**With all 6 ticked** (look only, before any save): *"Saving cancels **3** class(es) … 2 co-taught class(es) go on … qatt75 can't be taken off the 15:00 class …"*. The server's own preview: `continues 2 · cancel 3 · cannot 1`. **F1 ✅ when everything is ticked.**

- **sid has no LINE-linked admin**, so `adminsAlerted` = 0.
- **The admin alert row** (one SKIPPED row for run 2, none for runs 0 and 1, never to a family or a coach) **is in the owner's SQL re-run**, not on any screen.
- **🟠 F3 (new): the before-save co-taught line and the D4 sentence ignore the ticks.**
  - The cancel count follows the ticked sessions, but the "{n} co-taught class(es) go on" line and the D4 sentence come from the whole day's preview.
  - The server only acts on the ticked sessions, so for an unticked class the screen promises an outcome that doesn't happen. Run 0 proves it: the dialog said "2 co-taught class(es) go on without you" and named the 15:00 D4 class, yet Y1, X1 and X3 kept qatt75.
  - With every session ticked (the default) the screen is right. The fix is presumably the same per-tick filtering the cancel count already has, but that's Sober's call.

## F2: the teacher's own FUTURE-day dialog (4 Nov, look only): ✅
- *"Saving only blocks the day for new bookings. 0 class(es) stay on the schedule for an admin to handle. **2 co-taught class(es) go on with the other teachers, without you.**"*
- The own preview for 4 Nov says `continues 2`.
- ⚪ It uses the own-login wording (string 1, `coTaughtOwn`), not the admin's string 2. That reads right for a teacher, so **no change asked**; noted only because my original F2 named string 2.

## O1: both Cancel-leave confirms vs the dictionary, verbatim: ✅
| Case | Screen = approved string |
|---|---|
| One day, 4 Nov, n = 2 (EN) | ✅ *"That day opens for bookings with this teacher again. qatt75 goes back on the 2 co-taught class(es) they were taken off when the leave was recorded. Other classes don't change. The teacher is told on LINE."* |
| One day, 4 Nov, n = 2 (TH) | ✅ *"วันนั้นจะกลับมาจองคาบกับครูได้ตามปกติ ครู qatt75 จะกลับเข้าคาบที่สอนร่วม 2 คาบที่ถูกนำออกไปตอนบันทึกลา คาบอื่นไม่มีอะไรเปลี่ยน และระบบจะแจ้งครูทาง LINE"* |
| One day, 6 Nov, n = 0 (EN) | ✅ today's text unchanged: *"… Existing classes don't change. …"* |
| Range 4–6 Nov, "Cancel all future days" on the Teacher leave list, n = 2 (EN) | ✅ `cancelRangeBodyRestores` with qatt75 / 2 |

- **Every one was confirmed (lifted)** ⇒ `restored` W1 + W2 (one day ×2, range) · 6 Nov restored nothing.
- On the 4 Nov record W2 promoted QACT (qatt75 was main), and the lift put qatt75 back as an extra.

## Clean-up: ✅
- **Every leave I recorded was lifted through the confirms.** qatt75's Nov leave days are back to the pre-test set (7, 9–12 Nov).
- **Cancelled by the leaves:** Z, Y2, X2.
- **Cancelled by me** (ADMIN_ERROR, from **2026-10-20 20:11 UTC = 03:11 Bangkok**): Y1, X1, X3, X3b, W1, W2.
- **Read back:** 0 live `QA-T111R` rows on 21 Oct or 4 Nov.

**Scripts:** `t111r1` / `t111r2` (fixtures) · `t111r3` (look) · `t111r4` (save runs) · `t111r5` (O1) · `t111r9` (clean-up).

## Still owed: the ONE owner SQL re-run (same DR-2 SQL), covering the first run and this re-check
- **For TEST-111 (first run, 21 Oct 00:0x):** QACT (S1, S2 becameMain, G2) + qatt75b (S1, S2) coach rows; a parent row only for S3.
- **For this re-check (21 Oct 03:0x):**
  - run 1 ⇒ one coach row for QACT (Y1);
  - run 2 ⇒ one coach row for QACT (X1) + **ONE `left_as_is` admin alert row, SKIPPED (no linked admin)**;
  - runs 0 and 1 ⇒ no admin row;
  - no parent row for any co-taught class;
  - the 4 Nov records ⇒ coach rows for QACT (W1, W2 becameMain).
- **Rows after 2026-10-20 17:14 UTC and 20:11 UTC** come from my clean-up cancels.
- **The SQL as given only matches `other_title LIKE 'QA-T111-%'`.** The re-check titles are `QA-T111R-…`, which that pattern **also matches** (prefix `QA-T111`), so no change is needed.


---
# §close: the owner's SQL re-run (DR-2 Part 2) tied, and the "no parent row" question · 2026-10-21
**Verdict: ✅ TEST-111 CLOSED. Ruling B passes on sid.**
- **Open finding:** 🟠 F3 (the before-save co-taught line and D4 sentence ignore the ticks) goes to Sober. The rule itself is right.
- **The owner's exception "อนุญาต b" (`qa-coach-qatt75` on sid) ENDS with this close.**

## The notice rows (all SKIPPED, has_line false), tied to my acts
| Rows | Act | |
|---|---|---|
| 3 Nov ×2 (23:43) | §A record: QACT (F1, **F2 true**, G) + qatt75b (F1, F2) | ✅ |
| 3 Nov ×2 (23:53) | §F Thai re-record: all `false` (qatt75 was only an extra on F2 by then) | ✅ |
| 5 Nov ×2 (23:47, 23:48) | §C range: API run + dialog run, qatt75b (F5) each | ✅ |
| 17 Nov: 2 with leaver qatt75, 1 with leaver qatt75b | §D: after qatt75 → QACT + qatt75b; after qatt75b → QACT; **QACT (the last) → none** | ✅ |
| 21 Oct ×2 (00:09) | §G same-day: QACT (S1, **S2 true**, G2) + qatt75b (S1, S2) | ✅ |
| 21 Oct 03:07 / 03:08 | §re-check run 1 (Y1) / run 2 (X1), QACT | ✅ |
| 4 Nov ×3 (03:09, 03:10, 03:10) | §re-check O1: EN one-day (**W2 true**), TH one-day and range (W2 false: qatt75 was back as an extra after the first lift) | ✅ |
| **`teacher_leave_left_as_is_admin` ×1** (03:08:37, X3 15:00, recipient admin) | §re-check run 2 only (the D4 run). **None for runs 0 and 1. None to a coach or a family.** | ✅ |

**One row per remaining coach per act per day.** No row for a class that didn't continue. No coach row from a clean-up cancel.

## "No parent row for S3": the query didn't miss it; there was nothing to catch. Not a gap
- **S3 would have matched the filter:** `teacher_id` = qatt75, and `created_at` is in range.
- **Why no row:** `classCancelledFamilyAccounts` (`scheduler.service.ts`) tells the family only when the class was **CONFIRMED** (or a confirmed make-up / a GROUP's confirmed seats). Otherwise it returns null: no row, `familiesNotified 0`.
  - S3 was **PENDING**, so its family had never been told about it. That is the standing rule from before ruling B (TASK-445 / 537 / 706), not a REQ-125 change.
  - The same holds for my other cancelled sole fixtures (Z, Y2, X2: all PENDING). **My fixture was wrong to expect a parent row.**
- **The proof, run now** (`t111s.js`, 21 Oct):
  - a **CONFIRMED** sole 1 HR (`aa252d2a`, qatt75 16:00, QA kid QAChatTwo);
  - `qa-coach-qatt75` same-day leave ticking only it ⇒ `POST /teachers/me/leave` 200 **`{cancelled 1, familiesNotified 1}`**. The answer is byte-shaped as before: no split fields on a sole-only act.
  - Read back: CANCELLED `TEACHER_LEAVE`.
  - `familiesNotified` counts the household row landing, SKIPPED for a no-LINE household. **So the sole-teacher path still tells the family**, which is DEPLOY §4 "exactly as before". No new SQL needed.
- **Clean-up:** `aa252d2a` was cancelled by the leave itself. Nothing else was created.

## Final
| Gate (DEPLOY §4 + re-check §4) | |
|---|---|
| Same-day co-taught, as extra / as main, promotion at the new main's own rate | ✅ |
| Same-day sole teacher (cancel + family) | ✅ (`familiesNotified 1` on a confirmed class) |
| Advance one day + range; Cancel leave puts the teacher back (D2) | ✅ |
| All 3 on leave · D4 · GROUP extra coach | ✅ |
| Screens: split counts (F1 ✅), own future-day line (F2 ✅), "Continues with", strip count, O1 confirms, the K1 result view + admin-line gating | ✅ |
| Families never told for a continuing class; one coach row per coach per day; one admin alert per D4 act | ✅ (SQL) |
| The approved strings (7 + O1 + K1 line), TH + EN | ✅ on screen; the LINE bodies by payload |
| **Open:** 🟠 F3, the before-save co-taught line + D4 sentence follow the whole day, not the ticked sessions | → Sober |

---
# §uat: READ-ONLY smoke · uat = back `fa1a04c` + front `c743304`, migration 0071 applied (owner) · 2026-10-21
**Verdict: ✅ PASS. Nothing written on the customer's system.** My guard aborted every non-GET. The only ones were Cloudflare's own analytics beacon (`POST /cdn-cgi/rum`), **0 app writes**. Counts only; teacher names masked, no child names.

| Check | Result | |
|---|---|---|
| **The admin calendar** | renders (121 booking cells, the "Record teacher leave" button); **0 page errors**. The only console errors are "Failed to load resource" for the aborted `/cdn-cgi/rum` beacon (mine, not the app's). | ✅ |
| **The Teachers leave list** (`/scheduler/teachers#teacher-leave`) | opens; the leave section is there with its Cancel-leave / Cancel-all-future-days buttons (4) | ✅ |
| **The advance-leave dialog on a REAL multi-teacher class** | Found **one** in the next 4 weeks: 22 Oct 14:00, an Other with **2 teachers**. Leaver = the extra (name not recorded). | |
| · the server preview (GET; the act runs in a rolled-back transaction) | `continues 1 · cancel 0 · toHandle 0 · cannot 0` | ✅ |
| · the dialog before save | *"Recording leave for ‹teacher› blocks their whole day … Reason * **1 co-taught class(es) will go on with the other teachers; ‹teacher› is taken off them.**"* | ✅ **the co-taught line appears** (string 2 verbatim) |
| · closed with **Cancel** | nothing saved, no write sent | ✅ |
| **TASK-830: the admin parent form, EN** (the empty "Add parent" form, so no personal data) | province: typing "Bueng" ⇒ `["Bueng Kan"]`; district list *"Mueang Bueng Kan, Phon Charoen, So Phisai, Seka, …"*; closed with **Cancel** | ✅ |

My first calendar read showed 0 cells because the uat login hadn't finished (the known slow first start). The re-read after waiting for the session is the one above. **Not done on uat** (read-only): any save, the teacher's own dialog, the LIFF register page.

**Scripts:** `u111.js`, `u111b.js` (lib-uat: non-GET aborted). Screenshots: `project-docs/qa-2026-10-21/uat-smoke/`.
