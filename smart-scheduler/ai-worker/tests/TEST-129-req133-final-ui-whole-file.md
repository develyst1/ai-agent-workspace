# TEST-129: REQ-133 final UI, the WHOLE file (Team A's 17 pages + a re-check of Team B's 14). Built file, offline, headless

- **QA:** Tanya
- **Date:** 2026-10-27, ~22:50–23:30 Bangkok
- **Brief:** Porter's "GO: REQ-133 final UI, the WHOLE file" in `inbox/QA.md`
- **File:** `som-balance-backoffice-spec/final-ui/dist/index.html`, 1,243,190 B, md5 **`a33a3b433f581dc3b53ba451de0a8670`** (built 22:45; checked before the run).
- **How:** headless Chrome, `file://`.
  - Every page × every role, by the menu and by direct route.
  - Every control clicked from a fresh load (Playwright clicks are real, trusted mouse events). The two the brief named were also clicked by raw mouse coordinates.
  - Screenshots in my scratchpad (not in the repo).

## First check: **all 14 of Team B's pages are in this file** ✅ (all 14 in the CEO's menu, each opens). So the whole file was gated.

## Verdict: ✅ PASS (all 31 pages) · 🟡 one question on what the Admin sees (Other Income amounts)

| Gate | Result | |
|---|---|---|
| Opens offline | `file://`; **0 network requests** | ✅ |
| Console | **0 errors, 0 warnings, 0 page errors**: at load, on every page × role, and during all ~297 clicks | ✅ |
| Menu per role | **CEO 29** menu items = exactly the 29 expected (31 pages minus the hidden Employee Profile and the coach's own Payment Detail); **Admin 17** = exactly expected; **Coach 2** = exactly expected; 0 missing, 0 extra | ✅ |
| Direct routes per role | every one of the 31 routes × 3 roles is **open where the role may see it**, else the shell's *"This role cannot see this page"* (0 mismatches) | ✅ |
| Hidden, never locked | 0 🔒 / "CEO only" / "HIDDEN FOR" on any page for any role. (My scan's one hit was the status word **AUTO-LOCKED** on Monthly Payment, Khwan's own word, not a lock) | ✅ |
| **Every control does something** | **Team A:** CEO 75 controls, Admin 53, Coach 7: **0 dead**. **Team B re-check:** CEO 122: **0 dead** (the only "no change" is Product's **All** tab, which is already active) | ✅ |
| **Park Rent steppers (raw mouse)** | up: 800 ฿ → 801 ฿ ✅; down: 801 ฿ → 800 ฿ ✅ | ✅ |
| **User Setting password eye (raw mouse)** | in the "Reset password" dialog: type `password` → **`text`** → `password` | ✅ |
| Thai | Noto Sans Thai bundled; the Thai toasts and notes render; no boxes | ✅ |
| **No item codes** | 0 "F1 · / D3 · / C-x" in **any title or the sidebar** (the TEST-128 note is fixed): "Branch for booking", "Payment Method", "Conversion", "Park Rent", "To Confirm Camp" | ✅ |
| **Conversion** | listed under **SETTING**; **no "หน้าบ้าน" label** on it (CEO or Admin) | ✅ |
| Names | staff only from the invented map (Pete / May / Ton / Ploy / Nam / Beam); children only invented (น้องมะลิ / ภูมิ / ข้าวหอม / ใบบัว / ตะวัน). **0 real staff / coach / admin names** on 31 pages × roles (the one scan hit, "Mark", is the button "Mark as read") | ✅ |
| Dates | every printed date dd/mm/yy; 0 ISO or 4-digit-year dates | ✅ |
| 375 px | **0 of 31** pages scroll sideways (the coach's own slip checked as the Coach) | ✅ |

### Roles, by value
- **Coach:** the menu has **Payment Detail** (their own, "Ton") and **Notification Alert** (their own items).
  - Every other route ⇒ "cannot see".
  - ⚪ Notification Alert is a 2nd page beside the slip; it's in the page's roles (`ceo admin coach`) and shows only the coach's own items, so I read it as intended.
- **Admin:** SALARY shows **Employee** (Name · Type · Vehicle · Merit; **no salary column**) and **Other Income** only.
  - No Payment Setting, Monthly Payment, Payment Detail or Daily Training Report; no REVENUE, no All Report.
  - The front-office pages are all there.
- **CEO:** everything.

### 🟡 One question for the SA (not counted as a fail): the Admin sees **amounts on Other Income**
- **The Admin's Other Income "Detail" list** shows e.g. *"Pete Other ± · ทำอุปกรณ์เสีย -200 ฿"* and *"Ton Transportation · STA round trip 144 ฿"*.
- **The Admin's Notification Alert** shows *"Bonus For 50 : <two children> = 2 · Pete"* (a count, no ฿).
- **CONVENTIONS R0** lists *"other income"* among the pay an Admin never sees. But on this page the Admin **enters** OT / Merit / Transportation / Other ± (amount inputs), so seeing their own entries may be the intent.
- The slip total is gone, as Khwan asked. **Sober to confirm** which it is: amounts shown, or entry-only.

### Khwan's v3 notes (the page → note tables in TASK-844 / 845), spot-checked on screen
- **Monthly Payment:**
  - "**Reminder**" (not "Remind the ones in Draft");
  - **Pending** (not DRAFT); **AUTO-LOCKED** (no 12:00);
  - Type in full words; a last row **TOTAL**: 105,199 ฿ = the sum of the 6 rows ✅;
  - the month picker; **Export Excel / Export PDF** ✅.
- **Payment Detail:**
  - **Export Excel (summary)** / **Export PDF (with detail)**;
  - *"For 50 : น้องมะลิ (Private) + น้องภูมิ (Voucher) = 2"*, *"For 100 : … = 3"*;
  - *"14/10/26 (Wed) : 6 Hr → ชม.ที่ 5–6 = 2 Hr × 350 ฿"*;
  - OT *"20,800 ÷ 26 ÷ 8 × 1.15 = 115 ฿ per Hr"* (3 Hr = 345 ✅) ✅.
- **Payment Setting:** *"Weekday > 4th HR / Weekend > 5th HR"*, *"Hour Enter manually"*, "Apply to" on each, *"New Course/ Voucher Package after 1st Trial"*, *"Renewal Course"*, *"Special Case … (When changing coach)"* ✅.
- **Employee:** Type in full words (Full-time / Part-time · Sat–Sun / Freelance · Mon–Fri / STAFF) ✅.
- **Other Income:** *"Ton already confirmed slip of 30/09/26–30/10/26"*; **Detail**; **Description** ✅.
- **Daily Training Report:** full Type words, **Description**; the total row 12 Hr / 1,350 ฿ = the sum ✅.
- **Notification Setting:** a plain recipient list (who · role · gets); no opt-out switches ✅.
- **User Setting:** *"NOT LOGIN YET"*, *"Visible"*, *"Authorization"* ✅.
- **Branch for booking** · **Payment Method** (no Confirm button, Transfer by default, Edit; installments) · **Conversion** (month picker, Bonus 50 / 100 tables) · **Park Rent** · **To Confirm Camp**: the renames as noted ✅.
- **Coach's Payment Detail:** her page 6 was unanswered in v3. Fern's reading (Confirm this slip / Tell an admin / Export PDF) is on screen.

### Team B re-check
- All 14 behave as in TEST-128: roles, 0 dead controls, 0 console.
- STOCK OUT was **not** re-driven step by step this time (cart / discount / commission). Only its controls were clicked (0 dead, 0 console). The step-by-step proof is TEST-128's, on the earlier build.

### Screenshot for Porter
- **Monthly Payment, CEO view:** `req133-final-ui.png` in his scratchpad.


---
## Re-check: the Other Income fix (md5 `ef3063bcb404066acd6e9f2305fb3a72`, built 23:06): ✅ PASS
- **Sober's ruling** (REQ-120 R0.2 / R0.3): an Admin sees only an amount she typed herself; calculated amounts are hidden. The md5 was checked before the run.

| Other Income › Detail | CEO | Admin | |
|---|---|---|---|
| 20/10/26 Pete · OT · 3 Hr | — | *(empty)* | ✅ |
| 20/10/26 Pete · Other ± · ทำอุปกรณ์เสีย | −200 ฿ | **−200 ฿** (typed by hand ⇒ shown) | ✅ |
| 14/10/26 Ton · Transportation · STA round trip | **144 ฿** | *(empty)* (calculated ⇒ hidden) | ✅ |

- **No lock and no "CEO only"** for either role; the Admin's cell is simply empty.
- **0 console errors / warnings, 0 network.**
- **The 🟡 above is closed.** TEST-129 stands as ✅ PASS for the whole file on this build.
- Not re-run: the full click sweep (the brief: nothing else changed).
