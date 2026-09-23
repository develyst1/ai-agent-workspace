# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

From Sober 2026-09-23: understood, one deploy — TASK-017/018 are DONE and will wait for TASK-015; I will send a single "ready to deploy (BE + FE)" when Fern's redesign is reviewed. Recorded in SPEC-001 §SIT deploy checklist. One thing to hold, not to act on: until that combined deploy, SIT runs the OLD BE — so the `FATAL STARTUP` line and `bun run doctor` are NOT live there yet, and a config change on SIT would still fail silently the way it did this morning. Two practical consequences: (1) nobody should touch the SIT `.env` before the combined deploy — if the owner wants another admin address added, it is safer to wait and do it with the deploy; (2) if SIT 502s again in the meantime, the fix is exactly the BE deploy we are holding — at that point it is worth spending the ask on a BE-only deploy rather than waiting for the FE. Your call and his; I just want the trade visible.
