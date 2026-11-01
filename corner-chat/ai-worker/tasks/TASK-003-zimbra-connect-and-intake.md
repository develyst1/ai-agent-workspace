# TASK-003: Zimbra mail — connect, encrypted password, intake poller, Cc marking, attachments noted
- Source: SPEC-001 §3.6, §5 (`mail_accounts`, `messages`), §6 "Intake", §8 first RISK · REQ-002 req 1–4, 7, 8
- Owner: BE (Jason)
- Status: TODO
- Depends on: TASK-002 · live checks need **B2** (two test mailboxes on `mail.entronica.in.th`, in `.env` as
  `TEST_MAIL_A_EMAIL/…_PASSWORD`, `TEST_MAIL_B_EMAIL/…_PASSWORD` — from the owner via the PM). **No real mailbox, ever.**

- Repo: `corner-chat-back` — Team A claim · git writes: **none**
- Files you may edit (closed list):
  - `package.json`, `bun.lock` (add `imapflow`, `mailparser`, `nodemailer` only)
  - `src/core/crypto.ts` (add AES-256-GCM encrypt/decrypt with `SECRET_KEY`)
  - `src/modules/mail/**` (connect routes, poller, parser, classifier)
  - `src/modules/channels/index.ts` (`GET /channels` — mail part + the `line` part read from `line_links`; if the table
    does not exist yet, return `{ linked: false, displayName: null }`)
  - `src/app.ts` (mount routes, start the poller loop when not in test)
  - `test/mail-*.test.ts`, fixtures under `test/fixtures/mail/**` (made-up `.eml` files only)

## What to do
0. **Spike first (≤ 15 min), write the result in Implementation Notes:** under Bun, `imapflow` logs in to test mailbox A,
   lists INBOX `UIDVALIDITY` and the highest UID; `nodemailer` verifies SMTP. If either fails under Bun, **stop**, set
   `BLOCKED`, write what failed in `## Questions` — do not switch libraries yourself.
1. `PUT /channels/mail` (§3.6): log in to IMAP **and** SMTP with the given credentials; both ok → encrypt the password
   (`base64(iv|ciphertext|tag)`), upsert `mail_accounts` with `uid_validity` and `last_uid` = the **current highest UID**
   (no backfill — SPEC-001 §6); fail → 422 `MAIL_LOGIN_FAILED`, store nothing; host unreachable → 502.
2. `DELETE /channels/mail` → delete the row (password gone), keep messages.
3. `GET /channels` → `{ mail: MailChannel, line: LineChannel }` (§3.6, §3.7). Never the password.
4. Poller: every `MAIL_POLL_SECONDS` (default 60), for each account of an **active** user, exactly the "Intake" flow in
   SPEC-001 §6: UIDVALIDITY reset rule, fetch UID > `last_uid`, parse, classify `recipient_kind` (`to` / `cc` / `list`),
   **exactly in SPEC-001 §6's order: To → `to`, Cc → `cc`, `List-Id` / `Precedence: list|bulk` → `list`, otherwise
   (Bcc) → `to`**, then insert with `ON CONFLICT (user_id, channel, external_id) DO NOTHING` where `external_id` = the `Message-ID` header
   (or `"<uidvalidity>:<uid>"` if none), then advance `last_uid`. Text: the text part, else HTML converted to text
   (`mailparser`'s `text`/`html`). `attachment_names` = file names; **never store attachment content**.
   Store `mail_to`, `mail_cc`, `mail_message_id`, `mail_references`. `filter_state` stays `pending` (TASK-005/006 pick it up).
   One account's error → `last_error` on that row; other accounts carry on. One loop at a time (no overlap if a tick runs long).
5. Never log the password or the decrypted value; log account email + counts only.

## Definition of Done (paste real output)
- [ ] Spike result (step 0) in Implementation Notes.
- [ ] `bun test test/mail-*.test.ts` green: parser on made-up fixtures — Thai `text/plain` UTF-8 · Thai HTML-only ·
      TIS-620 / `windows-874` Thai subject+body · a PDF attachment → `attachment_names=['x.pdf']`, no content stored ·
      user in Cc → `cc` · `List-Id` header → `list` · user in neither To nor Cc, no list header (Bcc) → `to` · encrypt→decrypt round-trip; ciphertext ≠ plaintext.
- [ ] Live (B2): connect mailbox A via `curl PUT /channels/mail` → 200 connected; wrong password → 422 and
      `select count(*) from mail_accounts` unchanged.
- [ ] Live (B2): send one Thai mail B → A (A in To) and one with A only in Cc; within 2 min both rows exist
      (`select subject, recipient_kind from messages`), Thai readable. Stop and restart the back end → still exactly 2 rows.
- [ ] `select password_enc from mail_accounts` shows base64, and `grep -ri "<the test password>" ` over the server log output finds nothing (say how you captured the log).
- [ ] REQ-001 AC-3 for mail: with U1 and U2 each connected (A and B), U1's `GET /channels` shows only A.
- [ ] `git status --porcelain` — only closed-list files.

## Implementation Notes

## Questions

## Review
