# SPEC-085 — `REQ-095 §11` Camp ON the teacher schedule grid (a teacher per DAY, a time window, swappable, hard-blocking) — read + sizes (Sober, 2026-09-20). Supersedes SPEC-082 §4.3 "informational".

**The correction (Porter, from the source):** camp = a SCHEDULE that books teachers — "จองตารางครู ฟิกเหมือน Private แต่ 1 คลาสหลายคน", teachers swap day to day, the schedule sits in that week. The customer expects the camp on the teacher grid ("ลง camp ขึ้นตาราง กดตรงไหน"). Stage 3a's day banner + informational teachers is too weak.

## §0 What exists (the read)
1. **The camp holds teachers per WEEK, not per day, and no times:** `camp_weeks.teacher_ids uuid[]` (informational), `start_date/end_date`; the calendar payload carries `campWeeks` for a banner only. **No camp object names a teacher for a DATE or a time window** — that is net-new.
2. **The grid renders booking rows only** — a teacher column × hour rows; "held" = a live `bookings` row (the one predicate `slotHolderWhere`, TASK-397, mirrored by the DB index). Nothing else can occupy a cell.
3. **The ECA precedent is exactly the wanted shape:** an `OTHER` row (kind, title, several teachers, no student, no money) blocks a teacher's hour and shows on the grid; the series creator makes N of them in one tx; the group swap moves a row's teacher with the slot check. **A camp day = an ECA block per hour per assigned teacher, tied to the camp day.**

## §1 The design (one migration)
- **`camp_week_days`** (`0047`): `{ camp_week_id FK, date, teacher_ids uuid[] NOT NULL, start_time, end_time, UNIQUE (camp_week_id, date) }` — created for every date when a week is opened (defaults: the week's teachers, the window ⚠ §3.2), editable per day (`PATCH /camp/weeks/:id/days/:date { teacherIds, startTime, endTime }` = the per-day swap).
- **The block = real rows, not an overlay (⚠ §3.1):** for each camp day × assigned teacher × hour in the window, ONE `OTHER` row with `other_kind = 'CAMP'` (a 4th kind), `other_title` = the week's name, `camp_week_id` (new nullable column on `bookings`, indexed) — created through `insertBooking` in the SAME tx as the day row (the series shape: first clash ⇒ `409 SLOT_TAKEN` naming the date/hour/teacher, nothing written); a per-day teacher swap = delete that teacher's camp rows for the date + insert the new teacher's (slot-checked); shrinking the window deletes rows; closing a week or a date with no teacher deletes its rows. **So the DB index, every availability read, the reminder's coach block and the day-end all see the camp by construction** — no second definition of "held".
- **The grid:** the rows render as ECA cells do today, kind tag `CAMP`, the title; the FE merges contiguous camp cells of one teacher into one visual block (the cell data is per hour; the merge is rendering only) with a `Swap teacher` door (booking-edit) that calls the per-day PATCH; the day banner stays as the kids' roster link. The coach's 08:15 reminder already prints an OTHER-kind block per hour — ⚠ §3.4: collapse to one `Camp : name 10:00-15:00` line per day (S).
- **Kids vs teachers stay separate objects:** the children are `camp_days` (packages, units, the cut); the teachers are the blocks. Nothing changes in the sale, redeem, mark, cut, QR or the kids' reminder.

## §2 Sizes
| stage | what | size |
|---|---|---|
| **A — the block** | `0047` (`camp_week_days` + `bookings.camp_week_id`), the row lifecycle on open/edit/close, `CAMP` kind, the per-day PATCH + swap, `409` naming the clash, the grid render (merge + tag + swap door), the week editor's per-day table | **BE M · FE M** |
| **B — polish** | the coach reminder collapsed to one camp line per day; the kids' roster link from the block | **BE S · FE XS** |
1 migration (`0047` ⇒ 48), no new key (rides `camp.week-open` for the day edits; the swap door under `booking-edit`).

## §3 Decisions for the OWNER
1. **Hard block vs overlay:** hard block via real rows (recommend — "ฟิกเหมือน Private"; a camp teacher cannot be double-booked by mistake; an overlay would need a second "held" rule the DB cannot enforce). An existing hourly booking inside the window ⇒ the assignment is refused naming it (move it first) — or should the camp WIN and cancel the lesson? *Recommend: refuse.*
2. **The time window:** default 10:00–15:00 per week, editable per day? Do half-day camps split it (AM 10:00–12:00 · PM 13:00–15:00)? *Recommend: one window per day; the kids' AM/PM is the package's, not the teachers'.*
3. **Default teacher(s) per day:** the week's list on open, edited per day (recommend); a day with NO teacher assigned ⇒ no block (the kids still attend? — say).
4. **The coach reminder:** one camp line per day (recommend) vs an hour-by-hour list.
5. **Camp block money:** none (an OTHER row; the teacher rate lives on the camp week if wanted — say if the rate field from Stage 1 should carry over per day).

## §4 Non-goals
No change to the kids' side (packages, units, cut, QR); no camp-specific status; no per-hour attendance of teachers.
