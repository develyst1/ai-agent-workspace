# TASK-892: Refund: SB internal route that cancels the refunded course or voucher
- Source: SPEC-099 §10 (1) · REQ-120 §9 / §9.1 C-f
- Owner: BE (Brew, Team C) · SA: Sector · Status: DONE (Sector, 2026-11-09) · Depends on: none
- Repo: `smart-scheduler-back` (SB). **Shared file `src/routes/internal.ts`: one route added. Edit only after Porter's claim names it for Team C** (requested 2026-11-09).
- Files (closed list): `src/routes/internal.ts` (one `.post("/refund-cancel", …)` behind the existing secret gate) · `src/lib/refund-cancel.ts` + test (new). **No change** to `endCourse` / `endVoucher` themselves.
- Git writes: none.

## What to do
- `POST /internal/refund-cancel`, `x-internal-secret` (the same gate as the jobs). Body (zod): `{ refType: "COURSE"|"VOUCHER", refId: uuid, actor?: string }`.
- It calls `endCourse(refId, { reason: "CUSTOMER_CANCELLED", note: "refund" }, actor)` or `endVoucher(...)` the same way.
  - Success → `200 { cancelledSessions: n, alreadyCancelled: false }`.
  - **Already ended/cancelled → `200 { cancelledSessions: 0, alreadyCancelled: true }`.** Map that function's own "already ended" refusal. Read its code to find the exact error code, and cite file:line.
  - Unknown id → 404. A bad secret → the gate's own 401/403.
- **Tests (DB-free, the functions stubbed):**
  - each refType calls the right function with `CUSTOMER_CANCELLED`;
  - the already-ended mapping;
  - an unknown id;
  - the secret gate is applied (a request without the header is refused).

## Definition of Done
- [ ] Suite (dummy URL): no new fails over your pasted base. Pinned tsc: no new errors.
- [ ] `git diff -U0 src/routes/internal.ts`: one route only.
- [ ] **No sid run that cancels a real plan.** The rolled-back proof is TASK-893's, and the family notice is LINE (the owner's).

## Implementation Notes

## Questions

## Review

**Claim GRANTED (Porter, 2026-11-09; board line written):** `src/routes/internal.ts`, one route, **append-only**. Jason's TASK-888 `/internal/salary-remind*` lines are already there; don't touch them. Plus the new `src/lib/refund-cancel.ts`. Order: after TASK-890.

---
## Report — Brew (Team C), 2026-11-09. TASK-892 built; for Sector's review. No migration, no git, nothing run against a real plan.
**Base (pasted as asked):** SB `bun test` (dummy URL) at my start: `5648 pass · 4 fail · 383 files`; pinned tsc 5.9.2 → exit 0. The fails at the start were `TASK-743 (program of an OTHER row)`, two `TASK-749` day-end wiring tests and the `TASK-627 … day-end-sweep-task749.mutations.json` anchor test — none mine. Host check: this TASK never connects to a database (the end functions are fakes), so no host was needed.

**Files:** `src/routes/internal.ts` (append-only: 4 insert-only hunks, nothing removed or reworded) · new `src/lib/refund-cancel.ts` + `src/lib/refund-cancel.test.ts`. `endCourse` / `endVoucher` are NOT changed. Jason's TASK-888 `salary-remind*` lines are untouched (a test pins that they are still there).
`git diff -U0 src/routes/internal.ts | grep "^@@"` → `@@ -8,0 +9 @@` (the import) · `@@ -35,0 +37,7 @@` (the zod body, beside the other bodies) · `@@ -138,0 +147,7 @@` (the route: **one** `.post("/refund-cancel", …)`, placed before the month-reset route) — all additions.

**The route.** `POST /internal/refund-cancel`, behind the existing `internalSecretError` gate (the jobs' `x-internal-secret`): no header or a wrong one → `401 UNAUTHORIZED`; no secret configured → `503 NOT_CONFIGURED` (the gate's own answers). Body `{ refType: "COURSE"|"VOUCHER", refId: uuid, actor?: string (1–100, trimmed) }` → `400 VALIDATION` otherwise.
- It calls `endCourse(refId, { reason: "CUSTOMER_CANCELLED", note: "refund" }, actor)` or `endVoucher(...)` (same arguments) and answers `200 { cancelledSessions: n, alreadyCancelled: false }`, where `n` is the function's own `removedSessions`.
- **Already ended → `200 { cancelledSessions: 0, alreadyCancelled: true }`.** Step 0 (the exact refusal, with file:line, `scheduler.service.ts`): `endCourse` (`:6406`) refuses a second end at `:6421-6423` with `conflict("ALREADY_ENDED", "คอร์สนี้ถูกยกเลิกไปแล้ว")`; `endVoucher` (`:6570`) at `:6581-6582` with `conflict("ALREADY_ENDED", VOUCHER_ENDED_MESSAGE)`. `conflict` is `ApiException(409, code, …)`. **Only** a 409 with code `ALREADY_ENDED` is mapped; the other "ended" codes (`COURSE_ENDED` `:4246 / :6133 / :6278`, `VOUCHER_ENDED` `:6092`) belong to the re-plan doors and pass through as 409s.
- **Unknown id → `404 NOT_FOUND`:** `loadCourseForEnd` throws `notFound("ไม่พบคอร์ส")` (`:5496-5497`), `loadVoucherForEnd` `notFound("ไม่พบวอยเชอร์")` (`:6541`); passed through untouched. Any other error (including a plain `Error`) is rethrown, never read as "already cancelled".
- **The reason** is valid for both functions (`CUSTOMER_CANCELLED` is in `END_REASONS` `lib/course-plan.ts:443` and `COURSE_END_REASONS` `:455`); a test pins it.
- **Side effects, stated plainly:** `endCourse` / `endVoucher` themselves send the teachers' "class cancelled" notice (`sendCourseDroppedToTeachers`) and cancel the not-yet-held sessions; that is the admin button's behaviour and is unchanged. The FAMILY's notice is LINE (the owner's) and is not sent by this route.

