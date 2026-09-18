# TASK-359 — Pick the teacher on resume: dropped course AND paused booking (`REQ-089 item 8`) — BE, CONTRACT FIRST

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-16)
**Source:** `REQ-089 §0 item 8` — *"เลือกครูตอนกลับมาเรียนทั้งคอร์สที่ดร็อปไว้และ pause booking"*; owner `§2`: **yes — the teacher is fixed today; on resume the admin picks.**
**Size M.** ⛔ **Chain stopped.** 📜 **Contract to @Fern through me BEFORE the code** (TASK-354's shape) — the FE half is a separate task after your contract.

---

## §1 The prior fact
Both doors take the teacher from the past: `resumeCourse` — `rows[0]?.teacherId` (`scheduler.service.ts:4093`); `resumeBooking` — `current.teacherId` (`:3793`, the clash message included). Neither validator (`validation.ts:678`, `:700`) has a teacher field. The owner's "fixed today" is exact.

## §2 The contract (write it first; the shape, yours to refine)
- **`POST /courses/:id/resume { startDate, startTime, teacherId? }`** and **`POST /bookings/:id/resume { date, startTime, teacherId? }`** — **OPTIONAL; absent ⇒ today's behaviour, byte for byte** (the FE ships later; nothing breaks in between; assert the absent path against today's pins, untouched).
- Present ⇒ the resumed sessions are created with THAT teacher; the clash message names THAT teacher; the audit/notification payload carries the new teacher.
- **Refusals are CODES:** teacher unknown/inactive · **teacher does not teach the course's subject** (the create path's rule — reuse its check, one source; name it) · same code shapes the create uses.
- 🚫 **Not this task:** telling the OLD or NEW teacher by LINE (that is item 7's family — name it on the list); changing the teacher of a course that is NOT paused/dropped (a different verb).
- ❓ The parent's `booking_resumed` / course-resumed notification — does it print the teacher today? If yes, it must print the NEW one (an output-shaped check); if no, say so and change nothing.

## Definition of Done
- [ ] **Contract in `inbox/SA.md` FIRST**, then build
- [ ] Suite, **count** · tsc (`bunx --package typescript@5.6.3 tsc --noEmit`) · **35 = 35** (no migration expected — `teacherId` is already on every booking)
- [ ] Pinned: absent ⇒ old teacher (both doors) · present ⇒ new teacher on every created/updated row · subject-mismatch refused by code · clash names the chosen teacher
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ A course whose sessions were taught by TWO teachers before the pause (the picker takes `rows[0]`) — which one is "today's teacher"? Say what `rows[0]` is ordered by. Build nothing.

---

# 📜 THE CONTRACT — @Jason → @Sober, for @Fern, BEFORE the code (2026-09-16)

**Two existing admin routes gain ONE optional field. Nothing else on either body moves.**
| route | body |
|---|---|
| `POST /api/courses/:id/resume` | `{ startDate, startTime, teacherId? }` |
| `POST /api/bookings/:id/resume` | `{ date, startTime, teacherId? }` |
**`teacherId?`** — a teacher's UUID, the same value the create modal already sends. 🔑 **ABSENT ⇒ today, byte for byte:** the course resumes on its FIRST session's teacher, the booking on its own `teacherId` — every existing pin untouched. **PRESENT ⇒ that teacher on every row the resume writes** (every re-planned course session; the one paused booking), **and the clash message names THAT teacher.**

## Refusals — the CREATE path's own, reused, one source
⚠️ **Honest first: the admin API is not codes-only like `/register`; it is `{ status, code, message }`, and I am not changing that convention here.** The shapes are the create path's exact shapes:
| refusal | status · code | source |
|---|---|---|
| teacher unknown | `400 VALIDATION` · `ไม่พบครู` | **`assertTeacherBookable`** — the ONE guard `insertBooking` runs on every create |
| teacher archived | `400 VALIDATION` · `ครู<nick> ถูกปิดการใช้งานแล้ว` | same |
| teacher does not work that weekday | `400 VALIDATION` · `ครู<nick> ไม่มาสอนวันนี้` | same — 📌 *for a course resume this is checked per created session, exactly as create does* |
| freelance teacher with no budget | `400 VALIDATION` · `ครู<nick> ยังไม่ได้ตั้งงบ …` | same |
| slot clash | `409 SLOT_TAKEN` · **names the CHOSEN teacher** | `describeSlotClash(chosenTeacherId, …)` for the booking; the course's per-date message as today |
| not paused / not dropped | unchanged | unchanged |
🔴 **THE SUBJECT RULE — a finding, not a choice:** ***the create path has NO server-side "teacher teaches this subject" check.*** `insertBooking` runs `assertTeacherBookable` (exists · not archived · works that day · budget) and nothing about `teacher_subjects`; that table feeds the admin's LISTS, and the FE's teacher picker is what filters by subject today. ⇒ **"reuse the create path's check, one source" means: there is no such check to reuse, and I will not add one to the resume door alone — that would be a rule the create door does not have.** 📌 *If you want the rule server-side, it goes into `insertBooking` for EVERY door — a separate decision, and I would want it, but it is not item 8.* **For @Fern: the resume picker filters by the course's subject exactly as the create picker does; the server will not catch a wrong one.**

## What the resume already SENDS, and what a picked teacher does to it
- `POST /bookings/:id/resume` **already sends `booking_resumed` to the BOOKING'S teacher** (read from the row AFTER the update). With a picked teacher the row's teacher IS the new one ⇒ **the existing send goes to the NEW teacher; the OLD teacher is told nothing.** 🚫 **I am adding no send** — the existing one follows the row, which is the only coherent reading (*"the paused class is back on YOUR schedule"* to a teacher whose schedule it left would be false). ⚠️ **Telling the OLD teacher is item 7's family — on the list, not here.**
- `POST /courses/:id/resume` **sends nothing today** and will send nothing.
- ❓ **Does either message print the teacher? NO.** `ob_resumed` is `{student} · {date} {time}` — no teacher field — so there is no output to change, and I change none.

## Not this task
🚫 LINE to the old or new teacher (item 7) · 🚫 changing the teacher of a course that is NOT paused/dropped (a different verb) · 🚫 a server-side subject rule (see above; every door or none).

---

# 📤 REPORT — @Jason → @Sober (2026-09-16)

✅ **DONE (code).** **2133 pass / 0 fail**, **173 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (35 = 35)** — `teacherId` was already on every booking. **Contract sent first.** Changed: two validators (one optional field each), two writers (`resumeBooking`, `resumeCourse`), two pins rewritten. New: one test file.

## §1 🔑 The shape — one derivation per door, and ABSENT is the SAME expression as before
- **Booking:** `const teacherId = input.teacherId ?? current.teacherId;` — written to the row, and handed to `describeSlotClash` so the clash names the CHOSEN teacher. ⚠️ **The absent path is not a branch; it is the same expression evaluating to `current.teacherId`** — the old write, byte for byte. Asserted that `teacherId: current.teacherId` no longer appears anywhere in the function (there is one derivation, not two).
- **Course:** `const teacherId = input.teacherId ?? rows[0]?.teacherId ?? null;` — every `insertBooking` in the re-plan loop uses it; asserted that the loop has exactly ONE `teacherId` (no per-session override, no second source).

## §2 🔑 Refusals — the create path's OWN guard, reused; nothing invented
- **Booking door:** a PICKED teacher that differs runs **`assertTeacherBookable(tx, input.teacherId, input.date)`** — the ONE guard `insertBooking` runs on every create (exists · not archived · works that weekday · freelance budget) — BEFORE the update. Absent ⇒ nothing new runs. Asserted, and the resume contains no `ไม่พบครู` of its own.
- **Course door:** nothing added — `insertBooking` already runs `assertTeacherBookable` per created session, so the chosen teacher is guarded per date exactly as create is. Asserted that `resumeCourse` contains no `assertTeacherBookable(` of its own.
- **Clash:** `409 SLOT_TAKEN` naming the chosen teacher (booking); the course's per-date message unchanged.

## §3 🔴 THE FINDING, asserted: the create path has NO server-side teacher↔subject rule
`insertBooking`'s only teacher guard is `assertTeacherBookable`, which never reads `teacher_subjects`; **every `teacherSubjects` read in the service is a `with:` list join or the teacher editor's own writes** — asserted line by line. ⇒ **I invented no subject rule on either resume door** (mutation E — a resume-only subject check — FAILS the test). 📌 **On the list, sized: if the owner wants it server-side, it is one check in `insertBooking` for EVERY door — a separate decision, and I would want it.** *For @Fern: the resume picker filters by subject as the create picker does; the server will not catch a wrong one — today, on create, either.*

## §4 📌 What the resume already sends, and what a pick does to it
`resumeBooking` **already sends `booking_resumed` to the booking's teacher, read from the row AFTER the update** — asserted (the update precedes the send; still exactly one `enqueueLine`). ⇒ **with a pick, the existing send goes to the NEW teacher; the OLD teacher is told nothing.** No send was added. `resumeCourse` sends nothing, asserted. ❓ **Neither message prints a teacher** — `ob_resumed` is `{student} · {date} {time}`, asserted — so no output changed.

## §5 🔻 Pins — two rewritten
`booking-pause`'s AC-14 clash pin (`describeSlotClash(current.teacherId…)` → the derived `teacherId`, claim unchanged: the EXISTING refusal, one clash rule) · `course-expiry-edit`'s signature pin (the body gained `teacherId?`; the actor beside it untouched).

## §6 🔑 Mutation — six, `finally`, checksum — all bite
the pick ignored on the booking · the clash names the old teacher · the guard skipped · the course ignores the pick · a resume-only subject rule appears · **`teacherId` made REQUIRED (the absent path breaks the FE that ships later).** 🔻 *My first F was a bad mutation — a duplicate key in the zod object literal, where the later optional one wins — it passed and proved nothing; rewritten to replace `.optional()` and it fails.*

## §7 ❓ YOUR QUESTION — a course taught by TWO teachers before the pause: which is "today's teacher"?
🔑 **`rows` comes from `loadCourseForEnd`, ordered `asc(date), asc(startTime)` ⇒ `rows[0]` is the course's FIRST session ever** — asserted. **So "today's teacher" on a course resume is the teacher who taught the EARLIEST session, not the latest.** ⚠️ If a course changed hands (TASK-094's reassign) and was then dropped, the absent-path resume hands it BACK to the original teacher. **Not changed here** — item 8 says the admin picks, and now they can — 📌 **but for the list: the FE's default in the picker should probably be the LAST session's teacher (`rows.at(-1)`), not the first, so "keep the same teacher" means the one the family last had.** One-line change on the BE if the owner says so (`rows.at(-1)?.teacherId`), and it would move the absent path — which is why it is a decision, not a task.
