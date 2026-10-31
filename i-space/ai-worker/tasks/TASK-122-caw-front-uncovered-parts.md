# TASK-122: caw-front — show spec parts no card covers, on the open proposal and on the board
- Source: SPEC-109 (REQ-112, Team B side) — D3, D4, § API
- Owner: FE (Fanta)
- Status: **DONE** (Silver, 2026-10-30 10:1x — § Review) · was REVIEW (Fanta, 2026-10-30 09:46) — was: TODO — **released 2026-10-30 10:0x** (SA): TASK-121 DONE (caw-back's working-tree `openapi.json` has `GET /v1/projects/{projectId}/coverage` + `Coverage`, uncommitted) · REQ-105 committed in caw-front (4a071bc).
- **SA notes at release (base 4a071bc, 10:0x):** citations re-checked — `Chat.tsx:51-53` = the estimate line, `Board.tsx:175` = where the notices start (`TeamDown`, then the `chatWaits` line). New paths not ignored: `git check-ignore -v src/components/Uncovered.tsx src/components/Uncovered.test.tsx` → exit 1. Adding `coverage` to `CawApi` breaks no other implementer: `grep -rln 'CawApi' src tests` → the fakes in `startingTeam.test.ts:54` spread the real mock, the others cast `as unknown as CawApi`.
- Depends on: TASK-121 DONE · REQ-105 committed (4a071bc) in caw-front ✓ (SA 2026-10-30 09:3x) — stays ON HOLD only for TASK-121

## What to do

Closed file list (caw-front): `src/api/schema.d.ts` (`bun run gen:api` only) · `src/api/caw.ts` · `src/api/http.ts` · `src/api/mock.ts` ·
`src/api/mock.test.ts` · `src/words.ts` · `src/components/chat/Chat.tsx` · `src/components/Board.tsx` · `src/app/p/[id]/page.tsx` and
`src/app/p/[id]/chat/page.tsx` (to fetch and pass the data) · one new component `src/components/Uncovered.tsx` · tests: a unit test for the
component and one e2e assertion in `tests/board.spec.ts` or `tests/chat.spec.ts`. No git.

1. `bun run gen:api`. `CawApi.coverage(projectId: string, proposalId?: string): Promise<Coverage>` with `Coverage` exactly SPEC-109 § API
   (camelCase). `http.ts`: `GET /v1/projects/{projectId}/coverage`. `mock.ts`: the seeded project answers one uncovered part (an existing
   mock part key + its title, two decision keys); `[]` for a proposal whose items include that key.
2. `words.ts`: `uncovered.part = (part: string) => \`ส่วนนี้ใน spec ยังไม่มีงานไหนรับไป: ${part}\`` (the PM's sentence, exactly).
3. `Uncovered.tsx`: a short list, one line per part, `{part}` = the key (a link built with `src/blueprint.ts`, as the card's "ดู spec"
   does) + space + title. Renders nothing for an empty list. Quiet notice style, the same family as the board's existing notices
   (`Board.tsx:175`); no new colour.
4. **Proposal:** in `Chat.tsx` under the estimate line (`:51-53`), for an **open** proposal, call `coverage(projectId, p.id)` (server
   side, with the page's other reads) and render `Uncovered`. **Board:** in the notices area (`Board.tsx:175`), `coverage(projectId)`.
5. A failed `coverage` call → render nothing there and log nothing to the user (SPEC-109 D4). Never block "ตกลง" or any action.
6. 390 / 1280 / 1440, light + dark: long titles wrap; nothing scrolls sideways (the `ac5` run covers every screen).

## Definition of Done

- [ ] 1. Before. `cd caw-front && git status --short | wc -l` → `0` (base: `0` on 4a071bc, SA 2026-10-30 10:0x)
- [ ] 2. `grep -c coverage src/api/caw.ts src/api/schema.d.ts` → ≥ `1` each (base: `0` and `0`, 2026-10-29 15:3x)
- [ ] 3. `bun test src` → 0 fail (base: `340 pass · 0 fail`, `Ran 340 tests across 24 files`, SA 2026-10-30 10:0x on 4a071bc; DoD 2 base `0`/`0` and DoD 4 typecheck `0` re-run then too)
- [ ] 4. `bun run typecheck` → exit 0 (base: exit 0)
- [ ] 5. `NEXT_DIST_DIR=.next-f bun run build && NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → 0 failed (base: `271 passed (2.6m)` — SA's TASK-116 review run 2026-10-29 19:4x on exactly the tree now committed as 4a071bc, port 3510; not re-run at release)
- [ ] 6. Screenshots: the seeded proposal and the board with the uncovered line, light + dark at 390 px, paths in Implementation Notes (base: n/a — new)

## Implementation Notes
Fanta (FE, B), 2026-10-30 09:35–09:46. Repo `caw-front`, branch `atom`, HEAD `4a071bc` before and after, no git run. Before: `git status --short | wc -l` → `0`. After: 12 modified + 2 new files (`src/components/Uncovered.tsx`, `Uncovered.test.tsx`), all on the closed list; `tsconfig.json` untouched.

**What changed**
- `bun run gen:api` from caw-back's working-tree `openapi.json` → `schema.d.ts` +79/−0 (the `…/coverage` route and `Coverage`), plain.
- `CawApi.coverage(projectId, proposalId?)` + `Coverage` exactly SPEC-109 § API (`caw.ts`); http `GET /v1/projects/{projectId}/coverage`, `proposalId` in the query only when given (`http.ts`); a refusal is a CawError.
- Words (`words.ts`): `uncovered.part(part)` = the PM's sentence exactly; plus `uncovered.lead` (its words before `{part}`), because the key is a link inside the line — `part(…)` is `lead + " " + part`, tested equal to the visible text.
- `Uncovered.tsx`: one `<li>` per part — lead, key as a Blueprint link (href built by the server page with `blueprintPartHref`, which owns `BLUEPRINT_URL`; a client component cannot read it), title; nothing for `[]`. Existing tokens only (`text-ink2`, `border-hair`, `bg-sheet`) — no new colour; link keeps a 44 px target.
- Proposal: `Chat.tsx` renders it under the estimate line, **open proposals only**; `chat/page.tsx` reads `coverage(id, p.id)` per open proposal with the page's other reads. Board: `Board.tsx` renders it first in the notices area (before the chat-waits line, after `TeamDown`); `p/[id]/page.tsx` reads `coverage(id)`.
- A failed read → `.catch(() => null)` → nothing drawn, nothing said; "ตกลง"/actions are untouched (checked in e2e: `[data-create]` enabled).
- Mock: the seeded project answers one uncovered part — `SCR-003` (`หน้าอนุมัติคำขอ`) with `DEC-001`, `DEC-002`; `[]` for a proposal with an item on `SCR-003` (the seed's open proposal Q2 has one, Q3 does not, so both branches are on screen); 404 for an unknown project/proposal. Sample data; a card already holds `SCR-003` in the mock — the mock does not compute coverage, it answers the fixed case.

**A defect I made and caught:** the first version put the line's words in flex items with only a CSS gap, so the text was `…รับไป:SCR-003หน้า…` (no spaces) for copy-paste and screen readers, though it looked right. The first e2e run failed on `toHaveText` and showed it; fixed with real `{" "}` between the pieces, and the unit test now strips tags with nothing in their place so it cannot be fooled again (my first unit test hid it by replacing tags with a space).

**Tests**: unit `Uncovered.test.tsx` +3 (sentence exact; `[]` → `""`; markup, link, title escaped, text = sentence), `mock.test.ts` +3 (board read + revision; proposal with/without the part; 404s). e2e: `board.spec.ts` +1 (line text, link `part=SCR-003`, 11 board cards unchanged), `chat.spec.ts` +1 (Q3 shows it and its create button is enabled; Q2 shows none; superseded shows none). No existing assertion changed.

**DoD (my run, 2026-10-30 09:3x–09:46)**
1. `git status --short | wc -l` before → `0` ✓
2. `grep -c coverage src/api/caw.ts src/api/schema.d.ts` → `2` and `1` ✓
3. `bun test src` → `346 pass · 0 fail`, `Ran 346 tests across 25 files` (base 340) ✓
4. `bun run typecheck; echo $?` → `0` ✓
5. `NEXT_DIST_DIR=.next-f bun run build` → exit `0`; `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → `273 passed (2.5m)` (base 271, +2) ✓ — **note:** the first full run (before the spacing fix) had 3 failures: my two new tests (the bug above) and `board.spec.ts:122` "a card moved from another tab…" (a 13 s timing test, unrelated to this change); the 122 test passed on the re-run with the rest and I did not reproduce it alone, so its cause is **UNVERIFIED — timing under load; a re-run by the SA settles it**.
6. Screenshots, light + dark, 390 and 1280 (8 files), in `ai-worker/tests/harness/task-122/`: `proposal-{light,dark}-{390,1280}.png`, `board-{light,dark}-{390,1280}.png`; script `tests/harness/task-122-shots.mjs`. Result: `sideways=false` in all 8; at 390 the line is `324x64` (wraps, link `57x44`), at 1280 `606x44` (proposal) / `1182x44` (board); dark background `rgb(17, 19, 23)` confirmed in the run. I looked at `proposal-dark-390.png`: the line sits under the estimate and above the items, reads as a quiet note, the key is underlined. Long titles wrap (the box is `min-w-0 break-words`) — a very long real title was **not** tried: **UNVERIFIED — a long-title case in the mock would settle it**.
7. After: `ss -ltn | grep -E ':351[0-9]'` → no listener (3512 stopped by its pid); `git diff --stat -- tsconfig.json` → empty ✓.

**Not done / UNVERIFIED**
- `/impeccable audit`, `/simplify`: the skill is not in this session (as on TASK-116) — **UNVERIFIED — an audit of the board notice and the proposal line would settle it.** My own review of the added lines: no inline hex, no `transition-all`, no z-index; nothing new is interactive except a link with a visible, underlined, 44 px target.
- Real caw-back: mock only; the http `coverage` call has no test of its own (`http.test.ts` is not on the closed list) — **UNVERIFIED against a real caw-back / a stub API.**
- The 10 s re-check (AC-3) is REQ-108 phase 2 (QA) — not this TASK.

## Questions

## Review
**Verdict: DONE** — Silver (SA), 2026-10-30 10:1x. Against SPEC-109 D3, D4, § API and REQ-112's sentence.
- **Evidence re-run by me** on caw-front (4a071bc + this tree): `bun test src` → `346 pass · 0 fail · Ran 346 tests across 25 files`; `bun run typecheck` → `0`; `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → **`273 passed (2.6m)`**, no failure — `board.spec.ts:122` did not fail again; I treat her first run's failure there as load timing, not this change. After: port 351x free.
- **Scope:** 12 modified + 2 new, all on the list; `git status --ignored -- src tests` → nothing ignored. She touched both `board.spec.ts` and `chat.spec.ts` (+1 test each) where the TASK said "one e2e assertion in board or chat" — **accepted**: the proposal and the board are two places D3 names, one check each.
- **D3 / words:** `uncovered.lead + " " + part` = the PM's sentence, tested equal to the visible text; the spacing bug she made and caught (pieces joined by CSS gap only) is fixed with real spaces and a unit test that cannot hide it. The Blueprint link href is built on the server page by `blueprintPartHref` (it owns `BLUEPRINT_URL`) — right call, a client component cannot read it.
- **D4:** a failed read → `.catch(() => null)` → nothing drawn; `[data-create]` stays enabled (e2e).
- **http:** `src/api/http.ts:112` goes through the typed openapi client (`/v1/projects/{projectId}/coverage`, `proposalId` only when given), so path and query are type-checked against `schema.d.ts`; no runtime test against a real caw-back (UNVERIFIED, carried).
- **Screen:** looked at `tests/harness/task-122/board-dark-390.png` — first notice, quiet sheet tone, key underlined, title on its own line, no sideways scroll.
- **UNVERIFIED (carried, not blocking):** `/impeccable audit` unavailable; a very long real title not tried (box is `min-w-0 break-words`); http vs a running caw-back → QA's REQ-112 run, whose live proof also needs Team A's TASK-117.
