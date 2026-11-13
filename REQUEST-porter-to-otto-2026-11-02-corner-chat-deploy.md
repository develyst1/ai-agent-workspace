# REQUEST — Porter (corner-chat PM) → Otto, 2026-11-02: the owner wants corner-chat deployed

## The owner's words (verbatim, to Porter in chat, 2026-11-02)
> "ส่งรายละเอียดไปบอก otto หน่อยว่ามีแอป อยาก deploy"

Until now the desk built under *"อย่าทำการ deploy นะ แค่พัฒนาไปจนสุดท้ายก็พอ"* (2026-11-01). Round 1 is now finished, so the
owner wants it deployed. **Every server, domain, DNS, certificate and secret decision is yours and his.** The desk does not deploy.
The release still passes the desk's own PM+QA gate (`CLAUDE.md`).

## What corner-chat is
A per-user unified inbox. It takes in Zimbra mail and LINE group messages, filters them per user with an AI (the owner's
gateway), and notifies through a LINE OA 1-on-1 chat and an Android app. All 5 round-1 REQs are DELIVERED and QA-passed
(`corner-chat/ai-worker/board.md`, `tests/TEST-001…005`).

## The code: 3 repos, branch `D1`, pushed 2026-11-02 (paths in `machine.local.md`)
| Repo (logical) | Commit on `origin/D1` | What | Stack |
|---|---|---|---|
| `corner-chat-back` | `519ebf5` | API, mail poller (IMAP/SMTP), AI filter, LINE webhook + push | Bun + Hono, `Bun.sql`, plain SQL migrations (`scripts/db-init.ts`, `scripts/migrate.ts`) |
| `corner-chat-front` | `2a90393` | the owner's admin web (users, AI settings, LINE push count) | Next.js + antd |
| `corner-chat-app` | `21eb731` | the Android app (users) | Capacitor 8 + React + Vite; an APK, installed directly (no Play Store) |

Whether each repo already builds the deploy shape (`deploy-ready-build` skill: Next standalone, `bun build --compile`) has **not
been checked**. That is a release-prep item.

## What a deployment needs, as the desk knows it
- **Database:** the owner's Postgres at `154.197.124.206:5432`, database `corner_chat` (created; migrations applied by `db:init`).
  **It has no SSL.** For dev the owner said *"Unencrypted is fine"* (D45), but for production SSL is an open question for him and you.
  The back end may take the URL as he gives it.
- **Back env:** every key, with a one-line comment each, in `corner-chat-back/.env.example`; the list of keys the owner fills is in
  `corner-chat/ai-worker/specs/SPEC-001-stack-base-and-api-contract.md` §9. Production-specific:
  - `LINE_LIVE=1` must be set on the server, or the LINE client stays on the fake (D44 guard, TASK-034).
  - `LLM_GATEWAY_URL` (the owner's gateway, `ai.develyst.online`).
  - `ADMIN_WEB_ORIGIN` = the admin web's real URL (CORS).
  - `FCM_*` is not used (no Firebase, D41).
- **Public HTTPS is needed for:**
  - the back-end API, which the app and the admin web call;
  - the LINE webhook (`/api/v1/webhooks/line`), whose URL goes into the test OA's LINE Developers console;
  - the admin web.
- **The LINE OA:** LifeStyle-Shop (@183qrfme) is the owner's *test* OA (*"นี่ใช้ทดสอบ"*). Its webhook is OFF now. Whether
  production uses this OA or a new one is his call.
- **The app:** the APK has to be rebuilt with the production API base URL. The release build allows HTTPS only (cleartext is
  debug-only). It notifies by polling the back end every 30 s (no Firebase).
- **Outbound from the server:** IMAP 993 and SMTP 465 to `mail.entronica.in.th`; HTTPS to `api.line.me` and to the gateway.
- **Background work:** the back end runs a mail poller (every 60 s) inside the same process, so it must stay running (a service, not
  a cron).

## Known caveats
- Tested only on the Android emulator, never on a real phone (vendor battery managers may stop the 30 s watcher).
- One unexplained DB "Connection closed" was seen during QA. It could not be reproduced. Pool timeouts were added (TASK-039).
- Round 1 has no iOS.

## Asked of you
Plan the deployment with the owner: which server, domains, SSL for Postgres, and where the secrets live. Tell the PM what the
desk must prepare (build shape, env, a release QA pass), and the PM routes it through the SAs. Reply in
`corner-chat/ai-worker/inbox/PM.md`, or answer the owner directly.

## Follow-up, 2026-11-02 (from SA-B, TASK-041, the release APK)
- `VITE_FAKE` defaults to **true** in the app: the release build must set `VITE_FAKE=false`, or the APK runs on fake data. TASK-041 sets it.
- `*.jks` (the signing key) was not git-ignored. TASK-041 part A fixes that before any key exists.
- The APK still waits on 2 owner answers from your list: the final API name, and where the signing key lives.

## Follow-up 2, 2026-11-02 ~22:30: the release APK is built (TASK-041 DONE, SA-B reviewed)
- Signed release APK for SIT: `corner-chat-app` → `android/app/build/outputs/apk/release/app-release.apk` (repo path in `machine.local.md`).
  It is 3,361,589 bytes, with SHA-256 `9816a1b5f9986b52d22f586591266f3b44cebef185f449d3b68898abf8b96e3b`.
  It is signed as `CN=corner-chat, O=develyst`; the cert SHA-256 is in the `corner-chat app signing key` row of `machine.local.md`.
- The bundle points at `https://cornerchat-api-sit.develyst.online/api/v1`. Fake data is off, it is not debuggable, and the build is HTTPS-only.
- **Nothing has been sent, uploaded or installed.** Handing out the APK is yours or the owner's job.
- The key folder (path in `machine.local.md`) is outside every repo. The owner is asked to back it up himself.
- Part A's 3 app files (gitignore, build.gradle signing hook, the `apk:release` script) are **not committed yet**. They go up with the owner's next `ขึ้น git`.
- **UNVERIFIED:** install plus sign-in against the SIT API. That is the desk's release QA pass, which starts once you say SIT is up.

## Follow-up 3, 2026-11-03 ~01:00: the Gmail forward is set, so please turn mail on for SIT
- Owner: the entronica mailbox forwards a copy to his Gmail (*"saved"*). He has made an App Password for that Gmail and keeps it himself.
- **Asked of you:** set the SIT poller on (`MAIL_POLL_SECONDS=60`, Gmail IMAP/SMTP, `MAIL_APPEND_SENT=false`, per SERVER-FACTS). Then tell the PM.
  The owner then connects the Gmail in the app himself, and Tanya runs TEST-006 row 10.
- Your own note (SERVER-FACTS, "the mail host is one global setting"): the SIT poller will also try any entronica rows in `mail_accounts` and write `last_error` on them. The desk's local backs run with `MAIL_POLL_SECONDS=0`. QA's old entronica test rows are only theirs to judge, so tell the PM if you want them disconnected first.
