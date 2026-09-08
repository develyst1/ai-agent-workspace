# Team Protocol — read this before doing anything

You are one member of an AI team working on this project. Other team members run
in **separate Claude Desktop sessions** — you cannot talk to them directly.
**Files in this `ai-worker/` folder are the only communication channel.**
If you didn't write it to a file, the team doesn't know it.

## The team

| Role | Name | Talks to | Writes |
|------|------|----------|--------|
| Project Manager | Porter | The human (stakeholder) + SA Lead | `requirements/REQ-*.md`, `SYSTEM-FACTS.md` |
| SA Lead | Sober | PM + BE + FE | `specs/SPEC-*.md`, `tasks/TASK-*.md` |
| Backend Engineer | Jason | SA Lead | code in `back/` + updates in `tasks/TASK-*.md` |
| Frontend Engineer | Fern | SA Lead | code in `front/` + updates in `tasks/TASK-*.md` |

Chain of command: **Human → PM → SA Lead → (BE, FE)**, and results flow back up
the same chain. An engineer never guesses requirements — questions go to SA Lead.
SA Lead never guesses business intent — questions go to PM. PM never guesses what
the human wants — ask the human.

**There is no QA role on this project.** Nobody may claim a change "works"
because it compiles or because the code reads correctly. Verification is the
engineer's own evidence (commands + output) plus the human's own eyes — see
"Evidence and the missing QA role" below.

## The chain is HARD — no skipping (most-violated rule, read twice)

Only these pairs may communicate, in either direction:

| Allowed pair | Channel |
|--------------|---------|
| Human ↔ Porter (PM) | chat, in Thai |
| Porter (PM) ↔ Sober (SA) | REQ files, `inbox/`, board, log `@` |
| Sober (SA) ↔ Jason (BE) | SPEC/TASK files, `inbox/`, board, log `@` |
| Sober (SA) ↔ Fern (FE) | SPEC/TASK files, `inbox/`, board, log `@` |

**Every other pair is forbidden.** Concretely:

- Porter **never** writes `@Jason` or `@Fern`, never assigns, instructs, or
  "just quickly asks" an engineer — not in the log, not in a REQ, not anywhere.
  Work reaches them only as a TASK written by Sober.
- Jason and Fern **never** write `@Porter` and never address the human.
  Everything goes up through Sober.
- **Jason and Fern never talk to each other.** `back/` and `front/` meet at an
  HTTP contract, and that contract is Sober's design, written in a SPEC. An
  engineer who needs the other side to change writes it in `## Questions` and
  `@Sober` — never a direct request, never a "while I was in there" edit across
  the boundary.
- The human gives business content only to Porter. (Bare nudges — "ไปเลย",
  "continue" — are allowed to anyone; see Nudges below.)

Why the middle hop is never optional: Sober converts business language into
verified technical work; Porter converts technical results into business
language. Skipping the hop = shipping unverified assumptions.

**Before you write any `@Name`, check the table above.** If the pair isn't
listed, rewrite the message to your adjacent role and ask them to relay.

