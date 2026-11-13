# TASK-011: Harness — run the REAL back on PGlite in memory, seeded with synthetic people (until the dev DB exists)
- Source: SPEC-002 (§Testability; §Environment keys) · TASK-007 Q-F4 · the unblocking the TASK-001 wait needs
- Owner: BE (Jason)
- Status: DONE (2026-11-08, SA review; run by the SA)
- Depends on: none (TASK-004/005/006 DONE)
- Git: none by you. It lives in the workspace (`tests/harness/`), not in a product repo.

## Why
TASK-001 (the `god_plan` dev database) waits on the owner. Until then the front has only been driven against Fern's own reading of
the SPEC (`tests/harness/front-contract-stub/`), and a contract mismatch with the real back would not show. You already ran the
**real** app on PGlite over HTTP for TASK-006. Make that a reusable harness, so the FE (and QA) drive the **real back**.
It is a test harness only. It never replaces the dev database for the real-Postgres run (TASK-003 steps 6–7).

## What to do
1. Create `god-plan/ai-worker/tests/harness/back-pglite/serve.ts` + `README.md` (≤ 15 lines). Run it as
   `bun tests/harness/back-pglite/serve.ts <path-to-god-plan-back>` (the path from `machine.local.md`, passed as an argument and
   never written into the file). It:
   - imports `createApp` and the schema/migrations **from that repo path** (no copy of back code in the workspace);
   - opens PGlite in memory, applies the repo's `drizzle/` migrations, and serves with `Bun.serve` on `127.0.0.1:4310`,
     `idleTimeout: 30`;
   - deps: `FRONT_ORIGIN=http://127.0.0.1:4300`, `LLM_GATEWAY_URL=http://127.0.0.1:4399` (the stand-in only, **never the live
     gateway**), `INVITE_TTL_SECONDS` from the environment (default 604800), `cookieSecure=false`;
   - seeds synthetic data through the repo's own code paths (`setOwner`, inserts that respect the CHECKs): the owner, invitee A
     (member of P1), invitee B (member of nothing), project P1 with 6 tasks across all four statuses (2 ติดอยู่ with reasons) and a
     few comments, and project P2 with 2 tasks. Emails `*@godplan.test`, Thai synthetic names.
   - **Passwords come from the environment, required:** `GP_SEED_OWNER_PASSWORD`, `GP_SEED_A_PASSWORD`, `GP_SEED_B_PASSWORD`
     (fail fast naming the missing one; never print values). Emails are fixed in the script and listed in the README.
   - prints only `back-pglite listening on 127.0.0.1:4310 (seeded: owner, A, B, P1, P2)`.
2. Data lives in memory only; a restart gives fresh seed data.

## Definition of Done
- [ ] Started with the three env passwords, then: `curl` sign-in as the owner → 200 and `P1` returns the 6 tasks ·
      as A → `GET /api/projects` lists P1 only · as B → P1's address → 404 · S1 on P1 → the 2 ติดอยู่ tasks. Paste (cookies redacted).
