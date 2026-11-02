# TEST-002: A user's own Zimbra mail comes in, and they reply from the app
- Team: A · TASKs: TASK-003, TASK-004 (back end) · TASK-029 (app mail screens) · SPEC-001
- Source REQ: REQ-002 (ACs tested: AC-1 … AC-8, plus requirement 6 and 8)
- Status: **TEST_PASSED** (2026-11-01, run 2) — DEF-1 fixed (TASK-036) and verified: the detail's retry delivers a failed
  reply once. Run 1 was `TEST_FAILED` on DEF-1; its record is kept below.
- Build under test: back `corner-chat-back` working tree, fingerprint **`7808f3edcccd951c`** (runs 1, 2 and the owner window) ·
  app `src/` **`bc72845cb2e93213`** (run 1) → **`25db873933ee2df2`** (run 2, after TASK-036). Each was unchanged before and after its
  run (`harness/qa-a/fingerprint.ts`).
- Surfaces: QA's own back end (127.0.0.1:8191) on `corner_chat_test_qa_a` on the owner's server (created and dropped through
  `postgres`, TEST-001 Q5) · the team's **local mail stand-in** (hoodiecrow IMAP + smtp-server, `test/support/mail-server.ts`) ·
  the app's browser build at 360×800, headless · the real Zimbra (`mail.entronica.in.th`) **only in the owner window**
- Tested: 2026-11-01 by Tanya (22:22–22:38 +07)

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

