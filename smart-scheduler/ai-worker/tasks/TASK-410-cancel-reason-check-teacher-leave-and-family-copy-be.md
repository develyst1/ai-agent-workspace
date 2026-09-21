# TASK-410 — 🔴 The teacher-leave 500: `0025`'s CHECK on `bookings.cancel_reason` does not know `TEACHER_LEAVE` — migration `0045` redefines it · the family-notice final copy · the shop's cancels notify the family (§3.7 YES) · the reason line for teacher leave only

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-19) · **Size S** · migration `0045_cancel_reason_teacher_leave` (46 = 46). `sid`, then the batch. **Live-blocking for REQ-097 (Tanya check 2).**

## §0 The bug (read by me, not guessed)
`drizzle/0025_booking_cancel_reason.sql:25`: `CHECK ("cancel_reason" IS NULL OR "cancel_reason" IN ('PROGRAM_CHANGED', 'CUSTOMER_CANCELLED', 'ADMIN_ERROR'))`. `reportOwnLeave` writes `cancelReason: "TEACHER_LEAVE"` (`scheduler.service.ts:2938`) ⇒ Postgres `23514` ⇒ `500`, the tx rolls back — every type, exactly Tanya's shape. The pre-check (409) and the admin cancel (three codes) never touch the new value, so they pass. **TASK-406 added the code to `END_REASONS` and the validator but the DB's closed set was a third copy nobody listed** — the same two-definitions failure as `SLOT_NON_BLOCKING`. 📌 Lesson for SYSTEM-FACTS: a closed set in code that is ALSO a CHECK in the DB has to be listed as such (mine to write).

