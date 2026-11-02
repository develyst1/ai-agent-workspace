# TASK-040: Test timeout that fits the remote database
- Source: TASK-039 Implementation Notes (Jason, 2026-11-02). With the default 5 s per-test timeout, 6 tests time out against the
  owner's remote Postgres (median query 54 ms, spikes up to about 900 ms), with or without TASK-039. With `--timeout 60000` the
  tree gives 409 pass / 0 fail. Both teams and QA run `bun run test`.
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-02; 409/0 at the new default)
- Depends on: TASK-039 (DONE)

- Repo: `corner-chat-back` · git writes: **none**
- Files you may edit (closed list): `package.json` (the `"test"` script line only)

## What to do
1. Change the `"test"` script to `bun test --preload ./test/setup.ts --timeout 30000`. Nothing else in `package.json`.

## Definition of Done (paste real output)
- [ ] `bun run test` (no extra flags) on the owner's server → 0 fail, with the time it took.
- [ ] `git status` → `package.json` only, and the diff is that one line.

## Implementation Notes

## Questions

## Review
**Verdict: DONE** — SA Sober, 2026-11-02. The `package.json` `"test"` line reads `bun test --preload ./test/setup.ts --timeout 30000`,
and nothing else in the file changed for this TASK. I ran it myself, as the owner's "ขึ้น git" was waiting on it: `bun run test` (no
extra flags) on the owner's server → `409 pass · 0 fail · 25 files [346.94s]`. Security review: not applicable — a test-runner
setting only.
