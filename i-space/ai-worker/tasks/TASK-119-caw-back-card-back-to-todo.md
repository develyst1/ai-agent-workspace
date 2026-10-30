# TASK-119: caw-back — a finished hop sends its `doing` card back to `todo`; `stoppedMidway` on Card
- Source: SPEC-108 (REQ-111) — D6, D7, § API "Card" and "Hop finish → card"
- Owner: BE (Bob)
- Status: DONE (2026-10-29 15:4x, Silver — § Review) · was REVIEW (Bob) — released 2026-10-29 15:3x (SA): REQ-104 committed; REQ-111 is first (PM, REQ-111 Q1).
- Depends on: REQ-104 committed (f8a619e) in caw-back ✓ · independent of TASK-118 (no shared file); do them in either order, one at a time

## What to do

Closed file list (caw-back): `src/hops/service.ts` · `src/cards/view.ts` · `src/http/routes/cards.ts` · `openapi.json` (re-emitted, never hand-edited) ·
`test/http/hop-card-doing.test.ts` · `test/http/cards.test.ts` · one new test file `test/http/card-stopped-midway.test.ts` ·
`test/http/rebuild-sequence.test.ts` **only if** its expected statuses (`:99`) change because of step 1 — then say which and why ·
`test/http/runner-actor.test.ts` (`:31` event list) and `test/http/hop-output.test.ts` (`:139` count) — added 2026-10-29 15:3x, Q1. No git.

1. **`patchHop`** (`src/hops/service.ts:74-82`): in the `writeDecided` decision, when the patch is a finish (`outcome` in it), the hop
   has a `cardId`, and that card's status in `s` is `doing` → return **two** events: the `hop.finished` as today, then
   `{ type: "card.status_set", projectId, actor, at: <same at>, data: { cardId, status: "todo" } }`. Any outcome (REQ-111 Q3: the PM
   accepted the default). A chat hop, or a card not in `doing`, → only
   `hop.finished`, as today. Make sure `patchHop` still returns the hop (it reads it back from `state`).
2. **`cardView`** (`src/cards/view.ts:25-29`) adds `stoppedMidway`: the card's hops in `s.hops` with `cardId === c.id` and `endedAt !== null`,
   take the one with the latest `startedAt`; if `c.status === "todo"`, no hop on the card is running, and that hop's `outcome` is
   `failed`, `stopped` or `interrupted` → `{ hopId, at: hop.endedAt, reason: hop.note.split(" · ")[0] }`, else `null`. Add the field
   to the `Card` type (`:6-11`).
3. **`CardSchema`** (`src/http/routes/cards.ts:16`): `stoppedMidway: z.object({ hopId: z.string(), at: z.string(), reason: z.string() }).nullable()`.
   Then `bun run openapi:emit` (writes `openapi.json`).
4. **Tests.** `hop-card-doing.test.ts:18` pins the old rule ("the hop ending leaves it in doing") → rewrite it to the new rule (card →
   `todo`), keep `:64` (rebuild-check `same: true`) and make it cover a card moved back by a finished hop. `cards.test.ts:36` key list
   gains `stoppedMidway`. New file: finish `stopped` → card `todo`, `stoppedMidway.reason` = the note's first segment; finish `commented`
   → `todo`, `stoppedMidway: null`; a later hop starts → card `doing`, `stoppedMidway: null`; a card the worker set to `review`
   during the hop → stays `review`; a chat hop → no card event; the runner's `interrupted` finish (`PATCH /v1/hops/{id}` with
   `outcome: "interrupted"`) → `todo` + `stoppedMidway`.

## Definition of Done

- [ ] 1. Before. `cd caw-back && git status --short | wc -l` → `0` (base: `0`, SA re-run 2026-10-29 15:3x after commit f8a619e)
- [ ] 2. `bun --no-env-file test test/http/hop-card-doing.test.ts test/http/hops-runs.test.ts test/http/cards.test.ts test/http/card-stopped-midway.test.ts` → 0 fail (base: first three files `29 pass · 0 fail`, `Ran 29 tests across 3 files`; the 4th is new)
- [ ] 3. `grep -c '"stoppedMidway"' openapi.json` → ≥ `1` (base: `0`, run 2026-10-29 15:0x)
- [ ] 4. `bunx tsc --noEmit -p .` → exit 0, no output (base: exit 0, no output)
- [ ] 5. `bun --no-env-file test` (whole suite) → the known machine fail only (base: `749 pass · 1 skip · 1 fail`, `Ran 751 tests across 63 files. [104.01s]`, SA 2026-10-29 15:1x)
- [ ] 6. A stub run of the TEST-106 shape is **not** needed here — QA checks AC-3 (crash + cap) from the REQ.

## Implementation Notes

Bob, 2026-10-29 15:13–15:30 (box clock). Repo `caw-back` @ `f8a619e`, no git write. All of steps 1–4 are done; the whole suite shows **two more tests that pin the old rule, outside my file list** (Q1) — I did not touch them.

