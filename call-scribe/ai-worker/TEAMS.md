# TEAMS — who is on which team (read this first, every session)

Names are the operator's — filled from DESK-OPEN B1. A row with an empty name is a seat not yet opened.

> **State-free.** Names, handles, inboxes, session names and ID prefixes only — never status
> (that is `board.md`). One charter per role: the SA reads `SA-Lead.md`, the FE `FE.md`, the BE
> `BE.md`. **Your name, your team, your inbox and your ID prefix are here and nowhere else** —
> every other file in this folder speaks of roles ("the PM", "the SA"), never of people.
>
> **Two engineer teams and two testers (MARIE.md ORDER 56, owner via Atom 2026-11-06 12:41: *"ทีมเอาเหมือนเดิมเลย มีสอง
> ทีม SA แล้วก็ Tester สองคน"*).** Corner-chat's shape: Team A's inboxes have no suffix, Team B's end in `-B`. The PM
> serves both teams; each team has its own tester. One charter per role serves both teams: the SA reads `SA-Lead.md`,
> the BE `BE.md`, the FE `FE.md`, the testers `QA.md`.
>
> **Repo split (Atlas's design; the PM still claims areas on the board, `board.md` → `## Batch claims`):** Team A owns
> `call-scribe-back` and `call-scribe-front`. Team B starts in `develyst-ai` (an audio/transcription endpoint the app
> can call), then joins call-scribe work by batch claims. **Two teams are never in the same files.**
>
> **IDs:** both teams share ONE `SPEC-NNN` / `TASK-NNN` sequence, and both testers ONE `TEST-NNN` sequence, with no team
> letter. **Every sequence starts at 101** (`checks.json` → `ids.start`), so citations in `develyst-ai`'s code never
> collide with that repo's old desk IDs (REQ-001…).

> ⚠️ **Keep "Role · team" in ONE cell, separated by ` · `.** `scripts/memory/extract-day.mjs`,
> `session-desk.mjs` and `ring-after-handoff.mjs` read only rows whose second cell has a `·` —
> split into two columns and every one of them reports "no roster rows found" (measured
> 2026-10-21; this template shipped split until then).

| Name | Role · team | Handle | Inbox | Session name | Writes IDs |
|---|---|---|---|---|---|
| Porter | PM · all | `@Porter` | `inbox/PM.md` | `Porter-CSC` | `REQ-NNN` |
| Tanya | QA · A | `@Tanya` | `inbox/QA.md` | `Tanya-CSC` | `TEST-NNN` (shared sequence) |
| Tefany | QA · B | `@Tefany` | `inbox/QA-B.md` | `Tefany-CSC` | `TEST-NNN` (shared sequence) |
| Sober | SA · A | `@Sober` | `inbox/SA.md` | `Sober-CSC` | `SPEC-NNN`, `TASK-NNN` (shared sequence) |
| Jason | BE · A | `@Jason` | `inbox/BE.md` | `Jason-CSC` | — (works on `TASK-*`) |
| Fern | FE · A | `@Fern` | `inbox/FE.md` | `Fern-CSC` | — (works on `TASK-*`) |
| Silver | SA · B | `@Silver` | `inbox/SA-B.md` | `Silver-CSC` | `SPEC-NNN`, `TASK-NNN` (shared sequence) |
| Bob | BE · B | `@Bob` | `inbox/BE-B.md` | `Bob-CSC` | — (works on `TASK-*`) |
| Fanta | FE · B | `@Fanta` | `inbox/FE-B.md` | `Fanta-CSC` | — (works on `TASK-*`) |

Two teams (A, B). Desk short code **CSC**. Filled 2026-11-06 by Marie from ORDER 56 (owner via Atom to Atlas).
