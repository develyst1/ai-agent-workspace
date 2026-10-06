# Log format and `append-log.mjs`

Back to [SKILL.md §6](../SKILL.md). The desk's `PROTOCOL.md` § "Log format" wins if it differs.

## The file

`<desk>/ai-worker/log/YYYY-MM-DD.md` — one file per real calendar day, append-only. Whoever opens
the day creates it with exactly this header (the script does this for you):

```markdown
# Log — YYYY-MM-DD — <desk>

> Append-only. Every role adds an entry at session end. Format: see PROTOCOL.md.
```

Before appending by any other means (there should be none), the first line must read
`# Log — <TODAY> — <desk>`. If it doesn't, you have the wrong file.

## One entry

```markdown
## [HH:MM] <Name> (<ROLE>, Team <T>)
- hygiene: RESULT: PASS …            ← the gate's RESULT line, first
- REQ-003 IN_SPEC; SPEC-B-001 drafted — see specs/SPEC-B-001-….md
- Open: DATA REQUEST in SPEC-B-001 §Questions (BLOCKED, waiting: PM)
- Ball: PM (pointer in inbox/PM.md)
```

- Heading carries the identity from SKILL.md §1. Roles that span teams (or desks without teams)
  write `<Name> (<ROLE>)`.
- **≤ 15 lines.** What you did, the headline result, open questions, who holds the ball, links.
  Detail lives in the artifact; never paste command output here.
- `[HH:MM]` is real clock time. If you genuinely cannot tell, `[--:--]` — an unknown time never
  justifies writing into an older file.
- Never rewrite or delete anyone's entry, including your own earlier one. Correct by a new entry.

## Writing it — only through the script

```bash
# from the desk folder
node ai-worker/append-log.mjs "<Name> (<ROLE>, Team <T>)" <<'EOF'
- hygiene: RESULT: PASS
- TASK-B-004 REVIEW — evidence in tasks/TASK-B-004-….md §Implementation Notes
- Ball: SA (pointer in inbox/SA-B.md)
EOF
```

- Body on stdin, via a heredoc whose delimiter is **quoted** (`<<'EOF'`) so the shell leaves
  `$`, backticks and backslashes alone. Never `node -e`, never `>`/`>>`, never an editor on `log/`.
- The script computes TODAY from the **local** clock, writes the day header if the file is new,
  writes the `## [HH:MM] <who>` heading itself, and appends. It prints the bytes appended — read
  that line; it is your evidence the entry landed.
- It exits non-zero on a missing name or an empty body; nothing is written then.
- From the workspace root the same call is `node <desk>/ai-worker/append-log.mjs "…"`; the script
  locates the log folder from its own path.
- If a desk has no `append-log.mjs`, use the editor tool to append to `log/<TODAY>.md` only, and
  report the missing script to the PM.
