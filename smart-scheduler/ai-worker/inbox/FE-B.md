# Inbox — FE-B (Team B, Fanta)

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

- ⏳ Start when TASK-703's Implementation Notes declare the badge shape (MakeupChip or a StatusChip prop).
- 🔴 The mark reads isMakeup, never the status. The by-value test that matters: CONFIRMED + isMakeup ⇒ the mark shows.
- It ships only together with 702+703.

From Silver 2026-10-07: ✅ TASK-722 DONE (re-ran 1118/0 and 10/10). The EXTENDED-with-marker-false test is exactly the proof the swap needed. Your one unseen item goes to QA as a look-check. Nothing waiting on you.

- ⏳ Start on TASK-725's declared contract.
- Words are DRAFT until COPY-DRAFT-admin-line-link-teamB-2026-10-11.md is approved.


From Silver 2026-10-21: ▶️ TASK-745 (REQ-122 v3, Team B: Revenue · Stock · Reports; M ≈ 4.4 d) is GO. Read REQ-122 §8 + §7.1–§7.4 and the TASK.
- The ask slot is a LIST: STOCK OUT keeps its 2 questions.
- Delivery is ONE .html: load only through SPEC.load, images only as help/<name>.png, no external load.
- Don't touch pages/b-fo/* (they move to Team A). I'll tell you the day to drop their lines from pages-b.js.
- Start the content now; align to CONVENTIONS v3 when it lands.
- TASK-746 (pins) waits for Tanya's new captures.

From Silver 2026-10-21: TASK-745 — CONVENTIONS v3 is published (spec CONVENTIONS.md §00). Align to it now:
- every date through SPEC.date (16/10/26);
- images only via SPEC.assetSrc("help/x.png"); nothing that needs a file next to it;
- asks as help.ask: [{q, a, b}, …]; add answer: "A"/"B" if she answered in LINE.
1. 🔴 FIX: #/revenue/categories throws (undefined.map) after a data/b-revenue.js change. Sober's 831 verify caught it.
2. Not a defect: the admin seeing PRODUCT prices (Products / Import / STOCK OUT) is fine. "No money" means our fee. Keep the admin rules: no coach pay beyond the sale's own commission line, no revenue. Check that STOCK OUT's admin toast shows no revenue.
3. The b-fo pages are still Team A's at 834; nothing for you there.

From Silver 2026-10-21: ✅ TASK-745 is DONE. Your 5 decisions and the 4 questions are accepted as written. The inbox drain tool lives in smart-scheduler/ai-worker/; the exact command is in the TASK's Review. If your session refuses it, leave the lines (Porter says a note in your log is enough). TASK-746 (pins) starts when Tanya's captures land.

From Silver 2026-10-21: re the B_ASKS shape. KEEP the legacy {id, q, options:[{k,label,effect}]}. The shell accepts it, and it carries the consequence for each choice, which {q, a, b} can't hold. Convert an item only if she answers it in LINE, because then it needs the `answer:` field. TASK-745 is already closed as DONE; nothing else is needed.

From Silver 2026-10-21: TEST-115 part B: 13 of 14 pages pass. Two things, details at the bottom of 745 and 746:
- 🔁 TASK-745, STOCK OUT:
  1. add a ฿ / % choice to the bill discount;
  2. move the commission picker INSIDE the sale form, visible without scrolling at 1280x800.
  Then re-run and report.
- ▶️ TASK-746: pin the 13 passing pages now. STOCK OUT's pins come after its re-capture. help.img points at the NEW names (stock-stock-out).

From Silver 2026-10-21: ▶️ FIRST, before anything else, the b-fo hand-over. Sober's 834 is ready.
- In pages-b.js, remove ONLY the 6 b-fo registrations, checked by content: SPEC.load("data/b-fo.js") and the five SPEC.load("pages/b-fo/...") lines, plus their comment line if it is left alone. Nothing else in the file; don't delete the b-fo files themselves (they are Team A's now).
- Re-run headless (our pages still 0 / 0, and no b-fo route left in our list).
- Then tell me at once, so Fern can register Team A's copies right after.

From Silver 2026-10-21: TASK-746 review. I overlaid all 13 pages on their PNGs: 12 are correct. ONE fix:
- #/revenue/eca-term: pin 1 and pin 2 share the same top-left corner (23.2, 22.6), so ① is hidden under ②. Move pin 2's box to start lower (the Price / Student / Class row) so the two corners differ.
- Still FIRST: the b-fo hand-over in pages-b.js (see the earlier entry). Then report both together.

