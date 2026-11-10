#!/usr/bin/env bash
# watch-line.sh — the LINE poller (every LINE_POLL_MIN minutes, default 30; one poll at start): one line in inbox/RELAY.md per poll that found new messages.
# A DESK tool (TASK-944), not the shared harness: do not fold it into watch-inbox.sh. It reads only.
#
# Run once per session, in the background, from the smart-scheduler folder:
#   bash ai-worker/tools/watch-line.sh <bot repo path>        # the path is the develyst-line-bot row of machine.local.md
# It NEVER exits on its own (it is not re-armed each turn). A second start exits 3 and does nothing.
# Your normal `watch-inbox.sh PM RELAY` is what wakes the PM when the RELAY line lands.
#
# At start, then every LINE_POLL_MIN minutes (default 30; whole minutes 1–120, anything else = 30; `LINE_POLL_MIN=1 bash …` for a proof run):
#   1. since = ai-worker/.private/line-cursor (a message id). No cursor yet: it is created = now (UTC), never from history.
#   2. In the bot repo: `bun scripts/pull.ts --since <since> --out <tmp>`. Only that script talks to the bot.
#   3. Only its stdout lines `count: N` and `next: <id|none>` are read. Anything else, or a non-zero exit: the exit code
#      goes to .private/watch-line.log (never any text), <tmp> is deleted, and the next minute tries again. No RELAY line.
#      "recording is OFF" = count 0, silently.
#   4. count > 0: <tmp> becomes .private/line-<YYYYMMDD-HHMMSS>.json; ONE line is appended to inbox/RELAY.md (no text, no
#      names); the cursor moves to `next`. One line per poll however many messages: a burst of 5 costs one wake.
#   5. count = 0: <tmp> is deleted, no line, the cursor does not move.
# There is NO send path in this file: it only reads.
#
# Test-only knobs: --once (one poll, then exit) · WATCH_LINE_ROOT (an ai-worker folder to use instead of this one, so a test
# never touches the real RELAY.md) · WATCH_LINE_INTERVAL (seconds) · WATCH_LINE_BUN (the bun command).

ONCE=0
SHOW=0
BOT=""
for a in "$@"; do
  case "$a" in
    --once) ONCE=1 ;;
    --show-interval) SHOW=1 ;; # test-only: print the poll period in seconds and exit
    -*) echo "unknown option: $a"; exit 2 ;;
    *) [ -z "$BOT" ] && BOT="$a" || { echo "usage: watch-line.sh <bot repo path> [--once]"; exit 2; } ;;
  esac
done
[ -n "$BOT" ] || { echo "usage: watch-line.sh <bot repo path> [--once]"; exit 2; }
[ -f "$BOT/scripts/pull.ts" ] || { echo "no scripts/pull.ts in: $BOT"; exit 2; }
BOT=$(cd "$BOT" && pwd) || exit 2

if [ -n "$WATCH_LINE_ROOT" ]; then ROOT="$WATCH_LINE_ROOT"; else ROOT="$(dirname "$0")/.."; fi
ROOT=$(cd "$ROOT" && pwd) || exit 2
[ -d "$ROOT/inbox" ] || { echo "no inbox/ in: $ROOT"; exit 2; }
P="$ROOT/.private"
mkdir -p "$P" || exit 2
RELAY="$ROOT/inbox/RELAY.md"
BUN="${WATCH_LINE_BUN:-bun}"
# LINE_POLL_MIN = whole minutes between polls, 1–120, default 30 (the owner's choice, 2026-11-10); anything else = 30.
# A poll also runs at once at start, so a fresh start never waits a full period.
POLL_MIN="${LINE_POLL_MIN:-30}"
case "$POLL_MIN" in ''|*[!0-9]*) POLL_MIN=30 ;; esac
{ [ "${#POLL_MIN}" -le 3 ] && [ "$POLL_MIN" -ge 1 ] && [ "$POLL_MIN" -le 120 ]; } 2>/dev/null || POLL_MIN=30
INTERVAL=$((10#$POLL_MIN * 60)) # 10# : "08" or "030" are decimal, never octal
# test-only: seconds, so the tests do not wait minutes
case "$WATCH_LINE_INTERVAL" in ''|*[!0-9]*|0) ;; *) INTERVAL="$WATCH_LINE_INTERVAL" ;; esac
[ "$SHOW" = 1 ] && { echo "$INTERVAL"; exit 0; }
LOG="$P/watch-line.log"
log() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" >> "$LOG"; }

