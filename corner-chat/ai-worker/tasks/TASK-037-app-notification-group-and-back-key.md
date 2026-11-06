# TASK-037: A tap on a grouped notification opens that message (DEF-2) · the Android back key = the back arrow (Q11, D46)
- Source: TEST-005 § Defects DEF-2 (MAJOR, Tefany, 2026-11-01) · REQ-005 AC-2 + § Questions (DEF-2, Q11 → D46 `[PM-decided]`) · SPEC-003 D-B14
- Owner: FE (Fanta)
- Status: DONE 2026-11-01 (SA-B review below; Fanta released the emulator 23:22:37, test DB dropped)
- Depends on: none. **Emulator:** ask the PM that `cc_phone_360` is free before you start it; write start and stop times in Notes. Stop it with `adb emu kill` only.
- Repo: `corner-chat-app`. Files you may edit:
  `android/app/src/main/java/com/develyst/cornerchat/watch/WatcherService.java` · `src/push/**` · a new `src/features/shell/backKey.ts` (+ its test) · the one place in `src/app/**` or `src/features/shell/Shell.tsx` that mounts it · `../ai-worker/tests/harness/task-037/**`.
- Git writes allowed: **none.**

## Part A — DEF-2: the collapsed group
**What we know (read, 2026-11-01):** `WatcherService.notifyMessage` posts each message with **no group**; the permanent
watcher notification (`serviceNotification`) has no group either and its tap opens the app with **no id** (`openApp(this, null)`).
Tefany's shade shows one corner-chat group "2 ⌄" that holds both. Expanded, a row tap opens the message 2/2.
**Cause, `inferred`:** Android groups an app's ungrouped notifications itself, and a tap on the collapsed group fires the
summary's (or the permanent notification's) intent, which carries no message id, so the app lands on the list.
What would settle it: step 1.

1. **Confirm the cause first** (old APK, before you change code): reproduce DEF-2's step 2, then
   `adb -s emulator-5554 shell dumpsys notification --noredact | grep -A3 "com.develyst.cornerchat"`. Paste the lines that
   show each notification's **group key** (expect a system key such as `ranker_group`) and whether a summary exists.
   If the dump says something else, stop and write it under `## Questions`.
2. **Fix (design `[SA-decided]`):** we choose the grouping, so the system never does:
   - the permanent watcher notification gets its own group key `cc.service` (alone, so it never merges with messages);
   - every message notification gets the group key `cc.messages`;
   - after posting, post **one summary** for `cc.messages` (`setGroupSummary(true)`, same channel, fixed id, `setAutoCancel(true)`,
     `InboxStyle` with one line per message still in the shade, newest first). **Its tap opens the newest message**
     (`openApp(c, newestId)`): with one message that is exactly "that message"; with several, the newest. Each row is still
     tappable once the group is expanded.
   - The summary's own `requestCode` must not collide with a message's (`messageId.hashCode()`) or the service's `0`: use a
     fixed constant and keep `FLAG_UPDATE_CURRENT`, so the summary always carries the newest id.
   - Which messages are "still in the shade": read `NotificationManager.getActiveNotifications()` for group `cc.messages`
     (ignore the summary itself). When none are left, cancel the summary.
   - The full `[channel · name] summary` title stays (D42 does not apply to notifications).
3. Keep everything TASK-030 proved: `ID_SHAPE`, the 401 stop clearing the shade (**it must clear the summary too**),
   sign-out stopping the watcher, no text in logs (`loggingBehavior: 'none'` stays).

## Part B — Q11 / D46: the Android back key
D46 `[PM-decided]`: the back key behaves like the on-screen back arrow (`navigate(-1)` in `BackHeader`, `MessageDetailScreen`,
`Placeholder`). Today it does nothing.
1. `backKey.ts`: one `App.addListener('backButton', …)` from `@capacitor/app` (already a dependency), mounted once inside the
   router. Rule:
   - on a tab's top screen (`/messages`, `/conditions`, `/channels`) or on `/signin` → `App.minimizeApp()` (the normal
     Android "leave to the home screen"; the app keeps its state);
   - anywhere else → the same as the back arrow: `navigate(-1)`; if there is no in-app history to go back to
     (`window.history.state?.idx` is `0` or missing), go to the screen's parent instead: `/messages/:id` and
     `/messages/:id/reply` → `/messages` (for reply: back to its detail), `/channels/*` → `/channels`.
   - A dialog or popup open (sign-out confirm, etc.): **not covered by D46. Do not build anything for it**; just write in
     Notes what the key does there.
