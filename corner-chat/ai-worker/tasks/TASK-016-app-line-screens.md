# TASK-016: LINE screens: link with a code, names list, my groups (fake + HTTP)
- Source: SPEC-003 § Screens (`/channels`, `/channels/line`, `/channels/line/names`, `/channels/line/groups`), § Structure · SPEC-002 § API (shapes exact) · SPEC-001 §3.6/§3.7 (`GET /channels` → `{ mail, line }`, `LineChannel { linked, displayName }`) · REQ-003 req 1, 2, 5, AC-1, AC-5 · REQ-003 wording
- Owner: FE (Fanta)
- Status: SUPERSEDED 2026-11-01 by TASK-028 (owner: not Flutter, DECISIONS D36; SA-B). Was: TODO
- Depends on: TASK-014 · **TASK-024** (re-ordered 2026-11-01 for D35: it writes `api_client.dart`, `AuthRepo` and sign-in, so here you **reuse** `api_client.dart` and add only `http_channels.dart`; drop the `DEV_TOKEN` trick and sign in through `/signin`) · the **live** check needs Bob's TASK-012 + Team A's TASK-002 running locally. Build on the fake first.

- Repo: `corner-chat-app`. Files you may edit:
  - `lib/data/models.dart` (add `Channels`, `MailChannel`, `LineChannel`, `LinkCode`, `LineGroup`)
  - `lib/data/repositories.dart` (`ChannelsRepo`: `channels()`, `newLinkCode()`, `unlinkLine()`, `lineGroups()`, `lineNames()`, `saveLineNames(list)`)
  - `lib/data/fake/fake_channels.dart`, `lib/data/http/api_client.dart` (Bearer + the error body → a typed error with `code`), `lib/data/http/http_channels.dart`
  - `lib/features/channels/**`, `lib/features/line/**`, `lib/app/strings_th.dart`, `lib/app/router.dart`
  - `test/line_screens_test.dart`
- Git writes allowed: **none.**

## What to do
1. `/channels`: the two rows with their states from `channels()`. Zimbra opens its placeholder (TASK-017).
2. `/channels/line`: SPEC-003's row. Not linked → the link wording, the 6-digit code large, a `รหัสหมดอายุใน mm:ss`
   countdown from `expiresAt`, `ขอรหัสใหม่`. Poll `channels()` every 3 s while a code is open; `line.linked` true → stop
   polling, show `เชื่อม LINE แล้ว` + `displayName`, links to names and groups, `เลิกเชื่อม` (confirm, then `unlinkLine()`).
   Code expired → the code is greyed and only `ขอรหัสใหม่` remains.
3. `/channels/line/names`: list, an add field, delete per row; every change saves the whole list with `saveLineNames`.
   400 `VALIDATION` → `เกิดข้อผิดพลาด ลองอีกครั้ง` (no new wording invented). Empty → the empty text (SPEC-003 § Wording).
4. `/channels/line/groups`: name + Thai "last seen" time per row; empty text (SPEC-003 § Wording); the one-OA-per-group help text
   (REQ-003 wording) always visible under the list (AC-5).
5. Fake: starts not linked; the 3rd poll after a code turns linked (`displayName: "เอ"`). HTTP: exactly SPEC-002/SPEC-001 paths
   and keys. `api_client.dart` is shared later by TASK-017. It maps 401 → a `SignedOut` error that the router turns into
   `/signin`.

## Definition of Done (paste real output)
- [ ] `flutter analyze` clean · `flutter test test/line_screens_test.dart` green: fake flow code → linked after polling ·
      countdown reaches 00:00 → only the new-code button · names add/delete calls `saveLineNames` with the full list ·
      groups empty state + help text present.
- [ ] Screenshots (FAKE, `cc_phone_360`) → `../ai-worker/tests/harness/task-016/`: `channels.png`, `line-code.png`,
      `line-linked.png`, `line-names.png`, `line-groups.png`, `line-groups-empty.png`.
- [ ] **Live, local** (only when TASK-012 and TASK-002 run on this machine; else `UNVERIFIED — needs TASK-012 + TASK-002`):
      `--dart-define=FAKE=false` plus `--dart-define=DEV_TOKEN=<token>`: a token you get yourself with
      `curl -s -X POST http://127.0.0.1:8080/api/v1/auth/login` for a **made-up** local user (no sign-in screen yet;
      `DEV_TOKEN` is read only in debug builds and removed in TASK-017). Get a code, write it in `## Questions`, and the
      SA sends it through `send-event.ts` (the back repo is not yours) → the screen turns `เชื่อม LINE แล้ว`. Screenshot.
- [ ] `git status --porcelain` → only listed files.

## Implementation Notes

## Questions

## Review
