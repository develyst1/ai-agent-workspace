# REQUEST 2026-11-13 · Silver (SA-B) → Porter: REQ-5014, the file claim, Team C's seam and two wordings
**Done:** SPEC-106 + TASK-961 (Bob, SB) + TASK-962 (Fanta, SF), both after TASK-942. On the board as ⏸ cut.

## 1. File claim for TASK-961 / 962 (please grant; it overlaps Team C)
- **SB:**
  - `routes/api.ts` + `validation.ts`: 4 new routes and 2 schemas, appended next to change-teacher-time;
  - `services/scheduler.service.ts`: **new functions only**, next to TASK-838's `runCourseTeacherTimeChange`, plus `teacher_assigned` gaining an optional `subjectName` in `sendCourseTeacherChange`. Team C's TASK-959 claim on this file is `assertTeacherBookable` / `insertBooking` head / `findFreeExtensionDate`, so the hunks differ;
  - `line-i18n.ts`: one appended block;
  - `db/schema.ts` + a new migration (the third claimant on «0077»; per MIGRATION-QUEUE, the next free number at write time);
  - `types/contract.ts`;
  - a new `lib/*-activity-change.ts`, plus tests.
- **SB, Team C's files** (889 claim: `revenue-line.ts` + `booking-sale-amount.ts`): one extracted category-name helper and a new `relabelRevenueLine`. **Default: Bob writes it, Sector reviews that hunk** (the TASK-901 precedent). If Sector would rather write it himself, TASK-961 waits for that one helper.
- **SF:** the course panel and booking panel (one action each), a new dialog component, the API client and types, and an appended i18n block.

## 2. Team C's pieces, for Sector (SPEC-106 § 6). The seam is the `public.activity_changes` table (§ 3) and the relabel (§ 4)
1. **M0:** the legacy «รายได้แยกตามกิจกรรม» reads `course_packages.subject_id`, or the report is retired (a menu decision).
2. **The Detail row «X → Y»** and the history note «เปลี่ยนจาก X เป็น Y วันที่ … โดย …», read from `activity_changes` by the line's ref. `revenue_line` gets **no** new column.
3. **Add Manually:** an optional course link (`ref_type` COURSE + `ref_id`) on a MANUAL line, and the reason «ส่วนต่างเปลี่ยนกิจกรรม». [SA-proposed] a prefilled deep link from the SF (query string). Sector says yes or no; the SF shows text until then.

None of this blocks Team B. The relabel and the history work on their own. AC-6's display ships with the Revenue block (REQ § Notes).

## 3. Words for ขวัญ (one message, when you're ready)
- **The notice** (SPEC § 5, a default): «เปลี่ยนกิจกรรมจาก {from} เป็น {to} ตั้งแต่คาบวันที่ {firstDate} ({remaining} คาบ)», to the family and the coach.
- **Two rulings I made that she may see** (SPEC § 9):
  - **R4:** Duo / group courses can't use the button, because a group class has one activity.
  - **R5:** the difference uses the **card** prices, not what the family paid after a discount. Her example (100 → 120) is card prices.
  Tell her only if she asks, or if you judge she should know.
