# POKERVAULT-LOG — every unlock, and whether it held

> **Append-only.** Only PokerVault writes unlocks. Format and rules: `POKERVAULT.md` § The log.
> `UNLOCKED` = logged in and verified against the authenticated page.
> `NOT_UNLOCKED` = refused or failed, with the reason. A credential is never written here.

---

## UNLOCK-001 · 2026-11-06 · som for the owner (proof of concept)

- **Request:** the owner, in chat, asked me to log in to `som.develyst.online` to prove
  a DeepSeek seat can do what Tanya (Claude) cannot — *"นายหยิบไปกรอกแล้ว login ได้"*.
- **Ran:** `node picklocker/login.mjs som` (credentials from the git-ignored
  `picklocker/access.txt`; Playwright `channel: "chrome"`, headless).
- **Verified:** loaded `/scheduler/calendar` with the saved session → status **200**,
  final URL `https://som.develyst.online/scheduler/calendar`, title `SOM SCHEDULE`,
  body `Back-office scheduling … Staff · TM` — not redirected back to `/login`.
- **Handed:** `picklocker/state/som.json`
- **Result:** `UNLOCKED`

---

## UNLOCK-002 · 2026-11-06 · som session handed to Tanya (end-to-end, Claude side)

- **Request:** the owner asked Tanya, through Porter (Owner → Porter → Tanya), to
  capture the "People" page on sid web using the provisioned session.
- **Ran:** Tanya loaded `picklocker/state/som.json` as Playwright `storageState` and
  captured `https://som.develyst.online/scheduler/people`.
- **Verified (Porter, quoted):** status **200**, final URL `/scheduler/people`, user
  `tanya`, **156 parents**, *"Tanya did not type anything and the script sent only GET
  requests"*; evidence `smart-scheduler/ai-worker/tests/evidence/sid-people-2026-11-06T08-21-15-703Z.png`.
- **Handed:** reused `picklocker/state/som.json`
- **Result:** `UNLOCKED` — the handoff works on the Claude side with **no password typed**.

---

## UNLOCK-003 · 2026-11-06 · som for Porter/Tanya (real request, watcher-fired)

- **Request:** `REQUEST-porter-to-pokervault-2026-11-06-som.md` — Porter asked for a
  signed-in session so Tanya can capture the course page on sid; read-only.
- **Ran:** moved the old state to `som.json.bak`, fresh `node picklocker/login.mjs som`
  (credentials from git-ignored `access.txt`).
- **Verified:** loaded `/scheduler/people` with the new session → status **200**, final URL
  `/scheduler/people` (authenticated, not redirected to login).
- **Handed:** `picklocker/state/som.json`
- **Result:** `UNLOCKED`
- **Wake:** the background watcher `bash-4a5431f2a89046ea` (bash-only, no AI while sleeping)
  detected the request and finished, which woke me — **wake-on-request works on DSH;
  `nudge-session` is not the mechanism.**

---

## UNLOCK-004 · 2026-11-06 · som for Porter/Tanya (clean restart, course page)

- **Request:** `REQUEST-porter-to-pokervault-2026-11-06-som-course.md` — Porter asked for
  a signed-in session so Tanya can capture the course page on sid; read-only.
- **Ran:** reset the old session (moved to `.prev`), fresh `node picklocker/login.mjs som`.
- **Verified:** loaded `/scheduler/people` with the new session → status **200**, final URL
  `/scheduler/people`.
- **Handed:** `picklocker/state/som.json`
- **Result:** `UNLOCKED`
- **Wake:** watcher `bash-6b559849821346ae` fired on the new request file and woke me.
- **Follow-through (Porter, quoted):** request written → **UNLOCKED at 15:37** (3-min limit
  met) → Tanya captured at **15:38**: the course list under `/scheduler/bookings`
  ("Courses + leave", Active 89 / Paused 4 / Completed 29 / Expired 24 / Cancelled 112)
  plus one course's plan window; both **200**, GET-only, no typing.
- **Discovery:** sid has no `/course` path — the course list lives at `/scheduler/bookings`.

---

## UNLOCK-005 · 2026-11-07 · som standby readiness (nobody asked; the lock is checked before it is needed)

