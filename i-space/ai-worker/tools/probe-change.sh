#!/usr/bin/env bash
# probe-change.sh — the consumer list of a shape change, by running it, not by grepping (P1c).
# Why: 13 consumer-list misses after the grep rule (F-018, 019, 026, 027, 028, 029, 034, 035, 036, 042): a grep
# picks its own words and misses test roots, schema objects, typed fixtures and generated types. The compiler and
# the tests do not. (owner via Atom 2026-10-30 16:04; ORDER 45; rule: SA-Lead.md § SPEC template, spec-rules.md)
#
# Usage:   bash ai-worker/tools/probe-change.sh <repo-logical-name> <patch-file> [cmd …]
#   <patch-file>  a unified diff of the change, paths relative to the repo root (`git diff` form, a/ b/ prefixes,
#                 or no prefix). Write it by hand, or make it in a scratch copy — never in the real repo.
#   [cmd …]       optional: each argument is one shell command run in the copy INSTEAD of the repo's defaults,
#                 e.g. 'node_modules/.bin/tsc --noEmit --pretty false' to skip a slow test suite.
#   Env: PROBE_TMP=<dir> (default $TMPDIR or /tmp — use your scratchpad) · PROBE_KEEP=1 keep the copies ·
#        PROBE_NO_BASE=1 skip the base run · PROBE_NO_PAIR=1 skip the paired front · PROBE_TIMEOUT=<s> per command
#
# What it does:
#   1. Copies the repo's working tree (tracked + untracked, not ignored — so never `.env`) twice under a scratch
#      dir: base/ and patched/. `node_modules` is a symlink to the real one. No git worktree, no branch, no git
#      write: the real repo is only READ (`git ls-files`, GIT_OPTIONAL_LOCKS=0).
#   2. Applies the patch to patched/ only (`patch -p1`, then `-p0`). Does not apply ⇒ exit 3.
#   3. Runs the same checks on both. Defaults (SYSTEM-FACTS / maps/blueprint.md §2, maps/caw.md "Run"):
#        blueprint-back  tsc --noEmit · bun test --timeout 30000
#        caw-back        tsc --noEmit · bun test
#        blueprint-front gen:api · typecheck · check:api · bun test src
#        caw-front       gen:api · typecheck · bun test src
#      (gen:api is skipped when the patch itself edits the generated schema.d.ts.) A back's copies are also run
#      through `openapi:emit`; when the patched openapi.json differs from the base one, the paired front
#      (blueprint-back → blueprint-front, caw-back → caw-front) is copied beside it and its defaults run against
#      that document (F-036, F-042). Every run: DATABASE_URL=pglite:memory, CLAUDE_BIN=<a stub that exits 1>,
#      GATEWAY_URL=http://127.0.0.1:9 — never the remote TEST DB, never a live Claude or gateway call.
#   4. Prints each NEW error (in patched, not in base) as `<repo> → file:line <code/kind> <message>`, under the
#      line the SPEC pastes:  Consumers (probe): probe-change.sh <repo> <patch> → <N errors>
#   5. Removes the copies and proves the real repo was not touched: tree-fp before = after, index unchanged.
# Exit: 0 ran (errors or not) · 2 usage/path · 3 patch does not apply · 4 the real repo changed during the probe
# (the probe writes only under the scratch dir; someone else edited it — say so, never "fix" it).
set -u
export GIT_OPTIONAL_LOCKS=0 LC_ALL=C

TOOLS="$(cd "$(dirname "$0")" && pwd)"
WS="$(cd "$TOOLS/../../.." && pwd)"
[ $# -ge 2 ] || { sed -n '6,13p' "$0" | sed 's/^# \{0,1\}//' >&2; exit 2; }
name="$1"; patchf="$2"; shift 2
custom=("$@")
[ -f "$patchf" ] || { echo "probe-change: no patch file '$patchf'" >&2; exit 2; }
patchf="$(cd "$(dirname "$patchf")" && pwd)/$(basename "$patchf")"

repo_path() { # logical name → path, from machine.local.md only (CLAUDE.md § Paths)
  awk -F'|' -v n="$1" '{g=$2; gsub(/^[ \t]+|[ \t]+$/,"",g); if (g==n) {p=$3; gsub(/^[ \t]+|[ \t]+$/,"",p); print p; exit}}' "$WS/machine.local.md" 2>/dev/null
}
real="$(repo_path "$name")"
[ -n "$real" ] && [ -d "$real/.git" ] || { echo "probe-change: '$name' has no existing repo path in machine.local.md — ask the human" >&2; exit 2; }

case "$name" in
  blueprint-back)  pair=blueprint-front ;;
  caw-back)        pair=caw-front ;;
  blueprint-front) back=blueprint-back ;;
  caw-front)       back=caw-back ;;
