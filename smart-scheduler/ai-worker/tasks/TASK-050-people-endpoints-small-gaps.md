# TASK-050: scheduling (BE) — two small people-endpoint gaps (parent `note`, demographics on student-create)
- Source: SPEC-016 (REQ-019 follow-up)
- Status: TODO — **LOW priority.** Do this only when the queue is clear; it must **not** jump ahead of
  REQ-020 Stage 2 or REQ-013.
- Depends on: TASK-048 (DONE)
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why (both surfaced during TASK-049's review — neither is urgent)
1. **Parent `note` is uneditable.** `parents.note` exists in the schema, and the People screen is meant to be
   where staff manage the record — but `POST/PATCH /parents` accept only phone/name/province, so the field can
   never be set. (**This was my spec error**, not Fern's: TASK-049 listed a note field that TASK-048's contract
   never provided. Fern correctly omitted it rather than inventing an endpoint.)
2. **A new student's demographics need a second write.** `POST /parents/:id/students` takes only
   name/nickname/note, so the FE does **create → `PATCH /students/:id`** to set gender/DOB/nationality. It works
   and is invisible to users, but a failure between the two leaves a student with no demographics (recoverable
   by editing).

## What to do
- Accept **`note`** on `POST /parents` and `PATCH /parents/:id` (validation + service + DTO). Nothing else about
  the parent endpoints changes.
- Accept the optional demographics (**`gender`, `birthDate`, `nationality`**) on `POST /parents/:id/students`,
  so a student can be created complete in one call. Keep `PATCH /students/:id` exactly as-is — the FE will drop
  its follow-up PATCH, but the endpoint stays for edits.
- Keep everything else untouched: no new columns (all four already exist), no migration, no change to the
  suspend gate or the search behaviour.

## Definition of Done
- [ ] A parent's `note` can be set on create and edit and round-trips through `GET /parents`.
- [ ] `POST /parents/:id/students` accepts optional `gender` / `birthDate` / `nationality` and persists them in
      **one** call; omitting them still works exactly as today.
- [ ] No migration; suspend enforcement, search, and the embedded-students shape are unchanged.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.
- [ ] Tell @Fern (via me) once it lands so the FE can drop the extra PATCH and add the note field — that's a
      separate small FE follow-up, not part of this task.

## Implementation Notes
(Jason fills in.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- Low priority by design — if anything higher-value is waiting, do that first and leave this.

## Review
(Sober fills at REVIEW.)
