# TASK-041: Release APK — release-signed, HTTPS only, pointed at the SIT API
- Source: Porter → SA-B 2026-11-02 (DEPLOY, the owner wants it) · `../REQUEST-otto-to-porter-2026-11-02-corner-chat-deploy-plan.md` (workspace root) § What the desk prepares, item 1 · SPEC-003 (run modes)
- Owner: FE (Fanta)
- Status: DONE 2026-11-02 (SA-B review of parts A and B below). The signed release APK is built and not handed out.
- Depends on: the owner's decisions via Otto → Porter: (1) the final API name (proposed `cornerchat-api-sit.develyst.online`), (2) where the signing key lives (never in git)
- Repo: `corner-chat-app` (branch `D1`, HEAD `21eb731` when cut). Files you may edit: `android/app/build.gradle` · `android/.gitignore` · `package.json` (one script) · `../ai-worker/tests/harness/task-041/**`.
- Git writes allowed: **none.** No deploy, no upload, no sending the APK to anyone.

## What SA-B read (2026-11-02, `corner-chat-app` @ `21eb731`)
| Fact | Where |
|---|---|
| The `release` build type has **no `signingConfig`**: `assembleRelease` gives an unsigned APK | `android/app/build.gradle:19-24` |
| The release network config already forbids cleartext; only the debug set allows `10.0.2.2` | `src/main/res/xml/network_security_config.xml` · `src/debug/res/xml/network_security_config.xml` |
| **`VITE_FAKE` defaults to `'true'`**: a build without `VITE_FAKE=false` ships the fake data | `src/app/config.ts:5` |
| `VITE_API_BASE` defaults to `/api/v1` | `src/app/config.ts:8` |
| **`*.jks` / `*.keystore` are commented out in the ignore file**: a key put in the tree would be committable | `android/.gitignore:56-58` |
| `versionCode 1`, `versionName "1.0"` | `android/app/build.gradle:10-11` |
| `loggingBehavior: 'none'` already (DEF-1) | `capacitor.config.ts` |

## What to do
**Part A — now (no owner input needed):**
1. `android/.gitignore`: uncomment `*.jks` and `*.keystore`, and add `keystore.properties`.
2. `android/app/build.gradle`: add a `signingConfigs { release { … } }` that reads its four values (`storeFile`, `storePassword`,
   `keyAlias`, `keyPassword`) from a properties file **outside the repo**. Its path comes from the Gradle property
   `cornerchat.keystoreProps` (`-Pcornerchat.keystoreProps=<path>`). When the property is absent, the release build stays unsigned and
   prints one line saying so. Never fail a debug build over it. `buildTypes.release` uses that signing config. Never put a path or a
   password in the repo.
3. `package.json`: add `apk:release`, the same shape as `apk:debug`, ending in `.\gradlew assembleRelease`. It **must** set `VITE_FAKE=false`.
   `VITE_API_BASE` comes from the caller's env (no default baked in); the script fails if it is unset or does not start with `https://`.
4. Prove it **with a throwaway key** you make yourself (`keytool -genkeypair …` into `tests/harness/task-041/`, outside the repo;
   delete it after). Run `VITE_API_BASE=https://example.invalid/api/v1 npm run apk:release -- …`, then:
   `apksigner verify --print-certs` shows your throwaway cert ·
   the built `assets/public/assets/*.js` contains `https://example.invalid/api/v1` and no `10.0.2.2` ·
   `aapt dump xmltree … AndroidManifest.xml` shows no `debuggable` ·
   the release `network_security_config` is the no-cleartext one.

**Part B — after SA-B passes the 2 answers:** the owner (or whoever he names) holds the real key. You do **not** create the real key
or see its passwords unless his answer says so. The build command with the real name and the real properties path goes into
§ Implementation Notes for whoever runs it. Bump `versionCode`/`versionName` only if his answer says so.

## Definition of Done (paste real output)
- [ ] `npm test` green (count; was 130) · `npx tsc -b` clean.
- [ ] `apk:debug` still builds, and still talks to `10.0.2.2` (debug unchanged).
- [ ] Part A step 4: all four checks, with output. The throwaway key is deleted (`ls` shows it gone).
- [ ] Missing or `http://` `VITE_API_BASE` → `apk:release` refuses (paste the message).
- [ ] `git status --porcelain` shows only the listed files, and **no** `.jks`/`.keystore`/`keystore.properties` anywhere (`git status --ignored` shows the throwaway as ignored, if it was ever in the tree).