esac
pair="${pair:-}"; back="${back:-}"

fp_of() { bash "$TOOLS/tree-fp.sh" "$1" | sed -E 's/.* fp ([0-9a-f]+) .*/\1/'; }
idx_of() { sha256sum "$1/.git/index" 2>/dev/null | cut -c1-12; }
fp_before="$(fp_of "$real")"; idx_before="$(idx_of "$real")"
if [ -n "$pair" ] && [ -d "$(repo_path "$pair")/.git" ]; then pfp_before="$(fp_of "$(repo_path "$pair")")"; pidx_before="$(idx_of "$(repo_path "$pair")")"; fi

T="$(mktemp -d "${PROBE_TMP:-${TMPDIR:-/tmp}}/probe-change.XXXXXX")" || exit 2
cleanup() { [ "${PROBE_KEEP:-0}" = 1 ] && echo "kept: $T" || rm -rf "$T"; }
trap cleanup EXIT

copy_tree() { # $1 real repo, $2 dest — the tree a commit would see, plus node_modules as a link
  mkdir -p "$2"
  ( cd "$1" && git ls-files -z -co --exclude-standard | while IFS= read -r -d '' p; do [ -e "$p" ] || [ -L "$p" ] && printf '%s\0' "$p"; done \
      | tar --null -T - -cf - ) | tar -xf - -C "$2"
  [ -f "$1/next-env.d.ts" ] && cp "$1/next-env.d.ts" "$2/"
  [ -d "$1/node_modules" ] && ln -s "$1/node_modules" "$2/node_modules"
  return 0
}

stub="$T/claude-stub"; printf '#!/bin/sh\necho "probe-change: claude stub — no live run" >&2\nexit 1\n' > "$stub"; chmod +x "$stub"
run() { # $1 dir, $2 out file, $3 command
  ( cd "$1" && env -u DATABASE_URL -u BLUEPRINT_GATEWAY_LIVE -u BLUEPRINT_SIT -u AC5_DEV \
      DATABASE_URL=pglite:memory CLAUDE_BIN="$stub" GATEWAY_URL=http://127.0.0.1:9 CI=1 NO_COLOR=1 FORCE_COLOR=0 \
      timeout "${PROBE_TIMEOUT:-900}" bash -c "$3" ) > "$2" 2>&1
  echo $?
}

defaults() { # $1 repo name, $2 the patch touches its generated schema (1/0)
  case "$1" in
    blueprint-back)  printf '%s\n' 'node_modules/.bin/tsc --noEmit --pretty false' 'bun test --timeout 30000' ;;
    caw-back)        printf '%s\n' 'node_modules/.bin/tsc --noEmit --pretty false' 'bun test' ;;
    blueprint-front) [ "$2" = 1 ] || echo 'bun run gen:api'; printf '%s\n' 'bun run typecheck' 'bun run check:api' 'bun test src' ;;
    caw-front)       [ "$2" = 1 ] || echo 'bun run gen:api'; printf '%s\n' 'bun run typecheck' 'bun test src' ;;
    *)               printf '%s\n' 'node_modules/.bin/tsc --noEmit --pretty false' 'bun test' ;;
  esac
}
touches() { grep -qE "^(\+\+\+|---) (b/|a/)?$1([[:space:]]|$)" "$patchf"; }

