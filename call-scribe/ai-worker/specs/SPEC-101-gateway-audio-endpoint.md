# SPEC-101: Gateway audio endpoint (transcript with speakers, and summary)
- Source: REQ-101
- Status: ACTIVE, contract v1 (2026-11-06, Silver). Carried to the app's SA by the PM 2026-11-06. TASKs cut: TASK-101, TASK-102, TASK-103.
- Holds: `develyst-ai` only (board § Batch claims, Team B). The app and its back are Team A's.
- Read: `develyst-ai` branch `atom`, HEAD 790f63a, 2026-11-06, tree clean: `CLAUDE.md`, `docs/consumer-guide.md`, `ecosystem.config.cjs`,
  `src/index.ts`, `src/routes/chat.ts`, `src/types/index.ts`, `src/auth/authMiddleware.ts`, `src/providers/*`, `src/config/models.ts`.

## Overview

Two new async operations on the gateway: turn an audio file into labelled turns, and turn labelled turns into a Thai summary.
The caller is `call-scribe-back`, never the phone. It sends a file, gets a job id, and polls. The gateway keeps jobs in
memory, writes no audio to disk, and has no database. Existing routes are not changed.

**Provider is not chosen yet.** No provider is proven for Thai with speakers, and no real call may run until Q9. So the
contract is provider-neutral, and the provider is an env setting. Nothing in this contract changes when it is chosen.

## API / Interface Design — the contract

**This is the seam with `call-scribe-back`. Field casing is exact.** It follows the repo's own style: snake_case, the
`{ success, data }` envelope, and `error` as a short code like the existing `"unauthorized"`.

All routes need `Authorization: Bearer <project-key>`, with the same `401 { "success": false, "error": "unauthorized" }` as
`/chat`. A job can be read only with the project key that created it.

### `POST /audio/transcriptions`

`multipart/form-data` with one part, `file`. The file name and declared type are ignored, because the gateway reads the
bytes (Bun replaced a declared `audio/mp4` with `audio/x-m4a` from the file name; ran 2026-11-06).

`202`:
```json
{ "success": true, "data": { "job_id": "3f0c1d9e-…", "status": "queued" } }
```

| Status | `error` | When |
|---|---|---|
| 400 | `file_required` | Not multipart, or no `file` part |
| 413 | `file_too_large` | Over `AUDIO_MAX_BYTES`, default 100 MiB |
| 413 | *(empty body)* | Over 128 MiB: Bun answers before any code runs (ran). **Treat every 413 as too large; do not parse the body** |
| 415 | `unsupported_audio` | 0 bytes, or the bytes are not a listed format |
| 415 | `video_not_allowed` | The container holds a video track |
| 429 | `busy` | `AUDIO_MAX_CONCURRENT` jobs already running or queued. Retry later |
| 503 | `audio_not_configured` | Provider setting or its key is missing |

Accepted by bytes: M4A/MP4 audio, AAC (ADTS), MP3, WAV, Ogg/Opus, WebM audio, FLAC. All are on both candidate providers' lists.
**AMR is not.** So the back must send one of these, and 60 minutes must fit in 100 MiB: AAC at 128 kbps is about 58 MB, but
16 kHz mono WAV is about 115 MB (arithmetic).

**The back strips video before calling (REQ AC-21, Team A).** `video_not_allowed` is the gateway's own guard, so a picture can
never reach a provider through a mistake on either side.

### `POST /audio/summaries`

`application/json`, at most 5 MiB:
```json
{ "turns": [ { "speaker": 1, "text": "…" }, { "speaker": 2, "text": "…" } ] }
```
`202`: the same shape as above. Errors: `400 turns_required` (bad JSON, missing, empty, or a turn without integer `speaker`
and non-empty string `text`) · `413 body_too_large` · `429 busy` · `503 audio_not_configured`.

### `GET /audio/jobs/:job_id`

Poll every 5 seconds.

```json
{ "success": true, "data": { "job_id": "…", "kind": "transcription", "status": "running" } }
```
- `kind`: `transcription` | `summary`. `status`: `queued` | `running` | `done` | `failed`.
- `done` adds `result`; `failed` adds `error`. A failed job is still HTTP `200`, since the lookup succeeded.
- `404 { "success": false, "error": "job_not_found" }`: unknown, expired, another project's, or **lost in a gateway restart.
  Resubmit.** The caller keeps the audio, so nothing is lost.

**Transcription `result`:**
```json
{
  "provider": "xai",
  "model": "…",
  "no_speech": false,
  "speaker_count": 2,
  "turns": [ { "speaker": 1, "text": "…" }, { "speaker": 2, "text": "…" } ],
  "latency_ms": 41250
}
```
- `speaker` is an integer from 1, numbered by first appearance. Labels are arbitrary: the app shows `ผู้พูด {speaker}`. A number
  says nothing about who the person is (REQ Q2).
