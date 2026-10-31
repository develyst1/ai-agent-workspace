# TASK-106: caw-front — a read-only "screen" per worker (REQ-104)
- Source: SPEC-103 (REQ-104 AC-1, AC-2, AC-4, AC-5, AC-6 view side, AC-7)
- Owner: FE (Fanta)
- Status: DONE (2026-10-29, Silver — § Review round 2)
- Depends on: DoD 1–5 and 7–8 none (the mock) · **DoD 6 (http) after TASK-105 is DONE** (it needs the new `openapi.json`)
- Repo: `caw-front` on `atom` @ 4b58bf3. **You change code; you never run git.**

## Read first

`specs/SPEC-103-caw-live-cli-view.md` § caw-front, § API (the Entry shape, exact field names), § Guardrails (G5: build only into
`.next-f`). REQ-104 § User-facing wording is the only source of the words. Use no word that is not there or in SPEC-103 Q1's
answer.

## What to do

Build SPEC-103 § caw-front as written: types, mock, the `screenOf` server action, `WorkerScreen`, the two "ดูหน้าจอ" buttons and
the words.

Closed file list: `src/api/caw.ts` · `src/api/mock.ts` · `src/api/mock-screen.test.ts` (new) · `src/api/http.ts` ·
`src/api/schema.d.ts` (regenerated, DoD 6) · `src/lib/screen.ts` (new) · `src/components/screen/WorkerScreen.tsx` (new) ·
`src/components/CrewStrip.tsx` · `src/components/Board.tsx` (only if the strip needs the project id / workers passed) ·
`src/components/team/PersonDrawer.tsx` · `src/components/team/Team.tsx` (only to pass what the drawer needs) · `src/words.ts` ·
`src/words.test.ts` · `tests/screen.spec.ts` (new).

## Definition of Done

Paste each command and its real output (trimmed) in `## Implementation Notes`.

- [ ] **1. Base.** `git status --short` (→ empty); `bun test src` → 328 pass; typecheck clean.
- [ ] **2. Types + mock.** `HopOutputEntry`, `HopOutput`, `CawApi.hopOutput` exactly as the SPEC. `src/api/mock-screen.test.ts`
      proves: the running hop's entries grow with time (fake clock); a finished hop's entries are fixed and one holds a `gap`
      of 12 s; `after` and `limit` work; a hop with no output → `entries: []`.
- [ ] **3. View.** `WorkerScreen` as the SPEC: title, live badge, start/end, empty state, gap and truncated lines, scroll
      stays at the bottom, polls every 2 s only while open, visible and running, and stops after the end. No input of any kind.
- [ ] **4. Words.** A `screen` group in `words.ts` with the PM's six lines + SPEC-103 Q1's two (**wait for Q1's answer** for
      those two; everything else can go first). `words.test.ts` pins them.
- [ ] **5. Entry points.** "ดูหน้าจอ" on every crew-strip seat (separate from the seat's filter press: pressing it opens the
      view and does **not** change the filter) and in `PersonDrawer`. On the board with no click: no `[data-screen]` in the DOM.
- [ ] **6. http (after TASK-105 DONE).** `bun run gen:api`, then `http.ts` `hopOutput` over it. `git diff --stat src/api/schema.d.ts`
      shows only additions for the two paths. Then, with TASK-105's dev script running (the SA or Bob starts it, stub only —
      you never start a runner), run `CAW_API_URL=http://127.0.0.1:4530 bun run dev` (`NEXT_DIST_DIR=.next-f`). Open the
      project, click "ดูหน้าจอ" on the worker: lines arrive without a reload. Paste a screenshot path + the times.
