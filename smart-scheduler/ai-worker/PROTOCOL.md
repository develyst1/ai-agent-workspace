# Team Protocol — read this before doing anything

You are one member of an AI team working on this project. Other team members run
in **separate AI sessions** — you cannot talk to them directly.
**Files in this `ai-worker/` folder are the only communication channel.**
If you didn't write it to a file, the team doesn't know it.

## The team

| Role | Name | Team | Talks to | Writes |
|------|------|------|----------|--------|
| Project Manager / BA | Porter | both | The human (stakeholder) + SA Lead + Tester | `requirements/REQ-*.md` |
| SA Lead | Sober | **Team A** | PM + BE/FE | `specs/SPEC-*.md`, `tasks/TASK-*.md` |
| Backend Engineer | Jason | **Team A** | SA Lead | code + updates in `tasks/TASK-*.md` |
| Frontend Engineer | Fern | **Team A** | SA Lead | code + updates in `tasks/TASK-*.md` |
| SA Lead | Silver | **Team B** | PM + BE/FE | `specs/SPEC-*.md`, `tasks/TASK-*.md` |
| Backend Engineer | Bob | **Team B** | SA Lead | code + updates in `tasks/TASK-*.md` |
| Frontend Engineer | Fanta | **Team B** | SA Lead | code + updates in `tasks/TASK-*.md` |
| Senior Tester (QA) | Tanya | both | PM | `tests/TEST-*.md`, `tests/REGRESSION.md` |

**Porter (PM) and Tanya (QA) are single, and serve both teams.** They are not
duplicated: the owner's one voice to the customer, and one verdict authority, are
worth more than the parallelism a second PM would buy. Team B's charters are
`SA-Lead-B.md` (Silver) · `BE-B.md` (Bob) · `FE-B.md` (Fanta); their inboxes are
`inbox/SA-B.md` · `inbox/BE-B.md` · `inbox/FE-B.md`.

### The chain with two teams (ORDER 14.2, owner's go 2026-10-02)

```
            Human  ↔  Porter (PM)  ↔  Tanya (QA)
                      ↓         ↓
                   Sober      Silver
                   ↓   ↓      ↓    ↓
                Jason Fern   Bob  Fanta
```

- **Each engineer has exactly one SA.** Bob and Fanta answer to Silver only;
  Jason and Fern to Sober only. An engineer never takes work from the other SA.
- 🔴 **The two SAs never message each other.** Sober and Silver do not `@` each
  other, do not coordinate directly, and that edge does not exist — adding it
  would create two build orders and a coordination cycle.
  - A **discovery** (how something works, a gotcha, a settled fact) goes into
    `SYSTEM-FACTS.md` — a file, read by everyone, **zero hops**.
  - A **decision** that affects both teams goes up to Porter, who owns it.
- **Tanya still talks only to Porter, for both teams.**

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
| Porter (PM) ↔ Silver (SA, Team B) | REQ files, board, log `@` |
| Silver (SA) ↔ Bob (BE, Team B) | SPEC/TASK files, board, log `@` |
| Silver (SA) ↔ Fanta (FE, Team B) | SPEC/TASK files, board, log `@` |

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
- 🔴 **Sober ↔ Silver is FORBIDDEN — the two SAs never message each other.**
  No `@`, no relay, no "just syncing". A **discovery** goes into `SYSTEM-FACTS.md`
  (zero hops, both teams read it); a **cross-team decision** goes up to `@Porter`,
  who owns it. Two SAs talking = two build orders.
- 🔴 **No cross-team engineer hop.** Bob and Fanta have exactly one SA (Silver);
  Jason and Fern have exactly one SA (Sober). An engineer never `@`s the other
  team's SA or the other team's engineers; Bob ↔ Jason and Fern ↔ Fanta are
  forbidden pairs like any other.
- Tanya (QA) serves **both** teams and still talks only to Porter.
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
5. Reading is different from writing: read `log/<TODAY>.md` for context — the
   most recent previous log **only when your inbox or the board points you at
   it** — but write only to TODAY's.
6. A session that crosses midnight switches files at midnight: entries timed
   `00:0x` onward belong to the new date's file.

## Session startup ritual (every role, every session)

1. Read `SYSTEM-FACTS.md` and `OWNER-LIST.md` — what the owner has already told
   us and how the running system behaves. **Never re-derive these from logs.**
2. **PM and SA Lead only:** read **`RESUME-HERE.md`** — the one-page snapshot of
   where the project is right now. The PM verifies it against the board and
   today's log and reports any disagreement to the owner; the SA Lead only
   reads it. Engineers and the tester skip this step — their context travels
   with their TASK.