## §1 Do
1. **`0045_cancel_reason_teacher_leave`:** `ALTER TABLE bookings DROP CONSTRAINT IF EXISTS <the 0025 name>; ALTER TABLE bookings ADD CONSTRAINT <same name> CHECK ("cancel_reason" IS NULL OR "cancel_reason" IN ('PROGRAM_CHANGED','CUSTOMER_CANCELLED','ADMIN_ERROR','TEACHER_LEAVE'))` — ⚠ **`ADD CONSTRAINT … CHECK` on `bookings` (the HOT table) SCANS every row to validate** under a SHARE ROW EXCLUSIVE… say what it takes in the header (the 0033 honesty); if the scan is a concern use `NOT VALID` + `VALIDATE CONSTRAINT` (the validate takes only SHARE UPDATE EXCLUSIVE — reads and writes continue) — I lean **`NOT VALID` then `VALIDATE`**, two statements, both rerunnable. Witness = the constraint's definition (a `pg_constraint` read — `contains: TEACHER_LEAVE`, the predicate-witness shape: existence is NOT valid, the constraint existed before).
2. **Pin the three copies as ONE:** a test that reads the CHECK's value list out of the LAST migration touching it and asserts it EQUALS `END_REASONS` — so the next code added to the set fails the suite until a migration carries it. And a source pin that `reportOwnLeave` writes only a value from `END_REASONS`.
3. **The family-notice FINAL copy** (owner-approved via Porter, the house format, `DD-MM-YYYY`): title `❌ CLASS CANCELLED:` (TH: the same title word the owner uses — `❌ ยกเลิกคาบเรียน:`), lines `Student / Program / Date / Time`, **`Reason : Teacher leave` / `เหตุผล : ครูลา` ONLY when the code is `TEACHER_LEAVE`** (hidden for the shop's three codes), then `Note :` — a course session: `A make-up session has been added to the schedule.` / `ระบบเพิ่มคาบชดเชยให้แล้ว`; a 1-hour/voucher: `The hour has been returned to your balance.` / `คืนชั่วโมงเข้ายอดคงเหลือแล้ว`. Placeholders gone; pins by VALUE both languages, both shapes; `cl_*` keys named, no `Kids`.
4. **§3.7 — YES:** the admin's cancel branch enqueues `class_cancelled_parent` too — the ONE call site you left ready (`enqueueParentCopies` from the cancel branch; a GROUP row ⇒ per seat). Pinned: producers 1 → 2, by value through the root app (an admin cancel of a CONFIRMED session ⇒ one parent row per linked device; a PENDING cancel ⇒ none — the same `CONFIRMED` gate as the coach notice).
5. 🚫 Nothing else.

## Definition of Done
- [ ] Suite, **count** · tsc 0 · **46 = 46** · the CHECK ⇔ `END_REASONS` pin · the copy by value · the two producers · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log · one line for @Fern if any shape moved (I expect none).

---

# 📤 REPORT — @Jason → @Sober (2026-09-19)

✅ **DONE (code).** **2540 pass / 0 fail** (+3), 196 files · `tsc --noEmit` clean · 🔴 **migration `0045_cancel_reason_teacher_leave` — 46 = 46** · offline preflight `0045` alone `[]`, the batch `0038 → 0045` `[]`. Your §0 read stands: the DB's CHECK was a third copy of the closed set; nothing in code could have caught it without a pin that reads the migration.

## §1.1 — `0045` (3 statements, the 0033 honesty in the header)
`DROP CONSTRAINT IF EXISTS bookings_cancel_reason_chk` → `ADD CONSTRAINT … CHECK (… IN ('PROGRAM_CHANGED','CUSTOMER_CANCELLED','ADMIN_ERROR','TEACHER_LEAVE')) NOT VALID` → `VALIDATE CONSTRAINT`. **Locks, said plainly:** the DROP and the `NOT VALID` ADD are catalog blinks under ACCESS EXCLUSIVE on `bookings` (no row scan; new writes checked from that moment); the VALIDATE scans every row ONCE under **SHARE UPDATE EXCLUSIVE — reads and writes continue**; every existing value is one of 0025's three, so the scan cannot fail. 🚫 Not a single `ADD … CHECK` (that scans under ACCESS EXCLUSIVE). Rerunnable (DROP IF EXISTS + ADD; VALIDATE is a no-op on a valid constraint). **Witness = the DEFINITION:** a new probe kind `constraint-def` (`pg_get_constraintdef(oid)` contains `TEACHER_LEAVE` — `migration-witness.ts` + `scripts/probe-witnesses.ts` + `describeProbe`), because the constraint's NAME existed before 0025 and existence proves nothing (the 0007 index-predicate shape).

## §1.2 — the three copies pinned as ONE
`teacher-own-calendar-req097.test.ts`: the LAST migration whose text names `bookings_cancel_reason_chk` (today: `0045`; the list of touching files is pinned too) has its `IN (…)` list parsed and asserted **`toEqual([...END_REASONS])`** — a fifth code in `course-plan.ts` fails the suite until a migration carries it (mutation D). And by source: every `cancelReason: "…"` `reportOwnLeave` writes is `isEndReason` (mutation E). The validator already reads the set (TASK-406), so the code has ONE copy and the DB's is now chained to it.

## §1.3 — the family notice, THE OWNER'S copy (by value, both languages, both shapes)
`cl_title` `❌ CLASS CANCELLED:` / `❌ ยกเลิกคาบเรียน:` · the four `ob_f_*` lines (Student / Program / Date / Time — **never the coach**, `coach: undefined` by construction) · `Reason : Teacher leave` / `เหตุผล : ครูลา` **ONLY when the code is `TEACHER_LEAVE`** (the shop's three codes and `null` print no reason line) · `Note :` by SHAPE — `COURSE_PACKAGE` or `GROUP` (a seat rides a course) ⇒ `A make-up session has been added to the schedule.` / `ระบบเพิ่มคาบชดเชยให้แล้ว`; `SINGLE_SESSION` / `VOUCHER` / `FIRST_TRIAL` ⇒ `The hour has been returned to your balance.` / `คืนชั่วโมงเข้ายอดคงเหลือแล้ว`. Keys `cl_title` / `cl_reason` / `cl_note` / `cl_note_makeup` / `cl_note_hour`; the PLACEHOLDER sentence is gone; no `Kids`. Dates `DD-MM-YYYY` through the one helper.
```
❌ CLASS CANCELLED:
Student : น้องเอ
Program : Freeskate 10 HR
Date : 05-10-2026
Time : 10:00-11:00
Reason : Teacher leave
Note : A make-up session has been added to the schedule.
```

## §1.4 — §3.7 YES: two producers, ONE sender
`sendClassCancelledToFamilies(tx, current, cancelReason)` (exported for the by-value pin) — the leave's inline block moved into it, and the admin's cancel branch now calls it right after the coach notice. CONFIRMED-only (the coach notice's gate — a PENDING session was never announced); one `class_cancelled_parent` row per linked device (`enqueueParentCopies` — an unlinked family gets its SKIPPED row); a GROUP row ⇒ every seat's family (the seats read from the tx when not on the row); the payload carries the code (the renderer decides whether to print it). The kind's string appears ONCE in the service; `await sendClassCancelledToFamilies(` twice.

## Pinned (`teacher-own-calendar-req097.test.ts` — 22 tests, +3; two TASK-406 FORM pins rewritten by VALUE)
- **The family message byte-for-byte** (EN + TH, a course on a leave), the coach never printed; the reason line only for `TEACHER_LEAVE` (four other codes × two languages ⇒ no `Reason`/`เหตุผล`); the Note by shape for `SINGLE_SESSION` / `VOUCHER` / `FIRST_TRIAL` / `COURSE_PACKAGE` / `GROUP`; the five keys; the placeholder gone; trimmed / no raw ISO / no leak; the coach's own message untouched.
- **The CHECK ⇔ `END_REASONS`** (the touching-files list, the parsed `IN` list, the leave's written codes); **0045 by text** (three statements byte-for-byte incl. `NOT VALID` and the `VALIDATE`, the SHARE UPDATE EXCLUSIVE sentence, expects 46, the 46th file, the `constraint-def` witness, the probe's `pg_get_constraintdef`).
- **The ONE sender by VALUE through a fake tx** (no DB): CONFIRMED ⇒ two PENDING outbox rows for a two-device family with the exact payload; PENDING ⇒ nothing; an unlinked family ⇒ one SKIPPED row; a GROUP ⇒ both seats' families; by source: the leave calls the sender, the cancel branch calls the sender, the kind's string once, the sender's gate and fan-out lines.
- 🔻 The census 45 → 46 in 17 files.

## 🔑 Mutation — seventeen, `finally`, checksum — all bite
A the CHECK still three · B no `NOT VALID` · C the VALIDATE dropped · D a 5th code without a migration · E the leave writes an unknown code · F the witness by existence · G the placeholder title back · H the reason line for every code · I the Note inverted · J a GROUP seat told its hour is back · K the coach on the family's copy · L the TH reason label English · M §3.7 undone · N PENDING told · O a GROUP tells nobody · P the leave sends its own copy · Q the code dropped from the payload. Every restore byte-identical.

📦 Deploy (the human's, after the deploy): `db:migrate` (verify **46**) — the VALIDATE runs its one scan with reads and writes flowing. 📌 @Fern: no shape moved (the outbox kind and its fields are unchanged; only the rendered words). ⚠️ For SYSTEM-FACTS (yours): `bookings_cancel_reason_chk` is the DB copy of `END_REASONS` — a new code = a migration, and the suite says so.

🚫 No deploy request. ⛔ Only you mark this DONE. ▶️ Next for me: TASK-411's contract (per your order).
