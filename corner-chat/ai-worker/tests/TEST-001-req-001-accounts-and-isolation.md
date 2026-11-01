# TEST-001: Only owner-added people sign in, and each sees only their own data
- Team: A · TASKs: — (not cut yet; no SPEC)
- Source REQ: REQ-001 (ACs tested: AC-1 … AC-6, plus requirement 4 and 6)
- Status: DRAFT — designed 2026-11-01 from the REQ, before the build; no verdict before SPEC_DONE
- Build under test: repos `corner-chat-back`, `corner-chat-front` (admin web), `corner-chat-app` (Android) — branch and
  HEAD sha filled at run time (working branch still undecided, `SYSTEM-FACTS.md`)
- Surfaces: local only · admin web on desktop browser (headless Playwright) · Android app on emulator · direct API calls
- Tested: — (designed 2026-11-01 by Tanya)

## Scope
- In: owner-only admin web, add / disable / enable / reset, app sign-in, one user never reaching another's data
  (app **and** API), sign-in throttling, "stored before anything else" (requirement 6).
- Risk call: **AC-3 (isolation) is tested hardest** — personal data across users is the highest-impact defect here.
  Every resource type the API exposes gets a cross-user case, not only messages.
- Not in this round: open sign-up, self-reset, roles beyond owner/user (REQ Out of Scope). iOS (out of round 1).
- Boundary of the verdict: the files named by the TASKs Team A is given for REQ-001. Anything else → Observations.

## Instrument limits
- Direct API calls (curl / harness script): prove the server's refusals. Hiding a button in the UI proves nothing.
- Headless browser on the admin web: proves the owner's flows and wording; desktop width only — the admin web is
  the owner's page, phone widths are not a stated need (`[QA-decided]`, cheap to add).
- Android emulator: proves the app's sign-in and lists; not a real phone's push (that is REQ-005).
- Until the app exists, AC-1 / AC-3 / AC-4 can be run at API level only; the app half stays `NOT_TESTED` until then.

## Test data (all local)
- Owner account (however the SPEC seeds it). Users U1, U2 with made-up names and `@example.test` emails; each with at
  least one message, one condition, one connected channel — created through the product, not by hand-written SQL
  where the product can create it.

## Cases
| # | Case (from AC) | Type | Surface | Steps | Expected | Actual | Evidence | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | AC-1 owner adds U1 → U1 signs in | happy | admin web + app | owner signs in, "เพิ่มผู้ใช้", name/email/password; U1 signs in on the app | U1 is in; the app title reads "เข้าสู่ระบบ corner-chat" before sign-in | | | |
| 2 | AC-1 add with an email already used | negative | admin web | add U1's email again | refused, visible message, no second account | | | |
| 3 | AC-1 add with empty / malformed email, empty password | negative | admin web + API | submit each | refused at the server (API call too), no account | | | |
| 4 | AC-1 wrong email or password | negative | app | wrong password; unknown email | both show exactly "อีเมลหรือรหัสผ่านไม่ถูกต้อง" (same text — no hint which one was wrong) | | | |
| 5 | AC-2 user account on the admin web | permission | admin web + API | U1 signs in to admin web; U1's token calls each admin API (add, disable, reset, list) | all refused at the server | | | |
| 6 | AC-2 no token at all | permission | API | call each admin and user API without a token | all refused | | | |
| 7 | AC-3 U1 lists | permission | app | U1 signed in: messages, conditions, channels lists | none of U2's items | | | |
| 8 | AC-3 U1 token + U2 ids | permission | API | for **every** resource type (message, condition/rule, channel, AI decision, correction, bar): read, change, delete with U2's id | "not found / not allowed"; U2's data unchanged afterwards | | | |
| 9 | AC-3 U1 creates with U2 as owner | permission | API | create a condition/rule with a `user_id` (or similar) field set to U2 | stored as U1's or refused — never U2's | | | |
| 10 | AC-4 disabled U1 signs in | state | app | owner "ปิดใช้งาน" U1; U1 signs in | refused with "บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล" | | | |
| 11 | AC-4 disabled U1, already signed in | state | app + API | U1 signed in; owner disables; U1 uses the app / its token | see Q1 — default: refused at once | | | |
| 12 | AC-4 message for disabled U1 | state | back end | disable U1; a mail arrives in U1's connected test mailbox | no notification; nothing new taken in (no new row) — requirement 4 | | | |
| 13 | AC-4 enable again | state | admin web + app | owner "เปิดใช้งาน" U1 | U1 signs in again; whether mail that arrived while disabled is taken in is reported, not judged (REQ silent) | | | |
| 14 | AC-5 reset password | state | admin web + app | owner "ตั้งรหัสผ่านใหม่" for U1; old password; new password | old refused, new works | | | |
| 15 | AC-5 sign-in made before the reset | state | app + API | as #11, but reset instead of disable | see Q1 | | | |
| 16 | AC-6 5 wrong in a row | boundary | app + API | 4 wrong → 5th wrong → right | 4 wrong: normal wording · after 5: "ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่" · right password after the wait works (exact numbers: Q2) | | | |
| 17 | AC-6 counter resets | boundary | API | 4 wrong → right → 4 wrong | no block (4 + 4 not in a row) | | | |
| 18 | AC-6 one user's block does not block another | negative | API | block U1; U2 signs in | U2 in | | | |
| 19 | Req. 6 stored before anything else | state | back end | stop the back end right after intake, before the filter runs (seam: Q3); restart | the message is there and is then filtered once | | | |
| 20 | Req. 5 nothing auto-deleted | regression | back end | (long-run: re-check the oldest test rows at each later round) | still there | | | |
| 21 | Secrets | negative | API + logs | sign-in responses, admin user list, back-end logs | no password or hash ever returned or logged | | | |

## Defects
(none — not run)

## Observations (not ours)

## Test data created
| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| none yet — design only | — | — |

## Verdict
Not run — `DRAFT`. Verdict after SPEC_DONE on the named build.

## Evidence (decisive)
(at run time)

## Questions
(For the PM — answers as `> answer: ...`. Defaults are what I test if the answer is "yes".)
- **Q1 — an existing sign-in when the owner disables or resets.** The REQ says sign-in is refused; it does not say what
  happens to a user who is already signed in. Default: **the next app action / API call with the old sign-in is refused
  at once** (disabled → the disabled wording; reset → back to the sign-in screen). Cases #11, #15.
  Checked: DECISIONS (D9, round-1 shape) · SYSTEM-FACTS · REQ-001 — not covered.
- **Q2 — AC-6 exact numbers.** "slowed or blocked for a few minutes" cannot be checked as written. Default: **per account
  (email), 5 wrong in a row → refused for 5 minutes with the too-many-tries wording, even with the right password; the
  count resets on a right sign-in.** Cases #16–#18. Checked: REQ-001 AC-6 `[team-proposed]` — numbers not stated.
- **Q3 — test seams (for the SA, via you).** Case #19 needs a way to stop the back end between intake and the filter
  (or a pause switch) on local. Same request is in TEST-002 Q1 and TEST-003 Q1 — one SPEC section can answer all three.

> answers `[PM-decided 2026-11-01, under the owner's standing instruction; listed as D23–D26 in project-docs/decisions-for-owner-review.md]`:
> Q1 default accepted — the next call with the old sign-in is refused at once. · Q2 default accepted — per email, 5 wrong
> in a row → refused 5 minutes, reset on a right sign-in (REQ-001 AC-6 amended). · Q3 → SA Team A as a testability
> requirement (REQ-001/-002/-004 § Questions, relayed 2026-11-01).
