# back-pglite — the REAL back on in-memory PGlite, seeded with synthetic people (TASK-011)

Test harness only. No real database, no live gateway. Data lives in memory: a restart gives fresh seed data.

- Run from `god-plan/ai-worker`, with the three passwords in the environment (each at least 8 characters, never printed):
  `GP_SEED_OWNER_PASSWORD=… GP_SEED_A_PASSWORD=… GP_SEED_B_PASSWORD=… bun tests/harness/back-pglite/serve.ts <path-to-god-plan-back>`
  (the path is in the workspace-root `machine.local.md`). A missing password exits 1 and names the key.
- It imports `createApp`, the schema, `scripts/owner-set` and the migrations from that repo. Serves 127.0.0.1:4310.
  Fixed: `FRONT_ORIGIN=http://127.0.0.1:4300`, `LLM_GATEWAY_URL=http://127.0.0.1:4399` (start `gateway-stub/` for the AI buttons).
  `INVITE_TTL_SECONDS` optional (default 604800).
- People: owner `owner@godplan.test` · A `invitee-a@godplan.test` (member of P1) · B `invitee-b@godplan.test` (member of nothing).
- P1 "ย้ายบ้านใหม่": 6 tasks (1 todo, 2 doing, 2 stuck with reasons, 1 done), 3 comments. P2 "งานสวนหลังบ้าน": 2 tasks, no members.
- **D11 only (owner 2026-11-09 14:52: one live run, 4 calls, by QA):** the gateway is the stand-in unless BOTH `GP_LIVE_GATEWAY_URL` and `GP_LIVE_GATEWAY_CONFIRM=D11-4-calls` are set; one without the other exits 1. When live, the listening line ends `— LIVE GATEWAY (D11)`.
- 🔴 D11's 4 calls were used on 2026-11-09 at 14:55 (QA). Do not start live without the owner's new word, via the PM.
- Stop it with the PID you started it with (or `timeout`); never kill by name.
