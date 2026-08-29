# TASK-130: `line:adopt-menus` — store the OA's existing rich-menu ids into the DB
- Source: SPEC-038
- Status: DONE (SA-reviewed, Sober 2026-08-16)
- Assignee: @Jason (BE)
- Depends on: none

## Context (why)
REQ-042: on UAT the role change (`สมัคร` → ผู้ปกครอง) doesn't switch the rich menu. Diagnosis (grounded
in code + the owner's `line:inspect-menus` output): `app_settings.line_rich_menu_ids` is **empty** in
the DB the runtime reads, while the OA **already has** our four menus (published before; ids never
stored / lost — the 2026-08-11 log records `app_settings` was "already empty" on the shared DB). So
`linkRoleRichMenu` (`src/lib/line-rich-menu.ts:201`) finds no target id and **silently no-ops**
(the failure is also swallowed at `src/services/line-webhook.service.ts:462`) → link completes, menu
never switches.

The fix is to put the **existing** ids into the DB — **not** republish (which would create duplicate
menus and reset the channel default, customer-visible if it's the customer OA). This helper does that
with zero OA write beyond a read.

## What to do
Add a re-runnable script `scripts/line-adopt-menus.ts` wired as `"line:adopt-menus"` in
`package.json` (mirror the existing `line:inspect-menus` / `line:publish-menus` entries), plus a pure,
tested selection function.

1. **Pure function** (unit-testable, no IO) — e.g. `selectMenuIds(menus: {richMenuId, name}[]): MenuIds`:
   - Map the four canonical names → the `MenuIds` keys, exactly as `publishRichMenus` creates them:
     `smart-scheduler-parent-th → parentTH`, `smart-scheduler-parent-en → parentEN`,
     `smart-scheduler-teacher-th → teacherTH`, `smart-scheduler-teacher-en → teacherEN`
     (names are defined on the `RichMenuDef`s in `src/lib/line-rich-menu.ts`).
   - **Deterministic pick when a name repeats** (the current OA has 2 of each): pick the **last**
     occurrence in `/richmenu/list` order and document that choice in a comment. (Any correct-areas
     menu of that name works; determinism is what matters so re-runs are stable.)
   - Return the `MenuIds`; report which of the four names were **not** found (so the operator sees a
     gap rather than a silent partial).
2. **Script** `main()`:
   - Require `LINE_CHANNEL_ACCESS_TOKEN` (fail clearly if missing, like the other two scripts).
   - `listRichMenus()` → `selectMenuIds(...)`.
   - If any of the four names is missing, print what's missing and **exit non-zero without writing**
     (don't store a half map).
   - Otherwise **upsert** into `app_settings` under key `line_rich_menu_ids` using the **same** upsert
     `publishRichMenus` uses (`insert(appSettings).values({key, value}).onConflictDoUpdate(...)`) —
     reuse a shared helper if clean, or replicate the one statement.
   - Print the four adopted ids.
   - **MUST NOT** call `createRichMenu`, `uploadRichMenuImage`, `linkRichMenuToUser`, or
     `setDefaultRichMenu`. No menu is created, linked, deleted, or made default. Read + one DB upsert.
3. Idempotent: running twice stores the same ids and is harmless.

## Definition of Done
- [ ] `bun run line:adopt-menus` exists and, against an OA that has the 4 named menus, upserts
      `app_settings.line_rich_menu_ids` and prints the 4 ids.
- [ ] Missing-name case exits non-zero and writes nothing (verified by the pure function's behaviour
      + a guard in `main`).
- [ ] The pure selector has unit tests: all-four-present (incl. the duplicate-name case → deterministic
      pick) and a missing-name case. `bun test` green.
- [ ] `bunx tsc --noEmit` = 0.
- [ ] Grep proof of "no OA write": the script imports **none** of `createRichMenu`,
      `uploadRichMenuImage`, `linkRichMenuToUser`, `setDefaultRichMenu`.
- [ ] Paste the `--help`/run output shape (redact ids) + test output into Implementation Notes.

## Implementation Notes
Built on `smart-scheduler-back@dong` (repo root on this machine is **`H:\scheduler`**, not the
`C:\Users\Admin\develyst\smart-scheduler` still named in board.md § Project info — owner changed machines).

**Files**
- `scripts/line-adopt-menus.ts` (new) — the script + the pure `selectMenuIds()`; `NAME_TO_KEY` is built from
  the four `RichMenuDef.name`s themselves (`PARENT_RICH_MENU`, `PARENT_RICH_MENU_EN`, `TEACHER_RICH_MENU`,
  `TEACHER_RICH_MENU_EN`) rather than re-typing the strings, so the mapping cannot drift from what
  `publishRichMenus` creates.
- `src/lib/line-adopt-select.test.ts` (new) — 4 unit tests on the pure selector.
- `src/lib/line-rich-menu.ts` (modified, 6 lines) — extracted the existing upsert into exported
  `storeMenuIds(ids)`; `publishRichMenus` now calls it. This is the "reuse a shared helper if clean" option in
  the task: it keeps `MENU_IDS_KEY` (unexported) and the `onConflictDoUpdate` statement in **one** place
  instead of copying them into the script. No behaviour change to publish.
- `package.json` — `"line:adopt-menus": "bun run scripts/line-adopt-menus.ts"`, next to the other `line:*`.

**Behaviour** — matches "What to do" 1–3: require `LINE_CHANNEL_ACCESS_TOKEN` (else clear error, exit 1) →
`listRichMenus()` → `selectMenuIds()` → if any of the four canonical names is missing, print which and
**exit 1 having written nothing** → else one `storeMenuIds()` upsert → print the four ids. Duplicate names:
**last occurrence in `/richmenu/list` order wins** (documented in the function comment) — any menu of that name
works, so the point is that re-runs pick the same one. Idempotent by construction.

**Verification (commands + results, run in `H:\scheduler\smart-scheduler-back`)**
- `bunx tsc --noEmit` → **exit 0**.
- `bun test src/lib/line-adopt-select.test.ts` → **4 pass / 0 fail**, 9 expects.
- `bun test` (whole suite) → **462 pass / 0 fail**, 59 files, 1157 expects.
- Grep proof of "no OA write":
  `grep -nE "createRichMenu|uploadRichMenuImage|linkRichMenuToUser|setDefaultRichMenu" scripts/line-adopt-menus.ts`
  → **no matches (exit 1)**. The script imports only `listRichMenus`, `storeMenuIds`, the four menu defs and
  the `MenuIds` type.

**What I did NOT do, deliberately** — I never executed `bun run line:adopt-menus`. Its guard reads
`LINE_CHANNEL_ACCESS_TOKEN`, and per PROTOCOL's brownfield warning Bun auto-loads the checked-in `.env`, so even
a "no token, it will just exit" run would reach a real OA and a real DB. So DoD bullet 1's runtime half (an OA
that actually has the four menus → ids stored + printed) is the **operator's STEP 3a run on the server**; what I
can evidence here is the parse/typecheck, the selector's behaviour and the missing-name guard. Expected output
shape (ids redacted):
```
✓ Adopted the OA's existing rich menus (stored in app_settings.line_rich_menu_ids):
  parent-TH : richmenu-XXXX…
  parent-EN : richmenu-XXXX…
  teacher-TH: richmenu-XXXX…
  teacher-EN: richmenu-XXXX…
No menu was created, linked, deleted, or made default. Verify with `bun run line:inspect-menus`.
```
and on a gap:
```
✗ line:adopt-menus — the OA has 8 menu(s), but these are missing:
  - smart-scheduler-parent-en
Nothing was stored (a half map would leave the switch broken for those roles).
```
Note for STEP 4: the owner's STEP-1 output showed the channel default is **not** one of our ids, and adopt does
not (and must not) change the default — so `line:inspect-menus` after adopt will show the 4 ids `FOUND` but the
default line may still read `⚠️ NOT one of our stored ids`. That is expected and is not a failed adopt; the
per-user link on role change is what REQ-042 is about.

**Changes are uncommitted** on `dong` (4 files). Say the word and I'll commit; I didn't want a commit racing a
review.

## Questions
- Q1 (non-blocking, for STEP 4): SPEC-038 STEP 4.1 expects `default = our parentTH`. Adopt deliberately doesn't
  set the default, and the OA's current default is an id we don't own. If AC-5/AC-6 turn out to need the default
  to be ours, that is a **set-default OA write on the customer-facing OA** — a separate decision, not something
  I'd fold into this script. Flagging so the re-verify isn't read as a failure.

  > answer (Sober 2026-08-16): **Correct, and it does not block — you scoped it right.** REQ-042 is about the
  > **per-user menu switch** on role change / lang toggle (`linkRichMenuToUser` via `linkRoleRichMenu`), which needs the
  > ids in `app_settings` — exactly what adopt gives it. The **channel default** only affects a follower with **no
  > per-user link** (a brand-new, unregistered follower), and the owner's STEP-1 output showed that default is already a
  > menu with correct areas (one of the OA's parent-th duplicates), so even that user sees a working menu. So a default
  > that isn't "one of our stored ids" is **bookkeeping, not a functional failure** — do NOT set-default from this script
  > (that's a customer-visible OA write on this OA). I've corrected SPEC-038 STEP 4.1 so the re-verify treats "4 ids
  > FOUND; default line may still say ⚠️ NOT one of ours" as the **expected pass**. If the owner ever wants the default
  > to be a known-owned menu (tidier, single-source), that's a separate, deliberate, owner-gated `setDefaultRichMenu`
  > call — not this REQ.

## Review
**PASS ✅ (Sober 2026-08-16).** Reviewed against SPEC-038 STEP 3a + the DoD; reproduced, not trusted.
- **Reproduced:** `bunx tsc --noEmit` = **0**; `bun test src/lib/line-adopt-select.test.ts` = **4 pass / 0 fail**;
  full suite `bun test` = **462 pass / 0 fail** (the shared-file `storeMenuIds` extraction caused no regression).
- **Zero-OA-write confirmed:** `grep -nE "createRichMenu|uploadRichMenuImage|linkRichMenuToUser|setDefaultRichMenu"
  scripts/line-adopt-menus.ts` → **no matches**. The script imports only `listRichMenus`, `storeMenuIds`, the 4 menu
  defs + `MenuIds`. Read + one upsert, exactly as specced.
- **Selector is right:** `NAME_TO_KEY` is built from the `RichMenuDef.name`s themselves (can't drift from
  `publishRichMenus`); duplicate names → **last wins, deterministic** (tested, incl. idempotency); a missing name is
  reported and `main` **exits 1 writing nothing** (no half map); foreign menus ignored. Matches the DoD line-for-line.
- **Surgical:** `storeMenuIds` extracted (6 lines), `publishRichMenus` now calls it — no behaviour change; the upsert +
  `MENU_IDS_KEY` stay in one place. 4 files touched, all expected. Good, clean ownership.
- **Not run by design** (correct): executing it would reach the real OA+DB via the checked-in `.env` — that's the
  **owner's STEP 3a run on the server**. The runtime half of DoD bullet 1 is verified there.

**Verdict: DONE.** Commit `dong` on the owner's word (Jason flagged he held the commit to avoid racing review — go ahead).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-130 | scheduler-back (BE): `line:adopt-menus` — store the OA's **existing** rich-menu ids into `app_settings.line_rich_menu_ids` (read + one upsert; NO create/link/delete/set-default) — the REQ-042 fix (DB missing ids → menu switch silently no-ops) | SPEC-038 (REQ-042) | ✅ **DONE** (SA-reviewed Sober 2026-08-16 — **reproduced**: tsc 0 · selector 4/4 · full suite **462 pass/0 fail** · no-OA-write grep clean; selector deterministic last-wins + missing-name guard + foreign-menu ignore all correct; `storeMenuIds` extracted surgically, publish unchanged; not run by design → owner runs STEP 3a server-side. Jason's Q1 answered: adopt doesn't set default = expected/OK; SPEC-038 STEP 4.1 corrected.) · _prior:_ 🔎 REVIEW (Jason 2026-08-16 — `scripts/line-adopt-menus.ts` + `line:adopt-menus` + pure `selectMenuIds` (last-occurrence pick, missing-name ⇒ exit 1 writing nothing); upsert extracted to shared `storeMenuIds()`. tsc 0 · **462/0** · grep proof clean. NOT executed — `.env` auto-load would hit the real OA/DB; the run is the owner's STEP 3a. Uncommitted on `dong`.) | Jason | — |
```
