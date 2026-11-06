#!/usr/bin/env bash
# TASK-037 throwaway: one "tap the collapsed group" iteration on the emulator.
# usage: iter.sh <ext> ; env: ADB, LAB, BACK (back-end checkout)
set -u
E="$ADB -s emulator-5554"
ext="$1"
$E shell input keyevent 3; sleep 2
out=$(cd "$BACK" && bun "$LAB" msg "$ext" notified 2>&1 | tail -1)
id=${out##*id=}
# wait (<= 70 s) for the message notification to be in the shade
for i in $(seq 1 35); do
  $E shell dumpsys notification --noredact | grep -q "g:cc.messages" && break
  sleep 2
done
$E shell cmd statusbar expand-notifications; sleep 2
$E shell input tap 340 600; sleep 3
pid=$($E shell pidof com.develyst.cornerchat | tr -d '\r' | awk '{print $1}')
$ADB -s emulator-5554 forward tcp:9222 localabstract:webview_devtools_remote_$pid >/dev/null
url=$(curl -s http://127.0.0.1:9222/json | grep -o '"url": "[^"]*"' | head -1)
echo "$ext expected=/messages/$id -> $url"
