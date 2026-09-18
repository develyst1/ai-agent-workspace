# TASK-366 — `Last` on the admin schedule: the calendar row KNOWS it is a course's last session (`REQ-089 item 5`) — BE, contract first

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-16)
**Source:** `REQ-089 §0 item 5` *"กล่อง notice เตือนคลาสสุดท้าย"* + owner `§2`: **a `Last` badge ON THE SCHEDULE, on the session that is a course's last one — big, obvious. Admin-facing; no LINE message.**
**Size S.** ⛔ Chain stopped. Next `sid` round (items 4/5/7). **Contract to @Fern through me first** (she builds TASK-367 in parallel).

---

## §1 The prior fact
`deriveLiveEndDate(sessions)` (`course-plan.ts:48`) already answers "when does this course's plan end" — the LAST LIVE `COURSE_PACKAGE` row by date, over the same rows the plan reads (`:1870`, `:2409`). **The calendar query (`:485`) returns bookings in a date range with no course context** — a row does not know whether it is its course's last.

## §2 The contract (proposed; confirm/correct in `inbox/SA.md` before building)
- **Every booking DTO the calendar returns carries `courseLast: boolean`** — `true` iff the row is a `COURSE_PACKAGE` booking AND its date equals `deriveLiveEndDate` of its course's rows (the SAME function; no second "last" rule). `false` for everything else (single sessions, vouchers, extras, a `SICK_LEAVE` row even if it is dated last — it is not a lesson).
- ❓ **Cost:** the calendar range may hold N courses; deriving per course means loading each course's rows. Say how you do it in ONE query or one grouped read — not N+1 — and what it costs on a month view. If a stored column is the honest answer, say so: **it is a derived fact, so I expect NO column and NO migration (35 = 35)**; convince me otherwise before adding one.
- 🚫 Not this task: any message, any change to `deriveLiveEndDate`, the parent-facing daily reminder.

## Definition of Done
- [ ] Contract confirmed first
- [ ] Suite, **count** · tsc · **35 = 35**
- [ ] Pinned: a size-4 course with one absence ⇒ the make-up (week 5) is `courseLast`, week 4 is not · a course with a cancelled last row ⇒ the previous live row is last · a single-session booking ⇒ `false` · a `SICK_LEAVE` last by date ⇒ `false`, the live row before it `true`
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ When the last session is DELIVERED (attended), the course is over and the badge's job is done — does the admin want the badge to stay on the past cell, or is the badge only for what is ahead? Say what the calendar shows for past cells today; build nothing.

---

## §3 📋 CONTRACT — verified against the tree, CONFIRMED with two facts and one correction (@Jason, 2026-09-16, before building)

