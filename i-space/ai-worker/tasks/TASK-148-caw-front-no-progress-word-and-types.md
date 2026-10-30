# TASK-148: caw-front — `no_progress` stop word + gen:api (REQ-119)
- Source: SPEC-116 § Front (D2, D3)
- Owner: FE (Fanta)
- Status: DONE (2026-10-30 17:2x, Silver — § Review)
- Depends on: TASK-147 `openapi.json` · REQ-117 front committed (`b4f2659`) ✓

## What to do
Repo `caw-front`, branch `atom`, base `b4f2659`. **No git.** Read SPEC-116 D2 and § Front.
1. `src/api/caw.ts:16` — `StopReason` + `"no_progress"`.
2. `src/words.ts:108-115` — `stopReason.no_progress: "มีงานที่ยังทำต่อได้ แต่ไม่คืบ"` (PM's Q2 default — if the PM changes it in SPEC-116 § Questions before you start, use the PM's words). The strip then reads `การรันหยุดแล้ว: มีงานที่ยังทำต่อได้ แต่ไม่คืบ · กด อัตโนมัติ เพื่อเริ่มรอบใหม่` (`runStopped` `:122`, unchanged).
3. `bun run gen:api` (reads `../caw-back/openapi.json` from TASK-147) → `src/api/schema.d.ts` gains `no_progress` (×2) and `handOffTo`; nothing else in its diff.
4. Tests that list every reason: `src/components/runs/RunsList.test.tsx:13`, `src/words.test.ts:26` → add `no_progress`. `src/api/mock.ts`: no change unless `typecheck` asks.
Closed file list: `src/api/caw.ts`, `src/words.ts`, `src/words.test.ts`, `src/api/schema.d.ts`, `src/components/runs/RunsList.test.tsx`. Anything else → `## Questions`.

## Definition of Done
- [ ] 1. Before: `git status --short | wc -l` → `0` (base: `0` on `b4f2659`, SA 15:5x)
- [ ] 2. `grep -c no_progress src/api/caw.ts src/words.ts src/api/schema.d.ts` → each ≥ 1 (base: all `0`, SA 15:5x)
- [ ] 3. `cmp <(bunx openapi-typescript ../caw-back/openapi.json) src/api/schema.d.ts && echo match` → `match` (base: `match` on `b4f2659` + caw-back `4cc3241`, SA 15:5x)
- [ ] 4. `bun run typecheck` → exit `0` (base: `0`, SA 15:5x)
- [ ] 5. `bun test src` → `0 fail`, `no_progress` in the reason tests (base: `Ran 355 tests across 26 files`, `0 fail`, SA 15:5x)
- [ ] 6. `NEXT_DIST_DIR=.next-f bun run build && NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → `0 failed` (base: `276 passed` — QA's TEST-113 run on `b4f2659`; not re-run at cut)
- [ ] 7. After: `git status --short --untracked-files=all` → only the closed list (base: n/a — new)

## Implementation Notes
Fanta (FE, B), 2026-10-30. `caw-front`, branch `atom`, HEAD `b4f2659` before and after, no git. Before: `git status --short | wc -l` → `0`. After: 5 modified, all on the closed list; `tsconfig.json` untouched.

**What changed:** `caw.ts:16` `StopReason` + `"no_progress"` · `words.ts` `stopReason.no_progress = "มีงานที่ยังทำต่อได้ แต่ไม่คืบ"` (PM's Q2, accepted 16:2x; `runStopped` unchanged) · `gen:api` → `schema.d.ts` +9/−2: `no_progress` ×2 and `handOffTo`, one doc line on the hand-off param, nothing else · `words.test.ts` and `RunsList.test.tsx` list `no_progress`. `mock.ts`: no change (typecheck did not ask).

**One extra edit inside a listed file:** `RunsList.test.tsx:30` had `toHaveLength(6)` (the count of reasons); it failed at 7, so it is now `REASONS.length`. Same test, same file on the list.

**DoD (my run, 2026-10-30)**
1. `git status --short | wc -l` before → `0` ✓
2. `grep -c no_progress src/api/caw.ts src/words.ts src/api/schema.d.ts` → `1`, `1`, `2` ✓
3. `cmp <(bunx openapi-typescript ../caw-back/openapi.json) src/api/schema.d.ts && echo match` → `match` ✓
4. `bun run typecheck; echo $?` → `0` ✓
5. `bun test src` → `355 pass · 0 fail`, `Ran 355 tests across 26 files` (count unchanged: reason lists, no new test) ✓
6. `NEXT_DIST_DIR=.next-f bun run build` → `0`; `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → `276 passed (2.6m)` ✓
7. After: `git status --short --untracked-files=all` → the 5 listed paths; `ss -ltn | grep -cE ':351[0-9] '` → `0` ✓

**UNVERIFIED:** `/impeccable audit` and `/simplify` (skill absent in this session, as before) · the strip with `no_progress` on a screen (no mock state makes a run stop that way and none is on the list; the word is pinned by the unit tests) · real caw-back.

## Questions

## Review
**DONE** (Silver, 2026-10-30 17:2x) against SPEC-116 § Front and the evidence.
- **Scope:** `git status --untracked-files=all` → the 5 closed-list files only.
- **Read:** `StopReason` + `no_progress` (`caw.ts`); `stopReason.no_progress = "มีงานที่ยังทำต่อได้ แต่ไม่คืบ"` = the PM's Q2 word; `schema.d.ts` diff = `no_progress` ×2, `handOffTo`, the `toWorkerId` description; `RunsList.test.tsx` lists all 7 reasons and counts `REASONS.length`; `words.test.ts` + the new word.
- **My re-run:** `bun run typecheck` → `0` · `bun test src` → `355 pass · 0 fail · Ran 355 tests across 26 files` · `cmp <(bunx openapi-typescript ../caw-back/openapi.json) src/api/schema.d.ts` → match. e2e: her `276 passed (2.6m)` accepted (real output in the Notes; base 276).
- Accepted UNVERIFIED: the strip with `no_progress` on a live screen — the word renders through the same `runStopped` path as every reason, and `RunsList.test.tsx` renders it; QA sees it in the stub run.
