# TEST-106 — REQ-122 v2: final check on the exact clean ZIP Khwan will get

**Tester:** Tanya (QA) · **Date:** 2026-10-16 · **Brief:** `inbox/QA.md` → "▶️ GO TEST-106"
**The ZIP:** `project-docs/customer-2026-10-16-backoffice-prototype/SOM-BALANCE-Backoffice-prototype-v2.zip` (2.7 MB)
- unzipped into a fresh temp folder; it holds one folder `SOM-BALANCE-Backoffice/`;
- **77 files incl. 32 help PNGs**; no CHECKLIST, CONVENTIONS or a-example files;
- `index.html` opened as **file://**, headless; report only, **nothing fixed**.

**Verdict: ✅ PASS.** I found no blocker; the notes at the end are cosmetic or content. The only network calls are Google Fonts. **0 console errors, 0 page errors** across every check.

## 1. Every page × 3 roles
Every button/link on the page **and in its header actions**, and every button in each dialog it opens, was clicked and had to show an effect.

| Role | Pages open (32 in menu) | Blocked ("🔒 This role cannot see this page") | Clickables tried | Dead | No effect |
|---|---|---|---|---|---|
| CEO | **31** (all but My slip) | My slip | 159 | 0 | 2 ⚪ |
| Admin | **19**: People · Person · Admin entries · Inbox · 2 Team A front-office · 5 Team B front-office · 8 Stock | Pay settings · Pay run · Slip · Daily · Notification settings · My slip · 6 Revenue · Reports | 88 | 0 | 1 ⚪ |
| Coach | **2**: My slip · Inbox | everything else | 8 | 0 | 0 |

⚪ The "no effect" items are the same two tabs as before ("Today" on Revenue summary, "Sales history" on Stock reports). Each is the tab already selected, so pressing it redraws the same view. They are not dead.

## 2. Every [?] (32 pages, opened as the page's most privileged role)
| Check | Result |
|---|---|
| The image loads | **32/32**. The 3 tall Team A pages are full-page: Pay settings 1280×1583, Slip 1280×1759, Admin entries 1280×968; the rest are 1280×800. No placeholder is left. |
| Steps | 3–6 Thai steps on every page |
| Pins | drawn on every page (2–10 each); no pin number is larger than the step count; all inside the image |
| Pins on the right things | checked by eye on Person profile, Slip and Stock Demo (`help-*.png`), and against each step on all 32. For example, Pay run ④ = Open slip + Remind; SALES RECORD ④ = Save sale; Revenue summary ⑤ = How refunds count. Steps without a pin are general statements, e.g. Stock Demo step 2 "every move keeps a history". |
| Feedback in the popup | ✓/✗ + a note saved on **32/32** pages |
| **The two A/B questions** | **F2 · Payment record** (installments) and **D3 · Confirm camp** (CONFIRMED SCHEDULE timing): both shown in the popup, **red dot before** an answer, **dot gone after**, and the answer is stored. No dot on any other page. |

## 3. Visibility (REQ-120 R0, widened R0.2)
I read every open page **and every dialog** for amounts in ฿.
- **Admin sees:**
  - product prices (Products, SALES RECORD, Import);
  - the front-office payment record (course price / installments);
  - **only its own typed entries** on Admin entries (−200 ฿, 144 ฿).
- **Admin does not see:** base salary, FL rates (Person profile shows none), slip totals or commission. **No revenue page opens.** ✅
- **Coach:** My slip (own base, FL pay with who was taught, own Extra/bonus/trip) and own Inbox (own Bonus 50, Extra Hour 700, Trip 144). Nothing else. ✅

## 4. The ⋯ menu
- **Items:** คัดลอกคำตอบทั้งหมด · พิมพ์ / PDF · ล้างคำตอบ · สลับโหมดสว่าง / มืด, plus the counter "ตอบแล้ว n/32 หน้า".
- **Copy-all (real clipboard):** toast "คัดลอกคำตอบทั้งหมดแล้ว…", **all 32 pages**, all my notes (+ a v1 note, §6) and **both A/B answers** ("คำถามในหน้า: … → B. …"). Saved: `copy-all-clipboard.txt`.
- **Print:** calls `window.print`. A PDF of Slip renders on 3 A4 pages (`print-slip.pdf`).
- **Theme:** light `#F5F7FB` → dark `#1F1F1F`.
- **Reset:** the first press arms it ("กดอีกครั้งเพื่อล้างคำตอบทั้งหมด"); the second press clears all answers and A/B answers.

## 5. The look
| | 1280 light | 1280 dark | 375 light | 375 dark |
|---|---|---|---|---|
| Page-views (3 roles) | 55 | 55 | 55 | 55 |
| Sideways scroll | 0 | 0 | 0 | 0 |
| `undefined` / `NaN` | 0 | 0 | 0 | 0 |

- **English UI:** the only Thai found in labels is the **฿ sign** (it's in the Thai Unicode block) and the CEO's name **"พี่ฟีน"**. Thai is otherwise only in the help, toasts, the A/B questions and the feedback.
- **No real family data:** children only **น้องเอ / น้องบี / น้องซี**; no phone numbers; staff are the customer's own examples.

## 6. Old answers
v2 still uses the storage key `somspec.v1`. I seeded a v1-style answer (Slip ✗ + "V1 OLD NOTE slip", a camp A/B answer). On opening v2 it was shown in the Slip [?] (✗ on, the note filled), counted in the progress, and included in copy-all. ✅

## Notes (cosmetic / content, not blockers)
| # | Sev | Page | What |
|---|---|---|---|
| 1 | ⚪ | Revenue summary, Stock reports | Pressing the already-selected tab gives no feedback (as in TEST-104). |
| 2 | ⚪ | Phone 375, Pay run (and other wide tables) | The table scrolls inside its card. The **Total column is off to the right**, so "Pay run total" shows a cut-off figure until you swipe the table, and nothing hints that it scrolls (`phone375-dark-home-and-slip.png`). |
| 3 | ⚪ | Person profile [?] | Pins ② and ④ overlap on the same rows. Pin markers ① and ⑤ sit over the start of the text they point at ("Nelson" tab, "Save profile"). Still readable (`help-salary-person.png`). |
| 4 | ⚪ | Slip (content, carried from TEST-104) | Nelson is shown as "FT · Car"; the sheet says "Nelson = staff + FL weekdays". For the SA. |

Evidence: `project-docs/qa-2026-10-16/test106/`:
- `help-salary-person.png` · `help-salary-slip.png` · `help-stock-demo.png`;
- `desktop1280-*` · `phone375-*`;
- `copy-all-clipboard.txt` · `print-slip.pdf`.

Scripts (scratchpad): `t106a.js` (crawl + every [?]), `t106b.js` (help pictures), `t106c.js` (visibility, ⋯, look, v1 answers).
