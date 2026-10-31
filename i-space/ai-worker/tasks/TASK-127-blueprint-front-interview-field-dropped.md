# TASK-127: blueprint-front — show "saved, but field X left out" from `roundAdjusted`
- Source: SPEC-105 § "Round 3" (E9, Front) — REQ-110 (TEST-107 round 2)
- Owner: FE (Fern)
- Status: DONE (2026-10-29, Sober — see § Review)
- Depends on: TASK-124 DONE (same topic REQ-110, same uncommitted tree) · TASK-126 DoD 5 (openapi with `roundAdjusted`) for steps 2–3
- Repo: `blueprint-front` (path: `machine.local.md`), branch `atom`. **No git write.**

Wording: REQ-110 § Questions Q5 (accepted by the PM as written, 2026-10-29 — final). Invent no wording.

## Files (closed list — anything else → `## Questions` first)

- `src/features/chat/load.ts` · `src/features/chat/words.ts` · `src/features/chat/load.test.ts`
- `src/core/api/schema.d.ts` (only via `bun run gen:api`)

## What to do

1. On a bot row, each `roundAdjusted` entry with `what: "field_dropped"` → one line after the saved/not-saved lines: "{title} — บันทึกแล้ว แต่ตัดช่อง {field} ออก" (Q5). Take the title as TASK-124 does (title → key → ref → item). Every other `what` is **not shown**. `roundRaw` is never shown.
2. (after TASK-126 DoD 5) `gen:api`, typecheck, unit tests.
3. (after TASK-126 DoD 5) a real render with a stub whose model sends a decision with `open: true`. Start the back end only with `DATABASE_URL=pglite:memory GATEWAY_URL=<stub> CAW_NOTIFY_URL= HOST= PORT=4299`. Paste the chat text in two themes.

## Definition of Done (each with its command and real output, pasted)

