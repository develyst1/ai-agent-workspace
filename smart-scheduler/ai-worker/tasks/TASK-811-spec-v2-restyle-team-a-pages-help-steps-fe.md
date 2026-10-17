# TASK-811 — FE: **clickable spec v2: restyle Team A's 12 pages + write their [?] help steps** (REQ-122 §5) — @Fern (M ≈ 2.2 d incl. +10 percent)
**From @Sober to @Fern, 2026-10-16.** After TASK-810's shell + CONVENTIONS v2. Your 12 pages: Salary ×8 · Notifications ×2 · Front office changes ×2 (F3, F6).

## Build
1. **Restyle each page with the v2 classes only**, so it reads like a real screen of our product:
   - page header with title + actions; cards, tables, badges, tabs, modals as in the real front;
   - **no explanation text in the body.** What the v1 side panel said now lives in the [?] steps.
2. **Every page's \`help\`:**
   - \`img: "help/<route-slug>.png"\` (the file will not exist yet; the placeholder shows);
   - **3–6 numbered Thai steps** in plain customer words, saying what to look at and what each button does (no tech words);
   - **\`pins: []\` for now.** Pins come in TASK-812, after Tanya's screenshots;
   - **Person profile has no A/B question** (QS13 answers it).
3. **Keep everything v1 proved:**
   - the role visibility: Admin sees no pay (QS13 / R0.2); Coach sees only My slip + own inbox;
   - every button wired; the fixed example numbers, unchanged (FT 23,139 · Kid 11,550 · Poo 15,600 · STA 144 …);
   - children as น้องเอ/บี/ซี.

## ✅ Done means
- 12 pages × 3 roles, desktop + 375 px: 0 console errors, 0 dead buttons, open/blocked exactly as v1.
- **Admin: no money on any Salary page** (Admin entries: only its own typed items).
- Every page's [?] opens with its steps and its feedback.
- Report: a page → number-of-steps list. I re-check `CHECKLIST.md` against it.

---
## 📋 @Fern REPORT — 2026-10-16 — 🔨 TASK-811 BUILT (my 12 pages in v2), ready for @Sober
Files: `data/a-salary.js` (helpers: real tabs, status badges, one-card grouped slip) · `pages/a-salary/*` (8) · `pages/a-notify/*` (2) · `pages/a-frontoffice/*` (2). Every page now: **v2 classes only** (cards, tables, badges, tabs, buttons filled/light/default/subtle, key-value settings tables) · **page-header `actions`** where a page has main buttons · **no explanation text in the body** (the Pay-settings rules are now settings tables; the Admin-entries "cannot see the total" is a locked "Slip total" field) · **`help.steps` (Thai, plain)** and **`pins: []`**; `th` is no longer used anywhere in my pages. **No A/B question on any of my pages; Person profile has none (QS13).** CONVENTIONS gained one additive line in §7 (`table.kv`, `tr.grp`, `tr.sub`, `.cardfoot`).
**Kept from v1 (checked):** numbers unchanged — **FT 23,139 · Kid 11,550 · Poo 15,600** (read back from the slip pages), STA 144, FT pool 1,200 ÷ 6 = 200 · role visibility exactly as v1 (12 pages × 3 roles: 0 open/blocked mismatches) · **Admin: 0 money on People and Person profile; Admin entries shows only its own typed items and a locked "Slip total"** · children น้องเอ/บี/ซี · every button wired.
**Checked (Browser pane, localhost, scripted): 12 pages × 3 roles, desktop AND 375 × 812: 0 console errors, 0 dead buttons (body + header actions + dialogs), the [?] opens on all 36 page-role visits with its steps, no side panel/inline feedback left, no horizontal scroll (page or popup), header 56 px.** ⚠️ file:// from a zip still unproven.
### Page → number of [?] steps (for your CHECKLIST re-check)
| page | steps | header actions |
|---|---|---|
| People | 4 | Add person |
| Person profile | 5 | Save profile · Back to People |
| Pay settings | 5 | Save settings |
| Pay run | 4 | Remind the ones in Draft · Daily check-in report |
| Slip | 4 | Download PDF · Back to Pay run |
| My slip | 4 | Confirm this slip · Tell an admin |
| Admin entries | 5 | — (4 forms with their own Save) |
| Daily check-in report | 4 | Export · Back to Pay run |
| Notification settings | 4 | Open the inbox |
| Inbox | 4 | Mark all as read |
| F3 Teacher: several roles + STAFF | 5 | — (Save/Cancel inside each framed screen) |
| F6 A web login for every coach | 4 | — (Create login · Send invite · Reset password inside) |
**BALL: @Sober.** (TASK-812 pins wait for Tanya's screenshots at 1280 × 800.)

---
## ✅ 2026-10-16 — @Sober: TASK-811 VERIFIED (my own pass)
- **12 pages × 3 roles:** 19 opened, 17 blocked, the same split as v1. Every dialog opened and closed. **0 console errors.**
- **Admin: no money on any Salary page** (Admin entries excepted by design).
- **No Thai prose left in any page body.**
- **Steps per page match your table exactly:** 4 · 5 · 5 · 4 · 4 · 4 · 5 · 4 · 4 · 4 · 5 · 4.
- The additive §7 classes in CONVENTIONS (`table.kv`, `tr.grp`, `tr.sub`, `.cardfoot`) are **accepted**. Next time, a CONVENTIONS line comes to me first, even an additive one.

**🔧 Still open, from TASK-810 (the shell):** **the [?] popup survives a route change.** Re-tested just now:
- Pay run → [?] → Back: the "Pay run" help is still open over People.
- Slip → [?] → go to Inbox: the "Slip" help is still open.
- **Close every open popup and dialog on `hashchange`.**
