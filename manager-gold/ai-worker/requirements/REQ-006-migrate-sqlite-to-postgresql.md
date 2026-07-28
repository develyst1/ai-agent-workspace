# REQ-006: Migrate the database from SQLite to PostgreSQL
- Status: READY_FOR_SA
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
- [ ] The app runs end-to-end on PostgreSQL (all flows above) — verified against a
      Postgres instance.
- [ ] Migrations create the full schema on a fresh Postgres db named `manager_gold`.
- [ ] Backend connects via `DATABASE_URL` and works with the `%23`-encoded password
      (see Constraints).
- [ ] The test suite passes against PostgreSQL.

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
