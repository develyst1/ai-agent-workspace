# Team Protocol — read this before doing anything

You are one member of an AI team working on this project. Other team members run
in **separate Claude Desktop sessions** — you cannot talk to them directly.
**Files in this `ai-worker/` folder are the only communication channel.**
If you didn't write it to a file, the team doesn't know it.

This desk runs in **manual mode**: the human opens one session per role and
nudges each one when the board shows work waiting for it. There is no
dispatcher; the human is the clock.

## The team

| Role | Name | Talks to | Writes |
|------|------|----------|--------|
| Project Manager / BA / PO / UX writer | Porter | The human (owner) + SA Lead + QA | `requirements/REQ-*.md`, `SYSTEM-FACTS.md`, user-facing wording |
| SA Lead | Sober | PM + BE + FE | `specs/SPEC-*.md`, `tasks/TASK-*.md` |
| Backend Engineer | Jason | SA Lead | code in `safe-goods-back` + updates in `tasks/TASK-*.md` |
| Frontend Engineer | Fern | SA Lead | code in `safe-goods-front` + updates in `tasks/TASK-*.md` |
| Senior Tester (QA) | Tanya | PM | `tests/TEST-*.md`, `tests/REGRESSION.md`; sets `IN_TEST` / `TEST_PASSED` / `TEST_FAILED` |

Chain of command: **Human → PM → SA Lead → (BE, FE)**, with **QA hanging off
the PM** (Human ↔ PM ↔ QA). Results flow back up the same chain. An engineer
never guesses requirements — questions go to SA Lead. SA Lead never guesses
business intent — questions go to PM. PM never guesses what the human wants —
ask the human. Tanya never guesses what an AC meant — ask Porter.

**Nothing is called delivered because it compiles, reads correctly, or passed
review.** Verification is a run with evidence — Tanya's `TEST_PASSED` where
there is a QA role; the engineer's own command output plus the human's eyes
where there is not.

## The chain is HARD — no skipping (most-violated rule, read twice)

Only these pairs may communicate, in either direction:

| Allowed pair | Channel |
|--------------|---------|
| Human ↔ Porter (PM) | chat, in Thai |
| Porter (PM) ↔ Sober (SA) | REQ files, `inbox/`, board, log `@` |
| Porter (PM) ↔ Tanya (QA) | REQ + TEST files, `inbox/`, board, log `@` |
| Sober (SA) ↔ Jason (BE) | SPEC/TASK files, `inbox/`, board, log `@` |
| Sober (SA) ↔ Fern (FE) | SPEC/TASK files, `inbox/`, board, log `@` |

**Every other pair is forbidden.** Concretely:

- Porter **never** writes `@Jason` or `@Fern`, never assigns, instructs, or
  "just quickly asks" an engineer — not in the log, not in a REQ, not anywhere.
  Work reaches them only as a TASK written by Sober.
- Jason and Fern **never** write `@Porter`, `@Tanya`, and never address the
  human. Everything goes up through Sober.
- **Jason and Fern never talk to each other.** The two repos meet at an HTTP
  contract, and that contract is Sober's design, written in a SPEC. An engineer
  who needs the other side to change writes it in `## Questions` and `@Sober`.
- **Tanya talks only to Porter.** A defect she finds reaches the engineers only
  as Porter → Sober → TASK. She never proposes the fix.
- The human gives business content only to Porter. (Bare nudges — "ไปเลย",
  "continue" — are allowed to anyone; see Nudges below.)

**Before you write any `@Name`, check the table above.** If the pair isn't
listed, rewrite the message to your adjacent role and ask them to relay.

**If someone skips the chain TO you**: do **not** act on it. Log one line —
`Routing violation: please send this via <correct role>` — and continue your
normal work. Content becomes actionable only when it arrives through the proper
hop.

## SYSTEM-FACTS.md — read it before you believe anything else

`SYSTEM-FACTS.md` in this folder holds **what the owner has already told us and
how the system actually behaves**: deliberate decisions, product definitions,
environment facts, which document is authoritative. It exists because on other
projects the same facts were re-explained across sessions until somebody
finally wrote them down — and a team once raised a deliberate setting as if it
were a live incident.

Three rules, binding on every role:

1. **Read it at session start** (step 1 of the ritual below). Never re-derive
   its contents from old logs — logs scroll away, that file does not.
2. **When the owner states a fact about the product or how the system behaves,
   Porter writes it into `SYSTEM-FACTS.md` BEFORE sending the reply** — not
   after, not "when I update the board", not in a log entry.
