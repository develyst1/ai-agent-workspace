# PLUGINS — the plugin layer of this workspace

> Owned by **Prox** (`PROX.md`). One row per bundle, plus an install log. A change is written here
> the moment it happens, not at session end. Absolute paths never appear in this file; a real
> machine path lives in `machine.local.md` only.

## Bundles

| bundle | version | patch row | source (workspace-relative) | provides | status | revert |
|---|---|---|---|---|---|---|
| `@local/dsh-workforce` | 0.7.7 | `dsh-workforce` | `workforce-console/` | sidebar panel **Workforce**, main page `workforce`, tool `workforce_status` (`compact:true` summary incl. `stuck`, `mailChecks`, `dark`), route `GET/POST /api/workforce/status` (tree block sized to its bbox and centred · tile grids · **a sticky composer centred by layout on the content pane**, four close paths, per-person drafts, a measured-centre tooltip · untitled harness sessions named · Send through the locked, one-way relay) | installed · applied | remove the bundle (`remove_bundle`), then reinstall the previous version; revert `client.js` to the 0.7.6 tag to undo the sticky bar |

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

### The bar is centred by layout (v0.7.7)

- **`position: fixed` was centring on the window** (960 px) while the content pane centres near 1092 px, and the
  0.7.5 geometry (measured rect + `ResizeObserver` + 2 s timer) did not move it. Both are gone.
- **Now it is a sticky last child**: `position: sticky; bottom: 16px; margin: 0 auto;
  width: min(720px, 100% - 32px)`, inside the scrolling column, so the browser's own layout centres it on the pane
  and keeps it floating while the content scrolls. No JavaScript geometry, no observer, no timer.
- **The content keeps 104 px of bottom padding while a target is picked**, so the last row never hides under the bar.
- **The same self-check as the tree:** the bar measures itself against its parent on mount and on resize and puts
  `bar centre N px · pane centre M px` in its tooltip — the owner hovers it; they must agree within 4 px.

### The tree block is sized to the tree (v0.7.6)

- **Why 0.7.5 did nothing:** the chain block was as wide as the drawing area (`width = LEFT*2 + teams*pitch - …`),
  and the nodes were drawn from its left edge, so `margin: auto` had almost nothing to centre. The measurement in
  the owner's screenshot (tree centre ~800 px, card centre ~1095 px) is arithmetic, not a rendering fault.
- **The fix:** after the nodes and paths are built, their real bounding box is measured from their own coordinates:
  `bboxWidth = (right − left) + 24`, and the whole group is shifted by `(12 − left)` inside a block of that width,
  which `margin: 6px auto 0` then centres. Expected block widths: **884 px** for smart-scheduler (3 teams, nodes
  from x=50 to x=910) and **359 px** for portfolio (1 team, x=50 to x=385).
- **The page measures itself and says so:** each card wraps the tree in a node whose tooltip reports
  `tree centre N px · card centre M px · tree width W px`, read from `getBoundingClientRect()` on mount and on
  resize. That is the number Atlas asked for, visible to the owner, and it is the only way this seat can report a
  DOM measurement — Prox has no browser control and cannot read the page's rects himself.
- **An untitled Harness session** now reads `untitled harness session (harness)` instead of a raw UUID (the id stays
  in the session list, not in the line).

### Centring and closing (v0.7.5)

- **The tree is centred inside its card** (`margin: 6px auto 0` on the fixed-width chain block). A tree wider than
  the card keeps the card's horizontal scroll and starts at its left edge. Desk titles, the "Nothing is stuck" line,
  tile grids, section labels and the seats row stay left-aligned on purpose.
- **The composer is centred on the content pane**, not the window: it measures the panel it lives in
  (`getBoundingClientRect` on the scroll container, re-measured on resize, on `ResizeObserver`, and every 2 s) and
  positions itself at that pane's centre, `min(720px, pane - 32px)` wide.
- **Four ways to close it:** the chip's ×, Esc, clicking the same person again (a toggle), or clicking empty page
  background outside the bar, nodes and tiles. Closing clears the tree's accent outline.
- **A draft survives:** typed text is kept per target, so reopening the same person restores it; it is cleared only
  when a send succeeds.

### The composer (v0.7.4)

