# PLUGINS — the plugin layer of this workspace

> Owned by **Prox** (`PROX.md`). One row per bundle, plus an install log. A change is written here
> the moment it happens, not at session end. Absolute paths never appear in this file; a real
> machine path lives in `machine.local.md` only.

## Bundles

| bundle | version | patch row | source (workspace-relative) | provides | status | revert |
|---|---|---|---|---|---|---|
| `@local/dsh-workforce` | 0.2.0 | `dsh-workforce` | `workforce-console/` | sidebar panel **Workforce**, main page `workforce`, tool `workforce_status`, route `GET/POST /api/workforce/status` (send to a Claude session · drop a REQUEST for a DeepSeek seat) | installed · applied | remove the bundle (`remove_bundle`), then reinstall the previous version |

### `@local/dsh-workforce` — what it is

The first Prox artifact: a read-only lens on the workforce.

- **Host half** (`index.js`): builds a snapshot of the workspace — desks that contain
  `ai-worker/board.md` (board size, last log date), live Claude Code sessions from
  `claude agents --json`, and the workspace seats (ATLAS, Marie, Otto, Bunny, ISO, PokerVault)
  with their pending `REQUEST-*.md` counts. Served at `/api/workforce/status` and exposed as the
  `workforce_status` tool. The snapshot is cached for 3 s.
- **Client half** (`client.js`): registers the `Workforce` icon in `sidebar.panellist` (id
  `workforce`) and the page in the `main` slot (key `workforce`). Plain JS + React from the
  browser module table; no build step.

### Actions (v0.2.0)

- **Click a Claude session** → composer → `Send` runs one headless `claude -p` turn that calls
  `SendMessage` to that session. Delivered ≠ read; the result line is the relay's own report.
- **Click a workspace seat** (ISO, PokerVault) → composer → `Drop REQUEST` writes
  `REQUEST-prox-console-<date>-<seat>-<slug>.md` at the workspace root. Waking that seat is the
  seat's own watcher/owner step, not Prox's.

### Known limits (v0.2.0)

- **Sending costs one small Claude turn** per message (the relay is a headless `claude -p`); a
  REQUEST costs nothing and depends on the seat's watcher to wake it.
- **The page is not a transcript.** It shows the relay's delivery report, not the session's chat;
  the real conversation stays in that session's own window.
- **Two workspace roots exist on this Mac.** The snapshot prefers the root the live Claude
  sessions run in; workspace seats are unioned across the candidate roots, so a seat living in
  another copy still appears. Desk counts differ by root — see the install log entry of
  2026-11-09.
- **After a reinstall, reload the page** if the panel or icon does not reappear; the client
  module is loaded at page boot.
- **Rendered page is not visually verified by Prox from the agent side.** The slot registration
  and the data route are verified; the pixels are the owner's check.

## Install log

| date | action | bundle | version | evidence |
|---|---|---|---|---|
| 2026-11-09 | install | `@local/dsh-workforce` | 0.1.0 | `install_bundle` → `application: applied`; `workforce_status` returned 11 live Claude sessions; `/api/workforce/status` answered HTTP 200; `sidebar.panellist` occupants included `workforce`, `main` occupants included `workforce` |
| 2026-11-10 | upgrade | `@local/dsh-workforce` | 0.2.0 | auto-refresh 15 s; POST route switched from a resource (GET-only) to a raw handler; unknown target/seat return 400; `Send` relay and REQUEST drop implemented |
| 2026-11-09 | root fix ×2 | `@local/dsh-workforce` | 0.1.0 | first snapshot read the harness profile directory; second preferred the live-session root (`Work`), showing 4 desks; seats unioned across both roots so ISO and PokerVault appear with their pending REQUEST counts |

## Next (not built)

- Click a seat → open its conversation; send through `SendMessage` (Claude) or write a
  `REQUEST-*.md` and wake (DeepSeek).
- "Who holds the ball" from the board's owner column, refreshed with the gate's JSON.
- A conductor loop that nudges only when work is waiting and the seat is idle.
