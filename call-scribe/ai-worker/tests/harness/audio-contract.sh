#!/usr/bin/env bash
# TASK-101 harness: black-box check of the gateway /audio/* contract (SPEC-101).
# Usage: audio-contract.sh <port> [suite]     (server already running with the env the suite needs)
# Suites: main (default) fail truncated no_speech summary_fail timeout capacity ttl notconfigured auth
# Prints one "PASS <case>" or "FAIL <case>" per line, then "SUMMARY pass=<n> fail=<m>".
# Fixtures are generated with ffmpeg into a mktemp folder and removed on exit. No real recording.
# Optional env: KEY (bearer key sent on every call), KEY_A / KEY_B (auth suite).

PORT=${1:?usage: audio-contract.sh <port> [suite]}
SUITE=${2:-main}
BASE="http://localhost:$PORT"
W=$(mktemp -d)
trap 'rm -rf "$W"' EXIT
PASS=0; FAIL=0
AUTHH=()
[ -n "$KEY" ] && AUTHH=(-H "Authorization: Bearer $KEY")

ok()  { PASS=$((PASS+1)); echo "PASS $1"; }
bad() { FAIL=$((FAIL+1)); echo "FAIL $1 :: ${2:-}"; }
# eq <case> <got> <want>
eq()  { if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "got [$2] want [$3]"; fi; }

# http <METHOD> <path> [curl args...] -> $CODE, $BODY
http() {
  local m=$1 p=$2; shift 2
  CODE=$(curl -s -o "$W/body" -w '%{http_code}' -X "$m" "${AUTHH[@]}" "$@" "$BASE$p")
  BODY=$(cat "$W/body")
}
jqr() { printf '%s' "$BODY" | jq -r "$1" 2>/dev/null; }
post_file() { http POST /audio/transcriptions -F "file=@$1;filename=${2:-upload.bin}"; }
post_turns() { http POST /audio/summaries -H 'Content-Type: application/json' -d "$1"; }

# poll <job_id> [seconds] -> leaves the last job JSON in $BODY; returns when done|failed
poll() {
  local id=$1 max=${2:-30} i=0 s
  while [ $i -lt $((max*10)) ]; do
    http GET "/audio/jobs/$id"
    s=$(jqr .data.status)
    [ "$s" = done ] || [ "$s" = failed ] && return 0
    sleep 0.1; i=$((i+1))
  done
  return 1
}

TURNS='{"turns":[{"speaker":1,"text":"a"},{"speaker":2,"text":"b"}]}'

mkfix() { # sine tone fixtures, synthetic
  local T=(-loglevel error -y -f lavfi -i "sine=frequency=440:duration=2")
  ffmpeg "${T[@]}" -c:a aac "$W/a.m4a"
  ffmpeg "${T[@]}" -c:a aac -f adts "$W/a.aac"
  ffmpeg "${T[@]}" -c:a libmp3lame "$W/a.mp3"
  ffmpeg "${T[@]}" "$W/a.wav"
  ffmpeg "${T[@]}" -c:a libopus "$W/a.ogg"
  ffmpeg "${T[@]}" -c:a libopus "$W/a.webm"
  ffmpeg "${T[@]}" "$W/a.flac"
  ffmpeg -loglevel error -y -f lavfi -i "testsrc=duration=2:size=160x120:rate=10" -f lavfi -i "sine=frequency=440:duration=2" \
    -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest "$W/v.mp4"
  ffmpeg -loglevel error -y -f lavfi -i "testsrc=duration=2:size=160x120:rate=10" -f lavfi -i "sine=frequency=440:duration=2" \
    -c:v libvpx -c:a libopus -shortest "$W/v.webm"
  : > "$W/empty.bin"
  echo "this is plain text, not audio" > "$W/text.mp3"
}

submit_ok() { # submit an m4a, set JOB
  post_file "$W/a.m4a" a.m4a
  JOB=$(jqr .data.job_id)
}

