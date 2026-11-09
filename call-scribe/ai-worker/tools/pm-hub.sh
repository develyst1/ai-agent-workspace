#!/bin/bash
# PM doorbell hub — shared desk tool (harness sharedTools; edit _templates/project, never a desk copy).
# Usage: ai-worker/tools/pm-hub.sh [--once]
#   --once  run by the PM as a background Bash command after every turn; its exit starts the PM's next turn.
#           Prints the first batch of events (every inbox line new in that 15-s tick, plus any CAP line) and exits 0.
#           No event -> keeps waiting. First run with PM lines never rung before -> "inbox PM: n waiting" and exits at once.
#           Lines the PM left in its inbox are not rung again; a line added after the PM drained is (seen-lines files).
#   (none)  long-lived watcher (e.g. Claude Code Monitor, re-armed every turn) — prints events and never exits.
# Emits: "inbox <ROLE>: +n — <last From line>" for every new line in ai-worker/inbox/*.md,
#        "inbox PM: n waiting at start — …" once at start, and "CAP near/full: <Name>=<n>" when any session reaches >= 8 sends.
# Counts dir is named from the desk folder so two desks' watchers on one machine never share counts.
ONCE=0; [ "$1" = "--once" ] && ONCE=1
H="$(cd "$(dirname "$0")" && pwd)"; D="$(cd "$H/../inbox" && pwd)"
C="${TMPDIR:-/tmp}/pm-hub-counts-$(basename "$(cd "$H/../.." && pwd)")"; mkdir -p "$C"
pmseen=0; [ -f "$C/PM.seen" ] && pmseen=1
for f in "$D"/*.md; do b=$(basename "$f" .md); [ -f "$C/$b" ] || { n=$(grep -c '^From ' "$f"); echo "${n:-0}" > "$C/$b"; }; done
prevcap=$("$H/nudge-count.sh" | awk '$2=="FULL" || $2>=8 {printf "%s=%s ", $1, $2}')
w=$(grep -c '^From ' "$D/PM.md"); w=${w:-0}
if [ "$ONCE" = 0 ]; then
  [ "$w" -gt 0 ] && echo "inbox PM: $w waiting at start — $(grep '^From ' "$D/PM.md" | tail -1 | cut -c1-140)"
elif [ "$pmseen" = 0 ] && [ "$w" -gt 0 ]; then
  echo "inbox PM: $w waiting at start — $(grep '^From ' "$D/PM.md" | tail -1 | cut -c1-140)"
  grep '^From ' "$D/PM.md" > "$C/PM.seen"; exit 0
fi
while true; do
  hit=0
  for f in "$D"/*.md; do
    b=$(basename "$f" .md); n=$(grep -c '^From ' "$f" 2>/dev/null); n=${n:-0}; p=$(cat "$C/$b" 2>/dev/null); p=${p:-0}
    if [ "$ONCE" = 1 ] && [ -f "$C/$b.seen" ]; then
      k=$(grep '^From ' "$f" | grep -cFxvf "$C/$b.seen"); k=${k:-0}
      [ "$k" -gt 0 ] && { echo "inbox $b: +$k — $(grep '^From ' "$f" | grep -Fxvf "$C/$b.seen" | tail -1 | cut -c1-140)"; hit=1; }
    else
      [ "$n" -gt "$p" ] && { echo "inbox $b: +$((n-p)) — $(grep '^From ' "$f" | tail -1 | cut -c1-140)"; hit=1; }
    fi
    echo "$n" > "$C/$b"
    [ "$ONCE" = 1 ] && grep '^From ' "$f" > "$C/$b.seen"
  done
  cap=$("$H/nudge-count.sh" | awk '$2=="FULL" || $2>=8 {printf "%s=%s ", $1, $2}')
  [ "$cap" != "$prevcap" ] && [ -n "$cap" ] && { echo "CAP near/full: $cap"; hit=1; }
  prevcap=$cap
  [ "$ONCE" = 1 ] && [ "$hit" = 1 ] && exit 0
  sleep 15
done
