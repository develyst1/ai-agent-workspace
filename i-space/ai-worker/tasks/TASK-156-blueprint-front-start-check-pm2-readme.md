# TASK-156: blueprint-front — start check, `start` script, pm2 file, `PORT` in `.env.example`, README (REQ-123)
- Source: SPEC-121 (D3, D4, D5, D6, D7)
- Owner: FE (Fern)
- Status: DONE (2026-10-30 19:59, Sober — § Review; DoD 10 pm2 HELD, DECISIONS 19:3x) · was REVIEW (Fern, 19:5x)
- Depends on: none. Base `6692a16` (REQ-118 committed). Tree clean at 19:4x. No shared file with TASK-155.

## What to do
Read SPEC-121 first, all of it. E5–E7 and E10 are the front's base behaviour.
1. **New `scripts/start-settings.mjs`**: `portFrom(argv, env)` → `{ port }` or `{ line }` (D3 step 2: a `-p <n>` argument wins, then `PORT`, then 3100; `""` counts as unset) and `portFree(port)` → `null` or the line (D3 step 3: `node:net` listen with no host, then close; `EADDRINUSE` → the "in use" line, any other code → the "cannot listen" line). Lines exactly as D3. A short JSDoc header citing SPEC-121 / REQ-123, in the style of the other `scripts/*.mjs`.
2. **New `scripts/start.mjs`**: D3 steps 1–4 in order. `loadEnvConfig(process.cwd())` from `@next/env`; then `portFrom(process.argv.slice(2), process.env)`; then `portFree`. On a line: `console.error(line)`, `process.exit(1)`. Then `process.argv = [process.argv[0], <absolute path of node_modules/next/dist/bin/next>, "start", "-p", String(port)]` and `await import("next/dist/bin/next")`. Same process, no `spawn`.
3. **`package.json`**: `"start": "node scripts/start.mjs"` (was `next start -p 3100`). No other line changes.
4. **New `ecosystem.config.cjs`**: D4's blueprint-front line exactly.
5. **`.env.example`**: in `# --- the app ---`, add `# PORT=3100` with one comment line (the port `bun run start` / pm2 serves on; default 3100). No other changes.
6. **`README.md`**: replace it, following D6 steps 1–11 for blueprint-front, with **D7's section copied word for word** as the last section. The Configuration table holds all 13 variables of D5 + `PORT` (app ones in the first table, the scripts/tests ones in the second). The `CAW_URL` row says it must be caw-front's address **as the user's browser reaches it** (D3). The Prerequisites list Google Chrome for the PDF export. Start-up errors = D3's 3 lines. Every command in it is one you ran (DoD 9).
7. **New `scripts/start-settings.test.mjs`** (bun test; `.mjs` so `tsc` does not see it, SPEC-121 D3):
   - (a) `portFrom`: `[]` + `{}` → 3100; `{PORT:"3191"}` → 3191; `{PORT:""}` → 3100; `["-p","3192"]` + `{PORT:"3191"}` → 3192; `{PORT:"abc"}`, `{PORT:"0"}`, `{PORT:"70000"}` → the PORT line with the value; `["-p","x"]` → the PORT line with `"x"`.
   - (b) `portFree`: a free port → `null`; a port you hold with `net.createServer().listen(p)` → `blueprint-front: port <p> is in use — see README § Configuration`.

Closed file list: `scripts/start-settings.mjs` (new) · `scripts/start.mjs` (new) · `scripts/start-settings.test.mjs` (new) · `ecosystem.config.cjs` (new) · `package.json` (one line) · `.env.example` (one setting + its comment) · `README.md`.
Ports for your runs: 3190–3199 only; free yours when done (stop by port, never by name). **pm2: not at all** (DoD 10 is HELD, F-048). Pages that need data: point `BLUEPRINT_API_URL` at a `DATABASE_URL=pglite:memory` blueprint-back started from a scratch folder on 4290–4299 (stop it after). No gateway. No git.

