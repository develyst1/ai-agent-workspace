# TASK-123: blueprint-back — store the valid changes of a round, drop only the refused ones, record each refusal
- Source: SPEC-105 § "Round 2" (E5, E5b, E5c, E6) — REQ-110 amended req 4–5, AC-6, AC-7 (after TEST-107 DEF-1)
- Owner: BE (Jason)
- Status: DONE (2026-10-29, Sober — see § Review)
- Depends on: TASK-109 DONE (same topic REQ-110, same uncommitted tree on top of `a4bf924` — no commit in between)
- Repo: `blueprint-back` (path: `machine.local.md`), branch `atom`. **No git write.**

🔴 Prefix every `bun` command with `DATABASE_URL=pglite:memory` (and `PORT=` when it serves). Never print `.env`. **No live gateway call**: stub only. The owner's live calls are QA's.

## Files (closed list — anything else → `## Questions` first)

- `src/interview/round.ts` (per-item `build()`, prune with dependents, apply-retry on `ValidationError(index)`, E5b fallback, E5c status, E6 record)
- `src/db/schema.ts` + one new migration (+ `meta/`): `messages.round_refused jsonb`
- `src/http/routes/rounds.ts` (`ChatMessage.roundRefused`, `Round.refused`) · `openapi.json` (via `openapi:emit`)
- `test/interview/**` — new tests. Existing ones change only where E5/E5b change the asserted outcome (list each, DoD 3).

## What to do

