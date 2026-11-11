# TASK-921 — BE: REQ-120 **Commission distribution: product sale lines → commission pay lines** (sellers split equally; FT shares → the FT pool; eligibility by type × group) (backoffice-back) — @Bob — now
**From @Silver, 2026-11-09.** Porter: Bob's next, Team B's Salary code. The follow-on TASK-909 left out, and the reason TASK-920 found no commission writer. Repo `smart-scheduler-backoffice-back`, branch `dong`. **No git command: git only on the owner's word.** **No migration expected** (`source_ref` + its partial unique index are on sid in 0011). **Size ≈ 1.5 d.**

## The rules (sources quoted; don't re-decide)
| # | rule | source |
|---|---|---|
| 1 | **The amount is the sale line's `commission_minor` AS STORED** (the per-item edited value wins; an admin can only lower it). Distribution never recomputes it from a rate. | REQ-120 C-a / C-j; ขวัญ 10-20 "1. B", 10-21 "1 a · 2 a" |
| 2 | **Not reduced by the bill's discount** (it's already stored as given) | ขวัญ QK5 «ค่าคอมไม่ลดตามส่วนลด» |
| 3 | **Several sellers split equally** | R1.2; ขวัญ 10-14 «… PT ได้ 50 และอีก 50 เข้ากองกลาง FT» |
| 4 | **An FT seller's share goes to the FT pool**; at period end the pool is split **equally among every FT** of that period, and **a mid-period joiner gets a full share** | R1.2; ขวัญ 10-23 «รวมค่าคอมของทั้งเดือน และหารแบ่งตามจำนวนของครูฟลูไทม์ … ครูใหม่ … ได้รับสัดส่วนเท่ากัน»; 10-15 O2 «ได้เต็ม» |
| 5 | **PT / FL / admin keep their own share** | ขวัญ 10-23 «จ่ายแยกของใครของมัน»; 10-14 «แอดมินขายเอง แอดมินเก็บเอง» |
| 6 | **Eligibility by type × group:** FT · PT · FL earn on **all** groups; **STAFF** (the admins) earn **only on the "Skate bag" group** | R1.3; ขวัญ 10-14 S12, 10-23 «Only Skate bag», O11 «ตามประเภท» |
| 7 | A person's type for a sale = **`roleOfDay(profile, the sale's Bangkok date)`** (`lib/role-of-day.ts:28`), so a PT + FL person is PT on Sat–Sun and FL on Mon–Fri. Either way they keep their own (rule 5) | F3, SPEC-101 |
| 8 | A sale belongs to the **R1.4 pay period** containing its Bangkok `sold_at` date | DECISIONS row 18 |

## Step 0 (report before coding; stop if any answer is "no")
1. **What `bo.sale.seller_refs` holds** (TASK-909 stored it as given, `stock-out.service.ts:24 / 119`): `salary_profile.teacher_id`s? Say what the sell screen (Fanta's TASK-910) sends. If they're usernames or anything else, stop and tell me.
2. **Is `commission_minor` the line total or per unit?** Read 909's code and tests. The distribution uses the line total.
3. **How "Skate bag" is identified:** `bo.item.commission_group` is a free name (0015). Is there exactly one group spelled "Skate bag" in the 904 import? Give the exact string, and match it by **that exact, trimmed, case-insensitive** name.

## What to build
1. **Pure (`src/lib/commission-split.ts`):** `splitLine({ amountMinor, sellers: [{ teacherId, type }], groupName })` → `{ own: [{ teacherId, amountMinor }], toPool: amountMinor, skipped: [{ teacherId, reason }] }`.
   - Equal split over **all** listed sellers (de-duplicated).
   - **Remainder satang:** go one each to the first sellers in list order; total in = total out, tested.
   - An ineligible seller's share (STAFF on a non-Skate-bag group, or a seller with no profile) → **`skipped`, not paid** (default, see Q1).
   - `poolSplit(poolMinor, ftTeacherIds)` → equal shares with the same remainder rule. An empty FT list keeps the pool unpaid and reports it.
2. **The apply:** `POST /salary/periods/:id/apply-commission` (CEO), in Jason's salary router, one line, tagged.
   - Reads the period's sale lines (rule 8), the profiles and `roleOfDay`, then writes lines.
   - **Locked period → 409 `LOCKED`;** a confirmed / locked slip is skipped and listed, the same as 867.
3. **Lines:** `kind = 'commission'`, `source = 'auto'`.
   - **Own share:** one line per (sale line, seller), `source_ref = cm:<saleLineId>:<teacherId>`, label `Commission · <product name> · <dd/mm/yy>`.
   - **FT pool:** **one line per FT per period**, `source_ref = cm-pool:<periodId>:<teacherId>`, label `Commission · Full-time pool · <period label>`.
   - **A pool line is re-computed on every apply while its slip is a draft:** the pool grows as sales arrive, so it is **upserted** (amount + label) while the slip is `draft`; confirmed / locked are left as they are and listed.
   - Own-share lines are idempotent (`ON CONFLICT DO NOTHING`); a `changed` own line is report-only, as 867.
   - Use your own small store on 0011's index (the 867 / 887 pattern), **never Team A's `insertLine`**.
4. **Notifications:** call TASK-920's exported Commission helper (Jason's) for each **newly inserted** line. If 920 hasn't landed yet, leave a tagged one-line call site behind a `TODO(TASK-920)` and say so. **Never money in the text** (920's rule).
5. **Result:** `{ written, updatedPool, unchanged, skipped[], changed[], poolUnpaid?, notifyFailed }`.

## Tests (DB-less + a rolled-back sid proof; each must fail when its code is removed)
- ขวัญ's example: 100 ฿, FT + PT → PT line 50, pool +50;
- 3 sellers, 100 satang → 34 / 33 / 33 (the sum is kept);
- STAFF on Skate bag → paid; STAFF on another group → skipped;
- a PT + FL person: a Saturday sale = PT, a Wednesday sale = FL (both own);
- the pool: 2 FT + a mid-period joiner → 3 equal shares;
- a re-apply after a new sale updates the draft pool line and doesn't touch a confirmed slip;
- the discount doesn't change the amount (it's read from `commission_minor`);
- locked → 409;
- the period edges (rule 8).
- A mutation set over the split, the remainder, the eligibility, the pool and the upsert guard.

## Q1 for Porter → ขวัญ (one pack; the build goes ahead on the defaults)
- (a) **A seller who can't earn on that group** (an admin helping sell a skateboard, say): is their equal share **dropped** (default) or **re-split among the eligible sellers**?
- (b) **The per-group commission amount** the sell screen should pre-fill. 904's `commissionGroup.amountSatang` is null for every group, so today the amount is typed per sale. Not needed for this TASK (it reads the stored line), but needed for a pre-fill.

## Files (claim, Team B)
- `src/lib/commission-split.ts`, `src/services/commission-lines.service.ts` (+ its store) + tests;
- one route line in `src/routes/salary.ts`, tagged.
- **Read-only:** `bo.sale` / `bo.sale_line` / `bo.item` (909 / 904 schema), `role-of-day.ts`, the salary store's profile reads.
- Pure mirror test edits are pre-approved (tagged `🔻 TASK-921`, listed).

## Done =
- `bunx --package typescript@5.9.3 tsc --noEmit` 0;
- BB suite green (before / after);
- the mutants bite;
- the sid proof rolled back (host .206 first), residue 0;
- `/security-review` in the report;
- the journal `when` check only if a migration appears (none is expected).
- Report in `inbox/SA-B.md`. `git status` = only the claimed files. No git command run.
- **FE:** none needed for the lines; the slip already shows a Commission section (`KIND_LABEL`, TASK-879). A group-rate pre-fill on the sell screen waits on Q1(b).

## Step 0 (Bob, 2026-11-09) — read-only, NO code. Q1 ✅ · Q2 ✅ · **Q3 ❌ — stopping as instructed**
1. **`bo.sale.seller_refs` = teacher ids ✅.** The sell screen (TASK-910: `stock.service.ts:136-141`, `stock-out-logic.ts:82-87`) sends the seller's id from the EXISTING `GET /v1/salary/entries/people`, whose id is `p.teacher_id::text` (`salary-db.store.ts:182`) = `bo.salary_profile.teacher_id`. Caveat I will build for: 909 stores `seller_refs` **as given, unvalidated** (≤ 64 chars, ≤ 20), so an id with no active profile ⇒ **skipped, not paid** (your default).
2. **`commission_minor` is the LINE total, not per unit ✅.** The sell screen has ONE commission box per cart LINE (`stock-out-logic.ts:61-72`: «any number ≥ 0, editable lower or raise»), sent as that line's `commissionSatang`; 909 stores it in `sale_line.commission_minor` and **never multiplies it by qty** (`stock-out.service.ts` insertSaleLine; the test pins 4000 stored as 4000). So distribution uses it as the line total — no multiplication.
3. **«Skate bag» cannot be identified from the data today ❌.**
   - `bo.item.commission_group` (0015) is **NULL for every imported product**: the customer's sheet (`Format-Stock-2026-from-feen-2026-10-30.xlsx`, Balance Stock) has NO commission column — its columns are Model Code · Name · Type · Balance (Bravo/Other) · Remark — and 904's import only sets the group when a «Commission Group» column exists. There is **no group spelled «Skate bag» anywhere in the database or the import**; the string appears only in the FRONT's fixtures / Settings text («STAFF get commission on Skate bag sales only»).
   - The real products that ARE bags exist **by name** (9 rows: «IMPALA/ Skate Bag/ Pink|Blue», «SHOULDER BAG - SKY BLUE|PINK», «Stationery BAG/ Navy|Green», «Skate Bag / CREAM|SILVER» …) but every one is under **Type «Skate»** (193 rows: skates, wheels, bags…), so neither the Type nor a product-name guess is a safe key (a STAFF seller selling a «Skate» wheel must NOT earn).
   - Consequence if I built on the defaults today: **STAFF would earn on NOTHING** (every product's group is null ⇒ not «Skate bag») — safe, but silently wrong for the one case R1.3 says they earn.
**What I need (one decision, then I build; nothing else blocks):** how do the bag products get the group «Skate bag»? **My recommendation: (a)** the owner / ฟีน sets `commission_group = Skate bag` on those products through the product form (TASK-911: `commissionGroup` is already a field of the product write) or adds a «Commission Group» column to the import sheet; I match **exactly that string, trimmed, case-insensitive** (as you specified) and STAFF earns only there. Until the products carry it STAFF is skipped and the result lists them (`skipped: reason NOT_SKATE_BAG_GROUP`), so nothing is lost silently. (b) matching on a name containing «bag» — fragile, I advise against. **Also confirm the exact spelling** (`Skate bag` vs `Skate Bag` — case does not matter to the match, but the product form's value should be what the owner types).
Meanwhile I can build and test everything that does NOT depend on the group name (the split, the remainder, the pool, the upsert guard, locked/confirmed handling, role-of-day, the period edges) with the group name as ONE constant — say «go» and I start; the STAFF eligibility just reads that constant.

## Ruling on step 0 Q3 — @Silver, 2026-11-09: ✅ GO, build everything now
- **Your recommendation is accepted.**
  - One exported constant: `STAFF_COMMISSION_GROUP = "Skate bag"`. The spelling is ขวัญ's own word, «Only Skate bag» (CUSTOMER-ANSWERS, 2026-10-23).
  - Match `bo.item.commission_group` against it **trimmed + case-insensitive**.
  - **Don't key on `Type`** (Skate = 193 mixed products) or on product names.
- **No data is written by us.** The 8 bag products get the group **"Skate bag" set by staff on the product form** (TASK-907 / Jason's form) after the BB deploy. The sheet has no commission column (my check: `TASK-921-commission-groups-check.md`).
- **Until they're tagged,** a STAFF seller's share is `skipped` with reason `NOT_ELIGIBLE_GROUP` and listed. **FT / PT / FL don't depend on the group** (all groups), so their shares are paid normally.
- **Add a test:** a product with `commission_group = " skate BAG "` matches; NULL doesn't.

## Report (Bob, 2026-11-09) — TASK-921 DONE-pending-review. No migration. Nothing committed.
**Built (BB `dong`):**
- `src/lib/commission-split.ts` (PURE): `STAFF_COMMISSION_GROUP = "Skate bag"` + `isStaffGroup` (trimmed, case-insensitive, on `commission_group` only — never Type or name); `equalShares` (floor, +1 satang to the FIRST shares, Σ kept); `splitLine({amountMinor, sellers:[{teacherId, type}], groupName})` → `{own, toPool, skipped}` (sellers de-duplicated; FT share → pool; PT/FL/eligible-STAFF keep their own; STAFF only on «Skate bag»; no profile → `NO_PROFILE`; an ineligible share is DROPPED, not re-split — the Q1(a) default); `poolSplit(poolMinor, ftIds)` (equal, same remainder rule; no FT ⇒ the whole pool `unpaid`); the refs `cm:<saleLineId>:<teacherId>` / `cm-pool:<periodId>:<teacherId>` and the labels («Commission · <product> · dd/mm/yy», «Commission · Full-time pool · Oct 2026»).
- `src/services/commission-lines.service.ts`: `applyCommissionLines` + its OWN small stores on 0011's partial unique index (never Team A's `insertLine`). Reads the period's sale lines (Bangkok `sold_at` DATE inside the R1.4 range, `commission_minor > 0`, product name + `commission_group` + `seller_refs`), the profiles (`roleOfDay` on the sale's day) and the slips; own lines ON CONFLICT DO NOTHING (an existing line with another amount / label is report-only `changed`); the FT pool recomputed each apply and UPSERTED while the slip is a draft (a confirmed / locked slip's pool line is left and listed; one with no pool line yet is skipped `SLIP_NOT_DRAFT`); a zero share or zero pool line is never written; **both inserts carry the draft-only guard IN THE SQL** (`where exists (select 1 from bo.pay_slip where id = … and status = 'draft')`), so even a stale overview cannot write into a confirmed slip; the pool upsert only touches a line whose amount / label differs. FT of the period = every slip whose profile's roles include FT (a mid-period joiner has a slip ⇒ a full share).
- **Route:** one line in `routes/salary.ts`: `POST /salary/periods/:id/apply-commission` (CEO, tagged 🔻 TASK-921); 409 `LOCKED` on a locked period. **Notifications:** TASK-920 HAS landed, so no TODO: `notifyCommission(notify, {lineId, coach, day, detail})` for each NEWLY inserted line (own: the sale's day + the product; pool: today + «Full-time pool»); an UPDATED pool line notifies nobody; a failure is counted (`notifyFailed`), never thrown; the text carries no money.
- **Result:** `{ written, updatedPool, unchanged, skipped[{saleLineId, teacherId, reason, amountMinor}], changed[], poolUnpaid?, notifyFailed? }`. Skip reasons: `NOT_ELIGIBLE_GROUP` · `NO_PROFILE` · `NO_SELLER` (a sale with no seller named) · `NO_SLIP` · `SLIP_NOT_DRAFT`.
**Evidence:** new `commission-lines.service.test.ts` **41 pass** — ขวัญ's example (10000 satang, FT + PT ⇒ PT 5000 + pool 5000); 100 satang / 3 ⇒ 34/33/33 and a sweep Σ = total; STAFF on Skate bag paid, on another group / NULL skipped, « skate BAG » matches, NULL / «Skate bags» don't; PT+FL Saturday / Wednesday both own; the pool with 2 FT + a mid-period joiner (3 equal shares, remainder to the first); a re-apply after a new sale UPDATES the draft pool lines and leaves a confirmed slip (changed); idempotent re-run; a raced insert = unchanged; the sales are read for exactly the R1.4 range; locked ⇒ 409 and nothing read; the amount is the stored commission (the sale store's select has no price / discount / qty); one notification per NEW line only, no money; a failing notifier counted; route + SQL pins. **Mutation set `commission-task921.mutations.json`: 46 mutants, 46 BITE** (two EQUIVALENT candidates dropped and noted: «type ignores the sale's day» and «FT by primary type only» — the only multi-role combination allowed is PT+FL, which is own either way, and FT is always a single role, so neither changes any pay). BB full suite **1232 pass · 0 fail**; tsc 5.9.3 → 0. Mirror edit (pre-approved, tagged): `salary-routes-task865.test.ts` route count 32 → 33.
**Sid rolled-back proof (host .206 first; a throw-away period + 4 slips; REAL stores, the real sale flow of 909 to create the sales, the real notifier; residue 0 — commission lines 0→0, slips 0→0, sales 0→0, notifications 0→0, stock items 0→0): 11/11 PASS:** the PT line = 50.00 though the sale carried a 1,000.00 discount (the amount is the stored commission); the Bangkok edges — a sale at Sep 30 00:00:00 (in) and Oct 30 23:59:59 (in), Sep 29 23:59:59 and Oct 31 00:00:00 (out); STAFF on « skate BAG » paid 30.00, on Miller skipped, no-profile skipped; the FT pool 5000 split 25.00 + 25.00 across two FT slips (one a joiner who sold nothing); written 6; one «Commission» feed item per assigned recipient per new line, no money; re-apply ⇒ 0 written, 6 unchanged; a new sale grows the pool ⇒ the two draft pool lines UPDATED in place to 55.00 (not duplicated); with ft2's slip confirmed a further sale moves ft1's pool line to 75.00 and leaves ft2's at 55.00, listed as `changed`; the SQL guard itself refuses an insert and an upsert into a confirmed slip; a locked period ⇒ 409 LOCKED.
**/security-review (hand):** the route is CEO-only (`ceo` guard like its siblings), the period id is a validated uuid; every SQL value is a bound parameter (the one raw fragment is a constant guard); the amounts are read server-side from `sale_line.commission_minor` — the client cannot name an amount, a seller's type or a group; `seller_refs` are untrusted strings (909 stores them unvalidated) — an unknown id can only be `NO_PROFILE` / `NO_SLIP` ⇒ skipped, never paid; the writer cannot touch a confirmed / locked slip (checked twice: the plan and the SQL); idempotent on 0011's index; no money in a notification; nothing is deleted or rewritten (changed = report-only; a pool line is updated only while its slip is a draft). No High / Medium finding.
**Decisions / notes (say if wrong):**
1. A sale with NO seller named is `NO_SELLER` (listed, not paid, not pooled) — the pool only takes an FT seller's share.
2. «FT of the period» = a slip exists for the period and the profile's roles include FT; an FT with no slip yet (before the run) gets no share until the run creates the slip — then the next apply upserts the pool for all FT again (shares re-equalise while slips are drafts).
3. The pool is re-split among ALL FT every apply; once an FT's slip is confirmed its pool line freezes while the others keep moving — so the per-FT amounts can drift apart after a confirm (by design: a confirmed slip is never rewritten; the `changed` list tells the CEO).
4. Pool label uses the month name of the period («Oct 2026»), not the R1.4 range text.
5. **Open for ขวัญ via Porter (the build used the defaults):** Q1(a) an ineligible seller's share dropped vs re-split; Q1(b) the per-group amount pre-fill.

## Review — @Silver, 2026-11-09: ✅ ACCEPTED (DONE)
- **Re-run by me:** BB `bunx --package typescript@5.9.3 tsc --noEmit` = 0; `bun test` = **1232 pass / 0 fail**.
- **The STAFF group:** `STAFF_COMMISSION_GROUP = "Skate bag"`, trimmed + case-insensitive (`commission-split.ts:14–17`).
- **The pool upsert is guarded in SQL** to `status = 'draft'` (`commission-lines.service.ts:174`).
- **Evidence:** 46 / 46 mutants; sid 11 / 11 rolled back (period edges, the pool growing, a confirmed slip untouched).
- **Decisions 1–4:** accepted.
  - **(2) / (3) carry an operating rule for the owner:** the CEO should **apply commission before coaches confirm** (the confirm day = the period's last day, R1.5). After a confirm, that FT's pool share is frozen while the others move, and `changed` shows it.
  - I'm passing that to Porter for the CEO's month-end routine. No code change.
- **Q1 (a) / (b)** are still open with ขวัญ (Porter); the defaults are built.
- **Security review:** none. CEO-only, writes only `commission` auto lines, notification text has no money (TASK-920).
