# Backend checklist — depth behind SKILL.md §3

Use the sections the TASK touches. The repo's existing conventions win over anything here; where
they conflict with a safety line (secrets, authz, silent failure), raise it as a question.

## API contract
- The SPEC is the contract. Paths, methods, field names and casing, types, nullability, defaults,
  pagination, sorting, status codes and the error body shape all match it.
- **Breaking changes** (any of these is a requirement, not an implementation choice): removing or
  renaming a field; changing a type or nullability; making an optional input required; tightening
  validation; changing a status code, default, sort order or pagination semantics; changing auth.
- Additive changes (new optional field, new endpoint) still need to be in the SPEC.
- One consistent error shape; do not leak stack traces, SQL or internal ids in error bodies.
- Correct semantics: GET is safe; PUT/DELETE idempotent; POST that may be retried takes an
  idempotency key or is naturally idempotent.
- Validate inputs at the boundary with the repo's validator; reject unknown/oversized input.
- Contract tests (or request/response assertions) pin the shape so drift fails a test.

## Data model and migrations
- Migration written **before** the code that needs it; one concern per migration.
- `up` and `down` both written and run locally: `up → down → up`. If truly irreversible (data
  destroyed), say so in Implementation Notes and get it acknowledged.
- Expand → migrate → contract for renames/type changes on live tables: add new, backfill,
  switch reads, remove old in a later change. Never rename in place under running code.
- Constraints in the database (NOT NULL, FK, UNIQUE, CHECK) — not only in application code.
- Index what you filter/join on; check the query plan for new queries on large tables.
- Backfills batched; long-running locks avoided; default values on large tables considered.
- Seeds and fixtures are local and fake. Never copy real personal data into fixtures.

## Transactions, idempotency, concurrency
- Every operation that writes more than one row/table that must agree runs in one transaction.
- No external calls (HTTP, queue, email) inside a DB transaction; use an outbox or do them after
  commit and handle the failure.
- Retries: bounded, with backoff, only for idempotent operations, and logged.
- Concurrent writers: pick one — optimistic version column, `SELECT … FOR UPDATE`, or a unique
  constraint that makes the second write fail cleanly. Write down which and why.
- Check-then-act races (`if not exists then insert`) are replaced by constraints or upserts.
- Time: store UTC; be explicit about time zones at the edges.

## Error handling — no silent failures
- No empty catch blocks; no catch that logs and continues as if it succeeded.
- No `catch → return null/[]/false` unless the SPEC defines that as the behaviour.
- No fallback default for required config; fail fast at startup with a clear message.
- Map domain errors to SPEC'd status codes deliberately; unknown errors → 500 + logged with context.
- Async: every promise awaited or explicitly handled; background jobs report failure somewhere
  observable.
- Run the `silent-failure-hunter` agent on the diff when you touched error paths.

## Observability
- Structured logs at the level the repo uses; include a request/correlation id.
- Log the decision and the identifiers, never the secrets or personal data (tokens, passwords,
  national ids, full card numbers, raw request bodies with credentials).
- Errors logged once, where handled, with enough context to reproduce.
- Metrics/traces for the new path if the repo has them (latency, error count, external-call timing).

## Security by default
- **Authz on every resource access**: the caller is allowed to touch *this* record, not just
  logged in. Test the "other user's id" case.
- Parameterised queries / ORM bindings only; no string-built SQL.
- Validate and bound all input (size, type, range, enum); encode output.
- Secrets from environment/secret store only; never in code, tests, logs, commits, TASKs or
  pasted output. `.env` is git-ignored; check before you finish.
- OWASP Top 10 pass on the diff: broken access control, injection, auth failures, SSRF on any
  user-supplied URL, insecure deserialisation, security misconfiguration, vulnerable deps.
- Rate-limit or otherwise protect expensive/auth endpoints if the SPEC or repo expects it.
- Run `/security-review` when you touched auth, input handling, secrets or queries.

## Performance — with measurement
- Measure before changing: timing, query count, query plan, payload size.
- Watch for N+1 queries, unbounded result sets (always paginate/limit), missing indexes,
  synchronous work that belongs in a job.
- Report before/after numbers with the command that produced them, or make no performance claim.
- Regressions: `mattpocock-skills:diagnosing-bugs`.

## Tests at the right level
- **Unit** — pure logic, mapping, validation rules.
- **Integration** — DB behaviour, transactions, constraints, migrations, repository queries,
  against a real local database (not mocks) where the repo allows.
- **Contract** — the API shape and status codes the SPEC promises, including error cases.
- Cover each SPEC'd failure mode, the authz-negative case, and the concurrency case if relevant.
- Run the full suite before `REVIEW`; paste the summary line.
