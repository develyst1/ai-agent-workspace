# TASK-002: Vite demo — scaffold, engagement logic (tested), TV screens
- Source: SPEC-002 (§1–§4; REQ-002 AC-3, AC-4, AC-6, AC-7, AC-8 TV half)
- Owner: FE (Fern)
- Status: DONE (2026-10-28, SA review)
- Depends on: none (may run in parallel with TASK-001)
- Repo: `buddy-screen-spec`, folder `demo/` only — write access for this TASK only (DECISIONS 2026-10-28 19:58). **No git writes.** `buddy-screen-front` is not touched.

## What to do
1. Scaffold `demo/` with Vite + React + TypeScript (`npm create vite@latest demo -- --template react-ts`, run from the spec repo root), then add **Vitest** as a dev dependency. Scripts: `dev`, `build`, `test` (`vitest run`). Add `demo/.gitignore` with `node_modules/` and `dist/`. Remove the template's demo content and its external links/logos.
2. `demo/src/engagement.ts`: implement **exactly** the API and the transition table in SPEC-002 §2. It is pure, with no timers inside.
3. `demo/src/engagement.test.ts`: at least these cases, each driving `tick` second by second:
   - in frame and responding for 60 s → still `active`, counted 60;
   - in frame, silent from t=0 → `idle_present` after 10 ticks; `sleep` after 30 ticks in total; counted = 30, then frozen;
   - silent for 15 s, then responding → back to `active`, counting never stopped;
   - out of frame at t=0 → `idle_absent` immediately; counted stays 0; `sleep` after 20 ticks;
   - out of frame for 5 s, then back but silent → `idle_present`, counting resumes, `sleep` when 20 s of idle in total are reached.
4. `demo/src/fixtures.ts` and `demo/src/strings.ts` as in SPEC-002 §1 and §4. Every §13 string goes in verbatim with `source: '§13'`. Any other visible text gets `source: 'draft'` and is shown with a small **ร่าง** badge.
5. `demo/src/App.tsx`: an index page listing every screen (TV + parent groups; the parent group can stay empty for TASK-003), with hash-based navigation (`#/tv/sleep` …). No router library.
6. TV screens in `demo/src/screens/tv/`: `FirstNaming` (example names ปุยฝ้าย / ดาว / โบ๊ะ) · `FaceGestureRegistration` (placeholder box, **no camera access**, no `getUserMedia`) · `Sleep` · `NameCall` · `Invitation` (choose 1 of the 4 activities; fill `{activity}`) · `ActivityInProgress` · `OffTask` · `GoingToSleep` · `QuotaZero` (the AI explains kindly, then sleeps). **TV words are in requirement §13, including the rows the PM added 2026-10-28 20:10:** activity names · first-use naming · face registration · gesture registration · sleep screen · quota zero · overtime declined (shown on the TV). Only titles and button labels not in §13 are `draft`.
7. `ActivityInProgress`: shows state + counted `mm:ss`, driven by `tick` on a 1-second `setInterval`. A simulation panel holds two toggles (**Buddy in frame**, **Buddy responding**) and **End activity**.
8. Write in `README.md` (owned by TASK-001; add only the demo line if TASK-001 has not yet): `cd demo && npm install && npm run dev`.

