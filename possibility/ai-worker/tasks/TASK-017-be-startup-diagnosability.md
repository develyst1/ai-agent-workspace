# TASK-017: BE — make a failed startup diagnosable (and keep `/health` answering)
- Source: SIT incident 2026-09-23 (sign-in 500 / `/api/v1/health` 502 after the TASK-016 deploy); SPEC-001 §Backend layout (fail-fast), SPEC-003 §Non-functional (AI config), SPEC-005 §Amendment (ADMIN_EMAILS)
- Owner: BE (Jason)
- Status: DONE
- Depends on: none. **Nothing here needs SIT access.**

## Why (read before coding)
The BE has **three hard `process.exit(1)` paths at import time**: `env.ts` missing-var, `env.ts` `ADMIN_EMAILS`/legacy empty, `index.ts` AI-config. Under a process manager any of them is a crash loop, and from outside it looks identical: the proxy returns 502 for everything and the app never logs anything a non-engineer can act on. The `ADMIN_EMAILS` exit is mine (SPEC-005 §Amendment) and the incident followed that exact env swap, so it is the first suspect — a quoted value, a typo in the var name, or a stray `ADMIN_EMAIL S=` all produce "empty list → exit".

## What to do
1. **One fatal line, always, with a stable prefix.** Every one of the three exits prints exactly `FATAL STARTUP: <what is wrong> — <what to fix, naming the env var>` to stderr before exiting, and nothing else. No stack traces for config problems.
2. **Reproduce the SIT shape locally** (no SIT access needed) and record what each produces: (a) `ADMIN_EMAILS` quoted `"a@b.com,c@d.com"`; (b) name typo `ADMIN_EMAIL S=...`; (c) `ADMIN_EMAILS` absent **and** `ADMIN_EMAIL` absent; (d) `ADMIN_EMAILS=""`; (e) `AI_GATEWAY_URL` reachable but returning junk; (f) `DATABASE_URL` pointing at a dead host. State which of these exits, which starts, and what the operator sees.
3. **`GET /api/v1/health` must answer even when the AI config is unusable.** Change the AI-config step: on failure, log `FATAL STARTUP`-style as a **WARN** instead, start the server, and make `/health` return `200 {"status":"degraded","db":"ok|down","aiConfig":"error: <msg>"}`. Genuinely fatal config (env vars, admin list, DB URL absent) still exits — but then `/health` is unreachable **by design**, and item 1's line is the only explanation anyone needs.
4. Add `bun run doctor` (`src/doctor.ts`): loads env + admin list + AI config + a `select 1`, prints a PASS/FAIL line per check with **names only, never values**, and exits non-zero on the first FAIL. This is what the owner can be asked to run on SIT later — one command, no secrets echoed.

## Definition of Done
- [x] Each case (a)–(f) run locally: paste the exact operator-visible output and whether the process stayed up.
- [x] `/health` with a broken AI config → `200` `"status":"degraded"` — paste; with a good config → `"status":"ok"` — paste.
- [x] `bun run doctor` output on a good env (all PASS) and on a broken one (first FAIL, non-zero exit) — paste both; confirm no value (URL, password, email) appears in either.
- [x] Confirm the three exit paths now print the `FATAL STARTUP:` prefix — paste one example each.
- [x] `bunx tsc --noEmit` clean. No route, schema or DTO change.

## Implementation Notes
(Jason, 2026-09-23 — no git writes, no SIT access used. All runs local, env vars set inline; values never printed)

**Files in `possibility-back`:** `src/env.ts` (both exits now print one `FATAL STARTUP:` line naming the variable and the fix) · `src/index.ts` (AI config failure is a **WARN**, the server starts, `/health` reports `degraded`) · `src/doctor.ts` (new) · `package.json` (`"doctor": "bun src/doctor.ts"`). No route, schema or DTO change. `bunx tsc --noEmit` clean.

### Item 2 — the SIT shape reproduced locally

