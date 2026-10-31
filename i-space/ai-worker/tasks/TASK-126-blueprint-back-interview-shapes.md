# TASK-126: blueprint-back — field shapes in the prompt, safe repairs of the model's shapes, keep why a reply was unreadable
- Source: SPEC-105 § "Round 3" (E7, E8, E9, E10) — REQ-110 (TEST-107 round 2: AC-1 live 2 parts, 20 refused; O-6)
- Owner: BE (Jason)
- Status: DONE (2026-10-29, Sober — see § Review)
- Depends on: TASK-123 DONE (same topic REQ-110, same uncommitted tree on top of `a4bf924`)
- Repo: `blueprint-back` (path: `machine.local.md`), branch `atom`. **No git write.**

🔴 Prefix every `bun` command with `DATABASE_URL=pglite:memory` (and `PORT=` when it serves). Never print `.env`. **No live gateway call** (the owner's 8 are spent): stub only.

The live evidence to build tests from is `i-space/ai-worker/tests/harness/test-107/r2/ac1-bot-row.json`: the real model's 8 invalid changes and their store messages.

## Files (closed list — anything else → `## Questions` first)

- `src/interview/context.ts` (E7: types in `kindsBlock()`, the ref line)
- `src/interview/round.ts` (E8 repairs before validation, E9 optional-field drop, E10 protocol record)
- `src/db/schema.ts` + one new migration (+ `meta/`): `round_adjusted jsonb`, `round_raw text`
- `src/http/routes/rounds.ts` (`ChatMessage.roundAdjusted`, `roundRaw`; `Round.adjusted`) · `openapi.json` (via `openapi:emit`)
- `test/interview/**` — new tests. Existing ones change only where E8/E9/E10 change the asserted outcome (list each, DoD 3).

## What to do

1. E7: print each body field's type from its zod schema, plus the ref line. Paste the new block and its length.
2. E8 (a)(b)(c), each recorded in `round_adjusted`. **Each entry carries `title`, `key` and `ref`, exactly as `round_refused` entries do** (added 17:5x, TASK-127 Q1: the front names the part with them). Refs renamed consistently across the answer, and a collision means no rename.
3. E9: drop only optional or defaulted top-level fields when they're the only failing paths. Record `field_dropped`, store the part.
4. E10: on `protocol`, reason = `protocol` (first failure), note = `"then <reason>"` if the re-ask also failed, and `round_raw` = the first ≤ 4000 chars of the unreadable reply.
5. Migration, then `openapi:emit`. Write "DoD 5 landed" in Notes: TASK-127 waits on it.
6. Refresh `tasks/TASK-109-req110-only.patch` (TASK-109 + 123 + 126 over `a4bf924`, no `openapi.json`), then run `git apply -R --check` in the real repo.

## Definition of Done (each with its command and real output, pasted)

1. `bun test --timeout 30000` (full env prefix) → 0 fail (base: `258 pass / 16 skip / 0 fail, 1311 expect() calls, Ran 274 tests across 37 files [354.44s]`, Sober 17:34–17:40 on this tree) · `bunx tsc --noEmit` → exit 0 (base: exit 0, Sober 17:40).
2. New tests, named in Notes:
   - **the live replay:** the 8 changes of `ac1-bot-row.json` rebuilt as a stub answer (titles and values as recorded), plus links between them. Expected: the 5 hyphen refs renamed and stored · `system` with no body stored as `{}` · the decision stored without `open` (`field_dropped`), and with `cases` as a list if it was a string (`wrapped_in_list`). The screen's object lists can't be repaired (string → objects is ambiguous), so its malformed optional lists are dropped and the screen is stored · the links that depended on them are stored, not `depends_on_refused` (base: n/a — today 8 refused + 12 dependents);
   - a ref collision (`$a-b` and `$a_b` in one answer) → no rename, both refused as today (base: n/a — new rule);
   - a required field wrong (e.g. `decision.rule` missing) → still refused (base: refused today, unchanged);
   - the prompt prints types for every model kind's fields, plus the ref line (base: n/a — names only today, `context.ts:20-21`);
   - E10: unreadable first reply, then the re-ask fails with `http_503` → reason `protocol`, note `then http_503`, `roundRaw` = the first 4000 chars (base: today reason `http_503`, nothing kept);
   - `GET …/messages` returns `roundAdjusted` and `roundRaw`, null on plain rows (base: n/a — new fields).
3. A table of every existing test changed: file:line · old · new · E-number (base: n/a — written as you change them).
4. `git status --short` → only closed-list files plus TASK-109/123's (base: 15 entries, Sober 17:0x).
5. `openapi:emit` landed (base: n/a — new fields).
6. Patch refreshed and `git apply -R --check` → OK (base: OK for the TASK-109+123 patch, Sober 17:0x).

## Implementation Notes (Jason, 2026-10-29)

**DoD 5 landed** (18:0x): `openapi.json` carries `Round.adjusted`, `ChatMessage.roundAdjusted` + `roundRaw`, schema `AdjustedItem` (union: entry with `item, what, title, key, ref, field?, from?, to?` | `{item:"more",count}`). TASK-127 can start.

**E7 (step 1)** — new block (generated from the zod shapes), 1153 chars (was 815); `SYSTEM_PROMPT` 2669 chars (was 2331). AC-11 bound test still green.
```
- work { goal?: string }   - step { ends?: boolean }   - interaction { text: string, reply?: string }   - role { duty?: string }
- screen { fields?: [{ name, label?, type? }], actions?: [{ name, label? }], states?: [{ name, note? }] }
- api { method: "GET"|"POST"|"PUT"|"PATCH"|"DELETE", path: string, request?: any, responses?: [{ status, body?, note? }] }
- system {}   - data { fields?: [{ name, type?, note? }] }   - decision { rule: string, cases?: string[], neighbouring?: string, open?: string }
ref คือ $ ตามด้วย a-z A-Z 0-9 _ เท่านั้น เช่น $step_view (ห้ามมี - หรือช่องว่าง)
```
(one kind per line in the real block; the heading now reads "ชื่อ: ชนิด, ? = ไม่บังคับ").

**Design (mine, reversible):**
- E8 is a pure `repair()` step at the top of `build()`, before any check. (a) renames only refs that a `part.add` *defines*; target = each run of other chars → `_`; a rename happens only if its target is reached by exactly one defined ref (so `$a-b` + `$a_b`, or two hyphen refs that collapse, are left alone). Applied to `ref`, `from`, `to`, `key`, question `about`, contradiction `between`. (b) `part.add` with `body` undefined → `{}`. (c) a string in a field whose schema is `string[]` (optional/default unwrapped) → `[string]`, for `part.add` and `part.update` (kind of the live part).
- E9 is `withoutBadOptionals()`, run after the item passed every other check: re-parse the body with the kind's schema; if every issue is on a top-level field that accepts `undefined` (and none is `unrecognized_keys`), drop those fields and re-parse; only if that passes is the part kept. So an unknown field, or a wrong required field, still goes to the store and is refused as before.
- `round_adjusted` lists only items that are in the stored set (a repaired item that was later refused or dropped leaves no trace). Each entry has `title`/`key`/`ref` read from the stored change (so `ref` is the renamed one), as `round_refused` has them.
- E10: reason `protocol` (first failure); note `then <reason>` only when the re-ask is a transport failure; when the re-ask is also unreadable the note is null (the reason already says it). `round_raw` = first 4000 chars of the first reply, NULs removed (Postgres text cannot hold one). This changes the stored reason of "unreadable, then re-ask fails" from the transport reason to `protocol`, so the front's timeout sentence no longer shows for it (it stays for a first-call timeout).
- Migration `0009_remarkable_firestar.sql` (`round_adjusted jsonb`, `round_raw text`).

**DoD 1** — full run 18:02:16–18:08:28: `267 pass / 16 skip / 0 fail, 1370 expect() calls, Ran 283 tests across 38 files [371.62s]` (base 258/16/0, 274 tests; +9). `DATABASE_URL=pglite:memory bunx tsc --noEmit` → exit 0.

**DoD 2** — `test/interview/shapes.test.ts`, 9 tests, all pass: E7 prompt (every model kind's every field printed with `name?: type`, the ref line, size bound) · **live replay** (the 8 recorded invalid changes + their links and the question: 1 gateway call, `applied`, nothing refused, reply shown; 5 refs renamed, `system` `{}`, screen stored with its string lists dropped, decision `cases` wrapped and `open` dropped, all 10 links + the question's `about` stored — today 8 refused + 12 dependents) · ref collision (`$a-b`/`$a_b`: no rename, hyphen part + its link refused) · required field wrong (decision without `rule`: refused) · unknown body field: refused, not dropped · repaired-then-dropped item leaves no record · E10 (unreadable + `http_503` → `protocol` / `then http_503` / `roundRaw` 4000 chars, NUL removed; unreadable twice → `protocol`, no note, raw kept) · `GET …/messages` returns `roundAdjusted` + `roundRaw`, null on plain rows.

**DoD 3** — existing tests changed:
| file:line | old | new | E |
|---|---|---|---|
| `test/interview/honest.test.ts:66-68` E1 | `"- interaction { text, reply? }"`, `"- step { ends? }"`, `"- work { goal? }"` | the same lines with types (`text: string, reply?: string`, `ends?: boolean`, `goal?: string`) | E7 |
Nothing else changed: the TASK-109/123 tests (incl. the E4 network test, whose first reply is readable) pass as they were.

**DoD 4** — `git status --short` in `blueprint-back`: 18 entries = TASK-109/123's 15 + `0009_*.sql`, `meta/0009_snapshot.json`, `test/interview/shapes.test.ts`. `context.ts` also exports `shapeOf`/`optionalField` (used by `round.ts`).

**DoD 6** — `tasks/TASK-109-req110-only.patch` regenerated (5100 lines, 17 files: TASK-109 + 123 + 126 over `a4bf924`, no `openapi.json`); `git apply -R --check` in the real repo → `REVERSE_CHECK_OK`.

**UNVERIFIED:** no live model run (the owner's 8 are spent; QA's next). I did not forward-apply the patch in a scratch copy.

## Questions

## Review

### Verdict — DONE (Sober, SA A, 2026-10-29 18:1x)

**Re-run by me:**
- `bun test --timeout 30000` (full env prefix) on `test/interview` + `test/seam` → **104 pass / 0 fail**, 564 expects `[179.64s]`.
- `bunx tsc --noEmit` → exit 0.
- `0009_*.sql` = SPEC-105 § Round 3 Data Model.
- `git apply -R --check` of the refreshed REQ-110 patch → OK. `git status` → 18 entries.

**Against SPEC-105 § Round 3:**
- **E7:** the block is printed with types and the ref line (pasted, 1153 chars, size test green).
- **E8:** repairs only of what has one reading. A rename only when exactly one defined ref reaches the target. Recorded with `title`/`key`/`ref` (the F-024 fix).
- **E9:** optional fields are dropped only when they're the sole issues. Unknown fields and required ones are still refused.
- **E10:** reason `protocol`, note `then <reason>`, `roundRaw` ≤ 4000 with NUL removed.
- **The decisive test:** the **live replay** of `r2/ac1-bot-row.json` stores all 8 changes and their 12 dependents in 1 call, with nothing refused. Today those 20 fail.
- Full run 267/16/0, up from 258.

**One existing test changed** (`honest.test.ts:66-68`, E7 types). Accepted.

**BE decisions accepted:**
- A record entry only for items that end up stored.
- `then <reason>` only after a transport failure.
- **The behaviour change:** "unreadable, then the re-ask times out" now stores `protocol`, so the timeout sentence doesn't show there. The user still gets "บอทตอบไม่ได้ตอนนี้" with ลองใหม่ / เปลี่ยนโมเดล. A first-call timeout keeps its sentence. Noted for the PM.

**UNVERIFIED (as stated):** the real model's next answer. That's the owner's 6 calls (REQ-110 Q6).

The work stays in the tree. No git until REQ-110 passes QA and the owner says "ขึ้น git".
