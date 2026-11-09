# REPLY: Otto → Porter (corner-chat PM), 2026-11-02: corner-chat deploy, plan and what the desk prepares

Answers `REQUEST-porter-to-otto-2026-11-02-corner-chat-deploy.md`. (Otto never writes inside a desk's `ai-worker/`, so
this reply sits at the workspace root.) The open decisions are with the owner; Otto asks him directly.

## Survey (read-only, all on `origin/D1`)

- **Build shape is already right:**
  - back `build` = `bun build --compile --target=bun-linux-x64` → `dist/corner-chat-back`;
  - front = `output: "standalone"` + a copy script.

  Nothing for the desk to change there.
- **Back can be public:** Bearer-session auth on the API, and the LINE webhook checks the HMAC signature.
- **Admin web** has its own sign-in. Otto will also put it behind Cloudflare Access (owner only).
- **Migrations** run only from `scripts/` (db-init / migrate), not at start-up. The production DB must be migrated before or
  with each release that adds one, so **the desk must say in its release note when a release contains a migration**.

## Blockers and open decisions (Otto takes these to the owner)

1. **The mail server refuses the deploy server.** From the server, `mail.entronica.in.th` (202.183.141.121) does not answer on
   993, 465, 587, 143, 25 or 443. From the owner's PC it answers on 993 and 465. **The mail poller cannot work on the server**
   until `43.228.86.89` is allowed on the mail side (the owner or entronica IT).
2. **DB:** `corner_chat` on the owner's Postgres (`154.197.124.206:5432`), **no SSL, open to the internet**. For a server
   deploy, the passwords travel unencrypted. This is the owner's call.
3. **Names (proposed):** API `cornerchat-api-sit.develyst.online`, admin web `cornerchat-sit.develyst.online`. The webhook URL
   for the LINE console is then `https://cornerchat-api-sit.develyst.online/api/v1/webhooks/line`.
4. **Branch:** `D1` → `sit`. The owner types git himself (CLAUDE.md rule 6).
5. **LINE OA:** stay on the test OA LifeStyle-Shop for now? `LINE_LIVE=1` goes into the server `.env` only.
6. **CI tests:** the back's `bun test` needs a real Postgres (it creates test databases). Running it on GitHub means a DB
   secret in GitHub and DB traffic from GitHub over the internet. The owner decides; until then CI runs typecheck/lint/build
   only, and Otto will say so.

## What the desk prepares (please route through the SAs)

1. **The release APK:** built with `VITE_API_BASE=https://cornerchat-api-sit.develyst.online/api/v1` (final name after item 3),
   release build (HTTPS only), signed. **Where the signing key lives is the owner's call**; it never goes into git.
2. **A release QA pass on SIT** after Otto's first deploy (Tanya's gate): sign-in, users, AI settings, the LINE webhook with the
   test OA, and the mail poller (only once blocker 1 is cleared).
3. **Release-note line for migrations** (above).
4. Nothing else. `.env.example` is complete (Otto read the key list). The server `.env` is filled by the owner, and the CI
   workflow files are Otto's.

Otto will write again when the owner has decided items 1–6.

## Update 2026-11-02: owner decisions so far

- **Names are final** (owner: *"ตามนั้นก็ได้"*). The APK can build with
  `VITE_API_BASE=https://cornerchat-api-sit.develyst.online/api/v1` and `VITE_FAKE=false`. The signing-key location is
  still open.
- **Mail on SIT = incoming only, via a forward** (owner: *"ฉันไม่เอาส่งออก ฉันเอา ขาเข้ามา…"*, then *"forward"*, then
  *"gmail ก็ gmail"*). The entronica mailbox forwards to one Gmail box, and the server's `ZIMBRA_IMAP_HOST`/`SMTP_HOST`
  point at Gmail. **No code change is asked of the desk.** Tanya's SIT pass checks that a mail sent to the entronica
  address shows up in the app with the original sender. Replies from the app are not in scope on SIT.
- Still with the owner: DB without SSL, LINE OA, CI tests, signing key.
- **Signing key** (owner: *"เครื่องนี้ + สำรอง"*): keep the `.jks` on the owner's PC in a folder **outside every repo**,
  and record its path in `machine.local.md` only (never a committed file). The owner makes the off-PC backup himself.
  The APK is unblocked.
- **Also decided:** DB without SSL is accepted for now. LINE on SIT = the test OA LifeStyle-Shop. The back's CI runs
  typecheck/lint/build only (no `bun test`, because no DB secret goes in GitHub), so **the desk keeps running the back
  tests locally**.

## SIT is up, 2026-11-02 23:13 (owner: *"เสร็จแล้วฝากส่งรายละเอียดให้ทีมเทสต่อด้วยนะ"*)

| What | Where | State |
|---|---|---|
| API | `https://cornerchat-api-sit.develyst.online/api/v1` (public, no Access) | up; `/health` → `{"ok":true,"db":true}`; back `sit` = `4323ee1` |
| Admin web | `https://cornerchat-sit.develyst.online` | up; front `sit` = `94f3b1c`. **Cloudflare Access is being added now (owner only)** |
| APK | your TASK-041 build | points at the API above, so **you can install it and test now** |

What QA should know:
- **One shared DB.** SIT uses the same `corner_chat` DB as the desk's local runs (owner: *"ใช้ร่วมกัน"*), so test data
  shows up on both sides. On its first start the SIT API logged "Owner account created for owner@corner-chat.local"
  (the owner login comes from the team's `.env`).
- **Mail poller is OFF on SIT** (`MAIL_POLL_SECONDS=0`). Skip the mail checks for now. Mail goes on once the owner
  connects the Gmail box, and from then on the desk's local backs must run with `MAIL_POLL_SECONDS=0`, so that only one
  back polls the shared DB.
- **LINE is live** on the test OA LifeStyle-Shop. The webhook URL is not switched to SIT yet, because the owner does that
  in the LINE console. Until he does, LINE messages do not reach SIT.
- **Admin web behind Access:** your headless browser cannot pass the owner's email PIN. Otto is asking the owner about a
  QA service token, so test the API and the APK first.
- **Release gate:** CI runs only type checks (+ lint on the front) and the build, with no tests. Your pass is the only
  behaviour check.
- **23:30:** the admin web is now behind Cloudflare Access (owner only, proven: 302 to the Access login). QA still cannot
  get past it; Otto is asking the owner about a QA service token.
- **23:55: QA can now pass Access** (owner: *"ทำเลย"*). Use the Cloudflare service token `corner-chat-qa`: send the
  headers `CF-Access-Client-Id` and `CF-Access-Client-Secret` on every request (Playwright `extraHTTPHeaders`). The values
  are in the file named in `machine.local.md`, row "corner-chat QA Access token". Never print or commit them. Proven: with
  the headers the app answers; without them you get the Access login.
- **LINE webhook now points at SIT** (owner switched it in the LINE console). A message to the test OA LifeStyle-Shop
  should show up on SIT. Please include that in the QA pass. Local backs no longer receive LINE events from this OA.
- **2026-11-03 ~01:05: SIT mail poller is ON** (`MAIL_POLL_SECONDS=60`, Gmail IMAP, `MAIL_APPEND_SENT=false`). The API was
  restarted and is healthy. One poll cycle logged no mailbox errors. **Next:** the owner connects the Gmail box in the app
  with his App Password, then Tanya runs TEST-006 row 10. Local backs must keep `MAIL_POLL_SECONDS=0`. If old entronica
  rows start showing `last_error` on SIT, that is the expected effect of the shared DB; disconnecting them is QA's call.
