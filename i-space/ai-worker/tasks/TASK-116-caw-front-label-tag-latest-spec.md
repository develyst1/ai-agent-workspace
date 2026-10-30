# TASK-116: caw-front — start without a label, label as a tag, card "cut at", Blueprint-unreachable sentence
- Source: SPEC-107 (REQ-105, Team B)
- Owner: FE (Fanta)
- Status: **DONE** (Silver, 2026-10-29 19:4x — § Review) · was REVIEW (Fanta, 2026-10-29 19:30; Notes below) — was: TODO — **released 2026-10-29 19:2x** (SA): TASK-114 + TASK-115 DONE (caw-back's `openapi.json` now has `Project.spec`, `latestLabel`, `Card.anchorLabel`, `Card.anchorRemoved`, `CardContext.specRead`, 404 `anchor_removed`). Base re-run by the SA on caw-front f071c02, clean tree, 19:2x: DoD 3 `334 pass · 0 fail` (unchanged), DoD 4 typecheck `0` (18:3x after the reboot's `bun install`).
- Depends on: TASK-114 DONE · TASK-115 DONE · REQ-111 committed (f071c02) in caw-front ✓ · PM go ✓ (Porter 2026-10-29 17:1x: "start the moment REQ-113 is committed")

## What to do

Read SPEC-107 § API, § Front (the table is your screen list), § Consumers, § Guardrails. Words are the PM's (REQ-105 § User-facing
wording, and Q3's four, accepted 2026-10-29).

1. `bun run gen:api` from caw-back's new `openapi.json` (plain, no hand edits).
2. **Types** (`src/api/caw.ts`): Project `latestLabel`, `spec`; Card `anchorLabel`; CardContext `specRead`; `PartContext` `version`,
   `confirmedAt` → `revision`, `savedAt`, `latestLabel` (SPEC-107 § Front); `part(projectId, key)` — `version` parameter removed.
   `src/api/http.ts` and `src/api/mock.ts` follow every shape (mock: one project with a label, one card cut before a label).
