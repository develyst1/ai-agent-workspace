# TASK-102: blueprint-front — run it, map its folders, trace the main flow and the CAW link
- Source: SPEC-101 (REQ-101, Team A)
- Owner: FE (Fern)
- Status: DONE (2026-10-29, Sober — see § Review)
- Depends on: none for steps 1–6; **step 7 (Playwright) waits for TASK-101 DoD 2** (`../blueprint-back`
  needs its `node_modules`; `tests/states.spec.ts` and `scripts/check-required.ts` start it).
- Repo: `blueprint-front` (path: `machine.local.md`), branch `atom` @ e46322a. **No code change. No git write.**

## What to do

A study, not a build. Run the repo on this machine, read it, and write what you saw into
`## Implementation Notes` below — the SA turns it into the map. **Read SPEC-101 § Guardrails G1–G10
first; they are part of this TASK.** In one line: nothing tracked changes (never `gen:api`), no live
gateway call, failures are recorded, not fixed. You run `../blueprint-back` only through the tests that
start it — never edit or install there.

1. **Before.** In the repo: `git branch --show-current; git log -1 --oneline; git status --short`;
   `env | grep -c BLUEPRINT_GATEWAY_LIVE`.
2. **Install:** `bun install --frozen-lockfile`. Paste the last lines.
3. **Static checks:** `bun run typecheck`, `bun run check:no-fetch`, `bun run check:api` — paste each
   result. (`check:api` reads `../blueprint-back/openapi.json`; a mismatch is a finding.)
4. **Unit tests:** `bun test src 2>&1 | tail -40` — paste the runner's summary line and every failure.
5. **Build + start:** `bun run build`, then `bun run start` in the background,
   `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3100/` with blueprint-back **not** running
   — record what the home page shows when the API is down (a screenshot or the visible text). Stop it.
6. **Folder map:** for every top-level folder under `src/` (`app`, `core`, `dev`, `features`, `themes`)
   one line + `file:line`; then one level down for `core/*`, `features/*`, `themes/*` (one line each).
   Plus `tests/`, `scripts/`, `mockups/` one line each.
7. **Playwright (after TASK-101 DoD 2):** `bun run test:isolation`, `bun run test:states`,
   `bun run test:required` — each after the build from step 5. Paste each summary (passed / failed /
   skipped) and each failure. If Chrome cannot launch here, that is the observation (G7).
8. **Main flow (AC-6):** trace sources → AI interview → confirmed spec version → ready screen →
   "ส่งไปสร้างที่ CAW", using the page list in SPEC-101 § Flow. Per step, a row: what the user sees (the
   visible Thai title or button text) · page file `file:line` · component · server action/loader
   `file:line` · back-end route it calls (method + path, as the code writes it). Where a route can be
   seen working in a Playwright run from step 7, say which spec showed it. A page or action in code that no
   link/button reaches → **"not reachable from the UI"** with the grep that shows nothing links to it.
   The interview needs a model answer; **do not** point anything at the real gateway (G4) — trace the
   interview from code and from `tests/states.spec.ts`'s stand-in gateway only.
9. **Front link (AC-5):** where the "ส่งไปสร้างที่ CAW" button renders (`file:line`), how the URL is built
   (`src/features/ready/load.ts:138` and onward), every query/path parameter it passes **with exact
   casing**, when the button is shown or disabled (version confirmation), and what `CAW_URL` defaults to.
10. **Findings:** anything wrong or unexplained (failing test/check, dead code, TODO/FIXME —
    `grep -rnE 'TODO|FIXME|XXX|HACK' src scripts tests`, contradictions, risks). One line each with
    evidence. **List, don't fix.**
11. **After:** `git status --short` (must be empty) and
    `ss -ltnp | grep -E ':(3100|3101|3102|4298|4296)\b'` (must be empty).

## Definition of Done

- [ ] DoD 1 — before/after state pasted: branch `atom`, HEAD `e46322a`, `git status --short` empty both
      times (base checked by the SA 2026-10-29: empty), `env | grep -c BLUEPRINT_GATEWAY_LIVE` → `0`.
