# SPEC-109: CAW's side of REQ-112 — the worker is told to follow every rule; a spec part no card covers is shown
- Source: REQ-112 (Team B side; Team A's side is SPEC-106 § "REQ-112 addition" + TASK-117)
- Status: DONE (2026-10-30 16:3x, Silver — REQ-112 DELIVERED + COMMITTED, caw-back 58ab883 · caw-front 7ef4a1e) · was ACTIVE (2026-10-29, Silver — SA, Team B) — TASK-121/122 cut, **ON HOLD**: start gate below
- Repos read: `caw-back`, `caw-front` on `atom` @ 102a130 / 4b58bf3 plus the uncommitted REQ-104 trees, 2026-10-29 15:3x, Silver.
  Builds on two things not yet written: SPEC-107's v2 client + `readLatestPart` (TASK-114) and SPEC-106's `relatedDecisions` (TASK-117).

## Start gate

Team B order (PM, REQ-111 Q1 answer): REQ-111 → REQ-105 → **REQ-112**. TASK-121 depends on `REQ-105 committed (<hash>)` in
caw-back (it calls TASK-114's `spec()` and `readLatestPart`) **and** TASK-117 shipped in blueprint-back (the PM confirms; Team A's
commit). TASK-122 depends on TASK-121 DONE and `REQ-105 committed (<hash>)` in caw-front.

## PM decisions this SPEC carries (REQ-112 Q1, PM's answer on Team B's side, 2026-10-29 `[PM-decided]`)

- The prompt line and the MCP description: yes (D1).
- AC-2 shown **in both places**: the open proposal and the board (D2–D4).

## What exists (read)

- `spec` in a card's context is Blueprint's body, passed through unread: `back: src/cards/service.ts:92,96-99`; typed `z.unknown()` at
  `src/http/routes/cards.ts:29`; served by MCP `card_context` (`src/mcp/server.ts:73-77`). SPEC-107 D4/D5 keep it whole. So
  `relatedDecisions` reaches the worker with no CAW change (REQ-112 AC-1 data path).
- The worker prompt says only "Call the MCP tool `card_context` first" (`back: src/runner/prompt.ts:17`); the MCP description says
  "the decisions already made for it" (`src/mcp/server.ts:75`).
- A proposal's items carry `anchor: { key, version }` (`back: src/proposals/service.ts:1-3,46-57`); proposals and cards are read
  from CAW's state only, with no Blueprint call (`:93-97`). A proposal renders in `front: src/components/chat/Chat.tsx:47-53`;
  the board's notices sit above the columns in `front: src/components/Board.tsx:175`.
- Blueprint's spec: `Part { key, kind, title, … }`, `Link { kind, fromKey, toKey, … }`; a rule = a `decision` part, and
  `covers` links run decision → part (`back: test/fixtures/blueprint/project-200.json`, e.g. `DEC-001 covers STEP-003`).

## Design `[SA-decided]` unless marked; each is cheap to reverse

- **D1 — Tell the worker.** `buildPrompt` gains one numbered line after line 1: "Follow every rule in `spec.decisions` and
  `spec.relatedDecisions` of your card's context — a rule on a related part applies to your card too." The `card_context` MCP
  description adds: "…, the decisions covering that part (`spec.decisions`) and those on the steps and works around it
  (`spec.relatedDecisions`)". `[PM-decided]` yes.
- **D2 — Coverage is computed on demand, in one new read.** `GET /v1/projects/{projectId}/coverage[?proposalId=<uuid>]`:
  1. `spec = blueprint.spec(bp)` (SPEC-106 route 1, via TASK-114's client).
  2. Anchors = the anchor keys of every **work** card of the project (any status: a done card covered its rules), plus, when
     `proposalId` is given, that proposal's item anchors.
  3. Covered = for each distinct anchor key K: `K` itself if it is a decision, plus every key in `readLatestPart(K).body.decisions[]`
     and `.relatedDecisions[].decision` (missing field → `[]`). An anchor that `readLatestPart` returns `null` for (gone) adds nothing.
  4. Uncovered = every `decision` part of `spec.parts` not in Covered. Each is grouped under the parts it `covers` (links with
     `kind === "covers"` and `fromKey` = it); a decision that covers nothing is grouped under itself.
  5. Memo: the answer is kept in process memory keyed by `projectId | spec.revision | sorted anchors`; the same key answers
     from memory (the board re-renders whenever the event log grows — checked every 3 s, `front: src/components/LiveRefresh.tsx:2`). Cleared on restart; nothing stored.
- **D3 — Where it shows.** The proposal block in the chat calls it with `proposalId` (gap visible before accepting — the PM's
  point); the board calls it without (cards only). The PM's sentence, one line per part: `ส่วนนี้ใน spec ยังไม่มีงานไหนรับไป: {part}`
  with `{part}` = `<key> <title>`, the key linked to Blueprint with the existing helper (`front: src/blueprint.ts:5-6`). Nothing
  when `uncovered` is empty.
- **D4 — Advisory only.** It never blocks accepting a proposal or starting a run. If the read fails (Blueprint down → 502, as other
  reads), the front shows nothing in that place — the REQ-105 unreachable sentence already says Blueprint is down.
- **Limits, stated:** a `relatedDecisionsMore: true` context (> 50) may list a covered decision as uncovered (conservative). Before
  TASK-117 ships, every rule not on an anchor is listed — that is why TASK-121 waits for it.

## API / Interface Design

`GET /v1/projects/{projectId}/coverage?proposalId=<uuid>` — actor header required as for other reads (any actor); `proposalId` optional.
```json
{ "revision": 12,
  "uncovered": [ { "key": "STEP-002", "kind": "step", "title": "เช็คสถานะ", "decisions": ["DEC-001", "DEC-002", "DEC-003"] } ] }
```
- `uncovered` sorted by `key` (Blueprint's `compareKeys` order is not available in CAW → plain string sort); `decisions` sorted.
- 404 `not_found` (project) · 404 `not_found` (`proposal`, or a proposal of another project) · 400 `validation` (bad uuid) ·
  502 `blueprint_unreachable` (as today's reads, `back: src/http/errors.ts`).
- Front: `CawApi.coverage(projectId: string, proposalId?: string): Promise<Coverage>`, `Coverage = { revision: number; uncovered:
  { key: string; kind: string; title: string; decisions: string[] }[] }` — casing exactly as above.
Consumers: none — a new route and a new `CawApi` method (`grep -rn --include=*.ts --include=*.tsx -i coverage src` → no hits in
either repo, 2026-10-29 15:3x; a plain grep hits only recorded `.jsonl` stream fixtures, which are not code).
The `CawApi` interface has two implementations that must both gain it: `front: src/api/http.ts`, `src/api/mock.ts`.

**Prompt / MCP text** (D1). Consumers: `grep -rn "buildPrompt\|Everything you need to do a card" src test` → `back: src/runner/hop.ts:281`
(caller, unchanged) · `src/runner/prompt.test.ts:10-26` (asserts `toContain`, not the whole text — keeps passing; a new assertion
is added) · `src/mcp/server.ts:75`.

## Data Model

None (D2 memo is process memory).

## Tasks

- TASK-121: caw-back — prompt line + MCP description; `GET …/coverage` — owner: BE Bob (depends on: REQ-105 committed + TASK-117 shipped)
- TASK-122: caw-front — uncovered parts on the open proposal and on the board — owner: FE Fanta (depends on: TASK-121 DONE)

## AC → work

| AC | Where |
|---|---|
| AC-1 context has the 10 s / 3 s rules | Team A TASK-117 (field) + CAW passes it through (no work, verified above) + TASK-121 D1 (the worker is told) |
| AC-2 uncovered part shown | TASK-121 (route) + TASK-122 (proposal + board) |
| AC-3 live re-check every 10 s | REQ-108 phase 2 (QA) |
| AC-4 regression | TASK-121 (prompt/MCP tests, suite) · TASK-122 (suites, e2e) |

## Questions

None open. (Words: the PM's sentence as written; `{part}` = key + title is `Interpreted` from "{ชื่อส่วน}" / "{part}" — the key is
what the operator types into Blueprint, the title is the name.)
