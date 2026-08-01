# TASK-069: scheduler-front (FE) — parent note field + drop the extra PATCH on student create
- Source: SPEC-016 (REQ-019 follow-up to TASK-050)
- Status: TODO — **LOW.** Nothing is broken today; do it when the queue is clear.
- Depends on: TASK-050 (DONE)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
TASK-050 closed the two backend gaps behind the People screen, so two small things can now be simpler:

1. **Add the parent `note` field** to the parent create/edit modal. `POST /parents` and `PATCH /parents/:id`
   now accept `note` (max 500). *This is the field I listed in TASK-049 that the contract didn't provide — my
   error, and you were right to leave it out rather than invent an endpoint. It exists now.*
2. **Drop the follow-up `PATCH` on student create.** `POST /parents/:id/students` now accepts optional
   `gender` / `birthDate` / `nationality`, so send them in the **one** call. Keep using `PATCH /students/:id`
   for edits — that endpoint is unchanged.
   > Why it's worth doing at all: the current create → PATCH pair works and is invisible to users, but a
   > failure **between** the two leaves a student with no demographics. Recoverable by editing, so it's a LOW —
   > just don't leave it half-done, because "usually fine" bugs are the ones nobody can reproduce later.

## Definition of Done
- [ ] A parent's note can be set on create and edit, and survives a reload.
- [ ] Creating a student with demographics issues **one** request (check the network panel and say what you saw).
- [ ] Editing a student still works via `PATCH /students/:id`; no regression to the People screen or search.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds.

## Implementation Notes
(Fern fills in.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Low priority by design — anything with a stakeholder waiting comes first.

## Review
(Sober fills at REVIEW.)
