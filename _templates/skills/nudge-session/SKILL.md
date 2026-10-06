---
name: nudge-session
description: "Load when an AI-workforce role on a desk in ai-agent-workspace needs to wake another role whose Claude session is already open (e.g. a PM waking its SA, an SA waking its FE), or when you RECEIVE such a nudge. Covers: files first then a one-line nudge, finding the session with ListAgents, adjacency per the desk's chain, delivered ≠ read, notify_when_idle instead of polling, no permission laundering, when to stop nudging, and how to act on a nudge you receive. Do NOT use to deliver work content (that goes in files), to reach the operator, or outside a desk."
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
2. **Find the session.** Run `ListAgents`; use the **exact name it prints**. Session names are the
   operator's, not yours — do not guess one, do not reconstruct it from the roster. Not listed → tell the
   operator in one line ("<Name>'s session isn't open"). **Do not spawn a subagent in its place** unless
   the operator approved a subagent for this round in words that have only one reading (a desk has already
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
