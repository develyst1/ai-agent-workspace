# SPEC-107: CAW reads the latest spec — label = tag, hop keeps its start text (Team B side of REQ-105)
- Source: REQ-105 (Team B side). Builds against Team A's `specs/SPEC-106-seam-latest-spec.md` § "Seam contract v2" — **not changed here**.
- Status: DONE (2026-10-30 16:3x, Silver — REQ-105 DELIVERED + COMMITTED, caw-back 67dfe55 · caw-front 7359fa3) · was ACTIVE (2026-10-29 14:3x, Silver — SA, Team B) — TASK-114/115/116 cut, **all ON HOLD** (see § Start gate).
- Repos read: `caw-back` and `caw-front` on `atom` @ 102a130 / 4b58bf3 **plus the uncommitted REQ-104 tree** (caw-back 24 paths,
  caw-front 18 paths), 2026-10-29 14:2x, Silver. Blueprint's side known only from SPEC-106 (G: no SA↔SA contact).
- Cites are `back: src/…` = caw-back, `front: src/…` = caw-front.

## Start gate (F-013 lesson, owner's "commit … เป็นเรื่องๆ", DECISIONS 12:41)

1. **REQ-104 committed** in caw-back **and** caw-front (owner's own "ขึ้น git"). These TASKs touch `schema.ts`, `_journal.json`,
   `openapi.json`, `hop.ts`-adjacent routes and `schema.d.ts`, which REQ-104 also changed. Starting earlier would mix two topics in one tree.
2. **The PM's go** (REQ-105 header: build after REQ-103 passes QA).
Engineers build against a **synthetic** v2 Blueprint (§ Tests). The real v2 routes come with Team A's TASK-113; the joint run is QA's (REQ-105 AC-1…AC-6).

## What exists today (`maps/caw-gap-102.md` b1–b6, re-read 14:2x)

- Every spec read names a confirmed version: `back: src/blueprint/client.ts:66-70`; a card reads its part **at its anchor version**
  (`back: src/cards/service.ts:96`); the part reader defaults to `latestSeenVersion` (`back: src/projects/service.ts:101-105`).
- The follower pulls `versions?after=` every `CAW_POLL_MS` (default 30 s, `back: src/index.ts:23-24`) and flags cards with
  `card.spec_changed` (`back: src/follow/pull.ts:40-63`). A flagged card is **not workable** until the operator clears it
  (`back: src/cards/view.ts:25`, `back: src/cards/service.ts:219-225`).
- `/start` needs `version` (`front: src/app/start/page.tsx:28`); caw-back refuses an unconfirmed one (`back: src/projects/service.ts:23-25`).
- The push receiver takes only `event: "version.confirmed"` (`back: src/http/routes/follow.ts:11`). **Run 2026-10-29 14:2x** (API on
  `pglite:memory`, :4531): `spec.changed` body → **400** `validation` ("expected \"version.confirmed\""); `version.confirmed` → 202.
- A worker reads its card through MCP `card_context`, which sends `X-CAW-Hop` (`back: src/mcp/server.ts:30,73-77`); the route
  does not use the hop today (`back: src/http/routes/cards.ts:67-70`).

## Design `[SA-decided]` unless marked (each cheap to reverse)

- **D1 — Reads go to v2.** The client gains `spec(bp)`, `specContext(bp, key)`, `specLocate(bp, request)`, `specChanges(bp, after)`
  (SPEC-106 routes 1–4). `getProject` stays (the name; `/spec` has none). `getVersion`, `partContext`, `versionsAfter` stay in the client
  but **no service calls them** after TASK-114/115 (v1 retirement is a later REQ, SPEC-106 Risks). `locate` / `amend` callers: `locate`
  moves to `specLocate` (v1 refuses a project with no label — AC-3); `amend` is unchanged.
- **D2 — Label numbers stay where version numbers were.** SPEC-106 `latestLabel.version` is an integer, so the existing integer fields
  keep their names and now mean **the label number at that moment, `0` = no label**: `project.version` (label at start),
  `project.latestSeenVersion` (latest label seen), `card.anchor.version` (label when cut), `proposal.version`. Old events always hold ≥ 1,
  so replay is untouched. New text fields carry the label words: `project.latestLabel`, `card.anchorLabel`.
- **D3 — CAW now keeps spec text — deliberately.** SPEC-A-008's "CAW keeps no spec text" (`back: src/seam/service.ts:1-3`) cannot hold:
  Blueprint serves no old revision (SPEC-106 V5), so AC-2 (hop keeps its start text) and AC-5 (work on the last read when Blueprint is
  down) need a copy. Two **operational** tables, not replayed (like `follow_state`, `hop_output`): `spec_parts` = the last body read per
  (project, key); `hop_spec` = the body a card hop was given at its start.
- **D4 — One cache-aware read.** `readLatestPart(db, blueprint, project, key)`: `specContext` 200 → upsert `spec_parts`, return
  `{ body, revision, readAt, fromCache: false }` · 404 → `null` · `BlueprintUnreachable` → the `spec_parts` row as `fromCache: true`,
  else rethrow (→ 502 as today). Used by: card context, the part reader, card creation, proposal anchor checks, the hop pin.
- **D5 — Pin at hop start.** `POST /v1/projects/{id}/hops` for a **card** hop: after `startHop` commits, the route calls
  `readLatestPart` for the card's anchor and inserts `hop_spec`. A failed pin (Blueprint down, nothing cached) does not fail the hop:
  one codes-only log line, and `card_context` falls back to D4. `GET /v1/cards/{cardId}/context` with `X-CAW-Hop` = a hop on **that**
  card that has a pin → the pinned body (AC-2), even after the hop ended. Any other caller (operator, a worker reading another card)
  → D4 (latest). Chat hops are not pinned (they `locate` on demand; REQ-105 req. 3 is about card hops — `Interpreted`).
- **D6 — Follow by revision.** The follower pulls `specChanges(bp, after = follow_state.last_pulled_revision)`, again while `more`,
  then: cards whose `anchorKey` is in a change's `changed ∪ removed` **and** `anchorRevision < change.rev` are flagged. **One event
  per pull** that flagged a card or saw a new label: `spec.revised { revision, latestLabel, cardIds }`. A pull with neither writes
  no event (an interview round must not flood the event log); it only moves `follow_state`. `card.spec_changed` stays in the reducer for replay.
- **D7 — The flag only shows; it no longer stops the card** (REQ-105 Q2, PM's answer 2026-10-29 `[PM-decided]`, not the SA's
  default). `specChangedVersion` non-null = "spec เปลี่ยน" on the board and the card, and nothing else: `isWorkable` drops the
  `specChangedVersion === null` term (`back: src/cards/view.ts:25`), so the next hop goes on with the latest text. The 409
  `not_workable` message stops naming "its spec changed" (`back: src/hops/service.ts:47`). The operator's "clear" stays, to dismiss
  the mark (`back: src/cards/service.ts:219-225`). From REQ-105 on the field holds the **revision** that flagged it; the API name is
  kept to avoid a shape change. A running hop is never stopped by it.
  `Interpreted` REQ-105 Q2 for the home "stuck" count (`back: src/projects/service.ts:121`; mock `front: src/api/mock.ts:383`): a card
  that does not stop is not stuck, so the `specChangedVersion is not null` term leaves the count `[SA-decided]`, one line, cheap to
  reverse. The mock's `workable` (`front: src/api/mock.ts:380`) follows `view.ts`. The badge keeps its look (`front: Board.tsx:79`,
  `CardView.tsx:48`) — untouched.
