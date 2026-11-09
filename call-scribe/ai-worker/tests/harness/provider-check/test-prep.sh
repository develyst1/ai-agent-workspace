#!/usr/bin/env bash
# TASK-103 prep test: every script run on a SCRATCH copy of the gateway with FAKE keys and refuse-fetch.ts
# preloaded, or against a local stand-in server. No real provider is called, text-to-speech included.
# Nothing is installed. Removes what it makes.
# Usage: test-prep.sh <real-gateway-repo>     (only read: `git clone` from it)
set -u
REAL=${1:?usage: test-prep.sh <gateway repo>}
export PATH="$HOME/.bun/bin:$PATH"
HERE=$(cd "$(dirname "$0")" && pwd)
H=$(cd "$HERE/.." && pwd)
W=$(mktemp -d)
# NOTE: this trap clears ports itself, so the checks below must prove "nothing answers" BEFORE it fires (F-015, F-016).
trap 'for p in 3961 3962 3963 3965 3966 3967 3968 3969; do fuser -k $p/tcp >/dev/null 2>&1; done; rm -rf "$W"; echo "removed $W: $([ -e "$W" ] && echo STILL THERE || echo gone)"' EXIT
FAIL=0
chk() { if [ "$2" = "$3" ]; then echo "PASS $1"; else echo "FAIL $1 :: got [$2] want [$3]"; FAIL=$((FAIL+1)); fi; }
standin() { SPORT=$2; bun "$HERE/stand-in.ts" "$@" & sleep 0.7; }   # env prefixes on the call reach the stand-in
endstand() { fuser -k "$SPORT/tcp" >/dev/null 2>&1; wait 2>/dev/null; sleep 0.3; }
# processes whose working directory is the scratch gateway dir (a gateway started there has cwd = $W/gw). Never matches by
# command-line text, so it cannot match this shell, the SA's shell, or another role's src/index.ts elsewhere on the box.
gw_procs() { local n=0 p; for p in /proc/[0-9]*; do [ "$(readlink "$p/cwd" 2>/dev/null)" = "$W/gw" ] && n=$((n+1)); done; echo $n; }
listeners() { local n=0; for p in "$@"; do fuser $p/tcp >/dev/null 2>&1 && n=$((n+1)); done; echo $n; }

git clone -q "$REAL" "$W/gw" && (cd "$W/gw" && bun install --frozen-lockfile >/dev/null 2>&1)
# the clone has only committed files; copy the working-tree changes (untracked or modified, never ignored files such as .env)
( cd "$REAL" && git ls-files -m -o --exclude-standard | grep -v '^\.env$' | tar -cf - -T - ) | tar -xf - -C "$W/gw" 2>/dev/null
printf 'GEMINI_API_KEY=FAKE-KEY-FOR-PREP\nXAI_API_KEY=FAKE-KEY-FOR-PREP\nDEEPSEEK_API_KEY=FAKE-KEY-FOR-PREP\nOPENAI_API_KEY=FAKE-KEY-FOR-PREP\nAUTH_ENABLED=false\n' > "$W/gw/.env"
printf 'preload = ["%s/refuse-fetch.ts"]\n' "$H" > "$W/gw/bunfig.toml"
export OUTBOUND_LOG="$W/outbound.log"; : > "$OUTBOUND_LOG"
LED="$W/ledger.json"
RATES="--rate-text-in 0.5 --rate-audio-out 9"
MG="--transcribe-model gemini-3.5-flash-lite --summary-model gemini-3.5-flash-lite"   # the small models, named
MX="--transcribe-model stt --summary-model grok-4.3"
export ALLOWLIST_LOG="$W/allow.log"; : > "$ALLOWLIST_LOG"
echo "== 1. script file"
jq -e '(.turns|length)==12 and (.topics|length)==3' "$HERE/script-S103.json" >/dev/null && echo "PASS 12 turns, 3 topics" || { echo "FAIL script shape"; FAIL=$((FAIL+1)); }
echo "chars: $(jq '[.turns[].text|length]|add' "$HERE/script-S103.json")"

