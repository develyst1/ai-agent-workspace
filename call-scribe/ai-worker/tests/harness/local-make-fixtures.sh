#!/usr/bin/env bash
# local-make-fixtures.sh — TEST-102's generated test files for REQ-101. Needs only ffmpeg. Touches no app and no provider.
#
# Proves:  every file below exists with the shape its case needs, regenerated the same way each run. Generated, so no
#          real recording can be among them (AC-12); tests/AUDIO-SOURCES.md lists them.
# Run:     bash tests/harness/local-make-fixtures.sh <empty output folder outside every repo>
# Does NOT prove anything about the app. Speech here is ffmpeg's English flite voices: enough to drive the pipeline and
#          the fake mic. NOT a stand-in for Thai in AC-3, AC-4, AC-5 or AC-19, which need the Thai source (TEST-102 Q1).
set -euo pipefail
OUT="${1:?usage: local-make-fixtures.sh <empty output folder outside every repo>}"
CHECK="$OUT"
while [ ! -d "$CHECK" ]; do CHECK=$(dirname "$CHECK"); done
if git -C "$CHECK" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "refused: $OUT is inside a git repo; generated audio stays outside every repo" >&2
  exit 1
fi
mkdir -p "$OUT"
cd "$OUT"
FF=(ffmpeg -hide_banner -loglevel error -y)

# Two distinct English synthetic voices, alternating, one mono 16 kHz file.
A='This is the first voice. The budget meeting moved to Friday.'
B='This is the second voice. I booked the room on the third floor.'
"${FF[@]}" -f lavfi -i "flite=text='$A':voice=slt" -ar 16000 -ac 1 _a.wav
"${FF[@]}" -f lavfi -i "flite=text='$B':voice=rms" -ar 16000 -ac 1 _b.wav
"${FF[@]}" -f lavfi -i "anullsrc=r=16000:cl=mono:d=0.6" _gap.wav
printf "file '%s'\n" _a.wav _gap.wav _b.wav _gap.wav _a.wav _gap.wav _b.wav > _list.txt
"${FF[@]}" -f concat -safe 0 -i _list.txt -c copy ok-en-two-voices.wav
rm -f _a.wav _b.wav _gap.wav _list.txt

# AC-2: the fake mic. Speech, then real silence, so a recording stopped before the file ends has a known tail.
"${FF[@]}" -i ok-en-two-voices.wav -f lavfi -i "anullsrc=r=48000:cl=mono:d=120" -filter_complex "[0:a]aresample=48000[s];[s][1:a]concat=n=2:v=0:a=1" -ac 1 -c:a pcm_s16le mic-en-then-silence.wav

# AC-1: the same speech in each common format. The SPEC's list replaces this one when it exists.
"${FF[@]}" -i ok-en-two-voices.wav -c:a libmp3lame ok-en.mp3
"${FF[@]}" -i ok-en-two-voices.wav -c:a aac ok-en.m4a
"${FF[@]}" -i ok-en-two-voices.wav -c:a libvorbis ok-en.ogg
"${FF[@]}" -i ok-en-two-voices.wav -c:a libopus ok-en.opus
"${FF[@]}" -i ok-en-two-voices.wav -c:a libopus -f webm ok-en.webm
"${FF[@]}" -i ok-en-two-voices.wav -c:a flac ok-en.flac
cp ok-en.mp3 'ไฟล์ทดสอบ ชื่อไทย มีวรรค (1).mp3'
cp ok-en.m4a ok-en-no-extension

# AC-21: video with speech, video with no sound at all. The picture carries a visible marker.
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 ok-en-two-voices.wav)
"${FF[@]}" -f lavfi -i "testsrc=size=720x1280:rate=30:duration=$DUR" -i ok-en-two-voices.wav -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest ok-en-screen.mp4
"${FF[@]}" -f lavfi -i "testsrc=size=720x1280:rate=30:duration=5" -c:v libx264 -pix_fmt yuv420p -an bad-video-no-sound.mp4

# AC-6: what must be refused, with nothing kept.
printf 'this is plain text, not audio\n' > bad-text-as.mp3
: > bad-zero.mp3
: > bad-zero.m4a
head -c 65536 /dev/urandom > bad-random.m4a
head -c 200 ok-en.m4a > bad-cut-header.m4a
# Mid-file corruption, per SPEC-102 § Questions Q4: a cut-off MP3 passes on purpose, but this must be refused.
{ head -c 20000 ok-en.mp3; head -c 20480 /dev/urandom; tail -c +20001 ok-en.mp3; } > bad-midfile-corrupt.mp3
# Decodable, but on no list: SPEC-102 validates by decoding, so this one should be accepted.
"${FF[@]}" -i ok-en-two-voices.wav -c:a wmav2 ok-en-unlisted.wma
"${FF[@]}" -f lavfi -i "testsrc=size=64x64:rate=1:duration=1" -frames:v 1 bad-image-as-.png
mv bad-image-as-.png bad-image-as.mp3
printf 'plain text with an ordinary name\n' > bad-plain.txt

# AC-14 neighbour: half of a valid MP3. Decodes, but is cut short. The expected handling is a question in TEST-101.
SIZE=$(wc -c < ok-en.mp3)
head -c $((SIZE / 2)) ok-en.mp3 > edge-half-of-mp3.mp3

# AC-20: no speech. Silence, steady noise, and tones standing in for music (AI transcribers can invent words on these).
"${FF[@]}" -f lavfi -i "anullsrc=r=16000:cl=mono:d=30" -c:a pcm_s16le nospeech-silence-30s.wav
"${FF[@]}" -f lavfi -i "anoisesrc=d=30:c=pink:r=16000:a=0.05" -ac 1 -c:a pcm_s16le nospeech-noise-30s.wav
"${FF[@]}" -f lavfi -i "aevalsrc='0.2*sin(2*PI*(220+110*floor(mod(t,4)))*t)':s=16000:d=30" -ac 1 -c:a pcm_s16le nospeech-tones-30s.wav
"${FF[@]}" -f lavfi -i "anullsrc=r=16000:cl=mono:d=0.1" -c:a pcm_s16le edge-silence-tenth-second.wav

for f in *; do
  size=$(wc -c < "$f")
  info=$(ffprobe -v error -show_entries stream=codec_type,codec_name -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null | tr '\n' ' ' || true)
  printf '%-44s %9s bytes  %s\n' "$f" "$size" "${info:-not decodable}"
done