- [ ] Started with one password missing → exits non-zero naming the key, no value printed. Paste.
- [ ] `grep -rn "ai.develyst.online\|DATABASE_URL" tests/harness/back-pglite` → no hits. Paste.
- [ ] Stopped afterwards (no process left on 4310; the machine's hook forbids killing by name: use `timeout` or your own PID).

## Implementation Notes
**Done (Jason, 2026-11-08).** Files: `tests/harness/back-pglite/serve.ts` (≈90 lines) and `README.md` (12 lines). Nothing under `god-plan-back` changed; no back code is copied into the workspace; the repo path is an argument only (the run used the path from `machine.local.md`, not written into any file).

How it works: checks the three `GP_SEED_*_PASSWORD` keys first (missing → exit 1 naming the key; under 8 characters → exit 1 naming the key; never a value), then `process.chdir(<repo>)` and imports `src/app` (`createApp`), `test/setup` (`makeTestDb`: PGlite in memory + the repo's own `./drizzle` migrations), `scripts/owner-set` (`setOwner`) and `src/db/schema` **from the repo path**. Seeds: owner through `setOwner`; invitees A and B by inserts (argon2 hash, CHECK-respecting); P1 "ย้ายบ้านใหม่" with 6 tasks (1 todo, 2 doing, 2 stuck with reasons, 1 done) and 3 comments, A a member; P2 "งานสวนหลังบ้าน" with 2 tasks. Serves 127.0.0.1:4310, `idleTimeout: 30`, `FRONT_ORIGIN` 4300, `LLM_GATEWAY_URL` the stand-in on 4399, `INVITE_TTL_SECONDS` from env (default 604800, must be an integer ≥ 1), `cookieSecure=false`. Prints only the one listening line.

Evidence (passwords were random values held in shell variables, never printed; cookies are in scratch jars, deleted afterwards):
```
$ env -u GP_SEED_A_PASSWORD bun tests/harness/back-pglite/serve.ts <repo>
Missing required environment variable: GP_SEED_A_PASSWORD        exit=1
$ bun tests/harness/back-pglite/serve.ts                          usage: … exit=2
back-pglite listening on 127.0.0.1:4310 (seeded: owner, A, B, P1, P2)
sign-in owner → http=200 · sign-in a → http=200 · sign-in b → http=200
owner GET /api/projects → ย้ายบ้านใหม่ {todo:1,doing:2,stuck:2,done:1} · งานสวนหลังบ้าน {todo:1,doing:1,stuck:0,done:0}
owner GET P1 → http=200, 6 tasks: จองรถขนของ todo 0 · แพ็คของห้องนอน doing 1 · แพ็คของห้องครัว doing 0 ·
                ย้ายอินเทอร์เน็ต stuck 2 · โอนทะเบียนบ้าน stuck 0 · ทำความสะอาดบ้านเก่า done 0    (name, status, commentCount)
A GET /api/projects → ['ย้ายบ้านใหม่']
B GET P1 → {"error":{"code":"NOT_FOUND"}} ← http=404 · B GET /api/projects → {"projects":[]}
owner S1 on P1 → stuck [(ย้ายอินเทอร์เน็ต, รอช่างนัดวัน), (โอนทะเบียนบ้าน, รอเอกสารจากเจ้าของเดิม)], ai=None
after stop: listeners on 4310 → 0
$ grep -rn "ai.develyst.online\|DATABASE_URL" tests/harness/back-pglite → no match (exit 1)
```
Stopped by the port's own PID (`ss … | xargs kill`); no process left on 4310. The files in the folder afterwards: `README.md`, `serve.ts`.

Notes for the SA (decisions, mine, reversible):
1. It imports the back's **test helper** `test/setup.ts` for PGlite + migrations instead of re-implementing them: if that file moves, this harness breaks (one line to fix).
2. `process.chdir` into the repo is a side effect of that helper's relative `./drizzle`; harmless for a throwaway process.
3. Invitee emails are `invitee-a@godplan.test` / `invitee-b@godplan.test` (listed in the README); the TASK fixed only "`*@godplan.test`".
4. P1 and P2 are looked up by name in the checks above, not by id (ids change every restart).
`UNVERIFIED`: AI buttons through this harness (needs `gateway-stub/` started; verified separately in TASK-006). This does **not** replace the real-Postgres run (TASK-003 steps 6–7).

## Questions

## Review
**DONE — Sober (SA), 2026-11-08.**
- **Ran it myself:** three random passwords in env vars (never printed), `timeout 25 bun tests/harness/back-pglite/serve.ts <repo>` → the one
  listening line. Sign-in as `owner@godplan.test` → 200. `GET /api/projects` → both seeded projects with their counts. The process stops
  itself (no kill needed). The cookie jar was deleted.
- Read `serve.ts`: the only output is usage, missing/invalid key **names** and the listening line. No password value is logged. No
  `DATABASE_URL`. No live gateway.
- Decisions 1–4 accepted. Reusing `test/setup.ts` is the right call (one source of migrations). If that file ever moves, this breaks loudly, which is fine.
- **Use:** the FE re-runs `task-007.mjs` (and later 008/009) against this. QA may run TEST-001 locally on it (via the PM). It never stands
  in for the real-Postgres run (TASK-003 steps 6–7).
