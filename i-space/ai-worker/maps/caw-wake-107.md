# REQ-107 — How CAW wakes and feeds long-lived CLI workers (Team B study)

- Written by: Silver (SA, Team B), 2026-10-29 · Source: `requirements/REQ-107-caw-wake-workers-study.md`
- Read: `caw-back` @ 102a130 (unchanged). No code change, no live run. CLI flags were read from `claude --help` (v2.1.312,
  help text only — no model call, no quota). Owner intent: `DECISIONS.md` 2026-10-29 11:41 items 4, 5, 7, 9.
- Sizes are the SA's guess.

## The one thing to see first

**The desk's ring problem does not apply to CAW, as long as the runner stays the CLIs' parent.** The desk's sessions are
strangers to each other and have to find each other through `cc-socks` sockets, which broke. CAW's runner **starts** every CLI
itself and holds its pipes and its process group (`caw-back → src/runner/hop.ts:62-74`, `procs.ts:1-6`). It never has to
*discover* a worker, only to *write to* the process it already owns. So no option below uses ListAgents, `cc-socks`,
`SendMessage` or any desktop-only tool (AC-3). The real question is: **how does the runner hand a new task to a CLI that is
still open, and how does it know that CLI has finished the task?**

Today (the baseline): the runner polls every 2 s (`runner/config.ts:43`; loop `runner/main.ts:285-290`), plans per project
(`runner/plan.ts:35-61`), and for each hop spawns a fresh `claude -p … --no-session-persistence` (`hop.ts:141,154,269`) with
stdin closed (`hop.ts:65` `stdin: "ignore"`). It knows the hop is over when the process exits; it parses `stream-json` live for
heartbeats, blocks and the limit signal (`hop.ts:294-301`; `runner/stream.ts:1-9,93`).

## Option A — one open `claude -p` per worker, fed through stdin (stream-json in and out) · **M**

The runner starts each worker once: `claude -p --input-format stream-json --output-format stream-json …` (both flags exist,
`claude --help`: *"realtime streaming input"*). The process stays open. A new task = the runner **writes one user message** to its
stdin. The task is over when the stream prints its `result` event (already parsed, `stream.ts:93`). Then the worker is idle
until the next message.

- **Keeps:** the poll loop and planner (they now pick an idle *worker* instead of spawning) · the stream parser, heartbeat
  and limit handling, unchanged · process groups + hop files (now one per worker, not per hop) · the MCP server.
- **Pros:** it really is "a CLI open on the server that takes work continuously" (item 5). Wake = a write to a pipe CAW owns,
  so nothing to discover and nothing to lose. Idle and busy are exact (`result` seen or not). The live view (item 9) is the
  stream CAW already reads: forward it. Workers run side by side (item 7): one process each.
