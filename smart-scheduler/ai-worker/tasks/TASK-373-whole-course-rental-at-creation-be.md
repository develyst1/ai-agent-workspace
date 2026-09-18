# TASK-373 — Whole-course rental at creation: one PAID row per session, one post (`REQ-091` Deploy B, T3) — BE, contract first

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-17)
**Owner rulings (`REQ-091 §6`/`§6.3`/`§9`):** pattern A — mark the course as rented at creation ⇒ a rental on EVERY session, paid upfront, **ONE tier for the whole course** (customer: *"เหมือนเดิมทุกคาบ"*); money posts at creation.
**Size M.** ⛔ Chain stopped. **Deploy B = this + TASK-374 (FE) + TASK-375 (BE, teacher notice). A + B ship to `uat` together (owner).** Contract to @Fern through me first.

---

## §1 The prior facts (verify)
- TASK-371: `booking_rentals` row (one per booking, `paid_at`), money only via `recordRental`; a session rental posts `hours: 1, refId: bookingId`, key `rental:<bookingId>:<code>`.
- `createCoursePackage` (`scheduler.service.ts:1609`): inserts the `size` planned rows, absences ⇒ `SICK_LEAVE`, `reconcileCoursePlan` appends make-ups; the course SALE posts once at `:1789` — `recordSale(courseItemRef(priceGroup, size), 1, { refId: courseId, idempotencyKey: 'course-sale:<id>' })`, `void`, best-effort, AFTER the transaction.
- Make-ups after a later leave: `reconcileCoursePlan` (`:2319`) copies a template row (`extendedFromId`) for each appended session.

## §2 The contract (proposed; confirm/correct first)
- **`POST /courses { …, rental?: { code, remark? } }`** — the same remark rule (set + ride). ⇒ **a PAID `booking_rentals` row on every LIVE session the course is born with** (chain rows + the make-ups the creation appends; 🚫 not on a `SICK_LEAVE` row — no lesson, no rental), `paid_at = now`, `paid_actor = actor`, and **ONE money post: `recordRental({ code, hours: size, refId: courseId, actor })`** — key `rental:<courseId>:<code>`, `hours = size` (10-hour course = 10 rentals, one line), posted where the course sale posts (`:1789`, same `void`/best-effort shape, same discount? — 🚫 no discount on the rental line; say so). ❓ If the post fails the rows are already paid — say how the course sale handles the same gap today and mirror it exactly (the precedent, not a new rule).
- **A course-level fact:** `course_packages.rental_code` + `rental_remark` (nullable) — so a make-up appended by a LATER leave inherits a paid row (the family paid for `size` lessons of equipment; a make-up is one of them). ❓ Migration `0036` for two nullable columns — **or** derive "the course is rented" from its rows and copy the template row's rental in `reconcileCoursePlan` (`:2319` already copies a template). **I prefer the derive-and-copy: no migration, one source (the rows), and a leave's make-up carries the rental exactly as it carries the template's teacher/subject.** Say which and why; if a column, count `37 = 37`.
- The course DTO / plan response shows `rental: { code, remark } | null` (derived from its rows — all-or-nothing by construction). Cancelling a session keeps its row (TASK-371).
- 🚫 Not this task: changing a course's rental after creation; a per-session tier on a rented course; the resume path (a resumed course's NEW rows — ❓ do they inherit? say what falls out of the template copy; build nothing extra).

## Definition of Done
- [ ] Contract confirmed first
- [ ] Suite, **count** · tsc · **36 = 36** (or 37 = 37, stated)
- [ ] Pinned: size 4 + 1 absence ⇒ 4 paid rows (the make-up has one, the leave row has none), ONE `recordRental` with `hours 4`, `refId = courseId` · no `rental` in the body ⇒ zero rows, zero posts, byte-for-byte today · a later leave's make-up ⇒ a paid row copied, no new post · remark rule · a session rental on a rented course ⇒ `409 RENTAL_EXISTS`
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ A rented course DROPPED after 3 of 10 sessions: 7 paid rentals never used, one 10-hour line posted. What does the backoffice do today for the unused tuition on a drop — is there a reversal path the rental should follow? Name it; build nothing.

---

## §3 📋 CONTRACT — verified against the tree; CONFIRMED with three corrections and one decision (@Jason, 2026-09-17, before building)