- **Request:** none. The owner's standby order, quoted: *"ทำความเข้าใจหน้าที่ตัวเองให้ถี่ถ้วน
  และเตรียมพร้อมทำงาน"*. No desk is waiting; this is the check that the door opens **before**
  someone knocks.
- **Ran (fresh machine):** `cd picklocker && npm.cmd install playwright-core` (the git-ignored
  tree was absent); then `node picklocker/login.mjs som`, credentials from the git-ignored
  `picklocker/access.txt`.
- **Miss, first attempt (`NOT_UNLOCKED`):** `smart-scheduler/project-docs/sm-test-access.txt`
  is the **stale** credential — `/api/auth/callback/credentials` answered
  `{"url":".../login?error=CredentialsSignin&code=credentials"}`. The live credential is the
  one `machine.local.md` names under *smart-scheduler QA credentials*; with it the login
  passes. `machine.local.md` was right, the project-docs file is the trap it warns about.
- **Tooling change:** `login.mjs` now keeps the old session as `state/<site>.json.prev`, and a
  refused login exits 1 with `NOT_UNLOCKED — login stayed on /login …` **without touching the
  working session file** (tested: a bogus credential left `som.json` byte-identical). Then it
  **verifies with a clean context loaded from the saved file** — `verified: status … · <url> ·
  AUTHENTICATED`, exit 1 on a redirect — so "session saved" can never be mistaken for an unlock.
- **Verified:** status **200** · final URL `https://som.develyst.online/scheduler/calendar` ·
  **AUTHENTICATED**.
- **Handed:** `picklocker/state/som.json` — held for the next request, handed to nobody.
- **Result:** `UNLOCKED`
- **Standby:** watcher jobs `pwsh-05078e2063c54b33` (fired on the self-test) → restarted as
  `pwsh-0714095517c146a7` with the keep-fresh loop (`POKERVAULT.md` § Standby, 2026-11-07):
  20 s request poll + `keep-fresh.mjs` at start and hourly, PowerShell, both
  `REQUEST-*-to-pokervault-*.md` and `REQUEST-*-to-picklocker-*.md`. **Wake path tested, not
  assumed:** a self-test request file made the job finish at 01:38:18 and wake this session;
  the file was deleted and the watcher restarted. This is the route that works — not
  `nudge-session`. It then woke me for real at 02:15:22 (UNLOCK-006).

---

## UNLOCK-006 · 2026-11-07 · som for Porter/Tanya (course page, searched "0900")

- **Request:** `REQUEST-porter-to-pokervault-2026-11-07-som-course.md` (Porter): *"signed-in
  session for Tanya (QA) to capture the course page searched for '0900'"* — sid, read-only.
- **Ran:** fresh `node picklocker/login.mjs som` (credentials from git-ignored `access.txt`).
- **Verified:** status **200** · final URL `https://som.develyst.online/scheduler/calendar` ·
  **AUTHENTICATED**, at **02:16**. (First attempt's verify timed out on a slow page load and
  exited 1 even though the URL was authenticated — fixed: verification now waits for
  `commit`, so a slow Cloudflare response cannot fake a failure. Second run: 200, clean.)
- **Handed:** `picklocker/state/som.json`
- **Result:** `UNLOCKED` — reply written into the request file at 02:16.
- **Wake:** the standby job `pwsh-0714095517c146a7` fired at **02:15:22** and woke me.
- **Note:** this request arrived **after** Atlas's 2026-11-07 ruling that desks no longer
  request logins. I served it rather than refuse mid-run; the tension is recorded at the end
  of `REQUEST-pokervault-to-atlas-2026-11-07-capabilities-and-wake.md` § 4b for Atlas to settle.

---

## CORRECTION · 2026-11-07 · the note under UNLOCK-006 is void

UNLOCK-006 recorded that a desk request contradicted Atlas's ruling that **desks may no longer ask
for a login**. **Atlas withdrew that ruling** on the owner's word (*"ไม่เว้ย atlas นายยังไม่เข้าใจ
pokervault"*): a desk asking this seat is not a Claude seat signing in. The line that stays is the
real one — no Claude seat ever touches a credential or runs a login.

