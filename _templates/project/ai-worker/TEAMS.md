# TEAMS — who is on which team (read this first, every session)

Names are the operator's — filled from DESK-OPEN B1. A row with an empty name is a seat not yet opened.

> **State-free.** Names, handles, inboxes, session names and ID prefixes only — never status
> (that is `board.md`). One charter per role: the SA reads `SA-Lead.md`, the FE `FE.md`, the BE
> `BE.md`. **Your name, your team, your inbox and your ID prefix are here and nowhere else** —
> every other file in this folder speaks of roles ("the PM", "the SA"), never of people.
>
> 🔧 More than one team: add an SA/FE/BE row per team (`A`, `B`, …), use team inboxes
> (`inbox/SA-A.md`) and team-prefixed IDs (`SPEC-A-NNN`, `TASK-A-NNN`). Delete the row of a
> role this desk does not have, together with its charter and inbox.

> ⚠️ **Keep "Role · team" in ONE cell, separated by ` · `.** `scripts/memory/extract-day.mjs`,
> `session-desk.mjs` and `ring-after-handoff.mjs` read only rows whose second cell has a `·` —
> split into two columns and every one of them reports "no roster rows found" (measured
> 2026-10-21; this template shipped split until then).

| Name | Role · team | Handle | Inbox | Session name | Writes IDs |
|---|---|---|---|---|---|
|  | PM · all | `@<Name>` | `inbox/PM.md` | `<Name>-<desk short name>` | `REQ-NNN` |
|  | QA · all | `@<Name>` | `inbox/QA.md` | `<Name>-<desk short name>` | `TEST-NNN` |
|  | SA · A | `@<Name>` | `inbox/SA.md` | `<Name>-<desk short name>` | `SPEC-NNN`, `TASK-NNN` |
|  | FE · A | `@<Name>` | `inbox/FE.md` | `<Name>-<desk short name>` | — (works on `TASK-*`) |
|  | BE · A | `@<Name>` | `inbox/BE.md` | `<Name>-<desk short name>` | — (works on `TASK-*`) |

## Chain — who hands work to whom on this desk

One line per link, `<Name> ↔ <Name>`, with `owner` for the human. Work and messages move **only along these
lines**, in both directions. The owner's console draws this chain and lights the link a message is travelling on.

The default, when this section is missing, comes from the roster above:
- `owner ↔ PM`;
- `PM ↔ QA`;
- `PM ↔ SA` of each team;
- each team's `SA ↔` its own `BE` and `FE`.

Write the section only where this desk differs (a desk without QA, an extra link the owner approved, …), and keep it
in step with the roster. Like the rest of this file, it is **state-free**: it holds links, never who is busy.

```chain
owner ↔ <PM name>
<PM name> ↔ <QA name>
<PM name> ↔ <SA name>
<SA name> ↔ <BE name>
<SA name> ↔ <FE name>
```
