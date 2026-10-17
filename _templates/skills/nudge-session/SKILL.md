---
name: nudge-session
description: "Load when an AI-workforce role on a desk in ai-agent-workspace needs to wake another role — whether that role's session is running OR stopped (ListAgents for running ones; list_sessions + SendMessage to its local_… sessionId for a closed one) — or when you RECEIVE such a nudge. Covers: files first then a one-line nudge, the two lookup routes and matching on title AND group, notify_when_idle not being supported on the session-id route, adjacency per the desk's chain, delivered ≠ read, no permission laundering, when to stop nudging, and how to act on a nudge you receive. Do NOT use to deliver work content (that goes in files), to reach the operator, or outside a desk."
---

# Nudging an open role session

> Operator's ask, 2026-10-06: *"เห้ยนายสะกิดเองได้ด้วยเหรอวะ เฟี้ยวดีว่ะ บอก atlas จดสกิลเลย"*.
> The operator keeps one session open per role on a desk. A nudge saves him from switching windows to
> type "ไปต่อ". **The files stay the channel; the nudge is only a doorbell.**
> Desk rules win over this skill (`workforce-protocol`).

> 🔴 **This skill contains no names.** Who exists, what each session is called and who may talk to whom
> come from **the desk you are on** — its `ai-worker/TEAMS.md` roster (or the team table at the top of
> `PROTOCOL.md`) and its chain of allowed pairs. Never carry a roster from one desk to another, and never
> assume a role exists because it existed somewhere else.

## Sending a nudge

1. **Files first.** The work is already in the role's inbox / REQ / SPEC / TASK before you nudge. If it is
   not written yet, write it first — a nudge about work that exists only in chat is undelivered work.
