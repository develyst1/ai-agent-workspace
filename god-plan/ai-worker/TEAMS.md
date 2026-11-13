# TEAMS — who is on which team (read this first, every session)

Names are the operator's — filled from DESK-OPEN B1. A row with an empty name is a seat not yet opened.

> **State-free.** Names, handles, inboxes, session names and ID prefixes only — never status
> (that is `board.md`). One charter per role: the SA reads `SA-Lead.md`, the FE `FE.md`, the BE
> `BE.md`. **Your name, your team, your inbox and your ID prefix are here and nowhere else** —
> every other file in this folder speaks of roles ("the PM", "the SA"), never of people.
>
> **One team, one tester (MARIE.md ORDER 57, owner via Atom 2026-11-08 00:27: *"อนุมัติ God Plan ทีมเดียว Porter PM,
> Sober SA, Jason BE, Fern FE, Tanya QA"*).** No `-B` seats. Models: `DECISIONS.md`.

> ⚠️ **Keep "Role · team" in ONE cell, separated by ` · `.** `scripts/memory/extract-day.mjs`,
> `session-desk.mjs` and `ring-after-handoff.mjs` read only rows whose second cell has a `·` —
> split into two columns and every one of them reports "no roster rows found" (measured
> 2026-10-21; this template shipped split until then).

| Name | Role · team | Handle | Inbox | Session name | Writes IDs |
|---|---|---|---|---|---|
| Porter | PM · all | `@Porter` | `inbox/PM.md` | `Porter-GP` | `REQ-NNN` |
| Tanya | QA · A | `@Tanya` | `inbox/QA.md` | `Tanya-GP` | `TEST-NNN` |
| Sober | SA · A | `@Sober` | `inbox/SA.md` | `Sober-GP` | `SPEC-NNN`, `TASK-NNN` |
| Jason | BE · A | `@Jason` | `inbox/BE.md` | `Jason-GP` | — (works on `TASK-*`) |
| Fern | FE · A | `@Fern` | `inbox/FE.md` | `Fern-GP` | — (works on `TASK-*`) |

One team. Desk short code **GP**. Filled 2026-11-08 by Marie from ORDER 57 (owner via Atom to Atlas).
