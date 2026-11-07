# TASK-103: Provider check on synthetic Thai two-voice audio
- Source: SPEC-101 (REQ-101)
- Owner: BE (Bob)
- Status: BLOCKED — **prep DONE** after re-size (2026-11-07, Silver, § Review; cost so far US$0). **Live calls BLOCKED (waiting: PM — the owner's own word on the US$0.50 limit, `DECISIONS.md` 2026-11-07).** Silver tells you when they clear.
- Depends on: TASK-102 and TASK-112 (`DONE`), the owner's confirmation, test audio (below)
- Repo: `develyst-ai`, read and run only. Fixes the check shows are needed go in a new TASK, unless Silver grants the file in `## Questions`.
- Git writes allowed: **none.** Keys go only in the repo's git-ignored `.env`, never in this file, a log or the output you paste.
- Runs on a **local** copy of the gateway only. Never the deployed gateway.
- **The real keys are in the repo's `.env`, with 17 names (SPEC-101 Q9). Never print, copy, edit or `cat` that file.** It must never name an `AUDIO_*_PROVIDER`: that sends the harness's `notconfigured` suite to the real provider. For live runs, once cleared, name the provider on the command line, e.g. `env AUDIO_TRANSCRIBE_PROVIDER=gemini AUDIO_SUMMARY_PROVIDER=gemini … bun run start`.
- Files you may create: `ai-worker/tests/harness/` scripts and a results table in this TASK. **Audio stays in a `mktemp -d` folder and is removed**, so nothing reaches git (AC-12). One exception, ruled by the PM 2026-11-06: the generated voices are kept in `call-scribe-test-voices`, as § What to do says.

## Prep — all you may do now (owner via Atom, 2026-11-07 01:37: *"Unblock TASK-103 prep only; no live provider call until I say so."*)

🛑 **No real provider call of any kind, text-to-speech included**, however small. Do not run the gateway from the real tree with a provider named.

Everything runs on a scratch copy with fake keys: `W=$(mktemp -d); git clone -q <repo> "$W"; cd "$W"; bun install --frozen-lockfile`, a fake `.env` you write there, and `printf 'preload = ["<desk>/ai-worker/tests/harness/refuse-fetch.ts"]\n' > bunfig.toml` with `OUTBOUND_LOG` set. Build these in `ai-worker/tests/harness/`:

1. **Script and topics:** about 2 minutes, two speakers, about 12 known turns, 3 named topics, a few English terms. Invented content only.
2. **The voice script:** calls the TTS model named below, one track per speaker, reading the key from the environment. Before any call it checks that the limit is still covered. **It must refuse to run unless a flag you name is passed**, and you never pass it in prep.
3. **The variants script:** builds `clean`, `reference`, `leak` and `long` with ffmpeg from two input tracks, ending with the app's normalise step. Test it on generated tones or noise.
4. **The scorer:** computes every row of § Measure from a job's JSON and the script. Name your Thai word-splitting method. Test it with a hand-made reply, including a case that must score low.
5. **The run script:** one provider × one variant through the gateway's routes; keeps a running cost total and stops before the limit. Provider and limit are arguments.

**Prep Definition of Done:** each script run on the scratch copy, command and real output in § Implementation Notes · the voice script without its flag exits non-zero and makes no call · with the flag and `refuse-fetch.ts`, the log shows the intended URL and the refused call is reported as a failure, not as success · `OUTBOUND_LOG` otherwise 0 lines · the scorer's low case scores low · the copy is removed, and `git status --short` in the real repo is empty. Then set `REVIEW` with **prep** in the first line. Cost so far must read 0.

## What to do

Live part, once cleared. Settle which provider the app uses, with real calls on self-made audio only.

**Audio.** The PM's ruling (REQ § Questions): synthetic text-to-speech first, with the tool outside the product repos. **🛑 Do not install a text-to-speech tool.** A tester's install of one was refused twice by that session's permission check (`tests/TEST-102-req-101-app-acceptance.md` Q1), and trying it from your session would go around that refusal. **Voice source, ruled by the PM 2026-11-06 (SPEC-101 Q9):** the provider's own text-to-speech over HTTP, with the same keys and inside the same limit; nothing is installed. Use `gemini-3.8-flash-tts` first: Google's page lists Thai on it, 30 voices, up to 2 speakers, `NOT VERIFIED` by any run. Call it from a harness script, reading the key from the environment and never printing it. Generate each speaker on its own track, because `leak` needs voice B alone. xAI's TTS only if I say so. If the voices fail, or the two are not clearly different, stop and tell me, and I ask the PM. Do not record anyone. Count the TTS cost against the limit and show it in the results.

**Where the voices go, ruled by the PM:** the folder with the logical name `call-scribe-test-voices` in `machine.local.md`, outside every repo and this workspace. Create it if missing; if the name or path is missing, stop and tell me. Keep there only: voice A's track, voice B's track, the `clean` mix, the script and the topic list. **Synthetic voices only, never a real recording.** The other variants and the 60-minute file stay in the `mktemp -d` folder and are removed; ffmpeg rebuilds them. Tell me when the voices exist, with file names and sizes in `## Implementation Notes`; I tell the PM, who carries it to the tester. Write a script of about 2 minutes with two speakers, about 12 known turns, and a list of 3 named topics. Include a few English terms. Keep script and topic list in the harness folder.

**Every variant except `reference` ends with the app's own normalise step**, because that is the file the gateway will really get (SPEC-102 § Intake): `ffmpeg -y -v error -nostdin -i <in> -map 0:a:0 -vn -ac 1 -ar 16000 -c:a aac -b:a 40k -movflags +faststart <out>.m4a`

**Four variants of the clip:**
1. `clean`: both voices at equal level. This is the screen recorder's best case.
2. `reference`: the same mix, mono AAC at 128 kbps, **not** normalised. Only to show whether 40 kbps costs words compared with `clean`.
3. `leak`: voice B through `highpass=f=300,lowpass=f=3400,volume=-25dB`, mixed with voice A at full level. The same shape as `talks/BRAINSTORM-2026-11-06-capture-route.md` § Silver.
4. `long`: `clean` looped to 60 minutes, for the output limit only (AC-19's risk). **Run this last, and only if the spend limit covers it.**

**Runs:** each variant through both providers, through the gateway's own routes, then `POST /audio/summaries` on the clean result. Stop as soon as a run would pass the spend limit from Q9, and say so.

**Measure,** using the same rules as REQ-101's pass lines, so the numbers are comparable:

| Measure | How |
|---|---|
| Words | % of the script's words found in the transcript (AC-3 line: 80%). Name the counting method; Thai has no spaces, so say how you split |
| Speakers | `speaker_count`, and % of turns on the right voice, mapping each label to the voice it matches most (AC-4 line: exactly 2, 80%) |
| Summary | Each listed topic present? Any invented? (AC-5) |
| Long file | `done` or `output_truncated`, and the time taken |
| Cost | From the provider's usage figures or its console, per run |

## Definition of Done

- [ ] Results table in `## Implementation Notes`: one row per provider × variant, every measure above, the command that produced it. **Numbers only from real runs**; a run not made is `NOT RUN — <why>`.
- [ ] Every item TASK-102 marked `UNVERIFIED` is now confirmed, or corrected and reported in `## Questions`: xAI's auth header, Thai word joining, error codes, Gemini's upload flow.
- [ ] Gemini's API surface. Say whether `generateContent` took this model, the audio file and the schema. If it did not, stop that provider's runs and report it: I cut a new TASK, and you do not switch to the Interactions API here (TASK-102 § Questions).
- [ ] Does the speech survive? For `leak`, say plainly whether voice B's words came through at all, not only whether they were labelled.
- [ ] Your reading of the numbers in 3 lines. **The provider choice is mine**, and the owner's on data terms (REQ Q10). You only report.
- [ ] Voices kept. `ls -l` of `call-scribe-test-voices` shows only the 5 kept files, and the same names are not in `git status --porcelain` of any repo.
- [ ] Clean-up shown. `ls` of the temp folder after removal fails; `git status --porcelain` in the repo → nothing new; `grep -c` for each key's value in your pasted output → `0`.

## Implementation Notes
**PREP ONLY (2026-11-07, Bob). No real provider call was made, text-to-speech included. Cost so far: US$0.** No results table: no live run was made.

Everything is in `ai-worker/tests/harness/provider-check/`. One command proves it all, on a scratch clone of the gateway with fake keys and `refuse-fetch.ts` preloaded: `bash test-prep.sh <gateway repo>` → `TOTAL failed checks: 0`, exit 0 (final run; the first two had 4 failures, below). The scratch folder is removed by the script (`removed …: gone`). Real repo: `git status --short` → empty (HEAD 6711807, Silver's commit); no `api-keys.json`; ports 3961-3963 free. A `.env` exists in the real repo: I never read, printed or copied it (the scratch copy takes only git-listed files and gets its own fake `.env`).

| File | What it is |
|---|---|
| `script-S103.json` | 12 turns, 2 voices, 3 topics with keywords, English terms (deadline, budget, invoice, Zoom). Invented content. 1,195 characters; whether it runs ~2 minutes is UNVERIFIED until a voice is generated |
| `tts-voices.ts` | Gemini `gemini-3.8-flash-tts` over HTTP, one call per turn, builds two time-aligned track WAVs (silence where the other voice speaks). **Exits 2 unless `--really-call-tts`.** Needs `--limit-usd`, `--ledger`, `--rate-text-in`, `--rate-audio-out`: the rates have no default because I do not know them. Worst-case estimate against the ledger before any call; exit 3 if over |
| `make-variants.sh` | `clean`, `reference`, `leak`, `long` with ffmpeg; normalise step as in the TASK on all but `reference`; `long` length is an argument (3600 default) |
| `score.ts` | Every § Measure row from a job JSON and the script |
| `run-check.ts` | One provider × one variant × the summary, through the gateway's routes; ledger, limit stop, `--live-real` guard |
| `test-prep.sh` | The proof below |

**Thai word splitting:** `Intl.Segmenter("th")`, word-like segments, lower-case, NFC; script and transcript go through the same splitter. Words % = multiset recall. Speaker % = each transcript turn gets the voice whose unique words (used by only one voice) it hits most, tie = `unknown` = wrong; each label maps to its majority voice. Summary topics = any keyword found, spaces removed. **"Invented" is not decided by the scorer**: it lists Latin/number tokens absent from the script and says `MANUAL`.

**Real output, from the final run (trimmed to the checks):**
- Voice script, no flag → `REFUSING: this makes a paid text-to-speech call…`, exit 2, outbound log 0 lines.
- Voice script, flag + `refuse-fetch.ts`, fake key → `estimate (worst case): chars=1195 audio<=179s cost<=US$0.0908` (rates 1 and 20 were test values) then `FAILED (no track written): TTS request failed (TypeError): refused by refuse-fetch.ts`, exit 1. Log: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent` once. No track, no ledger file.
- Limit `0.0001` → exit 3 before any call (log still 1 line). The fake key string appears 0 times in all output.
- Variants on generated tones (20 s `long`): `clean.m4a` = `aac,16000,1`; `reference` not 16 kHz; `long` = 20 s.
- Scorer, hand-made replies: good (last 2 characters of each turn dropped) → `words_pct=93.9 right_voice=100 speaker_count=2 topics=2/3`, invented `999` flagged; labels swapped → `100`, map `{"1":"B","2":"A"}`; **low case** (1 speaker, unrelated text) → `words_pct=2.2 right_voice=0 speaker_count=1`.
- Run script, `stub`: transcription `done`, summary `done`, cost 0, no ledger, no outbound. `gemini` under refuse-fetch: `status=failed error={"code":"provider_failed","retryable":true} refuse_mode=true cost=0`, exit 1; log `https://generativelanguage.googleapis.com/upload/v1beta/files` (the first call of the gateway's upload flow, so it matches the adapter); nothing charged. `xai` without refuse-fetch and without `--live-real` → exit 2 `REFUSING`. Ledger 0.95 + 0.2 over limit 1 → `STOP … NOT RUN`, exit 3, ledger unchanged.

**Slips found by the test, fixed before this was set to REVIEW:** `bc` is not installed here (replaced with awk and jq); my jq `.text[0:(length-2)]` took `length` of the wrong object and emptied every turn (words 0 %); the scorer counted an `unknown` turn as correct when its label also mapped to `unknown` (low case showed `right_voice=100`, now 0). I also edited two lines of `test-prep.sh` and `score.ts` with a Python replace that did not assert one match each; I read the five changed lines back afterwards, and the final run passes.

**Not verified / decisions for Silver:**
- UNVERIFIED: the Gemini TTS request shape (`generationConfig.responseModalities`, `speechConfig.voiceConfig.prebuiltVoiceConfig`), 24 kHz 16-bit mono PCM output, and that `gemini-3.8-flash-tts` accepts Thai with voices `Puck` (A) and `Kore` (B). Only a live call settles it; if two voices sound alike, I stop and tell Silver.
- UNVERIFIED: TTS prices. The script wants both rates as arguments; the ledger for TTS records an estimate from text length and audio length, not a bill. Silver or the PM gives me the rates, or I read them from the console.
- `run-check.ts` charges `--est-usd` to the ledger before a real run, and charges nothing in refuse-fetch mode. Per-run estimates are mine to set once the rates are known.
- Not done in prep: the Definition-of-Done rows for real runs, `call-scribe-test-voices` (folder does not exist yet), the confirmation of TASK-102's `UNVERIFIED` items, `/security-review`. The scripts have no secrets in them (`grep` for the fake key in all output: 0).

### REWORK 1 (2026-11-07, Bob) — answers Silver's four items. Still no real call; cost US$0. Where this differs from the notes above, THIS wins.

Final run: `bash test-prep.sh /workspace/codebases/develyst-ai` → exit 0, `TOTAL failed checks: 0`, scratch folder `gone`. Real repo afterwards: `git status --short` empty; no `api-keys.json`; ports 3961-3967 free. Output saved at `/tmp/claude-1000/prep103b.txt` (a scratch file, not a deliverable).

**1. `run-check.ts` server.** Spawns `process.execPath src/index.ts` (not `bun run start`). Before starting: anything answering on the port → `REFUSING … Nothing was started.`, exit 2. `AUTH_ENABLED=true` always; a random bearer key goes into a temporary `api-keys.json`, refused if one exists, removed on every exit path (exit handler plus SIGINT/SIGTERM), sent on every call. After the job: SIGTERM, then the port must stop answering; if not, `fuser -k` and exit 1. The row now has `provider_asked` and `provider_ran` (from the job's `result.provider` and `model`, for both steps); a difference exits 1 with `MISMATCH`. `--attach` (tests only) uses an existing gateway and owns no server. The `.env` comment is fixed: it is only tested for an `AUDIO_*_PROVIDER` line, never printed or copied (item 4). `--est-basis` is now required, and the row says `ESTIMATE: <basis>`.
**Proof, run before the test's own trap fires:** after the stub run, `curl` on 3961 → `000`, `pgrep -fc src/index.ts` → 0, no `api-keys.json`; the same after a failed gemini run; second run on 3961 reports `provider_ran` `{}` for the refused gemini (no stub answer); busy port (stand-in on 3966) → exit 2, nothing written, the stand-in still the only listener; stand-in that says `stub` when `gemini` was asked → `MISMATCH: asked for gemini, the job says it ran stub,stub`, exit 1.
Not done: I did not mutate the script (e.g. put back `bun run start`) to see the new checks go red, so "these checks catch the old defect" is argued from what they test, not shown. UNVERIFIED — a mutation run would settle it.

**2. `tts-voices.ts` ledger.** Written after each turn, from the measured audio length (25 tokens/s, rates as given) plus text at 1 token per character; limit rechecked before each turn on the ledger as it stands, using that turn's guess (0.15 s per character, called a guess now, not "worst case"). Each paid turn is saved as `turn-NN.wav` in `--work` (a mktemp folder); a retry reuses them without a call. **Proof (stand-in):** failure at call 7 → exit 1, ledger holds 6 `tts-turn` entries (US$0.001721), 6 files kept, no track; retry → `reused, no call` ×6, ledger 12 entries (US$0.003286), both tracks written. All stand-in costs are for ~1-second tones at the real rates, not real speech.

**3. API shape.** Rewritten to the Interactions API as the page's REST tab gives it (I read it by fetch, 2026-11-07, as Silver did): `POST /v1beta/interactions`, `x-goog-api-key`; body `model`, `input:[{type:"user_input",content:[{type:"text",text}]}]`, `response_format:{type:"audio"}`, `generation_config:{speech_config:[{voice}]}`; audio = last of `steps[type=model_output].content[type=audio].data`. The reply is parsed as a WAV: `fmt ` checked (PCM, mono, 24000, 16-bit), the `data` chunk found by walking chunks, never a fixed 44 bytes. **Proof:** the stand-in sends a WAV with an extra `LIST` chunk; both tracks come out `pcm_s16le,24000,1`, 16.75 s each against 16.75 s expected from the turns, exactly one `RIFF` header each (`grep -abo RIFF | wc -l` → 1). `refuse-fetch` log: `https://generativelanguage.googleapis.com/v1beta/interactions`. **`store:false` is sent, as Silver ordered, but the page's single-speaker example does not show it (it appears there only for voice creation):** UNVERIFIED. If the live call answers 400 about it, rerun with `--omit-store` and tell Silver. The adapter is untouched.

**4.** Comment fixed (above). F-017 written (Python replace without asserted matches, plus items 1 and 2).

**Rates and bases.** `--rate-text-in 0.5 --rate-audio-out 9` (Silver, Google's pricing page, valid to 2026-12-31). Estimate basis for each live run is mine to write once the clip length is known; I will not use the 65,536-token cap except for `long`. Usage figures: the script logs a `usage` object if a reply carries one (never the text). Otherwise the ledger stays an estimate and says so.

**Live part, understood, not started:** from the real tree (`cd <repo>` first), scripts by full path, one ledger, limit 1, never `source`/`cat`/copy `.env`; the real `.env` has `AUTH_ENABLED` that may differ, which the script now sets itself. Waiting for Silver's word.

### REWORK 2 (2026-11-07, Bob) — Silver's 3 small items and the 5 pause-handling items. Still no real call; cost US$0.

Final run: `bash test-prep.sh /workspace/codebases/develyst-ai` → exit 0, `TOTAL failed checks: 0`, 108 PASS, scratch folder `gone`. Real repo afterwards: `git status --short` empty, no `api-keys.json`, ports 3961-3969 free. New files in `tests/harness/provider-check/`: `pause.ts`, `stand-in.ts` (extended), `mutate.ts`, `silent-listener.ts`, `mutation-run.sh`.

**The 3 small items.**
1. **Auth proved on.** After `ready()` and before any POST, an unauthenticated `GET /audio/jobs/x` must answer 401, else exit 1 (`auth is not enforced. Nothing was submitted, nothing charged.`); skipped for `--attach` only. The ledger charge now comes directly after this check. Mutation `AUTH_ENABLED: "false"` is now red (exit 1 with that message, no result file, port free, no key file, no process): shown inside `test-prep.sh` itself, on a copy made by `mutate.ts`. The fake `.env` has `AUTH_ENABLED=false`; the stub run still logs `auth check … -> 401`.
2. **Scoped process check.** `gw_procs` counts `/proc/<pid>` whose `cwd` is the scratch gateway dir; no command-line text is matched.
3. **Silent listener.** `fuser <port>/tcp` finding any listener → exit 2 before anything starts. Test: a TCP listener that accepts and never answers on 3968 → exit 2, `REFUSING: something is already listening`, the listener still alive afterwards, no `api-keys.json`.

**The 5 pause items.** `pause.ts` is the shared helper: boot epoch = wall clock − first field of `/proc/uptime`; a move over 2 s = a pause; the ledger keeps `boot_epoch`; a test-only `PAUSE_UPTIME_FILE` points at a fake uptime file. **Limit, as you asked me to say:** this sees a pause only once the guest's wall clock has caught up. It did on the 278 s event, and that one event is all anyone knows. A pause that the clock never catches up with is not seen.
1. **Checked at every step.** `tts-voices.ts`: at start, before each paid call, after each call. `run-check.ts`: at start, before the first call, after submit, on every poll, after each job. Between-runs works through the ledger's epoch.
2. **On a pause: exit 4**, one line with the size of the move, no retry, no further paid call. `run-check.ts` stops its server, removes `api-keys.json`, writes the row `INVALID: paused` (with `where`), and the ledger keeps its charge. The pause is recorded in the ledger; while it is, both scripts refuse (`REFUSING: the ledger records a pause …`, exit 4). **Clearing is yours:** `bun pause.ts clear --ledger <file> --note "<your words and date>"`, which also resets the epoch. I will not run it without your word. Reusing paid turns from `--work` after clearing is tested.
3. **Spend recorded before the call as well as after.** `tts-voices.ts` writes that turn's guess before the call, replaces it with the measured figure after, and if the call fails the guess stays, marked `guess-call-failed`. Ledger writes are a temporary file then a rename. `run-check.ts` already charged first.
4. **Where the money records live.** For live runs, `--ledger` and `--work` go in `call-scribe-test-voices` (path from `machine.local.md`), outside every repo; at the end I remove `--work` by hand, and the ledger is the one extra file beside the 5 kept. test-prep keeps using its scratch folder. This is a rule for how I call the scripts, not something the scripts enforce.
5. **Short before long.** `run-check.ts` refuses a clip over 5 minutes (`ffprobe`) without `--long`, and `--long` needs a `run-finished` entry in the ledger for that provider (≤ 5 min, transcription done). A real run writes that entry only when it finished with no provider mismatch. One `long` per provider and never repeated is a rule for me; the script does not count them. Live order as you wrote it.

**Test evidence (real output from the run above).**
- Fake uptime moved 278 s before a run: `tts-voices.ts` → exit 4, `PAUSED: the boot epoch moved 278 s …`, 0 calls logged (`refuse-fetch`), pause recorded (270 < move < 290); `run-check.ts` → exit 4, nothing started.
- Moved during call 3 of a TTS run: exit 4 after turn 3, ledger holds 3 measured turns and no turn 4, `pause` recorded, no track written.
- A ledger with a pause: both scripts exit 4 with `REFUSING: the ledger records a pause`, no call, nothing started. After `pause.ts clear`: the run completes, `reused, no call` ×3, 12 measured turns.
- Moved during a stub `run-check.ts` poll (stub job 1.5 s, uptime shifted at 0.8 s): exit 4, row `INVALID: paused`, `where` = `poll`, nothing answers on the port, no `api-keys.json`, no process in the scratch gateway dir, ledger file not created.
- Length: a 120 s silent clip passes; a 360 s clip without `--long` → exit 2; with `--long` and no recorded short run → exit 2; with `--long` and a recorded finished short run → passes.
- Failure at turn 7: ledger holds 6 measured turns + 1 `guess-call-failed` (turn 7), total counts the guess; the retry reuses 6, ends with 12 measured + the 1 kept guess.

**Mutations, one defect at a time on a scratch copy (`mutation-run.sh`; red = `test-prep.sh` fails at least one check; the number is its exit code, which equals the failed checks):** `bun run start` back: red (3) · busy-port check off: red (1) · silent-listener check off: red (2) · `AUTH_ENABLED` false: red (12) · auth check off: red (2) · mismatch check off: red (1) · key file left behind: red (18) · poll pause guard off: red (1, after I added a check that the pause is caught in the poll) · run length gate off: red (1) · `--long` gate off: red (1) · TTS guard after the call off: red (33) · TTS guess-before-call off: red (9) · ledger write per turn off: red (5) · ledger-refuses-after-pause off: red (2, after I added a check for the REFUSING wording).
**One mutation stays green: the TTS guard before each paid call.** It is redundant by design: the guard at the start and the one after every call cover the same moments, so removing only this one changes no observable. I kept it as a second line of defence and did not contrive a test for it.
Two slips of mine, caught by the mutation run: my first mutation table counted the scripts' own `FAILED (…)` lines as failed checks and called three green mutations red; counting `FAIL ` lines fixed it, and the three were then tightened as above. The first auth-off test passed for the wrong reason once (`pause.ts` was not copied to the scratch copy, so the copy failed on import); a check on the message text caught it.

**UNVERIFIED:** everything about the live provider, as before; that the guest clock really catches up after a pause beyond the one 278 s event; `store:false` on the TTS call.

### REWORK 3 (2026-11-07, Bob) — Silver's one item: a gateway that stops answering must not hang a paid run. Still no real call; cost US$0.

Final run: `bash test-prep.sh /workspace/codebases/develyst-ai` → exit 0, `TOTAL failed checks: 0`, 117 PASS, scratch folder `gone`. Real repo: `git status --short` empty, no `api-keys.json`, ports 3961-3969 free.

**What changed.** Every `fetch` in `run-check.ts` and `tts-voices.ts` has its own `AbortSignal.timeout`. Limits as you suggested, no reason to change them: **30 s for a poll, 120 s for an upload, a summary POST or a TTS call**; settable with `--poll-limit-s` and `--call-limit-s` so the tests stay quick. The auth check's GET has the poll limit (a timeout there counts as "not 401" and ends the run before anything is submitted). The readiness probe already had 1.5 s.
- **A timed-out poll** is tried again until `--timeout-s`, then ends as `harness_timeout`, exit 1. The pause guard runs on each pass, including right after a timeout. Any other error in a poll (connection reset, gateway died) still ends the run through the exit handler, as you saw.
- **A timed-out POST or TTS call is never retried.** `run-check.ts` prints `FAILED: POST … got no usable answer within N s … Not retried: it may have been billed. The ledger keeps the charge.` and exits 1; `tts-voices.ts` marks that turn's guess `guess-call-failed` and exits 1. The exit handler cleans up as on any other exit.

**Test evidence (real output from the run above).**
- Stand-in that answers `GET /` and the POST but never a job poll (`--attach --timeout-s 3 --poll-limit-s 1`): exit 1, not 124; 3 s elapsed (limit: timeout + one poll limit + slack ≤ 8 s); the job error in the row is `harness_timeout`.
- Stand-in that never answers TTS call 3 (`--call-limit-s 1`): exit 1, `TTS request failed (TimeoutError)`; ledger = 2 measured turns + turn 3's guess marked + nothing for turn 4; no track written.
- Stand-in that never answers the upload POST (`--call-limit-s 1`, run counted as real with `--live-real --attach` against the local stand-in only, so no provider can be reached): exit 1, `Not retried`, within 4 s (so one limit, no retry), ledger 0.5 with one `run` entry.

**Mutations (one at a time, `mutation-run.sh`):** poll fetch without its signal: red (2; the run took 24 s, the test's `timeout 40` did not fire but the elapsed check did) · upload POST without its signal: red (2; `timeout` killed it, exit 124) · TTS fetch without its signal: red (2; exit 124).

**A slip of mine, found by this test and fixed:** my fake uptime file for the pause tests was a fixed number while the wall clock kept moving, so any run longer than about 2 s looked like a pause (the hung-poll test exited 4). The fake file now carries the wall-clock time it was written and advances in real time like a real uptime; only a deliberate shift moves the epoch. This was a test-harness bug, not a bug in `pause.ts` on a real `/proc/uptime`.

**UNVERIFIED, unchanged:** the live provider; `store:false`; that the guest clock catches up after a pause beyond the one 278 s event. Also not done: the 30 s / 120 s limits have not been tried against a real slow provider reply (an hour-long `long` job is polled with 30 s limits, so each poll is short).

### REWORK 4 — RE-SIZE (2026-11-07, Bob) — the owner's limits: US$0.50, small models, no DeepSeek. Still no real call; cost US$0.

Final run: `bash test-prep.sh /workspace/codebases/develyst-ai` → exit 0, `TOTAL failed checks: 0`, 132 PASS, scratch folder `gone`. Real repo: `git status --short` empty, no `api-keys.json`, ports 3961-3969 free.

**1. Models named.** `run-check.ts` needs `--transcribe-model` and `--summary-model` for a non-stub provider (one missing, or none → `REFUSING`, exit 2) and passes them as `AUDIO_TRANSCRIBE_MODEL` and `AUDIO_SUMMARY_MODEL`. A job's `result.model` that differs from what was asked exits 1 with `MISMATCH … transcription model m (asked stt), summary model m (asked grok-4.3)`. Live values as you wrote them: Gemini `gemini-3.5-flash-lite` for both; xAI `--transcribe-model stt --summary-model grok-4.3`. Tested on stand-ins: a stand-in reporting `m` → exit 1; one reporting exactly `stt` and `grok-4.3` → exit 0. The `MG`/`MX` flag sets in `test-prep.sh` are those same values.
**2. Ceiling in the code.** `MAX_LIMIT_USD = 0.5` at the top of `pause.ts`; both scripts refuse `--limit-usd 0.6` (exit 2, `above the owner's ceiling`). All the test runs now use 0.5. Also added from your rule 4: `--long` is refused unless the ledger is at or under `LONG_MAX_LEDGER_USD = 0.25` (a ledger at 0.3 with a finished short run → exit 2).
**3. Allow-list on the gateway process.** New preload `allow-hosts.ts`: any host except `generativelanguage.googleapis.com`, `api.x.ai`, `localhost` and `127.0.0.1` is refused and logged. `run-check.ts` always starts the gateway with `--preload` on it, and **proves it loaded**: the preload writes `LOADED` to a per-run log, and `run-check.ts` exits 1 before anything is submitted if that line is missing. Each row has `allow_list_refused` (a count). **Test with `DEFAULT_PROVIDER=deepseek`, no provider named in the request, `refuse-fetch.ts` loaded from the repo's `bunfig.toml` and `allow-hosts.ts` from the command line:** `POST /chat` answered `{"success":false,"error":"refused by allow-hosts.ts: api.openai.com"}`. Allow-list log: `REFUSED host=api.deepseek.com https://api.deepseek.com/chat/completions` and `REFUSED host=api.openai.com …`. `refuse-fetch`'s log: only `api.x.ai/v1/chat/completions` and `generativelanguage.googleapis.com/…gemini-3.8-flash:generateContent` (the fallback chain reached them). So DeepSeek and OpenAI were stopped by the allow-list before `refuse-fetch` saw them, and the order of the two preloads is right. (The log shows the gateway's own chain default `gemini-3.8-flash`; that is `/chat`, not the audio path, and no key was real.)
**Forced failure.** `gemini` and `xai` runs under `refuse-fetch`: both exit 1 as failed jobs; their rows show `allow_list_refused` 0 and 0; every logged outbound call is `generativelanguage.googleapis.com` or `api.x.ai` (0 lines for any other host).
**4. Order and stop lines for live — noted, not code:** voices; Gemini `clean`, `leak`, `reference`; xAI the same; `--no-summary` on all but `clean`. If Flash-Lite does not label speakers, or `speaker_count` is not 2 on `clean`, I stop that provider and tell you; I do not move up a model. One `long`, which you name, only if the ledger is at or under 0.25 (the script now refuses otherwise). `--timeout-s 1900` on `long`.
**5. Estimates:** at live time I set `--est-usd` per run from the SPEC-101 Q9 rates, write in `--est-basis` that thinking tokens are not known, and correct later estimates from the measured output of `clean`. Nothing to build.

**Mutations (one at a time, `mutation-run.sh`):** ceiling raised to 5: red (2) · models not required: red (3) · model-mismatch check off: red (1) · allow-list not passed to the gateway: red (17; it is caught by the LOADED proof, not by luck) · allow-list lets DeepSeek through: red (2) · `--long` ledger cap off: red (1) · `--long` needs-a-short-run gate off: red (1).
**A slip of mine, caught by reading the table:** my first run of the allow-list-off mutation came back red, but only through a timing check in an unrelated test. `test-prep.sh` started its own allow-listed gateway for the DeepSeek test and never tested the one `run-check.ts` starts. I added the `LOADED` proof and the row field, and reran: now red for the right reason.
Also fixed: the mutation `long-needs-short-run` had stopped applying (its text now occurs twice); I made it specific.

**UNVERIFIED, unchanged:** the live provider, the TTS request shape, `store:false`, any pause beyond the one 278 s event; also that `gemini-3.5-flash-lite` and `grok-4.3` accept these requests (I name them; the gateway passes the names through).

## Questions
(Bob asks; Silver answers as `> answer: …`.)

## Review
**Prep: REWORK.** Silver, 2026-11-07. Still no real call of any kind. Good work overall: your slips list is what made this review quick, the guards refuse as claimed, and I reran `test-prep.sh` (`TOTAL failed checks: 0`). The scorer and `make-variants.sh` pass my reading unchanged, apart from item 3. The first two items are defects that a green test could not see, because `test-prep.sh`'s trap clears the ports itself. **Item 1 was partly my miss:** F-015 was in the log when I cut § Prep, and I did not carry it (F-016).

**1. `run-check.ts` leaves its server running, and the next run reports the wrong provider.** Ran on a scratch clone, fake keys, port 3964:
- Run 1, `stub`: exit 0, then `listeners on 3964: 1`, bound `*:3964`, `GET /` 200.
- Run 2, `--provider gemini`, same port: exit 0, row `"provider": "gemini"`, `transcription_status: done`, outbound 0, and the job's own `result.provider` was `stub`.

With real keys, that is a table row naming the wrong provider, and a gateway left up on every interface with auth off, able to spend. Fix all of these, and prove each by running it:
- **Stop it for real.** `bun` is a shell wrapper here (F-015), and `bun run start` adds a child. Spawn `process.execPath` with `src/index.ts` directly. After stopping, check the port no longer answers; if it does, stop it and exit non-zero.
- **Refuse a busy port.** Before starting, if anything answers on the port, exit non-zero and start nothing.
- **Report what actually ran.** Take `provider` and `model` in the row from the job's `result`. A mismatch with `--provider` exits non-zero.
- **Auth on, not off.** Pass `AUTH_ENABLED=true` explicitly, since the real `.env`'s value differs from `.env.example` and may be off. Write a temporary `api-keys.json` with a random key, refusing if one exists and removing it at the end, on every exit path, as `audio-run-all.sh` does. Send the bearer key on every call. `api-keys.json` is git-ignored; this is the one file you may create in the real repo during live runs.

**2. `tts-voices.ts` loses paid turns from the ledger.** `spentEst` is written only after all 12 turns succeed. A failure at turn 7 exits 1 with the ledger unchanged, so 6 paid turns vanish and a retry passes the limit check on a false total. Write the ledger after **each** turn. Recheck the limit before each turn, using that turn's estimate; 0.15 s per character is your guess and no bound on Thai, so stop calling it "worst case".

**3. `tts-voices.ts` uses the wrong API shape for this model, and would corrupt the audio.** Google's speech page, read 2026-11-07 (`aistudio.google.com/docs/speech-generation`; `ai.google.dev` redirects there). Every example is the Interactions API. Docs only, `UNVERIFIED` until a live call:
- `POST https://generativelanguage.googleapis.com/v1beta/interactions`, with your header for the key. Body: `model`; `input` as one `user_input` item whose `content` holds the text; `response_format: {"type":"audio"}`; `generation_config.speech_config: [{"voice":"Kore"}]`. Read the exact field nesting on the page's REST tab; I hold a summary of it, not the verbatim block. Add `store: false`: the default stores it (55 days on the paid tier), and nothing needs it.
- Reply: base64 at `[.steps[] | select(.type=="model_output") | .content[] | select(.type=="audio")] | last | .data`.
- **A unary reply is a complete WAV with a RIFF header (24 kHz, mono, 16-bit)**, while your `speak()` treats it as raw PCM and adds a second header, so the first header would play as noise and durations would be off. Parse the `data` chunk; do not assume 44 bytes.
- This does not reopen TASK-102's ruling: that kept `generateContent` for the gateway's own transcription adapter. This is a harness script calling a different model. Do not change the adapter.
- Confirmed from the page: Thai on `gemini-3.8-flash-tts`, not on Flash-Lite; voices `Puck` and `Kore` exist. Whether they sound clearly different in Thai still needs a live call.

**4. Small.** `run-check.ts:9` says `.env` is "never read"; line 47 reads it for the guard. Fix the comment. Your Python replace without an asserted match broke `PROTOCOL.md` § Editing files, even with the read-back: add your own FAILURES entry.

**Answers to your questions.**
- **TTS rates,** Google's pricing page, read 2026-11-07, `gemini-3.8-flash-tts`: `--rate-text-in 0.5 --rate-audio-out 9`, valid through 2026-12-31 (they double on 2027-01-01). Audio is 25 tokens per second, as documented for this model, so your 25 was right. A 2-minute voice set is about 2.7 US cents of audio (arithmetic, nothing run).
- **Usage figures:** the pages I read document no usage field in the reply. Log token counts if one appears, and never the text. The ledger stays an estimate, labelled as one; read the console if the owner gives access, otherwise say so.
- **`--est-usd`:** yours to set; write the basis for each in the notes. Do not use the 65,536-token output cap as every run's estimate: at $3.75 per 1M that is about 25 cents a run, and it would use up the limit on paper. Use it only for `long`, which runs last.

**Add to `test-prep.sh`, so these cannot pass silently again:**
- A second `run-check.ts` run on a busy port exits non-zero; after any run, with the script's own trap not yet fired, nothing answers on the port.
- A stand-in `fetch` returning the documented reply shape, with a real small WAV: both tracks come out valid (`ffprobe`: 24 kHz, mono, durations add up), and exactly one RIFF header in each.
- The stand-in failing at turn 7: exit 1, and the ledger holds 6 turns.
- A job whose `result.provider` differs from `--provider`: exit non-zero.
- No `api-keys.json` left after a run, including a failed one.

**Live part, for when it clears (not now).** Run from the real tree so Bun loads the keys itself: `cd <repo>` first, then call the scripts by full path. Never `source`, `cat` or copy the file. One ledger across voices and runs, and ~~limit 1~~ limit 0.5 throughout (owner via Atom 2026-11-07 03:49; § Review, "Re-size"). Live stays blocked until I say.

**Rework 1: REWORK, 3 small items. Everything else passes and is not reopened.** Silver, 2026-11-07. Still no real call.

Your four items are done. You flagged that the checks were never shown to go red, so I ran that: `test-prep.sh` on a scratch copy of the scripts, one defect put in at a time, against what the unmutated copy did on the same box (it failed the 2 `pgrep` checks in item 2 below):

| Defect put in | Result |
|---|---|
| `spawn("bun", ["run","start"])` back | red: `stub run exit 0` |
| Busy-port check removed | red: `busy port → exit 2` |
| Mismatch check removed | red: `mismatch → exit 1` |
| No ledger write per turn | red: 5 more failures, including `ledger holds the 6 paid turns` |
| WAV reply not parsed | red: `exactly one RIFF header` (7 found) |
| `api-keys.json` left behind | red: 6 more failures, including `no api-keys.json` |
| **`AUTH_ENABLED: "false"` in the spawn** | **stays green: nothing new fails** |

Items:
1. **Nothing proves auth is on.** This is the gap the table shows. The client sends a bearer key either way, so a gateway with auth off passes everything. The real `.env`'s `AUTH_ENABLED` differs from `.env.example`, so this is the case that matters. **In `run-check.ts`,** after `ready()` and before the first `POST`: an unauthenticated `GET /audio/jobs/x` must answer 401; anything else exits non-zero before a job is submitted. Skip it for `--attach` only. **Move the ledger charge to directly after this check,** so a run stopped here charges nothing. Add a `test-prep.sh` check that the fake `.env`'s `AUTH_ENABLED=false` does not switch it off, and show the auth-off mutation going red.
2. **`pgrep -fc "src/index.ts"` searches the whole box** (`test-prep.sh:126,137`). It failed in my run because something outside the test matched, most likely my own shell's command line, which contained that text. Jason's back also runs a `src/index.ts`, so on this shared box it would fail falsely. Scope it to this test: a process whose `/proc/<pid>/cwd` is the scratch gateway dir, without matching your own shell.
3. **The busy-port check only sees a server that answers HTTP.** A listener that does not answer in 1.5 s passes it, the gateway then fails to bind, and the exit handler's `fuser -k` kills **that other listener**, which may belong to another role. Refuse if `fuser <port>/tcp` finds any listener too. Add a check: a silent TCP listener on the port → exit 2, and it is still alive afterwards.

**Accepted as they are:** `store: false` with `--omit-store` as the fallback; the turn reuse in `--work`; `--est-basis`; `--attach` for tests only. F-017 is in the file. The request shape stays `UNVERIFIED` until a live call; the first turn tells us, at about a quarter of a US cent for a 10-second turn by arithmetic, so no further desk check is needed.

When these pass, I set prep `DONE` without re-reading the rest. Live still waits for the owner's own word.

**Added 2026-11-07 02:20, Silver: the box can pause (PM's request, SPEC-101 Q9, PM 02:15).** New work, not a defect in yours. Finish the 3 items above first, then these; one `REVIEW` for all of it. `SYSTEM-FACTS.md`: this box is a KVM guest, and Atom's diagnosis is a host pause, about 5.8 h overnight and about 280 s at about 02:00; `uptime -s` moved 278 s (PM checked). It cannot be prevented from inside, so the scripts must notice it and stop spending.

**How to detect.** Boot epoch = wall clock − first field of `/proc/uptime`. It should not change. I ran it on this box, 2026-11-07, 80 samples over 20 s: noise ±0.006 s. **A move of more than 2 s = a pause.** Share one small helper, `provider-check/pause.ts`; a test-only env var may point it at a fake uptime file. **Limit, say it in your notes:** this sees a pause only once the guest's wall clock has caught up. It did on the 278 s event; that one event is all I know.

1. **Check at every step.** Keep the boot epoch in the ledger. Before any paid call, compare with the ledger's value, so a pause between two runs counts too. Check again after each call, and in `run-check.ts` on each poll.
2. **On a pause: stop.** Exit code `4`, one line with the size of the move, no retry, no further paid call. `run-check.ts` still stops its server and removes `api-keys.json`. The row says `INVALID: paused` and its timing is not used. The ledger keeps its charge, since a request already sent may be billed anyway. **Any restart after exit 4 is my decision.** Write it in `## Questions`; until I clear it, the scripts refuse to spend on a ledger with a pause recorded. Reusing paid turns from `--work` is fine once cleared.
3. **Record spend before the call as well as after.** You now write after each turn; a pause or death mid-call would leave a billed call unrecorded. `tts-voices.ts`: write that turn's guess before the call, and replace it with the measured figure after. If the call fails, the guess stays in the ledger, marked as such. `run-check.ts` already charges first. Write the ledger to a temporary file, then rename.
4. **Where the money records live.** A temp folder may not survive. For live runs the ledger and `--work` go in `call-scribe-test-voices`, outside every repo. At the end, `--work` is removed, and the ledger is the one extra file allowed beside the 5 kept. Say so in the notes; test-prep keeps using its scratch folder.
5. **Short before long.** `run-check.ts` refuses a clip over 5 minutes (`ffprobe`) unless `--long` is passed, and `--long` also needs the ledger to show a finished short run for that provider. Live order: voices, then `clean`, `reference` and `leak` for one provider, the same for the other, then `long`, only if the limit still covers it. **`long` is the most exposed run: an hour of job time, on a box that has paused for 280 s.** One `long` per provider, never repeated, and a job lost to a pause is reported as lost.

**Add to `test-prep.sh`:** a fake uptime moved 278 s before a run → exit 4, no call logged · moved during a TTS run → exit 4 after that turn, ledger holds it, no further call · moved during a stub `run-check.ts` poll → exit 4, row `INVALID: paused`, port free, no `api-keys.json` · a pause recorded in the ledger → the next run refuses · a 2-minute silent clip passes the length check; a 6-minute one is refused without `--long`, and also with `--long` when no short run is recorded · failure at turn 7 → ledger holds 6 turns plus 1 marked guess. Then the mutation for each guard goes red, as in the table above; you can use the `mutate.ts` you already have there.

**Rework 2: REWORK, one item. All 8 items above pass.** Silver, 2026-11-07. Still no real call. I said I would mark prep `DONE` without re-reading once the 3 items passed; the pause work reopened these files, so I read them, and found this. It is a new finding, not something you missed from my list: I never asked for it.

Rerun on a scratch copy: `test-prep.sh` 108 passes, 0 failed. I accept the one green mutation: only a file write sits between "after call N" and "before call N+1". Two more mutations of mine both went red: threshold raised to 100000, 17 failed; ledger's epoch ignored, 4 failed. Gateway killed mid-poll: run-check exit 1, key file gone, port free. Run from the repo folder with no key in the shell, `tts-voices.ts` reached the call using the fake key from `.env`, with the key not printed. So the live instruction holds.

**The item: a gateway that stops answering hangs the run for good.** Ran with a stand-in that answers `GET /` and the `POST`, then never answers a job poll: `--timeout-s 5 --attach`, still stuck at 25 s, stopped by my `timeout` (exit 124). `--timeout-s` is only checked between requests, and no `fetch` has a limit of its own. On a box that freezes, and with TASK-112's hang still unexplained, that would be a paid run stuck with the keys loaded and nobody told.
- **Every `fetch` in `run-check.ts` and `tts-voices.ts` gets its own limit** with `AbortSignal.timeout`: 30 s for a poll, 120 s for an upload or a TTS call. Your choice if you have a reason; say it in the notes.
- **A timed-out poll** tries again until `--timeout-s`, then ends as `harness_timeout`, exit 1. Run the pause guard on each pass, including after a timeout.
- **A timed-out `POST` or TTS call is never retried automatically:** it may have been billed. It ends the run with a non-zero exit, and the ledger keeps the charge or guess. The cleanup runs as on any other exit.
- **Tests in `test-prep.sh`:** a stand-in that hangs on the job poll → exit 1 within `--timeout-s` plus one poll limit, with the row saying `harness_timeout` · one that hangs on the TTS call → non-zero, the turn's guess kept, no further call. Make the limits settable for the test so it stays quick. Show the mutation going red for each.

When this passes, I check that one thing and set prep `DONE`. Live still waits for the owner's own word.

**Prep: DONE.** Silver, 2026-11-07. Built and proven on stand-ins and refused calls only. **The live part is not done and not cleared**, and nothing here says any real provider behaves as the scripts expect.

Rerun on a scratch copy: `test-prep.sh` 117 passes, 0 failed. My own hang probe, the one that stuck before: `--timeout-s 5 --poll-limit-s 2` → exit 1 after 7 s, `harness_timeout`. Default 30 s poll limit with `--timeout-s 3` → exit 1 after 30 s, one poll limit, as designed. Outbound 0, ports free, no `api-keys.json`, repo untouched. Your fake-uptime slip was a test bug, as you said; `pause.ts` on the real `/proc/uptime` is unchanged. I did not rerun your 3 limit-removal mutations; I read the table and the code, and my probe covers the poll.

**Still unproven, by design until live:** the TTS request shape, `store:false`, Thai in distinct voices, TASK-102's 12 items, and any pause beyond the one 278 s event.

**One note for live, not a change now:** `--timeout-s` defaults to 1800, the same as the gateway's `AUDIO_JOB_TIMEOUT_MS`, so the two would race on `long`. Pass `--timeout-s 1900` for `long`, so the gateway's own answer is the one you report.

Do not start the live part. I tell you when the owner's own word is in.

**Re-size, added 2026-11-07, Silver. New limits from the owner, not a defect in yours.** `DECISIONS.md` 03:49: *"ใช้แค่โมเดลเล็กๆ เพื่อทดสอบ … ใช้ ครึ่งดอล พอ"*, *"อย่าเพิ่งใช้ deepseek นะ"*. US$0.50, small models, no DeepSeek. Still no real call. Sizing and the model table: SPEC-101 Q9, answer 2026-11-07.

**The defect this exposes, which I found by reading:** `run-check.ts` sets no model, and the gateway's default is the **medium** tier (`src/audio/gemini.ts:179,218`, `xai.ts:78`). As written, a live run would quietly use the bigger model.

1. **Name the models.** `run-check.ts` takes required `--transcribe-model` and `--summary-model` for a non-stub provider and passes them as `AUDIO_TRANSCRIBE_MODEL` and `AUDIO_SUMMARY_MODEL`. Live values: Gemini `gemini-3.5-flash-lite` for both; xAI `--summary-model grok-4.3`, and `--transcribe-model stt`, since the adapter ignores it and reports `stt`. **A job's `result.model` that differs exits non-zero**, as with the provider. I ran the env on a clone: the logged Gemini URL carried `models/gemini-3.5-flash-lite`.
2. **Ceiling in the code.** Both scripts refuse `--limit-usd` above `0.5`, a constant at the top of `pause.ts`. The owner raises it, not a flag.
3. **Allow-list on the gateway process.** New preload `provider-check/allow-hosts.ts`: any host other than `generativelanguage.googleapis.com`, `api.x.ai` and localhost is refused and logged. `run-check.ts` always starts the gateway with `--preload` on it. This covers DeepSeek and everything else.
4. **Order and stop lines for live.** Voices, then Gemini `clean`, `leak`, `reference`, then xAI the same, with the summary on `clean` only (`--no-summary` on the others). **If Flash-Lite does not label speakers, or its `speaker_count` is not 2 on `clean`, stop that provider and tell me: do not move up a model.** Then at most **one** `long`, which I name after reading the short rows, only if the ledger is at or under 0.25.
5. **Estimates.** `--est-usd` per run from the rates in the SPEC's table, with thinking tokens not known: say so in `--est-basis`, and use the measured output of `clean` to correct the later ones.

**Add to `test-prep.sh`:**
- Limit `0.6` → refused, both scripts.
- No model named for a non-stub provider → refused. A stand-in that reports another model → exit non-zero.
- Gateway under `allow-hosts.ts` with `refuse-fetch.ts` beneath it and `DEFAULT_PROVIDER=deepseek`: `POST /chat` is refused by the allow-list, and **`api.deepseek.com` does not reach `refuse-fetch`'s log**, so the allow-list caught it first. Gemini and xAI hosts do reach it.
- `gemini` and `xai` runs under forced failure: 0 attempts at any other host.
- Each guard's mutation goes red.

When these pass, I check them and prep is `DONE` again.

**Prep after re-size: DONE.** Silver, 2026-11-07. Built and proven on stand-ins and refused calls only. **The live part is not done and not cleared.** Porter accepted all 5 defaults in SPEC-101 Q9.

Rerun on a scratch copy: `test-prep.sh` 132 passes, 0 failed. Repo untouched, no `api-keys.json`. I read your mutation table and the changed code; I did not rerun your 7. The `LOADED` proof is better than what I asked for: it tests the gateway `run-check.ts` actually started, and you found that gap yourself.

**One known test gap, accepted, not a rework:** I removed the line in `run-check.ts` that passes `AUDIO_TRANSCRIBE_MODEL` and `AUDIO_SUMMARY_MODEL` to the gateway, and `test-prep.sh` stayed green (0 failed), because no stand-in run reaches a model. The line is there today (`run-check.ts:122`), and I saw the gateway honour that env on 2026-11-07. If it ever broke, the gateway would use its medium tier for one job, and the `result.model` check would stop the run. Cost about 2 US cents by arithmetic, and it would break the owner's small-models rule for that one call. **So on the first live job, read `result.model` before going further.**

**Also unproven until live:** whether `gemini-3.5-flash-lite` and `grok-4.3` accept these requests, whether Flash-Lite labels speakers, the TTS shape, `store:false`, and Google's upload URL staying on an allowed host. If it does not, the allow-list refuses it, the run fails with `allow_list_refused` above 0, and you tell me; do not widen the list.

Do not start the live part. I tell you when the owner's own word is in.
