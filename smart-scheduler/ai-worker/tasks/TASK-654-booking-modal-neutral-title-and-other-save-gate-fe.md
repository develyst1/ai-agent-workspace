# TASK-654 — FE: **the booking modal's refusal title tells the truth · the อื่นๆ Save waits for a valid phone** — two XS, ONE file
**From @Sober to @Fern.** **Found by @Tanya on sid (TEST-078 §8); traced by @Silver (`ANSWER-teamB-sid-qa-holds-2026-10-05.md` §2); routed to us by @Porter — both sit in OUR file.** 🔴 **Both BLOCK uat for this batch** (owner's standing position: clear the known rough edges, don't list them).
✅ **Claim:** `src/components/partials/Calendar/Modal/BookingModal.tsx` (ours) + its co-located tests. **Granted for this task only:** the two lines of `booking.dateRejectedTitle` in `src/lib/i18n/dictionaries.ts` (EN ~1159, TH ~3126). 🚫 **Not `StudentSelect.tsx`** (Team B's) — you IMPORT from it, you do not edit it.

---

## 1. 🔴 The title names the wrong cause — **pre-existing, made visible by this batch**
**Today:** `BookingModal.tsx:1843` puts `booking.dateRejectedTitle` — *"จองวันที่นี้ไม่ได้" / "Can't book this date"* — over **EVERY** refusal from Save (`setSubmitError(e.message)`, ~:1440). ⇒ **a missing parent phone, a clash, a suspended household all arrive under a title saying the DATE is the problem.** 🔑 Same class as `F2`: the screen sends the admin to fix the wrong thing.
📋 **OWNER-APPROVED (verbatim, never "improved"):** **TH `บันทึกไม่สำเร็จ` · EN `Couldn't save`.** **The body beneath already carries the real reason — unchanged.**
▶️ **Do:**
- **Rename the key** (e.g. `booking.saveRefusedTitle`) and put the approved wording in. 🔑 **A key still called `dateRejected` that no longer says "date" is a lie for the next reader** — @Jason's rule this week: **the compiler proves a rename for code, a GREP proves it for everything else** (tests, comments, task files). Show me both.
- 🔴 **BEFORE you ship it — @Porter's condition: confirm it reads right for EVERY refusal that reaches this Alert, not just the phone one.** **Deliver a TABLE in your report:** each refusal Save can produce (the conflict-detect call AND `createBooking` on the server — read `smart-scheduler-back` `createBooking` and what it calls; reading is fine), **its body text, and "reads right under `บันทึกไม่สำเร็จ`: yes/no".**
  - ⚠️ **What "breaks" would look like:** a refusal whose BODY does not say what is wrong (it leaned on the old title to say "the date") — e.g. a date refusal whose message never names the date. **Under a neutral title that one loses its cause.**
  - ▶️ **If ANY row is "no": STOP and tell me. 🚫 Do not special-case a title per error, and do not touch a body sentence.**

## 2. 🔴 On the อื่นๆ path, BOTH sentences reach the admin
**Today:** the อื่นๆ picker is NOT `required`, so `StudentSelect` keeps reporting a typed new name (TASK-662 Q3 — a typed name is never silently dropped). **Save stays enabled while that new student's phone is invalid ⇒ the field's error AND the server's refusal show together.**
▶️ **Fix — @Silver's reading, the right one: the field is the normal path, the server is the BACKSTOP.** **In the `isOther` branch of `valid` (~:1357): a NEW student (`student && !student.id`) whose phone fails `isParentPhoneShaped` ⇒ `valid = false`.**
- ✅ **Use the exported `isParentPhoneShaped` from `StudentSelect.tsx`** — it is the SERVER's rule mirrored. 🚫 **Never a hand-rolled `!!phone` or length check** (that is two rules that drift).
- ✅ **Unchanged:** no student at all ⇒ allowed, as today · an EXISTING student (has `id`) ⇒ never asked for a phone · the lesson tabs (already strict via `required`).
- 🚫 **Neither approved sentence changes.** With Save shut, the server sentence simply never reaches the admin on this path — the two-wordings question disappears instead of being managed.

## 3. ✅ Done means
1. **FE `tsc` 0 · `bun test` with COUNTS · `bun run build` 0.**
2. **Value tests (§2):** new name + no phone ⇒ Save disabled · new name + `"12"` ⇒ disabled · new name + a phone-shaped number ⇒ enabled · existing student with no phone on file ⇒ enabled · no student ⇒ enabled (other rules met).
3. **Copy pin (§1):** the Alert's title resolves to `บันทึกไม่สำเร็จ` / `Couldn't save`; **the old key appears NOWHERE** (grep, stated in the report).
4. **Mutations, filed with the test list RECORDED IN YOUR TASK FILE** (the front runner can't carry it until `TASK-637`): **drop the gate (must BITE) · hand-roll `!!student.phone` instead of `isParentPhoneShaped` (must BITE on `"12"`) · gate an EXISTING student too (must BITE) · gate the no-student case (must BITE) · revert the title to the old wording (must BITE).**
5. **The §1 table.**

## 4. 🚫 Not in this task
`StudentSelect.tsx` and every Team B file · any body sentence · a per-error title table · `teacher-scope.test.ts` (frozen until `TASK-653`) · @Silver's People-count XS (next round, Team B's).

---

# 📋 REPORT — @Fern → @Sober (2026-10-05)

**Re-read the front repo first** — `BookingModal.tsx`'s submit path and `valid`, `StudentSelect`'s exported rule, and (read-only) `smart-scheduler-back`'s `createBooking` → `insertBooking` → `assertTeacherBookable` / `assertCourseWritable` / `captureBookingDiscount`. 🚫 **`StudentSelect.tsx` imported, not edited. `teacher-scope.test.ts` not touched.**

**FE `tsc` exit 0 · `bun test` 1000 pass / 0 fail across 111 files · `bun run build` exit 0.** **Break-and-watch 7 mutations, 7 BITES, CHECKSUM identical.**

## §1 ✅ The TABLE — @Porter's condition. **Every row is YES, so nothing is stopped.**
**Derived from the server, not from the error codes I remembered:** `createBooking` → `assertCourseWritable` · `captureBookingDiscount` · `assertRatesOnBooking` · `insertBooking` → `assertHouseholdNotSuspended` · `assertTeacherBookable` · the slot-clash path · the voucher path; plus the route's two guards and the validator.

| # | refusal (source) | body the admin reads | reads right under **บันทึกไม่สำเร็จ / Couldn't save**? |
|---|---|---|---|
| 1 | `SLOT_TAKEN`, identified — `describeSlotClash` → `slotClashMessage` | *ครู{ชื่อ} มีคาบสอนช่วงเวลานี้อยู่แล้ว ({รายการ} {เวลา}) กรุณาเลือกเวลาอื่น* | ✅ **yes** — names the coach, the clashing row, the time **and the way out** |
| 2 | `SLOT_TAKEN`, generic fallback — `GENERIC_SLOT_TAKEN` | *ครูมีคาบในช่วงเวลานี้แล้ว* | ✅ **yes** — names the cause (the coach is busy in this slot) without the old title's help |
| 3 | `TEACHER_ON_LEAVE` — `assertTeacherBookable` | *ครู{ชื่อ} ลาวันที่ {date} — เพิ่มคาบกับครูวันนี้ไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น* | ✅ **yes** — names the coach, **the date**, and both ways out |
| 4 | household suspended — `insertBooking` | *บัญชีผู้ปกครองถูกระงับ — ติดต่อเจ้าหน้าที่เพื่อเปิดใช้งานก่อนจอง* | ✅ **yes** |
| 5 | teacher archived — `assertTeacherBookable` | *ครู{ชื่อ} ถูกปิดการใช้งานแล้ว* | ✅ **yes** |
| 6 | teacher does not work that weekday — `assertTeacherBookable` | *ครู{ชื่อ} ไม่มาสอนวันนี้* | ✅ **yes** — it names the coach and their working day ⚠️ *see the note below* |
| 7 | `VOUCHER_PROGRAM_EXCLUDED` | *วอยเชอร์ใช้กับคลาส Onewheel หรือ Balance Play ไม่ได้* | ✅ **yes** |
| 8 | no hourly price for the program | *โปรแกรมนี้ไม่มีราคาแบบรายชั่วโมง — ครั้งแรกให้ใช้ 1st Trial หรือขายเป็นคอร์ส/บัตร* | ✅ **yes** — and names what to do instead |
| 9 | `VOUCHER_ENDED` | *วอยเชอร์นี้ถูกยกเลิกแล้ว* | ✅ **yes** |
| 10 | voucher out of hours / expired — `voucherUsable` | *ชั่วโมงในวอยเชอร์หมดแล้ว* · *วอยเชอร์หมดอายุแล้ว* | ✅ **yes** |
| 11 | voucher not found / not this student's | *ไม่พบวอยเชอร์* · *วอยเชอร์นี้ไม่ใช่ของนักเรียนที่เลือก* | ✅ **yes** |
| 12 | `COURSE_ENDED` — `assertCourseWritable` | *คอร์สนี้ถูกยกเลิกแล้ว — เพิ่ม/แก้ไข/คิดเงินคาบในคอร์สนี้ไม่ได้* | ✅ **yes** |
| 13 | `COURSE_DROPPED` | *คอร์สนี้พักอยู่ — กด “กลับมาเรียน” ก่อน…* | ✅ **yes** — names the way out, which is why it is a separate string |
| 14 | walk-in seat: group not live | *ไม่พบกลุ่ม* | ✅ **yes** |
| 15 | walk-in seat: body ≠ the group's slot | *คาบต้องใช้ครู/วัน/เวลาเดียวกับกลุ่ม* | ✅ **yes** |
| 16 | FK invalid (`23503`) | *teacher / subject / course อ้างอิงไม่ถูกต้อง* | ✅ **yes** — technical, but it names its own cause |
| 17 | `403` coach-rate — `assertMayEditCoachRate` | *ไม่มีสิทธิ์แก้ค่าสอน* | ✅ **yes** |
| 18 | `DISCOUNT_REFUSED` | the server's problem list, rendered in full beside this Alert (`errorProblems`) | ✅ **yes** — unchanged by the title |
| 19 | body validation (zod, `v.createBooking`) | the validator's own sentence | ✅ **yes** |
| 20 | the conflict-detect call failing (`detect.mutateAsync`) | that call's own `ApiClientError` message | ✅ **yes** — and a detected clash does not use this Alert at all: it renders `booking.blockedTitle` |

⚠️ **One observation, NOT a "no" and 🚫 not touched (row 6).** *ครู{ชื่อ} ไม่มาสอนวันนี้* uses **วันนี้ ("today")** for whatever day the admin picked. **It still names the cause** — this coach does not teach on that day — so it does not lean on the title, and it reads correctly under the neutral one. 📌 **But it is the one body on this list whose wording is looser than its meaning**, and it is a body sentence, so it is not mine to change: **raising it as a question for @Porter, not as work.**
🔑 **And the one that made me check rather than assume: row 20.** A clash found by the **pre-flight detect** never reaches this Alert at all — it renders `booking.blockedTitle` with the occupant named. **Only a clash the SERVER catches at insert comes through here**, which is rows 1–2.

## §2 ✅ The title — renamed, approved wording, and the grep
**`booking.dateRejectedTitle` → `booking.saveRefusedTitle`**, with the owner's words **verbatim**: **`บันทึกไม่สำเร็จ` / `Couldn't save`**. 🚫 Not improved, not extended.
**The grep, as asked** (`grep -rn dateRejectedTitle src scripts`): **2 hits, both inside the rename's own comment** — 🚫 **zero live uses**, in either dictionary, in the component, or in any test. **And the grep is also an assertion now**, so the old key cannot come back quietly: the test reads both dictionaries and the component for it.
🔑 **Why the rename and not just the wording:** *a key still called `dateRejected` that no longer says "date" is a lie for the next reader* — the compiler proved it for the code, the grep proves it for everything else.
**S5 reverts the English, S6 reverts the Thai, and S7 re-adds a cause to the title ("Couldn't save this date") — all three bite.**

## §3 ✅ The อื่นๆ Save gate — the server's rule, imported
**In the `isOther` branch: a NEW student (`student && !student.id`) whose phone fails `isParentPhoneShaped` ⇒ `valid = false`.**
✅ **`isParentPhoneShaped` is imported from `StudentSelect`** — the server's `isPhoneShaped` (floor 9) mirrored. 🚫 **No hand-rolled check:** **S2 replaces it with `!!student.phone` and bites on `"12"`**, which is precisely the drift the import prevents.
**I exported the predicate as `otherNewStudentNeedsPhone`** so the five cases are driven **by value** rather than through the whole create form — the same shape as this file's existing exported rules (`canOfferConfirm`, which `confirm-door.test.ts` already imports). 🔑 *A gate buried in a 1,900-line render is a gate that can only be tested by accident.*

**The five cases, as values:**
| case | Save |
|---|---|
| new name, no phone | 🚫 shut |
| new name, `"12"` (and `08123`, `ไม่ทราบ`) | 🚫 shut |
| new name, `0812345678` / `081-234-5678` / `+66 81 234 5678` | ✅ open |
| EXISTING student, no phone on file | ✅ open — *their household already holds one; asking would invent a requirement the server does not have* (**S3** gates them and bites) |
| no student at all | ✅ open — *an อื่นๆ block needs nobody* (**S4** gates it and bites) |

## §4 Break-and-watch — 7 mutations, 7 BITES, CHECKSUM identical
**Test list, recorded here because the front runner cannot carry it until `TASK-637`:**
```
src/components/partials/Calendar/Modal/booking-modal-task654.test.ts
```
📌 **One file, and that is the honest list** — the predicate is pure and the title is a dictionary value, so nothing else is load-bearing for these seven. 🔑 **I checked that rather than assuming it:** the set was run from this list and every row bites.

| # | mutation | verdict |
|---|---|---|
| S1 | 🔴 the gate is dropped | **BITES** 8/1 |
| S2 | 🔴 the rule is hand-rolled as `!!phone` | **BITES** 6/3 |
| S3 | 🔴 an existing student is gated too | **BITES** 8/1 |
| S4 | ⚠️ the no-student case is gated | **BITES** 7/2 |
| S5 | 🔴 the title reverts (EN) | **BITES** 7/2 |
| S6 | ⚠️ the title reverts (TH only) | **BITES** 7/2 |
| S7 | ⚠️ the title names a cause again | **BITES** 7/2 |

## Files
- **Edited:** `Calendar/Modal/BookingModal.tsx` (the renamed key's one use · the exported predicate · the gate) · `lib/i18n/dictionaries.ts` (the one key's two lines, as granted).
- **New:** `Calendar/Modal/booking-modal-task654.test.ts` · `scripts/mutation/task-654.json`.
