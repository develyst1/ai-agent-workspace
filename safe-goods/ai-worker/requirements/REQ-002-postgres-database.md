# REQ-002: Run on PostgreSQL (replace local SQLite)
- Status: SPEC_DONE (2026-09-21, Sober — TASK-011..013 DONE; ready for the owner to deploy to SIT; AC-3 by Tanya on SIT)
- Priority: HIGH (blocks REQ-003 — the owner wants every further test on this DB)
- Requested: 2026-09-21 by the owner
- Deadline: none
- Source: `SYSTEM-FACTS.md` §Database (owner, 2026-09-21: *"ใช้อันนี้แทน db ที่ใช้อยู่"*, Q16 *"ก ทำเลย ตอนจะเทส ฉันจะแก้ env ให้"*).

## Problem / Goal
REQ-001 was built and tested on a local SQLite file. The owner has a shared **dev/test PostgreSQL** database and wants the product to run on it from now on, so that what Tanya tests and what he tries are the same data. The connection string carries a password: it must live only in a git-ignored `.env`, which **the owner fills in himself when it is time to test**.

## Requirement
1. `safe-goods-back` must use **PostgreSQL** as its only database, configured by a single `DATABASE_URL` environment variable (standard `postgresql://…` form). SQLite support is removed, not kept as a fallback.
2. Schema migrations must be runnable by the team with one documented command against whatever `DATABASE_URL` is set, starting from an **empty** database; running them twice is harmless.
3. The seed (admin account, the two categories, fee settings 20% / 20 THB) must be runnable with one documented command and be idempotent.
4. No connection string, password or host may appear in any committed file, README example included (use a placeholder). `.env` stays git-ignored.
5. Everything REQ-001 delivered must behave identically on PostgreSQL — same statuses, amounts, timeline, auto-release, credit. Case-insensitive email uniqueness (REQ-001 AC-26) must still hold.
6. `README` of `safe-goods-back` must state: required `DATABASE_URL`, migrate command, seed command, and that the owner supplies the dev-DB URL.

## Acceptance Criteria
- [ ] AC-1 — **Given** an empty PostgreSQL database and `DATABASE_URL` pointing at it **When** the documented migrate + seed commands run **Then** the API starts, `admin@local.test` can log in, the two categories exist, fee settings read 20 / 20.
- [ ] AC-2 — **Given** AC-1 done **When** the migrate command runs again **Then** it exits cleanly and changes nothing.
- [ ] AC-3 — **Given** the app on PostgreSQL **When** Tanya re-runs the TEST-001 regression subset (`tests/REGRESSION.md`) **Then** every case passes with the same expected values as on SQLite.
- [ ] AC-4 — **Given** a user registered as `Tanya-Seller@qa.test` **When** someone registers `tanya-seller@qa.test` **Then** it is refused with "อีเมลนี้ถูกใช้แล้ว".
- [ ] AC-5 — **Given** the repos **When** searched for `postgresql://` **Then** the only hits are placeholders (no real host, user or password), and `.env` is git-ignored.
- [ ] AC-6 — **Given** `DATABASE_URL` unset or unreachable **When** the API starts **Then** it fails fast with a clear message naming `DATABASE_URL` (no silent SQLite fallback).

## User-facing wording
None — no user-visible change.

## Constraints
- Dev DB = the owner's PostgreSQL (SYSTEM-FACTS §Database); the team may migrate/seed/write test data there (Q16). Engineers develop against a local PostgreSQL of their own until the owner sets the URL.
- Backend stack unchanged (Bun + Hono + the existing ORM); FE untouched unless the API contract changes (it must not).

## Out of Scope
- Data migration from the SQLite files (test data only — discard).
- Hosting, backups, production.

## Questions

## Change 1 (owner, 2026-09-21: *"เอา env test database ออกละ"*)
7. The `TEST_DATABASE_URL` environment variable is **removed** — from `.env`, `.env.example`, README and code. The only database setting is `DATABASE_URL`.
8. `bun test` must **never truncate, drop or migrate the database named by `DATABASE_URL`**. How the test suite gets an isolated database (ephemeral schema, container, whatever Sober decides) is the SPEC's; it must not require the owner to set any extra env.
- [ ] AC-7 — **Given** the repo **When** searched for `TEST_DATABASE_URL` **Then** there are no hits.
- [ ] AC-8 — **Given** `DATABASE_URL` points at a database holding one room **When** `bun test` runs to completion **Then** that room still exists unchanged.
