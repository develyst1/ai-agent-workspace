#!/usr/bin/env bash
# Synthetic fixtures for TASK-109 (record in the app). Chrome's fake microphone plays these in a loop.
#   bash make-fixtures-109.sh <empty output folder>
# tone.wav = a 440 Hz tone with a steady level; silence.wav = digital silence. No voice, no real recording, ever.
set -euo pipefail
out="${1:?usage: make-fixtures-109.sh <empty output folder>}"
mkdir -p "$out"
if [ -n "$(ls -A "$out")" ]; then echo "refusing: $out is not empty" >&2; exit 2; fi
ffmpeg -y -v error -nostdin -f lavfi -i "sine=frequency=440:duration=30:sample_rate=48000" -ac 1 -c:a pcm_s16le "$out/tone.wav"
ffmpeg -y -v error -nostdin -f lavfi -i "anullsrc=r=48000:cl=mono" -t 30 -c:a pcm_s16le "$out/silence.wav"
ls -l "$out"
