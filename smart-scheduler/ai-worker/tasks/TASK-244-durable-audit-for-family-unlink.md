# TASK-244: a durable trail for the one act that can move a LINE account between families

- Source: @Jason's Q1 on TASK-243 — he named the limit rather than letting it be implied
- Status: TODO — 🟢 **after the REQ-079 deploy.** Not now: `0030`/`0031` are still unrun on `sid`, and this needs
  its own migration.
- Repo: **smart-scheduler-back**. Assignee: **@Jason**

## Why this one act, and not "auditing" in general

`clearFamilyLine` (TASK-243) logs `[family-link] CLEARED parent=… accounts=… by=…` — the same shape the codebase
already uses for facts that matter (`[sale] NOT POSTED`, `[outbox]`). **For most things here that is enough.**

**This one is different, and @Jason's own reasoning is why:** it is **the only way a LINE account can move
between families**, which is precisely what `family_line_links_user_uq` exists to stop happening silently. So it
is simultaneously:
- the act most likely to be questioned months later (*"why can this parent see that family?"*), and
- the only act whose answer currently expires with the log rotation.

⚠️ **A console line answers "who unbound this family in March" only while March's logs exist.** That is the gap.

## What to do

- A small durable row per clear: **who, which family, which accounts, when.** Nothing more — this is not a
  general audit facility and must not become one in this task.
- 🔴 **Count `drizzle/*.sql` against the journal at the moment you write it** (board rule) and **witness on the
  new table**, not a column that could pre-exist.
- Keep `clearFamilyLine` the single writer; the row is part of the same transaction as the clear (TASK-243's
  wrap), so a clear that happened is always a clear that is recorded, and vice versa. **A trail that can
  disagree with the act it describes is worse than none.**
- 🚫 Do not retrofit other actions into it. If a second act ever wants a trail, that is a decision about scope,
  not a table that quietly grew.

## Definition of Done
- [ ] Every clear writes exactly one row, in the same transaction as the clear.
- [ ] The row survives log rotation — assert it is read back after the fact, not just written.
- [ ] The console line stays (it is what an operator watching a terminal sees).
- [ ] `tsc` 0 · `bun test` green · migration counted, journal-registered, witnessed on the new table.
- [ ] 🔴 `sid` first, `db:verify` ✅ before any restart; state how it was proven there.

## Implementation Notes
(Jason.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
