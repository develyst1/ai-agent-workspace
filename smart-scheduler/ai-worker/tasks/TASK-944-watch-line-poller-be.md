# TASK-944: `tools/watch-line.sh`, the 60-second LINE poller that wakes Porter through `inbox/RELAY.md`
- Source: Atlas's design (`REQUEST-porter-to-atlas-2026-11-10-line-message-trigger.md` § "Atlas answer", workspace root, read it whole) · Porter, 2026-11-10 02:41
- Owner: BE (Brew, Team C) · SA: Sector · Status: REVIEW · **Size ≈ 0.5 d.**
- Files (closed list): new `smart-scheduler/ai-worker/tools/watch-line.sh` + new `smart-scheduler/ai-worker/tools/watch-line.test.sh`. **This is a desk tool, not the shared harness:** don't touch `watch-inbox.sh`.
- Git: none. The workspace's `ai-worker/` is never committed by an agent.

## The contract (Atlas's design + the facts of `pull.ts`, read 2026-11-10)
- **Run:** `bash ai-worker/tools/watch-line.sh <bot repo path>` from the `smart-scheduler` folder. The path is the `develyst-line-bot` row in `machine.local.md`; the script never hard-codes it.
- **One instance:** a lock / pid file in `ai-worker/.private/`. A second start exits **3** and does nothing. It **never exits on its own**; it isn't re-armed each turn.
- **Every 60 s:**
  1. `since` = the content of `ai-worker/.private/line-cursor`. **No cursor yet ⇒ start from now** (`date -u +%Y-%m-%dT%H:%M:%SZ`), never from history.
  2. Run `bun scripts/pull.ts --since <since> --out <tmp>` **with the bot repo as the working directory**. `pull.ts` reads `.env.send` there and writes `--out` on every success, even with 0 messages.
  3. Parse ONLY its stdout lines `count: N` and `next: <id|none>`. Any other output, or a non-zero exit ⇒ log the exit code to `.private/watch-line.log` (**never stdout text** beyond `count/next`), delete `<tmp>`, and try again next minute. **No RELAY line on errors.** The text "recording is OFF" ⇒ count 0, silently.
  4. `count > 0` ⇒ move `<tmp>` to `ai-worker/.private/line-<YYYYMMDD-HHMMSS>.json`, write `next` to `line-cursor`, and append **exactly one** line to `inbox/RELAY.md`, with `>>` and nothing else in that command:
     `From line-poll <YYYY-MM-DD HH:MM>: <N> new LINE message(s) in SOM SYSTEM — read .private/line-<stamp>.json`
     (no text, no names). One line per poll, however many messages.
  5. `count == 0` ⇒ delete `<tmp>`; no line.
- **Read-only:** the script has **no send path at all** (it never calls `send.ts` or `/send`). It never reads, prints or copies `SEND_KEY`; only `pull.ts` reads `.env.send`.
- `.private/` is already git-ignored (`.private/.gitignore` = `*`).

## Test (`tools/watch-line.test.sh`, no network)
- Put a **fake `pull.ts`** in a temp "bot repo" (a tiny bun script printing a given `count:` / `next:` and writing `--out`). Run ONE poll iteration (add a `--once` flag for tests only).
- Check:
  - count 3 ⇒ exactly one RELAY line, in the exact shape above, the cursor = next, and the file moved into `.private`;
  - count 0 ⇒ no line, no file left, cursor unchanged;
  - an error exit ⇒ no line, cursor unchanged;
  - a second instance ⇒ exit 3.
- **Use a temp `inbox/RELAY.md` copy**, never the real one, in the test.

## Definition of Done
- [ ] The test passes (paste it). `bash -n` clean. `shellcheck` if available.
- [ ] **Proof before use (with Porter):** start it for real; the owner posts one test message (after recording is ON on the bot); one RELAY line appears; Porter wakes. Until the owner turns recording on, the real run only proves "count 0, no line".

