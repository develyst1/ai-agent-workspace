# TEST-104 — REQ-122: full click-through of the customer prototype `som-balance-backoffice-spec`

**Tester:** Tanya (QA) · **Date:** 2026-10-16 · **Brief:** `inbox/QA.md` → "▶️ GO: REQ-122 full click-through (TEST-104)" · read: REQ-122 §1 §2 §4, `CHECKLIST.md`, `CHECKLIST-b.md`
**How:** the folder was **zipped** (`Compress-Archive`, 81 KB, 50 files), **unzipped into a fresh temp folder**, and `index.html` opened as **file://** in headless Chrome, the way Khwan will. Report only; **nothing was fixed or edited** in the folder.

**Verdict: ✅ PASS, with 1 🟠 and a few 🟡 notes.**
- 33 pages (32 in the menu + 1 hidden example page).
- **0 console errors, 0 page errors, 0 dead buttons** in all 3 roles.
- Every button has a visible effect.
- Every page has the Thai "หน้านี้ทำอะไร" panel (2–4 Thai lines).
- Copy-all works with the real clipboard, and print/PDF renders.
- Only network calls: **Google Fonts** (allowed).

## 1. Every page × every role
I clicked **every** button/link on every open page, and **every button inside each dialog** it opens. Each one had to navigate, open a dialog, show a toast, change the page, or switch the role.