- **Nothing at the bottom until a target is picked.** Picking a node, a tile name, a stuck name or a seat opens
  a floating bar, centred, `min(720px, 100% - 32px)` wide, rounded 12, 16 px from the bottom, with a shadow over
  the page. **Esc** or the chip's × closes it.
- **Inside, left to right:** a recipient chip (initial circle, `Porter · smart-scheduler`, ×); an auto-growing
  textarea (1 line, up to 6, no border, placeholder `Message Porter…`); a small ⓘ whose tooltip says
  *one-way · starts a short Claude run · not an approval*; a round accent button with an arrow (a document icon
  when the target is a REQUEST). The button is dimmed while the text is empty and shows a spinner while sending.
- **Keys:** Enter sends, Shift+Enter is a newline, Ctrl/Cmd+Enter still sends.
- **The result is a toast, not a line of text:** success `Sent to Porter` fades after 3 s; failure is a red toast
  with the reason that stays until dismissed; the text is cleared only on success, and the bar stays open for the
  next message.
- **The picked tree node carries an accent outline**, so it is obvious who is being written to.

### Folded desks are tiles (v0.7.3)

- **Expanded desks stay full-width trees; folded live desks are tiles** in one grid
  (`repeat(auto-fill, minmax(260px, 1fr))`, 8 px gap), so three folded desks sit on one row instead of three
  bars. A tile reads `▸ name · N live · M stuck` with the gate dot and a subtle live marker on its left edge;
  stuck names stay on the tile in amber and click through to the composer.
- **The quiet desks grid has the same shape** (`name · gate dot · log`), so a desk that goes live or quiet keeps
  the same tile. Clicking a tile unfolds that desk (a tree for a live desk, the old card for a quiet one);
  clicking a tree's header folds it back. Both fold maps are per viewer (`workforce.collapsed`,
  `workforce.quietDesk`).

### A live desk folds, and an opened session lights its own desk (v0.7.2)

- **Every live desk card folds.** The header row is the toggle (▾ / ▸); collapsed it is one line:
  `▸ name · N live · M stuck · gate dot · log today`. A desk with stuck people keeps their names on that line,
  in amber, and clicking one opens the composer to that session — a folded desk never hides stuck work. The
  state is remembered per viewer and per desk (`localStorage` key `workforce.collapsed`), default expanded.
- **A session the owner opens lights its desk without a table edit.** Match order:
  1. the desk's `TEAMS.md` Session-name cell (exact title);
  2. else the desk's own memory `scripts/memory/session-desk.mjs` writes to
     `<workspace>/.claude/session-desk/<sessionId>` (`<desk> <Name> <ROLE>`, or `none`) — read only, never written
     by the console;
  3. else the session is unmatched and appears in "Other live sessions".
  Unit-tested: a session whose title matches on its desk wins (`by: teams`); an empty cell with a cache line for
  that desk/person matches (`by: session-desk`); the same cache line on a different desk matches nothing.

### Clickable nodes and the desk that looks dark (v0.7.1)

- **Every tree node with a live session is a button** (the 0.5.3 behaviour, restored): click opens the composer
  aimed at that session; a node with no session does not react and its tooltip says `no session open`.
- **A person whose `TEAMS.md` Session-name cell is empty** carries a small `?` whose tooltip is
  `TEAMS.md has no session name for <Name>` — the console says why it cannot light them instead of looking
  hard-coded.
- **A desk with live sessions the roster cannot name** is attributed only by the desk's own short code
  (`Desk short code **BUD**` in `TEAMS.md`): a session whose last token is the code is that desk's. No code, no
  attribution — the session goes to "Other live sessions" instead of being guessed onto a desk. Such a desk
  counts as live, gets its card, and its header says
  `N live session(s) not matched — TEAMS.md has no session names (<names>)`.
  Proved with a synthetic desk (code `port`, empty roster cells) + `Porter-port`: attributed to
  portfolio-nichaphon, while a session with no code stayed unattributed.
- **Quiet desks are one line.** `Other desks · N (no live session) ▸` expands a compact grid of
  `name · gate dot · log Nd ago`; the open state is remembered in the browser (`workforce.quietOpen`).

### Stuck means new mail, and the chain is a tree (v0.7.0)