## Implementation Notes
Fanta (FE-B), 2026-11-02. Repo `corner-chat-app`, branch `D1` at `21eb731`, **nothing committed, nothing uploaded or sent.** **Part A done. Part B (the real key, the real API name) is NOT started: it waits for the owner's two answers via SA-B.**
- `android/.gitignore`: `*.jks`, `*.keystore` uncommented, `keystore.properties` added. `git check-ignore -v` confirms all three match (lines 56-58).
- `android/app/build.gradle`: reads `-Pcornerchat.keystoreProps=<path>` (a properties file outside the repo with `storeFile`, `storePassword`, `keyAlias`, `keyPassword`); when it is present a `signingConfigs.release` is built from it and `buildTypes.release` uses it; when absent the build stays unsigned and prints `cornerchat: -Pcornerchat.keystoreProps is not set, so the release APK stays UNSIGNED`. No path or password is in the repo. Note: that line is printed at configuration time, so a debug build prints it too (harmless; debug still builds).
- `package.json` `apk:release`: a `node -e` check that `VITE_API_BASE` starts with `https://` (else it prints `apk:release: VITE_API_BASE must be set and start with https://` and stops), then `set VITE_FAKE=false&& npm run build && npx cap sync android && cd android && .\gradlew assembleRelease`. Extra arguments pass through to Gradle: `npm run apk:release -- -Pcornerchat.keystoreProps=<path>`. It uses `set` (cmd), like the existing `apk:debug` uses `.\gradlew`: it is for this Windows machine.
- **Refusals (DoD):** no `VITE_API_BASE` → `apk:release: VITE_API_BASE must be set and start with https://`; `VITE_API_BASE=http://example.invalid/api/v1` → the same message. Neither builds anything.
- **Proof with a throwaway key** (`keytool -genkeypair … CN=throwaway task-041`, a random password, in `tests/harness/task-041/`, outside the repo; **deleted: 0 `throwaway*` files left**, and 0 `.jks`/`.keystore`/`keystore.properties` in the app tree). `VITE_API_BASE=https://example.invalid/api/v1 npm run apk:release -- -Pcornerchat.keystoreProps=<harness path>` → `BUILD SUCCESSFUL in 51s`, `app-release.apk` 3361577 bytes:
  1. `apksigner verify --print-certs` → `Signer #1 certificate DN: CN=throwaway task-041`, SHA-256 `a3a82b90490703f7…` (`check1-apksigner.txt`; the verify printed no error).
  2. The built `assets/public/assets/*.js`: `https://example.invalid/api/v1` in 1 file, `10.0.2.2` in 0 files; the bundle holds `get fake(){return!1}` (fake **off**, baked in) and `get apiBase(){return\`https://example.invalid/api/v1\`}`. The fake fixtures' text is still in the bundle as unused code (2 hits for a fixture phrase): dead code, not used when `fake` is false.
  3. `aapt dump xmltree … AndroidManifest.xml | grep -ci debuggable` → `0`; the manifest points at `networkSecurityConfig`.
  4. The release `network_security_config` (resource shrinking renamed it to `res/8G.xml`, found by content): `base-config cleartextTrafficPermitted=0x0`, no domain-config, so no `10.0.2.2` (`check4-network-config.txt`).
