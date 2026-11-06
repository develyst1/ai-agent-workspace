# TASK-003: Zimbra mail — connect, encrypted password, intake poller, Cc marking, attachments noted
- Source: SPEC-001 §3.6, §5 (`mail_accounts`, `messages`), §6 "Intake", §8 first RISK · REQ-002 req 1–4, 7, 8
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-01; live on real Zimbra; Thai on the real server UNVERIFIED)
- Depends on: TASK-002 · live checks need **B2** (two test mailboxes on `mail.entronica.in.th`, in `.env` as
  `TEST_MAIL_A_EMAIL/…_PASSWORD`, `TEST_MAIL_B_EMAIL/…_PASSWORD` — from the owner via the PM). **No real mailbox, ever.**
  **Amended 2026-11-01 (SA, REQ-002 Q-PM-B2):** B2 = the owner's own boxes. **A** is his work mail on Zimbra; **B** is his personal
  mail on any service, and needs no password. The live run is short (about 15 min), on a throwaway DB, and ends with a disconnect
  and dropping the DB. Stop if any mail turns "read". The isolation line becomes: U1 connected to A, U2 with none.

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
   **Amended by the SA 2026-11-01:** if B2 is **not yet** in your `.env`, do not wait. Run the same spike against a **local**
   stand-in: a dev-only IMAP + SMTP test server started from the tests (you choose it, e.g. `smtp-server` for SMTP; declare
   the IMAP one; dev dependencies only, on 127.0.0.1). Build steps 1–5 against it and the `.eml` fixtures. The real-Zimbra
   lines of the DoD stay `UNVERIFIED — needs B2` until the PM delivers the mailboxes. You may add the dev dependencies to
   `package.json` / `bun.lock`, and put the stand-in in `test/support/mail-server.ts`.
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
Test-first (all four mail test files ran RED — none could load — then GREEN). Working tree only, no git. 2026-11-01.

**Step 0 — spike (amended: no B2 in my `.env`, so a local stand-in).** I checked `.env` for `TEST_MAIL_*` key names: none. Stand-in, as the SA allowed: **IMAP = `hoodiecrow-imap` 3.3.1** (a strict IMAP test server from `imapflow`'s own authors; one shared mailbox per server, so two mailboxes = two servers; no TLS) and **SMTP = `smtp-server` 3.21.3**; both dev dependencies, in `test/support/mail-server.ts`. Spike run under Bun 1.3.14 (throwaway script, real output):
```
IMAP login ok · uidValidity 1n · uidNext 3 · exists 2 · highest UID 2
  fetched uid 1 subject "hello 1" text "body 1" · fetched uid 2 …           (imapflow fetch + mailparser simpleParser)
wrong password → authenticationFailed: true, responseText "Login failed: authentication failure"
closed port    → code ECONNREFUSED
SMTP verify right password → ok · wrong → EAUTH / 535 "Invalid username or password" · closed port → ESOCKET
SMTP send → accepted ["bob@test.local"], received by the stand-in, Thai subject kept as =?UTF-8?…
```
**Result: `imapflow` and `nodemailer` both work under Bun — against the stand-in.** What this does not show: TLS on 993/465, a real certificate chain, and Zimbra's own behaviour — those stay `UNVERIFIED — needs B2`.

**Dependencies:** runtime `imapflow` 2.10.0, `mailparser` 3.14.1, `nodemailer` 10.3.1; dev `smtp-server`, `hoodiecrow-imap`, `@types/{nodemailer,mailparser,smtp-server}` (the stand-in servers and type packages are dev-only, as the amendment allows). `bun run build` still compiles the single binary (345 modules, 97 MB).

**Files:** `src/core/crypto.ts` (`encryptSecret` / `decryptSecret`), `src/modules/mail/{parse,connection,routes,poller}.ts`, `src/modules/channels/index.ts`, `src/app.ts`, `test/mail-{crypto,parse,connect,poller}.test.ts`, 12 made-up `.eml` fixtures in `test/fixtures/mail/` (generated once from a throwaway script, with `iconv-lite` for the windows-874 one), `test/support/mail-server.ts`. Outside the repo: `tests/harness/mail-stand-in/run.ts` (runs the stand-in standalone and delivers any `.eml` dropped in a folder).

**Decided alone (declared):**
- **TLS policy:** a remote host always gets TLS — implicit on 993 / 465, otherwise STARTTLS is *required*, so a password never travels in the clear; only `127.0.0.1` / `localhost` may be plain (the stand-in). Certificates are verified (no `rejectUnauthorized: false`). If `mail.entronica.in.th` uses an internal CA, `PUT` will answer 502 until that is known.
- **Error mapping:** IMAP `authenticationFailed` or SMTP `EAUTH`/535/534/530 → 422 `MAIL_LOGIN_FAILED`; every other failure (refused, timeout, DNS, TLS, protocol) → 502 `MAIL_SERVER_UNREACHABLE`. IMAP is checked first, then SMTP; nothing is stored unless both pass. 15 s connect/greeting timeouts.
- `last_uid` after connect = `uidNext − 1` (current highest). Re-connecting replaces the account row and restarts from the then-current highest UID.
- **`received_at` = the server's INTERNALDATE** (when the mail reached the mailbox), not the `Date` header (a sender's clock can be wrong or in the future). Falls back to now.
- **Poller:** `createMailPoller({ db, config })` → `tickOnce()` (new messages stored, or `null` if the previous pass is still running) and `start()` (first pass at once, then every `MAIL_POLL_SECONDS`; `0` disables it). `last_uid` moves after each insert, so a crash re-reads the mail and `ON CONFLICT … DO NOTHING` drops the repeat. An unknown or changed `UIDVALIDITY` is adopted without ingesting (no backfill). Disabled users' accounts are excluded in the SQL.
- `last_error` is cut to 300 characters and the password is replaced by `[password]` if it ever appears; the log line carries the account email and counts only.
- **Parser:** recipient order To → cc → `List-Id` / `Precedence: list|bulk` → else `to`, comparing the account address case-insensitively; only the account's own address counts (an alias is not known). Text capped at 200 000 characters; attachment *names* only (a nameless attachment sets `has_attachments` but adds no name); no `From` → `unknown@invalid`; no subject → `null`; no `Message-ID` → `external_id` `<uidvalidity>:<uid>`.
- **mailparser quirk:** it folds `List-*` headers into one `list` entry, so `headers.has("list-id")` is never true — detection reads the raw `headerLines`.
- **Oversize:** a message over 15 MB is not downloaded; a row is stored from the envelope with the text `[message too large to import: N MB]` (see Questions — it is user-visible wording).
- `GET /channels` authenticates **per route**, not with a blanket `use("*")`, because Team B's `/channels/line/*` routes are mounted beside these and a blanket middleware would wrap them too. `DELETE /channels/mail` is idempotent (204 even with no account).
- The stand-in got an optional `extraUsers` (a second mailbox login) for the live isolation run.