echo "== 2. voice script against refuse-fetch (no stand-in)"
GEMINI_API_KEY=FAKE-KEY-FOR-PREP bun "$HERE/tts-voices.ts" --out "$W/v" --work "$W/wk" --limit-usd 0.5 --ledger "$LED" $RATES >"$W/o1" 2>&1; chk "no flag → non-zero" "$?" 2
cat "$W/o1"; chk "no flag → no call logged" "$(wc -l < "$OUTBOUND_LOG")" 0
GEMINI_API_KEY=FAKE-KEY-FOR-PREP bun --preload "$H/refuse-fetch.ts" "$HERE/tts-voices.ts" --really-call-tts --out "$W/v" --work "$W/wk" --limit-usd 0.5 --ledger "$LED" $RATES >"$W/o2" 2>&1; chk "flag + refuse-fetch → reported failure (exit 1)" "$?" 1
cat "$W/o2"; echo "outbound log:"; cat "$OUTBOUND_LOG"
chk "log shows the intended TTS URL" "$(grep -c '^https://generativelanguage.googleapis.com/v1beta/interactions$' "$OUTBOUND_LOG")" 1
chk "no track written on failure" "$(ls "$W/v" 2>/dev/null | wc -l)" 0
chk "refused call: its GUESS stays in the ledger, marked guess-call-failed (recorded before the call, as ordered)" "$(jq '[.entries[]|select(.status=="guess-call-failed" and .turn==1)]|length' "$LED")" 1
chk "…and nothing else is in it" "$(jq '.entries|length' "$LED")" 1
GEMINI_API_KEY=FAKE bun "$HERE/tts-voices.ts" --really-call-tts --out "$W/v" --work "$W/wk" --limit-usd 0.0001 --ledger "$LED" $RATES >"$W/o3" 2>&1; chk "limit too small → exit 3 before any call" "$?" 3
chk "…and still only 1 logged call" "$(wc -l < "$OUTBOUND_LOG")" 1
chk "key value never printed" "$(cat "$W"/o1 "$W"/o2 "$W"/o3 "$OUTBOUND_LOG" | grep -c 'FAKE-KEY-FOR-PREP')" 0
: > "$OUTBOUND_LOG"; rm -f "$LED"

echo "== 2b. voice script against the local stand-in (documented reply shape, real WAV with an extra LIST chunk)"
standin tts 3965
export GEMINI_API_KEY=FAKE-KEY-FOR-PREP
bun "$HERE/tts-voices.ts" --really-call-tts --out "$W/v1" --work "$W/wk1" --limit-usd 0.5 --ledger "$LED" $RATES --base-url http://localhost:3965 >"$W/o4" 2>&1; chk "stand-in run exit 0" "$?" 0
tail -3 "$W/o4"
EXP=$(jq '([.turns[].text|length|(.*0.01|if .<0.2 then 0.2 else . end)]|add)+12*0.4' "$HERE/script-S103.json")
for t in A B; do
  f="$W/v1/voice-$t-track.wav"
  echo "track $t: $(ffprobe -v error -show_entries stream=sample_rate,channels,codec_name -show_entries format=duration -of csv=p=0 "$f" | tr '\n' ' ')expected≈$EXP s"
  chk "track $t is 24 kHz mono pcm" "$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of csv=p=0 "$f")" "pcm_s16le,24000,1"
  chk "track $t duration within 0.1 s of the sum of the turns" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" | awk -v e="$EXP" '{d=$1-e; if(d<0)d=-d; print (d<0.1)?"ok":"off by " d}')" ok
  chk "track $t has exactly one RIFF header" "$(LC_ALL=C grep -abo RIFF "$f" | wc -l)" 1
done
chk "ledger has 12 turn entries, all measured (no guess left)" "$(jq '[.entries[]|select(.status=="measured")]|length' "$LED")/$(jq '.entries|length' "$LED")" "12/12"
chk "ledger total > 0 and < limit" "$(jq '.total_usd>0 and .total_usd<1' "$LED")" true
echo "ledger total: $(jq .total_usd "$LED")"
endstand; rm -f "$LED"
echo "-- failure at turn 7"
STAND_IN_FAIL_AT=7 standin tts 3965
bun "$HERE/tts-voices.ts" --really-call-tts --out "$W/v2" --work "$W/wk2" --limit-usd 0.5 --ledger "$LED" $RATES --base-url http://localhost:3965 >"$W/o5" 2>&1; chk "failure at turn 7 → exit 1" "$?" 1
tail -2 "$W/o5"
chk "ledger holds the 6 paid turns (measured)" "$(jq '[.entries[]|select(.status=="measured")]|length' "$LED")" 6
chk "…plus 1 guess for the failed call, marked as such" "$(jq '[.entries[]|select(.status=="guess-call-failed" and .turn==7)]|length' "$LED")" 1
chk "…and the total counts the guess" "$(jq '([.entries[].est_usd]|add) - .total_usd | (if .<0 then -. else . end) < 0.000001' "$LED")" true
chk "ledger total > 0" "$(jq '.total_usd>0' "$LED")" true
chk "6 turn files kept in the work dir" "$(ls "$W/wk2" | wc -l)" 6
chk "no track written" "$(ls "$W/v2" | wc -l)" 0
endstand
echo "-- retry reuses the 6 paid turns"
standin tts 3965
T6=$(jq .total_usd "$LED")
bun "$HERE/tts-voices.ts" --really-call-tts --out "$W/v2" --work "$W/wk2" --limit-usd 0.5 --ledger "$LED" $RATES --base-url http://localhost:3965 >"$W/o6" 2>&1; chk "retry exit 0" "$?" 0
chk "retry reused 6 turns" "$(grep -c 'reused, no call' "$W/o6")" 6
chk "ledger now 12 measured turns (6 new, none repeated) and the 1 failed-call guess kept" "$(jq '[.entries[]|select(.status=="measured")]|length' "$LED")/$(jq '[.entries[]|select(.status=="guess-call-failed")]|length' "$LED")" "12/1"
chk "both tracks written" "$(ls "$W/v2" | wc -l)" 2
echo "ledger after 6 turns: $T6; after retry: $(jq .total_usd "$LED")"
endstand
rm -f "$LED"

