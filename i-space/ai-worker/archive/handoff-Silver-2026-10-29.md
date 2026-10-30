# Hand-off — Silver (SA, Team B / CAW) — 2026-10-29 ~15:00 (refreshed; replaces the ~14:30 note)

Written on Atom's owner-delegated order, before the session restarts. A **pointer page**: the facts live in the files it names.
Path chosen by the author `[SA-decided]` (no desk standard for hand-offs).

## Done (closed in their files)

| Item | State | Where |
|---|---|---|
| REQ-101 / REQ-102 / REQ-107 | DELIVERED | `maps/caw.md`, `maps/caw-gap-102.md`, `maps/caw-wake-107.md` |
| REQ-104 live CLI view | Team B SPEC_DONE → QA (TEST-105) | SPEC-103 DONE; TASK-105/106/111/112 DONE |
| **REQ-105 CAW reads the latest spec** (session 2, 14:24–14:56) | **Team B designed; TASKs cut, ON HOLD** | `specs/SPEC-107-caw-reads-latest-spec.md`; `tasks/TASK-114-…`, `TASK-115-…` (Bob), `TASK-116-…` (Fanta) |
| REQ-105 Q1 (unknown push event) | answered: CAW rejects it today (run: 400); TASK-115 accepts it on the same URL — no contract change | REQ-105 § Questions |
| REQ-105 Q2 / Q3 | answered by the PM and folded in: the "spec เปลี่ยน" flag only shows, never stops a card (SPEC-107 D7); Q3 wordings as written | SPEC-107 D7, TASK-114 step 5, TASK-116 steps 2/4 |

## Open — what the next Silver session does

1. **REQ-111 READY_FOR_SA + REQ-112 Q1 (CAW card context)** — the PM's line is left **undrained** in `inbox/SA-B.md`.
   Read `requirements/REQ-111-caw-workers-can-work-in-their-folder.md` and REQ-112 § Questions. Order the topics before cutting:
   REQ-111 touches TASK-112's files (`read-guard.ts`, `hop.ts`, `settings.ts`), REQ-105's TASK-114 touches `cards/service.ts`
   (card context). Per ORDER 42, every TASK depends on the previous topic's **commit hash**, not on DONE.
2. **Release REQ-105's TASKs** when both are true: REQ-104 is committed in caw-back **and** caw-front (owner's own "ขึ้น git", relayed
   by the PM), **and** the PM says go. Then fill `Depends on: REQ-104 committed (<hash>)` in TASK-114/115/116, write "released" in the
   status lines, and send pointers to `inbox/BE-B.md` (TASK-114 first, then 115) and later `inbox/FE-B.md` (TASK-116). **Engineers have
   not been told about these TASKs yet.**
3. REQ-104 → QA (TEST-105); defects come back via the PM. Follow-up flagged to the PM: old e2e scripts `src/runner/e2e/{auto,down-up,run}.ts`
   need `live-view.ts`'s run root.
4. **Git:** nothing committed. REQ-104's code is still uncommitted in caw-back (24 paths) and caw-front (18 paths).

## Rules that changed today (re-read them; ORDER 42, 14:20)

- Create SPEC/TASK files **only** with `node ai-worker/new-id.mjs <SPEC|TASK> <slug>` (run from `i-space/`).
- Every shape-change section of a SPEC carries `Consumers: <grep> → <hits>`.
- `SPEC_DONE` only after a `## AC check` table at the end of the REQ.
- Next topic in the same repo: `Depends on: <topic> committed (<hash>)`.
- My F-017 (NEW): broke the first two before re-reading `SA-Lead.md`. Lesson: re-read the charter when Marie's inbox line says a rule changed.

## Machine facts that bit

- `caw-back/.env` holds the owner's TEST `DATABASE_URL` + `CAW_WORKSPACE_ROOT`: run with `--no-env-file` or `env -u …`; never print the URL.
- `kill <shell pid>` leaves `bun` listening; stop by the bun pid from `ss -ltnp` (`lsof` is absent).
- `pgrep claude` counts the team's own sessions; count runner children with `pgrep -fc 'output-format [s]tream-json'`.
- ListAgents finds no peers; ring = a line in `inbox/PM.md` / `inbox/WAKE.md`. Each inbox `>>` and `drain-inbox.mjs` as its own command.

## Nothing left running

No API, runner, test server or `claude` child from this session (:4531 free, checked 14:2x). The inbox watcher ended at 14:56 and was not re-armed.
