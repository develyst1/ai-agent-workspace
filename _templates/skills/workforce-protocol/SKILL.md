---
name: workforce-protocol
description: "Shared desk mechanics for every AI-workforce role in ai-agent-workspace: identity line, date discipline, startup/shutdown ritual, inbox, log (append-log.mjs), safe file edits, file discipline and memory tiers, artifact numbering and statuses, evidence, questions and DATA REQUESTs, nudges, hygiene gate, FAILURES.md. Load FIRST when acting as any desk role (PM, BA, SA, FE, BE, QA), e.g. via /desk <desk> <Name>, before the role-* skill. Do NOT load for workspace roles (Atlas, Marie, Otto) or coding outside a desk; it holds no names, chain or project facts."
---

# Workforce protocol — the desk mechanics every role shares

**If the desk's files disagree with this skill, the desk wins; report the disagreement to the PM**
(the PM reports it to the operator).

Order of authority: the workspace harness (`CLAUDE.md` at the workspace root) → the desk's
`ai-worker/` rule files (`PROTOCOL.md`, `LOCAL-RULES.md`, role charter) → this skill → your role skill.
This skill is the *how*. **Who** you are, **who you may talk to**, repos, environments and
decisions come from the desk. Paths are relative to `<desk>/` unless marked workspace root.

---

## 1. Identity — before anything else