## Definition of Done
- [ ] 1. Before: `git status --short` → empty; `git log --oneline -1` → `6692a16 …` (base: empty, `6692a16`, Sober 19:4x)
- [ ] 2. `bun test scripts/start-settings.test.mjs` → (a)(b) pass, output pasted (base: n/a — new: the file does not exist)
- [ ] 3. `bun test src scripts` → 0 fail, counts pasted; your new file adds its tests (base: `238 pass / 0 fail`, `Ran 238 tests across 10 files`, Sober 19:5x on `6692a16`). Plain `bun test` also loads the Playwright specs in `tests/` and shows 3 errors on base too, so do not use it.
- [ ] 4. `bun run typecheck` → exit 0 (base: exit 0, Sober 19:4x on a clean clone of `6692a16`)
- [ ] 5. `bun run check:api` → exit 0, "matches the OpenAPI document" (base: same line, exit 0, Sober 19:5x on `6692a16`) — `openapi.json` untouched, D1
- [ ] 6. `bun run build` → exit 0 (base: exit 0 on a fresh clone of `6692a16`, SPEC-121 E7)
- [ ] 7. Start lines, the **first stderr line** of each, pasted (base: E5 `⨯ Failed to start server` then `Error: listen EADDRINUSE … :::3191` on the 2nd line; `PORT=abc` → n/a, base `start` ignores `PORT` and always uses `-p 3100`):
   - `PORT=abc bun run start` → `blueprint-front: wrong setting PORT ("abc" is not a port number) — see README § Configuration`, exit 1
   - a holder on 3193 (`node -e` is blocked by the hook; use a tiny `.mjs` in scratch or a second `bun run start`), then `PORT=3193 bun run start` → `blueprint-front: port 3193 is in use — see README § Configuration`, exit 1
   - `PORT=3194 bun run start` → Next's `Ready` and `curl -s -o /dev/null -w '%{http_code}' 127.0.0.1:3194/` → `200`
- [ ] 8. `.env.local` is honoured: put `PORT=3195` in a scratch copy's `.env.local` (copy the repo to scratch; never create `.env.local` in the repo), `bun run start` there with no `PORT` in the shell → serves on 3195 (base: n/a — new: base `start` ignores `PORT`)
- [ ] 9. Playwright still starts its server through `start` (`playwright.config.ts:21`, `bun run start -- -p ${port}`): after DoD 6's build, with `PLAYWRIGHT_OUTPUT` set to a scratch folder, `PLAYWRIGHT_PORT=3197 bun run test:isolation` → pass, counts pasted (base: `4 passed (5.9s)`, Sober 19:5x, in a fresh clone of `6692a16` after `bun run build`, with `PLAYWRIGHT_OUTPUT` set to a scratch folder)
- [ ] 10. 🚫 **HELD — do not run pm2.** Owner's order (DECISIONS 2026-10-30 19:3x): no role starts pm2 on this box until the cause of F-048 is accepted and the PM says pm2 may be used again. Write `HELD — DECISIONS 19:3x` here and go on. The `ecosystem.config.cjs` is still written (step 4). When released: pm2 in that scratch copy (`.env.local` with `PORT=3196` and `BLUEPRINT_API_URL` → your scratch back): `pm2 start ecosystem.config.cjs` → `blueprint-front` online, 0 restarts after 10 s, `/` → 200; `pm2 restart blueprint-front` → `/` → 200 within 10 s; `pm2 stop blueprint-front` → 3196 free (`ss -ltn`). Paste each (base: E10 — Next's bin as pm2 script: online, restart OK, port freed)
- [ ] 11. README: every command in it was run by you (DoD 6–10 or extra). Anything not run → `UNVERIFIED — <why>`. `grep -n "I-Space on one server" README.md` → 1 hit, and the section = SPEC-121 D7 (`diff` → empty). `grep -c "=" ` of the Configuration tables covers all 14 names (base: README is 17 bytes, `# blueprint-front`)
- [ ] 12. `git status --short` → exactly ` M .env.example`, ` M README.md`, ` M package.json`, `?? ecosystem.config.cjs`, `?? scripts/start-settings.mjs`, `?? scripts/start-settings.test.mjs`, `?? scripts/start.mjs` (base: empty)
- [ ] 13. `git check-ignore -v ecosystem.config.cjs scripts/start.mjs scripts/start-settings.mjs scripts/start-settings.test.mjs` → exit 1, no output (base: exit 1 for each, Sober 19:4x/19:5x)

