# SPEC-106: Change the activity of a course (from the next class), a 1 HR or a Trial (REQ-5014, option A)
**Silver (SA, Team B), 2026-11-13.** REQ: `requirements/REQ-5014-change-activity-whole-course-option-a.md`.
**Read:** smart-scheduler-back (SB), branch `dong`, HEAD `bfe5ef6` (2026-11-11). The working tree has 74 uncommitted files from in-flight work; they are not mine and I read none of them.
**TASKs:** TASK-961 (BE, Bob, SB) and TASK-962 (FE, Fanta, SF). Team B builds SB and SF. The revenue pieces in § 6 are Team C's, routed through Porter.

## 1. What exists today (cited)
- **A course's activity** is the column `course_packages.subject_id` (`src/db/schema.ts`, coursePackages l.15–17 of the table). It is set at creation and never changes: the lock is `changesCourseSubject` → 409 `COURSE_SUBJECT_LOCKED` (`src/lib/course-subject-lock.ts`, REQ-053).
- **"The rest of a course" already has a plan:** TASK-838's `runCourseTeacherTimeChange` (`scheduler.service.ts` ~l.6520).
  - It selects the remaining rows as `endableSessions` (`course-plan.ts` l.516, live statuses) **dated today or later**.
  - It moves them in one transaction and calls `reconcileBookingHolds` per row.
  - It records a whole-course coach change (`coachChangedAt` / `latestTeacherId`) and sends `sendCourseTeacherChange` (l.3750): `teacher_unassigned` to the old coach and `teacher_assigned` to the new one.
- **Prices:** the card is `CARD` in `src/lib/sale-items.ts` (per price group × size). The price group comes from `subjects.price_group`, via `resolvePriceGroup` (`scheduler.service.ts` l.2216). The live list price comes from `listPriceMinor(courseItemRef(group, size))` (`sale-items.ts` l.304).
  - **No price on the card:** a 4 h course in `balance-private` or `balance-group` has none, and neither does a subject with `price_group` NULL.
  - **A 1 HR always has a price:** every group has `1:`. A Trial is one flat price (`FIRST_TRIAL_MINOR`).
- **Revenue lines (C1, `bo.revenue_line`), written by SB:**
  - **Course:** key `rl:course:<id>` (`booking-sale-amount.ts` `courseLine` l.122). Its category is the name «<subject> · Private|Duo», found or created by `writeRevenueLine` (`revenue-line.ts` l.64–106).
  - **Trial / 1 HR:** key `rl:booking:<id>`, written **at confirm** (`postConfirmRevenue`, `scheduler.service.ts` ~l.4476), with the category of the booking's subject.
- **1 HR / Trial:** `PATCH /bookings/:id` (`routes/api.ts` l.406, `validation.ts` `moveBooking` l.639) already accepts `subjectId`, but the SF offers no control for it (Tanya, TEST-141). The course lock does not apply to them.
- **End early** keeps attended history (my answer in REQUEST-…-change-activity-her-answers § Answer). This SPEC does not touch it.

## 2. The contract (SB)
### 2.1 Course: `POST /api/courses/:id/change-activity/preview` and `POST /api/courses/:id/change-activity`
Same auth and admin guard as `/courses/:id/change-teacher-time` (`routes/api.ts` l.181–184). The preview runs the act in a rolled-back transaction, as `previewCourseTeacherAndTime` does, so the two cannot disagree.

