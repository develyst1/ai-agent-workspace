# TASK-017: Sign-in, sign-out, real messages + detail + correction + mail reply, conditions, Zimbra connect, offline
- Source: SPEC-003 § Screens (`/signin`, `/messages*`, `/conditions`, `/channels/zimbra`), § Behaviour (session, sign-out, refresh, offline) · SPEC-001 §3.1–§3.6 (paths, keys, error codes exact) · REQ-005 req 2, 4, 5, AC-3, AC-4, AC-5, AC-6 · REQ-001/002/004 wording
- Owner: FE (Fanta)
- Status: TODO
- Depends on: TASK-015, TASK-016 (`api_client.dart`) · live checks need Team A's TASK-002 (auth), TASK-005 (messages, conditions), TASK-004 (replies), TASK-003 (mail connect) running locally. Each live check whose server part is missing is written `UNVERIFIED — needs TASK-00N`; the fake checks still run.

- Repo: `corner-chat-app`. Files you may edit:
  - `lib/data/models.dart`, `lib/data/repositories.dart`, `lib/data/fake/**`, `lib/data/http/**`
  - `lib/features/signin/**`, `lib/features/messages/**`, `lib/features/message_detail/**`, `lib/features/reply/**`,
    `lib/features/conditions/**`, `lib/features/zimbra/**`, `lib/features/shell/**` (offline banner, sign-out)
  - `lib/app/**`, `test/**`
- Git writes allowed: **none.**

## What to do
1. `AuthRepo` (`POST /auth/login`, `POST /auth/logout`, `GET /me`); the token in `flutter_secure_storage`; the router redirect;
   401 anywhere → `/signin`. Sign-in error codes → REQ-001 wording; `TOO_MANY_ATTEMPTS` → `ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่`.
2. Sign-out per SPEC-003 § Behaviour: `DeviceRepo.unregister()` first (a no-op until TASK-018 has a token), then logout,
   then clear the token + the offline cache.
3. HTTP `MessagesRepo` against §3.4: list/paging/tab/channel, detail, correction. Reply screen against `POST
   /messages/:id/replies` + `POST /replies/:id/retry`, polling the detail every 3 s up to 1 min while a reply is
   `queued`/`sending`; `NOT_MAIL`, `MAIL_NOT_CONNECTED` → `เกิดข้อผิดพลาด ลองอีกครั้ง`; `failed` → `ส่งไม่สำเร็จ ลองอีกครั้ง` + retry.
4. `/conditions` against §3.5: sentences + bar (slider, label `แจ้งเมื่อตรงเงื่อนไขตั้งแต่ {n}%`, save), rules list, add (kind,
   value, action; a `group` rule picks from `lineGroups()`), delete, `RULE_EXISTS` → the generic error. Detail menu
   `เพิ่มกฎจากผู้ส่งนี้` → an add-rule sheet with `kind: sender`, `value: sender.key` filled in.
5. `/channels/zimbra` against §3.6: connect (`PUT`), states, `MAIL_LOGIN_FAILED` → `เชื่อมไม่สำเร็จ ตรวจอีเมลหรือรหัสผ่านอีกครั้ง`,
   `MAIL_SERVER_UNREACHABLE` → the generic error, disconnect `เลิกเชื่อม`. The password field is never pre-filled or stored.
6. Offline per SPEC-003: cache the first page per (tab, channel); banner; reload on reconnect; reload on app resume.

## Definition of Done (paste real output)
- [ ] `flutter analyze` clean · `flutter test` green, including: login error codes → the right Thai · 401 → `/signin` ·
      sign-out calls unregister → logout in that order · offline: with the fake network down, the banner + the cached list
      show; back up → reload · reply `failed` → retry button.
- [ ] **Live, local** (emulator, `FAKE=false`, Team A's server running; made-up users U1/U2 the owner-seed creates):
  - sign in as U1 → the list matches `curl /api/v1/messages?tab=notified` with U1's token (paste both);
  - **AC-3:** a held message shows in `ไม่ได้แจ้ง` with its reason; correcting it to `แจ้ง` moves it (screenshot + the `corrections` row);
  - **AC-6:** sign in as U2 → none of U1's messages, rules or channels (screenshots of all three tabs for both users);
  - **AC-5:** emulator airplane mode → banner + last list; off → refresh works (screenshots);
  - conditions: change the bar to 80 → `GET /conditions` shows 80 (paste);
  - mail reply: only with B2 test mailboxes; else `UNVERIFIED — needs B2`.
- [ ] **AC-4 walk:** every route of SPEC-003 reached from the app's own navigation at 360 dp, as a table in Notes
      (route → how reached → screenshot file). Screenshots → `../ai-worker/tests/harness/task-017/`.
- [ ] `git status --porcelain` → only listed paths.

## Implementation Notes

## Questions

## Review
