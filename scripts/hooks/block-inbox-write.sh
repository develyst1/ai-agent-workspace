#!/usr/bin/env bash
# Claude Code PreToolUse hook (matcher: Bash, and Write|Edit|MultiEdit) — an inbox is appended with `>>` or
# drained with drain-inbox.mjs; nothing else may write it.
# Why: usb-oda FAILURES 2026-10-19/20. F-086: `open(p,'w').write(open(p).read()+…)` truncated inbox/SA-A.md before
# reading it — other roles' lines wiped, five times in a day. F-090: inbox lines deleted by a hand-written filter
# script instead of drain-inbox.mjs. F-102 / F-083: a pointer appended in the same command as the edit it points to;
# the edit failed, the pointer went out. Rules existed (workforce-protocol §5, §14) → a machine check (harness §11).
# Atlas order MARIE-ORDER-2026-10-20-inbox-write-guard.
# team-proposed, cheap to delete: remove this file and its lines in .claude/settings.json and
# scripts/run/run-settings.json. Bash + perl + jq on purpose — no nvm/node on PATH here.
#
# Write/Edit/MultiEdit on */ai-worker/inbox/*.md → refused.
# Bash, when the command names an inbox (`…inbox/<X>.md`) or runs drain-inbox.mjs:
#   refused  — `>` / `>|` / `&>` onto an inbox; any script or editor in the same command (python, node other than
#              drain-inbox.mjs / append-log.mjs, perl, ruby, bash -c, sed -i, tee without -a, mv, cp, rm, truncate,
#              dd, git checkout/restore/…); an inbox `>>` joined to any other write (another file, append-log.mjs,
#              drain-inbox.mjs); a drain joined to any write.
#   allowed  — `>>` appends to inboxes (alone or with other inbox `>>`, `cd`, `printf`, `echo`, `cat`, `tee -a`);
#              drain-inbox.mjs alone (block-drain-chain.sh rules its chaining); read-only use (cat, grep, sed -n,
#              wc, head, tail, …), also copied out with `>` to a non-inbox file.
# QUOTED heredoc bodies are data and are dropped, as in block-shell-edits.sh — EXCEPT a heredoc fed to an
# interpreter (python3 - <<'EOF'): that body is code, and an inbox path in it counts.
# Quoted strings are blanked before looking for redirects and tools, so a message text with `->` or "python" in
# it is not mistaken for a write.
# Exit 2 = block (stderr goes to the model). Anything else, or any failure of our own = exit 0.

command -v jq >/dev/null 2>&1 || exit 0
command -v perl >/dev/null 2>&1 || exit 0

input=$(cat) || exit 0
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null) || exit 0
MSG='Blocked: an inbox is appended with >> (its own command) and drained only with drain-inbox.mjs.'

