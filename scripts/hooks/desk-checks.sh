#!/usr/bin/env bash
# Claude Code hook — desk checks: a mistake that really happened on a desk becomes a check that stops the action
# at the moment it repeats. Rules live with the desk in <desk>/ai-worker/checks.json; every check carries `born`
# (the FAILURES entry behind it — harness §15; check-hygiene.mjs FAILs a check without one).
# Why: REPORT-porter-2026-10-21-flows-drift-for-atlas.md §2 — the right rule was shown in the very turn and the role
# still did the wrong thing (usb-oda F-121 PR body without `## Testing`, F-123 outside-git values in an inbox).
# Origin: MARIE-ORDER-2026-10-21-desk-checks.md (Atlas). team-proposed, cheap to delete: remove this file,
# desk-checks.mjs, and its lines in .claude/settings.json and scripts/run/run-settings.json.
#
# PreToolUse  Write|Edit|MultiEdit|Bash → `forbid` / `forbid_values_from` → exit 2, reason on stderr.
# PostToolUse Write|Edit|MultiEdit      → `require` → {"decision":"block","reason":…} on stdout, exit 0.
# Formats per https://code.claude.com/docs/en/hooks. Rules and matching: header of desk-checks.mjs.
# The desk comes from the path written, not the session. A forbidden value is never printed.
# Any error, no node, no checks.json, or a helper slower than 0.8 s → exit 0 silently.
# $CHECKS_ROOT overrides the workspace root (scratch tests).

HERE="$(cd "$(dirname "$0")" 2>/dev/null && pwd)" || exit 0
[ -f "$HERE/desk-checks.mjs" ] || exit 0

NODE=$(command -v node 2>/dev/null)
if [ -z "$NODE" ]; then
  for n in "$HOME"/.nvm/versions/node/*/bin/node /opt/homebrew/bin/node /usr/local/bin/node; do
    [ -x "$n" ] && NODE=$n
  done
fi
[ -n "$NODE" ] || exit 0

in=$(cat 2>/dev/null) || exit 0
[ -z "$in" ] && exit 0

errf=$(mktemp 2>/dev/null) || exit 0
out=$(printf '%s' "$in" | perl -MTime::HiRes=alarm -e 'alarm(shift @ARGV); exec @ARGV or exit 0' 0.8 "$NODE" "$HERE/desk-checks.mjs" 2>"$errf")
rc=$?
err=$(cat "$errf" 2>/dev/null); rm -f "$errf"
if [ "$rc" -eq 2 ] && [ -n "$err" ]; then
  printf '%s\n' "$err" >&2
  exit 2
fi
[ "$rc" -eq 0 ] && [ -n "$out" ] && printf '%s\n' "$out"
exit 0
