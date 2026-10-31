#!/usr/bin/env bash
# watch-inbox.sh — wakes an idle role when a line lands in its inbox, with NO cross-session send.
# Why: the app caps a session's outgoing sends (~10 since the operator last typed in it). When an SA is
# capped, nothing wakes the PM and finished work sits unseen (REPORT-porter-to-atlas-2026-10-22). A
# background command that exits re-invokes its own idle session — that is not a send, so no cap applies
# (proven by Atlas 2026-10-25: an idle session woke 46 s after a line was appended to a watched file).
#
# Usage, at the END of your turn, with the Bash tool's run_in_background:
#   bash ai-worker/tools/watch-inbox.sh PM RELAY      # the PM
#   bash ai-worker/tools/watch-inbox.sh SA            # an SA (SA-B, … for other teams)
# It exits — and so wakes you — only when a watched file GROWS. Your own drain shrinks the file and does
# not wake you. On wake: read the inbox, act, then arm it again. One watcher per session: if one is
# already running (your background tasks show it), do not start a second.
# If it ends WITHOUT a "WAKE:" line (killed, session restarted), just arm it again.

cd "$(dirname "$0")/.." || exit 2
[ $# -ge 1 ] || { echo "usage: watch-inbox.sh <ROLE> [<ROLE>...]   e.g. PM RELAY"; exit 2; }

files=()
for r in "$@"; do files+=("inbox/$r.md"); done

size() { if [ -f "$1" ]; then wc -c < "$1" | tr -d ' '; else echo 0; fi; }

declare -A base
for f in "${files[@]}"; do base[$f]=$(size "$f"); done
echo "watching: ${files[*]} since $(date +%H:%M)"

while true; do
  for f in "${files[@]}"; do
    now=$(size "$f")
    if [ "$now" -gt "${base[$f]}" ]; then
      echo "WAKE: new line(s) in $f at $(date +%H:%M) - read it now, act, then arm the watcher again."
      exit 0
    fi
    if [ "$now" -lt "${base[$f]}" ]; then base[$f]=$now; fi
  done
  sleep 20
done
