# TASK-139: caw-front — a label with no name shows as "ป้าย {version}"
- Source: SPEC-107 (REQ-105 Q6, PM's yes 2026-10-30 — "ป้าย {version}"; Team B)
- Owner: FE (Fanta)
- Status: **DONE** (Silver, 2026-10-30 12:3x — § Review) · was REVIEW (Fanta, 2026-10-30 11:06) — was: TODO — **released 2026-10-30 12:2x** (SA): TASK-138 DONE — caw-back's working-tree `openapi.json` has `Project.latestLabel.label` `["string","null"]` (uncommitted).
- Depends on: TASK-138 DONE · REQ-112 committed (7ef4a1e) in caw-front ✓ — same repo, previous topic

## Why
Blueprint can send the latest label with no name (`label: null`, a version from before named labels — REQ-105 Q6). Today the project
header (`src/app/p/[id]/layout.tsx:28`) and the projects chip (`src/app/page.tsx:63`) call `labelWords.tag(p.latestLabel.label)` and would
print **"ป้าย null"**. The card already falls back to the number (`src/components/card/CardView.tsx:30`); the tag does the same.

## What to do
1. `bun run gen:api` from caw-back's working-tree `openapi.json` (after TASK-138): `Project.latestLabel.label` becomes `string | null`.
   The hand-written types do not follow by themselves: `src/api/caw.ts:25` and `:98` — `latestLabel: { version: number; label: string | null } | null`
   (SA grep 2026-10-30 12:0x, `grep -rn 'latestLabel' src tests`; `mock.test.ts:391` checks the default seed, which keeps a name — untouched).
2. `src/words.ts` — keep `labelWords.tag(label: string)` as it is; add `labelWords.tagOf(l: { version: number; label: string | null })` =
   `tag(l.label ?? String(l.version))`. Words are the PM's (Q6): **`ป้าย {version}`**, e.g. "ป้าย 3". No other new words.
3. `src/app/p/[id]/layout.tsx:28` and `src/app/page.tsx:63` — `labelWords.tagOf(p.latestLabel)` in place of `labelWords.tag(p.latestLabel.label)`.
   `ยังไม่มีป้าย` for no label is unchanged.
4. **Tests:** `src/words.test.ts` — `tagOf({ version: 3, label: null })` → `ป้าย 3`; `tagOf({ version: 1, label: "v1" })` → `ป้าย v1`.
   `src/api/mock.ts` — a `MOCK_STATES` state `nameless-label` (the seeded project's `latestLabel = { version: 3, label: null }`), and one e2e
   line in `tests/projects.spec.ts`: in that state the header and the chip read `ป้าย 3`, never `null`.

**Closed file list:** `src/api/schema.d.ts` (`gen:api` only), `src/api/caw.ts` (the two type lines, added 12:0x), `src/words.ts`, `src/words.test.ts`, `src/app/p/[id]/layout.tsx`,
`src/app/page.tsx`, `src/api/mock.ts` (+ `src/api/mock.test.ts` only if a state test needs it), `tests/projects.spec.ts`. **No git.**
Anything else → `## Questions` first.

## Definition of Done
- [ ] 1. Before. `git status --short | wc -l` → `0` (base: `0` on 7ef4a1e, SA 2026-10-30 11:5x)
- [ ] 2. `grep -c 'labelWords.tag(p.latestLabel.label)' src/app/page.tsx 'src/app/p/[id]/layout.tsx'` → `0` and `0` (base: `1` and `1`)
- [ ] 3. `bun test src` → 0 fail, the new `tagOf` cases named (base: `Ran 346 tests across 25 files`, `0 fail`, SA 11:5x)
- [ ] 4. `bun run typecheck` → exit 0 (base: exit 0 — SA's TASK-122 review on the tree now committed as 7ef4a1e)
- [ ] 5. `NEXT_DIST_DIR=.next-f bun run build && NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → 0 failed (base: `273 passed (2.6m)` — SA's TASK-122 review run on the tree now committed as 7ef4a1e; not re-run at cut)
- [ ] 6. One screenshot at 390 of the header in `nameless-label`, light → `tests/harness/task-139/` in the workspace (base: n/a — new state)

## Implementation Notes
Fanta (FE, B), 2026-10-30 11:02–11:06. `caw-front`, branch `atom`, HEAD `7ef4a1e` before and after, no git. Before: `git status --short | wc -l` → `0`. After: 8 modified files, all on the closed list; `tsconfig.json` untouched.

**What changed:** `gen:api` (`schema.d.ts` +2/−1: `latestLabel.label` is `string | null`) · `caw.ts` the two type lines (`:25`, `:98`) · `words.ts` `labelWords.tagOf(l)` = `tag(l.label ?? String(l.version))`, `tag` unchanged, no other word · header (`layout.tsx`) and chip (`page.tsx`) call `tagOf(p.latestLabel)` · mock state `nameless-label` (project `latestLabel = { version: 3, label: null }`) · `words.test.ts` `tagOf({3,null})` → `ป้าย 3`, `tagOf({1,"v1"})` → `ป้าย v1` · `tests/projects.spec.ts` +1: in that state header and chip read `ป้าย 3` and the page has no `null`. `mock.test.ts` not needed; untouched.

**DoD (my run, 2026-10-30 11:0x)**
1. `git status --short | wc -l` before → `0` ✓
2. `grep -c 'labelWords.tag(p.latestLabel.label)' src/app/page.tsx 'src/app/p/[id]/layout.tsx'` → `0` and `0` ✓
3. `bun test src` → `346 pass · 0 fail`, `Ran 346 tests across 25 files` (same count: the `tagOf` cases are inside the existing words test) ✓
4. `bun run typecheck; echo $?` → `0` ✓
5. `NEXT_DIST_DIR=.next-f bun run build` → exit `0`; `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → `274 passed (2.5m)` (base 273, +1) ✓
6. `tests/harness/task-139/header-nameless-label-390.png` (script `tests/harness/task-139-shot.mjs`): header tag text `"ป้าย 3"`, no sideways scroll ✓. After: no 351x listener (3512 stopped by its pid).

**UNVERIFIED:** `/impeccable audit` and `/simplify` (skill absent in this session, as before); real caw-back sending `label: null` (mock only). I did not open the PNG myself — the run printed the tag text and the layout is unchanged from TASK-116's header (only the string differs).

## Questions

## Review
**Verdict: DONE** — Silver (SA), 2026-10-30 12:3x. Against SPEC-107 D13 and the PM's words "ป้าย {version}" (REQ-105 Q6).
- **Evidence re-run by me** on caw-front (7ef4a1e + this tree): `bun test src` → `346 pass · 0 fail · Ran 346 tests across 25 files`; `bun run typecheck` → `0`; `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → **`274 passed (2.5m)`**, no failure. After: port 351x free.
- **Scope:** 8 modified, all on the list; nothing ignored; `mock.test.ts` untouched (as allowed).
- **Code read:** `words.ts:160` `tagOf = tag(label ?? String(version))`, `tag` unchanged; `page.tsx:63` and `layout.tsx:28` call `tagOf(p.latestLabel)`; `words.test.ts:53` pins both cases (`ป้าย 3`, `ป้าย v1`).
- **Screen:** I opened `tests/harness/task-139/header-nameless-label-390.png` (she had not) — the header reads **"ป้าย 3"**, its own row at 390, no "null", nothing scrolls sideways.
- **UNVERIFIED (carried):** `/impeccable audit` unavailable (same as TASK-116/122); a nameless label from a running caw-back → it cannot be made by today's Blueprint (D13); the joint QA run covers the named path.
