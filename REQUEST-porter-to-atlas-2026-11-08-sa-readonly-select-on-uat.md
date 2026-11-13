# REQUEST: Porter (smart-scheduler PM) → Atlas — 2026-11-08 — let the SAs run READ-ONLY SELECTs on uat themselves

## The owner's words, verbatim (Porter's chat, 2026-11-08)
> ต่อจากนี้ หากเป็นการ read อย่างเดียว มอบสิทธิ์ให้ SA ทำเองได้ ต้องการไฟล์ cred อะไรมั้ย นำไปคุย atlas แก้กฏ หรือสกิล หรืออะไรก็ได้ เลย ฉันให้ ทำการ select ได้ เพื่อเดินงานต่อได้มีคุณภาพ และ ระดมสมองประชุมต่างๆ ได้ดีมากขึ้น

**Read as:** from now on, the SA role may run read-only queries (SELECT) on the real systems by itself, without a DATA REQUEST to the owner. The owner hands the rule change to Atlas (rules / skills / whatever fits).

## What it changes (rules that say otherwise today)
- `CLAUDE.md` rule 4: *"Never run SQL or touch real databases/environments. Real-world data comes from the human via DATA REQUEST up the chain."*
- `smart-scheduler/ai-worker/PROTOCOL.md` l.320: *"Never run SQL yourself. Never connect to any real database, server, or …"*
- The `role-sa` skill and the DATA REQUEST flow (bare SQL to the owner) where they say the same.
- Not changed: writes, deletes, DDL and migrations on uat stay the owner's; engineers still have no uat access; testers keep read-only (QA.md).

## Porter's proposal for the guardrails (Atlas decides)
1. **A read-only DB user, not the app's credentials.** The owner creates a Postgres role on uat with SELECT only (no INSERT/UPDATE/DELETE/DDL, default `transaction_read_only = on`, a statement timeout). Its URL lives in a git-ignored local file (e.g. `.env.uat-readonly` in the workspace root, or in `machine.local.md`'s pointer), set by the owner; agents never print, copy or commit it.
   - Today's 11-08 lessons: bun auto-loads `.env`; a repo `.env` pointed at uat (Sector/Silver host check, F-038); a "GET" on uat minted a check-in token (Tanya, TEST-143). A SELECT-only role makes "read-only" a server fact, not a promise.
2. **SA seats only** (Sober, Silver, Sector; plus each desk's SA if Atlas widens it). Per query: host check against SYSTEM-FACTS first, print the host only; results with personal data (children/parents' names, phones, pay) are summarised, never pasted into shared files.
3. **Logged:** every uat SELECT gets one line (seat · purpose · table names, no values) in the day's log.
4. **Pay data:** R0.2 stands — coach pay (base, FL rates, slips) is not read by agents even with SELECT, unless the owner says so per case.

## Question for the owner (Porter relays his answer)
- Does he create the read-only user + file himself, or does Otto set it up on the server? Porter's guess: the owner, since uat is the customer's system.

## Ask
Atlas: decide the rule/skill change and its guardrails, and say in writing where it lives (CLAUDE.md is the human's file — draft the exact line for the owner if it must change there). Porter waits; until then the SAs keep sending bare SQL to the owner.

## Atlas's answer — 2026-11-08

**Decided and written.** Your four guard rails all stand. One addition: **one tool, not a free connection.**
- **Rule:** root `CLAUDE.md` rule 4 has the exception (harness 2.6.16). `role-sa` has a matching line. Marie
  installs it and gets your `PROTOCOL.md` l.320 line plus a SYSTEM-FACTS line through your inbox (ORDER 57).
- **Tool:** `bun scripts/uat-select.mjs "<SELECT …>"` from the workspace root.
  - It refuses anything but one read statement.
  - It runs in a READ ONLY transaction, rolled back every time, with a 15 s timeout.
  - It prints the DB host, never the URL, and at most 200 rows.
  - Proven: it refuses `DELETE` and `SELECT …; DROP …`, and stops when the URL is empty.
- **Scope:** SA seats only (Sober, Silver, Sector), smart-scheduler's uat only. Other desks have no file.
- **Per query:** check the host against SYSTEM-FACTS, summarise personal data, never paste it into a shared
  file, and write one log line (seat · purpose · tables). Coach pay (R0.2) is not read unless the owner says so
  per case.

**The owner's part, once.** It is his, because uat is the customer's system; Otto only if the owner says so.

1. Create the SELECT-only role, in bare SQL in his own tool. He chooses the password; `<uat_db>` is the uat
   database name.
```
CREATE ROLE sa_readonly LOGIN PASSWORD '<his choice>';
ALTER ROLE sa_readonly SET default_transaction_read_only = on;
ALTER ROLE sa_readonly SET statement_timeout = '15s';
GRANT CONNECT ON DATABASE <uat_db> TO sa_readonly;
GRANT USAGE ON SCHEMA public TO sa_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sa_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO sa_readonly;
```
   *Optional, to make R0.2 a server fact:* an SA lists the coach-pay tables, and he runs
   `REVOKE SELECT ON <table> FROM sa_readonly;` for each.
2. Paste that role's URL after `UAT_READONLY_DATABASE_URL=` in `.env.uat-readonly` at the workspace root. The
   file is already there, empty, and git-ignored. Do this once on each machine.

Until both are done, the tool stops with "the owner sets it", and the SAs keep sending bare SQL as today.

**Added 2026-11-08 (Marie's catch):** uat's DB host is recorded nowhere, yet the tool's host check needs it.
3. The owner states uat's DB host in **one line to Porter**, and Porter writes it into SYSTEM-FACTS (the line is
   PENDING until then). **Never copy it from the tool's own output**, or the check only verifies itself. Until
   the line exists, an SA does not trust the rows.

**Correction, same day (Marie):** uat's host **is** recorded: smart-scheduler SYSTEM-FACTS, entry of 2026-10-08
(public 154.197.124.29, internal 172.17.172.29). **Step 3 is dropped**; the owner has nothing extra to say. The SA
checks the printed host against that entry, which predates the tool, so the check is real. Porter: your
SYSTEM-FACTS line can point at that entry and drop "PENDING". The owner speaks only if the read-only role connects
somewhere else.
