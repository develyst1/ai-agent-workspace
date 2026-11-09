# SPEC-099: C1 revenue at confirm + F2 payment record (REQ-120 §2 R2.2/R2.4, §5 F2, §6 C1, §9 C-b/C-d) — Team C, week 2
- **Author:** Sector (SA, Team C).
- **Status, 2026-11-08:**
  - **Slice 1 (C1 revenue lines) is CUT as TASK-864 (Brew).** It is decided in §6.
  - **Update 2026-11-08 evening:** slice 2a (F2 for course and voucher) is cut (§8: TASK-874/875/876), and the claim is granted. **F1 = Team C** (Porter); it is cut next as slice 2b, carrying Silver's REQ-5010 #7 note when it arrives.
  - **Slice 2 (F1 branch, F2 payment record, installments) is still DRAFT.** §5 is answered: DECISIONS row 13, from her existing rulings (a voucher counts at its sale; installments = the whole amount at confirm; payment rows record method and dates only).
  - **Next, Sector:** read the SF booking and sale dialogs (and Team B's F4/F5 hunks in them), SB's `drizzle.config.ts` single-file `schema` (a new payments table either goes in Team B's `schema.ts` or needs the BB-style array, DECISIONS row 2), and the BF place for the back-office payment edit. Then cut SB + SF (+ BF) TASKs. Nobody waits on it: Brew is on TASK-864, Flash on TASK-859's real-API run.
- **Gate met:** F4 (TASK-860) is DONE and accepted, with 0074 on sid (Porter, 2026-11-08). Team C may enter `scheduler.service.ts`, with hunks inside named functions, per the claim.

## 1. What I read (2026-11-08, read-only; `smart-scheduler-back` (SB), branch `dong` @ `0a1f250`)
**⚠️ The working tree is dirty with other teams' uncommitted work:** `schema.ts`, the journal, `mappers.ts` and many tests. Line numbers below are the working tree's as of that read, not HEAD's.
- **`src/lib/sale-post.ts` l.1–265:**
  - `recordSale` (by product code, writes a `bo.movement` SALE plus an optional discount);
  - `postBookingSale` (by item id and an explicit amount);
  - generation keys `rev:<id>[#n]` and `discount:<id>[#n]`;
  - the two rules: it never fails the sale, and it never fails silently.
- **Every sale-posting call site** (`grep`, excluding tests):

  | where | what | when today |
  |---|---|---|
  | `scheduler.service.ts:2645` `createCoursePackage` | course | `void recordSale(courseItemRef(...))` **at sale** |
  | `scheduler.service.ts:3073` `createVoucher` | voucher | **at sale** |
  | `camp.service.ts:400` | camp | **at booking** (`camp-sale:<id>`) |
  | `rental.service.ts:44` | rental | at the paid press |
  | `jobs.service.ts:266, 323, 348` (day-end) | trial / 1HR / OTHER | **at ATTENDED**, with generation keys |
  | `scheduler.service.ts:4936`, `undo.service.ts:223` | `reverseBookingSale` | on an attendance undo |

- **Confirm paths in `scheduler.service.ts`:**
  - `applyConfirm` l.4401 sets `CONFIRMED` + `confirmedAt` for one booking;
  - `bulkConfirm` l.4946;
  - `confirmCourse` l.5541 confirms every PENDING session of a course in one transaction, with per-session hold reconciliation;
  - `confirmMakeupAtBirth` l.4490.
- **Final UI `src/pages/a/frontoffice/Payment.tsx` l.1–60 (agreed, REQ-133):**
  - *"the money is confirmed AUTOMATICALLY as Transfer — nobody presses Confirm, there is only an EDIT (front and back)"*;
  - *"Installment; each installment is received on its own date (answered in LINE: B)"*;
  - *"an Admin sees the payment being recorded, never a revenue figure"*.

## 2. Direction [SA-decided unless marked ASK]
1. **C1 writes `bo.revenue_line` (SPEC-098) directly on the shared DB**, the same pattern the scheduling back already uses for `bo.*`.
   - SB declares the table in its **own new file**, never in SB `schema.ts` (Team B's claim) and never in SB's drizzle `schema`, so SB never migrates it. BB owns the migration.
   - A new `src/lib/revenue-line.ts` holds one writer with the file's two rules:
     - it never fails the booking;
     - it never fails silently;
     - it is idempotent on its key.
2. **The bridge stays.** Every existing `bo.movement` posting keeps running unchanged until Revenue's cut-over, so the old report and the P&L keep working.
   - C1 **adds** revenue lines; it does not move the movement postings.
   - Retiring the movement postings is the cut-over TASK.
3. **When each kind writes its revenue line (R2.2):**

   | kind | trigger | key |
   |---|---|---|
   | course | the **first** time any session of the course becomes CONFIRMED (`confirmCourse`, or `applyConfirm`/`bulkConfirm` on a course session) | `rl:course:<courseId>` |
   | trial · 1HR · OTHER | `applyConfirm` / `bulkConfirm` of the booking. §9.4 #2: a later cancel or no-show leaves it; money back goes through Refund | `rl:booking:<bookingId>` |
   | voucher | **at sale** (`createVoucher`): a voucher has no confirm step | `rl:voucher:<voucherId>` |
   | rental | at the paid press | `rl:rental:<id>` |
   | camp | **D3 "Confirm camp"**: its own SPEC, not here | — |

   - The voucher row is an **inferred** reading of R2.2 plus C-b ("nobody presses Confirm"). Settle it by asking Porter whether Khwan treats a voucher's sale as its confirm. It goes in the §5 pack.
4. **Amount = net of discount**, reusing the discount the caller already validated. `occurred_on` = the Asia/Bangkok date of the trigger. Branch and method come from F1/F2 on the booking or payment, defaulting to BRAVO and TRANSFER.
5. **F2, the payment record (C-b reverses D4's "required at confirm"):**
   - It is created automatically at sale, as TRANSFER for the full amount, and paid on the sale date.
   - It is editable in the front office and the back office.
   - Installments (C-d) are extra payment rows, each with its own date, amount and method.
   - **ASK (§5):** with installments, does revenue count the whole amount on the confirm date (R2.2), or each installment on its own date (the final UI's note "B")? Default until answered: the whole amount at confirm. The payment rows only record method and dates.
6. **The cut-over double count stays impossible** (SPEC-098 §1.2). Old `bo.movement` rows are never read by the new report.

## 3. Files (proposal for the claim; not yet sent)
- **SB, new:**
  - `src/lib/revenue-line.ts` (+ test), the writer;
  - `src/db/bo-revenue-mirror.ts`, the table declaration only;
  - the payment table's own schema file and migration through the SB queue (additive). Name to be decided.
- **SB, edits:**
  - hunks inside `applyConfirm`, `bulkConfirm`, `confirmCourse`, `createVoucher` (`scheduler.service.ts`);
  - `rental.service.ts` at the paid press;
  - the payment-record routes.
- **SF:** the booking and sale dialogs' Payment Method + Edit (F2), and the branch field (F1). Read Team B's F4/F5 dialog hunks first.

## 4. Still to read before this SPEC is final
- `confirmCourse` to its end, and `bulkConfirm`: where a course session confirmed singly is detected as "first".
- `jobs.service.ts` l.240–360: the day-end ATTENDED posting. It is not retired here, but the new write must not depend on it.
- SB `drizzle.config.ts` `schema` / `schemaFilter`: confirm a mirror file is invisible to SB's generate.
- REQ-122 §10 and the final UI's `a-fo` mock for INSTALLMENTS, and `Branch.tsx` for F1.
- Team B's F4 hunks in `createCoursePackage` / `createVoucher` (TASK-860), so C1's hunks sit beside them without touching them.
- SYSTEM-FACTS §"Where money posts" (l.517).

## 5. Question pack for Porter (one message, once §4 is read)
- Voucher: does its sale count as its confirm? Default: yes.
- Installments: whole amount at confirm, or each installment on its own date? Default: whole amount at confirm.

## 6. Slice 1, decided 2026-11-08 [SA-decided] → TASK-864
Further reads:
- SB `drizzle.config.ts` (`schema` is the one file `./src/db/schema.ts`, so a separate mirror file is invisible to SB's generate);
- `schema.ts` l.238–273 (SB already mirrors `bo.item`/`bo.movement` there);
- `sale-post.ts` l.286–320 (`netPostedSale`, `postedSaleForBooking`);
- `jobs.service.ts` l.225–360 (the day-end amount rules for trial/1HR/OTHER);
- the course and voucher `recordSale` calls (`scheduler.service.ts` ~2652, ~3080);
- `teachers.is_system` (F5, TASK-861);
- the final UI `a-fo.ts` INSTALLMENTS (each with its own date, amount and method) and `Branch.tsx` (a Branch field in the booking dialog, default Bravo).

**Decisions:**
1. **The write runs in a savepoint inside the confirm's own transaction.** A failed write never fails the confirm. A rolled-back confirm takes its line with it.
2. **The course amount = what was posted at sale** (SALE + its discount movement on the course's id), because a course's discount is not stored on the course. For every other kind, the amount comes from the same helpers the day-end uses, through one new `booking-sale-amount.ts`. The day-end switches to it at the cut-over.
3. **Categories are found by name and created if missing.** No revenue is lost to a new subject name, and the admin can rename later (R2.1).
4. **OTHER bookings:** only the "No Teacher" park fee writes automatically (RENT · PARK). Birthday and the rest are typed by hand (R2.2).
5. **Branch BRAVO and method TRANSFER are fixed** until slice 2 brings F1/F2.

**Base test (dirty tree, dummy URL):** 5347 pass · 5 fail · 375 files. The fails belong to other teams; the names are in TASK-864.

## 7. REQ-5010 carry list (owner's ruling 2026-11-08: wording and small UI are free; principle changes are parked)
Each item goes into the named future TASK; whoever cuts it copies the line in.
- **Slice 2 (F2) TASK:** the Payment Method page label "Course price" → **"Course Fee"** (REQ-5010 #8).
- **D3 camp-confirm TASK:** "Sold — not confirmed yet" → **"Not confirmed yet"** (#11).
- **Refund TASK (C-f):** the session box "Cancelled on <Mon>" → **"Cancelled"**; button "Save refund" → **"Save"** (#13).
- **Done now in TASK-873 (Flash):** "Summary" heading (#12a), "Add" button (#14).
- **PARKED, do not build:** the Summary export (#12b, a new ask); it waits for the owner's talk with พี่เบส + แนท.

## 8. Slice 2a: F2 payment record for COURSE and VOUCHER, decided 2026-11-08 [SA-decided] → TASK-874 (Brew, BB) · TASK-875 (Brew, SB) · TASK-876 (Flash, SF)
**Read (2026-11-08, read-only):**
- final UI `pages/a/frontoffice/Payment.tsx` (the agreed front-office Payment Method page: a course card with its method badge + Edit + "Paid"; an Installment table with date, amount and method per row + "Add an installment"; comment: "money confirmed AUTOMATICALLY as Transfer — nobody presses Confirm, there is only an EDIT (front and back)"; "an Admin sees the payment being recorded, never a revenue figure");
- `mock/a-fo.ts` INSTALLMENTS;
- SF `src/components/partials/Bookings/CreatePlanFlow.tsx` (536 lines; the course/voucher sale flow with `DiscountSection`, l.21–22 and l.85–107), `PlanModal.tsx` (1413), `VoucherPanel.tsx` (228); SF `dong` @ `ec10cee`, dirty tree (17 entries, other teams').
- Rulings: C-b, D4, DECISIONS row 13 (the whole amount counts at confirm; payment rows record method and dates only).

**Decisions:**
1. **Where it lives: `bo.payment`, a BB-owned table** in `schema-revenue.ts`, migrated by BB (Team C), written directly by SB as well. This is the established pattern for `bo.*` (C1, SPEC-098 §1).
   - Front-office edits (SB) and back-office edits (BB) hit the one table.
   - It is not a `public` table, because BB must never write `public` (BB `schema.ts` l.591–601).
2. **Exact SQL (TASK-874's migration; additive):**
```sql
CREATE TABLE "bo"."payment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "ref_type" text NOT NULL,            -- 'COURSE' | 'VOUCHER' (slice 2a); 'BOOKING' | 'CAMP' | 'RENTAL' later
  "ref_id" uuid NOT NULL,              -- course_packages.id / vouchers.id (no FK: public is SB's)
  "n" integer NOT NULL,                -- 1 = the sale's own payment; 2.. = installments
  "paid_on" date NOT NULL,             -- Asia/Bangkok date the money came in
  "amount_minor" integer NOT NULL,     -- satang, > 0
  "method" text NOT NULL,              -- 'TRANSFER' | 'CASH' | 'CARD'
  "actor" text,                        -- who last set it (JWT sub / SB staff id); NULL for the auto row
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "payment_ref_type_ck" CHECK ("ref_type" IN ('COURSE','VOUCHER','BOOKING','CAMP','RENTAL')),
  CONSTRAINT "payment_method_ck" CHECK ("method" IN ('TRANSFER','CASH','CARD')),
  CONSTRAINT "payment_amount_ck" CHECK ("amount_minor" > 0),
  CONSTRAINT "payment_n_ck" CHECK ("n" >= 1)
);
CREATE UNIQUE INDEX "bo_payment_ref_n_uq" ON "bo"."payment" ("ref_type","ref_id","n");
```
   - Existing data: none touched. Courses and vouchers sold before this ships have no payment row; their revenue line keeps `TRANSFER` (the C-b default).
3. **At sale (SB, TASK-875):** after the course or voucher commits, insert row `n=1`: `paid_on` = the sale's Bangkok date, `amount_minor` = the net sale (list + discount, the same number `recordSale` posts), `method` = the method the sale dialog sent (default `TRANSFER`). It uses `ON CONFLICT DO NOTHING`, and it is best-effort and loud like `recordSale` (it never fails the sale).
4. **The revenue line's method = row `n=1`'s method.** The writer (TASK-864's `writeRevenueLine`) reads it when present, else `TRANSFER`. **An edit of row 1's method later updates the matching `bo.revenue_line.method`** (keys `rl:course:<id>` / `rl:voucher:<id>`), in the same transaction as the edit, so the R2.5 "Payment" column follows the record. Installments (`n ≥ 2`) never change the revenue line (row 13: the whole amount counts at confirm).
5. **APIs, same shape on both sides.**
   - **SB** `/api/v1/payments` (staff auth, as the existing SB routes) and **BB** `/api/v1/revenue/payments` (`requireRole("ceo","admin")`; an admin records payments but sees no revenue figure: the response carries no revenue-line data).
   - `GET ?refType=&refId=` → `200 { "payments": [{ "id","refType","refId","n","paidOn","amountMinor","method","updatedAt" }] }`, ordered by `n`.
   - `PATCH /:id` `{ "method"?, "paidOn"?, "amountMinor"? }` → `200 { "payment": … }`. Row 1's `amountMinor` is **not** editable (it is the sale's net; 400 `VALIDATION`).
   - `POST` `{ "refType","refId","paidOn","amountMinor","method" }` → `201`, with `n` = max+1.
   - **No DELETE in 2a.** A wrong installment is fixed by PATCH.
   - Errors: each app's existing error shape.
6. **The SF screens (TASK-876):**
   - the sale flow (`CreatePlanFlow`) gets a **Payment Method** select (Transfer · Cash · Credit card, default Transfer) next to the discount;
   - the course and voucher detail (`PlanModal` / `VoucherPanel`) gets the final UI's Payment card: the method badge + **Edit**, and the Installment table + **"Add an installment"**;
   - labels follow REQ-5010 #8: **"Course Fee"**, not "Course price".
7. **Back-office screen: not in 2a.** The final UI has no back-office payment page. The BB API exists, so a screen can be added when Khwan points at where she wants it. That is not a question now.
8. **Not in 2a:** trial / 1HR / OTHER / camp / rental payment rows (slice 2b), and F1 branch (owner of F1 asked of Porter, 2026-11-08).
- **Port and env:** none new. Ports are Team C's (SPEC-098 §4).

### 8.9 Amendment, 2026-11-08 (Flash's TASK-876 Q4): installments SPLIT the fee [SA-decided; supersedes the "row 1 = whole fee, not editable" parts of §8.3 and §8.5]
The agreed final UI's installments **sum to the fee** (`mock/a-fo.ts`: 5,000 + 4,500 = `COURSE_PRICE` 9,500): each is a part of the one fee, received on its own date. So:
- **The fee** = the sale's net. The API computes it and returns it: SB from the sale's posted movements (`course-sale:<id>` / `voucher-sale:<id>` + `discount:<id>`, the TASK-864 course rule). BB uses the same query.
- **Row 1** is still created at sale with `amount_minor` = the whole fee, `TRANSFER`.
- **Splitting:** "Add an installment" (`POST`) adds row `n+1`. Every row's `amountMinor` is now editable by `PATCH` (row 1 included).
- **The rule the API enforces:** `sum(rows) ≤ fee`. A POST or PATCH that would exceed it → 400 `VALIDATION` ("the installments add up to more than the course fee"). The admin lowers row 1, then adds row 2.
- **GET response** gains `feeMinor`, `paidMinor` (= the sum of rows) and `remainingMinor` (= fee − paid): `{ "payments": [...], "feeMinor", "paidMinor", "remainingMinor" }`. The screen shows the API's numbers and sums nothing itself.
- **Revenue is unchanged** (row 13: the whole amount counts at confirm). The revenue line's method still follows **row 1**.
- **No fee** (a sale whose movements didn't post): the API returns `feeMinor: null` and refuses POST (409 `NO_FEE`). The card shows the rows only.
- **Standing rule (Silver via Porter, 2026-11-08, after TASK-861):** any Team C reader of `public.teachers`, including future revenue coach columns, skips `teachers.is_system = true` ("No Teacher"). The park-fee revenue line (TASK-864) uses the flag on purpose and is the one exception.