echo "== 2c. pause handling (a fake uptime file, PAUSE_UPTIME_FILE; the real box is never paused)"
R="$W/gw"   # the scratch gateway; the real variant file for the run-check tests is made in section 3, so the pause runs use a tiny one here
ffmpeg -y -v error -nostdin -f lavfi -i "sine=f=440:d=2" -ac 1 -ar 16000 -c:a aac -b:a 40k "$W/tiny.m4a"
RC="bun $HERE/run-check.ts --repo $R --variant $W/tiny.m4a --out $W/res --limit-usd 0.5 --est-usd 0.5 --est-basis prep-test --poll-ms 200"
UP="$W/uptime"; export PAUSE_UPTIME_FILE="$UP"
# The fake uptime file is "<uptime> 0 <wall clock when written>": the third field makes the fake advance in real time, as a real
# uptime does, so only a deliberate shift moves the boot epoch (epoch = third field - first field).
setup() { echo "$1 0 $(date +%s.%N)" > "$UP"; }
shift_up() { awk -v f="$UP" -v d="$1" 'BEGIN{getline l < f; split(l,a," "); printf "%s 0 %s\n", a[1]-d, a[3] > f}'; }   # uptime loses d seconds = boot epoch +d
epoch_for() { awk '{printf "%.3f", $3-$1}' "$UP"; }
echo "-- (a) a pause BETWEEN runs: the ledger remembers the epoch, the uptime then moved 278 s"
setup 1000; jq -n --argjson e "$(epoch_for)" '{total_usd:0,entries:[],boot_epoch:$e}' > "$W/led-a.json"; shift_up 278
: > "$OUTBOUND_LOG"
bun --preload "$H/refuse-fetch.ts" "$HERE/tts-voices.ts" --really-call-tts --out "$W/va" --work "$W/wka" --limit-usd 0.5 --ledger "$W/led-a.json" $RATES --base-url https://pause-test.invalid >"$W/oa" 2>&1; chk "pause before a TTS run → exit 4" "$?" 4
cat "$W/oa" | head -2 | cut -c1-200
chk "…and no call was even attempted" "$(wc -l < "$OUTBOUND_LOG")" 0
chk "…the pause is recorded in the ledger (move about 278 s)" "$(jq '.pause.move_s>270 and .pause.move_s<290' "$W/led-a.json")" true
setup 1000; jq -n --argjson e "$(epoch_for)" '{total_usd:0,entries:[],boot_epoch:$e}' > "$W/led-a2.json"; shift_up 278
$RC --provider stub --label pre-paused --ledger "$W/led-a2.json" --port 3961 >"$W/oa2" 2>&1; chk "pause before a run-check run → exit 4" "$?" 4
chk "…nothing started (no listener, no api-keys.json, no process)" "$(listeners 3961)/$([ -e "$R/api-keys.json" ] && echo LEFT || echo none)/$(gw_procs)" "0/none/0"
echo "-- (b) a pause DURING a TTS run (moves while call 3 is answered)"
setup 5000; LB="$W/led-b.json"; rm -f "$LB"
STAND_IN_PAUSE_AT=3 standin tts 3965
bun "$HERE/tts-voices.ts" --really-call-tts --out "$W/vb" --work "$W/wkb" --limit-usd 0.5 --ledger "$LB" $RATES --base-url http://localhost:3965 >"$W/ob" 2>&1; chk "pause during call 3 → exit 4" "$?" 4
tail -2 "$W/ob" | cut -c1-200
chk "ledger: 3 measured turns, 3 entries in all (no further call)" "$(jq '[.entries[]|select(.status=="measured")]|length' "$LB")/$(jq '.entries|length' "$LB")" "3/3"
chk "ledger: pause recorded" "$(jq '.pause.move_s>270' "$LB")" true
chk "no track written" "$(ls "$W/vb" 2>/dev/null | wc -l)" 0
endstand
echo "-- (c) while the ledger records a pause, the next runs refuse"
: > "$OUTBOUND_LOG"
bun --preload "$H/refuse-fetch.ts" "$HERE/tts-voices.ts" --really-call-tts --out "$W/vb" --work "$W/wkb" --limit-usd 0.5 --ledger "$LB" $RATES --base-url https://pause-test.invalid >"$W/oc" 2>&1; chk "tts-voices on a ledger with a pause → exit 4" "$?" 4
head -1 "$W/oc" | cut -c1-160; chk "…no call attempted" "$(wc -l < "$OUTBOUND_LOG")" 0
chk "…it says REFUSING (the ledger's record), not a fresh PAUSED" "$(grep -c '^REFUSING: the ledger records a pause' "$W/oc")" 1
$RC --provider stub --label refused-pause --ledger "$LB" --port 3961 >"$W/od" 2>&1; chk "run-check on a ledger with a pause → exit 4" "$?" 4
head -1 "$W/od" | cut -c1-160; chk "…it says REFUSING (the ledger's record)" "$(grep -c '^REFUSING: the ledger records a pause' "$W/od")" 1
chk "…nothing started (no listener, no api-keys.json)" "$(listeners 3961)$([ -e "$R/api-keys.json" ] && echo LEFT)" 0
echo "-- (d) cleared on Silver's word: the paid turns are reused"
bun "$HERE/pause.ts" clear --ledger "$LB" --note "test: cleared by the test script, not by Silver" >/dev/null; chk "pause cleared" "$(jq 'has("pause")|not' "$LB")/$(jq '.pauses_cleared|length' "$LB")" "true/1"
standin tts 3965
bun "$HERE/tts-voices.ts" --really-call-tts --out "$W/vb" --work "$W/wkb" --limit-usd 0.5 --ledger "$LB" $RATES --base-url http://localhost:3965 >"$W/oe" 2>&1; chk "after clearing, the run completes" "$?" 0
chk "…reusing the 3 paid turns" "$(grep -c 'reused, no call' "$W/oe")" 3
chk "…12 measured turns in the ledger" "$(jq '[.entries[]|select(.status=="measured")]|length' "$LB")" 12
endstand
echo "-- (e) a pause DURING a run-check poll (stub, job takes 1.5 s, the uptime moves at 0.8 s)"
setup 9000
( sleep 0.8; shift_up 278 ) & SH=$!
RUNCHECK_STUB_DELAY_MS=1500 $RC --provider stub --label paused --ledger "$W/led-e.json" --port 3961 >"$W/of" 2>&1; chk "pause during a poll → exit 4" "$?" 4
wait $SH 2>/dev/null
grep -E 'PAUSED' "$W/of" | cut -c1-200
chk "…the row says INVALID: paused" "$(jq -r .row.status "$W/res/result-paused.json")" "INVALID: paused"
chk "…caught IN the poll, not only after the job ended" "$(jq -r .row.where "$W/res/result-paused.json")" poll
chk "…port free (nothing answers), no api-keys.json, no process left" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://localhost:3961/ || true)/$([ -e "$R/api-keys.json" ] && echo LEFT || echo none)/$(gw_procs)" "000/none/0"
echo "-- (f) clip length gate (silent clips; stub, so nothing real)"
setup 7000
ffmpeg -y -v error -nostdin -f lavfi -i anullsrc=r=16000:cl=mono -t 120 -c:a aac -b:a 40k "$W/s120.m4a"
ffmpeg -y -v error -nostdin -f lavfi -i anullsrc=r=16000:cl=mono -t 360 -c:a aac -b:a 40k "$W/s360.m4a"
RCL="bun $HERE/run-check.ts --repo $R --out $W/res --limit-usd 0.5 --est-usd 0.5 --est-basis prep-test --poll-ms 200 --provider stub --port 3961"
$RCL --variant "$W/s120.m4a" --label len120 --ledger "$W/led-f.json" >"$W/og" 2>&1; chk "a 2-minute clip passes the length check" "$?" 0
$RCL --variant "$W/s360.m4a" --label len360 --ledger "$W/led-f.json" >"$W/oh" 2>&1; chk "a 6-minute clip without --long → exit 2" "$?" 2
head -1 "$W/oh" | cut -c1-160
$RCL --variant "$W/s360.m4a" --label len360l --ledger "$W/led-f.json" --long >"$W/oi" 2>&1; chk "…with --long but no short run recorded → exit 2" "$?" 2
head -1 "$W/oi" | cut -c1-160
jq -n '{total_usd:0,entries:[{kind:"run-finished",provider:"stub",duration_s:120,transcription_status:"done"}]}' > "$W/led-g.json"
$RCL --variant "$W/s360.m4a" --label len360m --ledger "$W/led-g.json" --long >"$W/oj" 2>&1; chk "…with --long and a recorded finished short run → passes" "$?" 0
echo "== 2d. a server that stops answering must not hang a paid run (limits settable here: --poll-limit-s, --call-limit-s)"
echo "-- (g) the job poll never answers: ends as harness_timeout, exit 1, within --timeout-s plus one poll limit"
STAND_IN_HANG=poll standin gateway 3967
T0=$(date +%s)
timeout 40 $RC --provider stub --label hangpoll --ledger "$W/led-h.json" --port 3967 --attach --timeout-s 3 --poll-limit-s 1 --no-summary >"$W/ohg" 2>&1; chk "hung poll → exit 1 (not 124 = stuck)" "$?" 1
EL=$(( $(date +%s) - T0 )); echo "elapsed ${EL} s (--timeout-s 3, poll limit 1)"
chk "…ended within timeout + one poll limit + slack (≤ 8 s)" "$([ "$EL" -le 8 ] && echo ok || echo "took $EL")" ok
chk "…the row's job error is harness_timeout" "$(jq -r .transcript_job.data.error.code "$W/res/result-hangpoll.json")" harness_timeout
endstand
echo "-- (h) the TTS call never answers (call 3): non-zero, the turn's guess kept, no further call"
setup 7000; LH="$W/led-tts-h.json"; rm -f "$LH"
STAND_IN_HANG_AT=3 standin tts 3965
timeout 40 bun "$HERE/tts-voices.ts" --really-call-tts --out "$W/vh" --work "$W/wkh" --limit-usd 0.5 --ledger "$LH" $RATES --base-url http://localhost:3965 --call-limit-s 1 >"$W/oth" 2>&1; chk "hung TTS call → exit 1 (not 124 = stuck)" "$?" 1
tail -1 "$W/oth" | cut -c1-200
chk "…ledger: 2 measured turns + turn 3's guess marked, nothing for turn 4" "$(jq '[.entries[]|select(.status=="measured")]|length' "$LH")/$(jq '[.entries[]|select(.status=="guess-call-failed" and .turn==3)]|length' "$LH")/$(jq '.entries|length' "$LH")" "2/1/3"
chk "…no track written" "$(ls "$W/vh" 2>/dev/null | wc -l)" 0
endstand
echo "-- (i) the upload POST never answers: not retried, non-zero, the run's charge stays in the ledger"
mkdir -p "$W/norefuse"   # an empty dir: no bunfig, so the run counts as 'real'; --attach means only the local stand-in is ever contacted
STAND_IN_HANG=post standin gateway 3967
T0=$(date +%s)
timeout 40 bun "$HERE/run-check.ts" --repo "$W/norefuse" --variant "$W/tiny.m4a" --out "$W/res" --limit-usd 0.5 --est-usd 0.5 --est-basis prep-test --poll-ms 200 --provider xai $MX --live-real --attach --call-limit-s 1 --label hangpost --ledger "$W/led-i.json" --port 3967 >"$W/oti" 2>&1; chk "hung POST → exit 1 (not 124)" "$?" 1
EL=$(( $(date +%s) - T0 )); grep 'Not retried' "$W/oti" | cut -c1-200
chk "…one limit only, no retry (≤ 4 s)" "$([ "$EL" -le 4 ] && echo ok || echo "took $EL")" ok
chk "…the charge stays: ledger 0.5, one run entry" "$(jq '.total_usd' "$W/led-i.json")/$(jq '[.entries[]|select(.kind=="run")]|length' "$W/led-i.json")" "0.5/1"
endstand
jq -n '{total_usd:0.3,entries:[{kind:"run-finished",provider:"stub",duration_s:120,transcription_status:"done"}]}' > "$W/led-g2.json"
$RCL --variant "$W/s360.m4a" --label len360n --ledger "$W/led-g2.json" --long >"$W/ojk" 2>&1; chk "--long with a finished short run but the ledger at 0.3 (> 0.25) → exit 2" "$?" 2
head -1 "$W/ojk" | cut -c1-170
unset PAUSE_UPTIME_FILE
unset GEMINI_API_KEY; rm -f "$LED"

