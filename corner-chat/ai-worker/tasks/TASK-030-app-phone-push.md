# TASK-030: Phone notifications without Firebase: the in-app watcher, permission once, tap → message detail
- Source: SPEC-003 rev 2.1 § Behaviour ("Phone notification", D-B14), § Behaviour (Sign-out) · SPEC-001 §3.4 (`GET /messages`, `MessageSummary`) · REQ-005 req 3, AC-2, amendment (permission once; sign-out stops it), § Questions (no Firebase, D41) · REQ-005 wording (notifications-refused hint)
- Owner: FE (Fanta)
- Status: DONE 2026-11-01 (SA-B review below; phase A, A2 and phase B accepted). **Re-cut 2026-11-01** (owner: no Firebase). The FCM version of this TASK is replaced. The losses were accepted by the PM (D41). Both wording drafts below are **approved as written** (PM, REQ-005 Q-B).
- Depends on: TASK-029 (it calls `DeviceRepo.unregister()` at sign-out). **Amended 2026-11-01 (SA-B), two phases, the same way as TASK-029:**
  - **Phase A, now:** steps 1–3 and the boot receiver, only in `android/**` (the listed parts) and `src/push/**`.
  - **Phase B, after TASK-029 is DONE:** everything that touches the shared `repositories.ts`, `data/fake|http/devices.ts`,
    `main.tsx`, `routes.tsx`, `strings-th.ts` and `features/messages/**` (steps 4–6). The live DoD comes after phase B.
  - **A2, now (added 2026-11-01, from Sober's TASK-029 review via the PM):**
    - `signin-submit` (`src/features/signin/SignInScreen.tsx`) and `line-unlink` (`src/features/line/LineLinkScreen.tsx`) measure 40 px.
      Raise both to ≥ 44 px (CSS or `size` only) in those two folders, plus `src/test/{signin,line}.test.tsx` if they assert sizes.
    - Prove it with the browser at 360×800: paste each one's `getBoundingClientRect().height`, then `npm test` green.
    - **Not the emulator and not `android/`:** both are Fern's slot until TASK-029 is DONE.
    - **A2 accepted** (Silver, 2026-11-01 ~19:45): I re-ran `npm test` → `Test Files 12 passed (12) · Tests 84 passed (84)`. The measured heights before and after (39.8 → 44 px) are convincing, and the change is CSS only.
    - **Q6 → phase B** `[SA-decided]`: the sign-out dialog's buttons get the same 44 px floor, with `src/features/placeholder/**` (CSS only) added to phase B's list. Not now, because Fern's TASK-029 changed that dialog and is still in review. Live: a local back end by TASK-027's recipe. No B3, and no Team A work.

- Repo: `corner-chat-app`. Files you may edit:
  - `android/**`, only for: the local plugin's Java/Kotlin classes under `android/app/src/main/java/com/develyst/cornerchat/watch/`,
    its registration in `MainActivity`, and in `AndroidManifest.xml` the `<service>` (`foregroundServiceType="specialUse"` + the
    `PROPERTY_SPECIAL_USE_FGS_SUBTYPE` property), the boot `<receiver>`, and the permissions `FOREGROUND_SERVICE`,
    `FOREGROUND_SERVICE_SPECIAL_USE`, `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`
  - `package.json`/lock: add `@capacitor/local-notifications` only if you post the notifications from JS. Native-only is preferred, with no new package.
  - `src/push/**` (the TS side of the plugin: `start(token, apiBase)`, `stop()`, the permission-once flag, the tap listener)
  - `src/data/repositories.ts` (`DeviceRepo`: `register()`, `unregister()`), `src/data/fake/devices.ts`, `src/data/http/devices.ts`
  - `src/main.tsx`, `src/app/routes.tsx` (the tap → `/messages/:id`), `src/app/strings-th.ts`, `src/features/messages/**` (the refused hint only)
  - `src/test/push.test.tsx` · outside the repo: `../ai-worker/tests/harness/task-030/**`
- Git writes allowed: **none.**

## What to do
1. **The watcher (native foreground service, `specialUse`).**
   - Every 30 s: `GET {apiBase}/messages?tab=notified&limit=20` with `Authorization: Bearer <token>`.
   - For each item with `notifiedAt` > the watermark and `decidedBy != "user"`, oldest first: post a notification. The title is
     `aboutLine` (null → `AI ไม่ได้ตรวจ`), the body is `preview`, and a tap opens the app at `/messages/{id}`. Use a "messages"
     channel with high importance.
   - Then set the watermark to the newest `notifiedAt`. Keep the watermark in the service's own SharedPreferences.
   - **The first start after a sign-in** sets the watermark to now.
   - Network error → try again next tick, silently. A 401 → stop the service and clear the watermark.
   - Log only ids and counts, never message text or the token.
2. **The token reaches the service** through `start(token, apiBase)`. The service stores it in its own private SharedPreferences
   so it survives a reboot. `apiBase` is the APK's `VITE_API_BASE`. **FAKE build:** the service never starts. Instead, the fake
   `DeviceRepo` posts one sample notification 5 s after sign-in, so the owner sees what one looks like.
3. **The permanent notification** while the service runs, in a channel "service" with low importance. Draft
   `corner-chat กำลังรอข้อความใหม่` (Q-B). A tap opens the app.
4. **Permission once** (a Preferences flag, first sign-in only):
   - On Android 13+, `POST_NOTIFICATIONS` first.
   - Then the battery exemption (`ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` for our package), with a one-line explanation
     before it. Draft: `ให้ corner-chat ทำงานตลอดเวลา เพื่อแจ้งข้อความใหม่ได้ทันที` (Q-B).
   - Notifications refused → the list shows `ปิดการแจ้งเตือนอยู่ จะไม่เห็นข้อความใหม่จนกว่าจะเปิด · แตะเพื่อเปิด`, and a tap
     opens the app's notification settings. Never ask again.
5. **Lifecycle:**
   - `register()` = start, called after sign-in and at app start when a token exists.
   - `unregister()` = stop + clear the watermark and the stored token. TASK-029's sign-out calls it first.
   - Boot: the receiver restarts the service when a token is stored.
6. While the app is open, a notification the watcher posts also reloads the list (an event to JS).

## Definition of Done (paste real output)
- [ ] `npm run build` clean · `npm test` green:
  - the tap payload → `/messages/<id>`;
  - sign-out calls `unregister()` before logout (fake);
  - the permission is asked once;
  - the refused hint shows;
  - FAKE posts the sample notification and starts no service.
- [ ] `npm run apk:debug` succeeds (paste the tail). `git status --porcelain` shows **no** `google-services.json` and no Firebase dependency (`grep -ri firebase android/ package.json` → nothing; paste it).
- [ ] **Live AC-2 on `cc_phone_360`** with `cornerchat-local.apk` and TASK-027's back-end recipe (own DB, port 8093, made-up user):
  - sign in;
  - lock the screen;
  - put the emulator into Doze (`adb shell dumpsys deviceidle force-idle`);
  - insert one new notified message for that user with your seed SQL (`notified_at = now()`);
  - **time it until the notification shows** (it must be ≤ 60 s; paste the times);
  - tap it → the detail of that message.
  - Screenshots → `task-030/`: the permanent notification, the message notification, the opened detail, the battery prompt, the refused hint.
- [ ] **Sign-out:** after signing out, insert another message → **no** notification within 90 s (paste the times), and `dumpsys activity services com.develyst.cornerchat` shows no service.
- [ ] **Reboot:** `adb reboot`, wait, then insert a message → a notification within 60 s. If it fails on API 34, write `UNVERIFIED — boot restart` with the logcat line, and report it in Questions (not a blocker).
- [ ] The server stopped and the DB dropped (paste both), the same as TASK-027.

## Implementation Notes
### Phase A (Fanta, FE-B, 2026-11-01): the native watcher, `android/**` + `src/push/**` only
Repo `corner-chat-app`, base `main` `f5e060d`, nothing committed (git writes: none). `corner-chat-back`: nothing written there. Files touched: `android/app/src/main/java/com/develyst/cornerchat/watch/{WatcherService,WatchPlugin,BootReceiver}.java` (new), `MainActivity.java` (registers the plugin, passes a tapped message id on), `AndroidManifest.xml` (the `<service>` with `foregroundServiceType="specialUse"` + the `PROPERTY_SPECIAL_USE_FGS_SUBTYPE`, the boot `<receiver>`, the 5 permissions listed in the TASK), `src/push/watch.ts` + `src/push/push.test.ts` (new). No new package, no shared file (`repositories.ts`, `main.tsx`, `routes.tsx`, `strings-th.ts`, `features/messages/**`) touched: those are phase B.

**What it does (steps 1–3 + boot).** Foreground service, every 30 s `GET {apiBase}/messages?tab=notified&limit=20` with `Authorization: Bearer <token>`; for each item with `notifiedAt` > watermark and `decidedBy != "user"`, oldest first, one notification (title `aboutLine` in its full form, null → `AI ไม่ได้ตรวจ`; body `preview`; channel `messages`, high importance; a tap opens the app with the message id). Then the watermark = the newest `notifiedAt`. Token, `apiBase` and watermark live in the service's own private SharedPreferences (survive a reboot). `start(token, apiBase)` with a **different token or no watermark** sets the watermark to now; the same token again keeps it. Network error or non-200 → silent retry at the next tick. **401 → stop, clear token + watermark, cancel the alarm and every shown notification.** Permanent notification `corner-chat กำลังรอข้อความใหม่` in a low-importance `service` channel (tap opens the app). `BootReceiver` restarts it when a token is stored. JS side: `Watch.start/stop/takeTap` + a `tap` event (web fallback = no-ops), `listenForTaps(onTap)`, `askedOnce()/markAsked()`. Logs carry counts only (`tick ok: items=4 notified=1`), never text or the token.

**Evidence (phase A; the live DoD with Doze, screen lock, sign-out and tap → detail comes after phase B).**
- `npm test` → `src/push/push.test.ts` **6 passed**: a tap that started the app is handed over once · no pending tap navigates nowhere · a tap while running arrives through the event · the returned function stops listening · the ask-once flag (false → true, survives a re-read) · the web plugin does nothing and does not throw. `tsc` reports **no error in `src/push`**.
- Native build: `gradlew assembleDebug` → `BUILD SUCCESSFUL`; `cornerchat-local-phaseA.apk` 4.28 MB (4491933 bytes) SHA-256 `ec01bb6fc13135b4977d1001891eb03563c2390eb105c535652a0c942b16655e` (`tests/harness/task-030/`). Merged manifest on the device: `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_SPECIAL_USE`, `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED` (+ `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`, `INTERNET`).
  **`npm run apk:debug` was not run to the end**: `tsc -b` failed on another session's in-progress files (`src/features/conditions/*.test.tsx`, `MessagesRepo` just gained `reply`/`retryReply`), so I built the native side with Gradle directly (it reuses the web assets of my last good sync; the service does not use them). It built from the same Java as below.
- **On `cc_phone_360`** (Android 14, API 34, `-s emulator-5554`; the real phone was not touched; the service was started through `adb root` + `am start-foreground-service` with a made-up user's token, since JS wiring is phase B), local back end `corner_chat_app_b` on :8093 with TASK-027's seed (3 notified + 3 held old messages):
  - Start: `tick ok: items=3 notified=0` (**old messages raise nothing**). `dumpsys activity services`: `isForeground=true foregroundId=1 types=40000000` (= `specialUse`). Permanent notification in the shade: `persistent-notification.png` (Android hides a foreground-service notification for its first ~10 s on API 34; that is the system's rule).
  - **Screen on**, with the final timer: a new notified message inserted at 18:57:44.109 → notification at 18:58:01.188 = **17.1 s**; a later run after the `cancelAll` change: 26.4 s. (The very first run, 24.8 s, was before the timer fix below, when the alarm was the only clock.)
  - **Screen off (asleep, not Doze):** inserted 18:58:04.515 → shown 18:58:31.467 = **27 s**. `message-notification-shade.png`: title `[LINE · กลุ่มทดสอบ n-001] ข้อความทดสอบ n-001`, body `ข้อความใหม่สำหรับทดสอบการแจ้งเตือน…`.
  - **A held message** (`outcome=held`) inserted → **no notification** after 70 s.
  - **Same token again** (service re-started after an `install -r`): `tick ok: items=4 notified=0`, nothing old re-notified.
  - **Reboot** (`adb reboot`, the app never opened): `CCWatch: boot: watcher restarted` at 19:00:32.9, the service foreground again, `items=6 notified=0`, and a new message inserted at 19:00:51.121 → shown 19:01:04.927 = **13.8 s**. So the boot restart **works on API 34** (the Android 15 refusal is handled with a log line and is `UNVERIFIED` there: no API 35 image here).
  - **401** (the server ended the session at 19:01:19.895): `CCWatch: 401: the session is gone, stopping` at 19:01:34.126; service gone 15.7 s after the logout; the SharedPreferences file went from `watermark/apiBase/token` to `<map />`; the permanent notification gone; `dumpsys alarm` shows our `TICK` alarm as `Reason=alarm_cancelled`. In a second run the **shown message notifications also disappeared**: service gone and 0 notifications of ours **30.8 s** after the session ended (this is the `cancelAll()` I added because a signed-out user's messages must not stay in the shade).
  - Tick spacing, 5 ticks in a row: 18:55:27.4 · 18:55:57.9 · 18:56:28.4 · 18:56:58.9 · 18:57:29.5 = **30.5 s** each.
- **Defect found and fixed during the test:** with the inexact `setAndAllowWhileIdle` alarm as the only clock, two ticks were **53 s** apart (18:53:42.9 → 18:54:35.7), which would break the 1-minute promise. Now a plain 30 s timer on the service's single thread is the clock and the alarm is only the wake-up safety net (each tick replaces both). Ticks went to 30.5 s.
- Teardown: emulator killed · back end stopped (nothing LISTENING on 8093) · `DROP DATABASE corner_chat_app_b` → `DROP DATABASE`, then count `0` · `corner-chat-back` `git status --porcelain` 9 lines before and after, `diff` empty · the made-up user's token file deleted.
- `grep -ri firebase android/ package.json` (build outputs excluded): only one line, in Capacitor's own template `android/.gitignore` ("Google Services (e.g. APIs or Firebase)"); no `google-services.json`, no Firebase package. See Q2 about the template's inert google-services hook.
- **UNVERIFIED in phase A, needs phase B or more:** Doze with `deviceidle force-idle` and the battery exemption · tap → `/messages/<id>` (the JS side of the tap is wired in phase B; here only the PendingIntent and the plugin hand-over exist) · the permission-once flow and the refused hint · sign-out calling `unregister()` · Android 15 boot · a real phone.

### A2 (Fanta, FE-B, 2026-11-01): `signin-submit` and `line-unlink` ≥ 44 px, browser proof only
Cause: antd-mobile's default `Button` is 40 px high. Fix: CSS only, in the two folders named. `src/features/signin/signin.css`: `.si-form .adm-button { min-height: 44px }`. `src/features/line/line.css`: `min-height: 44px` on `.ln-body`, `.ln-dialog-actions`, `.ln-item` and `.ln-add` buttons. No component, no test, no `android/` touched (Fern's slot), **no emulator** used.
- **Measured** with `getBoundingClientRect().height` in a real 360×800 Chrome (CDP, FAKE build, same script before and after: `tests/harness/task-030/a2-measure.mjs`):
  - **before:** `signin-submit` **39.796875** · `line-unlink` **39.796875**
  - **after:** `signin-submit` **44** · `line-unlink` **44** (width 312 both). Screenshots `a2-before-*.png` / `a2-after-*.png` in the same folder.
- I also set the same floor on the other buttons of `line.css` (they had the same 40 px default) and measured them with `a2-others.mjs`: `line-new-code` **44** · `unlink-cancel` **44** · `unlink-confirm` **44** · `name-delete-0` **44** · `name-add` **46**. The sign-out dialog's buttons are in `features/placeholder/` (not in A2's two folders): not changed, see Q6.
- `npx tsc -p tsconfig.app.json --noEmit` → no output (clean) · `npm test` → `Test Files 12 passed (12) · Tests 84 passed (84)` (no test asserted a size, none changed) · no hex, `transition-all` or `z-index` in the two folders · Vite (5195) and the test Chrome (9333) stopped, nothing listening.

### Phase B (Fanta, FE-B, 2026-11-01): steps 4–6, the server-time watermark, the tap-id check, Q6, and the full live DoD
Base `main` `f5e060d`, nothing committed. `corner-chat-back`: nothing written there. **The emulator is released: I have stopped using it** (killed, `adb devices` shows only the real phone, which I never touched).

**What changed.**
- **Native** (`android/.../watch/`): `WatcherService` — the watermark is now the **server's** time (SA-B's Q3 ruling): a new token removes the stored mark; the first successful tick sets it to the newest `notifiedAt` in the answer (empty list: `"0"`, "the beginning") and notifies nothing; the phone's clock is never compared. The permanent notification is **re-posted every tick** (found live, see Defects). Notification helpers are static, so the plugin can post a sample. After posting it tells the open app (`posted`). `WatchPlugin` — `checkNotifications` / `requestNotifications` (the Android 13 prompt through Capacitor's permission API), `checkBatteryExemption` / `requestBatteryExemption` (`ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`), `openNotificationSettings`, `showSample`, event `posted`, and a shape check on a tapped id (`[A-Za-z0-9-]{1,64}`) in Java as well.
- **JS** (`src/push/**`): `PushBoot` (a layer inside the sign-in guard in `routes.tsx`: starts the watcher, asks once, follows a tap, reloads the list on `posted`, stops on a lost session) · `permission.ts` (`askOnce`: flag set **before** the first prompt, notifications first, then the explanation line, then the battery screen; FAKE asks for notifications only; nothing on the web; one flow even under StrictMode) · `tap.ts` (`routeForTap`: a UUID, or `m01`-style only in the FAKE build; anything with `/ ? #`, `..`, spaces, odd length is refused; `encodeURIComponent`) · `repo.ts`.
- **Data**: `DeviceRepo.register()`; `data/http/device.ts` now starts/stops the service (absolute `VITE_API_BASE` + the kept token; nothing in a browser); `data/fake/devices.ts` — the FAKE build starts **no** service; 5 s after sign-in it posts one sample notification (the first fixture's about line and preview) and retries every 2 s while Android refuses (the permission dialog is still open).
- **UI**: `NotificationsHint` on the list (the approved line `ปิดการแจ้งเตือนอยู่ …`, a tap opens the app's notification settings; only after the one-time ask, re-checked on resume) · the one-line explanation `ให้ corner-chat ทำงานตลอดเวลา เพื่อแจ้งข้อความใหม่ได้ทันที` as a banner · **Q6**: the sign-out dialog's two buttons are 44 px (`placeholder/tab-header.css`).
- One edit outside the list, forced by my change: `src/test/signout.test.tsx` — its three fake `DeviceRepo` objects got `register: async () => {}`.

**Evidence: code.** `npx tsc -p tsconfig.app.json --noEmit` → no output · `npm run build` → `✓ built in 279ms` · `npm test` → `Test Files 13 passed (13) · Tests 104 passed (104)` (84 before phase B; new: `push.test.tsx` 19). Covered: the tap → `/messages/<id>` (valid, hostile ids, with the real server only a UUID) · a tap that started the app (`takeTap`) · register once after the guard lets the user in, `posted` reloads the list · the real device repo hands over token + absolute base, nothing in a browser or without a token · unregister stops the watcher · FAKE posts the sample with the fixture's text, **starts no service**, retries while refused, stops on sign-out · permission asked **once** (order: notifications → explanation → battery), a refused prompt is not asked again, FAKE = notifications only, nothing on the web, two overlapping starts = one flow · the refused hint shows / hides (granted, not yet asked, enabled again on resume) · the explanation is drawn by the app and goes away. No hex, `transition-all` or `z-index` outside `theme.css`; impeccable detector on `src/push`, `features/messages`, `features/placeholder`: `[]`.
`grep -rniI firebase android package.json` (build outputs excluded) → one line, Capacitor's template `android/.gitignore:64` comment. No `google-services.json`; permissions in the manifest: INTERNET + the five of the TASK. **APKs** (`npm run apk:debug`, exit 0, `BUILD SUCCESSFUL`, in `tests/harness/task-030/`): `cornerchat-local.apk` 4.29 MB (4500068 bytes) SHA-256 `0e50268293a3b323bb1646a41dfe8b1c6c0cabdba2f04b75116698ad484170d2` · `cornerchat-fake.apk` 4.29 MB (4500049 bytes) SHA-256 `54f23ef289111a28b970edfdca4135468747434dbbc680927f1ea75a314cdab1`.

**Evidence: live, `cc_phone_360` (API 34), a throwaway back end** (`corner_chat_app_b` on :5433, port 8093, TASK-027's recipe, one made-up user, `new-message.sql` for each new message). Times are insert → notification shown, from the host clock.
| DoD item | Result |
|---|---|
| Sign in through `/signin` (first run) | log `first tick after a sign-in … watermark set from the server, notified=0` (old messages raise nothing); the notification dialog, the explanation, the battery screen: `03`, `15`, `16`/`05` |
| **AC-2: screen locked + `deviceidle force-idle` (deep IDLE), battery exemption granted, new notified message** | **31.7 s** (first run) · **11.7 s** (final APK) — both ≤ 60 s |
| Tap the notification | opens `/messages/<that message's UUID>`, the real detail: `09`, `10` (also with a real UUID, so the id check lets ours through) |
| Permanent notification | visible: `17` (after the fix below) |
| Battery prompt / refused hint | `05`/`16`; hint `06` → tap opens the app's notification settings `07` → switch on, come back → hint gone `08` |
| **Sign-out** (menu → confirm) | service gone within 3 s, **0** notifications of ours, the service's stored token + watermark `<map />`; a new notified message inserted afterwards: **not shown after 90 s** (first run) and **after 75 s** (final APK); `dumpsys activity services` shows no service: `12`, `13`, `22-so-*` |
| **Reboot** | `boot: watcher restarted` with the app never opened; message shown **15.9 s** after the insert; and again on the final APK after a hard kill + cold boot: **6.6 s** |
| **Clock +10 min** (SA-B's Q3 check) | phone clock measured at **+600 s** vs true UTC, fresh sign-in (new token), new message → still shown in **23.3 s**; clock restored (0 s). My first try used a wrong epoch (PowerShell's local-time `-UFormat %s`), so the phone was +7 h 10 min (25800 s): also shown, in 23.3 s; I measured and corrected before trusting it |
| **FAKE build** | fresh install: asks notifications only (no battery screen), **no service** (`dumpsys` → none); the sample is posted **1.2 s after the permission answer** (the dialog had been open past the 5 s mark): `19`; tap → fake message `m01`: `20` |

**Defects found and fixed in this phase.** (1) antd-mobile's `Toast.show` **does not render under React 19**, so the explanation before the battery screen was invisible (`04-DEFECT-toast-did-not-render.png`); it is now drawn by `PushBoot` (`15`). (2) A foreground service's notification posted before the user allows notifications is **never shown**; the permanent notification was missing after the first sign-in; re-posting it each tick fixes it (`17`). (3) The FAKE sample was posted while the permission dialog was open and refused by Android; it now retries until posted. (4) My first scripted sign-out in the final regression missed the menu (my taps, not the app: the service stayed up and a message was notified); I redid it with a screenshot at every tap (`22-so-1…4`) and it passed.
**A finding that differs from the SPEC (D-B14): the battery exemption was not needed to meet the 1-minute promise on this image.** Same deep Doze, screen off, **without** the exemption (user allowlist: `exempt: False`): the notification arrived in **18 s**. A foreground service keeps its network in Doze on Android 14. The prompt stays (cheap, and a real phone's vendor battery manager may be stricter), but "without it the promise breaks" is **not** what I measured. Not tested: a real phone, other vendors, a long real Doze (hours), maintenance windows.
Also seen: the emulator hung once on `adb reboot` during my scripted run (adb `offline`); I killed it and cold-booted. That doubled as a second boot-restart test.

**UNVERIFIED:** a real phone (never touched) · a vendor battery manager · Android 15 (boot receiver may be refused there: the code logs and the next app start restarts it; no API 35 image here) · a real Doze for hours · the sign-in on a phone with the back end beyond localhost (not part of this TASK) · mail-reply path (B2, not mine).
Teardown: emulator killed · back end stopped (nothing LISTENING on 8093/5195/9333) · `DROP DATABASE corner_chat_app_b` → `DROP DATABASE`, count `0` · `corner-chat-back` `git status --porcelain` 9 lines before and after, `diff` empty · the temp token file deleted · `git status` of `corner-chat-app`: only untracked generated files, HEAD `f5e060d`.

## Questions
Non-blocking, for SA-B.
- **Q7** (Doze) SPEC-003 § Behaviour says the battery exemption is what keeps the 1-minute promise in Doze. I measured 18 s **without** it (and 31.7 s / 11.7 s with it) on API 34 in forced deep idle. Do you want the prompt kept as is (my default: yes, cheap insurance for vendor battery managers), or reduced? The decisive real-phone check is the owner's.
- **Q8** (wording) The explanation before the battery screen is a banner for ~3 s, because no button word is approved for a dialog. If the PM prefers a dialog, I need one approved button word (e.g. for "continue").
- **Q9** (scope) `signout.test.tsx` (Fern's) got `register: async () => {}` in three places, forced by the new `DeviceRepo.register()`. `src/features/messages/NotificationsHint.tsx` and `src/push/PushBoot.tsx` are new files in the allowed folders; `routes.tsx` gained one layer (`PushBoot`) under the guard.

> answers (Silver, SA-B, 2026-11-01, phase B):
> - **Q7** Keep the prompt (your default). SPEC-003 is corrected to what you measured: 18 s **without** the exemption on API 34 in forced deep idle. The exemption stays as insurance against vendor battery managers, and a real phone is the decisive check (the owner's).
> - **Q8** The ~3 s banner is fine. A dialog would need a new button word, so it is not worth asking the PM for one now.
> - **Q9** All accepted: the three one-line stubs in `signout.test.tsx` (a mechanical consequence of the interface), the two new files and the one `PushBoot` layer.
- **Q1** Words in the native code (no new meaning, approved words only): the `messages` channel is named `ข้อความ`, the `service` channel is named like its notification (`corner-chat กำลังรอข้อความใหม่`). Confirm, or give the PM's wording. The notification small icon is a system one (`stat_notify_chat`), because a drawable is not in this TASK's file list.
- **Q2** Capacitor's template `android/build.gradle` / `android/app/build.gradle` still carry the generic `com.google.gms:google-services` hook (applied only if `google-services.json` exists; it never does). It is inert and not mine to edit (not in the file list). Your DoD says "no Firebase dependency": do you want that hook removed by a later TASK, or is "no `google-services.json`, no Firebase package" enough?
- **Q3** The watermark's first value is the **phone's clock** ("now" at the first start, as the TASK says), compared with the server's `notifiedAt`. A phone whose clock is minutes off could drop or repeat the first messages. Accepted for round 1? (A server-time start would avoid it; it needs a different first step, so I did not change the design.)
- **Q4** Doze: without the battery exemption the 30 s timer and the alarm are both held back while the phone is idle. Phase B asks for the exemption; I can only prove the 1-minute promise in Doze after that. Not tested here.
- **Q6** (A2) The sign-out dialog's two buttons (`signout-cancel` / `signout-confirm`, `features/placeholder/SignOutDialog.tsx`) use the same antd default and are probably 40 px too. They are outside A2's two folders, so I left them. Say if you want them in A2 or in phase B (`placeholder/` is on TASK-029's list, now done).
- **Q5** `npm run apk:debug` currently fails in this repo because of another session's unfinished work (TASK-029 phase B): `tsc -b` errors outside my files. Nothing for you to do unless it is still red when phase B starts.

> answers (Silver, SA-B, 2026-11-01):
> - **Q1** Confirmed `Interpreted`. Both channel names reuse approved strings. The system icon is fine for round 1.
> - **Q2** "No `google-services.json`, no Firebase package" is enough. The template hook is inert without that file, and removing it would edit Capacitor's generated Gradle files for nothing. Leave it.
> - **Q3** Good catch. I am changing the design to **server time** `[SA-decided, reversible]` for phase B, in `WatcherService` (already on your list):
>   - The **first tick after a new token notifies nothing** and sets the watermark to the newest `notifiedAt` in that response.
>   - If the list is empty, the watermark becomes "the beginning", so the next message is new.
>   - The phone's clock is then never compared with the server's.
>   - Add one emulator check: set the emulator clock +10 min, start, insert a message, and it is still notified.
> - **Q4** Yes. The Doze timing is phase B's DoD (`deviceidle force-idle` after the battery exemption), and it stays the decisive AC-2 check.
> - **Q5** Noted. TASK-029 phase B is Fern's work in progress. If `tsc -b` is still red when your phase B starts, tell me and I go through the PM.
> - **Also for phase B:** a tap id arrives through an exported activity's intent, so any app can send one. Before navigating, accept only an id shaped like ours (the server's id format; reject anything with `/`, `?` or `#`) and `encodeURIComponent` it.

## Review
**Phase A: accepted** (Silver, SA-B, 2026-11-01 ~19:20). This is not the TASK's verdict; that comes after phase B and the live DoD.
- Scope: only `android/**` (the listed parts) and `src/push/**` were touched ✓. Fanta notes `tsc` is clean in `src/push`. I did not re-run the suite, because `tsc -b` is red from TASK-029 B's files in progress (Q5).
- Native code read, with security in mind:
  - Prefs are `MODE_PRIVATE` ✓. The service is `exported="false"` ✓.
  - The boot receiver is exported (Android requires it for `BOOT_COMPLETED`) but checks the action first ✓. That action is system-protected.
  - Every `PendingIntent` is `FLAG_IMMUTABLE` ✓.
  - The token is sent only as the `Authorization` header, never logged (logs are counts and class names only) ✓.
  - On a 401 it clears the token, the watermark, the alarm and **every shown notification** ✓. That is better than the TASK asked: a signed-out user's messages leave the shade.
  - No Firebase package or file ✓.
- Evidence I find convincing:
  - ticks 30.5 s apart;
  - 17 s screen on, 27 s screen off;
  - held → none, and old → none;
  - reboot restart on API 34 → 13.8 s;
  - 401 → stopped, shade cleared.
  - The 53 s gap was found and fixed by the FE herself (timer as the clock, alarm as the safety net), which is good engineering.
- Phase B adds: the Q3 server-time watermark, the tap-id check, and steps 4–6 plus the full live DoD.

**Verdict: DONE** (Silver, SA-B, 2026-11-01 ~20:00). Phase B was reviewed against SPEC-003 rev 2.1 (D-B14), REQ-005 AC-2 and the amendment. I re-ran:
- `npm run build` → `✓ built in 236ms` · `npm test` → `Test Files 13 passed (13) · Tests 104 passed (104)`.
- `sha256sum` of both APKs in `tests/harness/task-030/` → `0e502682…70d2` (local) and `54f23ef2…dab1` (fake), **identical** to the Notes.
- `netstat` → nothing on 8093 ✓.
- Code read:
  - `src/push/tap.ts`: UUID only, or `m01` style in FAKE only; `encodeURIComponent` ✓.
  - Java `ID_SHAPE` checks the id twice, on intent and on take ✓.
  - Logs carry no token, text or preview ✓.
- Screenshots `09-message-notification` (the full-form about line + preview, per D42) and `10-opened-detail` (that message) were checked ✓.
- **AC-2 met on the emulator:**
  - deep Doze with the screen locked → 31.7 s / 11.7 s;
  - reboot → 15.9 s / 6.6 s;
  - clock +10 min → 23.3 s (the Q3 fix works);
  - after sign-out, nothing for 75–90 s, the service gone and its storage `<map />` (REQ-005 amendment).
- Four defects were found and fixed during the work (the Toast under React 19, the foreground-service notification before the permission, the FAKE sample retry, and a scripted mis-tap). All are honestly reported.
- Q7 changed SPEC-003: the exemption is not required on API 34. That is now written as measured.
- `UNVERIFIED`: a real phone and vendor battery managers (the owner's phone), Android 15 boot, and a real multi-hour Doze. These are the PM's to put to the owner, not a REWORK.
- **Security** (by hand: an exported entry point, a token at rest, logs):
  - the tap-id check stops navigation injection from another app;
  - the token is in app-private prefs and is cleared on a 401 and on sign-out;
  - there is no new network target (only our own `VITE_API_BASE`).
  - **No HIGH or MEDIUM finding.**