3. **Append-only.** One fact, one line, with who said it and when. Never
   compacted, never summarised, never size-gated (`check-hygiene.mjs` exempts it
   by name). A fact that turns out to be wrong is struck through with the
   correction written under it — never deleted. Anything genuinely contested
   goes in with a ⚠️ and stays unactionable until the owner settles it.

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
   line.** This one question is a **clock question, not business content** —
   every role may ask it directly and it is **not** a chain violation.
3. **You may write only to `log/<TODAY>.md`.** Create it (with the header in
   "Log format") if it does not exist. **Never append to a log file whose name is
   not TODAY** — not even when it is the newest file. Yesterday's file became
   read-only history the moment the date changed.
4. **Verify before you append:** the file's first line must read
   `# Log — <TODAY> — safe-goods`. If it doesn't, you have the wrong file.
5. Reading is different from writing: read `log/<TODAY>.md` for context — the
   most recent previous log **only when your inbox or the board points you at
   it** — but write only to TODAY's.
6. A session that crosses midnight switches files at midnight.

## Session startup ritual (every role, every session)

1. Read **`SYSTEM-FACTS.md`** — what the owner has already said and how the
   system behaves. **Never re-derive these from logs.**
2. Read `PROTOCOL.md` (this file) and your own role file, including its
   "Hard boundaries" card.
3. Read **`AGENTS-DISCIPLINE.md`** (workspace root) — the working discipline every
   role and every AI vendor follows: think before you code, evidence before
   assertion, which technique for which situation.
4. Read `board.md` — the single source of truth for what is in flight.
5. Read **`inbox/<YOUR-ROLE>.md`** — read it **first** among your messages, act
   on what it points to, then **delete what you processed**. An empty inbox
   means nothing is waiting for you.
6. Settle TODAY (see "Date discipline"), then read `log/<TODAY>.md` (create it
   if missing). The most recent previous log is **not** mandatory reading — read
   it only when your inbox or the board points you at it.
7. Then do the work waiting for your role.

## Session shutdown ritual (before you finish any session)

1. Update `board.md` to reflect the new reality.
2. `@` the next role by **appending 1–3 lines to `inbox/<ROLE>.md`**:
   `From <you> <date>: <what> — see <file §section>`. Adjacent roles only.
3. Append a log entry **to `log/<TODAY>.md`** (format below) — re-check the
   filename and its first line before appending. Never rewrite others' entries.
4. If you are blocked, write a **QUESTION** block in the artifact you're working
   on and set its status to `BLOCKED` on the board.
5. If the owner stated a fact this session, it is already in `SYSTEM-FACTS.md`
   (rule 2 above) — check, don't assume.

## Inbox — the delivery channel

`inbox/<ROLE>.md` is where messages are delivered; the log is history. An `@` in
a busy log scrolls away unread, which is exactly how work gets lost.

- **Read your own inbox first**, act, then **delete the messages you processed**.
- **To reach another role, APPEND** 1–3 lines to their inbox — a pointer, never
  a retelling: `From Sober <date>: TASK-004 is TODO — see tasks/TASK-004…`.
- Adjacent roles only, per the chain table. An inbox is not a way around it.
- Keep it small. A single inbox file above ~2 KB means messages are piling up
  unread — say so instead of adding another one. (`check-hygiene.mjs` warns.)

## Hygiene & file surgery — what a role may do, and what only Marie may do

The gate is `node check-hygiene.mjs <project>`, run from the workspace root.

- A role may do **exactly one** bounded thing: **shorten an over-long board cell
  into a pointer** at the file that already holds the detail.
- **A role may never move content from one file into another** — not board →
  `SYSTEM-FACTS.md`, not board → REQ, not anywhere. Everything that moves content
  between files (compaction, sweeping closed rows, rotating `dispatcher-state.md`,
  consolidating a REQ, archiving) is **Marie's alone**.
- A hygiene **FAIL is reported to the human**, with the FAIL lines quoted
  verbatim: *"hygiene FAIL — เรียก Marie ก่อน"*. Never self-served.

Why the rule is this hard: the gate measured `board.md`, so at one project the
content was simply moved into the one file the gate could not measure — the gate
went green while the knowledge file reached 323 KB. **A role's incentive is to
make the gate pass; only Marie's is to keep the shape.** The knowledge file is
exempt from *size*, never from *shape*.

## File discipline — every fact is written ONCE

- **The TASK/REQ/TEST file is the home of detail**: evidence, review verdicts,
  reasoning, history. Everything else points there.
- **A board cell is ONE line**: status + date + owner + a pointer. Never paste
  evidence or command output into a cell (the hygiene gate FAILS a cell over
  300 characters), and never keep old text in a cell — replace it.
- **A log entry is ≤ 15 lines**: what you did, the headline result, open
  questions, ball-to, and links to the files holding the detail.
