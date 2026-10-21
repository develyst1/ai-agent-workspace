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