| case | what was set | process | what the operator sees |
|---|---|---|---|
| (a) | `ADMIN_EMAILS='"a@b.com,c@d.com"'` (quoted) | **starts** | nothing — but the list is silently wrong, see Q-1 |
| (b) | name typo `ADMIN_EMAIL_S=a@b.com` (so `ADMIN_EMAILS` never set) | **exits 1** | the `FATAL STARTUP` admin line below |
| (c) | both `ADMIN_EMAILS` and `ADMIN_EMAIL` absent | **exits 1** | same line |
| (d) | `ADMIN_EMAILS=""` | **exits 1** | same line |
| (e) | `AI_GATEWAY_URL=https://example.com` (answers, but not `/models`) | **starts** | `WARN: AI gateway GET /models unreachable (HTTP 404) — skipping provider/model check…`; `/health` → `{"status":"ok","db":"ok"}` (SPEC-003's amended rule: unreachable ⇒ warn + use the file as-is) |
| (e2) | reachable gateway, **bad model** in `ai-steps.json` (config genuinely unusable) | **starts** | `WARN STARTUP: AI config unusable — …` and `/health` → `degraded` (item 3) |
| (f) | `DATABASE_URL` at a dead host | **starts** | `/health` → `{"status":"ok","db":"down"}` — the DB is not checked at startup by design |

```
(b)(c)(d) → FATAL STARTUP: no admin email configured — ADMIN_EMAILS is empty, missing, or its name is mistyped in
            possibility-back/.env. Set ADMIN_EMAILS to a comma-separated list, e.g. ADMIN_EMAILS=a@x.com,b@y.com
            (no quotes, no spaces needed).
```
**Bearing on the incident:** (b), (c) and (d) each produce exit 1 → crash loop → the uniform 502 Tanya saw, and all three are ordinary outcomes of the `ADMIN_EMAIL` → `ADMIN_EMAILS` swap. (a) is the nastier sibling: it *starts*, so the site looks fine, and only admin is broken. Nothing here points at Sober's design — it points at the absence of the line the process printed on the way down, which is what this task adds.

### Item 1 — the three exit paths
```
$ SESSION_SECRET= (missing) …            FATAL STARTUP: missing or invalid environment variable(s): SESSION_SECRET — set them in possibility-back/.env (names only; see .env.example)
$ ADMIN_EMAILS="" ADMIN_EMAIL="" …       FATAL STARTUP: no admin email configured — … (line above)
$ (AI config)                             no longer an exit — now a WARN, see item 3
```
So there are now **two** fatal paths, not three, and both start with `FATAL STARTUP:`. No stack trace is printed for either.

### Item 3 — `/health` while the AI config is unusable
```
$ AI_STEPS_CONFIG=<copy with model "gpt-9000-nope"> bun run src/index.ts
WARN STARTUP: AI config unusable — ai-steps step "understand": model "gpt-9000-nope" is not offered by provider "openai" (gateway lists: …). The server is starting anyway; idea analysis will fail with AI_FAILED until this is fixed (AI_STEPS_CONFIG / AI_GATEWAY_URL).
Started development server: http://localhost:4043
$ curl …/api/v1/health
{"status":"degraded","db":"ok","aiConfig":"error: ai-steps step \"understand\": model \"gpt-9000-nope\" is not offered by provider \"openai\" (gateway lists: …)"}

$ (good config) curl …/api/v1/health
{"status":"ok","db":"ok"}
```
Sign-in, ideas listing and the admin page keep working in `degraded`; only a new analysis fails, with the existing `AI_FAILED` 502.

### Item 4 — `bun run doctor`
```
$ bun run doctor                          # good env
PASS  env vars present — 5 required names set (PORT resolved)
PASS  admin list (ADMIN_EMAILS) — 1 address(es) configured
PASS  database (select 1) — reachable
PASS  AI config + gateway — 5 steps validated against the gateway
doctor: all checks passed                 exit=0

$ bun run doctor                          # dead DB
PASS  env vars present — 5 required names set (PORT resolved)
PASS  admin list (ADMIN_EMAILS) — 1 address(es) configured
FAIL  database (select 1) — not reachable (ECONNREFUSED connect ECONNREFUSED 127.0.0.1:1) — check DATABASE_URL
doctor: FAILED                            exit=1   (stops at the first FAIL)

$ bun run doctor                          # bad AI config
… PASS ×3 then
FAIL  AI config + gateway — ai-steps step "understand": model "gpt-9000-nope" is not offered by provider "openai" (gateway lists: …)
doctor: FAILED                            exit=1

$ bun run doctor                          # no admin list — env.ts fail-fast fires during import
FATAL STARTUP: no admin email configured — ADMIN_EMAILS is empty, missing, or its name is mistyped … exit=1
```
**No values printed:** names, counts and error codes only. Checked two ways — read the output above, and `grep -n "env\.\(DATABASE_URL\|SESSION_SECRET\|GOOGLE_CLIENT_ID\|AI_GATEWAY_URL\|FRONTEND_ORIGIN\|ADMIN_EMAIL\)" src/doctor.ts` → no match. Two leaks were caught and fixed while building it: the env check originally printed `PORT=<value>`, and the DB failure dumped drizzle's multi-line "Failed query" block; both are now one line with names only. (The gateway's model list does appear in an AI-config failure — that is `ai-steps.json` content, not a secret. Say if you want it trimmed.)

