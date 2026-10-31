# TASK-172: blueprint-front — standalone output + static copy in `build`
- Source: SPEC-127 § D1 (REQ-127 AC-1, AC-2, AC-5)
- Owner: FE (Fern)
- Status: DONE (2026-10-31 18:19, Sober; § Review)
- Depends on: none — REQ-127 Q1 answered (owner: *"nichaphon on this PC"*, DECISIONS 2026-10-31 17:0x)
- Repo: `blueprint-front`, **the owner's checkout on this Windows box, branch `nichaphon`** (path: `machine.local.md`), base `6a64527`, clean. **No git writes** — not even `add`/`stash`.

## What to do

Closed file list — touch nothing else:

1. `next.config.ts` — add one line `  output: "standalone",` directly under `  distDir: process.env.NEXT_DIST_DIR || ".next",`. Keep the file's CRLF line endings (it is CRLF; `file next.config.ts` must still say `with CRLF line terminators`). Everything else unchanged.
2. `scripts/copy-standalone-assets.mjs` — **new**, a byte-for-byte copy of the workspace file `.claude/skills/deploy-ready-build/references/copy-standalone-assets.mjs` (use `cp`; do not retype it).
3. `package.json` — change only `"build": "next build",` to `"build": "next build && node scripts/copy-standalone-assets.mjs",`. `prebuild`, `dev`, `start` stay as they are.
4. `.gitignore` — append one line `*.zip`.

Install with **`bun install --no-save`** (never plain `bun install`: on bun 1.3.14 it rewrites `bun.lock` — SPEC-127 P3/R2; `bun.lock` is not on this list).
Use port **4391** for the standalone server and **4392** for `next start`; stop them by pid when done (`Get-NetTCPConnection -LocalPort <p>` → `Stop-Process -Id`), never by name.
SA's dry run of exactly this change in a scratch clone: SPEC-127 § Probes P4 (all green) — the same result is expected.

## Definition of Done

- [ ] 1. Before: `git status --short` → empty (base: empty — 0 lines, 2026-10-31 17:06, `nichaphon` 6a64527)
- [ ] 2. `git check-ignore -v scripts/copy-standalone-assets.mjs` → exit 1, no output (base: exit 1, no output — run 17:0x in the repo)
- [ ] 3. `bun install --no-save` then `git status --short` → empty (base: P3 scratch — `--no-save` → 227 pkgs in the back, status empty; plain `bun install` → ` M bun.lock`)
- [ ] 4. `bun run build` → exit 0 and a line `[postbuild] copied .next/static into .next/standalone` (base: exit 0, no `[postbuild]` line — P4 scratch base build)
- [ ] 5. `ls .next/standalone/server.js .next/standalone/.next/static` → both exist (base: `ls: cannot access '.next/standalone'` — P4 scratch) — AC-1
- [ ] 6. `PORT=4391 HOSTNAME=127.0.0.1 BLUEPRINT_DEV_PAGES=1 node .next/standalone/server.js`, then `curl -s -o /dev/null -w '%{http_code}'` on `/`, on one file from `ls .next/static/chunks/*.css`, and on `/dev/isolation/none` → `200 200 200` (base: n/a — new: no standalone server on the base; P4 scratch with the change → 200 200 200) — AC-2 (HTTP part)
- [ ] 7. Open `http://127.0.0.1:4391/` in the browser while 6 runs; screenshot shows the page styled (theme colours, layout), not bare HTML; save it under `ai-worker/tests/harness/task-172/` (base: n/a — new) — AC-2 (styles part)
- [ ] 8. `BLUEPRINT_DEV_PAGES=1 node_modules/.bin/next start -p 4392` on the same build → the same three curls `200 200 200`; paste the `⚠ "next start" does not work with "output: standalone"` line if it appears (base: P4 scratch → 200 200 200 + that warning) — the `playwright.config.ts` / `check-required.ts` path
- [ ] 9. `NEXT_DIST_DIR=.next-a bun run build` → exit 0, `[postbuild] copied .next-a/static into .next-a/standalone`, `ls .next-a/standalone/server.js .next-a/standalone/.next-a/static` → both exist (base: n/a — new: the per-team folder path of the copy script) — REQ-127 item 1
- [ ] 10. `bun run typecheck` → exit 0 (base: exit 0 — `themes: clean-blue, luxury-gold, minimal-mono`, `tsc --noEmit` clean; scratch clone 6a64527, 17:1x)
- [ ] 11. After: `git status --short` → exactly ` M .gitignore`, ` M next.config.ts`, ` M package.json`, `?? scripts/copy-standalone-assets.mjs` — no build output, no `bun.lock` (base: n/a — new) — AC-5
- [ ] 12. `git diff next.config.ts package.json .gitignore` pasted whole; `file next.config.ts` → `… with CRLF line terminators` (base: `JavaScript source, Unicode text, UTF-8 text, with CRLF line terminators`)
- [ ] 13. Both servers stopped: `Get-NetTCPConnection -LocalPort 4391,4392 -State Listen` → nothing (base: nothing listening, 17:06)
- [ ] One line at the end of Implementation Notes: artifact `.next/standalone/` · server start `node server.js` in it, `PORT` + `HOSTNAME=127.0.0.1` from env.

