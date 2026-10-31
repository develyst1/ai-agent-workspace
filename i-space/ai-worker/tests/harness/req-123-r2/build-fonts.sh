#!/usr/bin/env bash
# REQ-123 round 2 (SPEC-122): build the four Blueprint theme fonts as local woff2 files, once.
# The build of blueprint-front then needs no internet for fonts.
#   bash build-fonts.sh <out-dir> <work-dir>
# Source: google/fonts (OFL), pinned to one commit, so a re-run gives the same files.
# Each file: width pinned to 100 (as Google serves it), weight kept variable over the range the theme uses,
# every code point the source has (Thai + Latin + Latin-ext + Vietnamese), all layout features, woff2.
set -euo pipefail
OUT=${1:?out-dir}; WORK=${2:?work-dir}
REV=${FONTS_REV:-main}
mkdir -p "$OUT" "$WORK/src"
[ -x "$WORK/venv/bin/python" ] || { python3 -m venv "$WORK/venv"; "$WORK/venv/bin/pip" -q install fonttools==4.65.0 brotli; }
PY="$WORK/venv/bin/python"

# name | path in google/fonts | axis limits | output file
while IFS='|' read -r path limits out; do
  src="$WORK/src/$(basename "$path")"
  [ -s "$src" ] || curl -sfL -o "$src" "https://raw.githubusercontent.com/google/fonts/$REV/$(printf '%s' "$path" | sed 's/\[/%5B/;s/\]/%5D/')"
  # shellcheck disable=SC2086
  "$PY" -m fontTools.varLib.instancer "$src" $limits -o "$WORK/inst-$out.ttf" -q
  "$PY" -m fontTools.subset "$WORK/inst-$out.ttf" --unicodes='*' --layout-features='*' --flavor=woff2 \
    --output-file="$OUT/$out"
  # The OFL asks for its text to travel with the font: <name>.OFL.txt next to each file.
  curl -sfL -o "$OUT/${out%.woff2}.OFL.txt" "https://raw.githubusercontent.com/google/fonts/$REV/$(dirname "$path")/OFL.txt"
  echo "$out $(stat -c %s "$OUT/$out") $(sha256sum "$OUT/$out" | cut -c1-12)"
done <<'EOF'
ofl/anuphan/Anuphan[wght].ttf|wght=400:700|anuphan.woff2
ofl/notosansthai/NotoSansThai[wdth,wght].ttf|wdth=100 wght=400:800|noto-sans-thai.woff2
ofl/notosansthailooped/NotoSansThaiLooped[wdth,wght].ttf|wdth=100 wght=400:600|noto-sans-thai-looped.woff2
ofl/notoserifthai/NotoSerifThai[wdth,wght].ttf|wdth=100 wght=500:700|noto-serif-thai.woff2
EOF
