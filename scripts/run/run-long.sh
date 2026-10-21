#!/usr/bin/env bash
# Long dispatcher run launcher (DISPATCHER.md § "Long run"). The operator runs it; nobody else.
#   scripts/run/run-long.sh <desk>
# Refuses unless <desk>/ai-worker/RUN-PLAN.md says mode: dispatcher and carries today's signature
# "confirmed: [operator <today> HH:MM] hops: N". Then runs one headless dispatcher session with that
# hop budget; the stream goes to <desk>/ai-worker/log/run-<date>-<time>.jsonl (git-ignored).
# Installed by Marie 2026-10-06 (as run-overnight.sh); reshaped by Atlas the same day.

desk=$1
[ -n "$desk" ] || { echo "usage: scripts/run/run-long.sh <desk>" >&2; exit 1; }
case "$desk" in */*|.*) echo "refused: <desk> must be a desk folder name at the workspace root, got '$desk'" >&2; exit 1 ;; esac

root=$(cd "$(dirname "$0")/../.." && pwd) || exit 1
cd "$root" || exit 1

today=$(date +%Y-%m-%d)
plan="$desk/ai-worker/RUN-PLAN.md"

[ -d "$desk/ai-worker" ] || { echo "refused: no desk '$desk' (no $desk/ai-worker/ under $root)" >&2; exit 1; }
[ -f "$plan" ] || { echo "refused: $plan does not exist — readiness not done, no long run" >&2; exit 1; }
grep -Eq '^mode:[[:space:]]*dispatcher([[:space:]]|$)' "$plan" \
  || { echo "refused: $plan does not say 'mode: dispatcher'" >&2; exit 1; }
sig=$(grep -E "^confirmed:.*\[operator $today [0-9]{2}:[0-9]{2}\][[:space:]]*hops:[[:space:]]*[0-9]+" "$plan" | tail -1)
[ -n "$sig" ] || { echo "refused: $plan is not confirmed by the operator today — need 'confirmed: [operator $today HH:MM] hops: N'" >&2; exit 1; }
hops=$(printf '%s\n' "$sig" | sed -E 's/.*hops:[[:space:]]*([0-9]+).*/\1/')
[ "$hops" -ge 1 ] 2>/dev/null || { echo "refused: hop count missing in '$sig'" >&2; exit 1; }

claude_bin="$HOME/.local/bin/claude"
[ -x "$claude_bin" ] || { echo "refused: $claude_bin not found" >&2; exit 1; }

# Extra directories the run may touch: only the desk's own code root from machine.local.md (git-ignored).
add_dir=
if [ "$desk" = "usb-oda" ]; then
  add_dir=$(awk -F'|' '{k=$2; gsub(/[ `]/, "", k); if (k == "usb-oda-root") {v=$3; gsub(/^[ `]+|[ `]+$/, "", v); print v; exit}}' machine.local.md 2>/dev/null)
  [ -n "$add_dir" ] && [ -d "$add_dir" ] \
    || { echo "refused: machine.local.md has no existing 'usb-oda-root' path (got '$add_dir') — fix machine.local.md" >&2; exit 1; }
fi

mkdir -p "$desk/ai-worker/log" || exit 1
stamp=$(date +%Y-%m-%d-%H%M)
log="$desk/ai-worker/log/run-$stamp.jsonl"
prompt="อ่าน DISPATCHER.md แล้วรัน $desk — Long run (RUN-PLAN.md ยืนยันแล้ว, N=$hops)"

echo "long run: desk=$desk hops=$hops log=$log${add_dir:+ add-dir=$add_dir}"
set -- -p "$prompt" --model opus --effort medium --permission-mode acceptEdits \
  --settings scripts/run/run-settings.json --output-format stream-json --verbose
[ -n "$add_dir" ] && set -- "$@" --add-dir "$add_dir"
caffeinate -i "$claude_bin" "$@" > "$log" 2>&1
status=$?
echo "long run ended: exit $status — stream in $log; report in $desk/ai-worker/RUN-REPORT-$today.md"
exit $status
