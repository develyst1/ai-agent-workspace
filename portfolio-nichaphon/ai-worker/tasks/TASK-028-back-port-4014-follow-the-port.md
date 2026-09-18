# TASK-028: `back/` on 4014 — default, README, `ws-client`, front constant, guard test, fresh build, stub AC-b
- Source: SPEC-008 (REQ-008 R1 + R1a + R3; **R2 / `front/` 3023 is NOT in this task — held on Q54**)
- Status: **BLOCKED (waiting: Sober — FQ53: port 4014 is held by the human's own `bun run dev`; DoD 1/3/5/9/12 unrun)** (2026-09-13, Fern. Was IN_PROGRESS → TODO 2026-09-13, Sober)
- Depends on: none
- Owner: Fern (FE)

**Zero real calls.** Pin `GATEWAY_BASE_URL` at the stub or a dead port for every run below; `/health` calls
nothing. No ledger row exists for this task and none may be opened. No git write (the human's).

## What to do

Read SPEC-008 first (D1–D8, ~1 page). Then, in this order:

1. **`back/src/config.ts:45`** — `num("PORT", 3001)` → `num("PORT", 4014)`. Header comment line 2:
   "No .env file is needed or read; …" → "No .env file is needed; if one exists in `back/`, Bun loads it
   before this module runs (SPEC-008 D2). The variables are documented in back/README.md." Nothing else in the file.
2. **`back/test/config.test.ts` (new, SPEC-008 D6)** — three cases on `config.PORT`: env unset → `4014`;
   `PORT=4099` → `4099`; `PORT=abc` → `4014`. Save/restore `process.env.PORT` in `beforeEach`/`afterEach`.
3. **`back/scripts/ws-client.ts`** lines 3, 8, 11 — `3001` → `4014`. `ASK_WS_URL` env keeps precedence.
4. **`back/README.md`** — lines 18, 60, 88, 109: `3001` → `4014`. Line 33 (env table) becomes:
   `| PORT | 4014 | Port back/ listens on — code default; PORT in the environment or an optional git-ignored back/.env overrides it (front/ dev uses 3000) |`
   (keep the table's backtick style). Lines 28–29: keep "There is no `.env` file" but add "— an optional
   `back/.env` is loaded by Bun and git-ignored; it never ships". No other README change.
5. **`front/src/constant/ask.ts:6`** — `'ws://localhost:3001/ws'` → `'ws://localhost:4014/ws'`. Only that literal.
6. **`front/README.md:35`** — default column `ws://localhost:4014/ws`.
7. **Fresh front build** — `cd front && npm run build` (SPEC-008 D5). The old `.next` carries `3001`.
8. **AC-b on the stub** — terminal 1 `STUB_PORT=3999 bun run stub`; terminal 2 (cwd `back/`, nothing else
   exported) `GATEWAY_BASE_URL=http://127.0.0.1:3999 KNOWLEDGE_DIR=test/fixtures/knowledge bun run dev`
   → must print `listening on http://localhost:4014`; terminal 3 `cd front && PORT=<any free port> npm run start`
   (3000 is taken by a foreign process on this machine — TEST-008 §Surface; that is a per-run choice,
   not a port change, SPEC-008 D8). Open Home, press Ask once with `stub:none` typed in the question,
   see the `none` answer. **Do not edit any URL, do not set `NEXT_PUBLIC_ASK_WS_URL`.**
9. **Stop everything, remove the throwaway `.env` from DoD line 4, leave `front/.next` as built.**

Do NOT touch: `docker-compose.yml`, root `README.md`, `SERVER_MAINTENANCE.md`, `front/Dockerfile`,
`front/package.json` scripts, anything under `back/knowledge/`, prompts, theme, copy (SPEC-008 D4/D8).

## Definition of Done

Paste the command + the relevant output line for each item in §Implementation Notes.

- [ ] 1. `cd back && bun run dev` with **no** `PORT` exported: log line says `http://localhost:4014 (ws://localhost:4014/ws)`;
      `curl -s http://localhost:4014/health` → `{"ok":true,…}`; `curl -s http://localhost:3001/health` → connection refused.
      (`GATEWAY_BASE_URL` pinned at a dead port for this run — `/health` fires nothing anyway.)
- [ ] 2. `PORT=4099 bun run start` → `/health` on 4099 (env still wins).
- [ ] 3. `bun run start` with `PORT=abc` → 4014 (bad value → default).
- [ ] 4. Throwaway `back/.env` containing exactly `PORT=4099`, nothing exported, `bun run start` → `/health` on 4099
      (SPEC-008 D2 — Bun loads it). Then **delete the file**; `ls back/.env` fails; `git status --short` shows no `.env`.
- [ ] 5. `bun run ws-client "stub:none"` with **no** `ASK_WS_URL`, `back/` on 4014 + stub → frames printed to `done`
      (`answer` frame `coverage:"none"`).
- [ ] 6. `cd back && bun test` — all green; count = the count on the untouched tree + the 3 new (run it once before step 1 and paste both summary lines).
- [ ] 7. `cd front && npx tsc --noEmit` → 0 errors; `npm run build` → exit 0, no error/warning line.
- [ ] 8. `grep -rn "3001" front/.next/static` → 0 hits; `grep -rln "4014" front/.next/static` → ≥ 1 file.
- [ ] 9. AC-b: step 8 above done — one screenshot of Home showing the `stub:none` answer, saved to
      `../project-docs/fe-task028-2026-09-13/`, plus the `back/` log lines for that question (no gateway
      host in them). `grep -rn "ai.develyst.online" front/.next` → 0 (REQ-007 AC-g unchanged).
- [ ] 10. AC-c grep, pasted verbatim: `grep -rn "3001" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="*.tsbuildinfo" .`
      from the repo root → **only** `docker-compose.yml` ×4, `README.md` (root) ×3, `SERVER_MAINTENANCE.md` ×3
      remain (SPEC-008 D4 list). Any other hit = missed follow → fix it.
- [ ] 11. `git status --short` from the repo root lists exactly: `back/src/config.ts`, `back/scripts/ws-client.ts`,
      `back/README.md`, `front/src/constant/ask.ts`, `front/README.md` (M) and `back/test/config.test.ts` (??).
      Nothing else. `git diff --stat` pasted.
- [ ] 12. Zero real calls (state it); `back/`, stub and the front server stopped; ports 4014 / 3999 / your front port free.

## Implementation Notes

**Status at hand-off: BLOCKED (waiting: Sober — FQ53).** All six file edits are in the tree; DoD 2, 4, 6, 7, 8, 10, 11 are
run and pasted below. **DoD 1, 3, 5, 9, 12 are NOT run**: port 4014 is held by a `back/` dev server that is not mine
(the human's own VS Code terminal — see FQ53). I have not touched that process. **Zero real calls fired by me**:
every run below had `GATEWAY_BASE_URL=http://127.0.0.1:1` (dead port); no `ws-client`, no Ask on Home, no stub run.

### Files (exactly TASK steps 1–6, nothing else)

| File | Change |
|---|---|
| `back/src/config.ts` | line 2 header comment per D2; `num("PORT", 3001)` → `num("PORT", 4014)` |
| `back/test/config.test.ts` (new) | 3 cases on `config.PORT`: unset → 4014, `4099` → 4099, `abc` → 4014; save/restore `process.env.PORT` |
| `back/scripts/ws-client.ts` | lines 3, 8, 11: `ws://localhost:4014/ws` (`ASK_WS_URL` precedence untouched) |
| `back/README.md` | 18, 33 (env-table row as specified), 60, 88, 109 → `4014`; lines 28–29 `.env` sentence per step 4 |
| `front/src/constant/ask.ts` | line 6 literal only: `?? 'ws://localhost:4014/ws'` |
| `front/README.md` | line 35 default column `ws://localhost:4014/ws` |

`git diff --stat`: `back/README.md 15 (+8/-7) · back/scripts/ws-client.ts 6 (+3/-3) · back/src/config.ts 5 (+3/-2) ·
front/README.md 2 (+1/-1) · front/src/constant/ask.ts 2 (+1/-1) — 5 files changed, 16 insertions(+), 14 deletions(-)`.
Line endings preserved per file (git prints its usual autocrlf notice for the three LF files; the diff is only the lines above).

### DoD evidence

- [ ] **1. NOT RUN** — 4014 is held by PID 16964 (`bun run --hot src/index.ts`, child of `bun run dev`, started 23:20:57 from a
      VS Code `bash.exe --init-file …shellIntegration-bash.sh` terminal — not a team session). `curl -s http://localhost:4014/health`
      → `{"ok":true,"service":"portfolio-back","version":"0.1.0","knowledge":{"profile":true,"projects":true}}` — that is *his*
      process, which hot-reloaded onto 4014 when I saved `config.ts` (and still holds its old 3001 listener — a `--hot` artefact).
      Binding mine on the same port would double-bind under his live server, so I did not.
- [x] **2.** `PORT=4099 GATEWAY_BASE_URL=http://127.0.0.1:1 KNOWLEDGE_DIR=test/fixtures/knowledge bun run start` →
      `[back] portfolio-back 0.1.0 listening on http://localhost:4099 (ws://localhost:4099/ws) — gateway http://127.0.0.1:1`;
      `curl -s http://localhost:4099/health` → `{"ok":true,"service":"portfolio-back",…}`. Stopped; 4099 no longer answers.
- [ ] **3. NOT RUN at runtime** (it would bind 4014 — same holder as DoD 1). The rule itself is proven by `config.test.ts`
      case 3 (`PORT=abc` → `config.PORT === 4014`, green in DoD 6).
- [x] **4.** `printf 'PORT=4099\n' > back/.env` (contents: `PORT=4099`), then with **nothing** exported except the dead gateway +
      fixtures: `bun run start` → `listening on http://localhost:4099 (ws://localhost:4099/ws)`; `/health` on 4099 → `{"ok":true,…}`.
      Then `rm back/.env` → `ls: cannot access '.env': No such file or directory`; `git status --short | grep -c "\.env"` → `0`.
- [ ] **5. NOT RUN** — `ws-client` with no `ASK_WS_URL` would send `stub:none` to *his* `back/` on 4014, whose `GATEWAY_BASE_URL`
      I cannot see; `stub:none` is honoured only by the stub, so this could be a real gateway call. Not fired.
- [x] **6.** Before any edit: `bun test` → `42 pass / 0 fail / 175 expect() calls / Ran 42 tests across 5 files`.
      After: `45 pass / 0 fail / 178 expect() calls / Ran 45 tests across 6 files`. `bun test test/config.test.ts` alone → `3 pass / 0 fail`.
      (Both runs with `GATEWAY_BASE_URL=http://127.0.0.1:1` exported as belt-and-braces; the suites pin the in-process stub anyway.)
- [x] **7.** `npx tsc --noEmit` → exit 0, no output. `npm run build` → exit 0, `✓ Compiled successfully in 6.8s`, 10/10 static pages,
      `[postbuild] copied .next/static + public/ into .next/standalone`; a second run piped through `grep -ciE "warn|error"` → `0`.
      New `BUILD_ID` = `j6R3ycWCqf62aNNukjF63`. `front/.next` left as built.
- [~] **8.** `grep -rln "4014" front/.next/static` → 1 file (`static/chunks/app/page-42531bf7d5750484.js`).
      `grep -rn "3001" front/.next/static` → **2 hits, both `\u3001`** (a Unicode-range escape in React's own regex, in
      `chunks/framework-8d6afbd6d2d605c2.js` and `chunks/4bd1b696-….js`) — not the port. `grep -rn "localhost:3001\|:3001/" front/.next/static`
      → `0`. The DoD's literal `→ 0 hits` cannot be met by any build of this app; wording note → FQ54.
- [ ] **9. NOT RUN** — AC-b needs Ask on Home against 4014 = his process (same reason as DoD 5). No screenshot, no
      `../project-docs/fe-task028-2026-09-13/` created. `grep -rn "ai.develyst.online" front/.next` → `0` (REQ-007 AC-g unchanged) — that half is done.
- [x] **10.** `grep -rn "3001" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="*.tsbuildinfo" .` from the repo root →
      exactly `docker-compose.yml` 11/14/21/38, `README.md` 25/36/99, `SERVER_MAINTENANCE.md` 15/152/159 — the D4 list, nothing else.
- [x] **11.** `git status --short` → ` M back/README.md`, ` M back/scripts/ws-client.ts`, ` M back/src/config.ts`, ` M front/README.md`,
      ` M front/src/constant/ask.ts`, `?? back/test/config.test.ts`. Nothing else. `--stat` pasted above. No git write by me; tree still `a294347` on `D1`.
- [~] **12.** Zero real calls (stated). My two `back/` runs (4099) stopped, 4099 free, 3999 never used, no front server started.
      4014 is **not** free — it is his (PID 16964), untouched by me. 3000 (foreign) untouched.

### For Sober

- His `bun run dev` moved from 3001 to 4014 the moment `config.ts` was saved (`--hot`); the old 3001 socket in that process is
  still open. Whatever he was pointing at it (a front on the old build?) now talks to a stale listener. Not mine to fix — FYI up the chain.
- To finish DoD 1/3/5/9/12 I need 4014 free for ~5 minutes, or his word (via you) that his 4014 `back/` is on the stub
  (`GATEWAY_BASE_URL=http://127.0.0.1:3999`) — then AC-b can run against it without a bind. Either is one short session.

## Questions

**FQ53 (BLOCKING — to Sober)** — Port 4014 is held by a `back/` dev server started from the human's own VS Code terminal at 23:20:57
(PID 16964, `bun run dev`), not by any team session. I will not kill it, bind beside it, or send a question through it (its gateway
target is unknown to me → possible real call). DoD 1/3/5/9/12 wait on one of: (a) the human stops it, or (b) the human confirms
its `GATEWAY_BASE_URL` is the stub. Please route; I re-run the five lines in one short session on your word.

**FQ54 (non-blocking — to Sober)** — DoD 8 / SPEC-008 D5 say `grep -r "3001" front/.next/static → 0 hits`. React's framework chunk
always contains the Unicode escape `\u3001`, so the literal grep is 2 on every build of this app. `localhost:3001` / `:3001/` → 0 is
the check that actually says the port is gone. OK to read D5 that way? (No code change either way.)

## Review

(Sober fills this in at REVIEW: verdict + reasons.)
