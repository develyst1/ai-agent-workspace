# SPEC-115: seam — every requirement of the spec in every part's context (Team A side of REQ-118)
- Source: REQ-118
- Status: ACTIVE (2026-10-30 15:3x, Sober)
- Team: A (Blueprint) owns this contract; Team B (CAW) consumes it — the CAW side (proposal prompt AC-2, coverage AC-3, worker prompt line, cache on a requirement edit AC-4) is **not** in this SPEC; it goes to the PM for Team B (§ For the PM).

## Read before designing (blueprint-back `f10f8cb`, 2026-10-30)
- `src/seam/context.ts:32-94` — `contextIn` builds a part's context only from **links** (neighbours, `covers`, `about`, the step/work climb, `relatedDecisions`). Shared by v1 (`partContext`, :23) and v2 (`seam/spec.ts:45` `specContext`).
- `src/spec/registry.ts:84-86` — `requirement`: prefix `REQ`, body `{ text: string 1..4000 }`, typed by a person, never by the interview (`src/interview/context.ts:14`). `registry.ts:133` — *"a requirement stands alone — no link may touch it"*.
- ⇒ **Cause of TEST-106 P2-1, by reading:** a requirement has no links, so no climb reaches it; a card anchored on REQ-001 gets REQ-001 as `part` and none of REQ-002…008. `inferred — settled by` TASK test (a) below, which reproduces it before the fix (expect `requirements` absent).
- `src/http/routes/seam.ts:16-34` — `PartContextSchema` (`.openapi("PartContext")`); `:55` `SpecContextSchema` = it minus `version`/`confirmedAt` plus head. Both routes (v1 `:109`, v2 `:82`) share it.
- caw-back `src/blueprint/client.ts:28` — CAW returns Blueprint's context **"exactly as returned"** to the worker's `card_context` (read-only, Team B's repo). So a new field reaches every CAW worker with **no CAW code** — the same path `relatedDecisions` took (REQ-112).

## API / Interface Design

Both context routes gain one field. Nothing else in either body changes.

| Route | Change |
|---|---|
| `GET /v1/projects/{id}/spec/parts/{key}/context` (v2, `SpecPartContext`) | + `requirements` |
| `GET /v1/projects/{id}/versions/{version}/parts/{key}/context` (v1, `PartContext`) | + `requirements` (same rule, from that version's snapshot) |

- **`requirements`: `Part[]`** — exact casing `requirements`. Every part of kind `"requirement"` in the spec the context is read from (current spec for v2, the snapshot for v1), **each the full stored `Part`** (`key`, `kind`, `title`, `body` with `body.text`, `origin`, `createdIn` — same `PartSchema` as `decisions`), sorted by key with `compareKeys` (REQ-002 before REQ-010).
- **Always present.** No requirement in the spec → `[]` (every interview-built spec today).
- **The anchor is included** when it is itself a requirement (REQ-001's context lists REQ-001…008). `[SA-decided]` one rule, no special case; the worker reads one list.
- **No cap, no `…More` flag.** `[SA-decided]` REQ-118 req 1 says *every* requirement; they are typed by hand (≤ 4000 chars each, `registry.ts:86`). Risk below.
- Status codes and errors: unchanged (200; 404 unknown project / version / key).

Example (v2, a card on WRK-001 in a spec with two requirements):
```json
{ "projectId": "…", "revision": 12, "savedAt": "…", "latestLabel": { … },
  "part": { "key": "WRK-001", … }, "neighbours": [ … ], "decisions": [ … ], "flows": [ … ], "questions": [ … ],
  "relatedDecisions": [ … ], "relatedDecisionsMore": false,
  "requirements": [
    { "key": "REQ-001", "kind": "requirement", "title": "Health Board", "body": { "text": "…" }, "origin": { … }, "createdIn": "…" },
    { "key": "REQ-002", "kind": "requirement", "title": "…", "body": { "text": "…" }, "origin": { … }, "createdIn": "…" } ] }
```

Consumers: `grep -rn "contextIn\|PartContext\|SpecContext\|relatedDecisionsMore" src test` (blueprint-back, 2026-10-30) →
- `src/seam/context.ts` (the change) · `src/seam/spec.ts:11,42,45,47` (type flows through, no edit) · `src/http/routes/seam.ts:16-34,55` (schema: TASK A) · `openapi.json` (re-emit: TASK A)
- `test/seam/spec-v2.test.ts:144` pins the v2 key list → **must gain `"requirements"`** (TASK A) · `test/seam/related-decisions.test.ts:44-109` reads only its own fields → untouched
- other key-list pins (`git grep -n "Object.keys" f10f8cb -- test/seam test/http`): `spec-v2.test.ts:98,168,172`, `locate.test.ts:110-111`, `spec-store.test.ts:391-396` — other bodies, untouched
- blueprint-front `src/core/api/schema.d.ts` (generated; `check:api` compares it with `openapi.json`) → **TASK B gen:api** (F-036) · hand-built uses of the two schema names (F-042): `grep -rn "PartContext\|SpecPartContext" src` minus `schema.d.ts` → no hits (2026-10-30 16:0x, on `09f2717`), so `schema.d.ts` is the whole file list
- caw-back (Team B, read only): `client.ts:28` passes through; `projects/coverage.ts:47-49` reads `decisions`/`relatedDecisions` only; `runner/prompt.ts:19-20` names those two → **the PM's, for Team B** (§ For the PM)

## Data Model
None. `requirements` is read from the parts already stored. Consumers: n/a — no table, column or key pattern changes.

## Flow
`contextIn(spec, key)`: after `relatedDecisions`, add
`requirements = spec.parts.filter((p) => p.kind === "requirement").sort((a, b) => compareKeys(a.key, b.key))`
and return it. v1 and v2 both get it through `contextIn`.

## AC map (REQ-118)
| AC | Team A | Team B (via the PM) |
|---|---|---|
| AC-1 card context holds all 8 verbatim | TASK A: the field; test (a)/(b) on a hand-entered 8-requirement spec, two anchors | none in code (pass-through `client.ts:28`); a prompt line telling the worker to follow `requirements` is Team B's choice |
| AC-2 proposal prompt holds all 8 | no work — `GET …/spec` already returns every part incl. requirements (`seam/spec.ts:37-39`) | the entry-chat prompt |
| AC-3 uncovered requirements listed | no work — the definition of "taken up" is a REQ question (Q1) | `coverage.ts` |
| AC-4 edited requirement seen by the next hop | no work — v2 reads the current spec per call (`spec.ts:21-26`); an edit is one change set, `GET …/spec/changes` lists the key in `changed` (`spec.ts:89`) | CAW's cache must treat a change to any `REQ-*` key as touching every card (it is in every context now) |
| AC-5 regression | TASK A: full suite; interview spec context = before + `requirements: []`; TASK B: front check:api/typecheck/tests | Team B's suites |
| AC-6 live | — (REQ-108 phase 3, QA) | — |

## Non-functional
Size: a context grows by the requirements' size. 8 typed requirements ≈ a few KB. Worst case allowed by the registry: n × 4000 chars, uncapped.

## Risks / assumptions
- R1 — many or long requirements make every card's context large. Accepted for now (owner is the only user; hand-typed). Would change the design: a project with > ~50 requirements → add a cap + `requirementsMore` like `relatedDecisions`.
- A1 — v1 snapshots hold requirement parts like any part (REQ-103 labels freeze `parts`). Settled by TASK A test (c).

## Order (F-013)
blueprint-back's tree holds REQ-115's TASK-134 in progress (11 paths incl. `openapi.json`, 15:32). **TASK A depends on REQ-115 committed** in blueprint-back; TASK B on TASK A's `openapi.json` and blueprint-front's previous topic committed (REQ-115's TASK-135, same file `schema.d.ts`). `[SA-decided]` — recalling TASK-134 would throw away a migration and 11 files of work; TASK A is XS.

## Tasks
- TASK A: blueprint-back — `requirements` in every part context (v1 + v2), schema, openapi, tests — owner: BE Jason (depends on: REQ-115 committed)
- TASK B: blueprint-front — gen:api for `requirements` — owner: FE Fern (depends on: TASK A `openapi.json` · REQ-115 front committed)

## For the PM (Team B side — a seam change, routed by the PM)
Contract above is final for Team A. Team B needs, for REQ-118: AC-2 entry-chat prompt, AC-3 coverage (after Q1), AC-4 cache rule, and (their choice) a worker prompt line naming `spec.requirements`. They can build against this contract now; the joint run waits for TASK A's commit.

## Questions
- Q1 → the PM (in REQ-118 § Questions). **Answered 15:4x `[PM-decided]`: accepted as proposed** (anchored on the requirement's key = taken up; seen in context ≠ taken up). Team B's; no change to this contract.