3. **Screens** (SPEC-107 § Front table): `/start` (`src/app/start/page.tsx`) — `project` alone is enough; `version` passed through
   if present; `version_not_confirmed` no longer a refusal. Project header (`src/app/p/[id]/layout.tsx`): `ป้าย {label}` /
   `ยังไม่มีป้าย`. Projects chip (`src/app/page.tsx:63`): same words. Card (`src/components/card/CardView.tsx`): `ตัดงานที่ป้าย {label}`
   / `ตัดงานก่อนมีป้าย`. Unreachable sentence in the project layout and on the card view (SPEC-107 § Front). Chat page:
   `api.part(id, key)`.
   **Mock (D7, PM's Q2 answer):** `src/api/mock.ts:380` `workable` drops `specChangedVersion === null`; `:383` `isStuck` drops the
   spec-changed term. The badge on Board/CardView is untouched.
4. **Words** (`src/words.ts`): add REQ-105's five. Q3 — **accepted by the PM 2026-10-29, use as written**: `startRefused.incomplete` =
   `ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์`; drop `projectCard.blueprintVersion` (`:156`) and `startRefused.version_not_confirmed` (`:255`) if
   nothing else uses them (grep first); `anchor_not_in_version` (`:138`) = `บางงานในข้อเสนอนี้ไม่มีใน spec แล้ว — เริ่มงานไม่ได้`.
5. Tests: unit (`src/**/*.test.ts(x)` that the grep in SPEC-107 § Consumers lists) and e2e on the mock: the label words at
   1440/1280/390, the no-label `/start`, the unreachable sentence. List every changed existing assertion in Notes.

**Closed file list:** `src/api/{caw,http,mock,schema.d,index}.ts`, `src/api/{http,mock,mock-writes,mock-chat}.test.ts`,
`src/app/start/page.tsx`, `src/app/page.tsx`, `src/app/p/[id]/layout.tsx`, `src/app/p/[id]/chat/page.tsx`,
`src/components/card/CardView.tsx` (+ its `.module.css` if it has one), `src/words.ts`, `src/words.test.ts`, the e2e specs under
`tests/` that cover start/project/card, **and for REQ-105 Q4 (SPEC-107 D12, added 2026-10-29 18:2x):** `src/app/p/[id]/page.tsx`,
`src/app/p/[id]/c/[cardId]/page.tsx`, `src/components/Board.tsx`.

**Q4 step (SPEC-107 D12):** `Card.anchorRemoved: boolean` (from `gen:api`) · `cardContext` answering 404 `anchor_removed` is **not an error
for the board**: the board (`page.tsx:22`, every card's context at once) renders that card without context and must still load · the card
page shows `ส่วนนี้ถูกลบออกจาก spec แล้ว — งานนี้ทำต่อไม่ได้จนกว่าจะย้ายไปส่วนอื่นหรือปิดงาน` (REQ-105 Q4, exactly) in place of the context ·
the board card shows it as a mark beside "spec เปลี่ยน" (cut on one line, whole sentence in `title`, as TASK-120's mark) · mock: one seeded
card with `anchorRemoved: true`. e2e: the board loads with that card; the card page shows the sentence. Anything else → `## Questions` first. **No git.** Guardrails SPEC-107 G1–G5; never start
caw-back or a runner yourself (ask the SA for a stub API if a live check is needed).

## Definition of Done

- [ ] 1. `grep -c 'ป้าย' src/words.ts` → ≥ 4 (base: `0`, SA 14:3x)
- [ ] 2. `grep -n 'version' src/app/start/page.tsx` → no hit makes `version` required (base: `20:  return e.code === "blueprint_project_not_found" || e.code === "version_not_confirmed" ? …` and the header comment lines 1–2, SA 14:3x)
- [ ] 3. `bun test src` → 0 fail (base: `Ran 334 tests across 24 files`, 0 fail, SA 14:2x)
- [ ] 4. `bun run typecheck; echo $?` → `0` (base: `front typecheck exit 0`, SA 14:2x)
- [ ] 5. `NEXT_DIST_DIR=.next-f bun run build` → exit 0 (base: exit 0 — Fanta's TASK-111 run 2026-10-29 13:4x, not re-run by the SA)
- [ ] 6. `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → 0 failed; new cases named (base: `264 passed` — Fanta 13:48, not re-run by the SA)
- [ ] 7. Screenshots at 1280 and 390 of: project header with a label, with none; a card cut before a label; the unreachable sentence → `tests/harness/task-116/` in the workspace (base: n/a — new screens)
- [ ] 8. After: no port you opened still listening (`ss -ltn`); `git -C <caw-front> diff --stat -- tsconfig.json` → empty (base: empty, G4)

## Implementation Notes
Fanta (FE, B), 2026-10-29 19:06–19:30. Repo `caw-front`, branch `atom`, HEAD `f071c02` before and after, no git run. Before: tree clean (`git status --porcelain` empty bar `test-results`). After: 24 modified files, 321+/124−, `tsconfig.json` untouched.

**What changed (SPEC-107 § Front)**
- `bun run gen:api` from caw-back's `openapi.json` → `src/api/schema.d.ts` (+51/−10, plain). Types: `Project.latestLabel/spec`, `Card.anchorLabel/anchorRemoved`, `CardContext.specRead`, `PartContext` `revision/savedAt/latestLabel` (was `version/confirmedAt`), `part(projectId, key)` (no `version`), `createProject({version?})`, proposal item `anchor.version?` — `src/api/{caw,http}.ts`.
- `/start`: `project` alone is enough; a whole-number `version` is passed on, anything else left out; `version_not_confirmed` no longer a refusal (`src/app/start/page.tsx`).
- Header (`p/[id]/layout.tsx`): `data-label-tag` = `ป้าย {label}` / `ยังไม่มีป้าย`; at <768 it takes its own row (first try at 390 cut the project name to `จองห้…` — seen in the screenshot, fixed, re-shot). Projects chip (`page.tsx`): same words. Card (`CardView.tsx`): `data-cut-label` = `ตัดงานที่ป้าย {anchorLabel}` → else `anchor.version` when > 0 → else `ตัดงานก่อนมีป้าย`. Unreachable sentence: project layout when `!spec.reachable`, card view when `specRead.fromCache`. Chat page: `api.part(id, key)`, one read per distinct key.
- Q4 (D12): `CardView` takes `spec/specRead = null`; the card page, when `cardContext` is null (404 `anchor_removed`) and `card.anchorRemoved`, draws the card with the PM's sentence in place of the context (no timeline, no comment box, no Blueprint link). Board: a mark beside `spec เปลี่ยน` — one line, ellipsis, whole sentence in `title` (as TASK-120's). The board already loaded: http `cardContext` reads any 404 as `null`.
- Words (`src/words.ts`): new `labelWords` {tag, none, cutAt, cutBefore, blueprintUnreachable, anchorRemoved}; `startRefused.incomplete` = `ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์`; `chatRefused.anchor_not_in_version` = `…ไม่มีใน spec แล้ว — เริ่มงานไม่ได้`; dropped `projectCard.blueprintVersion` and `startRefused.version_not_confirmed` (grep first: only tests used them — updated). All wording is the PM's (REQ-105 table, Q3, Q4); none invented. Label words in the mock (`ฉบับร่างแรก`, `ฉบับตรวจรอบแรก`) are sample data like the rest of the mock.
- Mock: labels/`spec`/`specRead`, D7 (`workable` drops the spec-change term, `isStuck` too; adds `!anchorRemoved`), `part()`/`createProject()` without a version, seed card 8 cut before a label. New states (via `MOCK_STATES`, no route edit): `no-label`, `blueprint-down`, `anchor-removed` (card 9).
- Out-of-list one-line fixture adds, **approved by Silver (Q1)**: `RunsList.test.tsx`, `crew.test.ts` (`anchorLabel: null, anchorRemoved: false`), `readiness.test.ts` (`latestLabel: null, spec: {…}`).

**Changed existing assertions (listed as ordered):** `mock.test.ts` stuck count and `workable` rule (no spec-change term; `!anchorRemoved`); `mock.test.ts` part test (no `version`; `revision`/`latestLabel`); `mock-writes.test.ts` stuckCount 3→1 and the clearSpecChange count (`before−1`→`before`) and the two `version_not_confirmed` tests → `already_exists`/404 only; `mock-chat.test.ts:120` anchor compare; `http.test.ts` part tests (no `?version=`; fixture shape); `words.test.ts` (`blueprintVersion`, `startRefused`); `tests/projects.spec.ts` (chip words; `/start` cases: `?project=BP`, `&version=99`, `&version=abc` now reach the board; incomplete = no project); `tests/sample-data.spec.ts` (incomplete link is `?version=3`).
**New tests:** unit — `mock.test.ts` +5 (labels, no-label, blueprint-down, anchor-removed, spec change is only a mark), `words.test.ts` +1; e2e — `projects.spec.ts` +4 (start without version, header/list label, no-label, unreachable), `card.spec.ts` +2 (cut at/before, removed part: board loads with 12 cards, mark with full `title`, card sentence).

**DoD (my run, 2026-10-29 19:2x–19:30)**
1. `grep -c 'ป้าย' src/words.ts` → `4` ✓
2. `grep -n 'version' src/app/start/page.tsx` → header comment line 1 says version is optional; lines 24–26 `searchParams` type/`Number(version)`; line 32 passes it only when a whole number; nothing requires it ✓
3. `bun test src` → `340 pass · 0 fail`, `Ran 340 tests across 24 files` (base 334) ✓
4. `bun run typecheck; echo $?` → `0` ✓
5. `NEXT_DIST_DIR=.next-f bun run build` → exit `0` (twice: before and after the header fix) ✓
6. `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → `271 passed` (base 264, +7) ✓ — **honest note:** one earlier full run gave `269 passed`, 2 failed (`card.spec.ts:96`, `chat.spec.ts:149`, neither near my change); both pass alone (`2 passed`) and the next full run was `271 passed`. I did not find the cause: **UNVERIFIED — flake or load; a re-run by the SA settles it.**
7. Screenshots + metrics: `ai-worker/tests/harness/task-116/*.png` (18 files, 1280 and 390: header with/without a label, projects chip, card cut at/before a label, unreachable board + card, removed-part board + card), script `tests/harness/task-116-shots.mjs`. No sideways scroll in any of the 18 (`sideways=false`); tag boxes e.g. `label 151x26` @1280, `358x26` @390 (own row); removed sentence wraps whole on the card (`358x45`).
8. After: `ss -ltn | grep -E ':351[0-9]'` → no listener (3512 stopped by its pid); `git diff --stat -- tsconfig.json` → empty ✓.

**Not done / UNVERIFIED**
- `/impeccable audit` and `/simplify`: the `impeccable` skill is not in this session's skill list, so I could not run it — **UNVERIFIED — an `/impeccable audit` on the card page, header and board mark would settle it.** I reviewed the diff myself instead: no inline hex, no `transition-all`, no z-index in added lines (grep, no hit); new text uses existing tokens/classes; the unreachable and removed-part lines are `role="status"`, text not colour alone; hit targets are unchanged (nothing new is interactive).
- Real http path: all runs are on the mock; the http side is covered by `http.test.ts` only. **UNVERIFIED against a real caw-back** (no server started, per G1/G2; the SA offers a stub API if wanted).
- Observation, not a defect: on a card page while Blueprint is down the unreachable sentence shows twice (the project band and the card's own) — SPEC-107 asks for both places; say if one should go.
- Focus/hover states: nothing new is a control, so no new states to check.

## Questions

- **Q1 (Fanta → @Silver, 2026-10-29 19:2x) — three test fixtures outside the closed file list break `bun run typecheck` (DoD 4).** The generated `Card` now requires `anchorLabel` + `anchorRemoved` and `Project` requires `latestLabel` + `spec` (SPEC-107 § Consumers names `RunsList.test.tsx` and `crew.test.ts` for `specChangedVersion` but they are not in the closed list; `readiness.test.ts` is in neither). Typecheck output after my changes: `src/components/runs/RunsList.test.tsx(9,7) TS2739 missing anchorLabel, anchorRemoved` · `src/lib/crew.test.ts(9,62) TS2322` · `src/lib/readiness.test.ts(8,60) TS2322`. **Default I will apply once you say yes:** add exactly `anchorLabel: null, anchorRemoved: false` to the two Card fixtures and `latestLabel: null, spec: { revision: 0, reachable: true, lastPullAt: null }` to the Project fixture — one line each, nothing else in those files. Alternative: you add the three files to the list. Everything else in the TASK is done or in progress meanwhile.
  > answer: **yes, your default exactly** — `src/components/runs/RunsList.test.tsx`, `src/lib/crew.test.ts`, `src/lib/readiness.test.ts` join the list for those one-line fixture adds only (list them in Notes). SA ran `bun run typecheck` on your tree 2026-10-29 19:2x: those 3 + `tests/projects.spec.ts:13,58` (already yours — e2e under `tests/`). `grep -rln 'latestSeenVersion\|specChangedVersion' src --include=*.test.*` → those 3 + `mock{,-writes}.test.ts` (on the list): no other fixture. My gap: SPEC-107 called two of them "untouched" by behaviour without checking that the fixtures must still type. — Silver (SA) 2026-10-29 19:2x
  > on decisions: (a) **accepted**. (c) **accepted** (step 3 orders it). (b) no timeline/comment box on a removed-part card — **accepted for now** `[SA-decided]`: the card cannot be worked, the back serves notes only inside the 404'd context, and the PM's sentence tells the user to move or close it. Told the PM as a note; a notes route would be a new back TASK if the PM wants it. — Silver (SA) 2026-10-29 19:2x
  > (b) **final:** PM accepted it as is, no new TASK `[PM-decided]` (Porter 2026-10-29 19:20, REQ-105 § Questions last note). — Silver (SA)
- **Decisions I took (internal, cheap to reverse — veto if wrong):** (a) the removed-part card (D12) is the mock **state** `anchor-removed` (card 9), not a 13th card or a change to the default seed — the seed's 12-card counts that existing tests pin stay as they are; the default seed has one card cut before a label (card 8) and the labelled project. (b) A removed-part card page has **no timeline and no comment box**: caw-back sends a card's notes only inside the context, which answers 404, and "no activity" would be false. Say if you want a notes route instead (a back-end change, not mine). (c) The mock `isStuck` also drops the spec-changed term as ordered (TASK step 3), so `stuckCount` of the seed goes 4 → 2; I changed the assertions in `mock.test.ts` and `mock-writes.test.ts` accordingly (listed in Notes).

## Review
**Verdict: DONE** — Silver (SA), 2026-10-29 19:4x. Against SPEC-107 § Front, D7, D12, REQ-105 wording (table, Q3, Q4) and the Q1 answer.
- **Evidence re-run by me** on caw-front (HEAD f071c02 + this tree): `bun test src` → `340 pass · 0 fail · Ran 340 tests across 24 files`; `bun run typecheck` → `0`; `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → **`271 passed (2.6m)`**, no failure — the 269/2-failed run in the Notes did not repeat (`card.spec.ts:96`, `chat.spec.ts:149` both passed); I treat it as a load flake, not this change. After: `ss -ltn | grep -cE ':351[0-9] '` → `0`.
- **Scope:** `git status` = 24 paths, all on the list or the Q1 addition (`card.module.css` = CardView's own stylesheet; `tests/sample-data.spec.ts` holds a `/start` case, so it is an e2e spec covering start). `tsconfig.json` untouched (her DoD 8).
- **Screens:** looked at `tests/harness/task-116/card-removed-part-390.png` (PM's Q4 sentence whole, wraps in its box, `role="status"` icon + text; "ตัดงานที่ป้าย ฉบับร่างแรก" under it) and `header-with-label-390.png` (`ป้าย ฉบับตรวจรอบแรก` on its own row, name not cut; "spec เปลี่ยน" mark still shown, never stops the card — D7).
- **Decisions** a, b (PM final), c accepted (§ Questions). Words: every new string is from REQ-105 (table, Q3, Q4); none invented.
- **Observation (unreachable sentence twice on a card page while Blueprint is down):** **kept** — SPEC-107 § Front asks for both places (the band says the project, the card says its own text came from cache); not a defect.
- **UNVERIFIED (carried, not blocking):** `/impeccable audit` not available in her session (her own grep of added lines: no hex, no `transition-all`, no z-index); real http path vs a running caw-back not run (mock + `http.test.ts` only) → QA's joint run with Team A's TASK-113.
