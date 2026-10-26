#!/usr/bin/env bash
# Claude Code PreToolUse hook (matcher: Bash) — blocks stopping processes by name on the shared machine.
# Why: intelligence-space FAILURES F-071 (SA-B), F-076, F-077, F-080 — four roles stopped servers by name
# pattern in one day, one of them killed another team's servers mid-check; the prose rule "stop only your
# own PID by port" was broken twice after it was written (harness §11). Atlas order 2026-10-13.
# team-proposed, cheap to delete: remove this file and its line in .claude/settings.json and
# scripts/run/run-settings.json. Bash + perl on purpose — no nvm/node on PATH here.
#
# Refuses: pkill · killall · kill whose targets are not all numeric PIDs, %jobs, or $(…)/`…` substitutions
#          · a kill target substitution, or the input of `xargs kill`, that selects by name
#            (pgrep, pidof, ps, pkill, killall, lsof -c).
# Allows:  kill <digits>… · kill -<signal> <digits> · kill $(lsof -tiTCP:<port> -sTCP:LISTEN)
#          · lsof -tiTCP:<port> -sTCP:LISTEN | xargs kill · kill %<job> · kill -l.
# Looks only at words in command position (so `grep pkill FILE`, `echo 'killall'` pass), follows
# $(…), `…`, <(…), sh/bash/zsh -c '…' and eval. QUOTED heredoc bodies are dropped first, the same way
# block-shell-edits.sh does (they are data). Exit 2 = block (stderr goes to the model).
# Anything else, or any failure of our own = exit 0.

command -v jq >/dev/null 2>&1 || exit 0
command -v perl >/dev/null 2>&1 || exit 0

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[ -z "$cmd" ] && exit 0

