# TASK-038: The Android back key closes an open dialog or menu first (D46 extended)
- Source: REQ-005 § Questions, D46 extended `[PM-decided 2026-11-01]`: "with a dialog or menu open, BACK closes that dialog only, like its cancel button (no step back, no leaving the app)" · TASK-037 § Review (the dialog case seen on the device)
- Owner: FE (Fanta), whole (PM's ruling, § Claim)
- Status: DONE 2026-11-01 (SA-B review below; Fanta released the emulator 23:52:37, test DB dropped)
- Depends on: TASK-037 (DONE). **Emulator:** the real-LINE live run and QA's re-test come first. Do the code and unit tests now; start the emulator only after SA-B relays the PM's "free".
- Repo: `corner-chat-app`. Files you may edit: `src/features/shell/backKey.ts` + `backKey.test.ts` · `src/features/placeholder/TabHeader.tsx` · `src/features/placeholder/SignOutDialog.tsx` · `src/features/conditions/ConditionsScreen.tsx` (the hook call only) · `src/features/line/LineLinkScreen.tsx` (the hook call only) · `../ai-worker/tests/harness/task-038/**`.
- Git writes allowed: **none.**

## Claim (for the PM)
The batch claim gives TASK-029's file list to Team A. That list includes `src/features/shell/**`, `src/app/**` and
`src/features/conditions/**`. This TASK touches `src/features/shell/backKey.ts` (from TASK-037) and
`src/features/conditions/ConditionsScreen.tsx` (one hook call), plus Team B's `src/features/placeholder/**` and
`src/features/line/**`. One item is not split across teams, so the PM gives it to one team whole. **SA-B's default: FE Fanta,
whole**, because TASK-037's back-key code is hers.

> ruling `[PM, 2026-11-01]`: **Team B, FE Fanta, whole.** It may touch the four files named above, including Team A's
> `src/features/shell/backKey.ts` and the one hook call in `src/features/conditions/ConditionsScreen.tsx`, and nothing else
> of Team A's. **TASK-037's edits to `shell/backKey.ts` and `app/routes.tsx` are accepted after the fact**: they were the same
> back-key change, and Team A is idle on the app now. F-031 stands as the record. The PM tells SA-A, so that Fern does not edit
> those files while TASK-038 is open.

## The four overlays (read 2026-11-01, `grep -rnE "Dialog|Popup|Popover|ActionSheet|Modal" src`, not tests)
| Where | What | Its cancel today |
|---|---|---|
| `src/features/placeholder/TabHeader.tsx:16` | the menu `Popover` (`menuOpen`) | `setMenuOpen(false)` |
| `src/features/placeholder/SignOutDialog.tsx:10` (opened from `TabHeader.tsx:38`) | sign-out confirm | `onClose()` |
| `src/features/conditions/ConditionsScreen.tsx:303` | delete-condition confirm | `setDeleteTarget(null)` |
| `src/features/line/LineLinkScreen.tsx:192` | un-link confirm | `setConfirmOpen(false)` |
No imperative `Dialog.confirm/alert/show` exists (grep: 0 hits).

## What to do
1. `backKey.ts`: a small stack of "closers". `useCloseOnBack(open: boolean, close: () => void)`: while `open` is true, its
   `close` is on the stack; it is removed when `open` turns false or the component unmounts. The `backButton` listener first
   looks at the stack: if it is not empty, call the **top** closer, and do nothing else (no `navigate`, no `minimizeApp`).
   Only an empty stack falls through to `backTarget` (unchanged).
2. Call `useCloseOnBack` in the four places above, each with the overlay's own cancel. The sign-out flow is a menu that opens a
   dialog: the menu closes when the dialog opens (check). If both are ever open, BACK closes the dialog, the top one.
3. Unit tests: the stack (push, pop on close, pop on unmount, top-first with two open), and the listener (stack not empty →
   only the closer runs, `navigate`/`minimizeApp` not called).

## Definition of Done (paste real output)
- [ ] `npm run build` clean · `npm test` green (counts; was 122).
- [ ] On `cc_phone_360` (local APK, D43 recipe as TASK-037), `input keyevent 4`, the route read from the WebView, as TASK-037:
  - `/messages` + menu open → BACK → menu closed, still `/messages`, app in front; BACK again → home screen;
  - `/messages` + sign-out confirm → BACK → dialog closed, still signed in, `/messages`;
  - `/conditions` + delete confirm → BACK → dialog closed, the condition still there;
  - `/channels/line` (linked) + un-link confirm → BACK → dialog closed, still linked, still `/channels/line`; BACK again → `/channels`.
- [ ] TASK-037's back-key rows still pass (re-run the five).
- [ ] `git status --porcelain` → only the listed files.

## Implementation Notes
Fanta (FE-B), 2026-11-01. Repo `corner-chat-app`, nothing committed. **Code and unit tests done; the emulator rows are NOT run (waiting for SA-B's relay of the PM's "free"; I did not start it).**
- `src/features/shell/backKey.ts`: a module-level stack of closers. `pushCloser(close)` returns its own remover; `closeTopOverlay()` calls the newest and returns whether there was one; `useCloseOnBack(open, close)` registers only while `open` and takes itself off when `open` turns false or on unmount (it calls the newest `close`, held in a ref). `handleBackPress({pathname, historyIdx, navigate, minimize})`: an open overlay takes the press and nothing else happens; an empty stack goes to `backTarget` exactly as in TASK-037. The `backButton` listener now just calls `handleBackPress`.
- The four places, each with the overlay's own cancel: `TabHeader.tsx` (menu `Popover`: `useCloseOnBack(menuOpen, () => setMenuOpen(false))`), `SignOutDialog.tsx` (`useCloseOnBack(true, onClose)`: the dialog is mounted only while open), `ConditionsScreen.tsx` (`deleteTarget !== null` → `setDeleteTarget(null)`), `LineLinkScreen.tsx` (`confirmOpen` → `setConfirmOpen(false)`). Each edit is the hook call and its import, nothing else.
- Check asked in step 2: the sign-out flow closes the menu when the dialog opens (`TabHeader`'s `menu-signout` does `setMenuOpen(false)` then `setConfirmOpen(true)`), so both are never open together in practice; if they were, the dialog is the newest and BACK closes it first (tested with two closers).
- Tests: `backKey.test.ts` +5 (stack top-first, off-twice harmless, empty stack, press with an overlay → only the closer runs, `navigate`/`minimize` not called, press without → the route rule). New `closeOnBack.test.tsx` +4 (hook: on while open, off on close, off on unmount, newest close fn; `TabHeader`: BACK closes the menu, BACK closes the sign-out dialog and the closer stack is empty after). jsdom keeps a closed antd-mobile `Popover` in the DOM, hidden, so the menu test reads its `adm-popover-hidden` class.
- Evidence: `npx tsc -b` clean · `npm test` → `Test Files 15 passed (15) · Tests 130 passed (130)` (was 122; +8) · `npm run build` `✓ built` · local APK (`VITE_FAKE=false`, `VITE_API_BASE=http://10.0.2.2:8093/api/v1`) `BUILD SUCCESSFUL`: 4500880 bytes, SHA-256 `8fb63db5ed3b2ab1b7588d5570c40dd7f16be9b022cefb5243f5fcf892b373c1`, copy in `tests/harness/task-038/` (the TASK-037 `lab.ts`/`iter*.sh` in `tests/harness/task-037/` are reusable for the device run).
- Files changed: `backKey.ts`, `backKey.test.ts`, `closeOnBack.test.tsx` (new, beside the other); the four overlay files above. Only listed paths.

**Device run, done** (the "UNVERIFIED" line above is closed). Emulator `cc_phone_360`: started 23:49:18 (after SA-B's relay of the PM's "free"), stopped 23:52:37 with `adb emu kill`; no emulator process left. Same D43 recipe as TASK-037 (`tests/harness/task-037/lab.ts`): own DB `corner_chat_test_appb` on the owner's server, back end on 8093 (`HOST=127.0.0.1 FILTER_PAUSED=true MAIL_POLL_SECONDS=0 LINE_API_BASE=http://127.0.0.1:9`, no `LINE_LIVE`), made-up user `appb@corner.test`, LINE link inserted into the throwaway DB, one keyword rule through the API. **DB dropped: `present after drop: 0`, second count 0; server stopped (port answers nothing).** `corner-chat-back` and its `.env` untouched. APK: the one above (SHA `8fb63db5…73c1`). The route is read from the WebView (`/json` `url`); the focus from `dumpsys window`. Raw lines: `tests/harness/task-038/rows.txt`; shots `row1…row4-*.png`.
- **Row 1** `/messages`, menu open (`row1-menu-open.png`) → BACK → route `/messages`, focus still `com.develyst.cornerchat/…MainActivity`, menu gone (`row1-after-back.png`); BACK again → launcher in focus ✓.
- **Row 2** `/messages`, sign-out dialog open (`row2-dialog-open.png`) → BACK → dialog gone, route `/messages` (not `/signin`), app in front, still signed in (`row2-after-back.png`) ✓. (TASK-037 saw the app leave to the home screen here; now it does not.)
- **Row 3** `/conditions`, delete confirm open → BACK → dialog gone, route `/conditions`, the rule still listed (`row3-after-back.png`) ✓. The rule's text shows as `???????` because my `curl` sent the Thai value through the shell's code page: a harness artefact, not the app.
- **Row 4** `/channels/line` (linked), un-link confirm open → BACK → dialog gone, route `/channels/line`, still linked (`row4-after-back.png`); BACK again → `/channels` ✓.
- **TASK-037's five rows, re-run on this APK:** list → detail → BACK → `/messages` ✓ · BACK on `/messages` → launcher, app still in recents (11 lines in `dumpsys activity recents`) ✓ · cold start with the message-id extra → BACK → `/messages` ✓ · `/channels/line/names` → BACK → `/channels/line` → BACK → `/channels` ✓ · `/conditions` → BACK → launcher ✓.
- Not run: BACK with two overlays open at once (the menu closes before the sign-out dialog opens, so it cannot happen on the device; the order is covered by the unit test). `git status --porcelain` in `corner-chat-app`: everything untracked as before (nothing was ever committed); no path outside the list was touched by this TASK.

## Questions

## Review
**Verdict: DONE** (Silver, SA-B, 2026-11-01 ~23:58). Reviewed against D46 extended and the § Claim ruling.
- I re-ran `npm test` → `Test Files 15 passed (15) · Tests 130 passed (130)` · `npx tsc -b` clean.
- Code read:
  - `handleBackPress` calls `closeTopOverlay()` first and returns, so `navigate` and `minimize` are untouched while an overlay is open ✓.
  - `useCloseOnBack` registers only while `open`, removes itself on close or unmount, and calls the newest `close` through a ref ✓.
  - The four call sites (`grep -rn useCloseOnBack src`) are one line each, with the overlay's own cancel. In Team A's `ConditionsScreen.tsx` it is the import plus line 59 only, within the ruling ✓.
- Device (local APK, routes read from the WebView): rows 1–4 all close the overlay only. Row 2 is the case TASK-037 flagged, now fixed. TASK-037's five back rows still pass ✓.
- The test DB was dropped (0), the server stopped, the emulator stopped with `emu kill` ✓.
- Noted, not a defect: the `???` rule text comes from the harness's curl code page, not the app.
