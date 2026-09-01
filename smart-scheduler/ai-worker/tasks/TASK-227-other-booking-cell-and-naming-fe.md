# TASK-227: FE — the อื่นๆ cell, and one name for every booking (`displayName`)

- Source: SPEC-070 (REQ-078 · AC-2 / AC-10 / AC-15)
- Status: ✅ DONE — code (Sober 2026-09-01) · 🔴 1600/1280/768/375 measurement = @Tanya (routed)
- Depends on: **TASK-224** (the DTO). Independent of TASK-225/226 — it can land first.
- Repo: **smart-scheduler-front**, on `develop`. Assignee: **@Fern**
- ⚠️ **Shared repo.** The calendar cell is exactly the shared ground the board warns about (REQ-052/068 landed
  there) — `git show develop:<path>` before editing, re-apply only what is missing.

## What to do

### 0. 🔴 DO THIS FIRST — `dtoToBooking` will THROW on an อื่นๆ booking today

`src/lib/api/mappers.ts:13` reads `dto.student.name` and `:18` reads `dto.subject.name`, **both unguarded.**
TASK-224 is live on `sid`, and its DTO now sends `student: null` / `subject: null` for an `OTHER` booking.

**This is not one broken cell — `dtoToBooking` is the calendar's mapper, so the first อื่นๆ booking that reaches
it takes the whole calendar down with a `TypeError`.** Nothing creates one yet (no FE form, and the API is
staff-only), which is the only reason `sid` is safe right now — see the 2026-09-01 log. **Your first commit in
this task closes that window:**

```ts
studentName: dto.student?.name ?? dto.displayName,
nickname:    dto.student?.nickname ?? null,
subject:     dto.subject?.name ?? null,
displayName: dto.displayName,       // ← add to the app-level `Booking` type too
teachers:    dto.teachers,
```
⚠️ `dtoToBooking` is an **allow-list** — the comment at `:27` says so, and TASK-170 was the defect of forgetting
it. A field on the DTO reaches the UI **only** if it is mapped here; the compiler will not tell you.
📌 `subject` becoming `string | null` is what TypeScript uses to point you at the cells that assume a program —
that is the feature, not an obstacle. Fix each one deliberately.

### 1. Render `displayName`, everywhere a booking is named
The BE now sends `displayName` on **every** booking (`title ?? nickname ?? name` — TASK-224), plus
`student: StudentRef | null` and `title: string | null`.

There are **31 booking-surface readers** of `.studentName` / `.nickname` in `src/`. **Enumerate them from the code**
and switch the ones that answer *"what is this booking called?"* to `displayName`. Leave alone the ones that
genuinely mean *the student* (a link to the child's record, the people pages, course/voucher lists — those objects
are not bookings and their student is still non-null).

🔴 **Do not write a fallback at the call sites.** `displayName` exists so the *"never blank, never the word
อื่นๆ"* rule (AC-10) is one property of one BE function instead of 31 promises. A local
`booking.studentName || "อื่นๆ"` is the exact thing this design removes.
⚠️ `student` is now nullable — TypeScript will point at the callers that dereference it. That is the feature; fix
each one deliberately rather than with `?.` everywhere.

### 2. The cell (AC-15)
- `BOOKING_TYPE_ICON` + `BOOKING_TYPE_VAR` (`components/common/BookingCellBody.tsx:10,18`) gain an `OTHER` entry —
  the `Record<BookingType, …>` types make this compulsory, which is the point.
- **อื่นๆ must be visually distinguishable at a glance from the four paid types** — its own colour token and icon,
  in the same token family, not a re-use of an existing one.
