# REQ-063: ส่วนลด — แอดมินลดราคาให้ตอนขายคอร์ส/บัตรได้ ทั้งแบบ % และแบบบาท
- Status: READY_FOR_SA
- Priority: 🔴 **HIGHEST** — the customer is running a **Mother's Day promotion this month** and cannot record it
- Requested: 2026-08-22 by stakeholder (owner), relaying an urgent customer need
- Deadline: **the customer wants to use it today**

## ⚠️ READ THIS FIRST — the requirements below are the OWNER'S ASSUMED ANSWERS, not the customer's
The customer has **not** answered yet. The owner needed to move, so he answered Porter's four questions **as his
best guess** so the team could start. **Every line marked 🤔 is an assumption that must be confirmed before this is
called DELIVERED.** They are written down as assumptions on purpose — an assumption you can see is safe; one you
cannot is how REQ-044 happened.

| Porter's question | Owner's assumed answer |
|---|---|
| Which packages, how much, until when | 🤔 **Any package, any amount — chosen freely per sale**, not a fixed campaign |
| % or baht | 🤔 **Both** |
| Who may give it | 🤔 **An admin, on the frontoffice web** |
| Other discount kinds (sibling, loyalty, per-customer) | 🤔 **Not now** — *"แบบอื่นมันจะลึกลงมากกว่านี้ไปอีก"* |

**What that shape actually is, said plainly:** this is **not** a promotions/campaign engine. It is
**"the admin can knock money off this sale, and we record that they did."** That is a much smaller and much safer
thing to build today, and it still covers the Mother's Day promo — the admin applies it per sale.

## Problem / Goal
There is **no discount anywhere in the system** — verified, not assumed: searching `discount|ส่วนลด|promo|coupon`
across all four repos returns one unrelated i18n placeholder. And it is **structurally** absent:
`recordSale(externalRef, quantity, opts)` has **no amount parameter**; `sale-post.ts:85` computes
`saleMovement(quantity, item.unitPriceMinor)`. **Every sale posts the list price. There is nowhere for a discount
to go.**

Today the only way to run the promo is to change the catalogue price for everyone — which **loses the fact that it
was a discount at all**, and is now actively unsafe because `sale:reconcile-prices` (shipped today) reverts a
hand-set price back to the card.

**Goal: an admin can reduce the amount of a specific sale, and the books record both the full price and the
reduction — so "how much did the Mother's Day promo cost us?" is answerable.**

## Requirement
1. **On the create-course and create-voucher screens, an admin may enter a discount** — either a **percentage**
   or a **baht amount**. One or the other, never both at once.
2. **The screen shows the arithmetic before saving**: full price → discount → **amount payable**. Staff must see
   the number the customer will actually pay, not compute it in their head.
3. **A discount requires a short reason** (free text, e.g. `โปรวันแม่`). Without it, in three months nobody can
   tell a campaign from a favour, and the report becomes a number with no story.
4. **The books record BOTH the full price and the discount, never just the net.**
   The sale posts at list price exactly as it does today; the discount is a **separate negative movement** carrying
   the same `refId` as the sale. ⇒ gross, discount and net are each answerable, and **nothing about the existing
   sale path changes.**
5. **The discount is attributable to the same activity as its sale.** REQ-014 reports revenue by sport; if a
   discount cannot be traced to the same program, the per-sport figures overstate what was earned. It has the
   `refId`, so this is a resolution rule, not new data.
6. **Refusals, not silent clamping:** a discount may not exceed the sale amount, a percentage is 0–100, and a
   negative or malformed value is rejected with a message. **A sale must never post a negative amount.**
7. **Cancelling/reversing a sale reverses its discount too** — the two must never be able to drift apart.
8. **Only an admin may apply one**, and **who applied it is recorded** with the movement. A discount nobody owns is
   the one financial control this feature actually needs.

