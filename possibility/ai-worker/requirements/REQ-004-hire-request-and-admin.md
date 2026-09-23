# REQ-004: "Interested in hiring" request and the owner's admin page
- Status: DELIVERED (Porter 2026-09-23 — TEST_PASSED in `tests/TEST-006-hire-request-and-admin.md`; admin copy folded into the next FE task; empty-state copy NOT_TESTED)
- Priority: HIGH
- Requested: 2026-09-18 by the owner
- Deadline: none
- Source: chat 2026-09-18; SYSTEM-FACTS.md §Hiring flow

## Problem / Goal
The business outcome: after seeing the analysis, a user says they want to hire us. The
owner sees these requests in one place and contacts the user himself, quoting outside
the system with the tier discount applied by him.

## Requirement
1. On a result page (REQ-003) the user can press "interested in hiring" once per idea.
   After that the button shows the request is already sent.
2. The request records: idea, its scores, idea tier, user tier at that moment, user
   email + name, date.
3. Admin page: visible only to `siegkung@gmail.com`. Lists requests newest first with
   date, user name, email, idea (first 120 chars, expandable to full), three scores,
   idea tier, discount. The owner can mark a request "contacted".
4. Any other signed-in account opening the admin address gets "not found".
5. The system does not price, quote, message the user, or take payment.

## Acceptance Criteria
- [ ] AC-1 — **Given** a result page **When** the user presses W-1 **Then** W-2 confirmation shows, the button is replaced by W-3, and the request appears on the admin page with all fields in Requirement 2.
- [ ] AC-2 — **Given** a request already sent for an idea **When** the user reopens that result **Then** W-3 is shown and no second request can be sent (admin list count unchanged).
- [ ] AC-3 — **Given** signed in as `siegkung@gmail.com` **When** opening the admin page **Then** the list is shown; **Given** any other account → "not found"; **Given** not signed in → sign-in (REQ-002).
- [ ] AC-4 — **Given** a request on the admin list **When** the owner marks it "contacted" **Then** it shows the contacted state and stays in the list; reload keeps it.
- [ ] AC-5 — **Given** a user whose user tier was `Seeker` when they sent the request and later becomes `Raw Diamond` **When** the owner views the request **Then** it still shows `Seeker` / 5% (tier at request time).
- [ ] AC-6 — negative: no admin link is visible to non-admin users anywhere in the UI.

## User-facing wording (Porter as UX writer)
- W-1 button: "สนใจจ้างทำ" / "I'm interested in hiring you"
- W-2 confirmation: "ส่งคำขอแล้ว — เราจะติดต่อกลับทางอีเมล {email} พร้อมข้อเสนอราคาที่รวมส่วนลด {discount} ของคุณ" / "Request sent — we'll contact you at {email} with a quote that includes your {discount} discount."
- W-3 already sent: "ส่งคำขอแล้ว" / "Request sent" (disabled)
- Admin: "คำขอจ้างงาน" / "Hire requests" · "ติดต่อแล้ว" / "Contacted" · "ยังไม่ติดต่อ" / "Not yet contacted" · empty: "ยังไม่มีคำขอ" / "No requests yet"

## Constraints
- Admin accounts = the email list in configuration (owner, 2026-09-23, supersedes "exactly siegkung@gmail.com" of 09-18); the owner sets the list per environment. Email notification to the owner is a possible later REQ, not this one.

## Out of Scope
- Quotes, prices, payments, chat between owner and user, email notifications.

## Questions
- Porter 2026-09-23 — **admin page copy** (answers TASK-009's provisional keys):
  - Table headers: "วันที่" / "Date" · "ชื่อ" / "Name" · "อีเมล" / "Email" · "ไอเดีย" / "Idea" · "ระดับ" / "Tier" · "ส่วนลด" / "Discount" · "สถานะ" / "Status"
  - Expand/collapse the idea text: "ดูทั้งหมด" / "Show all" · "ย่อ" / "Collapse"
  - Steps drawer title: "ขั้นตอนที่ AI วิเคราะห์" / "How the AI analysed this" · per-step labels: 1 "สิ่งที่ลูกค้าต้องการสื่อ" / "What they're asking for" · 2 "ความชัดเจนของเป้าหมาย" / "How clear the goal is" · 3 "ประโยชน์ต่อโลก" / "Good for the world" · 4 "ตรงกับงานที่เราทำ" / "Fit with our work" · 5 "สรุปและให้คะแนน" / "Summary and scores"
  - Drawer meta line: "โมเดล {provider}/{model} · {latencyMs} มิลลิวินาที" / "Model {provider}/{model} · {latencyMs} ms" · close: "ปิด" / "Close"
- Porter 2026-09-23 — **REQUIREMENT CHANGE (owner, "1"):** R3/R4 amended — admin is **a list of email addresses held in configuration (`.env`)**, not one hard-coded Google account. `siegkung@gmail.com` remains on the list; the owner adds a QA account's email on SIT. Any account whose email is on the list sees `/admin`, regardless of sign-in method (Google or email+password, REQ-006); every other account still gets 404. Changing the list must not need a code change. AC-3 is read with the list: "an account on the admin list → 200; any other → not found". @Sober for the design/TASK; the owner then sets the SIT value.