**Confirmed:** every booking DTO `GET /calendar` returns carries **`courseLast: boolean`** — `true` iff the row is a `COURSE_PACKAGE` booking, is LIVE (`PENDING` / `CONFIRMED` / `EXTENDED` — `COURSE_LIVE_STATUSES`, the plan's own list), and its date equals **`deriveLiveEndDate`** of its course's rows — the same function, called as-is. `false` for a single session, a voucher, a 1HR, an อื่นๆ, and for a `SICK_LEAVE` row dated last (it is not live, so the function never names it). 🚫 No column, **no migration (35 = 35)**; `deriveLiveEndDate` untouched; no message.

🔑 **Cost — ONE grouped read, the `hasRental` shape exactly.** The calendar already does this for rentals (TASK-190: *"one query for the whole week, resolved before the loop"*). After the range query: collect the distinct `courseId`s of the rows; ONE query `select course_id, date, status from bookings where course_id in (…) and status in COURSE_LIVE_STATUSES`; group in memory; **`deriveLiveEndDate` per group** ⇒ `Map<courseId, lastDate>`; each DTO answers by lookup. The SQL pre-filter is the same named constant the function filters by — a pre-filter, not a second rule; the function still decides. **Numbers:** the calendar has `day` and `week` only (`calendarQuery` — there is no month view); a week is ~90 rows ⇒ ~40 distinct courses ⇒ ~40 × ≤ 15 live rows ≈ 600 three-column rows in ONE round trip, on the indexed `course_id`. Not N+1; two queries become three.

🔻 **Correction — where the field is honest.** `toBookingDTO` is shared by seven readers; `courseLast` is COMPUTED on `GET /calendar` (the badge's only home) and on the single-booking read (`loadBookingDTO` — one course, one row, and it is what a cell's modal opens on), and is **`false` on the paginated `GET /bookings` list and on the create/pause/resume returns** — the same "default `false`" `hasRental` already carries there, and for the same reason: no screen renders a badge from those. One FE shape (`boolean`), and the sentence above says where it means something. **@Fern reads it only on the calendar.**

📌 **A fact for the owner's question, from the function itself:** `deriveLiveEndDate` reads LIVE rows only. When the last session is ATTENDED the course has no live row ⇒ the function answers `null` ⇒ **no row is `courseLast` — the badge leaves the past cell at attendance, by construction, not by a decision.** Today a past cell shows the booking with its status (`ATTENDED` / `NO_SHOW` / `SICK_LEAVE`); `CANCELLED` and `PAUSED` are hidden (`CALENDAR_HIDDEN_STATUSES`). So "ahead only" is what ships unless he asks for the badge to STAY — which would be a second rule (delivered-last), and I build nothing for it.

▶️ Building now against the above.

---

# 📤 REPORT — @Jason → @Sober (2026-09-16)

✅ **DONE (code), against §3 as confirmed.** **2184 pass / 0 fail**, **177 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (35 = 35)**. `deriveLiveEndDate` untouched.

## §4 What was built
- `course-plan.ts`: **`liveEndDateByCourse(rows)`** — groups rows by `courseId` and calls **`deriveLiveEndDate` per group** (no reduce, no max, no sort of its own — pinned). **`isCourseLast(row, lastByCourse)`** — `COURSE_PACKAGE` ∧ `courseId` ∧ `COURSE_LIVE.has(status)` ∧ `date === last`. Both pure.
- `scheduler.service.ts`: **`liveEndDatesForCourses(courseIds, exec)`** — ONE select of three columns, `course_id in (…) and status in COURSE_LIVE_STATUSES` (the function's own constant as a pre-filter), then the pure grouping. **`getCalendar`** resolves it once, before the loop, from the range's own `courseId`s — the `hasRental` line's twin; the loop has no `await` (pinned). **`loadBookingDTO`** (the single read the cell's modal opens on) uses the same helper for its one course.
- `mappers.ts`: **`courseLast: opts.courseLast ?? false`** beside `hasRental`, with the sentence saying where it is computed and where it is `false`.

## §5 Pinned (`lib/course-last-badge-req089.test.ts`, 12 tests)
- **DoD with rows:** size-4 + one absence ⇒ week 5 (the make-up) `true`, week 4 `false` — and the Map's answer **equals `deriveLiveEndDate` of the same rows** · a CANCELLED last ⇒ the previous live row · a single session / voucher / อื่นๆ dated on a course's end ⇒ `false` · a `SICK_LEAVE` dated last ⇒ `false`, the live row before it `true`.
- 🔑 **The owner's-question fact, as a test:** four ATTENDED rows ⇒ the Map holds `null` ⇒ no row is last; the same course with week 4 still `CONFIRMED` ⇒ week 4 is last. **The badge leaves the past cell at attendance, by construction.**
- Many courses in one range, each answers for itself; a course never read answers `false` · the live set is exactly `COURSE_LIVE_STATUSES` (PENDING/CONFIRMED/EXTENDED `true`; ATTENDED/NO_SHOW/SICK_LEAVE/CANCELLED/PAUSED `false`).
- **DTO:** passed in ⇒ carried, absent ⇒ `false`. **Source:** the one select with its three columns and the named list; the calendar's read is before the loop and the loop has no `await`; the single read uses the same helper; `deriveLiveEndDate`'s three lines byte-for-byte; `schema.ts` has no `course_last`.

## §6 🔑 Mutation — five, `finally`, checksum — all bite
A the live check dropped (a `SICK_LEAVE` dated last becomes last — 1 fail) · B a second "last" rule (max over ALL rows — a CANCELLED last wins — 4 fail) · C the type check dropped (a single session on a course's end — 1) · D the grouped read moved INTO the loop, N+1 (1) · E the DTO defaults to `true` (1). Every restore byte-identical.

## §7 ❓ The owner's-list question — answered by the function; nothing built
Today a past cell shows the booking with its status (`ATTENDED` / `NO_SHOW` / `SICK_LEAVE`; `CANCELLED` and `PAUSED` hidden). With this task, **the badge is on the last session while it is ahead and gone the moment it is attended** — `deriveLiveEndDate` reads live rows only, so a delivered last is no longer anyone's end. "Ahead only" ships. If the owner wants the badge to STAY on the delivered cell, that is a second rule (a delivered-last), one more clause in `isCourseLast` — say so and I build it; I built nothing for it.
