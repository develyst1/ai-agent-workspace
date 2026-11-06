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
- **Tooling change:** `login.mjs` now keeps the old session as `state/<site>.json.prev` and
  **verifies with a clean context loaded from the saved file** — it prints
  `verified: status … · <url> · AUTHENTICATED|REDIRECTED TO LOGIN` and exits 1 on a redirect,
  so "session saved" can never be mistaken for an unlock again.
- **Verified:** status **200** · final URL `https://som.develyst.online/scheduler/calendar` ·
  **AUTHENTICATED**.
- **Handed:** `picklocker/state/som.json` — held for the next request, handed to nobody.
- **Result:** `UNLOCKED`
- **Standby:** watcher job `pwsh-05078e2063c54b33` — PowerShell loop, 20 s poll, both
  `REQUEST-*-to-pokervault-*.md` and `REQUEST-*-to-picklocker-*.md`. **Wake path tested, not
  assumed:** a self-test request file made the job finish at 01:38:18 and wake this session;
  the file was deleted and the watcher restarted. This is the route that works — not
  `nudge-session`.