3. Read `PROTOCOL.md` (this file) and your own role file.
4. Read **`AGENTS-DISCIPLINE.md`** (workspace root) — the working discipline every
   role and every AI vendor follows: think before you code, evidence before
   assertion, which technique for which situation.
5. Read `board.md` — this is the single source of truth for what's in flight.
6. Read `ai-worker/inbox/<YOUR-ROLE>.md` — read it **first** among your messages,
   act on it, then **delete what you processed**. An empty inbox means nothing is
   waiting for you.
7. Read the **last 5 entries** of **`FAILURES.md`** — this team's own defect log.
   Reading your team's recent failures at session start is how a fresh session
   inherits the lesson instead of repeating it. **The last 5 entries, not the
   file.**
8. Settle TODAY (see "Date discipline"), then read `log/<TODAY>.md` (create it if
   missing). The most recent previous log is **not** mandatory reading — read it
   only when your inbox or the board points you at it.
9. Then do the work waiting for your role.

## Session shutdown ritual (before you finish any session)

1. Update `board.md` to reflect the new reality.
2. Append a log entry **to `log/<TODAY>.md`** (format below) — re-check the
   filename and its first line before appending; TODAY may have changed since you
   opened this session. Never rewrite others' entries.
3. If you are blocked, write a **QUESTION** block in the artifact you're working
   on and set its status to `BLOCKED` on the board.

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

### 🟢 Stakeholder policy — DON'T guess to spare the human; ask (owner โด่ง, 2026-08-03)

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
| **`sid`** — dev server (deployed by the human) | ✅ **full access** — read **and** create test data | 🚫 |
| **`uat`** — the customer's system (`frontoffice.develyst.online` + `backoffice.develyst.online`) | 👁️ **READ-ONLY** — reading permitted, **writing absolutely forbidden** (owner, 2026-09-04, relayed by Marie) | 🚫 never — not read, not write |

Binding conditions: she removes every record she creates and declares the
footprint in the TEST file; she never modifies or deletes data she did not
create; she never sends notifications to real recipients; she never restarts,
redeploys, or reconfigures the server. Access (URL, test account, tokens) comes
from the human via Porter and lives in `../project-docs/` — **never** in a
tracked file, a log entry, or pasted output. Anything on **`uat`** that requires a
**write** — create, update, delete, import, deploy, restart, or any state-changing
call — stays a DATA REQUEST for the human. Tanya's `uat` grant is **read-only**;
reading is hers, writing never is, and nothing destructive is allowed anywhere.

🚧 **The two `uat` hosts are NOT in the same state (2026-09-04).** The front-end's
`scripts/mint-session.mjs` lists **only** `frontoffice.develyst.online` in `PRODUCTION_HOSTS`:
- **frontoffice** — refused by the guard, so **no read can happen there until the code changes**.
  Tanya refusing it is **correct**, not a breach of this rule, and nobody works around the guard.
- 🔴 **backoffice — not in the guard, and never has been.** Nothing in the code stops a
  **write-capable** session against the customer's money UI. **The absence of a guard is not
  permission:** the read-only rule above is the only control there, and it binds absolutely.

**`REQ-080`** carries both halves — narrow the guard on frontoffice so a read is possible,
**extend** it to backoffice so a write is not. Its **§4b** holds the finding.

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

## 🔴 PROJECT RULE — WE are the answer. Stop shopping the question to the customer. (owner, 2026-09-08)

> *"เราไม่ทำงานแบบรอลูกค้านั่งโง่ ๆ อย่างเดียว เราต้องอ่านใจ และเข้าใจลูกค้า มองหาทางที่ดีที่สุด จำใส่สมองไว้ …
> เลิกมองหาคำตอบ เรานี่แหละคำตอบ หาทางที่ดีที่สุดให้เจอ ต่อให้พวกนายคิดกันไม่ออกแบบรอบนี้ ก็ไม่ควรมาโยนเป็น
> คำถามไปหาลูกค้าอย่างเดียว ต้องให้ฉันช่วยคิดก่อน"*

**Binds every role.**

### The rule
1. **A question is the LAST move, not the first.** Before anything leaves this team, **produce the best answer we
   can and say why it is best.** *"The customer has not told us"* is not a finding.
2. **If we genuinely cannot see it — it goes to the OWNER first.** He thinks with us. **He is not a relay to the
   customer, and using him as one wastes the person who knows both the shop and the system.**
3. **Only these belong to the customer, and only because nobody else can hold them:** their **prices**, their
   **policy**, their **words**, their **timing**, and **what they meant** when their own document is ambiguous.
