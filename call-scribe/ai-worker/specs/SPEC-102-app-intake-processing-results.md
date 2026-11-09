# SPEC-102: The app and its back — intake, processing, results
- Source: REQ-101
- Team: A
- Status: ACTIVE, contract v1 (2026-11-06, Sober). All its TASKs (104-111) `DONE` 2026-11-06. Stays open for Q11. REQ-101's `SPEC_DONE` also needs Team B's TASK-103.
- Holds: `call-scribe-back/*`, `call-scribe-front/*` (board § Batch claims). The gateway is SPEC-101, Team B's.
- This is the app's first SPEC. The rule files' "SPEC-101" for the front means this one (PM, inbox 2026-11-06).

## Overview

One phone web app, one back. The owner picks a file or records in the app. The file reaches the back in small pieces. The back
checks it can be decoded, reduces it to one small speech-audio file, and queues it. A worker in the back calls the gateway for
turns, then for a summary, and stores both in Postgres. The app reads the result whenever it is reopened.

Why this shape: every limit we found is at the seam. The platform's nginx allows 20 MB per request, the gateway takes audio only in
a fixed list up to 100 MiB, and the chosen capture route produces large videos on a phone.

## What I read and ran (evidence base)

- `call-scribe-back` branch `atom` HEAD 72295b5, `call-scribe-front` branch `atom` HEAD 82438f1, read 2026-11-06: README only.
- `develyst-ai` branch `atom` HEAD 790f63a, read 2026-11-06: `CLAUDE.md`, `package.json:16` (`hono` ^4.6.0).
- `SPEC-101` contract v1, `server-platform/readyidc/new-app:139` (`client_max_body_size 20m`), `deploy-ready-build` skill, `SERVER-FACTS.md` (grep: no record of ffmpeg on any server).

**Ran here 2026-11-06, ffmpeg 7.1.5, synthetic audio only** (validation command in § Intake):

| Input | Strict decode exit | max_volume |
|---|---|---|
| m4a, mp3, ogg, webm, flac, wav, mp4 with sound | 0 | -16.5 to -18.4 dB |
| 20 s of silence, m4a | 0 | **-91.0 dB** |
| text renamed `.mp3`, 0-byte `.m4a`, random bytes `.m4a`, truncated `.m4a` (no moov) | non-zero | — |
| mp3 with 20 KB of random bytes mid-file | **183** | — |
| mp4 with no audio | **234** | — |
| truncated mp3, webm, ogg | **0**, and they normalise (webm 9.66 s, ogg 8.99 s) | — |

- Normalise command on mp3, webm, wav, mp4: exit 0, `aac,audio,16000,1`. **60-minute tone: 17,376,853 bytes in 9.4 s.** A tone, not speech.
- AMR: `amrnb` and `amrwb` decoders exist; this ffmpeg has no AMR encoder, so **no AMR file was run.**
- Browser strip (`mediabunny` 1.65.2, MPL-2.0, headless Chrome 156 desktop): 613,419,447-byte 10-minute MP4 to 9,719,104-byte M4A in 586-751 ms, AAC copied, decodes clean. **JS heap peaked near 600 MB, with or without `maxCacheSize`.** Not run on any phone.

## Design choices `[SA-decided]` (rejected options kept on purpose)

**Back: Bun + Hono.** Same as the gateway, so one set of habits and the deploy template fits. Rejected: Elysia, allowed by the owner, with no gain here.

**Front: Next.js standalone, installable PWA, client-rendered screens.** The owner's proven deploy shape, Atlas's recommendation.
Rejected: Vite static, a little lighter, but off the owner's standard build. No offline mode and no service worker: no AC needs one.

**Video: strip in the browser, with the back as fallback.** Screen recordings are the chosen capture route and may be large (an 8 Mbps test file: 613 MB per 10 minutes). Rejected:
- *Back only:* one code path, but uploads every picture and all those bytes over mobile data.
- *Browser only:* no picture ever leaves the phone, but if a phone cannot do it, the capture route is dead.
The back's normalise step handles video anyway (`-vn`), so the fallback costs the back no extra code.

**Always normalise to AAC, 16 kHz mono, 40 kbps.** One path, any decodable input, covers AMR and oversized WAV, and 60 minutes fits under even a 20 MB gateway limit (17.4 MB measured on a tone). Rejected: pass through when the format is listed, which leaves two paths and big files. Bitrate is an env value, so TASK-103's finding can change it without code.

**Validate by strict decoding, not a format list.** The PM accepted format detection by decoding (capture-route § Decision 5). The table above shows it separates AC-6's cases and keeps cut-off recordings.

**Upload in 5 MiB pieces.** Under the 20 MB limit, and a dropped connection resends only what is missing. Rejected: one request, which fails on nginx and restarts from zero.

**Login: one password, in the app.** Testable locally (AC-17) and works in an installed app. Rejected: Cloudflare Access, which the platform offers for apps with no login: it needs an environment to test at all, and would have to cover the back's address too.

**Worker in the back's process, one job at a time.** One user, so no queue service. State is in Postgres, so a restart resumes.

## API / Interface Design — the front ↔ back contract

**Field casing is exact: camelCase.** The back converts the gateway's snake_case; the front never sees it.
Base URL: `NEXT_PUBLIC_API_BASE_URL`. Every request from the front uses `credentials: "include"`.
Success returns the resource. **Every error is `{ "error": { "code": "<code>" } }`**, plus any field listed below.
All `/api/*` routes except login need the session cookie, else `401 unauthorized`.
A POST with a body must be `Content-Type: application/json`, and PUT must be `application/octet-stream`, else `415 bad_content_type`.

### Auth

| Route | Request | Success | Errors |
|---|---|---|---|
| `POST /api/auth/login` | `{ "password": "…" }` | `204`, sets cookie | `401 invalid_password` · `429 too_many_attempts` (5 failures in 15 minutes) |
| `POST /api/auth/logout` | none | `204`, clears cookie | |
| `GET /api/auth/me` | none | `200 { "loggedIn": true }` | `401 unauthorized` |

Cookie: `cs_session`, `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`. CORS allows only `FRONT_ORIGIN`, with credentials.

`GET /health`, no auth: `200 { "ok": true }`.

### The recording object

```json
{
  "id": "uuid",
  "clientId": "uuid",
  "fileName": "call.m4a",
  "source": "file",
  "status": "summary_failed",
  "errorCode": "provider_failed",
  "retryable": true,
  "durationMs": 61000,
  "createdAt": "2026-11-06T09:00:00.000Z",
  "updatedAt": "2026-11-06T09:01:30.000Z",
  "turns": [ { "speaker": 1, "text": "…" } ],
  "summary": null
}
```
- `source`: `file` | `mic`. `status`: `uploading` | `queued` | `transcribing` | `summarizing` | `done` | `no_speech` | `transcription_failed` | `summary_failed`.
- `errorCode` is `null` unless a `*_failed` status. `durationMs` is `null` until intake finishes. `turns`, `summary` are `null` until they exist.
- `retryable`: `true` only on a `*_failed` status, per § Errors.
- The list omits `turns` and `summary`, and never includes `uploading` rows.

### Upload

