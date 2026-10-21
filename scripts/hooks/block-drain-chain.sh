#!/usr/bin/env bash
# Claude Code PreToolUse hook (matcher: Bash) — refuses a delete-mode inbox drain chained with another write.
# Why: intelligence-space FAILURES F-120 (QA) and F-123 (FE-B), the same day 2026-10-16:
#   `drain-inbox.mjs <INBOX> <hash> <lines> && cat >> inbox/PM.md` and `drain-inbox.mjs … | head -1 && echo … >> …`.
# The drain refused (a new message had arrived), the chained writes ran anyway (a pipe hides the exit code),
# so the log and an inbox claimed work the role had not read. workforce-protocol §14 already said "never
# chained after a step that may refuse"; broken twice in a day → a machine check (harness §11). Atlas order 2026-10-16.
# team-proposed, cheap to delete: remove this file and its line in .claude/settings.json and
# scripts/run/run-settings.json. Bash + perl on purpose — no nvm/node on PATH here.
#
# Refuses: a command that runs drain-inbox.mjs in DELETE mode (inbox name + hash + line numbers, i.e. two or
#          more arguments) AND anything else that writes: `>` / `>>` to a file (not /dev/null, not >&N),
#          `tee`, `append-log.mjs`, a second `drain-inbox.mjs`, or a single `|` pipe after the drain.
# Allows:  print mode (`drain-inbox.mjs <INBOX>`), a delete-mode drain on its own (`cd … &&` before it is fine),
#          `|| …` with no write, and anything without the drain.
# QUOTED heredoc bodies are dropped first, the same way block-shell-edits.sh does (they are data).
# Exit 2 = block (stderr goes to the model). Anything else, or any failure of our own = exit 0.

command -v jq >/dev/null 2>&1 || exit 0
command -v perl >/dev/null 2>&1 || exit 0

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[ -z "$cmd" ] && exit 0

# read -d '' (not $(cat <<…)): bash 3.2 on macOS mis-parses quotes and parens inside $( heredoc ).
IFS= read -r -d '' PL <<'PERL'
use strict; no warnings;
local $/; my $c = <STDIN>;
# QUOTED heredoc bodies are data — same regexes as block-shell-edits.sh.
$c =~ s/<<-?[ \t]*\\([A-Za-z_][A-Za-z0-9_]*)([^\n]*)\n.*?\n[ \t]*\1[ \t]*(?=\n|\z)/<<''$2/gs;
$c =~ s/<<-?[ \t]*(['"])([A-Za-z_][A-Za-z0-9_]*)\1([^\n]*)\n.*?\n[ \t]*\2[ \t]*(?=\n|\z)/<<''$3/gs;

my ($drains, $del, $after) = (0, 0, -1);
while ($c =~ /drain-inbox\.mjs\b([^;&|\n<>)]*)/g) {
  $drains++;
  my @w = split ' ', $1;
  if (@w >= 2 && !$del) { $del = 1; $after = pos($c); }
}
exit 0 unless $del;

my $block = 0;
$block = 1 if $drains > 1;                                  # a second drain
$block = 1 if $c =~ /append-log\.mjs/;
$block = 1 if $c =~ /(^|[\s;&|(])tee(\s|$)/;
my $r = $c;
$r =~ s/\d*>&\d+//g;                                        # 2>&1, >&2
$r =~ s/(&|\d)?>>?[ \t]*\/dev\/null\b//g;                   # >/dev/null, 2>/dev/null, &>/dev/null
$block = 1 if $r =~ />/;                                    # any other > or >> is a write to a file
$block = 1 if substr($c, $after) =~ /(?<!\|)\|(?!\|)/;      # a single | after the drain (not ||)

if ($block) {
  print STDERR "Blocked: run the drain alone, read its output, then write the next line in a new call (workforce-protocol §14).\n";
  exit 2;
}
exit 0;
PERL

printf '%s' "$cmd" | perl -e "$PL"
[ $? -eq 2 ] && exit 2
exit 0