- **Cons / what must change:** stdin must be a pipe (`hop.ts:65`). The MCP server gets the hop id **once, at spawn**, in its
  env (`hop.ts:127-130`), and every worker write needs it (`mcp/server.ts:6`). A long-lived worker has a new hop per task,
  so the hop must travel another way (in the task message, or the API resolves "this worker's running hop"). The per-hop
  settings and read fence (`hop.ts:259-263`) are fixed at spawn: a task that needs other folders needs a restart. The
  context grows across tasks: there must be a rule for when to restart (every N tasks, or on a size signal). Item 4 ("a task
  that started keeps its spec") still holds: the spec is read when the task starts.
- **What breaks it:** the process dies mid-task. The runner sees the exit, marks the hop interrupted, as today, and starts the
  worker again with `--resume <session-id>` to keep its memory. A hung CLI prints nothing, so the heartbeat stops and the hop
  cap stops it (`hop.ts:276-281`). If the CLI does not take a second message on the same stdin, the option fails: that is the
  first live proof.

## Option B — a fresh process per task, the same session resumed (`--resume <id>`) · **S**

Keep today's spawn-per-hop and drop `--no-session-persistence`. Give each worker a fixed `--session-id <uuid>` the first time,
then `--resume <uuid>` on every next task (both flags exist, `claude --help`). Wake = spawn, exactly as today.

- **Keeps:** almost everything — spawn per hop, stdin closed, MCP hop id at spawn, per-hop settings, end on process exit.
- **Pros:** the smallest and safest change. A crash loses nothing that a resume does not bring back. No long-lived process
  to babysit.
- **Cons:** the worker **remembers**, but it is **not open** between tasks, so it only half meets item 5. There is nothing to
  watch while it is idle (item 9), and nothing to type into later (item 9, second step). Each task pays the start-up time.
  Session files pile up on the server's disk.
- **What breaks it:** two tasks resuming the same session at once. The planner must allow at most one hop per worker,
  which `plan.ts:56-60` does not check today (it checks one per project). A resumed session that has grown too large.

## Option C — interactive `claude` in a tmux pane per worker, fed by `tmux send-keys` (Atom's way) · **L**

The runner opens each worker as an interactive TUI in tmux and types tasks into it. A Claude Code `Stop` hook posts "idle" to
caw-back.

- **Keeps:** the poll loop and planner, the MCP server. **Loses** the `stream-json` parser, so heartbeats, tokens, blocks and
  the limit signal must be rebuilt from hooks or by scraping the screen.
- **Pros:** exactly what the owner sees with Atom. The live view and later typing come almost free (a pane).
- **Cons:** sends keystrokes into a screen, so a permission prompt or a half-drawn screen eats the task. Idle is only as
  reliable as a hook. Needs tmux on the server. It is the hardest of the three to test without a live run.
- **What breaks it:** a prompt the TUI asks that `-p` would have refused, a send while the worker is still busy, or the hook
  not firing.

Rejected without its own section: a worker "pulls" work through a blocking MCP tool (`wait_for_task`). It inverts the
control, but an MCP call that waits minutes depends on tool timeouts, and the model spends a turn on every wake.

## Recommendation — **A**, built so B is the fallback

A is the only option that gives the open, continuous, parallel, watchable worker the owner decided (items 5, 7, 9) while
keeping today's stream parser, limit handling, heartbeats and process groups. B is A's crash path anyway (`--resume`), so
building A means building B's mechanics too.

**What would make me switch to B:** the live proof shows that a `-p --input-format stream-json` process does not reliably take
a second and third task on the same stdin, or that its context cannot be kept bounded. **Switch to C** only if the owner wants
typing into the worker before anything else.

## Won't option A forget? — memory and context (owner's follow-up, Q2 12:39)

**Yes, an open session's own memory will fade: its context fills and gets compacted. So CAW must never depend on it.** Today's
design already does not. Each hop's prompt names only the card and tells the worker to call `card_context` first
(`caw-back → src/runner/prompt.ts:11-22`). That call returns everything the work depends on from **CAW's store**: the card, the
spec part as Blueprint has it, the card's notes, the answered decisions it depends on, and the project's code map
(`cards/service.ts:90-104`). The worker's role skills ride in the system prompt (`hop.ts:153`, `prompt.ts:30-45`). Nothing that
matters lives only in the CLI's head; the worker's results go back as `comment` / `hand_off` / `set_status` / `ask_operator`
writes (`prompt.ts:18`).

**Recommendation:** keep that rule in option A. The session is a **cache**, not the record:
1. **Every task re-feeds itself:** the same prompt shape + `card_context`. A worker that remembers nothing still does the task right.
2. **Rotate the session on a rule, not on luck:** restart the worker's process (a fresh session) after N tasks, or when the
   stream's token counts pass a threshold (the runner already reads tokens per hop: `core/events.ts:92` `tokensIn/tokensOut`).
   A restart costs one start-up; it loses nothing, because of rule 1.
3. **`--resume` only for a crash mid-task**, to finish that task. Never as the long-term memory.
4. **Anything a worker should keep across cards** (a convention it learned, a decision) goes into CAW's store as a note or a
   decision through MCP, never "in its head". That is how the next task, or the next worker, sees it.

**Only a live run can prove:** how many tasks or tokens before compaction starts on the model we use · whether the system
prompt (skills) and MCP tools survive compaction intact · whether a compacted worker still follows the prompt's step-2 rule
(end with one MCP tool). A stub can prove the rotation rule and the re-feed.

## What needs a live run (the owner's word first) vs what a stub can prove

- **Needs a live CLI** (spends quota — ask through the PM): (1) one process takes three tasks in a row through stdin and prints a
  `result` after each · (2) the limit signal still arrives in a long-lived process · (3) `--resume <id>` after a kill brings the
  memory back · (4) how fast the context grows over N tasks.
- **A stub can prove** (a fake `claude` reading stdin, like `runner/e2e/fake-claude.ts` does for one turn): the runner writes a
  task, waits for `result`, marks the hop done, picks the next idle worker · one hop per worker, every worker in parallel · the hop
  id reaches MCP writes per task · crash → interrupted + resume · the hop cap on a silent worker.
