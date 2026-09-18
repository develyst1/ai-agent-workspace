# TASK-364 — Hard delete a student with NO history (`REQ-089 item 3`) — BE, contract first

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-16)
**Source:** `REQ-089 §0 item 3` + owner `§2`: **DELETE only for a student with NO history (no course, booking, voucher); one with history stays suspend-only. Hard delete, admin only, confirm step.** Reason: linking parents by LINE produced wrongly-created students.
**Size S–M.** ⛔ Chain stopped. Ships in the item 8 + 1 + 3 round. **@Fern builds the FE (TASK-365) in parallel against the contract below — confirm or correct it in `inbox/SA.md` BEFORE you build; a correction reaches her through me.**

---

## §1 The prior facts (verify)
- `api.ts:41` — *"Nothing is ever deleted; suspend is the off switch."* This task is the first exception; rewrite that comment to say so and why.
- `students` is referenced by `bookings` (`schema.ts:314`), `course_packages` (`:374`), `vouchers` (`:390`) — all `onDelete: "restrict"`. **The database already refuses a delete with history; the service must refuse it FIRST with a code, and the FK is the backstop, not the message.** Say whether anything else points at a student (sales `refId` strings, `bo_movement`, LINE tables, import audit) — a row that names a deleted id by string is orphan text, not an FK; list it if it exists.
- "No history" = **zero rows in those three tables for this student, in ANY status** (a cancelled booking is history; a suspended student with zero rows is deletable — suspension is not history). 🚫 No "soft delete" column; no migration expected (**35 = 35**).

## §2 The contract (proposed; confirm/correct first)
**`DELETE /students/:id`** (staff, behind the JWT guard like the other people routes) ⇒
- `200 { deleted: true }` — the row is gone; the parent's child count drops; `assertCanAddStudent` sees the freed slot.
- `409 STUDENT_HAS_HISTORY` `{ status, code, message }` — with the counts in the message (Thai, the admin convention): `มีประวัติ: คอร์ส n · คาบ n · บัตร n — ระงับแทน`; the FE shows the sentence.
- `404` unknown.
- **Atomic, in one transaction: count → refuse or delete.** A booking created between the count and the delete is the FK's job — `23505`-style: map the restrict error to the same `409` so the message is never a raw DB error.
- 🚫 No LINE message to anyone; no rich-menu change (the family's LINE link is the PARENT's, untouched). ❓ **Audit — what does the product keep when the row is gone?** If nothing, say so; a one-line server log with actor + student name is the minimum I'd want; not a table.

## Definition of Done
- [ ] **Contract confirmed in `inbox/SA.md` FIRST**
- [ ] Suite, **count** · tsc · **35 = 35**
- [ ] Pinned: zero-history ⇒ deleted, parent's count drops · one cancelled booking ⇒ `409` with counts · suspended + zero rows ⇒ deleted · the FK error is mapped, never raw
- [ ] `api.ts:41` comment rewritten
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ A student created by the LINE flow (`createStudentFromLine`) and deleted by the admin — the parent's LINE chat still "knows" the child by name in past messages, and the parent can add them again from `/register`. Is there any state on the LINE side (a session, a cached child list) that would show the deleted name? Name it; build nothing.

---

## §3 📋 CONTRACT — verified against the tree, CONFIRMED with three corrections (@Jason, 2026-09-16, before building)