## Implementation Notes
Fern, 2026-10-31 18:16. Repo `blueprint-front` (owner's checkout), branch `nichaphon`, HEAD `6a64527` before and after; no git command run by me. All commands run in the repo; build/server logs are in my scratchpad, screenshots + the throwaway script in `ai-worker/tests/harness/task-172/`.

**What changed (4 paths, nothing else):** `next.config.ts` +1 line `output: "standalone",` under `distDir` · `scripts/copy-standalone-assets.mjs` new, `cmp` equal to the skill's reference copy (made with `cp`) · `package.json` `build` → `next build && node scripts/copy-standalone-assets.mjs` · `.gitignore` +`*.zip`. Edited with a heredoc script that asserted exactly one match per change; CR count = LF count in all three edited files, measured after the edits (`next.config.ts` 18/18, `.gitignore` 49/49, `package.json` 52/52), so CRLF is kept.

**DoD, one by one**
1. Before: `git status --short` → empty (17:10, `nichaphon` `6a64527`). ✅
2. `git check-ignore -v scripts/copy-standalone-assets.mjs` → exit 1, no output. ✅
3. Install — **met by Sober's ruling (18:13, `[SA-decided]`), not by my run:** my own runs were `bun install --no-save` ×3 (two hung, one `--network-concurrency 8` ended 15 s, exit 0, `215 packages installed`); the owner then ran a plain `bun install` himself and Sober restored `bun.lock`. Evidence instead, at 18:14: `git status --short` → ` M .gitignore` ` M next.config.ts` ` M package.json` `?? scripts/copy-standalone-assets.mjs` (no `bun.lock`); `ls node_modules | wc -l` → `117`. I ran no install after the GO. ✅ (as ruled)
4. `bun run build` → `[postbuild] copied .next/static into .next/standalone`, `exit 0`. ✅
5. `ls .next/standalone/server.js .next/standalone/.next/static` → `.next/standalone/server.js`; `.next/standalone/.next/static:` `chunks  media  msON-BeWAJy1_ggsHM9__`. ✅ (AC-1)
6. `PORT=4391 HOSTNAME=127.0.0.1 BLUEPRINT_DEV_PAGES=1 node .next/standalone/server.js` → `▲ Next.js 16.3.6 · Local: http://127.0.0.1:4391 · ✓ Ready in 0ms`. curl `/` → `200`; `/_next/static/chunks/061_6pbo_e1nh.css` → `200`; `/dev/isolation/none` → `200`. ✅ (AC-2 HTTP)
7. Headless Chrome (Playwright from the repo's `node_modules`, `tests/harness/task-172/shot.cjs`) on `http://127.0.0.1:4391/`: status 200, 10 stylesheets loaded, **0 failed responses**, body font `"Sukhumvit Set", Thonburi, system-ui, sans-serif`. Screenshots `standalone-4391-home.png` and `standalone-4391-dev-isolation-none.png` — I looked at both: rounded white card on a light-grey page, bordered button, Thai type; the dev page shows heading / link / button / input / list / table, all styled, not bare HTML. ✅ (AC-2 styles). **What the home page shows is its "cannot reach the system" card (`ต่อระบบไม่ได้ตอนนี้` + `ลองใหม่`)** because no blueprint-back was running — I did not start one (not in this TASK). `UNVERIFIED — the screen with data (a real project, theme colours): settles with a run against a local blueprint-back (QA / owner).`
8. `BLUEPRINT_DEV_PAGES=1 node_modules/.bin/next start -p 4392` → `✓ Ready in 206ms` and the line `⚠ "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.`; the same three curls → `200 200 200`. ✅ Note: `next start` printed `Network: http://10.145.222.99:4392` (it binds all interfaces, unlike the standalone run on `127.0.0.1`); stopped at the end.
9. `NEXT_DIST_DIR=.next-a bun run build` → `[postbuild] copied .next-a/static into .next-a/standalone`, `exit 0`; `ls .next-a/standalone/server.js .next-a/standalone/.next-a/static` → `.next-a/standalone/server.js`; `.next-a/standalone/.next-a/static:` `chunks  gE2B6Hm4l5oizVDYeB-Lk  media`. ✅
10. `bun run typecheck` → `themes: clean-blue, luxury-gold, minimal-mono`, `exit 0`. ✅
11. After (18:16): `git status --short` → ` M .gitignore` ` M next.config.ts` ` M package.json` `?? scripts/copy-standalone-assets.mjs` — exactly the four; `grep -c bun.lock` on the status → `0`. ✅ (AC-5)
12. `git diff next.config.ts package.json .gitignore` (whole): `.gitignore` `+*.zip` after `/.next-*/` · `next.config.ts` `+  output: "standalone",` after the `distDir` line · `package.json` `-    "build": "next build",` → `+    "build": "next build && node scripts/copy-standalone-assets.mjs",`. `file next.config.ts` → `JavaScript source, Unicode text, UTF-8 text, with CRLF line terminators`. ✅
13. Servers stopped by pid (`Stop-Process -Id 14272` for 4392, `-Id 26920` for 4391); `Get-NetTCPConnection -LocalPort 4391,4392 -State Listen` → `(nothing listening on 4391/4392)`. ✅ (The two background tasks then reported "failed, exit 127" — they ended when I killed their processes; both had served the 200s above.)

**Artifact:** `.next/standalone/` · server start `node server.js` in it, `PORT` + `HOSTNAME=127.0.0.1` from env.

**Not run / not verified:** no `/impeccable audit` — no UI source changed (build config only), nothing to audit. The tests in `tests/` and `test:isolation` were not run (not in the DoD). Live behaviour on the Linux server is the owner's.

**Footprint left behind:** `.next/` and `.next-a/` (build output, both git-ignored; delete freely) · `node_modules/` (117 entries, the owner's install) · in the workspace: `tests/harness/task-172/` (`shot.cjs`, 2 PNGs). No test accounts or records were created.

**For the SA (observation, not a change):** bun 1.3.14 on this box logs `Unknown lockfile version … Ignoring lockfile` for the repo's `bun.lock` (`"lockfileVersion": 2`) — any install here resolves without the lockfile and rewrites it as version 1. Worth knowing for CI's install step.

## Questions

- SA note (Sober, 2026-10-31 18:08) — **your `bun install --no-save` (pid 27120, started 18:04) is stalled on the network, not working:** CPU time 0.5 s and flat over a 30 s sample; 271 handles unchanged; 64 HTTPS connections to the registry (104.16.x.x:443) open but idle; `node_modules` 0 entries at 18:07. (The PM says the earlier run hung ~50 min the same way.) The same install in my scratch clone of this repo finished in 110 s at 17:0x, so the packages are already in bun's local cache on this box. Do:
  1. Stop **your** pid 27120 (`Stop-Process -Id 27120`) — only that one.
  2. `bun install --no-save --network-concurrency 8` (fewer parallel downloads — the stall is in the downloads). Run it in the background and check CPU after 60 s (`(Get-Process -Id <pid>).TotalProcessorTime`).
  3. Still flat after 60 s → stop it, write the command and the two CPU readings here, and `@Sober` — do not try other install flags or plain `bun install` (it rewrites `bun.lock`, R2).

- FE answer (Fern, 2026-10-31 18:11) — **BLOCKED: steps 1–2 done, step 3 not reached, but the tree is no longer clean.** `@Sober`
  1. Stopped only my pids: 20932 (first run, ~50 min) and 27120 (second run, started 18:04). Both with `taskkill //PID … //F`.
  2. Ran `bun install --no-save --network-concurrency 8` (pid 27768, 18:09). CPU reading 1 at 18:09:42 = 23.5 s; the process **ended before the 60 s reading**, exit 0, `215 packages installed [15.02s]`. So it was not flat and not stalled.
  3. **The log of every one of my runs says** `error: Unknown lockfile version … bun.lock:2:22` then `warn: Ignoring lockfile` / `Resolving dependencies` — bun 1.3.14 cannot parse the repo's `bun.lock` (`"lockfileVersion": 2`), so it resolves from scratch. That is probably why the first two runs crawled.
  4. **Tree after (read at 18:11, `git status --short`):** ` M .gitignore`, ` M bun.lock`, ` M next.config.ts`, ` M package.json`, `?? scripts/copy-standalone-assets.mjs`. `git diff --stat -- bun.lock` → `20 insertions(+), 16 deletions(-)`; first hunk `-"lockfileVersion": 2,` → `+"lockfileVersion": 1,`. At 18:10:55 `bun.lock` was missing from the folder (` D bun.lock`, read at 18:11:02) and was back, rewritten, by 18:11:12. `node_modules` appeared 18:11:01 (118 entries at 18:11:12).
  5. **A plain `bun install` that is not mine ran in this folder in the same minute:** pid 25044, started 18:10:53, parent pid 27908 (already gone when I looked), no `--no-save`. A second plain `bun install` (pid 15248, parent 10184) was also running at 18:03. I did not start either and did not stop them. I cannot say which process deleted/rewrote `bun.lock`; my `--no-save` run is not cleared by this note.
  6. **I stopped here.** DoD 3 and DoD 11 cannot pass as written (`git status` is not empty/exact; `bun.lock` is outside my list). I ran no git and did not touch `bun.lock` — restoring it is a git write or an off-list file edit, so it is your call. No build, no server, no screenshot yet (DoD 4–10, 13 not run).
  - **Need from you:** (a) who else is running `bun install` here — stop them; (b) how `bun.lock` is put back to `6a64527` (I do not run git); (c) then say "go" and I continue DoD 4 onward with `node_modules` as it is now.
  > answer (Sober, SA, 2026-10-31 18:13) **(a) the owner** — he ran plain `bun install` in both Blueprint repos himself (*"ฉันinstallเอง หมดแล้ว"*, PM inbox 18:12); nothing to stop, no bun process running at 18:13. (b) **Done by me, no git write:** I backed up the rewritten file, then copied HEAD's working-tree form (`git cat-file --filters HEAD:bun.lock`, a read) over `bun.lock` with `cp`; `cmp` equal; `git status --short` at 18:13 → exactly your 4 paths, no `bun.lock`; `node_modules` 117 entries. Same done in blueprint-back. `[SA-decided]` — reversible (backups in my scratch). (c) **Go: continue from DoD 4 with `node_modules` as it is.** Do **not** run any `bun install` again. DoD 3 counts as met by this state: paste `git status --short` (your 4 paths only) and `ls node_modules | wc -l` instead of the install line. Your `--no-save` run is not suspected. If `bun.lock` shows as ` M` again at DoD 11, stop and `@Sober` — do not touch it.

## Review

**DONE** — Sober (SA, Team A), 2026-10-31 18:19. Reviewed against SPEC-127 § D1 and the evidence above; decisive checks re-run by me in the owner's checkout (`nichaphon` 6a64527):
- Tree: `git status --short --untracked-files=all` → ` M .gitignore` ` M next.config.ts` ` M package.json` `?? scripts/copy-standalone-assets.mjs` — exactly the closed list, no `bun.lock`; `git diff --stat` 3 insertions, 1 deletion; `cmp` of the new script vs the skill's reference → equal; `next.config.ts:7` `output: "standalone"` under `distDir`; `build` as specified, `prebuild`/`dev`/`start` unchanged.
- Ignores: `.next/standalone/…` → `.gitignore:12:/.next/` · `.next-a/standalone/…` → `.gitignore:48:/.next-*/` · `x.zip` → `.gitignore:49:*.zip`.
- Fresh build (`rm -rf .next`): `bun run build` → exit 0, `[postbuild] copied .next/static into .next/standalone`; `server.js` present (AC-1). Standalone serve on 4491 → `/` 200 · static CSS 200 · `/dev/isolation/none` 200 (AC-2 HTTP); stopped by port (pid 17948).
- Screenshots looked at: home = the styled "ต่อระบบไม่ได้ตอนนี้" card (no back running), dev page = styled heading/button/input/list/table — not bare HTML (AC-2 styles). The screen with real data is UNVERIFIED, as Fern wrote; not an AC.
- Beyond the DoD, for AC-5: `bun test src` → 238 pass / 0 fail, same as base (scratch 6a64527: 238 / 0); `bun run dev` (port 3100) → `/` 200, `/dev/isolation/none` 200; stopped by pid (12060, 17612, 27132, 26360); tree unchanged after.
- DoD 3 met by my 18:13 ruling (owner's install, `bun.lock` restored). No app code, no git. Fern's note on the v2 lockfile is SPEC-127 R2 follow-up / R6.
