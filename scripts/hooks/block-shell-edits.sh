#!/usr/bin/env bash
# Claude Code PreToolUse hook (matcher: Bash) — blocks editing files through a shell string.
# Rule: mychannel-mc2/ai-worker/PROTOCOL.md § Editing files (F-004 F-013 F-017).
# team-proposed (Atlas order 2026-10-05), cheap to delete: remove this file and the
# "hooks" block in .claude/settings.json. Bash on purpose — no nvm/node on PATH here.
# Exit 2 = block (stderr goes to the model). Anything else, or any failure of our own = exit 0.

command -v jq >/dev/null 2>&1 || exit 0

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[ -z "$cmd" ] && exit 0
# QUOTED heredoc bodies are data, not commands: drop everything between `<<'X'` / `<<"X"` / `<<\X`
# and its terminator line before matching (the channel PROTOCOL allows; its text may name the very
# commands this hook blocks). Atlas 2026-10-06, from the PM's report §7.3.
# An UNQUOTED heredoc (`<<X`) is not data: the shell runs `…` and $(…) inside it (F-023, F-047).
# Its body stays in for matching, and a backtick or $( in it blocks. Atlas order 2026-10-12.
cmd=$(printf '%s\n' "$cmd" | perl -0777 -pe 's/<<-?[ \t]*\\([A-Za-z_][A-Za-z0-9_]*)([^\n]*)\n.*?\n[ \t]*\1[ \t]*(?=\n|\z)/<<\x27\x27$2/gs; s/<<-?[ \t]*([\x27"])([A-Za-z_][A-Za-z0-9_]*)\1([^\n]*)\n.*?\n[ \t]*\2[ \t]*(?=\n|\z)/<<\x27\x27$3/gs')
if printf '%s\n' "$cmd" | perl -0777 -ne 'while (/<<-?[ \t]*([A-Za-z_][A-Za-z0-9_]*)[^\n]*\n(.*?)\n[ \t]*\1[ \t]*(?=\n|\z)/gs) { my $b = $2; exit 0 if $b =~ /`|\$\(/ } exit 1'; then
  echo "Blocked: use a quoted heredoc (<<'EOF'): an unquoted one runs \`…\` and \$(…) inside it." >&2
  exit 2
fi

# A word start: line start, whitespace, or a shell separator.
s='(^|[[:space:];|&(])'
node_eval="${s}node([[:space:]]+-[^[:space:]]+)*[[:space:]]+(-e|--eval|-p|--print)([[:space:]=]|$)"
sed_inplace="${s}sed[[:space:]]+([^|;&]*[[:space:]])?(-[nEerszu]*i[^[:space:]]*|--in-place[^[:space:]]*)([[:space:]]|$)"
perl_inplace="${s}perl[[:space:]]+([^|;&]*[[:space:]])?-[a-zA-Z]*i"

if printf '%s\n' "$cmd" | grep -Eq -e "$node_eval" -e "$sed_inplace" -e "$perl_inplace"; then
  echo "Blocked: never edit files through a shell string (node -e/-p, sed -i, perl -i). Use the editor tool, or a script fed by a quoted heredoc (<<'EOF') that asserts one match — see mychannel-mc2/ai-worker/PROTOCOL.md § Editing files." >&2
  exit 2
fi
exit 0
