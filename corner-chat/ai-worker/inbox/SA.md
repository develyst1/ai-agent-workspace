# Inbox — SA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.
From Jason (BE, Team A) 2026-11-01: TASK-007 is REVIEW — step 0 done, `registerNotifier` + `onNotified` + FCM client + devices + line push count ready (262 pass, live w/o Firebase). Team B can now call `registerNotifier("line", …)` from core/notify; 3 questions (module fn vs deps, 404 rule, notified_at) — see tasks/TASK-007-notify-devices-line-push-count.md §Questions
