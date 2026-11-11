# PLAN 2026-11-11: GR round 5 — who builds what on the GR web (final-ui, mock only)
Sober (SA, Team A), for Porter. Source: ขวัญ's verbatim (`project-docs/customer-2026-11-11-line-som-system/khwan-backoffice-feedback-2026-11-11-VERBATIM.md`, numbers = her points) + Porter 2026-11-11 19:14 (A)(B). Split by the GR claim lines (board, REQ-5011). **Team B and Team C slices are for Porter to route to Silver / Sector** — SAs don't message each other (PROTOCOL:125). Loop per team: build → its SA reviews → I rebuild the single file → Otto → Tanya LIVE.

## Shared shell — Sober (doing now)
- **#1 menu order:** NOTIFICATION + SETTING move to the bottom, REPORT last. A group order in the shell (`registry.ts`) — no page-list edits.
- **#3 "REPORTS" → "REPORT":** a display label in the shell; the group key stays (no edits to Team C's page list).
- **Collapsible left-menu groups** (l.128): each group heading folds/unfolds; remembered in this browser.
- ⏸️ **HELD (Porter 19:18, owner decides): the per-menu tick list is NOT shown.** The seam below is built but invisible — round 4's single "Revenue Visible" switch drives it (all REVENUE pages on/off), behaviour unchanged.
- **(B) demo seam — per-menu permissions:** replaces round 4's single Revenue switch. Per admin, a set of granted menu pages; CEO = all; coach fixed. **Never-grantable (CEO-only):** Pay run, Payment Detail, Payment Setting, Salary Report, Daily Training Report (salary money) — see the risk note in the CHECK file. Default grants = what each admin sees today (+ Khwan = all 6 REVENUE pages, carried over from round 4). Hook `useMenuGrants()` for the tick UI.

## Team A — Fern → TASK-949 (cut)
- **#2** menu + page title "Pay run" / "Pay run · Monthly overview" → **"Monthly Payment"**.
- **#5 Payment Detail:** "Add an Other ± line" → "Add an Other ±"; fields stacked vertically (not side by side); "Negative = a deduction" under the amount field; the whole add block moves under the Other ± lines.
- **#10 User Setting:** remove the intro paragraph; "Can see Revenue" → **"Revenue Visible"** (the round-4 switch stays; the per-menu tick list is HELD); "Actions" → "Action"; "Admit a login" → "Accept Login" and remove the dialog's intro text; "Front-office username" → "Front-office Username".

## Team B — Fanta (Porter → Silver)
- **#4 Employee:** balance the columns; move Base salary to line up with the other rows.
- **#6 Other Income:** the CEO sees the same page as the admin (no "go back" pointer). Note: Merit is CEO-only (round 3), so the CEO's view shows the Merit card, the admin's doesn't.
- **#7 Daily Training Report:** balance the rows.
- **#8 Salary Report:** balance rows; "Teaching" → "Teaching (HR)" with no .00; "Pay" → "Payment"; "Camp (hours)" → "Camp (HR)"; grid lines on the Payment table; remove "Classes", keep only Total.
- **#9 Notification Setting:** "Gets" → "Visible"; remove "In the web".
- **#13 Product:** restore the image field; **commission group = a dropdown** of the groups made in Payment Setting (no typing); revenue category stays as is (she fills it later).
- **#14 STOCK OUT:** remove the top "Items" word; the Product box is searchable; Save at the very bottom (one vertical flow).

## Team C — Flash (Porter → Sector)
- **#11 Revenue Summary:** "Apply filters" → "Apply Filter"; add **Unit** before Total on the top box (e.g. "Course 10 / 97,900").
- **#12 Revenue Summary:** a second box under it — **Category / Unit / Revenue**, all categories at once, no filter clicks (her example l.115–119).
- **#15 Stock Demo:** balance the rows.
- **"Add Demo" (Porter GO 19:18; her l.80):** an **"Add Demo"** button on Stock Demo → dialog: **Item** (pick an existing demo item, or type a new name + category) · **Location** (site) · **Qty** (> 0) · **Reason** (required) → that site's balance goes up by Qty and a history row of type **"Add"** appears (who/when/item/qty/to/reason). Mock state only. No "Proposed" badge — Porter GO. (Real build later ≈ 0.5 d: one more demo movement type on `routes/demo.ts`.)
- **#16 Conversion:** "Total: 7 conversions · 500 ฿" → "Total: 7 (Bonus 500 ฿)"; spacing; "Conversion" → "Type"; "Bonus" → "Amount"; **menu: under SALARY, before Other Income, named "Bonus (Conversion)"** (a group/order/title change in Team C's own `pages/proposed/index.ts`). **Porter 19:23: DROP the "Proposed" banner** (she treats it as a real Salary page).

## Not in round 5
TASK-945 (front-office proposed pages) stays HELD. Real-code per-menu RBAC = owner decision (CHECK file).
