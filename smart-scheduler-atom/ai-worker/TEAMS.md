# TEAMS — who is on which team (read this first, every session)

Names are the operator's — filled from DESK-OPEN B1. A row with an empty name is a seat not yet opened.

> **Seeded 2026-10-26 by Marie** (`MARIE.md` ORDER 35 item 2): the fork desk `smart-scheduler-atom` has the same
> eight people and roles as `smart-scheduler` (`../smart-scheduler/ai-worker/TEAMS.md`); only the session names
> differ (`<Name>-SOMA`). **Role and team share one cell (`PM · all`) on purpose:** `scripts/memory/extract-day.mjs`,
> `scripts/memory/session-desk.mjs` and `scripts/hooks/ring-after-handoff.mjs` read a roster row only in that shape.
> Two teams share one SPEC/TASK sequence (`PROTOCOL.md` → "Artifact numbering", from 5000); Team A's inboxes are the unsuffixed ones.

> **State-free.** Names, handles, inboxes, session names and ID prefixes only — never status
> (that is `board.md`). One charter per role: the SA reads `SA-Lead.md` (Team B: `SA-Lead-B.md`), the FE
> `FE.md` (`FE-B.md`), the BE `BE.md` (`BE-B.md`). **Your name, your team, your inbox and your ID prefix are
> here and nowhere else.**

| Name | Role · team | Handle | Inbox | Session name | Writes IDs |
|---|---|---|---|---|---|
| Porter | PM · all | `@Porter` | `inbox/PM.md` | `Porter-SOMA` | `REQ-NNNN` (from 5000) |
| Tanya | QA · all | `@Tanya` | `inbox/QA.md` | `Tanya-SOMA` | `TEST-NNNN` (from 5000) |
| Sober | SA · A | `@Sober` | `inbox/SA.md` | `Sober-SOMA` | `SPEC-NNNN`, `TASK-NNNN` (from 5000) |
| Fern | FE · A | `@Fern` | `inbox/FE.md` | `Fern-SOMA` | — (works on `TASK-*`) |
| Jason | BE · A | `@Jason` | `inbox/BE.md` | `Jason-SOMA` | — (works on `TASK-*`) |
| Silver | SA · B | `@Silver` | `inbox/SA-B.md` | `Silver-SOMA` | `SPEC-NNNN`, `TASK-NNNN` (from 5000) |
| Fanta | FE · B | `@Fanta` | `inbox/FE-B.md` | `Fanta-SOMA` | — (works on `TASK-*`) |
| Bob | BE · B | `@Bob` | `inbox/BE-B.md` | `Bob-SOMA` | — (works on `TASK-*`) |
