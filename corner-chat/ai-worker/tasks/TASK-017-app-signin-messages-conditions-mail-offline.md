# TASK-017: Sign-in, sign-out, real messages + detail + correction + mail reply, conditions, Zimbra connect, offline
- Source: SPEC-003 § Screens (`/signin`, `/messages*`, `/conditions`, `/channels/zimbra`), § Behaviour (session, sign-out, refresh, offline) · SPEC-001 §3.1–§3.6 (paths, keys, error codes exact) · REQ-005 req 2, 4, 5, AC-3, AC-4, AC-5, AC-6 · REQ-001/002/004 wording
- Owner: FE (**Fern, Team A**). Moved by the PM 2026-11-01 (`DECISIONS.md`, D30). The reviewer is **Sober** (SA, Team A). SPEC-003's owner stays Silver (SA, Team B); questions go Fern → Sober → PM → Silver.
- Status: SUPERSEDED 2026-11-01 by TASK-029 (owner: not Flutter, DECISIONS D36; SA-B). Was: TODO
- Depends on: **TASK-015, TASK-024 and TASK-016 DONE first** (they write the shared `models.dart`, `repositories.dart`, `api_client.dart`, `router.dart`). Fern installs nothing: she uses TASK-014's toolchain (`machine.local.md`) · live checks need Team A's TASK-002 (auth), TASK-005 (messages, conditions), TASK-004 (replies), TASK-003 (mail connect) running locally. Each live check whose server part is missing is written `UNVERIFIED — needs TASK-00N`; the fake checks still run.

- Repo: `corner-chat-app`. Files you may edit:
  - **Never** (Team B's, `DECISIONS.md` D30): `lib/features/line/**`, `lib/features/channels/**`, `lib/data/http/http_channels.dart`, `lib/data/fake/fake_channels.dart`, `lib/push/**`, `android/**`
  - `lib/data/models.dart`, `lib/data/repositories.dart` (add, don't change TASK-015/016's classes), `lib/data/fake/**` and `lib/data/http/**` except the two channel files above
  - `lib/features/signin/**`, `lib/features/messages/**`, `lib/features/message_detail/**`, `lib/features/reply/**`,
    `lib/features/conditions/**`, `lib/features/zimbra/**`, `lib/features/shell/**` (offline banner, sign-out)
  - `lib/app/**`, `test/**`
- Git writes allowed: **none.**

## What to do
1. ~~Sign-in, `AuthRepo` login/me, the router redirect, the real message **list**~~: **done in TASK-024** (re-ordered
   2026-11-01 for D35). Here: add `POST /auth/logout` to `AuthRepo` for step 2. Reuse `api_client.dart` /
   `http_messages.dart` and extend them with detail, correction and replies. Do not change `lib/features/signin/**`
   except a bug you report first.
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
