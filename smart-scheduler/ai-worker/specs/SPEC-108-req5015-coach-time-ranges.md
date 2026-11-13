# SPEC-108: Coach time ranges (part-day leave, working hours) + leave for several coaches (REQ-5015)
**Sector (SA, Team C), 2026-11-13.**
- **For:** REQ-5015 (free; owner via Porter).
- **Read against:** SB `dong` working tree (base `bfe5ef6`, with TASK-959/942/961 in it) and SF `dong` @ `86316ee`, on 2026-11-13.
- **TASKs:**
  - TASK-965 (Brew, SB): AC2 + AC3;
  - TASK-966 (Flash, SF): AC1 + the AC2/AC3 screens.
- **Order with F1:** see §6.

## 1. What exists (cited)
- **Leave table:** `teacher_leave_days` (`schema.ts:1341`): one row per coach per **date** (unique `teacher_leave_days_teacher_date_uq`), `reason`, `range_id`. No time.
- **The one leave reader:** `teacherLeaveOn(exec, teacherId, date)` (`lib/teacher-leave.ts:55`), used at 9 call sites. Among them:
  - `assertTeacherBookable` (`scheduler.service.ts:1042`, Seam A: every insert / move / swap door);
  - `findFreeExtensionDate` (`:3140`, Seam B: the make-up skips the day).
- **Advance leave act:** `reportTeacherLeave` (`:3863`).
  - **Future dates are whole-day by design**, with the owner-approved refusal «ลาล่วงหน้าเป็นการปิดทั้งวัน — ไม่ต้องเลือกคาบ …» (COPY-REVIEW-2026-09-29:370).
  - **Today's** leave already takes `sessionIds`, i.e. chosen classes. That path is unchanged.
- **Working days:** `teachers.work_days smallint[]` (`schema.ts:217`) via `teacherWorksOnDay` (`lib/work-days.ts`), checked in `assertTeacherBookable` (`:1054`) and the slot picker `getSlotAvailability` (`:2947`). No hours.
- **The admin leave body:** `adminTeacherLeaveBody` (`validation.ts:823`): `teacherId`, `reason`, `date` | `from`+`to`, `sessionIds`.

## 2. Data: one additive migration (the next free number at write time, after 0079; journal `when` unique)
```sql
ALTER TABLE teacher_leave_days ADD COLUMN IF NOT EXISTS start_time time;
ALTER TABLE teacher_leave_days ADD COLUMN IF NOT EXISTS end_time time;
ALTER TABLE teacher_leave_days DROP CONSTRAINT IF EXISTS teacher_leave_days_time_ck;
ALTER TABLE teacher_leave_days ADD CONSTRAINT teacher_leave_days_time_ck
  CHECK ((start_time IS NULL AND end_time IS NULL) OR (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time));
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS work_hours jsonb;  -- {"0":["13:00","18:00"], "6":["13:00","18:00"]}; NULL or a missing weekday = the whole day
```
- **Existing rows:** all NULL = whole day = exactly today's behaviour (AC4).
- **One leave per coach per day stays** (the unique index is unchanged) [SA-decided]. To change a part-day leave, lift it and record it again.
- **Witness:** the CHECK `teacher_leave_days_time_ck`, plus the `teachers.work_hours` column, per `migration-witness.ts`.

## 3. Rules [SA-decided unless marked]
1. **Overlap is by hour slot.** A class at `HH:MM` occupies `[HH:MM, HH:MM+1h)`.
   - A part-day leave `[start, end)` blocks a class when the two intervals overlap.
   - A whole-day leave (NULL times) blocks every class that day, as today.
2. **`teacherLeaveOn(exec, teacherId, date, startTime?)`** returns the row only when it blocks that slot.
   - **Every door passes the class's `startTime`.** Brew lists the 9 call sites with how each passes it, pinned by count.
   - **A caller with no time** (a day-level question, e.g. the leave banner) gets any row that day.
3. **The advance leave act:**
   - The class list for the day (`recordAdvanceLeave` → `bookings`, the panel, the counts) holds **only overlapping classes**.
   - Co-teaching (TASK-826) and the "left as is" path see only those.
   - A range with a time applies the same window to every day.
4. **Working hours:** in `assertTeacherBookable`, after the workday check, when `work_hours[weekday]` exists the class's `[start, start+1h)` must sit inside it. If not, refuse 400:
   «ครู {nickname} ทำงานวัน{weekday} เวลา {from}–{to} — กรุณาเลือกเวลาอื่นหรือครูอื่น».
   - **Exempt:** make-up appends (`reconcileCoursePlan`, the sick-leave append) and planned absences. A make-up mirrors a class that already exists and is never refused (§12).
   - **Setting hours that orphan future classes** warns, the same as today's `workDaysOrphan` (a list of classes outside the new hours). Nothing is moved.
   - **The slot picker** skips a coach outside their hours, as it skips an off day.