echo "== 2e. re-size: owner's ceiling, small models named, allow-list on the gateway"
echo "-- (j) the ceiling is in the code: --limit-usd 0.6 is refused by both scripts"
$RC --provider stub --label ceil --ledger "$W/led-j.json" --port 3961 --limit-usd 0.6 >"$W/oj1" 2>&1; chk "run-check --limit-usd 0.6 → exit 2" "$?" 2
head -1 "$W/oj1" | cut -c1-170
GEMINI_API_KEY=FAKE bun "$HERE/tts-voices.ts" --really-call-tts --out "$W/vj" --work "$W/wkj" --limit-usd 0.6 --ledger "$W/led-j2.json" $RATES --base-url http://localhost:3965 >"$W/oj2" 2>&1; chk "tts-voices --limit-usd 0.6 → exit 2" "$?" 2
head -1 "$W/oj2" | cut -c1-170
echo "-- (k) models: none named → refused; a job that reports another model → exit 1; the right ones → exit 0"
$RC --provider xai --label nomodel --ledger "$W/led-k.json" --port 3961 >"$W/ok1" 2>&1; chk "xai with no model named → exit 2" "$?" 2
head -1 "$W/ok1" | cut -c1-170
$RC --provider gemini --transcribe-model gemini-3.5-flash-lite --label onlyone --ledger "$W/led-k.json" --port 3961 >"$W/ok1b" 2>&1; chk "only one model named → exit 2" "$?" 2
STAND_IN_PROVIDER=xai standin gateway 3967
$RC --provider xai $MX --label modelmm --ledger "$W/led-k.json" --port 3967 --attach >"$W/ok2" 2>&1; chk "stand-in reports model m, asked stt/grok-4.3 → exit 1" "$?" 1
grep MISMATCH "$W/ok2" | cut -c1-200
endstand
STAND_IN_PROVIDER=xai STAND_IN_MODEL_T=stt STAND_IN_MODEL_S=grok-4.3 standin gateway 3967
$RC --provider xai $MX --label modelok --ledger "$W/led-k.json" --port 3967 --attach >"$W/ok3" 2>&1; chk "stand-in reports exactly the asked models → exit 0" "$?" 0
endstand
echo "-- (l) the gateway process runs under allow-hosts.ts with refuse-fetch.ts beneath it, DEFAULT_PROVIDER=deepseek"
: > "$W/allow-l.log"; : > "$W/refuse-l.log"
( cd "$W/gw" && PORT=3962 AUTH_ENABLED=false DEFAULT_PROVIDER=deepseek ALLOWLIST_LOG="$W/allow-l.log" OUTBOUND_LOG="$W/refuse-l.log" bun --preload "$HERE/allow-hosts.ts" src/index.ts >/dev/null 2>&1 & )
for _ in $(seq 1 50); do curl -s -o /dev/null --max-time 1 http://localhost:3962/ && break; sleep 0.2; done
curl -s --max-time 25 -X POST http://localhost:3962/chat -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"hi"}]}' >"$W/chat-l.txt" 2>&1
echo "chat answered: $(head -c 120 "$W/chat-l.txt")"
echo "allow-list log:"; cut -c1-120 "$W/allow-l.log"; echo "refuse-fetch log:"; cut -c1-120 "$W/refuse-l.log"
chk "DeepSeek was refused by the allow-list" "$(grep -c 'host=api.deepseek.com' "$W/allow-l.log" | awk '{print ($1>=1)?"yes":"no"}')" yes
chk "…and api.deepseek.com never reached refuse-fetch's log" "$(grep -c 'deepseek' "$W/refuse-l.log")" 0
chk "…while the Gemini and xAI hosts did reach it" "$(grep -c 'generativelanguage.googleapis.com' "$W/refuse-l.log" | awk '{print ($1>=1)?"y":"n"}')$(grep -c 'api.x.ai' "$W/refuse-l.log" | awk '{print ($1>=1)?"y":"n"}')" yy
fuser -k 3962/tcp >/dev/null 2>&1; sleep 0.3
chk "…and nothing is left on 3962" "$(listeners 3962)" 0
echo "== 3. variants on generated tones (voice A: 440 Hz in the first 3 s; voice B: 880 Hz in the next 3 s)"
ffmpeg -y -v error -nostdin -f lavfi -i "sine=f=440:d=3,apad=whole_dur=6" -ar 24000 -ac 1 "$W/A.wav"
ffmpeg -y -v error -nostdin -f lavfi -i "anullsrc=r=24000:cl=mono:d=3" -f lavfi -i "sine=f=880:d=3" -filter_complex "[0][1]concat=n=2:v=0:a=1" "$W/B.wav"
bash "$HERE/make-variants.sh" "$W/A.wav" "$W/B.wav" "$W/var" 20; chk "make-variants exit" "$?" 0
for f in clean reference leak long; do chk "$f.m4a exists" "$([ -s "$W/var/$f.m4a" ] && echo yes || echo no)" yes; done
chk "clean is mono 16 kHz AAC" "$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of csv=p=0 "$W/var/clean.m4a")" "aac,16000,1"
chk "reference is not 16 kHz" "$([ "$(ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate -of csv=p=0 "$W/var/reference.m4a")" != 16000 ] && echo yes || echo no)" yes
chk "long is 20 s" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$W/var/long.m4a" | cut -d. -f1)" 20