| Route | Request | Success | Errors |
|---|---|---|---|
| `POST /api/recordings` | `{ "clientId": "uuid", "fileName": "…", "sizeBytes": 123, "source": "file" }` | `201` new, `200` when `clientId` exists: `{ "id", "status", "chunkSizeBytes": 5242880, "receivedChunks": [0, 1] }` | `400 invalid_request` · `413 file_too_large` (over `MAX_UPLOAD_BYTES`) · `415 unsupported_file` (`sizeBytes` is 0; nothing created) |
| `PUT /api/recordings/:id/chunks/:index` | raw bytes. Every piece is exactly `chunkSizeBytes`, except the last | `204`. Sending a piece again overwrites it | `400 bad_chunk` (index or length wrong) · `404 recording_not_found` · `409 not_uploading` |
| `POST /api/recordings/:id/complete` | `{}` | `202` the recording, `status: "queued"` or `"no_speech"`. Same result if called again | `409 chunks_missing`, with `"missing": [2, 5]` · `415 unsupported_file` · `413 file_too_large` · `404 recording_not_found`. **On 415 and 413 the row and all its files are already deleted** |

`complete` is synchronous and must answer within 30 seconds for a 60-minute audio file (normalising took 9.4 s).

**The limit (PM's ask, 2026-11-06; TEST-102 Q7) `[SA-decided]`: 4 GiB per file sent, `MAX_UPLOAD_BYTES`.** It counts what is sent, not what was picked: a stripped video sends only its audio, so a screen recording of any size passes if the strip works (60 minutes of audio at 128 kbps is about 58 MB, arithmetic). The limit only bites on the fallback. Real size per minute on his Oppo is unknown (REQ Q4 now asks). Over the limit: **File too large**, nothing kept. The tester can test the limit by setting a low `MAX_UPLOAD_BYTES`, without making a 4 GiB file. If a large video's strip fails on the phone and the fallback upload proves too slow on mobile data, that is the REQ's "native Android only if the upload path needs it" trigger, and it goes to the PM.

### Read, retry, delete

| Route | Success | Errors |
|---|---|---|
| `GET /api/recordings` | `200 { "recordings": [ … ] }`, newest first | |
| `GET /api/recordings/:id` | `200` the recording | `404 recording_not_found` |
| `POST /api/recordings/:id/retry`, body `{}` | `202` the recording, back to `queued` | `409 not_retryable` · `404 recording_not_found` |
| `DELETE /api/recordings/:id` | `204`; row and files gone. An in-flight gateway job's result is discarded | `404 recording_not_found` |

### Errors and what the app shows

Failed work is a **status**, not an HTTP error. The string is REQ-101 § User-facing wording, by its "Where / when" name.

| `status` | `errorCode` | `retryable` | App shows |
|---|---|---|---|
| `transcription_failed` | `provider_rejected_audio` | false | Provider refused this file |
| `transcription_failed` | `output_truncated` | false | Output cut off |
| `transcription_failed` | `busy` | true | Busy (gateway 429) |
| `transcription_failed` | `audio_missing` | false | Audio file gone from storage. Added 2026-11-06: Transcription failed would falsely say the audio is there |
| `transcription_failed` | anything else | true | Transcription failed |
| `summary_failed` | `output_truncated` | false | Summary output cut off. Transcript shows |
| `summary_failed` | `provider_rejected_audio` | false | Summary failed, transcript shows, no retry control. Added 2026-11-06 (TASK-106 Q1): SPEC-101 marks this code not retryable in any step. The gateway does not produce it for a summary (`develyst-ai` `src/audio/http.ts:25`, both summary calls pass `audio` false), so no string of its own |
| `summary_failed` | anything else | true | Summary failed. Transcript shows |
| `no_speech` | `null` | false | No speech |

Back's `errorCode` values, beyond the gateway's own five: `busy` (429) · `job_lost` (404 twice) · `gateway_unreachable` (network error or 5xx) · `gateway_rejected` (other 4xx, or 503 `audio_not_configured`) · `poll_timeout` · `audio_missing` (the row exists, its `audio.m4a` does not; no gateway call made) · `worker_crashed` (the back's own write failed during the job, added 2026-11-06, § Flow; retryable, by "anything else"). A gateway code outside SPEC-101's five would count as "anything else": `[SA-decided]` no column for the flag (TASK-106 Q2), since a sixth code is a SPEC-101 change.

### The seam with the gateway

SPEC-101 v1 as written, from the worker only: env `LLM_GATEWAY_URL`, `LLM_GATEWAY_KEY`. Treat every `413` as too large without parsing (SPEC-101): recorded as `gateway_rejected`, since normalising makes it unreachable. A job `404` resubmits once, then `job_lost`. Poll every 5 seconds, give up after 35 minutes (`poll_timeout`; the gateway's job limit is 30). **A network error or 5xx fails the job only on the POST.** While polling, keep going through them until the 35-minute limit, so a brief drop never ends a job the gateway is still doing, and a retry never pays for transcription twice (Silver's suggestion, SPEC-101 § Questions; `[SA-decided]`).

## Intake — exact commands

Run on the assembled file, in this order. Spawn with an argument array, **never a shell string**: the file name is never put in a command; the stored name is fixed.

1. Validate: `ffmpeg -hide_banner -nostdin -xerror -i <in> -map 0:a:0 -af volumedetect -f null -`. Non-zero exit → `415 unsupported_file`. Parse `max_volume: <x> dB` from stderr.
2. Normalise: `ffmpeg -y -v error -nostdin -i <in> -map 0:a:0 -vn -ac 1 -ar 16000 -c:a aac -b:a <AUDIO_BITRATE> -movflags +faststart <out>/audio.m4a`.
3. Output over `GATEWAY_MAX_BYTES` → `413 file_too_large`. Duration: `ffprobe -v error -show_entries format=duration -of csv=p=0 <out>/audio.m4a`.
4. Delete the chunks and the assembled original. **Only `audio.m4a` remains, and the picture is gone.**
5. `max_volume` at or below `SILENCE_DB` (-60) → `status: no_speech`, no gateway call. Otherwise `queued`.

Storage: `<STORAGE_DIR>/<id>/chunks/<index>`, `<STORAGE_DIR>/<id>/original`, `<STORAGE_DIR>/<id>/audio.m4a`.

## Data Model

Greenfield, no existing rows. `migrations/001_init.sql`, run by `bun run migrate`, by the BE, on this project's own dev database. **On any real environment the owner runs it.**

```sql
CREATE TABLE recordings (
  id           uuid PRIMARY KEY,
  client_id    uuid NOT NULL UNIQUE,
  file_name    text NOT NULL,
  size_bytes   bigint NOT NULL,
  source       text NOT NULL CHECK (source IN ('file','mic')),
  status       text NOT NULL CHECK (status IN ('uploading','queued','transcribing','summarizing','done','no_speech','transcription_failed','summary_failed')),
  error_code   text,
  duration_ms  integer,
  turns        jsonb,
  summary      text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX recordings_status_created_idx ON recordings (status, created_at);
CREATE TABLE sessions (
  token_hash   text PRIMARY KEY,
  expires_at   timestamptz NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
```
`UNVERIFIED` — this SQL has not been run: no local Postgres by rule, and no `DATABASE_URL` yet. TASK-104 proves it.

## Env — back (`.env.example`, one line each)

| Key | Default | For |
|---|---|---|
| `PORT`, `HOST` | 3101, 127.0.0.1 | Listen address |
| `DATABASE_URL` | none | **From the owner.** This project's own database |
| `FRONT_ORIGIN` | none | The one origin CORS allows |
| `COOKIE_SECURE` | `true` | `false` only for a local plain-http run |
| `OWNER_PASSWORD_HASH` | none | `Bun.password` hash, from `bun run hash-password`. The owner sets his own on a real environment |
| `STORAGE_DIR` | none | Must be outside the release folder |
| `FFMPEG_PATH`, `FFPROBE_PATH` | `ffmpeg`, `ffprobe` | The binaries |
| `AUDIO_BITRATE` | `40k` | Normalised bitrate |
| `SILENCE_DB` | `-60` | At or below means no speech |
| `MAX_UPLOAD_BYTES` | 4294967296 | Largest file accepted |
| `GATEWAY_MAX_BYTES` | 104857600 | SPEC-101's `AUDIO_MAX_BYTES` |
| `LLM_GATEWAY_URL`, `LLM_GATEWAY_KEY` | none | The gateway. **Key from the owner**; a local stub gateway has its own |

Front: `NEXT_PUBLIC_API_BASE_URL`, default `http://localhost:3101`. Front local port 3100.

**A tester's own store (TEST-102 Q9):** the whole store comes from env. Set `DATABASE_URL` to another database and `STORAGE_DIR` to another folder, run `bun run migrate`, and the store is empty. ~~A second database needs a URL from the owner, via the PM; until then the shared one works, with `QA-` in file names.~~ **Corrected 2026-11-06 (Tanya, TEST-102 Q10): the shared one does not work.**

**🔴 One database, one back, one `STORAGE_DIR`, at a time.** Each back's worker takes the oldest `queued` row, resets `transcribing` and `summarizing` at boot, and runs the hourly delete. A second back on the same database takes rows whose files it cannot see, and resets the other's work. Read from this SPEC's flow, not run.
- **Tester:** her own database, requested by the PM, on her own port and `STORAGE_DIR`.
- **Team A:** `call-scribe-back`'s `.env` database, one back only, always on port 3101, so a second one on this box fails to bind. Never change the port to get round that. Fern uses the back already on 3101, or starts it with `bun src/index.ts` in that repo if none is running. **Corrected 2026-11-06, read at `src/env.ts:60,68-69`:** `.env` alone does not start it, as `LLM_GATEWAY_URL` and `LLM_GATEWAY_KEY` are empty and required. Pass them on the command line, plus your own throwaway `OWNER_PASSWORD_HASH`, as Jason's run did (TASK-104 § Implementation Notes): a local stub's URL, or a dummy when no real-back check reaches the gateway. Never write them into `.env`, and never a real gateway. Also pass `FRONT_ORIGIN=http://localhost:3100` when the front is opened on `localhost`: `.env` holds `127.0.0.1:3100`, and a mismatch shows as a login failure (Fern, TASK-107 § Real-back run). **Fern's real-back runs start when the SA says:** until Jason's TASK-105 and TASK-106 Postgres runs are finished, a second worker on this database would take his rows. Before anything else runs the worker or the clean-up against this database, including a test run, stop the back on 3101.
- Test rows are removed by the test that made them.

## Flow

**Pick a file (user-visible):** Home → เลือกไฟล์ → if the file has a video track and a strip is safe, strip in the browser → no audio track at all shows Unsupported file, sends nothing → POST `recordings`, PUT missing pieces, POST `complete` ("While sending") → "After sending". Picked files stay in memory only: on a failed send, **Send failed** with retry; after the app is closed he picks the file again, and it is still on his phone.

**Strip safety:** set `localStorage["cs_strip_in_progress"]` before a strip, clear it after. If it is found set on the next pick, the last strip killed the page: clear it and send the original this once. A strip that throws also sends the original. The back then strips.

**Record (user-visible):** Home → อัดเสียง → mic permission → `MediaRecorder` with a 5-second timeslice, each piece written to IndexedDB as it arrives, screen wake lock held → stop → same upload as a file, `source: "mic"` → IndexedDB entry deleted after `complete` succeeds. MIME: first of `audio/webm;codecs=opus`, `audio/mp4` that the browser supports.

**Cut off:** a track `ended` or recorder `error` stops recording and shows **Recording cut off**. On every app open, an IndexedDB recording that never finished shows the same message with an action to send what was kept. Never discarded silently. **A mic recording the back refuses (`413`, `415`; Q10 c)** stays on the phone with its own message and no retry, on every app open, until he deletes it with ลบ and confirms. **No microphone API, or IndexedDB will not open (Q10 a, b):** recording does not start, and the file picker still works.

**Processing (back only):** worker takes the oldest `queued`, sets `transcribing`, runs SPEC-101 step 1. `no_speech` → stop. Stores `turns`. Sets `summarizing`, step 2, stores `summary`, `done`. A failure sets the status and `errorCode`. **The back's own write failing mid-job (added 2026-11-06, `[SA-decided]`):** the row becomes failed with `worker_crashed` as soon as the database answers again, never requeued by itself, since a repeating crash would pay for transcription each time. **Retry from `summary_failed` keeps `turns` and only redoes the summary** (AC-15). Boot: `transcribing` and `summarizing` return to `queued`, with stored turns kept, so a summary resumes without re-transcribing. Hourly: delete `uploading` rows and files older than 24 hours, and expired sessions.

**Reading:** the app shows server state only. It polls `GET /api/recordings/:id` every 5 seconds while `queued`, `transcribing` or `summarizing`. So closing the app changes nothing once `complete` returned (AC-16).

**"Closes" in AC-8 and AC-16** `[SA-decided]`: the tab, or the installed app, is closed and opened again. The tester's check is a closed tab plus a new one; installed behaviour is phone-only.

## Non-functional

- **Personal data:** never log a file name, turn text, summary or password. Log id, status, error code, byte count, duration. Audio is never committed: `.gitignore` covers `.env`, `storage/`, `dist/`, `.next*/`, `node_modules/`. Test audio is generated at test time with ffmpeg, into a temp folder.
- **Secrets:** only in `.env`. Session tokens are 32 random bytes, stored as SHA-256 only.
- **Security:** `/security-review` by the SA before DONE on TASK-104 and TASK-105. Back rejects a path-unsafe `:id` (must be a uuid). The file name is display data only.
- **Database wait (added 2026-11-07, Q11, TASK-115) `[SA-decided]`:** every database call from the back fails after 10 s rather than waiting on a dead connection. A request answers `500 internal_error`; the worker fails that row as `worker_crashed`.
- **Phone:** works at 390 px wide, Thai only. Nothing else is required.

## Risks, assumptions, unknowns

- **UNKNOWN: browser strip on his phone.** 600 MB heap on desktop may be uncollected garbage or real need. A phone that kills the page is designed for (strip safety), and costs mobile data and one picture upload. **Settled only on his Oppo.** To the PM: consider one case in AC-13's click-script, picking a 10-minute screen recording.
- **UNKNOWN: can the app reach a screen recording at all?** `accept` lists audio and video, but Android's picker is not run. Settled by AC-10.
- **UNKNOWN: real ColorOS recordings' audio codec.** The back handles anything ffmpeg decodes. A strip that cannot copy the codec falls back to the back.
- **RISK: strict decode refuses a real recording with one damaged frame** (mid-file corruption exits 183). Medium likelihood, low cost: he sees Unsupported file and the original stays on his phone. AC-6 requires this behaviour; if AC-10 hits it, it returns as REQ content.
- **RISK: truncated picked MP3 or WebM passes as a shorter valid file** (table above). Needed so cut-off recordings survive. AC-6's "corrupt audio" case must be a mid-file corruption or a truncated M4A. For the tester, via the PM.
- **RISK: 40 kbps may lower transcription quality.** Unproven, Team B's TASK-103 runs at other shapes. Env value, no code change. Via the PM.
- **RISK: real transcripts in the owner's dev Postgres.** If AC-10 runs against it, real call text sits there. Via the PM, before any deploy.
- **UNKNOWN at deploy (Otto, on the owner's word, Q5):** ffmpeg must be installed on the server · `STORAGE_DIR` persists across releases and is backed up or not · front and back share one registrable domain, or `SameSite=Lax` breaks login · which limits the deployed gateway has · **`complete` can be silent for a long time on a large fallback video.** `server-platform/readyidc/new-app` sets no `proxy_read_timeout` (grep), and nginx's documented default is 60 s, not run here. A `complete` over that would fail at the proxy while the back carries on.
- **ASSUMED (internal):** speech at 40 kbps ABR sizes like the tone measured. Twice the size still fits the gateway's 100 MiB.

## AC coverage

| AC | Carried by | Note |
|---|---|---|
| AC-1 | TASK-105, TASK-108 | Formats: M4A, MP3, WAV, Ogg/Opus, WebM/Opus, FLAC, and the in-app format. AMR is decoded, not run here |
| AC-2 | TASK-109 | |
| AC-3, 4, 5 | TASK-106, TASK-110 | Displayed here; quality is SPEC-101, TASK-103 |
| AC-6 | TASK-105, TASK-108 | |
| AC-7, AC-15 | TASK-106, TASK-110 | |
| AC-8 | TASK-107, TASK-110 | |
| AC-9 | no work | The owner's check |
| AC-10 | no work | Needs a deploy: the owner's |
| AC-11 | no work | Team B; we do not touch the gateway |
| AC-12 | TASK-104, TASK-105 | `.gitignore`, generated test audio. The search is the tester's |
| AC-13 | TASK-111 | Bare page, with no back: stores and uploads nothing. HTTPS needs Q5. TASK-109 is the same mic path in the app |
| AC-14 | TASK-105, TASK-108, TASK-109 | |
| AC-16 | TASK-106 | |
| AC-17 | TASK-104, TASK-107 | |
| AC-18 | TASK-105, TASK-110 | |
| AC-19 | TASK-105, TASK-106 | Size and time here; quality Team B |
| AC-20 | TASK-105, TASK-106, TASK-110 | Two layers: silence at intake, `no_speech` from the gateway |
| AC-21 | TASK-105, TASK-108 | |

## Tasks

- TASK-104: Back foundation, schema, login — owner: BE (depends on: `DATABASE_URL`)
- TASK-105: Upload and intake — owner: BE (depends on: TASK-104)
- TASK-106: Worker and gateway client — owner: BE (depends on: TASK-105; its final check on Team B's TASK-101)
- TASK-107: Front foundation, login, list — owner: FE (depends on: TASK-104)
- TASK-108: Pick a file, strip, send — owner: FE (depends on: TASK-105, TASK-107)
- TASK-109: Record in the app — owner: FE (depends on: TASK-108)
- TASK-110: Result, retry, delete — owner: FE (depends on: TASK-106, TASK-107, TASK-101)
- TASK-111: Phone check page, `/check`, for AC-13 — owner: FE (depends on: TASK-108, Q6)

Requirement 7's capture report is the owner's and the PM's: no TASK.

## Questions

**For the PM (business: goes to REQ-101 § Questions):**

- **Q1: wording the REQ does not yet have. BLOCKS TASK-107, 108, 109, 110 finishing, not starting.** Engineers invent none. Needed:
  login (password label, button, wrong password, too many attempts) · log out, if wanted · recording screen (in progress, stop button, no mic if it differs from mic refused) · a "preparing file" line during a strip · buttons: retry, delete, confirm, cancel, send what was kept · list status per `status` · summary `output_truncated`: "Output cut off" says no result, but the transcript is there.
  > answer: `[PM-decided]` All added to REQ-101 § User-facing wording, 2026-11-06. Log out is included. Porter.
- **Q2: DATA REQUEST, `DATABASE_URL`. BLOCKS TASK-104's two DB checks, then everything after.** This is the "first TASK needs env" moment in REQ Q9: a database for this project on the owner's dev Postgres. Only that one value now. No provider key and no spend limit: nothing in this SPEC calls a provider, since the stub gateway needs none. The local login password is generated by the engineer and is throwaway.
  Checked: `SYSTEM-FACTS.md` § Open questions (*"ค่อยมาเอา"*) and REQ Q9: asked for at this moment, value not received.
  > answer: Asked of the owner by the PM, 2026-11-06. Pending. Porter.
  > Sober 2026-11-06, on your `.env` ask: **`.env` is not ignored in `call-scribe-back` today** (ran `git check-ignore .env`: exit 1; the repo holds only `README.md`). TASK-104 now makes `.gitignore` its first step and proves it. If the value lands first, it is still safe on disk, since only I commit, and only on the owner's command: **I run `git check-ignore .env` before any `ขึ้น git` in this repo, and stop if it fails.** No engineer or owner action needed beyond this.
  > answer: `[PM-decided 2026-11-06]` Q2 unblocked: `.env` and the file named `call-scribe-qa-env` both appeared at 17:26 with `DATABASE_URL` (`SYSTEM-FACTS.md`, including what is not known). Compared by script, values not printed, no connection: same remote host, different databases, both named for the project. **Who placed them is not recorded, so before the first migration, have the first step only read which tables exist. If anything there is not ours, stop and tell me.** Porter.
  > answer: `[operator 2026-11-06, via Atom 17:25]` Settled: the owner's word, placed by Atom. Back and engineers use `call_scribe`; the tester uses `call_scribe_test`; same host as caw-back, whose database stays off-limits. Atom reports both accept connections (not run by the desk). Go ahead with the DB checks, read-only table check first as above. `LLM_GATEWAY_*` is still empty, so use the local stub only. Porter.
- **Q3: for Silver, through the PM. Please have Silver check § The seam with the gateway and § Intake, once.** Also: (a) can TASK-103 include audio at this exact shape, AAC 16 kHz mono 40 kbps? `ffmpeg … -ac 1 -ar 16000 -c:a aac -b:a 40k`. (b) A note on my side's choice: this makes 60 minutes about 17 MB (a tone), which would fit even under a 20 MB limit on the deployed gateway. (c) My TASK-106's last check and TASK-110 run the stub from `develyst-ai`'s tree, read-only, by process env: tell me if that collides with Bob's work, and when TASK-101 is `DONE`.
  > answer: Carried to Silver, 2026-11-06. The reply comes through the PM. Porter.
  > Sober 2026-11-06: Silver's reply read (SPEC-101 § Questions): the seam fits. Taken in: `AUTH_ENABLED=false` and a snapshot in TASK-106's last check and TASK-110; polling rule in § The seam. TASK-103 now runs at this shape, with a 128 kbps reference, so it settles the 40 kbps risk. No delete cancel: the PM accepted memory only, under AC-18.
- **Q4: for Tanya, through the PM (TEST-102).** Truncated MP3, WebM and Ogg **pass** validation on purpose, so a cut-off recording survives. AC-6's "corrupt audio" case must be mid-file corruption or a truncated M4A; those are refused (§ What I read and ran). "Closes" for AC-8 and AC-16 is defined in § Flow. AC-1's format list is in § AC coverage. AMR cannot be made on this box. Matches the PM's rulings on TEST-102 Q3 and Q4. Limit: § Upload; own store: § Env.
  > answer: Carried to Tanya, 2026-11-06. Porter.
- **Q5: for the PM, one case to consider for AC-13's click-script.** Pick a 10-minute screen recording on his Oppo, and report whether it reaches "sent". It is the only proof of the browser strip on his phone (§ Risks), and the capture route depends on it. No file comes to the team.
  > answer: `[PM-decided]` Yes, added to REQ-101 AC-13. Porter.
  > **Correction, Sober 2026-11-06: my wording above was wrong, please amend AC-13.** "Reaches sent" uploads his own recording, which contradicts AC-13's *"It stores and uploads nothing"* and your TEST-102 Q6 ruling that no real recording goes up before 17.4 passes. Proposed AC-13 case: on the bare test page, **the strip runs on the phone and sends nothing**; he reports "finished" or "the page died". The strip is what is unknown, and sending is not. **Consequence for the build:** the bare page is a small page holding `src/lib/strip.ts` only, so I would cut it as one FE TASK once you confirm. It waits on the owner's word on Q5 like the rest.
  > answer: `[PM-decided]` Confirmed. REQ-101 AC-13 amended to strip-only, nothing sent. Cut the one FE TASK. Its deploy waits on the owner's word. Porter.
- **Q6: wording for TASK-111's `/check` page. BLOCKS TASK-111 finishing, not starting.** A page only the owner sees, with his own click-script. Needed: page title · record: start, stop, length line · strip: pick a video, running, finished (picked size, output size, seconds), failed, "the page died" · one line that nothing is sent or kept. It also shows a plain audio player, on this page only, since AC-13 needs him to hear the recording: the app's Out of Scope is unchanged.
  > answer: `[PM-decided]` In REQ-101 § User-facing wording, rows starting `/check`. Playback on this page only is accepted. Porter.
- **Q7: from Fern's TASK-107, what the owner sees. BLOCKS TASK-107's `REVIEW`, nothing else.**
  (a) Wording not in the REQ: the list is loading · the list could not be read, and its retry button · login failed for another reason, such as the back being unreachable · the moment before login or Home appears (checking the session).
  (b) Date on a list row. Today it renders Thai with the Buddhist year: `6 พ.ย. 2569 16:10`. My default: keep it, as it is what `th-TH` gives and fits Thai-only. Correct it if he would want the Gregorian year.
  > answer: `[PM-decided]` (a) in REQ-101 § User-facing wording. (b) Your default. Porter.
  > Sober 2026-11-06: my heading above was too loose. Q7 was **one** of two things holding TASK-107's `REVIEW`. The other stands: its Playwright items against the real back, which wait on `DATABASE_URL`.
- **Q8: from Fern's TASK-108, one thing the owner sees. Blocks nothing.** A stripped screen recording shows in the list as `<name>.m4a`, since only its audio was sent, not `<name>.mp4`. My default: keep `.m4a`, as it is true. Correct it if the original name would be easier for him to recognise. One line to change.
  > answer: `[PM-decided]` Your default: `.m4a`. The name he recognises stays the same. Porter.
- **Q9: three strings the owner would see, from reviewing TASK-111 and TASK-106. (a) and (b) hold TASK-111's `DONE`; (c) holds TASK-110's finish, not its start.** `Checked:` REQ-101 § User-facing wording: none of the three is covered.
  (a) `/check`: this page cannot use a microphone at all, nothing recorded. It covers a browser or address with no microphone API, and a recorder that will not start. Over HTTPS on his Oppo it should not appear, but if it does, it is a result he reports.
  (b) `/check` now reuses the app's Microphone refused and No microphone found rows. Both end with "or pick a file instead", and on `/check` the only picker is the video strip check, which replaces nothing. My default: the same two sentences, without that ending, as `/check` rows.
  (c) `audio_missing`: the recording is listed, but its audio file is gone from storage, for example lost in a deploy. Transcription failed says the audio is still there and to press retry; neither holds. No retry control, per § Errors. The list row keeps ถอดเสียงไม่สำเร็จ.
  > answer: `[PM-decided]` All three in REQ-101 § User-facing wording; (b) is your default. The click-script note is under AC-13, so it reaches Tanya when the script is asked for. Reset check noted, thank you. Porter.
  > **Gate FAIL (your inbox note):** do not hold Jason's or Fern's work `[PM-decided 2026-11-06]`. The owner said *"ทำต่อไปนะ"* at 17:26, before this FAIL, so I am telling him and asking him to call Atlas; if he says stop, I tell you at once. Porter.
- **Q10: from Fern's TASK-109, in-app recording, what the owner sees. Holds TASK-109's `REVIEW`, not its work.** `Checked:` REQ-101 § User-facing wording, Q8, Q9: none covers these; Q9's microphone row is for `/check` only.
  (a) **In the app, no microphone API at all.** The screen says nothing was recorded. Expected never to appear over HTTPS. My default: the Q9 (a) sentence with "แอป" in place of "หน้า", plus "เลือกไฟล์แทนได้", as the app's picker is a real alternative.
  (b) **In the app, the phone cannot keep the recording** (IndexedDB will not open). We refuse to start rather than record what a crash would lose (AC-14). Nothing was recorded, and picking a file still works.
  (c) **A mic recording the back refuses (`413` or `415`).** Today it shows Send failed with retry, and the entry stays, as it is the only copy. But retry can never succeed, Send failed's retry promise is false here, and with no way to remove it the message returns at every app open. Unsupported file and File too large also do not fit: both say nothing was kept. Rare: `413` means over 4 GiB, and `415` a recording that will not decode. My default: one new string saying this recording could not be used and is still on the phone, no retry, with the existing ลบ button and Delete confirm wording. Nothing is discarded unless he confirms. It needs only your string; I add it to TASK-109.
  (d) **The name in the list** for a mic recording is its start time, `2026-11-06-174217.webm`. Same spirit as Q8, and the row also shows the date. My default: keep it. One line to change.
  > answer: `[PM-decided]` (a), (b) and (c) in REQ-101 § User-facing wording. (c) follows your default: no retry, existing ลบ and Delete confirm. (d) Your default. Porter.
- **Q11: the back stalls against its database. For the PM: please route the probe to Tanya. Blocks no TASK; I will not call the back ready for the owner until it is explained.** Reported by Fern, TASK-108 § Rework R1: `/health` answered 200 while `POST /api/auth/login` timed out at 8 s (18:58:06, :16, :26; then 1.8 s, then 0.36 s). Uploads sat on "sending" for 30 s. A restart helped for a while, then it stalled again. Process alive, 2.1 % CPU, 2 connections, no error in the log. `DELETE` about 0.75 s each. **Nobody knows the cause; no suspect below is shown.** Read at `src/db.ts:9`: `new SQL(url)`, with no pool, idle or timeout settings. **No fix before the numbers** (`predict-then-probe.md`). Not the same as the gateway's `capacity` hang (TASK-112: no database there) or the unnamed test failure (memory stores only).
  | Suspect | If this is the cause, we will see… | Comes out false if… |
  |---|---|---|
  | D1: a pooled connection goes dead while idle, and a query waits on it | a long-lived connection's `SELECT 1` takes over 8 s after sitting idle, while a **fresh** connection at the same moment answers within 2 s | stalls also hit fresh connections, or happen with no idle gap before them |
  | D2: the database host or the network to it is slow at times (shared with caw-back) | **fresh** connections also take over 8 s, at the same moments as the back | fresh connections stay fast all through a back stall |
  | D3: the back's own pool runs out under parallel requests | `/api/auth/me` over 8 s only while requests overlap, with fresh direct connections fast | it stalls on a single request at a time |
  | D4: password hashing, not the database | login over 8 s while `/api/auth/me`, which has a database query and no hash, stays fast | `/me` stalls too. Weakest: uploads stalled, and they do not hash |
  **Recipe, read-only and unchanged between passes:** the tester's own database and port, one back, one login with the session kept. Each pass, time: `/health` · `/api/auth/me` · `SELECT 1` on one long-lived connection · `SELECT 1` on a new connection. Baseline first, 3 runs, median. Then idle gaps of 1, 5, 15 and 30 minutes before a pass, and one pass of 5 overlapping `/me` calls. **Label each result `ok`, `symptom` (over 8 s) or `could not ask`, with the time it really ran.** Never a printed `DATABASE_URL`.
  **Not mine to decide:** whether this waits for her next free slot or goes first. My default: it runs alongside TASK-110, on her own database, so nothing collides.
  > answer: `[PM-decided 2026-11-06]` Your default: it goes now, alongside TASK-110. Routed to Tanya. The back is not called ready to the owner until this is explained. Porter.
  > PM 2026-11-07: Tanya's probe finished: stall not reproduced, 36 `ok`, 0 `symptom`; all four suspects `NOT SETTLED`, so Q11 stays open. Numbers: `tests/TEST-102-req-101-app-acceptance.md` § Q11. Yours to read: one `worker: job crashed: PostgresError` right after the box woke; a lost connection replaced with no error; about 245 ms per statement and 1300 ms per new connection, all steady. Her once-a-minute timing continues through the stub cases `[PM-decided: her default kept]`. Next step on the cause is yours. Porter.
  > **Sober 2026-11-07, what the numbers mean. Cause still unknown; Q11 stays open; no suspect is cleared or favoured enough to fix.**
  > **Explained, by arithmetic from Tanya's 245 ms:** Fern's `DELETE` at about 0.75 s is not a stall. It makes 3 statements (session check, `get`, `remove`; read in `routes.ts`, `middleware.ts`), and 3 × 245 is 735 ms. That is the normal cost of this box's distance from the database. **Inferred, not measured:** Fern's login at 1.8 s, right after the stall ended, fits one new connection (about 1300 ms) plus one statement and the hash; then 0.36 s fits an open connection. If so, the stall ended when the back opened a new connection. That leans towards D1 or D2 and shows neither.
  > **The `PostgresError` at 01:38:23 is the handling working:** no row was involved, the worker carried on, and the next pass was fine. The box had just woken. No action.
  > **New fact, not about the product:** this box stopped for about 5.8 hours, cause unknown. It also makes any long run here unreliable. Fern's stalls were not a whole-box freeze as reported, since `/health` kept answering.
  > **The real gap: a stall leaves no trace.** The back logged nothing during Fern's two, and a once-a-minute probe can miss a 30-second stall. So:
  > 1. **TASK-113, Jason `[SA-decided]`:** one log line when a request or the worker's database call takes 5 s or more. The worker's call runs every 2 s, so the back times its own database constantly. Not a fix. It goes up only on the owner's word, and does not disturb Tanya's fixed commits.
  > 2. **For Tanya, through you, one request:** during the stub cases, time every 15 s rather than every minute, and add the long-lived connection's `SELECT 1` to `/me` and the new connection. Same-moment numbers on those two are what separate D1 from D2. If that would disturb her cases, she decides, and says so.
  > 3. **No fix until a stall is caught.** Tuning the pool blind could hide it without our knowing why.
  > **For you, a stop line, so this cannot hold forever. My default:** if it has not recurred by the end of the stub cases and TASK-103's run, stop hunting. Report to the owner as: seen twice on 2026-11-06 during heavy use, not reproduced, cause unknown, with the slow log in place to catch it on his phone. **"Not explained" stays in that sentence;** whether that is good enough to go on is his call, not ours. Correct it if you want it otherwise.
  > PM 2026-11-07 02:12: new, for you, from Tanya (`tests/TEST-102-req-101-app-acceptance.md` § Q11, "Seen once already"): `unhandled error: PostgresError` at 01:54:10, an empty list not shown within 15 s, one watch tick that never finished. **The box froze again:** about 280 s, between 01:54:10 and 02:10:34. I checked it separately: `uptime -s` moved from 23:03:16 to 23:07:54, 278 s. So freezes recur, and a stall seen on this box may be one; you noted Fern's kept `/health` answering. Please say whether this counts as a recurrence under the stop line. The owner is told. Porter.
  > **Sober 2026-11-07: `POSSIBLE`, neither a recurrence nor a clean run. It stays in the sentence to the owner.**
  > **Why not a recurrence:** the freeze sits somewhere in the same 16-minute window (01:54:10 to 02:10:34), and nothing places it against the error. One smoke run, on a different database. A frozen box can break a connection by itself.
  > **Why not clean:** a request stuck past 15 s, one tick that never finished, and a database error, with the back alive and the next tick normal. That is close to Fern's stall, and it is the first time any of this has produced an error. This time the back recovered with no restart.
  > **Correction to my note above, on Fern's login at 1.8 s:** Fern's report does not say whether that came before or after a restart, and a restart also opens a new connection. So "the stall ended when the back opened a new connection" shows nothing about how it ended, and it does not lean towards D1 or D2. Please drop that. Fern, if it can be recalled, is the only source; no one need chase it.
  > **What counts from now on, so nobody has to judge this twice:** `recurrence` = over 8 s on a database-backed request, with `/health` answering, and **no freeze inside that tick** by Tanya's since-boot clock (`q11-watch.ts` records it, a freeze being wall time moving faster than uptime). The same, with a freeze inside that tick = `freeze-adjacent`: reported, not counted. A stall with no clock at the time, as here = `possible`.
  > **Stop line, amended; correct me if you disagree:** the sentence to the owner becomes *"seen twice on 2026-11-06 during heavy use, possibly once on 2026-11-07, not reproduced, cause unknown."* One `recurrence` by the rule above ends the stop line's condition, and then it is back on me.
  > **The gap this exposes:** the log says `PostgresError` and stops there, so even this error cannot tell a lost connection from anything else. **TASK-114, Jason `[SA-decided]`:** add the error's code to those lines, never the message. Ran against a closed local port: `code: ERR_POSTGRES_CONNECTION_REFUSED`, with no password in the message. That code is what would separate D1 and D2 from the rest. Still no fix.
  > **For Tanya, through you, one thing only if cheap:** her stub run uses snapshot 1195792, so it stays class-only. Keep it there, as the owner said. If it logs another `PostgresError`, please give the tick numbers and clock from the watch around it, which is all I need.
  > **The freezes themselves:** 2 now, 5.8 h and 278 s, cause unknown, and yours and the owner's, not the app's. They do matter for the paid run: **I would not start TASK-103's live calls on this box until he has seen this,** since a freeze mid-run could lose money and results. That is my advice for you to carry; the decision is his.
  > answer: `[PM-decided 2026-11-07]` The rule and the amended stop line stand as you wrote them. Request carried to Tanya. Your advice on the freezes and TASK-103 carried to the owner. Porter.
  > Sober 2026-11-07, on Atom's diagnosis (`SYSTEM-FACTS.md`, "This box pauses"): my rule is unchanged. **One thing would change how the 01:54 event reads:** whether the pause began before or after the `PostgresError` at 01:54:10. ~~Atom puts the 280 s pause at about 02:00. If so, it came about 6 minutes **after** the `PostgresError` at 01:54:10, so the pause did not cause that error, and the `possible` would lean towards a real stall. "About 02:00" is too loose to rest on.~~ **Withdrawn, Sober 2026-11-07:** "about 02:00" was not Atom's (PM's correction below). Nothing orders the pause and the error. This user cannot read the journal (ran: "No journal files were found"). **If it costs nothing, please ask Atom for the pause's start time to the minute,** from what it read. It stays `possible` either way, since no clock was running at the time; only the leaning could change. Not worth the owner's time.
  > answer: **Correction, Porter 2026-11-07: "about 02:00" was my word, not Atom's.** Atom gave no time for that pause, and I wrote it into `SYSTEM-FACTS.md` by mistake (struck; F-019). Known only: between 01:54:10 and 02:10:34, so **please withdraw "about 6 minutes after": nothing yet orders the pause and the error.** I asked Atom for the start time, one line; the journal is unreadable from my session too. Stays `possible`.
  > **Sober 2026-11-07, a new fact about the driver. It shows a mechanism, not the cause; no suspect is settled.** `tests/harness/bun-sql-dead-connection.ts`, Bun 1.4.4, a fake Postgres on loopback, no real database, ran twice:
  > ```
  > connection goes silent:   q3 NO ANSWER, gave up waiting at 12000 ms | q4, q5, q6 on other connections: ok, about 1 ms
  > connection closed:        q3 ERROR PostgresError code=ERR_POSTGRES_CONNECTION_CLOSED, 0 ms | q4, q5, q6: ok
  > ```
  > **What it shows:** with `src/db.ts`'s `new SQL(url)`, a query on a connection that goes silent gets no answer and no error, at least to my 12 s limit, while other queries carry on. That is the same shape as Fern's stall: low CPU, no error line, `/health` fine, others working. A closed connection gives at once the same class Tanya logged at 01:54:10. **So D1 is now a possible mechanism, where before it was only a guess.**
  > **What it does not show:** that this happened. A fake server is not the owner's Postgres, a real dead connection also meets TCP's own retry timers, 12 s is my limit and not a measured end, and the driver opened 10 connections here while Fern saw 2 established, which I cannot explain. Tanya's and Fern's events may have another cause. D2, D3 and D4 stay open. One piped run of this script hung and was killed at 40 s with no output, unexplained; run to a file, it took 12 s, twice.
  > PM 2026-11-07, from Atom 02:21: the pause's start cannot be narrowed; journal, dmesg and Q11 samples give nothing tighter than 01:54:10 to 02:10:34. So the 01:54 event stays `possible`, closed on this point. Porter.
  > **PM 2026-11-07 10:33, numbers for you, cause is yours.** From `tests/harness/q11-watch-2026-11-07.jsonl`, 370 ticks, read-only, against your rule. (1) 14 pauses in 8.35 h, 23229 s; agrees with `uptime -s`. (2) **After nearly every pause the long-lived connection answers nothing, for stretches of about 15 minutes (ticks 63 to 123, 136 to 192, 213 to 273), then errors, then reconnects and is fine.** Real database. New connections stay fast meanwhile, apart from ticks 60 (102 s), 164 (60 s) and 298 (35 s). (3) `/me` over 8 s: 15 ticks, all 60 s caps; 12 touch a pause; ticks 64, 65 and 137 sit just after one, with no pause I can see inside them; `/health` is not in the watch. Please rule on those. (4) The rows contain no pause flag; my freeze test is wall against `up` between tick begins, over 5 s. My reading only: a pause leaves a dead connection and the driver waits it out, which would fit your probe; I have not shown it, nor that Fern's stalls were this. Porter.
  > **Sober 2026-11-07, ruling: ticks 64, 65 and 137 are `recurrence`, by the rule as I wrote it.** I read the raw rows and my numbers agree with yours. Each is over 8 s on `/me`, a database-backed request. No pause lies inside them: the wall clock and uptime move together from tick 63 to 68 and from 136 to 140. `/health` is not in the watch, but `/me` itself answered during those same minutes (tick 66, 1551 ms; tick 138, 1575 ms), which shows more than `/health` would. **Ticks 63, 136 and the other pause-touching caps are `freeze-adjacent`. The event at 01:54 stays `possible`.**
  > **My rule had a hole, and I am not closing it to get out of this:** it only asked about a pause inside the tick, and these sit 15 to 45 s after one. So read them as what they are: **not a stall from nowhere, but the after-effect of a pause.**
  > **So the stop line's condition has ended and this is back on me, as I wrote.** What the numbers show, all on the real database:
  > - **The pattern, 4 times out of 4 complete stretches:** a pause, then the long-lived query gets nothing for 946 to 1044 s, then `ERR_POSTGRES_CONNECTION_CLOSED` 4 times, then fine. Your "silent connection" is really **one query waiting**, because the watch runs that connection with `max: 1`, so later ticks queue behind it. **Inferred:** that length is the kernel giving up on the connection. This box has `tcp_retries2=15`, documented at about 924 s, from memory of the kernel's docs; not run with another value.
  > - **The back's own pool shows it too:** after a pause `/me` hits the cap 2 or 3 times, then answers in about 1550 ms, the cost of a new connection, then 248 ms. **Other requests are served all the while.** That is what `bun-sql-dead-connection.ts` showed on a fake server, now on the real database. New connections stay near 1300 ms throughout.
  > - **Fern's report has the same shape:** three login timeouts, then 1.8 s, then 0.36 s. No clock ran then, and Fern's restart may be in it, so it stays unproven, but **I withdraw my note that Fern's stalls were "not a whole-box freeze": a pause just before would look the same.**
  > **Not explained:** why a pause kills the connection at all (something past this box dropped it, inferred); ticks 60 (102 s, and no tick began meanwhile, with uptime moving, so the watch itself was held up), 164 and 298; and whether the stuck stub run has anything to do with it, which Tanya's sort will say.
  > **Decision `[SA-decided]`: TASK-115, Jason.** Every database call gets a 10 s limit, then fails normally, with no new wording, as the existing strings cover it. The next try lands on a working connection. **This is worth doing even off this box:** the owner's server may not pause, but any silent network break does the same, and today that means up to about 15 minutes of a stuck screen with no error. It treats the effect; a pause still costs a retry. It does not touch the pool's settings, since nothing shows those would help.
  > **Back's status:** not ready until TASK-115 is `DONE` and rerun on the real database. **Revised sentence for the owner, replacing the stop line's:** *"found: after the box pauses, or any silent network break, a request can hang up to about 15 minutes. A fix is being built. The box's pauses themselves are outside the app."*
  > **For you:** (1) Tanya's rerun should wait for TASK-115, and needs a fixed commit, so his word, or she records a snapshot. (2) Your advice on moving machines has my support, with these numbers: 14 pauses in 8.35 h, 6.45 h lost. I would not run the paid TASK-103 here. His decision. Porter's numbers are right; the cause above is mine.
  > **PM 2026-11-07, from Tanya's stub round 1, for you** (`tests/TEST-102-req-101-app-acceptance.md` § Stub round 1, "What the watch shows"): the shape 15 times, all within 30 s after a gap, new connections fast, socket state captured. **Three things to settle:** (1) your rule's clock misses 15 of 29 gaps, and literally her 15 ticks fit neither label; (2) 14.2 and 14.3: the worker took nothing for 200 s or more with `/me` answering. Does TASK-115 cover that? (3) **2 audio folders in her store with no database row; left for you. If a real recording could end up this way, it stays stored with nothing in the app to delete it, against AC-18.** That one matters to me whatever the pause turns out to be; not called a defect yet. 0 confirmed product defects in the round; 9 of the 15 were her harness. Porter.
  > **Sober 2026-11-07, the three:**
  > **(1) Tanya is right, and my clock was wrong. The rule, corrected; this one comes from new evidence, and changes no decision.** Wall against uptime misses 15 of 29 gaps, in which two separate processes stopped together while uptime kept moving. So: `gap` = no watch tick for over 20 s **by the wall clock alone**. `after-pause` = over 8 s, overlapping a gap or within 60 s after one. `recurrence` = over 8 s, no gap overlapping or in the 60 s before, while the back answers other requests. `/me` answering in the same minute serves for `/health`, which she is adding. **Under this, ticks 64, 65, 137 and all 15 are `after-pause`. My earlier ruling stands as what the old rule said, and TASK-115 stands.** Her numbers also say the important thing: **15 of 15 follow a gap within 30 s, and none elsewhere, in 8.4 hours. On this box, nothing yet shows this happening without a pause.** Also, "14 pauses" undercounts: 29 gaps.
  > **(2) Yes, TASK-115 covers 14.2 and 14.3, by reading; a rerun proves it.** Inferred: the last gap ended 02:38:01, and both cases began after it. The worker does one thing at a time, so one statement on a dead connection stops it for up to about 15 minutes, while `/me` works on other connections. The log's `worker: job crashed: PostgresError` lines fit, though they carry no times. With TASK-115 that statement fails at 10 s, and the loop carries on.
  > **(3) The 2 folders: I do not know how they happened.** I read every route, and nothing I can find writes `audio.m4a` after a delete: files go first, and intake cleans up after itself. `38fdbdf9` is in the back's log as `transcribing` at about 02:31, inside case 2.1, which ended `fetch failed`. Not a defect yet, and not cleared. Your concern stands whatever the cause, so **TASK-116, Jason `[SA-decided]`:** the hourly clean-up removes a uuid folder over 24 hours old with no row, and deletes nothing if the database cannot be asked. That protects AC-18 against any cause, and does not explain this one. The 2 folders stay as evidence. **Known limit if you want it in AC-18:** such a folder may stay up to about 25 hours.
  > **Still no fix: the rule stands.** For later, so it is not lost: the driver's options (`idleTimeout`, `maxLifetime`) and a per-query time limit are the places to look if a `recurrence` shows this, none tried. TASK-114's `code=` and TASK-113's slow line are what would show it on a real back.
  > **TASK-114 `DONE`:** uncommitted, 5 paths in `call-scribe-back`. Without it the next `PostgresError` is again just a class name. Going up needs his word.
  > answer: `[PM-decided 2026-11-07]` Stop line confirmed as you wrote it. Request carried to Tanya; she decides if it would disturb her cases. Told the owner; the box freeze is raised with him too. Porter.
  > **At deploy:** where the back runs relative to the database decides that 245 ms, and every request pays it at least once. For Otto, on the owner's word.
- **Q12: from Fern's TASK-110, the result screen, what the owner sees. (a) holds TASK-110's `DONE`, the last thing holding Team A's `SPEC_DONE`; (b) and (c) have working defaults.** `Checked:` REQ-101 § User-facing wording: no row for any of these.
  (a) **Two strings.** A retry that did not go through (the network failed, nothing changed; he can press again). A delete that did not go through (the recording and its result are still there). Both show on the result screen today as visible `TODO-COPY` markers.
  (b) **Reading one recording failed.** It reuses "List could not be read", โหลดรายการไม่สำเร็จ ลองใหม่อีกครั้ง, with ลองใหม่. My default: keep it, as "รายการ" also reads as one item, and Delete confirm already says "รายการนี้".
  (c) **Getting back to the list.** Today, tapping the app name in the header does it, as does Android's back button; there is no visible back label, since the REQ has none. A tap on a title is not obvious. My default: add one short back label, in your words, in place of the app name as the button.
  > answer: `[PM-decided]` (a) and (c) in REQ-101 § User-facing wording; the back label is `กลับ`. (b) Your default. Porter.
- **For your report, TASK-108 and TASK-109:** `DONE` 2026-11-06, engineer-proven; no phone run. Their rework went up in 1195792 and 589923d.
- **For your report, TASK-111:** `DONE` 2026-11-06, engineer-proven: I re-ran its spec, 12 passed. **Nothing ran on a phone.** AC-13 waits on the owner's word on the deploy (REQ Q5).
- **Note for the AC-13 click-script, no answer needed:** after TASK-111's rework, the length on `/check` is **the recording's own length**, not the time between start and stop. So the script can ask him to compare it with how long he spoke. A shorter length means the phone dropped part of it. Please pass this to Tanya when you ask for the script. Not run on any phone.
- **Reset check, your 17:17 question:** the app repos show nothing lost, by these runs, on snapshots taken after the reset. Back, no `.env`: typecheck clean, `82 pass / 0 fail`, same count as Jason's 17:08. Front: build OK, `check.spec.ts` 6 passed; the other 4 specs were not run, since they need a stand-in back. Each TASK's listed paths are there by `ls`; I did not compare files line by line, and have no earlier copy to compare with. Only loss found: the back's `node_modules`, which `bun install` restores. Who ran the reset I do not know. TASK-106's 17:08 stub run stands as evidence, so nothing on Team A's side waits on Silver except TASK-110.
- **Note, before any deploy (no answer needed now):** § Risks lists what Otto would need, and asks where real transcripts may live. Q5 in the REQ already routes this.

**Engineers ask below; answers as `> answer: …`.**
