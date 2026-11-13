# SPEC-105: Close a whole day, option B (REQ-5013)
**Sector (SA, Team C), 2026-11-13.**
- **For:** REQ-5013 (READY_FOR_SA, Porter 2026-11-12). The owner's go is quoted in the REQ: *"พักงาน คือพัก แค่ หลังบ้านนะ"*.
- **Read against:** SB `dong` @ `bfe5ef6` and SF `dong` @ `86316ee`, both on 2026-11-13. Sizing is in CHECK-2026-11-10-F4 § B.
- **TASKs:** TASK-959 (BE, Brew, SB) → TASK-960 (FE, Flash, SF). FE builds against the contract in §3 from the start; it needs the BE only for the real run.

## 1. Approach: a closed day is the whole school's "advance leave"
A coach's advance leave already does exactly what B asks, for one coach:
- it refuses new work on the day;
- the make-up search skips the day;
- the calendar shows a strip with that day's classes and an "Open" for each.

A closed day is the same thing for **every** coach, so we reuse each of those seams instead of inventing new ones:

| Need (REQ-5013 AC) | Seam that already exists | Where |
|---|---|---|
| Refuse a class landing on the date (AC2: create, move, plan editor) | `assertTeacherBookable`: every `insertBooking` caller and every move / swap / co-teacher / plan-move door already passes here ("Seam A") | `scheduler.service.ts:1042` |
| The make-up search skips the date (AC2) | `findFreeExtensionDate` → `firstFreeWeeklySlot` isOccupied (leave already reads as "not free", "Seam B") | `scheduler.service.ts:3140`, `extension-slot.ts:9` |
| The group-series extender (AC2) | `planGroupSeriesExtension` / `runGroupSeriesExtenderJob` (inserts through `insertBooking`) | `jobs.service.ts:734` |
| The list (AC3) | a new attention check; the panel and the 08:00 digest read the same array | `attention.ts` `CHECKS`, `attention.service.ts:298` |
| The daily reminder (AC4) | the existing digest; one more check, nothing new to schedule | `runDailyDigestJob` |
| The calendar badge (AC5) | `LeaveDayBanner` / `LeaveChip` / `LeaveDayPanel` (day + week views) | SF `Calendar/` |

## 2. Data: one additive migration
```sql
CREATE TABLE closed_days (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date         date NOT NULL,
  reason       text NOT NULL CHECK (reason IN ('HOLIDAY','VENUE_CLOSED','WEATHER','OTHER')),
  note         text,                                   -- required (non-empty) when reason = 'OTHER', checked in the service
  range_id     uuid,                                   -- the rows saved together share it; null for a single day
  created_by   text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  reopened_at  timestamptz,
  reopened_by  text
);
CREATE UNIQUE INDEX closed_days_open_date_uq ON closed_days (date) WHERE reopened_at IS NULL;
```
- **Existing data:** none touched. A new empty table.
- **Re-opening is soft:** it sets `reopened_at` / `reopened_by` and keeps the row, so AC7 (who closed, who reopened, when, why) is the table itself.
- **Scope:** the whole school (REQ-5013 Out of Scope: no per-branch).
- ⚠️ **Migration number clash risk:** Team B's TASK-942 (park fee) also adds a migration ("0077 slot-index rebuild"), starting 14 Nov. Whichever lands second renumbers before commit, and journal `when` stays unique across the team (SYSTEM-FACTS l.4395). Porter, please tell Silver.
- **Who applies it:** I apply it on sid through the repo's migrate, as for 0074–0076. uat is the owner's deploy.

## 3. The contract (SB → SF)
All routes sit on the existing staff API (the `/api` router, same `accessGuard` as `/teacher-leave-days`). Admin and CEO can use them. A linked teacher is refused, because the routes are not in `TEACHER_ALLOWED`.

**`GET /closed-days?from=YYYY-MM-DD&to=YYYY-MM-DD`** (`to − from` ≤ 62 days)
→ `200 { items: ClosedDayRow[] }`. Only open rows (`reopened_at IS NULL`), ordered by date.
```ts
interface ClosedDayRow {
  date: IsoDate;
  reason: "HOLIDAY" | "VENUE_CLOSED" | "WEATHER" | "OTHER";
  note: string | null;
  rangeId: string | null;
  createdBy: string;
  createdAt: string;            // ISO timestamp
  bookings: LeaveDayClass[];    // the SAME shape as LeaveDayRow.bookings: the live classes still on that date
}
```
- "Live" means the slot-active statuses, read through `SLOT_INACTIVE_STATUSES`, the same rule as the make-up search.
- A planned-absence row (`SICK_LEAVE` + `plannedAtCreation`) is not a class, so it is not listed.

**`POST /closed-days`**, body `{ from: IsoDate, to?: IsoDate, reason, note? }`
- `to` defaults to `from`. `from ≤ to`, and a range is at most 31 days.
- Refusals, each `400` with `{ error: { code, message } }`:

| Code | When |
|---|---|
| `PAST_DATE` | any day < today (Bangkok). **Today is allowed** (AC1), unlike leave's future-only rule. |
| `NOTE_REQUIRED` | reason is OTHER and the note is empty |
| `RANGE_TOO_LONG` | the range is longer than 31 days |

- Writes one row per day in one transaction, with a shared `range_id` when there is more than one day.
- **A day already closed is skipped, not an error.**
- → `201 { created: IsoDate[], alreadyClosed: IsoDate[], classesOnThem: number }`. `classesOnThem` = the live classes now sitting on the created days, so the FE can say "N classes are on these days; they are in Attention".

