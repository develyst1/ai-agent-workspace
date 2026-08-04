# REQ-036: End a course early — course-level cancel / early termination / refund (the flow per-session cancel deliberately is NOT)

- Status: DRAFT (backlog — POST-GO-LIVE; parked, not scheduled)
- Priority: LOW (does not block the 2026-08-20 go-live)
- Requested: 2026-08-03 — surfaced by Sober while scoping REQ-030's cancel rules; captured by Porter so it isn't lost
- Depends on: REQ-030 (course = editable plan) shipping first

## Problem / Goal
REQ-030 unified all per-session cancels to **re-owe** (a cancel is a *reschedule*; `current` returns to `size`;
only `NO_SHOW` consumes). Correct — but it means a per-session cancel can **never shrink a course**. So today there
is **no path at all** to *end or shorten a course early*: a family that quits mid-course, a refund, a mistaken
enrolment. Sober confirmed by code search — no `cancelCourse` / `terminate` / `refund` exists.

This REQ owns that **separate, course-level flow** — deliberately distinct from per-session cancel (owner's line:
"quitting a course is a separate flow"). It is the intended home for early termination + any refund/credit handling.

## Requirement (to refine when scheduled — this is a capture, not a spec)
1. A **course-level "end early / cancel course"** action: stop the remaining plan, cancel the outstanding LIVE
   sessions **without** re-owing makeups (the one place shrinking below `size` is intended).
2. Decide the **money treatment** — refund, credit/voucher, or none — and how it posts (backoffice movement, item
   model). Business call; route to owner when scheduled.
3. Interaction with the freelance ceiling — cancelled future sessions **release** their holds (already the releasing
   behaviour); confirm no makeup is appended in this flow.
4. Who may do it + audit (reason, actor, timestamp), consistent with the attended-cancel audit (REQ-030 / TASK-105).

## Out of Scope (lives elsewhere)
- Per-session cancel / reschedule / makeup — that is REQ-030 (re-owe, keep `size`).
- Forfeit of a single session — that is `NO_SHOW` (consume), already decided.

## Notes
- Explicitly **post-go-live**. Parked as DRAFT so the gap is on the board, not in memory. Sober offered to draft the
  full spec when Porter/owner green-light scheduling it.
- **Strengthened by the TASK-105 ceiling-edge (2026-08-04):** cancelling a session of a course already at `MAX_WEEK`
  is refused `EXTENSION_CEILING` (the re-owe makeup can't fit) — today's only escape is admin `override`. That refusal
  is a symptom of having no early-termination path: a course that genuinely needs to end/shrink has nowhere to go but
  a cancel that tries to re-owe. This REQ is that path. (Interim: Sober is clarifying the misleading "extension"
  wording on the cancel message; the real fix is here.)