- No speech: `no_speech: true`, `speaker_count: 0`, `turns: []`, status `done`. It is a result, not a failure (AC-20).
- No timestamps: no REQ needs them (playback is out of scope). Adding them later does not break this.

**Summary `result`:**
```json
{ "provider": "gemini", "model": "…", "summary": "…", "latency_ms": 8200 }
```
`summary` is plain Thai text.

**`error` on a failed job:**
```json
{ "code": "provider_timeout", "retryable": true }
```

| `code` | `retryable` | Meaning |
|---|---|---|
| `provider_timeout` | true | Over `AUDIO_JOB_TIMEOUT_MS` |
| `provider_failed` | true | Provider 5xx, 429 or network error |
| `provider_response_invalid` | true | Unparseable or empty reply |
| `provider_rejected_audio` | false | Provider 4xx on this file, such as corrupt audio that passed the byte check |
| `output_truncated` | false | **The provider stopped at its output limit. A partial transcript or summary is never returned as `done`** |

Provider text never appears in a response or a log, since it may quote the call.

### How the back uses it

1. `POST /audio/transcriptions`, poll, store `turns`. If `no_speech`, stop and show the "no speech" message.
2. `POST /audio/summaries` with those turns, poll, store `summary`.
3. Failed step 1 → AC-7, retry from step 1 with the stored audio. Failed step 2 → AC-15, retry step 2 only with the stored turns.
4. If `retryable` is false, offer no retry (`[PM-decided]`). Wording for that, for `413` and for `429` is in REQ-101 § User-facing wording.

Base URL and key names on the back's side (`LLM_GATEWAY_URL`, `LLM_GATEWAY_KEY`) are Team A's to choose.

### Stub provider — so the app can be built before Q9

`AUDIO_TRANSCRIBE_PROVIDER=stub` and `AUDIO_SUMMARY_PROVIDER=stub` run every route above with no network call and no spend.
`AUDIO_STUB_MODE` picks the outcome: `ok` (default, fixed synthetic Thai turns) · `no_speech` · `fail` (`provider_failed`) ·
`truncated` (`output_truncated`) · `summary_fail` (transcription `ok`, summary `provider_failed`). `AUDIO_STUB_DELAY_MS` sets the
time spent `running`, default 2000. **The gateway refuses to start with `stub` when `NODE_ENV=production`**, which
`ecosystem.config.cjs` sets. This gives the testers a way to force AC-7, AC-15 and AC-20 on their own environment.

## Data Model

None. No database, no SQL. A job lives in one in-memory `Map`: audio bytes only until the job ends, then the result only, removed
`AUDIO_JOB_TTL_MS` after it ends. No audio or transcript is written to disk or to a log. The log line is
`[audio] project=<p> job=<id> kind=<k> provider=<x> bytes=<n> ms=<n> status=<s>`, and on a failed job also `code=<code> cause=<ClassName>`: a class name, never a message (added 2026-11-06 on Bob's question, TASK-101).

## Env (added to `.env.example`, one line each)

| Key | Default | For |
|---|---|---|
| `AUDIO_TRANSCRIBE_PROVIDER` | none, so `503` | `gemini` · `xai` · `stub` |
| `AUDIO_TRANSCRIBE_MODEL` | provider's | Model id, where the provider has a choice |
| `AUDIO_SUMMARY_PROVIDER` | none, so `503` | `gemini` · `xai` · `stub`. Pinned: no fallback chain, so a call goes to one named provider |
| `AUDIO_SUMMARY_MODEL` | provider's | Model id |
| `AUDIO_MAX_BYTES` | 104857600 | Upload limit. Keep at or under 128 MiB |
| `AUDIO_MAX_CONCURRENT` | 2 | Jobs held at once, which bounds memory |
| `AUDIO_JOB_TIMEOUT_MS` | 1800000 | Per job |
| `AUDIO_JOB_TTL_MS` | 3600000 | How long a finished result stays readable |
| `AUDIO_STUB_MODE`, `AUDIO_STUB_DELAY_MS` | `ok`, 2000 | Stub only |

`GEMINI_API_KEY` and `XAI_API_KEY` already exist.

## Flow

```
back --POST file--> gateway: auth → size → byte check → video check → job queued → 202
                    job: provider adapter → normalise to turns → done | failed (audio dropped either way)
back --GET job--> status … result
back --POST turns--> gateway: summary job → done | failed
```

## Design choices `[SA-decided]`

**Async jobs, chosen over the two others:**
- *Rejected: one long synchronous request.* Simplest, and the 70 s run stayed open on Bun 1.4.2 here. But a 60-minute call may take
  minutes, and any proxy in front can cut it: the workspace's server template sets a body limit (`server-platform/readyidc/new-app:139`,
  `client_max_body_size 20m`), and Bun's docs state a 10 s idle close that I could not reproduce. Which limits the deployed gateway
  has is unknown. A short POST plus polling depends on none of them for time, only for upload size.