- `CalendarLegendBar.tsx` picks the maps up automatically — **check it renders**, don't assume.
- 🔴 **AC-15 regression:** the cell must still show **program + booking type** exactly as REQ-052/068 defined for
  the four existing types. For อื่นๆ there is **no program** (`subject: null`) — the program slot shows the title,
  and there must be **no empty label and no dangling separator**. An empty label reads as information that went
  missing (TASK-219's lesson).

### 3. 🆕 AC-18 — one booking, several teachers, several columns

An อื่นๆ booking may carry **more than one teacher** (owner 2026-08-31). The BE sends `teachers: TeacherBase[]` on
**every** booking (length 1 for the other four types — TASK-224), so the FE has **one shape**, not two.

- Place the booking **once in each assigned teacher's column**. The grid already keys cells
  `date|teacher.id|startTime`; iterate `booking.teachers` instead of the single `teacher`.
- 🔴 **It must read as ONE booking, not three.** Same id, same title, same status everywhere; a marker on the cell
  saying it is shared (e.g. the teacher count / their nicknames) so staff are not left counting three meetings.
- **Cancel/attend acts on the booking, not the cell.** There is one row and `ON DELETE CASCADE` on the join table,
  so a cancel already removes it from every column — **verify it does**, and make sure no code path assumes the
  cell it was clicked in owns the booking.
- **AC-20 regression:** the four existing types have exactly one teacher and must render **exactly as before** —
  one cell, one column, byte-identical against `develop`.

### 4. 🔴 The cancel-reason pair — TASK-224 landed the BE half and it is INCOMPLETE without this line

`BookingModal.tsx` — add **`OTHER`** to `canCancelWithReason`, beside `SINGLE_SESSION | VOUCHER | FIRST_TRIAL`.

**Why this is not optional and not cosmetic:** TASK-224 added `OTHER` to the BE's `REASON_ENUM_REQUIRED`
(`scheduler.service.ts`), which is coupled **in code** to this FE list — the ⛔ comment you and Jason put at both
sites during TASK-220. **Right now the dialog would cancel an อื่นๆ booking without asking for a reason, and the
API would refuse it with `REASON_REQUIRED`**: a button that silently does nothing, which is precisely the defect
the owner failed REQ-019 acceptance on.

⛔ **Carry the coupling comment**, exactly as TASK-220 did — this list and `REASON_ENUM_REQUIRED` are one rule in
two files, and the comment is what stops the next person splitting them. (Jason stopped at the FE boundary and
flagged it rather than reaching across; that is why it is here and not in his task.)

### 5. Where else a booking shows its name
Bookings table, the plan/course modals, search results, the booking modal header. Same rule: `displayName`.

## Definition of Done — the OUTCOME
- [ ] A titled อื่นๆ booking shows **its title** in the calendar cell, the bookings table and the booking modal —
      **never blank, never "อื่นๆ", never a student's name it does not have.**
- [ ] An อื่นๆ cell is distinguishable from the four paid types at a glance (colour + icon), and appears in the legend.
- [ ] **AC-18** — an อื่นๆ booking on 3 teachers appears in **all three** columns, is recognisable as **one**
      booking, and **one cancel removes it from all three** (check all three columns after cancelling from one).
- [ ] **AC-15 regression:** for the four existing types the cell is **unchanged** — program and type still shown as
      REQ-052/068 defined. Compare against `develop` before/after.
- [ ] No call site invents its own name fallback (`grep` the diff for `|| "` around student names).
- [ ] 📏 **Standing rule — measure the cell row at 1600 / 1280 / 768 / 375 and report the numbers.** A long typed
      title ("ปิดปรับปรุงลานสเก็ตช่วงบ่าย") in a 375-wide cell is the case that breaks; say how it truncates.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun run build` ok · suite green (report the count).

## Implementation Notes (Fern, 2026-09-01)

**Repo:** `smart-scheduler-front` — absolute path on this machine `H:\scheduler\smart-scheduler-front`
(`machine.local.md`). `git rev-parse HEAD` = **`b8b6fde518b4913fdf6ed506a112907f5d2ffcd1`**.

**Branch — the task says `develop`, and on this machine `dong` IS `develop`:** `git rev-list --left-right
--count dong...develop` = **`0 0`**, and `develop`, `origin/develop` and `dong` all sit on `b8b6fde`. I checked
rather than trusting the board line. The reflog shows the same `dong → develop → (ff merge) → dong` sweep Jason
found in scheduler-back — see the warning at the end of these notes.

**Read `develop` before touching shared ground, as instructed.** The cell is REQ-052/068 ground; I read the
current `BookingCellBody` / both grids / `CalendarLegendBar` from the working tree at `b8b6fde` (identical to
`develop`) rather than from memory, and the findings below are why two of the task's assumptions changed.

### 1. `displayName` — the enumeration, and what I deliberately left alone

`grep` over `src/` for `.studentName` / `.nickname` returns **81 hits in 37 files**. They are NOT 31 booking
surfaces — most are Student, Teacher, Course or `CoursePackageView` objects, which the task explicitly says to
leave. The **booking-surface** readers are these, and every one is switched:

| Site | Was | Now |
|---|---|---|
| `CalendarGrid.tsx:141` (day cell name) | `nickname \|\| studentName` | `displayName` |
| `CalendarWeekGrid.tsx:136` (week chip name) | `nickname \|\| studentName` | `displayName` |
| `BookingModal.tsx:95` (modal header) | `studentName` | `displayName` |
| `BookingModal.tsx` `contextName` (RentalModal) | `studentName` | `displayName` |
| `BookingModal.tsx` blocked-slot alert | `studentName` + `subject` | `displayName` + `subject ?? bookingType` |
| `BookingModal.tsx` overbook banner | `studentName` | `displayName` |
| `CancelBookingDialog.tsx:71` | `nickname \|\| studentName \|\| "—"` | `displayName \|\| "—"` |
| `BookingsTable.tsx` name column | `studentName` | `displayName` |
| `BookingsTable.tsx` bulk-confirm list (`studentName()` helper) | `studentName` | renamed `bookingName()` → `displayName` |
| `CalendarContent.tsx:46` (student search) | `studentName` | `displayName` |
| `scheduler.mock.service.ts:195` (mock search) | `studentName` | `displayName` |

**Left alone on purpose** (they mean *the child* / *the course*, not *this booking*): `CoursePackagePanel`,
`EndCourseDialog`, `PlanModal:494`, `CourseHistoryModal` (that one is a **teacher**), `PeopleContent`,
`StudentFormModal`, `eligible.ts`, `people.mock.service.ts`, `scheduler.service.ts:446` (a create-input field).

🔴 **No call site invents a fallback.** `grep -n '|| "' ` over the diff around names: **0 hits**.
`Booking.displayName` carries a 🚫-comment saying why, and `dtoToBooking` carries one saying it must never be
re-derived — the three-times-repeated allow-list bug in that exact function is now also pinned by a test (below).

### 2. The cell (AC-15) — and the one place I did NOT follow the task literally

- `BOOKING_TYPE_ICON` / `BOOKING_TYPE_VAR` (`BookingCellBody.tsx`) and `BOOKING_TYPE_COLOR`
  (`BookingBadges.tsx`) all gained `OTHER`; the `Record<BookingType, …>` types made all three compulsory, which
  is exactly how the third one was found.
- **Icon `Shapes`** — the four lesson icons all read as "a paid product"; อื่นๆ is not one, so it gets the
  odd-one-out glyph rather than a fifth product-shaped icon.
- **New token `--booking-type-other: 120 113 108` (stone-500)** in `globals.css`. Its own token, not a re-use.
  Deliberately the only **warm-neutral** hue, because that is the distinction it carries ("not a lesson"); and
  **stone, not slate**, so it never collides with the `--color-muted-*` ramp already used by borders and dimmed
  text — a slate value would have been numerically identical to `--color-muted-500`.
- ⚠️ **`CalendarLegendBar` does NOT pick the maps up automatically.** The task says it does; it does not.
  `BOOKING_TABS_LEGEND` is a **hand-written array**, so widening `BookingType` adds no row and the compiler
  stays silent. Added `OTHER` explicitly, with a comment on the line saying so — this is the "check it renders,
  don't assume" instruction paying for itself.
- 🔴 **"The program slot shows the title" would ALWAYS duplicate the name row, so I did not do it.** Grounded
  in TASK-224 rather than assumed: `displayName = otherTitle ?? nickname ?? name` (`db/mappers.ts:143`), so
  whenever a title exists it is *already* the name on the cell's first line. The two possible cases are:
  title set ⇒ program slot would print the identical string twice; title null (an อื่นๆ **with** a student —
  legal, `validation.ts` refines `!!student || !!otherTitle`) ⇒ the program slot would print nothing.
  **There is no case where it adds information.** What the AC actually guards — "no empty label, no dangling
  separator" — is already satisfied by construction: both cells gate on `!!booking.subject` and the `·`
  separator only renders when type **and** program are both present. See **Q1**; one line to change if you disagree.
- Booking modal: the program **tile is omitted** when `subject` is null rather than rendered empty (a labelled
  field with nothing in it reads as data that went missing — TASK-219's lesson). Bookings table shows `—`
  instead, because a blank cell in a dense table reads as a failed load.

### 3. AC-18 — one booking, several teachers, several columns

- `BookingDTO` gained `title`, `displayName`, `teachers[]`; `student` and `subject` became nullable. The app
  `Booking` gained `displayName`, `title`, `teachers: BookingTeacherRef[]`, and `studentName`/`subject` became
  `string | null`. **Making them nullable is what produced the caller list** — tsc named every dereference, and
  each was fixed deliberately rather than with a blanket `?.`.
- **Placement:** both grids now filter `b.teachers.some(tc => tc.id === teacherId)`. Grounded first: the BE
  indexes the calendar payload on **`dto.teacher.id` only** (`scheduler.service.ts:488` —
  `${dto.date}|${dto.teacher.id}|${dto.startTime}`), so an อื่นๆ booking arrives **once** and there are **no
  duplicates to dedupe**. `teachers` has length 1 for the four lesson types ⇒ their placement is identical to
  the old `b.teacherId === teacherId` — **AC-20 by construction, not by a guard.**
- **It reads as ONE booking:** same id, name, status and type in every column, plus a new
  `SharedTeachersMarker` (in `BookingCellBody.tsx`, so week and day cannot drift) that **names the other
  teachers** — "ร่วมกับ บีม, ดิว" — with the full list in the `title=`. It names rather than counts because
  *"who else is on this?"* is the question staff actually have; "×3" does not answer it. It renders nothing
  when there is one teacher, so the four lesson types are untouched.
- **Cancel acts on the booking, not the cell:** verified in code, not assumed. `CancelBookingDialog` posts
  `booking.id`; both grids filter `b.status !== "CANCELLED"` off the same single flat list, which is rebuilt
  from one DTO — so one cancel removes it from all columns because there is only ever **one object**. No code
  path treats the clicked cell as the owner: the cell passes the whole `booking` to `onSelectBooking`, and the
  modal never reads the column's teacher.
- Booking modal teacher tile lists all teachers when there is more than one; bookings table teacher column too.

### 4. The cancel-reason pair (⛔ ships with TASK-224)

`BookingModal.tsx` — `canCancelWithReason` now includes `OTHER`. The ⛔ comment is carried and **extended**: it
now spells out *both* failure directions (FE ahead of BE = a reason the server discards; BE ahead of FE = the
dialog never asks, the API answers `REASON_REQUIRED`, and the button silently does nothing — the REQ-019
defect), and names the BE test that asserts the mirror comment.

📌 **While editing that expression I removed a stray duplicated line** (`booking.status !== "CANCELLED";` was
present **twice**, the second one a no-op expression statement — it came in with `b8b6fde`, TASK-220's commit).
It compiled and did nothing. Removing it is inside the lines I was already editing; flagging it so it is not a
silent extra.

### 5. Mocks — declared, because they are slightly beyond "cell and naming"

`lib/mock/data.ts` gained `asBooking()`, which derives `displayName` + `teachers` **by the same rules the BE
uses**, so the fixtures cannot drift from the contract row by row, and two อื่นๆ fixtures: **b13** (no student,
no program, title `ปิดปรับปรุงลานสเก็ตช่วงบ่าย`, **three** teachers) and **b14** (a student, no title — the
branch where `displayName` falls through to the nickname, which a title-only fixture would never reach).
`scheduler.mock.service.ts` routes its two booking-construction sites through `asBooking`. Without these there
is no way to exercise AC-10/AC-18 offline at all. One revert if you disagree.

### Verified — commands and output

- `bunx tsc --noEmit` → **exit 0**, no output.
- `bun test` → **46 pass / 0 fail**, 75 expect() calls, 7 files (was 41/0 across 6 before this task).
- `bun run build` → ok; all routes emitted, `○ /scheduler/calendar` and `○ /scheduler/bookings` included;
  postbuild standalone copy ran.
- **New test `src/lib/api/booking-mapper.test.ts` (5 cases).** Declared as beyond the literal DoD, and here is
  why it earns its place: `dtoToBooking` is an **allow-list object literal** that has silently dropped a new
  DTO field **three times** — its own comments record TASK-170's `discount` and TASK-183's `endedAt`. Dropping
  `displayName` blanks the name on every อื่นๆ cell; dropping `teachers` puts the booking in one column instead
  of three. **Both would compile, and both would look like "the BE didn't send it".** The test pins
  displayName-passthrough, the title case, `teachers[0].id === teacherId`, the single-teacher shape for the four
  lesson types, and the pre-TASK-224 payload fallback.

### 🔴 Not done, and why — the rendered 1600/1280/768/375 measurement

**I did not measure it, and I am not reporting derived arithmetic as if I had.** I got as far as running the
app locally in **mock mode only** (`NEXT_PUBLIC_USE_MOCK=true`, with `NEXT_PUBLIC_API_URL` overridden to an
unroutable `http://127.0.0.1:9/api` so nothing could reach `frontoffice.develyst.online`, which is what
`.env.local` points at) — the server started clean and served `/login`. **`/scheduler/*` is behind the auth
proxy (`proxy.ts` matcher) and the only way past it is typing into a password field, which I am not permitted
to do.** There is no QA-session route in this repo.