echo "== 4. scorer"
S="$HERE/script-S103.json"
# GOOD reply: the script itself, A→1 B→2, with the last 2 characters of every turn dropped (a few lost words)
jq '{success:true,data:{status:"done",result:{provider:"hand",model:"hand",no_speech:false,speaker_count:2,latency_ms:1,turns:[.turns[]|{speaker:(if .voice=="A" then 1 else 2 end),text:(.text|.[0:(length-2)])}]}}}' "$S" > "$W/good.json"
# LABELS SWAPPED (B first as 1): mapping must still score high
jq '{success:true,data:{status:"done",result:{no_speech:false,speaker_count:2,turns:[.turns[]|{speaker:(if .voice=="A" then 2 else 1 end),text:.text}]}}}' "$S" > "$W/swap.json"
# LOW reply: one speaker, unrelated text, half the turns missing
printf '%s' '{"success":true,"data":{"status":"done","result":{"no_speech":false,"speaker_count":1,"turns":[{"speaker":1,"text":"วันนี้อากาศดีมาก ไปเดินเล่นที่สวนสาธารณะกันไหม"},{"speaker":1,"text":"เมื่อวานฝนตกหนัก ถนนน้ำท่วมหลายสาย"}]}}}' > "$W/low.json"
# summary: 2 of 3 topics, plus an invented number
printf '%s' '{"success":true,"data":{"status":"done","result":{"summary":"ทีมคุยเรื่องกำหนดส่งงาน และงบประมาณ 999 บาท ซึ่งไม่มีในบทสนทนา"}}}' > "$W/sum.json"
G=$(bun "$HERE/score.ts" --script "$S" --transcript "$W/good.json" --summary "$W/sum.json" --elapsed-s 5 --cost-usd 0)
W_G=$(echo "$G" | jq .words_pct); SP_G=$(echo "$G" | jq .turns_on_right_voice_pct)
echo "good: words_pct=$W_G right_voice=$SP_G speaker_count=$(echo "$G" | jq .speaker_count) topics=$(echo "$G" | jq -r .topics_present) not_in_script=$(echo "$G" | jq -c .summary_latin_or_number_tokens_not_in_script)"
chk "good words ≥ 80" "$(awk -v x="$W_G" 'BEGIN{print (x>=80)?1:0}')" 1
chk "good right-voice = 100" "$SP_G" 100
chk "topics 2/3" "$(echo "$G" | jq -r .topics_present)" "2/3"
chk "invented number flagged" "$(echo "$G" | jq -r '.summary_latin_or_number_tokens_not_in_script|index("999")!=null')" true
SW=$(bun "$HERE/score.ts" --script "$S" --transcript "$W/swap.json"); echo "swapped: right_voice=$(echo "$SW" | jq .turns_on_right_voice_pct) map=$(echo "$SW" | jq -c .label_to_voice)"
chk "swapped labels still 100" "$(echo "$SW" | jq .turns_on_right_voice_pct)" 100
L=$(bun "$HERE/score.ts" --script "$S" --transcript "$W/low.json"); echo "low: words_pct=$(echo "$L" | jq .words_pct) right_voice=$(echo "$L" | jq .turns_on_right_voice_pct) speaker_count=$(echo "$L" | jq .speaker_count)"
chk "low case words < 40" "$(echo "$L" | jq '.words_pct<40')" true
chk "low case right-voice < 80" "$(echo "$L" | jq '.turns_on_right_voice_pct<80')" true

