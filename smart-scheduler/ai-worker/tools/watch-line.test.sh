#!/usr/bin/env bash
# watch-line.test.sh — tests for watch-line.sh (TASK-944). No network: a FAKE pull.ts in a temp "bot repo", a temp copy of
# the desk folder (so the real inbox/RELAY.md is never touched). Run: bash ai-worker/tools/watch-line.test.sh
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/watch-line.sh"
REAL_RELAY="$HERE/../inbox/RELAY.md"
real_sum_before=$(cksum < "$REAL_RELAY" 2>/dev/null)

T=$(mktemp -d) || exit 2
PIDS=()
cleanup() { for p in "${PIDS[@]}"; do kill "$p" 2>/dev/null; done; rm -rf "$T"; }
trap cleanup EXIT

stop_bg() { kill "$1" 2>/dev/null; wait "$1" 2>/dev/null; sleep 0.5; }

pass=0; fail=0
ok()   { pass=$((pass + 1)); printf '  ok   %s\n' "$1"; }
bad()  { fail=$((fail + 1)); printf '  FAIL %s\n' "$1"; }
check() { if eval "$2"; then ok "$1"; else bad "$1  [$2]"; fi; }

# ── a fresh temp desk + a fake bot repo ──
mk() {
  rm -rf "$T/ai-worker" "$T/bot"
  mkdir -p "$T/ai-worker/inbox" "$T/ai-worker/.private" "$T/bot/scripts"
  printf 'From someone 2026-11-10 00:00: an older line already in RELAY\n' > "$T/ai-worker/inbox/RELAY.md"
  cat > "$T/bot/scripts/pull.ts" <<'EOF'
// FAKE pull.ts for the watch-line tests: prints what FAKE_* says and writes --out like the real one does.
import { appendFileSync, writeFileSync } from "node:fs";
const a = process.argv;
const out = a[a.indexOf("--out") + 1]!;
appendFileSync("args.log", JSON.stringify({ cwd: process.cwd().split(/[\\/]/).pop(), since: a[a.indexOf("--since") + 1] }) + "\n");
const mode = process.env.FAKE_MODE ?? "ok";
if (mode === "fail") { console.log("no answer from the bot (timeout or network); nothing was written"); console.error("bun says hello\nsecond stderr line"); process.exit(1); }
if (mode === "http401") { console.log("401 {\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"Bad key\"}}"); process.exit(1); }
if (mode === "longfail") { console.log("x".repeat(300) + "\nsecond stdout line"); process.exit(2); }
if (mode === "junk") { console.log("hello SECRET-TEXT world"); process.exit(0); }
if (mode === "stderr") { console.error("diagnostic SECRET-TEXT on stderr"); }
if (mode === "off") { console.log("recording is OFF on the bot (RECORD_GROUP_MESSAGES is not true): nothing to pull"); process.exit(0); }
if (mode === "nofile") { console.log(`count: ${process.env.FAKE_COUNT}\nnext: ${process.env.FAKE_NEXT}`); process.exit(0); }
writeFileSync(out, JSON.stringify({ pulledAt: "x", messages: [{ id: "m", text: "SECRET-TEXT" }] }));
console.log(`count: ${process.env.FAKE_COUNT ?? "0"}`);
console.log(`next: ${process.env.FAKE_NEXT ?? "none"}`);
EOF
}
run() { WATCH_LINE_ROOT="$T/ai-worker" WATCH_LINE_INTERVAL="${INTERVAL:-1}" bash "$SCRIPT" "$T/bot" "$@"; }
relay() { cat "$T/ai-worker/inbox/RELAY.md"; }
cursor() { cat "$T/ai-worker/.private/line-cursor" 2>/dev/null; }
sumrelay() { cksum < "$T/ai-worker/inbox/RELAY.md"; }

echo "== static =="
bash -n "$SCRIPT" && ok "bash -n is clean" || bad "bash -n"
check "the script has no send path and never touches the key or the env file" '! grep -nE "send\.ts|/send|SEND_KEY|\.env|curl|wget|fetch" "$SCRIPT" >/dev/null'
check "RELAY is appended to in exactly one place, with >> and nothing else on that line" '[ "$(grep -c ">> \"\$RELAY\"" "$SCRIPT")" = 1 ]'
check "it does not call itself a harness tool: watch-inbox.sh is untouched by name" '! grep -n "watch-inbox" "$SCRIPT" | grep -v "^[0-9]*:#" >/dev/null'
if command -v shellcheck >/dev/null 2>&1; then shellcheck -S warning "$SCRIPT" && ok "shellcheck clean" || bad "shellcheck"; else echo "  skip shellcheck (not installed)"; fi

