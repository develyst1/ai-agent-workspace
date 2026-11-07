# TASK-101: Gateway `/audio/*` routes, byte checks, job store and stub provider
- Source: SPEC-101 (REQ-101)
- Owner: BE (Bob)
- Status: DONE (2026-11-06, Silver). Reviewed DONE at 16:44; tracked edits lost in the 17:18:01 reset and restored and re-proven by TASK-112.
- Depends on: none. The AC-11 baseline is taken (PM, 2026-11-06, `tests/TEST-101-gateway-regression-ac11.md`).
- Repo: `develyst-ai` (path in the workspace-root `machine.local.md`), held by Team B, board § Batch claims, batch 2026-11-06
- Base: branch `atom`, HEAD 790f63a, tree clean, read 2026-11-06. Read the repo's own `CLAUDE.md` first.
- Git writes allowed: **none.** Leave the change in the working tree. The SA commits only on the owner's command.
- Files you may edit (closed list, nothing else):
  - `src/index.ts`: only the import, `app.use("/audio/*", authMiddleware)` and `app.route("/audio", audio)`. **`GET /` stays as it is.**
  - `src/routes/audio.ts` (new)
  - `src/audio/*` (new; split as you like, and name the files in your notes)
  - `.env.example`, `docs/consumer-guide.md`, `CLAUDE.md` (add to its key-files and env tables only)
  - `bruno/POST Audio Transcription.bru`, `bruno/POST Audio Summary.bru`, `bruno/GET Audio Job.bru` (new)
- Throwaway scripts: `ai-worker/tests/harness/` on the desk, never in the repo. **No real recording, anywhere.** Fixtures are generated into a `mktemp -d` folder and removed.

## What to do

Build SPEC-101 § "API / Interface Design", § "Stub provider", § "Data Model" and § "Env" exactly. The SPEC is the contract: paths, field
casing, status codes and error codes are not yours to change. If one looks wrong, ask in `## Questions`.

**No network call to any provider in this TASK**, and no key is needed. `gemini` and `xai` as provider settings give `503 audio_not_configured` until TASK-102.

**Do not touch** `src/providers/*`, `src/routes/chat.ts`, `src/routes/search.ts`, `src/types/index.ts`, `src/config/models.ts`.

Points the SPEC leaves to this TASK:

1. **Adapter seam, in `src/audio/`.** TASK-102 plugs into this, so keep it exact:
   ```ts
   export type AudioFormat = "m4a" | "aac" | "mp3" | "wav" | "ogg" | "webm" | "flac";
   export type RawTurn = { speaker: number; text: string };
   export interface Transcriber {
     transcribe(input: { bytes: Uint8Array; format: AudioFormat; signal: AbortSignal }):
       Promise<{ provider: string; model: string; turns: RawTurn[] }>;
   }
   export interface Summarizer {
     summarize(input: { turns: RawTurn[]; signal: AbortSignal }):
       Promise<{ provider: string; model: string; summary: string }>;
   }
   export class AudioJobError extends Error { constructor(public code: AudioJobErrorCode) { super(code); } }
   ```
   An adapter throws `AudioJobError` with a code from the SPEC's table. Any other throw becomes `provider_failed`. The abort from `AUDIO_JOB_TIMEOUT_MS` becomes `provider_timeout`.
2. **Normalising is in one shared function, not in adapters:** drop empty text, merge consecutive turns of one speaker, renumber speakers from 1 by first appearance, set `speaker_count`. No turns left means `no_speech: true`.
3. **`retryable`** comes from a single table of the SPEC's codes.
4. **Byte check,** in this order: empty → `unsupported_audio`. `ftyp` at offset 4 → scan the whole file for the `hdlr` box's `vide` handler (the tag `hdlr`, then bytes +12 to +15 are `vide`) → `video_not_allowed`, otherwise `m4a`. `0x1A45DFA3` → scan the first 64 KiB for `V_VP8`, `V_VP9`, `V_AV1`, `V_MPEG4` → `video_not_allowed`, otherwise `webm`. `OggS` → `ogg`. `fLaC` → `flac`. `RIFF` and `WAVE` at 8 → `wav`. `ID3` → `mp3`. First 12 bits set: layer bits zero → `aac`, otherwise `mp3`. Anything else → `unsupported_audio`.
5. **Errors never carry provider text.** Log only the SPEC's `[audio]` line. No body, no file name, no turn text.
6. **A non-multipart or malformed body is `400 file_required`**, not the bare 500 that `/chat` gives for bad JSON. Check `Content-Length` before parsing where it is present, and the real size after.
7. **Capacity:** queued + running must stay at or under `AUDIO_MAX_CONCURRENT`; finished jobs do not count. Audio bytes are dropped the moment a job ends, in success or failure.
8. **Stub text** is fixed synthetic Thai you write yourself, about a pretend delivery. Two speakers, four turns. The `stub` setting makes the process exit non-zero at start when `NODE_ENV=production`.
9. **`.env.example`:** every key in SPEC § Env, one line saying what it is for.

