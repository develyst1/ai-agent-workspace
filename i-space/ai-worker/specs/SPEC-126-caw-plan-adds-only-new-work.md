# SPEC-126: A later plan adds only the work that is not already open on the board, however it is worded (REQ-126 round 2)
- Source: REQ-126 § Round 2 (DEF-2, TEST-122 r2) + § Questions Q2 (C), answered by the PM 2026-10-31 03:4x
- Status: DONE (2026-10-31 04:28, Silver — TASK-170/171 DONE; REQ-126 r2 SPEC_DONE) · was ACTIVE (2026-10-31 03:5x, Silver)
- Read (2026-10-31 03:2x–03:4x): caw-back 5b49f65 `src/proposals/service.ts:1-151`, `src/http/routes/proposals.ts:12-45`, `src/core/reduce.ts:19-35,131-165,246-250`, `src/core/events.ts:46,71,100`, `src/cards/view.ts:27,42`, `src/cards/service.ts:55-75`, `test/http/plan-copy.test.ts`, `test/http/proposals.test.ts:60-80,190-215`; caw-front 7f68c42 `src/api/caw.ts:200-214`, `src/lib/crew.ts:60-82`, `src/components/chat/Chat.tsx:40-95,125-135,228-235`, `src/api/mock.ts:43-81,160-176,305-325,395-401,705-735`, `src/words.ts:409-418`, `tests/chat.spec.ts:28-60,300-350`. Live data: `tests/harness/test-124/r2/out/proposal.json` + the chat hop trace → `tests/harness/spec126-r2-plans.json` (both plans, worker ids replaced by role).
- Supersedes SPEC-125 D4 and D5 (the "same items" copy check), which DEF-2 proved too narrow. SPEC-125 D1–D3, D6, D7 are unchanged.

## Overview
| | Today (round 1, evidence) | Round 2 |
|---|---|---|
| What counts as "the same plan" | Equal item lists: same length, and per index the same trimmed title, anchor key and worker (`proposals/service.ts:135-137`; front `crew.ts:65-73` `samePlan`) | **Per item:** an item is "on the board" when an **open work card** of the project carries its **anchor key** (D1). Never the wording, the order, the grouping or the worker. |
| TEST-122 r2's repost | First plan anchors REQ-009,007,008,003,002,004,005,006,001; repost anchors REQ-007,004,008,003,002,004,005,006,001 with new titles and regrouped work → not equal → accepted → 9 → 18 cards | Every repost key is on one of the 9 fresh `todo` cards → **all 9 on the board** → `แผนนี้ตกลงไปแล้ว`, no button, accept 409, no card made |
| Where the rule lives | Twice: caw-back (D4) and caw-front (`samePlan`) | **Once, in caw-back.** `Proposal.onBoard` (computed on read) tells the screen which items are on the board; caw-front only reads it. |

## D1 — "on the board" (caw-back, TASK-170)
In `src/proposals/service.ts`:
- `liveCards(s, key?)` = the project's cards with `kind === "work"`, `status !== "done"`, `anchorRemovedRevision === null` (and `anchorKey === key` when a key is given). (Q2 = C; 3d.)
- `onBoardOf(s, p): number[]` = for an **open** proposal, the indexes `i` (ascending) of `p.items` whose `anchor.key` is the `anchorKey` of some `liveCards(s)`; `[]` for an accepted or superseded proposal.
- `Proposal = ProposalState & { hopsTotal: number; onBoard: number[] }`; `proposalView(s, p)` adds `onBoard: onBoardOf(s, p)`. Both callers pass the state they already hold (`propose`: the state `writeDecided` returns; `listProposals`: `s`). Computed on read, never stored (no event, no column, no migration).

