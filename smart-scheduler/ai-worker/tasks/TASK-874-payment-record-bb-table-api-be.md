# TASK-874: F2 payment record: `bo.payment` table + back-office API (BB)
- Source: SPEC-099 §8 (decisions 1, 2, 4, 5)
- Owner: BE (Brew, Team C) · Status: TODO · Depends on: none (first of the three; TASK-875 waits for its migration on sid)
- Repo: `smart-scheduler-backoffice-back` (BB), `dong`, dirty tree (other teams' work; leave it alone). **Edit nothing until Porter's claim line names these files for Team C** (requested 2026-11-08).
- **Base (Sector, 2026-11-08, dummy URL):** `bun test` → `322 pass · 0 fail · 20 files`; `bunx --package typescript@5.9.2 tsc --noEmit -p .` → 0 `error TS` (the TASK-872 pinned form).
- 🔴 Host check before anything that can connect. **You generate the migration; Sector applies it** through `MIGRATION-QUEUE.md`.
- Files (closed list):
  - `src/db/schema-revenue.ts`: add `payment`, exactly SPEC-099 §8.2's SQL;
  - the one new `drizzle/NNNN_*.sql` + its `_journal.json` entry + snapshot;
  - `src/lib/migration-witness.ts`: one appended entry (DECISIONS row 6);
  - `src/services/revenue-ledger.service.ts` + `src/routes/revenue-ledger.ts` + `src/routes/revenue-ledger.test.ts`: the payment routes go on the existing router (already mounted);
  - `src/lib/revenue-ledger.ts` (+ test): validators and helpers, if you want them there;
  - `src/middleware/revenue-access.ts`: add a second named gate `requirePaymentAccess` = `requireRole("ceo","admin")`.
- Git writes: none.

## What to do
1. **Migration:** SPEC-099 §8.2 exactly, built the way 0008 was (hand-checked SQL, additive only; no DROP, no ALTER of an existing table). `when` greater than every journal entry at generate time.
2. **Routes on `revenueLedgerRoutes`, under `/payments`, all through `requirePaymentAccess`** (an admin may record payments; R0.2: the response holds no revenue figure). Shapes exactly as SPEC-099 §8.5:
   - `GET /payments?refType&refId`;
   - `PATCH /payments/:id`;
   - `POST /payments` (`n` = max+1 for that ref, in one statement or a transaction, so two concurrent adds can't take the same `n`; the unique index is the backstop and maps to 409).
   - Rule: row `n=1`'s `amountMinor` is not editable (400 `VALIDATION`).
   - `actor` = JWT `sub`.
3. **The revenue-line follow (§8.4):** a PATCH that changes row 1's `method` also updates `bo.revenue_line.method` where `idempotency_key = 'rl:' || lower(ref_type) || ':' || ref_id` (i.e. `rl:course:<id>` / `rl:voucher:<id>`), in the **same transaction**. If no line exists yet (not confirmed yet), only the payment changes. Installments (`n ≥ 2`) never touch the revenue line.
4. **Guard walk:** extend your TASK-858 guard-walk so every `/payments` route carries `requirePaymentAccess` and every other revenue route still carries `requireRevenueAccess`.
5. **Tests (service mocked, as TASK-858):**
   - the shapes;
   - 400 on: bad method, amount ≤ 0, editing row 1's amount, bad date;
   - 409 on a duplicate `n`;
   - admin → 200 on payments and 403 on revenue;
   - coach → 403;
   - a unit test of the follow rule: row 1 method change updates the line; `n ≥ 2` doesn't.

## Definition of Done
- [ ] `bun test` (dummy URL) → 0 fail, pass > 322.
- [ ] Pinned tsc → 0 `error TS`.
- [ ] `grep -nEi "drop |alter table \"bo\".\"(item|movement|tag|revenue)" drizzle/<new>.sql` → no output.
- [ ] **The SQL on sid, after I apply it:** a scratch script (host printed first; C-TEST data only; the shape Brew used in TASK-864) proves on Postgres:
  - insert row 1, then PATCH its method → the matching C-TEST revenue line's method changes in the same transaction;
  - an installment doesn't change it;
  - a duplicate `n` → the 409 path.
  - Paste the output.
- [ ] `git status --porcelain`: only the listed files.

## Implementation Notes

## Questions

## Review

**Claim granted (Porter, 2026-11-08 evening).** All files are Team C's or new. Start after TASK-863 (block 1 comes first, owner order).

**SPEC change before you start (Sector, 2026-11-08): read SPEC-099 §8.9.** Installments split the fee. Every row's amount is editable, the API enforces `sum ≤ fee`, and GET adds `feeMinor` / `paidMinor` / `remainingMinor`. Drop the "row 1 amount not editable" rule and test; add the `sum > fee` 400 and the `NO_FEE` 409.