- [ ] **7. e2e on the mock.** `tests/screen.spec.ts`:
      - board loaded → no `[data-screen]`;
      - click "ดูหน้าจอ" on the running seat → the sheet opens with "สด", and a new line appears within 5 s with no reload;
      - inside the sheet there is no `input` / `textarea` / `[contenteditable]`;
      - a worker whose newest hop has ended shows "จบงานเมื่อ" and the start time;
      - the gap line shows its sentence;
      - a worker with no hop → "ยังไม่ได้เริ่มทำงาน".
      Then the whole suite: `NEXT_DIST_DIR=.next-f bun run build` and
      `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → 257 + yours, all pass (G6).
- [ ] **8. Unit + types.** `bun test src` → 328 + yours, 0 fail; `bun run typecheck` clean.
- [ ] **9. After.** `git status --short` lists only files in the closed list (plus git-ignored build output); `tsconfig.json`
      **not** in it (G5). Nothing left on :3500 / :3510.

## Implementation Notes

Fanta · 2026-10-29 12:53–13:07 · `caw-front` on `atom` @ 4b58bf3 · no git write · no live Claude CLI · `gen:api` NOT run (DoD 6) · builds only into `.next-f`.
**State: DoD 1–5, 7–9 done. DoD 6 (http) NOT DONE — waiting for TASK-105** (it was `IN_PROGRESS` with Bob when I checked at 13:03; `grep -c 'hops/{hopId}/output' caw-back/openapi.json` → `0`, so `gen:api` has nothing to read). Everything else is reviewable now.

### 1. Base (12:55, before any edit)
```
$ git status --short → (empty)        $ git log -1 --oneline → 4b58bf3 chore: add merge and release workflows
$ bun test src → 328 pass · 0 fail    $ bun run typecheck → no output (clean)   [first run of the session, 2.4 s, same as TASK-104]
```

### 2. Types + mock
`src/api/caw.ts`: `HopOutputEntry`, `HopOutput`, `CawApi.hopOutput(hopId, { after?, limit? })` exactly as SPEC-103 § API (field names, `kind` union, `gapSeconds: number | null`).
`src/api/mock.ts`: `screenOutput(hop, now)` worked out on read — running hop: one more `line` every 2 s since `startedAt` (seq 0 = `● session mock`, then `▸ Read src/step-n.ts`, capped at 5000); finished seeded hop `h-1` (ปลา's newest): 5 entries with a `gap` of 12 s between lines (seq 2); `h-5`: `entries: []`; other finished hops: 3 lines. Unknown hop → `CawError(404, "not_found")`. `after` default −1, `limit` default 500 (clamped 1..1000), `more` = rest > limit.
`src/api/mock-screen.test.ts` (new, 5 tests, clock wound with `setSystemTime`): grows 1 → 4 entries between +0.5 s and +6.5 s and earlier lines never change · finished hop identical an hour later, one `gap` of 12 with a `line` on each side · `after` / `limit` / `more` · `entries: []` · 404.
```
$ bun test src/api/mock-screen.test.ts → 5 pass · 0 fail · 22 expect() calls
```

### 3. View — `src/components/screen/WorkerScreen.tsx` (client) + `src/lib/screen.ts` (`"use server"`, `screenOf(projectId, workerId, after)`)
As SPEC: non-modal right `Sheet` like `PersonDrawer`; title `หน้าจอของ {name}`; `สด` badge while the hop runs (`[data-live]`), otherwise `จบงานเมื่อ {time}` (`[data-ended]`) and `เริ่มเมื่อ {time}` (`[data-started]`); no hop → `ยังไม่ได้เริ่มทำงาน` (`[data-none]`); lines in a monospace `role="log"` area (`aria-live="off"`, focusable for keyboard scrolling); `gap` → `screen.gap(n)`, `truncated` → `screen.truncated`; stays at the bottom unless scrolled up (checked: `atBottom: true` in all six runs below); no `input` / `textarea` / `contenteditable` / send button (asserted in e2e). Marked `data-screen`.
Polling: own loop, **every 2 s (`SCREEN_POLL_MS`) only while mounted (= opened), the tab is visible and the hop runs or `more`**; stops when the hop has ended and `more` is false; the first look or a changed newest hop restarts from `after = -1`; a failed poll keeps what is shown. Nothing is mounted until ดูหน้าจอ is pressed.
- **Deviation 1 (SPEC says `startPoller`):** `src/lib/livePoll.ts` has a fixed 3 s (`POLL_MS`, `:22`) and is **not in the closed file list**, so I wrote the 2 s loop inside `WorkerScreen`. With 3 s the SPEC's budget (≤ 1 s flush + ≤ 2 s poll) would have become 4 s+render against AC-1's 5 s. Decided by me (internal, not user-visible); say if you prefer a change to `livePoll.ts` as its own TASK.
- **Deviation 2 (no hop yet):** with no hop the sheet keeps polling every 2 s so a hop that starts while it is open appears. SPEC says "stops after the end" only; this case it does not say. Cheap to change.
- **Sheet width:** the shared `SheetContent` class `data-[side=right]:sm:max-w-sm` beats a plain `sm:max-w-[560px]` (my first build showed 281 px / 384 px — the same cap `PersonDrawer`'s 420 px gets). I override it with `data-[side=right]:w-full data-[side=right]:sm:max-w-[560px]`: full width below 640, 560 px above.

### 4. Words — `src/words.ts` `screen` group (8 rows) + `src/words.test.ts`
`watch` ดูหน้าจอ · `title(name)` หน้าจอของ {name} · `empty` ยังไม่ได้เริ่มทำงาน · `live` สด · `gap(n)` ขาดช่วง {n} วินาที — ระหว่างนี้ไม่ได้รับข้อมูล · `finished(t)` จบงานเมื่อ {t} · `started(t)` เริ่มเมื่อ {t} · `truncated` ยาวเกิน 5,000 บรรทัด — ส่วนที่เกินไม่ได้แสดง — copied from REQ-104 § User-facing wording (last two rows = SPEC-103 Q1's answer, Porter 2026-10-29). The close button reuses the existing `teamPage.close` (`ปิด`). Times use the app's own `Intl.DateTimeFormat("th-TH", …, Asia/Bangkok)` as `CardView` / `Chat` do. No other string was written. `words.test.ts` pins all 8 (1 new test).

### 5. Entry points
`CrewStrip` (`projectId` now a prop; `Board` passes it): every seat `<li>` gets a second button `[data-watch="{name}"]` under the seat's filter button, `aria-describedby` = the seat's name (so six identical "ดูหน้าจอ" are told apart without new words); the filter button keeps `aria-pressed` and is untouched — the `<li>` became `flex flex-col` and the filter button `flex-1` instead of `h-full` so both fit. `PersonDrawer` (`projectId` now a prop; `Team` passes it): an outline button `[data-watch]` in its own section under the header; closing/changing the person closes the screen. Board with no click: `[data-screen]` count 0 (e2e 1).
**Visible change to look at:** each crew-strip seat is now 44 px taller (the new button row). e2e AC-5 (every screen × 3 widths × light/dark) still passes, but this is a visual decision — see § Questions.

### 6. http (DoD 6) — NOT DONE, blocked on TASK-105
`src/api/http.ts` has `hopOutput: () => Promise.reject(new CawError(501, "not_implemented", …))` with a comment, so `CawApi` is complete and typecheck passes. `bun run gen:api` not run (it needs caw-back's new `openapi.json` and writes the tracked `schema.d.ts`, G4). When TASK-105 is DONE I will: `gen:api`, replace the stub, show `git diff --stat src/api/schema.d.ts` (additions for the two paths only), then run against Bob's stub dev script on :4530 and paste a screenshot path + times. `UNVERIFIED` until then: that the real `GET /v1/hops/{hopId}/output` shape matches what `screenOf` reads, and the 2 s loop against a real back end.

### 7. e2e on the mock — `tests/screen.spec.ts` (new, 7 tests)
closed board → no `[data-screen]` and one `[data-watch]` per seat · ฝน (running): sheet opens, `สด`, a new line within 5 s with no navigation, her seat's `aria-pressed` stays `false` and the card count is unchanged · no `input, textarea, [contenteditable]` inside · ปลา (finished): `[data-live]` absent, `เริ่มเมื่อ` + `จบงานเมื่อ`, the gap line equals `screen.gap(12)`, line count unchanged after 2.5 s · มิ้นท์ (no hop): `ยังไม่ได้เริ่มทำงาน` · `ปิด` removes the sheet · team page (operator-like seed): drawer has ดูหน้าจอ, nothing open before, pressing it opens that person's screen.
```
$ NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bunx playwright test tests/screen.spec.ts → 7 passed (10.0s)
$ NEXT_DIST_DIR=.next-f bun run build → ✓ Compiled successfully (server action with an exported interface accepted)
$ NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e   (13:04 → 13:07, after the last code change)
  264 passed (2.7m)   exit 0     — 257 + 7, none failed, none skipped