case "$tool" in
  Write|Edit|MultiEdit)
    fp=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0
    case "$fp" in
      */ai-worker/inbox/*.md|ai-worker/inbox/*.md)
        echo "$MSG" >&2
        exit 2 ;;
    esac
    exit 0 ;;
esac

cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[ -z "$cmd" ] && exit 0

# read -d '' (not $(cat <<…)): bash 3.2 on macOS mis-parses quotes and parens inside $( heredoc ).
IFS= read -r -d '' PL <<'PERL'
use strict; no warnings;
local $/; my $c = <STDIN>;
my $INTERP = qr/(?:^|[\s;&|(])(?:python[0-9.]*|node|perl|ruby|deno|bun|osascript|bash|sh|zsh)(?=\s|$)/;
my $INBOX  = qr/(?<![A-Za-z0-9_.-])inbox\/[A-Za-z0-9_.*-]+\.md\b/;
my $INBOX_PY = qr/['"]inbox['"]\s*,\s*['"][^'"\n]+\.md['"]/;     # os.path.join(…, 'inbox', 'PM.md')

# 1. Heredoc bodies (quoted or not) leave the shell text. A body fed to an interpreter is kept aside as code.
my $code = '';
my $from = 0;
while (1) {
  pos($c) = $from;
  last unless $c =~ /(?<!<)<<(?!<)-?[ \t]*(?:\\([A-Za-z_]\w*)|(['"])([A-Za-z_]\w*)\2|([A-Za-z_]\w*))/g;
  my $tag = defined $1 ? $1 : defined $3 ? $3 : $4;
  my ($hs, $he) = ($-[0], $+[0]);
  my $nl = index($c, "\n", $he);
  last if $nl < 0;
  my $rest = substr($c, $nl + 1);
  unless ($rest =~ /(?:\A|\n)[ \t]*\Q$tag\E[ \t]*(?=\n|\z)/) { $from = $he; next; }
  my ($bs, $be) = ($-[0], $+[0]);
  my $body = substr($rest, 0, $bs);
  my $ls = rindex($c, "\n", $hs) + 1;
  my $header = substr($c, $ls, $nl - $ls);
  $code .= "\n" . $body
    if $header =~ $INTERP && $header !~ /(?:drain-inbox|append-log)\.mjs/;
  $c = substr($c, 0, $nl) . substr($rest, $be);
  $from = $he;
}

# 2. Blank quoted text (same length, so positions line up): quotes kept, contents become x.
my ($b, @inq) = ('');
{
  my $q = '';
  my @ch = split //, $c;
  for (my $i = 0; $i < @ch; $i++) {
    my $k = $ch[$i];
    if ($q eq '') {
      if ($k eq '\\' && $i + 1 < @ch) { $b .= 'xx'; push @inq, 1, 1; $i++; next; }
      if ($k eq "'" || $k eq '"') { $q = $k; }
      $b .= $k; push @inq, 0;
    } elsif ($q eq "'") {
      if ($k eq "'") { $q = ''; $b .= $k; push @inq, 0; }
      else { $b .= ($k eq "\n" ? "\n" : 'x'); push @inq, 1; }
    } else {
      if ($k eq '\\' && $i + 1 < @ch) { $b .= 'xx'; push @inq, 1, 1; $i++; next; }
      if ($k eq '"') { $q = ''; $b .= $k; push @inq, 0; }
      else { $b .= ($k eq "\n" ? "\n" : 'x'); push @inq, 1; }
    }
  }
}

# 3. Runs of the two sanctioned node scripts (unquoted at their start, path may be quoted): note them, then take
#    them out of view, up to the next separator — their arguments are a hash, line numbers or log text.
#    Their own redirections stay visible (a `> inbox` after the drain is still a write).
my ($drain, $applog) = (0, 0);
my @runs;
while ($c =~ /(?<![^\s;&|(])(?:node\s+)?['"]?[^\s;&|'"]*?(drain-inbox|append-log)\.mjs\b/g) {
  my ($s, $me, $which) = ($-[0], $+[0], $1);
  next if $inq[$s];
  if ($which eq 'drain-inbox') { $drain++ } else { $applog++ }
  my $tail = substr($b, $me);
  my $len = $tail =~ /^([^;&|\n]*)/ ? length $1 : 0;
  my $e = $me + $len;
  my $seg = substr($b, $s, $e - $s);
  my $keep = $seg =~ /(\d*>.*)$/s ? length $1 : 0;
  push @runs, [$s, $e - $keep];
}
for my $r (@runs) {
  my ($s, $e) = @$r;
  substr($b, $s, $e - $s) = ' ' x ($e - $s);
  substr($c, $s, $e - $s) = ' ' x ($e - $s);
}

my $touches = $drain || $c =~ $INBOX || $code =~ $INBOX || $code =~ $INBOX_PY;
exit 0 unless $touches;

# 4. Redirections, read outside quotes, targets taken from the real text.
my ($inbox_app, $inbox_over, $other_write) = (0, 0, 0);
while ($b =~ /(\d*|&)(>>|>\||>)(&\d+|&-)?[ \t]*/g) {
  my $op = $2; my $dup = $3; my $ts = $+[0];
  next if defined $dup && $dup ne '';                          # 2>&1, >&2
  my $tail = substr($b, $ts);
  $tail =~ /^([^\s;&|<>()]*)/; my $len = length $1;
  my $target = substr($c, $ts, $len);
  $target =~ s/^['"]|['"]$//g;
  next if $target eq '/dev/null';
  if ($target =~ $INBOX) { if ($op eq '>>') { $inbox_app++ } else { $inbox_over++ } }
  else { $other_write++ }
}
# tee: -a onto inboxes is an append, anything else writes.
while ($b =~ /(?:^|[\s;&|(])tee\b([^;&|\n]*)/g) {
  my ($s, $e, $args) = ($-[1], $+[1], $1);
  my $real = substr($c, $s, $e - $s);
  my $app = $args =~ /(?:^|\s)-[a-zA-Z]*a/;
  if ($real =~ $INBOX) { if ($app) { $inbox_app++ } else { $inbox_over++ } } else { $other_write++ }
}

# 5. Scripts and editors.
my $tools = 0;
$tools = 1 if $b =~ $INTERP;
$tools = 1 if $b =~ /(?:^|[\s;&|(])(?:mv|cp|rm|truncate|dd|rsync|ln|eval)(?=\s|$)/;
$tools = 1 if $b =~ /(?:^|[\s;&|(])sed\s+(?:[^|;&\n]*\s)?(?:-[nEerszu]*i\S*|--in-place\S*)(?=\s|$)/;
$tools = 1 if $b =~ /(?:^|[\s;&|(])g?awk\s+(?:[^|;&\n]*\s)?-i\s*inplace/;
$tools = 1 if $b =~ /(?:^|[\s;&|(])git\s+(?:-C\s+\S+\s+)?(?:checkout|restore|stash|reset|apply|rm|mv|clean)\b/;
$tools = 1 if $b =~ /\s-delete\b/;

my $block = 0;
$block = 1 if $inbox_over;                                     # rewrite of an inbox
$block = 1 if $tools;                                          # a script/editor next to an inbox (F-086, F-090, F-102)
$block = 1 if $inbox_app && ($other_write || $applog || $drain);  # append joined to another write
$block = 1 if $drain && ($other_write || $applog);             # drain joined to a write
exit($block ? 2 : 0);
PERL

printf '%s' "$cmd" | perl -e "$PL"
if [ $? -eq 2 ]; then
  echo "$MSG" >&2
  exit 2
fi
exit 0
