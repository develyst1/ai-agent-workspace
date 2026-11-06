# TEST-006: SIT release pass, round 1 (the first deploy)
- Status: OPEN (2026-11-02, PM) — Tanya (QA-A) leads and owns the verdict; Tefany (QA-B) runs the APK + LINE rows
- Covers: REQ-001…005, as deployed. It is a release gate, not a re-test of every AC.
- Source: Otto's root file `REQUEST-otto-to-porter-2026-11-02-corner-chat-deploy-plan.md` § "SIT is up" (2026-11-02 23:13).
  Owner, via Otto: *"เสร็จแล้วฝากส่งรายละเอียดให้ทีมเทสต่อด้วยนะ"*

## What is deployed
| What | Where | Build |
|---|---|---|
| API | `https://cornerchat-api-sit.develyst.online/api/v1` (public) | back `sit` = `4323ee1` |
| Admin web | `https://cornerchat-sit.develyst.online` (Cloudflare Access is being added; owner only) | front `sit` = `94f3b1c` |
| App | TASK-041 release APK, SHA-256 `9816a1b5f9986b52d22f586591266f3b44cebef185f449d3b68898abf8b96e3b` (`corner-chat-app` → `android/app/build/outputs/apk/release/`) | signed, SIT API |

## Ground rules (read before the first request)
1. **The SIT database is the desk's database.** SIT uses the same `corner_chat` DB as the local runs (owner: *"ใช้ร่วมกัน"*).
   - Every user you create starts with `qa-sit-`, and you record each one here.
   - Never change or delete the owner account or any row you did not create.
   - Leave nothing you can't name: list what stays under § Footprint.
2. **No local back may poll mail against this DB.** Any local back you start runs with `MAIL_POLL_SECONDS=0`.
3. **Mail is OFF on SIT** (`MAIL_POLL_SECONDS=0`). The mail rows are NOT_TESTED until Otto says the Gmail forward is connected.
4. **LINE:** the webhook still points away from SIT, because the owner switches it in the LINE console. LINE intake rows are
   NOT_TESTED until then. The PM will tell you when it is switched.
5. **Admin web:** it sits behind Access and a headless browser cannot pass it. Test the admin **API** with the owner login from
   the team's `.env` (never print it). The UI rows wait for the QA service token Otto is asking the owner for.
6. Secrets: never print a password, token or key into a log, this file or chat.