echo "== 5. run script"
R="$W/gw"
RC="bun $HERE/run-check.ts --repo $R --variant $W/var/clean.m4a --out $W/res --limit-usd 0.5 --est-usd 0.5 --est-basis prep-test --poll-ms 200"
$RC --provider stub --label stub-clean --ledger "$W/led2.json" --port 3961 > "$W/run-stub.txt" 2>&1; chk "stub run exit 0" "$?" 0
echo "stub row: asked=$(jq -r .row.provider_asked "$W/res/result-stub-clean.json") ran=$(jq -c .row.provider_ran "$W/res/result-stub-clean.json") status=$(jq -r .row.transcription_status "$W/res/result-stub-clean.json") summary=$(jq -r .row.summary_status "$W/res/result-stub-clean.json") cost=$(jq .row.cost_usd "$W/res/result-stub-clean.json") elapsed_s=$(jq .row.elapsed_s "$W/res/result-stub-clean.json")"
chk "stub: transcription done" "$(jq -r .row.transcription_status "$W/res/result-stub-clean.json")" done
chk "stub: summary done" "$(jq -r .row.summary_status "$W/res/result-stub-clean.json")" done
chk "stub: the job says it ran stub" "$(jq -r .row.provider_ran.transcription.provider "$W/res/result-stub-clean.json")" stub
chk "stub: cost 0, no ledger" "$(jq .row.cost_usd "$W/res/result-stub-clean.json")$([ -e "$W/led2.json" ] && echo L)" 0
chk "stub: no outbound" "$(wc -l < "$OUTBOUND_LOG")" 0
echo "listeners on 3961 right after the run (trap not yet fired): $(listeners 3961)"
chk "after the run NOTHING answers on 3961" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://localhost:3961/ || true)" 000
chk "after the run no process is left in the scratch gateway dir" "$(gw_procs)" 0
chk "the run proved auth on before submitting" "$(grep -c 'auth check: unauthenticated GET /audio/jobs/x -> 401' "$W/run-stub.txt")" 1
chk "after the run no api-keys.json in the gateway dir" "$([ -e "$R/api-keys.json" ] && echo LEFT || echo none)" none
# second run on the same port gives the SAME honest answer, not the first run's server
$RC --provider gemini $MG --label gem-refused --ledger "$W/led2.json" --port 3961 --no-summary > "$W/run-gem.txt" 2>&1; chk "gemini under refuse-fetch → failure exit 1" "$?" 1
echo "gemini row: asked=$(jq -r .row.provider_asked "$W/res/result-gem-refused.json") ran=$(jq -c .row.provider_ran "$W/res/result-gem-refused.json") status=$(jq -r .row.transcription_status "$W/res/result-gem-refused.json") error=$(jq -c .row.transcription_error "$W/res/result-gem-refused.json") cost=$(jq .row.cost_usd "$W/res/result-gem-refused.json")"
echo "outbound log:"; sed 's/key=[^&]*/key=X/' "$OUTBOUND_LOG"
chk "gemini: job failed, not done" "$(jq -r .row.transcription_status "$W/res/result-gem-refused.json")" failed
chk "gemini: intended host logged" "$(grep -c 'generativelanguage.googleapis.com' "$OUTBOUND_LOG" | awk '{print ($1>=1)?"yes":"no"}')" yes
$RC --provider xai $MX --label xai-refused --ledger "$W/led2.json" --port 3961 --no-summary > "$W/run-xai.txt" 2>&1; chk "xai under refuse-fetch → failure exit 1" "$?" 1
chk "xai: job failed, intended host logged" "$(jq -r .row.transcription_status "$W/res/result-xai-refused.json")/$(grep -c 'api.x.ai' "$OUTBOUND_LOG" | awk '{print ($1>=1)?"yes":"no"}')" failed/yes
chk "gemini: nothing charged" "$([ -e "$W/led2.json" ] && echo L || echo none)" none
chk "after a FAILED run nothing answers on 3961" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://localhost:3961/ || true)" 000
chk "after a FAILED run no api-keys.json" "$([ -e "$R/api-keys.json" ] && echo LEFT || echo none)" none
chk "after a FAILED run no process is left in the scratch gateway dir" "$(gw_procs)" 0