**DoD 1 — base:** `git status --short | wc -l` → `0` · `git log -1 --oneline` → `f8a619e feat: live read-only CLI view per worker, no Bash sandbox, folder confinement (REQ-104, TASK-105, TASK-112)`. Before editing, `bun --no-env-file test test/http/hop-card-doing.test.ts test/http/hops-runs.test.ts test/http/cards.test.ts` with the code change only → `27 pass · 2 fail` = exactly the two the TASK predicted (`cards.test.ts` POST key list; `hop-card-doing.test.ts:18` "the hop ending leaves it in doing").

**Step 1 — `patchHop`** (`src/hops/service.ts:74-86`): the finish decision now builds `finished` once with one `at`; `card = hop.cardId === null ? undefined : s.cards.find(…)`; `card?.status === "doing"` → returns `[finished, { type: "card.status_set", projectId, actor, at, data: { cardId, status: "todo" } }]` (same actor, same `at`), else just `finished`. A chat hop has no `cardId` → one event as before; a card the worker moved (review/done/stuck) or already `todo` → one event. Any outcome. It still returns `hopIn(state)`. Import: `CawEvent`.
**Step 2 — `cardView`** (`src/cards/view.ts`): `stoppedMidway(s, c)`, a private function: null unless `c.status === "todo"`; null if any hop on the card has `endedAt === null`; else the hop with the latest `startedAt` (ties by id) — null unless its outcome is `failed`/`stopped`/`interrupted` — else `{ hopId, at: hop.endedAt, reason: hop.note.split(" · ")[0] }`. `Card` type gains `stoppedMidway`.
**Step 3 — `CardSchema`** (`src/http/routes/cards.ts:16`): `stoppedMidway: z.object({ hopId, at, reason }).nullable()` with a description. `bun run openapi:emit` → `wrote …/openapi.json`; `git diff --stat openapi.json` → `1 file changed, 24 insertions(+)`, 0 deletions.
**Step 4 — tests (which changed and why)**
- `test/http/hop-card-doing.test.ts:18` — was "…the hop ending leaves it in doing" (`toBe("doing")` after PATCH); now the card is `todo` after the finish, the PATCH still answers `200` with the hop, `updatedAt` did not go back. Reason: D6.
- `test/http/hop-card-doing.test.ts:64` — rebuild-check test now finishes the hop `stopped` (the card moves back), counts exactly 1 `card.status_set` event, and checks `same: true` after. Reason: DoD asks it to cover a card moved back by a finished hop.
- `test/http/cards.test.ts:36` — the POST key list gains `stoppedMidway`, and `r.json.stoppedMidway` is `null`. Reason: D7 adds the field.
- `test/http/card-stopped-midway.test.ts` (new, 10 tests): `stopped` → `todo` + `{hopId, at = endedAt, reason = first segment}` (also in the list endpoint); `failed` with no ` · ` → whole note, empty note → `""`, the latest hop decides; `commented` → `todo`, null; `interrupted` → `todo` + stoppedMidway; a later hop → `doing`/null, then `commented` → null, then `stopped` → about the new hop; review/done/stuck set during the hop → stays, null; a chat hop → no card event, card untouched; exactly one extra event by the finishing actor (`runner:r9`), none when the worker moved it, rebuild-check `same: true`; a second finish → 409 `already_finished` and no second move; `stoppedMidway` in `card_context`'s card.
- `test/http/rebuild-sequence.test.ts:99` — **not changed**: it passed unchanged (the TASK said "only if its expected statuses change"; they did not).

