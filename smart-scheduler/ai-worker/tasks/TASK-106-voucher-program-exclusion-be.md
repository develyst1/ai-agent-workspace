# TASK-106: scheduling (BE) — enforce voucher program exclusions (no voucher on Onewheel / Balance Play)
- Source: SPEC-030 (REQ-027 part b)
- Status: TODO
- Depends on: — (REQ-029 already added `subjectId` to voucher bookings)
- Assignee: @Jason (smart-scheduler-back)

## What to build
Part (a) (per-program course sizes) is already live; this is the voucher-exclusion half.

1. **Data next to the card** (`lib/sale-items.ts`): `VOUCHER_EXCLUDED_GROUPS = new Set<PriceGroup>(["onewheel",
   "balance-private", "balance-group"])` (Onewheel + both Balance Play). + pure **`voucherAllowsProgram(group) =
   !!group && !VOUCHER_EXCLUDED_GROUPS.has(group)`** — unit-tested, no DB. (Null group → not allowed.)
2. **Enforce at booking time** (not attendance): in the VOUCHER booking path (`prepareVoucherBooking` /
   `insertBooking` where `bookingType === "VOUCHER"`), resolve the program via `resolvePriceGroup(subjectId)`
   (`:812`); if `!voucherAllowsProgram(group)` → `conflict("VOUCHER_PROGRAM_EXCLUDED",
   "วอยเชอร์ใช้กับคลาส Onewheel หรือ Balance Play ไม่ได้")`.
3. **Expose the allowed/excluded set** for the FE (extend the sellable/packages payload or add a
   `voucherAllowedGroups` field) so the FE filters from one source, not a hardcoded list.

## Definition of Done
- [ ] A voucher booking on Onewheel or Balance Play is **refused with the reason**; every other program works.
- [ ] `1st Trial` (null price group) is refused via the same null-group path — no special case.
- [ ] Already-sold vouchers keep their hours (untouched); only the new excluded booking is refused (AC #5).
- [ ] `voucherAllowsProgram` pure + tested (excluded / allowed / null); `bunx tsc --noEmit` clean; `bun test` green.
