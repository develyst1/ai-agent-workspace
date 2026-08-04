# SPEC-030 — Enforce the price card's product rules (voucher exclusions)

- Source: REQ-027 (owner "เอา"/"เอา", 2026-08-01) + the `1st Trial` ruling Porter folded in (2026-08-03).
- Status: DESIGN — part (a) already live; this specs part (b) + confirms the edges.
- Go-live: **2026-08-20** (HIGH).

Grounded in a code read (2026-08-03). Refs are `smart-scheduler-back`.

## 1. What's already done vs what's left

- ✅ **Part (a) — per-program course sizes — is LIVE** (TASK-077, verified on `sid` 2026-08-02). `createCoursePackage`
  refuses a non-offered `(program, size)` via `isSellable(priceGroup, size)` (`scheduler.service.ts:951`), driven by
  the catalogue `sellablePackages()` (`lib/sale-items.ts`). Onewheel = 1/4/6, Balance Play = 1/6/10, skate/bike =
  4/6/10 — enforced server-side, with the sizes derived from *which product codes exist* (no separate list to drift).
  **Nothing to build here.**
- 🔴 **Part (b) — voucher exclusions — is NOT built.** The voucher card prints *"CAN NOT BE USED FOR ONEWHEEL"* and
  *"CAN NOT BE USED FOR BALANCE PLAY"*, and nothing enforces it: a voucher can currently pay for any program.

## 2. The voucher-exclusion rule — data next to the card, enforced at booking

Per the constraint (*"data next to the price list, not conditionals scattered through the booking code"*):

- **Data in `lib/sale-items.ts`** (beside the `CARD`): `VOUCHER_EXCLUDED_GROUPS = new Set<PriceGroup>([
  "onewheel", "balance-private", "balance-group" ])` — Onewheel + both Balance Play groups. Vouchers are allowed
  only for the **bike-skate** family.
- **Pure predicate** `voucherAllowsProgram(group: string | null): boolean` = `!!group && !VOUCHER_EXCLUDED_GROUPS.has(group)`
  — unit-tested, no DB. (Null group → not allowed: a session with no resolvable program can't be voucher-paid.)
- **Enforced at booking time**, not attendance (AC): a VOUCHER booking carries a `subjectId` (REQ-029). In the
  voucher booking path (`prepareVoucherBooking` / `insertBooking` where `bookingType === "VOUCHER"`), resolve the
  program via `resolvePriceGroup(subjectId)` (`:812`) and if `!voucherAllowsProgram(group)` →
  `conflict("VOUCHER_PROGRAM_EXCLUDED", "วอยเชอร์ใช้กับคลาส Onewheel หรือ Balance Play ไม่ได้")`. Server-side, with the
  reason (REQ-019 pattern — a reasonless rejection is a dead button).

## 3. The edges — decided and stated

- **`1st Trial` (Porter's folded-in ruling):** a course/voucher needs a real price group; `1st Trial` has none, so
  `resolvePriceGroup` → `null` → `isSellable(null, size)` is false (course) and `voucherAllowsProgram(null)` is false
  (voucher). **Already refused** by the null-group path — one rule, no special case. Confirm in the tests.
- **Grandfathered vouchers (Q3 — SA call):** **REFUSE**, with the reason. A customer already holding a voucher who
  books Onewheel/Balance Play is refused — the exclusion is printed on the card they bought, so it was never a
  promise, and a silent exception is how a rule stops being a rule. **Already-sold vouchers keep their hours**
  (untouched as entitlements, AC #5); only the *new excluded booking* is refused.

## 4. UI (part 4 — hide, but the API is the guarantee)

The voucher program picker (REQ-029) should **omit/disable** the excluded programs (Onewheel, Balance Play) so an
excluded choice isn't selectable; the server rule still stands regardless. Expose the excluded set to the FE (extend
the sellable/packages payload, or a small `voucherAllowedGroups` field) so the FE filters from **one** source, not a
hardcoded list. On a server refusal, show `VOUCHER_PROGRAM_EXCLUDED`'s message.

## 5. Tasks
- **BE TASK-106** — `VOUCHER_EXCLUDED_GROUPS` + pure `voucherAllowsProgram` in `lib/sale-items.ts` (tested); enforce
  in the VOUCHER booking path (`VOUCHER_PROGRAM_EXCLUDED` with reason); expose the allowed/excluded set for the FE.
  Tests: excluded program refused, allowed program OK, null-group (1st Trial) refused, already-sold voucher untouched.
- **FE TASK-107** — the voucher program picker omits/disables Onewheel + Balance Play (from the exposed set, not a
  hardcoded list); the server's `VOUCHER_PROGRAM_EXCLUDED` reason is shown if it's ever hit.

## 6. Out of scope
Prices themselves (SPEC-024, live) · equipment rental (REQ-028) · part (a) course sizes (already live).
