# `## Implementation Notes` — template

Fill this in the TASK file before moving it to `REVIEW`. Prose lives here, not in the inbox
message (the inbox message is a 1–3 line pointer).

```markdown
## Implementation Notes
- **Changed files:** `path/a` (what), `path/b` (what). Nothing else touched.
- **Contract check:** SPEC <id> §<n> ↔ code — paths/methods/shapes/status codes/error bodies match.
  Deviations: none | listed in `## Questions` (Q-n).
- **Schema:** none | migration `<file>` — up/down/up run locally (output below). Irreversible? why.
- **Transactions / idempotency / concurrency:** what is atomic, what is safe to retry, how
  concurrent writes to the same row are handled — or "N/A: read-only".
- **Errors:** each failure mode → status code + error body per SPEC; no swallowed errors.
- **Security:** input validation at <where>; authz check at <where>; no secrets/PII logged.
- **Observability:** logs/metrics/traces added at <where>, matching repo conventions.
- **Decisions I made (internal, overturnable):**
  - <decision> — <one line why>
- **Verification (real commands, real output):**
  ```
  $ <start server from clean>
  <output>
  $ <curl/http call — happy path>
  <status + body>
  $ <curl/http call — each SPEC'd failure>
  <status + body>
  $ <full test suite>
  <summary line: N passed, 0 failed>
  ```
- **UNVERIFIED:** <behaviour> — <what data/environment would settle it> | none.
- **Learned about the system:** <fact> → also written to the desk's system-facts file | none.
```

Rules:
- Paste real output, trimmed for length but never edited. Redact secrets and personal data.
- A test you did not run is `NOT_TESTED`, not omitted.
- If a check is N/A, say why in a few words.
