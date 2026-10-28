# TEST-128: REQ-133 Deliverable 1, the final UI, Team B's 14 pages (TASK-751 / 752 / 753). Built file, offline, headless

- **QA:** Tanya
- **Date:** 2026-10-27, ~22:35–23:10 Bangkok
- **Brief:** Porter's "GO: REQ-133 Deliverable 1, Team B" in `inbox/QA.md`
- **File:** `som-balance-backoffice-spec/final-ui/dist/index.html`, 1,243,498 B, md5 **`3738636a3906c754ce9b62795fb01d4f`**, built 22:27.
- **How:** headless Chrome, `file://`.
  - Every Team B page as CEO; the 7 Stock pages also as Admin; all 14 routes as each role.
  - Every control on every page clicked from a fresh load.
  - Screenshots in my scratchpad (not in the repo).
- **Scope:** Team B only (REVENUE ×6, STOCK ×7, REPORTS ×1). Team A's pages are still being built.

## Verdict: ✅ PASS (Team B) · ⚪ one note for Team A (outside this gate)

| Gate | Result | |
|---|---|---|
| Opens offline | `file://`; **0 network requests** | ✅ |
| Console | **0 errors, 0 warnings, 0 page errors**: at load, on all 14 pages, during ~140 control clicks and the STOCK OUT run | ✅ |
| All 14 reachable from the menu | as CEO the menu lists all 14: Revenue Summary · Detail · Add Manually · Refund · Type and Category · ECA Payment · Product · STOCK IN · Import from Excel · STOCK OUT · Stock Demo · Low Stock · Stock Report · All Report | ✅ |
| **No dead control** | **0 dead** on 14 pages (~126 controls as CEO). My first pass flagged 13 as "nothing changed". I inspected each one: **11 were number-input steppers** (they change the input's value, not the page text), **1 was the Student field's clear (×) button** (it clears the value), and **1 was the "All" tab on Product, already active** (clicking it again changes nothing, as it should). All live | ✅ |
| Thai | Noto Sans Thai bundled; the Thai toasts and notes render (e.g. *"บันทึกแล้ว: ตัดสต็อก 3 รายการ + รายได้ SALES +4,800 ฿ และ F&B +100 ฿ (ส่วนลดคิดแยกตามรายการ)"*); no boxes | ✅ |
| 375 px | **0 of 14 pages** scroll sideways (`scrollWidth` = 375) | ✅ |

### Roles (the header "Viewing as" switcher; each route also opened directly)
| Role | Team B pages in the menu | Each route opened directly | |
|---|---|---|---|
| **CEO** | all 14 | all 14 open | ✅ |
| **Admin** | **the 7 Stock pages only** (no REVENUE, no All Report) | Stock ×7 open; Revenue ×6 + All Report show the shell's *"This role cannot see this page"* | ✅ |
| **Coach** | **none** | all 14 show *"This role cannot see this page"* | ✅ |

- **Hidden, never locked:** 0 🔒 / "CEO only" / "Locked" / "HIDDEN" on any page for any role.
- **The Admin's 7 Stock pages:** no revenue figure and no pay / salary / slip words.
  - STOCK OUT's save toast for the Admin is *"บันทึกแล้ว: ตัดสต็อกแล้ว + บันทึกการขายแล้ว"*, **without** the revenue amounts the CEO's toast shows ✅.
  - The Product COMMISSION rate column shows for the Admin: known, Silver's ruling (a rate, not anyone's pay).

### STOCK OUT, by behaviour
| Check | Result | |
|---|---|---|
| A cart | it opens with 2 lines; **Add item** adds a 3rd; each line has a product, qty, its own discount, its price and a delete | ✅ |
| **Per-item discount, ฿ and %** | line 1 Miller skate 3,900 at **10 %** ⇒ **3,510**; line 2 Snack 3 × 50 = 150 at **50 ฿** ⇒ **100**; line 3 helmet 1,290 at 0 ⇒ 1,290; **Price 4,900** = the sum. No bill-level discount (Khwan, v3: *"discount ต้องสามารถใช้กับสินค้าแต่ละชิ้น ไม่ใช่ลดทั้งบิลค่ะ"*) | ✅ |
| **Commission edited per item: lower AND raise** | Miller skate (100, split Ton 50 / Ploy 50): **Ton lowered to 40, Ploy raised to 75**, both accepted and kept. The helmet line keeps its own 20 / 20 | ✅ |
| **A discount doesn't change the commission** | setting 10 % / 50 ฿ left every commission input as it was. The page says so in Thai: *"หากมีส่วนลด ค่าคอมยังเท่าเดิม แก้ค่าคอมของแต่ละรายการให้ลดหรือเพิ่มได้เอง"* | ✅ |
| Save | the toast splits the revenue by type: SALES +4,800 (3,510 + 1,290) and F&B +100. Admin: no amounts (above) | ✅ |

### No real names
- **Staff:** only the invented map (Ton / Ploy / Nam / May …) on every Team B page.
- **0 hits** for her real staff / admins / coaches (Kid, Poo, Kung, Bank, London, Nelson, ฟีน, and every sid / uat teacher nickname I know).
  - The one hit, "Camp" on Detail, is the revenue type ("Balance Camp, week 1"), not a person.
- **Children:** only invented nicknames: น้องมะลิ, น้องภูมิ, น้องข้าวหอม.
- Branch / school codes (Bravo, STA, ABC, RIS, WA (Abbey), KIS) are business places, not people.

### Against Khwan's v3 notes (REQ-122 §10), where they touch Team B
- STOCK OUT's discount is per item, not per bill ✅.
- The Admin's commission can be lowered or raised ✅ (the brief's ruling on her 10-21 / 10-25 conflict).
- The commission is unchanged by a discount ✅.
- The Admin sees no revenue ✅.
- I didn't re-verify every v3 word page by page: the brief's gate items are covered above.

### Known, not a fail (from the brief), seen as described
- Detail's month total (rows 14–16 Oct) differs from the Summary's typed MTD, and it's labelled on screen.

## ⚪ For Team A (outside this gate): the shell's sidebar shows internal item codes
- **The sidebar shows** *"F1 · Branch for booking"* and *"F2 · Payment Method"* (seen in every Team B screenshot, since the sidebar is shared).
- **CONVENTIONS §2.8:** *"No internal item codes on screen (F1, D3, C-j …): the menu shows the plain page name only."*
- Those are Team A's menu items, still being built, so it's for their gate; not counted against Team B.
