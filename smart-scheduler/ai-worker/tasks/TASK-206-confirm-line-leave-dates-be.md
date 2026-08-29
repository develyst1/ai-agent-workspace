# TASK-206: The course-confirm LINE must send leave DATES, not a count (REQ-072 part 2 fix) (scheduler-back)

- Source: Porter (owner, 2026-08-28) — the owner asked *"ลาล่วงหน้าวันไหนบ้าง"* (which days), the message sends a
  number. 🟠 **Do first — small, and it closes part 2.** On `develop`. No schema.
- Status: ✅ **BE code DONE (Sober 2026-08-28)** — sends `plannedLeaveDates` (the days), rendered-string tested (dates not tally). tsc 0·872/0. 🔴 on-phone render UNVERIFIED until owner/Porter look when deployed (Tanya fixture had no LINE link → SKIPPED).
- Repo: **smart-scheduler-back**.

## The defect (corrects TASK-201)
`confirmCourse`'s summary payload (`scheduler.service.ts:2842`) carries
`plannedLeaves: rows.filter(r => r.status === "SICK_LEAVE").length` — a **count**. The teacher reads "2 planned leaves"
and does not know **which days** — the exact thing that makes the schedule they just confirmed wrong on the days it
matters. (The other four fields are correct; Jason's `attendeeNote`-not-`course.note` catch stands.)

## Fix
- Send the **dates** of the SICK_LEAVE sessions — `rows.filter(SICK_LEAVE).map(r => r.date)` (sorted) — and render them
  in the LINE template as a short dated list, not a tally. Update the `course_confirmed` template + `line-i18n` so the
  planned-leave line reads the days. **Absent ⇒ the line is omitted** (a "no leaves" line reads as a problem), same as
  today's zero-suppression.
- Keep everything else (one message per course, teacher recipient, outbox==1) exactly as TASK-201 shipped.

## DoD — the OUTCOME (the message a human reads)
- [ ] The confirm LINE lists the **actual leave dates**, not a number; a course with leaves on 14 & 28 Sep shows those
      two dates; a course with none omits the line.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green (assert the rendered message string contains
      the dates, not the count).
- [ ] ⚠️ **No human has seen this message yet** (Tanya's fixture had no LINE link → correctly SKIPPED). When this lands,
      it must be looked at **on a phone** (owner/Porter) the way REQ-067B was — flag for @Porter.

## Notes
(Jason fills in. The unit test asserts the string, per the "verify the outcome, not the field" lesson — a `plannedLeaves`
that is a number would still compile.)

## Implementation Notes
**Files:** `services/scheduler.service.ts` (`plannedLeaveDates`) · `lib/line-message.ts` (the render) ·
`lib/line-i18n.ts` (label) · `lib/line-message.test.ts` (3 tests replacing 2).

`plannedLeaves: <count>` → **`plannedLeaveDates: string[]`**, sorted, rendered as a comma-joined dated list.
The label now names what it carries — *"แจ้งลาล่วงหน้าไว้ (วันที่)"* — because a label that says "leave" over a
list of dates is fine until someone renders a number under it again.

**The tests assert the rendered STRING**, per the lesson: the old `plannedLeaves: 2` compiled perfectly, passed
its test, and was useless to the person reading it. So the new ones check the message **contains 2026-09-14 and
2026-09-28**, that the leave line **matches a date pattern**, and that it does **not** end in a bare tally. A
field-level assertion would have been green either way.

**Zero-suppression kept and widened:** the line is omitted for an empty array **and** for a payload that never
carried the field at all (an older outbox row queued before this deploy renders without crashing) — there is a
test for the missing-field case specifically, because that is the one a deploy actually produces.

Everything else from TASK-201 is untouched: one message per course, teacher recipient, `outbox == 1`.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **872 pass / 0 fail**. No
migration.

### 👀 @Porter — nobody has read this message yet
Tanya's fixture had no LINE link, so the row was correctly SKIPPED and **no human has seen this template on a
phone**. Its shape is now: title · student · program · start · schedule · sessions · **leave dates** · note.
It needs the same real-device look REQ-067B got — the dates line in particular, since a long list is exactly
what wraps badly on a phone. **If the list is long (a course with 4–5 planned leaves), say so and I will
truncate it with a "+N more" rather than let it wrap.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-206 | scheduler-back (BE): **REQ-072 part-2 fix** — the course-confirm LINE must send the leave **DATES**, not a count (owner: *"ลาล่วงหน้าวันไหนบ้าง"*). | SPEC-066 (REQ-072) | 🔎 **REVIEW** (Jason 2026-08-28 — `plannedLeaves: <count>` → **`plannedLeaveDates: string[]`**, sorted, comma-joined; the label now names what it carries (*"(วันที่)"*) so nobody renders a number under it again. **Tests assert the rendered STRING** per the lesson — the old `plannedLeaves: 2` compiled, passed its test, and was useless to the person reading it; the new ones check the message contains **2026-09-14 / 2026-09-28**, that the leave line matches a date pattern, and that it does not end in a bare tally. Zero-suppression kept **and widened** to a payload that never carried the field — an outbox row queued before this deploy still renders (that is the case a deploy actually produces, so it has its own test). One-message-per-course / teacher recipient / outbox==1 untouched. tsc 0 · **872/0**, no migration. 👀 **@Porter: NOBODY has seen this message on a phone yet** (Tanya's fixture had no LINE link → correctly SKIPPED). Needs the REQ-067B treatment — the dates line especially, since a long list is exactly what wraps badly; **if 4–5 leaves make it ugly, say so and I'll truncate with "+N more"**.) | Sober | — |
```
