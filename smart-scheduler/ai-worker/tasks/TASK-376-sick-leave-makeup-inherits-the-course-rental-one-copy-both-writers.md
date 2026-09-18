# TASK-376 — A post-creation sick-leave's make-up inherits the course rental: ONE copy, called by BOTH make-up writers (`REQ-091` Deploy B defect) + land the approved `RENTAL ADDED` strings

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-17)
**Source:** @Tanya on `sid` (root-caused, not deploy lag): a make-up appended by a post-creation SICK LEAVE has no `R` and no `Rental :` line; the same course's make-up from a CANCEL (through the reconcile) inherits. No double charge. **Holding `uat` until this lands — rides the A + B deploy.** Plus: **the owner APPROVED `RENTAL ADDED / เพิ่มอุปกรณ์เช่า ‼️` — land the strings (markers off, bytes unchanged, byte-frozen).**
**Size S.** ⛔ Chain stopped.

---

## §1 The prior fact (verified by me)
There are TWO writers of a make-up row: `reconcileCoursePlan` (`:2295` loop → `:2438` copies the course's rental — TASK-373) and **the sick-leave branch of `updateBookingStatus` (`:3155`), which appends its make-up with its own `tx.insert(bookings)` (note `คาบขยายอัตโนมัติจากการลา`) and never reaches the reconcile.** TASK-373's pin (`whole-course-rental-req091.test.ts:140`) exercised only the reconcile path — the second writer was invisible to it. *A second writer of the same fact is the defect; the missing chip is its symptom.*

## §2 The fix — a chokepoint, not a second copy of the copy
- Extract the rental copy into ONE function — `inheritCourseRental(tx, courseId, newBookingId)` (in `rental.service` or beside `courseRentalOf`): reads the course's rental (`courseRentalOf` over its rows), inserts the inherited row (`paid_at`/`paid_actor`/`created_by` inherited, no post), no-op when the course is not rented. **Both writers call it, and nothing else inserts a `booking_rentals` row on a make-up** — assert by count (exactly two call sites; zero other `insert(bookingRentals)` outside the create pass, the session `record`, and this function).
- 🚫 Do not fold the sick-leave append into the reconcile in this task (its quota/lock branch is its own behaviour) — name it on the list as the third writer to retire.
- ❓ The over-quota `locked = true` branch appends nothing — nothing to inherit; pin that a locked leave creates no rental row.
- 📌 `resumeCourse` inserts new rows directly too (TASK-373 named it) — a THIRD writer of live rows on a rented course. Not this task; **say whether the same one-liner belongs there and leave it on the list** — the owner has not asked.

## §3 The strings
`ob_rental_added_title` — remove the PLACEHOLDER marker, 0 bytes of copy changed (md5 before/after), byte-frozen in the test as TASK-370's are.

## Definition of Done
- [ ] Suite, **count** · tsc · **36 = 36**
- [ ] Pinned: a rented course, a post-creation sick leave within quota ⇒ the appended make-up carries a paid rental row (inherited stamps, no ledger line) · the same via the reconcile path ⇒ same row (both paths, one function) · an unrented course ⇒ no row · a locked (over-quota) leave ⇒ no make-up, no row · exactly two call sites
- [ ] The stamp live, bytes unchanged, frozen
- [ ] 🔑 Break-and-watch (the sick-leave call removed ⇒ the new pin fails; a second copy of the copy ⇒ the count pin fails), `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ Three writers of live course rows exist (create/reconcile · sick-leave append · resume). Name every fact a make-up must carry today (teacher, subject, slot, rental, note…) and which writer drops which — the shape of a future "one make-up writer" task; build nothing.

---

# 📤 REPORT — @Jason → @Sober (2026-09-17)

✅ **DONE (code) — the defect was mine and the pin that let it ship was mine.** **2270 pass / 0 fail**, **183 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (36 = 36)**.

## §4 What I got wrong in TASK-373, plainly
I found ONE make-up writer (the reconcile) and pinned the copy there. There were two. My source pin asserted an INLINE copy inside the reconcile — so it could only ever see the writer I had already found; a test that reads the shape of one function cannot notice a second function. @Tanya found it by USE on `sid` in an afternoon. *A second writer of the same fact is the defect; the chip was the symptom* — your sentence, and it is the right one.

## §5 What was built
- **`rental.service.ts` — `inheritCourseRental(tx, courseId, newBookingId)`, the ONE copy:** reads the course's rental from any OTHER row of the course (`ne(bookings.id, newBookingId)` — a rented course's make-up cannot pick its own empty self), `limit(1)`; no source ⇒ `null` (an unrented course is a no-op); inserts `{ bookingId, ...source }` — `paid_at` / `paid_actor` / `created_by` INHERITED, never re-stamped, never posted.
- **Both writers call it:** the reconcile (its pre-read and inline copy REMOVED — one call per appended row, right after the insert) and **the sick-leave branch of `updateBookingStatus`, right after its own `.insert(bookings)`, inside the within-quota branch** — the locked branch appends nothing and copies nothing.
- 🚫 The sick-leave append is NOT folded into the reconcile (its quota / lock / notice-cutoff branch is its own behaviour) — on the list as the writer to retire. `resumeCourse` (`insertBooking`) is NOT wired — the owner has not asked; the same one-liner belongs there the day he does (pinned as named-not-wired).
- **The stamp landed:** `ob_rental_added_title` — the PLACEHOLDER marker replaced by *"APPROVED by the owner as drafted"*, **0 bytes of copy changed** (md5 of the key's line identical before/after), byte-frozen in the test (TH and EN, and the rendered first line).

## §6 Pinned (`lib/course-rental-inherit-req091.test.ts`, 7 tests) + the two moved
the function's shape (the join, the `ne`, the `limit`, the null, the inherited stamps, no post, no `new Date()`) · writer 1 after its insert · **writer 2 after ITS insert, inside the within-quota branch, before `locked = true`** · the locked branch has no insert and no copy · **exactly TWO call sites in the scheduler; exactly ONE `insert(bookingRentals)` left there (the create pass); in `rental.service` exactly two (the session record + the chokepoint)** · `resumeCourse` named, not wired. 🔻 TASK-373's reconcile block rewritten to pin the CALL, not an inline copy, with the sentence of why; TASK-375's marker pin → approved + byte-frozen.

## §7 🔑 Mutation — seven, `finally`, checksum — all bite
**A the sick-leave call removed — the defect exactly as shipped (2 fail)** · B the reconcile call removed (3) · C a second copy of the copy inlined in the sick-leave branch (2 — the count pin) · D the copy in the LOCKED branch (1) · E the `ne` dropped (self-copy) (1) · F re-stamped `paid_at: new Date()` (1) · G the approved stamp drifts by one byte (2). Every restore byte-identical.

## §8 ❓ Owner's-list answer — the facts a make-up carries today, and who drops which
| fact | create / reconcile | sick-leave append | resume (`insertBooking`) |
|---|---|---|---|
| teacher · subject · slot (`start`/`end`) · student | ✅ template | ✅ `current` | ✅ input (teacher may be picked, TASK-359) |
| `extendedFromId` (which leave it replaces) | ✅ | ✅ | — (new rows, not make-ups) |
| `note` (the human sentence) | *"…จากการปรับแผนคอร์ส"* | *"…จากการลา"* | none |
| `plannedAtCreation` | — | — | — |
| **rental** (TASK-373/376) | ✅ chokepoint | ✅ chokepoint (this task) | ❌ not wired |
| `courseLast` / `Rental :` line / `R` chip | derived at read — follow the row | same | same |
Three writers of live course rows, two of make-ups. The shape of a future "one make-up writer" task is: the sick-leave branch calls the reconcile's appender (with its own note), and `resumeCourse` calls `inheritCourseRental` after each `insertBooking`. Named; nothing built.
