# REQ-003: Messages to the user in their LINE groups come in, and passed ones reach them on LINE 1-on-1
- Status: DELIVERED (2026-11-01, PM — TEST-004 run 2 PASS + the real-LINE live run with the owner 23:30–23:50: link, wrong code, reply, nickname, real mention, @All (AC-8) pushed; chatter and a rule-held message not pushed. AC-5's second-OA refusal (B7) stays NOT_TESTED)
- Priority: HIGH `[team-proposed]`
- Requested: 2026-11-01 by the owner — stamp: operator (shape) · operator-delegated (details)
- Deadline: none
- Depends on: REQ-001 (users) · filtered by REQ-004
- Source: `SYSTEM-FACTS.md` (LINE lines) · understanding doc §1b, §Q2-SA · `DECISIONS.md` (untagged name)

## Problem / Goal
Personal LINE chats cannot be read by any system. The owner's shape: corner-chat's own LINE OA sits in the user's
groups, picks out what is meant for the user, and tells the user privately.
> "ต้องสร้าง LINE OA ของ corner-chat แล้วให้ดึงไปเข้ากลุ่มไลน์ของ ผู้ใช้ … ส่งให้ผู้ใช้ ผ่าน LINE OA corner chat" · "ถูก" · "รับได้" (one OA per group) · "ใช่ รับอย่างเดียว" · "ทั้งสองทุกครั้ง" (operator, 2026-11-01)

## Requirement
1. A user links their LINE account: add the corner-chat OA as a friend and send it the one-time code shown in the app `[D10]`.
2. The user adds the OA into any of their LINE groups. The app lists the groups the OA is in for that user.
3. In a group, the system takes in a message only if it: **tags** a linked user · **replies** to a linked user's own
   message · **tags all** · or **contains a linked user's name/nickname** from their list (plain text match, no AI) `[D2]`.
4. **Every other group message is dropped unread: not stored, not sent to AI, no row** (`DECISIONS.md`). For reply
   detection only the **id** of a linked user's own group messages is kept, never their text ("ได้ เก็บเลข").
5. Each user edits their own name/nickname list in the app.
6. A message that passes REQ-004 is sent to the user **1-on-1 from the corner-chat OA** and also as an app notification
   (REQ-005), every time ("ทั้งสองทุกครั้ง"). The LINE message carries the "about" line + the first 2 lines `[D12]`.
7. LINE groups are **receive-only**: no reply into a group from corner-chat in round 1.
8. The admin web shows this month's count of LINE messages the OA has pushed (quota watch).
9. The LINE webhook only accepts requests signed by LINE.

## Acceptance Criteria
- [ ] **AC-1** — **Given** a user with the app **When** they add the test OA and send the code **Then** the app shows "เชื่อม LINE แล้ว"; a wrong or old code is refused.
  - Check: QA — test OA (B1), test LINE accounts.
- [ ] **AC-2** — **Given** the OA in a test group with a linked user U1 **When** another member tags U1 / replies to U1's message / tags all / writes U1's nickname untagged **Then** each of the four is taken in for U1.
  - Check: QA.
- [ ] **AC-3** — **Given** the same group **When** a member writes a message that does none of the four **Then** nothing about it is stored (no row anywhere) and no AI call is made.
  - Check: QA — database + AI-call log before/after. (privacy, Tanya's case)
- [ ] **AC-4** — **Given** a message for U1 passes REQ-004 **When** it is decided **Then** U1 gets a 1-on-1 LINE message from the OA with the about line, and the app notification.
  - Check: QA.
- [ ] **AC-5** — **Given** a group already holding another OA **When** the user tries to add corner-chat **Then** LINE refuses; the app's help text explains why.
  - Check: QA (wording only if LINE gives no event).
- [ ] **AC-6** — a webhook call without a valid LINE signature is rejected and stores nothing.
  - Check: QA — curl with a bad signature.
- [ ] **AC-7** — the admin web shows the month's push count, and it goes up by 1 per push.
  - Check: QA.
- [ ] **AC-8** — "tag all" detection: settled on a test group before AC-2 is signed (LINE's docs do not confirm it — `UNVERIFIED`, SA Q2-SA).
  - Check: SA + QA.

## User-facing wording
| Where | TH |
|---|---|
| Link LINE screen | เชื่อม LINE: เพิ่มเพื่อน corner-chat แล้วส่งรหัสนี้ในแชต |
| Linked | เชื่อม LINE แล้ว |
| Code refused (OA reply in LINE) | รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่ในแอป |
| Names list screen | ชื่อที่ใช้เรียกคุณ (ใส่ชื่อเล่นได้หลายชื่อ) |
| Help: one OA per group | กลุ่มหนึ่งใส่บัญชีทางการได้แค่ตัวเดียว ถ้ากลุ่มมีบอทอื่นอยู่แล้ว จะเพิ่ม corner-chat ไม่ได้ |
| LINE notification | {about line}\n{first 2 lines} |

## Constraints
- Only the **test** OA and test LINE accounts/groups (B1). Any push to a real person needs the owner's go each time.
- Channel secret / token only in `.env`.
- The webhook needs a public HTTPS address (B5); locally a tunnel may be used for tests `[team-proposed]`.

## Out of Scope
Replying into groups · LINE 1-on-1 chats to the OA as an incoming channel · images/stickers content (noted only `[D7]`) · Discord · Web Chat · Teams.

## Questions
- **Testability requirement (from QA Tefany, TEST-004 Q6 / TEST-005 Q5; PM 2026-11-01):** the build must give, locally:
  (a) one way to list every row the LINE intake can write · (b) an AI-call log, one line per call (message id, layer,
  model) · (c) an AI stub switch: pass / hold / down · (d) the webhook secret in local `.env` so a harness can sign
  events · (e) the decision time stored per message · (f) a debug APK pointing at the local back end. Without (a)+(b)
  AC-3 is NOT_TESTED. **Amended 2026-11-01 (PM-decided):** a user is never notified of their own message; one LINE
  account links to one user only; name match is case-insensitive for Latin letters, Thai as written, substring.
- **Q1 (PM → SA Team B, does not block)** — how the app knows "the groups the OA is in for that user" (req. 2): LINE's
  member list may need a verified OA. PM preference: a group is listed once the user has been seen in it.
  > answer (SA): `[SA-decided 2026-11-01 — Silver, Team B; D-B1]` Stronger than "once seen". A group is listed for a
  > user as soon as any of these happens: the OA joins the group (we check each linked user with LINE's member-profile
  > call: 200 = member, 404 = not), the user links LINE (the same check over every open group), LINE's `memberJoined`
  > event, or the user writes there. So a quiet user sees the group right after adding the OA. The member-**list** call
  > is not used: LINE's reference says *"available only for verified or premium accounts"* (read 2026-11-01).
  > Detail: `specs/SPEC-002-line-groups-in-and-line-notify.md` § "My groups". Also, from the same reference: **"tag all"
  > is documented** (mentionee `type: "all"`), and so is `quotedMessageId` for replies. AC-8 still keeps its test-group
  > check.
