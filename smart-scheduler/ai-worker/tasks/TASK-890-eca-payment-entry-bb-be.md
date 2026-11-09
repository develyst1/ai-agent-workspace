# TASK-890: ECA payment entry: one revenue line per school payment (BB)
- Source: REQ-120 §2 R2.2 ECA row (*"per term: price per class × students × classes per term (ฟีน enters). It counts on the date the school pays"*) · final UI `pages/b/revenue/EcaPayment.tsx` (REQ-133, agreed) · SPEC-098 (the ledger) · SPEC-099 §7 note: Team C's Revenue pile
- Owner: BE (Brew, Team C) · SA: Sector · Status: DONE (Sector, 2026-11-09) · Depends on: none. **Start now.** Every file is Team C's (claim Batch 2026-11-08).
- Repo: `smart-scheduler-backoffice-back` (BB), `dong`.
- **Base (Sector, 2026-11-09, dummy URL):** `bun test` → `854 pass · 2 fail`. The fails are another team's in-flight work, named in the run as `routes (CEO only) > 401 with no token; 403 for an admin or a coach; on both formats`. Paste your own base run first. Pinned tsc → paste it.
- 🔴 Host check before anything that can connect. **No migration:** this uses `bo.revenue_line` and `bo.revenue_category` as they are.
- Files (closed list): `src/routes/revenue-ledger.ts` + `.test.ts` · `src/services/revenue-ledger.service.ts` · `src/lib/revenue-ledger.ts` + `.test.ts`. The route sits on the existing router, so no `api.ts` edit.
- Git writes: none.

## What to do (the decisions are Sector's [SA-decided])
1. **`POST /api/v1/revenue/eca`**, behind `requireRevenueAccess` (CEO only; ฟีน enters, R2.2).
   - Body: `{ "categoryId": uuid (an ECA category = the school), "term": string 1–40 trimmed, "pricePerClassMinor": int > 0, "students": int > 0, "classesPerTerm": int > 0, "paidOn": "YYYY-MM-DD", "branch"?: "BRAVO"|"OTHER" (default BRAVO), "method"?: "TRANSFER"|"CASH"|"CARD" (default TRANSFER) }`.
   - `201 { "line": RevenueLine }`, the SPEC-098 §3 shape.
2. **It writes ONE `bo.revenue_line`:**
   - `type = 'ECA'`, `category_id` = the school; `product_name` = the term (e.g. "Term 2");
   - `amount_minor` = `pricePerClassMinor × students × classesPerTerm` (refuse with 400 if it overflows a 32-bit int);
   - `occurred_on = paidOn` (R2.2: the day the school pays);
   - `remark` = `"<price> ฿ × <students> students × <classes> classes"` (whole baht in the text);
   - `source = 'ECA'`, `actor` = JWT sub, `idempotency_key = NULL` (a manual entry, like the SPEC-098 manual line).
3. **400 `VALIDATION`:** a category that isn't type ECA, or is inactive/unknown; any count ≤ 0; a bad date or term.
4. **The history** = the existing `GET /lines?type=ECA` (school = `categoryName`, term = `productName`, total = `amountMinor`, date = `occurredOn`). Nothing new to add.
5. **The guard-walk test** still finds `requireRevenueAccess` on the new route.

## Definition of Done
- [ ] `bun test` (dummy URL) → no new fails beyond the base's named ones; your new tests pass.
- [ ] Pinned tsc → no new errors.
- [ ] Tests:
  - the amount = the product of the three; overflow → 400;
  - a non-ECA category → 400;
  - the shape;
  - admin → 403;
  - the guard-walk.
- [ ] **sid proof, rolled back** (scratch script, host first): one ECA line through the real service, then read back by `GET /lines?type=ECA`. Residue 0.
- [ ] `git status --porcelain`: only the listed files.

## Implementation Notes

## Questions

## Review

---
## Report — Brew (Team C), 2026-11-09. TASK-890 built; for Sector's review. No migration, no git, nothing applied.
**Base (pasted as asked):** BB `bun test` (dummy URL) at my start = `856 pass · 0 fail · 34 files` (your 854 / 2 fails had already cleared); pinned tsc 5.9.2 → exit 0. Host of BB's `.env` = `154.197.124.206` (sid), checked before the one DB run below.

**Files (the claim; `git status` in this area shows exactly these five):** `src/routes/revenue-ledger.ts` + `.test.ts` · `src/services/revenue-ledger.service.ts` · `src/lib/revenue-ledger.ts` + `.test.ts`. No `api.ts` edit (the route sits on the existing router, so it is mounted at `/api/v1/revenue/eca`).

**What it does.**
- **`POST /api/v1/revenue/eca`**, behind `requireRevenueAccess` (CEO only). Body `{ categoryId (uuid), term (1–40, trimmed), pricePerClassMinor (int > 0), students (int > 0), classesPerTerm (int > 0), paidOn (a real YYYY-MM-DD), branch? (BRAVO|OTHER, default BRAVO), method? (TRANSFER|CASH|CARD, default TRANSFER) }` → `201 { line }` in the SPEC-098 §3 shape (the same 12 fields as a manual line).
- **ONE `bo.revenue_line`:** `type 'ECA'`, `category_id` = the school, `product_name` = the term, `amount_minor = price × students × classes`, `occurred_on = paidOn`, `remark = "<price> ฿ × <students> students × <classes> classes"`, `source 'ECA'`, `actor` = JWT sub, `idempotency_key NULL` (a manual entry: two identical entries are two lines, as the TASK says; proved).
- **400 `VALIDATION`:** a category that is not type ECA, or is inactive/unknown; any count ≤ 0 or fractional; a bad/malformed date; a blank or over-40 term; a total over a 32-bit int (`2,147,483,647` satang). Overflow is tested exactly at the edge: `INT32_MAX × 1 × 1` goes through; `INT32_MAX × 2`, `46,341 × 46,341` and a product past 2^53 are refused (never wrapped or rounded).
- **Remark text:** whole baht print whole ("1500 ฿"); a fractional price prints two decimals ("150.50 ฿"), so the text never lies about a price like 150.50. The words "students" / "classes" are the TASK's, always plural.
- **The history** is the existing `GET /lines?type=ECA`; nothing new added (a test pins that the route forwards `type=ECA`).
- **One small change to a read that already existed:** `listLines(filter, d = db)` — `d` is injectable only so the rolled-back proof can read back its own uncommitted line through the REAL history query. Production callers pass one argument, unchanged.

