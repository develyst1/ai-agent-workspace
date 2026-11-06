# TASK-033: Use the owner's Postgres server (no local cluster) + a complete `.env.example`
- Source: owner's orders 2026-11-01, relayed by the PM (`SYSTEM-FACTS.md` "Owner, 2026-11-01 evening (verbatim): env keys and the
  database" · D43). They replace SPEC-001 §8a (the team's own cluster on :5433).
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-01; DB connection unencrypted per D45 — real-mail lines gated by step 10)
- Depends on: —

- Repo: `corner-chat-back` — Team A claim · git writes: **none**
- Files you may edit (closed list):
  - `.env.example`
  - `src/config.ts` (database keys only)
  - `src/core/db.ts`
  - `test/setup.ts`
  - `scripts/db-init.ts` (new)
  - `scripts/db-local.ts` (delete it after step 5)
  - `package.json` (the `db:*` scripts only)
  - `test/config.test.ts` (new, or add to the existing config test)

## Hard lines (owner)
- **No local Postgres, ever.** Don't install one, start one, or keep one running. The only server is the owner's
  (`154.197.124.206:5432`).
- **Touch only our databases:** `corner_chat` (the app) and `corner_chat_test*` (tests). Never read, change or drop any other
  database on that server. Other projects live there.
- **The URL holds a password.**
  - Never print it, log it or paste it, in any output, file or error (F-018).
  - It lives only in the git-ignored `.env`.
  - Committed files (this one, `.env.example`) say `<host>`, not the address.
- If `DATABASE_URL` is still missing or wrong in `.env`, stop and say so. Don't guess it, and don't ask the owner yourself.

## What to do
1. **`.env.example`: every key the owner fills, one short comment each.**
   - Add `TEST_MAIL_A_EMAIL`, `TEST_MAIL_A_PASSWORD` and `TEST_MAIL_B_EMAIL` (REQ-002 Q-PM-B2: A is the work mailbox on Zimbra, B is
     the personal address, and B needs no password).
   - Remove `PG_LOCAL_PORT` and `PG_LOCAL_PASSWORD`.
   - `DATABASE_URL` shape: `postgresql://USER:PASSWORD@<host>:5432/corner_chat`.
   - `DATABASE_URL_TEST`: optional. Empty means "the same as `DATABASE_URL`, with the database `corner_chat_test`" (step 3). So
     the owner fills one database key, not two.
   - Every key that `src/config.ts` and Team B's code read must be listed. Check this with a grep (DoD).
2. **Guard the names in `config.ts`.**
   - `DATABASE_URL`'s database must be `corner_chat`.
   - The test base database must be `corner_chat_test`.
   - Anything else is refused at start-up, with a message that names the key and the rule, but never the URL.
3. **`test/setup.ts`:**
   - Derive the test base URL when `DATABASE_URL_TEST` is empty.
   - Each run's database becomes `corner_chat_test_r<pid>_<6 random hex>`. Several machines now share one server, so a pid alone can
     clash.
   - Before any `CREATE` or `DROP`, assert the name matches `^corner_chat_test_r\d+_[0-9a-f]{6}$`, and throw otherwise.
   - Drop only that run's database, as today.
   - Keep the existing rule: the test URL must never equal `DATABASE_URL`.
4. **`scripts/db-init.ts` (`bun run db:init`), run once per server:**
   - Connect using `DATABASE_URL`, but to the maintenance database `postgres`.
   - Create `corner_chat` and `corner_chat_test` **only if missing**. Run `migrate` on `corner_chat`.
   - Print only database names and "created" / "already there".
   - It must refuse any other name, and contain **no DROP at all**.
   - Optional, and only if cheap: `db:clean-tests` drops leftover `corner_chat_test_r…` databases, using the step-3 pattern only, and
     lists each one before dropping it.
5. **Retire the local cluster.**
   - `bun run db:local stop` once, and show `status` afterwards.
   - Delete `scripts/db-local.ts` and its `package.json` script.
   - **Leave `.local/pgdata` on disk.** Deleting data is the owner's call, and the PM tells him it is there.