**You may decide alone** (one line each in your notes): internal names, file split, job id generator (must be unguessable, such as `crypto.randomUUID()`), and how the TTL sweep runs.

## Definition of Done

Write `ai-worker/tests/harness/audio-contract.sh <port>`. It generates fixtures with `ffmpeg` in a `mktemp -d` folder, calls the running server with `curl`, and prints one `PASS <case>` or `FAIL <case>` per line, ending `SUMMARY pass=<n> fail=<m>`. It checks status codes and bodies, not just that a reply came.

Base results I ran on 790f63a (2026-11-06, Bun 1.4.2, no provider): `GET /audio/jobs/x` → `404`; `GET /` → `200`; `bun build` → exit 0, `index.js 69.83 KB`. `tsc` is **not** installed, so it is not a check here. `lsof` is missing too: stop your server with `fuser -k <port>/tcp`, not by process name.

- [ ] Builds. `bun build src/index.ts --outdir "$(mktemp -d)" --target bun` → exit 0.
- [ ] Stub path. `AUTH_ENABLED=false AUDIO_TRANSCRIBE_PROVIDER=stub AUDIO_SUMMARY_PROVIDER=stub AUDIO_STUB_DELAY_MS=500 PORT=3941 bun run start`, then `bash ai-worker/tests/harness/audio-contract.sh 3941` → `fail=0`, covering at least:
  - `file_required` for no part and for a JSON body · `unsupported_audio` for a 0-byte file and for text renamed `.mp3`
  - `video_not_allowed` for a generated MP4 with video and for a generated WebM with video
  - `202` for generated m4a, aac, mp3, wav, ogg, webm and flac, each reaching `done`
  - `queued` or `running`, then `done`, with `speaker`, `turns`, `speaker_count`, `no_speech`, `provider`, `model`, `latency_ms` in that exact casing
  - `turns_required` for empty, for bad JSON and for a turn with no `speaker` · `body_too_large` over 5 MiB · a summary reaching `done` with `summary`
  - `job_not_found` for an unknown id
- [ ] Size. Same server: a 101 MiB file → `413 file_too_large`; a 129 MiB file → `413` with an empty body.
- [ ] Failure modes. Restart per `AUDIO_STUB_MODE` and show the job result: `fail` → `provider_failed`, retryable true · `truncated` → `output_truncated`, retryable false, **no `result`** · `no_speech` → `done`, `no_speech: true`, `turns: []` · `summary_fail` → transcription `done`, summary `provider_failed`.
- [ ] Timeout. `AUDIO_JOB_TIMEOUT_MS=200 AUDIO_STUB_DELAY_MS=2000` → `provider_timeout`, and the stub honours the abort.
- [ ] Capacity. `AUDIO_MAX_CONCURRENT=1 AUDIO_STUB_DELAY_MS=3000`: a second POST during the first → `429 busy`; after the first ends, a POST → `202`.
- [ ] TTL. `AUDIO_JOB_TTL_MS=1000`: 2 s after `done`, a GET → `404 job_not_found`.
- [ ] Not configured. No provider env → both POSTs `503 audio_not_configured`.
- [ ] Production guard. `NODE_ENV=production AUDIO_TRANSCRIBE_PROVIDER=stub PORT=3942 bun run start` → exits non-zero. Paste the exit code.
- [ ] Auth. With a git-ignored local `api-keys.json` of two throwaway keys for two projects, no `AUTH_ENABLED` set: no header → `401 unauthorized`; a job created with key A, read with key B → `404 job_not_found`, with key A → `200`.
- [ ] Log. Grep the server's output after the stub run for a stub Thai word → no match. Paste one `[audio]` line.
- [ ] Existing routes unmoved. `GET /`, `/models`, `/tiers` → same bodies as a scratch copy of 790f63a, shown with `diff`.
- [ ] Only listed files changed. `git status --porcelain` in the repo → only the closed list. Reading git state is allowed.

## Implementation Notes
**Bob, 2026-11-06.** Base 790f63a, tree was clean before my first edit. `bun install --frozen-lockfile` was run once (creates the git-ignored `node_modules`; no lockfile change).

