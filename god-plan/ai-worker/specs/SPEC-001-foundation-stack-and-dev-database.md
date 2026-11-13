# SPEC-001: Foundation — stack and the project's dev database
- Source: REQ-001 (DRAFT; only its Q4 is answered) · `DECISIONS.md` 2026-11-08 00:39 · `SYSTEM-FACTS.md` §Stack and database
- Status: ACTIVE (this part only: the database. Product design waits for REQ-001 to reach READY_FOR_SA)
- Author: Sober (SA), 2026-11-08

## Overview
The owner answered Q4 on 2026-11-08 at 00:39 (`DECISIONS.md`): front Next.js, back Bun + Hono, and Postgres on his existing dev
server through the connection he already gave (the `DATABASE_URL` in `call-scribe-back`'s `.env`; path in `machine.local.md`).
He wants a **new database for this project only**. Creating that one database is authorised. Nothing else is.

This SPEC covers only creating that database (TASK-001). Scaffolding the repos, the schema and the API wait for REQ-001
(Q1 to Q3) and for Atom to clone `god-plan-back` / `god-plan-front` on branch `atom`.

## Decisions (who decided)
- Stack: Next.js (front), Bun + Hono (back). `[operator 2026-11-08 00:39]`
- Database name: **`god_plan`**. `[SA-decided]` The PM proposed it (SYSTEM-FACTS). Postgres folds unquoted names to
  lowercase, and an underscore needs no quoting.
- The database is created by **a harness script the BE runs once**, in `tests/harness/`, never in a product repo.
  `[SA-decided]` Reasons: there is no repo yet; it is a one-time operation, not app code; and it keeps the connection
  string out of every file and log.
- Schema tool: Drizzle, decided when the back is scaffolded. `[SA-decided, reversible]` It does not affect this TASK.

## Data Model
Exact SQL. The BE runs it once, through the TASK-001 script and nowhere else:
```sql
-- 1. existence check (read-only)
SELECT 1 FROM pg_database WHERE datname = 'god_plan';
-- 2. only if step 1 returned no row
CREATE DATABASE god_plan;
```
- **Effect on existing data:** none. `CREATE DATABASE` adds a new, empty database. The script connects through the
  given connection (call-scribe's database) only to issue these two statements. It reads and writes **no** table there.
- **Not allowed** (owner's scope, relayed via Atom): `DROP`, `ALTER` or anything else on an existing database, creating
  any new role or credential, touching any other project's data.
- **If the connection's user cannot create databases** (`permission denied to create database`): stop. No workaround, no
  new role. It becomes a question to the owner through the PM.

## Secret handling (binding on TASK-001)
- The `DATABASE_URL` value is **never** printed, echoed, logged, pasted into a TASK, or written to any file in this
  workspace. The script reads it from `call-scribe-back/.env` into a shell variable and passes it straight to `psql`.
- No `set -x`. The script doesn't `source` the `.env` (that would run its contents as shell). It reads exactly one key.

## Non-functional
- Idempotent: a second run reports `exists` and changes nothing.

## Tasks
- TASK-001: create the `god_plan` dev database. Owner: BE. Depends on: none.

## Questions
- **Q-S1 (SA → PM, does not block TASK-001):** When `god-plan-back` exists, the app needs its own `DATABASE_URL`, pointing at
  `god_plan`, in that repo's **git-ignored** `.env`. SYSTEM-FACTS says the values are "never copied into any file, log or
  chat". I read that as: never into a committed file, a log or chat. A git-ignored `.env` is where the app must read it
  from. **My default:** the BE writes `god-plan-back/.env` (git-ignored, checked with `git check-ignore`). The value is
  call-scribe's URL with the database name changed to `god_plan`, and it is never printed. **Correct only if the owner
  wants to put that `.env` in himself.**
  `Checked: DECISIONS 2026-11-08 00:39 · SYSTEM-FACTS §Stack and database — not covered because it rules on the value
  being copied, not on where the app reads it from.`
  > answer (Porter, PM, 2026-11-08) `[PM-decided: interpreting my own SYSTEM-FACTS line]`: your reading is what I meant —
  > never into a committed file, a log or chat. Your default stands: the BE writes the git-ignored `god-plan-back/.env`
  > (checked with `git check-ignore`), value = the owner's existing URL with the database name `god_plan` ("ใช้ DB_URL
  > แบบเดิมเลย แค่ สร้าง database ของโปรเจคนี้เอง", owner 00:39), never printed. And the repo's `.env.example` lists every
  > key with one line on what it is for, no values (workspace `CLAUDE.md` rule 4). Clarified in SYSTEM-FACTS.
