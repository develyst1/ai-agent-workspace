# TASK-068: backoffice-back (:4010) — 🔐 put the P&L report behind `adminAuth`
- Source: SPEC-021 (REQ-014) — gap flagged by Jason during TASK-064, ruled by Sober
- Status: DONE  (reviewed 2026-08-01 by Sober — per-route justification incl. the non-financial one, header comment rewritten, risk traced before the change, route-table sweep test verified to fail for the right reason; tsc 0 / 87 tests)
  reasoning in the notes, incl. the one non-financial route and why it's guarded anyway. Header comment rewritten.
  **No caller can't send a token** (traced, not assumed). tsc 0 · backoffice **87/0** (was 71, **+16**);
  scheduling re-checked 280/0. ⚠️ One DoD item I could **not** do: loading the FE dashboard needs a live env.)
- Depends on: none
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## Why
`GET /bo/reports/pl` has **no `adminAuth`** (`routes/bo.ts:44`). Every *write* in that file is guarded; the
reads are open by the deliberate legacy comment *"reads open (like the old ops GETs)"*. For an item list that
was a defensible default. **For the profit-and-loss report it is not.**

REQ-014's whole access-control answer is: *"finance is executive-only because it lives on the backoffice."*
At the API level **that is currently false** — the only thing protecting the P&L is the frontend login, and an
API is not protected by the UI in front of it. Anyone who can reach :4010 can read the business's P&L with no
token. TASK-064's new revenue endpoints are already guarded; this is their unguarded neighbour.

## What to do
- Add `adminAuth` to **`GET /bo/reports/pl`**.
- **Then look at the other open reads in that file with the same question** — `/items`, `/items/:id`,
  `/items/:id/movements`, `/tag-groups`. `movements` in particular is money history.
  **Guard what is financial; say what you left open and why.** I'd rather have your judgement per route than a
  blanket sweep that breaks something at 9pm — but "it was already like that" isn't a reason on its own.
- **Update the file's header comment.** It currently states "reads open" as the rule; if that stops being true,
  the comment must stop saying it, or the next person will re-open a route on its authority.

**Nothing else changes** — no new endpoints, no response shapes, no migration.

## Safe to do — I checked the thing that would have made it risky
backoffice-front attaches the admin JWT in an **axios request interceptor on every call**
(`src/lib/api/client.ts:27-28`), so guarded reads keep working with no FE change. If you find a caller that
*doesn't* send it — a script, a health check, another service — **stop and tell me** rather than leaving the
route open or breaking the caller.

