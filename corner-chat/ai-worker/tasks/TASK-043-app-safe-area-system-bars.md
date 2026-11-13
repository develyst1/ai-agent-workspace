# TASK-043: App keeps its header and tab bar inside the phone's safe area (owner's real phone)
- Source: REQ-005 § Questions, last item (owner 2026-11-03 ~01:25, his phone, release APK `3edb05dc…`): *"แก้แอป ให้ข้างบน ข้างล่าง มัน sefety หน่อย มันกดไม่ได้"* · Porter → SA-B 2026-11-03 · TASK-041 / TASK-042
- Owner: FE (Fanta)
- Status: DONE 2026-11-03 (SA-B review below; emulator released 01:22:50; owner's phone UNVERIFIED) · **HIGH** (the owner uses the app on his phone now)
- Depends on: none. **Emulator `cc_phone_360`:** ask SA-B before starting it; QA may be on it.
- Repo: `corner-chat-app` (branch `D1`). Files you may edit: `index.html` · `../ai-worker/tests/harness/task-043/**`. Anything else ⇒ stop and write in § Questions.
- Git writes allowed: **none.** Do not send, upload or install the APK anywhere except `cc_phone_360`. Do not touch the physical device `21ec5dd6`.

## What SA-B read (2026-11-03)
| Fact | Where |
|---|---|
| `targetSdkVersion = 36`: on Android 15+ the system always draws the app edge-to-edge, under the status and navigation bars | `android/variables.gradle:4` |
| Our page asks to be drawn under the bars: `viewport-fit=cover` | `index.html:6` (since D1 `21eb731`) |
| Capacitor 8's built-in SystemBars plugin (default `insetsHandling: "css"`) decides per phone. **WebView ≥ 140 and `viewport-fit=cover`** → it leaves the WebView full-screen and expects the page to pad itself with `env(safe-area-inset-*)` / `--safe-area-inset-*`. **Otherwise** → it pads the WebView natively, so the page sits between the bars | `node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/plugin/SystemBars.java:39` (`WEBVIEW_VERSION_WITH_SAFE_AREA_FIX = 140`), `:194` (`shouldPassthroughInsets`), `:200-202` (full-screen, no padding) vs `:222` (native padding) |
| "cover" is read from the last `meta[name=viewport]`: `content.includes("viewport-fit=cover")` | same file `:43-51` (`viewportMetaJSFunction`) |
| **Our own CSS uses no safe-area value anywhere** (no `env(safe-area…)`, no `--safe-area-inset`, no antd-mobile `SafeArea`) | `grep -rn "SafeArea\|safe-area\|viewport-fit" src index.html` → only `index.html:6` |

**Inferred cause, not proven:** the owner's phone has a current WebView (≥ 140), so Capacitor takes the "page pads itself" path, and our page
does not pad. The headers (`.th-header`, `.md-header`, `.ln-header`, `.si-header`) land under the status bar and the tab bar (`.shell-tabbar`)
under the navigation bar. The emulator's WebView is older, so Capacitor padded natively there and nobody saw it. **What settles it:** step 1
(the emulator's WebView version) and, finally, the owner's phone.

## Decision `[SA-decided]`: drop `viewport-fit=cover`
- Then `capacitorSystemBarsCheckMetaViewport()` returns false on **every** phone, so Capacitor always pads the WebView itself (`:222`).
  That is the path the emulator already takes, and everything there was tested (TEST-005, TEST-006).
- One line, no per-screen CSS, nothing to forget on a future screen. We lose only drawing colour behind the system bars, which nobody asked for.
- Rejected: padding every header and the tab bar with `var(--safe-area-inset-*)`. That is 5+ CSS files, and every new screen must remember it.

## What to do
1. **Settle the cause on the emulator** (only once SA-B says it is free): `adb -s emulator-5554 shell dumpsys webviewupdate | grep -i "version\|package"`
   → the WebView package and version. Below 140 confirms why the emulator never showed it. Paste it.
2. In `index.html:6`, change the viewport meta to `width=device-width, initial-scale=1.0` (drop `, viewport-fit=cover`). Nothing else.
3. Rebuild **both**: `apk:debug` (emulator check) and the signed release APK with the real key (TASK-041 § Part B command).
4. On the emulator, with the **release** APK, screenshot into `tests/harness/task-043/`: the message list (header + tab bar), a message
   detail (back arrow + title), Channels → Zimbra (back arrow), and the ⋮ menu open. Tap ⋮, back and every tab once; each must react.
   Check the status-bar icons are still readable (not white on white).
5. On the emulator, type in a text field at the bottom (e.g. the LINE add field, or sign-in) with the keyboard open: the field stays
   visible above the keyboard (no regression).

## Definition of Done (paste real output)
- [ ] Step 1 output (WebView package + version).
- [ ] `git diff index.html` → only the viewport line changed.
- [ ] In the built bundle, `grep -c "viewport-fit" android/app/src/main/assets/public/index.html` → `0`.
- [ ] Signed release APK: `apksigner` cert `deb72918…4c6a`, APK size + SHA-256; bundle still has the https SIT base, `10.0.2.2` 0, fake off,
      and `assets/capacitor.config.json` still has `webContentsDebuggingEnabled: false`.
- [ ] Steps 4–5: the screenshots, and one line per tap saying what happened.
- [ ] `npm test` green (count; was 130) · `npx tsc -b` clean · `git status --porcelain` shows only `index.html` + TASK-041/042's 4 files.
- [ ] `UNVERIFIED` stays written until the owner's phone shows it: the emulator takes the padded path even before the fix, so only a phone
      with WebView ≥ 140 proves it. That is an owner step through the PM.

## Implementation Notes
Fanta (FE-B), 2026-11-03. Repo `corner-chat-app`, branch `D1`, nothing committed, nothing sent or installed. **Code and static checks done; the emulator steps (1, 4, 5) were run later the same day: see "Device run, done" below (this line was written before it).** Physical device `21ec5dd6` untouched.
- **Change (step 2):** `index.html:6` → `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`. `git diff index.html`: exactly that one line (`-…viewport-fit=cover` / `+…` without it). Nothing else touched.
- **Built (step 3):** signed release APK with the real key (TASK-041 § Part B command, `VITE_API_BASE=https://cornerchat-api-sit.develyst.online/api/v1`): `BUILD SUCCESSFUL in 6s`, **3361601 bytes, SHA-256 `d9ec28e2f766e44bb3fcfb18f28d46a004436a02a283ed72487f97e072dc6cfc`**, in `android/app/build/outputs/apk/release/`. `apk:debug` also builds.
- **Static DoD** (`tests/harness/task-043/release-checks.txt`):
  - `grep -c viewport-fit` → `0` in `android/app/src/main/assets/public/index.html`, and `0` in the release APK's `assets/public/index.html` (and `0` in the debug build's synced file);
  - `apksigner`: `CN=corner-chat, O=develyst`, SHA-256 `deb72918e64257d273885e0102523faf2d145ab9c77b0715075c126f58f04c6a` (**the same cert**);
  - bundle: SIT base 1 hit, `10.0.2.2` 0 hits, `get fake(){return!1}`; `assets/capacitor.config.json` still `"webContentsDebuggingEnabled": false`; `debuggable` 0.
- `npx tsc -b` clean · `npm test` → `Test Files 15 passed (15) · Tests 130 passed (130)` · `git status --porcelain`: `android/.gitignore`, `android/app/build.gradle`, `capacitor.config.ts`, `package.json` (TASK-041/042's four) + `index.html`. Nothing else.

**Device run, done.** Emulator `cc_phone_360`: started 01:20:57 after SA-B's "free", stopped **01:22:50** with `adb emu kill`; no emulator process left. The physical device `21ec5dd6` was never touched (every command used `-s emulator-5554`). Files in `tests/harness/task-043/`.
- **Step 1** (`step1-webview.txt`): `Current WebView package (name, version): (com.google.android.webview, 113.0.5672.136)`, Android 14 (API 34). **113 is below 140**, so Capacitor's `SystemBars` pads the WebView natively on this emulator whatever the page says. That confirms why the emulator never showed the bug; the old `viewport-fit=cover` only matters on a phone with WebView ≥ 140.
- **Deviation from step 4, said plainly:** the signed release APK points at the real SIT API, and I do not sign in to SIT (shared DB, no test account of mine there). So the screens below were taken on a **fake-data debug APK built from the same source** (`VITE_FAKE=true`, copy `cornerchat-fake-043.apk`), which has the same `index.html` and the same system-bar handling. The **signed release APK itself** was installed and opened too: its sign-in screen is `release-01-signin.png` (title and button inside the bars; app running). Its list/detail screens were not seen.
- **Step 4 screens** (fake APK): list `fake-01-list.png` (header and tab bar sit between the bars; status-bar icons dark on light, readable) · message detail `fake-02-detail.png` (back arrow + title) · ⋮ menu open `fake-03-menu-open.png` · Channels `fake-04-channels.png` · Channels → Zimbra `fake-05-zimbra.png` (back arrow). **Taps, route after each** (read from the WebView, `taps.txt`): row 1 → `/messages/m01` · back arrow → `/messages` · ⋮ → the menu opened (shot) · BACK closed it · tab Conditions → `/conditions` · tab Channels → `/channels` · Zimbra row → `/channels/zimbra` · back arrow → `/channels` · tab Messages → `/messages`. Every control reacted.
- **Step 5** (`fake-06-keyboard-password-field.png`): the Zimbra password field focused, soft keyboard up (`mInputShown=true`), typed `abc`: the field stays visible above the keyboard, no regression.
- **`UNVERIFIED` stays:** that the owner's phone (WebView ≥ 140) now sits inside the bars. The emulator takes the padded path with or without this change, so it cannot prove the fix; only that phone can. The new APK (`d9ec28e2…dc6cfc`, 3361601 bytes) has not been handed to anyone: handing it to the owner is the PM's/Otto's step.

## Questions

## Review
**Verdict: DONE** (Silver, SA-B, 2026-11-03). The code is right; only the owner's phone can prove the fix.
- **Cause confirmed (as far as the emulator can):** emulator WebView `113.0.5672.136` < 140, so Capacitor pads natively there with or without
  `viewport-fit=cover`. That is why nobody saw it before the owner's phone. That the phone has WebView ≥ 140 stays `inferred`.
- I re-ran:
  - `git diff index.html` → only the viewport line;
  - `git status --porcelain` → TASK-041/042's 4 files + `index.html` ✓;
  - `npx tsc -b` clean; `npx vitest run` → `Test Files 15 passed (15) · Tests 130 passed (130)`.
- Release APK checked myself:
  - 3361601 bytes, sha256 `d9ec28e2f766e44bb3fcfb18f28d46a004436a02a283ed72487f97e072dc6cfc`;
  - `apksigner` → `deb72918…4c6a` (the real key);
  - unzipped: `assets/public/index.html` `viewport-fit` 0; SIT base in 1 JS file; `10.0.2.2` 0;
  - `capacitor.config.json` `"android":{"webContentsDebuggingEnabled":false}` ✓.
- Looked at `fake-01-list.png`: the header + ⋮ sit below the status bar, the tab bar is above the gesture bar, and the status icons are readable ✓.
  The fake-data APK for screens is acceptable: it is the same source and the same `index.html`. The release APK's own sign-in screen was also seen.
- `adb devices` → only `21ec5dd6`, so the emulator is stopped ✓.
- Note: the first line of Implementation Notes ("emulator steps NOT run") predates the device run below it; the later block is the current one.
- **UNVERIFIED:** on the owner's phone, the header, ⋮, back arrow and tab bar are inside the bars and tappable. That is an owner step with APK
  `d9ec28e2…dc6cfc` through the PM. QA re-tests what the PM routes.