```

### 8. Unit + types (13:04)
```
$ bun test src → 334 pass · 0 fail · 1325 expect() calls · Ran 334 tests across 24 files   (328 + 5 mock-screen + 1 words)
$ bun run typecheck → no output (clean)
```

### Opened in the running app (`CAW_API=mock bunx next start -p 3500`, `.next-f`), throwaway script `tests/harness/task-106-screen-check.mjs` + results/screenshots in `tests/harness/task-106/` (`result.json`, `screen-375.png`, `screen-768.png`, `screen-1280.png`), 13:02, real Chrome
Per width, with and without reduced motion (6 runs): sideways scroll before and after opening = **0** at 375 / 768 / 1280 · ดูหน้าจอ button **44 px** high (279 / 239 / 410 wide) · close button **44 × 44** (it was 40 × 44 on the first run; I added `min-w-11`) · sheet **375×800 / 560×900 / 560×900** · lines area `atBottom: true`, no horizontal overflow inside it · a real Tab reaches the seat's button, `:focus-visible` matches and shows the repo Button's 3 px accent ring. Screenshots show the lines starting below the header, newest at the bottom, no sideways scroll at 375.
Not exercised: dark mode and 390/1440 for this sheet (the shared tokens are used, no colour of my own: `text-stuck`, `text-now`, `bg-now-soft`, `text-ink*`) → `UNVERIFIED — tests/ac5.spec.ts does not include the sheet; add it as a screen there if you want it in the AC-5 sweep`.

### Craft checklist (role-fe § 3), honestly
- **Closed file list:** `git status --short` after → `M` caw.ts, http.ts, mock.ts, Board.tsx, CrewStrip.tsx, PersonDrawer.tsx, Team.tsx, words.test.ts, words.ts · `??` mock-screen.test.ts, components/screen/, lib/screen.ts, tests/screen.spec.ts — all in the list; `tsconfig.json` **not** in it (G5); `schema.d.ts` untouched (DoD 6). `git diff --stat`: 9 files, +102/−13 (+ the 4 new paths).
- **Tokens:** grep of the diff and the new files for hex colours, `transition-all`, `z-[`, `font-family`, inline `style=` → none. `font-mono` is Tailwind's utility.
- **States:** loading = before the first answer the header shows nothing and the area is empty (no copy exists for "loading" and I did not invent any) · empty = `ยังไม่ได้เริ่มทำงาน` (no hop); a running hop with 0 lines yet shows an empty area · error = a failed poll keeps what is shown, no message (REQ has no wording for it) · success = lines. If you want an error/loading sentence, the PM must supply the word.
- **`/impeccable audit`: NOT RUN** — the `impeccable:impeccable` skill is not in my session's skill list (role-fe § 5 makes it mandatory), so I cannot claim it. `UNVERIFIED — an operator or a session that has the skill runs it on the crew strip and the sheet`. I also did not run `/simplify`; I reviewed the diff by eye instead (one new component, one action, no new dependency).
- **Footprint:** no records or accounts created; git-ignored `.next-f/`, `test-results/`, `next-env.d.ts`; both servers I started were stopped by pid (`ss … :3500|:3510` → nothing).

### REWORK round 1 — DoD 5, corner button (owner 13:13 "เปลี่ยนเป็นปุ่มมุม") · Fanta 13:28–13:38
**Done.** `CrewStrip.tsx`: the extra row is gone — the `<li>` is `relative` again (the `flex flex-col` and `flex-1` of my first version are removed, the seat button is `h-full` as before), and `ดูหน้าจอ` is `absolute right-1 top-0`, `min-h-11 min-w-11`, 13 px, accent text, still `[data-watch]` + `aria-describedby` = the seat's name, still its own button (does not toggle the filter). To keep the name and role marks clear of it, the name + roles row gets `pr-[72px]`.
Measured in real Chrome with `tests/harness/task-106-screen-check.mjs` (mock build on :3520 — :3500 was held by another session's server, so I did not use it), 13:30, per seat at 375 / 768 / 1280, with and without reduced motion:
```
button 64 x 44 (>= 44 x 44) on every seat, inside the seat's box          coversName: false · coversRoles: false on all 4 seats x 3 widths
name truncated with … : false on all                                      seat height 76 px at 1280 (the old height; 93 px at 375 / 768, where the text wraps)
sideways page scroll after opening the sheet: 0 at all three widths       sheet 375x800 / 560x900 / 560x900
```
- **One honest overlap:** the button's 44 px hit box reaches ~6 px into the box of the seat's second line (`coversSeatLine: true` at 1280 on all seats, 768 on ฝน and มิ้นท์, 375 on มิ้นท์). That is the box, not text I can see colliding; a long second line could have its last few pixels under the button's top edge, where a tap opens the screen instead of toggling the filter. Not the name or role marks, so within what you asked; I did not shrink the hit box below 44.
- Screenshots (relative to `tests/harness/task-106/`): `crew-375.png`, `crew-768.png`, `crew-1280.png` (the strip, closed) · `screen-375.png`, `screen-768.png`, `screen-1280.png` (sheet open) · `result.json`. At 1280 the strip is back to one row of one-line seats with the small button top-right of each.
- 93 px at 375 / 768: I did not measure the old height at those widths before the change (it was not asked), so "back to the old height" is verified at 1280 only (76 px = the old `min-h-[76px]`); the wrap at narrow widths is the seat text's own. `UNVERIFIED` for 375 / 768.
- **`PersonDrawer`: kept as is** (an outline button in its own section under the header). Why: the drawer's top-right corner is already `ปิด`, with the name block wrapping beside it; a second corner button would crowd the name.
```
$ bun test src → 334 pass · 0 fail      $ bun run typecheck → clean      $ NEXT_DIST_DIR=.next-f bun run build → ✓ Compiled successfully
$ NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e   (13:35 → 13:38, after the last code change)  → 264 passed (2.8m)   exit 0
```
`tests/screen.spec.ts` needed no change (it clicks `[data-watch]`).

### DoD 6 (http) — live check DONE 13:44–13:45 (the stub dev script Silver started on :4530; see the end of this section)
**Live check, 13:44:44 → 13:45:00** (`tests/harness/task-106-live-check.mjs`; caw-front `bun run dev` with `PORT=3530 CAW_API_URL=http://127.0.0.1:4530 NEXT_DIST_DIR=.next-f`, real Chrome at 1280; project `1d5387b1…` worker Blew; no `CAW_*` var in my shell; I started only caw-front, never caw-back or a runner):
```
06:44:44.353Z  lines in sheet: 265      (the first answer: everything stored so far, in one go)
06:44:46.352Z  267  ·  06:44:48.397Z  269  ·  06:44:50.452Z  271  ·  06:44:52.503Z  273  ·  06:44:54.539Z  275  ·  06:44:56.576Z  277  ·  06:44:58.642Z  279  ·  06:45:00.673Z  281
{"navigationsAfterLoad":0,"header":["สด","เริ่มเมื่อ 29 ต.ค. 2569 13:40"],"lines":281,"byKind":{"line":281},"atBottom":true,"inputsInSheet":0}
API: hop 01a18663 startedAt 06:40:19.518Z endedAt null · 282 entries, more=false · seq 281 at 06:45:00.188Z "tick 281 of 1800"
```
Read: the stub prints one tick a second; the sheet grows by two lines every 2 s (one poll each), with **no navigation after the first load**, the badge `สด` and the start time (`เริ่มเมื่อ`) shown, the log scrolled to the bottom, no `input` / `textarea` / `contenteditable` in the sheet. Latency: line seq 281 was stored at …00.188 and the sheet showed it at …00.673 (about 0.5 s later); the worst case is one 2 s poll plus the runner's flush. Screenshots (relative to `tests/harness/task-106/`): `live-1280-a.png` (2.5 s after opening), `live-1280-b.png` (16 s). A real Claude CLI was never run (the stub is Silver's). `UNVERIFIED` still: a hop that ends while the sheet is open on the real back end (the sheet stopping its polls), a gap marker from a real API outage, redaction as seen in the sheet — those are QA's AC-3 / AC-6 on the same dev script, not shown by this run. caw-front dev server stopped by pid (`ss … :3530` → nothing).

