# REQ-002: A user's own Zimbra mail comes in, and they can reply to it from the app
- Status: READY_FOR_SA
- Priority: HIGH `[team-proposed]`
- Requested: 2026-11-01 by the owner — stamp: operator (shape) · operator-delegated (details)
- Deadline: none
- Depends on: REQ-001 (users) · its mail is filtered by REQ-004
- Source: `SYSTEM-FACTS.md` · understanding doc §1c, §Q1-SA, §Q3-SA

## Problem / Goal
A user wants their mail in corner-chat, filtered, and wants to answer the sender without opening Zimbra.
> "แบบ ข คืออยากได้" (reply from corner-chat) · "Zimbra ก่อน" · reply = Zimbra two-way ("ใช่ รับอย่างเดียว" for LINE groups only) (operator, 2026-11-01)

## Requirement
1. In the app, a user connects **their own** Zimbra mailbox on `mail.entronica.in.th` with their email + password; the
   app says whether the connection worked.
2. New mail in that mailbox's inbox is taken in within **2 minutes** `[team-proposed]`, stored once (never twice), with
   sender, To/Cc, subject, date and text (Thai text readable, also from HTML-only mail).
3. Mail sent **to** the user is marked differently from mail where the user is only in Cc or on a list (input to REQ-004 layer 1).
4. Attachments are not copied; the message notes "มีไฟล์แนบ" with the file names `[D7]`.
5. From a mail message in the app, the user writes a reply; it is sent **from their own address**, lands in the same
   thread at the sender (Re: subject, thread headers), and a copy is in the user's Sent folder `[D8]`.
6. A reply that fails to send says so in the app and can be retried; it is never silently lost.
7. The mailbox password is stored encrypted; it is never shown again, logged, or returned by the API `[D14]`.
8. The user can disconnect the mailbox; nothing new is taken in after that.

## Acceptance Criteria
- [ ] **AC-1** — **Given** a test mailbox **When** the user connects it with the right password **Then** the app shows it connected; with a wrong password it shows the wording below and stores nothing.
  - Check: QA — test mailbox (owner-provided, B2).
- [ ] **AC-2** — **Given** a connected mailbox **When** a mail arrives **Then** within 2 minutes it is in corner-chat once, with sender, subject and readable Thai body.
  - Check: QA — send from the second test mailbox; check no duplicate after restarting the back end.
- [ ] **AC-3** — **Given** a mail where the user is only in Cc **When** it is taken in **Then** it is marked "Cc", not "to me".
  - Check: QA.
- [ ] **AC-4** — **Given** a mail with a PDF **When** taken in **Then** the app shows "มีไฟล์แนบ: <name>.pdf" and the file is not stored.
  - Check: QA.
- [ ] **AC-5** — **Given** a taken-in mail **When** the user sends a reply from the app **Then** the sender receives it from the user's address, in the same thread, and it is in the user's Sent folder.
  - Check: QA — open both test mailboxes in Zimbra webmail.
- [ ] **AC-6** — **Given** the mail server is unreachable **When** the user sends a reply **Then** the app shows "ส่งไม่สำเร็จ" with a retry; after the server is back, retry delivers it once.
  - Check: QA.
- [ ] **AC-7** — the stored mailbox password is not readable in the database, logs or API responses.
  - Check: QA + SA review evidence.
- [ ] **AC-8** — regression: REQ-001 AC-3 (one user never sees another's mail) still holds with two connected mailboxes.
  - Check: QA.

## User-facing wording
| Where | TH |
|---|---|
| Connect mail screen title | เชื่อมอีเมล Zimbra |
| Connected | เชื่อมแล้ว |
| Wrong mail password | เชื่อมไม่สำเร็จ ตรวจอีเมลหรือรหัสผ่านอีกครั้ง |
| Cc marker | สำเนาถึงคุณ |
| Attachment note | มีไฟล์แนบ: {names} |
| Reply button | ตอบกลับ |
| Send failed | ส่งไม่สำเร็จ ลองอีกครั้ง |
| Sent | ส่งแล้ว |
| Disconnect | เลิกเชื่อม |

## Constraints
- **Real systems:** only the owner's **test** mailboxes (B2). Sending from or to any real person's mailbox needs the owner's go each time (`SYSTEM-FACTS.md`).
- Password only in the database encrypted / `.env` keys; never in git.

## Out of Scope
Gmail, Outlook · folders other than Inbox · forwarding · sending new mail (not a reply) · attachments in replies · copying attachment files.

## Questions
- **Amended 2026-11-01 by the PM** (QA Tanya TEST-002 Q3, PM-decided): a mail where the user is only in **Bcc** counts as "to me".
  Testability: IMAP/SMTP host + port as `.env` settings (REQ-001 § Questions).
