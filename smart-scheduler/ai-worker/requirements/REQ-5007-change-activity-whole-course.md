# REQ-5007: A button to change the activity of a whole course (also 1 HR and Trial), and what it affects
**Owner, 2026-11-07:** forwarded 2 LINE messages from Khwan as screenshots. **Status:** OPEN: a read-only answer first. No build. She asked to be told limits and impact before anything is done.
**This is the 06:26 line REQ-5002 §1 recorded as cut off** (F-034).
**Conflicts with a recorded ruling:** REQ-053 (owner, 08-16): *"ในการแก้ไข manage course ไม่ควรจะแก้กิจกรรมได้ เพราะคอร์สถูกฟิกตั้งแต่สร้างแล้วว่ากิจกรรมใด"*. Changing that is the owner's call, on the answers below.

## 1. Khwan's words, verbatim
**LINE, 4:31 AM:**
> พี่โด่งคะ รบกวนอีกเรื่องค่ะ ตอนนี้ผู้ปกครองมีเปลี่ยนกิจกรรมมากขึ้นค่ะ จะรบกวนพี่โด่งทำปุ่มเปลี่ยนกิจกรรมทั้งคอร์สให้หน่อยค่า
> ถ้าเป็นไปได้ รวมถึงราย 1 ชั่วโมงและ Trial ด้วยเลยค่ะ แล้วก็ถ้าทำจะส่งผลถึงอะไรบ้างคะ ทั้งรายงานการสอน การนับสถิติกิจกรรมเด็กเรียน และเรื่องเงินหลังบ้าน ถ้าตามความต้องการ เราอยากให้ทุกอย่างถูกต้องตามความเป็นจริงค่ะ แต่ถ้ามีอันไหนที่มีข้อจำกัด ทำลำบากหรือใช้เวลานาน จะกระทบหลายอย่าง พี่โด่งรบกวนแจ้งกลับมาก่อนนะคะ

**Her follow-up, replying to it:**
> สรุปว่าอันนี้เราทำยังไงได้บ้างนะคะ สำหรับเปลี่ยนกิจกรรมทั้งคอร์สค่ะ

## 2. What the files already say
- REQ-053: a course session's program is read-only, server-enforced; a different activity = a different product.
- REQ-036: End course early has reason `PROGRAM_CHANGED`, "carries over to the replacement course, not a refund", with money marked LATER.
- The price card is per program, so two programs can differ in price.

## 3. For the SAs (read only, no change)
**Sober:**
1. What can she do herself today to change a family's activity: a course, a 1 HR, a Trial? Steps as she sees them, and what each does to attended classes, future classes, the expiry, and family and coach notices.
2. If a button were built: what it changes for classes already attended vs still to come. What happens to the teaching report and the activity statistics (SOM Dashboard, Daily Report) under each choice? What must be true "ตามความเป็นจริง"?
3. Where it is hard or risky, and the smallest version, sized.

**Silver:**
4. Money: today's back-office revenue by activity, and the planned Revenue block: what happens to a sale already posted when the activity changes? A different price between programs: what is needed? Sized.

## 4. Porter's questions for the owner (after the answers)
- Does he lift REQ-053 for a deliberate whole-course change?
- Is it inside 39,200 or an extra at the old rate (agenda: new asks are extras)?

## Answer — Sober (SA, Team A), read-only, 2026-11-07 — back `7601560`
Files read: `lib/course-subject-lock.ts`, `lib/course-plan.ts:443/455`, `services/som-report.service.ts:36/76`, `services/scheduler.service.ts` (end-early), `routes/api.ts:129–138`, front `EndCourseDialog.tsx`, `types/app/scheduler/index.ts:479–488`.

