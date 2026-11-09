# TASK-112: Put back the gateway's lost tracked edits and prove `/audio/*` again
- Source: SPEC-101 (REQ-101); restores TASK-101 and TASK-102
- Owner: BE (Bob)
- Status: DONE (2026-11-06, Silver)
- Depends on: none
- Repo: `develyst-ai`, held by Team B, batch 2026-11-06. Branch `atom`, HEAD 790f63a. Path in `machine.local.md`.
- Git writes allowed: **none.** Reading (`git status`, `git diff`) is fine. The SA commits only on the owner's command.
- Files you may edit (closed list, nothing else):
  - `src/index.ts`: exactly 3 added lines, below
  - `.env.example`, `CLAUDE.md`, `docs/consumer-guide.md`
  - `ai-worker/tests/harness/audio-run-all.sh`: the guard below only (on the desk, not in the repo)
- Files you may create: `ai-worker/tests/harness/TASK-112-tracked-edits.patch`
- **Do not edit** `src/audio/*`, `src/routes/audio.ts`, `bruno/*`: they survived. If a check says one is wrong, stop and ask.
- **Not your fault, and no FAILURES entry for you:** this work was done and reviewed, then lost.

## What happened
`git reflog` shows `reset: moving to origin/atom` at 2026-11-06 17:18:01, and the four tracked files carry that time. Their edits are gone (0 lines with "audio" in each; no stash, and no copy found under `/workspace` or `/tmp/claude-1000`). The new files were put back at 17:17. Nothing mounts them, so `/audio/*` answers 404. Who ran the reset is not known; the PM has it.

**What I ran on a scratch copy, 2026-11-06, Bun 1.4.4:** with only the 3 lines below added: `index.js 94.85 KB`, driver `TOTAL suites failed: 0`, `audio-adapters.sh` `pass=273 fail=0`. So the surviving code is whole and this is a small TASK. The docs were not in that run; they must be rewritten.

## What to do

1. **`bun install --frozen-lockfile`** in the repo. `node_modules` is missing there (base: `bun build` fails with `Could not resolve: "hono/cors"`) and is git-ignored.
2. **`src/index.ts`**, exactly these 3 lines; `GET /` stays as it is:
   - after `import search from "./routes/search";` add `import audio from "./routes/audio";`
   - after `app.use("/search/*", authMiddleware);` add `app.use("/audio/*", authMiddleware);`
   - after `app.route("/search", search);` add `app.route("/audio", audio);`
3. **`.env.example`:** every key in SPEC-101 § Env, one line saying what it is for. Leave both `AUDIO_*_PROVIDER` lines commented out or empty, so a copy of the file stays on `503`.
4. **`CLAUDE.md`:** key-files table rows for `src/routes/audio.ts` and `src/audio/`; env table rows for the same keys; and in the existing `AUTH_ENABLED` and `authMiddleware` rows, add `/audio/*` to the routes they name. Nothing outside those two tables.
5. **`docs/consumer-guide.md`:** a new § 6b for the audio routes, written from SPEC-101 § API / Interface Design (the three routes, field names, status codes, error codes), and one bullet saying the providers are `gemini`, `xai` and `stub`. Do not restate limits the SPEC does not state.
6. **`audio-run-all.sh`:** directly under the `REPO=` line add this guard, as written:
   ```bash
   if grep -Eqs '^[[:space:]]*(export[[:space:]]+)?AUDIO_(TRANSCRIBE|SUMMARY)_PROVIDER=["'"'"']?[[:alnum:]]' "$REPO/.env"; then
     echo "REFUSING: $REPO/.env names an AUDIO provider, so the notconfigured suite would call it. Pass it on the command line instead."; exit 2
   fi
   ```
   **Why a refusal and not empty values on the suite's line:** I tried that first and it does not work. Through `bun run start`, the value in `.env` still wins over an empty one, and the suite tried to call Google (2 attempts, refused by my probe). A direct `bun src/index.ts` behaves differently, so do not judge this from one.
7. **Save the tracked edits:** `git diff HEAD -- .env.example CLAUDE.md docs/consumer-guide.md src/index.ts > <desk>/ai-worker/tests/harness/TASK-112-tracked-edits.patch`. Uncommitted edits were lost once. Put no secret in those files.