This is the same wall TASK-142 hit ("AC-3 1440/768/375 NOT measured — headless pane → @Tanya"), so I am taking
the same route. **@Sober — please route the pixel measurement to @Tanya via @Porter.** It is a two-minute job
with the fixtures already in place, and this command lands on it (b13 is the long-title, three-teacher case):

```bash
NEXT_PUBLIC_USE_MOCK=true NEXT_PUBLIC_API_URL="http://127.0.0.1:9/api" AUTH_URL="http://localhost:3017" PORT=3017 bun run dev
```

**What is worth knowing from source in the meantime** — clearly labelled as static analysis, **not** measurement:
both grids are `min-w-max` inside their own `overflow-auto` container, with columns
`minmax(150px, 1fr)` (week) / `minmax(160px, 1fr)` (day). So **narrowing the viewport never squeezes a cell** —
below the minimum the inner container scrolls sideways and the page body does not. That means 375 is not a
different *cell*, it is the same 150px cell with a scrollbar, and the name is a single-line
`min-w-0 flex-1 truncate` ⇒ **ellipsis, never wrap, never overflow**. The type label is `shrink-0` (AC-3's rule:
the program shortens first, the type never does) and the new marker truncates independently. **What none of
this tells you is the actual pixel budget left for the name and where `ปิดปรับปรุงลานสเก็ตช่วงบ่าย` cuts — that
is exactly what the measurement is for, and it is the part I do not have.**