- *Rejected: the back cuts the call into chunks.* Each chunk would label its speakers on its own, so "ผู้พูด 1" could swap between
  chunks and AC-4 would fail with nothing able to detect it (inferred from how labels are assigned).

**In-memory jobs, not a database.** The gateway has none and is otherwise stateless, and a lost job costs one resubmit. It relies
on one process: `ecosystem.config.cjs` sets no cluster mode. Running it clustered would break job lookup.

**A new summary route, not `/chat`.** `/chat` hides truncation (`AIResponse` has no finish reason; ran with a stub) and returns only
Gemini's `parts[0]`. Fixing that would change `/chat`'s shape for other apps, and AC-11 forbids it. So the audio routes use their own
adapter call, and `src/providers/*` stay untouched.

**`GET /` is not changed**, so AC-11's baseline stays exact. New routes are documented in `docs/consumer-guide.md` and `bruno/`.

**Prompt safety.** Call text is data, not instructions: the summary prompt must fence it and say so, since a speaker could say
anything. The summary must name only what the turns contain (AC-5).

## Non-functional

60-minute recording end to end (AC-19) · at most `AUDIO_MAX_CONCURRENT` × 100 MiB of audio in memory · Thai with some English
terms (REQ Q6). Nothing else is required.

## REQ coverage

| AC | Here |
|---|---|
| AC-3, AC-4, AC-5, AC-19 | The routes and adapters. Quality is unproven until TASK-103 |
| AC-7, AC-15 | Failed job codes; separate steps; stub modes. The message and retry are Team A's |
| AC-20 | `no_speech` |
| AC-21 | `video_not_allowed` as a guard. Stripping is Team A's |
| AC-11 | Existing routes and `src/providers/*` untouched. Baseline needed **before** the first edit |
| AC-12 | No audio stored; synthetic test audio only, outside the product repo |
| AC-6 | Partly: the byte check. The list and messages are Team A's |
| AC-1, 2, 8, 9, 10, 13, 14, 16, 17, 18 | No gateway work: the app, the back, or the owner |

## Tasks

- TASK-101: `/audio/*` routes, byte and video checks, job store, stub provider, env, docs, Bruno — owner: BE (depends on: none; the AC-11 baseline comes from commit 790f63a, so it needs no frozen tree)
- TASK-102: Gemini and xAI adapters, built against their docs and a stubbed fetch — owner: BE (depends on: TASK-101). Real behaviour `UNVERIFIED` until TASK-103
- TASK-103: Provider check on synthetic Thai two-voice audio: clean, leak and 60-minute variants; settles the provider — owner: BE (depends on: TASK-102, **Q9**, test audio)

No FE task: `develyst-ai` has no UI.

## Risks, assumptions, unknowns

| Item | Status | What settles it |
|---|---|---|
| Thai with speakers on Gemini or xAI | Unproven. xAI's docs do not name Thai; Gemini's list no languages | TASK-103 |
| Gemini's output cap on a 60-minute call | Limit 65,536 tokens (model page); forum reports conflict on whether thinking counts. A long Thai transcript in JSON may reach it (inferred). Then `output_truncated` | TASK-103 `long` variant |
| Turning xAI's per-word speakers into Thai text | Spacing rules unknown until a real response | TASK-103. The adapter handles it, not the contract |
| Gemini speakers come from a prompt and may invent or merge | Inferred | TASK-103, AC-4 |
| Deployed gateway: live commit, `AUTH_ENABLED`, body limit | Unknown. Deploying `atom` could return 401 to other apps (REQ Q10) | The owner, before any deploy. **The body limit is new here: if the 20 MB template applies, uploads fail until raised** |
| Provider data terms for call content | Not checked | The owner's choice with the provider, REQ Q10 |
| Back must send ≤ 100 MiB in a listed format | Assumption on Team A; needs ffmpeg or equal | The app's SPEC |

**Verified for this SPEC (ran 2026-11-06, Bun 1.4.2, scratch copy, no provider, no deployed system):** multipart 100 and 127 MiB
accepted, parsed in about 0.2 s, process at about 400 MB; 129 and 200 MiB returned `413` with an empty body · searching for the
`hdlr` box's `vide` type found the track in a generated MP4 with video and none in the stripped M4A (10 MB in 30 ms). Not run:
WebM video detection and every adapter.

