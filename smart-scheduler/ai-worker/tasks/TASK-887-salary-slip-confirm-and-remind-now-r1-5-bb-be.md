# TASK-887 — BE: REQ-120 R1.5 **the coach confirms their own slip + the CEO "remind now" list** (backoffice-back) — @Bob — now (after the TASK-885 ECA fix)
**From @Silver, 2026-11-08.** Contract: **SPEC-102 §5-E4 (E4a + E4b)**, Sober's addendum. **That section is the contract; this TASK only adds how to build it in this repo.** Repo `smart-scheduler-backoffice-back`, branch `dong`. **No git command: git only on the owner's word.** **No migration.** **Size ≈ 1 d.**

## What to build (read SPEC-102 §5-E4 first, whole)
1. **E4a `POST /salary/my-slip/confirm` `{ year, month }`,** behind `requireAuth`. The slip is resolved from **`token.teacherId` only**.
   - **Resolve the slip the same way `GET /salary/my-slip` does:** reuse TASK-880's own resolution function. If it isn't exported, stop and tell me; don't copy it.
   - **Read the period through `service.getPeriod`** first, so Jason's lazy 12:00 lock applies. A locked period or slip → 409 `LOCKED`.
   - **The status change is ONE conditional statement:** `UPDATE bo.pay_slip SET status = 'confirmed' WHERE id = $1 AND status = 'draft'`. Then re-read.
     - 0 rows, now `confirmed` → 200 (idempotent).
     - 0 rows, now `locked` → 409 `LOCKED`.
     - This is what makes a 12:00 lock racing a confirm safe.
   - **Team A's `SalaryStore` has no status setter.** Put the update in **your own small store**, `src/services/slip-confirm.store.ts`, with a db version and an in-memory version for tests. It's typed against Team A's `bo.pay_slip` schema, read-only import. Same pattern as Brew's `BonusLineStore`. **Don't edit `salary.service.ts`, `salary-db.store.ts` or `salary-memory.store.ts`.**
   - Errors and response exactly as §5-E4a: 403 `NO_TEACHER` · 404 `NO_SLIP` · 409 `LOCKED` · 200 = the my-slip DTO with `status: "confirmed"`.
2. **E4b `POST /salary/periods/:id/remind`,** `requireRole("ceo")`.
   - Returns `[{ teacherId, name, status }]` for every **active** profile whose slip is `draft` or missing. `confirmed` / `locked` are out, and `is_system` is out.
   - Names come through the existing read-only `public.teachers` lookup the back office already uses (say which one). **No pay field anywhere** (whitelist DTO).
   - **`reminded_at`: don't add it** (it would need a column, and this TASK has no migration). Say so in the report.
3. **Routes:** one line each in Jason's `src/routes/salary.ts`, tagged `🔻 TASK-887`.
   - **Order matters:** `/my-slip/confirm` must not be swallowed by any `/my-slip` or `/:id` pattern. Prove it with a route test.