1. `bun test src` → 0 fail (base: `227 pass / 0 fail, Ran 227 tests across 10 files`, Sober 17:2x on this tree) · `bun run typecheck` → exit 0 (base: exit 0, Sober 17:2x).
2. New unit tests (base: n/a — new: no adjustment is shown before this TASK):
   - a `field_dropped` entry → its line (base: n/a — new field);
   - `ref_renamed` / `body_defaulted` / `wrapped_in_list` → no line (base: n/a — new field);
   - `roundRaw` present → never in the text (base: n/a — new field);
   - null → as today (base: today's text, TASK-124 tests).
3. `bun run test:states` → all pass (base: `34 passed (38.5s)`, Fern's TASK-124 rework run — not mine) · `bun run test:isolation` → 4 passed (base: `4 passed (6.3s)`, same run).
4. The real render (step 3) (base: n/a — new).
5. `git status --short` → only closed-list files plus TASK-110/124's 7 (base: those 7 files, Sober 17:2x). Ports you used → free (base: n/a — other sessions use this machine).

## Implementation Notes

Fern (FE, A), 2026-10-29 17:5x. Repo `blueprint-front` on `atom`, on top of `a52e022` + TASK-110/124's 7 files. Nothing committed. **Step 1 done; steps 2–3 (the real render) are NOT done.** 17:54 update after Sober's Q1 answer: `gen:api` now runs on a back-end openapi that **has `roundAdjusted`/`roundRaw`/`AdjustedItem`** (`schema.d.ts` +41/−1, typecheck exit 0, unit 234 / 0), but its `AdjustedItem` has **only `item, what, field?, from?, to?` — no `title`/`key`/`ref` yet** (TASK-126 was still `IN_PROGRESS` with Jason; Sober's answer says step 2 will add them). Without a title the line would name the item by its path, so I am not running the real render until they are in the openapi — I would be rendering the fallback, not the product. DoD 3 and 4 are open; this TASK stays `IN_PROGRESS`. I regenerate `schema.d.ts` once more when the titles land.

**What I built (3 files, all on the list: `chat/words.ts`, `chat/load.ts`, `chat/load.test.ts`):**
- `fieldDropped(name, field)` = "{title} — บันทึกแล้ว แต่ตัดช่อง {field} ออก" (REQ-110 Q5 default; invented by nobody here).
- `ApiAdjusted` + `ApiMessage.roundAdjusted` (hand-written from SPEC-105 E8/E9 until `gen:api` sees it); `adjustedLines()`: **only** `what: "field_dropped"` with a field name makes a line; the name is title → key → ref → item path (as TASK-124). `ref_renamed`, `body_defaulted`, `wrapped_in_list` and the `more` element say nothing. `roundRaw` is not read by the page at all.
- `textOf` = the row's own text (unchanged `baseTextOf`) + the lines under it, joined with `\n` (the three themes now keep line breaks, TASK-124). On a row that refused something: the saved/not-saved lines, then these. On a row that refused nothing: the model's reply, then these. User rows never get any.

**Evidence (unit only, before the back end exists):**
```
bun test src      → 234 pass / 0 fail — Ran 234 tests across 10 files     (227 → 234: +7, all in chat/load.test.ts)
bun run typecheck → exit 0 (no output from tsc --noEmit)
git status --short → the 7 files of TASK-110/124 + (words.ts, load.ts, load.test.ts already among them) → 7 entries, nothing new
```
Tests (DoD 2): the Q5 word verbatim · a `field_dropped` entry → its line · under the saved/not-saved lines when something was refused too · one line per field, name fallback title → key → ref → item · `ref_renamed` / `body_defaulted` / `wrapped_in_list` / `more` → no line · `roundRaw` present → never in the text · `null` / `[]` / no field → as today, a dropped field with no name says nothing, user rows get none.

### Steps 2–3 (18:20–18:22) — after TASK-126 DONE
```
18:20 bun run gen:api → ../blueprint-back/openapi.json → src/core/api/schema.d.ts   AdjustedItem = { field?, from?, item, key|null, ref|null, title|null, to?, what } | { count, item:"more" }   (title/key/ref present, as Sober's answer said)
      bun run typecheck → exit 0 · bun test src → 234 pass / 0 fail — Ran 234 tests across 10 files    (my hand-written ApiAdjusted matches the generated shape; no code change needed)
18:21 PLAYWRIGHT_PORT=3102 bun run test:states → 34 passed (34.5s)       PLAYWRIGHT_PORT=3102 bun run test:isolation → 4 passed (5.9s)
git status --short → the 7 files of TASK-110/124 (schema.d.ts regenerated; words.ts, load.ts, load.test.ts carry this TASK's edits)    env | grep -c BLUEPRINT_GATEWAY_LIVE → 0
ss -ltnp | grep -E ':(3100|3101|3102|4200|4299|4298|4296)\b' → empty (my stub 1407134, back end 1407172, front 1407580 and the leftover 4298 back end 1408701 stopped by pid)
```
**DoD 4 — real render** (TASK-126 back end from the working tree: `DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:4296 CAW_NOTIFY_URL= HOST= PORT=4299`; stub `tests/harness/stub-gateway-127.mjs` proposes one decision with `open: true` (the registry wants a string); `tests/harness/walk-127.ts`; screenshots `tests/harness/task-127/`):
```
stored bot row:  roundStatus applied · roundRefused null · roundAdjusted [{"item":"changes[0]","what":"field_dropped","field":"open","title":"กฎการจอง","key":null,"ref":"$d"}] · roundRaw null
stored part:     DEC-001 decision "กฎการจอง" body {"rule":"จองล่วงหน้าได้ไม่เกิน 30 วัน","cases":["วันหยุดจองไม่ได้"]}   — kept, without `open`
chat, all four themes (clean-blue, luxury-gold, default, minimal-mono):
   bot:  "บันทึกกติกาการจองให้แล้วครับ"                       (nothing refused → the model's reply stays)
         "กฎการจอง — บันทึกแล้ว แต่ตัดช่อง open ออก"          (the new line, under it; the title, not the path)
```
`ref_renamed` / `body_defaulted` / `wrapped_in_list` are not producible with this stub (they need TASK-126's other repairs) — unit tests only; `roundRaw` was `null` in this round, so "never shown" is unit-tested only (the page source did not contain it either, trivially). `/impeccable audit` not available; no layout change (an extra message line).

## Questions

- **Q1 (Fern → @Sober, shape).** I wrote `ApiAdjusted` from SPEC-105 E8/E9: `{ item, what, field?, from?, to? }` plus `title`/`key`/`ref` for the item's name (TASK-124's rule). SPEC-105 E8's record lists only `item, what, field, from, to` — **no title**. If TASK-126 does not add one, the line names the item by its path ("changes[2] — บันทึกแล้ว แต่ตัดช่อง open ออก"), which a user cannot read. Does TASK-126 carry `title` (as `roundRefused` does)? If not, please add it there; the line is useless without a name. Default: I read `title` / `key` / `ref` when present, else the path.
  > answer (Sober, SA A, 17:5x): **Yes, it will carry them.** You're right, and it's my gap. SPEC-105 E8 and TASK-126 step 2 now require `title`, `key`, `ref` on every `round_adjusted` entry, the same as `round_refused`. Keep your fallback order. The path stays only as the last resort.

## Review

### Verdict — DONE (Sober, SA A, 2026-10-29 18:2x)

**Re-run by me:** `bun test src` → **234 pass / 0 fail** `[7.15s]`; `bun run typecheck` → exit 0; `git status` → the 7 files of TASK-110/124/127, nothing else.

**Accepted on the evidence:**
- `gen:api`'s `AdjustedItem` carries `title`/`key`/`ref`, and her hand-written type matched it.
- states 34, isolation 4, ports freed.
- The real round stored DEC-001 without `open`, `roundAdjusted` names it, and all four themes show "กฎการจอง — บันทึกแล้ว แต่ตัดช่อง open ออก" under the model's reply (nothing refused, so the reply stays, per E5c).

The other adjustment kinds and `roundRaw` being hidden are unit-tested only: accepted, as they can't be produced with this stub.

The work stays in the tree. No git until REQ-110 passes QA and the owner says "ขึ้น git".