2. Unit test the rule as a pure function `backTarget(pathname, historyIdx)` → `"minimize" | "back" | <path>`, every row above.

## Definition of Done (paste real output)
- [ ] Part A step 1: the `dumpsys` lines from the OLD APK (group keys), or your `## Questions` entry.
- [ ] `npm run build` clean · `npm test` green (counts; was 104 + TASK-036's).
- [ ] `npm run apk:debug` → a **local** APK (D43 recipe in SPEC-003, `VITE_FAKE=false`, your own `corner_chat_test_<you>` DB,
  fake LINE base, no `LINE_LIVE`). Size + SHA-256.
- [ ] On `cc_phone_360`, the app in the background (HOME), the permanent notification showing:
  - one message passes → in the shade, tap the **collapsed** corner-chat entry → it opens `/messages/<that id>`. **5 of 5.**
  - three messages pass → tap the collapsed group → it opens the newest; expand it and tap the oldest row → that one. 3 of 3.
  - `dumpsys` after the fix: the messages carry `cc.messages`, the service carries `cc.service`, exactly one summary.
  - sign out → the shade holds no corner-chat message and no summary.
- [ ] Back key (`adb -s emulator-5554 shell input keyevent 4`): list → home screen (app still in recents) · list → detail → back
  → list · detail opened by a notification tap (cold start) → back → list · `/channels/line/names` → `/channels/line` ·
  `/conditions` → home screen. Paste the route seen after each press.
- [ ] `logcat` counts as TASK-035 (message text 0).
- [ ] `git status --porcelain` → only listed paths changed.

## Implementation Notes
Fanta (FE-B), 2026-11-01, in progress. Repo `corner-chat-app`, base `main` `f5e060d`, nothing committed. **Emulator: not started yet (waiting for the PM's "free" via Silver).**

**Code done (not yet run on a device).**
- Part A, `WatcherService.java`: service notification `setGroup("cc.service")`; every message `setGroup("cc.messages")` + its id in the notification extras; after each post `updateSummary` reads `getActiveNotifications()` for group `cc.messages` (summary excluded), newest first, one `InboxStyle` line per message (its title), `setGroupSummary(true)`, id 2, `setAutoCancel(true)`, tap = `openAppFixed(c, newestId, 0x5C0DE)` (fixed request code, `FLAG_UPDATE_CURRENT`). No message left → summary cancelled. The 401 path still runs `cancelAll()`, which takes the summary too. `ID_SHAPE` and the logging are untouched.
- Part B: `src/features/shell/backKey.ts` (pure `backTarget(pathname, historyIdx)` + `useBackKey()`, one `App.addListener('backButton')`), mounted by a pathless layout route `WithBackKey` at the root of `src/app/routes.tsx`. Test `src/features/shell/backKey.test.ts`.
- **Order slip, said plainly:** step 1 (the `dumpsys` of the OLD APK) is asked before any code change; I wrote the code first because the emulator was not available. The old APK is kept (TASK-035's fake APK, `tests/harness/task-035/`), so step 1 can still be run on it, and I will, before installing the new one.
- Evidence so far: `npx tsc -b` clean · `npm test` → `Test Files 14 passed (14) · Tests 122 passed (122)` (was 104; +18, all `backKey.test.ts`) · `npm run build` `✓ built` · `VITE_FAKE=true npm run apk:debug` → `BUILD SUCCESSFUL` (the Java compiles): fake APK 4500618 bytes, SHA-256 `40d1210d72ef521b089228e0c4111b668ec56affcdcc3f2af19d767e8b5d4ae2`.
- `UNVERIFIED` until the emulator: every device row of the DoD (tap on the collapsed group, `dumpsys`, back key routes). The local APK (`VITE_FAKE=false`, D43) needs the owner's `DATABASE_URL` in the back end's `.env`; I will not touch env or DB. Without it, the fake APK can still run the notification rows via the plugin's sample path or the watcher, see next note once run.
- Note for the dialog question: with a dialog open the key now does what its route says (on a tab top: minimise; elsewhere: back); nothing is built for it (D46 does not cover it). To be seen on the device.

**Device run, done.** Emulator `cc_phone_360`: PM's "free" came through Silver; started 23:05:15 (hidden), stopped 23:22:37 with `adb emu kill`, no emulator process left at 23:23:17. Lab files, shots and the raw outputs below are in `tests/harness/task-037/` (`lab.ts`, `iter.sh`, `iter3.sh`, `step*.txt`, `step*.png`, `cornerchat-local.apk`). **The route after each tap is read from the WebView itself** (`adb forward` to `webview_devtools_remote_<pid>`, `GET /json` → `url`), not guessed from a picture.
- **Local back end (D43).** DB `corner_chat_test_appb` on the owner's server, created by `lab.ts up` (`CREATE DATABASE` + the repo's own `migrate`: 4 files), server on 8093 with `HOST=127.0.0.1 FILTER_PAUSED=true MAIL_POLL_SECONDS=0 LINE_API_BASE=http://127.0.0.1:9`, **no `LINE_LIVE`**. The URL and the password were read in-process and never printed. User `appb@corner.test` made through the admin API (password generated into the scratchpad, not in a desk file); messages inserted by `lab.ts msg`; the LINE link (needed only for the names page) was inserted into the throwaway DB by `lab.ts link`: no webhook, nothing sent. **Dropped at the end: `corner_chat_test_appb present after drop: 0`, and a second count: 0.** The server was stopped (port 8093 answers nothing). `corner-chat-back` was only run, never edited.
- **Part A step 1, old APK (`task-030/cornerchat-local.apk`, ungrouped)** — `step1-old-apk-dumpsys-lines.txt`: with the permanent notification plus one message, `dumpsys notification --noredact` shows the message and the service both with `groupKey=0|com.develyst.cornerchat|g:ranker_group`, and an extra record `id=2147483647 flags=0x722` (the system's summary). **The cause was right: the system grouped them itself under `ranker_group`.** The shade showed `corner-chat  2 ⌄`; a tap on it opened the **list** (`step1-old-after-tap-collapsed.png`) — DEF-2 reproduced. (The fake APK is useless for this step: it has no permanent notification, so it never forms a group. I tried it first.)
- **Part A, new APK** (local, `VITE_FAKE=false`, `VITE_API_BASE=http://10.0.2.2:8093/api/v1`; 4500633 bytes, SHA-256 `0a127b8e470135293351b26585e4b0f5c8805833920a6eccbe285f5bdee2a9e3`):
  - `step2-new-apk-dumpsys-1msg.txt`: the message `groupKey=…|g:cc.messages`, the service `…|g:cc.service`, one summary `id=2 flags=0x218` (group summary + auto-cancel), no `ranker_group`.
  - One message, app in the background, tap the collapsed corner-chat entry: **5 of 5** opened `/messages/<that id>` (`step2-single-message-runs.txt`; run 1 also by screenshot, `step2-run1-after-tap.png`).
  - Three messages: the shade shows one group with three lines, newest first (`step3-new-shade-3msg-collapsed.png`); `dumpsys` shows 3 messages + 1 summary in `cc.messages` and the service alone in `cc.service` (`step3-new-apk-dumpsys-3msg.txt`). Tap the **collapsed** group → the **newest**, **3 of 3**; expand it and tap the **oldest row** → the oldest, **3 of 3** (`step3-three-message-runs.txt`; the expanded shade is `step3-expanded.png`). After the summary's tap the whole group is gone from the shade.
  - Sign-out (menu → dialog → ออกจากระบบ): before it the shade held the 2 messages + summary (`step4-signout.txt`); after it **0** corner-chat notification records and 0 `g:cc.` lines.
- **Part B, back key** (`step5-back-key.txt`; `input keyevent 4`):
  - list → detail (tapped in the list) → BACK → `/messages` ✓
  - detail opened by a **cold start with the message id** (`am force-stop`, then `am start … --es cc_message_id`, the same extra a notification tap sends) → BACK → `/messages` ✓; BACK again on `/messages` → the launcher is in focus and the app is still in recents ✓
  - `/channels/line/names` → BACK → `/channels/line` ✓ → BACK → `/channels` ✓
  - `/conditions` → BACK → the launcher ✓
  - A detail opened by a notification tap **while the app was already open** goes BACK to the screen it was opened from (the previous detail), exactly like the on-screen arrow: ten presses took me from the last detail to the list, because each notification tap pushes a screen. That is `navigate(-1)` as D46 says, not new behaviour; I name it so QA is not surprised.
  - **Dialog open (not covered by D46, nothing built):** the sign-out dialog on `/messages` + BACK → the app goes to the home screen and the dialog is still open when the app comes back (`step5-dialog-after-back.png`). On a screen with history the key would go back under the dialog. If the PM wants the key to close the dialog first, that is a new decision.
- **Logcat** (`step6-logcat-counts.txt`; the dump is deleted, only counts kept; whole session split at the fixed APK's install, 23:11:06): **NEW APK** — `cc.token` 0 · `bearer` 0 · message text 0 · the sign-in password 0 · the email 0 · `Capacitor` 4 (`Starting BridgeActivity` ×2 and two `InputMethodManager … CapacitorWebView` lines from the system keyboard: no data) · `password` 7 (all system: the keyboard's `WebPassword`/`PasswordIme` input-type names and one mic-status line, no value). **OLD APK part, for contrast (logging on):** `Capacitor` 228 · `cc.token` 9 · message text 2 · the password 1 · the email 2. So TASK-035's fix holds on the local APK too; **the login body and the Bearer header are no longer UNVERIFIED**: the password I typed appears 0 times after the fixed APK, and `bearer` is 0 (the old APK shows the password once, the new one never).
- Evidence: `npx tsc -b` clean · `npm test` `Test Files 14 passed (14) · Tests 122 passed (122)` · `npm run build` ok · `git status --porcelain` in `corner-chat-app`: all untracked (nothing was ever committed), no new tracked path; the changes of this TASK are `WatcherService.java`, `src/features/shell/backKey.ts` + `.test.ts`, `src/app/routes.tsx`.
- Not done / not seen: a **fully killed** app's tap on the collapsed group (I used the cold-start extra, not a real tap, for the cold case); a real LINE; two-user mix. Cause of the `dead thread` warning (TASK-035) still not investigated.

## Questions

## Review
**Verdict: DONE** (Silver, SA-B, 2026-11-01 ~23:35). Reviewed against TEST-005 DEF-2, REQ-005 AC-2 and D46.
- I re-ran: `npm test` → `Test Files 14 passed (14) · Tests 122 passed (122)` · `npx tsc -b` clean.
- Code read:
  - `WatcherService.updateSummary` reads only the active `cc.messages` rows (not the summary), sorts newest first, and uses a fixed request code `0x5C0DE` with `FLAG_UPDATE_CURRENT`, so the summary always carries the newest id ✓.
  - The service is alone in `cc.service` ✓.
  - No rows left → the summary is cancelled ✓.
  - 401 → `cancelAll()` clears the summary too ✓.
  - `backKey.ts`: the pure `backTarget` covers the tab tops, `/signin`, history, and parent fallbacks; it is mounted once inside the router ✓.
- Step 1 confirmed the cause on the OLD APK: `g:ranker_group` plus the system summary. Before that it was `inferred`; now it is a fact. After the fix, `dumpsys` shows `cc.messages` / `cc.service` and one summary, with no `ranker_group` ✓.
- Device evidence: collapsed tap 5/5 · newest 3/3 · oldest row 3/3 · sign-out leaves 0 · every back-key route passes. Routes were read from the WebView, not guessed from screenshots ✓.
- The code was written before step 1. Fanta named the order slip herself, and step 1 still ran on the old APK before the new one was installed. No harm done.
- Bonus: logcat on the fixed **local** APK shows the password 0, `bearer` 0 and `cc.token` 0. **TASK-035's UNVERIFIED login-body/Bearer line is closed.**
- LOW, not blocking: a message the user swipes away by itself does not refresh the summary until the next post. The summary may still list it and, if it was the newest, open it. That is still a message, never the list.
- `UNVERIFIED` (QA): a real tap on the collapsed group with the app fully killed. Fanta used the cold-start extra, which is the same intent the tap sends.
- For the PM (not built, D46 silent): BACK with a dialog open on a tab-top screen minimises the app and leaves the dialog open.