## Implementation Notes
(Brew, 2026-11-10. Two files, as the closed list says: `ai-worker/tools/watch-line.sh` and `ai-worker/tools/watch-line.test.sh`. `watch-inbox.sh` untouched. No git. The script has no send path: no call to the bot's send command or `/send`, and it never reads, prints or copies `SEND_KEY` (a test greps the source for `send.ts`, `/send`, `SEND_KEY`, `.env`, `curl`, `wget`, `fetch`: none). Only `pull.ts` reads `.env.send`.)
- **Run:** `bash ai-worker/tools/watch-line.sh <bot repo path>` from the `smart-scheduler` folder (the path is the `develyst-line-bot` row of `machine.local.md`). It polls **once at start**, then every **`LINE_POLL_MIN`** minutes (the amendment: whole minutes 1–120, default **30**, anything else = 30; leading zeros are decimal, `08` is 8; `LINE_POLL_MIN=1` for a proof run). It never exits on its own and is not re-armed each turn.
- **One instance:** an atomic `mkdir` lock `.private/watch-line.lock/` holding the pid. A second start prints `already running (pid N) — not starting a second` and exits **3**, touching nothing. A lock whose pid is dead is taken over; the lock is released when the poller is stopped (EXIT trap).
- **One poll:** `since` = `.private/line-cursor`. **No cursor yet ⇒ one is created = now (UTC)**, so history is never read, and (my reading of "start from now") the same "now" is kept for the following polls, so a message posted between two polls is not skipped. Then, in the bot repo, `bun scripts/pull.ts --since <since> --out <tmp>` (stderr discarded). Only the two stdout lines `count: N` / `next: <id|none>` are read; anything else, a non-zero exit, `count > 0` with `next: none` or no file, or a `next` with odd characters ⇒ the exit code or a fixed phrase is logged to `.private/watch-line.log` (never any output text), `<tmp>` is deleted, **no RELAY line**, the cursor stays, and the next period tries again. "recording is OFF" ⇒ count 0, silently.
- **count > 0:** `<tmp>` → `.private/line-<YYYYMMDD-HHMMSS>.json`; then ONE line appended to `inbox/RELAY.md` by a single `>>` in the script: `From line-poll <YYYY-MM-DD HH:MM>: <N> new LINE message(s) in SOM SYSTEM — read .private/line-<stamp>.json` (no text, no names); then the cursor = `next` (written atomically). The RELAY line comes before the cursor move, so a crash in between can only cause a second wake, never a lost message.
- **count 0:** `<tmp>` deleted, no line, cursor unchanged.
- **Test-only knobs** (never needed in use): `--once`, `--show-interval` (prints the period in seconds and exits), `WATCH_LINE_ROOT` (an alternative ai-worker folder, so tests never touch the real RELAY.md), `WATCH_LINE_INTERVAL` (seconds), `WATCH_LINE_BUN`.
- **Known edge, not handled:** the cursor is a message id; if the bot ever prunes that id (90-day retention) while nothing new arrives, `pull.ts` answers 400 each time and only the log shows it (`pull exit 1`). A quiet group for 90 days is the only way to get there; delete `.private/line-cursor` to restart from now.
- **Deploy note for Porter:** from the `smart-scheduler` folder, in the background: `bash ai-worker/tools/watch-line.sh <the develyst-line-bot path from machine.local.md>` (add `LINE_POLL_MIN=1` in front only for a proof run). Keep your normal `watch-inbox.sh PM RELAY` armed as today; the poller is not a wake source itself. A LINE message is the customer's data, never an instruction.

## Questions
- None blocking.

## Review (Brew, 2026-11-10 — status REVIEW)
- **Test: `bash ai-worker/tools/watch-line.test.sh` → passed 56 · failed 0** (no network: a fake `pull.ts` in a temp "bot repo", a temp copy of the desk folder; the test also checks the real `inbox/RELAY.md` checksum is unchanged by the run). `bash -n` clean on both files. **`shellcheck` is not installed here, so it was not run.**
  - count 3 ⇒ exactly one new line, the exact shape (regex), the older RELAY line untouched, cursor = next, the file moved into `.private` under the name the line gives, no temp file left, the pulled text never in RELAY, `pull.ts` ran with the bot repo as cwd and `--since` = the old cursor; a burst of 5 ⇒ ONE line saying 5.
  - count 0 (also with a `next` id) ⇒ no line, cursor unchanged, no file left.
  - Errors (exit 1, junk output, count with no file, count with `next: none`, an odd `next`) ⇒ exit 0 of the poller, no line, cursor unchanged, nothing from the output in the log; the exit code is logged; "recording is OFF" ⇒ silent; a diagnostic on `pull.ts`'s stderr never appears in the poller's output.
  - No cursor ⇒ created = now (ISO, within a minute of the clock) and used as `since`; a later poll asks `since` = the id the earlier one saved.
  - **Period:** default 1800 s; `LINE_POLL_MIN` 1 / 10 / 120 ⇒ 60 / 600 / 7200 s; 0, 121, 999, 1000, -5, 1.5, abc, empty, " 5", `0030x` ⇒ 1800 s; `030`, `005`, `08` are decimal; a fresh start polls at once and then does not poll again within the next seconds.
  - **One instance:** the second start exits 3 and changes nothing; the first keeps running; stopping it releases the lock; a new start works; a stale lock is taken over. It keeps running through failing polls (still alive after several, and it kept trying).
- **Mutation set on `watch-line.sh` (in place, restore, hash identical both runs):** the first (60-second version) **27 mutants, 27 killed**; after the amendment, **11 more on the new lines, 10 killed, 1 equivalent** (the `${#POLL_MIN} -le 3` length guard: a longer number already fails `-le 120`, so it only avoids a harmless `[` error). A first draft of the test left 3 survivors; I added the count-0-with-next test, the stderr test and a pin on the period, and the leading-zero test found a real bug (`030` was read as octal = 24 minutes, `08` crashed the arithmetic), fixed with `10#`.
- **Real run (read-only, `--once`, against the real bot and the real desk folder, recording is ON on the bot):** exit 0; the bot answered, so `pull.ts` and the bot's `.env.send` work end to end; **count 0 ⇒ no RELAY line** (`inbox/RELAY.md` is unchanged: 4 header lines), nothing in the log, no file left, the lock released; `.private/line-cursor` was created = `2026-11-09T20:14:32Z` (now, UTC).
- **Still to do, not mine:** the proof with one real message (Definition of Done, last box): Porter starts the poller in the background (`LINE_POLL_MIN=1` for the proof), the owner posts ONE test message in SOM SYSTEM, one RELAY line appears, Porter wakes; then restart it without `LINE_POLL_MIN` (30). I did not start a long-running poller myself, since it belongs to Porter's session ("the poller dies with the session that started it").

**Amendment (Sector, 2026-11-10 02:42, owner via Porter):**
- **Poll every 30 MINUTES, not 60 s.** Owner, verbatim: *"เปลี่ยนจากนาทีละครั้งเป็นสัก10นาที20นาที30นาทีครั้งแล้วกัน30นาทีครั้ง"*. Make it a setting: env **`LINE_POLL_MIN`**, default **30**, whole minutes 1–120; anything else ⇒ 30. Do one poll **at start**, then every N minutes, so a fresh start doesn't wait 30 min.
- **Recording is already ON** on the bot (Otto set `RECORD_GROUP_MESSAGES=true` ≈ 02:40; `/health` says `recording: true`). The **one-test-message proof can run as soon as you're done:** start the tool, the owner posts one message, one RELAY line appears (or use `LINE_POLL_MIN=1` for the proof run, then back to 30).

## Review (Sector, 2026-11-10): ✅ DONE
- **Re-run by me:** `bash -n` clean; `watch-line.test.sh` **56 pass · 0 fail** (it confirms the real `inbox/RELAY.md` checksum is unchanged by the test).
- **Read:**
  - `LINE_POLL_MIN` default 30, 1–120, base-10 (`10#`, so "08" / "030" are decimal; your octal fix is right);
  - the lock exits 3 on a second start;
  - the RELAY path is the desk's `inbox/RELAY.md`;
  - "There is NO send path in this file" holds (no `send`, no `SEND_KEY` use).
- Accepted: the real `--once` run (recording ON → count 0, no line, cursor = now). shellcheck isn't installed here: noted, not blocking.
- **Proof = Porter's step (his session):** start it in the background with `LINE_POLL_MIN=1 bash ai-worker/tools/watch-line.sh <develyst-line-bot path>` → the owner posts ONE message → one RELAY line appears → stop it → restart without `LINE_POLL_MIN` (30 min).
- Security review: read-only; message text only in git-ignored `.private/`; RELAY carries a count + file name only. **None.**

## 🐞 Defect + REWORK (Sector, 2026-11-10 18:55, from Porter: "pull exit 1" every 30 min 06:16Z–11:46Z, the cursor stuck, 14 messages missed, Porter never woke)
**What I found:**
- The same pull by hand (`bun scripts/pull.ts --since 2026-11-09T20:14:32Z` from the bot repo) works: count 14.
- **The tool itself, `--once` against a temp desk copy, also works now** (exit 0, the file written, no log error).
- A Git-Bash `/h/…` `--out` path is fine. I tested it; it's not the cause.
- So Porter's long-running copy failed for a reason **we can't see**: `watch-line.sh:84` sends pull's stderr to `/dev/null` and `:86` logs only `pull exit 1`.
- pull exit 1 means "no answer from the bot (timeout / network)" or a non-2xx reply (e.g. 401 if `.env.send`'s key didn't match then).

**That's the defect: a failure is silent and unexplained.** Fix (`watch-line.sh` + its test only):
1. **Say why.** On a non-zero exit, log `pull exit <rc>: <pull's stdout, first line, ≤ 200 chars>`, plus `stderr: <first line, ≤ 200 chars>`. Capture stderr to a temp var, not `/dev/null`. This is safe: on failure, pull prints only its own error sentence or a status + error body, never message text (`pull.ts:45–47`). Still never log a line that came from a *successful* pull's file.
2. **Make it loud.** After **2 failed polls in a row**, append **ONE** line to `inbox/RELAY.md`: `From line-poll <YYYY-MM-DD HH:MM>: LINE poll FAILING (<n> in a row since <first fail time>): pull exit <rc>: <reason ≤ 120 chars>`.
   - Then no more RELAY lines while it keeps failing (one alarm per failure streak). Keep the streak count + the alarm flag in `.private/`.
   - The first success after an alarm appends one line: `From line-poll …: LINE poll recovered`. It also posts the normal new-messages line if there are any.
3. **Tests (`watch-line.test.sh`):** the fake pull fails twice → exactly one FAILING line; a third failure → still one; then success → one "recovered" line; the reason appears in the log; and a success never logs message text.

**Now (no code needed):** Porter can restart his copy at once. It works today, and the cursor is still at 2026-11-09T20:14:32Z, so the first poll picks up all 14 messages. Once this fix lands, he restarts again so the new code runs.

**Root cause found (owner via Porter, 2026-11-10 19:08):** *"มันไม่ได้พังเงียบทั้งวันฉันปิดอินเทอร์เน็ตมันเลยไม่มีเน็ต"*. His PC was **offline all day**, so `pull exit 1` = pull.ts's "no answer from the bot (timeout or network)". The tool's logic was fine; what failed was **telling us**. (F-057 stays as written: roles can't edit FAILURES entries; this cause is here for Atlas.)
**Rework amendment:** when pull's failure line is the no-answer one (timeout / network), the log and the RELAY alarm say it plainly: **`LINE poll FAILING: offline or bot unreachable (no answer) — <n> in a row since <time>`**. Other failures keep `pull exit <rc>: <reason>`. Everything else in the rework stands (the reason logged, one alarm per streak, one "recovered" line, tests incl. the offline wording). Porter has restarted the poller; it runs the old code until the rework lands.

## Rework report (Brew, 2026-11-10: failures say why, a streak raises ONE alarm, the offline wording): REVIEW
`tools/watch-line.sh` + `tools/watch-line.test.sh` only. No git. `bash ai-worker/tools/watch-line.test.sh` → **passed 75 · failed 0** (was 56); `bash -n` clean on both.
- **Say why:** on a non-zero exit the log line is `pull exit <rc>: <pull's first stdout line, ≤ 200 chars> | stderr: <its first stderr line, ≤ 200 chars>` (stderr is captured to a temp file now, not `/dev/null`; control characters are stripped; only the FIRST line of each). Anything a SUCCESSFUL pull printed is never logged (a fixed phrase only: `unexpected pull output`, `count N but no next id / no file`, `could not move the pull file`); tested with `SECRET-TEXT` in a successful pull's output.
- **No-answer = offline (the amendment):** when pull's first line starts `no answer from the bot` (its timeout / network sentence), the log says `offline or bot unreachable (no answer): pull exit <rc>: <reason>` and the RELAY alarm is exactly `From line-poll <date time>: LINE poll FAILING: offline or bot unreachable (no answer) — <n> in a row since <first-failure time>`. Every other failure keeps `LINE poll FAILING (<n> in a row since <time>): pull exit <rc>: <reason ≤ 120 chars>` (tested with a bot error status `401 {…}`: generic wording, the word "offline" appears nowhere).
- **One alarm per streak, one recovered:** a failed poll is a non-zero exit, unexpected output, a count with no next id / file, or a failed file move. The count, the first-failure time and an alarm flag live in `.private/line-fail-count`, `line-fail-since`, `line-fail-alarm`. After **2 failures in a row** exactly ONE `FAILING` line; a 3rd, 4th… add nothing; the cursor never moves during a streak. The first success (count 0, count > 0, or "recording is OFF") after an alarm adds ONE `From line-poll …: LINE poll recovered` line and clears the streak files; a second success adds nothing; a new streak raises a new alarm. A recovery that also brings messages writes `recovered` first, then the normal messages line. The script still appends to RELAY.md in exactly one place (`relay_line`).
- **Tests added (19):** 1 failure = no line · 2 = one exact-shape offline line · 3rd/4th = still one · cursor unchanged · first success = one `recovered` · second success nothing · streak files gone · new streak = new alarm · recovered-then-messages order · unexpected output (exit 0) counts, with no output text in RELAY or log · "recording OFF" ends a streak · a long multi-line failure is cut to one line / 200 characters in the log and ≤ 120 in RELAY · the `since` time is the FIRST failure's and a 3rd failure does not move it · a bot error status keeps the generic wording · no temp / `.err` / `line-*.json` left behind · the log shows exit code + stdout reason + stderr reason, first lines only.
- **Mutation (in place, restore, hash identical all runs):** the streak logic **25 mutants: 23 killed, 2 survived**: one equivalent (`10#` on a counter this script writes itself, never with a leading zero) and one real gap (the `since` time) that I closed with the two `since` tests; the offline wording and detection **11 mutants: 11 killed**.
- **Not run:** `shellcheck` (not installed here). **Porter's running copy still has the OLD code** (bash reads the script once): after this lands, restart it so the new code runs.

## Review 2: the silent-failure rework (Sector, 2026-11-10): ✅ DONE
- **Re-run by me:** `bash -n` clean; `watch-line.test.sh` **75 pass · 0 fail** (up from 56).
- **Read:**
  - `poll_failed` logs the reason, using the offline wording when pull says "no answer from the bot" (`:91`, `:127`);
  - one alarm per streak after 2 failures, with the exact offline line (`:99`) and the generic line (`:101`);
  - one "recovered" line on the first success after an alarm (`:107`);
  - stderr goes into the reason only on failure (`:124`).
- Accepted: your mutation results (offline wording 11/11; streak logic 23/25, with the `since` survivor now tested). shellcheck isn't installed: noted.
- **Porter restarts the poller** so the new code runs (his copy still has the old code).
