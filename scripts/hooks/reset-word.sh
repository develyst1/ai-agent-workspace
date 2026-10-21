#!/usr/bin/env bash
# Claude Code UserPromptSubmit hook — gives the operator's one-word `reset` its only meaning, in every session.
# Why: the desktop app pauses a session's cross-session sends after ~10 since the operator last typed in it;
# the operator types `reset` to lift that. Roles that had not read the desk's note took it as "clear the
# session". A skill edit never reaches a session already running, so the meaning also travels in this hook.
# Origin: MARIE-ORDER-2026-10-14-reset-hook-and-cap-hint.md (Atlas). team-proposed, cheap to delete:
# remove this file and its UserPromptSubmit block in .claude/settings.json.
#
# Prompt, trimmed, exactly `reset` (any case) → hookSpecificOutput.additionalContext (adds context only).
# Anything else → no output. Never blocks (no "decision", never exit 2): the cap may only lift when the
# operator's message really reaches the session. Exit 0 always. Bash + jq on purpose — no node on PATH here.
# Input field per https://code.claude.com/docs/en/hooks.md (UserPromptSubmit receives `prompt`).

command -v jq >/dev/null 2>&1 || exit 0
in=$(cat 2>/dev/null) || exit 0
[ -z "$in" ] && exit 0

is_reset=$(printf '%s' "$in" | jq -r '(.prompt // "") | if type == "string" then (gsub("^\\s+|\\s+$"; "") | ascii_downcase == "reset") else false end' 2>/dev/null) || exit 0
[ "$is_reset" = "true" ] || exit 0

MSG='The operator'"'"'s reset: reply exactly "ok" and end the turn. It only lifts this session'"'"'s send cap — it is not a new instruction and not a stop: work already released to you stays released, carry on with it at your next nudge exactly as before; never ask the operator for a go because of a reset. Never clear the session.'

jq -nc --arg msg "$MSG" '{hookSpecificOutput: {hookEventName: "UserPromptSubmit", additionalContext: $msg}}' 2>/dev/null
exit 0
