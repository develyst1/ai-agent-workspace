#!/usr/bin/env bash
# Claude Code hook — the memory web's cue: when a known name appears at one of four moments, the knot it leads to
# is added to the turn (BUNNY-DESIGN-2026-10-20.md §4–§5.5). Origin: MARIE-ORDER-2026-10-20-memory-web-full-build.md §2.
# team-proposed, cheap to delete: remove this file and its blocks in .claude/settings.json / scripts/run/run-settings.json.
#
# Moments (text looked up in the desk's ai-worker/memory/MAP.md by scripts/memory/recall.mjs --hook):
#   A  UserPromptSubmit                     → the prompt (a bare `reset` is skipped — reset-word.sh owns it)
#   B  PreToolUse Write|Edit|MultiEdit      → path + content / new_string, only for project-docs/**/owner-notes/**,
#                                             **/pr-bodies/**, **/drafts/**
#   C  PreToolUse Bash, git branch|checkout|switch|merge|push|rebase|commit|tag or gh pr → the command
#   D  PreToolUse Bash, ssh|helm|argocd|kubectl|gh workflow or the word loadtest|sit|uat → the command
# Which desk: scripts/memory/session-desk.mjs (cache .claude/session-desk/<session_id>). No desk, no MAP.md,
# no hit, any error, a slow recall → no output. Adds context only: never a decision, never exit 2. Exit 0 always.
# Each node call is killed after 0.8 s (SIGALRM), so the hook ends well under 2 s.
# Input/output per https://code.claude.com/docs/en/hooks.md (common: session_id, transcript_path,
# hook_event_name; UserPromptSubmit: prompt; PreToolUse: tool_name, tool_input;
# output hookSpecificOutput.additionalContext with hookEventName). $MEMORY_ROOT overrides the root (scratch tests).

command -v jq >/dev/null 2>&1 || exit 0
in=$(cat 2>/dev/null) || exit 0
[ -z "$in" ] && exit 0

ROOT=${MEMORY_ROOT:-${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." 2>/dev/null && pwd)}}
SCRIPTS="$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)/memory"
[ -f "$SCRIPTS/recall.mjs" ] || exit 0

NODE=$(command -v node 2>/dev/null)
if [ -z "$NODE" ]; then
  for n in "$HOME"/.nvm/versions/node/*/bin/node /opt/homebrew/bin/node /usr/local/bin/node; do
    [ -x "$n" ] && NODE=$n
  done
fi
[ -n "$NODE" ] || exit 0

# run with a hard deadline (seconds, fractional) — a stalled helper is killed, its output dropped
limited() { local secs=$1; shift; perl -MTime::HiRes=alarm -e 'alarm(shift @ARGV); exec @ARGV or exit 0' "$secs" "$@" 2>/dev/null; }

event=$(printf '%s' "$in" | jq -r '.hook_event_name // ""' 2>/dev/null) || exit 0
sid=$(printf '%s' "$in" | jq -r '.session_id // ""' 2>/dev/null) || exit 0
tpath=$(printf '%s' "$in" | jq -r '.transcript_path // ""' 2>/dev/null) || exit 0
prompt=''
text=''
fpath=''
body=''

case "$event" in
  UserPromptSubmit)
    prompt=$(printf '%s' "$in" | jq -r '(.prompt // "") | if type == "string" then . else "" end' 2>/dev/null) || exit 0
    trimmed=$(printf '%s' "$prompt" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')
    [ "$trimmed" = "reset" ] && exit 0
    text=$prompt
    ;;
  PreToolUse)
    tool=$(printf '%s' "$in" | jq -r '.tool_name // ""' 2>/dev/null) || exit 0
    case "$tool" in
      Write|Edit|MultiEdit)
        fpath=$(printf '%s' "$in" | jq -r '.tool_input.file_path // ""' 2>/dev/null) || exit 0
        printf '%s' "$fpath" | grep -Eq '(^|/)project-docs/(.*/)?owner-notes/|(^|/)pr-bodies/|(^|/)drafts/' || exit 0
        body=$(printf '%s' "$in" | jq -r '.tool_input | [(.content // empty), (.new_string // empty), ((.edits // [])[] | .new_string // empty)] | map(select(type == "string")) | join("\n")' 2>/dev/null) || exit 0
        text="$fpath
$body"
        ;;
      Bash)
        cmd=$(printf '%s' "$in" | jq -r '.tool_input.command // ""' 2>/dev/null) || exit 0
        if printf '%s' "$cmd" | grep -Eq '(^|[^[:alnum:]_-])git(([[:space:]]+-[Cc][[:space:]]+[^[:space:]]+)|([[:space:]]+--?[^[:space:]]+))*[[:space:]]+(branch|checkout|switch|merge|push|rebase|commit|tag)([^[:alnum:]_-]|$)|(^|[^[:alnum:]_-])gh[[:space:]]+pr([^[:alnum:]_-]|$)'; then
          text=$cmd                                                     # moment C
        elif printf '%s' "$cmd" | grep -Eiq '(^|[^[:alnum:]_-])(ssh|helm|argocd|kubectl|loadtest|sit|uat)([^[:alnum:]_-]|$)|(^|[^[:alnum:]_-])gh[[:space:]]+workflow([^[:alnum:]_-]|$)'; then
          text=$cmd                                                     # moment D
        else
          exit 0
        fi
        ;;
      *) exit 0 ;;
    esac
    ;;
  *) exit 0 ;;
esac
[ -n "$text" ] || exit 0

deskline=$(MEMORY_ROOT=$ROOT limited 0.8 "$NODE" "$SCRIPTS/session-desk.mjs" "$sid" "$tpath" "$prompt") || exit 0
desk=${deskline%% *}
[ -n "$desk" ] || exit 0
[ -f "$ROOT/$desk/ai-worker/memory/MAP.md" ] || exit 0
# B: the path counts from inside the desk — the workspace and desk folder names in it are not a cue
if [ -n "$fpath" ]; then rel=${fpath#"$ROOT/"}; rel=${rel#"$desk/"}; text="$rel
$body"; fi

cue=$(limited 0.8 "$NODE" "$SCRIPTS/recall.mjs" "$ROOT/$desk" --hook "$text") || exit 0
[ -n "$cue" ] || exit 0

msg="Memory web ($desk) — knots your words reached; open $desk/ai-worker/memory/<name>.md or run recall.mjs $desk <name> --deep for more:
$cue"
jq -nc --arg ev "$event" --arg msg "$msg" '{hookSpecificOutput: {hookEventName: $ev, additionalContext: $msg}}' 2>/dev/null
exit 0
