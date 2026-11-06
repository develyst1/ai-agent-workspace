# REQ-001: Only people the owner adds can sign in, and each sees only their own messages
- Status: DELIVERED (2026-11-01, PM — TEST-001 run 3 PASS: back end + app browser + native APK on the emulator)
- Priority: HIGH `[team-proposed]` — everything else stands on it
- Requested: 2026-11-01 by the owner — stamp: operator (shape) · operator-delegated (details, `../../project-docs/decisions-for-owner-review.md`)
- Deadline: none
- Depends on: none
- Source: `SYSTEM-FACTS.md` (What the product is) · `../../project-docs/requirement-understanding-2026-11-01.md` §1c

## Problem / Goal
corner-chat is an app for each person, not a shared team inbox. The owner decides who may use it in round 1.
> "ฉันหมายถึงผู้ใช้ corner-chat แล้วแต่คนจะตั้งเงื่อนไขตามสไตล์ตัวเอง" · "ใช่ เฉพาะคนที่เพิ่ม" · web = "the owner's admin page only" ("ใช่") (operator, 2026-11-01)

## Requirement
1. The owner can sign in to an admin web page and **add** a user (name, email, first password), **disable** a user, and
   **reset** a user's password. Only the owner's account can open the admin web.
2. A user signs in to the Android app with email + password. No sign-up and no self-service password reset in round 1 `[D9]`.
3. Every message, condition, connected channel and AI decision belongs to exactly one user. A user can never see,
   change or be notified about another user's data.