**Evidence (real output):**
- `bun run test --timeout 30000 test/mail-crypto.test.ts test/mail-parse.test.ts test/mail-connect.test.ts test/mail-poller.test.ts` → `53 pass · 0 fail`, three runs in a row. Whole tree `bun run test` → `316 pass · 0 fail · Ran 316 tests across 20 files [17.91s]`. `tsc --noEmit` → exit 0. (The first poller run failed 5 tests for a test-isolation reason — `tickOnce` polls every active account, so accounts left over by earlier tests inflated the counts; fixed in the tests with a `beforeEach`, no product change.)
- DoD parser/crypto cases, all green: Thai `text/plain` UTF-8 · Thai HTML-only (tags gone) · **windows-874** Thai subject and body · PDF → `attachment_names=['x.pdf']`, the content marker string found nowhere in the result or the stored row · user in Cc → `cc` · `List-Id` → `list` · `Precedence: bulk` → `list` · Bcc → `to` · In-To beats a `List-Id` · case-insensitive address · encrypt→decrypt round trip (ASCII, Thai, empty, 5000 chars), layout `iv12 | ciphertext | tag16`, ciphertext ≠ plaintext and does not contain it, a fresh IV each time, tampering / wrong key / truncation refused, a key that is not 32 bytes refused.
- API tests: connect → 200 `MailChannel`, row has base64 `password_enc` that decrypts back, `last_uid` = highest, **0 messages backfilled**; wrong IMAP password → 422 and the `mail_accounts` count unchanged; SMTP-only refusal → 422; IMAP dead port / SMTP dead port → 502; bad body → 400 with the field; reconnect replaces; `DELETE` keeps the messages; `GET /channels` shape, the `line` part from `line_links`, and `{ linked:false }` with the table renamed away; two mailboxes and two users, each sees only their own; console output during good and bad connects contains neither the password nor the encrypted value.
- **Live against the stand-in** (own port 8081, throwaway DB `corner_chat_t3_live`, dropped after; the stand-in run standalone with mailbox A holding one mail *before* anyone connects; `MAIL_POLL_SECONDS=2`):
  ```
  PUT /channels/mail wrong pw -> {"error":{"code":"MAIL_LOGIN_FAILED",…}} [422]     mail_accounts count: before=0 after=0
  PUT /channels/mail          -> {"mail":{"connected":true,"email":"mailbox-a@test.local","lastSyncAt":null,"lastError":null}} [200]
  messages right after connecting (the waiting mail must NOT be taken in): 0
  after delivering one Thai mail (A in To) and one with A only in Cc:
   subject          | recipient_kind | sender_key        | filter_state | mail_to                | mail_cc
   ขอใบเสนอราคาด่วน  | to             | anna@example.test | pending      | {mailbox-a@test.local} | {}
   FYI plan         | cc             | anna@example.test | pending      | {boss@example.test}    | {mailbox-a@test.local,other@example.test}
  body: สวัสดีครับ รบกวนส่งใบเสนอราคาภายในวันนี้ / ขอบคุณครับ        (Thai readable)
  back end restarted -> messages: 2 (still exactly 2) · last_uid 3 · no error · synced
  password_enc: 9Q6Pi7VRjlfPELIip3AuIeAvstpSzI706ShGt0qihJ52f3o716N1vSZZ2uOr…        (base64)
  occurrences of the mail password in the back-end log: 0 · in the stand-in log: 0
  ```
  Log capture: the back end ran as `bun src/index.ts >> .local/server-t3.out 2>&1`; I then ran `grep -c` for the password on that file and on the stand-in's output file. Isolation: U1 `GET /channels` → `mail.email "mailbox-a@test.local"`, U2 → `"mailbox-b@test.local"`. Both mails arrived within one poll interval (about 4 s here at `MAIL_POLL_SECONDS=2`; the DoD allows 2 min at the default 60 s).