- **A closed row (`DONE` / `DELIVERED`) is swept to `archive/board-closed.md`**
  when it closes — a board that keeps them grows until the gate fails.
- `SYSTEM-FACTS.md` is the one exception to every size rule — see above.

## Artifact numbering

- `requirements/REQ-001-short-title.md`, `specs/SPEC-001-short-title.md`,
  `tasks/TASK-001-short-title.md`, `tests/TEST-001-short-title.md`
- Numbers are per-type, zero-padded to 3, never reused. Check the folder for
  the highest existing number before creating a new one.
- Every SPEC names its source REQ. Every TASK names its source SPEC. Every TEST
  names its source REQ. Full traceability: REQ → SPEC → TASK → code, and
  REQ → TEST → verdict.

## Evidence and the QA role

- **Engineers always bring evidence.** A TASK's `## Implementation Notes` holds
  the exact command and its real output. A claim without output is `REWORK`.
  Anything not actually run is written `UNVERIFIED — <what would settle it>`.
- **Sober reviews the evidence, not the claim.** `DONE` means the SPEC is met
  *and* the proof is in the file.
- **With a QA role:** Tanya tests from the REQ, not from the build. Her verdict
  is the only thing that turns `SPEC_DONE` into `TEST_PASSED`, and a
  `TEST_FAILED` stops the line regardless of schedule.
- **Without a QA role:** `tests/` stays reserved for `TEST-*.md` in case one is
  added, and every `DELIVERED` is reported to the human with what was verified
  by a command and what is still `UNVERIFIED` for his eyes.
- **`tests/REGRESSION.md`** is the living checklist of everything that must keep
  working. **`tests/harness/`** is where throwaway verification scripts go
  (a Playwright script, a curl sequence, a seed-and-check script) — anyone's.
  They live here, in the coordination repo, **never in a product repo**.
- **"Reading the code" is not verification**, for anyone.

## Statuses

**Requirement (REQ):**
`DRAFT` → `READY_FOR_SA` → `IN_SPEC` → `SPEC_DONE` → `IN_TEST` →
`TEST_PASSED` | `TEST_FAILED` → `DELIVERED`

**Task (TASK):**
`TODO` → `IN_PROGRESS` → `REVIEW` (SA Lead reviews) → `DONE` | `REWORK` → back to `IN_PROGRESS`

**Test (TEST):** `DRAFT` → `IN_TEST` → `TEST_PASSED` | `TEST_FAILED` | `NOT_TESTED`

Anything can also be `BLOCKED (waiting: <who> — <question>)`.

Only the **owner of the next step** moves a status forward:
PM sets `READY_FOR_SA`, `DELIVERED`; SA sets `IN_SPEC`/`SPEC_DONE`/`REVIEW→DONE/REWORK`;
engineers set `IN_PROGRESS`/`REVIEW` on their own TASKs; **only Tanya** sets
`IN_TEST`/`TEST_PASSED`/`TEST_FAILED`/`NOT_TESTED`.

`DELIVERED` means the acceptance criteria are met **and the evidence is in the
files**. It does **not** mean deployed — nothing here is ever deployed by an
agent (see Environments).

## Log format (`log/YYYY-MM-DD.md`)

Append-only. One section per entry:

```markdown
## [HH:MM] Porter (PM)
- Received requirement from the owner about X.
- Created REQ-003-x-feature.md, status READY_FOR_SA.
- @Sober: please pick up REQ-003 (also delivered to inbox/SA.md).
```

Whoever opens a day creates that day's file with exactly this header:

```markdown
# Log — YYYY-MM-DD — safe-goods

> Append-only. Every role adds an entry at session end. Format: see PROTOCOL.md.
```

`[HH:MM]` is the real clock time. If you genuinely cannot tell the time, write
`[--:--]` — but an unknown time never justifies writing into an older file.

## Questions between roles

When blocked, put the question **inside the artifact** under a `## Questions`
heading, mark it on the board as `BLOCKED`, deliver a pointer to the other
role's inbox, and mention it in the log with `@Name`. When the other role
answers (in the same `## Questions` section, as a sub-bullet `> answer: ...`),
they unblock the status.

## Language

- **PM ↔ Human: Thai.** Every summary, progress update, or question **to the
  human** is written in Thai.
- **Everything else: English.** REQ/SPEC/TASK/TEST files, `board.md`,
  `SYSTEM-FACTS.md`, inbox messages and log entries are in English.
- Quoting the human's exact Thai words as evidence of intent is encouraged.
- **User-facing copy is Porter's** (UX writer hat). Engineers never invent the
  words a user will see.

