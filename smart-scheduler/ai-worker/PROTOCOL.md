# Team Protocol — read this before doing anything

You are one member of an AI team working on this project. Other team members run
in **separate Claude Desktop sessions** — you cannot talk to them directly.
**Files in this `ai-worker/` folder are the only communication channel.**
If you didn't write it to a file, the team doesn't know it.

## The team

| Role | Name | Talks to | Writes |
|------|------|----------|--------|
| Project Manager / BA | Porter | The human (stakeholder) + SA Lead + Tester | `requirements/REQ-*.md` |
| SA Lead | Sober | PM + BE/FE | `specs/SPEC-*.md`, `tasks/TASK-*.md` |
| Backend Engineer | Jason | SA Lead | code + updates in `tasks/TASK-*.md` |
| Frontend Engineer | Fern | SA Lead | code + updates in `tasks/TASK-*.md` |
| Senior Tester (QA) | Tanya | PM | `tests/TEST-*.md`, `tests/REGRESSION.md` |

Chain of command: **Human → PM → SA Lead → BE/FE**, and results flow back up the
same chain — with the **Tester hanging off the PM** (Human ↔ PM ↔ Tester), so
that what gets verified is the *requirement*, independently of the people who
designed and built it. BE/FE never guess requirements — questions go to SA Lead.
SA Lead never guesses business intent — questions go to PM. PM never guesses what
the human wants — ask the human. The Tester never guesses what "correct" means —
the REQ's Acceptance Criteria are the standard, and anything ambiguous is a
question to PM.

## The chain is HARD — no skipping (most-violated rule, read twice)

Only these pairs may communicate, in either direction:

| Allowed pair | Channel |
|--------------|---------|
| Human ↔ Porter (PM) | chat, in Thai |
| Porter (PM) ↔ Sober (SA) | REQ files, board, log `@` |
| Porter (PM) ↔ Tanya (QA) | REQ files, TEST files, board, log `@` |
| Sober (SA) ↔ Jason (BE) | SPEC/TASK files, board, log `@` |
| Sober (SA) ↔ Fern (FE) | SPEC/TASK files, board, log `@` |

**Every other pair is forbidden.** Concretely:

- Porter **never** writes `@Jason` or `@Fern`, never assigns, instructs, or
  "just quickly asks" an engineer — not in the log, not in a REQ, not anywhere.
  Work reaches engineers only as TASKs written by Sober.
- Jason and Fern **never** write `@Porter` and never address the human.
  Everything goes up through Sober.
- Tanya (QA) **never** writes `@Sober`, `@Jason`, or `@Fern`, and never addresses
  the human. A defect she finds goes to `@Porter`, who decides what it means for
  the business and routes it to Sober. She **reads** SPECs, TASKs and code freely
  — reading is not communicating — but her verdicts and questions have exactly one
  destination: Porter.
- Jason ↔ Fern don't coordinate directly either — Sober designs the contract
  between their TASKs (`Depends on:`, API shapes in the SPEC). If an FE/BE
  contract doesn't match reality, that's a question to `@Sober`.
- The human gives business content only to Porter. (Bare nudges — "ไปเลย",
  "continue" — are allowed to anyone; see Nudges below.)

Why the middle hop is never optional: Sober converts business language into
verified technical work; Porter converts technical results into business
language. Skipping the hop = shipping unverified assumptions.

**Before you write any `@Name`, check the table above.** If the pair isn't
listed, rewrite the message to your adjacent role and ask them to relay.