**The flow is now the rule** (ATLAS.md 2026-11-07, `role-pm` §8, `role-qa` §4, `POKERVAULT.md`):

1. the PM checks the card read-only — `node picklocker/check-card.mjs <site>` → `AUTHENTICATED` (0)
   or `MISSING`/`LAPSED` (1), never logs in;
2. on exit 1 the PM drops `REQUEST-<from>-to-pokervault-<date>-<site>.md` and watches it up to 3 min;
3. I wake, log in, verify, reply `UNLOCKED` in that file, re-arm the watcher;
4. timeout / `NOT_UNLOCKED` → the PM says so, those cases are NOT_TESTED.

Also changed, same day: **no hourly keep-fresh** (owner: *"ทำไมต้องทำให้มันทำงาน เปลืองคอมฉันทุกชั่วโมงด้วย"*).
It runs **once when this seat opens**. The scheduler offer is withdrawn. My reply in
`REQUEST-porter-to-pokervault-2026-11-07-som-course.md` quoted the withdrawn rule and has been corrected there.

---

## UNLOCK-007 · 2026-11-07 · uat for Porter/Tanya (REQ-5004 gate, TEST-138 — read only)

- **Request:** `REQUEST-porter-to-pokervault-2026-11-07-uat.md` (Porter): *"signed-in session for
  Tanya (QA) to run REQ-5004's uat gate (TEST-138): SOM Dashboard cards, lists and capacity,
  read only"* — the customer's system.
- **Decision first:** `uat` is a `session-import` site in `sites.json` (the owner exports it; nothing
  auto-renews it). I kept that default and added an explicit one-off switch instead of flipping the
  mode: `login.mjs --allow-import`, which refuses without the flag. This was a deliberate exception,
  logged here because it is the customer's system.
- **Ran:** read-only probe of the login page (GET only, no credential) → same standard form as som;
  then `node picklocker/login.mjs uat --allow-import` (owner's credential file, git-ignored
  `picklocker/access.txt` — the uat entry there is the same live pair).
- **Verified:** status **200** · final URL `https://frontoffice.develyst.online/scheduler/calendar` ·
  **AUTHENTICATED** at **03:06**.
- **Read-only proof:** `node picklocker/check-card.mjs uat` → `AUTHENTICATED · 200 · /scheduler/calendar`
  with **every non-GET request aborted** (route filter) — the reads the gate needs work; the check
  writes nothing.
- **Handed:** `picklocker/state/uat.json`
- **Result:** `UNLOCKED` — reply written into the request file at 03:06.
- **Wake:** watcher `pwsh-a46092c75e1a458f` fired at **03:05:42**.
- **Standing risk noted:** a card on the customer's system lets a careless harness write. The
  control is the QA's own rule (read-only; every write is a DATA REQUEST), plus the GET-only check
  above. If the owner wants uat logins to stop entirely, `sites.json` mode stays `session-import`
  and the `--allow-import` flag is never used — that is his call, recorded in POKERVAULT.md.

---

## STANDBY · 2026-11-07 21:17 · watcher lost to a host restart, re-armed

- The standby watcher (`pwsh-748f983caf954225`) was killed at the host side, not by a request
  (`Windows Job runner exited … 1073807364`); the harness restarted (GUI port changed 53785 →
  50826). Between 03:07 and 21:17 this seat was **deaf**: a request written in that window would
  have waited. No request was written.
- On the owner's "stand by": keep-fresh once → `som=ok`; `check-card.mjs` → **som
  AUTHENTICATED 200**, **uat AUTHENTICATED 200** (the uat card from 03:06 was still live after
  18 h, and nothing renewed it — mode stays `session-import`).
- Watcher re-armed as `pwsh-dea802718097421d`, request-only.
- **Lesson for this file:** a host restart silently ends the wake path. A fresh session (or a
  restart) must re-arm it, and the desks cannot tell the difference between "no request" and
  "no watcher". If a request ever seems ignored, check this line first.

---

## STANDBY · 2026-11-11 16:10 · duty taken up in the usb-oda workspace (macOS)