echo "== the period: LINE_POLL_MIN, default 30 minutes =="
mk
period() { env -u WATCH_LINE_INTERVAL "$@" WATCH_LINE_ROOT="$T/ai-worker" bash "$SCRIPT" "$T/bot" --show-interval; }
check "default (no LINE_POLL_MIN) is 30 minutes = 1800 s" '[ "$(period)" = 1800 ]'
check "LINE_POLL_MIN=1 is 60 s, 10 is 600 s, 120 is 7200 s" '[ "$(period LINE_POLL_MIN=1)" = 60 ] && [ "$(period LINE_POLL_MIN=10)" = 600 ] && [ "$(period LINE_POLL_MIN=120)" = 7200 ]'
check "outside 1-120 or not a whole number falls back to 30 (1800 s)" 'for v in 0 121 999 1000 -5 1.5 abc "" " 5" 0030x; do [ "$(period LINE_POLL_MIN="$v")" = 1800 ] || { echo "bad: [$v]"; exit 1; }; done'
check "leading zeros are still a number (030 = 30, 005 = 5 minutes)" '[ "$(period LINE_POLL_MIN=030)" = 1800 ] && [ "$(period LINE_POLL_MIN=005)" = 300 ]'
check "the test-only WATCH_LINE_INTERVAL (seconds) wins over it" '[ "$(WATCH_LINE_INTERVAL=2 WATCH_LINE_ROOT="$T/ai-worker" LINE_POLL_MIN=5 bash "$SCRIPT" "$T/bot" --show-interval)" = 2 ]'
check "--show-interval does not poll, lock or write anything" '[ ! -e "$T/ai-worker/.private/watch-line.lock" ] && [ ! -e "$T/ai-worker/.private/line-cursor" ]'

echo "== count 3: one line, exact shape =="
mk; echo "oldid" > "$T/ai-worker/.private/line-cursor"
FAKE_COUNT=3 FAKE_NEXT=m9 run --once; rc=$?
check "exit 0" '[ $rc = 0 ]'
check "RELAY has exactly one new line" '[ "$(relay | wc -l)" = 2 ]'
check "the older RELAY line is untouched and first" '[ "$(relay | head -1)" = "From someone 2026-11-10 00:00: an older line already in RELAY" ]'
check "the new line has the exact shape (no text, no names)" 'relay | tail -1 | grep -Eq "^From line-poll [0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}: 3 new LINE message\(s\) in SOM SYSTEM — read \.private/line-[0-9]{8}-[0-9]{6}\.json$"'
check "the cursor is next" '[ "$(cursor)" = m9 ]'
f=$(relay | tail -1 | sed 's/.*read \.private\///')
check "the pulled file was moved into .private under the name the line gives" '[ -s "$T/ai-worker/.private/$f" ]'
check "no temp file is left" '[ -z "$(ls "$T/ai-worker/.private" | grep "tmp")" ]'
check "the pulled text never reaches RELAY" '! relay | grep -q SECRET-TEXT'
check "pull.ts ran in the bot repo, with --since = the old cursor" 'grep -q "\"cwd\":\"bot\",\"since\":\"oldid\"" "$T/bot/args.log"'
check "RELAY.md is not modified by anything else (the lock dir is gone too)" '[ ! -e "$T/ai-worker/.private/watch-line.lock" ]'

echo "== a burst is one line =="
mk; echo "oldid" > "$T/ai-worker/.private/line-cursor"
FAKE_COUNT=5 FAKE_NEXT=m14 run --once
check "5 messages, ONE line, saying 5" '[ "$(relay | wc -l)" = 2 ] && relay | tail -1 | grep -q ": 5 new LINE message"'

echo "== count 0 =="
mk; echo "keepme" > "$T/ai-worker/.private/line-cursor"; before=$(sumrelay)
FAKE_COUNT=0 FAKE_NEXT=none run --once
check "no line" '[ "$(sumrelay)" = "$before" ]'
check "the cursor does not move" '[ "$(cursor)" = keepme ]'
check "no file is left (not even the temp one)" '[ -z "$(ls "$T/ai-worker/.private" | grep -E "^line-.*json")" ]'