## Rows
| # | Check | Who | Result |
|---|---|---|---|
| 1 | `GET /health` → ok, db true; plain HTTP is refused or redirected; TLS cert is valid | Tanya | **PASS** — 200 `{"ok":true,"db":true}` · `http://` → 301 to `https://…/api/v1/health` · certificate trusted (Google Trust Services, CN `develyst.online`), 67 days left |
| 2 | Admin API: the owner login works; create a user `qa-sit-u1`, then `qa-sit-u2`; the user list shows them | Tanya | **PASS** — owner 200 `role owner` (password read in-process, never printed) · both users 201 `role user` · both listed |
| 3 | User API: `qa-sit-u1` signs in and sign-out revokes the token; a wrong password is refused; U1 cannot read U2's data (REQ-001 AC-3) | Tanya | **PASS** — sign-in 200 · wrong password 401 `INVALID_CREDENTIALS` · U1 sees its own bar 70 and none of U2's rule; deleting U2's rule by id → 404, U2's bar 42 and rule unchanged · U1 on `/admin/users` → 403 · logout 204, then `/me` → 401 |
| 4 | AI settings / conditions: U1 adds a condition and sets a bar; they read back the same; the AI gateway answers from SIT (one filter call through an endpoint that triggers it, if one exists without mail/LINE) | Tanya | **PASS** (filter call NOT_TESTED) — bar 75, Thai sentences and the rule `keyword:โปรโมชั่น:never` read back exactly · AI settings deepseek-flash / deepseek-v4-pro · SIT reaches the gateway: `GET /admin/ai-models` 200 with openai, gemini, xai, deepseek. **No endpoint runs the filter without mail or LINE intake**, so a full filter call waits for row 9 or 10 |
| 5 | CORS: the API answers the admin origin and refuses an unknown origin | Tanya | **PASS** — preflight from `https://cornerchat-sit.develyst.online` → 204 with that origin allowed · from `https://evil.example.test` → no `Access-Control-Allow-Origin` at all |
| 6 | APK: install on `cc_phone_360` (uninstall the debug build first); sign in as `qa-sit-u1`; the lists, the menu and every screen open with no error; sign out | Tefany | **PASS** (2026-11-02 ~23:40). Release APK sha256 `9816a1b5…` = § What is deployed; installed on `emulator-5554` (no debug build was on it). Signed in as QA-B's own `qa-sit-b1-…` (not `qa-sit-u1`: its password is Tanya's). Both tabs, the 3 chips, the menu, Conditions, Channels, Zimbra and LINE (shows a 6-digit code) open with **no error state** against the SIT API. Names/groups are not reachable for an unlinked user (by design). Sign-out → `/signin`, the watcher notification removed. Shots `harness/qa-b/shots/s03…s08` |
| 7 | APK: no cleartext, and no password, token or message text in logcat during rows 6 and 8 | Tefany | **PASS.** Cleartext: the APK's network-security config is `base-config cleartextTrafficPermitted=false` with no domain exceptions; the only API base in the bundle is `https://cornerchat-api-sit.develyst.online/api/v1`; 0 cleartext refusals and 0 `http://cornerchat` at runtime. Logcat over rows 6 + 8 (4,243 lines): password 0 · e-mail 0 · `Bearer` 0 · `cc.token` 0 · Capacitor verbose 0 (compared in-process, counts only). **See Q2: WebView debugging is ON in this release APK** |
| 8 | APK: the background watcher runs (the permanent notification shows); airplane mode shows the offline wording, then it recovers | Tefany | **PASS.** After sign-in a posted "corner-chat กำลังรอข้อความใหม่" record (not just the channel name). Airplane mode → "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด" + the last list (`s07-airplane.png`). Off → banner gone, list loads from SIT, no error |
| 9 | LINE intake + 1-on-1 push on SIT | Tefany | **PASS** (2026-11-03 00:34–00:40, real LINE, test OA, webhook on SIT). QA-B's SIT user `qa-sit-b1-…` (bar 0: row 9 tests intake + push, not the AI) · the SIT webhook refuses an unsigned call (401). **Link:** code `091789` → OA "เชื่อม LINE แล้ว", linked 00:34:55 (the first code expired unused) · **group:** learned 00:35 from the owner's own message · **intake:** M's real mention "QS2" taken in 00:37 (`mention`, judged by SIT's real AI, notified) · **push:** one 1-on-1 push from the OA at 00:36 for QS2 only (owner's screenshot, § Row 9 below) · **drop:** M's plain "QS3" (00:37) stored nothing, no push. Helper `harness/qa-b/sit-line.ts` (no LINE ids printed) |
| 10 | Mail intake on SIT (entronica → Gmail forward, original sender shown) | Tanya | **PASS for corner-chat's part · the entronica → Gmail forward is BLOCKED outside corner-chat** (Tanya, 2026-11-03). **Gmail → SIT poller → AI → app: PASS.** My own read-only check (`test-006-row10.ts qa7k` → `test-006-row10-qa7k.json`): the mail is stored for user `dong` with the sender = his **personal** address (in-process compare: personal true · work false · a Gmail false), sender name kept · subject and Thai exact, no U+FFFD · `recipient_kind` `to` · **judged by SIT's real AI** (deepseek-flash / deepseek-v4-pro, score 5 vs bar 70 → held, summary "ข้อความทดสอบภาษาไทย qa7k"). It was stored 394 s after its Date header, because Gmail filed it as spam until he moved it to the Inbox. The owner's app on his real phone shows the same message under ไม่ได้แจ้ง with sender "Develyst Organization" (PM-read screenshots, § Row 10: second try). **The forward leg is not testable now:** entronica's outbound relay rejects the forward as spam (`550 High probability of spam`, § Row 10: screenshots). That is external, not a corner-chat defect, and corner-chat never received those mails. ~~My watcher on `r10t` saw nothing because his mails reused the old subject `… qa7k`.~~ **Corrected (Tanya, 2026-11-03):**
the `r10t` watcher **crashed** (`PostgresError: Connection closed`, `ERR_POSTGRES_CONNECTION_CLOSED`; the remote DB dropped its
long-lived connection) at an unknown time, so it proves nothing either way. His mails did reuse `… qa7k`, so `r10t` could not
have matched them anyway. The evidence for this row is the separate `qa7k` read above. A future watcher must reconnect per poll. Earlier text: NOT_TESTED — the SIT poller is on (Otto, 2026-11-03 ~01:05); it waits for the owner to connect his Gmail in the app. **Pre-check 2026-11-03 (Tanya, read-only, masked):** `mail_accounts` in `corner_chat` holds **0 rows**. So no old entronica mailbox is being polled by SIT, and there is nothing to disconnect. Old mailbox rows would be other people's in any case (PROTOCOL SIT row: never others' rows), so a disconnect would not have been QA's to do. |
| 11 | Admin web UI walk | Tanya | **PASS** (2026-11-02 23:31, `harness/qa-a/admin-web-sit.mjs` → 12/12, headless Chrome 1280×800). Access: **without** the token → 302 to the Access login · **with** the QA service token (headers added only for the admin-web host, values never printed) → 200. Sign-in title · wrong password "อีเมลหรือรหัสผ่านไม่ถูกต้อง" · owner signs in → users page (web → SIT API cross-origin works) · the LINE push count panel shows · add `qa-sit-w-…` → listed, it signs in · duplicate (upper case) "อีเมลนี้มีผู้ใช้แล้ว" · reset → "เปลี่ยนรหัสผ่านแล้ว", old 401 / new 200 · AI settings page opens and loads both layers + deepseek (**opened only, never saved**) · disable → that user 403 · sign out · no console error besides the walk's own 401 and 409. Run 1 was 10/12 — both my checks: it read the AI page while still กำลังโหลด…, and counted the deliberate 401/409; fixed and re-run. Shots `shots/sit-w01…w05` |

