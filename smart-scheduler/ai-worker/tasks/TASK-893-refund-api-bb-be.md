# TASK-893: Refund: back-office API (sources + refund) writing the REFUND revenue line (BB)
- Source: SPEC-099 §10 (2) + (3) · REQ-120 R2.3, §9 / §9.1 C-f
- Owner: BE (Brew, Team C) · SA: Sector · Status: DONE (Sector, 2026-11-09) · Depends on: TASK-892 (the SB route; build against its contract, with the HTTP call injected)
- Repo: `smart-scheduler-backoffice-back` (BB). Every file is Team C's.
- Files (closed list): `src/routes/revenue-ledger.ts` + `.test.ts` · `src/services/revenue-ledger.service.ts` · `src/lib/revenue-ledger.ts` + `.test.ts` · `src/services/refund-cancel-client.ts` (new: the SB call, the same shape as `slip-confirm.service.ts:94–102`; injectable fetch, 5 s timeout, either env key unset ⇒ `NOT_CONFIGURED` with no request) · `src/db/pub-timetable.ts` (read-only columns the sources list needs, if missing).
- Git writes: none.

## What to do (SPEC-099 §10 exact)
1. **`GET /api/v1/revenue/refunds/sources?q=`** (CEO):
   - returns up to 20 recent courses + vouchers matching a student nickname/name (case-insensitive);
   - each item is `{ refType, refId, label, soldOn, feeMinor, attended, toCancel, refunded }`;
   - `refunded` = a line with key `rl:refund:<type>:<id>` exists;
   - fee = the TASK-874 rule.
2. **`POST /api/v1/revenue/refunds`** (CEO), in this order:
   - validate: `0 < amountMinor ≤ fee` (`NO_FEE` 409 / 400 over);
   - already refunded → 409 `ALREADY_REFUNDED`;
   - **call SB** (`NOT_CONFIGURED` → 503, an SB error/timeout → 502; **nothing written in either case**);
   - then write the REFUND line (negative, `occurred_on = refundedOn`, key `rl:refund:<type>:<id>`);
   - `201 { line, cancelledSessions }`.
   - A second POST after a crash between the two steps: SB answers `alreadyCancelled: true`, and the line is written once (the key).
3. **Guard-walk:** both routes carry `requireRevenueAccess`.

## Definition of Done
- [ ] Suite (dummy URL): no new fails over your pasted base. Pinned tsc: no new errors.
- [ ] **Tests (SB client stubbed):**
  - the order (no line when SB fails, no SB call when the amount is over the fee);
  - 409 on a repeat;
  - `NOT_CONFIGURED` → 503 with no request;
  - the line's sign, date and key;
  - sources: shape and the `refunded` flag.
- [ ] **sid proof, rolled back** (scratch script, host first), with the SB call stubbed. No real cancel and no LINE: a C-TEST sale's fee → refund → the REFUND line inside one transaction, rolled back, residue 0.

## Implementation Notes

## Questions

## Review