- `git status --porcelain --untracked-files=all` → my files are exactly the closed list: `package.json bun.lock src/app.ts src/core/crypto.ts src/modules/channels/index.ts src/modules/mail/{connection,parse,poller,routes}.ts test/mail-*.test.ts test/fixtures/mail/*.eml test/support/mail-server.ts`.

**UNVERIFIED — needs B2 (the three "Live (B2)" lines of the DoD were run against the stand-in instead):** any login to the real Zimbra host — the TLS handshake on 993/465, its certificate chain, which SASL mechanisms it offers, STARTTLS behaviour, how its INBOX reports `UIDVALIDITY` after a restore, Thai mail written by real clients and webmail, and the 2-minute arrival time on the real server. Also unverified: a very large real mailbox (the `n:*` fetch is bounded by `last_uid`, but I did not time a first poll with thousands of unseen mails).

**Addendum 2026-11-01 (from TASK-004 time) — oversize wording done.** Sober's inbox line answered REQ-002 Q-SA-1: the note for a message over 15 MB is now `อีเมลนี้ใหญ่เกินไป ({n} MB) เปิดอ่านใน Zimbra` (the PM's wording), set in `src/modules/mail/poller.ts` as a one-liner; `test/mail-poller.test.ts` asserts it with a regex (failed first, then `14 pass`). That closes the first of the two things this TASK was waiting on; the other is B2. The "Questions" entry above about this wording is answered.

**Live against the real Zimbra, 2026-11-01 (D45 + Q-PM-B2; the owner's own boxes: A = work mail, B = personal).** Window 22:02:34 to ~22:15 (this machine's clock). Back end on my port 8081, throwaway database `corner_chat_test_b2live` on the owner's server (unencrypted by his OK), LINE closed, gateway on a closed port, FCM off, `MAIL_POLL_SECONDS=5`. No password or URL printed.
- **Wrong password:** `PUT /channels/mail` → **422 `MAIL_LOGIN_FAILED`**; `mail_accounts` 0 → 0. (This was also the first real TLS handshake to `mail.entronica.in.th:993` with certificate checking on: it worked, so the TLS/private-CA worry in my earlier question did not happen.)
- **Right password:** → **200**, body keys `["mail"]`; `GET /channels` for U1 shows A connected (`lastError: null`).
- **Two mails from B (sent by the owner):** within ~10 min of opening, both rows exist: `recipient_kind` = **`to`** for mail (1) and **`cc`** for mail (2); sender is B for both (`from_is_B: true`), `mail_message_id` stored. Not 2 minutes: they only reached A about 7 minutes after the window opened (delivery delay on the owner's side).
- **Restart:** server stopped and started → still exactly **2 rows** after a poll interval.
- **Password at rest:** `password_enc` is base64 (`^[A-Za-z0-9+/=]+$` true). **Server log** captured to a file (`nohup … >>`; 18 lines, restarts included): the A password occurs **0** times (`grep -cF`). After `DELETE /channels/mail` → 204, `mail_accounts` = 0 rows.
- **AC-3 (isolation), weaker version agreed in Q-PM-B2:** U1 connected to A, U2 with no mail: `GET /channels` for U2 → `mail.connected: false`; it sees nothing of A.
- **Read marks (the Q-PM-B2 stop condition):** A's INBOX read-only counts, before: 151 messages / 79 unseen; after the two mails: 153 / 81; after everything, 153 / 81. So the poller **did not mark anything read** (the two new mails are still unseen).
- **Outcome of the two mails:** `notified` (the gateway was closed, so the AI filter failed open as designed).

**NOT verified:** the **Thai** line. The owner's two test mails were short ASCII text (no Thai in subject or body), so real-Zimbra Thai decoding stays proven only by the fixtures and the stand-in. The poller is also unproven for a TIS-620 mail from the real server. **Cc check:** B sent the Cc mail with A only in Cc, as asked (`cc` row). Nothing else about A's inbox was read; other folders: only the Sent folder's count.

## Questions
- For the PM, via the SA (user-visible wording I should not invent): a message over 15 MB is stored with the text `[message too large to import: N MB]` — an English developer marker that the app would show as the preview. A Thai line is needed (or say that such mail should be dropped instead).
- For the SA: (1) **TLS** — I verify certificates and require TLS for any non-local host; if the real Zimbra uses a private CA or a self-signed certificate, the first live `PUT` will answer 502 and we need a decision (trust a given CA file, or turn verification off for that host — I would not do the latter silently). (2) **Aliases** — mail sent to a user's alias address (the user not in To/Cc under the account's address) falls through to `list` / `to`; do we need an alias list per account? (3) **`received_at`** is the server's INTERNALDATE, not the `Date` header — OK for REQ-002's "within 2 minutes" and for ordering?
- B2 is still the owner's input: the three live lines stay open until the PM delivers the two test mailboxes.
  > answer (SA Sober, 2026-11-01): **(1) TLS:** keep certificate checks and required TLS. If the real host has a private CA, the
  > first B2 run will show it, and then I decide a CA-file setting (never turning verification off). **(2) Aliases:** no alias list
  > in round 1. An alias mail with no list header already lands as `to`, which matches the Bcc amendment's intent. **(3)**
  > INTERNALDATE is right for ordering and for the 2 minutes. **Oversize wording:** asked of the PM in REQ-002 § Questions
  > (Q-SA-1). Until the answer comes, the marker stays as it is, and you swap it in as a one-line change later.