The emulator is shared: Tefany takes it for rows 6–8 and tells the PM when it is free.

## Footprint
(QA lists every row/user left behind, and anything cleaned up.)
- Tanya (QA-A), 2026-11-02 23:17 (+07), rows 1–5 (`tests/harness/qa-a/test-006-sit.ts` → `test-006-sit-result.json`, 17/17):
  users **`qa-sit-u1`** (id `ccdccbd5-cfc1-487e-be6c-c533997c75f3`) and **`qa-sit-u2`** (id `95df2954-0224-482a-a9c0-66c799abbe5b`),
  emails `qa-sit-u<n>-mvz…@qa-a.test`. **End state: both DISABLED** by the owner API at the end of the run, because the API has
  no delete. Their rows stay in `corner_chat`: one `user_conditions` row each (U1 bar 75, U2 bar 42), two `rules` (U1
  `keyword:โปรโมชั่น:never`, U2 `keyword:qa-sit-u2-…:never`), their `sessions` (U1's revoked by logout), a few `login_attempts`
  rows for U1 (one wrong password, count reset by the right one). Nothing else was written; the owner account was only signed into.
- Tanya (QA-A), 2026-11-02 23:30–23:31, row 11 (two runs): users **`qa-sit-w mvzh60p8`** and **`qa-sit-w mvzh6wj9`** (emails
  `qa-sit-w-<tag>@qa-a.test`), created through the admin web. **End state: both DISABLED through the web** at the end of each
  run (each then signs in → 403). Each also has a password reset and a few `login_attempts`/`sessions` rows. AI settings were opened, never saved.
- Tefany (QA-B), 2026-11-02: SIT user **`qa-sit-b1-mvzgof6t@qa-b.test`** (id `8ace6685…`, name "QA-B SIT (Tefany)"). Created via the SIT
  admin API (`tests/harness/qa-b/sit-user.ts`) for rows 6–8, because `qa-sit-u1`'s password is Tanya's. Its password is only in
  my scratchpad. **Final end state (2026-11-03 ~00:42): the owner's LINE UN-LINKED from it** (`DELETE /channels/line` 204:
  linked false, groups 0, so his LINE account is free to link to a real user) **and the user DISABLED** (200; the API has no
  delete). Its rows stay, **counted read-only in `corner_chat` 2026-11-03 ~00:45**:
  - `users.status` disabled;
  - `messages` 1 (QS2) · `decisions` 1 · `ai_calls` 2 · `line_pushes` 1;
  - `line_link_codes` 5 (rows 6–8 screen code + 2 row-9 codes + earlier screen visits; 1 used);
  - `line_names` 1 · `line_links` 0 · `line_user_groups` 0 · `sessions` 0 (sign-out deletes them);
  - its `user_conditions` row (bar 0). Earlier note: left ACTIVE, for row 9 (a LINE link needs a live user). It gets disabled after row 9, or now
  if the PM says row 9 uses another user. Rows it wrote in `corner_chat`: its `user_conditions` default row (if the API makes
  one), its `sessions` (the last one revoked by sign-out), 1 `line_link_codes` row (the LINE screen issued a code, unused,
  expires by itself). Nothing else.
