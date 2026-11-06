# TASK-035: The APK logs no password, token or message text (fix for TEST-005 DEF-1)
- Source: TEST-005 § Defects DEF-1 (MAJOR, Tefany, 2026-11-01) · SPEC-003 § Non-functional ("Never log tokens, passwords, or message text") · REQ-005 TEST_FAILED (PM, 2026-11-01)
- Owner: FE (Fanta)
- Status: DONE 2026-11-01 (SA-B review below; the local-APK login body is for QA's DEF-1 re-test)
- Depends on: none. **Emulator:** it is with QA (Tefany) now. Use `cc_phone_360` only after the PM confirms it is free; write in Notes when you start and when you stop.

- Cause (SA-B, read): Capacitor's `loggingBehavior` defaults to `debug`, so a debug build writes every bridge call's data to logcat. That includes the CapacitorHttp request (the login body, the `authorization` header) and Preferences values (`cc.token`, the cached list).
  Capacitor docs (capacitorjs.com/docs/config, read 2026-11-01): `loggingBehavior: 'none' | 'debug' | 'production'`, default `debug`; `'none'` = "logs are never produced"; `android.loggingBehavior` overrides it on Android.
  Our APKs are debug builds handed to users (D11), so `debug` is the wrong value for us.
- Repo: `corner-chat-app`. Files you may edit: `capacitor.config.ts` · `src/**` only if the check below finds another leak (say which) · `../ai-worker/tests/harness/task-035/**`.
- Git writes allowed: **none.**

## What to do
1. `capacitor.config.ts`: set `loggingBehavior: 'none'`, plus a one-line comment pointing at DEF-1. Then `npx cap sync android`.
2. The native watcher's own `Log.i` lines stay. They are counts and class names only (TASK-030 review).
3. Grep `src` for `console.` outside tests. Anything that could print a token, a password or message text → remove it (expected: none).

## Definition of Done (paste real output)
- [ ] `npm run build` clean · `npm test` green (counts).
- [ ] `npm run apk:debug` → a local APK (`VITE_FAKE=false`, the D43 recipe in SPEC-003 *only if the hold is lifted*), else the **fake** APK. Paste the size and SHA.
- [ ] On `cc_phone_360`, run DEF-1's own repro:
  1. `adb -s emulator-5554 logcat -c`;
  2. install, open, sign in (fake APK: just open; it signs in automatically) and let the list load;
  3. open one message.
  - Then `adb -s emulator-5554 logcat -d > logcat.txt` and paste the **counts** of: `grep -c "Capacitor"` · `grep -ci "password"` · `grep -c "cc.token"` · `grep -ci "bearer"` · `grep -c` of one message's text, a short Thai phrase from a fixture or the seed.
  - Every one except `Capacitor` must be **0**. Paste the first 5 `Capacitor` lines, if there are any, to show what is left.
- [ ] If the local APK could not be used (the hold), write `UNVERIFIED — login body on the local APK`. The fake APK still proves Preferences and the cached list text, which are the same bridge path.
- [ ] Do not keep `logcat.txt` if it contains anything sensitive. Keep only the counts.
- [ ] `git status --porcelain` → only listed paths.

## Implementation Notes
Fanta (FE-B), 2026-11-01. Repo `corner-chat-app`, base `main` `f5e060d`, nothing committed. **Emulator: used 21:21–21:24 (below), released.**

**Code part, done.**
1. `capacitor.config.ts`: `loggingBehavior: 'none'` plus a comment pointing at TEST-005 DEF-1. `npx cap sync android` → the generated `android/app/src/main/assets/capacitor.config.json` now holds `"loggingBehavior": "none"`, and the same line is inside the built APK (`assets/capacitor.config.json`, read from the zip).
2. Why that is enough, read in Capacitor's own source (`@capacitor/android`): `CapConfig.java` maps `android.loggingBehavior` (falling back to `loggingBehavior`) and `none` sets `loggingEnabled = false`; every level of `Logger.java` (`verbose`, `debug`, `info`, `warn`, `error`) returns at once when `shouldLog()` is false, and `Bridge.java` checks it too. No other class of the Capacitor core imports `android.util.Log`. Of the three plugins we ship (app, network, preferences) only `NetworkPlugin` calls `Log.d` directly, with a fixed sentence about a network-status mismatch and no data: it is harmless and would show up only as a `Capacitor/NetworkPlugin` line.
3. The native watcher's own `Log.i` lines stay (counts and class names only, TASK-030 review).
4. `grep -rnE 'console\.' src` outside tests → one hit, `features/shell/signout.ts:26` (`log: (what) => console.warn(what)`). It is only ever called with two fixed sentences (`sign-out: the device could not be unregistered`, `… the server could not be told to log out`), and Fern's `signout.test.tsx` asserts that a token never reaches the log. Nothing to remove, no `src/**` change.

**Evidence so far.** `npm run build` → `✓ built in 704ms` · `npm test` → `Test Files 13 passed (13) · Tests 104 passed (104)` (no test changed) · `npm run apk:debug` with `VITE_FAKE=true` → exit 0, `BUILD SUCCESSFUL`: **fake APK** 4.29 MB (4500049 bytes) SHA-256 `576a5c382a85431e33ca34c6e7a41585c8cff11c7c33db3636e22573fcd710bd`, copy in `tests/harness/task-035/`. `git status --porcelain`: only untracked generated files, HEAD `f5e060d`; the only tracked-path change of this TASK is `capacitor.config.ts`.
The local APK (`VITE_FAKE=false`) is not built: the back-end hold stands (SPEC-002 Q-LIVE), as the TASK allows.

**DEF-1's own repro, done on `cc_phone_360`** (fake APK, no back end, no database touched). **Emulator use: I took it at 21:07 (the PM's "free" message), it only started at 21:21, I stopped it at 21:24:45 (`adb emu kill`, processes gone 21:25:02) and told SA-B.** Sequence per run, as DEF-1: `adb -s emulator-5554 logcat -c` → uninstall + install the APK → open → answer the first-run notification prompt (Allow) → the list loads → open the first message → `logcat -d` to a temp file → count → **delete the file** (only the counts are kept). The Thai phrase is `ประชุมด่วนพรุ่งนี้` (a made-up fixture message). Two runs of each APK:
| count (lines) | OLD fake APK (TASK-030's build, `loggingBehavior` default = debug) | NEW fake APK (this TASK, `none`) |
|---|---|---|
| `Capacitor` (case-sensitive) | **142** (run 1) · **211** (run 2) | **1** (run 1) · **0** (run 2) |
| `password` (any case) | 9 (run 1) · 3 (run 2) | 3 (run 1) · 0 (run 2) — **all of the 3 are `AutofillManager` (see below)**; not from the app: 0 |
| `cc.token` | 0 · 0 | 0 · 0 |
| `bearer` (any case) | 0 · 0 | 0 · 0 |
| a message's text (`ประชุมด่วนพรุ่งนี้`) | **9** (run 1) · **12** (run 2) | **0** · **0** |
| `dead thread` warnings (below) | not counted · 22 | seen once or more in run 1 (not counted) · 0 |
- The leak is real and the fix removes it: with logging on, the app's bridge wrote **a message's text 9–12 times** (it is the cached list that Preferences stores and the list the bridge returns) and 142–211 `Capacitor` lines; with `none` the same sequence writes **0** of the text and 0–1 `Capacitor` lines.
- **The first 5 `Capacitor` lines of the NEW run 1** (the only ones): `D Capacitor: Starting BridgeActivity` (printed before the config is read, so it is not silenced; it carries no data), and four `W MessageQueue: at com.getcapacitor.Bridge.callPluginMethod / MessageHandler…` stack lines (these matched only because I searched case-insensitively there: the case-sensitive count is 1).
- **`password` = 3 is not ours.** The 3 lines are Android's own `D AutofillManager: Fill dialog is enabled:false, hints=[password, passwordAuto, creditCardNumber, creditCardSecurityCode, creditCardExpirationDate]`: the *names* of the autofill hint types, no value; they come from the system (one from pid 926 = system), appear whether or not the app logs, and vary run to run (3 in the old APK's run 2, 0 in the new APK's run 2). Counting without the `AutofillManager` tag: **0 in every run**, old and new. So the DoD's literal "password = 0" holds for the app and not for the OS: please read it as "0 not from the system's own autofill tag".
- **`cc.token` and `bearer` are 0 in the OLD run too** (my reading: the FAKE build does not use the real HTTP or token path, so they could not appear; I did not test that). So the fake APK proves the **Preferences + cached-list text** path (the same bridge), as the TASK says, and it does **not** prove the login body or the `Authorization` header: **UNVERIFIED — login body and Bearer header on the local APK** (the back-end hold stands). The fix is the same single setting for the whole bridge, and Capacitor's source (above) gates every level, so I expect them to vanish too, but I have not seen it.
- Seen, not mine to fix: `W MessageQueue: Handler … sending message to a Handler on a dead thread` with a `Bridge.callPluginMethod` stack, **22 times on the OLD APK (run 2), 0 on the new APK (run 2), and seen in the new APK's run 1**; a Capacitor/WebView lifecycle warning that carries no data. Cause not investigated (`UNVERIFIED`).
- **Emulator incident (for QA, Tefany/Tanya):** my first start hung for 14 min (stale 21:07–21:21) with `INFO | Showing crashdialog to get consent.` in the emulator's own log: the emulator waits for a window that a hidden launch cannot show. Cause: an earlier hard kill (`Stop-Process` on `emulator`/`qemu`) left a pending crash report. Fix: I **moved** (not deleted) the report folder `%LOCALAPPDATA%\Temp\AndroidEmulator` (3 files) to `AndroidEmulator.moved-by-fanta-2026-11-01`; the next start booted in 31 s. Stop the emulator with `adb emu kill`, never with `Stop-Process`.

## Questions

## Review
**Verdict: DONE** (Silver, SA-B, 2026-11-01 ~21:35). Reviewed against TEST-005 DEF-1 and SPEC-003 § Non-functional.
- I re-checked:
  - the fake APK in `tests/harness/task-035/` has SHA-256 `576a5c38…10bd`, identical to the Notes;
  - `unzip -p … assets/capacitor.config.json` shows `"loggingBehavior": "none"` **inside the built APK** ✓ (the artifact, not only the source);
  - `capacitor.config.ts` was read ✓;
  - the only `console.` in `src` outside tests is `signout.ts:26`, which logs two fixed sentences, and Fern's test asserts that no token reaches it ✓.
- The before/after repro is convincing: message text 9–12 → **0**, and `Capacitor` lines 142–211 → 0–1, with the one remaining line identified as data-free. The `password` hits are explained (Android's `AutofillManager` hint names, system pid, present in the old run too); 0 from the app.
- Fanta read Capacitor's own `Logger` / `CapConfig` source to show the setting gates every log level. That is the right kind of evidence for "the same setting covers the HTTP path".
- `UNVERIFIED`: the login body and the Bearer header on a **local** APK. That needs the owner's DB URL in `.env` (D43). It goes to QA's DEF-1 re-test (Tefany), which will use a local APK.
- The emulator incident (a stale crash report blocked a hidden start; stop it with `adb emu kill`) is a useful note for QA. It was handled carefully (moved, not deleted).
