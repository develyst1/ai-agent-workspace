# TEAMS — who is on which team (read this first, every session)

Names are the operator's — filled from DESK-OPEN B1. A row with an empty name is a seat not yet opened.

> **State-free.** Names, handles, inboxes, session names and ID prefixes only — never status
> (that is `board.md`). One charter per role: the SA reads `SA-Lead.md`, the FE `FE.md`, the BE
> `BE.md`. **Your name, your team, your inbox and your ID prefix are here and nowhere else** —
> every other file in this folder speaks of roles ("the PM", "the SA"), never of people.
>
> **Two teams, split by product (ORDER 39, owner via Atom 2026-10-29).** Team A = Blueprint
> (`blueprint-back`, `blueprint-front`); Team B = CAW (`caw-back`, `caw-front`). The PM and the QA
> serve both. Team A's inboxes are the unsuffixed ones; Team B's carry `-B`. Same shape as
> smart-scheduler's `TEAMS.md`. Each team's SA reads `SA-Lead.md`, each FE `FE.md`, each BE `BE.md`;
> which repos are yours is in `PROTOCOL.md` § "Repo layout & ownership".
>
> **IDs: both teams share ONE `SPEC-NNN` / `TASK-NNN` sequence, and every new desk number starts
> at 101** (`REQ-101`, `SPEC-101`, `TASK-101`, `TEST-101`). **No team letter in new IDs:** the code
> already cites the old team's `SPEC-A/B/C-NNN` and `TASK-A/B/C-NNN`, so a letter series would
> collide. Why 101: `legacy/README.md`.

> ⚠️ **Keep "Role · team" in ONE cell, separated by ` · `.** `scripts/memory/extract-day.mjs`,
> `session-desk.mjs` and `ring-after-handoff.mjs` read only rows whose second cell has a `·` —
> split into two columns and every one of them reports "no roster rows found" (measured
> 2026-10-21; this template shipped split until then).

| Name | Role · team | Handle | Inbox | Session name | Writes IDs |
|---|---|---|---|---|---|
| Porter | PM · all (also BA) | `@Porter` | `inbox/PM.md` | `Porter-ISP` | `REQ-NNN` (from 101) |
| Tanya | QA · all | `@Tanya` | `inbox/QA.md` | `Tanya-ISP` | `TEST-NNN` (from 101) |
| Sober | SA · A (Blueprint) | `@Sober` | `inbox/SA.md` | `Sober-ISP` | `SPEC-NNN`, `TASK-NNN` (shared sequence, from 101) |
| Jason | BE · A (Blueprint) | `@Jason` | `inbox/BE.md` | `Jason-ISP` | — (works on `TASK-*`) |
| Fern | FE · A (Blueprint) | `@Fern` | `inbox/FE.md` | `Fern-ISP` | — (works on `TASK-*`) |
| Silver | SA · B (CAW) | `@Silver` | `inbox/SA-B.md` | `Silver-ISP` | `SPEC-NNN`, `TASK-NNN` (shared sequence, from 101) |
| Bob | BE · B (CAW) | `@Bob` | `inbox/BE-B.md` | `Bob-ISP` | — (works on `TASK-*`) |
| Fanta | FE · B (CAW) | `@Fanta` | `inbox/FE-B.md` | `Fanta-ISP` | — (works on `TASK-*`) |

Two teams (A = Blueprint, B = CAW). Desk short code **ISP**. Models: PM / SA / QA opus medium, engineers
sonnet medium. Filled 2026-10-29 by Marie from ORDER 39 (operator, via Atom).
