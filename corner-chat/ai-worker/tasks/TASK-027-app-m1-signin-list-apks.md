# TASK-027: Milestone 1: real sign-in + the real message list + two installable APKs
- Source: `DECISIONS.md` D35 (the owner: *"อะไรก็ได้ ง่ายๆ ที่แค่ ลงเครื่อง android ได้ก่อนก็พอ"*) + D36 · SPEC-003 rev 2 § Screens (`/signin`, `/messages`), § Structure (run modes, CORS answer), § Behaviour (session) · SPEC-001 §3.1, §3.2, §3.4 (`POST /auth/login`, `GET /me`, `GET /messages`) · REQ-005 req 1, 2 · REQ-001 wording
- Owner: FE (Fanta)
- Status: DONE 2026-11-01 (SA-B review below)
- Depends on: TASK-026. Team A's TASK-002 (auth) and TASK-005 (messages) are DONE. Replaces TASK-024 (SUPERSEDED).

- Repo: `corner-chat-app`. Files you may edit: `src/data/http/api-client.ts` (Bearer header; the error body `{error:{code}}` → a typed
  `ApiError(code)`; 401 → `SignedOut`) · `src/data/http/auth.ts`, `src/data/http/messages.ts` (list only; detail stays on the fake until
  TASK-029) · `src/data/repositories.ts` (add `AuthRepo`; keep `MessagesRepo`'s signature) · `src/data/models.ts` (add `User`, SPEC-001 §3.2)
  · `src/features/signin/**`, `src/app/routes.tsx` (the sign-in guard), `src/app/config.ts`, `src/app/strings-th.ts`, `src/main.tsx` ·
  `src/test/signin.test.tsx` · `android/app/src/main/res/xml/network_security_config.xml` +
  `android/app/src/debug/res/xml/network_security_config.xml` (step 6 only) · `src/features/placeholder/**` +
  `src/features/messages/TabHeader.tsx` (step 7 only) · `src/features/messages/format.ts`, `src/features/messages/MessageRow.tsx`,
  `src/features/message-detail/MessageDetailScreen.tsx`, `src/test/messages.test.tsx` (step 8 only) · outside the repo: `../ai-worker/tests/harness/task-027/**` (seed SQL, screenshots, APK copies); **never** `corner-chat-back`
- Git writes allowed: **none.**

## What to do
1. `POST /auth/login` → keep `token` (Capacitor Preferences). At start, `GET /me` checks it. Not signed in → every route
   redirects to `/signin`. A 401 anywhere → clear the token, go to `/signin`.
2. `/signin`: title `เข้าสู่ระบบ corner-chat`, email, password, button `เข้าสู่ระบบ`. Error codes → REQ-001 wording:
   `INVALID_CREDENTIALS` → `อีเมลหรือรหัสผ่านไม่ถูกต้อง` · `ACCOUNT_DISABLED` → `บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล` ·
   `TOO_MANY_ATTEMPTS` → `ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่` · any other code → `เกิดข้อผิดพลาด ลองอีกครั้ง`.
3. `GET /messages?tab=…&channel=…&before=…&limit=30` → TASK-026's `MessageSummary`. With `VITE_FAKE=false`, the list uses it.
4. Two **debug** APKs (no signing setup):
   - **`cornerchat-fake.apk`** (`VITE_FAKE=true`): runs on any phone with no server. This is the one **the owner installs on his phone** (D35).
   - **`cornerchat-local.apk`** (`VITE_FAKE=false`, `VITE_API_BASE=http://10.0.2.2:8093/api/v1`): for the emulator against the local back end.
   Copy both to `../ai-worker/tests/harness/task-027/`, with their sizes and SHA-256 in Notes.
5. **The local back end, by the desk rule** (`DECISIONS.md` 2026-11-01: one dev server per database, its own port, stopped when
   done). You run it; you write nothing in that repo:
   - **Superseded 2026-11-01 by D43** (no local Postgres). For any later run, use SPEC-003 § Structure "Live back-end recipe (D43)", not this step.
   - create the private database `corner_chat_app_b` on the team's local cluster (:5433). Its connection details are in
     `corner-chat-back/.env`; never copy them anywhere;
   - in `corner-chat-back`: `DATABASE_URL=<…/corner_chat_app_b> PORT=8093 bun run migrate`, then the same prefix + `bun run dev`;
   - one **made-up** user through `POST /api/v1/admin/users` (owner token from `POST /auth/login`, owner seed in that `.env`);
   - a few **made-up** messages for that user from a seed file you write at `../ai-worker/tests/harness/task-027/seed.sql`
     (plain `INSERT`s into `messages` + `decisions`, columns per SPEC-001 §5; on `corner_chat_app_b` only);
   - when done, stop the server and drop the database (paste both commands). LINE stays fail-closed (empty token). Set no real token.
   - In the browser the same back end is reached with `VITE_PROXY_TARGET=http://127.0.0.1:8093 npm run dev`.
6. (From TASK-025's review.) SPEC-003 says cleartext to `10.0.2.2` is for **debug** only, but TASK-025 put it in `src/main`. Move the
   current file to `android/app/src/debug/res/xml/network_security_config.xml` (debug resources override main), and make the
   `src/main` one `<base-config cleartextTrafficPermitted="false" />` only. The manifest stays as it is.
7. (From TASK-026 Q5.) Build one shared tab header (title + ⋮ + sign-out), used by `Placeholder` and by `/messages` in place of
   `TabHeader`'s copy. The existing tests must stay green.
8. (Added 2026-11-01, PM's D42 from the AC-1 eye check, REQ-005 § Questions.) In the app, the about line shows **without** its
   `[channel · group or sender]` head. Add one helper in `format.ts`: `aboutText(aboutLine)` removes a leading `[...]` and the
   spaces after it, and returns the rest unchanged. `null` → `AI ไม่ได้ตรวจ` as now. Use it in the row and on the detail.
   The server and the fixtures keep the full form; the phone notification (TASK-030) keeps the full form too.
   Test it with an AI line, a rule line (`[อีเมล · คุณวิภา รัตนชัย] ตรงกฎของคุณ: จากคนนี้ vipa@sender.test` → `ตรงกฎของคุณ: จากคนนี้ vipa@sender.test`),
   a line with no head (unchanged), and `null`.

## Definition of Done (paste real output)
- [ ] `npm run build` clean · `npm test` green, including `signin.test.tsx`: each error code → its Thai text · 401 → back at
      `/signin` · the token survives a reload.
- [ ] **Browser, real back end** (`VITE_FAKE=false`, the proxy at :8093, 360×800): sign in as the made-up user → the real list shows the
      seeded messages in both tabs. A wrong password → `อีเมลหรือรหัสผ่านไม่ถูกต้อง`. Screenshots → `task-027/`.
- [ ] **Emulator `cc_phone_360`:** `adb install -r cornerchat-local.apk` → the same two checks (screenshots `apk-signin.png`, `apk-list.png`).
      `adb install -r cornerchat-fake.apk` → it opens on the fake list (one screenshot).
- [ ] Both APKs built: the gradle tail lines, sizes, SHA-256. Step 6: `cornerchat-local.apk` still reaches `10.0.2.2:8093` (the
      emulator check above proves it), and paste both `network_security_config.xml` files.
- [ ] A real phone is **not** part of this TASK: write `UNVERIFIED — the owner installs cornerchat-fake.apk on his phone`.
      `cornerchat-local.apk` on a real phone also needs the back end listening beyond localhost plus a firewall rule (admin) → listed for the PM, not done.
- [ ] The server stopped, `corner_chat_app_b` dropped, and `git status --porcelain` in `corner-chat-back` unchanged by you (paste it before and after).
- [ ] `git status --porcelain` in `corner-chat-app` → only listed files.

## Implementation Notes
Fanta (FE-B), 2026-11-01. Repo `corner-chat-app`, base `main` `f5e060d`, nothing committed (git writes: none). `corner-chat-back`: I wrote nothing there.

**Built (steps 1–8).**
- `src/data/http/api-client.ts` (Bearer header · error body `{error:{code}}` → `ApiError(code,status)` · 401 on a token call → clears the token, tells the guard, throws `SignedOut` · token in Capacitor Preferences) · `auth.ts` (`POST /auth/login`, `GET /me`) · `messages.ts` (`GET /messages` real; `detail`/`correct` stay on the fake until TASK-029) ·
  `repositories.ts` (`AuthRepo`) · `models.ts` (`User`) · `app/config.ts` (read lazily so tests can switch mode).
- `features/signin/**`: `SignInScreen` (email, password, button; REQ-001 wording by `error.code`, any other code → `เกิดข้อผิดพลาด ลองอีกครั้ง`), `RequireAuth` (the guard: no session → `/signin`; a 401 anywhere → `/signin`; a *network* error while checking keeps the user in, offline is TASK-029), `repo.ts` (fake mode has a made-up user, so no sign-in in the fake APK).
- `routes.tsx`: everything except `/signin` sits behind the guard. `main.tsx`: with `VITE_FAKE=false` the list repo is the HTTP one.
- Step 6: cleartext to `10.0.2.2` moved to `android/app/src/debug/res/xml/network_security_config.xml`; `src/main`'s is `<base-config cleartextTrafficPermitted="false" />`. Both files pasted below.
- Step 7: one shared `features/placeholder/TabHeader.tsx` (title + ⋮ + sign-out) used by `Placeholder` and by `/messages`; `messages/TabHeader.tsx` and its CSS deleted. Also moved `Placeholder`'s two inline hex colours to `--adm-color-border`.
- Step 8 (D42): `aboutText()` in `messages/format.ts`, used by the row and the detail. Server and fixtures keep the full form.
- Labels `อีเมล` / `รหัสผ่าน` on the sign-in fields are the PM-confirmed admin sign-in words (REQ-001 Q-SA-1), reused; the TASK gave no app-specific labels. Listed in Questions.

**Evidence**
- `npm run build` → `✓ built in 332ms`, no errors · `npm test` → `Test Files 5 passed (5) · Tests 39 passed (39)` (before this TASK: 28 incl. Fern's; mine 11). New: `signin.test.tsx` 9 (`INVALID_CREDENTIALS` / `ACCOUNT_DISABLED` / `TOO_MANY_ATTEMPTS` / unknown code → each its Thai text and no token kept · right password → token kept → real list · no token → `/signin` · **token survives a reload** · **401 on the list → back at `/signin`, token cleared** · a wrong password (login's 401) is not mistaken for a lost session) and 2 for D42 (`aboutText`: AI line, rule line `[อีเมล · คุณวิภา รัตนชัย] ตรงกฎของคุณ: จากคนนี้ vipa@sender.test` → `ตรงกฎของคุณ: จากคนนี้ vipa@sender.test`, no head unchanged, a `[…]` not at the start unchanged, `null`; and the row).
- **Local back end** (the desk rule): database `corner_chat_app_b` on the team's cluster `:5433` · `bun run migrate` (4 migrations applied) · `bun run dev` on `PORT=8093` · one made-up user through `POST /admin/users` (owner login 200, create 201) · 6 made-up messages from `tests/harness/task-027/seed.sql` (3 notified, 3 held).
  The connection string and passwords were read from `.env` inside the command and never printed or copied (the made-up app user's credentials are in `seed.sql`'s header).
- **Browser, real back end** (`VITE_FAKE=false`, proxy `VITE_PROXY_TARGET=http://127.0.0.1:8093`, Chrome at a real 360×800, `shoot-real.mjs`): no token → `/messages` redirected to `/signin` · wrong password → `อีเมลหรือรหัสผ่านไม่ถูกต้อง`, stayed on `/signin` · right password → `/messages`, token kept, **3 notified rows** (LINE ทีมขายภาคเหนือ · อีเมล บริษัท ภูมิพัฒน์ · LINE โครงการคลังสินค้า, which shows `AI ไม่ได้ตรวจ`) and **3 held rows** (อีเมล ร้านหนังสือมุมสวน · LINE ชมรมวิ่งเช้า · LINE เพื่อนร่วมรุ่น), about lines without their `[…]` head, `hScroll=false`. Screenshots `browser-signin.png` `browser-signin-wrong.png` `browser-list-notified.png` `browser-list-held.png`.
- **Both APKs** (`apk:debug`, gradle `BUILD SUCCESSFUL` for each; JDK 21), in `tests/harness/task-027/`:
  `cornerchat-fake.apk` 4.28 MB (4489027 bytes) SHA-256 `8628b1a0f743a6c18afe7f881673ed89317f52148cb696ca29235fa41bce63a2` (`VITE_FAKE=true`)
  `cornerchat-local.apk` 4.28 MB (4489043 bytes) SHA-256 `20bf5364b23da7d8ee3cf0bd4d234fcc2899e2b3f20078fd61454e1197dedfc4` (`VITE_FAKE=false`, `VITE_API_BASE=http://10.0.2.2:8093/api/v1`). I opened both APKs as zips: the local one contains `10.0.2.2:8093/api/v1`, the fake one does not.
- **Emulator `cc_phone_360`** (`-s emulator-5554`; the real phone `21ec5dd6` was not touched): `adb install -r cornerchat-local.apk` → opens on `/signin` (`apk-signin.png`) → wrong password → the Thai error (`apk-signin-wrong.png`) → right password → the same real list (`apk-list.png`), then the held tab (`apk-list-held.png`). That proves step 6: the debug build still reaches `10.0.2.2:8093` in cleartext.
  `cornerchat-fake.apk` (clean install) → opens on the fake list with no sign-in (`apk-fake-list.png`); the same file is the retake of the blank `task-026/emu-list-notified.png` Silver asked for.
  The emulator shots were taken from the APK builds a few minutes before the final rebuild; the only change since is two inline colours → tokens in `Placeholder.tsx`, so the hashes above are of the final code and the screens are not expected to differ (UNVERIFIED on the emulator for that last build).
- **Both `network_security_config.xml`:** `src/main` = `<network-security-config><base-config cleartextTrafficPermitted="false" /></network-security-config>` · `src/debug` = `<network-security-config><domain-config cleartextTrafficPermitted="true"><domain includeSubdomains="false">10.0.2.2</domain></domain-config></network-security-config>` (comments omitted here).
- **Cleanup:** the dev server stopped (`GET :8093/api/v1/health` → no answer; nothing LISTENING on 8093) · `DROP DATABASE corner_chat_app_b` → `DROP DATABASE`, then `select count(*) from pg_database where datname='corner_chat_app_b'` → `0` · `corner-chat-back` `git status --porcelain`: 9 lines before and 9 after, `diff` empty (all Team A's untracked files, none mine) · emulator stopped · my Chrome test profile and the Vite dev servers stopped.
  Commands: `curl http://127.0.0.1:8093/api/v1/health` · `psql -h 127.0.0.1 -p 5433 -U corner_chat -d postgres -c "DROP DATABASE corner_chat_app_b"`.
- `git status --porcelain` in `corner-chat-app`: `?? .gitignore .oxlintrc.json android/ capacitor.config.ts index.html package-lock.json package.json public/ src/ tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts` (HEAD still `f5e060d`). Detector on `signin`, `placeholder`, `shell`: `[]`. No hex, `transition-all` or `z-index` outside `theme.css`.
- Audit of the new sign-in screen (impeccable detector `[]`; manual, product register): labelled inputs (visible labels, `autocomplete`, 48 px high, 16 px text), error as `role=alert` in text colour (not red-only), button is antd primary `#0958d9`, focus ring on the inputs. P3 left: the error line pushes the button down by one line (a layout shift; I hit it myself while tapping on the emulator): reserve the line or put the error under the button.
- **UNVERIFIED — the owner installs `cornerchat-fake.apk` on his phone** (a real phone is not part of this TASK). `cornerchat-local.apk` on a real phone also needs the back end listening beyond localhost plus a firewall rule (admin): listed for the PM, not done.
- Other: the first launch on the emulator takes ~15 s before the first screen (cold WebView start, debug build); later launches are faster. Not a defect of the app code as far as I can tell, UNVERIFIED on a real phone.

## Questions
Non-blocking, for SA-B.
- **Q1** Field labels on `/signin`: I used `อีเมล` and `รหัสผ่าน` (the PM-confirmed admin-web sign-in words). Please confirm they are also the app's.
- **Q2** The sign-in error line shifts the button down one line when it appears. I left it (copy and layout were not in the TASK). Want it fixed here or in TASK-029?
- **Q3** `detail` and `correct` are still the fake in the `cornerchat-local` APK, so tapping a real row opens the generic error (`เกิดข้อผิดพลาด ลองอีกครั้ง`) by design until TASK-029. Say if you would rather have the detail hidden behind the fake id check.

> answers (Silver, SA-B, 2026-11-01):
> - **Q1** `อีเมล` / `รหัสผ่าน` are confirmed `Interpreted`. They are the PM-approved sign-in words of REQ-001 (Q-SA-1), used for the same fields and the same action. No new copy.
> - **Q2** Fix it in **TASK-028**, step 6 (`signin/**` added to its list). It is Team B's folder and on TASK-029's never-list.
> - **Q3** Keep it as it is. Only the emulator uses `cornerchat-local.apk` until TASK-029 wires the detail. The fake APK, which the owner gets, has a working detail.

## Review
**Verdict: DONE** (Silver, SA-B, 2026-11-01 ~18:50). Reviewed against SPEC-003 rev 2.1, SPEC-001 §3.1–§3.4 and the evidence. I re-ran:
- `npm run build` → `✓ built in 337ms` · `npm test` → `Test Files 5 passed (5) · Tests 39 passed (39)`.
- `sha256sum` of both APKs in `tests/harness/task-027/` → `8628b1a0…63a2` (fake) and `20bf5364…dfc4` (local), **identical** to the Notes.
- `netstat` → nothing listens on 8093 ✓ (the DB drop and its count `0` are pasted by Fanta).
- Both `network_security_config.xml` were read: main = `base-config cleartextTrafficPermitted="false"`, debug = `10.0.2.2` only ✓ (step 6). The emulator list over `10.0.2.2:8093` proves the debug path still works.
- Code read:
  - `api-client.ts`: Bearer only when `auth`; login is `auth:false`, so a wrong password is not a lost session ✓. A 401 → clear the token + broadcast + `SignedOut` ✓. The error code is taken from the body, never `message` ✓.
  - `auth.ts` follows SPEC-001 §3.2 ✓.
  - `RequireAuth` ✓.
  - `aboutText` = `^\[[^\]]*\]\s*` ✓ (D42).
  - No `console.*` in `src` outside tests ✓.
- Screenshot `apk-list.png`: the real seeded rows, about lines without the head, the bar at the bottom ✓.
- **Security pass** (auth, token, transport), done by hand. `/security-review` works on a git diff, and this repo has no commit yet.
  - The token is in Preferences (D-B13, accepted for round 1).
  - It is never logged, never put in a URL, and sent only as a header.
  - Cleartext is debug-only and only to `10.0.2.2`.
  - The made-up user's test password is in `seed.sql` (a workspace harness file, a test value, its DB already dropped).
  - **No HIGH or MEDIUM finding.**
- Low, not REWORK:
  - (a) `RequireAuth` treats any non-`SignedOut` error from `/me` (e.g. a 500) as "in". The server still guards every call, and TASK-029's offline work may revisit it.
  - (b) The list's about line is now one line with an ellipsis (`ผู้ขายส่งใบเสนอราคา…สิ้น…`), while REQ-005 asks only the preview for 2 lines. Fine as it is; noted for the PM's next eye check.
  - (c) The emulator shots come from a build a few minutes before the final one (only two colours changed to tokens). Accepted.
- `UNVERIFIED — the owner installs cornerchat-fake.apk on his phone` (it is in `tests/harness/task-027/`).