# read -d '' (not $(cat <<…)): bash 3.2 on macOS mis-parses quotes and parens inside $( heredoc ).
IFS= read -r -d '' PL <<'PERL'
use strict; no warnings;
local $/; my $cmd = <STDIN>;
# QUOTED heredoc bodies are data — same regexes as block-shell-edits.sh.
$cmd =~ s/<<-?[ \t]*\\([A-Za-z_][A-Za-z0-9_]*)([^\n]*)\n.*?\n[ \t]*\1[ \t]*(?=\n|\z)/<<''$2/gs;
$cmd =~ s/<<-?[ \t]*(['"])([A-Za-z_][A-Za-z0-9_]*)\1([^\n]*)\n.*?\n[ \t]*\2[ \t]*(?=\n|\z)/<<''$3/gs;

sub block {
  print STDERR "Blocked: never stop processes by name on the shared machine — stop your own port: kill \$(lsof -tiTCP:<your port> -sTCP:LISTEN)\n";
  exit 2;
}
sub base { my $x = shift; $x =~ s{.*/}{}; return $x; }

# $s from position $i (just after "$(" or "<(") to the matching ")": returns (inner, next position).
sub read_balanced {
  my ($s, $i) = @_; my $depth = 1; my $start = $i; my $n = length $s;
  while ($i < $n) {
    my $c = substr($s, $i, 1);
    if ($c eq '\\') { $i += 2; next; }
    if ($c eq "'") { my $j = index($s, "'", $i + 1); $i = $j < 0 ? $n : $j + 1; next; }
    if ($c eq '"') { $i++; while ($i < $n && substr($s, $i, 1) ne '"') { $i += substr($s, $i, 1) eq '\\' ? 2 : 1; } $i++; next; }
    if ($c eq '(') { $depth++; }
    elsif ($c eq ')') { $depth--; return (substr($s, $start, $i - $start), $i + 1) if $depth == 0; }
    $i++;
  }
  return (substr($s, $start), $n);
}

# Shell text -> (pipelines, nested sources). A pipeline is a list of commands; a command a list of words.
# Substitutions stay whole inside their word ("$(…)") and are also returned to be checked on their own.
sub parse {
  my ($s) = @_; my (@pls, @pipe, @words, @nested); my $w; my $skip = 0;
  my $n = length $s; my $i = 0;
  my $endword = sub { if (defined $w) { if ($skip) { $skip = 0 } else { push @words, $w } } undef $w; };
  my $endcmd  = sub { $endword->(); push @pipe, [@words] if @words; @words = (); $skip = 0; };
  my $endpipe = sub { $endcmd->(); push @pls, [@pipe] if @pipe; @pipe = (); };
  while ($i < $n) {
    my $c = substr($s, $i, 1); my $d = substr($s, $i + 1, 1);
    if ($c eq ' ' || $c eq "\t") { $endword->(); $i++; next; }
    if ($c eq "\n" || $c eq ';' || $c eq '(' || $c eq ')') { $endpipe->(); $i++; next; }
    if ($c eq '#' && !defined $w) { my $j = index($s, "\n", $i); $i = $j < 0 ? $n : $j; next; }
    if ($c eq '\\') { if ($d eq "\n") { $i += 2; next; } $w = ($w // '') . $d; $i += 2; next; }
    if ($c eq "'") { my $j = index($s, "'", $i + 1); $j = $n if $j < 0; $w = ($w // '') . substr($s, $i + 1, $j - $i - 1); $i = $j + 1; next; }
    if ($c eq '"') {
      my $j = $i + 1; my $buf = '';
      while ($j < $n && substr($s, $j, 1) ne '"') {
        my $e = substr($s, $j, 1);
        if ($e eq '\\') { $buf .= substr($s, $j + 1, 1); $j += 2; next; }
        if ($e eq '$' && substr($s, $j + 1, 1) eq '(') { my ($in, $k) = read_balanced($s, $j + 2); $buf .= '$(' . $in . ')'; push @nested, $in; $j = $k; next; }
        if ($e eq '`') { my $k = index($s, '`', $j + 1); $k = $n if $k < 0; my $in = substr($s, $j + 1, $k - $j - 1); $buf .= '`' . $in . '`'; push @nested, $in; $j = $k + 1; next; }
        $buf .= $e; $j++;
      }
      $w = ($w // '') . $buf; $i = $j + 1; next;
    }
    if ($c eq '$' && $d eq '(') { my ($in, $k) = read_balanced($s, $i + 2); $w = ($w // '') . '$(' . $in . ')'; push @nested, $in; $i = $k; next; }
    if ($c eq '`') { my $k = index($s, '`', $i + 1); $k = $n if $k < 0; my $in = substr($s, $i + 1, $k - $i - 1); $w = ($w // '') . '`' . $in . '`'; push @nested, $in; $i = $k + 1; next; }
    if ($c eq '|') { if ($d eq '|') { $endpipe->(); $i += 2; next; } $endcmd->(); $i += $d eq '&' ? 2 : 1; next; }
    if ($c eq '&') {
      if ($d eq '>') { $endword->(); $i += 2; $i++ if substr($s, $i, 1) eq '>'; $skip = 1; next; }
      $endpipe->(); $i += $d eq '&' ? 2 : 1; next;
    }
    if ($c eq '<' || $c eq '>') {
      if ($d eq '(') { $endword->(); my ($in, $k) = read_balanced($s, $i + 2); push @nested, $in; $i = $k; next; }
      if (defined $w && $w =~ /^\d+$/) { undef $w } else { $endword->() }   # "2>" — the fd is not a word
      my $j = $i; $j++ while $j < $n && substr($s, $j, 1) =~ /[<>&|]/;
      $i = $j; $skip = 1; next;                                               # the redirect target is not a word
    }
    $w = ($w // '') . $c; $i++;
  }
  $endpipe->();
  return (\@pls, \@nested);
}

my %PREFIX = map { $_ => 1 } qw(sudo env nohup time exec command builtin nice timeout gtimeout caffeinate
  then do else elif if while until ! {);
# Index of the command word in a word list, skipping assignments and prefix commands (sudo, env, …).
sub cmdword {
  my ($ws) = @_; my $k = 0;
  while ($k < @$ws) {
    my $x = $ws->[$k];
    if ($x =~ /^[A-Za-z_][A-Za-z0-9_]*=/) { $k++; next; }
    my $b = base($x);
    if ($PREFIX{$b}) {
      $k++;
      $k++ while $k < @$ws && ($ws->[$k] =~ /^-/ || $ws->[$k] =~ /^\d+[smhd]?$/ || $ws->[$k] =~ /^[A-Za-z_]\w*=/);
      next;
    }
    return $k;
  }
  return -1;
}

# A command that selects processes by name.
sub byname {
  my ($b, @a) = @_;
  return 1 if $b =~ /^(pgrep|pidof|ps|pkill|killall)$/;
  return 1 if $b eq 'lsof' && grep { /^-[a-bd-zA-Z]*c/ } @a;
  return 0;
}
# Does this shell text run any by-name selector (at any depth)?
sub text_byname {
  my ($s, $depth) = @_; return 0 if $depth > 8;
  my ($pls, $nested) = parse($s);
  for my $in (@$nested) { return 1 if text_byname($in, $depth + 1); }
  for my $pl (@$pls) { for my $ws (@$pl) { my $k = cmdword($ws); next if $k < 0; return 1 if byname(base($ws->[$k]), @{$ws}[$k + 1 .. $#$ws]); } }
  return 0;
}

sub check_kill_args {
  my @a = @_; my $j = 0; my $sig = 0;
  while ($j < @a) {
    my $x = $a[$j];
    if ($x eq '--') { $j++; last; }
    return if $x =~ /^-[lL]$/;                                  # kill -l: list signals
    if ($x eq '-s' || $x eq '-n') { $j += 2; $sig = 1; next; }
    if (!$sig && $x =~ /^-/) { $j++; $sig = 1; next; }           # -9, -TERM, -SIGKILL
    last;
  }
  for my $t (@a[$j .. $#a]) {
    next if $t =~ /^\d+$/;
    next if $t =~ /^%\S*$/;
    if ($t =~ /^\$\((.*)\)$/s || $t =~ /^`(.*)`$/s) { block() if text_byname($1, 0); next; }
    block();                                                     # a name, a variable, -1, a pattern …
  }
}

sub check {
  my ($s, $depth) = @_; return if $depth > 8;
  my ($pls, $nested) = parse($s);
  check($_, $depth + 1) for @$nested;
  for my $pl (@$pls) {
    for my $ci (0 .. $#$pl) {
      my $ws = $pl->[$ci]; my $k = cmdword($ws); next if $k < 0;
      my $b = base($ws->[$k]); my @args = @{$ws}[$k + 1 .. $#$ws];
      if ($b =~ /^(sh|bash|zsh|dash)$/) {
        for my $a (0 .. $#args) { if ($args[$a] =~ /^-\w*c$/ && defined $args[$a + 1]) { check($args[$a + 1], $depth + 1); last; } }
        next;
      }
      if ($b eq 'eval') { check(join(' ', @args), $depth + 1); next; }
      if ($b eq 'xargs') {
        my $j = 0;
        while ($j < @args && $args[$j] =~ /^-/) { $j += $args[$j] =~ /^-[InPLsEdJRS]$/ ? 2 : 1; }
        my @sub = @args[$j .. $#args]; next unless @sub;
        my $kk = cmdword(\@sub); next if $kk < 0;
        my $bb = base($sub[$kk]);
        block() if $bb eq 'pkill' || $bb eq 'killall';
        if ($bb eq 'kill') {
          for my $u (0 .. $ci - 1) {                             # what feeds xargs kill
            my $uw = $pl->[$u]; my $q = cmdword($uw); next if $q < 0;
            block() if byname(base($uw->[$q]), @{$uw}[$q + 1 .. $#$uw]);
          }
        }
        next;
      }
      block() if $b eq 'pkill' || $b eq 'killall';
      check_kill_args(@args) if $b eq 'kill';
    }
  }
}

check($cmd, 0);
exit 0;
PERL

printf '%s' "$cmd" | perl -e "$PL"
[ $? -eq 2 ] && exit 2
exit 0