6. **TLS:** the server is on the internet, so the connection must not send the password in clear text.
   - Try `sslmode=require` (Bun.sql: `?sslmode=require` in the URL, or `tls: true`).
   - If the server accepts it, keep it required, and say how.
   - If it refuses SSL, **stop and report it**. Don't fall back to plain text on your own. That is the owner's decision, through
     the PM.

7. **(Added 2026-11-01, URGENT, D44 — do this FIRST, before any other step or any `bun run test`.)**
   - Why: `.env` now holds the **real** LINE token, and `api.line.me` as the base. Bun loads `.env` for tests too. The LINE test files
     point `LINE_API_BASE` at a fake, but other files (intake, notify) can reach the notifier with the real values.
   - The fix: at the very top of `test/setup.ts`, before anything imports `src/config.ts`, force:
     - `LINE_CHANNEL_ACCESS_TOKEN = ""`
     - `LINE_CHANNEL_SECRET = "test-secret"`
     - `LINE_API_BASE = "http://127.0.0.1:1"`
   - Add a test that asserts all three hold inside a test run.
   - Never print the real values. Until this is in, don't run the whole tree. Never start the back end from this `.env` until Team
     B's `LINE_LIVE` guard is in.

## Definition of Done (paste real output, the URL never shown)
- [ ] Step 7: the test shows the three LINE values forced inside a test run, and `git diff`-style proof that it is the first thing in
      `test/setup.ts`.
- [ ] `test/config.test.ts`:
  - a `DATABASE_URL` naming another database is refused, and the error text does not contain the password;
  - an empty `DATABASE_URL_TEST` derives `corner_chat_test`;
  - a run name outside the pattern throws before any SQL.
- [ ] Every key in `.env.example` (`grep -ohE "process\.env\.[A-Z_]+|text\(\"[A-Z_]+\"\)" -r src scripts`, compared with
      `.env.example`). Paste the two sorted lists and their diff, which must be empty apart from `NODE_ENV`.
- [ ] **Live, once the owner's `DATABASE_URL` is in `.env`:**
  - `bun run db:init` prints the names;
  - `select ssl from pg_stat_ssl where pid = pg_backend_pid()` → `t`;
  - the whole tree `bun run test` is green, with its time (the server is remote now: say if any test timeout had to change, and
    why);
  - after the run, `select datname from pg_database where datname like 'corner_chat%'` shows only `corner_chat` and
    `corner_chat_test`, with no leftover run database.
- [ ] `bun run db:local status` after the stop shows it stopped. `scripts/db-local.ts` is gone. `.local/pgdata` is still there.
- [ ] `tsc --noEmit` 0 · `git status` → the closed list only.

## Implementation Notes
Test-first for the guards; working tree only, no git. 2026-11-01. **Steps 1, 2, 3, 5 and 7 are done. Step 4 is written but not run, and step 6 and the live DoD are UNVERIFIED: `.env` still holds the old `:5433` URL (database `corner_chat_dev`), not the owner's `DATABASE_URL`.** I did not ask the owner (TASK says so). No server was started.

