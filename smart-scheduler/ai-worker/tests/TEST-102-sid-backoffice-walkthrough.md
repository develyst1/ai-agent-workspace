# TEST-102 — the sid back office (`backoffice-som`), used like an admin would: what it actually does

**Tester:** Tanya (QA) · **Date:** 2026-10-13 · **Env:** sid back office, headless · **Brief:** `inbox/QA.md` → "🔎 USE the sid back office like an admin would" · read first: `UNDERSTANDING-backoffice-2026-10-13.md` §1–§3
**Repos (read only, for the page list):** `smart-scheduler-backoffice-front` `6cf23f6` · `smart-scheduler-backoffice-back` `486b2d1`

**Login:** the existing sid back-office account from the QA access file (`admin`) ⇒ ✅ works; it lands on `/dashboard`. Nothing created or guessed.

**Writes (sid only, QA-marked):** ONE product `QA-102 น้ำดื่ม (ทดสอบ Tanya)` (id `85df3f77`), then ONE sale (OUT 3) and ONE return (IN 1). Net +฿40 in sid's P&L on 13 Oct.
- **There is no delete for items** (the back has no DELETE route; the edit form has an "active" switch). I left the item active so its effect stays visible. **Owner/Porter: say if you want it switched to inactive.**
- Nothing else was saved: every other form was opened, read and closed.

## The short answer: the four tasks the customer will want
| Task | Verdict | Why |
|---|---|---|
| **Record a sale** (Stock OUT) | 🟡 **PARTLY** | Items → **เข้า/ออก** → "ออก (ขาย/ใช้)" + quantity + an optional reason ⇒ revenue = qty × price, and stock goes down (QA: 3 × ฿20 ⇒ +฿60, 24 → 21). **Missing from her Stock OUT** (sheet §3.1): who bought, which coach gets the commission, price override, discount, payment type (Transfer/Cash/Card). **Commission does not exist anywhere.** |
| **See today's / this month's revenue** | 🟡 **PARTLY** | **P&L** has a date-range picker ⇒ "today" works (13 Oct ⇒ ฿40 = my QA sale; 12 Oct ⇒ ฿147,790), and so does a month. **Revenue by activity** is monthly only, by sport + by customer. **Missing:** her Type/Category split (COURSE · VOUCHER · ECA · SALES · F&B · RENT · OTHER), Branch, MTD/YTD, and Remark. ECA has no revenue at all. **The two pages disagree** (see F-2). |
| **Find a coach's pay** | 🔴 **IMPOSSIBLE** | The pay pages are not usable: **"ครู / Payroll" is a WAVE 3 placeholder**; **"เงินเดือนครูประจำ/พาร์ทไทม์" and "งบครูฟรีแลนซ์" fail to load** (404). None of the three is in the menu. Nothing shows salary, hours × rate, extra hour, OT, bonus, commission, fuel or merit. |
| **See stock** | 🟡 **PARTLY** | Items shows **คงเหลือ / เพดาน** for an item with a ceiling (QA water 22 / 24; an existing "น้ำเปล่า" 117 / 120). **"สต๊อกสินค้า (Mini ERP/POS)" is a WAVE 1 placeholder.** Missing:<br>• **receiving stock is not separate from a return** (F-1);<br>• no movement-history screen;<br>• no Demo stock or sites;<br>• no low-stock alert;<br>• no model code, category or picture;<br>• no import. |

## Every page

**In the menu (4):**

