#!/usr/bin/env bash
# TASK-102 harness: runs the REAL /audio routes with the Gemini and xAI adapters against a stubbed fetch
# (audio-adapter-stub.ts, bun --preload). No request leaves the machine; no key is real.
# Usage: GATEWAY_REPO=<develyst-ai path from machine.local.md> bash audio-adapters.sh <port>
# Uses <port> and <port>+1, stops only those two (by port). Prints PASS/FAIL lines and "SUMMARY pass=<n> fail=<m>".

PORT=${1:?usage: GATEWAY_REPO=<repo> audio-adapters.sh <port>}
: "${GATEWAY_REPO:?set GATEWAY_REPO}"
HERE=$(cd "$(dirname "$0")" && pwd)
W=$(mktemp -d)
CASEFILE=$W/case; OUTLOG=$W/out.log; SERVERLOG=$W/server.log; ALLBODIES=$W/bodies.txt
: > "$ALLBODIES"
PASS=0; FAIL=0

stop() { fuser -k "$1/tcp" >/dev/null 2>&1; sleep 0.3; }
trap 'stop $PORT; stop $((PORT+1)); rm -rf "$W"' EXIT
ok()  { PASS=$((PASS+1)); echo "PASS $1"; }
bad() { FAIL=$((FAIL+1)); echo "FAIL $1 :: ${2:-}"; }
eq()  { if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "got [$2] want [$3]"; fi; }

ffmpeg -loglevel error -y -f lavfi -i "sine=frequency=440:duration=2" -c:a aac "$W/a.m4a"
TURNS='{"turns":[{"speaker":1,"text":"a"},{"speaker":2,"text":"b"}]}'

# start <port> <provider> <GEMINI_API_KEY> <XAI_API_KEY>
start() {
  stop "$1"
  ( cd "$GATEWAY_REPO" && env PORT="$1" AUTH_ENABLED=false AUDIO_TRANSCRIBE_PROVIDER="$2" AUDIO_SUMMARY_PROVIDER="$2" \
      AUDIO_JOB_TIMEOUT_MS=20000 GEMINI_API_KEY="$3" XAI_API_KEY="$4" CASEFILE="$CASEFILE" OUTLOG="$OUTLOG" \
      bun --preload "$HERE/audio-adapter-stub.ts" src/index.ts >> "$SERVERLOG" 2>&1 ) &
  for _ in $(seq 1 60); do curl -s -o /dev/null "http://localhost:$1/" && return 0; sleep 0.1; done
  bad "server start on $1"; return 1
}

BODY=""; CODE=""
get_job() { CODE=$(curl -s -o "$W/b" -w '%{http_code}' "http://localhost:$PORT/audio/jobs/$1"); BODY=$(cat "$W/b"); echo "$BODY" >> "$ALLBODIES"; }
jqr() { printf '%s' "$BODY" | jq -r "$1" 2>/dev/null; }
poll() { local i=0 s; while [ $i -lt 400 ]; do get_job "$1"; s=$(jqr .data.status); { [ "$s" = done ] || [ "$s" = failed ]; } && return 0; sleep 0.1; i=$((i+1)); done; return 1; }

# run <T|S> <case>  -> leaves the finished job in $BODY
run() {
  echo "$2" > "$CASEFILE"; : > "$OUTLOG"
  if [ "$1" = T ]; then
    CODE=$(curl -s -o "$W/p" -w '%{http_code}' -F "file=@$W/a.m4a" "http://localhost:$PORT/audio/transcriptions")
  else
    CODE=$(curl -s -o "$W/p" -w '%{http_code}' -H 'Content-Type: application/json' -d "$TURNS" "http://localhost:$PORT/audio/summaries")
  fi
  cat "$W/p" >> "$ALLBODIES"
  [ "$CODE" = 202 ] || { bad "$P $1 $2: POST status" "$CODE $(cat "$W/p")"; BODY=""; return 1; }
  poll "$(jq -r .data.job_id "$W/p")" || { bad "$P $1 $2: never finished"; return 1; }
}

