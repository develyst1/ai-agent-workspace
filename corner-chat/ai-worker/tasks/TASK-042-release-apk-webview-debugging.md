# TASK-042: The release APK must not expose WebView debugging (TEST-006 Q2)
- Source: TEST-006 § Questions Q2 (Tefany, 2026-11-02) · PM answer `[PM, 2026-11-02 ~23:45]`: "a release APK must not expose WebView debugging, while debug builds may. How to fix it is the SA's call." · REQ-005 · TASK-041
- Owner: FE (Fanta)
- Status: DONE 2026-11-02 (SA-B review below; branch a; emulator released 23:29:55) · MINOR · does not block TEST-006
- Depends on: TASK-041 (DONE). **Emulator:** ask SA-B before starting it; QA may be on it.
- Repo: `corner-chat-app` (branch `D1`). Files you may edit, **only if step 2 says so**: `capacitor.config.ts` · `android/app/src/main/java/**/MainActivity.java` · `../ai-worker/tests/harness/task-042/**`.
- Git writes allowed: **none.** Do not send, upload or install the APK anywhere except `cc_phone_360`.

## What SA-B read (2026-11-02): the app may already be right
| Fact | Where |
|---|---|
| The only call to `WebView.setWebContentsDebuggingEnabled` in the app and its plugins is Capacitor's | `grep -rln setWebContentsDebuggingEnabled node_modules/@capacitor android/app/src` → only `Bridge.java` / `CapConfig.java` (+ their build outputs) |
| Capacitor passes `config.isWebContentsDebuggingEnabled()` | `node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/Bridge.java:624` |
| With no `android.webContentsDebuggingEnabled` in the config, it defaults to **the app's `FLAG_DEBUGGABLE`** | `CapConfig.java:245,286` (and the builder at `:607-608`) |
| Our synced config has no such key; the release manifest has no `debuggable` (TASK-041 review: `grep -ci debuggable` → 0) | `android/app/src/main/assets/capacitor.config.json` |
| **Tefany's run was on `cc_phone_360`, a `google_apis` system image** | `~/.android/avd/cc_phone_360.avd/config.ini:124,133` |

**Inferred cause, not proven:** `google_apis` emulator images are debuggable system builds (`ro.debuggable=1`). On such a build, Android/WebView
lets DevTools attach to **every** app's WebView, whatever the app sets. If so, the release APK is already right, and the socket is an emulator
artefact. **What settles it:** step 1.

## What to do
1. **Settle the cause** on `cc_phone_360` (only once SA-B says it is free), with the TASK-041 release APK installed:
   - `adb shell getprop ro.debuggable` and `adb shell getprop ro.build.type`;
   - with the app open: `adb shell cat /proc/net/unix | grep webview_devtools_remote` → which pids;
   - the same check with **another installed app that is not debuggable** and has a WebView (any stock app). If its WebView also opens a
     `webview_devtools_remote_<pid>` socket, the emulator is the cause.
2. **Then:**
   - **(a) The emulator is the cause** (`ro.debuggable=1`, and the other app is exposed too): add **one** explicit guard and change no
     behaviour. In `capacitor.config.ts`, set `android: { webContentsDebuggingEnabled: false }` only when the build is a release build.
     Do that through the same env `apk:release` already sets (`VITE_FAKE=false` → read it in `capacitor.config.ts`, or add
     `CAP_RELEASE=1` in the `apk:release` script; `package.json` then joins the file list). Debug stays as it is. Then rebuild the release
     APK with the real key (TASK-041 § Part B command). This is belt and braces: it makes the intent explicit in the config.
   - **(b) Only our app is exposed** (the emulator is `ro.debuggable=0`, or the other app opens no socket): the app is wrong. In
     `MainActivity.java`, after `super.onCreate`, call `WebView.setWebContentsDebuggingEnabled(false)` when the app is not debuggable
     (`(getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) == 0`). Rebuild the release APK with the real key, re-run step 1, and
     there must be no socket for our pid.
3. Write in Implementation Notes which branch you took and why, with the outputs.

