# TASK-001: Backend bootstrap (Bun + Hono + Drizzle/SQLite)
- Source: SPEC-001
- Status: TODO
- Assignee: Jason (BE)
- Depends on: none

## What to do
Stand up a runnable backend skeleton in `H:\manager-gold\manager-gold-back`.
- Init a Bun + Hono + TypeScript project (`bun init`; add `hono`, `drizzle-orm`,
  `drizzle-kit`). SQLite via Bun's built-in `bun:sqlite` driver + Drizzle.
- App entry serves on `PORT` (default **4020**). Add **CORS** allowing
  `FRONT_ORIGIN` (default `http://localhost:3020`) with `credentials: true`.
- Wire Drizzle: a `db` module, `drizzle.config.ts`, and a `migrate` step that
  runs on start (or a `bun run migrate` script). DB file from `DATABASE_URL`
  (default `./manager-gold.sqlite`, git-ignored).
- Add a public route `GET /` → `{ ok: true, service: "manager-gold-back" }`
  (no auth) so the server is verifiably up. (The protected `/api/health` is
  added in TASK-003 once the session middleware exists.)
- Commit `.env.example` with `PORT`, `DATABASE_URL`, `FRONT_ORIGIN`, `NODE_ENV`.
  Confirm `.env` and `*.sqlite` are git-ignored (they already are).
- `package.json` scripts: `dev` (watch), `migrate`, `test`.

Follow `../architecture-baseline.md` for all conventions. Do NOT build auth here.

## Definition of Done
- [ ] `bun install` succeeds; repo has no committed `node_modules`/`.env`/`*.sqlite`.
- [ ] `bun run dev` starts the server on :4020 with no errors.
- [ ] `curl http://localhost:4020/` returns `{ "ok": true, "service": "manager-gold-back" }`.
- [ ] A cross-origin request from `http://localhost:3020` passes CORS (preflight OK, `Access-Control-Allow-Credentials: true`).
- [ ] Drizzle migrate runs cleanly and creates the SQLite file (empty schema is fine at this stage).
- [ ] `.env.example` committed with the four keys above.

## Implementation Notes
(Jason fills this in: what was changed, how it was verified, test output.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