**Request** (`v.changeCourseActivity`):
```
{ subjectId: uuid,               // the new activity (required, ≠ the course's current one)
  teacherId?: uuid,              // optional new coach for the remaining classes
  manualPriceBaht?: int          // only when the card has no price for (new group × size); 1..100000
}
```
**Response (200, preview and act alike):**
```
{ remaining: n,                          // rows changed (live, dated today or later)
  firstDate, lastDate,
  from: { subjectId, subjectName }, to: { subjectId, subjectName },
  teacherChanged: boolean,
  oldPriceMinor: int,                    // card list price, old group × size
  newPriceMinor: int | null,             // card list price, new group × size; null = not on the card
  priceSource: "CARD" | "MANUAL" | null, // null only in a preview that still needs the typed price
  differenceMinor: int | null,           // max(0, round_baht((new − old) × remaining ÷ size)); null while the price is missing
  changeId?: uuid                        // act only: the history row
}
```
**Errors (4xx, Thai message, as every neighbouring course act):**
| code | when |
|---|---|
| 400 `SAME_ACTIVITY` | subjectId = the course's current subject |
| 400 `MANUAL_PRICE_NOT_ALLOWED` | manualPriceBaht was sent but the card has a price |
| 400 `MANUAL_PRICE_REQUIRED` | act (not preview) and the card has no price and none was typed |
| 400 `MANUAL_PRICE_RANGE` | typed price not an integer in 1..100000 |
| 409 `NO_REMAINING_CLASSES` | nothing live today or later |
| 409 `COURSE_ENDED` / `COURSE_PAUSED` | as `assertCourseWritable` says today |
| 409 `GROUP_COURSE` | any remaining row has a `group_id` (a group/duo class shares one activity; out of scope) |
| 409 `SLOT_TAKEN` | the new coach has another booking in one of those slots (the act rolls back, naming the date) |
| 4xx as today | the coach can't teach the subject, if create/move enforce that today (Bob cites the line, or writes "no such check" in Notes; no new rule) |

**What the act writes, in ONE transaction:**
1. Every remaining row gets `subjectId = new`, plus `teacherId = new` when given. Date, time, status and rates are untouched. When the coach changes, `reconcileBookingHolds` runs per row, as in TASK-838.
2. `course_packages`:
   - `subject_id = new`;
   - when the coach changed, `coachChangedAt` and `latestTeacherId` as TASK-838 sets them;
   - `first_teacher_id` and the size, expiry, `usedSessions` and `leaveUsed` are **not touched** (AC-2, AC-9).
3. **The lock stays for every other path.** `changesCourseSubject` is still called by the per-session edit. This act bypasses it **only** by being its own service function, with no flag on the shared path.
4. **The history row** (§ 3).
5. **The revenue relabel** (§ 4): the course's `rl:course:<id>` line gets the new category. Run it in a SAVEPOINT, the same way `writeRevenueLine` is called. A failure is logged and never fails the act, because the history row still says what should be. Its outcome goes on the history row (`revenueRelabelled`).
6. **Notices (AC-8):** enqueued in the same transaction (§ 5).

### 2.2 1 HR / Trial: `POST /api/bookings/:id/change-activity` (with a `/preview` twin)
- **Allowed on:** `SINGLE_SESSION` or `FIRST_TRIAL` rows with a live status. Anything else → 409 `NOT_SINGLE_OR_TRIAL`; attended → 409 `ALREADY_DELIVERED`.
- **Request:** `{ subjectId, teacherId? }`. **No `manualPriceBaht`:** every group has a 1 h price, and a Trial is flat. A subject whose `price_group` is NULL is refused with 409 `NO_PRICE_GROUP`, as the sale is today.
- **Writes:** the row's `subjectId` (and `teacherId`), plus a history row with `remaining = 1` and size 1.
  - **Already confirmed:** relabel the `rl:booking:<id>` line's category.
  - **Pending:** there is no line yet, and the confirm will write it with the new subject.
  - **Difference** (1 HR only, option A): `max(0, new 1 h − old 1 h)`, shown for the admin to record by hand like a course. **A Trial is always 0.**
- **Response:** the same shape as § 2.1, with `remaining: 1`.

