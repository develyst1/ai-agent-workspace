# SPEC-003: Android app (Team B)
- Source: REQ-005 (as amended 2026-11-01). It also surfaces REQ-001 (sign-in), REQ-002 (mail), REQ-003 (LINE) and REQ-004 (conditions/decisions).
- Team: B (SA Silver) · API = **SPEC-001 §3** (Team A) + **SPEC-002 §API** (Team B). This SPEC adds no endpoint.
- Status: ACTIVE — 2026-11-01

## What I read
- REQ-005 (58 lines, incl. the 2026-11-01 amendment and the notifications-refused wording), REQ-001…004 wording tables,
  `SYSTEM-FACTS.md`, `DECISIONS.md`, `decisions-for-owner-review.md` (D9–D16, B3).
- SPEC-001 §3.1–§3.8 (every endpoint the app calls, the push payload), §8 B8. SPEC-002 §API.
- `corner-chat-app`: README only, `f5e060d Initial commit`, on `main` (`git log`, 2026-11-01).
- **This machine has no Android toolchain** (checked 2026-11-01 02:30: `flutter`, `dart`, `java`, `adb`, `sdkmanager`,
  `gradle` not on PATH; no `%LOCALAPPDATA%\Android`, no `C:\flutter`; SPEC-001 §2 found the same). Free disk: H: 107 GB,
  C: 37 GB.

## Stack — Flutter (SPEC-001 S8, agreed) and what it is built from `[SA-decided 2026-11-01]`
- Flutter stable, Dart, **Android only** in round 1. applicationId **`com.develyst.cornerchat`** (`D-B8`: hard to change after
  the first install), label `corner-chat`, `minSdk 24`, `targetSdk` = the newest the installed SDK offers. Portrait, phone
  only, Thai only (D15).
- Packages, each pinned to the version resolved at scaffold time and recorded in the TASK: `go_router`, `provider` (plain
  `ChangeNotifier`s), `http`, `flutter_secure_storage` (token), `shared_preferences` (offline cache), `connectivity_plus`,
  `intl` (Thai dates). The push TASK adds `firebase_core`, `firebase_messaging`, `flutter_local_notifications`.
  Nothing else without asking the SA.
- **Toolchain (B8, `D-B9`):** Flutter SDK, JDK 17 (Temurin zip), Android command-line tools, platform + build-tools,
  and one emulator image (API 34, x86_64). All are unpacked under **`H:\dev-tools\`** with **no installer that needs
  admin**. PATH is changed for the user only. A step that raises a UAC prompt, or needs the BIOS virtualisation switch
  for the emulator → stop, BLOCKED (owner's machine). **Settled by the PM** (B9 → D28, SPEC-001 § Questions "PM on
  §8", 2026-11-01): user-level, official sources only, no admin, no system-wide change, paths in `machine.local.md`.

## Structure (`corner-chat-app`)
```
lib/
  main.dart                     start, theme, router, picks real or fake repos
  app/router.dart               the routes below + the sign-in redirect
  app/strings_th.dart           EVERY user-facing string (REQ wording tables + §Wording below). No Thai literal in a widget.
  app/theme.dart                Material 3, one seed colour, system font
  app/config.dart               API_BASE + FAKE from --dart-define
  data/models.dart              Dart classes for SPEC-001 §3 / SPEC-002 JSON; fromJson keys = the exact camelCase names
  data/repositories.dart        abstract: AuthRepo, MessagesRepo, ConditionsRepo, ChannelsRepo (mail + line), DeviceRepo
  data/fake/                    in-memory fakes with made-up Thai fixtures (never real data)
  data/http/                    real implementations; one ApiClient adds the Bearer token, maps the error body's `code`
  features/<screen>/            one folder per screen: the widget + its ChangeNotifier
test/                           widget + model tests against the fakes
```
- **Run modes:** `--dart-define=FAKE=true` → fakes, no server. `--dart-define=API_BASE=http://10.0.2.2:8080/api/v1` →
  the local back end seen from the emulator (`10.0.2.2` = the host). There is **no other base URL**: the app never points
  at anything but local (FE.md). Debug builds allow cleartext to `10.0.2.2` only (`network_security_config.xml`).
  ⇒ REQ-003 testability (f).
- Errors: show the Thai text chosen by `error.code` (SPEC-001 §3.1), never `error.message`. An unknown code →
  `เกิดข้อผิดพลาด ลองอีกครั้ง`.

