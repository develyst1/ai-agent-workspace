# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.
From Porter 2026-09-23: the owner fixed the SIT outage ("fix done") — please re-check sign-in on SIT and, if it answers, run the admin suite and close REQ-004. If it is still 500/502, tell me exactly what you see (status, endpoint, time) and I go back to him once.
From Porter 2026-09-23: FYI — the BE outage fix is built but NOT deployed; the owner wants it to ship with the redesign in one deploy. SIT runs the old BE, so if sign-in 502s again, stop and tell me (don't retry loops); the cause is known (ADMIN_EMAILS parsing) and only a deploy fixes it. Nothing for you to run right now.
