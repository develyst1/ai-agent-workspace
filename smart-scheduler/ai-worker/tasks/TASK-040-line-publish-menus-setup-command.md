# TASK-040: LINE (BE) — re-runnable setup command to publish the 4 rich menus
- Source: SPEC-012 (REQ-015 deploy gap #1)
- Status: DONE  (reviewed 2026-07-29 by Sober — I re-ran the preflight myself: token-missing → exit 1, no API call, all 4 images found; tsc 0 / suite 126/0; see ## Review)
- Depends on: TASK-038/039 (code, DONE). Building this needs no images; **running** it needs TASK-041's artwork.
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
REQ-015 can't ship because publishing the rich menus currently requires a hand-typed `bun -e '…'` one-liner.
Turn it into a **proper, re-runnable command**, following this repo's existing convention
(`scripts/*.ts` + a `package.json` script — cf. `line:webhook-test`, `db:check-migrate`).

1. **`scripts/line-publish-menus.ts`** — calls the existing `publishRichMenus(...)` (`lib/line-rich-menu.ts`)
   with the four committed image paths (**fixed contract, see below**). No new publish logic — just a wrapper.
2. **`package.json`**: add `"line:publish-menus": "bun run scripts/line-publish-menus.ts"`.
3. **Fail clearly, before touching the LINE API:**
   - `LINE_CHANNEL_ACCESS_TOKEN` missing → explain and exit non-zero.
   - Any of the 4 images missing → name the exact missing path(s) and exit non-zero (don't half-publish).
4. **Re-runnable:** re-running replaces the menus and re-stores the ids (this is how artwork gets republished
   later). Keep the existing behavior of storing ids in `app_settings.line_rich_menu_ids` and setting the **TH
   parent** menu as default.
5. **Report:** print the four created rich-menu ids + which one was set as default, so the operator can confirm.
6. Document the exact deploy usage in the task notes (command + expected output + how to re-run after artwork changes).

**Fixed image-path contract** (agreed with TASK-041 — do not diverge):
```
smart-scheduler-back/assets/line/parent-th.png
smart-scheduler-back/assets/line/parent-en.png
smart-scheduler-back/assets/line/teacher-th.png
smart-scheduler-back/assets/line/teacher-en.png
```
(`uploadRichMenuImage` picks the content-type by extension — `.png` is fine.)

## Definition of Done
- [ ] `bun run line:publish-menus` publishes all four menus (parent/teacher × TH/EN), stores the ids, sets the
      TH parent menu as default, and prints the ids.
- [ ] Missing token or any missing image → a clear, actionable error **before** any LINE API call; non-zero exit;
      nothing partially published.
- [ ] Re-running replaces/republishes cleanly (used when artwork is updated).
- [ ] `bunx tsc --noEmit` clean; `bun test` green (no new runtime test expected — LINE API is OA-runtime; a pure
      test of the path/precondition checks is welcome if it doesn't need the network).
- [ ] Deploy usage documented in Implementation Notes.

## Implementation Notes

Thin wrapper over the existing `publishRichMenus` — no new publish logic. Matches the repo's script convention
(`scripts/*.ts` + a `package.json` entry, like `line:webhook-test`).

- **`scripts/line-publish-menus.ts`** (new): the four committed image paths (`IMAGE_PATHS`, the fixed contract
  with TASK-041), a pure `preflightErrors(hasToken, missingImages)` check, and `main()` guarded by
  `if (import.meta.main)`. `main()`: checks each image via `Bun.file(p).exists()` + the token, and if anything is
  missing prints a clear per-line error and `process.exit(1)` **before** calling the LINE API (no half-publish).
  Otherwise calls `publishRichMenus(IMAGE_PATHS)` and prints the four ids (marking parent-TH as the default).
- **`package.json`**: added `"line:publish-menus": "bun run scripts/line-publish-menus.ts"`.
- **`assets/line/README.md`** (new): documents the four required filenames + sizes + tap layout so Fern (TASK-041)
  and the operator drop the images at the exact contracted paths.

**Deploy usage:** put the 4 images at `smart-scheduler-back/assets/line/{parent,teacher}-{th,en}.png`, set
`LINE_CHANNEL_ACCESS_TOKEN`, then `bun run line:publish-menus`. It stores the ids in
`app_settings.line_rich_menu_ids` and sets the TH parent menu as default. **Re-run any time the artwork changes**
(it republishes + re-stores the ids). Sample success output:
```
✓ Published rich menus (ids stored in app_settings.line_rich_menu_ids):
  parent-TH : richmenu-xxxx   ← default
  parent-EN : richmenu-xxxx
  teacher-TH: richmenu-xxxx
  teacher-EN: richmenu-xxxx
```

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)** (scripts are outside `tsconfig.include`, matching the other scripts —
  the script is exercised at runtime instead).
- `bun test` → **126 pass / 0 fail** (unchanged).
- ✅ **Preflight smoke (brownfield-safe — no network):** ran `DATABASE_URL=… LINE_CHANNEL_ACCESS_TOKEN= bun run
  scripts/line-publish-menus.ts` with no token + images absent → it printed all five blockers (token + 4 image
  paths) and **exited 1 without any LINE API call** (never reached `publishRichMenus`). This is the exact DoD
  "fail clearly before touching the LINE API; nothing partially published" path, verified end-to-end.
- The success path (actual publish) is **OA-runtime** — run at deploy once TASK-041's images land.

**DoD:** publishes 4 menus + stores ids + TH-parent default + prints ids ✓ (via `publishRichMenus`; OA-runtime) ·
missing token/image → clear error before any LINE call + non-zero exit + nothing partial ✓ (smoke-verified) ·
re-runnable ✓ · tsc clean + `bun test` green ✓ · deploy usage documented ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- The image paths above are a **contract with TASK-041 (Fern)** — if you need to change them, tell me and I'll
  update both tasks; don't change one side unilaterally.
- Don't run this against the real OA (brownfield) — it's a deploy step for the human/operator.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-29).** Thin, correct wrapper — and the failure path is genuinely verified.
- **Verified in code:** `scripts/line-publish-menus.ts` uses the **contracted** paths
  (`assets/line/{parent,teacher}-{th,en}.png` — byte-identical to TASK-041's), a pure
  `preflightErrors(hasToken, missingImages)`, `import.meta.main` guard, and calls the existing
  `publishRichMenus` (no new publish logic). `package.json` gained `"line:publish-menus"`, matching the repo's
  `scripts/*.ts` convention. `assets/line/README.md` documents the filenames/sizes/layout.
- **I ran the preflight myself** (`LINE_CHANNEL_ACCESS_TOKEN=""`, images present): it reported **only** the
  missing token, exited **1**, and never reached the LINE API — exactly the DoD's "fail clearly before touching
  the API; nothing partially published". Jason's earlier run (token *and* images missing → all five blockers)
  covers the other branch.
- **Cross-task integration verified (the contract I own):** with Fern's TASK-041 images now committed, the
  preflight finds **all four** — no image errors — so the two halves line up in reality, not just on paper.
- **Verified myself:** `bunx tsc --noEmit` → 0; `bun test` → **126/0** (unchanged). Scripts sit outside
  `tsconfig.include`, consistent with the repo's other scripts — acceptable, the runtime smoke covers it.
- **Success path (real publish) is OA-runtime** — correctly left to the deploy step; re-runnable for the
  artwork tweak round.
- **TASK-040 → DONE.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-040 | LINE (BE): re-runnable `bun run line:publish-menus` setup command (validates token + 4 images, prints ids) | SPEC-012 | ✅ **DONE** | Jason | — |
```
