# TASK-158: caw-front — gen:api for the team's sessions; the live screen shows "ว่าง · เปิดรอรับงาน" and keeps watching (REQ-122)
- Source: SPEC-120 D6.1 (paired front, spec-rules §2) + D6.3
- Owner: FE (Fanta)
- Status: DONE (2026-10-30 20:3x, Silver — § Review) · was REVIEW (Fanta, 2026-10-30) — was: IN_PROGRESS — was: TODO — released 2026-10-30 20:2x, Silver (TASK-157 DONE; its `openapi.json` is final; caw-front still clean on 04e2874)
- Depends on: TASK-157 (openapi.json) · REQ-121 front committed (04e2874) ✓
- Git: none

## What to do
Closed file list (caw-front): `src/api/schema.d.ts` (by `bun run gen:api` only), `src/api/caw.ts`, `src/api/mock.ts`, `src/api/http.test.ts`, `src/api/mock.test.ts`, `src/lib/screen.ts`, `src/lib/screen.test.ts` (new), `src/components/screen/WorkerScreen.tsx`, `src/words.ts`.

1. `bun run gen:api` against caw-back's new `openapi.json`. `src/api/caw.ts`: `TeamStatus` gains `sessions: TeamSession[]`, where `TeamSession = { projectId: string; workerId: string; state: "idle" | "busy" }` (exact casing). Update the comment on `teamStatus()`.
2. **Mock** `src/api/mock.ts:764-765`: both answers carry `sessions`, `[]` by default. The `MockRunner` gets `setSessions(list)` (stored; returned only while `teamRunning`). Fix the probe's 3 test hits (`http.test.ts:313,318`, `mock.test.ts:219`) by adding `sessions`.
3. **`src/lib/screen.ts`**: `ScreenAnswer` gains `open: boolean`. `screenOf` reads `api.teamStatus()` **beside** the hops (`Promise.all`). `open = running && sessions.some(s => s.projectId === projectId && s.workerId === workerId)`. A teamStatus read that throws → `open: false`, and the rest of the answer still comes back.
4. **`WorkerScreen.tsx`**: line 48: `again = !a.hop || a.hop.endedAt === null || a.more || a.open`. Keep `open` in the view. Header: when `open` and no running hop → `<span … data-idle>{screen.idle}</span>`, styled like `data-live` but neutral (`bg-sheet`/`text-ink2` family, not `now`). It replaces `screen.empty`; with an ended hop it is shown **with** `screen.finished`/`started`. A running hop shows `screen.live` as today. The new hop's lines arrive through the existing "newest hop changed" path, with no other change.
5. **`src/words.ts`** `screen.idle: "ว่าง · เปิดรอรับงาน"` with a comment `// REQ-122: the worker's CLI is open and waiting (PM's table)`. No placeholder.
6. **`src/lib/screen.test.ts`** (new), against the mock: (a) no session → `open:false`; (b) `setSessions([{this project, this worker, idle}])` → `open:true`; (c) a session of another project or worker → `false`; (d) team down → `false`.

