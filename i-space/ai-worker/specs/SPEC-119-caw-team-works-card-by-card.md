# SPEC-119: CAW's starting team works card by card — BE ↔ FE in the chain, each worker on its own card
- Source: REQ-121
- Status: DONE (2026-10-30 18:27, Silver — TASK-153 + TASK-154 DONE)
- Team: B · repos: `caw-front` (D1), `caw-back` (D2, D3)
- Read on `caw-back` `atom` 3efcc1a (+ TASK-152's 5 uncommitted paths, none touched here) and `caw-front` `atom` 1287772, 2026-10-30 18:0x–18:1x.
- Order: TASKs released after REQ-120's commit (caw-back 3795236, 18:18) — caw-back shares one tree and QA fingerprints the whole tree. TASK-153 and TASK-154 share no file and run in parallel.

## Overview

TEST-106 phase 3 (live): P3-1 — แบงค์ (BE) could hand only to มิ้นท์ (QA), so the BE wrote the page and ฝน (FE) never
ran; P3-2 — card #1 built the whole product, and cards #2–#8 (one per requirement) would have found their work done.

- **P3-1 cause (read):** the starting team's chain has no BE ↔ FE edge — `caw-front → src/lib/startingTeam.ts:12`
  `STARTING_EDGES = [PM→SA, SA→FE, SA→BE, FE→QA, BE→QA, QA→PM]`; caw-back refuses any worker hand-off that does not
  follow an edge (`caw-back → src/cards/service.ts:143-157`, `chain_broken`), and the prompt's hand-off line lists
  only the edges' targets (`src/runner/hop.ts:230-238`).
- **P3-2 cause (inferred — the live run of AC-3 settles it):** every card hop reads rule 2
  (`caw-back → src/runner/prompt.ts:24`, added by REQ-118 / SPEC-117 D1): *"Follow every requirement in
  `spec.requirements` … the requirements bind every card, whatever its anchor"*. Card #1 (BE) read all 8 requirements
  as its work. Nothing tells a card worker that other cards exist: its context has no list of them
  (`src/cards/service.ts:90`, `CardContext` = card, spec, notes, decisions, handOffTo, codeMap), and it cannot propose
  cards (proposals are the entry worker's chat hop only — `src/proposals/service.ts:1,47-49`).
- A model's behaviour cannot be forced (REQ-121 § Requirement). What the code does to back req 2: the worker is
  **told** its card's work only (D2.1), **shown** the other open cards and who holds them (D2.2), and **told** what to
  do with work no card holds (D2.3). AC-3's live run is the proof.

## D1 — caw-front: BE ↔ FE in the starting team (REQ-121 req 1, AC-1)

`src/lib/startingTeam.ts:11-12`: add `["BE", "FE"]` and `["FE", "BE"]` to `STARTING_EDGES` (after `["SA", "BE"]`), and
the doc comment above it names them (`BE ↔ FE (REQ-121)`). 6 edges → 8. Nothing else in `ensureStartingTeam` changes
(it adds every listed edge, skipping `edge_exists`).

- **Existing projects** keep the chain they have `[SA-decided]`: the team button shows only until a project has its
  team (`caw-front → src/components/FirstSteps.tsx:22` — `{!done[key] && body}`), so a project made before this
  change keeps 6 edges. Its owner can add BE → FE on the team page (`/p/{id}/team`, `FirstSteps.tsx:39`). REQ-121
  AC-3's live run uses a new project. Cheap to revisit if the owner wants existing projects updated.
- The FE → BE edge too: REQ-121 req 1 says *"BE ↔ FE"* (the FE hands back an API gap to the BE).

Consumers (probe): probe-change.sh caw-front spec121-front.patch → 3 errors
caw-front → src/lib/startingTeam.test.ts:17 (fail) the starting team > the five seats and the chain between them, as the spec writes them → TASK-154
caw-front → src/lib/startingTeam.test.ts:25 (fail) the starting team > on an empty project: five members, six edges, entry = the PM; a worker that already exists is reused, the missing one is made with its role and skills → TASK-154
caw-front → src/lib/startingTeam.test.ts:49 (fail) the starting team > a half-made team is finished: members but no edges, and a drop in the middle of the steps then a retry → TASK-154

(patch `tests/harness/spec121-front.patch`, run 2026-10-30 18:1x on caw-front 1287772, defaults gen:api · typecheck ·
bun test src; real repo untouched.) Grep, prose: `startingTeam.test.ts:57` (`toHaveLength(2)` after a drop at edge 3) is
order-dependent — the 3rd edge is still `SA → BE`, so it stays 2; TASK-154 checks it.

## D2 — caw-back: a card worker does its own card (REQ-121 req 2, AC-2)

All in `src/runner/prompt.ts` `buildPrompt` and `src/runner/hop.ts`. No API, no MCP tool, no `openapi.json` change.

**D2.1 — rule 2 reworded** (`prompt.ts:24`, and its comment above): from *"Follow every requirement … the requirements
bind every card, whatever its anchor; …"* to exactly:
`2. Do only your card's work — its title and its \`todo\`. Every requirement in \`spec.requirements\` and every rule in \`spec.decisions\` and \`spec.relatedDecisions\` binds how you do it (a rule on a related part applies to your card too); they are not a list of work for this card.`
REQ-118's point is kept (every requirement still binds every card, as a rule); what changes is that it is no longer
read as work to build.

**D2.2 — the other-cards line**, right after rule 2, only when there is at least one other card:
`Other cards hold their own work — leave it to them, even if you could do it now: #2 <title> (<name> <roles>, <status>); #3 …`
- Source per placeholder (spec-rules §5): `#n` ← `Card.number`; `<title>` ← `Card.title`; `<name> <roles>` ← the chain
  member whose id = `Card.assigneeId` (`name`, `roles.join(" + ")`), or `ยังไม่มีคนรับ` when none / not in the chain;
  `<status>` ← `Card.status`.
- Which cards: the project's cards with `kind === "work"`, not this card, `status !== "done"`, ordered by `number`.
  Values from the schema: `cards_kind in ('work','question')` (`src/db/schema.ts:84`), `cards_status in
  ('todo','doing','review','done','stuck')` (`:85`). Result per kind/status (spec-rules §3):

| Card | In the line? | Why |
|---|---|---|
| this card | no | it is the worker's own work |
| other `work`, `todo` / `doing` / `review` / `stuck` | yes, with its status | it holds work not finished — leave it |
| other `work`, `done` | no | finished; nothing to leave |
| `question` card | no | not work (an operator question, `kind`) |
| none left | no line at all | `others.length === 0` |

  Boundary case (TEST-106 P3-2's shape): card #1 (BE, `doing`) with #2–#8 `todo`, each depending on #1 → #1's prompt
  lists #2…#8 with their holders; #2's prompt later lists #3…#8 (and #1 only if not `done` — e.g. `review`).
- Read in `hop.ts` by a new `otherCardsOf(deps, projectId, cardId)` beside `recipientsOf` (`hop.ts:230`), with
  `deps.api.cards(projectId)` (`src/runner/api.ts:89`) and `deps.api.chain(projectId)` (`:77`). Like the hand-off line it
  is an aid, not a gate: a read that fails is logged (`project <id>: the cards could not be read for the other-cards
  line (<message>) — the hop goes on without it`) and the hop goes on with no line.
- `buildPrompt` gets an optional input `others?: PromptOtherCard[]` (`{ number; title; assignee: string | null; status }`,
  new exported type), default `[]`, so every existing call and test still builds.
- **Timing:** the two reads and `recipientsOf` run together (`Promise.all`), so a card hop waits for one round of reads,
  not three. See the `main.test.ts:89` consumer below.

**D2.3 — rule 7**, after rule 6:
`7. If you find work that no card holds, say so in a \`comment\` (what is missing and why) — do not build it yourself.`
A comment, not a proposed card: `propose_cards` is the entry worker's chat-hop tool (above); REQ-121 req 2 allows "a
comment or a proposed card".

The six starter skills (`skills/role-*/SKILL.md`) do not change: the rule lives in the prompt, which the operator's own
skills cannot override.

Consumers (probe): probe-change.sh caw-back spec121-back.patch → 2 errors
caw-back → src/runner/main.test.ts:89 (fail) tick — manual mode > a hop the runner is still running is not started a second time on the next tick → TASK-153
caw-back → src/runner/prompt.test.ts:24 (fail) buildPrompt (SPEC-C-003 § 2) > tells the worker to follow every requirement in spec.requirements and every rule in spec.decisions and spec.relatedDecisions, right after card_context (REQ-112 D1, REQ-118 SPEC-117 D1) → TASK-153

(patch `tests/harness/spec121-back.patch` — D2 and D3 together; run 2026-10-30 18:1x on caw-back 3efcc1a + TASK-152's
paths, defaults tsc + bun test; paired caw-front not run, `openapi.json` the same; real repos untouched.)
`main.test.ts:89` diagnosed in a kept patched copy: `Expected length: 1 · Received length: 0` — after three ticks
without waiting, the one hop has **not spawned yet** (the extra reads before the prompt); nothing started twice. Timing,
not behaviour: TASK-153 makes the reads concurrent and has the test wait for the first spawn before it checks that later
ticks add none.

## D3 — caw-back: a page card goes to the FE (REQ-121 req 1, "A page or screen card goes to the FE")

Who holds a card is chosen by the entry worker when it proposes the card (`Item.workerId`, `src/mcp/server.ts:113`;
`card.created` assignee = the item's worker, `src/proposals/service.ts:142`). It sees each member's roles in
`chat_context` (`src/chat/service.ts:57`, `chain: chainView(state)`). Chat rule 3 (`prompt.ts:137`) gains, after "each
with your estimate of `hops`":
`, and each given (\`workerId\`) to the chain member whose role does that work — a page or screen to the FE, the server and data to the BE`
Covered by the same probe (no test pins that sentence).

## Front words

No new user-facing words. The other-cards line and rules 2/7 are prompt text a worker reads, in English like the rest
of the prompt; the one Thai fragment `ยังไม่มีคนรับ` ("no one has it yet") is shown only to the worker `[SA-decided]`.

## Non-functional

No live run in the TASKs (stub `CLAUDE_BIN`, `pglite:memory`). AC-3 is QA's one live run, after commit.

## Tasks

- TASK-153: caw-back — card prompt: rule 2 reworded, other-cards line, rule 7; chat rule 3 assigns by role — owner: BE Bob (B) (depends on: REQ-120 committed)
- TASK-154: caw-front — BE ↔ FE edges in the starting team — owner: FE Fanta (B) (depends on: REQ-120 committed — caw-front has no REQ-120 change, but one topic at a time keeps QA's fingerprints simple; nothing shared with TASK-153)

## Questions

None blocking. `[SA-decided]`, cheap to reverse: existing projects keep their chain (D1); the "no card" path is a
comment, not a proposal (D2.3); `done` cards are left out of the line (D2.2).
