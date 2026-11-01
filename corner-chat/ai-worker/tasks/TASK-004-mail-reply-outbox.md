# TASK-004: Mail reply — outbox, SMTP send in-thread from the user's address, Sent copy, retry
- Source: SPEC-001 §3.4 (`POST /messages/:id/replies`, `POST /replies/:id/retry`, `Reply`), §5 (`mail_outbox`), §6 "Reply", §8 second RISK · REQ-002 req 5, 6
- Owner: BE (Jason)
- Status: TODO
- Depends on: TASK-003 · live checks need **B2**

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

## Questions

## Review
