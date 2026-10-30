# TASK-104: caw-front — run it, map its folders, walk the main flow (REQ-101, CAW side)
- Source: SPEC-102 (REQ-101 AC-2, AC-3, AC-4, AC-5 front link, AC-7, AC-10 input)
- Owner: FE (Fanta)
- Status: DONE (2026-10-29, Silver — review below)
- Depends on: none (DoD 7's "with caw-back" step is optional — mock is enough)
- Repo: `caw-front` on `atom` @ 4b58bf3 (path: workspace-root `machine.local.md`). **No code change. No git write.**

## Read first

`specs/SPEC-102-caw-code-map.md` — § Guardrails G1–G10 bind every step, § Flow is what you walk,
§ API "Front links" is what DoD 6 confirms by running. Build into your own folder:
`NEXT_DIST_DIR=.next-f` (git-ignored). **Do not run `gen:api`** (G4: it writes a tracked file).

## What to do

Find out, by running it, how `caw-front` installs, tests, builds and starts here; write one line per folder;
walk CAW's main flow on screen and tie each step to its page file and its `CawApi` call. Observe and
record; do not fix anything.

## Definition of Done

Paste each command and its real output (trimmed to what matters) in `## Implementation Notes`, with date/time.

- [ ] **1. Before.** `git status --short` (→ empty) and `git log -1 --oneline` (→ `4b58bf3 …`).
- [ ] **2. Install, unit, types.** `bun install --frozen-lockfile`; `bun test src`; `bun run typecheck`.
      SA base 2026-10-29: `328 pass · 0 fail`, 23 files; typecheck no output.
- [ ] **3. Folder map.** Every top-level entry under `src/` (`api app blueprint.ts components lib theme
      words.ts`) and `tests/`: one line each — what it is for, with one `file:line`. Plus a routes table: every
      `page.tsx` / `route.ts` under `src/app` → its URL → one line of what it shows, with file:line.
- [ ] **4. Build + e2e.** Ports :3510 free first. `NEXT_DIST_DIR=.next-f bun run build`, then
      `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e`. Record the summary (passed / failed /
      skipped / time) and the name of every fail. A missing browser or a broken step is recorded with its output (G7).
- [ ] **5. Start.** :3500 free first. (a) `bun run dev:mock` → the home `/` loads (`curl -s -o /dev/null -w '%{http_code}' localhost:3500/`).
      (b) `bun run dev` (http mode) with caw-back NOT running → open `/` and record what the screen says
      (`BackendDown`?). Stop each.
- [ ] **6. Front links, CAW side (AC-5).** On `dev:mock`, open `/start` with no query, with
      `?project=x&version=abc`, and with a project + version the mock knows (find one in `src/api/mock.ts`, cite
      its line) — record per case: where it lands or the sentence shown, and the `words.ts` line of that
      sentence. Then on a card screen, copy the "open in Blueprint" link's href and compare it with
      `src/blueprint.ts:5-6`. Do not open blueprint-front (G9).
- [ ] **7. Main flow (AC-7).** On `dev:mock`, walk SPEC-102 § Flow. Per step, one row: screen (what the user
      sees, in the app's words) · page file:line · the `CawApi` method called (`src/api/caw.ts` line) · what
      the mock answers. A page/route that exists but no screen links to it → "not reachable from the UI",
      with the grep that shows no link. Workers and runs are seen **on the mock only** — no runner (G1).
- [ ] **8. Looks wrong / unexplained.** A list with evidence: e2e fails, TODO/FIXME, README vs
      `package.json` (README says Ant Design 6.6.5; is `antd` installed?), dead components, words used nowhere.
      **Listed, not fixed.**
- [ ] **9. After.** `git status --short` (→ empty), `git log -1 --oneline` (→ `4b58bf3`), nothing left on
      :3500 / :3510.

## Implementation Notes

Fanta · 2026-10-29 00:45–00:52 · `caw-front` on `atom` @ 4b58bf3 · cwd = `caw-front` for every command · no code change, no git write, no live Claude CLI, no `gen:api`.
No `CAW_*` / `BLUEPRINT*` / `DATABASE*` variable was set in my shell (`env | grep` → none). Only the repo's own `CAW_API=mock` (inside `dev:mock`) and `NEXT_DIST_DIR=.next-f` / `PLAYWRIGHT_PORT=3510` were used.
`lsof` is not installed here, so "port free" was checked with `ss -ltn | grep -E ':(3500|3510)\b'` (G6's `lsof` form could not run).

### 1. Before (00:45:57)
```
$ git status --short        → (empty)
$ git log -1 --oneline      → 4b58bf3 chore: add merge and release workflows
$ git branch --show-current → atom
```

### 2. Install, unit, types (00:46:02)
```
$ bun install --frozen-lockfile → Checked 450 installs across 498 packages (no changes) [20.00ms]
$ bun test src                  → 328 pass · 0 fail · 1295 expect() calls · Ran 328 tests across 23 files. [2.44s]
$ bun run typecheck             → $ tsc --noEmit   (no output, exit 0)
```
Matches the SA base (328 / 0 / 23 files; typecheck clean). `node_modules` already existed, so "no changes", not "445 packages installed" as in SPEC-102 — same lockfile, `UNVERIFIED` whether a cold install differs.

### 3. Folder map (cites by `grep -n` / editor line, G8)

`src/` top level
| Entry | What it is for | Cite |
|---|---|---|
| `api/` | the one seam between screens and caw-back: `caw.ts` = the `CawApi` interface + types; `http.ts` = it over caw-back's HTTP (openapi-fetch); `mock.ts` = it in memory (sample data); `index.ts` picks one by `CAW_API` (default `http`) and holds `backendReachable()`; `schema.d.ts` = generated OpenAPI types (3765 lines) | `api/caw.ts:1`, `api/http.ts:1`, `api/mock.ts:1`, `api/index.ts:1-9` |
| `app/` | Next App Router: pages, layouts, the one server action file, error/not-found, `globals.css` (tokens) | `app/layout.tsx:21`, `app/p/[id]/actions.ts:1` (`"use server"`) |
| `blueprint.ts` | builds the "open this part in Blueprint" URL from `BLUEPRINT_URL` (default `http://127.0.0.1:3100`) | `blueprint.ts:3,5-6` |
| `components/` | screen pieces. Top level: Board, CrewStrip, FirstSteps, LiveRefresh (3 s poll), ModeControl, Person, BackendDown, SampleDataMark, NameParts. Sub-folders: `card/` (CardView, CardActions, Part), `chat/` (Chat), `faces/` (Face), `runs/` (ProjectNav, RunsList, totals), `team/` (Team, ChainPicture, Bench, PersonDrawer, AddPersonModal, CodeMap), `workspace/` (WorkspaceEditor, roots), `ui/` (12 shadcn/radix primitives) | `components/Board.tsx:3`, `components/LiveRefresh.tsx:2`, `components/BackendDown.tsx:3`, `components/ui/button.tsx:1` |
| `lib/` | pure helpers over `CawApi` data: crew state per seat, event sequence, live polling, faces, roles, readiness, starting team, `utils` (cn) | `lib/crew.ts:1`, `lib/readiness.ts:1`, `lib/startingTeam.ts:1`, `lib/liveEvents.ts:2` |
| `theme/` | `CawRoot` (theme root, `--caw-*` aliases), `ThemeToggle`, `tokens.ts` ("Graphite Desk", palette P1) | `theme/CawRoot.tsx:1`, `theme/tokens.ts:1` |
| `words.ts` | every user-facing Thai word, verbatim — "never typed in a screen" | `words.ts:1` (386 lines) |

`tests/` (Playwright, run on the production build against the mock): `fixtures.ts:1` (resets the mock via `POST /test-reset` before each test) · `ac5.spec.ts:1` + `ac5-probe.ts:1` (every screen × 1440/1280/390 × light/dark) · `smoke.spec.ts:1` · `board` `card` `chat` `mode` `project-screen` `projects` `runs` `sample-data` `team` `test-reset` `workspace` `.spec.ts`. Config `playwright.config.ts:5,24,34` (port 3510, `channel: "chrome"`, `next start` with `CAW_API=mock CAW_TEST_RESET=1`). Unit tests are `*.test.ts(x)` beside the code under `src/` (23 files).

Routes (`ls`/`wc -l` of `src/app`; `/_not-found` and `/icon.svg` come from the build's route list)
| URL | File | What it shows |
|---|---|---|
| `/` | `app/page.tsx:24` | project list: name, "spec เวอร์ชัน n", stuck / waiting chips, faces, progress; unreachable → `startRefused.unreachable` (`:52`); none → `projectCard.none` + เปิด Blueprint (`:54`) |
| `/start?project=&version=` | `app/start/page.tsx:23` | creates the project and redirects to its board, or says why not (`:28-36`) |
| `/p/[id]` | `app/p/[id]/page.tsx:16` | project board: first steps (no cards), crew strip, what waits on you, mode control, five columns |
| `/p/[id]/c/[cardId]` | `app/p/[id]/c/[cardId]/page.tsx:12` | one card with context, timeline, actions, "ดู spec" link; unknown card → `ProjectNotFound` (`:18`) |
| `/p/[id]/team` | `app/p/[id]/team/page.tsx:13` | everyone, this project's chain, folders row, code map |
| `/p/[id]/runs` | `app/p/[id]/runs/page.tsx:13` | mode + run state, list of runs and hops |
| `/p/[id]/chat` | `app/p/[id]/chat/page.tsx:15` | thread with the entry worker, questions, card proposals |
| `/test-reset` | `app/test-reset/route.ts:13` | test-only POST; 404 unless `CAW_API=mock` **and** `CAW_TEST_RESET=1` (`:11`); GET → 404 (`:43`) |
Layouts: `app/layout.tsx:21` (fonts, theme script, `BackendDown` when http and caw-back unreachable, `:35`), `app/p/[id]/layout.tsx:17` (project header + nav). Also `app/error.tsx`, `app/not-found.tsx`, `app/p/[id]/not-found.tsx`, `app/start/start.module.css`.

### 4. Build + e2e (00:46:17 → 00:49:10; ports checked free first)
```
$ NEXT_DIST_DIR=.next-f bun run build
  Next.js 16.3.6 (Turbopack) · ✓ Compiled successfully in 5.6s · Finished TypeScript in 5.0s · exit 0
  Route (app): ƒ / · ƒ /_not-found · ○ /icon.svg · ƒ /p/[id] · ƒ /p/[id]/c/[cardId] · ƒ /p/[id]/chat · ƒ /p/[id]/runs · ƒ /p/[id]/team · ƒ /start · ƒ /test-reset
$ NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e
  257 passed (2.7m) · exit 0   — no failed, no skipped line printed; no fail names to list
```
Chrome was found (`channel: "chrome"` worked). The default run does not include the `ac5-dev` project (`playwright.config.ts:13`, needs `AC5_DEV=1`) — **not run**: `UNVERIFIED` whether it passes.

### 5. Start (00:49:22 / 00:50:31)
(a) `bun run dev:mock` (with `NEXT_DIST_DIR=.next-f`) → `✓ Ready in 250ms`; `curl -s -o /dev/null -w '%{http_code}' localhost:3500/` → `200`. Page shows the bar "ข้อมูลตัวอย่าง — ไม่ได้ต่อกับ CAW จริง · ใช้ข้อมูลจริง: bun run dev".
(b) `bun run dev` (http mode), caw-back NOT running (`ss … :4500` → not listening) → `GET / 200`. The screen says (`BackendDown`, `components/BackendDown.tsx:3`; chosen in `app/layout.tsx:35`): **"ยังต่อ caw-back ไม่ได้ — เปิด caw-back ก่อน แล้วกดลองอีกครั้ง"**, then "คำสั่งเปิด caw-back: `cd caw-back && bun run dev`", "ลองต่อที่ http://127.0.0.1:4500", button "ลองอีกครั้ง". `/start?project=x&version=1` in this mode → also 200 (same `BackendDown` takes the whole layout).
Both servers stopped by PID; `ss -ltnp | grep -E ':(3500|3510)\b'` → nothing. (A first stop attempt with `pkill` was refused by the workspace hook `block-kill-by-name.sh`; I used the PIDs I started. No other process touched.)

### 6. Front links, CAW side (AC-5) — on `dev:mock`, `curl` of the server-rendered HTML
Mock knows Blueprint project `11111111-2222-4333-8444-555555555555` (`api/mock.ts:16`), versions 1–`BLUEPRINT_LATEST`=4 (`mock.ts:15`, check `:476`), and already holds one project for it (`mock.ts:477`).
| `/start` call | Result | Sentence + where |
|---|---|---|
| no query | 200, stays | "ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์และเวอร์ชัน" — `words.ts:257` (`incomplete`), `start/page.tsx:28` |
| `?project=x&version=abc` | 200, same as above | same (`Number("abc")` is NaN, `:28`) |
| `?project=x&version=3` (unknown project) | 200, stays | "ข้อมูลตัวอย่าง — ไม่ได้ต่อกับ CAW จริง" (`words.ts:248`) — not `blueprint_project_not_found` (`words.ts:254`), because on sample data `start/page.tsx:49` swaps it (D-058) |
| `?project=11111111-2222-4333-8444-555555555555&version=3` (known) | **307 → `/p/10000000-0000-4000-8000-000000000001`** | mock answers 409 `already_exists` with the id (`mock.ts:477-478`), page follows it (`start/page.tsx:32,36`) |
| same project, `&version=99` | 200, stays | "เวอร์ชันนี้ยังไม่ได้ยืนยันใน Blueprint" — `words.ts:255` (`version_not_confirmed`), mock `:476` |
Each refusal page has the link "กลับไปที่โปรเจกต์" → `/` (`words.ts:337`, `start/page.tsx:50`). **Not seen:** the "new project is created" path (`mock.ts:479-481`) — the seed already has a project for this Blueprint id, and I did not reset the mock (a reset needs `CAW_TEST_RESET=1`, not mine to set) → `UNVERIFIED`. Not seen on screen either: `unreachable` / `other` refusals on `/start` (need http mode with a caw-back answering errors).
Out link: card pages (`/p/<id>/c/<cardId>`) render `<a … data-blueprint>ดู spec</a>` (`components/card/CardView.tsx:68`) with href `http://127.0.0.1:3100/p/11111111-2222-4333-8444-555555555555/web?part=SCR-001` (I fetched cards 01, 03, 07 → `part=SCR-001`, `SCR-002`, `SCR-003` in that order). `src/blueprint.ts:3,5-6` = `${BLUEPRINT_URL || "http://127.0.0.1:3100"}/p/${id}/web?part=${encodeURIComponent(key)}` → **identical**. The home's "เปิด Blueprint" → `http://127.0.0.1:3100` (`app/page.tsx:20,46`, built from the same helper). `grep -rn '/start' src` → no link to `/start` from any screen (only comments and the folder import): `/start` is entered only from outside. blueprint-front was not opened (G9).

### 7. Main flow (AC-7) — `dev:mock`, text read from the rendered HTML; `CawApi` lines from `src/api/caw.ts`
| # | Screen (app's words) | Page file | `CawApi` calls (caw.ts line) | Mock answers |
|---|---|---|---|---|
| 1 | `/start?project=…&version=3` — no screen; redirects | `start/page.tsx:30,36` | `createProject` (:226) | 409 `already_exists` → `/p/1000…0001` |
| 2 | **Board** "จองห้องประชุม": tabs บอร์ด · ทีม · การรัน · แชต (badge 1); "ปลา เสนองานไว้ รอคุณตกลง" + ไปที่แชต; crew strip ปลา PM / ฝน FE กำลังทำ / แบงค์ BE / มิ้นท์ QA ติดอยู่; open question "ผู้ดูแลไม่ตอบใน 24 ชม. ทำอย่างไร" with ตามนั้น / ตอบเอง…; mode แบบสั่งทีละขั้น / อัตโนมัติ; columns รอทำ … (12 cards) | `p/[id]/page.tsx:16-22`; header `p/[id]/layout.tsx:19` | `project` (:198), `cards` (:204), `workers` (:211), `chain` (:212), `hops` (:213), `chat` (:275), `runs` (:214), `events` via `lastSeq` (:264), `teamStatus` (:271), `proposals` (:279), `cardContext` (:206) per card | seeded project, 4 workers, 12 cards, one running hop on ฝน |
| 3 | **Card** "ทำหน้ายืนยันการจอง" (card 03): status, owner, "อยู่ตรงไหนใน spec", ดู spec, เชื่อมกับ, การตัดสินใจ, ต้องทำอะไร, "ต้องรอการ์ดเหล่านี้ก่อน", ความเคลื่อนไหว, ส่ง | `p/[id]/c/[cardId]/page.tsx:14` | `project`, `cardContext` (:206), `workers`, `cards`, `chain`, `hops`, events; actions in `CardActions` call server actions `p/[id]/actions.ts` (not exercised) | seeded context; "ยังไม่มีความเคลื่อนไหว" |
| 4 | **Team** ทีม: "+ เพิ่มคนทำงาน", โฟลเดอร์ของทีม ("ยังไม่ได้กำหนดโฟลเดอร์ — ทีมจะยังเริ่มทำงานไม่ได้"), คุณ, ปลา PM · รับงานคนแรก, ฝน, แบงค์ … | `p/[id]/team/page.tsx:15` | `project`, `workers`, `chain`, `cards`, `hops`, events, `chat`, `projects` | chain of 4, no folders |
| 5 | **Runs** การรัน: "แบบสั่งทีละขั้น", a run 13 ต.ค. 2569 08:00–08:06 อัตโนมัติ "ใช้งบครบแล้ว … งบ 3 ก้าว · ใช้ไป 3", 13,600 โทเค็น, hop list | `p/[id]/runs/page.tsx:15-17` | `project`, `runs` (:214, limit 100), `hops` (limit 200), `workers`, `cards`, `chat`, events | one stopped run, seeded hops — **mock only, no runner (G1)** |
| 6 | **Chat** "แชตกับ ปลา": operator message, ปลา's reply with a question "ผู้ขอจองต้องได้รับแจ้งผลทางไหน" (ตอบแล้ว), "3 งาน ใช้ประมาณ 6 ก้าว" proposal | `p/[id]/chat/page.tsx:18,24` | `project`, `chat` (:275), `proposals` (:279), `workers`, `chain`, events, `teamStatus` (:271), `hops`, `part` (:210) | seeded thread |
| 7 | **Home** `/` ("โปรเจกต์" link in the header of every project page → `/`): one project card "จองห้องประชุม · spec เวอร์ชัน 3 · ติดอยู่ 1 · รอคุณตอบ 1 · ฝน กำลังทำ · เสร็จ 3 จาก 12" | `app/page.tsx:31-33` | `projects` (:197), `chain` per project, events per project, `homeSummaries` (→ `hops`, `cards`, `chat`) | one project |
Only GETs/renders were walked (curl of the server-rendered HTML); **no button was clicked** (ตามนั้น, ตอบเอง…, ส่ง, mode switch, add person, folders): every write path → `UNVERIFIED — a click-through with Playwright on the mock would settle it` (the 257 e2e tests cover them, but I did not read them). Unreached by any link I followed: `/start` (see 6). Reachable: board → card (12 `href`s), board → ทีม / การรัน / แชต (nav links), every project page → `/`, home → project (`href="/p/1000…0001"`).
Visual look (layout, 375/768/1280, states) was **not** judged — this TASK is a study; `/impeccable audit` is not applicable (no UI change).

### 8. Looks wrong / unexplained (listed, not fixed)
1. **README stale on the UI library.** `README.md:5` says "Ant Design 6.6.5 … the versions of `blueprint-front`"; `package.json` has no `antd` (`grep -n -i antd package.json` → none; `ls node_modules | grep -ci '^antd$'` → 0). UI is radix-ui + shadcn (`components.json`, `src/components/ui/`, 12 files) + Tailwind 4.
2. **`blueprintBuild` is unused.** `src/words.ts:102` `export const blueprintBuild = "ส่งไปสร้างที่ CAW"` (comment: "label of Blueprint's Build button") — no other reference in `src/` or `tests/`. The one word-export with zero uses (loop over all `export const` of `words.ts`). It is Blueprint's button label sitting in CAW's word list.
3. **Two shadcn primitives are not imported by any screen:** `src/components/ui/radio-group.tsx` (0 importers) and `ui/sonner.tsx` (0 importers; `team/Team.tsx:10` imports `toast, Toaster` from `"sonner"` directly instead).
4. **No component in `src/components/` (outside `ui/`) is unimported** (my grep found none) — no dead top-level component seen.
5. **No `TODO|FIXME|XXX|HACK` in `src/` or `tests/`** (grep → none).
6. **Hard-coded Blueprint default `http://127.0.0.1:3100`** appears in `src/blueprint.ts:3`; SYSTEM-FACTS says blueprint-front :3100 — matches. `CAW_API_URL` default `http://127.0.0.1:4500` in `api/index.ts:25` — matches caw-back :4500.
7. **`/start` only works as a deep link** (no UI path in), and on http mode a down caw-back replaces it with `BackendDown` (layout decides, `layout.tsx:27,35`) — so the "unreachable" sentence on `/start` (`start/page.tsx:19`) is reachable only when caw-back answers `/health` but fails the POST. Inference from the code; not run.
8. **Tooling gaps noted:** `lsof` is missing on this machine (G6's check command); the workspace hook blocks `pkill`. No effect on results.
9. **SPEC-102 says `bun install` → "445 packages installed"; I got "Checked 450 installs across 498 packages (no changes)"** — a warm `node_modules` vs the SA's cold run; same lockfile (`--frozen-lockfile`). Not a defect.

### 9. After (00:52)
```
$ git status --short → (empty)
$ git log -1 --oneline → 4b58bf3 chore: add merge and release workflows
$ ss -ltnp | grep -E ':(3500|3510)\b' → (nothing)
```
Footprint (git-ignored, mine): `.next-f/` (build + dev output), `test-results/` (written by the e2e run, 00:49:10), `next-env.d.ts` (touched by `next dev` 00:49:23). `tsconfig.tsbuildinfo` is older (00:43, not mine). No test accounts, no records, no env file created. Scratch outputs are in the session scratchpad, outside the repo.

## Questions

## Review

**DONE** — Silver (SA, Team B), 2026-10-29 00:58. Every DoD item has its command and real output; G1–G10 kept
(mock only, no runner, no `gen:api`, tree clean at 4b58bf3, :3500/:3510 free after).

- Re-checked by the SA: `git status --short` empty, HEAD 4b58bf3; `README.md:5` names Ant Design 6.6.5;
  `ui/radio-group.tsx` and `ui/sonner.tsx` have no importer outside `components/ui/`; `ss -ltn` shows nothing on :3500/:3510.
- **One correction, finding 2:** `blueprintBuild` is referenced — by its own test only (`src/words.test.ts:3,21`). The
  finding stands as "used by no screen"; the map carries the corrected wording.
- `lsof` in G6 was my defect (F-002), not yours; your `ss` substitute was right.
- Accepted as `UNVERIFIED` and carried into the map: write paths not clicked, the `ac5-dev` project, the "new project is
  created" `/start` path, the `unreachable`/`other` refusals on `/start`.