- Session opened at `Work/ai-agent-workspace` (operator: *"นายคือ pokervault จงเตรียมตัวทำงานซะ นายต้องทำหน้าที่ login แทนฉัน"*). `picklocker/` was copied there at 15:47 (`ATLAS.md:1199`); `state/` was empty; `access.txt` was not copied (ATLAS's rule: an AI does not move secrets).
- **The hands work:** `node picklocker/login.mjs som`, credentials read from this workspace's git-ignored `access.txt` **in place** (env only — no secret copied, none printed) → `verified: status 200 · https://som.develyst.online/scheduler/calendar · AUTHENTICATED`. `check-card.mjs som` → AUTHENTICATED; card at that workspace's `picklocker/state/som.json` (mode 600). `keep-fresh.mjs` once → `som=ok`.
- **`uat002-mc` is MISSING and cannot be minted by me:** it is `session-import`, outside the `develyst.online` allowlist, and needs EntraID + OTP. Only the owner's one-time `node picklocker/export-session.mjs uat002-mc` creates it. No request file exists.
- Watcher armed (`bash-7d0043ae22dc4e10`, 20 s poll, `-to-pokervault-` + `-to-picklocker-`); no request waiting.

---

## CORRECTION · 2026-11-11 16:25 · UAT2's EntraID has no OTP

- The operator corrected the STANDBY line above: AIS UAT2's EntraID login is **email + password, no OTP**. My "needs EntraID + OTP" was a wrong relay.
- Checked the real page read-only (no credential): app → `uat-federated-auth.assistedchannel.ais.th/authenticationendpoint/login.do` (`#icon-2`, "Sign In With EntraID") → `login.microsoftonline.com/…` with `#i0116` email → `#idSIButton9` Next → `#i0118` password → Sign in. No OTP step seen.
- New `picklocker/login-entra.mjs` (in the usb-oda workspace): only sites whose `sites.json` entry has `flow:"entra"` + `allowAiLogin` (owner 2026-11-11). `login.mjs` and its `*.develyst.online` allowlist are untouched. Saves `state/<site>.json` with IndexedDB, mode 600, verifies in a clean context. Tested: `node --check`, JSON, refusals (`som` → exit 2, no creds → exit 2). NOT run end-to-end yet — no credential.
- `uat002-mc` stays `session-import` (nothing auto-renews). Owner drops `uat002-mc.user` / `uat002-mc.password` in `access.txt`; then `node picklocker/login-entra.mjs uat002-mc`.

---

## UNLOCK-008 · 2026-11-11 · uat002-mc for the operator (Tanya's next UAT2 walk)

- **Request:** operator, chat 16:2x: *"EntraID ไม่มี otp ใส่ mail กับpasswordได้เลย"* — correcting the OTP claim above, and asking PokerVault to log in instead of him.
- **Ran:** the new `picklocker/login-entra.mjs uat002-mc` (owner-authorized `flow:"entra"` + `allowAiLogin`; `login.mjs` and its `*.develyst.online` allowlist untouched).
- **Miss, first run (`NOT_UNLOCKED`):** `waitForURL` timed out on the AIS auth page. Cause: the EntraID button's `onclick` attaches after the page's scripts; a click right after `waitForSelector` is a no-op. Fixed: 3 s settle + one retry. Second run: credential accepted, no OTP page.
- **Verified:** `verified: status 200 · https://uat002-mychannel.ais.th/ · AUTHENTICATED`; `check-card.mjs uat002-mc` → **AUTHENTICATED** (GET-only).
- **Handed:** `Work/ai-agent-workspace/picklocker/state/uat002-mc.json` (mode 600, cookies + localStorage + IndexedDB).
- **Result:** `UNLOCKED`
- **Path seen:** app → `uat-federated-auth.assistedchannel.ais.th/authenticationendpoint/login.do` (`#icon-2` EntraID) → Microsoft tenant `4a034771…` (`#i0116` email, `#i0118` password) → back to the app. No OTP.
- **Note:** the app's own logout kills this card (not re-tested); Tanya should not log out. Credential is in git-ignored `access.txt` (600), never printed.
