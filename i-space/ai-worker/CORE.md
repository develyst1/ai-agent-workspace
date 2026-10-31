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

## How the operator works

## Run & environments

## Standing rules in force