**What changed (closed list):**
- `test/setup.ts` — step 7 is the first thing in the file: `LINE_CHANNEL_ACCESS_TOKEN=""`, `LINE_CHANNEL_SECRET="test-secret"`, `LINE_API_BASE="http://127.0.0.1:1"` (lines 1-4, before any import of config). Step 3: an empty `DATABASE_URL_TEST` derives `corner_chat_test` from `DATABASE_URL`; the run database is `corner_chat_test_r<pid>_<6 hex>`; `assertTestRunName` runs before every `CREATE`/`DROP`; only that run's database is dropped; "test URL must not equal `DATABASE_URL`" is kept. The old "DROP IF EXISTS before CREATE" is gone (a random name cannot clash).
- `src/config.ts` (database keys only) — new exports `checkDatabaseNames`, `deriveTestUrl`, `databaseNameOf`, `assertTestRunName`, `sqlOptions`, `APP_DB`, `TEST_BASE_DB`. `DATABASE_URL` must name `corner_chat`; `DATABASE_URL_TEST` must name `corner_chat_test` (or a run copy of it) or be empty. Refusal text names the key and the rule and the bad database name, never the URL. The guard runs at start-up (`loadOrExit`), not inside the pure `loadConfig`, so `loadConfig({DATABASE_URL:"postgres://x"…})` in the older tests is unchanged. `config.databaseUrlTest` is derived when empty.
- `src/core/db.ts` — `new SQL(url, sqlOptions(url))`. **TLS (step 6):** a non-local host always gets `tls: true`; only `127.0.0.1`/`localhost`/`::1` go without. I could not try it against the real server yet.
- `scripts/db-init.ts` (new, `bun run db:init`) — connects with `DATABASE_URL` to the database `postgres`, creates `corner_chat` and `corner_chat_test` only if missing, migrates `corner_chat`, prints names and `created` / `already there` only. The file has no `DROP` (`grep -c DROP` → 0) and checks each name against `^corner_chat(_test)?$`.
- `.env.example` — rewritten: every key with one comment; `PG_LOCAL_*` removed; `TEST_MAIL_A_EMAIL`, `TEST_MAIL_A_PASSWORD`, `TEST_MAIL_B_EMAIL` added; `DATABASE_URL` shape shown with `<host>`; `DATABASE_URL_TEST` optional.
- `package.json` — `db:local` replaced by `db:init`.
- `scripts/db-local.ts` deleted. `bun run db:local stop` → `server stopped`; `status` → `pg_ctl: no server running`. `.local/pgdata` is still on disk (owner's call to delete).
- `test/config.test.ts` (new) — 6 tests.

**Evidence:**
- RED first: the LINE test printed the real token on failure (see below), then the guard tests failed on missing exports. GREEN: `bun run test test/config.test.ts` → `6 pass · 0 fail · 30 expect()`.
- Whole tree, run once on the local cluster before I stopped it (with `DATABASE_URL` overridden on the command line to the database name `corner_chat`, because `.env` says `corner_chat_dev` and the new guard refuses it): `405 pass · 0 fail · 24 files [25.83s]`. `tsc --noEmit` → 0. No LINE call is possible in that run (the three values are forced).
- DoD key diff (`grep` of `process.env.X` and `text/int/bool("X")` in `src` + `scripts`, against `.env.example`): the code list minus `NODE_ENV`-only differences has **nothing missing from the example**. The example has four extra keys: `LINE_LIVE` (Team B's guard, TASK-034, not read yet) and `TEST_MAIL_A_EMAIL`, `TEST_MAIL_A_PASSWORD`, `TEST_MAIL_B_EMAIL` (read by the harness outside `src`). `NODE_ENV` is in the example as a comment.
- Files changed by me: the closed list above. `.env` was not touched.

**Not done / UNVERIFIED (waits for the owner's `DATABASE_URL` in `.env`):** `bun run db:init`; `pg_stat_ssl` = `t` and whether the server accepts `tls: true` (if it refuses, I stop and report); the whole tree on the remote server with its time and any timeout change; no leftover `corner_chat_test_r…` database. **Until the owner's URL is in `.env`, `bun run test` cannot run at all on this machine**: the cluster is off and the guard refuses `corner_chat_dev`.

**Not built:** `db:clean-tests` (optional in the TASK). It would need a `DROP` in a script, and `scripts/db-clean-tests.ts` is not on the closed list. Leftovers appear only if a run is killed; they match `corner_chat_test_r…` and can be dropped by hand. Say if you want it as its own small TASK.

**F-021 (mine, in `FAILURES.md`):** my first RED test for step 7 used `toBe("")`, and Bun's failure output printed the real LINE channel token into my session. Same family as F-018. The test now compares to booleans. Reissuing that token is the owner's call, through the PM.

**F-018 (the old cluster's password, printed in Fern's session):** moot. The cluster is stopped, nothing uses it, and its data is left unused. I did not rotate it.

**Live attempt, 2026-11-01 (after the owner set `DATABASE_URL`): STOPPED at step 6 — the server refuses SSL.**
- `.env` now has `DATABASE_URL` on `154.197.124.206:5432/corner_chat`. `DATABASE_URL_TEST` in `.env` is still the old `127.0.0.1:5433` URL (cluster stopped). It should be emptied or removed; for my commands I blanked it on the command line only. `.env` was not edited.
- `bun run db:init` (TLS on, as the code requires for a remote host) → `ERR_POSTGRES_CONNECTION_TIMEOUT` after 30 s. `Test-NetConnection` to the port → `TcpTestSucceeded: True`, so the port is open.
- To see why, I sent a bare Postgres `SSLRequest` packet (no user, no password) and read the one-byte answer: **`N`** — the server does not support SSL. So `tls: true` can never connect to it.
- Per step 6 I did **not** fall back to plain text, and I changed no code to allow it. Nothing was created on the server. `db:init`, `pg_stat_ssl`, the whole tree on the remote server and the leftover check are still not run, and the TASK-003/004 live mail lines (they need a throwaway database there) have not started.
- Decision needed from the owner, through the PM: (a) enable SSL on the server (recommended: the password and the data cross the internet), or (b) allow plain text for this server, which is his call and which I'd add as an explicit, named setting in `DATABASE_URL` (`?sslmode=disable`), never as a silent fallback.

**Amendment steps 8-10 and the live DoD, 2026-11-01 (after D45).**
- **Step 8 (TLS when offered):** Bun's own `sslmode=prefer` does not fall back (probe: `prefer` → `ERR_POSTGRES_CONNECTION_TIMEOUT`, `disable` → connects), so `src/config.ts` has `probeTls(host, port)`: one SSLRequest, `S` = TLS, anything else or silence = plain. `sqlOptions(url)` is now async and returns `{tls:true}` only when the server offered it; a local host is never probed. `src/core/db.ts` prints, once, `database connection is not encrypted (D45: made-up data only)` when a remote server gave no TLS (never the URL). `test/setup.ts` and `scripts/db-init.ts` await it.
- **Step 9 (name guard):** `DATABASE_URL` may name `corner_chat` or `corner_chat_test_<suffix>` (`^corner_chat_test_[a-z0-9_]+$`). Tests: `corner_chat_test_qa_a`, `_qa_b`, `_live_1` accepted; `corner_chat_dev`, `postgres`, `other_db`, `corner_chat_test_`, `corner_chat_test_QA`, `corner_chat_testing` refused, no password in the text. `test/setup.ts` keeps its strict run-name pattern. `db:init` also creates `DATABASE_URL`'s own database when it is a `corner_chat_test_<suffix>` (so QA's `_qa_a` / a throwaway live DB can be made); still no DROP (`grep -c DROP` → 0).
- **Step 10:** NOT started, on purpose — see below.
- **Tests added** (`test/config.test.ts`): probe `S` → true, `N` → false, silent → false, nothing listening → false (a fake server on 127.0.0.1); local host never probed.

**Live DoD (output with the URL never shown; `DATABASE_URL_TEST` blanked on the command line because `.env` still holds the dead `:5433` value):**
- `bun run db:init` → `database connection is not encrypted (D45: made-up data only)` · `corner_chat: created` · `corner_chat_test: created` · `corner_chat: migrated (4 file(s))`.
- `select ssl from pg_stat_ssl where pid = pg_backend_pid()` → `[{"ssl":false}]` — **`f`**, plus the warning line, as the amended DoD allows.
- Whole tree `bun run test` → `407 pass · 0 fail · 24 files [206.13s]` (was ~26 s on the local cluster: every query now crosses the internet). No timeout had to change.
- After the run, `select datname from pg_database where datname like 'corner_chat%'` → `["corner_chat","corner_chat_test"]` — no leftover run database.
- `tsc --noEmit` → 0.

**Step 10 / TASK-003 + 004 live mail lines: not started.** The connection is `ssl = f`, and the PM-decided answer (D45 (3)) says the real-mail check waits until the owner turns SSL on or says unencrypted is fine. I have not seen that OK. When it comes (or when `pg_stat_ssl` shows `t`), tell me and I run the lines in the short window.

## Questions
- For the SA: do you want `db:clean-tests` as a separate small TASK (own file, so the `DROP` stays out of `db-init.ts`)? It is optional and cheap, but it is not on this TASK's closed list.
- For the SA, for the owner via the PM: the real LINE channel token appeared once in my session output (F-021). Whether to reissue it is his call.

  > answer (SA Sober, 2026-11-01): (1) No `db:clean-tests` TASK for now. Each run drops its own database. If leftovers show up
  > after the live run, we cut it then. (2) F-021 is with the PM, who has it on record for the owner.
  >
  > **The `corner_chat_dev` refusal (SA-B, via the PM), settled `[SA-decided]`: neither side changes.** I checked `.env` (shapes
  > only, no values): `DATABASE_URL` and `DATABASE_URL_TEST` still point at the **local :5433 cluster**, with
  > `corner_chat_dev` / `corner_chat_test`.
  > - So the guard is refusing exactly what D43 forbids, and that refusal is correct.
  > - The owner already has to replace that line with his server's URL ending `/corner_chat`. That is one edit, not an extra one.
  >   `DATABASE_URL_TEST` can then be left empty, because it is derived.
  > - Until he does, no `bun run test` runs on either team. That is the cost of "no local Postgres", and the PM tells SA-B.

- **Q-OWNER-TLS (SA → PM → owner, 2026-11-01). Decision pack.** `Checked: DECISIONS D43 · SYSTEM-FACTS "env keys and the database"
  — neither says whether the server must use SSL. TASK-033 step 6 required it, and Jason found the owner's Postgres answers "N" to
  SSL (no SSL), so he stopped with nothing created.`
  - **What it means, in plain words:** without SSL, everything between this PC and his server crosses the internet unencrypted.
    That covers the queries and the data, and with the B2 check, the text of his real work mail.
    - Whether the login password itself is exposed depends on the server's login method, which we cannot see. Modern Postgres
      (`scram-sha-256`) does not send it.
  - **My default** (correct only the line that is wrong):
    1. **Best: turn SSL on** for his Postgres (`ssl = on` plus a certificate). That is his server and his call, or Otto's if he
       asks. Then everything goes ahead as written.
    2. **Until then, tests may connect without SSL**, using made-up test data only (`sslmode=disable` allowed for this dev DB).
       That unblocks both teams' `bun run test`, and `db:init` creates `corner_chat`.
    3. **The REQ-002 live mail check (his real work mail) waits for SSL**, unless he says it's fine to send it unencrypted.
  - **One more line in his `.env`:** please **empty `DATABASE_URL_TEST`**. It still points at the old local database, which is now
    stopped. Empty means "derived from `DATABASE_URL`", so there is nothing else to fill.
  - Q5 (`corner_chat` missing; the owner's own words were *"ให้ไปสร้าง database ใช้ได้"*) is covered: `db:init` creates it once,
    with the guards, as soon as line 1 or 2 is settled.

  > answer `[owner via PM, D45]` (as relayed 2026-11-01): line 2 yes, so run `db:init` now. Line 3: the real-mail check waits for
  > his SSL or his OK. The PM is asking him about `DATABASE_URL_TEST` too.

- **Amendment (SA Sober, 2026-11-01) after D45 and QA's Q10 (TEST-004). Do these, then the live DoD.** Same closed list.
  - **8. TLS when offered:** replace `sqlOptions`' "remote ⇒ `tls: true`" (`src/config.ts:102-110`) with TLS when the server
    offers it, and a plain connection otherwise (D45 line 2).
    - When the connection is plain, start-up prints **one** line: `database connection is not encrypted (D45: made-up data only)`.
      It never contains the URL.
    - Keep the probe cheap: one SSLRequest at start-up, or Bun.sql's own `prefer` if it has one (check the docs, don't guess).
  - **9. The DB name guard (Q10):** `DATABASE_URL` may name `corner_chat` **or** `corner_chat_test_<suffix>`, where the suffix
    matches `^[a-z0-9_]+$` (QA's `corner_chat_test_qa_a` / `_qa_b`, and a throwaway DB for a live check).
    - Anything else is still refused, with the same no-URL message.
    - `test/setup.ts` keeps its stricter run-name pattern (`corner_chat_test_r<pid>_<hex6>`) for what it creates and drops.
    - Tests: `corner_chat_test_qa_b` is accepted; `corner_chat_dev`, `postgres` and `other_db` are refused.
  - **10. The real-mail rule (D45 line 3):** before TASK-003/004's live lines, the run checks
    `select ssl from pg_stat_ssl where pid = pg_backend_pid()`. If it is not `t`, **stop**, unless the PM has relayed the owner's
    explicit OK to run unencrypted.
  - **DoD changes:** the TLS line becomes "`pg_stat_ssl` shown, `t` or `f`, plus the warning line if `f`". Everything else stands.

## Review
**Interim (not a verdict) — SA Sober, 2026-11-01.** The parts that can be checked without the owner's server are accepted. The
TASK stays REVIEW until the live DoD runs.
- **Step 7:** the three LINE values are the first statements in `test/setup.ts`. Its imports don't load the config; that happens
  later, through a dynamic import. Together with TASK-034 (`LINE_LIVE`), this lifts the D44 hold.
- **`.env.example`:** every key has a one-line comment. It includes `TEST_MAIL_*` and `LINE_LIVE`, `PG_LOCAL_*` is gone, and it
  says `<host>`, not the address.
- **Scripts:** `scripts/` holds only `db-init.ts` and `migrate.ts`, and `db-local.ts` is deleted. `grep -c DROP
  scripts/db-init.ts` → 0. `tsc --noEmit` → 0.
- **Waiting for the owner's `DATABASE_URL`:** `db:init`, TLS (`pg_stat_ssl`), the whole tree green against the remote server, and
  no leftover run databases. Then the verdict.

**Verdict: DONE** — SA Sober, 2026-11-01. Steps 1–10 are carried. Step 10 is a gate, and it is holding: the real-mail lines are
not run.
- **What I re-ran:**
  - on the owner's server: `DATABASE_URL_TEST= bun run test` → the warning line `database connection is not encrypted (D45: made-up
    data only)`, then `407 pass · 0 fail · 24 files [203.36s]`;
  - `tsc --noEmit` → 0;
  - `grep -c DROP scripts/db-init.ts` → 0.
- **Your evidence accepted:**
  - `db:init` created `corner_chat` and `corner_chat_test` and migrated 4 files;
  - `pg_stat_ssl` = `f` (D45 line 2);
  - no leftover run databases;
  - the TLS probe tests (`S` / `N` / silence / nothing listening);
  - the name guard tests (`_qa_a`, `_qa_b` and `_live_1` accepted; `corner_chat_dev`, `postgres`, `corner_chat_testing` and the
    rest refused, with no password in the text).
- **File repair (by me):** the TASK file held a second copy of its first 12,651 characters. A replacement text containing `` $` ``
  was read as a "text before the match" pattern. I removed the exact copy and checked the copy byte for byte before writing, so
  nothing else was touched. The file had 347 lines; it now has 219. **Jason: when an edit script's replacement text contains `$`,
  use a function replacement, `.replace(a, () => b)`.**
- **Security review:** the database connection is **not encrypted**. The owner accepted that for made-up data (D45 line 2).
  - Still unknown: the server's login method. With `scram-sha-256`, the password is not sent; with `md5` or `password`, it can be
    seen on the wire. Only turning SSL on settles both.
  - The real-mail check stays gated by step 10.
  - No URL or password is printed anywhere: the refusal texts and the warning line were checked.
  - The guards stop any database outside `corner_chat` / `corner_chat_test*` from being created or dropped.
  - No other findings.
- **Still open, for the owner via the PM:** turn SSL on, or OK the unencrypted mail check (TASK-003/004); empty
  `DATABASE_URL_TEST` in `.env`.
  > answer `[PM-decided 2026-11-01, D45]`:
  > - **(2) yes:** tests and dev may connect without SSL, on made-up test data only, to this dev server. That unblocks both
  >   teams, and `db:init` creates `corner_chat` now.
  > - **(3) yes:** the REQ-002 live check with his real work mail waits until he turns SSL on or says unencrypted is fine. I
  >   put it to him in one line, with no other ask attached.
  > - **(1):** offered to him as the better fix, his call (or Otto's, if he asks).
  > - **`DATABASE_URL_TEST`:** I ask him in the same message to empty that one line.
  > - **Plus, from QA (TEST-004 Q10):** the config guard must let a QA run start the back end on QA's own database
  >   (`corner_chat_test_qa_a` / `_qa_b`). The how is yours: e.g. accept `corner_chat_test_qa_[ab]` as `DATABASE_URL`, or a
  >   QA flag. Tanya hits it too.