**Contract detail added (Sector, 2026-11-09, from Flash's TASK-894 Q1):** `GET /api/v1/revenue/refunds/sources` returns **`200 { "sources": [ { refType, refId, label, soldOn, feeMinor, attended, toCancel, refunded } ] }`**, wrapped like every other list in this API. Error shapes as SPEC-099 §10: `NO_FEE` 409, `ALREADY_REFUNDED` 409, `NOT_CONFIGURED` 503, the SB failure 502.

---
## Report — Brew (Team C), 2026-11-09. TASK-893 built; for Sector's review. No migration, no git, no real cancel, no LINE, no SB call made.
**Base (pasted as asked):** BB `bun test` (dummy URL) at my start `912 pass · 0 fail · 34 files`; pinned tsc 5.9.2 → exit 0. Host of BB's `.env` = `154.197.124.206` (sid), checked before the one DB run below.

**Files (the claim; `git status` in this area shows exactly these):** `src/routes/revenue-ledger.ts` + `.test.ts` · `src/services/revenue-ledger.service.ts` · `src/lib/revenue-ledger.ts` + `.test.ts` · new `src/services/refund-cancel-client.ts` (+ its test `refund-cancel-client.test.ts`, which is a new file next to it, not on your list) · `src/db/pub-timetable.ts`. No `api.ts` edit.

**⚠️ A SPEC mismatch you should know about.** SPEC-099 §10 names the secret `INTERNAL_JOB_SECRET` as "already in BB's `.env.example`". It is not: BB's keys are **`SCHEDULER_API_URL` and `SCHEDULER_INTERNAL_SECRET`** (`.env.example:32-34`, TASK-887; `callRemindNow` reads those). `INTERNAL_JOB_SECRET` is the name on the SB box; the value must match. The client uses BB's real keys, and a test pins that `INTERNAL_JOB_SECRET` alone is `NOT_CONFIGURED`. No `.env.example` change was needed.

**What it does.**
- **`GET /api/v1/revenue/refunds/sources?q=`** (CEO) → `200 { "sources": [ { refType, refId, label, soldOn, feeMinor, attended, toCancel, refunded } ] }` (the wrapper you added to the contract), at most 20, newest first across courses and vouchers, matching the student's nickname OR name, case-insensitive (`ILIKE`; `%` `_` `\` in `q` are literals); empty `q` = the latest 20.
  - `label` = `<nickname else name> · Course 10` / `· Voucher 5 Hr`; `soldOn` = the Bangkok date of `created_at`.
  - `feeMinor` = the TASK-874 rule (the sale + discount movements); **`null` when no sale movement exists** (such a plan cannot be refunded: NO_FEE) — the contract says a number, so this is a declared extension.
  - `attended` = sessions ATTENDED + NO_SHOW; `toCancel` = what the SB end function would cancel: PENDING + CONFIRMED + EXTENDED for a course (every live row, as `endableSessions`), the same but dated today or later for a voucher (as `endableVoucherDraws`, `voucher.ts:84`), and **0 once the plan is ended**.
  - `refunded` = a line with the key `rl:refund:<type>:<id>` exists. Personal data stays inside this CEO-only route.
- **`POST /api/v1/revenue/refunds`** (CEO), body `{ refType: COURSE|VOUCHER, refId: uuid, refundedOn: real date, amountMinor: int > 0, method, remark? (≤ 500) }`, in this order, each step stopping the next:
  1. the plan exists (else 404); 2. it has a fee (else **409 `NO_FEE`**) and `0 < amount ≤ fee` (else **400**); 3. not refunded yet (else **409 `ALREADY_REFUNDED`**);
  4. **the SB call**: `NOT_CONFIGURED` → **503 `NOT_CONFIGURED`**, any SB error, timeout, wrong status or malformed body → **502 `SCHEDULER_FAILED`**; **nothing is written in either case**;
  5. **ONE REFUND line**: `type REFUND`, `amount_minor = −amount`, `occurred_on = refundedOn`, `category_id NULL`, `product_name "Refund: <plan label>"`, `method`, `remark` (blank ⇒ null), `source REFUND`, `ref_type`/`ref_id`, `idempotency_key rl:refund:<course|voucher>:<id>` (type in lower case, as `rl:course:<id>`), `actor` = JWT sub. `201 { line, cancelledSessions }`.
  - A retry after a crash between 4 and 5: SB answers `alreadyCancelled: true`, the line is written once. Two requests at once: both pass step 3, both call SB (idempotent), one insert wins and the other gets 409 from the key (`ON CONFLICT DO NOTHING`, no row returned).
- **`src/services/refund-cancel-client.ts`:** `callRefundCancel(input, env, fetch)` → `POST {SCHEDULER_API_URL}/internal/refund-cancel`, header `x-internal-secret`, body `{refType, refId, actor}` (actor left out when null), a 5 s timeout. Either env key unset or blank → `"NOT_CONFIGURED"` and **no request**; only a 200 with `{cancelledSessions: integer ≥ 0, alreadyCancelled: boolean}` is accepted; anything else (404, 401, 500, 201, non-JSON, a wrong shape, a network error, a timeout) → `"FAILED"`. It never throws. The same shape as `callRemindNow`.
- **The guard-walk:** both routes carry `requireRevenueAccess` (the existing walk found them; it now lists them).
- **Two declared extras:** (a) the refund line **inherits the branch of the sale's own revenue line** (`rl:<course|voucher>:<id>`), BRAVO when that line is not there, so an OTHER-branch sale's refund lands in OTHER (F1, TASK-889); (b) `pub-timetable.ts` gains read-only `bookings.course_id` / `voucher_id` and `course_packages` / `vouchers` (`id, student_id, size|total_hours, created_at, ended_at`), declared as the TASK allowed.

**Evidence (dummy URL; pinned tsc 5.9.2).**
- **BB `912 → 990 pass · 0 fail · 35 files`** (+78); tsc exit 0.
- **Tests per the DoD (SB client stubbed):** the ORDER — no SB call and no line when the amount is over the fee (one satang over; exactly the fee is fine), none when there is no fee, none when already refunded, **no line when SB is not configured (503) or fails (502)**; a repeat → 409; `NOT_CONFIGURED` → 503 with **no request at all** (client test: no URL, no secret, blank, neither, and the SPEC's other name); the line's sign, date, key, category, source, ref, branch inheritance, remark; the retry after a crash and the lost race; the sources' shape, the fee from the movements (`null` when absent), the counts by status and by kind, the Bangkok `soldOn`, the `refunded` flag, newest first, at most 20 (and each kind limited to 20 in SQL), an empty result stops further queries, an ended plan reads `toCancel 0`, the LIKE escaping and the OR over nickname/name. Route: 201 shape, defaults, 13 bad bodies → 400 and the service never called, every error shape of §10 reaching the client (`NO_FEE` 409, `ALREADY_REFUNDED` 409, `NOT_CONFIGURED` 503, the SB failure 502, over-the-fee 400), admin 403 / coach 403 / no token 401 on both routes. Client: 22 cases (config, request, answers).
- **Mutation set: 74 mutants, 73 killed + 1 deleted-as-equivalent.** The first run killed 71 of 74; the three survivors were: the 5 s timeout value (now pinned by a source test, since a real 5 s wait cannot be a unit test), the per-kind `limit(20)` in SQL (now asserted), and a route wrapper that duplicated the service's own `{ sources }` (removed, so there is nothing to mutate). Files restored byte for byte (hash check).
- **sid proof, ONE rolled-back transaction, host first, the real service, the SB call STUBBED, `public` only READ** (`refund-sid-proof.ts`, counts only, no name printed): I borrowed a real course that had no posted sale and gave it C-TEST movements (fee 100,000 − 5,000 = 95,000) and a C-TEST sale line (branch OTHER) inside the transaction.
  - the sources picker on the real tables: 20 items, the 8 contract keys; for the borrowed course `{COURSE, fee 95000, attended 0, toCancel 7, refunded false}`, **matching an independent SQL count (attended 0, toCancel 7)**; a search that matches nobody → 0;
  - over the fee (95,001) → 400 and **0 SB calls**; SB not configured → 503; SB fails → 502; **REFUND lines written by those three: 0**;
  - the refund of 50,000: `REFUND, −50000, 2099-03-15, branch OTHER (inherited), CASH, source REFUND, no category, remark kept, cancelledSessions 4`; SB was asked exactly once with `{COURSE, <id>, actor c-test}`; stored with the key `rl:refund:course:<id>`, ref_type COURSE, actor c-test, label "Refund: …";
  - a second refund → **409 ALREADY_REFUNDED**; the sources now say `refunded: true`; the history read (`type=REFUND`, March 2099) shows 1 line, refundsMinor −50000, revenueMinor 0;
  - the crash window (the line removed, SB says `alreadyCancelled`): a retry returns `cancelledSessions 0` and writes the line **once**;
  - **after the rollback: REFUND lines 0 (before 0), movements 552 (before 552), C-TEST items 0, C-TEST lines 0.**
- **Not exercised, by the TASK's rule:** the real HTTP call to SB (the client's fetch is injected), a real cancel, the family notice (LINE, the owner's), and the SB route itself end to end (TASK-892's tests cover it with fakes). A joint check of both halves on a deployed pair is yours when both are live.

**Declared decisions (mine).**
1. `feeMinor: null` for a plan with no posted sale (a number otherwise).
2. The 502 error code is `SCHEDULER_FAILED` (SPEC gives only the status); 503 is `NOT_CONFIGURED`, as the SPEC says.
3. The refund line inherits the sale line's branch (BRAVO when absent).
4. A plan that does not exist is a 404 before any fee question.
5. `toCancel` for a voucher counts live sessions dated today or later; for a course, every live session.

## Questions (for Sector)
1. **Env names:** the SPEC says `INTERNAL_JOB_SECRET` on BB's side; BB's real key is `SCHEDULER_INTERNAL_SECRET`. I followed the code. Tell Flash/Porter so nobody sets the wrong key on sid.
2. **502 code name** `SCHEDULER_FAILED`: BF (TASK-894) may map it; say if you want a different string.

**Review, Sector, 2026-11-09. Verdict: DONE.**
- **Re-run by me (dummy URL):** BB `990 pass · 0 fail`; pinned tsc → 0.
- **Read:**
  - the env keys are `SCHEDULER_API_URL` + `SCHEDULER_INTERNAL_SECRET` (`refund-cancel-client.ts:16–17`; BB `.env.example:32,34`). Correct: **SPEC-099 §10 had the wrong name for BB** (`INTERNAL_JOB_SECRET`, which is SB's name for the same value), now fixed in the SPEC;
  - the sources route returns `{ sources: [...] }` (`revenue-ledger.ts:131–132`).
- **Evidence:**
  - 73/73 mutants;
  - the order rules (no line when SB fails; no SB call when over the fee);
  - the one-refund-per-sale key;
  - a sid proof in one rolled-back transaction with SB stubbed (public read only, residue 0).
- **502 code = `SCHEDULER_FAILED`:** TASK-894 maps 502 by status, so no change is needed there. I've told Flash anyway.
- **Security review:** CEO-only (guard-walk); the SB call carries the secret in a header (never logged or returned); fail-closed when unconfigured (503, no request); zod-validated; the sources list holds student names inside the CEO-only route only. Findings: none.
- **Not exercised:** the live HTTP call to SB and a real cancel + LINE. Those are Tanya's round after the joint deploy.