| Page | What it shows | Where the numbers come from | Notes |
|---|---|---|---|
| **งบกำไร–ขาดทุน** `/dashboard` (01, 08) | Net profit, margin %, income, expense; items sorted by value. Date-range picker (default: the 1st → today). | `GET /bo/reports/pl?from&to`: Σ of every item movement. 1–13 Oct: ฿459,410 (then ฿459,450 after my sale). **Expense ฿0**: nothing is ever recorded as an expense. | 13 rows, all INCOME. |
| **รายได้แยกตามกิจกรรม** `/revenue` (03) | A month picker and two tabs:<br>• **by sport:** Private SURFSKATE 74.6%, Bike/Scooter/Balance Cruiser, Private FREESKATE, Private INLINE SKATE, plus "unassigned" ฿104,800;<br>• **by customer:** student · courses · vouchers · one-time sessions · spend. | `GET /bo/reports/revenue-by-activity?month` and `/customer-spend?month`. These are the front office's sales only (see F-2). | "unassigned" = 5 vouchers ฿34,500 (normal: hours with no sport) **+ ⚠️ "รหัสสินค้าไม่รู้จัก" 12 sales ฿70,300**. That sum equals **all of October's camp + equipment-rental income** (Camp week 46,000 + Camp full day 13,000 + Camp half day 10,400 + rental 900). So camp and rental are labelled as an error. **The per-customer tab shows family names**, so I took no screenshot of it. |
| **รายการ (Items)** `/items` (02, 04–07) | 44 items, with filters ทั้งหมด / รายรับ / รายจ่าย and a รอบ (cadence) filter. Columns: name · type · price/unit · คงเหลือ/เพดาน · เข้า/ออก · แก้ไข. | `GET /bo/items` | 33 front-office price-card items (course/session/voucher/camp/rental, "smart-scheduler", VAT-inclusive) + **10 "ครูฟรีแลนซ์ <name>" EXPENSE items** (the freelance ceiling: price = hourly rate, คงเหลือ = hours left; 5 are QA coaches) + "probe-cleanup" (฿0, a leftover) + "น้ำเปล่า" (฿20, 117/120, someone's manual test). **Add form:** name · unit · direction (INCOME/EXPENSE, fixed after save) · cadence · price/cost · ceiling ("set = count stock") · owner ref ("e.g. teacherId"). **Edit:** the same plus **active**; unit and direction are locked. **No delete, no search, no history view** (clicking a row does nothing). |
| **แท็ก** `/tags` | Tag groups with values. | `GET /bo/tag-groups` | **4 groups all named "probe", all empty**: leftovers. No tag is used by any item. |

**Not in the menu (6, reachable by URL):**

| Page | What it shows |
|---|---|
| `/reports` "รายงานผู้บริหาร" | Placeholder text: **"WAVE 4 · API: /REPORTS/\*"**. No data, no API call. |
| `/inventory` "สต๊อกสินค้า (Mini ERP/POS)" | Placeholder: **"WAVE 1"**. Promises: product list · receive stock · a sale screen that cuts stock · movement history. |
| `/payroll` "ครู / Payroll" | Placeholder: **"WAVE 3"**. Promises: set coach rates · monthly summary · payroll run from real hours. |
| `/wallet` "Wallet นักเรียน" | Placeholder: **"WAVE 2"**. Promises: hours left · ledger · purchase approval queue · top-up. |
| `/ftpt-salary` "เงินเดือนครูประจำ / พาร์ทไทม์" | Error: **"โหลดเงินเดือนไม่สำเร็จ — ตรวจ Finance API พอร์ต 3002" · 0 ครู**. `GET /api/v1/recurring-costs` ⇒ **404** ×2. The "set a salary" button is there. |
| `/freelance-budgets` "งบครูฟรีแลนซ์" | Error: **"โหลดงบครูไม่สำเร็จ — ตรวจ Finance API พอร์ต 3002" · 0 ครู**. `GET /api/v1/catalog/items?…EXPENSE` ⇒ **404** ×2. The 10 freelance ceilings do exist (they are visible as items, above). |

## Back office vs the sid front office (by value)

| Check | Back office | Front office (sid, GET) | |
|---|---|---|---|
| **Vouchers sold 12 Oct** | P&L 12 Oct: Voucher (5h) **฿18,000 = 3 × 6,000** · Voucher (10h) **฿10,500 = 1** | QAChatTwo: **3 × 5h** expiring 2027-01-12 + **1 × 10h** expiring 2027-04-12 (= sold 12 Oct) | ✅ |
| **First Trial in October** | First Trial (1h) **1 × ฿1,390**; the per-customer tab: Meimei | FIRST_TRIAL 1–13 Oct: **1**, Meimei, ATTENDED | ✅ |
| **One-hour sessions** | Session 1h (bike-skate) **5 × ฿1,390** (posted 1–13 Oct) | SINGLE_SESSION **dated** 1–13 Oct, not cancelled: **6** (temp ×2, campkid2, Ally, เหมียว, ส้มตำ); the BO customer tab has temp ×1 | ⚪ The bases differ: the BO counts by **when the sale was posted** (revenue at confirm, `sale-post.ts`), the front office by the **class date**. So 5 vs 6 is not a mismatch by itself. |

The money reaches the back office from the front office's own code: `smart-scheduler-back` `lib/sale-post.ts` writes a `bo.movement` straight to the shared DB, one INCOME item per sale.

## Findings (facts, for the rebuild spec, not bugs to fix now)
- **F-1 🔴 "เข้า (รับ/คืน)" on an INCOME item is a negative sale.** IN 1 bottle ⇒ **P&L −฿20** and stock +1 (the dialog itself says "มูลค่าใน P&L: −฿20"). So **receiving 10 new bottles would subtract ฿200 from revenue**. There is no way to receive stock without touching revenue, and no cost price. This matches gap K-1 in UNDERSTANDING.
- **F-2 🟠 The two money pages disagree.** After my QA sale:
  - P&L 1–13 Oct = **฿459,450**;
  - Revenue by activity for October = **฿459,410**.

  Revenue by activity reads only the front office's sales, so a sale entered in the back office never appears in it.
- **F-3 🟠 Camp and rental revenue are labelled "⚠️ unknown product code"** in Revenue by activity: 12 sales, ฿70,300.
- **F-4 🟡 Expense side is empty.** Expense is ฿0. No salary, no freelance pay and no costs are ever posted. The freelance-ceiling items are EXPENSE items, but they count hours, not money.
- **F-5 🟡 Dead ends an admin will hit:**
  - 4 placeholder pages and 2 pages that fail to load (404, "Finance API port 3002");
  - none of these 6 is in the menu, so an admin can't find them;
  - no delete for an item, and no search.
- **F-6 ⚪ Leftover test data on sid:** 4 empty "probe" tag groups, a "probe-cleanup" item, "น้ำเปล่า" 117/120, plus now my QA-102 water.

Screenshots: `project-docs/backoffice-sid-walkthrough-2026-10-13/`:
- `01-dashboard.png` · `02-items-list.png` · `03-revenue-by-sport.png`;
- `04-items-add-form.png` · `05-items-movement-dialog.png`;
- `06-items-qa-product-created.png` · `07-sale-dialog.png`;
- `08-pl-after-qa-sale.png` · `08-pl-today.png` · `09-pl-date-picker.png`.

**No family names in any image.** The per-customer tab was not captured.

Scripts (scratchpad): `lib-bo.js`, `bo0`–`bo9.js`.

**Clean-up (Porter, 2026-10-13):** the QA product `85df3f77` was set **inactive** (Edit → untick "ใช้งาน (active)" → Save ⇒ `PATCH /bo/items/85df3f77` 200, `"active":false`). Nothing else was changed.
- **Fact:** an inactive item **still appears in the Items list exactly as before** (`… ฿20 22 / 24 ขวด เข้า/ออก แก้ไข`), with no visible marker, and its movements still count in P&L (+฿40 on 13 Oct). So "inactive" doesn't hide it from an admin.
