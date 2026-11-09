#!/bin/bash
# Shared desk tool (harness sharedTools; edit _templates/project, never a desk copy).
# Prints "<Name> <count>" per nudge-log file: sends after the last operator-typed line; "FULL" if a cap-hit came after it.
# Paths are resolved from this script's place (ai-worker/tools/) — no machine-specific path.
# A desk with no nudge-log/ (or an empty one) prints nothing, exit 0.
L="$(dirname "$0")/../nudge-log"
[ -d "$L" ] || exit 0
for f in "$L"/*.log; do
  [ -f "$f" ] || continue
  awk -v n="$(basename "$f" .log)" '/operator-typed/{c=0;full=0;next} / send/{c++} /cap-hit/{full=1} END{ if(full) print n" FULL"; else print n" "c+0 }' "$f"
done