**Result table — a card with the item's key (spec-rules §3):**
| The card | Counts as on the board? |
|---|---|
| work · `todo` / `doing` / `review` / `stuck`, part in the spec | **yes** |
| work · `done` | no (Q2 = C: a done requirement can get new work) |
| work · any status, part removed from the spec (`anchorRemovedRevision ≠ null`, REQ-105 D12) | no (3d) |
| question card (`kind: "question"`, which copies its asking card's key, `reduce.ts:164`) | no |
| no card with that key | no |

| The proposal | `onBoard` |
|---|---|
| open | the indexes as above (may be `[]`, some, or all) |
| accepted · superseded | `[]` |

**Boundary case against the existing "workable" rule** (`src/cards/view.ts:27`: work, part not removed, `todo`/`doing`, every dependency done). A card in **`review`** is **not workable** (wrong status) but **is on the board**: its work is built and waits for the owner. A plan for its requirement must not make a second card, and it doesn't. A **`todo` card whose dependency is not done** is not workable and is on the board. A **removed `todo` card** is neither. The two rules disagree only on `review`/`stuck` and on unmet dependencies, and that is deliberate: workable means "can a worker start it now", on the board means "is this requirement's work already open".

## D2 — accept makes cards only for the new items (caw-back, TASK-170)
`accept` inside its `writeDecided` (so the check sees the same state as the write), **replacing** SPEC-125 D4's `same` check:
1. `onBoard = new Set(onBoardOf(s, p))`. **All items on the board → 409 `plan_already_accepted`, message `แผนนี้ตกลงไปแล้ว`** (round 1's code and words), nothing written, the proposal stays `open`.
2. `fresh` = the items not on the board, in order. The `not_a_member` check runs on `fresh` only (a skipped item makes no card, so it needs no assignee).
3. One `card.created` per fresh item. `number` = `first + k` (k = its place among the fresh items, so numbers stay consecutive), `id = ids[i]` (the ids drawn before the write, as today). **`dependsOn`:** an index `j` of a fresh item → `ids[j]`; an index `j` of a skipped item → the ids of `liveCards(s, p.items[j].anchor.key)` (the open card(s) already doing that work), deduplicated. A new card must not start before the work it waits for, even when that work came from an earlier plan.
4. `proposal.accepted` with `cardIds` = the fresh items' ids only. Nothing reads `cardIds` by index (`grep -rn cardIds` in both repos, 03:3x: `reduce.ts:250` stores it, the screens show it as a list). The response is those cards (read from the accepted proposal's `cardIds`).
5. `checkAnchors(found.items)` before the write is **unchanged**: every item's key must still be in the spec (422 `anchor_not_in_version`), skipped ones included.

**Cases:**
| Plan at accept time | Result |
|---|---|
| no item on the board (a first plan; a plan for new requirements) | 200, a card per item, as before |
| TEST-122 r2's repost (`spec126-r2-plans.json` `second`) after `first` was accepted, cards still open | 409 `plan_already_accepted`, card count unchanged (AC-7) |
| round 1's identical copy, the first plan's cards still open | 409 (AC-9: still caught) |
| the same work + one requirement on no card | 200, exactly the new requirement's items become cards (AC-8) |
| a plan for a requirement whose cards are all `done` | 200, new cards (Q2 = C) |
| a plan whose only item's card had its part removed, then the part came back (`card.anchor_restored` clears it) | on the board again → 409 |
| two items of one plan with the same new key | both become cards (neither is on the board at accept) |
| BE + FE items on a key the board has only an FE card for (TEST-122 r2's REQ-004) | both skipped: the match is by requirement key, not role (Q2) |

## D3 — the screen reads `onBoard` (caw-front, TASK-171)
- `src/api/caw.ts` `Proposal`: add `onBoard: number[]` (same comment as the back). `src/api/schema.d.ts`: `gen:api` from TASK-170's `openapi.json`.
- `src/lib/crew.ts`: **remove `samePlan`**. `isPlanCopy(p: Proposal) = p.status === "open" && p.items.length > 0 && p.onBoard.length === p.items.length` (one argument). `proposalWaits` calls `isPlanCopy(p)`. `src/components/chat/Chat.tsx:128` `isCopy = (p) => isPlanCopy(p)`. A copy keeps round 1's badge `แผนนี้ตกลงไปแล้ว`, no button, skipped by `newestOpen` and by the Board's waiting line, unchanged.
- **Partly on the board** (`0 < onBoard.length < items.length`, open): above the agree block's `data-agree-what` line, a line `data-agree-onboard` with `agreeStart.partly(n, m)`; and `data-agree-what` uses `m` (`agreeStart.manual(m)` / `agreeStart.dispatcher(m)`), since only `m` cards will be made. The estimate line (`words.estimate(items.length, hopsTotal)`) still describes the whole plan as proposed, unchanged.
- Words (`src/words.ts` `agreeStart`, PM's REQ § Round 2 3c): `partly: (n: number, m: number) => \`มีงานนี้บนบอร์ดแล้ว ${n} งาน — จะเพิ่มเฉพาะงานใหม่ ${m} งาน\`` — `{n}` ← `Proposal.onBoard.length` · `{m}` ← `items.length − onBoard.length` (spec-rules §5).
- **The mock** (`src/api/mock.ts`) follows D1/D2 so the e2e sees what caw-back does: `StoredProposal = Omit<Proposal, "hopsTotal" | "onBoard">`; `withTotal` computes `onBoard` from the project's cards (work, not done, `!anchorRemoved`, same key; open only); `acceptProposal` refuses 409 `plan_already_accepted` / `แผนนี้ตกลงไปแล้ว` when all are on the board, else makes cards for the fresh items only, with D2's numbering and `dependsOn`. **Fixture:** the default seed's open plan `Q(2)` ("แจ้งผล") anchors API-003 / SCR-003 / DEC-001, and all three already have open cards (seed 6 `review`, 7 `review`, 12 `stuck`), so under D1 it would lose its button. Add one spec part `"API-004": part("API-004", "api", "แจ้งผลการจอง")` (no neighbours) to `SPECS` and anchor `Q(2)`'s first item on it. `Q(2)` is then the partial case (`onBoard [1, 2]`, n 2, m 1), the screen AC-8 needs. The REQ-112 test that relies on Q(2) covering SCR-003 keeps working. **[SA-decided: a fixture change, not product behaviour.]**
Consumers (probe): probe-change.sh caw-front spec126-r2-front.patch → 13 errors — each hit with its TASK in § API (all → TASK-171)

## API
- `GET /v1/projects/{id}/proposals` and `POST /v1/projects/{id}/proposals`: each `Proposal` gains **`onBoard`** — `number[]`, integers ≥ 0, ascending, computed on read; `[]` unless `status === "open"`.
- `POST /v1/proposals/{id}/accept`: 409 **`plan_already_accepted`** (message `แผนนี้ตกลงไปแล้ว`) now means "every item is on the board"; 200 returns **only the cards made** (may be fewer than the items). No new code, no new status.
- `openapi.json` changes ⇒ caw-front `gen:api` + `typecheck` (TASK-171, spec-rules §2).

Consumers (probe): probe-change.sh caw-back spec126-r2.patch → 4 errors (SA 03:47 on 5b49f65, fp 32a65f35c337, D1 with `status !== "done"`; tsc 0 both; paired caw-front on the patched openapi: gen:api 0, typecheck 0, tests 0 — its hand-written `Proposal` type hides the field, so the front was probed on its own below)
caw-back → test/http/plan-copy.test.ts:45 (fail) B with one title changed → 200 — round 1's rule; now 409 (DEF-2's case) → TASK-170
caw-back → test/http/plan-copy.test.ts:55 (fail) a different anchor, a different worker, or a different number of items is a different plan — other worker same key → 409, more items → 1 new card → TASK-170
caw-back → test/http/proposals.test.ts:69 (fail) propose: 201 Proposal … (`toEqual` lacks `onBoard`) → TASK-170
caw-back → test/http/proposals.test.ts:199 (fail) accept: … not_a_member (p2 reuses p1's key → now 409 first) → TASK-170

Consumers (probe): probe-change.sh caw-front spec126-r2-front.patch → 13 errors (SA 03:3x on 7f68c42, fp f91e9b59a4f2; the patch = D3's `caw.ts` field + `isPlanCopy`/`samePlan` + `Chat.tsx:128`)
caw-front → src/api/http.ts:106 TS2345 (the generated proposals type lacks `onBoard`) → TASK-171 step gen:api — **checked:** gen:api from the patched caw-back's `openapi.json` + typecheck → this error is gone, the other 11 type errors remain (SA 03:3x, scratch copies)
caw-front → src/api/mock.ts:165, :168, :174, :320 TS2741 (`onBoard` missing in a proposal literal) → TASK-171 (mock: `StoredProposal` omits `onBoard`, `withTotal` computes it)
caw-front → src/lib/crew.test.ts:97 TS2305 (`samePlan` gone), :389–:393, :397 TS2554 (`isPlanCopy` takes one argument) → TASK-171 (rewrite those tests on `onBoard`)
caw-front → (command) bun test src — 1 error (the crew.test.ts import above) → TASK-171
Not seen by the probe (no compile error; behaviour): `crew.test.ts:416-422` (proposalWaits with copies by item equality) → TASK-171 · `tests/chat.spec.ts:41-52` and `:327-331` (accepting Q(2) expects `before + 3` cards and the "(แจ้งผล)" page card) → TASK-171, inferred from reading — the FE's e2e run settles it.

## Non-functional
- One extra pass over the project's cards per proposal read (already loaded in `State`). No DB change, no migration, no new event.

## Risks
- **R1:** a repost after **every** card of that work is done is accepted again (Q2 = C accepted it as rare: both seen reposts came seconds after the accept).
- **R2:** a genuine follow-up on a requirement whose card is still open (e.g. in รอตรวจ) is counted as on the board. The owner finishes or reviews that card first, then asks again (Q2 case, accepted).
- **R3:** an item anchored on a non-requirement part (SCR-, API-, STEP- keys, older flows and the mock) is matched by that key in the same way: a later plan on the same part while its card is open is skipped. Same rule, no special case.

## Tasks
- TASK-170: caw-back — D1, D2, `onBoard` in the schema, the 4 probed tests + new cases — owner: BE Bob (depends on: REQ-126 r1 committed 5b49f65 ✓)
- TASK-171: caw-front — D3, words, mock, crew/e2e tests, `gen:api` — owner: FE Fanta (depends on: REQ-126 r1 front committed 7f68c42 ✓; TASK-170's `openapi.json` for `gen:api` only)
  Consumers (probe): probe-change.sh caw-back spec126-r2.patch → 4 errors (all → TASK-170) · caw-front spec126-r2-front.patch → 13 errors (all → TASK-171) — the runs in § API

AC map: AC-7 → D1 + D2 (TASK-170, the r2 plans as a stub test) + D3 badge (TASK-171) · AC-8 → D2 partial + D3 line (both TASKs; mock Q(2)) · AC-9 → round 1's suites + D2 table rows 1 and 3 (both TASKs).

## Questions
- Q2 (which cards count) → REQ-126 § Questions Q2, answered (C) by the PM 03:4x.
