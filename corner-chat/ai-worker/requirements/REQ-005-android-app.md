# REQ-005: The user does everything in an Android app, with a notification for every passed message
- Status: DELIVERED (2026-11-02, PM — TEST-005 run 6 8/8 on APK `05fbbbca…`; DEF-1 + DEF-2 fixed; D46 back key. The app's mail reply was proven in TEST-002 (app 15/15 + the owner's real-Zimbra window). UNVERIFIED: a real phone and vendor battery managers (only the emulator was used))
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
- **Amended 2026-11-01 by the PM (owner's words in `SYSTEM-FACTS.md` → "Owner's answers to the B list"):** *"ไม่อยากใช้ firebase"*.
  **No Firebase, and no other outside push service.** Req 3 and AC-2 stay: a phone notification within 1 minute, and a tap
  opens the message. The SA chooses how, using only our own back end and the phone. Constraints: no deploy, and the LINE OA
  1-on-1 still notifies every time (D7). If a true background notification cannot be had without an outside service, the SA
  says what the user loses, in plain words, under § Questions; the PM decides (D41, `../../project-docs/decisions-for-owner-review.md`).
  > **answer (Silver, SA-B, 2026-11-01): it can be done without Firebase, with no back-end change.** `[SA-decided, SPEC-003 D-B14]`
  > - **How it works:** the app keeps a small helper running on the phone. Every 30 seconds it asks **our own** back end whether there are new
  >   notified messages, and if there are, it shows the notification itself. A notification therefore arrives within about 30–60 seconds,
  >   which meets AC-2. A tap opens the message. Signing out stops the helper.
  > - **Q-A (for the PM, D41). What the user loses compared with Firebase, in plain words:**
  >   1. **A small notification stays in the notification bar all the time** ("corner-chat กำลังรอข้อความใหม่"). Android requires it
  >      for any app that keeps working in the background, and it cannot be removed.
  >   2. **The first time, the user must allow the app to "use the battery without limits".** If they don't, notifications come
  >      late or not at all while the screen is off.
  >   3. **It uses more battery** than Firebase: a small request every 30 s. It is noticeable, but not heavy.
  >   4. **On some phone brands (Xiaomi, OPPO, vivo, Huawei and others)** the system may still kill the helper. The user then has to
  >      turn on "auto-start" for corner-chat in the phone's settings, or the notifications stop until they open the app again.
  >      Samsung and Pixel phones should be fine once the battery permission is given. This is `inferred`: only the emulator is tested.
  >   5. **If the user "force stops" the app**, notifications stop until they open it again.
  >   6. **It cannot go on the Play Store as it is**: Google reviews both permissions. Round 1 installs the APK directly (D11), so nothing is
  >      lost now. A Play listing later would need this revisited.
  >   - What stays the same: the LINE OA 1-on-1 still notifies every time (D7), so a user who has linked LINE still gets every message there.
  > - **Q-B (for the PM, UX writer; not blocking, drafts in TASK-030):**
  >   - the permanent notification: `corner-chat กำลังรอข้อความใหม่`;
  >   - the line before the battery ask: `ให้ corner-chat ทำงานตลอดเวลา เพื่อแจ้งข้อความใหม่ได้ทันที`.
  > answer `[PM, 2026-11-01]`: **Q-A accepted** (D41). Losses 1–6 are the price of the owner's "no Firebase", and the LINE OA still
  > notifies every time, so no message is missed. I will tell the owner these losses in plain words. **Q-B:** both drafts approved
  > as written.
- **AC-1 comp eye check, PM 2026-11-01 (TASK-026 screenshots `tests/harness/task-026/`): PASS, with one change (D42).**
  The list and the detail follow req 2, the Thai reads naturally at 360 px, the bottom bar stays on a long list (emulator),
  and "AI ไม่ได้ตรวจ" and the rule wording both show.
  **Change, D42 `[PM-decided]`:** in the app, the about line drops its `[channel · group or sender]` head. The row's top line
  already shows the channel chip and the name just above it, so the head says it twice. The app shows only the summary; the
  full `[…] summary` form stays for notifications (LINE and the phone), where nothing else shows the source. Non-blocking;
  SA-B chooses the TASK.
- **TEST_FAILED 2026-11-01 (QA Tefany, TEST-005 DEF-1, MAJOR) — routed by the PM to SA Team B as REQ content:** the debug APK
  writes the password, the sign-in token and message text to the Android system log (logcat), through Capacitor's verbose bridge
  log. That breaks SPEC-003 § Non-functional ("never log tokens, passwords, or message text"), and round 1 hands out exactly this
  APK type (D11). **What the requirement needs:** an APK given to a user writes none of the three to the system log. How is
  the SA's. Repro and evidence: `tests/TEST-005-android-app.md` § Defects DEF-1.
- **TEST_FAILED 2026-11-01 (QA Tefany, TEST-005 runs 4–5, DEF-2 MAJOR). The PM routes it to SA Team B as REQ content.** When
  the user taps the message line inside the collapsed corner-chat notification group, the app opens the list instead of that
  message, 4 times in 5. AC-2 needs that tap to open that message, however the system groups the notifications. The how is the
  SA's. Evidence: `tests/TEST-005-android-app.md` § Defects DEF-2.
- **Q11 answered `[PM-decided 2026-11-01, D46]`: the Android back key behaves like the on-screen back arrow.** On a detail or a
  sub-screen it goes back one step. On a tab's top screen it leaves the app the normal Android way (to the home screen). Today it
  does nothing, which an Android user reads as the app being frozen.
- **D46 extended `[PM-decided 2026-11-01]` (SA-B's question in TASK-037 § Review):** when a dialog or menu is open, the Android back key
  **closes the dialog and nothing more**. It is the same as tapping its cancel button: no step back and no leaving the app. That is
  what an Android user expects. Today it minimises the app and leaves the dialog open.
