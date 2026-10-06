#!/usr/bin/env bash
# diff-shape.sh — what a host reviewer will see: existing code REMOVED, hunk by hunk.
#   diff-shape.sh <repo> <base-ref> [<head-ref>|WORKTREE] [<path>...]
# Classifies every hunk of `git diff -w` (imports, exports and blank lines ignored):
#   ADD   — only added lines                                  → fine for a key change
#   SWAP  — exactly one existing line replaced (wrapper swap)  → fine IF it is the wrapped widget's constructor
#   TOUCH — two or more existing lines removed or moved, OR any removed line that already carries
#           automation (`*Automate*`, `Semantics(identifier`, an existing key) → a key change must not do this
# Exit 0 = no TOUCH hunk. Exit 1 = TOUCH hunks (printed). Exit 2 = usage / git error.
# Rule: rat-semantic-keys §2 "wrap-only". Origin: commit 0801349 moved two onPressed bodies (TOUCH);
# the team's fix b7948af only swapped `CmlButton(` → `TaxoL2AutomateCmlButtonSlot(` (SWAP).
set -u
repo=${1:-}; base=${2:-}; head=${3:-WORKTREE}
[ -n "$repo" ] && [ -n "$base" ] || { echo "usage: diff-shape.sh <repo> <base-ref> [<head-ref>|WORKTREE] [<path>...]" >&2; exit 2; }
shift 2; [ $# -gt 0 ] && shift
git -C "$repo" rev-parse --verify -q "$base^{commit}" >/dev/null || { echo "unknown base ref: $base" >&2; exit 2; }
if [ "$head" = WORKTREE ]; then range=("$base"); else range=("$base" "$head"); fi
diff=$(git -C "$repo" diff -w --unified=0 "${range[@]}" -- "$@" 2>&1) || { echo "$diff" >&2; exit 2; }

printf '%s\n' "$diff" | awk -v range="${range[*]}" '
  function flush() {
    if (hunk == "") return
    kind = (rem == 0) ? "ADD" : ((rem == 1 && !auto) ? "SWAP" : "TOUCH")
    count[kind]++
    if (kind != "ADD") { print kind "  " file " " hunk; printf "%s", body }
    hunk = ""; rem = 0; body = ""; auto = 0
  }
  function code(s) { t = s; gsub(/^[ \t]+/, "", t); return !(t == "" || t ~ /^(import|export|part) /) }
  /^diff --git /    { flush(); next }
  /^--- /           { next }
  /^\+\+\+ b\//     { file = substr($0, 7); next }
  /^\+\+\+ /        { next }
  /^@@ /            { flush(); hunk = $2 " " $3; next }
  /^-/              { l = substr($0, 2); if (code(l)) { rem++; if (l ~ /Automate|identifier|AutomateKey/) auto = 1; body = body "      -" l "\n" }; next }
  /^\+/             { l = substr($0, 2); if (code(l) && rem > 0) body = body "      +" l "\n"; next }
  END {
    flush()
    printf "diff-shape (%s): ADD %d · SWAP %d · TOUCH %d\n", range, count["ADD"]+0, count["SWAP"]+0, count["TOUCH"]+0
    exit (count["TOUCH"] > 0) ? 1 : 0
  }'