**The seam.** `internal.ts` loads the real functions through `refundCancelDeps()` (a lazy `import("../services/scheduler.service")`); `setRefundCancelDeps(fake | null)` is a TEST SEAM so route tests can run DB-free without a process-wide `mock.module`. Production never calls the setter.

**Evidence (dummy URL; pinned tsc 5.9.2).**
- **New tests: 35** in `src/lib/refund-cancel.test.ts` (all pass; DB-free; the end functions are fakes). They cover: each `refType` calls the right function with `CUSTOMER_CANCELLED` and `note "refund"` and the other function is untouched; the actor is passed on, `null` when absent; the already-ended mapping for both types (asked once, no retry); that ONLY the 409 `ALREADY_ENDED` is mapped (`COURSE_ENDED`, `VOUCHER_ENDED`, a 400 with the same code, a 404, a 400 `INVALID_REASON` and a plain `Error` all pass through); a malformed or negative session count is an error, never a silent 0; the unknown id → 404; **the secret gate** (no header / wrong header → 401, secret unset → 503, and in every case the end functions are never called); 8 bad bodies → 400 and nothing ended; source pins that `endCourse` / `endVoucher` still contain `conflict("ALREADY_ENDED"` and `removedSessions: doomed.length` and the two `notFound` lines (a rename there fails here), that `refund-cancel.ts` imports no database and has no write, and that the TASK-888 lines are still in `internal.ts`.
- **Mutation set: 26 mutants, 26 killed** (the reason, the note, the swapped / forced function, the actor, five variants of the already-ended predicate, both result flags, the count checks, the rethrow, the test seam, the route's gate, schema (refType, uuid, actor optional) and status). The first run killed 25; the survivor was the negative-count check, now tested. Files restored byte for byte (hash check; `internal.ts` is a CRLF file, edited and restored with its own line endings).
- **Full SB suite after my change: `5682 pass · 5 fail · 384 files`.** tsc exit 0. **None of the 5 fails is mine, and the set is not stable run to run**: another seat is editing shared files in this tree right now (`git status` shows `src/lib/voucher.ts`, `src/lib/som-contract.ts`, `scheduler.service.ts`, `voucher-*` tests as modified by someone else). The failing names this time: two `TASK-627 … .mutations.json` anchor tests (`notified-count-seam-task647`, `voucher-reserved-hours-task870`), `TASK-732 (family confirm Remark)`, `TASK-870 AMENDMENT 3 (a voucher END cancels every future draw)`, `TASK-730 (the sale tells the family ONCE)`. Earlier in this TASK the failing set was different (`TASK-743`, `TASK-749`, `TASK-877`, `TASK-756`, `TASK-742`). No failing test imports `refund-cancel` or `routes/internal`. Net: **0 new fails of mine; +35 passes.** I can re-run the whole suite when that seat is done, if you want a clean number.
- **Not exercised, by the TASK's own rule:** a real course or voucher (no sid run that cancels a real plan; TASK-893's rolled-back proof covers the full chain), the family notice, the HTTP path through `index.ts` with the real secret on a running server.

## Questions (for Sector)
1. **`actor` absent ⇒ `endedBy` NULL.** The TASK passes `actor` as given, so a refund without an actor records no one. If BB (TASK-893) always sends the CEO's username this never happens; say if you would rather default it to the string "refund".

> **answer (Sector, 2026-11-09):** actor absent ⇒ `endedBy` NULL: **OK.** TASK-893 always sends the CEO's JWT `sub` as `actor`, so NULL only happens on a direct internal call.

**Review, Sector, 2026-11-09. Verdict: DONE.**
- **Re-run by me (dummy URL):** `refund-cancel.test.ts` `35 pass · 0 fail`. The whole SB suite `5683 pass · 4 fail`; the 4 are another seat's in-flight work (the TASK-627 make-up mutation set, the N1 make-up fallback, the "who asks" re-plan check), none importing his files.
- **Read `internal.ts`:** one import, the zod body, and one `.post("/refund-cancel")` behind `internalSecretError`. Jason's salary-remind lines are untouched. The `ALREADY_ENDED` mapping is cited and correct (`scheduler.service.ts:6418` course; the voucher's at `:6581`).
- **No real plan touched, no sid run**, as the DoD says. The live cancel + LINE is in Tanya's round.
- **Security review:** internal-secret gate; uuid + enum body; it calls only the existing end functions with a fixed reason. Findings: none.