echo "-- busy port is refused, nothing started"
standin gateway 3966
$RC --provider stub --label busy --ledger "$W/led4.json" --port 3966 > "$W/run-busy.txt" 2>&1; chk "busy port → exit 2" "$?" 2
head -1 "$W/run-busy.txt"
chk "busy: no api-keys.json written" "$([ -e "$R/api-keys.json" ] && echo LEFT || echo none)" none
chk "busy: the squatter is still the only listener" "$(listeners 3966)" 1
echo "-- a silent listener (accepts, never answers) is refused and left alive"
bun "$HERE/silent-listener.ts" 3968 & SL=$!; sleep 0.7
$RC --provider stub --label silent --ledger "$W/led6.json" --port 3968 > "$W/run-silent.txt" 2>&1; chk "silent listener → exit 2" "$?" 2
head -1 "$W/run-silent.txt"
chk "silent listener is still alive afterwards" "$(listeners 3968)" 1
chk "silent: no api-keys.json written" "$([ -e "$R/api-keys.json" ] && echo LEFT || echo none)" none
kill $SL 2>/dev/null; fuser -k 3968/tcp >/dev/null 2>&1; wait $SL 2>/dev/null   # wait for this one only: the 3966 stand-in is still up
echo "-- auth-off mutation: the SAME script with AUTH_ENABLED forced to false must fail before submitting"
mkdir "$W/mut" && cp "$HERE/run-check.ts" "$HERE/score.ts" "$HERE/pause.ts" "$HERE/allow-hosts.ts" "$HERE/script-S103.json" "$W/mut/"
bun "$HERE/mutate.ts" "$W/mut/run-check.ts" 'AUTH_ENABLED: "true"' 'AUTH_ENABLED: "false"'
bun "$W/mut/run-check.ts" --repo "$R" --variant "$W/var/clean.m4a" --out "$W/resmut" --limit-usd 0.5 --est-usd 0.5 --est-basis prep-test --poll-ms 200 --provider stub --label automut --ledger "$W/led7.json" --port 3969 > "$W/run-automut.txt" 2>&1; chk "auth off → exit 1" "$?" 1
grep 'auth is not enforced' "$W/run-automut.txt" | cut -c1-200
chk "auth off: refused with the auth message" "$(grep -c 'auth is not enforced' "$W/run-automut.txt")" 1
chk "auth off: nothing submitted (no result file)" "$(ls "$W"/resmut/result-*.json 2>/dev/null | wc -l)" 0
chk "auth off: port free afterwards" "$(listeners 3969)" 0
chk "auth off: no api-keys.json left" "$([ -e "$R/api-keys.json" ] && echo LEFT || echo none)" none
chk "auth off: no process left in the scratch gateway dir" "$(gw_procs)" 0
echo "-- provider mismatch (the stand-in says it ran stub; we asked for gemini)"
endstand
STAND_IN_PROVIDER=stub standin gateway 3967
$RC --provider gemini $MG --label mismatch --ledger "$W/led5.json" --port 3967 --attach > "$W/run-mm.txt" 2>&1; chk "mismatch → exit 1" "$?" 1
grep MISMATCH "$W/run-mm.txt" | head -1
endstand

