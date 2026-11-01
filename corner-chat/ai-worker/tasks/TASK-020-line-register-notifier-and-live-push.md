# TASK-020: Register the LINE notifier with Team A's notify module + the live push check
- Source: SPEC-002 § LINE notifier step 1 · SPEC-001 §4 (`registerNotifier`), §3.3 (`/admin/stats/line-pushes`) · REQ-003 req 6, 8 · AC-4, AC-7 · carried from TASK-013 (SA review 2026-11-01)
- Owner: BE (Bob)
- Status: BLOCKED (waiting: Team A TASK-007 — `src/core/notify.ts` not in the tree)
- Depends on: TASK-013 (DONE) · Team A **TASK-007** (`registerNotifier`, `notifications_log`, the stats route)

- Repo: `corner-chat-back`. Team B claim only.
- Files you may edit (closed list): `src/modules/line/index.ts` · `test/line-notifier.test.ts`
- Git writes allowed: **none.**
- Tests: Team A's TASK-019 is DONE (2026-11-01), so each run gets its own database. Always run **`bun run test`** (with
  file arguments if you like), never bare `bun test`. No `DATABASE_URL_TEST` prefix any more. Leftovers from a killed run:
  `bun run db:local clean-tests`. (`corner_chat_test_b` may stay; nothing uses it now.)

## What to do
1. In `registerLine`, call Team A's `registerNotifier("line", createLineNotifier({ db: deps.db, config: deps.config }))`,
   using whatever import or `deps` path TASK-007 actually exposes. Read `src/core/notify.ts` first and quote its signature in Notes.
2. One test through `createApp()`: a made-up U1 who is linked, with an `always` rule, plus a LINE `mention` event for U1
   (signed, fake LINE API). The filter decides `notified`, so the fake records one push to U1's LINE id, `notifications_log`
   gets a `line` row with `ok=true`, and `line_pushes` gets one row. If the filter loop is not started in tests, call the
   pipeline the way Team A's own tests do, and say how.

## Definition of Done (paste real output)
- [ ] The `registerNotifier` signature quoted from `src/core/notify.ts`, and the one-line diff in `index.ts`.
- [ ] `bun run test test/line-*.test.ts` green, including the new end-to-end test; then `bun run test` (whole repo) green.
- [ ] Live, local: `bun run dev` (a port that is free), the same flow with `send-event.ts`, then `GET /api/v1/admin/stats/line-pushes`
      with the owner's token → `count` went up by 1 (paste before/after). The fake LINE API stands in for LINE (`LINE_API_BASE`).
- [ ] `git status --porcelain` → only the two files.

## Implementation Notes

## Questions

## Review