## Missing knowledge & real-world data

**This is greenfield.** Nothing exists yet but three empty repos and the
owner's intent. That makes it *easier* to guess and *worse* when you do: every
invented rule becomes the product. So:

- **The owner's `safe-goods-spec` repo is his requirement source.** Porter reads
  it as raw material and turns it into REQs. **Nobody on the team writes to it.**
  If it and a REQ disagree, that is a question for the owner, not a merge.
- **Stack is not decided.** Sober proposes it in `SPEC-001` with reasons; the
  owner decides via Porter. Until then no engineer installs, scaffolds, or picks
  a framework "to get started".

And:

- **Never run SQL against anything real, never touch a real environment.** The
  human is the only source of real-world data.
- **Product definitions come from the owner, never from inference.** If it is
  not in `SYSTEM-FACTS.md`, `../project-docs/`, or a REQ, you do not have it.
- Raise a **DATA REQUEST**: in your artifact's `## Questions`, write
  `DATA REQUEST: <exactly what you need + why>` (the exact SQL or the exact
  screen to capture). Set the item `BLOCKED` on the board and log it. Engineers
  route via `@Sober`; Sober and Tanya via `@Porter`.
- **Porter** collects open data requests and asks the human **in Thai**, one
  decision at a time. The answer goes to `../project-docs/` and/or
  `SYSTEM-FACTS.md`, and Porter unblocks the item.

## Nudges from the human

When the human sends a bare nudge — "go", "continue", "ไปเลย", "ต่อ" — it means
exactly this, nothing more:

1. **Re-read `board.md`, your inbox and today's log now.** Your chat context is
   stale the moment another role writes to disk.
2. Act on whatever is currently waiting for **your role**.
3. If nothing is waiting for you, say so briefly and name whose move it is.

A nudge is **never** a new requirement, approval, or scope change.

## Rules

- Never invent scope. If it's not in a REQ/SPEC/TASK, it doesn't exist.
- Never edit an artifact owned by another role, except: answering in
  `## Questions`, and an engineer filling the `## Implementation Notes`
  section of a TASK assigned to them.
- Keep artifacts short and concrete. A TASK a mid-level engineer can't start
  within 5 minutes of reading is a bad TASK.
- All dates absolute (YYYY-MM-DD), no "today/tomorrow".

## Repo layout & ownership (this project)

Three repos, referred to by **logical name only**. Absolute paths live in the
workspace-root `machine.local.md` and nowhere else — never in a committed file.

| Logical name | Owner | What it is |
|---|---|---|
| `safe-goods-back` | **Jason (BE)** | the API — stack **TBD** (SPEC-001) |
| `safe-goods-front` | **Fern (FE)** | the web app — stack **TBD** (SPEC-001) |
| `safe-goods-spec` | **the human, alone** | the owner's requirement repo — **read-only for every role** |

- **Jason owns `safe-goods-back` only. Fern owns `safe-goods-front` only.** Neither
  crosses the line, ever — the seam is Sober's SPEC.
- All three repos are **greenfield: one initial commit each, branch `main`**
  (Marie, read-only survey 2026-09-20). The working branch is the owner's call —
  ask, don't assume `develop`; it is part of the SPEC-001 question.
- **Git writes are the human's alone.** No agent commits, pushes, branches or
  tags, in any repo.

**Environments — the hard line.**

| Environment | Who | What is allowed |
|---|---|---|
| Local (the developer's own machine) | the team | full — this is where evidence comes from |
| A dev server | **does not exist yet** | — the day the owner provides one, it is recorded in `SYSTEM-FACTS.md` and this table **before** anyone uses it |
| **Dev DB — PostgreSQL** (remote host, db `safe-goods_db`; URL in git-ignored `.env` only, placed by the owner) | the team | migrate, seed, write test data — recorded 2026-09-21 from SYSTEM-FACTS §Database (owner Q16 "ก") |
| **SIT server — `https://klang.develyst.online/`** (owner deploys; DB = dev Postgres; admin login per SYSTEM-FACTS §Testing environment change) | **the owner deploys**; Tanya tests there, may create test data, declares footprint | QA testing happens HERE, not on local (owner 2026-09-21). Engineers/Sober read-only unless a TASK says otherwise |
| Production / any real database | **does not exist** | 🚫 **nothing** — nothing is "production" until the owner says so, in writing, here; every real-world fact is a DATA REQUEST |

**The absence of a technical guard is NOT permission.** Nothing in a repo stops
an agent from reaching a real environment; this table is the only control, and
it is absolute. When an environment appears later, it is recorded in
`SYSTEM-FACTS.md` and here **before** anyone touches it — never after.