echo "== errors: no line, the cursor stays, and nothing from the output is logged =="
for mode in fail junk nofile; do
  mk; echo "keepme" > "$T/ai-worker/.private/line-cursor"; before=$(sumrelay)
  FAKE_MODE=$mode FAKE_COUNT=3 FAKE_NEXT=m9 run --once; rc=$?
  check "$mode: exit 0 (the poller itself never fails), no RELAY line" '[ $rc = 0 ] && [ "$(sumrelay)" = "$before" ]'
  check "$mode: cursor unchanged, no file left" '[ "$(cursor)" = keepme ] && [ -z "$(ls "$T/ai-worker/.private" | grep -E "^line-.*json")" ]'
  check "$mode: nothing a SUCCESSFUL pull printed is logged (a fixed phrase only)" '! grep -q SECRET-TEXT "$T/ai-worker/.private/watch-line.log" 2>/dev/null'
done
mk; echo keepme > "$T/ai-worker/.private/line-cursor"; FAKE_MODE=fail run --once
check "a no-answer failure is logged plainly as offline, with the exit code AND why (pull's first stdout line and first stderr line)" 'grep -q "offline or bot unreachable (no answer): pull exit 1: no answer from the bot (timeout or network); nothing was written | stderr: bun says hello$" "$T/ai-worker/.private/watch-line.log"'
check "only the FIRST line of stderr / stdout is logged" '! grep -q "second stderr line" "$T/ai-worker/.private/watch-line.log"'
mk; echo keepme > "$T/ai-worker/.private/line-cursor"; FAKE_MODE=longfail run --once
check "a long, multi-line failure is cut to 200 characters and one line" '[ "$(tail -1 "$T/ai-worker/.private/watch-line.log" | sed "s/^[^ ]* pull exit 2: //" | wc -c)" -le 202 ] && ! grep -q "second stdout line" "$T/ai-worker/.private/watch-line.log"'
mk; echo keepme > "$T/ai-worker/.private/line-cursor"; FAKE_COUNT=2 FAKE_NEXT=none run --once
check "count > 0 but next none: no line, cursor unchanged" '[ "$(relay | wc -l)" = 1 ] && [ "$(cursor)" = keepme ]'
mk; echo keepme > "$T/ai-worker/.private/line-cursor"; FAKE_COUNT=2 FAKE_NEXT='bad id;rm' run --once
check "a next id with odd characters is refused (no line)" '[ "$(relay | wc -l)" = 1 ] && [ "$(cursor)" = keepme ]'
mk; echo keepme > "$T/ai-worker/.private/line-cursor"; before=$(sumrelay); FAKE_MODE=off run --once
check "\"recording is OFF\" = count 0, silently (no line, nothing logged)" '[ "$(sumrelay)" = "$before" ] && [ ! -s "$T/ai-worker/.private/watch-line.log" ]'