## 3. The history table (SB migration, Bob): `public.activity_changes`
```sql
CREATE TABLE IF NOT EXISTS activity_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES course_packages(id) ON DELETE CASCADE,   -- one of course_id / booking_id
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  from_subject_id uuid NOT NULL REFERENCES subjects(id),
  to_subject_id uuid NOT NULL REFERENCES subjects(id),
  from_teacher_id uuid REFERENCES teachers(id), to_teacher_id uuid REFERENCES teachers(id), -- NULL = coach unchanged
  remaining int NOT NULL CHECK (remaining > 0), size int NOT NULL CHECK (size > 0),
  old_price_minor int NOT NULL, new_price_minor int NOT NULL,
  price_source text NOT NULL CHECK (price_source IN ('CARD','MANUAL')),
  difference_minor int NOT NULL CHECK (difference_minor >= 0),
  revenue_relabelled boolean NOT NULL DEFAULT false,
  actor text, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((course_id IS NULL) <> (booking_id IS NULL))
);
CREATE INDEX IF NOT EXISTS activity_changes_course_idx ON activity_changes(course_id);
CREATE INDEX IF NOT EXISTS activity_changes_booking_idx ON activity_changes(booking_id);
```
- **Additive:** no existing row is touched.
- **Migration number: next free at write time.** TASK-942 and Team C's TASK-959 both claim `0077` (MIGRATION-QUEUE). Read the journal tail and give it a `when` greater than every entry. The queue line says the owner applies it on uat.
- The witness probe names the table, per `lib/migration-witness.ts`.
- **This table is the seam to Team C** (§ 6). Its column names are the contract; renaming one is a SPEC change.

## 4. Revenue relabel (SB, in the act)
- **Category name:** built the way the line's writer builds it today.
  - **Course:** «<new subject> · Private|Duo», where Duo = the course's existing duo flag (`courseLine` l.131).
  - **1 HR / Trial:** whatever `trialOrSingleLine` builds for the new subject.
  - **Do not write a second category builder.** Extract the name part into one exported helper that both the writer and the relabel call. The category is found or created exactly as `writeRevenueLine` does (l.85–97).
- **The update:** `UPDATE bo.revenue_line SET category_id = <cat> WHERE idempotency_key = <key>`. Nothing else on the line moves: amount, month, `product_name`, `occurred_on` and payment all stay (her 11-10 ruling, AC-6).
- **No line yet** (an unposted course sale, or an unconfirmed booking): nothing to relabel. `revenue_relabelled = false`, and the later writer uses the new subject anyway, because the course's `subject_id` changed.
  - Bob checks that `courseLine`'s `subjectName` reads `course_packages.subject_id`, not `bookings[0]`, and cites the line. If it reads `bookings[0]`, fix it to the course's own subject (a one-line change, in scope).

## 5. Notices (AC-8): one message per person per act
- **Family:** a new kind `activity_changed`, sent to the parent the course confirm notices go to. Payload: `{ from, to, firstDate, remaining, teacherName? }`.
- **Coach unchanged:** that coach gets `activity_changed`, with the same payload.
- **Coach changed:** reuse `sendCourseTeacherChange` as is. The old coach gets `teacher_unassigned` and the new coach `teacher_assigned`. Add the optional `subjectName` to `teacher_assigned` so the new coach sees the activity. The new coach does **not** also get `activity_changed`.
- **Wording:** Thai, in `line-i18n.ts`, following the style of the neighbouring course notices. [SA-proposed default: «เปลี่ยนกิจกรรมจาก {from} เป็น {to} ตั้งแต่คาบวันที่ {firstDate} ({remaining} คาบ)»]. **Porter confirms this wording with ขวัญ** before Tanya's run; changing it is a string edit.

## 6. Team C's pieces (Revenue block; Sector designs them). The seam is § 3 and § 4
- **M0, legacy «รายได้แยกตามกิจกรรม»** (`backoffice-back revenue.service.ts` l.70–78, `revenue-attribution.ts` l.138–150): read `course_packages.subject_id`, not "any class row". **Or retire the report**, which is a menu decision.
- **Detail row «X → Y»** (AC-6): when `activity_changes` has rows for the line's ref (`ref_type` COURSE → `course_id`; a booking line → `booking_id`), the Detail row shows the first `from` and the last `to` subject. The history note «เปลี่ยนจาก X เป็น Y วันที่ … โดย …» is read from the same rows. **`revenue_line` gets no new column.**
- **Add Manually, linked to the course** (AC-3):
  - an optional course link (`ref_type = COURSE`, `ref_id`) on a MANUAL line; today MANUAL leaves both NULL;
  - the reason «ส่วนต่างเปลี่ยนกิจกรรม» offered;
  - [SA-proposed] the SF confirm screen gives a link to the back office's Add Manually, prefilled with the course, the amount and the reason (query string). Sector decides whether his form takes it; if not, the SF shows the amount to type.
- **Order:** Team B's SB work does not wait for Team C. The relabel and the history row work on their own. AC-6's Detail and history-note display ship with the Revenue block (REQ § Notes).

