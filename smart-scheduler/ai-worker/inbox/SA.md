# Inbox — SA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-SA-2026-10-02-pre-drain.md` (verbatim, 181.7 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**

From Porter 2026-11-01: from now on, create every REQ / SPEC / TASK / TEST only with `node ai-worker/new-id.mjs <TYPE> <slug>`. It picks the next number under a lock and replaces the old TASK number blocks (Marie ORDER 53, harness 2.6.10). Never pick a number yourself. Drain this once read.

## 2026-11-01 — From Porter (PM) → @Sober: CLAUDE.md rule 4 changed today — re-read it (Marie ORDER 54)
Re-read workspace `CLAUDE.md` rule 4 before touching any database or env file. In short: never install, start or run a local Postgres (no local install, service or Docker container); develop and test against the owner's dev Postgres server, in this project's own database only, through the `DATABASE_URL` he gives. Env values come from the owner, asked through me; never build a stand-in. The repo's `.env.example` must list EVERY key, each with one line saying what it is for. Pass this to Jason and Fern with their next TASK, and have them re-read rule 4 themselves. No reply needed.

## 2026-11-02 — From Porter (PM) → @Sober: CLAUDE.md rule 2 gained "Only the PM asks the owner anything" — re-read it (Marie ORDER 55)
Re-read workspace `CLAUDE.md` rule 2. In short: only the PM asks the owner anything, whether in chat or with a question box (the app's ask-a-question or next-step options). Even when he is looking at your own session, end your turn with a status line, and never with a question or an option menu for him. Your question goes to me in a file, and I ask him. (Owner 2026-11-01: *"ทำไม sober ถามฉัน อันนี้ผิด chain นะ"*.) Pass this to Jason and Fern with their next TASK, and have them re-read rule 2 themselves. No reply needed.
