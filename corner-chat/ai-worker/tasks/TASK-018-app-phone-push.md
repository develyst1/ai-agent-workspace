# TASK-018: Phone push: permission once, device registration, foreground display, tap → message detail
- Source: SPEC-003 § Behaviour (Push), § Non-functional (`google-services.json` git-ignored) · SPEC-001 §3.8 (`PUT /devices`, `DELETE /devices/:fcmToken`, the payload) · REQ-005 req 3, AC-2, amendment (permission once, sign-out unregisters) · REQ-005 wording (notifications refused hint)
- Owner: FE (Fanta)
- Status: SUPERSEDED 2026-11-01 by TASK-030 (owner: not Flutter, DECISIONS D36; SA-B). Was: TODO (code + fake checks can run) · the live AC-2 check is **BLOCKED on B3** (the owner's Firebase project → `android/app/google-services.json`)
- Depends on: TASK-017 · live: B3 + Team A's TASK-007

- Repo: `corner-chat-app`. Files you may edit:
  - `pubspec.yaml`, `pubspec.lock` (add `firebase_core`, `firebase_messaging`, `flutter_local_notifications` only)
  - `android/app/build.gradle*`, `android/settings.gradle*`, `android/build.gradle*` (the google-services plugin), `android/app/src/main/AndroidManifest.xml` (`POST_NOTIFICATIONS`, the default channel)
  - `.gitignore` (add `android/app/google-services.json`)
  - `lib/push/**`, `lib/data/http/http_devices.dart`, `lib/data/fake/fake_devices.dart`, `lib/data/repositories.dart` (`DeviceRepo`), `lib/main.dart`, `lib/app/router.dart`, `lib/features/messages/**` (the refused hint only)
  - `test/push_test.dart`
- Git writes allowed: **none.**

## What to do
1. Firebase init only when `google-services.json` exists. Without it the app runs, logs `push: not configured`, and
   `DeviceRepo` is a no-op. That is the state until B3.
2. First sign-in only (a flag in `shared_preferences`): request `POST_NOTIFICATIONS`. Denied → the hint
   `ปิดการแจ้งเตือนอยู่ จะไม่เห็นข้อความใหม่จนกว่าจะเปิด · แตะเพื่อเปิด` on the message list; a tap opens the app's
   notification settings. Never ask again from the app itself.
3. After sign-in and on `onTokenRefresh`: `PUT /devices { "fcmToken", "platform": "android" }`. Sign-out (TASK-017's
   hook): `DELETE /devices/:fcmToken` first.
4. Foreground message → a local notification with the same `notification.title` / `body`, then reload the list.
5. Tap (background, terminated, or local) with `data.type == "message"` → `/messages/{data.messageId}`, through
   sign-in if no token.

## Definition of Done (paste real output)
- [ ] `flutter analyze` clean · `flutter test test/push_test.dart` green: the tap payload routes to `/messages/<id>` ·
      a non-`message` type is ignored · sign-out calls `DELETE /devices/<token>` before logout (fake repo) ·
      no `google-services.json` → no crash, `DeviceRepo` no-op.
- [ ] `flutter build apk --debug` succeeds **without** `google-services.json` (paste).
- [ ] Permission: first sign-in on the emulator asks once; deny → the hint shows; sign out and in again → not asked again (screenshots → `../ai-worker/tests/harness/task-018/`).
- [ ] **Live AC-2** (only with B3 + Team A's TASK-007 running): an `always` rule + an ingested message for U1 → the
      notification shows within 1 minute (time it) and the tap opens that message. Else `UNVERIFIED — needs B3 + TASK-007`.
- [ ] `git status --porcelain` → only listed paths; `google-services.json` is **not** listed (git-ignored).

## Implementation Notes

## Questions

## Review
