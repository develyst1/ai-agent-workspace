# TASK-129: blueprint-back — reinstall packages after the 18:24 reboot
- Source: SPEC-105 (REQ-110). Repair only: REQ-110's back tree must run again before QA tests it.
- Owner: BE (Jason)
- Status: DONE
- Depends on: none

## Why
The box rebooted at 2026-10-29 18:24. In `blueprint-back`, `node_modules/` is missing, so every test fails with `Cannot find package 'drizzle-orm'`. **The source is intact:** no tracked file is missing (`git ls-files -d` → 0), and the refreshed REQ-110 patch still matches the tree (`git apply -R --check tasks/TASK-109-req110-only.patch` → OK, Sober 18:3x). `.env` is still there, so keep the `DATABASE_URL=pglite:memory` prefix as before.

## What to do
1. `bun install --frozen-lockfile`. It must not change `bun.lock` or `package.json`.
2. Run the DoD and paste the real output in § Implementation Notes.

Closed file list: `node_modules/` only (gitignored). No source edits, no git writes.

## Definition of Done
- [ ] 1. `git status --short | wc -l` → `18` (the same 9 ` M` + 9 `??` lines as before) (base: `18`, Sober 18:3x)
- [ ] 2. `git apply -R --check <workspace>/i-space/ai-worker/tasks/TASK-109-req110-only.patch` → no output, exit 0 (base: exit 0, Sober 18:3x)
- [ ] 3. `DATABASE_URL=pglite:memory bunx tsc --noEmit` → exit 0 (base: n/a, since there is no `node_modules`)
- [ ] 4. `DATABASE_URL=pglite:memory bun test --timeout 30000 test/interview test/seam` → `104 pass / 0 fail` (base: `test/seam` alone gives 5 fail / 5 errors, `Cannot find package 'drizzle-orm'`; before the reboot it was 104 / 0, TASK-126 § Review)

## Implementation Notes
Jason, 2026-10-29 ~18:50. Only `node_modules/` touched; no source edit, no git.
1. `bun install --frozen-lockfile` → `227 packages installed [231.00ms]`. `sha256sum -c` of `bun.lock` + `package.json` against hashes taken just before → both `OK`.
2. DoD 1: `git status --short | wc -l` → `18` (before and after the install).
3. DoD 2: `git apply -R --check tasks/TASK-109-req110-only.patch` → no output, exit 0.
4. DoD 3: `DATABASE_URL=pglite:memory bunx tsc --noEmit` → exit 0.
5. DoD 4: `DATABASE_URL=pglite:memory bun test --timeout 30000 test/interview test/seam` → `104 pass / 0 fail`, 564 expect() calls, 13 files [174.81s].
6. `ss -ltn` for :4200/:4500 → nothing left listening.

## Questions

## Review
Sober (SA, A), 2026-10-29 18:5x — **DONE.** Sober's re-run in `blueprint-back`:
- `git status --short | wc -l` → `18` · REQ-110 patch `git apply -R --check` → OK · `git diff --stat -- bun.lock package.json` → empty.
- `DATABASE_URL=pglite:memory bunx tsc --noEmit` → exit 0.
- `bun test --timeout 30000 test/interview test/seam` → `104 pass / 0 fail`, 564 expects, 13 files [177.19s].
- `ss -ltn` on :4200/:4500 → no listeners.
