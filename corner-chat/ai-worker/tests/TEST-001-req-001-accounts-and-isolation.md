# TEST-001: Only owner-added people sign in, and each sees only their own data
- Team: A · TASKs: TASK-001, TASK-002, TASK-005 (isolation), TASK-008 · SPEC-001
- Source REQ: REQ-001 (ACs tested: AC-1 … AC-6, plus requirement 4 and 6)
- Status: **TEST_PASSED** (2026-11-01, Team A scope: API + admin web) — app surface `NOT_TESTED`, named below
- Build under test: `corner-chat-back` `main` HEAD `d1152f1` + uncommitted working tree, fingerprint **`8ed1ce4b46a72309`**
  (52 files in `src/` + `migrations/`, sha256 by `harness/qa-a/fingerprint.ts`; the same before and after the run) ·
  `corner-chat-front` `main` `0f8c0bc` + working tree, `src/` fingerprint **`bded52de653410f4`** (same before/after) ·
  `corner-chat-app`: not built (REQ-005 TASK-014…018 TODO)
- Surfaces: local only · QA's own back end 127.0.0.1:8191 on QA's own database `corner_chat_qa_tanya` (team cluster
  :5433) · admin web `next dev` on localhost:3191 → that back end · headless Chrome 1280×800 · direct API calls
- Tested: 2026-11-01 by Tanya (16:04–16:18 +07)

## Scope
- In: owner-only admin web, add / disable / enable / reset, app sign-in, one user never reaching another's data
  (app **and** API), sign-in throttling, "stored before anything else" (requirement 6).
- Risk call: **AC-3 (isolation) is tested hardest** — personal data across users is the highest-impact defect here.
  Every resource type the API exposes gets a cross-user case, not only messages.
- Not in this round: open sign-up, self-reset, roles beyond owner/user (REQ Out of Scope). iOS (out of round 1).
- Boundary of the verdict: the files named by the TASKs Team A is given for REQ-001. Anything else → Observations.

## Instrument limits
- Direct API calls (curl / harness script): prove the server's refusals. Hiding a button in the UI proves nothing.
- Headless browser on the admin web: proves the owner's flows and wording; desktop width only — the admin web is
  the owner's page, phone widths are not a stated need (`[QA-decided]`, cheap to add).
- Android emulator: proves the app's sign-in and lists; not a real phone's push (that is REQ-005).
- Until the app exists, AC-1 / AC-3 / AC-4 can be run at API level only; the app half stays `NOT_TESTED` until then.

## Test data (all local)
- Owner account (however the SPEC seeds it). Users U1, U2 with made-up names and `@example.test` emails; each with at
  least one message, one condition, one connected channel — created through the product, not by hand-written SQL
  where the product can create it.

