# TASK-116: The hourly clean-up removes an audio folder that has no row
- Source: SPEC-102 § Questions Q11, § Flow (REQ-101 AC-18)
- Owner: BE (Jason)
- Status: TODO 2026-11-07, Sober
- Depends on: **after TASK-115**, in the same tree. Base: `call-scribe-back` branch `atom`, d7e36dc plus TASK-115.
- Repo: `call-scribe-back`, held by Team A, batch 2026-11-06. Branch `atom`.
- Git writes allowed: **none.**
- Files you may edit (closed list): `src/recordings/cleanup.ts`, `src/intake/files.ts`, `test/**`.

## Why

Tanya's store holds 2 folders with `audio.m4a` and no row (`tests/TEST-102-req-101-app-acceptance.md` § Stub round 1). **Nobody knows how.** I read the routes and found no path that writes that file after a delete; the delete route removes files first, and intake cleans up after itself. A real recording left this way would stay on the server with nothing in the app to delete it, against AC-18. This makes any such folder go away, whatever the cause. **It does not explain the cause, and must not be reported as if it did.**

## What to do

In `runCleanup`, after the existing steps, one sweep over `<STORAGE_DIR>`:

1. Only a directory whose name matches `UUID_RE`, and whose folder time is **older than 24 hours**, the same age as stale uploads. Anything else in `STORAGE_DIR` is left alone.
2. `store.get(id)`: **null** means no row: `removeDir`, and count it. A row: leave it.
3. **`store.get` throwing means "could not ask", never "no row":** skip that folder this round, and stop the sweep. A database that is down must never delete anyone's audio. Log `errorLabel` only.
4. The hourly log line gains `orphans=<n>`. Ids only if you log any; never a file name.
5. Sequential is fine. There is one user, and this runs once an hour.

## Definition of Done

Base check, ran 2026-11-07 at d7e36dc: `src/recordings/cleanup.ts:10-13` handles `uploading` rows and sessions only, nothing walks `STORAGE_DIR`.

- [ ] `bun test` → all pass, adding, on the memory store with a real temp folder and a fixed `now`:
  - no row, older than 24 h → folder gone, counted;
  - no row, younger than 24 h → stays (an upload may be between its steps);
  - has a row, older than 24 h, in any status → stays, with its `audio.m4a`;
  - a non-uuid name, and a plain file, in `STORAGE_DIR` → stay;
  - **`store.get` throws → nothing deleted, and the sweep stops**, and the rest of the clean-up's counts still return;
  - `STORAGE_DIR` missing → no error.
- [ ] `bun run typecheck` → clean. Closed list: `git status --porcelain`.
- [ ] **No database run needed, and no worker against `call_scribe`.**

## Implementation Notes

## Questions

## Review