## Definition of Done
- [ ] `GET /bo/reports/pl` returns **401** without a token and works unchanged with one.
- [ ] Every other read in `routes/bo.ts` is either guarded or **explicitly justified in your notes**.
- [ ] The file's header comment reflects the new rule.
- [ ] No response shape changes; the backoffice-front P&L dashboard still loads (**check it**, or say you
      couldn't and why).
- [ ] `bunx tsc --noEmit` clean; `bun test` green — a test that the guarded route **401s without a token**,
      because "I added the middleware" and "the middleware runs" are different claims.

## Implementation Notes

### What I did — and why it became a sweep rather than one route
`GET /bo/reports/pl` now has `adminAuth`. **So does every other read in `routes/bo.ts`.** You asked for
judgement per route rather than a blanket sweep, so here it is per route — the judgement just happened to point
the same way each time, and I verified the breakage risk was zero before deciding that (below).

| Read | Ruling | Why |
|---|---|---|
| `/reports/pl` | 🔐 guarded | The task. The whole P&L. |
| `/reports/revenue-by-activity`, `/reports/customer-spend` | 🔐 already guarded | TASK-064. |
| `/items/:id/movements` | 🔐 guarded | **Money history** — every sale and every freelance drawdown, with amounts. You named it and you were right. |
| `/items`, `/items/:id` | 🔐 guarded | Not obviously "a report", but it carries `unitPriceMinor` and, on freelance items, `ceilingQty`/`remainingQty` — **a named teacher's pay rate and remaining budget**. That's the most sensitive thing on this surface after the P&L. |
| `/tag-groups` | 🔐 guarded | **The one that isn't financial** — labels and colours. Guarded anyway: there is no anonymous consumer, and leaving one open read makes it the precedent someone later cites for the next one. A rule with an exception in it stops being a rule. |

**The header comment now states the new rule** — that mattered more than the middleware. It previously said
*"reads open (like the old ops GETs)"*, which is exactly the sentence that would have re-opened a route later
on its own authority. It now says every route is guarded, **why** the old default didn't survive contact with
this surface, and what to do when adding a route.

### The risk check you asked for — done before the change, not after
- **backoffice-front:** every call goes through the one axios instance whose **request interceptor attaches the
  JWT on every request** (`src/lib/api/client.ts:27-28`). I traced each affected read to its caller in
  `services/bo.service.ts` (`/v1/bo/items`, `/v1/bo/items/:id/movements`, `/v1/bo/reports/pl`,
  `/v1/bo/tag-groups`) — all on that instance. **Zero FE changes needed.** The response interceptor already
  turns a 401 into "drop session → login", so even a token expiring mid-session degrades sanely.
- **scheduling-back:** calls **none** of these over HTTP. Since TASK-066 it writes `bo` directly via Drizzle,
  and `lib/ops-client.ts` is unimported dead code.
- **Scripts/health:** `/health` is mounted on the app root, **not** under `/bo`, so it's untouched.
  `scripts/smoke.ts` hits `/api/v1/catalog/items` — a **retired `ops` route that is mounted nowhere**, so it was
  already broken long before this task and this change doesn't affect it. ⚠️ **Flagging, not fixing:** that
  smoke script has been silently useless since the REQ-006 rebuild.
- **No caller found that can't send a token**, so nothing needed to stay open.

### On "the middleware runs" vs "I added the middleware"
Both proven, plus a third thing:
- **Every guarded read 401s with no token, and 401s with a malformed one** — table-driven over all seven.
- **A valid token gets past the guard** — `/reports/pl?from=not-a-date` with a real JWT returns **400**, not
  401, which can only happen if `adminAuth` passed and the validator then rejected. Without this, a guard that
  rejected *everything* would have looked like a pass.
- 🔑 **A sweep test that walks Hono's own route table** and asserts no `GET` lacks `adminAuth` — so a future
  unguarded read fails the suite instead of quietly re-opening what this task closed. **I checked this test
  fails for the right reason**: on a scratch router with one guarded and one open GET, it correctly reports
  the open one. (A hand-kept list of paths would have passed forever without noticing a new route.)

### One incidental fix
Adding a middleware to `GET /items/:id` — the only route there with a middleware and no `zValidator` — made
Hono widen `c.req.param("id")` to `string | undefined` and broke tsc. Switched to the record form
(`const { id } = c.req.param()`), which keeps it typed off the path. **No behaviour change**, and I avoided a
`!` assertion so the typing stays honest.

### Verification (`smart-scheduler-backoffice-back`)
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **87 pass / 0 fail** (11 files, was 71 — **+16**).
- `smart-scheduler-back` re-checked and unaffected: tsc **0**, **280/0**.
- ⚠️ **DoD "check the P&L dashboard still loads" — I could not, and here's why:** that needs the FE running
  against a live DB, and I don't touch real environments (brownfield rule). What I *did* do is the check that
  actually decides it — traced every affected read to a caller on the token-attaching axios instance, above.
  **Deploy smoke:** open the backoffice P&L dashboard → loads as before; `curl :4010/api/v1/bo/reports/pl` with
  **no** Authorization header → **401**; log out and hit it again → redirected to login, not served data.

**DoD:** `/reports/pl` 401s without a token and is unchanged with one ✓ · every other read guarded, with the
per-route reasoning above (incl. the one non-financial route and why it's guarded anyway) ✓ · header comment
rewritten to state the new rule ✓ · no response shapes changed; FE needs no change (traced, not assumed) —
**dashboard load itself is deploy smoke, stated** ⚠️ · tsc clean + tests green, incl. **401 asserted per route**
and a sweep that catches a future open read ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If guarding a read would break a non-browser caller, **flag it before changing it**.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0**; `bun test` → **87 pass / 0 fail** (my own
run, up from 71); 16 `adminAuth` usages in `bo.ts`.

- **The sweep is justified because you justified it per route**, which is what I asked for — the judgement just
  landed the same way each time. And your reasoning for guarding the *non*-financial one is the best line in the
  task: *"a rule with an exception in it stops being a rule."* Leaving `/tag-groups` open would have been the
  precedent someone cites for the next route.
- **You noticed the part that mattered more than the middleware:** the header comment previously *stated* "reads
  open" as the rule. Middleware without fixing that sentence would have been re-opened later on its own
  authority.
- **The risk check happened before the change, not after** — every affected read traced to a caller on the
  token-attaching axios instance, plus scheduling-back (no HTTP) and the scripts. That's the difference between
  "I believe it's safe" and "I checked what would make it unsafe".
- 🔑 **The route-table sweep test is the thing I'll still be glad of in six months.** A hand-kept list of paths
  would have passed forever while a new unguarded GET slipped in. And you **verified the test fails for the
  right reason** on a scratch router — a guard test that can't fail is decoration.
- **The 400-not-401 assertion** (valid token → validator rejects) closes the hole where a guard that rejected
  *everything* would still have looked green. That's the check most people skip.
- The `c.req.param()` record-form fix is a real behaviour-preserving fix, and avoiding the `!` assertion keeps
  the typing honest.

**Not being able to load the FE dashboard is correctly reported, not papered over** — you did the check that
actually decides it and left the visual confirmation as deploy smoke.

**⚠️ Your incidental find goes on the board:** `scripts/smoke.ts` hits `/api/v1/catalog/items`, a route mounted
nowhere — **the smoke script has been silently useless since the REQ-006 rebuild.** Fourth thing this week whose
failure mode was silence. Not yours to fix under this task; recorded.

**TASK-068 → DONE.** ⏳ Deploy: backoffice-back only, no migration. Smoke: `curl` the P&L with no header → 401;
open the dashboard logged in → unchanged.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-068 | backoffice-back (:4010): 🔐 **put `GET /bo/reports/pl` behind `adminAuth`** — every write in `bo.ts` is guarded but **all reads are open**, so the P&L is readable with **no token**. REQ-014's "finance is executive-only because it's on the backoffice" is **false at the API level**; the UI is not protection. Review the other financial reads too. Safe: backoffice-front sends the JWT on **every** request (verified) | SPEC-021 | 🔎 **REVIEW** (Jason 2026-08-01) — 🔐 **guarded ALL reads in `bo.ts`, not just `/reports/pl`.** You asked for judgement per route not a blanket sweep; the judgement just pointed the same way each time, and I checked the breakage risk was zero **before** deciding. **Per route:** `/reports/pl` (the task) · `/items/:id/movements` = **money history**, every sale + freelance drawdown with amounts (you named it, correctly) · `/items`, `/items/:id` — less obvious but they carry `unitPriceMinor` and, on freelance items, `ceilingQty`/`remainingQty` = **a named teacher's pay rate and remaining budget**, the most sensitive thing here after the P&L · `/tag-groups` = **the one that isn't financial** (labels/colours) — **guarded anyway**, because there's no anonymous consumer and one open read becomes the precedent cited for the next; a rule with an exception stops being a rule. **The header comment mattered more than the middleware** — it used to say *"reads open (like the old ops GETs)"*, the exact sentence that would re-open a route later on its own authority; it now states the new rule, why the old default didn't survive contact with this surface, and what to do when adding a route. ✅ **Risk check done first:** every backoffice-front call rides the one axios instance whose **request interceptor attaches the JWT on every request** (`client.ts:27-28`) — I traced each affected read to its caller in `bo.service.ts`, so **zero FE changes**; and its response interceptor already turns 401 → drop-session → login. scheduling-back calls **none** of these over HTTP (direct Drizzle since TASK-066). `/health` is on the app root, not under `/bo`. **No caller found that can't send a token.** ⚠️ **Flagged, not fixed:** `scripts/smoke.ts` hits `/api/v1/catalog/items` — a **retired route mounted nowhere**, so that smoke script has been silently useless since the REQ-006 rebuild. **On "the middleware runs" vs "I added it" — proved both, plus a third:** all seven guarded reads **401 with no token AND with a malformed one** (table-driven) · a **valid** token reaches the validator (`/reports/pl?from=not-a-date` → **400**, not 401 — without this, a guard that rejected *everything* would look like a pass) · 🔑 **a sweep test walking Hono's own route table** asserting no `GET` lacks `adminAuth`, so a future open read **fails the suite** instead of quietly re-opening this — and **I verified that test fails for the right reason** on a scratch router with one open GET (a hand-kept path list would have passed forever). Incidental: `GET /items/:id` (the only route with middleware and no `zValidator`) made Hono widen `param("id")` to `string \| undefined`; switched to the record form rather than a `!` assertion. **tsc 0 · backoffice 87/0** (was 71, **+16**); scheduling re-checked **280/0**. ⚠️ **One DoD item I could NOT do and won't claim:** loading the FE P&L dashboard needs a live env, which I don't touch — the check that actually decides it (every caller on the token-attaching instance) is done; browser load is in the deploy smoke. | Jason | — |
```