4. A disabled user cannot sign in, receives no notifications, and nothing new is taken in for them.
5. Messages are kept; there is no automatic deletion in round 1 `[D13]`.
6. Every message the system takes in is stored before anything else happens to it ("ข้อความต้องไม่สูญหาย", owner's doc §6).

## Acceptance Criteria
- [ ] **AC-1** — **Given** the owner signed in to the admin web **When** he adds a user with an email and password
  **Then** that user can sign in to the app with them.
  - Check: QA — admin web + app on a test device/emulator.
- [ ] **AC-2** — **Given** a user account **When** someone signs in to the admin web with it **Then** access is refused.
  - Check: QA.
- [ ] **AC-3** — **Given** users U1 and U2 each have messages **When** U1 is signed in **Then** U1's app lists none of
  U2's messages, conditions or channels, and calling the API with U2's item ids returns "not found / not allowed".
  - Check: QA — app + direct API calls with U1's token.
- [ ] **AC-4** — **Given** the owner disables U1 **When** U1 tries to sign in, or a message for U1 arrives **Then** sign-in
  is refused with the wording below, and no notification is sent.
  - Check: QA.
- [ ] **AC-5** — **Given** the owner resets U1's password **When** U1 signs in with the old one **Then** refused; the new one works.
  - Check: QA.
- [ ] **AC-6** — wrong password 5 times in a row → that sign-in is slowed or blocked for a few minutes; the right password then works.
  - Check: QA. `[team-proposed]`

## User-facing wording
| Where | TH |
|---|---|
| App sign-in title | เข้าสู่ระบบ corner-chat |
| Wrong email or password | อีเมลหรือรหัสผ่านไม่ถูกต้อง |
| Disabled account | บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล |
| Too many tries | ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่ |
| Admin web: add user button | เพิ่มผู้ใช้ |
| Admin web: disable / enable | ปิดใช้งาน / เปิดใช้งาน |
| Admin web: reset password | ตั้งรหัสผ่านใหม่ |

## Constraints
- Back = Bun + Hono or Bun + Elysia, Postgres; admin web in `corner-chat-front`; app in `corner-chat-app` (`PROTOCOL.md`).
- Secrets only in `.env`, never in git (`SYSTEM-FACTS.md`). Local only; no real environment.

## Out of Scope
Open sign-up · self-service password reset · roles beyond "owner" and "user" · iOS · English UI · data deletion.

## Questions
(the SA and QA ask here; the PM answers as `> answer:`)

**Q-SA-1 — admin-web wording missing from the table (SA Sober, 2026-11-01).** Not blocking: FE builds with keys and swaps the
text in (TASK-008 step 5). `Checked:` the wording table above — these strings are not in it. Each needs one Thai line from the PM
(the English is only the meaning): `admin.signin.title` (admin sign-in page title) · `admin.signin.notOwner` (a user account
signed in to the admin web: "this page is for the owner only") · `admin.users.col.name / email / status / createdAt` ·
`admin.users.status.active / disabled` · `admin.users.add.fields.name / email / password` + `admin.password.min8` hint ·
`admin.confirm.disable` / `admin.confirm.enable` · `admin.reset.title` · `admin.signout` · `admin.error.emailTaken` ·
`admin.error.serverDown` ("cannot reach the server") · `admin.linePushes.title` ("LINE messages sent this month", REQ-003 req 8
is shown on Team A's admin web).
> answer `[PM, UX writer, 2026-11-01]`: `admin.signin.title` เข้าสู่ระบบผู้ดูแล corner-chat · `admin.signin.notOwner` หน้านี้สำหรับผู้ดูแลเท่านั้น ·
> `admin.users.col.name` ชื่อ · `.email` อีเมล · `.status` สถานะ · `.createdAt` สร้างเมื่อ · `admin.users.status.active` ใช้งานอยู่ ·
> `.disabled` ปิดใช้งาน · `admin.users.add.fields.name` ชื่อ · `.email` อีเมล · `.password` รหัสผ่านแรก · `admin.password.min8`
> อย่างน้อย 8 ตัวอักษร · `admin.confirm.disable` ปิดใช้งาน {name} ไหม เขาจะเข้าระบบไม่ได้และไม่ได้รับการแจ้งเตือน ·
> `admin.confirm.enable` เปิดใช้งาน {name} อีกครั้งไหม · `admin.reset.title` ตั้งรหัสผ่านใหม่ให้ {name} · `admin.signout` ออกจากระบบ ·
> `admin.error.emailTaken` อีเมลนี้มีผู้ใช้แล้ว · `admin.error.serverDown` ติดต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง ·
> `admin.linePushes.title` ข้อความ LINE ที่ส่งเดือนนี้
> **Amended 2026-11-01 by the PM (UX writer, P3):** the month picker beside that title shows Thai month names and the
> Buddhist year (พ.ย. 2569), the same as the title; if that costs more than a small change, leave the picker as it is.

**Q-SA-2 — 13 more admin-web strings found while building (SA Sober, 2026-11-01, from FE Fern's TASK-008).** Not blocking.
`Checked:` the table above + the Q-SA-1 answer — not in either. One Thai line each: `admin.signin.fields.email` /
`.password` · `admin.signin.submit` (sign-in button) · `admin.users.title` (page heading) · `admin.users.add.title` (add-user
modal title) · `admin.users.empty` ("no users yet") · `admin.users.loading` · `admin.users.retry` (button after a load
failure) · `admin.reset.fields.password` ("new password") · `admin.reset.done` ("password changed") ·
`admin.common.confirm` / `admin.common.cancel` · `admin.error.required` ("required") · `admin.error.validation` (a field the
server rejected: "check this field") · `admin.error.generic` ("something went wrong, try again").
> answer `[PM, UX writer, 2026-11-01]`: `admin.signin.fields.email` อีเมล · `.password` รหัสผ่าน · `admin.signin.submit` เข้าสู่ระบบ ·
> `admin.users.title` ผู้ใช้ · `admin.users.add.title` เพิ่มผู้ใช้ใหม่ · `admin.users.empty` ยังไม่มีผู้ใช้ กด "เพิ่มผู้ใช้" เพื่อเริ่ม ·
> `admin.users.loading` กำลังโหลด… · `admin.users.retry` ลองอีกครั้ง · `admin.reset.fields.password` รหัสผ่านใหม่ ·
> `admin.reset.done` เปลี่ยนรหัสผ่านแล้ว · `admin.common.confirm` ยืนยัน · `admin.common.cancel` ยกเลิก ·
> `admin.error.required` ต้องกรอกช่องนี้ · `admin.error.validation` ตรวจข้อมูลช่องนี้อีกครั้ง · `admin.error.generic` เกิดข้อผิดพลาด ลองอีกครั้ง

**SA notes for the record** `[SA-decided 2026-11-01, SPEC-001 §3.2–§3.3]`: the owner's own account is created at start-up from
`.env` (never through the web) · lockout = 5 wrong in a row → 5 min lock ~~within 15 min~~ (window dropped to match the
PM's amendment below) · the admin web keeps its
sign-in only for the open tab · a disabled or reset user is signed out everywhere at once.
- **Amended 2026-11-01 by the PM** (from QA Tanya, TEST-001 Q1/Q2, PM-decided): a disable or a reset refuses the user's
  **next** call at once, even if already signed in · AC-6 exact: per email, 5 wrong in a row → refused for 5 minutes
  with the too-many-tries wording, reset on a right sign-in.
- **Testability requirement (from QA Tanya, TEST-001 Q3 / TEST-002 Q1 / TEST-003 Q1; PM 2026-11-01), for SA Team A —
  local only:** a pause switch between intake and the filter · IMAP/SMTP host + port and the gateway URL as `.env`
  settings · an AI stub per layer (fixed % / broken / none) · plus Team B's list in REQ-003 (AI-call log, row listing,
  decision time). One SPEC section can answer all.
  > answer (SA Sober, 2026-11-01): all carried — SPEC-001 §7a (pause = `FILTER_PAUSED` in `.env`, local only; hosts/URL
  > in `.env`; AI stub = a scripted **fake gateway** in `tests/harness/fake-gateway/`, per layer: fixed %, broken, 500,
  > never answers; AI-call log = `ai_calls`; decision time = `stored_at` / `decided_at`). Disable/reset refuse the next
  > call at once (sessions deleted + status checked on every call) and AC-6's exact rule — SPEC-001 §3.2, TASK-002.
