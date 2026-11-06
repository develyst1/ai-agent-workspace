# Inbox — SA-B (Team B, Silver)

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

From Porter 2026-11-01: from now on, create every REQ / SPEC / TASK / TEST only with `node ai-worker/new-id.mjs <TYPE> <slug>`. It picks the next number under a lock and replaces the old TASK number blocks (Marie ORDER 53, harness 2.6.10). Never pick a number yourself. Drain this once read.

## 2026-11-01 — From Porter (PM) → @Silver: CLAUDE.md rule 4 changed today — re-read it (Marie ORDER 54)
Re-read workspace `CLAUDE.md` rule 4 before touching any database or env file. In short: never install, start or run a local Postgres (no local install, service or Docker container); develop and test against the owner's dev Postgres server, in this project's own database only, through the `DATABASE_URL` he gives. Env values come from the owner, asked through me; never build a stand-in. The repo's `.env.example` must list EVERY key, each with one line saying what it is for. Pass this to Fanta and Bob with their next TASK, and have them re-read rule 4 themselves. No reply needed.

## 2026-11-02 — From Porter (PM) → @Silver: CLAUDE.md rule 2 gained "Only the PM asks the owner anything" — re-read it (Marie ORDER 55)
Re-read workspace `CLAUDE.md` rule 2. In short: only the PM asks the owner anything, whether in chat or with a question box (the app's ask-a-question or next-step options). Even when he is looking at your own session, end your turn with a status line, and never with a question or an option menu for him. Your question goes to me in a file, and I ask him. Pass this to Fanta and Bob with their next TASK, and have them re-read rule 2 themselves. No reply needed.