- The release APK stays installed on `cc_phone_360` for row 9. The emulator is stopped (`emu kill`) and free.
- Runs: `harness/qa-b/sit-emu.mjs` → `sit-emu-result.json`, 8/8 (run 1 `…run1.json`: 7/8, my own false positive on the
  notification-channel name, fixed).

## Verdict
(Tanya: TEST_PASSED for what was run / TEST_FAILED with defects. The NOT_TESTED rows are named; they do not block this round.)
**`TEST_PASSED` for what was run — round 1** (Tanya, 2026-11-02 ~23:50).
- Rows 1–5 **PASS** (Tanya, 17/17). The build is back `sit` = `4323ee1` per § What is deployed; I did not check it, because the
  API exposes no version.
- Rows 6–8 **PASS** (Tefany, 8/8, release APK sha256 matching § What is deployed). I read her row results and evidence pointers;
  her scripts and screenshots are under `harness/qa-b/`.
- Row 11 **PASS** (Tanya, 12/12, 2026-11-02 23:31): the admin web behind Access, with the QA service token.
- Row 9 **PASS** (Tefany, 2026-11-03 00:34–00:40, real LINE with the test OA, the owner confirmed the push). I read her row and
  its evidence pointers. Her run also closes **row 4's full AI filter call**: the mention "QS2" was taken in and *"judged by SIT's
  real AI"* (her words), then notified. That is her evidence, not my own run.
