# TASK-174: caw-front — standalone output + static copy in `build` (REQ-128)
- Source: SPEC-128 D1
- Owner: FE (Fanta)
- Status: DONE (2026-10-31 18:53, Silver; § Review — was REVIEW 18:51, Fanta)
- Depends on: none — base `e7a36eb` on **`nichaphon`**, the owner's checkout on his Windows box (`machine.local.md` → `caw-front`; DECISIONS 2026-10-31 18:4x). **Not `atom`.** No git (the owner's word only).

## What to do

Build configuration only — no file under `src/`, no test, no README change.

1. `bun install --no-save` if `node_modules` is missing. **Never a plain `bun install`** — it rewrites `bun.lock` (SPEC-128 § Lockfile).
2. `next.config.ts`: add the line `  output: "standalone",` right after `  distDir: process.env.NEXT_DIST_DIR || ".next",`. Keep the rest as it is and keep the file's CRLF line endings.
3. New `scripts/copy-standalone-assets.mjs`: copy it **byte for byte** from the workspace's `.claude/skills/deploy-ready-build/references/copy-standalone-assets.mjs`.
4. `package.json`: `"build": "next build"` → `"build": "next build && node scripts/copy-standalone-assets.mjs"`. Change no other script.
5. `.gitignore`: add one line, `*.zip`, at the end.
6. Build into **`.next-f`** (your folder in the map; a new name gets written into the tracked `tsconfig.json`, SYSTEM-FACTS F-003).

Closed file list: `next.config.ts` · `scripts/copy-standalone-assets.mjs` (new) · `package.json` · `.gitignore`. Anything else changed ⇒ stop and ask in `## Questions`.

Artifact line for your Implementation Notes: artifact `<distDir>/standalone/`. On the server it starts with `node server.js` inside that folder, with `PORT`, `HOSTNAME=127.0.0.1`, `CAW_API_URL` and `BLUEPRINT_URL` from the environment.

## Definition of Done
Run every command in the owner's `caw-front` checkout. Paste the real output.

- [ ] 1. Before: `git status --short --untracked-files=all` → empty (base: empty, run 2026-10-31 18:47 after the SA restored `bun.lock`)
- [ ] 2. `git diff -- next.config.ts package.json` → exactly the two one-line changes of steps 2 and 4 (base: n/a — new: this TASK makes them)
- [ ] 3. `cmp scripts/copy-standalone-assets.mjs <workspace>/.claude/skills/deploy-ready-build/references/copy-standalone-assets.mjs` → no output, exit 0 (base: n/a — new: the file does not exist)
- [ ] 4. `git check-ignore -v scripts/copy-standalone-assets.mjs` → exit 1, no output (base: exit 1, run 18:47)
- [ ] 5. `NEXT_DIST_DIR=.next-f bun run build` → exit 0 and its last line is `[postbuild] copied .next-f/static into .next-f/standalone` (base: exit 0, no postbuild line, `.next-f/standalone` absent — run 18:45)
- [ ] 6. `ls .next-f/standalone/server.js && ls -d .next-f/standalone/.next-f/static` → both listed (base: `No such file or directory`; SA scratch probe P4 with the change: both listed)
- [ ] 7. `PORT=<free> HOSTNAME=127.0.0.1 CAW_API=mock node .next-f/standalone/server.js` in the background, then `curl -s -o /dev/null -w '%{http_code}'` on `/`, `/start`, one `/_next/static/chunks/<name>.css` and one `.js` taken from the home page's HTML → `200` ×4 (base: n/a — no standalone server; SA probe P4: 200 ×4). Stop it **by its pid** from the port (`Get-NetTCPConnection -LocalPort <port>` → `Stop-Process -Id`), never by name.
- [ ] 8. Open `http://127.0.0.1:<port>/` from step 7 in the browser (headless is fine) → the page has its styles: a screenshot, or the computed `font-family`/`background-color` of `body` not the browser default (REQ-128 AC-2) (base: n/a — new)
- [ ] 9. `NEXT_DIST_DIR=.next-f CAW_API=mock bunx next start -p <free>` (the Playwright consumer, `playwright.config.ts:34`) → `curl` `/` and the CSS from step 7 → `200` ×2 (base: n/a; SA probe P5: 200 ×2, no warning line)
- [ ] 10. `bun run typecheck` → exit 0 (base: exit 0, run 18:45)
- [ ] 11. `bun test src` → `370 pass`, `0 fail` (base: 370 pass / 0 fail, 27 files, run 18:45)
- [ ] 12. After: `git status --short --untracked-files=all` → exactly ` M .gitignore`, ` M next.config.ts`, ` M package.json`, `?? scripts/copy-standalone-assets.mjs` — no `bun.lock`, no build output (base: empty)

## Implementation Notes
Fanta, 2026-10-31 18:51. Repo `caw-front` = the owner's checkout, branch `nichaphon`, HEAD `e7a36eb`, no git write by me.

**What changed (4 files, build config only):** `next.config.ts` +`  output: "standalone",` after the `distDir` line · `scripts/copy-standalone-assets.mjs` new, byte-for-byte from the skill · `package.json` `build` → `next build && node scripts/copy-standalone-assets.mjs`, no other script · `.gitignore` +`*.zip` at the end. CRLF kept: `next.config.ts` 12/12, `package.json` 40/40, `.gitignore` 41/41 lines have CR (`git ls-files --eol`: `i/lf w/crlf`, `core.autocrlf=true`). `node_modules` was present, so no `bun install` ran.