- [ ] DoD 2 — install, static checks and unit tests pasted (steps 2–4).
- [ ] DoD 3 — folder map complete (step 6); the SA checks it with `ls src src/core src/features src/themes`.
- [ ] DoD 4 — build/start and the three Playwright runs pasted with the time you ran them (steps 5, 7).
- [ ] DoD 5 — main-flow table: every step has screen · page file · action/loader · route, or "not reachable
      from the UI" with evidence (step 8).
- [ ] DoD 6 — front-link record (step 9).
- [ ] DoD 7 — findings list (or "none found" + the greps run).
- [ ] DoD 8 — `ss` check empty at the end (step 11).

## Implementation Notes

Fern (FE, A), 2026-10-29, 00:42–00:48. Repo `blueprint-front` only (G9); `blueprint-back` touched only by the
process `test:states` spawns. Citations are from `nl -ba` / `grep -n` (G8); "inferred" marks what I did not run.

### DoD 1 — before / after (steps 1, 11)
```
before 00:42:45  atom · e46322a chore: add merge and release workflows · git status --short → (empty)
                 env | grep -c BLUEPRINT_GATEWAY_LIVE → 0
after  00:47:34  atom · e46322a · git status --short → (empty)   blueprint-back git status --short → (empty)
                 ss -ltnp | grep -E ':(3100|3101|3102|4298|4296)\b' → (empty, rc=1)
```
Untracked/ignored only (`git status --short --ignored`): `.next/ next-env.d.ts node_modules/ src/core/theme/registry.generated.ts test-results/ tsconfig.tsbuildinfo`.
Footprint: I started `next start` on :3100 (stopped by pid 392286) and the back end `test:states` leaves running
(pid 398423, cwd blueprint-back, :4298 — stopped by pid after I checked `/proc/398423/cwd`). No test data in any real DB.

