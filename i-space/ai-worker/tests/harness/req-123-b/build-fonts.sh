#!/usr/bin/env bash
# REQ-123 Team B (SPEC-123 D6): build caw-front's one font, IBM Plex Sans Thai 400 / 500 / 600, as local woff2 files, once.
# The build of caw-front then needs no internet for fonts (the same defect TEST-120 DEF-1 found in blueprint-front).
#   bash build-fonts.sh <out-dir> <work-dir>
# Source: google/fonts (OFL), pinned to the commit SPEC-122 used, so a re-run reads the same sources.
# The family is static (one file per weight): no instancer step, only a subset with every code point and layout feature, to woff2.
set -euo pipefail
OUT=${1:?out-dir}; WORK=${2:?work-dir}
REV=${FONTS_REV:-6157dfaa640c}
mkdir -p "$OUT" "$WORK/src"
[ -x "$WORK/venv/bin/python" ] || { python3 -m venv "$WORK/venv"; "$WORK/venv/bin/pip" -q install fonttools==4.65.0 brotli; }
PY="$WORK/venv/bin/python"
BASE="https://raw.githubusercontent.com/google/fonts/$REV/ofl/ibmplexsansthai"

for pair in Regular:400 Medium:500 SemiBold:600; do
  name=${pair%%:*}; weight=${pair##*:}
  src="$WORK/src/IBMPlexSansThai-$name.ttf"
  [ -s "$src" ] || curl -sfL -o "$src" "$BASE/IBMPlexSansThai-$name.ttf"
  out="ibm-plex-sans-thai-$weight.woff2"
  "$PY" -I -m fontTools.subset "$src" --unicodes='*' --layout-features='*' --flavor=woff2 --output-file="$OUT/$out"
  echo "$out $(stat -c %s "$OUT/$out") $(sha256sum "$OUT/$out" | cut -c1-12)"
done
# The OFL asks for its text to travel with the font.
curl -sfL -o "$OUT/ibm-plex-sans-thai.OFL.txt" "$BASE/OFL.txt"
(cd "$OUT" && sha256sum ./*.woff2 ./*.OFL.txt > SHA256SUMS)
