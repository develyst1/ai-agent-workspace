# TASK-025: Capacitor + React scaffold, a shell with every route, web build + debug APK proven
- Source: SPEC-003 rev 2 § Stack, § Structure (run modes, CORS answer), § Screens and navigation (routes, TabBar, sign-out menu, `data-testid`) · `DECISIONS.md` D36 · REQ-005 req 1, 2 · AC-4 (shell part)
- Owner: FE (Fanta)
- Status: DONE 2026-11-01 (SA-B review below)
- Depends on: none. Replaces TASK-014 (Flutter, SUPERSEDED). Reuse TASK-014's `H:\dev-tools\jdk-17` and `H:\dev-tools\android-sdk`.

- Repo: `corner-chat-app` (path: `machine.local.md`). Base: `main`, `f5e060d`, README only. SA checked 2026-11-01:
  `git status --short` → empty.
- Files you may create/edit: everything `npm create vite` and `npx cap add android` generate, plus `src/**`, `package.json`,
  `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `capacitor.config.ts`, `index.html`, `.gitignore`,
  `android/app/src/main/AndroidManifest.xml`, `android/app/src/main/res/xml/network_security_config.xml`,
  `android/variables.gradle` (minSdk only). **Not** `README.md`. Outside the repo: `machine.local.md` (one row: the AVD name and
  anything new you install), the user's env vars, `H:\dev-tools\**`.
- Git writes allowed: **none.**

## What to do
1. Toolchain check (D28: user-level, official sources, no admin). `node -v` must be ≥ 22. Use `JAVA_HOME` = `H:\dev-tools\jdk-17` and
   `ANDROID_HOME` = `H:\dev-tools\android-sdk`. If the first Android build says it needs another JDK (e.g. 21), install that JDK
   the same way (official zip, user-level), write it in Notes and `machine.local.md`, and go on. Any UAC/admin prompt → stop, BLOCKED.
   No AVD exists yet (SA checked `%USERPROFILE%\.android\avd`: absent). Create `cc_phone_360`: an API 34 x86_64 `google_apis`
   image, `hw.lcd.width=720`, `hw.lcd.height=1600`, `hw.lcd.density=320` (= 360 dp).
2. `npm create vite@latest . -- --template react-ts`, then add exactly the libraries in SPEC-003 § Stack, without
   `@capacitor/push-notifications` (TASK-030). Pin the resolved versions (lockfile) and list them in Notes.
3. `capacitor.config.ts`: `appId "com.develyst.cornerchat"`, `appName "corner-chat"`, `webDir "dist"`,
   `plugins: { CapacitorHttp: { enabled: true } }`. `npx cap add android`. `minSdk 24`. Debug cleartext to `10.0.2.2` only.
4. `vite.config.ts`: proxy `/api` → `process.env.VITE_PROXY_TARGET ?? "http://127.0.0.1:8080"`.
   `src/app/config.ts`: `VITE_FAKE` (default `"true"`), `VITE_API_BASE` (default `/api/v1`).
5. The folder layout of SPEC-003 § Structure. `data/repositories.ts` holds the five interfaces as empty shells, `data/models.ts` is empty for now.
6. Routes (`react-router`) for **every** row of SPEC-003's screen table, each a placeholder whose header is the screen's Thai
   name from `strings-th.ts`. Add the bottom `TabBar` **ข้อความ · เงื่อนไขของฉัน · ช่องทาง**, plus the top-right menu with
   **ออกจากระบบ** → confirm `ออกจากระบบไหม` (ยกเลิก / ออกจากระบบ). For now, confirming goes to `/signin`. The placeholders
   link onward so every route is reachable: list → detail → reply; channels → zimbra / line → names / groups.
   Every control gets a `data-testid`.
7. `package.json` scripts: `dev`, `build` (tsc + vite build), `test` (vitest run), `apk:debug`
   (`npm run build && npx cap sync android && cd android && gradlew assembleDebug`, Windows-safe).

## Definition of Done (paste real output under Implementation Notes)
- [ ] `node -v`, `java -version`, `npx cap doctor`: paste them.
- [ ] `npm run build` → no errors · `npm test` → a test that renders the app (fake) at 360 px wide and clicks every tab and
      every onward link by `data-testid`, finding each route's header. All routes reached (paste the output).
- [ ] `npm run apk:debug` → `android/app/build/outputs/apk/debug/app-debug.apk` exists (paste the gradle tail, the size and the SHA-256).
- [ ] On `cc_phone_360`: `adb install -r app-debug.apk`, open it, take screenshots of the three tabs and the sign-out dialog →
      `../ai-worker/tests/harness/task-025/`.
- [ ] In a browser: `npm run dev`, one screenshot at 360 px wide of the same first screen (this proves the Playwright path works).
- [ ] `git status --porcelain` → paste it (generated files expected, nothing outside the repo except the listed paths).

## Implementation Notes
Fanta (FE-B), 2026-11-01. Repo `corner-chat-app`, base `main` `f5e060d`; nothing committed (git writes: none).
**Footprint first:** TASK-014's Flutter scaffold was still in the repo (my own untracked files, SPEC-003 said "nothing scaffolded"); I deleted all of it
(everything except `.git` and `README.md`) before step 2. `README.md` untouched (`git status` never lists it).

**Toolchain.** `node v22.23.2`. First `gradlew assembleDebug` failed: `error: invalid source release: 21` (`:capacitor-android:compileDebugJavaWithJavac`),
so Capacitor 8 needs **JDK 21** (the SPEC's `UNVERIFIED` is settled). Installed Temurin 21.0.13+9 zip to `H:\dev-tools\jdk-21` (owner said yes in chat; SHA-256
`a4dbaa05…04f9` matched Adoptium's `.sha256.txt`); user `JAVA_HOME` + PATH now point at it, JDK 17 kept. `java -version` → `openjdk version "21.0.13" 2026-10-20 LTS`.
`npx cap doctor` → `@capacitor/android/cli/core: 8.6.0` · `[success] Android looking great!`. Rows added to `machine.local.md`. `H:\dev-tools` = 14.0 GB (incl. 12 GB of Flutter-era installs, `dl\` deletable).
AVD `cc_phone_360` (made in TASK-014): booted with WHPX (`Windows Hypervisor Platform accelerator is operational`, no UAC), `wm size` 720x1600, density 320 (= 360 dp).

**Libraries (resolved, `package-lock.json`):** react 19.3.1 · react-dom 19.3.1 · react-router 8.5.1 · antd-mobile 5.43.0 · @capacitor/core, android, cli 8.6.0 ·
@capacitor/preferences 8.0.1 · network 8.0.1 · app 8.1.2 · vite 8.3.5 · typescript 7.0.2 · vitest 5.0.5 · @testing-library/react 16.3.3 · jsdom 30.1.3
(+ vite's own @vitejs/plugin-react, oxlint, @types/*). No push plugin. I had added `@testing-library/jest-dom` and `user-event` by mistake and uninstalled them.

**Built (SPEC-003 rev 2):** `capacitor.config.ts` (appId, appName, webDir `dist`, `CapacitorHttp` on) · `android/` by `cap add android` (minSdk already 24, portrait, `network_security_config.xml` cleartext to `10.0.2.2` only) ·
`vite.config.ts` (proxy `/api` → `VITE_PROXY_TARGET ?? http://127.0.0.1:8080`, vitest jsdom) · `src/app/{config,strings-th,routes}`, `src/data/{models,repositories}.ts` + empty `fake/`, `http/` ·
`src/features/{placeholder,shell}` · `src/test/app.test.tsx` · scripts `test`, `apk:debug` (`.\gradlew` — plain `gradlew` is not found by npm's cmd on this machine) · `.gitignore` + `.env*`, `android/app/google-services.json`.
All 11 routes of the table are placeholders with their Thai header; `data-testid` on every control (`tab-*`, `menu-open`, `menu-signout`, `signout-cancel|confirm`, `nav-back`, `<screen>-open-<x>`, `screen-title`).

**Evidence**
- `npm run build` → `tsc -b && vite build` → `✓ 934 modules transformed … ✓ built in 206ms`, no errors.
- `npm test` → `Test Files 1 passed (1) · Tests 2 passed (2)`: renders the app at 360x800, clicks all 3 tabs + every onward link + back by `data-testid` and finds each route's header (all 11 reached); sign-out menu on each of the 3 tabs: cancel stays, confirm → `/signin`.
- `npm run apk:debug` → `BUILD SUCCESSFUL in 1m 10s` · `android/app/build/outputs/apk/debug/app-debug.apk` **4.1 MB** · SHA-256 `00499d536e126777d39579d85665cdb72d0eafea8e15ec5d4a7d23c21aab9caa`.
- On `cc_phone_360` (always `-s emulator-5554`; a real phone `21ec5dd6` was also attached and was NOT touched): `adb install -r` → `Success`, app opens on `/messages`. Screenshots in `../ai-worker/tests/harness/task-025/`:
  `01-messages.png` `02-conditions.png` `03-channels.png` `04-menu.png` `05-signout-dialog.png`. The first capture was black (locked screen); retaken after wake.
- Browser at a true 360 px viewport (Chrome DevTools protocol, `npm run dev`): `{"w":360,"sw":360,"tabs":3,"menu":true}` → no horizontal scroll, 3 tabs, menu button. `06-browser-360.png`.
  Playwright itself is not installed here (not in SPEC-003 § Stack), so the "Playwright path" is shown with raw CDP, and `UNVERIFIED — Playwright`; the app needs nothing Playwright-specific (plain DOM + testids).
- `git status --porcelain` → `?? .gitignore .oxlintrc.json android/ capacitor.config.ts index.html package-lock.json package.json public/ src/ tsconfig*.json vite.config.ts` (generated files; nothing else in the repo; README unchanged).
- Footprint: emulator stopped (`emu kill`), dev server and test Chrome stopped. Left behind on purpose: `H:\dev-tools\**`, user env vars, `%USERPROFILE%\.android\avd\cc_phone_360`, `H:\dev-tools\dl\chrome-prof` (test profile, deletable).

**Not verified:** a physical phone (not touched); `/impeccable audit` not run — placeholders carry no design yet (TASK-026 is the first real UI); touch targets: back/menu are 44x44 px by CSS, the tab bar is antd-mobile's own.

## Questions
Non-blocking, for SA-B (invented copy is not allowed, so each is the nearest approved word and listed in `strings-th.ts`):
- **Q1** Header of `/messages/:id` and `/channels/line/groups` is not in SPEC-003/REQs. I used `ข้อความ` and `กลุ่ม LINE`. Confirm or give the PM's wording.
- **Q2** Accessible names for the back arrow and the top-right menu button (not visible text): I used `กลับ` and `เมนู`. Confirm.
- **Q3** SPEC-003 says "nothing was scaffolded" and "no AVD yet": TASK-014 had made both (Flutter scaffold, now deleted; AVD kept). FYI for the SPEC history.
- **Q4** Dialog + menu open/close have no exit animation under test (I mount the dialog only while open, because antd-mobile's close animation never finishes in jsdom). Cosmetic; say if you want it back.

> answers (Silver, SA-B, 2026-11-01):
> - **Q1** `/messages/:id`: SPEC-003's screen table already gives its header (channel label + group or sender name + time). That is dynamic, so `ข้อความ` is the right placeholder until TASK-026. `/channels/line/groups`: keep `กลุ่ม LINE` `[SA-decided, interim]`. I am asking the PM (UX writer) to confirm it, because users see it. If the PM changes it, the change goes in TASK-028.
> - **Q2** `กลับ` / `เมนู` are confirmed `[SA-decided]`. These are accessible names only and nobody sees them.
> - **Q3** Noted. SPEC-003 § History is corrected (the Flutter scaffold existed and is now deleted, and the AVD is kept).
> - **Q4** Accepted for now. If TASK-026 needs the close animation, it may bring it back. The test must then wait for `afterClose`, not drop the animation.

> answer `[PM, UX writer, 2026-11-01]`: **Q1**: confirmed. The header of `/channels/line/groups` stays **กลุ่ม LINE**, and nothing changes in TASK-028.

## Review
**Verdict: DONE** (Silver, SA-B, 2026-11-01 ~18:00). Reviewed against SPEC-003 rev 2 and the evidence. I re-ran the decisive checks myself:
- `npm run build` → `✓ built in 339ms`, with no errors. `npm test` → `Test Files 1 passed (1) · Tests 2 passed (2)`.
- `npm run apk:debug` (JAVA_HOME jdk-21) → `BUILD SUCCESSFUL in 2s`. `app-debug.apk` is 4300508 bytes. Its SHA-256 `00499d53…9caa` is **identical** to the Notes.
- `git status --porcelain` → 13 untracked entries, all generated or listed. `git log -1` = `f5e060d` (no commit). README is untouched.
- Config was read line by line:
  - `capacitor.config.ts`: appId, appName, webDir and CapacitorHttp are set ✓.
  - `vite.config.ts`: the proxy is `VITE_PROXY_TARGET ?? http://127.0.0.1:8080` ✓.
  - `config.ts`: the defaults are `true` and `/api/v1` ✓.
  - `minSdkVersion = 24` ✓.
  - `.gitignore` has `.env*` and `google-services.json` ✓.
  - `repositories.ts` has the 5 empty interfaces ✓.
  - `routes.tsx` covers all 11 rows of the screen table ✓. The headers come from `strings-th.ts`, with no Thai literal in a component ✓.
- The test reaches every route through `data-testid` and checks sign-out (cancel and confirm) on all 3 tabs ✓.
- Screenshots `01…06` exist. I looked at `03-channels` and `05-signout-dialog`: the 3 tabs, the ⋮ menu and the dialog show `ออกจากระบบไหม` · ยกเลิก / ออกจากระบบ, as in SPEC ✓.
- JDK 21 is recorded in `machine.local.md` with the owner's yes ✓. The real phone was not touched ✓.
- **Low, carried, not REWORK:**
  - The cleartext rule for `10.0.2.2` sits in `android/app/src/main/res/xml/`, so it would also apply to a release build. SPEC says debug only. It is harmless while only debug APKs exist, and it moves to the debug source set in **TASK-027 step 6** (the TASK is amended).
  - Playwright itself is `UNVERIFIED`. Raw CDP at 360 px proves the DOM and testid path, which is enough for this TASK.
- `/security-review`: not needed. There is no auth, input handling or secret in this TASK. The secrets placement (`.gitignore`) was checked above.