### ⚠️ For @Sober — my TASK-147 work was destroyed by the same sweep as Jason's

Unrelated to this task but it belongs in a file, not a log: the two `dictionaries.ts` help keys and the
`settings.mock.service.ts` rows I wrote for **TASK-147** on 2026-08-30 were **gone** from the working tree when
I opened this session — the front repo's reflog shows the identical `dong → develop → ff merge → dong` sweep
Jason found in scheduler-back. **They survived only because they were written verbatim into TASK-147's
Implementation Notes**, which is the whole of Jason and your point about the log. I have re-applied them; they
are in this same uncommitted working tree, so they are one branch operation from being destroyed again.

## Questions

**Q1 (non-blocking — I implemented the non-duplicating reading; one line to reverse).**
§2 says *"the program slot shows the title"*. Given TASK-224's `displayName = otherTitle ?? nickname ?? name`,
that instruction can only ever print the title **twice** (title set ⇒ it is already the name row) or **nothing**
(title null). I implemented "no program slot for อื่นๆ", which is what both cells already did via `!!subject`,
and which leaves no empty label and no dangling separator. If you meant the title to appear in the meta row
*as well as* the name row — say so and it is one line in `BookingCellBody` + one in `CalendarGrid`.

**Q2 (not blocking this task; a consequence you should own).**
The day grid holds **one** booking per (teacher, slot) — unchanged. But additional teachers are deliberately
**not** slot-checked on the BE (SPEC-070 amendment; you routed the residue to @Porter as a business question),
so a teacher can now be on an อื่นๆ **and** a lesson in the same slot. When that happens the day cell draws the
first match in payload order and **the other is not drawn at all** — silently. I did not redesign the cell to
hold a list, because that is a layout change nobody has asked for, and I left an explicit comment at
`CalendarGrid.tsx` `findBooking` rather than leaving it to be discovered. Your call whether this becomes a task
or waits on Porter's soft-warning answer. (The **week** grid already renders a list, so it is unaffected.)

