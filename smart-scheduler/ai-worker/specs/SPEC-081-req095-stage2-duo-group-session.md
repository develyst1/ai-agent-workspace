# SPEC-081 — `REQ-095` Stage 2: DUO / Group — the GROUP SESSION object (Sober, 2026-09-18)

**Owner rulings (REQ-095 §5, via Porter 09-18):** each child keeps their OWN course (e.g. 10 Hr each) grouped into ONE shared recurring slot; each child's attendance deducts THEIR own course; a per-SESSION (รายครั้ง) variant exists; the teacher is mostly fixed but swappable; per-teacher editable rate **stored only** (`ratePostedAt` null), never posted. Money-in-backoffice lock stands.

## §0 The obstacle and the shape that respects it
`bookings_teacher_slot_uq (teacher_id, date, start_time) WHERE status NOT IN (SLOT_INACTIVE)` = **one live booking per teacher slot**, mirrored by every availability check (`SLOT_INACTIVE_STATUSES` is the one definition, TASK-239). Two children's course sessions cannot both hold one slot today. **The group row holds the slot; the children's sessions are SEATS that hold no slot of their own.**

## §1 The model (one migration, `0041_group_session`)
1. **The group row = a `bookings` row, `booking_type = 'GROUP'`** (enum label — the `0029` OTHER precedent: `ADD VALUE` in its own statement, preflight splits). `student_id` null (nullable since `0029`), `other_title` = the group's name, `head_count` = **seat cap** (DUO = 2), the primary teacher + `booking_teachers` extras, **rates on the Stage 1 columns** (`teacher_rate_minor` / `booking_teachers.rate_minor`, `rate_posted_at` never written). One row PER DATE (the Stage 1 series shape) — a recurring group = N rows sharing a `group_key uuid` (new column, the series' identity: swap-teacher-from-here-on and "extend the group" act on it). Status flow as OTHER (PENDING → CONFIRMED → ATTENDED by the day-end, no money, no quota).
2. **A seat = an ordinary child's booking row** (`COURSE_PACKAGE` with `course_id`, or `SINGLE_SESSION` for the per-session variant) with **`group_id uuid → bookings.id`** (the group row of that date), same teacher/date/start as its group. Everything a child's session already has keeps working by construction: check-in, the deduction (site 1 + the day-end site 2), the parent's LINE, history, leave/make-up, expiry. 
3. **The index predicate gains `AND group_id IS NULL`** — seats are invisible to the uniqueness rule; the group row is the one live booking. `DROP INDEX` + `CREATE UNIQUE INDEX` = the `0033` shape: **ACCESS EXCLUSIVE on `bookings` for the rebuild — closed shop, the quiet moment, never near 17:30 or an import.** Witness = the predicate change (the `0022`/`0033` witness shape in `migration-witness.ts`), plus `group_key` as the existence witness. The application mirror: `holdsSlot(status) && groupId == null` — ONE predicate in `booking-slot.ts`, and every availability read (`slot-clash`, `findFreeExtensionDate`, make-up placement, extension) filters `group_id IS NULL` **from that one definition**, not by hand.
4. **Seat cap** is enforced in the seat writers (count live seats of the group row `< head_count` in the same tx, `409 GROUP_FULL`), not by the DB.

## §2 The flows
- **Create a group** (`POST /bookings/group-series`): name, kind `DUO`|`GROUP`, seat cap, teacher(s) + rates, `startTime`, `dates[]` (the Stage 1 series body + cap) ⇒ N GROUP rows under one `group_key`, all-or-nothing, `409 SLOT_TAKEN` naming the date. Key `action:calendar.group-series` (50th).
- **Sell a course INTO a group** (`POST /courses` gains optional `groupKey`): the course's weekday/time/teacher are the group's (not chosen); each planned session inserts as a seat on the group row of that date — **a date with no group row ⇒ the group is extended by one row on that date** (same teacher/rates/cap; blocks the slot as usual, `409` if taken); cap checked per date. The sale, quota, expiry, reminders: unchanged.
- **Per-session seat** (`POST /bookings` with `groupId` on a `SINGLE_SESSION`): one seat, money as today's single session.
- **Swap the teacher** (`PATCH /bookings/:id/group-teacher { teacherId, fromHereOn: bool }`): the group row(s) move teacher (slot check per date, `409` naming the date), **every seat of those dates moves with it in the same tx**, the teacher-change notice per seat's family as `moveBooking` sends today, the coach notice once per date. Rates editable via the Stage 1 `PATCH /bookings/:id/other` (works on GROUP rows too — rename the guard's message to "OTHER or GROUP").
- **Cancel a group date** (the ordinary cancel on the GROUP row): every live seat goes the **teacher-cancel** path each child already has (make-up appended per child by `reconcileCoursePlan`; single-session seat ⇒ its ordinary cancel). ⚠ owner §4.2.
- **A seat's own leave / make-up**: the child's ordinary leave; the make-up is appended as **the child's SOLO session** (ordinary placement, the teacher's free slot) — the group is untouched. ⚠ owner §4.1.
- **Reads:** the group row's DTO carries `group: { key, kind, name, seatCap, seats: [{ bookingId, studentId, studentName, status, courseId|null }], teacherRates }`; **seat rows are hidden from the calendar grid** (`CALENDAR_HIDDEN` gains nothing — the loader filters `group_id IS NOT NULL` for the GRID only) and stay in every student/parent/history read. The coach reminder prints the group as one block: the name, `Seats : n/cap`, then the children's lines under it (the Stage 1 `Heads :` shape extended). Check-in QR: per seat (as today); the group row has no token.

## §3 Stages inside Stage 2
- **2a (BE L · FE L):** the migration, GROUP rows + series, seats via `POST /courses { groupKey }`, cap, swap teacher, cancel-date cascade, DTO + grid + reminder, the 50th key. FE: a `Create group` door on the OTHER form (kind DUO/Group, cap), the group cell showing N names, a "sell a course into this group" door on the group's details, swap-teacher dialog, roster in the details.
- **2b (BE S · FE S):** the per-session seat (`SINGLE_SESSION` + `groupId`), after 2a is on `sid`.

## §4 Decisions that need the OWNER (flagged to @Porter)
1. **A seat's make-up:** a SOLO session for that child (recommend — no rule change, the group stays whole) — or into the group's next free seat/date (needs a "the group runs past the course" rule)?
2. **Cancelling a group date:** every child gets a make-up (teacher-cancel semantics, recommend) — or the date is simply lost for all?
3. **A child whose course ends while the group continues:** the seat is just absent from then on (recommend); the group keeps blocking the slot.
4. **Per-session seat price:** today's single-session price list, or a group price? (2b waits on this.)
5. **Rates per date** (Stage 1 shape) — carried forward on creation, editable per date; confirm this is what "editable rate" means, not one rate for the whole series.

## §5 Non-goals
No change to what a child's course IS (size, quota, expiry); no group-level money; no posting of rates; no change to the one-live-booking invariant (seats are outside it by the predicate, the group row is inside it); Camp untouched.
