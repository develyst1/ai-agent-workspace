# SPEC-107: REQ-5014 (change activity), Team C's back-office pieces
**Sector (SA, Team C), 2026-11-13.**
- **For:** REQ-5014, by way of Silver's SPEC-106 §6 and REQUEST-silver-to-porter-2026-11-13 §2.
- **Read against:** BB `e3a37de` and BF `68a9409`, both on 2026-11-13.
- **The seam is SPEC-106 §3** (`public.activity_changes`; its column names are the contract) and **§4** (the relabel).
- **Back office is paused** (owner 2026-11-12: *"พักงาน คือพัก แค่ หลังบ้านนะ"*). So TASK-963/964 are cut **⏸**, and they start when the back-office build resumes. They need Bob's TASK-961 migration on sid for a real run.

## 0. Bob's helper hunk in SB `revenue-line.ts` (TASK-961), reviewed by Sector
**Yes: Bob writes it and I review that hunk** (the TASK-901 precedent).
- **The bar:** one exported category-name builder that both `writeRevenueLine` and `relabelRevenueLine` call, and no second builder.
- **The pin:** the existing revenue-line tests stay green unchanged, and one test shows writer and relabel produce the same name for the same subject and duo flag.

## 1. M0: the legacy «รายได้แยกตามกิจกรรม» reads the course's own subject [SA-decided: fix, don't retire]
- **Today** (`BB revenue.service.ts:70–78`): a course's sport is the subject of its **first booking found**. After a change of activity, that row is the old subject, so a sale would stay under the old activity, while the relabelled `revenue_line` (§4) moves.
- **Fix:**
  - add `subjectId: uuid("subject_id")` to BB's read-only mirror `pubCoursePackages` (`db/schema.ts:849`). It is SB's column, so there's no BB migration;
  - set `subjectByCourse` from `course.subjectId`;
  - the first-booking read stays only as a fallback when that is null (old imports).
- **Retiring the report** is a menu decision, so it isn't taken here. The fix costs ≈ 0.25 d either way.

## 2. Detail «X → Y» and the history note (AC-6)
**BB:** the revenue Detail list (`GET /revenue/lines`, `routes/revenue-ledger.ts:143`) adds an **optional** field to each line DTO:
```ts
activityChange?: { from: string; to: string; changes: Array<{ from: string; to: string; at: string; by: string | null }> }
```
- **Read** from `public.activity_changes`:
  - `ref_type` COURSE → `course_id = ref_id`; a booking line → `booking_id = ref_id`;
  - ordered by `created_at`;
  - subject names come from `subjects`;
  - `from` = the first row's `from`, `to` = the last row's `to`.
- **Absent** when there are no rows. `revenue_line` gets no column.
- **One query per page** (`IN (refIds)`), never one per line.

**BF** (`RevenueLedger/RevenueDetail.tsx`):
- **Detail row:** when `activityChange` is present, the product/category cell shows «X → Y».
- **Expandable note:** «เปลี่ยนจาก X เป็น Y วันที่ d/m/yy โดย <by>», one line per change. English on the GR web per its own rule; the real BF follows its current language.

## 3. Add Manually, linked to the course (AC-3)
**BB `POST /revenue/lines`** (`createLineBody`, `routes/revenue-ledger.ts:46`) takes an optional `courseId: uuid`.
- When it's given:
  - the course must exist in `public.course_packages` (else 400 `field: courseId`);
  - the line is written with `ref_type = 'COURSE'`, `ref_id = courseId`;
  - `source` stays MANUAL;
  - **no idempotency key**, as for every manual line.
- Without it: exactly today's behaviour.
- **The reason** «ส่วนต่างเปลี่ยนกิจกรรม» goes in `remark`. The BF offers it as a preset; there's no new column.

**BF `/revenue/manual`:**
- **Deep link: YES [SA-decided].** It reads `?courseId=&amountMinor=&reason=activity-change` once, on load, and pre-fills the form:
  - the course shows as a read-only chip with a remove (×) button;
  - the amount;
  - the remark preset.
- **The admin still picks the category and saves.** Nothing is posted from the link.
- **Fanta's SF confirm screen** may build `<BF origin>/revenue/manual?courseId=…&amountMinor=…&reason=activity-change`. Exact parameter names as written here.

## 4. Size and order
- **BB (Brew, TASK-963):** ≈ 0.75 d (M0 0.25 · Detail read 0.25 · course link 0.25).
- **BF (Flash, TASK-964):** ≈ 0.5 d.
- **Order:** after the back-office build resumes, and after TASK-961's `activity_changes` migration is on sid (the Detail read needs the table). Team B is never blocked by these.

## 5. Risks
- **R1: the BB mirror's `subject_id`.** If any old course row has a NULL `subject_id` on uat, M0 keeps the booking fallback for it.
  - **Checked 2026-11-13** (uat, read-only, uat-select): 542 courses, **0** with a NULL `subject_id`.
  - The fallback stays as a guard only.
- **R2: the deep link carries no personal data,** only ids and an amount.

## §0 review: Bob's hunk (Sector, 2026-11-13): ✅ ACCEPTED
- **Read:** `git diff` of SB `src/lib/booking-sale-amount.ts` + `src/lib/revenue-line.ts` (TASK-961).
- **One builder:** `revenueCategoryName(kind, subject, duo)`.
  - It reproduces the old literals exactly: `courseLine` used `${subject} · ${kind}` with `kind = c.duo ? "Duo" : "Private"` (`booking-sale-amount.ts:140`); trial/1 HR used `1st Trial (${subject})` / `${subject} · 1 HR`.
  - Both writers call it, and the relabel call site uses the same builder.
- **`ensureCategory`** is the writer's find-or-create block moved verbatim (same query order, same `onConflictDoNothing`, same throw).
- **`relabelRevenueLine`** sets **only** `category_id` by `idempotency_key`, inside a savepoint. It never fails the caller: a logged `[revenue] NOT RELABELLED` + `false`.
- **My re-run:** `bun test src/lib/revenue-line src/lib/booking-sale-amount` → **70 pass / 0 fail** (the old tests, unchanged).
- **Security review:** none. No new input, no new exposure, parameterised drizzle.