## Screens and navigation (REQ-005 req 2, AC-4)
| Route | Screen | Calls |
|---|---|---|
| `/signin` | title `เข้าสู่ระบบ corner-chat`, email, password, button `เข้าสู่ระบบ`. Codes → REQ-001 wording: `INVALID_CREDENTIALS` · `ACCOUNT_DISABLED` · `TOO_MANY_ATTEMPTS` | `POST /auth/login` |
| `/messages` | tabs **แจ้งแล้ว** (`tab=notified`) / **ไม่ได้แจ้ง** (`tab=held`); chips **ทั้งหมด · อีเมล · LINE** (`channel` absent/`mail`/`line`); pull to refresh; scroll to the end loads `nextCursor`; empty texts per tab; offline banner; notifications-refused hint | `GET /messages` |
| `/messages/:id` | header: channel label + `groupName` or sender name + Thai time; `aboutLine` (or `AI ไม่ได้ตรวจ`); `subject` (mail); Cc marker `สำเนาถึงคุณ` when `recipientKind` is `cc`/`list`; `มีไฟล์แนบ: {names}`; the full `text`; a **why** card: `ทำไมถึงแจ้ง`/`ทำไมไม่แจ้ง`, `decision.reason`, `ตรงเงื่อนไข {score}%` · `เกณฑ์ {bar}%` (when `score` is not null), `ตัดสินโดย: กฎของคุณ`/`AI`/`AI ไม่ได้ตรวจ`, `โมเดล: {layer1.model} / {layer2.model}` (when present); the correct button: `แจ้ง` on a held message, `ไม่ต้องแจ้ง` on a notified one; **ตอบกลับ** (mail only) + the list of replies with their status | `GET /messages/:id`, `POST /messages/:id/correction` |
| `/messages/:id/reply` | body field, send; then `ส่งแล้ว` / `ส่งไม่สำเร็จ ลองอีกครั้ง` with retry | `POST /messages/:id/replies`, `POST /replies/:id/retry`, re-`GET` the detail every 3 s while a reply is `queued`/`sending` (≤ 1 min) |
| `/conditions` | `เงื่อนไขของฉัน`: sentences (hint from REQ-004), bar slider 0–100 with `แจ้งเมื่อตรงเงื่อนไขตั้งแต่ {n}%`, save; rules list (kind label `จากคนนี้` · `มีคำว่า` · `จากกลุ่มนี้`, value, `แจ้งเสมอ`/`ไม่ต้องแจ้ง`), add, delete. A `group` rule picks from the LINE groups list. A `sender` rule is added from a message detail (menu `เพิ่มกฎจากผู้ส่งนี้`) | `GET /conditions`, `PUT /conditions/settings`, `POST/DELETE /conditions/rules` |
| `/channels` | `ช่องทาง`: rows `อีเมล Zimbra` and `LINE`, each with its state (`เชื่อมแล้ว` / not) | `GET /channels` |
| `/channels/zimbra` | `เชื่อมอีเมล Zimbra`: email, password, connect; connected → email + `เลิกเชื่อม`. `MAIL_LOGIN_FAILED` → `เชื่อมไม่สำเร็จ ตรวจอีเมลหรือรหัสผ่านอีกครั้ง` | `PUT/DELETE /channels/mail` |
| `/channels/line` | not linked: `เชื่อม LINE: เพิ่มเพื่อน corner-chat แล้วส่งรหัสนี้ในแชต`, the code large, countdown, `ขอรหัสใหม่`; polls `GET /channels` every 3 s while a code is open → linked: `เชื่อม LINE แล้ว` + display name, links to names and groups, `เลิกเชื่อม` | SPEC-002: `POST /channels/line/link-code`, `DELETE /channels/line`; `GET /channels` |
| `/channels/line/names` | `ชื่อที่ใช้เรียกคุณ (ใส่ชื่อเล่นได้หลายชื่อ)`: list, add, delete; saves the whole list | SPEC-002: `GET/PUT /channels/line/names` |
| `/channels/line/groups` | the user's groups (name, last seen); empty state; the help text `กลุ่มหนึ่งใส่บัญชีทางการได้แค่ตัวเดียว ถ้ากลุ่มมีบอทอื่นอยู่แล้ว จะเพิ่ม corner-chat ไม่ได้` always shown (REQ-003 AC-5) | SPEC-002: `GET /channels/line/groups` |

Navigation: a bottom `NavigationBar` with **ข้อความ · เงื่อนไขของฉัน · ช่องทาง**. **ออกจากระบบ** sits in the app-bar
overflow menu on those three, with the confirm `ออกจากระบบไหม`. Every other screen has a back arrow. Nothing is a dead
end at 360 dp wide (AC-4) `[SA-decided; D-B10]`.

## Behaviour
- **Session:** the token lives in secure storage. Not signed in → every route redirects to `/signin`. A 401 from any
  call → clear the token, go to `/signin`.
- **Sign-out (REQ-005 amendment):** `DELETE /devices/:fcmToken` **first**, then `POST /auth/logout`, then clear the
  token and the offline cache. A failed device delete still signs out locally and is logged.