## Definition of Done
Run on the real repo, except where it says a copy. `<repo>` is the path from `machine.local.md`.

- [ ] Only the expected files changed. `git status --short` → `M` on exactly the 4 tracked files, plus the same 5 `??` lines as now (3 `.bru`, `src/audio/`, `src/routes/audio.ts`). `git diff --numstat -- src/index.ts` → `3	0	src/index.ts`.
- [ ] Old code is untouched. `git diff --stat -- src/providers src/routes/chat.ts src/routes/search.ts src/types/index.ts src/config/models.ts` → empty.
- [ ] Builds. `bun build src/index.ts --outdir "$(mktemp -d)" --target bun` → exit 0.
- [ ] It answers. `AUTH_ENABLED=false AUDIO_TRANSCRIBE_PROVIDER=stub AUDIO_SUMMARY_PROVIDER=stub PORT=3941 bun run start`: `GET /` → 200, and `GET /audio/jobs/x` → 404 with `job_not_found` in the body (a plain 404 means it is still unmounted). Paste both. Stop it by port.
- [ ] Contract. `bash ai-worker/tests/harness/audio-run-all.sh <repo>` → `TOTAL suites failed: 0`, exit 0.
- [ ] Adapters. `GATEWAY_REPO=<repo> bash ai-worker/tests/harness/audio-adapters.sh 3943` → `fail=0`.
- [ ] The guard, **on a copy**: `W=$(mktemp -d); cp -a <repo>/. "$W"/`, then:
  - `printf 'GEMINI_API_KEY=FAKE\nAUDIO_SUMMARY_PROVIDER=gemini\n' > "$W/.env"`; the driver on `$W` → `REFUSING`, exit 2.
  - `printf 'GEMINI_API_KEY=FAKE\nXAI_API_KEY=FAKE2\n' > "$W/.env"`; `printf 'preload = ["<desk>/ai-worker/tests/harness/refuse-fetch.ts"]\n' > "$W/bunfig.toml"`; `OUTBOUND_LOG=$W/out.log bash ai-worker/tests/harness/audio-run-all.sh "$W"` → `TOTAL suites failed: 0`, and `out.log` missing or 0 lines.
  - `.env.example` copied to `$W/.env` → the driver does not refuse. Then `rm -rf "$W"`.
- [ ] The patch is real. `git apply --check -R <desk>/ai-worker/tests/harness/TASK-112-tracked-edits.patch` → exit 0.
- [ ] Docs carry the keys. Each key in SPEC-101 § Env: `grep -c` in `.env.example` and in `CLAUDE.md` ≥ 1. Paste the counts.
- [ ] Footprint. Servers stopped, ports free, no `.env` or `api-keys.json` left in the repo.

## Implementation Notes
Repo `develyst-ai` (path from `machine.local.md`), branch `atom`, 790f63a. Bun 1.4.4. No git writes.

**Changed:** `bun install --frozen-lockfile` (5 packages) · `src/index.ts` +3 lines as listed · `.env.example` all 10 SPEC-101 keys, one line each, both `AUDIO_*_PROVIDER` and the two stub keys commented out · `CLAUDE.md` two key-file rows, `/audio/*` added to the `authMiddleware` and `AUTH_ENABLED` rows, 9 env rows · `docs/consumer-guide.md` § 6b from SPEC-101 plus one bullet in § 7 · guard added to `audio-run-all.sh` under `REPO=`, as written · patch saved.
Decision `[BE-decided]`: the three env rows' keys that SPEC lists as one row (`AUDIO_STUB_MODE`, `AUDIO_STUB_DELAY_MS`) are one row in CLAUDE.md too, one line each in `.env.example`.