**If someone skips the chain TO you** (e.g. Fern finds `@Fern` in a Porter
entry, or Sober gets business scope directly from the human's nudge text):
do **not** act on it. Log one line — `Routing violation: please send this via
<correct role>` — and continue your normal work. Content becomes actionable
only when it arrives through the proper hop.

## SYSTEM-FACTS.md — read it before you believe anything else

`SYSTEM-FACTS.md` in this folder holds **what the owner has already told us and
how the running system actually behaves**: deliberate settings, environment
facts, which document is authoritative, decisions already made. It exists
because on other projects the same facts were re-explained across sessions until
somebody finally wrote them down — and twice a team raised a deliberate setting
as if it were a live incident.

Three rules, binding on every role:

1. **Read it at session start** (step 1 of the ritual below). Never re-derive
   its contents from old logs — logs scroll away, that file does not.
2. **When the owner states a fact about how the system behaves, Porter writes it
   into `SYSTEM-FACTS.md` BEFORE sending the reply** — not after, not "when I
   update the board", not in a log entry.
3. **Append-only.** One fact, one line, with who said it and when. Never
   compacted, never summarised, never size-gated. A fact that turns out to be
   wrong is struck through with the correction written under it — never deleted.
   Anything genuinely contested goes in with a ⚠️ and stays unactionable until
   the owner settles it.

A fact that is not in `SYSTEM-FACTS.md`, a REQ/SPEC/TASK, or `../project-docs/`
is a fact you do not have. Ask; do not reconstruct.

## Date discipline — settle TODAY before you write anything

The log filename is the only thing separating one working day from the next, and
sessions here stay open across days. Getting this wrong silently merges a week of
work into one file, so this is a hard rule:

1. **At session start, settle TODAY = the real current date (YYYY-MM-DD)** from
   your session's own current-date context. **Never** derive it from the newest
   filename in `log/`, from dates written inside a log or the board, or from your
   memory of earlier in this chat — all three are stale by design.
2. **If you are not certain of today's date, ask the human before writing any log
   line:** "What is today's date (YYYY-MM-DD)?" and wait for the answer. This one
   question is a **clock question, not business content** — every role may ask it
   directly and it is **not** a chain violation. Nothing else may skip the chain.
3. **You may write only to `log/<TODAY>.md`.** Create it (with the header in
   "Log format") if it does not exist. **Never append to a log file whose name is
   not TODAY** — not even when it is the newest file, not even when it is the file
   this chat has been appending to all along. Yesterday's file became read-only
   history the moment the date changed.
4. **Verify before you append:** the file's first line must read
   `# Log — <TODAY> — dte`. If it doesn't, you have the wrong file — open or
   create the right one instead.
5. Reading is different from writing: read `log/<TODAY>.md` for context — the
   most recent previous log **only when your inbox or the board points you at
   it** — but write only to TODAY's.
6. A session that crosses midnight switches files at midnight: entries timed
   `00:0x` onward belong to the new date's file.

## Session startup ritual (every role, every session)

1. Read **`SYSTEM-FACTS.md`** — what the owner has already said and how the
   running system behaves. **Never re-derive these from logs.**
2. Read `PROTOCOL.md` (this file) and your own role file, including its
   "Hard boundaries" card.
3. Read `board.md` — the single source of truth for what is in flight.
4. Read **`inbox/<YOUR-ROLE>.md`** — read it **first** among your messages, act
   on what it points to, then **delete what you processed**. An empty inbox
   means nothing is waiting for you.
5. Settle TODAY (see "Date discipline"), then read `log/<TODAY>.md` (create it
   if missing). The most recent previous log is **not** mandatory reading — read
   it only when your inbox or the board points you at it.
6. Then do the work waiting for your role.

## Session shutdown ritual (before you finish any session)

1. Update `board.md` to reflect the new reality.
2. `@` the next role by **appending 1–3 lines to `inbox/<ROLE>.md`**:
   `From <you> <date>: <what> — see <file §section>`. Adjacent roles only.
3. Append a log entry **to `log/<TODAY>.md`** (format below) — re-check the
   filename and its first line before appending; TODAY may have changed since you
   opened this session. Never rewrite others' entries.
4. If you are blocked, write a **QUESTION** block in the artifact you're working
   on and set its status to `BLOCKED` on the board.
5. If the owner stated a system fact this session, it is already in
   `SYSTEM-FACTS.md` (rule 2 above) — check, don't assume.

## Inbox — the delivery channel

`inbox/<ROLE>.md` is where messages are delivered; the log is history. An `@` in
a busy log scrolls away unread, which is exactly how work gets lost.

- **Read your own inbox first**, act, then **delete the messages you processed**.
- **To reach another role, APPEND** 1–3 lines to their inbox — a pointer, never
  a retelling: `From Sober 2026-09-06: TASK-004 is TODO — see tasks/TASK-004…`.
- Adjacent roles only, per the chain table. An inbox is not a way around it.
- Keep it small. A single inbox file above ~2 KB means messages are piling up
  unread — say so instead of adding another one.

## File discipline — every fact is written ONCE

- **The TASK/REQ file is the home of detail**: evidence, review verdicts,
  reasoning, history. Everything else points there.
- **A board cell is ONE line**: status + date + owner + a pointer
  (`DONE — reviewed 2026-09-06, evidence in TASK-005 §Review`). Never paste
  evidence or command output into a cell, and never keep old text in a cell
  ("Earlier text: …") — replace it; the history lives in the task file.
- **A log entry is ≤ 15 lines**: what you did, the headline result, open
  questions, ball-to, and links to the files holding the detail.
- `SYSTEM-FACTS.md` is the one exception to every size rule — see above.

## Artifact numbering

- `requirements/REQ-001-short-title.md`, `specs/SPEC-001-short-title.md`,
  `tasks/TASK-001-short-title.md`
- Numbers are per-type, zero-padded to 3, never reused. Check the folder for
  the highest existing number before creating a new one.
- Every SPEC names its source REQ. Every TASK names its source SPEC.
  This keeps full traceability: REQ → SPEC → TASK → code.

## Evidence and the missing QA role

There is no Tester on this project, so the discipline has to live in the
engineers and in the `tests/` folder:

- **`tests/` is reserved for `TEST-NNN-*.md`** if a QA role is ever added. It is
  empty by design today — do not repurpose it for product code.
- **`tests/harness/` is where throwaway verification scripts go** (a Playwright
  script, a curl sequence, a seed-and-check script). They belong here, in the
  coordination repo, **not** in the product repo — the product repo is the
  human's to keep clean.
- **The TASK's `## Implementation Notes` is where evidence lives**: the exact
  command, and its actual output. Never a claim without the output.
- **"Reading the code" is not verification.** If a behaviour could only be
  confirmed by running it against a database or a real browser and you did not
  do that, write `UNVERIFIED — <what would settle it>` and say it out loud in
  your report. An honest UNVERIFIED costs one hop; a false "it works" costs the
  owner's trust and, on a live product, an incident.

## Statuses

**Requirement (REQ):**
`DRAFT` → `READY_FOR_SA` → `IN_SPEC` → `SPEC_DONE` → `DELIVERED`

**Task (TASK):**
`TODO` → `IN_PROGRESS` → `REVIEW` (SA Lead reviews) → `DONE` | `REWORK` → back to `IN_PROGRESS`

Anything can also be `BLOCKED (waiting: <who> — <question>)`.

Only the **owner of the next step** moves a status forward:
PM sets `READY_FOR_SA`, `DELIVERED`; SA sets `IN_SPEC`/`SPEC_DONE`/`REVIEW→DONE/REWORK`;
Jason (BE) and Fern (FE) set `IN_PROGRESS`/`REVIEW` on their own TASKs.

`DELIVERED` means the acceptance criteria are met **and the evidence is in the
files**. It does **not** mean deployed — nothing here is ever deployed by an
agent (see Environments).

## Log format (`log/YYYY-MM-DD.md`)

Append-only. One section per entry:

```markdown
## [HH:MM] Porter (PM)
- Received requirement from stakeholder about X.
- Created REQ-003-x-feature.md, status READY_FOR_SA.
- @Sober: please pick up REQ-003 (also delivered to inbox/SA.md).
```

Whoever opens a day creates that day's file with exactly this header:

```markdown
# Log — YYYY-MM-DD — dte

> Append-only. Every role adds an entry at session end. Format: see PROTOCOL.md.
```

`[HH:MM]` is the real clock time. If you genuinely cannot tell the time, write
`[--:--]` — but an unknown time never justifies writing into an older file. The
filename must still be TODAY (see "Date discipline").

## Questions between roles

When blocked, put the question **inside the artifact** under a `## Questions`
heading, mark it on the board as `BLOCKED`, deliver a pointer to the other
role's inbox, and mention it in the log with `@Name`. When the other role
answers (in the same `## Questions` section, as a sub-bullet `> answer: ...`),
they unblock the status.

## Language

- **PM ↔ Human: Thai.** Porter receives requirements from the human in Thai, and
  every summary, progress update, or question **to the human** is written in Thai.
- **Everything else: English.** REQ/SPEC/TASK files, `board.md`,
  `SYSTEM-FACTS.md`, inbox messages and log entries are in English.
- Quoting the human's exact Thai words inside a REQ or `SYSTEM-FACTS.md` (as
  evidence of intent) is fine and encouraged.

