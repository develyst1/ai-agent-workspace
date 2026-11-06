# REQ-002: A user's own Zimbra mail comes in, and they can reply to it from the app
- Status: DELIVERED (2026-11-01, PM — TEST-002 run 2 PASS: stand-in 48/48, app 15/15, the owner's real-Zimbra window qa7k 3/3 for Thai + threading)
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

**Q-SA-1 — wording for a mail too large to import (SA Sober, 2026-11-01, from BE Jason's TASK-003).** Not blocking.
`Checked:` the wording table above and Q&A here — not covered. A mail over 15 MB is not downloaded. Its row shows the sender
and subject, and a preview line that today reads (developer English) `[message too large to import: N MB]`. One Thai line
with `{n}` = size in MB, e.g. "อีเมลใหญ่เกินไป ({n} MB) เปิดอ่านใน Zimbra". My default: keep the row (the user still sees that
the mail came) rather than drop it.
> answer `[PM, UX writer, 2026-11-01]`: keep the row (your default). Wording: **อีเมลนี้ใหญ่เกินไป ({n} MB) เปิดอ่านใน Zimbra**

**Q-SA-2 — should a reply quote the original mail? (SA Sober, 2026-11-01, from TASK-004.)** Not blocking. `Checked:` REQ-002 req 5
says "lands in the same thread" and nothing about quoting. Built today: the reply body is exactly what the user typed, with no
quoted original and no signature. The mail threads correctly, so Zimbra and Gmail show it under the original. My default: no
quote in round 1. Alternative: append `เมื่อ {date} {sender} เขียนว่า:` and the original, each line starting with `> `. Also
recorded `[SA-decided, Interpreted from the owner's "ตอบกลับ คนที่ทักเขามา"]`: the reply goes to the sender only (no reply-all,
not to a mailing list).
> answer `[PM-decided 2026-11-01, listed D37]`: your default — **no quote, no signature in round 1**; the reply goes to the sender only. Threading is enough.
- **Q-PM-B2 (PM → SA-A, 2026-11-01).** The owner offers his own **work mail** and his **personal mail** as the B2 test boxes
  (*"เอา เมล ทำงานฉัน กับเมลส่วนตัวฉันได้มั้ย"*). For the REQ-002 live check, which of the two boxes must be on Zimbra
  (`mail.entronica.in.th`), and can the other one be any mail service, used only as the sender and the reply's recipient? What does
  the test do to his real mailbox (what it reads, what it sends and to whom, what appears in his Sent folder)? Please answer in plain words.
  > answer (SA Sober, 2026-11-01). Checked: `corner-chat-back` `src/modules/mail/{poller,connection,outbox}.ts`, TASK-003/004 DoD.
  > **Yes, that works.**
  >
  > **Which box is which:**
  > - The **work mail** must be the Zimbra box (A). It is the only one the app connects to.
  > - The **personal mail** (B) can be any service, such as Gmail. It only sends the test mails and receives the replies. The app
  >   never logs into it.
  >
  > **What the test does to the work mailbox:**
  > - **Reads:** only mail that **arrives after** the test connects. At connect, the app records where the INBOX ends now and never
  >   looks at anything older (`poller.ts`). Other folders are never read.
  >   - Every new mail that arrives in that window is taken in, including real work mail. Its subject, text and sender are copied
  >     into a **throwaway local database**, and its text goes to the owner's own AI gateway to be judged.
  >   - So keep the window short, about 15 minutes. The engineer disconnects at the end and drops that database.
  > - **Read marks:** it should not mark mail as read, because it fetches without setting "seen". `inferred — imapflow fetches with
  >   PEEK; the first run settles it`. If a mail does turn "read", the engineer stops and reports it.
  > - **Sends:** only replies that the test itself triggers, from the work address to the **personal** address. That is about 2
  >   replies in total: one normal reply, and one that fails and is then retried. Nothing goes to anyone else.
  > - **Sent folder:** each reply leaves one copy there. If Zimbra also keeps its own copy, there are two. The test checks for that
  >   and switches our copy off (`MAIL_APPEND_SENT=false`).
  > - **Password:** it is stored encrypted, only in that throwaway database, and is deleted at disconnect. It is never printed or
  >   logged, and it lives only in the engineer's git-ignored `.env`.
  > - **No push:** no LINE and no phone push is set up for this test.
  >
  > **What changes because B is not on Zimbra:**
  > - TASK-004's "B's Zimbra webmail shows it in the same conversation" becomes "**B's own mail app** shows the reply in the same
  >   conversation".
  > - TASK-003's isolation line ("U1 and U2 each connected") becomes: U1 connected to A, and U2 with no mail connected. U2 then sees
  >   none of A's mail or channel. This is a weaker check; the full two-account version is already covered by the automated tests.
  > - TASK-003's "No real mailbox, ever" is lifted **only for these two boxes**, on the owner's own words above.
  >
  > **What the PM puts in `.env` (via the owner):** `TEST_MAIL_A_EMAIL` / `TEST_MAIL_A_PASSWORD` for the work box, and
  > `TEST_MAIL_B_EMAIL` for the personal box. The personal box's password is **not needed**. The owner types them in himself;
  > they are never pasted in chat.
  >
  > **The D1 branch:** noted. Git stays the owner's command, as always.
- **TEST_FAILED 2026-11-01 (QA Tanya, TEST-002 run 1, DEF-1 MAJOR). The PM routes it to SA Team A as REQ content.** After the
  user leaves the reply screen, a failed reply shows "ส่งไม่สำเร็จ ลองอีกครั้ง" on the message detail with nothing to tap. The
  only way out is to type the reply again. This breaks AC-6 ("with a retry") and req 6 ("never silently lost").
  **What the requirement needs:** a failed reply can be retried from the app wherever the user finds it again (the message detail).
  The how is the SA's. The API retry already works (#17). Evidence: `tests/TEST-002-…` § Defects DEF-1. Everything else passes:
  stand-in 48/48, app 13/14.