**Files changed in `develyst-ai`** (`git status --porcelain` at the end: only these):
`src/index.ts` (import, `app.use("/audio/*", authMiddleware)`, `app.route("/audio", audio)`; `GET /` untouched) · new `src/routes/audio.ts` · new `src/audio/{types,config,bytes,normalise,jobs,registry,stub}.ts` · `.env.example` · `CLAUDE.md` (key-files and env tables only) · `docs/consumer-guide.md` (new § 6b) · new `bruno/POST Audio Transcription.bru`, `POST Audio Summary.bru`, `GET Audio Job.bru`.
Harness, on the desk: `tests/harness/audio-contract.sh` (suites), `audio-run-all.sh <repo>` (starts the gateway per scenario, runs them, stops by port), `audio-stub-abort.ts`.

**Evidence** (run `bash tests/harness/audio-run-all.sh <repo>` from `call-scribe/ai-worker/`; synthetic ffmpeg tones only, no provider, no key, no network):
- Build: `bun build src/index.ts --outdir "$(mktemp -d)" --target bun` → exit 0, `index.js 83.1 KB` (was 69.83 KB).
- Stub, main suite (`AUTH_ENABLED=false` stub/stub `AUDIO_STUB_DELAY_MS=500`, port 3951): `SUMMARY pass=69 fail=0`. Covers file_required (no part, JSON body, text field), unsupported_audio (0 byte, text renamed .mp3), video_not_allowed (MP4 with H.264, WebM with VP8), 202 then `done` for m4a aac mp3 wav ogg webm flac **uploaded under a wrong file name**, exact key casing of job, result and turn, speakers `1,2,1,2`, turns_required ×6, body_too_large (5.4 MB), summary done, job_not_found, `101 MiB → 413 file_too_large`, `129 MiB → 413` with empty body.
- Modes (one restart each): `fail` → provider_failed, retryable true · `truncated` → output_truncated, retryable false, `data` has no `result` · `no_speech` → done, `no_speech:true`, `turns:[]`, `speaker_count:0` · `summary_fail` → transcription done, summary provider_failed. Each `SUMMARY fail=0`; job JSON printed by the script.
- Timeout (`AUDIO_JOB_TIMEOUT_MS=200`, delay 2000): `provider_timeout`, retryable true, ended in 246 ms. Stub honours the abort: `audio-stub-abort.ts` → `PASS transcribe: rejected with provider_timeout after 101 ms (delay was 5000)`, same for summarize.
- Capacity (`AUDIO_MAX_CONCURRENT=1`, delay 3000): second POST (and a summary POST) during the first → `429 busy`; after the first is `done` → `202`. 6 PASS.
- TTL (`AUDIO_JOB_TTL_MS=1000`): 2 s after done → `404 job_not_found`. 3 PASS.
- Not configured (no provider env): both POSTs `503 audio_not_configured`. 4 PASS.
- Production guard: `NODE_ENV=production AUDIO_TRANSCRIBE_PROVIDER=stub PORT=3942 bun run start` → `exit code: 1`, output `[audio] stub provider is not allowed when NODE_ENV=production — refusing to start.`; same with both set → 1.
- Auth (AUTH_ENABLED unset, git-ignored `api-keys.json` with two throwaway keys, removed after; `api-keys.json removed: yes`): no header 401 `unauthorized` · unknown key 401 · key B reads key A's job → `404 job_not_found` · key A → 200. 8 PASS.
- Log: grep of the main run's server log for the stub Thai words → no match (`PASS no stub Thai word in server log`). Sample line: `[audio] project=anonymous job=5246b434-3e89-4179-98e3-52da5ea3eb1a kind=transcription provider=stub bytes=18764 ms=500 status=done`.
- Existing routes unmoved: scratch `git archive 790f63a` copy vs my tree, `GET /`, `/models`, `/tiers` → byte counts 1451/496/354 on both, `diff` exit 0 each.
- Only listed files changed: `git status --porcelain` → `M .env.example`, `M CLAUDE.md`, `M docs/consumer-guide.md`, `M src/index.ts`, `??` the three .bru, `src/audio/`, `src/routes/audio.ts`.
- `/security-review` of my change (input handling and auth touched): no finding at confidence 8 or above. Ownership check returns the same 404 for another project's job; the job id is `crypto.randomUUID()`; the file name and declared type are never read; nothing user-supplied is logged.

