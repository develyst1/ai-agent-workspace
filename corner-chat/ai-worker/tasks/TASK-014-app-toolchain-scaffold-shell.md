# TASK-014: Toolchain on this machine + Flutter scaffold + navigation shell (all routes as placeholders)
- Source: SPEC-003 § Stack, § Structure, § Screens and navigation (routes + bottom bar + sign-out menu) · REQ-005 req 1, 2 · AC-4 (shell part)
- Owner: FE (Fanta)
- Status: IN_PROGRESS
- Depends on: none

- Repo: `corner-chat-app` (absolute path: workspace-root `machine.local.md`). Team B claims it whole (board → Batch claims).
- Base: `main`, HEAD `f5e060d`, `README.md` only. SA ran on the base, 2026-11-01: `git status --short --branch` → `## main...origin/main` (clean).
- Files you may create/edit: anything `flutter create` generates, plus `lib/**`, `test/**`, `pubspec.yaml`, `pubspec.lock`,
  `analysis_options.yaml`, `android/app/build.gradle*` (applicationId, minSdk), `android/app/src/main/AndroidManifest.xml`,
  `android/app/src/main/res/xml/network_security_config.xml`, `.gitignore`. **Not** `README.md`. Outside the repo: only `H:\dev-tools\**`,
  the **user** PATH/env vars, and **one new row** in the workspace-root `machine.local.md` with the toolchain paths
  (PM's B9 ruling D28, SPEC-001 § Questions "PM on §8": user-level, official sources only, no admin, paths go there).
- Git writes allowed: **none.** Leave everything in the working tree.

## What to do
1. **Toolchain (SPEC-003 § Stack, D-B9).** Under `H:\dev-tools\`, from the official sources only:
   Flutter SDK stable (zip from flutter.dev's Windows install page), JDK 17 (Eclipse Temurin **zip**, not the MSI),
   Android command-line tools (zip from developer.android.com). Then `sdkmanager` → `platform-tools`, the newest stable
   `platforms;android-NN`, its `build-tools`, `emulator`, `system-images;android-34;google_apis;x86_64`. Create the AVD
   `cc_phone_360`: 1080×2400 px at 420 dpi is ≈ 411 dp wide, so set **`hw.lcd.width=720`, `hw.lcd.height=1600`, `hw.lcd.density=320` → 360 dp**.
   Set `JAVA_HOME`, `ANDROID_HOME` and PATH **for the user only** (`[Environment]::SetEnvironmentVariable(…, 'User')`).
   Add one row to `machine.local.md` (workspace root): `corner-chat app toolchain` → the Flutter, JDK and Android SDK
   folders. Absolute paths go **only** there, never in a committed file.
   🔴 Anything that raises a UAC/admin prompt → stop, write it in `## Questions`, set BLOCKED, tell the SA. Same if the
   emulator refuses to start for lack of acceleration (Windows Hypervisor Platform is an admin switch; the SA saw
   `HypervisorPresent: True`, CPU virtualisation on).
2. `flutter create --org com.develyst --project-name cornerchat --platforms android .` in the repo. Then set
   `applicationId "com.develyst.cornerchat"`, label `corner-chat`, `minSdk 24`.
3. Add only the packages listed in SPEC-003 § Stack, **without** the three push packages (TASK-018). Pin to the
   resolved versions (`pubspec.lock`).
4. The folder layout of SPEC-003 § Structure: `app/` (router, strings, theme, config), `data/` (models.dart empty
   shell, repositories.dart with the five abstract classes, empty `fake/` and `http/`), `features/`.
5. Router (`go_router`) with **every route** of SPEC-003's table, each a placeholder screen whose app-bar title is the
   screen's Thai name from `strings_th.dart`. Bottom `NavigationBar` **ข้อความ · เงื่อนไขของฉัน · ช่องทาง**. An overflow
   menu with **ออกจากระบบ** on those three opens the confirm dialog `ออกจากระบบไหม` (ยกเลิก / ออกจากระบบ). For now, confirm
   just goes to `/signin`. Placeholders link onward so every route is reachable: list → detail → reply; channels →
   zimbra / line → names / groups.
6. `config.dart` reads `--dart-define=API_BASE` (default `http://10.0.2.2:8080/api/v1`) and `FAKE` (default `true`).
   `network_security_config.xml` allows cleartext to `10.0.2.2` only, used by the debug build.
7. `strings_th.dart`: all REQ-005 wording + the titles you use now. SPEC-003 § Wording strings are final (the PM confirmed them all, SPEC-003 Q1); no `DRAFT` marks.

## Definition of Done (paste real output under Implementation Notes)
- [ ] `flutter --version`, `java -version`, `sdkmanager --list_installed`, `avdmanager list avd`: paste them (toolchain proven).
- [ ] `flutter doctor -v` → the Android toolchain section has no ✗ (paste that section; Chrome/VS lines may be ✗, they are irrelevant).
- [ ] `flutter analyze` → `No issues found!`
- [ ] `flutter test` → a widget test that pumps the app (FAKE) and, at a 360×800 logical size, taps each bottom tab and
      each onward link and finds each route's title: all routes reached. Paste the test output.
- [ ] `flutter build apk --debug` → path + size of `app-debug.apk`.
- [ ] Run on `cc_phone_360`: `flutter run -d emulator-5554 --dart-define=FAKE=true`, then a screenshot of each of the three
      tabs and of the sign-out dialog (`adb exec-out screencap -p > …`), saved to
      `../ai-worker/tests/harness/task-014/`. List the file names in Notes.
- [ ] `git status --porcelain` in `corner-chat-app` → paste it (generated files are expected; nothing outside the repo).
- [ ] Disk used by `H:\dev-tools` (paste the number). For the owner's list (D-B9).

## Implementation Notes

## Questions

## Review
