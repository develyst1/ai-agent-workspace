# TEST-005: Android app — every screen, notification for every passed message
- Team: B · TASKs: none yet (SPEC not written)
- Source REQ: REQ-005 (ACs tested: AC-2 … AC-6; AC-1 is the PM's comp check, not a QA case)
- Status: DRAFT — designed 2026-11-01 from the REQ, before any build; verdicts after SPEC_DONE
- Build under test: repo `corner-chat-app` (APK, D11) against the local `corner-chat-back`, branch TBD (B6), HEAD / APK build id — per round
- Surfaces: Android emulator at **360 dp** wide (Google Play image, for push) · one real Android phone where the owner can lend one (named per result)
- Designed: 2026-11-01 by Tefany

## Scope
- In: notification arrival + tap (AC-2), the two tabs (AC-3), reachability of every req. 2 screen at 360 dp (AC-4),
  offline (AC-5), per-user isolation through the app (AC-6), Thai wording, sign-out.
- AC-1 (comp before build) is checked by the PM; I only note whether the built screens still match it.
- Judged elsewhere, only reached here: filter logic (REQ-004 / Tanya), mail reply content (REQ-002 / Tanya),
  LINE linking logic (REQ-003 / TEST-004). Here: the screen exists, is reachable, and shows what the API returned.
- Out (REQ Out of Scope): iOS, public Play listing, English, tablet layouts, auto-reply, Discord / Web Chat / Teams.

## Instrument limits
- **Emulator**: proves layout, navigation, offline (airplane mode), push via FCM if Play services are present.
  It does NOT prove battery-saver / OEM background killing on a real phone — named per result.
- **Local back end with an AI stub**: lets me cause "passed" and "held" on demand; proves the app path, not the AI.
- **Timing (AC-2, 1 minute)**: measured from the decision time the back end records to the notification's arrival on
  the device clock; both clocks noted. 5 runs, all must be ≤ 60 s; the slowest is reported.
- **API calls with U1's token** (AC-6): prove the server refuses, not only that the screen hides.

## Cases
| # | Case (from AC) | Type | Surface | Steps / command | Expected | Actual | Evidence | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | AC-2 notify, app in background | happy | emulator | U1 signed in, app in background; stub = pass; send a message for U1 | notification ≤ 60 s: about line + first 2 lines | | | NOT_TESTED |
| 2 | AC-2 notify, app closed (swiped away) | state | emulator + phone | as 1, app killed | notification ≤ 60 s | | | NOT_TESTED |
| 3 | AC-2 notify, app in foreground | state | emulator | as 1, app open on the list | notification (or in-app banner) + list updates | | | NOT_TESTED |
| 4 | AC-2 tap opens that message | happy | emulator | tap the notification from 1, 2 and 3 | opens that message's detail, not the list or another message | | | NOT_TESTED |
| 5 | AC-2 two notifications, tap the older | boundary | emulator | two passed messages A, B; tap A's notification | A's detail opens | | | NOT_TESTED |
| 6 | AC-2 held message gives no notification | negative | emulator | stub = hold | no notification; message in "ไม่ได้แจ้ง" | | | NOT_TESTED |
| 7 | AC-2 timing, 5 runs | boundary | emulator | repeat case 1 five times | all ≤ 60 s; slowest recorded | | | NOT_TESTED |
| 8 | AC-2 notification permission refused (Android 13+) | negative | emulator API 33+ | deny the notification prompt; cause a pass | no notification; the list shows "ปิดการแจ้งเตือนอยู่ จะไม่เห็นข้อความใหม่จนกว่าจะเปิด · แตะเพื่อเปิด"; tapping it lets the user turn notifications on (Q2, PM-decided; where it leads is the SPEC's) | | | NOT_TESTED |
| 9 | AC-2 AI down | regression (REQ-004 AC-5, D3) | emulator | stub = down | notification still arrives, detail shows "AI ไม่ได้ตรวจ" | | | NOT_TESTED |
| 10 | AC-3 tabs | happy | emulator | 2 passed + 2 held | passed in "แจ้งแล้ว", held in "ไม่ได้แจ้ง", each held one shows its reason | | | NOT_TESTED |
| 11 | AC-3 empty tabs | boundary | emulator | new user, no messages | "ยังไม่มีข้อความที่ต้องแจ้ง" / "ยังไม่มีข้อความที่ถูกกรองออก" | | | NOT_TESTED |
| 12 | AC-3 correction moves tabs | state (REQ-004 AC-8, D4) | emulator | mark a held one "แจ้ง"; mark a passed one "ไม่ต้องแจ้ง" | each moves to the other tab and stays after refresh | | | NOT_TESTED |
| 13 | AC-3 channel filter | happy | emulator | messages from Zimbra and LINE; filter each | only that channel's messages shown | | | NOT_TESTED |
| 14 | AC-4 walk every screen | reachability | emulator 360 dp | from sign-in, reach each req. 2 screen by the app's own navigation; back out of each | all 11 reached; no dead end; nothing cut off or needing sideways scroll | | | NOT_TESTED |
| 15 | AC-4 long Thai text | data shape | emulator 360 dp | 2,000-char Thai message, long group name, long about line | detail scrolls; list rows truncate cleanly; no overlap | | | NOT_TESTED |
| 16 | AC-4 large font | boundary | emulator 360 dp | system font size largest | every screen still reachable and buttons tappable | | | NOT_TESTED |
| 17 | AC-4 detail contents | happy | emulator | open a passed AI-judged message | full text, about line, %, reason, correct buttons present | | | NOT_TESTED |
| 18 | Req. 4 new messages without restart | happy | emulator | list open; a new message arrives; pull to refresh | new message shows without restarting the app | | | NOT_TESTED |
| 19 | AC-5 offline | happy | emulator | list loaded; airplane mode on; open list again | "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด" + the last list | | | NOT_TESTED |
| 20 | AC-5 back online | state | emulator | airplane off; pull to refresh | list refreshes; offline wording gone | | | NOT_TESTED |
| 21 | AC-5 offline from cold start | boundary | emulator | kill app, airplane on, open app | last saved list + offline wording; if nothing was ever saved, the offline wording alone (Q4, PM-decided) | | | NOT_TESTED |
| 22 | AC-5 action while offline | negative | emulator | offline; tap "แจ้ง" correction / send mail reply | refused visibly; nothing half-sent after reconnect | | | NOT_TESTED |
| 23 | AC-6 isolation in the app | permission / regression (REQ-001 AC-3) | emulator | U1 and U2 each have messages, conditions, channels; sign in as U1 | none of U2's items anywhere in the app | | | NOT_TESTED |
| 24 | AC-6 isolation at the API | permission | curl with U1's token | GET/POST U2's message, condition, channel ids | "not found / not allowed"; no U2 data in the body | | | NOT_TESTED |
| 25 | AC-6 account switch on one device | permission / privacy | emulator | U1 signs out, U2 signs in on the same device; cause a pass for U1 | nothing of U1 shows to U2; no U1 notification on this device — a leak is a BLOCKER (Q1, PM-decided) | | | NOT_TESTED |
| 26 | Sign out | happy | emulator | menu → ออกจากระบบ → "ออกจากระบบไหม" → yes; press back | lands on sign-in; back does not show any data | | | NOT_TESTED |
| 27 | Wording | happy | emulator | compare every string in REQ §User-facing wording, verbatim (tabs, empties, offline, menu, channels, sign-out) | exact match | | | NOT_TESTED |
| 28 | Install | happy | emulator + phone | install the APK fresh (D11) | installs and opens to sign-in | | | NOT_TESTED |

## Defects
(none — not run)

## Observations (not ours)
(none yet)

## Test data created
| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| none — design only | — | — |

## Verdict
Not run. Every case is NOT_TESTED or BLOCKED until: SPEC_DONE + TASKs DONE; Team A's base, sign-in (REQ-001) and the
filter (REQ-004, stub is enough); Firebase (B3) for cases 1–9. Cases 10–28 can run without push.

## Evidence (decisive)
(filled after the run)

## Questions
For the PM. Each has my default — correct only the line that is wrong. Checked: DECISIONS 2026-11-01 lines ·
SYSTEM-FACTS app lines · decisions-for-owner-review D3, D4, D11, D12, D15 — not covered because each is a case the
REQ's wording leaves open.

- **Q1 — after sign-out, does the device still get that user's notifications?** Default: no — sign-out unregisters the
  device; after U1 signs out and U2 signs in, nothing of U1 reaches this phone. A leak here is a BLOCKER (privacy).
  Changes case 25.
- **Q2 — the user refuses notification permission (Android 13+).** Default: the app asks once at first sign-in; if
  refused, the list shows a one-line hint to turn notifications on (PM's wording needed). Changes case 8.
- **Q3 — real phone.** Emulator results do not cover OEM battery-saver killing pushes. Default: emulator only, and
  "real phone" is NOT_TESTED (named) unless the owner lends a device. Not a block.
- **Q4 — offline on a cold start.** Default: the app shows the last list it saved, with the offline wording; if
  nothing was ever saved, the offline wording alone. Changes case 21.
- **Q5 — testability, for the SPEC.** I need: (a) the decision time stored per message (for the 60 s measure),
  (b) the AI stub switch (pass / hold / down) shared with TEST-004, (c) a debug APK that points at the local back end.

> answers `[PM-decided 2026-11-01, under the owner's standing instruction; listed in project-docs/decisions-for-owner-review.md D19–D22]`:
> Q1 default accepted — sign-out unregisters the device; a leak is a BLOCKER. · Q2 default accepted; wording:
> **"ปิดการแจ้งเตือนอยู่ จะไม่เห็นข้อความใหม่จนกว่าจะเปิด · แตะเพื่อเปิด"** (added to REQ-005 wording). · Q3 default accepted —
> emulator only; real phone NOT_TESTED, named. · Q4 default accepted. · Q5 → both SAs as a testability requirement
> (relayed 2026-11-01).
