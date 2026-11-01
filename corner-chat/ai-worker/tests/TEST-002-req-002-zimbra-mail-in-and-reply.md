# TEST-002: A user's own Zimbra mail comes in, and they reply from the app
- Team: A · TASKs: — (not cut yet; no SPEC)
- Source REQ: REQ-002 (ACs tested: AC-1 … AC-8, plus requirement 6 and 8)
- Status: DRAFT — designed 2026-11-01 from the REQ, before the build; no verdict before SPEC_DONE
- Build under test: `corner-chat-back`, `corner-chat-app` — branch and HEAD sha filled at run time
- Surfaces: local back end · Android app on emulator · Zimbra webmail of the **two owner-provided test mailboxes**
  (`mail.entronica.in.th`, B2 — not given yet) · local database (read only, for AC-7 and duplicates)
- Tested: — (designed 2026-11-01 by Tanya)

## Scope
- In: connect / wrong password / disconnect, intake within 2 minutes, no duplicates (incl. restart), To vs Cc,
  attachments noted not stored, Thai text in several encodings, reply from the user's own address in the same thread
  with a Sent copy, failed send + retry once, mailbox password never readable, cross-user isolation.
- Risk call: **AC-7 (stored mail password) and AC-6 (reply never lost, never sent twice) are the highest-impact.**
  AC-2's "once, never twice" is tested across a restart and across two polls of the same mail.
- **Real system:** only the two test mailboxes. Every mail in this round is between them; nothing goes to a real person
  (`SYSTEM-FACTS.md`). Mail I send is marked `[corner-chat TEST-002 #n]` in the subject.
- Not in this round: Gmail/Outlook, folders other than Inbox, forwarding, new mail, attachments in replies (Out of Scope).
- Blocked until given: B2 (test mailboxes). Without them every case is `NOT_TESTED`.

## Instrument limits
- Zimbra webmail: proves what the sender really received (From, thread, Sent copy). The app showing "ส่งแล้ว" proves
  only that the app believes it sent.
- Mail I send to set up a case is sent from test mailbox 2 by a harness (`tests/harness/`) that reads that mailbox's
  password from a file outside the repo and never prints it — so I can send TIS-620, quoted-printable and HTML-only mail,
  which webmail cannot produce on purpose.
- Local DB read: proves what is stored (password not plain text, no duplicate row); local only.
- "Mail server unreachable" can only be made locally (Q1) — I never touch the real server or my machine's firewall.