## Definition of Done (run in `demo/`, paste each command + real output)
- [ ] `npm test` → all engagement tests pass (≥ 5 cases listed above).
- [ ] `npm run build` → exits 0, no TypeScript errors.
- [ ] `npm run dev`, then open `http://localhost:5173` in the browser **you can drive** (Playwright/Chrome) → index loads; **0 console errors**; each TV screen in step 6 is reachable from the index. Paste a list: screen → URL hash → loaded yes/no.
- [ ] AC-6 by hand on `ActivityInProgress`, with real timing: turn off *responding* → idle at ~10 s, sleep at ~30 s, counter frozen; restart and turn off *in frame* → counter stops at once. Paste the observed numbers.
- [ ] §13 text check, TV rows: `for s in "เรียกฉันรึเปล่า" "มาเล่นด้วยกันไหม วันนี้เรามี" "ตอนนี้ทำอะไรอยู่จ๊ะ" "งั้นพักก่อนนะ เรียกฉันได้ทุกเมื่อเลย" "ออกกำลังกาย" "ออกกำลังสมอง" "คุยกัน" "ฝึกคิด" "อยากเรียกฉันว่าอะไรดี" "มองกล้องนิ่งๆ แป๊บนึงนะ ฉันจะจำหน้าเธอไว้" "มาตั้งท่าลับของเรากัน ทำท่าให้ดูหน่อย" "เรียกชื่อฉันได้เลยนะ" "วันนี้เล่นครบเวลาแล้วนะ พรุ่งนี้มาเล่นกันใหม่นะ" "วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย"; do grep -qF "$s" src/strings.ts && echo "OK $s" || echo "MISSING $s"; done` → 14 × `OK`, no `MISSING`.
- [ ] No camera / network code: `grep -rnE "getUserMedia|fetch\(|XMLHttpRequest|WebSocket|https?://" src index.html` → no output, or only comments (paste).
- [ ] `git -C .. status --porcelain` shows only `demo/` (plus TASK-001's files if done); `git log --oneline -1` is still `0e6e911`.

## Implementation Notes
2026-10-28, Fern (FE). Repo `buddy-screen-spec`, `main`, HEAD `0e6e911` before and after. Only `demo/` touched by this TASK. `buddy-screen-front`: `git status --porcelain` empty.
Stack as SPEC-002 §1: Vite 8.3.5 + React 19 + TS + Vitest 5.0.5, plain CSS, hash routing, no other dependency. Template content, assets, `public/` and `README.md` removed; `index.html` has `lang="th"`, an empty `data:,` favicon (the 404 on `/favicon.ico` was the one console error, fixed) and no external link. `server.port` fixed to 5173 (strictPort). `.gitignore` is the template's (has `node_modules`, `dist`).
Files: `src/engagement.ts` (SPEC §2 API + table; one extra export `endActivity` for the **End activity** button) · `src/engagement.test.ts` (8 cases) · `src/fixtures.ts` · `src/strings.ts` (22 §13 strings `source:'§13'`; the rest `draft`) · `src/ui.tsx` (`T`, `S`, `TvStage`, `PhoneFrame`) · `src/App.tsx` · `src/screens/registry.tsx` · `src/screens/tv/*` (9 screens).

- `npm test` (in `demo/`): `Test Files 1 passed (1) · Tests 8 passed (8)` — the 5 ordered cases + leave-frame-while-idle, back-in-frame-responding, End activity.
- `npm run build`: `tsc -b && vite build` → `✓ built in 458ms`, no TS errors (last run after the final CSS edit).
- Browser (Playwright-core driving system Chrome, harness `ai-worker/tests/harness/fern/walk.mjs`, viewport 375×667): index lists all screens; every TV screen `loaded=yes`, `horizontalOverflowPx=0`, no button under 44 px; `console errors: 0 []`:
  first-naming · face-gesture-registration · sleep · name-call · invitation · activity-in-progress · off-task · going-to-sleep · quota-zero — all `#/tv/<id>` → loaded yes.
- AC-6 with real timing (`ac6.mjs`, 1280×720). Responding off: t≈9 s `active 00:09` · t≈11 s `idle_present 00:11` · t≈29 s `idle_present 00:29` · t≈31 s `sleep 00:30` · t≈36 s `sleep 00:30` (frozen). In-frame off after 3 s counted: t≈1/3/8/19 s `idle_absent 00:03` (counter stopped at once) · t≈22 s `sleep 00:03`.
- §13 TV rows: 14 × `OK`, 0 `MISSING`.
- `grep -rnE "getUserMedia|fetch\(|XMLHttpRequest|WebSocket|https?://" src index.html` → no output (exit 1).
- `git -C .. status --porcelain` → ` M README.md`, `?? REQUIREMENTS-V1.md`, `?? demo/`, `?? diagrams/`; `git log --oneline -1` → `0e6e911 Initial commit`.

Decisions (FE-internal, SA may veto): (1) `activityInProgress` also shows the §13 off-task line in `idle_present` and the going-to-sleep line in `sleep`, so the states are visible on the TV. (2) `QuotaZero` has a draft **ถัดไป** button that swaps to the §13 sleep-screen line (the "explains kindly, then sleeps" order). (3) Counted at the exact switch second: `idle_present`→sleep counts that second (table: "yes until the switch"), `idle_absent`→sleep does not. (4) The `ร่าง` badge on filled primary buttons now inherits the button colour (was invisible in the first screenshot).
UNVERIFIED — look of the screens on a real TV at 1080p (I viewed 1280×720 and 375×667 screenshots only); owner's design approval is not claimed. Chrome only; no other browser run.

## Questions

## Review
**2026-10-28 — the SA — verdict: DONE.**
Re-run by the SA in `demo/`: `npm test` → `Tests 8 passed (8)` · `npm run build` → `✓ built in 544ms` · TV + parent §13 loop → 22 × OK · network/camera grep → no output (exit 1) · Fern's `walk.mjs` against a fresh `npm run dev` → 19 screens `loaded=yes`, overflow 0, `console errors: 0`, origins `['http://localhost:5173']` · Thai literals outside `strings.ts` → only the ร่าง badge in `ui.tsx` · git status as expected, HEAD `0e6e911`, `buddy-screen-front` clean.
`engagement.ts` read against SPEC-002 §2 row by row: matches (idle_present→sleep counts the switch second, idle_absent→sleep does not; idle clock shared across present/absent). Tests cover all 5 required cases + 3 more.
AC-6 real timing: accepted from the FE's `ac6.mjs` output (idle ~10 s, sleep at 00:30 frozen, out-of-frame stops at once); the logic is unit-tested, so not re-timed.
FE decisions (1)–(4) and the extra `endActivity` export: accepted.
UNVERIFIED (as the FE says): a real 1080p TV; owner's design approval is not claimed.