- **D8 — Push.** `/v1/notify` accepts `version.confirmed` exactly as today (same 400s on a bad body — AC-6), `spec.changed`
  `{ projectId: string ≥1, revision: int ≥0, at: string }` → 202 and `pullFor(projectId)`, and **any other `event` string → 202 `{}`,
  nothing done**. A body without a string `event` or `projectId` → 400. This is REQ-105 Q1's answer: same URL, no contract change.
- **D9 — Poll default 10 s** (`CAW_POLL_MS` unset/empty → 10 000). AC-1 is ≤ 30 s **without** the push; 30 s + a pull is over it.
  An explicit `CAW_POLL_MS` (the owner's `.env` has the key) still wins — **its value is the owner's**; the SA did not read it.
- **D10 — Reachability is shown.** `follow_state.last_pull_ok` = the last pull's result. The project view gains `spec`
  (below). The front shows the REQ-105 sentence when `spec.reachable` is false, and on a card whose context came `fromCache`.
- **D11 — Start without a label.** `POST /v1/projects` body `{ blueprintProjectId, version? }`: `version` is accepted and **ignored**
  (old links); the start label is `latestLabel` from `spec(bp)`, and `follow_state.last_pulled_revision` = its `revision` (no flood of
  old changes onto a new project). 409 `version_not_confirmed` is gone. 404 `blueprint_project_not_found` and 409 `already_exists` stay.
- **D12 — A card whose anchor part was removed** (REQ-105 Q4, PM accepted 2026-10-29 18:2x; added after TASK-114).
  - **Record it (TASK-115):** when the follower pulls a change set whose `removed` holds a card's anchor key, it writes
    `card.anchor_removed { cardIds, revision }`. When a later set has that key in `added`, it writes `card.anchor_restored { cardIds, revision }`.
    Reducer: `CardState.anchorRemovedRevision: number | null`. Plain events, so a rebuild replays them.
  - **Show it (TASK-115):** `Card` gains `"anchorRemoved": boolean` (camelCase). `isWorkable` is false while it is true, so no hop starts on it.
  - **Answer it (TASK-115):** `GET /v1/cards/{id}/context` for a removed anchor → **404 `anchor_removed`** (no longer 502), message
    `part <key> was removed from the spec`. A worker's own pinned hop still gets its pinned text (D5 wins).
  - **Front (TASK-116):** the board loads every card's context (`front: src/app/p/[id]/page.tsx:22`), so one `anchor_removed` must not
    fail the board. That card renders without context. The card page (`front: src/app/p/[id]/c/[cardId]/page.tsx:14`) shows the PM's
    sentence **`ส่วนนี้ถูกลบออกจาก spec แล้ว — งานนี้ทำต่อไม่ได้จนกว่าจะย้ายไปส่วนอื่นหรือปิดงาน`** in place of the context, and the board
    card shows it as a mark, like "spec เปลี่ยน".
  - Consumers: `grep -rn "cardContext(" src` (front) → `src/app/p/[id]/page.tsx:22`, `src/app/p/[id]/c/[cardId]/page.tsx:14`, plus the
    `CawApi` implementations (`src/api/http.ts`, `src/api/mock.ts`). Back: `Card`/`CardSchema` as in TASK-119 (`cards/view.ts`,
    `http/routes/cards.ts`, `test/http/cards.test.ts:36` key list).
- **D13 — A label with no name** (REQ-105 Q6, PM's yes 2026-10-30; found in the SA's real-seam smoke `tests/harness/seam-smoke-105.mjs`).
  Blueprint's real `latestLabel.label` is `string | null` (null = a version from before named labels, `blueprint-back → src/seam/spec.ts:16`).
  CAW passes it through as null (Project `latestLabel: { version, label: string | null } | null`, TASK-138); the front shows such a label by its
  number — **`ป้าย {version}`** — in the header and the projects chip (TASK-139), as the card already does (`front: CardView.tsx:30`).
  Consumers: `grep -rn 'LatestLabel\|latestLabel' caw-back/src` → `blueprint/client.ts:16`, `db/schema.ts:43`, `core/events.ts:61,84`,
  `core/reduce.ts:11`, `http/routes/projects.ts:28` (types — TASK-138); `follow/pull.ts:51-84`, `projects/service.ts:38-50`, `core/state.ts:16`
  copy the pair (follow `tsc`); `blueprint/latest.ts:21-23` already null-safe (untouched). Front: `grep -rn 'labelWords.tag' src` →
  `app/page.tsx:63`, `app/p/[id]/layout.tsx:28` (TASK-139); `CardView.tsx:30` already falls back (untouched).

## API — caw-back (field casing is the contract between TASK-114/115 and TASK-116)

- **Project** (`GET /v1/projects`, `GET /v1/projects/{id}`, every route returning a project): adds
  `latestLabel: { version: number; label: string } | null` and
  `spec: { revision: number; reachable: boolean; lastPullAt: string | null }`. `version` / `latestSeenVersion` = label numbers (D2).
- **Card**: adds `anchorLabel: string | null`. `anchor: { key, version }` unchanged in shape (`version` = label number, 0 = none).
- **CardContext** (`GET /v1/cards/{cardId}/context`): adds `specRead: { revision: number; readAt: string; fromCache: boolean; pinned: boolean }`.
  `spec` = Blueprint's v2 context body as returned (`revision`, `savedAt`, `latestLabel` instead of `version`, `confirmedAt` — SPEC-106 route 2).
- **POST /v1/projects/{id}/cards**: `anchor: { key: string; version?: number }` — `version` ignored; CAW sets it (D2). 422
  `version_not_confirmed` is gone; a key not in the current spec → 422 `anchor_not_in_version` (code kept: the front has words for it).
- **Proposals**: item `anchor.version` optional and ignored; `proposal.version` = label number at proposal time. MCP `propose_cards`
  schema: `version` optional, description "a part `locate` found" (`back: src/mcp/server.ts:112`).
- **GET /v1/projects/{id}/parts/{key}**: `version` query still accepted, **ignored**; always the latest (D4). 404 `part_not_found` when not live.
- **POST /v1/notify**: D8.

Consumers (grepped 2026-10-29 14:3x, both repos, `src` + `test(s)`; every hit is in a TASK's file list or named untouched):
- Project `version` / `latestSeenVersion` / new `latestLabel`, `spec`: `grep -rn 'latestSeenVersion\|p\.version\|project\.version' caw-front/src`
  → `front: src/app/page.tsx:63` (chip — TASK-116), `src/api/caw.ts:24,223`, `src/api/mock.ts:197,209,262,385,454` (TASK-116);
  back: `src/core/reduce.ts`, `src/core/state.ts`, `src/projects/service.ts`, `src/http/routes/projects.ts:24` (TASK-114/115).
- `specChangedVersion` (meaning only, D7): `grep -rln specChangedVersion` → back `src/cards/{service,view}.ts`, `src/core/{reduce,state}.ts`,
  `src/db/schema.ts`, `src/http/routes/cards.ts`, `src/projects/service.ts`, `test/follow/pull.test.ts`, `test/http/{cards,projects,rebuild-sequence}.test.ts`;
  front `src/api/{caw,mock,schema.d}.ts`, `src/components/Board.tsx`, `src/components/card/CardView.tsx`, tests `src/api/mock{,-writes}.test.ts`,
  `src/components/runs/RunsList.test.tsx`, `src/lib/crew.test.ts`. Front readers test only `!== null` → **untouched** except via the
  mock; back writers: TASK-115 (`spec.revised`).
- `anchor.version` / `anchorVersion`: `grep -rln 'anchor\.version\|anchorVersion'` → back `src/cards/{service,view}.ts`, `src/core/{events,reduce,state}.ts`,
  `src/db/schema.ts`, `src/follow/pull.ts`, `src/projects/service.ts`, `src/proposals/service.ts`, `test/follow/pull.test.ts`, `test/http/projects.test.ts`
  (TASK-114; `pull.ts` + its test TASK-115); front `src/api/{caw,mock}.ts`, `src/api/mock-chat.test.ts`, `src/app/p/[id]/chat/page.tsx` (TASK-116).
- `CardContext` / `PartContext`: `grep -rln 'CardContext\|cardContext\|PartContext'` → back `src/cards/service.ts`, `src/http/routes/cards.ts`,
  `test/http/{code-map,openapi-nullable}.test.ts`, `test/mcp/server.test.ts` (TASK-114); front `src/api/{caw,http,mock,schema.d}.ts`,
  `src/api/{http,mock,mock-writes}.test.ts`, `src/app/p/[id]/c/[cardId]/page.tsx`, `src/app/p/[id]/page.tsx`, `src/blueprint.ts`,
  `src/components/card/CardView.tsx` (TASK-116; `page.tsx` files and `blueprint.ts` untouched unless the type change breaks them).
- `/v1/notify` body: `grep -rln 'version.confirmed\|/v1/notify' caw-back` → `src/follow/pull.ts`, `src/http/routes/follow.ts`,
  `test/follow/pull.test.ts`, `test/http/runner-actor.test.ts` (TASK-115). Blueprint's sender is Team A's (SPEC-106 route 5).

## Data Model (migration `0011`, generated by drizzle-kit as before; this is the SQL it must equal)

```sql
ALTER TABLE caw.projects ADD COLUMN latest_label jsonb;
ALTER TABLE caw.cards ADD COLUMN anchor_label text;
ALTER TABLE caw.cards ADD COLUMN anchor_revision integer NOT NULL DEFAULT 0;
ALTER TABLE caw.follow_state ADD COLUMN last_pulled_revision integer NOT NULL DEFAULT 0;
ALTER TABLE caw.follow_state ADD COLUMN last_pull_ok boolean NOT NULL DEFAULT true;
CREATE TABLE caw.spec_parts (project_id uuid NOT NULL REFERENCES caw.projects(id), key text NOT NULL,
  revision integer NOT NULL, body jsonb NOT NULL, read_at timestamptz NOT NULL, PRIMARY KEY (project_id, key));
CREATE TABLE caw.hop_spec (hop_id uuid PRIMARY KEY REFERENCES caw.hops(id), revision integer NOT NULL,
  body jsonb NOT NULL, read_at timestamptz NOT NULL, from_cache boolean NOT NULL);
```
- `latest_label`, `anchor_label`, `anchor_revision` are **replayed** state (from `project.created`, `card.created`, `spec.revised`);
  `POST …/rebuild-check` must still answer clean. `spec_parts`, `hop_spec`, the two `follow_state` columns are operational.
- Existing rows: label null, `anchor_revision` 0 → the first v2 pull flags their cards on any change. Test data only (REQ-105 Out of Scope).
- Consumers: `grep -rln 'followState\|follow_state\|latest_label\|anchor_label' caw-back/src` → `src/follow/pull.ts`, `src/db/schema.ts`
  (TASK-114 schema, TASK-115 pull); `spec_parts` / `hop_spec`: none (`grep -c 'spec_parts\|hop_spec' src/db/schema.ts` → `0`).
- **Who runs it:** tests on PGlite only. The remote TEST DB is migrated by the owner's word, never by an engineer (SPEC-103 G2).

**Migration `0012` (D12, TASK-115 Q2, added 2026-10-29 18:4x — a new file; `0011` is not edited):**
```sql
ALTER TABLE caw.cards ADD COLUMN anchor_removed_revision integer;
```
- Nullable, no default; existing rows → NULL = anchor not removed. **Replayed** state (from `card.anchor_removed` / `card.anchor_restored`),
  so `rebuild-check` must stay `same: true`. Same runner rule as `0011`.
- Consumers: `grep -rn 'anchorRevision:' caw-back/src` → `src/core/reduce.ts:134,163` (card built), `src/core/state.ts:25` (row → state);
  each also sets/reads `anchorRemovedRevision` (TASK-115). Project shape consumers missed at 14:3x: `grep -rn 'ProjectSchema' src test` →
  `src/http/routes/chat.ts:8,39` (chat context returns a project — TASK-115 Q1).

## Events

- `project.created` data gains optional `latestLabel` and `revision` (absent in old events → null / 0); `version` may be 0.
- `card.created` data `anchor` gains optional `label` (string | null) and `revision` (int); absent → null / 0.
- New `spec.revised { revision: number; latestLabel: { version, label } | null; cardIds: string[] }` → cards in `cardIds`:
  `specChangedVersion = revision`; project: `latestLabel`, `latestSeenVersion = latestLabel?.version ?? 0`.

## Front — caw-front (TASK-116; wording from REQ-105, PM's)

| Where | File | Shows |
|---|---|---|
| `/start` | `front: src/app/start/page.tsx:23-36` | works with `project` alone; `version` sent if present (ignored by the back). Incomplete = no `project` |
| project header | `front: src/app/p/[id]/layout.tsx` | `ป้าย {label}` / `ยังไม่มีป้าย` |
| projects list chip | `front: src/app/page.tsx:63` | same words, replacing `spec เวอร์ชัน {n}` |
| card | `front: src/components/card/CardView.tsx` | `ตัดงานที่ป้าย {label}` / `ตัดงานก่อนมีป้าย` (label = `anchorLabel`, else `anchor.version` when > 0) |
| Blueprint unreachable | project layout + CardView | `ติดต่อ Blueprint ไม่ได้ตอนนี้ — ทำงานต่อจาก spec ล่าสุดที่อ่านได้` when `project.spec.reachable === false` or `specRead.fromCache` |
| chat part reads | `front: src/app/p/[id]/chat/page.tsx:22,24` | `api.part(id, key)` without a version |

`PartContext` (`front: src/api/caw.ts:89-98`): `version`, `confirmedAt` → `revision: number`, `savedAt: string | null`,
`latestLabel: … | null` (no screen reads the old two — grep 14:2x). Mock (`front: src/api/mock.ts`) follows every shape.

## AC → work

| AC | Work |
|---|---|
| AC-1 edit seen ≤ 30 s | TASK-115 (pull by revision, push, 10 s poll) · TASK-114 (part reader latest) · TASK-116 (flag already shown) |
| AC-2 hop keeps its text | TASK-114 (pin at hop start, D5) |
| AC-3 no-label start | TASK-114 (D11) · TASK-116 (`/start`) |
| AC-4 label is a tag | TASK-115 (`spec.revised` label) · TASK-114 (card label) · TASK-116 (header, chip, card line) |
| AC-5 Blueprint down | TASK-114 (D4 cache) · TASK-115 (`last_pull_ok`, catch-up from `after=`) · TASK-116 (sentence) |
| AC-6 regression | all three: `version.confirmed` push unchanged; existing tests pass, changed ones listed |

## Tests

- Engineers test against a **synthetic v2 Blueprint**: `back: test/helpers/fake-blueprint.ts` gains the four v2 routes, built from the
  **recorded** v1 fixtures' parts and SPEC-106's shapes, each answer marked `// synthetic — SPEC-106 v2, until recorded` (the file's
  header says nothing in it is invented; that line keeps it honest). Re-recording from a real blueprint-back with TASK-113 is QA's
  joint run, not an engineer step.

## Guardrails (same as SPEC-103)

G1 no live Claude CLI, no runner against a real `claude` (no CLI is needed for any DoD) · G2 every caw-back command with
`--no-env-file` or `env -u DATABASE_URL -u CAW_WORKSPACE_ROOT -u CLAUDE_BIN`; never print `DATABASE_URL` · G3 no git · G4 caw-front:
only `NEXT_DIST_DIR` names listed in `tsconfig.json` · G5 stop every server you start by its pid (`ss -ltnp`; `lsof` is not installed).

## Risks

- **Contract drift**: built against synthetic answers. Settled by QA's joint run once TASK-113 is DONE.
- **A worker builds on text that changed mid-way** (D7, PM's answer to Q2): nothing makes a person look before the next hop. The
  mark on the card is the only signal. Accepted by the PM.
- **`spec_parts` holds spec text in CAW's database** (D3). Nothing secret is expected in a spec; noted, not designed around.
- Old e2e dev scripts (`back: src/runner/e2e/{auto,down-up,run}.ts`) are still broken by REQ-104's confinement — not this SPEC's (flagged to the PM 14:17).

## Tasks

- TASK-114: caw-back — read the latest spec: client v2, cache, pin, start/cards/proposals/locate/part reader — owner: BE (depends on: start gate)
- TASK-115: caw-back — follow by revision, push `spec.changed`/unknown, project `spec` + label, poll 10 s — owner: BE (depends on: TASK-114)
- TASK-116: caw-front — no-label start, label tag, card line, unreachable sentence, types + mock — owner: FE (depends on: TASK-114 + TASK-115 `openapi.json`)

## Questions

- REQ-105 Q1, Q2, Q3 — in the REQ's `## Questions`.