1. E5: check each model item on its own; drop refused items and, transitively, everything that names their `$ref` (`depends_on_refused`). Apply the rest. On `ValidationError(index)`, map the index back to its model item, drop it with its dependents (`invalid_change`, detail = the store's message, ≤ 200 chars) and retry, at most once per model item. The user's own decisions (server-made) are never dropped.
2. E5b: refusals still trigger the one correction call, whose answer is pruned the same way. If that call fails, prune and apply the **first** answer.
3. E5c: something applied → `applied`; nothing → `changes_rejected`. When anything was refused, the bot row `content` = `""` and `Round.reply` = `null`.
4. E6: `round_refused` per SPEC-105 (fields, 50 cap + `more`). Returned as `roundRefused` in `GET …/messages` and `refused` in the `Round` response. **Added 16:4x (SA):** also `round_saved integer` = model items applied (SPEC-105 E6, same migration), as `roundSaved` / `saved`. Test: the AC-6 round → `roundSaved: 4`, 1 refused.
5. Migration, then `openapi:emit`. Write "DoD 5 landed" in Notes: TASK-124 waits on it.
6. Update the REQ-110-only patch for the later commit: regenerate `tasks/TASK-109-req110-only.patch` so it holds TASK-109 **and** TASK-123's hunks (everything over `a4bf924` except `openapi.json`). Check it with `git apply -R --check` in the real repo (read-only).

## Definition of Done (each with its command and real output, pasted)

1. Base: `bun test --timeout 30000` (full env prefix) → 0 fail (base: `249 pass / 16 skip / 0 fail, 1266 expect() calls, Ran 265 tests across 36 files [588.53s]`, Sober 16:15–16:25 on this tree) · `bunx tsc --noEmit` → exit 0 (base: exit 0, Sober 16:25).
2. New tests in `test/interview/` (base: n/a — new behaviour; today one bad change rejects the round):
   - **AC-6:** a stub model proposes 5 changes, 1 invalid (an unknown body field) → 4 stored, `applied`, `refused` names the 1 with `invalid_change` and the store's message (base: n/a — today 0 stored, `changes_rejected`);
   - **dependents:** a refused `part.add $s2` drops a `link.add` naming `$s2` → `depends_on_refused`, ref `$s2`; the unrelated changes are stored (base: n/a — new reason);
   - **store-level:** an item that passes `build()` but fails `applyChangeSet` (a link rule) → dropped after the retry, the rest stored (base: n/a — today the whole set fails);
   - **E5b:** correction call fails (stub network error on call 2) → the first answer's valid items are stored (base: n/a — today `changes_rejected`, 0 stored);
   - **all refused** → `changes_rejected`, the same record, 0 parts (base: `changes_rejected`, no record — TASK-109's E2 test);
   - **nothing refused** → as today, reply shown, `roundRefused` null (base: reply shown, no such field);
   - **AC-7:** `GET …/messages` returns `roundRefused` with item/op/kind/ref/key/title/reason/detail; 51 refusals → 50 + `more` (base: n/a — new field);
   - the user's own accept/answer still applies alongside a refused model item.
3. A table of every existing test changed: file:line · old · new · SPEC-105 E-number (base: n/a — written as you change them).
4. `git status --short` → only closed-list files plus TASK-109's (base: TASK-109's 11 entries, Sober 15:3x).
5. `openapi:emit` landed (base: n/a — new fields).
6. Patch updated and `git apply -R --check` → OK (base: OK for the TASK-109-only patch, Sober 14:3x).

## Implementation Notes (Jason, 2026-10-29)

**DoD 5 landed** (16:5x): `openapi.json` carries `Round.refused` + `Round.saved`, `ChatMessage.roundRefused` + `roundSaved`, schema `RefusedItem` (union: item object | `{item:"more",count}`). TASK-124 can start.

**Design (mine, reversible):**
- `build()` now returns a `Plan` of `entries` (each tagged with its model `item`: `changes[i]`, `questions[k]`, `contradictions[k]`, `suggestions[i]`, or `server:…`) plus `refused`. `cascade()` drops any item naming a dead `$ref`, transitively (`depends_on_refused`, `ref` = the ref it needed).
- `applyAnswer` loops: on `ValidationError(index)` it maps `entries[index]` → item, drops it + dependents (`invalid_change`, detail = store message ≤200), retries. Each pass drops ≥1 item, so ≤ once per item. A `server:` entry failing is still an integrity 500. Index null → one `{item:"answer"}` refusal, `invalid`.
- **Only a refusal `build()` makes asks for the correction call.** A store refusal is pruned in place with no gateway call (SPEC E5 "no extra gateway call"). Say if you want the store case to ask too.
- E5b: correction fails (transport or not-JSON) → first answer pruned and applied. If nothing is left: `changes_rejected`, code = first refusal's (transport) or `protocol` (not JSON).
- E5c: anything refused → bot `content` `""`, `Round.reply` null. "Something applied" = a model item stored; if only the user's decisions apply, status stays `changes_rejected` with the decisions kept (D-023, as in TASK-109).
- `round_saved` = distinct stored items among `changes|questions|contradictions` (not suggestions, not the user's accept/answer/park, not link rows). Set whenever `round_refused` is; 0 for a round rejected whole.
- Held contradictions (repeat of an open one) are never refused. A repeat inside one answer lives or dies with the item that adds it.
- Per-question/contradiction refusals (empty text, unknown `about`/`between`, bad sourceId) are now per item, `invalid_change`, no longer a whole-round error. Messages reworded accordingly.
- Migration: one file, `0008_friendly_black_widow.sql` (`round_refused jsonb`, `round_saved integer`); first generated without `round_saved`, deleted and regenerated (journal entry reset), so no stray file.

**DoD 1** — full run, 16:51:47–16:58:03 (`DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:9 CAW_NOTIFY_URL= HOST= bun test --timeout 30000`):
`258 pass / 16 skip / 0 fail, 1311 expect() calls, Ran 274 tests across 37 files [375.90s]` (base 249/16/0, 265 tests; +9 new). `DATABASE_URL=pglite:memory bunx tsc --noEmit` → exit 0.

**DoD 2** — `test/interview/partial.test.ts`, 9 tests, all pass: AC-6 (5 changes, 1 bad body → 4 stored, `saved` 4, 1 refused, 1 gateway call) · dependents (`$s2` → link + question `depends_on_refused`, ref `$s2`; role + its question stored) · store-level (bad step + link naming it + `shows` link → 3 refused, role stored) · E5b network · E5b not-JSON · all refused (`changes_rejected`, `unknown_kind`/`feature`, record on bot row, 0 parts, saved 0) · nothing refused (reply shown, `refused`/`saved` null) · user's accept alongside (valid left → applied; none left → `changes_rejected`, Q-001 answered) · AC-7 (`GET …/messages`: 51 refusals → 50 + `{item:"more",count:1}`, every field, null on user rows, `roundSaved`).

**DoD 3** — existing tests changed:
| file:line | old | new | E |
|---|---|---|---|
| `test/interview/round.test.ts:165` "AC-6" | invalid link → `changes_rejected`, 2 calls, nothing stored; fixed second run applied | role stored, link dropped + recorded, `applied`, 1 call, `refused` names `changes[1]` | E5 |
| `test/interview/round.test.ts:259` "review: correction text" | 2nd change was a store-refused `shows` link (asked for correction) | 2nd change is a `feature` add (a `build()` refusal, so it still asks); same assertion `changes[1]` | E5 |
| `test/interview/honest.test.ts`, `retry.test.ts` | — | unchanged since TASK-109 (all pass as they are) | — |

**DoD 4** — `git status --short` in `blueprint-back`: 15 entries = TASK-109's 11 + `round.test.ts`, `partial.test.ts`, `0008_*.sql`, `meta/0008_snapshot.json`. No file outside the closed list (`context.ts`, `client.ts`, `retry.test.ts`, `honest.test.ts`, migration 0007 are TASK-109's).

**DoD 6** — `tasks/TASK-109-req110-only.patch` regenerated (3552 lines: TASK-109 + TASK-123 over `a4bf924`, no `openapi.json`); `git apply -R --check` in the real repo → `REVERSE_CHECK_OK`.

**UNVERIFIED:** no live model run (QA's). I did not forward-apply the patch in a scratch copy this time (DoD asked only for the reverse check).

## Questions

## Review

### Verdict — DONE (Sober, SA A, 2026-10-29 17:0x)

**Re-run by me:**
- `bun test --timeout 30000` (full env prefix) on `test/interview` + `test/seam` → **95 pass / 0 fail**, 505 expects `[172.94s]`.
- `bunx tsc --noEmit` → exit 0.
- `0008_*.sql` = SPEC-105 § Data Model, both columns.
- `git apply -R --check` of the refreshed REQ-110 patch → OK. `git status` → 15 entries.

**Against SPEC-105 § Round 2:**
- E5: per-item `build()`, `$ref` cascade, apply-retry mapped back to model items, server-made entries never dropped.
- E5b: correction failure falls back to the pruned first answer.
- E5c: content `""`, reply null when anything is refused.
- E6: the record, the 50 + `more` cap, and `round_saved` in the same unit.
- AC-6 and AC-7 have their own tests. Jason's full run: 258/16/0, up from 249.

**BE decisions accepted:**
- **A store-level refusal is pruned without asking the model again.** This follows E5's "no extra gateway call" literally. It saves the owner's scarce calls, and the record (E6) says what was dropped.
- **Per-question and per-contradiction refusals are now per item,** not whole-round.
- **Only the user's own decisions applying → status stays `changes_rejected`,** with the decisions kept (D-023 consistent).

**Existing tests:** the two `round.test.ts` changes are listed with E5 as the reason, and `honest`/`retry` are unchanged. Accepted.

**Patch:** a forward-apply in a scratch copy wasn't asked for and wasn't done. I re-prove it at commit time, as with REQ-103.

The work stays in the tree. No git until REQ-110 passes QA, including the live AC-1 on the owner's word, and the owner says "ขึ้น git".
