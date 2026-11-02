# TASK-004: Mail reply — outbox, SMTP send in-thread from the user's address, Sent copy, retry
- Source: SPEC-001 §3.4 (`POST /messages/:id/replies`, `POST /replies/:id/retry`, `Reply`), §5 (`mail_outbox`), §6 "Reply", §8 second RISK · REQ-002 req 5, 6
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-01; live on real Zimbra; threading in B's app needs the owner's look)
- Depends on: TASK-003 · live checks need **B2**. **Amended 2026-11-01 (SA, REQ-002 Q-PM-B2):** B is the owner's personal mail,
  not on Zimbra. So "B's Zimbra webmail" becomes "B's own mail app, same conversation". Replies go only to B: about 2, including the
  retry one.

- Repo: `corner-chat-back` — Team A claim · git writes: **none**
- Files you may edit (closed list):
  - `src/modules/mail/outbox.ts`, `src/modules/mail/replies-routes.ts`, `src/modules/mail/smtp.ts`
  - `src/app.ts` (mount routes, start the outbox loop when not in test)
  - `test/mail-reply.test.ts`
  - `src/modules/messages/index.ts` — **only** to fill `MessageDetail.replies` from `listReplies(messageId)` (TASK-005 left
    `[]` there; added by the SA 2026-11-01)

## What to do
1. `POST /messages/:id/replies` (§3.4): message must be the caller's (else 404), `channel='mail'` (else 400 `NOT_MAIL`),
   caller has a `mail_accounts` row (else 409 `MAIL_NOT_CONNECTED`); insert `mail_outbox` `queued` → 202 `{ reply }`.
2. Outbox loop every 10 s: claim one row at a time with `UPDATE mail_outbox SET status='sending', attempts=attempts+1
   WHERE id=(SELECT id FROM mail_outbox WHERE status='queued' ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING *`.
   Send via SMTP **from the user's own address** with `In-Reply-To`, `References`, subject `Re: <original>` (do not add a
   second `Re:` if it already starts with `Re:`/`RE:`), plain-text UTF-8 body. Success → `sent`, `sent_at`, `smtp_message_id`;
   then if `MAIL_APPEND_SENT=true` IMAP-APPEND the same raw message to the `\Sent` special-use folder (fallback `Sent`),
   set `sent_copy_saved`. A failed APPEND does **not** make the reply failed (log it, `sent_copy_saved=false`).
   SMTP error / timeout (30 s) → `failed`, `error` = short English reason.
3. `POST /replies/:id/retry` → only from `failed` (else 409 `NOT_FAILED`) → back to `queued`. No automatic retries.
4. `Reply` JSON exactly per §3.4; `MessageDetail.replies` is filled in TASK-005 — you only provide a
   `listReplies(messageId)` helper in `outbox.ts` for it.
5. A row in `sending` at start-up (process died mid-send) → set `failed` with error `interrupted` (never resend blindly).

## Definition of Done (paste real output)
- [ ] `bun test test/mail-reply.test.ts` green with a fake SMTP transport: headers `In-Reply-To`/`References`/`Subject` exact
      for a plain and an already-`Re:` subject · SMTP throws → `failed` · retry → `queued` → `sent` exactly once ·
      `NOT_MAIL`, `MAIL_NOT_CONNECTED`, other user's message → 404.
- [ ] Live (B2): reply from U1 (mailbox A) to a mail from B → B's Zimbra webmail shows it **in the same conversation**, from A's
      address; A's Sent folder holds **exactly one** copy (if Zimbra saved one itself, there will be two: then set
      `MAIL_APPEND_SENT=false`, re-test, and write that in Implementation Notes). Screenshot or IMAP listing pasted.
- [ ] Live: set `ZIMBRA_SMTP_HOST` to an unreachable host, reply → `failed`; restore, `POST /replies/:id/retry` → B receives it once.
- [ ] `git status --porcelain` — only closed-list files.

## Implementation Notes
Test-first (the new test file could not even load at first — RED — then 4 stand-in/test mistakes of mine, then GREEN). Working tree only, no git. 2026-11-01. Built and checked on the same local IMAP/SMTP stand-in as TASK-003; **no real mailbox, no outside service** was involved, and every live server I started was on a throwaway database and my own port and is stopped.

**Files:** `src/modules/mail/{smtp,outbox,replies-routes}.ts`, `src/app.ts` (mount + start the outbox outside tests), `src/modules/messages/index.ts` (**only** `replies: await listReplies(db, id)`), `test/mail-reply.test.ts`. Also touched, outside this TASK's list but inside TASK-003's: `test/support/mail-server.ts` (the stand-in now has a Sent folder — flagged `\Sent` or just named `Sent` — and `messagesIn(folder)`), and the oversize-wording one-liner Sober asked for (below). No new dependency (`nodemailer/lib/mail-composer` ships with nodemailer).