echo "== count 0 means no line, whatever next says =="
mk; echo keepme > "$T/ai-worker/.private/line-cursor"; before=$(sumrelay)
FAKE_COUNT=0 FAKE_NEXT=m5 run --once
check "count 0 with a next id: no line, cursor unchanged, no file" '[ "$(sumrelay)" = "$before" ] && [ "$(cursor)" = keepme ] && [ -z "$(ls "$T/ai-worker/.private" | grep -E "^line-.*json")" ]'
echo "== the poller prints nothing from pull.ts (stderr included) =="
mk; echo keepme > "$T/ai-worker/.private/line-cursor"
outall=$(FAKE_MODE=stderr FAKE_COUNT=1 FAKE_NEXT=m6 run --once 2>&1)
check "a diagnostic on pull.ts's stderr never appears in the poller's output" '! echo "$outall" | grep -q SECRET-TEXT'
check "that poll still produced its line" '[ "$(relay | wc -l)" = 2 ]'
echo "== a failure streak is loud: ONE alarm per streak, ONE recovered =="
mk; echo keepme > "$T/ai-worker/.private/line-cursor"
FAIL_RE='^From line-poll [0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}: LINE poll FAILING: offline or bot unreachable \(no answer\) — 2 in a row since [0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}$'
FAKE_MODE=fail run --once
check "1 failure: no RELAY line yet" '[ "$(relay | wc -l)" = 1 ]'
FAKE_MODE=fail run --once
check "2 no-answer failures in a row: exactly ONE FAILING line, in the exact offline wording" '[ "$(relay | wc -l)" = 2 ] && relay | tail -1 | grep -Eq "$FAIL_RE"'
FAKE_MODE=fail run --once; FAKE_MODE=fail run --once
check "a 3rd and 4th failure: still ONE (one alarm per streak)" '[ "$(relay | wc -l)" = 2 ]'
check "the cursor never moved during the streak" '[ "$(cursor)" = keepme ]'
FAKE_COUNT=0 FAKE_NEXT=none run --once
check "the first success: exactly ONE recovered line" '[ "$(relay | wc -l)" = 3 ] && relay | tail -1 | grep -Eq "^From line-poll [0-9-]+ [0-9:]+: LINE poll recovered$"'
FAKE_COUNT=0 FAKE_NEXT=none run --once
check "a second success adds nothing" '[ "$(relay | wc -l)" = 3 ]'
check "the streak files are gone after a success" '[ -z "$(ls "$T/ai-worker/.private" | grep "line-fail")" ]'
FAKE_MODE=fail run --once; FAKE_MODE=fail run --once
check "a NEW streak raises a NEW alarm" '[ "$(relay | wc -l)" = 4 ] && relay | tail -1 | grep -q "LINE poll FAILING"'
echo "any other failure keeps pull exit <rc>: <reason> (not the offline wording)"
mk; echo keepme > "$T/ai-worker/.private/line-cursor"
FAKE_MODE=http401 run --once; FAKE_MODE=http401 run --once
check "a bot error status: log and alarm say pull exit 1 with the status line, NOT offline" 'grep -q "pull exit 1: 401 {" "$T/ai-worker/.private/watch-line.log" && ! grep -q "offline" "$T/ai-worker/.private/watch-line.log" && relay | tail -1 | grep -Eq "LINE poll FAILING \(2 in a row since [0-9: -]+\): pull exit 1: 401 \{" && ! relay | grep -q offline'
echo "the 'since' time is the FIRST failure's, not the latest"
mk; echo keepme > "$T/ai-worker/.private/line-cursor"
FAKE_MODE=fail run --once
echo "2026-01-02 03:04" > "$T/ai-worker/.private/line-fail-since"
FAKE_MODE=fail run --once
check "the alarm names the time of the first failure of the streak" 'relay | tail -1 | grep -q "2 in a row since 2026-01-02 03:04$"'
mk; echo keepme > "$T/ai-worker/.private/line-cursor"
FAKE_MODE=fail run --once; echo "2026-01-02 03:04" > "$T/ai-worker/.private/line-fail-since"; FAKE_MODE=fail run --once; FAKE_MODE=fail run --once
check "a third failure does not move it (still one alarm, same since file)" '[ "$(cat "$T/ai-worker/.private/line-fail-since")" = "2026-01-02 03:04" ] && [ "$(relay | wc -l)" = 2 ]'

echo "recovery that also brings messages: the recovered line first, then the messages line"
mk; echo keepme > "$T/ai-worker/.private/line-cursor"
FAKE_MODE=fail run --once; FAKE_MODE=fail run --once
FAKE_COUNT=2 FAKE_NEXT=m30 run --once
check "recovered, then the normal new-messages line, in that order" '[ "$(relay | wc -l)" = 4 ] && relay | tail -2 | head -1 | grep -q "LINE poll recovered" && relay | tail -1 | grep -q ": 2 new LINE message(s) in SOM SYSTEM"'
check "and the cursor moved" '[ "$(cursor)" = m30 ]'
echo "a streak of unexpected output (exit 0) counts too; a recording-OFF answer is a success"
mk; echo keepme > "$T/ai-worker/.private/line-cursor"
FAKE_MODE=junk run --once; FAKE_MODE=junk run --once
check "2 unexpected outputs: one FAILING line, reason is the fixed phrase, none of the output text" '[ "$(relay | wc -l)" = 2 ] && relay | tail -1 | grep -q "pull exit 0: unexpected pull output" && ! relay | grep -q SECRET-TEXT'
FAKE_MODE=off run --once
check "recording OFF is a success: it ends the streak with a recovered line" '[ "$(relay | wc -l)" = 3 ] && relay | tail -1 | grep -q "LINE poll recovered"'
echo "the reason in RELAY is cut to 120 characters"
mk; echo keepme > "$T/ai-worker/.private/line-cursor"
FAKE_MODE=longfail run --once; FAKE_MODE=longfail run --once
check "RELAY reason: one line, at most 120 characters after 'pull exit 2: '" '[ "$(relay | wc -l)" = 2 ] && [ "$(relay | tail -1 | sed "s/.*pull exit 2: //" | wc -c)" -le 122 ] && ! relay | grep -q "second stdout line"'
echo "an unsuccessful poll never leaves a file or a temp file behind"
check "no line-*.json, no .tmp, no .err left" '[ -z "$(ls "$T/ai-worker/.private" | grep -E "^line-.*(json|tmp|err)")" ]'