# fails <T|S> <case> <code> <retryable>
fails() {
  local l="$P $1 $2"
  run "$1" "$2" || return
  eq "$l: failed" "$(jqr .data.status)" failed
  eq "$l: code" "$(jqr .data.error.code)" "$3"
  eq "$l: retryable" "$(jqr .data.error.retryable)" "$4"
  eq "$l: no result" "$(jqr '.data|has("result")')" false
}

for P in gemini xai; do
  echo "=== provider=$P"
  start "$PORT" "$P" SENTINELKEY SENTINELXAIKEY || continue

  # ---- transcription
  run T ok; l="$P T ok"
  eq "$l: done" "$(jqr .data.status)" done
  eq "$l: provider" "$(jqr .data.result.provider)" "$P"
  if [ "$P" = gemini ]; then
    eq "$l: speakers 1,2,1" "$(jqr '[.data.result.turns[].speaker]|join(",")')" "1,2,1"
  else
    eq "$l: xAI 0-based speakers come out as 1,2" "$(jqr '[.data.result.turns[].speaker]|join(",")')" "1,2"
    eq "$l: Thai words joined without space" "$(jqr '.data.result.turns[0].text')" "สวัสดีครับ"
    eq "$l: other words joined with a space" "$(jqr '.data.result.turns[1].text')" "hello world"
  fi
  eq "$l: speaker_count" "$(jqr .data.result.speaker_count)" 2
  eq "$l: no error key" "$(jqr '.data|has("error")')" false
  # outbound checks on the successful run
  if [ "$P" = xai ]; then
    eq "$l: xAI URL" "$(jq -r 'select(.method=="POST")|.url' "$OUTLOG" | head -1)" "https://api.x.ai/v1/stt"
    eq "$l: multipart fields in order, file last" "$(jq -r '.fields|join(",")' "$OUTLOG")" "diarize,language,file"
    eq "$l: bearer header sent" "$(jq -r '.headers|index("authorization")!=null' "$OUTLOG")" true
  else
    eq "$l: no key= in any URL" "$(grep -c 'key=' "$OUTLOG")" 0
    eq "$l: api calls carry x-goog-api-key header" \
      "$(jq -s '[.[]|select(.url|test("stub-session")|not)|.headers|index("x-goog-api-key")!=null]|all' "$OUTLOG")" true
    eq "$l: upload target never gets the key" \
      "$(jq -s '[.[]|select(.url|test("stub-session"))|.headers|index("x-goog-api-key")==null]|all' "$OUTLOG")" true
    eq "$l: last call is the file DELETE" "$(tail -1 "$OUTLOG" | jq -r '.method+" "+.url')" "DELETE https://generativelanguage.googleapis.com/v1beta/files/stub1"
    eq "$l: DELETE came after generateContent" \
      "$(jq -s 'map(.url|test("generateContent")) as $g | map(.method=="DELETE") as $d | ($g|index(true)) < ($d|index(true))' "$OUTLOG")" true
  fi
  eq "$l: every fetch got a signal" "$(grep -c '"signal":"NO"' "$OUTLOG")" 0
  eq "$l: nothing left for an unexpected host" "$(grep -c UNEXPECTED_HOST "$OUTLOG")" 0

  run T empty;       eq "$P T empty: done" "$(jqr .data.status)" done; eq "$P T empty: no_speech" "$(jqr .data.result.no_speech)" true
  if [ "$P" = gemini ]; then
    run T blank_text; eq "$P T blank_text: no_speech (shared normaliser)" "$(jqr .data.result.no_speech)" true
    run T processing; eq "$P T processing: waits for ACTIVE, then done" "$(jqr .data.status)" done
    fails T max_tokens output_truncated false
    fails T safety provider_response_invalid true
    fails T no_candidates provider_response_invalid true
    fails T schema_bad provider_response_invalid true
    fails T speaker_string provider_response_invalid true
    fails T upload_no_name provider_response_invalid true
    fails T upload_400 provider_rejected_audio false
  else
    fails T no_words provider_response_invalid true
    fails T no_speaker provider_response_invalid true
    fails T no_text provider_response_invalid true
    fails T http415 provider_rejected_audio false
  fi
  fails T garbage provider_response_invalid true
  for s in 400 413 422; do fails T http$s provider_rejected_audio false; done
  for s in 401 403 429 500 503; do fails T http$s provider_failed true; done
  fails T net provider_failed true
  fails T throw_type provider_failed true
  if [ "$P" = gemini ]; then
    # the uploaded file is deleted after a FAILURE too
    run T http500
    eq "$P T http500: last call is the file DELETE" "$(tail -1 "$OUTLOG" | jq -r '.method')" DELETE
    eq "$P T http500: DELETE came after generateContent" \
      "$(jq -s 'map(.url|test("generateContent")) as $g | map(.method=="DELETE") as $d | ($g|index(true)) < ($d|index(true))' "$OUTLOG")" true
  fi

  # ---- summary
  run S ok; l="$P S ok"
  eq "$l: done" "$(jqr .data.status)" done
  eq "$l: summary keys" "$(jqr '.data.result|keys|join(",")')" "latency_ms,model,provider,summary"
  if [ "$P" = gemini ]; then
    eq "$l: both parts joined" "$(jqr .data.result.summary)" "ส่วนแรก ส่วนที่สอง"
    eq "$l: no key= in any URL" "$(grep -c 'key=' "$OUTLOG")" 0
    eq "$l: x-goog-api-key header" "$(jq -s 'all(.[]; .headers|index("x-goog-api-key")!=null)' "$OUTLOG")" true
  else
    eq "$l: summary text" "$(jqr .data.result.summary)" "สรุปจาก xAI"
    eq "$l: chat URL" "$(jq -r .url "$OUTLOG")" "https://api.x.ai/v1/chat/completions"
  fi
  if [ "$P" = gemini ]; then
    fails S max_tokens output_truncated false
    fails S safety provider_response_invalid true
  else
    fails S length output_truncated false
    fails S filter provider_response_invalid true
    fails S no_choices provider_response_invalid true
  fi
  fails S empty provider_response_invalid true
  fails S garbage provider_response_invalid true
  for s in 400 401 403 429 500; do fails S http$s provider_failed true; done   # 400-class on a summary is NOT "rejected audio"
  fails S net provider_failed true

  # ---- logs: code= and cause=, no provider text
  echo throw_type > "$CASEFILE"; run T throw_type
  LASTFAIL=$(grep 'status=failed' "$SERVERLOG" | tail -1)
  if printf '%s' "$LASTFAIL" | grep -q 'status=failed code=provider_failed cause=TypeError$'; then ok "$P: failed-job log line ends code=provider_failed cause=TypeError"; else bad "$P: failed-job log line" "$LASTFAIL"; fi
  echo "--- last failed-job line ($P): $LASTFAIL"
  stop "$PORT"