**Confirmed as proposed:** `DELETE /students/:id` under the JWT guard in the people block · `200 { deleted: true }` · `409 STUDENT_HAS_HISTORY` `{ error: { code, message } }` with the Thai sentence `มีประวัติ: คอร์ส n · คาบ n · บัตร n — ระงับแทน` (the envelope shape is the app's, `error.code` / `error.message`, same as every other refusal the FE already reads) · `404 NOT_FOUND` · history = any row in `course_packages` / `bookings` / `vouchers`, ANY status · one transaction, count → refuse or delete · no LINE message, no rich-menu change · no migration.

🔴 **Correction 1 — the FK backstop is NOT raw today, but it is the WRONG code.** `index.ts` `onError` already maps SQLSTATE `23503` to **`400 VALIDATION "ข้อมูลอ้างอิงไม่ถูกต้อง"`**. So a booking created between the count and the delete would today answer a *400 validation error*, not a 409 and not a raw DB error. The service catches `23503` on the delete itself, re-counts OUTSIDE the aborted transaction, and throws the same `409 STUDENT_HAS_HISTORY` with the same sentence — so the race path and the count path are one envelope. *(A transaction does not lock inserts into `bookings`; the FK is the true guard, the count is the message.)*

🔴 **Correction 2 — "suspended + zero rows ⇒ deletable" is about the FAMILY, not the student.** `students` has NO suspend column; suspension is `parents.suspendedAt`, and `suspendedStudentIds` derives from the parent. So *"one with history stays suspend-only"* means the admin suspends the household. The delete ignores the parent's suspension entirely (a child of a suspended family with zero rows is deletable), and **a walk-in student with `parentId = null` is deletable the same way** — the rule is the three counts, nothing else. @Fern's button needs no suspend-state condition.

🔻 **Correction 3 — `api.ts:41` is rewritten, and the sentence stays true for everything but this one route:** *"Nothing is ever deleted; suspend is the off switch — EXCEPT a student with no history (TASK-364, REQ-089 item 3): a wrongly-created child from the LINE link has nothing to keep, and suspending the family for it would punish the parent."*

**What else points at a student — checked, nothing by FK beyond the three:**
| where | what | after delete |
|---|---|---|
| `bo_movement.ref_id` | a BOOKING id string (`refType` BOOKING / BOOKING_REVERSAL) | never a student — n/a |
| `notification_outbox.payload` | `studentName` text in the admin's `student_registered` notice and in reminders | **orphan text, kept** — a sent notice keeps saying the name; it is a log line, not a link |
| `line_link_sessions.draft` | the parent's UNCONFIRMED wizard draft (name / birthDate / province), 30-minute life | not a child list; no student id — nothing to show |
| LINE postback `studentId` (leave flow) | filtered against the parent's LIVE eligible rows | a deleted id filters to nothing — the existing "no class" reply |
| `students.line_user_id` | the Option C column, nullable | dies with the row |
| `course_expiry_changes`, `booking_teachers`, `booking_badges` | cascade from courses/bookings | cannot exist — the counts are zero |
No sales table names a student. `parents.line_user_id` / `family_line_links` are the PARENT's — untouched, as the task says.

**Audit — what the product keeps when the row is gone: nothing in a table.** One server log line, `student deleted: <id> "<name>" parent=<parentId|walk-in> by <actor sub>`, actor from the token like the other people routes. Not a table — a wrongly-created student is the case, and a table for it would be a soft delete by another name.

🚫 **Not adding:** `details: { courses, bookings, vouchers }` on the 409 — the sentence is the contract and the FE shows the sentence; the numbers exist only inside it. *One line if you want them.*

▶️ Building now against the above; a correction from you changes the code, not the contract file — I will re-pin.

---

# 📤 REPORT — @Jason → @Sober (2026-09-16)

✅ **DONE (code), against the contract as confirmed in §3.** **2172 pass / 0 fail**, **176 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (35 = 35)**.

## §4 What was built
- `parent.service.ts`: **`studentHistoryRefusal({courses, bookings, vouchers})`** — pure, the rule in one place: `null` when all three are zero, else `conflict("STUDENT_HAS_HISTORY", "มีประวัติ: คอร์ส n · คาบ n · บัตร n — ระงับแทน")`. **`countStudentHistory(id, exec)`** — three `count()`s on `studentId`, NO status filter. **`deleteStudent(id, actor)`** — one `db.transaction`: find (404) → count on `tx` → refuse or `tx.delete(students)`; **`23503` caught in the service, re-counted outside the aborted tx, thrown as the same 409** (fallback: same code, sentence without numbers — never raw, never the `onError` 400); then one `console.info` line `student deleted: <id> "<name>" parent=<id|walk-in> by <actor>`.
- `api.ts`: `.delete("/students/:id")`, actor = `c.get("user")?.sub` (the token). The `:41` comment rewritten: *"…suspend is the off switch — EXCEPT a student with NO history (TASK-364, REQ-089 item 3) … suspending the family for it would punish the parent."*
- 🔑 **The suite caught an omission I had not seen:** TASK-185's enumeration (`course-ended-writes.test.ts`) reads the router and fails on any write route nobody classified — `DELETE /students/:id` failed it by omission, exactly as designed. Classified `unrelated` with the reason: a student with any course row (ended included — no status filter) is refused outright, so an ended course is the thing that makes the delete impossible, never a thing it touches.

## §5 Pinned (`routes/delete-student-req089.route.test.ts`, 11 tests)
- **The rule with values:** {0,0,0} ⇒ `null` · {0,1,0} (one cancelled booking) ⇒ 409 `STUDENT_HAS_HISTORY` `"มีประวัติ: คอร์ส 0 · คาบ 1 · บัตร 0 — ระงับแทน"` · a course alone, a voucher alone, {1,8,1} exact.
- **The route through the ROOT app** (so the body is `onError`'s, what the FE receives): 200 `{ deleted: true }` with the actor **`"dev"` — the token's `sub`** (SKIP_AUTH's default admin), not a body · 409 `{ error: { code, message } }` with the sentence · 404 `NOT_FOUND`.
- **Source:** the three tables counted, `where(eq(table.studentId…))`, no `status` in the count · one transaction, count on `tx`, hard delete, **no `deletedAt`/`suspendedAt` on `students`** · the `23503` catch and re-say, **and `index.ts`'s 23503 → 400 branch untouched** for every other FK · the log line · `assertCanAddStudent` counts live (the freed slot needs no bookkeeping) · the route + the rewritten comment.

## §6 🔑 Mutation — five, `finally`, checksum — all bite
A the rule forgets vouchers (1 fail) · B the count filters bookings to `CONFIRMED` — a cancelled booking stops being history (1) · C the `23503` catch removed (1) · D the count runs on `db` outside the tx (1) · E the route takes `actor` from a body instead of the token (2). Every restore byte-identical.

## §7 ❓ The owner's-list question — the LINE side after a delete: NOTHING cached, built nothing
Checked every LINE reader: **`doMyCourses` / the leave child-picker call `listStudentsOfParent` / `childrenOfLineParent` at reply time** — live rows, no cached child list anywhere. `line_link_sessions.draft` is the parent's own UNCONFIRMED wizard (30-minute life, no student id). **The name survives in exactly two places, both past text:** the parent's own chat history (LINE's, not ours) and `notification_outbox.payload.studentName` in the already-sent `student_registered` admin notice. Re-adding from `/register` makes a NEW row with a new id — nothing links it to the deleted one, which is the right answer for a wrongly-created child.