**Local `.env`:** not modified by me. Note it now contains `ADMIN_EMAILS` (the owner added it), so the local default start no longer shows the legacy WARN — the fallback path is still proven in TASK-016 and in case (c) above.

DoD: (a)–(f) run + recorded ✔ · `/health` degraded + ok ✔ · doctor good/bad + no values ✔ · fatal-prefix examples ✔ · tsc clean, no route/schema/DTO change ✔.

## Questions
- **Q-1 @Sober (Jason, 2026-09-23) — case (a), the silent one.** `ADMIN_EMAILS='"a@b.com,c@d.com"'` **starts normally** and parses to `["\"a@b.com", "c@d.com\""]`, so `isAdmin('a@b.com')` is `false` and **nobody is admin** — no error anywhere, and `doctor` says `2 address(es) configured` because the count looks right. Shell-style quoting in a `.env` is exactly the kind of thing that happens during a rushed deploy. Proposed one-line hardening in `parseAdminEmails`: strip a matching leading/trailing `"` or `'` from the whole value before splitting. I have **not** applied it — it changes TASK-016 behaviour you reviewed, so it is your call. Say the word and it is two minutes plus evidence.
- **Q-2 @Sober, FYI not a question:** case (e) — a URL that answers but is not the gateway (HTTP 404 on `/models`) is treated as "unreachable" → WARN → the file config is used as-is → `/health` stays `"ok"`. That follows your SPEC-003 amendment as written; I am flagging it only because "health ok, every analysis fails" is a shape someone could chase. If you prefer, a non-2xx from `/models` could count as "usable but unverified" and set `degraded`.

## Review
**Verdict: DONE** (Sober, 2026-09-23 13:15). Every DoD line evidenced without touching SIT: cases (a)–(f) run and tabulated, both fatal paths now print one `FATAL STARTUP:` line naming the variable *and* the fix, the AI-config exit is gone (`/health` → `degraded`, sign-in and the admin page keep working), and `doctor` prints names/counts only — verified twice, including the two value leaks you caught and fixed while building it. The table is the most useful thing in this task: (b)(c)(d) each reproduce the exact crash-loop-to-502 shape Tanya saw, from an ordinary `.env` swap.
Answers: **Q-1 — yes, apply it**, and it is not a behaviour change I am reversing myself on: TASK-016 defined the *meaning* of the list, not the quoting, and a value that starts cleanly while making nobody admin is worse than an exit. Also make `doctor` flag an entry with no `@` rather than counting it. **Q-2 — you are right, and my SPEC-003 amendment was too coarse**: "cannot connect" (network/timeout) and "answered, but this is not the gateway" (non-2xx or unparseable body) are different faults, and only the first deserves a silent start. SPEC-003 amended — see TASK-018 for both.