## Design change at run time (REQ-002 § Questions Q-PM-B2)
Box A is the owner's **real work mailbox** (every work mail that arrives while it is connected is taken in), and box B is his
personal mail with **no password given**. So the harness cannot send set-up mail from B (Q2's plan), and the window on A
must stay short. Every row the real server is not needed for runs on the **local stand-in**: no real mail at all. Only
what only Zimbra can prove (real connect, real Thai, real arrival time, threading in the receiver's own mail app) goes to
**one owner window**.

## Run 1 — 2026-11-01 — stand-in + app
- `harness/qa-a/test-002-stand.ts` → **48/48 PASS** (`test-002-stand-result.json`). Two earlier attempts in the same sitting had
  failures that were **mine**, not the product's. My `eml()` handed Thai as a JS string, which the stand-in cut to low bytes
  (5 false FAILs). Another check listed a tab before the filter had decided (1 false FAIL). Both were fixed in the script, and the
  run was repeated on a fresh database.
- `harness/qa-a/app-mail.mjs` (app browser build, 360 px, `data-testid`, stand-in + QA back end) → **13/14**; the one FAIL is DEF-1.

| # | Result | Actual |
|---|---|---|
| 1 (stand-in, app) | **PASS** | right password → 200 connected; app: title "เชื่อมอีเมล Zimbra" → "เชื่อมแล้ว" + the address — `shots/m02-connected.png` |
| 1 (real Zimbra) | owner window | — |
| 2 | **PASS** | wrong password → 422 `MAIL_LOGIN_FAILED`, 0 `mail_accounts` rows; app "เชื่อมไม่สำเร็จ ตรวจอีเมลหรือรหัสผ่านอีกครั้ง", the password field cleared — `m01-wrong-password.png` |
| 3 | **PASS** | malformed email / empty password → 400; an address the server does not know → 422; nothing stored |
| (SPEC §6) | **PASS** | mail already in INBOX before connect is not taken in (no backfill) |
| 4 (stand-in) | **PASS** | taken in 2.7 s after delivery (poll 3 s), once |
| 4 (real) | owner window | — |
| 5 | **PASS** | back end restarted + 3 polls → 19 → 19 rows, 0 duplicates |
| 6 | **PASS** | the poller set `\Seen` on 0 of 20 messages |
| 7 (stand-in, app) | **PASS** | readable Thai from: UTF-8 8bit · TIS-620 · windows-874 · quoted-printable · base64 · HTML-only (no tags) · UTF-8 subject (RFC 2047 B) · TIS-620 subject; app detail shows the Thai subject and body |
| 7 (real) | owner window | — |
| 8 | **PASS** | no subject / empty body / 200 KB body → taken in once each |
| 9 | **PASS** | only in Cc → `cc`; app "สำเนาถึงคุณ" — `m03-cc-marker.png` |
| 10 | **PASS** | To + Cc → `to` · only Bcc → `to` (Q3) · `List-Id` → `list` |
| 11 | **PASS** | PDF → `hasAttachments`, `["report.pdf"]`, file content not stored |
| 12 | **PASS** | `["a.pdf","รายงาน.xlsx"]` (Thai name, RFC 2047); app "มีไฟล์แนบ: a.pdf, รายงาน.xlsx" — `m04-attachments.png` |
| Q-SA-1 | **PASS** | a 16 MB mail: row kept, text "อีเมลนี้ใหญ่เกินไป (16.0 MB) เปิดอ่านใน Zimbra" (see Observation on "16.0") |
| 13 (stand-in, app) | **PASS** | 202 → sent; from A to the sender **only** (also for a mail that had Cc — D37); `Re: <Thai subject>` once; `In-Reply-To` = the original Message-ID; `References` holds it; 1 copy in A's Sent; app "ส่งแล้ว" — `m05-reply-sent.png`; reply to LINE → 400 `NOT_MAIL`; empty body → 400 |
| 13/14 (real threading in B's own app) | owner window | — |
| 14 | **PASS** | reply to a reply: `Re:` not doubled, `In-Reply-To` = that mail, `References` keep the chain |
| 15 | **PASS** | a Thai reply body survives the SMTP round trip byte-exact |
| 16 | **PASS** | SMTP unreachable → `failed` + error `SMTP server unreachable (connect ECONNREFUSED …)`, nothing reaches the server; app "ส่งไม่สำเร็จ ลองอีกครั้ง" + a retry button — `m06-reply-failed.png` |
| 17 | **PASS** | retry → sent once; retry again → 409 `NOT_FAILED`; a double-tap retry (two calls at once) → 202 + 409, exactly one mail; app: retry on the same screen → "ส่งแล้ว", 2 SMTP messages in all — `m07-retried.png` |
| 18 | **FAIL — DEF-1** | the failed reply survives a back-end restart (API, PASS) and is listed on the detail as "ส่งไม่สำเร็จ ลองอีกครั้ง" — but with **no retry control** once the user has left the reply screen |
| 19 | **PASS** | `password_enc` 64 chars; neither the plain password nor its base64 is in it |
| 20 | **PASS** | `GET /channels` and the connect reply carry no password; the back-end log (58 lines, 4 starts) holds no password and no database URL |
| 21 | **PASS** | disconnect (API and app) → 204, password row gone, a new mail is not taken in for U1, old mail kept, a reply → 409 `MAIL_NOT_CONNECTED` |
| 22 | **PASS** | U2 on a second login: sees only its own mailbox; U1's mail, reply and retry by id → 404 |
| 23 | NOT_TESTED by design | changing the owner's mailbox password is a change to his real system |

## Owner window — the real-Zimbra rows (one sitting, about 15 minutes)
**What only the real server can prove:** #1 a real connect · #4 real arrival time · #7 Thai from a real client through the real
server · #13/#14 that **his own mail app** shows the reply in the same conversation, from his work address, with Thai readable.
**What happens to his mailboxes:** QA's back end connects to the work box (A) and copies in **only mail that arrives during
the window** (subject, text, sender) into QA's throwaway database, **dropped at the end**. The AI gateway and LINE point at closed
local ports, so **no real mail text leaves this machine**. Nothing is marked read (checked by read-only counts before/after).
**One** reply goes from A to his personal box (B), and to no one else. My side: `harness/qa-a/test-002-live.ts <code>`.

**Click-script for the owner** (the PM relays it in Thai):
1. **Why:** to see Thai mail and a reply thread on the real mail server, which the test server cannot show.
2. At the agreed time, Tanya says "พร้อม" through the PM, with a short code word (e.g. `qa7`).
3. From your **personal** mail (B), send one mail to your **work** mail (A):
   subject `[corner-chat TEST-002] ทดสอบภาษาไทย <code>`, body two Thai lines (anything, e.g. "ทดสอบภาษาไทย / ตอบกลับด้วยนะครับ").
4. Wait for a reply in your **personal** mail app (usually within 2 minutes of Tanya's "ส่งแล้ว").
5. Look at it:
   - ✅ it is from your **work** address; it sits **in the same conversation** as the mail you sent; the subject is
     `Re: [corner-chat TEST-002] ทดสอบภาษาไทย <code>`; the Thai reads correctly (`ได้รับแล้วครับ ทดสอบตอบกลับภาษาไทย <code>`).
   - ❌ a separate conversation, garbled Thai, or a sender other than your work address.
6. Tell the PM: ✅ or ❌ for each point, plus one screenshot of the conversation.
7. **Cleanup:** nothing for you. The test mail and the reply stay in your boxes; delete them if you like. Tanya disconnects,
   drops her database, and reports the before/after counts.

## Owner window run — 2026-11-01 22:43–22:54 (+07), code `qa7k`
The owner's go: *"พร้อม"* (relayed by the PM, inbox/QA.md 2026-11-01). Back `7808f3ed…` (unchanged), QA's own DB on the owner's
server, `--real-mail`, poll 10 s, AI gateway and LINE on closed local ports. Output `harness/qa-a/live-qa7k.out` +
`test-002-live-qa7k.json` (the owner's two addresses redacted from these and the back-end logs after the run).

| # | Result | Actual (real Zimbra `mail.entronica.in.th`) |
|---|---|---|
| 1 (real) | **PASS** | connect with the work mailbox → 200 `connected=true` |
| 4 (real) | **PASS** | his mail stored **6 s** after its `Date` header (it reached the server 9.7 min after my "พร้อม" — his sending time, not ours) |
| 7 (real) | **PASS** | subject `[corner-chat TEST-002] ทดสอบภาษาไทย qa7k` and body "ทดสอบภาษาไทย / ตอบกลับด้วยนะครับ" exact, no U+FFFD; `recipient_kind` `to` |
| 13 (real, sending) | **PASS** | one Thai reply → 202 → `sent` at 22:53:41; to B only |
| 13 (real, Sent copy) | **PASS** | work Sent 2 → **3** (one copy) |
| 6 (real) | **PASS** | INBOX 153 → 154, unread 81 → **82**: only his one new mail arrived, and nothing was marked read |
| 20 / 21 (real) | **PASS** | back-end log 12 lines, the mailbox password absent · disconnect 204 · database dropped, nothing running |
| 13/14 (real, his mail app) | **PASS** | the owner's own check (steps 5–6, relayed by the PM 2026-11-01): 3/3 ✅. I looked at his screenshot `harness/qa-a/shots/owner-qa7k-thread.png` myself: one conversation under `[corner-chat TEST-002] ทดสอบภาษาไทย qa7k` holding his mail and the reply · the reply is from his work address · the body "ได้รับแล้วครับ ทดสอบตอบกลับภาษาไทย qa7k" reads correctly (his mail app labels it Thai). An earlier engineer test reply also threads (2 in one thread) |

## Run 2 — 2026-11-01 22:56–22:58 — re-test after TASK-036 (app `25db8739…`, back `7808f3ed…`)
The whole app mail script re-ran (every app row, not only #18), with one row added: the detail's retry must **deliver**, not
just exist. `harness/qa-a/app-mail.mjs` → **15/15 PASS** (`app-mail-result.json`). The back end is unchanged, so the stand-in
suite's 48/48 (run 1) still names this back end.

| # | Result | Actual |
|---|---|---|
| 16, 17 | **PASS** | unchanged behaviour on the reply screen: failure + retry button; retry in place → ส่งแล้ว |
| 18 | **PASS** | after leaving the reply screen and reloading, the failed reply is listed as "ส่งไม่สำเร็จ ลองอีกครั้ง" **with a "ลองอีกครั้ง" button** (`detail-reply-retry-<id>`) — `shots/m08-detail-failed-with-retry-run2.png` |
| 18 | **PASS** | server back up → press it → the failed status goes, **exactly one** more mail reaches the server (2 → 3) — `m09-detail-retried.png` |
| 1, 2, 7, 9, 12, 13, 21 | **PASS** | as run 1, on the new app build |

## Defects
### DEF-1 — **FIXED, verified 2026-11-01 (run 2, TASK-036)**: the detail now offers a retry, and it delivers once
#### (run 1 record, kept) a failed mail reply cannot be retried after the user leaves the reply screen — MAJOR
- Build / surface: app `src/` `bc72845c…` (browser build, 360×800; the same screens ship in the APK) · back `7808f3ed…`
- Preconditions: U1 connected to a mailbox; the SMTP server is unreachable when the reply is sent
- Repro (from a clean state):
  1. Open a mail → "ตอบกลับ" → type a reply → send. The reply screen shows "ส่งไม่สำเร็จ ลองอีกครั้ง" and a retry button.
  2. Leave the reply screen (back to the message), or close and reopen the app.
  3. The message detail lists the reply with the status text "ส่งไม่สำเร็จ ลองอีกครั้ง". There is no retry button or link on
     the detail, and no other screen offers one (`[data-testid*=retry]` count 0, no button named ลองอีกครั้ง).
- Expected: REQ-002 AC-6, "the app shows ส่งไม่สำเร็จ with a retry", and req. 6, "can be retried; it is never silently lost".
  TEST-002 #18: "the failed reply is still there **with retry**".
- Actual: shown, but not retryable from the app. The API still holds it (`status: failed`), and `POST /replies/:id/retry`
  works (#17, API). The only way out for the user is to type the reply again.
- Frequency: always (2 of 2 runs).
- Evidence (run 1): the screenshot `m08-detail-failed-no-retry.png` showed the last reply as "ส่งไม่สำเร็จ ลองอีกครั้ง" with no
  control. **Run 2 overwrote it** (same file name; my script, now unique per run). What remains of run 1: this description, the
  run-1 log entry (`log/2026-11-01.2.md`: "0 retry controls · API failed replies 1"), and `m06-reply-failed.png`.
- Linked case: #18. (No proposed fix.)

## Observations (not ours to judge)
- (owner window) The back end writes the connected mailbox's **address** into its log (2 lines in `backend-live.log`). It is not a
  secret, but it is a real person's address in a log file. For the PM, as SA Team A's call.
- The too-large row reads "(16.0 MB)". The PM's line is "({n} MB)", so a whole number may have been meant. Wording point for the PM.
- ~~The status text "ส่งไม่สำเร็จ ลองอีกครั้ง" appears on the detail, where nothing can be tapped.~~ Gone with DEF-1's fix (run 2).

## Test data created
| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| database `corner_chat_test_qa_a` (users `t2-*`, `am-*`, `live-qa7k@qa-a.test`, made-up mail; in the window also his one test mail) | owner's server | **dropped** after every run (last: 22:58) |
| made-up mails `[corner-chat TEST-002 …]` | the local stand-in (in memory) | gone with the stand-in |
| owner window: his one test mail to A, my one reply to B, one Sent copy in A | his own boxes | left; deleting them is his call |
| his inbox screenshot `harness/qa-a/shots/owner-qa7k-thread.png` (saved by the PM) | workspace harness folder | holds his real inbox (other senders, his addresses); flagged to the PM — crop or move it out is his/the PM's call |

## Verdict
**`TEST_PASSED`** (run 2, 2026-11-01) for REQ-002 as Team A built it. AC-1 … AC-8 and req. 6/8 pass:
- stand-in 48/48 (back `7808f3ed…`);
- app 15/15 (app `25db8739…`), including DEF-1's fix: the detail's retry delivers once;
- owner window `qa7k`, every real-Zimbra row: real connect, arrival 6 s after the Date header, real Thai, one reply with one
  Sent copy, nothing marked read, threading in his own mail app (owner 3/3 ✅).
NOT_TESTED, named: #23 by design · the APK for these screens (no new native layer: HTTP and storage were proven on the APK in
TEST-001 run 3; a slot only if the PM wants it).
Run 1 (app `bc72845c…`): `TEST_FAILED` on DEF-1, record kept above.

## Evidence (decisive)
- `harness/qa-a/app-mail-result.json` + `shots/m08-detail-failed-with-retry-run2.png`, `m09-detail-retried.png` — 15/15, DEF-1 fixed
- `harness/qa-a/test-002-stand-result.json` — 48/48 on the stand-in (encodings, threading headers, retry-once, password at rest)
- `harness/qa-a/live-qa7k.out` + the owner's 3/3 (§ Owner window run) — the real-Zimbra rows

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