**DoD 2:** `bun --no-env-file test test/http/hop-card-doing.test.ts test/http/hops-runs.test.ts test/http/cards.test.ts test/http/card-stopped-midway.test.ts` → `39 pass · 0 fail · Ran 39 tests across 4 files [6.12s]` (29 + 10 new).
**DoD 3:** `grep -c '"stoppedMidway"' openapi.json` → `2` (the property and `required`). **DoD 4:** `bunx tsc --noEmit -p tsconfig.json` → no output.
**DoD 5 — whole suite** (15:24:22): `bun --no-env-file test` → `757 pass · 1 skip · 3 fail · Ran 761 tests across 64 files [176.22s]` (base `749 pass · 1 skip · 1 fail`, 751 tests; this TASK adds 10 tests: 751 + 10 = 761 ✓; 749 + 10 − 2 more failing = 757 pass). The 3 fails:
  1. the known machine fail `settings.test.ts` (bun's execPath has `@`);
  2. `test/http/runner-actor.test.ts:31` "a runner opens and finishes a run, starts + claims + finishes a hop … every event carries the actor as given" — it pins the runner's event list `["run.started","hop.started","hop.claimed","hop.finished","run.finished"]`; the hop's card is `doing`, so the runner's finish now also writes `card.status_set` by the same runner actor → the list has `"card.status_set"` after `"hop.finished"`. Correct per D6; the expectation needs that one string.
  3. `test/http/hop-output.test.ts:139` (my own TASK-105 file) "output is not an event: …" expects `events.length` = `before + 1` ("only hop.finished"); now `before + 2` (hop.finished + the card's `card.status_set`). The test's point (no *output* event) is unchanged.
**DoD 6** n/a per the TASK.

**Round 2 — after Silver's yes on Q1 (15:3x):** the two tests changed exactly as proposed — `test/http/runner-actor.test.ts:31` expected list gains `"card.status_set"` between `"hop.finished"` and `"run.finished"` (comment names D6); `test/http/hop-output.test.ts:139` `before + 1` → `before + 2` (hop.finished + the card's `card.status_set`; the "no output event" and `rebuild-check` asserts kept).
**DoD 5 again** (15:30:10): `bun --no-env-file test` → `758 pass · 1 skip · 2 fail · Ran 761 tests across 64 files [187.12s]`. The 2 fails: (1) the known machine fail in `settings.test.ts` (bun's execPath has `@`); (2) `db-scripts` "Case C" at 5.9 s — the documented load flake (SPEC-103 G6): `bun --no-env-file test test/scripts/db-scripts.test.ts` alone → `11 pass · 0 fail` (load average 0.8 then; it was ~4 during the full run). `bunx tsc --noEmit -p tsconfig.json` → no output.
**After:** `git status --short` → `M openapi.json · M src/cards/view.ts · M src/hops/service.ts · M src/http/routes/cards.ts · M test/http/cards.test.ts · M test/http/hop-card-doing.test.ts · M test/http/hop-output.test.ts · M test/http/runner-actor.test.ts · ?? test/http/card-stopped-midway.test.ts` (9 paths, all in the list). Nothing started, no port used, no `claude`.
**Existing cards already stuck in `doing`** (old local DBs) are left as they are, per the SPEC. **UNVERIFIED:** the runner's own end-to-end behaviour on a real stopped hop (the card going back and the next tick picking it up) — API-level only; QA's AC-3 (crash + cap) settles it.

## Questions

**Q1 (Bob → Silver — blocks DoD 5 only).** Two existing tests pin the old rule and are outside this TASK's closed list: `test/http/runner-actor.test.ts:31` (add `"card.status_set"` after `"hop.finished"` in the expected list — the runner actor now also writes it) and `test/http/hop-output.test.ts:139` (`before + 1` → `before + 2`, comment "hop.finished + card.status_set"). Both are one-line, both are the direct effect of D6, and neither weakens what the test is for. May I change them? (Also run `report.test.ts`-style check: no other file failed.)
  Checked: TASK-119 closed file list (names `rebuild-sequence.test.ts` only "if its statuses change"; not these two).
  > answer (Silver, 2026-10-29 15:3x): **yes, change both, exactly as you wrote.** Read both (`runner-actor.test.ts:25-36`, `hop-output.test.ts:132-141`): each counts the events a hop finish writes, and D6 adds one on purpose. Keep their other asserts — `rebuild-check` `same: true` in both, and "no output event" in hop-output. Both files are now in the closed list. My miss: SPEC-108's consumer grep looked for the old "leaves it in doing" rule, not for tests that count a finish's events (F-entry filed). Note for the runner-actor test: its title says the runner may not write card status through the API. That stays true. This `card.status_set` is the core's own consequence of `hop.finished`, not a runner route. If you can, say that in the test's comment (one line).

## Review

**Verdict: DONE** — Silver (SA, Team B), 2026-10-29 15:4x.
- **Against SPEC-108:** D6 — `patchHop` returns `[hop.finished, card.status_set{todo}]` with one `at` and the same actor, only for a card hop whose card is `doing`; a chat hop / a moved card → one event (`src/hops/service.ts` diff). D7 — `stoppedMidway` computed in `cardView`: `todo`, no running hop on the card, latest ended hop by `startedAt` (ties by id), outcome failed/stopped/interrupted, reason = note up to the first ` · ` (`src/cards/view.ts` diff). Schema camelCase exactly as the SPEC; `openapi.json` re-emitted (`grep -c` → 2: property + required). Matches.
- **Evidence reviewed, decisive part re-run by me:** `bun --no-env-file test` on hop-card-doing, hops-runs, cards, card-stopped-midway, runner-actor, hop-output, rebuild-sequence → `58 pass · 0 fail · Ran 58 tests across 7 files`; `bunx tsc --noEmit -p .` → exit 0. Bob's whole suite 758/1/2: the known execPath fail + db-scripts Case C load flake (passes alone, 11/0, documented) — accepted on his pasted output, not re-run (his TASK-118 work is in the same tree now).
- **Q1 tests:** both changed exactly as agreed, the comment names D6; their other asserts kept.
- **Not proven here (correct to leave):** the runner end to end on a real stopped hop — QA's AC-3.
- **Next:** TASK-120 (Fanta) is released. Git: nothing; REQ-111 is committed per topic on the owner's word.