case "$SUITE" in
main)
  mkfix
  # --- file_required
  http POST /audio/transcriptions -F "other=abc";                                      eq "file_required no file part: status" "$CODE" 400; eq "file_required no file part: error" "$(jqr .error)" file_required
  http POST /audio/transcriptions -H 'Content-Type: application/json' -d '{}';        eq "file_required JSON body: status" "$CODE" 400; eq "file_required JSON body: error" "$(jqr .error)" file_required
  http POST /audio/transcriptions -F "file=just text";                                 eq "file_required text field: status" "$CODE" 400; eq "file_required text field: error" "$(jqr .error)" file_required
  # --- unsupported / video
  post_file "$W/empty.bin" e.m4a;  eq "unsupported_audio 0-byte: status" "$CODE" 415; eq "unsupported_audio 0-byte: error" "$(jqr .error)" unsupported_audio
  post_file "$W/text.mp3" t.mp3;   eq "unsupported_audio text renamed mp3: status" "$CODE" 415; eq "unsupported_audio text renamed mp3: error" "$(jqr .error)" unsupported_audio
  post_file "$W/v.mp4" v.m4a;      eq "video_not_allowed mp4: status" "$CODE" 415; eq "video_not_allowed mp4: error" "$(jqr .error)" video_not_allowed
  post_file "$W/v.webm" v.webm;    eq "video_not_allowed webm: status" "$CODE" 415; eq "video_not_allowed webm: error" "$(jqr .error)" video_not_allowed
  # --- every format accepted by bytes (the file name lies on purpose) and reaching done
  for ext in m4a aac mp3 wav ogg webm flac; do
    post_file "$W/a.$ext" "lie.txt"
    eq "202 $ext: status" "$CODE" 202
    J=$(jqr .data.job_id)
    eq "202 $ext: first status" "$(jqr .data.status)" queued
    if poll "$J" 30; then eq "$ext reaches done" "$(jqr .data.status)" done; else bad "$ext reaches done" "timeout"; fi
  done
  # --- shape of a transcription job
  submit_ok; eq "submit for shape: 202" "$CODE" 202
  sleep 0.1; http GET "/audio/jobs/$JOB"
  s=$(jqr .data.status); if [ "$s" = queued ] || [ "$s" = running ]; then ok "queued or running before done"; else bad "queued or running before done" "got $s"; fi
  poll "$JOB" 30
  eq "job keys" "$(jqr '.data|keys|join(",")')" "job_id,kind,result,status"
  eq "job kind" "$(jqr .data.kind)" transcription
  eq "result keys" "$(jqr '.data.result|keys|join(",")')" "latency_ms,model,no_speech,provider,speaker_count,turns"
  eq "turn keys" "$(jqr '.data.result.turns[0]|keys|join(",")')" "speaker,text"
  eq "speaker_count" "$(jqr .data.result.speaker_count)" 2
  eq "turns count" "$(jqr '.data.result.turns|length')" 4
  eq "no_speech false" "$(jqr .data.result.no_speech)" false
  eq "provider" "$(jqr .data.result.provider)" stub
  eq "speakers numbered from 1 by first appearance" "$(jqr '[.data.result.turns[].speaker]|join(",")')" "1,2,1,2"
  if [ "$(jqr '.data.result.latency_ms|type')" = number ]; then ok "latency_ms is a number"; else bad "latency_ms is a number"; fi
  # --- summaries
  post_turns '{"turns":[]}';                                   eq "turns_required empty: status" "$CODE" 400; eq "turns_required empty: error" "$(jqr .error)" turns_required
  post_turns '{not json';                                      eq "turns_required bad JSON: status" "$CODE" 400; eq "turns_required bad JSON: error" "$(jqr .error)" turns_required
  post_turns '{"turns":[{"text":"x"}]}';                       eq "turns_required no speaker: status" "$CODE" 400; eq "turns_required no speaker: error" "$(jqr .error)" turns_required
  post_turns '{"turns":[{"speaker":"1","text":"x"}]}';         eq "turns_required string speaker" "$(jqr .error)" turns_required
  post_turns '{"turns":[{"speaker":1,"text":"  "}]}';          eq "turns_required blank text" "$(jqr .error)" turns_required
  post_turns '{}';                                             eq "turns_required missing" "$(jqr .error)" turns_required
  { printf '{"turns":[{"speaker":1,"text":"'; head -c 5400000 /dev/zero | tr '\0' a; printf '"}]}'; } > "$W/big.json"
  http POST /audio/summaries -H 'Content-Type: application/json' --data-binary "@$W/big.json"
  eq "body_too_large: status" "$CODE" 413; eq "body_too_large: error" "$(jqr .error)" body_too_large
  post_turns "$TURNS"; eq "summary 202" "$CODE" 202; SJ=$(jqr .data.job_id)
  poll "$SJ" 30
  eq "summary done" "$(jqr .data.status)" done
  eq "summary kind" "$(jqr .data.kind)" summary
  eq "summary result keys" "$(jqr '.data.result|keys|join(",")')" "latency_ms,model,provider,summary"
  if [ -n "$(jqr .data.result.summary)" ]; then ok "summary is non-empty text"; else bad "summary is non-empty text"; fi
  # --- unknown job
  http GET /audio/jobs/does-not-exist; eq "job_not_found: status" "$CODE" 404; eq "job_not_found: error" "$(jqr .error)" job_not_found
  # --- size
  head -c $((101*1024*1024)) /dev/zero > "$W/big101.bin"
  post_file "$W/big101.bin" big.m4a; eq "101 MiB: status" "$CODE" 413; eq "101 MiB: error" "$(jqr .error)" file_too_large
  rm -f "$W/big101.bin"
  head -c $((129*1024*1024)) /dev/zero > "$W/big129.bin"
  post_file "$W/big129.bin" big.m4a; eq "129 MiB: status" "$CODE" 413; eq "129 MiB: empty body" "${#BODY}" 0
  ;;