## Definition of Done
From caw-front.
- [ ] 1. `git status --short` → only closed-list paths (base: empty, SA 19:5x on 04e2874)
- [ ] 2. `bun run gen:api` then `git diff --stat src/api/schema.d.ts` → `TeamSession` + `sessions` only (base: n/a — new: needs TASK-157's openapi.json)
- [ ] 3. `bun run typecheck` → exit 0 (base: exit 0, SA 19:5x; probe with the new openapi + no fixes: exit 2, 4 hits)
- [ ] 4. `bun test src` → 0 fail, ≥ 359 tests (base: `355 pass · 0 fail`, SA 19:5x)
- [ ] 5. `bun test src/api/http.test.ts src/api/mock.test.ts` → 0 fail (base: `77 pass · 0 fail`, SA 19:5x)
- [ ] 6. `git check-ignore -v src/lib/screen.test.ts` → exit 1, no output (base: exit 1, SA 19:5x)
- [ ] 7. Seen in the running app (mock: `bun run dev` with the mock, `setSessions` via the test hook or a stubbed state): a screenshot of the screen sheet showing `ว่าง · เปิดรอรับงาน` → saved under `ai-worker/tests/harness/task158/` (base: n/a — new words). If the mock state cannot be set from the browser, write `UNVERIFIED — <why>`, and QA's stub run settles it.

## Implementation Notes
Fanta (FE, B), 2026-10-30. `caw-front`, branch `atom`, HEAD `04e2874` before and after, no git. Before: `git status --short | wc -l` → `0`. After: 8 modified + 1 new (`src/lib/screen.test.ts`), all on the closed list; `tsconfig.json` untouched.

**What changed:** `gen:api` → `schema.d.ts` +12/−1: `TeamSession`, `TeamStatus.sessions`, plus an optional `sessions?` on the runner check-in body and one reworded doc line (both come with TASK-157's `openapi.json`) · `caw.ts` `TeamSession` type + the `teamStatus()` comment · `mock.ts` `sessions` on both answers (`[]` by default, always `[]` while the team is down), `MockRunner.setSessions(list)`, and a new state `idle-session` (มิ้นท์, who has no hop, has her CLI open) so the sheet can be shown from a browser (DoD 7) · `screen.ts` `ScreenAnswer.open`; `teamStatus()` is read beside the hops with `Promise.all`; a throwing read → `open:false`, the rest still comes back · `WorkerScreen.tsx` `again` also stays true while `open`; header chip `data-idle` (neutral: `border-hair`/`text-ink2`, not `now`) when open and no running hop; it replaces `data-none`, and with an ended hop it sits with `finished`/`started` · `words.ts` `screen.idle: "ว่าง · เปิดรอรับงาน"` with the REQ-122 comment · tests: `screen.test.ts` (new, 5: none / this project+worker / another project or worker / team down / status throws) · `mock.test.ts` +1 (sessions) and `sessions: []` in the existing status test · `http.test.ts` `sessions: [] as never[]` on the two bodies.

**Two things beyond the letter of the TASK, both inside listed files:** the `idle-session` state (step 2 only named `setSessions`; DoD 7 asked for a browser state "or a stubbed state") · `as never[]` on the http test bodies (plain `[]` under `as const` is readonly and typecheck refused it).

**DoD (my run, 2026-10-30)**
1. `git status --short` → only the 9 closed-list paths ✓
2. `git diff --stat src/api/schema.d.ts` → `12 insertions(+), 1 deletion(-)`: `TeamSession` + `sessions` (and the two small items above) ✓
3. `bun run typecheck; echo $?` → `0` ✓
4. `bun test src` → `361 pass · 0 fail`, `Ran 361 tests across 27 files` (base 355; +5 screen, +1 mock) ✓
5. `bun test src/api/http.test.ts src/api/mock.test.ts` → `77 pass · 0 fail` ✓
6. `git check-ignore -v src/lib/screen.test.ts` → exit `1`, no output ✓
7. Seen in the running app: `tests/harness/task158/screen-idle-390.png` and `screen-idle-1280.png` (script `tests/harness/task-158-shot.mjs`, state `idle-session`, light). I opened the 390 one: title `หน้าจอของ มิ้นท์`, under it a quiet bordered chip `ว่าง · เปิดรอรับงาน`, no `ยังไม่ได้เริ่มทำงาน`; the script printed the chip text, `none line: 0`, `sideways: false` at both widths ✓ (I did not open the 1280 PNG). My first shot caught the sheet mid-slide; I re-shot after it settled.
Also: `NEXT_DIST_DIR=.next-f bun run build` → `0`; `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → `276 passed (2.7m)`; `ss -ltn | grep -cE ':351[0-9] '` → `0` (3512 stopped by its pid).

**UNVERIFIED:** `/impeccable audit` and `/simplify` (skill absent in this session, as before) · the chip while a hop is running or just ended, and the poll staying alive after the last line (only the idle-without-hop case was shot; the `again` line is read, not run — no e2e drives `setSessions`) · a real caw-back/runner sending `sessions` (QA's stub run).

## Questions

## Review

**2026-10-30 20:3x, Silver — DONE.**
- Re-run by me on caw-front 04e2874 + 9 paths (`git status --untracked-files=all` = the closed list exactly; `screen.test.ts` `??`): typecheck exit 0 · `bun test src` → `361 pass · 0 fail`, 27 files · `screen.test.ts` 5/0 · `gen:api` again → `schema.d.ts` byte-identical (`cmp`), so it is generated from TASK-157's final `openapi.json`.
- Diff = SPEC-120 D6.3: `screenOf` reads `teamStatus()` beside the hops (a failed read → `open:false`, the hops answer still comes back); `again` adds `a.open`; the `data-idle` chip shows when open and no running hop, and replaces `data-none`; `screen.idle` = the PM's words verbatim. I opened `tests/harness/task158/screen-idle-390.png`: `หน้าจอของ มิ้นท์`, under it the neutral bordered chip `ว่าง · เปิดรอรับงาน`, no `ยังไม่ได้เริ่มทำงาน`.
- The two extras are accepted: the `idle-session` mock state is in a listed file and is what DoD 7 asked for; `as never[]` is a test-only typing fix. The `live:` comment alignment changed by whitespace only.
- UNVERIFIED as Fanta wrote: the chip next to a running or ended hop, and the poll staying alive with `open`, are read but not run → QA's AC-5 stub run (TASK-160's runner sends `sessions`). tree-fp 20:39: caw-front `3ce60b3d3217`.
