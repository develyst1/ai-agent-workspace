#!/usr/bin/env bash
# Claude Code PreToolUse hook — the overnight guard (Phase 0, intelligence-space/PHASE-0-PLAN.md step 4).
# Wired only by scripts/overnight/overnight-settings.json (matchers: Bash, Edit|Write|MultiEdit).
# Blocks irreversible shell commands (push, tag, PR/release, branch -D, reset --hard, clean -f, rm -rf)
# and edits to RUN-AUTHORIZATION.md or the owner's office files (.xlsx .xlsm .docx .pptx).
# Exit 2 = block (stderr goes to the model). Anything else, or any failure of our own = exit 0.
# Written in POSIX sh syntax on purpose; installed by Marie 2026-10-06.

command -v jq >/dev/null 2>&1 || exit 0

input=$(cat) || exit 0
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null) || exit 0

block() {
  echo "Blocked by the overnight guard ($1) — park this as irreversible_pending in your REPORT." >&2
  exit 2
}

case "$tool" in
  Bash)
    cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
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
    # One segment per line: split on shell separators so each check sees one simple command.
    segs=$(printf '%s\n' "$cmd" | tr ';&|' '\n\n\n')

    w='(^|[[:space:](`])'                       # a word start inside a segment
    e='([[:space:])`]|$)'                        # a word end
    g="${w}git[[:space:]]+((-C|-c)[[:space:]]+[^[:space:]]+[[:space:]]+|-[^[:space:]]+[[:space:]]+)*"

    has() { printf '%s\n' "$segs" | grep -Eq "$1"; }

    has "${g}push${e}"                                         && block "git push"
    printf '%s\n' "$segs" | grep -E "${g}tag[[:space:]]+[^[:space:]]" \
      | grep -Evq "${g}tag[[:space:]]+(-l|--list)${e}"         && block "git tag"
    has "${w}gh[[:space:]]+(pr|release)${e}"                   && block "gh pr / gh release"
    has "${g}branch[[:space:]]+(.*[[:space:]])?-[a-zA-Z]*D"    && block "git branch -D"
    has "${g}reset[[:space:]]+(.*[[:space:]])?--hard${e}"      && block "git reset --hard"
    has "${g}clean[[:space:]]+(.*[[:space:]])?(-[a-zA-Z]*f|--force)" && block "git clean -f"
    # rm with both a recursive and a force flag, in any spelling (-rf, -fr, -Rf, -r -f, --recursive --force).
    rmseg=$(printf '%s\n' "$segs" | grep -E "${w}rm[[:space:]]")
    if [ -n "$rmseg" ] \
      && printf '%s\n' "$rmseg" | grep -Eq "[[:space:]](-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)${e}" \
      && printf '%s\n' "$rmseg" | grep -Eq "[[:space:]](-[a-zA-Z]*f[a-zA-Z]*|--force)${e}"; then
      block "rm -rf"
    fi
    ;;
  Edit|Write|MultiEdit)
    path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0
    [ -z "$path" ] && exit 0
    lower=$(printf '%s' "$path" | tr '[:upper:]' '[:lower:]')
    case "$path" in
      *RUN-AUTHORIZATION.md) block "the run authorization is the operator's file" ;;
    esac
    case "$lower" in
      *.xlsx|*.xlsm|*.docx|*.pptx) block "the owner's office files are never edited — propose the change instead" ;;
    esac
    ;;
esac
exit 0
