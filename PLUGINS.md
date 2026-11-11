# PLUGINS — the plugin layer of this workspace

> Owned by **Prox** (`PROX.md`). One row per bundle, plus an install log. A change is written here
> the moment it happens, not at session end. Absolute paths never appear in this file; a real
> machine path lives in `machine.local.md` only.

## Bundles

| bundle | version | patch row | source (workspace-relative) | provides | status | revert |
|---|---|---|---|---|---|---|
| `@local/dsh-workforce` | 0.5.3 | `dsh-workforce` | `workforce-console/` | sidebar panel **Workforce**, main page `workforce`, tool `workforce_status` (`compact:true` summary), route `GET/POST /api/workforce/status` (desks with the gate's verdict, rosters with live dots, waiting mail and **click-to-send** chips, PM first · seats from the `## Seats` table · **Send through a locked relay**, one-way tagged · a REQUEST when no session) | installed · applied | remove the bundle (`remove_bundle`), then reinstall the previous version; to keep the bundle and undo only the lock, drop `--permission-mode bypassPermissions --tools SendMessage --strict-mcp-config` from `runClaudePrompt` |

### Seats

The console reads this table, so a new workspace identity is a row here and no code change. Keep it in
step with `PROX.md` and the charters; a row whose charter file is missing still shows, marked missing.

| name | charter | role | engine |
|---|---|---|---|
| Atlas | `ATLAS.md` | architect | claude |
| Marie | `MARIE.md` | operations | claude |
| Otto | `OTTO.md` | platform | claude |
| Bunny | `BUNNY.md` | librarian | claude |
| ISO | `ISO.md` | verifier | deepseek |
| PokerVault | `POKERVAULT.md` | access | deepseek |
| Prox | `PROX.md` | plugin maintainer | deepseek |

### `@local/dsh-workforce` — what it is

The first Prox artifact: a read-only lens on the workforce.

- **Host half** (`index.js`): builds a snapshot of the workspace — desks that contain
  `ai-worker/board.md` (board size, last log date, and the desk's **roster** parsed from its own
  `ai-worker/TEAMS.md`), live Claude Code sessions from `claude agents --json`, and the workspace
  seats (ATLAS, Marie, Otto, Bunny, ISO, PokerVault) with their open `REQUEST-*.md` counts. Served
  at `/api/workforce/status` and exposed as the `workforce_status` tool. The snapshot is cached
  for 3 s.
- **Client half** (`client.js`): registers the `Workforce` icon in `sidebar.panellist` (id
  `workforce`) and the page in the `main` slot (key `workforce`). Plain JS + React from the
  browser module table; no build step.

### Actions (v0.2.0)

- **Click a Claude session** → composer → `Send` runs one headless `claude -p` turn that calls
  `SendMessage` to that session. Delivered ≠ read; the result line is the relay's own report.
- **Click a workspace seat** (ISO, PokerVault) → composer → `Drop REQUEST` writes
  `REQUEST-prox-console-<date>-<seat>-<slug>.md` at the workspace root. Waking that seat is the
  seat's own watcher/owner step, not Prox's.

### The relay (v0.5.2)

- **Why the mode matters.** A console send used to arrive in a desk session marked *"held - waiting for
  approval in that session's terminal … the sender's permission mode differs"*: the desk sessions run in
  **Bypass permissions**, the relay ran in the default mode, and the app holds a message across a mode
  boundary.
- **The lock.** The owner said *"เอา"* (2026-11-12) to running the relay as
  `claude -p --permission-mode bypassPermissions --tools SendMessage --strict-mcp-config`, so the bypass
  session has exactly one available tool and no MCP servers. The prompt travels on **stdin**, because
  `--tools` is variadic and would otherwise swallow a positional prompt.
- **Proof of the lock** (same call the button makes): asked to write `CANARY-should-not-exist.txt` and read
  `PLUGINS.md`, the run answered *"I have no Write or Read tool, so I'm stopping here … The only tool I have
  is SendMessage"*, and the canary file was never created.
- **Proof of delivery:** *"Delivered to SOM-Porter's inbox, and it hasn't been read yet."*
- **Revert:** drop those three flags from `runClaudePrompt`; the relay returns to the default mode and its
  messages may be held again.
- **Every relayed message opens with one fixed line, then the owner's words unchanged:**
  `[From the owner via the Workforce console. One-way: the sender closes after delivery. Answer in your own chat, not by SendMessage.]`
  A desk that tried to answer the sender hit a closed one-shot relay (*"That session has already closed …
  there's nowhere to send it"*), so the line tells the seat where the answer belongs: its own chat.
- **Unchanged by design:** approvals (*"ส่ง"*, git commands) are still typed by the owner in the PM's own
  session; a console send reaches a desk as a **peer message**, never as the owner's word.

### Talking to a desk (v0.5.1)

- **Every person chip with a live session is a button.** Clicking it opens the composer aimed at that
  session (`→ SOM-Porter`), and Send relays the owner's words unchanged through one short `claude -p` turn.
  A chip with no session is not a button; its tooltip says `no session open`.
- **The PM comes first on each card and wears a `PM` tag** — the chain is the owner → PM → the rest, so the
  person he gives work to is the one at the front.
- **Seats follow the same rule:** a Claude seat with a live session sends to that session; a seat with no
  session, and every DeepSeek seat, writes `REQUEST-owner-to-<seat>-<date>-<slug>.md` at the workspace root.
- **The composer's first line names the receiver and the mechanism**, so nobody has to guess whether a
  click sends or writes a file.

### Seats, the gate and the ball (v0.5.0)

- **The gate speaks for itself.** Each desk card shows the verdict of
  `node check-hygiene.mjs <desk> --json` (PASS / WARN / FAIL), cached five minutes, with its first FAIL or
  WARN line in the tooltip. The console adds no threshold of its own; when the gate and the card disagree,
  the gate wins. The gate exits non-zero on FAIL, so its verdict is read from stdout, not from the exit code.
- **Seats are data.** The `## Seats` table in this file is the source; a new workspace identity is a row,
  not a code edit. Rows also carry the engine (`claude` / `deepseek`), and a DeepSeek seat's state comes
  from the Harness sessions the owner sees in this app's sidebar.
- **The ball is the inbox.** A person chip gets an amber ring when their `inbox/<ROLE>.md` still holds mail
  (any line that is not part of the file's `#`/`>` preamble) and their session is not busy or waiting. The
  tooltip gives the line count, the file's age and the path. "+20 min idle" from Atlas's direction is not in
  any source this box offers, so the console marks the condition it can see and never invents the minutes.
- **Both engine columns.** DeepSeek seats are matched to Harness sessions by title; the title and cwd are
  read from the Harness session cache (`session-<id>.json`), because the host `agents` service exposes only
  an id. Sessions that match no roster or seat appear in one "Other live sessions" line.

### Desks, people and live sessions (v0.3.0 → v0.4.0)

- **Each desk card carries its roster**, read from that desk's own `ai-worker/TEAMS.md` — the file the
  desks call the only place a person's name lives. A desk with no `TEAMS.md` says so instead of
  pretending to have a team.
- **Each person is a chip with a live dot** (v0.4.0): green `busy`, amber `waiting`, grey `idle`,
  hollow = no live session. The match is the roster's *Session name* column, compared as an unordered
  token set — `Sector-SOM` is `SOM-Sector`, but `Porter-CSC` is **not** `SOM-Porter`. A roster cell
  that is empty stays hollow rather than borrowing another desk's session. Chips wrap.
- **Order and calm** (v0.4.0): desks sort by last log, then by live people; a desk whose log is older
  than 21 days sits behind one "Show quiet desks" button; sessions that match no roster are one small
  "Other live sessions" line; one accent colour, type 11/12/13/15, spacing in 8 px steps.
- **Seat state is a state, not a file** (v0.4.0): a Claude seat shows its session's status, `no session`
  when none matches, and a DeepSeek seat says `no live view` — never `idle`.
- **The roster is names and roles only**; liveness comes from the session list, never from `TEAMS.md`.
- **A charter can disagree with the roster.** `smart-scheduler/ai-worker/FE.md` says "Fero" while
  its `TEAMS.md` row says "Fern"; the roster is what this panel shows, and the conflict is the
  desk's to settle.

### Known limits (v0.5.0)

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
- **A console send is a peer message that costs one small Claude turn**, and it needs a signed-in CLI.
  Measured 2026-11-12: an earlier relay failed with `Failed to authenticate: OAuth session expired and could
  not be refreshed` until the owner signed in; the same call then delivered. The panel shows either line
  verbatim in the composer, so a failure is never silent.
- **The ball is mail, not minutes.** The chip ring means "inbox holds a line that is not its preamble and the
  session is not busy or waiting". The "+20 min idle" test from Atlas's direction is not measurable here —
  `claude agents --json` reports `startedAt`, not when a session went idle — so the console never states it.
- **The `pending` badge lied in v0.2.0 and over-corrected in v0.3.0.** v0.2.0 matched any root
  `REQUEST-*.md` whose filename contains the seat name — both directions, answered files, the root
  passed twice — and answered ATLAS 52 · Marie 28 · Otto 20 · PokerVault 24 with 0 real. v0.3.0
  counted `-to-<seat>-` + the `(pending)` marker and reported 0 everywhere, which was also false:
  a request with **no** reply heading was not "answered". v0.4.0's rule: open = no `## …answer…` or
  `## Reply` heading at all, or that heading followed by `(pending)` — measured today Atlas 10 open /
  23 · Marie 2 / 5 · Otto 3 / 3 · PokerVault 0 / 9. A request answered only in chat still reads open.
- **A desk↔session match is only as good as `TEAMS.md`.** Matching is the roster's *Session name*
  cell (token-set, order-insensitive). Nine of smart-scheduler's twelve rows have that cell empty, so
  its card shows 3 live people, not 11 — a data gap on the desk side, not a matching rule.

### Machine state — 2026-11-12, `KUYDONG` (Windows 10, DSH 0.2.2-rc.1, profile `desktop`)

- **Installed here on 2026-11-12** on the owner's word: `install_bundle` → `application: applied`,
  `@local/dsh-workforce` linked from the workspace checkout — installed as 0.2.0, upgraded in place
  to **0.4.0** the same day (a link follows `workforce-console/package.json`). Live page answered
  `sidebar.panellist` = `plugins`, `schedules`, `workforce` (order 30) and `main` keys `plugins`,
  `conversation`, `schedules`, `workforce`; `workforce_status` was called and answered.
- **A Host change needs the row re-activated; a Client change needs a page reload.** Editing the
  linked `index.js` changed nothing in the running tool — `workforce_status` still answered the
  old shape — until the row was toggled off and on (`set_plugin` entryId `include:dsh-workforce`,
  `false` → `true`); the same call then returned the new fields. No restart was needed. `client.js`
  is loaded at page boot, so a Client change appears after a page refresh.
- **The Claude CLI is there — it is just not on PATH. (My 0.3.0 note claimed otherwise; corrected.)**
  On Windows the desktop app keeps it at
  `%LOCALAPPDATA%\Claude-Data\claude_<id>\claude-code\<version>\<hash>\claude.exe`, one copy per
  version. 0.4.0 resolves it (newest by version, `CLAUDE_BIN` overrides) and reports the path or the
  reason in `claudeBin` / `claudeError`. Measured: `2.1.317`, source `app bundle`, and
  `claude agents --json` answered **12 live sessions** (11 `SOM-*` + `Atlas - workspace`).
- **The snapshot matched the workspace.** 11 desks ordered by last log (smart-scheduler 0 days,
  develyst-ai 113), 4 quiet (log older than 21 days), a roster on every desk, 12 live sessions, and 6
  seats whose state is real: Atlas `idle`, Marie/Otto/Bunny `no session`, ISO/PokerVault `no live view`.

## Install log

| date | action | bundle | version | evidence |
|---|---|---|---|---|
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.5.3 | every relayed message now starts with the one-way line (`[From the owner via the Workforce console. One-way: … Answer in your own chat, not by SendMessage.]`) before the owner's text; proved by one send to `SOM-Porter` → `Delivered to SOM-Porter's inbox, but that session hasn't read it yet.`; no failed reply attempted because the seat is told to answer in its own chat. Host reloaded by toggling `include:dsh-workforce` |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.5.2 | relay now runs `claude -p --permission-mode bypassPermissions --tools SendMessage --strict-mcp-config` with the prompt on stdin; CLI resolved `C:\nvm4w\nodejs\claude.cmd` (2.1.322, shell needed for `.cmd`). Lock proved: asked to write a canary and read a file, the run answered "I have no Write or Read tool … only SendMessage", `CANARY-should-not-exist.txt` absent. Delivery proved: `Delivered to SOM-Porter's inbox, and it hasn't been read yet.` Host reloaded by toggling `include:dsh-workforce` |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.5.1 | Atlas's "click-to-send" ask: person chips with a live session are buttons (composer aimed at that session), chips without one say `no session open`; PM sorted first with a `PM` tag; a Claude seat with a session sends, every other seat writes a REQUEST; composer line names the receiver and mechanism. **Proof attempt:** the relay for `SOM-Porter` ran the same `claude -p` call the button makes and failed with `Failed to authenticate: OAuth session expired and could not be refreshed` — the CLI signs in per-user, so delivery waits on the owner, not on this bundle. Client-only change; reload with a page refresh |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.5.0 | Atlas's follow-up: gate verdict per desk (5 FAIL — smart-scheduler `board.md 92.9KB > 40.0KB`, call-scribe and corner-chat `FAILURES.md` unreviewed, portfolio-nichaphon and dte long table cells; 6 PASS with their warn line), legend under Desks, full desk names with meta on its own line, exe path only in the header tooltip; seats read from `## Seats` (7 rows, Prox added); inbox ball ring (smart-scheduler 8 of 12 hold mail, pun-kub-fang and develyst-ai 0); DeepSeek seats `live` from Harness sessions (ISO, PokerVault, Prox); `workforce_status compact:true` added |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.4.0 | Atlas's brief (`REQUEST-atlas-to-prox-2026-11-12-console-fixes.md`): CLI resolved to the app-bundled `claude.exe` (2.1.317), `claudeBin`/`claudeSource`/`claudeError` in the snapshot, `claude agents --json` → 12 sessions; `client.js`/`index.js` 0 non-ASCII, 0 mojibake; seats show session state (`Atlas` idle, others `no session`/`no live view`); console REQUEST renamed `REQUEST-owner-to-<seat>-<date>-<slug>.md`; open = no answer heading or `(pending)` → Atlas 10/23, Marie 2/5, Otto 3/3, PokerVault 0/9; desk cards show wrapping name chips with live dots, desks ordered by log with quiet ones collapsed |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.3.0 | rosters parsed from each desk's `TEAMS.md` (11/11 desks, e.g. smart-scheduler 12 people, call-scribe/corner-chat 9); seat rows count `-to-<seat>-` + `## Reply` marker only → every seat `0 open` (was 52/28/20/24); Host row toggled `include:dsh-workforce` false → true to load the new `index.js`; `workforce_status` verified with the new shape |
| 2026-11-12 | install | `@local/dsh-workforce` | 0.2.0 | on `KUYDONG`, profile `desktop`: `install_bundle` → `application: applied`, package linked from the workspace checkout; live page `sidebar.panellist` gained `workforce` (order 30) and `main` gained key `workforce`; `workforce_status` called → 11 desks, 6 seats, `claude: []` (no CLI on this box) |
| 2026-11-09 | install | `@local/dsh-workforce` | 0.1.0 | `install_bundle` → `application: applied`; `workforce_status` returned 11 live Claude sessions; `/api/workforce/status` answered HTTP 200; `sidebar.panellist` occupants included `workforce`, `main` occupants included `workforce` |
| 2026-11-10 | upgrade | `@local/dsh-workforce` | 0.2.0 | auto-refresh 15 s; POST route switched from a resource (GET-only) to a raw handler; unknown target/seat return 400; `Send` relay and REQUEST drop implemented |
| 2026-11-09 | root fix ×2 | `@local/dsh-workforce` | 0.1.0 | first snapshot read the harness profile directory; second preferred the live-session root (`Work`), showing 4 desks; seats unioned across both roots so ISO and PokerVault appear with their pending REQUEST counts |

## Next (not built)

- Click a seat → open its conversation; send through `SendMessage` (Claude) or write a
  `REQUEST-*.md` and wake (DeepSeek).
- **On a box with no Claude Code** (this machine), list the live Harness sessions from the host
  `agents` service instead of `claude agents --json` — those are the sessions that actually exist
  here — and keep the Claude column for the Mac.
- "Who holds the ball" from the board's owner column, refreshed with the gate's JSON.
- A conductor loop that nudges only when work is waiting and the seat is idle.
