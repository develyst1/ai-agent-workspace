# REQ-006: Migrate the database from SQLite to PostgreSQL
- Status: DELIVERED
- Priority: MEDIUM
- Requested: 2026-07-28 by stakeholder (dev@smartalliance.co.th)
- Deadline: none (a deadline exists for the project but is not disclosed)

## Problem / Goal
The stakeholder wants the app's database changed from SQLite to **PostgreSQL** (the
target production DB is a real Postgres server the stakeholder provided). The app
must work fully on PostgreSQL with the same features and data model.

## Requirement
1. The backend must use **PostgreSQL** (not SQLite) for all persistence: users,
   sessions, people, feelings, interactions, tags.
2. Provide **PostgreSQL migrations** that create the complete existing schema on a
   fresh database.
3. The backend reads the connection from **`DATABASE_URL`** (env). Target database
   name is **`manager_gold`**.
4. Every existing feature and the automated test suite must pass against PostgreSQL
   (register/login, people CRUD, sub-resources, search/filter/export, AI advice +
   summary).

## Acceptance Criteria
- [x] The app runs end-to-end on PostgreSQL — verified against a local Postgres
      instance (backend boots on PG; full suite exercises all flows).
- [x] Migrations create the full schema on a fresh Postgres db (`bun run migrate`
      → 6 tables on a fresh `manager_gold`).
- [x] Backend connects via `DATABASE_URL`. *(Verified with the local URL, which has
      no `#`. The `%23`-encoded **remote/prod** password is exercised only at the
      parked deploy step — standard URL parsing, no app change needed.)*
- [x] The test suite passes against PostgreSQL (**50 pass / 0 fail on local PG,
      repeatable ×2**).

## PM Acceptance
- Accepted by Porter (PM) on 2026-07-29 against the criteria above.
- Evidence: BE `b91413b` — `pgTable` + `postgres.js`; **epoch-ms columns → `bigint`**
  (13-digit round-trip proven); PRAGMA dropped (native PG cascades); async refactor of
  all DB call sites; 50 tests green on local Postgres (×2); `test/setup.ts` refuses
  non-local DBs before its destructive reset; **no secret committed** (`git grep
  smart2026` on tracked files = empty, `.env` untracked). Sober real-code review.
- Same API/behaviour + per-user isolation as before — now on Postgres. Commit on `dong`.
- Status → DELIVERED.
- Parked (deploy step, not this REQ): creating `manager_gold` on the **remote** server
  `154.197.124.206` and running migrations there with the `%23`-encoded prod password.

## Constraints
- **Build/test against a LOCAL or dev Postgres.** The stakeholder's **remote** server
  (`154.197.124.206`) is the **deploy-time** database only — connecting to it +
  creating `manager_gold` + running migrations there is a deploy/ops step
  (human/Porter), and deployment is currently parked. Engineers do NOT need the
  remote server to build.
- Real connection string + password are **secret** — in `project-docs/db-postgres-access.md`;
  they belong in `manager-gold-back/.env` (git-ignored) only, never committed.
- **Password gotcha:** the password is `smart2026#`; in the URL the `#` must be
  percent-encoded as `%23` (a raw `#` breaks `.env`/URL parsing).
- No existing production data to migrate (current SQLite holds only throwaway test
  accounts) — a schema-parity port is enough, no data migration required.
- Stack stays Bun + Hono + Drizzle (Drizzle supports Postgres); SQLite-specific code
  gets swapped for the Postgres equivalent — technical approach is the SA's decision.

## Out of Scope
- Deploying to / running migrations on the remote production server (parked deploy step).
- Schema/feature changes beyond the SQLite→Postgres port.

## Questions
(SA Lead asks here; PM answers as `> answer: ...`)
