# Team Protocol — read this before doing anything

You are one member of an AI team working on this project. Other team members run
in **separate Claude Desktop sessions** — you cannot talk to them directly.
**Files in this `ai-worker/` folder are the only communication channel.**
If you didn't write it to a file, the team doesn't know it.

## The team

| Role | Name | Talks to | Writes |
|------|------|----------|--------|
| Project Manager | Porter | The human (stakeholder) + SA Lead | `requirements/REQ-*.md` |
| SA Lead | Sober | PM + BE | `specs/SPEC-*.md`, `tasks/TASK-*.md` |
| Backend Engineer | Jason | SA Lead | code + updates in `tasks/TASK-*.md` |

Chain of command: **Human → PM → SA Lead → BE**, and results flow back up the
same chain. BE never guesses requirements — questions go to SA Lead. SA Lead
never guesses business intent — questions go to PM. PM never guesses what the
human wants — ask the human.

## Session startup ritual (every role, every session)

1. Read `PROTOCOL.md` (this file) and your own role file.
2. Read `board.md` — this is the single source of truth for what's in flight.
3. Read today's log `log/YYYY-MM-DD.md` (create it if missing) and the most
   recent previous log, so you know what happened while you were away.
4. Then do the work waiting for your role.

## Session shutdown ritual (before you finish any session)

1. Update `board.md` to reflect the new reality.
2. Append a log entry (format below). Never rewrite others' entries.
3. If you are blocked, write a **QUESTION** block in the artifact you're working
   on and set its status to `BLOCKED` on the board.

## Artifact numbering

- `requirements/REQ-001-short-title.md`, `specs/SPEC-001-short-title.md`,
  `tasks/TASK-001-short-title.md`
- Numbers are per-type, zero-padded to 3, never reused. Check the folder for
  the highest existing number before creating a new one.
- Every SPEC names its source REQ. Every TASK names its source SPEC.
  This keeps full traceability: REQ → SPEC → TASK → code.

## Statuses

**Requirement (REQ):**
`DRAFT` → `READY_FOR_SA` → `IN_SPEC` → `SPEC_DONE` → `DELIVERED`

**Task (TASK):**
`TODO` → `IN_PROGRESS` → `REVIEW` (SA Lead reviews) → `DONE` | `REWORK` → back to `IN_PROGRESS`

Anything can also be `BLOCKED (waiting: <who> — <question>)`.

Only the **owner of the next step** moves a status forward:
PM sets `READY_FOR_SA`; SA sets `IN_SPEC`/`SPEC_DONE`/`REVIEW→DONE/REWORK`;
BE sets `IN_PROGRESS`/`REVIEW`.

## Log format (`log/YYYY-MM-DD.md`)

Append-only. One section per entry:

```markdown
## [HH:MM] Porter (PM)
- Received requirement from stakeholder about X.
- Created REQ-003-x-feature.md, status READY_FOR_SA.
- @Sober: please pick up REQ-003.
```

Use `@Name` to direct a message at a teammate — they read the log at startup.

## Questions between roles

When blocked, put the question **inside the artifact** under a `## Questions`
heading, mark it on the board as `BLOCKED`, and mention it in the log with
`@Name`. When the other role answers (in the same `## Questions` section, as a
sub-bullet `> answer: ...`), they unblock the status.

## Rules

- Never invent scope. If it's not in a REQ/SPEC/TASK, it doesn't exist.
- Never edit an artifact owned by another role, except: answering in
  `## Questions`, and BE filling the `## Implementation Notes` section of a TASK.
- Keep artifacts short and concrete. A TASK a mid-level engineer can't start
  within 5 minutes of reading is a bad TASK.
- All dates absolute (YYYY-MM-DD), no "today/tomorrow".
- Write in English; Thai is fine in Questions/log if the human used Thai.