## Review
**Verdict: code accepted on the stand-in — not DONE until the real-Zimbra lines run (B2).** SA Sober, 2026-11-01.
- **Re-run by me:** whole tree `331 pass · 0 fail` (it includes your 53 mail tests) · `tsc` 0.
- **Evidence holds:** both libraries work under Bun (spike) · no backfill on connect · wrong password → 422 with nothing stored ·
  restart → still exactly 2 rows · Thai readable, including windows-874 · the mail password in neither log (grep count 0) ·
  base64 ciphertext · per-user isolation.
- **Declared decisions accepted:** TLS-required for remote hosts, INTERNALDATE, `last_uid` after each insert, the oversize skip,
  per-route auth beside Team B's routes, and the `List-*` headerLines workaround (a good catch).
- **Left:**
  1. When the PM answers REQ-002 Q-SA-1, swap the oversize marker for the Thai line.
  2. When B2 is in `.env`, run the DoD's three Live (B2) lines against real Zimbra, then `REVIEW`.
- Status → `BLOCKED (waiting: B2; PM wording)`.
- **TASK-004 may start now** on the same stand-in (its own live lines also wait on B2). The REQ-002 security review runs when
  both are in.

**Verdict: DONE** — SA Sober, 2026-11-01. The live lines were run on real Zimbra in the owner's window, within REQ-002 Q-PM-B2's limits.
- **Accepted, from the live evidence (§ "Live against the real Zimbra"):**
  - a wrong password → 422 and no row; the right one → 200;
  - the first real TLS handshake to `:993` worked with certificate checking on (no private CA);
  - mail (1) → a `to` row, mail (2) → a `cc` row; after a restart there are still exactly 2 rows;
  - `password_enc` is base64, and the password appears 0 times in the captured server log;
  - after disconnecting, `mail_accounts` has 0 rows;
  - U2 sees nothing of A (the weaker AC-3 we agreed);
  - **nothing was marked read:** 151/79 → 153/81 → 153/81 (the stop condition held);
  - the throwaway database was dropped.
- **Arrival time:** the two mails reached A about 7 minutes after they were sent. That delay is on the mail servers' side; our
  poll interval was 5 s. REQ-002's "within 2 minutes" depends on `MAIL_POLL_SECONDS`, 60 by default, plus the delivery time,
  which is not ours to control.
- **UNVERIFIED, with what would settle it:** **Thai on the real server.** The owner's two mails were ASCII. Thai decoding is proven
  by the fixtures (UTF-8 and windows-874) and the stand-in. QA's REQ-002 run, or one Thai mail from the owner later, settles it.
- **Security review:** clean. The whole back end, mail-password encryption included, was reviewed under SPEC-001 §7 (2026-11-01),
  with no finding at the bar. Live, the TLS certificate was verified on 993, and the password is in no log and only encrypted
  in the database.