## 7. SF (Fanta)
- **Course panel:** a «เปลี่ยนกิจกรรม» action beside «เปลี่ยนครู/เวลา». It is hidden for an ended or paused course, and for a course with a group class.
- **The dialog:**
  - **Fields:**
    - **activity:** a Select of active subjects with a price group, minus the current one;
    - **coach (optional):** the same coach picker as change-teacher-time;
    - **typed price:** a whole-baht input, shown **only** when the preview says `newPriceMinor: null`.
  - **Preview block** (on every field change, debounced, like change-teacher-time): «เปลี่ยน {remaining} คาบ ตั้งแต่ {firstDate}» · old price → new price (with «ราคาพิมพ์เอง» when typed) · **ส่วนต่าง {difference} ฿** (0 when cheaper: «ไม่มีการคืนเงิน») · a note that attended classes stay as they were.
  - **On confirm:** a toast and a refetch. When the difference is > 0, the success state shows the amount with the § 6 link or copy text: «บันทึกส่วนต่างที่ Add Manually (หลังบ้าน)».
- **1 HR / Trial:** the same dialog on the booking panel, with no typed-price input.
- **Every error code in § 2.1** maps to its Thai message, as the change-teacher-time dialog maps its own.
- **Words:** new Thai strings only where none exist. Fanta lists them in her Notes, and Porter checks them with ขวัญ alongside § 5.

## 8. TASKs (cut with `new-id.mjs`)
- **BE, Bob, SB:** §§ 2, 3, 4, 5. Tests (SAFE env; each must fail when its code is removed):
  - only the remaining rows change; an attended row keeps its subject, coach and date;
  - size, expiry and `first_teacher_id` are unchanged;
  - the difference: her example 100 → 120, 4 of 10 left = 8 ฿; cheaper = 0; rounding to whole baht;
  - the price rules: a card price present + typed price → 400; no card price + none typed → 400 on the act and a preview without a difference; the range;
  - `GROUP_COURSE`, `SAME_ACTIVITY`, `NO_REMAINING_CLASSES`, `SLOT_TAKEN` with a full rollback;
  - the relabel: the category changes, and amount / month / product_name do not; with no line, nothing breaks;
  - the per-session lock still refuses (`COURSE_SUBJECT_LOCKED`);
  - notices: one per person, both with and without a coach change;
  - 1 HR: pending and confirmed; Trial difference 0;
  - the migration text / witness / journal pins.
  - **Plus a rolled-back sid proof** (host .206 check first): one course changed, residue 0.
- **FE, Fanta, SF:** § 7. Tests:
  - the input appears only on `newPriceMinor: null`;
  - the preview shows remaining / difference / no refund;
  - each error code shows its message;
  - the 1 HR / Trial dialog has no price input;
  - readable at 375 px.
- **Order:** both after TASK-942 (the owner's 14 Nov start). Fanta builds against this contract and needs Bob only for the real run.
- **Git:** none in the TASKs. The SA commits on the owner's word after sid + Tanya.

## 9. Risks, assumptions, unknowns
- **R1 (medium): rows dated today but already attended.** `endableSessions` takes live statuses only, so an attended row today is excluded. Tested.
- **R2 (low): a course whose sale never posted** (an imported course; CHECK-REQ-5007 § 1) has no line. `revenue_relabelled = false`, and the Detail shows nothing. Acceptable; noted.
- **R3 (low): the coach eligibility rule** is whatever create/move do today. If they do nothing, the act does nothing. No new rule is invented here.
- **R4: Duo / group courses are refused (`GROUP_COURSE`).** [SA-decided: a group class's activity is the group's, and changing one member would split the group.] If ขวัญ needs it, it's a new item.
- **R5: the old price is the card list price, not what the family paid after a discount.** [SA-decided: her example uses card prices; a discount stays on the old sale.] Porter: tell her if she asks.
- **R6: «revenue by activity» before Team C's M0 lands:** the legacy report may show either activity for a changed course (CHECK-REQ-5007 § 2). Ship M0 with or before this.
- **Assumed:** the act's admin guard is the change-teacher-time one. Bob confirms it in his Notes.