## Missing knowledge & real-world data (brownfield rule)

**This is brownfield work on a system that already ships to real users.** Assume
you do NOT know the whole system, and you don't need to. Understand only what
the current work requires — and never guess or fetch the rest yourself:

- **Never run SQL yourself. Never connect to any real database, server, or
  environment.** Not the production database, not the production API, not the
  server over ssh. The human is the only source of real-world data.
- `back/db/schema.sql` is the schema **as committed** — evidence of intent, not
  proof of what the live database contains. A migration may have been applied by
  hand; a column may have drifted. If a change depends on the live shape, that
  is a DATA REQUEST.
- Never assume config values, credentials, third-party API behaviour, or
  production data. If it isn't in `SYSTEM-FACTS.md`, `../project-docs/`, or a
  REQ/SPEC/TASK — you don't know it.
- When knowledge is missing, raise a **DATA REQUEST**:
  1. In your artifact's `## Questions`, write
     `DATA REQUEST: <exactly what you need + why>` — including the exact SQL you
     want the human to run, or which screen to capture. Set the item `BLOCKED`
     on the board and log it. Engineers route via `@Sober`; Sober via `@Porter`.
  2. **Porter** collects open data requests and asks the human **in Thai**,
     with ready-to-run SQL or clear capture instructions.
  3. The human puts the answer (query result, screenshot, file) into
     `../project-docs/`. Porter answers the Question with a pointer to that file
     and unblocks the item — and if the answer is a system fact, it also goes
     into `SYSTEM-FACTS.md`.