## Cases
| # | Case (from AC) | Type | Surface | Steps | Expected | Actual | Evidence | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | AC-1 owner adds U1 → U1 signs in | happy | admin web + app | owner signs in, "เพิ่มผู้ใช้", name/email/password; U1 signs in on the app | U1 is in; the app title reads "เข้าสู่ระบบ corner-chat" before sign-in | | | |
| 2 | AC-1 add with an email already used | negative | admin web | add U1's email again | refused, visible message, no second account | | | |
| 3 | AC-1 add with empty / malformed email, empty password | negative | admin web + API | submit each | refused at the server (API call too), no account | | | |
| 4 | AC-1 wrong email or password | negative | app | wrong password; unknown email | both show exactly "อีเมลหรือรหัสผ่านไม่ถูกต้อง" (same text — no hint which one was wrong) | | | |
| 5 | AC-2 user account on the admin web | permission | admin web + API | U1 signs in to admin web; U1's token calls each admin API (add, disable, reset, list) | all refused at the server | | | |
| 6 | AC-2 no token at all | permission | API | call each admin and user API without a token | all refused | | | |
| 7 | AC-3 U1 lists | permission | app | U1 signed in: messages, conditions, channels lists | none of U2's items | | | |
| 8 | AC-3 U1 token + U2 ids | permission | API | for **every** resource type (message, condition/rule, channel, AI decision, correction, bar): read, change, delete with U2's id | "not found / not allowed"; U2's data unchanged afterwards | | | |
| 9 | AC-3 U1 creates with U2 as owner | permission | API | create a condition/rule with a `user_id` (or similar) field set to U2 | stored as U1's or refused — never U2's | | | |
| 10 | AC-4 disabled U1 signs in | state | app | owner "ปิดใช้งาน" U1; U1 signs in | refused with "บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล" | | | |
| 11 | AC-4 disabled U1, already signed in | state | app + API | U1 signed in; owner disables; U1 uses the app / its token | see Q1 — default: refused at once | | | |
| 12 | AC-4 message for disabled U1 | state | back end | disable U1; a mail arrives in U1's connected test mailbox | no notification; nothing new taken in (no new row) — requirement 4 | | | |
| 13 | AC-4 enable again | state | admin web + app | owner "เปิดใช้งาน" U1 | U1 signs in again; whether mail that arrived while disabled is taken in is reported, not judged (REQ silent) | | | |
| 14 | AC-5 reset password | state | admin web + app | owner "ตั้งรหัสผ่านใหม่" for U1; old password; new password | old refused, new works | | | |
| 15 | AC-5 sign-in made before the reset | state | app + API | as #11, but reset instead of disable | see Q1 | | | |
| 16 | AC-6 5 wrong in a row | boundary | app + API | 4 wrong → 5th wrong → right | 4 wrong: normal wording · after 5: "ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่" · right password after the wait works (exact numbers: Q2) | | | |
| 17 | AC-6 counter resets | boundary | API | 4 wrong → right → 4 wrong | no block (4 + 4 not in a row) | | | |
| 18 | AC-6 one user's block does not block another | negative | API | block U1; U2 signs in | U2 in | | | |
| 19 | Req. 6 stored before anything else | state | back end | stop the back end right after intake, before the filter runs (seam: Q3); restart | the message is there and is then filtered once | | | |
| 20 | Req. 5 nothing auto-deleted | regression | back end | (long-run: re-check the oldest test rows at each later round) | still there | | | |
| 21 | Secrets | negative | API + logs | sign-in responses, admin user list, back-end logs | no password or hash ever returned or logged | | | |