| Role | Menu links | Pages open | Pages blocked ("🔒 This role cannot see this page") | Clickables tried | No effect | Console errors | Dead (shell check) |
|---|---|---|---|---|---|---|---|
| **CEO** | 32 | **32** (all) + the hidden example | My slip only (Coach's) | 166 | 2 ⚪ | 0 | 0 |
| **Admin** | 20 | **20**: People · Person · Admin entries · Inbox · 2 front-office (Team A) · 5 front-office (Team B) · 8 Stock · (hidden example) | Pay settings · Pay run · Slip · Daily · Notification settings · My slip · **all 6 Revenue** · Reports | 94 | 1 ⚪ | 0 | 0 |
| **Coach** | 3 | **2**: **My slip** + **Inbox** | everything else | 9 | 0 | 0 | 0 |

- ⚪ **"No effect", all explained:**
  - "Today" (Revenue summary) and "Sales history" (Stock reports) are the **tab already selected** when the page opens; a click redraws the same view. The neighbouring tabs (MTD/YTD, Balance/Movement) work.
  - So these are **not dead**. Optional polish: no visible feedback when the current tab is pressed.
- The **"Coach web login" page's button switches the whole prototype to the Coach role** and opens My slip. That is intended (it shows F6). Noted because a tester or Khwan may be surprised that the role changed.

## 2. Visibility (REQ-120 R0, incl. the widened R0.2)
| Rule | Evidence | |
|---|---|---|
| **Admin sees no base salary** | People list: column shows 🔒; Person profile: "Base salary 🔒 CEO only" | ✅ |
| **Admin sees no FL rates** | Person profile: no rates shown to Admin | ✅ |
| **Admin sees no slip totals** | Pay run / Slip / Daily are blocked. Admin entries shows only the items Admin typed (−200 ฿ Other, 144 ฿ trip) with "you only see your own entries — never a total". | ✅ |
| **Admin sees no commission amounts** | SALES RECORD: Kid / Poo commission = "🔒 CEO only" (the product's commission *group* name is visible, which is a product setting, not pay) | ✅ |
| **Admin sees no revenue** | all 6 Revenue pages + Reports are blocked. The Bonus notice in Admin's inbox says "(no amount shown to Admin)". | ✅ |
| 🟠 **Except the hidden example page** | **`#/example/everything`** (not in the menu, reachable by URL only) shows Admin a pay table with **"Extra 2,100 ฿" (Kid) and "700 ฿" (Bank)**, i.e. coaches' Extra Hour pay. It also carries a sample A/B question ("ควรให้ Admin เห็นยอดรวมของสลิปหรือไม่?"); if someone answers it, it goes into the copy-all text. **Suggest: remove or lock this page before it goes to Khwan.** | 🟠 |
| **Coach sees only My slip + own inbox** | menu = Home · My slip · Inbox. The inbox says "your own items only" (own Bonus 50, Extra Hour 700, Trip 144). | ✅ |

## 3. Feedback, copy-all, print
- **✓/✗ + notes:** ticked or noted 6 pages (✓ Pay run, ✗ Slip, ✓ Revenue summary, ✗ SALES RECORD, ✓ Confirm camp, a note only on Payment record).
  - The menu shows ✓/✗ marks.
  - The counter reads **"ตอบแล้ว 6/32 หน้า"**.
- **The 2 in-page A/B questions are present and captured:**
  - **Confirm camp:** "CONFIRMED SCHEDULE … ควรส่งตอนไหน?" A/B with the consequences;
  - **Payment record:** "ถ้าแบ่งจ่ายเป็นงวด รายได้ควรนับอย่างไร?" A/B.
- **Copy-all (real clipboard, not the fallback):**
  - toast "คัดลอกคำตอบทั้งหมดแล้ว ส่งกลับมาได้เลยค่ะ"; 1,893 characters on the clipboard;
  - **all 32 menu pages listed** (unanswered pages as "ยังไม่ตอบ");
  - all 5 notes present;
  - both A/B answers under their pages ("คำถามในหน้า: … → B. …").
  - Saved: `copy-all-clipboard.txt`.
- **Reload keeps the answers** (localStorage): the Slip note and its ✗ are still there.
- **Print / PDF:**
  - the button calls the browser's print;
  - print media hides the menu and the top bar and keeps the page, the Thai panel and the feedback box;
  - a PDF of the Slip rendered on **3 A4 pages** (`print-slip.pdf`, `print-media-slip.png`).
  - ⚪ It prints **the current page only**. Copy-all is the way to send every answer at once.
- **Reset:** the first click arms it ("กดอีกครั้งเพื่อล้างคำตอบทั้งหมด"); the second click clears everything (toast "ล้างคำตอบทั้งหมดแล้ว").

## 4. The look
- **Phone width (375 px):**
  - every open page in every role (57 page-views): **0 page-level sideways scrolling**;
  - wide tables scroll inside their own box (19 page-views);
  - text readable in both themes (`phone-light-*`, `phone-dark-*`).
  - 🟡 On a phone, the header block (Menu, title, 3 role buttons, counter, copy-all, print, reset, theme) **fills about half of the first screen** before the page starts. It's usable, but Khwan scrolls on every page.
- **Light + dark:**
  - light: background `#F6F7F9` with dark text;
  - dark: background `#14171C` with light text.
  - The theme button works and is remembered.
- **Language:** **0** headings, buttons, table headers or labels contain Thai (desktop scan, all pages, all roles), so the UI labels are English. Explanations are Thai: the side panel, toasts, the intro boxes and the A/B questions.
- **No real family data:**
  - children only **น้องเอ / น้องบี**, plus **น้องซี** (a third placeholder, used on My slip and in the Coach inbox);
  - no phone numbers;
  - staff names are the customer's own examples (Kid, Poo, Bank, Nelson, Kung, London);
  - schools STA/ABC/RIS/WA/KIS.

## Findings for the teams (via Porter; I fixed nothing)
| # | Sev | Page | What |
|---|---|---|---|
| 1 | 🟠 | `#/example/everything` (hidden, URL only) | Admin sees coaches' **Extra Hour pay** (2,100 ฿ / 700 ฿), which breaks R0.2. It also has a sample A/B question that would land in copy-all if answered. Remove or lock it before the customer gets the ZIP. |
| 2 | 🟡 | every page, phone | The header block takes about half the first screen at 375 px. |
| 3 | ⚪ | Revenue summary, Stock reports | Pressing the already-selected tab (Today / Sales history) gives no feedback. Not dead. |
| 4 | ⚪ | Coach web login | Its button switches the whole prototype to Coach. Intended; maybe say so in the Thai panel. |
| 5 | ⚪ | My slip, Coach inbox | Uses a third child "น้องซี". Fine as a placeholder; the brief named only เอ/บี. |
| 6 | ⚪ | Slip (CEO) | The example person **Nelson is shown as "FT · Car"**. The customer's SALARY sheet note says *"Nelson = staff (no merit) + FL วันธรรมดา"* (UNDERSTANDING S-4). This is a content question for the SA, not a click fault. |

Evidence: `project-docs/qa-2026-10-16/test104/`:
- phone light/dark × 4 pages;
- desktop light/dark × 3 pages;
- `print-media-slip.png` and `print-slip.pdf`;
- `copy-all-clipboard.txt`.

Scripts (scratchpad): `t104a.js` (crawl), `t104b.js` (feedback/copy/print), `t104c.js` (look).

---
# §re-check — the 2 points Sober fixed · 2026-10-16
A **fresh ZIP** (82 KB, 50 files) was unzipped into a new temp folder and opened as file://. **Verdict: ✅ PASS, both points.** 0 console errors.

| Point | Result | |
|---|---|---|
| **1. `#/example/everything` lands on Home, no pay** | The page is no longer registered (32 pages). Typing the hash in **each role** (CEO / Admin / Coach) ⇒ hash `#/`, "Welcome", toast "ไม่พบหน้านี้ พากลับหน้าแรกให้แล้วค่ะ", **no ฿ amount and no "Extra" pay on Home**. Opening the file with `#/example/everything` already in the address does the same. The sample A/B question no longer appears in the copy-all text (`recheck-example-url-lands-home-admin.png`). | ✅ |
| **2. Phone header at 375×812** | `header.top` **94 px**. The 3 role buttons are visible; copy-all / print / reset / theme are hidden behind **⋯** (`recheck-phone-header-closed.png`). No sideways scrolling. | ✅ |
| …every ⋯ action works | **⋯** opens all 4 actions (`aria-expanded=true`) (`recheck-phone-more-open.png`):<br>• **Copy-all** ⇒ toast, and the real clipboard holds my note; the menu closes after the tap.<br>• **Print** ⇒ `window.print` called.<br>• **Theme** ⇒ light `#F6F7F9` → dark `#14171C` (`recheck-phone-dark.png`).<br>• **Reset** ⇒ the first tap arms it (the menu stays open for the second tap); the second tap clears it, with a toast.<br>Tapping outside closes ⋯. Tapping a role button switches the role (Admin ⇒ the Slip shows 🔒). ☰ Menu still opens the nav. | ✅ |

**Regression crawl on the same copy:**
- 0 console errors, 0 page errors, 0 dead buttons.
- Every page shows its Thai panel.
- CEO 31 pages + Home; Admin 19 (one fewer: the example page is gone); Coach 2.
- The only "no effect" items are the same two already-selected tabs (⚪, as before).

⚪ **For the owner:** the template files `pages/a-example/everything.js` and `data/a-example.js` are **still inside the ZIP**. They aren't loaded, but the data file holds example pay figures (18,000 / 2,100 …) that someone could see by opening the `.js` in a text editor. Remove them from the ZIP if that matters.

---
# §clean-zip — the customer ZIP `project-docs/customer-2026-10-16-backoffice-prototype/SOM-BALANCE-Backoffice-prototype.zip` · 2026-10-16
**✅ PASS.**
- **Contents:** unzips into one folder `SOM-BALANCE-Backoffice/` with **45 files**; no CHECKLIST*, CONVENTIONS or a-example files inside. `index.html` (file://) opens Home.
- **Crawl, 3 roles:** **0 console errors, 0 page errors, 0 dead buttons**.
  - CEO 32 menu links, Admin 20, Coach 3.
  - Every page has its Thai panel.
  - Only the same two already-selected tabs show "no effect" (⚪, as before).
  - The only network calls are Google Fonts.
- **Copy-all:** real clipboard, all 32 pages, all 5 notes and both A/B answers. Answers survive a reload. Evidence: `test104/clean-zip/`.
