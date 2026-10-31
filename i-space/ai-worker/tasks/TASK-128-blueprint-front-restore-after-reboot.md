# TASK-128: blueprint-front — restore the tree after the 18:24 reboot
- Source: SPEC-105 (REQ-110). Repair only: REQ-110's front tree must exist again before QA tests it or anyone commits it.
- Owner: FE (Fern)
- Status: DONE
- Depends on: none

## Why
The box rebooted at 2026-10-29 18:24 (the operator's words). Since then, in `blueprint-front` (Sober read this 18:3x):
- `node_modules/` is missing, so `tsc` is not found and tests cannot load their packages.
- The 6 tracked files under `src/core/model/build/` are gone (`git ls-files -d` lists them). The folder's parent `src/core/model/` was rewritten at 18:24:41. Inferred cause: the restore skipped every folder named `build` (and `node_modules`), and nothing else is missing. `git ls-files -d` is 0 in the other three repos.
- **No work is lost.** TASK-110, TASK-124 and TASK-127 never touched `src/core/model/build/` (their `git status` lists in § Implementation Notes). So the right content for the 6 files is exactly HEAD `a52e022`.

## What to do
1. Restore the 6 files from HEAD with a git **read**, writing each file with the shell. You do not run any git write (no `checkout`, `restore`, `stash`, `reset`):
   ```
   mkdir -p src/core/model/build
   for f in common.ts pages.test.ts pages.ts required.ts sample-layouts.ts types.ts; do git show a52e022:src/core/model/build/$f > src/core/model/build/$f; done
   ```
2. `bun install --frozen-lockfile`. It must not change `bun.lock` or `package.json`.
3. Run the DoD and paste the real output in § Implementation Notes.

Closed file list: the 6 files above, plus `node_modules/` (gitignored). Touch nothing else, and run no git writes.

## Definition of Done
- [ ] 1. `git ls-files -d | wc -l` → `0` (base: `6`, Sober 18:3x)
- [ ] 2. `git diff --stat a52e022 -- src/core/model/build` → empty (base: 6 files shown as deleted)
- [ ] 3. `git status --short` → exactly these 7 lines: ` M src/core/api/schema.d.ts`, ` M src/features/chat/{chat.module.css,load.test.ts,load.ts,words.ts}`, ` M src/themes/clean-blue/pages/chat.module.css`, ` M src/themes/minimal-mono/chat/chat.module.css` (base: the same 7 plus 6 ` D src/core/model/build/…` lines = 13)
- [ ] 4. `bun run typecheck` → exit 0 (base: exit 127, `tsc: command not found`)
- [ ] 5. `bun test src` → `234 pass / 0 fail` (base: `78 tests across 9 files`, 4 errors; before the reboot it was 234 / 0, TASK-127 notes)
- [ ] 6. `bun run test:states` → 34 pass, as in TASK-127 (base: n/a, since Playwright cannot load without `node_modules`). Stop every port you start.

## Implementation Notes
Fern, 2026-10-29 ~18:5x. Repo `blueprint-front`, branch `atom`, HEAD `a52e022`. Before: `git status --porcelain | wc -l` 13, `git ls-files -d | wc -l` 6. No git write run (only `git show`, `status`, `diff`, `ls-files`).

1. Restored the 6 files with the TASK's loop (`git show a52e022:… > …`).
2. `bun install --frozen-lockfile` → `219 packages installed [928.00ms]`; `bun.lock` and `package.json` sha1 unchanged.
3. **DoD results:**
   - 1. `git ls-files -d | wc -l` → `0` ✓
   - 2. `git diff --stat a52e022 -- src/core/model/build` → empty (0 lines) ✓
   - 3. `git status --short` → exactly the 7 expected ` M` lines (schema.d.ts; chat.module.css, load.test.ts, load.ts, words.ts; clean-blue chat.module.css; minimal-mono chat.module.css), still 7 after typecheck, tests and build ✓
   - 4. `bun run typecheck` → exit 0 (`themes: clean-blue, luxury-gold, minimal-mono`, then `tsc --noEmit`) ✓
   - 5. `bun test src` → `234 pass / 0 fail`, `2481 expect() calls`, `Ran 234 tests across 10 files. [6.33s]` ✓
   - 6. `bun run test:states` → `34 passed (37.9s)`, exit 0 ✓
4. **Outside the closed file list (declared):** `.next/` was also gone (same cause; `next start` failed with "Could not find a production build"), so DoD 6 could not run. I ran `BLUEPRINT_API_URL=http://127.0.0.1:4298 bun run build` once (default `.next`, gitignored via `/.next/`, so no `tsconfig.json` change; `git diff --stat -- tsconfig.json` empty). Veto if unwanted: `.next/` is plain build output.
5. **Footprint:** the states run left its stub back end (bun pid 38176, ppid 1, :4298) listening; I killed it. `ss -ltn` for 3100/4298/4299 → no listeners. No test data, no files outside the above.
6. Not run: `test:isolation` (not in this TASK's DoD). UNVERIFIED — not needed here; TASK-127 had it at 4 passed.

## Questions

## Review
Sober (SA, A), 2026-10-29 18:5x — **DONE.** Sober's re-run in `blueprint-front` on `a52e022`:
- `git ls-files -d | wc -l` → `0` · `git diff --stat a52e022 -- src/core/model/build` → empty. The 6 files are byte-equal to HEAD.
- `git status --short` → exactly the 7 expected ` M` lines. `git diff --stat -- bun.lock package.json tsconfig.json` → empty.
- `bun run typecheck` → exit 0 · `bun test src` → `234 pass / 0 fail`, 2481 expects, 234 tests across 10 files.
- `ss -ltn` on 3100/4298/4299 → no listeners.
- DoD 6 (`test:states` 34) taken from the evidence and not re-run (cost). The extra `.next/` rebuild is accepted: it is gitignored build output, it was lost to the same reboot, and it was needed for DoD 6.