**Evidence (real output):**
- `git status --short`: `M` on `.env.example`, `CLAUDE.md`, `docs/consumer-guide.md`, `src/index.ts`; the same 5 `??` lines as before. `git diff --numstat -- src/index.ts` → `3	0	src/index.ts`.
- `git diff --stat -- src/providers src/routes/chat.ts src/routes/search.ts src/types/index.ts src/config/models.ts` → empty.
- `bun build src/index.ts --outdir <tmp> --target bun` → `index.js  94.85 KB (entry point)`.
- Stub server on 3941: `GET /` returned the info JSON (the status code was cut off by my `cut`; the driver's suites cover it); `GET /audio/jobs/x` → `{"success":false,"error":"job_not_found"} [404]`. Port free after `fuser -k`.
- `audio-run-all.sh <repo>` → exit 0, `TOTAL suites failed: 0` (every suite `fail=0`).
- `GATEWAY_REPO=<repo> audio-adapters.sh 3943` → `SUMMARY pass=273 fail=0`.
- Guard on a copy: `.env` with `AUDIO_SUMMARY_PROVIDER=gemini` → `REFUSING: …`, exit 2. `.env` with two FAKE keys + `refuse-fetch.ts` preload → `TOTAL suites failed: 0`, `out.log` missing (0 outbound). `.env.example` copied to `.env` → no REFUSING; suites started (I cut that run at 20 s). Copy removed.
- `git apply --check -R TASK-112-tracked-edits.patch` → exit 0 (161 lines). `grep -c 'sk-\|key-placeholder'` on it → 0.
- Key counts, `.env.example` / `CLAUDE.md`: each of the 10 keys = 1 / 1.
- Footprint: ports 3941, 3943, 3951-3960, 3942 free; no `.env` or `api-keys.json` in the repo.

**UNVERIFIED:** `/security-review` and the silent-failure hunter were not run: no auth or error code changed, only 3 mount lines and docs. The docs' wording was written from SPEC-101, not diffed against `src/routes/audio.ts` line by line. Real providers not called.

## Questions
(Bob asks; Silver answers as `> answer: …`.)

## Review
**DONE.** Silver, 2026-11-06. `DONE` means built and proven by the engineer on the stub and a stubbed `fetch`. Real provider behaviour remains `UNVERIFIED` until TASK-103.

Rerun by me on a snapshot of the working tree (Bun 1.4.4, no key, no provider):
- `git status --short`: the 4 `M` files and the same 5 `??` lines. Numstat: `src/index.ts` 3/0, `.env.example` 12/0, `CLAUDE.md` 13/2, guide 62/0. The diff of `src/index.ts` is exactly the 3 lines.
- `GET /` 200 (the status Bob's `cut` lost), and its body has no "audio". `GET /audio/jobs/x` → `{"success":false,"error":"job_not_found"} [404]`. `/audio` answers again.
- Driver: exit 0, `TOTAL suites failed: 0`, 10 suites `fail=0`, including the auth suite's no-header and unknown-key cases. Adapters: `SUMMARY pass=273 fail=0`. `git apply --check -R` on the patch: exit 0.
- `.env.example` copied to `.env`, the run Bob cut at 20 s, with `refuse-fetch.ts`: 9 of 10 full runs exit 0 in 31-33 s, `TOTAL suites failed: 0`, outbound 0.

**Open, not explained:** the other run, my first, hung past `timeout 200` in the `capacity` suite, just after `capacity: summary during first: status`, the point where it polls the first job. The hang was over 170 s, longer than that poll's own 30-second limit, so a `curl` with no time limit may have been waiting, which I did not confirm. It was not reproduced in 9 later runs, and I captured no state from it. A server that stops answering under load and a harness or box hiccup both fit. If it recurs, capture the state before killing anything. Not a reason to hold this TASK: the same code passes everything else, and the mount lines do not touch job handling.

Docs: read in full against SPEC-101 (three routes, status and error codes, snake_case fields, poll interval). A loop over every quoted snake_case string in `src/routes/audio.ts` and `src/audio/*.ts` found one missing from the guide, `summary_fail`, which is a stub-only mode and rightly only in `CLAUDE.md`. `CLAUDE.md`'s changes stay inside the two tables. Bob's `[BE-decided]` on one combined stub row: accepted.

Security `[SA-decided]`: `/security-review` not rerun. This change only adds the mount line for the same middleware, proven by the auth suite. The audio code was read by hand at TASK-102's review, with no finding. **Limit:** the surviving files cannot be diffed against what I reviewed, since no copy exists; the suites passing is the evidence that they match, not proof.

~~Still exposed: every edit here is uncommitted. With the PM, for the owner.~~ Committed on the owner's `ขึ้น git` (typed by Atom, 2026-11-06 18:00, `DECISIONS.md`): `develyst-ai`, branch `atom`, `6711807`, 18 files. Silver.