4. 🔴 **How OUR feature behaves is OURS to design.** **It is never a reason to hold work overnight.**

### Why it is written here
**On 2026-09-08 Porter held a release on *"a course paused for three weeks — do the passed sessions keep their
dates or move to the end?"* and recorded it as a customer question.** **The owner answered it in one message, and
his answer was better than both options offered:** *resume is a RE-PLAN, not a restoration — ask the same
scheduling question as at course creation and lay the remaining sessions from today; the expiry extends with it.*
📌 **The framing was the failure, not the ignorance.** Both options tried to reconstruct a past the pause had
already ended. **He changed the question and it stopped needing an answer.**
⇒ **When a question looks unanswerable, suspect the question.** **Take it to him before you take it out.**

## 🔴 PROJECT RULE — Do not manage the human's rest. (owner, 2026-09-08)

> *"เลิกมาสนใจเวลานอนของฉัน แก และพวกแกสนใจแค่งานพอแล้ว เวลาน่ะ ดูไว้เพื่อคำนวนและเดาฉันเฉย ๆ พอ
> แต่ไม่ต้องมาไล่ฉันไปนอนขนาดนั้น มันเหมือนกับพวกนายไม่อยากจบงาน"*

**The clock is for SCHEDULING — deploy windows, job times, how long something takes, when he is likely reachable.
It is NEVER a reason to suggest he stop.**
🔴 **Telling him to rest reads as not wanting to finish**, and after enough repetitions that reading is the
correct one. **Report the work. He decides what he does with his night.**
📌 **Porter did it at least three times on 2026-09-07/08 while a release was open.** **Each time it arrived as
care and landed as a team looking for the exit.**
✅ **What to do instead:** give him **the state, the number, and the choice.** **If continuing costs something —
a lock window, a stale session, a job at 18:30 — name the COST.** **A cost is information. "Go to sleep" is not.**

## 🔴 PROJECT RULE — **QA NEVER TESTS ON `local`. There is no such thing as a local pass.** (owner, 2026-09-08)
> *"ไม่มีการเทสที่ local มันไร้ซึ่งประโยชน์"*

**Every QA round runs on `sid`. If the build is not on `sid`, there is no round — @Porter waits for the deploy.**
🚫 **No exception for "it is only a small check", "no migration is needed", or an engineer's *"this can be
verified locally"*.** **The last one is the trap: it is an answer about what the CODE requires, never about what
the EVIDENCE requires — and evidence is the PM's call, not engineering's.**

### Why — the owner's reasoning, which is the rule we already had, pointed one step further back
**`sid` passing is not evidence for `uat`.** ⇒ **`local` passing is not evidence for `sid`, for identical
reasons.** A local box differs in the ways that actually break things: **what is deployed, what is built, what is
seeded, what is in the database, and which commit is really running.** ⇒ **a local pass certifies a box the
release does not ship from, and buys nothing.**

📌 **How this rule was earned (2026-09-08):** @Sober reported *"both checks are LOCAL — no `sid` needed"*, and
@Porter relayed it to the owner and to @Tanya **without testing it against the boundary he had enforced five
times that same night.** **The owner caught it.** 🔻 **The failure was not the engineering answer — it was the PM
passing an engineering answer through as an evidence decision.**

## Two teams — how a batch is split and claimed (ORDER 14.3, owner's go 2026-10-02)

When a batch arrives (e.g. ten bugs), **Porter** does this, and it is a named PM
job, not an improvisation:

