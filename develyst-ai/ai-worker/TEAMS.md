# TEAMS — who is on which team (read this first, every session)

Names are the operator's — filled from DESK-OPEN B1. A row with an empty name is a seat not yet opened.

> **Seeded 2026-10-21 by this desk's PM** (`MARIE.md` ORDER 29.1) by transcribing the team table in this desk's
> `PROTOCOL.md` — no name here is new. Rows for roles this desk does not have are left out. **Role and team share
> one cell (`PM · all`) on purpose:** `scripts/memory/extract-day.mjs`, `scripts/memory/session-desk.mjs` and
> `scripts/hooks/ring-after-handoff.mjs` read a roster row only in that shape; the template's separate Role and
> Team columns read as zero rows. An empty Session name means this desk's files do not record it.

> **State-free.** Names, handles, inboxes, session names and ID prefixes only — never status
> (that is `board.md`). One charter per role: the SA reads `SA-Lead.md`, the FE `FE.md`, the BE
> `BE.md`. **Your name, your team, your inbox and your ID prefix are here and nowhere else** —
> every other file in this folder speaks of roles ("the PM", "the SA"), never of people.
>
> 🔧 More than one team: add an SA/FE/BE row per team (`A`, `B`, …), use team inboxes
> (`inbox/SA-A.md`) and team-prefixed IDs (`SPEC-A-NNN`, `TASK-A-NNN`). Delete the row of a
> role this desk does not have, together with its charter and inbox.

| Name | Role · team | Handle | Inbox | Session name | Writes IDs |
|---|---|---|---|---|---|
| Porter | PM · all | `@Porter` | `inbox/PM.md` |  | `REQ-NNN` |
| Sober | SA · A | `@Sober` | `inbox/SA.md` |  | `SPEC-NNN`, `TASK-NNN` |
| Jason | BE · A | `@Jason` | `inbox/BE.md` |  | — (works on `TASK-*`) |
