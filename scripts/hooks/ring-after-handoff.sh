#!/usr/bin/env bash
# Claude Code Stop hook — a role that wrote another role's inbox line this turn must ring that role before the
# turn ends. Why: REPORT-porter-2026-10-21-handoff-ring-for-atlas.md — a hand-off line sat 17 min unrung; the
# rule (usb-oda DECISIONS 2026-10-19 / 2026-10-21, nudge-session "Ending a unit") kept being skipped (usb-oda
# F-058, F-072). Origin: MARIE-ORDER-2026-10-21-ring-after-handoff.md (Atlas).
# team-proposed, cheap to delete: remove this file, ring-after-handoff.mjs, and the "Stop" block in
# .claude/settings.json and scripts/run/run-settings.json.
#
# Desk sessions only (scripts/memory/session-desk.mjs; no desk → silent). The turn is read from transcript_path by
# ring-after-handoff.mjs (rules in its header). Skipped: stop_hook_active true (blocks at most once per turn),
# hub desks, WAKE.md, own inbox. Block = exit 0 + {"decision":"block","reason":…} on stdout, per
# https://code.claude.com/docs/en/hooks (Stop input: session_id, transcript_path, stop_hook_active, …).
# Any error, a missing tool, or a slow helper → exit 0 silently. Each node call is killed after 0.8 s.
# $MEMORY_ROOT overrides the root (scratch tests).

command -v jq >/dev/null 2>&1 || exit 0
in=$(cat 2>/dev/null) || exit 0
[ -z "$in" ] && exit 0

active=$(printf '%s' "$in" | jq -r '.stop_hook_active // false' 2>/dev/null) || exit 0
[ "$active" = "true" ] && exit 0

ROOT=${MEMORY_ROOT:-${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." 2>/dev/null && pwd)}}
HERE="$(cd "$(dirname "$0")" 2>/dev/null && pwd)"
SD="$HERE/../memory/session-desk.mjs"
[ -f "$SD" ] && [ -f "$HERE/ring-after-handoff.mjs" ] || exit 0

NODE=$(command -v node 2>/dev/null)
if [ -z "$NODE" ]; then
  for n in "$HOME"/.nvm/versions/node/*/bin/node /opt/homebrew/bin/node /usr/local/bin/node; do
    [ -x "$n" ] && NODE=$n
  done
fi
[ -n "$NODE" ] || exit 0

limited() { local secs=$1; shift; perl -MTime::HiRes=alarm -e 'alarm(shift @ARGV); exec @ARGV or exit 0' "$secs" "$@" 2>/dev/null; }

sid=$(printf '%s' "$in" | jq -r '.session_id // ""' 2>/dev/null) || exit 0
tpath=$(printf '%s' "$in" | jq -r '.transcript_path // ""' 2>/dev/null) || exit 0
[ -n "$sid" ] && [ -f "$tpath" ] || exit 0

deskline=$(MEMORY_ROOT=$ROOT limited 0.8 "$NODE" "$SD" "$sid" "$tpath") || exit 0
[ -n "$deskline" ] || exit 0
read -r desk name role _ <<<"$deskline"
[ -n "$desk" ] || exit 0

reason=$(MEMORY_ROOT=$ROOT limited 0.8 "$NODE" "$HERE/ring-after-handoff.mjs" "$desk" "${name:--}" "${role:--}" "$tpath") || exit 0
[ -n "$reason" ] || exit 0
jq -nc --arg r "$reason" '{decision: "block", reason: $r}' 2>/dev/null
exit 0