- Without `-P`: `BUILD SUCCESSFUL`, `app-release-unsigned.apk`, and the UNSIGNED line above. The APK signed with the throwaway key was removed from the build folder so nobody installs it.
- **Debug unchanged:** `VITE_FAKE=false VITE_API_BASE=http://10.0.2.2:8093/api/v1 npm run apk:debug` → `BUILD SUCCESSFUL`, and its bundle still holds `10.0.2.2` (1 hit).
- `npx tsc -b` clean · `npm test` → `Test Files 15 passed (15) · Tests 130 passed (130)`.
- `git status --porcelain` → exactly `M android/.gitignore`, `M android/app/build.gradle`, `M package.json`.
- `UNVERIFIED`: that a **real** key and the real API name work (Part B), and that the release APK installs and signs in on a device: I did not install it anywhere (no emulator use in Part A).
- **API name is final** (SA-B's inbox line to me, 2026-11-02, relaying the owner): `VITE_API_BASE=https://cornerchat-api-sit.develyst.online/api/v1`. **Not built yet:** Part B still holds for the key location; I build nothing until SA-B says so.
- **For whoever runs Part B** (the key location is still to come; the API name above is final): `set VITE_API_BASE=https://cornerchat-api-sit.develyst.online/api/v1` then `npm run apk:release -- -Pcornerchat.keystoreProps=<path to the owner's properties file>`; the signed APK lands in `android/app/build/outputs/apk/release/app-release.apk`. `versionCode 1` / `versionName "1.0"` are unchanged until his answer says otherwise.

### Part B notes (Fanta, 2026-11-02, nothing sent, installed or uploaded)
- **Key made once** in `H:\corner-chat\signing` (the folder did not exist; I created it; `H:\corner-chat` is not a git repo): `cornerchat-release.jks` (4288 bytes, RSA 4096, alias `cornerchat`, `-dname "CN=corner-chat, O=develyst"`, valid 10000 days) and `keystore.properties` (4 keys: `storeFile` absolute, `storePassword`, `keyAlias=cornerchat`, `keyPassword`). The password is 32 random characters, generated inside one script and passed to `keytool` through `-storepass:file`/`-keypass:file` (a temp file in that folder, deleted at once), so it never appeared in a command line, a terminal echo, a chat, a log or a file of ours. Only `keystore.properties` holds it. **I have not read it back to anyone and will not.**
- `machine.local.md` (git-ignored) row for the key: added the alias, the SHA-256 and the dates; no password.
- **Build:** `VITE_API_BASE=https://cornerchat-api-sit.develyst.online/api/v1 npm run apk:release -- -Pcornerchat.keystoreProps=H:/corner-chat/signing/keystore.properties` → `BUILD SUCCESSFUL in 22s`. The APK stays in `corner-chat-app/android/app/build/outputs/apk/release/app-release.apk`: **3361589 bytes, SHA-256 `9816a1b5f9986b52d22f586591266f3b44cebef185f449d3b68898abf8b96e3b`**; package `com.develyst.cornerchat`, `versionCode 1`, `versionName 1.0` (unchanged).
- **Evidence** (`tests/harness/task-041/partB-apksigner.txt`):
  - `apksigner verify --print-certs` → `Signer #1 certificate DN: CN=corner-chat, O=develyst`, SHA-256 `deb72918e64257d273885e0102523faf2d145ab9c77b0715075c126f58f04c6a`: **the same fingerprint as in `machine.local.md`**.
  - Bundle: `https://cornerchat-api-sit.develyst.online/api/v1` 1 hit, `10.0.2.2` 0 hits, `get fake(){return!1}` (fake off).
  - `aapt dump xmltree … AndroidManifest.xml | grep -ci debuggable` → `0`.
- **Leak checks** (printed counts only): the first 6 characters of the password in `corner-chat-app`/`-back`/`-front` (excluding `node_modules`/`build`/`.gradle`) → **0 files**; in `corner-chat/ai-worker/` → **0 files**; in `machine.local.md` → 0. `git status --porcelain`: `corner-chat-back` 0 and `corner-chat-front` 0 changed; `corner-chat-app` shows only part A's three files (`android/.gitignore`, `android/app/build.gradle`, `package.json`), nothing new from part B; no `.jks`/`.keystore`/`keystore.properties` in any of the three repos (`git ls-files -o -c`: 0).
- `UNVERIFIED`: that the APK installs and signs in on a device (I did not install it, as told); the off-PC backup of `H:\corner-chat\signing` is the owner's: **losing that folder means no update of this app can ever be signed with the same key.**

## Questions

## Review
**Owner answer 1 of 2 (2026-11-02, via Otto → Porter, `SYSTEM-FACTS.md`): the API name is FINAL.** Use `VITE_API_BASE=https://cornerchat-api-sit.develyst.online/api/v1`. Answer 2, where the signing key lives, was still open at that point, so part B was on HOLD.

**Owner answer 2 of 2 (2026-11-02, Otto's § Update, Porter's relay): *"เครื่องนี้ + สำรอง"*.** Keep the `.jks` on this PC in a folder **outside every repo**. Its path goes in `machine.local.md` only. The owner makes the off-PC backup himself. **Part B is UNBLOCKED.**

### Part B: what to do (SA-B, 2026-11-02)
Porter's D47 (`project-docs/decisions-for-owner-review.md`) names the folder and who makes the key:
- **Folder:** `H:\corner-chat\signing` (Porter has already written it into `machine.local.md`). It sits beside the three repos and inside none of them; `H:\corner-chat` is not a git repo (checked: `git rev-parse` → `not a git repository`).
- **Who:** you (Fanta) generate the key there, **once**:
  `keytool -genkeypair -v -keystore <folder>\cornerchat-release.jks -alias cornerchat -keyalg RSA -keysize 4096 -validity 10000 -dname "CN=corner-chat, O=develyst"`.
  Use a random password of 24+ characters for the store and the key (the same one is fine). It goes **only** into
  `<folder>\keystore.properties` (`storeFile=` the **absolute** `.jks` path, `storePassword`, `keyAlias=cornerchat`, `keyPassword`).
  **Never** put the password in a chat, a log, a TASK, an inbox line or a terminal echo. Generate it in a script that writes the file directly.
- **`machine.local.md`** (workspace root, git-ignored, checked with `git check-ignore`): Porter's row already holds the folder. Add only
  the alias and the SHA-256 cert fingerprint to that row. No password.
- **Build:** `set VITE_API_BASE=https://cornerchat-api-sit.develyst.online/api/v1`, then
  `npm run apk:release -- -Pcornerchat.keystoreProps=H:\corner-chat\signing\keystore.properties`. `versionCode 1` / `versionName "1.0"` are unchanged.
- **Evidence** (Implementation Notes):
  - `apksigner verify --print-certs` shows `CN=corner-chat` and the same SHA-256 as in `machine.local.md`;
  - the bundle holds `https://cornerchat-api-sit.develyst.online/api/v1`, 0 `10.0.2.2`, and fake false;
  - no `debuggable`;
  - the APK's size and SHA-256.
  Leave the APK in `android/app/build/outputs/apk/release/`. **Do not send, upload or install it anywhere**; handing it out is the owner's or Otto's job.
- **Leak checks:**
  - `git status --porcelain` in all 3 repos shows nothing new;
  - `grep -r` of the 3 repos and of `corner-chat/ai-worker/` for the first 6 characters of the password → 0 hits. Run it from the same script, and print only the count.

**Part A: DONE** (Silver, SA-B, 2026-11-02). **Part B: still HOLD** for the owner's 2 answers, so the TASK stays open.
- I re-ran:
  - `npx tsc -b` clean;
  - `npm test` → `Test Files 15 passed (15) · Tests 130 passed (130)`;
  - `apk:release` with no `VITE_API_BASE` and with `http://x/api/v1` → `apk:release: VITE_API_BASE must be set and start with https://`, nothing built ✓.
- `git diff` read:
  - `.gitignore` ignores `*.jks`, `*.keystore` and `keystore.properties`.
  - In `build.gradle`, signing is read only from `-Pcornerchat.keystoreProps`, there is no path or secret in the repo, and with no property the build is unsigned and prints a line.
  - The script sets `VITE_FAKE=false` (`set X=false&&`, no trailing space) ✓.
- `git status --porcelain` lists exactly the 3 listed files. A `find` over the app tree finds 0 `.jks`/`.keystore`/`keystore.properties`. The harness holds only the 2 check text files (no key) ✓.
- I accept Fanta's evidence for the 4 artifact checks: the throwaway cert, `https` in the bundle with 0 `10.0.2.2` and `fake` false baked in, no `debuggable`, and the no-cleartext config. Debug is unchanged.
- Notes for part B, not defects:
  - `storeFile` in the properties file is resolved relative to `android/app/` when it is not absolute, so the owner's file should use an absolute path.
  - The script is Windows-only (`set`), like `apk:debug`.
  - The fake fixtures are still in the bundle as dead code; they are unused while `fake` is false.

**Part B: DONE → TASK-041 DONE** (Silver, SA-B, 2026-11-02 ~22:20). I checked this myself without reading `keystore.properties`:
- `app-release.apk`: 3361589 bytes, `sha256sum` → `9816a1b5f9986b52d22f586591266f3b44cebef185f449d3b68898abf8b96e3b` ✓ (matches Fanta).
- `apksigner verify --print-certs` (JAVA_HOME = jdk-21): `CN=corner-chat, O=develyst`, SHA-256 `deb72918…4c6a`. This is the same fingerprint as in the `machine.local.md` row ✓.
- Bundle: 1 file with `https://cornerchat-api-sit.develyst.online/api/v1`, 0 with `10.0.2.2`, 1 with `get fake(){return!1}` ✓.
- `aapt dump xmltree … AndroidManifest.xml | grep -ci debuggable` → `0` ✓.
- `git status --porcelain` → only part A's 3 files. `H:\corner-chat\signing` holds exactly `cornerchat-release.jks` and `keystore.properties` ✓.
- I accept Fanta's leak grep (0 hits). I did not repeat it, because that would mean reading the password.
- UNVERIFIED: install and sign-in on a device against the SIT API. That is QA's SIT pass after Otto's first deploy.
- **For the owner (via the PM):** back up `H:\corner-chat\signing` off this PC. If it is lost, no later update can be signed with this key.
