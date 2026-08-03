# TASK-102: scheduler-front (FE) — the Settings screen (the load-bearing half of REQ-031)
- Source: SPEC-029 §3 (REQ-031)
- Status: BLOCKED (on TASK-101)
- Depends on: TASK-101 (`GET/PUT /api/settings`)
- Assignee: @Fern (smart-scheduler-front)

## What to build
A staff Settings page (scheduler-front :3016) — because *"in the database" is not "easy to change"*: the screen is
what makes REQ-031 real (no SQL, no deploy).

- List each configurable rule from `GET /api/settings`: **label · current value · default · overridden?**.
- **Edit** a value with validation (show the **unit** — days vs minutes; reject out-of-bounds inline, matching the
  server's `parse`), then `PUT /api/settings/:key`. On a server 400, show the reason (never silently accept).
- **Reset to default** per rule (clear the override).
- Make it obvious when a value is the coded **default** vs a live **override**.

At go-live the list has two rows (teacher-change notice, check-in window); the page must render whatever
`GET /api/settings` returns, so a third rule appears with no FE change.

## Definition of Done
- [ ] A staff user changes the teacher-change notice to 5 days and REQ-030 enforces it with no deploy (AC).
- [ ] Editing the check-in window changes behaviour; reset-to-default restores the coded value.
- [ ] A rejected value shows the server's reason; default vs override is visually clear.
- [ ] The page renders from the API list (a new rule needs no FE change).
- [ ] tsc clean; build ok. Measure any shared-row inputs at 1600/1280/768/375 (board STANDING RULE).