- **"Stuck" is one comparison.** Last moved = the mtime of the person's own session transcript
  (`~/.claude/projects/<slug>/<sessionId>.jsonl`, sessionId from `claude agents --json`; a Harness seat falls
  back to its cache's `lastMessageTime`). Stuck = the session is live, not busy or waiting, **and** the inbox
  file's mtime is later than last moved. Older mail is housekeeping: it shows a grey count and no ring, and a
  desk with no live session never appears in "ต้องดู".
- **Proof, 2026-11-12 18:27 UTC** (smart-scheduler, both timestamps): Tanya inbox 18:27:50 vs moved 17:47:47 ·
  Sober 18:27:53 vs 17:48:42 · Silver 18:27:55 vs 17:48:24 · Sector 18:27:57 vs 17:47:50 — four stuck, each
  about 39-40 minutes after the person last moved. The same sweep shows the other eight **not** stuck because
  their inbox mtime is *earlier* than their last move (Fern 17:48:10 vs 17:48:27, Jason 17:48:23 vs 17:48:43,
  Fanta 17:47:45 vs 17:47:57, Bob 17:47:43 vs 17:48:09, Brew 17:47:43 vs 17:47:48), or no inbox at all.
- **The tree.** A live desk is one full-width card; every node is the same size (118x52, initial circle, name in
  the UI font, role under it); `owner` is a plain label above the PM; QA hangs right of the PM; each team is one
  column of equal width in a single row; SA forks to BE and FE. Links are SVG paths, 1.5 px neutral grey, amber
  with an arrowhead and a count only when that link carries **new** mail. Team headers are small caps and turn
  accent when a member is busy, waiting or stuck. Spacing uses 8/16/24.

### The chain (v0.6.0)

- **Where it comes from.** A desk's own `## Chain` section with a ` ```chain ` block wins; otherwise it is derived
  from that desk's `TEAMS.md` roster: `owner`-PM, PM-QA, PM-SA per team, SA-BE and SA-FE inside the team. A card
  says `default chain` when it is derived. No desk has written a `## Chain` block yet, so every card says it.
- **Where the work is.** Each message line in `inbox/<receiver>.md` names its sender, in either shape the desks
  use (`From <Name> ...` or `## ... <Name> -> <Name> ...`); the count per sender lights that person's incoming
  link with `\u2193N`. A sender the parser cannot read still counts for the receiver and lights no link. `#`/`>`
  preamble lines and body lines are not messages.
- **Layout.** A "must-see" strip lists every person holding mail without a moving session (`desk · name · N from
  <sender>`, clickable when they have a session); live desks are full cards with the chain inside (`owner` on
  top, the PM and QA beside him, one column per team side by side so parallel lines are visible); a desk with no
  live session is one line that expands on click; the seats are one compact row. Person state is a **fill**
  (green busy, amber waiting, grey idle, dashed outline = no session), not a dot.
- **Read-only.** The chain is drawn from files and session state; it never claims a status the sources do not
  carry, and the console still adds no threshold of its own (the gate keeps that job — a dot by the desk name).

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
- **The chain is a map of the roster, not of the work.** It shows who is wired to whom and how much mail sits on
  the receiver's link; it does not know what a message says, whether it needs a decision, or how long a person
  has been idle. Two people holding the same ball can only be seen by the "must-see" strip listing both.
- **Layout is verified by data, not by pixels.** I have no browser: the chain counts and the mail lighting were
  checked against real desks (smart-scheduler 12 links: owner-PM, PM-Tanya/Twenty, PM-Sober/Silver/Sector,
  Sober-Jason/Fern, Silver-Bob/Fanta, Sector-Brew/Flash; `inbox/BE-C.md` holds 5 messages from Sector), but the
  owner's window is the only proof that nothing wraps badly at 1280 px.
- **"Stuck" can under-report, never over-report.** It needs a session transcript with a readable mtime; a seat
  whose transcript is missing (a brand-new session, a person with no session name in `TEAMS.md`) shows no ring
  even with fresh mail. That is deliberate: the panel does not call a person stuck on evidence it does not have.
- **The tree is verified by data, not by pixels.** Node geometry is fixed arithmetic (118x52, columns of 280,
  pitch 300), so three teams need about 960 px; a card scrolls horizontally rather than truncating a name. At
  1280 px the owner's window is the only proof that nothing wraps badly.
- **A desk without a short code cannot explain itself.** Only four desks record one today (BUD, CSC, CC, ISP);
  the rest rely on their `TEAMS.md` session names. If a nameless session appears on a codeless desk it lands in
  "Other live sessions" with no desk claim — honest, but quieter than the owner may want. The fix is a
  `Desk short code` line in that desk's `TEAMS.md`, not a guess in the console.
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
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.7.7 | composer is a sticky last child (`position: sticky; bottom: 16; margin: 0 auto; width: min(720px, 100% - 32px)`) so layout, not JS, centres it on the content pane; the measured-rect/ResizeObserver/2 s timer from 0.7.5 are removed; content keeps 104 px bottom padding while a target is picked; the bar's tooltip reports `bar centre · pane centre` measured on mount and resize. Client-only; one refresh |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.7.6 | tree block sized to the drawn bounding box (`bbox + 24`, group shifted by `12 − left`), so `margin: 6px auto` has a real block to centre — expected 884 px for smart-scheduler, 359 px for portfolio; each card now measures `getBoundingClientRect()` and puts `tree centre / card centre / width` in its tooltip for the owner to read; an untitled Harness session reads `untitled harness session`. Client-only; one refresh |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.7.5 | tree centred in its card (`margin: 6px auto 0`), composer centred on the measured content pane (rect + resize + ResizeObserver + 2 s re-measure), four close paths (×, Esc, same-target toggle, empty-background click), per-target draft kept until a successful send. Client-only; the page picks it up on refresh |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.7.4 | composer rebuilt as a floating chat bar: hidden with no target, Esc/× close, recipient chip (`Porter · smart-scheduler`), auto-growing textarea (1-6 lines), ⓘ tooltip, round accent button with spinner and a document icon for REQUEST targets, Enter sends / Shift+Enter newlines, toast for success (3 s) and failure (persistent), text cleared only on success, selected node outlined. Client-only; the page picks it up on refresh |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.7.3 | folded live desks are tiles in a `minmax(260px, 1fr)` grid (three folded desks = one row at any window wider than ~820 px), expanded trees stay above, quiet desks share the same tile look; clicking a tile unfolds (state kept in `workforce.collapsed` / `workforce.quietDesk`); stuck names remain amber and clickable on a tile. Client-only change; the page picks it up on refresh |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.7.2 | live desks fold from their header (▾/▸), collapsed line `name · N live · M stuck · gate dot · log`, stuck names stay amber and clickable, state in `localStorage` (`workforce.collapsed`), default expanded; second match source wired: `matchPerson` tries `TEAMS.md` then `.claude/session-desk/<sessionId>` — unit-tested `teams` first, `session-desk` second, and a cache line for another desk matches nothing; live check after reload: 15 sessions, portfolio-nichaphon `live: 1`, `stuck: []` |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.7.1 | nodes clickable again (same selection/Send path as the 0.5.3 chips); `?` on a person with an empty session cell; unmatched sessions attributed by the desk's `TEAMS.md` short code (unit-tested: code `port` + `Porter-port` attributed to portfolio-nichaphon, a code-less desk got none) with the header line naming them; quiet desks behind one `Other desks · N` line remembered in `localStorage`; "Other live sessions" restored; portfolio-nichaphon now shows `live: 1` because its TEAMS.md carries `Porter-port` |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.7.0 | stuck is now "live, not busy/waiting, inbox mtime later than the session transcript's" — proof on smart-scheduler: Tanya 18:27:50/17:47:47, Sober 18:27:53/17:48:42, Silver 18:27:55/17:48:24, Sector 18:27:57/17:47:50 (four stuck, ~39 min after last move); eight others correctly not stuck (inbox older than move). Chain redrawn as a full-width tree: uniform 118x52 nodes, SVG 1.5 px links, amber + arrowhead + count only for new mail, one row of equal team columns, small-caps team headers, 8/16/24 spacing. Host reloaded by toggling `include:dsh-workforce` |
| 2026-11-12 | upgrade | `@local/dsh-workforce` | 0.6.0 | the chain view: derived links (smart-scheduler 12 = owner-Porter · Porter-Tanya/Twenty · Porter-Sober/Silver/Sector · Sober-Jason/Fern · Silver-Bob/Fanta · Sector-Brew/Flash), `## Chain` block support (none used yet, every card says `default chain`), inbox senders lit per link (`inbox/BE-C.md` → 5 from Sector), must-see strip, live desks full / silent desks one line, seats one compact row, person state as fill; host reloaded by toggling `include:dsh-workforce` |
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