## Cases
| # | Case (from AC) | Type | Surface | Steps | Expected | Actual | Evidence | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | AC-1 connect right password | happy | app | "เชื่อมอีเมล Zimbra", test mailbox 1 | "เชื่อมแล้ว" | | | |
| 2 | AC-1 wrong password | negative | app + DB | wrong password | "เชื่อมไม่สำเร็จ ตรวจอีเมลหรือรหัสผ่านอีกครั้ง"; no mailbox row / no stored password | | | |
| 3 | AC-1 mailbox on another host / malformed email | negative | app + API | `x@example.test`, `notanemail` | refused with the same wording or a field error; nothing stored | | | |
| 4 | AC-2 intake within 2 minutes | boundary | app | send 5 mails 1→2 min apart; time from Zimbra arrival to visible in corner-chat | all 5 ≤ 120 s; each time recorded | | | |
| 5 | AC-2 no duplicate after restart | state | back end + DB | mail arrives → taken in → restart back end → wait 2 polls | exactly one row per mail | | | |
| 6 | AC-2 mail read in webmail first | state | webmail + app | open the mail in webmail (marked read) before the poll | still taken in once (read/unread must not decide) | | | |
| 7 | AC-2 Thai encodings | data shape | app | UTF-8 plain · TIS-620 / windows-874 · quoted-printable · base64 · HTML-only (no text part) · Thai subject (RFC 2047) | subject and body readable Thai in every case; HTML shows as text, no tags | | | |
| 8 | AC-2 empty subject / empty body / very long body | data shape | app | send each | taken in, no crash, shown sensibly | | | |
| 9 | AC-3 user only in Cc | happy | app | 1 is Cc, To is someone else (test mailbox 2 itself) | marked "สำเนาถึงคุณ", not "to me" | | | |
| 10 | AC-3 user in To **and** Cc / in Bcc | boundary | app | send each | To+Cc → "to me" · Bcc → reported (REQ silent; see Q3) | | | |
| 11 | AC-4 PDF attached | happy | app + DB | one PDF | "มีไฟล์แนบ: <name>.pdf"; no file content stored | | | |
| 12 | AC-4 several files, Thai file name | data shape | app | 2 files, one named in Thai | "มีไฟล์แนบ: a.pdf, รายงาน.xlsx" readable | | | |
| 13 | AC-5 reply | happy | app + webmail | reply to #1's mail from the app | at mailbox 2: From = test mailbox 1, subject "Re: …", in the same thread (In-Reply-To / References in the raw source); copy in mailbox 1's Sent | | | |
| 14 | AC-5 reply to a reply | state | app + webmail | 2 answers #13; user replies again | still one thread at both ends | | | |
| 15 | AC-5 reply with Thai text | data shape | webmail | reply in Thai | readable Thai at the receiver | | | |
| 16 | AC-6 server unreachable | negative | app | local back end pointed at an unreachable mail host (Q1); send a reply | "ส่งไม่สำเร็จ ลองอีกครั้ง" with retry; nothing at mailbox 2 | | | |
| 17 | AC-6 retry delivers once | state | app + webmail | point back to the real host; tap retry; then tap retry again / double-tap | exactly **one** mail at mailbox 2; one Sent copy; app shows "ส่งแล้ว" | | | |
| 18 | AC-6 app closed after a failed send | state | app | fail a send, kill the app, reopen | the failed reply is still there with retry (never silently lost, req. 6) | | | |
| 19 | AC-7 password at rest | negative | DB | read the mailbox row | password not readable (not plain, not base64 of plain) | | | |
| 20 | AC-7 password in logs / API | negative | logs + API | grep back-end logs for the password; call every mailbox API | absent everywhere | | | |
| 21 | Req. 8 disconnect | state | app | "เลิกเชื่อม"; send a mail | not taken in; earlier mail still shown (D13) | | | |
| 22 | AC-8 two users, two mailboxes | regression | app + API | U1 has mailbox 1, U2 has mailbox 2; TEST-001 #7–#9 for mail | neither sees the other's mail, mailbox or password field | | | |
| 23 | Mailbox password changed in Zimbra | state | app | — | NOT_TESTED by design: changing a test mailbox's password is a change to a real system the owner gave us; ask first if wanted | | | |

## Defects
(none — not run)

## Observations (not ours)

## Test data created
| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| none yet — design only. At run time: mails marked `[corner-chat TEST-002 #n]` | test mailboxes 1 and 2 (owner's) | left in place — deleting mail is the owner's call, not mine |

## Verdict
Not run — `DRAFT`. Needs B2 and SPEC_DONE.

## Evidence (decisive)
(at run time)

## Questions
(For the PM — answers as `> answer: ...`. Defaults are what I test if the answer is "yes".)
- **Q1 — test seam for "mail server unreachable" (for the SA, via you).** I may not touch the real Zimbra server or my
  machine's network settings. Default: **the back end's IMAP/SMTP host and port are settings in its local `.env`**, so I
  run it once pointed at a closed local port. Same seam family as TEST-001 Q3 and TEST-003 Q1.
- **Q2 — sending set-up mail from test mailbox 2 by a harness.** Default: allowed — it is the owner's test mailbox, used
  only between the two test mailboxes; its password sits in a file outside the repo that I never open or print.
  Checked: SYSTEM-FACTS (real systems: test accounts by default) — I read this as covered; say if not.
- **Q3 — mail where the user is only in Bcc** (#10): "to me" or "Cc"? Default: **"to me"** (it was sent to them
  privately). Low impact; report-only if you'd rather leave it.

> answers `[PM-decided 2026-11-01, under the owner's standing instruction]`: Q1 → SA Team A (testability requirement:
> IMAP/SMTP host + port as local `.env` settings). · Q2 yes — your reading is right: the owner's test mailboxes only,
> mail only between them, the password in a file you never open or print. · Q3 default accepted — Bcc = "to me".
