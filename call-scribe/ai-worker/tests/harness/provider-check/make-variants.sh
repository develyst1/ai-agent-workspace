#!/usr/bin/env bash
# TASK-103 variants. Builds clean, reference, leak, long from two time-aligned tracks with ffmpeg.
# Usage: make-variants.sh <voice-A-track> <voice-B-track> <outdir> [long-seconds, default 3600]
# Every variant except `reference` ends with the app's own normalise step (SPEC-102 § Intake).
# Only ffmpeg runs; no network. Audio goes where you point <outdir> (use mktemp -d, remove it after).
set -euo pipefail
A=${1:?usage: make-variants.sh <A-track> <B-track> <outdir> [long-seconds]}
B=${2:?}
OUT=${3:?}
LONG=${4:-3600}
mkdir -p "$OUT"
ff() { ffmpeg -y -v error -nostdin "$@"; }
norm() { ff -i "$1" -map 0:a:0 -vn -ac 1 -ar 16000 -c:a aac -b:a 40k -movflags +faststart "$2"; }

# clean: both voices at equal level
ff -i "$A" -i "$B" -filter_complex "amix=inputs=2:duration=longest:normalize=0" "$OUT/clean.wav"
norm "$OUT/clean.wav" "$OUT/clean.m4a"

# reference: the same mix, mono AAC 128 kbps, NOT normalised
ff -i "$OUT/clean.wav" -ac 1 -c:a aac -b:a 128k -movflags +faststart "$OUT/reference.m4a"

# leak: voice B through highpass 300 / lowpass 3400 / -25 dB, mixed with voice A at full level
ff -i "$A" -i "$B" -filter_complex "[1:a]highpass=f=300,lowpass=f=3400,volume=-25dB[b];[0:a][b]amix=inputs=2:duration=longest:normalize=0" "$OUT/leak.wav"
norm "$OUT/leak.wav" "$OUT/leak.m4a"

# long: clean looped to LONG seconds (default 60 minutes), for the output limit only
ff -stream_loop -1 -i "$OUT/clean.wav" -t "$LONG" "$OUT/long.wav"
norm "$OUT/long.wav" "$OUT/long.m4a"

rm -f "$OUT/long.wav"   # large; ffmpeg rebuilds it
for f in clean reference leak long; do
  printf '%s.m4a %s bytes %s s\n' "$f" "$(stat -c %s "$OUT/$f.m4a")" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$f.m4a" | cut -d. -f1)"
done
