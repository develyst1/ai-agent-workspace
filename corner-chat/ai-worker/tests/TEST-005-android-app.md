# TEST-005: Android app — every screen, notification for every passed message
- Team: B (+ Fern, Team A, on TASK-029) · TASKs: TASK-025 … TASK-030 (SPEC-003 rev 2)
- Source REQ: REQ-005 (ACs tested: AC-2 … AC-6; AC-1 is the PM's comp check, not a QA case)
- Status: **TEST_PASSED** — run 6 2026-11-02 (owner's server, TASK-037/038 APK `05fbbbca…`): 8/8; DEF-1 + DEF-2 fixed; D46 back key + overlays PASS. NOT_TESTED: mail parts (B2), real phone (Q3). Designed 2026-11-01 from the REQ; **rev 2 the same day for SPEC-003 rev 2 (Capacitor 8 + React + Vite + TS
  + antd-mobile, D36)**. Verdicts after SPEC_DONE
- Build under test: repo `corner-chat-app` against the local `corner-chat-back`, branch TBD (B6) — per round: HEAD sha,
  plus the build mode (`npm run dev` web · local debug APK · fake APK)
- Surfaces: **web build** in headless Chrome at 360×800 (Playwright) · **local debug APK** on the emulator `cc_phone_360`
  (Google Play image, for push) · **fake APK** (`VITE_FAKE=true`) for layout only · a real phone only if the owner lends one
- Designed: 2026-11-01 by Tefany · rev 2 2026-11-01

## Scope
- In: notification arrival + tap (AC-2), the two tabs (AC-3), reachability of every req. 2 screen at 360 px (AC-4),
  offline (AC-5), per-user isolation through the app (AC-6), sign-out, session, error wording, Thai wording.
- AC-1 (comp before build) is checked by the PM; I only note whether the built screens still match it.
- Judged elsewhere, only reached here: filter logic (REQ-004 / Tanya), mail reply content (REQ-002 / Tanya),
  LINE linking logic (REQ-003 / TEST-004). Here: the screen exists, is reachable, and shows what the API returned.
- Out (REQ Out of Scope): iOS, public Play listing, English, tablet layouts, auto-reply, Discord / Web Chat / Teams.

## How each AC gets its verdict — which layer decides
The same React build runs in the browser and inside the APK (SPEC-003). So most logic is proven in the browser, and the
APK proves what only Android has. An AC is PASS only when every layer named for it is PASS.

| AC | Web build (Playwright) | Local debug APK (emulator) |
|---|---|---|
| AC-2 push + tap | — (no push in a browser) | **decides** (B3) |
| AC-3 tabs + reasons | **decides** | smoke: one tab switch |
| AC-4 reachable at 360 px | **decides** (hit-test walk) | **decides** too: system back button, real WebView painting |
| AC-5 offline | logic (`setOffline`) | **decides**: the AC says airplane mode |
| AC-6 isolation | **decides** (app + API) | account switch with push (case 25) |

## Instrument limits
- **Web build, headless Chrome (`channel: "chrome"`) at 360×800, Vite proxy to the local back end:** proves screens,
  navigation, data-testid presence, list/detail behaviour against the real local API, offline logic, isolation.
  It does **not** prove Android: no push, no system back button, `localStorage` instead of Capacitor Preferences,
  `navigator.onLine` instead of Android's network state, desktop Chrome fonts instead of the WebView's.
- **Playwright actionability is not a finger.** Every reachability claim uses the hit-test at the control's centre
  (`document.elementFromPoint`) + page `scrollWidth == clientWidth` + the screenshot (`references/web-playwright.md` §4).
- **Debug APK on the emulator:** proves install, push via FCM (Play-services image), airplane mode, system back,
  Preferences storage. It does **not** prove OEM battery-saver killing pushes on a real phone (NOT_TESTED, named; Q3).
- **Fake APK / `VITE_FAKE=true`:** layout and render only. **Not** behaviour: the fakes resolve with one shape, so server
  refusals and other payloads are untested, not passed.
- **Local back end with the AI stub:** lets me cause "passed", "held" and "AI down" on demand. Proves the app path, not
  the AI.
- **Timing (AC-2, 1 minute):** from the decision time stored per message to the notification's arrival on the emulator
  clock; both clocks noted. 5 runs, all ≤ 60 s; the slowest is reported.
- **API calls with U1's token** (AC-6): prove the server refuses, not only that the screen hides.
- **Tooling:** the app's dev dependencies have no Playwright. I use `playwright-core` + the system Chrome from
  `tests/harness/app/` (the desk's area), never added to `corner-chat-app`. Scripts: `tests/harness/app/local-app-*.mjs`,
  each with a head comment (what it proves, the command, what it does not prove). Selectors are `data-testid` only.

## Cases
| # | Case (from AC) | Type | Surface | Steps / command | Expected | Actual | Evidence | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | AC-2 notify, app in background | happy | APK | U1 signed in, app in background; stub = pass; a message for U1 | notification ≤ 60 s: about line + first 2 lines | | | NOT_TESTED |
| 2 | AC-2 notify, app closed (swiped away) | state | APK | as 1, app killed | notification ≤ 60 s | | | NOT_TESTED |
| 3 | AC-2 notify, app open | state | APK | as 1, app open on the list | the list reloads with the new message (SPEC: "reload when a push arrives while open") | | | NOT_TESTED |
| 4 | AC-2 tap opens that message | happy | APK | tap the notification from 1, 2 and 3 | `/messages/{messageId}` of that message, not the list or another | | | NOT_TESTED |
| 5 | AC-2 two notifications, tap the older | boundary | APK | two passed messages A, B; tap A's | A's detail | | | NOT_TESTED |
| 6 | AC-2 held → no notification | negative | APK | stub = hold | no notification; message in "ไม่ได้แจ้ง" | | | NOT_TESTED |
| 7 | AC-2 timing, 5 runs | boundary | APK | repeat case 1 five times | all ≤ 60 s; slowest recorded | | | NOT_TESTED |
| 8 | AC-2 permission refused (Android 13+) | negative | APK, API 33+ image | first sign-in, deny the prompt; cause a pass | no notification; list hint "ปิดการแจ้งเตือนอยู่ จะไม่เห็นข้อความใหม่จนกว่าจะเปิด · แตะเพื่อเปิด"; tapping it lets the user turn notifications on (Q2, PM-decided) | | | NOT_TESTED |
| 9 | AC-2 asked once | state | APK | sign out, sign in again | permission prompt not shown a second time (SPEC: once, at the first sign-in) | | | NOT_TESTED |
| 10 | AC-2 AI down | regression (REQ-004 AC-5, D3) | APK | stub = down | notification arrives; detail shows "AI ไม่ได้ตรวจ" | | | NOT_TESTED |
| 11 | AC-3 tabs | happy | web, then APK smoke | 2 passed + 2 held for U1 | passed under `แจ้งแล้ว`, held under `ไม่ได้แจ้ง`; each held one's detail shows `ทำไมไม่แจ้ง` + its reason | | | NOT_TESTED |
| 12 | AC-3 empty tabs | boundary | web | new user, no messages | "ยังไม่มีข้อความที่ต้องแจ้ง" / "ยังไม่มีข้อความที่ถูกกรองออก" | | | NOT_TESTED |
| 13 | AC-3 correction moves tabs | state (REQ-004 AC-8, D4) | web | held → `แจ้ง`; passed → `ไม่ต้องแจ้ง` | each moves to the other tab and stays after reload | | | NOT_TESTED |
| 14 | AC-3 channel chips | happy | web | mail + LINE messages; chips ทั้งหมด · อีเมล · LINE | only that channel's messages | | | NOT_TESTED |
| 15 | AC-3 paging | boundary | web | more messages than one page; scroll to the end | next page loads once (`nextCursor`); no duplicates; stops at the last | | | NOT_TESTED |
| 16 | AC-4 walk every screen | reachability | web 360×800 + APK | from `/signin`, reach all 11 routes of SPEC-003 by the app's own navigation (tab bar, top-right menu, rows, back arrows), never by typing a URL; back out of each | every route reached; every control hit-tests to itself; page `scrollWidth == clientWidth`; screenshot per route | | | NOT_TESTED |
| 17 | AC-4 system back (Android) | reachability | APK | on each screen press the system back | (D46, Q11) like the on-screen back arrow: on a detail or a sub-screen one step back; on a tab's top screen it leaves the app to the home screen; never a blank screen | | | NOT_TESTED |
| 18 | AC-4 every control has a data-testid | testability (SPEC rule) | web | on each route list every button, input, link, tab, chip without `data-testid` | zero missing | | | NOT_TESTED |
| 19 | AC-4 long Thai text | data shape | web 360 + APK | 2,000-char Thai message, long group name, long about line, long attachment names | detail scrolls; list rows truncate cleanly; no overlap; no sideways scroll | | | NOT_TESTED |
| 20 | AC-4 large font | boundary | APK | Android font size largest | every route still reachable; buttons hit-test | | | NOT_TESTED |
| 21 | AC-4 detail contents | happy | web | open a passed AI-judged message, a held rule-judged one, a mail one with Cc and attachment | per SPEC-003 `/messages/:id`: text, about line, `ตรงเงื่อนไข {n}%` · `เกณฑ์ {n}%`, `ตัดสินโดย`, `โมเดล`, the right button, `สำเนาถึงคุณ`, `มีไฟล์แนบ`; `ตอบกลับ` on mail only | | | NOT_TESTED |
| 22 | Req. 4 new messages without restart | happy | web + APK | list open; a new message arrives; pull to refresh; also leave and resume the APK | new message shows; no restart | | | NOT_TESTED |
| 23 | AC-5 offline, web logic | happy | web | list loaded; `context.setOffline(true)`; reload the list | "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด" + the saved list | | | NOT_TESTED |
| 24 | AC-5 airplane mode | happy | APK | list loaded; airplane on; open the list | same as 23 | | | NOT_TESTED |
| 25 | AC-5 back online | state | web + APK | offline off / airplane off | banner goes; list reloads | | | NOT_TESTED |
| 26 | AC-5 offline from cold start | boundary | APK | kill app, airplane on, open | last saved list + offline wording; never saved → the wording alone (Q4, PM-decided) | | | NOT_TESTED |
| 27 | AC-5 action while offline | negative | web | offline; tap `แจ้ง` / send a mail reply | refused visibly; nothing half-sent after reconnect | | | NOT_TESTED |
| 28 | AC-6 isolation in the app | permission / regression (REQ-001 AC-3) | web | U1 and U2 each have messages, conditions, channels, LINE groups; sign in as U1; visit every route | none of U2's items anywhere | | | NOT_TESTED |
| 29 | AC-6 isolation at the API | permission | curl with U1's token | GET/POST U2's message, correction, reply, rule, channel ids | not found / not allowed; no U2 data in the body | | | NOT_TESTED |
| 30 | AC-6 typed URL to U2's message | permission | web | signed in as U1, open `/messages/{U2's id}` | error state; nothing of U2 painted | | | NOT_TESTED |
| 31 | AC-6 account switch on one device | permission / privacy | APK | U1 signs out, U2 signs in; cause a pass for U1 | no U1 notification on this device; nothing of U1 shows to U2 — a leak is a BLOCKER (Q1, PM-decided) | | | NOT_TESTED |
| 32 | Sign-out clears the offline cache | privacy | web + APK | U1 loads the list; signs out; go offline; open the app | sign-in screen; none of U1's saved list | | | NOT_TESTED |
| 33 | Sign out | happy | web + APK | menu → ออกจากระบบ → "ออกจากระบบไหม" → yes; then browser back / system back | `/signin`; back shows no data | | | NOT_TESTED |
| 34 | Sign out when the device delete fails | negative | web | back end down for `DELETE /devices/…` only (or stopped), sign out | still signed out locally (SPEC) | | | NOT_TESTED |
| 35 | Not signed in | permission | web | fresh context, open each route by URL | every route → `/signin` | | | NOT_TESTED |
| 36 | Token no longer valid | state | web | sign in; owner disables U1 (or token removed server-side); next call | 401 → token cleared → `/signin` | | | NOT_TESTED |
| 37 | Error wording | negative | web | cause `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`, `TOO_MANY_ATTEMPTS`, `MAIL_LOGIN_FAILED`, and an unknown code | REQ-001 / SPEC-003 Thai text; unknown → "เกิดข้อผิดพลาด ลองอีกครั้ง"; the server's `error.message` never painted | | | NOT_TESTED |
| 38 | Dates | data shape | web | messages at 23:59 and 00:01 Bangkok time | `d MMM HH:mm`, Thai, Asia/Bangkok, from any browser time zone | | | NOT_TESTED |
| 39 | Wording | happy | web | every string in REQ-005 §wording and SPEC-003 §Wording, verbatim | exact match | | | NOT_TESTED |
| 40 | No secrets or text in logs | privacy (SPEC non-functional) | web console + `adb logcat` | a full session: sign-in, list, detail, reply | no token, password or message text in the console or logcat | | | NOT_TESTED |
| 41 | Install | happy | emulator | install the local debug APK fresh | opens to `/signin` | | | NOT_TESTED |

## Run 1 — 2026-11-01 — web build only (the emulator is Tanya's until the PM frees it)
Build: app `corner-chat-app` working tree, `src` fingerprint **`bc72845cb2e93213`** (82 files; repo has only `f5e060d`) ·
back `f930f30b0d6abb6f`.
Surface: the browser build (`npx vite`, `VITE_FAKE=false`, `/api` → QA-B's own back end on :8192), headless system Chrome,
360×800, mobile + touch, th-TH, **browser time zone America/New_York** (for #38). The stack is `harness/qa-b/stack.ts`.
Setup goes through the API and signed LINE webhooks. The script is `harness/qa-b/test-005-web.mjs` →
`test-005-web-result.json`, **39/39 PASS** (T5 and T4 rows). Screenshots: `harness/qa-b/shots/b*.png`, one per walked
screen (`bw-*.png`).
Three harness errors were found and fixed before this result; none was a product fault:
- I expected an empty groups list for a user that the fake LINE makes a member of G1.
- I tried to open a screen while already offline, against a dev server.
- Leftover groups from an earlier run on the same stack.

| # | Result | Actual |
|---|---|---|
| 1–10 | **NOT_TESTED** | push: APK on the emulator (slot) |
| 11 | **PASS** (web) | PASS row only in แจ้งแล้ว, HOLD row only in ไม่ได้แจ้ง · held detail "ทำไมไม่แจ้ง ไม่เกี่ยวกับงาน (QA-B stub) ตรงเงื่อนไข 0% · เกณฑ์ 70%" (`b06`). The APK smoke check is still due |
| 12 | **PASS** | "ยังไม่มีข้อความที่ต้องแจ้ง" / "ยังไม่มีข้อความที่ถูกกรองออก" (`b01`) |
| 13 | **NOT_TESTED here** | not re-run on this build. TEST-003 run 3 #22/#23 passed it on app `43a13788…` (an older fingerprint) |
| 14 | **PASS** | chip labels "ทั้งหมด · อีเมล · LINE"; LINE shows the LINE rows; อีเมล shows the empty text (no mail message exists). Mail rows: NOT_TESTED (B2) |
| 15 | **PASS** | 35 notified, page 30: scrolling to the end shows 35 rows, 35 unique |
| 16 | **PASS** (web) | reached by navigation: messages, detail, conditions, channels, Zimbra, LINE, names, groups, menu. No sideways scroll; the back arrow hit-tests on each sub-screen (`bw-*.png`). **`/messages/:id/reply` not reached**: it needs a mail message (B2). APK walk due |
| 17, 20 | **NOT_TESTED** | APK (system back, Android font size) |
| 18 | **PASS** | 0 interactive elements without a `data-testid` (own or wrapper) on the 9 screens |
| 19 | **PASS** (web) | 2,000+ char Thai message: page 360/360, `detail-correct` hit-tests at 24..336 (`b08`) |
| 21 | **PASS** (LINE parts) | about line · full text · "ทำไมถึงแจ้ง … ตรงเงื่อนไข 100% · เกณฑ์ 70% ตัดสินโดย: AI โมเดล: deepseek-flash / deepseek-v4-pro" · `ไม่ต้องแจ้ง` · no ตอบกลับ on LINE · AI-down "AI ไม่ได้ตรวจ" (`b07`). Mail parts (subject, Cc, attachments, ตอบกลับ): NOT_TESTED (B2) |
| 22 | **PASS** | a new message arrives while the list is open → not shown → a touch pull-down (CDP touch events) shows it. The APK resume check is still due |
| 23 | **PASS** (logic) | `setOffline` → "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด" + the saved rows (`b09`) |
| 24, 26 | **NOT_TESTED** | airplane mode / cold start: APK |
| 25 | **PASS** (web) | back online: banner gone, list loads |
| 27 | **PASS** | correction tapped offline → "เกิดข้อผิดพลาด ลองอีกครั้ง"; outcome still `notified` after reconnect (`b09b`) |
| 28 | **PASS** | U2's marker text on none of U1's 6 routes, either tab |
| 29 | **not re-run** | API isolation: TEST-001 #7–#9 (67/67, Tanya) |
| 30 | **PASS** | U1 opens U2's message URL → `detail-error`, no U2 text |
| 31 | **NOT_TESTED** | APK + push |
| 32 | **PASS** (web) | after sign-out, no `QAB5` text in storage. APK (Preferences) due |
| 33 | **PASS** | "ออกจากระบบไหม" → sign-in; browser back shows no data |
| 34 | **NOT_TESTED** | needs the device delete to fail alone (no instrument for that yet) |
| 35 | **PASS** | 8 routes, not signed in → `/signin` |
| 36 | **not re-run** | TEST-001 run 2 #11 (Tanya, app `43a13788…`) |
| 37 | **PASS** (fallback) | mail host on a closed port → `MAIL_SERVER_UNREACHABLE` → "เกิดข้อผิดพลาด ลองอีกครั้ง" (server text not shown). `MAIL_LOGIN_FAILED` wording: NOT_TESTED (needs a mail server that refuses; B2 / Team A's stand-in). Sign-in codes: TEST-001 run 2 (Tanya) |
| 38 | **PASS** | New York browser: 16:59Z → "1 พ.ย. 23:59", 17:01Z → "2 พ.ย. 00:01" |
| 39 | **PASS** | tabs, channels screen, menu, tab labels, empties, offline, sign-out confirm, LINE strings: all verbatim |
| 40 | **PASS** (browser) | 0 of 107 console lines hold a token, password or message text. `adb logcat`: APK |
| 41 | **NOT_TESTED** | APK |

## Run 2 — 2026-11-01 — native APK on the emulator (PM slot)
APK: `npm run build` + `npx cap sync android` + `gradlew assembleDebug` (JDK 21) with `VITE_FAKE=false`,
`VITE_API_BASE=http://10.0.2.2:8192/api/v1` → `harness/qa-b/cornerchat-qa-b-8192.apk`, sha256 `36e962b0a5076059…`
(the baked address was checked inside the APK). App `src` `bc72845c…`, back `f930f30b…`.
Device: `emulator-5554` = `cc_phone_360`, `sdk_gphone64_x86_64`, API 34, 720×1600 @320 (360 dp), started headless by me.
**Every adb call named `-s emulator-5554`; the real phone `21ec5dd6` was listed and never addressed** (it was gone from
`adb devices` at the end; not my doing).
Driving: raw DevTools into the WebView (Tanya's method). Notifications are read with `dumpsys notification --noredact`
and tapped through the shade (`uiautomator dump` + `input tap`).
Script: `harness/qa-b/test-005-emu.mjs` → `test-005-emu-result.json` (run 2: **28/34**; run 1 `…run1.json`). My first run's
notification parser broke on Windows CRLF and showed every notification as missing. Fixed and re-run; run 1's push rows
are void. Screenshots: `harness/qa-b/shots/e*.png`.
**LINE (D44):** both runs started the back end with `LINE_API_BASE` = the product's fake LINE API and a made-up token in
the process environment. I checked from the back repo that Bun keeps those values over `.env`:
`{"tokenIsQaB":true,"baseIsFake":true,"secretIsQaB":true}` (booleans only). Nothing reached real LINE.

| # | Result | Actual (APK) |
|---|---|---|
| 1 | **PASS** | app in background: title `[LINE · กลุ่มทดสอบ] ขอให้ช่วยดูเรื่องงาน` (full form, D42), body `@U1 QABE-BG1 รายงานด่วน⏎บรรทัดสอง` (2 lines of 3) after 28.6 s · messages from before sign-in raise nothing (watermark) |
| 2 | **PASS** | app swiped away from recents → notified after 7.5 s |
| 3 | **PASS** | app open on the list → the row appears with no action after 23.3 s (and a notification) |
| 4, 5 | **INCONCLUSIVE → NOT_TESTED** | tapping the notification left the app on `/messages`, not the detail (`e06-tap-opened.png`), in all 3 taps. But the shade held 5–7 cornerchat notifications at the time, and Android bundles them; my tap may have hit the bundle's group row, not the message's own row. Not a defect until it reproduces with **one** notification in the shade (needs a re-run: DB hold below). TASK-030's own evidence shows a tap opening the detail (`task-030/10-opened-detail.png`) |
| 6 | **PASS** | held → no notification in 70 s (> 2 ticks) |
| 7 | **PASS** | 5 runs, from the webhook (filter included): 28.6 · 30.7 · 29.7 · 30.8 · 30.7 s — all ≤ 60 s |
| 8 | **PASS** | first sign-in shows the system prompt (`e02`); refused → list hint "ปิดการแจ้งเตือนอยู่ จะไม่เห็นข้อความใหม่จนกว่าจะเปิด · แตะเพื่อเปิด" (`e03`); a passed message raises nothing in 50 s |
| 9 | **PASS** | sign out + sign in again → no second prompt |
| 10 | **PASS** | AI down → notified, title "AI ไม่ได้ตรวจ" |
| 11 (APK) | **PASS** | tab switch renders both tabs |
| 17 | **NOT_TESTED** | my script lost its place after the first system-back (it navigated by URL, then by a row); the walk did not run. Needs a re-run |
| 19 (APK) | **NOT_TESTED** | it hangs on the tap above (detail not reached). At font 1.3 the detail button hit-tests (#20) |
| 20 | **PASS** | font scale 1.3 (API 34's largest): list tabs, tab bar, menu, `detail-correct` all hit-test (`e07`) |
| 22 (APK) | **PASS** | HOME → a message arrives → reopen → the list shows it (reload on resume) |
| 24 | **PASS** | airplane mode → "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด" + saved rows (`e08`) |
| 25 (APK) | **PASS** | airplane off → banner gone |
| 26 | **PASS** | cold start in airplane mode → saved list + banner (`e09`) |
| 31 | **PASS** | sign-out removes the watcher's permanent notification · U1 out, U2 in: U1's passed message raises nothing on this device in 90 s · U2's app shows no U1 text (`e10`) |
| 32 (APK) | **PASS** | signed in: Preferences hold `cc.token` + `cc.cache.*` · after sign-out: neither, and no message text |
| 33 (APK) | **PASS** | "ออกจากระบบไหม"; system back after sign-out shows no data |
| 34 | **N/A** | SPEC-003 rev 2.1 (D-B14) dropped `DELETE /devices` from the app: no device registration to fail |
| 40 (APK) | **FAIL → DEF-1** | logcat holds the password, the token and message text |
| 41 | **PASS** | fresh install opens to sign-in (`e01`) |
| obs | recorded | Tanya's two observations. **(a)** The status-bar icon after sign-in is the watcher's permanent notification "corner-chat กำลังรอข้อความใหม่". SPEC-003 D-B14 requires it and the PM approved its wording (D41), so it is by design. **(b)** The battery toast over the detail: not seen in my runs ("no toast" on the detail after the tap), but the detail itself was not reached there (#4). **Not settled** |

**DB hold (D43, read 2026-11-01 after run 2 ended):** the workspace now forbids using a local Postgres. Runs 1–2 of
TEST-004/-005 used my own database on the team's local cluster (127.0.0.1:5433), the setup Tanya also used. I learned
the rule from the PM's inbox line after run 2 finished. The results stand as runs on that build. Every re-run
(#4/#5/#17/#19, the 10-min unblock) waits for my database `corner_chat_test_qa_b` on the owner's server (D43).

## Run 3 — 2026-11-01 — DEF-1 re-test after TASK-035 (no database, no back end)
Build: app `src` `bc72845c…` (unchanged), `capacitor.config.ts` sha256 `32062f580c42e6fa…` (`loggingBehavior: 'none'`).
Two APKs built from that tree; `assets/capacitor.config.json` inside each shows `"loggingBehavior": "none"`:
- **fake** (`VITE_FAKE=true`) `cornerchat-qa-b-def1-fake.apk`, sha256 `576a5c382a85431e…`. This is **identical to TASK-035's
  reviewed APK**, so the build reproduces.
- **local** (`VITE_FAKE=false`, API `10.0.2.2:8192` with nothing listening) `cornerchat-qa-b-def1-local.apk`,
  sha256 `268b1d27a90ba6ed…`.

`emulator-5554`, API 34. Script `harness/qa-b/def1-recheck.mjs` → `def1-recheck-result.json` (copy `…fixed.json`).
It types a made-up email and password into the form, then counts lines in `logcat -d`. **It prints counts only.**

| Check | Fixed APKs | Control: pre-fix APK `cornerchat-qa-b-8192.apk`, same script (`…control.json`) |
|---|---|---|
| typed password · typed email · login body (`auth/login`) — local APK, request to an unreachable server | **0 · 0 · 0** | **1 · 1 · 3** — the instrument sees the leak |
| `V Capacitor: callback` verbose lines | **0** (local), **0** (fake) | 2 |
| fake APK signed in, list loaded (6 rows), one detail opened: fixture message text · `cc.token` pref · `Bearer` | **0 · 0 · 0** | — (the pre-fix fake case: TASK-035's own before count, 9–12 lines) |

Result: **5/5 PASS.** DEF-1 is **fixed** for the login body (password, email), the stored token and message text.
**NOT_TESTED:** the `Bearer` header on a **successful** call to the real local API. That needs a running back end, so it
waits for the D43 database. With logging off at the bridge level, the same setting gates it (TASK-035 § Review, Capacitor
source read by the FE). That is a code read, not my run.

## Run 4 — 2026-11-01 — live rows on the owner's server (D43), fixed APK
Build: back `7808f3ed…`, app `src` `bc72845c…` + `loggingBehavior: none`, APK `cornerchat-qa-b-def1-local.apk`
(`268b1d27…`, `10.0.2.2:8192`). Database `corner_chat_test_qa_b` on the owner's server, dropped after (checked:
`existed: true · now: 0`). LINE: fake (D44). Emulator `emulator-5554` only; the real phone was not attached.
- **Run 4 (22:00) is VOID — my fault.** I ran `test-005-web.mjs` at the same time on the same stack. Its "OA leaves every
  group of U1" step also removed the emulator run's group: the fake LINE API makes every user a member of every group.
  After that no message reached the emulator user (0 open groups, checked in the DB). Kept as `emu-run4-void.log`.
- **Run 5** (`emu-run5.log` / `test-005-emu-result.json`, alone, fresh DB): **28/35**. Then **focused runs**
  (`harness/qa-b/emu-focus.mjs` → `emu-focus-result.tapAB.json`, `emu-focus-c.log`) for the rows run 5 could not settle.
- Browser rows re-run on this back end: `test-005-web.mjs` **39/39**.

| # | Result | Actual |
|---|---|---|
| 1, 3, 7 | **PASS** | background notification 27.5 s, full-form title, 2 body lines · 5 runs 27.5 / 29.6 / 30.6 / 30.7 / 29.7 s · list open: row after 23.3 s |
| 2 | **PASS** | focused run C: swiped from recents → service and process still alive → notified after 9.6 s. Run 5's miss came right after my "clear the shade" step, and run 2 passed (7.5 s), so I count run 5's miss as my instrument |
| 4 | **FAIL → DEF-2** | the notification is **grouped with the watcher's permanent one** ("2 ⌄" in the shade, `shots/f01a-shade.png`). Tapping the group's visible line: run A1 opened the message, run A2 opened **the list** (`/messages`); run 2's 3 taps in a bigger group opened the list too. **Expanding the group first, then tapping the row, opened that message 2/2** |
| 5 | **NOT_TESTED** | older-of-two not re-run once grouping was understood |
| 6, 8, 9, 10, 11, 20, 22, 24, 25, 26, 31, 32, 33 | **PASS** | as in run 2, now on the owner's DB and the fixed APK: 20 = font 1.3, `detail-correct` hit-tests (so #19's APK half holds at the larger font) |
| 17 | **QUESTION → Q11** | Android back key on a message detail (opened from the list): **nothing happens**. App stays in front on the same detail, after 1 and 2 presses, history length 2–5 (`f03`/`f04-after-back.png`). The on-screen back arrow works. No REQ/SPEC line says what the system back key must do |
| 40 | **PASS** | logcat `{"messageText":0,"password":0,"bearer":0,"tokenPref":0,"capacitorVerbose":0}` of 14,265 lines, after a full signed-in session on the live API. **The Bearer header row from run 3 is now closed** |
| 41 | **PASS** | fresh install opens to `/signin` |

## Run 6 — 2026-11-02 00:40–00:52 — re-test after TASK-037 (DEF-2 + back key) and TASK-038 (back closes overlays)
Build: app `c69fbbc7bab36ec8` (`src` + `android/app/src/main`, 139 files) → APK `cornerchat-qa-b-t038-local.apk`
sha256 `05fbbbca6eb0e16e…`, `loggingBehavior: none`, API `10.0.2.2:8192` · back `7808f3ed…` · DB `corner_chat_test_qa_b` on
the owner's server (fresh per stack start, dropped after: `now: 0`). Fake LINE, AI stub. `emulator-5554` only; the real phone
`21ec5dd6` was attached and never addressed. Script `harness/qa-b/emu-retest.mjs` → `emu-retest-result.json`, **8/8 PASS**
(one clean run, `connclosed: 0`). Screenshot `shots/r01-collapsed.png`: the messages are now their own corner-chat group, with
the watcher's permanent notification separate.
Before it: runs 1–5 of this script failed on **my** instrument, fixed one by one:
- a DevTools socket that died on page reload;
- presence instead of visibility for antd-mobile's closed popover;
- tab clicks on sub-screens that have no tab bar;
- tapping the summary before #5, which clears the group;
- **twice, the back end lost its database connection** (Observation below).

| # | Result | Actual |
|---|---|---|
| 4 | **PASS — DEF-2 fixed** | 3 older ones in the shade + N4 → tap the collapsed group → N4's detail. After a swipe from recents: notified in 14.8 s, the collapsed tap → that message (closes TASK-037's `UNVERIFIED`) |
| 5 | **PASS** | expanded group, rows N3/N2/N1; tap the oldest (N1) → N1's detail |
| 17 | **PASS (D46)** | detail → `/messages` · LINE → `/channels` · names → `/channels/line` · groups → `/channels/line` · Zimbra → `/channels` · `/messages`, `/conditions`, `/channels` tops → the app leaves to HOME |
| D46 ext. | **PASS** | back with an overlay open closes it only: menu on `/messages`, sign-out dialog, un-link dialog, rule-delete dialog. Each time the app stays in front on the same path; afterwards still signed in, still linked, the rule kept |
| 40 | **PASS** | logcat `{"messageText":0,"password":0,"bearer":0,"capacitorVerbose":0}` |

## Defects
### DEF-2 — **FIXED (run 6, TASK-037)** — tapping a notification in its collapsed group often opens the message list, not that message — MAJOR
- Build / environment / surface: APK `cornerchat-qa-b-def1-local.apk` (app `bc72845c…`), back `7808f3ed…` on
  `corner_chat_test_qa_b`, emulator-5554 API 34 (`cc_phone_360`).
- Preconditions: a user signed in with notifications allowed; the watcher's permanent notification
  "corner-chat กำลังรอข้อความใหม่" is showing; the app is in the background (HOME).
- Repro (from a clean state):
  1. A message for the user passes the filter.
  2. Within about 30 s the shade shows one **corner-chat group** "2 ⌄", holding the message notification and the
     permanent one.
  3. Pull down the shade and tap the group's visible message line ("[LINE · กลุ่มทดสอบ] ขอให้ช่วยดูเรื่องงาน").
- Expected: REQ-005 AC-2 *"tapping it opens that message"* (`/messages/{id}`).
- Actual: the app opens on **`/messages` (the list)** in 4 of 5 taps on the collapsed group. Run 2: 3/3 with 5–7 messages
  grouped. Focused runs: 1 of 2 with one message. After expanding the group (tap "2 ⌄") and tapping the message row, it
  opens that message 2/2.
- Frequency: 4 of 5 (collapsed group).
- Evidence: `harness/qa-b/emu-focus-c.log` ("A": `seen ["/messages"]`, expected `/messages/68d104da…`) ·
  `emu-focus-result.tapAB.json` (A ok, B ok) · `shots/f01a-shade.png` (the group as the user sees it) ·
  `test-005-emu-result.run1.json` / run 2 rows #4/#5.
- Linked case: #4, #5. (No proposed fix. A real phone may group differently: NOT_TESTED, Q3.)

### DEF-1 — the debug APK writes the password, the sign-in token and message text to logcat — MAJOR — **FIXED (run 3, Bearer-on-live-call NOT_TESTED)**
- Build / environment / surface: `cornerchat-qa-b-8192.apk` (debug, `assembleDebug`), app `src` `bc72845c…`, emulator-5554
  API 34. The same build type as the APKs handed out (D11: installed directly).
- Preconditions: a clean install; any user account.
- Repro (from a clean state):
  1. `adb -s emulator-5554 logcat -c`
  2. Open the app and sign in.
  3. Let the list load.
  4. `adb -s emulator-5554 logcat -d | grep Capacitor`
- Expected: SPEC-003 § Non-functional: *"Never log tokens, passwords, or message text."* TEST-005 #40.
- Actual: verbose `V Capacitor: callback: …` lines carry every bridge call's data. Seen in both runs:
  - the login request `{"url":"http:\/\/10.0.2.2:8192\/api\/v1\/auth\/login","method":"POST","data":"{\"email\":…,\"password\":…}"` — 3 lines with the password;
  - `"authorization":"Bearer <token>"` on API calls;
  - `"key":"cc.token","value":"<token>"` — 3 lines;
  - `"key":"cc.cache.list.notified.all","value":"{\"items\":[…message text…]"` — 29 lines with message text.
- Frequency: always (runs 1 and 2).
- Evidence: `harness/qa-b/test-005-emu-result.json` #40: the first matching line, with the made-up test password and any
  token **redacted 2026-11-01** under workforce-protocol §14 (the account was throwaway and its DB is gone). Counts above
  are from `logcat -d` on run 1's device. From now on the check reports counts only, never the line.
- Linked case: #40.
- Exposure, stated as fact only: reading logcat needs adb (USB debugging) or a privileged app. The browser console (web
  build) had none of it (run 1 #40, 0 of 107).

## Observations (not ours)
- **The back end does not recover from a dropped database connection** (Team A's core, for the PM to carry on).
  - Twice on 2026-11-02 (~00:13 and ~00:26) the back end, connected to the owner's server, logged
    `PostgresError: Connection closed` (`ERR_POSTGRES_CONNECTION_CLOSED`, 13 lines) within minutes of starting.
  - From then on every write failed: no message was stored and the webhook ingested nothing, until the process was
    restarted. Evidence: `harness/qa-b/stack-backend.connclosed.log`.
  - A fresh start then ran clean (`connclosed: 0`).
  - What closes the connection (the server, the network, idle time) is not known. On a real deployment this would silently
    stop all intake.
  - **Corrected 2026-11-02 (after SA-A's TASK-039 note): the cause may be my own harness, not the server.**
    - **The risk SA-A names was real.** `stack.ts`, `live-stack.ts` and `test-004.ts` shared `corner_chat_test_qa_b`, and each
      ran `DROP DATABASE … WITH (FORCE)` when it started. Starting one while another's back end was up would cut it off with
      exactly this error.
    - **Against it, my timeline:** during both drops only one stack of mine ran. The 00:13 drop came ~15 min into a stack's
      life with no other script started. The 00:21–26 drop came on a fresh stack, after the previous one was stopped and its
      ports were checked closed.
    - **Also seen:** stopping a stack from my session kills it without its cleanup (the DB stayed, `existed true`). So a later
      start always force-dropped it, harmless only while nothing else was connected.
    - So: **cause not established. Only the reconnect gap remains a lead for Team A**, and only if it recurs now that the
      harness is fixed.
  - **Harness fixed 2026-11-02:**
    - every script has its own DB: `…_qa_b_t004`, `…_qa_b_stack`, `…_qa_b_live`;
    - none force-drops a DB that still has connections: it refuses and exits 3.
    - Proven: a second `stack.ts` refused with "10 connection(s) are using corner_chat_test_qa_b_stack" while the first kept
      answering 200 with 0 "Connection closed". `test-004.ts` passes 48/48 on its own name.
- (run 6) Tapping the group summary opens the newest message and clears all of the group's message notifications from the
  shade ("left in shade after: 0"). The others stay in the app's list. Not in any AC; noted for the PM.
- The groups screen shows each group's last-seen time ("1 พ.ย. 20:16"); this is not in REQ-003. Fine by SPEC-003
  ("name, last seen"). Noted only.

## Test data created
| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| users `w-*@qa-b.test`, LINE ids `Uqab5…`, groups `Cqab5…`, messages `QAB5-*` | `corner_chat_qa_tefany` (QA-B's own DB) | left, re-created by the next `stack.ts` run (see TEST-004) |
| processes :8192, :3292, :3992 | local | stopped; ports checked closed |
| APK `com.develyst.cornerchat` (mine) + `/sdcard/qab-ui.xml` | emulator-5554 | uninstalled / removed; font scale back to 1.0, airplane off; emulator stopped (`emu kill`) |
| `dist/`, `android/app/src/main/assets/public` (cap sync), `android/app/build/` | `corner-chat-app` (generated, git-ignored or build output) | **left pointing at `10.0.2.2:8192`**. The FE's next `apk:debug` regenerates them; no source file touched |
| `harness/qa-b/cornerchat-qa-b-8192.apk` | desk harness | kept as the named build under test |
| `corner_chat_test_qa_b` (runs 4–5, focused runs, TEST-004 run 2, AC-7) | owner's Postgres server | **dropped** (checked `now: 0`); created/dropped only through the `postgres` maintenance DB |
| `next dev` on :3193 (TEST-004 AC-7) | local | **was left running about 1 h** (my script's kill missed the child); stopped with `taskkill` at ~22:58, all QA-B ports checked closed |
| APKs `cornerchat-qa-b-def1-{fake,local}.apk` | desk harness | kept as named builds; uninstalled from the emulator; emulator stopped with `emu kill` |

## Verdict
**`TEST_PASSED`** (2026-11-02, run 6), REQ-005 as Team B built it, AC by AC:
- **AC-1:** the PM's comp check; not a QA row.
- **AC-2: PASS.** Notification in ≤ 31 s over 5 runs, also with the app swiped away; a tap opens that message, collapsed or
  expanded, newest or oldest (DEF-2 fixed). Refused permission → the hint.
- **AC-3: PASS.** The tabs and the held reason, web + APK.
- **AC-4: PASS.** Every screen reached by navigation at 360 px, no sideways scroll, every control has a testid. The system
  back key works per D46, overlays included. Font 1.3 still hit-tests.
- **AC-5: PASS.** Airplane mode, cold start offline, back online.
- **AC-6: PASS.** U1/U2 isolation in the app; the account switch on one device raises nothing of U1; Preferences cleared on
  sign-out.

DEF-1 and DEF-2 are both fixed and verified; 0 open defects. **NOT_TESTED, named:**
- the mail parts (the reply screen, the mail detail, `MAIL_LOGIN_FAILED` wording): REQ-002 / B2;
- a real phone and vendor battery managers (Q3);
- #34: N/A since D-B14.

#13, #29, #36 were not re-run here; TEST-003 / TEST-001 cover them.

Earlier verdict (kept): **`TEST_FAILED`** (2026-11-01, run 4–5): **DEF-2 (MAJOR)**. A notification tapped in its collapsed group opens the list,
not the message, in 4 of 5 taps (AC-2). DEF-1 stays fixed (logcat clean on the live API). Every other APK and web row passes.
Open: **Q11** (Android back key on the detail does nothing). Named NOT_TESTED: #5, mail parts (B2), real phone (Q3),
#34 N/A.

Run 3 verdict (kept): **IN_TEST** (2026-11-01, run 3). DEF-1 is verified fixed (run 3 § above), and no defect is open. REQ-005 can be signed
`TEST_PASSED` only after the database re-run: the Bearer header on a live call, #4/#5 tap with one notification in the
shade, #17 system back, #19 on the APK, and Tanya's toast observation. Named NOT_TESTED that stay: mail parts (B2),
#34 N/A, real phone (Q3).

Run 2 verdict (kept): **`TEST_FAILED`** (2026-11-01, run 2): **DEF-1 (MAJOR)**. The debug APK logs the password, the token and message text,
against SPEC-003's explicit rule. Everything else run so far passes: web 39/39, APK 28/34. The other 5 APK misses are my
instrument, named below, not product faults.
Still to run once the DB hold lifts (D43): #4/#5 notification tap with one notification in the shade, #17 system back,
#19 on the APK, and Tanya's toast observation.

Run 1 summary (kept): **IN_TEST.** The web layer is done: 39/39, 0 defects. Not yet run, named:
- **The APK layer on the emulator:** 1–10, 17, 20, 24, 26, 31, 41, plus the APK halves of 11, 16, 19, 22, 32 and 40.
  This needs the PM's emulator slot.
- **Mail parts** (B2): 14 mail rows, 16 reply screen, 21 mail detail, 37 `MAIL_LOGIN_FAILED`.
- #34: no instrument yet.
- Real phone: NOT_TESTED (Q3).
- #13, #29 and #36 were not re-run; other TESTs cover them.

## Evidence (decisive)
- `harness/qa-b/test-005-web-result.json`: 39/39, including `walked` (per screen: reached, sideways scroll, back hit-test, missing testids).
- `harness/qa-b/shots/b09-offline.png`: offline banner + saved list. `b06-detail-held.png` shows the held reason.

## Questions
For the PM. Each has my default — correct only the line that is wrong. Checked: DECISIONS 2026-11-01 lines ·
SYSTEM-FACTS app lines · decisions-for-owner-review D3, D4, D11, D12, D15 — not covered because each is a case the
REQ's wording leaves open.

- **Q1 — after sign-out, does the device still get that user's notifications?** Default: no — sign-out unregisters the
  device; after U1 signs out and U2 signs in, nothing of U1 reaches this phone. A leak here is a BLOCKER (privacy).
  Changes case 25.
- **Q2 — the user refuses notification permission (Android 13+).** Default: the app asks once at first sign-in; if
  refused, the list shows a one-line hint to turn notifications on (PM's wording needed). Changes case 8.
- **Q3 — real phone.** Emulator results do not cover OEM battery-saver killing pushes. Default: emulator only, and
  "real phone" is NOT_TESTED (named) unless the owner lends a device. Not a block.
- **Q4 — offline on a cold start.** Default: the app shows the last list it saved, with the offline wording; if
  nothing was ever saved, the offline wording alone. Changes case 21.
- **Q5 — testability, for the SPEC.** I need: (a) the decision time stored per message (for the 60 s measure),
  (b) the AI stub switch (pass / hold / down) shared with TEST-004, (c) a debug APK that points at the local back end.

> answers `[PM-decided 2026-11-01, under the owner's standing instruction; listed in project-docs/decisions-for-owner-review.md D19–D22]`:
> Q1 default accepted — sign-out unregisters the device; a leak is a BLOCKER. · Q2 default accepted; wording:
> **"ปิดการแจ้งเตือนอยู่ จะไม่เห็นข้อความใหม่จนกว่าจะเปิด · แตะเพื่อเปิด"** (added to REQ-005 wording). · Q3 default accepted —
> emulator only; real phone NOT_TESTED, named. · Q4 default accepted. · Q5 → both SAs as a testability requirement
> (relayed 2026-11-01).

Rev 2 note (Tefany, 2026-11-01): case numbers changed with the rev. Q1 is now case 31, Q2 case 8, Q4 case 26.
No new question: the layer table above is my own call [QA-decided]. It is stricter, because the APK must also pass AC-4
and AC-5.

- **Q11 — the Android back key (2026-11-01, Tefany).** On a message detail opened from the list, the system back key does
  nothing. The app stays in front on the same detail after 1 and 2 presses (`harness/qa-b/emu-focus-result.tapAB.json`,
  `emu-focus-c.log`, `shots/f04-after-back.png`). The on-screen back arrow works, so AC-4's "no dead ends" holds. No REQ or
  SPEC line says what the system back key must do. Default: Android users expect it to go one step back, so it is a
  **defect, MINOR** (a workaround a user finds at once: the arrow). It does not block REQ-005. It goes to SA-B as a TASK
  when you say so. Correct only the line that is wrong.
  Checked: REQ-005 AC-4 · SPEC-003 § Screens and navigation ("Every other screen has a back arrow") · DECISIONS — none
  covers the system back key.
  > answer to Q11 `[PM-decided 2026-11-01, D46]`: the system back key behaves like the on-screen back arrow. On a detail or a
  > sub-screen it goes back one step. On a tab's top screen it leaves the app to the home screen. It is now a REQ-005 requirement
  > (§ Questions), routed to SA-B together with DEF-2. Re-test #17 when Team B says it is done.
