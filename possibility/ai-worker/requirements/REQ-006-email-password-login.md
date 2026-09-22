# REQ-006: Email + password sign-up and sign-in (Google stays prominent)
- Status: DELIVERED (Porter 2026-09-22 — TEST_PASSED round 2 in `tests/TEST-004-email-password-login.md`; hire-half of AC-7 waits for REQ-004)
- Priority: HIGH (unblocks QA on SIT — every REQ test is waiting on a self-service session)
- Requested: 2026-09-22 by the owner
- Deadline: none
- Source: chat 2026-09-21/22; SYSTEM-FACTS.md §Sign-in (decision 09-22)

## Problem / Goal
Users (and QA on SIT) need a way in without a Google account. The owner decided: a
normal email + password account is a real feature for everyone, next to Google, with
**Google visually prominent**. It also ends the need for the owner to sign in by hand
for every QA round.

## Requirement
1. On the signed-out landing there are two ways in: the Google button (primary, on top,
   larger/first — REQ-002 unchanged) and below it a secondary "or use email" form:
   email + password, with a "create account" link.
2. Sign-up: email, password, display name. Email must be unique across ALL users (a
   Google user's email cannot be re-registered with a password, and vice versa → W-5).
   Password min 8 characters. Email verification is NOT required (owner's call, out of scope).
3. Sign-in: email + password → same session as Google sign-in (header, tier, ideas, all
   pages identical). Wrong email or password → one generic message W-4 (no hint which).
4. A new email+password user starts as `Ordinary` (REQ-001 R2), exactly like a Google user.
5. Sign-out is the same action for both kinds of user (REQ-002 W-2).
6. Passwords are never stored in plain text and never appear in logs or responses.
7. Admin remains `siegkung@gmail.com` via Google only; no email+password account is admin.
8. ~~Owner's constraint: implemented with NextAuth, credentials stored in the database.~~ **Owner 2026-09-22 "ok follow sa": built as Sober designed (backend-owned, same session as Google, hashed credentials in our DB) — no NextAuth.**
   Sober decides how that fits the existing BE-owned session (SPEC-002) — if it cannot
   without a rewrite, Sober raises it in SPEC-007 §Questions before building.

## Acceptance Criteria
- [ ] AC-1 — **Given** a signed-out visitor **When** the landing opens **Then** the Google button is above the email form and visually dominant (larger or filled style; the email form is a plain secondary block below "or" — W-1); on a 375 px phone the Google button, the divider and the first email field are in view without scrolling (**amended 2026-09-22, Porter: the form "starts in view" is enough; TEST-004 Q-1**).
- [ ] AC-2 — **Given** a new email **When** the visitor signs up with name, email, password ≥ 8 **Then** they are signed in immediately, the header shows their name + email, tier badge `Ordinary 0%`, and `/ideas/new` opens.
- [ ] AC-3 — negative: password < 8 → W-3 shown, no account created; empty name/email → submit disabled.
- [ ] AC-4 — negative: sign-up with an email that already exists (as Google user OR as email user) → W-5, no second row.
- [ ] AC-5 — **Given** an email user **When** they sign out and sign in again with the right password **Then** same account (same ideas, same tier); users count unchanged.
- [ ] AC-6 — negative: wrong password, or unknown email → W-4 (identical text for both), still signed out.
- [ ] AC-7 — **Given** an email user **When** they submit an idea (REQ-003) and press "interested in hiring" (REQ-004) **Then** everything behaves exactly as for a Google user (regression).
- [ ] AC-8 — negative: an email+password user opening `/admin` → not found (REQ-004 R4).
- [ ] AC-9 — security: the stored password column is a hash (Tanya reads the row on SIT: no plain password), and the sign-in/sign-up responses and BE logs contain no password.
- [ ] AC-10 — regression: REQ-002 AC-1..5 still pass (Google flow untouched).

## User-facing wording (Porter as UX writer)
- W-1 divider between Google and the form: "หรือใช้อีเมล" / "or use email"
- Fields: "อีเมล" / "Email" · "รหัสผ่าน" / "Password" · "ชื่อที่แสดง" / "Display name"
- Buttons: "เข้าสู่ระบบ" / "Sign in" · "สร้างบัญชี" / "Create account" · link "ยังไม่มีบัญชี? สร้างบัญชี" / "No account? Create one" · link back "มีบัญชีแล้ว? เข้าสู่ระบบ" / "Have an account? Sign in"
- W-3 short password: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" / "Password must be at least 8 characters."
- W-4 bad credentials: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" / "Incorrect email or password."
- W-5 email taken: "อีเมลนี้มีบัญชีอยู่แล้ว — ลองเข้าสู่ระบบ" / "This email already has an account — try signing in."

## Constraints
- Google remains primary and unchanged (REQ-002 DELIVERED; only its AC-6 is struck).
- Owner's tech constraint (superseded 09-22): backend-owned credentials login as in SPEC-007; no NextAuth.
- Bilingual per REQ-005; dates per REQ-003 W-9.

## Out of Scope
- Email verification, password reset / "forgot password", account deletion, changing email. (Ask the owner later if needed.)

## Questions
- Porter 2026-09-22 → @Sober — **DEFECT DEF-1 (MAJOR, from TEST-004):** the W-4 "incorrect email or password" alert renders off-white text on antd's light error background (1.14:1 contrast, unreadable) under the dark theme. Same Alert component carries REQ-003 W-6 (TEST-003 cross-ref). Business meaning: the one message a failing user must read is invisible — must fix before DELIVERED. Expected: error alert text/background readable (≥ 4.5:1) in both languages, desktop + 375 px.
  > answer (Sober, 2026-09-22): accepted as MAJOR. Cause: TASK-013 did not re-token antd's status-variant colours (`colorErrorBg` etc.) for the dark theme, and my review checked token contrast, not a rendered error state — attributed in TASK-014 §Attribution. Fix = TASK-014 (FE, priority over TASK-009), covers W-4 and W-6 and every other antd status colour. "Ready to deploy" follows its DONE.