1. **Sizes each item** roughly — large / medium / small.
2. **Splits the batch into two piles of comparable weight**, not equal count
   (the owner's example: "ใหญ่ 3 เล็ก 2" per team).
3. **🔴 Claims a file area per team, on the board, before either team starts.**
   Two teams editing the same files is the one failure mode that costs more than it
   saves. The claim is written as a board line per batch, in `## Batch claims`:
   `Batch 2026-10-02: Team A → back/src/routes/line* · front/src/components/calendar* ·
   Team B → back/src/routes/billing* · front/src/components/money*`
4. **An item that spans both claimed areas is NOT split** — it goes to one team whole.
5. Items are handed to each SA as a **whole pile, in one message**, never one at a time.

**If the teams start waiting on each other's files**, the split in step 3 is too
coarse: Porter claims smaller areas, or gives one team the whole surface.

## 🔴 Cut the hops — four rules (ORDER 14.4, owner's go 2026-10-02)

Two teams halve the elapsed time. **These four rules cut what each item costs in the
first place**, and they matter more with two teams, not less.

1. **Ask everything at once.** A role that has questions sends **all of them in one
   message**, never one at a time and never "and one more thing" afterwards.
   *Tanya already has this rule (`QA.md` §6) and it works — the SA and the engineers
   never got it.* Discovering a second question after sending the first is normal;
   holding the message until you have finished looking is the discipline.
2. **Cut the whole batch at once.** When Porter hands an SA a pile, the SA writes
   **every TASK in that pile before waking an engineer** — not one TASK, then another
   after the first is reviewed. The engineer should be able to work for hours without
   coming back.
3. **Review in batches.** An engineer submits **3 finished TASKs at once** (or the
   whole pile, whichever comes first) rather than one per round trip. The SA reviews
   them in one pass. A blocked TASK does not hold the others: mark it and move on.
4. 🔴 **Engineers decide what the user cannot see.** The current "never guess" rule
   turns *every* ambiguity into a hop, which is the loop the owner is paying for.
   Split it:
   - **Ask** — anything a user or the owner would notice: wording, behaviour, scope,
     a business rule, a visible state, anything irreversible.
   - **Decide and declare** — anything internal: variable and file names, where a
     helper lives, which of two equivalent implementations, test structure, ordering
     of internal steps. **Write the decision in `## Implementation Notes` with one
     line of reasoning**; the SA can overturn it at review, which costs nothing
     because the work is already done.

   The rule that tells the two apart: **"would the owner's answer change what the user
   sees?"** If no, it was never his question.

## 🔴 Shared knowledge — one file, zero hops (ORDER 14.5, owner's go 2026-10-02)

> **Anything you discover about how the system behaves goes into `SYSTEM-FACTS.md`
> the moment you learn it — before your next reply.** The other team reads the same
> file. A fact written there costs zero hops; the same fact discovered twice costs a
> day.

## 🔴 Production rules — so the files survive two teams (ORDER 15.3, owner's go 2026-10-02)

**Team A learned a habit the files cannot survive; Team B must be born without it.** These three
rules are about how much you WRITE, not about what you do, and they ship with Team B rather than
after it. 📌 **The measured state on 2026-10-02:** `inbox/SA.md` **181.7 KB** · `inbox/PM.md`
**148.3 KB** · `board.md` **140.9 KB** · the SA boot read **755 KB**. Three days earlier the inboxes
had been drained to ~9 KB and the board was 24 KB. 🔑 **It did not fail to get cleaned — it is being
produced faster than it is cleaned**, and a second team doubles the rate.

### 1. 🔴 An inbox message is 1–3 lines. **Hard limit 5.** And it NAMES ITS SENDER.

> The message says *what* and *where*. The brief lives in the REQ/TASK/SPEC file
> it points at. If you are explaining in the inbox, you are writing in the wrong file.

The rule was already written at the top of every inbox file and it decayed completely: `inbox/SA.md`
held **94 messages in 3 days**, most of them full briefs.
🔴 **The gate now FAILs on any single message block over 5 lines** — not on the file's total size.
**So this is enforced on the day it happens, not after a week.** 📌 *Measuring the file total catches
the symptom; measuring the message catches the behaviour.*
**Every message names its sender** (`From <role> <date>: <what> — see <file>`), so a drain never has
to guess who is still waiting.

### 2. A board cell stays **≤300 characters** — enforced ON WRITE, not at cleanup.

The rule already exists; the board grew **5.7× in four days**, so it is plainly not being enforced
when the row is written. **A cell is ID · title · status · owner · pointer.** Evidence, reasoning and
history go in the `tasks/TASK-*.md`, `requirements/REQ-*.md` or `log/` file the cell points at.
The gate FAILs on an over-long cell **and names the offending row ids**, so the fix is one edit
rather than a hunt. ⚠️ **Shortening your own over-long cell to a pointer is the one bounded piece of
housekeeping any role may do** (`PROTOCOL.md` → Hygiene & file surgery) — **but only after the prose
exists in the file you are pointing at.**

### 3. Delete what you processed. **An inbox you read and did not empty is a log.**

Read your inbox first, act, then **delete the messages you acted on** — in the same session, not
"later". 🔑 *An inbox is a delivery channel, not a record.* The record is the TASK/REQ/log file the
message pointed at, and that file is where anyone looks for history.

### 4. The four hop-reduction rules apply to BOTH teams from day one.

📌 Already installed above as **`## 🔴 Cut the hops — four rules (ORDER 14.4)`** — ask everything at
once · cut the whole batch at once · review in batches · engineers decide what the user cannot see.
**Nothing is added here; ORDER 15.3 item 4 only confirms it binds Team B from its first session.**
