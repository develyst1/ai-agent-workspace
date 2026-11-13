# CORE — the working core of this desk (read FIRST, every role, every session)

> **What it is:** the every-day knowledge a new session needs before it acts — which repo and branch, how the
> operator wants things done, how to run things, which rules are in force. The other knowledge files are
> history-shaped (append-only, dated, split); a new session cannot look up what it does not know it is missing.
> This file is the opposite (workforce-protocol §8).
>
> **Rules:**
> - **Curated and rewritten, never append-only.** When a decision changes daily work, the line here is rewritten
>   in the same unit; a superseded line is removed (its source stays in `DECISIONS.md`). Never split by date or topic.
> - **The PM owns it** (role-pm). Other roles report a missing or wrong line to the PM; they do not edit it.
> - **Every line points to its source** — `DECISIONS.md` date/line, `facts/<file>:line`, a SPEC/TASK line. The source
>   wins if they differ. A line with no source is a guess.
> - **Never a secret.** No password, token, key, customer number or personal data — name the account, the env file or
>   the person who holds it instead.
> - **≤ 12 KB.** The gate FAILs it above that: it is read at boot by every role. Keep only what is needed every day;
>   one-off history stays where it is.

## People
Who is who (nickname, full name, GitHub login, what they own) is in **`PEOPLE.md`**, also read at boot.

## Repos & branches
- `god-plan-back` (BE, Bun + Hono) and `god-plan-front` (FE, Next.js + HeroUI v3), both on branch `atom`; paths in `machine.local.md`. (DECISIONS 2026-11-07, 2026-11-08 00:39 · SYSTEM-FACTS 2026-11-08 10:16)
- Git only on the owner's three commands, relayed by the PM, typed by the SA. (workspace `CLAUDE.md` §6)

## How the operator works
- He talks to the desk through Atom; his words come quoted with a time. Remaining REQ-001 product points were delegated to the PM via team brainstorm (DECISIONS 2026-11-08 01:25).
- He wants to see choices, not one option, for anything visual (AC-10: he picked B of two). (DECISIONS 2026-11-08 15:53)

## Run & environments
- Local only, `bun run dev` + `next dev`, nothing deployed. (SYSTEM-FACTS D4, 2026-11-08)
- Dev database `god_plan` on his dev Postgres, connection from `call-scribe-back`'s `.env`; never print it; never a local Postgres. (DECISIONS 2026-11-08 00:39 · SYSTEM-FACTS 2026-11-09 14:58)
- AI only through his gateway; live calls only with his word per run (D11: 4 calls, used 2026-11-09). (DECISIONS 2026-11-09 14:52)
- This box pauses for minutes under memory pressure: timed checks run with `tests/harness/timer-stall-detector.mjs`. (TEST-001 OBS-2)

## Standing rules in force
- **Code standard (owner 2026-11-09 14:59):** professional, scalable, reusable, clean; every setting from config/env with `.env.example`; **no hardcoding**, front and back; front follows `nextjs-pattern-generator` / `nextjs-heroui-pattern` where they fit HeroUI v3. (DECISIONS 2026-11-09 14:59)
- Synthetic people only in tests. (SYSTEM-FACTS 2026-11-07)
- UI strings: Thai only, exact text from REQ-001 §User-facing wording; never invent. (D6)