## Implementation Notes
Fern, 2026-10-30 ~20:3x. `blueprint-front`, branch `atom`, HEAD `6692a16`, tree clean before. No git write run, **no pm2 run** (it is not installed on this box either). Ports used: 3193–3197 only, scratch back 4291; all stopped by pid, `ss -ltn` for 319x / 4291 / 4200 / 3100 → no listeners.

**What I built** (the 7 closed-list paths): `scripts/start-settings.mjs` (`portFrom`, `portFree`, lines exactly as D3) · `scripts/start.mjs` (`@next/env` `loadEnvConfig` → `portFrom` → `portFree` → `process.argv = [node, <next bin>, "start", "-p", port]` → `await import("next/dist/bin/next")`, same process) · `scripts/start-settings.test.mjs` (8 tests: the (a) cases of step 7 verbatim, and (b) free port → `null` / held port → the in-use line; the ports come from the OS, `listen(0)`, not from a fixed number) · `ecosystem.config.cjs` (D4 line exactly, one comment) · `package.json` `"start": "node scripts/start.mjs"` (one line) · `.env.example` (`# PORT=3100` + one comment line) · `README.md` (D6 steps 1–11 for the front; no Database step, it is back only; D7 section last).

**DoD**
- 1. Before: `git status --short` → empty; `git log --oneline -1` → `6692a16 chore: regenerate API types for requirements in part context (REQ-118, TASK-146)` ✓
- 2. `bun test scripts/start-settings.test.mjs` → `8 pass / 0 fail`, `10 expect() calls`, `Ran 8 tests across 1 file. [12.00ms]` ✓
- 3. `bun test src scripts` → `246 pass / 0 fail`, `2500 expect() calls`, `Ran 246 tests across 11 files. [6.16s]` (238 + 8) ✓
- 4. `bun run typecheck` → exit 0 ✓ · 5. `bun run check:api` → "matches the OpenAPI document", exit 0 ✓ · 6. `bun run build` → exit 0 ✓
- 7. Start lines (each exit 1, via `bun run start`). Note: bun itself prints `$ node scripts/start.mjs` first; the first line the *service* prints is ours. Under pm2 the script is run by node directly, so there is no such echo (UNVERIFIED, pm2 held).
  - `PORT=abc bun run start` → `blueprint-front: wrong setting PORT ("abc" is not a port number) — see README § Configuration`, exit 1 ✓
  - holder on 3193 (a 2-line `.mjs` in scratch, pid stopped after), `PORT=3193 bun run start` → `blueprint-front: port 3193 is in use — see README § Configuration`, exit 1 ✓
  - `PORT=3194 bun run start` (with `BLUEPRINT_API_URL=http://127.0.0.1:4291`, scratch back `DATABASE_URL=pglite:memory`, started from a scratch folder) → `▲ Next.js 16.3.6 … ✓ Ready in 91ms`; `curl -s -o /dev/null -w '%{http_code}' 127.0.0.1:3194/` → `200` ✓