cat > "$T/parse.mjs" <<'JS'
// errors of one command's output → one line each: file:line<TAB>kind<TAB>message (paths made repo-relative)
import { readFileSync } from "node:fs";
const [out, root, cmd, code] = process.argv.slice(2);
const strip = (s) => s.split(root + "/").join("").replace(/\x1b\[[0-9;]*m/g, "");
const lines = strip(readFileSync(out, "utf8")).split("\n");
const res = [];
let file = null, loc = null;
for (const l of lines) {
  let m;
  if ((m = /^(\S[^(]*?)\((\d+),\d+\): error (TS\d+): (.*)$/.exec(l)) || (m = /^(\S+?):(\d+):\d+ - error (TS\d+): (.*)$/.exec(l))) {
    res.push(`${m[1]}:${m[2]}\t${m[3]}\t${m[4].length > 200 ? m[4].slice(0, 200) + "…" : m[4]}`); continue;
  }
  if ((m = /^(\S+\.(?:test|spec)\.[cm]?[jt]sx?):$/.exec(l))) { file = m[1]; loc = null; continue; }
  if ((m = /\(?((?:src|test|tests|scripts)\/[^\s():]+):(\d+):\d+\)?\s*$/.exec(l)) && /^\s*(at |❯|\d+ \|)/.test(l) && !loc) { loc = `${m[1]}:${m[2]}`; continue; }
  if ((m = /^\s*\(fail\) (.*?)(?: \[[\d.]+m?s\])?$/.exec(l))) { res.push(`${loc ?? file ?? "?"}\t(fail)\t${m[1]}`); loc = null; continue; }
  if (/^\s*\(pass\) /.test(l)) { loc = null; continue; }
  if (/differs from the OpenAPI document/.test(l)) { res.push(`src/core/api/schema.d.ts\tcheck:api\tdiffers from the OpenAPI document`); continue; }
}
if (!res.length && code !== "0") {
  const tail = lines.filter((x) => x.trim()).slice(-3).join(" | ").slice(0, 300);
  res.push(`(command)\texit ${code}\t${cmd} — ${tail}`);
}
console.log(res.join("\n"));
JS

declare -A summary
side_run() { # $1 side (base|patched), $2 repo name, $3 dir, rest: commands → writes $T/$1.$2.errors
  local side="$1" rn="$2" dir="$3"; shift 3
  local k=0 c code errs=() ; : > "$T/$side.$rn.errors"
  for c in "$@"; do
    k=$((k+1)); code="$(run "$dir" "$T/$side.$rn.$k.out" "$c")"
    node "$T/parse.mjs" "$T/$side.$rn.$k.out" "$dir" "$c" "$code" | grep . | sed "s|^|$rn → |" >> "$T/$side.$rn.errors"
    errs+=("$c: exit $code")
  done
  summary["$side.$rn"]="$(IFS=';'; echo "${errs[*]}")"
}
new_errors() { # lines in patched not in base, compared without the line number (a patch shifts lines)
  node --input-type=module - "$T/base.$1.errors" "$T/patched.$1.errors" "${PROBE_NO_BASE:-0}" <<'JS'
import { readFileSync, existsSync } from "node:fs";
const [b, p, nobase] = process.argv.slice(2);
const read = (f) => (existsSync(f) ? readFileSync(f, "utf8").split("\n").filter(Boolean) : []);
const key = (l) => l.replace(/:(\d+)\t/, "\t");
const left = new Map();
if (nobase !== "1") for (const l of read(b)) left.set(key(l), (left.get(key(l)) ?? 0) + 1);
for (const l of read(p)) { const k = key(l); if (left.get(k)) left.set(k, left.get(k) - 1); else console.log(l.replace(/\t/, " ").replace(/\t/, " ")); }
JS
}

sides=(patched); [ "${PROBE_NO_BASE:-0}" = 1 ] || sides=(base patched)
for s in "${sides[@]}"; do copy_tree "$real" "$T/$s/$name"; done
( cd "$T/patched/$name" && { patch -p1 -t -N -s --dry-run < "$patchf" >/dev/null 2>&1 && patch -p1 -t -N -s --no-backup-if-mismatch < "$patchf"; } \
  || { patch -p0 -t -N -s --dry-run < "$patchf" >/dev/null 2>&1 && patch -p0 -t -N -s --no-backup-if-mismatch < "$patchf"; } ) \
  || { echo "probe-change: the patch does not apply to $name's working tree (tried -p1 and -p0) — rebase it on the files as they are now" >&2; exit 3; }

gen=0; { touches 'src/core/api/schema.d.ts' || touches 'src/api/schema.d.ts'; } && gen=1
if [ ${#custom[@]} -gt 0 ]; then cmds=("${custom[@]}"); else mapfile -t cmds < <(defaults "$name" "$gen"); fi
for s in "${sides[@]}"; do
  if [ -n "$back" ]; then mkdir -p "$T/$s/$back"; cp "$(repo_path "$back")/openapi.json" "$T/$s/$back/" 2>/dev/null; fi
  side_run "$s" "$name" "$T/$s/$name" "${cmds[@]}"
done

paired=""
if [ -n "$pair" ] && [ "${PROBE_NO_PAIR:-0}" != 1 ] && [ -d "$(repo_path "$pair")" ]; then
  for s in "${sides[@]}"; do run "$T/$s/$name" "$T/$s.emit.out" 'bun run openapi:emit' >/dev/null; done
  changed=0
  if [ "${PROBE_NO_BASE:-0}" = 1 ]; then cmp -s "$T/patched/$name/openapi.json" "$(repo_path "$name")/openapi.json" || changed=1
  else cmp -s "$T/base/$name/openapi.json" "$T/patched/$name/openapi.json" || changed=1; fi
  touches openapi.json && changed=1
  if [ "$changed" = 1 ]; then
    paired="$pair"
    mapfile -t pcmds < <(defaults "$pair" 0)
    for s in "${sides[@]}"; do copy_tree "$(repo_path "$pair")" "$T/$s/$pair"; side_run "$s" "$pair" "$T/$s/$pair" "${pcmds[@]}"; done
  fi
fi

out="$( { new_errors "$name"; [ -n "$paired" ] && new_errors "$paired"; } | grep . )"
n="$(printf '%s' "$out" | grep -c .)"
echo "probe-change $name $(basename "$patchf") — scratch copies under $T"
for s in "${sides[@]}"; do
  echo "  $s $name: ${summary[$s.$name]}"
  [ -n "$paired" ] && echo "  $s $paired (paired; openapi.json changed): ${summary[$s.$paired]}"
done
[ -n "$pair" ] && [ -z "$paired" ] && [ "${PROBE_NO_PAIR:-0}" != 1 ] && echo "  paired $pair: not run — openapi.json is the same before and after the patch"
[ -n "$paired" ] && echo "  ⇒ openapi.json changes: $paired needs its gen:api + typecheck$([ "$paired" = blueprint-front ] && echo ' + check:api') step in a paired TASK (spec-rules.md § 2)"
echo
echo "Consumers (probe): probe-change.sh $name $(basename "$patchf") → $n errors"
[ -n "$out" ] && printf '%s\n' "$out"
echo
fp_after="$(fp_of "$real")"; idx_after="$(idx_of "$real")"
if [ "$fp_before" = "$fp_after" ] && [ "$idx_before" = "$idx_after" ]; then
  echo "real repo $name untouched: tree-fp $fp_before before = after; index $idx_before unchanged"
  if [ -n "${pfp_before:-}" ]; then
    pfp_after="$(fp_of "$(repo_path "$pair")")"; pidx_after="$(idx_of "$(repo_path "$pair")")"
    [ "$pfp_before" = "$pfp_after" ] && [ "$pidx_before" = "$pidx_after" ] \
      && echo "real repo $pair untouched: tree-fp $pfp_before before = after; index $pidx_before unchanged" \
      || { echo "🔴 real repo $pair CHANGED during the probe: tree-fp $pfp_before → $pfp_after — the probe writes only under $T; someone else edited it."; exit 4; }
  fi
else
  echo "🔴 real repo $name CHANGED during the probe: tree-fp $fp_before → $fp_after, index $idx_before → $idx_after. The probe writes only under $T — someone else edited the repo meanwhile; re-run, and say so in the SPEC."
  exit 4
fi
exit 0
