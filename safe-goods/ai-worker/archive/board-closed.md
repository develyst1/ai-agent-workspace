# Board — closed rows (swept from board.md the moment they close)

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-001 | BE scaffold — Bun+Hono, Drizzle/SQLite, migration, seed, health | SPEC-001 | DONE (2026-09-21, Sober) — `tasks/TASK-001-be-scaffold.md` §Review | Jason | — |
| TASK-002 | BE auth — register/login/me, JWT, role guard | SPEC-001 | DONE (2026-09-21, Sober) — `tasks/TASK-002-be-auth.md` §Review | Jason | TASK-001 |
| TASK-003 | BE rooms core — fee, open/get/mine/join/cancel, timeline, credit | SPEC-001 | DONE (2026-09-21, Sober) — `tasks/TASK-003-be-rooms-core.md` §Review | Jason | TASK-002 |
| TASK-004 | BE payment-in — slip, files, admin confirm/reject, admin list | SPEC-001 | DONE (2026-09-21, Sober) — `tasks/TASK-004-be-payment-in.md` §Review | Jason | TASK-003 |
| TASK-005 | BE delivery→payout — evidence, deliver, parcel, received, auto-release, payout, fee settings | SPEC-001 | DONE (2026-09-21, Sober) — `tasks/TASK-005-be-delivery-payout.md` §Review | Jason | TASK-004 |
| TASK-006 | FE scaffold — house pattern, NextAuth vs BE, Thai text, register/login | SPEC-001 | DONE (2026-09-21, Sober) — `tasks/TASK-006-fe-scaffold-auth.md` §Review | Fern | TASK-002 |
| TASK-007 | FE open room + join — form, live fee preview, share link, my rooms | SPEC-001 | DONE (2026-09-21, Sober) — `tasks/TASK-007-fe-open-room-join.md` §Review | Fern | TASK-006, TASK-003 |
| TASK-008 | FE room page — status, guidance, timeline, actions, countdown | SPEC-001 | DONE (2026-09-21, Sober) — `tasks/TASK-008-fe-room-page.md` §Review | Fern | TASK-007, TASK-005 |
| TASK-009 | FE admin — slip queue, parcel, payout, fee settings, auto-release | SPEC-001 | DONE (2026-09-21, Sober) — `tasks/TASK-009-fe-admin.md` §Review | Fern | TASK-008 |
| TASK-010 | FE rework from TEST-001 — R-1..R-8 | SPEC-001 | DONE (2026-09-21, Sober) — `tasks/TASK-010-fe-rework-test-001.md` §Review | Fern | — |
| REQ-001 | Deal room — happy path | HIGH | DELIVERED (2026-09-21, Porter) — TEST-001 TEST_PASSED round 2; `requirements/REQ-001-deal-room-happy-path.md` | — |
| TASK-011 | BE Postgres switch — driver, pg schema, migration, seed, fail-fast, async guards, sweep, README | SPEC-002 | DONE (2026-09-21, Sober) — `tasks/TASK-011-be-postgres-switch.md` §Review | Jason | — |
| TASK-012 | BE tests on Postgres + regression proof | SPEC-002 | DONE (2026-09-21, Sober) — `tasks/TASK-012-be-tests-on-postgres.md` §Review | Jason | TASK-011 |
| TASK-013 | BE Change 1 — tests on embedded PGlite, TEST_DATABASE_URL removed, AC-7/8 | SPEC-002 | DONE (2026-09-21, Sober) — `tasks/TASK-013-be-tests-on-pglite.md` §Review | Jason | TASK-012 |
