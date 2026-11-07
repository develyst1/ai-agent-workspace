#!/usr/bin/env bash
# TASK-103 prep: put ONE defect at a time into a scratch COPY of the scripts and run test-prep.sh on it; the test must go red.
# Usage: mutation-run.sh <real-gateway-repo> [name ...]      (no names = all). Sequential: the tests share ports.
# Each mutation uses mutate.ts, which throws unless the text to replace occurs exactly once. Nothing real is touched.
set -u
REAL=${1:?usage: mutation-run.sh <gateway repo> [name ...]}; shift
export PATH="$HOME/.bun/bin:$PATH"
HERE=$(cd "$(dirname "$0")" && pwd)
H=$(cd "$HERE/.." && pwd)
# name | file | from | to
MUTS=(
'spawn-via-bun-run|run-check.ts|spawn(process.execPath, ["src/index.ts"]|spawn("bun", ["run", "start"]'
'busy-port-check|run-check.ts|if (await answers()) die(`REFUSING: something already answers|if (false) die(`REFUSING: something already answers'
'silent-listener-check|run-check.ts|.status === 0) die(`REFUSING: something is already listening|.status === 99) die(`REFUSING: something is already listening'
'auth-off|run-check.ts|AUTH_ENABLED: "true"|AUTH_ENABLED: "false"'
'auth-check-removed|run-check.ts|if (st !== 401) die(|if (false) die('
'mismatch-check|run-check.ts|if (mismatch.length) die(|if (false) die('
'api-keys-left|run-check.ts|cleanup.push(() => rmSync(keyFile, { force: true }));|'
'poll-pause-guard|run-check.ts|await pauseGuard("poll");|'
'run-length-gate|run-check.ts|if (clipSeconds > LONG_S|if (false'
'long-needs-short-run|run-check.ts|if (flag("long") && !ledger.entries.some(|if (false && !ledger.entries.some('
'tts-guard-before-call|tts-voices.ts|guard(); // pause check before the paid call|'
'tts-guard-after-call|tts-voices.ts|guard(); // and after the call|'
'tts-guess-before-call|tts-voices.ts|l.entries.push(entry);|'
'tts-ledger-per-turn|tts-voices.ts|saveLedger(ledgerPath, l3);|'
'poll-fetch-no-limit|run-check.ts|headers: H, signal: AbortSignal.timeout(pollLimitMs)|headers: H'
'post-fetch-no-limit|run-check.ts|{ ...init, signal: AbortSignal.timeout(callLimitMs) }|{ ...init }'
'tts-fetch-no-limit|tts-voices.ts|signal: AbortSignal.timeout(callLimitMs),|'
'ceiling-raised|pause.ts|export const MAX_LIMIT_USD = 0.5;|export const MAX_LIMIT_USD = 5;'
'models-not-required|run-check.ts|if (provider !== "stub" && (!transcribeModel|if (false && (!transcribeModel'
'model-mismatch-off|run-check.ts|if (provider !== "stub") {|if (false) {'
'allow-list-off|run-check.ts|"--preload", new URL("./allow-hosts.ts", import.meta.url).pathname, |'
'allow-list-lets-deepseek-through|allow-hosts.ts|"api.x.ai", "localhost"|"api.x.ai", "api.deepseek.com", "localhost"'
'long-ledger-cap-off|run-check.ts|if (flag("long") && ledger.total_usd > LONG_MAX_LEDGER_USD)|if (false)'
'ledger-refuses-after-pause|pause.ts|if (l?.pause) return { refused: true, move_s: l.pause.move_s };|'
)
sel=("$@")
for m in "${MUTS[@]}"; do
  IFS='|' read -r name file from to <<<"$m"
  if [ ${#sel[@]} -gt 0 ] && [[ ! " ${sel[*]} " =~ " $name " ]]; then continue; fi
  M=$(mktemp -d); mkdir "$M/harness"; cp -r "$HERE" "$M/harness/provider-check"; cp "$H/refuse-fetch.ts" "$M/harness/"
  if ! bun "$HERE/mutate.ts" "$M/harness/provider-check/$file" "$from" "$to" >"$M/mut.out" 2>&1; then echo "MUTATION $name: COULD NOT BE APPLIED: $(head -1 "$M/mut.out" | cut -c1-160)"; rm -rf "$M"; continue; fi
  timeout 400 bash "$M/harness/provider-check/test-prep.sh" "$REAL" >"$M/out.txt" 2>&1; rc=$?
  n=$(grep -c '^FAIL ' "$M/out.txt")   # "FAIL " = a failed check; the scripts' own "FAILED (…)" messages are expected output
  echo "MUTATION $name: $([ "$n" -gt 0 ] && echo RED || echo "GREEN (not caught)") failed_checks=$n exit=$rc first: $(grep -m1 '^FAIL ' "$M/out.txt" | cut -c1-110)"
  rm -rf "$M"
done
