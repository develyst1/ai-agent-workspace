# TASK-161: blueprint-front — theme fonts from the repo, so a fresh clone builds the first time (REQ-123 round 2)
- Source: SPEC-122 (D1, D2)
- Owner: FE (Fern)
- Status: DONE (2026-10-30 21:26, Sober; built by Fern, REVIEW 21:23)
- Depends on: REQ-123 round 1 committed (blueprint-front 3096bca) ✓
- Git writes: none (the SA commits on the owner's word)

## What to do
1. Copy the font files from the workspace `i-space/ai-worker/tests/harness/req-123-r2/fonts/` into blueprint-front, byte for byte (no rebuild, no rename):
   - `anuphan.woff2`, `anuphan.OFL.txt` → `src/themes/clean-blue/fonts/`
   - `noto-sans-thai.woff2`, `noto-sans-thai.OFL.txt` → `src/themes/minimal-mono/fonts/`
   - `noto-sans-thai-looped.woff2`, `noto-sans-thai-looped.OFL.txt`, `noto-serif-thai.woff2`, `noto-serif-thai.OFL.txt` → `src/themes/luxury-gold/fonts/`
2. Change the three loaders exactly as `i-space/ai-worker/tests/harness/req-123-r2/fonts-local.patch` (from the repo root: `git apply --check <patch>` then `git apply <patch>`; it applies to 3096bca as is):
   `src/themes/clean-blue/font.ts` · `src/themes/minimal-mono/font.ts` · `src/themes/luxury-gold/ThemeRoot.tsx`.
3. Nothing else. No README change (SPEC-122 D3), no dependency, no other file.

**Closed file list (11):** the 3 files above + the 8 new files of step 1.

## Definition of Done
Run from the blueprint-front root unless stated. `<H>` = the workspace's `i-space/ai-worker/tests/harness/req-123-r2`.
- [ ] 1. Before. `git status --short` → empty (base: empty, 3096bca, run 2026-10-30 21:1x)
- [ ] 2. `(cd src/themes && sha256sum clean-blue/fonts/* minimal-mono/fonts/* luxury-gold/fonts/* | awk '{print $1}' | sort -u) | diff - <(awk '{print $1}' <H>/fonts/SHA256SUMS | sort -u)` → no output (base: n/a — new: the files do not exist yet). Note: the two Noto OFL texts are identical, so `sort -u` on both sides.
- [ ] 3. `grep -rn "next/font/google" src | wc -l` → `0` (base: `3`)
- [ ] 4. `git diff --stat` → the 3 loader files only, `3 files changed, 18 insertions(+), 15 deletions(-)` (base: n/a — new: no diff on the base)
- [ ] 5. `bun run typecheck` → exit 0 (base: exit 0, TEST-120 AC-8 on the same tree)
- [ ] 6. `bun test src scripts` → `246 pass`, `0 fail` (base: 246 pass / 0 fail, TEST-120 AC-8)
- [ ] 7. **Offline build, fresh `.next`:** `rm -rf .next && timeout -k 5 300 unshare -rn sh -c 'ip link set lo up; NEXT_TELEMETRY_DISABLED=1 exec bun run build'` → exit 0, `✓ Compiled successfully` (base: **exit 1**, `There was an issue establishing a connection while requesting https://fonts.googleapis.com/css2?family=Anuphan…`, SPEC-122 E2). `ip link set lo up` is needed: without it the build hangs.
- [ ] 8. `ls .next/static/media | grep -c woff2` → `4`, and `grep -rl fonts.gstatic .next/static .next/server | wc -l` → `0` (base: `13` woff2 from Google, SPEC-122 E1)
- [ ] 9. **Half-way stop, then build:** `rm -rf .next && timeout -s KILL 9 bun run build; ps -eo pid,cmd | grep next-build | grep -v grep` → exit 137 and no `next-build` left; then DoD 7's command again → exit 0 (base: n/a — on the base the second build needs the internet; SPEC-122 E4 is the patched run)
- [ ] 10. The built app serves: `PORT=<free port> bun run start` → `curl -s -o /dev/null -w '%{http_code}' localhost:<port>/` → `200` (base: `200`, TASK-156 DoD 7). Stop **your own** process by its port afterwards (`ss -ltnp`), never by name.
- [ ] 11. `git status --short --untracked-files=all` → ` M` the 3 loaders + `??` the 8 font paths, nothing else; and `git check-ignore -v <each new path>` → exit 1 (base: exit 1 for the new paths, run 2026-10-30 21:1x)
- [ ] 12. Memory and processes left: `ps -eo pid,rss,cmd | grep -E "next-build|next-server" | grep -v grep` → none of yours, plus `free -m` pasted.

## Implementation Notes
Fern, 2026-10-30, stamped from `date` (21:21 start → 21:23 end). `blueprint-front`, branch `atom`, HEAD `3096bca`, tree clean before. No git write run.

**What changed (the 11 paths):** copied the 8 files from `<H>/fonts/` byte for byte into `src/themes/{clean-blue,minimal-mono,luxury-gold}/fonts/` (as listed in step 1); `git apply --check` then `git apply` of `<H>/fonts-local.patch` → `applied`. The diff swaps `next/font/google` for `next/font/local` in `clean-blue/font.ts` (Anuphan, 400–700), `minimal-mono/font.ts` (Noto Sans Thai, 400–800) and `luxury-gold/ThemeRoot.tsx` (Noto Serif Thai 500–700, Noto Sans Thai Looped 400–600). Nothing else touched.

**DoD**
- 1. Before: `git status --short` → empty, `HEAD` 3096bca ✓
- 2. sha256 of the 8 copied files vs `<H>/fonts/SHA256SUMS`, both through `sort -u` → `diff` output empty ✓. (Observation: the two *Noto* OFL texts are not all identical — `noto-sans-thai-looped.OFL.txt` hashes `dad6e6ab…`, the other two `2e98fd23…`; same size class, 4380 bytes. `sort -u` on both sides absorbs it; no action.)
- 3. `grep -rn "next/font/google" src | wc -l` → `0` (base `3`) ✓
- 4. `git diff --stat` → `3 files changed, 18 insertions(+), 15 deletions(-)` ✓ (the three loaders only)
- 5. `bun run typecheck` → exit 0 ✓ · 6. `bun test src scripts` → `246 pass / 0 fail`, `2500 expect() calls`, `Ran 246 tests across 11 files. [6.45s]` ✓
- 7. `rm -rf .next && timeout -k 5 300 unshare -rn sh -c 'ip link set lo up; NEXT_TELEMETRY_DISABLED=1 exec bun run build'` → exit 0, `✓ Compiled successfully in 11.1s` ✓
- 8. `ls .next/static/media | grep -c woff2` → `4`; `grep -rl fonts.gstatic .next/static .next/server | wc -l` → `0` ✓
- 9. `rm -rf .next && timeout -s KILL 9 bun run build` → exit 137 (`Killed`); `ps -eo pid,ppid,rss,cmd | grep -E "next-build|next build"` → nothing left; `.next` then held `build cache diagnostics`. Then DoD 7's command again → exit 0, `✓ Compiled successfully in 12.0s`, 4 woff2 ✓. I ran the kill twice (once to look, once chained with the rebuild); both gave 137 and a clean second build.
- 10. `PORT=3191 bun run start` → `✓ Ready in 91ms`; `curl -s -o /dev/null -w '%{http_code}' localhost:3191/` → `200` ✓. Stopped by pid 1724358 (found by `ss -ltnp` on 3191); `ss -ltn` → 3191 free.
- 11. `git status --short --untracked-files=all` → ` M` the 3 loaders + `??` the 8 font paths, nothing else; `git check-ignore -v` on the 8 new paths → no output, exit 1 ✓
- 12. After: `ps -eo pid,rss,cmd | grep -E "next-build|next-server"` → one `next-server` (pid 1722599, 190 MB) that is not mine (mine was 1724358, stopped). `free -m` → `Mem: 16002 total, 6370 used, 6362 free, 44 shared, 3643 buff/cache, 9631 available` ✓
- Not run: the pages were not looked at in a browser, so that each theme *renders* its font is UNVERIFIED — a screenshot of each theme's page would settle it; the TASK did not ask for one. The offline build and the 4 woff2 files in `.next/static/media` show the fonts are bundled, not that they paint.
- Footprint: scratch logs in the session scratchpad only; no ports left, no test data.

## Questions

## Review
**DONE — Sober, 2026-10-30 21:26.** Built as SPEC-122 D1/D2, with evidence on all 12 DoD lines. I re-ran the decisive checks on the real tree (3096bca + 11 paths):
- `diff <(git diff -- src) <H>/fonts-local.patch` → no output (the diff is the patch, byte for byte). The sha256 of each of the 8 font files matches its own line in `SHA256SUMS`. `grep -rn next/font/google src` → 0. `git status` = 3 `M` + 8 `??`, nothing else.
- `bun run typecheck` → exit 0. `bun test src scripts` → 246 pass / 0 fail.
- Offline build (DoD 7's command) → exit 0. 4 woff2 in `.next/static/media`, 0 files with `fonts.gstatic`.
- **Painting (Fern's UNVERIFIED line), checked by me.** The built CSS has 4 `@font-face` rules (`monoFont` 400 800 · `"serif"` 500 700 · `sans` 400 600 · `cleanBlueFont` 400 700). `next/font/local` names each face after its JS const, so the gold theme's serif face is literally `"serif"`. Next quotes it wherever it is used (`--lg-font-serif:"serif", "serif Fallback"`), so it cannot be read as the generic `serif`. I loaded those rules with the built woff2 files in headless Chrome: `document.fonts` → `monoFont=loaded | serif=loaded | sans=loaded | cleanBlueFont=loaded`. In the screenshot, the custom `"serif"` line draws Noto Serif Thai, the generic `serif` line draws a different (system) face, and the looped, Mono 800 and Anuphan lines each draw their own face. This proves the faces load and paint. It does not prove the themed pages look the same as before: that is QA's AC-10.
- Fern's DoD 2 note is right. Of the three Noto OFL texts, `noto-sans-thai` and `noto-serif-thai` are identical (`2e98fd23…`); `noto-sans-thai-looped` differs (`dad6e6ab…`). My TASK's wording ("the two Noto OFL texts are identical") was loose; the command was right.
- Tree for git: `tree-fp blueprint-front HEAD 3096bca fp 7977f1cccca9 (317 paths: 309 tracked, 8 untracked, 0 deleted)`.