fail|truncated|no_speech|summary_fail)
  mkfix
  submit_ok; eq "$SUITE: 202" "$CODE" 202
  poll "$JOB" 30
  case "$SUITE" in
  fail)
    eq "fail: transcription failed" "$(jqr .data.status)" failed
    eq "fail: code" "$(jqr .data.error.code)" provider_failed
    eq "fail: retryable true" "$(jqr .data.error.retryable)" true ;;
  truncated)
    eq "truncated: transcription failed" "$(jqr .data.status)" failed
    eq "truncated: code" "$(jqr .data.error.code)" output_truncated
    eq "truncated: retryable false" "$(jqr .data.error.retryable)" false
    eq "truncated: no result" "$(jqr '.data|has("result")')" false ;;
  no_speech)
    eq "no_speech: done" "$(jqr .data.status)" done
    eq "no_speech: flag" "$(jqr .data.result.no_speech)" true
    eq "no_speech: turns empty" "$(jqr '.data.result.turns|length')" 0
    eq "no_speech: speaker_count 0" "$(jqr .data.result.speaker_count)" 0 ;;
  summary_fail)
    eq "summary_fail: transcription done" "$(jqr .data.status)" done
    post_turns "$TURNS"; SJ=$(jqr .data.job_id); poll "$SJ" 30
    eq "summary_fail: summary failed" "$(jqr .data.status)" failed
    eq "summary_fail: code" "$(jqr .data.error.code)" provider_failed
    eq "summary_fail: retryable true" "$(jqr .data.error.retryable)" true ;;
  esac
  echo "RESULT[$SUITE] $(printf '%s' "$BODY" | jq -c .)"
  ;;

timeout)
  mkfix
  T0=$(date +%s%N); submit_ok; poll "$JOB" 30; T1=$(date +%s%N)
  eq "timeout: failed" "$(jqr .data.status)" failed
  eq "timeout: code" "$(jqr .data.error.code)" provider_timeout
  eq "timeout: retryable true" "$(jqr .data.error.retryable)" true
  MS=$(( (T1-T0)/1000000 ))
  if [ "$MS" -lt 1500 ]; then ok "timeout: ended in ${MS} ms, well before the 2000 ms stub delay"; else bad "timeout: too slow" "${MS} ms"; fi
  ;;

capacity)
  mkfix
  submit_ok; eq "capacity: first 202" "$CODE" 202; FIRST=$JOB
  post_file "$W/a.m4a" a.m4a; eq "capacity: second during first: status" "$CODE" 429; eq "capacity: second: error" "$(jqr .error)" busy
  post_turns "$TURNS";         eq "capacity: summary during first: status" "$CODE" 429
  poll "$FIRST" 30; eq "capacity: first done" "$(jqr .data.status)" done
  post_file "$W/a.m4a" a.m4a; eq "capacity: after first ended: 202" "$CODE" 202
  ;;

ttl)
  mkfix
  submit_ok; poll "$JOB" 30; eq "ttl: done" "$(jqr .data.status)" done
  sleep 2
  http GET "/audio/jobs/$JOB"; eq "ttl: 2 s later status" "$CODE" 404; eq "ttl: 2 s later error" "$(jqr .error)" job_not_found
  ;;

notconfigured)
  mkfix
  post_file "$W/a.m4a" a.m4a; eq "notconfigured transcription: status" "$CODE" 503; eq "notconfigured transcription: error" "$(jqr .error)" audio_not_configured
  post_turns "$TURNS";        eq "notconfigured summary: status" "$CODE" 503;       eq "notconfigured summary: error" "$(jqr .error)" audio_not_configured
  ;;

auth)
  mkfix
  : "${KEY_A:?KEY_A}"; : "${KEY_B:?KEY_B}"
  AUTHH=()
  http POST /audio/transcriptions -F "file=@$W/a.m4a"; eq "auth: no header status" "$CODE" 401; eq "auth: no header error" "$(jqr .error)" unauthorized
  http GET /audio/jobs/x;                              eq "auth: GET no header status" "$CODE" 401
  AUTHH=(-H "Authorization: Bearer nope"); http GET /audio/jobs/x; eq "auth: unknown key status" "$CODE" 401
  AUTHH=(-H "Authorization: Bearer $KEY_A"); submit_ok; eq "auth: key A submits" "$CODE" 202; poll "$JOB" 30
  AUTHH=(-H "Authorization: Bearer $KEY_B"); http GET "/audio/jobs/$JOB"; eq "auth: key B reads A's job: status" "$CODE" 404; eq "auth: key B: error" "$(jqr .error)" job_not_found
  AUTHH=(-H "Authorization: Bearer $KEY_A"); http GET "/audio/jobs/$JOB"; eq "auth: key A reads own job" "$CODE" 200
  ;;

*) echo "unknown suite $SUITE"; exit 2 ;;
esac

echo "SUMMARY pass=$PASS fail=$FAIL"
[ "$FAIL" -eq 0 ]