## Questions

Anything from the app's SA comes through the PM.

**Q9, for the PM to raise now (TASK-102 is `DONE`, 2026-11-06). BLOCKS TASK-103 and every real AI result.** Silver.
Checked: REQ-101 Q9 (held "until the first TASK needs env"), `DECISIONS.md` line 25, TEST-102 Q1: the keys and limit were not given, and the voices are refused at the session's permission.

- **Ask 1, only the owner: `GEMINI_API_KEY`, `XAI_API_KEY`, and a spend limit.** They go in `develyst-ai`'s git-ignored `.env`, on a local copy only. A limit of **US$1** is my suggestion.
- **Size, for one full pass:** per provider, three 2-minute clips and one 60-minute file, about 66 minutes, plus one summary per clip. xAI: about 11 US cents at $0.10/h (arithmetic from its page), plus its summary tokens. Gemini: about 127,000 audio tokens at 32 per second (arithmetic from its page), plus output; **not priced by me**, so the US$1 is not proven enough for Gemini. Bob stops at the limit and says so. Which cases run first: the three short clips, so a low limit still answers the main question.
- **Ask 2, a source of two Thai voices.** Local install is refused at the session's permission, and I told Bob not to try it. My recommendation: **generate them through the providers' own text-to-speech APIs, with the same keys, inside the same limit.** Nothing is installed, the audio is synthetic, and it stays in a temp folder. Gemini has a TTS model on its model list, and xAI's page lists a TTS API at $15 per million characters. **Whether either has distinct Thai voices is `NOT VERIFIED`**, and whether this suits the owner's "tool outside the product repos" ruling is the PM's to judge. If both fail, the fallback is the owner recording the script with someone. It would serve Team A's tester too, so one answer could cover both.
  > answer: `[PM-decided 2026-11-06]` Raised with the owner: 2 keys and a US$1 limit, pending his word. Do not unblock TASK-103 until I confirm.
  > **Gemini priced by the PM** (Google's pricing page, read 2026-11-06; arithmetic, nothing run; rates double on 2027-01-01): `gemini-3.8-flash` at $0.75 per 1M input and $3.75 per 1M output. 127,000 audio tokens is about 10 US cents; a 60-minute transcript at the 65,536-token cap is about 25 cents; short clips and summaries add a few cents. With xAI's 11 cents plus its summaries, one full pass is about 50 to 60 cents, so US$1 looks enough. The limit is Bob stopping by the figures he reads; I have not checked that either provider enforces one.
  > **Voices:** provider TTS accepted in principle, since it installs nothing, makes synthetic audio and stays outside the repos. The owner sees that it replaces the refused install. Google's speech page, read 2026-11-06, lists Thai on `gemini-3.8-flash-tts` only (not Flash-Lite), 30 voices, up to 2 speakers; `NOT VERIFIED` by any run. List price $0.50 per 1M text, $9 per 1M audio; a few cents assumed, audio token rate not checked. xAI's TTS is not needed unless this fails. If it fails, stop and tell me.
  > **Before the keys land:** Bun loads `.env` by itself, so please confirm `audio-run-all.sh` and the other suites cannot reach a real provider once `develyst-ai/.env` holds real keys. Also say whether the generated voices can be kept outside the repos for Tanya, so they are paid for once. Porter.
  > answer: Silver, 2026-11-06. Ran on a scratch copy with fake keys and a `fetch` that records and refuses every outbound call (`tests/harness/refuse-fetch.ts`). No real key, no provider reached.
  > **Keys alone in `.env` are safe.** `audio-run-all.sh`: 10 suites `fail=0`, 0 outbound. `audio-adapters.sh`: `pass=273 fail=0`, 0 outbound. So the keys may land now, as long as they are the only new lines.
  > **A provider named in `.env` is not safe.** `AUDIO_*_PROVIDER=gemini` in `.env` sent the `notconfigured` suite to Google (2 attempts, refused by the probe). Rule: **`.env` holds the keys only**; TASK-103 names the provider per run. TASK-112 makes the driver refuse to start otherwise (guard proven on the copy, not yet in the desk's script).
  > **The other suite:** `local-gateway-regression.mjs` runs on a `git archive` copy, deletes `.env` and passes a clean env (lines 36, 43, 139-141). That is from reading, not run with keys in place. No other harness script names the repo (grep).
  > **Limit of this answer:** a suite run by hand with a provider on the command line does call it, and nothing stops that.
  > **Voices:** yes, they can be kept. Recommended: the 2-minute clips, script and topic list, in a folder outside every repo **and outside this workspace** (Atom commits the workspace on `atom`), under a new logical name in `machine.local.md`, e.g. `call-scribe-test-voices`. The 60-minute file is not kept, since ffmpeg rebuilds it. **Yours to rule, and the path is yours to add.** It departs from TASK-103's "removed", and Tanya's access goes through you. Default if you say nothing: temp folder, removed, and she pays again.
  > **PM 2026-11-07 03:50, the owner's new limits, verbatim in `DECISIONS.md`; still NO live call until I tell you he has given his word in my pane.** (1) **Ceiling US$0.50, not US$1.** (2) **"โมเดลเล็กๆ": small models.** Model choice is yours; `src/config/models.ts` has a small tier. Google's page lists Thai TTS on `gemini-3.8-flash-tts` only, not Flash-Lite, so tell me if a voice or transcription step has no small model that can do the job, rather than quietly using a bigger one. (3) **No DeepSeek at all.** Please check no path can reach it, including `DEFAULT_PROVIDER` and any fallback chain, and show that on a stand-in. **Re-size the run to US$0.50 and answer here:** which clips, which models, whether `long` still fits. My reading: it probably does not, so AC-19's real-provider part would stay `NOT_TESTED`; say so if right. A result from a small model proves that model only. Porter.
  > answer: Silver, 2026-11-07. **DeepSeek: shown unreachable from the audio routes, on a stand-in. US$0.50: fits, with `long` on one provider, not both.** Your reading is half right. No real call made.
  >
  > **DeepSeek.** Scratch clone at 6711807, fake `.env` with the 17 names and `DEFAULT_PROVIDER=deepseek`, every outbound call recorded and refused, so each provider call fails, which is what would trigger any fallback:
  >
  > | Asked for | `POST`s | Hosts tried | DeepSeek attempts |
  > |---|---|---|---|
  > | `gemini`, transcription and summary | 202, both jobs `provider_failed` | `generativelanguage.googleapis.com` only | 0 |
  > | `xai`, transcription and summary | 202, both jobs `provider_failed` | `api.x.ai` only | 0 |
  > | `deepseek` as the provider | 503, 503 | none | 0 |
  > | **Control: `POST /chat`** | 500 | **deepseek, openai, xai, gemini: all four** | **1** |
  >
  > So **`/audio/*` has no fallback and does not read `DEFAULT_PROVIDER`; `/chat` does fall through to DeepSeek.** Nothing here should call `/chat`: `call-scribe-back` calls only `/audio/*` and the front names no gateway route (grep, by reading; Sober owns those). TEST-101's harness does call `/chat`, on its stub with dummy keys and a clean env. **Not touched:** `/chat`'s chain and the real `DEEPSEEK_API_KEY`; other apps use that gateway. To make it "cannot" for TASK-103 and not only "does not", Bob adds a host allow-list to the live gateway process (TASK-103 § Review, "Re-size").
  >
  > **Models. Two steps have no small model; I am telling you rather than using a bigger one quietly.**
  >
  > | Step | Model | Why | Rates read 2026-11-07 |
  > |---|---|---|---|
  > | Voices | `gemini-3.8-flash-tts` | **Not small.** The only one Google's page lists with Thai; Flash-Lite TTS has none | $0.50 text, $9 audio, 25 tokens/s |
  > | Gemini transcript, summary | `gemini-3.5-flash-lite` | Gateway's small tier | $0.30 in, audio included; $2.50 out |
  > | xAI transcript | `stt` | **No choice of model:** one speech-to-text price | $0.10/h |
  > | xAI summary | `grok-4.3` | Gateway's small tier | $1.25 in, $2.50 out |
  >
  > **Risk:** Google's audio page shows speaker labels only with `gemini-3.8-flash`. Its pricing page lists audio input for Flash-Lite, but nothing says Flash-Lite labels speakers. If it cannot, Bob stops and I ask you; he does not move up on his own.
  >
  > **Size, by arithmetic; nothing has been billed. Output length is my assumption (about 4,000 tokens for a 2-minute clip), and Google bills thinking tokens as output, an amount I do not know.**
  >
  > | Run | Estimate |
  > |---|---|
  > | Voices, once, kept | 2.8 US cents |
  > | Gemini: `clean`, `leak`, `reference`, one summary | about 3.7 cents |
  > | xAI: the same | about 1.4 cents |
  > | **All short runs** | **about 8 cents; 15 if output runs about 3 times my assumption** |
  > | `long`, xAI: 60 minutes of speech-to-text plus a summary of the whole transcript | about 15 cents |
  > | `long`, Gemini: audio plus output at the 65,536-token cap, plus a summary | about 21 cents |
  >
  > One `long`: about 23 to 36 cents, under 50. Both: about 44 to 51 cents, too close given these are estimates and I have seen no limit on the provider's side.
  >
  > **Decision pack, with my defaults. `Checked:` `DECISIONS.md` 2026-11-07 03:49 lines, and SPEC-101 Q9: neither says which provider gets `long`. Correct only the line that is wrong:**
  > - Short runs on both providers: yes.
  > - One `long` only, on whichever provider did better on the short runs, and only if the ledger is at or under 25 cents before it starts. Otherwise `long` is skipped.
  > - AC-19's real-provider part: at best tested for that one small model. The other provider stays `NOT_TESTED`, and with no `long` run, all of it does.
  > - A pause or a lost `long` is not rerun.
  > - The hour on a box that pauses is still the exposed part. Leaving `long` out entirely remains the owner's option, and Sober's advice stands.
  >
  > Results prove the model that ran. If he later picks a bigger model, it needs its own run; xAI's transcript does not, since there is only one.
  > answer: `[PM-decided 2026-11-07]` All 5 defaults stand. `gemini-3.8-flash-tts` for voices and `stt` for xAI are accepted as the only ones that can do the job, and shown to the owner. If Flash-Lite cannot label speakers, Bob stops and it comes to me. The host allow-list is good. Still no live call until I tell you he has given his word in my pane. Porter.
  > **PM 2026-11-07 02:15, for TASK-103's design:** the box pauses from outside, with no warning (`SYSTEM-FACTS.md`; Atom's diagnosis). Atom's advice: keep live calls short and re-check after any gap. Please make prep hold to that: short clips first, spend recorded after each call, a pause check (wall clock against uptime) after each, no automatic retry after a pause, and the `long` variant only after the short ones and only if it fits. The US$1 is still not approved. Porter.
  > answer: Silver, 2026-11-07 02:20. All five are now in TASK-103 prep (§ Review, "Added 02:20"), and Bob builds them with test proof. One addition to yours: spend is recorded **before** each call too, since a request cut mid-way by a pause may still be billed. Any restart after a pause is my decision, not automatic.
  > **Measured here:** wall clock minus `/proc/uptime` held within ±0.006 s over 20 s, so a 2-second threshold has wide margin against a 278 s pause.
  > **What this does not do:** it does not stop a pause; it stops further spending after one. It sees a pause only once the box's clock has caught up, which it did on the one event we can check. A call under way when the box pauses may be billed with nothing to show for it. The ledger stays an estimate, and I have seen no provider-side limit, so US$1 remains our own arithmetic.
  > **My read, for the owner's decision, not a recommendation to start:** the short runs are low risk (a few cents each, by arithmetic). `long` is the exposed one, with up to an hour per provider on a box that has paused for 280 s. If he wants less exposure, `long` can be left out and AC-19's risk stays open. Sober's advice not to start until he has seen the freezes is on your record; I do not contradict it.
  > **PM 2026-11-07, keys arrived; TASK-103 prep only, NO live provider call yet** (`DECISIONS.md`, 2026-11-07 lines; the US$1 yes awaits his confirmation, and I tell you). **`develyst-ai/.env` is more than the two keys you ruled safe:** 17 names, by name only: `XAI_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, `TAVILY_API_KEY`, `PORT`, `AUTH_ENABLED`, `DEFAULT_PROVIDER`, `DEFAULT_TEMPERATURE`, `DEFAULT_MAX_TOKENS`, `DEFAULT_TIMEOUT`, `WEB_SEARCH_ENABLED`, `AI_DATETIME_TZ`, `AUDIO_MAX_BYTES`, `AUDIO_MAX_CONCURRENT`, `AUDIO_JOB_TIMEOUT_MS`, `AUDIO_JOB_TTL_MS`. No `AUDIO_*_PROVIDER`. Your proof covered keys alone, so **nothing runs from that tree with this `.env` until you re-prove, on a scratch copy with the same names and fake values, that the driver, the adapters and TEST-101's harness make 0 outbound calls.** Do not edit or copy the owner's real file, and print no value. Answer here. Porter.
  > answer: Silver, 2026-11-07. **Re-proven: the three suites make 0 real outbound calls with these 17 names, on fake values.** Fresh `git clone` of `develyst-ai` at 6711807, into a scratch folder, so the real `.env` was not copied; fake `.env` with the same 17 names; every outbound `fetch` recorded and refused. All copies removed; repo `git status` empty, real `.env` untouched (time still 01:37).
  >
  > | `.env` shape | Driver | Adapters | TEST-101 harness |
  > |---|---|---|---|
  > | `AUTH_ENABLED=true`, LF | 10 suites `fail=0`, outbound 0 | 273/0, outbound 0 | 61 cases, 33 to its stub, 0 to an unexpected host |
  > | `AUTH_ENABLED=true`, mixed CRLF as in the real file | 10 suites `fail=0`, outbound 0 | 273/0, outbound 0 | 33 to its stub, 0 to an unexpected host |
  > | `AUTH_ENABLED=false`, LF | outbound 0, but **auth suite fails** (6 lines), because `.env`'s value wins when the suite leaves it unset | 273/0, outbound 0 | not rerun: its clean env does not read `.env` |
  >
  > **The probe can fire:** same fake `.env` with `AUDIO_*_PROVIDER=gemini` on the command line: `POST` 202, 1 attempt to `generativelanguage.googleapis.com`, refused. So 0 means 0, and it also shows how little stands between this tree and a real call.
  > **Coverage:** every network call in `src` is `fetch` (grep: no `node:http`, sockets or subprocess), so the refusal covers them. The `.env` has no `AUDIO_*_PROVIDER`, so the driver's guard does not refuse it. The TEST-101 harness builds its copy without ignored files and passes a clean env.
  > **How the real file compares, names and same/differs only, no value printed, nothing copied:** `AUTH_ENABLED` and `DEFAULT_PROVIDER` differ from `.env.example`; the other non-secret names are the same, except `DEFAULT_MAX_TOKENS`, which my filter skipped (it matches "TOKEN"). 18 of its 24 lines end in CRLF; Bun strips that (ran on a fake). I do not know the two differing values and did not read them, which is why `AUTH_ENABLED` ran both ways. `DEFAULT_PROVIDER` ran only as `gemini`; only `src/config/models.ts:13` reads it, as the `/chat` default, and the `/audio/*` routes are pinned to their own settings. That part is from reading.
  > **Consequence:** suites may run from the real tree. If the driver's auth suite fails there, read that as `AUTH_ENABLED` being off in `.env`, not a defect; nothing leaves the box. **Not proven:** the real file itself was never run, by your rule. TASK-103 prep will not need it.
  > **Limit, unchanged:** naming a provider on a command line from that tree now spends real money, and only the TASK's text stops it. So until you confirm, Bob's prep runs on a scratch copy with fake keys, not from the real tree (TASK-103 § Prep). Tell me when the owner's yes is confirmed in his own session.
  > answer: `[PM-decided 2026-11-06]` Keep them, so they are paid for once. The 2-minute clips, script and topic list go in the folder with the logical name `call-scribe-test-voices` in `machine.local.md`, outside every repo and this workspace. The 60-minute file is not kept. Synthetic voices only, never a real recording. Tell me when they exist; I carry it to Tanya, who lists them in `tests/AUDIO-SOURCES.md` before use. The owner is told `.env` takes the two key lines only. The git and reset questions are with him. Porter.

**From SPEC-102 § Questions Q3, carried by the PM 2026-11-06.** Answered by Silver, 2026-11-06, for the PM to carry back. Read: SPEC-102 contract v1, TASK-106. Ran with synthetic audio, no provider, no deployed system.

**The seam and intake fit this contract, with one defect and one risk to fix on Team A's side:**

1. **Must fix in TASK-106's last check: as written it gets `401` on every call.** It sets no `AUTH_ENABLED`, auth is on when that is unset, and with no `api-keys.json` every key is refused. Ran: `401 unauthorized` with no key and with a Bearer key (on `/chat`, since `/audio` is not built; `/audio/*` takes the same middleware by contract). **Add `AUTH_ENABLED=false` to that command's process env.**
2. **Suggested, Sober's call: one network blip should not fail a job that is still running.** TASK-106 maps a network error or 5xx to `gateway_unreachable`. If that includes polling, a brief drop during a long call ends a job the gateway is still doing, and the retry pays for transcription again. Suggest failing only on the POST, and keeping polling through errors until the 35-minute limit.

**Checked and fine:**
- Exact shape: the § Intake normalise command, on a video and on speech → `aac,audio,16000,1`. Our `ftyp` check passes it and the `vide` search finds no video, while the source MP4 is refused. Speech at 38.7 kbps measured on a 10 s clip, so 60 minutes is about 17 MB (arithmetic). Under `GATEWAY_MAX_BYTES`.
- Paths, multipart part `file`, `turns` sent back unchanged, every `413` not parsed, job `404` resubmitted, poll 5 s, 35 minutes over our 30, `retryable: false` offers no retry, no call when no speech. A `429` as `busy` with no automatic retry is safe.
- Summary job `404` resubmits the summary only, which is free of re-transcription.

**(a) Yes, and it should be the main shape.** It is what will reach the gateway in real use, so TASK-103 now runs every variant through that command. It adds one 128 kbps reference clip per provider, to show whether 40 kbps costs words. That settles the risk in SPEC-102 § Risks.

**(b) Agreed, as a margin only.** About 17 MB fits under 20 MB. Whether that template limit applies to the deployed gateway is unknown: the template is the Linux platform's, and `ecosystem.config.cjs` has a Windows path. It stays with REQ Q10.

**(c) No port clash, but do not run from the live tree: Bob edits it, it may hold his `.env` and `api-keys.json`, and Bun loads `.env` by itself.** Run from a snapshot instead. Ran this on the tree: snapshot and install exit 0, no secret files in it, and the tree unchanged afterwards:
```
D=$(mktemp -d); tar -C <develyst-ai path> --exclude=.git --exclude=node_modules --exclude=.env --exclude=api-keys.json -cf - . | tar -C "$D" -xf -
cd "$D" && bun install --frozen-lockfile
AUTH_ENABLED=false PORT=3109 AUDIO_TRANSCRIBE_PROVIDER=stub AUDIO_SUMMARY_PROVIDER=stub AUDIO_STUB_MODE=ok bun run start
```
**When TASK-101 is `DONE`:** no date. It has not started, because Bob's session is not open. I tell the PM the moment it is reviewed.

**Known limit, for the PM on AC-18 (no contract change):** the gateway has no cancel. If he deletes a recording while its job runs, the audio stays in gateway memory until the job ends, and the result up to `AUDIO_JOB_TTL_MS` (1 hour) after that. It is in memory only, never stored, and gone on restart. I read AC-18's "from storage" as not covering this `[SA-decided]`. If that is wrong, a `DELETE /audio/jobs/:job_id` is a small addition.
  > answer: `[PM-decided 2026-11-06]` Your reading holds: AC-18 means the app and stored data. Memory for up to an hour, never stored, is accepted; no cancel route. Recorded under AC-18. Rest carried to Sober. Porter.

**`รวมโค้ด` on `develyst-ai`, held by the PM 2026-11-07: what the repo says about how `develop` deploys.** Silver, 2026-11-07. Read only: fetched `origin`, nothing written. Local `atom` = `origin/atom` = 6711807, tree clean.

- **Nothing in the repo deploys from `develop`.** No CI or deploy file on `atom`, `develop`, `main`, `sit`, `production` or `D1` (file names checked per branch; only `ecosystem.config.cjs`, a pm2 config, on four of them, not `main` or `sit`). The README's "Test and Deploy" section is GitLab's template text.
- **The one deploy described is by hand, from `production`:** `build.bat` sets `BRANCH=production`, then fetches, hard-resets to `origin/production`, and restarts pm2. Its `ecosystem.config.cjs` points at a `C:\Develyst\…` path, which matches `SERVER-FACTS.md:57` (`ai.develyst.online`, port 3009). Nothing in the repo says who runs it, or when.
- **The script:** `merge-workflow.sh` touches only `develop` and the current branch, with no `curl`, `ssh`, `pm2` or tag. `SERVER-FACTS.md` names no webhook or auto-deploy for this app (grep, and the only scheduled task it names here is the SSL renewal).
- **What this does not show:** a repo cannot show a GitLab webhook, or a job on the server that pulls `develop`. **So: nothing found, not proven absent.** Atom's answer on hooks is still needed. I did not use the token against GitLab's API: it is listed for this repo's git, and no one asked. If you want that checked, say so.

**You should weigh this before releasing: `develop` would receive more than Team B's work.** `develop` (f9699aa) is behind `atom` by 7 commits, a clean fast-forward both ways, and only one is mine to speak for:

| Commit | Author | What |
|---|---|---|
| 6711807 | develyst | `/audio/*`, this desk |
| 790f63a | dev | AI model versions updated |
| 345a86e | nichaphon.s | `dist.zip` in `.gitignore` |
| ecdc86a | nichaphon.s | `AUTH_ENABLED` toggle |
| 8ca7f4a, fcfffb5 | dong | `/search`, `/search/classify`, Tavily |
| 452393e | dong | **Auth middleware and API keys** |

41 files change on `develop`. Those 6 were already on `D1` and `atom` when the branch was made (`SYSTEM-FACTS.md`), so this is not a surprise, but it is more than "call-scribe's code", and it brings bearer auth to `develop`. Nobody on this desk has reviewed those 6. `production` is untouched by this command; `release code` is not included.

**If you release it:** on your word with the owner's quote, `bash ./merge-workflow.sh` from the repo root, on a clean tree. The script runs bare `git push`, so I would supply the listed token through the environment for that run, stored nowhere. I report the hashes. No conflict is expected from the refs; only the run shows it.
  > answer: `[PM-decided 2026-11-07]` Still held. Both the GitLab question and the 6 commits nobody here reviewed, including auth, are put to the owner, with my recommendation to leave `develop` as it is for now, as the work is safe on `origin/atom`. Run only on my word with his quote. Porter.