**`DELETE /closed-days/:date`** (re-open, AC6)
- Sets `reopened_at` / `reopened_by` on the open row.
- `404 NOT_CLOSED` if the day has no open row. `400 PAST_DATE` if date < today, mirroring the leave lift: a day that has begun stays as it was.
- → `200 { date, reopened: true }`.
- **It restores nothing and messages no one.**

**The refusal on every placing door:** `409 { error: { code: "DAY_CLOSED", message } }`.
- `message` = `วันที่ {d MMM} ปิดทำการ ({reason TH}) — กรุณาเลือกวันอื่น`.
- Reason TH: HOLIDAY วันหยุด · VENUE_CLOSED สถานที่ปิด · WEATHER สภาพอากาศ · OTHER = the note.
- Follow the existing helper style next to `TEACHER_ON_LEAVE` in `scheduler.service.ts`.

**Attention item (AC3)**
- key `classes_on_closed_days`, i18n `att_classes_on_closed_days`: TH «คลาสในวันปิดทำการ», EN «Classes on a closed day».
- Each item: `{ id: bookingId, label: "<date> <HH:MM> · <child nickname | group/other name> · <coach>", link: { kind: "day", date } }`.
- **`namesPeopleInDigest` stays OFF**: the LINE digest carries the count only (the REQ-020 privacy list).

## 4. Rules [SA-decided, each cheap to reverse]
1. **The block lives in `assertTeacherBookable`, at the top, before the `isSystem` early return**, so an OTHER booking on "No Teacher" is refused too.
   - The check: `date >= today` and an open closed row → `DAY_CLOSED`. A back-dated write passes, as with leave.
   - **Exempt** (a new opt `allowClosedDay`, passed only by `insertBooking`):
     - (a) a planned-absence row (`SICK_LEAVE` + `plannedAtCreation`), since it is not a class;
     - (b) the rows the camp sync writes, since ECA/Camp is out of scope and a closed day must not break the camp sync. Brew finds the camp marker (TASK-418's path).
2. **Course create with a week on a closed day:** the whole create is refused with `DAY_CLOSED` naming the date. The admin then ticks that week as a planned absence (the existing REQ-123 §4 tick), which is exempt.
   - So a Songkran closure never blocks a 10-week sale; it costs one tick.
   - `Interpreted REQ-5013 AC2 "creating a course" as: refuse, with the existing skip-a-week tick as the way through`.
3. **Make-up search:** `findFreeExtensionDate`'s isOccupied also returns true on an open closed date, so the search moves to the next week (never refuses; the §12 rule for make-ups). Preview = act, because both read the same function.
   - The slot picker's availability (`slot-holder.ts`) marks the date unavailable only if that is a one-line read in the same file. Otherwise the 409 is the guard and Brew notes it.
4. **Group-series extender:** `planGroupSeriesExtension` skips open closed dates and counts them in a new report field `closedDaySkipped`, so the series keeps a gap on that day. `insertBooking`'s refusal stays as the backstop (it shows as a clash, never a crash).
5. **Status changes are not placements.** Attended, cancel, leave and confirm on a class already on the closed day stay allowed, because the admin clears the day with them (AC3).
6. **Nothing new to parents or coaches** (AC3). Closing or re-opening a day sends no LINE.

## 5. FE (TASK-960) in one paragraph
- **Calendar header, admin/CEO:** a «ปิดวันทำการ» button opens a dialog with these fields, one per row: From date · To date (optional) · Reason (select) · Note (required for อื่นๆ). Save calls `POST /closed-days`, then a toast «ปิด N วันแล้ว · มี M คลาสค้างอยู่ — ดูได้ที่ Attention». Past dates are disabled in the picker.
- **`ClosedDayBanner`**, built on the `LeaveDayBanner` pattern and mounted in day + week views:
  - a red-amber strip «วันปิดทำการ · <reason>» on each closed date;
  - its chip opens `ClosedDayPanel`: the date, the reason, who closed it and when, the classes still on it (who · what · when · status) each with «เปิด» (the booking modal, like `LeaveDayPanel`), and «เปิดวันทำการอีกครั้ง».
  - The re-open confirm says plainly: «ยกเลิกการปิดเท่านั้น — คลาสที่ยกเลิก/ย้ายไปแล้วจะไม่กลับมา และไม่มีข้อความถึงผู้ปกครอง».
- **Attention:** the new card renders by itself. A `link.kind === "day"` item goes to the calendar on that date (`/scheduler/calendar?date=…`); the calendar reads `?date` once on load, the same "one place builds, one place reads" rule as `attention-link.ts`.
- **A `DAY_CLOSED` 409** shows the server's message in the existing error toast.

## 6. Risks and unknowns
- **R1, the doors:** a placing path that does not go through `assertTeacherBookable` would skip the block. Brew greps every `bookings` insert / date update and lists them with how each is covered (a pin test per door).
- **R2:** the 0077 number clash with TASK-942 (§2).
- **R3, rule 2 sale UX:** if ขวัญ finds "refuse, then tick the week" clumsy, the cheaper alternative is to auto-tick closed weeks at create, ≈ +0.5 d. That is not built now. Tanya's run will show it.
- **Unknown:** whether teachers should see the badge on their own LIFF/calendar. They don't today; REQ-5013 says the admin. Not built.