**Q3 (one line, and it falls between two tasks).**
`BOOKING_TYPE_OPTIONS` (`Calendar.config.ts`) is the **bookings-table type FILTER**, not the create-form tabs
(the tabs are `BOOKING_TABS` inside `BookingModal`). It is a hand-written four-item array, so **staff cannot
filter the bookings table to อื่นๆ**. It is not in TASK-227's scope (this task is cell + naming) and not
obviously in TASK-226's either (that one is the form), so it would fall through the crack. I left it unchanged.
Adding `"OTHER"` to that array is the whole change — yours to place.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-01: ✅ **PASS.** You corrected two of my instructions and both corrections are right.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **51 pass / 0 fail** (222 + 227 in one tree). Checked at
source: `mappers.ts` carries `displayName` **verbatim** with the "never re-derive" comment, `student`/`subject`
nullable, `teachers: dto.teachers ?? [dto.teacher]`; `BookingModal.tsx:298-303` has `OTHER` in
`canCancelWithReason` with the coupling comment extended.

📌 **The `?? [dto.teacher]` fallback is a good instinct** — *"one column is wrong-ish, no column at all would be a
booking that vanished."* A booking you cannot see is the worst failure this grid has.

📌 **§0 landed, which was the whole point of the ordering:** `dto.student.name` was an unguarded dereference in
the calendar's mapper. That window is now closed.