# ── one instance per desk: an atomic mkdir lock holding our pid; a dead owner's lock is taken over ──
LOCK="$P/watch-line.lock"
take_lock() { mkdir "$LOCK" 2>/dev/null && echo $$ > "$LOCK/pid"; }
if ! take_lock; then
  sleep 1 # the owner may be between mkdir and writing its pid
  other=$(cat "$LOCK/pid" 2>/dev/null)
  if [ -n "$other" ] && kill -0 "$other" 2>/dev/null; then
    echo "already running (pid $other) — not starting a second"
    exit 3
  fi
  rm -rf "$LOCK"
  take_lock || { echo "already running — not starting a second"; exit 3; }
fi
cleanup() { [ "$(cat "$LOCK/pid" 2>/dev/null)" = "$$" ] && rm -rf "$LOCK"; }
trap cleanup EXIT
trap 'exit 0' INT TERM

# a cursor is created the first time, = now, so history is never read and no message is missed between polls
[ -s "$P/line-cursor" ] || date -u +%Y-%m-%dT%H:%M:%SZ > "$P/line-cursor"

poll() {
  local since tmp out rc count next stamp dest name lines
  since=$(tr -d '\r\n' < "$P/line-cursor" 2>/dev/null)
  [ -n "$since" ] || { log "cursor is empty: skipped"; return; }
  tmp="$P/line-pull-$$.tmp.json"
  rm -f "$tmp"
  out=$(cd "$BOT" && "$BUN" scripts/pull.ts --since "$since" --out "$tmp" 2>/dev/null)
  rc=$?
  if [ "$rc" -ne 0 ]; then log "pull exit $rc"; rm -f "$tmp"; return; fi
  case "$out" in
    "recording is OFF"*) rm -f "$tmp"; return ;; # the bot is not recording yet: nothing to read, no line
  esac
  out=$(printf '%s' "$out" | tr -d '\r')
  lines=$(printf '%s\n' "$out" | grep -c '')
  count=$(printf '%s\n' "$out" | sed -n '1s/^count: \([0-9][0-9]*\)$/\1/p')
  next=$(printf '%s\n' "$out" | sed -n '2s/^next: \([A-Za-z0-9_.:-]\{1,80\}\)$/\1/p')
  if [ "$lines" -ne 2 ] || [ -z "$count" ] || [ -z "$next" ]; then log "unexpected pull output (exit $rc)"; rm -f "$tmp"; return; fi
  if [ "$count" -eq 0 ]; then rm -f "$tmp"; return; fi
  if [ "$next" = none ] || [ ! -s "$tmp" ]; then log "count $count but no next id / no file"; rm -f "$tmp"; return; fi
  stamp=$(date +%Y%m%d-%H%M%S)
  name="line-$stamp.json"
  [ -e "$P/$name" ] && name="line-$stamp-$$.json"
  mv "$tmp" "$P/$name" || { log "could not move the pull file"; rm -f "$tmp"; return; }
  printf 'From line-poll %s: %s new LINE message(s) in SOM SYSTEM — read .private/%s\n' "$(date '+%Y-%m-%d %H:%M')" "$count" "$name" >> "$RELAY"
  printf '%s\n' "$next" > "$P/line-cursor.tmp" && mv "$P/line-cursor.tmp" "$P/line-cursor"
}

while :; do
  poll
  [ "$ONCE" = 1 ] && break
  sleep "$INTERVAL" &
  wait $!
done
exit 0
