# REQ-061: ราคา Onewheel ในระบบไม่ตรงกับตารางราคาจริงของลูกค้า — 6 ชม. เกินไป ฿90 และ 10 ชม. ขายไม่ได้เลย
- Status: READY_FOR_SA
- Priority: 🔴 **HIGH** — it is money, it is live, and one half of it is a product the customer cannot sell at all
- Requested: 2026-08-22 — found by Porter while mapping REQ-058's nine programs onto a price line
- Source: the customer's **official price card** (image supplied by the owner 2026-08-22), audited line by line
  against `back/src/lib/sale-items.ts`

## What was audited
Every number on the customer's card against `CARD` / `FIRST_TRIAL_MINOR` / `RENTAL_PRICE` in `sale-items.ts:60-120`.

### ✅ Correct — no change (said explicitly so nobody "fixes" these)
| Card | System | |
|---|---|---|
| Bike/Scooter · Baby Skate · Surfskate · Inline Skate · Skateboard · Freeskate — 4h **4,790** · 6h **6,490** · 10h **9,790** | `bike-skate` 4790 / 6490 / 9790 | ✅ |
| Balance Play (Private 1:1) — 1h **1,390** · 6h **7,490** · 10h **11,390** | `balance-private` | ✅ |
| Balance Play (Group) — 1h **1,090** · 6h **5,290** · 10h **7,790** | `balance-group` | ✅ |
| 1st Trial **1,390** | `FIRST_TRIAL_MINOR` | ✅ |
| Rental — set **200** · ride **150** · helmet **50** · pads **50** | `RENTAL_PRICE` | ✅ |
| Onewheel 1h **1,690** · 4h **5,790** | `onewheel` | ✅ |

### 🔴 Wrong — Onewheel, two faults
| | Customer's card | System (`sale-items.ts:62`) | Effect |
|---|---|---|---|
| **6 HRS** | **7,900** | **7,990** | Every 6-hour Onewheel sold has been **overcharged by ฿90** in the books |
| **10 HRS** | **11,900** | **does not exist** | `isSellable("onewheel", 10)` is **false** ⇒ `createCoursePackage` **refuses**: *"โปรแกรมนี้ไม่มีแพ็กเกจ 10 ชั่วโมงตามราคาที่กำหนด"* — **a product on the customer's own price card cannot be sold through the product at all** |

The `10` gap is not an oversight in one constant — `sale-items.ts:11` states it as a deliberate fact:
> *"Onewheel has no 10 h and Balance Play has no 4 h, so those items simply do not exist and `isKnownSaleItem`
> refuses them loudly."*

**Balance Play having no 4 h is confirmed correct by the card. "Onewheel has no 10 h" is now disproven by it.**
That assumption has been sitting in the one file that defines what the business sells.

## Requirement
1. **`onewheel` 6 h becomes 7,900.**
2. **`onewheel` 10 h is added at 11,900**, which creates its `course-onewheel-10` item.
3. **The comment at `sale-items.ts:11` is corrected**, so the next reader is not told a false fact about the catalogue.
4. **Existing `bo.item` rows are brought in line** — `sale:ensure-items` must be run after deploy, and SA must say
   whether it **updates** an existing item's price or only creates missing ones. If it only creates, the 6 h price
   fix does not reach the books by deploying alone and needs an explicit step. **Say which; do not assume.**
5. **Movements already posted are NOT rewritten.** Anything already sold at 7,990 stays as it was recorded —
   correcting history is the owner's decision, not a side effect of a price fix. See Q2.

## Acceptance Criteria
- [ ] **AC-1** — A 6-hour Onewheel course sold after the fix posts **7,900**.
- [ ] **AC-2** — A **10-hour Onewheel course can be created and sold**, and posts **11,900**.
- [ ] **AC-3** — Every other price in the table above is **byte-identical** before and after (a diff of
      `sellablePackages()` shows exactly two changes: one edit, one addition).
- [ ] **AC-4** — `bo.item` for `course-onewheel-6` reads 7,900 and `course-onewheel-10` exists, **verified on the
      box after deploy**, not inferred from the code.
- [ ] **AC-5 (regression)** — Balance Play still has no 4 h and still refuses loudly.

## Questions
- **Q1 (to SA):** does `sale:ensure-items` update prices on existing items, or insert-if-missing only? Requirement 4
  hangs on the answer. *(Porter checked and it is not obvious from the call sites — this needs the person who owns
  the script, not a guess from me.)*
- **Q2 (to owner, via Porter):** were any 6-hour Onewheel courses actually sold at 7,990? If so, do you want the
  ฿90 difference corrected in the books, or left as recorded? **Nothing will be touched without your answer.**
- **Q3 (to owner):** the card shows **no 1-hour price for the blue block** (Bike/Scooter, Surfskate, Skateboard,
  Inline Skate, Freeskate, Baby Skate) — only Onewheel and Balance Play sell a single hour, plus 1st Trial. The
  system does **not** stop staff from booking a single session on a blue-block program, and its revenue then has no
  product code to post to. Is a one-hour blue-block session simply **not a thing you sell** (⇒ we should refuse it
  at booking time), or does it exist at a price not on this card?