### Your three questions

> **Q1 — "for อื่นๆ the program slot shows the title".** ✅ **Your reading is right and my instruction was wrong.**
> I wrote it before TASK-224 defined `displayName = otherTitle ?? nickname ?? name`. Given that, the title is
> **already** the name row, so my line could only ever duplicate it or print nothing — **there is no case where it
> adds information**, exactly as you say. What AC-15 actually guards (no empty label, no dangling separator) you
> proved is true by construction. **Keep what you built.** Grounding the instruction in the code instead of
> following it is the behaviour I want.

> **Q2 — a teacher can be on an อื่นๆ AND a lesson in one slot, and the DAY cell draws one and silently drops the
> other.** 🔴 **The second half is the real finding and it is worse than the DB question.** Jason raised the
> clash (additional teachers aren't covered by `bookings_teacher_slot_uq`) and I sent it to @Porter as a business
> call. **This is different: a booking that exists and is not rendered.** Same family as the `?? [dto.teacher]`
> case you guarded against one paragraph earlier.
> **Not a rework of this task** — you commented it rather than redesigning, which was correct for a case the
> product cannot yet create. But it is now on the board as a known gap, and it must be closed **before** อื่นๆ
> reaches `uat`, because the week grid and the day grid disagreeing about what exists is how staff stop trusting
> the calendar. If @Porter's answer is "soft warning at save", that mostly prevents the state; the day cell still
> needs to show a `+N` rather than drop.

> **Q3 — `BOOKING_TYPE_OPTIONS` is the bookings-table filter, so staff cannot filter to อื่นๆ.** ✅ Correct that it
> belongs to neither task, and correct to leave it rather than widen a submitted one. **I have put it in
> TASK-226** — one line, in a file that task already opens. Thank you for naming a crack instead of stepping over
> it; that is how REQ-024's filters would have shipped incomplete.

### On the destroyed TASK-147 work — second repo, same sweep
Recorded, and carried to @Porter with the rest. **Your TASK files saved it, in the same way Jason's saved his.**
That is now two of two repos, which turns it from an incident into evidence. ⚠️ **And it is not over: your 20
changed files are still UNCOMMITTED right now** — I am flagging that up the chain today rather than after it
happens a third time.

### The measurement — routed, not waived
🔴 **The 1600/1280/768/375 check is NOT done and I am not marking it done.** Your static analysis (`min-w-max`
over `minmax(150px,1fr)` ⇒ the container scrolls rather than the cell squeezing; single-line `truncate` ⇒ ellipsis,
never wrap) is genuinely useful **and you labelled it as source analysis rather than as a measurement**, which is
the only reason it helps instead of misleading. Routing to @Tanya via @Porter with your fixture (b13, long title,
three teachers). **It is a condition on this task being *verified*, not on it being reviewed.**

**Status → DONE (code).** Rendered checks are QA's.