done

# ---- a provider whose key is empty is "not configured" for both routes
for P in gemini xai; do
  start $((PORT+1)) "$P" "" "" || continue
  CODE=$(curl -s -o "$W/p" -w '%{http_code}' -F "file=@$W/a.m4a" "http://localhost:$((PORT+1))/audio/transcriptions")
  eq "$P empty key: transcription status" "$CODE" 503; eq "$P empty key: transcription error" "$(jq -r .error "$W/p")" audio_not_configured
  CODE=$(curl -s -o "$W/p" -w '%{http_code}' -H 'Content-Type: application/json' -d "$TURNS" "http://localhost:$((PORT+1))/audio/summaries")
  eq "$P empty key: summary status" "$CODE" 503; eq "$P empty key: summary error" "$(jq -r .error "$W/p")" audio_not_configured
  stop $((PORT+1))
done

# ---- secrets and provider text stay out of every response and the server's output
for s in SENTINELKEY SENTINELXAIKEY SENTINELTEXT; do
  eq "grep -c $s in server output" "$(grep -c "$s" "$SERVERLOG")" 0
  eq "grep -c $s in every response body" "$(grep -c "$s" "$ALLBODIES")" 0
done

echo "SUMMARY pass=$PASS fail=$FAIL"
[ "$FAIL" -eq 0 ]