**Oversize wording (Sober's second inbox line, done here as a one-liner in TASK-003's files):** `src/modules/mail/poller.ts` now stores `อีเมลนี้ใหญ่เกินไป ({n} MB) เปิดอ่านใน Zimbra` (the PM's line, REQ-002 Q-SA-1) instead of the English marker; `test/mail-poller.test.ts` asserts it with a regex (failed first, then passed: `14 pass`). I could not edit TASK-003's Review; this is the note for it.

**Decided alone (declared):**
- **The reply goes to the original's `From` address only** (no reply-all, no `Reply-To`: we store neither). See Questions for mailing-list mail.
- **One composition, used twice:** the raw message is built once with nodemailer's `MailComposer`; those exact bytes go out over SMTP (explicit envelope) and are appended to Sent, so the copy cannot differ from what was sent. The `Message-ID` is generated here (`<uuid@<account's domain>>`) and stored as `smtp_message_id`.
- Subject: `Re: ` once — an original starting with `Re:`/`RE:`/`re:` is kept as it is (trimmed); no subject → `Re:`. Threading: `In-Reply-To` = the original's Message-ID; `References` = the original's References + its Message-ID; an original with no Message-ID gets **no** threading headers. Body = the user's text as typed, plain text UTF-8 (no quoted original, no signature — that is copy/product).
- Check order for `POST /messages/:id/replies`: caller's message (404) → `NOT_MAIL` (400) → body 1–20 000 characters and not blank (400 `VALIDATION`, field `body`) → connected mailbox (409). A whitespace-only body is invalid.
- Claim = the TASK's statement (`UPDATE … WHERE id = (SELECT … FOR UPDATE SKIP LOCKED) RETURNING`), with one addition: it joins `users` and takes only **active** users' rows, so a disabled user's queued replies wait and go out when the user is enabled again (REQ-001 AC-4). One loop per process (`tickOnce()` returns `null` if a pass is running); two processes/loops cannot take the same row (tested with two outbox instances racing).
- **Marked `sent` before the Sent copy is attempted**, so a slow or failing APPEND can never make a delivered reply look unsent. The copy is flagged `\Seen`. The Sent folder is found by the `\Sent` special-use flag (whatever its name), else the name `Sent` (any case). No Sent folder / APPEND error → `sent_copy_saved=false`, one log line, reply stays `sent`. `MAIL_APPEND_SENT=false` → no copy.
- Failure reasons are short English strings (≤ 200 characters): `SMTP login refused by the mail server`, `SMTP server unreachable (…)`, `SMTP server rejected the message: <code> <text>`, `SMTP send timed out` (30 s `Promise.race` guard on top of nodemailer's socket timeout), `mail account not connected`, `the stored password cannot be decrypted`, `the original message has no sender address`. The password is replaced by `[password]` if it ever appears; the reply text is never logged (log lines: account email + sent/failed only).
- A reply can only leave `sending` through `sent` or `failed`. If the database errors *after* the SMTP send was accepted, the row stays `sending`; at the next start `recoverInterrupted()` makes it `failed` with `interrupted` — never resent blindly. That recovery runs once, in `start()`.
- `POST /replies/:id/retry` = one atomic `UPDATE … WHERE status='failed'` (clears `error`, keeps `attempts`, which counts every try); a reply that exists but is not failed → 409 `NOT_FAILED`; someone else's/unknown/malformed id → 404.
- A reply to a message the filter has not decided yet is allowed (only "the caller's mail message" is checked). `/messages/:id/replies` also passes through the messages router's own `requireUser` (a second session lookup, harmless).

**Evidence (real output):**
- `bun run test --timeout 30000 test/mail-reply.test.ts` → `26 pass · 0 fail`, three runs in a row. Whole tree `bun run test` → `357 pass · 0 fail · Ran 357 tests across 21 files [25.35s]`. `tsc --noEmit` → exit 0.
- DoD cases against the stand-in's **real SMTP and IMAP** (the test parses the message that arrived and reads the Sent folder back): headers `From` = the user's address, `To`, `In-Reply-To`, `References`, `Subject` exact for a plain, `Re:` and `RE:` subject, with and without `References`, and with no Message-ID · Thai subject and body survive · UTF-8 charset · SMTP down → `failed` · retry → `queued` → `sent` **exactly once** (a further pass sends nothing; the stand-in received exactly 1) · `NOT_MAIL`, `MAIL_NOT_CONNECTED`, other user's / unknown / malformed id → 404, no session → 401 · body validation · one Sent copy with the same Message-ID, found by `\Sent` even when named "Sent Items", and by name `Sent` · no Sent folder → reply still `sent`, `sent_copy_saved=false` · `MAIL_APPEND_SENT=false` → no copy · login refused → `failed` naming the login, not the password · mailbox disconnected after queueing → `mail account not connected` · injected sender throws → its reason; a sender that never answers is cut at the timeout (`SMTP send timed out`) · `sending` row at start → `interrupted`, never sent · disabled user waits · two loops / two processes → one send · `start()`/`stop()` · logs contain neither the password nor the reply text · `MessageDetail.replies` oldest first in the exact `Reply` shape, never another user's, a failed one shows its error.
- **Live** (back end on my port 8081 against a throwaway DB `corner_chat_t4_live`, dropped after; the stand-in run standalone; AI gateway pointed at a closed port, no FCM, no LINE; `MAIL_POLL_SECONDS=2`):
  ```
  an incoming Thai mail (Message-ID <live-orig@…>, References <earlier@…>) was taken in and decided: "Quote please | to | notified"
  POST /messages/:id/replies -> {"reply":{"id":"d1c36ea5-…","body":"ขอบคุณครับ จะส่งใบเสนอราคาให้พรุ่งนี้เช้า","status":"queued","error":null,…}}
  stand-in SMTP received: from=mailbox-a@test.local to=anna@example.test subject="Re: Quote please" message-id=<deefe33d-…@test.local>
      in-reply-to=<live-orig@example.test> references=["<earlier@example.test>","<live-orig@example.test>"] content-type=text/plain
      body="ขอบคุณครับ จะส่งใบเสนอราคาให้พรุ่งนี้เช้า"
  outbox row: sent | attempts 1 | error ∅ | sent_at set | smtp_message_id <deefe33d-…> | sent_copy_saved t
  Sent folder (IMAP): folders INBOX (\Inbox), Sent (\Sent) · copy 1: same Message-ID, in-reply-to, references, flags \Seen · exactly one copy
  GET /messages/:id replies -> [{"id":"d1c36ea5-…","status":"sent","error":null,"sentAt":"2026-11-01T09:17:17.748Z",…}]
  --- SMTP unreachable (ZIMBRA_SMTP_PORT=1), second reply:
  outbox row: failed | attempts 1 | SMTP server unreachable (connect ECONNREFUSED 127.0.0.1:1)      (SMTP-accepted so far: still 1)
  owner sees: [{"status":"sent","error":null},{"status":"failed","error":"SMTP server unreachable (connect ECONNREFUSED 127.0.0.1:1)"}]
  --- restored, POST /replies/:id/retry -> {"reply":{…"status":"queued","error":null…}} [202]
  outbox row: sent | attempts 2 | sent_copy_saved t · SMTP-accepted in total: 2 (the first reply + this one; waited 12 s more to catch a double send) · Sent folder: 2 copies
  password occurrences: back-end log 0 · stand-in log 0
  ```
- `git status --porcelain` (checked with `find … -newermt "2026-11-01 16:10"`, excluding `node_modules`, `.local`, `dist`, `.git`): `src/app.ts src/modules/mail/{outbox,replies-routes,smtp,poller}.ts src/modules/messages/index.ts test/mail-reply.test.ts test/mail-poller.test.ts test/support/mail-server.ts` — and nothing else; `package.json` / `bun.lock` unchanged.

**UNVERIFIED — needs B2 (the DoD's three Live (B2) lines were run on the stand-in):** that Zimbra's webmail threads the reply into the same conversation (the stand-in proves the headers are right, not what Zimbra does with them); whether Zimbra **also saves its own copy** of SMTP-submitted mail — if it does, Sent will hold two copies per reply, and the answer is `MAIL_APPEND_SENT=false` (the switch is tested); SMTP over TLS on port 465 and STARTTLS with real certificates; delivery to an outside recipient; the live "unreachable host" case ran as a refused connection (port 1), not a silent timeout — the 30 s timeout path itself is covered only with an injected sender that never answers.

**Live against the real Zimbra, 2026-11-01 (same window as TASK-003; throwaway database `corner_chat_test_b2live`, dropped after).**
- **Reply to mail (1) (reply text Thai, to B only):** `POST /messages/:id/replies` → **202 `queued`**, outbox row → **`sent`** within ~15 s. SMTP over TLS to `mail.entronica.in.th:465` worked. Recipient is the sender of the mail, B (my code sets it from the message; no other address was ever used).
- **Sent folder:** A's Sent: 0 messages before, **1 after the first reply** (server log: "reply sent", no append error). So there is **one** copy per reply and Zimbra did not add its own: **`MAIL_APPEND_SENT` can stay `true`** (default).
- **Failure and retry:** restarted with `ZIMBRA_SMTP_HOST=127.0.0.1:1` → a second reply → **`failed`**, error `SMTP server unreachable (connect ECONNREFUSED 127.0.0.1:1)`. Restored the real host → `POST /replies/:id/retry` → 202 → **`sent`**. A's Sent: **2** messages (one per reply, none for the failed attempt), so the retry did not duplicate.
- **Replies only to B:** exactly 2 replies were sent in total, both to B.

**NOT verified from my side:** that **B's own mail app shows the reply in the same conversation** as mail (1), and that B received the retried reply exactly once. I have no access to B (no password, by design). Only the owner can look; the code sets `In-Reply-To` / `References` from the stored `mail_message_id` and `mail_references`, and the stand-in checked those headers earlier. Ask him to look at B for the two replies (subjects start with "Re:") and tell the PM.

## Questions
- For the SA/PM — **mailing-list mail:** a reply goes to the original's `From` address. For a message the poller classed as `list` (it has a `List-Id`), the sender is the person who posted, so the reply goes to that person alone, not to the list. Most mail programs would answer the list address (or honour `Reply-To`). We do not store `Reply-To`, so changing this needs a column (a Team A migration) — do you want it, or is "reply to the sender" the round-1 rule?
- For the SA: (1) **No reply-all / no Cc** — a reply to a message sent to several people reaches only the sender. Fine for round 1? (2) **Quoting the original** in the body is not done (the user's text only); that is product copy, so it is the PM's call. (3) If Zimbra turns out to save its own Sent copy, we switch `MAIL_APPEND_SENT=false` after the B2 test — say if you would rather detect it.
- B2 is still the owner's input: the three live lines stay open until the PM delivers the test mailboxes.
  > answer (SA Sober, 2026-11-01): **Mailing-list mail and reply-all:** the reply goes to the original's `From` only, for round 1.
  > That follows the owner's own words — *"ผู้ใช้สามารถตอบกลับ คนที่ทักเขามากลับไปทางเดิมได้"* (reply to whoever messaged them) —
  > `Interpreted` as the sender, not the list or the Cc. No `Reply-To` column. **Quoting the original** is product copy, so I've
  > asked the PM (REQ-002 Q-SA-2). Default: no quote. **Zimbra's own Sent copy:** switch `MAIL_APPEND_SENT=false` after the B2
  > test if it shows two copies. No auto-detect.

## Review
**Verdict: code accepted on the stand-in — not DONE until the real-Zimbra lines run (B2).** SA Sober, 2026-11-01.
- **Re-run by me:** `bun run test` → `357 pass · 0 fail [24.86s]` · `tsc` 0.
- **Read:** `outbox.ts:75–84`. The claim is one atomic `UPDATE … WHERE id = (SELECT … FOR UPDATE OF o SKIP LOCKED)`, active users
  only. `poller.ts:42` now carries the PM's oversize line.
- **Live evidence holds** (stand-in, throwaway DB, own port):
  - threading headers are exact, including `References` chaining;
  - the same bytes go out and into Sent, and there is exactly one Sent copy;
  - SMTP down → `failed` with a short reason;
  - a retry sends exactly once (waited 12 s for a double);
  - the password appears in no log.
- **Declared decisions accepted:** marked `sent` before the APPEND · `interrupted` recovery · no threading headers when there is no
  Message-ID · body validation order · disabled users' replies wait.
- Touching `test/support/mail-server.ts` and `poller.ts` (TASK-003's files) was declared and asked for. Accepted.
- **Left:** the DoD's three Live (B2) lines against real Zimbra (threading in webmail, Sent copies, TLS) → then `REVIEW`.
- Status → `BLOCKED (waiting: B2)`. REQ-002's security review of the mail code is running now, so it is not on the path after B2.

**Verdict: DONE** — SA Sober, 2026-11-01. Same live window and limits as TASK-003.
- **Accepted:**
  - a Thai reply to mail (1) → 202 `queued` → `sent` in about 15 s, over TLS on `:465`, to B only;
  - A's Sent folder went 0 → 1 → 2 (one copy per reply, none for the failed try), so Zimbra keeps no copy of its own, and
    **`MAIL_APPEND_SENT=true` stays**;
  - an unreachable SMTP → `failed`, then a retry → `sent`, with no duplicate;
  - exactly 2 replies in total, both to B.
- **UNVERIFIED — only the owner can settle it:** that B's mail app shows the two "Re:" replies **in the same conversation** as
  mail (1), and the retried one only once. The `In-Reply-To` / `References` headers are proven on the stand-in. **Ask via the PM:**
  "please look at your personal mail for the two Re: replies".
- **Security review:** clean. It is the same §7 review as TASK-003. Replies go only to the stored sender, and the SMTP password
  is never logged.
