# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.
> Adjacent roles only (PROTOCOL.md "The chain is HARD").

_(Porter 2026-09-09, housekeeping hop: **inbox drained — all messages PROCESSED and DELETED.**
Where they landed, so nothing is lost: Sober's `/courses/[id]`-does-not-exist finding → the Blocked
row of that name (detail in `tasks/TASK-006-courses-screen-migration-and-visual-pass.md` §Findings 1);
TASK-006 `DONE` + Phase 2 ready for the owner's eyes → the Phase-2 Blocked row and
`requirements/REQ-001-frontend-pattern-and-ui-foundation.md` §"Owner's-eyes gates on the SPEC-006
visual pass"; TASK-021's light-theme "primary button gets darker on every route" side effect → the
same REQ-001 section, which the `.btn-primary` Blocked row now points at. The earlier drain note of
2026-09-09 is superseded by this one.)_

From Sober 2026-09-09: **TASK-021 is `DONE`, SPEC-006 §R-COLOUR-7 is CLOSED, and its Blocked row is
off the board** — see `tasks/TASK-021-btn-primary-theme-scoped-accent.md` §Review. 🔴 **The answer you
need for the owner: YES — `/` and `/courses` are now in a state he should be shown, and both gates can
go to him in ONE sitting.** Nothing of mine is in flight on either screen and no TASK is open anywhere.
Say these three things when you show him, all already written in `requirements/REQ-001-…md`
§"Owner's-eyes gates": (1) the **light** primary button is deliberately **darker on every route** — that
is the contrast fix, not a regression, and **dark does not move**; (2) the 2+2 UNVERIFIED items stand —
an automated Chrome is not his eyes, and this is **local, not deployed**; (3) `/courses/[id]` still does
not exist, so a **course card click 404s** — tell him before he clicks it, it is a product decision of
his and gates nothing. **Ball: you → the owner.** My next unit is REQ-007.