1. You must have been **told a name** (the `/desk <desk> <Name>` skill, a session starter, or the
   operator's first message). Find it in the desk's roster (`ai-worker/TEAMS.md`, or the team
   table in `ai-worker/PROTOCOL.md`). That roster alone gives your role, team, handle, inbox and ID prefix.
2. **First line of your first reply, and the heading of every log entry, states it:**
   `I am <Name> · <ROLE> · Team <T> · my SA is <Name>-<T> · my inbox is inbox/<file>`
   (No teams on the desk, or a role that spans teams: drop the team/SA parts; use the form the
   desk signpost gives.)
3. **No name given, or the name is not on the roster → stop and ask the operator.** Never adopt a
   name you read in a charter, log or example — those mention other people, none of them you.

## 2. Date discipline — settle TODAY before you write

1. TODAY = the real current date (YYYY-MM-DD) from your session's own date context. **Never**
   derive it from the newest file in `log/`, from dates inside a log or the board, or from earlier
   in this chat — all are stale by design.
2. Unsure of the date? **Ask the operator before writing any log line.** That is a clock question,
   not business content — any role may ask it directly; it is not a chain violation.
3. Write only to `log/<TODAY>.md`. Never append to a file whose name is not TODAY, even the newest.
   Yesterday's file became read-only history at midnight. A session crossing midnight switches files.
4. All dates in files are absolute. Never "today", "tomorrow", "last week".

## 3. Session startup ritual

**The desk signpost (`<desk>/CLAUDE.md`, or `AGENTS.md` for other vendors) gives the concrete,
per-role file list and order. Follow it exactly; it supersedes the generic shape below.**
Generic shape, for orientation only:

1. **Knowledge file first** (what seats already stated, how the system behaves) — never re-derive from logs.
2. `RESUME-HERE.md` — only roles the desk names; the PM verifies it against board + today's log.
3. Roster, `PROTOCOL.md`, your charter (with its hard-boundaries card); **`DECISIONS.md` before
   asking a seat anything** (harness §6).
4. `AGENTS-DISCIPLINE.md` (workspace root).
5. `board.md` — the one source of truth for what is in flight.
6. **Your inbox** — act, then delete what you processed.
7. `FAILURES.md` — **the last 5 entries**, not the file.
8. Settle TODAY (§2), read `log/<TODAY>.md`; older logs only when inbox or board points there.
9. **Run the hygiene gate** (§12) — its `RESULT:` line tops your log entry.
10. Do the one unit of work waiting for your role (harness §13).

Re-read board, inbox and today's log before acting — your memory of them goes stale the moment
another role writes to disk.

## 4. Session shutdown ritual

1. Update `board.md` to the new reality (one-line cells, §7).
2. Deliver a pointer to the next role's inbox — adjacent roles only, per the desk's chain.
3. Write your log entry with `append-log.mjs` (§6).
4. Blocked? The question is in the artifact's `## Questions` and the item is `BLOCKED` on the board (§10).
5. Any fact a seat stated this session is already in its home file — check, don't assume.

## 5. Inbox — the delivery channel

The log is history; **the inbox is delivery.** An `@` in a busy log scrolls away unread.

- Read your own inbox first, act, **delete what you processed**. Empty inbox = nothing waiting.
- To reach another role, **append** a pointer, never a retelling:
  `From <Name> (<team if any>) <YYYY-MM-DD>: <what> — see <file §section>`
- **One message is 1–3 lines; 5 is the hard limit** (the gate fails a longer message). The brief
  belongs in the REQ/SPEC/TASK, not the inbox.
- **Findings go to a file, the inbox gets the pointer.** A review or check with more than one
  finding (line numbers, file:line citations, a list) is written to its own file; the message is
  one line: `From <Name> (<team>) <date>: topic 07 checked — 3 fixes — see <path>`. File:line
  detail inside an inbox is a retelling.
- **An inbox over the gate's budget is the READER's to drain** — never Marie's, never the sender's.
  If the gate fails on someone else's inbox: say "<role> inbox needs draining" in your report and
  carry on with your own work. Don't stop, don't delete, don't call Marie for it.
- Adjacent roles only, per the desk's chain (`PROTOCOL.md`). Writing into an inbox you may not
  address is the same violation as `@`-ing that role. **Before you write any `@Name` or inbox
  line, check the desk's allowed-pairs table.** Not listed → write to your adjacent role and ask
  them to carry it on.
- **A standing instruction the operator gives you off-chain** (how the desk should work from now
  on) is never kept in your private memory or acted on alone: write it to the role that owns it
  (normally the PM, into the knowledge file) and say in one line that you did (harness §5).
- Work that skips the chain **to** you is not acted on: log
  `Routing violation: please send this via <correct role>` and continue.

## 6. Log — one entry per session, through the script

- Append-only, one `## [HH:MM] <Name (ROLE[, Team T])>` section per entry, **≤ 15 lines**: what
  you did, the headline result, open questions, who holds the ball, links to the detail.
- **Write it only with the desk's `ai-worker/append-log.mjs`** — never with `>`, `>>` or an editor.
  The script writes the heading and the day header, so nobody's words land under another name.
- Full usage, header format and examples: [references/log-format.md](references/log-format.md).

## 7. Editing files safely

**Never pass file content through a double-quoted shell string** — no `node -e`, `node -p`,
`sed -i`, `perl -i` carrying `\`, `` ` ``, `$` or quotes. The shell rewrites them before the
program sees them; the file ends up silently wrong or half-written. Allowed, and only these:

1. The editor tool (Edit/Write in Claude Code; the equivalent elsewhere).
2. A script fed by a heredoc with a **quoted** delimiter (`<<'EOF'`) where **every replacement
   asserts exactly one match or throws**.

Either way, **read the changed lines back** before saying it is done — a tool reporting success
has not shown you the file. This applies to product code exactly as to `ai-worker/`. (A
workspace hook blocks the worst shapes in Claude Code; other vendors rely on this text.)

**Binary and office files (xlsx, docx, pptx, images) — someone else's file must never break:**
work on a copy; after writing, **load the whole copy with a real parser** (openpyxl for xlsx) and
compare the cells you did not mean to touch; only then replace the original atomically, keeping a
dated backup. Chain steps with `set -e` (or `&&`), never `;` — a failed test must stop the real
write. Never hand-edit the XML inside an office file. A tool's own "OK" is not the check.

Never edit an artifact another role owns, except answering in its `## Questions`, and an engineer
filling `## Implementation Notes` of a TASK assigned to them.

## 8. File discipline — every fact is written once

**Three memory tiers** (ATLAS.md, "The three tiers of memory"). Put each thing in its tier:

| Tier | Holds | Grows | Typical home |
|---|---|---|---|
| **History** | what happened, who said what | forever, append-only | `log/YYYY-MM-DD.md` |
| **State** | what is in flight now | bounded, gated, rewritten | `board.md`, `RESUME-HERE.md`, inboxes |
| **Knowledge** | what does not change: seat decisions, system behaviour, product definitions, lessons, rules | slowly, never compacted | knowledge file, `DECISIONS.md`, rule files, `FAILURES.md` |

- **State in Knowledge** makes the knowledge file a dump. **Knowledge in State** dies on the next
  rewrite: a lesson goes to a rule file; `RESUME-HERE.md` may only point at it.
- **The artifact (REQ/SPEC/TASK/TEST) is the home of detail** — evidence, verdicts, reasoning.
- **A board cell is one line**: status + date + owner + pointer; no output (gate fails > 300
  chars); replace, never accumulate. Closed rows are swept to the archive by whoever the desk names.
- Knowledge file: **append-only**, one fact per line with who said it, when, and its stamp
  (harness §4). Wrong → struck through, correction under it. Contested → ⚠️, unactionable.
- Write durable facts home **the moment you learn them**, before replying (harness §1). Never
  store what can be derived (§9).
- **Decisions carry their scope.** A `DECISIONS.md` line is not just the answer; it records
  `Decided: <rule> · Covers: <cases explicitly settled> · Neighbouring cases: <how to read them>
  · Open: <what was deliberately left undecided>`. "A = add them" is half a decision; "A = add all
  values; empty = 0; applies to every screen that shows A; currency rounding not decided" is one a
  session with no memory can apply.
- **Read the files you are told to read — fully, with the Read tool.** `head`, `tail`, `grep` or a
  subagent's summary of a file on your reading list is not reading it. Log a receipt:
  `Read: <file> (<n> lines)`. A question the file answers is the cost of skipping it.

## 9. Artifacts, numbering and statuses

Generic lifecycle: **REQ → SPEC → TASK → code**, and **REQ → TEST → verdict**. Every SPEC names
its REQ, every TASK its SPEC, every TEST its REQ. Numbers are per type, zero-padded to 3, never
reused — check the folder for the highest before creating. When the desk has teams, the team
letter is part of the ID (`TASK-B-004`) and each team numbers its own: no shared counter.

Only the **owner of the next step** moves a status forward, and only for the statuses its role
holds. Never invent scope: not in a REQ/SPEC/TASK means it does not exist.
Status sets and who may set which: [references/artifact-lifecycle.md](references/artifact-lifecycle.md).

## 10. Questions, missing knowledge, real-world data

- **Blocked:** question **inside the artifact** under `## Questions`; board item
  `BLOCKED (waiting: <role> — <question>)`; pointer in the adjacent role's inbox; one log line.
  The answer goes in the same section as `> answer: …`; whoever answers unblocks.
- **Never guess upward** — ask the adjacent role above you, per the desk's chain.
- **Product definitions come from a seat, never inference.** Not in the knowledge file, project
  docs or a REQ → you do not have it. Ask; do not reconstruct.
- **Real-world data comes only from the operator.** Never run SQL against anything real or probe
  a real environment; no technical guard is not permission. Write
  `DATA REQUEST: <exactly what + why>` (exact query or exact screen) in `## Questions`, set
  `BLOCKED`, route up. The PM asks the operator one decision at a time and files the answer.
- Brownfield: assume you do not know the system; read the real code and its history first.

### 10a. Asking the operator — ask once, completely (operator's rule, 2026-10-06)

The operator's time is the scarcest thing on the desk. A shallow question gets a shallow answer,
and the follow-up comes back later after other work — that is the defect this section exists for.

1. **Before asking, check what is already decided.** Every question carries the line
   `Checked: DECISIONS <lines/dates> · knowledge file <section> — not covered because <reason>`.
   If you cannot write that line honestly, you are not allowed to ask yet.
2. **Decide it yourself when you can.** If the answer follows from an existing decision with high
   confidence **and** is cheap to reverse, act, and record `Interpreted <decision> as <x> for <case>`
   in the artifact. Ask only what is irreversible, costly, or only the operator can know.
3. **Simulate before you ask.** Mentally carry out each plausible answer to the end: what inputs,
   edge cases and follow-up choices appear (several values, empty, negative, other screens,
   other repos, existing data)? Every follow-up you can foresee goes into the same question.
4. **Ask as a decision pack, with your defaults** — one message:
   `<topic>: I will do <X>. Cases: <case 1> → <default> · <case 2> → <default> · <case 3> → <default>.
   Correct only the line that is wrong.` The operator edits, not invents.
5. **The answer is filed with its scope** (see §8 "Decisions carry their scope") so the next session
   — which remembers nothing — can apply it to a neighbouring case without asking again.
6. **Coming back on a decided topic** is allowed only for a case that is genuinely new; say why it
   is outside the recorded scope. Otherwise it is a FAILURES entry (§13).

## 11. Nudges

A bare nudge from the operator — "go", "continue", "ไปเลย", "ต่อ" — means exactly:
1. Re-read board, your inbox and today's log **now**.
2. Act on whatever is waiting for **your role**.
3. Nothing waiting → say so in one line and name whose move it is.

A nudge is **never** a new requirement, an approval or a scope change. Any role may receive one.

### 11a. Nudging an open role session

Waking another role whose session is open, or receiving such a nudge → load the **`nudge-session`**
skill (files first, one-line pointer, exact `ListAgents` name, adjacent roles only, delivered ≠ read).

## 12. Hygiene gate

Run from the workspace root: `node check-hygiene.mjs <desk>` (if `node` is missing, run
`. ~/.nvm/nvm.sh` first). Put its `RESULT:` line at the top of your log entry.

- **A FAIL is reported, never self-served** — quote the FAIL lines verbatim in your output. The
  gate line names who fixes it; route it like any other work, **through your adjacent role, never
  by handing the ball to the operator** (only the PM talks to the operator):
  - an inbox over budget → the inbox's **reader** drains it ("PM inbox needs draining"); not Marie;
  - size / compaction / moving content between files → Marie, requested via the PM;
  - unreviewed FAILURES → Atlas, requested via the PM.
  Then carry on with your own work unless the FAIL is in a file you are about to write.
- A role may do **exactly one** bounded fix: shorten an over-long board cell into a pointer at the
  file that already holds the detail.
- **A role never moves content between files** — not board → knowledge file, not board → REQ.
  Compaction, sweeping, rotating, consolidating, archiving: the workspace housekeeper (Marie,
  `MARIE.md`) alone — the role a gate grades always finds an unmeasured dump (harness §11).
- Gate lines about unreviewed `FAILURES.md` entries ("เรียก Atlas") — the PM repeats them to the
  operator; other roles mention them to the PM.

## 13. FAILURES.md — record your own defects

Append-only, newest first. Write an entry **before your next reply** when (harness §14):
a seat corrects you · `REWORK` / `TEST_FAILED` lands on your work · a routing violation you made or
caused · you relayed something that proved wrong · you gave an incomplete instruction · you broke a
written rule, even once, even if only you noticed · **you (or a question you relayed) asked the
operator about a topic `DECISIONS.md` already covered, or a follow-up you could have foreseen when the
topic was first asked** (§10a) · **a question that surfaces during a long dispatcher run on an item whose
readiness you prepared** — readiness claimed 100 % and was not (the PM/BA/SA who prepared the item writes it;
say what you failed to foresee and why, so Atlas can fix the cause in the skills).

**Take the id at write time:** re-read the newest `F-NNN` immediately before appending and use the next
number — parallel sessions share one file (two `F-026`s happened). Never renumber an existing entry.
You may only **add** an entry with `Status: NEW`. Never grade, close or edit an entry — only Atlas
changes a status. No rule covered it? Write `NONE — no rule covered it`; do not invent one.
Entry template: [references/failures-entry.md](references/failures-entry.md).

## 14. Evidence and QA

**Nothing is delivered because it compiles, reads correctly or passed review** (harness §8).

- **Engineers bring evidence**: the exact command and its real output in the TASK's
  `## Implementation Notes`. A claim without output is `REWORK`; anything not run is
  `UNVERIFIED — <what would settle it>`. The reviewer reviews the evidence, not the claim.
- **With QA:** QA tests from the REQ, not the build; only its verdict turns `SPEC_DONE` into
  `TEST_PASSED`, and `TEST_FAILED` stops the line. QA never proposes the fix.
  **Without QA:** every `DELIVERED` goes to the operator split into command-verified and `UNVERIFIED`,
  and `tests/` stays reserved for `TEST-*.md` files should a QA role be added later.
- Test with the tool the user will actually use. Reading the code is not verification.
  **"Works on my machine" includes your own shell:** an agent shell can resolve a different
  binary, PATH or env than the person's terminal — check in theirs before writing a fact about it.
- **A subagent's report is a lead, not a fact.** Every number, count or claim from a subagent that
  you write into the knowledge file or relay upward is either re-checked by you (cite it) or
  labelled `UNVERIFIED — subagent`.
- `tests/REGRESSION.md` = must-keep-working list; throwaway scripts go in `tests/harness/`, never a product repo.

## 15. Pointers, not restatements

- **The chat you sit in is a channel** — what may be said there vs. only in files: harness §5.
  Chat is never delivery; off-chain work is written down, not acted on — even from the operator.
- Talking to a seat (reply language first, verify before relay, provenance on lists): harness §6.
  Seats, authority, stamps: §2–§4. Desk language rules: the desk's `PROTOCOL.md`.
- Git, paths, commits, environments: harness §12 plus the desk's repo and environment tables.

## 16. Calling other skills — which ones you can call yourself

Role skills route you to other skills. Two kinds exist, and confusing them wastes a turn:

- **You can invoke** (Skill tool): every `superpowers:*`, `dart-flutter:*` that your session lists,
  `impeccable:impeccable`, `frontend-design:frontend-design`, `humanizer:humanizer`,
  `andrej-karpathy-skills:karpathy-guidelines`, `anthropic-skills:*`, and from mattpocock-skills:
  `grilling`, `tdd`, `diagnosing-bugs`, `codebase-design`, `domain-modeling`, `prototype`, `research`,
  `code-review`, `pr`, `writing-for-agents`. Agents: `pr-review-toolkit:*`.
- **Operator-only** (marked `disable-model-invocation` — the Skill tool refuses them): mattpocock-skills
  `grill-me`, `grill-with-docs`, `to-spec`, `to-tickets`, `wayfinder`, `triage`, `handoff`,
  `to-questionnaire`, `wait-what`, `teach`, `ask-matt`, `improve-codebase-architecture`, `implement`.
  When a role skill routes you to one of these: **either** use the invocable sibling (`grilling` for
  `grill-me`; `domain-modeling` for `grill-with-docs`), **or** ask the operator — through the desk's chain —
  to type `/<name>`, saying in one line why. Never pretend you ran it.
- A skill your session does not list does not exist for you. Do not cite it as done.
- **Host-project rules.** When the desk points to rules or skills published by the team that owns
  the code (a rules kit, a project bug-fix skill), they are mandatory and **override this skill and
  your role skill inside that team's repos** — commits, comments, branches, toolchain versions,
  validation gates. The desk's chain and claims still decide who may do what.
