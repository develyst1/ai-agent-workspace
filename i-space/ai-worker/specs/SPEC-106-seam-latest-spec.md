# SPEC-106: The seam, v2 — Blueprint serves the latest spec and tells CAW on every save (Blueprint's side of REQ-105)
- Source: REQ-105 (Team A side; **this file's § Seam contract v2 is the contract Team B builds against**, routed by the PM)
- Status: DONE (2026-10-30 15:0x, Sober — SA, Team A) — TASK-113 + TASK-140 (REQ-105) committed blueprint-back e4b2579 / blueprint-front 282e426; TASK-117 incl. round 2 + TASK-141 (REQ-112) committed ccd32af / 09f2717 · was IN_PROGRESS (2026-10-29)
- Repos read: `blueprint-back` @ f60b934 plus the uncommitted TASK-107 tree (labels, `change_sets.by`), 2026-10-29, Sober. CAW's repos not read (G9). CAW facts come only from `maps/caw.md` and `maps/caw-gap-102.md`.

## What exists today (Blueprint side, `maps/blueprint-gap-102.md` § b)

- `GET /v1/projects/{id}` serves the **live** spec, but carries no marker of which state it is.
- `GET …/versions/{n}`, `GET …/versions?after=` and `GET …/versions/{n}/parts/{key}/context` serve **frozen snapshots**.
- `POST …/locate` matches against the **latest snapshot**, and refuses when there is none (`back: src/seam/locate.ts:37`).
- The push to `CAW_NOTIFY_URL` fires **only on confirm**, now on a label (`back: src/projects/service.ts:121`).

## Design `[SA-decided]` (each cheap to reverse)

- **V1 — Nothing CAW uses today changes.** All six current seam routes, and the `version.confirmed` push, keep their exact behaviour and shape (AC-6). The new contract lives **beside** them, on new paths under `/v1/projects/{projectId}/spec…`. Team B switches when its side is ready, and the old routes retire in a later REQ once CAW no longer calls them.
- **V2 — A revision number names each state of the spec.** `change_sets.rev` is an integer, per project, assigned under the existing project lock as `max(rev) + 1` (`back: src/spec/store.ts:107-111`, and the undo path). A project's **revision** is its highest `rev` (0 when nothing has been saved). Every saved spec edit raises it by exactly 1: interview round, hand edit, requirement edit, undo, wrong quiz mark. Sources, settings and labels do not: they are not spec changes (SPEC-104 D5). An integer and not a clock, because two saves can share a timestamp.
- **V3 — Pull is the guarantee, push is the hint.** After every committed change set, Blueprint POSTs `spec.changed` to `CAW_NOTIFY_URL`, best effort: one attempt, 2 s, **not awaited by the request** (a chat round must not wait on CAW), and failure only logged as a code. CAW must also poll `…/spec/changes` (Team B picks the interval, ≤ 30 s for AC-1). The poll is what makes AC-1 and AC-5 hold when a push is lost.
- **V4 — A label is a tag.** The latest label comes back with every v2 read, as `latestLabel`. No v2 read takes a version number.
- **V5 — Hop pinning is CAW's.** Blueprint serves only the latest state. CAW keeps the text it read at hop start (AC-2), and keeps `revision` beside it, if it wants to show "read at r12". Blueprint does not serve old revisions; labelled snapshots stay readable through the v1 `versions` routes.

## Seam contract v2 — the routes (field casing is the contract)

All are reads, need no name header, and are exempt in the name middleware (`back: src/http/actor.ts:13` gains `spec/locate`). Error body as everywhere: `{ "error": { "code", "message" } }`. An unknown project → 404 `not_found`.

**1. `GET /v1/projects/{projectId}/spec`** — the current spec, in one read.
```json
{ "projectId": "uuid", "revision": 12, "savedAt": "2026-10-29T07:01:02.000Z",
  "latestLabel": { "version": 2, "label": "v2 หลังแก้", "labelledAt": "…", "by": "โด่ง" },
  "parts": [ Part, … ], "links": [ Link, … ] }
```
- `Part` and `Link` are exactly as in `GET /v1/projects/{id}`, sorted the same way. They include `requirement` parts (REQ-103 Q5: CAW accepts the kind).
- `savedAt` is the time of the change set that made `revision`, or null at revision 0.
- `latestLabel` is null when there is no label.

**2. `GET /v1/projects/{projectId}/spec/parts/{key}/context`** — one part's context, from the current spec.
- Same body as today's versioned context (`back: src/seam/context.ts:14-17`: `part`, `neighbours`, `decisions`, `flows`, `questions`), but `version`/`confirmedAt` are replaced by `revision`, `savedAt` and `latestLabel`.
- A key that isn't live → 404 `not_found` (`part <key>`).

**3. `POST /v1/projects/{projectId}/spec/locate`** — body as today's locate (`{ "request": string }`).
- 200 `{ "revision", "notInSpec", "candidates": [ … same Candidate shape … ] }`, matched against the current spec.
- Never refuses for "no version". An empty spec gives `notInSpec: true`, with no candidates.

**4. `GET /v1/projects/{projectId}/spec/changes?after=<revision>`** — what changed since a revision. `after` is an integer ≥ 0, default 0.
```json
{ "revision": 12, "latestLabel": { … } | null,
  "changes": [ { "rev": 11, "at": "…", "by": "โด่ง" | null, "cause": "operator" | "message" | "source" | "undo",
                 "added": ["REQ-002"], "changed": ["STEP-003"], "removed": [] }, … ] }
```
- One entry per change set with `rev > after`, ascending.
- Keys are derived from that set's `changes` rows:
  - a part with no `before`, or one that was removed and is now restored → `added`;
  - a part now marked removed → `removed`;
  - any other part row → `changed`;
  - a link row marks both its end parts `changed`, unless that end is in `added`/`removed` of the same set. These are the same rules the v1 feed uses (`back: src/seam/feed.ts:22-42`).
- `after` ≥ `revision` → `changes: []`. `after` negative or not an integer → 400 `validation`.
- Answers come from `change_sets`/`changes` with a limit of 500 sets. If more are pending, the response holds the first 500 and `"more": true`, so CAW asks again from the last `rev`. Otherwise `more` is false.

**5. Push — `POST <CAW_NOTIFY_URL>`** after each committed change set:
```json
{ "event": "spec.changed", "projectId": "uuid", "revision": 12, "at": "…" }
```
- Same delivery rules as today's push (`back: src/seam/notify.ts:1-30`: http(s) only, 2 s, codes-only logging, empty URL = no call), except it is **not awaited**.
- `version.confirmed` on a label is still sent exactly as today.
- CAW must ignore an `event` value it doesn't know. **Team B, please confirm this through the PM**: today CAW may only expect `version.confirmed`.

**Unchanged (v1, AC-6):** `GET /v1/projects/{id}` · `GET …/versions/{n}` · `GET …/versions?after=` · `GET …/versions/{n}/parts/{key}/context` · `POST …/locate` · `POST …/amendments` · `version.confirmed` push.

## REQ-112 addition — `relatedDecisions` in a part's context (PM-accepted 2026-10-29, REQ-112 Q1; **its own TASK and commit, after TASK-113**)

- **What:** both part-context routes, v1 `GET …/versions/{n}/parts/{key}/context` and v2 `GET …/spec/parts/{key}/context`, gain:
  ```json
  "relatedDecisions": [ { "via": "STEP-002", "decision": Part }, … ], "relatedDecisionsMore": false
  ```
- **Which decisions:** every `decision` part with a `covers` link to a step in the part's `flows[].at`, or to a work in its `flows[].work`, minus the ones already in `decisions`.
  - De-duplicated by decision key. When one decision covers several of those parts, `via` is the lowest key by `compareKeys`.
  - Sorted by decision key. Capped at 50, with `relatedDecisionsMore: true` past the cap.
  - Read from the same spec as the rest of the response: the snapshot (v1) or the live spec (v2).
- **Unchanged:** every existing field, including `decisions`. A part whose flows carry no other decisions gets `relatedDecisions: []` and `relatedDecisionsMore: false` (REQ-112 AC-4).
- **Why it fixes REQ-112 AC-1:** in TEST-106's spec, SCR-001's `flows[].at` = STEP-001…003. DEC-001…003 cover STEP-002, and DEC-004/006 cover WRK-001 (`tests/harness/test-106/step2-changeset.mjs:31-46`), so all five arrive.
- **CAW's side (Team B):** pass `relatedDecisions` to the worker. It's an additive field, and Team B confirms acceptance through the PM.
- **Consumers** (grepped 2026-10-29 15:0x):
  - `grep -rn "PartContext\b\|partContext(" src test` → `src/seam/context.ts:19` (the builder, changed) · `src/http/routes/seam.ts:15-31` (`PartContextSchema`: gains the two fields) and `:50` (the route, unchanged) · `test/seam/context.test.ts:26-73`.
  - Those tests assert field by field (e.g. `:34`) and never the whole object, so they keep passing unchanged, and the TASK must not edit them.
  - SPEC-106's v2 context route (TASK-113) builds the same body, so it gets the field the same way.
  - CAW's client was not grepped (G9).
- **Round 2 (2026-10-30 14:1x, Sober — REQ-112 AC-5, TEST-112 DEF-1) `[SA-decided]`: a work touches its own steps.** For a card anchored on a work, `flows` holds that work with `at = []` (`contextIn`: `climb` returns `works: [k]`, no steps), so no step's rules arrived (live, the SA card on WRK-001 asked for what DEC-001/DEC-003 say).
  - **E17:** `touched` = every `flows[].work` and `flows[].at` key, **plus every step of each work the climb named directly** (`named` in `contextIn`: the part itself when it is a work, or a work a decision/question/contradiction anchor points at). Everything else is unchanged: minus own `decisions`, one per decision, `via` = the lowest touched key, sorted, cap 50.
  - TEST-106's WRK-001 → `decisions` [DEC-004, DEC-006] (unchanged), `relatedDecisions` = the decisions covering STEP-001…003, i.e. DEC-001/002/003 via STEP-002 (+ any on STEP-001/003). SCR-001 is unchanged (its climb names no work).
  - Not widened further: rules on the interactions or screens under a work's steps are not pulled in. AC-5 names the steps, and a card on a whole work could otherwise get most of the spec. Named in Risks: if a live card on a work misses a rule held one level lower, that is a new REQ.
  - No contract change: same fields, same shapes, so `openapi.json` and the front's `schema.d.ts` do not move (TASK-141 stands).
  - **Re-grepped at release, 2026-10-30 13:1x on `2da175e`:** TASK-113 added `test/seam/spec-v2.test.ts:144`, which asserts the v2 context's **exact key list**, so it is added to TASK-117's list (that line only). The front's `schema.d.ts` mirrors `openapi.json`, so it needs a paired `gen:api` → TASK-141 (F-036).

## Data Model

```sql
ALTER TABLE change_sets ADD COLUMN rev integer;
UPDATE change_sets c SET rev = r.n FROM (
  SELECT id, row_number() OVER (PARTITION BY project_id ORDER BY at, id) AS n FROM change_sets) r WHERE r.id = c.id;
ALTER TABLE change_sets ALTER COLUMN rev SET NOT NULL;
CREATE UNIQUE INDEX change_sets_project_rev_idx ON change_sets (project_id, rev);
```
- Existing rows are numbered by time. On the remote TEST DB that is test data (REQ-105 Out of Scope), and the migration is not applied there by an engineer (SPEC-104 G5b).
- A unique `(project_id, rev)` makes a numbering race impossible to commit silently: the lock already serialises sets, and the index is the backstop.

**Consumers** (grepped 2026-10-29 14:4x on the current blueprint-back tree, ORDER 42):
- `rev` is written where change sets are made: `grep -rn "insert(changeSets)" src` → `src/spec/store.ts:111` (apply), `:358` (undo). Both are in TASK-113's file list. **Corrected 2026-10-30 (TASK-113 Q1, F-034):** over `src test` the same grep also finds 6 test inserts (`test/db/rules.test.ts:22,94`, `test/sit/rules.sit.test.ts:91,180,247`, `test/spec/store.test.ts:160`); each gets `rev: 1` (fresh project), and they are added to TASK-113's list.
- Whole-row reads of `change_sets`: `grep -rn "from(changeSets)" src` → `src/spec/store.ts:312` (`readChangeSet`, which maps fields explicitly at `:318-320`, so `rev` leaks into no response) · `:327` (undo, row used internally) · `src/quiz/store.ts:69` (count only) · `src/projects/service.ts:88` (id only). Untouched, because none of them exposes the new column.
- The push: `grep -rn "notifyConfirmed" src` → `src/projects/service.ts:7,125` — unchanged (V1). `notifySpecChanged` is new, and its callers are the two insert sites above.
- The name middleware: `grep -rn "SEAM_WRITES" src` → `src/http/actor.ts:13,26`. `:13` gains `spec/locate`, in TASK-113's list.
- v1 seam readers that v2 reuses: `grep -rn "partContext(\|scoreAll(\|locate(db" src` → `src/http/routes/seam.ts:50,67`. These keep calling the v1 functions unchanged. `context.ts`/`locate.ts` only gain an input form, in TASK-113's list with a byte-for-byte v1 rule.
- CAW's side (`caw-back → src/blueprint/client.ts`, per `PROTOCOL.md`) was not grepped (G9). It's Team B's to list against § Seam contract v2.

## Front (blueprint-front)

No change. The build link already works with no label (REQ-103). With a label it still adds `&version=<n>`, and CAW treats that as a tag from now on (Team B).

**Corrected 2026-10-30 (TEST-110 DEF-1, F-036):** "no change" was wrong for one file. The front's generated `src/core/api/schema.d.ts` is checked against blueprint-back's `openapi.json` by `bun run check:api`, so the 4 new routes require one `gen:api` (additive only, no code). → TASK-140.

## Guardrails

SPEC-104 G1–G7 and G5b. No gateway, no CLI. Build only after REQ-103 **and** REQ-110 are committed in blueprint-back (topic order).

## AC → work

| AC | Blueprint side (TASK-113) | Team B side |
|---|---|---|
| AC-1 edit seen in ≤ 30 s | `spec.changed` push + `…/spec/changes` + `…/spec` | poll ≤ 30 s + handle the push; mark dependent cards |
| AC-2 hop keeps its text | `revision` on every read | pin at hop start |
| AC-3 no-label start | `…/spec` works at any revision, label or not | `/start` without `version` |
| AC-4 label is a tag | `latestLabel` on every v2 read | show the tag, card history |
| AC-5 Blueprint down | — (CAW keeps its last read; `after=` catches up) | keep the last read, show the wording, catch up |
| AC-6 regression | v1 routes and push unchanged; all seam tests unchanged | its tests |

## Risks / questions

- **Q1 (SA A → PM → Team B, does not block the build)** — Does CAW's push receiver ignore an unknown `event`, or reject it? If it rejects, Blueprint would send `spec.changed` only to a second URL `CAW_SPEC_NOTIFY_URL` (size S). Default: same URL, and CAW ignores unknown events.
- A push that isn't awaited can be lost when the process stops right after a save. Accepted: the poll catches up (V3).
- The v1 routes are kept with no end date. Retiring them is a later REQ, once Team B confirms CAW no longer calls them.
