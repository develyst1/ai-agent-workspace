# TEAMS — who is on which team (read this first, every session)

Names are the operator's — filled from DESK-OPEN B1. A row with an empty name is a seat not yet opened.

> **State-free.** Names, handles, inboxes, session names and ID prefixes only — never status
> (that is `board.md`). One charter per role: the SA reads `SA-Lead.md`, the FE `FE.md`, the BE
> `BE.md`. **Your name, your team, your inbox and your ID prefix are here and nowhere else** —
> every other file in this folder speaks of roles ("the PM", "the SA"), never of people.
>
> If a second team is ever added: add an SA/FE/BE row per team (`A`, `B`, …), use team inboxes
> (`inbox/SA-A.md`) and team-prefixed IDs (`SPEC-A-NNN`, `TASK-A-NNN`). Delete the row of a
> role this desk does not have, together with its charter and inbox.

> ⚠️ **Keep "Role · team" in ONE cell, separated by ` · `.** `scripts/memory/extract-day.mjs`,
> `session-desk.mjs` and `ring-after-handoff.mjs` read only rows whose second cell has a `·` —
> split into two columns and every one of them reports "no roster rows found" (measured
> 2026-10-21; this template shipped split until then).

| Name | Role · team | Handle | Inbox | Session name | Writes IDs |
|---|---|---|---|---|---|
| Porter | PM · all (also BA) | `@Porter` | `inbox/PM.md` | `Porter-BUD` | `REQ-NNN` |
| Tanya | QA · all | `@Tanya` | `inbox/QA.md` | `Tanya-BUD` | `TEST-NNN` |
| Sober | SA · A | `@Sober` | `inbox/SA.md` | `Sober-BUD` | `SPEC-NNN`, `TASK-NNN` |
| Fern | FE · A (also designer) | `@Fern` | `inbox/FE.md` | `Fern-BUD` | — (works on `TASK-*`) |
| Jason | BE · A | `@Jason` | `inbox/BE.md` | `Jason-BUD` | — (works on `TASK-*`; **seat idle until `buddy-screen-back` is cloned**) |

One team (A). Desk short code **BUD**. Filled 2026-10-28 by Marie from ORDER 37 (operator, via Atlas).