5. **AC1, several coaches:** FE only. One `POST /teacher-leave-days` per coach, sequentially, with the same body. The dialog shows a result per coach (saved / refused + the server's message). A refusal for one coach doesn't undo the others.

## 4. Contract changes (SB → SF)
- **`POST /teacher-leave-days`:** `adminTeacherLeaveBody` gains optional `startTime`, `endTime` (`HH:MM`).
  - Both or neither. `startTime < endTime`, on the hour or the half hour.
  - Not allowed with `sessionIds` (400 VALIDATION).
- **`GET /teacher-leave-days`:** `LeaveDayRow` gains `startTime: string | null`, `endTime: string | null`. `bookings` holds only the overlapping classes.
- **Teachers update:** the existing teacher update body gains `workHours?: Record<"0"…"6", [string, string]> | null`.
  - Each value `[from, to]`, `HH:MM`, `from < to`.
  - Keys must be in `workDays`.
- **The teacher DTO** gains `workHours`.
- **The LINE notice to the coach** (`teacher_leave_recorded`) adds the time to the date when there is one:
  «… วันที่ {d} เวลา {from}–{to}».
  - ⚠️ **New customer-facing copy**, so it needs the owner's approval through Porter (Q1). Until approved, the time is **left out** of the message (whole-day wording stays), and the panel still shows it.

## 5. Sizes
- **SB ≈ 2.25–2.5 d:** migration 0.25 · the reader + 9 doors + pins 0.75 · the act's class filter 0.5 · working hours (check, picker, orphan warning) 0.75 · tests.
- **SF ≈ 1.75–2 d:**
  - AC1 multi-coach 0.5;
  - the leave dialog time fields + the strip / panel time 0.5;
  - «วันทำงาน» from/to per ticked day + the orphan warning 0.75.
- **Total ≈ 4–4.5 d**, as in the REQ.

## 6. Order and dates [SA-decided, at the team's measured pace]
- **REQ-5015 first, F1 after.** REQ-5015 is ready, free and has no open customer questions. F1 still waits on the owner's price and ขวัญ's answers. Both touch Seam A/B, so they never run at once.
- **Team C load:** Brew then does TASK-963 (⏸ until the back office resumes); Flash then does TASK-964 (⏸).
- **Dates:**
  - REQ-5015 build from 2026-11-14 → on sid ≈ 2026-11-16 → Tanya ≈ 2026-11-17;
  - **uat with the next combined deploy** (see DEPLOY-NOTE-uat-2026-11-13-close-a-day: the shared trees ship together);
  - F1 starts after REQ-5015 is on sid, once it has its go: ≈ 1.5–2 weeks to sid + Tanya.

## 7. Questions (to Porter, each with a default)
1. **LINE copy:** the coach's leave notice adds «เวลา {from}–{to}» for a part-day leave. [default: yes; until the owner approves the words, it is sent without the time]
2. **One leave per coach per day** (no two separate part-day windows on the same day). [default: yes, which covers her "10–12" example]

## 8. Risks
- **R1:** a door that doesn't pass `startTime` would block the whole day. That is safe (it refuses more, never less), but the pin count catches it.
- **R2: the shared tree.** This adds to the next combined uat deploy; it doesn't change its gate.

## §4a: working-hours routes, corrected (Sector, 2026-11-13, after Flash read the code)
§4 said "the teacher update body", which was **wrong**: «วันทำงาน» uses its own routes (`SB routes/api.ts:525/528`). The contract is now:
- **`PATCH /teachers/:id/work-days`** body `{ workDays, workHours? }`.
  - `workHours` is `{"6":["13:00","18:00"], …}`, or `null` to clear.
  - Absent = unchanged.
  - Keys must be in `workDays`; `from < to`; `HH:MM` on :00 / :30.
- **`GET /teachers/:id/work-days/impact?workDays=…&workHours=<JSON>`**: same answer shape as today, `{ orphanCount, sessions, … }`.
  - `sessions` also lists classes **outside the new hours**.
  - `removedDays` is `[]` when only the hours changed.
- **`POST /teachers` (create)** also takes `workHours`.
- **The teacher DTO** returns `workHours` (`null` = whole days).
- **Calendar cells (SF `CalendarGrid` / `WeekGrid`):** a part-day leave greys only the overlapping hours; a whole-day leave greys the day as now. In scope (AC2), added to TASK-966's file list.