**Decided alone:** job id = `crypto.randomUUID()` · TTL = one `setTimeout(...).unref()` per finished job (no sweep loop) · timeout rejects before it aborts, so an adapter's own abort error cannot overwrite `provider_timeout` · provider/capacity (503, 429) are checked **before** the upload is parsed, so a full gateway does not read another 100 MiB; capacity is checked again at insert, synchronously · merged turns of one speaker are joined with one space · `Content-Length` over `AUDIO_MAX_BYTES` + 1 MiB (multipart framing) → `file_too_large` before parsing, and the real part size is checked after · a summary that comes back empty becomes `provider_response_invalid` · registry (`src/audio/registry.ts`) returns null for `gemini`/`xai`, which TASK-102 replaces with adapters · config is read once at start.

**UNVERIFIED:** (1) behaviour behind the deployed gateway's proxy/body limit (SPEC risk, not testable here) · (2) memory at 2 × 100 MiB concurrent uploads — not measured; `formData()` buffers the whole body · (3) WebM video detection only for VP8 (generated); VP9, AV1, MPEG4 tags are in the code but untested · (4) `bun build` ran, `tsc` is not installed, so types are unchecked beyond what Bun accepts · (5) no timestamp/ordering effects of `setTimeout(0)` start were measured beyond the `queued` first status seen in every test.

## Questions
(Bob asks; Silver answers as `> answer: …`.)

1. Observability gap, not a contract change: a job that fails with a non-`AudioJobError` throw becomes `provider_failed` and the cause is not logged anywhere (the SPEC allows only the `[audio]` line, and `status=failed` carries no code). Operators will not be able to tell a bug from a provider fault. Do you want the error **class name** or the code added to the `[audio]` line (no message text)? I left it as specified.
   > answer: Yes to both, and you were right to leave it as specified. On a failed job, end the line with `code=<code> cause=<ClassName>`, where `cause` is `AudioJobError` or the thrown class's name, and never its message. SPEC-101 § Data Model is updated, and the file is granted in TASK-102. Silver, 2026-11-06.

## Review
**Verdict: DONE.** Silver, 2026-11-06. `DONE` means built and proven by the engineer, not tested; the test verdicts are the testers'. No real provider and no deployed system was touched.

Reviewed all of `src/routes/audio.ts` and `src/audio/*` against SPEC-101, then reran on a snapshot of the tree, not the tree Bob is editing:
- `audio-run-all.sh` at the DoD's settings: every suite `fail=0` (main `pass=69`), driver exit 0, both production-guard exits 1, `api-keys.json removed: yes`, no stub Thai word in the log. Matches his notes.
- **The harness catches breakage.** Three mutations each turned it red: `retryable` flipped, `latency_ms` renamed, the ownership check removed.
- My own probes beyond his suite: SPEC-102's normalised M4A → `202`, `done`, exact keys · exactly at the limit → reaches the byte check, limit + 1 → `413 file_too_large` · **VP9 WebM → `video_not_allowed`**, which closes part of his untested item (3) · multipart with no boundary, `file` as a text field, JSON `null`, a float `speaker`, a traversal-shaped id → the contract's codes, no server error · `.env.example` copied to `.env`: inline comments do not become values.
- Existing routes against a scratch 790f63a: `GET /`, `/models`, `/tiers` byte-identical; `/chat` with no messages `400` and multipart `500` on both. `git status` matches the closed list; no change under `src/providers`, `chat.ts`, `search.ts`, `types`, `config/models`; no `.env` or `api-keys.json` left in the tree.
- Security review of this change, read by hand against the checklist: no finding. Auth is on `/audio/*`, another project's job gets the same `404`, ids are `randomUUID`, nothing user-supplied reaches a file path or a command, nothing reaches disk, the log has no text or file name, the Bruno files hold no key. It was scoped to this change because the `/security-review` command's diff is the workspace repo's, and it ran inline, not with its sub-tasks, under the desk's no-subagent rule.

**Accepted as non-blocking, recorded so nobody re-raises them:**
- Bob's `UNVERIFIED` (2): capacity bounds jobs, not uploads being parsed. Several parallel uploads can each hold up to 100 MiB before the check at insert. The caller is one authenticated back that sends one job at a time. Memory at 2 × 100 MiB is still unmeasured.
- The video guard knows only the four WebM codec tags I listed, and has no Ogg video check. The back's normalise drops video first, so this is a second guard only. AV1 and MPEG4 tags remain unrun.
- Merged turns are joined with one space, so Thai may gain a space there. Cosmetic, and TASK-103 will show it.

**Carried into TASK-102 § Added at TASK-101 review:** the log's `code` and `cause`, `503` on a missing key, and narrowing the harness's port clean-up.
