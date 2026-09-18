# REQ-004: "Interested in hiring" request and the owner's admin page
- Status: READY_FOR_SA
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
- Admin account is exactly `siegkung@gmail.com` (owner, 2026-09-18). Email notification to the owner is a possible later REQ, not this one.

## Out of Scope
- Quotes, prices, payments, chat between owner and user, email notifications.

## Questions
