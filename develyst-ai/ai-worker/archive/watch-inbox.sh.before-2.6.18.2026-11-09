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
# not wake you. On wake: read the inbox, act, then arm it again. One watcher per desk and role set: if one
# is already running, this script REFUSES — prints "already watching: <files> (pid N) — not starting a
# second" and exits 3 (not a WAKE: your watcher is already armed; do nothing). It never stops the other one.
# (F-005; ORDER 42, 2026-10-29.)
# If it ends WITHOUT a "WAKE:" line and not with exit 3 (killed, session restarted), just arm it again.

cd "$(dirname "$0")/.." || exit 2
[ $# -ge 1 ] || { echo "usage: watch-inbox.sh <ROLE> [<ROLE>...]   e.g. PM RELAY"; exit 2; }

files=()
for r in "$@"; do files+=("inbox/$r.md"); done

# One watcher per desk and role set (F-005; owner via Atom 2026-10-29 14:20; ORDER 42). Before watching, look for
# another `bash … watch-inbox.sh` of THIS desk (its /proc/<pid>/cwd, set by its own cd above, is ours; or its
# absolute script path is this script) with the same role arguments in any order. If an OLDER one is running,
# refuse with exit 3 — not 0, so the session's wake logic never reads it as a WAKE. The other watcher is never
# touched. Two started at the same moment leave exactly one. Builtins only, so no fork of ours looks like a watcher.
declare -A want
for r in "$@"; do want[$r]=1; done
read -r -a me < /proc/$$/stat
for d in /proc/[0-9]*; do
  p=${d#/proc/}
  [ "$p" = "$$" ] && continue
  mapfile -d '' -t av < "$d/cmdline" 2>/dev/null || continue
  case "${av[0]##*/}" in bash|sh) ;; *) continue ;; esac
  i=-1
  for k in "${!av[@]}"; do [ "${av[$k]##*/}" = watch-inbox.sh ] && { i=$k; break; }; done
  [ "$i" -ge 1 ] || continue
  [ "$d/cwd" -ef . ] || { [ "${av[$i]:0:1}" = / ] && [ "${av[$i]}" -ef tools/watch-inbox.sh ]; } || continue
  theirs=("${av[@]:$((i + 1))}")
  [ "${#theirs[@]}" -eq "${#want[@]}" ] || continue
  same=1; unset seen; declare -A seen
  for r in "${theirs[@]}"; do
    if [ -n "${want[$r]}" ] && [ -z "${seen[$r]}" ]; then seen[$r]=1; else same=0; break; fi
  done
  [ "$same" = 1 ] || continue
  read -r -a st < "$d/stat" 2>/dev/null || continue
  [ "${st[3]}" = "$$" ] && continue                                 # a fork of this run
  mapfile -d '' -t pav < "/proc/${st[3]}/cmdline" 2>/dev/null
  [ "${pav[*]}" = "${av[*]}" ] && continue                          # a fork of another watcher: its parent counts
  if [ "${st[21]}" -lt "${me[21]}" ] || { [ "${st[21]}" = "${me[21]}" ] && [ "$p" -lt "$$" ]; }; then
    echo "already watching: ${files[*]} (pid $p) — not starting a second"
    exit 3
  fi
done

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
