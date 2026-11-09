#!/usr/bin/env bash
# TASK-101 driver: starts the gateway once per scenario, runs audio-contract.sh, stops it by port.
# Usage: audio-run-all.sh <path-to-develyst-ai-repo>     (path comes from machine.local.md)
# Needs: bun, ffmpeg, curl, jq, fuser. Writes only to a mktemp folder, plus a temporary
# api-keys.json (git-ignored) in the repo for the auth scenario, removed at the end.

REPO=${1:?usage: audio-run-all.sh <repo>}
if grep -Eqs '^[[:space:]]*(export[[:space:]]+)?AUDIO_(TRANSCRIBE|SUMMARY)_PROVIDER=["'"'"']?[[:alnum:]]' "$REPO/.env"; then
  echo "REFUSING: $REPO/.env names an AUDIO provider, so the notconfigured suite would call it. Pass it on the command line instead."; exit 2
fi
HERE=$(cd "$(dirname "$0")" && pwd)
W=$(mktemp -d)
TOTAL_FAIL=0
BASEPORT=3951

stop() { fuser -k "$1/tcp" >/dev/null 2>&1; sleep 0.3; }
cleanup() { for p in $(seq $BASEPORT 3960) 3942; do stop "$p"; done; rm -f "$REPO/api-keys.json.bobtmp"; rm -rf "$W"; }
trap cleanup EXIT

# run_suite <suite> <port> [ENV=val ...]
run_suite() {
  local suite=$1 port=$2; shift 2
  stop "$port"
  ( cd "$REPO" && env PORT="$port" "$@" bun run start > "$W/server-$suite.log" 2>&1 ) &
  for _ in $(seq 1 50); do curl -s -o /dev/null "http://localhost:$port/" && break; sleep 0.1; done
  echo "=== suite=$suite port=$port env: $*"
  bash "$HERE/audio-contract.sh" "$port" "$suite" | tee "$W/out-$suite.txt"
  grep -q 'SUMMARY.*fail=0' "$W/out-$suite.txt" || TOTAL_FAIL=$((TOTAL_FAIL+1))
  stop "$port"
}

STUB="AUTH_ENABLED=false AUDIO_TRANSCRIBE_PROVIDER=stub AUDIO_SUMMARY_PROVIDER=stub"
run_suite main          3951 $STUB AUDIO_STUB_DELAY_MS=500
cp "$W/server-main.log" "$W/main.log"
run_suite fail          3952 $STUB AUDIO_STUB_DELAY_MS=100 AUDIO_STUB_MODE=fail
run_suite truncated     3953 $STUB AUDIO_STUB_DELAY_MS=100 AUDIO_STUB_MODE=truncated
run_suite no_speech     3954 $STUB AUDIO_STUB_DELAY_MS=100 AUDIO_STUB_MODE=no_speech
run_suite summary_fail  3955 $STUB AUDIO_STUB_DELAY_MS=100 AUDIO_STUB_MODE=summary_fail
run_suite timeout       3956 $STUB AUDIO_JOB_TIMEOUT_MS=200 AUDIO_STUB_DELAY_MS=2000
run_suite capacity      3957 $STUB AUDIO_MAX_CONCURRENT=1 AUDIO_STUB_DELAY_MS=3000
run_suite ttl           3958 $STUB AUDIO_JOB_TTL_MS=1000 AUDIO_STUB_DELAY_MS=100
run_suite notconfigured 3959 AUTH_ENABLED=false

# auth: two throwaway keys for two projects, AUTH_ENABLED unset
if [ -e "$REPO/api-keys.json" ]; then echo "REFUSING: $REPO/api-keys.json already exists"; exit 2; fi
KA=throwaway-key-a-$RANDOM; KB=throwaway-key-b-$RANDOM
printf '[{"key":"%s","project":"proj-a"},{"key":"%s","project":"proj-b"}]\n' "$KA" "$KB" > "$REPO/api-keys.json"
stop 3960
( cd "$REPO" && env PORT=3960 AUDIO_TRANSCRIBE_PROVIDER=stub AUDIO_SUMMARY_PROVIDER=stub AUDIO_STUB_DELAY_MS=100 bun run start > "$W/server-auth.log" 2>&1 ) &
for _ in $(seq 1 50); do curl -s -o /dev/null "http://localhost:3960/" && break; sleep 0.1; done
echo "=== suite=auth port=3960 (AUTH_ENABLED unset, two throwaway keys)"
KEY_A=$KA KEY_B=$KB bash "$HERE/audio-contract.sh" 3960 auth | tee "$W/out-auth.txt"
grep -q 'SUMMARY.*fail=0' "$W/out-auth.txt" || TOTAL_FAIL=$((TOTAL_FAIL+1))
stop 3960
rm -f "$REPO/api-keys.json"
echo "api-keys.json removed: $([ -e "$REPO/api-keys.json" ] && echo NO || echo yes)"

# production guard
echo "=== production guard"
( cd "$REPO" && NODE_ENV=production AUDIO_TRANSCRIBE_PROVIDER=stub PORT=3942 bun run start > "$W/prod.log" 2>&1 ); echo "exit code: $?"
cat "$W/prod.log"
( cd "$REPO" && NODE_ENV=production AUDIO_TRANSCRIBE_PROVIDER=stub AUDIO_SUMMARY_PROVIDER=stub PORT=3942 bun run start > /dev/null 2>&1 ); echo "exit code (both stub): $?"

# log: no stub Thai word, show one [audio] line
echo "=== log check (main run)"
if grep -E 'พัสดุ|สวัสดี|ติดตาม' "$W/main.log"; then echo "FAIL log contains stub text"; TOTAL_FAIL=$((TOTAL_FAIL+1)); else echo "PASS no stub Thai word in server log"; fi
grep -m1 '^\[audio\]' "$W/main.log"

echo "TOTAL suites failed: $TOTAL_FAIL"
[ "$TOTAL_FAIL" -eq 0 ]