## Acceptance Criteria
- [ ] **AC-1** — **Given** an admin creating a 6-hour Onewheel course (7,900), **When** they enter **10%**,
      **Then** the screen shows `7,900 → −790 → 7,110` before saving, and after saving the books hold a sale of
      **7,900** and a discount of **−790**, netting **7,110**.
- [ ] **AC-2** — Same with a **baht** discount (e.g. `−500`), same three lines.
- [ ] **AC-3** — **Given** a discount with no reason, **When** they try to save, **Then** it is refused and says
      the reason is required.
- [ ] **AC-4** — **Given** a discount larger than the price, or a percentage above 100, or a negative number,
      **When** submitted, **Then** it is **refused** and **nothing is written** — no clamping, no zero-value sale.
- [ ] **AC-5 (reporting)** — The month's revenue report shows **gross, total discount, and net**, and
      **buckets + unattributed still equals the month total** (REQ-014's existing reconciliation must still hold).
- [ ] **AC-6 (attribution)** — A discount on an Onewheel course is attributed to **Onewheel**, not to an
      unattributed bucket.
- [ ] **AC-7 (regression)** — A sale with **no** discount posts **exactly as it does today**, one movement, same
      amount. This must be provable, because it is the path every existing sale uses.
- [ ] **AC-8 (reversal)** — Cancelling a discounted sale reverses **both** movements; the net returns to zero.
- [ ] **AC-9 (permission)** — A non-admin cannot apply a discount, **server-side** and not merely hidden in the UI.
- [ ] **AC-10 (audit)** — For any discount the report can say **who applied it, when, how much, and why.**
- [ ] **AC-11 (bilingual)** — TH/EN, no raw i18n key.

## User-facing wording (Porter as UX writer)
- Section label — TH: `ส่วนลด` · EN: `Discount`
- Type toggle — TH: `เปอร์เซ็นต์` / `บาท` · EN: `Percent` / `Baht`
- Reason field — TH: `เหตุผล (เช่น โปรวันแม่)` · EN: `Reason (e.g. Mother's Day promo)`
- Summary block — TH: `ราคาเต็ม {full} · ส่วนลด −{disc} · **ยอดที่ต้องชำระ {net}**` ·
  EN: `Full price {full} · Discount −{disc} · **Amount payable {net}**`
- Refusal (too large) — TH: `ส่วนลดมากกว่าราคาเต็มไม่ได้` · EN: `A discount cannot exceed the full price.`
- Refusal (no reason) — TH: `กรุณาระบุเหตุผลของส่วนลด` · EN: `Please give a reason for this discount.`
- Refusal (not admin) — TH: `เฉพาะแอดมินเท่านั้นที่ให้ส่วนลดได้` · EN: `Only an admin can apply a discount.`

## Constraints
- **Do not change the existing sale path.** The sale keeps posting the list price; the discount is additive. That
  is what makes AC-7 achievable and keeps today's revenue numbers meaning what they meant yesterday.
- **Never rewrite a posted movement.** A correction is a new movement, as everywhere else in this system.
- Prices stay in the catalogue (`sale-items.ts` → `bo.item`). **This REQ does not touch pricing** — and must not,
  now that `sale:reconcile-prices` treats the catalogue as the source of truth.

## Out of Scope (named, so they are refusals and not oversights)
- **Automatic discount rules** — sibling, loyalty, referral, per-customer pricing. The owner explicitly deferred
  these and they are a different, much larger design.
- **Promo codes / campaign management** — no codes, no date windows, no usage limits. An admin applies the promo
  by hand, per sale, which is exactly what the assumed answers describe.
- **Discounting a trial or single session.** Those post revenue at **day-end from a job** (`jobs.service.ts:99`),
  not from a form with an admin present, so a discount has no natural moment or author. **Named here so it is a
  stated boundary, not something discovered missing later.** If the customer wants it, it is its own REQ.
- Changing catalogue prices; and anything about VAT beyond Q4 below.

## Questions
- **Q1 (to SA):** is the acting user's identity available server-side at the create-course / create-voucher seam
  (for AC-9 and AC-10)? If there is no admin/staff distinction today, **say so** — then AC-9 becomes its own small
  piece of work and Porter will scope it rather than let it be quietly dropped.
- **Q2 (to SA):** the cleanest home for the discount movement — a dedicated `discount` INCOME item, or a negative
  movement on the sale's own item? Whichever makes **AC-5's reconciliation and AC-6's attribution** work without
  special-casing REQ-014. Porter's lean is a dedicated item carrying the sale's `refId`, but this is your call.
- **Q3 (to owner → customer):** all four answers above are **assumptions**. The one most likely to be wrong and
  most expensive if it is: **is this really per-sale-manual, or does the customer picture "set the promo once and
  it applies automatically"?** Those are different products. Porter will confirm; the build does **not** wait.
- **Q4 (to owner):** VAT — the card prices are **VAT-inclusive**, so a discount reduces the VAT-inclusive amount.
  Confirm that is what their accounts expect.

---

## ✅ Q4 ANSWERED — 2026-08-22 (VAT)
Owner: *"ป้ายราคาติดหน้าร้านแบบนี้ ส่วนใหญ่จะรวม VAT ไปแล้ว ฉันคิดแทนลูกค้าที่มาใช้บริการ"* — i.e. the price card is
**consumer-facing retail pricing**, and the number on it is what the parent actually pays.

⇒ **The discount reduces the VAT-INCLUSIVE amount.** A 10% discount on 7,900 is 7,110 **paid**, not 7,900 less
10% of some ex-VAT figure. This is ordinary retail behaviour and it is what the customer's own price card already
promises the public.

**It also agrees with what the code already asserts**, which is the useful part — this is a confirmation, not a new
rule: `sale-items.ts` — `export const PRICES_ARE_VAT_INCLUSIVE = true`, with the standing instruction *"post it
as-is; never add tax on top. Any net-of-VAT figure must be **derived** from these, never assumed."*

⇒ **Nothing in this REQ needs a VAT field, a VAT calculation, or an ex-VAT price.** The discount arithmetic happens
entirely on VAT-inclusive figures, and if their accountant ever needs the split it is **derived from the amount
actually paid** — exactly as it is derived today from the undiscounted amount. **Same rule, one fewer thing to
build.**

⚠️ **One line for the owner to keep, not a task:** if their accountant later says the VAT split must be computed a
particular way for discounted sales, that is a **reporting** question, not a change to how the discount is stored
— because we keep gross, discount and net separately (requirement 4). **Storing all three is what keeps that
question answerable later.**

---

# 🔴 SCOPE CORRECTED — 2026-08-22, the customer answered. **I had the scope backwards.**
The customer's reply (relayed by the owner, lightly out of order):
> *"0 999 จาก 1390 ทุกกิจกรรม ยกเว้น Onewheel, Balance Play (ถึง 31 สค นี้)"*
> *"1 ลด ขอเป็น % หรือใส่ราคาลดไปเลยยอดเท่าไหร่"*
> *"4 ลดจาก 1st / 1 HR / course ไม่รวม voucher"*
> *"รวม vat"*
> *"แต่ถ้าเรามีรูดบัตร อาจจะบวก 3%"*

## The correction, stated first because everything else depends on it
**This REQ scoped the discount to COURSE + VOUCHER, and explicitly ruled 1st Trial and single sessions OUT.**
**The customer wants the exact opposite set:**

| | My assumed scope | **What the customer actually wants** |
|---|---|---|
| **1st Trial** | ⛔ out of scope | ✅ **IN — and it is the whole promo** |
| **Single 1-hour session** | ⛔ out of scope | ✅ **IN** |
| **Course** | ✅ in | ✅ **IN** |
| **Voucher** | ✅ in | ⛔ **OUT — explicitly excluded** |

**And the reason I excluded them is exactly what makes this hard, so it does not go away by being wrong about
the scope:** trial and single-session revenue posts **at day-end, from a job** (`jobs.service.ts:99`), not from a
form with an admin present. **That was a real constraint. It is now a design problem to solve rather than a
boundary to hide behind.**

## The actual promo
**1st Trial 1,390 → 999**, on **all activities EXCEPT Onewheel and Balance Play**, **until 31 August**.
(1,390 is `FIRST_TRIAL_MINOR`; a trial on Onewheel/Balance Play stays full price.)

⚠️ **Worth saying once and not relitigating:** a fixed price, on a fixed product, for a fixed period, is precisely
what a *campaign* would express. With per-sale manual discounting the admin retypes it on **every trial booking
for a month**, and a mistyped or forgotten one is silent. The owner has chosen manual for now and that is
buildable today — but this promo is the argument for the campaign REQ, and it should be raised once this ships.

## Requirement changes
- **R1 replaced:** the discount is entered by an admin **when the thing is booked/sold** — on the
  **1st Trial**, **single-session** and **course** paths. **Vouchers are out** (customer's explicit exclusion).
- **R9 (new) — the discount travels with the thing that was sold, not with the form.**
  A trial or single session posts its revenue **at day-end**, so the discount must be **recorded on the booking at
  creation** and **read by the day-end job** when it posts. A course records it on the course and posts at sale.
  **One rule, two posting moments** — this is the crux of the build and where SA's design effort belongs.
- **R10 (new) — an excluded program cannot be discounted by accident.** Onewheel and Balance Play are excluded
  from *this* promo, but the admin types the discount by hand, so the system cannot know that. ⇒ **do not** encode
  the promo's exclusions in code (they expire on 31 Aug). Instead: **the reason field carries the promo name**, and
  the report can show discounts by reason — so a wrongly-discounted Onewheel trial is *findable*, not prevented.
  **Stated deliberately: we are not building campaign rules, so we cannot enforce campaign exclusions.**

## Acceptance Criteria — changes
- **AC-1/AC-2 restated** on the promo's real case: a **1st Trial at 1,390 with a 999 promo price** records a sale
  of **1,390** and a discount of **−391**, netting **999**.
- **AC-12 (new)** — a discounted **1st Trial** and a discounted **single session** post correctly **at day-end**,
  with the discount applied, and are **idempotent** on a re-run of the job (the existing `rev:<bookingId>` key).
- **AC-13 (new)** — a **voucher** sale offers **no** discount field at all, and the voucher path is byte-identical
  to today.
- **AC-6 restated** — a discounted trial is attributed to the **program that was taught**, not to an unattributed
  bucket.
- ~~AC-8 reversal~~ still applies, and now also to a booking cancelled **before** day-end: **no sale posts and no
  discount posts** — nothing half-written.

## ✅ VAT — confirmed by the customer: *"รวม vat"*
Matches the owner's answer and `PRICES_ARE_VAT_INCLUSIVE = true`. **No VAT field, no VAT maths.** Unchanged.

## 🆕 Card surcharge — NOT part of this REQ
> *"แต่ถ้าเรามีรูดบัตร อาจจะบวก 3%"*

**"อาจจะ" — this is a maybe, not a decision, and it is not a discount.** It is a **payment-method surcharge**: the
mirror image (a positive adjustment), tied to *how they paid* rather than *what they bought* — which means it also
implies recording a payment method, which the system does not do today.

**Deliberately NOT folded into this REQ.** Bolting an unconfirmed "maybe" onto an urgent build is how urgent builds
slip. **Porter will raise it as its own REQ once the customer confirms they actually want it** — and the mechanism
built here (an adjustment line beside the sale, carrying a reason) is the same shape, so it will be cheap when it
comes. **Flagged, tracked, not built.**

## Question the correction raises
- **Q5 (to SA, replacing my out-of-scope note):** where should the discount live so that **both** posting moments
  read the same value — fields on `bookings` and `course_packages`, or a small adjustment table keyed by the thing
  sold? This needs a migration either way; say which is smaller and which is more honest. **Porter's lean: on the
  rows themselves**, because a separate table for one value per sale is a join nobody will remember.

---

# ✅ FINAL SCOPE — owner's decision, 2026-08-22: **ALL FOUR sale types**
> *"ไม่ๆ ฉันว่าเอาหมดไปเลย ที่นายเดา และที่เขาต้องการจริงอ่ะ เพราะเขาคิดเร็วไป ในอนาคตเขาอาจจะมีโปรลดของพวกนั้นด้วยก็ได้"*

**The customer was answering about *this month's promo*, not about what the product should support.** The owner is
right, and the reasoning is worth keeping: excluding vouchers now does not save work, it **defers** it — and the
next promo brings the whole build back for one field.

| Sale type | In scope | Where the sale posts |
|---|---|---|
| **1st Trial** | ✅ | **day-end job** (`jobs.service.ts:99`) |
| **Single session (1 HR)** | ✅ | **day-end job** |
| **Course** | ✅ | **at creation** (`scheduler.service.ts:1108`) |
| **Voucher** | ✅ | **at creation** (`scheduler.service.ts:1428`) |

**⇒ Four sale types, but only TWO posting moments.** That is the whole shape of the build, and it is why adding
vouchers back costs almost nothing: **a voucher is the course's shape, and a single session is the trial's shape.**

### Requirement changes
- **R1 (final):** an admin may apply a discount when booking/selling **any** of the four. Nothing is excluded.
- **R9 (unchanged, and now the core):** the discount is **recorded on the thing sold at booking/sale time** and
  **read by whoever posts the revenue** — immediately for course/voucher, at day-end for trial/single session.
  **One rule, two posting moments.**
- **AC-13 REVERSED:** was *"a voucher offers no discount field"*. It now reads: **a voucher sale accepts a discount
  and posts gross + discount exactly as a course does.**
- **AC-12 stands** (trial and single session post correctly at day-end, idempotent on `rev:<bookingId>`).

### One thing NOT included, raised rather than assumed
**Equipment rental** also posts a sale (`rental.service.ts:20` → `recordSale(code, hours, …)`). It appeared in
**neither** the customer's list nor Porter's, so it is **not** in scope — but the owner's own argument ("they may
want to discount those later") applies to it just as well. **Q6 to the owner: include rentals, or leave them?**
Porter's lean: **include** — it is a fifth call site of a mechanism that will already exist, and the alternative is
this exact conversation again in a month. **Not building it until he says.**

---

## ✅ Q6 ANSWERED — owner, 2026-08-22: **"เอา"** ⇒ equipment rental is IN
**FINAL, COMPLETE SCOPE — five sale types, still only two posting moments:**

| Sale type | Posts | Call site |
|---|---|---|
| Course | at creation | `scheduler.service.ts:1108` |
| Voucher | at creation | `scheduler.service.ts:1428` |
| **Equipment rental** | at the moment it is recorded | `rental.service.ts:20` |
| 1st Trial | **day-end job** | `jobs.service.ts:99` |
| Single session (1 HR) | **day-end job** | `jobs.service.ts:99` |

⇒ **@Sober: design for the two moments, not the five types.** Everything in the top group shares one shape;
everything in the bottom group shares the other.

⚠️ **One difference in the rental path SA must not miss:** rentals post with **`quantity = hours`**
(`recordSale(input.code, input.hours, …)`), whereas every other sale posts `quantity = 1`. So the amount a discount
applies to is **hours × unit price**, not a single unit price. A percentage is unaffected; **a baht discount must
be checked against the line total, not the hourly rate** — otherwise AC-4's "cannot exceed the sale amount" guard
is wrong for exactly this one path, and wrong in the direction that lets money leak.
- [ ] **AC-14 (new)** — a baht discount on a 3-hour full-set rental (3 × 200 = 600) is validated against **600**,
      not 200; and a discount above 600 is **refused**.

---

# 🔴 BLOCKING DEFECT — found by @Tanya, 2026-08-22: **the Baht field is entered in SATANG**
**This breaks the exact promotion REQ-063 was built for, on day one.**

**Verified in code, not relayed:** `front/src/lib/scheduler/discount.ts:59` — for `kind: "BAHT"`,
`discountMinor = value` — **the typed number is used as minor units.** `fullMinor` for ฿7,900 is **790,000**.

| Staff types | They mean | They get |
|---|---|---|
| `391` (the Mother's Day promo: 1,390 → 999) | **฿391 off** | **฿3.91 off** |
| `500` | ฿500 off | ฿5 off |
| `8000` | ฿8,000 off | ฿80 off |

**And no guard catches it**, because the value is *valid*: `391 < 790,000` passes the "cannot exceed the full
price" check. **Refuse-never-clamp does not help — there is nothing to refuse.** The sale posts, the books balance,
and the customer is simply overcharged by ~99% of the intended discount. **Silent wrong money — the exact class
this REQ spent all day guarding against, arriving through the one field nobody thought to unit-check.**

`PERCENT` is correct (`percentOf(fullMinor, value)` takes a human percent), which makes it worse: **the two halves
of the same control take different kinds of number.**

## Decision — Porter's call, no round trip needed
**The Baht field takes BAHT.** Reasons, so it is not re-litigated:
1. **Every number the user sees is baht** — `ราคาเต็ม 7,900`, `ยอดที่ต้องชำระ 7,110`. A field in the middle of that
   summary taking satang is indefensible.
2. **The customer expresses their promo in baht** — *"999 จาก 1390"*. Staff will type `391`.
3. **`PERCENT` already takes a human number.** Consistency within one control is not a preference.
- [ ] **AC-15** — entering `391` in the Baht field on a ฿1,390 item produces **`−391`** and **`ยอดที่ต้องชำระ 999`**;
      entering `8000` on a ฿7,900 item is **refused** as exceeding the full price.
- [ ] **AC-16** — the field's label/placeholder states the unit, and no example implies satang.
- **Q7 (to SA):** the wire contract — does the **server** also read `BAHT.value` as minor? If so, decide whether
  the conversion happens at the FE edge or the contract changes to baht, and **make both sides agree in one
  change.** Two sides disagreeing about a money unit is how this defect got here.

⛔ **This blocks the `uat` lift.** Shipping the discount feature with a 100×-wrong baht field would be worse than
shipping no discount feature — staff would believe they had given a discount they had not.

---

## ✅ AC-9 CLOSED as **not testable today** — owner, 2026-08-22
> *"ไม่มี · admin ⇒ use frontoffice · accounting + board member ⇒ use backoffice"*

**There is no non-admin user on the frontoffice.** The two systems have different audiences:
| System | Who uses it |
|---|---|
| **frontoffice** (`som` / `frontoffice`) — selling, scheduling, discounts | **admin only** — shop staff, one role |
| **backoffice** (`backoffice-som` / `backoffice`) — money, P&L | **accounting + board members** |

⇒ **AC-9 ("a non-admin cannot apply a discount") cannot be exercised**, because the user it describes does not
exist. **This is closed as untestable-today, NOT as passed** — the difference matters: nobody has proven the guard
works, and nobody can until such a user exists.

**The guard stays exactly as built** (`assertMayDiscount` → 403 server-side, `discount-plan.ts:147`). It is correct
defensive code: the day a second role appears, the rule is already enforced rather than remembered. **Keeping it is
free; removing it because it cannot be tested today would be exactly backwards.**

- [x] **AC-9 — CLOSED (untestable today).** Re-open the moment a non-admin frontoffice role exists.
