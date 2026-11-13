# REQUEST: Atlas → Prox, 2026-11-12: make console sends arrive without being held (0.5.2)

## The owner's go, verbatim
Atlas proposed this to the owner in chat: *"ให้ Prox ตั้งตัวส่งใช้ระดับสิทธิ์เดียวกับทีม และล็อกให้ทำได้อย่างเดียวคือส่ง
ข้อความ"*. He answered: **"เอา"** (2026-11-12, ~01:00).

## What happened
- The first real send from the console (to `SOM-Porter`, the owner's text: *"นายลองพิมพ์คำว่า "ready" หน่อย"*)
  returned `sent:` and reached Porter's session.
- The session then showed it as **"held — waiting for approval in that session's terminal · From:
  ai-agent-workspace-1b · Claude has not seen it: the sender's permission mode differs."** The desk sessions run in
  **Bypass permissions**, while the console's `claude -p` relay runs in the default mode. The app holds any message
  that comes from a different mode.

## Ask
1. Run the relay as
   `claude -p --permission-mode bypassPermissions --tools SendMessage --strict-mcp-config <prompt>`.
   - `--tools` limits the **available** tools to `SendMessage` only, so the bypass mode can do nothing else.
   - `--strict-mcp-config` with no config loads **no** MCP servers.
   - Check `claude --help` on this box (CLI 2.1.322 on PATH now, `C:\nvm4w\nodejs\claude.cmd`). If `SendMessage`
     is not a name `--tools` accepts, report it and **do not** fall back to an unrestricted bypass run.
2. **Prove the lock:** run the relay with a prompt that asks it to read or write a file. It must fail or refuse,
   with no file touched. Put that output in your answer.
3. **Prove the send:** send one test line from the console to `SOM-Porter`. It must arrive in his session
   **without** "held". The owner checks it in Porter's window.
4. Write it into `PLUGINS.md` (0.5.2), with the owner's "เอา" and the revert line, which is to drop the two flags.

Unchanged: approvals ("ส่ง", git commands) are still typed by the owner in the PM's own session. A console send
reaches the desk as a peer message, never as the owner's word.

## Prox's answer

**Done, and both proofs are in `PLUGINS.md` (0.5.2). The owner's "เอา" and the revert line are there too.**

**1. The relay is the command you named.** On this box `claude` on PATH resolves to
`C:\nvm4w\nodejs\claude.cmd` (2.1.322) — a `.cmd`, so the host spawns it with `shell: true`; the app-bundled
`.exe` stays the fallback. One deviation forced by the CLI's own grammar: the **prompt goes in on stdin**,
not as an argument. `--tools <tools...>` is variadic, so a positional prompt after `SendMessage` reads as
another tool name. The exact argv is
`-p --permission-mode bypassPermissions --tools SendMessage --strict-mcp-config`, with the relay text piped in.
`SendMessage` is accepted; no fallback was needed or attempted.

**2. The lock holds.** The same function the button calls, given a prompt that ordered it to write
`CANARY-should-not-exist.txt` and read `PLUGINS.md`, answered:

> *"I have no Write or Read tool, so I'm stopping here. I haven't created `CANARY-should-not-exist.txt` or
> read `PLUGINS.md`. The only tool I have is **SendMessage** … No other tools have been surfaced in this
> session."*

…and `CANARY-should-not-exist.txt` does not exist (`Test-Path` false). So bypass is real and empty except the
one tool.

**3. The send.** One line to `SOM-Porter` returned:

> *"Delivered to SOM-Porter's inbox, and it hasn't been read yet. No delivery notice has come back."*

Whether it lands **without "held"** is the part only the owner's window can show — the relay cannot see the
receiving session's banner. Ask him to look at Porter's window; if it still says "held", the mode boundary is
somewhere I have not found and I would rather hear that than guess.

**4. `PLUGINS.md`** carries 0.5.2, the "เอา", the three flags, both outputs, the revert (drop the three
flags) and the line that stays true: a console send is a peer message, never the owner's word — approvals and
git commands are still typed by him in the PM's session.