From Silver 2026-10-21: ✅ The ECA pin is fixed (I overlaid it: ① is visible now; the trade-off is accepted). ▶️ ONE more change, Porter's ruling: the date fields become B.
- Her words: "Date = เอาปีด้วยค่ะ 16/10/26 ขอเป็นเลือกวันที่ในช่องนะคะ ถ้าเป็นการพิมพ์ format จะต่างกันค่ะ".
- Replace EVERY native date input in Team B pages: Add Manually, Refund, ECA Payment, Stock In, Stock reports (From + To).
  - Use a field that always SHOWS the date via SPEC.date (16/10/26), read-only, with a calendar icon button.
  - The icon opens ONE shared b- dialog with a static month grid (a mock). Clicking a day closes it with a toast.
  - No typing, no native type="date" left (grep it).
- Update a help step if it mentions typing a date.
- Re-run headless (3 roles, 0 / 0) and report. Then Tanya re-captures everything in one pass, and the pins of the changed pages get re-checked.

From Silver 2026-10-21: ⛔ STOP on the date picker: don't build your own. Fern is adding a shared SPEC.dateField to the shell. Once it is in CONVENTIONS.md (I'll tell you), switch our 5 date inputs to it: Add Manually, Refund, ECA Payment, Stock In, Stock reports. If you already started a b- picker, drop it (don't register it).

From Silver 2026-10-21: re the date change. My STOP crossed your finish, so keep data/b-dates.js as it is for now; it works. When Porter says SPEC.dateField is in CONVENTIONS.md, switch the 5 pages to it and drop b-dates.js (unregister it). Don't polish it further.

From Silver 2026-10-21: ▶️ SPEC.dateField is PUBLISHED (CONVENTIONS.md §00 item 9). Switch now:
- Put `SPEC.dateField(value, { label })` on all 5 date fields: Add Manually, Refund, ECA Payment, Stock In, Stock reports From + To. value = ISO "2026-10-16".
- Drop data/b-dates.js: remove its SPEC.load line and its dialog. No own picker, no type="date", no bare dd/mm input left (grep).
- The shell wires it, so you attach nothing.
- Re-run headless (3 roles, 0 / 0) and report. (The ECA pin fix is already done and verified.)

From Silver 2026-10-21: ✅ Tanya's re-capture pass of Team B passes: dd/mm/yy everywhere, no toast on revenue-summary, STOCK OUT F1 + N1 fixed, and SPEC.dateField accepted. Last two items, then Team B is final:
1. 🟡 N4: on STOCK OUT the narrower Items table cuts each line's "Remove" to "Re" at 1280 wide. Let the cell keep the full word: white-space:nowrap on the button, or an icon-only remove with a title. Check it at 1280×800.
2. TASK-746: pin the NEW STOCK OUT capture (help/stock-stock-out.png), and re-check the pins of the 6 re-captured pages (the 5 date pages + revenue-summary) on their new PNGs. If N4 changes STOCK OUT's layout, tell me; Tanya may need one more STOCK OUT capture.
Report both; I overlay every pin before closing.

## 2026-10-27 — ▶️ GO TASK-751 / 752 / 753 (REQ-133): the back-office FINAL UI's Revenue, Stock and Reports pages, in Vite + React + Mantine. (@Silver)
- **Read the three TASK files** (`tasks/TASK-751…753-*`) and REQ-133.
- **Folder:** `som-balance-backoffice-spec/final-ui/`, inside Sober's shell (TASK-843). **Wait for the shell contract** (promised Wed 10-28; I pass it to you when it lands). Until then, read the v3 sources and the verbatim notes.
- **Order:**
  1. 753's DATA;
  2. the 3 deck pages (Revenue Summary, Detail, STOCK OUT) **by Mon 11-02**;
  3. the rest **by Fri 11-06**.
- 🔴 **STOCK OUT** is a cart with a PER-ITEM discount, and the commission is edited per item (lower or raise). The commission picker sits inside the form.
- **The rules:** no network calls; Thai mock names; dates dd/mm/yy with no times; hidden rows hidden, never marked; no dead buttons.
- 🚫 **Don't touch** the shell / router / theme / role context (Team A). No git.
- **Report each step to me with:** tsc, the build, and the console on each page.
- BALL: @Fanta — read now; build on the shell contract.

## 2026-10-27 — Where the shell contract will be: `som-balance-backoffice-spec/final-ui/CONVENTIONS.md`, from Sober when the shell lands (Wed 10-28). (@Silver)
- Read it as soon as it appears; I'll also tell you when Porter relays it. Until then, read the v3 sources only. Nothing to build.
- BALL: @Fanta — wait for the contract.

## 2026-10-27 — Re your per-item discount heads-up: use THIS example, the smallest change to the v3 numbers. (@Silver)
- **Today's cart (one bill):**
  - **Miller inline skate (Seaworld)**: 3,900 with **−10 % on that item** ⇒ 3,510. SALES stays 3,510.
  - **Snack × 3**: 150, **no discount** ⇒ 150. F&B goes 135 → 150 (+15).
  - So **Today's total rises by exactly 15** (82,685 → 82,700). Carry the +15 into MTD and YTD too, so everything still adds up.
- **One ฿ example elsewhere, for her own case:** add one line on another day, a **defect board with a −฿ discount, and its commission LOWERED by hand** (her words: «ขายสินค้าที่มีดีเฟค… เลยลดคอมด้วย»). The amounts are your pick; keep it out of Today so Today stays simple.
- **Commission:** on the Miller line it is unchanged by the 10 % (show the full commission next to the discounted price).
- Declare the numbers in Implementation Notes. Still nothing to build until the shell contract lands.
- BALL: @Fanta — wait for the contract; then 753 data first.

## 2026-10-27 — ▶️ THE SHELL EXISTS (TASK-843): build 751 / 752 / 753 now, to `final-ui/CONVENTIONS.md`. Two Team B rules OVER the contract's example. (@Silver)
- **Read `final-ui/CONVENTIONS.md` whole.**
  - You own ONLY `src/pages/b/index.ts`, `src/pages/b/**`, `src/mock/b-*`, `src/assets/b-*`.
  - Import only from `@/shell` + Mantine + lucide + dayjs + your own files. No new package.
  - `npm run dev` to build; `npm run build` → one `dist/index.html`.
- **Order (unchanged):**
  1. the 753 data (`src/mock/b-revenue.ts`, `b-stock.ts`);
  2. Revenue Summary + Detail + STOCK OUT **by Mon 11-02**;
  3. the rest **by Fri 11-06**.
- **Menu orders:** Team B uses 500–899 (REVENUE 500s, STOCK 600s, REPORTS 700s). Keep the v3 routes (`/revenue/summary`, `/stock/out` …, as v3 had them).
- 🔴 **Rule 1, the REVENUE pages are `roles: ["ceo"]` ONLY.** The contract's §4 example shows `["ceo", "admin"]`; that is only an example and it is wrong for us. REQ-120 R0.1 / §2: revenue is seen by the CEO only. The shell's "cannot see" screen then covers the Admin.
- 🔴 **Rule 2, HIDE, don't lock**, on my pages. Khwan's v3 note: don't show "🔒 HIDDEN FOR ADMIN" at all; show only what the role can see. So **no `<Locked>`** in Team B pages: leave the column / field out for that role.
  - Example: STOCK OUT for an Admin shows the commission entry for this sale, and never a total.
- **Roles for the Stock pages:** `["ceo", "admin"]`. Reports: `["ceo"]`. The Coach sees none of mine.
- **Each page must meet the contract's §6:** no dead control, filters really filter, 375 px without sideways scroll, 0 console errors and 0 warnings, `fmtDate` / `fmtBaht` / `<DateField>` everywhere, Thai toasts via `notify`, exports via `fakeDownload`.
- **Report to me after the 3 deck pages, then at the end:** tsc, `npm run build` (size), the console per page, and the role check.
- BALL: @Fanta — build.

## 2026-10-27 — 🔴 NO real staff names in the mock (CONVENTIONS §2.8 changed; TEST-127). Swap them in Team B's files now. (@Silver)
- **The map (the same as Team A + the deck):** Kid → **Ton** · Poo → **Ploy** · Kung → **Nam** · Bank → **May** · London → **Beam** · Nelson → **Pete** · พี่ฟีน → **CEO**.
- **What my scan found (real names still in):**
  - `src/mock/b-stock.ts`: lines 33, 41, 44, 47, 91–96, 113, 114 (Kid / Poo / Kung / Bank / London / พี่ฟีน, e.g. the commission sellers and the Low Stock recipients);
  - `src/pages/b/stock/Demo.tsx:32` (Poo).
- **Also fix** the comment at `b-stock.ts:3` ("staff names are the ones Khwan used") → "staff names are invented (CONVENTIONS §2.8)".
- **Children's nicknames are already invented** (น้องมะลิ / ข้าวหอม / ภูมิ / ใบบัว / ปลื้ม). Keep them.
- **No item codes in the menu either** (F1, D3 …).
- **Then re-scan** `src/mock/b-*` + `src/pages/b/` for any real staff / customer name, and report the scan output with your next report.
- BALL: @Fanta — the swap, then carry on.

## 2026-10-27 — Review of 751 / 752 / 753: CHANGES REQUESTED (3; small). The rest is accepted. (@Silver)
**My checks:**
- tsc 0;
- `npm run build` OK, `dist/index.html` 1.24 MB;
- the roles in `pages/b/index.ts` are right (Revenue + All Report `["ceo"]`, Stock `["ceo", "admin"]`);
- no `<Locked>`, no network, no item codes;
- STOCK OUT does the per-item discount (฿ / %) and the commission per item, editable;
- your numbers add up as declared.

**Change these 3:**
1. 🔴 **Real staff names are still in** (my scan: 25 hits, 0 of the new names). Your report also says "Kid 50 + Poo 50", so the swap (my earlier entry, CONVENTIONS §2.8 changed) hasn't landed.
   - **The map:** Kid → Ton · Poo → Ploy · Kung → Nam · Bank → May · London → Beam · Nelson → Pete · พี่ฟีน → CEO, everywhere in `src/mock/b-*` + `src/pages/b/`, plus the `b-stock.ts:3` comment.
   - **Done when** `grep -E "\b(Kid|Poo|Kung|Bank|London|Nelson)\b|ฟีน"` over those paths prints 0 lines. Paste that output.
2. **Your call on Product: the Admin DOES see the COMMISSION column.**
   - It is the product's commission rate, not a coach's pay. STOCK OUT already shows the Admin each item's group + amount (`StockOut.tsx:191`), and the Admin edits the commission there (C-a). Hiding it on Product only would be inconsistent.
   - An Admin still never sees a coach's TOTAL anywhere.
   - Note this decision in 752's Implementation Notes.
3. **The menu title "Stock In" → "STOCK IN".** Her v3 note on page 25: *"Stock In = STOCK IN"*. Use it as the page title as well.

**After that:**
- re-run tsc + the build;
- open the BUILT `dist/index.html` once if your pane allows it (mine couldn't open `file://`). If not, say so, and Tanya's gate covers it.
- **Report back with:** the grep output, tsc, the build size, and the console.
- BALL: @Fanta — the 3 fixes.

## 2026-10-27 — ✅ 751 / 752 / 753 accepted, DONE → ready for QA. (@Silver)
- **My re-check:** the 3 fixes are in; tsc 0; the build OK; the name scan 0.
- **Next:** Tanya's gate may send fixes back through me.
- BALL: @Fanta — nothing now; stand by for Tanya's findings.

## @Silver → @Fanta — 2026-10-27 — DARK MODE fix (TASK-751 follow-up, from TASK-847): Revenue › Detail expense rows
- The final UI now opens in dark. One Team B line breaks it:
  - `src/pages/b/revenue/Detail.tsx:129`, `bg={l.expense ? "var(--mantine-color-red-0)" : undefined}`.
  - In dark this is a pale band under light text, and the row can't be read.
- **Fix:** use a scheme-aware colour: `bg={l.expense ? "light-dark(var(--mantine-color-red-0), rgba(250,82,82,0.12))" : undefined}`, or Mantine's `var(--mantine-color-red-light)`. Either is fine.
- **I already scanned** `src/pages/b/**` for other hard-coded light colours (`bg=`, `color-*-0..2`, `#fff…`, inline style colours). This was the only hit. Don't touch anything outside `src/pages/b/**`.
- **Done when:**
  - `tsc` 0 and `npm run build` OK;
  - the Detail page checked in BOTH dark and light: the expense rows are readable, and the console is empty;
  - your reply here carries the new `dist/index.html` md5.
- No git.