**Evidence (dummy URL; pinned tsc 5.9.2).**
- **BB `856 → 907 pass · 0 fail · 34 files`** (+51); tsc exit 0.
- **Tests per the DoD:** the amount is the product of the three (and each factor matters: swapping any one changes the answer); overflow → 400 at the edge both ways; a non-ECA category → 400 for each of the other 7 types and nothing is inserted; unknown / inactive category → 400; the shape (the 12 keys, source ECA); defaults (BRAVO / TRANSFER) and explicit OTHER / CASH / CARD carried; the actor is the JWT subject; the term is trimmed; 19 bad bodies → 400 and the service is never called; a 40-char term is accepted; admin → 403, coach → 403, no token → 401; **the guard walk** now lists `POST /eca` and still finds `requireRevenueAccess` on every non-payment route.
- **Mutation set: 42 mutants, 42 killed** (the product, each factor, the 32-bit edge both sides, each positivity check, the baht text, the remark order, the category rules, the written fields — branch, date, term, method, source, idempotency key, actor, type — and the route's gate, schema and status). The first run killed 41 of 43: one survivor was an equivalent check I then deleted (a "safe integer" test made redundant by the 32-bit bound), the other was a real gap — my first fixture's `paidOn` happened to equal today's UTC date, so "uses today instead of paidOn" passed; the fixture now uses 2026-03-15. Files restored byte for byte (hash check).
- **sid proof, ONE rolled-back transaction, host first, the real service, C-TEST data (`eca-sid-proof.ts` in my scratchpad):**
  - school `STA` (an existing ECA category) → one line `ECA / source ECA / STA / "C-TEST Term 2" / 18,000,000 satang / 2099-03-15 / BRAVO / TRANSFER / "1500 ฿ × 12 students × 10 classes"`; stored `actor c-test`, `idempotency_key NULL`;
  - read back through the REAL history read (`listLines type=ECA`, March 2099): **1 line, school = STA, term = "C-TEST Term 2", total 18,000,000, date 2099-03-15, revenueMinor 18,000,000**;
  - a second identical entry → 2 lines, total 36,000,000 (manual entries do not de-duplicate);
  - a COURSE category, an unknown category and an overflow (2,000,000,000 × 2 × 1) → each **400 VALIDATION**; the largest that fits (2,147,483,647) is **accepted by the real database**.
  - **This run left nothing:** ECA lines on sid before 0, after 0.
- **A heads-up about older residue, not from this TASK:** my residue query also matches 4 `C-TEST brew TASK-864*` lines (type OTHER, source BOOKING, 100 satang, 2026-11-08) that TASK-864's proof left on sid and declared ("you decide cleanup"). They are still there. I did not touch them; say if you want them (and the category `C-TEST brew 864`) removed, and by whom.
- **Not exercised:** the HTTP layer over the real database (the route tests run on a mocked service; the sid proof drives the real service); a real login; the FE screen (`EcaPayment.tsx`) is not this TASK.

**Declared decisions (mine).**
1. Overflow is tested on the 32-bit column (`INT32_MAX`), not on JavaScript's safe-integer range; both are refused.
2. A price that is not whole baht prints with two decimals in the remark; whole baht print whole.
3. `students` and `classes` are always plural in the remark, exactly as the TASK writes it.
4. A category is "an ECA school" by `type = 'ECA'`; there is no separate list of schools.

## Questions (for Sector)
1. The 4 old TASK-864 C-TEST lines on sid (above): leave, or clean up?

> **answer to Q1 (Sector, 2026-11-09): leave them.** It was already decided at TASK-864 review 2: the shared-DB rule is that nobody deletes shared data, and Tanya filters on `C-TEST`. No action.

**Review, Sector, 2026-11-09. Verdict: DONE.**
- **Re-run by me (dummy URL):** BB `907 pass · 0 fail`; pinned tsc → 0.
- **Evidence:**
  - the contract exactly (12-key line, ECA/source ECA/school category/term/product/`paidOn`/formula remark/no idempotency key);
  - 32-bit overflow tested at both edges;
  - 42/42 mutants (and he found and fixed a fixture that hid a real gap);
  - a rolled-back sid proof through the real service and the real history read, residue 0.
- **The injectable executor on `listLines`** (default `db`, production calls unchanged): accepted. It's what let the proof read its own uncommitted line.
- **His declared decisions 1–4 are accepted.**
- **Security review:** CEO-only (`requireRevenueAccess`, guard-walk); zod-validated with 19 bad bodies refused before the service; parameterised writes; no personal data. Findings: none.
- **Next:** Flash's TASK-891 real-API run against a local BB (DoD item 3, one `C-TEST flash 891` line); Brew → TASK-892.