## Definition of Done (paste real output)
- [ ] Step 1 outputs: `ro.debuggable`, `ro.build.type`, and the sockets for our app and for the other app.
- [ ] Branch (a) or (b), with its change and the rebuilt, signed release APK: `apksigner` cert `deb72918…4c6a`, APK size + SHA-256.
- [ ] In the rebuilt APK, `assets/capacitor.config.json` shows `webContentsDebuggingEnabled: false` (branch a), or the `MainActivity` change is in (branch b).
- [ ] The debug build is unchanged: `apk:debug` builds, and its WebView is still inspectable on the emulator.
- [ ] `npm test` green (count; was 130) · `npx tsc -b` clean · `git status --porcelain` shows only the listed files (+ TASK-041's 3).
- [ ] `UNVERIFIED` stays written if no user-build phone was used. A real phone (user build) is the only proof that the socket is gone; using one needs the owner's go through the PM.

## Implementation Notes
Fanta (FE-B), 2026-11-02, nothing committed, nothing sent. **Emulator `cc_phone_360`: started 23:27:00, stopped 23:29:55 with `adb emu kill`, no emulator process left.** The attached physical device `21ec5dd6` was never touched (every command used `-s emulator-5554`). Raw outputs in `tests/harness/task-042/`.
- **Step 1 (release APK from TASK-041, installed on the emulator)** (`step1-release-apk.txt`): `ro.debuggable=1`, `ro.build.type=userdebug`, `ro.build.tags=dev-keys`. Our app (pid 2573): `pkgFlags=[ HAS_CODE ALLOW_CLEAR_USER_DATA ALLOW_BACKUP ]`, **no `DEBUGGABLE`**, and it still shows `@webview_devtools_remote_2573`.
- **The "other app" comparison did not settle anything** (`step1-other-apps.txt`): I launched Play Store, YouTube Music, Maps, the Google app and Calendar; none opened a `webview_devtools_remote_*` socket. They are system apps and none had a WebView on screen, so "no socket" there says nothing. I did not find a stock app with an active WebView.
- **What did settle it:** I built the release APK **with the guard** (branch a: Capacitor then calls `WebView.setWebContentsDebuggingEnabled(false)` explicitly; read in `Bridge.java:624`, value from `CapConfig.java:286`), signed with the real key, and installed it on the same emulator (`step2-guarded-release-apk.txt`): the app's `assets/capacitor.config.json` holds `"webContentsDebuggingEnabled": false`, and **the socket `@webview_devtools_remote_4894` is still there.** An app that has just told the WebView "debugging off" still gets a DevTools socket only if the system image forces it, so the cause is the emulator (`ro.debuggable=1`, `userdebug`), as SA-B inferred. **Branch (a).** Nothing in the app can close that socket on this image, and `MainActivity` (branch b) would call the same API, so I did not add it.
- **The change (branch a), two files:** `capacitor.config.ts`: `...(process.env.CAP_RELEASE === '1' ? { android: { webContentsDebuggingEnabled: false } } : {})` with a comment pointing at TASK-042. `package.json` `apk:release`: `set CAP_RELEASE=1&&` added after `set VITE_FAKE=false&&`. Behaviour for debug builds is unchanged: a debug build's synced config has **no** such key (`grep -c` → 0), so Capacitor still follows the app's own debuggable flag.
- **Rebuilt, signed release APK** (TASK-041 § Part B command, the real key): `BUILD SUCCESSFUL in 9s`; `apksigner` → `CN=corner-chat, O=develyst`, SHA-256 `deb72918e64257d273885e0102523faf2d145ab9c77b0715075c126f58f04c6a` (**the same cert**); APK **3361609 bytes, SHA-256 `3edb05dc924202b00ba061da60a953f2196a43088ba59e8c2d6b56f27ade7552`**, in `android/app/build/outputs/apk/release/`. (TASK-041's APK was 3361589 bytes: the 20-byte difference is the new config key.)
- **Debug unchanged** (`step3-debug-apk.txt`): `apk:debug` → `BUILD SUCCESSFUL`; the debug bundle still holds `10.0.2.2` (1 hit); installed on the emulator its `pkgFlags` include `DEBUGGABLE` and its WebView socket is there (so it is still inspectable; on this image that alone does not tell debug from release, the config key does).
- `npx tsc -b` clean · `npm test` → `Test Files 15 passed (15) · Tests 130 passed (130)` · `git status --porcelain` in `corner-chat-app`: `android/.gitignore`, `android/app/build.gradle`, `capacitor.config.ts`, `package.json` (the first two and `package.json` are TASK-041's; this TASK adds `capacitor.config.ts` and one more line in `package.json`).
- **`UNVERIFIED` (stays):** that the socket is gone on a real user-build phone. No user-build device was used; the attached physical phone was left alone as told. Using one needs the owner's go through the PM. On such a phone I expect no socket, because the release APK is not debuggable and now sets the flag off itself, but I have not seen it.

## Questions

## Review
**Verdict: DONE** (Silver, SA-B, 2026-11-02 ~23:40). Branch (a) was the right call.
- **Cause:** `cc_phone_360` is `userdebug` (`ro.debuggable=1`). The socket stayed even with `webContentsDebuggingEnabled:false` explicitly in the APK, so only the system image can open it. My inference is confirmed by the guarded run (Fanta's notes). The stock-app comparison showed nothing, as she says.
- I re-ran `npx tsc -b` (clean) and `npm test` → `Test Files 15 passed (15) · Tests 130 passed (130)`.
- Diff read:
  - `capacitor.config.ts` adds `android.webContentsDebuggingEnabled:false` only when `CAP_RELEASE=1`, and `apk:release` sets it (`set CAP_RELEASE=1&&`).
  - Debug is untouched: the tree's synced `capacitor.config.json` has no `android` key after her debug build.
  - `git status --porcelain` → TASK-041's 3 files + `capacitor.config.ts` ✓.
- Rebuilt APK checked myself:
  - 3361609 bytes, sha256 `3edb05dc924202b00ba061da60a953f2196a43088ba59e8c2d6b56f27ade7552`;
  - `apksigner` SHA-256 `deb72918…4c6a` (the real key);
  - the APK's `assets/capacitor.config.json` holds `"android": {"webContentsDebuggingEnabled": false}`;
  - the bundle has the https SIT base 1, `10.0.2.2` 0, fake off ✓.
- `adb devices` shows only `21ec5dd6`, so the emulator is stopped and the phone was untouched ✓.
- **UNVERIFIED:** on a user-build phone, the socket is absent. That needs the owner's go to use a real phone, through the PM. The release APK changed (new SHA), so QA re-tests Q2 with it.