echo "-- guards"
mv "$W/gw/bunfig.toml" "$W/bunfig.keep"
$RC --provider xai $MX --label guard --ledger "$W/led3.json" --port 3963 > "$W/run-guard.txt" 2>&1; chk "real provider without refuse-fetch or --live-real → exit 2" "$?" 2
head -1 "$W/run-guard.txt"
printf '{"total_usd":0.4,"entries":[]}' > "$W/led3.json"
$RC --provider xai $MX --label stop --ledger "$W/led3.json" --port 3963 --est-usd 0.2 > "$W/run-stop.txt" 2>&1; chk "ledger 0.4 + 0.2 > 0.5 → exit 3 (stop)" "$?" 3
head -1 "$W/run-stop.txt"
chk "stop: ledger unchanged" "$(jq .total_usd "$W/led3.json")" 0.4
mv "$W/bunfig.keep" "$W/gw/bunfig.toml"
chk "every logged call is Gemini or xAI (nothing else tried)" "$(grep -vcE 'generativelanguage.googleapis.com|api.x.ai' "$OUTBOUND_LOG")" 0
chk "the allow-list refused nothing on the gemini and xai forced-failure runs (their own rows)" "$(jq -r .row.allow_list_refused "$W/res/result-gem-refused.json")/$(jq -r .row.allow_list_refused "$W/res/result-xai-refused.json")" 0/0
chk "run-check proved the allow-list loaded in the gateway it started" "$(grep -c 'allow-list check: preload LOADED' "$W/run-gem.txt")" 1
echo "listeners left on all test ports before the trap: $(listeners 3961 3962 3963 3965 3966 3967 3968 3969)"
chk "no listeners left on any test port" "$(listeners 3961 3962 3963 3965 3966 3967 3968 3969)" 0
echo "TOTAL failed checks: $FAIL"
exit $FAIL