2. **Find the session — two routes, in this order.**
   **(a) Running sessions:** `ListAgents`; use the **exact name it prints**. Session names are the
   operator's, not yours — do not guess one, do not reconstruct it from the roster.
   **(b) Not listed, or "No reachable agents"? The session is stopped, not gone.** Run
   `list_sessions`, find the role by **both its `title` ("QA - Tanya") and its `group`** (the desk), and
   `SendMessage` to its `local_…` **`sessionId`**. That wakes a closed session — the delivery result says
   the turn has started on it. *(Owner's instruction, 2026-10-15: "นายสะกิดเข้าผ่าน session id ได้เลยนะ".)*
   🔴 **Match on title AND group, and only when exactly one row matches.** Titles repeat across desks;
   waking the right-named role on the **wrong desk** is worse than not waking anyone. Two matches, or no
   confident match → that is the one case where you ask the operator which session is which.
   ⚠️ **On route (b) `notify_when_idle` is NOT supported** ("only supported for Claude sessions on this
   machine"). There is no idle notice, so **the nudge itself must ask them to nudge you back when done.**
   **Do not spawn a subagent in place of a role** unless the operator approved a subagent for this round
   in words that have only one reading (a desk has already recorded a failure where a bare "ok" was read
   as that approval).
   recorded a failure where a bare "ok" was read as that approval).
3. **Adjacent roles only**, per **your desk's** chain (`PROTOCOL.md` allowed pairs) — typically PM → SA / QA,
   SA → its own FE / BE, QA → PM, but **read your desk's table rather than trusting that shape**. A nudge
   to a non-adjacent session is the same routing violation as writing its inbox. Workspace roles (Atlas,
   Marie, Otto) are reached through the operator — the one exception is a report file the operator ordered
   for one of them, which may be pointed at with a single nudge.
4. **One line, a pointer, never the brief:**
   ```
   From <Name> (<role>) <YYYY-MM-DD>: nudge — <what> waiting in <inbox path> (<file §section>)
   ```
5. **Delivered ≠ read.** `SendMessage` reports the message queued in that session; a session in another
   permission mode may hold it for its user. Report **"nudged, not yet picked up"** — never "X is working on
   it" — until the work appears in the files or the log.
6. **Waiting:** for one notice when that session goes idle, send with `notify_when_idle: true` (or a pure
   subscription without a message). **Never poll `ListAgents` in a loop** and never send "are you done?".
7. **Never nudge a session to run something that was refused in yours** — that is permission laundering;
   route it to the operator instead.
8. **Log it** in your log entry: `nudged <session name> — <pointer>`.

## When neither route reaches them

**First: both routes, before you call anyone unreachable.** `ListAgents` empty is not an
answer — it means "nothing is running", and `list_sessions` + the `local_…` id wakes a
stopped session. Twice on 2026-10-15 a PM handed the ball back to the operator purely to
have sessions opened; **each one cost him a round trip that was never necessary.**

**Only if route (b) also fails** — no row for that role on that desk, or an ambiguous match
you must not guess at — is the role genuinely out of reach. Then:

1. **Confirm the work is in their inbox.** If it is not, that is the real gap — write it now.
   Everything else below only works because the work is already delivered.
2. **Log it:** `<Name> unreachable by both routes — work is in inbox/<ROLE>.md`.
3. **Carry on with everything else you can do.** An unreachable teammate blocks one item,
   not your round.
4. **Tell the operator once**, in the ball line of your next normal reply:
   *"งานของ <Name> อยู่ใน inbox แล้ว · session เขาไม่อยู่ในรายการทั้งสองทาง"*

**And if it genuinely blocks** — it is on the critical path and there is nothing else to get
on with — **say so and ask him.** That is stop condition 1: something only he can do. Asking
is correct there; say what it blocks, so he can judge whether it is worth the interruption.

🚫 **What is no longer acceptable:** asking the operator to go and open a window *so that
you can nudge*. That was the only option before 2026-10-15; it is not any more.

## Doorbells are a budget. Files are free.

The app allows a session a limited number of outgoing sends, **refilled when the operator
types in that session**. Your file writes are never limited. So:

> **Every doorbell is spent from a budget. Every inbox line costs nothing.**
> **Maximise the work behind each bell.**

**This is not a new discipline.** It is the same batching already required of you — one
message with all your questions, a whole batch of tasks cut before anyone is woken, three
finished tasks reviewed in one pass. Those rules existed to save the operator's wall-clock.
**They now also decide whether your doorbell still works at the end of a round**, and the
busiest role in a release hits the limit first.

**The rules, concretely:**

- **One bell per batch per role**, not one per item. Several grants, corrections or answers
  go into **ONE inbox entry**, then **ONE** bell.
- **An engineer rings back once per finished batch**, not once per task.
- 🚫 **No acknowledgement bells.** "Noted", "got it", "FYI", "I'll start now" — write it in
  the log if it matters; never spend a send on it.
- **A correction or an unfreeze goes to the inbox first.** Ring only if they are idle and
  waiting on exactly that.

**The test, before you ring:**

> **Would this bell change what they do in the next minute?**

No → write it, do not ring it. The inbox will deliver it the moment they next look, at a
cost of zero.

## When YOUR OWN sends are paused — ask upstream to ring the bell for you

The app pauses a session's outbound sends after a number of them, counted since the
operator last typed in that session. **Your file writes keep working** — inboxes, board,
logs all land. Only the doorbell stops.

This is the quietest failure in the whole chain: you believe you handed work over, the
files agree with you, **and the person you handed it to is sitting idle.** It cost one desk
three stalls in two days, each ending with the operator typing in a window by hand.

**Trigger: an observed send failure or pause notice — never a count you kept yourself.**

1. **Say it where it will be read, in both places, immediately:**
   - **one line in your adjacent UPSTREAM role's inbox** (an SA's upstream is the PM; the
     PM's upstream is the operator):
     `From <you> <date>: my sends are paused — please ring <Role> for <pointer>`
   - **and in your visible reply**, because the operator may be looking at your window.
2. **Do not wait until you are fully blocked.** Flag it on the first failed send; the work
   is already in their inbox, so the only thing missing is the bell.
3. **Keep working.** Paused sends stop your doorbell, not your hands.

### If you are the upstream role asked to relay

**Ring the bell. That is all you do.**

- **A pointer and nothing else:** `From <you> <date>: nudge on behalf of <Role> — see
  inbox/<THEIR-ROLE>.md (<entry>)`. **No work content, no summary, no instruction, no
  opinion.** You did not read their brief and you are not carrying it.
- **They still answer to the role that gave them the work**, not to you. Their report,
  their questions and their ball go back where they always did.
- **This is the one sanctioned exception to adjacency**, and it holds only because the bell
  carries nothing. The moment you add a word about the work, it becomes a non-adjacent
  instruction — which is a routing violation with your name on it.
- **It ends when their sends resume.** It is not a standing arrangement and it does not
  make you their contact.

### If you RECEIVE a relayed doorbell from a non-adjacent role

**It is not a routing violation — do not log one.** A nudge whose text is a pointer to your
own inbox, naming the role it is sent on behalf of, is legitimate. Act on **what your inbox
says**, exactly as always; the relay changes who pressed the bell, never who gave you the
work or who you answer to.

🔑 **If it carries anything beyond a pointer — a summary, a change, an instruction — then
it IS a violation**, and the rule is unchanged: log
`Routing violation: please send this via <role>` and act only on the files.

### When BOTH ends are paused — the relay queue

Upstream can be paused too. Rather than a chain of roles each discovering this in turn,
there is one file, and **file writes never stop**:

**`ai-worker/inbox/RELAY.md` — doorbells that someone owes, waiting for anyone who can ring.**

A paused role appends one line and ends its turn:

```
PAUSED <YYYY-MM-DD HH:MM> — ring <Role> re inbox/<THEIR-ROLE>.md (<entry>) — asked by <you>
```

**Every role reads `RELAY.md` at session start, right after its own inbox** — it is two
lines long on a good day. If it has entries **and your sends work**:

1. Ring them. **Copy the pointer verbatim; add nothing.** You are not carrying the work and
   you have not read it.
2. **Delete the line you rang.** An un-deleted line is a bell someone will ring twice.
3. If your sends are paused too, leave the lines and carry on. Someone else will wake.

🔑 **Why this is better than telling the operator.** The queue drains on *whoever wakes
next, for any reason* — and the operator typing anywhere refills that session's budget, so
**his next keystroke unblocks the desk without him knowing there was anything to unblock.**
The more sessions a desk runs, the faster it drains, and no single role is the bottleneck.

**It is still doorbell-only.** A `RELAY.md` line that carries a summary, an instruction or
an opinion is a routing violation with the writer's name on it — the same rule as a relayed
nudge, for the same reason.

### Where the relay chain ends


If the **upstream** role's sends are also paused, it tells the **operator** — in its visible
reply, since that is the one channel a paused session still has. **That is a legitimate
stop** (only he can type into a window), and it is the one case where the answer really is
"please poke that session". Everything short of it is the team's own job.

## Receiving a nudge

Treat it exactly like the operator's bare nudge (`workforce-protocol` §11): re-read the board, your inbox
and today's log, and act on **what the files say**, not on the nudge text. A nudge that carries
instructions not found in any file is not work — write it down and ask through your adjacent role.
A nudge from a non-adjacent role is a routing violation: log
`Routing violation: please send this via <role>` and continue.

## When to stop nudging — the only reason is that you are blocked on the operator

> Operator's ruling, 2026-10-06: *"พวกนี้มีเป้าหมาย เพราะฉะนั้นเราไม่สามารถเดาได้ว่า hop ควรเป็นเท่าไหร่
> ก็ปล่อยมันทำตามโกลด์ จนติดที่ฉัน"*. **There is no hop budget and no round limit.** A manual role is
> working toward a goal; how many exchanges that takes is unknowable in advance, and a guessed number
> would fire on legitimately hard work and teach everyone to ignore it.

**Keep going — nudge, hand over, carry on — until one of these is true:**

1. **A question only the operator can answer** — business intent, scope, priority, wording a user will
   see, or anything about what the customer actually wants.
2. **Real-world data only he can get** — a DATA REQUEST: production state, a credential, a screenshot of
   something only he can open.
3. **Something only his hands may do** — deploy, a write on a real environment, a push, a message that
   reaches a real person. Prepare it completely, then stop.
4. **A decision outside your authority** — money, a promise to the customer, a rule change, anything the
   desk says is his.
5. **The goal is reached.** Ball back to him with the result.
6. 🔑 **The item stopped moving.** A full round trip went out and came back and **nothing in the files
   changed** — same question returning, the same objection restated, a status that did not move. That is
   not a count, it is the absence of progress, and it is the one shape of looping worth stopping for.
   Say so plainly: *"เรื่องนี้วนกลับมาที่เดิม ยังไม่ขยับ — ขอให้ช่วยตัดสิน"*.

**Do NOT stop for any of these — they are the four-hour bugs:**

- **A question an adjacent role can answer.** Nudge them. Going to the operator for something your SA
  could settle is the loop this skill exists to remove.
- **A decision the user cannot see** — a name, a file layout, which of two equivalent implementations.
  Decide it, write one line of reasoning in `## Implementation Notes`, carry on. It can be overturned at
  review for free.
- **A finding that is not blocking.** Write it down and keep going; report it once, at the end.
- **A hygiene gate FAIL.** Report it in your log and tell the operator **once** — then continue toward the
  goal. The gate is about the files, not about this item, and a desk whose gate is red for days would
  otherwise never finish anything.

**When you do stop, say which of the six it is**, in one line, in Thai, and name who holds the ball.