## Run 1 — 2026-11-01 — results per case
How: `harness/qa-a/backend.ts` starts the back end on QA's own DB with mail/LINE/FCM pointed nowhere real ·
`harness/qa-a/test-001.ts` (API, 67 checks) · `harness/qa-a/admin-web.mjs` (headless Chrome, 12 checks) ·
`harness/qa-a/lockout-wait.ts` (#16 tail) · `harness/qa-a/case19.ts` (#19). Each check's expected/actual is in the
result JSON next to the script. All three suites re-run on build `8ed1ce4b…`: **67/67 · 12/12 · 43/43 (TEST-003)**.

| # | Result | Actual (short) — evidence |
|---|---|---|
| 1 | **PASS** (web + API) · app half NOT_TESTED | owner signs in on the web, adds a user through "เพิ่มผู้ใช้", row shows ใช้งานอยู่; that user signs in (API 200); email trimmed + case-insensitive — `test-001-result.json`, `admin-web-result.json`, `shots/w02-add-modal.png` |
| 2 | **PASS** | same email in upper case: API 409 `EMAIL_TAKEN`, web shows "อีเมลนี้มีผู้ใช้แล้ว"; still one account — `shots/w03-duplicate.png` |
| 3 | **PASS** | empty / malformed email, empty / 7-char password, empty name → 400 `VALIDATION` each; 0 rows left |
| 4 | **PASS** (web + API) · app half NOT_TESTED | wrong password and unknown email → same 401 `INVALID_CREDENTIALS`; web shows "อีเมลหรือรหัสผ่านไม่ถูกต้อง" — `shots/w01-wrong-password.png` |
| 5 | **PASS** | user token on all 9 `/admin/*` calls → 403 `FORBIDDEN`; on the web: "หน้านี้สำหรับผู้ดูแลเท่านั้น", no usable token kept, `/users` sends back to sign-in — `shots/w05-user-refused.png`, `w06-user-direct-users.png` |
| 6 | **PASS** | no token on 6 routes + a made-up token → 401 `UNAUTHENTICATED` |
| 7 | **PASS** (API) · app half NOT_TESTED | U1's notified + held lists, conditions, channels hold nothing of U2's |
| 8 | **PASS** | U1's token with U2's message (read, correction ×2, reply), U2's rule (delete) → 404 `NOT_FOUND`, same as a non-existent id; malformed id → 404; deleting U2's device token leaves it; U2's rule, bar 42, 0 corrections, 0 replies unchanged |
| 9 | **PASS** | rule and settings with `userId`/`user_id` = U2 in the body → stored as U1's; U2's bar stays 42 |
| 10 | **PASS** (web + API) · app wording NOT_TESTED | web asks "ปิดใช้งาน … ไหม", row shows ปิดใช้งาน; sign-in → 403 `ACCOUNT_DISABLED`; with a wrong password → 401 (state not revealed); owner cannot disable the owner (400) — `shots/w04-disabled.png` |
| 11 | **PASS** | U1's live sign-in → 401 at once after the disable (D23) |
| 12 | **PASS** at the ingest seam · mail poller NOT_TESTED | `ingestMessage` for a disabled user → `IngestRefused`, row count unchanged (so nothing to notify). The mail poller's skip is REQ-002 (TASK-003, not done) |
| 13 | **PASS** | enable on the web → sign-in 200 |
| 14 | **PASS** | reset on the web → "เปลี่ยนรหัสผ่านแล้ว"; old 401, new 200; 5-char reset → 400 |
| 15 | **PASS** | sign-in made before the reset → 401 at once (D23) |
| 16 | **PASS** (API) · app wording NOT_TESTED | wrong 1–4 → 401; right password after 5 wrong → 429 `TOO_MANY_ATTEMPTS`, `Retry-After` 288 s ≤ 300; upper-case email also locked; unknown email locked by the 6th; **after the lock the right password → 200**, then one wrong → 401 (count reset) — `lockout-wait.log` |
| 17 | **PASS** | 4 wrong → right (200) → 4 wrong → right (200) |
| 18 | **PASS** | U2 signs in while U3 is locked |
| 19 | **PASS** | `FILTER_PAUSED=true`: message stored, `pending`, 0 decisions, API 404 while undecided; restart with the filter on → decided **once** (1 decision, 2 AI calls), notified — `case19.ts` output in the log entry |
| 20 | NOT_TESTED (long-run) | re-check the oldest rows at the next round |
| 21 | **PASS** | admin list + sign-in replies contain no password / hash field; back-end log (8 lines) holds no password, token or hash. Thin log — little is logged at all |

The #16 tail ran on the instance started 16:04:37; no file under `src/modules/auth`, `src/modules/admin`,
`src/core/auth.ts` or `migrations/` changed between that run and build `8ed1ce4b…` (checked with `find -newer`).

## Run 2 — 2026-11-01 — app surface (after TASK-026/027/029 DONE)
Build: app `corner-chat-app` working tree, `src/` fingerprint **`43a13788302c50d1`** (74 files) · back **`f930f30b0d6abb6f`**
(both unchanged before and after the run). Surface: the app's **browser build** (vite, `VITE_FAKE=false`, `/api` proxied to
QA's own back end), headless Chrome **360×800, mobile + touch, th-TH**. SPEC-003 names this as the scripted surface. Every
user step went through `data-testid`. Script `harness/qa-a/app-surface.mjs` → `app-surface-result.json`: **30/30 PASS**
(13 are TEST-001's). Screenshots `harness/qa-a/shots/a*.png`.

| # | Result | Actual (app) |
|---|---|---|
| 1 (app) | **PASS** | not signed in → `/messages` redirects to `/signin`; title "เข้าสู่ระบบ corner-chat"; U1 signs in → message list — `a01-signin.png` |
| 4 (app) | **PASS** | wrong password and unknown email both show "อีเมลหรือรหัสผ่านไม่ถูกต้อง" — `a02-wrong-password.png` |
| 7 (app) | **PASS** | notified and held tabs show U1's rows only, no U2 text · U1 opens U2's message by URL → error state, no U2 text · after a 401 the saved offline list and the token are gone from storage (TASK-029's fix) |
| 10 (app) | **PASS** | disabled U1 signs in → "บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล" — `a09-disabled-wording.png` |
| 11 (app) | **PASS** | owner disables U1 while signed in → the app's next load lands on sign-in — `a08-kicked-after-disable.png` |
| 14/15 (app) | **PASS** | owner resets while signed in → next action lands on sign-in; old password "อีเมลหรือรหัสผ่านไม่ถูกต้อง", new one works |
| 16 (app) | **PASS** | right password after 5 wrong → "ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่" — `a10-too-many.png` |
| 21 (app) | **PASS** | sign-out asks "ออกจากระบบไหม", lands on sign-in, storage holds no message text, the old token → 401 |

**Not run, and why:** the **native APK on the emulator**. The browser build runs the same code but not the native layers:
`CapacitorHttp` (native fetch) and `@capacitor/preferences` (Android app-private storage, where the token and the
offline list live). The emulator was not running. The APK on disk (19:11) has another API address baked in, and building
my own needs `cap sync`/`gradlew` in the `android/` folder Team B's TASK-030 is working in. That is a slot the PM gives
(as for TASK-029). A real phone (`21ec5dd6`, 220333QAG) is attached over adb; I did not address it.

## Run 3 — 2026-11-01 — native APK on the emulator (PM slot, TEST-003 Q6)
Build: app `src/` **`bc72845cb2e93213`** (82 files, after TASK-030's REVIEW; unchanged before/after) · back **`f930f30b…`**.
APK: `npm run apk:debug` with `VITE_FAKE=false`, `VITE_API_BASE=http://10.0.2.2:8191/api/v1`, JDK 21 → `BUILD SUCCESSFUL`;
kept as `harness/qa-a/cornerchat-qa-a-8191.apk`, SHA-256 `32d9af14…a3a7f`. Device: `emulator-5554` = `cc_phone_360`,
`sdk_gphone64_x86_64`, API 34, 720×1600, started headless by me. **Every adb call named `-s emulator-5554`. The real
phone `21ec5dd6` stayed listed and was never addressed.** Driven over raw DevTools into the app's WebView, the method of
`harness/task-029/shoot-emu.mjs`. Script `harness/qa-a/app-emu.mjs` → `app-emu-result.json`: **17/17 PASS**; screenshots
`shots/e*.png` (the whole emulator screen). The browser checks were re-run on the same app build: 30/30.

| # | Result | Actual (APK, native HTTP + Android Preferences) |
|---|---|---|
| 1 (APK) | **PASS** | runs inside the native shell (`Capacitor.isNativePlatform()`); title "เข้าสู่ระบบ corner-chat" — `e01-signin.png` |
| 4 (APK) | **PASS** | wrong password and unknown email both "อีเมลหรือรหัสผ่านไม่ถูกต้อง" |
| 7 (APK) | **PASS** | U1's list over 10.0.2.2 holds U1's rows only; U2's message by id → error state, no text · **after the 401, Android Preferences hold no `cc.token` and no `cc.cache.*`** (only `cc.push.asked` remains) |
| 10 (APK) | **PASS** | "บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล" — `e08-disabled.png` |
| 11 (APK) | **PASS** | disabled while signed in → the next load lands on sign-in — `e07-kicked.png` |
| 15 (APK) | **PASS** | reset while signed in → the next action lands on sign-in; the new password works |
| 16 (APK) | **PASS** | "ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่" — `e10-too-many.png` |
| 21 (APK) | **PASS** | sign-out asks "ออกจากระบบไหม"; Preferences clean; the old token → 401 — `e09-signed-out.png` |

## Defects
None.

## Observations (not ours)
- The working tree changed **while** I tested (TASK-023 on `notify.ts`/`pipeline.ts`, the mail work on `messages/index.ts`,
  `app.ts`, `mail/*`, 16:06–16:14). I re-ran everything on one fingerprinted build. With no commits yet, a fingerprint is
  the only name a build has. A commit per DONE task would make the next verdict name a sha.
- The back end logs almost nothing (8 lines for a whole run). #21 passes, but a failure in the field would leave little to read.
- (run 2, app) The sign-in error line is plain dark text, not styled as an error (`a09-disabled-wording.png`). It is readable
  and the AC is met. A design point for the PM, not a defect.

## Test data created
| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| database `corner_chat_qa_tanya` (owner `owner@qa-a.test`, users `*@qa-a.test`, made-up messages, rules, one device token `fcm-u2-*`) | team cluster 127.0.0.1:5433 | **left** — QA's own DB, reused for the REQ-004 re-run; nobody else reads it. Drop: `bun harness/qa-a/backend.ts <back> <secrets> reset` or ask the SA |
| `.next/` dev cache from `next dev` | `corner-chat-front` (git-ignored) | left — same cache the FE's own runs make |
| QA secrets (generated owner password, SECRET_KEY) | scratchpad outside the repo | left there; never printed or committed |
| processes on :8191, :3191, :3991 | local | stopped 2026-11-01 16:24 |
| run 3: `com.develyst.cornerchat` (my APK) installed, `pm clear`ed, then **uninstalled**; emulator started headless and stopped (`emu kill`) | `emulator-5554` (shared with Team B) | emulator off, app not installed; the slot handed back to the PM |
| run 3: `npm run apk:debug` ran `cap sync` + `gradlew` (generated files only, no source edited); `dist/` restored by a default `npm run build` (no `10.0.2.2` left in it) | `corner-chat-app` | `android/app/src/main/assets/public` and `build/outputs/apk/debug/app-debug.apk` hold my 8191 build until the next `apk:debug` (it always syncs first) |
| run 3: users `emu-*@qa-a.test`, `app-*@qa-a.test`, made-up messages | QA's own DB `corner_chat_qa_tanya` | left — QA's own |

## Verdict
**`TEST_PASSED`** for REQ-001 as Team A built it (back end + owner's admin web): every API and web case passes on build
`8ed1ce4b…` / `bded52de…`, 0 defects.
Run 2 (2026-11-01): the **app** halves of #1, #4, #7, #10, #11, #14–#16, #21 **PASS** on the app's browser build at 360 px.
Run 3 (2026-11-01): the same app rows **PASS as a native APK on `emulator-5554`** (17/17), including the 401 wiping Android
Preferences.
NOT_TESTED, named: a **real phone** (by design — the owner's phone is not ours to drive) · #12 via the mail poller —
REQ-002 (TASK-003) · #20 — long-run.

## Evidence (decisive)
- `harness/qa-a/test-001-result.json` — 67/67 API checks (isolation #7–#9, disable/reset #10–#15, lockout #16–#18)
- `harness/qa-a/admin-web-result.json` + `shots/w05-user-refused.png` — 12/12 on the owner's page; a user account is refused
- `harness/qa-a/lockout-wait.log` — after the 5-minute lock the right password works (200)
- `harness/qa-a/app-surface-result.json` + `shots/a08-kicked-after-disable.png`, `a09-disabled-wording.png` — the app rows (run 2)
- `harness/qa-a/app-emu-result.json` + `shots/e07-kicked.png`, `e08-disabled.png` — the same rows on the native APK (run 3)

## Questions
(For the PM — answers as `> answer: ...`. Defaults are what I test if the answer is "yes".)
- **Q1 — an existing sign-in when the owner disables or resets.** The REQ says sign-in is refused; it does not say what
  happens to a user who is already signed in. Default: **the next app action / API call with the old sign-in is refused
  at once** (disabled → the disabled wording; reset → back to the sign-in screen). Cases #11, #15.
  Checked: DECISIONS (D9, round-1 shape) · SYSTEM-FACTS · REQ-001 — not covered.
- **Q2 — AC-6 exact numbers.** "slowed or blocked for a few minutes" cannot be checked as written. Default: **per account
  (email), 5 wrong in a row → refused for 5 minutes with the too-many-tries wording, even with the right password; the
  count resets on a right sign-in.** Cases #16–#18. Checked: REQ-001 AC-6 `[team-proposed]` — numbers not stated.
- **Q3 — test seams (for the SA, via you).** Case #19 needs a way to stop the back end between intake and the filter
  (or a pause switch) on local. Same request is in TEST-002 Q1 and TEST-003 Q1 — one SPEC section can answer all three.

> answers `[PM-decided 2026-11-01, under the owner's standing instruction; listed as D23–D26 in project-docs/decisions-for-owner-review.md]`:
> Q1 default accepted — the next call with the old sign-in is refused at once. · Q2 default accepted — per email, 5 wrong
> in a row → refused 5 minutes, reset on a right sign-in (REQ-001 AC-6 amended). · Q3 → SA Team A as a testability
> requirement (REQ-001/-002/-004 § Questions, relayed 2026-11-01).

- **Q4 — which database QA tests on now (2026-11-01).** Workspace `CLAUDE.md` rule 4 changed today: no local Postgres; every
  desk uses the owner's dev Postgres server through the `DATABASE_URL` he gives. All my runs so far used **my own database
  `corner_chat_qa_tanya` on the team's local cluster (127.0.0.1:5433)**, which rule 4 now rules out. So my next run (any
  re-test, REQ-002's TEST-002) is blocked until I have a URL. The repo's `.env` still points at :5433 (checked; host only).
  **Default: the owner gives QA its own database on his server** (e.g. `corner_chat_qa`), as an env value through you, so
  a dev server never takes QA's rows (the 2026-11-01 incident; DECISIONS "one dev server per DB"). The other choice: QA uses
  the desk's dev database, and no dev server runs while QA tests. This changes how I isolate every run.
  Checked: DECISIONS ("one dev server per DB", 2026-11-01) · `CLAUDE.md` rule 4 (2026-11-01) — rule 4 settles *where*, not
  *which database* QA gets. Leftover: `corner_chat_qa_tanya` on :5433 is QA's only; drop it with the cluster whenever it is retired.
- **D44 HOLD (2026-11-01), checked:** my harness already starts the back end with `LINE_API_BASE=http://127.0.0.1:9` (a closed
  local port) and `LINE_CHANNEL_ACCESS_TOKEN=""` in the process environment. Bun keeps the process value over `.env`
  (checked from the back repo: base = `http://127.0.0.1:9`, token length 0; without the override `.env` gives a 172-character
  token). No run of mine can reach `api.line.me`.
  > answer to Q4 `[PM, 2026-11-01, D43]`: **your default.** QA uses its own database on the owner's server, built from the
  > owner's `DATABASE_URL` in `corner-chat-back/.env` with the database name swapped. Use a name under the D43 prefix,
  > `corner_chat_test_qa_a` (Tefany: `corner_chat_test_qa_b`), and drop it after a run. No new URL is asked of the owner.
  > Until he puts the new URL in (with his new password), runs that need a database wait.

- **Q5 — the owner's URL names a database that does not exist (2026-11-01, smoke check).** After the owner set
  `DATABASE_URL`, I ran `harness/qa-a/backend.ts … up`. It connects with his URL as given before creating
  `corner_chat_test_qa_a`. The server answered (host `154.197.124.206:5432`, database `corner_chat`, credentials
  not printed): `PostgresError: database "corner_chat" does not exist` · `errno: "3D000"` · `severity: "FATAL"`. Nothing
  was created and nothing is running. **This blocks more than QA:** the dev back end connects with the same URL.
  **Default: the owner creates the database once on his server** (bare SQL for him: `CREATE DATABASE corner_chat;`), and
  says whether his user may also `CREATE DATABASE` for `corner_chat_test_qa_a` / `_qa_b` (D43). The other choice:
  QA connects to the server's `postgres` maintenance database only to create and drop its own test database. That
  works around his URL, so I do not take it without his word. Checked: D43 · TEST-001 Q4 · rule 4 ("env values come from
  the owner … never builds a stand-in").
  > answer to Q5 `[PM, 2026-11-01]`: **the other choice, on the owner's own words. The owner is not asked.** With the URL he
  > gave, he said *"ให้ไปสร้าง database ใช้ได้"* (`SYSTEM-FACTS.md`, 2026-11-01). So the team creates its databases on his
  > server. To do that, connect with his credentials to the `postgres` maintenance database, only for `CREATE DATABASE` /
  > `DROP DATABASE`, and only for names under the D43 prefix: `corner_chat`, `corner_chat_test_*`. Never touch any other
  > database there. **Jason creates `corner_chat` once** (TASK-033's live part, through Sober). QA creates and drops its own
  > `corner_chat_test_qa_a` / `_qa_b` the same way. This is not a stand-in: the host, user and password are all his.

  > carried (Tanya, 2026-11-01): the harness creates and drops through `postgres`, only for `corner_chat_test_qa_a`.
  > The smoke check printed `created corner_chat_test_qa_a`, then `dropped corner_chat_test_qa_a`. Creating works; the next line is Q6.

- **Q6 — the back end refuses to run on QA's own database (2026-11-01, same smoke check).** With
  `DATABASE_URL` = the owner's server + `corner_chat_test_qa_a`, the back end stops at start-up:
  `Configuration error: DATABASE_URL must name the database "corner_chat" (this server is shared), got "corner_chat_test_qa_a"`
  (`src/config.ts:86`, `APP_DB = "corner_chat"`; tests may only use `corner_chat_test_r<pid>_<hex>`, line 60). So
  Q4/D43 ("QA runs on its own database") and the product's guard disagree, and no QA run can start. The database was dropped
  again and nothing is running. Two choices; the guard is the SA's code, so this goes through you to Sober:
  - **Default: the guard also accepts `corner_chat_test_qa_a` / `corner_chat_test_qa_b` for `DATABASE_URL`.** Those names are
    under the D43 prefix the owner allowed, so the guard still keeps every other project's database out. QA stays isolated,
    and no dev server can take QA's rows (the 2026-11-01 incident, DECISIONS "one dev server per DB").
  - The other choice: QA runs on the shared `corner_chat`, and no other back end may run while QA tests. That brings
    back the incident's risk, and it needs a "QA is testing" signal between both teams.
  Checked: D43 · Q4 / Q5 answers above · DECISIONS "one dev server per DB" · `src/config.ts` lines 58–92 — not covered.
  > answer to Q6 `[PM, 2026-11-01]`: **your default.** It is the same as Tefany's TEST-004 Q10, already routed to SA Sober
  > (TASK-033 § Questions). I will tell you when the guard accepts `corner_chat_test_qa_a` / `_qa_b`.

  > carried (Tanya, 2026-11-01, after TASK-033 DONE): **regression run on the owner's server.** Back `7808f3edcccd951c` (same
  > before/after) on `corner_chat_test_qa_a` (created through `postgres`, migrations `…0001–0003`, `…0100` applied; the back
  > end logged `line: target=closed`). `test-001.ts` **67/67** · `test-003-stub.ts` **48/48**. Then the database was dropped
  > (`dropped corner_chat_test_qa_a`) and nothing is running. `tests/REGRESSION.md` is seeded with R-01…R-12 (F-027: it should
  > have been at delivery).