### 1. What she can do herself today
**A course — she cannot change its activity in place.** A course has **no subject column**; its program is derived from the first session's subject, and the server **refuses any session-subject change inside a course** (`COURSE_SUBJECT_LOCKED`, `course-subject-lock.ts`; REQ-053, owner 2026-08-16). The FE hides the field. The sanctioned self-serve path is **two steps**:
1. **End the course early** — the End-course dialog on the course panel (`EndCourseDialog.tsx`, radio `POST /courses/:id/cancel`, `:135`), reason **"เปลี่ยนโปรแกรม" (`PROGRAM_CHANGED`)** (rendered radio `EndCourseDialog.tsx:151–152`; label `line-i18n.ts:706`).
2. **Create a new course** in the new activity.
   - **Attended classes:** stay on the old course, subjects unchanged → the teaching report of what was actually taught stays true.
   - **Future classes:** ended (off the calendar from here on).
   - **Expiry:** the old course ends at its end date; the **new** course has its own fresh expiry.
   - **Money:** REQ-036 — **carried over to the replacement, not a refund**, marked LATER (the back-office reconciliation is Silver's Q4).
   - **Notices:** End-course sends the family + coach the usual end notice; the new course sends its own born-confirmed notices.
   - ⚠️ **Not one button:** End-early does **not** auto-create the new-activity course (by design — the code "won't promise a replacement it cannot know is coming", `scheduler.service.ts:3563`). She does both steps.
- **1 HR and Trial:** the course lock does **not** apply (it is COURSE_PACKAGE-only; single / voucher / trial may carry their own chosen program — `course-subject-lock.ts` header). The **certain** self-serve today is **cancel the booking and re-book under the new activity**. ⚠️ Whether an in-place "edit activity" control sits on the 1HR / Trial booking screen I have **not** confirmed with a render line — it needs an FE check before promising it (I am not asserting it exists; the F-035 lesson).

### 2. If a button were built — attended vs future, and the statistics
- **Attended classes must keep their original activity.** The teaching report and the activity statistics (SOM Dashboard, Daily Report) count **per booking's own `subjectId`** (`som-report.service.ts:36`, `:76–77`). A child who attended 5 Balance Play classes then switched *did* study Balance Play for those 5 — "ตามความเป็นจริง" means those rows are **never rewritten**. Rewriting attended rows to the new activity would make the past report and the stats lie.
- **Future classes** take the new activity: a new product, possibly a different price (Silver), possibly different coach eligibility / rates.
- So the correct button is **"change activity from here on"**: attended history untouched, the remaining count continues under the new activity, money reconciled for any price gap. The child's stats then read "Balance Play ×5, then <new> ×N" — correct.
- **"ตามความเป็นจริง" checklist:** attended rows keep their subject · the teaching report shows what was taught each day · each session counts under what it actually was · revenue matches what was charged for each (Silver).

### 3. Where it is hard/risky, and the smallest version
- **Hard / risky:**
  - An **in-place whole-course program rewrite** fights the REQ-053 lock and would corrupt attended-history stats if it touched past rows — it needs the owner to **lift REQ-053** for a deliberate change (Porter's §4).
  - **Price differences** between programs need revenue reconciliation of a sale already posted — Silver's Q4; not self-contained.
  - **Coach eligibility / rates** can differ by activity; future rows may need a coach re-check.
- **Smallest safe version:** a **one-button wrapper around the existing End-early(`PROGRAM_CHANGED`) + create-new-course** flow — keep attended rows on the old activity, start the remaining N sessions on a new course in the chosen activity, carry the money over (LATER). It reuses REQ-036 + course creation, so **no new stats risk** (attended history is intact by construction).
  - Rough size: wrapper + "continue remaining N in activity X" creation + notices + a test ≈ **3–4 engineer-days** (BE+FE+QA). A 1HR / Trial "change activity" (cancel+rebook in one) ≈ **1–1.5 d**.
  - It touches revenue, so it belongs with the **REQ-120 build**, and it needs the owner to (a) lift REQ-053 and (b) say whether it is inside 39,200 or an extra at the old rate (Porter's §4). **No TASK without the owner's word.**

## Porter's recommendation to the owner, 2026-11-07 (not a ruling yet)
Silver's money answer: `CHECK-REQ-5007-money-2026-11-07.md`. Both SAs: put it with the build, not as a loose patch.
- Lift REQ-053 only for a deliberate "change from here on"; attended rows are never rewritten.
- Build it with the Revenue block: End-early wrapper 3–4 d + 1 HR / Trial 1–1.5 d + M0 0.5 d + Revenue add-on 1.5 d ≈ 6–7.5 d, ≈ 1,600–2,000 ฿ at 263 ฿/d, as an extra. Money sizes exclude QA.
- Difference: B, classes still to come. The front office writes no money before Revenue. A lower price is its own entry, without C-f's cancel.
- Until then: today's route (end + new course) counts revenue twice unless corrected by hand. Tanya checks on sid whether a discount on the new course nets it down, and what 1 HR / Trial offer on screen.

**Owner, 2026-11-07:** *"noteไว้คุย กับ พี่เบส PM ฉัน"*. The recommendation above waits for his talk with พี่เบส (Supisit, the owner's PM on this project). No ruling yet; nothing built.

## Tanya's run on sid (TEST-141, 2026-11-07)
- Route works: End course early, reason "Customer changed activity", then New course. Attended rows stay.
- A discount nets the sale down only when the new course costs more (form: 7,900 − 6,490 = 1,410; ledger not read). When it costs less, the books stay over.
- A new course counts from zero in sizes 4, 6, 10; remaining classes don't carry over. Whether a family gets credit for attended classes is the owner's call.
- 1 HR and Trial: no edit-activity control on screen; only Cancel booking + rebook. The API behind Move accepts a new `subjectId`; the screen doesn't offer it.
- Not run: notices, SOM Dashboard and Daily Report after the route, Thai walk, uat. Ledger proof waits for the owner's SQL on sid.

**Ledger proved on sid, owner's SQL, 2026-11-07:** old course +6,490 SALE; new course +7,900 SALE and −6,490 DISCOUNT. Net of the three rows = 7,900. Ending or cancelling a course posted no row.
