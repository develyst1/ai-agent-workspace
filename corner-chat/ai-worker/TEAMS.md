# TEAMS — who is on which team (read this first, every session)

Names are the operator's — filled from DESK-OPEN B1. A row with an empty name is a seat not yet opened.

> **State-free.** Names, handles, inboxes, session names and ID prefixes only — never status
> (that is `board.md`). One charter per role: the SA reads `SA-Lead.md`, the FE `FE.md`, the BE
> `BE.md`. **Your name, your team, your inbox and your ID prefix are here and nowhere else** —
> every other file in this folder speaks of roles ("the PM", "the SA"), never of people.
>
> **Two engineer teams and two testers, sharing BOTH repos (MARIE.md ORDER 48, owner 2026-11-01:
> *"น่าจะต้องมีทีม engineer สองทีม เทสเตอร์สองคน"* · *"ทำไมจะทำrepo ด้วยกันไม่ได้ smart scheduler
> ยังทำได้เลย TESTER tefany"*).** Same shape as smart-scheduler's `TEAMS.md`: Team A's inboxes have no
> suffix, Team B's end in `-B`. The PM serves both teams; each team has its own tester. Both teams work
> in `corner-chat-back` and `corner-chat-front`; **the PM claims a file area per team on the board
> (`board.md` → `## Batch claims`) before either team starts** — never two teams in the same files.
> One charter per role serves both teams: the SA reads `SA-Lead.md`, the BE `BE.md`, the FE `FE.md`,
> the testers `QA.md`.
>
> **IDs:** both teams share ONE `SPEC-NNN` / `TASK-NNN` sequence, and both testers ONE `TEST-NNN`
> sequence (as smart-scheduler) — no team letter.

> ⚠️ **Keep "Role · team" in ONE cell, separated by ` · `.** `scripts/memory/extract-day.mjs`,
> `session-desk.mjs` and `ring-after-handoff.mjs` read only rows whose second cell has a `·` —
> split into two columns and every one of them reports "no roster rows found" (measured
> 2026-10-21; this template shipped split until then).

| Name | Role · team | Handle | Inbox | Session name | Writes IDs |
|---|---|---|---|---|---|
| Porter | PM · all | `@Porter` | `inbox/PM.md` | `Porter-CC` | `REQ-NNN` |
| Tanya | QA · A | `@Tanya` | `inbox/QA.md` | `Tanya-CC` | `TEST-NNN` (shared sequence) |
| Tefany | QA · B | `@Tefany` | `inbox/QA-B.md` | `Tefany-CC` | `TEST-NNN` (shared sequence) |
| Sober | SA · A | `@Sober` | `inbox/SA.md` | `Sober-CC` | `SPEC-NNN`, `TASK-NNN` (shared sequence) |
| Jason | BE · A | `@Jason` | `inbox/BE.md` | `Jason-CC` | — (works on `TASK-*`) |
| Fern | FE · A | `@Fern` | `inbox/FE.md` | `Fern-CC` | — (works on `TASK-*`) |
| Silver | SA · B | `@Silver` | `inbox/SA-B.md` | `Silver-CC` | `SPEC-NNN`, `TASK-NNN` (shared sequence) |
| Bob | BE · B | `@Bob` | `inbox/BE-B.md` | `Bob-CC` | — (works on `TASK-*`) |
| Fanta | FE · B | `@Fanta` | `inbox/FE-B.md` | `Fanta-CC` | — (works on `TASK-*`) |

Two teams (A, B), both in both repos. Desk short code **CC**. Filled 2026-11-01 by Marie from ORDER 48
(owner to Atlas).