**Confirmed:** `POST /courses { …, rental?: { code, remark? } }`, the same remark rule (set + ride, the one `rentalRemarkRequired`) · a PAID row on every LIVE session the course is born with (chain rows + the make-ups the creation appends), none on a `SICK_LEAVE` row · `paid_at = now`, `paid_actor = actor`, `created_by = actor` · **ONE money post `recordRental({ code, hours: size, refId: courseId, actor })`**, key `rental:<courseId>:<code>`, **no discount on the rental line** (nothing is passed; the course's own discount stays on the course sale) · no `rental` in the body ⇒ zero rows, zero posts, byte-for-byte today · a session rental on a rented course ⇒ `409 RENTAL_EXISTS` by the UNIQUE · cancelling a session keeps its row · **36 = 36, no migration.**

✅ **Decision — DERIVE-AND-COPY, no column, and here is the why that survives a reader:** the rows are already the ONE source for "is this course rented" — a rented course has a rental row on every live session by construction, so "the course's rental" is *any* of its rows' rentals, all equal. A column would be a second copy of that fact, written at creation and never again, and `reconcileCoursePlan` already copies a template row for every make-up (teacher, subject, slot) — the rental joins that copy. `courseRentalOf(rows)` (pure: the first row carrying a rental ⇒ `{ code, remark }`, else `null`) is the derivation, used by the DTO and by the reconcile.
🔴 **Correction 1 — the template row can be the WRONG row to copy from.** In `reconcileCoursePlan` the template for an appended make-up is `byId.get(a.extendedFromId)` — **the `SICK_LEAVE` row it replaces, which by this contract has NO rental.** So the copy cannot read the template's rental; it reads the COURSE's (`courseRentalOf` over the course's rows, one `booking_rentals` read per reconcile). Same result, honest source. The copied row carries the source row's `paid_at` / `paid_actor` / `created_by` — inherited, not re-stamped — and **no post** (the family paid `size` lessons of equipment once).
🔴 **Correction 2 — "mirror the course sale's gap exactly" needs one line the course sale does not: a `.catch`.** The course sale posts AFTER the transaction as `void recordSale(…)`, and `recordSale` never throws — it returns `{ ok: false }` and `console.error`s *"NOT POSTED … revenue is NOT in the books"*; nobody retries, the course exists, the log is the alarm. `recordRental` is the OTHER contract (TASK-108: the post IS the event, so it THROWS `502`). A bare `void recordRental(…)` would be an unhandled rejection. ⇒ `void recordRental(…).catch((e) => console.error("[rental] NOT POSTED — course <id> …"))`: same place, same best-effort shape, same effect (rows paid, ledger missing, loud), one caught rejection instead of a returned `ok: false`. **Not a new rule — the precedent, with the one line its different contract needs.**
🔴 **Correction 3 — the ordering inside the create.** Rental rows are inserted AFTER the flip loop (absences ⇒ `SICK_LEAVE`, make-ups appended), over the FINAL live rows — so the creation's own reconcile runs before any rental exists and copies nothing (correct: the rows get theirs in the pass after), and every later reconcile finds the course's rental and copies it. Pinned by order.
📌 **The resume path, what falls out:** `resumeCourse` inserts its new rows through `insertBooking`, not through `reconcileCoursePlan` ⇒ **a resumed course's new rows do NOT inherit the rental.** Said, not built (your line).
📌 **Course DTO:** `rental: { code, remark } | null` on `toCourseWithStudent` — derived from the rows: the create's return has them loaded; the list (`coursesByIds`) gets ONE grouped read of the courses' rental rows (its nested `bookings` is `limit: 1` and could land on a leave row, so the grouped read, not the sample).
📌 **Your owner's-list question — the drop:** `dropCourse` and `endCourse` post NO reversal today; unused tuition on a drop is adjusted by hand in the backoffice (QA's own footprint note: *"manual bo adjustment by design"*). The rental's one 10-hour line follows the same non-path: nothing reverses it here. Named; nothing built.

▶️ Building now.

---

# 📤 REPORT — @Jason → @Sober (2026-09-17)

✅ **DONE (code), against §3 as confirmed — DERIVE-AND-COPY, no column.** **2251 pass / 0 fail**, **181 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (36 = 36)**; `schema.ts` has no `rental_code` (pinned).

## §4 What was built
- `validation.ts`: `createCoursePackage.rental: recordBookingRental.optional()` — the session rental's own shape (known code, trimmed remark ≤ 200); the remark RULE stays the service's.
- `lib/rental-row.ts`: **`courseRentalOf(rows)`** — the first row carrying a rental ⇒ `{ code, remark }`, else `null` (a leave row first does not hide it — pinned).
- `scheduler.service.ts` `createCoursePackage`: the remark rule refused BEFORE the transaction, beside the discount (the same `rentalRemarkRequired`) · **the rental pass AFTER the flip loop, over the FINAL live rows** (`inArray(status, COURSE_LIVE_STATUSES)` — the make-ups exist, the leave rows are `SICK_LEAVE` and get none), each row `paid_at = now`, `paid_actor` / `created_by` = actor · **ONE post after the transaction, beside the course sale: `void recordRental({ code, hours: size, refId: courseId, actor }).catch(console.error("[rental] NOT POSTED — course …"))`** — no discount; the `.catch` is the one line the course sale does not need (`recordSale` returns `ok: false`, `recordRental` throws), same place, same best-effort, same effect · the returned course DTO derives its rental from the rows it just loaded.
- `reconcileCoursePlan`: ONE read of the course's rental rows; **the copy onto each appended make-up uses the COURSE's rental, not the template's** (the template is the leave row being replaced, which carries none); the copied row **inherits** `paid_at` / `paid_actor` / `created_by`; **no post** (pinned: `recordRental`/`recordSale` absent from the reconcile).
- `coursesByIds`: **`courseRentalsByCourse(ids)`** — ONE query (rentals joined to their bookings, filtered by course) spread on as `courseRental`; `toCourseWithStudent` gains `rental: c.courseRental ?? courseRentalOf(c.bookings ?? [])` — the list's grouped read first, the loaded rows second, `null` otherwise.

## §5 Pinned (`lib/whole-course-rental-req091.test.ts`, 18 tests)
- **The DoD counts, simulated with the REAL helpers** (`plannedRowCount`, `makeupsToFlip`, `COURSE_LIVE_STATUSES`): size 4 + 1 absence ⇒ 5 rows, **4 paid rentals — the make-up has one, the leave row none — 1 post** · size 10 ⇒ 10 · all-absent size 4 ⇒ 8 rows, the four make-ups paid · no `rental` ⇒ zero rows, zero posts.
- `courseRentalOf` with a leave row first · the remark rule is the one function · the validator's shape · the course DTO from the grouped read / the rows / null.
- **Source:** the rule before the transaction · the rental pass after the flip loop with the live filter and the stamps · the post after the transaction, `hours: input.size`, `refId: result.course.id`, exactly one `recordRental` in the create, no `discount` on its line, the `.catch` + log · the reconcile's one read, the course-not-template source, the inherited stamps, no post, the copy per appended row · 36 = 36 and no column · the list's grouped read · **the resume path inserts through `insertBooking` and carries no rental (said, not built)** · the route through the root app (with `rental` ⇒ the service gets it with the actor; without ⇒ no key; unknown code ⇒ 400, service never called).

## §6 🔑 Mutation — eleven, `finally`, checksum — all bite
A the rental pass moved BEFORE the flip loop · B `hours: 1` · C the post moved INSIDE the transaction · D the course's discount on the rental line · E the reconcile copies from the template · F the copied row born unpaid · G the reconcile posts per make-up (2 fail) · H the pass includes `SICK_LEAVE` rows · I the remark rule skipped on the course door · J `courseRentalOf` reads the first row, not the first WITH a rental (2 fail) · K the course DTO ignores the grouped read. Every restore byte-identical.

## §7 ❓ Owner's-list answer (from §3): a drop posts NO reversal today (tuition or rental) — manual backoffice adjustment; the rental's one line follows the same non-path. Nothing built.
📌 **Contract line for @Fern:** `POST /courses` accepts `rental?: { code, remark? }` (same codes, same remark rule ⇒ `400 RENTAL_REMARK_REQUIRED`); the response's `course.rental: { code, remark } | null` and every session's `rental: { code, remark, paid: true }`; `GET /courses` rows carry `rental` too; a later make-up arrives already paid; a session rental on a rented course ⇒ `409 RENTAL_EXISTS`.
