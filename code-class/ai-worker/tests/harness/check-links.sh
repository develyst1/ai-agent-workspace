#!/usr/bin/env bash
# Checks every relative Markdown link in code-class-docs points at an existing file.
# Usage: bash code-class/ai-worker/tests/harness/check-links.sh <path-to-code-class-docs>
# Prints MISSING <file> for an expected page that does not exist, BROKEN <file> -> <link> for a dead link,
# and "check-done" last. A clean repo prints only "check-done".
# Written by the SA 2026-11-12 for TASK-001 (SPEC-001). External links (http...) are skipped.
set -u
repo="${1:?path to code-class-docs}"
cd "$repo" || exit 2
for f in README.md programming-basics-ai/README.md programming-basics-ai/schedule.md \
         programming-basics-ai/classes/*/README.md programming-basics-ai/extras/*.md; do
  [ -f "$f" ] || { echo "MISSING $f"; continue; }
  d=$(dirname "$f")
  grep -o '](\([^)#]*\))' "$f" | sed 's/^](\(.*\))$/\1/' | while read -r l; do
    case "$l" in http*) continue ;; esac
    [ -f "$d/$l" ] || echo "BROKEN $f -> $l"
  done
done
echo check-done
