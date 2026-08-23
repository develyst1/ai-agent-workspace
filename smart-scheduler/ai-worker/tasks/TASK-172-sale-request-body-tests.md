# TASK-172: Request-body assertion tests for every sale service (REQ-063 hardening) (FE)

- Source: REQ-063 — from the TASK-170 review (Fern's Q2). A guard for a class that bit **twice in two days**.
- Status: **REVIEW** (Fern 2026-08-23 — 8 tests; the guard was watched failing against the reintroduced bug)
- Assignee: @Fern (FE)
- Repo: **smart-scheduler-front**. Small, test-only. Not a green-light blocker; cut because the failure mode is money.

## Why
Two REQ-063 money defects in two days were both **type-happy and screen-plausible**, and both slipped every existing
test: the baht/satang unit (TASK-168/169) and the allow-list omission that dropped `discount` from the booking POST
(TASK-170 Part 1). Neither UI tests nor the compiler catch them. The one cheap guard that would have caught **both**
is a test that asserts the **request body each sale service actually builds**.

## What to build
For each sale/booking service call (`createBooking`, `createCoursePackage`, `createVoucher`, `recordRental`), a test
that captures the outgoing request body (mock the api client) and asserts:
- when a discount is entered, the body carries `discount: { kind, value, reason }` with **`value` = the human number
  typed** (e.g. Baht `391` travels as `391`, not `39100` and not dropped);
- when no discount is entered, the body has **no `discount`** (or `undefined`) — AC-7 unchanged.
Keep it to the payload contract — this is not more UI testing.

## Definition of Done
- [ ] Each of the four sale services has a request-body test covering discount-present (right unit) and
      discount-absent.
- [ ] The booking test would **fail** against the pre-TASK-170 code (the dropped field) — i.e. it actually guards the
      regression that happened.
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok · tests green.

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-23).** Reproduced: front `bunx tsc --noEmit` **0** · `bun test` **40/0** (+8).
`services/sale-request-body.test.ts` mocks the api client to capture `{url, body}` per call and asserts each sale
service (`createBooking`/course/voucher/rental) puts `discount` **on the wire as the human number** (`value: 391`,
not `39100`, not dropped) and omits it when absent (AC-7). Its header names both defects this guards — wrong unit
and silent-drop — and the booking assertion is written to **fail against pre-TASK-170 code** (the missing key), so
it genuinely guards the regression that happened, not a hypothetical. This is the right systemic answer to
"type-happy + screen-plausible + wrong on the wire." **DONE.**

## Notes / Questions
(Fern fills in. This is the systemic answer to "type system happy + screen plausible + wrong on the wire". Scope it
to the request-body contract; don't expand into UI snapshot tests.)

---

## Implementation Notes (Fern 2026-08-23)
**`src/services/sale-request-body.test.ts` — 8 tests, test-only, no product code touched.**

`mock.module` on `@/lib/api/client` captures what each service actually posts; the four sale services then run for
real. Each is asserted twice: **discount present** (body carries `{kind, value, reason}` with `value` = the **human**
number — `391` travels as `391`, not `39100`, not absent) and **discount absent** (no `discount` key at all — AC-7,
the request unchanged from before REQ-063).

### 🟢 I proved the guard actually guards, rather than asserting that it does
The DoD says the booking test must fail against pre-TASK-170 code, so I **reintroduced the bug** — deleted
`discount: input.discount` from `createBooking`'s body — and re-ran:
```
(fail) POST /bookings carries it — the exact field TASK-170 dropped
 7 pass, 1 fail
```
**Exactly one test failed, and it was the right one.** Then restored the line (verified: 3 occurrences back) and the
suite returns 8/8. A regression test nobody has watched fail is a guess about the future; this one has been watched.

### DoD
- ✅ All four services covered, both directions. ✅ The booking case demonstrably fails against the pre-fix code.
- ✅ Scoped to the payload contract — no UI/snapshot testing, as the task asked.
- ✅ `bunx tsc --noEmit` **0** · `bun run build` **ok** · `bun test src/lib/scheduler/ src/services/` **40/0**.

**One honest limit:** this guards the body the FE *builds*, not that the BE reads it the same way. The unit agreement
between the two sides is pinned by Jason's TASK-168 tests, not these — together they cover the round trip, but neither
alone does.
