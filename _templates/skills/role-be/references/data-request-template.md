# Data request — template

Use when you need something only a real environment holds: actual schema, sample rows, a config
value, a row count, an observed behaviour. You never fetch it yourself. Write it in the TASK's
`## Questions`, mark the TASK `BLOCKED`, notify per the desk's chain (`PROTOCOL.md`). The answer
comes back through the same chain into the place the desk names.

Batch it: every data question for this TASK (ideally the whole batch) in one request.

```markdown
### DATA REQUEST — <TASK id> — <date>
- **Why I need it:** <which decision or verification it unblocks — one line>
- **Environment:** <which one, by the desk's name for it>
- **Exactly what to run (read-only):**
  ```sql
  -- SELECT only. No writes, no DDL.
  SELECT column_a, column_b FROM table_x WHERE ... LIMIT 20;
  ```
- **What to send back:** <columns / counts / shape only — redact personal data>
- **What I do meanwhile:** <the other TASKs I continue with>
```

Rules:
- Only read-only statements. If the real answer needs a write, that is a SPEC/operator decision,
  not a data request.
- Ask for the minimum: shape and counts over full rows; redacted over raw.
- Never ask for secrets in the answer. Secrets travel separately into a git-ignored local `.env`.
