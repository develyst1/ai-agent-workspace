# TASK-024: App milestone 1: an installable APK with real sign-in + the real message list
- Source: `DECISIONS.md` 2026-11-01 D35 (the owner: *"อะไรก็ได้ ง่ายๆ ที่แค่ ลงเครื่อง android ได้ก่อนก็พอ"*, PM-decided: Flutter, APK first, sign-in + message list) · SPEC-003 § Screens (`/signin`, `/messages`), § Structure (run modes), § Behaviour (session) · SPEC-001 §3.1, §3.2, §3.4 (`POST /auth/login`, `GET /me`, `GET /messages`: paths, keys, error codes exact) · REQ-005 req 1, 2 · REQ-001 wording
- Owner: FE (Fanta)
- Status: SUPERSEDED 2026-11-01 by TASK-027 (owner: not Flutter, DECISIONS D36; SA-B). Was: TODO
- Depends on: **TASK-014** (scaffold) and **TASK-015** (list screen + models on fakes). It comes **before** TASK-016, which now reuses this TASK's `api_client.dart`.
  Team A's TASK-002 (auth) and TASK-005 (messages) are DONE, so the server side exists.

- Repo: `corner-chat-app`. Files you may edit:
  - `lib/data/http/api_client.dart` (Bearer header; the error body `{error:{code}}` → a typed `ApiError(code)`; 401 → `SignedOut`)
  - `lib/data/http/http_auth.dart`, `lib/data/http/http_messages.dart` (list only: `GET /messages`; detail stays on the fake until TASK-017)
  - `lib/data/repositories.dart` (add `AuthRepo`; `MessagesRepo` already exists from TASK-015, don't change its signature)
  - `lib/data/models.dart` (add `User` per SPEC-001 §3.2 only)
  - `lib/features/signin/**`, `lib/app/router.dart` (the sign-in redirect), `lib/app/config.dart`, `lib/app/strings_th.dart`, `lib/main.dart`
  - `test/signin_test.dart`
  - outside the repo: `../ai-worker/tests/harness/task-024/**` (the seed SQL + screenshots); **never** `corner-chat-back`
- Git writes allowed: **none.**

## What to do
1. `api_client.dart` + `http_auth.dart`: `POST /auth/login` → keep `token` in `flutter_secure_storage`; `GET /me` at app start
   to check it. Not signed in → every route redirects to `/signin`; 401 anywhere → clear the token and go to `/signin`.
2. `/signin`: title `เข้าสู่ระบบ corner-chat`, email, password, button `เข้าสู่ระบบ`. Error code → REQ-001 wording:
   `INVALID_CREDENTIALS` → `อีเมลหรือรหัสผ่านไม่ถูกต้อง` · `ACCOUNT_DISABLED` → `บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล` ·
   `TOO_MANY_ATTEMPTS` → `ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่` · anything else → `เกิดข้อผิดพลาด ลองอีกครั้ง`.
3. `http_messages.dart`: `GET /messages?tab=notified|held&channel=…&before=…&limit=30`, parsed into TASK-015's
   `MessageSummary`. With `FAKE=false`, the list screen uses it. Tapping a row may still open the fake detail (TASK-017 wires the real one).
4. Two APKs, both **debug** builds (no signing setup):
   - **`cornerchat-fake.apk`**: `--dart-define=FAKE=true`. It runs on any phone with no server, so the owner can install it and look (D35).
   - **`cornerchat-local.apk`**: `--dart-define=FAKE=false --dart-define=API_BASE=http://10.0.2.2:<port>/api/v1`, for the emulator against the local back end.
   Copy both to `../ai-worker/tests/harness/task-024/` and write their sizes and SHA-256 in Notes.
5. The local back end, by the desk rule (`DECISIONS.md` 2026-11-01, one dev server per database, its own port, stopped
   when done). **You run it, you write nothing in it:**
   - create a private database `corner_chat_app_b` on the team's local cluster (:5433; the connection details are in
     `corner-chat-back/.env` and are not to be copied anywhere);
   - in `corner-chat-back`: `DATABASE_URL=<…/corner_chat_app_b> PORT=8093 bun run migrate`, then the same prefix + `bun run dev`;
   - create one **made-up** user through the admin API (`POST /api/v1/admin/users`, with the owner token from `POST /auth/login`
     and the owner seed in that `.env`);
   - load a few **made-up** messages for that user with a seed file you write at `../ai-worker/tests/harness/task-024/seed.sql`
     (plain `INSERT`s into `messages` + `decisions`, columns per SPEC-001 §5; only on `corner_chat_app_b`);
   - stop the server and drop the database when done (paste both commands).
   LINE stays fail-closed (empty token). Do not set any real token.

## Definition of Done (paste real output)
- [ ] `flutter analyze` → `No issues found!` · `flutter test` green, including `signin_test.dart`: each error code → its Thai
      text · 401 → back at `/signin` · token kept after a restart (fake secure storage).
- [ ] Both APKs built (paste the `flutter build apk` tail lines, sizes, SHA-256).
- [ ] **On `cc_phone_360`:** `adb install cornerchat-local.apk` → open → sign in as the made-up user → the **real** list shows
      the seeded messages in `แจ้งแล้ว` and `ไม่ได้แจ้ง`. A wrong password shows `อีเมลหรือรหัสผ่านไม่ถูกต้อง`.
      Screenshots → `../ai-worker/tests/harness/task-024/`: `signin.png`, `signin-wrong.png`, `list-notified.png`, `list-held.png`.
- [ ] `adb install cornerchat-fake.apk` on the emulator too → it opens and shows the fake list (one screenshot).
- [ ] A real phone is **not** part of this TASK. Write `UNVERIFIED — the owner installs cornerchat-fake.apk on his phone`.
      `cornerchat-local.apk` on a real phone also needs the back end listening beyond localhost plus a firewall rule (admin) → listed for the PM, not done.
- [ ] The server stopped, `corner_chat_app_b` dropped, and `git status --porcelain` in `corner-chat-back` unchanged by you (paste before/after).
- [ ] `git status --porcelain` in `corner-chat-app` → only listed files.

## Implementation Notes

## Questions

## Review