### DoD 2 — install, static checks, unit tests (steps 2–4)
```
$ bun install --frozen-lockfile        → 219 packages installed [43.20s]   (git status still empty)
$ bun run typecheck                    → themes: clean-blue, luxury-gold, minimal-mono   (tsc --noEmit, no errors)
$ bun run check:no-fetch               → check:no-fetch — 98 theme files, 0 problems
$ bun run check:api                    → compared against .../blueprint-back/openapi.json (working tree, not a commit)
                                         check:api — src/core/api/schema.d.ts matches the OpenAPI document
$ bun test src                         → 186 pass / 0 fail / 2353 expect() calls — Ran 186 tests across 8 files. [6.58s]
```
(The `exit=` echo in my loop printed `tail`'s status, so exit codes are not evidence; the printed result lines are.)

### DoD 4 — build, start, Playwright (steps 5, 7)
- 00:43:53 `bun run build` → Next 16.3.6 compiled; routes: `/`, `/_not-found`, `/dev/isolation/{all,antd,heroui,mantine,none}`,
  `/dev/{layouts,loaders,samples}`, `/dev/themes/{luxury-gold,minimal-mono}`, `/icon.svg`, `/p/[projectId]`, `…/[page]`, `…/chat`,
  `…/export/pdf`, `…/export/print`, `…/ready`. All dynamic (ƒ) except `/_not-found`, `/icon.svg`.
- 00:44:30 `bun run start`, blueprint-back NOT running: `curl … http://127.0.0.1:3100/` → `200`. Visible text of `/`:
  **"Blueprint ต่อระบบไม่ได้ตอนนี้ ลองใหม่"** (the core's `unreachable` StateView, `src/core/home/Home.tsx:18`).
- 00:45:48 `bun run test:isolation` → **4 passed (7.1s)** (core 1152 comparisons 0 differences; libraries 384/0; 3 library buttons loaded).
- 00:46:00 `bun run test:states` → **34 passed (44.7s)**, 0 failed, 0 skipped. Chrome (`channel: "chrome"`) launched headless here.
- 00:47:01 `bun run test:required` → **1 failed** (0 passed): 
  `TypeError: Unable to connect … path: "http://127.0.0.1:4299/v1/projects", code: "ConnectionRefused"` at `tests/seed/seed.ts:26`
  ← `scripts/check-required.ts:52` (`seedFor`) ← `:124`; spec then fails `Expected /, 0 failures$/m, Received ""` (`tests/required.spec.ts:12`).
  Cause (read, not fixed — G7): `scripts/check-required.ts:11` header says it **needs an in-memory back end already running** on
  :4299 (`api = … || "http://127.0.0.1:4299"`, line 35); unlike `test:states`, nothing in `required.spec.ts` or `playwright.config.ts` starts it.
  SPEC-101 § Risks assumed it spawns the back end → see `## Questions` Q1.
- **Second run of `test:required`, per Q1's answer (REWORK), 00:50:42–00:52:54:**
  - Before: ports 3100/3101/3102/4298/4299/4296 empty; `git status --short` empty in `blueprint-front`.
  - Back end (cwd `blueprint-back`): `DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:9 CAW_NOTIFY_URL= HOST= PORT=4299 bun run dev` (background, pid 427958);
    `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4299/v1/projects` → `200`.
  - 00:50:55 `BLUEPRINT_API_URL=http://127.0.0.1:4299 bun run test:required` (no `CHECK_BASE_URL`) →
    `checked 896 items on 44 pages × 4 themes, 0 failures` · `✓ 1 tests/required.spec.ts:6:5 … (1.9m)` · **`1 passed (1.9m)`**.
  - After: back end stopped by pid 427958 (`kill`); `ss -ltnp | grep -E ':(3100|3101|3102|4298|4299|4296)\b'` → empty (rc=1); `git status --short` empty in both repos.
  - So the first failure was only the missing :4299 back end; with it, the spec passes. The script seeded projects into the in-memory pglite only, which died with the process; nothing else left behind.

### DoD 3 — folder map (step 6)  (one line each; `file:line` = the file that says it)
`src/`
- `src/app` — Next App Router: routes, server actions, root layout. `src/app/layout.tsx:1`, `src/app/actions.ts:1`, `src/app/not-found.tsx:1` (404 for missing project / unknown page).
- `src/core` — the theme-neutral core: API client, view-model builders, layout math, theme contract, words. `src/core/theme/contract.ts:1` (themes get view models, never data).
- `src/dev` — dev-only isolation blocks, 404 unless `BLUEPRINT_DEV_PAGES=1`. `src/dev/isolation/guard.ts:3-5`.
- `src/features` — pages with their own loaders/actions: `chat`, `export`, `ready`.
- `src/themes` — three swappable themes, each a Root + pages.

`src/core/*`
- `api` — typed client + wrapper: `src/core/api/client.ts:7` (`BLUEPRINT_API_URL || http://127.0.0.1:4200`), `load.ts:1` (data | unreachable | notFound), `schema.d.ts` (generated by `gen:api`, tracked).
- `format` — the one place a date becomes Thai words: `src/core/format/date.ts:1` (+ `date.test.ts`).
- `home` — projects home and new-project dialog: `src/core/home/Home.tsx:15`, `NewProject.tsx`.
- `layout` — shared diagram layouts (flow, swim, sequence, web) in px: `src/core/layout/index.ts:1` (+ `layout.test.ts`).
- `model` — `load.ts` (fetch + build per page), `build/` (pure builders; `build/common.ts:1` hrefs/frame), `samples.ts:1` (typed sample view models).
- `postcss` — plugin scoping a theme's CSS to its root: `src/core/postcss/scope-to-theme-root.cjs:1`.
- `render` — `ProjectPage.tsx` (loader → theme → Shell → page), `pages.tsx:1` (URL ↔ PageId).
- `theme` — contract and registry: `contract.ts:1`, `registry.ts:1`, `registry.generated.ts` (git-ignored, written by `gen:themes`), `required.ts:1`, `anchors.ts:1`, `default/` (the fallback theme: Card, Mark, Preview, Shell, State, WebView, pages).
- `web` — the node-web view maths (zoom/fit): `src/core/web/view.ts:1`, `useWebView.ts`, `view.test.ts`.
- `words.ts:1` — every user-facing word, "verbatim, one constant per row".

`src/features/*`
- `chat` — chat/interview page: `ChatScreen.tsx:1`, `load.ts` (`raw()` at `:37` for routes the client lacks), `actions.ts:1`, `contract.ts`, `limits.ts`, `words.ts`.
- `export` — PDF export: `pdf.ts:1` (local Chrome prints the print page), `PrintView.tsx:1`, `ExportButton.tsx`, `load.ts`.
- `ready` — screen ④ "พร้อมสร้างหรือยัง": `ReadyScreen.tsx:24`, `load.ts` (gate, CAW link), `actions.ts:1`, `DefaultReady*.tsx`, `required.ts`, `words.ts`.

`src/themes/*`
- `clean-blue` — Ant Design theme: `src/themes/clean-blue/index.tsx:1`.
- `luxury-gold` — plain-CSS gold theme: `src/themes/luxury-gold/index.tsx:1`.
- `minimal-mono` — Mantine theme: `src/themes/minimal-mono/index.ts:1`.

Other: `tests/` — three Playwright specs (`isolation`, `states`, `required`) + `fixtures/api` (recorded responses), `seed/` (seeders), `bad-themes/` (3 deliberately broken themes). `scripts/` — `check-api-contract.mjs:1`, `check-no-fetch.mjs:1`, `check-required.ts:1`, `gen-theme-registry.mjs:1`, `record-api-fixtures.ts:1`. `mockups/` — static HTML mock-ups of the 3 themes (`mockups/index.html`, `data.js`, `shared.js`); nothing in `src/` imports them (inferred — not grepped beyond the folder listing).

### DoD 5 — main flow (step 8)
Every back-end call below is a path string as the code writes it. `API` = `apiBaseUrl` (`src/core/api/client.ts:7`).

| # | User sees | Page file | Component | Loader / action `file:line` | Back-end route |
|---|---|---|---|---|---|
| 1 | Home: product mark + project cards + new-project dialog | `src/app/page.tsx:5` | `Home` `src/core/home/Home.tsx:15` | loader `loadHome` `src/core/model/load.ts:94` | `GET /v1/projects` (`load.ts:95`) |
| 2 | Create project (name + theme preview) | same | `NewProject.tsx:8,27` → `router.push(chatHref(id))` | `createProjectAction` `src/app/actions.ts:16` | `POST /v1/projects` `{name, theme}` (`actions.ts:19`) |
| 3 | Open a card | same | `Card` `src/core/theme/default/Card.tsx:7` / `clean-blue/Card.tsx:12` (`<a href={card.href}>`) | — | → `/p/<id>` → `redirect(href(id,"overview"))` `src/app/p/[projectId]/page.tsx:7` |
| 4 | Sources + AI interview: **"แชต"** (`src/core/words.ts:7`) | `src/app/p/[projectId]/chat/page.tsx:8` | `ChatScreen` `src/features/chat/ChatScreen.tsx` (actions bound `:34–42`) | loader `src/features/chat/load.ts:195-197` | `GET /v1/projects/{projectId}/messages?limit=50` · `GET /v1/projects/{projectId}/sources` · `GET /v1/models` · plus `GET …/change-sets/{id}` (`:186`) and the project loaders `GET /v1/projects/{id}`, `…/stuck`, `…/versions` (`src/core/model/load.ts:30-32`) |
| 4a | add a source (file + stamp `operator` / `customer-asked`) | — | chat upload | `uploadAction` `chat/actions.ts:75` | `POST /v1/projects/{id}/sources` multipart `file`, `origin={stamp,date}` (`:84`) |
| 4b | send a message | — | chat composer | `sendAction` `:30` | `POST …/rounds` `{message}` |
| 4c | "ตามนั้น" / answer / park / retry | — | pack buttons | `acceptAction :39` (reads `GET /v1/projects/{id}` first, `:41`) · `answerAction :51` · `parkAction :59` · `retryAction :98` | `POST …/rounds` with `{accept:[keys]}` · `{answers:[{key,text}]}` · `{park:[{key,reason?}]}` · `{retry:true}` |
| 4d | "ย้อนกลับ" | — | change-set row | `undoAction :65` | `POST …/change-sets/{changeSetId}/undo` (409 `undo_conflict` handled `:70`) |
| 4e | model / creativity | — | chat settings | `setModelAction :87`, `setCreativityAction :91` | `PATCH /v1/projects/{id}` `{model}` / `{creativity}` |
| 5 | Spec pages (overview, flowchart, sequence, screens, api, web, stuck, history; `workOrder` is not a URL) | `src/app/p/[projectId]/[page]/page.tsx:10` | `ProjectPage` `src/core/render/ProjectPage.tsx` | `loadPage` `src/core/model/load.ts:50` | `GET …/diagrams/{kind}/{key}` (`:42`), `GET …/parts/{key}/history` (`:46`) + the three loaders above |
| 6 | **"พร้อมสร้างหรือยัง"** (`words.ts:17`, `ready/words.ts:3`): gate reasons, quiz, confirm | `src/app/p/[projectId]/ready/page.tsx:6` | `ReadyScreen.tsx:24` → `DefaultReady.tsx` or the theme's `ready` | `loadReady` `src/features/ready/load.ts:165` | `GET /v1/projects/{id}/quizzes/latest` (`:170`, 404 = no quiz) · `GET /v1/projects/{id}/versions` (`:171`) · project loaders |
| 6a | start quiz / ask / mark right-wrong | — | ready quiz | `startQuizAction ready/actions.ts:25` · `askAction :30` · `markAction :42` | `POST …/quizzes` · `POST …/quizzes/{quizId}/questions` `{question}` · `POST …/quizzes/{quizId}/items/{itemId}/mark` `{mark,note?}` (quiz id from `GET …/quizzes/latest`, `:19`) |
| 7 | **"ยืนยัน 100%"** → confirmed version | same | ready confirm button | `confirmAction :59` | `POST /v1/projects/{id}/versions` `{confirmedBy:"operator"}` (`:55,60-63`); 409 → `blocked` / `already_confirmed` |
| 8 | **"ส่งไปสร้างที่ CAW"** | same | see DoD 6 | `buildLink` `ready/load.ts:142` | none (a plain `<a href>` to CAW) |
| 9 | "ส่งออก PDF" | `ExportButton` on every spec page + ready (`ProjectPage.tsx:54`, `ReadyScreen.tsx:44`) | `ExportButton.tsx:23` (`fetch(href)`, same-origin) | route `src/app/p/[projectId]/export/pdf/route.ts:15` | `GET /v1/projects/{id}` + `GET …/versions` (`:19-20`), then local Chrome prints `/p/<id>/export/print` |

Seen working in a Playwright run (stand-in back end, no model): rows 1 & unreachable (`states.spec.ts:50`, `:59`); empty-project page + chat link "เริ่มที่แชต" (`:126`, `:140`); chat composer (`:275`); ready page with confirmed version and CAW link (`:282`, `:296`); node-web page (`:156–465`). **Not seen working by a run (inferred from code only):** the interview round itself (`sendAction`/`acceptAction`/…, needs a model answer — G4), source upload, quiz ask/mark, confirm POST, PDF export (needs Chrome print + back end).

Not reachable from the UI:
- `src/app/dev/*` (`isolation/{all,antd,heroui,mantine,none}`, `layouts`, `loaders`, `samples`, `themes/*`) — `grep -rn '/dev/' src --include=*.ts --include=*.tsx` outside `src/app/dev`, `src/dev`, `src/themes` → no hit; and `src/dev/isolation/guard.ts:5` makes the isolation routes 404 unless `BLUEPRINT_DEV_PAGES=1`. (I did not read every `src/app/dev/*/page.tsx` for their own guard — `loaders`/`layouts` mention the env var only in a header comment, `loaders/page.tsx:2`, `layouts/page.tsx:2`.)
- `/p/<id>/export/print` — header says "Not linked from the nav" (`export/print/page.tsx:3`); reached only by the PDF route's Chrome (`pdf/route.ts:11,28`).

### DoD 6 — front link to CAW (step 9)
- Rendered: default theme `src/features/ready/DefaultReady.tsx:116-126` (`<a … href={vm.build.href}>` when `vm.build.enabled && vm.build.href`, else a `disabled` `<button>` + reason `<p>`); clean-blue `src/themes/clean-blue/pages/Ready.tsx:95,183-188` (`<Button type="primary" href=… data-build>` / disabled `Button` + reason); luxury-gold `src/themes/luxury-gold/pages/Ready.tsx:102-111`; minimal-mono `src/themes/minimal-mono/ready/MonoReady.tsx:265-283`. Label **"ส่งไปสร้างที่ CAW"** = `src/features/ready/words.ts:25` (`build`).
- URL built in `src/features/ready/load.ts:145`: `` `${cawUrl()}/start?project=${encodeURIComponent(id)}&version=${version!.n}` `` → query params exactly **`project`** (project id, URL-encoded) and **`version`** (number `n` = `versions.at(-1).version`, `:121,123`), lowercase, no path params.
- Enabled when (`load.ts:143`): `!!version && !version.changedSince` — i.e. at least one confirmed version exists and `changedSinceLatest === true` was not returned by `GET …/versions` (`:182`). Else disabled with `buildNotReady` (`:146`; `words.ts` `buildNotReady`). "Version confirmation" = the confirm POST (DoD 5 row 7).
- `CAW_URL` default (`load.ts:138`): `process.env.CAW_URL || "http://127.0.0.1:3500"`; read per request ("when the page is built", comment `:136-137`); `||` so an empty env falls back.
- Run evidence: `states.spec.ts:296` (clean-blue, "Build is the primary link to the core's CAW href") passed 00:46. Whether the CAW `/start` page accepts these names is Team B's side — not opened (G9).

### DoD 7 — findings (step 10)
1. **`test:required` fails here with ConnectionRefused on :4299** — cause above; SPEC-101 § Risks says the script spawns the back end, its own header (`check-required.ts:11-13`) says the opposite. Evidence: output above. Recorded, not fixed (G7).
2. **`test:states` leaves blueprint-back running** on :4298 after "34 passed" (`ss` showed `bun.exe` pid 398423, cwd `blueprint-back`, ppid 53, 48 s old; had to `kill` it). Next run would find the port taken (inferred — not tried).
3. `check-required.ts:180` `cp -cR` is a macOS flag (already in SPEC-101 Risks) — on the `--extra-theme` path only, which G3 forbids; **not run**.
4. TODO/FIXME grep: `grep -rnE 'TODO|FIXME|XXX|HACK' src scripts tests` → **no output** (none found).
5. `find src -name '*.test.ts*'` → 8 files: `core/format/date`, `core/layout/layout`, `core/model/build/pages`, `core/web/view`, `features/chat/load`, `features/export/{load,pdf}`, `features/ready/load`. None is named for a server action (`*/actions.ts`) or a page; whether an action is exercised inside a `load.test.ts` I did not read (**inferred**). Playwright is the UI coverage.
6. `ExportButton.tsx:23` and `chat/load.ts:39` call `fetch` outside the typed client (`chat/load.ts:5` explains: routes the generated client lacks). `check:no-fetch` only checks `src/themes` (`scripts/check-no-fetch.mjs:1`), so nothing guards these two — informational.
7. `confirmedBy` is hard-coded `"operator"` (`ready/actions.ts:55`), documented there as an SA-C interpretation, reversible.

### DoD 8
`ss -ltnp | grep -E ':(3100|3101|3102|4298|4296)\b'` at 00:47:34 → empty (rc=1). `git status --short` empty in both repos.

Not run (and why): `gen:api`, `scripts/check-required.ts --extra-theme` (G3); anything with `BLUEPRINT_GATEWAY_LIVE` (G4); any call to CAW (G9). No visual/UX judgement was part of this TASK (no code changed, no `/impeccable audit` — nothing to audit).

## Questions

- Q1 (Fern → @Sober, 2026-10-29): `test:required` (DoD 4) failed because nothing starts the in-memory back end on :4299 (`scripts/check-required.ts:11`), contrary to SPEC-101 § Risks. To get a real PASS/FAIL I would start `../blueprint-back` by hand on :4299 with `DATABASE_URL=pglite:memory`, `GATEWAY_URL=http://127.0.0.1:9`, `CAW_NOTIFY_URL=`, `HOST=` and `CHECK_BASE_URL`/`BLUEPRINT_API_URL=http://127.0.0.1:4299`, then run `bun run test:required` and stop both by pid. G-text says "only through the tests that start it" — **I did not do this**. Allow it (then I re-run and add the result), or accept the failure as the observation?
  > answer (Sober, 2026-10-29): **Allowed — run it.** You read it right; my SPEC was wrong (F-001; SPEC-101 § Risks
  > corrected). Keep the failed run above as the first observation and add the second run under it. Recipe, from
  > `scripts/check-required.ts:11-13,35` and `tests/required.spec.ts:9-10`:
  > 1. In `blueprint-back`, background: `DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:9 CAW_NOTIFY_URL= HOST= PORT=4299 bun run dev`;
  >    wait for `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4299/v1/projects` → `200`.
  > 2. In `blueprint-front` (after the step-5 build): `BLUEPRINT_API_URL=http://127.0.0.1:4299 bun run test:required`.
  >    Do **not** set `CHECK_BASE_URL` — the spec sets it to Playwright's own :3100 server; `BLUEPRINT_API_URL` reaches both
  >    that server and the script through the env.
  > 3. Stop the back end by pid; `ss -ltnp | grep -E ':(3100|3101|3102|4298|4299|4296)\b'` → empty; `git status --short` empty in both repos.
  > Paste the summary (passed / failed, and the script's `checked N items … M failures` line) and any failure, verbatim.

## Review

**2026-10-29 · Sober (SA, A) · verdict: REWORK — scope: Q1 re-run only. Everything else is accepted as written.**

Checked against SPEC-101 and the evidence, with my own re-reads where cheap:
- DoD 1, 8 (state): accepted. Before and after pasted, both repos clean, ports empty. The footprint note (two pids stopped, `/proc` cwd checked) is exactly the care G6 asks for.
- DoD 2 (install, static checks, 186 unit tests): accepted. Runner lines pasted. The exit-code caveat you added is honest and correct.
- DoD 3 (folders): accepted. Every name in `ls src src/core src/features src/themes` has a line. `mockups/` is marked "inferred", which is correct labelling.
- DoD 4: accepted for build, start (the API-down home page), isolation 4/4 and states 34/34. **Open:** `test:required` (Q1).
- DoD 5 (flow): accepted. Every step has screen · page · action · route, and you split "seen in a run" from "inferred from code", which the map needs. "Not reachable from the UI" is backed by a grep, and you said where your reading stopped.
- DoD 6 (CAW link): accepted. Re-read by me: `src/features/ready/load.ts:142-146` → `/start?project=<encoded id>&version=<n>`, enabled iff `!!version && !version.changedSince`.
- DoD 7 (findings): accepted. Finding 1 was my error (F-001). On finding 2: `tests/states.spec.ts:48` does call `back?.kill()` in `afterAll`, yet you saw the back end still running. Keep it as observed. The cause (perhaps `kill` reaches only the `bun` wrapper, not its child) is **inferred**, and I'll write it that way in the map.
- G1–G10: no breach found.

To reach DONE: Q1 answer steps 1–3, pasted under DoD 4, then put the TASK back to REVIEW.

**2026-10-29 · Sober (SA, A) · re-review: DONE.**
- Q1 re-run (DoD 4, 00:50:42–00:52:54) follows the recipe step by step: back end with the G4/G5 env on :4299, `/v1/projects` → 200, no `CHECK_BASE_URL`, runner line `checked 896 items on 44 pages × 4 themes, 0 failures` · `1 passed (1.9m)`, back end stopped by pid. Accepted.
- Re-checked by me afterwards: `ss -ltnp | grep -E ':(3100|3101|3102|4298|4299|4296)\b'` → empty (rc=1); `blueprint-front` `atom` e46322a status empty; `blueprint-back` `atom` f60b934 status empty.
- DoD 1–8 all met. DONE means built and proven by the engineer, not tested; QA's TEST-101 re-runs AC-3.
