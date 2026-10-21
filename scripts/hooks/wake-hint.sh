#!/usr/bin/env bash
# Claude Code PostToolUse / PostToolUseFailure hook (matchers: ListAgents, SendMessage) — puts the
# "wake by session id" step in front of the role at the moment a session looks missing.
# Why: roles kept asking the operator to reopen sessions that list_sessions showed unarchived; the fix
# sat in the nudge-session skill, which a long session read before the fix was written (harness §11, §13).
# Origin: MARIE-ORDER-2026-10-14-wake-hint-and-skill-changes.md (Atlas). team-proposed, cheap to delete:
# remove this file and its lines in .claude/settings.json and scripts/run/run-settings.json.
#
# ListAgents  → always adds the line (hookSpecificOutput.additionalContext).
# SendMessage → adds the line only when its result or error says the target is not reachable / not found.
#               The result shape is not in the hook docs; transcripts on this machine show
#               {"success":true,"message":"… delivered …"} and {"success":false,"message":"No agent named
#               '<x>' is reachable. …"} as normal (PostToolUse) results. success:true never hints; otherwise
#               tool_response and error are read as text. tool_input (the message you wrote) is never read.
#               Wired on PostToolUseFailure too, in case a failure arrives as a thrown error.
#               A CAPPED send gets the PM-rings line instead (MARIE-ORDER-2026-10-14-reset-hook-and-cap-hint.md).
#               Wording seen on this machine (22 samples, N = 10–12): {"success":false,"message":"Not delivered:
#               this session has already messaged Claude Desktop sessions N times since your user last typed
#               here, which looks like sessions messaging each other automatically. Paused until your user's
#               next message in this session."}. Checked before the not-reachable test; the two never both fire.
# Never blocks: exit 0 always. Bash + jq on purpose — no nvm/node on PATH here.

command -v jq >/dev/null 2>&1 || exit 0
in=$(cat 2>/dev/null) || exit 0
[ -z "$in" ] && exit 0

tool=$(printf '%s' "$in" | jq -r '.tool_name // empty' 2>/dev/null) || exit 0
event=$(printf '%s' "$in" | jq -r '.hook_event_name // "PostToolUse"' 2>/dev/null) || exit 0

HINT='A name missing here may only be unloaded: call list_sessions (mcp__ccd_session_mgmt__list_sessions), find its title, SendMessage to its local_… id. Never ask the operator to open a session list_sessions shows unarchived. busy/idle here is 1 of 3 signals: before saying a role waits, idles or works, also check its TASK/log change time and what was already sent to it — if they disagree, say so and find out.'

CAP_HINT='Your sends are capped: write one line to the PM inbox — "ring <target> — <file §section> (my sends are capped)" — and let the PM ring. Do not retry, do not ask the operator to type here.'

emit() {
  jq -nc --arg ev "$event" --arg msg "${1:-$HINT}" \
    '{hookSpecificOutput: {hookEventName: $ev, additionalContext: $msg}}' 2>/dev/null
  exit 0
}

case "$tool" in
  ListAgents) emit ;;
  SendMessage)
    # A delivered or queued message has tool_response.success == true — never hint on those.
    ok=$(printf '%s' "$in" | jq -r 'if (.tool_response | type) == "object" then (.tool_response.success // "") else "" end' 2>/dev/null)
    [ "$ok" = "true" ] && exit 0
    out=$(printf '%s' "$in" | jq -r '[.tool_response, .error] | map(select(. != null) | if type == "string" then . else tojson end) | join("\n")' 2>/dev/null) || exit 0
    # Capped: "Not delivered: this session has already messaged … since your user last typed here …".
    if printf '%s' "$out" | grep -Eiq 'not delivered: this session has already messaged|since your user last typed here|paused until your user'; then
      emit "$CAP_HINT"
    fi
    # Seen on this machine: {"success":false,"message":"No agent named '<x>' is reachable. …"}.
    if printf '%s' "$out" | grep -Eiq 'no agent named|not reachable|unreachable|not found|no such (agent|session)|could not (find|reach)|unknown (agent|recipient|session)'; then
      emit
    fi
    ;;
esac
exit 0