**Earlier today (kept for the record):**
- `bun run gen:api` (13:34) read caw-back's `openapi.json` (uncommitted in caw-back: Bob's +251 lines). `git diff --numstat src/api/schema.d.ts` → **140 additions, 0 deletions** — the two operations of `/v1/hops/{hopId}/output` (`GET` read, `POST` runner) and `HopOutputEntry`. **But see § Questions Q-A:** the raw `gen:api` output had 141 / 1 — one changed line, which I put back by hand.
- `src/api/http.ts`: `hopOutput` is now `ok(client.GET("/v1/hops/{hopId}/output", { params: { path: { hopId }, query: q } }))` (the 501 stub is gone). Typecheck clean, 334 unit pass.
- Checked with a fake fetch (`tests/harness/task-106-http-shape.mjs`; nothing is called): `GET /v1/hops/h1/output` · `?after=7&limit=50` · `?after=-1`, **no** `X-CAW-Actor` header on a GET, the answer read as `{ hopId, entries, more }` with a `gap` entry's `gapSeconds: 12`, and a 404 `not_found` → `CawError(404, "not_found")`.
- **Not done — `UNVERIFIED`:** the live check ("click ดูหน้าจอ on the worker: lines arrive without a reload", screenshot + times). It needs TASK-105's dev script running (`bun --no-env-file run src/runner/e2e/live-view.ts`, on :4530); SPEC-103 G1 says the SA or Bob starts it and I never start caw-back or a runner. At 13:34 nothing listened on :4530 (`ss`). Tell me when it is up; I then run `CAW_API_URL=http://127.0.0.1:4530 NEXT_DIST_DIR=.next-f bun run dev` on a free port, open the project and record times.

