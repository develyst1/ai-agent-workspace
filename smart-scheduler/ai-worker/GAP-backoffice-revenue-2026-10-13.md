# GAP: REVENUE (+ cross-cutting X-1…X-6), what the customer wants vs what the code does TODAY (@Silver, 2026-10-13)
**For:** `UNDERSTANDING-backoffice-2026-10-13.md` §2.3 (R-1…R-11), the REVENUE report spec (§2.1) and §4 (X-1…X-6). Porter's brief, inbox 2026-10-13.
- **READ ONLY:** no edits, no SQL, no `.env`, nothing run. **No sizing.**
- **Repos:**
  - **SB** = `smart-scheduler-back` (the scheduling back);
  - **BB** = `smart-scheduler-backoffice-back`;
  - **BF** = `smart-scheduler-backoffice-front`.
  - `sched` = SB `src/services/scheduler.service.ts`.
- I re-checked the load-bearing lines myself: every `recordSale` / `postBookingSale` call site, the day-end selection (`jobs.service.ts:185-186`), and BB's `productKind` and month-only validation.
- **Sober has Salary + Stock.** Where those touch revenue (the freelance expense hold, product sales from Stock OUT), I only state the revenue side.

**Today =** ✅ exists · 🟡 partial · ❌ missing · 🔴 contradicts.

> 🔑 **How revenue works today, in one paragraph:**
> - Every revenue post goes through SB `lib/sale-post.ts` and becomes a row in the shared `bo.movement` (`ref_type 'SALE'`).
> - The amount is the **current** `bo.item.unit_price_minor` for the product code (`sale-post.ts:109-136`).
> - Every post is **best-effort after the commit** (`void recordSale(...)`); a failure is only logged (`sale-post.ts:112-117`).
> - Reports bucket by **`bo.movement.created_at`**, the moment of posting.
> - **Nothing posts at CONFIRM.**

## R-2 in full: when money is posted today, per sale kind (vs "at confirm")
| sale kind | posted TODAY | code (SB) | amount / key | vs "at confirm" |
|---|---|---|---|---|
| **Course** (Private, DUO, a course seat in a GROUP) | **at SALE** (course created), whole price, ONE movement; the sessions are still PENDING | `sched:2524-2528`; sessions born PENDING `sched:1331` | `course-{priceGroup}-{4/6/10}` · key `course-sale:<id>` + `discount:<id>` | 🔴 **earlier than confirm.** Never split per session (`sale-post.ts:312-313`) |
| **Voucher 5/10/15** | **at SALE**, whole price; using hours posts nothing | `sched:2945-2949` | `voucher-{5/10/15}` · `voucher-sale:<id>` | 🔴 earlier than confirm; never per session |
| **1st Trial** | **at the DAY-END job, only if ATTENDED**; rows left unmarked are auto-ATTENDED and post | `jobs.service.ts:163-237` (selection `:185-186`), auto-mark `:145-154` | `first-trial` ฿1,390 · `rev:<bookingId>[#n]` + its discount | 🔴 **later than confirm** (the date it was attended) |
| **Single session (1HR)** incl. a walk-in group seat | **at the DAY-END job, if ATTENDED** | same; the seat is priced by the group's kind `jobs.service.ts:201` | `session-{priceGroup}` · `rev:<id>` | 🔴 later than confirm |
| **Camp** | **at the package SALE** (whole package); the day rows post nothing | `camp.service.ts:400` (*"Nothing else ever posts for a camp"* `:379`) | `camp-full-week/half-week/full-day/half-day` · `camp-sale:<id>` | 🔴 earlier (at sale; there is no confirm step for a camp package) |
| **ECA / FREE / KOL** (OTHER) | **at the DAY-END job, only if ATTENDED AND a price was set on the booking.** An ECA **series** takes no price, so **ECA normally posts NOTHING** | `jobs.service.ts:272-349`; series *"No money anywhere here"* `sched:1580-1585` | the item's current price or a typed amount on `other-booking` · `rev:<id>`; **no discount** | 🔴 later than confirm, and usually never |
| **GROUP row** | **never** (not in the sweep, `jobs.service.ts:186`); its seats post as a course or a walk-in single | — | — | n/a |
| **Rental** | standalone: **at once** (and a failure is a 502) · whole course paid upfront: **at the course sale** · pay-per-session: **at the "paid" press** | `rental.service.ts:31-48`, `:168-186`; `sched:2535-2538` | `rental-*` per hour · `rental:<ref>:<code>` | 🔴 at sale / at payment, never at confirm (closest to "paid") |
| **Birthday** | ❌ **does not exist** as a booking kind (types `schema.ts:42-53`, OTHER kinds `lib/other-kind.ts:9-10`) | — | — | — |
| *(not revenue)* **at confirm** | only the **freelance coach EXPENSE hold** (`ref_type 'BOOKING'`, `fl:<booking>:<item>:held1`) | `sched:252-262`, `:4513-4521` | — | Sober's side (salary) |
| **Imports** (`source='IMPORT'`) | **nothing ever posts** | `sched:2248`, `:2282` | — | ❌ imported sales are invisible to revenue |

