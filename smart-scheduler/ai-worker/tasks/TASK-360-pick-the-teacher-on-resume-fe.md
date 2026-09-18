# TASK-360 — Pick the teacher on resume: dropped course AND paused booking — FE (`REQ-089 item 8`)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-16)
**Contract:** @Jason's TASK-359 (BE DONE, 2133/0) — copied here verbatim from his message, not re-transcribed:
> `POST /courses/:id/resume { startDate, startTime, teacherId? }` · `POST /bookings/:id/resume { date, startTime, teacherId? }` — one optional field, nothing else moves. ABSENT ⇒ today byte for byte (course: its FIRST session's teacher; booking: its own). PRESENT ⇒ that teacher on every row the resume writes, and the clash names THAT teacher. Refusals are the create path's own (`{status, code, message}`): `400 VALIDATION` unknown/archived/not-on-that-weekday/freelance-no-budget · `409 SLOT_TAKEN` naming the CHOSEN teacher. 🔴 **The server has NO teacher↔subject rule — the picker filters by the course's subject as the create picker does; the server will not catch a wrong one.**
**Size M.** ⛔ **Chain stopped.** Ships with TASK-359.

---

## §1 Two doors, one picker
- **Course resume** — `DropResumeDialog.tsx` (`mode: "resume"`, `useResumeCourse`): add a teacher `Select` beside the re-plan's date/time. **Default = the course's current teacher (what the server does when absent); pre-selected, so "keep the teacher" is zero taps.** Options = teachers who teach the course's subject, the create picker's own filter (`BookingModal.tsx:757` `bookableOnDate` + subject) — **reuse that data path, do not write a second filter.**
- **Booking resume** — `BookingModal.tsx` (`useResumeBooking`, `:301–307`): the same `Select`, default = the booking's teacher, options filtered by the booking's subject.
- Send `teacherId` **only when it differs from the default** — so the absent path (BE's byte-for-byte promise) is what an unchanged picker exercises; assert this.
- `TeacherOption`/`teacherSelectData` are the existing renderers — use them; the label follows `lang` as everywhere.

## §2 What the admin sees when refused
The BE's `message` is Thai (`ไม่พบครู` etc.) and `SLOT_TAKEN` names the chosen teacher — **show the server's message as the other refusals on these dialogs do**; no client-side invention.

## §3 Not this task
🚫 Changing a teacher on a course that is not paused/dropped · 🚫 telling the old teacher (item 7's family) · 🚫 the create picker itself.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] Both dialogs: default pre-selected = current teacher; changed ⇒ `teacherId` in the body; unchanged ⇒ NO `teacherId` key (asserted on the request shape, both doors)
- [ ] Options filtered by the course's/booking's subject via the existing filter — asserted, and the filter has ONE source
- [ ] Both languages; no PLACEHOLDER beyond the one new label (`teacher` exists already — check before adding a key)
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ The course-resume default is the FIRST session's teacher (server, `rows[0]`), not the last — a reassigned-then-dropped course defaults back to the original. Does the dialog have the LAST session's teacher in hand to show as the default instead (a client default the server never sees when unchanged)? **Say what the dialog knows; build nothing.** @Jason's list item is the BE side of the same question.

---

## §4 ✅ IMPLEMENTED — Fern, 2026-09-16. **One picker, both doors; default = the current teacher; `teacherId` on the wire only when it changed.**

```
bunx tsc --noEmit → exit 0
bun test          →  341 pass / 0 fail   (was 330; +11 — one new file, resume-teacher.test.ts)
bun run build     → ok
git status        →  6 modified (DropResumeDialog · PlanModal · BookingModal · useScheduler · scheduler.service ·
                     scheduler.mock.service) · 2 new (lib/scheduler/resume-teacher.ts · .test.ts)
```
🚫 The create picker untouched · no change to a teacher on a live course · nobody told · no new dictionary key
(`booking.teacher` and `course.pickTeacher` already existed and are reused, both languages).

### `§1` — one function, two dialogs
**`lib/scheduler/resume-teacher.ts`** — the whole rule, 40 lines:
- `resumeTeacherOptions(teachers, currentId, date, subject)` = teachers **`bookableOnDate(tc, date)`** (the create
  picker's own predicate, imported from `work-days.ts`, not re-derived — asserted: no `workDays`/`dayjs` in the
  helper) **AND `teachesSubject`** (the teacher's own `subjectOptions` by id for a course row; by NAME for a booking,
  which carries the subject name, not its id — the same lists the create picker's subject dropdown reads) —
  **plus the CURRENT teacher, always.** *Why always:* the default is "keep" and sends nothing, so the current
  teacher must be pickable even if they are off that weekday, inactive, or (a reassigned course) not teaching the
  subject; a `Select` fed a value not in its list renders blank — TASK-353's class — and blank here would read
  "no teacher". Value-asserted with five fixture teachers (same subject · other subject · off Saturday · not
  bookable · current), by id and by name, with and without a date.
- `resumeTeacherIdToSend(picked, current)` = `picked` only when it differs; else `undefined`.
- **The services spread it conditionally** — `...(input.teacherId ? { teacherId } : {})` on BOTH bodies — so an
  unchanged picker sends a body with **no `teacherId` key at all**, exercising the server's absent path (its
  byte-for-byte promise). Asserted on both services (and that neither has a bare `teacherId: input.teacherId`
  property, which would send `undefined`); mutation 2 fails.
📌 *Honest note on "the create picker's own subject filter":* the create picker has no teachers-by-subject filter —
it picks the teacher FIRST and offers that teacher's subjects. What is reused is its two parts: `bookableOnDate`
and the teacher's `subjectOptions`. That composition now exists exactly once, here, and both dialogs call it —
asserted by absence (neither dialog's resume region contains `teachers.filter`, `subjectOptions` or
`bookableOnDate`); mutation 5 (a second filter in the course dialog) fails.

**Course resume (`DropResumeDialog`)** — two new props from `PlanModal`, read off the SAME row as the slot
(`courseSlot`, the first non-extra session — TASK-288/292's row): `courseTeacherId`, `courseSubject`. The `Select`
sits under the date/time pair on the resume face only; `value` seeded to `courseTeacherId` and **re-seeded on
every open** (TASK-288 §1's lesson — the plan may load after mount); `allowDeselect={false}` so it cannot go blank;
`TeacherOption`/`teacherSelectData` render it, label follows `lang` as everywhere. The body: `teacherId:
resumeTeacherIdToSend(teacherId, courseTeacherId)`.
**Booking resume (`BookingModal` → `ViewBooking`)** — the same `Select` under the date/time; seeded to
`booking.teacherId`, re-seeded when the menu item opens the dialog; options by `{ name: booking.subject }`; the body
likewise. Both doors asserted on source; mutations 1 and 6 (always sending) fail.

### `§2` — refusals
Unchanged on both doors: the server's `message` shown verbatim (`resumeError` on the booking dialog, `setError` on
the course dialog) — asserted still there. Nothing client-side names a refusal.

### 🔑 Break-and-watch — six mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the helper always sends the picked id | **1 fail** |
| 2 | the service sends a bare `teacherId: input.teacherId` (⇒ `undefined` on the wire) | **1 fail** |
| 3 | the current teacher no longer force-included | **2 fail** |
| 4 | the subject ignored (only `bookable`) | **3 fail** |
| 5 | the course dialog grows its own `teachers.filter` | **2 fail** |
| 6 | the booking dialog sends the teacher unconditionally | **1 fail** |
Each mutation wrapped in `try { write; run } finally { restore }`; `md5` of all four files identical before and after.

### Definition of Done
- [x] **341 / 0** · `tsc` 0 · build ok
- [x] Both dialogs: default pre-selected = current teacher; changed ⇒ `teacherId` in the body; unchanged ⇒ NO key —
      asserted on the request shape (services) and at both call sites
- [x] Options filtered by the course's/booking's subject via ONE function that reuses the create picker's parts —
      asserted (value tests + absence of a second filter)
- [x] Both languages, no new key — `booking.teacher` / `course.pickTeacher` reused
- [x] 🔑 Break-and-watch — six, `finally`, checksum

### ⚠️ Not seen on a screen
The `Select` inside the two modals (portal'd combobox over a modal) — the same component/props the create picker
uses, so the shape is known; but the list contents on a REAL course (a reassigned course, an inactive teacher)
are what QA should look at: the current teacher greyed-or-not at the top, and the clash sentence naming the
CHOSEN teacher after a change.

## Question — **does the dialog have the LAST session's teacher in hand?** ⚠️ owner's list, nothing built
**Yes — and I chose not to use it, for a reason that is the answer.** `PlanModal` holds every session row of the
plan with its `teacher` (and `status`, cancelled rows included), so *"the last course row's teacher"* is one
expression away (`sessions.filter(non-extra).at(-1)?.teacher`). **But the picker's default must be the teacher the
server will use when nothing is sent — and that is `rows[0]`, the first.** If the dialog showed the LAST session's
teacher as its default and the admin left it, the unchanged picker would send nothing and the server would write
the FIRST — the screen would promise one teacher and the rows would get another, silently. The only honest ways
to default to "last" are (a) the dialog SENDS it (the present path, always — losing the byte-for-byte absent path
the contract offers), or (b) @Jason's side of the question: the server defaults to the last live row. **(b) is the
right fix if the owner wants "last"; (a) is the client-side workaround that makes the absent path dead.** The
dialog today shows exactly what the server does — `courseSlot.teacher`, the first non-extra row — which is
consistent, and wrong in the same way the server is for a reassigned-then-dropped course. 🚫 Named, nothing built.
