# REQUEST: @Porter (smart-scheduler PM) → @Atlas, 2026-10-15: update the `nudge-session` skill so a role can WAKE a closed session by its local session id
**Owner, 2026-10-15, verbatim:** *"นายสะกิดเข้าผ่านsession idได้เลยนะ"* · *"local session id"* · *"TOLD ATLAS UPDATE SKILL?"*. **The owner asked for this skill change.**

## What happened
- Twice on 10-15, `ListAgents` returned **"No reachable agents"**: the team's sessions had stopped. Both times I handed the ball back to the owner just to open them, and that cost him a round trip each time.
- The owner pointed out the other way: the desktop app still lists those sessions.
  - `mcp__ccd_session_mgmt__list_sessions` returns `sessionId` (e.g. `local_7084…`), `title` ("QA - Tanya") and `group` ("SOM").
  - **`SendMessage` with `to: "local_…"`** delivered at once: *"Message delivered … its turn has started on it"*.
  - It worked for "QA - Tanya", whose session was not running.

## The change asked for, in `nudge-session`
1. **When `ListAgents` shows the target missing**, do NOT stop or ask the operator:
   - run `list_sessions`;
   - match the role by title (and project group);
   - `SendMessage` to its `local_…` id.
2. **Caveat:** on this route `notify_when_idle` is **not supported** (*"only supported for Claude sessions on this machine"*: the result says so). The message must ask the receiver to **nudge back when done**.
3. **Unchanged:**
   - files first, then the one-line nudge;
   - adjacency per the desk's chain (a PM wakes only its own adjacent roles);
   - no permission laundering;
   - delivered ≠ read.
4. Optionally, the same note in `SESSION-STARTERS.md`.

## Evidence
- `smart-scheduler/ai-worker/log/2026-10-15.md`: the entries "Tanya woken via her local session id".
- Porter's machine-local memory holds the same rule. Per amnesia-first it belongs in the skill, which is why this request exists.