4. **The open item (note it, don't solve it):** an admin Entries write after a coach's confirm. Today it simply adds a line to a `confirmed` slip, if Jason's entry route allows that.
   - **Write in the report exactly what happens today** (allowed or refused, with the line).
   - That's the fact the later rule needs; I'll raise it with Porter.

## Tests (DB-less + one rolled-back sid proof; each must fail when its code is removed)
- **Confirm:**
  - a coach confirms their own (`draft → confirmed`);
  - coach B can't confirm A's (resolution is by token; no id in the body is honoured, even if one is sent);
  - no `teacherId` → 403;
  - locked → 409, including the **lazy** lock at 12:00 on the last day;
  - no slip → 404;
  - a re-confirm → 200;
  - the conditional update never moves a `locked` slip.
- **Remind:**
  - CEO 200 with the list;
  - the response has no pay key (assert the key set);
  - admin / coach 403, no token 401;
  - confirmed / locked absent;
  - "No Teacher" absent;
  - a profile with no slip yet is listed.
- **A mutation set** over the token resolution, the conditional update, the lock check and the list filter.
- **Sid proof, rolled back** (host check .206 first): one draft slip confirmed, re-confirmed, then locked → 409, with residue 0.

## Files (claim, Team B)
- `src/services/slip-confirm.store.ts`, `src/services/slip-confirm.service.ts` + tests;
- one line each in `src/routes/salary.ts`.
- Pure mirror test edits are pre-approved (tagged `🔻 TASK-887`, listed), e.g. Jason's route count and the "every /salary route is guarded" test.

## Done =
- `bunx --package typescript@5.9.3 tsc --noEmit` 0;
- BB suite green (before / after);
- the mutation set all bites;
- the sid proof.
- **`/security-review` run, with its result in the report** (mandatory: auth + data exposure).
- Report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.

## Next (not this TASK)
- **The LINE push** (09:00 + 11:00 on the last day + the remind-now send) is in scope, as a separate TASK Sober cuts after E4. My proposal for its owner is in the PM inbox.
- **The coach's "Confirm this slip" button** (TASK-882 Q4) gets wired once this route is accepted. I'll add it to Fern's / Fanta's TASK then.

## The remind ↔ send contract with TASK-888 (Jason, smart-scheduler-back): PROPOSED by Silver 2026-11-08, ⏳ waiting on Sober's yes
**Why HTTP:** the send lives in `smart-scheduler-back` (LINE client + job runner), and the unconfirmed list lives here (`bo.salary_profile` + `bo.pay_slip` semantics). One repo can't import the other. So: **one list (here), one sender (there)**, joined by the two service auths that already exist.

1. **The list, defined once, here (Bob):** `listUnconfirmed(periodId) → [{ teacherId, status: "draft" | "none" }]`, exactly E4b's rule (active profile, slip `draft` or missing, `is_system` out). It's used by:
   - **E4b** `POST /salary/periods/:id/remind` (CEO), which adds `name`;
   - **a new internal read** `GET /internal/salary/unconfirmed?date=YYYY-MM-DD`, behind BB's existing **`SERVICE_TOKEN`** middleware (`middleware/auth.ts:94`). It returns the list for the period that **contains that date** (R1.4) as `{ periodId, lockAt, teacherIds }`, or `{ periodId: null }`. This is what TASK-888's 09:00 / 11:00 job reads, so the job never re-derives the rule.
2. **The send, defined once, there (Jason, TASK-888):** `POST /internal/salary-remind` behind SB's existing **`x-internal-secret` / `INTERNAL_JOB_SECRET`** gate (`routes/internal.ts:32–41`).
   - Body `{ teacherIds: string[], reason: "0900" | "1100" | "now" }` → `{ sent: string[], skipped: [{ teacherId, reason: "NO_LINE_ID" | "OA_NOT_ALLOWED" | "NO_TOKEN" }] }`.
   - It's fail-closed per TASK-888: an unset secret → its existing NOT_CONFIGURED; no token or an OA not in `LINE_OA_WRITE_ALLOW` → everything `skipped`, no call.
3. **E4b calls the send** after building the list, only when BB has both `SCHEDULER_API_URL` and `SCHEDULER_INTERNAL_SECRET`. Those are 2 new keys in BB's `.env.example`, each with its one-line purpose; empty by default.
   - Unset → the route still returns the list, with `send: "NOT_CONFIGURED"`. Set → `send: { sent, skipped }`.
   - A send failure (timeout / 5xx) → `send: "FAILED"`, the list is still returned, never a 500.
   - **The response still carries no pay.**
4. **The 09:00 / 11:00 job (TASK-888, in SB):** on the last day of the month (Bangkok), it calls (1)'s internal read with the date and then (2)'s module directly, in-process.

**Bob's order meanwhile:**
- build **E4a** + **`listUnconfirmed`** + E4b's list response **now**;
- add the internal read (1) and the send call (3) **only after Sober agrees.** If Sober changes the shape, his version wins and I'll update this section.

### ✅ The contract is APPROVED by Sober (2026-11-08), with 2 clarifications. Bob, build the cross-repo pieces now.
1. **LINE goes to `draft` slips only.**
   - E4b's CEO list still shows the `none` coaches (no slip yet), but the `teacherIds` E4b sends to SB = **draft only**.
   - The internal read `GET /internal/salary/unconfirmed` returns **draft only** in `teacherIds` (it exists for the sender).
   - Tests pin both: a `none` coach is in the CEO list and absent from what's sent / returned.
2. **No pay in the LINE message, and the send is idempotent per (teacherId, period, reason).** Both are on **Jason's side (TASK-888)**. On this side: E4b may be pressed twice; SB decides what that does, and E4b just relays SB's `{ sent, skipped }`. Pass the period id along, so the body is `{ periodId, teacherIds, reason }`.
- **`.env.example`:** add `SCHEDULER_API_URL` + `SCHEDULER_INTERNAL_SECRET`, both empty by default, each with one line saying what it's for. Add `.env.example` to your claim.
- **Tests for the call:** against a fake HTTP server:
  - unset env → `send: "NOT_CONFIGURED"` and **no request made**;
  - set → the request carries the secret header and the draft-only ids;
  - a 5xx or a timeout → `send: "FAILED"`, 200 with the list;
  - the response never carries pay.

### 🔁 Contract tweak after TASK-888 was ACCEPTED (Sober, 2026-11-08): this replaces the send-call body above
- **E4b's call to SB is now** `POST {SCHEDULER_API_URL}/internal/jobs/pay-confirm-now`, body **`{ periodId }` only**, header `x-internal-secret: {SCHEDULER_INTERNAL_SECRET}`. **No `teacherIds`:** SB fetches the list from your internal read itself, the same way as its 09:00 / 11:00 jobs. Relay SB's result as `send`.
  - The fallbacks are unchanged: env unset → `NOT_CONFIGURED`, no request; 5xx / timeout / 503 → `FAILED`.
- **Your internal read, as SB calls it** (TASK-888 l.67): `GET /api/v1/internal/salary/unconfirmed`, header **`X-Service-Token`** (BB's existing `SERVICE_TOKEN` middleware), → `{ periodId, lockAt, teacherIds }`, **draft only**.
  - **It must accept EITHER `?date=YYYY-MM-DD`** (the scheduled jobs: the period containing that date) **OR `?periodId=<uuid>`** (remind-now). Exactly one of them, else 400.
  - An unknown period → `{ periodId: null }`.
  - Tests for both forms. I'm telling Porter so Jason's `pay-confirm-now` uses `?periodId=`.
- **STAFF in the CEO's display list (TASK-888 Q5):** leave it as the list rule gives it (STAFF has no pay-run slip, so `none`). Don't add a special case.

## ✅ THE FINAL remind ↔ send contract (Silver, 2026-11-08). Written FROM TASK-888's built code; it replaces every earlier version in this TASK
**Ground truth read (smart-scheduler-back, `dong`, uncommitted tree):**
- `src/index.ts:99` mounts `/internal`;
- `src/routes/internal.ts:34, 44–52, 91–95`;
- `src/services/pay-confirm-reminder.service.ts:2, 81–83, 150–175`.

**A. BB exposes (Bob builds): the list**
- `GET /api/v1/internal/salary/unconfirmed?date=YYYY-MM-DD`, behind BB's existing `SERVICE_TOKEN` middleware. SB sends the header **`X-Service-Token`** (SB l.81).
- **Only `?date=`.** My earlier `?periodId=` form is **withdrawn**, because SB never calls it: on the now path SB asks with **today's** date and checks the period itself (l.163–167).
- Missing or malformed `date` → 400.
- Response 200:
  - `{ periodId, lockAt, teacherIds }`, the period resolved from `date` by the **amended rule (co-signed 2026-11-08):** (1) if a period's `lockAt` as a Bangkok date **equals** `date` → that period (the confirm day belongs to the period being confirmed; e.g. 31/10 → October); (2) otherwise → the period whose R1.4 range contains `date` (e.g. 30/10 → October, 1/11 → November); (3) none → `{ periodId: null }`. `teacherIds` = **draft slips only**, active profiles, `is_system` out;
  - or `{ periodId: null }` when neither rule matches.
  - `lockAt` is an ISO instant.
- SB times out after 5 s (l.82); a non-2xx → SB reports `backoffice-unavailable`.

**B. BB calls (Bob builds): remind-now, from E4b `POST /salary/periods/:id/remind` (CEO)**
- `POST {SCHEDULER_API_URL}/internal/salary-remind-now`, body **`{ periodId }`** (uuid; SB l.34), header **`x-internal-secret: {SCHEDULER_INTERNAL_SECRET}`** (SB l.51).
- **SB answers 200 with `NowResult`** (l.150–152):
  - `{ ran: false, reason: "no-channel-token" | "no-period" | "period-mismatch" | "after-lock-time" | "backoffice-unavailable" }`; or
  - `{ ran: true, periodId, targets, sent: string[], skipped: [{ teacherId, reason }] }`, where `reason` ∈ `NO_TOKEN · OA_NOT_ALLOWED · NO_LINE_ID · ALREADY_SENT`.
- **SB errors:** 503 `NOT_CONFIGURED` (SB's secret unset), 401 `UNAUTHORIZED` (wrong secret), 400 (bad body).
- **E4b's response** = the CEO list (names + `draft`/`none`, no pay) **plus `send`**:
  - BB's env keys unset → `"NOT_CONFIGURED"`, and **no request**;
  - a 200 → **SB's `NowResult` relayed as is**;
  - any non-200 / timeout (5 s) / network error → `"FAILED"`.
  - Always a 200 to the CEO, never a 500.
- **Note for the screen:** `period-mismatch` / `after-lock-time` mean "this period can't be reminded today". The CEO pressing remind on a past or future period is told so. That's SB's rule (it only reminds the period containing today, before its lock), and it stands.

**C. Not BB's:**
- SB's scheduled `POST /internal/jobs/pay-confirm-0900` / `-1100` and its sender `POST /internal/salary-remind` (`{ teacherIds, reason, periodId? }`) are SB-internal.
- **BB never calls `/internal/salary-remind` directly.**

**D. BB `.env.example`:** `SCHEDULER_API_URL` (SB's base URL, e.g. `http://localhost:4006`; empty = remind-now doesn't call SB) and `SCHEDULER_INTERNAL_SECRET` (must equal SB's `INTERNAL_JOB_SECRET`; empty = no call). Both empty by default.

**Bob's tests for B:** against a fake HTTP server:
- unset → no request;
- the body is exactly `{ periodId }` + the secret header;
- a 200 `NowResult` is relayed unchanged (both shapes);
- 503 / 401 / 500 / a timeout → `"FAILED"`;
- no pay key anywhere.

**For A:** a date inside a period, on its first and last day, and outside every period; draft only (a `none` coach is absent; a `confirmed` / `locked` one is absent); `is_system` absent; SERVICE_TOKEN missing or wrong → 401.

**Signatures:**
- Silver (SA-B): ✅ 2026-11-08.
- **Sober (SA-A): ✅ 2026-11-08.** Verified clause by clause against TASK-888's built code (`routes/internal.ts`, `pay-confirm-reminder.service.ts`): A/B/C/D all match the as-built, including both my clarifications (`teacherIds` = draft-only on the send; no pay in E4b's response or the message) and the NowResult skip reasons. The two must-match points — BB's `/unconfirmed` path+query+shape, and `/internal/salary-remind-now`'s path+body — are correct. **Bob: code A + B to this.**

## Rulings on Bob's 2 asks — @Silver, 2026-11-08
1. **GO: one mount line in `src/routes/api.ts`:** `.route("/internal/salary", internalSalaryRoutes)`, tagged `🔻 TASK-887`, added to your claim. Nothing else in `api.ts`.
   - **Prove with a route test** that the path reaches your handler with **only** `X-Service-Token` (no user JWT). If any `/v1`-wide middleware demands a login first, stop and tell me.
   - Show that the "every /salary route is behind requireRole" guard test still passes, or mirror it with a tag if it scans this path.
2. **GO: a strict guard in your own route file.** The header must equal a **non-empty** `SERVICE_TOKEN`; anything else is 401, including an unset token.
   - That's right: the existing `serviceAuth` fails open when the token is unset, and this route returns ids. SB sends the header only when its own `SERVICE_TOKEN` is set (SB `pay-confirm-reminder.service.ts:81`), so an unset pair fails closed on both sides.
   - Compare in constant time (`timingSafeEqual` on equal-length buffers).
   - It goes in the `/security-review`. Don't change the shared `serviceAuth`; its fail-open is noted for Sober as a separate finding.
- **Still waiting:** Sober's signature on the final contract, before you code B (the call to SB). A (the read) can go ahead under these rulings, since it matches the built SB caller.

## BE report (Bob, 2026-11-08) — DONE-pending-review: E4a + E4b + A + B built to the FINAL contract. No migration, nothing committed.
- **E4a `POST /salary/my-slip/confirm { year, month }`** (`requireRole("ceo","admin","coach")`): the slip is resolved from **`token.teacherId` only** (the body schema is `{year, month}`; a smuggled `teacherId` is stripped, and a service-level test proves it is never read). Resolution = TASK-880's own `service.mySlip` (it is a method of the service, not a separate function, so I **call it, not copy it**); it validates year / month, applies Jason's lazy 12:00 lock, and tells "no slip" from "locked". Then ONE conditional statement in my own store (`slip-confirm.store.ts`): `UPDATE bo.pay_slip SET status='confirmed', confirmed_at=… WHERE teacher_id=$ AND status='draft' AND period_id=(select id from bo.pay_period where year=$ and month=$) RETURNING id`. 0 rows ⇒ re-read: `confirmed` ⇒ 200 (idempotent) · `locked` ⇒ 409 `LOCKED` · gone ⇒ 404. Errors: 403 `NO_TEACHER` · 404 `NO_SLIP` · 409 `LOCKED` · 200 = the my-slip DTO with `status:"confirmed"`. Team A's store / service files are not edited (`SalaryStore` has no status setter; mine is a small in-repo store with a db and an in-memory version).
- **E4b `POST /salary/periods/:id/remind`** (`ceo`): response **`{ targets: [{ teacherId, name, status: "draft"|"none" }], send }`** (the contract said "the list plus send": a bare array can't carry `send`, so the list is under `targets`; say if the screen wants another key). Targets = every ACTIVE profile with a teacher row (`listEntriesPeople`, the read TASK-886 already uses over `public.teachers`: nickname else name, `not is_system`) whose slip is `draft` or missing; `confirmed` / `locked` out. Whitelist DTO — the key set is pinned, and the whole response is searched for any pay word. **`reminded_at`: NOT added** (it needs a column; this TASK has no migration). `send`: `"NOT_CONFIGURED"` (either env key empty, **no request made**) · SB's `NowResult` relayed **unchanged** on a 200 (both shapes) · `"FAILED"` on any non-200 / 5 s timeout / network error / non-object body. Always a 200 to the CEO once the period exists (an unknown period is a 404 and nothing is sent).
- **A `GET /api/v1/internal/salary/unconfirmed?date=`** (`routes/salary-internal.ts`, mounted by ONE line in `api.ts`, your GO): `{ periodId, lockAt (ISO), teacherIds }` (draft only, active, never the system teacher, **sorted**) or `{ periodId: null }`; 400 on a missing / malformed / impossible date. **Auth is FAIL-CLOSED and in my own file**: `X-Service-Token` must equal a NON-EMPTY `SERVICE_TOKEN`, constant-time compare; unset / empty env, no header, a wrong token, a prefix either way, and any user Bearer all ⇒ 401. The shared `serviceAuth` is untouched. Proved reachable through the REAL root app with only `X-Service-Token` (and 404 on any other path).
- **B** = `callRemindNow`: `POST {SCHEDULER_API_URL}/internal/salary-remind-now`, body exactly `{ periodId }`, header `x-internal-secret`. Tested against a REAL local HTTP server (Bun.serve): the request line / body / header, both `NowResult` shapes relayed, 503 / 401 / 400 / 500 / non-JSON / JSON-array ⇒ FAILED, timeout + connection refused ⇒ FAILED. `.env.example`: `SCHEDULER_API_URL` + `SCHEDULER_INTERNAL_SECRET`, both empty, one line each.
- **Tests / mutations / suite:** `slip-confirm.service.test.ts` 30 pass; `slip-confirm-task887.mutations.json` 30 mutants, **all bite, 0 survivors** (two candidates are EQUIVALENT and were dropped, noted in the file). BB `bun test` (dummy `DATABASE_URL`) **847 pass · 0 fail** (my 30 included); tsc (5.9.3) 0. Mirror edit (pre-approved, tagged): `salary-routes-task865.test.ts` route count 30 → 32.
- **Sid proof (rolled back, host .206 checked first):** one real transaction on sid, rolled back by a thrown sentinel: a draft slip for an invented teacher id in an invented 2099-12 period → `confirmDraft` moved=true, status confirmed → re-confirm moved=false, status confirmed → the slip set to `locked` → `confirmDraft` moved=false, status stays locked → another teacher's id moved=false. **Residue after rollback: periods 0, slips 0.**
- **THE OPEN ITEM, as it is TODAY (noted, not solved):** an admin Entries write AFTER a coach's confirm is **ALLOWED**. `addEntry` only refuses when the PERIOD is locked (`salary.service.ts`: `if (period.status === "locked") throw locked()`); it never looks at the slip's status, so the line lands on a `confirmed` slip, the slip stays `confirmed`, and the coach is not asked again. Pinned by a test (201, status still confirmed).
- **🔴 A CONTRACT FINDING you must rule on (it makes the reminders miss the confirm day):** A returns "the period whose R1.4 range contains `date`", as signed. But a period's range is **last day of the previous month → the day BEFORE the last day** of its month (`payPeriodRange(2026,10)` = 2026-09-30 … 2026-10-30), while its lock is **12:00 on the LAST day** (`lockAt` 2026-10-31 05:00Z). So on **31 Oct** — the very day the 09:00 / 11:00 reminders and a CEO "remind now" run for the **October** period — the period containing 31 Oct is **November's** (its range starts 31 Oct). Consequence with the contract as written: the scheduled jobs read November's drafts (usually none: November isn't run yet) and the October coaches are never reminded; remind-now for the October period answers `period-mismatch` (SB compares the asked period with the one A returns). I built it exactly to the signed text (tests pin it: 31 Oct ⇒ `periodId:null` for October-only data) and did NOT silently change the rule. **The fix is small and local to A:** pick the period whose `lockAt` falls on that Bangkok date and has not locked yet, else fall back to the range-containing one — one function (`unconfirmedForDate`), +2 tests. Tell me to apply it (needs your word because it changes a signed contract).
- **/security-review:** the `security-review` skill reviews the git diff of the session's working directory (the workspace repo), which does not contain this repo's changes; so I ran its checklist by hand over the TASK-887 files (service, store, internal route, the 2 salary.ts lines, the api.ts mount, .env.example). Findings: (1) **AuthN/Z** — E4a/E4b behind `requireRole`; no IDOR (the slip key is (token teacherId, year, month); no id from the caller); admin/ceo tokens carry no teacherId ⇒ 403. (2) **Fail-open found and avoided** — the shared `serviceAuth` lets every request through when `SERVICE_TOKEN` is unset; my internal route uses its own fail-closed, constant-time guard (tests: unset / empty env ⇒ 401). The shared `serviceAuth` itself is **pre-existing and not changed** — flagging it as a repo-wide risk for you. (3) **Injection** — every SQL value is a bound parameter (drizzle); year / month are zod ints; periodId must be a uuid before the call. (4) **SSRF** — the SB URL and secret come from the operator's env only; the caller supplies a uuid and nothing else; the secret is sent in a header, never logged, never returned. (5) **Data exposure** — E4b / A return ids, display names and status only; the pay-key search test guards E4b; the only pay anywhere is the coach's OWN slip in E4a's response. (6) **Relay** — SB's `NowResult` is relayed as-is by contract; a compromised SB could put arbitrary JSON in the CEO's response (low: the call is operator-configured, internal and CEO-only). (7) **Abuse** — remind-now can be pressed repeatedly; SB's idempotency absorbs it (Jason's side), BB is CEO-only. No High / Medium finding in this code; the contract finding above is a correctness issue, not a security one.
- **Claim:** `src/services/slip-confirm.store.ts`, `slip-confirm.service.ts`, `slip-confirm.service.test.ts`, `slip-confirm-task887.mutations.json`, `src/routes/salary-internal.ts` (new); `src/routes/salary.ts` (1 import + 2 routes + the body schema), `src/routes/api.ts` (1 import + the mount), `.env.example` (2 keys), `salary-routes-task865.test.ts` (1 count). No migration. No git command.

## Review — @Silver, 2026-11-08: 🔁 one contract fix (the confirm-day period), everything else ACCEPTED
- **Re-run by me:**
  - BB `bunx --package typescript@5.9.3 tsc --noEmit` = 0; `bun test` (dummy URL) = **847 pass / 0 fail**;
  - the `api.ts` diff = 1 import + 1 mount line, tagged.
  - Sober's ✅ on the final contract is on file (l.147).
- **🔴 Bob's finding is right, and it's a contract bug, mine.**
  - R1.4's October period is 30/9–30/10, but the reminders run on **31/10**, the confirm day (October's `lockAt` = 31/10 12:00 Bangkok), and 31/10 is inside **November's** range.
  - So "the period whose range contains the date" makes the 09:00 / 11:00 jobs remind the wrong period, and remind-now answers `period-mismatch`. As signed, the reminders would never reach October's drafts.
- **🔁 Ruling, the amendment to contract A (GO; it touches only BB's internal rule):** for `?date=D`:
  1. **if a period's `lockAt`, taken as a Bangkok date, equals D → that period** (the confirm day belongs to the period being confirmed);
  2. **otherwise** → the period whose R1.4 range contains D;
  3. none → `{ periodId: null }`.
  - SB's code doesn't change: it passes today's date, and its own `after-lock-time` check still stops anything after 12:00.
  - **Tests:**
    - 31/10 → October;
    - 30/10 → October;
    - 1/11 → November;
    - 31/10 when October has no row but November does → November (rule 2);
    - all are added to the mutation set.
  - I'm telling Porter so Sober co-signs the amended clause; it's a one-line change to the signed text.
  - **✅ Sober (SA-A) CO-SIGNS the amendment, 2026-11-08.** Verified: October's confirm day 31/10 falls in November's R1.4 range, so the range-only rule reminded the wrong period — a real bug. The lock-day-first rule (lockAt==date → that period; else range; else null) resolves 31/10→October correctly, is BB-only (SB passes today's date unchanged, its `after-lock-time` still guards post-12:00), and the four test cases (31/10→Oct, 30/10→Oct, 1/11→Nov, 31/10 Oct-missing→Nov) are right. Signed clause A text updated to match. **Bob: build A to the amended rule.**
- **Accepted as built:**
  - E4b's response `{ targets: [...], send }`: right, since a bare list can't carry `send`. Fern / Fanta read it this way.
  - The strict fail-closed internal guard.
  - E4a's conditional update.
  - The sid proof (rolled back, residue 0).
- **The open item, now a fact:** an admin Entries write **after** a coach's confirm is **allowed today** (`addEntry` checks only the period lock), pinned by a test. Raised to Porter for a later rule; no change here.
- **Security review (by hand, recorded):** no High / Medium.
  - The internal read is strict, fail-closed and constant-time, and returns ids only.
  - E4a resolves only from the token.
  - E4b is CEO-only with no pay, and SB's secret is sent only when configured.
  - The shared `serviceAuth` fail-open is pre-existing and already with Sober.
- **After the fix:** report in one line; I re-run and mark DONE.

## Review 2 — the confirm-day fix — @Silver, 2026-11-09: ✅ ACCEPTED (DONE)
- **Re-run by me:** BB tsc 0; `bun test` = **912 pass / 0 fail**. The 4 slip-export failures Bob saw were Jason's 879 rework in flight; they're green now.
- **Rule A as amended:** `lockAt` Bangkok date = D wins, then the R1.4 range, then null. There are 4 rule tests, and the mutation set is 33 / 33.
- **Sober's co-sign on the amended clause A:** requested via Porter. The code matches the amendment as I ruled it.
