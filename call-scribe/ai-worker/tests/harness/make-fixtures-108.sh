#!/usr/bin/env bash
# Synthetic fixtures for TASK-108 (pick, strip, send). Tones and test patterns only: no real recording, ever.
#   bash make-fixtures-108.sh <empty output folder> [big]
# `big` adds big-video.mp4 (about 600 MB, takes a while). Needs ffmpeg. Nothing here goes into a product repo.
set -euo pipefail
out="${1:?usage: make-fixtures-108.sh <empty output folder> [big]}"
mkdir -p "$out"
if [ -n "$(ls -A "$out")" ]; then echo "refusing: $out is not empty" >&2; exit 2; fi
f() { ffmpeg -y -v error -nostdin "$@"; }
tone() { echo "-f lavfi -i sine=frequency=440:duration=${1:-6}"; }

# AC-1: one short tone per format
f $(tone) -c:a aac "$out/tone.m4a"
f $(tone) -c:a libmp3lame "$out/tone.mp3"
f $(tone) "$out/tone.wav"
f $(tone) -c:a libopus "$out/tone.ogg"
f $(tone) -c:a libopus "$out/tone.webm"
f $(tone) "$out/tone.flac"

# AC-6: files the back must refuse (named bad-* so the stand-in back refuses them too)
echo "this is plain text, not audio" > "$out/bad-text.mp3"
head -c 20000 /dev/urandom > "$out/bad-random.m4a"
: > "$out/bad-empty.m4a"

# AC-21: video with sound (10 s, high bitrate so the picture dominates) and its audio track alone
f -f lavfi -i testsrc2=size=1280x720:rate=30:duration=10 $(tone 10) -c:v libx264 -preset ultrafast -b:v 6M -c:a aac -shortest "$out/video-sound.mp4"
f -i "$out/video-sound.mp4" -vn -c:a copy "$out/video-sound-audio-only.m4a"
# video with no sound at all
f -f lavfi -i testsrc2=size=640x360:rate=30:duration=5 -c:v libx264 -preset ultrafast "$out/video-nosound.mp4"

# TASK-111: a video cut short before its index (moov is at the end), so the strip cannot read it
head -c 100000 "$out/video-sound.mp4" > "$out/bad-video.mp4"

# AC-14: audio larger than one 5 MiB piece (about 14 MB, three pieces)
f $(tone 80) -ar 44100 -ac 2 "$out/long.wav"

if [ "${2:-}" = "big" ]; then
  # about 600 MB: 10 minutes at 8 Mbps, with sound
  f -f lavfi -i testsrc2=size=1280x720:rate=30:duration=600 $(tone 600) -c:v libx264 -preset ultrafast -b:v 8M -maxrate 8M -bufsize 16M -c:a aac -shortest "$out/big-video.mp4"
fi
ls -l "$out"