- **Refresh (req 4):** pull to refresh; reload when the app comes to the foreground; reload when a push arrives while open.
- **Offline (req 5, AC-5):** the first page of each tab/channel view is saved after each successful load
  (`shared_preferences`, JSON). No network (`connectivity_plus`, or a socket error) → banner
  `ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด` + the saved list. Back online → the banner goes and the list reloads.
- **Push (req 3, AC-2; payload SPEC-001 §3.8):** the notification permission is asked **once, at the first sign-in**
  (Android 13+ `POST_NOTIFICATIONS`). Refused → the hint `ปิดการแจ้งเตือนอยู่ … · แตะเพื่อเปิด` shows on the message list,
  and a tap opens the system settings. After sign-in: `PUT /devices { fcmToken, platform:"android" }`, again on token
  refresh. In the background the system shows FCM's `notification`. In the foreground a local notification is shown with
  the same title/body. Tap, with `data.type == "message"` → `/messages/{data.messageId}` (sign-in first if needed).
- Dates: `d MMM HH:mm`, Thai locale, Asia/Bangkok.

## Wording not in the REQs — SA drafts, marked `DRAFT` in `strings_th.dart` until the PM confirms (Questions Q1)
`เข้าสู่ระบบ` (button) · `รหัสหมดอายุใน {mm:ss}` · `ขอรหัสใหม่` · `ยังไม่มีชื่อ เพิ่มชื่อหรือชื่อเล่นที่เพื่อนใช้เรียกคุณ` ·
`ยังไม่มีกลุ่ม เพิ่ม corner-chat เข้ากลุ่มไลน์ของคุณ แล้วกลุ่มจะขึ้นที่นี่` · `เกิดข้อผิดพลาด ลองอีกครั้ง` · `ตรงเงื่อนไข {n}%` ·
`เกณฑ์ {n}%` · `ตัดสินโดย: {กฎของคุณ|AI|AI ไม่ได้ตรวจ}` · `โมเดล: {a} / {b}` · `เพิ่มกฎจากผู้ส่งนี้` · `บันทึก` · `เพิ่ม` · `ลบ` ·
`ยกเลิก` · `ทั้งหมด` · `อีเมล` · `กำลังส่ง`.

## Non-functional
- 360×800 dp emulator, Android 7.0 (API 24)+. No secrets in the repo. `android/app/google-services.json` is git-ignored
  (B3 file, owner-provided).
- Never log tokens, passwords, or message text.

## AC coverage (REQ-005)
| AC | Carried by | Note |
|---|---|---|
| AC-1 comp (list + detail) | TASK-015 | the PM checks it; screenshots in the TASK |
| AC-2 push within 1 min, tap opens | TASK-018 (app) · Team A TASK-007 (server) | live: B3 |
| AC-3 tabs with reasons | TASK-015 (UI) · TASK-017 (real API) | |
| AC-4 every screen reachable at 360 dp | TASK-014 (shell) · TASK-016/017 (screens) · TASK-017 DoD walk | |
| AC-5 offline | TASK-017 | |
| AC-6 isolation via the app | TASK-017 (two users on the local back end) | the server's 404 rule is Team A's |
| REQ-003 AC-1/5, req 2/5 | TASK-016 | |

## Tasks
- TASK-014: toolchain on this machine + Flutter scaffold + navigation shell (all routes as placeholders) — owner: FE Fanta (depends on: none)
- TASK-015: message list + message detail comp on fakes (REQ-005 AC-1) — owner: FE Fanta (depends on: TASK-014)
- TASK-016: LINE screens (link, names, groups) on a fake repo shaped as SPEC-002 + its HTTP impl — owner: FE Fanta (depends on: TASK-014; live: TASK-012)
- TASK-017: sign-in, sign-out, real messages/detail/correction/reply, conditions, Zimbra, offline — owner: FE Fanta (depends on: TASK-015; live: Team A TASK-002, -004, -005, mail live -003)
- TASK-018: phone push: permission, device registration, tap → detail — owner: FE Fanta (depends on: TASK-017; live: B3 + Team A TASK-007)

## Decisions to list for the owner (the PM adds them to `decisions-for-owner-review.md`)
- **D-B8** Android package id `com.develyst.cornerchat`. It is hard to change after the first install.
- ~~D-B9~~ toolchain install: already listed by the PM as **D28**. The detail here is `H:\dev-tools\`, about 10 GB.
- **D-B10** Three bottom tabs (ข้อความ · เงื่อนไขของฉัน · ช่องทาง). Sign-out sits in the top-right menu.
- **D-B11** The app only ever talks to the local back end in round 1 (no deploy, D16). A phone needs the same Wi-Fi
  plus a debug build with the PC's address. The emulator is the default.

## Questions
- **Q1 (for the PM, UX writer):** confirm or replace the draft strings in § Wording. The FE ships them marked `DRAFT`
  until then. Not blocking.
  > answer `[PM, UX writer, 2026-11-01]`: **all confirmed as written** — drop the `DRAFT` marks. No changes.
