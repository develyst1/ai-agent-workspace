#!/usr/bin/env bash
# Claude Code hook — the memory-card pilot (MARIE.md ORDER 43, owner GO 2026-10-30 14:43): a pilot role can /clear
# without losing what it learned. Two events, one script:
#   UserPromptSubmit → append the prompt to <desk>/ai-worker/cards/<Name>.capture.md (no model call)
#   SessionStart     → add the role's card (cards/<Name>.md) + a RESUME-HERE pointer as additionalContext
# Pilot only: a desk whose ai-worker/checks.json has "hygiene": {"memory-cards": {"pilot": [...]}}, and only the
# names in that list. Everyone else: no output, no file touched. Rules: scripts/memory/card-hook.mjs header.
# team-proposed, cheap to delete: remove this file, scripts/memory/card-hook.mjs + cards-lib.mjs, and the
# memory-cards.sh lines in .claude/settings.json and scripts/run/run-settings.json.
# Which desk: scripts/memory/session-desk.mjs as memory-cue.sh does; after /clear (new session id, no desk yet)
# the Claude process's own `-n <Name>-<tag>` session name, matched in TEAMS.md (card-hook.mjs).
# Input/output per https://code.claude.com/docs/en/hooks (SessionStart: source startup|resume|clear|compact;
# hookSpecificOutput.additionalContext). Adds context only: never a decision, never exit 2. Exit 0 always.
# Each node call is killed after 0.8 s. $MEMORY_ROOT overrides the root (scratch tests).

command -v jq >/dev/null 2>&1 || exit 0
in=$(cat 2>/dev/null) || exit 0
[ -z "$in" ] && exit 0

ROOT=${MEMORY_ROOT:-${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." 2>/dev/null && pwd)}}
# cheapest exit first: no desk has switched the pilot on
grep -qs '"memory-cards"' "$ROOT"/*/ai-worker/checks.json 2>/dev/null || exit 0
SCRIPTS="$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)/memory"
[ -f "$SCRIPTS/card-hook.mjs" ] && [ -f "$SCRIPTS/session-desk.mjs" ] || exit 0

NODE=$(command -v node 2>/dev/null)
if [ -z "$NODE" ]; then
  for n in "$HOME"/.nvm/versions/node/*/bin/node /opt/homebrew/bin/node /usr/local/bin/node; do
    [ -x "$n" ] && NODE=$n
  done
fi
[ -n "$NODE" ] || exit 0

limited() { local secs=$1; shift; perl -MTime::HiRes=alarm -e 'alarm(shift @ARGV); exec @ARGV or exit 0' "$secs" "$@" 2>/dev/null; }

event=$(printf '%s' "$in" | jq -r '.hook_event_name // ""' 2>/dev/null) || exit 0
case "$event" in
  UserPromptSubmit)
    sid=$(printf '%s' "$in" | jq -r '.session_id // ""' 2>/dev/null) || exit 0
    tpath=$(printf '%s' "$in" | jq -r '.transcript_path // ""' 2>/dev/null) || exit 0
    prompt=$(printf '%s' "$in" | jq -r '(.prompt // "") | if type == "string" then . else "" end' 2>/dev/null) || exit 0
    deskline=$(MEMORY_ROOT=$ROOT limited 0.8 "$NODE" "$SCRIPTS/session-desk.mjs" "$sid" "$tpath" "$prompt")
    read -r desk name _ <<<"$deskline"
    printf '%s' "$in" | MEMORY_ROOT=$ROOT limited 0.8 "$NODE" "$SCRIPTS/card-hook.mjs" capture $desk $name >/dev/null
    ;;
  SessionStart)
    out=$(printf '%s' "$in" | MEMORY_ROOT=$ROOT limited 0.8 "$NODE" "$SCRIPTS/card-hook.mjs" start) || exit 0
    [ -n "$out" ] && printf '%s\n' "$out"
    ;;
esac
exit 0