## Questions

- **Q-A (Fanta → Silver, for the PM — user-visible words):** regenerating exposed an existing mismatch between the two repos. caw-back's `openapi.json` (at its HEAD 102a130, unchanged by Bob) types `TeamStatus.startCommand` as the literal `"cd caw-back && bun run runner"`; caw-front's committed `schema.d.ts`, `mock.ts:733`, `http.test.ts:312,318` and `mock.test.ts:220,222` all say `"cd caw-back && bun run dev"` (that is the sentence the board's team-down line tells the user to copy). With the raw output, `bun run typecheck` fails in `mock.ts:733`. I **hand-restored that one line in `schema.d.ts`** so the tree stays green and the diff is additions only; the next `gen:api` brings it back. Which command is right is a product fact I do not have, and `http.test.ts` / `mock.test.ts` are outside my file list. Does the PM want this as its own TASK?
  > answer (Silver, 2026-10-29 13:4x): it is a product fact and user-visible, so it goes to the PM (sent); not this TASK. Your
  > hand-restore of that one line is accepted for now `[SA-decided]`, so the diff stays additions only. When the PM answers, a
  > small TASK aligns both repos. Separately, the corner button is accepted (§ Review round 2 follows when DoD 6 is in). For the
  > live check, the dev script is **up now** (stub, `--no-env-file`, `CLAUDE_BIN` = stub wrapper, started by the SA at 13:40):
  > API `http://127.0.0.1:4530`, project `/p/1d5387b1-f733-42cb-8e30-83bb74c50bb0`, worker "Blew", hop
  > `01a18663-5637-76e6-bef1-a3c61a4ee950`. The hop cap ends it at about 14:00.

> answer (Silver, 2026-10-29): (1) **Yes.** I reviewed DoD 1–5 and 7–9 now (§ Review). The TASK goes `BLOCKED (waiting: TASK-105)`
> until DoD 6; I will put a line in your inbox when TASK-105 is DONE. (2) **Keep the 44 px row for now** `[SA-decided]`: it is
> reversible and does not overlap anything. How it looks is the owner's design approval: I flag it to the PM with your
> screenshot, and the corner variant stays the fallback. (3) **Keep both.** Deviation 1 is right: `startPoller` is fixed at 3 s
> (`src/lib/livePoll.ts:5`), outside your file list, and 2 s keeps AC-1's budget. Deviation 2 too: one cheap call every 2 s, only
> while a sheet is open. Both are recorded in SPEC-103 as `Interpreted`.

- Fanta → Silver (one message, all three): (1) **DoD 6 waits on TASK-105.** Is it right to take this TASK to REVIEW for DoD 1–5, 7–9 now, and finish DoD 6 when you nudge me after TASK-105 is DONE? I set `REVIEW` on that reading. (2) **Each crew-strip seat is 44 px taller** (the new ดูหน้าจอ row under the filter button; screenshot in `tests/harness/task-106/screen-1280.png`). If that is too heavy for the owner's eye, the alternative is a small icon-less text button in the seat's top-right corner; I did not pick it because it can overlap the role marks. Your call, or the owner's design approval. (3) The two deviations in § 3 (own 2 s loop instead of `startPoller`; keep polling while no hop exists) — keep or change?

## Review

**Partial — DoD 1–5, 7–9 accepted; DoD 6 open** — Silver (SA, Team B), 2026-10-29 13:1x. Status `BLOCKED (waiting: TASK-105)`.

- Re-checked by the SA:
  - `git status --short` = exactly the closed list (9 `M`, 4 new). `tsconfig.json` is not in it (G5), and `schema.d.ts` is untouched.
  - `bun test src` → 334 pass · 0 fail · 24 files. Typecheck clean.
  - `WorkerScreen.tsx` has no `input` / `textarea` / `contenteditable` (grep).
  - `SCREEN_POLL_MS = 2000` (`WorkerScreen.tsx:14`) vs `POLL_MS = 3000` (`src/lib/livePoll.ts:5`).
  - `screenOf` picks the worker's newest hop from `api.hops(projectId, { limit: 50 })` (`src/lib/screen.ts:16`), as the SPEC says.
- Against SPEC-103:
  - types, field names and mock behaviour match;
  - words are exactly REQ-104's table + Q1;
  - the two entry points open on click only; e2e asserts AC-2, AC-4 and AC-5 on the mock.
  - 264 e2e pass, unverified by the SA: I accept the run as pasted; QA re-runs it.
- Accepted `UNVERIFIED`: dark mode / 390 / 1440 for the sheet (not in the `ac5.spec.ts` sweep), and `/impeccable audit` (the
  skill is not in your session). Both go to the PM as notes, not blockers.
- Left for DoD 6: `gen:api`, the real `hopOutput`, and the run against TASK-105's dev script.

**REWORK, DoD 5 — owner's design call 13:13** (`DECISIONS.md` 2026-10-29 13:13, *"เปลี่ยนเป็นปุ่มมุม"*; SPEC-103 § Interpreted):
- Replace the extra row with **your corner variant**: a small "ดูหน้าจอ" button in each seat's corner. The seat goes back to its old
  height, so `git diff` of `CrewStrip.tsx` loses the `flex-col` row.
- It must not cover the name or the role marks, the risk you named. Pick the corner and layout that avoids it, and show it at
  375 / 768 / 1280.
- It keeps a ≥ 44 × 44 px hit area, keeps `[data-watch]` + `aria-describedby`, and does **not** toggle the filter.
- `PersonDrawer`'s button: the same style where it fits ("if possible"); otherwise keep it, with one line on why.
- Re-run DoD 7 (`tests/screen.spec.ts` + the whole e2e) and your width/overlap check script. Paste the screenshots' paths.

**Round 2 — DONE** — Silver (SA, Team B), 2026-10-29 13:5x.

- **DoD 5 (corner button):** accepted. 64 × 44, does not cover the name or role marks at 375 / 768 / 1280, seat back to 76 px at
  1280, no filter toggle. The ~6 px overlap into the seat's second-line box is accepted (not text; 44 px kept). `PersonDrawer`
  kept as a row is accepted (the reason given: `ปิด` already holds its corner).
- **DoD 6 (http + live):** accepted.
  - `schema.d.ts` +141/−1 from a plain `gen:api` (the −1 is TASK-111's command line).
  - The live run on the SA's stub dev script, 13:44:44 → 13:45:00: the sheet grew 265 → 281 lines with 0 navigations, `สด` +
    `เริ่มเมื่อ` shown, `atBottom`, 0 inputs. About 0.5 s from stored to shown; AC-1's budget is 5 s.
- Re-checked by the SA:
  - `git status --short` → 18 paths (TASK-106 + TASK-111 lists), no `tsconfig.json`;
  - `bun test src` → 334 pass · 0 fail; typecheck clean.
- The dev script (SA's, pid tree) was stopped at 13:5x: `ss :4530` → nothing, no runner / stub left.
- Carried to QA as `UNVERIFIED` (theirs by design): AC-3 redaction and the AC-6 gap marker *as seen in the sheet*; a hop ending
  while the sheet is open.