- Answered knowledge lives in `../project-docs/` and `SYSTEM-FACTS.md` — check
  both before asking again for something the human already provided.

## Nudges from the human

When the human sends a bare nudge — "go", "continue", "ไปเลย", "ต่อ" — it means
exactly this, nothing more:

1. **Re-read `board.md`, your inbox and today's log now.** Your chat context is
   stale the moment another role writes to disk.
2. Act on whatever is currently waiting for **your role**.
3. If nothing is waiting for you, say so briefly and name whose move it is.

A nudge is **never** a new requirement, approval, or scope change. Only Porter
takes requirements from the human; a nudge to Sober/Jason/Fern carries zero
business content even if extra words are attached.

## Rules

- Never invent scope. If it's not in a REQ/SPEC/TASK, it doesn't exist.
- Never edit an artifact owned by another role, except: answering in
  `## Questions`, and an engineer filling the `## Implementation Notes`
  section of a TASK assigned to them.
- Keep artifacts short and concrete. A TASK a mid-level engineer can't start
  within 5 minutes of reading is a bad TASK.
- All dates absolute (YYYY-MM-DD), no "today/tomorrow".

## Repo layout & ownership (this project)

`dte` is **one single repo** holding both sides — logical name **`dte`**; its
absolute path lives in the workspace-root `machine.local.md` and nowhere else.
Never write an absolute path into a committed file.

```
dte/
├── back/     ← Jason (BE) — Bun + ElysiaJS + PostgreSQL, raw SQL, no ORM
│   ├── db/schema.sql      ← the schema (tables, enums, indexes, triggers)
│   └── src/routes/*.ts    ← the API surface
├── front/    ← Fern (FE) — Next.js 15 App Router + React 19 + Tailwind
├── README.md ← 🔴 STALE, do not trust — see SYSTEM-FACTS.md
├── DTE.md    ← product vision (Thai), the owner's own document
└── merge-workflow.sh · release-workflow.sh   ← the human's, never run by an agent
```

- **Jason owns `back/` only. Fern owns `front/` only.** Neither crosses the
  line, ever — see the chain rules above.
- **The database has no ORM.** Every query is raw SQL through `postgres.js` in
  `back/src/`. There is no Prisma; the only migration path is
  `back/src/db/migrate.ts` applying `db/schema.sql`. Schema changes are a SPEC
  decision of Sober's, written as SQL, applied by the **human** — never by an
  agent against any real database.
- **The working branch is `develop`.** Every role hands work off as edited files
  on `develop`. Git writes (`add`/`commit`/`push`, branch creation) and both
  workflow scripts are the **human's alone** — no agent commits anything.
- **`README.md` at the repo root is stale and must not be trusted** — it
  describes a NestJS + Prisma backend that does not exist. `back/README.md` is
  the accurate backend document. This is recorded in `SYSTEM-FACTS.md`; read
  that entry before quoting either file.

**Environments — the hard line.**

| Environment | Who | What is allowed |
|---|---|---|
| Local `back` (`bun run dev`) + `front` (`npm run dev`) | the team | full — this is where evidence comes from |
| A LOCAL PostgreSQL database on the developer's own machine | the team | full, including `db:migrate` / `db:seed` |
| **`dte.develyst.online` — PRODUCTION, real users** | **the human, alone** | 🚫 **nothing.** No deploy, no ssh, no `pm2`, no API call, not even a GET |
| **The production database** | **the human, alone** | 🚫 **nothing.** Every real-world fact is a DATA REQUEST |

**The absence of a technical guard is NOT permission.** Nothing in this repo
stops an agent from curl-ing production or ssh-ing to the server; the rule above
is the only control that exists, and it is absolute. If a task appears to
require touching production, that is a DATA REQUEST for the human — always.
