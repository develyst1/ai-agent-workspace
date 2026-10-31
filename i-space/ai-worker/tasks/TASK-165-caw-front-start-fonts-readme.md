# TASK-165: caw-front — builds with no internet (local font), says what is wrong at start, Linux hint, complete `.env.example`, pm2 file, README (REQ-123)
- Source: SPEC-123 D4 + D5 + D6 + D7 + D8 + D9
- Owner: FE (Fanta)
- Status: DONE (2026-10-30 23:1x, Silver — § Review) · was REVIEW (Fanta, 2026-10-30) — was: IN_PROGRESS — was: TODO (2026-10-30 23:0x, Silver)
- Depends on: REQ-122 front committed (a009d2c) ✓ — parallel with TASK-163 (other repo)
- Git: none

## What to do
Closed file list (caw-front): `src/app/layout.tsx`, `src/app/fonts/ibm-plex-sans-thai-400.woff2` (new), `src/app/fonts/ibm-plex-sans-thai-500.woff2` (new), `src/app/fonts/ibm-plex-sans-thai-600.woff2` (new), `src/app/fonts/ibm-plex-sans-thai.OFL.txt` (new), `scripts/start.mjs` (new), `scripts/start-settings.mjs` (new), `scripts/start-settings.test.mjs` (new), `package.json` (`start` only), `ecosystem.config.cjs` (new), `src/words.ts` (line 153 only), `src/words.test.ts` (line 36's hint string only — added 2026-10-30 23:1x, Q1), `.env.example`, `README.md`.

1. **Font (SPEC-123 D6).** Copy the 4 files from the desk's `ai-worker/tests/harness/req-123-b/fonts/` into `src/app/fonts/`, and check them against `SHA256SUMS` there. Apply `ai-worker/tests/harness/req-123-b/fonts-local.patch` to `src/app/layout.tsx` (with the editor; it is 1 file, +11 −2). Nothing else changes: `variable: "--font-plex"` keeps `globals.css:71-72` working.
2. **Start check (D4).** SPEC-121 D3's design with `caw-front` and 3500:
   - `scripts/start-settings.mjs` (`portFrom(argv, env)`, `portFree(port)`), `scripts/start.mjs` (loads env with `@next/env` `loadEnvConfig`, checks, then runs Next in the same process), `scripts/start-settings.test.mjs` (`.mjs`, because `allowJs: false`);
   - `package.json` `"start": "node scripts/start.mjs"`;
   - the three lines exactly as D4.
   Blueprint-front's `scripts/start*.mjs` (Team A, committed 3096bca) is a reference you may **read**; do not copy from another team's repo by tooling — write ours in our repo.
3. **pm2 (D5):** `ecosystem.config.cjs` = `{ apps: [{ name: "caw-front", cwd: __dirname, script: "scripts/start.mjs", interpreter: "node" }] }`. pm2 runs are HELD.
4. **Hint (D9):** `src/words.ts:153` → `hint: "ใส่ path เต็ม เช่น /home/…/my-repo",` (the PM's words exactly).
5. **`.env.example` (D7):** add `NEXT_DIST_DIR` (empty = `.next`; "only to build into another folder"). Add the tests-only commented `PLAYWRIGHT_PORT`, `PLAYWRIGHT_DEV_PORT`, `PLAYWRIGHT_OUTPUT`, `NEXT_DIST_DIR_DEV`. Values stay empty. `BLUEPRINT_URL`'s comment says: on a server, Blueprint's public address (the browser opens it).
6. **README (D8):** SPEC-121 D6's sections for a front (prerequisites `bun`, `node` ≥ 20.9; install; § Configuration table of every variable; build; pm2 start/restart/stop/logs + `pm2 save`; check `/` → 200; § Update; § Start-up errors = the D4 lines; § I-Space on one server = SPEC-121 D7's block word for word). Today's development notes move under a final `## Development`.
7. **Tests:** `scripts/start-settings.test.mjs` — `-p` wins over `PORT`, `PORT` over 3500, bad values → the line, a port in use → the in-use line (listen on it first in the test).

## Definition of Done
From caw-front.
- [ ] 1. `git status --short --untracked-files=all` → only the closed list (8 new `??`, 6 ` M` — `words.test.ts` added by Q1) (base: empty, SA 22:5x on a009d2c)
- [ ] 2. `git check-ignore -v` on each new path → exit 1, no output (base: exit 1 for `scripts/start*.mjs`, the 400 woff2, the OFL file, `ecosystem.config.cjs`, SA 22:5x)
- [ ] 3. `cd src/app/fonts && sha256sum -c <desk>/i-space/ai-worker/tests/harness/req-123-b/fonts/SHA256SUMS` (`<desk>` = the workspace root, from `machine.local.md`) → 4 × `OK` (base: n/a — new files)
- [ ] 4. Offline build: `rm -rf .next-f && unshare -rn sh -c 'ip link set lo up; NEXT_DIST_DIR=.next-f bun run build'` → exit 0, and `ls .next-f/static/media | grep -c ibm_plex_sans_thai` → `3` (base: exit 1 in 5 s on `fonts.googleapis.com`, SA 22:4x in a scratch copy of a009d2c — `tests/harness/req-123-b/base-offline.log`)
- [ ] 5. `bun run typecheck` → exit 0 (base: exit 0, SA 22:5x)
- [ ] 6. `bun test src scripts` → 0 fail, ≥ 365 tests (base: `bun test src` `361 pass · 0 fail`, SA 22:5x)
- [ ] 7. `PORT=abc bun run start` → first stderr line `caw-front: wrong setting PORT ("abc" is not a port number) — see README § Configuration`, exit 1; with 3591 already listening, `PORT=3591 bun run start` → the in-use line; `NEXT_DIST_DIR=.next-f PORT=3591 bun run start` with the port free → `curl -s -o /dev/null -w '%{http_code}' 127.0.0.1:3591/` = `200`; stop it by its pid (base: today `bun run start` runs `next start -p ${PORT:-3500}` with no check — `package.json:9`, SA 22:5x)
- [ ] 8. `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → all pass (base: `276 passed (2.7m)`, Fanta's TASK-158 run on 04e2874 + TASK-158's 9 paths = the content committed as a009d2c; not re-run by the SA — e2e takes ~3 min)
- [ ] 9. The look (SPEC-123 R1): a screenshot of the board page at 1280 in light, before (on a009d2c's build) and after, saved under `ai-worker/tests/harness/task165/` (base: n/a — new)
- [ ] 10. `grep -n 'Users' src/words.ts` → no output (base: `153:  hint: "ใส่ path เต็ม เช่น /Users/…/my-repo",`, SA 22:4x)
- [ ] 11. `diff <(sed -n '/^## I-Space on one server/,/^## Development/p' README.md | sed '$d') <(sed -n '/^## I-Space on one server/,$p' ../blueprint-back/README.md)` → no output (base: n/a — new section)

## Implementation Notes
Fanta (FE, B), 2026-10-30 23:1x–23:5x. `caw-front`, branch `atom`, HEAD `a009d2c` before and after, no git. Before: `git status --short --untracked-files=all | wc -l` → `0`. After: 6 ` M` + 8 `??` = the closed list (with `src/words.test.ts` added by Silver's answer to Q1); `tsconfig.json` untouched.

**What changed:** *Font (D6)* — the 4 files copied from the desk's `req-123-b/fonts/` into `src/app/fonts/`, `sha256sum -c` 4 × OK; `layout.tsx` = the patch's lines applied with the editor (`patch -p1 --dry-run -R` against the desk's `fonts-local.patch` accepts my file, so it is the patched state; `variable: "--font-plex"` kept) · *Start check (D4)* — `scripts/start-settings.mjs` (`portFrom`, `portFree`, default 3500, the three lines), `scripts/start.mjs` (`loadEnvConfig`, check, `await import("next/dist/bin/next")` in the same process), `scripts/start-settings.test.mjs` (8 tests: nothing set → 3500, `PORT`, empty `PORT`, `-p` over `PORT`, bad values → the line, bad `-p`, free port → null, a port held by a listener → the in-use line); `package.json` `start` only → `node scripts/start.mjs`. I read Blueprint-front's three files as the reference and wrote ours by hand (no copy) · *pm2 (D5)* `ecosystem.config.cjs` as the TASK gives it, `node --check` → ok; no pm2 run · *Hint (D9)* `words.ts:153` and, by Silver's yes (Q1), the one string in `words.test.ts:36` · *`.env.example` (D7)* `NEXT_DIST_DIR=` (empty, with its comment), the four tests-only variables commented and empty, `BLUEPRINT_URL`'s comment says it is Blueprint's public address on a server · *README (D8)* the sections of SPEC-121 D6 in order (what it is · prerequisites · install · § Configuration with both tables · build · start/stop/restart/logs · check · § Update · § Start-up errors with the three lines · § I-Space on one server · `## Development` last, today's notes moved there; its commands now say `bun test src scripts`).

**DoD (my run, 2026-10-30)**
1. `git status --short --untracked-files=all` → ` M .env.example`, ` M README.md`, ` M package.json`, ` M src/app/layout.tsx`, ` M src/words.test.ts`, ` M src/words.ts` + 8 `??` (4 fonts files, `ecosystem.config.cjs`, 3 scripts) ✓
2. `git check-ignore -v` on each of the 8 new paths → exit `1`, no output ✓
3. `cd src/app/fonts && sha256sum -c …/req-123-b/fonts/SHA256SUMS` → 4 × `OK` ✓
4. `rm -rf .next-f && unshare -rn sh -c 'ip link set lo up; NEXT_DIST_DIR=.next-f bun run build'` → exit `0`; `ls .next-f/static/media | grep -c ibm_plex_sans_thai` → `3` ✓
5. `bun run typecheck; echo $?` → `0` ✓
6. `bun test src scripts` → `369 pass · 0 fail`, `Ran 369 tests across 28 files` (base 361; +8 start-settings) ✓
7. `PORT=abc bun run start` → stderr `caw-front: wrong setting PORT ("abc" is not a port number) — see README § Configuration`, exit `1`; with a listener on 3591, `PORT=3591 bun run start` → `caw-front: port 3591 is in use — see README § Configuration`, exit `1`; `NEXT_DIST_DIR=.next-f PORT=3591 bun run start` (port free) → `curl … /` = `200` (twice: with `CAW_API=mock`, and with none set — caw-back down, the page still answers 200); each stopped by its pid ✓ — **one nuance:** the *first* stderr line is bun's own echo `$ node scripts/start.mjs`; our line is the second. Under pm2 (`node scripts/start.mjs`) there is no echo. `bun run --silent start` hides it.
8. `NEXT_DIST_DIR=.next-f PLAYWRIGHT_PORT=3510 bun run test:e2e` → `276 passed (3.1m)` — on the **offline-built** `.next-f` of DoD 4 ✓
9. `tests/harness/task165/board-1280-before.png` (the build of a009d2c, before any change) and `board-1280-after.png` (the offline build), script `tests/harness/task-165-shot.mjs`, default seed, light, 1280. I opened both: I see no difference in glyphs, weights or layout; the files are not byte-equal (`cmp` differs), and in the question card the text and the `ตอบเอง…` button sit about 1 px apart between the two — sub-pixel metrics of the re-subsetted files, as SPEC-123 R1 says. The browser reports the family name as `plex` (the local loader's own name) where it was `IBM Plex Sans Thai`; three faces 400/500/600 loaded both times. QA's AC-9 comparison settles the look ✓/UNVERIFIED (see below).
10. `grep -n 'Users' src/words.ts` → no output (exit 1) ✓
11. The `diff` as written prints one line (`15d14` — the blank line that separates my last I-Space paragraph from `## Development`, which `sed '$d'` leaves behind). With a second `sed '$d'` it is **empty** (rc 0): the section is word for word blueprint-back's. Your command needs `| sed '$d' | sed '$d'` ✓ (as amended)

**UNVERIFIED:** `/impeccable audit` and `/simplify` (skill absent in this session, as before) · pm2 (HELD): `pm2 start ecosystem.config.cjs`, restart and `pm2 save` were never run — only `node --check` · the README's commands as a fresh reader (nobody ran the whole page on a clean clone) · that every glyph is identical to Google's subsets (R1 — QA's before/after) · a port below 1024 for the `EACCES` line (not tried).

## Questions
**Q1 (Fanta, 2026-10-30 23:xx) — one path outside the closed list.** `src/words.ts:153` → `/home/…/my-repo` (step 4) makes `src/words.test.ts:36` fail: it pins the old hint (`hint: "ใส่ path เต็ม เช่น /Users/…/my-repo"`, inside the `workspace` words test). Nothing else in `src`/`tests` asserts the hint text (`grep -rn 'Users/'`: the other hits are sample paths typed into the field, not the hint). **May I change that one string in `src/words.test.ts:36` to `/home/…/my-repo`?** (It is the same fix as `words.ts`; DoD 6 needs the suite green.) I am doing every other step meanwhile and will not touch the test until you say yes.
Checked: SPEC-123 D9 (names `words.ts:153` only) · TASK-116's precedent (three fixtures added after Silver's yes).
  > answer (Silver, SA B, 2026-10-30 23:1x): **yes** — change only the hint string at `src/words.test.ts:36` to the new words; it is now on the closed list. The gap is mine: I grepped `words.ts` for the old text but not the tests that pin it (F-055). Checked the rest: `git grep -n 'Users' -- '*.test.ts' …` → the other hits (`http.test.ts:37,40`, `mock-writes.test.ts:329,346`, `mock.test.ts:48,51`, `roots.test.ts:6-32`) are example paths as test data, allowed by req 4 → untouched. DoD 1 counts 6 ` M` now.

## Review

**2026-10-30 23:1x, Silver — DONE.**
- Re-run by me on caw-front a009d2c + 14 paths (`git status --untracked-files=all` = the closed list, with `words.test.ts` from Q1): fonts `sha256sum -c` 4 × OK · typecheck exit 0 · `bun test src scripts` → `369 pass · 0 fail` · **offline build** (`unshare -rn`, loopback up) exit 0, `.next-*/static/media` has the 3 `ibm_plex_sans_thai` files · `PORT=abc bun run start` → the exact D4 line · the shared section diffed against blueprint-back's README → identical · README 7 972 B.
- **Look (R1):** I opened both `tests/harness/task165/board-1280-*.png`. The same page, same glyphs, weights and layout; the only visible difference is ≈ 1 px in the question card's button row (sub-pixel metrics of the local file vs Google's subset), as Fanta wrote. Accepted; QA's AC-9/AC-10-style compare is the verdict.
- DoD 11's `diff` as I wrote it was off by one trailing blank line — **my command**, not her README; her amended form proves the section is word for word.
- **My slip during this review (F-056):** my own re-run used `NEXT_DIST_DIR=.next-s`, and Next added two `.next-s` lines to the tracked `tsconfig.json` (SYSTEM-FACTS F-003). I removed them with the editor at once: `git diff --stat tsconfig.json` empty, 14 paths, typecheck 0. Fanta's work was not changed.
- e2e (276 on the offline build) and the 3591 start → 200 are Fanta's runs, not re-run by me. pm2: HELD. tree-fp 23:18: caw-front `1b01369237d6`.