---

## ✅ OWNER ANSWERS — 2026-08-22

**Q1 (6,490 vs 6,790)** — *"6490 ถูกแล้ว"* ⇒ **`bike-skate` 6 h stays 6,490. Nothing to change.** The "6790" was a
mis-relay, not a price rise. **REQ-058 proceeds on the existing line, unchanged.**

**Q2 (was any 6 h Onewheel sold at 7,990?)** — *"ไม่รู้"*. **Not left as unknown**: this is answerable with one
read-only query, raised as `project-docs/2026-08-22-data-request-onewheel-6h-sales.md`. If it returns **0 sales**,
Q2 closes with **no decision required at all** and the price fix carries no historical consequence. Until it is
run, **nothing about posted movements will be touched.**

**Q3 (the blue block has no 1-hour price)** — *"1 ชั่วโมงคือ one time booking ที่เหลือเป็น course booking"*
⇒ **A one-hour session is a one-time booking; 4 / 6 / 10 are courses.** For the blue block the only one-hour
product on the card is **1st Trial 1,390**, which the system already has (`FIRST_TRIAL_MINOR`, code `first-trial`).

### What Q3's answer turns into — a new requirement (6)
6. **`SINGLE_SESSION` must not be bookable on a program whose price group has no 1-hour price.** Today
   `isSellable` is enforced **only** on course creation (`scheduler.service.ts:1017`); nothing guards a single
   session. So staff can book `SINGLE_SESSION` on Surfskate/Skateboard/Bike today, and at day-end
   `revenueItemRef("SINGLE_SESSION","bike-skate")` produces `session-bike-skate`, which **is not in `SALE_ITEMS`**
   ⇒ `recordSale` logs *"NOT POSTED — unknown product code … revenue for this sale is NOT in the books."*
   **Refuse it at booking time, where a human can still fix it**, instead of discovering it after the money moved.
   The refusal should say what to do instead: **book it as a 1st Trial** (or as a course).
- [ ] **AC-6** — **Given** a program on `bike-skate`, **When** staff try to book a `SINGLE_SESSION`, **Then** it is
      refused with wording that names 1st Trial as the one-hour product — and `FIRST_TRIAL` on the same program
      still books normally.
- [ ] **AC-7 (regression)** — `SINGLE_SESSION` still books on **Onewheel · Balance Private · Balance Group**, which
      do have a 1-hour price.

### ⚠️ One thing Porter is flagging rather than assuming
Under this reading, a **returning** customer's one-hour blue-block session is booked as **"1st Trial"** — which is
the right *price* (1,390) but an odd *name* for someone's fifth visit. If they in fact sell a plain one-hour
blue-block session that simply is not on this card, say so and requirement 6 becomes "add the price" instead of
"refuse the booking". **Non-blocking** — REQ-058 does not depend on it.

## User-facing wording (Porter as UX writer)
- Refusal on a single-session booking for a no-1-hour program —
  TH: `โปรแกรมนี้ไม่มีราคาแบบรายชั่วโมง — ถ้าเป็นการมาครั้งเดียว ให้จองเป็น "ทดลองเรียน (1 ชม.)" หรือเปิดเป็นคอร์ส 4/6/10 ชม.` ·
  EN: `This program isn't sold by the hour — for a one-off visit book a 1st Trial (1 hr), or open a 4/6/10-hour course.`

---

## ✅ Q1 ANSWERED — 2026-08-22, by reading the script (no longer owed by SA)
`scripts/ensure-sale-items.ts` — **`sale:ensure-items` INSERTS what is missing and NEVER updates an existing item.**
Its own header says why: the prices it carries were once placeholders, and *"overwriting a real price that
คุณกุ้ง has since set would be worse than the gap it fixes."*

⇒ **Requirement 4 sharpens, and the sequencing matters more than the code change:**
- `uat` currently has **ZERO** sale items (see the log — the 10 rows there are freelance-teacher EXPENSE budgets
  with `external_ref = NULL`, not sale items).
- Therefore **if the Onewheel prices are corrected in code BEFORE `sale:ensure-items` is first run on `uat`, every
  item is created at the right price in one shot — no manual price editing anywhere.**
- If the script is run **first**, `course-onewheel-6` is created at the wrong **7,990** and, because the script
  never updates, it can only be corrected **by hand in the backoffice item screen**; `course-onewheel-10` would
  simply not exist until the code fix ships.
- [ ] **AC-8** — the deploy order is stated in the task and followed: **code fix → `sale:ensure-items` → verify
      `course-onewheel-6 = 7,900` and `course-onewheel-10 = 11,900` exist on the box.**

**Q2 is CLOSED** — no Onewheel was ever sold (owner's query returned nothing), so there is **no ฿90 history to
correct** and no owner decision is needed.