- **DEF-1 (MINOR) is CLOSED** as fixed in code (TASK-042; Tefany's re-test: static PASS, rows 6–8 8/8 on APK `3edb05dc…`).
  The original symptom is **unproven** on a user-build phone, because the emulator's `userdebug` image opens the socket for every
  app (§ Defects). 0 open defects.
- Row 10 **PASS for corner-chat's part** (Tanya, 2026-11-03): Gmail → SIT poller → real AI → his app, with the original sender
  kept. My own read-only check backs it, alongside his screenshots. This also gives me first-hand evidence of the SIT AI filter call.
- **NOT_TESTED, named — none is a corner-chat defect, and none blocks this round:**
  - the entronica → Gmail forward: **blocked outside corner-chat**, because entronica's outbound relay rejects it as spam
    (`550 High probability of spam`). Entronica IT, or the owner, must settle it; then this one leg is re-run;
  - DEF-1 on a `user`-build phone: optional, the owner's call.
- **Final for round 1 (Tanya, 2026-11-03): `TEST_PASSED` — rows 1–11 pass for everything corner-chat owns; 0 open defects.**
- **Observation for the PM (not ours, from the owner's screenshots):** while the forward is on, **every outside sender to the
  work mail gets a "delivery failed" bounce**, even though their mail arrived. The PM has already recommended the owner turn the
  forward off.

## Defects
### DEF-1 — the release APK exposes WebView debugging — MINOR (security hardening) — **CLOSED 2026-11-03, fixed in code; the original symptom was never proven on a user build**
- Closure (Tanya, on Tefany's re-test after TASK-042, § Questions "Q2 re-test"; the PM's call to close, inbox 2026-11-03):
  - APK `3edb05dc…`: the bundled config sets `webContentsDebuggingEnabled:false` (static **PASS**, checked by Tefany herself).
  - Rows 6–8 regression on it: **8/8**.
  - On a device: **NOT_TESTED**. `cc_phone_360` is a `userdebug` image, which opens the WebView debug socket for every app. So the
    socket seen in Q2 does not prove the old release APK exposed debugging on a normal phone; the finding may be an artifact of
    the instrument. Settling it needs a `user`-build phone (the owner's real phone, only with his go through the PM) or a `user`
    emulator image. That is optional, and the owner's call.
- Original report (kept):
- Found by Tefany (QA-B), rows 6–8. Build: TASK-041 release APK, sha256 `9816a1b5…`, on `emulator-5554`.
- Repro: install the release APK, start it, then `adb shell cat /proc/net/unix`. It lists `@webview_devtools_remote_<app pid>`, and
  attaching over the Chrome DevTools protocol runs JavaScript in the signed-in app page.
- Expected: a release build does not expose WebView debugging. This is the PM's ruling (Q2); no REQ or SPEC line covered it before.
- Actual: exposed. Anyone with USB-debugging access to the phone can act inside the app as the signed-in user. The APK is not
  `debuggable`, and `run-as` is refused.
- Evidence: Q2 below; `harness/qa-b/` (Tefany's run). Frequency: always. (No proposed fix.)

## Questions
- **Q1 — SIT is not yet in `PROTOCOL.md` → Environments (Tanya, 2026-11-02). Blocks every SIT row, so nothing has been sent to SIT.**
  `QA.md` Hard boundaries: *"Touch any environment not listed for you in PROTOCOL.md's Environments table"* is a 🚫.
  `PROTOCOL.md`: *"When an environment appears later, it is recorded in `SYSTEM-FACTS.md` and here **before** anyone touches it."*
  The table today has Local, Real systems and Production only. SYSTEM-FACTS records SIT's names and mail/LINE setup (lines
  229–233), but not who may do what there. **Default: one row in PROTOCOL's table (and one line in SYSTEM-FACTS), in this
  test's own ground rules:**
  `SIT (cornerchat-api-sit / cornerchat-sit .develyst.online; DB = the shared corner_chat) | the team, QA leading | read
  anything · write only rows QA creates, users prefixed qa-sit-, recorded in TEST-006 · never the owner account or others'
  rows · no restart, redeploy or config (Otto's) · mail and LINE as TEST-006 rules 3–4`.
  Checked: PROTOCOL Environments · QA.md card · SYSTEM-FACTS 229–233 · TEST-006 ground rules — the rules exist, the
  table row does not. My scripts for rows 1–5 are ready, so I start within minutes of the row going in.
  > answer `[PM, 2026-11-02 ~23:30]`: **added as written.** The SIT row is in `PROTOCOL.md` → Environments and the line is in `SYSTEM-FACTS.md`. Q1 is closed: start rows 1–5.
- **Q2 — WebView debugging is ON in the release APK (Tefany, 2026-11-02; does not block rows 6–8).** With the TASK-041 release
  APK running on `cc_phone_360`, the app's own process (pid = the app) opens `@webview_devtools_remote_<pid>`. I attached to
  it with the plain Chrome DevTools protocol over adb and could run JavaScript in the signed-in app page; rows 6–8 were driven
  that way. On a user's phone this means anyone with USB-debugging access can read and act inside the app as the signed-in
  user. The APK itself is not `debuggable`, and `run-as` is refused. No REQ/SPEC line covers it.
  Default: **a defect, MINOR (security hardening)**; the release build should not expose WebView debugging. It goes to SA-B
  as a TASK when you say so, and it does not block this round. Correct only the line that is wrong.
  Checked: SPEC-003 § Non-functional (logs only) · TASK-041 · DECISIONS — none covers WebView debugging.
  > answer `[PM, 2026-11-02 ~23:45]`: **accepted as written.** It is a MINOR security-hardening defect and does not block this round. I am routing it to SA-B as REQ-005 content: a release APK must not expose WebView debugging, while debug builds may. How to fix it is the SA's call. QA re-tests it with the next release APK.

## Update 2026-11-02 ~23:58 (PM): row 11 is unblocked
Otto (root `REQUEST-otto-to-porter-2026-11-02-corner-chat-deploy-plan.md` § SIT is up, 23:55; owner: *"ทำเลย"*): QA may pass Access with the
service token `corner-chat-qa`. Send the headers `CF-Access-Client-Id` and `CF-Access-Client-Secret` on every request (Playwright `extraHTTPHeaders`).
The values are in the file named in `machine.local.md`, row "corner-chat QA Access token". **Never print, log or commit them.** Headless only.
- **Q2 re-test after TASK-042 (Tefany, 2026-11-02, new release APK sha256 `3edb05dc924202b00ba061da60a953f2196a43088ba59e8c2d6b56f27ade7552`).**
  - **Static: PASS.** The APK's bundled `assets/capacitor.config.json` holds `"android":{"webContentsDebuggingEnabled":false}`,
    `loggingBehavior: none`, and the only API base is the https SIT one (checked myself, not from the review).
  - **On the device: NOT_TESTED, and my original Q2 evidence was weaker than I wrote.** `cc_phone_360` is a **`userdebug`**
    image (`ro.debuggable=1`, `ro.build.type=userdebug`, checked). With the new APK the app's pid still opens
    `webview_devtools_remote_<pid>`, even though the app now says false. On such an image the socket does **not** show
    that the app enabled debugging. So Q2's "WebView debugging is ON in the release APK" was seen through an instrument that
    opens it for every app, and the old APK may never have exposed it on a normal phone. TASK-042's explicit `false` is
    still correct hardening. Settling it needs a **user-build phone** (the owner's real phone, only with his go through the PM)
    or a `user` emulator image.
  - **Regression on the new APK: rows 6–8 PASS again, 8/8** (`harness/qa-b/sit-emu.mjs` → `sit-emu-result.json`; the old
    APK's run is kept as `sit-emu-result.9816a1b5.json`). Logcat: 0 password / e-mail / token / bridge lines of 7,301.
  - Footprint: the new APK replaced the old one on `cc_phone_360` (uninstall + install); the emulator is stopped and free; QA-B's
    SIT user is still active for row 9.

## Update 2026-11-03 ~00:15 (PM): row 9 is unblocked
Owner: *"เปลี่ยนเว็บฮุกไลน์ฺแล้ว"*. The LINE webhook of the test OA LifeStyle-Shop now points at SIT. Tefany runs row 9 with her `qa-sit-b1` user. Each live step that needs the owner's phone or group goes to the PM as numbered copy-paste steps; the PM walks him through them.

## Row 9: the owner's screenshots, 2026-11-03 ~00:40 (the PM read them; owner's chat, not saved to disk)
- **OA 1-on-1:**
  - `091789` sent at 00:34, then `เชื่อม LINE แล้ว` at 00:34.
  - **One push at 00:36:** `[LINE · support08 Dong, Dong_08] ขอให้ช่วยตรวจงาน SIT (QS2)` / `@Dong_08 QS2 ช่วยดูงาน sit`.
  - No later push.
  - An untagged `waassup` at 00:27, before linking, got no reply.
- **Group** (support08 Dong, Dong_08, LifeStyle-Shop):
  - The owner sent `QS1 สวัสดี SIT` at 00:35.
  - M sent an untagged `QS2 ช่วยดูงาน sit`, then a tagged `@Dong_08 QS2 ช่วยดูงาน sit` (blue), both at 00:36.
  - M sent an untagged `QS3 ใครกินข้าวยัง` at 00:37.
  - An earlier untagged `holle` (00:26) came before the link.
- **Answers to Tefany:**
  - (a) Yes: exactly one push, for the tagged QS2. The untagged QS2 got none.
  - (b) Yes: M sent QS3 at 00:37.
  - (c) No push for QS3 when the screenshot was taken.

## Update 2026-11-03 ~01:20 (PM): row 10 is unblocked, and the app is on a real phone
- Otto turned the SIT mail poller on at ~01:05 (Gmail, every 60 s).
- The owner created SIT user `dong` (`dong0364@gmail.com`, his private Gmail) in the admin web at 00:53.
- He installed the release APK `3edb05dc…` on **his own Android phone** and signed in. Channels → อีเมล Zimbra shows **"เชื่อมแล้ว dong0364@gmail.com"** (his screenshot).
- The entronica work mailbox forwards a copy to that Gmail.
- **Row 10:** a mail to the entronica address should appear in user `dong`'s app with the original sender.
  - Sending a mail is a send on a real system, so any send the owner must do comes to the PM as numbered steps.
  - User `dong` is the owner's, not QA's: read only, and leave it in place.
- A real phone now exists. The owner may let it be used later for the optional on-device checks (DEF-1, battery); not now.

## Row 10 — owner steps (Tanya, 2026-11-03 ~01:03 — first written as ~02:03, a slip of mine; code `r10t`; the PM relays them in Thai)
**Why:** to see one real mail go entronica → his Gmail forward → SIT → his app, with the **original** sender kept.
**My side, already running:** `harness/qa-a/test-006-row10.ts r10t` watches `corner_chat` read-only for 60 minutes (until
~02:03). It compares the sender with his personal address in-process (no address printed). Nothing is written to user `dong`.
1. From your **personal** mail (the same one as the TEST-002 window), send **one** mail to your **work** mail (entronica):
   subject **`[corner-chat TEST-006] row10 r10t`**, body two Thai lines, e.g. "ทดสอบเมลบน SIT / ผู้ส่งเดิมต้องแสดง".
2. Wait about **3 minutes**: the forward to Gmail, then SIT's 60 s poll, then the AI filter.
3. Open corner-chat on your phone → **ข้อความ**. Look in **แจ้งแล้ว**, and if it is not there, **ไม่ได้แจ้ง** (the AI decides which).
4. Look at it:
   - ✅ the sender shown is **your personal mail** (its name or address), **not** the work address and **not** the Gmail;
   - ✅ the subject and the Thai lines read correctly.
   - ❌ the sender is the work address or the Gmail, the mail is missing after 5 minutes, or the Thai is garbled.
5. Tell the PM ✅/❌ for each point, plus one screenshot of the message (the list row or the opened message).
6. **Cleanup:** nothing. The mail stays in your boxes and in your corner-chat; it is yours.

## Row 10: the owner's screenshots, 2026-11-03 ~01:10 (the PM read them)
- **Zimbra:** the mail from Hotmail reached the entronica inbox at 01:07. The subject reused the old `[corner-chat TEST-002] ทดสอบภาษาไทย qa7k`, not `r10t`. So **delivery to the work mail works**.
- **Hotmail:** a bounce from `MAILER-DAEMON@mail.entronica.in.th` came back to the sender.
  - Diagnostic: `Remote server returned '554 5.0.0 <cloud-mta.thaidatahosting.com #5.0.0 smtp; 550 High probability of spam>'`.
  - Its headers show entronica relaying `for <dong0364@gmail.com>`. **The forward copy to Gmail is rejected by entronica's own outbound relay (thaidatahosting) as spam.**
- An earlier `test1` mail bounced the same way.
- Inference, PM: the forward rewrite breaks the original sender's anti-spam checks. This is not established; only entronica IT can say.
- **Consequence:** nothing reaches Gmail, so nothing reaches SIT. And **every outside sender to the work mail gets a "delivery failed" bounce** while the forward is on, even though their mail did arrive.
- **Row 10 = BLOCKED (external: entronica's outbound relay).** It is not a corner-chat defect: our side never received the mail.
- The PM recommends that the owner turn the forward off now.

## Row 10: the owner's second try, 2026-11-03 ~01:15 (the PM read his screenshots)
- The owner sent mail **directly** from Hotmail to `dong0364@gmail.com`, so the entronica forward was not involved. Gmail first filed it in spam/trash. The poller reads INBOX only (`poller.ts:71`, SPEC-001 §6), so nothing showed in the app until he moved it to the Inbox.
- **Gmail Inbox:** `Develyst Organizati…` with `[corner-chat TEST-006] ทดสอบภาษาไทย qa7k`, at 01:08.
- **The app on his real phone, ไม่ได้แจ้ง tab:**
  - It shows the chip `อีเมล`, the sender **Develyst Organization** (the Hotmail sender's name, not the work address or the Gmail), and the time 3 พ.ย. 01:08.
  - The summary is `ข้อความทดสอบภาษาไทย qa7k` and the subject `[corner-chat TEST-002] ทดสอบภาษาไทย qa7k`. The Thai reads correctly.
  - The AI held it (a test text). That is a filter decision, not a defect.
- **So the path Gmail → SIT poller → AI → app works, with the original sender kept.** What is NOT proven is the path from entronica to Gmail: entronica's outbound relay rejects the forward as spam (the bounce above).