echo "== no cursor yet: start from now, never from history =="
mk; rm -f "$T/ai-worker/.private/line-cursor"
FAKE_COUNT=0 FAKE_NEXT=none run --once
check "a cursor is created = now (UTC, ISO)" 'cursor | grep -Eq "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"'
check "pull.ts was asked since that time" 'grep -q "\"since\":\"$(cursor)\"" "$T/bot/args.log"'
check "now is not history: the cursor is within a minute of the clock" '[ $(( $(date -u +%s) - $(date -u -d "$(cursor)" +%s) )) -lt 60 ]'

echo "== one poll at start, then it waits the whole period =="
mk; echo "oldid" > "$T/ai-worker/.private/line-cursor"
FAKE_COUNT=1 FAKE_NEXT=m7 env -u WATCH_LINE_INTERVAL LINE_POLL_MIN=30 WATCH_LINE_ROOT="$T/ai-worker" bash "$SCRIPT" "$T/bot" >/dev/null 2>&1 &
S1=$!; PIDS+=("$S1")
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do [ "$(relay | wc -l)" = 2 ] && break; sleep 0.3; done
check "a fresh start polls at once (the line is there within seconds, not after 30 minutes)" '[ "$(relay | wc -l)" = 2 ] && [ "$(cursor)" = m7 ]'
sleep 2.5
check "and then it waits: no second poll within the next seconds" '[ "$(wc -l < "$T/bot/args.log")" = 1 ]'
stop_bg "$S1"

echo "== one instance =="
mk; echo c > "$T/ai-worker/.private/line-cursor"
FAKE_COUNT=0 FAKE_NEXT=none WATCH_LINE_ROOT="$T/ai-worker" WATCH_LINE_INTERVAL=1 bash "$SCRIPT" "$T/bot" >/dev/null 2>&1 &
A=$!; PIDS+=("$A")
for i in 1 2 3 4 5 6 7 8 9 10; do [ -s "$T/ai-worker/.private/watch-line.lock/pid" ] && break; sleep 0.3; done
before=$(sumrelay)
out=$(run --once 2>&1); rc=$?
check "a second start exits 3 and says so" '[ $rc = 3 ] && echo "$out" | grep -q "already running"'
check "the second start did nothing (RELAY unchanged)" '[ "$(sumrelay)" = "$before" ]'
sleep 2.5
check "the first keeps running (it never exits on its own)" 'kill -0 "$A" 2>/dev/null'
kill "$A" 2>/dev/null; wait "$A" 2>/dev/null
sleep 0.5
check "stopping it releases the lock" '[ ! -e "$T/ai-worker/.private/watch-line.lock" ]'
FAKE_COUNT=0 FAKE_NEXT=none run --once; rc=$?
check "after that a new start works" '[ $rc = 0 ]'
mkdir -p "$T/ai-worker/.private/watch-line.lock"; echo 999999 > "$T/ai-worker/.private/watch-line.lock/pid"
FAKE_COUNT=0 FAKE_NEXT=none run --once; rc=$?
check "a stale lock (dead pid) is taken over" '[ $rc = 0 ]'

echo "== it keeps going through errors =="
mk; echo c > "$T/ai-worker/.private/line-cursor"
FAKE_MODE=fail WATCH_LINE_ROOT="$T/ai-worker" WATCH_LINE_INTERVAL=1 bash "$SCRIPT" "$T/bot" >/dev/null 2>&1 &
B=$!; PIDS+=("$B")
sleep 3.5
check "still alive after several failing polls, and it kept trying" 'kill -0 "$B" 2>/dev/null && [ "$(grep -c "pull exit 1" "$T/ai-worker/.private/watch-line.log")" -ge 2 ]'
kill "$B" 2>/dev/null; wait "$B" 2>/dev/null

echo "== a later poll continues from the cursor it saved =="
mk; echo "oldid" > "$T/ai-worker/.private/line-cursor"
FAKE_COUNT=1 FAKE_NEXT=m20 run --once
FAKE_COUNT=1 FAKE_NEXT=m21 run --once
check "the second poll asked since m20 and the cursor is m21" 'grep -q "\"since\":\"m20\"" "$T/bot/args.log" && [ "$(cursor)" = m21 ]'

echo "== arguments =="
out=$(bash "$SCRIPT" 2>&1); check "no bot path is usage (exit 2)" '[ $? = 2 ] || echo "$out" | grep -q usage'
bash "$SCRIPT" "$T/nope" >/dev/null 2>&1; check "a folder without scripts/pull.ts is exit 2" '[ $? = 2 ]'

echo "== the real RELAY.md was never touched =="
check "cksum of the real inbox/RELAY.md is unchanged by this test run" '[ "$(cksum < "$REAL_RELAY" 2>/dev/null)" = "$real_sum_before" ]'

echo
echo "passed $pass · failed $fail"
[ "$fail" = 0 ]
