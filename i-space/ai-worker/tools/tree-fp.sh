#!/usr/bin/env bash
# tree-fp.sh — ONE read-only fingerprint of a repo's working tree: what a commit of "every changed path" would
# contain. QA's verdict ("the build I tested is the build there now") and the SA's pre-commit check both use it,
# so nobody improvises a recipe in a live repo. (F-031, P13; owner via Atom 2026-10-30 16:04; ORDER 45)
#
# Usage:   bash ai-worker/tools/tree-fp.sh <repo-logical-name>  [--list]
#          (a path to a repo directory also works — for scratch copies)
# Prints:  tree-fp <repo> HEAD <short> fp <12 hex> (<N> paths: <T> tracked, <U> untracked, <D> deleted)
#          --list also prints one line per path: <F|X|L|D> <sha256 or -> <path>  (X = executable file,
#          L = symlink, hashed by its target, D = tracked but deleted in the tree)
#
# What it covers: every tracked file and every untracked file that is NOT ignored (`git ls-files -co
# --exclude-standard`), by content, mode and path — so an edit, a new file, a deleted file or a chmod each
# changes the value. Ignored files (node_modules, .env, build output) do not count: a commit never takes them.
# HEAD is printed but is NOT in the fp, so the value is about the files, not about where they came from.
#
# Read only — it never writes the index, the objects or any file: only `git rev-parse` and `git ls-files`, with
# GIT_OPTIONAL_LOCKS=0 (no opportunistic index refresh). Never use `git add -N`, `git status` variants that
# refresh, or `git stash` to fingerprint (F-031). Any git experiment beyond reading goes in a scratch copy.
set -u
export GIT_OPTIONAL_LOCKS=0 LC_ALL=C

WS="$(cd "$(dirname "$0")/../../.." && pwd)"
[ $# -ge 1 ] || { echo "usage: tree-fp.sh <repo-logical-name> [--list]" >&2; exit 2; }
name="$1"; list=0; [ "${2:-}" = "--list" ] && list=1

if [[ "$name" == */* ]] && [ -d "$name" ]; then
  repo="$(cd "$name" && pwd)"
else
  # machine.local.md row: | <logical name> | <path> | <status> |   (paths live only there — CLAUDE.md)
  repo="$(awk -F'|' -v n="$name" '{g=$2; gsub(/^[ \t]+|[ \t]+$/,"",g); if (g==n) {p=$3; gsub(/^[ \t]+|[ \t]+$/,"",p); print p; exit}}' "$WS/machine.local.md" 2>/dev/null)"
  [ -n "$repo" ] && [ -d "$repo" ] || { echo "tree-fp: '$name' has no existing path in machine.local.md — ask the human (CLAUDE.md § Paths)" >&2; exit 2; }
fi
git -C "$repo" rev-parse --git-dir >/dev/null 2>&1 || { echo "tree-fp: $repo is not a git repo" >&2; exit 2; }

head="$(git -C "$repo" rev-parse --short HEAD 2>/dev/null || echo none)"
tracked="$(git -C "$repo" ls-files -z -c | tr -cd '\0' | wc -c)"
untracked="$(git -C "$repo" ls-files -z -o --exclude-standard | tr -cd '\0' | wc -c)"

lines="$(
  cd "$repo" || exit 2
  git ls-files -z -co --exclude-standard | sort -zu | while IFS= read -r -d '' p; do
    if [ -L "$p" ]; then printf 'L %s %s\n' "$(readlink -- "$p" | sha256sum | cut -c1-64)" "$p"
    elif [ -f "$p" ]; then
      t=F; [ -x "$p" ] && t=X
      printf '%s %s %s\n' "$t" "$(sha256sum < "$p" | cut -c1-64)" "$p"
    else printf 'D - %s\n' "$p"; fi
  done
)"
fp="$(printf '%s\n' "$lines" | sha256sum | cut -c1-12)"
n="$(printf '%s\n' "$lines" | grep -c .)"
deleted="$(printf '%s\n' "$lines" | grep -c '^D ')"

[ "$list" = 1 ] && printf '%s\n' "$lines"
echo "tree-fp $name HEAD $head fp $fp ($n paths: $tracked tracked, $untracked untracked, $deleted deleted)"