**Artifact:** `<distDir>/standalone/` (here `.next-f/standalone/`). On the server: `node server.js` inside that folder with `PORT`, `HOSTNAME=127.0.0.1`, `CAW_API_URL`, `BLUEPRINT_URL` from the environment.

**DoD, run 2026-10-31 18:4x–18:51:**
1. `git status --short --untracked-files=all` before → empty (branch `nichaphon`, HEAD `e7a36eb`). PASS
2. `git diff -- next.config.ts package.json` → exactly `+  output: "standalone",` and `-    "build": "next build",` / `+    "build": "next build && node scripts/copy-standalone-assets.mjs",`. PASS
3. `cmp scripts/copy-standalone-assets.mjs <skill>/references/copy-standalone-assets.mjs` → no output, exit 0. PASS
4. `git check-ignore -v scripts/copy-standalone-assets.mjs` → no output, exit 1. PASS
5. `NEXT_DIST_DIR=.next-f bun run build` → exit 0; last line `[postbuild] copied .next-f/static into .next-f/standalone`. PASS
6. `ls .next-f/standalone/server.js` and `ls -d .next-f/standalone/.next-f/static` → both listed. The repo has no `public/` folder, so `standalone/public` is absent by design. PASS
7. `PORT=3790 HOSTNAME=127.0.0.1 CAW_API=mock node .next-f/standalone/server.js`, curl → `/` 200 · `/start` 200 · `/_next/static/chunks/2oraxoj-x1o5_.css` 200 · `/_next/static/chunks/07nldpx3i6mc_.js` 200. Stopped by the pid on the port (5576, `Get-NetTCPConnection` → `Stop-Process -Id`); nothing listening after. PASS
8. Opened `http://127.0.0.1:3790/` in the built-in browser: `body` computed `font-family` `"IBM Plex Sans Thai", "IBM Plex Sans Thai Fallback", ui-sans-serif, system-ui, sans-serif`, `background-color` `rgb(17, 19, 23)`, `color` `rgb(238, 240, 244)`, 5 stylesheets; screenshot shows the styled dark Board home. PASS (REQ-128 AC-2)
9. `NEXT_DIST_DIR=.next-f CAW_API=mock bunx next start -p 3791` → `/` 200 · the CSS 200 (×2). Stopped by pid 28240. **Differs from the base note:** `next start` prints `⚠ "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.` — SA's probe P5 recorded "no warning line". The two requests still return 200, so the DoD's `200` ×2 holds; the warning line is new and is in Questions Q1.
10. `bun run typecheck` → exit 0. PASS
11. `bun test src` → `370 pass`, `0 fail`, 27 files. PASS
12. `git status --short --untracked-files=all` after → ` M .gitignore`, ` M next.config.ts`, ` M package.json`, `?? scripts/copy-standalone-assets.mjs`. `git diff --stat -- tsconfig.json bun.lock` → empty; no build output in status (`.next-f` is ignored by `/.next-*/`). PASS

**Not run / not covered:** `/impeccable audit` — no screen or `src/` file changed, build config only. No git, no deploy, nothing outside `caw-front`. Test footprint: build output `.next-f/` (ignored, left in place — it is my own build folder); no test accounts or records created.

## Questions

- **Q1 (Fanta → Silver):** DoD 9 passes (200 ×2) but `next start` now prints the `output: "standalone"` warning above, which probe P5 did not see. Any consumer of `next start` (Playwright, `playwright.config.ts:34`) will print it on every start. It does not fail anything. Do you want it left as is, or does it change the SPEC-128 D1 decision? I changed nothing for it.
  > answer (Silver, 2026-10-31 18:53): Leave it as it is; D1 does not change. You are right: my P5 base ("no warning line") was wrong. The line is in my own probe output, and my grep could not match it (F-064, SPEC-128 P5 corrected). Blueprint shows the same warning (SPEC-127 P4), and it is harmless: `next start` still serves. `[SA-decided]`

## Review

**DONE — 2026-10-31 18:53, Silver.** The work meets SPEC-128 D1 and REQ-128 AC-1/AC-2/AC-5 (front).
- Scope: re-run by me on the owner's tree (`nichaphon`, HEAD e7a36eb). `git status --short --untracked-files=all` → ` M .gitignore`, ` M next.config.ts`, ` M package.json`, `?? scripts/copy-standalone-assets.mjs`, which is exactly the closed list. The diff is exactly `+*.zip`, `+  output: "standalone",` and the `build` line. `cmp` against the skill's reference → same. No `bun.lock` or `tsconfig.json` change.
- Re-run: `bun run typecheck` → exit 0; `bun test src` → 370 pass / 0 fail (= base). From Fanta's `.next-f` build: `PORT=4398 HOSTNAME=127.0.0.1 CAW_API=mock node .next-f/standalone/server.js` → `/` 200 · `/start` 200 · `/_next/static/chunks/2oraxoj-x1o5_.css` 200. Stopped by pid 15488.
- AC-2 "shows its styles": DoD 8, the computed `body` font and colours from a real browser, is accepted as evidence.
- DoD 9: the warning line comes from my wrong base (Q1). The 200s hold.
- Tree fingerprint for QA / git: `tree-fp H:/ispace/caw-front HEAD e7a36eb fp 2b90fa70abef` (147 paths, 1 untracked), 18:53.
- Artifact line present (§ Implementation Notes).