**What would have to change for "revenue at confirm":**
- A new trigger at the confirm path (`applyConfirm` `sched:3994-4053` / `confirmCourse`). Today it writes no money.
- The customer must answer R-2's GAP first: **whole course / voucher at its first confirm, or per class as each is confirmed?**
- Then:
  - course, voucher and camp move from "at sale" to that trigger;
  - trial, 1HR and OTHER move from "day-end ATTENDED" to confirm;
  - the day-end posting and its undo-reversal (`rev:` / `rev-undo:`) are retired or re-pointed.
- ⚠️ "Confirm" is not "paid" in the code: there is **no paid state** (R-11). The rule "confirm = paid" would rest on the admin's habit, not on data.

## R-1…R-11
| id | the customer wants | today | what would have to change (one line) |
|---|---|---|---|
| **R-1** Categories (COURSE: Inline Skate · Surfskate · Skateboard · Bike · Balance Play · Onewheel · Freeskate · Scooter; Trial; Group/Camp · VOUCHER · ECA · SALES · F&B · RENT · OTHER · ระบุเอง; "Private/Duo/1HR") | 🟡 **Price groups are only 5:** `bike-skate · onewheel · balance-private · balance-group · balance-duo` (SB `lib/sale-items.ts:36-44`). Inline, Surfskate, Freeskate, Skateboard and Bike all map to `bike-skate` (`drizzle/0016…sql:21-24`). BB's revenue-by-activity groups by **subject** (the sport), which is close to her COURSE categories (BB `revenue.service.ts:70-78`). BB's `productKind` knows only COURSE / VOUCHER / BOOKING (`revenue-attribution.ts:96-99`); **rental-\*, camp-\*, other-booking and any catalog item ⇒ `UNKNOWN_CODE` (unattributed)**. Tags exist but are unseeded and unused by reports (BB `schema.ts:536-571`). | A **Type → Category** dimension on every revenue line: from subject + product kind for sales the system makes, chosen by hand for the rest. Teach the report camp / rental / ECA / OTHER. |
| **R-2** Revenue at confirm | 🔴 see the table above: at sale, at day-end ATTENDED, or at the paid press. **Never at confirm.** | A new confirm-time posting + retire/re-point the day-end posting (after her per-course vs per-class answer). |
| **R-3** Refunds / cancel after confirm / paused course | 🔴/❌ **Only an attendance Undo reverses** (`sale-post.ts:398-441`, called `sched:4529`, `undo.service.ts:223`). These **move no money**: <br>• cancelling a confirmed/attended booking (`sched:4190-4328`; a read-only warning only, *"reversal stays a backoffice act"* `sale-post.ts:255-264`); <br>• ending, dropping or pausing a course (`sched:5663-5695`, `:5941-5984`); <br>• ending a voucher (*"No refund"* `sched:5986-5992`); <br>• removing a rental (`rental.service.ts:198-203`). <br>**No refund concept** in BB/BF. | A refund / reversal event (who, amount, reason) per case she rules; today a paused course (stored CANCELLED) keeps its full revenue. |
| **R-4** Branch Bravo / Other | ❌ **No branch** in SB, BB or BF (the only SB mechanism is optional per-booking badges, SB `schema.ts:940-996`). The dormant `ops.organizations` is unused. | A branch on every revenue line: a field on courses, vouchers, bookings and manual lines, or a mapping. **Its source must be ruled first.** |
| **R-5** ECA revenue | 🔴/❌ ECA series carry **no price** and post **nothing** (`sched:1580-1585`). A single OTHER booking *can* carry a price (`validation.ts:197-207`) and posts at day-end if ATTENDED. **No school/contract/term entity.** | A school billing record (per term / per class / contract) or a manual revenue line; her answer decides which. |
| **R-6** Group / Camp, Birthday | 🟡 Camp: whole package at sale (`camp.service.ts:400`). A Group class: through its seats (course / walk-in). ❌ **Birthday is not in the system.** | Camp: move to her confirm rule. Birthday: a new kind or a manual line. |
| **R-7** SALES / F&B / OTHER from Stock OUT | ❌ **No product, F&B or shirt sales in live code.** Only the DORMANT `ops` seed had water/snack/rent (BB `db/seed.ts:59-66`). The only live route: an admin creates any INCOME `bo.item` and posts qty movements (P&L only, see R-9). | The Stock OUT sale (Sober's area) must emit a revenue line with category, discount and payment method. |
| **R-8** RENT ("Rent All / Park fee") | 🟡 Equipment rental **exists and posts** (5 `rental-*` codes, SB `sale-items.ts:142-148`), but the BB report shows it as `UNKNOWN_CODE`. ❌ No park fee. | Map `rental-*` into RENT in the report; park fee = a manual line or a new code. |
| **R-9** "ระบุเอง" (manual line: type + category + amount + remark) | 🟡 BB `POST /bo/items/:id/movements` exists, but **there is no free amount**: value = −qty × unit price (BB `item.service.ts:128`). BF sends only qty + reason (`BoMovementModal.tsx:42`). `bo.movement.actor` / `note` exist but are **never written** (BB `schema.ts:526-527`). A manual movement shows in the P&L, **not** in revenue-by-activity (no `refType 'SALE'`). | A manual revenue entry: amount + type + category + branch + remark + actor. |
| **R-10** Report: daily · MTD · YTD real-time; filters branch / period / type / category; columns Type · Category · Amount · Remark | 🟡 **BB reports today:** <br>• **P&L** with any `from`/`to` range; the default month-to-date is computed in **UTC** (BB `item.service.ts:165-195`); <br>• **revenue-by-activity** and **customer-spend**: **month only** (BB `validation.ts:290`), Bangkok-bucketed, grouped by subject / by student. <br>All are live queries (real-time ✅). **No daily or YTD view, no type/category/branch filter, no remark column.** BF `/revenue` = a month picker only; gross and discount are returned but not shown. | One revenue report over a free period (day / MTD / YTD) with the type, category and branch filters + remark. Bangkok dates throughout. |
| **R-11** Payment method (Transfer / Cash / Credit card) | ❌ **No payment-method column and no paid state** for courses, vouchers, camp or bookings, in SB or BB. Only rentals have `paid_at` / `paid_actor` (SB `schema.ts:654-655`). | A payment record (method, date, amount, slip?) on each sale; that is also what "confirm = paid" (R-2) would rest on. |

## X-1…X-6 (cross-cutting)
| id | today | what would have to change |
|---|---|---|
| **X-1** Accounts and roles | 🔴/❌ **BB has ONE admin from env** (`ADMIN_USERNAME`/`ADMIN_PASSWORD`, **falls back to admin/admin**; BB `routes/auth.ts:11-19`). The token carries `role:"admin"`, but nothing checks it (`middleware/auth.ts:27-41`). `SKIP_ADMIN_AUTH=true` bypasses it. BF `/revenue` is missing from the login redirect (`proxy.ts:19-30`); its API calls still need the token. **SB HAS real users, roles and per-user permissions** (SB `schema.ts:711-753`), including coach logins scoped to their own data, but none of it reaches BB. | One account model across both: the back office should reuse SB's users/roles, not its own env admin, so coaches (S-16) and ฟีน-only salary (S-19) are possible. |
| **X-2** Notifications (pay items, low stock) | ❌ **None in BB** (`ops.notification_outbox` is dormant and unreferenced). SB has a working LINE outbox (`notification_outbox`, used by every family/coach message) and coach LINE links (`teachers.line_user_id`). | Reuse SB's outbox and LINE links for coach pay notices (a new kind each); web vs LINE is her answer. |
| **X-3** Branch | ❌ everywhere (see R-4). | As R-4. |
| **X-4** History never lost | 🟡 `bo.movement` is append-only in practice: no update/delete route; a reversal is a new row; the idempotency key is unique. **But:** <br>• the item FK is `ON DELETE CASCADE` (BB `schema.ts:515`); <br>• `PATCH /items/:id` changes the price in place, with **no price history** (BB `item.service.ts:75-102`); <br>• **actor is never written** (see R-9); <br>• SB has **no booking status history** (`booking_events` deferred, SB `lib/course-history.ts:5-7`). | Write the actor on every movement; no cascade delete; keep price history; status history for whatever drives revenue (confirm). |
| **X-5** Existing back-office code designed around a wallet debited at ATTENDED | 🔴 **Confirmed and wider.** Live posting is at sale / day-end ATTENDED / paid press (R-2 table). The wallet itself is DORMANT (Sober's survey). SB writes `bo.item` / `bo.movement` directly, in the same DB (Sober §3). | Any rebuild keeps `bo.item` / `bo.movement` and their key formats, or changes SB's posting at the same time. "At confirm" is an SB change before it is a BB change. |
| **X-6** Scope and money | n/a (the owner's) | From the code side: R-2, R-3, R-4/X-3, R-5, R-7, R-9, R-10, R-11 and X-1 are each **new capability**, not a screen on existing data. |

## 🔴 The facts that contradict "revenue at CONFIRM" (for the question set)
1. A course posts its **whole price at sale**, while its sessions are still PENDING (`sched:2524-2528`, `:1331`).
2. A voucher posts at **sale** (`sched:2945-2949`).
3. A camp package posts at **sale** (`camp.service.ts:400`).
4. Trial, 1HR and priced OTHER post at the **day-end job when ATTENDED**, including auto-attended rows (`jobs.service.ts:145-237`).
5. Rentals post at sale or at the **paid press** (`rental.service.ts:44`, `:168-186`).
6. The only thing written at confirm is the freelance **expense** hold (`sched:252-262`).
7. Revenue is **bucketed by posting time** (`bo.movement.created_at`), not by confirm date or class date.
8. Cancel, end, drop, pause and voucher-end **reverse nothing**; only an attendance undo does.
9. **Imports never post**; **ECA series never post.**

## Questions this hands the question set (facts → consequence; Porter words them)
- **R-2:** at confirm, does the **whole** course or voucher count on its first confirm, or **per class**? (Today the whole course counts on the day it is SOLD, even before any class is confirmed.)
- **R-3:** when a confirmed class or a course is cancelled, paused or ended early, does revenue go **down**? (Today it never does.)
- **R-4:** where does a sale's branch come from: the coach, the place, or chosen at sale?
- **R-5:** how is a school billed for ECA? (Today ECA brings in ฿0 in the system.)
- **R-11:** must every sale record **how it was paid**? (Today nothing does, except rentals' paid time.)
