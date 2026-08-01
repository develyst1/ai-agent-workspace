# REAL PRICE LIST — supplied by the stakeholder 2026-08-01

> Source: two official price cards sent by the project owner (course/program card + voucher card).
> **This supersedes every placeholder price in the system.** Recorded by Porter (PM).
> ⚠️ Prices are in **THB, tax treatment not stated** — see Open Questions.

---

## 1. Programs & packages (course card)

| Age | Program | 1 HR | 4 HRS | 6 HRS | 10 HRS |
|---|---|---|---|---|---|
| ALL | **1st Trial** *(equipment incl.)* | **1,390** | — | — | — |
| 2+ | Bike / Scooter · Balance Cruiser | — | **4,790** | **6,490** | **9,790** |
| 5+ | Surfskate · Freeskate · Skateboard · Inline Skate *(equipment incl.)* | — | **4,790** | **6,490** | **9,790** |
| 5+ | **Onewheel E-Skate** *(equipment incl.)* | **1,690** | **5,790** | **7,990** | ❌ **not offered** |
| 2+ | **Balance Play (PRIVATE 1:1)** | **1,390** | ❌ **not offered** | **7,490** | **11,390** |
| 4+ | **Balance Play (GROUP)** | **1,090** | ❌ **not offered** | **5,290** | **7,790** |

**Equipment rental** (separate revenue stream — *not modelled in the system at all*):
- Full set (ride + helmet + pads): **200 / hr**
- Ride only **150 / hr** · Helmet **50 / hr** · Pads **50 / hr**

## 2. Vouchers (voucher card)

| Hours | Price | Per hour | Validity |
|---|---|---|---|
| 5 h | **6,000** | 1,200 | 3 months |
| 10 h | **10,500** | 1,050 | 6 months |
| 15 h | **13,500** | 900 | 9 months |

- ✅ Validity 3 / 6 / 9 months **matches what the system already enforces.**
- ❌ **Excludes equipment rental.**
- ❌ **A voucher CANNOT be used for "Onewheel class".**
- ❌ **A voucher CANNOT be used for "Balance Play".**
- ⚠️ The card is headed **"Today – 30 June 2026"**, a window that has **already closed** (today is 2026-08-01).
  Confirm whether these are still the current prices — see Open Questions.

---

## 3. 🔴 The structural finding — this is not just "fill in the numbers"

**The system stores ONE price per package size** (`course-4`, `course-6`, `course-10`, `voucher-5/10/15` —
`lib/sale-items.ts`). **The real price list is priced per _program × package_.** A 6-hour package is:

| Program | 6 HRS |
|---|---|
| Bike / Skate family | 6,490 |
| Onewheel | 7,990 |
| Balance Play (private) | 7,490 |
| Balance Play (group) | 5,290 |

**One `course-6` code cannot hold four different prices.** Same for 10 h (9,790 / 11,390 / 7,790) and for a
single 1-hour session (1,090 / 1,390 / 1,690).

**Two consequences, and the second is the one that matters most right now:**
1. The sale item catalogue has to become **program × package**, or the price must be resolved from the
   booking's program at sale time. HOW is the SA's design — this doc only establishes that six codes are not
   enough.
2. 🔴 **REQ-014 is "revenue by activity (sport)". If a sale doesn't record which program it was, revenue can
   never be split by sport — the REQ is unbuildable on the current item model.** This is being built *now*
   (TASK-064/065), which is why this doc is going up immediately rather than at the end of the price discussion.

**Also missing from the model:** package availability is **not uniform** — Onewheel has no 10 h, Balance Play
has no 4 h — but the system offers 4/6/10 for every program, so **staff can sell a package that doesn't exist.**
And the two voucher exclusions (no Onewheel, no Balance Play) appear to have no equivalent in the system.

---

## 4. How wrong the placeholders were

Placeholder = ฿1,390 × hours (`PLACEHOLDER_HOURLY_MINOR`). Against the standard skate/bike family:

| Code | Placeholder | Real | Error |
|---|---|---|---|
| `first-trial` | 1,390 | **1,390** | ✅ **correct** |
| `single-session` | 1,390 | 1,090 / 1,390 / 1,690 | depends on program |
| `course-4` | 5,560 | 4,790 | **+16 %** |
| `course-6` | 8,340 | 6,490 | **+29 %** |
| `course-10` | 13,900 | 9,790 | **+42 %** |
| `voucher-5` | 6,950 | 6,000 | **+16 %** |
| `voucher-10` | 13,900 | 10,500 | **+32 %** |
| `voucher-15` | 20,850 | 13,500 | **+54 %** |

**Every placeholder overstates revenue, and the error grows with package size** — exactly as the engineer
predicted when he flagged that his derivation assumed no bulk discount. He was right, and the reason is visible
in the real card: the whole point of a bigger package is the **falling per-hour rate** (1,198 → 1,082 → 979 for
courses; 1,200 → 1,050 → 900 for vouchers), which a flat hourly placeholder cannot express.

---

## 5. Open questions for the stakeholder

1. ~~Is the voucher card still current?~~ ✅ **ANSWERED 2026-08-01 — YES, these prices stand** despite the
   *"Today – 30 June 2026"* header. Use them.
2. ~~Before or after VAT?~~ ✅ **ANSWERED 2026-08-01 — VAT INCLUSIVE.** Every figure on both cards is the
   **final price the customer pays.** Post these amounts as-is; do **not** add tax on top, and do **not** treat
   them as net. If a VAT-exclusive figure is ever needed for reporting, it must be **derived** from these — the
   gross number is the source of truth.
3. **Equipment rental (200 / 150 / 50 / 50 per hour) — should it be recorded as revenue too?** It is real
   income that the system currently has no concept of. Not urgent, but it is missing from every revenue report
   we are building.
4. **Should the system refuse to sell a package that doesn't exist for that program** (Onewheel 10 h, Balance
   Play 4 h), and refuse to spend a voucher on Onewheel / Balance Play? Today nothing stops either.
