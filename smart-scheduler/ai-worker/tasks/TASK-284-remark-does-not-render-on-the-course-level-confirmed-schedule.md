# TASK-284 — `Remark` does not render on the course-level `CONFIRMED SCHEDULE`, and the limitation I documented is why

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
**Cause:** the owner entered a note, confirmed a course, and got **`Sessions : 6` ✅ · teacher==parent ✅ · no
`Remark`** — while the per-booking `ยืนยันตารางสอน` printed `หมายเหตุ: 23232sssss` **in the same minute.**
📌 **Not a release blocker** — @Porter has told the owner so, and he is right: **nothing is lost, the teacher
still gets the note, and the shop has this behaviour in production today.** ⛔ **First item after `uat`.**
🚫 No migration, no database, no FE change.

---

## §1 🔻 This is the limitation I wrote down and chose not to fix, failing in front of the owner
**TASK-269 §2, mine:** *"`note: rows[0]?.attendeeNote`, rows ordered `asc(date)` ⇒ the earliest session's note…
`setAttendeeNote` edits ONE booking, so after a per-session edit only a note on the EARLIEST session reaches this
message. Known, recorded, and NOT fixed here."*
⇒ **The owner put a note on a booking that was not the earliest.** **The record was accurate and the decision was
wrong** — I optimised for not inventing an answer, and shipped a field that renders nothing on the path a human
actually takes.
📌 **@Porter insisted the check be run with a note PRESENT. A booking without one proved nothing; the first one
with a note found it in a minute.** **That instruction is the reason this is a defect and not a report from the
shop next month.**

## §2 The ruling — **the first non-empty note, in date order**
**Not `rows[0].attendeeNote`. The first row that HAS one.**
- ✅ **On the normal path it is identical:** TASK-178 puts one note at creation onto **every** session, so every
  row carries the same string and "first non-empty" is that string.
- ✅ **On the owner's path it now renders**, which is the whole point.
- ⚠️ **When a course carries DIFFERENT notes, it prints the earliest one.** 🚫 **Do not print several, do not
  join them, do not add "and 2 more".** **A course summary has no true answer to *"which session's note"*, and
  the earliest is at least a rule rather than an accident.** **Write that sentence in the comment.**
🔑 **The difference from `rows[0]` is small and it is the whole defect:** `rows[0]` answers *"the earliest
session's note"*; this answers *"the course's note, if it has one"* — **and only the second is what a reader of
`CONFIRMED SCHEDULE` would take it to mean.**

## §3 What must not change
- 🚫 `ob_f_note` = `Remark`, its position (last), and the omit-empty rule — **a course with no note anywhere still
  prints no line.**
- 🚫 The per-booking `ยืนยันตารางสอน` / `booking_confirmed` — **byte-frozen, owner-verified, and it is the message
  `REQ-007` is satisfied by.** **This task must not touch it.**
- 🚫 `setAttendeeNote`, `attendeeNote` on the booking, the payload's other fields.
- 🚫 No migration, no database, no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] 🔑 **A note on a LATER session renders** — the owner's exact case, asserted
- [ ] **A note on every session renders that string** — the normal path, unchanged
- [ ] **Differing notes print the EARLIEST**, asserted, with the comment saying why it is a rule and not a guess
- [ ] **No note anywhere ⇒ no `Remark` line** — omit-empty still holds
- [ ] 🚫 `booking_confirmed` byte-identical — asserted
- [ ] 🚫 No migration, no database, no FE change

## Question
**Is `rows[0]?.x` used for any OTHER field on that payload?** `teacherId`, `subjectId` and `student` are read the
same way in `confirmCourse`. 📌 *For a course those are genuinely uniform, and the note was the one field that
is not* — **but I assumed that rather than checking it.** **Name any other field where the rows can differ; fix
none of them here.**
