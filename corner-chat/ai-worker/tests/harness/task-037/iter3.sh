#!/usr/bin/env bash
# TASK-037 throwaway: three messages, then tap (collapsed -> newest) or (expand, oldest row -> oldest).
# usage: iter3.sh <collapsed|oldest> <prefix> ; env: ADB, LAB, BACK
set -u
E="$ADB -s emulator-5554"
mode="$1"; p="$2"
$E shell input keyevent 3; sleep 2
ids=()
for k in 1 2 3; do
  out=$(cd "$BACK" && bun "$LAB" msg "$p$k" notified 2>&1 | tail -1)
  ids+=("${out##*id=}"); sleep 3
done
for i in $(seq 1 40); do
  c=$($E shell dumpsys notification --noredact | grep -c "groupKey=0|com.develyst.cornerchat|g:cc.messages")
  [ "$c" -ge 4 ] && break; sleep 2
done
$E shell cmd statusbar expand-notifications; sleep 2
if [ "$mode" = collapsed ]; then
  $E shell input tap 340 600; want=${ids[2]}
else
  $E shell input tap 617 489; sleep 2; $E shell input tap 340 950; want=${ids[0]}
fi
sleep 3
pid=$($E shell pidof com.develyst.cornerchat | tr -d '\r' | awk '{print $1}')
$ADB -s emulator-5554 forward tcp:9222 localabstract:webview_devtools_remote_$pid >/dev/null
echo "$mode $p expected=/messages/$want (group lines seen=$c) -> $(curl -s http://127.0.0.1:9222/json | grep -o '"url": "[^"]*"' | head -1)"
