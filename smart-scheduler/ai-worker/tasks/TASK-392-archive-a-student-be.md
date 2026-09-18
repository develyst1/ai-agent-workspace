# TASK-392 — Archive a student (`REQ-093`, shape (a)): `students.archived_at` (migration), hidden from every working read, history + ledger untouched, one-tap un-archive — BE, contract first

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-18)
**Owner:** shape (a) — archive. The existing history-free `DELETE` stays. Merge (c) stays listed; hard delete (b) not built.
**Size S.** **Migration `0039` → 40 = 40** (after TASK-390's `0038`; two files, one run at the cutover — say the order in both headers).

## §1 The contract (proposed; confirm/correct first)
- `students.archived_at timestamptz null` + `archived_by text null` — one nullable column add on `students` (metadata-only; header).
- `POST /students/:id/archive` ⇒ `{ student }` · `POST /students/:id/unarchive` ⇒ `{ student }` — ONE action key for both directions (act-and-undo rule): **`action:people.student-archive`** (48th, after TASK-390's 47th). Archiving touches NOTHING else — bookings, courses, vouchers, rentals, sales, LINE links — asserted by absence.
- **A student with LIVE future sessions is REFUSED:** `409 STUDENT_HAS_LIVE_SESSIONS "มีคาบเรียนข้างหน้า n คาบ — ยกเลิก/ย้ายก่อน"` — archiving is for mistakes; a child with classes ahead is not a mistake.
- **Hidden from every WORKING read** — enumerate and pin each: the student pickers (`GET /students`, `GET /students/eligible`), the People page's default list, the calendar's roster / `liveCount`s, the check-in and LIFF child lists (a parent's archived child is not offered). **`GET /students?archived=true` (or the people list's flag — say which) returns them for the restore view.** History reads (`/courses/:id/history`, reports, the ledger, the outbox) untouched — an archived child's past still reads.
- `StudentDTO.archivedAt: string | null`.

## Definition of Done
- [ ] Contract confirmed first (the working reads enumerated)
- [ ] Suite, **count** · tsc · **40 = 40** · header
- [ ] Pinned: archive hides from each enumerated read · history reads still return · live-sessions refusal with the count · unarchive restores · nothing else touched (absence)
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

---

# 📋 CONTRACT — @Jason → @Sober (2026-09-18) — confirm/correct before I build

**The tree agrees with §1.** Every read of `students` in the repo was enumerated (`grep from(students) | query.students`) and classified below — the list IS the pin's list.

## Migration `0039_student_archive.sql` — 40 = 40
`ALTER TABLE students ADD COLUMN IF NOT EXISTS archived_at timestamptz NULL;` then `… archived_by text NULL;` — two nullable column adds, one transaction; **witness = the LAST column `archived_by`**. Header: ACCESS EXCLUSIVE on `students` per statement, catalog-only (no rewrite), `students` is hundreds of rows; the queueing hazard (the pickers, the calendar's student joins); **the cutover order named in BOTH headers: `0038` (TASK-390) then `0039`, one `db:migrate` run applies both, verify 40**.

## The routes + the key
- `POST /students/:id/archive` ⇒ `{ student }` · `POST /students/:id/unarchive` ⇒ `{ student }`. ONE key for both (act + undo): **`action:people.student-archive`** (48th) — TH `เก็บ/คืนสถานะนักเรียน` / EN `Archive & restore a student`; area people; `ROUTE_ACCESS` rows under `PEOPLE`.
- `archiveStudent(id, actor)`: 404 unknown · **already archived ⇒ 200, no change** (idempotent — the second tap is not an error) · **live future sessions ⇒ `409 STUDENT_HAS_LIVE_SESSIONS "มีคาบเรียนข้างหน้า n คาบ — ยกเลิก/ย้ายก่อน"`** where n = `bookings` with `student_id = id`, `date >= today` (Bangkok, today included), status ∈ `COURSE_LIVE_STATUSES` (PENDING · CONFIRMED · EXTENDED) — any booking type · else `UPDATE students SET archived_at = now(), archived_by = actor`. **Touches NOTHING else — asserted by absence** (the region has no `bookings`/`coursePackages`/`vouchers`/`bookingRentals`/`boMovement`/`familyLineLinks`/`parents` write). ❓ a voucher with sessions left is NOT a "session ahead" (no date) — archiving is allowed; say if you want it refused too.
- `unarchiveStudent(id, actor)`: 404 · not archived ⇒ 200 no change · **the 5-per-parent cap is re-asked** (`assertParentHasRoom`, the existing TASK-233 helper — an archived child does not count toward the cap, so restoring must not silently make six) ⇒ its existing 409 · else clears both columns.
- `StudentDTO.archivedAt: string | null` on every student shape (the search rows, the parent detail's `students`, the LIFF children — one mapper site each).

## 🔴 The working reads — HIDDEN (each pinned by name)
1. **`searchStudents`** (`GET /students`, the booking picker) — `isNull(archived_at)` by default; **`GET /students?archived=true` returns ONLY the archived ones** (the restore view: same rows + `archivedAt`, parent name/phone as today). The People page has no separate student list — the picker's query IS the list; the flag lives here.
2. **`getEligibleStudents`** (`GET /students/eligible`) — the same exclusion set as suspended (it answers "who can be booked").
3. **`listStudentsOfParent`** — the ONE helper behind: the parent detail (`GET /parents/:id`) and the parents list (`GET /parents`), the per-parent cap, **the LIFF register (`found`/`linked`/`children`/`siblings`) and the LINE webhook's kid lists (check-in, menus)**, and the check-in service's `linkedStudentIds` (today's bookings for a parent). Default excludes archived; `{ includeArchived: true }` only for the two internal callers that must still SEE them: `unarchiveStudent`'s existence check and… nothing else today. ❓ the parent detail: `students` = active only, plus **`archivedStudents`** beside it so the People page can show "1 archived" without a second call — say yes/no.
4. **`attention.service` `studentsWithParent`** (the `incomplete_students` attention row) — an archived child must not nag.
5. **The calendar's rosters** read students THROUGH bookings (`with: { student }`) — an archived child has no live future row (the refusal), so the grid cannot show one; **past** rows keep their student (history). No change needed; pinned as a statement (the refusal is the guard).

## 🚫 History / by-id reads — UNTOUCHED (pinned to still return an archived student)
`GET /courses/:id/history`, the reports (`daily`, `som` — the SOM's `students.findMany` is a REPORT count; ❓ say if "new students this month" should exclude archived — I would leave it: what happened, happened), the ledger, the outbox/LINE messages about past sessions (`course-deduction`, `line-admin` read the row by id), `/bookings?q=` (`studentSearchQuery` — an archived child's past bookings must still be findable by name), the parents search by child name (`listParents q` — the parent is not archived), `suspendedStudentIds` (unrelated), every `findFirst` by id.

## ❓ One guard beyond §1 — propose, build only if confirmed
The picker hides an archived child, but `POST /bookings` / `POST /courses` / `POST /vouchers` take a `studentId` and would accept one (a stale tab, a typed id). One line at each: **`409 STUDENT_ARCHIVED "นักเรียนถูกเก็บแล้ว — คืนสถานะก่อน"`** via a shared `assertStudentActive(studentId)` (three call sites, one helper, pinned by count). Say build / drop.

## For @Fern (draft, final after confirm)
`POST /api/students/:id/archive` · `POST /api/students/:id/unarchive` ⇒ `{ student }` (`409 STUDENT_HAS_LIVE_SESSIONS` with the count in the sentence; unarchive may 409 on the family cap) · key `action:people.student-archive` · `GET /api/students?archived=true` for the `Show archived` toggle · `archivedAt` on every student shape · the existing history-free `DELETE` untouched.

⛔ Waiting on your confirm (the voucher question · `archivedStudents` on the parent detail · the SOM count · the create guard) before code.

---

# 📤 REPORT — @Jason → @Sober (2026-09-18)

✅ **DONE (code), against the confirmed contract (your four answers applied: voucher ≠ session ahead · `archivedStudents` on the parent detail · the SOM count untouched · the create guard BUILT).** **2420 pass / 0 fail**, **191 files** (+1) · `tsc --noEmit` clean · **MIGRATION `0039_student_archive` → 40 = 40** · preflight scanner clean · witness registered.

## The migration — `drizzle/0039_student_archive.sql`
Two nullable column adds on `students` in one transaction, both `IF NOT EXISTS`: `archived_at timestamptz` then **`archived_by text` — the witness** (`kind: "column"`). 🔒 The header: ACCESS EXCLUSIVE on `students` per statement, catalog-only (no rewrite, no backfill), hundreds of rows, the queueing blink (pickers / People page / calendar joins read it — quiet moment). 📌 **The cutover order is in BOTH headers**: `0038` then `0039`, ONE `db:migrate` run applies both in journal order, `db:verify` expects 40 (0038's header gained the line). Neither depends on the other's objects.

## What was built
- **`parent.service.ts`** — **`archiveStudent(id, actor)`**: 404 · already archived ⇒ 200 no change · **live future sessions ⇒ `409 STUDENT_HAS_LIVE_SESSIONS "มีคาบเรียนข้างหน้า n คาบ — ยกเลิก/ย้ายก่อน"`** (n = `bookings` with `student_id`, `date >= today` Bangkok — today included — status ∈ PENDING · CONFIRMED · EXTENDED, ANY booking type) · else `archived_at = now(), archived_by = actor` — the ONE write; nothing else touched. **`unarchiveStudent(id)`**: 404 · not archived ⇒ 200 · **the 5-per-parent cap re-asked** (`assertCanAddStudent`, which counts ACTIVE children through the default read — a walk-in with no parent skips it) · clears both columns. **`assertStudentActive(exec, id)`** ⇒ `409 STUDENT_ARCHIVED "นักเรียนถูกเก็บแล้ว — คืนสถานะก่อน"`. **`archivedStudentIds()`** (the id-set shape of `suspendedStudentIds`).
- **The working reads — HIDDEN, by name:** (1) **`searchStudents(q, limit, archived = false)`** (`GET /students`, the picker): `isNull(archived_at)` by default; **`?archived=true` ⇒ ONLY the archived** (the restore view; the rows carry `archivedAt`); `validation.ts` `studentsQuery.archived` (enum `"true" | "false"`, the `includeCancelled` pattern). (2) **`getEligibleStudents`**: the archived id set excluded on both branches beside suspended. (3) **`listStudentsOfParent(parentId, exec, { includeArchived? })`** — the ONE helper, archived hidden by default: the cap, the LIFF register (`found`/`linked`/`children`/`siblings`), the webhook's kid lists and `linkedStudentIds` all inherit it unchanged; **the parent detail and the parents list read ONCE with the flag and split into `students` (active) + `archivedStudents`** (answer 2). (4) the attention row (`incomplete_students`) filters `archivedAt`. (5) the check-in service's `linkedStudentIds` adds `isNull(archived_at)`. (6) the calendar needs nothing — rosters read students through bookings and an archived child has no live future row (the 409 is the guard); pinned as that statement.
- **The history / by-id reads — UNTOUCHED** (pinned to contain no `archivedAt`): `/bookings?q=` (`studentSearchQuery`), the parents search by child name, `suspendedStudentIds`, the SOM count (answer 3), `course-deduction`, `line-admin`, the history-free `DELETE` (TASK-364).
- **The create guard (answer 4)** — `assertStudentActive(tx, studentId)` right after `resolveStudentId` in **`createBooking` · `createCoursePackage` · `createVoucher`** — one helper, exactly three call sites (pinned by count); the imports and per-session edits deliberately not guarded (an import is history; an edit is not a new student).
- **Routes + key** — `POST /students/:id/archive` ⇒ `{ student }` (actor from the token) · `POST /students/:id/unarchive` ⇒ `{ student }` · ONE key **`action:people.student-archive`** (48th; TH `เก็บ/คืนสถานะนักเรียน` / EN `Archive & restore a student`) on both rows under PEOPLE; classified `unrelated` in the ended-course table with the reason. `DELETE /students/:id` keeps its own key.
- 🔻 **Pins moved, with reasons:** the `39 = 39` pins → `40 = 40` (ten files); the "last file / last witness" pins of 0038 now find their entry by index / tag; `actorOf(c)` 13 → 14 (archive takes the actor; unarchive does not); the key count 47 → 48; the mutate-route floor 59 → 61; the ended-course classification (+ the pair).

## Pinned (`lib/archive-student-req093.test.ts`, 20 tests)
- **The migration:** 40 = 40, 0039 last at idx 39 and 0038 at 38 (the order the run applies) · two ALTERs in order, no DEFAULT / NOT NULL, one breakpoint · **both headers' cutover-order sentences**, the `students` lock sentences, the count line · the witness = the last column · the schema mirrors both.
- **The rules (source):** archive — 404 / idempotent / the live count's three predicates (today included, course-live statuses, no `bookingType` filter) / the 409 sentence with `n` / the refusal BEFORE the write · **nothing else touched: no update/delete/insert on bookings, courses, vouchers, rentals, ledger, LINE links, parents; no `recordSale`/`recordRental`/`enqueueLine`/`clearFamilyLine`; exactly ONE `db.update` and it is `students`** (both functions) · unarchive — 404 / idempotent / the cap before the write / both columns cleared · the cap reads through the default (hidden) list.
- **The working reads, each by name** (1–6 above) — the picker's predicate + `archivedAt` on the rows + the validator by value + the route passes the flag · eligible on both branches · the ONE helper's predicate, its default callers pass no flag, exactly two split sites · attention · check-in · the calendar's non-change.
- **The history reads untouched** by absence (seven sites).
- **The create guard:** the sentence; exactly three `assertStudentActive(tx, studentId)` in the scheduler, each AFTER `resolveStudentId` in its create; the imports unguarded.
- **The routes through the ROOT app:** archive ⇒ `{ student }` with actor `dev`, **the 409 envelope by value with "3 คาบ"** · unarchive ⇒ restored, the cap's 400 passes through · `GET /students?archived=true` reaches `searchStudents(q, 50, true)`, the default `false` · the key with its labels on both rows; the delete keeps its own.

## 🔑 Mutation — eighteen, `finally`, checksum — all bite
A the live refusal dropped · B today excluded from "ahead" · C course-only live count · D archive also cancels bookings · E unarchive skips the cap · F the ONE helper leaks archived by default · G the picker's default leaks · H the parent detail folds them back · I eligible stops excluding · J attention nags · K check-in offers · L the guard dropped from bookings · M from vouchers · N the guard never refuses · O unarchive under `student-delete` · P the witness is the first column · Q `archived_at NOT NULL DEFAULT now()` · R the history search hides archived children's bookings. Every restore byte-identical (each 1 fail — one pin per rule, on purpose).

## 📌 Contract lines for @Fern (via you) — final
`POST /api/students/:id/archive` ⇒ `200 { student }` | `404` | **`409 { error: { code: "STUDENT_HAS_LIVE_SESSIONS", message: "มีคาบเรียนข้างหน้า n คาบ — ยกเลิก/ย้ายก่อน" } }`** · `POST /api/students/:id/unarchive` ⇒ `200 { student }` | `400` (the family cap sentence) · both under **`action:people.student-archive`** (in `/permissions`) · **`GET /api/students?archived=true`** ⇒ the archived only (rows + `archivedAt`) for the `Show archived` toggle; default hides · `GET /api/parents/:id` and `GET /api/parents` ⇒ `students` (active) **+ `archivedStudents`** (the "n archived" hint, one-tap Restore) · every student row now carries `archivedAt: string | null` · the pickers never show an archived child; `POST /bookings|courses|vouchers` on one ⇒ `409 STUDENT_ARCHIVED "นักเรียนถูกเก็บแล้ว — คืนสถานะก่อน"` · the red `Delete` (history-free) is unchanged.
📦 **After the migration:** nothing to set — every student starts `archived_at = NULL` (today's behaviour). The cutover = `0036`…`0039` in one `db:migrate`, verify 40.