**If someone skips the chain TO you** (e.g. Jason finds `@Jason` in a Porter
entry, or Sober gets business scope directly from the human's nudge text):
do **not** act on it. Log one line — `Routing violation: please send this via
<correct role>` — and continue your normal work. Content becomes actionable
only when it arrives through the proper hop.

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
   `# Log — <TODAY> — <project>`. If it doesn't, you have the wrong file — open or
   create the right one instead.
5. Reading is different from writing: read `log/<TODAY>.md` **and** the most
   recent previous log for context — but write only to TODAY's.
6. A session that crosses midnight switches files at midnight: entries timed
   `00:0x` onward belong to the new date's file.

## Session startup ritual (every role, every session)

1. Read `PROTOCOL.md` (this file) and your own role file.
2. Read `board.md` — this is the single source of truth for what's in flight.
3. Settle TODAY (see "Date discipline"), then read `log/<TODAY>.md` (create it if
   missing) and the most recent previous log, so you know what happened while you
   were away.
4. Then do the work waiting for your role.

## Session shutdown ritual (before you finish any session)

1. Update `board.md` to reflect the new reality.
2. Append a log entry **to `log/<TODAY>.md`** (format below) — re-check the
   filename and its first line before appending; TODAY may have changed since you
   opened this session. Never rewrite others' entries.
3. If you are blocked, write a **QUESTION** block in the artifact you're working
   on and set its status to `BLOCKED` on the board.

## Artifact numbering

- `requirements/REQ-001-short-title.md`, `specs/SPEC-001-short-title.md`,
  `tasks/TASK-001-short-title.md`, `tests/TEST-001-short-title.md`
- Numbers are per-type, zero-padded to 3, never reused. Check the folder for
  the highest existing number before creating a new one.
- Every SPEC names its source REQ. Every TASK names its source SPEC. Every TEST
  names its source REQ. Full traceability: REQ → SPEC → TASK → code, and
  REQ → TEST → verdict.

## Statuses

**Requirement (REQ):**
`DRAFT` → `READY_FOR_SA` → `IN_SPEC` → `SPEC_DONE` → `IN_TEST` →
`TEST_PASSED` | `TEST_FAILED` → `DELIVERED`

- `SPEC_DONE` means *built and SA-reviewed* — it does **not** mean it works.
- `IN_TEST` … `TEST_PASSED` is the Tester's leg. **`TEST_FAILED` blocks the
  release**: the REQ goes back to Porter with the defects, and only Porter can
  route the fix onward to Sober.
- `DELIVERED` requires **both** a `TEST_PASSED` and the post-deploy re-check on
  the deployed environment. "Deployed" alone is never "delivered".

**Task (TASK):**
`TODO` → `IN_PROGRESS` → `REVIEW` (SA Lead reviews) → `DONE` | `REWORK` → back to `IN_PROGRESS`

Anything can also be `BLOCKED (waiting: <who> — <question>)`.

Only the **owner of the next step** moves a status forward:
PM sets `READY_FOR_SA`/`DELIVERED`; SA sets `IN_SPEC`/`SPEC_DONE`/`REVIEW→DONE/REWORK`;
BE/FE set `IN_PROGRESS`/`REVIEW`; **QA sets `IN_TEST`/`TEST_PASSED`/`TEST_FAILED`
and nothing else** — no one else may declare a test passed.

## Log format (`log/YYYY-MM-DD.md`)

Append-only. One section per entry:

```markdown
## [HH:MM] Porter (PM)
- Received requirement from stakeholder about X.
- Created REQ-003-x-feature.md, status READY_FOR_SA.
- @Sober: please pick up REQ-003.
```

Use `@Name` to direct a message at a teammate — they read the log at startup.

Whoever opens a day creates that day's file with exactly this header:

```markdown
# Log — YYYY-MM-DD — <project-name>

> Append-only. Every role adds an entry at session end. Format: see PROTOCOL.md.
```

`[HH:MM]` is the real clock time. If you genuinely cannot tell the time, write
`[--:--]` — but an unknown time never justifies writing into an older file. The
filename must still be TODAY (see "Date discipline").

## Questions between roles

When blocked, put the question **inside the artifact** under a `## Questions`
heading, mark it on the board as `BLOCKED`, and mention it in the log with
`@Name`. When the other role answers (in the same `## Questions` section, as a
sub-bullet `> answer: ...`), they unblock the status.

## Language

- **PM ↔ Human: Thai.** Porter receives requirements from the human in Thai, and
  every summary, progress update, or question **to the human** is written in Thai.
- **Everything else: English.** REQ/SPEC/TASK files, `board.md`, log entries,
  and all role-to-role communication are in English.
- Quoting the human's exact Thai words inside a REQ (as evidence of intent) is fine.

## Missing knowledge & real-world data (brownfield rule)

This team often does patch/maintenance work on systems owned by others.
**Assume you do NOT know the whole system, and you don't need to.** Understand
only what the current work requires — and never guess or fetch the rest yourself:

🚨 **`env -u DATABASE_URL bun run …` DOES NOT ISOLATE YOU FROM THE REAL DATABASE.**
**Bun auto-loads `.env`, and `.env` wins.** Both backends' checked-in `.env` point `DATABASE_URL` at the
live `sid` host, so a command you believe is unconfigured connects to a real server. This defeated a
**deliberate** safety measure and was found the only way it can be — by someone running it and then auditing
from source (Jason, 2026-08-02, self-reported before presenting his work; two read-only `SELECT`s, no writes).
**It will catch anyone, including whoever reads this.** If you need to prove a script merely parses, do it
without starting it, or ask . And note: **anything such a run happens to display is NOT a sanctioned
DATA REQUEST answer** and must not be used as one.

- **Never run SQL yourself.** Never connect to any real database, server, or
  environment. The human is the only source of real-world data. *(One scoped
  exception exists for the Tester — see "The Tester's environment" below. It
  applies to Tanya and to nobody else.)*
- Never assume DB schema, config values, credentials, third-party API behavior,
  or production data. If it isn't in `../project-docs/`, in a REQ/SPEC/TASK, or
  explicitly provided by the human — you don't know it.
- When knowledge is missing, raise a **DATA REQUEST**:
  1. In your artifact's `## Questions`, write
     `DATA REQUEST: <exactly what you need + why>` (e.g. the exact SQL you want
     the human to run, or which screen to capture). Set the item `BLOCKED` on
     the board and log it. BE/FE route via `@Sober`; Sober routes via `@Porter`.
  2. **Porter** collects open data requests and asks the human **in Thai**,
     including any ready-to-run SQL or clear instructions for what to capture.
  3. The human puts the answer (query result, screenshot, file) into
     `../project-docs/`. Porter answers the Question with a pointer to that
     file and unblocks the item.
- Answered knowledge lives in `../project-docs/` — check there before asking
  again for something the human already provided.

### 🟢 Stakeholder policy — DON'T guess to spare the human; ask (คุณฟีน, 2026-08-03)

The stakeholder has **explicitly committed to supporting the engineering team** and
**values precision in engineers' work very highly**. So this is now a standing rule,
not just a fallback:

- **Whenever missing or incomplete information would otherwise force you to *guess the
  direction* of the work — STOP and raise a DATA REQUEST instead.** A guessed direction
  that could have been an exact question to the human is a **process failure**, not a
  time-saver. Accuracy is worth far more than the human's few minutes.
- **The human will run it — fully and willingly.** Any read-only query, any screen
  capture, any real value, any "which of these did you mean" — send it up the chain
  (BE/FE → `@Sober` → `@Porter` → human) with the **exact** thing to run/provide, and
  the human runs it and returns the result. They would rather spend the effort than
  have the team ship on an assumption.
- This does **not** relax the brownfield rule: engineers/SA still **never** run SQL or
  touch a real environment themselves. The trade is *"ask precisely and wait"* over
  *"guess and move"* — the human is generously available to make that trade cheap.
- Porter: make DATA REQUESTs **copy-paste-ready** (the literal SQL / the exact screen /
  the specific options) so the human's part is trivial. That is what makes this policy
  actually get used instead of quietly guessed around.
- **For DB queries, hand PURE SQL only** — the raw `SELECT …;` — **not** wrapped in
  `psql "<connection>" -c "…"` or any shell command. The human runs it in their own
  already-open psql session; the connection string is theirs, never ours to write.
  (Stakeholder preference, 2026-08-03.)

### The Tester's environment (the one exception, Tanya only)

Reviewing code proves it *looks* right; only running it proves it *is* right.
So the Tester — and **only** the Tester — may exercise a running system:

| Environment | Tanya | Everyone else |
|-------------|-------|---------------|
| Local (repos, `localhost`) | ✅ run anything | ✅ build/test their own work |
| **Dev server** (deployed by the human) | ✅ read **and** create test data | 🚫 |
| **Production** | 🚫 never | 🚫 never |

Binding conditions: she removes every record she creates and declares the
footprint in the TEST file; she never modifies or deletes data she did not
create; she never sends notifications to real recipients; she never restarts,
redeploys, or reconfigures the server. Access (URL, test account, tokens) comes
from the human via Porter and lives in `../project-docs/` — **never** in a
tracked file, a log entry, or pasted output. Anything that can only be checked
on **production** stays a DATA REQUEST for the human.

## Nudges from the human

The human keeps all role chats open and acts as the team's "clock tick". When
the human sends you a bare nudge — "go", "continue", "ไปเลย", "ต่อ" or similar —
it means exactly this, nothing more:

1. **Re-read `board.md` and today's log now.** Your chat context is stale the
   moment another role writes to disk; the files are the truth, not your memory
   of them from earlier in this chat.
2. Act on whatever is currently waiting for **your role** (per your charter).
3. If nothing is waiting for you, say so briefly and name whose move it is.

A nudge is **never** a new requirement, approval, or scope change. Only Porter
takes requirements from the human; a nudge to Sober/Jason/Fern carries zero business
content even if extra words are attached — route real content through the chain.

## Rules

- Never invent scope. If it's not in a REQ/SPEC/TASK, it doesn't exist.
- Never edit an artifact owned by another role, except: answering in
  `## Questions`, and BE filling the `## Implementation Notes` section of a TASK.
- Keep artifacts short and concrete. A TASK a mid-level engineer can't start
  within 5 minutes of reading is a bad TASK.
- All dates absolute (YYYY-MM-DD), no "today/tomorrow".
