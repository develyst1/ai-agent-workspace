# SPEC-062: Scoped course cleanup tool — remove one test course + its bookings (REQ-057)

- Source: REQ-057 (owner lifted his 08-22 delete-hold 2026-08-23; ranked #1). Target: student `Test` / parent
  `SOM Team` (0924912848) — one Skateboard IMPORT course + its bookings, sitting among 137 real students on `uat`.
- Author: Sober (SA) 2026-08-23
- Status: READY — TASK-177 cut. **Owner-run, dry-run-first, explicit id only.** Building is harmless; *running against
  `uat`* stays a separate owner decision (his 08-22 "จนกว่าเขาจะแจ้ง" is about running, not building).

## Q1 — the FK graph, grounded (not Porter's guessed list)

The only references to a booking / course, from `schema.ts`:
- `bookings.courseId → coursePackages` is **`onDelete: set null`** (`:326`). 🔴 **So deleting the course row does NOT
  delete its bookings — it orphans them (courseId → null).** The tool must **explicitly delete the bookings first**,
  then the course. A naive "delete the course" leaves live-looking orphan bookings.
- `booking_badges.bookingId → bookings` is **cascade** (`:522`) — badges go automatically when the bookings go.
- `notification_outbox.bookingId → bookings` is **set null** (`:410`) — outbox rows survive as audit with a null
  bookingId. Left as-is (kept, not deleted).
- `checkinToken` / `checkinTokenExpiresAt` are **columns on `bookings`** (`:364-366`), not a table — they go with
  the row.
- Nothing else references a booking or a course. Vouchers are unrelated (the target has none).

⇒ **Blast radius = the course's bookings (explicit DELETE `WHERE course_id = <id>`, which cascades booking_badges
and set-nulls outbox) + the `coursePackages` row.** In one transaction, explicit DELETE per table in that order —
never TRUNCATE CASCADE, same discipline as `db:reset`.

## Q2 — "money/quota moved" IS cheaply detectable — but NOT via `usedSessions`

Refuse (before any delete, even with `--commit`) if the target shows real life — each a cheap query:
- **any booking of the course has status `ATTENDED`** (real attendance in our system);
- **a posted sale** — `bo.movement` with `refType='SALE'` and `refId ∈ {course.id, its booking ids}` (`sale-post`
  writes `refId`); the Test course is `source=IMPORT` so has none, which is exactly what makes it safe to remove;
- **the parent is LINE-linked** (`parents.line_user_id` not null) — a real family;
- **the parent has more than one student** — not a fabricated single-child test household.

🔴 **Do NOT refuse on `usedSessions > 0`.** For an IMPORT course that field is the **import-time prior-taught count**
(REQ-064), not attendance in our system — the Test course has `usedSessions = 4` and **must remain deletable**.
Refusing on it would make the tool unable to do its one job. Refuse on **`ATTENDED` bookings**, which is the real
"a session actually happened here" signal.

These checks correctly separate the fabricated `Test` household (IMPORT, future sessions, single child, no
attendance, no sale, unlinked) from every real family (SALE / attended / linked / multi-child).

## The tool (TASK-177)

`scripts/cleanup-course.ts` → `course:cleanup`, house pattern (`db:reset` family):
- **`--course <id>` required — an explicit id, NEVER a predicate.** No `--name`, no LIKE. A pattern against a live
  roster is the failure this tool is bought to prevent (req 1).
- **Dry-run by default.** Load the course, its student, its parent, and **every booking with its date**; run the
  refusal checks; **print the blast radius BY NAME** — student, parent, course, and each booking as
  `25/8, 1/9, 8/9, 15/9` (req 2) — then ROLLBACK. Console only, on the owner's own terminal (his data, his machine);
  **never written to a tracked file.** `--commit` performs the deletes in one transaction.
- **Refuse, not warn** (req 3): any check above trips ⇒ stop with the reason named, **even with `--commit`.** "A
  refusal he must deliberately override beats a prompt he will click."
- **Never touch** `subjects`, `teachers`, `bo.item`, other courses, other bookings, or anything not reachable from
  the given course id (req 4). No DDL; schema + all migration ledgers untouched.
- **Student + parent STAY by default** (req 3 / AC-2). Optional `--remove-household` also removes the parent + its
  single student **only under strict guards** (parent has exactly this one student, that student has no other
  course/booking/voucher, parent not LINE-linked) — Porter's "remove SOM Team too" lean, made safe. It is a
  **runtime choice**, so it does not block the cut; default is course-only.

## Acceptance mapping
- **AC-1** dry-run prints per-item counts, writes nothing ⇐ dry-run rollback.
- **AC-2** `--commit`: exactly that course + its bookings gone; **student, parent, other courses/bookings untouched**
  (verify by count) ⇐ explicit scoped deletes, household kept by default.
- **AC-3 / AC-8** refuses (with reason) on a course with an `ATTENDED` session / posted sale / linked parent /
  multi-child parent, even with `--commit` ⇐ the Q2 checks.
- **AC-4** re-run after commit deletes 0 and says so ⇐ the id no longer resolves.
- **AC-5** schema + both ledgers untouched ⇐ no DDL, `db:reset`'s guarantee.
- **AC-9** dry-run lists the student/parent/course + each booking by date.
- **AC-10** post-commit counts drop by exactly the dry-run's numbers.

## Owner decision (runtime, does NOT block the cut)
Remove parent `SOM Team` too, or student + course only? Default = course only; `--remove-household` (guarded) does
both. Owner chooses at run time.
