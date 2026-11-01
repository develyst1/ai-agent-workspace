# REQ-005: The user does everything in an Android app, with a notification for every passed message
- Status: READY_FOR_SA
- Priority: HIGH `[team-proposed]`
- Requested: 2026-11-01 by the owner — stamp: operator (shape) · operator-delegated (details)
- Deadline: none
- Depends on: REQ-001 (sign-in) · surfaces REQ-002, REQ-003, REQ-004 — builds against the API contract in SPEC-001
- Source: `SYSTEM-FACTS.md` ("ทำแอปด้วย", app does everything, "Android ก่อน IOS ทีหลัง", "ทั้งสองทุกครั้ง")

## Problem / Goal
Users live on their phones; corner-chat must reach them there and let them act there.
> "ทำแอปด้วย" · "ใช่" (users do everything in the app; web = owner admin only) · "Android ก่อน IOS ทีหลัง" (operator, 2026-11-01)

## Requirement
1. Android app in `corner-chat-app`; installed directly (APK / Play internal testing) in round 1 `[D11]`. Thai only `[D15]`.
2. Screens: sign-in (REQ-001) · message list with two tabs **แจ้งแล้ว / ไม่ได้แจ้ง**, filter by channel · message detail
   with the full text, the about line, the % and reason, and correct buttons (REQ-004) · mail reply (REQ-002) ·
   my conditions + bar (REQ-004) · connect Zimbra (REQ-002) · link LINE + names list + my groups (REQ-003) · sign out.
3. Every passed message raises a **phone notification** (about line + first 2 lines); tapping it opens that message's detail.
4. The list shows new messages without the user restarting the app (pull to refresh at least).
5. With no network the app says so and keeps what it already showed.

## Acceptance Criteria
- [ ] **AC-1** — **Given** a one-screen comp of the message list and the message detail, shown before the full build,
  **When** the PM looks at it against this REQ **Then** every element of requirement 2 for those two screens is there.
  - Check: PM (the owner's eye check is listed for his review, not a gate — standing instruction 2026-11-01).
- [ ] **AC-2** — **Given** a signed-in user **When** a message passes REQ-004 **Then** the phone shows a notification within 1 minute, and tapping it opens that message.
  - Check: QA — emulator or device with push (B3).
- [ ] **AC-3** — held messages are in "ไม่ได้แจ้ง" with their reason; passed in "แจ้งแล้ว".
  - Check: QA.
- [ ] **AC-4** — every screen in requirement 2 is reachable from the app's own navigation (no dead ends), at a 360 px wide phone.
  - Check: QA — walk every screen.
- [ ] **AC-5** — airplane mode → the app shows the offline wording and the last list; back online → refresh works.
  - Check: QA.
- [ ] **AC-6** — regression: REQ-001 AC-3 isolation holds through the app (U1's app never shows U2's data).
  - Check: QA.

## User-facing wording
| Where | TH |
|---|---|
| Tabs | แจ้งแล้ว · ไม่ได้แจ้ง |
| Empty: แจ้งแล้ว | ยังไม่มีข้อความที่ต้องแจ้ง |
| Empty: ไม่ได้แจ้ง | ยังไม่มีข้อความที่ถูกกรองออก |
| Offline | ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด |
| Menu items | ข้อความ · เงื่อนไขของฉัน · ช่องทาง · ออกจากระบบ |
| Channels screen | ช่องทาง: อีเมล Zimbra · LINE |
| Sign out confirm | ออกจากระบบไหม |
| Notifications refused (one-line hint on the list) | ปิดการแจ้งเตือนอยู่ จะไม่เห็นข้อความใหม่จนกว่าจะเปิด · แตะเพื่อเปิด |

**Amended 2026-11-01 by the PM** (from Tefany's TEST-005 Q1/Q2, PM-decided): sign-out unregisters the device so no
notification of the signed-out user reaches it; notification permission is asked once at first sign-in.

## Constraints
- Push via Firebase (B3, owner-provided). App stack: the SA's call in SPEC-001 (`PROTOCOL.md`). FE writes it (Atlas 2026-11-01).

## Out of Scope
iOS · public Play listing · English · tablet layouts · auto-reply screens · Discord / Web Chat / Teams.

## Questions
