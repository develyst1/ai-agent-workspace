# REQ-002: Sign in with Google
- Status: TEST_PASSED (Tanya, 2026-09-21 — `tests/TEST-001-google-sign-in.md`; one non-blocking gap, Q-3 there)
- Priority: HIGH
- Requested: 2026-09-18 by the owner
- Deadline: none
- Source: chat 2026-09-18; SYSTEM-FACTS.md §Sign-in

## Problem / Goal
A user must be identified so their ideas and tier belong to them and so the owner can
contact them about a hire. The owner chose Google as the only sign-in method.

## Requirement
1. The only way to sign in is Google. No email/password, no other provider.
2. A visitor who is not signed in can see the landing page and the sign-in button only;
   submitting an idea (REQ-003) and every page with personal data require sign-in.
3. On first sign-in a user record is created with: Google id, email, display name, tier
   `Ordinary` (REQ-001), created date.
4. The signed-in user's display name and email are shown in the header, with a
   sign-out action.
5. The owner's account `siegkung@gmail.com` is the only admin (REQ-004).

## Acceptance Criteria
- [ ] AC-1 — **Given** a visitor not signed in **When** they open the idea page **Then** they are taken to sign-in with the Google button; no idea box is shown.
- [ ] AC-2 — **Given** a Google account that has never signed in **When** it signs in **Then** a user exists with tier `Ordinary`, and the header shows that account's name and email.
- [ ] AC-3 — **Given** a returning user **When** they sign in again **Then** no second user record is created and their previous ideas and tier are shown.
- [ ] AC-4 — **Given** a signed-in user **When** they press sign out **Then** the next visit to the idea page shows sign-in again.
- [ ] AC-5 — negative: cancelling the Google popup / denying consent returns to the landing page with message W-3 and no user is created.
- [ ] AC-6 — negative: there is no page or form that accepts an email + password.

## User-facing wording (Porter as UX writer)
- W-1 button: "เข้าสู่ระบบด้วย Google" / "Sign in with Google"
- W-2 sign out: "ออกจากระบบ" / "Sign out"
- W-3 cancelled: "ยังไม่ได้เข้าสู่ระบบ — กดเข้าสู่ระบบด้วย Google เพื่อเริ่มส่งไอเดีย" / "Not signed in — sign in with Google to start submitting an idea."

## Constraints
- Google only (owner, 2026-09-18). Stack undecided (SPEC-001).

## Out of Scope
- Other providers, Microsoft accounts, profile editing.

## Questions