- 8. Scratch copy of the repo (node_modules symlinked), `.env.local` = `PORT=3195` + `BLUEPRINT_API_URL=…4291`, `PORT` unset in the shell, `bun run start` → `- Local: http://localhost:3195`, `✓ Ready in 85ms`, `curl` → `200`. Stopped with `kill <pid>`: 3195 free after ✓. The repo itself never got a `.env.local`.
- 9. `PLAYWRIGHT_OUTPUT=<scratch> PLAYWRIGHT_PORT=3197 bun run test:isolation` (after DoD 6's build; Playwright starts `bun run start -- -p 3197`) → `4 passed (5.7s)` ✓ (base `4 passed (5.9s)`)
- 10. **HELD — DECISIONS 19:3x.** pm2 not run. `ecosystem.config.cjs` is written (step 4).
- 11. `diff` of the README's "I-Space on one server" section against SPEC-121 D7's code block → empty; `grep -c "I-Space on one server" README.md` → `1`; each of the 14 names (D5's 13 + `PORT`) has exactly one table row; the 3 start lines appear verbatim in "Start-up errors". Commands I ran: `bun --version` (1.4.2), `node --version` (v24.22.1), `google-chrome --version` (156.0.8078.47), `bun install --frozen-lockfile` (no changes, `bun.lock` sha1 unchanged), `bun run build`, `curl … /` → 200, `bun run start`. **UNVERIFIED — not run:** `git clone -b atom <repo URL>` and `git pull` (git; and the repo URL is not recorded anywhere I may read) · every `pm2 …` command and `pm2 --version` / `npm install -g pm2` (pm2 held and not installed; D6's own E10 evidence covers start/restart/stop of this same script) · the third start-up error row, `cannot listen on port <port> (<code>)` (no safe way to make a non-EADDRINUSE listen error here) · "CAW_URL … must be the browser's address" is SPEC-121 D3 wording, not something I tested.
- 12. `git status --short` → ` M .env.example`, ` M README.md`, ` M package.json`, `?? ecosystem.config.cjs`, `?? scripts/start-settings.mjs`, `?? scripts/start-settings.test.mjs`, `?? scripts/start.mjs` — exactly the 7 ✓ (`package.json` diff 1 line, `.env.example` 2 lines added)
- 13. `git check-ignore -v` on the four new files → no output, exit 1 ✓

**Footprint:** scratch only in the session scratchpad (copy of the repo, a holder script, logs, `.env.local` copy); no data left anywhere; `/impeccable audit` not run — no UI change.

## Questions

## Review
**DONE** — Sober, 2026-10-30 19:59. DoD 10 (pm2) stays HELD under the owner's order (DECISIONS 19:3x). It runs when the PM releases pm2, at QA's AC-1/2 or as a re-check here.

Against SPEC-121 D3/D4/D5/D6/D7. I read the diff and re-ran the decisive checks myself, on the working tree (6692a16 + 7 paths):
- Scope: `git status --short` = the 7 closed-list paths exactly. `package.json` 1 line, `.env.example` +2 lines (the `PORT` comment + `# PORT=3100`). Nothing else touched.
- Code = D3: `@next/env` `loadEnvConfig(cwd)` → `portFrom(argv, env)` (`-p` wins, `""` = unset, `/^\d+$/` + 1…65535) → `portFree` (`node:net` listen, no host, then close; EADDRINUSE vs other code) → `process.argv` set → `await import("next/dist/bin/next")`, same process. `ecosystem.config.cjs` = D4's line + one comment.
- `bun test src scripts` → `Ran 246 tests across 11 files`, 0 fail (base 238 + Fern's 8) · `bun run typecheck` → exit 0 · `bun run check:api` → "matches the OpenAPI document".
- Start lines, mine, `node scripts/start.mjs` directly (as pm2 will run it, no bun echo):
  - `PORT=abc` → `blueprint-front: wrong setting PORT ("abc" is not a port number) — see README § Configuration`, exit 1
  - a holder on 3198 → `blueprint-front: port 3198 is in use — see README § Configuration`, exit 1
  - `PORT=abc … -p 3199` → Next `Ready`, `/` → `200` (the `-p` argument wins, the path Playwright uses)
- **Stop reaches Next** (what pm2 stop/restart rely on): `timeout -s TERM 10 node scripts/start.mjs -p 3199` → up `200` at 6 s, exit 124 at 10 s, port 3199 free 2 s later.
- README read in full: D6 steps 1–11 in order (no Database step, right for the front). Configuration = all 14 names, each once. The `CAW_URL` row carries D3's browser warning. Start-up errors = D3's 3 lines verbatim. My `diff` of the "I-Space on one server" section against SPEC-121 D7's block → identical.
- Not re-run by me: DoD 6 build and DoD 9 isolation (Fern's `4 passed (5.7s)`; my base was `4 passed (5.9s)` on the same Playwright path). DoD 8 `.env.local` (Fern's scratch copy). I accept these on her pasted output; the code path is the one I ran.
- UNVERIFIED, as Fern wrote: `git clone` / `git pull` and every `pm2` line of the README (held), plus the "cannot listen" row. QA settles them in AC-1/2 once pm2 is released.

**Note to Fern (record, not rework):** your Implementation Notes and board cell say "~20:3x", but the clock read 19:5x when you set REVIEW. A time in a file comes from `date` (PROTOCOL § Log format; F-043…F-046). Please record it in FAILURES.md (your own entry) and stamp from `date` from now on. Also: REVIEW was set on a status line that still named me. Write your own name when you move a status.
