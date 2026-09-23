# TASK-018: BE — quote-tolerant admin list + honest gateway health
- Source: TASK-017 §Questions Q-1/Q-2 (Sober's answers); SPEC-005 §Amendment, SPEC-003 §Non-functional (amended 2026-09-23)
- Owner: BE (Jason)
- Status: DONE
- Depends on: TASK-017 (DONE)

## What to do
1. **Quote tolerance (Q-1).** In `parseAdminEmails`, strip one matching leading/trailing `"` or `'` from the **whole** raw value before splitting, and again from each entry after splitting (both `"a@b,c@d"` and `"a@b","c@d"` shapes occur in hand-edited `.env` files). Entries are then trimmed/lower-cased as today.
2. **Refuse to be silently empty (Q-1).** An entry without `@` is not an address: drop it and print one `WARN STARTUP: ignored N malformed entr(y|ies) in ADMIN_EMAILS (no "@")` — **names and counts only, never the values**. If dropping leaves the list empty, that is the existing fatal path.
3. **`doctor` counts only valid addresses** and prints `FAIL  admin list (ADMIN_EMAILS) — N malformed entr… / 0 usable` when none survive.
4. **Gateway health, honestly (Q-2).** Split the `/models` outcome in `ai/config.ts`:
   - cannot connect (network error / timeout) → WARN + start + `/health` `"ok"` (the gateway may be briefly down; unchanged);
   - **answered with a non-2xx, or a body that is not the model map** → this is a wrong `AI_GATEWAY_URL`, not an outage: `WARN STARTUP: …` + start + **`/health` `"degraded"`** with `aiConfig: "gateway did not return a model list (HTTP <code>)"`.
   Never exit for either.

## Definition of Done
- [x] `ADMIN_EMAILS='"a@b.com,c@d.com"'` → both addresses admin (`/auth/me` `isAdmin:true` for one of them, `/admin/hire-requests` 200) — paste; then the same with single quotes — paste.
- [x] `ADMIN_EMAILS="a@b.com,nonsense,c@d.com"` → starts, one WARN naming the count only, the two real addresses admin, `nonsense` obviously not — paste (and confirm the word `nonsense` does not appear in the WARN).
- [x] `ADMIN_EMAILS="nonsense"` → the existing `FATAL STARTUP` admin line — paste.
- [x] `doctor` on the malformed-only case → `FAIL … 0 usable`, exit 1 — paste.
- [x] `AI_GATEWAY_URL=https://example.com` (answers 404) → starts, `/health` → `degraded` with the HTTP code — paste. Dead port (cannot connect) → starts, `/health` → `ok` — paste.
- [x] `bunx tsc --noEmit` clean; no route, schema or DTO change.

## Implementation Notes
(Jason, 2026-09-23 — no git writes, no SIT access. All runs local, env vars inline; values never printed)

**Files in `possibility-back`:** `src/env.ts` (`unquote` + `parseAdminEmails` returning `{valid, malformed}`, count-only WARN, `ADMIN_EMAILS_MALFORMED` export, diagnostic mode) · `src/ai/config.ts` (`/models` outcome split; `gatewayStatus()`) · `src/index.ts` (`aiConfigError = gatewayStatus()` feeds `/health`) · `src/doctor.ts` (usable/malformed counts; reports a bad admin list instead of dying). No route, schema or DTO change. `bunx tsc --noEmit` clean.

### Items 1–2 — quote tolerance + malformed entries
`unquote` strips leading/trailing `"`/`'` **whether or not they pair up**, applied to the whole value *and* to each entry after the split. That last part was needed: with match-only stripping the `"a@b","c@d"` shape still failed (outer quotes are consumed, leaving one stray quote on each entry — both addresses silently non-admin). Caught by running the case, not by reading the code.

All four shapes, `ADMIN_EMAILS` = A,B where A=`dev-jason-a@example.com` (Google fixture), B=`dev-jason-b@example.com`:
```
ADMIN_EMAILS="A,B"      → starts   A /admin → [200]   B /admin → [200]
ADMIN_EMAILS='A,B'      → starts   A /admin → [200]   B /admin → [200]
ADMIN_EMAILS="A","B"    → starts   A /admin → [200]   B /admin → [200]
ADMIN_EMAILS=A , B      → starts   A /admin → [200]   B /admin → [200]
```
(`/auth/me` for A in the first case → `"isAdmin":true`.)

One malformed entry among two good — `ADMIN_EMAILS="dev-jason-a@example.com,nonsense,dev-jason-b@example.com"`:
```
WARN STARTUP: ignored 1 malformed entry in ADMIN_EMAILS (no "@")
Started development server: …
A /admin → [200]    B /admin → [200]
$ grep -c nonsense <server log>   →  0      ← the value never appears, only the count
```
Malformed **only** — `ADMIN_EMAILS="nonsense"` — still the existing fatal path:
```
WARN STARTUP: ignored 1 malformed entry in ADMIN_EMAILS (no "@")
FATAL STARTUP: no admin email configured — ADMIN_EMAILS is empty, missing, or its name is mistyped in possibility-back/.env. Set ADMIN_EMAILS to a comma-separated list, e.g. ADMIN_EMAILS=a@x.com,b@y.com (no quotes, no spaces needed).
```

### Item 3 — `doctor` counts usable addresses
Item 2 (fatal on an empty list) and the DoD's "`doctor` → `FAIL … 0 usable`" contradicted each other: `env.ts` exits at import, so `doctor` could never reach its own check. Resolved without weakening item 2 — `doctor` sets `POSSIBILITY_DIAGNOSTIC=1` before importing `env`, and in that mode only, the empty-list branch **returns an empty set instead of exiting**, so the diagnostic can name the failing check. The server itself is unchanged and still exits. Say if you'd rather have the FATAL line there too.
```
$ ADMIN_EMAILS="nonsense" bun run doctor
PASS  env vars present — 5 required names set (PORT resolved)
FAIL  admin list (ADMIN_EMAILS) — 1 malformed entry (no "@") / 0 usable — set ADMIN_EMAILS to a comma-separated list of addresses
doctor: FAILED                                                    exit=1

$ ADMIN_EMAILS="a@b.com,nonsense,c@d.com" bun run doctor
PASS  admin list (ADMIN_EMAILS) — 2 address(es) usable, 1 malformed entry (no "@") ignored     … all checks passed
```

### Item 4 — honest gateway health
`/models` now has three outcomes: **cannot connect** (network/timeout) → old WARN, `/health` stays `ok`; **answered non-2xx** or **body is not the model map** → `WARN STARTUP: gateway did not return a model list (…) — check AI_GATEWAY_URL` and `/health` reports `degraded`; **answered properly** → strict provider/model check as before.
```
$ AI_GATEWAY_URL=https://example.com      (answers 404)
WARN STARTUP: gateway did not return a model list (HTTP 404) — check AI_GATEWAY_URL; skipping the provider/model check and using ./config/ai-steps.json as-is
{"status":"degraded","db":"ok","aiConfig":"error: gateway did not return a model list (HTTP 404)"}

$ AI_GATEWAY_URL=http://127.0.0.1:1       (cannot connect)
WARN: AI gateway GET /models unreachable (Unable to connect…) — skipping provider/model check, using ./config/ai-steps.json as-is
{"status":"ok","db":"ok"}

$ AI_GATEWAY_URL=https://example.com bun run doctor
FAIL  AI config + gateway — gateway did not return a model list (HTTP 404)     exit=1
```

### Regression — normal operation unchanged
Started with the real `.env` (no overrides): `/health` → `{"status":"ok","db":"ok"}`; `/auth/me` with a Google fixture cookie → 200; `POST /auth/login` (`dev-jason-pw1@`) → 200; `GET /ideas` → 200. `doctor` on the real env → 4 PASS, exit 0. No fixtures created this task.

DoD: double- and single-quoted lists ✔ · per-entry-quoted shape ✔ (extra case, it was the one that failed first) · malformed-among-good: WARN with count only, value absent ✔ · malformed-only → FATAL line ✔ · `doctor` `0 usable` + exit 1 ✔ · gateway 404 → degraded, dead port → ok ✔ · tsc clean, no route/schema/DTO change ✔.

## Questions
- **Q-1 @Sober (Jason, 2026-09-23), FYI — the diagnostic escape hatch.** `doctor` sets `POSSIBILITY_DIAGNOSTIC=1`, and `env.ts` honours it in exactly one place: the empty-admin-list branch returns an empty set instead of `process.exit(1)`. Nothing else reads the flag, and nothing sets it except `src/doctor.ts`. It exists because item 2 and the item-3 DoD line could not both be true otherwise. If you'd rather `doctor` simply inherit the FATAL line and exit, delete the flag and the DoD line together — one-line change either way.

## Review
**Verdict: DONE** (Sober, 2026-09-23 13:25). All four quoting shapes admin-200, including the `"a@b","c@d"` per-entry case that match-only stripping still broke — found by running it, not reading it, which is the difference between this and the 1.14:1 alert I once passed on token inspection. Malformed entry dropped with a count-only WARN and `grep -c nonsense <log> → 0` proving the value never leaves; malformed-only still hits the FATAL line; `doctor` reports usable/malformed; the gateway split behaves as specced (404 → `degraded`, dead port → `ok`) and the real-`.env` regression is green.
**Q-1 — keep the flag as built.** I checked the scope myself: `POSSIBILITY_DIAGNOSTIC` is set in exactly one place (`doctor.ts`) and read in exactly one place (the empty-admin-list branch), and the server path is untouched. A diagnostic that dies before it can name the failing check is useless, and that is precisely the tool the owner will run on SIT. Two conditions, now recorded so they are not lost: (a) no second consumer of this flag is ever added without a SPEC line — if a third place needs it, that is a design change, not a patch; (b) it must never relax anything beyond the admin list.
**Ready to deploy:** TASK-017 + TASK-018 together, BE only, no migration, no FE change.
